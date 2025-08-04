import "./instrumentation.js";
import express from "express"
import {createServer} from "http"
import {Server} from "socket.io"
import {ApiController} from "./controllers/apiController.js";
import {socketAuthMiddleware} from "./middleware/socketAuth.js";
import {setIO} from "./config/socket.js";
import cors from "cors";
import {defaultRateLimit} from "./middleware/rateLimit.js";
import {initSwagger} from "./swagger/swagger.js";
import {checkAndSendReminders} from './controllers/medical/reminderController.js';
import promBundle from "express-prom-bundle";
import { connectedUsersGauge } from "./services/prometheusService.js";
import client from "prom-client";
import { errorHandler } from "./middleware/errorHandler.js";
import {loggerMiddleware, logInfo} from "./utils/logger.js";
import client from "prom-client";

const app = express();
const server = createServer(app);
const origins = ["https://uat.ngeeann.zip", "https://bed.ngeeann.zip", "http://localhost:5173", "http://localhost:4173"]
const io = new Server(server, {
    cors: {
        origin: origins,
        methods: ["GET", "POST"]
    }
});

app.set("trust proxy", 1);
app.use(loggerMiddleware)
app.use(express.static("dist"))
app.use(cors({
    origin: origins,
    credentials: true,
}));

app.use(express.json());


// Apply rate limiting globally
app.use(defaultRateLimit);

const metricsMiddleware = promBundle({
  promClient: {
    collectDefaultMetrics: {
      timeout: 10000,
    }
  },
  includeMethod: true,
  includePath: true,
  buckets: [0.001, 0.01, 0.1, 1, 2, 3, 5, 7, 10, 15, 20, 25, 30, 35, 40, 50, 70, 100, 200],
  normalizePath: (req, opts) => {
    const path = promBundle.normalizePath(req, opts);
    // Group dynamic routes
    if (path.startsWith("/api/users/")) {
      const parts = path.split("/");
      if (parts.length === 4) {
        return `/api/users/:id`;
      }
      if (parts.length === 5 && parts[4] === "role") {
        return `/api/users/:id/role`;
      }
      if (parts.length === 4 && parts[2] === "role") {
        return `/api/users/role/:role`;
      }
    }
    if (path.startsWith("/api/chats/")) {
      const parts = path.split("/");
      if (parts.length === 4) {
        return `/api/chats/:chatId`;
      }
      if (parts.length === 5) {
        return `/api/chats/:chatId/:messageId`;
      }
    }
    if (path.startsWith("/api/nutrition/")) {
      const parts = path.split("/");
      if (parts.length === 4) {
        return `/api/nutrition/:id`;
      }
    }
    if (path.startsWith("/api/medications/")) {
      const parts = path.split("/");
      if (parts.length === 4) {
        return `/api/medications/:id`;
      }
    }
    if (path.startsWith("/api/announcements/")) {
      const parts = path.split("/");
      if (parts.length === 4) {
        return `/api/announcements/:id`;
      }
    }
    return path;
  }
});
app.use(metricsMiddleware);
client.register.registerMetric(connectedUsersGauge);

app.use("/api", ApiController())

app.use(errorHandler)

initSwagger(app);

setIO(io);

io.use(socketAuthMiddleware);

io.on('connection', (socket) => {
    logInfo(`User ${socket.userId} connected to WebSocket`);

    socket.join(`user_${socket.userId}`);
    
    socket.on('disconnect', () => {
        logInfo(`User ${socket.userId} disconnected from WebSocket`);
    });
});

app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', client.register.contentType);
    res.end(await client.register.metrics());
  } catch (error) {
    res.status(500).end(error);
  }
});

// Start the medication reminder loop
setInterval(checkAndSendReminders, 60 * 1000); // Check every minute

server.listen(3001, (err) => {
    if (err) {
        throw err;
    }
    console.log("Server started on port 3001");
});


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
import { tracingMiddleware } from "./middleware/tracing.js";
import {logInfo} from "./utils/logger.js";

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

app.use(express.static("dist"))
app.use(cors({
    origin: origins,
    credentials: true,
}));

app.use(express.json());

app.use(tracingMiddleware)

// Apply rate limiting globally
app.use(defaultRateLimit)

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

// Start the medication reminder loop
setInterval(checkAndSendReminders, 60 * 1000); // Check every minute

server.listen(3001, (err) => {
    if (err) {
        throw err;
    }
    console.log("Server started on port 3001");
});


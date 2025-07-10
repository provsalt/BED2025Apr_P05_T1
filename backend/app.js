import express from "express"
import { createServer } from "http"
import { Server } from "socket.io"
import {ApiController} from "./controllers/apiController.js";
import {socketAuthMiddleware} from "./middleware/socketAuth.js";
import {setIO} from "./config/socket.js";
import cors from "cors";
import { defaultRateLimit } from "./middleware/rateLimit.js";
import { metricsHandler } from "./config/metrics.js";
import { metricsMiddleware } from "./middleware/metrics.js";

const app = express();
const server = createServer(app);
const origins = ["https://uat.ngeeann.zip", "https://bed.ngeeann.zip", "http://localhost:5173", "http://localhost:4173", "http://localhost:5174"]
const io = new Server(server, {
    cors: {
        origin: origins,
        methods: ["GET", "POST"]
    }
});

app.use(express.json())
app.use(express.static("dist"))
app.use(cors({
    origin: origins,
    credentials: true,
}))

// Apply metrics middleware
app.use(metricsMiddleware)

// Apply rate limiting globally
app.use(defaultRateLimit)

// Metrics endpoint for Prometheus
app.get('/metrics', metricsHandler)

app.use("/api", ApiController())

setIO(io);

io.use(socketAuthMiddleware);

io.on('connection', (socket) => {
    console.log(`User ${socket.userId} connected via WebSocket`);
    
    socket.join(`user_${socket.userId}`);
    
    socket.on('disconnect', () => {
        console.log(`User ${socket.userId} disconnected from WebSocket`);
    });
});


server.listen(3001, (err) => {
    if (err) {
        throw err;
    }
    console.log("Server started on port 3001");
})

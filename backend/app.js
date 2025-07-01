import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";

import { Controller } from "./controllers/controller.js";
import { socketAuthMiddleware } from "./middleware/socketAuth.js";
import { setIO } from "./config/socket.js";

const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: ["https://uat.ngeeann.zip", "https://bed.ngeeann.zip", "http://localhost:5173", "http://localhost:4173"],
        methods: ["GET", "POST"]
    }
});


app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,               
}));


app.use(express.json())
app.use(express.static("dist"))

Controller(app)

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
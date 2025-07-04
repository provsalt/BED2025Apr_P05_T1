import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
// import fetch from "node-fetch";

import { Controller } from "./controllers/controller.js";
import { socketAuthMiddleware } from "./middleware/socketAuth.js";
import { setIO } from "./config/socket.js";
import uploadRoutes from "./routes/uploadRoute.js";
import imageProxyRoute from "./routes/imageProxyRoute.js";

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["https://uat.ngeeann.zip","https://bed.ngeeann.zip","http://localhost:5173","http://localhost:4173"],
    methods: ["GET", "POST"]
  }
});

app.use(cors({
  origin: "http://localhost:5173", 
  credentials: true
}));

app.use(express.json());

app.use(express.static("dist"));

Controller(app);
app.use("/api", uploadRoutes);
app.use("/", imageProxyRoute);

setIO(io);
io.use(socketAuthMiddleware);

io.on("connection", (socket) => {
  console.log(`User ${socket.userId} connected via WebSocket`);

  socket.join(`user_${socket.userId}`);

  socket.on("disconnect", () => {
    console.log(`User ${socket.userId} disconnected from WebSocket`);
  });
});

server.listen(3001, (err) => {
  if (err) throw err;
  console.log("express server listening on http://localhost:3001");
});

// app.get("/uploads/:filename", async (req, res) => {
//   const filename = req.params.filename;
//   const url = `http://localhost:9000/bed-sx-miniobucket/profile-pictures/${filename}`;

//   try {
//     const response = await fetch(url);
//     if (!response.ok) return res.status(response.status).send("Image fetch failed");

//     res.set("Content-Type", response.headers.get("content-type"));
//     response.body.pipe(res);
//   } catch (err) {
//     console.error("Proxy error:", err);
//     res.status(500).send("Proxy failed");
//   }
// });

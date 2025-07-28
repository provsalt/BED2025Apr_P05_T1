import { decrementConnectedUsers, incrementConnectedUsers } from "../services/prometheusService.js";

let ioInstance = null;

/**
 * Set the Socket.IO instance
 * @param {import("socket.io").Server} io
 */
export const setIO = (io) => {
  ioInstance = io;
  io.on("connection", (socket) => {
    console.log(`User ${socket.userId} connected via WebSocket`);
    incrementConnectedUsers();
    socket.on("disconnect", () => {
      console.log(`User ${socket.userId} disconnected from WebSocket`);
      decrementConnectedUsers();
    });
  });
};

/**
 * Get the Socket.IO instance
 * @returns {import("socket.io").Server}
 */
export const getIO = () => {
  if (!ioInstance) {
    throw new Error("Socket.IO not initialized. Call setIO() first.");
  }
  return ioInstance;
};
import { jwtVerify } from 'jose';
import { logError } from '../utils/logger.js';

export const socketAuthMiddleware = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token || socket.handshake.query.token;

    if (!token) {
      return next(new Error("Authentication token required"));
    }

    const secret = new TextEncoder().encode(process.env.SECRET || "");
    const {payload} = await jwtVerify(token, secret, {
      algorithms: ["HS256"],
    });

    if (payload.exp && payload.exp < Date.now() / 1000) {
      return next(new Error("Token expired"));
    }

    socket.userId = payload.sub;
    socket.token = token;

    next();
  } catch (error) {
    logError(error, null, {
      context: "socket_authentication",
      socketId: socket.id,
      clientAddress: socket.handshake.address
    });
    next(error);
  }
};
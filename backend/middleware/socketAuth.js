import { decodeJwt } from 'jose';

export const socketAuthMiddleware = (socket, next) => {
  try {
    const token = socket.handshake.auth.token || socket.handshake.query.token;
    
    if (!token) {
      return next(new Error('Authentication token required'));
    }

    const decoded = decodeJwt(token);
    
    if (decoded.exp && decoded.exp < Date.now() / 1000) {
      return next(new Error('Token expired'));
    }

    socket.userId = decoded.sub;
    socket.token = token;
    
    next();
  } catch (error) {
    console.error('Socket authentication error:', error);
    next(new Error('Invalid authentication token'));
  }
};
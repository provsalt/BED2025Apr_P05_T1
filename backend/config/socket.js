let ioInstance = null;

/**
 * Set the Socket.IO instance
 * @param {import('socket.io').Server} io 
 */
export const setIO = (io) => {
  ioInstance = io;
};

/**
 * Get the Socket.IO instance
 * @returns {import('socket.io').Server}
 */
export const getIO = () => {
  if (!ioInstance) {
    throw new Error('Socket.IO not initialized. Call setIO() first.');
  }
  return ioInstance;
};
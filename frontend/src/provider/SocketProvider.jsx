import { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { UserContext } from './UserContext';

const SocketContext = createContext();

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const user  = useContext(UserContext);

  useEffect(() => {
    if (user && user.token && user.isAuthenticated) {
      const newSocket = io(import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000', {
        auth: { token: user.token },
      });

      setSocket(newSocket);

      return () => newSocket.close();
    }
  }, [user]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

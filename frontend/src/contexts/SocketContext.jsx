import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

function getSocketUrl() {
  const explicit = import.meta.env.VITE_SOCKET_URL;
  if (explicit) return explicit;

  const apiBase = import.meta.env.VITE_API_URL;
  if (apiBase && apiBase.startsWith('http')) {
    return apiBase.endsWith('/api') ? apiBase.slice(0, -4) : apiBase;
  }

  // Dev mode: API goes through Vite proxy ("/api"), but Socket.io
  // connects directly to the backend to avoid proxy ECONNABORTED on restarts.
  const { protocol, hostname } = window.location;
  return `${protocol}//${hostname}:4000`;
}

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const { token } = useAuth();

  useEffect(() => {
    if (!token) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    const socketUrl = getSocketUrl();
    const socketInstance = io(socketUrl, {
      path: '/socket.io/',
      auth: { token },
      transports: ['websocket', 'polling'],
      withCredentials: true,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 10000,
      reconnectionAttempts: 20,
    });

    socketInstance.on('connect', () => {
      console.log('Socket connected:', socketInstance.id);
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [token]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};

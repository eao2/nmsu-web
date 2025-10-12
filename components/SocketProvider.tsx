// components/SocketProvider.tsx
'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import io, { Socket } from 'socket.io-client';

const SocketContext = createContext<Socket | null>(null);

export function useSocket() {
  return useContext(SocketContext);
}

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (session?.user?.id) {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost';
      
      const newSocket = io(apiUrl, {
        path: '/api/socket',
        extraHeaders: {
          'ngrok-skip-browser-warning': 'true',
        },
        transports: ['websocket', 'polling'],
        withCredentials: true,
      });

      newSocket.on('connect', () => {
        console.log('Socket connected:', newSocket.id);
        newSocket.emit('authenticate', session.user.id);
      });

      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    }
  }, [session?.user?.id]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
}
// lib/socket-server.ts
import { Server as NetServer } from 'http';
import { NextApiRequest, NextApiResponse } from 'next';
import { Server as ServerIO } from 'socket.io';

export const config = {
  api: {
    bodyParser: false,
  },
};

const SocketHandler = (req: NextApiRequest, res: NextApiResponse & { socket: any }) => {
  if (res.socket.server.io) {
    console.log('Socket is already running');
  } else {
    console.log('Socket is initializing');
    const httpServer: NetServer = res.socket.server as any;
    const io = new ServerIO(httpServer, {
      path: '/api/socket',
      addTrailingSlash: false,
      // No need for complex CORS when on the same origin
    });
    
    // Paste your existing socket logic here
    io.on("connection", (socket) => {
      console.log("Client connected:", socket.id);

      socket.on("authenticate", (userId) => {
        if (!userId) {
          console.warn('Authentication failed: no userId provided');
          return;
        }
        
        console.log("User authenticated:", userId);
        socket.data.userId = userId;
        socket.join(`user:${userId}`);
        
        socket.emit('authenticated', { userId });
      });

      socket.on("disconnect", (reason) => {
        console.log("Client disconnected:", socket.id, "Reason:", reason);
      });

      socket.on("error", (error) => {
        console.error("Socket error:", error);
      });
    });

    // Make the io instance available globally for other server-side functions
    (global as any).io = io;
    res.socket.server.io = io;
  }
  res.end();
};

export default SocketHandler;
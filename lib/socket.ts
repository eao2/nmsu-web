import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { prisma } from './prisma';

let io: SocketIOServer | null = null;

export function initializeSocket(httpServer: HTTPServer) {
  if (io) return io;

  io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.NEXTAUTH_URL,
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('authenticate', (userId: string) => {
      socket.join(`user:${userId}`);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  return io;
}

export async function emitNotification(userId: string, notification: any) {
  if (!io) return;
  
  io.to(`user:${userId}`).emit('notification', notification);
}

export async function createNotification({
  userId,
  type,
  title,
  message,
  data,
}: {
  userId: string;
  type: string;
  title: string;
  message: string;
  data?: any;
}) {
  const notification = await prisma.notification.create({
    data: {
      userId,
      type: type as any,
      title,
      message,
      data: data || {},
    },
  });

  await emitNotification(userId, notification);

  return notification;
}
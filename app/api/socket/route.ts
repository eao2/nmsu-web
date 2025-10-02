import { Server as HTTPServer } from 'http';
import { NextApiRequest } from 'next';
import { NextApiResponseServerIO } from '@/types';
import { initializeSocket } from '@/lib/socket';

export const config = {
  api: {
    bodyParser: false,
  },
};

const handler = (req: NextApiRequest, res: NextApiResponseServerIO) => {
  if (!res.socket.server.io) {
    const httpServer: HTTPServer = res.socket.server as any;
    const io = initializeSocket(httpServer);
    res.socket.server.io = io;
  }
  res.end();
};

export { handler as GET, handler as POST };
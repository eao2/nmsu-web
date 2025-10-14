// socket-server.js
const { createServer } = require("http");
const { Server } = require("socket.io");

const port = parseInt(process.env.SOCKET_PORT || "3001", 10);

const allowedOrigins = [
  process.env.NEXTAUTH_URL,
  process.env.VERCEL_URL,
  'http://localhost:3000',
  'https://willene-premonumental-javion.ngrok-free.dev',
  'https://student.nmit.edu.mn',
  'https://nmit.vercel.app',
  'https://nmsu.vercel.app',
].filter(Boolean);

const httpServer = createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Socket.io server running\n");
});

const io = new Server(httpServer, {
  path: "/api/socket",
  addTrailingSlash: false,
  cors: {
    // origin: (origin, callback) => {
    //   if (!origin) return callback(null, true);
      
    //   if (allowedOrigins.includes(origin)) {
    //     callback(null, true);
    //   } else {
    //     console.warn('Origin not allowed:', origin);
    //     callback(null, false);
    //   }
    // },
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
});

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

global.io = io;

httpServer.listen(port, () => {
  console.log(`> Socket.io server running on port ${port}`);
  console.log(`> Path: /api/socket`);
  console.log(`> Allowed origins:`, allowedOrigins);
});

process.on("SIGINT", () => {
  console.log("\nShutting down Socket.io server...");
  io.close(() => {
    console.log("Socket.io server closed");
    httpServer.close(() => {
      console.log("HTTP server closed");
      process.exit(0);
    });
  });
});

process.on("SIGTERM", () => {
  console.log("\nShutting down Socket.io server...");
  io.close(() => {
    console.log("Socket.io server closed");
    httpServer.close(() => {
      console.log("HTTP server closed");
      process.exit(0);
    });
  });
});
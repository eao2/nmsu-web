// socket-server.js
const { createServer } = require("http");
const { Server } = require("socket.io");

const port = parseInt(process.env.SOCKET_PORT || "3001", 10);
const allowedOrigins = [
  process.env.NEXTAUTH_URL,
  process.env.VERCEL_URL,
  "http://localhost:3000",
  "https://localhost:3000",
].filter(Boolean);

const httpServer = createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Socket.io server running\n");
});

const io = new Server(httpServer, {
  path: "/api/socket",
  addTrailingSlash: false,
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
  allowRequest: (req, callback) => {
    // Skip ngrok browser warning by accepting the header
    callback(null, true);
  },
  transports: ["websocket", "polling"],
});

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("authenticate", (userId) => {
    console.log("User authenticated:", userId);
    socket.data.userId = userId;
    socket.join(`user:${userId}`);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });

  // Add your other socket event handlers here
});

// Make io accessible globally if needed
global.io = io;

httpServer.listen(port, () => {
  console.log(`> Socket.io server running on port ${port}`);
  console.log(`> Path: /api/socket`);
  console.log(`> Allowed origins:`, allowedOrigins);
});

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("Shutting down Socket.io server...");
  io.close(() => {
    console.log("Socket.io server closed");
    process.exit(0);
  });
});
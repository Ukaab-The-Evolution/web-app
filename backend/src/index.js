import express from 'express';
import cookieParser from 'cookie-parser';
import globalErrorHandler from './controllers/errorController.js';
import authRoutes from './routes/authRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import cors from 'cors';
import path from 'path';
import http from 'http';
import { Server } from 'socket.io';

const app = express();
const PORT = process.env.PORT || 3000; // Use environment variable or default to 3000

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());
app.use(cors());

// Asset File
app.use('/.well-known', express.static(path.join(process.cwd(), '.well-known')));

// Socket.IO
// ✅ Create HTTP server
const server = http.createServer(app);

// ✅ Setup Socket.IO
export const io = new Server(server, {
  cors: {
    origin: '*', // change to your frontend URL later for security
  },
});

// ✅ Listen for Socket.IO connections
io.on('connection', (socket) => {
  console.log(`⚡ New client connected: ${socket.id}`);

  // Truck or shipper can join their own room (for targeted notifications)
  socket.on('join', (room) => {
    socket.join(room);
    console.log(`✅ Socket ${socket.id} joined room ${room}`);
  });

  // Example test event
  socket.on('pingServer', (data) => {
    console.log('📩 Ping received:', data);
    socket.emit('pongServer', { msg: 'Pong from server!' });
  });

  socket.on('disconnect', () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
  });
});

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/upload', uploadRoutes);
app.use('/api/v1/profile', profileRoutes);
app.use('/api/v1/booking', bookingRoutes);

// Health check endpoint
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is running healthy'
  });
});

// Error handling middleware
app.use(globalErrorHandler);

// Start the server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API Endpoint: http://localhost:${PORT}/api/v1`);
  console.log(`Auth Endpoint: http://localhost:${PORT}/api/v1/auth`);
  console.log(`Health Check: http://localhost:${PORT}/api/v1/health`);
});

export default app;
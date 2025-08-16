import express from 'express';
import cookieParser from 'cookie-parser';
import globalErrorHandler from './controllers/errorController.js';
import authRoutes from './routes/authRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';

const app = express();
const PORT = process.env.PORT || 3000; // Use environment variable or default to 3000

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/upload', uploadRoutes);

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
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API Endpoint: http://localhost:${PORT}/api/v1`);
  console.log(`Auth Endpoint: http://localhost:${PORT}/api/v1/auth`);
  console.log(`Health Check: http://localhost:${PORT}/api/v1/health`);
});

export default app;
import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeDatabase } from './config/firebase';
import authRoutes from './routes/authRoutes';
import bookRoutes from './routes/bookRoutes';
import noteRoutes from './routes/noteRoutes';
import quoteRoutes from './routes/quoteRoutes';
import statsRoutes from './routes/statsRoutes';
import soundRoutes from './routes/soundRoutes';
import mediaRoutes from './routes/mediaRoutes';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Start server
async function startServer() {
  try {
    // Initialize Database
    await initializeDatabase();

    // Health Check Route
    app.get('/api/health', (req: Request, res: Response) => {
      res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: process.env.API_VERSION || 'v1'
      });
    });

    // API Routes
    const apiV1 = express.Router();

    apiV1.use('/auth', authRoutes);
    apiV1.use('/books', bookRoutes);
    apiV1.use('/notes', noteRoutes);
    apiV1.use('/quotes', quoteRoutes);
    apiV1.use('/stats', statsRoutes);
    apiV1.use('/sounds', soundRoutes);
    apiV1.use('/media', mediaRoutes);

    app.use('/api/v1', apiV1);

    // Error Handling Middleware
    app.use((err: any, req: Request, res: Response, next: any) => {
      console.error('Error:', err);
      res.status(err.status || 500).json({
        error: err.message || 'Internal Server Error',
        timestamp: new Date().toISOString()
      });
    });

    // 404 Handler
    app.use((req: Request, res: Response) => {
      res.status(404).json({
        error: 'Route not found',
        path: req.path
      });
    });

    // Start listening
    const server = app.listen(PORT, () => {
      console.log(`🚀 Okuma Köşesi Server is running on port ${PORT}`);
      console.log(`📚 Frontend: ${process.env.FRONTEND_URL}`);
    });

    // Handle server errors
    server.on('error', (error) => {
      console.error('Server error:', error);
    });

    // Handle unhandled exceptions
    process.on('uncaughtException', (error) => {
      console.error('Uncaught exception:', error);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      console.error('Unhandled rejection at:', promise, 'reason:', reason);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

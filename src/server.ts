import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import { testConnection } from './db';
import branchRoutes from './routes/branch';
import galleryRoutes from './routes/gallery';
import userEnquiriesRoutes from './routes/user_enquiries';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const allowedHosts = ["http://localhost:5173","https://nyxta-neon.vercel.app/","nyxta-josehp304s-projects.vercel.app","https://nyxta-8kupn82gu-josehp304s-projects.vercel.app","https://nyxta-cms.vercel.app"];

app.use(
  cors({
    origin: allowedHosts,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Nyxta Backend API is running',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/branches', branchRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/enquiries', userEnquiriesRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.path,
  });
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// Start server
async function startServer() {
  try {
    // Test database connection
    const dbConnected = await testConnection();
    if (!dbConnected) {
      throw new Error('Failed to connect to database');
    }

    app.listen(PORT, () => {
      console.log(`
╔═══════════════════════════════════════════════════╗
║                                                   ║
║   🚀 Nyxta Backend Server Started                ║
║                                                   ║
║   📍 Port: ${PORT}                                   ║
║   🌍 Environment: ${process.env.NODE_ENV || 'development'}              ║
║   💾 Database: Connected                          ║
║                                                   ║
║   API Endpoints:                                  ║
║   - GET  /                                        ║
║   - CRUD /api/branches                            ║
║   - CRUD /api/gallery                             ║
║   - CRUD /api/enquiries                           ║
║                                                   ║
╚═══════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export default app;

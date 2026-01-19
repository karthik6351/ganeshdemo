import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/database.js';
import memberRoutes from './routes/memberRoutes.js';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Middleware
app.use((req, res, next) => {
    console.log(`[API Debug] Method:${req.method} URL:${req.url} OriginalURL:${req.originalUrl} BaseURL:${req.baseUrl}`);
    next();
});
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectDB();

// Routes
// Mount at both locations to handle Vercel path rewriting variations
app.use('/api/members', memberRoutes);
app.use('/members', memberRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Family Tree API is running on Vercel' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

// Export the app for Vercel
export default app;

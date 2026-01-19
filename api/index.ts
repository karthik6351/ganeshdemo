import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/database';
import memberRoutes from './routes/memberRoutes';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
// Note: In serverless, we should arguably connect per request or cache the connection.
// mongoose.connect manages connection buffering, so calling it here is generally okay,
// but let's ensure we call it.
connectDB();

// Routes
// Vercel handles /api routing via vercel.json, but if we mount at /api, 
// we need to be careful about the path. 
// If vercel.json rewrites /api/(.*) to /api/index.js, 
// express receives the request.
// The base path might be stripped or not depending on configuration.
// Usually for Vercel Express, handled routes should be relative to the mount point or root.
// Let's assume /api prefix is stripped or we handle /api path explicitly.
app.use('/api/members', memberRoutes);

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

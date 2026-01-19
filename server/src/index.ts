import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/database.js';
import memberRoutes from './routes/memberRoutes.js';

// Load environment variables
dotenv.config();

console.log('🔧 Starting Family Tree Server...');
console.log('Environment:', process.env.NODE_ENV);
console.log('MongoDB URI configured:', process.env.MONGODB_URI ? 'Yes' : 'No');

// Create Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/members', memberRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Family Tree API is running' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

// Start server
const startServer = async () => {
    try {
        console.log('📡 Connecting to MongoDB...');

        // Connect to MongoDB
        await connectDB();

        console.log('✅ MongoDB connected successfully!');

        // Start listening
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`📍 API: http://localhost:${PORT}/api`);
            console.log(`💚 Health: http://localhost:${PORT}/api/health`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        console.error('Error details:', error.message);
        process.exit(1);
    }
};

startServer();

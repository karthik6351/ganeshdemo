import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI;

        if (!mongoURI) {
            console.warn('MONGODB_URI is not defined');
            return;
        }

        // Check if we already have a connection
        if (mongoose.connection.readyState >= 1) {
            return;
        }

        const conn = await mongoose.connect(mongoURI, {
            tls: true,
            tlsAllowInvalidCertificates: false,
            serverSelectionTimeoutMS: 10000,
        });

        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
    }
};

export default connectDB;

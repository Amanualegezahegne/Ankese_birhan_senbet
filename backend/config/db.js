const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const uri = process.env.MONGODB_URI;
        if (!uri) {
            throw new Error('MONGODB_URI is not defined in environment variables');
        }

        console.log(`Connecting to MongoDB: ${uri.split('@')[1]}...`); // Log host only for security

        const conn = await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 5000 // Timeout after 5 seconds
        });

        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`MongoDB Connection Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;

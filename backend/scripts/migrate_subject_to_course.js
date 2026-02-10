const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('../config/db');
const Grade = require('../models/Grade');

dotenv.config({ path: __dirname + '/../.env' });

const migrate = async () => {
    try {
        await connectDB();
        console.log('Connected to MongoDB for migration...');

        // Rename 'subject' field to 'course' in all documents
        const result = await Grade.updateMany(
            { subject: { $exists: true } },
            { $rename: { 'subject': 'course' } }
        );

        console.log(`Matched ${result.matchedCount} documents.`);
        console.log(`Modified ${result.modifiedCount} documents.`);
        console.log('Migration completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

migrate();

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Student = require('../models/Student');
const connectDB = require('../config/db');

dotenv.config({ path: __dirname + '/../.env' }); // Adjust path to .env

const migrateRoles = async () => {
    try {
        await connectDB();

        console.log('Connected to MongoDB...');

        // Update all students who don't have a role or role includes 'student' (just to be safe, targeting missing ones)
        // Actually, we want to set role='student' for ANYONE who is NOT a teacher.
        // Old records won't have a role. New records might have 'student' or 'teacher'.

        const result = await Student.updateMany(
            { role: { $ne: 'teacher' } }, // Target documents where role is NOT 'teacher' (includes missing role)
            { $set: { role: 'student' } }
        );

        console.log(`Migration completed. Modified ${result.modifiedCount} documents.`);
        console.log(`Matched ${result.matchedCount} documents.`);

        process.exit();
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

migrateRoles();

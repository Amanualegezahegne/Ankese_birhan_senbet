const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const syncDatabase = async () => {
    const password = process.env.DB_PASSWORD;
    const projectRef = 'pklskjkzdqlioeqvfcqk'; // From your project URL
    
    if (!password || password === 'your_database_password_here') {
        console.error('❌ Error: DB_PASSWORD is not set in .env file.');
        console.log('Please add your Supabase database password to the backend/.env file.');
        process.exit(1);
    }

    // Supabase Transaction Pooler connection string (More reliable for DNS)
    const connectionString = `postgresql://postgres.pklskjkzdqlioeqvfcqk:${password}@aws-1-eu-central-1.pooler.supabase.com:6543/postgres`;

    const client = new Client({
        connectionString: connectionString,
    });

    try {
        console.log('🔄 Connecting to Supabase database...');
        await client.connect();
        console.log('✅ Connected successfully!');

        const sqlPath = path.join(__dirname, 'setup_supabase.sql');
        console.log(`📖 Reading schema file: ${sqlPath}`);
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('🚀 Executing SQL commands...');
        await client.query(sql);
        console.log('🎉 Database synchronized successfully!');

    } catch (error) {
        console.error('-----------------------------------------');
        console.error('❌ Synchronization Error:');
        console.error(error.message);
        console.error('-----------------------------------------');
    } finally {
        await client.end();
    }
};

syncDatabase();

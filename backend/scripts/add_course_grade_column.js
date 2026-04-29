const { Client } = require('pg');
require('dotenv').config({ path: '../.env' });

const addCourseGradeColumn = async () => {
    const password = process.env.DB_PASSWORD;
    if (!password) {
        console.error('DB_PASSWORD not found in .env');
        process.exit(1);
    }

    // Using the same connection string format as in existing scripts
    const connectionString = `postgresql://postgres.pklskjkzdqlioeqvfcqk:${password}@aws-1-eu-central-1.pooler.supabase.com:6543/postgres`;
    const client = new Client({ connectionString });

    try {
        await client.connect();
        console.log('Connected to Supabase...');
        
        console.log('Adding "grade" column to "courses" table...');
        await client.query(`
            ALTER TABLE courses ADD COLUMN IF NOT EXISTS grade TEXT DEFAULT 'General';
        `);
        console.log('Successfully added "grade" column to "courses" table!');
        
        await client.query(`NOTIFY pgrst, 'reload schema';`);
        console.log('Schema cache refreshed successfully!');

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await client.end();
    }
};

addCourseGradeColumn();

const { Client } = require('pg');
require('dotenv').config({ path: '../.env' });

const addGradesExamColumns = async () => {
    const password = process.env.DB_PASSWORD;
    if (!password) {
        console.error('DB_PASSWORD not found in .env');
        process.exit(1);
    }

    const connectionString = `postgresql://postgres.pklskjkzdqlioeqvfcqk:${password}@aws-1-eu-central-1.pooler.supabase.com:6543/postgres`;
    const client = new Client({ connectionString });

    try {
        await client.connect();
        console.log('Connected to Supabase PostgreSQL...');
        
        console.log('Altering "grades" table to add exam and assignment columns if they do not exist...');
        await client.query(`
            ALTER TABLE grades ADD COLUMN IF NOT EXISTS mid_exam NUMERIC DEFAULT 0;
            ALTER TABLE grades ADD COLUMN IF NOT EXISTS final_exam NUMERIC DEFAULT 0;
            ALTER TABLE grades ADD COLUMN IF NOT EXISTS assignment NUMERIC DEFAULT 0;
        `);
        console.log('Successfully altered "grades" table!');
        
        // Notify PostgREST to reload the schema cache
        await client.query(`NOTIFY pgrst, 'reload schema';`);
        console.log('Schema cache refreshed successfully!');

    } catch (error) {
        console.error('Error executing migration:', error.message);
    } finally {
        await client.end();
    }
};

addGradesExamColumns();

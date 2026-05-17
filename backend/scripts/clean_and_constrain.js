const { Client } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from backend/.env
dotenv.config({ path: path.join(__dirname, '../../../../../ankese_birhan_senbet/backend/.env') });

async function run() {
    const password = process.env.DB_PASSWORD;
    if (!password) {
        console.error("❌ Error: DB_PASSWORD is not set.");
        return;
    }

    const connectionString = `postgresql://postgres.pklskjkzdqlioeqvfcqk:${password}@aws-1-eu-central-1.pooler.supabase.com:6543/postgres`;
    const client = new Client({ connectionString });

    try {
        console.log("🔄 Connecting to Supabase PostgreSQL database...");
        await client.connect();
        console.log("✅ Connected successfully!");

        // 1. Delete duplicates keeping only the latest created_at
        console.log("🧹 Identifying and removing duplicate grades (keeping only the newest for each student/course/semester/year)...");
        const deleteQuery = `
            DELETE FROM grades
            WHERE id NOT IN (
                SELECT DISTINCT ON (student_id, course, semester, year) id
                FROM grades
                ORDER BY student_id, course, semester, year, created_at DESC
            );
        `;
        const deleteRes = await client.query(deleteQuery);
        console.log(`✅ Cleaned up duplicates! Rows affected: ${deleteRes.rowCount}`);

        // 2. Add UNIQUE constraint to prevent future duplication
        console.log("🛡️ Adding UNIQUE constraint to grades table (student_id, course, semester, year)...");
        const constraintQuery = `
            ALTER TABLE grades 
            ADD CONSTRAINT unique_student_course_semester_year 
            UNIQUE (student_id, course, semester, year);
        `;
        
        try {
            await client.query(constraintQuery);
            console.log("✅ UNIQUE constraint unique_student_course_semester_year successfully added!");
        } catch (err) {
            if (err.code === '42710') {
                console.log("ℹ️ UNIQUE constraint already exists in database.");
            } else {
                throw err;
            }
        }

    } catch (error) {
        console.error("❌ Migration error:", error);
    } finally {
        await client.end();
        console.log("🔌 Connection closed.");
    }
}

run();

const { Client } = require('pg');

const runCleanup = async () => {
    const password = process.env.DB_PASSWORD;
    if (!password) {
        console.warn('⚠️ DB_PASSWORD not found in environment. Cleanup skipped.');
        return;
    }

    const connectionString = `postgresql://postgres.pklskjkzdqlioeqvfcqk:${password}@aws-1-eu-central-1.pooler.supabase.com:6543/postgres`;
    const client = new Client({ connectionString });

    try {
        console.log('🔄 [Startup Cleanup] Connecting to Supabase database...');
        await client.connect();

        // 1. Delete duplicates keeping the newest created_at record
        const deleteQuery = `
            DELETE FROM grades
            WHERE id NOT IN (
                SELECT DISTINCT ON (student_id, course, semester, year) id
                FROM grades
                ORDER BY student_id, course, semester, year, created_at DESC
            );
        `;
        const deleteRes = await client.query(deleteQuery);
        if (deleteRes.rowCount > 0) {
            console.log(`🧹 [Startup Cleanup] Removed ${deleteRes.rowCount} duplicate grade records!`);
        } else {
            console.log('✅ [Startup Cleanup] No duplicate grade records found.');
        }

        // 2. Add UNIQUE constraint to make it permanent
        const constraintQuery = `
            ALTER TABLE grades 
            ADD CONSTRAINT unique_student_course_semester_year 
            UNIQUE (student_id, course, semester, year);
        `;
        try {
            await client.query(constraintQuery);
            console.log('🛡️ [Startup Cleanup] UNIQUE constraint added successfully to grades table.');
        } catch (err) {
            if (err.code === '42710' || err.message?.includes('already exists')) {
                // Constraint already exists, this is fine — skip silently
            } else {
                console.error('⚠️ [Startup Cleanup] Failed to add UNIQUE constraint:', err.message);
            }
        }

    } catch (error) {
        console.error('❌ [Startup Cleanup] Error during cleanup:', error.message);
    } finally {
        try {
            await client.end();
        } catch (err) {}
    }
};

module.exports = { runCleanup };

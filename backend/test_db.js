const { supabase } = require('./config/db');
require('dotenv').config();

async function test() {
    try {
        console.log("Checking Supabase connection...");
        const { data, error } = await supabase.from('students').select('id, name, role').limit(5);
        if (error) {
            console.error("Error querying students:", error);
        } else {
            console.log("Students:", data);
        }

        const { data: grades, error: gradesError } = await supabase.from('grades').select('*').limit(5);
        if (gradesError) {
            console.error("Error querying grades:", gradesError);
        } else {
            console.log("Grades:", grades);
        }
    } catch (err) {
        console.error("Catastrophic error:", err);
    }
}

test();

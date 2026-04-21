const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey || supabaseUrl === 'your_supabase_project_url') {
    console.warn('⚠️ Supabase credentials not fully configured in .env file.');
}

const supabase = createClient(supabaseUrl, supabaseKey);

const connectDB = async () => {
    try {
        // Test the connection with a simple query
        const { data, error } = await supabase.from('news').select('id').limit(1);
        
        if (error && error.code !== 'PGRST116') { // PGRST116 is 'not found' which is fine if table empty
            throw error;
        }

        console.log('✅ Supabase Connection initialized');
    } catch (error) {
        console.error('-----------------------------------------');
        console.error('❌ Supabase Connection Error:');
        console.error(error.message);
        console.error('-----------------------------------------');
        // We don't exit(1) here necessarily if we want the server to start, 
        // but for now let's keep it similar to previous behavior.
    }
};

module.exports = { supabase, connectDB };

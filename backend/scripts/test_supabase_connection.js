const { supabase } = require('../config/db');

async function testConnection() {
  console.log('Testing Supabase connection...');
  
  try {
    // 1. Try to fetch from 'news' table
    const { data, error } = await supabase
      .from('news')
      .select('*')
      .limit(1);

    if (error) {
      if (error.code === '42P01') {
        console.error('❌ Error: Table "news" does not exist. Did you run the SQL setup script?');
      } else {
        console.error('❌ Supabase error:', error.message);
      }
      return;
    }

    console.log('✅ Connection successful!');
    console.log('Data fetched:', data);

  } catch (err) {
    console.error('❌ Unexpected error:', err.message);
  }
}

testConnection();

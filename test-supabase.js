const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });
require('dotenv').config({ path: '.env.local' });
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
console.log('URL:', supabaseUrl ? 'Exists' : 'Missing');
const supabase = createClient(supabaseUrl, supabaseKey);
supabase.from('leave_requests').insert([{
  student_email: 'test@example.com',
  student_name: 'Test',
  leave_type: 'Sick',
  reason: 'Fever',
  start_date: '2024-04-20',
  end_date: '2024-04-21',
  status: 'pending'
}]).select().then(res => {
  console.log(res);
  if (res.error) console.log(res.error.message);
}).catch(console.error);

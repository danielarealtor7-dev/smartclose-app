const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envLocal = fs.readFileSync('.env.local', 'utf-8');
const url = envLocal.split('\n').find(l => l.startsWith('NEXT_PUBLIC_SUPABASE_URL=')).split('=')[1].trim();
const serviceKey = envLocal.split('\n').find(l => l.startsWith('SUPABASE_SERVICE_ROLE_KEY='))?.split('=')[1].trim();

const supabase = createClient(url, serviceKey);

async function run() {
  const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
  console.log('Auth Users:', authUsers.users.map(u => ({ id: u.id, email: u.email })));
  if (authError) console.error(authError);
}

run();

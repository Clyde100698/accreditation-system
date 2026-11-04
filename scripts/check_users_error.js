const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
  const [k, ...v] = line.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim().replace(/^['"]|['"]$/g, '');
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function main() {
  const { data: users, error } = await supabase.from('users').select('*');
  if (error) {
    console.error('Error querying users:', error);
  } else {
    console.log(`Found ${users.length} users:`);
    users.forEach(u => console.log(` ${u.email} | ${u.role} | prog: ${u.program_id} | id: ${u.id}`));
  }
}

main().catch(console.error);


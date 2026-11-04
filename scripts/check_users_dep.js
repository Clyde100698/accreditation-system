const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

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
  const { data: users } = await supabase.from('users').select('id, email, full_name, role, department_id, auth_user_id');
  console.log('Users in DB:');
  users.forEach(u => {
    console.log(` ${u.email} | dep: ${u.department_id} | auth_id: ${u.auth_user_id} | id: ${u.id}`);
  });

  const { data: assignments } = await supabase.from('area_assignments').select('id, user_id, assignment_type, area_id');
  console.log('\nSample assignments user_ids:');
  assignments.slice(0, 10).forEach(a => {
    const u = users.find(x => x.id === a.user_id);
    console.log(` assignment ${a.id} -> user_id ${a.user_id} (${u ? u.full_name : 'NOT FOUND IN USERS!'})`);
  });
}

main().catch(console.error);


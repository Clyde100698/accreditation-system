const fs = require('fs');
const envText = fs.readFileSync('.env.local', 'utf-8');
const env = {};
envText.split(/\r?\n/).forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    env[match[1].trim()] = match[2].trim().replace(/^['"]|['"]$/g, '');
  }
});

const { createClient } = require('@supabase/supabase-js');
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function checkUsers() {
  const { data: users } = await sb.from('users').select('id, email, role, program_id, full_name, is_active');
  console.log('Users in DB:');
  console.log(users);
}

checkUsers();


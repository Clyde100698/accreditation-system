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
  const { data: assignments, error } = await supabase
    .from('area_assignments')
    .select('*');

  if (error) {
    console.error('Error fetching assignments:', error);
    return;
  }

  console.log(`Total area_assignments: ${assignments.length}`);
  if (assignments.length > 0) {
    console.log('Sample assignment:', assignments[0]);
  }

  // Also test the exact join used in areas/page.tsx
  const { data: joined, error: jErr } = await supabase
    .from('area_assignments')
    .select('*, users!user_id(*)');

  if (jErr) {
    console.error('Error with joined query users!user_id:', jErr);
  } else {
    console.log(`Total joined records: ${joined.length}`);
    if (joined.length > 0) {
      console.log('Sample joined record:', JSON.stringify(joined[0], null, 2));
    }
  }
}

main().catch(console.error);


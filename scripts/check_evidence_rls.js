const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
  const [k, ...v] = line.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim().replace(/^['"]|['"]$/g, '');
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function checkRLS() {
  const anonClient = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  
  const { data: anonData, error: anonErr } = await anonClient
    .from('evidence_documents')
    .select('id')
    .limit(5);
  console.log('Anon select on evidence_documents:', anonData?.length, 'error:', anonErr);

  // Check with service role
  const { data: adminData } = await supabase
    .from('evidence_documents')
    .select('id')
    .limit(5);
  console.log('Admin select on evidence_documents:', adminData?.length);
}
checkRLS().catch(console.error);


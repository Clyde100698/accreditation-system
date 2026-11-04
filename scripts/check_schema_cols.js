const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const envPath = path.resolve('.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const [k, ...v] = line.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim();
});

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  console.log('--- CHECK: accreditation_areas with display_order ---');
  const { data: a1, error: e1 } = await supabase
    .from('accreditation_areas')
    .select('code, title, weight, display_order')
    .order('display_order');
  if (e1) console.log('display_order column error:', JSON.stringify(e1));
  else console.log(JSON.stringify(a1, null, 2));

  console.log('\n--- CHECK: accreditation_areas order by code (current, will mis-sort Roman) ---');
  const { data: a2, error: e2 } = await supabase
    .from('accreditation_areas')
    .select('code, title, weight')
    .order('code');
  if (e2) console.log('error:', e2);
  else console.log(JSON.stringify(a2, null, 2));

  console.log('\n--- CHECK: accreditation_criteria category column sample ---');
  const { data: c1, error: ec1 } = await supabase
    .from('accreditation_criteria')
    .select('code, category')
    .order('code')
    .limit(5);
  if (ec1) console.log('category col error:', JSON.stringify(ec1));
  else console.log(JSON.stringify(c1, null, 2));
}

run();

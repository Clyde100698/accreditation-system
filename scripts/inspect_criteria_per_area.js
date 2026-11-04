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
  const { data: areas } = await supabase.from('accreditation_areas').select('*').order('display_order');
  const { data: criteria } = await supabase.from('accreditation_criteria').select('id, code, title, area_id').order('code');

  console.log(`Areas: ${areas.length}, Criteria: ${criteria.length}`);
  
  const areaCounts = {};
  areas.forEach(a => areaCounts[a.id] = { name: a.name, weight: a.weight, count: 0, criteria: [] });
  criteria.forEach(c => {
    if (areaCounts[c.area_id]) {
      areaCounts[c.area_id].count++;
      areaCounts[c.area_id].criteria.push(c);
    }
  });

  for (const [aid, info] of Object.entries(areaCounts)) {
    console.log(`Area: ${info.name} (weight ${info.weight}) -> ${info.count} criteria`);
  }
}

main().catch(console.error);


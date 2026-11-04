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

async function runAudit() {
  console.log('--- QUERY 1: SELECT code, title, weight FROM accreditation_areas ORDER BY code; ---');
  const { data: q1, error: err1 } = await supabase
    .from('accreditation_areas')
    .select('code, title, weight')
    .order('code');
  if (err1) console.error('Error Q1:', err1);
  else console.log(JSON.stringify(q1, null, 2));

  console.log('\n--- QUERY 2: SELECT level_number, label, min_score_threshold FROM accreditation_levels ORDER BY level_number; ---');
  const { data: q2, error: err2 } = await supabase
    .from('accreditation_levels')
    .select('level_number, label, min_score_threshold')
    .order('level_number');
  if (err2) console.error('Error Q2:', err2);
  else console.log(JSON.stringify(q2, null, 2));

  console.log('\n--- QUERY 3: SELECT code, title, area_id, category, expected_document_type, required_count FROM accreditation_criteria ORDER BY area_id, code; ---');
  const { data: q3, error: err3 } = await supabase
    .from('accreditation_criteria')
    .select('code, title, area_id, category, expected_document_type, required_count')
    .order('area_id')
    .order('code');
  if (err3) console.error('Error Q3:', err3);
  else console.log(JSON.stringify(q3, null, 2));

  console.log('\n--- QUERY 5: SELECT DISTINCT category FROM accreditation_criteria; ---');
  const { data: q5, error: err5 } = await supabase
    .from('accreditation_criteria')
    .select('category');
  if (err5) console.error('Error Q5:', err5);
  else {
    const distinctCategories = Array.from(new Set((q5 || []).map(r => r.category)));
    console.log(distinctCategories);
  }

  console.log('\n--- QUERY CHECK PARENT CRITERION ID ---');
  const { data: qParent, error: errParent } = await supabase
    .from('accreditation_criteria')
    .select('code, parent_criterion_id')
    .not('parent_criterion_id', 'is', null);
  if (errParent) console.log('Error checking parent_criterion_id:', errParent);
  else console.log('Criteria with parent_criterion_id not null:', qParent);
}

runAudit();

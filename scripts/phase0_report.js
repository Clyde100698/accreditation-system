const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(l => { const [k,...v]=l.split('='); if(k&&v.length) env[k.trim()]=v.join('=').trim(); });
const s = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  // 1. Areas — verify Roman numerals and no category column
  console.log('\n=== 1. accreditation_areas ===');
  const {data:areas, error:ae} = await s.from('accreditation_areas').select('code,title,weight,display_order').order('display_order');
  if(ae) console.error(ae); else console.log(JSON.stringify(areas,null,2));

  // 1b. Confirm category column is gone
  console.log('\n=== 1b. category column check ===');
  const {data:catCheck, error:catErr} = await s.from('accreditation_criteria').select('code,category').limit(1);
  if(catErr) console.log('category column absent (expected):', catErr.code, catErr.message);
  else console.log('WARNING: category column still exists:', catCheck);

  // 2. All 22 criteria with area_id, code, required_count
  console.log('\n=== 2. accreditation_criteria (all 22) ===');
  const {data:crits, error:ce} = await s.from('accreditation_criteria')
    .select('code,title,area_id,required_count,expected_document_type,weight')
    .order('code');
  if(ce) console.error(ce); else console.log(JSON.stringify(crits,null,2));

  // 3. Programs
  console.log('\n=== 3. programs ===');
  const {data:progs, error:pe} = await s.from('programs').select('*');
  if(pe) console.error(pe); else console.log(JSON.stringify(progs,null,2));

  // 4. program_accreditation_status (if table exists)
  console.log('\n=== 4. program_accreditation_status ===');
  const {data:pas, error:pase} = await s.from('program_accreditation_status').select('*');
  if(pase) console.log('table error:', pase.code, pase.message);
  else console.log(JSON.stringify(pas,null,2));

  // 5. accreditation_cycles - columns and all rows
  console.log('\n=== 5. accreditation_cycles ===');
  const {data:cycles, error:cyce} = await s.from('accreditation_cycles').select('*').limit(20);
  if(cyce) console.log('cycles error:', cyce.code, cyce.message);
  else console.log(JSON.stringify(cycles,null,2));

  // 6. accreditation_recommendations - columns and all rows
  console.log('\n=== 6. accreditation_recommendations ===');
  const {data:recs, error:rece} = await s.from('accreditation_recommendations').select('*').limit(20);
  if(rece) console.log('recommendations error:', rece.code, rece.message);
  else console.log(JSON.stringify(recs,null,2));

  // 7. All tables with row counts for Phase 1 planning
  console.log('\n=== 7. Row counts (tables to be cleared) ===');
  const tables = ['evidence_documents','readiness_scores','simulations','area_assignments','audit_log','accreditation_recommendations','accreditation_cycles','users'];
  for(const t of tables) {
    const {count, error} = await s.from(t).select('*', {count:'exact', head:true});
    if(error) console.log(`  ${t}: ERROR ${error.code} ${error.message}`);
    else console.log(`  ${t}: ${count} rows`);
  }

  // 8. Users
  console.log('\n=== 8. public.users ===');
  const {data:users, error:ue} = await s.from('users').select('id,role,is_active,created_at').order('created_at');
  if(ue) console.error(ue); else console.log(JSON.stringify(users,null,2));

  // 9. accreditation_levels
  console.log('\n=== 9. accreditation_levels ===');
  const {data:lvls, error:le} = await s.from('accreditation_levels').select('*').order('level_number');
  if(le) console.error(le); else console.log(JSON.stringify(lvls,null,2));
}
run().catch(console.error);

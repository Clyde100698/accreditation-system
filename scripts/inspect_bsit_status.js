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
  const { data: progs } = await supabase.from('programs').select('*');
  console.log('Programs:', progs);

  const { data: cycles } = await supabase.from('accreditation_cycles').select('*');
  console.log('\nCycles:', cycles);

  const { data: bscsScores } = await supabase.from('readiness_scores').select('id, criterion_id, score, status, program_id').eq('program_id', progs.find(p => p.code === 'BSCS').id);
  console.log(`\nBSCS Scores in DB: ${bscsScores ? bscsScores.length : 0}`);

  const bsitProg = progs.find(p => p.code === 'BSIT');
  const { data: bsitScores } = await supabase.from('readiness_scores').select('id, criterion_id, score, status, program_id').eq('program_id', bsitProg.id);
  console.log(`BSIT Scores in DB: ${bsitScores ? bsitScores.length : 0}`);

  const { data: bscsDocs } = await supabase.from('evidence_documents').select('id', { count: 'exact', head: true }).eq('program_id', progs.find(p => p.code === 'BSCS').id);
  const { count: bscsDocsCount } = await supabase.from('evidence_documents').select('*', { count: 'exact', head: true }).eq('program_id', progs.find(p => p.code === 'BSCS').id);
  const { count: bsitDocsCount } = await supabase.from('evidence_documents').select('*', { count: 'exact', head: true }).eq('program_id', bsitProg.id);
  console.log(`BSCS Evidence docs: ${bscsDocsCount}`);
  console.log(`BSIT Evidence docs: ${bsitDocsCount}`);
}

main().catch(console.error);


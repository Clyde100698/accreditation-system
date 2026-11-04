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
  const { data: progs } = await supabase.from('programs').select('*').order('code');
  const { data: areas } = await supabase.from('accreditation_areas').select('*').order('display_order');
  const { data: criteria } = await supabase.from('accreditation_criteria').select('*');
  const { data: allScores } = await supabase.from('readiness_scores').select('*');
  const { data: allDocs } = await supabase.from('evidence_documents').select('id, status, program_id');

  console.log('========================================================');
  console.log('PROGRAM COMPARISON IN LIVE DATABASE (SUPABASE)');
  console.log('========================================================');

  for (const prog of progs) {
    const scores = allScores.filter(s => s.program_id === prog.id);
    const docs = allDocs.filter(d => d.program_id === prog.id);
    const verified = docs.filter(d => d.status === 'verified').length;
    const pending = docs.filter(d => d.status === 'pending').length;

    console.log(`\nPROGRAM: ${prog.code} - ${prog.name}`);
    console.log(`- Total Criteria with Scores: ${scores.length} / 79`);
    console.log(`- Evidence Documents: ${docs.length} total (${verified} verified, ${pending} pending)`);

    let weightedSum = 0;
    let totalWeight = 0;
    console.log('- Area Breakdown:');
    for (const a of areas) {
      const critsInArea = criteria.filter(c => c.area_id === a.id);
      const scoresInArea = scores.filter(s => critsInArea.some(c => c.id === s.criterion_id));
      const mean = scoresInArea.reduce((sum, s) => sum + s.score, 0) / (scoresInArea.length || 1);
      const weight = a.weight || 3.0;
      weightedSum += mean * weight;
      totalWeight += weight;
      console.log(`    ${a.code || a.name}: Mean = ${mean.toFixed(2)} (weight ${weight})`);
    }

    const grandMean = weightedSum / totalWeight;
    console.log(`>>> WEIGHTED GRAND MEAN: ${grandMean.toFixed(2)} / 5.00 <<<`);
  }
}

main().catch(console.error);


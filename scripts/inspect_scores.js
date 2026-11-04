const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const env = fs.readFileSync('.env.local', 'utf8');
const envVars = Object.fromEntries(
  env.split(/\r?\n/)
    .filter(line => line.includes('=') && !line.startsWith('#'))
    .map(line => {
      const idx = line.indexOf('=');
      return [line.slice(0, idx).trim(), line.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '')];
    })
);

const supabase = createClient(envVars.NEXT_PUBLIC_SUPABASE_URL, envVars.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  const { data: progs } = await supabase.from('programs').select('*').order('code');
  console.log('Programs:', progs.map(p => ({ id: p.id, code: p.code })));

  const bscs = progs.find(p => p.code === 'BSCS') || progs[0];
  console.log('Testing for Program:', bscs.code, bscs.id);

  const { data: scores } = await supabase
    .from('readiness_scores')
    .select('*, accreditation_criteria(*, accreditation_areas(*))')
    .eq('program_id', bscs.id);

  console.log(`Fetched ${scores ? scores.length : 0} scores.`);

  // Group by Area
  const areaMap = new Map();
  for (const s of (scores || [])) {
    const area = s.accreditation_criteria?.accreditation_areas;
    const areaId = area?.id || 'unknown';
    const areaCode = area?.code || 'Unknown';
    const areaWeight = area?.weight || 1;
    if (!areaMap.has(areaCode)) {
      areaMap.set(areaCode, { code: areaCode, weight: areaWeight, scores: [], criteria: [] });
    }
    areaMap.get(areaCode).scores.push(s.score);
    areaMap.get(areaCode).criteria.push({
      id: s.criterion_id,
      code: s.accreditation_criteria?.code,
      title: s.accreditation_criteria?.title,
      score: s.score,
      status: s.status
    });
  }

  let totalWeight = 0;
  let weightedSum = 0;
  console.log('\n--- AREA BREAKDOWN ---');
  for (const [code, grp] of areaMap.entries()) {
    const mean = grp.scores.reduce((a, b) => a + b, 0) / grp.scores.length;
    totalWeight += grp.weight;
    weightedSum += mean * grp.weight;
    console.log(`${code} (Weight ${grp.weight}): Mean = ${mean.toFixed(2)}, Count = ${grp.scores.length}`);
  }

  const baseline = weightedSum / totalWeight;
  console.log(`\nOverall Baseline: ${baseline.toFixed(2)} / 5 (Weighted sum: ${weightedSum.toFixed(2)}, Total weight: ${totalWeight})`);

  // Print all unresolved criteria
  console.log('\n--- UNRESOLVED CRITERIA (score < 3 or status no_evidence/weak) ---');
  for (const [code, grp] of areaMap.entries()) {
    const unresolved = grp.criteria.filter(c => c.score < 3 || ['no_evidence', 'weak'].includes(c.status));
    if (unresolved.length > 0) {
      console.log(`${code}:`);
      for (const u of unresolved) {
        console.log(`  - [${u.code}] ${u.title}: Score=${u.score}, Status=${u.status}`);
      }
    }
  }
}

main().catch(console.error);


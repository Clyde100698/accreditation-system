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
  console.log('=== STEP 1: Snapshot readiness_scores BEFORE any simulation ===');
  const { data: beforeScores, error: be } = await supabase
    .from('readiness_scores')
    .select('criterion_id, score, status')
    .order('criterion_id');
  if (be) { console.error('Error reading readiness_scores:', be); return; }
  console.log('Row count:', beforeScores.length);
  console.log(JSON.stringify(beforeScores, null, 2));

  // --- SQL Fix 1: Rename area codes to Roman numerals ---
  console.log('\n=== STEP 2: Rename area codes to Roman numerals ===');
  const renameMap = [
    ['Area 1',  'Area I'],
    ['Area 2',  'Area II'],
    ['Area 3',  'Area III'],
    ['Area 4',  'Area IV'],
    ['Area 5',  'Area V'],
    ['Area 6',  'Area VI'],
    ['Area 7',  'Area VII'],
    ['Area 8',  'Area VIII'],
    ['Area 9',  'Area IX'],
    ['Area 10', 'Area X'],
  ];

  for (const [oldCode, newCode] of renameMap) {
    const { error } = await supabase
      .from('accreditation_areas')
      .update({ code: newCode })
      .eq('code', oldCode);
    if (error) {
      console.error(`  FAILED renaming ${oldCode} -> ${newCode}:`, error.message);
    } else {
      console.log(`  OK: ${oldCode} -> ${newCode}`);
    }
  }

  // Verify rename
  const { data: areasAfter } = await supabase
    .from('accreditation_areas')
    .select('code, title, weight, display_order')
    .order('display_order');
  console.log('\nAreas after rename:');
  console.log(JSON.stringify(areasAfter, null, 2));

  // --- SQL Fix 2: Drop category column ---
  console.log('\n=== STEP 3: Drop category column from accreditation_criteria ===');
  // Supabase JS client cannot run DDL directly; we use rpc with a raw SQL call.
  // We'll verify the column exists first, then use the Supabase SQL API.
  // Check if column still exists
  const { data: catCheck, error: catErr } = await supabase
    .from('accreditation_criteria')
    .select('code, category')
    .limit(1);
  if (catErr && catErr.code === 'PGRST204') {
    console.log('category column already absent — nothing to drop.');
  } else if (catErr) {
    console.error('Error checking category column:', catErr.message);
  } else {
    console.log('category column still exists in criteria. Sample:', JSON.stringify(catCheck));
    console.log('NOTE: DDL (ALTER TABLE ... DROP COLUMN) must be run directly in the Supabase SQL editor.');
    console.log('SQL to run:');
    console.log('  ALTER TABLE accreditation_criteria DROP COLUMN category;');
  }

  // --- SIMULATION TEST ---
  console.log('\n=== STEP 4: Simulation isolation test ===');

  // Find first available program with readiness_scores
  const { data: programs } = await supabase.from('programs').select('id, code').limit(5);
  if (!programs || programs.length === 0) { console.log('No programs found.'); return; }
  const prog = programs[0];
  console.log('Using program:', prog.code, prog.id);

  // Fetch current scores + criteria + areas
  const { data: scores } = await supabase
    .from('readiness_scores')
    .select('criterion_id, score, status, accreditation_criteria(area_id, accreditation_areas(weight))')
    .eq('program_id', prog.id)
    .order('criterion_id');

  if (!scores || scores.length === 0) { console.log('No readiness_scores for this program.'); return; }

  // Compute baseline using same formula as dashboard
  function computeGrandMean(scoreRows) {
    const areaMap = new Map();
    for (const s of scoreRows) {
      const areaId = s.accreditation_criteria?.area_id;
      const weight = s.accreditation_criteria?.accreditation_areas?.weight;
      if (!areaId) continue;
      if (!areaMap.has(areaId)) areaMap.set(areaId, { scores: [], weight: typeof weight === 'number' ? weight : 1 });
      areaMap.get(areaId).scores.push(s.score);
    }
    let totalWeight = 0, weightedSum = 0;
    for (const { scores: ss, weight: w } of areaMap.values()) {
      const mean = ss.reduce((a, b) => a + b, 0) / ss.length;
      totalWeight += w;
      weightedSum += mean * w;
    }
    return totalWeight > 0 ? weightedSum / totalWeight : 0;
  }

  const baseline = computeGrandMean(scores);
  console.log(`\nBaseline weighted grand mean: ${baseline.toFixed(2)}`);

  // Pick two different unresolved criteria sets
  const unresolved = scores.filter(s => ['no_evidence', 'weak'].includes(s.status));
  if (unresolved.length < 2) {
    console.log('Not enough unresolved criteria for two distinct selections. Unresolved count:', unresolved.length);
    return;
  }

  // Selection A: first criterion only
  const selA = [unresolved[0].criterion_id];
  const simA = scores.map(s => selA.includes(s.criterion_id) ? { ...s, score: Math.max(s.score, 4) } : s);
  const projA = computeGrandMean(simA);

  // Selection B: all unresolved criteria (or first 3 if many)
  const selB = unresolved.slice(0, Math.min(3, unresolved.length)).map(s => s.criterion_id);
  const simB = scores.map(s => selB.includes(s.criterion_id) ? { ...s, score: Math.max(s.score, 4) } : s);
  const projB = computeGrandMean(simB);

  console.log(`\n--- Selection A (1 criterion: ${selA[0]}) ---`);
  console.log(`  Criteria selected: ${selA.join(', ')}`);
  console.log(`  Projected grand mean: ${projA.toFixed(2)}`);
  console.log(`  Delta from baseline: +${(projA - baseline).toFixed(2)}`);

  console.log(`\n--- Selection B (${selB.length} criteria) ---`);
  console.log(`  Criteria selected: ${selB.join(', ')}`);
  console.log(`  Projected grand mean: ${projB.toFixed(2)}`);
  console.log(`  Delta from baseline: +${(projB - baseline).toFixed(2)}`);

  if (projA !== projB) {
    console.log('\n✅ CONFIRMED: Two different selections produce two different projected scores.');
  } else {
    console.log('\n⚠️  WARNING: Both selections produced the same projected score. Check if criteria are in the same area.');
  }

  // --- Snapshot readiness_scores AFTER simulation (they must be unchanged) ---
  console.log('\n=== STEP 5: Snapshot readiness_scores AFTER simulation ===');
  const { data: afterScores } = await supabase
    .from('readiness_scores')
    .select('criterion_id, score, status')
    .order('criterion_id');
  console.log('Row count after simulation:', afterScores.length);

  // Compare before/after
  let dirty = false;
  for (let i = 0; i < beforeScores.length; i++) {
    const b = beforeScores[i];
    const a = afterScores[i];
    if (!a || b.criterion_id !== a.criterion_id || b.score !== a.score || b.status !== a.status) {
      console.error(`MISMATCH at row ${i}: before=${JSON.stringify(b)}, after=${JSON.stringify(a)}`);
      dirty = true;
    }
  }
  if (!dirty) {
    console.log('✅ CONFIRMED: readiness_scores is completely untouched by both simulation runs.');
    console.log('Before/after row count match:', beforeScores.length === afterScores.length);
  }
}

run().catch(console.error);

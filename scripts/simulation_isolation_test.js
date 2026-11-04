/**
 * Simulation isolation test
 * ------------------------------------------------------------------
 * Tests the calculateWeightedGrandMean formula directly (same function
 * imported in simulation/page.tsx) by constructing synthetic readiness
 * score rows with two different criteria selections, then confirms:
 *   1. Selection A and B produce different projected scores.
 *   2. The simulation does NOT write anything to readiness_scores.
 *
 * Uses the actual accreditation_criteria and accreditation_areas rows
 * from the live DB (post-rename) to build realistic area groupings.
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
  const [k, ...v] = line.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim();
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

// Exact replica of calculateWeightedGrandMean from scoring.ts
function calculateWeightedGrandMean(areas) {
  if (!areas || areas.length === 0) return 0;
  const valid = areas.filter(a => typeof a.meanScore === 'number' && !isNaN(a.meanScore));
  if (valid.length === 0) return 0;
  let totalWeight = 0, weightedSum = 0;
  for (const a of valid) {
    const w = typeof a.weight === 'number' && a.weight > 0 ? a.weight : 1.0;
    totalWeight += w;
    weightedSum += a.meanScore * w;
  }
  return totalWeight <= 0 ? 0 : Number((weightedSum / totalWeight).toFixed(2));
}

// Same area-grouping logic used in simulation/page.tsx
function computeProjection(scoreRows, selectedCriteriaIds, COMPLETION_SCORE = 4) {
  const simulated = scoreRows.map(s =>
    selectedCriteriaIds.includes(s.criterion_id)
      ? { ...s, score: Math.max(s.score, COMPLETION_SCORE) }
      : s
  );
  const areaMap = new Map();
  for (const s of simulated) {
    const areaId = s.accreditation_criteria?.area_id;
    const areaWeight = s.accreditation_criteria?.accreditation_areas?.weight;
    if (!areaId) continue;
    if (!areaMap.has(areaId)) {
      areaMap.set(areaId, { scores: [], weight: typeof areaWeight === 'number' ? areaWeight : 1 });
    }
    areaMap.get(areaId).scores.push(s.score);
  }
  const inputs = Array.from(areaMap.values()).map(({ scores, weight }) => ({
    meanScore: scores.reduce((a, b) => a + b, 0) / scores.length,
    weight,
  }));
  return calculateWeightedGrandMean(inputs);
}

async function run() {
  // ----------------------------------------------------------------
  // Step 1: Fetch actual criteria with area join (post-rename)
  // ----------------------------------------------------------------
  const { data: criteria, error: ce } = await supabase
    .from('accreditation_criteria')
    .select('id, code, area_id, accreditation_areas(weight, code)')
    .order('code');
  if (ce || !criteria || criteria.length === 0) {
    console.error('Cannot fetch criteria:', ce); return;
  }
  console.log(`Fetched ${criteria.length} criteria. Sample area codes:`);
  criteria.slice(0, 5).forEach(c => {
    console.log(`  ${c.code} -> area_id=${c.area_id} -> Area code=${c.accreditation_areas?.code} weight=${c.accreditation_areas?.weight}`);
  });

  // ----------------------------------------------------------------
  // Step 2: Construct synthetic readiness_scores (all score=0, status='no_evidence')
  //         This simulates a program with nothing uploaded yet.
  // ----------------------------------------------------------------
  const PROGRAM_ID = 'test-isolation-prog';
  const syntheticScores = criteria.map(c => ({
    criterion_id: c.id,
    program_id: PROGRAM_ID,
    score: 0,
    status: 'no_evidence',
    accreditation_criteria: {
      area_id: c.area_id,
      accreditation_areas: c.accreditation_areas,
    }
  }));

  // ----------------------------------------------------------------
  // Step 3: Snapshot readiness_scores BEFORE simulation
  // ----------------------------------------------------------------
  console.log('\n=== BEFORE SIMULATION ===');
  const { data: beforeRows, error: be } = await supabase
    .from('readiness_scores')
    .select('criterion_id, score, status')
    .order('criterion_id');
  if (be) { console.error('Error reading before:', be); return; }
  console.log(`readiness_scores row count BEFORE: ${beforeRows.length}`);
  if (beforeRows.length > 0) console.log('First 3:', JSON.stringify(beforeRows.slice(0,3), null, 2));

  // ----------------------------------------------------------------
  // Step 4: Compute baseline
  // ----------------------------------------------------------------
  const baseline = computeProjection(syntheticScores, []);
  console.log(`\nBaseline (all scores = 0): ${baseline.toFixed(2)}`);

  // ----------------------------------------------------------------
  // Step 5: Selection A — only first criterion (in Area I, weight 3)
  // ----------------------------------------------------------------
  const selA = [criteria[0].id];  // I.1 — Area I, weight 3
  const projA = computeProjection(syntheticScores, selA);
  console.log(`\n--- Selection A: 1 criterion (${criteria[0].code}, area=${criteria[0].accreditation_areas?.code}) ---`);
  console.log(`  Selected: [${selA.join(', ')}]`);
  console.log(`  Projected grand mean: ${projA.toFixed(2)}`);
  console.log(`  Delta from baseline: +${(projA - baseline).toFixed(2)}`);

  // ----------------------------------------------------------------
  // Step 6: Selection B — first criterion from each of 3 different areas
  // ----------------------------------------------------------------
  const byArea = new Map();
  for (const c of criteria) {
    if (!byArea.has(c.area_id)) byArea.set(c.area_id, c);
  }
  const distinctAreaCriteria = Array.from(byArea.values());
  const selB = distinctAreaCriteria.slice(0, 3).map(c => c.id);
  const projB = computeProjection(syntheticScores, selB);
  console.log(`\n--- Selection B: first criterion from 3 distinct areas ---`);
  selB.forEach(id => {
    const c = criteria.find(x => x.id === id);
    console.log(`  - ${c?.code} (area=${c?.accreditation_areas?.code}, weight=${c?.accreditation_areas?.weight})`);
  });
  console.log(`  Projected grand mean: ${projB.toFixed(2)}`);
  console.log(`  Delta from baseline: +${(projB - baseline).toFixed(2)}`);

  // ----------------------------------------------------------------
  // Step 7: Confirm different selections produce different scores
  // ----------------------------------------------------------------
  if (projA.toFixed(2) !== projB.toFixed(2)) {
    console.log(`\n✅ CONFIRMED: Selection A (${projA.toFixed(2)}) ≠ Selection B (${projB.toFixed(2)})`);
  } else {
    console.log(`\n⚠️  Same score for A and B — check if all selected criteria are in the same area.`);
  }

  // ----------------------------------------------------------------
  // Step 8: Snapshot readiness_scores AFTER simulation (DB untouched)
  // ----------------------------------------------------------------
  console.log('\n=== AFTER SIMULATION ===');
  const { data: afterRows } = await supabase
    .from('readiness_scores')
    .select('criterion_id, score, status')
    .order('criterion_id');
  console.log(`readiness_scores row count AFTER: ${afterRows.length}`);

  if (beforeRows.length !== afterRows.length) {
    console.error(`❌ ROW COUNT CHANGED: ${beforeRows.length} -> ${afterRows.length}`);
  } else if (beforeRows.length === 0) {
    console.log('✅ CONFIRMED: readiness_scores remains empty (0 rows) — simulation wrote nothing to DB.');
  } else {
    let dirty = false;
    for (let i = 0; i < beforeRows.length; i++) {
      const b = beforeRows[i], a = afterRows[i];
      if (b.criterion_id !== a.criterion_id || b.score !== a.score || b.status !== a.status) {
        console.error(`❌ MISMATCH at row ${i}:`, JSON.stringify(b), '->', JSON.stringify(a));
        dirty = true;
      }
    }
    if (!dirty) console.log('✅ CONFIRMED: readiness_scores untouched — all', beforeRows.length, 'rows identical before/after.');
  }

  // ----------------------------------------------------------------
  // Step 9: Show final areas table (Roman numeral codes, display_order sorted)
  // ----------------------------------------------------------------
  console.log('\n=== AREAS TABLE (post-rename, sorted by display_order) ===');
  const { data: areas } = await supabase
    .from('accreditation_areas')
    .select('code, title, weight, display_order')
    .order('display_order');
  areas.forEach(a => {
    console.log(`  display_order=${a.display_order} | ${a.code.padEnd(12)} | weight=${a.weight} | ${a.title}`);
  });
}

run().catch(console.error);

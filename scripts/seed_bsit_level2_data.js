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

const BSIT_PROG_ID = '92ec3ae6-da28-4770-b08d-2d202b244fb9';

// Area target score profiles for realistic PACUCOA Level II
const AREA_TARGET_PROFILES = {
  1: { base: 3.80, variance: 0.15 },  // Philosophy: ~3.80
  2: { base: 3.92, variance: 0.12 },  // Faculty: ~3.92
  3: { base: 3.88, variance: 0.10 },  // Instruction: ~3.88
  4: { base: 3.76, variance: 0.14 },  // Laboratories: ~3.76 (well above 3.50 floor!)
  5: { base: 3.65, variance: 0.12 },  // Research: ~3.65 (clears 3.50 floor!)
  6: { base: 3.82, variance: 0.10 },  // Extension: ~3.82
  7: { base: 3.72, variance: 0.15 },  // Student Services: ~3.72 (clears 3.50 floor!)
  8: { base: 4.25, variance: 0.18 },  // Administration: ~4.25
  9: { base: 4.08, variance: 0.12 },  // Physical Plant: ~4.08
  10: { base: 3.85, variance: 0.15 }  // Library: ~3.85
};

async function main() {
  console.log('=== SEEDING REALISTIC LEVEL II ACCREDITATION DATA FOR BSIT ===');

  // 1. Fetch Areas and Criteria
  const { data: areas, error: aErr } = await supabase.from('accreditation_areas').select('*').order('display_order');
  if (aErr) throw aErr;
  const { data: criteria, error: cErr } = await supabase.from('accreditation_criteria').select('*').order('code');
  if (cErr) throw cErr;

  console.log(`Found ${areas.length} areas and ${criteria.length} criteria in framework.`);

  // Map areas by ID
  const areaMap = {};
  areas.forEach((a, idx) => {
    areaMap[a.id] = { ...a, areaNum: idx + 1 };
  });

  // 2. Prepare 79 Level II Readiness Scores for BSIT
  const scoresToUpsert = [];
  let critIndexInArea = {};

  criteria.forEach((c) => {
    const areaInfo = areaMap[c.area_id];
    const areaNum = areaInfo ? areaInfo.areaNum : 1;
    critIndexInArea[areaNum] = (critIndexInArea[areaNum] || 0) + 1;
    const profile = AREA_TARGET_PROFILES[areaNum] || { base: 3.80, variance: 0.10 };

    // Deterministic realistic variance so numbers look natural and authentic
    const offset = Math.sin(critIndexInArea[areaNum] * 1.5) * profile.variance;
    let score = Math.round((profile.base + offset) * 100) / 100;
    // Guarantee Level II compliance (must be >= 3.50)
    if (score < 3.50) score = 3.55;
    if (score > 5.00) score = 5.00;

    scoresToUpsert.push({
      criterion_id: c.id,
      program_id: BSIT_PROG_ID,
      score: score,
      status: 'sufficient',
      last_computed_at: new Date().toISOString()
    });
  });

  console.log(`\nGenerated ${scoresToUpsert.length} Level II scores for BSIT.`);

  // Delete any existing BSIT scores first to ensure clean state
  const { error: delErr } = await supabase
    .from('readiness_scores')
    .delete()
    .eq('program_id', BSIT_PROG_ID);
  if (delErr) console.warn('Warning during delete:', delErr.message);

  // Insert in batches of 50
  for (let i = 0; i < scoresToUpsert.length; i += 50) {
    const batch = scoresToUpsert.slice(i, i + 50);
    const { error: insErr } = await supabase.from('readiness_scores').insert(batch);
    if (insErr) throw insErr;
  }
  console.log(`Successfully seeded ${scoresToUpsert.length} scores for BSIT in 'readiness_scores'!`);

  // 3. Seed Realistic Evidence Documents for BSIT
  const bsitHead = 'd53146c1-d17c-4d45-8e6b-5b68749f9a34';
  const bsitFac1 = 'd468a55b-5ffa-4bde-82ca-d841001c1dbd';
  const bsitFac2 = '95a5b0d4-038c-4b7c-ba69-f6ddfc652956';
  const bsitFac3 = '03937615-8795-4719-b364-60fff4a9f2e0';
  const qaUser = '9cf23626-ca3f-4252-a736-289fdbcfcb76';

  const docTypes = [
    'Curriculum Syllabus',
    'Faculty 201 File',
    'Laboratory Inventory',
    'Research Publication',
    'Community Extension MoA',
    'Student Guidance Record',
    'Administrative Manual',
    'Physical Plant Inspection',
    'Library Acquisition Log'
  ];

  const evidenceToInsert = [];
  let totalDocs = 0;

  criteria.forEach((c, idx) => {
    // 2 to 3 documents per criterion (Level II accredited program)
    const docsForCrit = (idx % 2 === 0) ? 3 : 2;
    for (let d = 1; d <= docsForCrit; d++) {
      totalDocs++;
      const isPending = totalDocs % 35 === 0; // 6 pending documents total, remainder verified
      const uploader = (d === 1) ? bsitFac1 : (d === 2 ? bsitFac2 : bsitFac3);
      const verifier = isPending ? null : (idx % 2 === 0 ? bsitHead : qaUser);
      const docType = docTypes[idx % docTypes.length];

      evidenceToInsert.push({
        criterion_id: c.id,
        uploaded_by: uploader,
        program_id: BSIT_PROG_ID,
        file_url: `https://svcsxskcyxfdcwxpfqna.supabase.co/storage/v1/object/public/evidence/bsit/area_${c.area_id}/${c.code}_Exhibit_${d}.pdf`,
        document_type: docType,
        effective_date: '2025-08-15',
        version: 1,
        status: isPending ? 'pending' : 'verified',
        verified_by: verifier,
        verified_at: isPending ? null : new Date(Date.now() - (idx * 3600000)).toISOString(),
        uploaded_at: new Date(Date.now() - (idx * 7200000)).toISOString(),
        reviewer_notes: JSON.stringify({
          program: 'BSIT',
          criterion: c.code,
          documentTitle: `BSIT ${c.code} Exhibit #${d} - ${c.title || docType}`,
          verifiedBy: isPending ? 'Awaiting verification' : 'Verified by Department Head'
        })
      });
    }
  });

  // Delete existing BSIT evidence
  await supabase.from('evidence_documents').delete().eq('program_id', BSIT_PROG_ID);

  for (let i = 0; i < evidenceToInsert.length; i += 50) {
    const batch = evidenceToInsert.slice(i, i + 50);
    const { error: insDocErr } = await supabase.from('evidence_documents').insert(batch);
    if (insDocErr) throw insDocErr;
  }

  const verifiedCount = evidenceToInsert.filter(e => e.status === 'verified').length;
  const pendingCount = evidenceToInsert.filter(e => e.status === 'pending').length;
  console.log(`Successfully seeded ${evidenceToInsert.length} BSIT exhibits (${verifiedCount} verified, ${pendingCount} pending)!`);

  // 4. Verify Area Averages and Weighted Grand Mean
  console.log('\n=== VERIFYING COMPUTED BSIT LEVEL II SCORES ===');
  let weightedSum = 0;
  let totalWeight = 0;

  for (const a of areas) {
    const critInArea = criteria.filter(c => c.area_id === a.id);
    const scoresInArea = scoresToUpsert.filter(s => critInArea.some(c => c.id === s.criterion_id));
    const areaMean = scoresInArea.reduce((sum, s) => sum + s.score, 0) / (scoresInArea.length || 1);
    const weight = a.weight || 3;
    weightedSum += areaMean * weight;
    totalWeight += weight;
    console.log(`Area ${a.code || a.name}: Mean = ${areaMean.toFixed(2)} (weight ${weight}) -> Level II Floor: ${areaMean >= 3.50 ? 'PASS [OK]' : 'FAIL [X]'}`);
  }

  const grandMean = weightedSum / totalWeight;
  console.log(`\n>>> BSIT WEIGHTED GRAND MEAN: ${grandMean.toFixed(2)} / 5.00 <<<`);
  console.log(`Status: ${grandMean >= 3.50 ? 'LEVEL II RE-ACCREDITATION COMPLIANT (ALL AREAS >= 3.50)' : 'BELOW LEVEL II'}`);
}

main().catch(console.error);

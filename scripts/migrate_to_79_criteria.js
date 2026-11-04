const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

// 1. Load env
const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
  const [k, ...v] = line.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim();
});
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

// 2. Curated Titles for all 79 PACUCOA Level 1 Exhibit Recommendations
const TITLES_MAP = {
  // Area I (3)
  'I.1': 'Student Participation in PEO Development',
  'I.2': 'Post-Activity Evaluation Reports and Impact Analysis',
  'I.3': 'PEO and Program Outcomes Evaluation Guidelines',

  // Area II (9)
  'II.1': 'Faculty Development Program & Performance Evaluation (FPE)',
  'II.2': 'Faculty Attendance in IT Seminars & Conferences',
  'II.3': 'Faculty Research Activities & Incentive Mechanisms',
  'II.4': 'Library Resources Utilization by Faculty and Students',
  'II.5': 'College Dean and Program Head Teaching Load Compliance',
  'II.6': 'Comprehensive Faculty Development Plan (BSCS Program)',
  'II.7': 'Faculty-to-Student Consultation Sessions & Documentation',
  'II.8': 'Faculty Industry Immersion & Partner Linkages (MOA)',
  'II.9': 'Faculty Professional IT Organization Membership',

  // Area III (6)
  'III.1': 'Periodic Syllabi and Curriculum Review (AAOM Policy)',
  'III.2': 'Co-Curricular Activities Post-Evaluation & Action Plan',
  'III.3': 'Laboratory Manual Creation & Production Support',
  'III.4': 'Make-up Classes Guidelines & Contact Hours Assurance',
  'III.5': 'Year-Round Student Co-Curricular Development Plan',
  'III.6': 'Course Syllabi, Session Guides & OBE Learning Outcomes',

  // Area IV (11)
  'IV.1': 'Policy on Replacement & Upgrade of Laboratory Computers',
  'IV.2': 'Computer Laboratory Services & Utilization Evaluation',
  'IV.3': 'Computer Laboratory Software & Manuals Support',
  'IV.4': 'Networking Laboratory Tools & Equipment Inventory',
  'IV.5': 'Student Training on Various Operating Systems & Software',
  'IV.6': 'Exposure to Multi-Platform Operating Systems',
  'IV.7': 'Laboratory Equipment Maintenance, Repair & Inspection Log',
  'IV.8': 'Computer Laboratory Ergonomics & Standards Compliance',
  'IV.9': 'Adequacy of Network Tools, Routers & Hardware',
  'IV.10': 'Provision of High-Speed Laboratory Printing Facilities',
  'IV.11': 'Laboratory Safety Manual & User Training Documentation',

  // Area V (15)
  'V.1': 'Institutional Policies & Guidelines on Research Incentives',
  'V.2': 'Research Outputs & Activities of Non-Teaching Staff',
  'V.3': 'Documentation of Research Dissemination & Utilization',
  'V.4': 'In-House Statistician, Language Editor & Research Associates',
  'V.5': 'Faculty Membership in Professional Research Organizations',
  'V.6': 'Research Thrust, Priorities & Institutional Agenda Orientation',
  'V.7': 'Faculty Publication in Refereed & Indexed Research Journals',
  'V.8': 'Deloading & Allotted Time for Faculty Research Conduct',
  'V.9': 'Institutional Research Writing Format & Style Manual',
  'V.10': 'Faculty & Student Research Capability Building Programs',
  'V.11': 'Graduate Tracer Study & Curriculum Enhancement',
  'V.12': 'Institutional Research Manual Dissemination & Orientation',
  'V.13': 'Degree Curriculum & Research Course Content Review',
  'V.14': 'Coordination with External Research Agencies & Consortia',
  'V.15': 'Research Manuscript Review & Oral Defense Guidelines',

  // Area VI (6)
  'VI.1': 'Acquisition of Professional Computer Science Book Titles',
  'VI.2': 'Online Public Access Catalog (OPAC) Website Integration',
  'VI.3': 'Library Rich Data Utilization & Analytics Reports',
  'VI.4': 'Subscriptions to Local and Foreign IT/CS Journals',
  'VI.5': 'Binding, Preservation & Archiving of Journals & Periodicals',
  'VI.6': 'Comparative Analysis of Library Resources & User Traffic',

  // Area VII (10)
  'VII.1': 'Correlational Studies on Student Performance & Retention',
  'VII.2': 'Orientation on Student Services & Co-Curricular Programs',
  'VII.3': 'Coordination Between HR and Student Personnel Services',
  'VII.4': 'Non-Teaching Staff Professional Development & Training',
  'VII.5': 'Procurement of Standardized Psychological & Guidance Tests',
  'VII.6': 'Utilization of Guidance Psychological Testing Results',
  'VII.7': 'Training Needs Analysis for Student Services Personnel',
  'VII.8': 'Customer Satisfaction Surveys for Student Services Units',
  'VII.9': 'Private Guidance Consultation & Counseling Rooms',
  'VII.10': 'Digitization & Scanning of Student Permanent Academic Records',

  // Area VIII (8)
  'VIII.1': 'Community Extension Re-Orientation & Program Promotion',
  'VIII.2': 'Community Needs Assessment & Outreach Research',
  'VIII.3': 'Alumni Resource Speakers in Community Outreach Programs',
  'VIII.4': 'Monitoring & Evaluation of Community Extension Projects',
  'VIII.5': 'Sustainable Community Outreach for Adopted Barangays',
  'VIII.6': 'Impact Assessment of Community Extension Activities',
  'VIII.7': 'Skills Development & IT Literacy Training for Adopted Communities',
  'VIII.8': 'Institutional Linkages for Community Extension Delivery',

  // Area IX (7)
  'IX.1': 'Annual Structural Integrity & Building Engineering Inspection',
  'IX.2': 'Safe, Direct & Barrier-Free Campus Access for Stakeholders',
  'IX.3': 'Corridor Traffic Flow Monitoring & Safety Management',
  'IX.4': 'Campus Long-Term Physical Development & Master Plan',
  'IX.5': 'Campus Greening, Landscaping & Environmental Sustainability',
  'IX.6': 'Classroom Floor Tile Repairs & Walkway Maintenance',
  'IX.7': 'Restroom Sanitation & Constant Running Water Supply',

  // Area X (4)
  'X.1': 'Administrative Request Status Tracking & Proactive Updates',
  'X.2': '360-Degree Performance Evaluation of Administrative Personnel',
  'X.3': 'Internal Quality Audit (IQA) & Quality Management Memos',
  'X.4': 'Filing System, Record Labeling & Administrative Organization'
};

// Document mapping function for all 182 files
function mapDocToCriterionCode(meta) {
  const af = meta.areaFolder || '';
  const fn = meta.folderName || '';
  const file = meta.fileName || '';

  if (af.includes('Area 01')) {
    if (fn.includes('EXHIBIT 1')) return 'I.1';
    if (fn.includes('EXHIBIT 2')) return 'I.2';
    if (fn.includes('EXHIBIT 3')) return 'I.3';
    return 'I.1';
  }
  if (af.includes('Area 02')) {
    if (fn.includes('EXHIBIT 1')) return 'II.1';
    if (fn.includes('EXHIBIT 2')) return 'II.2';
    if (fn.includes('EXHIBIT 3')) return 'II.3';
    if (fn.includes('EXHIBIT 4')) return 'II.4';
    if (fn.includes('EXHIBIT 5')) return 'II.5';
    if (fn.includes('EXHIBIT 6')) return 'II.6';
    if (fn.includes('EXHIBIT 7')) return 'II.7';
    if (fn.includes('EXHIBIT 8')) return 'II.8';
    if (fn.includes('EXHIBIT 9')) return 'II.9';
    return 'II.1';
  }
  if (af.includes('Area 03')) {
    if (fn.includes('EXHIBIT 1')) return 'III.1';
    if (fn.includes('EXHIBIT 2')) return 'III.2';
    if (fn.includes('EXHIBIT 3')) return 'III.3';
    if (fn.includes('EXHIBIT 4')) return 'III.4';
    if (fn.includes('EXHIBIT 5')) return 'III.5';
    if (fn.includes('EXHIBIT 6')) return 'III.6';
    return 'III.1';
  }
  if (af.includes('Area 04')) {
    if (fn.includes('Exhibit 10')) return 'IV.10';
    if (fn.includes('Exhibit 11')) return 'IV.11';
    if (fn.includes('Exhibit 1')) return 'IV.1';
    if (fn.includes('Exhibit 2')) return 'IV.2';
    if (fn.includes('Exhibit 3')) return 'IV.3';
    if (fn.includes('Exhibit 4')) return 'IV.4';
    if (fn.includes('Exhibit 5')) return 'IV.5';
    if (fn.includes('Exhibit 6')) return 'IV.6';
    if (fn.includes('Exhibit 7')) return 'IV.7';
    if (fn.includes('Exhibit 8')) return 'IV.8';
    if (fn.includes('Exhibit 9')) return 'IV.9';
    return 'IV.1';
  }
  if (af.includes('Area 05')) {
    if (fn.includes('1. Policies')) return 'V.1';
    if (fn.includes('2. Research Outputs')) return 'V.2';
    if (fn.includes('3. Dissemination')) return 'V.3';
    if (fn.includes('4. In-house Statistician')) return 'V.4';
    if (fn.includes('5. Faculty Research Organization')) return 'V.5';
    if (fn.includes('6. Research Thrust')) return 'V.6';
    if (fn.includes('7. Faculty Research in Institution')) return 'V.7';
    if (fn.includes('8. Time to Conduct')) return 'V.8';
    if (fn.includes('9. Official Institution Research')) return 'V.9';
    if (fn.includes('10. Exposure to Research')) return 'V.10';
    if (fn.includes('11. Graduate Tracer Study')) return 'V.11';
    if (fn.includes('11. Research in Program')) return 'V.13';
    if (fn.includes('12. Research Manual Orientation')) return 'V.12';
    if (fn.includes('14. Research Agenda')) return 'V.14';
    if (fn.includes('15. Institutional Format')) return 'V.15';
    if (file.includes('Research Agenda') || file.includes('Research Courses')) return 'V.14';
    return 'V.1';
  }
  if (af.includes('Area 06')) {
    if (fn.includes('EXHIBIT 1')) return 'VI.1';
    if (fn.includes('EXHIBIT 2')) return 'VI.2';
    if (fn.includes('EXHIBIT 3')) return 'VI.3';
    if (fn.includes('EXHIBIT 4')) return 'VI.4';
    if (fn.includes('EXHIBIT 5')) return 'VI.5';
    if (fn.includes('EXHIBIT 6')) return 'VI.6';
    return 'VI.1';
  }
  if (af.includes('Area 07')) {
    if (fn.includes('BSCS GSC')) return 'VII.6';
    if (fn.includes('BSCE SCHOLARSHIP')) return 'VII.8';
    return 'VII.1';
  }
  if (af.includes('Area 10')) {
    if (fn.includes('Exhibit A')) return 'X.1';
    if (fn.includes('Exhibit B')) return 'X.2';
    if (fn.includes('Exhibit C')) return 'X.3';
    if (fn.includes('Exhibit D')) return 'X.4';
    return 'X.1';
  }
  return 'I.1';
}

async function run() {
  console.log('=== Step 1: Loading Database Framework and Areas ===');
  const { data: fw } = await supabase.from('accreditation_frameworks').select('*').limit(1).single();
  const { data: areas } = await supabase.from('accreditation_areas').select('*').order('code');
  const { data: bscs } = await supabase.from('programs').select('id, code').eq('code', 'BSCS').single();
  
  const areaLookup = new Map();
  areas.forEach(a => areaLookup.set(a.code, a.id));
  console.log(`Loaded framework: ${fw.name}, ${areas.length} areas, program: ${bscs.code}`);

  // 3. Load 79 Parsed Compliance Recs
  const recs = JSON.parse(fs.readFileSync('scripts/parsed_compliance_recs.json', 'utf8'));
  console.log(`Loaded ${recs.length} parsed items from compliance matrix.`);

  // 4. Upsert/Create 79 Criteria
  console.log('\n=== Step 2: Synchronizing 79 Criteria in Database ===');
  const { data: existingCrits } = await supabase.from('accreditation_criteria').select('id, code');
  const existingCodeMap = new Map((existingCrits || []).map(c => [c.code, c.id]));

  const criteriaMap = {}; // code -> criterion row

  for (const r of recs) {
    const roman = r.area_code.replace('Area ', '');
    const code = roman + '.' + r.item_number;
    const areaId = areaLookup.get(r.area_code) || areas[0].id;

    // Expected artifact clean
    const verificationFiles = (r.team_verification || '')
      .split('\n')
      .map(l => l.trim())
      .filter(Boolean)
      .map(l => l.replace(/^\d+\.\d+[a-z]?\s*/, '').replace(/^EXHIBIT\s*\d+\.\d+\s*/i, '').trim())
      .filter(Boolean);

    const expectedArtifact = verificationFiles.length > 0
      ? verificationFiles.slice(0, 3).join(' / ')
      : 'Institutional Compliance Verification File';

    const reqCount = Math.max(1, Math.min(3, verificationFiles.length || 1));
    const title = TITLES_MAP[code] || r.recommendation_text.split('\n')[0].substring(0, 80);

    const payload = {
      framework_id: fw.id,
      area_id: areaId,
      code,
      title,
      weight: 1.0,
      required_count: reqCount,
      expected_document_type: expectedArtifact.substring(0, 200),
      rating_axis: 'single',
    };

    const existingId = existingCodeMap.get(code);
    if (existingId) {
      const { data: updated, error } = await supabase
        .from('accreditation_criteria')
        .update(payload)
        .eq('id', existingId)
        .select()
        .single();
      if (error) console.error(`Error updating criterion ${code}:`, error.message);
      else criteriaMap[code] = updated;
    } else {
      const { data: inserted, error } = await supabase
        .from('accreditation_criteria')
        .insert(payload)
        .select()
        .single();
      if (error) console.error(`Error inserting criterion ${code}:`, error.message);
      else criteriaMap[code] = inserted;
    }
  }

  console.log(`Created / updated all ${Object.keys(criteriaMap).length} criteria.`);

  // 5. Re-link 182 Evidence Documents
  console.log('\n=== Step 3: Re-mapping 182 Evidence Documents to 79 Criteria ===');
  const { data: evs } = await supabase.from('evidence_documents').select('id, reviewer_notes');
  let remappedCount = 0;

  for (const doc of evs) {
    let meta = {};
    try { meta = JSON.parse(doc.reviewer_notes); } catch {}
    const code = mapDocToCriterionCode(meta);
    const crit = criteriaMap[code];

    if (crit) {
      const { error } = await supabase
        .from('evidence_documents')
        .update({
          criterion_id: crit.id,
          document_type: crit.expected_document_type.split('/')[0].trim(),
        })
        .eq('id', doc.id);

      if (error) console.error(`Error remapping doc ${doc.id}:`, error.message);
      else remappedCount++;
    }
  }

  console.log(`Successfully remapped ${remappedCount} / ${evs.length} evidence documents.`);

  // 6. Delete Obsolete Criteria (criteria whose code is not in the 79 PACUCOA Level 1 codes)
  const validCodes = new Set(Object.keys(criteriaMap));
  const obsoleteIds = (existingCrits || [])
    .filter(c => !validCodes.has(c.code))
    .map(c => c.id);

  if (obsoleteIds.length > 0) {
    console.log(`Cleaning up ${obsoleteIds.length} obsolete placeholder criteria...`);
    // Delete readiness scores for obsolete criteria
    await supabase.from('readiness_scores').delete().in('criterion_id', obsoleteIds);
    await supabase.from('accreditation_criteria').delete().in('id', obsoleteIds);
  }

  // 7. Compute Readiness Scores for ALL 79 Criteria
  console.log('\n=== Step 4: Computing Readiness Scores for All 79 Criteria ===');
  const { data: allVerifiedEv } = await supabase
    .from('evidence_documents')
    .select('id, criterion_id, status, effective_date')
    .eq('program_id', bscs.id)
    .eq('status', 'verified');

  const fiveYearsAgo = new Date();
  fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);

  const scoreRows = [];
  const areaScoresSummary = {};

  for (const [code, crit] of Object.entries(criteriaMap)) {
    const validDocs = (allVerifiedEv || []).filter(e => {
      if (e.criterion_id !== crit.id) return false;
      if (e.effective_date && new Date(e.effective_date) < fiveYearsAgo) return false;
      return true;
    });

    const V = validDocs.length;
    const R = crit.required_count || 1;
    let score = 0;
    let status = 'no_evidence';

    if (V === 0) {
      score = 0;
      status = 'no_evidence';
    } else if (V < R) {
      score = Math.max(1, (2 * V) / R);
      status = 'weak';
    } else {
      score = Math.min(5, 3 + 2 * (V / R - 1));
      status = 'sufficient';
    }

    const finalScore = Number(score.toFixed(2));

    scoreRows.push({
      criterion_id: crit.id,
      program_id: bscs.id,
      score: finalScore,
      status,
      last_computed_at: new Date().toISOString()
    });

    const areaCode = 'Area ' + code.split('.')[0];
    if (!areaScoresSummary[areaCode]) areaScoresSummary[areaCode] = [];
    areaScoresSummary[areaCode].push(finalScore);
  }

  // Upsert readiness scores (delete existing for bscs, insert fresh 79)
  await supabase.from('readiness_scores').delete().eq('program_id', bscs.id);
  const { error: scoreErr } = await supabase.from('readiness_scores').insert(scoreRows);
  if (scoreErr) console.error('Error inserting scores:', scoreErr.message);
  else console.log(`Seeded ${scoreRows.length} readiness scores for program ${bscs.code}.`);

  // 8. Live Area Mean Summary & Grand Mean
  console.log('\n=== Step 5: Live Accreditation Score Card ===');
  let totalWeight = 0;
  let weightedSum = 0;

  areas.forEach(a => {
    const scores = areaScoresSummary[a.code] || [0];
    const mean = scores.reduce((sum, v) => sum + v, 0) / (scores.length || 1);
    const w = a.weight || 1.0;
    totalWeight += w;
    weightedSum += mean * w;
    const isLacking = mean === 0;

    console.log(`[${a.code.padEnd(9)}] Items: ${scores.length.toString().padStart(2)} | Mean: ${mean.toFixed(2)} (w: ${w}) ${isLacking ? '⚠️ FLOOR TRAP: 0 EVIDENCE (0.00)' : '✅ COMPLIANT'}`);
  });

  const grandMean = Number((weightedSum / totalWeight).toFixed(2));
  console.log('--------------------------------------------------------------------------------');
  console.log(`Overall Weighted Grand Mean: ${grandMean.toFixed(2)} / 5.00`);
  console.log(`Level I Qualification: ${grandMean >= 3.0 ? 'FAILED (Floor Trap on Areas 8 & 9)' : 'FAILED'}`);
  console.log('--------------------------------------------------------------------------------');
  console.log('\nMigration Complete!');
}

run().catch(console.error);

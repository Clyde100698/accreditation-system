const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
  const [k, ...v] = line.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim();
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function seed() {
  console.log('================================================================================');
  console.log('SEEDING PHASE 3 WALKTHROUGH DEMO DATA');
  console.log('Timestamp:', new Date().toISOString());
  console.log('================================================================================\n');

  // 1. Fetch Users Map
  const { data: users, error: userErr } = await supabase.from('users').select('*');
  if (userErr) throw userErr;
  const userMap = {};
  users.forEach(u => { userMap[u.email] = u; });
  console.log(`Loaded ${users.length} users.`);

  // 2. Fetch Programs Map
  const { data: progs, error: progErr } = await supabase.from('programs').select('*');
  if (progErr) throw progErr;
  const progMap = {};
  progs.forEach(p => { progMap[p.code] = p; });
  const bscs = progMap['BSCS'];
  const bsit = progMap['BSIT'];
  console.log(`Loaded programs: BSCS (${bscs.id}), BSIT (${bsit.id})`);

  // 3. Fetch Areas and Criteria
  const { data: areas, error: areaErr } = await supabase.from('accreditation_areas').select('*').order('display_order');
  if (areaErr) throw areaErr;
  const areaCodeMap = {};
  areas.forEach(a => { areaCodeMap[a.code] = a; });

  const { data: criteria, error: critErr } = await supabase.from('accreditation_criteria').select('*').order('code');
  if (critErr) throw critErr;
  const critCodeMap = {};
  criteria.forEach(c => { critCodeMap[c.code] = c; });
  console.log(`Loaded ${areas.length} areas and ${criteria.length} criteria.`);

  // 4. Ensure Accreditation Cycles exist (§2)
  console.log('\n--- 1. Accreditation Cycles ---');
  let { data: cycles } = await supabase.from('accreditation_cycles').select('*');
  
  let bscsCycle = cycles?.find(c => c.program_id === bscs.id);
  if (!bscsCycle) {
    const { data: newCycle, error: cErr } = await supabase.from('accreditation_cycles').insert({
      program_id: bscs.id,
      name: 'BSCS Level II Re-accreditation (2026-2027)',
      target_level: 'Level II - Re-accredited Status',
      target_date: '2027-03-31',
      status: 'in_progress',
      created_by: userMap['qa@sti.edu']?.id
    }).select().single();
    if (cErr) throw cErr;
    bscsCycle = newCycle;
    console.log('Created BSCS cycle:', bscsCycle.name);
  } else {
    console.log('BSCS cycle already exists:', bscsCycle.name);
  }

  let bsitCycle = cycles?.find(c => c.program_id === bsit.id);
  if (!bsitCycle) {
    const { data: newCycle, error: cErr } = await supabase.from('accreditation_cycles').insert({
      program_id: bsit.id,
      name: 'BSIT Level II Re-accreditation (2026-2027)',
      target_level: 'Level II - Re-accredited Status',
      target_date: '2027-04-15',
      status: 'in_progress',
      created_by: userMap['qa@sti.edu']?.id
    }).select().single();
    if (cErr) throw cErr;
    bsitCycle = newCycle;
    console.log('Created BSIT cycle:', bsitCycle.name);
  } else {
    console.log('BSIT cycle already exists:', bsitCycle.name);
  }

  // 5. Seed BSIT Committee Assignments (§3)
  console.log('\n--- 2. BSIT Committee Assignments ---');
  const { data: existingBsitAssignments } = await supabase.from('area_assignments').select('*').eq('program_id', bsit.id);
  if (!existingBsitAssignments || existingBsitAssignments.length === 0) {
    const bsitHead = userMap['head.bsit@sti.edu'];
    const bsitFac1 = userMap['bsit.faculty1@sti.edu'];
    const bsitFac2 = userMap['bsit.faculty2@sti.edu'];
    const bsitFac3 = userMap['bsit.faculty3@sti.edu'];

    const bsitAssignments = [];
    areas.forEach((area, idx) => {
      // Areas I-V: Chair = BSIT Faculty 1; Areas VI-X: Chair = BSIT Faculty 2
      const chair = idx < 5 ? bsitFac1 : bsitFac2;
      bsitAssignments.push({
        area_id: area.id,
        program_id: bsit.id,
        user_id: chair.id,
        assignment_type: 'area_chair',
        assigned_by: bsitHead.id
      });
      // All Areas: Member = BSIT Faculty 3
      bsitAssignments.push({
        area_id: area.id,
        program_id: bsit.id,
        user_id: bsitFac3.id,
        assignment_type: 'member',
        assigned_by: bsitHead.id
      });
    });

    const { error: bsitAssignErr } = await supabase.from('area_assignments').insert(bsitAssignments);
    if (bsitAssignErr) throw bsitAssignErr;
    console.log(`Seeded ${bsitAssignments.length} BSIT committee assignments.`);
  } else {
    console.log(`BSIT already has ${existingBsitAssignments.length} assignments.`);
  }

  // 6. Upload Demo PDFs to Storage Bucket & Prepare Public URLs
  console.log('\n--- 3. Uploading Demo PDFs to Supabase Storage ---');
  const demoFilesDir = path.resolve('demo_documents');
  const files = fs.readdirSync(demoFilesDir);
  const fileUrlMap = {};

  for (const fileName of files) {
    if (!fileName.endsWith('.pdf')) continue;
    const filePath = path.join(demoFilesDir, fileName);
    const fileBuffer = fs.readFileSync(filePath);
    const storagePath = `demo/${fileName}`;

    const { error: upErr } = await supabase.storage.from('evidence').upload(storagePath, fileBuffer, {
      contentType: 'application/pdf',
      upsert: true
    });
    if (upErr) {
      console.warn(`Warning uploading ${fileName}:`, upErr.message);
    }
    const { data: pubData } = supabase.storage.from('evidence').getPublicUrl(storagePath);
    fileUrlMap[fileName] = pubData.publicUrl;
  }
  console.log(`Uploaded ${Object.keys(fileUrlMap).length} demo PDFs to storage.`);

  // 7. Seed 48 Evidence Documents for BSCS (§4.2 & §5.4)
  console.log('\n--- 4. Seeding BSCS Evidence Documents (48 files) ---');
  
  // Clean existing evidence documents to avoid duplicates
  await supabase.from('evidence_documents').delete().eq('program_id', bscs.id);
  await supabase.from('readiness_scores').delete().eq('program_id', bscs.id);

  // Exact 48-upload plan from Section 4.2
  const uploadPlan = [
    // member1@sti.edu: I.1 (1), I.2 (2), II.2 (1), II.3 (3)
    { code: 'I.1', count: 1, uploader: 'member1@sti.edu', file: 'Institutional_VMGO_Document.pdf', chair: 'chair.area1@sti.edu' },
    { code: 'I.2', count: 2, uploader: 'member1@sti.edu', file: 'Communication_Memo___Orientation_Material.pdf', chair: 'chair.area1@sti.edu' },
    { code: 'II.2', count: 1, uploader: 'member1@sti.edu', file: 'HR_Policy_Document.pdf', chair: 'chair.area2@sti.edu' },
    { code: 'II.3', count: 3, uploader: 'member1@sti.edu', file: 'Training_Needs_Analysis___Development_Plan.pdf', chair: 'chair.area2@sti.edu' },

    // member2@sti.edu: II.1 (5), III.1 (5)
    { code: 'II.1', count: 5, uploader: 'member2@sti.edu', file: 'Transcript_of_Records___Diploma___Service_Record.pdf', chair: 'chair.area2@sti.edu' },
    { code: 'III.1', count: 5, uploader: 'member2@sti.edu', file: 'Course_Syllabus.pdf', chair: 'chair.area3@sti.edu' },

    // member3@sti.edu: III.2 (3), III.3 (2), IV.1 (2), IV.2 (2)
    { code: 'III.2', count: 3, uploader: 'member3@sti.edu', file: 'Sample_Test_Papers___Rubrics.pdf', chair: 'chair.area3@sti.edu' },
    { code: 'III.3', count: 2, uploader: 'member3@sti.edu', file: 'Curriculum_Review_Report.pdf', chair: 'chair.area3@sti.edu' },
    { code: 'IV.1', count: 2, uploader: 'member3@sti.edu', file: 'Equipment_Inventory___Lab_Layout_Plan.pdf', chair: 'chair.area4@sti.edu' },
    { code: 'IV.2', count: 2, uploader: 'member3@sti.edu', file: 'Maintenance_Log.pdf', chair: 'chair.area4@sti.edu' },

    // member4@sti.edu: V.1 (1), V.2 (2), VI.1 (2), VI.2 (1)
    { code: 'V.1', count: 1, uploader: 'member4@sti.edu', file: 'Research_Manual.pdf', chair: 'chair.area5@sti.edu' },
    { code: 'V.2', count: 2, uploader: 'member4@sti.edu', file: 'Publication_Record___Certificate.pdf', chair: 'chair.area5@sti.edu', holdBackSecond: true },
    { code: 'VI.1', count: 2, uploader: 'member4@sti.edu', file: 'Budget_Report___Holdings_List.pdf', chair: 'chair.area6@sti.edu' },
    { code: 'VI.2', count: 1, uploader: 'member4@sti.edu', file: 'Staff_Records.pdf', chair: 'chair.area6@sti.edu' },

    // member5@sti.edu: VII.1 (2), VII.2 (2), VIII.1 (3), VIII.2 (1)
    { code: 'VII.1', count: 2, uploader: 'member5@sti.edu', file: 'Guidance_Program_Document.pdf', chair: 'chair.area7@sti.edu' },
    { code: 'VII.2', count: 2, uploader: 'member5@sti.edu', file: 'Alumni_Tracking_Report.pdf', chair: 'chair.area7@sti.edu' },
    { code: 'VIII.1', count: 3, uploader: 'member5@sti.edu', file: 'Project_Documentation___Report.pdf', chair: 'chair.area8@sti.edu' },
    { code: 'VIII.2', count: 1, uploader: 'member5@sti.edu', file: 'Community_Profile.pdf', chair: 'chair.area8@sti.edu' },

    // faculty.member@sti.edu: IX.1 (2), IX.2 (2)
    { code: 'IX.1', count: 2, uploader: 'faculty.member@sti.edu', file: 'Certificate_of_Occupancy___Fire_Inspection_Certificate.pdf', chair: 'chair.area9@sti.edu' },
    { code: 'IX.2', count: 2, uploader: 'faculty.member@sti.edu', file: 'Facility_Inspection_Report.pdf', chair: 'chair.area9@sti.edu' },

    // faculty.chair@sti.edu: X.1 (1), X.2 (2)
    { code: 'X.1', count: 1, uploader: 'faculty.chair@sti.edu', file: 'Administrative_Manual.pdf', chair: 'chair.area10@sti.edu' },
    { code: 'X.2', count: 2, uploader: 'faculty.chair@sti.edu', file: 'Meeting_Minutes.pdf', chair: 'chair.area10@sti.edu' },
  ];

  const evidenceRows = [];
  const auditLogs = [];
  let totalDocs = 0;
  let verifiedDocs = 0;
  let pendingDocs = 0;

  for (const item of uploadPlan) {
    const crit = critCodeMap[item.code];
    const uploaderUser = userMap[item.uploader];
    const chairUser = userMap[item.chair];
    const fileUrl = fileUrlMap[item.file] || 'https://placehold.co/600x800/png?text=' + encodeURIComponent(item.file);

    for (let i = 1; i <= item.count; i++) {
      totalDocs++;
      // Section 5.4 rule: "hold back: approve V.1 only, and V.2 x1"
      // If holdBackSecond is true and i === 2, leave status as 'pending'
      const isPending = item.holdBackSecond && i === 2;

      const row = {
        criterion_id: crit.id,
        program_id: bscs.id,
        uploaded_by: uploaderUser.id,
        file_url: fileUrl,
        document_type: crit.expected_document_type,
        effective_date: '2025-06-15',
        version: 1,
        status: isPending ? 'pending' : 'verified',
        reviewer_notes: isPending ? null : 'Verified compliant with PACUCOA standards.',
        verified_by: isPending ? null : chairUser.id,
        verified_at: isPending ? null : new Date(Date.now() - (48 - totalDocs) * 60000).toISOString(),
        uploaded_at: new Date(Date.now() - (48 - totalDocs) * 120000).toISOString()
      };

      evidenceRows.push(row);

      if (isPending) pendingDocs++;
      else verifiedDocs++;
    }
  }

  const { data: insertedEvidence, error: evInsertErr } = await supabase
    .from('evidence_documents')
    .insert(evidenceRows)
    .select('id, criterion_id, status, uploaded_by, verified_by, document_type');

  if (evInsertErr) throw evInsertErr;
  console.log(`Successfully seeded ${insertedEvidence.length} evidence records:`);
  console.log(`  - Verified: ${verifiedDocs}`);
  console.log(`  - Pending:  ${pendingDocs} (V.2 second document waiting in verification queue)`);

  // 8. Populate Live Readiness Scores (§6)
  console.log('\n--- 5. Computing & Seeding Live Readiness Scores ---');
  // Formula:
  // V = count of valid verified docs
  // V=0 -> 0; V<R -> max(1, 2*V/R); V>=R -> min(5, 3 + 2*(V/R - 1))
  const scoreRows = [];
  criteria.forEach(c => {
    const validVerified = insertedEvidence.filter(e => e.criterion_id === c.id && e.status === 'verified').length;
    const R = c.required_count || 1;
    let s = 0;
    let st = 'no_evidence';

    if (validVerified === 0) {
      s = 0;
      st = 'no_evidence';
    } else if (validVerified < R) {
      s = Math.max(1, 2 * validVerified / R);
      st = 'weak';
    } else {
      s = Math.min(5, 3 + 2 * (validVerified / R - 1));
      st = 'sufficient';
    }

    scoreRows.push({
      criterion_id: c.id,
      program_id: bscs.id,
      score: Number(s.toFixed(2)),
      status: st,
      last_computed_at: new Date().toISOString()
    });
  });

  const { error: scoreErr } = await supabase.from('readiness_scores').insert(scoreRows);
  if (scoreErr) throw scoreErr;
  console.log(`Seeded ${scoreRows.length} readiness scores for BSCS.`);

  // Print Heatmap Verification
  console.log('\n--- Live Heatmap Check ---');
  areas.forEach(a => {
    const areaCrit = criteria.filter(c => c.area_id === a.id);
    const scores = areaCrit.map(c => scoreRows.find(s => s.criterion_id === c.id)?.score || 0);
    const mean = scores.reduce((sum, v) => sum + v, 0) / scores.length;
    console.log(`${a.code.padEnd(10)}: Mean = ${mean.toFixed(2)} [${scores.join(', ')}] ${mean < 3.0 ? '⚠️ FLOOR TRAP (Area V)' : '✅'}`);
  });

  // 9. Seed 6 Recommendations / Opportunities (§8.1 & §8.2)
  console.log('\n--- 6. Seeding PACUCOA 4-Column Compliance Recommendations (§8) ---');
  await supabase.from('compliance_actions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('accreditation_recommendations').delete().eq('cycle_id', bscsCycle.id);

  const qaUser = userMap['qa@sti.edu'];
  const headBscs = userMap['head.bscs@sti.edu'];

  const recData = [
    {
      item_number: 1,
      area_code: 'Area I',
      opportunity_for_improvement: 'Stakeholder consultation records for PEO review are incomplete.',
      recommendation_text: 'Document annual PEO review with industry advisory council minutes.',
      status: 'resolved'
    },
    {
      item_number: 2,
      area_code: 'Area III',
      opportunity_for_improvement: 'Course syllabi lack explicit OBE-to-assessment mapping.',
      recommendation_text: 'Adopt a standard syllabus template with CLO–assessment matrix.',
      status: 'resolved'
    },
    {
      item_number: 3,
      area_code: 'Area IV',
      opportunity_for_improvement: 'Preventive maintenance logs for computing hardware are irregular.',
      recommendation_text: 'Institutionalize a quarterly maintenance protocol with technician sign-off.',
      status: 'resolved',
      action: {
        action_number: '3.1',
        action_taken: 'Formulated SOP-LAB-04 and completed Q1 hardware audit.',
        team_verification: 'Approved maintenance manual and technician sign-off matrix.',
        match_doc_type: 'Maintenance Log'
      }
    },
    {
      item_number: 4,
      area_code: 'Area V',
      opportunity_for_improvement: 'Faculty research outputs are below the required count.',
      recommendation_text: 'Set annual publication targets and a research incentive scheme.',
      status: 'open' // Remains open as per walkthrough!
    },
    {
      item_number: 5,
      area_code: 'Area VI',
      opportunity_for_improvement: 'Library holdings list not updated for current curriculum.',
      recommendation_text: 'Update holdings annually; align budget with syllabus references.',
      status: 'resolved'
    },
    {
      item_number: 6,
      area_code: 'Area VIII',
      opportunity_for_improvement: 'Community extension projects lack impact assessment.',
      recommendation_text: 'Add post-project beneficiary surveys to every extension report.',
      status: 'resolved'
    }
  ];

  for (const item of recData) {
    const area = areaCodeMap[item.area_code];
    const isResolved = item.status === 'resolved';

    const { data: recRow, error: rErr } = await supabase.from('accreditation_recommendations').insert({
      cycle_id: bscsCycle.id,
      program_id: bscs.id,
      area_id: area.id,
      item_number: item.item_number,
      opportunity_for_improvement: item.opportunity_for_improvement,
      recommendation_text: item.recommendation_text,
      status: item.status,
      created_by: qaUser.id,
      resolved_by: isResolved ? qaUser.id : null,
      resolved_at: isResolved ? new Date().toISOString() : null
    }).select().single();

    if (rErr) throw rErr;
    console.log(`Created Opportunity Item #${item.item_number} [${item.area_code}] (${item.status})`);

    // If there is an action defined, seed it into compliance_actions
    if (item.action) {
      // Find linked verified maintenance doc
      const linkedDoc = insertedEvidence.find(e => e.document_type === item.action.match_doc_type);

      const { data: actRow, error: aErr } = await supabase.from('compliance_actions').insert({
        recommendation_id: recRow.id,
        action_number: item.action.action_number,
        action_taken: item.action.action_taken,
        team_verification: item.action.team_verification,
        linked_evidence_id: linkedDoc ? linkedDoc.id : null,
        created_by: headBscs.id
      }).select().single();

      if (aErr) throw aErr;
      console.log(`  -> Added Action Taken ${item.action.action_number} with verified evidence link.`);
    }
  }

  // 10. Audit Log Entries (§11)
  console.log('\n--- 7. Seeding Audit Trail Events (§11) ---');
  const auditEntries = [
    {
      user_id: qaUser.id,
      action: 'cycle_created',
      entity_type: 'accreditation_cycles',
      entity_id: bscsCycle.id,
      metadata: { name: bscsCycle.name, target_level: bscsCycle.target_level }
    },
    {
      user_id: qaUser.id,
      action: 'cycle_created',
      entity_type: 'accreditation_cycles',
      entity_id: bsitCycle.id,
      metadata: { name: bsitCycle.name, target_level: bsitCycle.target_level }
    },
    {
      user_id: headBscs.id,
      action: 'area_assigned',
      entity_type: 'area_assignments',
      entity_id: null,
      metadata: { program: 'BSCS', total_delegations: 30 }
    },
    {
      user_id: userMap['member1@sti.edu'].id,
      action: 'evidence_uploaded',
      entity_type: 'evidence_documents',
      entity_id: insertedEvidence[0]?.id,
      metadata: { criterion_code: 'I.1', file_name: 'Institutional_VMGO_Document.pdf' }
    },
    {
      user_id: userMap['chair.area1@sti.edu'].id,
      action: 'evidence_verified',
      entity_type: 'evidence_documents',
      entity_id: insertedEvidence[0]?.id,
      metadata: { criterion_code: 'I.1', decision: 'verified' }
    },
    {
      user_id: qaUser.id,
      action: 'recommendation_created',
      entity_type: 'accreditation_recommendations',
      entity_id: null,
      metadata: { total_opportunities: 6 }
    },
    {
      user_id: headBscs.id,
      action: 'compliance_action_created',
      entity_type: 'compliance_actions',
      entity_id: null,
      metadata: { action_number: '3.1' }
    }
  ];

  await supabase.from('audit_log').insert(auditEntries);
  console.log(`Seeded ${auditEntries.length} audit trail records.`);

  console.log('\n================================================================================');
  console.log('✅ ALL WALKTHROUGH DEMO DATA SUCCESSFULLY SEEDED!');
  console.log('================================================================================\n');
}

seed().catch(err => {
  console.error('SEEDING FAILED:', err);
  process.exit(1);
});

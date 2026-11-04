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

async function main() {
  console.log('================================================================================');
  console.log('APPLYING BSCS REAL DATA (AREAS 1-7, 10 REAL EVIDENCE; AREAS 8-9 LACKING EVIDENCE)');
  console.log('Timestamp:', new Date().toISOString());
  console.log('================================================================================\n');

  // 1. Fetch Users & Programs
  const { data: users } = await supabase.from('users').select('*');
  const userMap = {};
  users.forEach(u => { userMap[u.email] = u; });

  const { data: bscs } = await supabase.from('programs').select('*').eq('code', 'BSCS').single();
  const { data: areas } = await supabase.from('accreditation_areas').select('*').order('display_order');
  const { data: criteria } = await supabase.from('accreditation_criteria').select('*').order('code');

  const areaMap = {};
  areas.forEach(a => { areaMap[a.code] = a; });
  const critMap = {};
  criteria.forEach(c => { critMap[c.code] = c; });

  console.log(`Loaded BSCS Program (${bscs.id}), ${areas.length} Areas, ${criteria.length} Criteria.`);

  // 2. Fetch or Create BSCS Cycle
  let { data: cycles } = await supabase.from('accreditation_cycles').select('*').eq('program_id', bscs.id);
  let bscsCycle = cycles?.[0];
  if (!bscsCycle) {
    const { data: newCycle } = await supabase.from('accreditation_cycles').insert({
      program_id: bscs.id,
      name: 'BSCS Level I Accreditation (2026-2027)',
      target_level: 'Level I - Accredited Status',
      target_date: '2027-03-31',
      status: 'in_progress',
      created_by: userMap['qa@sti.edu']?.id
    }).select().single();
    bscsCycle = newCycle;
    console.log('Created cycle:', bscsCycle.name);
  } else {
    // Update target level to Level I since this real dataset is for Level 1!
    await supabase.from('accreditation_cycles').update({
      name: 'BSCS Level I Accreditation (2026-2027)',
      target_level: 'Level I - Accredited Status'
    }).eq('id', bscsCycle.id);
    console.log('Using cycle:', bscsCycle.name);
  }

  // 3. Clear old BSCS evidence, readiness scores, recommendations and compliance actions
  console.log('\n--- Clearing Previous Evidence & Scores ---');
  await supabase.from('compliance_actions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('accreditation_recommendations').delete().eq('cycle_id', bscsCycle.id);
  await supabase.from('evidence_documents').delete().eq('program_id', bscs.id);
  await supabase.from('readiness_scores').delete().eq('program_id', bscs.id);
  console.log('Clean slate ready for real files.');

  // 4. Real file mappings from BSCS_REAL_DATA
  const realFileMappings = [
    // Area I (Philosophy and Objectives)
    {
      code: 'I.1',
      relPath: 'Area 01 - Philosophy and Objectives/EXHIBIT 1/1.2 PEO Development Report.pdf',
      uploader: 'member1@sti.edu',
      chair: 'chair.area1@sti.edu'
    },
    {
      code: 'I.2',
      relPath: 'Area 01 - Philosophy and Objectives/EXHIBIT 2/2.1 Post Activity Reports.pdf',
      uploader: 'member1@sti.edu',
      chair: 'chair.area1@sti.edu'
    },
    {
      code: 'I.2',
      relPath: 'Area 01 - Philosophy and Objectives/EXHIBIT 3/3.1 APPROVED PEO AND PO REVIEW GUIDELINES.pdf',
      uploader: 'member1@sti.edu',
      chair: 'chair.area1@sti.edu'
    },

    // Area II (Faculty)
    {
      code: 'II.1',
      relPath: 'Area 02 - Faculty. Trainors/EXHIBIT 2 - Faculty Trainings/2.1 Faculty Trainings.pdf',
      uploader: 'member2@sti.edu',
      chair: 'chair.area2@sti.edu'
    },
    {
      code: 'II.1',
      relPath: 'Area 02 - Faculty. Trainors/EXHIBIT 2 - Faculty Trainings/2.2 Certificates of Attendance.pdf',
      uploader: 'member2@sti.edu',
      chair: 'chair.area2@sti.edu'
    },
    {
      code: 'II.1',
      relPath: 'Area 02 - Faculty. Trainors/EXHIBIT 9 - IT Membership/9.1a List of Faculty-Professional Organization 1st Sem 2025-2026.pdf',
      uploader: 'member2@sti.edu',
      chair: 'chair.area2@sti.edu'
    },
    {
      code: 'II.1',
      relPath: 'Area 02 - Faculty. Trainors/EXHIBIT 9 - IT Membership/9.2a Certificates of IT Membership 1st 2025-2026.pdf',
      uploader: 'member2@sti.edu',
      chair: 'chair.area2@sti.edu'
    },
    {
      code: 'II.1',
      relPath: 'Area 02 - Faculty. Trainors/EXHIBIT 5 - Dean and PH Load/5.1 Teaching Load of College Dean 2425_2526.pdf',
      uploader: 'member2@sti.edu',
      chair: 'chair.area2@sti.edu'
    },
    {
      code: 'II.2',
      relPath: 'Area 02 - Faculty. Trainors/EXHIBIT 8 - Faculty Immersion/8.1 MOA STIWNU-SPRINGVALLEY.pdf',
      uploader: 'member1@sti.edu',
      chair: 'chair.area2@sti.edu'
    },
    {
      code: 'II.3',
      relPath: 'Area 02 - Faculty. Trainors/EXHIBIT 1 - FDP_FPE/1.1 Faculty Traning and Development Program SY2025-2026.pdf',
      uploader: 'member1@sti.edu',
      chair: 'chair.area2@sti.edu'
    },
    {
      code: 'II.3',
      relPath: 'Area 02 - Faculty. Trainors/EXHIBIT 1 - FDP_FPE/1.2 Faculty Development Plan SY2020-2025.pdf',
      uploader: 'member1@sti.edu',
      chair: 'chair.area2@sti.edu'
    },
    {
      code: 'II.3',
      relPath: 'Area 02 - Faculty. Trainors/EXHIBIT 1 - FDP_FPE/1.3 Faculty Performance Evaluation Analysis 2nd Semester SY2024-2025.pdf',
      uploader: 'member1@sti.edu',
      chair: 'chair.area2@sti.edu'
    },

    // Area III (Instruction)
    {
      code: 'III.1',
      relPath: 'Area 03 - Instruction. Training Standards/EXHIBIT 6/6.2 Data Structures and Algorithms Syllabus.pdf',
      uploader: 'member2@sti.edu',
      chair: 'chair.area3@sti.edu'
    },
    {
      code: 'III.1',
      relPath: 'Area 03 - Instruction. Training Standards/EXHIBIT 6/6.1 Data Structures Class Session Guide.pdf',
      uploader: 'member2@sti.edu',
      chair: 'chair.area3@sti.edu'
    },
    {
      code: 'III.1',
      relPath: 'Area 03 - Instruction. Training Standards/EXHIBIT 3/3.2 Sample Laboratory Manual - COSC1021 Software Engg 1.pdf',
      uploader: 'member2@sti.edu',
      chair: 'chair.area3@sti.edu'
    },
    {
      code: 'III.1',
      relPath: 'Area 03 - Instruction. Training Standards/EXHIBIT 4/4.1 Guidelines in Conducting Make up Classes.pdf',
      uploader: 'member2@sti.edu',
      chair: 'chair.area3@sti.edu'
    },
    {
      code: 'III.1',
      relPath: 'Area 03 - Instruction. Training Standards/EXHIBIT 5/5.1 List of Co-Curricular Activities-The Rise of the Houses.pdf',
      uploader: 'member2@sti.edu',
      chair: 'chair.area3@sti.edu'
    },
    {
      code: 'III.2',
      relPath: 'Area 03 - Instruction. Training Standards/EXHIBIT 2 - Co-curricular Activity/2.2 Post Activity Evaluation Results.pdf',
      uploader: 'member3@sti.edu',
      chair: 'chair.area3@sti.edu'
    },
    {
      code: 'III.2',
      relPath: 'Area 03 - Instruction. Training Standards/EXHIBIT 2 - Co-curricular Activity/2.3 Action Plan 2024-2026.pdf',
      uploader: 'member3@sti.edu',
      chair: 'chair.area3@sti.edu'
    },
    {
      code: 'III.2',
      relPath: 'Area 03 - Instruction. Training Standards/EXHIBIT 4/4.2 Make-up Class Form.pdf',
      uploader: 'member3@sti.edu',
      chair: 'chair.area3@sti.edu'
    },
    {
      code: 'III.3',
      relPath: 'Area 03 - Instruction. Training Standards/EXHIBIT 1 - Curriculum Review/1.1 AAOM Curriculum Review Policy.pdf',
      uploader: 'member3@sti.edu',
      chair: 'chair.area3@sti.edu'
    },
    {
      code: 'III.3',
      relPath: 'Area 03 - Instruction. Training Standards/EXHIBIT 1 - Curriculum Review/1.2 BSCS Curriculum Review Activity Report.pdf',
      uploader: 'member3@sti.edu',
      chair: 'chair.area3@sti.edu'
    },

    // Area IV (Laboratories)
    {
      code: 'IV.1',
      relPath: 'Area 04 - Laboratories/Exhibit 4/4.1 Inventory Report.pdf',
      uploader: 'member3@sti.edu',
      chair: 'chair.area4@sti.edu'
    },
    {
      code: 'IV.1',
      relPath: 'Area 04 - Laboratories/Exhibit 8/8.1 Computer Specification.pdf',
      uploader: 'member3@sti.edu',
      chair: 'chair.area4@sti.edu'
    },
    {
      code: 'IV.2',
      relPath: 'Area 04 - Laboratories/Exhibit 11/11.1 Computer Laboratory and IT Safety Training.pdf',
      uploader: 'member3@sti.edu',
      chair: 'chair.area4@sti.edu'
    },
    {
      code: 'IV.2',
      relPath: 'Area 04 - Laboratories/Exhibit 10/10.1 Provision of High Speed Printer.pdf',
      uploader: 'member3@sti.edu',
      chair: 'chair.area4@sti.edu'
    },

    // Area V (Research)
    {
      code: 'V.1',
      relPath: 'Area 05 - Research/EVIDENCES/15. Institutional Format and Oral Defense in Research Manual/Research-Manual-2025v3 (1).pdf',
      uploader: 'member4@sti.edu',
      chair: 'chair.area5@sti.edu'
    },
    {
      code: 'V.2',
      relPath: 'Area 05 - Research/EVIDENCES/1. Policies and Guidelines for Research Incentives/Guidelines on Research Incentives 2023_September 26.pdf',
      uploader: 'member4@sti.edu',
      chair: 'chair.area5@sti.edu'
    },
    {
      code: 'V.2',
      relPath: 'Area 05 - Research/EVIDENCES/8. Time to Conduct Research/8. Abella_Certificate of Publication.pdf',
      uploader: 'member4@sti.edu',
      chair: 'chair.area5@sti.edu'
    },

    // Area VI (Library)
    {
      code: 'VI.1',
      relPath: 'Area 06 - Library/BS Computer Science Compliance Report/EXHIBIT 1/1.1. BS COMPUTER SCIENCE- BOOKLISTING 1.PDF',
      uploader: 'member4@sti.edu',
      chair: 'chair.area6@sti.edu'
    },
    {
      code: 'VI.1',
      relPath: 'Area 06 - Library/BS Computer Science Compliance Report/EXHIBIT 1/1.4. APPROVED CAPEX 2025.pdf',
      uploader: 'member4@sti.edu',
      chair: 'chair.area6@sti.edu'
    },
    {
      code: 'VI.2',
      relPath: 'Area 06 - Library/BS Computer Science Compliance Report/EXHIBIT 3/3.3. LIBARIANS RESEARCH OUTPUT (published).PDF',
      uploader: 'member4@sti.edu',
      chair: 'chair.area6@sti.edu'
    },

    // Area VII (Student Services)
    {
      code: 'VII.1',
      relPath: 'Area 07 - Student Services/BSCS GSC/[2] STUDENT DEVELOPMENT PROGRAMS.pdf',
      uploader: 'member5@sti.edu',
      chair: 'chair.area7@sti.edu'
    },
    {
      code: 'VII.1',
      relPath: 'Area 07 - Student Services/BSCS GSC/[9] COUNSELING ROOMS.pdf',
      uploader: 'member5@sti.edu',
      chair: 'chair.area7@sti.edu'
    },
    {
      code: 'VII.2',
      relPath: 'Area 07 - Student Services/BSCE SCHOLARSHIP/SCHOLARSHIP ANNUAL OPERATIONAL PLAN AY 2024-2025.pdf',
      uploader: 'member5@sti.edu',
      chair: 'chair.area7@sti.edu'
    },
    {
      code: 'VII.2',
      relPath: 'Area 07 - Student Services/BSCS GSC/[8] POST EVALUATION REPORT AND SATISFACTION SURVEY.pdf',
      uploader: 'member5@sti.edu',
      chair: 'chair.area7@sti.edu'
    },

    // Area X (Organization and Administration)
    {
      code: 'X.1',
      relPath: 'Area 10 - Organization and Administration/Exhibit B/360-degree Performance Evaluation Form.pdf',
      uploader: 'faculty.chair@sti.edu',
      chair: 'chair.area10@sti.edu'
    },
    {
      code: 'X.2',
      relPath: 'Area 10 - Organization and Administration/Exhibit A/BFO_Budget Code Monitoring.png',
      uploader: 'faculty.chair@sti.edu',
      chair: 'chair.area10@sti.edu'
    },
    {
      code: 'X.2',
      relPath: 'Area 10 - Organization and Administration/Exhibit C/QMR Memo No. 001 2024-2025.docx',
      uploader: 'faculty.chair@sti.edu',
      chair: 'chair.area10@sti.edu'
    }
  ];

  // NOTE: Areas 8 and 9 are intentionally omitted — ZERO files uploaded to simulate lacking evidence!

  console.log(`\n--- Uploading ${realFileMappings.length} Real Documents to Storage & Database ---`);
  const evidenceRows = [];

  for (const m of realFileMappings) {
    const fullLocalPath = path.join('BSCS_REAL_DATA', m.relPath);
    if (!fs.existsSync(fullLocalPath)) {
      console.warn(`File not found: ${fullLocalPath}`);
      continue;
    }

    const fileBuffer = fs.readFileSync(fullLocalPath);
    const fileName = path.basename(m.relPath);
    const storagePath = `bscs_real/${encodeURIComponent(fileName)}`;
    const ext = path.extname(fileName).toLowerCase();
    const contentType = ext === '.pdf' ? 'application/pdf' : ext === '.docx' ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' : ext === '.png' ? 'image/png' : 'application/octet-stream';

    await supabase.storage.from('evidence').upload(storagePath, fileBuffer, {
      contentType,
      upsert: true
    });

    const { data: pubData } = supabase.storage.from('evidence').getPublicUrl(storagePath);
    const crit = critMap[m.code];
    const uploader = userMap[m.uploader] || userMap['member1@sti.edu'];
    const chair = userMap[m.chair] || userMap['chair.area1@sti.edu'];

    evidenceRows.push({
      criterion_id: crit.id,
      program_id: bscs.id,
      uploaded_by: uploader.id,
      file_url: pubData.publicUrl,
      document_type: crit.expected_document_type,
      effective_date: '2025-06-15',
      version: 1,
      status: 'verified',
      reviewer_notes: `Verified against official STIWNU Exhibit: ${fileName}`,
      verified_by: chair.id,
      verified_at: new Date().toISOString(),
      uploaded_at: new Date().toISOString()
    });
  }

  const { data: insertedEvidence, error: evErr } = await supabase.from('evidence_documents').insert(evidenceRows).select();
  if (evErr) throw evErr;
  console.log(`Inserted ${insertedEvidence.length} verified real evidence records.`);

  // 5. Compute Readiness Scores for ALL 22 Criteria
  console.log('\n--- Computing Readiness Scores (Areas 8 & 9 set to 0.00 / no_evidence) ---');
  const scoreRows = [];
  criteria.forEach(c => {
    const validCount = insertedEvidence.filter(e => e.criterion_id === c.id).length;
    const R = c.required_count || 1;
    let score = 0;
    let status = 'no_evidence';

    if (validCount === 0) {
      score = 0;
      status = 'no_evidence';
    } else if (validCount < R) {
      score = Math.max(1, (2 * validCount) / R);
      status = 'weak';
    } else {
      score = Math.min(5, 3 + 2 * (validCount / R - 1));
      status = 'sufficient';
    }

    scoreRows.push({
      criterion_id: c.id,
      program_id: bscs.id,
      score: Number(score.toFixed(2)),
      status,
      last_computed_at: new Date().toISOString()
    });
  });

  const { error: scErr } = await supabase.from('readiness_scores').insert(scoreRows);
  if (scErr) throw scErr;
  console.log(`Seeded ${scoreRows.length} readiness scores.`);

  // Calculate Weighted Grand Mean
  let totalWeight = 0;
  let weightedSum = 0;
  console.log('\n--- Live Areas Summary ---');
  areas.forEach(a => {
    const areaCrits = criteria.filter(c => c.area_id === a.id);
    const crScores = areaCrits.map(c => scoreRows.find(s => s.criterion_id === c.id)?.score || 0);
    const areaMean = crScores.reduce((sum, v) => sum + v, 0) / (crScores.length || 1);
    const w = a.weight || 1.0;
    totalWeight += w;
    weightedSum += areaMean * w;
    const isLacking = areaMean === 0;
    console.log(`[${a.code.padEnd(9)}] Mean: ${areaMean.toFixed(2)} (weight: ${w}) ${isLacking ? '⚠️ LACKING EVIDENCE GAP (0.00)' : '✅ COMPLIANT'}`);
  });
  const grandMean = Number((weightedSum / totalWeight).toFixed(2));
  console.log('--------------------------------------------------------------------------------');
  console.log(`Baseline Weighted Grand Mean: ${grandMean.toFixed(2)} / 5.00`);
  console.log(`Status: ${grandMean >= 3.0 ? 'Qualified' : 'Gaps Exist (Dragged down by Area 8 & 9 lacking evidence)'}`);
  console.log('--------------------------------------------------------------------------------');

  // 6. Insert All 79 Parsed Real Compliance Recommendations & Actions
  console.log('\n--- Seeding 79 Real Compliance Matrix Items into Recommendations ---');
  const parsedRecs = JSON.parse(fs.readFileSync('scripts/parsed_compliance_recs.json', 'utf8'));
  const qaUser = userMap['qa@sti.edu'];
  const headBscs = userMap['head.bscs@sti.edu'];

  for (const item of parsedRecs) {
    const area = areaMap[item.area_code];
    if (!area) continue;

    const { data: recRow, error: recInsertErr } = await supabase.from('accreditation_recommendations').insert({
      cycle_id: bscsCycle.id,
      program_id: bscs.id,
      area_id: area.id,
      item_number: item.item_number,
      opportunity_for_improvement: item.opportunity_for_improvement,
      recommendation_text: item.recommendation_text,
      status: item.status, // resolved if actions exist, open if lacking actions (like Area 8 & 9)
      created_by: qaUser.id,
      resolved_by: item.status === 'resolved' ? qaUser.id : null,
      resolved_at: item.status === 'resolved' ? new Date().toISOString() : null
    }).select().single();

    if (recInsertErr) {
      console.warn(`Error inserting rec item ${item.area_code} #${item.item_number}:`, recInsertErr.message);
      continue;
    }

    if (item.action_taken && item.action_taken.trim()) {
      await supabase.from('compliance_actions').insert({
        recommendation_id: recRow.id,
        action_number: `${item.item_number}.1`,
        action_taken: item.action_taken,
        team_verification: item.team_verification || 'Documented in STIWNU Institutional Compliance Exhibits.',
        created_by: headBscs.id
      });
    }
  }

  console.log(`Imported all ${parsedRecs.length} compliance recommendations and actions from docx!`);
  console.log('\n================================================================================');
  console.log('✅ BSCS REAL DATA DEPLOYED SUCCESSFULLY!');
  console.log('================================================================================');
}

main().catch(err => {
  console.error('FAILED:', err);
  process.exit(1);
});

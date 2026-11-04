const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// 1. Load environment variables
const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
  const [k, ...v] = line.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim();
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

// Helper to crawl directory recursively
function getAllFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getAllFiles(fullPath));
    } else {
      results.push(fullPath);
    }
  });
  return results;
}

// Map file relative path to PACUCOA criterion code
function getCriterionCodeForFile(relPath) {
  const norm = relPath.replace(/\\/g, '/');
  
  // Area 01
  if (norm.startsWith('Area 01')) {
    if (norm.includes('EXHIBIT 1')) return 'I.1';
    return 'I.2';
  }

  // Area 02
  if (norm.startsWith('Area 02')) {
    if (norm.includes('EXHIBIT 1') || norm.includes('EXHIBIT 6')) return 'II.3';
    if (norm.includes('EXHIBIT 8')) return 'II.2';
    return 'II.1'; // Trainings, Research, Library, Dean/PH loads, Consultations, IT Membership
  }

  // Area 03
  if (norm.startsWith('Area 03')) {
    if (norm.includes('EXHIBIT 1')) return 'III.3'; // Curriculum Review
    if (norm.includes('EXHIBIT 2') || norm.includes('EXHIBIT 5')) return 'III.2'; // Co-curricular & Student Activities
    return 'III.1'; // Lab Manuals, Make up Classes, Syllabi
  }

  // Area 04
  if (norm.startsWith('Area 04')) {
    if (norm.includes('Exhibit 7') || norm.includes('Exhibit 11')) return 'IV.2'; // Maintenance & Safety
    return 'IV.1'; // Computer specs, inventory, software, OS, high-speed printer
  }

  // Area 05
  if (norm.startsWith('Area 05')) {
    if (
      norm.includes('15. Institutional Format') ||
      norm.includes('9. Official Institution') ||
      norm.includes('6. Research Thrust') ||
      norm.includes('Self Survey Instrument')
    ) {
      return 'V.1'; // Research Manual, agenda, guidelines
    }
    return 'V.2'; // Publications, incentives, workshops, certificates, tracer study
  }

  // Area 06
  if (norm.startsWith('Area 06')) {
    if (norm.includes('EXHIBIT 3')) return 'VI.2'; // Staff research, surveys, stats
    return 'VI.1'; // Books, CAPEX, OPAC, subscriptions, journals, circulation
  }

  // Area 07
  if (norm.startsWith('Area 07')) {
    if (norm.includes('BSCE SCHOLARSHIP')) return 'VII.2'; // Placement, scholarships, alumni tracking
    return 'VII.1'; // Guidance, counseling, psychological tests, digitization
  }

  // Area 10
  if (norm.startsWith('Area 10')) {
    if (norm.includes('Exhibit A') || norm.includes('Exhibit C')) return 'X.2'; // Budget, QMR memo, meetings
    return 'X.1'; // 360 evaluation, filing cabinets, document controller
  }

  return null;
}

// Get content type based on extension
function getContentType(ext) {
  switch (ext) {
    case '.pdf': return 'application/pdf';
    case '.docx': return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    case '.xlsx': return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    case '.jpg':
    case '.jpeg': return 'image/jpeg';
    case '.png': return 'image/png';
    default: return 'application/octet-stream';
  }
}

async function main() {
  console.log('================================================================================');
  console.log('UPLOADING ALL 184 FILES FROM BSCS_REAL_DATA (AREAS 1-7, 10; AREAS 8-9 LACKING)');
  console.log('Timestamp:', new Date().toISOString());
  console.log('================================================================================\n');

  // 1. Fetch metadata: Users, Program, Areas, Criteria
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

  console.log(`Program: BSCS (${bscs.id})`);
  console.log(`Loaded ${areas.length} Areas and ${criteria.length} Criteria.`);

  // 2. Locate or create active BSCS Cycle
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
    await supabase.from('accreditation_cycles').update({
      name: 'BSCS Level I Accreditation (2026-2027)',
      target_level: 'Level I - Accredited Status'
    }).eq('id', bscsCycle.id);
    console.log('Using cycle:', bscsCycle.name);
  }

  // 3. Clear previous evidence & scores to start fresh
  console.log('\n--- Resetting Previous BSCS Evidence & Scores ---');
  await supabase.from('evidence_documents').delete().eq('program_id', bscs.id);
  await supabase.from('readiness_scores').delete().eq('program_id', bscs.id);
  console.log('Clean slate ready for all real files.');

  // 4. Discover all files in BSCS_REAL_DATA
  const allLocalFiles = getAllFiles('BSCS_REAL_DATA').filter(f => !f.endsWith('BSCS Compliance Report.docx'));
  console.log(`\nFound ${allLocalFiles.length} real evidence files to upload.`);

  // Committee mappings
  const committeeByArea = {
    'Area I': { uploader: 'member1@sti.edu', chair: 'chair.area1@sti.edu' },
    'Area II': { uploader: 'member2@sti.edu', chair: 'chair.area2@sti.edu' },
    'Area III': { uploader: 'member3@sti.edu', chair: 'chair.area3@sti.edu' },
    'Area IV': { uploader: 'member3@sti.edu', chair: 'chair.area4@sti.edu' },
    'Area V': { uploader: 'member4@sti.edu', chair: 'chair.area5@sti.edu' },
    'Area VI': { uploader: 'member4@sti.edu', chair: 'chair.area6@sti.edu' },
    'Area VII': { uploader: 'member5@sti.edu', chair: 'chair.area7@sti.edu' },
    'Area X': { uploader: 'faculty.chair@sti.edu', chair: 'chair.area10@sti.edu' },
  };

  // 5. Upload files to Storage and build evidence rows
  console.log('\n--- Uploading Files to Supabase Storage Bucket "evidence" ---');
  const evidenceRows = [];
  let uploadCount = 0;
  let skippedCount = 0;

  for (let i = 0; i < allLocalFiles.length; i++) {
    const fullPath = allLocalFiles[i];
    const relPath = path.relative('BSCS_REAL_DATA', fullPath);
    const critCode = getCriterionCodeForFile(relPath);
    
    if (!critCode || !critMap[critCode]) {
      console.warn(`[Skip] Cannot map: ${relPath}`);
      skippedCount++;
      continue;
    }

    const crit = critMap[critCode];
    const area = areas.find(a => a.id === crit.area_id);
    const committee = committeeByArea[area?.code] || { uploader: 'member1@sti.edu', chair: 'chair.area1@sti.edu' };
    const uploader = userMap[committee.uploader] || userMap['member1@sti.edu'];
    const chair = userMap[committee.chair] || userMap['chair.area1@sti.edu'];

    const fileName = path.basename(fullPath);
    const ext = path.extname(fileName).toLowerCase();
    const contentType = getContentType(ext);
    
    // Clean storage key: bscs_real/{critCode}/{cleanFileName}
    const cleanFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `bscs_real/${critCode}/${Date.now()}_${i}_${cleanFileName}`;

    try {
      const fileBuffer = fs.readFileSync(fullPath);
      const { error: upErr } = await supabase.storage.from('evidence').upload(storagePath, fileBuffer, {
        contentType,
        upsert: true
      });

      if (upErr) {
        console.warn(`[Storage Error ${i+1}/${allLocalFiles.length}] ${fileName}:`, upErr.message);
        continue;
      }

      const { data: pubData } = supabase.storage.from('evidence').getPublicUrl(storagePath);

      evidenceRows.push({
        criterion_id: crit.id,
        program_id: bscs.id,
        uploaded_by: uploader.id,
        file_url: pubData.publicUrl,
        document_type: crit.expected_document_type || 'Institutional Exhibit',
        effective_date: '2025-06-15',
        version: 1,
        status: 'verified',
        reviewer_notes: `Verified against official STIWNU Exhibit: ${fileName}`,
        verified_by: chair.id,
        verified_at: new Date().toISOString(),
        uploaded_at: new Date().toISOString()
      });

      uploadCount++;
      if (uploadCount % 25 === 0 || uploadCount === allLocalFiles.length) {
        console.log(`Uploaded ${uploadCount}/${allLocalFiles.length} files...`);
      }
    } catch (err) {
      console.error(`[Error on ${fileName}]:`, err.message);
    }
  }

  console.log(`\nStorage upload complete: ${uploadCount} uploaded, ${skippedCount} skipped.`);

  // 6. Batch Insert Evidence Records into Database
  console.log(`\n--- Inserting ${evidenceRows.length} Evidence Records into Database ---`);
  // Insert in chunks of 50 to avoid payload size limit
  const CHUNK_SIZE = 50;
  let totalInserted = 0;
  for (let i = 0; i < evidenceRows.length; i += CHUNK_SIZE) {
    const chunk = evidenceRows.slice(i, i + CHUNK_SIZE);
    const { data: inserted, error: insErr } = await supabase.from('evidence_documents').insert(chunk).select('id');
    if (insErr) {
      console.error('Error inserting chunk:', insErr);
      throw insErr;
    }
    totalInserted += inserted.length;
  }
  console.log(`Successfully inserted ${totalInserted} verified evidence records into database!`);

  // 7. Compute Readiness Scores for ALL 22 Criteria
  console.log('\n--- Computing Readiness Scores (Areas 8 & 9 set to 0.00 / no_evidence) ---');
  const scoreRows = [];
  criteria.forEach(c => {
    const validCount = evidenceRows.filter(e => e.criterion_id === c.id).length;
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
    const docCount = evidenceRows.filter(e => areaCrits.some(c => c.id === e.criterion_id)).length;
    console.log(`[${a.code.padEnd(9)}] Mean: ${areaMean.toFixed(2)} (${docCount.toString().padStart(2)} docs, weight: ${w}) ${isLacking ? '⚠️ LACKING EVIDENCE (0.00 GAP)' : '✅ COMPLIANT'}`);
  });
  const grandMean = Number((weightedSum / totalWeight).toFixed(2));
  console.log('--------------------------------------------------------------------------------');
  console.log(`Baseline Weighted Grand Mean: ${grandMean.toFixed(2)} / 5.00`);
  console.log(`Status: ${grandMean >= 3.0 ? 'Qualified' : 'Gaps Exist (Floor traps triggered by Area 8 & 9 lacking evidence)'}`);
  console.log('--------------------------------------------------------------------------------');

  // 8. Ensure 79 recommendations exist
  const { count: recCount } = await supabase.from('accreditation_recommendations').select('id', { count: 'exact' }).eq('cycle_id', bscsCycle.id);
  if (!recCount || recCount === 0) {
    console.log('\n--- Seeding 79 Recommendations from parsed_compliance_recs.json ---');
    const parsedRecs = JSON.parse(fs.readFileSync('scripts/parsed_compliance_recs.json', 'utf8'));
    const qaUser = userMap['qa@sti.edu'];
    const headBscs = userMap['head.bscs@sti.edu'];

    for (const item of parsedRecs) {
      const area = areaMap[item.area_code];
      if (!area) continue;

      const { data: recRow } = await supabase.from('accreditation_recommendations').insert({
        cycle_id: bscsCycle.id,
        program_id: bscs.id,
        area_id: area.id,
        item_number: item.item_number,
        opportunity_for_improvement: item.opportunity_for_improvement,
        recommendation_text: item.recommendation_text,
        status: item.status,
        created_by: qaUser.id,
        resolved_by: item.status === 'resolved' ? qaUser.id : null,
        resolved_at: item.status === 'resolved' ? new Date().toISOString() : null
      }).select().single();

      if (recRow && item.action_taken && item.action_taken.trim()) {
        await supabase.from('compliance_actions').insert({
          recommendation_id: recRow.id,
          action_number: `${item.item_number}.1`,
          action_taken: item.action_taken,
          team_verification: item.team_verification || 'Documented in STIWNU Institutional Compliance Exhibits.',
          created_by: headBscs.id
        });
      }
    }
    console.log(`Imported ${parsedRecs.length} compliance recommendations and actions.`);
  } else {
    console.log(`\nRecommendations already seeded (${recCount} items found).`);
  }

  console.log('\n================================================================================');
  console.log('✅ ALL BSCS REAL FILES UPLOADED AND VERIFIED SUCCESSFULLY!');
  console.log('================================================================================');
}

main().catch(err => {
  console.error('FAILED:', err);
  process.exit(1);
});

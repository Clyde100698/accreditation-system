const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const env = {};
fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf8').split(/\r?\n/).forEach(l => {
  const i = l.indexOf('=');
  if (i > 0) env[l.slice(0, i).trim()] = l.slice(i + 1).trim();
});
const URL = env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SERVICE = env.SUPABASE_SERVICE_ROLE_KEY;
const admin = createClient(URL, SERVICE, { auth: { persistSession: false } });

const PASSWORD = process.argv[2] || 'password123';

// Roles to test
const testEmails = [
  'alumni@sti.edu',        // alumni_rep
  'student@sti.edu',       // student_rep
  'admin@sti.edu',         // system_admin
  'bsit.faculty1@sti.edu', // faculty from different program (BSIT)
  'member1@sti.edu',       // faculty from matching program (BSCS)
  'qa@sti.edu',            // qa
  'dean.cict@sti.edu',     // dean
];

(async () => {
  console.log('========================================================================');
  console.log('ACC-SYSTEM SECURITY & STORAGE RETEST');
  console.log('Timestamp:', new Date().toISOString());
  console.log('========================================================================\n');

  // Fetch profiles
  const { data: profiles } = await admin.from('users').select('id,email,role,program_id,department_id');
  const { data: progs } = await admin.from('programs').select('id,code');
  const bscs = progs.find(p => p.code === 'BSCS');
  const bsit = progs.find(p => p.code === 'BSIT');

  // Check bucket privacy status
  const { data: bucketInfo } = await admin.storage.getBucket('evidence');
  console.log(`[STORAGE BUCKET STATUS] Bucket 'evidence' is: ${bucketInfo ? (bucketInfo.public ? 'PUBLIC' : 'PRIVATE') : 'UNKNOWN'}\n`);

  // Grab sample evidence documents
  const { data: bscsEvSample } = await admin.from('evidence_documents').select('id, file_url, program_id, document_type').eq('program_id', bscs.id).limit(10);
  const sampleInternal = (bscsEvSample || []).find(e => e.file_url && e.file_url.includes('/storage/v1/object/'));
  const { data: extEvSample } = await admin.from('evidence_documents').select('id, file_url, program_id, document_type').not('file_url', 'like', '%/storage/v1/object/%').limit(1);
  const sampleExternal = extEvSample && extEvSample[0];

  console.log('Sample Internal Doc ID:', sampleInternal?.id);
  console.log('Sample External Doc ID:', sampleExternal?.id);
  console.log('------------------------------------------------------------------------\n');

  // ==========================================================================
  // PART 1: DATABASE LEVEL CHECKS ACROSS ROLES
  // ==========================================================================
  console.log('--- PART 1: DATABASE RLS ACCESS CHECKS ---');

  for (const email of testEmails) {
    const prof = profiles.find(p => p.email === email);
    if (!prof) {
      console.log(`[SKIP] No profile for ${email}`);
      continue;
    }
    const c = createClient(URL, ANON, { auth: { persistSession: false } });
    const { data: authRes, error: authErr } = await c.auth.signInWithPassword({ email, password: PASSWORD });
    if (authErr) {
      console.log(`[ERROR] Sign-in failed for ${email} (${prof.role}):`, authErr.message);
      continue;
    }

    console.log(`\n>>> User: [REDACTED_USER] | Role: ${prof.role} | Program: ${prof.program_id === bscs.id ? 'BSCS' : prof.program_id === bsit.id ? 'BSIT' : 'Dept-Wide'}`);

    // 1. SELECT evidence_documents
    const evSel = await c.from('evidence_documents').select('id, program_id, document_type', { count: 'exact' });
    console.log(`  1. SELECT evidence_documents: returned=${evSel.data ? evSel.data.length : 0} rows, total_count=${evSel.count ?? 'null'} ${evSel.error ? 'ERR: ' + evSel.error.message : ''}`);
    if (evSel.data && evSel.data.length > 0) {
      const bscsCount = evSel.data.filter(d => d.program_id === bscs.id).length;
      const bsitCount = evSel.data.filter(d => d.program_id === bsit.id).length;
      console.log(`     (BSCS evidence: ${bscsCount}, BSIT evidence: ${bsitCount})`);
    }

    // 2. SELECT accreditation_recommendations
    const recSel = await c.from('accreditation_recommendations').select('id', { count: 'exact', head: true });
    console.log(`  2. SELECT recommendations: count=${recSel.count ?? 0} ${recSel.error ? 'ERR: ' + recSel.error.message : ''}`);

    // 3. SELECT compliance_actions
    const actSel = await c.from('compliance_actions').select('id', { count: 'exact', head: true });
    console.log(`  3. SELECT compliance_actions: count=${actSel.count ?? 0} ${actSel.error ? 'ERR: ' + actSel.error.message : ''}`);

    // 4. INSERT simulations
    const simIns = await c.from('simulations').insert({
      created_by: prof.id,
      program_id: bscs.id,
      simulated_criteria_ids: [],
      projected_score: 3.5,
    }).select('id');
    if (simIns.error) {
      console.log(`  4. INSERT simulations: BLOCKED (${simIns.error.message})`);
    } else {
      console.log(`  4. INSERT simulations: ALLOWED (row ${simIns.data[0]?.id})`);
      // Delete test row with service key
      if (simIns.data?.[0]?.id) {
        await admin.from('simulations').delete().eq('id', simIns.data[0].id);
      }
    }

    // 5. MANAGE compliance_actions (INSERT test)
    const testActionNumber = 'TEST.1';
    const { data: recRow } = await admin.from('accreditation_recommendations').select('id').limit(1).single();
    if (recRow) {
      const actIns = await c.from('compliance_actions').insert({
        recommendation_id: recRow.id,
        action_number: testActionNumber,
        action_taken: 'Test action',
        team_verification: 'Test verification',
        created_by: prof.id,
      }).select('id');
      if (actIns.error) {
        console.log(`  5. MANAGE compliance_actions (INSERT): BLOCKED (${actIns.error.message})`);
      } else {
        console.log(`  5. MANAGE compliance_actions (INSERT): ALLOWED (row ${actIns.data[0]?.id})`);
        if (actIns.data?.[0]?.id) {
          await admin.from('compliance_actions').delete().eq('id', actIns.data[0].id);
        }
      }
    }

    await c.auth.signOut();
  }

  // ==========================================================================
  // PART 2: STORAGE & SIGNED URL TESTS
  // ==========================================================================
  console.log('\n\n--- PART 2: STORAGE & SIGNED URL ROUTE SECURITY CHECKS ---');

  // Test 1: Public URL direct access for 3 sample files
  console.log('\n[TEST 2.1: DIRECT PUBLIC STORAGE URL HTTP FETCH]');
  const sampleUrls = bscsEvSample.filter(e => e.file_url.includes('/storage/v1/object/')).slice(0, 3).map(e => e.file_url);
  for (let idx = 0; idx < sampleUrls.length; idx++) {
    const rawUrl = sampleUrls[idx];
    try {
      const resp = await fetch(rawUrl, { method: 'GET' });
      const maskedUrl = rawUrl.replace(/\/evidence\/.+$/, '/evidence/[REDACTED_OBJECT_' + (idx + 1) + ']');
      console.log(`  File ${idx + 1}: ${maskedUrl} -> HTTP ${resp.status} ${resp.statusText}`);
    } catch (err) {
      console.log(`  File ${idx + 1}: fetch error -> ${err.message}`);
    }
  }

  // Test 2: Unauthenticated request to /api/evidence/signed-url
  console.log('\n[TEST 2.2: UNAUTHENTICATED REQUEST TO SIGNED-URL ROUTE]');
  try {
    const unauthResp = await fetch('http://localhost:3000/api/evidence/signed-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ documentId: sampleInternal.id }),
    });
    const unauthBody = await unauthResp.json().catch(() => ({}));
    console.log(`  Unauthenticated status: HTTP ${unauthResp.status} -> ${JSON.stringify(unauthBody)}`);
  } catch (err) {
    console.log(`  Unauthenticated fetch error: ${err.message}`);
  }

  // Test 3: Role-based requests to /api/evidence/signed-url
  console.log('\n[TEST 2.3: ROLE-BASED ACCESS TO /api/evidence/signed-url]');
  for (const email of testEmails) {
    const prof = profiles.find(p => p.email === email);
    if (!prof) continue;

    const c = createClient(URL, ANON, { auth: { persistSession: false } });
    const { data: authRes } = await c.auth.signInWithPassword({ email, password: PASSWORD });
    const token = authRes?.session?.access_token;
    if (!token) continue;

    // Test BSCS internal document
    try {
      const resp = await fetch('http://localhost:3000/api/evidence/signed-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ documentId: sampleInternal.id }),
      });
      const body = await resp.json().catch(() => ({}));
      const outcome = resp.ok ? `200 OK (signedUrl generated: isExternal=${body.isExternal})` : `${resp.status} ${resp.statusText} (${body.error})`;
      console.log(`  Role '${prof.role}' (${prof.program_id === bscs.id ? 'BSCS' : prof.program_id === bsit.id ? 'BSIT' : 'Dept'}) requesting BSCS doc -> ${outcome}`);
    } catch (e) {
      console.log(`  Role '${prof.role}' fetch error: ${e.message}`);
    }

    // If QA, Dean, or BSCS Faculty: test external link row
    if (['qa', 'dean', 'faculty'].includes(prof.role) && (prof.role !== 'faculty' || prof.program_id === bscs.id) && sampleExternal) {
      try {
        const extResp = await fetch('http://localhost:3000/api/evidence/signed-url', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ documentId: sampleExternal.id }),
        });
        const extBody = await extResp.json().catch(() => ({}));
        console.log(`     -> External link test: HTTP ${extResp.status} (isExternal=${extBody.isExternal}, url=[REDACTED_EXT_LINK])`);
      } catch (e) {}
    }

    await c.auth.signOut();
  }

  console.log('\n========================================================================');
  console.log('RETEST COMPLETE');
  console.log('========================================================================');
})();

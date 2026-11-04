const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// 1. Load Supabase Environment
const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
  const [k, ...v] = line.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim();
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const DIR8 = 'c:\\Users\\Acer\\Downloads\\Area VIII. (Community Extension Program)';
const DIR9 = 'c:\\Users\\Acer\\Downloads\\BSCS Area 9-Physical Plant (Final Copy)';

async function run() {
  console.log('--- Step 1: Clean Orphaned Files in Storage ---');
  const { data: dbDocs } = await supabase.from('evidence_documents').select('file_url');
  const activeUrls = new Set(dbDocs.map(d => d.file_url));

  const { data: rootItems } = await supabase.storage.from('evidence').list('bscs_real');
  const filesToDelete = [];
  if (rootItems) {
    for (const item of rootItems) {
      if (item.metadata) {
        const publicUrl = supabase.storage.from('evidence').getPublicUrl('bscs_real/' + item.name).data.publicUrl;
        if (!activeUrls.has(publicUrl)) {
          filesToDelete.push('bscs_real/' + item.name);
        }
      }
    }
  }

  if (filesToDelete.length > 0) {
    console.log(`Deleting ${filesToDelete.length} orphaned files from bscs_real root to free up ~46MB...`);
    const { error: delErr } = await supabase.storage.from('evidence').remove(filesToDelete);
    if (delErr) console.error('Deletion error:', delErr);
    else console.log('Successfully cleaned orphaned files!');
  }

  console.log('\n--- Step 2: Fetch Criteria for Area VIII & Area IX ---');
  const { data: criteria } = await supabase
    .from('accreditation_criteria')
    .select('id, code, title, area_id, accreditation_areas(code)')
    .order('code');

  const critMap = {};
  criteria.forEach(c => {
    critMap[c.code] = c;
  });

  const { data: users } = await supabase.from('users').select('id, program_id').limit(1);
  const uploaderId = users[0].id;
  const programId = users[0].program_id;

  // Criteria mapping heuristics for Area 8
  function mapArea8Criterion(relPath, fileName) {
    const p = relPath.toLowerCase();
    const fn = fileName.toLowerCase();
    if (p.includes('knowledge of the community') || fn.includes('needs assessment') || fn.includes('survey')) return critMap['VIII.2'] || critMap['VIII.1'];
    if (p.includes('community relations') || fn.includes('linkage') || fn.includes('moa') || fn.includes('partner')) return critMap['VIII.8'] || critMap['VIII.1'];
    if (fn.includes('deped als') || fn.includes('digital literacy') || fn.includes('training') || fn.includes('it literacy')) return critMap['VIII.7'] || critMap['VIII.1'];
    if (fn.includes('alumni') || fn.includes('speaker')) return critMap['VIII.3'] || critMap['VIII.1'];
    if (fn.includes('monitoring') || fn.includes('evaluation') || fn.includes('post activity')) return critMap['VIII.4'] || critMap['VIII.1'];
    if (fn.includes('adopted barangay') || fn.includes('outreach') || p.includes('community service')) return critMap['VIII.5'] || critMap['VIII.1'];
    if (fn.includes('impact') || p.includes('desired outcomes')) return critMap['VIII.6'] || critMap['VIII.1'];
    if (p.includes('exhibit 1')) return critMap['VIII.1'];
    if (p.includes('exhibit 2')) return critMap['VIII.7'];
    if (p.includes('exhibit 3')) return critMap['VIII.5'];
    if (p.includes('exhibit 4')) return critMap['VIII.4'];
    return critMap['VIII.1'];
  }

  // Criteria mapping heuristics for Area 9
  function mapArea9Criterion(relPath, fileName) {
    const p = relPath.toLowerCase();
    const fn = fileName.toLowerCase();
    if (p.includes('exhibit 9.1') || fn.includes('waste disposal') || p.includes('area 9.c') || fn.includes('structural') || fn.includes('building inspection')) return critMap['IX.1'];
    if (p.includes('exhibit 9.2') || p.includes('area 9.a') || p.includes('area 9.e') || p.includes('area 9.f') || fn.includes('access') || fn.includes('security measures') || fn.includes('evacuation')) return critMap['IX.2'];
    if (p.includes('exhibit 9.4') || p.includes('exhibit 9.5') || fn.includes('safety') || fn.includes('hallways') || fn.includes('corridor') || fn.includes('traffic')) return critMap['IX.3'];
    if (p.includes('area 9.b') || p.includes('development plan') || fn.includes('master plan') || fn.includes('campus plan')) return critMap['IX.4'];
    if (p.includes('exhibit 9.6') || fn.includes('trash bins') || fn.includes('greening') || fn.includes('recycling') || fn.includes('landscape')) return critMap['IX.5'];
    if (p.includes('area 9.d') || fn.includes('tile') || fn.includes('repair') || fn.includes('walkway') || fn.includes('classrooms')) return critMap['IX.6'];
    if (p.includes('exhibit 9.3') || p.includes('area 9.g') || fn.includes('water') || fn.includes('potability') || fn.includes('restroom') || fn.includes('sanitation')) return critMap['IX.7'];
    return critMap['IX.1'];
  }

  console.log('\n--- Step 3: Collect PDFs to Upload ---');
  const uploadQueue = [];

  // Area 8
  function walk8(d) {
    fs.readdirSync(d, { withFileTypes: true }).forEach(e => {
      const full = path.join(d, e.name);
      if (e.isDirectory()) walk8(full);
      else if (path.extname(e.name).toLowerCase() === '.pdf') {
        const rel = path.relative(DIR8, full);
        const crit = mapArea8Criterion(rel, e.name);
        uploadQueue.push({
          areaCode: 'VIII',
          criterion: crit,
          fullPath: full,
          fileName: e.name,
          relPath: rel,
          folderName: path.dirname(rel).replace(/\\/g, ' / ') || 'General Exhibits',
          size: fs.statSync(full).size
        });
      }
    });
  }
  walk8(DIR8);

  // Area 9 (skip draft working folder and compiled monolithic duplicate PDFs)
  function walk9(d) {
    fs.readdirSync(d, { withFileTypes: true }).forEach(e => {
      const full = path.join(d, e.name);
      if (e.isDirectory()) {
        if (!e.name.includes('Working Folder')) walk9(full);
      } else if (path.extname(e.name).toLowerCase() === '.pdf') {
        // Skip giant monolithic complete bundles if individual exhibits exist
        if (e.name === 'Area 9 COMPLETE COMPLIANCE EXHIBITS.pdf' || e.name === 'Area 9 Complete Minimum Virtual Requirements.pdf') {
          return;
        }
        const rel = path.relative(DIR9, full);
        const crit = mapArea9Criterion(rel, e.name);
        uploadQueue.push({
          areaCode: 'IX',
          criterion: crit,
          fullPath: full,
          fileName: e.name,
          relPath: rel,
          folderName: path.dirname(rel).replace(/\\/g, ' / ') || 'Physical Plant Exhibits',
          size: fs.statSync(full).size
        });
      }
    });
  }
  walk9(DIR9);

  console.log(`Total PDF exhibits queued: ${uploadQueue.length}`);
  const totalUploadBytes = uploadQueue.reduce((s, x) => s + x.size, 0);
  console.log(`Total upload payload: ${(totalUploadBytes / (1024 * 1024)).toFixed(2)} MB`);

  console.log('\n--- Step 4: Uploading to Supabase Storage & Database ---');
  let successCount = 0;
  let skipCount = 0;
  let failCount = 0;

  for (let i = 0; i < uploadQueue.length; i++) {
    const item = uploadQueue[i];
    const critCode = item.criterion ? item.criterion.code : (item.areaCode === 'VIII' ? 'VIII.1' : 'IX.1');
    const critId = item.criterion ? item.criterion.id : (item.areaCode === 'VIII' ? critMap['VIII.1'].id : critMap['IX.1'].id);

    // Clean safe filename for Supabase storage
    const cleanFn = item.fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `bscs_real/${critCode}/${Date.now()}_${i}_${cleanFn}`;

    try {
      const buffer = fs.readFileSync(item.fullPath);
      const { error: uploadError } = await supabase.storage.from('evidence').upload(storagePath, buffer, {
        contentType: 'application/pdf',
        upsert: true
      });

      if (uploadError) {
        console.error(`[${i + 1}/${uploadQueue.length}] Storage error for ${item.fileName}:`, uploadError.message);
        failCount++;
        continue;
      }

      const fileUrl = supabase.storage.from('evidence').getPublicUrl(storagePath).data.publicUrl;

      const reviewerNotes = JSON.stringify({
        fileName: item.fileName,
        folderName: item.folderName,
        areaFolder: item.areaCode === 'VIII' ? 'Area 08 - Community Extension' : 'Area 09 - Physical Plant',
        relativePath: item.relPath
      });

      const { error: insertError } = await supabase.from('evidence_documents').insert({
        criterion_id: critId,
        uploaded_by: uploaderId,
        program_id: programId,
        file_url: fileUrl,
        document_type: 'Compliance Verification Exhibit',
        effective_date: '2025-09-01',
        status: 'verified',
        version: 1,
        reviewer_notes: reviewerNotes
      });

      if (insertError) {
        console.error(`[${i + 1}/${uploadQueue.length}] DB insert error for ${item.fileName}:`, insertError.message);
        failCount++;
      } else {
        successCount++;
        if ((i + 1) % 15 === 0 || i === uploadQueue.length - 1) {
          console.log(`Progress: [${i + 1}/${uploadQueue.length}] uploaded and verified...`);
        }
      }
    } catch (err) {
      console.error(`Error on file ${item.fileName}:`, err.message);
      failCount++;
    }
  }

  console.log(`\nUpload complete! Successfully uploaded: ${successCount}, Failed: ${failCount}`);

  console.log('\n--- Step 5: Recalculate Readiness Scores for Area VIII & Area IX ---');
  const targetAreaIds = [critMap['VIII.1'].area_id, critMap['IX.1'].area_id];
  const { data: targetCriteria } = await supabase.from('accreditation_criteria').select('id, code, required_count').in('area_id', targetAreaIds);

  for (const c of targetCriteria) {
    const { count } = await supabase.from('evidence_documents').select('*', { count: 'exact', head: true }).eq('criterion_id', c.id);
    const score = (count || 0) >= (c.required_count || 1) ? 5.00 : ((count || 0) > 0 ? 3.00 : 0.00);
    const status = score >= 5.0 ? 'sufficient' : (score > 0 ? 'weak' : 'no_evidence');

    await supabase.from('readiness_scores').upsert({
      criterion_id: c.id,
      program_id: programId,
      score: score,
      status: status,
      last_computed_at: new Date().toISOString()
    }, { onConflict: 'criterion_id,program_id' });
  }

  console.log('Readiness scores recalculated!');
}

run().catch(console.error);

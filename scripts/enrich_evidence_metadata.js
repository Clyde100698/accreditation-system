const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
  const [k, ...v] = line.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim();
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

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

async function main() {
  console.log('Enriching evidence documents with folder and file metadata...');
  const localFiles = getAllFiles('BSCS_REAL_DATA').filter(f => !f.endsWith('BSCS Compliance Report.docx'));
  
  const fileMetaMap = {};
  localFiles.forEach(f => {
    const rel = path.relative('BSCS_REAL_DATA', f);
    const parts = rel.split(path.sep);
    const area = parts[0];
    const fileName = parts[parts.length - 1];
    const folder = parts.length > 2 ? parts.slice(1, -1).join(' / ') : parts[0];
    fileMetaMap[fileName] = {
      fileName,
      folderName: folder,
      areaFolder: area,
      relativePath: rel.replace(/\\/g, '/')
    };
  });

  const { data: docs, error: dErr } = await supabase.from('evidence_documents').select('id, reviewer_notes, file_url');
  if (dErr) throw dErr;

  console.log(`Found ${docs.length} documents in database.`);
  let matched = 0;

  for (const doc of docs) {
    const prefix = 'Verified against official STIWNU Exhibit: ';
    let fn = doc.reviewer_notes?.replace(prefix, '').trim();
    if (!fn && doc.file_url) {
      const raw = doc.file_url.split('/').pop()?.split('?')[0] || '';
      fn = decodeURIComponent(raw).replace(/^\d+_\d+_/, '');
    }

    if (fn && fileMetaMap[fn]) {
      const meta = fileMetaMap[fn];
      await supabase.from('evidence_documents').update({
        document_type: meta.folderName,
        reviewer_notes: JSON.stringify(meta)
      }).eq('id', doc.id);
      matched++;
    }
  }

  console.log(`Successfully enriched ${matched}/${docs.length} documents with exact folder & filename metadata!`);
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});

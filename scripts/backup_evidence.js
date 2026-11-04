const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const env = {};
fs.readFileSync('.env.local', 'utf8').split(/\r?\n/).forEach(l => {
  const i = l.indexOf('=');
  if (i > 0) env[l.slice(0, i).trim()] = l.slice(i + 1).trim();
});
const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

(async () => {
  const { data: rows, error } = await admin.from('evidence_documents').select('*');
  if (error) {
    console.error('Backup fetch error:', error);
    process.exit(1);
  }

  const backupDir = path.resolve('backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const jsonPath = path.join(backupDir, `evidence_documents_backup_${timestamp}.json`);
  const latestJsonPath = path.join(backupDir, `evidence_documents_backup_latest.json`);
  fs.writeFileSync(jsonPath, JSON.stringify(rows, null, 2), 'utf8');
  fs.writeFileSync(latestJsonPath, JSON.stringify(rows, null, 2), 'utf8');

  // CSV
  if (rows.length > 0) {
    const headers = Object.keys(rows[0]);
    const csvLines = [headers.join(',')];
    for (const r of rows) {
      const line = headers.map(h => {
        const val = r[h];
        if (val === null || val === undefined) return '';
        const s = String(val).replace(/"/g, '""');
        return `"${s}"`;
      }).join(',');
      csvLines.push(line);
    }
    const csvPath = path.join(backupDir, `evidence_documents_backup_${timestamp}.csv`);
    const latestCsvPath = path.join(backupDir, `evidence_documents_backup_latest.csv`);
    fs.writeFileSync(csvPath, csvLines.join('\n'), 'utf8');
    fs.writeFileSync(latestCsvPath, csvLines.join('\n'), 'utf8');
  }

  console.log(`Successfully backed up ${rows.length} rows from evidence_documents to:`);
  console.log(` - ${latestJsonPath}`);
  console.log(` - ${path.join(backupDir, `evidence_documents_backup_latest.csv`)}`);
})();

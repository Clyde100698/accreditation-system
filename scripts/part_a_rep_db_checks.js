// Part A check: what can alumni_rep / student_rep reach at the database + storage level, using THEIR OWN session.
// Reads .env.local; never prints keys. Service key is used only to look up the two profiles and to delete a test row.
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
const emails = process.argv[3] ? process.argv[3].split(',') : ['alumni@sti.edu', 'student@sti.edu'];

(async () => {
  const { data: profiles, error: pe } = await admin.from('users').select('id,email,role,program_id,department_id,auth_user_id,is_active').in('email', emails);
  console.log('PROFILES (service lookup):', JSON.stringify(profiles), pe ? pe.message : '');
  const { data: ev1 } = await admin.from('evidence_documents').select('*').limit(1);
  const sample = ev1 && ev1[0];
  console.log('evidence sample columns:', sample ? Object.keys(sample).join(',') : 'none');
  const { data: progs } = await admin.from('programs').select('id,code');
  const bscs = progs.find(p => p.code === 'BSCS');

  for (const email of emails) {
    console.log('\n================ ' + email + ' ================');
    const prof = (profiles || []).find(p => p.email === email);
    if (!prof) { console.log('NO PROFILE ROW for this email'); continue; }
    const c = createClient(URL, ANON, { auth: { persistSession: false } });
    const { data: si, error: se } = await c.auth.signInWithPassword({ email, password: PASSWORD });
    if (se) { console.log('SIGN-IN FAILED:', se.message); continue; }
    console.log('signed in as role=' + prof.role);

    // 1 simulations insert
    const ins = await c.from('simulations').insert({ created_by: prof.id, program_id: bscs.id, simulated_criteria_ids: [], projected_score: 0 }).select('id');
    console.log('1. INSERT simulations ->', ins.error ? 'FAILED: ' + ins.error.message : 'SUCCEEDED, row ' + JSON.stringify(ins.data));
    if (!ins.error && ins.data && ins.data[0]) {
      await admin.from('simulations').delete().eq('id', ins.data[0].id);
      console.log('   (test row deleted with service key)');
    }

    // 2 evidence select
    const ev = await c.from('evidence_documents').select('id,file_url,document_type,status', { count: 'exact' }).limit(3);
    console.log('2. SELECT evidence_documents -> rows returned:', ev.data ? ev.data.length : 0, 'total count:', ev.count, ev.error ? 'ERR ' + ev.error.message : '');
    if (ev.data && ev.data[0]) console.log('   first row:', JSON.stringify(ev.data[0]).slice(0, 220));

    // 3 recs + actions
    const rc = await c.from('accreditation_recommendations').select('id', { count: 'exact', head: true });
    console.log('3a. SELECT accreditation_recommendations -> count:', rc.count, rc.error ? 'ERR ' + rc.error.message : '');
    const ac = await c.from('compliance_actions').select('id,linked_evidence_id', { count: 'exact' }).limit(2);
    console.log('3b. SELECT compliance_actions -> count:', ac.count, 'sample:', JSON.stringify(ac.data), ac.error ? 'ERR ' + ac.error.message : '');

    // 4 storage
    const url = ev.data && ev.data[0] && ev.data[0].file_url;
    if (url) {
      try {
        const r = await fetch(url, { method: 'GET' });
        console.log('4a. GET stored file URL (as plain HTTP) ->', r.status, r.headers.get('content-type'), 'bytes=' + (await r.arrayBuffer()).byteLength);
      } catch (e) { console.log('4a. fetch error', e.message); }
      const m = url.match(/\/object\/(?:public\/)?evidence\/(.+)$/);
      if (m) {
        const dl = await c.storage.from('evidence').download(decodeURIComponent(m[1]));
        console.log('4b. storage.download as this role ->', dl.error ? 'FAILED: ' + dl.error.message : 'SERVED ' + dl.data.size + ' bytes');
      }
    } else console.log('4. no evidence file_url visible to this role, storage not tested');
    await c.auth.signOut();
  }
})();

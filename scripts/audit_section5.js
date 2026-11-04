const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
const env = {};
fs.readFileSync('.env.local', 'utf8').split(/\r?\n/).forEach(l => {
  const i = l.indexOf('=');
  if (i > 0) env[l.slice(0, i).trim()] = l.slice(i + 1).trim();
});
const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

(async () => {
  const { data: bscs } = await admin.from('programs').select('id,code').eq('code', 'BSCS').single();
  const { data: areas } = await admin.from('accreditation_areas').select('id,code,title').order('display_order');
  const areaCodeMap = new Map(areas.map(a => [a.id, a.code]));

  const { data: criteria } = await admin.from('accreditation_criteria').select('*').order('code');
  const { data: scores } = await admin.from('readiness_scores').select('*').eq('program_id', bscs.id);
  const { data: allEv } = await admin.from('evidence_documents').select('*').eq('program_id', bscs.id);

  const scoreMap = new Map((scores || []).map(s => [s.criterion_id, s]));
  const evByCrit = new Map();
  for (const ev of (allEv || [])) {
    if (!evByCrit.has(ev.criterion_id)) evByCrit.set(ev.criterion_id, []);
    evByCrit.get(ev.criterion_id).push(ev);
  }

  // 1. Overall stats across all verified evidence for BSCS
  const fiveYearsAgo = new Date();
  fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);

  let totalBSCSDocs = allEv.length;
  let verifiedCount = 0;
  let pendingCount = 0;
  let rejectedCount = 0;
  let validCount = 0;
  let typeMismatchCount = 0;
  let dateExcludedCount = 0;

  const critMap = new Map(criteria.map(c => [c.id, c]));

  for (const ev of allEv) {
    if (ev.status === 'verified') verifiedCount++;
    else if (ev.status === 'pending') pendingCount++;
    else if (ev.status === 'rejected') rejectedCount++;

    if (ev.status === 'verified') {
      const crit = critMap.get(ev.criterion_id);
      const isTypeMatch = !crit || !crit.expected_document_type || ev.document_type === crit.expected_document_type;
      const isDateValid = !ev.effective_date || new Date(ev.effective_date) >= fiveYearsAgo;

      if (!isTypeMatch) typeMismatchCount++;
      if (!isDateValid) dateExcludedCount++;
      if (isTypeMatch && isDateValid) validCount++;
    }
  }

  console.log('=== OVERALL BSCS EVIDENCE AUDIT ===');
  console.log({
    totalBSCSDocs,
    verifiedCount,
    pendingCount,
    rejectedCount,
    validCount,
    typeMismatchCount,
    dateExcludedCount,
  });

  // 2. Areas IV, V, VII breakdown
  const targetAreaCodes = ['Area IV', 'Area V', 'Area VII'];
  const lowCriteria = [];

  for (const crit of criteria) {
    const areaCode = areaCodeMap.get(crit.area_id);
    if (!targetAreaCodes.includes(areaCode)) continue;

    const s = scoreMap.get(crit.id);
    const scoreVal = s ? Number(s.score) : 0;

    // Check if score is 0 or between 1 and 2 (inclusive)
    if (scoreVal === 0 || (scoreVal >= 1 && scoreVal <= 2)) {
      const evs = evByCrit.get(crit.id) || [];
      const verified = evs.filter(e => e.status === 'verified');
      const pending = evs.filter(e => e.status === 'pending');
      const rejected = evs.filter(e => e.status === 'rejected');

      const matches = verified.filter(e => {
        const typeMatch = !crit.expected_document_type || e.document_type === crit.expected_document_type;
        const dateMatch = !e.effective_date || new Date(e.effective_date) >= fiveYearsAgo;
        return typeMatch && dateMatch;
      });

      const typeMismatches = verified.filter(e => crit.expected_document_type && e.document_type !== crit.expected_document_type);
      const dateExpired = verified.filter(e => e.effective_date && new Date(e.effective_date) < fiveYearsAgo);

      let reason = '';
      if (evs.length === 0) {
        reason = 'No evidence uploaded';
      } else if (verified.length === 0) {
        reason = `Evidence not verified (${pending.length} pending, ${rejected.length} rejected)`;
      } else if (matches.length === 0) {
        if (typeMismatches.length > 0 && dateExpired.length > 0) {
          reason = `Document type mismatch & expired date window`;
        } else if (typeMismatches.length > 0) {
          reason = `Document type mismatch (${typeMismatches.length} verified docs have different type)`;
        } else if (dateExpired.length > 0) {
          reason = `Older than five years (${dateExpired.length} docs older than ${fiveYearsAgo.toISOString().split('T')[0]})`;
        } else {
          reason = 'Evidence invalid';
        }
      } else if (matches.length < (crit.required_count || 1)) {
        reason = `Partial count: ${matches.length} valid of ${crit.required_count} required (score = ${(2 * matches.length / crit.required_count).toFixed(2)})`;
      }

      lowCriteria.push({
        area: areaCode,
        code: crit.code,
        title: crit.title,
        expectedType: crit.expected_document_type,
        requiredCount: crit.required_count || 1,
        score: scoreVal,
        totalUploaded: evs.length,
        verifiedCount: verified.length,
        validMatches: matches.length,
        sampleUploadedTypes: [...new Set(evs.map(e => e.document_type))],
        sampleDates: evs.map(e => e.effective_date).filter(Boolean).slice(0, 3),
        reason,
      });
    }
  }

  console.log('\n=== LOW CRITERIA IN AREAS IV, V, VII ===');
  console.log(JSON.stringify(lowCriteria, null, 2));

  // Area Means
  console.log('\n=== AREA MEANS ===');
  for (const ac of targetAreaCodes) {
    const areaId = areas.find(a => a.code === ac).id;
    const crits = criteria.filter(c => c.area_id === areaId);
    const areaScores = crits.map(c => scoreMap.get(c.id)?.score || 0);
    const mean = areaScores.reduce((a, b) => a + b, 0) / crits.length;
    console.log(`${ac}: ${mean.toFixed(2)} (${crits.length} criteria)`);
  }
})();

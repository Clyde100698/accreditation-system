const fs = require('fs');

const recs = JSON.parse(fs.readFileSync('scripts/parsed_compliance_recs.json', 'utf8'));
const content = fs.readFileSync('scripts/migrate_to_79_criteria.js', 'utf8');
const titlesMapMatch = content.match(/const TITLES_MAP = ({[\s\S]*?});/);
const TITLES_MAP = eval('(' + titlesMapMatch[1] + ')');

const romanMap = {
  'I': 0, 'II': 1, 'III': 2, 'IV': 3, 'V': 4,
  'VI': 5, 'VII': 6, 'VIII': 7, 'IX': 8, 'X': 9
};

const lines = ['export const INITIAL_CRITERIA: AccreditationCriterion[] = ['];

recs.forEach(r => {
  const roman = r.area_code.replace('Area ', '');
  const code = roman + '.' + r.item_number;
  const areaIdx = romanMap[roman];
  const title = TITLES_MAP[code] || r.recommendation_text.split('\n')[0].substring(0, 80);
  
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

  lines.push('  {');
  lines.push(`    id: 'crit-${code.toLowerCase().replace('.', '-')}',`);
  lines.push(`    framework_id: 'fw-pacucoa',`);
  lines.push(`    area_id: 'area-${areaIdx + 1}',`);
  lines.push(`    code: '${code}',`);
  lines.push(`    title: ${JSON.stringify(title)},`);
  lines.push(`    weight: 1.0,`);
  lines.push(`    required_count: ${reqCount},`);
  lines.push(`    expected_document_type: ${JSON.stringify(expectedArtifact.substring(0, 150))},`);
  lines.push(`    parent_criterion_id: null,`);
  lines.push(`    rating_axis: 'single',`);
  lines.push(`    program_id: null,`);
  lines.push(`    accreditation_areas: INITIAL_AREAS[${areaIdx}],`);
  lines.push('  },');
});

lines.push('];');

fs.writeFileSync('scripts/initial_criteria_79.ts', lines.join('\n'), 'utf8');
console.log('Generated scripts/initial_criteria_79.ts with ' + recs.length + ' criteria.');

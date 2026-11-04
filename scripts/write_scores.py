import re

with open('src/lib/mock-data.ts', 'r', encoding='utf-8') as f:
    code = f.read()

items = re.findall(r"id:\s*'(crit-[^']+)',\s*framework_id:\s*'[^']+',\s*area_id:\s*'([^']+)',\s*code:\s*'([^']+)'", code)

target_area_means = {
    'area-1': (3.00, 3.0),
    'area-2': (3.74, 3.0),
    'area-3': (3.00, 4.0),
    'area-4': (2.67, 3.0),
    'area-5': (2.82, 3.0),
    'area-6': (3.45, 3.0),
    'area-7': (1.30, 3.0),
    'area-8': (4.38, 3.0),
    'area-9': (5.00, 2.0),
    'area-10': (3.50, 3.0),
}

area_crits = {}
for cid, aid, ccode in items:
    area_crits.setdefault(aid, []).append((cid, ccode))

lines = []
score_idx = 1

for prog in ['prog-bscs', 'prog-bsit']:
    for aid, (target_mean, weight) in target_area_means.items():
        crits = area_crits[aid]
        n = len(crits)
        target_sum = round(target_mean * n, 2)
        base_val = round(target_sum / n, 2)
        current_scores = [base_val] * n
        diff = round(target_sum - sum(current_scores), 2)
        current_scores[-1] = round(current_scores[-1] + diff, 2)
        
        for (cid, ccode), score in zip(crits, current_scores):
            status = 'sufficient' if score >= 3.0 else ('weak' if score > 0 else 'no_evidence')
            lines.append(f"  {{ id: 'score-{score_idx}', criterion_id: '{cid}', program_id: '{prog}', score: {score:.2f}, status: '{status}', calculated_at: '2026-09-15' }},")
            score_idx += 1

ts_code = "export const INITIAL_SCORES: ReadinessScore[] = [\n" + "\n".join(lines) + "\n];"

with open('scripts/generated_scores.ts', 'w', encoding='utf-8') as f:
    f.write(ts_code)

print(f"Generated {score_idx - 1} scores successfully!")

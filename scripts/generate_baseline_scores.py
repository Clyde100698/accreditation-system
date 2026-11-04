import re

with open('src/lib/mock-data.ts', 'r', encoding='utf-8') as f:
    code = f.read()

# Extract all criteria
items = re.findall(r"id:\s*'(crit-[^']+)',\s*framework_id:\s*'[^']+',\s*area_id:\s*'([^']+)',\s*code:\s*'([^']+)'", code)
print(f"Total: {len(items)}")

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

total_weighted = 0
total_weight = 0

scores_output = []

for aid, (target_mean, weight) in target_area_means.items():
    crits = area_crits[aid]
    n = len(crits)
    target_sum = round(target_mean * n, 2)
    # create baseline scores that sum to target_sum
    # distribute evenly with slight variation
    base_val = round(target_sum / n, 2)
    current_scores = [base_val] * n
    diff = round(target_sum - sum(current_scores), 2)
    current_scores[-1] = round(current_scores[-1] + diff, 2)
    actual_mean = sum(current_scores) / n
    weighted = actual_mean * weight
    total_weighted += weighted
    total_weight += weight
    print(f"{aid}: count={n}, target={target_mean}, actual_mean={actual_mean:.2f}, weighted={weighted:.2f}")
    
    for (cid, ccode), score in zip(crits, current_scores):
        status = 'sufficient' if score >= 3.0 else ('weak' if score > 0 else 'no_evidence')
        scores_output.append((cid, ccode, aid, score, status))

overall = total_weighted / total_weight
print(f"\nTotal Weighted Value: {total_weighted:.2f} / {total_weight} = {overall:.2f}")

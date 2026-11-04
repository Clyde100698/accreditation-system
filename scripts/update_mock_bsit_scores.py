import re
import math

mock_path = r'src/lib/mock-data.ts'
with open(mock_path, 'r', encoding='utf-8') as f:
    text = f.read()

# Area profile for realistic Level II
area_profiles = {
    'i': 3.81,
    'ii': 3.93,
    'iii': 3.90,
    'iv': 3.77,
    'v': 3.66,
    'vi': 3.84,
    'vii': 3.74,
    'viii': 4.25,
    'ix': 4.09,
    'x': 3.85
}

def replace_score(match):
    score_id = match.group(1)
    crit_id = match.group(2)
    # Find area roman numeral from crit_id (e.g. crit-iv-3 -> iv)
    parts = crit_id.split('-')
    area_roman = parts[1] if len(parts) > 1 else 'i'
    crit_num = int(parts[2]) if len(parts) > 2 and parts[2].isdigit() else 1
    base = area_profiles.get(area_roman, 3.80)
    variance = math.sin(crit_num * 1.5) * 0.12
    final_score = round(max(3.55, min(5.0, base + variance)), 2)
    return f"id: '{score_id}', criterion_id: '{crit_id}', program_id: 'prog-bsit', score: {final_score:.2f}, status: 'sufficient'"

pattern = re.compile(r"id:\s*'(score-\d+)',\s*criterion_id:\s*'([^']+)',\s*program_id:\s*'prog-bsit',\s*score:\s*[\d\.]+,\s*status:\s*'[^']+'")
new_text, count = pattern.subn(replace_score, text)

print(f"Replaced {count} BSIT scores in mock-data.ts!")
with open(mock_path, 'w', encoding='utf-8') as f:
    f.write(new_text)

print("Saved updated mock-data.ts successfully!")


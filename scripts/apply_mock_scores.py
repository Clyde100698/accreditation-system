with open('src/lib/mock-data.ts', 'r', encoding='utf-8') as f:
    content = f.read()

with open('scripts/generated_scores.ts', 'r', encoding='utf-8') as f:
    scores_code = f.read()

# Replace INITIAL_SCORES
import re
new_content = re.sub(
    r'export const INITIAL_SCORES: ReadinessScore\[\] = \[.*?\];',
    scores_code,
    content,
    flags=re.DOTALL
)

# Replace STORAGE_KEY
new_content = new_content.replace(
    "const STORAGE_KEY = 'mock_accreditation_db_v2';",
    "const STORAGE_KEY = 'mock_accreditation_db_v3';"
)

with open('src/lib/mock-data.ts', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Updated src/lib/mock-data.ts with complete scores and bumped storage key to v3!")

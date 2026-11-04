import re

with open('src/lib/mock-data.ts', 'r', encoding='utf-8') as f:
    code = f.read()

# Extract INITIAL_CRITERIA block
crit_block_match = re.search(r'export const INITIAL_CRITERIA: AccreditationCriterion\[\] = \[(.*?)\];\n\nexport const INITIAL_USERS', code, re.DOTALL)
if not crit_block_match:
    print("Could not find INITIAL_CRITERIA block")
else:
    block = crit_block_match.group(1)
    # Find all items
    items = re.findall(r"id:\s*'([^']+)',\s*framework_id:\s*'[^']+',\s*area_id:\s*'([^']+)',\s*code:\s*'([^']+)'", block)
    print(f"Total criteria in INITIAL_CRITERIA: {len(items)}")
    areas = {}
    for cid, aid, ccode in items:
        areas.setdefault(aid, []).append((cid, ccode))
    for aid, crits in areas.items():
        print(f"Area {aid}: {len(crits)} criteria -> {[c[1] for c in crits]}")

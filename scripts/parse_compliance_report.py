import docx
import json

doc = docx.Document('BSCS_REAL_DATA/BSCS Compliance Report.docx')

area_names = [
    "Area I",
    "Area II",
    "Area III",
    "Area IV",
    "Area V",
    "Area VI",
    "Area VII",
    "Area VIII",
    "Area IX",
    "Area X"
]

all_recs = []

for idx, table in enumerate(doc.tables):
    if idx >= len(area_names):
        break
    area_code = area_names[idx]
    rows = table.rows
    for r_idx in range(1, len(rows)):
        cells = [c.text.strip() for c in rows[r_idx].cells]
        opp = cells[0] if len(cells) > 0 else ""
        rec = cells[1] if len(cells) > 1 else ""
        act = cells[2] if len(cells) > 2 else ""
        ver = cells[3] if len(cells) > 3 else ""
        
        # If opportunity or recommendation is non-empty
        if opp or rec:
            is_resolved = bool(act.strip() or ver.strip())
            all_recs.append({
                "area_code": area_code,
                "item_number": r_idx,
                "opportunity_for_improvement": opp,
                "recommendation_text": rec,
                "action_taken": act,
                "team_verification": ver,
                "status": "resolved" if is_resolved else "open"
            })

print(f"Total parsed items: {len(all_recs)}")
with open('scripts/parsed_compliance_recs.json', 'w', encoding='utf-8') as f:
    json.dump(all_recs, f, indent=2, ensure_ascii=False)

print("Saved to scripts/parsed_compliance_recs.json")

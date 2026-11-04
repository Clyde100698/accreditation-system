import re

with open("CAPSTONE_BOOK_FINAL.md", "r", encoding="utf-8") as f:
    full_md = f.read()

# Extract from "# INTRODUCTION" up to right before "# PRESENTATION, ANALYSIS AND INTERPRETATION"
# And then append "# REFERENCES" and its entries
part1_match = re.search(r'(# INTRODUCTION.*?)(\n# PRESENTATION, ANALYSIS AND INTERPRETATION)', full_md, re.DOTALL)
ref_match = re.search(r'(# REFERENCES.*?)(\n# APPENDICES)', full_md, re.DOTALL)

if part1_match and ref_match:
    chapters_1_to_3_md = f"""# WEB-BASED ACCREDITATION MANAGEMENT AND READINESS ASSESSMENT SYSTEM FOR STI WEST NEGROS UNIVERSITY
**Chapters I to III: Manuscript for Capstone Review**

---

{part1_match.group(1).strip()}

---

{ref_match.group(1).strip()}
"""
    with open("CAPSTONE_BOOK_CHAPTERS_I_TO_III_FINAL.md", "w", encoding="utf-8") as out:
        out.write(chapters_1_to_3_md)
    print("[SUCCESS] CAPSTONE_BOOK_CHAPTERS_I_TO_III_FINAL.md created successfully.")
else:
    print("[ERROR] Could not parse sections from full MD.")

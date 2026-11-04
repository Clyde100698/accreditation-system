import re

files_to_check = [
    "scripts/build_preliminaries.py",
    "scripts/book_chapters_1_to_3.py",
    "scripts/book_chapters_4_to_end.py",
    "CAPSTONE_BOOK_FINAL.md",
    "CAPSTONE_BOOK_CHAPTERS_I_TO_III_REVISED.docx",
    "CAPSTONE_BOOK_CHAPTERS_I_TO_III.md"
]

import docx

for fn in files_to_check:
    print(f"\n=== Checking {fn} ===")
    if fn.endswith(".docx"):
        doc = docx.Document(fn)
        lines = [p.text for p in doc.paragraphs]
    else:
        with open(fn, "r", encoding="utf-8", errors="ignore") as f:
            lines = f.readlines()
    
    for i, line in enumerate(lines):
        line_str = line.strip()
        # Look for square brackets with text, underscores, or common placeholder words
        matches = re.findall(r'(\[.*?\]|__+|TODO|TBD|pending|placeholder)', line_str, re.IGNORECASE)
        # Filter out markdown links like [text](url)
        filtered = [m for m in matches if not (m.startswith('[') and '](' in line_str)]
        if filtered:
            print(f"Line {i+1}: {line_str[:120]} (Matches: {filtered})")

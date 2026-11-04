import docx
from docx.shared import Inches, Pt

doc = docx.Document("CAPSTONE_BOOK_FINAL.docx")

print(f"Total Sections: {len(doc.sections)}")
print(f"Total Paragraphs: {len(doc.paragraphs)}")
print(f"Total Tables: {len(doc.tables)}")

# Check Margins
for idx, sec in enumerate(doc.sections):
    lm = sec.left_margin.inches
    tm = sec.top_margin.inches
    rm = sec.right_margin.inches
    bm = sec.bottom_margin.inches
    diff_first = sec.different_first_page_header_footer
    print(f"Section {idx+1}: Margins (L={lm:.2f}, T={tm:.2f}, R={rm:.2f}, B={bm:.2f}) | DiffFirstPage={diff_first}")

# Check Font usage
fonts = set()
font_sizes = set()
for p in doc.paragraphs:
    for r in p.runs:
        if r.font.name:
            fonts.add(r.font.name)
        if r.font.size:
            font_sizes.add(r.font.size.pt)

for tbl in doc.tables:
    for row in tbl.rows:
        for cell in row.cells:
            for p in cell.paragraphs:
                for r in p.runs:
                    if r.font.name:
                        fonts.add(r.font.name)
                    if r.font.size:
                        font_sizes.add(r.font.size.pt)

print(f"Fonts detected in document: {fonts}")
print(f"Font sizes detected in document: {sorted(list(font_sizes))}")

# Check Tables
print("\n--- Tables Verification ---")
for idx, tbl in enumerate(doc.tables):
    rows = len(tbl.rows)
    cols = len(tbl.columns)
    header = [c.text.strip().replace('\n', ' ') for c in tbl.rows[0].cells]
    print(f"Table {idx+1}: {rows} rows x {cols} cols | Header: {header[:3]}")

print("\nVerification completed successfully!")

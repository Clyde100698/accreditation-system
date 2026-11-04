import docx
import re

doc = docx.Document('CAPSTONE_BOOK_CHAPTERS_I_TO_V_FINAL.docx')

print("="*60)
print("VERIFYING CAPSTONE_BOOK_CHAPTERS_I_TO_V_FINAL.docx")
print("="*60)

# Check all tables
print(f"Total tables embedded in docx: {len(doc.tables)}")

# Collect table titles and figure captions from paragraphs
table_captions = []
figure_captions = []

for i, p in enumerate(doc.paragraphs):
    t = p.text.strip()
    if re.match(r'^Table\s+(\d+|[A-Za-z])', t):
        table_captions.append((i, t))
    elif re.match(r'^Figure\s+(\d+|[A-Za-z])', t):
        figure_captions.append((i, t))

print("\n--- Identified Table Captions in Body ---")
for idx, cap in table_captions:
    print(f"  P{idx}: {cap}")

print("\n--- Identified Figure Captions in Body ---")
for idx, cap in figure_captions:
    print(f"  P{idx}: {cap}")

# Check List of Tables
print("\n--- Content of LIST OF TABLES in Preliminaries ---")
lot_found = False
for p in doc.paragraphs:
    t = p.text.strip()
    if t == "LIST OF TABLES":
        lot_found = True
        continue
    if lot_found and t == "LIST OF FIGURES":
        break
    if lot_found and t:
        print(f"  {t}")

# Check List of Figures
print("\n--- Content of LIST OF FIGURES in Preliminaries ---")
lof_found = False
for p in doc.paragraphs:
    t = p.text.strip()
    if t == "LIST OF FIGURES":
        lof_found = True
        continue
    if lof_found and t == "INTRODUCTION":
        break
    if lof_found and t:
        print(f"  {t}")

# Check for any remaining Table A or un-renumbered tables
print("\n--- Checking for anomalies ---")
for i, p in enumerate(doc.paragraphs):
    if "Table A" in p.text:
        print(f"  WARNING: Found 'Table A' at P{i}: {p.text[:60]}")

print("Verification complete.")

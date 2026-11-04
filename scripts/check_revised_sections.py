import docx

doc = docx.Document('CAPSTONE_BOOK_CHAPTERS_I_TO_III_REVISED.docx')

print(f"Number of paragraphs: {len(doc.paragraphs)}")
print(f"Number of tables: {len(doc.tables)}")

sections = []
current_sec = "START"
current_paragraphs = []

for p in doc.paragraphs:
    txt = p.text.strip()
    if not txt:
        continue
    if txt.startswith("CHAPTER") or txt in ["INTRODUCTION", "REVIEW OF RELATED LITERATURE AND PRIOR ARTS SEARCH", "MATERIALS AND METHODS", "REFERENCES"]:
        sections.append((current_sec, len(current_paragraphs)))
        current_sec = txt
        current_paragraphs = []
    else:
        current_paragraphs.append(txt)

sections.append((current_sec, len(current_paragraphs)))

for sec, count in sections:
    print(f"Section '{sec}': {count} paragraphs")

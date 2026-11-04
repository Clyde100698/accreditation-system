import docx

doc = docx.Document('CAPSTONE_BOOK_CHAPTERS_I_TO_III_REVISED.docx')

with open('scripts/dump_revised_doc.txt', 'w', encoding='utf-8') as out:
    for i, el in enumerate(doc.element.body):
        tag = el.tag.split('}')[-1]
        if tag == 'p':
            p = docx.text.paragraph.Paragraph(el, doc)
            text = p.text.strip()
            if text:
                out.write(f"P [{p.style.name}]: {text}\n")
        elif tag == 'tbl':
            tbl = docx.table.Table(el, doc)
            out.write(f"\n--- TABLE ({len(tbl.rows)} rows x {len(tbl.columns)} cols) ---\n")
            for row in tbl.rows:
                cells = [c.text.strip().replace('\n', ' ') for c in row.cells]
                out.write(" | ".join(cells) + "\n")
            out.write("--- END TABLE ---\n\n")

print("Dump completed.")

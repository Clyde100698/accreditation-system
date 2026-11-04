import docx

doc = docx.Document('CAPSTONE_BOOK_CHAPTERS_I_TO_III_REVISED.docx')
print(f"Total paragraphs: {len(doc.paragraphs)}")
print(f"Total tables: {len(doc.tables)}")

tbl_idx = 0
for i, el in enumerate(doc.element.body):
    tag = el.tag.split('}')[-1]
    if tag == 'tbl':
        prev_p = ""
        j = i - 1
        while j >= 0:
            if doc.element.body[j].tag.split('}')[-1] == 'p':
                p_text = doc.element.body[j].text.strip()
                if p_text:
                    prev_p = p_text
                    break
            j -= 1
        tbl = doc.tables[tbl_idx]
        print(f"\n--- TABLE {tbl_idx + 1} ({len(tbl.rows)} rows x {len(tbl.columns)} cols) ---")
        print(f"Preceding text: {prev_p[:120]}")
        first_row = [c.text.strip().replace('\n', ' ') for c in tbl.rows[0].cells]
        print(f"Headers: {first_row}")
        tbl_idx += 1

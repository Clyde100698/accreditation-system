import docx
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.enum.text import WD_ALIGN_PARAGRAPH

def set_section_page_numbering(section, fmt="decimal", start=None):
    sectPr = section._sectPr
    # find or add pgNumType
    pgNumType = sectPr.find(qn('w:pgNumType'))
    if pgNumType is None:
        pgNumType = OxmlElement('w:pgNumType')
        sectPr.append(pgNumType)
    pgNumType.set(qn('w:fmt'), fmt)
    if start is not None:
        pgNumType.set(qn('w:start'), str(start))

def add_page_number_to_paragraph(p):
    fldSimple = OxmlElement('w:fldSimple')
    fldSimple.set(qn('w:instr'), 'PAGE')
    p._p.append(fldSimple)

doc = docx.Document()
sec1 = doc.sections[0]
sec1.different_first_page_header_footer = True
set_section_page_numbering(sec1, fmt="lowerRoman", start=1)
footer = sec1.footer
p_foot = footer.paragraphs[0]
p_foot.alignment = WD_ALIGN_PARAGRAPH.CENTER
add_page_number_to_paragraph(p_foot)

p = doc.add_paragraph("Preliminary Title Page (no page number on first page if different first page)")
doc.add_page_break()
p2 = doc.add_paragraph("Approval Sheet (should show ii at bottom center)")

sec2 = doc.add_section()
sec2.different_first_page_header_footer = True
set_section_page_numbering(sec2, fmt="decimal", start=1)
header = sec2.header
p_head = header.paragraphs[0]
p_head.alignment = WD_ALIGN_PARAGRAPH.RIGHT
add_page_number_to_paragraph(p_head)

doc.add_paragraph("Chapter 1 Start (first page of chapter, header suppressed)")
doc.add_page_break()
doc.add_paragraph("Chapter 1 Page 2 (should show 2 in upper right)")

doc.save("test_page_num.docx")
print("Saved test_page_num.docx successfully.")

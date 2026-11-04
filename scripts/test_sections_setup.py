import docx
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Inches, Pt
from docx.enum.text import WD_ALIGN_PARAGRAPH

def set_section_margins(section):
    section.left_margin = Inches(1.5)
    section.top_margin = Inches(1.0)
    section.right_margin = Inches(1.0)
    section.bottom_margin = Inches(1.0)

def set_section_page_numbering(section, fmt="decimal", start=None):
    sectPr = section._sectPr
    pgNumType = sectPr.find(qn('w:pgNumType'))
    if pgNumType is None:
        pgNumType = OxmlElement('w:pgNumType')
        sectPr.append(pgNumType)
    pgNumType.set(qn('w:fmt'), fmt)
    if start is not None:
        pgNumType.set(qn('w:start'), str(start))

def add_page_number_field(p):
    fldSimple = OxmlElement('w:fldSimple')
    fldSimple.set(qn('w:instr'), 'PAGE')
    p._p.append(fldSimple)

doc = docx.Document()

# 1. Preliminaries Section
sec1 = doc.sections[0]
set_section_margins(sec1)
sec1.different_first_page_header_footer = True
set_section_page_numbering(sec1, fmt="lowerRoman", start=1)
# regular footer (for pages after first)
footer1 = sec1.footer
p_foot = footer1.paragraphs[0]
p_foot.alignment = WD_ALIGN_PARAGRAPH.CENTER
add_page_number_field(p_foot)
run = p_foot.runs[0] if p_foot.runs else p_foot.add_run()
run.font.name = "Courier New"
run.font.size = Pt(12)

doc.add_paragraph("Title Page (No number)")
doc.add_page_break()
doc.add_paragraph("Approval Sheet (Page ii)")

# 2. Chapter 1 Section
sec2 = doc.add_section()
set_section_margins(sec2)
sec2.header.is_linked_to_previous = False
sec2.footer.is_linked_to_previous = False
sec2.different_first_page_header_footer = True
set_section_page_numbering(sec2, fmt="decimal", start=1)

# Normal header (page 2 onwards)
header2 = sec2.header
p_head = header2.paragraphs[0]
p_head.alignment = WD_ALIGN_PARAGRAPH.RIGHT
add_page_number_field(p_head)
run = p_head.runs[0] if p_head.runs else p_head.add_run()
run.font.name = "Courier New"
run.font.size = Pt(12)

# Make sure footer is empty
sec2.footer.paragraphs[0].text = ""

doc.add_paragraph("Chapter 1 Start (No number on first page)")
doc.add_page_break()
doc.add_paragraph("Chapter 1 Page 2 (Should show 2 in upper right)")

doc.save("test_multi_sec.docx")
print("Multi-section doc saved successfully!")

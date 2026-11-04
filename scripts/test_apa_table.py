import docx
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Inches, Pt
from docx.enum.text import WD_ALIGN_PARAGRAPH

def set_apa_table_borders(tbl):
    tblPr = tbl._tbl.tblPr
    tblBorders = tblPr.find(qn('w:tblBorders'))
    if tblBorders is None:
        tblBorders = OxmlElement('w:tblBorders')
        tblPr.append(tblBorders)
    else:
        tblBorders.clear()

    # Top border
    top = OxmlElement('w:top')
    top.set(qn('w:val'), 'single')
    top.set(qn('w:sz'), '8')
    top.set(qn('w:space'), '0')
    top.set(qn('w:color'), '000000')
    tblBorders.append(top)

    # Bottom border
    bottom = OxmlElement('w:bottom')
    bottom.set(qn('w:val'), 'single')
    bottom.set(qn('w:sz'), '8')
    bottom.set(qn('w:space'), '0')
    bottom.set(qn('w:color'), '000000')
    tblBorders.append(bottom)

    # Clear left, right, insideV
    for side in ['left', 'right', 'insideV', 'insideH']:
        el = OxmlElement(f'w:{side}')
        el.set(qn('w:val'), 'none')
        tblBorders.append(el)

    # Add bottom border to header row cells
    for cell in tbl.rows[0].cells:
        tcPr = cell._tc.get_or_add_tcPr()
        tcBorders = tcPr.find(qn('w:tcBorders'))
        if tcBorders is None:
            tcBorders = OxmlElement('w:tcBorders')
            tcPr.append(tcBorders)
        b_bottom = OxmlElement('w:bottom')
        b_bottom.set(qn('w:val'), 'single')
        b_bottom.set(qn('w:sz'), '8')
        b_bottom.set(qn('w:space'), '0')
        b_bottom.set(qn('w:color'), '000000')
        tcBorders.append(b_bottom)

doc = docx.Document()
tbl = doc.add_table(rows=3, cols=3)
set_apa_table_borders(tbl)
tbl.rows[0].cells[0].paragraphs[0].text = "Header 1"
tbl.rows[0].cells[1].paragraphs[0].text = "Header 2"
tbl.rows[0].cells[2].paragraphs[0].text = "Header 3"
tbl.rows[1].cells[0].paragraphs[0].text = "Row 1 Col 1"
tbl.rows[1].cells[1].paragraphs[0].text = "Row 1 Col 2"
tbl.rows[1].cells[2].paragraphs[0].text = "Row 1 Col 3"
tbl.rows[2].cells[0].paragraphs[0].text = "Row 2 Col 1"
tbl.rows[2].cells[1].paragraphs[0].text = "Row 2 Col 2"
tbl.rows[2].cells[2].paragraphs[0].text = "Row 2 Col 3"
doc.save("test_apa_table.docx")
print("Saved test_apa_table.docx successfully!")

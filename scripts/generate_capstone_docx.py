import os
import re
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement
from docx.oxml.ns import qn

def set_cell_background(cell, fill_hex):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = OxmlElement('w:shd')
    shd.set(qn('w:val'), 'clear')
    shd.set(qn('w:color'), 'auto')
    shd.set(qn('w:fill'), fill_hex)
    tcPr.append(shd)

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = OxmlElement('w:tcMar')
    for m, val in [('top', top), ('bottom', bottom), ('left', left), ('right', right)]:
        node = OxmlElement(f'w:{m}')
        node.set(qn('w:w'), str(val))
        node.set(qn('w:type'), 'dxa')
        tcMar.append(node)
    tcPr.append(tcMar)

def add_runs(p, text, size=None):
    """Add text to paragraph handling **bold** and *italic* markers."""
    for part in re.split(r'(\*\*.*?\*\*|\*[^*\s][^*]*?\*)', text):
        if not part:
            continue
        if part.startswith('**') and part.endswith('**') and len(part) > 4:
            run = p.add_run(part[2:-2])
            run.bold = True
        elif part.startswith('*') and part.endswith('*') and len(part) > 2:
            run = p.add_run(part[1:-1])
            run.italic = True
        else:
            run = p.add_run(part)
        if size:
            run.font.size = Pt(size)


def create_docx_from_md(md_path, docx_path):
    base_dir = os.path.dirname(md_path)
    with open(md_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    doc = Document()

    # Set 1 inch margins (APA 7th standard)
    for section in doc.sections:
        section.top_margin = Inches(1.0)
        section.bottom_margin = Inches(1.0)
        section.left_margin = Inches(1.0)
        section.right_margin = Inches(1.0)

    # Styles
    normal_style = doc.styles['Normal']
    normal_style.font.name = 'Times New Roman'
    normal_style.font.size = Pt(12)
    normal_style.font.color.rgb = RGBColor(30, 30, 30)

    in_table = False
    table_lines = []
    in_code_block = False
    code_lines = []

    i = 0
    while i < len(lines):
        line = lines[i].rstrip('\r\n')
        stripped = line.strip()

        # Handle code blocks
        if stripped.startswith('```'):
            if in_code_block:
                in_code_block = False
                p = doc.add_paragraph()
                p.paragraph_format.left_indent = Inches(0.4)
                p.paragraph_format.space_before = Pt(4)
                p.paragraph_format.space_after = Pt(4)
                run = p.add_run('\n'.join(code_lines))
                run.font.name = 'Consolas'
                run.font.size = Pt(9.5)
                run.font.color.rgb = RGBColor(60, 60, 60)
                code_lines = []
            else:
                in_code_block = True
                code_lines = []
            i += 1
            continue

        if in_code_block:
            code_lines.append(line)
            i += 1
            continue

        # Handle Markdown tables
        if stripped.startswith('|') and stripped.endswith('|'):
            table_lines.append(stripped)
            i += 1
            continue
        elif table_lines:
            # Process table
            rows_data = []
            for tl in table_lines:
                # Skip markdown separator |---|---|
                if re.match(r'^\|(\s*:?-+:?\s*\|)+$', tl):
                    continue
                cells = [c.strip() for c in tl.strip('|').split('|')]
                rows_data.append(cells)

            if rows_data:
                col_count = max(len(r) for r in rows_data)
                tbl = doc.add_table(rows=len(rows_data), cols=col_count)
                tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
                tbl.autofit = True

                for r_idx, r_data in enumerate(rows_data):
                    is_header = (r_idx == 0)
                    row = tbl.rows[r_idx]
                    for c_idx, val in enumerate(r_data):
                        if c_idx < len(row.cells):
                            cell = row.cells[c_idx]
                            clean_text = val.replace('**', '').replace('`', '')
                            p = cell.paragraphs[0]
                            p.text = clean_text
                            p.paragraph_format.space_before = Pt(3)
                            p.paragraph_format.space_after = Pt(3)
                            p.paragraph_format.line_spacing = 1.05
                            run = p.runs[0] if p.runs else p.add_run()
                            run.font.name = 'Times New Roman'
                            run.font.size = Pt(9.5)

                            if is_header:
                                run.bold = True
                                run.font.color.rgb = RGBColor(255, 255, 255)
                                set_cell_background(cell, '1E293B') # Dark slate header
                            else:
                                if r_idx % 2 == 1:
                                    set_cell_background(cell, 'F8FAFC')
                                else:
                                    set_cell_background(cell, 'FFFFFF')
                            set_cell_margins(cell, top=100, bottom=100, left=120, right=120)

                doc.add_paragraph() # Spacing after table
            table_lines = []

        # Empty line
        if not stripped:
            i += 1
            continue

        # Embedded figure image
        img_match = re.match(r'^!\[.*?\]\((.+?)\)$', stripped)
        if img_match:
            img_path = os.path.join(base_dir, img_match.group(1).replace('/', os.sep))
            p = doc.add_paragraph()
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            p.paragraph_format.keep_with_next = True
            width = Inches(5.3) if 'figure3' in img_path else Inches(6.3)
            p.add_run().add_picture(img_path, width=width)
            i += 1
            continue

        # Headings
        if stripped.startswith('# '):
            p = doc.add_paragraph()
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            p.paragraph_format.space_before = Pt(18)
            p.paragraph_format.space_after = Pt(6)
            run = p.add_run(stripped[2:].replace('**', ''))
            run.font.name = 'Times New Roman'
            run.font.size = Pt(16)
            run.bold = True
            run.font.color.rgb = RGBColor(15, 23, 42)
        elif stripped.startswith('### '):
            p = doc.add_paragraph()
            p.paragraph_format.space_before = Pt(12)
            p.paragraph_format.space_after = Pt(4)
            run = p.add_run(stripped[4:].replace('**', ''))
            run.font.name = 'Times New Roman'
            run.font.size = Pt(13)
            run.bold = True
            run.font.color.rgb = RGBColor(30, 41, 59)
        elif stripped.startswith('## '):
            p = doc.add_paragraph()
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            p.paragraph_format.space_before = Pt(16)
            p.paragraph_format.space_after = Pt(6)
            run = p.add_run(stripped[3:].replace('**', ''))
            run.font.name = 'Times New Roman'
            run.font.size = Pt(14)
            run.bold = True
            run.font.color.rgb = RGBColor(15, 23, 42)
        elif stripped.startswith('#### '):
            p = doc.add_paragraph()
            p.paragraph_format.space_before = Pt(8)
            p.paragraph_format.space_after = Pt(3)
            run = p.add_run(stripped[5:].replace('**', ''))
            run.font.name = 'Times New Roman'
            run.font.size = Pt(12)
            run.bold = True
            run.font.color.rgb = RGBColor(51, 65, 85)
        elif stripped.startswith('---'):
            # Divider
            p = doc.add_paragraph()
            p.paragraph_format.space_before = Pt(6)
            p.paragraph_format.space_after = Pt(6)
        elif stripped.startswith('- ') or stripped.startswith('* '):
            p = doc.add_paragraph(style='List Bullet')
            p.paragraph_format.space_before = Pt(2)
            p.paragraph_format.space_after = Pt(2)
            p.paragraph_format.line_spacing = 1.15
            content = stripped[2:]
            add_runs(p, content)
        elif re.match(r'^\d+\.\s+', stripped):
            match = re.match(r'^(\d+\.)\s+(.*)', stripped)
            num_str = match.group(1)
            content = match.group(2)
            p = doc.add_paragraph()
            p.paragraph_format.left_indent = Inches(0.25)
            p.paragraph_format.space_before = Pt(2)
            p.paragraph_format.space_after = Pt(2)
            p.paragraph_format.line_spacing = 1.15
            run_num = p.add_run(num_str + ' ')
            run_num.bold = True
            add_runs(p, content)
        else:
            # Regular paragraph
            p = doc.add_paragraph()
            p.paragraph_format.space_before = Pt(3)
            p.paragraph_format.space_after = Pt(4)
            p.paragraph_format.line_spacing = 1.25 # Formal academic line spacing

            # Captions for figures/tables in italics
            if stripped.startswith('*Figure') or stripped.startswith('*Table'):
                p.alignment = WD_ALIGN_PARAGRAPH.CENTER
                run = p.add_run(stripped.replace('*', ''))
                run.italic = True
                run.font.size = Pt(10)
                run.font.color.rgb = RGBColor(70, 70, 70)
            else:
                add_runs(p, stripped)

        i += 1

    try:
        doc.save(docx_path)
    except PermissionError:
        docx_path = docx_path.replace('.docx', '_REVISED.docx')
        doc.save(docx_path)
    print(f"Successfully generated DOCX: {docx_path}")

if __name__ == '__main__':
    md = r'c:\Users\Acer\Desktop\ACCREDITATION SYSTEM\CAPSTONE_BOOK_CHAPTERS_I_TO_III.md'
    docx = r'c:\Users\Acer\Desktop\ACCREDITATION SYSTEM\CAPSTONE_BOOK_CHAPTERS_I_TO_III.docx'
    create_docx_from_md(md, docx)

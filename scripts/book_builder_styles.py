import os
import re
import docx
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement
from docx.oxml.ns import qn

from book_helpers import (
    set_section_margins,
    set_section_page_numbering,
    add_page_number_field,
    set_apa_table_borders,
    set_cell_margins
)

FONT_NAME = "Courier New"
FONT_SIZE = Pt(12)
DOUBLE_SPACE = 2.0
SINGLE_SPACE = 1.0

def apply_font(run, bold=False, italic=False, size=FONT_SIZE):
    run.font.name = FONT_NAME
    run.font.size = size
    run.bold = bold
    run.italic = italic
    run.font.color.rgb = RGBColor(0, 0, 0)

def add_major_section_heading(doc, text):
    """Major Sections: ALL CAPS, Bold & Centered."""
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.line_spacing = DOUBLE_SPACE
    p.paragraph_format.space_before = Pt(24)
    p.paragraph_format.space_after = Pt(18)
    p.paragraph_format.first_line_indent = Inches(0.0)
    run = p.add_run(text.upper())
    apply_font(run, bold=True)
    return p

def add_heading(doc, text):
    """Headings: Bold & Centered."""
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.line_spacing = DOUBLE_SPACE
    p.paragraph_format.space_before = Pt(24)
    p.paragraph_format.space_after = Pt(12)
    p.paragraph_format.first_line_indent = Inches(0.0)
    run = p.add_run(text)
    apply_font(run, bold=True)
    return p

def add_subheading(doc, text):
    """Sub headings: Bold & flashed - left."""
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.LEFT
    p.paragraph_format.line_spacing = DOUBLE_SPACE
    p.paragraph_format.space_before = Pt(18)
    p.paragraph_format.space_after = Pt(6)
    p.paragraph_format.first_line_indent = Inches(0.0)
    run = p.add_run(text)
    apply_font(run, bold=True)
    return p

def add_body_p(doc, text):
    """Beginning Paragraphs indented 0.5 in, Double space, Unjustified right margin."""
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.LEFT
    p.paragraph_format.line_spacing = DOUBLE_SPACE
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(0)
    p.paragraph_format.first_line_indent = Inches(0.5)

    # Parse inline formatting like **bold** and *italic*
    parts = re.split(r'(\*\*.*?\*\*|\*[^*\s][^*]*?\*)', text)
    for part in parts:
        if not part:
            continue
        if part.startswith('**') and part.endswith('**') and len(part) > 4:
            run = p.add_run(part[2:-2])
            apply_font(run, bold=True)
        elif part.startswith('*') and part.endswith('*') and len(part) > 2:
            run = p.add_run(part[1:-1])
            apply_font(run, italic=True)
        else:
            run = p.add_run(part)
            apply_font(run)
    return p

def add_bullet_p(doc, text, level=1):
    """Bullet item, Courier New 12 pt, double-spaced, left indented."""
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.LEFT
    p.paragraph_format.line_spacing = DOUBLE_SPACE
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(0)
    p.paragraph_format.left_indent = Inches(0.5 * level)
    p.paragraph_format.first_line_indent = Inches(-0.25)

    bullet_run = p.add_run("• ")
    apply_font(bullet_run, bold=True)

    parts = re.split(r'(\*\*.*?\*\*|\*[^*\s][^*]*?\*)', text)
    for part in parts:
        if not part:
            continue
        if part.startswith('**') and part.endswith('**') and len(part) > 4:
            run = p.add_run(part[2:-2])
            apply_font(run, bold=True)
        elif part.startswith('*') and part.endswith('*') and len(part) > 2:
            run = p.add_run(part[1:-1])
            apply_font(run, italic=True)
        else:
            run = p.add_run(part)
            apply_font(run)
    return p

def add_apa_table(doc, number_str, title_str, headers, rows, col_widths=None, note_str=None):
    """Formats table according to APA 7th edition."""
    # Table Number
    p_num = doc.add_paragraph()
    p_num.alignment = WD_ALIGN_PARAGRAPH.LEFT
    p_num.paragraph_format.line_spacing = DOUBLE_SPACE
    p_num.paragraph_format.space_before = Pt(18)
    p_num.paragraph_format.space_after = Pt(0)
    p_num.paragraph_format.first_line_indent = Inches(0.0)
    r_num = p_num.add_run(number_str)
    apply_font(r_num, bold=True)

    # Table Title (Italic, Flushed-left)
    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.LEFT
    p_title.paragraph_format.line_spacing = DOUBLE_SPACE
    p_title.paragraph_format.space_before = Pt(0)
    p_title.paragraph_format.space_after = Pt(6)
    p_title.paragraph_format.first_line_indent = Inches(0.0)
    r_title = p_title.add_run(title_str)
    apply_font(r_title, italic=True)

    # Table Grid
    tbl = doc.add_table(rows=len(rows) + 1, cols=len(headers))
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    tbl.autofit = False
    set_apa_table_borders(tbl)

    # Headers
    header_row = tbl.rows[0]
    for c_idx, h_text in enumerate(headers):
        cell = header_row.cells[c_idx]
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.LEFT
        p.paragraph_format.line_spacing = 1.15
        p.paragraph_format.space_before = Pt(3)
        p.paragraph_format.space_after = Pt(3)
        p.paragraph_format.first_line_indent = Inches(0.0)
        run = p.add_run(h_text)
        apply_font(run, bold=True, size=Pt(10.5))
        set_cell_margins(cell, top=100, bottom=100, left=100, right=100)

    # Data Rows
    for r_idx, r_data in enumerate(rows):
        row = tbl.rows[r_idx + 1]
        for c_idx, val in enumerate(r_data):
            if c_idx < len(row.cells):
                cell = row.cells[c_idx]
                p = cell.paragraphs[0]
                p.alignment = WD_ALIGN_PARAGRAPH.LEFT
                p.paragraph_format.line_spacing = 1.15
                p.paragraph_format.space_before = Pt(3)
                p.paragraph_format.space_after = Pt(3)
                p.paragraph_format.first_line_indent = Inches(0.0)
                
                # Check if total row or bold
                is_bold = "Total" in str(r_data[0]) or val.startswith("**")
                clean_val = val.replace("**", "").replace("*", "")
                run = p.add_run(clean_val)
                apply_font(run, bold=is_bold, size=Pt(10.5))
                set_cell_margins(cell, top=80, bottom=80, left=100, right=100)

    # Column Widths
    if col_widths:
        for r in tbl.rows:
            for c_idx, w in enumerate(col_widths):
                if c_idx < len(r.cells):
                    r.cells[c_idx].width = Inches(w)

    # Note
    if note_str:
        p_note = doc.add_paragraph()
        p_note.alignment = WD_ALIGN_PARAGRAPH.LEFT
        p_note.paragraph_format.line_spacing = DOUBLE_SPACE
        p_note.paragraph_format.space_before = Pt(6)
        p_note.paragraph_format.space_after = Pt(12)
        p_note.paragraph_format.first_line_indent = Inches(0.0)
        r_lbl = p_note.add_run("Note. ")
        apply_font(r_lbl, italic=True, size=Pt(11))
        r_txt = p_note.add_run(note_str)
        apply_font(r_txt, size=Pt(11))
    else:
        p_space = doc.add_paragraph()
        p_space.paragraph_format.line_spacing = DOUBLE_SPACE
        p_space.paragraph_format.space_after = Pt(12)

def add_figure(doc, number_str, title_str, img_path, width_in_inches=5.8):
    """Adds a centered figure with label at the lower part."""
    if os.path.exists(img_path):
        p_img = doc.add_paragraph()
        p_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_img.paragraph_format.space_before = Pt(18)
        p_img.paragraph_format.space_after = Pt(6)
        p_img.paragraph_format.line_spacing = SINGLE_SPACE
        p_img.paragraph_format.first_line_indent = Inches(0.0)
        p_img.add_run().add_picture(img_path, width=Inches(width_in_inches))
    else:
        print(f"Warning: Figure path not found: {img_path}")

    # Lower part label (APA 7th: Figure X in italics, Title in regular)
    p_lbl = doc.add_paragraph()
    p_lbl.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_lbl.paragraph_format.line_spacing = DOUBLE_SPACE
    p_lbl.paragraph_format.space_before = Pt(6)
    p_lbl.paragraph_format.space_after = Pt(18)
    p_lbl.paragraph_format.first_line_indent = Inches(0.0)

    r_num = p_lbl.add_run(f"{number_str}. ")
    apply_font(r_num, italic=True)
    r_title = p_lbl.add_run(title_str)
    apply_font(r_title)

def add_figure_placeholder(doc, number_str, title_str, placeholder_text):
    """Adds a centered figure placeholder box and caption according to APA 7th edition."""
    p_box = doc.add_paragraph()
    p_box.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_box.paragraph_format.space_before = Pt(18)
    p_box.paragraph_format.space_after = Pt(6)
    p_box.paragraph_format.line_spacing = DOUBLE_SPACE
    p_box.paragraph_format.first_line_indent = Inches(0.0)
    r_box = p_box.add_run(placeholder_text)
    apply_font(r_box, bold=True)

    # Lower part label (APA 7th: Figure X in italics, Title in regular)
    p_lbl = doc.add_paragraph()
    p_lbl.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_lbl.paragraph_format.line_spacing = DOUBLE_SPACE
    p_lbl.paragraph_format.space_before = Pt(6)
    p_lbl.paragraph_format.space_after = Pt(18)
    p_lbl.paragraph_format.first_line_indent = Inches(0.0)

    r_num = p_lbl.add_run(f"{number_str}. ")
    apply_font(r_num, italic=True)
    r_title = p_lbl.add_run(title_str)
    apply_font(r_title)

def add_reference_p(doc, text):
    """APA 7th reference with 0.5 in hanging indent."""
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.LEFT
    p.paragraph_format.line_spacing = DOUBLE_SPACE
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(6)
    p.paragraph_format.left_indent = Inches(0.5)
    p.paragraph_format.first_line_indent = Inches(-0.5)

    parts = re.split(r'(\*\*.*?\*\*|\*[^*\s][^*]*?\*)', text)
    for part in parts:
        if not part:
            continue
        if part.startswith('**') and part.endswith('**') and len(part) > 4:
            run = p.add_run(part[2:-2])
            apply_font(run, bold=True)
        elif part.startswith('*') and part.endswith('*') and len(part) > 2:
            run = p.add_run(part[1:-1])
            apply_font(run, italic=True)
        else:
            run = p.add_run(part)
            apply_font(run)
    return p

print("Builder styling functions ready.")

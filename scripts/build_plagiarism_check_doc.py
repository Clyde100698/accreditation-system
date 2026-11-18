import os
import sys
import docx
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH

# Ensure scripts directory is on sys.path
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
if SCRIPT_DIR not in sys.path:
    sys.path.insert(0, SCRIPT_DIR)

from book_helpers import (
    set_section_margins,
    set_section_page_numbering,
    add_page_number_field,
)
from book_builder_styles import (
    apply_font,
    FONT_NAME,
    FONT_SIZE,
    DOUBLE_SPACE,
)
import book_chapters_1_to_3 as ch13
import book_chapters_4_to_end as ch45


def _noop(*args, **kwargs):
    """No-op replacement to strip all tables, table titles/notes, figures, and figure captions."""
    return None


def _configure_section(section, is_first=False):
    set_section_margins(section)
    section.different_first_page_header_footer = True

    if is_first:
        section.header.is_linked_to_previous = False
        section.footer.is_linked_to_previous = False
        set_section_page_numbering(section, fmt="decimal", start=1)

        p_head = section.header.paragraphs[0]
        p_head.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        add_page_number_field(p_head)
        apply_font(p_head.runs[0] if p_head.runs else p_head.add_run())
        section.footer.paragraphs[0].text = ""
    else:
        section.header.is_linked_to_previous = True
        section.footer.is_linked_to_previous = False
        set_section_page_numbering(section, fmt="decimal", start=None)
        section.footer.paragraphs[0].text = ""


def build_plagiarism_check_docx(output_path="MANUSCRIPT_FOR_PLAGIARISM_CHECK_Taburada.docx"):
    # Temporarily disable tables and figures in chapter builders
    orig_13_tbl, orig_13_fig, orig_13_ph = ch13.add_apa_table, ch13.add_figure, ch13.add_figure_placeholder
    orig_45_tbl, orig_45_fig = ch45.add_apa_table, ch45.add_figure

    ch13.add_apa_table = _noop
    ch13.add_figure = _noop
    ch13.add_figure_placeholder = _noop
    ch45.add_apa_table = _noop
    ch45.add_figure = _noop

    try:
        doc = Document()

        normal_style = doc.styles["Normal"]
        normal_style.font.name = FONT_NAME
        normal_style.font.size = FONT_SIZE
        normal_style.font.color.rgb = RGBColor(0, 0, 0)

        # Configure first section (starts directly with Title + Full Name + Chapter I)
        sec_1 = doc.sections[0]
        _configure_section(sec_1, is_first=True)

        # Title and Full Name header block requested by RDO
        p_title = doc.add_paragraph()
        p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_title.paragraph_format.line_spacing = 1.3
        p_title.paragraph_format.space_before = Pt(0)
        p_title.paragraph_format.space_after = Pt(12)
        p_title.paragraph_format.first_line_indent = Inches(0.0)
        r_title = p_title.add_run("WEB-BASED ACCREDITATION MANAGEMENT AND READINESS ASSESSMENT SYSTEM")
        apply_font(r_title, bold=True, size=Pt(13))

        p_author = doc.add_paragraph()
        p_author.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_author.paragraph_format.line_spacing = 1.3
        p_author.paragraph_format.space_before = Pt(0)
        p_author.paragraph_format.space_after = Pt(24)
        p_author.paragraph_format.first_line_indent = Inches(0.0)
        r_author = p_author.add_run("JOSE MARIE CLYDE B. TABURADA")
        apply_font(r_author, bold=True)

        # Chapter I
        ch13.add_chapter_1(doc)

        # Chapter II
        sec_2 = doc.add_section()
        _configure_section(sec_2, is_first=False)
        ch13.add_chapter_2(doc)

        # Chapter III
        sec_3 = doc.add_section()
        _configure_section(sec_3, is_first=False)
        ch13.add_chapter_3(doc)

        # Chapter IV
        sec_4 = doc.add_section()
        _configure_section(sec_4, is_first=False)
        ch45.add_chapter_4(doc)

        # Chapter V
        sec_5 = doc.add_section()
        _configure_section(sec_5, is_first=False)
        ch45.add_chapter_5(doc)

        # References
        sec_ref = doc.add_section()
        _configure_section(sec_ref, is_first=False)
        ch45.add_references(doc)

        doc.save(output_path)
        print(f"[SUCCESS] Saved plagiarism check document to {output_path}")
    finally:
        ch13.add_apa_table, ch13.add_figure, ch13.add_figure_placeholder = orig_13_tbl, orig_13_fig, orig_13_ph
        ch45.add_apa_table, ch45.add_figure = orig_45_tbl, orig_45_fig

    # Verification pass
    verify_doc = Document(output_path)
    all_text = "\n".join(p.text for p in verify_doc.paragraphs)
    num_tables = len(verify_doc.tables)
    num_images = len(verify_doc.inline_shapes)
    num_words = len(all_text.split())

    print("\n--- VERIFICATION REPORT ---")
    print(f"File:          {output_path}")
    print(f"File Size:     {os.path.getsize(output_path):,} bytes")
    print(f"Paragraphs:    {len(verify_doc.paragraphs)}")
    print(f"Word Count:    {num_words:,}")
    print(f"Tables:        {num_tables} (expected: 0)")
    print(f"Images/Figs:   {num_images} (expected: 0)")

    forbidden = [
        "APPROVAL SHEET",
        "ACKNOWLEDGEMENT",
        "DEDICATION",
        "ABSTRACT",
        "TABLE OF CONTENTS",
        "LIST OF TABLES",
        "LIST OF FIGURES",
        "APPENDICES",
        "Appendix A.",
        "PLACEHOLDER",
    ]
    found_forbidden = [tok for tok in forbidden if tok in all_text]
    print(f"Forbidden hits:{found_forbidden} (expected: [])")

    required = [
        "WEB-BASED ACCREDITATION MANAGEMENT AND READINESS ASSESSMENT SYSTEM",
        "JOSE MARIE CLYDE B. TABURADA",
        "INTRODUCTION",
        "RELATED LITERATURE AND PRIOR ARTS SEARCH",
        "MATERIALS AND METHODS",
        "PRESENTATION, ANALYSIS AND INTERPRETATION",
        "SUMMARY, CONCLUSION AND RECOMMENDATION",
        "REFERENCES",
    ]
    missing_req = [tok for tok in required if tok not in all_text]
    print(f"Missing req:   {missing_req} (expected: [])")

    assert num_tables == 0, f"Expected 0 tables, found {num_tables}"
    assert num_images == 0, f"Expected 0 images, found {num_images}"
    assert not found_forbidden, f"Found forbidden sections: {found_forbidden}"
    assert not missing_req, f"Missing required sections: {missing_req}"
    print("[VERIFIED] Document strictly meets all RDO plagiarism screening requirements.")


if __name__ == "__main__":
    build_plagiarism_check_docx()

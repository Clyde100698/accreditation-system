import os
import sys
import docx
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH

from book_helpers import (
    set_section_margins,
    set_section_page_numbering,
    add_page_number_field,
)
from book_builder_styles import (
    apply_font,
    FONT_NAME,
    FONT_SIZE,
)
from build_preliminaries import populate_preliminaries
from book_chapters_1_to_3 import (
    add_chapter_1,
    add_chapter_2,
    add_chapter_3,
)
from book_chapters_4_to_end import (
    add_chapter_4,
    add_chapter_5,
    add_references,
    add_appendices,
)


def _configure_chapter_section(section, is_first_chapter=False):
    set_section_margins(section)
    section.different_first_page_header_footer = True

    if is_first_chapter:
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
        # Clear inherited w:start so page numbering continues consecutively across sections
        set_section_page_numbering(section, fmt="decimal", start=None)
        section.footer.paragraphs[0].text = ""


def build_chapters_1_to_5_with_preliminaries(toc_pages=None, table_pages=None, figure_pages=None):
    print("--- Building Complete Capstone Book (Preliminaries + Chapters I-V + References + Appendices A-D) ---")
    doc = Document()

    normal_style = doc.styles["Normal"]
    normal_style.font.name = FONT_NAME
    normal_style.font.size = FONT_SIZE
    normal_style.font.color.rgb = RGBColor(0, 0, 0)

    # Section 1: Preliminaries (Roman numerals i ..)
    populate_preliminaries(doc, toc_pages=toc_pages, table_pages=table_pages, figure_pages=figure_pages)

    # Body Sections (Consecutive Arabic numerals 1 .. N)
    sec_ch1 = doc.add_section()
    _configure_chapter_section(sec_ch1, is_first_chapter=True)
    add_chapter_1(doc)

    sec_ch2 = doc.add_section()
    _configure_chapter_section(sec_ch2, is_first_chapter=False)
    add_chapter_2(doc)

    sec_ch3 = doc.add_section()
    _configure_chapter_section(sec_ch3, is_first_chapter=False)
    add_chapter_3(doc)

    sec_ch4 = doc.add_section()
    _configure_chapter_section(sec_ch4, is_first_chapter=False)
    add_chapter_4(doc)

    sec_ch5 = doc.add_section()
    _configure_chapter_section(sec_ch5, is_first_chapter=False)
    add_chapter_5(doc)

    sec_ref = doc.add_section()
    _configure_chapter_section(sec_ref, is_first_chapter=False)
    add_references(doc)

    sec_app = doc.add_section()
    _configure_chapter_section(sec_app, is_first_chapter=False)
    add_appendices(doc)

    out_file = "CAPSTONE_BOOK_CHAPTERS_I_TO_V_FINAL.docx"
    saved_path = out_file
    try:
        doc.save(out_file)
        print(f"[SUCCESS] Saved master book to {out_file}")
    except PermissionError:
        fallback = "CAPSTONE_BOOK_CHAPTERS_I_TO_V_FINAL_LATEST.docx"
        doc.save(fallback)
        saved_path = fallback
        print(f"[WARNING] '{out_file}' is open in Word. Saved copy to '{fallback}'.")

    try:
        doc.save("CAPSTONE_BOOK_FINAL.docx")
        print("[SUCCESS] Also saved complete manuscript to CAPSTONE_BOOK_FINAL.docx")
    except PermissionError:
        print("[WARNING] 'CAPSTONE_BOOK_FINAL.docx' is open in Word.")

    try:
        from convert_docx_to_md import docx_to_markdown
        docx_to_markdown(saved_path, "CAPSTONE_BOOK_CHAPTERS_I_TO_V_FINAL.md")
        docx_to_markdown(saved_path, "CAPSTONE_BOOK_FINAL.md")
    except Exception as e:
        print(f"[WARNING] Markdown conversion encountered: {e}")


def build_chapters_1_to_5_only_no_prelims():
    print("--- Building Body-Only Chapters I to V + References (No Preliminaries, No Appendices) ---")
    doc = Document()

    normal_style = doc.styles["Normal"]
    normal_style.font.name = FONT_NAME
    normal_style.font.size = FONT_SIZE
    normal_style.font.color.rgb = RGBColor(0, 0, 0)

    sec_ch1 = doc.sections[0]
    _configure_chapter_section(sec_ch1, is_first_chapter=True)
    add_chapter_1(doc)

    sec_ch2 = doc.add_section()
    _configure_chapter_section(sec_ch2, is_first_chapter=False)
    add_chapter_2(doc)

    sec_ch3 = doc.add_section()
    _configure_chapter_section(sec_ch3, is_first_chapter=False)
    add_chapter_3(doc)

    sec_ch4 = doc.add_section()
    _configure_chapter_section(sec_ch4, is_first_chapter=False)
    add_chapter_4(doc)

    sec_ch5 = doc.add_section()
    _configure_chapter_section(sec_ch5, is_first_chapter=False)
    add_chapter_5(doc)

    sec_ref = doc.add_section()
    _configure_chapter_section(sec_ref, is_first_chapter=False)
    add_references(doc)

    out_file = "CHAPTERS_1_TO_5_ONLY.docx"
    try:
        doc.save(out_file)
        print(f"[SUCCESS] Saved body-only book to {out_file}")
    except PermissionError:
        print(f"[WARNING] '{out_file}' is open in Word.")

    out_no_app = "CHAPTERS_1_TO_5_NO_APPENDICES.docx"
    try:
        doc.save(out_no_app)
        print(f"[SUCCESS] Also saved body-only book to {out_no_app}")
    except PermissionError:
        print(f"[WARNING] '{out_no_app}' is open in Word.")

    try:
        from convert_docx_to_md import docx_to_markdown
        docx_to_markdown(out_file, "CHAPTERS_1_TO_5_ONLY.md")
        docx_to_markdown(out_file, "CHAPTERS_1_TO_5_NO_APPENDICES.md")
    except Exception as e:
        print(f"[WARNING] Markdown conversion encountered: {e}")


if __name__ == "__main__":
    build_chapters_1_to_5_with_preliminaries()
    build_chapters_1_to_5_only_no_prelims()

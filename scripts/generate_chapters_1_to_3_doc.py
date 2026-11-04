import os
import sys
import docx
from docx.shared import Inches, Pt
from docx.enum.text import WD_ALIGN_PARAGRAPH

from book_helpers import (
    set_section_margins,
    set_section_page_numbering,
    add_page_number_field
)
from book_builder_styles import (
    apply_font,
    FONT_NAME,
    FONT_SIZE
)
from book_chapters_1_to_3 import (
    add_chapter_1,
    add_chapter_2,
    add_chapter_3
)
from book_chapters_4_to_end import add_references

def build_chapters_1_to_3_doc():
    print("--- Building Standalone Chapters I to III Document ---")
    doc = docx.Document()

    # Section 1: CHAPTER I
    sec_ch1 = doc.sections[0]
    set_section_margins(sec_ch1)
    sec_ch1.different_first_page_header_footer = True
    sec_ch1.header.is_linked_to_previous = False
    sec_ch1.footer.is_linked_to_previous = False
    set_section_page_numbering(sec_ch1, fmt="decimal", start=1)

    p_head1 = sec_ch1.header.paragraphs[0]
    p_head1.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    add_page_number_field(p_head1)
    apply_font(p_head1.runs[0] if p_head1.runs else p_head1.add_run())
    sec_ch1.footer.paragraphs[0].text = ""

    add_chapter_1(doc)

    # Section 2: CHAPTER II
    sec_ch2 = doc.add_section()
    set_section_margins(sec_ch2)
    sec_ch2.different_first_page_header_footer = True
    sec_ch2.header.is_linked_to_previous = True
    sec_ch2.footer.is_linked_to_previous = False
    sec_ch2.footer.paragraphs[0].text = ""

    add_chapter_2(doc)

    # Section 3: CHAPTER III
    sec_ch3 = doc.add_section()
    set_section_margins(sec_ch3)
    sec_ch3.different_first_page_header_footer = True
    sec_ch3.header.is_linked_to_previous = True
    sec_ch3.footer.is_linked_to_previous = False
    sec_ch3.footer.paragraphs[0].text = ""

    add_chapter_3(doc)

    # Section 4: REFERENCES
    sec_ref = doc.add_section()
    set_section_margins(sec_ref)
    sec_ref.different_first_page_header_footer = True
    sec_ref.header.is_linked_to_previous = True
    sec_ref.footer.is_linked_to_previous = False
    sec_ref.footer.paragraphs[0].text = ""

    add_references(doc)

    output_docx = "CAPSTONE_BOOK_CHAPTERS_I_TO_III_FINAL.docx"
    doc.save(output_docx)
    print(f"[SUCCESS] Saved standalone Chapters I to III to: {output_docx}")

if __name__ == "__main__":
    build_chapters_1_to_3_doc()

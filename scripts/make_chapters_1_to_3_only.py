import os
import docx
from docx import Document
from docx.shared import Inches, Pt, RGBColor
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

def generate_chapters_1_to_3_only():
    print("--- Generating CHAPTERS_1_TO_3_ONLY.docx ---")
    doc = Document()

    # Normal Style configuration
    normal_style = doc.styles['Normal']
    normal_style.font.name = FONT_NAME
    normal_style.font.size = FONT_SIZE
    normal_style.font.color.rgb = RGBColor(0, 0, 0)

    def configure_chapter_section(section, is_first_chapter=False):
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
            section.footer.paragraphs[0].text = ""

    # Chapter I: Starts directly on Page 1
    sec_ch1 = doc.sections[0]
    configure_chapter_section(sec_ch1, is_first_chapter=True)
    add_chapter_1(doc)

    # Chapter II
    sec_ch2 = doc.add_section()
    configure_chapter_section(sec_ch2, is_first_chapter=False)
    add_chapter_2(doc)

    # Chapter III
    sec_ch3 = doc.add_section()
    configure_chapter_section(sec_ch3, is_first_chapter=False)
    add_chapter_3(doc)

    # References
    sec_ref = doc.add_section()
    configure_chapter_section(sec_ref, is_first_chapter=False)
    add_references(doc)

    out_file = "CHAPTERS_1_TO_3_ONLY.docx"
    doc.save(out_file)
    print(f"[SUCCESS] Saved to {out_file}")

if __name__ == "__main__":
    generate_chapters_1_to_3_only()

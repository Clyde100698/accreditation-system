import os
import sys
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
    add_major_section_heading,
    add_heading,
    add_subheading,
    add_body_p,
    add_bullet_p,
    FONT_NAME,
    FONT_SIZE,
    DOUBLE_SPACE,
    SINGLE_SPACE
)
from book_chapters_1_to_3 import (
    add_chapter_1,
    add_chapter_2,
    add_chapter_3
)
from book_chapters_4_to_end import add_references

def build_chapters_1_to_3_with_preliminaries():
    print("--- Building Chapters I to III with Preliminaries in DOCX ---")
    doc = Document()

    # Normal style
    normal_style = doc.styles['Normal']
    normal_style.font.name = FONT_NAME
    normal_style.font.size = FONT_SIZE
    normal_style.font.color.rgb = RGBColor(0, 0, 0)

    # =========================================================================
    # SECTION 1: PRELIMINARIES (Pages i to viii)
    # =========================================================================
    sec_prelim = doc.sections[0]
    set_section_margins(sec_prelim)
    sec_prelim.different_first_page_header_footer = True
    set_section_page_numbering(sec_prelim, fmt="lowerRoman", start=1)

    # Preliminary Footer (bottom-center lower case roman numerals)
    p_foot = sec_prelim.footer.paragraphs[0]
    p_foot.alignment = WD_ALIGN_PARAGRAPH.CENTER
    add_page_number_field(p_foot)
    apply_font(p_foot.runs[0] if p_foot.runs else p_foot.add_run())

    # 1.1 TITLE PAGE (Page i)
    p_space = doc.add_paragraph()
    p_space.paragraph_format.line_spacing = DOUBLE_SPACE
    p_space.paragraph_format.space_before = Pt(36)

    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_title.paragraph_format.line_spacing = 1.3
    p_title.paragraph_format.space_after = Pt(36)
    p_title.paragraph_format.first_line_indent = Inches(0.0)

    r1 = p_title.add_run("WEB-BASED ACCREDITATION MANAGEMENT AND READINESS\n")
    apply_font(r1, bold=True, size=Pt(13))
    r2 = p_title.add_run("ASSESSMENT SYSTEM FOR STI WEST NEGROS\n")
    apply_font(r2, bold=True, size=Pt(13))
    r3 = p_title.add_run("UNIVERSITY")
    apply_font(r3, bold=True, size=Pt(13))

    p_ctx1 = doc.add_paragraph()
    p_ctx1.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_ctx1.paragraph_format.line_spacing = 1.3
    p_ctx1.paragraph_format.space_before = Pt(36)
    p_ctx1.paragraph_format.space_after = Pt(24)
    p_ctx1.paragraph_format.first_line_indent = Inches(0.0)
    r_ctx1 = p_ctx1.add_run(
        "A Capstone Project\n"
        "Presented to the Faculty of the\n"
        "College of Information and Communications Technology\n"
        "STI West Negros University, Bacolod City"
    )
    apply_font(r_ctx1)

    p_ctx2 = doc.add_paragraph()
    p_ctx2.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_ctx2.paragraph_format.line_spacing = 1.3
    p_ctx2.paragraph_format.space_before = Pt(24)
    p_ctx2.paragraph_format.space_after = Pt(36)
    p_ctx2.paragraph_format.first_line_indent = Inches(0.0)
    r_ctx2 = p_ctx2.add_run(
        "In Partial Fulfillment of the Requirements\n"
        "for the Degree Bachelor of Science\n"
        "in Computer Science"
    )
    apply_font(r_ctx2)

    p_by = doc.add_paragraph()
    p_by.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_by.paragraph_format.line_spacing = 1.3
    p_by.paragraph_format.space_before = Pt(24)
    p_by.paragraph_format.space_after = Pt(48)
    p_by.paragraph_format.first_line_indent = Inches(0.0)
    r_by = p_by.add_run("By:\n\nCLYDE TABURADA\n")
    apply_font(r_by, bold=True)

    p_date = doc.add_paragraph()
    p_date.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_date.paragraph_format.line_spacing = 1.3
    p_date.paragraph_format.first_line_indent = Inches(0.0)
    r_date = p_date.add_run("October 2026")
    apply_font(r_date)

    doc.add_page_break()

    # 1.2 APPROVAL SHEET (Page ii)
    add_major_section_heading(doc, "APPROVAL SHEET")
    add_body_p(
        doc,
        "This capstone project entitled **\"WEB-BASED ACCREDITATION MANAGEMENT AND READINESS ASSESSMENT SYSTEM FOR STI WEST NEGROS UNIVERSITY\"**, prepared and submitted by **CLYDE TABURADA** in partial fulfillment of the requirements for the degree Bachelor of Science in Computer Science, has been examined and is recommended for acceptance and approval for Oral Examination."
    )

    p_adv = doc.add_paragraph()
    p_adv.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    p_adv.paragraph_format.line_spacing = DOUBLE_SPACE
    p_adv.paragraph_format.space_before = Pt(30)
    p_adv.paragraph_format.space_after = Pt(30)
    r_adv = p_adv.add_run("_____________________________\nCapstone Project Adviser\n")
    apply_font(r_adv)

    add_body_p(
        doc,
        "Approved by the Committee on Oral Examination on October 2026 with a rating of PASSED."
    )

    p_panel = doc.add_paragraph()
    p_panel.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_panel.paragraph_format.line_spacing = DOUBLE_SPACE
    p_panel.paragraph_format.space_before = Pt(36)
    p_panel.paragraph_format.space_after = Pt(24)
    r_panel = p_panel.add_run(
        "PANEL OF EXAMINERS\n\n\n"
        "_____________________________          _____________________________\n"
        "       Panel Member                            Panel Member         \n\n\n"
        "_____________________________\n"
        "      Panel Chairman         "
    )
    apply_font(r_panel)

    add_body_p(
        doc,
        "Accepted and approved in partial fulfillment of the requirements for the degree Bachelor of Science in Computer Science."
    )

    p_dean = doc.add_paragraph()
    p_dean.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_dean.paragraph_format.line_spacing = DOUBLE_SPACE
    p_dean.paragraph_format.space_before = Pt(30)
    p_dean.paragraph_format.space_after = Pt(12)
    r_dean = p_dean.add_run(
        "_____________________________\n"
        "Dean, College of Information and Communications Technology\n"
        "STI West Negros University"
    )
    apply_font(r_dean)

    doc.add_page_break()

    # 1.3 ACKNOWLEDGEMENT (Page iii)
    add_major_section_heading(doc, "ACKNOWLEDGEMENT")
    add_body_p(
        doc,
        "The researcher wishes to express profound gratitude and sincere appreciation to the individuals and offices whose invaluable guidance, domain expertise, and unwavering support made the successful completion of this study possible."
    )
    add_body_p(
        doc,
        "First and foremost, to Almighty God, the divine source of wisdom, strength, patience, and inspiration throughout the conceptualization, system development, and documentation phases of this research."
    )
    add_body_p(
        doc,
        "To the administration of STI West Negros University, specifically the College of Information and Communications Technology (CICT) and the Quality Assurance (QA) Office, for granting institutional access, providing the PACUCOA Manual of Accreditation and historical compliance records, and allowing the deployment of the prototype for empirical evaluation."
    )
    add_body_p(
        doc,
        "To the Capstone Project Adviser, whose sharp critical insights, architectural guidance, and meticulous review of the mathematical scoring mechanics challenged the proponent to pursue technical and academic excellence."
    )
    add_body_p(
        doc,
        "To the esteemed Panel of Examiners, whose rigorous evaluations, constructive critiques, and forward-looking recommendations greatly strengthened the integrity and functional quality of the system."
    )
    add_body_p(
        doc,
        "To the faculty members of CICT who served as Area Chairs, Co-Chairs, and respondents during the empirical evaluation and system testing, for generously contributing their time and professional feedback."
    )
    add_body_p(
        doc,
        "Finally, to the proponent's family, loved ones, and friends, whose unending prayers, moral encouragement, and selfless sacrifices provided constant endurance and motivation."
    )

    doc.add_page_break()

    # 1.4 DEDICATION (Page iv)
    add_major_section_heading(doc, "DEDICATION")
    p_ded = doc.add_paragraph()
    p_ded.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_ded.paragraph_format.line_spacing = DOUBLE_SPACE
    p_ded.paragraph_format.space_before = Pt(72)
    p_ded.paragraph_format.space_after = Pt(24)
    p_ded.paragraph_format.first_line_indent = Inches(0.0)

    r_ded = p_ded.add_run(
        "This humble work is affectionately dedicated to:\n\n"
        "My beloved parents and family,\n"
        "whose unconditional love, continuous sacrifices,\n"
        "and steadfast prayers have been the bedrock\n"
        "of all my endeavors;\n\n"
        "To my mentors, professors, and colleagues at STI West Negros University,\n"
        "who nurtured my passion for computer science and innovation;\n\n"
        "To the academic community striving for continuous quality assurance;\n\n"
        "And above all, to the Almighty God,\n"
        "for His bountiful grace and divine providence."
    )
    apply_font(r_ded, italic=True)

    doc.add_page_break()

    # 1.5 ABSTRACT (Page v)
    add_major_section_heading(doc, "ABSTRACT")
    def add_abstract_p(text):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        p.paragraph_format.line_spacing = SINGLE_SPACE
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(8)
        p.paragraph_format.first_line_indent = Inches(0.0)
        run = p.add_run(text)
        apply_font(run)
        return p

    add_abstract_p(
        "Higher education institutions in the Philippines undergo periodic accreditation through recognized bodies such as the Philippine Association of Colleges and Universities Commission on Accreditation (PACUCOA) to guarantee academic excellence. However, manual accreditation preparation relies heavily on episodic physical document collation, decentralized digital files, and manual spreadsheet computations, resulting in logistical bottlenecks, high error risk, and an inability to forecast accreditation readiness. This study designed, developed, and evaluated the Web-Based Accreditation Management and Readiness Assessment System for STI West Negros University, with the Bachelor of Science in Computer Science (BSCS) program serving as the pilot. The system automates exhibit mapping across PACUCOA's ten undergraduate areas, enforces role-based access control with an independent dual-verification mechanism and self-verification block to ensure separation of duties, computes weighted readiness ratings in real time using the official PACUCOA weighting formula (total weight of 30) alongside dual-constraint floor rules, provides a 5x2 executive command dashboard, features an isolated what-if readiness simulation sandbox, and tracks post-visit accreditation compliance via a four-column matrix."
    )
    add_abstract_p(
        "Following an Agile developmental research methodology across four iterations, the platform was implemented using Next.js, TypeScript, Tailwind CSS, and a Supabase backend utilizing PostgreSQL with Row-Level Security and private object storage. Empirical verification using real institutional BSCS accreditation exhibits demonstrated the mathematical precision of the scoring engine, yielding a baseline program rating of 3.22 (total weighted value of 96.58 divided by 30) meeting Candidate Status thresholds, and simulating a strategic target rating of 3.93 for Level II readiness by completing ten high-impact criteria. The software was evaluated by thirty (30) purposive respondents comprising university administrators, quality assurance officers, deans, program heads, area chairs, faculty members, and technical IT experts using a 5-point Likert questionnaire based on the ISO/IEC 25010 software product quality model. The evaluation yielded a composite grand mean of 4.81 (Strongly Agree / Very Highly Acceptable), with all eight quality characteristics rated highly: Functional Suitability (4.82), Performance Efficiency (4.75), Compatibility (4.78), Usability (4.85), Reliability (4.80), Security (4.88), Maintainability (4.76), and Portability (4.84). The results establish that the automated system significantly enhances institutional accreditation preparedness, guarantees evidence integrity, and transitions higher education quality assurance from reactive episodic compilation to continuous, data-driven readiness."
    )

    p_kw = doc.add_paragraph()
    p_kw.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p_kw.paragraph_format.line_spacing = SINGLE_SPACE
    p_kw.paragraph_format.space_before = Pt(12)
    p_kw.paragraph_format.space_after = Pt(12)
    p_kw.paragraph_format.first_line_indent = Inches(0.0)
    r_kw_lbl = p_kw.add_run("Keywords: ")
    apply_font(r_kw_lbl, bold=True, italic=True)
    r_kw_txt = p_kw.add_run(
        "Accreditation Management, Continuous Quality Assurance, PACUCOA Framework, "
        "Readiness Assessment, What-If Simulation, Separation of Duties, ISO/IEC 25010, STI West Negros University."
    )
    apply_font(r_kw_txt)

    doc.add_page_break()

    # 1.6 TABLE OF CONTENTS (Page vi)
    add_major_section_heading(doc, "TABLE OF CONTENTS")

    toc_items = [
        ("TITLE PAGE", "i", 0, False),
        ("APPROVAL SHEET", "ii", 0, False),
        ("ACKNOWLEDGEMENT", "iii", 0, False),
        ("DEDICATION", "iv", 0, False),
        ("ABSTRACT", "v", 0, False),
        ("TABLE OF CONTENTS", "vi", 0, False),
        ("LIST OF TABLES", "vii", 0, False),
        ("LIST OF FIGURES", "viii", 0, False),
        ("CHAPTER I: INTRODUCTION", "1", 0, True),
        ("Background of the Study", "1", 1, True),
        ("Background of the Institution", "3", 2, False),
        ("The Proposed System", "4", 2, False),
        ("Objective of the Study", "5", 1, True),
        ("General Objective", "5", 2, False),
        ("Specifically, the system aims to:", "5", 2, False),
        ("Conceptual Framework", "6", 1, True),
        ("Narrative of the Conceptual Framework", "7", 2, False),
        ("Significance of the Study", "8", 1, True),
        ("Scope and Limitation of the Study", "9", 1, True),
        ("Scope of the Study", "9", 2, False),
        ("Limitations of the Study", "10", 2, False),
        ("Definition of Terms", "11", 1, True),
        ("CHAPTER II: RELATED LITERATURE AND PRIOR ARTS SEARCH", "15", 0, True),
        ("Review of Related Literature", "15", 1, True),
        ("Accreditation and Quality Assurance in Philippine Higher Education", "15", 2, False),
        ("Digital Evidence Management and Continuous Readiness", "17", 2, False),
        ("Decision Support and What-If Analysis", "18", 2, False),
        ("Access Control and Separation of Duties", "19", 2, False),
        ("Software Quality Evaluation", "20", 2, False),
        ("Prior Arts Search", "21", 1, True),
        ("Scope of the Search", "21", 2, False),
        ("Existing Systems", "22", 2, False),
        ("Comparative Analysis", "23", 2, False),
        ("Synthesis and Research Gap", "25", 2, False),
        ("CHAPTER III: MATERIALS AND METHODS", "27", 0, True),
        ("System Design", "27", 1, True),
        ("Requirements Gathering", "27", 2, False),
        ("Development Methodology", "28", 2, False),
        ("System Architecture", "30", 2, False),
        ("Users, Roles, and Access Control", "32", 2, False),
        ("Data Design", "34", 2, False),
        ("System Process Flow", "36", 2, False),
        ("Functional Modules", "38", 2, False),
        ("Illustration of the Scoring Mechanics", "43", 2, False),
        ("Research Design", "45", 1, True),
        ("Locale of the Study", "46", 1, True),
        ("Respondents of the Study (with sampling technique)", "46", 1, True),
        ("Data Analysis", "48", 1, True),
        ("Evaluation Instrument", "48", 2, False),
        ("Statistical Treatment", "49", 2, False),
        ("Ethical Considerations", "50", 1, True),
        ("REFERENCES", "53", 0, True),
    ]

    for title, page, level, is_bold in toc_items:
        p = doc.add_paragraph()
        p.paragraph_format.line_spacing = 1.3
        p.paragraph_format.space_before = Pt(2)
        p.paragraph_format.space_after = Pt(2)
        p.paragraph_format.left_indent = Inches(0.25 * level)
        p.paragraph_format.first_line_indent = Inches(0.0)

        target_len = 54 - (level * 3) - len(title)
        if target_len < 3:
            target_len = 3
        dots = " " + ". " * (target_len // 2) + " "

        r_title = p.add_run(title)
        apply_font(r_title, bold=is_bold)
        r_dots = p.add_run(dots)
        apply_font(r_dots)
        r_page = p.add_run(page)
        apply_font(r_page, bold=is_bold)

    doc.add_page_break()

    # 1.7 LIST OF TABLES (Page vii)
    add_major_section_heading(doc, "LIST OF TABLES")

    tables_list = [
        ("Table 1", "PACUCOA Undergraduate Areas and Equivalent Weights (Total Weight = 30)", "2"),
        ("Table 2", "Comparison of Reviewed Systems and the Proposed System, Based on Public Materials", "24"),
        ("Table 3", "Development Timeline, August to October 2026", "29"),
        ("Table 4", "Roles and Permissions", "33"),
        ("Table 5", "Principal Data Entities", "35"),
        ("Table 6", "Hypothetical Computation of a Program Rating (Illustration)", "44"),
        ("Table 7", "Respondent Breakdown and Qualifications", "47"),
        ("Table 8", "Interpretation of Weighted Means", "50"),
    ]

    for num, title, page in tables_list:
        p = doc.add_paragraph()
        p.paragraph_format.line_spacing = 1.3
        p.paragraph_format.space_before = Pt(3)
        p.paragraph_format.space_after = Pt(3)
        p.paragraph_format.first_line_indent = Inches(0.0)

        entry_text = f"{num}. {title}"
        target_len = 54 - len(entry_text)
        if target_len < 3:
            target_len = 3
        dots = " " + ". " * (target_len // 2) + " "

        r_txt = p.add_run(entry_text)
        apply_font(r_txt)
        r_dots = p.add_run(dots)
        apply_font(r_dots)
        r_page = p.add_run(page)
        apply_font(r_page)

    doc.add_page_break()

    # 1.8 LIST OF FIGURES (Page viii)
    add_major_section_heading(doc, "LIST OF FIGURES")

    figures_list = [
        ("Figure 1", "Conceptual Framework of the Study (Input–Process–Output Model with Feedback Loop)", "7"),
        ("Figure 2", "Software Development Life Cycle (SDLC) Framework (Agile Scrum with Four Iterations)", "29"),
        ("Figure 3", "System Architecture of the Web-Based Accreditation Management and Readiness Assessment System", "32"),
        ("Figure 4", "Context Flow Diagram (Data Flow Diagram Level 0) of the Accreditation System", "35"),
        ("Figure 5", "Data Flow Diagram (Level 1) of the Accreditation System", "38"),
        ("Figure 6", "Entity-Relationship Diagram (ERD) of the Accreditation Management Database", "41"),
        ("Figure 7", "System Process Flow from Setup to Post-Visit Compliance Tracking", "44"),
        ("Figure 8", "User Flow of the System Administrator", "45"),
        ("Figure 9", "User Flow of the Quality Assurance Officer", "46"),
        ("Figure 10", "User Flow of the Dean", "47"),
        ("Figure 11", "User Flow of the Program Head", "48"),
        ("Figure 12", "User Flow of the Area Chair and Co-Chair", "49"),
        ("Figure 13", "User Flow of the Faculty Member", "50"),
        ("Figure 14", "User Flow of the Alumni and Student Representative", "51"),
        ("Figure 15", "Location of STI West Negros University, Burgos Street, Bacolod City", "52"),
    ]

    for num, title, page in figures_list:
        p = doc.add_paragraph()
        p.paragraph_format.line_spacing = 1.3
        p.paragraph_format.space_before = Pt(3)
        p.paragraph_format.space_after = Pt(3)
        p.paragraph_format.first_line_indent = Inches(0.0)

        entry_text = f"{num}. {title}"
        target_len = 54 - len(entry_text)
        if target_len < 3:
            target_len = 3
        dots = " " + ". " * (target_len // 2) + " "

        r_txt = p.add_run(entry_text)
        apply_font(r_txt)
        r_dots = p.add_run(dots)
        apply_font(r_dots)
        r_page = p.add_run(page)
        apply_font(r_page)

    # =========================================================================
    # CHAPTER SECTIONS
    # =========================================================================
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

    # Chapter I
    sec_ch1 = doc.add_section()
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

    # Save to the primary target files
    out_files = [
        "CAPSTONE_BOOK_CHAPTERS_I_TO_III_FINAL.docx",
        "CAPSTONE_BOOK_CHAPTERS_I_TO_III_REVISED.docx",
        "CAPSTONE_BOOK_CHAPTERS_I_TO_III.docx"
    ]
    for fn in out_files:
        doc.save(fn)
        print(f"[SUCCESS] Saved DOCX to: {fn}")

if __name__ == "__main__":
    build_chapters_1_to_3_with_preliminaries()

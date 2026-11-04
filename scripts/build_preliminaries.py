import docx
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_TAB_ALIGNMENT, WD_TAB_LEADER

from book_helpers import (
    set_section_margins,
    set_section_page_numbering,
    add_page_number_field,
)
from book_builder_styles import (
    apply_font,
    add_major_section_heading,
    FONT_NAME,
    FONT_SIZE,
    DOUBLE_SPACE,
    SINGLE_SPACE,
)


def _add_page_heading(doc, text):
    """Adds a centered, bold, ALL-CAPS major preliminary heading starting cleanly on a new page."""
    p = add_major_section_heading(doc, text)
    p.paragraph_format.page_break_before = True
    return p


def _add_aligned_entry(
    doc,
    left_text,
    page_str,
    first_col_in=0.0,
    hang_in=0.0,
    is_bold=False,
    space_before_pt=2.0,
    space_after_pt=2.0,
):
    """
    Adds a clean, dot-free Table of Contents / List entry with:
      - Right-aligned page number flush at 6.00 in (exact right margin: 8.50 - 1.50 - 1.00 = 6.00 in)
      - WD_TAB_LEADER.SPACES (NO '.....' dot leaders)
      - Right indent at 0.55 in so multi-line titles wrap cleanly at 5.45 in without touching page numbers
      - Optional hanging indent so wrapped continuation lines indent neatly
    """
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.LEFT
    pf = p.paragraph_format
    pf.line_spacing = 1.25
    pf.space_before = Pt(space_before_pt)
    pf.space_after = Pt(space_after_pt)
    pf.left_indent = Inches(first_col_in + hang_in)
    pf.first_line_indent = Inches(-hang_in) if hang_in else Inches(0.0)
    pf.right_indent = Inches(0.55)
    pf.keep_together = True
    pf.tab_stops.add_tab_stop(Inches(6.00), WD_TAB_ALIGNMENT.RIGHT, WD_TAB_LEADER.SPACES)

    r_title = p.add_run(left_text)
    apply_font(r_title, bold=is_bold)
    r_page = p.add_run(f"\t{page_str}")
    apply_font(r_page, bold=is_bold)
    return p


def _add_column_header(doc, left_label="", right_label="Page"):
    """Adds a clean column header row above the aligned page-number column."""
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.LEFT if left_label else WD_ALIGN_PARAGRAPH.RIGHT
    pf = p.paragraph_format
    pf.line_spacing = SINGLE_SPACE
    pf.space_before = Pt(0)
    pf.space_after = Pt(6)
    pf.left_indent = Inches(0.0)
    pf.first_line_indent = Inches(0.0)
    if left_label:
        pf.tab_stops.add_tab_stop(Inches(6.00), WD_TAB_ALIGNMENT.RIGHT, WD_TAB_LEADER.SPACES)
        r = p.add_run(f"{left_label}\t{right_label}")
    else:
        r = p.add_run(right_label)
    apply_font(r, bold=True)
    return p


def populate_preliminaries(doc, toc_pages=None, table_pages=None, figure_pages=None):
    """Populates Section 1 (Preliminaries: Title Page through List of Figures)."""
    toc_pages = toc_pages or {}
    table_pages = table_pages or {}
    figure_pages = figure_pages or {}

    sec_prelim = doc.sections[0]
    set_section_margins(sec_prelim)
    sec_prelim.different_first_page_header_footer = True
    set_section_page_numbering(sec_prelim, fmt="lowerRoman", start=1)

    # Preliminary Footer (bottom-center lower-case Roman numerals; hidden on Page i)
    p_foot = sec_prelim.footer.paragraphs[0]
    p_foot.alignment = WD_ALIGN_PARAGRAPH.CENTER
    add_page_number_field(p_foot)
    apply_font(p_foot.runs[0] if p_foot.runs else p_foot.add_run())

    # -------------------------------------------------------------------------
    # 1.1 TITLE PAGE (Page i)
    # -------------------------------------------------------------------------
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
    r2 = p_title.add_run("ASSESSMENT SYSTEM")
    apply_font(r2, bold=True, size=Pt(13))

    for line in [
        "A Capstone Project",
        "Presented to the Faculty of the Graduate School",
        "State University of Northern Negros",
        "Sagay City, Negros Occidental\n",
        "In Partial Fulfillment",
        "of the Requirements for the Degree",
        "Master in Information Technology",
    ]:
        p_line = doc.add_paragraph()
        p_line.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_line.paragraph_format.line_spacing = 1.5
        p_line.paragraph_format.space_before = Pt(0)
        p_line.paragraph_format.space_after = Pt(0)
        p_line.paragraph_format.first_line_indent = Inches(0.0)
        r_line = p_line.add_run(line)
        apply_font(r_line)

    p_by = doc.add_paragraph()
    p_by.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_by.paragraph_format.line_spacing = 1.3
    p_by.paragraph_format.space_before = Pt(24)
    p_by.paragraph_format.space_after = Pt(48)
    p_by.paragraph_format.first_line_indent = Inches(0.0)
    r_by = p_by.add_run("By:\n\nJOSE MARIE CLYDE B. TABURADA\n")
    apply_font(r_by, bold=True)

    p_date = doc.add_paragraph()
    p_date.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_date.paragraph_format.line_spacing = 1.3
    p_date.paragraph_format.first_line_indent = Inches(0.0)
    r_date = p_date.add_run("November 5, 2026")
    apply_font(r_date)

    # -------------------------------------------------------------------------
    # 1.2 APPROVAL SHEET (Page ii — Title only, 1 blank page)
    # -------------------------------------------------------------------------
    _add_page_heading(doc, "APPROVAL SHEET")

    # -------------------------------------------------------------------------
    # 1.3 ACKNOWLEDGEMENT (Page iii — Title only, 1 blank page)
    # -------------------------------------------------------------------------
    _add_page_heading(doc, "ACKNOWLEDGEMENT")

    # -------------------------------------------------------------------------
    # 1.4 DEDICATION (Page iv — Title only, 1 blank page)
    # -------------------------------------------------------------------------
    _add_page_heading(doc, "DEDICATION")

    # -------------------------------------------------------------------------
    # 1.5 ABSTRACT (Page v — <= 250 words max, single-spaced, justified, no indent)
    # -------------------------------------------------------------------------
    _add_page_heading(doc, "ABSTRACT")

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
        "Philippine higher education institutions undergo periodic accreditation through the Philippine Association of Colleges and Universities Commission on Accreditation (PACUCOA), yet decentralized file storage fragments documentary exhibits and hinders readiness forecasting. Using an Agile developmental methodology across four iterations, this study designed, developed, and evaluated a Web-Based Accreditation Management and Readiness Assessment System piloted on the Bachelor of Science in Computer Science (BSCS) program of STI West Negros University. Built with Next.js, TypeScript, Tailwind CSS, and Supabase PostgreSQL with Row-Level Security, the system maps exhibits across ten PACUCOA areas, enforces role-based access control with an independent verification block, computes weighted ratings (total weight of 30) under area and criterion floor rules, and provides a 5x2 command dashboard, what-if simulation sandbox, and four-column compliance matrix."
    )
    add_abstract_p(
        "Testing on loaded BSCS exhibits yielded a 3.22 baseline rating, meeting Candidate Status while flagging Areas IV (2.67), V (2.82), and VII (1.30) below the 3.00 Level I floor; this reflects loaded repository files rather than official status, as BSCS earned PACUCOA Level I accreditation in September 2026. Simulating ten priority criteria raised the overall rating to 3.57 (+0.35), clearing all Level I floors while five areas remained below the 3.50 Level II floor. ISO/IEC 25010 evaluation by 20 respondents (15 institutional users, 4.83; 5 IT experts, 4.40) produced a 4.72 grand mean (Very Highly Acceptable), led by Security (4.89)."
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
        "Accreditation Management, Quality Assurance, PACUCOA, Readiness Assessment, "
        "What-If Simulation, Separation of Duties, ISO/IEC 25010."
    )
    apply_font(r_kw_txt)

    # -------------------------------------------------------------------------
    # 1.6 TABLE OF CONTENTS (Page vi+ — Clean, arranged, NO '.....', aligned page numbers)
    # -------------------------------------------------------------------------
    _add_page_heading(doc, "TABLE OF CONTENTS")
    _add_column_header(doc, left_label="", right_label="Page")

    # (display_title, default_page, level, is_bold, has_group_gap)
    toc_items = [
        ("TITLE PAGE", "i", 0, False, False),
        ("APPROVAL SHEET", "ii", 0, False, False),
        ("ACKNOWLEDGEMENT", "iii", 0, False, False),
        ("DEDICATION", "iv", 0, False, False),
        ("ABSTRACT", "v", 0, False, False),
        ("TABLE OF CONTENTS", "vi", 0, False, False),
        ("LIST OF TABLES", "ix", 0, False, False),
        ("LIST OF FIGURES", "x", 0, False, False),

        ("CHAPTER I: INTRODUCTION", "1", 0, True, True),
        ("Background of the Study", "1", 1, True, False),
        ("Background of the Institution", "6", 2, False, False),
        ("The Developed System", "7", 2, False, False),
        ("Objective of the Study", "9", 1, True, False),
        ("General Objective", "9", 2, False, False),
        ("Specifically, the study sought to:", "10", 2, False, False),
        ("Conceptual Framework", "11", 1, True, False),
        ("Narrative of the Conceptual Framework", "11", 2, False, False),
        ("Significance of the Study", "13", 1, True, False),
        ("Scope and Limitation of the Study", "14", 1, True, False),
        ("Scope of the Study", "14", 2, False, False),
        ("Limitations of the Study", "15", 2, False, False),
        ("Definition of Terms", "17", 1, True, False),

        ("CHAPTER II: RELATED LITERATURE AND PRIOR ARTS SEARCH", "22", 0, True, True),
        ("Review of Related Literature", "22", 1, True, False),
        ("Accreditation and Quality Assurance in Philippine Higher Education", "22", 2, False, False),
        ("Digital Evidence Management and Continuous Readiness", "25", 2, False, False),
        ("Decision Support and What-If Analysis in Education", "26", 2, False, False),
        ("Access Control and Separation of Duties", "28", 2, False, False),
        ("Software Quality Evaluation", "30", 2, False, False),
        ("Accreditation and Quality Assurance Information Systems in Southeast Asia", "31", 2, False, False),
        ("Prior Arts Search", "33", 1, True, False),
        ("Scope of the Search", "33", 2, False, False),
        ("Existing Systems", "33", 2, False, False),
        ("Comparative Analysis", "34", 2, False, False),
        ("Synthesis and Research Gap", "36", 2, False, False),

        ("CHAPTER III: MATERIALS AND METHODS", "38", 0, True, True),
        ("System Design", "38", 1, True, False),
        ("Requirements Gathering", "38", 2, False, False),
        ("Development Methodology", "38", 2, False, False),
        ("System Architecture", "40", 2, False, False),
        ("Hardware and Software Requirements", "41", 2, False, False),
        ("Machine Learning and Artificial Intelligence Specifications", "43", 2, False, False),
        ("Users, Roles, and Access Control", "45", 2, False, False),
        ("Process Modeling", "47", 2, False, False),
        ("Data Design", "48", 2, False, False),
        ("System Process Flow", "51", 2, False, False),
        ("Functional Modules", "66", 2, False, False),
        ("Illustration of the Scoring Mechanics", "67", 2, False, False),
        ("Research Design", "69", 1, True, False),
        ("Locale of the Study", "69", 1, True, False),
        ("Respondents of the Study (with sampling technique)", "70", 1, True, False),
        ("Data Gathering Procedure", "73", 1, True, False),
        ("Data Analysis", "75", 1, True, False),
        ("Evaluation Instrument", "75", 2, False, False),
        ("Statistical Treatment", "75", 2, False, False),
        ("Ethical Considerations", "76", 1, True, False),
        ("Declaration of the Use of AI", "78", 1, True, False),

        ("CHAPTER IV: PRESENTATION, ANALYSIS AND INTERPRETATION", "80", 0, True, True),
        ("System Implementation and Operational Features", "80", 1, True, False),
        ("Executive 5x2 Command Dashboard and Heatmap Visualization", "80", 2, False, False),
        ("Evidence Management and Mapping Implementation", "81", 2, False, False),
        ("Role-Based Access Control and Independent Verification (Self-Verification Block)", "83", 2, False, False),
        ("What-If Readiness Simulation Sandbox", "84", 2, False, False),
        ("Four-Column Post-Visit Compliance Tracking Matrix", "85", 2, False, False),
        ("Verification of PACUCOA Scoring Mechanics and Empirical Assessment", "87", 1, True, False),
        ("Baseline Assessment of the BSCS Program", "87", 2, False, False),
        ("Dual-Constraint Threshold Analysis", "89", 2, False, False),
        ("Relationship to the Official Accreditation Status", "89", 2, False, False),
        ("Simulation Analysis and Readiness Optimization", "90", 2, False, False),
        ("Software Quality Evaluation (ISO/IEC 25010)", "93", 1, True, False),
        ("Respondent Profile", "93", 2, False, False),
        ("Evaluation Results Across Quality Characteristics", "94", 2, False, False),
        ("Interpretation and Qualitative Synthesis", "95", 2, False, False),

        ("CHAPTER V: SUMMARY, CONCLUSION AND RECOMMENDATION", "99", 0, True, True),
        ("Summary of Findings", "99", 1, True, False),
        ("Conclusion", "101", 1, True, False),
        ("Recommendation", "103", 1, True, False),

        ("REFERENCES", "106", 0, True, True),

        ("APPENDICES", "115", 0, True, True),
        ("Appendix A. CURRICULUM VITAE", "115", 1, False, False),
        ("Appendix B. CERTIFICATE OF PLAGIARISM", "117", 1, False, False),
        ("Appendix C. CERTIFICATE OF UTILIZATION", "119", 1, False, False),
        ("Appendix D. USER'S MANUAL", "121", 1, False, False),
    ]

    for title, default_pg, level, is_bold, has_gap in toc_items:
        pg = toc_pages.get(title, default_pg)
        if level == 0:
            _add_aligned_entry(
                doc,
                title,
                pg,
                first_col_in=0.0,
                hang_in=0.20,
                is_bold=is_bold,
                space_before_pt=8.0 if has_gap else 2.0,
                space_after_pt=2.0,
            )
        elif level == 1:
            _add_aligned_entry(
                doc,
                title,
                pg,
                first_col_in=0.30,
                hang_in=0.20,
                is_bold=is_bold,
                space_before_pt=3.0,
                space_after_pt=1.5,
            )
        else:
            _add_aligned_entry(
                doc,
                title,
                pg,
                first_col_in=0.60,
                hang_in=0.20,
                is_bold=is_bold,
                space_before_pt=1.5,
                space_after_pt=1.5,
            )

    # -------------------------------------------------------------------------
    # 1.7 LIST OF TABLES (Clean, arranged, NO '.....', aligned page numbers)
    # -------------------------------------------------------------------------
    _add_page_heading(doc, "LIST OF TABLES")
    _add_column_header(doc, left_label="Table", right_label="Page")

    tables_list = [
        ("Table 1", "PACUCOA Undergraduate Areas and Equivalent Weights (Total Weight = 30)", "2"),
        ("Table 2", "Comparison of Reviewed Systems and the Proposed System, Based on Public Materials", "35"),
        ("Table 3", "Development Timeline, August to October 2026", "38"),
        ("Table 4", "Roles and Permissions", "45"),
        ("Table 5", "Principal Data Entities", "49"),
        ("Table 6", "Hypothetical Computation of a Program Rating (Illustration)", "68"),
        ("Table 7", "Respondent Breakdown and Qualifications", "71"),
        ("Table 8", "Interpretation of Weighted Means", "76"),
        ("Table 9", "Baseline Assessment of the BSCS Program by PACUCOA Area", "87"),
        ("Table 10", "Summary of ISO/IEC 25010 Software Quality Evaluation Results Across User and Expert Groups", "94"),
    ]

    for num, title, default_pg in tables_list:
        pg = table_pages.get(num, default_pg)
        # Pad 'Table X.' to 10 chars (1.00 in in Courier New 12pt) so titles and wrapped lines align vertically
        prefix = f"{num}.".ljust(10)
        _add_aligned_entry(
            doc,
            f"{prefix}{title}",
            pg,
            first_col_in=0.0,
            hang_in=1.00,
            is_bold=False,
            space_before_pt=3.0,
            space_after_pt=3.0,
        )

    # -------------------------------------------------------------------------
    # 1.8 LIST OF FIGURES (Clean, arranged, NO '.....', aligned page numbers)
    # -------------------------------------------------------------------------
    _add_page_heading(doc, "LIST OF FIGURES")
    _add_column_header(doc, left_label="Figure", right_label="Page")

    figures_list = [
        ("Figure 1", "Conceptual Framework of the Study (Input–Process–Output Model with Feedback Loop)", "11"),
        ("Figure 2", "Software Development Life Cycle (SDLC) Framework (Agile Scrum with Four Iterations)", "40"),
        ("Figure 3", "System Architecture of the Web-Based Accreditation Management and Readiness Assessment System", "41"),
        ("Figure 4", "Context Flow Diagram (Data Flow Diagram Level 0) of the Accreditation System", "47"),
        ("Figure 5", "Data Flow Diagram (Level 1) of the Accreditation System", "48"),
        ("Figure 6", "Entity-Relationship Diagram (ERD) of the Accreditation Management Database", "51"),
        ("Figure 7", "System Process Flow from Setup to Post-Visit Compliance Tracking", "52"),
        ("Figure 8", "User Flow of the System Administrator", "54"),
        ("Figure 9", "User Flow of the Quality Assurance Officer", "56"),
        ("Figure 10", "User Flow of the Dean", "58"),
        ("Figure 11", "User Flow of the Program Head", "60"),
        ("Figure 12", "User Flow of the Area Chair and Co-Chair", "62"),
        ("Figure 13", "User Flow of the Faculty Member", "64"),
        ("Figure 14", "User Flow of the Alumni and Student Representative", "65"),
        ("Figure 15", "Location of STI West Negros University, Burgos Street, Bacolod City", "70"),
        ("Figure 16", "Executive 5x2 Command Dashboard and PACUCOA Area Status Overview", "81"),
        ("Figure 17", "Accreditation Evidence Repository and Exhibit Ingestion Interface", "82"),
        ("Figure 18", "Independent Verification Queue with Enforced Self-Verification Block", "84"),
        ("Figure 19", "What-If Readiness Simulation Sandbox with Dual-Constraint Threshold Forecast", "85"),
        ("Figure 20", "PACUCOA Four-Column Post-Visit Compliance Tracking Matrix", "87"),
    ]

    for num, title, default_pg in figures_list:
        pg = figure_pages.get(num, default_pg)
        # Pad 'Figure X.' to 11 chars (1.10 in in Courier New 12pt) so titles and wrapped lines align vertically
        prefix = f"{num}.".ljust(11)
        _add_aligned_entry(
            doc,
            f"{prefix}{title}",
            pg,
            first_col_in=0.0,
            hang_in=1.10,
            is_bold=False,
            space_before_pt=3.0,
            space_after_pt=3.0,
        )


def create_capstone_book():
    doc = Document()
    normal_style = doc.styles["Normal"]
    normal_style.font.name = FONT_NAME
    normal_style.font.size = FONT_SIZE
    normal_style.font.color.rgb = RGBColor(0, 0, 0)

    populate_preliminaries(doc)
    print("Preliminaries created successfully.")
    return doc

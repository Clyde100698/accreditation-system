"""
generate_questionnaire_docx.py
------------------------------
Generates a publication-grade, print-ready Microsoft Word document (.docx)
for the formal ISO/IEC 25010 Software Quality Evaluation Questionnaire.

STI West Negros University - College of Information and Communications Technology (CICT)
Proponent: Clyde P. Abarre (BSCS)
Output: EVALUATION_QUESTIONNAIRE_ISO_25010.docx
"""

import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

def set_cell_background(cell, fill_hex):
    tcPr = cell._tc.get_or_add_tcPr()
    tcPr.append(parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>'))

def set_cell_margins(cell, top=70, bottom=70, left=90, right=90):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = OxmlElement('w:tcMar')
    for m, val in [('top', top), ('bottom', bottom), ('left', left), ('right', right)]:
        node = OxmlElement(f'w:{m}')
        node.set(qn('w:w'), str(val))
        node.set(qn('w:type'), 'dxa')
        tcMar.append(node)
    tcPr.append(tcMar)

def set_table_borders(table, color="CBD5E1", sz="4"):
    tblPr = table._tbl.tblPr
    borders = parse_xml(
        f'<w:tblBorders {nsdecls("w")}>'
        f'<w:top w:val="single" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'<w:left w:val="single" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'<w:bottom w:val="single" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'<w:right w:val="single" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'<w:insideH w:val="single" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'<w:insideV w:val="single" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'</w:tblBorders>'
    )
    tblPr.append(borders)

def build_questionnaire_docx():
    doc = docx.Document()

    # Page Margins: 0.75 inches
    for sec in doc.sections:
        sec.top_margin = Inches(0.75)
        sec.bottom_margin = Inches(0.75)
        sec.left_margin = Inches(0.75)
        sec.right_margin = Inches(0.75)

    NAVY_HEX = "102A4D"
    NAVY_RGB = RGBColor(16, 42, 77)
    DARK_RGB = RGBColor(15, 23, 42)
    MUTED_RGB = RGBColor(100, 116, 139)
    GRAY_HEADER = "F1F5F9"
    GRAY_ROW = "F8FAFC"
    WHITE_HEX = "FFFFFF"

    # -------------------------------------------------------------
    # 1. INSTITUTIONAL HEADER
    # -------------------------------------------------------------
    p_head = doc.add_paragraph()
    p_head.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_head.paragraph_format.space_before = Pt(0)
    p_head.paragraph_format.space_after = Pt(2)
    p_head.paragraph_format.line_spacing = 1.05

    r1 = p_head.add_run("STI WEST NEGROS UNIVERSITY\n")
    r1.bold = True
    r1.font.size = Pt(13)
    r1.font.color.rgb = NAVY_RGB

    r2 = p_head.add_run("College of Information and Communications Technology (CICT)\n")
    r2.bold = True
    r2.font.size = Pt(10.5)
    r2.font.color.rgb = DARK_RGB

    r3 = p_head.add_run("Burgos Street, Bacolod City, Negros Occidental, Philippines\n")
    r3.font.size = Pt(9)
    r3.font.color.rgb = MUTED_RGB

    p_div = doc.add_paragraph()
    p_div.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_div.paragraph_format.space_before = Pt(1)
    p_div.paragraph_format.space_after = Pt(4)
    r_div = p_div.add_run("―" * 58)
    r_div.font.color.rgb = RGBColor(217, 119, 6)
    r_div.bold = True

    # -------------------------------------------------------------
    # 2. DOCUMENT TITLE & PROJECT METADATA
    # -------------------------------------------------------------
    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_title.paragraph_format.space_before = Pt(0)
    p_title.paragraph_format.space_after = Pt(1)
    r_t = p_title.add_run("SOFTWARE QUALITY EVALUATION INSTRUMENT")
    r_t.bold = True
    r_t.font.size = Pt(12.5)
    r_t.font.color.rgb = NAVY_RGB

    p_sub = doc.add_paragraph()
    p_sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_sub.paragraph_format.space_before = Pt(0)
    p_sub.paragraph_format.space_after = Pt(6)
    r_s = p_sub.add_run("Standardized Evaluation Instrument based on ISO/IEC 25010:2011 Software Product Quality Model")
    r_s.italic = True
    r_s.font.size = Pt(9)
    r_s.font.color.rgb = MUTED_RGB

    tbl_meta = doc.add_table(rows=1, cols=1)
    tbl_meta.alignment = WD_TABLE_ALIGNMENT.CENTER
    tbl_meta.autofit = False
    cell_meta = tbl_meta.cell(0, 0)
    cell_meta.width = Inches(7.0)
    set_cell_background(cell_meta, "F0F7FF")
    set_cell_margins(cell_meta, top=70, bottom=70, left=120, right=120)
    set_table_borders(tbl_meta, color="102A4D", sz="6")

    p_m = cell_meta.paragraphs[0]
    p_m.paragraph_format.space_before = Pt(0)
    p_m.paragraph_format.space_after = Pt(0)
    p_m.paragraph_format.line_spacing = 1.15
    
    r_m1 = p_m.add_run("Project Title: ")
    r_m1.bold = True
    r_m1.font.size = Pt(9)
    r_m1.font.color.rgb = NAVY_RGB
    
    r_m2 = p_m.add_run("Web-Based Accreditation Management and Readiness Assessment System for STI West Negros University\n")
    r_m2.font.size = Pt(9)
    r_m2.font.color.rgb = DARK_RGB

    r_m3 = p_m.add_run("Proponent: ")
    r_m3.bold = True
    r_m3.font.size = Pt(9)
    r_m3.font.color.rgb = NAVY_RGB

    r_m4 = p_m.add_run("Clyde P. Abarre (Bachelor of Science in Computer Science)   |   ")
    r_m4.font.size = Pt(9)
    r_m4.font.color.rgb = DARK_RGB

    r_m5 = p_m.add_run("Target Evaluator: ")
    r_m5.bold = True
    r_m5.font.size = Pt(9)
    r_m5.font.color.rgb = NAVY_RGB

    r_m6 = p_m.add_run("[  ] Institutional User (n = 15)    [  ] Technical IT Expert (n = 5)")
    r_m6.font.size = Pt(9)
    r_m6.font.color.rgb = DARK_RGB

    # -------------------------------------------------------------
    # 3. INFORMED CONSENT & INVITATION LETTER
    # -------------------------------------------------------------
    p_let = doc.add_paragraph()
    p_let.paragraph_format.space_before = Pt(6)
    p_let.paragraph_format.space_after = Pt(5)
    p_let.paragraph_format.line_spacing = 1.15
    
    r_l1 = p_let.add_run("Dear Evaluator: ")
    r_l1.bold = True
    r_l1.font.size = Pt(9)
    r_l1.font.color.rgb = DARK_RGB

    r_l2 = p_let.add_run(
        "Thank you for evaluating the Web-Based Accreditation Management and Readiness Assessment System. "
        "This platform streamlines documentary collation, enforces separation of duties, automates PACUCOA undergraduate "
        "30-weight calculations, provides What-If readiness forecasting, and manages post-visit compliance for STI West Negros University. "
        "In compliance with the Data Privacy Act of 2012 (RA 10173), all feedback will be treated with strict confidentiality and reported solely in aggregate format."
    )
    r_l2.font.size = Pt(8.5)
    r_l2.font.color.rgb = DARK_RGB

    # -------------------------------------------------------------
    # 4. PART I: RESPONDENT DEMOGRAPHIC & PROFESSIONAL PROFILE
    # -------------------------------------------------------------
    p_p1 = doc.add_paragraph()
    p_p1.paragraph_format.space_before = Pt(4)
    p_p1.paragraph_format.space_after = Pt(3)
    r_p1 = p_p1.add_run("PART I: RESPONDENT PROFILE")
    r_p1.bold = True
    r_p1.font.size = Pt(10)
    r_p1.font.color.rgb = NAVY_RGB

    tbl_prof = doc.add_table(rows=3, cols=2)
    tbl_prof.alignment = WD_TABLE_ALIGNMENT.CENTER
    tbl_prof.autofit = False
    set_table_borders(tbl_prof, color="CBD5E1", sz="4")

    prof_data = [
        ("Institutional Role / Professional Category:", 
         "[  ] Quality Assurance Officer\n[  ] College Dean\n[  ] Program Head (BSCS / BSIT)\n[  ] Faculty Member / Accreditation Committee Member\n[  ] External IT Expert / Software Architect / Industry Practitioner"),
        ("Highest Educational Attainment:", 
         "[  ] Doctorate Degree (PhD, DIT)\n[  ] Master's Degree (MSCS, MIT, MSIT, MBA)\n[  ] Completed Academic Requirements (CAR) for Master's\n[  ] Bachelor's Degree (BSCS, BSIT, CoE)"),
        ("Years of Professional / Computing Experience:", 
         "[  ] Less than 3 years        [  ] 3 to 5 years\n[  ] 6 to 10 years             [  ] More than 10 years")
    ]

    for idx, (label, opts) in enumerate(prof_data):
        row = tbl_prof.rows[idx]
        c_lbl = row.cells[0]
        c_lbl.width = Inches(2.6)
        set_cell_background(c_lbl, GRAY_HEADER)
        set_cell_margins(c_lbl, top=60, bottom=60, left=100, right=100)
        p = c_lbl.paragraphs[0]
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(0)
        r = p.add_run(label)
        r.bold = True
        r.font.size = Pt(8.5)
        r.font.color.rgb = DARK_RGB

        c_opt = row.cells[1]
        c_opt.width = Inches(4.4)
        set_cell_background(c_opt, WHITE_HEX)
        set_cell_margins(c_opt, top=60, bottom=60, left=100, right=100)
        p2 = c_opt.paragraphs[0]
        p2.paragraph_format.space_before = Pt(0)
        p2.paragraph_format.space_after = Pt(0)
        p2.paragraph_format.line_spacing = 1.15
        r2 = p2.add_run(opts)
        r2.font.size = Pt(8.5)
        r2.font.color.rgb = DARK_RGB

    # -------------------------------------------------------------
    # 5. PART II: EVALUATION RATING SCALE (Table 8)
    # -------------------------------------------------------------
    p_p2 = doc.add_paragraph()
    p_p2.paragraph_format.space_before = Pt(6)
    p_p2.paragraph_format.space_after = Pt(3)
    r_p2 = p_p2.add_run("PART II: FIVE-POINT LIKERT SCALE (Table 8)")
    r_p2.bold = True
    r_p2.font.size = Pt(10)
    r_p2.font.color.rgb = NAVY_RGB

    tbl_scale = doc.add_table(rows=6, cols=4)
    tbl_scale.alignment = WD_TABLE_ALIGNMENT.CENTER
    tbl_scale.autofit = False
    set_table_borders(tbl_scale, color="CBD5E1", sz="4")

    s_headers = ["Scale", "Mean Range", "Verbal Interpretation", "Evaluation Description"]
    s_widths = [Inches(0.6), Inches(1.1), Inches(2.3), Inches(3.0)]

    for c_idx, h_text in enumerate(s_headers):
        cell = tbl_scale.cell(0, c_idx)
        cell.width = s_widths[c_idx]
        set_cell_background(cell, NAVY_HEX)
        set_cell_margins(cell, top=60, bottom=60, left=80, right=80)
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(0)
        r = p.add_run(h_text)
        r.bold = True
        r.font.size = Pt(8)
        r.font.color.rgb = RGBColor(255, 255, 255)

    s_rows = [
        ("5", "4.21 - 5.00", "Strongly Agree (Very Highly Acceptable)", "Exceeds all quality standards; robust, production-ready implementation."),
        ("4", "3.41 - 4.20", "Agree (Highly Acceptable)", "Meets quality standards satisfactorily; suitable for deployment with minor refinements."),
        ("3", "2.61 - 3.40", "Neutral (Moderately Acceptable)", "Partially meets expectations; needs specific improvements before adoption."),
        ("2", "1.81 - 2.60", "Disagree (Slightly Acceptable)", "Substantial deficiencies present; does not meet standard software criteria."),
        ("1", "1.00 - 1.80", "Strongly Disagree (Not Acceptable)", "Critical operational flaws; entirely unacceptable for institutional deployment.")
    ]

    for r_idx, (sc, rng, vi, desc) in enumerate(s_rows, start=1):
        bg = GRAY_ROW if r_idx % 2 == 1 else WHITE_HEX
        vals = [sc, rng, vi, desc]
        for c_idx, val in enumerate(vals):
            cell = tbl_scale.cell(r_idx, c_idx)
            cell.width = s_widths[c_idx]
            set_cell_background(cell, bg)
            set_cell_margins(cell, top=50, bottom=50, left=80, right=80)
            p = cell.paragraphs[0]
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER if c_idx in [0, 1] else WD_ALIGN_PARAGRAPH.LEFT
            p.paragraph_format.space_before = Pt(0)
            p.paragraph_format.space_after = Pt(0)
            r = p.add_run(val)
            r.font.size = Pt(8)
            r.bold = (c_idx == 0 or c_idx == 2)
            r.font.color.rgb = DARK_RGB

    # -------------------------------------------------------------
    # 6. PART III: SOFTWARE QUALITY EVALUATIVE INDICATORS
    # -------------------------------------------------------------
    p_p3 = doc.add_paragraph()
    p_p3.paragraph_format.space_before = Pt(8)
    p_p3.paragraph_format.space_after = Pt(2)
    r_p3 = p_p3.add_run("PART III: ISO/IEC 25010 SOFTWARE QUALITY EVALUATIVE INDICATORS")
    r_p3.bold = True
    r_p3.font.size = Pt(10)
    r_p3.font.color.rgb = NAVY_RGB

    p_p3_inst = doc.add_paragraph()
    p_p3_inst.paragraph_format.space_before = Pt(0)
    p_p3_inst.paragraph_format.space_after = Pt(4)
    r_inst = p_p3_inst.add_run("Directions: Please mark a check [ ✓ ] under your chosen numerical rating for each software quality indicator statement.")
    r_inst.italic = True
    r_inst.font.size = Pt(8.5)
    r_inst.font.color.rgb = MUTED_RGB

    # NO "AREA" - Standard ISO 25010 Quality Characteristics!
    characteristics_data = [
        {
            "num": "1",
            "name": "FUNCTIONAL SUITABILITY",
            "desc": "The degree to which the software provides functions that meet stated accreditation requirements.",
            "questions": [
                ("Q01", "Functional Completeness", "The system provides complete, end-to-end functionality for accreditation management, including evidence ingestion, criteria mapping, and multi-area status tracking."),
                ("Q02", "Functional Correctness", "The system accurately executes PACUCOA mathematical computations, including the 30-weight general average, area weighted values, and strictly enforces Level I (3.00) and Level II (3.50) area floor constraints."),
                ("Q03", "Functional Appropriateness", "The What-If readiness simulation sandbox enables academic administrators to project score improvements across priority criteria without altering live production records."),
                ("Q04", "Compliance Workflow Support", "The post-visit compliance matrix effectively structures survey recommendations, action plans, team verifications, and documentary exhibits into the required four-column institutional format.")
            ]
        },
        {
            "num": "2",
            "name": "PERFORMANCE EFFICIENCY",
            "desc": "The performance of the system relative to resource utilization under operational workloads.",
            "questions": [
                ("Q05", "Time Behaviour", "The system delivers fast page loading and sub-second transitions when querying accreditation status, navigating between areas, and rendering summary heatmaps."),
                ("Q06", "Document Processing Speed", "The native PDF extraction engine rapidly parses uploaded files, extracts textual metadata, and identifies document dates without noticeable UI freeze."),
                ("Q07", "Resource Utilization", "The web application operates smoothly on institutional desktop workstations and laptops without consuming excessive CPU, system memory, or network bandwidth."),
                ("Q08", "Capacity & Scalability", "The database architecture comfortably accommodates multi-year accreditation cycles, large documentary archives, and expansive criteria provisions without performance degradation.")
            ]
        },
        {
            "num": "3",
            "name": "COMPATIBILITY",
            "desc": "The degree to which the system functions harmoniously with other institutional software and client environments.",
            "questions": [
                ("Q09", "Co-existence", "The web platform runs harmoniously alongside existing university administrative portals, office productivity tools, and browser extensions without resource conflicts."),
                ("Q10", "Cross-Browser Compatibility", "The user interface renders consistently and executes interactive components reliably across major web browsers (Google Chrome, Microsoft Edge, Mozilla Firefox, Safari)."),
                ("Q11", "Multi-Format Interoperability", "The repository supports standard institutional exhibit file formats, including text-layer PDFs, Word documents (.docx), spreadsheets (.xlsx), images, and external video/cloud links."),
                ("Q12", "Data Export & Reporting", "The system provides standardized reporting outputs and compliance matrices that can be reviewed, printed, or exported for accreditation survey team inspection.")
            ]
        },
        {
            "num": "4",
            "name": "USABILITY",
            "desc": "The effectiveness, efficiency, and satisfaction with which institutional users achieve accreditation tasks.",
            "questions": [
                ("Q13", "Appropriateness Recognizability", "The Executive 5x2 Command Dashboard allows users to immediately recognize accreditation progress, area health statuses, and floor deficits at a glance."),
                ("Q14", "Learnability", "The system layout, terminology, and operational workflows are intuitive, allowing faculty members and area chairs to navigate and upload evidence with minimal introductory training."),
                ("Q15", "Operability", "Action buttons, verification queues, criteria filters, and status badges are logically arranged, highly responsive, and easy to operate throughout self-survey tasks."),
                ("Q16", "User Error Protection", "The system incorporates proactive form validation, confirmation modals, and recency warning banners (e.g., flagging documents older than 5 years) to prevent erroneous exhibit submissions.")
            ]
        },
        {
            "num": "5",
            "name": "RELIABILITY",
            "desc": "The ability of the software to maintain a specified level of operational performance over time.",
            "questions": [
                ("Q17", "Maturity & Operational Stability", "The platform operates dependably during extended accreditation preparation sessions without unexpected runtime crashes, blank screens, or unhandled exceptions."),
                ("Q18", "Availability & Uptime", "The cloud-deployed application maintains consistent 24/7 availability, enabling faculty members and administrative personnel to access and manage exhibits on demand."),
                ("Q19", "Fault Tolerance", "The application handles network interruptions, server latency, or malformed document uploads gracefully, presenting user-friendly alerts without terminating user sessions."),
                ("Q20", "Data Consistency & Recovery", "The PostgreSQL relational database preserves referential integrity, ensuring criteria scores, uploaded documents, and compliance entries remain synchronized without data loss.")
            ]
        },
        {
            "num": "6",
            "name": "SECURITY",
            "desc": "The protection of system data, role boundaries, and documentary authenticity against unauthorized actions.",
            "questions": [
                ("Q21", "Confidentiality & Access Control", "Granular Role-Based Access Control (RBAC) and Supabase Row-Level Security (RLS) policies strictly prevent unauthorized users from viewing restricted accreditation records."),
                ("Q22", "Separation of Duties", "The system strictly enforces the programmatic self-verification block, preventing uploaders from verifying, evaluating, or approving documents they personally submitted."),
                ("Q23", "Data Integrity", "Accreditation criteria ratings, Area weighted scores, and compliance matrix records cannot be altered or bypassed without authorized administrative credentials."),
                ("Q24", "Accountability & Audit Logging", "The system automatically captures an immutable timestamped audit log of all document uploads, verification approvals, score updates, and administrative activities.")
            ]
        },
        {
            "num": "7",
            "name": "MAINTAINABILITY",
            "desc": "The ease with which developers can modify, extend, debug, and configure the system architecture.",
            "questions": [
                ("Q25", "Modularity", "The software architecture is cleanly organized into modular Next.js components, server actions, and RESTful API endpoints, allowing isolated modifications and testing."),
                ("Q26", "Reusability", "UI components (such as status badges, data tables, modal dialogs, and summary stat cards) are reused consistently across diverse modules of the application."),
                ("Q27", "Analysability & Diagnostics", "Clear server-side logging, informative console warnings, and standard HTTP response statuses allow technical maintainers to rapidly diagnose and resolve operational issues."),
                ("Q28", "Modifiability & Extensibility", "The flexible database schema permits Quality Assurance administrators to configure new degree programs, update criteria sets, or adjust area weights without altering core code.")
            ]
        },
        {
            "num": "8",
            "name": "PORTABILITY",
            "desc": "The ease with which the software can be transferred across cloud hosts, operating systems, and client devices.",
            "questions": [
                ("Q29", "Responsive Adaptability", "The interface layout dynamically adapts to varying screen resolutions, providing comfortable usability across desktop displays, laptops, and tablet computers."),
                ("Q30", "Cloud Deployment Flexibility", "The web platform can be easily deployed and maintained across modern serverless and containerized cloud providers (e.g., Vercel, Supabase) with zero server-level re-engineering."),
                ("Q31", "Database Portability", "The relational schema uses standard ANSI SQL and PostgreSQL features, permitting seamless backup, migration, and export across heterogeneous database environments."),
                ("Q32", "Client-Side Independence", "The web application runs completely within standard modern web browsers with zero installation of proprietary native software, plugins, or client-side drivers.")
            ]
        }
    ]

    # COLUMN WIDTHS: 
    # Item: 0.50 in, Statement: 4.80 in (EXPANDED FOR COMFORTABLE READING!)
    # Rating cols: 0.34 in each (5 cols = 1.70 in total). Very small and compact, just for checking!
    # Total width: 0.50 + 4.80 + 1.70 = 7.00 inches exactly.
    col_widths = [Inches(0.50), Inches(4.80), Inches(0.34), Inches(0.34), Inches(0.34), Inches(0.34), Inches(0.34)]

    for c in characteristics_data:
        tbl_c = doc.add_table(rows=5, cols=7)
        tbl_c.alignment = WD_TABLE_ALIGNMENT.CENTER
        tbl_c.autofit = False
        set_table_borders(tbl_c, color="CBD5E1", sz="4")

        # Row 0: Characteristic Title Banner
        row_h = tbl_c.rows[0]
        
        # Col 0: Characteristic Number Code
        c_h0 = row_h.cells[0]
        c_h0.width = col_widths[0]
        set_cell_background(c_h0, NAVY_HEX)
        set_cell_margins(c_h0, top=60, bottom=60, left=50, right=50)
        p = c_h0.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(0)
        r = p.add_run(f"#{c['num']}")
        r.bold = True
        r.font.size = Pt(8.5)
        r.font.color.rgb = RGBColor(255, 255, 255)

        # Col 1: Characteristic Name and Definition (NO "AREA"!)
        c_h1 = row_h.cells[1]
        c_h1.width = col_widths[1]
        set_cell_background(c_h1, NAVY_HEX)
        set_cell_margins(c_h1, top=60, bottom=60, left=80, right=80)
        p1 = c_h1.paragraphs[0]
        p1.paragraph_format.space_before = Pt(0)
        p1.paragraph_format.space_after = Pt(0)
        r1 = p1.add_run(f"{c['name']}  ―  ")
        r1.bold = True
        r1.font.size = Pt(8.5)
        r1.font.color.rgb = RGBColor(255, 255, 255)
        r1_desc = p1.add_run(c['desc'])
        r1_desc.italic = True
        r1_desc.font.size = Pt(8)
        r1_desc.font.color.rgb = RGBColor(226, 232, 240)

        # Cols 2 to 6: Compact Stacked Rating Headers
        rating_headers = [
            ("5", "SA"),
            ("4", "A"),
            ("3", "N"),
            ("2", "D"),
            ("1", "SD")
        ]
        for k_idx, (num_lbl, txt_lbl) in enumerate(rating_headers):
            c_rk = row_h.cells[2 + k_idx]
            c_rk.width = col_widths[2 + k_idx]
            set_cell_background(c_rk, NAVY_HEX)
            set_cell_margins(c_rk, top=40, bottom=40, left=20, right=20)
            pk = c_rk.paragraphs[0]
            pk.alignment = WD_ALIGN_PARAGRAPH.CENTER
            pk.paragraph_format.space_before = Pt(0)
            pk.paragraph_format.space_after = Pt(0)
            pk.paragraph_format.line_spacing = 1.0
            
            r_num = pk.add_run(f"{num_lbl}\n")
            r_num.bold = True
            r_num.font.size = Pt(8)
            r_num.font.color.rgb = RGBColor(255, 255, 255)
            
            r_txt = pk.add_run(txt_lbl)
            r_txt.font.size = Pt(7)
            r_txt.font.color.rgb = RGBColor(203, 213, 225)

        # Question Rows (Rows 1 to 4)
        for q_idx, (q_code, sub_char, q_stmt) in enumerate(c["questions"], start=1):
            row_q = tbl_c.rows[q_idx]
            fill_curr = GRAY_ROW if q_idx % 2 == 1 else WHITE_HEX

            # Col 0: Item Code (Q01 to Q32)
            c0 = row_q.cells[0]
            c0.width = col_widths[0]
            set_cell_background(c0, fill_curr)
            set_cell_margins(c0, top=50, bottom=50, left=40, right=40)
            p0 = c0.paragraphs[0]
            p0.alignment = WD_ALIGN_PARAGRAPH.CENTER
            p0.paragraph_format.space_before = Pt(0)
            p0.paragraph_format.space_after = Pt(0)
            r0 = p0.add_run(q_code)
            r0.bold = True
            r0.font.size = Pt(8)
            r0.font.color.rgb = NAVY_RGB

            # Col 1: Sub-characteristic and Evaluative Statement (Wide!)
            c1 = row_q.cells[1]
            c1.width = col_widths[1]
            set_cell_background(c1, fill_curr)
            set_cell_margins(c1, top=50, bottom=50, left=70, right=70)
            p1 = c1.paragraphs[0]
            p1.paragraph_format.space_before = Pt(0)
            p1.paragraph_format.space_after = Pt(0)
            p1.paragraph_format.line_spacing = 1.12
            r_sub = p1.add_run(f"[{sub_char}] ")
            r_sub.bold = True
            r_sub.font.size = Pt(8)
            r_sub.font.color.rgb = DARK_RGB
            r_stmt = p1.add_run(q_stmt)
            r_stmt.font.size = Pt(8)
            r_stmt.font.color.rgb = DARK_RGB

            # Cols 2 to 6: Compact Checkbox Cells
            for k in range(5):
                ck = row_q.cells[2 + k]
                ck.width = col_widths[2 + k]
                set_cell_background(ck, fill_curr)
                set_cell_margins(ck, top=50, bottom=50, left=20, right=20)
                pk = ck.paragraphs[0]
                pk.alignment = WD_ALIGN_PARAGRAPH.CENTER
                pk.paragraph_format.space_before = Pt(0)
                pk.paragraph_format.space_after = Pt(0)
                rk = pk.add_run("[   ]")
                rk.font.size = Pt(7.5)
                rk.font.color.rgb = MUTED_RGB

        p_sp = doc.add_paragraph()
        p_sp.paragraph_format.space_before = Pt(0)
        p_sp.paragraph_format.space_after = Pt(3)

    # -------------------------------------------------------------
    # 7. PART IV: QUALITATIVE FEEDBACK & RECOMMENDATIONS
    # -------------------------------------------------------------
    p_p4 = doc.add_paragraph()
    p_p4.paragraph_format.space_before = Pt(6)
    p_p4.paragraph_format.space_after = Pt(3)
    r_p4 = p_p4.add_run("PART IV: QUALITATIVE FEEDBACK & EXPERT RECOMMENDATIONS")
    r_p4.bold = True
    r_p4.font.size = Pt(10)
    r_p4.font.color.rgb = NAVY_RGB

    feedback_prompts = [
        ("1. System Strengths (What features, workflows, or security controls did you find most effective?):", 3),
        ("2. Areas for Technical Improvement (What enhancements, external integrations, or refinements do you recommend?):", 3),
        ("3. General Evaluative Comments / Observations for Institutional Deployment:", 2)
    ]

    for prompt, lines in feedback_prompts:
        p_pr = doc.add_paragraph()
        p_pr.paragraph_format.space_before = Pt(3)
        p_pr.paragraph_format.space_after = Pt(1)
        r_pr = p_pr.add_run(prompt)
        r_pr.bold = True
        r_pr.font.size = Pt(8.5)
        r_pr.font.color.rgb = DARK_RGB

        for _ in range(lines):
            p_line = doc.add_paragraph()
            p_line.paragraph_format.space_before = Pt(0)
            p_line.paragraph_format.space_after = Pt(1)
            r_l = p_line.add_run("―" * 72)
            r_l.font.color.rgb = RGBColor(203, 213, 225)
            r_l.font.size = Pt(7.5)

    # -------------------------------------------------------------
    # 8. SIGNATURE & VERIFICATION BLOCK
    # -------------------------------------------------------------
    tbl_sig = doc.add_table(rows=2, cols=2)
    tbl_sig.alignment = WD_TABLE_ALIGNMENT.CENTER
    tbl_sig.autofit = False
    set_table_borders(tbl_sig, color="CBD5E1", sz="4")

    cell_s1 = tbl_sig.cell(0, 0)
    cell_s1.width = Inches(3.5)
    set_cell_background(cell_s1, WHITE_HEX)
    set_cell_margins(cell_s1, top=60, bottom=60, left=80, right=80)
    p_s1 = cell_s1.paragraphs[0]
    p_s1.paragraph_format.space_before = Pt(0)
    p_s1.paragraph_format.space_after = Pt(0)
    p_s1.paragraph_format.line_spacing = 1.15
    r_s1 = p_s1.add_run("Evaluator's Printed Name / Signature (Optional):\n\n_________________________________________________")
    r_s1.font.size = Pt(8)
    r_s1.font.color.rgb = DARK_RGB

    cell_s2 = tbl_sig.cell(0, 1)
    cell_s2.width = Inches(3.5)
    set_cell_background(cell_s2, WHITE_HEX)
    set_cell_margins(cell_s2, top=60, bottom=60, left=80, right=80)
    p_s2 = cell_s2.paragraphs[0]
    p_s2.paragraph_format.space_before = Pt(0)
    p_s2.paragraph_format.space_after = Pt(0)
    p_s2.paragraph_format.line_spacing = 1.15
    r_s2 = p_s2.add_run("Date of Evaluation: ________________________\n\nEvaluation Session: [  ] Prototype Testing    [  ] Formal Survey")
    r_s2.font.size = Pt(8)
    r_s2.font.color.rgb = DARK_RGB

    cell_foot = tbl_sig.cell(1, 0)
    cell_foot.merge(tbl_sig.cell(1, 1))
    set_cell_background(cell_foot, GRAY_HEADER)
    set_cell_margins(cell_foot, top=50, bottom=50, left=80, right=80)
    p_foot = cell_foot.paragraphs[0]
    p_foot.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_foot.paragraph_format.space_before = Pt(0)
    p_foot.paragraph_format.space_after = Pt(0)
    r_foot = p_foot.add_run("Thank you for your valuable contribution to the quality assurance and research advancement of STI West Negros University.")
    r_foot.italic = True
    r_foot.font.size = Pt(8)
    r_foot.font.color.rgb = MUTED_RGB

    output_path = "EVALUATION_QUESTIONNAIRE_ISO_25010.docx"
    alt_path = "EVALUATION_QUESTIONNAIRE_ISO_25010_PRINT.docx"
    try:
        doc.save(output_path)
        print(f"Successfully generated: {output_path}")
    except PermissionError:
        doc.save(alt_path)
        print(f"Main file locked by office viewer. Saved updated version to: {alt_path}")

if __name__ == "__main__":
    build_questionnaire_docx()

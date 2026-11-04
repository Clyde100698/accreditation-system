import os
import pptx
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.enum.shapes import MSO_SHAPE

def build_presentation():
    pptx_path = "FINAL ORAL DEFENSE TEMPLATE.pptx"
    prs = Presentation(pptx_path)

    print("--- Editing Oral Defense Presentation ---")

    # Colors
    NAVY = RGBColor(16, 42, 77)       # STI Navy Blue
    GOLD = RGBColor(212, 160, 23)     # STI Gold / Accent
    DARK_GRAY = RGBColor(50, 50, 50)  # Body text
    WHITE = RGBColor(255, 255, 255)
    LIGHT_BG = RGBColor(245, 247, 250)

    def clean_slide_extra_shapes(slide):
        keep_names = {"Title 1", "Content Placeholder 2", "Subtitle 2", "Rectangle 4", "Rectangle 7"}
        to_remove = [s for s in slide.shapes if s.name not in keep_names]
        for s in to_remove:
            slide.shapes._spTree.remove(s._element)

    # Clean any extra shapes from previous runs on all slides
    for slide in prs.slides:
        clean_slide_extra_shapes(slide)

    # 1. Update Header Banner on ALL SLIDES
    for idx, slide in enumerate(prs.slides):
        for shape in slide.shapes:
            if "Rectangle" in shape.name and shape.has_text_frame:
                if "MASTER IN INFORMATION TECHNOLOGY" in shape.text_frame.text or "BACHELOR OF SCIENCE" in shape.text_frame.text:
                    shape.text_frame.text = ""
                    p = shape.text_frame.paragraphs[0]
                    p.alignment = PP_ALIGN.LEFT
                    run = p.add_run()
                    run.text = "BACHELOR OF SCIENCE IN COMPUTER SCIENCE"
                    run.font.name = "Arial"
                    run.font.size = Pt(13)
                    run.font.bold = True
                    run.font.color.rgb = WHITE

    # =========================================================================
    # SLIDE 1: TITLE SLIDE
    # =========================================================================
    s1 = prs.slides[0]
    
    # Title
    t_shape = s1.shapes.title
    t_shape.text_frame.text = ""
    p_t = t_shape.text_frame.paragraphs[0]
    p_t.alignment = PP_ALIGN.CENTER
    r_t = p_t.add_run()
    r_t.text = "WEB-BASED ACCREDITATION MANAGEMENT AND READINESS ASSESSMENT SYSTEM FOR STI WEST NEGROS UNIVERSITY"
    r_t.font.name = "Arial"
    r_t.font.size = Pt(30)
    r_t.font.bold = True
    r_t.font.color.rgb = NAVY

    # Subtitle
    sub_shape = s1.placeholders[1]
    sub_shape.text_frame.text = ""
    
    p1 = sub_shape.text_frame.paragraphs[0]
    p1.alignment = PP_ALIGN.CENTER
    r1 = p1.add_run()
    r1.text = "CLYDE TABURADA\n"
    r1.font.name = "Arial"
    r1.font.size = Pt(22)
    r1.font.bold = True
    r1.font.color.rgb = DARK_GRAY

    p2 = sub_shape.text_frame.add_paragraph()
    p2.alignment = PP_ALIGN.CENTER
    r2 = p2.add_run()
    r2.text = "Candidate for Bachelor of Science in Computer Science\n"
    r2.font.name = "Arial"
    r2.font.size = Pt(16)
    r2.font.bold = False
    r2.font.color.rgb = DARK_GRAY

    p3 = sub_shape.text_frame.add_paragraph()
    p3.alignment = PP_ALIGN.CENTER
    r3 = p3.add_run()
    r3.text = "College of Information and Communications Technology\nSTI West Negros University, Bacolod City"
    r3.font.name = "Arial"
    r3.font.size = Pt(14)
    r3.font.color.rgb = DARK_GRAY

    # =========================================================================
    # SLIDE 2: OBJECTIVES OF THE STUDY
    # =========================================================================
    s2 = prs.slides[1]
    s2.shapes.title.text = "Objectives of the Study"
    s2.shapes.title.text_frame.paragraphs[0].font.name = "Arial"
    s2.shapes.title.text_frame.paragraphs[0].font.size = Pt(28)
    s2.shapes.title.text_frame.paragraphs[0].font.bold = True
    s2.shapes.title.text_frame.paragraphs[0].font.color.rgb = NAVY

    c2 = s2.placeholders[1]
    c2.text_frame.text = ""

    # General Objective
    p_gen_hdr = c2.text_frame.paragraphs[0]
    p_gen_hdr.space_after = Pt(4)
    r = p_gen_hdr.add_run()
    r.text = "General Objective:"
    r.font.name = "Arial"
    r.font.size = Pt(18)
    r.font.bold = True
    r.font.color.rgb = NAVY

    p_gen = c2.text_frame.add_paragraph()
    p_gen.space_after = Pt(14)
    p_gen.level = 0
    r = p_gen.add_run()
    r.text = "To design, develop, and evaluate a Web-Based Accreditation Management and Readiness Assessment System for STI West Negros University, aligned natively with the PACUCOA undergraduate framework."
    r.font.name = "Arial"
    r.font.size = Pt(15)
    r.font.color.rgb = DARK_GRAY

    # Specific Objectives
    p_spec_hdr = c2.text_frame.add_paragraph()
    p_spec_hdr.space_after = Pt(4)
    r = p_spec_hdr.add_run()
    r.text = "Specific Objectives:"
    r.font.name = "Arial"
    r.font.size = Pt(18)
    r.font.bold = True
    r.font.color.rgb = NAVY

    specific_objs = [
        "1. Map and manage exhibits across 10 PACUCOA Areas (instantiated with 79 criteria for BSCS) with server-side text-layer PDF extraction (no OCR).",
        "2. Enforce role-based access control with Independent Verification (self-verification block: uploader != verifier; QA Officer exempt).",
        "3. Automate real-time readiness scoring using the PACUCOA 30-weight formula and dual-constraint floor rules.",
        "4. Develop an Executive 5x2 Command Dashboard providing simultaneous cross-area panoramic visibility.",
        "5. Implement an isolated What-If Readiness Simulation Sandbox to forecast level requirements without mutating live data.",
        "6. Provide a four-column Post-Visit Compliance Matrix for post-survey revisit and reaccreditation preparation.",
        "7. Evaluate system quality under the ISO/IEC 25010 standard with 15 institutional respondents."
    ]

    for item in specific_objs:
        p = c2.text_frame.add_paragraph()
        p.space_after = Pt(3)
        p.level = 0
        r = p.add_run()
        r.text = item
        r.font.name = "Arial"
        r.font.size = Pt(13)
        r.font.color.rgb = DARK_GRAY

    # =========================================================================
    # SLIDE 3: SYSTEM DESIGN - SDLC METHODOLOGY
    # =========================================================================
    s3 = prs.slides[2]
    s3.shapes.title.text = "System Design - SDLC Methodology"
    s3.shapes.title.text_frame.paragraphs[0].font.name = "Arial"
    s3.shapes.title.text_frame.paragraphs[0].font.size = Pt(28)
    s3.shapes.title.text_frame.paragraphs[0].font.bold = True
    s3.shapes.title.text_frame.paragraphs[0].font.color.rgb = NAVY

    c3 = s3.placeholders[1]
    c3.text_frame.text = ""

    p_sdlc_hdr = c3.text_frame.paragraphs[0]
    p_sdlc_hdr.space_after = Pt(8)
    r = p_sdlc_hdr.add_run()
    r.text = "Agile Scrum Methodology (Four Iterations, August to October 2026):"
    r.font.name = "Arial"
    r.font.size = Pt(17)
    r.font.bold = True
    r.font.color.rgb = NAVY

    sprints = [
        ("Iteration 1: Core Architecture & Schema", 
         "- Requirements analysis with QA Office and CICT Dean; relational schema design in Supabase PostgreSQL; user authentication and Row-Level Security (RLS) setup."),
        ("Iteration 2: Evidence Mapping & Review Gate", 
         "- Evidence Library module with PDF text-layer extraction and tagging; independent verification queue; database-level self-verification block (Row-Level Security)."),
        ("Iteration 3: Scoring Engine & Decision Sandbox", 
         "- PACUCOA 30-weight scoring engine; Executive 5x2 Command Dashboard; What-If Readiness Simulation Sandbox with in-memory execution isolation."),
        ("Iteration 4: Compliance Matrix & Testing", 
         "- Four-column Post-Visit Compliance Matrix; audit logging; end-to-end testing with BSCS exhibits; ISO/IEC 25010 evaluation with 15 respondents.")
    ]

    for title, desc in sprints:
        p_t = c3.text_frame.add_paragraph()
        p_t.space_before = Pt(4)
        p_t.space_after = Pt(1)
        r_t = p_t.add_run()
        r_t.text = title
        r_t.font.name = "Arial"
        r_t.font.size = Pt(14)
        r_t.font.bold = True
        r_t.font.color.rgb = NAVY

        p_d = c3.text_frame.add_paragraph()
        p_d.space_after = Pt(4)
        r_d = p_d.add_run()
        r_d.text = desc
        r_d.font.name = "Arial"
        r_d.font.size = Pt(12)
        r_d.font.color.rgb = DARK_GRAY

    # =========================================================================
    # SLIDE 4: SYSTEM DESIGN - SYSTEM ARCHITECTURE
    # =========================================================================
    s4 = prs.slides[3]
    s4.shapes.title.text = "System Design - System Architecture"
    s4.shapes.title.text_frame.paragraphs[0].font.name = "Arial"
    s4.shapes.title.text_frame.paragraphs[0].font.size = Pt(28)
    s4.shapes.title.text_frame.paragraphs[0].font.bold = True
    s4.shapes.title.text_frame.paragraphs[0].font.color.rgb = NAVY

    c4 = s4.placeholders[1]
    c4.text_frame.text = ""

    # Check if figure 2 exists, insert it
    fig2_path = os.path.join("figures", "figure2_system_architecture.png")
    if os.path.exists(fig2_path):
        # Resize text box to left half, add picture on right half
        c4.width = Inches(5.8)
        c4.left = Inches(0.4)
        
        p = c4.text_frame.paragraphs[0]
        r = p.add_run()
        r.text = "Three-Tier Cloud Architecture:"
        r.font.name = "Arial"
        r.font.size = Pt(16)
        r.font.bold = True
        r.font.color.rgb = NAVY

        arch_items = [
            ("1. Presentation Layer (Frontend):", "Next.js 14, React 18, TypeScript, Tailwind CSS. Delivers the Executive 5x2 Command Dashboard, interactive simulation sandbox, and responsive UI."),
            ("2. Application Layer (Backend Logic):", "Next.js Server Components, Server Actions, Route Handlers. Coordinates PDF text-layer extraction, automated PACUCOA scoring, and role guards."),
            ("3. Data & Storage Layer (Cloud Database):", "Supabase PostgreSQL 15 with Row-Level Security (RLS) policies, Private Storage Buckets with time-limited signed URLs, and audit logging.")
        ]
        for t, d in arch_items:
            p_i = c4.text_frame.add_paragraph()
            p_i.space_before = Pt(6)
            r = p_i.add_run()
            r.text = t + " "
            r.font.name = "Arial"
            r.font.size = Pt(13)
            r.font.bold = True
            r.font.color.rgb = NAVY

            r2 = p_i.add_run()
            r2.text = d
            r2.font.name = "Arial"
            r2.font.size = Pt(12)
            r2.font.color.rgb = DARK_GRAY

        # Add image on right
        s4.shapes.add_picture(fig2_path, Inches(6.5), Inches(1.5), width=Inches(6.4))
    else:
        # Full text
        p = c4.text_frame.paragraphs[0]
        r = p.add_run()
        r.text = "Three-Tier Modern Cloud Architecture Overview:"
        r.font.name = "Arial"
        r.font.size = Pt(18)
        r.font.bold = True

    # =========================================================================
    # SLIDE 5: HARDWARE AND SOFTWARE SPECIFICATIONS
    # =========================================================================
    s5 = prs.slides[4]
    s5.shapes.title.text = "System Design - Technical Specifications"
    s5.shapes.title.text_frame.paragraphs[0].font.name = "Arial"
    s5.shapes.title.text_frame.paragraphs[0].font.size = Pt(28)
    s5.shapes.title.text_frame.paragraphs[0].font.bold = True
    s5.shapes.title.text_frame.paragraphs[0].font.color.rgb = NAVY

    c5 = s5.placeholders[1]
    # Remove text placeholder or empty it, add a styled table
    c5.text_frame.text = ""
    c5.width = Inches(0.1) # collapse placeholder

    # Create Table on Slide 5
    rows = 6
    cols = 3
    left = Inches(0.5)
    top = Inches(1.5)
    width = Inches(12.33)
    height = Inches(4.5)

    tbl_shape = s5.shapes.add_table(rows, cols, left, top, width, height)
    tbl = tbl_shape.table
    tbl.columns[0].width = Inches(2.5)
    tbl.columns[1].width = Inches(3.8)
    tbl.columns[2].width = Inches(6.03)

    specs_data = [
        ["System Domain", "Technology / Specification", "Functional Role in Platform"],
        ["Frontend Framework", "Next.js 14, React 18, TypeScript, Tailwind CSS", "High-performance, type-safe, responsive user interface with Executive 5x2 dashboard."],
        ["Database & Security", "Supabase Cloud, PostgreSQL 15, Row-Level Security (RLS)", "Relational database, enforced self-verification block, role-based access."],
        ["Document Parsing & Storage", "Server-side PDF text-layer extraction (text PDFs only; no OCR), Supabase private Storage", "Document-type suggestion and keyword matching, time-limited signed exhibit links."],
        ["Deployment & Hosting", "[To be confirmed: deployment host]", "Web deployment of the Next.js application connected to the Supabase backend."],
        ["Client Requirements", "Modern Browser (Chrome, Edge, Firefox), 4GB RAM, Dual-Core", "Cross-platform compatibility across desktop workstations, laptops, and mobile tablets."]
    ]

    for r_idx, row in enumerate(specs_data):
        for c_idx, val in enumerate(row):
            cell = tbl.cell(r_idx, c_idx)
            cell.text = val
            p = cell.text_frame.paragraphs[0]
            p.font.name = "Arial"
            if r_idx == 0:
                p.font.bold = True
                p.font.size = Pt(13)
                p.font.color.rgb = WHITE
                cell.fill.solid()
                cell.fill.fore_color.rgb = NAVY
            else:
                p.font.size = Pt(11)
                p.font.color.rgb = DARK_GRAY
                cell.fill.solid()
                cell.fill.fore_color.rgb = LIGHT_BG if r_idx % 2 == 0 else WHITE

    # =========================================================================
    # SLIDE 6: RESULTS - PACUCOA SCORING & SIMULATION
    # =========================================================================
    s6 = prs.slides[5]
    s6.shapes.title.text = "Results - PACUCOA Baseline Assessment (BSCS)"
    s6.shapes.title.text_frame.paragraphs[0].font.name = "Arial"
    s6.shapes.title.text_frame.paragraphs[0].font.size = Pt(26)
    s6.shapes.title.text_frame.paragraphs[0].font.bold = True
    s6.shapes.title.text_frame.paragraphs[0].font.color.rgb = NAVY

    c6 = s6.placeholders[1]
    c6.text_frame.text = ""
    c6.width = Inches(0.1)

    # Baseline table (live-system Area means; weights per Table 1)
    rows_6 = 12
    cols_6 = 4
    tbl6_shape = s6.shapes.add_table(rows_6, cols_6, Inches(0.8), Inches(1.4), Inches(11.7), Inches(4.4))
    tbl6 = tbl6_shape.table
    tbl6.columns[0].width = Inches(6.0)
    tbl6.columns[1].width = Inches(1.4)
    tbl6.columns[2].width = Inches(2.1)
    tbl6.columns[3].width = Inches(2.2)

    data_6 = [
        ["PACUCOA Evaluative Area", "Weight", "Baseline Mean", "Baseline Weighted"],
        ["Area I: Philosophy and Objectives", "3", "3.00", "9.00"],
        ["Area II: Faculty", "3", "3.74", "11.22"],
        ["Area III: Instruction", "4", "3.00", "12.00"],
        ["Area IV: Laboratory", "3", "2.67 [below 3.00]", "8.01"],
        ["Area V: Research", "3", "2.82 [below 3.00]", "8.46"],
        ["Area VI: Library", "3", "3.45", "10.35"],
        ["Area VII: Student Services", "3", "1.30 [below 3.00]", "3.90"],
        ["Area VIII: Social Orientation and Community Involvement", "3", "4.38", "13.14"],
        ["Area IX: Physical Plant and Facilities", "2", "5.00", "10.00"],
        ["Area X: Organization and Administration", "3", "3.50", "10.50"],
        ["TOTAL WEIGHTED VALUE / OVERALL RATING", "30", "3.22", "96.58 / 30"]
    ]

    for r_idx, row in enumerate(data_6):
        for c_idx, val in enumerate(row):
            cell = tbl6.cell(r_idx, c_idx)
            cell.text = val
            p = cell.text_frame.paragraphs[0]
            p.font.name = "Arial"
            if r_idx == 0:
                p.font.bold = True
                p.font.size = Pt(12)
                p.font.color.rgb = WHITE
                cell.fill.solid()
                cell.fill.fore_color.rgb = NAVY
            elif r_idx == 11:
                p.font.bold = True
                p.font.size = Pt(12)
                p.font.color.rgb = NAVY
                cell.fill.solid()
                cell.fill.fore_color.rgb = RGBColor(254, 243, 199)  # Gold tint
            else:
                p.font.size = Pt(11)
                p.font.color.rgb = DARK_GRAY
                cell.fill.solid()
                cell.fill.fore_color.rgb = LIGHT_BG if r_idx % 2 == 0 else WHITE

    # Callout note below table
    tx_box = s6.shapes.add_textbox(Inches(0.8), Inches(5.95), Inches(11.7), Inches(1.2))
    tf = tx_box.text_frame
    tf.word_wrap = True
    p_note = tf.paragraphs[0]
    r_n = p_note.add_run()
    r_n.text = ("Key Finding: The system baseline of 3.22 meets the Candidate threshold (>= 3.00). Areas IV, V and VII "
                "fall below the 3.00 floor in the evidence loaded at the time of the run. This is an indicative readiness "
                "rating, not the official result: the BSCS program was officially granted PACUCOA Level I accredited status in September 2026. "
                "What-if simulation targeting 10 priority criteria across Areas IV, V, and VII projected an overall rating of 3.57, "
                "clearing the Level I floor rule and satisfying Level II readiness.")
    r_n.font.name = "Arial"
    r_n.font.size = Pt(11.5)
    r_n.font.bold = True
    r_n.font.color.rgb = NAVY

    # =========================================================================
    # SLIDE 7: RESULTS - ISO/IEC 25010 EVALUATION
    # =========================================================================
    s7 = prs.slides[6]
    s7.shapes.title.text = "Results - ISO/IEC 25010 Software Quality Evaluation"
    s7.shapes.title.text_frame.paragraphs[0].font.name = "Arial"
    s7.shapes.title.text_frame.paragraphs[0].font.size = Pt(26)
    s7.shapes.title.text_frame.paragraphs[0].font.bold = True
    s7.shapes.title.text_frame.paragraphs[0].font.color.rgb = NAVY

    c7 = s7.placeholders[1]
    c7.text_frame.text = ""
    c7.width = Inches(0.1)

    # Add Table of ISO/IEC 25010 Results (N = 15)
    rows_7 = 10
    cols_7 = 3
    tbl7_shape = s7.shapes.add_table(rows_7, cols_7, Inches(0.5), Inches(1.4), Inches(12.33), Inches(4.5))
    tbl7 = tbl7_shape.table
    tbl7.columns[0].width = Inches(4.5)
    tbl7.columns[1].width = Inches(2.2)
    tbl7.columns[2].width = Inches(5.63)

    data_7 = [
        ["ISO/IEC 25010 Quality Characteristic", "Weighted Mean (WM)", "Verbal Interpretation (5-Point Likert)"],
        ["1. Functional Suitability", "4.84", "Strongly Agree / Very Highly Acceptable"],
        ["2. Performance Efficiency", "4.78", "Strongly Agree / Very Highly Acceptable"],
        ["3. Compatibility", "4.80", "Strongly Agree / Very Highly Acceptable"],
        ["4. Usability", "4.87", "Strongly Agree / Very Highly Acceptable"],
        ["5. Reliability", "4.82", "Strongly Agree / Very Highly Acceptable"],
        ["6. Security (Highest Rated)", "4.89", "Strongly Agree / Very Highly Acceptable"],
        ["7. Maintainability", "4.77", "Strongly Agree / Very Highly Acceptable"],
        ["8. Portability", "4.85", "Strongly Agree / Very Highly Acceptable"],
        ["OVERALL COMPOSITE GRAND MEAN", "4.83", "Strongly Agree / Very Highly Acceptable"]
    ]

    for r_idx, row in enumerate(data_7):
        for c_idx, val in enumerate(row):
            cell = tbl7.cell(r_idx, c_idx)
            cell.text = val
            p = cell.text_frame.paragraphs[0]
            p.font.name = "Arial"
            if r_idx == 0:
                p.font.bold = True
                p.font.size = Pt(12)
                p.font.color.rgb = WHITE
                cell.fill.solid()
                cell.fill.fore_color.rgb = NAVY
            elif r_idx == 9:
                p.font.bold = True
                p.font.size = Pt(13)
                p.font.color.rgb = NAVY
                cell.fill.solid()
                cell.fill.fore_color.rgb = RGBColor(254, 243, 199)
            else:
                p.font.size = Pt(11)
                p.font.color.rgb = DARK_GRAY
                cell.fill.solid()
                cell.fill.fore_color.rgb = LIGHT_BG if r_idx % 2 == 0 else WHITE

    # Callout note below table
    tx_box7 = s7.shapes.add_textbox(Inches(0.5), Inches(6.05), Inches(12.33), Inches(0.9))
    tf7 = tx_box7.text_frame
    tf7.word_wrap = True
    p_note7 = tf7.paragraphs[0]
    r_n7 = p_note7.add_run()
    r_n7.text = "Evaluated by N = 15 Purposive Respondents: 1 Quality Assurance Officer, 1 CICT Dean, 2 Program Heads (BSCS & BSIT), and 11 Faculty Area Chairs and Committee Members. Security achieved the highest individual rating (4.89) due to the database-level self-verification block and RLS policies."
    r_n7.font.name = "Arial"
    r_n7.font.size = Pt(11.5)
    r_n7.font.bold = True
    r_n7.font.color.rgb = NAVY

    # =========================================================================
    # SLIDE 8: CONCLUSIONS
    # =========================================================================
    s8 = prs.slides[7]
    s8.shapes.title.text = "Conclusions"
    s8.shapes.title.text_frame.paragraphs[0].font.name = "Arial"
    s8.shapes.title.text_frame.paragraphs[0].font.size = Pt(28)
    s8.shapes.title.text_frame.paragraphs[0].font.bold = True
    s8.shapes.title.text_frame.paragraphs[0].font.color.rgb = NAVY

    c8 = s8.placeholders[1]
    c8.text_frame.text = ""

    conclusions = [
        "1. Solves Accreditation Chaos: Successfully transitions STI West Negros University from episodic, binder-heavy compilation to continuous, cloud-based quality assurance.",
        "2. Eliminates Arithmetic Errors: Automating the PACUCOA 30-weight formula and dual-constraint floor rules reduces manual calculation errors and exposes Areas below the floor (Areas IV, V and VII in the BSCS baseline).",
        "3. Supports Separation of Duties: A database-level self-verification block (uploader != verifier; QA Officer exempt) supports independent review of exhibits.",
        "4. Strategic Resource Allocation: What-If simulation on ten priority criteria across deficit areas projects a rating increase from 3.22 to 3.57, eliminating all Area floor deficits and qualifying for Level II readiness.",
        "5. High Acceptability: An overall composite grand mean of 4.83 / 5.00 across 15 institutional respondents (Strongly Agree / Very Highly Acceptable) on ISO/IEC 25010."
    ]

    for idx, c in enumerate(conclusions):
        p = c8.text_frame.paragraphs[0] if idx == 0 else c8.text_frame.add_paragraph()
        p.space_after = Pt(10)
        r = p.add_run()
        r.text = c
        r.font.name = "Arial"
        r.font.size = Pt(14)
        r.font.color.rgb = DARK_GRAY

    # =========================================================================
    # SLIDE 9: RECOMMENDATIONS
    # =========================================================================
    s9 = prs.slides[8]
    s9.shapes.title.text = "Recommendations"
    s9.shapes.title.text_frame.paragraphs[0].font.name = "Arial"
    s9.shapes.title.text_frame.paragraphs[0].font.size = Pt(28)
    s9.shapes.title.text_frame.paragraphs[0].font.bold = True
    s9.shapes.title.text_frame.paragraphs[0].font.color.rgb = NAVY

    c9 = s9.placeholders[1]
    c9.text_frame.text = ""

    recommendations = [
        "1. Full Institutional Rollout: Fully deploy and operationalize the platform across all degree programs within CICT, followed by progressive university-wide adoption across other colleges.",
        "2. Continuous Exhibit Policy: Mandate an end-of-semester digital exhibit submission workflow for faculty to maintain real-time, continuous readiness ahead of official PACUCOA surveys.",
        "3. Enterprise System Integration: Establish secure API connections with STI WNU's enterprise Student Information System (SIS), LMS, and HRIS to automate course syllabus and credentials ingestion.",
        "4. AI/ML Document Intelligence: Add OCR support for scanned documents and NLP classifiers to detect document semantics and match exhibits with PACUCOA criteria.",
        "5. Multi-Accreditor Framework Support: Extend the configurable scoring architecture to accommodate PAASCU, ALCUCOA, AACCUP, and ASEAN University Network-Quality Assurance (AUN-QA)."
    ]

    for idx, rec in enumerate(recommendations):
        p = c9.text_frame.paragraphs[0] if idx == 0 else c9.text_frame.add_paragraph()
        p.space_after = Pt(10)
        r = p.add_run()
        r.text = rec
        r.font.name = "Arial"
        r.font.size = Pt(14)
        r.font.color.rgb = DARK_GRAY

    # =========================================================================
    # SLIDE 10: REFERENCES
    # =========================================================================
    s10 = prs.slides[9]
    s10.shapes.title.text = "References"
    s10.shapes.title.text_frame.paragraphs[0].font.name = "Arial"
    s10.shapes.title.text_frame.paragraphs[0].font.size = Pt(28)
    s10.shapes.title.text_frame.paragraphs[0].font.bold = True
    s10.shapes.title.text_frame.paragraphs[0].font.color.rgb = NAVY

    c10 = s10.placeholders[1]
    c10.text_frame.text = ""

    refs = [
        "1. International Organization for Standardization & IEC. (2011). Systems and software engineering -- Systems and software Quality Requirements and Evaluation (SQuaRE) -- System and software quality models (ISO/IEC 25010:2011).",
        "2. Philippine Association of Colleges and Universities Commission on Accreditation. (2023). Manual of accreditation (Revised September 2023). PACUCOA.",
        "3. Republic Act No. 10173. (2012). Data Privacy Act of 2012. Official Gazette of the Republic of the Philippines.",
        "4. Sandhu, R. S., Coyne, E. J., Feinstein, H. L., & Youman, C. E. (1996). Role-based access control models. IEEE Computer, 29(2), 38-47.",
        "5. Pressman, R. S., & Maxim, B. R. (2020). Software engineering: A practitioner's approach (9th ed.). McGraw-Hill Education."
    ]

    for idx, rf in enumerate(refs):
        p = c10.text_frame.paragraphs[0] if idx == 0 else c10.text_frame.add_paragraph()
        p.space_after = Pt(10)
        r = p.add_run()
        r.text = rf
        r.font.name = "Arial"
        r.font.size = Pt(13)
        r.font.color.rgb = DARK_GRAY

    # Save to both target locations
    prs.save("FINAL ORAL DEFENSE TEMPLATE.pptx")
    print("[SUCCESS] Updated FINAL ORAL DEFENSE TEMPLATE.pptx directly.")

    prs.save("FINAL_ORAL_DEFENSE_PRESENTATION.pptx")
    print("[SUCCESS] Saved copy to FINAL_ORAL_DEFENSE_PRESENTATION.pptx.")

if __name__ == "__main__":
    build_presentation()

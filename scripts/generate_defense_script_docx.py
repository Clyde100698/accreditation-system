import docx
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement
from docx.oxml.ns import qn


def set_cell_background(cell, hex_color):
    tcPr = cell._element.get_or_add_tcPr()
    shd = OxmlElement('w:shd')
    shd.set(qn('w:val'), 'clear')
    shd.set(qn('w:color'), 'auto')
    shd.set(qn('w:fill'), hex_color)
    tcPr.append(shd)


def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    tcPr = cell._element.get_or_add_tcPr()
    tcMar = OxmlElement('w:tcMar')
    for m, val in [('top', top), ('bottom', bottom), ('left', left), ('right', right)]:
        node = OxmlElement(f'w:{m}')
        node.set(qn('w:w'), str(val))
        node.set(qn('w:type'), 'dxa')
        tcMar.append(node)
    tcPr.append(tcMar)


def build_docx_script():
    doc = Document()

    # Page Margins (1 inch all around)
    for section in doc.sections:
        section.top_margin = Inches(1.0)
        section.bottom_margin = Inches(1.0)
        section.left_margin = Inches(1.0)
        section.right_margin = Inches(1.0)

    # Styles
    NAVY = RGBColor(16, 42, 77)
    GOLD = RGBColor(212, 160, 23)
    DARK_GRAY = RGBColor(50, 50, 50)
    SLATE = RGBColor(71, 85, 105)

    # Document Header / Title
    p_inst = doc.add_paragraph()
    p_inst.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_inst = p_inst.add_run("STI WEST NEGROS UNIVERSITY\nCOLLEGE OF INFORMATION AND COMMUNICATIONS TECHNOLOGY\nMASTER IN INFORMATION TECHNOLOGY")
    r_inst.font.name = "Arial"
    r_inst.font.size = Pt(11)
    r_inst.font.bold = True
    r_inst.font.color.rgb = SLATE

    p_doc_title = doc.add_paragraph()
    p_doc_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_doc_title.paragraph_format.space_before = Pt(8)
    p_doc_title.paragraph_format.space_after = Pt(2)
    r_title = p_doc_title.add_run("FINAL ORAL DEFENSE PRESENTATION SCRIPT")
    r_title.font.name = "Arial"
    r_title.font.size = Pt(20)
    r_title.font.bold = True
    r_title.font.color.rgb = NAVY

    p_sub = doc.add_paragraph()
    p_sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_sub.paragraph_format.space_after = Pt(18)
    r_sub = p_sub.add_run("Slide-by-Slide Spoken Script for 10-Slide Template Presentation\nPresenter: Engr. Clyde Taburada (MIT Candidate)")
    r_sub.font.name = "Arial"
    r_sub.font.size = Pt(12)
    r_sub.font.bold = True
    r_sub.font.color.rgb = GOLD

    # Overview Box
    tbl_ov = doc.add_table(rows=1, cols=1)
    tbl_ov.alignment = WD_TABLE_ALIGNMENT.CENTER
    cell_ov = tbl_ov.cell(0, 0)
    set_cell_background(cell_ov, "F1F5F9")
    set_cell_margins(cell_ov, top=140, bottom=140, left=180, right=180)
    p_ov = cell_ov.paragraphs[0]
    p_ov.paragraph_format.space_after = Pt(4)
    r_ov_h = p_ov.add_run("QUICK PRESENTATION GUIDELINES & PACING:\n")
    r_ov_h.font.name = "Arial"
    r_ov_h.font.size = Pt(11)
    r_ov_h.font.bold = True
    r_ov_h.font.color.rgb = NAVY

    r_ov_b = p_ov.add_run(
        "• Total Slides: 10 Slides (strictly follows official MIT template)\n"
        "• Target Speaking Time: 8 to 10 Minutes (~45-60 seconds per slide)\n"
        "• Tone: Confident, academic, conversational, and direct\n"
        "• Strategy: Speak in first person ('I', 'we'), point clearly to diagrams and tables, and pause briefly before advancing."
    )
    r_ov_b.font.name = "Arial"
    r_ov_b.font.size = Pt(10)
    r_ov_b.font.color.rgb = DARK_GRAY

    doc.add_paragraph().paragraph_format.space_after = Pt(12)

    # 10 SLIDES DATA
    slides = [
        {
            "num": 1,
            "title": "CAPSTONE TITLE SLIDE",
            "time": "45 seconds",
            "visual": "Title, Presenter Name (Engr. Clyde Taburada), Degree (MIT Candidate), CICT STI WNU",
            "script": (
                "\"Good morning / afternoon, honorable members of the panel, our research adviser, and colleagues. "
                "I am Engr. Clyde Taburada, candidate for Master in Information Technology from the College of Information "
                "and Communications Technology at STI West Negros University.\n\n"
                "Today, I am privileged to present my capstone project entitled: 'Web-Based Accreditation Management "
                "and Readiness Assessment System for STI West Negros University.'\n\n"
                "This platform is designed to modernize how our university prepares for PACUCOA accreditation—transitioning "
                "our academic departments from fragmented, physical paper binders into an automated, highly secure, and "
                "defensible digital evaluation ecosystem. Let us now examine the core objectives of this study.\""
            ),
            "tip": "Greet the panel warmly with eye contact. State the project title clearly and confidently without rushing.",
            "qa": "Why this title? Because it covers both evidence management (workflow/storage) and readiness assessment (predictive scoring & simulation)."
        },
        {
            "num": 2,
            "title": "GENERAL OBJECTIVES & SPECIFIC OBJECTIVES",
            "time": "60 seconds",
            "visual": "General Objective Statement + 6 Specific Objectives List",
            "script": (
                "\"The General Objective of this study is to design, develop, and evaluate a web-based platform that "
                "centralizes evidence mapping, automates PACUCOA-compliant readiness scoring, provides what-if simulation, "
                "and tracks post-visit compliance for STI West Negros University.\n\n"
                "To achieve this, six Specific Objectives guided the research:\n"
                "1. First, build an Evidence Management module to centralize exhibit mapping and validate file formats, effective dates, and required document counts.\n"
                "2. Second, implement an automated Readiness Scoring Engine computing ratings using the PACUCOA 30-weight formula and dual-constraint floor rules.\n"
                "3. Third, provide an isolated What-If Simulation Sandbox to forecast accreditation readiness without altering live production data.\n"
                "4. Fourth, incorporate a Post-Visit Compliance Tracking module recording recommendations, remediation action plans, and verification exhibits.\n"
                "5. Fifth, enforce role-based access control and strict separation of duties through a database-level self-verification block.\n"
                "6. And sixth, evaluate software quality against ISO/IEC 25010 standards across eight software quality characteristics with 20 purposive respondents.\""
            ),
            "tip": "Number each specific objective with your fingers or slide pointer to convey structured methodology.",
            "qa": "What is the self-verification block? It prevents uploaders from approving their own exhibits, guaranteeing audit defensibility."
        },
        {
            "num": 3,
            "title": "SYSTEM DESIGN: SDLC MODEL FIGURE",
            "time": "50 seconds",
            "visual": "Figure 2: Agile Scrum Framework with 4 Iterative Sprints",
            "script": (
                "\"Moving to System Design, Figure 2 illustrates the Software Development Life Cycle adopted for this project: "
                "the Agile Scrum Framework, executed across four iterative sprints:\n\n"
                "• In Sprint 1, we established the foundational architecture, relational PostgreSQL database schema, and role-based authentication.\n"
                "• In Sprint 2, we engineered the Evidence Upload Pipeline with server-side PDF validation and the mandatory document inspection gate.\n"
                "• In Sprint 3, we implemented the automated PACUCOA 30-weight scoring engine, dual floor rules, and the What-If Simulation Sandbox.\n"
                "• In Sprint 4, we finalized Post-Visit Compliance tracking, conducted end-to-end security hardening, and completed the ISO/IEC 25010 evaluation.\n\n"
                "This iterative model allowed us to continuously refine the platform based on direct feedback from university accreditors and faculty chairs after every sprint.\""
            ),
            "tip": "Point to the 4 sprint cycles in Figure 2. Emphasize that stakeholder feedback drove every iteration.",
            "qa": "Why Agile Scrum over Waterfall? Accreditation guidelines and workflows evolve; Agile accommodated continuous stakeholder review."
        },
        {
            "num": 4,
            "title": "SYSTEM DESIGN: SYSTEM ARCHITECTURE",
            "time": "50 seconds",
            "visual": "Figure 3: Three-Tier System Architecture (Client Presentation, Cloud Backend, Database & Storage)",
            "script": (
                "\"Figure 3 presents the System Architecture of the platform, structured into three coordinated tiers:\n\n"
                "• At the Client Presentation Tier, users interact with responsive web dashboards built using Next.js 14, React 18, and Tailwind CSS. The interface runs seamlessly on any modern web browser without requiring local software installation.\n"
                "• At the Application and Backend Tier, Next.js Server Actions and API Route Handlers execute scoring computations, enforce business logic, and communicate securely with our cloud services.\n"
                "• At the Database and Storage Tier, Supabase PostgreSQL 15 manages relational criteria trees, user roles, and audit trails protected by Row-Level Security, while private cloud buckets store exhibits accessible only via time-limited signed URLs.\n\n"
                "This cloud-native architecture guarantees high availability, zero installation friction, and enterprise-grade data protection.\""
            ),
            "tip": "Trace the flow from top (user browser) through middle (Next.js server actions) down to bottom (PostgreSQL & Storage).",
            "qa": "How are files protected? Private storage buckets with signed URLs that expire, preventing unauthorized public URL sharing."
        },
        {
            "num": 5,
            "title": "SYSTEM DESIGN: HARDWARE AND SOFTWARE COMPONENTS",
            "time": "45 seconds",
            "visual": "Table of Hardware and Software Components (Presentation, Backend, Storage, Security, Specs)",
            "script": (
                "\"Slide 5 summarizes the technical specifications supporting the system:\n\n"
                "• On the frontend, Next.js 14 with TypeScript ensures type safety, rapid rendering, and modular component reusability.\n"
                "• On the backend, Supabase BaaS and PostgreSQL 15 deliver relational integrity, automated indexing, and robust transaction management.\n"
                "• For document processing, server-side text-layer extraction analyzes uploaded PDF exhibits to auto-detect effective dates and category matches without heavy OCR overhead.\n"
                "• For security, Supabase Auth utilizes JWT bearer tokens to enforce role-based access across QA Officers, Deans, Program Heads, and Area Chairs.\n"
                "• In terms of hardware, the system is lightweight—running in the cloud on a 4 GB RAM server, while client end-users need only a standard dual-core device with 4 GB RAM and a modern web browser.\""
            ),
            "tip": "Highlight that zero client-side installation is needed; any faculty member can access it instantly via browser.",
            "qa": "Does it require OCR? It uses server-side text-layer extraction for digital PDFs, which is faster and consumes fewer resources than OCR."
        },
        {
            "num": 6,
            "title": "RESULTS: TABLE OF THE RESULTS OF EXPERTS' EVALUATION",
            "time": "60 seconds",
            "visual": "Table of Experts' Evaluation (ISO/IEC 25010, n = 5 IT Industry Experts)",
            "script": (
                "\"Now, let us examine the Results. The system underwent rigorous evaluation using the ISO/IEC 25010 Software Quality Standard.\n\n"
                "Slide 6 displays the evaluation results from our cohort of five external IT industry experts:\n\n"
                "• Security achieved the highest rating at 4.90, reflecting the strength of our PostgreSQL Row-Level Security policies, JWT authentication, and self-verification isolation.\n"
                "• Maintainability followed closely at 4.60, while Performance Efficiency and Portability both scored 4.50.\n"
                "• Functional Suitability and Compatibility were rated at 4.10, and Usability at 4.30.\n\n"
                "Overall, the IT expert cohort produced a Grand Mean of 4.40, which falls under the verbal interpretation of 'Very Highly Acceptable.' "
                "This technical evaluation confirms that the system's engineering, modular code structure, and data security satisfy international software standards.\""
            ),
            "tip": "Point to the Security score (4.90) and Grand Mean (4.40). Emphasize that external IT professionals vetted the platform.",
            "qa": "Who were the 5 experts? Experienced software engineers, cloud architects, and senior IT professionals from the industry."
        },
        {
            "num": 7,
            "title": "RESULTS: TABLE OF THE RESULTS OF USER ACCEPTANCE",
            "time": "60 seconds",
            "visual": "Table of User Acceptance (ISO/IEC 25010, n = 15 Institutional Users, Combined N = 20)",
            "script": (
                "\"Slide 7 presents the results of User Acceptance from our fifteen institutional end-users, comprising the QA Officer, CICT Dean, two Program Heads, and eleven Area Faculty Chairs:\n\n"
                "• The institutional users gave an exceptional Grand Mean of 4.83 across all quality characteristics.\n"
                "• Security was rated at 4.89, and Usability was rated at 4.87, demonstrating that accreditors and faculty found the workflow clear, intuitive, and responsive.\n"
                "• Combining both cohorts—the fifteen institutional users and the five IT experts for a total sample of twenty respondents—the system achieved an Overall Composite Grand Mean of 4.72, interpreted as 'Very Highly Acceptable.'\n\n"
                "This proves that the platform successfully balances high-level security with an effortless, practical user experience for university stakeholders.\""
            ),
            "tip": "Highlight the 4.87 Usability rating and the 4.72 Composite Grand Mean across all 20 respondents.",
            "qa": "Why did institutional users rate it higher than experts (4.83 vs 4.40)? Users directly experienced the relief from manual paper binder headaches."
        },
        {
            "num": 8,
            "title": "CONCLUSION",
            "time": "50 seconds",
            "visual": "Four Key Principal Conclusions",
            "script": (
                "\"Based on the development and empirical evaluation, four principal conclusions are established:\n\n"
                "1. First, Centralized Accreditation Repository: The platform successfully modernizes STI West Negros University's accreditation process, replacing physical paper folders with a unified, cloud-based evidence repository aligned with PACUCOA criteria.\n"
                "2. Second, Automated Scoring Accuracy: Automating the PACUCOA 30-weight formula and dual floor rules eliminates manual arithmetic errors and gives instant visibility into program readiness ratings.\n"
                "3. Third, Programmatic Verification Integrity: Enforcing separation of duties through database-level self-verification blocks and mandatory document inspection guarantees audit defensibility.\n"
                "4. And Fourth, Superior Software Quality: An ISO/IEC 25010 composite mean of 4.72 across twenty respondents affirms that the system is secure, usable, and fully ready for institutional deployment.\""
            ),
            "tip": "Deliver conclusions with strong, steady inflection. Each conclusion directly solves an existing institutional pain point.",
            "qa": "What is the single biggest contribution? Real-time PACUCOA readiness calculation replacing months of manual preparation."
        },
        {
            "num": 9,
            "title": "RECOMMENDATIONS",
            "time": "45 seconds",
            "visual": "Four Actionable Institutional Recommendations",
            "script": (
                "\"To maximize the operational impact of this research, the following recommendations are offered:\n\n"
                "1. First, Institutional Rollout: Formally operationalize the platform for the BSCS program, followed by expansion across BSIT and all programs in the College of Information and Communications Technology.\n"
                "2. Second, Semester-End Evidence Policy: Mandate that faculty submit verified digital exhibits at the conclusion of each semester to maintain continuous year-round accreditation readiness.\n"
                "3. Third, Campus System Integration: Build secure API connectors to STI WNU's Student Information System, LMS, and HRIS to automate the ingestion of syllabi and faculty credentials.\n"
                "4. And Fourth, Multi-Accreditor Expansion: Extend the configurable evaluation architecture to support other accrediting frameworks such as PAASCU, ALCUCOA, and CHED standards.\""
            ),
            "tip": "Keep recommendations action-oriented and forward-looking, demonstrating institutional foresight.",
            "qa": "How difficult is multi-accreditor support? The database criteria tree is fully configurable; adding PAASCU weights is straightforward."
        },
        {
            "num": 10,
            "title": "REFERENCES & CLOSING",
            "time": "30 seconds",
            "visual": "Official References & Formal Closing Statement",
            "script": (
                "\"Slide 10 presents the primary legal, regulatory, and quality frameworks underpinning this work, including CHED CMO No. 12, the PACUCOA Manual of Accreditation, and the ISO/IEC 25010 Quality Model.\n\n"
                "This concludes my final oral defense presentation. Thank you very much, honorable panel members and guests. I am now open and eager to entertain your questions, insights, and recommendations.\""
            ),
            "tip": "Pause, smile, maintain eye contact, and invite the panel's critique with professional confidence.",
            "qa": "Always begin your answers with: 'Thank you for that question, Sir/Ma'am...' before providing concise answers."
        }
    ]

    for s_data in slides:
        # Slide Header Table
        tbl_s = doc.add_table(rows=1, cols=2)
        tbl_s.alignment = WD_TABLE_ALIGNMENT.CENTER
        cell_l = tbl_s.cell(0, 0)
        cell_r = tbl_s.cell(0, 1)
        cell_l.width = Inches(4.5)
        cell_r.width = Inches(2.0)
        set_cell_background(cell_l, "102A4D")
        set_cell_background(cell_r, "102A4D")
        set_cell_margins(cell_l, top=100, bottom=100, left=140, right=140)
        set_cell_margins(cell_r, top=100, bottom=100, left=140, right=140)

        p_l = cell_l.paragraphs[0]
        r_num = p_l.add_run(f"SLIDE {s_data['num']}: {s_data['title']}")
        r_num.font.name = "Arial"
        r_num.font.size = Pt(11)
        r_num.font.bold = True
        r_num.font.color.rgb = RGBColor(255, 255, 255)

        p_r = cell_r.paragraphs[0]
        p_r.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        r_tim = p_r.add_run(f"⏱ Time: ~{s_data['time']}")
        r_tim.font.name = "Arial"
        r_tim.font.size = Pt(10)
        r_tim.font.bold = True
        r_tim.font.color.rgb = GOLD

        # Visual Context Sub-bar
        p_vis = doc.add_paragraph()
        p_vis.paragraph_format.space_before = Pt(4)
        p_vis.paragraph_format.space_after = Pt(6)
        r_vh = p_vis.add_run("Slide Visuals: ")
        r_vh.font.name = "Arial"
        r_vh.font.size = Pt(9.5)
        r_vh.font.bold = True
        r_vh.font.color.rgb = SLATE

        r_vb = p_vis.add_run(s_data['visual'])
        r_vb.font.name = "Arial"
        r_vb.font.size = Pt(9.5)
        r_vb.font.italic = True
        r_vb.font.color.rgb = DARK_GRAY

        # Spoken Script Box
        tbl_scr = doc.add_table(rows=1, cols=1)
        tbl_scr.alignment = WD_TABLE_ALIGNMENT.CENTER
        cell_scr = tbl_scr.cell(0, 0)
        set_cell_background(cell_scr, "F8FAFC")
        set_cell_margins(cell_scr, top=120, bottom=120, left=160, right=160)

        p_scr_hdr = cell_scr.paragraphs[0]
        p_scr_hdr.paragraph_format.space_after = Pt(4)
        r_sh = p_scr_hdr.add_run("🎙 WHAT TO SAY (EXACT SPOKEN SCRIPT):")
        r_sh.font.name = "Arial"
        r_sh.font.size = Pt(10)
        r_sh.font.bold = True
        r_sh.font.color.rgb = NAVY

        for para_text in s_data['script'].split("\n\n"):
            p_scr = cell_scr.add_paragraph()
            p_scr.paragraph_format.space_after = Pt(6)
            p_scr.paragraph_format.line_spacing = 1.15
            r_spk = p_scr.add_run(para_text)
            r_spk.font.name = "Arial"
            r_spk.font.size = Pt(10.5)
            r_spk.font.color.rgb = DARK_GRAY

        # Defense Tip & Q&A Box
        p_tip = doc.add_paragraph()
        p_tip.paragraph_format.space_before = Pt(4)
        p_tip.paragraph_format.space_after = Pt(14)

        r_th = p_tip.add_run("💡 Pro Presenter Tip: ")
        r_th.font.name = "Arial"
        r_th.font.size = Pt(9.5)
        r_th.font.bold = True
        r_th.font.color.rgb = GOLD

        r_tb = p_tip.add_run(s_data['tip'] + "\n")
        r_tb.font.name = "Arial"
        r_tb.font.size = Pt(9.5)
        r_tb.font.color.rgb = DARK_GRAY

        r_qh = p_tip.add_run("🎯 Likely Panel Question & Defense Answer: ")
        r_qh.font.name = "Arial"
        r_qh.font.size = Pt(9.5)
        r_qh.font.bold = True
        r_qh.font.color.rgb = NAVY

        r_qb = p_tip.add_run(s_data['qa'])
        r_qb.font.name = "Arial"
        r_qb.font.size = Pt(9.5)
        r_qb.font.color.rgb = DARK_GRAY

        if s_data['num'] < 10:
            doc.add_paragraph().paragraph_format.space_after = Pt(8)

    output_path = "DEFENSE_SPEECH_SCRIPT_PER_SLIDE.docx"
    doc.save(output_path)
    print(f"[SUCCESS] Defense speech script saved to '{output_path}'.")


if __name__ == "__main__":
    build_docx_script()


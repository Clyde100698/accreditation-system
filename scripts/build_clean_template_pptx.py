import os
import pptx
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN


def populate_clean_template():
    template_path = "FINAL ORAL DEFENSE TEMPLATE (2).pptx"
    output_path = "FINAL_ORAL_DEFENSE_PRESENTATION.pptx"

    prs = Presentation(template_path)
    print(f"Loaded '{template_path}' with {len(prs.slides)} slides.")

    # Colors
    NAVY = RGBColor(16, 42, 77)
    GOLD = RGBColor(212, 160, 23)
    DARK_GRAY = RGBColor(50, 50, 50)
    LIGHT_BG = RGBColor(245, 247, 250)
    WHITE = RGBColor(255, 255, 255)
    GOLD_BG = RGBColor(254, 243, 199)

    # Helper to clear shapes except Title and Top Master Banner
    def clear_slide_content(slide):
        title_el = slide.shapes.title._element if slide.shapes.title is not None else None
        to_remove = []
        for shape in slide.shapes:
            if title_el is not None and shape._element is title_el:
                continue
            if shape.has_text_frame and "MASTER IN INFORMATION TECHNOLOGY" in shape.text_frame.text:
                continue
            to_remove.append(shape._element)
        for el in to_remove:
            slide.shapes._spTree.remove(el)

    # =========================================================================
    # SLIDE 1: CAPSTONE TITLE
    # =========================================================================
    s1 = prs.slides[0]
    t1 = s1.shapes.title
    t1.text_frame.text = ""
    p_t1 = t1.text_frame.paragraphs[0]
    p_t1.alignment = PP_ALIGN.CENTER
    r_t1 = p_t1.add_run()
    r_t1.text = "WEB-BASED ACCREDITATION MANAGEMENT AND READINESS ASSESSMENT SYSTEM FOR STI WEST NEGROS UNIVERSITY"
    r_t1.font.name = "Arial"
    r_t1.font.size = Pt(26)
    r_t1.font.bold = True
    r_t1.font.color.rgb = NAVY

    sub1 = s1.placeholders[1]
    sub1.text_frame.text = ""
    p_auth = sub1.text_frame.paragraphs[0]
    p_auth.alignment = PP_ALIGN.CENTER
    r_auth = p_auth.add_run()
    r_auth.text = "ENGR. CLYDE TABURADA\n"
    r_auth.font.name = "Arial"
    r_auth.font.size = Pt(22)
    r_auth.font.bold = True
    r_auth.font.color.rgb = DARK_GRAY

    p_cand = sub1.text_frame.add_paragraph()
    p_cand.alignment = PP_ALIGN.CENTER
    r_cand = p_cand.add_run()
    r_cand.text = "MIT Candidate (Master in Information Technology)\n"
    r_cand.font.name = "Arial"
    r_cand.font.size = Pt(16)
    r_cand.font.bold = True
    r_cand.font.color.rgb = GOLD

    p_dept = sub1.text_frame.add_paragraph()
    p_dept.alignment = PP_ALIGN.CENTER
    r_dept = p_dept.add_run()
    r_dept.text = "College of Information and Communications Technology\nSTI West Negros University, Bacolod City"
    r_dept.font.name = "Arial"
    r_dept.font.size = Pt(13)
    r_dept.font.color.rgb = DARK_GRAY
    print("Slide 1 configured.")

    # =========================================================================
    # SLIDE 2: GENERAL OBJECTIVES & SPECIFIC OBJECTIVES
    # =========================================================================
    s2 = prs.slides[1]
    s2.shapes.title.text = "General Objectives:"
    p_s2_t = s2.shapes.title.text_frame.paragraphs[0]
    p_s2_t.font.name = "Arial"
    p_s2_t.font.size = Pt(26)
    p_s2_t.font.bold = True
    p_s2_t.font.color.rgb = NAVY

    c2 = s2.placeholders[1]
    c2.text_frame.text = ""

    p_gen = c2.text_frame.paragraphs[0]
    p_gen.space_after = Pt(12)
    r_gen = p_gen.add_run()
    r_gen.text = (
        "To design, develop, and evaluate a Web-Based Accreditation Management and Readiness Assessment System "
        "for STI West Negros University that centralizes evidence mapping, automates PACUCOA-compliant readiness scoring, "
        "provides what-if simulation, and tracks post-visit compliance."
    )
    r_gen.font.name = "Arial"
    r_gen.font.size = Pt(13.5)
    r_gen.font.color.rgb = DARK_GRAY

    p_spec_hdr = c2.text_frame.add_paragraph()
    p_spec_hdr.space_after = Pt(4)
    r_spec_hdr = p_spec_hdr.add_run()
    r_spec_hdr.text = "Specific Objectives:"
    r_spec_hdr.font.name = "Arial"
    r_spec_hdr.font.size = Pt(16)
    r_spec_hdr.font.bold = True
    r_spec_hdr.font.color.rgb = NAVY

    specifics = [
        "1. Build an Evidence Management module to centralize exhibit mapping and validate file formats, effective dates, and required document counts.",
        "2. Implement an automated Readiness Scoring Engine computing ratings using the PACUCOA 30-weight formula and dual-constraint floor rules.",
        "3. Provide an isolated What-If Simulation Sandbox to forecast accreditation readiness without altering live production data.",
        "4. Incorporate a Post-Visit Compliance Tracking module recording recommendations, action plans, and verification exhibits.",
        "5. Enforce role-based access control and separation of duties with a database-level self-verification block.",
        "6. Evaluate software quality against ISO/IEC 25010 across eight software quality characteristics with 20 respondents (15 users and 5 IT experts).",
    ]
    for s in specifics:
        p = c2.text_frame.add_paragraph()
        p.space_after = Pt(4)
        r = p.add_run()
        r.text = s
        r.font.name = "Arial"
        r.font.size = Pt(12)
        r.font.color.rgb = DARK_GRAY
    print("Slide 2 configured.")

    # =========================================================================
    # SLIDE 3: SYSTEM DESIGN - SDLC MODEL FIGURE
    # =========================================================================
    s3 = prs.slides[2]
    s3.shapes.title.text = "System Design"
    s3.shapes.title.text_frame.paragraphs[0].font.name = "Arial"
    s3.shapes.title.text_frame.paragraphs[0].font.size = Pt(26)
    s3.shapes.title.text_frame.paragraphs[0].font.bold = True
    s3.shapes.title.text_frame.paragraphs[0].font.color.rgb = NAVY
    clear_slide_content(s3)

    fig2_path = os.path.join("figures", "figure2_sdlc_scrum.png")
    if os.path.exists(fig2_path):
        s3.shapes.add_picture(fig2_path, Inches(1.4), Inches(1.6), width=Inches(10.5), height=Inches(5.1))
        cap3 = s3.shapes.add_textbox(Inches(1.0), Inches(6.8), Inches(11.33), Inches(0.4))
        p = cap3.text_frame.paragraphs[0]
        p.alignment = PP_ALIGN.CENTER
        r = p.add_run()
        r.text = "Figure 2. Software Development Life Cycle (SDLC) Framework (Agile Scrum with 4 Sprints)"
        r.font.name = "Arial"
        r.font.size = Pt(12)
        r.font.bold = True
        r.font.color.rgb = NAVY
    print("Slide 3 configured.")

    # =========================================================================
    # SLIDE 4: SYSTEM DESIGN - SYSTEM ARCHITECTURE
    # =========================================================================
    s4 = prs.slides[3]
    s4.shapes.title.text = "System Design"
    s4.shapes.title.text_frame.paragraphs[0].font.name = "Arial"
    s4.shapes.title.text_frame.paragraphs[0].font.size = Pt(26)
    s4.shapes.title.text_frame.paragraphs[0].font.bold = True
    s4.shapes.title.text_frame.paragraphs[0].font.color.rgb = NAVY
    clear_slide_content(s4)

    fig3_path = os.path.join("figures", "figure3_system_architecture.png")
    if os.path.exists(fig3_path):
        s4.shapes.add_picture(fig3_path, Inches(2.1), Inches(1.6), width=Inches(9.15), height=Inches(5.15))
        cap4 = s4.shapes.add_textbox(Inches(1.0), Inches(6.8), Inches(11.33), Inches(0.4))
        p = cap4.text_frame.paragraphs[0]
        p.alignment = PP_ALIGN.CENTER
        r = p.add_run()
        r.text = "Figure 3. System Architecture of the Web-Based Accreditation Management System"
        r.font.name = "Arial"
        r.font.size = Pt(12)
        r.font.bold = True
        r.font.color.rgb = NAVY
    print("Slide 4 configured.")

    # =========================================================================
    # SLIDE 5: SYSTEM DESIGN - HARDWARE AND SOFTWARE COMPONENTS
    # =========================================================================
    s5 = prs.slides[4]
    s5.shapes.title.text = "System Design"
    s5.shapes.title.text_frame.paragraphs[0].font.name = "Arial"
    s5.shapes.title.text_frame.paragraphs[0].font.size = Pt(26)
    s5.shapes.title.text_frame.paragraphs[0].font.bold = True
    s5.shapes.title.text_frame.paragraphs[0].font.color.rgb = NAVY
    clear_slide_content(s5)

    sub5_box = s5.shapes.add_textbox(Inches(0.5), Inches(1.15), Inches(12.33), Inches(0.35))
    r = sub5_box.text_frame.paragraphs[0].add_run()
    r.text = "List of Hardware and Software Components"
    r.font.name = "Arial"
    r.font.size = Pt(14)
    r.font.bold = True
    r.font.color.rgb = NAVY

    tbl5_shape = s5.shapes.add_table(6, 3, Inches(0.5), Inches(1.60), Inches(12.33), Inches(4.80))
    tbl5 = tbl5_shape.table
    tbl5.columns[0].width = Inches(2.6)
    tbl5.columns[1].width = Inches(4.2)
    tbl5.columns[2].width = Inches(5.53)

    specs = [
        ["Category / Tier", "Technology / Specification", "Functional Role in Platform"],
        ["Presentation Tier", "Next.js 14, React 18, TypeScript, Tailwind CSS, Lucide Icons", "Delivers responsive UI, QA Configuration, Executive Dashboard, and Simulation Sandbox."],
        ["Backend & Database", "Supabase BaaS, PostgreSQL 15, Row-Level Security (RLS)", "Manages relational schema, automated scoring engine, and role-based data isolation."],
        ["Storage & Processing", "Supabase Storage, Server-side PDF Text Extraction", "Enforces encrypted exhibit storage, signed URLs, and text-layer metadata extraction."],
        ["Security & Access", "Supabase Auth, JWT Tokens, Role-Based Access Control", "Enforces separation of duties across QA Officer, Admin, Dean, Program Head, and Faculty."],
        ["Hardware Requirements", "Host: Cloud Server (4GB RAM, 20GB SSD); Client: 1.6 GHz, 4GB RAM", "Cross-browser operation across modern browsers (Chrome, Edge, Firefox) with zero client install."],
    ]

    for r_idx, row in enumerate(specs):
        for c_idx, val in enumerate(row):
            cell = tbl5.cell(r_idx, c_idx)
            cell.text = val
            p = cell.text_frame.paragraphs[0]
            p.font.name = "Arial"
            if r_idx == 0:
                p.font.bold = True
                p.font.size = Pt(12)
                p.font.color.rgb = WHITE
                cell.fill.solid()
                cell.fill.fore_color.rgb = NAVY
            else:
                p.font.size = Pt(11)
                p.font.color.rgb = DARK_GRAY
                cell.fill.solid()
                cell.fill.fore_color.rgb = LIGHT_BG if r_idx % 2 == 0 else WHITE
    print("Slide 5 configured.")

    # =========================================================================
    # SLIDE 6: RESULTS - EXPERTS' EVALUATION (TABLE OF EXPERTS, n = 5)
    # =========================================================================
    s6 = prs.slides[5]
    s6.shapes.title.text = "RESULTS"
    s6.shapes.title.text_frame.paragraphs[0].font.name = "Arial"
    s6.shapes.title.text_frame.paragraphs[0].font.size = Pt(26)
    s6.shapes.title.text_frame.paragraphs[0].font.bold = True
    s6.shapes.title.text_frame.paragraphs[0].font.color.rgb = NAVY
    clear_slide_content(s6)

    sub6_box = s6.shapes.add_textbox(Inches(0.5), Inches(1.15), Inches(12.33), Inches(0.35))
    r = sub6_box.text_frame.paragraphs[0].add_run()
    r.text = "Table of the Results of Experts' Evaluation (ISO/IEC 25010 - IT Experts, n = 5)"
    r.font.name = "Arial"
    r.font.size = Pt(14)
    r.font.bold = True
    r.font.color.rgb = NAVY

    tbl6_shape = s6.shapes.add_table(10, 3, Inches(0.5), Inches(1.60), Inches(12.33), Inches(4.70))
    tbl6 = tbl6_shape.table
    tbl6.columns[0].width = Inches(5.0)
    tbl6.columns[1].width = Inches(2.5)
    tbl6.columns[2].width = Inches(4.83)

    experts_data = [
        ["ISO/IEC 25010 Quality Characteristic", "Mean Rating (n = 5)", "Verbal Interpretation"],
        ["1. Functional Suitability", "4.10", "Very Highly Acceptable"],
        ["2. Performance Efficiency", "4.50", "Very Highly Acceptable"],
        ["3. Compatibility", "4.10", "Very Highly Acceptable"],
        ["4. Usability", "4.30", "Very Highly Acceptable"],
        ["5. Reliability", "4.20", "Very Highly Acceptable"],
        ["6. Security (Highest Rated)", "4.90", "Very Highly Acceptable"],
        ["7. Maintainability", "4.60", "Very Highly Acceptable"],
        ["8. Portability", "4.50", "Very Highly Acceptable"],
        ["OVERALL EXPERTS' GRAND MEAN", "4.40", "Very Highly Acceptable"],
    ]

    for r_idx, row in enumerate(experts_data):
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
            elif r_idx == 9:
                p.font.bold = True
                p.font.size = Pt(12)
                p.font.color.rgb = NAVY
                cell.fill.solid()
                cell.fill.fore_color.rgb = GOLD_BG
            else:
                p.font.size = Pt(11)
                p.font.color.rgb = DARK_GRAY
                cell.fill.solid()
                cell.fill.fore_color.rgb = LIGHT_BG if r_idx % 2 == 0 else WHITE

    note6 = s6.shapes.add_textbox(Inches(0.5), Inches(6.50), Inches(12.33), Inches(0.40))
    r = note6.text_frame.paragraphs[0].add_run()
    r.text = "Key Insight: External IT experts rated Security highest at 4.90, confirming robust access control, data encryption, and self-verification isolation."
    r.font.name = "Arial"
    r.font.size = Pt(11.5)
    r.font.bold = True
    r.font.color.rgb = NAVY
    print("Slide 6 configured.")

    # =========================================================================
    # SLIDE 7: RESULTS - USER ACCEPTANCE (TABLE OF USERS, n = 15)
    # =========================================================================
    s7 = prs.slides[6]
    s7.shapes.title.text = "RESULTS"
    s7.shapes.title.text_frame.paragraphs[0].font.name = "Arial"
    s7.shapes.title.text_frame.paragraphs[0].font.size = Pt(26)
    s7.shapes.title.text_frame.paragraphs[0].font.bold = True
    s7.shapes.title.text_frame.paragraphs[0].font.color.rgb = NAVY
    clear_slide_content(s7)

    sub7_box = s7.shapes.add_textbox(Inches(0.5), Inches(1.15), Inches(12.33), Inches(0.35))
    r = sub7_box.text_frame.paragraphs[0].add_run()
    r.text = "Table of the Results of User Acceptance (ISO/IEC 25010 - Institutional Users, n = 15)"
    r.font.name = "Arial"
    r.font.size = Pt(14)
    r.font.bold = True
    r.font.color.rgb = NAVY

    tbl7_shape = s7.shapes.add_table(11, 4, Inches(0.5), Inches(1.60), Inches(12.33), Inches(4.70))
    tbl7 = tbl7_shape.table
    tbl7.columns[0].width = Inches(4.5)
    tbl7.columns[1].width = Inches(2.2)
    tbl7.columns[2].width = Inches(2.2)
    tbl7.columns[3].width = Inches(3.43)

    users_data = [
        ["ISO/IEC 25010 Quality Characteristic", "Users (n = 15)", "Combined (N = 20)", "Verbal Interpretation"],
        ["1. Functional Suitability", "4.84", "4.66", "Very Highly Acceptable"],
        ["2. Performance Efficiency", "4.78", "4.71", "Very Highly Acceptable"],
        ["3. Compatibility", "4.80", "4.63", "Very Highly Acceptable"],
        ["4. Usability", "4.87", "4.73", "Very Highly Acceptable"],
        ["5. Reliability", "4.82", "4.67", "Very Highly Acceptable"],
        ["6. Security", "4.89", "4.89", "Very Highly Acceptable"],
        ["7. Maintainability", "4.77", "4.73", "Very Highly Acceptable"],
        ["8. Portability", "4.85", "4.76", "Very Highly Acceptable"],
        ["USERS' GRAND MEAN", "4.83", "—", "Very Highly Acceptable"],
        ["OVERALL COMPOSITE GRAND MEAN", "—", "4.72", "Very Highly Acceptable"],
    ]

    for r_idx, row in enumerate(users_data):
        for c_idx, val in enumerate(row):
            cell = tbl7.cell(r_idx, c_idx)
            cell.text = val
            p = cell.text_frame.paragraphs[0]
            p.font.name = "Arial"
            if r_idx == 0:
                p.font.bold = True
                p.font.size = Pt(11.5)
                p.font.color.rgb = WHITE
                cell.fill.solid()
                cell.fill.fore_color.rgb = NAVY
            elif r_idx in [9, 10]:
                p.font.bold = True
                p.font.size = Pt(11.5)
                p.font.color.rgb = NAVY
                cell.fill.solid()
                cell.fill.fore_color.rgb = GOLD_BG
            else:
                p.font.size = Pt(10.5)
                p.font.color.rgb = DARK_GRAY
                cell.fill.solid()
                cell.fill.fore_color.rgb = LIGHT_BG if r_idx % 2 == 0 else WHITE

    note7 = s7.shapes.add_textbox(Inches(0.5), Inches(6.50), Inches(12.33), Inches(0.40))
    r = note7.text_frame.paragraphs[0].add_run()
    r.text = "Key Insight: Institutional users (1 QA Officer, 1 Dean, 2 Program Heads, 11 Faculty) gave an overall 4.83 rating, highlighting Usability (4.87) and Security (4.89)."
    r.font.name = "Arial"
    r.font.size = Pt(11.5)
    r.font.bold = True
    r.font.color.rgb = NAVY
    print("Slide 7 configured.")

    # =========================================================================
    # SLIDE 8: CONCLUSION
    # =========================================================================
    s8 = prs.slides[7]
    s8.shapes.title.text = "Conclusion:"
    s8.shapes.title.text_frame.paragraphs[0].font.name = "Arial"
    s8.shapes.title.text_frame.paragraphs[0].font.size = Pt(26)
    s8.shapes.title.text_frame.paragraphs[0].font.bold = True
    s8.shapes.title.text_frame.paragraphs[0].font.color.rgb = NAVY

    c8 = s8.placeholders[1]
    c8.text_frame.text = ""

    conclusions = [
        "1. Centralized Accreditation: Successfully migrated physical paper binders into a unified, secure digital repository mapped directly to PACUCOA criteria trees.",
        "2. Automated Readiness Engine: Eliminated manual scoring errors by automating the 30-weight formula and dual-constraint floor rules for real-time compliance tracking.",
        "3. Verification Integrity: Guaranteed institutional defensibility and separation of duties through database-level self-verification isolation and preview enforcement.",
        "4. Very Highly Acceptable Quality: An ISO/IEC 25010 evaluation across 20 respondents (4.83 users, 4.40 IT experts, 4.72 composite grand mean) confirms the system is robust, secure, and ready for deployment.",
    ]
    for idx, c in enumerate(conclusions):
        p = c8.text_frame.paragraphs[0] if idx == 0 else c8.text_frame.add_paragraph()
        p.space_after = Pt(14)
        r = p.add_run()
        r.text = c
        r.font.name = "Arial"
        r.font.size = Pt(13.5)
        r.font.color.rgb = DARK_GRAY
    print("Slide 8 configured.")

    # =========================================================================
    # SLIDE 9: RECOMMENDATIONS
    # =========================================================================
    s9 = prs.slides[8]
    s9.shapes.title.text = "Recommendations:"
    s9.shapes.title.text_frame.paragraphs[0].font.name = "Arial"
    s9.shapes.title.text_frame.paragraphs[0].font.size = Pt(26)
    s9.shapes.title.text_frame.paragraphs[0].font.bold = True
    s9.shapes.title.text_frame.paragraphs[0].font.color.rgb = NAVY

    c9 = s9.placeholders[1]
    c9.text_frame.text = ""

    recs = [
        "1. Institutional Deployment: Operationalize the system for BSCS and expand university-wide across all CICT academic programs at STI West Negros University.",
        "2. Continuous Exhibit Submission: Mandate regular semester-end digital exhibit uploads by faculty to sustain year-round PACUCOA reaccreditation readiness.",
        "3. Campus API Integration: Establish secure API connections with STI WNU's Student Information System (SIS), LMS, and HRIS to automate credentials ingestion.",
        "4. Multi-Accreditor Support: Extend the configurable scoring framework to accommodate other accrediting agencies such as PAASCU, ALCUCOA, and CHED standards.",
    ]
    for idx, rec in enumerate(recs):
        p = c9.text_frame.paragraphs[0] if idx == 0 else c9.text_frame.add_paragraph()
        p.space_after = Pt(14)
        r = p.add_run()
        r.text = rec
        r.font.name = "Arial"
        r.font.size = Pt(13.5)
        r.font.color.rgb = DARK_GRAY
    print("Slide 9 configured.")

    # =========================================================================
    # SLIDE 10: REFERENCES
    # =========================================================================
    s10 = prs.slides[9]
    s10.shapes.title.text = "References:"
    s10.shapes.title.text_frame.paragraphs[0].font.name = "Arial"
    s10.shapes.title.text_frame.paragraphs[0].font.size = Pt(26)
    s10.shapes.title.text_frame.paragraphs[0].font.bold = True
    s10.shapes.title.text_frame.paragraphs[0].font.color.rgb = NAVY

    c10 = s10.placeholders[1]
    c10.text_frame.text = ""

    refs = [
        "1. Commission on Higher Education. (2019). Policies and guidelines on the grant of autonomous and deregulated status to private higher education institutions (CMO No. 12, s. 2019). CHED.",
        "2. Conchada, M. I., & Tiongco, M. M. (2015). A review of the accreditation system for Philippine higher education institutions (PIDS Discussion Paper No. 2015-30). PIDS.",
        "3. International Organization for Standardization. (2011). Systems and software engineering -- SQuaRE -- System and software quality models (ISO/IEC 25010:2011). ISO.",
        "4. Philippine Association of Colleges and Universities Commission on Accreditation. (2023). Manual of accreditation (Rev. ed.). PACUCOA.",
    ]
    for idx, rf in enumerate(refs):
        p = c10.text_frame.paragraphs[0] if idx == 0 else c10.text_frame.add_paragraph()
        p.space_after = Pt(14)
        r = p.add_run()
        r.text = rf
        r.font.name = "Arial"
        r.font.size = Pt(13)
        r.font.color.rgb = DARK_GRAY
    print("Slide 10 configured.")

    # 1. Save directly into the official template file
    prs.save(template_path)
    print(f"[SUCCESS] Updated '{template_path}' directly.")

    # 2. Save clean copy
    clean_copy = "FINAL_ORAL_DEFENSE_CLEAN_10_SLIDES.pptx"
    prs.save(clean_copy)
    print(f"[SUCCESS] Saved copy to '{clean_copy}'.")

    # 3. Also try saving to output_path if not locked by PowerPoint
    try:
        prs.save(output_path)
        print(f"[SUCCESS] Saved presentation to '{output_path}'.")
    except Exception as e:
        print(f"[INFO] '{output_path}' is currently open in PowerPoint/WPS. Clean version saved to '{template_path}' and '{clean_copy}'.")


if __name__ == "__main__":
    populate_clean_template()

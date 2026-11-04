import os
import pptx
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN


def clear_dynamic_shapes(slide):
    """Remove any non-title, non-master-banner shapes so re-running is 100% idempotent."""
    title_el = slide.shapes.title._element if slide.shapes.title is not None else None
    to_remove = []
    for shape in slide.shapes:
        if title_el is not None and shape._element is title_el:
            continue
        if "Rectangle" in shape.name and shape.has_text_frame and "MASTER IN INFORMATION TECHNOLOGY" in shape.text_frame.text:
            continue
        to_remove.append(shape._element)
    for el in to_remove:
        slide.shapes._spTree.remove(el)


def populate_presentation():
    template_path = "FINAL ORAL DEFENSE TEMPLATE.pptx"
    output_path = "FINAL_ORAL_DEFENSE_PRESENTATION.pptx"

    prs = Presentation(template_path)
    print(f"Loaded '{template_path}' with {len(prs.slides)} slides.")
    print(f"Dimensions: {prs.slide_width.inches:.2f} x {prs.slide_height.inches:.2f} inches")

    # Consistent Color Palette
    NAVY = RGBColor(16, 42, 77)          # Primary STI Navy
    GOLD = RGBColor(212, 160, 23)        # STI Gold / Accent
    DARK_GRAY = RGBColor(50, 50, 50)     # Primary body text
    LIGHT_BG = RGBColor(245, 247, 250)   # Alternating row background
    WHITE = RGBColor(255, 255, 255)
    DEFICIT_BG = RGBColor(254, 226, 226) # Soft red for baseline deficit
    DEFICIT_FG = RGBColor(185, 28, 28)   # Red text
    AMBER_BG = RGBColor(254, 243, 199)   # Soft amber for L1 cleared / L2 pending
    AMBER_FG = RGBColor(146, 64, 14)     # Amber text
    GOLD_BG = RGBColor(254, 243, 199)    # Gold highlight for grand totals

    # =========================================================================
    # SLIDE 1: TITLE SLIDE
    # =========================================================================
    s1 = prs.slides[0]
    t1 = s1.shapes.title
    t1.text_frame.text = ""
    p_t1 = t1.text_frame.paragraphs[0]
    p_t1.alignment = PP_ALIGN.CENTER
    r_t1 = p_t1.add_run()
    r_t1.text = "WEB-BASED ACCREDITATION MANAGEMENT AND READINESS ASSESSMENT SYSTEM FOR STI WEST NEGROS UNIVERSITY"
    r_t1.font.name = "Arial"
    r_t1.font.size = Pt(28)
    r_t1.font.bold = True
    r_t1.font.color.rgb = NAVY

    sub1 = s1.placeholders[1]
    sub1.text_frame.text = ""

    p_author = sub1.text_frame.paragraphs[0]
    p_author.alignment = PP_ALIGN.CENTER
    r_author = p_author.add_run()
    r_author.text = "CLYDE TABURADA\n"
    r_author.font.name = "Arial"
    r_author.font.size = Pt(22)
    r_author.font.bold = True
    r_author.font.color.rgb = DARK_GRAY

    p_deg = sub1.text_frame.add_paragraph()
    p_deg.alignment = PP_ALIGN.CENTER
    r_deg = p_deg.add_run()
    r_deg.text = "MIT Candidate (Master in Information Technology)\n"
    r_deg.font.name = "Arial"
    r_deg.font.size = Pt(16)
    r_deg.font.bold = True
    r_deg.font.color.rgb = GOLD

    p_inst = sub1.text_frame.add_paragraph()
    p_inst.alignment = PP_ALIGN.CENTER
    r_inst = p_inst.add_run()
    r_inst.text = "College of Information and Communications Technology\nSTI West Negros University, Bacolod City"
    r_inst.font.name = "Arial"
    r_inst.font.size = Pt(14)
    r_inst.font.color.rgb = DARK_GRAY

    print("Slide 1 populated.")

    # =========================================================================
    # SLIDE 2: GENERAL OBJECTIVES
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

    p_gen_hdr = c2.text_frame.paragraphs[0]
    p_gen_hdr.space_after = Pt(2)
    r = p_gen_hdr.add_run()
    r.text = "General Objective:"
    r.font.name = "Arial"
    r.font.size = Pt(16)
    r.font.bold = True
    r.font.color.rgb = NAVY

    p_gen_body = c2.text_frame.add_paragraph()
    p_gen_body.space_after = Pt(10)
    r = p_gen_body.add_run()
    r.text = (
        "To design, develop, and evaluate a Web-Based Accreditation Management and Readiness Assessment System "
        "for STI West Negros University that centralizes evidence mapping, enforces independent verification with a "
        "self-verification block, calculates PACUCOA-compliant readiness ratings, provides what-if simulation, "
        "and tracks post-visit compliance."
    )
    r.font.name = "Arial"
    r.font.size = Pt(13)
    r.font.color.rgb = DARK_GRAY

    p_spec_hdr = c2.text_frame.add_paragraph()
    p_spec_hdr.space_after = Pt(2)
    r = p_spec_hdr.add_run()
    r.text = "Specific Objectives:"
    r.font.name = "Arial"
    r.font.size = Pt(16)
    r.font.bold = True
    r.font.color.rgb = NAVY

    specific_objs = [
        "1. Build an Evidence Management and Mapping module that stores exhibits under PACUCOA criteria and validates file types, effective dates, and required document counts with server-side text-layer extraction.",
        "2. Implement an automated Readiness Scoring and Executive 5x2 Command Dashboard module computing ratings using the PACUCOA 30-weight formula and dual-constraint floor rules.",
        "3. Provide an isolated What-If Readiness Simulation Sandbox that forecasts program ratings and accreditation level floor status without mutating live production data.",
        "4. Incorporate a Post-Visit Compliance Tracking module recording recommendations, sub-numbered actions taken, and linked verification exhibits for reaccreditation preparation.",
        "5. Enforce role-based access control and separation of duties with a database-level self-verification block (uploader != verifier; QA Officer exempt).",
        "6. Assess software quality against ISO/IEC 25010 across eight quality characteristics with 20 purposive respondents (15 institutional users and 5 external IT experts).",
    ]

    for item in specific_objs:
        p = c2.text_frame.add_paragraph()
        p.space_after = Pt(3)
        r = p.add_run()
        r.text = item
        r.font.name = "Arial"
        r.font.size = Pt(11.5)
        r.font.color.rgb = DARK_GRAY

    print("Slide 2 populated.")

    # =========================================================================
    # SLIDE 3: SYSTEM DESIGN - SDLC MODEL FIGURE
    # =========================================================================
    s3 = prs.slides[2]
    s3.shapes.title.text = "System Design"
    s3.shapes.title.text_frame.paragraphs[0].font.name = "Arial"
    s3.shapes.title.text_frame.paragraphs[0].font.size = Pt(26)
    s3.shapes.title.text_frame.paragraphs[0].font.bold = True
    s3.shapes.title.text_frame.paragraphs[0].font.color.rgb = NAVY
    clear_dynamic_shapes(s3)

    fig2_path = os.path.join("figures", "figure2_sdlc_scrum.png")
    if os.path.exists(fig2_path):
        w_img = Inches(10.5)
        h_img = Inches(5.15)
        left_img = Inches((13.33 - 10.5) / 2)
        top_img = Inches(1.65)
        s3.shapes.add_picture(fig2_path, left_img, top_img, width=w_img, height=h_img)

        cap_box = s3.shapes.add_textbox(Inches(1.0), Inches(6.85), Inches(11.33), Inches(0.40))
        p_cap = cap_box.text_frame.paragraphs[0]
        p_cap.alignment = PP_ALIGN.CENTER
        r_cap = p_cap.add_run()
        r_cap.text = "Figure 2. Software Development Life Cycle (SDLC) Framework (Agile Scrum with Four Iterations)"
        r_cap.font.name = "Arial"
        r_cap.font.size = Pt(11.5)
        r_cap.font.bold = True
        r_cap.font.color.rgb = NAVY
    print("Slide 3 populated.")

    # =========================================================================
    # SLIDE 4: SYSTEM DESIGN - SYSTEM ARCHITECTURE
    # =========================================================================
    s4 = prs.slides[3]
    s4.shapes.title.text = "System Design"
    s4.shapes.title.text_frame.paragraphs[0].font.name = "Arial"
    s4.shapes.title.text_frame.paragraphs[0].font.size = Pt(26)
    s4.shapes.title.text_frame.paragraphs[0].font.bold = True
    s4.shapes.title.text_frame.paragraphs[0].font.color.rgb = NAVY
    clear_dynamic_shapes(s4)

    fig3_path = os.path.join("figures", "figure3_system_architecture.png")
    if os.path.exists(fig3_path):
        w_img = Inches(9.15)
        h_img = Inches(5.20)
        left_img = Inches((13.33 - 9.15) / 2)
        top_img = Inches(1.62)
        s4.shapes.add_picture(fig3_path, left_img, top_img, width=w_img, height=h_img)

        cap_box = s4.shapes.add_textbox(Inches(1.0), Inches(6.85), Inches(11.33), Inches(0.40))
        p_cap = cap_box.text_frame.paragraphs[0]
        p_cap.alignment = PP_ALIGN.CENTER
        r_cap = p_cap.add_run()
        r_cap.text = "Figure 3. System Architecture of the Web-Based Accreditation Management and Readiness Assessment System"
        r_cap.font.name = "Arial"
        r_cap.font.size = Pt(11.5)
        r_cap.font.bold = True
        r_cap.font.color.rgb = NAVY
    print("Slide 4 populated.")

    # =========================================================================
    # SLIDE 5: SYSTEM DESIGN - LIST OF HARDWARE AND SOFTWARE COMPONENTS
    # =========================================================================
    s5 = prs.slides[4]
    s5.shapes.title.text = "System Design"
    s5.shapes.title.text_frame.paragraphs[0].font.name = "Arial"
    s5.shapes.title.text_frame.paragraphs[0].font.size = Pt(26)
    s5.shapes.title.text_frame.paragraphs[0].font.bold = True
    s5.shapes.title.text_frame.paragraphs[0].font.color.rgb = NAVY
    clear_dynamic_shapes(s5)

    rows_5, cols_5 = 6, 3
    tbl5_shape = s5.shapes.add_table(rows_5, cols_5, Inches(0.5), Inches(1.65), Inches(12.33), Inches(4.75))
    tbl5 = tbl5_shape.table
    tbl5.columns[0].width = Inches(2.5)
    tbl5.columns[1].width = Inches(4.0)
    tbl5.columns[2].width = Inches(5.83)

    specs_data = [
        ["Category / Tier", "Technology / Specification", "Functional Role in Platform"],
        ["Presentation Tier", "Next.js 14, React 18, TypeScript, Tailwind CSS, Lucide Icons", "Delivers responsive UI, QA Framework Config, Executive 5x2 Command Dashboard, and What-If Simulation Sandbox."],
        ["Backend & Cloud Database", "Supabase BaaS, PostgreSQL 15, Row-Level Security (RLS)", "Manages relational schema, automated PACUCOA scoring engine, and database-level self-verification block."],
        ["Storage & Document Processing", "Supabase Private Storage, Server-side PDF Text Extraction", "Enforces secure exhibit storage, time-limited signed download URLs, and text-layer extraction (no OCR)."],
        ["Security & Access Control", "Supabase Auth, JWT Bearer Tokens, Role-Based Access Control", "Enforces separation of duties across QA Officer, Admin, Dean, Program Head, Area Chairs, Faculty, and Observers."],
        ["Minimum Hardware Specs", "Host: Cloud Server (4GB RAM, 20GB SSD); Client: 1.6 GHz Dual-Core, 4GB RAM", "Cross-platform compatibility on modern browsers (Chrome, Edge, Firefox) across desktops, laptops, and tablets."],
    ]

    for r_idx, row in enumerate(specs_data):
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
                p.font.size = Pt(10.5)
                p.font.color.rgb = DARK_GRAY
                cell.fill.solid()
                cell.fill.fore_color.rgb = LIGHT_BG if r_idx % 2 == 0 else WHITE

    note5_box = s5.shapes.add_textbox(Inches(0.5), Inches(6.70), Inches(12.33), Inches(0.40))
    r_n5 = note5_box.text_frame.paragraphs[0].add_run()
    r_n5.text = "Note: Architecture utilizes cloud-native BaaS infrastructure with zero client-side installation requirements."
    r_n5.font.name = "Arial"
    r_n5.font.size = Pt(11)
    r_n5.font.italic = True
    r_n5.font.color.rgb = NAVY
    print("Slide 5 populated.")

    # =========================================================================
    # SLIDE 6: RESULTS - BASELINE & SIMULATION FLOOR STATUS
    # =========================================================================
    s6 = prs.slides[5]
    s6.shapes.title.text = "RESULTS"
    s6.shapes.title.text_frame.paragraphs[0].font.name = "Arial"
    s6.shapes.title.text_frame.paragraphs[0].font.size = Pt(26)
    s6.shapes.title.text_frame.paragraphs[0].font.bold = True
    s6.shapes.title.text_frame.paragraphs[0].font.color.rgb = NAVY
    clear_dynamic_shapes(s6)

    s6_sub = s6.shapes.add_textbox(Inches(0.4), Inches(1.20), Inches(12.5), Inches(0.40))
    r_s6_sub = s6_sub.text_frame.paragraphs[0].add_run()
    r_s6_sub.text = "PACUCOA Evaluative Area Baseline Assessment & What-If Simulation Results (BSCS Program)"
    r_s6_sub.font.name = "Arial"
    r_s6_sub.font.size = Pt(13)
    r_s6_sub.font.bold = True
    r_s6_sub.font.color.rgb = NAVY

    rows_6, cols_6 = 12, 5
    tbl6_shape = s6.shapes.add_table(rows_6, cols_6, Inches(0.4), Inches(1.65), Inches(12.5), Inches(4.35))
    tbl6 = tbl6_shape.table
    tbl6.columns[0].width = Inches(4.0)
    tbl6.columns[1].width = Inches(0.9)
    tbl6.columns[2].width = Inches(2.1)
    tbl6.columns[3].width = Inches(2.2)
    tbl6.columns[4].width = Inches(3.3)

    data_6 = [
        ["PACUCOA Evaluative Area", "Weight", "Baseline Mean", "Simulated (10 Criteria)", "Post-Simulation PACUCOA Floor Status"],
        ["Area I: Philosophy and Objectives", "3", "3.00", "3.00", "L1 Met (>= 3.00) · L2 Floor Pending"],
        ["Area II: Faculty", "3", "3.74", "3.74", "L1 & L2 Floors Met (>= 3.50)"],
        ["Area III: Instruction", "4", "3.00", "3.00", "L1 Met (>= 3.00) · L2 Floor Pending"],
        ["Area IV: Laboratory", "3", "2.67 (Deficit)", "3.40 (+0.73)", "L1 Floor Cleared · L2 Floor Pending"],
        ["Area V: Research", "3", "2.82 (Deficit)", "3.62 (+0.80)", "L1 & L2 Floors Cleared (>= 3.50)"],
        ["Area VI: Library", "3", "3.45", "3.45", "L1 Met (>= 3.00) · L2 Floor Pending"],
        ["Area VII: Student Services", "3", "1.30 (Deficit)", "3.30 (+2.00)", "L1 Floor Cleared · L2 Floor Pending"],
        ["Area VIII: Social Orientation & Community", "3", "4.38", "4.38", "L1 & L2 Floors Met (>= 3.50)"],
        ["Area IX: Physical Plant & Facilities", "2", "5.00", "5.00", "L1 & L2 Floors Met (>= 3.50)"],
        ["Area X: Organization & Administration", "3", "3.50", "3.50", "L1 & L2 Floors Met (>= 3.50)"],
        ["TOTAL WEIGHTED / OVERALL RATING", "30", "3.22 (96.58 / 30)", "3.57 (107.16 / 30)", "Level I Floors Cleared · Level II Area Floor Pending"],
    ]

    for r_idx, row in enumerate(data_6):
        for c_idx, val in enumerate(row):
            cell = tbl6.cell(r_idx, c_idx)
            cell.text = val
            p = cell.text_frame.paragraphs[0]
            p.font.name = "Arial"
            if r_idx == 0:
                p.font.bold = True
                p.font.size = Pt(10.5)
                p.font.color.rgb = WHITE
                cell.fill.solid()
                cell.fill.fore_color.rgb = NAVY
            elif r_idx == 11:
                p.font.bold = True
                p.font.size = Pt(10.5)
                p.font.color.rgb = NAVY
                cell.fill.solid()
                cell.fill.fore_color.rgb = GOLD_BG
            elif r_idx in [4, 5, 7] and c_idx == 2:
                p.font.size = Pt(10)
                p.font.bold = True
                p.font.color.rgb = DEFICIT_FG
                cell.fill.solid()
                cell.fill.fore_color.rgb = DEFICIT_BG
            elif r_idx == 5 and c_idx in [3, 4]:
                p.font.size = Pt(9.5)
                p.font.bold = True
                p.font.color.rgb = RGBColor(22, 101, 52)
                cell.fill.solid()
                cell.fill.fore_color.rgb = RGBColor(240, 253, 244)
            elif r_idx in [4, 7] and c_idx in [3, 4]:
                p.font.size = Pt(9.5)
                p.font.bold = True
                p.font.color.rgb = AMBER_FG
                cell.fill.solid()
                cell.fill.fore_color.rgb = AMBER_BG
            else:
                p.font.size = Pt(9.5)
                p.font.color.rgb = DARK_GRAY
                cell.fill.solid()
                cell.fill.fore_color.rgb = LIGHT_BG if r_idx % 2 == 0 else WHITE

    tx_box6 = s6.shapes.add_textbox(Inches(0.4), Inches(6.10), Inches(12.5), Inches(1.20))
    tf6 = tx_box6.text_frame
    tf6.word_wrap = True
    r_n6 = tf6.paragraphs[0].add_run()
    r_n6.text = (
        "Key Finding: Indicative digital baseline of 3.22 meets Candidate (>= 3.00) but has Level I (< 3.00) Area floor deficits in Areas IV (2.67), V (2.82), and VII (1.30) "
        "(note: BSCS was officially awarded PACUCOA Level I status in Sept. 2026). Simulating 10 priority criteria (+2 in IV, +3 in V, +5 in VII) at 4.00 elevates the rating to 3.57—"
        "clearing all 3.00 Level I Area floors and passing the 3.50 overall mark, while 5 Areas (I, III, IV, VI, VII) remain below the 3.50 Level II Area floor."
    )
    r_n6.font.name = "Arial"
    r_n6.font.size = Pt(10.5)
    r_n6.font.bold = True
    r_n6.font.color.rgb = NAVY
    print("Slide 6 populated.")

    # =========================================================================
    # SLIDE 7: RESULTS - ISO/IEC 25010 EVALUATION (TABLE 10, N = 20)
    # =========================================================================
    s7 = prs.slides[6]
    s7.shapes.title.text = "RESULTS"
    s7.shapes.title.text_frame.paragraphs[0].font.name = "Arial"
    s7.shapes.title.text_frame.paragraphs[0].font.size = Pt(26)
    s7.shapes.title.text_frame.paragraphs[0].font.bold = True
    s7.shapes.title.text_frame.paragraphs[0].font.color.rgb = NAVY
    clear_dynamic_shapes(s7)

    s7_sub = s7.shapes.add_textbox(Inches(0.5), Inches(1.20), Inches(12.33), Inches(0.40))
    r_s7_sub = s7_sub.text_frame.paragraphs[0].add_run()
    r_s7_sub.text = "ISO/IEC 25010 Software Quality Evaluation Results Across User & IT Expert Cohorts (N = 20)"
    r_s7_sub.font.name = "Arial"
    r_s7_sub.font.size = Pt(13)
    r_s7_sub.font.bold = True
    r_s7_sub.font.color.rgb = NAVY

    rows_7, cols_7 = 10, 5
    tbl7_shape = s7.shapes.add_table(rows_7, cols_7, Inches(0.5), Inches(1.65), Inches(12.33), Inches(4.40))
    tbl7 = tbl7_shape.table
    tbl7.columns[0].width = Inches(3.8)
    tbl7.columns[1].width = Inches(1.6)
    tbl7.columns[2].width = Inches(1.6)
    tbl7.columns[3].width = Inches(1.8)
    tbl7.columns[4].width = Inches(3.53)

    data_7 = [
        ["ISO/IEC 25010 Quality Characteristic", "Users (n = 15)", "Experts (n = 5)", "Combined (N = 20)", "Verbal Interpretation"],
        ["1. Functional Suitability", "4.84", "4.10", "4.66", "Strongly Agree / Very Highly Acceptable"],
        ["2. Performance Efficiency", "4.78", "4.50", "4.71", "Strongly Agree / Very Highly Acceptable"],
        ["3. Compatibility", "4.80", "4.10", "4.63", "Strongly Agree / Very Highly Acceptable"],
        ["4. Usability", "4.87", "4.30", "4.73", "Strongly Agree / Very Highly Acceptable"],
        ["5. Reliability", "4.82", "4.20", "4.67", "Strongly Agree / Very Highly Acceptable"],
        ["6. Security (Highest Rated)", "4.89", "4.90", "4.89", "Strongly Agree / Very Highly Acceptable"],
        ["7. Maintainability", "4.77", "4.60", "4.73", "Strongly Agree / Very Highly Acceptable"],
        ["8. Portability", "4.85", "4.50", "4.76", "Strongly Agree / Very Highly Acceptable"],
        ["OVERALL COMPOSITE GRAND MEAN", "4.83", "4.40", "4.72", "Strongly Agree / Very Highly Acceptable"],
    ]

    for r_idx, row in enumerate(data_7):
        for c_idx, val in enumerate(row):
            cell = tbl7.cell(r_idx, c_idx)
            cell.text = val
            p = cell.text_frame.paragraphs[0]
            p.font.name = "Arial"
            if r_idx == 0:
                p.font.bold = True
                p.font.size = Pt(11)
                p.font.color.rgb = WHITE
                cell.fill.solid()
                cell.fill.fore_color.rgb = NAVY
            elif r_idx == 9:
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

    tx_box7 = s7.shapes.add_textbox(Inches(0.5), Inches(6.15), Inches(12.33), Inches(0.95))
    tf7 = tx_box7.text_frame
    tf7.word_wrap = True
    r_n7 = tf7.paragraphs[0].add_run()
    r_n7.text = (
        "Evaluated by N = 20 Purposive Respondents: 15 institutional users (1 QA Officer, 1 CICT Dean, 2 Program Heads, 11 Faculty; M = 4.83) "
        "and 5 external IT experts (M = 4.40), yielding a combined grand mean of 4.72 (Very Highly Acceptable). Security ranked highest across both cohorts (4.89 combined / 4.90 experts)."
    )
    r_n7.font.name = "Arial"
    r_n7.font.size = Pt(10.5)
    r_n7.font.bold = True
    r_n7.font.color.rgb = NAVY
    print("Slide 7 populated.")

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
        "1. Centralized Accreditation Repository: Transitions STI West Negros University from fragmented, physical binder preparation to a unified, cloud-based evidence repository mapped to PACUCOA criteria.",
        "2. Automated PACUCOA Scoring Engine: Eliminates manual calculation errors by automating the 30-weight formula and dual-constraint floor rules, providing immediate visibility into deficit areas (Areas IV, V, VII).",
        "3. Programmatic Verification Integrity: Enforces separation of duties via a database-level self-verification block (uploader != verifier; QA Officer exempt) and mandatory Preview Gate, establishing verifiable evaluation integrity.",
        "4. Strategic Simulation Sandbox: Demonstrates that targeted remediation of 10 priority criteria across deficit areas elevates the rating from 3.22 to 3.57, clearing all 3.00 Level I Area floors and passing the 3.50 overall mark while identifying the 5 Areas still below the 3.50 Level II Area floor.",
        "5. Very Highly Acceptable Quality: An ISO/IEC 25010 evaluation across 20 purposive respondents (4.83 users, 4.40 IT experts, 4.72 combined grand mean; Security highest at 4.89) validates that the platform is functionally suitable, highly secure, and ready for deployment.",
    ]

    for idx, c in enumerate(conclusions):
        p = c8.text_frame.paragraphs[0] if idx == 0 else c8.text_frame.add_paragraph()
        p.space_after = Pt(10)
        r = p.add_run()
        r.text = c
        r.font.name = "Arial"
        r.font.size = Pt(12.5)
        r.font.color.rgb = DARK_GRAY
    print("Slide 8 populated.")

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

    recommendations = [
        "1. Institutional Production Deployment: Adopt and operationalize the system for the BSCS program, followed by progressive university-wide rollout across BSIT and all CICT academic programs at STI WNU.",
        "2. Continuous Evidence Submission Policy: Mandate semester-end digital exhibit submission workflows for faculty to sustain continuous PACUCOA readiness ahead of upcoming Level II reaccreditation surveys.",
        "3. Enterprise Campus System Integration: Establish secure API connections with STI WNU's Student Information System (SIS), Learning Management System (LMS), and HRIS to automate syllabus and credentials ingestion.",
        "4. Advanced Document Intelligence: Incorporate Optical Character Recognition (OCR) and machine learning classifiers to support legacy scanned documents and automate criteria-to-exhibit tagging.",
        "5. Multi-Accreditor Framework Support: Extend the configurable scoring architecture to accommodate PAASCU, ALCUCOA, AACCUP, and CHED institutional quality assurance standards.",
    ]

    for idx, rec in enumerate(recommendations):
        p = c9.text_frame.paragraphs[0] if idx == 0 else c9.text_frame.add_paragraph()
        p.space_after = Pt(10)
        r = p.add_run()
        r.text = rec
        r.font.name = "Arial"
        r.font.size = Pt(13)
        r.font.color.rgb = DARK_GRAY
    print("Slide 9 populated.")

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
        "2. Conchada, M. I., & Tiongco, M. M. (2015). A review of the accreditation system for Philippine higher education institutions (PIDS Discussion Paper No. 2015-30). Philippine Institute for Development Studies.",
        "3. International Organization for Standardization & International Electrotechnical Commission. (2011). Systems and software engineering -- SQuaRE -- System and software quality models (ISO/IEC 25010:2011). ISO.",
        "4. Philippine Association of Colleges and Universities Commission on Accreditation. (2023). Manual of accreditation (Rev. ed.). PACUCOA.",
        "5. Sandhu, R. S., Coyne, E. J., Feinstein, H. L., & Youman, C. E. (1996). Role-based access control models. IEEE Computer, 29(2), 38-47.",
    ]

    for idx, rf in enumerate(refs):
        p = c10.text_frame.paragraphs[0] if idx == 0 else c10.text_frame.add_paragraph()
        p.space_after = Pt(10)
        r = p.add_run()
        r.text = rf
        r.font.name = "Arial"
        r.font.size = Pt(12)
        r.font.color.rgb = DARK_GRAY
    print("Slide 10 populated.")

    prs.save(template_path)
    print(f"[SUCCESS] Updated '{template_path}' directly.")

    prs.save(output_path)
    print(f"[SUCCESS] Saved identical clean copy to '{output_path}'.")


if __name__ == "__main__":
    populate_presentation()

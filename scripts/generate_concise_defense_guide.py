import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

def set_cell_background(cell, fill_hex):
    tcPr = cell._tc.get_or_add_tcPr()
    tcPr.append(parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>'))

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = OxmlElement('w:tcMar')
    for m, val in [('top', top), ('bottom', bottom), ('left', left), ('right', right)]:
        node = OxmlElement(f'w:{m}')
        node.set(qn('w:w'), str(val))
        node.set(qn('w:type'), 'dxa')
        tcMar.append(node)
    tcPr.append(tcMar)

def set_cell_border_left_only(cell, color_hex="102A4D", size="24"):
    tcPr = cell._tc.get_or_add_tcPr()
    tcBorders = parse_xml(
        f'<w:tcBorders {nsdecls("w")}>'
        f'<w:top w:val="none"/>'
        f'<w:left w:val="single" w:sz="{size}" w:space="0" w:color="{color_hex}"/>'
        f'<w:bottom w:val="none"/>'
        f'<w:right w:val="none"/>'
        f'</w:tcBorders>'
    )
    tcPr.append(tcBorders)

def set_table_borders(table, color="D1D5DB", sz="4"):
    tblPr = table._tbl.tblPr
    borders = parse_xml(
        f'<w:tblBorders {nsdecls("w")}>'
        f'<w:top w:val="single" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'<w:left w:val="none"/>'
        f'<w:bottom w:val="single" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'<w:right w:val="none"/>'
        f'<w:insideH w:val="single" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'<w:insideV w:val="none"/>'
        f'</w:tblBorders>'
    )
    tblPr.append(borders)

def build_guide():
    doc = docx.Document()
    
    # Page Setup - 0.7 inch margins
    sections = doc.sections
    for s in sections:
        s.top_margin = Inches(0.7)
        s.bottom_margin = Inches(0.7)
        s.left_margin = Inches(0.7)
        s.right_margin = Inches(0.7)
        s.different_first_page_header_footer = False

    # Palette
    NAVY = RGBColor(16, 42, 77)     # #102A4D
    AMBER = RGBColor(180, 83, 9)    # #B45309
    SLATE = RGBColor(71, 85, 105)   # #475569
    DARK = RGBColor(30, 41, 59)     # #1E293B
    RED = RGBColor(185, 28, 28)     # #B91C1C
    GREEN = RGBColor(21, 128, 61)   # #15803D

    # Helper: Add Callout Box
    def add_callout(text_list, border_color="102A4D", bg_color="F8FAFC"):
        tbl = doc.add_table(rows=1, cols=1)
        tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
        tbl.autofit = False
        tbl.columns[0].width = Inches(7.1)
        c = tbl.cell(0, 0)
        set_cell_background(c, bg_color)
        set_cell_border_left_only(c, color_hex=border_color, size="24")
        set_cell_margins(c, top=120, bottom=120, left=180, right=140)
        
        p = c.paragraphs[0]
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(2)
        p.paragraph_format.line_spacing = 1.15
        
        first = True
        for item in text_list:
            if not first:
                p = c.add_paragraph()
                p.paragraph_format.space_before = Pt(2)
                p.paragraph_format.space_after = Pt(2)
                p.paragraph_format.line_spacing = 1.15
            first = False
            
            for part in item:
                text, bold, italic, color = part
                run = p.add_run(text)
                run.bold = bold
                run.italic = italic
                if color:
                    run.font.color.rgb = color
                run.font.size = Pt(9.5)
        
        doc.add_paragraph().paragraph_format.space_after = Pt(4)

    # ---------------------------------------------------------
    # HEADER / TITLE BLOCK
    # ---------------------------------------------------------
    title_p = doc.add_paragraph()
    title_p.paragraph_format.space_before = Pt(0)
    title_p.paragraph_format.space_after = Pt(2)
    t_run = title_p.add_run("ORAL DEFENSE HIGH-YIELD POCKET GUIDE")
    t_run.bold = True
    t_run.font.size = Pt(20)
    t_run.font.color.rgb = NAVY

    sub_p = doc.add_paragraph()
    sub_p.paragraph_format.space_before = Pt(0)
    sub_p.paragraph_format.space_after = Pt(12)
    s_run = sub_p.add_run("Web-Based Accreditation Management and Readiness Assessment System for STI West Negros University\n")
    s_run.bold = True
    s_run.font.size = Pt(10.5)
    s_run.font.color.rgb = DARK
    
    meta_run = sub_p.add_run("Author: Engr. Jose Marie Clyde B. Taburada | Degree: Master in Information Technology (SUNN) | Partner Locale: STI WNU CICT")
    meta_run.font.size = Pt(9)
    meta_run.font.color.rgb = SLATE

    # ---------------------------------------------------------
    # SECTION 1: MASTER DEFENSE FACT SHEET & GOLDEN NUMBERS
    # ---------------------------------------------------------
    h1 = doc.add_heading(level=1)
    h1.paragraph_format.space_before = Pt(8)
    h1.paragraph_format.space_after = Pt(4)
    r = h1.add_run("1. MASTER DEFENSE FACT SHEET & GOLDEN NUMBERS")
    r.bold = True
    r.font.color.rgb = NAVY
    r.font.size = Pt(13)

    add_callout([
        [("THE 5 GOLDEN NUMBERS YOU MUST DELIVER FLAWLESSLY:", True, False, NAVY)],
        [("1. Baseline Grand Mean: ", True, False, DARK), ("3.22 / 5.00", True, False, GREEN), 
         (" — Met PACUCOA Level I overall mark (>=3.00), but revealed 3 deficit Areas below 3.00 (IV, V, VII).", False, False, DARK)],
        [("2. Simulation Scope: ", True, False, DARK), ("Exactly 10 Priority Criteria", True, False, AMBER),
         (" (+2 in Area IV Labs, +3 in Area V Research, +5 in Area VII Student Services).", False, False, DARK)],
        [("3. Projected Grand Mean: ", True, False, DARK), ("3.57 / 5.00 (+0.35 Net Gain)", True, False, GREEN),
         (" — Clears all 3.00 Level I floors across all 10 Areas (lowest Area is 3.00).", False, False, DARK)],
        [("4. Dual-Constraint Rule: ", True, False, DARK), ("3.57 DOES NOT equal full Level II readiness", True, False, RED),
         (" because five Areas (I, III, IV, VI, VII) remain below the 3.50 Level II floor.", False, False, DARK)],
        [("5. ISO/IEC 25010 Quality Rating: ", True, False, DARK), ("4.72 / 5.00 Overall (N = 20)", True, False, NAVY),
         (" — Evaluated by 15 University Stakeholders (4.83) and 5 External IT Professionals (4.40). Verbal: ", False, False, DARK),
         ("Very Highly Acceptable", True, False, GREEN), (".", False, False, DARK)]
    ], border_color="102A4D", bg_color="F0F7FF")

    # Table of 10 Evaluative Areas
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(4)
    p.paragraph_format.space_after = Pt(2)
    r = p.add_run("PACUCOA 10 Evaluative Areas, Weights (Sum = 30), & Remediation Results")
    r.bold = True
    r.font.size = Pt(9.5)
    r.font.color.rgb = DARK

    table1 = doc.add_table(rows=11, cols=6)
    table1.alignment = WD_TABLE_ALIGNMENT.CENTER
    table1.autofit = False
    set_table_borders(table1)

    headers = ["Area Name", "Weight", "Baseline", "Simulated", "Change", "Floor Status (Level I >= 3.00)"]
    widths = [Inches(2.2), Inches(0.7), Inches(0.8), Inches(0.8), Inches(0.8), Inches(1.8)]

    # Header Row
    for col_idx, text in enumerate(headers):
        cell = table1.cell(0, col_idx)
        cell.width = widths[col_idx]
        set_cell_background(cell, "102A4D")
        set_cell_margins(cell, top=80, bottom=80, left=80, right=80)
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER if col_idx > 0 else WD_ALIGN_PARAGRAPH.LEFT
        run = p.add_run(text)
        run.bold = True
        run.font.size = Pt(8.5)
        run.font.color.rgb = RGBColor(255, 255, 255)

    data1 = [
        ("I. Philosophy & Objectives", "3", "3.00", "3.00", "0.00", "Passed Floor (3.00)"),
        ("II. Faculty", "3", "4.05", "4.05", "0.00", "Passed Floor (Exceeds L-II)"),
        ("III. Instruction", "4", "3.00", "3.00", "0.00", "Passed Floor (3.00)"),
        ("IV. Laboratories", "3", "2.67", "3.40", "+0.73", "CLEARED FLOOR (+2 criteria)"),
        ("V. Research", "3", "2.73", "3.62", "+0.89", "CLEARED FLOOR (+3 criteria)"),
        ("VI. Library", "3", "3.45", "3.45", "0.00", "Passed Floor (3.45)"),
        ("VII. Student Services", "3", "1.30", "3.30", "+2.00", "CLEARED FLOOR (+5 criteria)"),
        ("VIII. Social Orientation", "3", "3.80", "3.80", "0.00", "Passed Floor (3.80)"),
        ("IX. Physical Plant", "2", "3.80", "3.80", "0.00", "Passed Floor (3.80)"),
        ("X. Organization & Admin", "3", "4.30", "4.30", "0.00", "Passed Floor (Exceeds L-II)")
    ]

    for row_idx, row in enumerate(data1, start=1):
        for col_idx, val in enumerate(row):
            cell = table1.cell(row_idx, col_idx)
            cell.width = widths[col_idx]
            if row_idx % 2 == 1:
                set_cell_background(cell, "F8FAFC")
            set_cell_margins(cell, top=60, bottom=60, left=80, right=80)
            p = cell.paragraphs[0]
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER if col_idx > 0 else WD_ALIGN_PARAGRAPH.LEFT
            run = p.add_run(val)
            run.font.size = Pt(8.5)
            if "CLEARED" in val:
                run.bold = True
                run.font.color.rgb = GREEN
            elif col_idx == 4 and val != "0.00":
                run.bold = True
                run.font.color.rgb = AMBER
            else:
                run.font.color.rgb = DARK

    # ---------------------------------------------------------
    # SECTION 2: 3-MINUTE OPENING SPEECH SCRIPT
    # ---------------------------------------------------------
    doc.add_page_break()
    h2 = doc.add_heading(level=1)
    h2.paragraph_format.space_before = Pt(6)
    h2.paragraph_format.space_after = Pt(4)
    r = h2.add_run("2. THE 3-MINUTE DEFENSE OPENING SCRIPT")
    r.bold = True
    r.font.color.rgb = NAVY
    r.font.size = Pt(13)

    add_callout([
        [("SPEAKABLE WORD-FOR-WORD SCRIPT (Read with calm, authoritative pacing):", True, False, NAVY)],
        [("\"Good morning, respected Chair and members of the oral defense panel.", False, True, DARK)],
        [("Every few years, private higher education institutions in the Philippines undergo rigorous voluntary accreditation under PACUCOA across ten evaluative areas. To achieve Level I or Level II formal accredited status, a degree program cannot simply rely on a high overall average. PACUCOA strictly enforces a ", False, False, DARK),
         ("dual-constraint passing rule", True, False, DARK),
         (": the weighted grand mean across all ten areas—whose equivalent weights sum to exactly 30—must reach the required benchmark, and ", False, False, DARK),
         ("no single area is permitted to fall below the mandatory area floor", True, False, DARK),
         (" (3.00 for Level I, 3.50 for Level II).", False, False, DARK)],
        [("At STI West Negros University, preparing the hundreds of required proof documents has traditionally relied on decentralized physical folders, unlinked cloud drives, and manual spreadsheets. This workflow caused three critical operational problems: first, documentary fragmentation and missing evidence; second, a lack of database-enforced separation of duties where faculty could inadvertently verify their own uploads; and third, zero real-time visibility into which single deficit area might disqualify the entire program.", False, False, DARK)],
        [("To resolve this, this study designed, implemented, and evaluated a ", False, False, DARK),
         ("Web-Based Accreditation Management and Readiness Assessment System", True, False, NAVY),
         (", piloted on the Bachelor of Science in Computer Science program under the College of Information and Communications Technology.", False, False, DARK)],
        [("Our solution delivers four interconnected technical capabilities:", True, False, DARK)],
        [("1. A Centralized Evidence Repository", True, False, DARK), (" with text-layer PDF metadata extraction and automated five-year recency validation.", False, False, DARK)],
        [("2. Database-Enforced Separation of Duties", True, False, DARK), (" via PostgreSQL Row-Level Security, preventing uploaders from verifying their own submissions while preserving an audited administrative override for the QA Officer.", False, False, DARK)],
        [("3. An Executive 5x2 Command Dashboard and Isolated What-If Simulator", True, False, DARK), (" that computes weighted readiness scores using PACUCOA's 30-weight formula without altering live database records.", False, False, DARK)],
        [("4. A Four-Column Post-Visit Compliance Matrix", True, False, DARK), (" mapping opportunities for improvement to sub-numbered corrective actions and verified exhibits.", False, False, DARK)],
        [("When evaluated against the BSCS pilot archive, the system established an indicative baseline score of ", False, False, DARK),
         ("3.22 out of 5.00", True, False, GREEN),
         (", successfully highlighting critical documentary gaps below 3.00 in Laboratories, Research, and Student Services. By simulating the completion of ", False, False, DARK),
         ("10 targeted criteria", True, False, AMBER),
         (", the projected grand mean increased to ", False, False, DARK),
         ("3.57 (+0.35 gain)", True, False, GREEN),
         (", clearing all Level I floors while proving that five areas still require remediation before reaching full Level II readiness.", False, False, DARK)],
        [("Finally, an ISO/IEC 25010 software quality evaluation across 20 respondents—15 institutional stakeholders and 5 external IT professionals—yielded an overall grand mean of ", False, False, DARK),
         ("4.72 out of 5.00", True, False, NAVY),
         (", interpreted as ", False, False, DARK),
         ("Very Highly Acceptable", True, False, GREEN),
         (". Thank you, and I welcome your questions.\"", False, True, DARK)]
    ], border_color="102A4D", bg_color="F8FAFC")

    # ---------------------------------------------------------
    # SECTION 3: 5-MINUTE LIVE SYSTEM DEMO WALKTHROUGH
    # ---------------------------------------------------------
    h3 = doc.add_heading(level=1)
    h3.paragraph_format.space_before = Pt(8)
    h3.paragraph_format.space_after = Pt(4)
    r = h3.add_run("3. 5-MINUTE LIVE SOFTWARE DEMO WALKTHROUGH (SCREEN-BY-SCREEN)")
    r.bold = True
    r.font.color.rgb = NAVY
    r.font.size = Pt(13)

    demo_steps = [
        ("Step 1: Executive Dashboard (`/dashboard`)", 
         "Show the 5x2 Command Grid displaying all 10 PACUCOA Areas. Point out the Grand Weighted Mean (3.22 / 5.00), the PACUCOA Level I Qualified badge, and the visual amber/red indicators highlighting deficit areas (Area IV at 2.67, Area V at 2.73, Area VII at 1.30). Explain that weights sum to exactly 30.",
         "Say: 'The dashboard gives academic leaders instant visibility into program readiness. Notice how the weighted formula prevents false confidence by exposing the three areas currently below the 3.00 floor.'"),
        ("Step 2: Evidence Library & Verification Gate (`/evidence` & `/verification`)", 
         "Navigate to Evidence Library. Click on an exhibit to show the built-in PDF Preview and the 5-year recency check badge. Then navigate to Verification. Show a pending upload submitted by yourself: point out the disabled button and badge reading 'Cannot evaluate own upload'. Log in or switch to an Area Chair / QA Officer to show the active Approve/Reject buttons.",
         "Say: 'This demonstrates Separation of Duties enforced at both the UI and PostgreSQL Row-Level Security layers. An uploader cannot evaluate their own work; independent peer verification is mandatory.'"),
        ("Step 3: Isolated What-If Simulator (`/simulation`)", 
         "Open the Simulator. Demonstrate the Area Filter Pills (All Areas, Area IV, Area V, Area VII). Show the baseline starting at 3.22. Select the 10 target criteria (2 in Labs: IV.3, IV.7; 3 in Research: V.1, V.2, V.7; 5 in Student Services: VII.1 to VII.5). Show the projected score rise dynamically to 3.57 (+0.35 gain). Refresh the live Dashboard to prove that live database scores remained untouched (zero mutation).",
         "Say: 'The simulator acts as a decision-support sandbox. Leaders can model accreditation scenarios without contaminating live accreditation audit records.'"),
        ("Step 4: Post-Visit Compliance Matrix (`/recommendations`)", 
         "Navigate to Recommendations. Show the 4-column layout strictly replicating the CICT BSCS Compliance Report: Column 1: Opportunities for Improvement; Column 2: PACUCOA Recommendations; Column 3: Sub-Numbered Actions Taken (e.g., Action 1.1, 1.2); Column 4: Linked Verification Exhibits with instant preview modals.",
         "Say: 'This directly bridges past visit findings with upcoming resurvey preparations, ensuring no accreditor recommendation is lost between visits.'")
    ]

    for title, action, script in demo_steps:
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(4)
        p.paragraph_format.space_after = Pt(1)
        r = p.add_run(title)
        r.bold = True
        r.font.size = Pt(10)
        r.font.color.rgb = DARK

        p2 = doc.add_paragraph()
        p2.paragraph_format.space_before = Pt(0)
        p2.paragraph_format.space_after = Pt(2)
        r_act = p2.add_run("Action: ")
        r_act.bold = True
        r_act.font.size = Pt(9)
        r_act.font.color.rgb = SLATE
        r_act_text = p2.add_run(action + "\n")
        r_act_text.font.size = Pt(9)
        r_act_text.font.color.rgb = DARK
        
        r_sc = p2.add_run("Spoken Commentary: ")
        r_sc.bold = True
        r_sc.italic = True
        r_sc.font.size = Pt(9)
        r_sc.font.color.rgb = AMBER
        r_sc_text = p2.add_run(script)
        r_sc_text.italic = True
        r_sc_text.font.size = Pt(9)
        r_sc_text.font.color.rgb = DARK

    # ---------------------------------------------------------
    # SECTION 4: TOP 10 HIGH-STAKES DEFENSE QUESTIONS & ANSWERS
    # ---------------------------------------------------------
    doc.add_page_break()
    h4 = doc.add_heading(level=1)
    h4.paragraph_format.space_before = Pt(6)
    h4.paragraph_format.space_after = Pt(4)
    r = h4.add_run("4. TOP 10 HIGH-STAKES DEFENSE QUESTIONS & KNOCKOUT ANSWERS")
    r.bold = True
    r.font.color.rgb = NAVY
    r.font.size = Pt(13)

    qas = [
        ("Q1: Does your 3.57 simulation score mean BSCS is fully ready for Level II Reaccreditation?",
         "PANELIST TRAP: Testing if you understand the Dual-Constraint rule or if you overclaim Level II.",
         "FACT: Level II requires an overall score of >=3.50 AND every single Area >=3.50. In our simulation, overall is 3.57, but 5 Areas (I, III, IV, VI, VII) remain below 3.50.",
         "SPOKEN ANSWER: 'No, panelist. Under PACUCOA's dual-constraint threshold, reaching an overall score of 3.57 clears the composite requirement and all 3.00 Level I floors, but it does NOT achieve full Level II status because five areas still sit below the 3.50 Level II floor. This proves the system's value: it prevents false optimism by pinpointing exactly which five areas still require documentary upgrades.'"),
        
        ("Q2: In Chapter IV, your simulation jumps from 3.22 to 3.57 (+0.35). How was this calculated?",
         "PANELIST TRAP: Verifying the math and checking for hardcoded simulation results.",
         "FACT: Exactly 10 criteria were simulated to benchmark standard (4.00): 2 in Area IV (Labs), 3 in Area V (Research), and 5 in Area VII (Student Services). Area IV gained +0.73 (weight 3), Area V gained +0.89 (weight 3), Area VII gained +2.00 (weight 3). Total weighted points = (0.73*3 + 0.89*3 + 2.00*3) = 10.86. Divided by 30 weights = +0.35. Baseline 3.22 + 0.35 = 3.57.",
         "SPOKEN ANSWER: 'The simulation targets 10 deficient criteria across three areas: 2 in Laboratories, 3 in Research, and 5 in Student Services. In Laboratories, raising two criteria adds 0.73 to the area mean; in Research, three criteria add 0.89; and in Student Services, five criteria add 2.00. Multiplied by their respective weights of 3 and divided by the total divisor of 30, this contributes exactly +0.35 to the grand weighted mean, moving it from 3.22 to 3.57.'"),

        ("Q3: How does your system prevent self-evaluation, and who can override it?",
         "PANELIST TRAP: Probing the depth of Separation of Duties (is it just UI-level or database-level?).",
         "FACT: Enforced at two layers: UI disables buttons (`uploader_id === current_user.id`), and PostgreSQL Row-Level Security rejects verification queries if `auth.uid() = uploader_id`. The institutional QA Officer holds an audited override under university policy.",
         "SPOKEN ANSWER: 'Separation of duties is enforced at two distinct architectural levels: in the Next.js presentation layer, the verification button is disabled with an explanatory tooltip, and at the PostgreSQL database layer via Row-Level Security, an UPDATE query fails if `uploader_id` matches the session user. Only the designated QA Officer possesses an administrative override, and all verification actions are permanently recorded in the audit log.'"),

        ("Q4: Why does the system use private storage buckets and signed URLs instead of public links?",
         "PANELIST TRAP: Probing adherence to RA 10173 (Data Privacy Act) and evidence confidentiality.",
         "FACT: Accreditation exhibits contain sensitive institutional records (faculty contracts, syllabi, student records). Private buckets prevent direct public URL access; access requires an authenticated API call generating a time-limited signed token.",
         "SPOKEN ANSWER: 'Accreditation documents contain sensitive institutional assets and personnel credentials governed by RA 10173. Public storage URLs are strictly prohibited. Our architecture stores documents in private Supabase buckets, and users can only inspect documents through authenticated API endpoints that issue time-limited signed URLs that expire automatically.'"),

        ("Q5: Are the 79 criteria in your database official PACUCOA criteria or custom items?",
         "PANELIST TRAP: Catching you claiming the 79 items represent the entire PACUCOA manual.",
         "FACT: The 10 Evaluative Areas, 30-weight distribution, and passing floors follow the 2023 PACUCOA Manual. The 79 leaf criteria for this BSCS pilot were mapped directly from CICT's official PACUCOA Post-Visit Compliance Report.",
         "SPOKEN ANSWER: 'The architectural framework—the ten evaluative areas, the equivalent weights summing to 30, and the dual-constraint floor rules—comes directly from the official PACUCOA Manual. For our BSCS pilot, the 79 criteria correspond to the specific exhibit requirements and recommendations codified in CICT's official PACUCOA compliance report, and the system is designed to encode full multi-level Self-Survey Instruments for other programs.'"),

        ("Q6: How can a document counting formula (Verified / Required) measure true quality?",
         "PANELIST TRAP: Claiming software replaces human evaluators and qualitative judgments.",
         "FACT: The system calculates an *indicative documentary readiness rating*, not a qualitative rating. It answers whether the program has the required verified proofs in place before human accreditors arrive.",
         "SPOKEN ANSWER: 'The system does not claim to replace qualitative human judgment or accreditor evaluations. It computes an indicative documentary readiness rating based on the verified completeness and currency of required exhibits. In accreditation, if a program lacks documented proof, accreditors cannot award points; our system ensures 100% evidentiary readiness so the faculty committee can present a complete, verified portfolio.'"),

        ("Q7: In your manuscript, you state Level I is valid for 4 years. PACUCOA states 3 years. Which is it?",
         "PANELIST TRAP: Checking institutional regulations knowledge and honesty when caught on a typo.",
         "FACT: Official PACUCOA/FAAP guidelines grant Level I accreditation for 3 years (September 2026 to September 2029). The '4-year' mention reflected CICT's internal 2026-2030 strategic plan horizon.",
         "SPOKEN ANSWER: 'Under official PACUCOA and FAAP regulations, Level I formal accreditation carries a validity period of three years, which places the formal expiration in September 2029. The four-year horizon in our discussion reflected CICT's internal preparation timeline toward 2030. I acknowledge this clerical nuance, and I will ensure the final manuscript explicitly states the official three-year PACUCOA validity period.'"),

        ("Q8: You evaluated the system with only 20 respondents. Is this sample scientifically valid?",
         "PANELIST TRAP: Challenging the statistical validity of N=20 under ISO/IEC 25010.",
         "FACT: Purposive sampling is standard for specialized enterprise platforms. The population of actual accreditation actors at CICT is small (15 staff members including Dean, QA, Program Head, Faculty), paired with 5 external IT experts as an objective control.",
         "SPOKEN ANSWER: 'Purposive sampling was deliberate and methodologically appropriate because accreditation operations are confined to specialized committee roles. Our 20 respondents comprised 100% of CICT's active accreditation committee—including the Dean, QA Officer, Program Head, and Area Chairs—triangulated by 5 external senior software engineers. The 4.72 composite mean reflects authentic operational and technical validation.'"),

        ("Q9: Your title page lists SUNN, but the locale is STI West Negros University. Why the dual affiliation?",
         "PANELIST TRAP: Confusion over candidate degree institution vs. research locale.",
         "FACT: Engr. Clyde Taburada is a Master in Information Technology candidate at State University of Northern Negros (SUNN). STI WNU is the industry/institutional partner where the capstone was implemented and piloted.",
         "SPOKEN ANSWER: 'I am presenting this capstone in partial fulfillment of the Master in Information Technology degree at the State University of Northern Negros (SUNN). STI West Negros University served as the approved institutional partner and client locale where the software was researched, deployed, and piloted under formal institutional authorization.'"),

        ("Q10: Why does What-If Simulation run in memory rather than creating temporary database rows?",
         "PANELIST TRAP: Probing database architecture and data integrity during what-if projections.",
         "FACT: Running simulation client-side / in-memory ensures zero risk of database pollution, avoids database locking or race conditions, and guarantees that live audit logs and verified ratings remain immutable.",
         "SPOKEN ANSWER: 'The simulation engine is deliberately designed as a non-mutating, in-memory sandbox. If simulation created temporary database records, an unhandled crash or concurrent user query could corrupt official readiness ratings or pollute audit trails. Executing calculations in a pure functional pipeline guarantees complete data integrity while delivering instantaneous projections.'")
    ]

    for q, trap, fact, ans in qas:
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(6)
        p.paragraph_format.space_after = Pt(2)
        r = p.add_run(q)
        r.bold = True
        r.font.size = Pt(10)
        r.font.color.rgb = NAVY

        add_callout([
            [("Trap: ", True, False, RED), (trap, False, False, DARK)],
            [("Manuscript/Code Reality: ", True, False, SLATE), (fact, False, False, DARK)],
            [("KNOCKOUT ANSWER: ", True, False, GREEN), (ans, False, True, DARK)]
        ], border_color="102A4D", bg_color="F8FAFC")

    # ---------------------------------------------------------
    # SECTION 5: DEFENSE RED-LINE TRAPS ("NEVER SAY" LIST)
    # ---------------------------------------------------------
    doc.add_page_break()
    h5 = doc.add_heading(level=1)
    h5.paragraph_format.space_before = Pt(6)
    h5.paragraph_format.space_after = Pt(4)
    r = h5.add_run("5. DEFENSE RED-LINE TRAPS: THE 'NEVER SAY' LIST")
    r.bold = True
    r.font.color.rgb = NAVY
    r.font.size = Pt(13)

    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(2)
    p.paragraph_format.space_after = Pt(4)
    r = p.add_run("Avoid these 8 catastrophic phrasing mistakes that trigger intense panel cross-examination:")
    r.font.size = Pt(9.5)
    r.font.color.rgb = DARK

    table2 = doc.add_table(rows=9, cols=3)
    table2.alignment = WD_TABLE_ALIGNMENT.CENTER
    table2.autofit = False
    set_table_borders(table2)

    headers2 = ["Fatal Phrase (NEVER SAY)", "Why It Will Destroy You", "Safe Academic Phrase (SAY INSTEAD)"]
    widths2 = [Inches(2.1), Inches(2.2), Inches(2.8)]

    for col_idx, text in enumerate(headers2):
        cell = table2.cell(0, col_idx)
        cell.width = widths2[col_idx]
        set_cell_background(cell, "B91C1C" if col_idx == 0 else ("102A4D" if col_idx == 2 else "475569"))
        set_cell_margins(cell, top=80, bottom=80, left=80, right=80)
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER if col_idx < 2 else WD_ALIGN_PARAGRAPH.LEFT
        run = p.add_run(text)
        run.bold = True
        run.font.size = Pt(8.5)
        run.font.color.rgb = RGBColor(255, 255, 255)

    traps_data = [
        ("\"Our simulation makes BSCS fully Level II ready.\"", 
         "Five areas are still below the 3.50 Level II floor! You would be violating PACUCOA's dual-constraint rule.",
         "\"The simulation clears all 3.00 Level I floors and reaches a 3.57 composite mean, while showing that five areas still require remediation before reaching Level II.\""),
        
        ("\"The 79 criteria in our database are the official PACUCOA criteria.\"",
         "The full PACUCOA manual has hundreds of SSI items. The 79 items were extracted from CICT's specific compliance report.",
         "\"The 10 areas and weights follow the PACUCOA manual, while the 79 pilot criteria represent the compliance exhibit items for the BSCS program.\""),

        ("\"The system predicts the official grade accreditors will give.\"",
         "Software measures document presence; human accreditors evaluate instruction quality and qualitative outcomes.",
         "\"The system calculates an internal indicative documentary readiness score to ensure complete evidence before human accreditors visit.\""),

        ("\"BSCS passed Level I using my software.\"",
         "BSCS received Level I in September 2026; the software was piloted in October 2026 using retrospective data.",
         "\"The system was piloted using BSCS's real compliance archives to establish a digital baseline for upcoming reaccreditation.\""),

        ("\"Our audit log is cryptographically tamper-proof.\"",
         "It is an append-only PostgreSQL table with RLS, not a blockchain or SHA-256 hash-chained tree.",
         "\"The audit log is an append-only PostgreSQL table secured by RLS policies that omit UPDATE and DELETE privileges for client roles.\""),

        ("\"The software completely eliminates human error.\"",
         "You did not conduct an error-rate experiment; two colluding staff could still verify poor documents.",
         "\"The system enforces structural checks and separation of duties, removing manual formula calculation errors from accreditation tracking.\""),

        ("\"Nobody can ever verify their own upload.\"",
         "The QA Officer role has a documented administrative override to resolve deadlocks.",
         "\"Faculty and Area Chairs are strictly prevented from self-verification, while the institutional QA Officer holds an audited override.\""),

        ("\"Our survey was 100% anonymous.\"",
         "Table 7 identifies 1 Dean and 1 QA Officer; they could easily be identified from role demographic tags.",
         "\"Survey data was collected without personal names and evaluated strictly as aggregated cohort statistics (n=15 and n=5).\"")
    ]

    for row_idx, row in enumerate(traps_data, start=1):
        for col_idx, val in enumerate(row):
            cell = table2.cell(row_idx, col_idx)
            cell.width = widths2[col_idx]
            if row_idx % 2 == 1:
                set_cell_background(cell, "F8FAFC")
            set_cell_margins(cell, top=60, bottom=60, left=80, right=80)
            p = cell.paragraphs[0]
            p.alignment = WD_ALIGN_PARAGRAPH.LEFT
            run = p.add_run(val)
            run.font.size = Pt(8.5)
            if col_idx == 0:
                run.bold = True
                run.font.color.rgb = RED
            elif col_idx == 2:
                run.font.color.rgb = DARK
            else:
                run.font.color.rgb = SLATE

    # ---------------------------------------------------------
    # SECTION 6: PANELIST PERSONAS & DEFENSE PSYCHOLOGY
    # ---------------------------------------------------------
    h6 = doc.add_heading(level=1)
    h6.paragraph_format.space_before = Pt(8)
    h6.paragraph_format.space_after = Pt(4)
    r = h6.add_run("6. PANELIST PERSONA & PSYCHOLOGY MATRIX")
    r.bold = True
    r.font.color.rgb = NAVY
    r.font.size = Pt(13)

    personas = [
        ("PANELIST A: THE GENERALIST / OUTSIDER", "Focuses on clarity, plain English, and practical institutional value.",
         "• Wants simple explanations without overly dense technical jargon.\n• Checks if acronyms (PACUCOA, RLS, BaaS, FAAP, CHED) are clearly understood.\n• Winning Tactic: Use real-world analogies: 'Like an internal dress-rehearsal audit before external inspectors arrive.'"),
        ("PANELIST B: THE ACCREDITATION / QA EXPERT", "Focuses on PACUCOA manual rules, compliance matrices, and validity periods.",
         "• Checks the 30-weight distribution (Instruction = 4, Physical Plant = 2, others = 3).\n• Tests your understanding of the Dual-Constraint Floor Rule.\n• Winning Tactic: Speak PACUCOA language fluently: cite 'Level I Area floor of 3.00', 'Four-column compliance matrix', and 'sub-numbered corrective actions'."),
        ("PANELIST C: THE TECHNICAL / SOFTWARE SPECIALIST", "Focuses on Next.js, Supabase, database schema, security, and algorithms.",
         "• Inquires about Row-Level Security, JWT claims, and how What-If simulation avoids database mutation.\n• Checks ISO/IEC 25010 metrics (Functional Suitability, Security, Maintainability).\n• Winning Tactic: Emphasize relational data integrity, client-side sandbox isolation, and database-enforced separation of duties.")
    ]

    for title, role, desc in personas:
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(4)
        p.paragraph_format.space_after = Pt(1)
        r = p.add_run(title)
        r.bold = True
        r.font.size = Pt(10)
        r.font.color.rgb = NAVY

        add_callout([
            [("Profile: ", True, False, SLATE), (role, False, False, DARK)],
            [("Key Defense Strategy:\n", True, False, AMBER), (desc, False, False, DARK)]
        ], border_color="B45309", bg_color="FFFBEB")

    # Final Sign-off Box
    add_callout([
        [("DEFENSE READINESS SUMMARY: ", True, False, GREEN),
         ("You know your system, your code, and your manuscript better than anyone in the room. Keep your answers concise (3 to 4 sentences maximum), never guess or argue, acknowledge minor editorial points graciously, and guide the panel to the live demonstration. You are completely ready to defend and pass with distinction!", False, False, DARK)]
    ], border_color="15803D", bg_color="F0FDF4")

    # Save to file
    output_path = "c:\\Users\\Acer\\Desktop\\ACCREDITATION SYSTEM\\ORAL_DEFENSE_PANEL_SIMULATOR_GUIDE.docx"
    doc.save(output_path)
    print(f"SUCCESS: Saved concise defense guide to {output_path}")

if __name__ == "__main__":
    build_guide()


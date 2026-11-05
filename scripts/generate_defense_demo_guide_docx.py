import os
import docx
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import qn, nsdecls

def set_cell_background(cell, hex_color):
    tcPr = cell._element.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{hex_color}"/>')
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

def add_callout(doc, text, bold_prefix="", title=None, border_color="102A4D", bg_color="F1F5F9"):
    tbl = doc.add_table(rows=1, cols=1)
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    cell = tbl.cell(0, 0)
    set_cell_background(cell, bg_color)
    set_cell_margins(cell, top=120, bottom=120, left=180, right=180)
    
    # Left border only
    tcPr = cell._element.get_or_add_tcPr()
    tcBorders = parse_xml(
        f'<w:tcBorders {nsdecls("w")}>'
        f'<w:top w:val="none"/>'
        f'<w:left w:val="single" w:sz="36" w:space="0" w:color="{border_color}"/>'
        f'<w:bottom w:val="none"/>'
        f'<w:right w:val="none"/>'
        f'</w:tcBorders>'
    )
    tcPr.append(tcBorders)
    
    p = cell.paragraphs[0]
    p.paragraph_format.space_before = Pt(3)
    p.paragraph_format.space_after = Pt(3)
    p.paragraph_format.line_spacing = 1.15
    
    if title:
        run_title = p.add_run(f"{title}\n")
        run_title.font.name = "Arial"
        run_title.font.size = Pt(10.5)
        run_title.font.bold = True
        run_title.font.color.rgb = RGBColor(16, 42, 77)
        
    if bold_prefix:
        run_bold = p.add_run(bold_prefix + " ")
        run_bold.font.name = "Arial"
        run_bold.font.size = Pt(10)
        run_bold.font.bold = True
        run_bold.font.color.rgb = RGBColor(16, 42, 77)
        
    run_text = p.add_run(text)
    run_text.font.name = "Arial"
    run_text.font.size = Pt(10)
    run_text.font.color.rgb = RGBColor(30, 41, 59)
    
    # Add spacing after table
    sp = doc.add_paragraph()
    sp.paragraph_format.space_before = Pt(0)
    sp.paragraph_format.space_after = Pt(4)

def build_docx():
    doc = Document()
    
    # Margins
    for s in doc.sections:
        s.top_margin = Inches(1.0)
        s.bottom_margin = Inches(1.0)
        s.left_margin = Inches(1.0)
        s.right_margin = Inches(1.0)
        
    NAVY = RGBColor(16, 42, 77)
    GOLD = RGBColor(180, 130, 20)
    SLATE = RGBColor(71, 85, 105)
    DARK = RGBColor(30, 41, 59)
    
    # Header
    p_header = doc.add_paragraph()
    p_header.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_header.paragraph_format.space_before = Pt(0)
    p_header.paragraph_format.space_after = Pt(2)
    r1 = p_header.add_run("STI WEST NEGROS UNIVERSITY\nCOLLEGE OF INFORMATION AND COMMUNICATIONS TECHNOLOGY\nMASTER IN INFORMATION TECHNOLOGY")
    r1.font.name = "Arial"
    r1.font.size = Pt(10)
    r1.font.bold = True
    r1.font.color.rgb = SLATE
    
    # Title
    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_title.paragraph_format.space_before = Pt(12)
    p_title.paragraph_format.space_after = Pt(4)
    r_title = p_title.add_run("FINAL ORAL DEFENSE LIVE DEMONSTRATION GUIDE")
    r_title.font.name = "Arial"
    r_title.font.size = Pt(17)
    r_title.font.bold = True
    r_title.font.color.rgb = NAVY
    
    # Subtitle
    p_sub = doc.add_paragraph()
    p_sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_sub.paragraph_format.space_before = Pt(0)
    p_sub.paragraph_format.space_after = Pt(16)
    r_sub = p_sub.add_run("Step-by-Step Defense Walkthrough, Master Accounts, Live Scoring Formulas & Panel Q&A Script")
    r_sub.font.name = "Arial"
    r_sub.font.size = Pt(10.5)
    r_sub.font.italic = True
    r_sub.font.color.rgb = SLATE
    
    # Section 1
    h1 = doc.add_heading(level=1)
    r_h1 = h1.add_run("1. Master Defense Credentials Matrix")
    r_h1.font.name = "Arial"
    r_h1.font.size = Pt(13)
    r_h1.font.bold = True
    r_h1.font.color.rgb = NAVY
    h1.paragraph_format.space_before = Pt(14)
    h1.paragraph_format.space_after = Pt(6)
    
    add_callout(
        doc,
        "All authenticated demonstration accounts across every administrative, academic, and observer role use the universal defense password: password123. If network drops occur, an offline mock fallback automatically signs in seamlessly.",
        bold_prefix="Universal Defense Password:",
        border_color="D4A017",
        bg_color="FEF9C3"
    )
    
    # Table of Accounts
    accounts_data = [
        ("System Administrator", "admin@sti.edu", "password123", "Institutional Scope", "Multi-college registry, department & program creation, role security"),
        ("QA Director\n(Dr. Maria Santos)", "qa@sti.edu", "password123", "Quality Assurance Office", "PACUCOA 10 Areas governance, program scoping (BSCS vs BSP), cycle certification"),
        ("College Dean\n(Dr. Roberto Gomez)", "dean.cict@sti.edu", "password123", "College of ICT (CICT)", "Executive cross-program comparison, high-level institutional analytics"),
        ("Program Head\n(Engr. Clyde Taburada)", "head.bscs@sti.edu", "password123", "BS Computer Science", "Must-view verification, live score recomputation, What-If Simulation"),
        ("Faculty / Area I Chair\n(Prof. Sarah Jenkins)", "faculty.chair@sti.edu\n(or member1@sti.edu)", "password123", "BSCS (Area I)", "Decentralized exhibit uploads, automated OCR recency inspection"),
        ("Observer Stakeholders\n(Student & Alumni Reps)", "student@sti.edu\nalumni@sti.edu", "password123", "Stakeholder Reps", "External audit compliance and multi-stakeholder participation")
    ]
    
    tbl = doc.add_table(rows=len(accounts_data) + 1, cols=5)
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    headers = ["Persona & Academic Role", "Email Address", "Password", "Department / Scope", "Defense Function"]
    hdr_widths = [Inches(1.5), Inches(1.4), Inches(0.9), Inches(1.3), Inches(1.9)]
    
    for c_idx, title in enumerate(headers):
        cell = tbl.cell(0, c_idx)
        set_cell_background(cell, "102A4D")
        set_cell_margins(cell, top=100, bottom=100, left=100, right=100)
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.paragraph_format.space_before = Pt(2)
        p.paragraph_format.space_after = Pt(2)
        r = p.add_run(title)
        r.font.name = "Arial"
        r.font.size = Pt(9)
        r.font.bold = True
        r.font.color.rgb = RGBColor(255, 255, 255)
        
    for r_idx, row in enumerate(accounts_data, start=1):
        bg = "F8FAFC" if r_idx % 2 == 1 else "FFFFFF"
        for c_idx, val in enumerate(row):
            cell = tbl.cell(r_idx, c_idx)
            set_cell_background(cell, bg)
            set_cell_margins(cell, top=80, bottom=80, left=100, right=100)
            p = cell.paragraphs[0]
            p.paragraph_format.space_before = Pt(2)
            p.paragraph_format.space_after = Pt(2)
            p.paragraph_format.line_spacing = 1.15
            r = p.add_run(val)
            r.font.name = "Arial"
            r.font.size = Pt(8.5)
            r.font.color.rgb = DARK
            if c_idx == 0:
                r.font.bold = True
                
    sp = doc.add_paragraph()
    sp.paragraph_format.space_before = Pt(0)
    sp.paragraph_format.space_after = Pt(6)
    
    # Section 2: Browser Setup
    h2 = doc.add_heading(level=1)
    r_h2 = h2.add_run("2. Pre-Defense Strategic Setup: Multi-Browser Window Technique")
    r_h2.font.name = "Arial"
    r_h2.font.size = Pt(13)
    r_h2.font.bold = True
    r_h2.font.color.rgb = NAVY
    h2.paragraph_format.space_before = Pt(14)
    h2.paragraph_format.space_after = Pt(6)
    
    add_callout(
        doc,
        "To deliver a smooth, continuous live defense without logging out repeatedly in front of the panel, arrange two browser windows side-by-side:\n\n"
        "• Window A (Standard Browser): Logged in as Program Head (head.bscs@sti.edu) or QA Director (qa@sti.edu). Displays the Executive Dashboard (/dashboard), Criteria Management (/criteria), and What-If Simulation (/simulation).\n"
        "• Window B (Incognito / Guest Mode): Logged in as Faculty Member (faculty.chair@sti.edu). Displays the Evidence Library (/evidence).\n\n"
        "Strategic Value: When you upload an exhibit in Window B and approve it in Window A, you immediately demonstrate real-time scoring updates to the panel without awkward re-logins.",
        title="DUAL-WINDOW PRESENTATION STRATEGY",
        border_color="102A4D",
        bg_color="F1F5F9"
    )
    
    # Section 3: 6-Act Demonstration Flow
    h3 = doc.add_heading(level=1)
    r_h3 = h3.add_run("3. The 6-Act Chronological Live Defense Demo Script")
    r_h3.font.name = "Arial"
    r_h3.font.size = Pt(13)
    r_h3.font.bold = True
    r_h3.font.color.rgb = NAVY
    h3.paragraph_format.space_before = Pt(14)
    h3.paragraph_format.space_after = Pt(6)
    
    acts = [
        {
            "num": "ACT 1",
            "title": "System Foundation & Multi-Program Registry",
            "account": "admin@sti.edu",
            "route": "/admin/programs & /admin/users",
            "time": "45 to 60 seconds",
            "steps": [
                "Sign in using admin@sti.edu with password password123.",
                "Navigate to Academic Registry (/admin/programs) from the left sidebar.",
                "Display the College of Information and Communications Technology (CICT) housing BSCS and BSIT.",
                "Highlight the newly integrated College of Arts and Sciences (CAS) housing Bachelor of Science in Psychology (BSP).",
                "Navigate to User Accounts (/admin/users) to demonstrate Role-Based Access Control (RBAC) preventing unauthorized cross-department data tampering."
            ],
            "speech": "Good morning, respected members of the panel. Institutional accreditation in higher education is not restricted to a single discipline. A major defect of legacy software is rigid, hardcoded single-department architecture. Our platform is built on an enterprise multi-department framework: CICT computing programs and CAS psychology programs operate concurrently within the same portal while maintaining strict data isolation."
        },
        {
            "num": "ACT 2",
            "title": "Standards-Based Criteria Management & Program Adaptation",
            "account": "qa@sti.edu",
            "route": "/criteria (Criteria Management)",
            "time": "75 to 90 seconds",
            "steps": [
                "Sign in as Dr. Maria Santos (qa@sti.edu).",
                "Open Criteria (/criteria) to show the 10 PACUCOA Areas with generalized expected exhibits.",
                "Demonstrate the Program Scope Selector at the top right of the table.",
                "Switch to BSCS (all criteria active), then switch to BSP (Psychology).",
                "Click the Eye Toggle ('Set N/A') on a technical criterion to mark it Not Applicable for BSP.",
                "Emphasize that marking it N/A for BSP leaves BSCS and BSIT completely unaffected.",
                "Click the Delete (Trash) button on a shared criterion to trigger the Deletion Safeguard Warning Modal, explaining how institutional baselines are protected against accidental loss."
            ],
            "speech": "While PACUCOA Area standards are institution-wide, specific operational criteria differ across academic fields—for instance, computing laboratories versus psychology clinical observation rooms. Rather than creating disjointed duplicate databases, we implemented Non-Destructive Program Scoping. Individual programs can mark criteria as Not Applicable without altering the institutional standard or corrupting historic audit baselines."
        },
        {
            "num": "ACT 3",
            "title": "Evidence Submission & Automated Quality Pre-Inspection",
            "account": "faculty.chair@sti.edu (or member1@sti.edu)",
            "route": "/evidence (Evidence Library)",
            "time": "60 to 75 seconds",
            "steps": [
                "Switch to Window B (Incognito) logged in as Prof. Sarah Jenkins (faculty.chair@sti.edu).",
                "Navigate to Evidence Library (/evidence).",
                "Click Upload Evidence for an Area I criterion (e.g., PEO Development Minutes or Vision-Mission Dissemination).",
                "Select a sample PDF compliance exhibit.",
                "Demonstrate the Automated Metadata & Recency Extraction engine:",
                "  • Temporal verification flags exhibits older than PACUCOA's 3-to-5-year recency threshold.",
                "  • Document type matching validates whether the artifact matches expected exhibit specifications.",
                "Submit the document: observe the instantaneous transition to 'Pending Verification'."
            ],
            "speech": "One of the most frequent reasons academic programs lose accreditation points during on-site surveys is the accidental submission of obsolete or mismatched exhibits. Our system serves as the first line of defense: automated optical and temporal verification validates document recency and metadata alignment before an evaluator ever dedicates review time."
        },
        {
            "num": "ACT 4",
            "title": "Review Enforcement & Live Scoring Engine",
            "account": "head.bscs@sti.edu (Engr. Clyde Taburada)",
            "route": "/verification -> /dashboard",
            "time": "90 seconds",
            "steps": [
                "Switch back to Window A logged in as BSCS Program Head (head.bscs@sti.edu).",
                "Open Review & Approve (/verification) to view the pending queue.",
                "Attempt to approve the newly submitted exhibit immediately: point out the Must-View Safeguard (the Approve button is locked until the reviewer inspects the file).",
                "Click View Document, preview the file in the embedded Document Viewer, and click Approve / Verify.",
                "Navigate directly to Dashboard (/dashboard):",
                "  • Show Area I Mean recalculating in real time.",
                "  • Show the Weighted Grand Mean automatically updating to reflect newly verified exhibits."
            ],
            "speech": "Accreditation readiness cannot rely on arbitrary estimates or rubber-stamped approvals. First, our platform enforces mandatory document inspection before an approval button is unlocked. Second, verified exhibits immediately feed into our mathematical scoring engine, dynamically recomputing Area Means and the Weighted Grand Mean with zero manual calculation error."
        },
        {
            "num": "ACT 5",
            "title": "What-If Simulation Module (Flagship Decision Support)",
            "account": "head.bscs@sti.edu (or dean.cict@sti.edu)",
            "route": "/simulation (What-If Simulation)",
            "time": "90 seconds",
            "steps": [
                "Open What-If Simulation (/simulation) from the navigation sidebar.",
                "Review the current baseline status (e.g., Level I Ready or Candidate Status).",
                "Examine the list of Unresolved Criteria (criteria flagged as Weak or No Evidence).",
                "Check 2 or 3 criteria in deficient areas (such as Area II Faculty or Area X Research).",
                "Click Calculate Projected Readiness:",
                "  • Projected area radar and bar charts update instantly.",
                "  • The Projected Grand Mean rises dynamically.",
                "  • The readiness badge transitions in real time to Level II Ready.",
                "Click Reset Simulation to prove that experimental modeling never alters actual certified evidence."
            ],
            "speech": "Legacy accreditation software is purely descriptive—it shows you what is already submitted. Our What-If Simulation elevates the platform into a prescriptive Decision Support System. Deans and Program Heads can model targeted intervention scenarios to identify the exact minimum operational requirements needed to secure Level II status, optimizing faculty allocation and budgetary resources."
        },
        {
            "num": "ACT 6",
            "title": "Recommendations, Institutional Audit & Final Certification",
            "account": "qa@sti.edu (or dean.cict@sti.edu)",
            "route": "/recommendations & /audit-log",
            "time": "60 seconds",
            "steps": [
                "Navigate to Recommendations (/recommendations):",
                "  • Demonstrate how previous PACUCOA survey recommendations are tracked area-by-area.",
                "  • Show how compliance actions link directly to evidentiary exhibits.",
                "Demonstrate Cycle Certification:",
                "  • Display the institutional readiness seal and formal certification freeze.",
                "Open Audit Trail (/audit-log):",
                "  • Review the tamper-evident chronological log of every upload, verification, exclusion toggle, and score calculation with user attribution and ISO timestamps."
            ],
            "speech": "To conclude our live walkthrough: institutional defensibility requires absolute audit provenance. Every single file upload, evaluator decision, and criterion modification is cryptographically recorded in an immutable audit trail. When external PACUCOA accreditors arrive at STI West Negros University, the institution can substantiate every rating with complete transparency."
        }
    ]
    
    for act in acts:
        p_act = doc.add_paragraph()
        p_act.paragraph_format.space_before = Pt(10)
        p_act.paragraph_format.space_after = Pt(2)
        r_num = p_act.add_run(f"{act['num']}: {act['title']}")
        r_num.font.name = "Arial"
        r_num.font.size = Pt(11.5)
        r_num.font.bold = True
        r_num.font.color.rgb = NAVY
        
        # Meta info
        p_meta = doc.add_paragraph()
        p_meta.paragraph_format.space_before = Pt(0)
        p_meta.paragraph_format.space_after = Pt(4)
        r_m = p_meta.add_run(f"Account: {act['account']}  |  Route: {act['route']}  |  Duration: {act['time']}")
        r_m.font.name = "Arial"
        r_m.font.size = Pt(9)
        r_m.font.bold = True
        r_m.font.color.rgb = GOLD
        
        # Steps
        for step in act['steps']:
            p_s = doc.add_paragraph()
            p_s.paragraph_format.space_before = Pt(1)
            p_s.paragraph_format.space_after = Pt(1)
            p_s.paragraph_format.left_indent = Inches(0.2)
            p_s.paragraph_format.line_spacing = 1.15
            r_dot = p_s.add_run("▸ ")
            r_dot.font.name = "Arial"
            r_dot.font.size = Pt(9.5)
            r_dot.font.bold = True
            r_dot.font.color.rgb = NAVY
            r_text = p_s.add_run(step)
            r_text.font.name = "Arial"
            r_text.font.size = Pt(9.5)
            r_text.font.color.rgb = DARK
            
        # Script Callout
        add_callout(
            doc,
            f'"{act["speech"]}"',
            bold_prefix="Defensive Speech / Talking Point:",
            border_color="D4A017",
            bg_color="FEFCE8"
        )
        
    # Section 4: Mathematical Scoring Engine
    h4 = doc.add_heading(level=1)
    r_h4 = h4.add_run("4. Mathematical Rigor & Academic Scoring Formulation")
    r_h4.font.name = "Arial"
    r_h4.font.size = Pt(13)
    r_h4.font.bold = True
    r_h4.font.color.rgb = NAVY
    h4.paragraph_format.space_before = Pt(14)
    h4.paragraph_format.space_after = Pt(6)
    
    add_callout(
        doc,
        "Formula 1 — Criterion Piecewise Score (S):\n"
        "• S = 0.00                                   if Verified Exhibits (V) = 0\n"
        "• S = max(1, round(2 * (V / R)))             if 0 < V < Required Exhibits (R)\n"
        "• S = 3 + 2 * ((V / R) - 1)                  if V >= R (capped at 5.00)\n\n"
        "Formula 2 — Weighted Grand Mean:\n"
        "• Grand Mean = [ SUM( Area_Mean_i * Weight_i ) ] / [ SUM( Weight_i ) ] = SUM( Area_Mean_i * Weight_i ) / 30\n\n"
        "Formula 3 — PACUCOA Dual-Constraint Floor Rule:\n"
        "• Level I Readiness:  Grand Mean >= 3.00  AND  No Area Mean < 2.50\n"
        "• Level II Readiness: Grand Mean >= 3.50  AND  No Area Mean < 3.00\n\n"
        "Academic Defense Justification: Even if a program achieves an overall average of 4.10, if a single Area (such as Laboratories or Research) drops below the floor (e.g., 2.90), the system strictly reports that the program does not meet Level II criteria. This enforces objectivity and eliminates subjective bias.",
        title="MATHEMATICAL ACCREDITATION SPECIFICATION",
        border_color="102A4D",
        bg_color="F1F5F9"
    )
    
    # Section 5: Panel Q&A
    h5 = doc.add_heading(level=1)
    r_h5 = h5.add_run("5. Prepared Answers for Panel Defense Questions")
    r_h5.font.name = "Arial"
    r_h5.font.size = Pt(13)
    r_h5.font.bold = True
    r_h5.font.color.rgb = NAVY
    h5.paragraph_format.space_before = Pt(14)
    h5.paragraph_format.space_after = Pt(6)
    
    qas = [
        ("Question 1: How does your system prevent a Program Head or Chair from artificially inflating scores?",
         "The system enforces strict separation of duties and an automated scoring engine. Users do not input manual scores. All scores are computed server-side from verified exhibit ratios and strict dual-constraint floor logic. Furthermore, verification requires mandatory document preview, and every single change is logged permanently in the immutable audit trail."),
        ("Question 2: What happens if there is an unexpected internet outage during the live defense or an actual survey?",
         "The platform is engineered with architectural resilience: both authentication and data persistence incorporate graceful local mock fallbacks (auth-mock.ts and mock-data.ts). If the cloud Supabase database becomes temporarily unreachable, the application automatically transitions into local evaluation mode, ensuring zero crashes or disruption."),
        ("Question 3: Can this system be expanded to other academic departments like Nursing or Criminal Justice?",
         "Yes. We proved this capability during development by integrating the College of Arts and Sciences with BS Psychology alongside CICT. The core criteria library adheres to universal PACUCOA standards, and non-destructive Program Scoping allows any department head to toggle applicable or non-applicable criteria independently without altering source code.")
    ]
    
    for q, a in qas:
        p_q = doc.add_paragraph()
        p_q.paragraph_format.space_before = Pt(6)
        p_q.paragraph_format.space_after = Pt(2)
        r_q = p_q.add_run(q)
        r_q.font.name = "Arial"
        r_q.font.size = Pt(10)
        r_q.font.bold = True
        r_q.font.color.rgb = NAVY
        
        p_a = doc.add_paragraph()
        p_a.paragraph_format.space_before = Pt(0)
        p_a.paragraph_format.space_after = Pt(6)
        p_a.paragraph_format.left_indent = Inches(0.2)
        p_a.paragraph_format.line_spacing = 1.15
        r_a = p_a.add_run(f"Answer: {a}")
        r_a.font.name = "Arial"
        r_a.font.size = Pt(9.5)
        r_a.font.color.rgb = DARK
        
    # Section 6: Checklist
    h6 = doc.add_heading(level=1)
    r_h6 = h6.add_run("6. Final Defense Day Readiness Checklist")
    r_h6.font.name = "Arial"
    r_h6.font.size = Pt(13)
    r_h6.font.bold = True
    r_h6.font.color.rgb = NAVY
    h6.paragraph_format.space_before = Pt(14)
    h6.paragraph_format.space_after = Pt(6)
    
    checklist = [
        "Local Development Server: Verify Next.js is running cleanly on http://localhost:3000 via npm run dev.",
        "Browser Windows Arranged: Window A (Main) open to head.bscs@sti.edu; Window B (Incognito) open to faculty.chair@sti.edu.",
        "Universal Password Memorized: password123 for all roles.",
        "Test Evidence Ready: Sample compliance PDF documents prepared on the desktop for live demonstration upload.",
        "Git Repository Synced: All updates committed and pushed cleanly to GitHub (origin/main).",
        "Presentation Slides Preserved: PowerPoint presentation decks remain strictly untouched."
    ]
    
    for item in checklist:
        p_chk = doc.add_paragraph()
        p_chk.paragraph_format.space_before = Pt(2)
        p_chk.paragraph_format.space_after = Pt(2)
        p_chk.paragraph_format.left_indent = Inches(0.2)
        r_box = p_chk.add_run("☑  ")
        r_box.font.name = "Arial"
        r_box.font.size = Pt(10)
        r_box.font.bold = True
        r_box.font.color.rgb = GOLD
        r_c = p_chk.add_run(item)
        r_c.font.name = "Arial"
        r_c.font.size = Pt(9.5)
        r_c.font.color.rgb = DARK
        
    # Output file
    out_path = os.path.abspath("FINAL_DEFENSE_LIVE_DEMO_GUIDE.docx")
    doc.save(out_path)
    print("Saved successfully to:", out_path)

if __name__ == "__main__":
    build_docx()

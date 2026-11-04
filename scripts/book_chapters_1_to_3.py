import os
import docx
from docx.shared import Inches, Pt
from docx.enum.text import WD_ALIGN_PARAGRAPH

from book_builder_styles import (
    apply_font,
    add_major_section_heading,
    add_heading,
    add_subheading,
    add_body_p,
    add_bullet_p,
    add_apa_table,
    add_figure,
    add_figure_placeholder,
    FONT_NAME,
    FONT_SIZE,
    DOUBLE_SPACE
)

def add_chapter_1(doc):
    """Generates Chapter I: INTRODUCTION."""
    add_major_section_heading(doc, "INTRODUCTION")

    add_heading(doc, "Background of the Study")

    add_body_p(
        doc,
        "Accreditation is one of the main ways in which a higher education institution (HEI) in the Philippines demonstrates that its academic programs meet recognized standards of quality. Through peer review and documentary audits, accreditation evaluates whether an institution provides the faculty, facilities, curricula, and student services necessary to deliver quality higher education (Conchada & Tiongco, 2015). Under the policies of the Commission on Higher Education (CHED), accredited status qualifies programs for progressive benefits, such as administrative deregulation, curricular autonomy, priority in government grants, and the authority to offer new graduate programs without prior CHED approval (Commission on Higher Education, 2019; Conchada & Tiongco, 2015)."
    )
    add_body_p(
        doc,
        "The Philippine Association of Colleges and Universities Commission on Accreditation (PACUCOA) is one of the premier accrediting bodies in the country. The standard instrument for undergraduate programs is detailed in the Manual of Accreditation (PACUCOA, 2023), which organizes evaluation into ten distinct Areas: Area I (Philosophy and Objectives), Area II (Faculty), Area III (Instruction), Area IV (Laboratory), Area V (Research), Area VI (Library), Area VII (Student Services), Area VIII (Social Orientation and Community Involvement), Area IX (Physical Plant and Facilities), and Area X (Organization and Administration)."
    )
    add_body_p(
        doc,
        "The Manual also fixes how the self-survey is scored. Each Area is rated by the self-survey committee on a 0-to-5 scale, and those ratings are combined into a weighted average using the weights specified for each academic level. For undergraduate programs, the weights across the ten Areas sum to thirty (30), as established in the official PACUCOA framework and presented in Table 1:"
    )

    # PACUCOA 10 Areas Table
    headers_areas = ["Area Number and Name", "Equivalent Weight"]
    rows_areas = [
        ["Area I: Philosophy and Objectives", "3"],
        ["Area II: Faculty", "3"],
        ["Area III: Instruction", "4"],
        ["Area IV: Laboratory", "3"],
        ["Area V: Research", "3"],
        ["Area VI: Library", "3"],
        ["Area VII: Student Services", "3"],
        ["Area VIII: Social Orientation and Community Involvement", "3"],
        ["Area IX: Physical Plant and Facilities", "2"],
        ["Area X: Organization and Administration", "3"],
        ["Total Weight", "30"],
    ]
    add_apa_table(
        doc,
        "Table 1",
        "PACUCOA Undergraduate Areas and Equivalent Weights (Total Weight = 30)",
        headers_areas,
        rows_areas,
        col_widths=[4.2, 1.8],
        note_str="Adapted from the PACUCOA Manual of Accreditation (Revised September 2023)."
    )

    add_body_p(
        doc,
        "As established in the official PACUCOA undergraduate framework, Instruction carries a weight of four (4), Physical Plant and Facilities carries a weight of two (2), and each of the other eight Areas—including Faculty—carries a weight of three (3), bringing the aggregate total weight to thirty (30). To qualify for Candidate status, a program must achieve a minimum overall rating of 3.00. For Level I formal accredited status, the program must achieve an overall rating of 3.00 with no individual Area mean falling below 3.00. For Level II, the required overall rating rises to 3.50, again with no Area mean below 3.50. Levels III and IV introduce still higher requirements, including a minimum rating of 4.00 and the condition that no single criterion fall below 4.00."
    )
    add_body_p(
        doc,
        "Meeting these ratings requires a large body of documentary evidence, such as faculty records, course syllabi, research publications, library acquisition receipts, student services logs, laboratory inventories, and administrative minutes. Area I requires the statement of philosophy, vision, mission, and core values; Area II requires faculty qualification and service records, recruitment and ranking policies, and development programs; Area III requires syllabi, sample examinations, class records, and supervisory reports; Area VI requires budget allocations, holdings lists, and accession logs; Area IX requires site plans, building permits, occupancy certificates, and fire safety inspection certificates. The remaining Areas have similarly extensive documentary requirements."
    )
    add_body_p(
        doc,
        "The Manual's policies are also time-bound. Under the Policy on Revisit in the PACUCOA Manual of Accreditation (PACUCOA, 2023), a compliance report addressing prior recommendations is to be submitted at least thirty (30) days before a scheduled revisit. Under the Manual's provisions on the Level II Reaccreditation Visit, a program preparing for Level II reaccreditation, such as the BSCS program (scheduled for next survey in 2030 under its four-year validity period), submits a letter of intent at least six (6) months before its accredited status expires, together with a compliance report on previous recommendations and an updated self-survey."
    )
    add_body_p(
        doc,
        "Empirical investigations into higher education accreditation workflows affirm that conventional, folder- and paper-based evidence preparation imposes a severe administrative burden, causes document scattering, and impedes readiness monitoring. In an empirical study of Philippine higher education accreditation, Galande (2025) observed that conventional manual evidence curation relies heavily on physical folders and decentralized files, generating significant administrative fatigue, misplaced exhibits, delayed retrieval during actual accreditation surveys, and substantial physical archiving expenditures. Similarly, Mindoro-Mesana et al. (2022) revealed that academic departments routinely suffer from fragmented document repositories stored across isolated workstations and personal storage drives, producing version confusion, documentary redundancies, and a persistent inability to track overall institutional readiness before accreditor visits. Corroborating these operational bottlenecks, Salac et al. (2025) highlighted that manual accreditation collation is constrained by unindexed and dispersed digital materials across disparate media, making it arduous for quality assurance teams and evaluators to systematically monitor compliance progress or assess accreditation preparedness in real time. Furthermore, Dres and Rabut (2025) documented that traditional folder-centric and paper-based document tracking in educational settings creates notable administrative friction, exhibit misplacement, and poor visibility across evaluative committees. These widespread operational challenges directly reflect the operational reality at STI West Negros University, where accreditation documents are prepared by different people and kept in different drives, creating substantial difficulties in locating critical exhibits when needed and complicating real-time readiness monitoring."
    )

    add_subheading(doc, "Background of the Institution")
    add_body_p(
        doc,
        "STI West Negros University (STI WNU) is a private university in Bacolod City, Negros Occidental, Philippines. It was founded in 1948 as West Negros College by three Baptist women leaders (STI West Negros University, n.d.). In 2008, the Commission on Higher Education granted the institution university status (STI West Negros University, n.d.). In 2013, STI Education Systems Holdings, Inc. acquired a controlling interest in the university, integrating its nationwide educational network with the university's established academic traditions (Philippine Daily Inquirer, 2013a, 2013b)."
    )
    add_body_p(
        doc,
        "Today, the university awards associate, bachelor's, master's, and doctoral degrees (STI West Negros University, n.d.). The College of Information and Communications Technology (CICT) offers the Bachelor of Science in Computer Science (BSCS) and Bachelor of Science in Information Technology (BSIT) programs. In September 2026, the BSCS program was granted PACUCOA Level I accredited status with a validity period of four (4) years (valid until September 2030), while the BSIT program maintains Level II reaccredited status under PACUCOA. The next scheduled survey activity for the BSCS program is set for 2030, requiring the systematic collation and continuous verification of comprehensive digital exhibits across all ten evaluative Areas."
    )

    add_subheading(doc, "The Developed System")
    add_body_p(
        doc,
        "This study developed and evaluated the Web-Based Accreditation Management and Readiness Assessment System for STI West Negros University, with the BSCS program as its pilot implementation. Designed directly around the PACUCOA undergraduate framework, the system incorporates six core pillars:"
    )
    add_body_p(
        doc,
        "1. Criterion-Based Evidence Mapping: It organizes exhibits under PACUCOA's ten areas and criteria, letting program heads and area chairs map files directly to expected criteria."
    )
    add_body_p(
        doc,
        "2. Independent Verification (Self-Verification Block): It enforces separation of duties by requiring that evidence be verified by an authorized reviewer other than the person who uploaded it (an assigned Area Chair or Co-Chair, or a Program Head within the program), with a programmatic block on self-verification. The QA Officer role is exempt from this check in the current policy."
    )
    add_body_p(
        doc,
        "3. Mathematical Readiness Engine: It computes indicative readiness ratings in real time using the Manual's official weighting formula (total weight of 30) and evaluates dual-constraint level floor rules."
    )
    add_body_p(
        doc,
        "4. Executive 5x2 Command Dashboard: It visualizes the ten Areas in a unified 5-column by 2-row layout, complete with progress bars and color-coded status badges."
    )
    add_body_p(
        doc,
        "5. What-If Readiness Simulation: It lets administrators simulate how completing up to ten selected unresolved criteria would affect Area means and level eligibility, isolated from production data."
    )
    add_body_p(
        doc,
        "6. Post-Visit Compliance Matrix: It tracks post-survey opportunities for improvement and recommendations using a four-column compliance matrix with sub-numbered action tracking, following the format of the CICT BSCS Compliance Report (CICT, n.d.)."
    )

    add_body_p(
        doc,
        "The six pillars are delivered through the four functional modules of the system. Pillars 1 and 2 (Criterion-Based Evidence Mapping and Independent Verification) are implemented in the Evidence Management and Mapping module. Pillars 3 and 4 (the Mathematical Readiness Engine and the Executive 5x2 Command Dashboard) are implemented in the Readiness Scoring and Executive Dashboard module. Pillar 5 (What-If Readiness Simulation) corresponds to the Readiness Simulation module, and Pillar 6 (Post-Visit Compliance Matrix) corresponds to the Post-Visit Compliance Tracking module. Role-based access control applies across all four modules."
    )

    add_heading(doc, "Objective of the Study")

    add_subheading(doc, "General Objective")
    add_body_p(
        doc,
        "This study aimed to design, develop, and evaluate a Web-Based Accreditation Management and Readiness Assessment System for STI West Negros University that automates evidence mapping, enforces independent verification with a self-verification block, calculates PACUCOA-compliant readiness ratings, provides what-if readiness simulation, and tracks post-visit compliance."
    )

    add_subheading(doc, "Specifically, the study sought to:")
    add_body_p(
        doc,
        "1. Build an Evidence Management and Mapping module that stores accreditation exhibits under PACUCOA criteria and validates file types, effective dates, and required document counts."
    )
    add_body_p(
        doc,
        "2. Implement a Readiness Scoring and Executive Dashboard module that computes ratings at the criterion, Area, and program levels using PACUCOA's weighted formula and displays them in a 5x2 layout."
    )
    add_body_p(
        doc,
        "3. Provide a Readiness Simulation module that projects program ratings and accreditation level thresholds if up to ten unresolved criteria are addressed."
    )
    add_body_p(
        doc,
        "4. Incorporate a Post-Visit Compliance Tracking module that records opportunities for improvement, recommendations, sub-numbered actions taken, and linked verification exhibits."
    )
    add_body_p(
        doc,
        "5. Enforce role-based access control and separation of duties that prevents self-verification while restricting access according to academic delegation."
    )
    add_body_p(
        doc,
        "6. Assess the quality of the system against the software quality characteristics of ISO/IEC 25010 in terms of functional suitability, performance efficiency, compatibility, usability, reliability, security, maintainability, and portability."
    )

    add_heading(doc, "Conceptual Framework")
    add_body_p(
        doc,
        "The study followed an Input–Process–Output (IPO) model with a feedback loop, as illustrated in Figure 1. This model illustrates how institutional accreditation inputs are transformed through computational and administrative processes into evaluative outputs, which in turn feed back into continuous quality improvement."
    )

    # Figure 1
    add_figure(
        doc,
        "Figure 1",
        "Conceptual Framework of the Study (Input–Process–Output Model with Feedback Loop)",
        "figures/figure1_conceptual_framework.png",
        width_in_inches=5.8
    )

    add_subheading(doc, "Narrative of the Conceptual Framework")
    add_body_p(
        doc,
        "Within the conceptual framework, the Inputs form the foundation on which the entire system operates. These include the PACUCOA Manual of Accreditation standards, criteria, and weights; institutional evidence exhibits (syllabi, faculty profiles, research outputs, administrative reports); user account credentials and role assignments; and post-visit survey recommendations."
    )
    add_body_p(
        doc,
        "These inputs are transformed through core computational and procedural Processes. The system maps exhibits to specific criteria, validates document types and dates, enforces independent verification with a self-verification block, calculates criterion and Area scores using the official mathematical formula, runs non-mutating what-if simulation projections, and organizes compliance action items."
    )
    add_body_p(
        doc,
        "These processes yield the system Outputs: a centralized, searchable evidence repository; real-time indicative readiness scores and level threshold determinations; an Executive 5x2 command dashboard; simulated readiness forecast reports; and a four-column post-visit compliance matrix. Finally, the Feedback Loop channels these outputs back to institutional stakeholders (QA officers, deans, program heads, faculty), informing continuous document curation and policy adjustments before official PACUCOA visits."
    )

    add_heading(doc, "Significance of the Study")
    add_body_p(
        doc,
        "The results and implementation of this study provide substantial benefits to various educational stakeholders:"
    )
    add_bullet_p(
        doc,
        "**STI West Negros University.** The institution gains an institutional digital repository and continuous accreditation platform that is designed to reduce episodic preparation and paper-based handling and to preserve institutional memory."
    )
    add_bullet_p(
        doc,
        "**Quality Assurance (QA) Office.** The QA Office gains a university-wide oversight tool to monitor readiness across academic programs, standardize criteria configurations, and verify compliance deadlines."
    )
    add_bullet_p(
        doc,
        "**College Deans and Program Heads.** Academic leaders obtain objective, real-time metrics on program readiness, enabling data-driven resource allocation and pinpointing specific documentary gaps."
    )
    add_bullet_p(
        doc,
        "**Area Chairs, Co-Chairs, and Faculty Members.** Faculty members benefit from structured exhibit checklists, transparent verification workflows, and clear role boundaries designed to reduce redundant uploads."
    )
    add_bullet_p(
        doc,
        "**Alumni and Student Representatives.** External stakeholders access high-level readiness summaries without access to confidential files."
    )
    add_bullet_p(
        doc,
        "**Future Researchers.** The study provides a documented architecture and an acceptability evaluation of an accreditor-specific readiness system, serving as a foundation for future higher education software engineering."
    )

    add_heading(doc, "Scope and Limitation of the Study")

    add_subheading(doc, "Scope of the Study")
    add_body_p(
        doc,
        "The study covers the design, development, and evaluation of a web-based accreditation management and readiness assessment platform for STI West Negros University. The system is built around the PACUCOA undergraduate framework (Revised September 2023), covering all ten evaluative Areas, their respective weights totaling 30 (with Instruction carrying 4, Physical Plant 2, and the remaining eight Areas 3 each), the 0-to-5 rating scale, and level thresholds (Candidate, Level I, Level II, Level III, Level IV). In the pilot implementation focusing on the Bachelor of Science in Computer Science (BSCS) program of CICT, the survey instrument is currently operationalized across seventy-nine (79) active evaluative criteria. These criteria were generated by a script from the opportunities for improvement in the CICT BSCS Compliance Report (CICT, n.d.); they are not a list prescribed by PACUCOA. The system's underlying data architecture is fully dynamic and program-configurable: while the ten Areas and weighting rules are fixed by the PACUCOA framework, the specific number of criteria is not a rigid universal constant and can vary across different academic programs based on curricular specialization, applicable provisions, and quality assurance templates. The software includes four functional modules: Evidence Management and Mapping, Readiness Scoring and Executive Dashboard, Readiness Simulation, and Post-Visit Compliance Tracking. Access control supports eight user roles: System Admin, QA Officer, Dean, Program Head, Area Chair, Area Co-Chair, Faculty Member, and Alumni/Student Representative. An audit log records completed evaluative and administrative transactions."
    )

    add_subheading(doc, "Limitations of the Study")
    add_body_p(
        doc,
        "The system boundary is focused on Step Two (Institutional Self-Survey) of the PACUCOA accreditation process; it does not automate Step One (Application) or Step Three (Organization of the Accrediting Team), nor the conduct of any accreditation visit. The seventy-nine (79) evaluative criteria in the database were generated by a script from the opportunities for improvement in the CICT BSCS Compliance Report (CICT, n.d.). They are the working configuration for the BSCS pilot and not an accreditor-mandated list for all disciplines, and the platform allows different criteria sets to be configured for other degree programs. In the criterion scoring formula, the required document count (R) is a configurable proxy; it is not set by PACUCOA, because the Manual does not specify document counts for its provisions. The Manual's text on the Level III Reaccreditation Visit states that Level III requires an overall rating of 4.00 with a mean of at least 4.00 in every survey area, whereas its minimum-rating summary states that no individual criterion should fall below 4.00; the system applies the stricter rule (no criterion below 4.00). Official Level III and Level IV accreditation also involve supplementary criteria, such as community outreach and research tradition, that lie outside the program-level self-survey scoring engine. The following additional limitations apply. First, the automated extraction routine reads text-layer PDF files only; scanned or image-only documents are not read, and optical character recognition (OCR) is not implemented. Second, the system does not keep versions of uploaded documents. Third, only the BSCS program has been populated; the BSIT program has not yet been populated. Fourth, licensure eligibility, which the Manual describes as a separate board-examination-based track, is not modeled. Fifth, because some respondents in the software quality evaluation were also institutional stakeholders involved in requirements consultations, their prior familiarity with the system may introduce potential evaluator bias. Finally, automated document tagging assists with keyword detection but does not evaluate qualitative academic merit; physical scanning of legacy paper documents is outside the software boundary; and the technical evaluation was conducted within CICT and supporting offices of STI WNU using the ISO/IEC 25010 framework."
    )

    add_heading(doc, "Definition of Terms")
    add_body_p(
        doc,
        "The following operational and conceptual definitions clarify key terms used throughout this study:"
    )

    definitions = [
        ("**Accreditation.**", "A voluntary, standards-based process by which an authorized accrediting agency evaluates an educational institution or program to verify that it meets or exceeds predefined quality criteria."),
        ("**PACUCOA.**", "The Philippine Association of Colleges and Universities Commission on Accreditation, an affiliate member of the Federation of Accrediting Agencies of the Philippines (FAAP)."),
        ("**Manual of Accreditation.**", "The official regulatory instrument (Revised September 2023) published by PACUCOA specifying evaluative areas, weights, rating scales, and level rules."),
        ("**Self-Survey (Step Two).**", "An internal comprehensive assessment conducted by an institution's faculty and administration to evaluate program readiness prior to an external accreditation audit, representing the specific operational scope of this system."),
        ("**Area.**", "One of the ten major evaluative divisions in the PACUCOA undergraduate survey instrument, each assigned a specific numerical weight summing to 30."),
        ("**Criterion.**", "A specific evaluative standard within an Area against which documentary exhibits are uploaded, verified, and scored. The system dynamically supports program-specific criteria sets, currently instantiated with seventy-nine (79) active criteria for the BSCS pilot implementation, generated from the CICT BSCS Compliance Report."),
        ("**PACUCOA 0-to-5 Rating Scale.**", "The official rating scale used in self-surveys: 5 = Excellent, 4 = Very Good, 3 = Good, 2 = Fair, 1 = Poor, and 0 = Missing (provision is missing but necessary). Provisions marked N.A. (Not Applicable) are excluded from the active Area divisor."),
        ("**PACUCOA Compliance-Verification Scale.**", "The official five-point scale used by PACUCOA visiting teams during revisits: 5 = Full Compliance, 4 = Very Satisfactory Partial Compliance, 3 = Satisfactory Partial Compliance, 2 = Unsatisfactory Partial Compliance, and 1 = Non-Compliance."),
        ("**Evidence (Exhibit).**", "A document, syllabus, report, or certification uploaded to demonstrate compliance with an accreditation criterion."),
        ("**Evidence Mapping.**", "The systematic digital tagging and linking of an uploaded exhibit to its corresponding PACUCOA Area and criterion."),
        ("**Verification.**", "The formal administrative review of an uploaded exhibit by an authorized reviewer (an Area Chair, Co-Chair, Program Head, or QA Officer), confirming its validity, document type, and effective date."),
        ("**Separation of Duties (Self-Verification Block).**", "A core security constraint that prohibits the user who uploaded an exhibit from acting as the verifier of that same exhibit. In the current policy, the QA Officer role is exempt from this check."),
        ("**Criterion Score.**", "A computed value ranging from 0.00 to 5.00 reflecting the proportion of verified valid documents relative to the configurable required document count (R), a proxy that is not set by PACUCOA."),
        ("**Area Mean.**", "The arithmetic average of all active criterion scores within an Area, indicating the section's overall performance."),
        ("**Program Rating.**", "The weighted average across all ten Area means, computed using PACUCOA's official weighting formula."),
        ("**Dual-Constraint Level Threshold.**", "The regulatory rule requiring a program to meet both an overall program rating and a minimum floor rating in every individual Area (e.g., Level I requires ≥ 3.00 overall with no Area below 3.00)."),
        ("**Readiness Simulation.**", "A non-mutating mathematical sandbox that projects hypothetical Area means and level eligibility based on the completion of up to ten selected criteria."),
        ("**Post-Visit Compliance Matrix.**", "A tracking format of four columns (Opportunities for Improvement, Recommendations, Sub-numbered Actions Taken, and Linked Exhibits) that follows the format of the CICT BSCS Compliance Report (CICT, n.d.); it is not a format mandated by PACUCOA or the QA Office."),
        ("**Role-Based Access Control (RBAC).**", "A security paradigm that restricts system operations and view permissions based on assigned institutional user roles and academic scopes."),
        ("**Audit Trail.**", "A tamper-evident chronological record documenting the actor, timestamp, and details of all completed evaluative and administrative transactions."),
        ("**CICT, BSCS, BSIT.**", "The College of Information and Communications Technology at STI West Negros University, its Bachelor of Science in Computer Science program, and its Bachelor of Science in Information Technology program."),
    ]

    for term, desc in definitions:
        add_body_p(doc, f"{term} {desc}")

    print("Chapter 1 generated successfully.")

def add_chapter_2(doc):
    """Generates Chapter II: RELATED LITERATURE AND PRIOR ARTS SEARCH."""
    add_major_section_heading(doc, "RELATED LITERATURE AND PRIOR ARTS SEARCH")

    add_heading(doc, "Review of Related Literature")

    add_subheading(doc, "Accreditation and Quality Assurance in Philippine Higher Education")
    add_body_p(
        doc,
        "Quality assurance in Philippine higher education operates through a dual architecture comprising governmental oversight by the Commission on Higher Education (CHED) and peer-based programmatic accreditation administered by voluntary accrediting agencies under the Federation of Accrediting Agencies of the Philippines (FAAP). Under CHED Memorandum Order No. 12, Series of 2019 (Commission on Higher Education, 2019), formal accreditation status is directly linked to vital regulatory privileges for private higher education institutions, including administrative deregulation, curricular autonomy to revise programs without prior commission approval, financial flexibility, and priority consideration for institutional development grants. In the private non-sectarian higher education sector, the Philippine Association of Colleges and Universities Commission on Accreditation (PACUCOA) conducts voluntary institutional and programmatic evaluations across eight progressive phases (PACUCOA, 2023). Under the official PACUCOA undergraduate framework (PACUCOA, 2023), evaluations evaluate ten distinct Areas: Philosophy and Objectives, Faculty, Instruction, Laboratory, Research, Library, Student Services, Social Orientation and Community Involvement, Physical Plant and Facilities, and Organization and Administration. These Areas are assigned fixed numerical weights summing to an aggregate denominator of thirty (30), evaluated on a calibrated 0-to-5 rating scale."
    )
    add_body_p(
        doc,
        "The PACUCOA accreditation framework enforces strict dual-constraint mathematical thresholds for level eligibility (PACUCOA, 2023). To attain Candidate status, a program must achieve an overall weighted grand mean of at least 3.00. For Level I formal accredited status, the program must satisfy a dual constraint: achieve an overall rating of at least 3.00 with no individual Area mean falling below the 3.00 floor. Level II requires an overall rating of 3.50 with no Area mean below 3.50, whereas Levels III and IV require a minimum overall rating of 4.00 alongside criterion-level minimum thresholds. Furthermore, PACUCOA policies impose strict procedural timelines: under the Policy on Revisit (PACUCOA, 2023), an institution preparing for a revisit must submit a comprehensive compliance report addressing previous recommendations at least thirty (30) days prior to the scheduled survey. Under Level II Reaccreditation provisions, a letter of intent, an updated self-survey report, and compliance documentation must be submitted at least six (6) months before the accredited status expires. In an empirical analysis of Philippine higher education governance, Aldaba et al. (2024) observed that while accreditation serves as a primary pillar for academic accountability, institutions routinely encounter severe administrative friction and compliance burdens due to decentralized records and disjointed reporting workflows across academic units. Similarly, Aquino (2025) highlighted that high-performing Philippine universities succeed in accreditation not through episodic compliance exercises, but by embedding internal quality assurance (IQA) systems that continuously align institutional operations with accrediting body rubrics. The proposed system natively operationalizes these regulatory parameters by automating the PACUCOA 30-weight scoring engine and dual-constraint floor rules, providing academic leaders at STI West Negros University with real-time, transparent visibility into baseline readiness and upcoming survey deadlines."
    )

    add_subheading(doc, "Digital Evidence Management and Continuous Readiness")
    add_body_p(
        doc,
        "Traditional accreditation preparation in higher education is predominantly episodic, characterized by frantic documentary compilation and physical binder collation in the final weeks preceding an on-site visit. Akdemir et al. (2020) demonstrated that episodic compliance models introduce substantial operational stress, increase the risk of missing or outdated records, and obscure institutional deficiencies until formal audits take place. In contrast, modern quality assurance paradigms advocate for continuous quality improvement (CQI), where documentary evidence is curated systematically and incrementally as part of daily academic operations (Akdemir et al., 2020). Developing web-based platforms that support active evidence management and traceability enables academic departments to replace fragmented paper archives with structured digital assets (Al-Qawasmi, 2026)."
    )
    add_body_p(
        doc,
        "Digital evidence management systems require structured mechanisms to map, index, and validate complex documentary requirements. Al-Qawasmi (2026) demonstrated through a web-based academic quality management system that establishing direct traceability between instructional artifacts (such as syllabi, assessment rubrics, and faculty credentials) and specific accreditation criteria drastically reduces audit preparation cycles while ensuring evidence veracity. Similarly, Schellekens et al. (2023) underscored that digital quality assurance applications must support collaborative multi-user workflows, structured document tagging, and real-time status tracking to ensure that institutional stakeholders remain continuously audit-ready. In the context of institutional accreditation, Sidhimantra et al. (2024) verified that deploying centralized digital repository systems eliminates physical archive bottlenecks, provides reliable multi-user access across academic committees, and streamlines evidentiary retrieval during accreditation reviews. The platform developed in this study applies these principles to the PACUCOA framework by providing a criterion-mapped digital evidence repository where faculty upload exhibits incrementally, supported by a server-side routine that extracts the text layer of PDF files to suggest matching document categories and recency dates."
    )

    add_subheading(doc, "Decision Support and What-If Analysis in Education")
    add_body_p(
        doc,
        "Navigating complex accreditation frameworks presents higher education administrators with multi-criteria optimization challenges. Because PACUCOA evaluations combine weighted arithmetic averages with non-negotiable area floor thresholds, academic managers cannot easily intuit which documentary deficiencies represent the most critical operational bottlenecks. Decision support systems (DSS) incorporating mathematical modeling provide university leadership with analytical tools to optimize institutional resource allocation, faculty development, and infrastructure investments toward strategic quality benchmarks (Makki et al., 2022). By modeling constraints and criteria relationships algorithmically, decision support tools transform raw institutional data into actionable managerial guidance (Makki et al., 2022)."
    )
    add_body_p(
        doc,
        "A critical capability in educational decision support is what-if scenario simulation. Samaranayake et al. (2023) demonstrated that interactive decision support platforms incorporating what-if simulation eliminate tedious, error-prone manual calculations, allowing educational decision-makers to model hypothetical policy changes, evaluate trade-offs, and observe projected outcomes across complex requirement matrices before committing resources. However, as Nauman et al. (2021) emphasized, decision support algorithms deployed in higher education must be formally verifiable and algorithmically transparent; unverified or opaque automated calculations risk presenting misleading projections to academic leadership. Crucially, scenario simulations must execute within an isolated sandbox environment to guarantee that live audit records and production readiness ratings remain completely unaltered during hypothetical experimentation. The proposed system directly implements these decision-support concepts through an isolated What-If Readiness Simulation Sandbox, enabling program heads and deans to select up to ten unresolved criteria, project the mathematical impact of their completion across Area means and level thresholds, and evaluate target upgrade trajectories without mutating production database tables."
    )

    add_subheading(doc, "Access Control and Separation of Duties")
    add_body_p(
        doc,
        "Because accreditation management platforms store sensitive academic records, faculty credential portfolios, research manuscripts, and confidential institutional evaluations, rigorous data governance and access control architectures are paramount (Farhadighalati et al., 2025). Farhadighalati et al. (2025) observed that modern distributed and cloud-hosted web applications require fine-grained role-based access control (RBAC) models that strictly enforce the principle of least privilege, restricting user operations to predefined functional responsibilities across distinct operational scopes."
    )
    add_body_p(
        doc,
        "Beyond baseline access permissions, high-integrity regulatory audit platforms must incorporate the fundamental security principle of Separation of Duty (SoD). In an authoritative review of information security architectures, Groll et al. (2025) established that separation of duties is indispensable for preventing conflicts of interest, curbing fraudulent authorization, and eliminating single-point vulnerabilities where an individual possesses unilateral authority to initiate and approve the same transaction. Aftab et al. (2019) demonstrated through mathematical modeling of dynamic role-based access control that permission-level separation constraints can be programmatically enforced to block self-evaluation and enforce independent multi-tier verification pipelines. In an accreditation self-survey context, permitting a faculty member or committee chair to verify and approve their own documentary submissions undermines the objectivity of the review process. To establish verifiable separation of duties, the system developed in this study enforces an independent verification workflow backed by a database-level self-verification block (requiring uploader_id != verifier_id) implemented via PostgreSQL Row-Level Security (RLS) policies, ensuring that documentary exhibits are independently validated by assigned Area Chairs or Program Heads while exempting the institutional QA Officer under current university policy."
    )

    add_subheading(doc, "Software Quality Evaluation")
    add_body_p(
        doc,
        "To rigorously evaluate modern enterprise and educational software systems, the International Organization for Standardization and the International Electrotechnical Commission established the ISO/IEC 25000 SQuaRE series. The product quality model defined under ISO/IEC 25010 (ISO & IEC, 2023) provides a standardized multi-dimensional taxonomy for assessing software characteristics, encompassing functional suitability, performance efficiency, compatibility, usability (interaction capability), reliability, security, maintainability, and portability (flexibility). Applying standardized quality models ensures that academic platforms are not merely functionally operational, but also robust, secure, and user-centric across heterogeneous institutional environments (ISO & IEC, 2023)."
    )
    add_body_p(
        doc,
        "Empirical research demonstrates that evaluating web-based academic systems against ISO/IEC 25010 criteria provides an objective methodology for validating software acceptability among educational stakeholders. In an empirical evaluation of educational management platforms in Philippine higher education, Urera and Balahadia (2019) determined that functional suitability and usability are critical predictors of system adoption among faculty members and academic administrators. More recently, Lagman et al. (2024) developed an enterprise-level digital governance platform for Philippine state universities and colleges, employing an Agile development methodology and validating system quality across institutional administrators using the ISO/IEC 25010 model. Their findings confirmed that rigorous adherence to standardized quality characteristics guarantees data security, architectural maintainability, and high user acceptance in higher education institutions (Lagman et al., 2024). In alignment with this established methodology, the system engineered in this study was formally evaluated under the ISO/IEC 25010 quality model by twenty (20) purposive respondents comprising fifteen (15) institutional users and five (5) IT experts, verifying its software quality, security controls, and operational suitability for accreditation governance."
    )

    add_subheading(doc, "Accreditation and Quality Assurance Information Systems in Southeast Asia")
    add_body_p(
        doc,
        "Across Southeast Asia, higher education institutions are increasingly deploying specialized web-based platforms to automate quality assurance workflows and fulfill national accreditation standards. In the Philippines, Pardiñan et al. (2024) conducted an empirical study investigating the perceptions of key academic informants regarding the digitization of accreditation records and web-based platforms across state universities and colleges. Their findings revealed that transitioning from paper-bound archives to web-based platforms drastically reduces evidence collation timelines, minimizes lost or duplicated records, improves accessibility during external audits, and promotes institutional transparency (Pardiñan et al., 2024)."
    )
    add_body_p(
        doc,
        "The necessity of dedicated software architectures for higher education quality assurance is further supported by regional developments in neighboring countries. In the Philippines, Ramos (2024) designed a dedicated Quality Assurance Information System (QAIS) framework for tertiary institutions, demonstrating that automating accreditation data collation and compliance monitoring overcomes the chronic data fragmentation caused by siloed departmental spreadsheets. In Indonesia, Tarigan and Zahara (2024) examined the implementation of paperless internal quality assurance information systems (SIQA) across higher education institutions, concluding that digitalizing internal quality audits and evidence tracking directly correlates with higher institutional accreditation scores and sustained compliance. Building upon these regional insights, the platform developed in this study provides a tailored accreditation management and readiness assessment system engineered specifically around the PACUCOA undergraduate framework and the four-column compliance matrix format utilized by CICT at STI West Negros University, addressing documentary fragmentation and facilitating continuous accreditation readiness."
    )

    add_heading(doc, "Prior Arts Search")

    add_subheading(doc, "Scope of the Search")
    add_body_p(
        doc,
        "The prior arts search examined publicly accessible literature, vendor documentation, product whitepapers, and existing commercial platforms designed for educational accreditation, continuous quality improvement, and institutional compliance tracking."
    )

    add_subheading(doc, "Existing Systems")
    add_bullet_p(
        doc,
        "**Watermark Planning & Self-Study:** A commercial higher education platform (Watermark Insights, 2024) described as providing centralized document repositories, collaborative authoring workflows, and rubric mapping. The reviewed materials did not show native support for PACUCOA's 30-weight mathematical formula, dual-constraint area floor rules, or database-enforced self-verification blocks."
    )
    add_bullet_p(
        doc,
        "**AchieveIt:** A cloud-based execution and compliance management platform (AchieveIt, 2024) featuring institutional progress dashboards, automated reminders, and multi-level initiative tracking. The reviewed materials did not show accreditor-specific criterion evaluation formulas, PACUCOA level thresholds, or an isolated what-if readiness simulation sandbox."
    )
    add_bullet_p(
        doc,
        "**Creatrix Campus:** An enterprise higher education management suite (Creatrix Campus, 2023) featuring accreditation modules integrated with student information and learning management systems. The reviewed materials did not show PACUCOA-specific undergraduate evaluative rubrics or four-column post-visit compliance matrix structures."
    )

    add_subheading(doc, "Comparative Analysis")
    add_body_p(
        doc,
        "Table 2 presents a systematic feature-by-feature comparison between the reviewed software platforms and the proposed system developed in this study."
    )

    headers_t1 = ["Feature / Evaluative Dimension", "Watermark", "AchieveIt", "Creatrix Campus", "Proposed System"]
    rows_t1 = [
        ["Centralized evidence repository", "Described", "Described", "Described", "Yes (Supabase Storage mapped to criteria)"],
        ["Accreditor-specific framework or templates", "Pre-built templates", "Requirements tracking", "Templates available", "Yes (PACUCOA 2023 undergraduate framework)"],
        ["Assignment of responsibility", "Collaborative workflows", "Accountability features", "Tasks assigned to users", "Yes (Delegated Area Chairs, Co-Chairs, Members)"],
        ["Progress or readiness dashboards", "Described", "Real-time progress", "Reports and dashboards", "Yes, with 5x2 executive command layout"],
        ["PACUCOA framework named in materials", "Not stated", "Not stated", "Not stated", "Yes (explicit native implementation)"],
        ["Rating computed with PACUCOA weighting (Sum=30) and floor rules", "Not stated", "Not stated", "Not stated", "Yes (real-time automated calculation)"],
        ["What-if readiness simulation", "Not stated", "Not stated", "Not stated", "Yes (non-mutating projection with deltas)"],
        ["Enforced verification by someone other than the uploader", "Not stated", "Not stated", "Not stated", "Yes (enforced self-verification block)"],
        ["Post-visit compliance matrix with linked exhibits", "Not stated", "Not stated", "Not stated", "Yes (4-column matrix, sub-numbered actions)"],
        ["Integration with SIS or LMS", "Not stated", "Not stated", "Described", "No (out of scope for pilot prototype)"],
    ]
    add_apa_table(
        doc,
        "Table 2",
        "Comparison of Reviewed Systems and the Proposed System, Based on Public Materials",
        headers_t1,
        rows_t1,
        col_widths=[2.4, 0.9, 0.9, 0.9, 1.9],
        note_str="Evaluated based on publicly available documentation, system feature sheets, and technical product whitepapers as of 2026."
    )

    add_subheading(doc, "Synthesis and Research Gap")
    add_body_p(
        doc,
        "The comparative analysis shows that the reviewed commercial systems are described as supporting general document storage and institutional task management. However, the reviewed materials did not show a platform that natively implements the PACUCOA accreditation framework, its 30-weight aggregation formula, or its dual-constraint level thresholds. The reviewed materials also did not show an enforced self-verification block at the database level or an isolated what-if simulation sandbox tailored to PACUCOA criteria. This study addresses this gap, within the scope of the reviewed materials, by building a web-based platform around the PACUCOA undergraduate framework and around the four-column compliance matrix format used in the CICT BSCS Compliance Report (CICT, n.d.), which is not a format mandated by PACUCOA."
    )

    print("Chapter 2 generated successfully.")

def add_chapter_3(doc):
    """Generates Chapter III: MATERIALS AND METHODS."""
    add_major_section_heading(doc, "MATERIALS AND METHODS")

    add_heading(doc, "System Design")

    add_subheading(doc, "Requirements Gathering")
    add_body_p(
        doc,
        "Requirements were gathered through document analysis of the PACUCOA Manual, review of the CICT BSCS Compliance Report (CICT, n.d.), and consultations with CICT academic administrators, program heads, faculty members, and Quality Assurance personnel. The PACUCOA Manual of Accreditation (Revised September 2023) supplied the regulatory and mathematical constraints used in the system: the ten undergraduate evaluative Areas, their weights summing to thirty (30), the 0-to-5 rating scale, and the level thresholds."
    )

    add_subheading(doc, "Development Methodology")
    add_body_p(
        doc,
        "The system was engineered using an Agile developmental approach (Beck et al., 2001), incorporating iterative Scrum practices (Schwaber & Sutherland, 2020). Development progressed across four iterations from August to October 2026, as outlined in Table 3 and illustrated in Figure 2."
    )

    headers_t2 = ["Period", "Development Activities", "Deliverables"]
    rows_t2 = [
        ["August 2026", "Proposal preparation; study of the PACUCOA framework; CICT requirements analysis", "System proposal; requirements matrix; initial conceptual architecture"],
        ["Late August to Early September 2026", "Iteration 1: Database schema design; Supabase authentication; role-based access control setup", "Functional database schema; user registration and login; role management"],
        ["September 2026", "Iteration 2: PACUCOA criteria setup; evidence upload module; PDF text extraction and tagging", "Evidence repository; file upload UI; PDF text-layer tagging; verification workflow"],
        ["Late September to Early October 2026", "Iteration 3: Mathematical scoring engine; 5x2 executive command dashboard; what-if simulation", "Automated scoring engine; 5x2 dashboard; simulation sandbox; boundary test suite"],
        ["October 2026", "Iteration 4: 4-Column Post-Visit Compliance Matrix module; sub-numbered action tracking; security polish", "Compliance matrix module; audit log; end-to-end testing; user documentation"],
    ]
    add_apa_table(
        doc,
        "Table 3",
        "Development Timeline, August to October 2026",
        headers_t2,
        rows_t2,
        col_widths=[1.5, 2.5, 2.0],
        note_str="Organized into four developmental iterations from August to October 2026 following Agile Scrum principles."
    )

    # Figure 2
    add_figure(
        doc,
        "Figure 2",
        "Software Development Life Cycle (SDLC) Framework (Agile Scrum with Four Iterations)",
        "figures/figure2_sdlc_scrum.png",
        width_in_inches=5.8
    )

    add_subheading(doc, "System Architecture")
    add_body_p(
        doc,
        "The system was implemented using a modular three-tier cloud architecture. The presentation layer was developed with Next.js (Vercel, n.d.) and TypeScript and styled with Tailwind CSS for modern responsive browser interfaces. The backend utilizes Supabase, an open-source Backend-as-a-Service built on PostgreSQL, which provides user authentication, relational data persistence, and object storage. Access control is enforced through PostgreSQL Row-Level Security (RLS) policies (Supabase, n.d.) and private storage buckets with time-limited signed URLs. A server-side routine extracts the text layer of uploaded PDF files to assist users with document-type suggestion and keyword matching. Figure 3 illustrates the three-tier system architecture with component icons."
    )

    # Figure 3
    add_figure(
        doc,
        "Figure 3",
        "System Architecture of the Web-Based Accreditation Management and Readiness Assessment System",
        "figures/figure3_system_architecture.png",
        width_in_inches=5.8
    )

    add_subheading(doc, "Hardware and Software Requirements")
    add_body_p(
        doc,
        "The development, deployment, and operational execution of the Web-Based Accreditation Management and Readiness Assessment System required specific hardware and software configurations across the developmental workstation, cloud hosting infrastructure, and client access tiers."
    )
    add_body_p(
        doc,
        "**1. Development Environment Requirements**"
    )
    add_bullet_p(doc, "Processor: Intel Core i5 / AMD Ryzen 5 (multi-core, 2.5 GHz or higher clock speed).")
    add_bullet_p(doc, "Memory: 8 GB RAM minimum (16 GB recommended for concurrent Next.js dev server compilation and container execution).")
    add_bullet_p(doc, "Storage: 256 GB Solid State Drive (SSD) with at least 20 GB available storage for local repository assets and test documents.")
    add_bullet_p(doc, "Operating System: 64-bit Windows 10/11 or Ubuntu Linux 22.04 LTS.")
    add_bullet_p(doc, "Development Runtime & Tools: Node.js (v20.x LTS or v24.x), npm package manager, Git version control, and Visual Studio Code IDE.")

    add_body_p(
        doc,
        "**2. Server and Cloud Infrastructure Specifications**"
    )
    add_bullet_p(doc, "Application Hosting: Vercel Cloud Serverless Edge Platform supporting automated continuous deployment and Next.js App Router streaming.")
    add_bullet_p(doc, "Backend-as-a-Service (BaaS): Supabase Cloud Infrastructure with dedicated PostgreSQL 15.x relational database engine.")
    add_bullet_p(doc, "Database Extensions: pgjwt for cryptographic token verification and Row-Level Security (RLS) enforcement.")
    add_bullet_p(doc, "Storage Engine: Supabase S3-compatible Private Object Storage with time-limited signed URLs (300-second expiry) for secure document streaming.")
    add_bullet_p(doc, "Network & Transmission Security: Full HTTPS/TLS 1.3 transport encryption with AES-256 cryptographic encryption at rest.")

    add_body_p(
        doc,
        "**3. Client-Side Workstation and Browser Requirements**"
    )
    add_bullet_p(doc, "Client Hardware: Standard desktop PC, laptop, or tablet equipped with at least 4 GB RAM and display resolution of 1366 x 768 or higher (1920 x 1080 recommended for optimal 5x2 dashboard and compliance matrix layout).")
    add_bullet_p(doc, "Operating System: Operating system agnostic (Microsoft Windows 10/11, Apple macOS 12+, Linux, ChromeOS, iPadOS, Android).")
    add_bullet_p(doc, "Web Browser: Evergreen web browsers supporting ECMAScript 2022 and modern CSS Grid (Google Chrome 110+, Microsoft Edge 110+, Mozilla Firefox 115+, Apple Safari 16+).")
    add_bullet_p(doc, "Network Connectivity: Stable broadband or campus Wi-Fi connection (minimum 5 Mbps download and upload) to support exhibit file ingestion and PDF previewing.")

    add_subheading(doc, "Machine Learning and Artificial Intelligence Specifications")
    add_body_p(
        doc,
        "In designing the accreditation management platform, technical specifications regarding the deployment of Machine Learning (ML) and Artificial Intelligence (AI) were determined by the institutional necessity for legal defensibility, complete auditability, and deterministic adherence to PACUCOA regulatory standards."
    )
    add_body_p(
        doc,
        "Accreditation surveys are rigorous evaluative procedures where every numeric rating, Area mean, and eligibility determination must be mathematically explainable and verifiable by external accreditors and university administrators. Consequently, the scoring engine and readiness assessment modules deliberately avoid non-deterministic black-box machine learning algorithms (such as deep neural networks or stochastic regression models with opaque latent weights). All quantitative aggregations are governed by explicit, piecewise mathematical formulations, PACUCOA's official 30-weight area distribution, and strict dual-constraint floor logic (Candidate through Level IV)."
    )
    add_body_p(
        doc,
        "For documentary ingestion, the system implements deterministic rule-based algorithms and heuristic regular expression (regex) text pattern extraction. When institutional exhibits (such as syllabi, board meeting minutes, and faculty profile summaries) are uploaded, a server-side text layer parser scans the extracted document text for chronological date patterns (ISO 8601 and alphanumeric date expressions), institutional keywords, and exhibit identifiers. This heuristic layer assists the user by suggesting the probable document type and pre-populating the effective date field, while maintaining a strict human-in-the-loop workflow where the uploader confirms or modifies metadata prior to formal submission. This architecture guarantees 100% explainability, deterministic repeatability, and total compliance with academic accreditation auditing protocols."
    )

    add_subheading(doc, "Users, Roles, and Access Control")
    add_body_p(
        doc,
        "Access follows role-based access control (Sandhu et al., 1996) combined with program and Area delegations. Table 4 details the eight supported roles and their permissions."
    )

    headers_t3 = ["Role", "Scope", "Main Permissions"]
    rows_t3 = [
        ["System Admin", "Institution", "Creates departments, programs, and user accounts. No access to evaluate or alter evidence."],
        ["QA Officer", "Institution", "Configures frameworks, Areas, weights, criteria, and levels; reviews university-wide readiness; may verify evidence in any program and is not subject to the uploader check in the current policy."],
        ["Dean", "College", "Views readiness dashboards, heatmaps, and simulations for all programs in the college; views compliance."],
        ["Program Head", "Program", "Assigns Area Chairs, Co-Chairs, and Members; monitors readiness; verifies exhibits within own program (except own uploads); runs simulations."],
        ["Area Chair / Co-Chair", "Assigned Area", "Verifies uploaded evidence within assigned Area (except own uploads); tracks Area progress."],
        ["Faculty Member", "Assigned Area", "Uploads evidence for criteria in assigned Areas; inputs metadata. Cannot verify documents."],
        ["Alumni / Student Rep", "Program", "Views high-level program readiness summaries and RAG badges. No access to evidence files or users."],
    ]
    add_apa_table(
        doc,
        "Table 4",
        "Roles and Permissions",
        headers_t3,
        rows_t3,
        col_widths=[1.4, 1.2, 3.4],
        note_str="Enforced through application route guards, database RLS policies, and private storage controls. Verification rules follow the RLS policy definitions in the project migration scripts."
    )

    add_subheading(doc, "Process Modeling")
    add_body_p(
        doc,
        "To establish the functional boundaries, external entities, and logical data transitions of the platform, structured process modeling was conducted using Data Flow Diagrams (DFD). Figure 4 illustrates the Context Flow Diagram (DFD Level 0), depicting the central system process (Process 0.0) and the bi-directional information exchanges with seven external entities: the System Administrator, QA Officer, CICT Dean, Program Head, Area Chair/Co-Chair, Faculty Member, and PACUCOA Accreditors."
    )

    # Figure 4
    add_figure(
        doc,
        "Figure 4",
        "Context Flow Diagram (Data Flow Diagram Level 0) of the Accreditation System",
        "figures/figure4_context_diagram.png",
        width_in_inches=5.8
    )

    add_body_p(
        doc,
        "Figure 5 presents the Data Flow Diagram (Level 1), detailing the decomposition of the system into seven core sub-processes: User Authentication & Access Control (1.0), Framework Setup & Area Delegation (2.0), Evidence Ingestion & PDF Text Extraction (3.0), Independent Verification & Separation of Duty (4.0), Mathematical Scoring & Dual-Constraint Engine (5.0), What-If Readiness Simulation Sandbox (6.0), and Post-Visit Compliance Tracking (7.0), interacting across six relational data stores (D1 to D6)."
    )

    # Figure 5
    add_figure(
        doc,
        "Figure 5",
        "Data Flow Diagram (Level 1) of the Accreditation System",
        "figures/figure5_data_flow_diagram.png",
        width_in_inches=5.8
    )

    add_subheading(doc, "Data Design")
    add_body_p(
        doc,
        "The database schema was structured to be highly configurable, storing framework definitions in relational tables rather than hardcoding them in application logic. Table 5 summarizes the principal data entities."
    )

    headers_t4 = ["Entity / Table", "Purpose"]
    rows_t4 = [
        ["institutions, departments, programs", "Represents the academic organizational structure (e.g., STI WNU, CICT, BSCS)."],
        ["accreditation_frameworks", "Stores framework definitions (e.g., PACUCOA Undergraduate 2023)."],
        ["accreditation_areas", "Defines the ten Areas (Area I to Area X), titles, and numerical weights (sum = 30)."],
        ["accreditation_criteria", "Defines criteria under each Area, expected document types, and required document counts."],
        ["accreditation_levels", "Stores accreditation levels, labels, and general average threshold values."],
        ["users", "User accounts with assigned roles and departmental scopes."],
        ["area_assignments", "Maps users to an Area of a program as Area Chair, Co-Chair, or Member."],
        ["evidence_documents", "Uploaded file records with criterion ID, document type, effective date, and verification status."],
        ["readiness_scores", "Stores computed criterion scores and statuses per program; Area means and program rating."],
        ["accreditation_cycles", "Groups post-visit recommendations by program accreditation cycle."],
        ["accreditation_recommendations", "Stores post-visit survey opportunities for improvement and recommendations."],
        ["compliance_actions", "Stores sub-numbered actions taken, team verification text, and linked evidence IDs."],
        ["simulations", "Stores parameters and results of what-if simulation runs, isolated from production."],
        ["audit_log", "Records actor, action type, affected record, and timestamp for completed actions."],
    ]
    add_apa_table(
        doc,
        "Table 5",
        "Principal Data Entities",
        headers_t4,
        rows_t4,
        col_widths=[2.2, 3.8],
        note_str="Implemented in PostgreSQL via Supabase with relational foreign key integrity."
    )

    add_body_p(
        doc,
        "The database schema was implemented in PostgreSQL via Supabase, enforcing relational referential integrity, foreign key constraints, and granular Row-Level Security policies. Figure 6 presents the Entity-Relationship Diagram (ERD) detailing the primary keys, foreign keys, and cardinalities across the relational tables."
    )

    # Figure 6
    add_figure(
        doc,
        "Figure 6",
        "Entity-Relationship Diagram (ERD) of the Accreditation Management Database",
        "figures/figure6_entity_relationship_diagram.png",
        width_in_inches=5.8
    )

    add_subheading(doc, "System Process Flow")
    add_body_p(
        doc,
        "Figure 7 illustrates the overall lifecycle of the system from initial framework setup to post-visit compliance tracking across six integrated stages: framework configuration, evidence upload and automated tagging, independent verification with self-verification enforcement, automated rating calculation and executive dashboard display, what-if readiness simulation, and post-visit compliance matrix management. To detail how specific institutional roles interact with these functional capabilities, the distinct user flows for each role are discussed in Figures 8 through 14."
    )

    # Figure 7: Overall Summary Flow
    add_figure(
        doc,
        "Figure 7",
        "System Process Flow from Setup to Post-Visit Compliance Tracking",
        "figures/figure7_process_flow.png",
        width_in_inches=5.8
    )

    # 1. System Administrator
    add_body_p(
        doc,
        "**User Flow of the System Administrator.** The goal of the System Administrator is to establish and maintain the organizational hierarchy and secure user access profiles across the institution. The administrator authenticates into the administrative console, creates academic departments (e.g., CICT), defines degree programs (e.g., BSCS, BSIT), registers user accounts, assigns security roles, and inspects system-wide audit logs. During account creation and role modification, the system validates organizational unique constraints and email uniqueness, preventing duplicate account creations or malformed role assignments. Crucially, to maintain administrative neutrality and prevent evaluative tampering, the System Administrator is restricted from uploading accreditation evidence, modifying criterion scores, or verifying self-survey exhibits. The primary outputs of this flow are active department and program entities, provisioned user credential profiles, and timestamped administrative audit log entries."
    )
    add_figure(
        doc,
        "Figure 8",
        "User Flow of the System Administrator",
        "figures/figure8_flow_system_admin.png",
        width_in_inches=5.8
    )

    # 2. QA Officer
    add_body_p(
        doc,
        "**User Flow of the Quality Assurance Officer.** The goal of the Quality Assurance Officer is to establish standardized accreditation frameworks, configure evaluative areas and weights, define criteria provisions, and maintain institutional oversight of accreditation readiness. The QA Officer navigates to the Framework Configuration module to instantiate accreditation frameworks (such as the PACUCOA Undergraduate 2023 instrument). The officer configures the ten evaluative Areas, defines their standard numerical weights summing to thirty (30), establishes criteria provisions and required document proxy counts (R), and reviews readiness dashboards across university programs. The system validates framework mathematical integrity, requiring Area weights to sum exactly to 30 before activating a framework. When conducting documentary oversight, the QA Officer reviews uploaded exhibits across all Areas. In the verification workflow, the QA Officer holds institutional oversight authority and is exempt from the self-verification block in the current policy, enabling centralized institutional review when required. The principal outputs are active, standardized accreditation instruments, configured program criteria sets, validated institutional exhibits, and university-wide readiness summaries."
    )
    add_figure(
        doc,
        "Figure 9",
        "User Flow of the Quality Assurance Officer",
        "figures/figure9_flow_qa_officer.png",
        width_in_inches=5.8
    )

    # 3. Dean
    add_body_p(
        doc,
        "**User Flow of the Dean.** The goal of the College Dean is to provide executive leadership and monitor college-wide accreditation preparedness, simulation forecasts, and post-visit compliance progress across all departmental programs. The Dean authenticates into the executive portal and selects the college scope (CICT). The Dean inspects the Executive 5x2 Command Dashboard, observing color-coded Area status cards (Red, Amber, Yellow, Green) and evaluating overall program ratings against Candidate, Level I, and Level II floor rules. The Dean reviews isolated what-if readiness simulation scenarios to assess the impact of targeted criteria completion and inspects the four-column post-visit compliance matrix to verify progress on accreditor recommendations. The system enforces an executive read-only and analytical decision-support scope across college programs: the Dean is blocked from uploading exhibit files or manually altering calculated criterion scores, ensuring that executive assessments remain objective and grounded in verified faculty evidence. The outputs of this flow are college-wide accreditation evaluations, strategic resource allocation directives, and approved post-visit compliance tracking reports."
    )
    add_figure(
        doc,
        "Figure 10",
        "User Flow of the Dean",
        "figures/figure10_flow_dean.png",
        width_in_inches=5.8
    )

    # 4. Program Head
    add_body_p(
        doc,
        "**User Flow of the Program Head.** The goal of the Program Head is to oversee program-level accreditation preparation, delegate evaluative responsibilities, verify evidentiary exhibits, execute readiness simulations, and monitor real-time compliance against PACUCOA level thresholds. The Program Head enters the program workspace and accesses the Area Assignment module to assign faculty members to specific PACUCOA Areas as Area Chairs, Co-Chairs, or Members. The Program Head accesses the supervisory review queue to inspect exhibits submitted by committee members, examining uploaded documents, metadata, and extracted text layers. When reviewing exhibits, the system enforces the self-verification block: if the Program Head is the uploader of an exhibit (uploader_id = verifier_id), the verification action is disabled in the interface and rejected by database Row-Level Security policies, requiring another authorized verifier (such as the Area Chair or QA Officer) to approve it. If the exhibit was uploaded by another faculty member, the Program Head can mark it as verified or return it with comments. Additionally, the Program Head can configure and execute what-if readiness simulations targeting up to ten unresolved criteria and manage the four-column post-visit compliance matrix. The outputs comprise active committee assignments, verified program exhibits, isolated what-if simulation projections, updated compliance action items, and real-time program ratings."
    )
    add_figure(
        doc,
        "Figure 11",
        "User Flow of the Program Head",
        "figures/figure11_flow_program_head.png",
        width_in_inches=5.8
    )

    # 5. Area Chair and Co-Chair
    add_body_p(
        doc,
        "**User Flow of the Area Chair and Co-Chair.** The goal of the Area Chair and Co-Chair is to coordinate evidence collection, ensure document sufficiency, and verify uploaded exhibits within their assigned PACUCOA Area. Upon authentication, the Area Chair or Co-Chair accesses their assigned Area workspace, reviewing the active criteria checklist and required document proxy count (R). The chair accesses the verification queue to inspect pending exhibits submitted by area committee members, verifying file completeness, metadata accuracy, and extracted text-layer alignment. The system enforces strict role-based and area-scoped boundaries alongside the self-verification block: Area Chairs and Co-Chairs can only verify exhibits belonging to their assigned Area. When an Area Chair or Co-Chair attempts to verify an exhibit that they personally uploaded, the system detects matching identifiers (uploader_id = verifier_id) and blocks the verification button, returning an authorization rejection at the PostgreSQL Row-Level Security layer. In such cases, the exhibit must be verified by the Co-Chair, Program Head, or QA Officer. If the exhibit was uploaded by another member, the chair approves the exhibit as verified or rejects it with feedback. The outputs include verified Area exhibits, rejection notices with corrective remarks, updated Area documentary completion counts, and recalculated Area mean scores."
    )
    add_figure(
        doc,
        "Figure 12",
        "User Flow of the Area Chair and Co-Chair",
        "figures/figure12_flow_area_chair.png",
        width_in_inches=5.8
    )

    # 6. Faculty Member
    add_body_p(
        doc,
        "**User Flow of the Faculty Member.** The goal of the Faculty Member (working committee member) is to prepare, map, and upload legitimate institutional exhibits to support designated PACUCOA evaluative criteria. The faculty member accesses the evidence submission module, selects the assigned Area, and chooses the target criterion. The faculty member uploads digital exhibits (PDF, DOCX, XLSX, PNG, JPG) and enters metadata including document title, document type, academic school year, and effective dates. For text-layer PDF documents, the system automatically triggers server-side text extraction to suggest matching document types and dates. The system validates file types, file size constraints, and required metadata fields before committing the file to private object storage. Crucially, the system restricts faculty members to upload and view permissions: faculty members cannot approve or verify their own exhibits or any other exhibits, enforcing separation between evidence contribution and quality verification. The outputs are securely stored digital exhibits in private cloud storage, parsed document metadata records, and pending verification requests placed in the supervisory review queue."
    )
    add_figure(
        doc,
        "Figure 13",
        "User Flow of the Faculty Member",
        "figures/figure13_flow_faculty_member.png",
        width_in_inches=5.8
    )

    # 7. Alumni and Student Representative
    add_body_p(
        doc,
        "**User Flow of the Alumni and Student Representative.** The goal of the Alumni and Student Representative is to review high-level institutional accreditation progress and readiness achievements to support external stakeholder engagement without compromising data confidentiality. The representative authenticates into the stakeholder portal and accesses the sanitized executive readiness summary. The representative can view overall program readiness scores, accreditation level eligibility statuses (Candidate, Level I, Level II), and high-level Area progress badges. The system enforces a strict read-only boundary through database Row-Level Security: representatives are blocked from viewing individual confidential exhibits, accessing faculty profiles, uploading files, or altering scoring configurations. The outputs of this flow are high-level institutional readiness summary views and transparency reports."
    )
    add_figure(
        doc,
        "Figure 14",
        "User Flow of the Alumni and Student Representative",
        "figures/figure14_flow_alumni_student_rep.png",
        width_in_inches=5.8
    )

    add_subheading(doc, "Functional Modules")
    add_body_p(
        doc,
        "1. **Evidence Management and Mapping Module:** Enables faculty to upload files into Supabase Storage, mapped to specific criteria. When a PDF is uploaded, its text layer is extracted to suggest document types; scanned or image-only PDFs are not read. An Area Chair, Co-Chair, or Program Head reviews pending documents. The system prevents self-verification: for all roles except the QA Officer, a verification request is blocked in the interface and rejected by the database Row-Level Security policy when the verifying user is the uploader (uploader_id != verifier_id)."
    )
    add_body_p(
        doc,
        "2. **Readiness Scoring and Executive Dashboard Module:** Computes scores in real time. For each criterion, let R be the required documents and V the valid verified documents. The criterion score s (from 0.00 to 5.00) is computed piecewise: s = 0.00 when V = 0; s = max(1.00, 2.00 * (V / R)) when 0 < V < R; s = 3.00 + 2.00 * ((V / R) - 1) capped at 5.00 when V >= R. Area Means are calculated as the arithmetic average of criterion scores. The Program Rating is computed as:"
    )
    add_body_p(
        doc,
        "Program Rating = Sum(Area Mean * Area Weight) / Sum(Area Weight) = Sum(Area Mean * Area Weight) / 30"
    )
    add_body_p(
        doc,
        "The system evaluates ratings against PACUCOA dual-constraint rules: Candidate status (overall >= 3.00); Level I (overall >= 3.00, no Area mean < 3.00); Level II (overall >= 3.50, no Area mean < 3.50); Levels III and IV (overall >= 4.00, no individual criterion < 4.00). The Executive 5x2 Command Dashboard displays all ten Areas simultaneously in two rows of five cards, designed to avoid vertical scrolling and featuring color-coded status badges (Red: < 3.00; Amber: 3.00-3.49; Yellow: 3.50-3.99; Green: >= 4.00)."
    )
    add_body_p(
        doc,
        "3. **Readiness Simulation Module:** Allows administrators to select up to ten unresolved criteria, applies a simulated completion score of 4.00 (Very Good) to each, and recalculates projected Area means, program ratings, and level eligibility. Results are stored in isolated simulation tables without altering production records."
    )
    add_body_p(
        doc,
        "4. **Post-Visit Compliance Tracking Module:** Manages a four-column matrix that follows the format of the CICT BSCS Compliance Report (CICT, n.d.); the format is not mandated by PACUCOA or the QA Office. Column 1 (Opportunity for Improvement), Column 2 (PACUCOA Recommendation), Column 3 (Actions Taken, sub-numbered e.g. 1.1, 1.2), and Column 4 (Team Verification and Linked Exhibits)."
    )

    add_subheading(doc, "Illustration of the Scoring Mechanics")
    add_body_p(
        doc,
        "Table 6 presents a hypothetical computation illustrating how the mathematical weighting formula and floor rules operate across the ten Areas."
    )

    headers_t5 = ["Area", "Area Mean", "Weight", "Weighted Value"]
    rows_t5 = [
        ["I. Philosophy and Objectives", "4.00", "3", "12.00"],
        ["II. Faculty", "3.50", "3", "10.50"],
        ["III. Instruction", "3.00", "4", "12.00"],
        ["IV. Laboratory", "3.00", "3", "9.00"],
        ["V. Research", "2.50", "3", "7.50"],
        ["VI. Library", "3.50", "3", "10.50"],
        ["VII. Student Services", "4.00", "3", "12.00"],
        ["VIII. Social Orientation and Community Involvement", "3.00", "3", "9.00"],
        ["IX. Physical Plant and Facilities", "4.00", "2", "8.00"],
        ["X. Organization and Administration", "3.50", "3", "10.50"],
        ["Total", "--", "30", "101.00"],
    ]
    add_apa_table(
        doc,
        "Table 6",
        "Hypothetical Computation of a Program Rating (Illustration)",
        headers_t5,
        rows_t5,
        col_widths=[3.0, 1.0, 1.0, 1.0],
        note_str="Computed as 101.00 / 30 = 3.37. The program meets the Candidate threshold of 3.00 but fails Level I because Area V (2.50) is below the 3.00 floor constraint. These values are illustrative and are not BSCS results."
    )

    add_heading(doc, "Research Design")
    add_body_p(
        doc,
        "The study employed a Developmental Research Design with a descriptive evaluative component (Richey & Klein, 2007). The developmental component encompassed the engineering of the software following the System Development Life Cycle (SDLC; Pressman & Maxim, 2020) and Agile Scrum. The descriptive evaluative component assessed the technical and operational acceptability of the system using the ISO/IEC 25010 product quality model."
    )

    add_heading(doc, "Locale of the Study")
    add_body_p(
        doc,
        "The study was conducted at the College of Information and Communications Technology (CICT) and the Quality Assurance Office of STI West Negros University, located along Burgos Street, Bacolod City, Negros Occidental, Philippines. Figure 15 illustrates the geographical location and institutional vicinity of STI West Negros University, Burgos Street, Bacolod City."
    )
    add_figure(
        doc,
        "Figure 15",
        "Location of STI West Negros University, Burgos Street, Bacolod City",
        "figures/figure15_locale_map.png",
        width_in_inches=5.8
    )

    add_heading(doc, "Respondents of the Study (with sampling technique)")
    add_body_p(
        doc,
        "The study utilized a purposive sampling technique (Etikan et al., 2016), selecting twenty (20) respondents comprising fifteen (15) institutional stakeholders directly involved in accreditation management and curriculum delivery at STI West Negros University, and five (5) external IT experts. Purposive sampling was chosen because evaluating an accreditor-specific platform requires respondents who possess direct operational experience with PACUCOA self-survey workflows as well as technical professionals who can critically appraise software architecture and security. Table 7 details the respondent breakdown and their respective academic and professional qualifications."
    )

    headers_t6 = ["Respondent Category / Role", "n", "Qualification / Educational Background"]
    rows_t6 = [
        ["Quality Assurance (QA) Officer", "1", "Bachelor's degree with Quality Assurance professional certifications"],
        ["Dean, College of Information and Communications Technology (CICT)", "1", "PhD"],
        ["Program Heads (BSCS and BSIT)", "2", "BSCS Program Head holds an MSCS; BSIT Program Head's master's is ongoing (CAR)"],
        ["Faculty Members (Area Chairs and Committee Members)", "11", "1 MIT; 10 pursuing master's degrees"],
        ["IT Experts (External Systems and Software Evaluators)", "5", "1 DIT; 1 master's degree holder; 3 IT industry practitioners"],
        ["Total Respondents", "20", "--"],
    ]
    add_apa_table(
        doc,
        "Table 7",
        "Respondent Breakdown and Qualifications",
        headers_t6,
        rows_t6,
        col_widths=[2.8, 0.7, 2.5],
        note_str="Selected via purposive sampling across institutional accreditation stakeholders and external technical evaluators with verified computing credentials and industry experience."
    )

    add_body_p(
        doc,
        "To complement institutional stakeholder feedback with rigorous technical evaluation, five (5) IT experts were purposively selected based on demonstrated professional expertise in software development, cloud systems architecture, database management, or software quality evaluation, requiring a minimum of three to five years of professional industry experience. The IT expert panel comprised one (1) Doctor of Information Technology (DIT) holder, one (1) master's degree holder in computing, and three (3) active IT industry practitioners specializing in web technologies and enterprise software evaluation. This dual-group composition ensured that the software was evaluated both from an operational domain standpoint by end users immersed in PACUCOA self-survey workflows and from an architectural and technical standpoint by external computing professionals."
    )

    add_body_p(
        doc,
        "Evaluation responses from both institutional stakeholders and IT experts were collected anonymously, with no names or email addresses recorded on the evaluation forms, and all ratings are reported in aggregate only."
    )

    add_heading(doc, "Data Gathering Procedure")
    add_body_p(
        doc,
        "Data gathering was executed systematically through a six-stage procedure aligned with the project development timeline:"
    )
    add_body_p(
        doc,
        "(a) **Document Analysis:** From August 10 to August 25, 2026, the researcher conducted a comprehensive documentary analysis of the PACUCOA Manual of Accreditation (Revised September 2023) and the CICT BSCS Compliance Report. This analysis extracted the ten undergraduate evaluative Areas, the official weight distribution (summing to 30), Candidate, Level I, and Level II floor rules, seventy-nine (79) evaluative criteria, and the four-column post-visit compliance matrix format."
    )
    add_body_p(
        doc,
        "(b) **Requirements Consultations:** From August 26 to August 31, 2026, formal consultations were conducted with key institutional stakeholders at STI WNU, including the Quality Assurance Officer, the CICT Dean, the BSCS and BSIT Program Heads, and faculty Area Chairs. These sessions established user role boundaries, criteria proxy requirements (R), supervisory workflows, and the critical security requirement of enforcing separation of duties via an automated self-verification block."
    )
    add_body_p(
        doc,
        "(c) **System Demonstration and Use:** From October 5 to October 12, 2026, following the deployment of the prototype on the cloud platform, hands-on demonstration and user interaction sessions were conducted. Participants tested evidence mapping, PDF text extraction, document verification, the Executive 5x2 Command Dashboard, the what-if simulation sandbox, and post-visit compliance tracking using actual BSCS accreditation exhibits."
    )
    add_body_p(
        doc,
        "(d) **Administration of the ISO/IEC 25010 Questionnaire:** From October 14 to October 20, 2026, the standardized evaluation questionnaire was administered to all twenty (20) purposive respondents (15 institutional users and 5 IT experts). The questionnaire evaluated the eight software product quality characteristics: Functional Suitability, Performance Efficiency, Compatibility, Usability, Reliability, Security, Maintainability, and Portability."
    )
    add_body_p(
        doc,
        "(e) **Tabulation and Treatment of Data:** From October 21 to October 24, 2026, the survey responses were compiled and subjected to statistical analysis, computing the weighted mean and standard deviation for each characteristic across user (M = 4.83, SD = 0.37) and expert (M = 4.40, SD = 0.53) cohorts, yielding an overall combined grand mean of 4.72 (SD = 0.46) per Table 8."
    )
    add_body_p(
        doc,
        "(f) **Ethical Handling of Responses:** Throughout the data gathering process, responses were gathered anonymously, with no personal names or email addresses recorded on the survey instruments, and all participant feedback was treated with strict confidentiality in accordance with informed consent protocols. All evaluation sheets were securely archived and processed solely in aggregate format, guaranteeing respondent privacy in compliance with Republic Act No. 10173."
    )

    add_heading(doc, "Data Analysis")

    add_subheading(doc, "Evaluation Instrument")
    add_body_p(
        doc,
        "The evaluation instrument was adapted from the ISO/IEC 25010 software product quality model (ISO & IEC, 2011). The questionnaire employs a 5-point Likert scale (Likert, 1932) measuring eight quality characteristics: Functional Suitability, Performance Efficiency, Compatibility, Usability, Reliability, Security, Maintainability, and Portability."
    )

    add_subheading(doc, "Statistical Treatment")
    add_body_p(
        doc,
        "Survey responses were tabulated and analyzed using weighted mean and standard deviation. The Weighted Mean (WM) is computed as:"
    )
    add_body_p(
        doc,
        "WM = Sum(f * x) / n"
    )
    add_body_p(
        doc,
        "where f is the frequency of rating x, and n is the total number of respondents. Computed weighted means were interpreted using standard equal intervals of 0.80, as established in Table 8."
    )

    headers_t7 = ["Mean Range", "Verbal Interpretation"]
    rows_t7 = [
        ["4.21 - 5.00", "Strongly Agree / Very Highly Acceptable"],
        ["3.41 - 4.20", "Agree / Highly Acceptable"],
        ["2.61 - 3.40", "Neutral / Moderately Acceptable"],
        ["1.81 - 2.60", "Disagree / Slightly Acceptable"],
        ["1.00 - 1.80", "Strongly Disagree / Not Acceptable"],
    ]
    add_apa_table(
        doc,
        "Table 8",
        "Interpretation of Weighted Means",
        headers_t7,
        rows_t7,
        col_widths=[2.5, 3.5],
        note_str="Standard five-point Likert scale interpretation intervals."
    )

    add_heading(doc, "Ethical Considerations")
    add_body_p(
        doc,
        "This research strictly adhered to institutional research ethics protocols and accepted ethical standards in software engineering. Written permission was obtained from the Dean of the College of Information and Communications Technology and the Quality Assurance Office prior to system testing and evaluation data gathering. Institutional clearance for the prototype, the use of BSCS compliance records, and the participation of university personnel in the software evaluation was formally secured."
    )
    add_body_p(
        doc,
        "Respondents were informed of the purpose of the study, the voluntary nature of participation, and their right to withdraw at any time, and informed consent was obtained before data collection. Responses were collected anonymously with no names or email addresses recorded, ensuring personal identifiers were completely omitted, and results are reported in aggregate only."
    )
    add_body_p(
        doc,
        "The study complied with the Data Privacy Act of 2012 (Republic Act No. 10173, 2012). Only data relevant to system testing and quality evaluation were collected, and all personal information was kept confidential. System testing and demonstrations utilized authorized, sanitized institutional documents. At the architectural level, access control was enforced through PostgreSQL Row-Level Security policies and authenticated, private cloud storage buckets."
    )
    add_body_p(
        doc,
        "Sources were comprehensively acknowledged using the APA 7th edition referencing style. The readiness ratings produced by the system were presented as indicative estimates of documentary sufficiency for self-survey preparation; they did not substitute for, or guarantee, the official evaluative decisions of PACUCOA."
    )

    add_heading(doc, "Declaration of the Use of AI")
    add_body_p(
        doc,
        "In strict compliance with institutional research ethics guidelines and contemporary academic integrity standards, the researcher formally discloses the specific extent and nature of Artificial Intelligence (AI) utilization during the conduct, development, and documentation of this capstone project."
    )
    add_body_p(
        doc,
        "Generative AI tools and large language model assistants (specifically Claude and Gemini within advanced agentic development environments) were employed strictly as interactive pair-programming and editorial support instruments. These technologies assisted with technical code refactoring, TypeScript type definition validation, CSS layout alignment, automated script scaffolding for document formatting, and linguistic polishing of manuscript drafts."
    )
    add_body_p(
        doc,
        "The researcher affirms that no generative AI or autonomous machine learning model was used to fabricate empirical evaluation data, invent stakeholder survey responses, or generate statistical results. The underlying system architecture, relational database entity relationships, PACUCOA dual-constraint mathematical scoring algorithms, role-based access control policies, empirical data collection from the twenty (20) respondents, and final conclusions were conceptualized, implemented, critically analyzed, and verified by the researcher. Full responsibility for the technical validity, academic integrity, and factual correctness of this manuscript rests entirely with the author."
    )

    print("Chapter 3 generated successfully.")

print("Chapters 1 to 3 module defined.")

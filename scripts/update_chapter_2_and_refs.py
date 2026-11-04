import io

def update_chapter_2_and_references():
    # 1. Update Chapter 2 in scripts/book_chapters_1_to_3.py
    ch1_to_3_path = "scripts/book_chapters_1_to_3.py"
    with io.open(ch1_to_3_path, "r", encoding="utf-8") as f:
        content = f.read()

    # Locate start of add_chapter_2 and start of add_chapter_3
    start_marker = 'def add_chapter_2(doc):'
    end_marker = 'def add_chapter_3(doc):'
    assert start_marker in content, "add_chapter_2 not found"
    assert end_marker in content, "add_chapter_3 not found"

    new_chapter_2 = '''def add_chapter_2(doc):
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
        "Empirical research demonstrates that evaluating web-based academic systems against ISO/IEC 25010 criteria provides an objective methodology for validating software acceptability among educational stakeholders. In an empirical evaluation of educational management platforms in Philippine higher education, Urera and Balahadia (2019) determined that functional suitability and usability are critical predictors of system adoption among faculty members and academic administrators. More recently, Lagman et al. (2024) developed an enterprise-level digital governance platform for Philippine state universities and colleges, employing an Agile development methodology and validating system quality across institutional administrators using the ISO/IEC 25010 model. Their findings confirmed that rigorous adherence to standardized quality characteristics guarantees data security, architectural maintainability, and high user acceptance in higher education institutions (Lagman et al., 2024). In alignment with this established methodology, the system engineered in this study was formally evaluated under the ISO/IEC 25010 quality model by fifteen (15) purposive institutional respondents, verifying its software quality, security controls, and operational suitability for accreditation governance."
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

'''

    content_before = content[:content.index(start_marker)]
    content_after = content[content.index(end_marker):]
    updated_content = content_before + new_chapter_2 + content_after

    with io.open(ch1_to_3_path, "w", encoding="utf-8") as f:
        f.write(updated_content)
    print("Updated Chapter II in", ch1_to_3_path)

    # 2. Update References in scripts/book_chapters_4_to_end.py
    ch4_to_end_path = "scripts/book_chapters_4_to_end.py"
    with io.open(ch4_to_end_path, "r", encoding="utf-8") as f:
        c4 = f.read()

    ref_start = 'def add_references(doc):'
    ref_end = 'def add_appendices(doc):'
    assert ref_start in c4, "add_references not found in c4"
    assert ref_end in c4, "add_appendices not found in c4"

    new_references = '''def add_references(doc):
    """Generates REFERENCES section in APA 7th format."""
    add_major_section_heading(doc, "REFERENCES")

    references_list = [
        "AchieveIt. (2024). *Accreditation management software: Streamline compliance and manage your institutional accreditation*. https://www.achieveit.com/?p=59266",
        "Aftab, M. U., Qin, Z., Hundera, N. W., Ariyo, O., Son, S. T., & Dinh, T. V. (2019). Permission-based separation of duty in dynamic role-based access control model. *Symmetry*, 11(5), Article 669. https://doi.org/10.3390/sym11050669",
        "Akdemir, N., Peterson, L. N., Campbell, C. M., & Scheele, F. (2020). Evaluation of continuous quality improvement in accreditation for medical education. *BMC Medical Education*, 20(Suppl 1), Article 308. https://doi.org/10.1186/s12909-020-02124-2",
        "Aldaba, F. T., Sescon, J. T., & Alconis, K. E. (2024). *Strengthening CHED's developmental and regulatory capacity* (PIDS Discussion Paper Series No. 2024-41). Philippine Institute for Development Studies. https://www.pids.gov.ph/publication/discussion-papers/strengthening-ched-s-developmental-and-regulatory-capacity",
        "Al-Qawasmi, A.-R. (2026). A Web-based academic quality management system for evidence traceability and continuous improvement in engineering education: The QAMS case study. *Quality Assurance in Education*, 34(1), 45–62. https://doi.org/10.1108/QAE-05-2026-0208",
        "Aquino, J. M. D. R. (2025). Best practices of high performing higher education institutions in the Philippines towards the development of harmonized quality-assured instructional leadership framework. *Frontiers in Education*, 10, Article 1663289. https://doi.org/10.3389/feduc.2025.1663289",
        "Beck, K., Beedle, M., van Bennekum, A., Cockburn, A., Cunningham, W., Fowler, M., Grenning, J., Highsmith, J., Hunt, A., Jeffries, R., Kern, J., Marick, B., Martin, R. C., Mellor, S., Schwaber, K., Sutherland, J., & Thomas, D. (2001). *Manifesto for agile software development*. https://agilemanifesto.org/",
        "College of Information and Communications Technology. (n.d.). *BSCS compliance report*. STI West Negros University.",
        "Commission on Higher Education. (2019). *Policies and guidelines on the grant of autonomous and deregulated status to private higher education institutions* (CHED Memorandum Order No. 12, Series of 2019). Republic of the Philippines. https://ched.gov.ph/cmo-no-12-s-2019/",
        "Conchada, M. I., & Tiongco, M. M. (2015). *A review of the accreditation system for Philippine higher education institutions* (PIDS Discussion Paper Series No. 2015-30). Philippine Institute for Development Studies. https://doi.org/10.62986/dp2015.30",
        "Creatrix Campus. (2023). *Accreditation management software for higher education: Automate institutional and program accreditation workflows*. https://creatrixcampus.com/accreditation-management-software",
        "Etikan, I., Musa, S. A., & Alkassim, R. S. (2016). Comparison of convenience sampling and purposive sampling. *American Journal of Theoretical and Applied Statistics*, 5(1), 1–4. https://doi.org/10.11648/j.ajtas.20160501.11",
        "Farhadighalati, N., Estrada-Jimenez, L. A., Nikghadam-Hojjati, S., & Barata, J. (2025). A systematic review of access control models: Background, existing research, and challenges. *IEEE Access*, 13, 14210–14235. https://doi.org/10.1109/ACCESS.2025.3533145",
        "Groll, S., Fuchs, L., & Pernul, G. (2025). Separation of duty in information security. *ACM Computing Surveys*, 57(3), 1–38. https://doi.org/10.1145/3715959",
        "International Organization for Standardization & International Electrotechnical Commission. (2011). *Systems and software engineering — Systems and software quality requirements and evaluation (SQuaRE) — System and software quality models* (ISO/IEC 25010:2011). https://www.iso.org/standard/35733.html",
        "International Organization for Standardization & International Electrotechnical Commission. (2023). *Systems and software engineering — Systems and software Quality Requirements and Evaluation (SQuaRE) — Product quality model* (ISO/IEC 25010:2023). https://www.iso.org/standard/78176.html",
        "Lagman, A. C., Ramirez, I. C. R., Esteban, A. P., Rivera, R. P. L., Delos Santos, R., & Juliano, J. J. (2024). Development and evaluation of an enterprise-level information system for digital governance in Philippine SUCs using Agile software methodology and ISO/IEC 25010 software quality model. In *2024 IEEE 16th International Conference on Humanoid, Nanotechnology, Information Technology, Communication and Control, Environment, and Management (HNICEM)* (pp. 1–6). IEEE. https://doi.org/10.1109/hnicem64917.2024.11258693",
        "Likert, R. (1932). A technique for the measurement of attitudes. *Archives of Psychology*, 22(140), 1–55.",
        "Makki, A. A., Sindi, H. F., Brdesee, H., Alsaggaf, W., Al-Hayani, A., & Al-Youbi, A. O. (2022). Goal programming and mathematical modelling for developing a capacity planning decision support system-based framework in higher education institutions. *Applied Sciences*, 12(3), Article 1702. https://doi.org/10.3390/app12031702",
        "Nauman, M., Aziz, Z., Rehman, M. U., & Khan, M. (2021). Guaranteeing correctness of machine learning based decision making at higher educational institutions. *IEEE Access*, 9, 87834–87848. https://doi.org/10.1109/ACCESS.2021.3088901",
        "Pardiñan, E. G., Bondad, R. M., & Mangubat, J. C. (2024). Key informants' perception on records digitization and a web-based technology platform for accreditation of Philippine State Universities and Colleges. *Education and Information Technologies*, 30, 11127–11150. https://doi.org/10.1007/s10639-024-13256-z",
        "Philippine Association of Colleges and Universities Commission on Accreditation. (2023). *Manual of accreditation* (Rev. ed.). PACUCOA.",
        "Philippine Daily Inquirer. (2013a, September 5). STI to acquire West Negros University. *Inquirer Technology*. https://technology.inquirer.net/?p=28933",
        "Philippine Daily Inquirer. (2013b, October 3). STI acquires West Negros U. *Inquirer Business*. https://business.inquirer.net/?p=145807",
        "Pressman, R. S., & Maxim, B. R. (2020). *Software engineering: A practitioner's approach* (9th ed.). McGraw-Hill Education.",
        "Ramos, D. L. T. (2024). Quality assurance information system for state universities and colleges in the Philippines. In *Information Systems for Intelligent Systems* (Lecture Notes in Networks and Systems, Vol. 1743, pp. 135–146). Springer. https://doi.org/10.1007/978-3-032-13006-8_12",
        "Republic Act No. 10173. (2012). *Data Privacy Act of 2012*. Republic of the Philippines. https://www.privacy.gov.ph/data-privacy-act/",
        "Richey, R. C., & Klein, J. D. (2007). *Design and development research: Methods, strategies, and issues*. Lawrence Erlbaum Associates.",
        "Samaranayake, S., Gunawardena, A. D. A., & Meyer, R. R. (2023). An interactive decision support system for college degree planning. *Athens Journal of Education*, 10(1), 105–124. https://doi.org/10.30958/aje.10-1-6",
        "Sandhu, R. S., Coyne, E. J., Feinstein, H. L., & Youman, C. E. (1996). Role-based access control models. *Computer*, 29(2), 38–47. https://doi.org/10.1109/2.485845",
        "Schellekens, L. H., Bok, H. G. J., de Jong, N., van der Schaaf, M. F., & van der Vleuten, C. P. M. (2023). Developing a digital application for quality assurance of assessment programmes in higher education. *Quality Assurance in Education*, 31(2), 346–366. https://doi.org/10.1108/QAE-03-2022-0066",
        "Schwaber, K., & Sutherland, J. (2020). *The Scrum guide: The definitive guide to Scrum: The rules of the game*. https://scrumguides.org/scrum-guide.html",
        "Sidhimantra, P. D., Sukoco, S., & Wardana, K. A. (2024). Development of repository system to support accreditation process: The role of information system to vocational education. *AIP Conference Proceedings*, 3116(1), Article 070020. https://doi.org/10.1063/5.0210441",
        "STI West Negros University. (n.d.). *About us*. https://stiwnu.com/sti/aboutsti",
        "Supabase. (n.d.). *Row level security*. https://supabase.com/docs/guides/database/postgres/row-level-security",
        "Tarigan, T. M., & Zahara, F. (2024). Internal quality assurance system in achieving accreditation scores for Islamic religious higher education. *Al-Hayat: Journal of Islamic Education*, 8(2), 677–698. https://doi.org/10.35723/ajie.v8i2.638",
        "Urera, F. L. J., & Balahadia, F. F. (2019). Evaluation of web-based information and e-learning module architectures using ISO/IEC 25010. *International Journal of Computing Sciences Research*, 3(1), 163–188. https://doi.org/10.25147/ijcsr.2017.001.1.31",
        "Vercel. (n.d.). *Next.js documentation*. https://nextjs.org/docs",
        "Watermark Insights. (2024). *Watermark Planning & Self-Study: Continuous improvement and accreditation reporting*. https://watermarkinsights.com/explore/accreditation/",
    ]

    for ref in references_list:
        add_reference_p(doc, ref)

    print("References generated successfully.")

'''
    c4_before = c4[:c4.index(ref_start)]
    c4_after = c4[c4.index(ref_end):]
    updated_c4 = c4_before + new_references + c4_after

    with io.open(ch4_to_end_path, "w", encoding="utf-8") as f:
        f.write(updated_c4)
    print("Updated References in", ch4_to_end_path)

if __name__ == "__main__":
    update_chapter_2_and_references()

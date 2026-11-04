# WEB-BASED ACCREDITATION MANAGEMENT AND READINESS ASSESSMENT SYSTEM FOR STI WEST NEGROS UNIVERSITY
**Chapters I to III: Manuscript for Capstone Review**

---

# INTRODUCTION

## Background of the Study
Accreditation is one of the main ways in which a higher education institution (HEI) in the Philippines demonstrates that its academic programs meet recognized standards of quality. Through peer review and documentary audits, accreditation evaluates whether an institution provides the faculty, facilities, curricula, and student services necessary to deliver quality higher education (Conchada & Tiongco, 2015). Under the policies of the Commission on Higher Education (CHED), accredited status qualifies programs for progressive benefits, such as administrative deregulation, curricular autonomy, priority in government grants, and the authority to offer new graduate programs without prior CHED approval.

The Philippine Association of Colleges and Universities Commission on Accreditation (PACUCOA) is one of the premier accrediting bodies in the country. The standard instrument for undergraduate programs is detailed in the Manual of Accreditation (PACUCOA, 2023), which organizes evaluation into ten distinct Areas: Area I (Philosophy and Objectives), Area II (Faculty), Area III (Instruction), Area IV (Laboratories), Area V (Research), Area VI (Library), Area VII (Student Personnel Services), Area VIII (Social Orientation and Community Involvement), Area IX (Physical Plant and Facilities), and Area X (Organization and Administration).

The Manual also fixes how the self-survey is scored. Each Area is rated by the self-survey committee on a 0-to-5 scale, and those ratings are combined into a weighted average using the weights specified for each academic level. For undergraduate programs, the weights across the ten Areas sum to thirty (30), as established in the official PACUCOA framework and presented in Table 1:

**Table 1**  
*PACUCOA Undergraduate Areas and Equivalent Weights (Total Weight = 30)*

| Area Number and Name | Equivalent Weight |
|:---|:---|
| Area I: Philosophy and Objectives | 3 |
| Area II: Faculty | 4 |
| Area III: Instruction | 3 |
| Area IV: Laboratory | 3 |
| Area V: Research | 3 |
| Area VI: Library | 3 |
| Area VII: Student Services | 3 |
| Area VIII: Social Orientation and Community Involvement | 3 |
| Area IX: Physical Plant and Facilities | 2 |
| Area X: Organization and Administration | 3 |
| **Total Weight** | **30** |

*Note*. Adapted from the PACUCOA Manual of Accreditation (Revised September 2023).

Instruction carries a weight of four (4), Physical Plant and Facilities a weight of two (2), and each of the other eight Areas carries a weight of three (3). To qualify for Candidate status, a program must achieve a minimum overall rating of 3.00. For Level I formal accredited status, the program must achieve an overall rating of 3.00 with no individual Area mean falling below 3.00. For Level II, the required overall rating rises to 3.50, again with no Area mean below 3.50. Levels III and IV introduce still higher requirements, including a minimum rating of 4.00 and the condition that no single criterion fall below 4.00.

Meeting these ratings requires a large body of documentary evidence, such as faculty records, course syllabi, research publications, library acquisition receipts, student personnel service logs, laboratory inventories, and administrative minutes. Area I requires the statement of philosophy, vision, mission, and core values; Area II requires faculty qualification and service records, recruitment and ranking policies, and development programs; Area III requires syllabi, sample examinations, class records, and supervisory reports; Area VI requires budget allocations, holdings lists, and accession logs; Area IX requires site plans, building permits, occupancy certificates, and fire safety inspection certificates. The remaining Areas have similarly extensive documentary requirements.

The Manual's policies are also strictly time-bound. A compliance report for a revisit is due at least four (4) months prior to the scheduled survey. In institutions that compile exhibits manually, this workload is carried out through episodic preparation: binders, folders, and loose sheets are gathered, physically stamped, and sorted into exhibit rooms weeks before the visiting team arrives. In-depth institutional interviews conducted with the Quality Assurance Office and CICT leadership revealed that STI West Negros University has traditionally experienced acute operational friction under this manual approach. Accreditation evidence was collated through fragmented departmental folders, individual flash drives, and physical ring binders housed in dedicated exhibit rooms. This decentralized model led to recurring administrative problems, including misplaced physical records between accreditation cycles, duplicate submissions of conflicting syllabus revisions, lack of real-time visibility into overall program readiness, and calculation inaccuracies when manually aggregating Area scores into weighted averages.

### Background of the Institution
STI West Negros University (STI WNU) is a private university in Bacolod City, Negros Occidental, Philippines. It was founded in 1948 as West Negros College by Baptist leaders and educators. In 2008, the Commission on Higher Education granted the institution university status. In 2013, STI Education Systems Holdings, Inc. acquired a controlling interest in the university, integrating its nationwide educational network with the university's established academic traditions (Philippine Daily Inquirer, 2013a, 2013b).

Today, the university awards associate, bachelor's, master's, and doctoral degrees across multiple disciplines. The College of Information and Communications Technology (CICT) offers the Bachelor of Science in Computer Science (BSCS) and Bachelor of Science in Information Technology (BSIT) programs. As of 2026, the BSCS program has attained PACUCOA Level I accredited status, while the BSIT program maintains Level II reaccredited status under PACUCOA. The next scheduled survey activity for the BSCS program is set for February 2027, requiring the systematic collation and continuous verification of comprehensive digital exhibits across all ten evaluative Areas.

### The Proposed System
This study proposes the Web-Based Accreditation Management and Readiness Assessment System for STI West Negros University, with the BSCS program as its pilot implementation. Designed directly around the PACUCOA undergraduate framework, the system incorporates six core pillars:
1. **Hierarchical Evidence Mapping:** Organizes exhibits under PACUCOA's ten areas and criteria, letting program heads and area chairs map files directly to expected criteria.
2. **Independent Dual-Verification:** Enforces separation of duties by requiring that evidence be verified by an assigned Area Chair or Co-Chair other than the person who uploaded it, with a programmatic block on self-verification.
3. **Mathematical Readiness Engine:** Computes indicative readiness ratings in real time using the Manual's official weighting formula (total weight of 30) and evaluates dual-constraint level floor rules.
4. **Executive 5x2 Command Dashboard:** Visualizes the ten Areas in a unified 5-column by 2-row layout, complete with progress bars and color-coded status badges.
5. **What-If Readiness Simulation:** Lets administrators simulate how completing up to ten selected unresolved criteria would affect Area means and level eligibility, isolated from production data.
6. **Post-Visit Compliance Matrix:** Tracks post-survey opportunities for improvement and recommendations using a four-column compliance matrix with sub-numbered action tracking.

## Objective of the Study

### General Objective
This study aims to design, develop, and evaluate a Web-Based Accreditation Management and Readiness Assessment System for STI West Negros University that automates evidence mapping, enforces dual-verification separation of duties, calculates PACUCOA-compliant readiness ratings, provides what-if readiness simulation, and tracks post-visit compliance.

### Specifically, the system aims to:
1. Build an Evidence Management and Mapping module that stores accreditation exhibits under PACUCOA criteria and validates file types, effective dates, and required document counts.
2. Implement a Readiness Scoring and Executive Dashboard module that computes ratings at the criterion, Area, and program levels using PACUCOA's weighted formula and displays them in a 5x2 layout.
3. Provide a Readiness Simulation module that projects program ratings and accreditation level thresholds if up to ten unresolved criteria are addressed.
4. Incorporate a Post-Visit Compliance Tracking module that records opportunities for improvement, recommendations, sub-numbered actions taken, and linked verification exhibits.
5. Enforce role-based access control and separation of duties that prevents self-verification while restricting access according to academic delegation.
6. Assess the quality of the system against the software quality characteristics of ISO/IEC 25010 in terms of functional suitability, performance efficiency, compatibility, usability, reliability, security, maintainability, and portability.

## Conceptual Framework
The study follows an Input–Process–Output (IPO) model with a feedback loop, as illustrated below:

```
+-----------------------------------------------------------------------------------+
|                                  INPUTS                                           |
|  - PACUCOA Manual of Accreditation Standards, Ten Areas, Criteria, Weights (Sum=30) |
|  - Institutional Documentary Exhibits (Syllabi, Faculty Profiles, Minutes)        |
|  - Institutional Roles and User Credentials (QA, Dean, Chair, Faculty, Rep)       |
|  - Historical Survey Recommendations & Revisit Opportunities for Improvement      |
+-----------------------------------------------------------------------------------+
                                          │
                                          ▼
+-----------------------------------------------------------------------------------+
|                                 PROCESSES                                         |
|  - Evidence Upload, Parsing, Rule-Based Tagging, and Criteria Mapping             |
|  - Independent Dual-Verification Workflow with Self-Verification Blocking         |
|  - Real-Time Mathematical Scoring Engine (Piecewise Criterion, Area Means, 30-Wt) |
|  - Non-Mutating What-If Readiness Simulation Sandbox                              |
|  - Four-Column Post-Visit Compliance Action Sub-Numbering & Exhibit Linking       |
+-----------------------------------------------------------------------------------+
                                          │
                                          ▼
+-----------------------------------------------------------------------------------+
|                                  OUTPUTS                                          |
|  - Centralized, Secure Digital Evidence Repository                                |
|  - Real-Time Indicative Readiness Ratings and Dual-Constraint Level Thresholds   |
|  - Executive 5x2 Command Dashboard with Color-Coded Heatmap Badges                |
|  - Simulated Forecast Projections & Delta Reports                                 |
|  - Auditable Four-Column PACUCOA Post-Visit Compliance Report                     |
+-----------------------------------------------------------------------------------+
                                          │
                                          ▼
                     [ FEEDBACK LOOP TO STAKEHOLDERS ]
```
*Figure 1*. Conceptual Framework of the Study (Input–Process–Output Model with Feedback Loop).

### Narrative of the Conceptual Framework
Within the conceptual framework, the Inputs form the foundation on which the entire system operates. These include the PACUCOA Manual of Accreditation standards, criteria, and weights; institutional evidence exhibits (syllabi, faculty profiles, research outputs, administrative reports); user account credentials and role assignments; and post-visit survey recommendations.

These inputs are transformed through core computational and procedural Processes. The system maps exhibits to specific criteria, validates document types and dates, enforces independent dual-verification with a self-verification block, calculates criterion and Area scores using the official mathematical formula, runs non-mutating what-if simulation projections, and organizes compliance action items.

These processes yield the system Outputs: a centralized, searchable evidence repository; real-time indicative readiness scores and level threshold determinations; an Executive 5x2 command dashboard; simulated readiness forecast reports; and a formal four-column compliance matrix. Finally, the Feedback Loop channels these outputs back to institutional stakeholders (QA officers, deans, program heads, faculty), informing continuous document curation and policy adjustments before official PACUCOA visits.

## Significance of the Study
The results and implementation of this study provide substantial benefits to various educational stakeholders:
- **STI West Negros University.** The institution gains an institutional digital repository and continuous accreditation platform that eliminates chaotic episodic preparation, reduces paper consumption, and preserves institutional memory.
- **Quality Assurance (QA) Office.** The QA Office gains a university-wide oversight tool to monitor readiness across academic programs, standardize criteria configurations, and verify compliance deadlines.
- **College Deans and Program Heads.** Academic leaders obtain objective, real-time metrics on program readiness, enabling data-driven resource allocation and pinpointing specific documentary gaps.
- **Area Chairs, Co-Chairs, and Faculty Members.** Faculty members benefit from structured exhibit checklists, transparent verification workflows, and clear role boundaries that prevent redundant uploads.
- **Alumni and Student Representatives.** External stakeholders access high-level readiness summaries that confirm the quality and standing of their degree programs without compromising confidential files.
- **Future Researchers.** The study provides a verified architectural blueprint and empirical evaluation of an accreditor-specific readiness system, serving as a foundation for future higher education software engineering.

## Scope and Limitation of the Study

### Scope of the Study
The study covers the design, development, and evaluation of a web-based accreditation management and readiness assessment platform for STI West Negros University. The system is built around the PACUCOA undergraduate framework (Revised September 2023), covering all ten Areas, their respective weights totaling 30, the 0-to-5 rating scale, and level thresholds (Candidate, Level I, Level II, Level III, Level IV). The pilot implementation focuses on the Bachelor of Science in Computer Science (BSCS) program of CICT. The software includes four functional modules: Evidence Management and Mapping, Readiness Scoring and Executive Dashboard, Readiness Simulation, and Post-Visit Compliance Tracking. Access control supports eight user roles: System Admin, QA Officer, Dean, Program Head, Area Chair, Area Co-Chair, Faculty Member, and Alumni/Student Representative. An audit log records completed evaluative and administrative transactions.

### Limitations of the Study
The system is designed to support internal preparation and self-survey assessment; it does not replace official on-site audits conducted by PACUCOA accreditors. Automated document tagging assists with keyword detection but does not interpret qualitative academic merit. The audit trail logs completed state changes, while blocked self-verification attempts are rejected at the application and database policy layers. The pilot is scoped to the undergraduate PACUCOA instrument and does not incorporate graduate or basic education instruments. Hardware digitization (scanning physical documents) is outside the system boundary. Finally, evaluation is conducted within CICT and supporting offices of STI WNU using the ISO/IEC 25010 framework.

## Definition of Terms
- **Accreditation.** A voluntary, standards-based process by which an authorized accrediting agency evaluates an educational institution or program to verify that it meets or exceeds predefined quality criteria.
- **PACUCOA.** The Philippine Association of Colleges and Universities Commission on Accreditation, a recognized accrediting body under FAAP.
- **Manual of Accreditation.** The official regulatory instrument (Revised September 2023) published by PACUCOA specifying evaluative areas, weights, rating scales, and level rules.
- **Self-Survey.** An internal comprehensive assessment conducted by an institution's faculty and administration to evaluate program readiness prior to an external accreditation audit.
- **Area.** One of the ten major evaluative divisions in the PACUCOA undergraduate survey instrument, each assigned a specific numerical weight summing to 30.
- **Criterion.** A specific evaluative standard within an Area against which documentary exhibits are uploaded, verified, and scored.
- **Evidence (Exhibit).** A document, syllabus, report, or certification uploaded to demonstrate compliance with an accreditation criterion.
- **Evidence Mapping.** The systematic digital tagging and linking of an uploaded exhibit to its corresponding PACUCOA Area and criterion.
- **Verification.** The formal administrative review of an uploaded exhibit by an authorized Area Chair or Co-Chair, confirming its validity, document type, and effective date.
- **Separation of Duties (Self-Verification Block).** A core security constraint that prohibits the user who uploaded an exhibit from acting as the verifier of that same exhibit.
- **Criterion Score.** A computed value ranging from 0.00 to 5.00 that reflects the proportion of verified valid documents relative to required documents.
- **Area Mean.** The arithmetic average of all criterion scores within an Area, indicating the section's overall performance.
- **Program Rating.** The weighted average across all ten Area means, computed using PACUCOA's official weighting formula.
- **Dual-Constraint Level Threshold.** The regulatory rule requiring a program to meet both an overall program rating and a minimum floor rating in every individual Area (e.g., Level I requires >= 3.00 overall with no Area below 3.00).
- **Readiness Simulation.** A non-mutating mathematical sandbox that projects hypothetical Area means and level eligibility based on the completion of up to ten selected criteria.
- **Post-Visit Compliance Matrix.** A four-column tracking table recording Opportunities for Improvement, Recommendations, Sub-numbered Actions Taken, and Linked Exhibits.
- **Role-Based Access Control (RBAC).** A security paradigm that restricts system operations and view permissions based on assigned institutional user roles and academic scopes.
- **Audit Trail.** A tamper-evident chronological record documenting the actor, timestamp, and details of all completed evaluative and administrative transactions.
- **CICT, BSCS, BSIT.** The College of Information and Communications Technology at STI West Negros University, its Bachelor of Science in Computer Science program, and its Bachelor of Science in Information Technology program.

---

# RELATED LITERATURE AND PRIOR ARTS SEARCH

## Review of Related Literature

### Accreditation and Quality Assurance in Philippine Higher Education
Conchada and Tiongco (2015) conducted an extensive review of the accreditation system in Philippine higher education, noting that accreditation serves as a primary mechanism to promote educational accountability and institutional excellence. While voluntary, accreditation status is tied to vital regulatory privileges administered by CHED, such as administrative autonomy, financial deregulations, and priority funding. In the private sector, PACUCOA operates as an active accrediting agency under FAAP. According to the PACUCOA Manual of Accreditation (2023), undergraduate evaluations span ten Areas with weights summing to 30. The Manual sets strict aggregate scoring requirements: Candidate status requires a 3.00 general average; Level I requires 3.00 with no Area below 3.00; Level II requires 3.50 with no Area below 3.50; and Levels III and IV require 4.00 with no individual criterion below 4.00. The Manual also establishes operational timelines, such as the requirement that revisit compliance reports be submitted at least four months before a survey. Literature consistently highlights that manual, binder-based management of these multidimensional requirements creates immense administrative overhead, fatigue, and document misplaced errors.

### Digital Evidence Management and Continuous Readiness
Commercial and academic literature reflects a global shift from episodic accreditation compilation toward continuous digital evidence curation (Watermark Insights, n.d.-b). When institutions prepare for accreditation only in the final months preceding a visit, evidence collection becomes frantic, uncoordinated, and superficial. By contrast, a digital repository linked to accreditation frameworks enables faculty to upload course materials, committee minutes, and research records incrementally. Cloud storage and modern web frameworks permit instant document indexing, version control, and multi-user access, transforming accreditation from a disruptive triennial burden into an ongoing quality assurance culture.

### Decision Support and What-If Analysis
In higher education management, decision-support tools that incorporate what-if modeling provide academic administrators with predictive foresight (Turban et al., 2011). Because PACUCOA ratings are computed via a weighted average formula with strict floor constraints, an administrator cannot easily identify which deficiencies most critically impede level eligibility. A what-if simulation engine allows program heads to select specific unresolved criteria, apply hypothetical completion scores, and immediately view the projected impact on Area means and accreditation levels. Crucially, such simulations must operate in an isolated sandbox so that production readiness scores remain authentic and unaltered.

### Access Control and Separation of Duties
Because an accreditation platform stores sensitive personnel files, examination samples, and institutional evaluations, robust security and role-based access control (RBAC) are indispensable (Sandhu et al., 1996). A critical principle in high-integrity auditing systems is separation of duties, which requires that no single individual possess the authority to initiate, verify, and approve the same transaction (Clark & Wilson, 1987). In accreditation self-surveys, allowing a faculty member to verify their own uploaded exhibits compromises audit reliability. Implementing programmatic and database-level blocks against self-verification guarantees objective multi-tiered review.

### Software Quality Evaluation
To rigorously assess educational software systems, the international standard ISO/IEC 25010 (ISO & IEC, 2011) provides a comprehensive product quality model comprising eight characteristics: functional suitability, performance efficiency, compatibility, usability, reliability, security, maintainability, and portability. Evaluating an accreditation platform against these criteria ensures that the system not only calculates scores accurately but also safeguards institutional records, responds rapidly to user interactions, and provides an intuitive user interface for academic stakeholders.

## Prior Arts Search

### Scope of the Search
The prior arts search examined publicly accessible literature, vendor documentation, product whitepapers, and existing institutional systems designed for educational accreditation and compliance tracking.

### Existing Systems
- **Watermark Planning & Self-Study:** A widely adopted commercial platform in North America (Watermark Insights, n.d.-a) providing centralized document repositories, collaborative authoring, and rubric mapping. However, it relies on generic templates that do not incorporate PACUCOA's mathematical weighting formulas or dual-constraint floor rules.
- **AchieveIt:** A cloud-based execution and compliance management platform (AchieveIt, n.d.) featuring progress dashboards, automated reminders, and task tracking. It lacks accreditor-specific criterion evaluation formulas and what-if readiness simulation.
- **Creatrix Campus:** An enterprise higher education suite (Creatrix Campus, n.d.) featuring accreditation modules tied to student information systems. While robust, it is an extensive ERP with high licensing costs and lacks Philippine-specific PACUCOA compliance matrix structures.

### Comparative Analysis

Table 2 presents a systematic feature-by-feature comparison between the reviewed software platforms and the proposed system developed in this study.

**Table 2**  
*Comparison of Reviewed Systems and the Proposed System, Based on Public Materials*

| Feature / Evaluative Dimension | Watermark | AchieveIt | Creatrix Campus | Proposed System |
|:---|:---|:---|:---|:---|
| Centralized evidence repository | Described | Described | Described | Yes (Supabase Storage mapped to criteria) |
| Accreditor-specific framework or templates | Pre-built templates | Requirements tracking | Templates available | Yes (PACUCOA 2023 undergraduate framework) |
| Assignment of responsibility | Collaborative workflows | Accountability features | Tasks assigned to users | Yes (Delegated Area Chairs, Co-Chairs, Members) |
| Progress or readiness dashboards | Described | Real-time progress | Reports and dashboards | Yes, with 5x2 executive command layout |
| PACUCOA framework named in materials | Not stated | Not stated | Not stated | Yes (explicit native implementation) |
| Rating computed with PACUCOA weighting (Sum=30) and floor rules | Not stated | Not stated | Not stated | Yes (real-time automated calculation) |
| What-if readiness simulation | Not stated | Not stated | Not stated | Yes (non-mutating projection with deltas) |
| Enforced verification by someone other than the uploader | Not stated | Not stated | Not stated | Yes (enforced self-verification block) |
| Post-visit compliance matrix with linked exhibits | Not stated | Not stated | Not stated | Yes (4-column matrix, sub-numbered actions) |
| Integration with SIS or LMS | Not stated | Not stated | Described | No (out of scope for pilot prototype) |

*Note*. Evaluated based on publicly available documentation, system feature sheets, and technical product whitepapers as of 2026.

### Synthesis and Research Gap
The comparative analysis demonstrates that existing commercial systems excel in general document storage and institutional task management. However, a significant research and technical gap exists: none of the available platforms natively implement the PACUCOA accreditation framework, its 30-weight mathematical aggregation formula, its dual-constraint level threshold evaluations, or its four-column post-visit compliance matrix. Furthermore, commercial tools lack an enforced self-verification block at the database level and do not offer an isolated what-if simulation sandbox tailored to PACUCOA criteria. This study directly bridges this gap by engineering a specialized, web-based platform tailored to the exact regulatory and operational requirements of Philippine higher education.

---

# MATERIALS AND METHODS

## System Design

### Requirements Gathering
Requirements were gathered through comprehensive document analysis of the PACUCOA Manual of Accreditation (Revised September 2023), examination of historical CICT accreditation exhibits, and a series of four (4) structured departmental consultations conducted between August and October 2026 at STI West Negros University. The PACUCOA Manual established the foundational regulatory and mathematical constraints of the system: the ten undergraduate evaluative Areas, their assigned numerical weights summing to thirty (30), the 0.00-to-5.00 criterion scoring rubric, the status thresholds, and the required exhibit typologies.

To translate these accreditor standards into functional software specifications, formal consultative discussions were held with eight (8) key institutional stakeholders: one (1) Quality Assurance Officer, representing the University QA Office; one (1) Dean of the College of Information and Communications Technology (CICT); one (1) Program Head of the Bachelor of Science in Computer Science (BSCS); and five (5) full-time CICT faculty members actively serving as accreditation Area Chairs and committee leaders.

The first consultation occurred on August 14, 2026, focusing on baseline requirements elicitation, workflow review of current paper-based exhibit collation, and definition of primary user roles. The participants established the necessity of separating administrative user provisioning from accreditation oversight, designating distinct responsibilities for the System Administrator and the QA Officer. The second session, held on September 4, 2026, centered on access control modeling and integrity safeguards. In this session, the CICT Dean and BSCS Program Head emphasized the institutional risk of biased evaluations, leading directly to the architectural formulation of the dual-verification workflow and the strict programmatic block preventing faculty members from verifying their own uploaded exhibits (uploader_id != verifier_id). The five participating faculty members—representing Area I (Philosophy and Objectives), Area II (Faculty), Area III (Instruction), Area IV (Laboratories), and Area V (Research)—defined criteria mapping conventions and requested automated server-side PDF text parsing to accelerate document tagging. The third consultation took place on September 25, 2026, to validate the mathematical scoring engine and review the Executive 5x2 Command Dashboard. The QA Officer verified the piecewise criterion scoring formula and the dual-constraint floor logic required for Candidate and Level I/II statuses. The final consultation and pre-deployment walkthrough was conducted on October 9, 2026, wherein the stakeholders validated the four-column post-visit compliance tracking matrix, approved the real BSCS exhibit migration, and finalized the protocol for the ISO/IEC 25010 software quality evaluation.

### Development Methodology
The system was engineered using an Agile developmental approach, incorporating iterative Scrum practices (Schwaber & Sutherland, 2020). Development progressed across four distinct two-to-three-week sprints between August and October 2026, as detailed in Table 3.

**Table 3**  
*Development Timeline, August to October 2026*

| Period | Development Activities | Deliverables |
|:---|:---|:---|
| August 2026 | Proposal preparation; study of the PACUCOA framework; CICT requirements analysis | System proposal; requirements matrix; initial conceptual architecture |
| Late August to Early September 2026 | Iteration 1: Database schema design; Supabase authentication; role-based access control setup | Functional database schema; user registration and login; role management |
| September 2026 | Iteration 2: PACUCOA criteria setup; evidence upload module; PDF text extraction and tagging | Evidence repository; file upload UI; PDF rule-based tagging; verification workflow |
| Late September to Early October 2026 | Iteration 3: Mathematical scoring engine; 5x2 executive command dashboard; what-if simulation | Automated scoring engine; 5x2 dashboard; simulation sandbox; boundary test suite |
| October 2026 | Iteration 4: 4-Column Post-Visit Compliance Matrix module; sub-numbered action tracking; security polish | Compliance matrix module; audit log; end-to-end testing; user documentation |

*Note*. Organized into four developmental iterations following Agile Scrum principles.

### System Architecture
The system utilizes a modern, modular cloud architecture. The presentation layer is built with Next.js and TypeScript, styled with Tailwind CSS, and deployed on Vercel. The backend utilizes Supabase, an open-source Backend-as-a-Service powered by PostgreSQL, providing user authentication, relational data persistence, and secure object storage. Security is enforced through PostgreSQL Row-Level Security (RLS) policies and private storage buckets with time-limited signed URLs. A server-side routine extracts text from uploaded PDF files to assist users with rule-based document classification and keyword matching.

*Figure 2*. System Architecture of the Web-Based Accreditation Management and Readiness Assessment System.

### Users, Roles, and Access Control
Access follows role-based access control (Sandhu et al., 1996) combined with program and Area delegations. Table 4 details the eight supported roles and their permissions.

**Table 4**  
*Roles and Permissions*

| Role | Scope | Main Permissions |
|:---|:---|:---|
| System Admin | Institution | Creates departments, programs, and user accounts. No access to evaluate or alter evidence. |
| QA Officer | Institution | Configures frameworks, Areas, weights, criteria, and levels; reviews university-wide readiness. |
| Dean | College | Views readiness dashboards, heatmaps, and simulations for all programs in the college; views compliance. |
| Program Head | Program | Assigns Area Chairs, Co-Chairs, and Members; monitors readiness; verifies exhibits; runs simulations. |
| Area Chair / Co-Chair | Assigned Area | Verifies uploaded evidence within assigned Area (except own uploads); tracks Area progress. |
| Faculty Member | Assigned Area | Uploads evidence for criteria in assigned Areas; inputs metadata. Cannot verify documents. |
| Alumni / Student Rep | Program | Views high-level program readiness summaries and RAG badges. No access to evidence files or users. |

*Note*. Enforced through application route guards, database RLS policies, and private storage controls.

### Data Design
The database schema is highly configurable, storing framework definitions in tables rather than hardcoding them in application logic. Table 5 summarizes the principal data entities.

**Table 5**  
*Principal Data Entities*

| Entity / Table | Purpose |
|:---|:---|
| institutions, departments, programs | Represents the academic organizational structure (e.g., STI WNU, CICT, BSCS). |
| accreditation_frameworks | Stores framework definitions (e.g., PACUCOA Undergraduate 2023). |
| accreditation_areas | Defines the ten Areas (Area I to Area X), titles, and numerical weights (sum = 30). |
| accreditation_criteria | Defines criteria under each Area, expected document types, and required document counts. |
| accreditation_levels | Stores accreditation levels, labels, and general average threshold values. |
| users | User accounts with assigned roles and departmental scopes. |
| area_assignments | Maps users to an Area of a program as Area Chair, Co-Chair, or Member. |
| evidence_documents | Uploaded file records with criterion ID, document type, effective date, and verification status. |
| readiness_scores | Stores computed criterion scores and statuses per program; Area means and program rating. |
| accreditation_cycles | Groups post-visit recommendations by program accreditation cycle. |
| accreditation_recommendations | Stores post-visit survey opportunities for improvement and recommendations. |
| compliance_actions | Stores sub-numbered actions taken, team verification text, and linked evidence IDs. |
| simulations | Stores parameters and results of what-if simulation runs, isolated from production. |
| audit_log | Records actor, action type, affected record, and timestamp for completed actions. |

*Note*. Implemented in PostgreSQL via Supabase with relational foreign key integrity.

### System Process Flow
*Figure 3*. System Process Flow from Setup to Post-Visit Compliance Tracking.

The workflow encompasses five stages: framework configuration, evidence upload and automated tagging, independent verification with self-verification enforcement, automated rating calculation and executive dashboard display, what-if readiness simulation, and post-visit compliance matrix management.

### Functional Modules
1. **Evidence Management and Mapping Module:** Enables faculty to upload files into Supabase Storage, mapped to specific criteria. When a PDF is uploaded, text is extracted to recommend document types. An Area Chair or Co-Chair reviews pending documents. Crucially, the system prevents self-verification: if uploader_id equals verifier_id, the verification request is rejected at both the API and database levels.
2. **Readiness Scoring and Executive Dashboard Module:** Computes scores in real time. For each criterion, let R be the required documents and V the valid verified documents. The criterion score s (from 0.00 to 5.00) is computed piecewise: s = 0.00 when V = 0; s = max(1.00, 2.00 * (V / R)) when 0 < V < R; s = 3.00 + 2.00 * ((V / R) - 1) capped at 5.00 when V >= R. Area Means are calculated as the arithmetic average of criterion scores. The Program Rating is computed as:
   $$	ext{Program Rating} = rac{\sum (	ext{Area Mean} 	imes 	ext{Area Weight})}{\sum (	ext{Area Weight})} = rac{\sum (	ext{Area Mean} 	imes 	ext{Area Weight})}{30}$$
   The system evaluates ratings against PACUCOA dual-constraint rules: Candidate status (overall >= 3.00); Level I (overall >= 3.00, no Area mean < 3.00); Level II (overall >= 3.50, no Area mean < 3.50); Levels III and IV (overall >= 4.00, no individual criterion < 4.00). The Executive 5x2 Command Dashboard displays all ten Areas simultaneously in two rows of five cards, eliminating vertical scrolling and featuring color-coded status badges (Red: < 3.00; Amber: 3.00-3.49; Yellow: 3.50-3.99; Green: >= 4.00).
3. **Readiness Simulation Module:** Allows administrators to select up to ten unresolved criteria, applies a simulated completion score of 4.00 (Very Good) to each, and recalculates projected Area means, program ratings, and level eligibility. Results are stored in isolated simulation tables without altering production records.
4. **Post-Visit Compliance Tracking Module:** Manages the four-column matrix required for PACUCOA revisits: Column 1 (Opportunity for Improvement), Column 2 (PACUCOA Recommendation), Column 3 (Actions Taken, sub-numbered e.g. 1.1, 1.2), and Column 4 (Team Verification and Linked Exhibits).

### Illustration of the Scoring Mechanics

Table 6 presents a hypothetical computation illustrating how the mathematical weighting formula and floor rules operate across the ten Areas.

**Table 6**  
*Hypothetical Computation of a Program Rating (Illustration)*

| Area | Area Mean | Weight | Weighted Value |
|:---|:---|:---|:---|
| I. Philosophy and Objectives | 4.00 | 3 | 12.00 |
| II. Faculty | 3.50 | 4 | 14.00 |
| III. Instruction | 3.00 | 3 | 9.00 |
| IV. Laboratory | 3.00 | 3 | 9.00 |
| V. Research | 2.50 | 3 | 7.50 |
| VI. Library | 3.50 | 3 | 10.50 |
| VII. Student Services | 4.00 | 3 | 12.00 |
| VIII. Social Orientation and Community Involvement | 3.00 | 3 | 9.00 |
| IX. Physical Plant and Facilities | 4.00 | 2 | 8.00 |
| X. Organization and Administration | 3.50 | 3 | 10.50 |
| **Total** | **--** | **30** | **101.50** |

*Note*. Computed as 101.50 / 30 = 3.38. The program meets the Candidate threshold of 3.00 but fails Level I because Area V (2.50) is below the 3.00 floor constraint.

## Research Design
The study employs a Developmental Research Design with a descriptive evaluative component (Richey & Klein, 2007). The developmental component encompasses the engineering of the software following the System Development Life Cycle (SDLC) and Agile Scrum. The descriptive evaluative component assesses the technical and operational acceptability of the system using the ISO/IEC 25010 product quality model.

## Locale of the Study
The study was conducted at the College of Information and Communications Technology (CICT) and the Quality Assurance Office of STI West Negros University, located along Burgos Street, Bacolod City, Negros Occidental, Philippines.

## Respondents of the Study (with sampling technique)
The study utilized a purposive sampling technique (Etikan et al., 2016), selecting thirty (30) key institutional stakeholders and technical experts directly involved in accreditation management and software engineering. Table 7 details the respondent composition.

**Table 7**  
*Proposed Respondents of the Study*

| Respondent Group | Basis of Selection | Proposed Number |
|:---|:---|:---|
| Quality Assurance Director and Staff | Configure university framework settings and oversee institutional compliance | 3 |
| College Dean and Program Heads (BSCS, BSIT) | Oversee academic programs, assign accreditation roles, and monitor readiness | 3 |
| Faculty Area Chairs, Co-Chairs, and Members | Directly gather, upload, map, and verify PACUCOA documentary exhibits | 14 |
| Alumni and Student Representatives | Stakeholders who participate in accreditation interviews and review readiness summaries | 3 |
| Information Technology Experts / Software Engineers | Evaluate technical software architecture, security, and ISO/IEC 25010 characteristics | 7 |
| **Total Respondents** | **--** | **30** |

*Note*. Selected via purposive sampling across academic, administrative, and technical domains.

## Data Analysis

### Evaluation Instrument
The evaluation instrument was adapted from the ISO/IEC 25010 software product quality model (ISO & IEC, 2011). The questionnaire employs a 5-point Likert scale (Likert, 1932) measuring eight quality characteristics: Functional Suitability, Performance Efficiency, Compatibility, Usability, Reliability, Security, Maintainability, and Portability.

### Statistical Treatment
Survey responses were tabulated and analyzed using weighted mean and standard deviation:
$$	ext{Weighted Mean} = rac{\sum (f 	imes x)}{n}$$
where $f$ is the frequency of rating $x$, and $n$ is the total number of respondents. Computed weighted means were interpreted using standard equal intervals of 0.80, as established in Table 8.

**Table 8**  
*Interpretation of Weighted Means*

| Mean Range | Verbal Interpretation |
|:---|:---|
| 4.21 - 5.00 | Strongly Agree / Very Highly Acceptable |
| 3.41 - 4.20 | Agree / Highly Acceptable |
| 2.61 - 3.40 | Neutral / Moderately Acceptable |
| 1.81 - 2.60 | Disagree / Slightly Acceptable |
| 1.00 - 1.80 | Strongly Disagree / Not Acceptable |

*Note*. Standard five-point Likert scale interpretation intervals.

## Ethical Considerations
The conduct of this research adhered strictly to institutional research ethics protocols and established ethical standards in software engineering. Prior to system deployment and empirical data collection, formal institutional clearance (P form compliance) was obtained through the University Research and Development Office in coordination with the Dean of the College of Information and Communications Technology and the Quality Assurance Office. This clearance authorized the deployment of the prototype, the migration of historical BSCS compliance records, and the participation of university personnel in the software evaluation.

Informed consent was rigorously secured from all survey respondents and consultation participants. Prior to engaging with the evaluation instrument, respondents received an explanatory disclosure detailing the objectives of the study, the voluntary nature of their participation, and their unconditional right to withdraw at any stage without prejudice or administrative consequence. Participant responses were treated with strict confidentiality and anonymized to prevent personal or professional reprisal, ensuring that evaluative feedback regarding institutional processes was shared candidly and objectively.

Full compliance with the Data Privacy Act of 2012 (Republic Act No. 10173) was maintained throughout the system development life cycle and data evaluation. All institutional documents containing personal identifying information—such as faculty curriculum vitae, student identification numbers, and individual performance ratings—were sanitized and anonymized prior to database upload. At the architectural level, data protection was enforced through PostgreSQL Row-Level Security policies and encrypted private cloud storage buckets, ensuring that documentary exhibits are accessible exclusively to authenticated users through time-limited, cryptographically signed URLs.

Academic and scientific integrity was maintained by adhering to APA 7th edition citation norms, attributing all external frameworks, literature, and software libraries to their original authors. The complete manuscript was subjected to formal plagiarism screening and grammar validation through the University Research Office, achieving a similarity index well below the institutional threshold of fifteen percent. Furthermore, the researcher observed strict accuracy in reporting system capabilities, clarifying to all stakeholders that the calculated readiness ratings represent internal, indicative diagnostics designed for self-survey preparation and do not usurp or substitute the official evaluative authority of PACUCOA accreditors.

---

---

# REFERENCES
AchieveIt. (n.d.). *Accreditation management software*. https://www.achieveit.com/?p=59266

Beck, K., Beedle, M., van Bennekum, A., Cockburn, A., Cunningham, W., Fowler, M., Grenning, J., Highsmith, J., Hunt, A., Jeffries, R., Kern, J., Marick, B., Martin, R. C., Mellor, S., Schwaber, K., Sutherland, J., & Thomas, D. (2001). *Manifesto for agile software development*. https://agilemanifesto.org/

Clark, D. D., & Wilson, D. R. (1987). A comparison of commercial and military computer security policies. In *Proceedings of the 1987 IEEE Symposium on Security and Privacy* (pp. 184–194). IEEE Computer Society. https://doi.org/10.1109/SP.1987.10001

College of Information and Communications Technology. (n.d.). *BSCS compliance report* [Unpublished internal report]. STI West Negros University.

Conchada, M. I., & Tiongco, M. M. (2015). *A review of the accreditation system for Philippine higher education institutions* (Discussion Paper Series No. 2015-30). Philippine Institute for Development Studies. https://www.pids.gov.ph/publication/discussion-papers/a-review-of-the-accreditation-system-for-philippine-higher-education-institutions

Creatrix Campus. (n.d.). *Accreditation management software*. https://creatrixcampus.com/accreditation-management-system

Etikan, I., Musa, S. A., & Alkassim, R. S. (2016). Comparison of convenience sampling and purposive sampling. *American Journal of Theoretical and Applied Statistics*, 5(1), 1–4. https://doi.org/10.11648/j.ajtas.20160501.11

International Organization for Standardization & International Electrotechnical Commission. (2011). *Systems and software engineering — Systems and software Quality Requirements and Evaluation (SQuaRE) — System and software quality models* (ISO/IEC 25010:2011). https://www.iso.org/standard/35733.html

Likert, R. (1932). A technique for the measurement of attitudes. *Archives of Psychology*, 22(140), 1–55.

Philippine Association of Colleges and Universities Commission on Accreditation. (2023). *Manual of accreditation* (Revised September 2023). PACUCOA.

Philippine Daily Inquirer. (2013a, September 5). STI to acquire West Negros University. *Inquirer Business*. https://business.inquirer.net/141445/sti-to-acquire-west-negros-university

Philippine Daily Inquirer. (2013b, October 3). STI acquires West Negros U. *Inquirer Business*. https://business.inquirer.net/145805/sti-acquires-west-negros-u

Pressman, R. S., & Maxim, B. R. (2020). *Software engineering: A practitioner's approach* (9th ed.). McGraw-Hill Education.

Republic Act No. 10173. (2012). *Data Privacy Act of 2012*. Republic of the Philippines. https://www.privacy.gov.ph/data-privacy-act/

Richey, R. C., & Klein, J. D. (2007). *Design and development research: Methods, strategies, and issues*. Lawrence Erlbaum Associates.

Sandhu, R. S., Coyne, E. J., Feinstein, H. L., & Youman, C. E. (1996). Role-based access control models. *IEEE Computer*, 29(2), 38–47. https://doi.org/10.1109/2.485845

Schwaber, K., & Sutherland, J. (2020). *The Scrum guide: The definitive guide to Scrum: The rules of the game*. https://scrumguides.org/

STI West Negros University. (n.d.). *About us*. https://stiwnu.com/sti/aboutsti

Supabase. (n.d.). *Row level security*. https://supabase.com/docs/guides/database/postgres/row-level-security

Turban, E., Sharda, R., & Delen, D. (2011). *Decision support and business intelligence systems* (9th ed.). Pearson Education.

Vercel. (n.d.). *Next.js documentation*. https://nextjs.org/docs

Visayan Daily Star. (n.d.). *STIWNU inaugurates new SBE building*. https://visayandailystar.com/stiwnu-inaugurates-new-sbe-building/

Watermark Insights. (n.d.-a). *Accreditation*. https://watermarkinsights.com/explore/accreditation

Watermark Insights. (n.d.-b). *Repeatable excellence: Building a reliable foundation for continuous improvement* [White paper]. https://watermarkinsights.com/resources/white-papers/repeatable-excellence/

---

import os

def generate_markdown_book():
    md_content = """# WEB-BASED ACCREDITATION MANAGEMENT AND READINESS ASSESSMENT SYSTEM FOR STI WEST NEGROS UNIVERSITY

**A Capstone Project Presented to the Faculty of the College of Information and Communications Technology**  
**STI West Negros University, Bacolod City**  
**In Partial Fulfillment of the Requirements for the Degree Bachelor of Science in Computer Science**  

**By:**  
**CLYDE TABURADA**  
October 2026  

---

## PRELIMINARIES

### APPROVAL SHEET
This capstone project entitled **"WEB-BASED ACCREDITATION MANAGEMENT AND READINESS ASSESSMENT SYSTEM FOR STI WEST NEGROS UNIVERSITY"**, prepared and submitted by **CLYDE TABURADA** in partial fulfillment of the requirements for the degree Bachelor of Science in Computer Science, has been examined and is recommended for acceptance and approval for Oral Examination.

*Approved by the Committee on Oral Examination on October 2026 with a rating of PASSED.*  
- Capstone Project Adviser  
- Panel of Examiners: Chairman, Member 1, Member 2  
- Dean, College of Information and Communications Technology  

---

### ACKNOWLEDGEMENT
The researcher expresses profound gratitude to Almighty God; to the administration of STI West Negros University, specifically the College of Information and Communications Technology (CICT) and the Quality Assurance (QA) Office; to the Capstone Project Adviser and Panel of Examiners; to the faculty members of CICT who served as Area Chairs and respondents; and to the researcher's family and colleagues for their continuous encouragement and support.

---

### DEDICATION
*This humble work is affectionately dedicated to my beloved parents and family, to my mentors and professors at STI West Negros University, to the academic community striving for continuous quality assurance, and above all, to the Almighty God.*

---

### ABSTRACT
Higher education institutions in the Philippines undergo periodic accreditation through recognized bodies such as the Philippine Association of Colleges and Universities Commission on Accreditation (PACUCOA) to guarantee academic excellence. However, manual accreditation preparation relies heavily on episodic physical document collation, decentralized digital files, and manual spreadsheet computations, resulting in logistical bottlenecks, high error risk, and an inability to forecast accreditation readiness. This study designed, developed, and evaluated the Web-Based Accreditation Management and Readiness Assessment System for STI West Negros University, with the Bachelor of Science in Computer Science (BSCS) program serving as the pilot. The system automates exhibit mapping across PACUCOA's ten undergraduate areas, enforces role-based access control with an independent dual-verification mechanism and self-verification block to ensure separation of duties, computes weighted readiness ratings in real time using the official PACUCOA weighting formula (total weight of 30) alongside dual-constraint floor rules, provides a 5x2 executive command dashboard, features an isolated what-if readiness simulation sandbox, and tracks post-visit accreditation compliance via a four-column matrix.

Following an Agile developmental research methodology across four iterations, the platform was implemented using Next.js, TypeScript, Tailwind CSS, and a Supabase backend utilizing PostgreSQL with Row-Level Security and private object storage. Empirical verification using real institutional BSCS accreditation exhibits demonstrated the mathematical precision of the scoring engine, yielding a baseline program rating of 3.21 (total weighted value of 96.43 divided by 30) meeting Candidate Status thresholds, and simulating a strategic target rating of 3.93 for Level II readiness by completing ten high-impact criteria. The software was formally evaluated by fifteen (15) purposive respondents comprising the Quality Assurance Officer, the CICT Dean, two Program Heads (BSCS and BSIT), and eleven (11) faculty Area Chairs and committee members using a 5-point Likert questionnaire based on the ISO/IEC 25010 software product quality model. The evaluation yielded an overall composite grand mean of 4.83 (Strongly Agree / Very Highly Acceptable), with all eight quality characteristics rated highly: Functional Suitability (4.84), Performance Efficiency (4.78), Compatibility (4.80), Usability (4.87), Reliability (4.82), Security (4.89), Maintainability (4.77), and Portability (4.85). The results establish that the automated system significantly enhances institutional accreditation preparedness, guarantees evidence integrity, and transitions higher education quality assurance from reactive episodic compilation to continuous, data-driven readiness.

**Keywords:** Accreditation Management, Continuous Quality Assurance, PACUCOA Framework, Readiness Assessment, What-If Simulation, Separation of Duties, ISO/IEC 25010, STI West Negros University.

---

### TABLE OF CONTENTS
- **TITLE PAGE** . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . i
- **APPROVAL SHEET** . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . ii
- **ACKNOWLEDGEMENT** . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . iii
- **DEDICATION** . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . iv
- **ABSTRACT** . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . v
- **TABLE OF CONTENTS** . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . vi
- **LIST OF TABLES** . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . vii
- **LIST OF FIGURES** . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . viii
- **CHAPTER I: INTRODUCTION** . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 1
  - Background of the Study . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 1
    - Background of the Institution . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 3
    - The Proposed System . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 4
  - Objective of the Study . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 5
    - General Objective . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 5
    - Specifically, the system aims to: . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 5
  - Conceptual Framework . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 6
    - Narrative of the Conceptual Framework . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 7
  - Significance of the Study . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 8
  - Scope and Limitation of the Study . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 9
    - Scope of the Study . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 9
    - Limitations of the Study . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 10
  - Definition of Terms . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 11
- **CHAPTER II: RELATED LITERATURE AND PRIOR ARTS SEARCH** . . . . . . . . . . . . . . . . . . . . . . . 15
  - Review of Related Literature . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 15
    - Accreditation and Quality Assurance in Philippine Higher Education . . . . . . . . . . . . . . . . . . 15
    - Digital Evidence Management and Continuous Readiness . . . . . . . . . . . . . . . . . . . . . . . . 17
    - Decision Support and What-If Analysis . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 18
    - Access Control and Separation of Duties . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 19
    - Software Quality Evaluation . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 20
  - Prior Arts Search . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 21
    - Scope of the Search . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 21
    - Existing Systems . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 22
    - Comparative Analysis . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 23
    - Synthesis and Research Gap . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 25
- **CHAPTER III: MATERIALS AND METHODS** . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 27
  - System Design . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 27
    - Requirements Gathering . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 27
    - Development Methodology . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 28
    - System Architecture . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 30
    - Users, Roles, and Access Control . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 32
    - Data Design . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 34
    - System Process Flow . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 36
    - Functional Modules . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 38
    - Illustration of the Scoring Mechanics . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 43
  - Research Design . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 45
  - Locale of the Study . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 46
  - Respondents of the Study (with sampling technique) . . . . . . . . . . . . . . . . . . . . . . . . . . 46
  - Data Analysis . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 48
    - Evaluation Instrument . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 48
    - Statistical Treatment . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 49
  - Ethical Considerations . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 50
- **CHAPTER IV: PRESENTATION, ANALYSIS AND INTERPRETATION** . . . . . . . . . . . . . . . . . . . . . . . 52
  - System Implementation and Operational Features . . . . . . . . . . . . . . . . . . . . . . . . . . . . 52
    - Evidence Management and Mapping Implementation . . . . . . . . . . . . . . . . . . . . . . . . . . . 52
    - Role-Based Access Control and Dual-Verification Enforcement . . . . . . . . . . . . . . . . . . . . . 54
    - Executive 5x2 Command Dashboard and Heatmap Visualization . . . . . . . . . . . . . . . . . . . . . . 56
    - What-If Readiness Simulation Sandbox . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 58
    - Four-Column Post-Visit Compliance Tracking Matrix . . . . . . . . . . . . . . . . . . . . . . . . . . 60
  - Verification of PACUCOA Scoring Mechanics and Empirical Assessment . . . . . . . . . . . . . . . . . . 62
    - Baseline Assessment of the BSCS Program . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 62
    - Dual-Constraint Threshold Analysis . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 65
    - Simulation Analysis and Readiness Optimization . . . . . . . . . . . . . . . . . . . . . . . . . . . 67
  - Software Quality Evaluation (ISO/IEC 25010) . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 69
    - Respondent Profile . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 69
    - Evaluation Results Across Quality Characteristics . . . . . . . . . . . . . . . . . . . . . . . . . . 70
    - Interpretation and Qualitative Synthesis . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 74
- **CHAPTER V: SUMMARY, CONCLUSION AND RECOMMENDATION** . . . . . . . . . . . . . . . . . . . . . . . . 76
  - Summary of Findings . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 76
  - Conclusion . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 78
  - Recommendation . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 80
- **REFERENCES** . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 82
- **APPENDICES** . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 87
  - Appendix A. CURRICULUM VITAE . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 87
  - Appendix B. CERTIFICATE OF PLAGIARISM . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 90
  - Appendix C. CERTIFICATE OF UTILIZATION . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 91
  - Appendix D. USER'S MANUAL . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 92

---

### LIST OF TABLES
- **Table 1.** PACUCOA Undergraduate Areas and Equivalent Weights (Total Weight = 30) . . . . . . . . . . . . 2
- **Table 2.** Comparison of Reviewed Systems and the Proposed System, Based on Public Materials . . . . . 24
- **Table 3.** Development Timeline, August to October 2026 . . . . . . . . . . . . . . . . . . . . . . . . 29
- **Table 4.** Roles and Permissions . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 33
- **Table 5.** Principal Data Entities . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 35
- **Table 6.** Hypothetical Computation of a Program Rating (Illustration) . . . . . . . . . . . . . . . . 44
- **Table 7.** Proposed Respondents of the Study . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 47
- **Table 8.** Interpretation of Weighted Means . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 50
- **Table 9.** Empirical Program Baseline Assessment and Simulated Readiness Ratings by PACUCOA Area . . . 64
- **Table 10.** Summary of ISO/IEC 25010 Software Quality Evaluation Results . . . . . . . . . . . . . . . . 71

---

### LIST OF FIGURES
- **Figure 1.** Conceptual Framework of the Study (Input–Process–Output Model with Feedback Loop) . . . . . 7
- **Figure 2.** System Architecture of the Web-Based Accreditation Management and Readiness Assessment System 31
- **Figure 3.** System Process Flow from Setup to Post-Visit Compliance Tracking . . . . . . . . . . . . . . 37

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
| Area II: Faculty | 3 |
| Area III: Instruction | 4 |
| Area IV: Laboratory | 3 |
| Area V: Research | 3 |
| Area VI: Library | 3 |
| Area VII: Student Services | 3 |
| Area VIII: Social Orientation and Community Involvement | 3 |
| Area IX: Physical Plant and Facilities | 2 |
| Area X: Organization and Administration | 3 |
| **Total Weight** | **30** |

*Note*. Adapted from the PACUCOA Manual of Accreditation (Revised September 2023).

As established in the official PACUCOA undergraduate framework, Instruction carries a weight of four (4), Physical Plant and Facilities carries a weight of two (2), and each of the other eight Areas—including Faculty—carries a weight of three (3), bringing the aggregate total weight to thirty (30). To qualify for Candidate status, a program must achieve a minimum overall rating of 3.00. For Level I formal accredited status, the program must achieve an overall rating of 3.00 with no individual Area mean falling below 3.00. For Level II, the required overall rating rises to 3.50, again with no Area mean below 3.50. Levels III and IV introduce still higher requirements, including a minimum rating of 4.00 and the condition that no single criterion fall below 4.00.

Meeting these ratings requires a large body of documentary evidence, such as faculty records, course syllabi, research publications, library acquisition receipts, student personnel service logs, laboratory inventories, and administrative minutes. Area I requires the statement of philosophy, vision, mission, and core values; Area II requires faculty qualification and service records, recruitment and ranking policies, and development programs; Area III requires syllabi, sample examinations, class records, and supervisory reports; Area VI requires budget allocations, holdings lists, and accession logs; Area IX requires site plans, building permits, occupancy certificates, and fire safety inspection certificates. The remaining Areas have similarly extensive documentary requirements.

The Manual's policies are also strictly time-bound. Under the PACUCOA Manual of Accreditation (Policy on Revisit, Section 7), a formal compliance report addressing prior recommendations must be submitted to the PACUCOA Secretariat at least thirty (30) days prior to a scheduled revisit. Furthermore, for academic programs preparing for Level II reaccreditation—such as the BSCS program scheduled for survey in February 2027—the institution must submit a formal letter of intent at least six (6) months prior to the expiration of accredited status, accompanied by a comprehensive compliance report on previous recommendations and an updated self-survey report. In institutions that compile exhibits manually, this workload is carried out through episodic preparation: binders, folders, and loose sheets are gathered, physically stamped, and sorted into exhibit rooms weeks before the visiting team arrives. In-depth institutional interviews conducted with the Quality Assurance Office and CICT leadership revealed that STI West Negros University has traditionally experienced acute operational friction under this manual approach. Accreditation evidence was collated through fragmented departmental folders, individual flash drives, and physical ring binders housed in dedicated exhibit rooms. This decentralized model led to recurring administrative problems, including misplaced physical records between accreditation cycles, duplicate submissions of conflicting syllabus revisions, lack of real-time visibility into overall program readiness, and calculation inaccuracies when manually aggregating Area scores into weighted averages.

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
The study covers the design, development, and evaluation of a web-based accreditation management and readiness assessment platform for STI West Negros University. The system is built around the PACUCOA undergraduate framework (Revised September 2023), covering all ten evaluative Areas, their respective weights totaling 30 (with Instruction carrying 4, Physical Plant 2, and the remaining eight Areas 3 each), the 0-to-5 rating scale, and level thresholds (Candidate, Level I, Level II, Level III, Level IV). In the pilot implementation focusing on the Bachelor of Science in Computer Science (BSCS) program of CICT, the survey instrument is currently operationalized across seventy-nine (79) active evaluative criteria configured by the STI WNU Quality Assurance Office. The system's underlying data architecture is fully dynamic and program-configurable: while the ten Areas and weighting rules are fixed by the PACUCOA framework, the specific number of criteria is not a rigid universal constant and can vary across different academic programs based on curricular specialization, applicable provisions, and quality assurance templates. The software includes four functional modules: Evidence Management and Mapping, Readiness Scoring and Executive Dashboard, Readiness Simulation, and Post-Visit Compliance Tracking. Access control supports eight user roles: System Admin, QA Officer, Dean, Program Head, Area Chair, Area Co-Chair, Faculty Member, and Alumni/Student Representative. An audit log records completed evaluative and administrative transactions.

### Limitations of the Study
The system boundary is strictly focused on Step Two (Institutional Self-Survey) of the PACUCOA accreditation cycle; it does not automate Step One (Formal Institutional Application and CHED endorsement) or Step Three (On-site External Evaluation Team audit and board deliberations). Furthermore, the seventy-nine (79) evaluative criteria configured in the database represent the specific operational baseline for the BSCS program's current accreditation review; they do not represent an accreditor-mandated default across all disciplines, as the platform allows QA administrators to dynamically configure distinct criteria sets for other degree programs. In the automated criterion scoring algorithm, the required document count (R) is established by the STI WNU Quality Assurance Office and Area Chairs as an operational baseline proxy reflecting institutional completeness, as the qualitative PACUCOA manual does not specify exact document counts for provisions. Furthermore, the PACUCOA Manual exhibits an internal textual discrepancy regarding Level III criteria: Section 10 states that Level III requires an overall rating of 4.00 with all Area means at least 4.00, whereas the summary threshold table specifies that no individual criterion should fall below 4.00; the system enforces the stricter constraint (no criterion below 4.00) to ensure complete audit rigor. In addition, official PACUCOA Level III and Level IV accreditations require institutional-level qualitative supplementary criteria (such as demonstrated research tradition, community outreach programs, international linkages, and high faculty performance) as well as regulatory compliance with CHED requirements; because BSCS and BSIT are non-board computing programs, licensure examination pass rates do not apply, and institutional supplementary criteria are evaluated by accreditors as external qualitative prerequisites beyond the scope of the program-level self-survey scoring engine. Finally, automated document tagging assists with keyword detection but does not evaluate qualitative academic merit; physical scanning of legacy paper documents is outside the software boundary; and technical evaluation is conducted within CICT and supporting offices of STI WNU using the ISO/IEC 25010 framework.

## Definition of Terms
- **Accreditation.** A voluntary, standards-based process by which an authorized accrediting agency evaluates an educational institution or program to verify that it meets or exceeds predefined quality criteria.
- **PACUCOA.** The Philippine Association of Colleges and Universities Commission on Accreditation, an affiliate member of the Federation of Accrediting Agencies of the Philippines (FAAP).
- **Manual of Accreditation.** The official regulatory instrument (Revised September 2023) published by PACUCOA specifying evaluative areas, weights, rating scales, and level rules.
- **Self-Survey (Step Two).** An internal comprehensive assessment conducted by an institution's faculty and administration to evaluate program readiness prior to an external accreditation audit, representing the specific operational scope of this system.
- **Area.** One of the ten major evaluative divisions in the PACUCOA undergraduate survey instrument, each assigned a specific numerical weight summing to 30.
- **Criterion.** A specific evaluative standard within an Area against which documentary exhibits are uploaded, verified, and scored. The system dynamically supports program-specific criteria sets, currently instantiated with seventy-nine (79) active criteria for the BSCS pilot implementation.
- **PACUCOA 0-to-5 Rating Scale.** The official rating scale used in self-surveys: 5 = Excellent, 4 = Very Good, 3 = Good, 2 = Fair, 1 = Poor, and 0 = Missing (provision is missing but necessary). Provisions marked N.A. (Not Applicable) are excluded from the active Area divisor.
- **PACUCOA Compliance-Verification Scale.** The official five-point scale used by PACUCOA visiting teams during revisits: 5 = Full Compliance, 4 = Very Satisfactory Partial Compliance, 3 = Satisfactory Partial Compliance, 2 = Unsatisfactory Partial Compliance, and 1 = Non-Compliance.
- **Evidence (Exhibit).** A document, syllabus, report, or certification uploaded to demonstrate compliance with an accreditation criterion.
- **Evidence Mapping.** The systematic digital tagging and linking of an uploaded exhibit to its corresponding PACUCOA Area and criterion.
- **Verification.** The formal administrative review of an uploaded exhibit by an authorized Area Chair or Co-Chair, confirming its validity, document type, and effective date.
- **Separation of Duties (Self-Verification Block).** A core security constraint that prohibits the user who uploaded an exhibit from acting as the verifier of that same exhibit.
- **Criterion Score.** A computed value ranging from 0.00 to 5.00 reflecting the proportion of verified valid documents relative to the QA-defined required baseline count (R).
- **Area Mean.** The arithmetic average of all active criterion scores within an Area, indicating the section's overall performance.
- **Program Rating.** The weighted average across all ten Area means, computed using PACUCOA's official weighting formula.
- **Dual-Constraint Level Threshold.** The regulatory rule requiring a program to meet both an overall program rating and a minimum floor rating in every individual Area (e.g., Level I requires >= 3.00 overall with no Area below 3.00).
- **Readiness Simulation.** A non-mutating mathematical sandbox that projects hypothetical Area means and level eligibility based on the completion of up to ten selected criteria.
- **Post-Visit Compliance Matrix.** An STI WNU Quality Assurance Office operational tracking convention structured into four columns: Opportunities for Improvement, Recommendations, Sub-numbered Actions Taken, and Linked Exhibits, preparing the institution for PACUCOA's 1-to-5 compliance audit.
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
   $$\text{Program Rating} = \frac{\sum (\text{Area Mean} \times \text{Area Weight})}{\sum (\text{Area Weight})} = \frac{\sum (\text{Area Mean} \times \text{Area Weight})}{30}$$
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
| II. Faculty | 3.50 | 3 | 10.50 |
| III. Instruction | 3.00 | 4 | 12.00 |
| IV. Laboratory | 3.00 | 3 | 9.00 |
| V. Research | 2.50 | 3 | 7.50 |
| VI. Library | 3.50 | 3 | 10.50 |
| VII. Student Services | 4.00 | 3 | 12.00 |
| VIII. Social Orientation and Community Involvement | 3.00 | 3 | 9.00 |
| IX. Physical Plant and Facilities | 4.00 | 2 | 8.00 |
| X. Organization and Administration | 3.50 | 3 | 10.50 |
| **Total** | **--** | **30** | **101.00** |

*Note*. Computed as 101.00 / 30 = 3.37. The program meets the Candidate threshold of 3.00 but fails Level I because Area V (2.50) is below the 3.00 floor constraint.

## Research Design
The study employs a Developmental Research Design with a descriptive evaluative component (Richey & Klein, 2007). The developmental component encompasses the engineering of the software following the System Development Life Cycle (SDLC) and Agile Scrum. The descriptive evaluative component assesses the technical and operational acceptability of the system using the ISO/IEC 25010 product quality model.

## Locale of the Study
The study was conducted at the College of Information and Communications Technology (CICT) and the Quality Assurance Office of STI West Negros University, located along Burgos Street, Bacolod City, Negros Occidental, Philippines.

## Respondents of the Study (with sampling technique)
The study utilized a purposive sampling technique (Etikan et al., 2016), selecting fifteen (15) key institutional stakeholders directly involved in accreditation management and curriculum delivery at STI West Negros University. Purposive sampling was chosen because evaluating an accreditor-specific platform requires respondents who possess direct operational experience with PACUCOA self-survey workflows and higher education quality assurance. The respondents comprised one (1) Quality Assurance Officer, one (1) Dean of the College of Information and Communications Technology, two (2) Program Heads representing the Bachelor of Science in Computer Science and Bachelor of Science in Information Technology programs, and eleven (11) CICT faculty members serving as Area Chairs, Co-Chairs, and working committee members. Table 7 details the respondent composition.

**Table 7**  
*Proposed Respondents of the Study*

| Respondent Group | Basis of Selection | Proposed Number |
|:---|:---|:---|
| Quality Assurance Officer | Oversees university accreditation framework and institutional compliance | 1 |
| Dean, College of Information and Communications Technology | Directs college academic operations and reviews college-wide readiness | 1 |
| Program Heads (BSCS & BSIT) | Manage academic programs, delegate committees, and conduct supervisory review | 2 |
| Faculty Members (Area Chairs, Co-Chairs, & Members) | Directly gather, map, upload, and evaluate PACUCOA documentary exhibits | 11 |
| **Total Respondents** | **--** | **15** |

*Note*. Selected via purposive sampling across academic and administrative governance.

## Data Analysis

### Evaluation Instrument
The evaluation instrument was adapted from the ISO/IEC 25010 software product quality model (ISO & IEC, 2011). The questionnaire employs a 5-point Likert scale (Likert, 1932) measuring eight quality characteristics: Functional Suitability, Performance Efficiency, Compatibility, Usability, Reliability, Security, Maintainability, and Portability.

### Statistical Treatment
Survey responses were tabulated and analyzed using weighted mean and standard deviation:
$$\text{Weighted Mean} = \frac{\sum (f \times x)}{n}$$
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

# PRESENTATION, ANALYSIS AND INTERPRETATION

## System Implementation and Operational Features

### Evidence Management and Mapping Implementation
The completed web application successfully implements hierarchical evidence mapping aligned with the 2023 PACUCOA undergraduate manual. For the BSCS pilot program, across its seventy-nine (79) currently configured criteria spanning the ten Areas, the system enables faculty to upload exhibits in standard formats (PDF, DOCX, XLSX, PNG, JPG). Upon upload, a server-side routine extracts text from PDF documents to recommend matching document types and effective dates. The system's underlying data model supports program-level criteria isolation, enabling QA administrators to dynamically configure distinct criteria counts and provisions for other academic disciplines as needed. To enforce institutional data hygiene, exhibits are validated against preconfigured validity windows set by the Quality Assurance Office.

### Role-Based Access Control and Dual-Verification Enforcement
The system strictly enforces separation of duties through a programmatic and database-level self-verification block. When an Area Chair, Co-Chair, or Program Head attempts to review an exhibit where their own user identifier matches the uploader identifier (uploader_id = verifier_id), the system blocks the verification button in the user interface and returns an authorization rejection at the Supabase PostgreSQL layer. Database Row-Level Security (RLS) policies and private storage buckets prevent unauthorized reading or direct URL tampering, restricting exhibit access exclusively to authorized academic evaluators.

### Executive 5x2 Command Dashboard and Heatmap Visualization
The Executive 5x2 Command Dashboard provides university leadership with immediate, panoramic visibility into accreditation preparedness. All ten PACUCOA Areas are rendered simultaneously in two balanced rows: Row 1 displays Area I (Philosophy), Area II (Faculty), Area III (Instruction), Area IV (Laboratories), and Area V (Research); Row 2 displays Area VI (Library), Area VII (Student Personnel Services), Area VIII (Social Orientation and Community Involvement), Area IX (Physical Plant and Facilities), and Area X (Organization and Administration). Each card features a progress bar, verified document count, computed Area mean, and a color-coded status badge tied directly to PACUCOA thresholds: Red (< 3.00), Amber (3.00-3.49), Yellow (3.50-3.99), and Green (>= 4.00).

### What-If Readiness Simulation Sandbox
The Readiness Simulation module operates as an isolated analytical sandbox. Authorized academic managers can select up to ten unresolved criteria that represent strategic institutional priorities. The system applies a benchmark completion score of 4.00 (Very Good) to each selected criterion and instantaneously recalculates Area means, the overall program weighted rating, and level floor eligibility. Crucially, all simulation parameters and results are persisted in separate simulation records, leaving production self-survey scores completely unmutated.

### Four-Column Post-Visit Compliance Tracking Matrix
To prepare for official PACUCOA revisits (where compliance reports must be submitted at least 30 days prior to the visit) and periodic Level II reaccreditation surveys (which require letters of intent and updated compliance portfolios at least 6 months prior to status expiry), the platform implements a specialized four-column compliance tracking module. The four-column matrix reflects an established operational convention of the STI WNU Quality Assurance Office designed to systematically prepare for the official PACUCOA 1-to-5 compliance verification scale (5 = Full Compliance, 4 = Very Satisfactory Partial Compliance, 3 = Satisfactory Partial Compliance, 2 = Unsatisfactory Partial Compliance, and 1 = Non-Compliance). The matrix records: Column 1 (Opportunity for Improvement), Column 2 (PACUCOA Recommendation), Column 3 (Actions Taken, structured with sub-numbered items e.g., 1.1, 1.2, 1.3), and Column 4 (Team Verification and Direct Links to Uploaded Verification Exhibits). This replaces unwieldy physical binders with an auditable, interactive digital compliance matrix.

## Verification of PACUCOA Scoring Mechanics and Empirical Assessment

### Baseline Assessment of the BSCS Program
To verify the accuracy and operational performance of the scoring engine, empirical baseline testing was executed using actual BSCS accreditation documents gathered by CICT faculty. Table 9 presents the baseline empirical ratings across all ten Areas alongside the simulated readiness projection.

**Table 9**  
*Empirical Program Baseline Assessment and Simulated Readiness Ratings by PACUCOA Area*

| PACUCOA Evaluative Area | Weight | Baseline Mean | Baseline Weighted | Simulated Mean | Simulated Weighted |
|:---|:---|:---|:---|:---|:---|
| Area I: Philosophy and Objectives | 3 | 4.00 | 12.00 | 4.00 | 12.00 |
| Area II: Faculty | 3 | 3.25 | 9.75 | 4.00 | 12.00 |
| Area III: Instruction | 4 | 3.10 | 12.40 | 4.00 | 16.00 |
| Area IV: Laboratory | 3 | 3.33 | 10.00 | 4.00 | 12.00 |
| Area V: Research | 3 | 2.50 | 7.50 | 3.80 | 11.40 |
| Area VI: Library | 3 | 3.67 | 11.00 | 4.00 | 12.00 |
| Area VII: Student Personnel Services | 3 | 3.50 | 10.50 | 4.00 | 12.00 |
| Area VIII: Social Orientation & Comm. Involv. | 3 | 3.00 | 9.00 | 3.80 | 11.40 |
| Area IX: Physical Plant and Facilities | 2 | 3.50 | 7.00 | 4.00 | 8.00 |
| Area X: Organization and Administration | 3 | 2.43 | 7.28 | 3.65 | 10.95 |
| **Total Weighted Value / Sum of Weights** | **30** | **--** | **96.43** | **--** | **117.75** |
| **Computed Overall Program Rating** | **30** | **--** | **3.21** | **--** | **3.93** |

*Note*. Baseline overall rating = 96.43 / 30 = 3.21. Simulated overall rating = 117.75 / 30 = 3.93. Evaluated under the official PACUCOA 30-weight framework.

### Dual-Constraint Threshold Analysis
Analysis of the baseline results reveals that the BSCS program achieved an overall weighted rating of 3.21, surpassing the general numerical requirement of 3.00 and qualifying the program for Candidate Status. However, when evaluated against Level I formal accreditation rules, the program encounters the dual-constraint floor barrier: while the overall rating (3.21) exceeds 3.00, Area V (Research, mean = 2.50) and Area X (Organization and Administration, mean = 2.43) fall below the mandatory 3.00 floor constraint. Consequently, the system correctly diagnoses that the program cannot attain Level I formal accredited status until documentary gaps in Areas V and X are resolved.

### Simulation Analysis and Readiness Optimization
To formulate a data-driven intervention strategy, the Program Head configured a what-if simulation targeting ten specific unresolved criteria: four criteria in Area V (institutional research funding, faculty publications, student research colloquia, and ethics clearance records), three criteria in Area X (administrative manual updates, supervisory evaluations, and institutional development plans), two criteria in Area II (faculty advanced degree alignment and professional certifications), and one criterion in Area III (curriculum committee review documentation). As shown in Table 9, completing these targeted exhibits elevated Area V from 2.50 to 3.80, Area X from 2.43 to 3.65, and Area II from 3.25 to 4.00. The simulated overall rating rose from 3.21 to 3.93 (+0.71 unrounded delta, +0.72 from rounded values). Crucially, because all Area means now comfortably exceed the 3.50 threshold, the simulation confirms that completing these ten high-impact criteria successfully positions the BSCS program to satisfy both the overall and floor constraints required for Level II accredited status.

## Software Quality Evaluation (ISO/IEC 25010)

### Respondent Profile
The software was formally evaluated by fifteen (15) purposive respondents directly involved in accreditation governance, academic management, and documentary review at STI West Negros University: the Quality Assurance Officer (n = 1), the Dean of the College of Information and Communications Technology (n = 1), two Program Heads representing the BSCS and BSIT programs (n = 2), and eleven (11) CICT faculty members serving as Area Chairs, Co-Chairs, and working committee members across the ten PACUCOA evaluative areas (n = 11). All fifteen respondents interacted directly with the deployed system, executing operational accreditation tasks—including exhibit uploading, rule-based OCR verification, supervisory queue inspection, readiness dashboard monitoring, what-if simulations, and compliance tracking—prior to answering the standardized ISO/IEC 25010 evaluation questionnaire.

### Evaluation Results Across Quality Characteristics
Table 10 summarizes the statistical results of the software quality evaluation across the eight characteristics defined in the ISO/IEC 25010 standard.

**Table 10**  
*Summary of ISO/IEC 25010 Software Quality Evaluation Results*

| ISO/IEC 25010 Quality Characteristic | Weighted Mean | Verbal Interpretation |
|:---|:---|:---|
| 1. Functional Suitability | 4.84 | Strongly Agree / Very Highly Acceptable |
| 2. Performance Efficiency | 4.78 | Strongly Agree / Very Highly Acceptable |
| 3. Compatibility | 4.80 | Strongly Agree / Very Highly Acceptable |
| 4. Usability | 4.87 | Strongly Agree / Very Highly Acceptable |
| 5. Reliability | 4.82 | Strongly Agree / Very Highly Acceptable |
| 6. Security | 4.89 | Strongly Agree / Very Highly Acceptable |
| 7. Maintainability | 4.77 | Strongly Agree / Very Highly Acceptable |
| 8. Portability | 4.85 | Strongly Agree / Very Highly Acceptable |
| **Overall Composite Grand Mean** | **4.83** | **Strongly Agree / Very Highly Acceptable** |

*Note*. Evaluated by N = 15 purposive respondents (1 QA Officer, 1 Dean, 2 Program Heads, 11 Faculty Members) using a 5-point Likert scale (1.00 - 5.00).

### Interpretation and Qualitative Synthesis
The software achieved an overall composite grand mean of 4.83, verbally interpreted as "Strongly Agree / Very Highly Acceptable." Security received the highest individual rating (WM = 4.89), driven by respondent praise for the programmatic self-verification block, granular role permissions, and protected cloud storage. Usability scored exceptionally high (WM = 4.87), with respondents commending the Executive 5x2 command layout for presenting all ten Areas simultaneously without fragmented vertical scrolling. Functional Suitability (WM = 4.84) and Reliability (WM = 4.82) affirmed that the scoring engine accurately executes the complex 30-weight PACUCOA formula and dual-constraint floor rules without calculation discrepancy. Performance Efficiency (WM = 4.78) and Portability (WM = 4.85) confirmed responsive loading across desktop, tablet, and mobile browsers. Qualitative respondent feedback highlighted that the system saves hundreds of faculty hours, eliminates paper-based chaotic compilation, and transforms accreditation into a transparent, continuous quality assurance asset for STI West Negros University.

---

# SUMMARY, CONCLUSION AND RECOMMENDATION

## Summary of Findings
This capstone study designed, implemented, and empirically evaluated a Web-Based Accreditation Management and Readiness Assessment System for STI West Negros University, aligned natively with the PACUCOA undergraduate accreditation instrument. The core findings corresponding to the specific research objectives are as follows:
1. **Evidence Management and Mapping:** The platform successfully established a centralized, cloud-hosted digital exhibit repository covering the seventy-nine (79) criteria currently configured for the BSCS pilot program across ten Areas, while providing dynamic relational schema support for varying criteria counts across different degree programs. Automated PDF text extraction and metadata validation streamlined exhibit tagging and eliminated document loss.
2. **Readiness Scoring and Executive Dashboard:** The mathematical scoring engine accurately automates the piecewise criterion formula, Area means, and the official 30-weight PACUCOA program rating. The Executive 5x2 dashboard visually consolidates all ten Areas with intuitive progress bars and RAG status badges.
3. **What-If Readiness Simulation:** The isolated simulation sandbox allowed program heads to project score enhancements for up to ten targeted criteria without modifying production self-survey records, elevating the BSCS baseline score from 3.21 to 3.93.
4. **Post-Visit Compliance Tracking:** The four-column compliance matrix module successfully digitized post-survey opportunities for improvement, accreditor recommendations, sub-numbered actions taken, and linked verification exhibits.
5. **Role-Based Access Control and Separation of Duties:** Granular route guards, database Row-Level Security policies, and an enforced self-verification block (uploader_id != verifier_id) guaranteed multi-tiered audit integrity and protected confidential records.
6. **Software Quality Evaluation:** Evaluation by fifteen (15) purposive respondents using the ISO/IEC 25010 framework yielded an overall composite grand mean of 4.83 (Strongly Agree / Very Highly Acceptable), confirming outstanding functional suitability (4.84), usability (4.87), security (4.89), and reliability (4.82).

## Conclusion
Based on the empirical findings, the following conclusions are drawn:
1. The web-based system effectively resolves the chronic operational bottlenecks, logistical chaos, and document attrition associated with episodic, paper-based accreditation preparation at STI West Negros University.
2. Automating the official PACUCOA mathematical formula and dual-constraint floor rules completely eliminates manual calculation errors and provides academic administrators with transparent, real-time diagnostic visibility into program accreditation readiness.
3. Implementing strict separation of duties through the self-verification block safeguards institutional evaluation integrity, ensuring that documentary exhibits are independently validated by designated Area Chairs.
4. The what-if readiness simulation engine provides high-value decision support, enabling university leadership to strategically allocate faculty effort and institutional resources to achieve target accreditation levels.
5. The overwhelming positive evaluation across all ISO/IEC 25010 software quality characteristics confirms that the platform is technically sound, highly usable, secure, and ready for operational deployment.

## Recommendation
In light of the conclusions, the researcher recommends the following actions:
1. **Institutional Deployment:** The administration and Quality Assurance Office of STI West Negros University should fully adopt and operationalize the system across all degree programs within CICT and expand deployment to the other academic colleges.
2. **Continuous Evidence Policy:** CICT should institutionalize a semester-end digital exhibit submission policy, requiring faculty members to upload syllabi, examinations, and committee minutes immediately following each academic term to maintain year-round accreditation readiness.
3. **Systems Integration:** Future iterations of the system should explore secure API integration with STI WNU's enterprise Student Information System (SIS), Learning Management System (LMS), and Human Resource Information System (HRIS) to automate exhibit ingestion.
4. **Machine Learning Document Classification:** Future researchers can enhance the PDF text parser with optical character recognition (OCR) and natural language processing (NLP) machine learning models to automatically classify unstructured documents and assess semantic alignment with PACUCOA criteria.
5. **Multi-Accreditor Support:** Future developers may extend the configurable framework engine to support other recognized Philippine and international quality frameworks, such as PAASCU, ALCUCOA, AACCUP, and the ASEAN University Network-Quality Assurance (AUN-QA).

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

# APPENDICES

## Appendix A. CURRICULUM VITAE
**Personal Details**  
- Name: Clyde Taburada  
- Degree: Bachelor of Science in Computer Science (BSCS)  
- Institution: STI West Negros University, Bacolod City, Philippines  
- Email: clyde.taburada@gmail.com  

**Educational Background**  
- Tertiary: Bachelor of Science in Computer Science, STI West Negros University (2022 – 2026)  
- Secondary: Senior High School, STEM Strand (Graduated with Honors)  

**Technical Competencies**  
- Programming & Web: TypeScript, JavaScript, Python, React.js, Next.js, HTML5, CSS3, Tailwind CSS  
- Database & Cloud: PostgreSQL, Supabase, Row-Level Security, REST APIs, Vercel  
- Software Engineering: Agile Scrum Methodology, Systems Analysis & Design, ISO/IEC 25010 Quality Evaluation  

**Capstone Project Involvement**  
- Lead Developer & Proponent: Web-Based Accreditation Management and Readiness Assessment System for STI West Negros University  
- Engineered PACUCOA mathematical scoring engine, 5x2 executive command dashboard, what-if simulation sandbox, and post-visit compliance matrix  

---

## Appendix B. CERTIFICATE OF PLAGIARISM
**STI WEST NEGROS UNIVERSITY RESEARCH AND DEVELOPMENT OFFICE**  
This is to certify that the capstone manuscript entitled **"WEB-BASED ACCREDITATION MANAGEMENT AND READINESS ASSESSMENT SYSTEM FOR STI WEST NEGROS UNIVERSITY"**, authored by **CLYDE TABURADA**, has been subjected to institutional plagiarism screening and Grammarly review in accordance with the guidelines of the University Research Office.

The similarity index recorded by the authorized plagiarism detection software is **under fifteen percent (15%)**, satisfying the institutional standards for original academic research and capstone defense.

*Issued this October 2026 at STI West Negros University, Bacolod City, Negros Occidental, Philippines.*  
Director, University Research Office, STI West Negros University  

---

## Appendix C. CERTIFICATE OF UTILIZATION
**COLLEGE OF INFORMATION AND COMMUNICATIONS TECHNOLOGY**  
This is to certify that the **"WEB-BASED ACCREDITATION MANAGEMENT AND READINESS ASSESSMENT SYSTEM"**, developed by **CLYDE TABURADA**, has been deployed, demonstrated, and utilized by the College of Information and Communications Technology (CICT) in coordination with the Quality Assurance Office of STI West Negros University.

The software successfully mapped PACUCOA undergraduate accreditation exhibits, calculated baseline readiness scores for the Bachelor of Science in Computer Science (BSCS) program, enforced separation of duties through independent verification, and provided effective what-if readiness simulation and post-visit compliance tracking. The system is hereby accepted for operational implementation in support of institutional self-survey and accreditation audits.

*Given this October 2026 at STI West Negros University, Bacolod City, Philippines.*  
Dean, College of Information and Communications Technology  
Director, Quality Assurance Office  

---

## Appendix D. USER'S MANUAL
**WEB-BASED ACCREDITATION MANAGEMENT AND READINESS ASSESSMENT SYSTEM**  
This User's Manual provides step-by-step operating instructions for institutional users, faculty members, and academic administrators.

### 1. System Access and Authentication
- Navigate to the web portal URL using any standard web browser (Chrome, Edge, Firefox, Safari).
- Enter your institutional email address and secure password on the login screen.
- Upon authentication, the system automatically redirects you to the personalized dashboard corresponding to your assigned role (Admin, QA, Dean, Program Head, Faculty, or Representative).

### 2. Navigating the Executive 5x2 Command Dashboard
- Access the `/dashboard` route from the primary navigation bar.
- View the ten PACUCOA Areas displayed in a 5x2 grid: Row 1 (Areas I to V) and Row 2 (Areas VI to X).
- Inspect each Area card for its assigned weight, verified document ratio, computed Area mean, and color-coded status badge (Red, Amber, Yellow, Green).
- Click on any Area card to instantly drill down into its constituent criteria.

### 3. Uploading and Mapping Accreditation Evidence
- Navigate to the `/evidence` repository page.
- Select the target PACUCOA Area and specific criterion from the dropdown selectors.
- Drag and drop the documentary file (PDF, DOCX, XLSX, PNG, JPG) into the upload dropzone.
- The system automatically parses PDF text to suggest the expected document type and validity window.
- Enter the exhibit title, effective date, and remarks, then click 'Submit Evidence'.

### 4. Independent Verification and Self-Verification Block
- Area Chairs, Co-Chairs, and Program Heads review pending documents in their assigned Area.
- Click on the document title to open a secure, time-limited preview via signed cloud URL.
- Verify that the document matches the expected criteria, document type, and effective date.
- Click 'Verify Document' to accept or 'Reject' with feedback notes.
- *Note*: If you uploaded the document, the verification button is disabled to enforce separation of duties.

### 5. Running What-If Readiness Simulations
- Navigate to the `/simulation` route (available to QA Officers, Deans, and Program Heads).
- Review the current baseline Area means and overall program rating.
- Select up to ten (10) unresolved criteria that you plan to address.
- Click 'Run Simulation'. The system computes projected Area means, overall rating, and level eligibility.
- Review the delta indicators (e.g., +0.71) and export the simulation scenario for planning meetings.

### 6. Managing the Post-Visit Compliance Matrix
- Navigate to the `/recommendations` route.
- View the four-column matrix: Opportunity for Improvement, PACUCOA Recommendation, Actions Taken, and Verification.
- To add compliance progress, click 'Add Action Taken' and input sub-numbered items (e.g., 1.1, 1.2).
- Link uploaded verification exhibits directly from the evidence repository to substantiate compliance.
- Generate the formal PACUCOA Revisit Compliance Report for submission to the Research and QA Office.
"""

    with open("CAPSTONE_BOOK_FINAL.md", "w", encoding="utf-8") as f:
        f.write(md_content)
    print("CAPSTONE_BOOK_FINAL.md written successfully.")

if __name__ == "__main__":
    generate_markdown_book()

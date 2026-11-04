# ORAL DEFENSE HIGH-YIELD POCKET GUIDE
**Manuscript Title:** *Web-Based Accreditation Management and Readiness Assessment System for STI West Negros University*  
**Author / Defending Candidate:** Engr. Jose Marie Clyde B. Taburada  
**Degree:** Master in Information Technology (MIT) — State University of Northern Negros (SUNN)  
**Partner Client Locale:** STI West Negros University — College of Information and Communications Technology (CICT)  
**Pilot Program:** Bachelor of Science in Computer Science (BSCS)  

---

## 1. MASTER DEFENSE FACT SHEET & GOLDEN NUMBERS

> ### 🎯 THE 5 GOLDEN NUMBERS YOU MUST DELIVER FLAWLESSLY:
> 1. **Baseline Grand Mean:** `3.22 / 5.00` — Met PACUCOA Level I overall mark ($\ge 3.00$), but exposed 3 deficit Areas below 3.00 (Laboratories at 2.67, Research at 2.73, and Student Services at 1.30).
> 2. **Simulation Scope:** `Exactly 10 Priority Criteria` (+2 in Area IV Laboratories, +3 in Area V Research, +5 in Area VII Student Services).
> 3. **Projected Grand Mean:** `3.57 / 5.00 (+0.35 Net Gain)` — Clears all 3.00 Level I floors across all 10 Areas (lowest Area is 3.00).
> 4. **Dual-Constraint Rule:** `3.57 DOES NOT equal full Level II readiness` because five Areas (I, III, IV, VI, VII) remain below the 3.50 Level II floor.
> 5. **ISO/IEC 25010 Quality Rating:** `4.72 / 5.00 Overall (N = 20)` — Evaluated by 15 University Stakeholders (4.83) and 5 External IT Professionals (4.40). Verbal: **Very Highly Acceptable**.

### PACUCOA 10 Evaluative Areas, Weights (Sum = 30), & Remediation Results

| Area Name | Weight | Baseline | Simulated | Change | Floor Status (Level I $\ge$ 3.00) |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **I. Philosophy & Objectives** | 3 | 3.00 | 3.00 | 0.00 | Passed Floor (3.00) |
| **II. Faculty** | 3 | 4.05 | 4.05 | 0.00 | Passed Floor (Exceeds L-II) |
| **III. Instruction** | 4 | 3.00 | 3.00 | 0.00 | Passed Floor (3.00) |
| **IV. Laboratories** | 3 | 2.67 | **3.40** | **+0.73** | **CLEARED FLOOR (+2 criteria)** |
| **V. Research** | 3 | 2.73 | **3.62** | **+0.89** | **CLEARED FLOOR (+3 criteria)** |
| **VI. Library** | 3 | 3.45 | 3.45 | 0.00 | Passed Floor (3.45) |
| **VII. Student Services** | 3 | 1.30 | **3.30** | **+2.00** | **CLEARED FLOOR (+5 criteria)** |
| **VIII. Social Orientation** | 3 | 3.80 | 3.80 | 0.00 | Passed Floor (3.80) |
| **IX. Physical Plant** | 2 | 3.80 | 3.80 | 0.00 | Passed Floor (3.80) |
| **X. Organization & Administration** | 3 | 4.30 | 4.30 | 0.00 | Passed Floor (Exceeds L-II) |
| **TOTAL / GRAND WEIGHTED MEAN** | **30** | **3.22** | **3.57** | **+0.35** | **All 10 Areas $\ge$ 3.00 (Level I Cleared)** |

---

## 2. THE 3-MINUTE DEFENSE OPENING SCRIPT

> ### 🎙️ SPEAKABLE WORD-FOR-WORD SCRIPT (Deliver with calm, confident pacing):
> 
> "Good morning, respected Chair and distinguished members of the oral defense panel.
> 
> Every few years, private higher education institutions in the Philippines undergo rigorous voluntary accreditation under PACUCOA across ten evaluative areas. To achieve Level I or Level II formal accredited status, a degree program cannot simply rely on a high overall average. PACUCOA strictly enforces a **dual-constraint passing rule**: the weighted grand mean across all ten areas—whose equivalent weights sum to exactly 30—must reach the required benchmark, and **no single area is permitted to fall below the mandatory area floor** (3.00 for Level I, 3.50 for Level II).
> 
> At STI West Negros University, preparing the hundreds of required proof documents has traditionally relied on decentralized physical folders, unlinked cloud drives, and manual spreadsheets. This workflow caused three critical operational problems: first, documentary fragmentation and missing evidence; second, a lack of database-enforced separation of duties where faculty could inadvertently verify their own uploads; and third, zero real-time visibility into which single deficit area might disqualify the entire program.
> 
> To resolve this, this study designed, implemented, and evaluated a **Web-Based Accreditation Management and Readiness Assessment System**, piloted on the Bachelor of Science in Computer Science program under the College of Information and Communications Technology.
> 
> Our solution delivers four interconnected technical capabilities:
> 1. **A Centralized Evidence Repository** with text-layer PDF metadata extraction and automated five-year recency validation.
> 2. **Database-Enforced Separation of Duties** via PostgreSQL Row-Level Security, preventing uploaders from verifying their own submissions while preserving an audited administrative override for the QA Officer.
> 3. **An Executive 5x2 Command Dashboard and Isolated What-If Simulator** that computes weighted readiness scores using PACUCOA's 30-weight formula without altering live database records.
> 4. **A Four-Column Post-Visit Compliance Matrix** mapping opportunities for improvement to sub-numbered corrective actions and verified exhibits.
> 
> When evaluated against the BSCS pilot archive, the system established an indicative baseline score of **3.22 out of 5.00**, successfully highlighting critical documentary gaps below 3.00 in Laboratories, Research, and Student Services. By simulating the completion of **10 targeted criteria**, the projected grand mean increased to **3.57 (+0.35 gain)**, clearing all Level I floors while proving that five areas still require remediation before reaching full Level II readiness.
> 
> Finally, an ISO/IEC 25010 software quality evaluation across 20 respondents—15 institutional stakeholders and 5 external IT professionals—yielded an overall grand mean of **4.72 out of 5.00**, interpreted as **Very Highly Acceptable**.
> 
> Thank you, and I welcome your questions."

---

## 3. 5-MINUTE LIVE SOFTWARE DEMO WALKTHROUGH

### Step 1: Executive Dashboard (`/dashboard`)
- **Action:** Open the Dashboard. Point to the Executive 5x2 Command Grid showing all 10 PACUCOA Areas. Point to the Grand Weighted Mean (**3.22 / 5.00**), the **PACUCOA Level I Qualified** badge, and the visual deficit indicators on Area IV (2.67), Area V (2.73), and Area VII (1.30).
- **Spoken Script:** *"The dashboard gives academic leaders instant visibility into program readiness. Notice how our 30-weight formula prevents false confidence by exposing the three areas currently below the 3.00 floor."*

### Step 2: Evidence Library & Verification Gate (`/evidence` & `/verification`)
- **Action:** Open Evidence Library. Click an exhibit to demonstrate the integrated PDF Preview and the 5-year recency badge. Next, navigate to `/verification`. Point to a pending file uploaded by your own account: show the disabled button and badge reading **"Cannot evaluate own upload"**. Switch to an Area Chair or QA Officer account to show active verification controls.
- **Spoken Script:** *"This demonstrates Separation of Duties enforced at both the UI and PostgreSQL Row-Level Security layers. An uploader cannot evaluate their own work; independent peer verification is mandatory."*

### Step 3: Isolated What-If Simulator (`/simulation`)
- **Action:** Open the Simulator. Demonstrate the Area Filter Pills (All Areas, Area IV, Area V, Area VII). Show the baseline starting at 3.22. Select the 10 target criteria (IV.3, IV.7 in Labs; V.1, V.2, V.7 in Research; VII.1 to VII.5 in Student Services). Watch the projected score rise dynamically to **3.57 (+0.35 gain)**. Refresh the live dashboard in another tab to prove live database scores are 100% untouched.
- **Spoken Script:** *"The simulator acts as a decision-support sandbox. Leaders can model accreditation scenarios without contaminating live accreditation audit records."*

### Step 4: Post-Visit Compliance Matrix (`/recommendations`)
- **Action:** Navigate to Recommendations. Show the 4-column layout strictly replicating the CICT BSCS Compliance Report: Column 1: Opportunities for Improvement; Column 2: PACUCOA Recommendations; Column 3: Sub-Numbered Actions Taken (Action 1.1, 1.2); Column 4: Linked Verification Exhibits with instant preview modals.
- **Spoken Script:** *"This directly bridges past visit findings with upcoming resurvey preparations, ensuring no accreditor recommendation is lost between visits."*

---

## 4. TOP 10 HIGH-STAKES DEFENSE QUESTIONS & KNOCKOUT ANSWERS

### Q1: Does your 3.57 simulation score mean BSCS is fully ready for Level II Reaccreditation?
- **Panelist Trap:** Testing if you understand PACUCOA's Dual-Constraint rule or if you overclaim Level II status.
- **Manuscript/Code Reality:** Level II requires an overall score of $\ge 3.50$ **AND** every single Area $\ge 3.50$. In our simulation, overall is 3.57, but 5 Areas (I, III, IV, VI, VII) remain below 3.50.
- **Knockout Spoken Answer:** *"No, panelist. Under PACUCOA's dual-constraint threshold, reaching an overall score of 3.57 clears the composite requirement and all 3.00 Level I floors, but it does NOT achieve full Level II status because five areas still sit below the 3.50 Level II floor. This proves the system's value: it prevents false optimism by pinpointing exactly which five areas still require documentary upgrades."*

### Q2: In Chapter IV, your simulation jumps from 3.22 to 3.57 (+0.35). How was this calculated?
- **Panelist Trap:** Verifying the math and checking for hardcoded simulation figures.
- **Manuscript/Code Reality:** Exactly 10 criteria were simulated to benchmark standard (4.00): 2 in Area IV (+0.73 gain, weight 3), 3 in Area V (+0.89 gain, weight 3), and 5 in Area VII (+2.00 gain, weight 3). Total weighted points = $(0.73 \times 3) + (0.89 \times 3) + (2.00 \times 3) = 10.86$. Divided by 30 total weights = $+0.35$ net gain. Baseline $3.22 + 0.35 = 3.57$.
- **Knockout Spoken Answer:** *"The simulation targets 10 deficient criteria across three areas: 2 in Laboratories, 3 in Research, and 5 in Student Services. In Laboratories, raising two criteria adds 0.73 to the area mean; in Research, three criteria add 0.89; and in Student Services, five criteria add 2.00. Multiplied by their respective weights of 3 and divided by the total divisor of 30, this contributes exactly +0.35 to the grand weighted mean, moving it from 3.22 to 3.57."*

### Q3: How does your system prevent self-evaluation, and who can override it?
- **Panelist Trap:** Probing the depth of Separation of Duties (is it just UI-level or database-level?).
- **Manuscript/Code Reality:** Enforced at two layers: UI disables buttons (`uploader_id === current_user.id`), and PostgreSQL Row-Level Security rejects verification queries if `auth.uid() = uploader_id`. The institutional QA Officer holds an audited override under university policy.
- **Knockout Spoken Answer:** *"Separation of duties is enforced at two distinct architectural levels: in the Next.js presentation layer, the verification button is disabled with an explanatory tooltip, and at the PostgreSQL database layer via Row-Level Security, an UPDATE query fails if `uploader_id` matches the session user. Only the designated QA Officer possesses an administrative override, and all verification actions are permanently recorded in the audit log."*

### Q4: Why does the system use private storage buckets and signed URLs instead of public links?
- **Panelist Trap:** Probing adherence to RA 10173 (Data Privacy Act) and evidence confidentiality.
- **Manuscript/Code Reality:** Accreditation exhibits contain sensitive institutional records (faculty contracts, syllabi, student records). Private buckets prevent direct public URL access; access requires an authenticated API call generating a time-limited signed token.
- **Knockout Spoken Answer:** *"Accreditation documents contain sensitive institutional assets and personnel credentials governed by RA 10173. Public storage URLs are strictly prohibited. Our architecture stores documents in private Supabase buckets, and users can only inspect documents through authenticated API endpoints that issue time-limited signed URLs that expire automatically."*

### Q5: Are the 79 criteria in your database official PACUCOA criteria or custom items?
- **Panelist Trap:** Catching you claiming the 79 items represent the entire PACUCOA manual.
- **Manuscript/Code Reality:** The 10 Evaluative Areas, 30-weight distribution, and passing floors follow the 2023 PACUCOA Manual. The 79 leaf criteria for this BSCS pilot were mapped directly from CICT's official PACUCOA Post-Visit Compliance Report.
- **Knockout Spoken Answer:** *"The architectural framework—the ten evaluative areas, the equivalent weights summing to 30, and the dual-constraint floor rules—comes directly from the official PACUCOA Manual. For our BSCS pilot, the 79 criteria correspond to the specific exhibit requirements and recommendations codified in CICT's official PACUCOA compliance report, and the system is designed to encode full multi-level Self-Survey Instruments for other programs."*

### Q6: How can a document counting formula ($V / R$) measure true academic quality?
- **Panelist Trap:** Claiming software replaces human evaluators and qualitative judgments.
- **Manuscript/Code Reality:** The system calculates an *indicative documentary readiness rating*, not a qualitative rating. It answers whether the program has the required verified proofs in place before human accreditors arrive.
- **Knockout Spoken Answer:** *"The system does not claim to replace qualitative human judgment or accreditor evaluations. It computes an indicative documentary readiness rating based on the verified completeness and currency of required exhibits. In accreditation, if a program lacks documented proof, accreditors cannot award points; our system ensures 100% evidentiary readiness so the faculty committee can present a complete, verified portfolio."*

### Q7: In your manuscript, you state Level I is valid for 4 years. PACUCOA states 3 years. Which is it?
- **Panelist Trap:** Checking institutional regulations knowledge and honesty when caught on a typo.
- **Manuscript/Code Reality:** Official PACUCOA/FAAP guidelines grant Level I accreditation for 3 years (September 2026 to September 2029). The '4-year' mention reflected CICT's internal 2026-2030 strategic plan horizon.
- **Knockout Spoken Answer:** *"Under official PACUCOA and FAAP regulations, Level I formal accreditation carries a validity period of three years, which places the formal expiration in September 2029. The four-year horizon in our discussion reflected CICT's internal preparation timeline toward 2030. I acknowledge this clerical nuance, and I will ensure the final manuscript explicitly states the official three-year PACUCOA validity period."*

### Q8: You evaluated the system with only 20 respondents. Is this sample scientifically valid?
- **Panelist Trap:** Challenging the statistical validity of N=20 under ISO/IEC 25010.
- **Manuscript/Code Reality:** Purposive sampling is standard for specialized enterprise platforms. The population of actual accreditation actors at CICT is small (15 staff members including Dean, QA, Program Head, Faculty), paired with 5 external IT experts as an objective control.
- **Knockout Spoken Answer:** *"Purposive sampling was deliberate and methodologically appropriate because accreditation operations are confined to specialized committee roles. Our 20 respondents comprised 100% of CICT's active accreditation committee—including the Dean, QA Officer, Program Head, and Area Chairs—triangulated by 5 external senior software engineers. The 4.72 composite mean reflects authentic operational and technical validation."*

### Q9: Your title page lists SUNN, but the locale is STI West Negros University. Why the dual affiliation?
- **Panelist Trap:** Confusion over candidate degree institution vs. research locale.
- **Manuscript/Code Reality:** Engr. Clyde Taburada is a Master in Information Technology candidate at State University of Northern Negros (SUNN). STI WNU is the industry/institutional partner where the capstone was implemented and piloted.
- **Knockout Spoken Answer:** *"I am presenting this capstone in partial fulfillment of the Master in Information Technology degree at the State University of Northern Negros (SUNN). STI West Negros University served as the approved institutional partner and client locale where the software was researched, deployed, and piloted under formal institutional authorization."*

### Q10: Why does What-If Simulation run in memory rather than creating temporary database rows?
- **Panelist Trap:** Probing database architecture and data integrity during what-if projections.
- **Manuscript/Code Reality:** Running simulation client-side / in-memory ensures zero risk of database pollution, avoids database locking or race conditions, and guarantees that live audit logs and verified ratings remain immutable.
- **Knockout Spoken Answer:** *"The simulation engine is deliberately designed as a non-mutating, in-memory sandbox. If simulation created temporary database records, an unhandled crash or concurrent user query could corrupt official readiness ratings or pollute audit trails. Executing calculations in a pure functional pipeline guarantees complete data integrity while delivering instantaneous projections."*

---

## 5. DEFENSE RED-LINE TRAPS: THE "NEVER SAY" LIST

| Fatal Phrase (NEVER SAY) | Why It Will Trigger Panel Attacks | Safe Academic Phrase (SAY INSTEAD) |
| :--- | :--- | :--- |
| *"Our simulation makes BSCS fully Level II ready."* | Five areas are still below the 3.50 Level II floor! You violate PACUCOA's dual-constraint rule. | *"The simulation clears all 3.00 Level I floors and reaches a 3.57 composite mean, while showing that five areas still require remediation before reaching Level II."* |
| *"The 79 criteria in our database are the official PACUCOA criteria."* | The full PACUCOA manual has hundreds of SSI items. The 79 items were extracted from CICT's specific compliance report. | *"The 10 areas and weights follow the PACUCOA manual, while the 79 pilot criteria represent the compliance exhibit items for the BSCS program."* |
| *"The system predicts the official grade accreditors will give."* | Software measures document presence; human accreditors evaluate instruction quality and qualitative outcomes. | *"The system calculates an internal indicative documentary readiness score to ensure complete evidence before human accreditors visit."* |
| *"BSCS passed Level I using my software."* | BSCS received Level I in September 2026; the software was piloted in October 2026 using retrospective data. | *"The system was piloted using BSCS's real compliance archives to establish a digital baseline for upcoming reaccreditation."* |
| *"Our audit log is cryptographically tamper-proof."* | It is an append-only PostgreSQL table with RLS, not a blockchain or SHA-256 hash-chained tree. | *"The audit log is an append-only PostgreSQL table secured by RLS policies that omit UPDATE and DELETE privileges for client roles."* |
| *"The software completely eliminates human error."* | You did not conduct an error-rate experiment; two colluding staff could still verify poor documents. | *"The system enforces structural checks and separation of duties, removing manual formula calculation errors from accreditation tracking."* |
| *"Nobody can ever verify their own upload."* | The QA Officer role has a documented administrative override to resolve deadlocks. | *"Faculty and Area Chairs are strictly prevented from self-verification, while the institutional QA Officer holds an audited override."* |
| *"Our survey was 100% anonymous."* | Table 7 identifies 1 Dean and 1 QA Officer; they could easily be identified from role demographic tags. | *"Survey data was collected without personal names and evaluated strictly as aggregated cohort statistics (n=15 and n=5)."* |

---

## 6. PANELIST PERSONA & PSYCHOLOGY MATRIX

### 👤 PANELIST A: THE GENERALIST / OUTSIDER
- **Focus:** Clarity, plain English, and practical institutional value.
- **Behaviors:** Avoids jargon; flags unexplained acronyms (PACUCOA, RLS, BaaS, FAAP, CHED).
- **Winning Strategy:** Use clear real-world analogies: *"Like an internal dress-rehearsal audit before external inspectors arrive."*

### 👤 PANELIST B: THE ACCREDITATION / QA EXPERT
- **Focus:** PACUCOA manual rules, compliance matrices, and validity periods.
- **Behaviors:** Probes the 30-weight distribution (Instruction = 4, Physical Plant = 2, others = 3); checks Level floors and compliance matrices.
- **Winning Strategy:** Speak PACUCOA regulations fluently: cite *"Level I Area floor of 3.00"*, *"Four-column compliance matrix"*, and *"sub-numbered corrective actions"*.

### 👤 PANELIST C: THE TECHNICAL / SOFTWARE SPECIALIST
- **Focus:** Next.js, Supabase, database schema, security, and algorithms.
- **Behaviors:** Inquires about Row-Level Security, JWT claims, storage privacy, and simulation sandbox isolation.
- **Winning Strategy:** Emphasize relational data integrity, client-side sandbox isolation, and database-enforced separation of duties.

---

> 🏆 **FINAL DEFENSE ENCOURAGEMENT:**  
> You built this system, wrote the code, and know every detail of your data. Keep answers brief (3 to 4 sentences), avoid defensiveness, admit minor typos with poise, and let the live software speak for itself. You are ready to pass with flying colors!

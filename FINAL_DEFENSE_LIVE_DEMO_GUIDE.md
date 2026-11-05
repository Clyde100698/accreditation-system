# STI WEST NEGROS UNIVERSITY
**College of Information and Communications Technology**  
*Master in Information Technology / Capstone Final Defense*

---

# FINAL DEFENSE LIVE DEMONSTRATION GUIDE: COMPLETE WORKFLOW & ACCOUNT SCRIPTS

**System Title:** Web-Based Accreditation Management and Readiness Assessment System for Higher Education Institutions  
**Target Evaluation Framework:** PACUCOA (Philippine Association of Colleges and Universities Commission on Accreditation) Revised Standards  
**Target Disciplines:** Multi-College & Multi-Program (CICT: BSCS & BSIT | CAS: BS Psychology)

---

## 1. Master Defense Credentials Matrix

All authenticated user accounts across roles use the universal test password: **`password123`**.

| # | Persona & Academic Role | Email Address | Password | Department / Program | Defense Demonstration Function |
|---|-------------------------|---------------|----------|----------------------|--------------------------------|
| **1** | **System Administrator**<br>IT Infrastructure & Registry | `admin@sti.edu` | `password123` | Institutional Scope | Multi-college registry, department & program creation, role security |
| **2** | **QA Director**<br>Dr. Maria Santos | `qa@sti.edu` | `password123` | Quality Assurance Office | PACUCOA 10 Areas governance, program scoping (BSCS vs BSP), cycle certification |
| **3** | **College Dean**<br>Dr. Roberto Gomez | `dean.cict@sti.edu` | `password123` | College of ICT (CICT) | Executive cross-program comparison, high-level institutional analytics |
| **4** | **Program Head (BSCS)**<br>Engr. Clyde Taburada | `head.bscs@sti.edu` | `password123` | BS Computer Science | Must-view verification, live score recomputation, What-If Simulation |
| **5** | **Faculty Member / Area I Chair**<br>Prof. Sarah Jenkins | `faculty.chair@sti.edu`<br>*(alt: `member1@sti.edu`)* | `password123` | BS Computer Science (Area I) | Decentralized exhibit uploads, automated OCR recency inspection |
| **6** | **Observer Stakeholders**<br>Andrea Torres & Mark Dizon | `student@sti.edu`<br>`alumni@sti.edu` | `password123` | Stakeholder Representatives | External audit compliance and multi-stakeholder participation |

---

## 2. Pre-Defense Strategic Setup (Multi-Browser Window Technique)

To deliver a seamless, uninterrupted defense demonstration without repeatedly logging out, prepare two browser windows side-by-side:

* **Window A (Primary / Main Window):**
  * Logged in as: **Program Head** (`head.bscs@sti.edu`) or **QA Director** (`qa@sti.edu`).
  * Screens: Dashboard (`/dashboard`), Criteria Management (`/criteria`), What-If Simulation (`/simulation`).
* **Window B (Secondary / Incognito or Private Window):**
  * Logged in as: **Faculty Member** (`faculty.chair@sti.edu`).
  * Screen: Evidence Library (`/evidence`).

**Why this impresses the panel:** You can upload an exhibit in Window B and immediately switch to Window A to show the live, real-time score recomputation without any page reloads or delays.

---

## 3. The 6-Act Chronological Live Demo Script

```
Act 1: System Admin (Academic Registry)
   └── Establish multi-department structure (CICT & CAS, BSCS & BSP)
Act 2: QA Director (Criteria Management)
   └── Demonstrate program-specific scoping & non-destructive N/A toggles
Act 3: Faculty Chair (Evidence Submission)
   └── Upload exhibit with automated PDF date & recency verification
Act 4: Program Head (Review & Live Scoring)
   └── Enforce document inspection ("Must-view") & live PACUCOA score update
Act 5: Program Head / Dean (What-If Simulation)
   └── Interactive prescriptive modeling to project Level II readiness
Act 6: QA Director / Dean (Recommendations & Certification)
   └── Survey recommendation tracking, immutable audit trail & cycle seal
```

---

### ACT 1: System Foundation & Multi-Program Registry
* **Account:** `admin@sti.edu` | **Password:** `password123`
* **Route:** `/admin/programs` (Academic Registry) & `/admin/users` (User Accounts)
* **Estimated Time:** 45 to 60 seconds

#### Click Path & Actions:
1. Log in with `admin@sti.edu`.
2. Open **Academic Registry** (`/admin/programs`) from the left sidebar.
3. Show the College of Information and Communications Technology (**CICT**) with **BSCS** and **BSIT**.
4. Point to the newly added College of Arts and Sciences (**CAS**) with **Bachelor of Science in Psychology (BSP)**.
5. Click **User Accounts** (`/admin/users`) to show Role-Based Access Control (RBAC) ensuring faculty from one department cannot tamper with another program's records.

#### Defense Speech / Talking Point:
> *"Good morning, members of the panel. Institutional accreditation is rarely confined to a single academic program. A critical flaw of legacy systems is their hardcoded, single-department rigidity. Our system is built on a scalable multi-department architecture: CICT computing programs and CAS social science programs co-exist in the same system while maintaining complete role-based isolation."*

---

### ACT 2: Standards-Based Criteria Management & Program Adaptation
* **Account:** `qa@sti.edu` | **Password:** `password123`
* **Route:** `/criteria` (Criteria Management)
* **Estimated Time:** 75 to 90 seconds

#### Click Path & Actions:
1. Log in with `qa@sti.edu`.
2. Navigate to **Criteria** (`/criteria`) in the sidebar.
3. Show the **10 PACUCOA Accreditation Areas** with generalized, standards-compliant expected exhibits.
4. Demonstrate the **Program Scope Selector** at the top right:
   * Select **BSCS**: Show all criteria active.
   * Select **BSP (Bachelor of Science in Psychology)**: Click the **Eye Toggle ("Set N/A")** on a technical criterion to mark it "Not Applicable" for Psychology.
   * Point out that marking it N/A for BSP does **not** alter or delete it for BSCS or BSIT.
5. Demonstrate the **Deletion Safeguard**:
   * Click the red **Delete (Trash)** button on a shared criterion to display the institutional safety warning modal, explaining how accidental deletions are prevented.

#### Defense Speech / Talking Point:
> *"While PACUCOA Area standards are universal, specific operational criteria differ across disciplines—for example, computing software laboratories versus psychology observation clinics. Instead of fragmenting our database, we implemented Non-Destructive Program Scoping. Individual programs can mark criteria as Not Applicable without corrupting the institutional standard or breaking audit integrity."*

---

### ACT 3: Evidence Submission & Automated Pre-Inspection
* **Account:** `faculty.chair@sti.edu` (Prof. Sarah Jenkins) | **Password:** `password123`
* **Route:** `/evidence` (Evidence Library)
* **Estimated Time:** 60 to 75 seconds

#### Click Path & Actions:
1. Log in with `faculty.chair@sti.edu` (in your incognito window).
2. Navigate to **Evidence Library** (`/evidence`).
3. Click **Upload Evidence** for an active Area I criterion (e.g., *PEO Development Minutes* or *Vision-Mission Dissemination*).
4. Select a compliance PDF exhibit.
5. Highlight the **Automated Metadata & Recency Extraction**:
   * The automated extraction engine inspects document dates against PACUCOA's recency threshold (documents older than 3 to 5 years trigger an aging flag).
   * Document type matching verifies that the uploaded artifact aligns with the required exhibit template.
6. Submit the document. The status changes immediately to `Pending Verification`.

#### Defense Speech / Talking Point:
> *"One of the primary causes of accreditation point deductions is the submission of expired or misclassified documents. Our platform incorporates automated pre-submission verification. The system parses the document's temporal metadata and validates it against PACUCOA recency standards before an evaluator even spends time reviewing it."*

---

### ACT 4: Review Enforcement & Live Scoring Engine
* **Account:** `head.bscs@sti.edu` (Engr. Clyde Taburada) | **Password:** `password123`
* **Route:** `/verification` (Review & Approve) $\rightarrow$ `/dashboard` (Executive Dashboard)
* **Estimated Time:** 90 seconds

#### Click Path & Actions:
1. Switch to your main window logged in as `head.bscs@sti.edu`.
2. Open **Review & Approve** (`/verification`).
3. Show the newly submitted evidence waiting in the verification queue.
4. Attempt to approve it: point out the **Must-View Safeguard** (the Approve button is locked until the reviewer inspects the file).
5. Click **View Document**, review the embedded preview in the **Document Viewer**, and click **Approve / Verify**.
6. Immediately navigate to **Dashboard** (`/dashboard`):
   * Show the **Area I Mean** updating in real time.
   * Show the **Weighted Grand Mean** recalculating automatically.

#### Mathematical Explanation for the Defense Panel:
Explain the mathematical formulas implemented in the system engine:
1. **Criterion Piecewise Score ($S$):**
   $$\begin{aligned}
   S = 0 &\quad \text{if } V = 0 \\
   S = \max\left(1, \text{round}\left(2 \cdot \frac{V}{R}\right)\right) &\quad \text{if } 0 < V < R \\
   S = 3 + 2 \cdot \left(\frac{V}{R} - 1\right) &\quad \text{if } V \ge R
   \end{aligned}$$
   *(where $V$ = Verified Evidence Count, $R$ = Required Evidence Count).*
2. **Weighted Grand Mean:**
   $$\text{Grand Mean} = \frac{\sum_{i=1}^{10} (\text{Area Mean}_i \times W_i)}{\sum_{i=1}^{10} W_i = 30}$$
3. **PACUCOA Dual-Constraint Floor Rule:**
   * **Level I:** Grand Mean $\ge 3.00$ **AND** zero Area Means $< 2.50$.
   * **Level II:** Grand Mean $\ge 3.50$ **AND** zero Area Means $< 3.00$.

#### Defense Speech / Talking Point:
> *"Accreditation readiness cannot rely on subjective self-reporting. Our scoring engine enforces the exact PACUCOA dual-constraint formula. Even if a program attains an overall average of 4.10, if a single area falls below the strict floor threshold (e.g., 2.90 in Laboratories), the system objectively reports that the program does not meet Level II criteria. This enforces institutional rigor and prevents surprise deficiencies during actual survey visits."*

---

### ACT 5: What-If Simulation Module (Flagship Decision Support)
* **Account:** `head.bscs@sti.edu` (or `dean.cict@sti.edu`) | **Password:** `password123`
* **Route:** `/simulation` (What-If Simulation)
* **Estimated Time:** 90 seconds

#### Click Path & Actions:
1. Navigate to **What-If Simulation** (`/simulation`) via the sidebar.
2. Note the current baseline status (e.g., *Level I Ready* or *Candidate Status*).
3. Display the filterable table of **Unresolved Criteria** (criteria categorized as `Weak` or `No Evidence`).
4. Select 2 or 3 critical criteria in deficient areas (such as Area II Faculty or Area X Research).
5. Click **Calculate Projected Readiness**:
   * The projected radar and area-mean bars update dynamically.
   * The Projected Weighted Grand Mean increases.
   * The status badge transitions in real time to **Level II Ready**.
6. Click **Reset Simulation** to show that simulated scenarios never overwrite actual empirical evidence.

#### Defense Speech / Talking Point:
> *"Traditional accreditation management is purely descriptive—it documents where you are today. Our What-If Simulation elevates the platform into a prescriptive Decision Support System. Program heads and Deans can simulate targeted compliance interventions to discover the exact minimum operational requirements needed to achieve Level II readiness, maximizing resource efficiency."*

---

### ACT 6: Recommendations, Institutional Audit & Final Certification
* **Account:** `qa@sti.edu` (or `dean.cict@sti.edu`) | **Password:** `password123`
* **Route:** `/recommendations` (Recommendations) & `/audit-log` (Audit Trail)
* **Estimated Time:** 60 seconds

#### Click Path & Actions:
1. Navigate to **Recommendations** (`/recommendations`):
   * Show how recommendations from previous PACUCOA surveys are systematically tracked area-by-area.
   * Show how corrective compliance tasks link directly to uploaded evidence exhibits.
2. Demonstrate **Cycle Certification**:
   * Point out the institutional seal, readiness status, and official certification freeze.
3. Open **Audit Trail** (`/audit-log`):
   * Display the immutable chronological event log showing every upload, approval, exclusion toggle, and score computation with user attribution and ISO timestamps.

#### Defense Speech / Talking Point:
> *"Finally, accountability requires total transparency. The system tracks every upload, review decision, and criteria modification in a tamper-evident Audit Trail. When external accreditors visit STI WNU, the institution can substantiate every rating with complete provenance: who uploaded the exhibit, who approved it, and the exact mathematical logic behind the score."*

---

## 4. Prepared Answers for Panel Defense Questions

### Question 1: *"How does the system prevent a Program Head or Chair from arbitrarily altering their readiness scores?"*
> **Answer:**  
> *"The system implements strict separation of duties and an automated scoring engine. Users do not enter raw numerical scores. Scores are computed exclusively by the server-side mathematical engine based on verified exhibit ratios and floor-constraint rules. Furthermore, approval requires explicit document preview, and every single change is permanently recorded in the immutable audit log."*

### Question 2: *"What happens if there is an unexpected internet outage during the live demonstration or an accreditation survey?"*
> **Answer:**  
> *"The platform is engineered with architectural resilience: both the authentication layer and data layer incorporate graceful local fallbacks (`auth-mock.ts` and `mock-data.ts`). If the cloud database is ever unreachable, the application automatically transitions into local evaluation mode, ensuring uninterrupted operation without throwing unhandled runtime exceptions."*

### Question 3: *"Can another academic college, such as Nursing, Hospitality, or Criminal Justice, use this system?"*
> **Answer:**  
> *"Yes. We proved this multi-department adaptability by integrating the College of Arts and Sciences with BS Psychology. The core PACUCOA criteria library uses generalized standards, and our non-destructive Program Scoping allows each program to toggle applicable or non-applicable criteria independently without modifying source code."*

---

## 5. Defense Day Readiness Checklist

- [x] **Local Server Running:** Next.js development server active on `http://localhost:3000`.
- [x] **Browser Setup:** Window A (Main) open to `head.bscs@sti.edu`; Window B (Incognito) open to `faculty.chair@sti.edu`.
- [x] **Universal Password Memorized:** `password123` for all roles.
- [x] **Test Files Prepared:** Sample PDF documents ready on desktop for live upload.
- [x] **Git Repository Synced:** Clean working tree pushed to `origin/main`.
- [x] **Slide Presentation Untouched:** User PowerPoint presentations remain strictly intact and preserved.


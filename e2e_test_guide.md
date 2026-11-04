# 🧪 End-to-End Walkthrough Test Guide
**Accreditation Management & Readiness Assessment System**
*PACUCOA / STI West Negros University — CICT*

---

## ⚠️ Pre-Test Checklist

Before starting, run these SQL scripts in your **Supabase SQL Editor** in order:

| # | File | Purpose |
|---|------|---------|
| 1 | `ADD_USER_IS_ACTIVE.sql` | Adds deactivate/reactivate column |
| 2 | `FIX_LOGIN_CREDENTIALS.sql` | Confirms all auth emails so login works |

> **If any login fails** with "Invalid login credentials", go to Supabase Dashboard → Authentication → Users → find the email → manually set `email_confirmed_at` by running `FIX_LOGIN_CREDENTIALS.sql` again.

---

## 🔑 All Test Credentials

| Role | Email | Password | Name in System |
|------|-------|----------|----------------|
| **System Admin** | `admin@sti.edu` | `admin123456` | IT Administrator |
| **QA Admin** | `admin.qa@sti.edu` | `admin123456` | Dr. Maria Santos |
| **Dean (CICT)** | `dean.cict@sti.edu` | `admin123456` | Dr. Roberto Gomez |
| **Program Head (BSIT)** | `john.chair@sti.edu` | `admin123456` | Engr. John Chair |
| **Faculty / Area Chair** | `sarah.faculty@sti.edu` | `admin123456` | Prof. Sarah Jenkins |
| **Faculty / Co-Chair** | `alex.faculty@sti.edu` | `admin123456` | Prof. Alex Rivera |
| **Alumni Rep** | `alumni@sti.edu` | `admin123456` | Mark Dizon |
| **Student Rep** | `student@sti.edu` | `admin123456` | Andrea Torres |

---

## 📋 Sidebar Navigation Per Role (Reference)

This tells you exactly which menu items each role can see:

| Page | Sidebar Label | System Admin | QA | Dean | Program Head | Faculty | Alumni Rep | Student Rep |
|------|---------------|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| `/admin/programs` | Academic Registry | ✅ | ✅ | — | — | — | — | — |
| `/admin/framework` | Framework Config | ✅ | ✅ | — | — | — | — | — |
| `/admin/users` | User Accounts | ✅ | — | — | — | — | — | — |
| `/dashboard` | Dashboard | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/admin/scope` | Accreditation Scope | — | ✅ | — | — | — | — | — |
| `/criteria` | Criteria | — | ✅ | — | — | — | — | — |
| `/areas` | Areas & Chairs | — | ✅ | — | ✅ | — | — | — |
| `/evidence` | Evidence Library | — | ✅ | ✅ | ✅ | ✅ | — | — |
| `/verification` | Review & Approve | — | ✅ | — | ✅ | ✅ | — | — |
| `/simulation` | What-If Simulation | — | ✅ | ✅ | ✅ | — | ✅ | ✅ |
| `/recommendations` | Recommendations | — | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/audit-log` | Audit Trail | ✅ | ✅ | ✅ | — | — | — | — |

---

## PART 1 — System Admin: Login, Programs, Users

**Login as:** `admin@sti.edu` / `admin123456`

---

### 1.1 — Login
- Go to `http://localhost:3000/login`
- **Type into Email field:** `admin@sti.edu`
- **Type into Password field:** `admin123456`
- Click **Sign In**
- ✅ **Expected:** Redirected to `/dashboard`. Top bar shows "IT Administrator" and role badge "System Admin"

---

### 1.2 — Verify Sidebar (System Admin sees these links)
- ✅ **Expected:** Left sidebar shows exactly:
  - Academic Registry
  - Framework Config
  - User Accounts
  - Dashboard
  - Audit Trail

---

### 1.3 — Verify Programs (Academic Registry)
- Click **Academic Registry** in sidebar (goes to `/admin/programs`)
- ✅ **Expected:** You see this exact program list:

| Code | Full Name | Department | Status |
|------|-----------|------------|--------|
| BSIT | Bachelor of Science in Information Technology | CICT | Active |
| BSCS | Bachelor of Science in Computer Science | CICT | Active |
| BSIS | Bachelor of Science in Information Systems | CICT | Active |
| BSA | Bachelor of Science in Accountancy | CBA | Active |
| BSCE | Bachelor of Science in Civil Engineering | CAS | Inactive |

---

### 1.4 — Verify User Accounts
- Click **User Accounts** in sidebar (goes to `/admin/users`)
- ✅ **Expected:** All 8 users from the credentials table above are listed
- ✅ **Expected:** Each row has 3 action buttons: ✏️ Edit, 🚫 Deactivate, 🗑️ Delete
- ✅ **Expected:** Status column shows green **Active** badges
- ✅ **Expected:** Your own row (**IT Administrator**) has **greyed-out / disabled** Deactivate & Delete buttons (self-lockout protection)

---

### 1.5 — Test Deactivate / Reactivate
- Find **Prof. Alex Rivera** (`alex.faculty@sti.edu`) in the list
- Click the 🚫 **Deactivate** button on his row
- ✅ **Expected:** Status badge changes from green `Active` → amber/red `Inactive`
- ✅ **Expected:** The Deactivate button changes to a ✅ **Reactivate** button
- Click ✅ **Reactivate** to restore his account
- ✅ **Expected:** Badge goes back to green `Active`

---

### 1.6 — Test Delete Confirmation Modal
- Click 🗑️ **Delete** on any user (NOT yourself)
- ✅ **Expected:** A confirmation modal appears with a red warning: *"This action is irreversible"*
- Click **"Cancel — Keep User"** — do NOT actually delete
- ✅ **Expected:** Modal closes, user is still in the list

---

### 1.7 — Verify Audit Trail
- Click **Audit Trail** in sidebar (goes to `/audit-log`)
- ✅ **Expected:** A chronological event log is displayed with entries including:
  - `evidence_verified` — QA Admin approved a document
  - `evidence_uploaded` — Faculty uploaded documents
  - `evidence_rejected` — QA Admin rejected a Cisco CCNA certificate
  - `accreditation_scope_updated` — BSCE deactivated
  - `user_created` — Admin created Prof. Alex Rivera
- ✅ **Expected:** Each entry shows: **Timestamp**, **Actor name/email**, **Action type**, and **Target record**

---

## PART 2 — QA Admin: Framework, Scope, Criteria & Boundary Tests

**Log out → Login as:** `admin.qa@sti.edu` / `admin123456`

---

### 2.1 — Login & Verify QA Sidebar
- ✅ **Expected:** Dashboard loads showing BSIT readiness data
- ✅ **Expected:** Sidebar shows these links:
  - Academic Registry
  - Framework Config
  - Dashboard
  - Accreditation Scope
  - Criteria
  - Areas & Chairs
  - Evidence Library
  - Review & Approve
  - What-If Simulation (marked "Flagship")
  - Recommendations
  - Audit Trail

---

### 2.2 — Framework Configuration
- Click **Framework Config** in sidebar (goes to `/admin/framework`)
- ✅ **Expected:** Page loads with tabs: Frameworks, Levels, Areas, Criteria, Rating Scales

**Click the "Areas" tab:**
- ✅ **Expected:** All 10 PACUCOA areas are listed:

| Area | Title | Weight |
|------|-------|--------|
| Area I | Philosophy and Objectives | 3 |
| Area II | Faculty | 3 |
| Area III | Instruction | 4 |
| Area IV | Laboratory | 3 |
| Area V | Research | 3 |
| Area VI | Library | 3 |
| Area VII | Student Services | 3 |
| Area VIII | Social Orientation and Community Involvement | 3 |
| Area IX | Physical Plant and Facilities | 2 |
| Area X | Organization and Administration | 3 |
| **TOTAL** | | **30** |

**Click the "Levels" tab:**
- ✅ **Expected:** 5 accreditation levels shown:

| Level # | Label | Min Score |
|---------|-------|-----------|
| 1 | Candidate Status | 1.0 |
| 2 | Level I - Accredited Status | 3.0 |
| 3 | Level II - Re-accredited Status | 3.5 |
| 4 | Level III - Re-accredited Status | 4.0 |
| 5 | Level IV - Highest Recognition | 4.5 |

---

### 2.3 — Accreditation Scope
- Click **Accreditation Scope** in sidebar (goes to `/admin/scope`)
- ✅ **Expected:** Lists all programs grouped by department with toggle switches
- ✅ **Expected:** BSIT, BSCS, BSIS, BSA show **Active** (toggle ON)
- ✅ **Expected:** BSCE shows **Inactive** (toggle OFF)
- ✅ **Expected:** Each active program shows its current accreditation level target

---

### 2.4 — Criteria Management (PACUCOA-Aligned)
- Click **Criteria** in sidebar (goes to `/criteria`)
- ✅ **Expected:** Criteria are grouped by PACUCOA Area, each Area showing its real weight (per the Manual of Accreditation, Rev. 2023). There is no "Input/Process/Outcome" category — grouping is by Area only, matching the Manual's own structure.

**Area I — Philosophy and Objectives** (Weight: 3)
  - **I.1** — Statement of Institutional VMGO (requires 1 doc; type: Institutional VMGO Document)
  - **I.2** — Dissemination of Philosophy/VMGO to School Community (requires 2 docs; type: Communication Memo / Orientation Material)

**Area II — Faculty** (Weight: 3)
  - **II.1** — Faculty Academic Qualifications and Teaching Experience (requires 5 docs; type: Transcript of Records / Diploma / Service Record)
  - **II.2** — Faculty Recruitment and Selection Policies (requires 1 doc; type: HR Policy Document)
  - **II.3** — Faculty Development Program (requires 3 docs; type: Training Needs Analysis / Development Plan)

**Area III — Instruction** (Weight: 4 — highest-weighted Area in the Manual)
  - **III.1** — Course Syllabi and OBE Alignment (requires 5 docs; type: Course Syllabus)
  - **III.2** — Assessment of Learning Outcomes (requires 3 docs; type: Sample Test Papers / Rubrics)
  - **III.3** — Planned Periodic Curriculum Reassessment (requires 2 docs; type: Curriculum Review Report)

**Area IV — Laboratory** (Weight: 3) — *not Library; Library is Area VI*
  - **IV.1** — Computer Laboratory Adequacy (requires 2 docs; type: Equipment Inventory / Lab Layout Plan)
  - **IV.2** — Laboratory Maintenance and Repair System (requires 2 docs; type: Maintenance Log)

**Area V — Research** (Weight: 3)
  - **V.1** — Institutional Research Manual and Agenda (requires 1 doc; type: Research Manual)
  - **V.2** — Faculty Research Outputs (requires 2 docs; type: Publication Record / Certificate)

**Area VI — Library** (Weight: 3) — *not Laboratories*
  - **VI.1** — Library Budget and Holdings (requires 2 docs; type: Budget Report / Holdings List)
  - **VI.2** — Library Staff Qualifications (requires 1 doc; type: Staff Records)

**Area VII — Student Services** (Weight: 3)
  - **VII.1** — Guidance and Counseling Program (requires 2 docs; type: Guidance Program Document)
  - **VII.2** — Placement and Follow-up Services (requires 2 docs; type: Alumni Tracking Report)

**Area VIII — Social Orientation and Community Involvement** (Weight: 3)
  - **VIII.1** — Community Extension Projects (requires 3 docs; type: Project Documentation / Report)
  - **VIII.2** — Knowledge of the Community (requires 1 doc; type: Community Profile)

**Area IX — Physical Plant and Facilities** (Weight: 2 — lowest-weighted Area)
  - **IX.1** — Building Safety and Compliance (requires 2 docs; type: Certificate of Occupancy / Fire Inspection Certificate)
  - **IX.2** — Classroom Adequacy (requires 2 docs; type: Facility Inspection Report)

**Area X — Organization and Administration** (Weight: 3)
  - **X.1** — Administrative Organizational Chart and Manual (requires 1 doc; type: Administrative Manual)
  - **X.2** — Records of Governing Body and Faculty Meetings (requires 2 docs; type: Meeting Minutes)

**Total weight across all 10 Areas: 30** (per the Manual, for Basic Education and Undergraduate programs)

- ✅ **Expected:** Each criterion row shows: Code, Title, Area, Required Count, Expected Document Type
- ✅ **Expected:** Each Area row shows its Weight — editable only by QA, stored in `accreditation_areas.weight`, not hardcoded in the scoring function
- ✅ **Expected:** QA can add, edit, or delete criteria and Areas using the action buttons
- ⚠️ **Note:** Required-document counts above are illustrative test values, not specified by the Manual — these are QA-configurable per criterion, not a PACUCOA-mandated number

---

### 2.5 — Boundary Test: QA Cannot Access User Accounts
- In the browser address bar, manually type: `http://localhost:3000/admin/users` and press Enter
- ✅ **Expected:** Page displays **"Access Restricted"** — QA Admin cannot manage user accounts
- ✅ **Expected:** "User Accounts" does NOT appear in QA's sidebar

---

## PART 3 — Program Head: Dashboard Scoping & Area Delegation

**Log out → Login as:** `john.chair@sti.edu` / `admin123456`
*(Engr. John Chair — BSIT Program Head)*

---

### 3.1 — Dashboard Scoped to BSIT
- ✅ **Expected:** Dashboard loads showing only **BSIT** data (scoped to Program Head's program)
- ✅ **Expected:** Sidebar shows:
  - Dashboard
  - Areas & Chairs
  - Evidence Library
  - Review & Approve
  - What-If Simulation (Flagship)
  - Recommendations

---

### 3.2 — View Area Assignments
- Click **Areas & Chairs** in sidebar (goes to `/areas`)
- ✅ **Expected:** Area assignment table loads with existing seed data:

| Area | Assigned Person | Role |
|------|----------------|------|
| Area III — Curriculum and Instruction | Engr. John Chair | Area Chair |
| Area III — Curriculum and Instruction | Prof. Sarah Jenkins | Member |
| Area II — Faculty | Prof. Sarah Jenkins | Member |
| Area X — Research | Prof. Alex Rivera | Area Chair |
| Area VIII — Social Orientation | Prof. Alex Rivera | Member |

---

### 3.3 — View Evidence Library (Program Head scope)
- Click **Evidence Library** in sidebar (goes to `/evidence`)
- ✅ **Expected:** Shows all BSIT evidence documents (both verified and pending):

| Evidence Document | Criterion | Uploaded By | Status |
|-------------------|-----------|-------------|--------|
| IT201 Data Structures OBE Syllabus | C3.1 — Course Syllabi | Prof. Sarah Jenkins | ✅ Verified |
| Faculty MSIT Diplomas and CHED Certificates | C2.1 — Faculty Diplomas | Engr. John Chair | ✅ Verified |
| IT Computer Labs Hardware Specifications | C5.1 — Lab Specs | Engr. John Chair | ✅ Verified |
| Campus Fire Safety Clearance 2026 | C6.1 — Building Safety | IT Administrator | ✅ Verified |
| CS302 Web Systems Syllabus | C3.1 — Course Syllabi | Prof. Sarah Jenkins | ⏳ Pending |
| IEEE Access Journal Publication 2026 | C10.1 — Research Pubs | Prof. Alex Rivera | ⏳ Pending |
| Barangay Granada Digital Literacy Extension MOA | C8.1 — Community Extension | Prof. Alex Rivera | ⏳ Pending |
| Industry Certification Cisco CCNA | C2.2 — Professional Certs | Prof. Sarah Jenkins | ❌ Rejected |

---

### 3.4 — View Recommendations
- Click **Recommendations** in sidebar (goes to `/recommendations`)
- ✅ **Expected:** Shows BSIT improvement recommendations:

| Area | Recommendation | Priority | Status |
|------|----------------|----------|--------|
| Area X — Research | Increase faculty peer-reviewed research publications | 🔴 High | Open |
| Area V — Laboratories | Upgrade Cisco Networking Lab switches | 🟡 Medium | In Progress |
| Area III — Curriculum | Align prerequisite codes in curriculum mapping | 🟢 Low | ✅ Resolved |
| Area II — Faculty | Ensure 70% faculty hold aligned Master degrees | 🔴 High | Open |

---

## PART 4 — Faculty: Evidence Submission

**Log out → Login as:** `sarah.faculty@sti.edu` / `admin123456`
*(Prof. Sarah Jenkins — Faculty, assigned to Area II & III)*

---

### 4.1 — Verify Faculty Sidebar
- ✅ **Expected:** Sidebar shows:
  - Dashboard
  - Evidence Library
  - Review & Approve
  - Recommendations

---

### 4.2 — View Evidence Page
- Click **Evidence Library** in sidebar (goes to `/evidence`)
- ✅ **Expected:** Page loads showing BSIT evidence documents
- ✅ **Expected:** You can see existing sample evidence from seed data:

| Evidence | Criterion | Status |
|----------|-----------|--------|
| IT201 Data Structures OBE Syllabus | C3.1 — Course Syllabi | ✅ Verified |
| CS302 Web Systems Syllabus | C3.1 — Course Syllabi | ⏳ Pending |
| Industry Certification Cisco CCNA | C2.2 — Professional Certs | ❌ Rejected |

---

### 4.3 — Upload New Evidence ⭐
- Click the **"Upload Evidence"** or **"Add Document"** button
- **Fill in the form with these EXACT values:**
  - **Criterion:** Select `C1.1 — Institutional Philosophy, Vision, Mission, and Program Objectives Alignment`
  - **Document Type:** `Vision/Mission Statement`
  - **File URL:** `https://placehold.co/600x800/png?text=STI+VMG+Statement+2026`
  - **Effective Date:** `2026-10-01` (or today's date)
- Click **Submit**
- ✅ **Expected:** New evidence appears in the list with status **⏳ Pending**
- ✅ **Expected:** The document does NOT immediately affect readiness scores — it must be verified first

---

## PART 5 — Verification & The Self-Verification Block ⭐⭐⭐

**This is the most important security feature for your thesis defense.**

---

### 5.1 — Self-Verification Block Test
- While still logged in as **Prof. Sarah Jenkins** (`sarah.faculty@sti.edu`)
- Click **Review & Approve** in sidebar (goes to `/verification`)
- ✅ **Expected:** A banner at the top shows: *"Your Scope: Area II (member), Area III (area_chair)"*
- Find the evidence you just uploaded in Step 4.3 (STI VMG Statement, criterion C1.1)
- Look at the **Actions** column for YOUR OWN upload:
- ✅ **Expected:** **No Approve or Reject buttons appear.** Instead, you see an amber badge: **`Cannot evaluate own upload`**
- ❌ **FAIL:** If Approve/Reject buttons appear for your own upload — this is a critical bug

> **Why this matters:** The system enforces separation of duties — faculty cannot self-certify their own evidence. This prevents manipulation and ensures independent verification.

---

### 5.2 — Verify Peer Evidence (Preview Requirement)
- While still on `/verification`, find a document uploaded by **another user**
  - Look for the **CS302 Web Systems Syllabus** (uploaded by Prof. Sarah Jenkins) — ⚠️ this is also yours, so it should also show "Cannot evaluate own upload"
  - Look for the **IEEE Access Journal Publication 2026** (uploaded by Prof. Alex Rivera) — you CAN evaluate this one
  - Look for the **Barangay Granada Digital Literacy Extension MOA** (uploaded by Prof. Alex Rivera) — you CAN evaluate this one
- On a document uploaded by **Prof. Alex Rivera:**
  - Click **"Preview Document"**
  - ✅ **Expected:** A modal/viewer opens showing the document image
  - Close the preview modal
  - ✅ **Expected:** The **Approve** button is now active/enabled (was locked before preview)
  - Click **Approve**
  - **Type Reviewer Remark:** `Document verified against PACUCOA standard.`
  - Click **Confirm**
  - ✅ **Expected:** Document status changes to green ✅ **Verified**

---

### 5.3 — Cross-Verification by Program Head
- **Log out → Login as:** `john.chair@sti.edu` / `admin123456`
- Go to `/verification`
- ✅ **Expected:** Program Head sees all pending BSIT evidence (broader scope than faculty)
- Find the **STI VMG Statement 2026** uploaded by Prof. Sarah Jenkins in Step 4.3
- Click **Preview Document** → close modal → Click **Approve**
- **Type Remark:** `Approved — VMG document aligns with PACUCOA Area I standard.`
- Click **Confirm**
- ✅ **Expected:** Sarah's upload is now ✅ **Verified**

---

## PART 6 — Readiness Scoring Dashboard

**Log out → Login as:** `admin.qa@sti.edu` / `admin123456`

---

### 6.1 — Dashboard Readiness Scores
- Go to `/dashboard`
- Select Program: **BSIT** (if not already selected)
- ✅ **Expected:** Dashboard displays BSIT readiness breakdown with scores per criterion:

| Criterion | Code | Category | Score | Status |
|-----------|------|----------|-------|--------|
| Philosophy/Mission Alignment | C1.1 | Input | 3.8 | Sufficient |
| Stakeholder Awareness VMGO | C1.2 | Process | 3.5 | Sufficient |
| Faculty Masteral Diplomas | C2.1 | Input | 4.2 | Sufficient |
| Professional Board Licenses | C2.2 | Input | 2.5 | ⚠️ Weak |
| Faculty CPD Records | C2.3 | Process | 3.5 | Sufficient |
| Course Syllabi & OBE | C3.1 | Process | 4.0 | Sufficient |
| Assessment Rubrics | C3.2 | Process | 3.5 | Sufficient |
| Industry Internship MOAs | C3.3 | Outcome | 3.2 | Sufficient |
| Library Holdings | C4.1 | Input | 3.4 | Sufficient |
| Library Usage Analytics | C4.2 | Process | 3.0 | Sufficient |
| IT Lab Hardware Specs | C5.1 | Input | 4.5 | Sufficient |
| Preventive Maintenance Logs | C5.2 | Process | 3.8 | Sufficient |
| Building Safety Compliance | C6.1 | Input | 4.0 | Sufficient |
| Guidance & Counseling | C7.1 | Process | 3.2 | Sufficient |
| Community Extension Projects | C8.1 | Outcome | 3.0 | Sufficient |
| Administrative Manual | C9.1 | Input | 3.8 | Sufficient |
| Research Publications | C10.1 | Outcome | 2.2 | ⚠️ Weak |
| Research Grants & Patents | C10.2 | Outcome | 2.0 | ⚠️ Weak |

- ✅ **Expected:** 3 criteria are flagged as **Weak** (C2.2, C10.1, C10.2 — all below 3.0)
- ✅ **Expected:** Overall weighted readiness is approximately **~65%** (~3.27 / 5.0)

---

### 6.2 — Understanding the "Case C" Floor Rule

This is what the scoring engine does behind the scenes (you can verify by inspecting the dashboard level status):

**The Dual-Constraint Rule:** To achieve Level II, a program must satisfy BOTH:
1. Overall grand mean ≥ 3.50
2. **Every individual Area** mean ≥ 3.50 (no area can fall below the floor)

**Case C scenario** (proven in automated tests):
- Grand Mean = **3.56** (passes the 3.50 threshold ✅)
- Area V (Laboratories) = **3.20** (FAILS the 3.50 floor ❌)
- Result: **Level I** — not Level II — because one area fell below the floor
- A standard spreadsheet average would falsely award Level II

---

## PART 7 — What-If Simulation Engine ⭐⭐

**Still logged in as:** `admin.qa@sti.edu`

---

### 7.1 — Run Simulation #1
- Click **What-If Simulation** in sidebar (goes to `/simulation`)
- ✅ **Expected:** Blue header banner: "What-If Simulation Engine"
- ✅ **Expected:** Left panel lists current weak/unresolved criteria
- **Select these 3 checkboxes:**
  - ☑ `C2.2 — Professional Board Licenses` (current score: 2.5 — Weak)
  - ☑ `C10.1 — Research Publications` (current score: 2.2 — Weak)
  - ☑ `C10.2 — Research Grants & Patents` (current score: 2.0 — Weak)
- Note the **Current Baseline Score** displayed (approximately **65.4%**)
- Click **"Simulate Score Impact"**
- ✅ **Expected:** Projected Score appears (approximately **72-75%**)
- ✅ **Expected:** A green **`+8.4%`** (or similar) delta badge appears showing improvement
- **Record your numbers:** Baseline = ___% | Projected = ___% | Delta = +___%

---

### 7.2 — Critical Proof: Real Data Is Untouched ⭐
- **Immediately** click **Dashboard** in sidebar (goes to `/dashboard`)
- Scroll to C2.2, C10.1, and C10.2:
- ✅ **Expected:** C2.2 still shows **2.5** (NOT the simulated 4.0)
- ✅ **Expected:** C10.1 still shows **2.2**
- ✅ **Expected:** C10.2 still shows **2.0**
- ✅ **Expected:** Overall readiness score is **unchanged** from before the simulation

> **Why this matters:** The simulation runs in an isolated in-memory projection layer. It reads live scores, applies hypotheticals, returns the projection, and saves only metadata to the simulations audit table — never touching real readiness_scores. Production data is fully protected.

---

### 7.3 — Run Simulation #2 (Different Criteria)
- Go back to `/simulation`
- Deselect all previous criteria, then select different ones:
  - ☑ `C8.1 — Community Extension Projects` (current: 3.0)
  - ☑ Any other weak or no-evidence criterion
- Click **"Simulate Score Impact"**
- ✅ **Expected:** Projected Score is a **DIFFERENT number** from Simulation #1
- **Record:** Sim #1 Projected = ___% | Sim #2 Projected = ___% (they must be different values)

---

## PART 8 — Dean: Read-Heavy Dashboard Role

**Log out → Login as:** `dean.cict@sti.edu` / `admin123456`
*(Dr. Roberto Gomez — Dean of CICT)*

---

### 8.1 — Verify Dean Sidebar
- ✅ **Expected:** Sidebar shows:
  - Dashboard
  - Evidence Library
  - What-If Simulation (Flagship)
  - Recommendations
  - Audit Trail
- ✅ **Expected:** Dean does NOT see: User Accounts, Criteria, Review & Approve, Framework Config

---

### 8.2 — Dean Dashboard
- ✅ **Expected:** Dashboard loads showing readiness data for CICT programs

---

### 8.3 — Dean Evidence Library (Read Access)
- Click **Evidence Library** (goes to `/evidence`)
- ✅ **Expected:** Can view all BSIT evidence documents
- ✅ **Expected:** Check for Upload/Approve buttons — Dean may or may not have upload ability (note what you see)

---

### 8.4 — Dean Simulation Access
- Click **What-If Simulation** (goes to `/simulation`)
- ✅ **Expected:** Can run simulations (same as QA admin flow)

---

### 8.5 — Dean Audit Trail Access
- Click **Audit Trail** (goes to `/audit-log`)
- ✅ **Expected:** Can view the full audit log (same as System Admin)

---

### 8.6 — Dean Boundary: Cannot Access User Accounts
- Manually type `http://localhost:3000/admin/users` in browser
- ✅ **Expected:** **"Access Restricted"** — Dean cannot manage user accounts

---

## PART 9 — Faculty (Second Account): Alex Rivera

**Log out → Login as:** `alex.faculty@sti.edu` / `admin123456`
*(Prof. Alex Rivera — Faculty, Area Chair for Area X, Member for Area VIII)*

---

### 9.1 — Verify Faculty Sidebar
- ✅ **Expected:** Same sidebar as Sarah Jenkins:
  - Dashboard
  - Evidence Library
  - Review & Approve
  - Recommendations

---

### 9.2 — Evidence Ownership Check
- Click **Evidence Library** (goes to `/evidence`)
- ✅ **Expected:** Can see Alex's own uploads:
  - IEEE Access Journal Publication 2026 (C10.1) — Pending or Verified (depending on whether Sarah approved it in Part 5)
  - Barangay Granada Digital Literacy Extension MOA (C8.1) — Pending or Verified

---

### 9.3 — Self-Verification Block (Alex's Perspective)
- Click **Review & Approve** (goes to `/verification`)
- Find Alex's OWN uploads:
- ✅ **Expected:** Alex sees **`Cannot evaluate own upload`** on his own documents — same self-verification block as Sarah

---

## PART 10 — Alumni Representative (Read-Only Stakeholder)

**Log out → Login as:** `alumni@sti.edu` / `admin123456`
*(Mark Dizon — Alumni Representative)*

---

### 10.1 — Verify Alumni Sidebar
- ✅ **Expected:** Very limited sidebar:
  - Dashboard
  - What-If Simulation (Flagship)
  - Recommendations

---

### 10.2 — Alumni Dashboard Access
- Go to `/dashboard`
- ✅ **Expected:** Can see high-level readiness summary

---

### 10.3 — Alumni Simulation Access
- Click **What-If Simulation** (goes to `/simulation`)
- ✅ **Expected:** Can run What-If simulations (stakeholder planning access)

---

### 10.4 — Alumni Recommendations Access
- Click **Recommendations** (goes to `/recommendations`)
- ✅ **Expected:** Can view recommendations list (read-only stakeholder transparency)

---

### 10.5 — Alumni Boundary Tests
- Manually type `http://localhost:3000/evidence` in browser
- ✅ **Expected:** Either **"Access Restricted"** or page loads without upload/edit/delete buttons
- Manually type `http://localhost:3000/verification` in browser
- ✅ **Expected:** **"Access Restricted"** — Alumni cannot verify evidence
- Manually type `http://localhost:3000/admin/users` in browser
- ✅ **Expected:** **"Access Restricted"**

---

## PART 11 — Student Representative (Read-Only Stakeholder)

**Log out → Login as:** `student@sti.edu` / `admin123456`
*(Andrea Torres — SSC President)*

---

### 11.1 — Verify Student Rep Sidebar
- ✅ **Expected:** Same limited sidebar as Alumni:
  - Dashboard
  - What-If Simulation (Flagship)
  - Recommendations

---

### 11.2 — Student Rep Boundary Tests
- Manually type `http://localhost:3000/evidence` in browser
- ✅ **Expected:** Either **"Access Restricted"** or no action buttons visible
- Manually type `http://localhost:3000/verification` in browser
- ✅ **Expected:** **"Access Restricted"**
- Manually type `http://localhost:3000/admin/users` in browser
- ✅ **Expected:** **"Access Restricted"**
- Manually type `http://localhost:3000/admin/framework` in browser
- ✅ **Expected:** **"Access Restricted"**

---

## PART 12 — Final Audit Trail Verification

**Log out → Login as:** `admin@sti.edu` / `admin123456`

---

### 12.1 — Verify All Actions Were Logged
- Go to `/audit-log`
- ✅ **Expected:** The audit trail now contains entries from everything you did during this walkthrough:

| Action Type | From Which Step | Actor |
|-------------|-----------------|-------|
| `user_deactivated` | Step 1.5 — Deactivated Alex | IT Administrator |
| `user_reactivated` | Step 1.5 — Reactivated Alex | IT Administrator |
| `evidence_uploaded` | Step 4.3 — Sarah uploaded VMG Statement | Prof. Sarah Jenkins |
| `evidence_verified` | Step 5.2 — Sarah approved Alex's doc | Prof. Sarah Jenkins |
| `evidence_verified` | Step 5.3 — John approved Sarah's doc | Engr. John Chair |
| `simulation_run` | Step 7.1 — First simulation | Dr. Maria Santos |
| `simulation_run` | Step 7.3 — Second simulation | Dr. Maria Santos |

- ✅ **Expected:** Each entry has: exact timestamp, actor name/email, action type, target entity

---

## 📊 Final Report Card

Use this table to mark your results as you go:

| Part | Step | Feature Tested | Expected Outcome | Pass/Fail |
|------|------|----------------|-------------------|-----------|
| 1 | 1.1 | Admin Login | Redirected to `/dashboard` | |
| 1 | 1.2 | Admin Sidebar | 5 nav items visible | |
| 1 | 1.3 | Programs List | 5 programs (4 Active, 1 Inactive) | |
| 1 | 1.4 | User List | 8 users + Status/Action columns | |
| 1 | 1.4 | Self-Lockout Protection | Admin's own Deactivate/Delete disabled | |
| 1 | 1.5 | Deactivate / Reactivate | Badge toggles Active ↔ Inactive | |
| 1 | 1.6 | Delete Confirmation | Modal with red warning, Cancel works | |
| 1 | 1.7 | Audit Trail | Event log visible with 6+ entries | |
| 2 | 2.1 | QA Sidebar | 11 nav items visible (incl Flagship) | |
| 2 | 2.2 | Framework Areas | All 10 PACUCOA areas listed | |
| 2 | 2.2 | Framework Levels | 5 levels with correct thresholds | |
| 2 | 2.3 | Accreditation Scope | Toggle switches per program | |
| 2 | 2.4 | Criteria Tree | Parent/child hierarchy visible | |
| 2 | 2.5 | QA Boundary | `/admin/users` blocked for QA | |
| 3 | 3.1 | PH Dashboard Scoping | Dashboard shows BSIT only | |
| 3 | 3.2 | Area Assignments | 5 assignments across 4 areas | |
| 3 | 3.3 | Evidence Library (PH) | 8 documents (4 verified, 3 pending, 1 rejected) | |
| 3 | 3.4 | Recommendations | 4 recommendations shown | |
| 4 | 4.1 | Faculty Sidebar | 4 nav items visible | |
| 4 | 4.3 | Upload Evidence | New upload appears as ⏳ Pending | |
| **5** | **5.1** | **Self-Verification Block** ⭐ | **"Cannot evaluate own upload" badge** | |
| 5 | 5.2 | Peer Verification (Preview) | Approve unlocked only after Preview | |
| 5 | 5.3 | Cross-Verification | Program Head approves faculty upload | |
| 6 | 6.1 | Dashboard Scores | 18 criteria with 3 flagged Weak | |
| **7** | **7.1** | **What-If Simulation** ⭐ | **Projected > Baseline by ~8%** | |
| **7** | **7.2** | **Data Isolation** ⭐ | **Dashboard unchanged after sim** | |
| 7 | 7.3 | Sim #2 Different | Different projection than Sim #1 | |
| 8 | 8.1 | Dean Sidebar | 5 nav items (no Users/Criteria/Verify) | |
| 8 | 8.2-8.5 | Dean Access | Dashboard, Evidence, Sim, Audit Trail OK | |
| 8 | 8.6 | Dean Boundary | `/admin/users` blocked for Dean | |
| 9 | 9.1 | Alex Sidebar | 4 nav items (same as Sarah) | |
| 9 | 9.3 | Alex Self-Block | "Cannot evaluate own" on his docs | |
| 10 | 10.1 | Alumni Sidebar | 3 nav items only | |
| 10 | 10.2-10.4 | Alumni Access | Dashboard + Sim + Recs OK | |
| 10 | 10.5 | Alumni Boundary | Evidence/Verify/Users all blocked | |
| 11 | 11.1 | Student Sidebar | 3 nav items only | |
| 11 | 11.2 | Student Boundary | Evidence/Verify/Users/Framework all blocked | |
| 12 | 12.1 | Full Audit Trail | All walkthrough actions appear in log | |

---

## 🎓 Thesis Defense Key Talking Points

**On Self-Verification Block (Part 5):**
> *"The system enforces independent verification through a built-in ownership check — if the uploaded_by ID matches the current user ID, the Approve/Reject controls are replaced with 'Cannot evaluate own upload,' preventing self-certification of evidence and ensuring every approved document has been reviewed by a second authorized party."*

**On Simulation Isolation (Part 7):**
> *"The What-If Simulation Engine operates in an ephemeral projection layer. It reads live readiness scores, applies hypothetical improvements in-memory, and returns the projected result — but writes only to the simulations audit table, never touching readiness_scores. Real institutional data is fully protected."*

**On Dual-Constraint Level Determination (Part 6):**
> *"Unlike a simple spreadsheet average, the system enforces a dual-constraint check: the overall grand mean must exceed the level threshold AND no individual area may fall below the floor. This prevents high-scoring administrative areas from masking deficient physical facilities — a common failure in manual accreditation self-surveys."*

**On Role-Based Access Control (Parts 8-11):**
> *"The system implements a multi-tier RBAC model where each role has a precisely scoped set of capabilities. System Admin controls accounts and organizational structure; QA configures the framework and reviews all evidence; Program Heads delegate area assignments and monitor their program; Faculty submit and verify peer evidence but cannot self-certify; and Alumni/Student Representatives have read-only dashboard access for stakeholder transparency."*

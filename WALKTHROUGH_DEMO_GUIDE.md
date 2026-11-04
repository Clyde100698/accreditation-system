# 🎓 PHASE 3 — Complete Real-Life Demo Walkthrough (ALL 10 AREAS, ALL 22 CRITERIA)
**Accreditation Management & Readiness Assessment System**
*STI West Negros University — College of Information and Communications Technology (CICT)*
*PACUCOA 2023 Standards — 10 Areas (Σ weights = 30), 22 Criteria*

The database is on a **clean slate**: 0 cycles, 0 assignments, 0 evidence, and **only the System Admin account exists**. Every other account, cycle, assignment, upload and review is entered **by you** in the browser, exactly as an institution would do it.

Root admin: `admin@sti.edu` / `password123`. Use `password123` for every account you create (or any password you like — just stay consistent).

---

## Contents
0. Reference Tables (accounts, areas, criteria, documents)
1. System Admin: login, registry, users, scope, framework
2. QA: create accreditation cycles
3. Program Head: delegate committees for ALL 10 areas
4. Evidence upload: ALL 22 criteria (BSCS) + negative tests
5. Verification: self-block, preview gate, approve, reject, resubmit, supervisory review
6. Dashboard & dual-constraint heatmap (all 10 areas)
7. What-If simulations (single area, multi-area, all areas) + isolation
8. PACUCOA 4-column compliance report (multi-area) + QA certification
9. BSIT scenario (criterion-floor rule)
10. Role-based access checks (every role)
11. Audit log forensics
12. Final defense checklist

---

## 0. Reference Tables

### 0.1 Accounts to create (System Admin → **User Accounts → Add User**, see §1 step 3)
**Only `admin@sti.edu` exists.** Create the rest yourself with the exact values below (Role + Program/Department must be set, or scoped pages will be empty).

| Role | Name | Email | Program |
|---|---|---|---|
| System Admin | System Administrator | `admin@sti.edu` | — |
| QA Admin | Dr. Maria Santos | `qa@sti.edu` | — |
| Dean | Dr. Roberto Gomez | `dean.cict@sti.edu` | CICT |
| Program Head | Prof. Elena Ramos | `head.bscs@sti.edu` | BSCS |
| Program Head | Engr. John Chair | `head.bsit@sti.edu` | BSIT |
| Faculty | Prof. Sarah Jenkins | `faculty.chair@sti.edu` | BSCS |
| Faculty | Prof. Alex Rivera | `faculty.member@sti.edu` | BSCS |
| Faculty | Area I Chair … Area X Chair | `chair.area1@sti.edu` … `chair.area10@sti.edu` | BSCS |
| Faculty | Faculty Member 1–5 | `member1@sti.edu` … `member5@sti.edu` | BSCS |
| Faculty | BSIT Faculty 1–3 | `bsit.faculty1@sti.edu` … `bsit.faculty3@sti.edu` | BSIT |
| Alumni Rep | Mark Dizon | `alumni@sti.edu` | CICT |
| Student Rep | Andrea Torres | `student@sti.edu` | CICT |

### 0.2 Areas, criteria, required counts (R) and the exact PDF to upload
Files live in `demo_documents\`. **The Document Type must match the criterion's expected type or the document is NOT counted** (this is tested in 4.4).

| Area (weight) | Criterion | R (docs needed) | Expected Document Type | PDF file |
|---|---|---|---|---|
| **I** Philosophy & Objectives (3) | I.1 Statement of Institutional VMGO | 1 | Institutional VMGO Document | `Institutional_VMGO_Document.pdf` |
| | I.2 Dissemination of VMGO | 2 | Communication Memo / Orientation Material | `Communication_Memo___Orientation_Material.pdf` |
| **II** Faculty (3) | II.1 Faculty Qualifications | 5 | Transcript of Records / Diploma / Service Record | `Transcript_of_Records___Diploma___Service_Record.pdf` |
| | II.2 Recruitment Policies | 1 | HR Policy Document | `HR_Policy_Document.pdf` |
| | II.3 Faculty Development Program | 3 | Training Needs Analysis / Development Plan | `Training_Needs_Analysis___Development_Plan.pdf` |
| **III** Instruction (4) | III.1 Syllabi & OBE Alignment | 5 | Course Syllabus | `Course_Syllabus.pdf` |
| | III.2 Assessment of Learning | 3 | Sample Test Papers / Rubrics | `Sample_Test_Papers___Rubrics.pdf` |
| | III.3 Curriculum Reassessment | 2 | Curriculum Review Report | `Curriculum_Review_Report.pdf` |
| **IV** Laboratory (3) | IV.1 Computer Lab Adequacy | 2 | Equipment Inventory / Lab Layout Plan | `Equipment_Inventory___Lab_Layout_Plan.pdf` |
| | IV.2 Lab Maintenance System | 2 | Maintenance Log | `Maintenance_Log.pdf` |
| **V** Research (3) | V.1 Research Manual & Agenda | 1 | Research Manual | `Research_Manual.pdf` |
| | V.2 Faculty Research Outputs | 2 | Publication Record / Certificate | `Publication_Record___Certificate.pdf` |
| **VI** Library (3) | VI.1 Budget & Holdings | 2 | Budget Report / Holdings List | `Budget_Report___Holdings_List.pdf` |
| | VI.2 Library Staff Qualifications | 1 | Staff Records | `Staff_Records.pdf` |
| **VII** Student Services (3) | VII.1 Guidance & Counseling | 2 | Guidance Program Document | `Guidance_Program_Document.pdf` |
| | VII.2 Placement & Follow-up | 2 | Alumni Tracking Report | `Alumni_Tracking_Report.pdf` |
| **VIII** Social Orientation (3) | VIII.1 Community Extension | 3 | Project Documentation / Report | `Project_Documentation___Report.pdf` |
| | VIII.2 Knowledge of Community | 1 | Community Profile | `Community_Profile.pdf` |
| **IX** Physical Plant (2) | IX.1 Building Safety | 2 | Certificate of Occupancy / Fire Inspection Certificate | `Certificate_of_Occupancy___Fire_Inspection_Certificate.pdf` |
| | IX.2 Classroom Adequacy | 2 | Facility Inspection Report | `Facility_Inspection_Report.pdf` |
| **X** Organization & Admin (3) | X.1 Org Chart & Manual | 1 | Administrative Manual | `Administrative_Manual.pdf` |
| | X.2 Governing Body Minutes | 2 | Meeting Minutes | `Meeting_Minutes.pdf` |

**Total documents for 100 % coverage = 1+2+5+1+3+5+3+2+2+2+1+2+2+1+2+2+3+1+2+2+1+2 = 48 uploads.**
You may upload the same PDF repeatedly to satisfy R (e.g. upload `Course_Syllabus.pdf` five times for III.1) or use your own real files — any `.pdf/.docx/.png/.jpg` under 10 MB works.

### 0.3 Scoring rules the system applies (use to predict results)
- Valid document = **verified** AND type matches AND effective date within last 5 years.
- V = valid docs, R = required. V=0 → **0 (no evidence)**; 0<V<R → `max(1, 2V/R)` **(weak, <2)**; V≥R → `min(5, 3 + 2(V/R − 1))` **(sufficient, 3–5)**.
- Area mean = average of its criteria. Grand mean = Σ(areaMean × weight) / 30.
- **Level I** needs grand mean ≥ its threshold AND every Area ≥ threshold; **Level III+** also needs every criterion ≥ threshold.

Useful predictions (R docs → 3.00, 2R docs → 5.00, 1.5R → 4.00):

| Uploaded & verified vs R | Score |
|---|---|
| 0 | 0.00 |
| 1 of 5 | 1.00 (weak) |
| 2 of 5 | 1.00 (weak) |
| 3 of 5 | 1.20 |
| 4 of 5 | 1.60 |
| 5 of 5 | 3.00 |
| 1 of 1 | 3.00 |
| 1 of 2 | 1.00 |
| 2 of 2 | 3.00 |
| 3 of 2 (R=2) | 4.00 |
| 4 of 2 (R=2) | 5.00 |

---

## 1. System Admin
1. Open `http://localhost:3000/login` → `admin@sti.edu` / `password123` → **Sign In**.
   ✅ Redirects to `/dashboard`; top bar shows System Admin.
2. **Academic Registry** (`/admin/programs`): ✅ BSCS and BSIT listed. *Edge:* click **New Program** → Code `BSDS`, Name `Bachelor of Science in Data Science` → Save → ✅ appears. Then **Delete** it → ✅ removed (confirm dialog).
3. **User Accounts** (`/admin/users`): ✅ only the System Administrator is listed.
   - **Create every account in §0.1** with **Add User** (Name, Email, Password, Role, Department/Program). Suggested order: QA, Dean, 2 Program Heads, then Faculty, then Alumni and Student reps (26 accounts besides admin: 1 QA + 1 Dean + 2 Heads + 2 named faculty + 10 chairs + 5 members + 3 BSIT faculty + 2 reps). ✅ Each appears with the right role/program badge.
   - *Negative tests:* duplicate email → ✅ rejected; missing role → ✅ validation.
   - **Temporary account test:** add `test.faculty@sti.edu` (Faculty, BSCS) → ✅ created; **Deactivate** → ✅ badge Inactive (login blocked, §10); **Delete** → ✅ removed.
   - *Self-lockout:* admin row's Deactivate/Delete buttons are disabled.
4. **Accreditation Scope** (`/admin/scope`): ✅ BSCS & BSIT active. Toggle BSIT off → ✅ it disappears from other pages' selectors; toggle back on.
5. **Framework / Criteria** (`/admin/framework`, `/criteria`): ✅ 1 framework, 5 levels, 10 areas (weights Σ = 30), 22 criteria. *Edge:* edit Area IX weight 2 → 3 → ✅ saved; **revert to 2**. Add criterion `TEST.1` then delete it.
6. Sign out.

## 2. QA: Cycles
1. Sign in `qa@sti.edu`.
2. **Recommendations → Accreditation Cycles → New Cycle**:

| Field | BSCS cycle | BSIT cycle |
|---|---|---|
| Program | BSCS | BSIT |
| Cycle Name | `BSCS Level II Re-accreditation (2026-2027)` | `BSIT Level II Re-accreditation (2026-2027)` |
| Target Level | Level II | Level II |
| Target Visit Date | `2027-03-31` | `2027-04-15` |
| Status | In Progress | In Progress |

   ✅ Two cycle cards appear.
3. *Edge:* try **Certify Cycle** now → ✅ blocked, modal lists all criteria lacking evidence (all 22 for BSCS).
4. Sign out.

## 3. Program Head: delegate ALL 10 areas (BSCS)
Sign in `head.bscs@sti.edu`. Go to **Areas & Chairs** (`/areas`), Program = BSCS. For each area click **Assign Faculty**:

| Area | Area Chair | Co-Chair | Member |
|---|---|---|---|
| I | Area I Chair | Prof. Sarah Jenkins | Faculty Member 1 |
| II | Area II Chair | Prof. Alex Rivera | Faculty Member 2 |
| III | Area III Chair | Faculty Member 1 | Faculty Member 3 |
| IV | Area IV Chair | Faculty Member 2 | Faculty Member 4 |
| V | Area V Chair | Prof. Sarah Jenkins | Faculty Member 5 |
| VI | Area VI Chair | Faculty Member 3 | Prof. Alex Rivera |
| VII | Area VII Chair | Faculty Member 4 | Faculty Member 1 |
| VIII | Area VIII Chair | Faculty Member 5 | Faculty Member 2 |
| IX | Area IX Chair | Prof. Alex Rivera | Faculty Member 3 |
| X | Area X Chair | Prof. Sarah Jenkins | Faculty Member 4 |

✅ Each area card shows its chair/co-chair/member badges.
*Edges:*
- Try assigning a **second Area Chair** to Area I → ✅ replaced/rejected per system rule (note behavior).
- Try assigning the same person twice to one area → ✅ blocked.
- **Remove** a member, then re-add → ✅ works.

Then **BSIT**: sign in `head.bsit@sti.edu`, assign `BSIT Faculty 1` as Chair of Areas I–V and `BSIT Faculty 2` as Chair of Areas VI–X, `BSIT Faculty 3` as Member of all.

## 4. Evidence Upload — all 22 criteria
### 4.1 Who uploads what
Any assigned faculty may upload; to keep **self-verification blocking** testable, the *uploader must differ from the verifier*. Use this pattern: **Faculty Member 1–5 / Alex / Sarah upload; Area Chairs verify.**

Sign in as `member1@sti.edu`; **Evidence Library → Upload New**.

### 4.2 Upload form (repeat for every row of §0.2)
- **Criterion** → pick the code (e.g. `[I.1]`). Document Type auto-fills.
- **File** → Choose the matching PDF.
- **Effective Date** → `2025-06-15` (valid, within 5 years).
- **Upload Evidence** → ✅ toast "Evidence uploaded successfully…", row appears **Pending**.

Upload plan (distribute across accounts so you also test multi-user uploads):

| Uploader | Criteria to upload (count each) |
|---|---|
| `member1@sti.edu` | I.1 (1), I.2 (2), II.2 (1), II.3 (3) |
| `member2@sti.edu` | II.1 (5), III.1 (5) |
| `member3@sti.edu` | III.2 (3), III.3 (2), IV.1 (2), IV.2 (2) |
| `member4@sti.edu` | V.1 (1), V.2 (2), VI.1 (2), VI.2 (1) |
| `member5@sti.edu` | VII.1 (2), VII.2 (2), VIII.1 (3), VIII.2 (1) |
| `faculty.member@sti.edu` | IX.1 (2), IX.2 (2) |
| `faculty.chair@sti.edu` | X.1 (1), X.2 (2) |

= 48 documents, all **Pending**. ✅ Dashboard "Pending Evidence" = 48.

### 4.3 Negative upload tests (as any uploader)
| Test | Action | ✅ Expected |
|---|---|---|
| No file | Click Upload with no file | Blocked, validation message |
| Wrong format | Select `.txt` / `.exe` | Rejected: unsupported type |
| Too large | File > 10 MB (e.g. `TOR_TaburadaJMC.pdf` is 3.7 MB — OK; use a bigger one) | Rejected: size limit |
| No effective date | Leave blank | Validation or accepted without date per system |
| Expired date | `2015-01-01` | Uploads, but later **does not count** toward score (§4.4) |

### 4.4 Invalid-but-verified document (does not count)
Upload to **I.1** a file with **Document Type changed to `Course Syllabus`** (mismatch) *or* effective date `2015-01-01`. Later verify it (§5). ✅ It shows Verified yet the I.1 score stays **0.00** — proves the validity rule. (Delete or leave; account for it in §6 math: leave it out for clean numbers → **use a different criterion, V.1, and remove it afterwards**, or run this test on BSIT instead.)

### 4.5 Evidence Library features
- Filter by Area, Status, Criterion; search by filename. ✅ Results update.
- Open **Your Recent Uploads** → ✅ `(You)` marker.
- Delete own pending document → ✅ removed; re-upload.

## 5. Verification (all 10 areas)
### 5.1 Self-verification block
As `member1@sti.edu` → **Review & Approve** (`/verification`) → find own I.1 upload. ✅ Approve/Reject disabled: *"Cannot evaluate own upload"*. Repeat as `faculty.chair@sti.edu` on X.1 (own upload).

### 5.2 Scope block
As `chair.area1@sti.edu` ✅ you see **only Area I** pending documents (I.1, I.2). Area chairs cannot approve other areas' documents.

### 5.3 Preview gate (every chair, first document)
Click **Approve** without **Inspect** → ✅ blocked: *"You must preview the document before making an evaluation."* Click **Inspect** → close → status `Viewed` → Approve works.

### 5.4 Approve everything — per area
Each chair signs in and approves **all** their area's documents (add a note on at least one per area):

| Chair account | Approves |
|---|---|
| `chair.area1@sti.edu` | I.1, I.2 |
| `chair.area2@sti.edu` | II.1, II.2, II.3 |
| `chair.area3@sti.edu` | III.1, III.2, III.3 |
| `chair.area4@sti.edu` | IV.1, IV.2 |
| `chair.area5@sti.edu` | V.1, V.2 — **hold back:** approve V.1 only, and V.2 ×1 (see §6) |
| `chair.area6@sti.edu` | VI.1, VI.2 |
| `chair.area7@sti.edu` | VII.1, VII.2 |
| `chair.area8@sti.edu` | VIII.1, VIII.2 |
| `chair.area9@sti.edu` | IX.1, IX.2 |
| `chair.area10@sti.edu` | X.1, X.2 |

### 5.5 Reject → resubmit
As `chair.area6@sti.edu`: open one VI.1 document → **Reject** → reviewer notes `Holdings list is outdated; resubmit 2025 version.` → Confirm. ✅ Status **Rejected**, VI.1 drops to weak (1 of 2 = 1.00). As `member4@sti.edu` ✅ you see the rejection note; **re-upload** a new VI.1 document; chair approves → VI.1 back to 3.00.

### 5.6 Co-Chair & Program Head review
- `faculty.chair@sti.edu` is **Co-Chair of Area I** → ✅ may verify Area I documents uploaded by others.
- `head.bscs@sti.edu` → ✅ may verify any BSCS document (supervisory) except own uploads. Use it to approve one document in Area III.

### 5.7 Non-reviewer access
`student@sti.edu`, `alumni@sti.edu` → ✅ no Approve/Reject controls.

After §5, check `/verification` → ✅ pending queue is empty except V.2's second document.

## 6. Dashboard & heatmap (all 10 areas)
Program Head BSCS → `/dashboard`, Program = BSCS.

**Expected after §5** (everything approved except V.2 has 1 of 2):
| Area | Criteria scores | Area mean | Status |
|---|---|---|---|
| I | 3.00, 3.00 | 3.00 | ✅ |
| II | 3.00, 3.00, 3.00 | 3.00 | ✅ |
| III | 3.00, 3.00, 3.00 | 3.00 | ✅ |
| IV | 3.00, 3.00 | 3.00 | ✅ |
| **V** | V.1 3.00, **V.2 1.00** | **2.00** | ⚠️ red floor trap |
| VI | 3.00, 3.00 | 3.00 | ✅ |
| VII | 3.00, 3.00 | 3.00 | ✅ |
| VIII | 3.00, 3.00 | 3.00 | ✅ |
| IX | 3.00, 3.00 | 3.00 | ✅ |
| X | 3.00, 3.00 | 3.00 | ✅ |

Grand mean = (9 areas×… ) → Σ(w×mean)/30 = (3·3+3·3+4·3+3·3+3·2+3·3+3·3+3·3+2·3+3·3)/30 = **2.90**. Compare with the Target Required threshold shown in the card; use the displayed threshold to read the level badge.

To produce a **grand-mean-passes-but-area-fails** trap (the thesis point), upload and verify **extra** documents so most areas exceed the Level II threshold: e.g. upload **1.5× R** documents (R=1→2 docs gives 5.00; R=2→3 docs gives 4.00; R=5→8 docs gives 4.20) for Areas I–IV and VI–X, but keep Area V low. ✅ Grand mean > threshold yet level blocked by Area V.

Click each area in the heatmap → ✅ expands to criteria with scores. Heatmap color rules: 0 grey, <3 red, 3–3.49 amber, 3.5–3.99 yellow, ≥4 green.

## 7. What-If simulations
Program Head BSCS → `/simulation`, Program = BSCS. Note the **Baseline** score.
1. **Single area:** check only **V.2** → Run Simulation Projection. ✅ V.2 → 3.00, Area V → 3.00, projected grand mean rises; level changes if Area V was the blocker.
2. **Multi-area:** check **V.2 + VI.1** (or any other weak criteria). ✅ Both improve; delta larger.
3. **All weak areas:** select **every** unresolved criterion across Areas I–X. ✅ Projected grand mean reaches the maximum achievable; projected level shows the top reachable level.
4. **Nothing selected:** Run → ✅ projection = baseline.
5. **Isolation test:** return to `/dashboard` → ✅ live scores **unchanged** from §6 (simulations never write `readiness_scores`). Check `/audit-log` → ✅ one `simulation_run` entry per run.
6. Repeat run 1 as `qa@sti.edu` and `dean.cict@sti.edu` → ✅ allowed, same numbers.

## 8. Compliance report & QA certification (multi-area)
Sign in as QA or `head.bscs@sti.edu` → `/recommendations`.

### 8.1 Create opportunities across several areas
**+ New Opportunity / Recommendation**, Program BSCS, Cycle = BSCS cycle:

| Item # | Area | 1. Opportunity | 2. Recommendation |
|---|---|---|---|
| 1 | Area I | `Stakeholder consultation records for PEO review are incomplete.` | `Document annual PEO review with industry advisory council minutes.` |
| 2 | Area III | `Course syllabi lack explicit OBE-to-assessment mapping.` | `Adopt a standard syllabus template with CLO–assessment matrix.` |
| 3 | Area IV | `Preventive maintenance logs for computing hardware are irregular.` | `Institutionalize a quarterly maintenance protocol with technician sign-off.` |
| 4 | Area V | `Faculty research outputs are below the required count.` | `Set annual publication targets and a research incentive scheme.` |
| 5 | Area VI | `Library holdings list not updated for current curriculum.` | `Update holdings annually; align budget with syllabus references.` |
| 6 | Area VIII | `Community extension projects lack impact assessment.` | `Add post-project beneficiary surveys to every extension report.` |

✅ Each row appears in the 4-column matrix, status **In Progress**; filter by Area / Cycle works (use the Area filter for each).

### 8.2 Actions Taken & Team Verification
On each row click **+ Add Action**: Action Number `n.1`, e.g. for Item 3:
- **Actions Taken:** `Formulated SOP-LAB-04 and completed Q1 hardware audit.`
- **Team Verification:** `Approved maintenance manual and technician sign-off matrix.`
- **Link Verified Evidence:** choose a verified document (e.g. `Maintenance_Log.pdf`).
✅ Column 3 badge `3.1`, Column 4 shows verification text + paperclip chip. Add a second action `3.2` to Item 3 → ✅ both listed. Click a chip → ✅ inline preview modal opens.

### 8.3 Resolve / Reopen
Item 3 → **Resolve** → confirm → ✅ green Resolved; **Reopen** → ✅ back to In Progress. Resolve Items 1, 2, 3, 5, 6; leave Item 4 open.

### 8.4 QA certification
As `qa@sti.edu` → Accreditation Cycles → BSCS cycle → **Certify Cycle**:
- While Area V criteria are still weak → ✅ **blocked**; modal lists `V.2` (and any other non-sufficient criteria).
- Fix it: as `member4` upload the second V.2 document → `chair.area5` approves (verify V.2 = 3.00) → all 22 criteria Sufficient.
- **Certify Cycle** again → confirm → ✅ toast "Cycle … institutionally certified by QA", indigo badge with *Dr. Maria Santos* and date.
- Non-QA roles (`head.bscs`, `dean`) → ✅ no Certify button.

## 9. BSIT scenario (criterion-floor rule)
Goal: all area means ≥ 4.00 but one criterion < 4.00 → reports Level II, not Level III.
1. As `bsit.faculty1@sti.edu` and `bsit.faculty2@sti.edu` upload & have `head.bsit@sti.edu` verify **1.5×R** documents for every criterion (R=1→2, R=2→3, R=3→5, R=5→8) — except **V.2: upload exactly 2 (score 3.00)**.
2. As `head.bsit@sti.edu` → `/dashboard`, Program = BSIT. ✅ Area V mean = (4.5 + 3.0)/2 ≈ 3.75 — to keep Area V ≥ 4.00 give V.1 **3 docs (score 5.00)** → Area V = 4.00. Grand mean ≥ 4.00, yet **V.2 = 3.00** blocks Level III → ✅ reported **Level II**.
3. `/simulation` → BSIT → check **V.2** → Run. ✅ V.2 → 4.00+, projected level **Level III**.

## 10. Role-based access checks
| Account | Must see | Must NOT see |
|---|---|---|
| `admin@sti.edu` | Registry, Users, Scope, Framework, Audit | Verification actions on own docs |
| `qa@sti.edu` | Dashboard (all programs), Recommendations, Certify, Audit | User management |
| `dean.cict@sti.edu` | Dashboard comparison, Simulation, read access | Certify button, uploads |
| `head.bscs@sti.edu` | BSCS only, Areas & Chairs, Verify, Simulation | BSIT data, Certify |
| `chair.areaN@sti.edu` | Own-area verification queue, uploads | Other areas' approve buttons |
| `member1@sti.edu` | Upload, own stats, unmet criteria in own scope | Approve own uploads |
| `student@sti.edu` / `alumni@sti.edu` | Read-only views, upload per policy | Any approve/reject |
| Deactivated user | — | Login (blocked) |

Also test: wrong password → error toast; visiting `/admin/users` as faculty → redirected/denied.

## 11. Audit log forensics (`/audit-log`, QA or Admin)
✅ You should find, with actor + timestamp: `user_created`, `cycle_created`, `area_assigned` (×30 BSCS), `evidence_uploaded` (×48+), `evidence_verified`, `evidence_rejected` (VI.1), `simulation_run` (≥ 6), `recommendation_created` (×6), `compliance_action_created`, `recommendation_resolved`, `cycle_certified`. Filter by action and by user; ✅ counts match your steps.

## 12. Final defense checklist
| # | Checkpoint | Where | Expected |
|---|---|---|---|
| 1 | Separation of duties | §5.1 | "Cannot evaluate own upload" |
| 2 | Preview gate | §5.3 | Approve blocked until Inspect |
| 3 | Area-scoped review | §5.2 | Chair sees only own area |
| 4 | Reject → resubmit loop | §5.5 | Score drops then recovers |
| 5 | Validity rule | §4.4 | Invalid doc doesn't score |
| 6 | Dual-constraint (area floor) | §6 | Level blocked by Area V |
| 7 | Criterion floor | §9 | Level III blocked by V.2 |
| 8 | Simulation isolation | §7.5 | Live scores unchanged |
| 9 | 4-column compliance matrix | §8 | 6 rows, multi-area, linked evidence |
| 10 | QA certification gate | §8.4 | Blocked, then certified |
| 11 | Role-based access | §10 | Table matches |
| 12 | Audit trail | §11 | Every action recorded |

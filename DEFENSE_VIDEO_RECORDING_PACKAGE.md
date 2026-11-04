# 🚀 SYSTEM WORKFLOW, QA COMMAND, PACUCOA MANUAL RULES & VIDEO EDITING FLIGHT MANUAL
**Format:** Operational System Flow (with Dedicated QA Officer Screen), Official PACUCOA Level Conditions & Post-Production Video Edit Guide  
**Governing Reference:** *PACUCOA Manual of Accreditation (Revised September 2023)* — Undergraduate Framework (Step Two: Institutional Self-Survey)  
**Style:** Direct, practical, technical system walkthrough (Zero fluff, Zero academic citations in voiceover)  
**Total Spoken Words:** **573 Words**  
**Total Audio Duration:** **4:24 to 4:28** (at 128–130 words per minute) — **Guaranteed STRICTLY NOT LESS THAN 4 MINUTES (and under 5 minutes)!**  
**Text-To-Speech (TTS) Optimization:** **100% Clean Spoken English** — No LaTeX, No math symbols (`$`), No brackets (`[]`), No slashes (`/`) inside the TTS block. Ready to copy-paste directly into **ElevenLabs, OpenAI TTS, CapCut, Murf, or Canva**!

---

## ⚠️ 4 MANDATORY PRE-RECORDING CHECKS (VERIFIED & FIXED)

1. **Do NOT say the simulation makes BSCS "Level II ready":** Under the PACUCOA Manual, Level II requires **every Area mean at `3.50` or higher**. After simulating 10 criteria (`+2` in Area IV $\rightarrow$ `3.40`, `+3` in Area V $\rightarrow$ `3.62`, `+5` in Area VII $\rightarrow$ `3.30`), **all 10 Areas clear the `3.00` Level I Area floor** and the **overall `3.57` passes the `3.50` overall mark**, **but 5 Areas remain below `3.50`** (`Area I = 3.00`, `Area III = 3.00`, `Area IV = 3.40`, `Area VI = 3.45`, `Area VII = 3.30`). Both the live UI and the script below state this accurately.
2. **Live Simulation & Dashboard Badges Updated in Code:** The live `/simulation` screen now displays **`Candidate met · Level I area floor pending`** at baseline (`3.22`) and **`Level I floors cleared · Level II area floor pending`** after the `3.57` projection (and `/dashboard` displays **`Floor Pending`** rather than `Ready` whenever an Area floor is below threshold).
3. **Do NOT state a Level I validity period (no "4 years" / no "2030") unless holding the physical certificate:** Public PACUCOA summaries state Level I accreditation is granted for **3 years**, so do **not** claim 4 years or 2030. The script below states **only** that BSCS was officially awarded PACUCOA Level I accredited status in **September 2026**.
4. **Verify One Printed Line in Your Physical Manual Before Recording (Level III Floor):** In your transcribed Manual reference, **Section 5 (Minimum Rating Required table)** reads *"At least 4.00, with **no criterion below 4.00**"*, whereas **Section 10 (Level III Reaccreditation Visit text)** reads *"general average rating ≥ 4.0 and **mean rating ≥ 4.0 in every survey area**"*. Check your printed Manual page before recording: the TTS script below notes that the software enforces the Minimum Rating table's `4.00` criterion floor; if your printed table says *"no section/area below 4.00"*, swap that one phrase before generating audio.

---

## 📘 SECTION 0: OFFICIAL PACUCOA MANUAL REFERENCE GUIDE (FOR NARRATION & VIDEO OVERLAYS)
*Source: Philippine Association of Colleges and Universities Commission on Accreditation (PACUCOA), Inc. — Manual of Accreditation (Revised September 2023).*

### 0.1 Scope Boundary & Phases of Accreditation
- **Preliminary Requirements:** Step One (Application) $\rightarrow$ **Step Two (Institutional Self-Survey — *covered by this system*)** $\rightarrow$ Step Three (Organization of the Accrediting Team).
- **Six Accreditation Visit Phases (in order):** (1) Orientation Visit $\rightarrow$ (2) Preliminary Visit $\rightarrow$ (3) Level I Formal Accreditation Visit $\rightarrow$ (4) Level II Reaccreditation Visit $\rightarrow$ (5) Level III Reaccreditation Visit $\rightarrow$ (6) Level IV Accreditation Visit.

### 0.2 Official PACUCOA Level Conditions (Minimum Ratings & Dual-Constraint Floor Rules)

| Accreditation Status / Level | Condition 1: Overall Weighted Grand Mean | Condition 2: Floor Rule (Dual Constraint) | Additional PACUCOA Manual Conditions & Timelines |
| :--- | :--- | :--- | :--- |
| **Candidate Status** | **At least `3.00`** | **None** *(General average only; no Area floor)* | Must reach formal accredited status within **2 years** (max **3 years** inclusive of a one-time 6–12 month grace period, otherwise Candidate status is automatically lost). |
| **Level I Formal Accredited** | **At least `3.00`** | **No Area (section) mean below `3.00`** | Every one of the 10 Areas must be $\ge 3.00$. *(BSCS officially awarded PACUCOA Level I status in September 2026).* |
| **Level II Reaccredited** | **At least `3.50`** | **No Area (section) mean below `3.50`** | Letter of intent due **at least 6 months** before status expires + Compliance Report + fresh Self-Survey. Granted for **5 years** (or deferred 6–12 months). |
| **Level III Reaccredited** | **At least `4.00`** | **No individual criterion below `4.00`** *(per Manual §5 Minimum Rating Table; Manual §10 Visit text states Area mean $\ge 4.00$ — verify printed page!)* | May apply within 2 years of Level II. Requires **5 mandatory undergraduate criteria** (instruction standard, community outreach, research tradition, faculty/staff development, 4-yr creditable licensure performance) + **2 optional criteria** (`1–5` percentage-banded scale). |
| **Level IV Accredited** | **At least `4.00`** | **No individual criterion below `4.00`** *(per Manual §5 Minimum Rating Table)* | Apply **6 months** before 5-yr Level III expires. Narrative + rating due **30 days** prior across **all 6 required Level IV criteria** (Teaching & Learning, Research Productivity, Community Service, Linkages & Consortia, Career Planning, Planning Process) with **mean $\ge 4.00$ in ALL six** (strict AND condition). |

> **Scope Note on Licensure Track:** The PACUCOA Manual also defines a separate PRC licensure board passing percentage track (`≥ 60%` of national passing average over 3 yrs for Candidate; `≥ 75%` over 3 yrs for Level I; `≥ 90%` over 4 yrs for Level II; `Beyond national passing average` over 4 yrs for Level III and 5 yrs for Level IV), which is outside documentary self-survey scoring scope.

### 0.3 PACUCOA Rating Scales & System Heatmap Color Mapping

#### A. Main Self-Survey Rating Scale (Single-Axis `0–5` — Configured on QA Screen `/admin/framework`)
*(PACUCOA uses a single-axis `0–5` scale; there is NO dual-axis Adequacy/Effectiveness scale in PACUCOA.)*

| Rating | PACUCOA Verbal Interpretation | Official Manual Description | System Documentary Proxy (`V` Valid Verified Docs vs. `R` Configurable Quota) | Dashboard Heatmap Color Band |
| :---: | :--- | :--- | :--- | :--- |
| **5** | **Excellent** | Provision is very extensive and functioning excellently | $V \ge R$: $\min(5.00,\; 3.00 + 2.00 \times (\frac{V}{R} - 1))$ *(reaches `5.00` at $V = 2R$)* | **Green (`≥ 4.00`)** — Clears `4.00` Threshold |
| **4** | **Very Good** | Provision is moderately extensive and functioning very well | $V = 1.5R \rightarrow 4.00$ *(Used as Simulation completion benchmark `4.00`)* | **Green (`≥ 4.00`)** / **Yellow (`3.50–3.99`)** — Clears Level II `3.50` Area Floor |
| **3** | **Good** | Provision is adequate and functioning well | $V = R \rightarrow 3.00$ *(Exact quota met)* | **Amber (`3.00–3.49`)** — Clears Level I Floor (`3.00`), **Below Level II Floor (`3.50`)** |
| **2** | **Fair** | Provision is limited but functioning well | $0 < V < R$: $\max(1.00,\; 2.00 \times \frac{V}{R})$ *(Partial compliance: `1.00–1.99`)* | **Red (`< 3.00`)** — **Fails Level I Area Floor (`3.00`)** |
| **1** | **Poor** | Provision is very limited and functioning poorly | Included in partial range `[1.00, 2.00)` when $0 < V < R$ | **Red (`< 3.00`)** — **Fails Level I Area Floor (`3.00`)** |
| **0** | **Missing** | Provision is missing but necessary | $V = 0 \rightarrow 0.00$ *(Zero valid verified documents)* | **Grey (`0.00`)** — Missing Evidence |
| **N.A.** | **Not Applicable** | Provision does not apply | Excluded if not applicable | — |

#### B. Two Specialized PACUCOA Scales (Configured on QA Screen `/admin/framework` $\rightarrow$ `Rating Scales`)
1. **Revisit Compliance Verification Scale (`1–5`)** *(for prior visit recommendations only)*: `5` = Full Compliance; `4` = Very Satisfactory Partial Compliance; `3` = Satisfactory Partial Compliance; `2` = Unsatisfactory Partial Compliance; `1` = Non-Compliance.
2. **Level III Additional Criteria Percentage Scale (`1–5`)**: `5` = Excellent (`95–100%`); `4` = Very Good/Outstanding (`90–94%`); `3` = Good (`85–89%`); `2` = Fair (`80–84%`); `1` = Poor (`below 80%`).

### 0.4 PACUCOA Undergraduate 10 Areas, 30-Weight Formula & Exact BSCS Floor Status
$$\text{Final Program Rating} = \frac{\sum (\text{Area Mean} \times \text{Area Weight})}{\text{Total Weight (30)}}$$

| Area Code | Official PACUCOA Undergraduate Area Title | Weight | BSCS Baseline Mean | Baseline Weighted | BSCS Simulated Mean (+10 Criteria @ `4.00`) | Simulated Weighted | Exact PACUCOA Floor Status After Simulation |
| :---: | :--- | :---: | :---: | :---: | :---: | :---: | :--- |
| **Area I** | Philosophy and Objectives | **3** | `3.00` | `9.00` | `3.00` | `9.00` | 🟡 Clears L1 (`≥3.00`) · **Pending L2 (`<3.50`)** |
| **Area II** | Faculty | **3** | `3.74` | `11.22` | `3.74` | `11.22` | 🟢 Clears L1 & L2 (`≥3.50`) |
| **Area III** | **Instruction** *(Highest Weight)* | **4** | `3.00` | `12.00` | `3.00` | `12.00` | 🟡 Clears L1 (`≥3.00`) · **Pending L2 (`<3.50`)** |
| **Area IV** | **Laboratory** *(Not Library!)* | **3** | **`2.67`** 🔴 | `8.01` | **`3.40`** (+2 criteria) | `10.19` | 🟡 Clears L1 (`≥3.00`) · **Pending L2 (`<3.50`)** |
| **Area V** | Research | **3** | **`2.82`** 🔴 | `8.46` | **`3.62`** (+3 criteria) | `10.86` | 🟢 Clears L1 & L2 (`≥3.50`) |
| **Area VI** | **Library** *(Not Laboratory!)* | **3** | `3.45` | `10.35` | `3.45` | `10.35` | 🟡 Clears L1 (`≥3.00`) · **Pending L2 (`<3.50`)** |
| **Area VII** | Student Services | **3** | **`1.30`** 🔴 | `3.90` | **`3.30`** (+5 criteria) | `9.90` | 🟡 Clears L1 (`≥3.00`) · **Pending L2 (`<3.50`)** |
| **Area VIII** | Social Orientation and Community Involvement | **3** | `4.38` | `13.14` | `4.38` | `13.14` | 🟢 Clears L1, L2 & `4.00` |
| **Area IX** | **Physical Plant and Facilities** *(Lowest Weight)* | **2** | `5.00` | `10.00` | `5.00` | `10.00` | 🟢 Clears All Floors (`5.00`) |
| **Area X** | Organization and Administration | **3** | `3.50` | `10.50` | `3.50` | `10.50` | 🟢 Clears L1 & L2 (`≥3.50`) |
| **TOTAL** | **10 Evaluative Areas (79 Configured BSCS Criteria)** | **30** | **`3.22`** | **`96.58`** | **`3.57`** *(+0.35)* | **`107.16`** | **`Level I floors cleared · Level II area floor pending` (5 Areas `< 3.50`)** |

---

## 🔑 SECTION 1: ALL USER ROLES & CREDENTIALS CHEAT-SHEET
> **Password for ALL accounts:** `password123`

| Role Name | User Name | Exact Email to Enter | Password | Exclusive Screens & Primary Scope |
| :--- | :--- | :--- | :--- | :--- |
| **QA Director / QA Officer** | Dr. Maria Santos | `admin.qa@sti.edu`<br>*(or `qa@sti.edu`)* | `password123` | **QA Command Dashboard** (`All Programs` comparison + Live Audit Feed), **Framework Config** (`/admin/framework`), **Accreditation Scope** (`/admin/scope`), **Criteria** (`/criteria`), **Certify Cycle Gate** (`/recommendations`), **Audit Trail** (`/audit-log`) |
| **System IT Administrator** | IT Administrator | `admin@sti.edu` | `password123` | User accounts provisioning (`/admin/users`), academic registry (`/admin/programs`), framework config |
| **College Dean** | Dr. Roberto Gomez | `dean.cict@sti.edu` | `password123` | Executive oversight across CICT programs (BSIT, BSCS, BSIS), side-by-side college comparison |
| **Program Head / Chair** | Engr. Clyde Taburada | `head.bscs@sti.edu` | `password123` | Program operations, 10 PACUCOA areas, committee delegation (`/areas`), What-If Simulation (`/simulation`) |
| **Faculty Member (Uploader)** | Prof. Sarah Jenkins | `sarah.faculty@sti.edu`<br>*(or `member1@sti.edu`)* | `password123` | Uploading syllabi and exhibits (`/evidence`), criterion mapping, viewing own upload status |
| **Area Chair (Evaluator)** | Prof. Alex Rivera | `alex.faculty@sti.edu` | `password123` | Area-scoped verification (`/verification`), mandatory Preview Gate inspection, exhibit approval/rejection |
| **Student & Alumni Reps** | Andrea Torres / Mark Dizon | `student@sti.edu` / `alumni@sti.edu` | `password123` | Read-only stakeholder defensibility transparency |

---

## 🎙️ SECTION 2: CLEAN AI VOICEOVER SCRIPT (573 WORDS — ~4:28 DURATION)
> **Instructions for AI Voiceover:** Copy the entire block below and paste it directly into ElevenLabs, OpenAI TTS, CapCut TTS, or Murf. Zero symbols, brackets, or slashes!

```text
This is the complete operational workflow of the Web-Based Accreditation Management and Readiness Assessment System for STI West Negros University, built around Step Two Institutional Self-Survey of the PACUCOA Manual of Accreditation, Revised September twenty twenty-three.

The system enforces role-based governance across five core roles: the Quality Assurance Officer and System Administrator, the College Dean, the Program Head, Faculty Uploaders, and Area Chair Evaluators alongside read-only student and alumni observers.

We begin inside the Quality Assurance Officer Command Screen. In Framework Configuration, the Quality Assurance Officer manages the official PACUCOA single-axis zero-to-five rating scale—where zero is missing, one is poor, two is fair, three is good, four is very good, and five is excellent—alongside active program scope, criteria quotas, and all five PACUCOA Accreditation Level Conditions.

Under the PACUCOA Manual, Candidate Status requires a general average of at least three point zero with no area floor. Level One Formal Accreditation requires at least three point zero overall with no area mean below three point zero. Level Two Reaccreditation requires at least three point five zero overall with no area mean below three point five zero. Levels Three and Four require at least four point zero overall, enforcing the stricter four point zero criterion floor from the minimum rating table alongside supplementary level criteria.

Switching to the Quality Assurance Command Dashboard, the officer monitors side-by-side readiness across all programs and inspects the live compliance audit feed.

Now, inside the Program Head view for Computer Science, the Executive Five-by-Two Command Dashboard displays all ten undergraduate areas simultaneously across thirty total PACUCOA weights: four for Area Three Instruction, two for Area Nine Physical Plant, and three for the remaining eight areas, including Area Four Laboratory and Area Six Library.

On the digitized exhibits loaded at baseline, the weighted sum is ninety-six point five eight divided by thirty, or three point two two. While Computer Science was officially awarded PACUCOA Level One status in September twenty twenty-six, this indicative digital baseline flags three areas where digital exhibits remain below the three point zero Level One floor: Laboratory at two point six seven, Research at two point eight two, and Student Services at one point three zero.

Next is Evidence Ingestion and Independent Verification. When faculty upload a text-layer PDF, server-side parsing suggests the matching document type and checks the five-year validity window. Database Row-Level Security blocks uploaders from verifying their own files, displaying Cannot evaluate own upload, while independent Area Chairs must inspect each exhibit through the mandatory Preview Gate before approval.

Next is the What-If Readiness Simulation Sandbox. Selecting ten priority criteria across the three deficit areas—two in Laboratory, three in Research, and five in Student Services—at four point zero Very Good raises the projected rating from three point two two to three point five seven. Look closely at the level condition badge: all ten areas now clear the three point zero Level One floor and the overall three point five seven passes the three point five zero overall mark, while the Level Two area floor remains pending because five areas still sit below three point five zero. Switching back to the live dashboard confirms zero mutation to production records.

Finally, the Four-Column Post-Visit Compliance Matrix tracks recommendations, sub-numbered actions, and linked exhibits for thirty-day revisit reports and six-month resurvey deadlines, while the Quality Assurance Certification Gate blocks final cycle sign-off until every criterion is compliant.

This is PACUCOA-aligned, tamper-evident cloud governance for continuous institutional readiness.
```

---

## 🛫 SECTION 3: PRE-FLIGHT DUAL-WINDOW RECORDING SETUP (QA WINDOW + PROGRAM HEAD WINDOW)

To record **BOTH the QA Officer Screen AND the Program Head / Reviewer Screens** smoothly with zero sign-out pauses:

1. **Window A — Normal Chrome (`QA Officer Command` — `admin.qa@sti.edu` / `password123`)**:
   - Sign in as **`admin.qa@sti.edu`** (`password123`) BEFORE pressing record, and preload **4 Tabs**:
     - **QA Tab 1:** `http://localhost:3000/admin/framework` *(open `Accreditation Levels` tab, ready to click `Areas` & `Rating Scales`)*
     - **QA Tab 2:** `http://localhost:3000/dashboard` *(QA Command view showing `All Programs` comparison & `Live Compliance Audit Feed`)*
     - **QA Tab 3:** `http://localhost:3000/recommendations` *(open `Accreditation Cycles` tab showing the QA-exclusive **`Certify Cycle`** button, ready to switch to `Recommendations Matrix`)*
     - **QA Tab 4:** `http://localhost:3000/audit-log` *(QA Immutable Audit Trail with `Export CSV`)*
2. **Window B — Chrome Incognito or Edge (`Program Head / Uploader` — `head.bscs@sti.edu`)**:
   - Preload **5 Tabs**:
     - **PH Tab 1:** `http://localhost:3000/login` *(clean production sign-in screen to open the video or sign in with `head.bscs@sti.edu` / `password123`)*
     - **PH Tab 2:** `http://localhost:3000/dashboard` *(BSCS `3.22 / 5.00` `Floor Pending` view)*
     - **PH Tab 3:** `http://localhost:3000/evidence` *(Evidence Library + text-layer `Course_Syllabus.pdf` ready)*
     - **PH Tab 4:** `http://localhost:3000/verification` *(Self-Verification Block `Cannot evaluate own upload` & Must-View Preview Gate)*
     - **PH Tab 5:** `http://localhost:3000/simulation` *(What-If Sandbox showing the new `Level I floors cleared · Level II area floor pending` badge!)*
3. **Display & Audio:** Press `F11` in both windows (`Alt + Tab` switches cleanly between QA Window A and Program Head Window B!), `1920x1080` at `60 FPS`.

---

## 🎬 SECTION 4: MASTER FLIGHT PLAN — SECOND-BY-SECOND RECORDER CHOREOGRAPHY (0:00 – 4:33)

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│ 0:00 ── 0:30 (30s) │ ACT 1: PORTAL LOGIN, PACUCOA SCOPE & 5-ROLE ARCHITECTURE                    │
│ 0:30 ── 1:35 (65s) │ ACT 2: QA COMMAND SCREEN — FRAMEWORK CONFIG, 5 LEVEL CONDITIONS & QA AUDIT  │
│ 1:35 ── 2:25 (50s) │ ACT 3: PROGRAM HEAD 5x2 DASHBOARD, 30 WEIGHTS & BSCS 3.22 FLOOR AUDIT       │
│ 2:25 ── 3:08 (43s) │ ACT 4: TEXT-LAYER PDF UPLOAD, RLS SELF-VERIFY BLOCK & PREVIEW GATE          │
│ 3:08 ── 4:02 (54s) │ ACT 5: SIMULATION (3.22 -> 3.57) & EXACT LEVEL I / LEVEL II FLOOR BADGE     │
│ 4:02 ── 4:33 (31s) │ ACT 6: 4-COLUMN MATRIX, QA CYCLE CERTIFICATION GATE & CONCLUSION            │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### ACT 1: PORTAL LOGIN, PACUCOA SCOPE & 5-ROLE ARCHITECTURE (0:00 – 0:30)

| Exact Time | Window & URL | Exact Mouse Movement & Navigation | What to Click & Show | Matching Voiceover Line |
| :--- | :--- | :--- | :--- | :--- |
| **0:00 – 0:30** | **Window B (Tab 1):** `/login` | Hover over the clean STI WNU Sign-In Portal card (`Email Address`, `Password`, `Sign In`), enter `head.bscs@sti.edu` / `password123`, and click **`Sign In`**. | Show the clean production authentication portal. *(Editor adds Overlay Card #1: PACUCOA Manual Rev. Sept 2023 — Step Two Self-Survey).* | *"This is the complete operational workflow of the Web-Based Accreditation Management and Readiness Assessment System for STI West Negros University, built around Step Two Institutional Self-Survey of the PACUCOA Manual of Accreditation, Revised September twenty twenty-three.<br><br>The system enforces role-based governance across five core roles: the Quality Assurance Officer and System Administrator, the College Dean, the Program Head, Faculty Uploaders, and Area Chair Evaluators alongside read-only student and alumni observers."* |

---

### ACT 2: QA OFFICER COMMAND SCREEN — FRAMEWORK CONFIG, ALL 5 LEVEL CONDITIONS & QA DASHBOARD (0:30 – 1:35)

| Exact Time | Window & URL | Exact Mouse Movement & Navigation | What to Click & Show | Matching Voiceover Line |
| :--- | :--- | :--- | :--- | :--- |
| **0:30 – 0:52** | `Alt + Tab` to **Window A (QA Tab 1):** `/admin/framework` | Point to top-right badge **`Dr. Maria Santos • QA Command`** and left sidebar (`Framework Config`, `Accreditation Scope`, `Criteria`, `Audit Trail`).<br>Click **`Rating Scales`** tab (`0–5 Single-Axis Rating Scale`), then click **`Accreditation Levels`** tab! | Show the live QA-managed PACUCOA `0–5` Single-Axis Scale and 5 Accreditation Levels table on screen! *(Editor adds Overlay Card #2).* | *"We begin inside the Quality Assurance Officer Command Screen. In Framework Configuration, the Quality Assurance Officer manages the official PACUCOA single-axis zero-to-five rating scale—where zero is missing, one is poor, two is fair, three is good, four is very good, and five is excellent—alongside active program scope, criteria quotas, and all five PACUCOA Accreditation Level Conditions."* |
| **0:52 – 1:22** | **Window A (QA Tab 1):** `/admin/framework` (`Accreditation Levels` tab) | Glide cursor slowly down the 5 PACUCOA Level rows on screen:<br>1. `Candidate Status (3.0)`<br>2. `Level I - Accredited Status (3.0)`<br>3. `Level II - Re-accredited Status (3.5)`<br>4. `Level III - Re-accredited Status (4.0, 2 Optional)`<br>5. `Level IV - Highest Recognition (4.0)` | Highlight each level row while **Overlay Card #3 (Complete PACUCOA Dual-Constraint Floor Rules)** sits beside the table! | *"Under the PACUCOA Manual, Candidate Status requires a general average of at least three point zero with no area floor. Level One Formal Accreditation requires at least three point zero overall with no area mean below three point zero. Level Two Reaccreditation requires at least three point five zero overall with no area mean below three point five zero. Levels Three and Four require at least four point zero overall, enforcing the stricter four point zero criterion floor from the minimum rating table alongside supplementary level criteria."* |
| **1:22 – 1:35** | Switch to **Window A (QA Tab 2):** `/dashboard` *(QA Command View)* | Point to `Scope: All Programs (Institution Scope)`, scroll slightly to show **Department Readiness Comparison** (BSCS, BSIT, BSIS) and **Live Compliance Audit Feed**. | Proves institution-wide QA oversight screen! | *"Switching to the Quality Assurance Command Dashboard, the officer monitors side-by-side readiness across all programs and inspects the live compliance audit feed."* |

---

### ACT 3: PROGRAM HEAD 5×2 DASHBOARD, 30 WEIGHTS & BSCS `3.22` FLOOR AUDIT (1:35 – 2:25)

| Exact Time | Window & URL | Exact Mouse Movement & Navigation | What to Click & Show | Matching Voiceover Line |
| :--- | :--- | :--- | :--- | :--- |
| **1:35 – 1:58** | `Alt + Tab` to **Window B (PH Tab 2):** `/dashboard` *(BSCS Program Head)* | Point to `Program Lead` badge and pan across all 10 cards in the **5×2 Area Grid** (Areas I–X), pausing on **Area III (Instruction)**, **Area IX (Physical Plant)**, **Area IV (Laboratory)**, and **Area VI (Library)**. | Show all 10 Areas simultaneously. *(Editor adds Overlay Card #4: PACUCOA 30-Weight Formula).* | *"Now, inside the Program Head view for Computer Science, the Executive Five-by-Two Command Dashboard displays all ten undergraduate areas simultaneously across thirty total PACUCOA weights: four for Area Three Instruction, two for Area Nine Physical Plant, and three for the remaining eight areas, including Area Four Laboratory and Area Six Library."* |
| **1:58 – 2:25** | **Window B (PH Tab 2):** `/dashboard` | Point to Grand Mean **`3.22 / 5.00`** with amber **`Floor Pending`** badge (and top-right `Area Floor Pending` pill!).<br>Hover over the 3 red deficit Area cards:<br>• **Area IV Laboratory (`2.67/5`)**<br>• **Area V Research (`2.82/5`)**<br>• **Area VII Student Services (`1.30/5`)** | Show red `Gap` badges on Areas IV, V, VII. *(Editor adds Overlay Card #5: Indicative `3.22` Baseline vs. Official Sept 2026 Level I Award — zero validity-year claim!).* | *"On the digitized exhibits loaded at baseline, the weighted sum is ninety-six point five eight divided by thirty, or three point two two. While Computer Science was officially awarded PACUCOA Level One status in September twenty twenty-six, this indicative digital baseline flags three areas where digital exhibits remain below the three point zero Level One floor: Laboratory at two point six seven, Research at two point eight two, and Student Services at one point three zero."* |

---

### ACT 4: TEXT-LAYER PDF INGESTION, RLS SELF-VERIFY BLOCK & PREVIEW GATE (2:25 – 3:08)

| Exact Time | Window & URL | Exact Mouse Movement & Navigation | What to Click & Show | Matching Voiceover Line |
| :--- | :--- | :--- | :--- | :--- |
| **2:25 – 2:44** | Switch to **Window B (PH Tab 3):** `/evidence` | Click **`+ Upload Evidence`**, choose Criterion `[III.1]`, drop text-layer `Course_Syllabus.pdf`, confirm effective date within 5 years (`2025-06-15`), click Submit. | Show text-layer type match & 5-year date check. | *"Next is Evidence Ingestion and Independent Verification. When faculty upload a text-layer PDF, server-side parsing suggests the matching document type and checks the five-year validity window."* |
| **2:44 – 3:08** | Switch to **Window B (PH Tab 4):** `/verification` | 1. Point to own uploaded document $\rightarrow$ disabled button & **`Cannot evaluate own upload`**.<br>2. On another uploader's pending item, click **`Inspect / Preview`** (Must-View Gate), close modal, then click **`Approve`**. | Show both **Self-Verification Block** and **Mandatory Preview Gate**. *(Editor adds Overlay Card #6).* | *"Database Row-Level Security blocks uploaders from verifying their own files, displaying Cannot evaluate own upload, while independent Area Chairs must inspect each exhibit through the mandatory Preview Gate before approval."* |

---

### ACT 5: WHAT-IF SIMULATION (`3.22` $\rightarrow$ `3.57`) & EXACT LEVEL I / LEVEL II FLOOR BADGE (3:08 – 4:02)

| Exact Time | Window & URL | Exact Mouse Movement & Navigation | What to Click & Show | Matching Voiceover Line |
| :--- | :--- | :--- | :--- | :--- |
| **3:08 – 3:32** | Switch to **Window B (PH Tab 5):** `/simulation` | Point to `Current Baseline Score: 3.22 / 5` and its badge **`Candidate met · Level I area floor pending`**.<br>Select **10 `0/5` criteria**:<br>• **2** in Area IV (Laboratory)<br>• **3** in Area V (Research)<br>• **5** in Area VII (Student Services)<br>Click **`Simulate Score Impact`**. | Projected Score updates to **`3.57 / 5 (+0.35)`** and the live badge displays:<br>**`Level I floors cleared · Level II area floor pending`**<br>*(`Overall 3.57 ≥ 3.50 met · 5 of 10 Areas below 3.50 floor`)*! | *"Next is the What-If Readiness Simulation Sandbox. Selecting ten priority criteria across the three deficit areas—two in Laboratory, three in Research, and five in Student Services—at four point zero Very Good raises the projected rating from three point two two to three point five seven."* |
| **3:32 – 4:02** | Stay on `/simulation` (`3:32–3:50`) $\rightarrow$ Switch to **PH Tab 2:** `/dashboard` (`3:50–4:02`) | Hover directly over the live amber badge **`Level I floors cleared · Level II area floor pending`** so panelists read every word (`5 of 10 Areas below 3.50 floor`).<br>At `3:50`, click `/dashboard` to prove live score is still **`3.22`**! | Zero false "Level II ready" claim — 100% faithful to the PACUCOA Manual! *(Editor adds Overlay Card #7).* | *"Look closely at the level condition badge: all ten areas now clear the three point zero Level One floor and the overall three point five seven passes the three point five zero overall mark, while the Level Two area floor remains pending because five areas still sit below three point five zero. Switching back to the live dashboard confirms zero mutation to production records."* |

---

### ACT 6: 4-COLUMN COMPLIANCE MATRIX, QA CERTIFICATION GATE & CONCLUSION (4:02 – 4:33)

| Exact Time | Window & URL | Exact Mouse Movement & Navigation | What to Click & Show | Matching Voiceover Line |
| :--- | :--- | :--- | :--- | :--- |
| **4:02 – 4:24** | `Alt + Tab` back to **Window A (QA Tab 3):** `/recommendations` | 1. Show **`Recommendations Matrix`** tab (4 columns + click paperclip PDF preview).<br>2. Click **`Accreditation Cycles`** tab right beside it and click QA's **`Certify Cycle`** button $\rightarrow$ modal blocks certification & lists outstanding deficient criteria! *(Optional 3s glance at QA Tab 4 `/audit-log`).* | Shows **both** the 4-Column Matrix AND the exclusive **QA Institutional Cycle Certification Gate**! *(Editor adds Overlay Card #8).* | *"Finally, the Four-Column Post-Visit Compliance Matrix tracks recommendations, sub-numbered actions, and linked exhibits for thirty-day revisit reports and six-month resurvey deadlines, while the Quality Assurance Certification Gate blocks final cycle sign-off until every criterion is compliant."* |
| **4:24 – 4:33** | **Window A (QA Tab 2):** `/dashboard` | Rest cursor cleanly on the QA Command Center overview. Fade to black at **4:33**. | Stop recording (`Win + Alt + R`). | *"This is PACUCOA-aligned, tamper-evident cloud governance for continuous institutional readiness."* |

---

## ✂️ SECTION 5: COMPLETE VIDEO EDITING & ON-SCREEN PACUCOA OVERLAY GUIDE (CAPCUT / PREMIERE / CANVA)

Add these **8 dark-navy (`#102A4D`) & gold (`#D4A017`) callout cards** in CapCut or Premiere Pro so every PACUCOA Manual condition is visually verifiable on screen:

| Card # | Timestamp | Screen Placement & Camera Action | Exact Text to Paste Into Video Overlay Card |
| :---: | :--- | :--- | :--- |
| **Card 1** | **`0:04 – 0:28`** | **Bottom-Left Lower Third** over `/login` | **GOVERNING STANDARD**<br>PACUCOA Manual of Accreditation (Revised Sept. 2023)<br>Scope: Step Two — Institutional Self-Survey (Undergraduate Pilot: BSCS) |
| **Card 2** | **`0:31 – 0:51`** | **Top-Right Card** over QA `/admin/framework` | **QA COMMAND: PACUCOA RATING SCALES**<br>Main Self-Survey Scale (`0–5` Single-Axis):<br>`5` Excellent • `4` Very Good • `3` Good • `2` Fair • `1` Poor • `0` Missing • `N.A.`<br>*Plus `1–5` Revisit Compliance Scale & `1–5` Level III Percentage Scale* |
| **Card 3** | **`0:52 – 1:21`** | **Center-Right Glass Panel** beside QA Levels Table | **OFFICIAL PACUCOA LEVEL CONDITIONS (MANUAL REV. 2023)**<br>• **Candidate:** Overall `≥ 3.00` *(No Area Floor)*<br>• **Level I:** Overall `≥ 3.00` + **No Area Mean `< 3.00`**<br>• **Level II:** Overall `≥ 3.50` + **No Area Mean `< 3.50`**<br>• **Level III:** Overall `≥ 4.00` + **No Criterion `< 4.00`** *(§5 Table; verify vs. §10 Area `≥ 4.0`)*<br>• **Level IV:** Overall `≥ 4.00` + **No Criterion `< 4.00`** *(+All 6 Level IV Crit. `≥ 4.00`)* |
| **Card 4** | **`1:36 – 1:57`** | **Top-Right Card** over 5×2 Area Grid | **PACUCOA UNDERGRADUATE WEIGHTS (TOTAL = 30)**<br>Area III (Instruction) = **4** • Area IX (Physical Plant) = **2**<br>Other 8 Areas (incl. Area IV Lab & Area VI Library) = **3 each**<br>`Final Rating = Σ (Area Mean × Weight) ÷ 30` |
| **Card 5** | **`1:58 – 2:24`** | **Bottom-Right Card** + Red Highlight on Areas IV, V, VII | **BSCS INDICATIVE DIGITAL BASELINE (`96.58 ÷ 30 = 3.22`)**<br>✅ Candidate Overall Met (`3.22 ≥ 3.00`)<br>❌ **Level I Area Floor Pending (`< 3.00`):**<br>Area IV Lab (`2.67`) • Area V Research (`2.82`) • Area VII Student Svcs (`1.30`)<br>*Note: Official PACUCOA Level I awarded Sept. 2026 (system reflects digitized subset)* |
| **Card 6** | **`2:40 – 3:07`** | **Top-Right Security Badge** + `120%` Zoom | **AUDIT INTEGRITY & VALIDITY SAFEGUARDS**<br>1. Valid Exhibit = Verified + Expected Type Match + `≤ 5-Year` Window<br>2. Database RLS: `uploader_id ≠ verifier_id` *(QA Officer Exempt)*<br>3. Mandatory Must-View Preview Gate *(Text-Layer PDF Only; No OCR)* |
| **Card 7** | **`3:25 – 4:00`** | **Bottom-Left Card** + `120%` Zoom on New Live Badge | **SIMULATION LEVEL CHECK (`96.58 → 107.16 ÷ 30 = 3.57`)**<br>Area IV: `2.67 → 3.40` • Area V: `2.82 → 3.62` • Area VII: `1.30 → 3.30`<br>✅ **Level I Floors Cleared:** All 10 Areas `≥ 3.00` & Overall `3.57 ≥ 3.50`<br>⚠️ **Level II Area Floor Pending:** 5 Areas still `< 3.50` (`I 3.00`, `III 3.00`, `IV 3.40`, `VI 3.45`, `VII 3.30`) |
| **Card 8** | **`4:03 – 4:24`** | **Top-Right Policy & QA Gate Callout** | **PACUCOA TIMELINES & QA CERTIFICATION GATE**<br>• **Revisit Compliance Report:** Due `≥ 30 Days` prior (`1–5` Compliance Scale)<br>• **Level II Resurvey Filing:** Letter of Intent + Self-Survey due `≥ 6 Months` prior<br>• **QA Cycle Certification Gate:** Blocks final sign-off while any criterion is deficient |

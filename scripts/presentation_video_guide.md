# 3–5 Minute Video Presentation & Editing Guide (Defense Version)
**System:** Web-Based Accreditation Management and Readiness Assessment System for STI West Negros University  
**Proponent:** Clyde Taburada | Candidate, Master in Information Technology (MIT), CICT, STI West Negros University  
**Governing Standard:** *PACUCOA Manual of Accreditation (Revised September 2023)* — Undergraduate Framework (Step Two: Institutional Self-Survey)  
**Target Duration:** 4:00 to 4:35 (~540–600 words at 130 wpm)

---

## ⚠️ 4 Mandatory Pre-Recording Checks (Fixed in Both UI & Script)

1. **Do NOT say the simulation makes BSCS "Level II ready":** The PACUCOA Manual requires **every Area at `3.50` or higher** for Level II. After simulating 10 criteria (`+2` in Area IV $\rightarrow$ `3.40`, `+3` in Area V $\rightarrow$ `3.62`, `+5` in Area VII $\rightarrow$ `3.30`), **all Level I `3.00` Area floors are cleared** and the **overall `3.57` passes the `3.50` overall mark**, **but 5 Areas remain below `3.50`** (`I = 3.00`, `III = 3.00`, `IV = 3.40`, `VI = 3.45`, `VII = 3.30`).
2. **Simulation & Dashboard Badges Updated in Live UI:** The `/simulation` screen now displays **`Candidate met · Level I area floor pending`** at baseline (`3.22`) and **`Level I floors cleared · Level II area floor pending`** after running the `3.57` projection (and `/dashboard` displays **`Floor Pending`** whenever an Area floor is unmet).
3. **Do NOT state a Level I validity period (no "4 years" / no "2030") unless holding the physical certificate:** Public PACUCOA summaries state Level I accreditation is granted for **3 years**, so the script below states **only** that BSCS was officially awarded PACUCOA Level I accredited status in **September 2026**.
4. **Check One Line on Your Printed Manual Page (Level III Floor):** In the transcribed Manual reference, **Section 5 (Minimum Rating Required table)** states Level III requires **"no criterion below `4.00`"**, whereas **Section 10 (Level III Reaccreditation Visit text)** states **"mean rating $\ge 4.0$ in every survey area"**. Read your physical printed Manual page before recording and say whichever phrasing appears on the page you cite (the software implements the Minimum Rating table's `no criterion below 4.00` rule).

---

## 0. Official PACUCOA Manual Quick Reference (For Narration & Video Edit Overlays)

### A. Complete PACUCOA Level Conditions & Dual-Constraint Floor Rules
*Source: PACUCOA Manual of Accreditation (Revised September 2023).*

| Accreditation Level / Status | Overall Weighted Grand Mean | Dual-Constraint Floor Condition | Manual Policies & Additional Requirements |
| :--- | :--- | :--- | :--- |
| **Candidate Status** | **$\ge 3.00$** | **None** *(General average only; no Area floor)* | Must reach formal accredited status within **2 years** (max **3 years** including a one-time 6–12 month grace period). |
| **Level I Formal Accredited** | **$\ge 3.00$** | **No Area (section) mean below `3.00`** | All 10 Areas must be $\ge 3.00$. *(BSCS officially awarded PACUCOA Level I status in September 2026).* |
| **Level II Reaccredited** | **$\ge 3.50$** | **No Area (section) mean below `3.50`** | Letter of intent due **$\ge 6$ months** before expiration + Compliance Report + updated Self-Survey. Granted for **5 years** (or deferred 6–12 months). |
| **Level III Reaccredited** | **$\ge 4.00$** | **No individual criterion below `4.00`** *(§5 Minimum Rating Table; §10 Visit text states Area mean $\ge 4.00$ — verify printed page!)* | May apply within 2 yrs of Level II. Requires **5 mandatory undergraduate criteria** (instruction, outreach, research, faculty development, 4-yr licensure performance) + **2 optional criteria** (`1–5` percentage-banded scale). |
| **Level IV Accredited** | **$\ge 4.00$** | **No individual criterion below `4.00`** *(§5 Minimum Rating Table)* | Apply **6 months** before 5-yr Level III expires; narrative + rating due **30 days** prior across **all 6 Level IV criteria** with **mean $\ge 4.00$ in ALL six** (strict AND rule). |

*(Scope Note: PACUCOA's PRC licensure board passing percentage track — `≥60%` Candidate, `≥75%` Level I, `≥90%` Level II, and `Beyond national passing average` for Levels III–IV — is a separate eligibility track outside documentary self-survey scoring.)*

### B. PACUCOA Rating Scales & Undergraduate 30-Weight Formula
- **Single-Axis Self-Survey Rating Scale (`0–5`, All 10 Areas):** `5` = Excellent, `4` = Very Good *(Simulation completion benchmark)*, `3` = Good *(Quota met benchmark)*, `2` = Fair, `1` = Poor, `0` = Missing, `N.A.` = Not Applicable. *(No dual-axis Adequacy/Effectiveness scale exists in PACUCOA.)*
- **Revisit Compliance Verification Scale (`1–5`, Deferred Revisit Reports Only):** `5` = Full Compliance, `4` = Very Satisfactory Partial Compliance, `3` = Satisfactory Partial Compliance, `2` = Unsatisfactory Partial Compliance, `1` = Non-Compliance.
- **Undergraduate 10 Areas & Weights (`Total = 30`):** Area III (Instruction) = **`4`**, Area IX (Physical Plant & Facilities) = **`2`**, and the remaining 8 Areas — including **Area IV (Laboratory)** and **Area VI (Library)** — = **`3` each**. Formula: $\text{Program Rating} = \sum(\text{Area Mean} \times \text{Area Weight}) \div 30$.

---

## 1. Storyboard & Timeline (Includes Dedicated QA Officer Screen)

| Time | Scene / Module | Window & Screen Visual | PACUCOA Overlay Card (In Edit) | Core Message |
|:---|:---|:---|:---|:---|
| **0:00 – 0:30** | **1. Hook, Problem & PACUCOA Scope** | Title slide → `/login` authentication portal | **Card 1:** PACUCOA Manual (Rev. Sept 2023), Step Two Self-Survey | Scattered exhibits & manual math → automated PACUCOA platform |
| **0:30 – 1:25** | **2. QA Officer Command Screen** | **QA Window:** `/admin/framework` (`Rating Scales` & `Levels`) → `/dashboard` (`All Programs` + Audit Feed) | **Cards 2–3:** `0–5` Single-Axis Scale & **All 5 PACUCOA Level Conditions** | QA governs framework, level thresholds, scope, and multi-program oversight |
| **1:25 – 2:05** | **3. Program Head 5×2 Dashboard** | **PH Window:** `/dashboard` (BSCS `3.22`, `Floor Pending`, 10 Areas) | **Cards 4–5:** `30`-Weight Formula & BSCS `3.22` Floor Audit (`IV, V, VII < 3.00`) | 10 Areas at once; `3.22` indicative baseline vs. Sept 2026 Level I award |
| **2:05 – 2:45** | **4. Evidence & Independent Verification** | **PH/Faculty Window:** `/evidence` text-layer PDF → `/verification` self-block & Preview Gate | **Card 6:** RLS `uploader ≠ verifier` & Must-View Gate | Criterion mapping, 5-year window, separation of duties |
| **2:45 – 3:30** | **5. Live Readiness Simulation (`3.22 → 3.57`)** | **PH Window:** `/simulation` (+10 criteria) → live badge → `/dashboard` isolation check | **Card 7:** `Level I floors cleared · Level II area floor pending` (`5 Areas < 3.50`) | Clears all `3.00` Level I floors & `3.50` overall mark; 5 Areas still `< 3.50` |
| **3:30 – 4:05** | **6. 4-Column Matrix & QA Certification Gate** | **QA Window:** `/recommendations` (4-column matrix + `Accreditation Cycles` → `Certify Cycle` block) | **Card 8:** Revisit (`≥30 days`), Resurvey (`≥6 months`) & QA Certify Gate | Post-visit tracking & QA cycle certification gate |
| **4:05 – 4:25** | **7. ISO/IEC 25010 Results & Conclusion** | Table 10 (`N = 20`: Users `4.83`, Experts `4.40`, Combined `4.72`) → Closing | **Card 9:** ISO/IEC 25010 Summary (`Security 4.89` Highest) | Very Highly Acceptable; continuous PACUCOA readiness |

---

## 2. Word-for-Word Narration

> *Words in [brackets] are screen and editing cues.*

### [0:00 – 0:30] 1. Introduction, Problem & PACUCOA Scope
*[Show Title Slide, then transition to `/login` with Overlay Card 1]*
> "Good day, esteemed panel. I am **Clyde Taburada**, proponent of the **Web-Based Accreditation Management and Readiness Assessment System for STI West Negros University**.
>
> Accreditation documents are often scattered across drives and scored by hand, making deficiencies hard to catch early. Our system addresses **Step Two, Institutional Self-Survey**, of the **PACUCOA Manual of Accreditation, Revised September 2023**, piloted on the **BSCS** program."

### [0:30 – 1:25] 2. QA Officer Command Screen & PACUCOA Level Conditions
*[Switch to QA Window (`admin.qa@sti.edu`): open `/admin/framework` → `Rating Scales` and `Accreditation Levels` tabs with Overlay Cards 2 & 3, then click QA `/dashboard`]*
> "We start on the **Quality Assurance Officer Screen**. In **Framework Configuration**, the QA Officer manages PACUCOA's **single-axis zero-to-five rating scale**—from zero, Missing, and three, Good when the configurable quota is met within the five-year validity window, up to five, Excellent—along with active program scope and **all five PACUCOA Level Conditions**.
>
> Under the Manual, **Candidate Status** requires at least **3.00** overall with no Area floor; **Level I** requires **3.00** overall with **no Area mean below 3.00**; **Level II** requires **3.50** overall with **no Area mean below 3.50**; and **Levels III and IV** require at least **4.00** overall with **[no criterion below 4.00 per the Minimum Rating table / mean of 4.00 in every survey area — state whichever line appears on your printed Manual page]** plus their supplementary criteria.
>
> On the **QA Command Dashboard**, the QA Officer compares readiness across all programs and monitors the live compliance audit feed."

### [1:25 – 2:05] 3. Program Head 5×2 Dashboard & BSCS Baseline Floor Audit
*[Switch to Program Head Window (`head.bscs@sti.edu`): `/dashboard` with Overlay Cards 4 & 5]*
> "In the **Program Head** view for BSCS, the **Executive 5x2 Command Dashboard** shows all ten Areas at once across the **thirty PACUCOA weights**—four for Instruction, two for Physical Plant, and three for the other eight Areas, with Area IV as Laboratory and Area VI as Library.
>
> On the BSCS exhibits digitized during our baseline run, the weighted total is **96.58 divided by 30**, or **3.22**. Notice the **Floor Pending** badge: `3.22` meets Candidate Status, but **Area IV Laboratory (2.67)**, **Area V Research (2.82)**, and **Area VII Student Services (1.30)** are below the **3.00 Level I floor**. This is an indicative readiness rating from digitized files, not the official PACUCOA result—BSCS was officially awarded **PACUCOA Level I accredited status in September 2026**."

### [2:05 – 2:45] 4. Evidence Mapping & Independent Verification
*[Open `/evidence`, upload a text-layer PDF; then open `/verification` to show self-verification block and Preview Gate with Overlay Card 6]*
> "In **Evidence Management**, uploading a text-layer PDF extracts its text to suggest a document type and checks the five-year window. Scanned, image-only PDFs are not read; OCR is a stated limitation.
>
> **Independent Verification** is enforced by database Row-Level Security: an uploader cannot verify their own file—with the QA Officer exempt by policy—and reviewers must open each document through the **Preview Gate** before approving."

### [2:45 – 3:30] 5. Live Readiness Simulation (`3.22` $\rightarrow$ `3.57`) & Exact Floor Status
*[Open `/simulation`, select 2 criteria in Area IV, 3 in Area V, and 5 in Area VII, click `Simulate Score Impact`, point to the live badge with Overlay Card 7, then switch to `/dashboard`]*
> "In the **What-If Simulation Sandbox**, selecting ten unresolved criteria across those deficit Areas—two in Area IV, three in Area V, and five in Area VII—at the **4.00 Very Good** benchmark raises the projected rating from **3.22** to **3.57**.
>
> As the on-screen badge shows—**Level I floors cleared, Level II area floor pending**—all ten Areas now clear the **3.00 Level I floor** and the **3.57** overall rating passes the **3.50** overall mark, while five Areas—Areas I, III, IV, VI, and VII—still sit below the **3.50 Area floor** required for Level II. Returning to the live dashboard confirms production scores remain untouched at **3.22**."

### [3:30 – 4:05] 6. Four-Column Compliance Matrix & QA Cycle Certification Gate
*[Switch to QA Window: `/recommendations` → show 4-column matrix, then click `Accreditation Cycles` → click `Certify Cycle` with Overlay Card 8]*
> "After a survey, the **Post-Visit Compliance Matrix** tracks opportunities, PACUCOA recommendations, sub-numbered actions, and verified exhibits—supporting revisit reports due at least **thirty days** before a revisit and Level II applications due at least **six months** before status expiration. In the **Accreditation Cycles** tab, only the **QA Officer** can trigger **Certify Cycle**, which blocks certification while any criterion remains deficient."

### [4:05 – 4:25] 7. Evaluation Results & Conclusion
*[Show Table 10 and closing slide with Overlay Card 9]*
> "Evaluated under **ISO/IEC 25010** by **twenty purposive respondents**—**fifteen institutional users** (mean **4.83**) and **five external IT experts** (mean **4.40**)—the system achieved a combined grand mean of **4.72**, **Very Highly Acceptable**, with **Security** highest at **4.89**.
>
> Thank you, and I welcome your questions."

---

## 3. Dual-Window Recording Setup

1. **Window A (Normal Chrome — QA Officer `admin.qa@sti.edu`):** Preload `/admin/framework`, `/dashboard`, `/recommendations` (`Accreditation Cycles` & `Recommendations Matrix`), and `/audit-log`.
2. **Window B (Incognito / Edge — Program Head `head.bscs@sti.edu` & Reviewer):** Preload `/login`, `/dashboard`, `/evidence`, `/verification`, and `/simulation`.
3. **Use only text-layer PDFs** from `demo_documents/` (`Course_Syllabus.pdf`).
4. **Run the Simulation live** and hover over the live **`Level I floors cleared · Level II area floor pending`** badge.

---

## 4. Video Editing Guide — Exact On-Screen PACUCOA Overlay Cards (CapCut / Premiere / Canva)

| Overlay # | Timestamp | Position & Edit Effect | Exact On-Screen Text to Display |
| :---: | :--- | :--- | :--- |
| **Card 1** | `0:12 – 0:29` | Bottom-Left Lower Third | **PACUCOA MANUAL OF ACCREDITATION (REV. SEPT. 2023)**<br>System Scope: Step Two — Institutional Self-Survey (Undergraduate Pilot: BSCS) |
| **Card 2** | `0:32 – 0:52` | Top-Right Card over QA `/admin/framework` | **QA COMMAND: SINGLE-AXIS RATING SCALE (`0–5`)**<br>`5` Excellent • `4` Very Good • `3` Good • `2` Fair • `1` Poor • `0` Missing • `N.A.`<br>*Plus `1–5` Revisit Compliance Scale & `1–5` Level III Percentage Scale* |
| **Card 3** | `0:53 – 1:20` | Center-Right Glass Panel *(Key Visual!)* | **PACUCOA LEVEL CONDITIONS (MANUAL REV. SEPT. 2023)**<br>• **Candidate:** Overall `≥ 3.00` *(No Area Floor)*<br>• **Level I:** Overall `≥ 3.00` AND **No Area Mean `< 3.00`**<br>• **Level II:** Overall `≥ 3.50` AND **No Area Mean `< 3.50`**<br>• **Level III:** Overall `≥ 4.00` AND **No Criterion `< 4.00`** *(§5 Table; check vs. §10 Area `≥ 4.0`)*<br>• **Level IV:** Overall `≥ 4.00` AND **No Criterion `< 4.00`** *(+All 6 Level IV Crit. `≥ 4.00`)* |
| **Card 4** | `1:26 – 1:44` | Top-Right Card over 5×2 Area Grid | **UNDERGRADUATE WEIGHTS (`Σ = 30`)**<br>Area III Instruction = **4** • Area IX Physical Plant = **2**<br>Other 8 Areas (incl. Area IV Lab & Area VI Library) = **3 each** |
| **Card 5** | `1:45 – 2:04` | Bottom-Right Card + Red Highlight Boxes | **BSCS INDICATIVE DIGITAL BASELINE (`96.58 ÷ 30 = 3.22`)**<br>✅ Candidate Overall Met (`3.22 ≥ 3.00`)<br>❌ **Level I Area Floor Pending (`< 3.00`):** Area IV (`2.67`), Area V (`2.82`), Area VII (`1.30`)<br>*Official PACUCOA Level I awarded Sept. 2026 (baseline reflects digitized subset)* |
| **Card 6** | `2:18 – 2:44` | Top-Right Security Callout + `120%` Zoom | **SEPARATION OF DUTIES & VALIDITY RULES**<br>• Valid Exhibit = Verified + Expected Type Match + `≤ 5-Year` Window<br>• Database RLS: `uploader_id ≠ verifier_id` *(QA Officer Exempt)* + Must-View Gate |
| **Card 7** | `2:58 – 3:28` | Bottom-Left Card + `120%` Zoom on Live Badge | **SIMULATION LEVEL CHECK (`96.58 → 107.16 ÷ 30 = 3.57`)**<br>Area IV `2.67 → 3.40` • Area V `2.82 → 3.62` • Area VII `1.30 → 3.30`<br>✅ **Level I Floors Cleared** (`All 10 Areas ≥ 3.00`) & Overall `3.57 ≥ 3.50`<br>⚠️ **Level II Area Floor Pending:** 5 Areas `< 3.50` (`I 3.00`, `III 3.00`, `IV 3.40`, `VI 3.45`, `VII 3.30`) |
| **Card 8** | `3:32 – 4:04` | Top-Right Policy & QA Gate Callout | **PACUCOA TIMELINES & QA CERTIFICATION GATE**<br>• **Revisit Report:** Due `≥ 30 Days` prior • **Level II Filing:** Due `≥ 6 Months` prior<br>• **QA Certify Cycle Gate:** Blocks final sign-off while any criterion is deficient |
| **Card 9** | `4:06 – 4:24` | Center-Right Summary Card | **ISO/IEC 25010 EVALUATION (`N = 20`)**<br>Users (`n = 15`): **4.83** • IT Experts (`n = 5`): **4.40** • Combined (`N = 20`): **4.72**<br>Highest Characteristic: **Security (`4.89` Combined / `4.90` Experts)** — *Very Highly Acceptable* |

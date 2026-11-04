# PACUCOA Manual of Accreditation — Complete Reference
*Source: Manual of Accreditation, Revised September 2023 (as photographed/transcribed from your physical copy). Use this to audit your database seed data and scoring logic against the actual source — not against earlier guesses made before you found this document.*

---

## 1. Document Identity

- **Title:** Manual of Accreditation (revised)
- **Date:** September 2023
- **Issuing body:** Philippine Association of Colleges and Universities Commission on Accreditation (PACUCOA), Inc.
- **Affiliations shown on cover:** ISO 9001 (SGS certified), Full Member of INQAAHE, Affiliate Member of FAAP, Associate Member of AQAN, Full Member of APQN, Member of Philippine Society for Quality Inc., Member of CHEA/CIQG, DTI Philippines

**Citation to use:**
> Philippine Association of Colleges and Universities Commission on Accreditation. (2023). *Manual of accreditation* (Rev. ed.). PACUCOA.

---

## 2. The Accreditation Process (from the Table of Contents, Chapter I)

**Preliminary Requirements for Accreditation:**
- Step One: Application
- Step Two: Institutional Self-Survey
- Step Three: Organization of the Accrediting Team

**Phases of Accreditation (visits, in order):**
1. Orientation Visit
2. Preliminary Visit
3. Level I Formal Accreditation Visit
4. Level II Reaccreditation Visit
5. Level III Reaccreditation Visit
6. Level IV Accreditation Visit

Your system covers **Step Two (Self-Survey)** only. Steps One and Three, and the actual conduct of every visit, belong to PACUCOA and the institution's liaison with PACUCOA — not to your software. This is a deliberate scope boundary, not a gap.

---

## 3. The Self-Survey Rating Scale (single-axis, 0–5)

Confirmed from your own first photograph and matched again in the full Manual text. This is the **only** scale used for the ten main Areas — there is no dual-axis (Adequacy/Effectiveness) scale in PACUCOA; that was a false lead from an AACCUP example earlier in this project and should **not** be in your system.

| Rating | Verbal Interpretation | Description |
|---|---|---|
| 5 | Excellent | Provision is very extensive and functioning excellently |
| 4 | Very Good | Provision is moderately extensive and functioning very well |
| 3 | Good | Provision is adequate and functioning well |
| 2 | Fair | Provision is limited but functioning well |
| 1 | Poor | Provision is very limited and functioning poorly |
| 0 | Missing | Provision is missing but necessary |
| N.A. | Not Applicable | Provision does not apply |

---

## 4. Scoring and Weighting System (the real formula)

> "The mean average rating for each section is obtained and the corresponding averages are multiplied by the weight value to arrive at the weighted average. The total of the weighted averages is then divided by the total weight value... to obtain the final numerical rating."

**Formula:**
```
Final Rating = Σ (Area Mean × Area Weight) ÷ Total Weight
```
Total weight = **30** for Basic Education, Undergraduate, and Tech-Voc programs; **50** for Graduate programs.

### 4a. Undergraduate / Basic Education Areas and Weights — **this is what applies to BSIT and BSCS**

| Area | Title | Weight |
|---|---|---|
| I | Philosophy and Objectives | 3 |
| II | Faculty | 3 |
| III | Instruction | **4** |
| IV | **Laboratory** | 3 |
| V | Research | 3 |
| VI | **Library** | 3 |
| VII | Student Services | 3 |
| VIII | Social Orientation and Community Involvement | 3 |
| IX | Physical Plant and Facilities | **2** |
| X | Organization and Administration | 3 |
| | **TOTAL** | **30** |

Area IV is Laboratory, Area VI is Library — not the reverse. This has been wrong in at least one earlier draft of your test data; check your seed script against this table specifically.

### 4b. Graduate Program Areas and Weights (out of scope for your pilot — reference only)

| Area | Title | Weight |
|---|---|---|
| I | Goals and Objectives | 7 |
| II | Faculty | 7 |
| III | Curriculum and Instruction | 7 |
| IV | Research | 7 |
| V | Students | 7 |
| VI | Library | 6 |
| VII | Administration | 5 |
| VIII | Other Resources | 4 |
| | **TOTAL** | **50** |

### 4c. Tech-Voc Program Areas and Weights (out of scope for your pilot — reference only)

| Area | Title | Weight |
|---|---|---|
| I | Philosophy and Objectives | 5 |
| II | Trainers/Instructors | 6 |
| III | Training Standards | 6 |
| IV | Physical Resources | 4 |
| V | Trainee Services | 5 |
| VI | Organization and Administration | 4 |
| | **TOTAL** | **30** |

---

## 5. Minimum Rating Required for Accreditation

| Status | Requirement |
|---|---|
| Candidate Status | General average of at least **3.00** |
| Level I Formal Accredited | At least **3.00**, with **no section below 3.00** |
| Level II Reaccredited | At least **3.50**, with **no section below 3.50** |
| Level III Reaccredited | At least **4.00**, with **no criterion below 4.00** |
| Level IV Accredited | At least **4.00**, with **no criterion below 4.00** |

Note the shift in wording from "no **section**" (Levels I–II) to "no **criterion**" (Levels III–IV) — your floor-check logic should apply the Area-mean floor for Levels I/II and the individual-criterion floor for Levels III/IV, which is what we already verified against your code.

---

## 6. Level I–IV Accreditation Status Flow Chart (a *different* metric — licensure board exam pass rate, not the self-survey score)

| Status | Metric | Years to Compute |
|---|---|---|
| Candidate | Average board passing % ≥ 60% of the national passing average | 3 years |
| Level I Accredited | ≥ 75% of the national passing average | 3 years |
| Level II Reaccredited | ≥ 90% of the national passing average | 4 years |
| Level III | Beyond the national passing average | 4 years |
| Level IV | Beyond the national passing average | 5 years |

> A "clean reaccredited status" means no deferment due to deficiencies in faculty, instruction, or laboratories.

**This is a separate eligibility track from your readiness score**, based on licensure exam results, not evidence/documentation. Your system does not model this (BSIT and BSCS licensure exam data is a different data source entirely). Worth stating explicitly as a limitation if a panelist asks why your system doesn't predict Level status from board exam data.

---

## 7. Policy on Revisit (for deferred programs)

- A revisit happens 6 months to 1 year after a deferment decision.
- A **compliance report** is required at least **30 days before** the revisit.
- The revisit team has at least two accreditors, preferably from the original team.

**Separate compliance-verification scale** (NOT the main 0–5 scale — used only to rate compliance with prior recommendations):

| Rating | Label |
|---|---|
| 5 | Full Compliance |
| 4 | Very Satisfactory Partial Compliance (incl. non-compliance with very good justification) |
| 3 | Satisfactory Partial Compliance (incl. compliance at initial stage with evidence of near-future implementation) |
| 2 | Unsatisfactory Partial Compliance |
| 1 | Non-Compliance |

---

## 8. Policy on Expiration Dates

- **Candidate status:** must reach accredited status within 2 years; a 6-month to 1-year grace period is available; maximum total time on Candidate status is **3 years** including the grace period. After 3 years with no formal survey, candidate status is automatically lost.
- **Levels I–IV:** must undergo a resurvey visit at least **6 months before** the accredited status expires, or the status lapses and reverts to Candidate (unless a grace period is approved).
- **Grace period:** 6 months to 1 year, granted **only once**, and only for: force majeure; lack of a qualified dean/faculty/chief librarian; failure to meet licensure exam requirements; change in school leadership; other comparable reasons.

---

## 9. Level II Reaccreditation Visit

- **Application:** letter of intent to PACUCOA at least **6 months** before accredited status expires, plus a compliance report and a fresh self-survey.
- **Board action options:** grant Level II Reaccredited Status for 5 years, OR defer for 6 months to 1 year pending compliance.

## 10. Level III Reaccreditation Visit

- **Qualification:** general average rating ≥ 4.0 **and** mean rating ≥ 4.0 in **every** survey area; may apply within 2 years of being granted Level II.
- **Board action options:** grant Level III (duration depends on remaining Level II years, max 5 years), grant Level II instead, or defer 6 months to 1 year.
- **Additional criteria required (by program type):**

| Program Type | Mandatory Criteria | Optional (choose 2) |
|---|---|---|
| Undergraduate | 1. Reasonably high standard of instruction<br>2. Highly visible community outreach<br>3. Highly visible research tradition<br>4. Strong faculty/staff development<br>5. Creditable licensure performance (last 4 years) | 6/7. Working network & functional library/resources *(⚠️ this pairing is ambiguous in the source — confirm with QA office whether these are genuinely 2 separate optional items or the only 2 choices available)* |

- **Rating scale for these additional criteria** (percentage-banded — different from the main 0–5 scale):

| Rating | Label | Percentage |
|---|---|---|
| 5 | Excellent | 95–100% |
| 4 | Very Good/Outstanding | 90–94% |
| 3 | Good | 85–89% |
| 2 | Fair | 80–84% |
| 1 | Poor | below 80% |

## 11. Level IV Accreditation Visit

- **Application:** 6 months before the 5-year Level III status expires.
- **Six required criteria** (narrative response + rating, 30 days before the visit):
  1. Excellent Outcomes in Teaching and Learning
  2. Research Productivity as Tool for Institutional Effectiveness
  3. Community Service
  4. Linkages and Consortia
  5. Career Planning and Development for Students
  6. Planning Process
- **Rating requirement:** mean rating of at least 4.00 in **all six** criteria (an AND condition — not an average across them) to be granted Level IV for 5 years. If not met, the program is retained at Level III.

**Status for your system:** Items 10–11 (Level III/IV supplementary criteria) were deliberately scoped OUT of the current build as future work, given the project timeline. Given that BSIT is now Level II (heading toward Level III) and BSCS is Level I (heading toward Level II), confirm with your adviser whether Level III's supplementary criteria should be pulled back into scope — this is a live decision, not a formality, since BSIT's actual next requirement needs exactly this module.

---

## 12. Suggested Exhibits/Evidence — All 10 Areas (Undergraduate)

This is your real source for `expected_document_type` seed data. Condensed to the main exhibit categories per Area (the full Manual text has more granular sub-points under each):

**Area I — Philosophy and Objectives**
Statement of VMGO; evidence of alignment with government socio-economic plans; evidence of periodic reappraisal of VMGO; evidence of dissemination; evidence of stakeholder awareness/acceptance.

**Area II — Faculty**
Faculty records (qualifications, experience); recruitment/selection policies; ranking/promotion/remuneration policies; compensation benchmarking; workload/evaluation standards; faculty development program evidence; research/publication records; CEFR language proficiency targets (C1 level, phased percentages).

**Area III — Instruction**
Program of studies vs. CHED/DepEd/TESDA standards; learning outcomes alignment; periodic curriculum reassessment; learning outcome assessment proof (incl. CEFR B1 targets); co-curricular activity records; instructional process evidence (methods, syllabi, test samples); classroom management records (class records, attendance); academic performance records (grading criteria, portfolios); supervision records (observations, supervisory conference minutes).

**Area IV — Laboratory**
Facility listings per program; utility availability (gas/water/electric); lighting/ventilation adequacy; safety standards compliance; equipment/supplies records (labeling, sufficiency, restocking); program-specific lab requirements (Commerce, Education, Nutrition/HRM, Speech, PE, Computer Labs); maintenance and repair system records.

**Area V — Research**
Institutional research manual (policies, agenda, budget, incentives); research agenda and budget documents; research output counts (tiered by Level: IV=2/faculty/5yrs, III RA=1/faculty/3yrs, II RA=5/college/5yrs, I Formal=3/college/3yrs); research competency development program; research accomplishment reports; research linkages/partnerships documentation.

**Area VI — Library**
Budget adequacy (≥5% of operating expenses, excluding staff salaries); holdings comparison vs. CHED standards; collection listings (books, references, periodicals, AV materials); collection selection/maintenance records; risk-protection measures (fire, theft); library space/facilities/equipment plans; staff qualifications and development records; service utilization evidence.

**Area VII — Student Services**
SPS organization records (objectives, org chart, budget); admissions criteria documentation; guidance program records (orientation, individual inventory, counseling, research/evaluation, testing); placement and follow-up service records (alumni tracking); food service sanitation/health records; student financial assistance program documentation; medical/dental service records; housing assistance records; co-curricular program policy documentation.

**Area VIII — Social Orientation and Community Involvement**
Community profile/knowledge materials; evidence of social awareness programs; community relations documentation; community service/outreach project documentation (with participation extent records).

**Area IX — Physical Plant and Facilities**
Site layout plans (land area, drainage, safety); campus site plans; building plans (safety, design, occupancy/fire certificates); classroom adequacy records; office/staff room standards compliance; assembly/athletic facility adequacy; building services records (lighting, waste disposal, water).

**Area X — Organization and Administration**
Organizational chart and administrative manual; officer qualifications listing; communication channel documentation; department/committee system evidence; academic administration records (policies, supervision evidence); student personnel administration records (admissions, fees, financial transactions); financial/business administration records (budget, audited financial statements); records administration (meeting minutes, directories, enrollment summaries).

---

## 13. Known Gaps and Unconfirmed Items — check these against your QA interview

1. The "SAMPLE ONLY" label on your first photographed survey instrument — confirm whether the Manual you now have (Rev. Sept 2023) is the current, official edition STI uses, or whether a newer revision exists.
2. Whether any numbered criterion has a further lettered (a, b, c) sub-item that is **separately rated** — the evidence so far suggests sub-points are descriptive detail under one rated item, not separate ratings, but this hasn't been visually confirmed from a full, unambiguous Area page.
3. The Level III optional-criteria pairing ("6/7. Working network & functional library/resources") — ambiguous as transcribed; confirm the real pool size and selection rule with the QA office before hardcoding a "select exactly 2" validation.
4. The exact required-document counts (e.g., "requires 5 docs") used in your criteria table are **not specified by the Manual** — these are configurable judgment calls your QA Officer sets, not PACUCOA mandates. Don't present them as if they come from the Manual.

---

## How to Use This to Check Alignment

Go through your actual database (or the seed script) and verify, line by line:
- [ ] All 10 Areas exist with the **exact** titles and weights in Section 4a (not the Graduate or Tech-Voc tables)
- [ ] The scoring formula matches Section 4 exactly (weighted by Area, total divisor = 30, not hardcoded as a literal)
- [ ] The Level thresholds match Section 5 exactly, with the Area-floor vs. criterion-floor distinction applied correctly
- [ ] No dual-axis (Adequacy/Effectiveness) rating logic exists anywhere — only the single 0–5 scale in Section 3
- [ ] `expected_document_type` values are drawn from Section 12, not invented categories
- [ ] Nothing in your UI or code implies your system computes the board-passing-percentage track in Section 6 — that's a separate, unmodeled metric
</USER_REQUEST>
<ADDITIONAL_METADATA>
The current local time is: 2026-10-01T15:43:51+08:00.

The user's current state is as follows:
Active Document: c:\Users\Acer\Desktop\ACCREDITATION SYSTEM\e2e_test_guide.md (LANGUAGE_MARKDOWN)
Cursor is on line: 202
Other open documents:
- c:\Users\Acer\Desktop\ACCREDITATION SYSTEM\e2e_test_guide.md (LANGUAGE_MARKDOWN)
- c:\Users\Acer\Desktop\ACCREDITATION SYSTEM\src\lib\mock-data.ts (LANGUAGE_TYPESCRIPT)
No browser pages are currently open.
Running terminal commands:
- npm run dev (in c:\Users\Acer\Desktop\ACCREDITATION SYSTEM, running for 2h0m53s)
</ADDITIONAL_METADATA>
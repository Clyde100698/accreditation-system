# Temporary Offline & Bypass Mode — Changes & Reversion Guide

> **Note:** This document tracks all files and logic introduced to support temporary offline testing while Supabase is disconnected. When Supabase is re-established, follow the **Reversion Steps** below to return to full live-database mode.

---

## 1. Summary of Changes

To allow interactive testing across all 8 user roles and modules without throwing `Failed to fetch` errors, the system was configured with an **offline bypass and mock database layer** backed by `localStorage`.

### Key Design Guarantee
All modifications were made using **non-breaking graceful fallbacks (`try { ... } catch { ... }`)**:
- When Supabase is connected, the app queries Supabase first.
- When Supabase is uncontactable or disconnected, the app catches the network error and automatically falls back to `mock-data.ts`.

---

## 2. New Files Created

| File | Purpose | Action When Supabase Reconnects |
| :--- | :--- | :--- |
| `src/lib/auth-mock.ts` | Mock user sessions for all 8 roles (`system_admin`, `qa`, `dean`, `program_head`, `faculty`, `observer`, `alumni_rep`, `student_rep`), plus `getBypassUser()` / `setBypassUser()` in `localStorage`. | Can be deleted or kept for future offline demos. |
| `src/lib/mock-data.ts` | Complete offline database schema with PACUCOA 10 Areas, criteria hierarchy, departments, programs, evidence, and scores. | Can be deleted or kept for offline resilience. |
| `supabase/seed.sql` | Master PostgreSQL seed script matching the exact test dataset (institutions, areas, criteria, users, programs, evidence). | **Keep & Run** in Supabase SQL Editor to populate the new database. |
| `OFFLINE_MOCK_CHANGES.md` | This reference document. | Can be deleted once reversion is complete. |

---

## 3. Modified Files & Specific Changes

### A. Authentication & Shell Layout
1. **`src/lib/hooks/useAuth.ts`**
   - **What was changed:** Added priority check for `getBypassUser()`. If present, it loads the bypass session without calling remote `supabase.auth.getUser()`, and listens to `bypass-auth-change` events.
   - **To revert:** Remove lines checking `getBypassUser()`.

2. **`src/app/login/page.tsx`**
   - **What was changed:** Added the **Instant Bypass Login** section with 1-click role buttons (`System Admin`, `QA Admin`, `College Dean`, `Program Head`, `Faculty Member`, `Observer`) and the **Reset Seed Data** button.
   - **To revert:** Remove the bypass card JSX (`{/* Instant Bypass Login (Offline Mode) */}`).

3. **`src/components/layout/Topbar.tsx`**
   - **What was changed:** Added the `"Offline Bypass Active"` status badge, the **Switch Role** select dropdown, and the **Reset Seed Data** button when a bypass user is active.
   - **To revert:** Remove the `isBypass` JSX blocks in the top bar.

4. **`src/components/layout/Sidebar.tsx`**
   - **What was changed:** `handleLogout` calls `setBypassUser(null)` and dispatches `bypass-auth-change` event before redirecting to `/login`.
   - **To revert:** Remove `setBypassUser(null)` calls.

---

### B. Dashboard & Feature Pages (Graceful Catch Fallbacks)
In all the following pages, Supabase queries were wrapped in `try / catch`. If Supabase throws `Failed to fetch`, they read and update `getMockDatabase()` in `localStorage`:

5. **`src/app/(dashboard)/dashboard/page.tsx`**
   - **Changes:** Added `loadMockData()` inside `fetchData()` catch block to populate stats, tree roots, scores, cycles, assignments, and comparison charts when offline.

6. **`src/app/(dashboard)/verification/page.tsx`**
   - **Changes:**
     - `fetchPending()` falls back to `db.evidence_documents.filter(d => d.status === 'pending')`.
     - `handleExecuteEvaluation()` falls back to `updateMockEvidence()` and `addMockAuditLog()` in mock database.

7. **`src/app/(dashboard)/evidence/page.tsx`**
     - `fetchData()` falls back to `db.evidence_documents`, `db.accreditation_areas`, and `db.accreditation_criteria`.
     - `handleUpload()` falls back to `addMockEvidence()` when file storage or table insert fails offline.

8. **`src/app/(dashboard)/criteria/page.tsx`**
   - **Changes:**
     - `fetchCriteria()` and `fetchAreas()` fall back to `db.accreditation_criteria` and `db.accreditation_areas`.
     - `handleSubmit()` and `handleDelete()` fall back to `addMockCriterion()`, `updateMockCriterion()`, and `deleteMockCriterion()`.

9. **`src/app/(dashboard)/areas/page.tsx`**
   - **Changes:**
     - `fetchData()` and `fetchAssignments()` fall back to `db.accreditation_areas` and `db.area_assignments`.
     - `handleAssign()` and `handleRemove()` fall back to `addMockAreaAssignment()` and `deleteMockAreaAssignment()`.

10. **`src/app/(dashboard)/simulation/page.tsx`**
    - **Changes:** `fetchData()` falls back to `db.readiness_scores` and `db.programs`.

11. **`src/app/(dashboard)/recommendations/page.tsx`**
    - **Changes:**
      - `fetchData()` falls back to `db.accreditation_recommendations` and `db.accreditation_cycles`.
      - `handleResolve()` falls back to `updateMockRecommendation()`.

12. **`src/app/(dashboard)/admin/scope/page.tsx`**
    - **Changes:**
      - `fetchData()` falls back to `db.departments`, `db.programs`, and `db.accreditation_levels`.
      - `handleToggleScope()` falls back to `toggleMockProgramScope()`.

13. **`src/app/(dashboard)/admin/programs/page.tsx`**
    - **Changes:** `fetchData()` falls back to `db.institutions`, `db.departments`, and `db.programs`.

14. **`src/app/(dashboard)/admin/users/page.tsx`**
    - **Changes:** `fetchData()` falls back to `db.users`, `db.departments`, and `db.programs`.

15. **`src/app/(dashboard)/audit-log/page.tsx`**
    - **Changes:** `fetchLogs()` falls back to `db.audit_log`.

---

### C. Types
16. **`src/lib/types.ts`**
    - **What was changed:** Made properties flexible and robust:
      - `EvidenceDocument`: Added optional `reviewer_notes?: string | null;` and made `previous_version_id` optional.
      - `AccreditationCriterion`: Added `'single'` to `rating_axis`, allowed `string | null` for `program_id`/`area_id`, and made `created_by`/`created_at` optional.
      - `ReadinessScore`: Added optional `calculated_at?: string;` alongside `last_computed_at`.
      - `AccreditationCycle`: Made `name` and `created_by` optional.
      - `AccreditationRecommendation`: Added optional `recommendation_text`, `action_plan`, `priority`, and made `cycle_id` optional.
    - **To revert:** **No need to revert** — these enhancements improve standard TypeScript typing regardless of Supabase connection.

---

## 4. Reversion Steps (When Supabase is Reconnected)

When you are ready to connect a live Supabase database again, follow these simple steps:

### Step 1: Re-configure `.env.local`
Restore your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Step 2: Seed the Database
Open the **Supabase Dashboard -> SQL Editor** and run the script in:
`supabase/seed.sql`
This will automatically create all tables' initial data (10 Areas, BSIT, BSCS, Criteria, Users, etc.).

### Step 3: Clear Browser Storage
Open DevTools (`F12`) in your browser and run:
```javascript
localStorage.removeItem('bypass_user');
localStorage.removeItem('mock_accreditation_db_v2');
```
Or simply click **Log Out** in the sidebar.

### Step 4: (Optional) Remove Offline UI Controls
If you don't want the offline role switcher or bypass cards to be visible in production:
1. In `src/app/login/page.tsx`: Remove the `{/* Instant Bypass Login (Offline Mode) */}` section.
2. In `src/components/layout/Topbar.tsx`: Remove the `Switch Role` dropdown and `Reset Seed Data` button.
3. In `src/lib/hooks/useAuth.ts`: Remove the `getBypassUser()` bypass check.

> **Tip:** The `try / catch` fallbacks in the pages can safely remain! They act as high-availability network error boundaries: if Supabase is temporarily unreachable, the app will continue to gracefully show cached data rather than crashing.

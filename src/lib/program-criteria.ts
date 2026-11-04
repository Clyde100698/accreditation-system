import type { SupabaseClient } from '@supabase/supabase-js';
import { AccreditationCriterion } from './types';

/**
 * PROGRAM-SPECIFIC CRITERIA MODEL (Shared Base + Program Overrides)
 *
 *  - criterion.program_id === null           -> SHARED: applies to every program
 *  - criterion.program_id === <programId>    -> PROGRAM-SPECIFIC: only that program
 *  - program_criterion_exclusions row        -> SHARED criterion HIDDEN for one program
 *
 * A criterion is applicable to a program when:
 *   1. it is shared OR belongs to that program, AND
 *   2. it is not hidden (excluded) for that program, AND
 *   3. its parent (if any) is also applicable (hiding a parent hides its children).
 */

export type ExclusionMap = Map<string, Set<string>>; // programId -> Set<criterionId>

export const ALL_PROGRAMS_SCOPE = 'all';

export function isSharedCriterion(c: Pick<AccreditationCriterion, 'program_id'>): boolean {
  return !c.program_id;
}

/**
 * Returns the criteria that apply to the given program.
 * When programId is null / 'all', only SHARED criteria are returned
 * (the common base every program is evaluated against).
 */
export function filterCriteriaForProgram<T extends AccreditationCriterion>(
  criteria: T[],
  programId: string | null | undefined,
  exclusions?: ExclusionMap | Set<string> | null
): T[] {
  const scopedProgram = programId && programId !== ALL_PROGRAMS_SCOPE ? programId : null;

  let excluded: Set<string>;
  if (!exclusions || !scopedProgram) {
    excluded = new Set();
  } else if (exclusions instanceof Set) {
    excluded = exclusions;
  } else {
    excluded = exclusions.get(scopedProgram) || new Set();
  }

  const byId = new Map<string, T>();
  criteria.forEach((c) => byId.set(c.id, c));

  const memo = new Map<string, boolean>();
  const visiting = new Set<string>();

  const isApplicable = (c: T): boolean => {
    const cached = memo.get(c.id);
    if (cached !== undefined) return cached;
    if (visiting.has(c.id)) return false; // guard against cyclic parent links
    visiting.add(c.id);

    let ok = scopedProgram ? !c.program_id || c.program_id === scopedProgram : !c.program_id;
    if (ok && excluded.has(c.id)) ok = false;
    if (ok && c.parent_criterion_id) {
      const parent = byId.get(c.parent_criterion_id);
      if (parent) ok = isApplicable(parent);
    }

    visiting.delete(c.id);
    memo.set(c.id, ok);
    return ok;
  };

  return criteria.filter(isApplicable);
}

/**
 * Leaf criteria (criteria with no applicable children) for the given program.
 * Evidence is uploaded against leaf criteria only.
 */
export function getLeafCriteriaForProgram<T extends AccreditationCriterion>(
  criteria: T[],
  programId: string | null | undefined,
  exclusions?: ExclusionMap | Set<string> | null
): T[] {
  const applicable = filterCriteriaForProgram(criteria, programId, exclusions);
  const parentIds = new Set(applicable.map((c) => c.parent_criterion_id).filter(Boolean) as string[]);
  return applicable.filter((c) => !parentIds.has(c.id));
}

/** True when a Supabase/PostgREST error means the exclusions table has not been created yet. */
export function isMissingTableError(err: { code?: string; message?: string } | null | undefined): boolean {
  if (!err) return false;
  const msg = (err.message || '').toLowerCase();
  return (
    err.code === '42P01' ||
    err.code === 'PGRST205' ||
    (msg.includes('program_criterion_exclusions') && (msg.includes('does not exist') || msg.includes('could not find')))
  );
}

/**
 * Loads every program's hidden shared criteria into a Map.
 * Gracefully returns an empty map (and tableMissing = true) if the V8 migration
 * has not been applied yet, so the rest of the system keeps working.
 */
export async function loadExclusionMap(
  supabase: SupabaseClient
): Promise<{ map: ExclusionMap; tableMissing: boolean }> {
  const map: ExclusionMap = new Map();
  try {
    const { data, error } = await supabase
      .from('program_criterion_exclusions')
      .select('program_id, criterion_id');

    if (error) {
      return { map, tableMissing: isMissingTableError(error) };
    }

    (data || []).forEach((row: { program_id: string; criterion_id: string }) => {
      if (!map.has(row.program_id)) map.set(row.program_id, new Set());
      map.get(row.program_id)!.add(row.criterion_id);
    });
    return { map, tableMissing: false };
  } catch {
    return { map, tableMissing: true };
  }
}

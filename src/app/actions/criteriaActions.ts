'use server';

import { createClient as createServiceClient } from '@supabase/supabase-js';
import { isMissingTableError } from '@/lib/program-criteria';

function getServiceClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

const MIGRATION_HINT =
  'The program criteria table is not set up yet. Run supabase/migrations/MIGRATION_V8_PROGRAM_SPECIFIC_CRITERIA.sql in the Supabase SQL Editor, then try again.';

/**
 * Hides (or un-hides) a SHARED criterion for one program.
 * Example: hide "Laboratory Manual (COSC1021 - Software Engineering 1)" for BSP.
 */
export async function setCriterionHiddenForProgram(params: {
  programId: string;
  criterionId: string;
  hidden: boolean;
  userId?: string;
}): Promise<{ success: boolean; error?: string; tableMissing?: boolean }> {
  try {
    const supabase = getServiceClient();
    const { programId, criterionId, hidden, userId } = params;

    if (!programId || !criterionId) {
      return { success: false, error: 'Program and criterion are required.' };
    }

    const { data: crit, error: critErr } = await supabase
      .from('accreditation_criteria')
      .select('id, code, program_id')
      .eq('id', criterionId)
      .maybeSingle();

    if (critErr) return { success: false, error: critErr.message };
    if (!crit) return { success: false, error: 'Criterion not found.' };
    if (crit.program_id) {
      return {
        success: false,
        error: `[${crit.code}] is already program-specific. Only shared criteria can be hidden — delete it instead if it no longer applies.`,
      };
    }

    if (hidden) {
      const { error } = await supabase
        .from('program_criterion_exclusions')
        .upsert(
          { program_id: programId, criterion_id: criterionId, created_by: userId || null },
          { onConflict: 'program_id,criterion_id' }
        );
      if (error) {
        if (isMissingTableError(error)) return { success: false, error: MIGRATION_HINT, tableMissing: true };
        return { success: false, error: error.message };
      }
    } else {
      const { error } = await supabase
        .from('program_criterion_exclusions')
        .delete()
        .eq('program_id', programId)
        .eq('criterion_id', criterionId);
      if (error) {
        if (isMissingTableError(error)) return { success: false, error: MIGRATION_HINT, tableMissing: true };
        return { success: false, error: error.message };
      }
    }

    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}


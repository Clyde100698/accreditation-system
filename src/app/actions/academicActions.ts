'use server';

import { createClient as createServiceClient } from '@supabase/supabase-js';
import { Department, Program } from '@/lib/types';

function getServiceClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export interface SaveDepartmentParams {
  id?: string;
  name: string;
  code: string;
  institution_id?: string;
}

export interface SaveProgramParams {
  id?: string;
  name: string;
  code: string;
  department_id: string;
  is_accreditation_active?: boolean;
}

/**
 * Creates or updates a Department using the Supabase Service Role client.
 * Bypasses client-side RLS limitations while strictly validating unique constraints.
 */
export async function saveDepartment(params: SaveDepartmentParams): Promise<{
  success: boolean;
  data?: Department;
  error?: string;
}> {
  try {
    const supabase = getServiceClient();
    const trimmedCode = params.code.trim().toUpperCase();
    const trimmedName = params.name.trim();

    if (!trimmedName || !trimmedCode) {
      return { success: false, error: 'Department name and code are required.' };
    }

    // Resolve institution_id if not provided
    let instId = params.institution_id;
    if (!instId) {
      const { data: instList } = await supabase.from('institutions').select('id').limit(1);
      instId = instList?.[0]?.id;
    }
    if (!instId) {
      return { success: false, error: 'No parent institution found in the database.' };
    }

    // Check duplicate code
    const { data: existingCodes } = await supabase
      .from('departments')
      .select('id, name, code')
      .ilike('code', trimmedCode);

    const dupCode = existingCodes?.find((d) => d.id !== params.id);
    if (dupCode) {
      return {
        success: false,
        error: `Department code "${trimmedCode}" already exists (${dupCode.name}).`,
      };
    }

    // Check duplicate name
    const { data: existingNames } = await supabase
      .from('departments')
      .select('id, name, code')
      .ilike('name', trimmedName);

    const dupName = existingNames?.find((d) => d.id !== params.id);
    if (dupName) {
      return {
        success: false,
        error: `Department name "${trimmedName}" already exists with code [${dupName.code}].`,
      };
    }

    if (params.id) {
      // Update
      const { data, error } = await supabase
        .from('departments')
        .update({
          name: trimmedName,
          code: trimmedCode,
          institution_id: instId,
        })
        .eq('id', params.id)
        .select()
        .single();

      if (error) return { success: false, error: error.message };
      return { success: true, data: data as Department };
    } else {
      // Insert
      const { data, error } = await supabase
        .from('departments')
        .insert({
          name: trimmedName,
          code: trimmedCode,
          institution_id: instId,
        })
        .select()
        .single();

      if (error) return { success: false, error: error.message };
      return { success: true, data: data as Department };
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { success: false, error: message };
  }
}

/**
 * Deletes a Department after verifying no child programs exist.
 */
export async function deleteDepartment(deptId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const supabase = getServiceClient();

    // Check child programs
    const { data: progs } = await supabase
      .from('programs')
      .select('id, name, code')
      .eq('department_id', deptId);

    if (progs && progs.length > 0) {
      return {
        success: false,
        error: `Cannot delete department because it still contains ${progs.length} program(s). Delete or reassign programs first.`,
      };
    }

    const { error } = await supabase.from('departments').delete().eq('id', deptId);
    if (error) return { success: false, error: error.message };

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { success: false, error: message };
  }
}

/**
 * Creates or updates an Academic Program using the Supabase Service Role client.
 */
export async function saveProgram(params: SaveProgramParams): Promise<{
  success: boolean;
  data?: Program;
  error?: string;
}> {
  try {
    const supabase = getServiceClient();
    const trimmedCode = params.code.trim().toUpperCase();
    const trimmedName = params.name.trim();

    if (!trimmedName || !trimmedCode || !params.department_id) {
      return { success: false, error: 'Program code, full title, and department are required.' };
    }

    // Check duplicate code across the institution
    const { data: existingCodes } = await supabase
      .from('programs')
      .select('id, name, code')
      .ilike('code', trimmedCode);

    const dupCode = existingCodes?.find((p) => p.id !== params.id);
    if (dupCode) {
      return {
        success: false,
        error: `Program code "${trimmedCode}" already exists (${dupCode.name}).`,
      };
    }

    // Check duplicate name within the same department
    const { data: existingNames } = await supabase
      .from('programs')
      .select('id, name, code')
      .eq('department_id', params.department_id)
      .ilike('name', trimmedName);

    const dupName = existingNames?.find((p) => p.id !== params.id);
    if (dupName) {
      return {
        success: false,
        error: `A program named "${trimmedName}" already exists in this department.`,
      };
    }

    if (params.id) {
      // Update
      const { data, error } = await supabase
        .from('programs')
        .update({
          name: trimmedName,
          code: trimmedCode,
          department_id: params.department_id,
        })
        .eq('id', params.id)
        .select()
        .single();

      if (error) return { success: false, error: error.message };
      return { success: true, data: data as Program };
    } else {
      // Insert
      const { data, error } = await supabase
        .from('programs')
        .insert({
          name: trimmedName,
          code: trimmedCode,
          department_id: params.department_id,
          is_accreditation_active: params.is_accreditation_active ?? true,
        })
        .select()
        .single();

      if (error) return { success: false, error: error.message };
      return { success: true, data: data as Program };
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { success: false, error: message };
  }
}

/**
 * Deletes a Program by ID.
 */
export async function deleteProgram(progId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const supabase = getServiceClient();
    const { error } = await supabase.from('programs').delete().eq('id', progId);
    if (error) return { success: false, error: error.message };

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { success: false, error: message };
  }
}

/**
 * Toggles a program's active accreditation scope.
 */
export async function toggleProgramActiveScope(
  progId: string,
  isActive: boolean
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const supabase = getServiceClient();
    const { error } = await supabase
      .from('programs')
      .update({ is_accreditation_active: isActive })
      .eq('id', progId);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { success: false, error: message };
  }
}


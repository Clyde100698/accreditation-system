'use server';

import { createClient as createServiceClient } from '@supabase/supabase-js';
import { AreaAssignment, User, AccreditationArea } from '@/lib/types';

function getServiceClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

/**
 * Fetch all area assignments for a specific program, with fully hydrated User details.
 * Uses service role to bypass client-side RLS join limitations.
 */
export async function getAreaAssignments(programId: string): Promise<{ success: boolean; data?: AreaAssignment[]; error?: string }> {
  try {
    if (!programId) return { success: true, data: [] };
    const supabase = getServiceClient();

    const { data, error } = await supabase
      .from('area_assignments')
      .select('*, users!user_id(*), accreditation_areas(*)')
      .eq('program_id', programId);

    if (error) {
      console.error('[areaActions.getAreaAssignments] Error:', error.message);
      return { success: false, error: error.message };
    }

    const assignments = (data || []) as AreaAssignment[];

    // Self-heal: If any assignment did not join users, look up user directly by user_id
    const missingUserIds = assignments.filter((a) => !a.users && a.user_id).map((a) => a.user_id);
    if (missingUserIds.length > 0) {
      const { data: usersList } = await supabase
        .from('users')
        .select('*')
        .in('id', missingUserIds);

      if (usersList && usersList.length > 0) {
        const userMap = new Map<string, User>(usersList.map((u) => [u.id, u as User]));
        for (const assign of assignments) {
          if (!assign.users && assign.user_id && userMap.has(assign.user_id)) {
            assign.users = userMap.get(assign.user_id);
          }
        }
      }
    }

    return { success: true, data: assignments };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch assignments';
    console.error('[areaActions.getAreaAssignments] Exception:', msg);
    return { success: false, error: msg };
  }
}

/**
 * Fetch all available users in an institution/department for assignment dropdowns.
 */
export async function getDepartmentUsers(departmentId?: string): Promise<{ success: boolean; data?: User[]; error?: string }> {
  try {
    const supabase = getServiceClient();
    let query = supabase.from('users').select('*').order('full_name');
    if (departmentId && departmentId !== 'dept-cict') {
      query = query.eq('department_id', departmentId);
    }

    const { data, error } = await query;
    if (error) {
      console.error('[areaActions.getDepartmentUsers] Error:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true, data: (data || []) as User[] };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch users';
    return { success: false, error: msg };
  }
}

/**
 * Assign a user to an area (Area Chair, Co-Chair, Member).
 */
export async function assignPersonnelAction(payload: {
  areaId: string;
  programId: string;
  userId: string;
  assignmentType: 'area_chair' | 'co_chair' | 'member';
  assignedBy: string;
}): Promise<{ success: boolean; data?: AreaAssignment; error?: string }> {
  try {
    const supabase = getServiceClient();

    // PACUCOA Rule: Only 1 Area Chair per Area
    if (payload.assignmentType === 'area_chair') {
      const { data: existingChair } = await supabase
        .from('area_assignments')
        .select('id')
        .eq('area_id', payload.areaId)
        .eq('program_id', payload.programId)
        .eq('assignment_type', 'area_chair')
        .maybeSingle();

      if (existingChair) {
        // Replace existing chair assignment
        const { data: updated, error: updErr } = await supabase
          .from('area_assignments')
          .update({
            user_id: payload.userId,
            assigned_by: payload.assignedBy,
          })
          .eq('id', existingChair.id)
          .select('*, users!user_id(*)')
          .single();

        if (updErr) return { success: false, error: updErr.message };
        return { success: true, data: updated as AreaAssignment };
      }
    }

    // Insert new assignment
    const { data, error } = await supabase
      .from('area_assignments')
      .insert({
        area_id: payload.areaId,
        program_id: payload.programId,
        user_id: payload.userId,
        assignment_type: payload.assignmentType,
        assigned_by: payload.assignedBy,
      })
      .select('*, users!user_id(*)')
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    // Audit log
    await supabase.from('audit_log').insert({
      user_id: payload.assignedBy,
      action: 'area_assignment_created',
      entity_type: 'area_assignments',
      entity_id: data.id,
      metadata: {
        area_id: payload.areaId,
        user_id: payload.userId,
        assignment_type: payload.assignmentType,
        program_id: payload.programId,
      },
    });

    return { success: true, data: data as AreaAssignment };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to create assignment';
    return { success: false, error: msg };
  }
}

/**
 * Remove an assignment.
 */
export async function removePersonnelAction(payload: {
  assignmentId: string;
  removedBy: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = getServiceClient();

    // Fetch assignment metadata for audit
    const { data: target } = await supabase
      .from('area_assignments')
      .select('*')
      .eq('id', payload.assignmentId)
      .maybeSingle();

    const { error } = await supabase
      .from('area_assignments')
      .delete()
      .eq('id', payload.assignmentId);

    if (error) {
      return { success: false, error: error.message };
    }

    // Audit log
    await supabase.from('audit_log').insert({
      user_id: payload.removedBy,
      action: 'area_assignment_removed',
      entity_type: 'area_assignments',
      entity_id: payload.assignmentId,
      metadata: target || {},
    });

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to remove assignment';
    return { success: false, error: msg };
  }
}

/**
 * Create a new accreditation area (QA only).
 */
export async function createAreaAction(payload: {
  code: string;
  title: string;
  createdBy: string;
}): Promise<{ success: boolean; data?: AccreditationArea; error?: string }> {
  try {
    const supabase = getServiceClient();

    const { data: fw } = await supabase
      .from('accreditation_frameworks')
      .select('id')
      .limit(1)
      .single();

    if (!fw) return { success: false, error: 'No accreditation framework found' };

    const { data, error } = await supabase
      .from('accreditation_areas')
      .insert({
        framework_id: fw.id,
        code: payload.code.trim(),
        title: payload.title.trim(),
      })
      .select('*')
      .single();

    if (error) return { success: false, error: error.message };

    await supabase.from('audit_log').insert({
      user_id: payload.createdBy,
      action: 'area_created',
      entity_type: 'accreditation_areas',
      entity_id: data.id,
      metadata: { code: payload.code, title: payload.title },
    });

    return { success: true, data: data as AccreditationArea };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to create area';
    return { success: false, error: msg };
  }
}


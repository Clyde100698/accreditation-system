import { SupabaseClient } from '@supabase/supabase-js';
import { createClient } from './supabase/client';
import { AuditAction, AuditEntityType } from './types';

export interface AuditEventParams {
  userId?: string | null;
  action: AuditAction | string;
  entityType: AuditEntityType | string;
  entityId?: string | null;
  metadata?: Record<string, unknown>;
}

/**
 * Centrally records an audit log event into the audit_log table.
 * Designed for defensibility and compliance tracing.
 * Supports both:
 * 1) logAuditEvent(supabase, { userId, action, entityType, entityId, metadata })
 * 2) logAuditEvent(action, entityType, entityId, metadata)
 */
export async function logAuditEvent(
  supabaseOrAction: SupabaseClient | AuditAction | string,
  paramsOrEntityType?: AuditEventParams | AuditEntityType | string,
  maybeEntityId?: string | null,
  maybeMetadata?: Record<string, unknown>
): Promise<{ success: boolean; error?: unknown }> {
  try {
    let client: SupabaseClient;
    let userId: string | null = null;
    let action: string;
    let entityType: string;
    let entityId: string | null = null;
    let metadata: Record<string, unknown> = {};

    if (typeof supabaseOrAction === 'object' && 'from' in supabaseOrAction) {
      // Signature 1: (supabase, params)
      client = supabaseOrAction as SupabaseClient;
      const params = paramsOrEntityType as AuditEventParams;
      userId = params.userId || null;
      action = params.action;
      entityType = params.entityType;
      entityId = params.entityId || null;
      metadata = params.metadata || {};
    } else {
      // Signature 2: (action, entityType, entityId, metadata)
      client = createClient();
      action = supabaseOrAction as string;
      entityType = (paramsOrEntityType as string) || 'system';
      entityId = maybeEntityId || null;
      metadata = maybeMetadata || {};

      try {
        const { data: { user } } = await client.auth.getUser();
        if (user) userId = user.id;
      } catch {
        // Continue with null userId
      }
    }

    const { error } = await client.from('audit_log').insert({
      user_id: userId,
      action,
      entity_type: entityType,
      entity_id: entityId,
      metadata,
    });

    if (error) {
      console.error('[AuditLog Error]: Failed to record audit log entry:', error);
      return { success: false, error };
    }

    return { success: true };
  } catch (err) {
    console.error('[AuditLog Exception]:', err);
    return { success: false, error: err };
  }
}

'use server';

import { createClient as createServiceClient } from '@supabase/supabase-js';
import { EvidenceDocument } from '@/lib/types';

function getServiceClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

/**
 * Fetch all evidence documents with full joins (criteria, areas, uploader, verifier).
 * Uses service role to prevent RLS filtering issues.
 */
export async function getEvidenceList(params?: {
  programId?: string;
  role?: string;
  userId?: string;
}): Promise<{ success: boolean; data?: EvidenceDocument[]; error?: string }> {
  try {
    const supabase = getServiceClient();

    let query = supabase
      .from('evidence_documents')
      .select('*, accreditation_criteria(*, accreditation_areas(*)), uploader:uploaded_by(full_name, email), verifier:verified_by(full_name)')
      .order('uploaded_at', { ascending: false });

    if (params?.programId && params.programId !== 'all') {
      query = query.eq('program_id', params.programId);
    }

    const { data, error } = await query;
    if (error) {
      console.error('[evidenceActions.getEvidenceList] Error:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true, data: (data || []) as EvidenceDocument[] };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch evidence';
    return { success: false, error: msg };
  }
}

/**
 * Fetch all pending evidence documents for Review & Approve.
 */
export async function getPendingEvidenceList(params?: {
  programId?: string;
  role?: string;
  userId?: string;
}): Promise<{ success: boolean; data?: EvidenceDocument[]; error?: string }> {
  try {
    const supabase = getServiceClient();

    let query = supabase
      .from('evidence_documents')
      .select('*, programs(*), accreditation_criteria(*, accreditation_areas(code, title)), uploader:uploaded_by(full_name, email)')
      .eq('status', 'pending')
      .order('uploaded_at', { ascending: false });

    if (params?.programId && params?.role !== 'qa') {
      query = query.eq('program_id', params.programId);
    }

    const { data, error } = await query;
    if (error) {
      console.error('[evidenceActions.getPendingEvidenceList] Error:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true, data: (data || []) as EvidenceDocument[] };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch pending evidence';
    return { success: false, error: msg };
  }
}

/**
 * Evaluate (approve or reject) evidence document.
 * Uses service role so that assigned reviewers and chairs can evaluate
 * any document within their assigned scope, even if uploaded by them.
 */
export async function evaluateEvidenceAction(params: {
  docId: string;
  action: 'verified' | 'rejected';
  reviewerId: string;
  reviewerComment?: string;
  metadata?: Record<string, unknown>;
}): Promise<{ success: boolean; data?: EvidenceDocument; error?: string }> {
  try {
    const supabase = getServiceClient();

    // 1. Update status
    let updateRes = await supabase
      .from('evidence_documents')
      .update({
        status: params.action,
        verified_by: params.reviewerId,
        verified_at: new Date().toISOString(),
        reviewer_notes: params.reviewerComment?.trim() || null,
      })
      .eq('id', params.docId)
      .select('*, accreditation_criteria(*, accreditation_areas(*)), uploader:uploaded_by(full_name, email), verifier:verified_by(full_name)')
      .single();

    if (updateRes.error && updateRes.error.message?.includes('reviewer_notes')) {
      updateRes = await supabase
        .from('evidence_documents')
        .update({
          status: params.action,
          verified_by: params.reviewerId,
          verified_at: new Date().toISOString(),
        })
        .eq('id', params.docId)
        .select('*, accreditation_criteria(*, accreditation_areas(*)), uploader:uploaded_by(full_name, email), verifier:verified_by(full_name)')
        .single();
    }

    if (updateRes.error) {
      console.error('[evidenceActions.evaluateEvidenceAction] Error:', updateRes.error.message);
      return { success: false, error: updateRes.error.message };
    }

    // 2. Insert audit log
    await supabase.from('audit_log').insert({
      user_id: params.reviewerId,
      action: params.action === 'verified' ? 'evidence_verified' : 'evidence_rejected',
      entity_type: 'evidence_documents',
      entity_id: params.docId,
      metadata: {
        ...(params.metadata || {}),
        status: params.action,
        reviewer_comment: params.reviewerComment?.trim() || null,
      },
    });

    return { success: true, data: updateRes.data as EvidenceDocument };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to evaluate evidence';
    return { success: false, error: msg };
  }
}

/**
 * Delete or retract an evidence document.
 * Allowed for the uploader (especially for pending uploads), or QA/Admin/Program Head.
 */
export async function deleteEvidenceAction(params: {
  docId: string;
  userId: string;
  userRole?: string;
  reason?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = getServiceClient();

    // 1. Fetch document to check authorization
    const { data: doc, error: fetchErr } = await supabase
      .from('evidence_documents')
      .select('*, accreditation_criteria(code, title)')
      .eq('id', params.docId)
      .single();

    if (fetchErr || !doc) {
      return { success: false, error: 'Document not found' };
    }

    const isOwner = doc.uploaded_by === params.userId;
    const isPrivileged = ['qa', 'system_admin', 'program_head'].includes(params.userRole || '');

    if (!isOwner && !isPrivileged) {
      return { success: false, error: 'You are not authorized to delete this document' };
    }

    // 2. Try to clean up storage if path is known
    try {
      let storagePath: string | null = null;
      if (doc.reviewer_notes) {
        try {
          const parsed = JSON.parse(doc.reviewer_notes);
          if (parsed.storagePath) storagePath = parsed.storagePath;
        } catch {}
      }
      if (!storagePath && doc.file_url) {
        const parts = doc.file_url.split('/public/evidence/');
        if (parts.length > 1) storagePath = decodeURIComponent(parts[1]);
      }
      if (storagePath) {
        await supabase.storage.from('evidence').remove([storagePath]);
      }
    } catch (storageErr) {
      console.warn('[evidenceActions.deleteEvidenceAction] Storage cleanup warning:', storageErr);
    }

    // 3. Delete from DB
    const { error: delErr } = await supabase
      .from('evidence_documents')
      .delete()
      .eq('id', params.docId);

    if (delErr) {
      return { success: false, error: delErr.message };
    }

    // 4. Record in audit trail
    await supabase.from('audit_log').insert({
      user_id: params.userId,
      action: isOwner ? 'evidence_retracted' : 'evidence_deleted',
      entity_type: 'evidence_documents',
      entity_id: params.docId,
      metadata: {
        reason: params.reason || 'User retracted or deleted evidence upload',
        criterion_code: doc.accreditation_criteria?.code,
        criterion_title: doc.accreditation_criteria?.title,
        document_type: doc.document_type,
      },
    });

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to delete evidence';
    return { success: false, error: msg };
  }
}



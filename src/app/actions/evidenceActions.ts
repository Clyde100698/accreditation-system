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


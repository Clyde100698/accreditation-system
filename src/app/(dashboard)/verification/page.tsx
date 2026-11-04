'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { Modal } from '@/components/ui/Modal';
import { DocumentViewer } from '@/components/ui/DocumentViewer';
import { openEvidenceDocument } from '@/lib/evidence-service';
import { showToast } from '@/components/ui/Toast';
import { EvidenceDocument, AreaAssignment } from '@/lib/types';
import { getPendingEvidenceList, evaluateEvidenceAction } from '@/app/actions/evidenceActions';
import {
  CheckCircle,
  XCircle,
  Shield,
  Info,
  Eye,
  Lock,
  ExternalLink,
  MessageSquare,
} from 'lucide-react';


export default function VerificationPage() {
  const { user, loading: authLoading } = useAuth();
  const [pendingEvidence, setPendingEvidence] = useState<EvidenceDocument[]>([]);
  const [userAssignments, setUserAssignments] = useState<AreaAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Track documents viewed in this session (Must-view before approve enforcement)
  const [viewedEvidenceIds, setViewedEvidenceIds] = useState<Set<string>>(new Set());

  // Document Inspection Modal
  const [inspectingDoc, setInspectingDoc] = useState<EvidenceDocument | null>(null);

  // Evaluation Dialog State (Approve / Reject with comments)
  const [evalModalOpen, setEvalModalOpen] = useState(false);
  const [evalTarget, setEvalTarget] = useState<{
    doc: EvidenceDocument;
    action: 'verified' | 'rejected';
  } | null>(null);
  const [reviewerComment, setReviewerComment] = useState('');

  const supabase = createClient();

  const fetchPending = useCallback(async () => {
    if (!user) return;
    
    try {
      // 1. Fetch user's area assignments
      const { data: assignments, error: aErr } = await supabase
        .from('area_assignments')
        .select('*, accreditation_areas(code, title)')
        .eq('user_id', user.id);
      
      if (aErr) throw aErr;

      const assignedAreas = (assignments as AreaAssignment[]) || [];
      setUserAssignments(assignedAreas);

      // 2. Fetch pending evidence via Server Action (bypasses RLS filtering)
      const res = await getPendingEvidenceList({
        programId: user.program_id || undefined,
        role: user.role,
        userId: user.id,
      });

      if (res.success && res.data) {
        let filteredData = res.data;
        if (!['program_head', 'qa'].includes(user.role)) {
          const assignedAreaIds = assignedAreas.map(a => a.area_id);
          filteredData = filteredData.filter(ev => 
            ev.accreditation_criteria?.area_id && assignedAreaIds.includes(ev.accreditation_criteria.area_id)
          );
        }
        setPendingEvidence(filteredData);
      }
    } catch (err: unknown) {
      console.warn('Supabase offline, loading local mock database for verification:', err);
      try {
        const { getMockDatabase } = await import('@/lib/mock-data');
        const db = getMockDatabase();
        setUserAssignments(db.area_assignments.filter(a => a.user_id === user?.id));
        setPendingEvidence(db.evidence_documents.filter(d => d.status === 'pending'));
      } catch (mErr) {
        console.error('Failed to load mock verification data:', mErr);
      }
    } finally {
      setLoading(false);
    }
  }, [user, supabase]);

  useEffect(() => {
    fetchPending();
  }, [fetchPending]);

  // Open Document Preview and record that it was viewed
  const handleOpenPreview = (doc: EvidenceDocument) => {
    setViewedEvidenceIds(prev => new Set(prev).add(doc.id));
    setInspectingDoc(doc);
  };

  // Open Evaluation Modal (Approve or Reject)
  const openEvaluationModal = (doc: EvidenceDocument, action: 'verified' | 'rejected') => {
    // Check if viewed first
    if (!viewedEvidenceIds.has(doc.id)) {
      showToast('error', 'Reviewer Requirement: You must preview the document before making an evaluation.');
      handleOpenPreview(doc);
      return;
    }

    setEvalTarget({ doc, action });
    setReviewerComment('');
    setEvalModalOpen(true);
  };

  // Execute Evaluation (Approve or Reject with comment)
  const handleExecuteEvaluation = async () => {
    if (!user || !evalTarget) return;
    const { doc, action } = evalTarget;

    setActionLoading(doc.id);

    try {
      const res = await evaluateEvidenceAction({
        docId: doc.id,
        action,
        reviewerId: user.id,
        reviewerComment: reviewerComment.trim() || undefined,
        metadata: {
          previous_status: doc.status,
          criterion_code: doc.accreditation_criteria?.code,
          criterion_title: doc.accreditation_criteria?.title,
          document_type: doc.document_type,
          program_id: doc.program_id,
          uploader_id: doc.uploaded_by,
          uploader_name: doc.uploader?.full_name,
        },
      });

      if (!res.success) {
        throw new Error(res.error || 'Failed to update evidence evaluation');
      }

      showToast('success', action === 'verified'
        ? 'Evidence approved! The live readiness score has been updated.'
        : 'Evidence rejected. Revision note logged in audit trail.');
    } catch (err: unknown) {
      showToast('error', err instanceof Error ? err.message : 'Failed to update evidence evaluation');
    } finally {
      setActionLoading(null);
      setEvalModalOpen(false);
      setEvalTarget(null);
      setInspectingDoc(null);
      fetchPending();
    }
  };

  if (authLoading || !user) return <TableSkeleton rows={5} cols={5} />;

  const hasAccess = ['program_head', 'qa'].includes(user.role) || userAssignments.length > 0;
  
  if (!hasAccess && !loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500">
        <Shield className="w-12 h-12 mb-4 text-gray-300" />
        <p className="text-lg font-semibold text-gray-800">Access Restricted</p>
        <p className="text-sm mt-1 max-w-md text-center text-gray-500">
          You must be a Program Chair, QA Admin, or an assigned Area Chair to review and approve evidence.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col min-h-0 overflow-hidden space-y-2.5">
      {/* Header (Shrink-0) */}
      <div className="shrink-0 bg-white border border-gray-200 rounded-xl px-4 py-2.5 flex items-center justify-between">
        <div>
          <h1 className="text-base font-bold text-gray-900 tracking-tight">Review & Approve Evidence</h1>
          <p className="text-xs text-gray-500">
            Evaluate submitted evidence documents. View documents before approving.
          </p>
        </div>
        <div className="text-xs font-semibold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-lg">
          {pendingEvidence.length} Pending
        </div>
      </div>

      {userAssignments.length > 0 && user.role !== 'qa' && (
        <div className="shrink-0 bg-primary/5 border border-primary/20 rounded-xl p-2.5 flex items-center gap-2.5 text-xs">
          <Info className="w-4 h-4 text-primary shrink-0" />
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-gray-900">Your Scope:</span>
            {userAssignments.map(a => (
              <span key={a.id} className="font-mono bg-white border border-primary/20 text-primary font-bold px-1.5 py-0.5 rounded text-[11px]">
                {a.accreditation_areas?.code} ({a.assignment_type.replace('_', ' ')})
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Main Review Table Container */}
      {loading ? (
        <div className="flex-1 min-h-0 bg-white border border-gray-200 rounded-xl p-4">
          <TableSkeleton rows={6} cols={6} />
        </div>
      ) : pendingEvidence.length === 0 ? (
        <div className="flex-1 min-h-0 bg-white rounded-xl border border-gray-200 p-8 text-center flex flex-col items-center justify-center">
          <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-2" />
          <h4 className="text-gray-800 font-semibold text-sm">All caught up!</h4>
          <p className="text-xs text-gray-400 mt-1 max-w-md mx-auto">
            There are no pending submissions awaiting review in your scope. All current evidence has been evaluated.
          </p>
        </div>
      ) : (
        <div className="flex-1 min-h-0 bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col">
          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-auto">
            <table className="w-full text-left">
              <thead className="sticky top-0 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider z-10">
                <tr>
                  <th className="px-3.5 py-2">Criterion & Area</th>
                  <th className="px-3.5 py-2">Uploaded By</th>
                  <th className="px-3.5 py-2">Document Type</th>
                  <th className="px-3.5 py-2">Submission Date</th>
                  <th className="px-3.5 py-2">Inspection Status</th>
                  <th className="px-3.5 py-2 text-right whitespace-nowrap min-w-[200px]">Review Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {pendingEvidence.map((ev) => {
                  const isOwnUpload = ev.uploaded_by === user.id;
                  
                  let canVerify = false;
                  if (user.role === 'qa') {
                     canVerify = true;
                  } else if (!isOwnUpload) {
                     if (user.role === 'program_head') {
                       canVerify = true;
                     } else {
                       canVerify = userAssignments.some(a => a.area_id === ev.accreditation_criteria?.area_id);
                     }
                  }

                  const isViewed = viewedEvidenceIds.has(ev.id);
                  const isProcessing = actionLoading === ev.id;

                  return (
                    <tr key={ev.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="px-3.5 py-2">
                        <p className="font-semibold text-gray-900">
                          {ev.accreditation_criteria ? `[${ev.accreditation_criteria.code}] ${ev.accreditation_criteria.title}` : '—'}
                        </p>
                        <p className="text-[10px] text-gray-500 mt-0.5">
                          {ev.accreditation_criteria?.accreditation_areas?.code || 'No Area Assigned'}
                        </p>
                      </td>

                      <td className="px-3.5 py-2 text-gray-700">
                        {ev.uploader?.full_name || '—'}
                        {isOwnUpload && <span className="ml-1 text-[10px] text-amber-600 font-medium">(You)</span>}
                      </td>

                      <td className="px-3.5 py-2 text-gray-600 font-medium">
                        {ev.document_type || 'General'}
                      </td>

                      <td className="px-3.5 py-2 text-gray-500">
                        {new Date(ev.uploaded_at).toLocaleDateString()}
                      </td>

                      {/* Inspection Status Badge */}
                      <td className="px-3.5 py-2">
                        {isViewed ? (
                          <button
                            type="button"
                            onClick={() => {
                              setViewedEvidenceIds(prev => {
                                const next = new Set(prev);
                                next.delete(ev.id);
                                return next;
                              });
                              showToast('info', 'Status reset to "Must View". Document must be previewed before approving.');
                            }}
                            title="Click to reset back to 'Must View'"
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 hover:border-emerald-300 border border-emerald-200 px-1.5 py-0.5 rounded transition-all cursor-pointer group"
                          >
                            <CheckCircle className="w-3 h-3 text-emerald-600" /> Viewed
                            <span className="text-[10px] text-emerald-600/70 font-normal group-hover:text-emerald-900 ml-0.5">✕</span>
                          </button>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                            <Eye className="w-3 h-3 text-amber-600" /> Must View
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-3.5 py-2 text-right whitespace-nowrap">
                      {ev.programs?.is_accreditation_active === false ? (
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="secondary"
                            className="!px-3 !py-1.5 !text-xs font-medium"
                            onClick={() => handleOpenPreview(ev)}
                          >
                            <Eye className="w-3.5 h-3.5 mr-1" />
                            Preview (Archive)
                          </Button>
                          <span className="text-xs text-gray-500 bg-gray-100 px-2.5 py-1.5 rounded-lg font-medium border border-gray-200 inline-flex items-center gap-1 whitespace-nowrap">
                            <Lock className="w-3 h-3 text-gray-400" />
                            Out of Cycle
                          </span>
                        </div>
                      ) : canVerify ? (
                        <div className="flex items-center justify-end gap-2">
                          {/* View Button */}
                          <Button
                            variant="secondary"
                            className="!px-3 !py-1.5 !text-xs font-medium"
                            onClick={() => handleOpenPreview(ev)}
                          >
                            <Eye className="w-3.5 h-3.5 mr-1" />
                            {isViewed ? 'View Again' : 'Preview Document'}
                          </Button>

                          {/* Approve Button (Gated by Must-View) */}
                          <Button
                            variant="primary"
                            className={`!px-3 !py-1.5 !text-xs font-semibold transition-all ${
                              !isViewed 
                                ? 'opacity-60 cursor-not-allowed bg-gray-400 hover:bg-gray-400' 
                                : '!bg-emerald-600 hover:!bg-emerald-700'
                            }`}
                            onClick={() => openEvaluationModal(ev, 'verified')}
                            loading={isProcessing}
                            title={!isViewed ? 'You must view the document before approving' : 'Approve evidence'}
                          >
                            {!isViewed ? <Lock className="w-3.5 h-3.5 mr-1 text-gray-200" /> : <CheckCircle className="w-3.5 h-3.5 mr-1" />}
                            Approve
                          </Button>

                          {/* Reject Button */}
                          <Button
                            variant="destructive"
                            className="!px-3 !py-1.5 !text-xs font-semibold"
                            onClick={() => openEvaluationModal(ev, 'rejected')}
                            loading={isProcessing}
                          >
                            <XCircle className="w-3.5 h-3.5 mr-1" />
                            Reject
                          </Button>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 px-2.5 py-1.5 rounded-lg font-medium border border-amber-200 whitespace-nowrap">
                          {isOwnUpload ? 'Cannot evaluate own upload' : 'Not assigned to this area'}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    )}

      {/* ========================================================================= */}
      {/* INLINE DOCUMENT INSPECTION MODAL (Fulfills Must-View Requirement)          */}
      {/* ========================================================================= */}
      {inspectingDoc && (
        <Modal
          isOpen={!!inspectingDoc}
          onClose={() => setInspectingDoc(null)}
          title={`Reviewing: [${inspectingDoc.accreditation_criteria?.code}] ${inspectingDoc.document_type || 'Evidence'}`}
          size="7xl"
        >
          <div className="space-y-4">
            {/* Document Details Header */}
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 flex flex-wrap items-center justify-between gap-4 text-xs">
              <div>
                <span className="text-gray-500">Criterion:</span>{' '}
                <strong className="text-gray-900 font-mono">[{inspectingDoc.accreditation_criteria?.code}]</strong>{' '}
                <span className="text-gray-700 font-medium">{inspectingDoc.accreditation_criteria?.title}</span>
              </div>
              <div className="flex items-center gap-4">
                <div>
                  <span className="text-gray-500">Uploader:</span>{' '}
                  <strong className="text-gray-800">{inspectingDoc.uploader?.full_name || 'Faculty'}</strong>
                </div>
                <div>
                  <span className="text-gray-500">Effective:</span>{' '}
                  <strong className="text-gray-800">{inspectingDoc.effective_date || 'N/A'}</strong>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                  Inspection Logged ✓
                </span>
              </div>
            </div>

            {/* Inline Viewer Frame */}
            <DocumentViewer
              fileUrl={inspectingDoc.file_url}
              documentId={inspectingDoc.id}
              title={inspectingDoc.document_type || 'Evidence Document'}
              height="600px"
            />

            {/* Bottom Actions inside inspection modal */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => openEvidenceDocument(inspectingDoc)}
                className="text-xs font-semibold text-primary hover:underline flex items-center gap-1.5"
              >
                <ExternalLink className="w-4 h-4" /> Open file externally
              </button>

              <div className="flex items-center gap-2">
                <Button variant="secondary" onClick={() => setInspectingDoc(null)}>
                  Done Inspecting
                </Button>
                <Button
                  variant="destructive"
                  className="!px-4 !py-2 !text-xs font-semibold"
                  onClick={() => openEvaluationModal(inspectingDoc, 'rejected')}
                >
                  <XCircle className="w-4 h-4 mr-1.5" />
                  Reject Submission
                </Button>
                <Button
                  className="!px-4 !py-2 !text-xs font-semibold !bg-emerald-600 hover:!bg-emerald-700 text-white"
                  onClick={() => openEvaluationModal(inspectingDoc, 'verified')}
                >
                  <CheckCircle className="w-4 h-4 mr-1.5" />
                  Approve for Compliance
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* EVALUATION DECISION & REASON MODAL (Stores comment in audit log)           */}
      {/* ========================================================================= */}
      {evalModalOpen && evalTarget && (
        <Modal
          isOpen={evalModalOpen}
          onClose={() => setEvalModalOpen(false)}
          title={evalTarget.action === 'verified' ? 'Approve Evidence Submission' : 'Reject Evidence Submission'}
          size="lg"
        >
          <div className="space-y-4">
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-xs">
              <p className="font-semibold text-gray-800">
                Criterion: [{evalTarget.doc.accreditation_criteria?.code}] {evalTarget.doc.accreditation_criteria?.title}
              </p>
              <p className="text-gray-500 mt-0.5">
                Uploader: {evalTarget.doc.uploader?.full_name} • Doc Type: {evalTarget.doc.document_type || 'General'}
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-primary" />
                {evalTarget.action === 'verified'
                  ? 'Reviewer Compliance Comment (Optional)'
                  : 'Rejection Reason / Remediation Note (Recommended)'}
              </label>
              <textarea
                rows={3}
                value={reviewerComment}
                onChange={(e) => setReviewerComment(e.target.value)}
                placeholder={
                  evalTarget.action === 'verified'
                    ? 'e.g. Document verified against official faculty credentials; satisfies PACUCOA Level III requirements.'
                    : 'e.g. Document is missing official signature on page 2. Please re-upload signed copy.'
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <p className="text-[11px] text-gray-400 mt-1">
                This comment is permanently preserved in the compliance audit trail for PACUCOA review defensibility.
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
              <Button variant="secondary" onClick={() => setEvalModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant={evalTarget.action === 'verified' ? 'primary' : 'destructive'}
                className={evalTarget.action === 'verified' ? '!bg-emerald-600 hover:!bg-emerald-700' : ''}
                onClick={handleExecuteEvaluation}
                loading={actionLoading === evalTarget.doc.id}
              >
                {evalTarget.action === 'verified' ? 'Confirm Approval' : 'Confirm Rejection'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

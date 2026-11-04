import { createClient } from '@/lib/supabase/client';

export interface EvidenceUrlParams {
  id?: string;
  file_url?: string;
  storage_path?: string | null;
}

/**
 * Resolves a secure, authenticated URL for an evidence document.
 * - For external links (YouTube, SharePoint, Google Drive), returns the original URL.
 * - For Supabase storage files, calls the server route /api/evidence/signed-url
 *   which validates the caller's role (qa, dean, program_head, faculty) and program scope.
 */
export async function getEvidenceSignedUrl(doc: EvidenceUrlParams): Promise<string> {
  const url = doc.file_url || '';

  // If already an external cloud link (not in Supabase storage), return directly
  if (url && !url.includes('/storage/v1/object/')) {
    return url;
  }

  // If already a signed URL with active token, return directly
  if (url.includes('/storage/v1/object/sign/') && url.includes('token=')) {
    return url;
  }

  const supabase = createClient();
  const session = (await supabase.auth.getSession()).data.session;

  const res = await fetch('/api/evidence/signed-url', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
    },
    body: JSON.stringify({
      documentId: doc.id,
      fileUrl: doc.file_url,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `HTTP ${res.status}: Failed to authorize document access`);
  }

  const data = await res.json();
  return data.signedUrl;
}

/**
 * Opens an evidence document securely in a new browser tab.
 */
export async function openEvidenceDocument(doc: EvidenceUrlParams): Promise<void> {
  try {
    const signedUrl = await getEvidenceSignedUrl(doc);
    window.open(signedUrl, '_blank', 'noopener,noreferrer');
  } catch (err: unknown) {
    if (doc.file_url) {
      console.warn('Falling back to direct file_url after signed URL resolution error:', err);
      window.open(doc.file_url, '_blank', 'noopener,noreferrer');
      return;
    }
    alert(err instanceof Error ? err.message : 'Access denied to evidence document.');
  }
}

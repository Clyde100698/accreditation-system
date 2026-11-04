import { NextRequest, NextResponse } from 'next/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function getServiceClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const criterionId = (formData.get('criterionId') as string) || '';
    const programId = (formData.get('programId') as string) || '';
    const userId = (formData.get('userId') as string) || '';
    const documentType = (formData.get('documentType') as string) || 'Document';
    const effectiveDate = (formData.get('effectiveDate') as string) || null;
    const isExternalLink = formData.get('isExternalLink') === 'true';

    if (!criterionId || !programId || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields: criterionId, programId, and userId are required.' },
        { status: 400 }
      );
    }

    const supabase = getServiceClient();

    // -------------------------------------------------------------
    // MODE 1: Video / External Cloud Link
    // -------------------------------------------------------------
    if (isExternalLink) {
      const linkUrl = (formData.get('linkUrl') as string) || '';
      const linkTitle = (formData.get('linkTitle') as string) || 'External Cloud Exhibit';
      const linkType = (formData.get('linkType') as string) || 'other';

      if (!linkUrl) {
        return NextResponse.json({ error: 'Please provide a valid link URL.' }, { status: 400 });
      }

      const notesPayload = JSON.stringify({
        fileName: linkTitle,
        folderName: documentType || 'Video & Cloud Exhibits',
        isExternalLink: true,
        linkType,
        linkUrl,
      });

      const { data: insertedEv, error: insertError } = await supabase
        .from('evidence_documents')
        .insert({
          criterion_id: criterionId,
          uploaded_by: userId,
          program_id: programId,
          file_url: linkUrl,
          document_type: documentType || 'Video Demonstration',
          effective_date: effectiveDate || null,
          status: 'pending',
          version: 1,
          reviewer_notes: notesPayload,
        })
        .select('*')
        .single();

      if (insertError) {
        console.error('[Evidence Upload] Insert error (link):', insertError.message);
        return NextResponse.json({ error: insertError.message }, { status: 500 });
      }

      // Audit Log
      await supabase.from('audit_log').insert({
        user_id: userId,
        action: 'evidence_uploaded',
        entity_type: 'evidence_documents',
        entity_id: insertedEv?.id,
        metadata: {
          criterion_id: criterionId,
          document_type: documentType,
          program_id: programId,
          file_name: linkTitle,
          is_external_link: true,
          link_url: linkUrl,
          link_type: linkType,
          effective_date: effectiveDate,
        },
      });

      return NextResponse.json({ success: true, data: insertedEv });
    }

    // -------------------------------------------------------------
    // MODE 2: Physical File Upload
    // -------------------------------------------------------------
    const file = formData.get('file') as File | null;
    if (!file) {
      return NextResponse.json({ error: 'No file provided for upload.' }, { status: 400 });
    }

    const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `${userId}/${Date.now()}_${sanitizedName}`;

    const buffer = Buffer.from(await file.arrayBuffer());

    // 1. Upload to Supabase Storage with elevated service role (no RLS blocks)
    const { error: storageError } = await supabase.storage
      .from('evidence')
      .upload(storagePath, buffer, {
        contentType: file.type || 'application/octet-stream',
        upsert: true,
      });

    if (storageError) {
      console.error('[Evidence Upload] Storage error:', storageError.message);
      return NextResponse.json({ error: `Storage upload failed: ${storageError.message}` }, { status: 500 });
    }

    // Get public URL
    const fileUrl = supabase.storage.from('evidence').getPublicUrl(storagePath).data.publicUrl;

    const notesPayload = JSON.stringify({
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      storagePath,
      folderName: documentType,
    });

    // 2. Insert into evidence_documents table
    const { data: insertedEv, error: insertError } = await supabase
      .from('evidence_documents')
      .insert({
        criterion_id: criterionId,
        uploaded_by: userId,
        program_id: programId,
        file_url: fileUrl,
        document_type: documentType,
        effective_date: effectiveDate || null,
        status: 'pending',
        version: 1,
        reviewer_notes: notesPayload,
      })
      .select('*')
      .single();

    if (insertError) {
      console.error('[Evidence Upload] Insert error (file):', insertError.message);
      return NextResponse.json({ error: `Database insert failed: ${insertError.message}` }, { status: 500 });
    }

    // 3. Audit Log
    await supabase.from('audit_log').insert({
      user_id: userId,
      action: 'evidence_uploaded',
      entity_type: 'evidence_documents',
      entity_id: insertedEv?.id,
      metadata: {
        criterion_id: criterionId,
        document_type: documentType,
        program_id: programId,
        file_name: file.name,
        file_size: file.size,
        file_url: fileUrl,
        effective_date: effectiveDate,
      },
    });

    return NextResponse.json({ success: true, data: insertedEv });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Internal Server Error during upload';
    console.error('[Evidence Upload] Exception:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

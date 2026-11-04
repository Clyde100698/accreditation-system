import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  return handleSignedUrlRequest(request);
}

export async function POST(request: NextRequest) {
  return handleSignedUrlRequest(request);
}

async function handleSignedUrlRequest(request: NextRequest) {
  try {
    const admin = createAdminClient();

    // 1. Authenticate user via Bearer token or cookies
    let authUser = null;
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const { data: userData, error: userError } = await admin.auth.getUser(token);
      if (!userError && userData?.user) {
        authUser = userData.user;
      }
    }

    if (!authUser) {
      const cookieStore = cookies();
      const supabaseServer = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() {
              return cookieStore.getAll();
            },
            setAll(cookiesToSet) {
              try {
                cookiesToSet.forEach(({ name, value, options }) =>
                  cookieStore.set(name, value, options)
                );
              } catch {
                // Ignore in read-only route
              }
            },
          },
        }
      );
      const { data: cookieUserData } = await supabaseServer.auth.getUser();
      if (cookieUserData?.user) {
        authUser = cookieUserData.user;
      }
    }

    if (!authUser) {
      return NextResponse.json(
        { error: 'Unauthorized: Authentication is required to view evidence files.' },
        { status: 401 }
      );
    }

    // 2. Fetch user profile from public.users table
    const { data: userProfile, error: profileErr } = await admin
      .from('users')
      .select('id, email, role, program_id, department_id, is_active')
      .eq('auth_user_id', authUser.id)
      .single();

    if (profileErr || !userProfile || !userProfile.is_active) {
      return NextResponse.json(
        { error: 'Forbidden: Active user profile not found.' },
        { status: 403 }
      );
    }

    // 3. Enforce Role Allow-list (matches Table 3 and RLS policy)
    // Allowed: qa, dean, program_head, faculty.
    // Explicitly forbidden: system_admin, alumni_rep, student_rep, observer.
    const ALLOWED_ROLES = ['qa', 'dean', 'program_head', 'faculty'];
    if (!ALLOWED_ROLES.includes(userProfile.role)) {
      return NextResponse.json(
        { error: `Forbidden: Role '${userProfile.role}' is not authorized to access accreditation evidence.` },
        { status: 403 }
      );
    }

    // 4. Parse request parameters
    let documentId: string | null = null;
    let fileUrlParam: string | null = null;

    if (request.method === 'POST') {
      try {
        const body = await request.json();
        documentId = body.documentId || body.id || null;
        fileUrlParam = body.fileUrl || body.file_url || null;
      } catch {
        // body might be empty
      }
    } else {
      const searchParams = request.nextUrl.searchParams;
      documentId = searchParams.get('id') || searchParams.get('documentId');
      fileUrlParam = searchParams.get('fileUrl') || searchParams.get('file_url');
    }

    if (!documentId && !fileUrlParam) {
      return NextResponse.json(
        { error: 'Bad Request: documentId or fileUrl must be provided.' },
        { status: 400 }
      );
    }

    // 5. Look up document in database
    let docQuery = admin.from('evidence_documents').select('id, program_id, file_url');
    if (documentId) {
      docQuery = docQuery.eq('id', documentId);
    } else if (fileUrlParam) {
      docQuery = docQuery.eq('file_url', fileUrlParam);
    }

    const { data: doc, error: docErr } = await docQuery.maybeSingle();

    if (docErr || !doc) {
      return NextResponse.json(
        { error: 'Document record not found in repository.' },
        { status: 404 }
      );
    }

    // 6. Enforce Program Scoping (strictly matches RLS policy)
    // - qa: institution-wide access (all programs)
    // - dean: college/department scope (programs matching department_id)
    // - program_head & faculty: assigned program only (matching program_id)
    if (userProfile.role === 'dean') {
      const { data: targetProg } = await admin
        .from('programs')
        .select('department_id')
        .eq('id', doc.program_id)
        .single();

      if (!targetProg || targetProg.department_id !== userProfile.department_id) {
        return NextResponse.json(
          { error: 'Forbidden: Document is outside your college/department scope.' },
          { status: 403 }
        );
      }
    } else if (['program_head', 'faculty'].includes(userProfile.role)) {
      if (doc.program_id !== userProfile.program_id) {
        return NextResponse.json(
          { error: 'Forbidden: Document is outside your assigned academic program scope.' },
          { status: 403 }
        );
      }
    }

    // 7. Check if external link (YouTube, SharePoint, Google Drive, etc.)
    const isSupabaseStorage = doc.file_url?.includes('/storage/v1/object/');
    if (!isSupabaseStorage) {
      return NextResponse.json({
        signedUrl: doc.file_url,
        isExternal: true,
      });
    }

    // 8. Generate temporary signed URL from Supabase Storage
    const docWithStorage = doc as { id: string; program_id: string; file_url: string; storage_path?: string | null };
    let storagePath = docWithStorage.storage_path;
    if (!storagePath) {
      if (doc.file_url.includes('/storage/v1/object/public/evidence/')) {
        storagePath = doc.file_url.split('/storage/v1/object/public/evidence/')[1];
      } else if (doc.file_url.includes('/storage/v1/object/sign/evidence/')) {
        storagePath = doc.file_url.split('/storage/v1/object/sign/evidence/')[1]?.split('?')[0];
      }
    }

    if (!storagePath) {
      return NextResponse.json(
        { error: 'Unable to resolve storage object path for document.' },
        { status: 500 }
      );
    }

    const cleanPath = decodeURIComponent(storagePath);
    // Signed URL valid for 3600 seconds (1 hour)
    const { data: signedData, error: signErr } = await admin.storage
      .from('evidence')
      .createSignedUrl(cleanPath, 3600);

    if (signErr || !signedData?.signedUrl) {
      console.warn('Storage createSignedUrl failed, falling back to stored file URL:', signErr);
      if (doc.file_url) {
        return NextResponse.json({
          signedUrl: doc.file_url,
          isExternal: false,
          fallback: true,
          expiresIn: 3600,
        });
      }
      return NextResponse.json(
        { error: 'Failed to generate signed URL from storage provider.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      signedUrl: signedData.signedUrl,
      isExternal: false,
      expiresIn: 3600,
    });
  } catch (err: unknown) {
    console.error('Signed URL route exception:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

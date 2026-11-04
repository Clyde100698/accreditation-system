import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { calculateReadinessScores } from '@/lib/scoring';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Supabase configuration missing' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { program_id } = await request.json();

    if (!program_id) {
      return NextResponse.json({ error: 'Missing program_id' }, { status: 400 });
    }

    // Fetch criteria and evidence
    const [
      { data: criteria, error: criteriaError },
      { data: evidence, error: evidenceError }
    ] = await Promise.all([
      supabase.from('accreditation_criteria').select('*'),
      supabase.from('evidence_documents').select('*').eq('program_id', program_id)
    ]);

    if (criteriaError) throw criteriaError;
    if (evidenceError) throw evidenceError;

    // Run TS recursive calculation
    const scoreUpdates = calculateReadinessScores(criteria, evidence, program_id);

    // Bulk upsert
    if (scoreUpdates.length > 0) {
      const { error: upsertError } = await supabase
        .from('readiness_scores')
        .upsert(scoreUpdates, { onConflict: 'criterion_id,program_id' });

      if (upsertError) throw upsertError;
    }

    return NextResponse.json({ success: true, count: scoreUpdates.length });
  } catch (err: unknown) {
    console.error('Scoring error:', err);
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 });
  }
}

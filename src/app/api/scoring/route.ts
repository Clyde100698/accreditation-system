import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { calculateReadinessScores } from '@/lib/scoring';
import { filterCriteriaForProgram, loadExclusionMap } from '@/lib/program-criteria';

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

    // Fetch criteria, evidence, and program exclusions
    const [
      { data: criteria, error: criteriaError },
      { data: evidence, error: evidenceError },
      { map: exclusionMap },
    ] = await Promise.all([
      supabase.from('accreditation_criteria').select('*'),
      supabase.from('evidence_documents').select('*').eq('program_id', program_id),
      loadExclusionMap(supabase),
    ]);

    if (criteriaError) throw criteriaError;
    if (evidenceError) throw evidenceError;

    // Filter criteria applicable to this specific program (shared minus hidden, plus program-specific)
    const applicableCriteria = filterCriteriaForProgram(criteria || [], program_id, exclusionMap);

    // Run TS recursive calculation
    const scoreUpdates = calculateReadinessScores(applicableCriteria, evidence || [], program_id);

    // Bulk upsert
    if (scoreUpdates.length > 0) {
      const { error: upsertError } = await supabase
        .from('readiness_scores')
        .upsert(scoreUpdates, { onConflict: 'criterion_id,program_id' });

      if (upsertError) throw upsertError;
    }

    // Clean up scores for criteria that are no longer applicable to this program
    const applicableIds = new Set(applicableCriteria.map((c) => c.id));
    const { data: existingScores } = await supabase
      .from('readiness_scores')
      .select('criterion_id')
      .eq('program_id', program_id);
    const toRemove = (existingScores || [])
      .map((s) => s.criterion_id)
      .filter((cid) => !applicableIds.has(cid));
    if (toRemove.length > 0) {
      await supabase
        .from('readiness_scores')
        .delete()
        .eq('program_id', program_id)
        .in('criterion_id', toRemove);
    }

    return NextResponse.json({ success: true, count: scoreUpdates.length, removed: toRemove.length });
  } catch (err: unknown) {
    console.error('Scoring error:', err);
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 });
  }
}

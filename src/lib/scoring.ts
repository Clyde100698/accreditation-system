import { AccreditationCriterion, EvidenceDocument, ReadinessScore } from './types';

export interface CriterionTreeNode extends AccreditationCriterion {
  children: CriterionTreeNode[];
}

export function buildCriteriaTree(criteria: AccreditationCriterion[]) {
  const map = new Map<string, CriterionTreeNode>();
  const roots: CriterionTreeNode[] = [];

  // Initialize map
  criteria.forEach((c) => {
    map.set(c.id, { ...c, children: [] });
  });

  // Build tree
  criteria.forEach((c) => {
    if (c.parent_criterion_id) {
      const parent = map.get(c.parent_criterion_id);
      const current = map.get(c.id);
      if (parent && current) {
        parent.children.push(current);
      } else if (current) {
        roots.push(current);
      }
    } else {
      const current = map.get(c.id);
      if (current) roots.push(current);
    }
  });

  return { roots, map };
}

export function calculateReadinessScores(
  criteria: AccreditationCriterion[],
  evidence: EvidenceDocument[],
  programId: string
) {
  const { roots } = buildCriteriaTree(criteria);
  const scoreUpdates: Partial<ReadinessScore>[] = [];

  // Helper to calculate score bottom-up
  function traverseAndScore(node: CriterionTreeNode): number {
    let score = 0;
    let status: 'no_evidence' | 'weak' | 'sufficient' = 'no_evidence';

    if (node.children && node.children.length > 0) {
      // It's a parent node. Score is average of children.
      let sum = 0;
      for (const child of node.children) {
        sum += traverseAndScore(child);
      }
      score = sum / node.children.length;

      // Status derivation for parent
      if (score >= 3) status = 'sufficient';
      else if (score > 0) status = 'weak';
      else status = 'no_evidence';
    } else {
      // Leaf node: count VALID documents only.
      // Valid = status 'verified' AND document_type matches expected_document_type
      //         AND effective_date is within the 5-year validity window.
      // Invalid verified docs are NOT counted toward V but remain visible for correction.
      const fiveYearsAgo = new Date();
      fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);

      const validEvidence = evidence.filter((e) => {
        if (e.criterion_id !== node.id) return false;
        if (e.status !== 'verified') return false;
        if (node.expected_document_type && e.document_type !== node.expected_document_type) return false;
        if (e.effective_date && new Date(e.effective_date) < fiveYearsAgo) return false;
        return true;
      });

      const V = validEvidence.length;
      const R = node.required_count || 1;

      if (V === 0) {
        // No valid evidence at all — includes the case where verified docs exist but are invalid
        score = 0;
        status = 'no_evidence';
      } else if (V < R) {
        // Partially met: score in [1, 2) — always below 2, always at least 1
        score = Math.max(1, 2 * V / R);
        status = 'weak';
      } else {
        // Fully met: score in [3, 5]
        score = Math.min(5, 3 + 2 * (V / R - 1));
        status = 'sufficient';
      }
    }

    scoreUpdates.push({
      criterion_id: node.id,
      program_id: programId,
      score: Number(score.toFixed(2)),
      status,
    });

    return score;
  }

  // Run traversal on all roots
  roots.forEach((root) => traverseAndScore(root));

  return scoreUpdates;
}

/**
 * GENERIC WEIGHTED SCORING ALGORITHM
 * 
 * Computes: sum(area.meanScore * area.weight) / sum(area.weight)
 * - Zero framework-specific constants or hardcoded totals.
 * - Works identically whether total weights sum to 30, 45, 100, etc.
 * - If an area has no explicit weight, it gracefully defaults to 1.0.
 */
export function calculateWeightedGrandMean(
  areas: { meanScore: number; weight?: number | null }[]
): number {
  if (!areas || areas.length === 0) return 0;

  const validAreas = areas.filter(a => typeof a.meanScore === 'number' && !isNaN(a.meanScore));
  if (validAreas.length === 0) return 0;

  let totalWeight = 0;
  let weightedSum = 0;

  for (const area of validAreas) {
    const w = typeof area.weight === 'number' && area.weight > 0 ? area.weight : 1.0;
    totalWeight += w;
    weightedSum += area.meanScore * w;
  }

  if (totalWeight <= 0) return 0;
  return Number((weightedSum / totalWeight).toFixed(2));
}

/**
 * GENERIC THRESHOLD CHECKING ALGORITHM
 * 
 * Checks whether every score in the list meets or exceeds minimumThreshold.
 * - Value of minimumThreshold comes directly from database (accreditation_levels.min_score_threshold).
 * - Zero hardcoded levels or numbers.
 */
export function checkThreshold(
  scores: number[],
  minimumThreshold: number | null | undefined
): boolean {
  if (minimumThreshold === null || minimumThreshold === undefined) return true;
  if (!scores || scores.length === 0) return false;
  return scores.every((score) => score >= minimumThreshold);
}

/**
 * GENERIC LEVEL READINESS EVALUATION (single-level, grand mean only)
 *
 * Used for the dashboard "target level" badge.
 * Uses unrounded grandMean for comparison; display value is caller's responsibility.
 */
export function checkLevelReadiness(
  grandMean: number,
  level: { min_score_threshold?: number | null } | null | undefined
): {
  isReady: boolean;
  requiredThreshold: number;
} {
  const threshold = typeof level?.min_score_threshold === 'number' ? level.min_score_threshold : 3.0;
  return {
    isReady: grandMean >= threshold,
    requiredThreshold: threshold,
  };
}

/**
 * GENERIC HIGHEST-LEVEL EVALUATOR — implements the PACUCOA floor rules.
 *
 * Rules are determined by level_number (structural position), not by threshold literals:
 *   level_number == 1 (Candidate):          grandMean >= threshold only. No floor.
 *   level_number == 2 or 3 (Level I, II):   grandMean >= threshold AND every areaMean >= threshold.
 *   level_number >= 4 (Level III, IV):      grandMean >= threshold AND every criterionScore >= threshold.
 *
 * All comparisons use unrounded values. toFixed(2) is for display only.
 * Thresholds come from the accreditation_levels table — no literals in this function.
 *
 * @param grandMean       Unrounded weighted grand mean of all area means.
 * @param areaMeans       Unrounded mean per Area (length == number of Areas).
 * @param criterionScores Unrounded leaf criterion scores (for Level III/IV floor check).
 * @param levels          Rows from accreditation_levels, any order.
 */
export function determineHighestLevel(
  grandMean: number,
  areaMeans: number[],
  criterionScores: number[],
  levels: { level_number: number; label: string; min_score_threshold: number | null }[]
): {
  highestLevel: { level_number: number; label: string; min_score_threshold: number | null } | null;
  failReason: string;
  displayRating: string;
} {
  const displayRating = grandMean.toFixed(2);

  // Evaluate from highest level down; return first that passes all checks.
  const sorted = [...levels].sort((a, b) => b.level_number - a.level_number);

  for (const level of sorted) {
    const threshold = typeof level.min_score_threshold === 'number' ? level.min_score_threshold : 0;

    // Check 1: grand mean (every level)
    if (grandMean < threshold) continue;

    // Check 2: area floor (Level I = level_number 2, Level II = level_number 3)
    if (level.level_number === 2 || level.level_number === 3) {
      if (areaMeans.some(m => m < threshold)) continue;
    }

    // Check 3: criterion floor (Level III+ = level_number >= 4)
    if (level.level_number >= 4) {
      if (criterionScores.some(s => s < threshold)) continue;
    }

    return { highestLevel: level, failReason: '', displayRating };
  }

  return { highestLevel: null, failReason: 'Grand mean below lowest threshold', displayRating };
}

/**
 * Evaluates PACUCOA dual-constraint level & floor status for baseline and simulation displays.
 *
 * Uses thresholds from accreditation_levels (falling back to standard PACUCOA Manual thresholds
 * if levels are not yet loaded):
 *   - level_number 1 (Candidate): overall >= 3.00 (no floor)
 *   - level_number 2 (Level I):   overall >= 3.00 AND no Area mean < 3.00
 *   - level_number 3 (Level II):  overall >= 3.50 AND no Area mean < 3.50
 *   - level_number 4+ (Level III/IV): overall >= 4.00 AND no criterion < 4.00
 */
export function evaluateLevelFloorStatus(
  grandMean: number,
  areaMeans: number[],
  criterionScores: number[],
  levels?: { level_number: number; label: string; min_score_threshold: number | null }[]
): {
  badge: string;
  detail: string;
  tone: 'emerald' | 'amber' | 'red';
} {
  const EPS = 1e-6;
  const findThreshold = (lvlNum: number, fallback: number) => {
    const found = levels?.find((l) => l.level_number === lvlNum);
    return typeof found?.min_score_threshold === 'number' ? found.min_score_threshold : fallback;
  };

  const candT = findThreshold(1, 3.0);
  const l1T = findThreshold(2, 3.0);
  const l2T = findThreshold(3, 3.5);
  const l3T = findThreshold(4, 4.0);

  const totalAreas = areaMeans.length;
  const areasBelowL1 = areaMeans.filter((m) => m + EPS < l1T).length;
  const areasBelowL2 = areaMeans.filter((m) => m + EPS < l2T).length;
  const criteriaBelowL3 = criterionScores.filter((s) => s + EPS < l3T).length;

  if (totalAreas === 0 || grandMean + EPS < candT) {
    return {
      badge: `Below Candidate threshold (< ${candT.toFixed(2)})`,
      detail: `Overall ${grandMean.toFixed(2)} is below the ${candT.toFixed(2)} minimum`,
      tone: 'red',
    };
  }

  if (areasBelowL1 > 0) {
    return {
      badge: 'Candidate met · Level I area floor pending',
      detail: `Overall ≥ ${candT.toFixed(2)} met · ${areasBelowL1} of ${totalAreas} Areas below ${l1T.toFixed(2)} floor`,
      tone: 'amber',
    };
  }

  if (grandMean + EPS < l2T) {
    return {
      badge: 'Level I floors cleared · Level II overall pending',
      detail: `All ${totalAreas} Areas ≥ ${l1T.toFixed(2)} · Overall ${grandMean.toFixed(2)} below ${l2T.toFixed(2)}`,
      tone: 'emerald',
    };
  }

  if (areasBelowL2 > 0) {
    return {
      badge: 'Level I floors cleared · Level II area floor pending',
      detail: `Overall ${grandMean.toFixed(2)} ≥ ${l2T.toFixed(2)} met · ${areasBelowL2} of ${totalAreas} Areas below ${l2T.toFixed(2)} floor`,
      tone: 'amber',
    };
  }

  if (grandMean + EPS < l3T) {
    return {
      badge: 'Level II floors cleared',
      detail: `Overall ≥ ${l2T.toFixed(2)} and all ${totalAreas} Areas ≥ ${l2T.toFixed(2)}`,
      tone: 'emerald',
    };
  }

  if (criteriaBelowL3 > 0) {
    return {
      badge: 'Level II floors cleared · Level III floor pending',
      detail: `Overall ≥ ${l3T.toFixed(2)} met · ${criteriaBelowL3} criteria below ${l3T.toFixed(2)} floor`,
      tone: 'amber',
    };
  }

  return {
    badge: 'Level III / IV numeric floors cleared',
    detail: `Overall ≥ ${l3T.toFixed(2)} and all criteria ≥ ${l3T.toFixed(2)} (supplementary criteria required)`,
    tone: 'emerald',
  };
}

/**
 * GENERIC POOL SELECTION VALIDATOR
 * 
 * Evaluates whether the required number of optional items from a pool are selected.
 * - N comes from a database field (accreditation_levels.required_optional_criteria_count).
 * - If requiredCount is 0, passes automatically.
 */
export function evaluateOptionalCriteriaPool(
  selectedCriterionIds: string[],
  availableOptionalCriteria: { id: string }[],
  requiredCount: number
): {
  isValid: boolean;
  selectedCount: number;
  requiredCount: number;
  remainingNeeded: number;
} {
  const req = Math.max(0, requiredCount || 0);
  const validSelected = selectedCriterionIds.filter((id) =>
    availableOptionalCriteria.some((c) => c.id === id)
  );
  const selectedCount = validSelected.length;
  const remainingNeeded = Math.max(0, req - selectedCount);

  return {
    isValid: selectedCount >= req,
    selectedCount,
    requiredCount: req,
    remainingNeeded,
  };
}

/**
 * GENERIC RATING SCALE MAPPER
 * 
 * Maps a numeric score or percentage to a human-readable label based on the 
 * dynamic JSONB definition stored in `rating_scales.scale_definition`.
 * Zero hardcoded scales in code.
 */
export function mapScoreToRatingScaleLabel(
  score: number,
  scaleDefinition: { value: number; label: string; min_pct?: number; max_pct?: number; description?: string }[]
): string {
  if (!scaleDefinition || scaleDefinition.length === 0) {
    return `${score.toFixed(2)} / 5`;
  }

  // Check for exact value match
  const exact = scaleDefinition.find((item) => item.value === Math.round(score));
  if (exact) return exact.label;

  // Otherwise, match descending by value threshold
  const sorted = [...scaleDefinition].sort((a, b) => b.value - a.value);
  const matched = sorted.find((item) => score >= item.value);
  return matched ? matched.label : `${score.toFixed(2)} / 5`;
}


import { NextRequest, NextResponse } from 'next/server';

// Force Node.js runtime (not Edge)
export const runtime = 'nodejs';

// Keyword map for document type matching
const KEYWORD_MAP: Record<string, string[]> = {
  'Memorandum of Agreement': ['MOA', 'memorandum', 'agreement', 'party', 'signatory'],
  'Diploma/Transcript': ['diploma', 'transcript', 'degree', 'conferred', 'registrar', 'baccalaureate', 'grades', 'records', 'student'],
  'Syllabus': ['syllabus', 'course outline', 'learning outcomes', 'grading', 'course description'],
  'PRC Report': ['PRC', 'professional regulation', 'licensure', 'passing rate', 'board exam'],
  'Tracer Study': ['tracer', 'alumni', 'employment', 'graduate', 'survey'],
  'Inventory Report': ['inventory', 'library', 'resources', 'collection', 'holdings'],
  'Consultation Log': ['consultation', 'advising', 'student', 'schedule', 'log'],
  'Certificate': ['certificate', 'certify', 'awarded', 'completion', 'training'],
  'Curriculum': ['curriculum', 'program of study', 'course structure', 'credit units'],
  'Research Paper': ['research', 'abstract', 'methodology', 'findings', 'references'],
  'Faculty Profile': ['faculty', 'qualifications', 'educational attainment', 'specialization'],
  'Organizational Chart': ['organizational chart', 'structure', 'hierarchy', 'department head'],
};

const DATE_PATTERNS = [
  /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/,
  /(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/,
  /(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2}),?\s+(\d{4})/i,
  /(\d{1,2})\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{4})/i,
];

const MONTHS: Record<string, string> = {
  january: '01', february: '02', march: '03', april: '04',
  may: '05', june: '06', july: '07', august: '08',
  september: '09', october: '10', november: '11', december: '12',
};

function extractDate(text: string): string | null {
  let bestDate: string | null = null;
  let highestIndex = -1;

  for (const pattern of DATE_PATTERNS) {
    // Add global flag to find all matches
    const globalPattern = new RegExp(pattern.source, pattern.flags + (pattern.flags.includes('g') ? '' : 'g'));
    
    let match;
    while ((match = globalPattern.exec(text)) !== null) {
      try {
        let formattedDate = null;
        if (pattern === DATE_PATTERNS[0]) {
          const [, m, d, y] = text.substring(match.index).match(pattern) || [];
          if (y && m && d) formattedDate = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
        } else if (pattern === DATE_PATTERNS[1]) {
          formattedDate = match[0];
        } else if (pattern === DATE_PATTERNS[2]) {
          const [, monthStr, d, y] = text.substring(match.index).match(pattern) || [];
          if (y && monthStr && d) {
            const month = MONTHS[monthStr.toLowerCase()];
            formattedDate = `${y}-${month}-${d.padStart(2, '0')}`;
          }
        } else if (pattern === DATE_PATTERNS[3]) {
          const [, d, monthStr, y] = text.substring(match.index).match(pattern) || [];
          if (y && monthStr && d) {
            const month = MONTHS[monthStr.toLowerCase()];
            formattedDate = `${y}-${month}-${d.padStart(2, '0')}`;
          }
        }
        
        // Keep the date that appears closest to the END of the document
        if (formattedDate && match.index > highestIndex) {
          highestIndex = match.index;
          bestDate = formattedDate;
        }
      } catch {
        continue;
      }
    }
  }
  return bestDate;
}

const STOP_WORDS = new Set([
  'and', 'the', 'of', 'in', 'on', 'for', 'to', 'a', 'an', 'by', 'with', 're', 'new', 'from', 'at',
  'as', 'or', 'dated', 'sample', 'pg', 'article', 'exhibit', 'file', 'tool', 'item', 'list', 'etc'
]);

const DOMAIN_SYNONYMS: Record<string, string[]> = {
  publication: ['publication', 'journal', 'published', 'paper', 'article', 'proceedings', 'record'],
  research: ['research', 'study', 'investigation', 'paper', 'abstract', 'inquiry', 'methodology'],
  certificate: ['certificate', 'certify', 'awarded', 'completion', 'training', 'attendance'],
  transcript: ['transcript', 'diploma', 'degree', 'conferred', 'registrar', 'grades', 'records'],
  syllabus: ['syllabus', 'course', 'curriculum', 'learning outcomes', 'grading', 'outline', 'guide'],
  memorandum: ['memorandum', 'memo', 'agreement', 'moa', 'order', 'circular', 'endorsement'],
  report: ['report', 'evaluation', 'results', 'accomplishment', 'post activity', 'minutes', 'summary'],
  manual: ['manual', 'handbook', 'guidelines', 'policy', 'procedure', 'standard'],
  inventory: ['inventory', 'equipment', 'asset', 'inspection', 'holdings', 'facilities'],
  faculty: ['faculty', 'instructor', 'professor', 'loading', 'teaching', 'personnel', 'staff'],
};

function matchKeywords(text: string, expectedType: string): { matched: boolean; foundKeywords: string[] } {
  const textLower = text.toLowerCase();
  const foundKeywords = new Set<string>();

  if (!expectedType) return { matched: true, foundKeywords: [] };

  const expectedLower = expectedType.toLowerCase();

  // 1. Direct phrase or sub-phrase match
  if (textLower.includes(expectedLower)) {
    foundKeywords.add(expectedType);
  }

  // 2. Exact lookup from legacy KEYWORD_MAP
  const legacyKeywords = KEYWORD_MAP[expectedType] || [];
  for (const kw of legacyKeywords) {
    if (textLower.includes(kw.toLowerCase())) {
      foundKeywords.add(kw);
    }
  }

  // 3. Extract significant tokens from expectedType
  const cleanTokens = expectedLower
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 3 && !STOP_WORDS.has(t));

  for (const token of cleanTokens) {
    if (textLower.includes(token)) {
      foundKeywords.add(token);
    }
  }

  // 4. Synonym and category expansion
  for (const [category, synonyms] of Object.entries(DOMAIN_SYNONYMS)) {
    const isCategoryRelevant = cleanTokens.some((t) => t.includes(category) || category.includes(t)) || expectedLower.includes(category);
    if (isCategoryRelevant) {
      for (const syn of synonyms) {
        if (textLower.includes(syn)) {
          foundKeywords.add(syn);
        }
      }
    }
  }

  const keywordList = Array.from(foundKeywords);
  // Matched if any token matches or if at least 2 relevant domain keywords match
  const matched = keywordList.length >= 1 && (
    cleanTokens.some((t) => keywordList.includes(t)) || keywordList.length >= 2
  );

  return {
    matched,
    foundKeywords: keywordList.slice(0, 5),
  };
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const expectedType = formData.get('expectedType') as string || '';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json({
        matchedType: false,
        suggestedDate: null,
        extractedKeywords: [],
        isScanned: false,
        warning: 'File is not a PDF. Text extraction is only available for PDF files.',
      });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Import packages dynamically
    const { PDFParse } = await import('pdf-parse');
    const Tesseract = await import('tesseract.js');

    const parser = new PDFParse({ data: buffer });
    let text = '';
    let usedOcr = false;

    // Step 1: Try digital text extraction first
    try {
      const textResult = await parser.getText();
      text = textResult.text || '';
      console.log('[PDF Extract] Digital text length:', text.trim().length);
    } catch (e: unknown) {
      const error = e as Error;
      console.log('[PDF Extract] Digital extraction failed:', error.message);
    }

    // Step 2: If no text found, fall back to OCR
    if (text.trim().length < 50) {
      console.log('[PDF Extract] Falling back to OCR...');
      try {
        // Use pdf-parse built-in screenshot feature
        const shotResult = await parser.getScreenshot({ imageBuffer: true, scale: 2.0 });
        
        // OCR the first 2 pages max to keep it fast
        const maxPages = Math.min(shotResult.pages.length, 2);
        const ocrTexts = [];
        
        for (let i = 0; i < maxPages; i++) {
          const pngBuf = shotResult.pages[i].data;
          const result = await Tesseract.recognize(pngBuf as Buffer, 'eng', { logger: () => {} });
          ocrTexts.push(result.data.text);
        }
        
        text = ocrTexts.join('\n');
        usedOcr = true;
        console.log('[PDF Extract] OCR text length:', text.trim().length);
      } catch (ocrError: unknown) {
        const error = ocrError as Error;
        console.error('[PDF Extract] OCR also failed:', error.message);
      }
    }

    await parser.destroy();

    // If still no text after OCR
    if (text.trim().length < 20) {
      return NextResponse.json({
        matchedType: false,
        suggestedDate: null,
        extractedKeywords: [],
        isScanned: true,
        warning: 'Could not extract readable text from this PDF even with OCR. The document type has been pre-filled based on the criterion requirements.',
      });
    }

    // Keyword matching
    const { matched, foundKeywords } = matchKeywords(text, expectedType);

    // Date extraction
    const suggestedDate = extractDate(text);

    return NextResponse.json({
      matchedType: matched,
      suggestedDate,
      extractedKeywords: foundKeywords,
      isScanned: usedOcr,
      warning: !matched && expectedType
        ? `This document doesn't appear to match the expected type "${expectedType}" — please verify.${usedOcr ? ' (Analyzed via OCR — accuracy may vary)' : ''}`
        : null,
      info: matched && usedOcr ? 'Document analyzed via OCR on scanned image.' : null,
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('[PDF Extract] Error:', err?.message);
    return NextResponse.json({
      matchedType: false,
      suggestedDate: null,
      extractedKeywords: [],
      isScanned: false,
      warning: `PDF extraction failed: ${err?.message || 'Unknown error'}. The document type has been pre-filled based on the criterion requirements.`,
    });
  }
}

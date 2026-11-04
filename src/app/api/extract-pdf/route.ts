import { NextRequest, NextResponse } from 'next/server';
import zlib from 'zlib';

// Force Node.js runtime (not Edge)
export const runtime = 'nodejs';

// -------------------------------------------------------------
// Polyfill browser globals required by pdf-parse / pdfjs in Node.js
// Pure JavaScript implementations to avoid native addon Webpack loader conflicts
// -------------------------------------------------------------
function ensurePolyfills() {
  const g = globalThis as any;

  if (typeof g.DOMMatrix === 'undefined') {
    class DOMMatrixPolyfill {
      a = 1; b = 0; c = 0; d = 1; e = 0; f = 0;
      m11 = 1; m12 = 0; m13 = 0; m14 = 0;
      m21 = 0; m22 = 1; m23 = 0; m24 = 0;
      m31 = 0; m32 = 0; m33 = 1; m34 = 0;
      m41 = 0; m42 = 0; m43 = 0; m44 = 1;
      is2D = true;
      isIdentity = true;

      constructor(init?: any) {
        if (Array.isArray(init) && init.length >= 6) {
          this.a = this.m11 = init[0];
          this.b = this.m12 = init[1];
          this.c = this.m21 = init[2];
          this.d = this.m22 = init[3];
          this.e = this.m41 = init[4];
          this.f = this.m42 = init[5];
          this.isIdentity = false;
        }
      }

      scaleSelf(sx = 1, sy = sx) {
        this.a *= sx; this.m11 = this.a;
        this.b *= sx; this.m12 = this.b;
        this.c *= sy; this.m21 = this.c;
        this.d *= sy; this.m22 = this.d;
        this.isIdentity = false;
        return this;
      }

      translateSelf(tx = 0, ty = 0) {
        this.e += this.a * tx + this.c * ty;
        this.f += this.b * tx + this.d * ty;
        this.m41 = this.e;
        this.m42 = this.f;
        this.isIdentity = false;
        return this;
      }

      multiplySelf(other?: any) {
        if (other) {
          const a = this.a * other.a + this.b * other.c;
          const b = this.a * other.b + this.b * other.d;
          const c = this.c * other.a + this.d * other.c;
          const d = this.c * other.b + this.d * other.d;
          const e = this.e * other.a + this.f * other.c + other.e;
          const f = this.e * other.b + this.f * other.d + other.f;
          this.a = this.m11 = a;
          this.b = this.m12 = b;
          this.c = this.m21 = c;
          this.d = this.m22 = d;
          this.e = this.m41 = e;
          this.f = this.m42 = f;
          this.isIdentity = false;
        }
        return this;
      }

      invertSelf() {
        const det = this.a * this.d - this.b * this.c;
        if (det !== 0) {
          const a = this.d / det;
          const b = -this.b / det;
          const c = -this.c / det;
          const d = this.a / det;
          const e = (this.c * this.f - this.d * this.e) / det;
          const f = (this.b * this.e - this.a * this.f) / det;
          this.a = this.m11 = a;
          this.b = this.m12 = b;
          this.c = this.m21 = c;
          this.d = this.m22 = d;
          this.e = this.m41 = e;
          this.f = this.m42 = f;
          this.isIdentity = false;
        }
        return this;
      }
    }
    g.DOMMatrix = DOMMatrixPolyfill;
  }

  if (typeof g.DOMPoint === 'undefined') {
    class DOMPointPolyfill {
      x = 0; y = 0; z = 0; w = 1;
      constructor(x = 0, y = 0, z = 0, w = 1) {
        this.x = x; this.y = y; this.z = z; this.w = w;
      }
    }
    g.DOMPoint = DOMPointPolyfill;
  }

  if (typeof g.ImageData === 'undefined') {
    class ImageDataPolyfill {
      width: number;
      height: number;
      data: Uint8ClampedArray;
      constructor(w: number, h: number) {
        this.width = w;
        this.height = h;
        this.data = new Uint8ClampedArray(w * h * 4);
      }
    }
    g.ImageData = ImageDataPolyfill;
  }

  if (typeof g.Path2D === 'undefined') {
    class Path2DPolyfill {}
    g.Path2D = Path2DPolyfill;
  }
}

// Run immediately on module evaluation
ensurePolyfills();

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
  /(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)\s+(\d{1,2}),?\s+(\d{4})/i,
  /(\d{1,2})\s+(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)\s+(\d{4})/i,
];

const MONTHS: Record<string, string> = {
  january: '01', jan: '01',
  february: '02', feb: '02',
  march: '03', mar: '03',
  april: '04', apr: '04',
  may: '05',
  june: '06', jun: '06',
  july: '07', jul: '07',
  august: '08', aug: '08',
  september: '09', sep: '09', sept: '09',
  october: '10', oct: '10',
  november: '11', nov: '11',
  december: '12', dec: '12',
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

// -------------------------------------------------------------
// Ultra-fast zero-dependency native PDF stream text extractor
// Bypasses missing worker files & canvas issues in cloud serverless (Vercel)
// -------------------------------------------------------------
function unescapePdfString(str: string): string {
  return str
    .replace(/\\\\/g, '\\')
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r')
    .replace(/\\t/g, '\t')
    .replace(/\\b/g, '\b')
    .replace(/\\f/g, '\f')
    .replace(/\\\(/g, '(')
    .replace(/\\\)/g, ')')
    .replace(/\\([0-7]{1,3})/g, (_, oct) => String.fromCharCode(parseInt(oct, 8)));
}

function decodeHexPdfString(hex: string): string {
  try {
    const clean = hex.replace(/\s+/g, '');
    let res = '';
    for (let i = 0; i < clean.length; i += 2) {
      res += String.fromCharCode(parseInt(clean.substring(i, i + 2), 16));
    }
    return res;
  } catch {
    return '';
  }
}

function extractTextDirectFromStreams(buffer: Buffer): string {
  const content = buffer.toString('binary');
  const textPieces: string[] = [];

  const streamRegex = /stream[\r\n]+([\s\S]*?)[\r\n]+endstream/g;
  let match;

  while ((match = streamRegex.exec(content)) !== null) {
    const rawStream = Buffer.from(match[1], 'binary');
    let decompressed: Buffer;
    try {
      decompressed = zlib.inflateSync(rawStream);
    } catch {
      try {
        decompressed = zlib.inflateRawSync(rawStream);
      } catch {
        decompressed = rawStream;
      }
    }

    const streamStr = decompressed.toString('latin1');

    // 1. Literal strings: (text) Tj
    const tjLiteralRegex = /\(((?:[^()\\]|\\.)*)\)\s*Tj/g;
    let tjMatch;
    while ((tjMatch = tjLiteralRegex.exec(streamStr)) !== null) {
      textPieces.push(unescapePdfString(tjMatch[1]));
    }

    // 2. Hex strings: <hex> Tj
    const tjHexRegex = /<([0-9a-fA-F\s]+)>\s*Tj/g;
    let hexMatch;
    while ((hexMatch = tjHexRegex.exec(streamStr)) !== null) {
      textPieces.push(decodeHexPdfString(hexMatch[1]));
    }

    // 3. Array strings with TJ: [(text) 20 (more)] TJ or [<hex> 20 <hex>] TJ
    const arrayRegex = /\[([\s\S]*?)\]\s*TJ/g;
    let arrMatch;
    while ((arrMatch = arrayRegex.exec(streamStr)) !== null) {
      const arrayContent = arrMatch[1];
      const itemRegex = /\(((?:[^()\\]|\\.)*)\)|<([0-9a-fA-F\s]+)>/g;
      let itemMatch;
      const subPieces: string[] = [];
      while ((itemMatch = itemRegex.exec(arrayContent)) !== null) {
        if (itemMatch[1] !== undefined) subPieces.push(unescapePdfString(itemMatch[1]));
        else if (itemMatch[2] !== undefined) subPieces.push(decodeHexPdfString(itemMatch[2]));
      }
      if (subPieces.length > 0) textPieces.push(subPieces.join(''));
    }
  }

  // Also check raw uncompressed text outside streams if any
  const rawTjRegex = /\(((?:[^()\\]|\\.)*)\)\s*Tj/g;
  let rawMatch;
  while ((rawMatch = rawTjRegex.exec(content)) !== null) {
    const s = unescapePdfString(rawMatch[1]);
    if (!textPieces.includes(s)) {
      textPieces.push(s);
    }
  }

  return textPieces.join(' ').replace(/\s+/g, ' ').trim();
}

export async function POST(request: NextRequest) {
  ensurePolyfills();
  let parser: any = null;

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
        isExpiredRecency: false,
        extractedKeywords: [],
        isScanned: false,
        warning: 'File is not a PDF. Text extraction is only available for PDF files.',
      });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    let text = '';
    let usedOcr = false;

    // -------------------------------------------------------------
    // Step 1: Ultra-fast native stream extraction (Works on Vercel & local)
    // -------------------------------------------------------------
    try {
      text = extractTextDirectFromStreams(buffer);
      console.log('[PDF Extract] Direct stream extracted length:', text.trim().length);
    } catch (streamErr) {
      console.warn('[PDF Extract] Direct stream extraction failed:', streamErr);
    }

    // -------------------------------------------------------------
    // Step 2: Fall back to pdf-parse if stream extraction had < 50 chars
    // -------------------------------------------------------------
    if (text.trim().length < 50) {
      try {
        const { PDFParse } = await import('pdf-parse');
        parser = new PDFParse({ data: buffer });
        const textResult = await parser.getText();
        const parsedText = textResult.text || '';
        if (parsedText.trim().length > text.trim().length) {
          text = parsedText;
        }
        console.log('[PDF Extract] pdf-parse extracted length:', text.trim().length);
      } catch (e: unknown) {
        const error = e as Error;
        console.log('[PDF Extract] pdf-parse extraction failed:', error.message);
      }
    }

    // -------------------------------------------------------------
    // Step 3: If still < 50 chars, fall back to OCR (for image-only scanned PDFs)
    // -------------------------------------------------------------
    if (text.trim().length < 50) {
      console.log('[PDF Extract] Falling back to OCR for scanned document...');
      try {
        if (!parser) {
          const { PDFParse } = await import('pdf-parse');
          parser = new PDFParse({ data: buffer });
        }
        const Tesseract = await import('tesseract.js');
        const shotResult = await parser.getScreenshot({ imageBuffer: true, scale: 2.0 });
        
        // OCR the first 2 pages max to keep it fast
        const maxPages = Math.min(shotResult.pages.length, 2);
        const ocrTexts = [];
        
        for (let i = 0; i < maxPages; i++) {
          const pngBuf = shotResult.pages[i].data;
          const result = await Tesseract.recognize(pngBuf as Buffer, 'eng', { logger: () => {} });
          ocrTexts.push(result.data.text);
        }
        
        const ocrCombined = ocrTexts.join('\n');
        if (ocrCombined.trim().length > text.trim().length) {
          text = ocrCombined;
          usedOcr = true;
        }
        console.log('[PDF Extract] OCR text length:', text.trim().length);
      } catch (ocrError: unknown) {
        const error = ocrError as Error;
        console.error('[PDF Extract] OCR also failed:', error.message);
      }
    }

    if (parser) {
      try {
        await parser.destroy();
        parser = null;
      } catch (destroyErr) {
        console.warn('[PDF Extract] Cleanup warning:', destroyErr);
      }
    }

    // If still no text after all tiers
    if (text.trim().length < 20) {
      return NextResponse.json({
        matchedType: false,
        suggestedDate: null,
        isExpiredRecency: false,
        extractedKeywords: [],
        isScanned: true,
        warning: 'Could not extract readable text from this PDF even with OCR. The document type has been pre-filled based on the criterion requirements.',
      });
    }

    // Keyword matching
    const { matched, foundKeywords } = matchKeywords(text, expectedType);

    // Date extraction
    const suggestedDate = extractDate(text);

    let warning = !matched && expectedType
      ? `This document doesn't appear to match the expected type "${expectedType}" — please verify.${usedOcr ? ' (Analyzed via OCR — accuracy may vary)' : ''}`
      : null;

    // Check PACUCOA 5-year recency window
    let isExpiredRecency = false;
    if (suggestedDate) {
      const fiveYearsAgo = new Date();
      fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);
      if (new Date(suggestedDate) < fiveYearsAgo) {
        isExpiredRecency = true;
        const recencyMsg = `Recency Warning: The detected date (${suggestedDate}) is older than 5 years. PACUCOA requires evidence to be within the 5-year recency window to count toward verified compliance scores.`;
        warning = warning ? `${warning} | ${recencyMsg}` : recencyMsg;
      }
    }

    return NextResponse.json({
      matchedType: matched,
      suggestedDate,
      isExpiredRecency,
      extractedKeywords: foundKeywords,
      isScanned: usedOcr,
      warning,
      info: matched && usedOcr ? 'Document analyzed via OCR on scanned image.' : null,
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('[PDF Extract] Error:', err?.message || err);

    if (parser) {
      try {
        await parser.destroy();
      } catch {}
    }

    let friendlyError = 'The PDF format could not be analyzed automatically.';
    if (err?.message?.includes('password') || err?.message?.includes('encrypted')) {
      friendlyError = 'The PDF is password protected or encrypted.';
    } else if (err?.message?.includes('DOMMatrix') || err?.message?.includes('canvas')) {
      friendlyError = 'PDF graphics rendering encountered a canvas issue. Text extraction was skipped.';
    } else if (err?.message) {
      friendlyError = err.message;
    }

    return NextResponse.json({
      matchedType: false,
      suggestedDate: null,
      isExpiredRecency: false,
      extractedKeywords: [],
      isScanned: false,
      warning: `PDF automatic extraction note: ${friendlyError} The document type has been pre-filled based on the criterion requirements.`,
    });
  }
}

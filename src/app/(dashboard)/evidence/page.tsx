'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { showToast } from '@/components/ui/Toast';
import { Modal } from '@/components/ui/Modal';
import { DocumentViewer } from '@/components/ui/DocumentViewer';
import { openEvidenceDocument } from '@/lib/evidence-service';
import { AccreditationCriterion, EvidenceDocument, PdfExtractionResult, Program, AccreditationArea } from '@/lib/types';
import { getEvidenceList } from '@/app/actions/evidenceActions';
import {
  Upload,
  AlertTriangle,
  CheckCircle2,
  Info,
  FolderOpen,
  Folder,
  Search,
  Eye,
  FileText,
  Layers,
  TableProperties,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Video,
  Play,
  Cloud,
  Link2,
  Globe,
  Film,
  Sparkles,
  X,
  RotateCcw,
  Filter,
} from 'lucide-react';

interface ParsedEvidenceMeta {
  fileName: string;
  folderName: string;
  relativePath?: string;
  areaFolder?: string;
  isExternalLink?: boolean;
  linkType?: string;
  linkUrl?: string;
}

function getDocMeta(doc: EvidenceDocument): ParsedEvidenceMeta {
  if (doc.reviewer_notes) {
    try {
      const parsed = JSON.parse(doc.reviewer_notes);
      if (parsed.fileName) {
        return {
          fileName: parsed.fileName,
          folderName: parsed.folderName || doc.document_type || 'General Exhibits',
          relativePath: parsed.relativePath,
          areaFolder: parsed.areaFolder,
          isExternalLink: Boolean(parsed.isExternalLink),
          linkType: parsed.linkType,
          linkUrl: parsed.linkUrl || doc.file_url,
        };
      }
    } catch {
      const prefix = 'Verified against official STIWNU Exhibit: ';
      if (doc.reviewer_notes.includes(prefix)) {
        const fn = doc.reviewer_notes.replace(prefix, '').trim();
        return {
          fileName: fn,
          folderName: doc.document_type || 'General Exhibits',
        };
      }
    }
  }

  if (doc.file_url) {
    const lower = doc.file_url.toLowerCase();
    const isYt = lower.includes('youtube.com') || lower.includes('youtu.be');
    const isGd = lower.includes('drive.google.com');
    const isVid = /\.(mp4|webm|ogg|mov|m4v)($|\?)/i.test(lower);
    if (isYt || isGd || isVid) {
      return {
        fileName: doc.document_type ? `${doc.document_type} (Video Exhibit)` : 'Video / Cloud Exhibit',
        folderName: doc.document_type || 'Video & Media Exhibits',
        isExternalLink: true,
        linkType: isYt ? 'youtube' : isGd ? 'gdrive' : 'video',
        linkUrl: doc.file_url,
      };
    }

    const raw = doc.file_url.split('/').pop()?.split('?')[0] || '';
    const clean = decodeURIComponent(raw).replace(/^\d+_\d+_/, '');
    if (clean) {
      return {
        fileName: clean,
        folderName: doc.document_type || 'General Exhibits',
      };
    }
  }

  return {
    fileName: doc.document_type || 'Evidence Document',
    folderName: doc.document_type || 'General Exhibits',
  };
}

function getFormatBadge(fileName: string, fileUrl?: string) {
  const urlLower = (fileUrl || '').toLowerCase();
  if (urlLower.includes('youtube.com') || urlLower.includes('youtu.be')) {
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-black bg-red-50 text-red-700 border border-red-200 uppercase shrink-0">
        <Play className="w-2.5 h-2.5 fill-red-600" /> YOUTUBE
      </span>
    );
  }
  if (urlLower.includes('drive.google.com')) {
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-black bg-blue-50 text-blue-700 border border-blue-200 uppercase shrink-0">
        <Cloud className="w-2.5 h-2.5" /> G-DRIVE
      </span>
    );
  }
  if (urlLower.includes('onedrive') || urlLower.includes('1drv.ms') || urlLower.includes('sharepoint')) {
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-black bg-sky-50 text-sky-700 border border-sky-200 uppercase shrink-0">
        <Cloud className="w-2.5 h-2.5" /> ONEDRIVE
      </span>
    );
  }
  if (/\.(mp4|webm|ogg|mov|m4v)($|\?)/i.test(urlLower) || /\.(mp4|webm|ogg|mov|m4v)$/i.test(fileName)) {
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-black bg-purple-50 text-purple-700 border border-purple-200 uppercase shrink-0">
        <Video className="w-2.5 h-2.5" /> VIDEO
      </span>
    );
  }
  if (
    (fileUrl?.startsWith('http://') || fileUrl?.startsWith('https://')) &&
    !/\.(pdf|docx|doc|xlsx|xls|png|jpg|jpeg)$/i.test(urlLower) &&
    !urlLower.includes('placehold.co')
  ) {
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-black bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase shrink-0">
        <Link2 className="w-2.5 h-2.5" /> LINK
      </span>
    );
  }

  const ext = fileName.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'pdf':
      return <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-rose-50 text-rose-700 border border-rose-200 uppercase shrink-0">PDF</span>;
    case 'docx':
    case 'doc':
      return <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-blue-50 text-blue-700 border border-blue-200 uppercase shrink-0">DOCX</span>;
    case 'xlsx':
    case 'xls':
      return <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase shrink-0">XLSX</span>;
    case 'png':
    case 'jpg':
    case 'jpeg':
      return <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-purple-50 text-purple-700 border border-purple-200 uppercase shrink-0">IMG</span>;
    default:
      return <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-gray-100 text-gray-700 border border-gray-200 uppercase shrink-0">FILE</span>;
  }
}

export default function EvidencePage() {
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'library' | 'upload'>('library');

  // Foundational data
  const [criteria, setCriteria] = useState<AccreditationCriterion[]>([]);
  const [allEvidence, setAllEvidence] = useState<EvidenceDocument[]>([]);
  const [myEvidence, setMyEvidence] = useState<EvidenceDocument[]>([]);
  const [areas, setAreas] = useState<AccreditationArea[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterArea, setFilterArea] = useState<string>('all');
  const [filterProgram, setFilterProgram] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterDocType, setFilterDocType] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'folder' | 'hierarchy' | 'flat'>('folder');

  // Expanded areas and folders in tree views
  const [expandedAreaIds, setExpandedAreaIds] = useState<Set<string>>(new Set());
  const [collapsedFolderKeys, setCollapsedFolderKeys] = useState<Set<string>>(new Set());

  const toggleFolderCollapse = (key: string) => {
    setCollapsedFolderKeys(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  // Preview Modal
  const [previewDoc, setPreviewDoc] = useState<EvidenceDocument | null>(null);

  // Upload Form state
  const [uploadMode, setUploadMode] = useState<'file' | 'link'>('file');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedCriterion, setSelectedCriterion] = useState('');
  const [documentType, setDocumentType] = useState('');
  const [effectiveDate, setEffectiveDate] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkTitle, setLinkTitle] = useState('');
  const [detectedPlatform, setDetectedPlatform] = useState<string | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [extractionResult, setExtractionResult] = useState<PdfExtractionResult | null>(null);
  const [userAssignedAreaIds, setUserAssignedAreaIds] = useState<string[]>([]);
  const [uploadProgramId, setUploadProgramId] = useState<string>('');

  const supabase = createClient();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('tab') === 'upload') {
        setActiveTab('upload');
      }
    }
  }, []);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    try {
      // 1. Fetch Areas
      const { data: areasData, error: aErr } = await supabase.from('accreditation_areas').select('*').order('display_order');
      if (aErr || !areasData || areasData.length === 0) throw new Error('Areas fetch failed');
      setAreas(areasData as AccreditationArea[]);
      setExpandedAreaIds(new Set(areasData.map(a => a.id)));

      // 2. Fetch Programs
      const { data: progsData } = await supabase.from('programs').select('*').order('code');
      if (progsData) {
        setPrograms(progsData);
        setUploadProgramId(prev => prev || user.program_id || progsData[0]?.id || '');
      }

      // 3. Fetch user's area assignments
      const { data: assignments } = await supabase
        .from('area_assignments')
        .select('area_id')
        .eq('user_id', user.id);
      const assignedAreaIds = (assignments || []).map(a => a.area_id);
      setUserAssignedAreaIds(assignedAreaIds);

      // 4. Fetch criteria
      const criteriaQuery = supabase
        .from('accreditation_criteria')
        .select('*, accreditation_areas(*)')
        .order('code');
      const { data: criteriaData } = await criteriaQuery;
      
      if (criteriaData) {
        const parentIds = new Set((criteriaData as AccreditationCriterion[]).map((c) => c.parent_criterion_id).filter(Boolean));
        // Keep leaf criteria for compliance uploads
        const leafCriteria = (criteriaData as AccreditationCriterion[]).filter(
          (c: AccreditationCriterion) => !parentIds.has(c.id)
        );
        setCriteria(leafCriteria);
      }

      // 5. Fetch ALL evidence for the library via Server Action (bypasses RLS filtering)
      const targetProg = (user.role === 'faculty' || user.role === 'program_head') ? (user.program_id || undefined) : undefined;
      const evRes = await getEvidenceList({
        programId: targetProg,
        role: user.role,
        userId: user.id,
      });

      if (evRes.success && evRes.data) {
        setAllEvidence(evRes.data);
        const mine = evRes.data.filter((e) => e.uploaded_by === user.id);
        setMyEvidence(mine);
      }
    } catch (err: unknown) {
      console.error('Error fetching evidence data:', err);
    } finally {
      setLoading(false);
    }
  }, [user, supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle file selection and PDF extraction
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    setExtractionResult(null);

    if (selectedFile && selectedFile.type === 'application/pdf') {
      const criterion = criteria.find(c => c.id === selectedCriterion);
      const expectedType = criterion?.expected_document_type || '';

      setExtracting(true);
      try {
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('expectedType', expectedType);

        const res = await fetch('/api/extract-pdf', {
          method: 'POST',
          body: formData,
        });

        if (res.ok) {
          const result: PdfExtractionResult = await res.json();
          setExtractionResult(result);
          if (result.matchedType && expectedType) {
            setDocumentType(expectedType);
          }
          if (result.suggestedDate) {
            setEffectiveDate(result.suggestedDate);
          }
        }
      } catch (err) {
        console.error('Extraction error:', err);
      } finally {
        setExtracting(false);
      }
    }
  };

  // Auto-set document type when criterion changes
  useEffect(() => {
    const criterion = criteria.find(c => c.id === selectedCriterion);
    if (criterion && criterion.expected_document_type) {
      setDocumentType(criterion.expected_document_type);
    } else if (!selectedCriterion) {
      setDocumentType('');
    }
  }, [selectedCriterion, criteria]);

  // Handle Link URL change & auto-detection
  const handleLinkUrlChange = (val: string) => {
    setLinkUrl(val);
    const lower = val.toLowerCase().trim();
    if (lower.includes('youtube.com') || lower.includes('youtu.be')) {
      setDetectedPlatform('YouTube Video');
      if (!documentType || documentType === 'Other') setDocumentType('Video Demonstration');
    } else if (lower.includes('drive.google.com')) {
      setDetectedPlatform('Google Drive');
      if (!documentType || documentType === 'Other') setDocumentType('Cloud Archive / Large File');
    } else if (lower.includes('onedrive.live.com') || lower.includes('1drv.ms') || lower.includes('sharepoint.com')) {
      setDetectedPlatform('Microsoft OneDrive / SharePoint');
      if (!documentType || documentType === 'Other') setDocumentType('Cloud Archive / Large File');
    } else if (lower.includes('loom.com') || lower.includes('vimeo.com')) {
      setDetectedPlatform('Video Recording (Loom/Vimeo)');
      if (!documentType || documentType === 'Other') setDocumentType('Video Demonstration');
    } else if (/\.(mp4|webm|ogg|mov|m4v)($|\?)/i.test(lower)) {
      setDetectedPlatform('Direct Video (.mp4)');
      if (!documentType || documentType === 'Other') setDocumentType('Video Demonstration');
    } else if (val.startsWith('http://') || val.startsWith('https://')) {
      setDetectedPlatform('External Web / Cloud Resource');
    } else {
      setDetectedPlatform(null);
    }
  };

  // Submit new evidence (Supports both File Upload & Cloud/Video Link)
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const targetProgramId = user.program_id || uploadProgramId || programs[0]?.id;
    if (!targetProgramId) {
      showToast('error', 'Please select a program for this evidence.');
      return;
    }

    if (!selectedCriterion) {
      showToast('error', 'Please select an accreditation criterion.');
      return;
    }

    setUploading(true);

    try {
      // ---------------------------------------------------------
      // MODE 1: CLOUD LINK / VIDEO URL (No file binary upload needed)
      // ---------------------------------------------------------
      if (uploadMode === 'link') {
        const cleanLink = linkUrl.trim();
        if (!cleanLink || (!cleanLink.startsWith('http://') && !cleanLink.startsWith('https://'))) {
          showToast('error', 'Please enter a valid HTTP/HTTPS link (e.g. YouTube, Google Drive, OneDrive).');
          setUploading(false);
          return;
        }

        const cleanTitle = (linkTitle || '').trim() || documentType || 'Video / Cloud Exhibit';

        let linkType = 'cloud';
        const lower = cleanLink.toLowerCase();
        if (lower.includes('youtube.com') || lower.includes('youtu.be')) linkType = 'youtube';
        else if (lower.includes('drive.google.com')) linkType = 'gdrive';
        else if (lower.includes('onedrive') || lower.includes('1drv.ms') || lower.includes('sharepoint')) linkType = 'onedrive';
        else if (/\.(mp4|webm|ogg|mov|m4v)($|\?)/i.test(lower)) linkType = 'video';

        const formData = new FormData();
        formData.append('criterionId', selectedCriterion);
        formData.append('programId', targetProgramId);
        formData.append('userId', user.id);
        formData.append('documentType', documentType || 'Video Demonstration');
        if (effectiveDate) formData.append('effectiveDate', effectiveDate);
        formData.append('isExternalLink', 'true');
        formData.append('linkUrl', cleanLink);
        formData.append('linkTitle', cleanTitle);
        formData.append('linkType', linkType);

        const res = await fetch('/api/evidence/upload', {
          method: 'POST',
          body: formData,
        });
        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.error || 'Failed to submit external link exhibit');
        }

        showToast('success', 'Video / Cloud exhibit submitted successfully! It will appear as "Pending" until reviewed.');
        setSelectedCriterion('');
        setDocumentType('');
        setEffectiveDate('');
        setLinkUrl('');
        setLinkTitle('');
        setDetectedPlatform(null);
        fetchData();
        setActiveTab('library');
        setUploading(false);
        return;
      }

      // ---------------------------------------------------------
      // MODE 2: LOCAL FILE UPLOAD (Server-side storage upload)
      // ---------------------------------------------------------
      if (!file) {
        showToast('error', 'Please choose a file to upload or switch to the Link mode.');
        setUploading(false);
        return;
      }

      setUploadProgress(25);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('criterionId', selectedCriterion);
      formData.append('programId', targetProgramId);
      formData.append('userId', user.id);
      formData.append('documentType', documentType || 'Document');
      if (effectiveDate) formData.append('effectiveDate', effectiveDate);
      formData.append('isExternalLink', 'false');

      setUploadProgress(60);
      const res = await fetch('/api/evidence/upload', {
        method: 'POST',
        body: formData,
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to upload evidence file');
      }

      setUploadProgress(100);
      showToast('success', 'Evidence uploaded successfully! It will appear as "Pending" until reviewed.');
      setSelectedCriterion('');
      setDocumentType('');
      setEffectiveDate('');
      setFile(null);
      setExtractionResult(null);
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      fetchData();
      setActiveTab('library');
    } catch (err: unknown) {
      console.error('Evidence submission failed:', err);
      const msg = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      showToast('error', `Submission failed: ${msg}`);
    }
    setUploading(false);
    setUploadProgress(0);
  };

  // Toggle area expansion
  const toggleAreaExpand = (areaId: string) => {
    setExpandedAreaIds(prev => {
      const next = new Set(prev);
      if (next.has(areaId)) next.delete(areaId);
      else next.add(areaId);
      return next;
    });
  };

  if (authLoading || !user) return <TableSkeleton rows={5} cols={4} />;

  // Filter evidence
  const filteredEvidence = allEvidence.filter((ev) => {
    const areaId = ev.accreditation_criteria?.area_id;
    if (user.role === 'faculty' && userAssignedAreaIds.length > 0 && areaId && !userAssignedAreaIds.includes(areaId)) {
      return false;
    }
    const matchesArea = filterArea === 'all' || areaId === filterArea;
    const matchesProgram = filterProgram === 'all' || ev.program_id === filterProgram;
    const matchesStatus = filterStatus === 'all' || ev.status === filterStatus;
    const matchesDocType = filterDocType === 'all' || ev.document_type === filterDocType;

    if (!matchesArea || !matchesProgram || !matchesStatus || !matchesDocType) return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const meta = getDocMeta(ev);
    const critCode = ev.accreditation_criteria?.code?.toLowerCase() || '';
    const critTitle = ev.accreditation_criteria?.title?.toLowerCase() || '';
    const docType = ev.document_type?.toLowerCase() || '';
    const uploader = ev.uploader?.full_name?.toLowerCase() || '';
    const fileName = meta.fileName.toLowerCase();
    const folderName = meta.folderName.toLowerCase();

    return critCode.includes(q) || critTitle.includes(q) || docType.includes(q) || uploader.includes(q) || fileName.includes(q) || folderName.includes(q);
  });

  // Unique document types present
  const availableDocTypes = Array.from(new Set(allEvidence.map(e => e.document_type).filter(Boolean))) as string[];

  // Determine visible areas for current user
  const displayAreas = user.role === 'faculty' && userAssignedAreaIds.length > 0
    ? areas.filter((a) => userAssignedAreaIds.includes(a.id))
    : areas;

  // Precompute document counts per area across all current evidence
  const areaDocCounts = new Map<string, number>();
  allEvidence.forEach((ev) => {
    const aid = ev.accreditation_criteria?.area_id;
    if (aid) {
      areaDocCounts.set(aid, (areaDocCounts.get(aid) || 0) + 1);
    }
  });

  const hasActiveFilters = searchQuery.trim() !== '' || filterArea !== 'all' || filterStatus !== 'all' || filterDocType !== 'all' || filterProgram !== 'all';

  const handleResetFilters = () => {
    setSearchQuery('');
    setFilterArea('all');
    setFilterStatus('all');
    setFilterDocType('all');
    setFilterProgram('all');
  };

  const handleSelectArea = (areaId: string) => {
    setFilterArea(areaId);
    if (areaId !== 'all') {
      setExpandedAreaIds((prev) => {
        const next = new Set(prev);
        next.add(areaId);
        return next;
      });
    }
  };

  const handleExpandAll = () => {
    setExpandedAreaIds(new Set(displayAreas.map(a => a.id)));
    setCollapsedFolderKeys(new Set());
  };

  const handleCollapseAll = () => {
    setExpandedAreaIds(new Set());
  };

  // Group filtered evidence by Area -> Folders & Area -> Criteria
  const groupedByArea = displayAreas.map((area) => {
    const areaEvidence = filteredEvidence.filter((ev) => ev.accreditation_criteria?.area_id === area.id);

    // 1. Group by Exhibit Folder (Mirroring BSCS_REAL_DATA)
    const folderMap = new Map<string, { folderName: string; docs: EvidenceDocument[] }>();
    areaEvidence.forEach((doc) => {
      const meta = getDocMeta(doc);
      const fName = meta.folderName || 'General Exhibits';
      if (!folderMap.has(fName)) {
        folderMap.set(fName, { folderName: fName, docs: [] });
      }
      folderMap.get(fName)!.docs.push(doc);
    });
    const folderGroups = Array.from(folderMap.values()).sort((a, b) => a.folderName.localeCompare(b.folderName));
    
    // 2. Group by criterion within this area
    const criteriaMap = new Map<string, { criterion: AccreditationCriterion; docs: EvidenceDocument[] }>();
    areaEvidence.forEach((doc) => {
      const crit = doc.accreditation_criteria;
      if (!crit) return;
      if (!criteriaMap.has(crit.id)) {
        criteriaMap.set(crit.id, { criterion: crit, docs: [] });
      }
      criteriaMap.get(crit.id)!.docs.push(doc);
    });

    return {
      area,
      totalDocs: areaEvidence.length,
      folderGroups,
      criteriaGroups: Array.from(criteriaMap.values()),
    };
  });

  const userProgramObj = programs.find((p) => p.id === (user.program_id || uploadProgramId));
  const isUserProgramInactive = userProgramObj ? userProgramObj.is_accreditation_active === false : false;

  const selectedFilterProg = programs.find((p) => p.id === filterProgram);
  const isFilterProgramInactive = selectedFilterProg ? selectedFilterProg.is_accreditation_active === false : false;

  const canUpload = user && ['faculty', 'program_head', 'qa'].includes(user.role) && !isUserProgramInactive;

  if (authLoading || !user) return <TableSkeleton rows={6} cols={5} />;

  if (['alumni_rep', 'student_rep', 'system_admin'].includes(user.role)) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500">
        <FolderOpen className="w-12 h-12 mb-4 text-gray-300" />
        <p className="text-lg font-semibold text-gray-800">Access Restricted</p>
        <p className="text-sm mt-1 max-w-md text-center text-gray-500">
          {user.role === 'system_admin'
            ? 'System Administrators manage IT infrastructure and user accounts and do not access evidence repository workflows.'
            : 'Representatives have read-only access to readiness summaries only. Access to evidence files is restricted.'}
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col min-h-0 overflow-hidden space-y-2.5">
      {/* Top Header & Tabs (Shrink-0) */}
      <div className="shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white border border-gray-200 rounded-xl px-3.5 py-2">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-primary/10 rounded-lg text-primary">
            <FolderOpen className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-gray-900 tracking-tight">Structured Evidence Repository</h1>
            <p className="text-xs text-gray-500">Arranged by Area, Parameter, and Criterion hierarchy.</p>
          </div>
        </div>

        {/* View switcher tabs */}
        <div className="flex items-center bg-gray-100 p-0.5 rounded-lg border border-gray-200">
          <button
            onClick={() => setActiveTab('library')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold transition-all ${
              activeTab === 'library'
                ? 'bg-white text-gray-900 shadow-xs'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Library ({filteredEvidence.length})
          </button>
          {canUpload ? (
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold transition-all ${
                activeTab === 'upload'
                  ? 'bg-white text-gray-900 shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              Upload New
            </button>
          ) : isUserProgramInactive ? (
            <div className="px-2.5 py-1 text-[11px] text-gray-400 font-medium italic">
              Uploads Locked (Out of Cycle)
            </div>
          ) : null}
        </div>
      </div>

      {/* Archive Warning Banner */}
      {(isUserProgramInactive || (filterProgram !== 'all' && isFilterProgramInactive)) && (
        <div className="shrink-0 bg-gray-100 border border-gray-300 rounded-xl px-3.5 py-2 flex items-center justify-between text-xs text-gray-700">
          <div className="flex items-center gap-2 min-w-0">
            <span className="px-2 py-0.5 rounded bg-gray-200 text-gray-800 font-bold text-[10px] uppercase tracking-wider shrink-0">
              Archive Mode
            </span>
            <span className="truncate">
              Program <strong>{isUserProgramInactive ? userProgramObj?.code : selectedFilterProg?.code}</strong> is currently <strong>out of the active accreditation cycle</strong>. Evidence upload is locked; historical documents are available in read-only mode.
            </span>
          </div>
          <span className="text-[11px] text-gray-500 font-medium shrink-0 ml-2">Modifications Locked</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: EVIDENCE LIBRARY (Searchable, Filterable, Hierarchical View)         */}
      {/* ========================================================================= */}
      {activeTab === 'library' && (
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden space-y-2.5">
          {/* Filter & Area Navigation Bar */}
          <div className="shrink-0 bg-white rounded-xl border border-gray-200 p-2.5 flex flex-col gap-2 shadow-2xs">
            {/* Row 1: Search & Dropdowns + View Mode Segmented Switcher */}
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2">
              {/* Search Box */}
              <div className="relative flex-1 max-w-md">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search file name, criterion, folder, type..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-7 py-1.5 border border-gray-300 rounded-lg text-xs focus:ring-1 focus:ring-primary focus:border-transparent"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-gray-400 hover:text-gray-600 rounded"
                    title="Clear search"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Filter Dropdowns + View Switcher */}
              <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                {/* Program Filter (Admin / QA / Dean) */}
                {['qa', 'dean', 'system_admin'].includes(user.role) && (
                  <select
                    value={filterProgram}
                    onChange={(e) => setFilterProgram(e.target.value)}
                    className="px-2 py-1.5 border border-gray-300 rounded-lg text-xs font-medium focus:ring-1 focus:ring-primary bg-white text-gray-700"
                  >
                    <option value="all">All Programs</option>
                    {programs.map((p) => {
                      const isActive = p.is_accreditation_active !== false;
                      return (
                        <option key={p.id} value={p.id} className={!isActive ? 'text-gray-400 bg-gray-50' : 'text-gray-900'}>
                          {p.code} {!isActive ? '(Out of Cycle)' : ''}
                        </option>
                      );
                    })}
                  </select>
                )}

                {/* Status Filter */}
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-2 py-1.5 border border-gray-300 rounded-lg text-xs font-medium focus:ring-1 focus:ring-primary bg-white text-gray-700"
                >
                  <option value="all">All Status</option>
                  <option value="verified">Approved ({allEvidence.filter(e => e.status === 'verified').length})</option>
                  <option value="pending">Pending ({allEvidence.filter(e => e.status === 'pending').length})</option>
                  <option value="rejected">Rejected ({allEvidence.filter(e => e.status === 'rejected').length})</option>
                </select>

                {/* Doc Type Filter */}
                {availableDocTypes.length > 0 && (
                  <select
                    value={filterDocType}
                    onChange={(e) => setFilterDocType(e.target.value)}
                    className="px-2 py-1.5 border border-gray-300 rounded-lg text-xs font-medium focus:ring-1 focus:ring-primary bg-white text-gray-700 max-w-[130px] truncate"
                  >
                    <option value="all">All Types</option>
                    {availableDocTypes.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                )}

                {/* View Mode Segmented Control */}
                <div className="flex items-center bg-gray-100 p-0.5 rounded-lg border border-gray-200">
                  <button
                    onClick={() => setViewMode('folder')}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold transition-all ${
                      viewMode === 'folder' ? 'bg-white text-primary shadow-xs' : 'text-gray-500 hover:text-gray-900'
                    }`}
                    title="Real-life Exhibit Folders tree mirroring BSCS_REAL_DATA"
                  >
                    <Folder className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">By Folders</span>
                  </button>
                  <button
                    onClick={() => setViewMode('hierarchy')}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold transition-all ${
                      viewMode === 'hierarchy' ? 'bg-white text-primary shadow-xs' : 'text-gray-500 hover:text-gray-900'
                    }`}
                    title="Grouped by PACUCOA Criteria"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">By Criteria</span>
                  </button>
                  <button
                    onClick={() => setViewMode('flat')}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold transition-all ${
                      viewMode === 'flat' ? 'bg-white text-primary shadow-xs' : 'text-gray-500 hover:text-gray-900'
                    }`}
                    title="Flat Table view"
                  >
                    <TableProperties className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Table</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Row 2: Interactive Area Pills Strip */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1 border-t border-gray-100">
              <button
                onClick={() => handleSelectArea('all')}
                className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all shrink-0 ${
                  filterArea === 'all'
                    ? 'bg-primary text-white shadow-xs'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Areas ({allEvidence.length})
              </button>
              {displayAreas.map((a) => {
                const isSelected = filterArea === a.id;
                const count = areaDocCounts.get(a.id) || 0;
                return (
                  <button
                    key={a.id}
                    onClick={() => handleSelectArea(a.id)}
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-gray-900 text-white shadow-xs'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    title={`${a.code}: ${a.title} (${count} documents)`}
                  >
                    <span className="font-bold">{a.code}</span>
                    <span className={`text-[10px] font-bold ${isSelected ? 'text-gray-300' : 'text-gray-500'}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Row 3: Live Count & Quick Action Controls */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-gray-100 text-xs text-gray-500">
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-700">
                  Showing <strong>{filteredEvidence.length}</strong> of {allEvidence.length} documents
                </span>
                {filterArea !== 'all' && (
                  <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold text-[11px]">
                    {displayAreas.find(a => a.id === filterArea)?.code}: {displayAreas.find(a => a.id === filterArea)?.title}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                {viewMode !== 'flat' && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleExpandAll}
                      className="text-[11px] font-semibold text-primary hover:underline"
                    >
                      Expand All
                    </button>
                    <span className="text-gray-300">·</span>
                    <button
                      type="button"
                      onClick={handleCollapseAll}
                      className="text-[11px] font-semibold text-gray-600 hover:underline"
                    >
                      Collapse All
                    </button>
                  </div>
                )}
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-600 hover:text-red-700 hover:underline"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset Filters</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <div className="flex-1 min-h-0 bg-white border border-gray-200 rounded-xl p-4">
              <TableSkeleton rows={6} cols={5} />
            </div>
          ) : filteredEvidence.length === 0 ? (
            <div className="flex-1 min-h-0 bg-white rounded-xl border border-gray-200 p-8 text-center flex flex-col items-center justify-center">
              <FolderOpen className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <h4 className="text-sm font-semibold text-gray-700">No matching evidence documents</h4>
              <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto mb-4">
                No documents match the active search or filters. Start by uploading test evidence.
              </p>
              {canUpload && (
                <Button size="sm" onClick={() => setActiveTab('upload')}>
                  <Upload className="w-3.5 h-3.5 mr-1.5" />
                  Upload Evidence Now
                </Button>
              )}
            </div>
          ) : viewMode === 'flat' ? (
            /* FLAT TABLE VIEW */
            <div className="flex-1 min-h-0 bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col">
              <div className="flex-1 min-h-0 overflow-y-auto overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="sticky top-0 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider z-10">
                    <tr>
                      <th className="px-3.5 py-2">Document / File</th>
                      <th className="px-3.5 py-2">Exhibit Folder</th>
                      <th className="px-3.5 py-2">PACUCOA Criterion</th>
                      <th className="px-3.5 py-2">Effective Date</th>
                      <th className="px-3.5 py-2">Uploaded By</th>
                      <th className="px-3.5 py-2">Status</th>
                      <th className="px-3.5 py-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-xs">
                    {filteredEvidence.map((ev) => {
                      const meta = getDocMeta(ev);
                      return (
                        <tr key={ev.id} className="hover:bg-gray-50/70 transition-colors">
                          <td className="px-3.5 py-2">
                            <div className="flex items-center gap-2">
                              {getFormatBadge(meta.fileName, ev.file_url)}
                              <p className="font-bold text-gray-900 truncate max-w-xs" title={meta.fileName}>
                                {meta.fileName}
                              </p>
                            </div>
                          </td>
                          <td className="px-3.5 py-2">
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded border border-gray-200 truncate max-w-xs" title={meta.folderName}>
                              <Folder className="w-3 h-3 text-amber-500 shrink-0" />
                              <span className="truncate">{meta.folderName}</span>
                            </span>
                          </td>
                          <td className="px-3.5 py-2">
                            <span className="font-mono text-[11px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded mr-1">
                              {ev.accreditation_criteria?.code}
                            </span>
                            <span className="text-gray-800 font-medium truncate">{ev.accreditation_criteria?.title}</span>
                          </td>
                          <td className="px-3.5 py-2 text-gray-500">{ev.effective_date || '—'}</td>
                          <td className="px-3.5 py-2 text-gray-600">{ev.uploader?.full_name || '—'}</td>
                          <td className="px-3.5 py-2"><StatusBadge status={ev.status} /></td>
                          <td className="px-3.5 py-2 text-right">
                            <button
                              onClick={() => setPreviewDoc(ev)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5" /> Preview
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : viewMode === 'folder' ? (
            /* EXHIBIT FOLDERS VIEW (Exact Match to BSCS_REAL_DATA Structure) */
            <div className="flex-1 min-h-0 overflow-y-auto space-y-2.5 pr-0.5">
              {groupedByArea.map(({ area, totalDocs, folderGroups }) => {
                const isAreaExpanded = filterArea === area.id || expandedAreaIds.has(area.id);

                return (
                  <div key={area.id} className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
                    {/* Area Header Accordion */}
                    <div 
                      onClick={() => toggleAreaExpand(area.id)}
                      className="bg-gray-50/90 hover:bg-gray-100/80 cursor-pointer px-3.5 py-2.5 border-b border-gray-200 flex items-center justify-between transition-colors select-none"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-1 rounded bg-white text-gray-600 shadow-2xs border border-gray-200">
                          {isAreaExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </div>
                        <div>
                          <span className="font-bold text-gray-900 text-sm">{area.code}:</span>{' '}
                          <span className="text-gray-700 text-sm font-medium">{area.title}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <span className="text-xs text-gray-500 font-medium hidden sm:inline">
                          {folderGroups.length} {folderGroups.length === 1 ? 'Folder' : 'Folders'}
                        </span>
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                          totalDocs > 0 ? 'bg-primary/10 text-primary' : 'bg-gray-200 text-gray-600'
                        }`}>
                          {totalDocs} {totalDocs === 1 ? 'Document' : 'Documents'}
                        </span>
                      </div>
                    </div>

                    {/* Folders in this Area */}
                    {isAreaExpanded && (
                      <div className="p-3 space-y-2.5">
                        {folderGroups.length === 0 ? (
                          <p className="text-xs text-gray-400 italic py-3 text-center">
                            No evidence uploaded for this Area yet.
                          </p>
                        ) : (
                          folderGroups.map(({ folderName, docs }) => {
                            const folderKey = `${area.id}-${folderName}`;
                            const isFolderExpanded = !collapsedFolderKeys.has(folderKey);

                            return (
                              <div key={folderKey} className="rounded-xl border border-gray-200 bg-gray-50/40 overflow-hidden shadow-2xs">
                                {/* Folder Header */}
                                <div
                                  onClick={() => toggleFolderCollapse(folderKey)}
                                  className="px-3 py-2 bg-gray-100/70 hover:bg-gray-100 cursor-pointer flex items-center justify-between border-b border-gray-200 transition-colors select-none"
                                >
                                  <div className="flex items-center gap-2 min-w-0">
                                    <div className="p-0.5 rounded text-amber-600">
                                      <Folder className="w-4 h-4 fill-amber-500/20" />
                                    </div>
                                    <span className="text-xs font-bold text-gray-800 truncate" title={folderName}>
                                      {folderName}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 shrink-0">
                                    <span className="text-[11px] font-semibold text-gray-500 bg-white px-2 py-0.5 rounded-full border border-gray-200">
                                      {docs.length} {docs.length === 1 ? 'file' : 'files'}
                                    </span>
                                    <div className="text-gray-400">
                                      {isFolderExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                                    </div>
                                  </div>
                                </div>

                                {/* Files Grid inside Folder */}
                                {isFolderExpanded && (
                                  <div className="p-2.5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 bg-white">
                                    {docs.map((doc) => {
                                      const meta = getDocMeta(doc);
                                      return (
                                        <div
                                          key={doc.id}
                                          className="p-2.5 rounded-lg border border-gray-200 bg-white hover:border-primary/40 hover:shadow-xs transition-all flex flex-col justify-between gap-2"
                                        >
                                          <div className="flex items-start gap-2.5 min-w-0">
                                            <div className="mt-0.5 shrink-0">
                                              {getFormatBadge(meta.fileName, doc.file_url)}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                              <p className="text-xs font-bold text-gray-900 leading-snug line-clamp-2 hover:text-primary transition-colors cursor-pointer" onClick={() => setPreviewDoc(doc)} title={meta.fileName}>
                                                {meta.fileName}
                                              </p>
                                              <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                                                <span className="font-mono text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded truncate max-w-full" title={doc.accreditation_criteria?.title}>
                                                  [{doc.accreditation_criteria?.code}] {doc.accreditation_criteria?.title}
                                                </span>
                                              </div>
                                              <p className="text-[10px] text-gray-400 mt-1 truncate">
                                                {doc.uploader?.full_name || 'Faculty'} · {new Date(doc.uploaded_at).toLocaleDateString()}
                                                {doc.effective_date && <> · Eff. {new Date(doc.effective_date).toLocaleDateString()}</>}
                                              </p>
                                            </div>
                                          </div>

                                          <div className="flex items-center justify-between border-t border-gray-100 pt-2 mt-1">
                                            <StatusBadge status={doc.status} />
                                            <div className="flex items-center gap-1.5">
                                              <button
                                                onClick={() => setPreviewDoc(doc)}
                                                className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/20 transition-colors"
                                                title="Preview document inline"
                                              >
                                                <Eye className="w-3.5 h-3.5" />
                                                <span>Preview</span>
                                              </button>
                                              <button
                                                type="button"
                                                onClick={() => openEvidenceDocument(doc)}
                                                className="p-1 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                                                title="Open in new tab / download"
                                              >
                                                <ExternalLink className="w-3.5 h-3.5" />
                                              </button>
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            /* CRITERIA HIERARCHICAL VIEW */
            <div className="flex-1 min-h-0 overflow-y-auto space-y-2.5 pr-0.5">
              {groupedByArea.map(({ area, totalDocs, criteriaGroups }) => {
                const isExpanded = filterArea === area.id || expandedAreaIds.has(area.id);

                return (
                  <div key={area.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    {/* Area Header Accordion */}
                    <div 
                      onClick={() => toggleAreaExpand(area.id)}
                      className="bg-gray-50/90 hover:bg-gray-100/80 cursor-pointer px-3.5 py-2.5 border-b border-gray-200 flex items-center justify-between transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-1 rounded bg-white text-gray-600 shadow-xs border border-gray-200">
                          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </div>
                        <div>
                          <span className="font-bold text-gray-900 text-sm">{area.code}:</span>{' '}
                          <span className="text-gray-700 text-sm font-medium">{area.title}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                          totalDocs > 0 ? 'bg-primary/10 text-primary' : 'bg-gray-200 text-gray-600'
                        }`}>
                          {totalDocs} {totalDocs === 1 ? 'Document' : 'Documents'}
                        </span>
                      </div>
                    </div>

                    {/* Nested Criteria & Evidence */}
                    {isExpanded && (
                      <div className="p-3">
                        {criteriaGroups.length === 0 ? (
                          <p className="text-xs text-gray-400 italic py-3 text-center">
                            No evidence uploaded for criteria under this Area yet.
                          </p>
                        ) : (
                          <div className="space-y-3">
                            {criteriaGroups.map(({ criterion, docs }) => (
                              <div key={criterion.id} className="border-l-2 border-primary/40 pl-3">
                                {/* Criterion Title */}
                                <div className="flex items-center justify-between gap-3 mb-1.5">
                                  <div>
                                    <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded mr-2">
                                      {criterion.code}
                                    </span>
                                    <span className="text-sm font-bold text-gray-900">{criterion.title}</span>
                                    {criterion.expected_document_type && (
                                      <span className="text-xs text-gray-500 ml-2">
                                        (Expected: <strong>{criterion.expected_document_type}</strong>)
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-xs text-gray-400">
                                    Required: {criterion.required_count || 1} • Uploaded: {docs.length}
                                  </span>
                                </div>

                                {/* Attached Evidence Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                  {docs.map((doc) => {
                                    const meta = getDocMeta(doc);
                                    return (
                                      <div
                                        key={doc.id}
                                        className="p-2.5 rounded-lg border border-gray-200 bg-gray-50/50 hover:bg-white hover:border-gray-300 transition-colors flex flex-col justify-between gap-2"
                                      >
                                        <div className="flex items-start gap-2.5 min-w-0">
                                          <div className="mt-0.5 shrink-0">
                                            {getFormatBadge(meta.fileName, doc.file_url)}
                                          </div>
                                          <div className="min-w-0 flex-1">
                                            <p className="text-xs font-bold text-gray-900 truncate hover:text-primary transition-colors cursor-pointer" onClick={() => setPreviewDoc(doc)} title={meta.fileName}>
                                              {meta.fileName}
                                            </p>
                                            <div className="flex items-center gap-1.5 mt-1">
                                              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded truncate max-w-xs" title={meta.folderName}>
                                                <Folder className="w-3 h-3 text-amber-500 shrink-0" />
                                                <span className="truncate">{meta.folderName}</span>
                                              </span>
                                            </div>
                                            <p className="text-[10px] text-gray-400 mt-1 truncate">
                                              {doc.uploader?.full_name || 'Faculty'} · {new Date(doc.uploaded_at).toLocaleDateString()}
                                              {doc.effective_date && <> · Eff. {new Date(doc.effective_date).toLocaleDateString()}</>}
                                            </p>
                                          </div>
                                        </div>

                                        <div className="flex items-center justify-between border-t border-gray-100 pt-2 mt-1">
                                          <StatusBadge status={doc.status} />
                                          <div className="flex items-center gap-1.5">
                                            <button
                                              onClick={() => setPreviewDoc(doc)}
                                              className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/20 transition-colors"
                                              title="Preview file"
                                            >
                                              <Eye className="w-3.5 h-3.5" />
                                              <span>Preview</span>
                                            </button>
                                            <button
                                              type="button"
                                              onClick={() => openEvidenceDocument(doc)}
                                              className="p-1 rounded text-gray-400 hover:text-gray-700"
                                              title="Open link in new tab"
                                            >
                                              <ExternalLink className="w-3.5 h-3.5" />
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: UPLOAD NEW EVIDENCE                                                */}
      {/* ========================================================================= */}
      {activeTab === 'upload' && canUpload && (
        <div className="flex-1 min-h-0 overflow-y-auto space-y-4 pr-0.5">
          {/* Upload Form */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-none">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-gray-100">
              <div>
                <h3 className="text-base font-bold text-gray-900 mb-0.5">Submit Accreditation Evidence</h3>
                <p className="text-xs text-gray-500">
                  Upload local compliance documents or attach external video recordings and large cloud exhibits.
                </p>
              </div>

              {/* Mode Switcher */}
              <div className="flex items-center p-1 bg-gray-100 rounded-lg shrink-0 border border-gray-200">
                <button
                  type="button"
                  onClick={() => setUploadMode('file')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                    uploadMode === 'file'
                      ? 'bg-white text-gray-900 shadow-xs'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Local File</span>
                </button>
                <button
                  type="button"
                  onClick={() => setUploadMode('link')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                    uploadMode === 'link'
                      ? 'bg-primary text-white shadow-xs'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>Video & Cloud Link</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-extrabold ml-0.5 ${uploadMode === 'link' ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary'}`}>
                    NEW
                  </span>
                </button>
              </div>
            </div>

            <form onSubmit={handleUpload} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {(!user.program_id || ['system_admin', 'qa'].includes(user.role)) && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Target Academic Program</label>
                    <select 
                      required 
                      value={uploadProgramId} 
                      onChange={(e) => setUploadProgramId(e.target.value)} 
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent bg-white font-medium"
                    >
                      {programs.map((p) => (
                        <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-400 mt-1">Select the degree program this evidence is submitted for.</p>
                  </div>
                )}

                <div className={user.program_id && !['system_admin', 'qa'].includes(user.role) ? 'md:col-span-2' : ''}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Criterion</label>
                  <select 
                    required 
                    value={selectedCriterion} 
                    onChange={(e) => setSelectedCriterion(e.target.value)} 
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
                  >
                    <option value="">Select a criterion...</option>
                    {user.role === 'faculty' ? (
                      userAssignedAreaIds.length > 0 ? (
                        <optgroup label="Your Assigned Area">
                          {criteria
                            .filter(c => c.area_id && userAssignedAreaIds.includes(c.area_id))
                            .map((c) => (
                              <option key={c.id} value={c.id}>
                                [{c.code}] {c.title}
                              </option>
                            ))}
                        </optgroup>
                      ) : (
                        <option value="" disabled>No criteria assigned to your account</option>
                      )
                    ) : userAssignedAreaIds.length > 0 ? (
                      <>
                        <optgroup label="Your Assigned Area">
                          {criteria
                            .filter(c => c.area_id && userAssignedAreaIds.includes(c.area_id))
                            .map((c) => (
                              <option key={c.id} value={c.id}>
                                [{c.code}] {c.title}
                              </option>
                            ))}
                        </optgroup>
                        <optgroup label="Other Areas (All Criteria)">
                          {criteria
                            .filter(c => !c.area_id || !userAssignedAreaIds.includes(c.area_id))
                            .map((c) => (
                              <option key={c.id} value={c.id}>
                                [{c.code}] {c.title}
                              </option>
                            ))}
                        </optgroup>
                      </>
                    ) : (
                      criteria.map((c) => (
                        <option key={c.id} value={c.id}>[{c.code}] {c.title}</option>
                      ))
                    )}
                  </select>
                  <p className="text-xs text-gray-400 mt-1">
                    {user.role === 'faculty'
                      ? (userAssignedAreaIds.length > 0 
                          ? 'Showing only criteria in your assigned accreditation area.' 
                          : 'You do not have an assigned accreditation area yet. Please contact your QA Administrator.')
                      : (userAssignedAreaIds.length > 0 
                          ? 'Criteria in your assigned area appear first. You can also select from other areas.' 
                          : 'Choose which PACUCOA criterion this document proves compliance for.')}
                  </p>
                </div>
              </div>

              {/* Mode-Specific Input Section */}
              {uploadMode === 'link' ? (
                <div className="bg-blue-50/40 rounded-xl border border-blue-100 p-4 space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
                      <Video className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-gray-900">Video & Cloud Link Submission</h4>
                      <p className="text-[11px] text-gray-500">
                        Provide a shareable URL from <strong>YouTube</strong>, <strong>Google Drive</strong>, <strong>Microsoft OneDrive / SharePoint</strong>, <strong>Vimeo</strong>, <strong>Loom</strong>, or direct video URL. The Document Viewer will embed it automatically for peer evaluators.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                    <div className="md:col-span-2">
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-bold text-gray-700">
                          External Video / Cloud Link URL <span className="text-red-500">*</span>
                        </label>
                        {detectedPlatform && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                            <Sparkles className="w-3 h-3" /> {detectedPlatform}
                          </span>
                        )}
                      </div>
                      <input
                        type="url"
                        required
                        value={linkUrl}
                        onChange={(e) => handleLinkUrlChange(e.target.value)}
                        placeholder="e.g. https://www.youtube.com/watch?v=... or https://drive.google.com/file/d/..."
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-primary focus:border-transparent bg-white shadow-xs"
                      />
                      <div className="flex flex-wrap items-center gap-2 mt-2 text-[10px] text-gray-500">
                        <span className="font-semibold text-gray-600">Supported Platforms:</span>
                        <span className="px-1.5 py-0.5 rounded bg-red-50 text-red-700 font-bold border border-red-200">YouTube</span>
                        <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-bold border border-blue-200">Google Drive</span>
                        <span className="px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 font-bold border border-sky-200">OneDrive / SharePoint</span>
                        <span className="px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 font-bold border border-purple-200">Direct .mp4/.webm</span>
                        <span className="px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 font-bold border border-indigo-200">Loom / Vimeo</span>
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Exhibit Title / Video Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={linkTitle}
                        onChange={(e) => setLinkTitle(e.target.value)}
                        placeholder="e.g. Classroom Teaching Demonstration - CS312 Data Structures"
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-primary focus:border-transparent bg-white shadow-xs"
                      />
                      <p className="text-[10px] text-gray-400 mt-1">This title will appear in the evidence hierarchy tree and accreditation library.</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">File</label>
                    <input 
                      id="file-upload" 
                      type="file" 
                      accept=".pdf,.doc,.docx,.jpg,.png,.xlsx,.xls,.mp4" 
                      required 
                      onChange={handleFileChange} 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 transition-colors" 
                    />
                    <p className="text-xs text-gray-400 mt-1">Accepted formats: PDF, Word, Excel, JPG, PNG, MP4 (max 10MB). For videos or files larger than 10MB, switch to the "Video & Cloud Link" mode above.</p>
                    {extracting && (
                      <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                        <span className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin inline-block" /> Scanning document contents...
                      </p>
                    )}
                  </div>
                </div>
              )}
              
              {/* Extraction Warnings/Hints */}
              {extractionResult && uploadMode === 'file' && (
                <div className={`p-4 rounded-lg text-sm flex gap-3 items-start border ${
                  extractionResult.warning ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-blue-50 text-blue-800 border-blue-200'
                }`}>
                  {extractionResult.warning ? (
                    <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-600" />
                  ) : (
                    <Info className="w-5 h-5 flex-shrink-0 mt-0.5 text-blue-600" />
                  )}
                  <div>
                    <p className="font-semibold">{extractionResult.warning ? 'Heads up — please double-check this document' : 'Document scan complete'}</p>
                    <p className="mt-1">{extractionResult.warning || extractionResult.info || 'The document contents match the expected type.'}</p>
                    {extractionResult.extractedKeywords.length > 0 && !extractionResult.warning && (
                      <p className="text-xs mt-1 text-blue-600 font-semibold">Detected keywords: {extractionResult.extractedKeywords.join(', ')}</p>
                    )}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Document Type
                    {criteria.find(c => c.id === selectedCriterion)?.expected_document_type && (
                      <span className="ml-2 inline-flex items-center text-xs text-primary font-normal bg-primary/10 px-1.5 py-0.5 rounded">
                        Auto-set by QA
                      </span>
                    )}
                  </label>
                  {criteria.find(c => c.id === selectedCriterion)?.expected_document_type && uploadMode === 'file' ? (
                    <div className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-600 font-medium">
                      {documentType}
                    </div>
                  ) : (
                    <select 
                      required 
                      value={documentType} 
                      onChange={(e) => setDocumentType(e.target.value)} 
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
                    >
                      <option value="">Select type...</option>
                      <optgroup label="Video & Media">
                        <option value="Video Demonstration">Video Demonstration</option>
                        <option value="Virtual Laboratory Tour">Virtual Laboratory Tour</option>
                        <option value="Webinar / Symposium Recording">Webinar / Symposium Recording</option>
                        <option value="Oral Defense / Presentation Recording">Oral Defense / Presentation Recording</option>
                        <option value="Cloud Archive / Large File">Cloud Archive / Large File</option>
                      </optgroup>
                      <optgroup label="Academic & Faculty Documents">
                        <option value="Diploma/Transcript">Diploma/Transcript</option>
                        <option value="Inventory Report">Inventory Report</option>
                        <option value="Syllabus">Syllabus</option>
                        <option value="Consultation Log">Consultation Log</option>
                        <option value="PRC Report">PRC Report</option>
                        <option value="Tracer Study">Tracer Study</option>
                        <option value="Certificate">Certificate</option>
                        <option value="Curriculum">Curriculum</option>
                        <option value="Research Paper">Research Paper</option>
                        <option value="Faculty Profile">Faculty Profile</option>
                        <option value="Organizational Chart">Organizational Chart</option>
                        <option value="Other">Other</option>
                      </optgroup>
                    </select>
                  )}
                  <p className="text-xs text-gray-400 mt-1">What kind of document or exhibit is this?</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Effective / Recording Date
                    {extractionResult?.suggestedDate && uploadMode === 'file' && (
                      <span className="ml-2 inline-flex items-center text-xs text-green-600">
                        <CheckCircle2 className="w-3 h-3 mr-1" />Auto-detected
                      </span>
                    )}
                  </label>
                  <input 
                    type="date" 
                    value={effectiveDate} 
                    onChange={(e) => setEffectiveDate(e.target.value)} 
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent" 
                  />
                  <p className="text-xs text-gray-400 mt-1">The date this document was issued, recorded, or last updated.</p>
                </div>
              </div>

              {uploading && (
                <div className="pt-2" role="progressbar" aria-valuenow={uploadProgress} aria-valuemin={0} aria-valuemax={100}>
                  <div className="flex items-center justify-between text-xs font-semibold text-gray-600 mb-1.5">
                    <span>{uploadMode === 'link' ? 'Registering cloud exhibit…' : uploadProgress < 100 ? 'Uploading file…' : 'Saving record…'}</span>
                    <span className="font-mono text-primary">{uploadProgress}%</span>
                  </div>
                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-200 ease-out"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <Button type="submit" loading={uploading} disabled={extracting}>
                  {uploadMode === 'link' ? (
                    <>
                      <Video className="w-4 h-4 mr-2" />
                      Submit Video / Cloud Exhibit
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Evidence
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>

          {/* Personal Uploads List */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Your Recent Uploads</h3>
            {myEvidence.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-8 text-center shadow-sm">
                <FolderOpen className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-gray-700">No uploads yet</p>
                <p className="text-xs text-gray-400 mt-1">Submit your first document using the form above.</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      <th className="px-6 py-3">Criterion</th>
                      <th className="px-6 py-3">Document Type</th>
                      <th className="px-6 py-3">Effective Date</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3">Uploaded</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    {myEvidence.map((ev) => (
                      <tr key={ev.id} className="hover:bg-gray-50/70">
                        <td className="px-6 py-3.5 font-medium text-gray-900">
                          [{ev.accreditation_criteria?.code}] {ev.accreditation_criteria?.title}
                        </td>
                        <td className="px-6 py-3.5 text-gray-600">{ev.document_type || '—'}</td>
                        <td className="px-6 py-3.5 text-gray-600">{ev.effective_date || '—'}</td>
                        <td className="px-6 py-3.5"><StatusBadge status={ev.status} /></td>
                        <td className="px-6 py-3.5 text-gray-500">{new Date(ev.uploaded_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* INLINE DOCUMENT PREVIEW MODAL (Commercial UX Pattern)                      */}
      {/* ========================================================================= */}
      {previewDoc && (() => {
        const docMeta = getDocMeta(previewDoc);
        return (
          <Modal
            isOpen={!!previewDoc}
            onClose={() => setPreviewDoc(null)}
            title={`Document Preview: ${docMeta.fileName}`}
            size="7xl"
          >
            <div className="space-y-4">
              {/* Header details bar */}
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 flex flex-wrap items-center justify-between gap-4 text-xs">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    {getFormatBadge(docMeta.fileName, previewDoc.file_url)}
                    <span className="font-bold text-gray-900 text-sm">{docMeta.fileName}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-gray-600">
                    <span className="inline-flex items-center gap-1 font-medium bg-amber-50 text-amber-800 px-2 py-0.5 rounded border border-amber-200 text-[11px]">
                      <Folder className="w-3 h-3 text-amber-600 shrink-0" />
                      <span>{docMeta.folderName}</span>
                    </span>
                    <span>•</span>
                    <span className="font-mono font-bold text-primary">[{previewDoc.accreditation_criteria?.code}]</span>
                    <span className="font-medium text-gray-800">{previewDoc.accreditation_criteria?.title}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div>
                    <span className="text-gray-500">Uploaded by:</span>{' '}
                    <strong className="text-gray-800">{previewDoc.uploader?.full_name || 'Faculty'}</strong>
                  </div>
                  <div>
                    <span className="text-gray-500">Effective:</span>{' '}
                    <strong className="text-gray-800">{previewDoc.effective_date || 'N/A'}</strong>
                  </div>
                  <StatusBadge status={previewDoc.status} />
                </div>
              </div>

              {/* Embedded Inline Viewer */}
              <DocumentViewer
                fileUrl={previewDoc.file_url}
                documentId={previewDoc.id}
                title={docMeta.fileName}
                height="650px"
              />

              {/* Bottom Actions */}
              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={() => openEvidenceDocument(previewDoc)}
                  className="text-xs font-semibold text-primary hover:underline flex items-center gap-1.5"
                >
                  <ExternalLink className="w-4 h-4" /> Open file in new tab or download
                </button>
                <Button variant="secondary" onClick={() => setPreviewDoc(null)}>
                  Close Preview
                </Button>
              </div>
            </div>
          </Modal>
        );
      })()}
    </div>
  );
}

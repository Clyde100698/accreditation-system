'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  FileText,
  Loader2,
  Download,
  ExternalLink,
  AlertCircle,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Video,
  Play,
  Cloud,
  Copy,
  Check,
  Globe,
  Film,
} from 'lucide-react';

import { getEvidenceSignedUrl } from '@/lib/evidence-service';

interface DocumentViewerProps {
  fileUrl: string;
  documentId?: string;
  title?: string;
  className?: string;
  height?: string;
}

export function getYouTubeVideoId(url: string): string | null {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
  return match && match[1] ? match[1] : null;
}

export function getGoogleDriveFileId(url: string): string | null {
  if (!url || !url.includes('drive.google.com')) return null;
  const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  return match && match[1] ? match[1] : null;
}

export function getVimeoVideoId(url: string): string | null {
  if (!url || !url.includes('vimeo.com')) return null;
  const match = url.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(?:\d+)\/video\/|video\/|)(\d+)/);
  return match && match[2] ? match[2] : null;
}

export function getLoomVideoId(url: string): string | null {
  if (!url || !url.includes('loom.com')) return null;
  const match = url.match(/loom\.com\/(?:share|embed)\/([a-zA-Z0-9_-]+)/);
  return match && match[1] ? match[1] : null;
}

export function isDirectVideoUrl(url: string): boolean {
  if (!url) return false;
  const clean = url.split('?')[0].split('#')[0].toLowerCase();
  return /\.(mp4|webm|ogg|mov|m4v)$/i.test(clean);
}

export function DocumentViewer({
  fileUrl: initialUrl,
  documentId,
  title,
  className = '',
  height = '74vh',
}: DocumentViewerProps) {
  const [activeUrl, setActiveUrl] = useState<string>(initialUrl);
  const [isSigning, setIsSigning] = useState<boolean>(false);
  const [signingError, setSigningError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(100);
  const [fitWidth, setFitWidth] = useState(true);
  const [copied, setCopied] = useState(false);
  const docxContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    if (!initialUrl) {
      setActiveUrl('');
      return;
    }

    const isSupabase = initialUrl.includes('/storage/v1/object/');
    const hasToken = initialUrl.includes('/storage/v1/object/sign/') && initialUrl.includes('token=');

    if (isSupabase && !hasToken) {
      setIsSigning(true);
      setSigningError(null);
      getEvidenceSignedUrl({ id: documentId, file_url: initialUrl })
        .then((signed) => {
          if (active) {
            setActiveUrl(signed);
            setIsSigning(false);
          }
        })
        .catch((err) => {
          if (active) {
            console.warn('Signing failed, falling back to initialUrl:', err);
            setActiveUrl(initialUrl);
            setSigningError(null);
            setIsSigning(false);
          }
        });
    } else {
      setActiveUrl(initialUrl);
      setIsSigning(false);
      setSigningError(null);
    }

    return () => {
      active = false;
    };
  }, [initialUrl, documentId]);

  const fileUrl = activeUrl;

  const cleanUrl = fileUrl ? fileUrl.split('?')[0].toLowerCase() : '';
  const isPdf = cleanUrl.endsWith('.pdf');
  const isImage = /\.(jpeg|jpg|png|gif|webp)$/i.test(cleanUrl);
  const isDocx = cleanUrl.endsWith('.docx');
  const isPlaceholder = fileUrl ? fileUrl.includes('placehold.co') : false;

  // Video and Cloud checks
  const youtubeId = getYouTubeVideoId(fileUrl);
  const driveId = getGoogleDriveFileId(fileUrl);
  const vimeoId = getVimeoVideoId(fileUrl);
  const loomId = getLoomVideoId(fileUrl);
  const isDirectVideo = isDirectVideoUrl(fileUrl);
  const isExternalWebLink =
    fileUrl &&
    (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) &&
    !isPdf &&
    !isImage &&
    !isDocx &&
    !isPlaceholder &&
    !isDirectVideo &&
    !youtubeId &&
    !driveId &&
    !vimeoId &&
    !loomId;

  const handleCopyLink = () => {
    if (fileUrl) {
      navigator.clipboard.writeText(fileUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  useEffect(() => {
    let active = true;

    if (isDocx && !isPlaceholder && docxContainerRef.current) {
      setLoading(true);
      setError(null);

      const renderDocx = async () => {
        try {
          const res = await fetch(fileUrl);
          if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch file`);
          const blob = await res.blob();

          if (!active || !docxContainerRef.current) return;

          // Dynamically import docx-preview for client-side rendering
          const docx = await import('docx-preview');
          docxContainerRef.current.innerHTML = '';
          await docx.renderAsync(blob, docxContainerRef.current, undefined, {
            inWrapper: true,
            ignoreWidth: fitWidth,
            ignoreHeight: false,
            className: 'docx',
          });
        } catch (err) {
          console.error('DOCX render error:', err);
          if (active) {
            setError(err instanceof Error ? err.message : 'Unable to render Word preview in browser.');
          }
        } finally {
          if (active) setLoading(false);
        }
      };

      renderDocx();
    }

    return () => {
      active = false;
    };
  }, [fileUrl, isDocx, isPlaceholder, fitWidth]);

  if (isSigning) {
    return (
      <div
        className={`w-full bg-slate-50 rounded-xl border border-gray-200 p-8 flex flex-col items-center justify-center text-center ${className}`}
        style={{ minHeight: height }}
      >
        <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
        <h4 className="text-sm font-bold text-gray-800">Generating Secure Document Access...</h4>
        <p className="text-xs text-gray-500 mt-1">Verifying accreditation role credentials and program permissions.</p>
      </div>
    );
  }

  if (signingError) {
    return (
      <div
        className={`w-full bg-rose-50/70 rounded-xl border border-rose-200 p-8 flex flex-col items-center justify-center text-center ${className}`}
        style={{ minHeight: height }}
      >
        <AlertCircle className="w-10 h-10 text-rose-500 mb-3" />
        <h4 className="text-sm font-bold text-gray-900">Access Restricted</h4>
        <p className="text-xs text-gray-600 max-w-md mt-1">{signingError}</p>
      </div>
    );
  }

  if (!fileUrl) {
    return (
      <div
        className={`w-full bg-slate-50 rounded-xl border border-gray-200 p-8 flex flex-col items-center justify-center text-center ${className}`}
        style={{ minHeight: height }}
      >
        <FileText className="w-10 h-10 text-gray-300 mb-2" />
        <h4 className="text-sm font-bold text-gray-800">No Document Attached</h4>
        <p className="text-xs text-gray-400 mt-1">No file URL or external link is associated with this record.</p>
      </div>
    );
  }

  if (isPlaceholder) {
    return (
      <div
        className={`w-full bg-amber-50/50 rounded-xl border border-amber-200 p-8 flex flex-col items-center justify-center text-center ${className}`}
        style={{ minHeight: height }}
      >
        <AlertCircle className="w-12 h-12 text-amber-500 mb-3" />
        <h4 className="text-sm font-bold text-gray-900 mb-1">No Actual Document Attached</h4>
        <p className="text-xs text-gray-600 max-w-md mb-4">
          This record was saved with a placeholder instead of an uploaded file. Please delete this submission and re-upload the original document or provide a cloud link.
        </p>
      </div>
    );
  }

  // 1. YouTube Video Embed
  if (youtubeId) {
    return (
      <div
        className={`w-full bg-slate-950 rounded-xl overflow-hidden flex flex-col border border-slate-800 shadow-md ${className}`}
        style={{ height }}
      >
        {/* Top Video Toolbar */}
        <div className="shrink-0 px-4 py-2 bg-slate-900/95 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-white">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-red-600 text-white font-black text-[10px] tracking-wide flex items-center gap-1 shadow-xs">
              <Play className="w-2.5 h-2.5 fill-white" /> YOUTUBE
            </span>
            <span className="truncate max-w-[280px] sm:max-w-md font-semibold text-slate-200">
              {title || 'Video Evidence Recording'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white rounded-md text-xs font-semibold transition-colors"
              title="Copy video URL to clipboard"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Link'}</span>
            </button>
            <a
              href={fileUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-600 hover:bg-red-500 text-white rounded-md text-xs font-bold transition-colors shadow-xs"
              title="Open video on YouTube"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Watch on YouTube</span>
            </a>
          </div>
        </div>

        {/* Video Player */}
        <div className="flex-1 w-full bg-black flex items-center justify-center">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${youtubeId}?rel=0&modestbranding=1`}
            className="w-full h-full border-none"
            title={title || 'YouTube Evidence Video'}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      </div>
    );
  }

  // 2. Google Drive Embed (Videos, Presentations, Spreadsheets, Docs, etc.)
  if (driveId) {
    return (
      <div
        className={`w-full bg-slate-900 rounded-xl overflow-hidden flex flex-col border border-slate-700 shadow-md ${className}`}
        style={{ height }}
      >
        {/* Top Drive Toolbar */}
        <div className="shrink-0 px-4 py-2 bg-slate-800 border-b border-slate-700 flex flex-wrap items-center justify-between gap-3 text-xs text-white">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-blue-600 text-white font-black text-[10px] tracking-wide flex items-center gap-1 shadow-xs">
              <Cloud className="w-2.5 h-2.5" /> GOOGLE DRIVE
            </span>
            <span className="truncate max-w-[280px] sm:max-w-md font-semibold text-slate-100">
              {title || 'Drive Cloud Exhibit'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white rounded-md text-xs font-semibold transition-colors"
              title="Copy Google Drive URL"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Link'}</span>
            </button>
            <a
              href={fileUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-md text-xs font-bold transition-colors shadow-xs"
              title="Open document in Google Drive"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open in Drive</span>
            </a>
          </div>
        </div>

        {/* Drive IFrame Preview */}
        <div className="flex-1 w-full bg-slate-950 flex items-center justify-center">
          <iframe
            src={`https://drive.google.com/file/d/${driveId}/preview`}
            className="w-full h-full border-none bg-white"
            title={title || 'Google Drive Evidence Exhibit'}
            allow="autoplay; encrypted-media; fullscreen"
            allowFullScreen
          />
        </div>
      </div>
    );
  }

  // 3. Direct Video File (.mp4, .webm, .ogg, .mov, .m4v)
  if (isDirectVideo) {
    return (
      <div
        className={`w-full bg-slate-950 rounded-xl overflow-hidden flex flex-col border border-slate-800 shadow-md ${className}`}
        style={{ height }}
      >
        <div className="shrink-0 px-4 py-2 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-white">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-purple-600 text-white font-black text-[10px] tracking-wide flex items-center gap-1 shadow-xs">
              <Video className="w-2.5 h-2.5" /> VIDEO
            </span>
            <span className="truncate max-w-[280px] sm:max-w-md font-semibold text-slate-200">
              {title || 'Video Recording'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white rounded-md text-xs font-semibold transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Link'}</span>
            </button>
            <a
              href={fileUrl}
              download
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white rounded-md text-xs font-semibold transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </a>
          </div>
        </div>

        <div className="flex-1 w-full bg-black flex items-center justify-center p-2">
          <video
            controls
            playsInline
            preload="metadata"
            className="max-h-full max-w-full rounded-lg shadow-lg object-contain bg-black"
            src={fileUrl}
          >
            Your browser does not support HTML5 video playback.
          </video>
        </div>
      </div>
    );
  }

  // 4. Vimeo Embed
  if (vimeoId) {
    return (
      <div
        className={`w-full bg-slate-950 rounded-xl overflow-hidden flex flex-col border border-slate-800 shadow-md ${className}`}
        style={{ height }}
      >
        <div className="shrink-0 px-4 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between gap-3 text-xs text-white">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-sky-500 text-white font-black text-[10px] tracking-wide flex items-center gap-1 shadow-xs">
              <Film className="w-2.5 h-2.5" /> VIMEO
            </span>
            <span className="truncate max-w-[300px] font-semibold text-slate-200">{title || 'Vimeo Recording'}</span>
          </div>
          <a
            href={fileUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 px-2.5 py-1 bg-sky-600 hover:bg-sky-500 text-white rounded-md text-xs font-bold transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" /> Watch on Vimeo
          </a>
        </div>
        <div className="flex-1 w-full bg-black flex items-center justify-center">
          <iframe
            src={`https://player.vimeo.com/video/${vimeoId}`}
            className="w-full h-full border-none"
            title={title || 'Vimeo Evidence Video'}
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    );
  }

  // 5. Loom Embed
  if (loomId) {
    return (
      <div
        className={`w-full bg-slate-950 rounded-xl overflow-hidden flex flex-col border border-slate-800 shadow-md ${className}`}
        style={{ height }}
      >
        <div className="shrink-0 px-4 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between gap-3 text-xs text-white">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-indigo-600 text-white font-black text-[10px] tracking-wide flex items-center gap-1 shadow-xs">
              <Video className="w-2.5 h-2.5" /> LOOM
            </span>
            <span className="truncate max-w-[300px] font-semibold text-slate-200">{title || 'Loom Walkthrough'}</span>
          </div>
          <a
            href={fileUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md text-xs font-bold transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" /> Watch on Loom
          </a>
        </div>
        <div className="flex-1 w-full bg-black flex items-center justify-center">
          <iframe
            src={`https://www.loom.com/embed/${loomId}`}
            className="w-full h-full border-none"
            title={title || 'Loom Evidence Video'}
            allowFullScreen
          />
        </div>
      </div>
    );
  }

  // 6. PDF Document
  if (isPdf) {
    return (
      <div className={`w-full bg-slate-100 rounded-xl overflow-hidden ${className}`} style={{ height }}>
        <iframe
          src={fileUrl}
          className="w-full h-full border-none"
          title={title || 'PDF Document Preview'}
        />
      </div>
    );
  }

  // 7. Image
  if (isImage) {
    return (
      <div
        className={`w-full bg-slate-900/5 rounded-xl overflow-hidden flex items-center justify-center p-4 ${className}`}
        style={{ minHeight: height }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={fileUrl}
          alt={title || 'Evidence Preview'}
          className="max-h-[70vh] max-w-full object-contain rounded shadow-xs"
        />
      </div>
    );
  }

  // 8. Word Document (.docx)
  if (isDocx) {
    return (
      <div
        className={`w-full bg-slate-200/70 rounded-xl overflow-hidden flex flex-col border border-gray-300 ${className}`}
        style={{ height }}
      >
        {/* Top Viewer Toolbar */}
        <div className="shrink-0 px-4 py-2 bg-white/95 backdrop-blur-xs border-b border-gray-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-gray-700 font-medium">
            <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold text-[11px] border border-blue-200">
              DOCX
            </span>
            <span className="truncate max-w-[280px] font-semibold text-gray-900">
              {title || 'Word Document'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Fit Width Toggle */}
            <button
              type="button"
              onClick={() => setFitWidth(!fitWidth)}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                fitWidth
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              title={fitWidth ? 'Switch to Standard Page Width' : 'Fit to Available Width'}
            >
              {fitWidth ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              <span>{fitWidth ? 'Fit Width (Active)' : 'Fit Width'}</span>
            </button>

            {/* Zoom Controls */}
            <div className="flex items-center bg-gray-100 rounded-md p-0.5 border border-gray-200">
              <button
                type="button"
                onClick={() => setZoom((z) => Math.max(60, z - 15))}
                className="p-1 hover:bg-white rounded text-gray-600 hover:text-gray-900 transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setZoom(100)}
                className="px-2 py-0.5 font-mono text-[11px] font-bold text-gray-700 hover:text-primary"
                title="Reset Zoom to 100%"
              >
                {zoom}%
              </button>
              <button
                type="button"
                onClick={() => setZoom((z) => Math.min(180, z + 15))}
                className="p-1 hover:bg-white rounded text-gray-600 hover:text-gray-900 transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Download Link */}
            <a
              href={fileUrl}
              download
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-gray-50 border border-gray-300 rounded-md text-gray-700 hover:text-gray-900 font-medium transition-colors"
              title="Download original file"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Download</span>
            </a>
          </div>
        </div>

        {/* Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-xs flex flex-col items-center justify-center z-10 gap-2">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-xs font-semibold text-gray-700">Rendering Word Document (.docx)...</p>
          </div>
        )}

        {/* Content Area */}
        {error ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-white m-4 rounded-xl border border-gray-200 shadow-xs">
            <FileText className="w-12 h-12 text-blue-600 mb-3" />
            <h4 className="text-sm font-bold text-gray-900 mb-1">Word Document: {title || 'Course Syllabus'}</h4>
            <p className="text-xs text-gray-500 mb-4 max-w-md">
              In-browser Word preview could not be rendered ({error}). You can open or download the original file directly.
            </p>
            <a
              href={fileUrl}
              download
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary/90 transition-all shadow-xs"
            >
              <Download className="w-4 h-4" /> Download Original Document
            </a>
          </div>
        ) : (
          <div className="flex-1 overflow-auto p-4 sm:p-8 flex justify-center">
            <div
              ref={docxContainerRef}
              className={`w-full flex flex-col items-center transition-transform origin-top duration-150 ${
                fitWidth ? 'docx-fit-width' : 'docx-page-width'
              }`}
              style={{
                zoom: zoom !== 100 ? `${zoom}%` : undefined,
              }}
            />
          </div>
        )}
      </div>
    );
  }

  // 9. External Cloud / Web Resource Link (OneDrive, SharePoint, Dropbox, Box, Google Docs, or University Portals)
  if (isExternalWebLink) {
    let hostName = 'Cloud Storage';
    let serviceBadge = 'CLOUD EXHIBIT';
    let serviceColor = 'bg-teal-50 text-teal-800 border-teal-200';
    let isStreamVideo = false;

    try {
      const parsedUrl = new URL(fileUrl);
      hostName = parsedUrl.hostname.replace(/^www\./, '');
      const lowerUrl = fileUrl.toLowerCase();
      isStreamVideo =
        (hostName.includes('sharepoint') || hostName.includes('onedrive')) &&
        (lowerUrl.includes('stream.aspx') || lowerUrl.includes('.mp4') || (title || '').toLowerCase().includes('tour') || (title || '').toLowerCase().includes('video'));

      if (isStreamVideo) {
        serviceBadge = 'MS STREAM VIDEO';
        serviceColor = 'bg-sky-100 text-sky-800 border-sky-300';
        hostName = 'Microsoft Stream (SharePoint)';
      } else if (hostName.includes('onedrive') || hostName.includes('1drv.ms') || hostName.includes('sharepoint')) {
        serviceBadge = 'MS ONEDRIVE / SHAREPOINT';
        serviceColor = 'bg-sky-50 text-sky-800 border-sky-200';
      } else if (hostName.includes('dropbox')) {
        serviceBadge = 'DROPBOX';
        serviceColor = 'bg-blue-50 text-blue-800 border-blue-200';
      } else if (hostName.includes('box.com')) {
        serviceBadge = 'BOX CLOUD';
        serviceColor = 'bg-indigo-50 text-indigo-800 border-indigo-200';
      } else if (hostName.includes('google.com')) {
        serviceBadge = 'GOOGLE WORKSPACE';
        serviceColor = 'bg-amber-50 text-amber-800 border-amber-200';
      }
    } catch {
      // ignore url parse error
    }

    return (
      <div
        className={`w-full bg-slate-50 rounded-xl overflow-hidden flex flex-col border border-gray-300 shadow-sm ${className}`}
        style={{ minHeight: height }}
      >
        {/* Top Link Toolbar */}
        <div className="shrink-0 px-4 py-2 bg-white border-b border-gray-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded font-black text-[10px] tracking-wide border ${serviceColor} flex items-center gap-1`}>
              {isStreamVideo ? <Play className="w-2.5 h-2.5 fill-sky-700" /> : null}
              {serviceBadge}
            </span>
            <span className="truncate max-w-[280px] sm:max-w-md font-bold text-gray-900">
              {title || 'External Evidence Exhibit'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-xs font-semibold transition-colors"
              title="Copy URL"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Link'}</span>
            </button>
            <a
              href={fileUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary text-white hover:bg-primary/90 rounded-md text-xs font-bold transition-all shadow-xs"
              title="Open external exhibit"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>{isStreamVideo ? 'Watch on MS Stream' : `Open in ${hostName}`}</span>
            </a>
          </div>
        </div>

        {/* Cloud Exhibit Showcase Card */}
        <div className="flex-1 p-6 sm:p-12 flex flex-col items-center justify-center text-center max-w-xl mx-auto">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-xs ${
            isStreamVideo ? 'bg-sky-100 border border-sky-200 text-sky-700' : 'bg-primary/10 border border-primary/20 text-primary'
          }`}>
            {isStreamVideo ? <Video className="w-8 h-8" /> : <Globe className="w-8 h-8" />}
          </div>

          <h3 className="text-lg font-black text-gray-900 mb-2">
            {title || 'External Cloud Evidence'}
          </h3>

          <p className="text-xs text-gray-600 mb-6 leading-relaxed">
            {isStreamVideo ? (
              <>
                This high-definition video exhibit is hosted on <strong>STI West Negros University Microsoft Stream (SharePoint)</strong>. Evaluators can launch and watch the original recording directly with full controls.
              </>
            ) : (
              <>
                This evidence exhibit is hosted externally on <strong>{hostName}</strong> (ideal for large videos, high-resolution media, or multi-gigabyte archives that exceed standard upload limits).
              </>
            )}
          </p>

          <div className="w-full bg-white p-3 rounded-lg border border-gray-200 flex items-center justify-between gap-3 text-left mb-6 shadow-xs">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                {isStreamVideo ? 'SharePoint / Stream URL' : 'Direct Access URL'}
              </p>
              <p className="text-xs font-mono text-gray-800 truncate" title={fileUrl}>
                {fileUrl}
              </p>
            </div>
            <button
              type="button"
              onClick={handleCopyLink}
              className="p-1.5 hover:bg-gray-100 text-gray-500 rounded-md shrink-0 transition-colors"
              title="Copy link"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            {isStreamVideo ? (
              <a
                href={fileUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-lg transition-all shadow-md hover:shadow-lg"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Watch on Microsoft Stream</span>
                <ExternalLink className="w-3.5 h-3.5 ml-1" />
              </a>
            ) : (
              <a
                href={fileUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary/90 transition-all shadow-md hover:shadow-lg"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Launch External Exhibit</span>
              </a>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 10. Generic fallback for any other file types
  return (
    <div
      className={`w-full bg-slate-100 rounded-xl overflow-hidden flex flex-col items-center justify-center p-8 text-center ${className}`}
      style={{ minHeight: height }}
    >
      <FileText className="w-12 h-12 text-gray-400 mb-3" />
      <h4 className="text-sm font-bold text-gray-900 mb-1">{title || 'Evidence Document'}</h4>
      <p className="text-xs text-gray-500 mb-4">
        This document format does not support inline browser rendering.
      </p>
      <a
        href={fileUrl}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary/90 transition-all shadow-xs"
      >
        <ExternalLink className="w-4 h-4" /> Open or Download File
      </a>
    </div>
  );
}


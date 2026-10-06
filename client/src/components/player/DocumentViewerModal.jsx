import React, { useState, useEffect } from 'react';
import { usePlayer } from '../../context/PlayerContext.jsx';
import { formatBytes, formatDate } from '../../utils/formatters.js';
import {
  X,
  Download,
  FileText,
  ExternalLink,
  Calendar,
  HardDrive
} from 'lucide-react';

export const DocumentViewerModal = () => {
  const { activeDoc, closeDocument } = usePlayer();
  const [textContent, setTextContent] = useState('');
  const [isLoadingText, setIsLoadingText] = useState(false);

  const isPdf = activeDoc?.mimeType === 'application/pdf' || activeDoc?.filePath?.toLowerCase().endsWith('.pdf');
  const isText = activeDoc?.mimeType?.startsWith('text/') || ['.txt', '.md', '.json', '.csv', '.rtf'].some((ext) => activeDoc?.filePath?.toLowerCase().endsWith(ext));

  useEffect(() => {
    if (activeDoc && isText) {
      setIsLoadingText(true);
      fetch(activeDoc.filePath)
        .then((res) => res.text())
        .then((txt) => setTextContent(txt))
        .catch(() => setTextContent('Unable to preview document text.'))
        .finally(() => setIsLoadingText(false));
    } else {
      setTextContent('');
    }
  }, [activeDoc, isText]);

  if (!activeDoc) return null;

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = activeDoc.filePath;
    a.download = activeDoc.title || 'document';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 24px',
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid var(--border-light)',
          zIndex: 10
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              padding: '6px',
              borderRadius: '6px',
              backgroundColor: '#EFF6FF',
              color: 'var(--accent)'
            }}
          >
            <FileText size={18} />
          </div>
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
              {activeDoc.title}
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11.5px', color: 'var(--text-muted)' }}>
              <span>{formatBytes(activeDoc.size)}</span>
              <span>•</span>
              <span>{formatDate(activeDoc.createdAt)}</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            onClick={handleDownload}
            className="btn-primary"
            style={{ padding: '7px 14px', fontSize: '13px' }}
          >
            <Download size={14} />
            <span>Download</span>
          </button>

          <a
            href={activeDoc.filePath}
            target="_blank"
            rel="noopener noreferrer"
            title="Open in new tab"
            className="btn-secondary"
            style={{ padding: '7px 10px' }}
          >
            <ExternalLink size={15} />
          </a>

          <button
            type="button"
            onClick={closeDocument}
            title="Close Viewer"
            style={{
              padding: '6px',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-muted)',
              backgroundColor: 'transparent'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-subtle)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, overflow: 'hidden', padding: '16px', display: 'flex', justifyContent: 'center', backgroundColor: '#F3F4F6' }}>
        {isPdf ? (
          <iframe
            src={`${activeDoc.filePath}#toolbar=1`}
            title={activeDoc.title}
            style={{
              width: '100%',
              maxWidth: '1050px',
              height: '100%',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-light)',
              backgroundColor: '#FFFFFF',
              boxShadow: 'var(--shadow-drawer)'
            }}
          />
        ) : isText ? (
          <div
            style={{
              width: '100%',
              maxWidth: '900px',
              height: '100%',
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-light)',
              padding: '28px',
              overflowY: 'auto',
              fontFamily: 'monospace',
              fontSize: '13.5px',
              lineHeight: '1.6',
              whiteSpace: 'pre-wrap',
              color: 'var(--text-main)',
              boxShadow: 'var(--shadow-drawer)'
            }}
          >
            {isLoadingText ? 'Loading document text...' : textContent}
          </div>
        ) : (
          <div
            className="clean-card"
            style={{
              margin: 'auto',
              padding: '40px',
              maxWidth: '480px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px'
            }}
          >
            <FileText size={40} style={{ color: 'var(--accent)' }} />
            <h4 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
              Direct in-browser preview unavailable
            </h4>
            <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              This format is best viewed in an external reader. You can download the file to inspect it on your local system.
            </p>
            <button
              type="button"
              onClick={handleDownload}
              className="btn-primary"
              style={{ marginTop: '8px' }}
            >
              <Download size={15} />
              <span>Download File</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

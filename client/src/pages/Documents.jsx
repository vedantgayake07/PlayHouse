import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { MediaCard } from '../components/media/MediaCard.jsx';
import { MediaGridSkeleton } from '../components/common/LoadingSkeleton.jsx';
import { EmptyState } from '../components/common/EmptyState.jsx';
import { FileText, Upload } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Documents = () => {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadDocs = () => {
    setLoading(true);
    api.media.getAll({ mediaType: 'document', limit: 50 })
      .then((res) => {
        if (res.success) setDocs(res.data.items || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadDocs();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ padding: '7px', borderRadius: '6px', backgroundColor: '#EFF6FF', color: 'var(--accent)' }}>
              <FileText size={20} />
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em', margin: 0 }}>
              Technical Documents & Specifications
            </h1>
          </div>
          <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
            System whitepapers, architectural guides, specifications, and PDF documents.
          </p>
        </div>

        <Link
          to="/upload?type=document"
          className="btn-primary"
          style={{ fontSize: '13.5px' }}
        >
          <Upload size={15} />
          <span>Upload Document</span>
        </Link>
      </div>

      {loading ? (
        <MediaGridSkeleton count={8} />
      ) : docs.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No documents uploaded"
          description="Upload technical whitepapers, guides, or specifications to your document library."
          actionText="Upload Document"
          actionLink="/upload?type=document"
        />
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
            gap: '20px'
          }}
        >
          {docs.map((doc) => (
            <MediaCard
              key={doc.id}
              media={doc}
              mediaList={docs}
              onDeleted={(id) => setDocs((prev) => prev.filter((d) => d.id !== id))}
              onUpdated={loadDocs}
            />
          ))}
        </div>
      )}
    </div>
  );
};

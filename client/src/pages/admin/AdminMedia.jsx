import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import { usePlayer } from '../../context/PlayerContext.jsx';
import { formatBytes, formatDate } from '../../utils/formatters.js';
import { ConfirmDialog } from '../../components/common/ConfirmDialog.jsx';
import { Pagination } from '../../components/common/Pagination.jsx';
import {
  Layers,
  Search,
  Trash2,
  Play,
  Film,
  Music,
  Image as ImageIcon,
  FileText
} from 'lucide-react';

export const AdminMedia = () => {
  const toast = useToast();
  const { openVideo, playTrack, openLightbox, openDocument } = usePlayer();

  const [mediaList, setMediaList] = useState([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    loadMedia();
  }, [search, typeFilter, page]);

  const loadMedia = async () => {
    try {
      setLoading(true);
      const params = { page, limit: 15 };
      if (search.trim()) params.search = search.trim();
      if (typeFilter !== 'all') params.mediaType = typeFilter;

      const res = await api.admin.getAllMedia(params);
      if (res.success && res.data) {
        setMediaList(res.data.items || []);
        setPagination(res.data.pagination || { page: 1, total: 0, totalPages: 1 });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMedia = async () => {
    if (!deleteTarget) return;
    try {
      const res = await api.admin.deleteMedia(deleteTarget.id);
      if (res.success) {
        toast.success(`"${deleteTarget.title}" deleted.`);
        setMediaList((prev) => prev.filter((m) => m.id !== deleteTarget.id));
        setDeleteTarget(null);
      }
    } catch (err) {
      toast.error('Failed to delete media.');
    }
  };

  const handlePreviewMedia = (item) => {
    switch (item.mediaType) {
      case 'video': openVideo(item); break;
      case 'audio': playTrack(item); break;
      case 'image': openLightbox(item); break;
      case 'document': openDocument(item); break;
      default: break;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: 'rgba(99, 102, 241, 0.2)', color: 'var(--accent-primary)' }}>
              <Layers size={22} />
            </div>
            <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)' }}>
              Manage System Media
            </h1>
          </div>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Oversee and audit all videos, audio files, artwork, and documentation uploaded to the platform.
          </p>
        </div>
      </div>

      {/* Filter Row */}
      <div
        className="glass-panel"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '12px',
          padding: '14px',
          borderRadius: 'var(--radius-lg)'
        }}
      >
        <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-input"
            placeholder="Search media by title or tags..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            style={{ paddingLeft: '36px' }}
          />
        </div>

        <select
          value={typeFilter}
          onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
          style={{
            padding: '9px 14px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--bg-input)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-primary)',
            fontSize: '13px'
          }}
        >
          <option value="all">All Types</option>
          <option value="video">Videos</option>
          <option value="audio">Audio Tracks</option>
          <option value="image">Images</option>
          <option value="document">Documents</option>
        </select>
      </div>

      {/* Media Table */}
      <div className="glass-panel" style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '3fr 1fr 1fr 1fr 1.5fr 1fr',
            padding: '14px 20px',
            borderBottom: '1px solid var(--border-color)',
            fontSize: '12px',
            fontWeight: 600,
            color: 'var(--text-muted)',
            textTransform: 'uppercase'
          }}
        >
          <span>Title</span>
          <span>Type</span>
          <span>Size</span>
          <span>Views</span>
          <span>Uploader</span>
          <span style={{ textAlign: 'right' }}>Actions</span>
        </div>

        <div>
          {loading ? (
            <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading media...</div>
          ) : mediaList.length === 0 ? (
            <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>No media matching filter.</div>
          ) : (
            mediaList.map((m) => (
              <div
                key={m.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '3fr 1fr 1fr 1fr 1.5fr 1fr',
                  alignItems: 'center',
                  padding: '12px 20px',
                  borderBottom: '1px solid var(--border-color)',
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
                onClick={() => handlePreviewMedia(m)}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', overflow: 'hidden', paddingRight: '12px' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '6px',
                      backgroundColor: 'var(--bg-secondary)',
                      overflow: 'hidden',
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {m.thumbnail ? (
                      <img src={m.thumbnail} alt={m.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      m.mediaType === 'video' ? <Film size={18} /> :
                      m.mediaType === 'audio' ? <Music size={18} /> :
                      m.mediaType === 'image' ? <ImageIcon size={18} /> : <FileText size={18} />
                    )}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }} className="line-clamp-1">
                      {m.title}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {m.categoryName || 'General'}
                    </div>
                  </div>
                </div>

                <div style={{ color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
                  {m.mediaType}
                </div>

                <div style={{ color: 'var(--text-muted)' }}>
                  {formatBytes(m.size)}
                </div>

                <div style={{ color: 'var(--text-secondary)' }}>
                  {m.views || 0}
                </div>

                <div style={{ color: 'var(--text-muted)', fontSize: '12px' }} className="line-clamp-1">
                  {m.uploaderName || 'Admin'}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePreviewMedia(m);
                    }}
                    title="Play / View"
                    style={{ padding: '6px', borderRadius: '4px', color: 'var(--accent-primary)', backgroundColor: 'rgba(99, 102, 241, 0.1)' }}
                  >
                    <Play size={14} fill="currentColor" />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteTarget(m);
                    }}
                    title="Delete media"
                    style={{ padding: '6px', borderRadius: '4px', color: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <Pagination
        currentPage={pagination.page}
        totalPages={pagination.totalPages}
        onPageChange={(p) => setPage(p)}
      />

      {deleteTarget && (
        <ConfirmDialog
          isOpen={Boolean(deleteTarget)}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDeleteMedia}
          title="Delete Media File"
          message={`Are you sure you want to delete "${deleteTarget.title}"? The file will be removed from disk and database.`}
          confirmText="Delete Media"
        />
      )}
    </div>
  );
};

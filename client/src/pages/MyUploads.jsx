import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { usePlayer } from '../context/PlayerContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { formatBytes, formatDate, getMediaTypeDetails } from '../utils/formatters.js';
import { EditMediaModal } from '../components/media/EditMediaModal.jsx';
import { ConfirmDialog } from '../components/common/ConfirmDialog.jsx';
import { EmptyState } from '../components/common/EmptyState.jsx';
import {
  Layers,
  Search,
  Upload,
  Edit2,
  Trash2,
  Play,
  Film,
  Music,
  Image as ImageIcon,
  FileText,
  SlidersHorizontal,
  ArrowUpDown
} from 'lucide-react';

export const MyUploads = () => {
  const { user, isAdmin } = useAuth();
  const { openVideo, playTrack, openLightbox, openDocument } = usePlayer();
  const toast = useToast();

  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'oldest' | 'title' | 'size'

  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadMyUploads();
  }, [user]);

  const loadMyUploads = async () => {
    try {
      setLoading(true);
      const res = await api.media.getAll({ limit: 100 });
      if (res.success && res.data) {
        // Show uploads by current user or all if admin
        const isUserAdmin = Boolean(isAdmin) || user?.role === 'ADMIN';
        const mine = (res.data.items || []).filter(
          (m) => isUserAdmin || (user?.id && Number(m.uploadedBy) === Number(user.id))
        );
        setUploads(mine);
      }
    } catch (err) {
      toast.error('Failed to load your uploads.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      const res = await api.media.delete(deleteTarget.id);
      if (res.success) {
        toast.success(`"${deleteTarget.title}" deleted.`);
        setUploads((prev) => prev.filter((m) => m.id !== deleteTarget.id));
        setDeleteTarget(null);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to delete file.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleMediaUpdated = (updated) => {
    setUploads((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
  };

  const handlePlayMedia = (item) => {
    switch (item.mediaType) {
      case 'video': openVideo(item); break;
      case 'audio': playTrack(item, uploads.filter((m) => m.mediaType === 'audio')); break;
      case 'image': openLightbox(item, uploads.filter((m) => m.mediaType === 'image')); break;
      case 'document': openDocument(item); break;
      default: break;
    }
  };

  // Filtered and sorted items
  const filteredItems = useMemo(() => {
    let result = uploads.filter((item) => {
      const q = search.toLowerCase().trim();
      if (!q) return true;
      return (
        item.title?.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q) ||
        item.categoryName?.toLowerCase().includes(q)
      );
    });

    result.sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === 'title') return (a.title || '').localeCompare(b.title || '');
      if (sortBy === 'size') return (b.size || 0) - (a.size || 0);
      return 0;
    });

    return result;
  }, [uploads, search, sortBy]);

  const getTypeIcon = (type) => {
    switch (type) {
      case 'video': return <Film size={14} />;
      case 'audio': return <Music size={14} />;
      case 'image': return <ImageIcon size={14} />;
      default: return <FileText size={14} />;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-main)' }}>
            My Uploads
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Manage, update, and organize your uploaded videos, tracks, images, and documents.
          </p>
        </div>

        <Link to="/upload" className="btn-primary" style={{ gap: '8px' }}>
          <Upload size={15} />
          <span>Upload New File</span>
        </Link>
      </div>

      {/* Search & Sort Controls */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          padding: '14px 16px',
          backgroundColor: '#FFFFFF',
          border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius-card)'
        }}
      >
        <div style={{ position: 'relative', flex: 1, minWidth: '240px', maxWidth: '400px' }}>
          <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-input"
            placeholder="Search within my uploads..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '36px', paddingRight: '12px', fontSize: '13px' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-light)',
              backgroundColor: '#FFFFFF',
              color: 'var(--text-main)',
              fontSize: '13px'
            }}
          >
            <option value="newest">Recently Added</option>
            <option value="oldest">Oldest First</option>
            <option value="title">Title (A-Z)</option>
            <option value="size">File Size</option>
          </select>
        </div>
      </div>

      {/* Table view */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius-card)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-subtle)'
        }}
      >
        {/* Table Header */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '3.5fr 1.5fr 1fr 1.2fr 1.2fr',
            padding: '12px 18px',
            backgroundColor: 'var(--bg-subtle)',
            borderBottom: '1px solid var(--border-light)',
            fontSize: '12px',
            fontWeight: 600,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.03em'
          }}
        >
          <span>Title & File</span>
          <span>Category</span>
          <span>Size</span>
          <span>Date</span>
          <span style={{ textAlign: 'right' }}>Actions</span>
        </div>

        {/* Table Rows */}
        <div>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13.5px' }}>
              Loading your uploaded files...
            </div>
          ) : filteredItems.length === 0 ? (
            <div style={{ padding: '50px 20px', textAlign: 'center' }}>
              <EmptyState
                icon={Layers}
                title={search ? 'No uploads match your search' : 'You haven\'t uploaded any content yet'}
                description={search ? 'Try checking for typos or searching a different term.' : 'Upload your first video clip, audio track, artwork, or technical document.'}
                actionText={!search ? 'Upload Your First File' : undefined}
                actionLink={!search ? '/upload' : undefined}
              />
            </div>
          ) : (
            filteredItems.map((item) => {
              const typeDetails = getMediaTypeDetails(item.mediaType);
              return (
                <div
                  key={item.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '3.5fr 1.5fr 1fr 1.2fr 1.2fr',
                    alignItems: 'center',
                    padding: '12px 18px',
                    borderBottom: '1px solid var(--border-subtle)',
                    fontSize: '13px',
                    transition: 'background-color 150ms ease'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-subtle)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  {/* Thumbnail & Title */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', overflow: 'hidden', paddingRight: '12px' }}>
                    <div
                      style={{
                        width: '56px',
                        aspectRatio: '16 / 9',
                        borderRadius: '6px',
                        backgroundColor: '#F3F4F6',
                        overflow: 'hidden',
                        flexShrink: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid var(--border-light)',
                        cursor: 'pointer'
                      }}
                      onClick={() => handlePlayMedia(item)}
                    >
                      {item.thumbnail || item.mediaType === 'image' ? (
                        <img src={item.thumbnail || item.filePath} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        getTypeIcon(item.mediaType)
                      )}
                    </div>

                    <div style={{ overflow: 'hidden' }}>
                      <div
                        onClick={() => handlePlayMedia(item)}
                        style={{
                          fontWeight: 600,
                          color: 'var(--text-main)',
                          cursor: 'pointer',
                          lineHeight: '1.3'
                        }}
                        className="line-clamp-1"
                        title={item.title}
                      >
                        {item.title}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px' }}>
                        <span
                          style={{
                            backgroundColor: typeDetails.bg,
                            color: typeDetails.color,
                            fontSize: '10px',
                            fontWeight: 600,
                            padding: '1px 5px',
                            borderRadius: '3px',
                            textTransform: 'capitalize'
                          }}
                        >
                          {item.mediaType}
                        </span>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          {item.views || 0} views
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Category */}
                  <div style={{ color: 'var(--text-body)', fontSize: '12.5px' }} className="line-clamp-1">
                    {item.categoryName || 'General'}
                  </div>

                  {/* Size */}
                  <div style={{ color: 'var(--text-muted)', fontSize: '12.5px' }}>
                    {formatBytes(item.size)}
                  </div>

                  {/* Date */}
                  <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                    {formatDate(item.createdAt)}
                  </div>

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                    <button
                      type="button"
                      onClick={() => handlePlayMedia(item)}
                      title="Play / View"
                      style={{
                        padding: '6px',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--accent)',
                        backgroundColor: 'var(--accent-light)'
                      }}
                    >
                      <Play size={14} fill="currentColor" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setEditTarget(item)}
                      title="Edit media details"
                      style={{
                        padding: '6px',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--text-body)',
                        backgroundColor: 'var(--bg-subtle)',
                        border: '1px solid var(--border-light)'
                      }}
                    >
                      <Edit2 size={14} />
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeleteTarget(item)}
                      title="Delete media"
                      style={{
                        padding: '6px',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--danger)',
                        backgroundColor: 'var(--danger-bg)',
                        border: '1px solid var(--danger-border)'
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {editTarget && (
        <EditMediaModal
          isOpen={Boolean(editTarget)}
          onClose={() => setEditTarget(null)}
          media={editTarget}
          onUpdated={handleMediaUpdated}
        />
      )}

      {/* Delete Confirmation */}
      {deleteTarget && (
        <ConfirmDialog
          isOpen={Boolean(deleteTarget)}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          title="Delete Media File"
          message={`Are you sure you want to permanently delete "${deleteTarget.title}"? This cannot be undone.`}
          confirmText="Delete File"
          isLoading={isDeleting}
        />
      )}
    </div>
  );
};

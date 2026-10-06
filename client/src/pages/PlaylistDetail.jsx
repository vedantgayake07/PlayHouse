import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { usePlayer } from '../context/PlayerContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { formatTime } from '../utils/formatters.js';
import { ConfirmDialog } from '../components/common/ConfirmDialog.jsx';
import { Modal } from '../components/common/Modal.jsx';
import {
  ListMusic,
  Play,
  Trash2,
  Edit,
  ArrowLeft,
  Music,
  Film,
  Globe,
  Lock,
  X
} from 'lucide-react';

export const PlaylistDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const { playTrack, openVideo } = usePlayer();
  const toast = useToast();

  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editPublic, setEditPublic] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    loadPlaylist();
  }, [id]);

  const loadPlaylist = async () => {
    try {
      setLoading(true);
      const res = await api.playlists.getById(id);
      if (res.success && res.data) {
        setPlaylist(res.data);
        setEditTitle(res.data.title);
        setEditDesc(res.data.description || '');
        setEditPublic(Boolean(res.data.isPublic));
      }
    } catch (err) {
      toast.error('Could not load playlist.');
      navigate('/playlists');
    } finally {
      setLoading(false);
    }
  };

  const handlePlayAll = () => {
    if (!playlist || !playlist.items || playlist.items.length === 0) return;
    const audioItems = playlist.items.filter((item) => item.mediaType === 'audio');
    if (audioItems.length > 0) {
      playTrack(audioItems[0], audioItems);
    } else {
      // If video, play first video
      const firstVideo = playlist.items.find((item) => item.mediaType === 'video');
      if (firstVideo) openVideo(firstVideo);
    }
  };

  const handlePlayItem = (item) => {
    if (item.mediaType === 'audio') {
      playTrack(item, playlist.items.filter((m) => m.mediaType === 'audio'));
    } else if (item.mediaType === 'video') {
      openVideo(item);
    }
  };

  const handleRemoveItem = async (mediaId) => {
    try {
      const res = await api.playlists.removeItem(playlist.id, mediaId);
      if (res.success) {
        toast.success('Removed item from playlist.');
        setPlaylist((prev) => ({
          ...prev,
          items: prev.items.filter((i) => i.id !== mediaId)
        }));
      }
    } catch (err) {
      toast.error('Failed to remove item.');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editTitle.trim()) return;

    try {
      const res = await api.playlists.update(playlist.id, {
        title: editTitle.trim(),
        description: editDesc.trim(),
        isPublic: editPublic
      });
      if (res.success) {
        toast.success('Playlist updated.');
        setPlaylist((prev) => ({ ...prev, ...res.data }));
        setShowEditModal(false);
      }
    } catch (err) {
      toast.error('Failed to update playlist.');
    }
  };

  const handleDeletePlaylist = async () => {
    try {
      const res = await api.playlists.delete(playlist.id);
      if (res.success) {
        toast.success('Playlist deleted.');
        navigate('/playlists');
      }
    } catch (err) {
      toast.error('Failed to delete playlist.');
    }
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading playlist...</div>;
  }

  if (!playlist) return null;

  const isOwner = user?.id === playlist.userId || isAdmin;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <button
        type="button"
        onClick={() => navigate('/playlists')}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          color: 'var(--text-muted)',
          fontSize: '13px',
          cursor: 'pointer',
          width: 'fit-content'
        }}
      >
        <ArrowLeft size={16} />
        <span>Back to Playlists</span>
      </button>

      {/* Playlist Hero Banner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '24px',
          padding: '32px',
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-color)',
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(10, 13, 20, 0.9) 100%)'
        }}
      >
        <div
          style={{
            width: '120px',
            height: '120px',
            borderRadius: '16px',
            backgroundColor: 'var(--bg-tertiary)',
            overflow: 'hidden',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-md)'
          }}
        >
          {playlist.thumbnail ? (
            <img src={playlist.thumbnail} alt={playlist.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <ListMusic size={48} style={{ color: 'var(--accent-primary)' }} />
          )}
        </div>

        <div style={{ flex: 1, minWidth: '240px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span
              style={{
                padding: '2px 8px',
                borderRadius: '4px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                fontSize: '11px',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              {playlist.isPublic ? <Globe size={12} /> : <Lock size={12} />}
              {playlist.isPublic ? 'Public Playlist' : 'Private Playlist'}
            </span>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              {playlist.items?.length || 0} media items
            </span>
          </div>

          <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
            {playlist.title}
          </h1>

          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.5', maxWidth: '600px' }}>
            {playlist.description || 'No description provided.'}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '20px' }}>
            {playlist.items?.length > 0 && (
              <button
                type="button"
                onClick={handlePlayAll}
                className="glow-btn"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 22px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '14px',
                  fontWeight: 600
                }}
              >
                <Play size={16} fill="#ffffff" />
                <span>Play Playlist</span>
              </button>
            )}

            {isOwner && (
              <>
                <button
                  type="button"
                  onClick={() => setShowEditModal(true)}
                  className="secondary-btn"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '9px 16px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '13px'
                  }}
                >
                  <Edit size={14} />
                  <span>Edit</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '9px 16px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '13px',
                    color: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.2)'
                  }}
                >
                  <Trash2 size={14} />
                  <span>Delete</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Playlist Items Tracklist */}
      <div
        className="glass-panel"
        style={{
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden'
        }}
      >
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            fontSize: '12px',
            fontWeight: 600,
            color: 'var(--text-muted)',
            textTransform: 'uppercase'
          }}
        >
          <span style={{ width: '40px' }}>#</span>
          <span style={{ flex: 3 }}>Title</span>
          <span style={{ flex: 1 }}>Type</span>
          <span style={{ flex: 1, textAlign: 'right' }}>Duration</span>
          {isOwner && <span style={{ width: '60px', textAlign: 'right' }}>Actions</span>}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {playlist.items?.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
              This playlist has no items yet. Add tracks and videos using the "Add to Playlist" action on any media card!
            </div>
          ) : (
            playlist.items.map((item, idx) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px 20px',
                  borderBottom: '1px solid var(--border-color)',
                  transition: 'background-color 0.15s ease',
                  cursor: 'pointer'
                }}
                onClick={() => handlePlayItem(item)}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <div style={{ width: '40px', fontSize: '13px', color: 'var(--text-muted)' }}>
                  {idx + 1}
                </div>

                <div style={{ flex: 3, display: 'flex', alignItems: 'center', gap: '12px', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '6px',
                      backgroundColor: 'var(--bg-tertiary)',
                      overflow: 'hidden',
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {item.thumbnail ? (
                      <img src={item.thumbnail} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      item.mediaType === 'video' ? <Film size={16} /> : <Music size={16} />
                    )}
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }} className="line-clamp-1">
                      {item.title}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {item.uploaderName || 'Hub Master'}
                    </div>
                  </div>
                </div>

                <div style={{ flex: 1, fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
                  {item.mediaType}
                </div>

                <div style={{ flex: 1, textAlign: 'right', fontSize: '13px', color: 'var(--text-muted)' }}>
                  {item.duration > 0 ? formatTime(item.duration) : '—'}
                </div>

                {isOwner && (
                  <div style={{ width: '60px', textAlign: 'right' }}>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveItem(item.id);
                      }}
                      title="Remove from playlist"
                      style={{ padding: '6px', color: 'var(--text-muted)', borderRadius: '4px' }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                    >
                      <X size={15} />
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Playlist" maxWidth="460px">
          <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label className="form-label">Playlist Title *</label>
              <input
                type="text"
                className="form-input"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="form-label">Description</label>
              <textarea
                className="form-input"
                rows={3}
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input
                type="checkbox"
                id="editPublic"
                checked={editPublic}
                onChange={(e) => setEditPublic(e.target.checked)}
                style={{ width: '16px', height: '16px', accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
              />
              <label htmlFor="editPublic" style={{ fontSize: '13px', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                Make playlist public
              </label>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
              <button
                type="button"
                className="secondary-btn"
                onClick={() => setShowEditModal(false)}
                style={{ padding: '9px 18px', borderRadius: 'var(--radius-md)', fontSize: '14px' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="glow-btn"
                style={{ padding: '9px 20px', borderRadius: 'var(--radius-md)', fontSize: '14px', fontWeight: 500 }}
              >
                Save Changes
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete confirmation */}
      {showDeleteConfirm && (
        <ConfirmDialog
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={handleDeletePlaylist}
          title="Delete Playlist"
          message={`Are you sure you want to delete "${playlist.title}"? This action cannot be undone.`}
          confirmText="Delete Playlist"
        />
      )}
    </div>
  );
};

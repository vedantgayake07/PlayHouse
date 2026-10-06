import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { CreatePlaylistModal } from '../components/playlist/CreatePlaylistModal.jsx';
import { EmptyState } from '../components/common/EmptyState.jsx';
import { ListMusic, Plus, Play, Trash2, Globe, Lock } from 'lucide-react';
import { ConfirmDialog } from '../components/common/ConfirmDialog.jsx';
import { useToast } from '../context/ToastContext.jsx';

export const Playlists = () => {
  const { user, isAuthenticated } = useAuth();
  const toast = useToast();

  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadPlaylists();
  }, []);

  const loadPlaylists = async () => {
    try {
      setLoading(true);
      const res = await api.playlists.getAll(false);
      if (res.success) {
        setPlaylists(res.data || []);
      }
    } catch (err) {
      toast.error('Failed to load playlists.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePlaylist = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      const res = await api.playlists.delete(deleteTarget.id);
      if (res.success) {
        toast.success(`Playlist "${deleteTarget.title}" deleted.`);
        setPlaylists((prev) => prev.filter((p) => p.id !== deleteTarget.id));
        setDeleteTarget(null);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to delete playlist.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ padding: '7px', borderRadius: '6px', backgroundColor: '#EEF2FF', color: 'var(--accent)' }}>
              <ListMusic size={20} />
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em', margin: 0 }}>
              Playlists & Collections
            </h1>
          </div>
          <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Curate custom collections of music, videos, and media streams.
          </p>
        </div>

        {isAuthenticated && (
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="btn-primary"
            style={{ fontSize: '13.5px' }}
          >
            <Plus size={16} />
            <span>New Playlist</span>
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="clean-card" style={{ height: '200px' }} />
          ))}
        </div>
      ) : playlists.length === 0 ? (
        <EmptyState
          icon={ListMusic}
          title="No playlists yet"
          description="Create your first playlist to organize your favorite audio tracks and videos."
          actionText={isAuthenticated ? 'Create Playlist' : 'Sign in to Create'}
          actionLink={!isAuthenticated ? '/login' : undefined}
          onAction={isAuthenticated ? () => setShowCreateModal(true) : undefined}
        />
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '20px'
          }}
        >
          {playlists.map((pl) => {
            const isOwner = user?.id === pl.userId;
            return (
              <div
                key={pl.id}
                className="clean-card"
                style={{
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                {/* Playlist Art / Header */}
                <Link
                  to={`/playlists/${pl.id}`}
                  style={{
                    height: '140px',
                    backgroundColor: 'var(--bg-subtle)',
                    position: 'relative',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textDecoration: 'none'
                  }}
                >
                  {pl.thumbnail ? (
                    <img
                      src={pl.thumbnail}
                      alt={pl.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        backgroundColor: '#EEF2FF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--accent)'
                      }}
                    >
                      <ListMusic size={36} />
                    </div>
                  )}

                  {/* Privacy badge */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      backgroundColor: 'rgba(0,0,0,0.6)',
                      padding: '3px 8px',
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '11px',
                      color: '#ffffff'
                    }}
                  >
                    {pl.isPublic ? <Globe size={11} /> : <Lock size={11} />}
                    <span>{pl.isPublic ? 'Public' : 'Private'}</span>
                  </div>

                  {/* Item count badge */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '10px',
                      left: '10px',
                      backgroundColor: 'rgba(0,0,0,0.7)',
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '11px',
                      fontWeight: 600,
                      color: '#ffffff'
                    }}
                  >
                    {pl.itemCount || 0} items
                  </div>
                </Link>

                {/* Playlist Info */}
                <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Link
                      to={`/playlists/${pl.id}`}
                      style={{
                        fontSize: '15px',
                        fontWeight: 600,
                        color: 'var(--text-main)',
                        textDecoration: 'none',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {pl.title}
                    </Link>

                    {isOwner && (
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(pl)}
                        style={{ color: 'var(--text-muted)', padding: '2px' }}
                        title="Delete Playlist"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>

                  {pl.description && (
                    <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', lineHeight: '1.4', margin: 0 }} className="line-clamp-2">
                      {pl.description}
                    </p>
                  )}

                  <div style={{ marginTop: 'auto', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>
                    <span>By {pl.creatorName || user?.name || 'Hub Member'}</span>
                    <Link
                      to={`/playlists/${pl.id}`}
                      style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '3px' }}
                    >
                      <span>Open</span>
                      <Play size={10} fill="currentColor" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <CreatePlaylistModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onCreated={(newPl) => {
            setPlaylists((prev) => [newPl, ...prev]);
            setShowCreateModal(false);
          }}
        />
      )}

      {/* Delete Confirmation */}
      {deleteTarget && (
        <ConfirmDialog
          isOpen={Boolean(deleteTarget)}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDeletePlaylist}
          title="Delete Playlist"
          message={`Are you sure you want to delete "${deleteTarget.title}"? The playlist will be removed, but media files will remain intact.`}
          confirmText="Delete Playlist"
          confirmVariant="danger"
          isLoading={isDeleting}
        />
      )}
    </div>
  );
};

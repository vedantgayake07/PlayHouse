import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal.jsx';
import { api } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import { Plus, Check, ListMusic } from 'lucide-react';

export const AddToPlaylistModal = ({ isOpen, onClose, media }) => {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const toast = useToast();

  useEffect(() => {
    if (isOpen) {
      loadPlaylists();
    }
  }, [isOpen]);

  const loadPlaylists = async () => {
    try {
      setLoading(true);
      const res = await api.playlists.getAll(true);
      if (res.success) {
        setPlaylists(res.data || []);
      }
    } catch (err) {
      toast.error('Failed to load playlists.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToPlaylist = async (playlistId, playlistTitle) => {
    if (!media) return;
    try {
      const res = await api.playlists.addItem(playlistId, media.id);
      if (res.success) {
        toast.success(`Added "${media.title}" to ${playlistTitle}!`);
        onClose();
      }
    } catch (err) {
      toast.error(err.message || 'Could not add to playlist.');
    }
  };

  const handleCreateAndAdd = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !media) return;

    try {
      setCreating(true);
      const res = await api.playlists.create({
        title: newTitle.trim(),
        description: 'Personal playlist',
        isPublic: true
      });

      if (res.success && res.data) {
        const newPl = res.data;
        await api.playlists.addItem(newPl.id, media.id);
        toast.success(`Created playlist "${newPl.title}" and added item!`);
        setNewTitle('');
        onClose();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to create playlist.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add to Playlist" maxWidth="440px">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Existing Playlists list */}
        <div style={{ maxHeight: '240px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {loading ? (
            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
              Loading playlists...
            </div>
          ) : playlists.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
              No playlists found. Create one below!
            </div>
          ) : (
            playlists.map((pl) => (
              <button
                key={pl.id}
                type="button"
                onClick={() => handleAddToPlaylist(pl.id, pl.title)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  backgroundColor: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                  transition: 'background-color 0.15s, border-color 0.15s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--border-color)';
                  e.currentTarget.style.borderColor = 'var(--border-hover)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
                  e.currentTarget.style.borderColor = 'var(--border-color)';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <ListMusic size={18} style={{ color: 'var(--accent-primary)' }} />
                  <span style={{ fontWeight: 500 }}>{pl.title}</span>
                </div>
                <Plus size={16} style={{ color: 'var(--text-muted)' }} />
              </button>
            ))
          )}
        </div>

        {/* Quick create new playlist */}
        <form onSubmit={handleCreateAndAdd} style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
          <label className="form-label">Or Create New Playlist</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Playlist name..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              disabled={creating}
            />
            <button
              type="submit"
              className="glow-btn"
              disabled={!newTitle.trim() || creating}
              style={{
                padding: '0 16px',
                borderRadius: 'var(--radius-md)',
                fontSize: '13px',
                fontWeight: 500,
                whiteSpace: 'nowrap',
                opacity: !newTitle.trim() || creating ? 0.6 : 1
              }}
            >
              {creating ? 'Creating...' : 'Create & Add'}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

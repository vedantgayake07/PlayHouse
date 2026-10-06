import React, { useState } from 'react';
import { Modal } from '../common/Modal.jsx';
import { api } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.jsx';

export const CreatePlaylistModal = ({ isOpen, onClose, onCreated }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      setIsLoading(true);
      const res = await api.playlists.create({
        title: title.trim(),
        description: description.trim(),
        isPublic
      });

      if (res.success) {
        toast.success(`Playlist "${res.data.title}" created successfully!`);
        setTitle('');
        setDescription('');
        setIsPublic(true);
        if (onCreated) onCreated(res.data);
        onClose();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to create playlist.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Playlist" maxWidth="460px">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label className="form-label">Playlist Title *</label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. Chill Synthwave Sessions"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            autoFocus
          />
        </div>

        <div>
          <label className="form-label">Description (Optional)</label>
          <textarea
            className="form-input"
            rows={3}
            placeholder="What kind of tracks or clips are in this playlist?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <input
            type="checkbox"
            id="isPublic"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
            style={{ width: '16px', height: '16px', accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
          />
          <label htmlFor="isPublic" style={{ fontSize: '13px', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            Make playlist public for discovery
          </label>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
          <button
            type="button"
            className="secondary-btn"
            onClick={onClose}
            disabled={isLoading}
            style={{ padding: '9px 18px', borderRadius: 'var(--radius-md)', fontSize: '14px' }}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="glow-btn"
            disabled={isLoading || !title.trim()}
            style={{
              padding: '9px 20px',
              borderRadius: 'var(--radius-md)',
              fontSize: '14px',
              fontWeight: 500,
              opacity: isLoading || !title.trim() ? 0.6 : 1
            }}
          >
            {isLoading ? 'Creating...' : 'Create Playlist'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

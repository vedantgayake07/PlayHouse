import React, { useState, useEffect, useRef } from 'react';
import { Modal } from '../common/Modal.jsx';
import { api } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import { formatBytes } from '../../utils/formatters.js';
import { Upload, Image as ImageIcon, FileCheck, AlertCircle } from 'lucide-react';

export const EditMediaModal = ({ isOpen, onClose, media, onUpdated }) => {
  const toast = useToast();

  const [title, setTitle] = useState(media?.title || '');
  const [description, setDescription] = useState(media?.description || '');
  const [categoryId, setCategoryId] = useState(media?.categoryId?.toString() || '');
  const [tags, setTags] = useState(media?.tags || '');
  const [categories, setCategories] = useState([]);

  const [replacementFile, setReplacementFile] = useState(null);
  const [replacementThumb, setReplacementThumb] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fileInputRef = useRef(null);
  const thumbInputRef = useRef(null);

  useEffect(() => {
    if (media) {
      setTitle(media.title || '');
      setDescription(media.description || '');
      setCategoryId(media.categoryId ? media.categoryId.toString() : '');
      setTags(media.tags || '');
      setReplacementFile(null);
      setReplacementThumb(null);
      setErrorMsg('');
    }
  }, [media]);

  useEffect(() => {
    api.categories.getAll()
      .then((res) => {
        if (res.success && res.data) setCategories(res.data);
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Title is required.');
      return;
    }

    try {
      setIsSaving(true);
      setErrorMsg('');

      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      if (categoryId) formData.append('categoryId', categoryId);
      formData.append('tags', tags.trim());

      if (replacementFile) {
        formData.append('file', replacementFile);
      }
      if (replacementThumb) {
        formData.append('thumbnail', replacementThumb);
      }

      const res = await api.media.update(media.id, formData);
      if (res.success && res.data) {
        toast.success(`"${res.data.title}" updated successfully.`);
        if (onUpdated) onUpdated(res.data);
        onClose();
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to update media.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!media) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Media Details" maxWidth="520px">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {errorMsg && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--danger-bg)',
              border: '1px solid var(--danger-border)',
              color: 'var(--danger)',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        <div>
          <label className="form-label">Title *</label>
          <input
            type="text"
            className="form-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            autoFocus
          />
        </div>

        <div>
          <label className="form-label">Description</label>
          <textarea
            className="form-input"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <div>
            <label className="form-label">Category</label>
            <select
              className="form-input"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              <option value="">Unassigned</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label">Tags (comma-separated)</label>
            <input
              type="text"
              className="form-input"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </div>
        </div>

        {/* Replace Media File */}
        <div>
          <label className="form-label">Replace Media File (Optional)</label>
          <div
            onClick={() => fileInputRef.current?.click()}
            style={{
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              border: '1px dashed var(--border-light)',
              backgroundColor: 'var(--bg-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Upload size={16} style={{ color: 'var(--text-muted)' }} />
              <span style={{ fontSize: '13px', color: replacementFile ? 'var(--text-main)' : 'var(--text-muted)' }}>
                {replacementFile ? `${replacementFile.name} (${formatBytes(replacementFile.size)})` : 'Click to select replacement file'}
              </span>
            </div>
            <span style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: 500 }}>
              {replacementFile ? 'Change' : 'Browse'}
            </span>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            style={{ display: 'none' }}
            onChange={(e) => setReplacementFile(e.target.files?.[0] || null)}
          />
        </div>

        {/* Replace Thumbnail */}
        <div>
          <label className="form-label">Replace Thumbnail / Poster (Optional)</label>
          <div
            onClick={() => thumbInputRef.current?.click()}
            style={{
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              border: '1px dashed var(--border-light)',
              backgroundColor: 'var(--bg-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ImageIcon size={16} style={{ color: 'var(--text-muted)' }} />
              <span style={{ fontSize: '13px', color: replacementThumb ? 'var(--text-main)' : 'var(--text-muted)' }}>
                {replacementThumb ? replacementThumb.name : 'Click to upload replacement image'}
              </span>
            </div>
            <span style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: 500 }}>
              {replacementThumb ? 'Change' : 'Browse'}
            </span>
          </div>
          <input
            ref={thumbInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={(e) => setReplacementThumb(e.target.files?.[0] || null)}
          />
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
          <button
            type="button"
            className="btn-secondary"
            onClick={onClose}
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={isSaving || !title.trim()}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

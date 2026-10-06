import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { formatBytes } from '../utils/formatters.js';
import {
  Upload as UploadIcon,
  FileText,
  Film,
  Music,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  X,
  FileCheck,
  FolderOpen
} from 'lucide-react';

export const Upload = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();
  const toast = useToast();

  const [categories, setCategories] = useState([]);
  const [file, setFile] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [tags, setTags] = useState('');
  const [detectedType, setDetectedType] = useState(searchParams.get('type') || '');

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');

  const fileInputRef = useRef(null);
  const thumbInputRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated) {
      toast.info('Please sign in to upload media.');
      navigate('/login');
      return;
    }
    api.categories.getAll()
      .then((res) => {
        if (res.success && res.data) {
          setCategories(res.data);
          if (res.data.length > 0) setCategoryId(res.data[0].id.toString());
        }
      })
      .catch(() => {});
  }, [isAuthenticated, navigate]);

  const handleFileChange = (selectedFile) => {
    if (!selectedFile) return;

    // Check size limit: 100MB
    if (selectedFile.size > 100 * 1024 * 1024) {
      setErrorMsg('File size exceeds the 100MB maximum limit.');
      return;
    }

    setErrorMsg('');
    setFile(selectedFile);

    // Auto-fill title from filename if title is empty
    if (!title) {
      const cleanName = selectedFile.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
    }

    // Detect type
    const mime = selectedFile.type || '';
    const name = selectedFile.name.toLowerCase();

    if (mime.startsWith('video/') || ['.mp4', '.webm', '.mkv', '.mov'].some(ext => name.endsWith(ext))) {
      setDetectedType('video');
    } else if (mime.startsWith('audio/') || ['.mp3', '.wav', '.flac', '.ogg'].some(ext => name.endsWith(ext))) {
      setDetectedType('audio');
    } else if (mime.startsWith('image/') || ['.jpg', '.jpeg', '.png', '.webp', '.svg'].some(ext => name.endsWith(ext))) {
      setDetectedType('image');
    } else {
      setDetectedType('document');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setErrorMsg('Please select a media file to upload.');
      return;
    }
    if (!title.trim()) {
      setErrorMsg('Media title is required.');
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);
      setErrorMsg('');

      const formData = new FormData();
      formData.append('file', file);
      if (thumbnail) {
        formData.append('thumbnail', thumbnail);
      }
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('categoryId', categoryId);
      formData.append('tags', tags.trim());

      const res = await api.media.upload(formData, (percent) => {
        setUploadProgress(percent);
      });

      if (res.success) {
        toast.success(`"${title}" uploaded successfully!`);
        // Navigate to Browse / Explore so the new file appears immediately
        navigate('/explore');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Upload failed. Please check file format and try again.');
      toast.error('Upload failed.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div style={{ maxWidth: '780px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em', margin: 0 }}>
          Upload New File
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>
          Add videos, audio recordings, high-resolution imagery, or PDF documents to the distributed repository.
        </p>
      </div>

      {errorMsg && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: '#FEE2E2',
            border: '1px solid #FCA5A5',
            color: '#B91C1C',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '13.5px'
          }}
        >
          <AlertCircle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Upload Form Card */}
      <form
        onSubmit={handleSubmit}
        className="clean-card"
        style={{
          padding: '28px',
          display: 'flex',
          flexDirection: 'column',
          gap: '22px'
        }}
      >
        {/* Drag & Drop File Zone */}
        <div>
          <label className="form-label" style={{ marginBottom: '8px', display: 'block' }}>
            Media File * <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(Up to 100MB)</span>
          </label>
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: `2px dashed ${file ? 'var(--accent)' : 'var(--border-medium)'}`,
              borderRadius: 'var(--radius-md)',
              padding: '36px 20px',
              textAlign: 'center',
              backgroundColor: file ? '#F0F4FF' : '#FAFAFA',
              cursor: 'pointer',
              transition: 'all 150ms ease'
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              onChange={(e) => handleFileChange(e.target.files?.[0])}
              style={{ display: 'none' }}
              accept="video/*,audio/*,image/*,.pdf,.doc,.docx,.txt,.md"
            />

            {file ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--accent)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFFFFF'
                  }}
                >
                  <FileCheck size={22} />
                </div>
                <div style={{ fontSize: '14.5px', fontWeight: 600, color: 'var(--text-main)' }}>
                  {file.name}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  {formatBytes(file.size)} • Type: <strong style={{ textTransform: 'capitalize', color: 'var(--accent)' }}>{detectedType}</strong>
                </div>
                <span style={{ fontSize: '12px', color: 'var(--accent)', textDecoration: 'underline', marginTop: '4px' }}>
                  Click to choose a different file
                </span>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    backgroundColor: '#F3F4F6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--text-muted)'
                  }}
                >
                  <UploadIcon size={20} />
                </div>
                <div style={{ fontSize: '14.5px', fontWeight: 600, color: 'var(--text-main)' }}>
                  Drag and drop file here, or click to browse
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Supports MP4, WebM, MP3, WAV, JPG, PNG, WebP, SVG, PDF, DOCX
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="form-label">Title *</label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. Distributed Consensus in Multimedia Networks"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="form-label">Description</label>
          <textarea
            className="form-input"
            rows={3}
            placeholder="Brief overview or context for this file..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Category & Tags */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          <div>
            <label className="form-label">Category</label>
            <select
              className="form-input"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
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
              placeholder="e.g. video, 1080p, systems"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </div>
        </div>

        {/* Optional Custom Poster / Thumbnail */}
        <div>
          <label className="form-label">Custom Poster / Thumbnail (Optional)</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <input
              ref={thumbInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={(e) => setThumbnail(e.target.files?.[0] || null)}
            />
            <button
              type="button"
              className="btn-secondary"
              onClick={() => thumbInputRef.current?.click()}
              style={{ fontSize: '13px' }}
            >
              {thumbnail ? 'Change Poster' : 'Select Poster Image'}
            </button>
            {thumbnail && (
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                {thumbnail.name} ({formatBytes(thumbnail.size)})
              </span>
            )}
          </div>
        </div>

        {/* Real Upload Progress Bar */}
        {isUploading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text-main)', fontWeight: 500 }}>
              <span>Uploading to server repository...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div style={{ height: '6px', backgroundColor: '#E5E7EB', borderRadius: '3px', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${uploadProgress}%`,
                  backgroundColor: 'var(--accent)',
                  transition: 'width 150ms ease'
                }}
              />
            </div>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid var(--border-light)', paddingTop: '16px' }}>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => navigate(-1)}
            disabled={isUploading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={isUploading || !file}
            style={{ minWidth: '130px' }}
          >
            {isUploading ? `Uploading ${uploadProgress}%` : 'Upload File'}
          </button>
        </div>
      </form>
    </div>
  );
};

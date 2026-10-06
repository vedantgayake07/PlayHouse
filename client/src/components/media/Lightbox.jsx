import React, { useState, useEffect } from 'react';
import { usePlayer } from '../../context/PlayerContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { api } from '../../services/api.js';
import { ConfirmDialog } from '../common/ConfirmDialog.jsx';
import { EditMediaModal } from './EditMediaModal.jsx';
import {
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Download,
  Trash2,
  Edit2
} from 'lucide-react';

export const Lightbox = () => {
  const { lightboxImage, closeLightbox, nextLightbox, prevLightbox } = usePlayer();
  const { user, isAuthenticated, isAdmin } = useAuth();
  const toast = useToast();
  const [scale, setScale] = useState(1);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const canManage = isAuthenticated && (Boolean(isAdmin) || user?.role === 'ADMIN' || Number(lightboxImage?.uploadedBy) === Number(user?.id));

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') nextLightbox();
      if (e.key === 'ArrowLeft') prevLightbox();
    };
    if (lightboxImage) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [lightboxImage, closeLightbox, nextLightbox, prevLightbox]);

  useEffect(() => {
    // Reset scale when image changes
    setScale(1);
  }, [lightboxImage]);

  if (!lightboxImage) return null;

  const handleZoomIn = () => setScale((s) => Math.min(3, s + 0.25));
  const handleZoomOut = () => setScale((s) => Math.max(0.5, s - 0.25));
  const handleResetZoom = () => setScale(1);

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = lightboxImage.filePath;
    a.download = lightboxImage.title || 'image';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success('Download started.');
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const res = await api.media.delete(lightboxImage.id);
      if (res.success) {
        toast.success(`"${lightboxImage.title}" deleted.`);
        setShowDeleteConfirm(false);
        closeLightbox();
        // Notify components to update
        window.dispatchEvent(new CustomEvent('media-deleted', { detail: { id: lightboxImage.id } }));
      }
    } catch (err) {
      toast.error(err.message || 'Failed to delete image.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUpdated = (updated) => {
    toast.success('Image details updated.');
    setShowEditModal(false);
    window.dispatchEvent(new CustomEvent('media-updated', { detail: { media: updated } }));
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        animation: 'modalFade 0.2s ease-out'
      }}
    >
      {/* Top control bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 24px',
          backgroundColor: '#0D0E12',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          zIndex: 10
        }}
      >
        <div>
          <h4 style={{ fontSize: '15px', fontWeight: 600, color: '#ffffff', margin: 0 }}>
            {lightboxImage.title}
          </h4>
          <span style={{ fontSize: '12px', color: '#9CA3AF' }}>
            {lightboxImage.categoryName || 'Gallery'} • by {lightboxImage.uploaderName || 'Hub Member'}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Zoom In */}
          <button
            type="button"
            onClick={handleZoomIn}
            title="Zoom In"
            style={{
              padding: '7px 10px',
              borderRadius: 'var(--radius-sm)',
              color: '#ffffff',
              backgroundColor: 'rgba(255, 255, 255, 0.1)'
            }}
          >
            <ZoomIn size={16} />
          </button>

          {/* Zoom Out */}
          <button
            type="button"
            onClick={handleZoomOut}
            title="Zoom Out"
            style={{
              padding: '7px 10px',
              borderRadius: 'var(--radius-sm)',
              color: '#ffffff',
              backgroundColor: 'rgba(255, 255, 255, 0.1)'
            }}
          >
            <ZoomOut size={16} />
          </button>

          {/* Reset Zoom */}
          <button
            type="button"
            onClick={handleResetZoom}
            title="Reset Zoom"
            style={{
              padding: '7px 10px',
              borderRadius: 'var(--radius-sm)',
              color: '#ffffff',
              backgroundColor: 'rgba(255, 255, 255, 0.1)'
            }}
          >
            <RotateCcw size={16} />
          </button>

          {/* Download */}
          <button
            type="button"
            onClick={handleDownload}
            title="Download Full Resolution"
            style={{
              padding: '7px 12px',
              borderRadius: 'var(--radius-sm)',
              color: '#ffffff',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12.5px'
            }}
          >
            <Download size={15} />
            <span>Download</span>
          </button>

          {/* Edit & Delete Buttons (Admin or Owner only) */}
          {canManage && (
            <>
              <button
                type="button"
                onClick={() => setShowEditModal(true)}
                title="Edit Image Details"
                style={{
                  padding: '7px 12px',
                  borderRadius: 'var(--radius-sm)',
                  color: '#ffffff',
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '12.5px'
                }}
              >
                <Edit2 size={14} />
                <span>Edit</span>
              </button>

              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                title="Delete Image"
                style={{
                  padding: '7px 14px',
                  borderRadius: 'var(--radius-sm)',
                  color: '#ffffff',
                  backgroundColor: '#EF4444',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <Trash2 size={15} />
                <span>Delete Image</span>
              </button>
            </>
          )}

          {/* Close */}
          <button
            type="button"
            onClick={closeLightbox}
            title="Close Lightbox (Esc)"
            style={{
              padding: '7px 10px',
              borderRadius: 'var(--radius-sm)',
              color: '#ffffff',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              marginLeft: '6px'
            }}
          >
            <X size={17} />
          </button>
        </div>
      </div>

      {/* Main Image Stage */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
          padding: '24px'
        }}
      >
        {/* Navigation arrows */}
        <button
          type="button"
          onClick={prevLightbox}
          style={{
            position: 'absolute',
            left: '24px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(8px)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10
          }}
        >
          <ChevronLeft size={22} />
        </button>

        <img
          src={lightboxImage.filePath}
          alt={lightboxImage.title}
          style={{
            maxWidth: '90%',
            maxHeight: '80vh',
            objectFit: 'contain',
            borderRadius: '8px',
            transform: `scale(${scale})`,
            transition: 'transform 0.15s ease',
            boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
            userSelect: 'none'
          }}
        />

        <button
          type="button"
          onClick={nextLightbox}
          style={{
            position: 'absolute',
            right: '24px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(8px)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10
          }}
        >
          <ChevronRight size={22} />
        </button>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <ConfirmDialog
          isOpen={showDeleteConfirm}
          title="Delete Uploaded Image"
          message={`Are you sure you want to permanently delete "${lightboxImage.title}"? This cannot be undone.`}
          confirmText="Delete Image"
          confirmVariant="danger"
          isLoading={isDeleting}
          onConfirm={handleDelete}
          onClose={() => setShowDeleteConfirm(false)}
        />
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <EditMediaModal
          isOpen={showEditModal}
          media={lightboxImage}
          onClose={() => setShowEditModal(false)}
          onUpdated={handleUpdated}
        />
      )}
    </div>
  );
};

import React, { useState, useRef, useEffect } from 'react';
import { usePlayer } from '../../context/PlayerContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { api } from '../../services/api.js';
import { formatTime, formatDate, formatBytes, getMediaTypeDetails } from '../../utils/formatters.js';
import { RatingStars } from '../common/RatingStars.jsx';
import { AddToPlaylistModal } from '../playlist/AddToPlaylistModal.jsx';
import { EditMediaModal } from './EditMediaModal.jsx';
import { ConfirmDialog } from '../common/ConfirmDialog.jsx';
import {
  Play,
  Pause,
  Heart,
  MoreVertical,
  Download,
  ListPlus,
  Trash2,
  Edit2,
  Film,
  Music,
  Image as ImageIcon,
  FileText
} from 'lucide-react';

export const MediaCard = ({ media: initialMedia, onDeleted, onUpdated, mediaList = [] }) => {
  const [media, setMedia] = useState(initialMedia);
  const { currentTrack, isPlaying, playTrack, openVideo, openDocument, openLightbox } = usePlayer();
  const { user, isAuthenticated, isAdmin } = useAuth();
  const toast = useToast();

  const [isFav, setIsFav] = useState(Boolean(media.isFavorite));
  const [showMenu, setShowMenu] = useState(false);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const menuRef = useRef(null);

  useEffect(() => {
    setMedia(initialMedia);
    setIsFav(Boolean(initialMedia.isFavorite));
  }, [initialMedia]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isCurrentAudio = media.mediaType === 'audio' && currentTrack?.id === media.id;
  const isAudioPlaying = isCurrentAudio && isPlaying;
  const typeDetails = getMediaTypeDetails(media.mediaType);

  const canManage = isAuthenticated && (Number(media.uploadedBy) === Number(user?.id) || Boolean(isAdmin) || user?.role === 'ADMIN');

  const handleCardClick = () => {
    switch (media.mediaType) {
      case 'video':
        openVideo(media);
        break;
      case 'audio':
        playTrack(media, mediaList.filter((m) => m.mediaType === 'audio'));
        break;
      case 'image':
        openLightbox(media, mediaList.filter((m) => m.mediaType === 'image'));
        break;
      case 'document':
        openDocument(media);
        break;
      default:
        break;
    }
  };

  const handleFavoriteToggle = async (e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.info('Please sign in to save favorites.');
      return;
    }

    try {
      const res = await api.favorites.toggle(media.id);
      if (res.success) {
        setIsFav(res.isFavorite);
        toast.success(res.isFavorite ? 'Added to favorites.' : 'Removed from favorites.');
      }
    } catch (err) {
      toast.error('Failed to update favorite.');
    }
  };

  const handleDownload = (e) => {
    e.stopPropagation();
    setShowMenu(false);
    const a = document.createElement('a');
    a.href = media.filePath;
    a.download = media.title || 'download';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success('Download started.');
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const res = await api.media.delete(media.id);
      if (res.success) {
        toast.success(`"${media.title}" deleted.`);
        setShowDeleteConfirm(false);
        if (onDeleted) onDeleted(media.id);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to delete media.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleMediaUpdated = (updated) => {
    setMedia(updated);
    if (onUpdated) onUpdated(updated);
  };

  const getTypeIcon = () => {
    switch (media.mediaType) {
      case 'video': return <Film size={12} />;
      case 'audio': return <Music size={12} />;
      case 'image': return <ImageIcon size={12} />;
      default: return <FileText size={12} />;
    }
  };

  return (
    <>
      <div
        className="clean-card"
        style={{
          display: 'flex',
          flexDirection: 'column',
          cursor: 'pointer',
          position: 'relative',
          overflow: 'hidden'
        }}
        onClick={handleCardClick}
      >
        {/* 16:9 Thumbnail Area */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            aspectRatio: '16 / 9',
            backgroundColor: '#F3F4F6',
            overflow: 'hidden',
            borderBottom: '1px solid var(--border-subtle)'
          }}
        >
          {media.thumbnail || media.mediaType === 'image' ? (
            <img
              src={media.thumbnail || media.filePath}
              alt={media.title}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <div
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-muted)',
                backgroundColor: '#F3F4F6'
              }}
            >
              {media.mediaType === 'video' ? <Film size={32} /> :
               media.mediaType === 'audio' ? <Music size={32} /> :
               media.mediaType === 'image' ? <ImageIcon size={32} /> : <FileText size={32} />}
            </div>
          )}

          {/* Type Badge */}
          <div
            style={{
              position: 'absolute',
              top: '10px',
              left: '10px',
              backgroundColor: typeDetails.bg,
              color: typeDetails.color,
              padding: '3px 8px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '11px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              letterSpacing: '0.02em',
              border: '1px solid rgba(0, 0, 0, 0.04)'
            }}
          >
            {getTypeIcon()}
            <span>{typeDetails.label}</span>
          </div>

          {/* Quick Action Buttons on Thumbnail Top-Right */}
          <div style={{ position: 'absolute', top: '8px', right: '8px', display: 'flex', alignItems: 'center', gap: '6px', zIndex: 10 }}>
            {/* Direct Quick Delete button - only shown for owner or admin */}
            {canManage && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDeleteConfirm(true);
                }}
                title="Delete this media file"
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: '#FFFFFF',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--danger)',
                  border: '1px solid var(--border-light)',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#FEE2E2';
                  e.currentTarget.style.color = '#B91C1C';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#FFFFFF';
                  e.currentTarget.style.color = 'var(--danger)';
                }}
              >
                <Trash2 size={13} />
              </button>
            )}

            {/* Favorite button */}
            <button
              type="button"
              onClick={handleFavoriteToggle}
              title={isFav ? 'Remove from favorites' : 'Add to favorites'}
              style={{
                width: '30px',
                height: '30px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: '#FFFFFF',
                boxShadow: '0 1px 4px rgba(0,0,0,0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isFav ? '#EF4444' : 'var(--text-muted)',
                border: '1px solid var(--border-light)'
              }}
            >
              <Heart size={14} fill={isFav ? '#EF4444' : 'none'} />
            </button>
          </div>

          {/* Duration or Size badge */}
          {media.duration > 0 ? (
            <div
              style={{
                position: 'absolute',
                bottom: '8px',
                right: '8px',
                backgroundColor: 'rgba(0, 0, 0, 0.75)',
                color: '#FFFFFF',
                padding: '2px 6px',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: 500
              }}
            >
              {formatTime(media.duration)}
            </div>
          ) : media.size > 0 ? (
            <div
              style={{
                position: 'absolute',
                bottom: '8px',
                right: '8px',
                backgroundColor: 'rgba(0, 0, 0, 0.75)',
                color: '#FFFFFF',
                padding: '2px 6px',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: 500
              }}
            >
              {formatBytes(media.size)}
            </div>
          ) : null}

          {/* Quick Play Circle Overlay for audio/video */}
          {(media.mediaType === 'video' || media.mediaType === 'audio') && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: isAudioPlaying ? 1 : 0,
                transition: 'opacity 150ms ease'
              }}
              className="card-play-hover"
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: '#FFFFFF',
                  color: 'var(--accent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                }}
              >
                {isAudioPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" style={{ marginLeft: '2px' }} />}
              </div>
            </div>
          )}
        </div>

        {/* Card Body */}
        <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
            <h3
              style={{
                fontSize: '14px',
                fontWeight: 600,
                color: 'var(--text-main)',
                lineHeight: '1.3'
              }}
              className="line-clamp-1"
              title={media.title}
            >
              {media.title}
            </h3>

            {/* Three-Dot Menu */}
            <div ref={menuRef} style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu((prev) => !prev);
                }}
                style={{
                  padding: '4px',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-subtle)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <MoreVertical size={16} />
              </button>

              {showMenu && (
                <div
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: 'calc(100% + 4px)',
                    width: '160px',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid var(--border-light)',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: 'var(--shadow-hover)',
                    padding: '4px',
                    zIndex: 50
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {canManage && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowMenu(false);
                        setShowEditModal(true);
                      }}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '7px 10px',
                        fontSize: '13px',
                        color: 'var(--text-main)',
                        borderRadius: 'var(--radius-sm)'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-subtle)')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <Edit2 size={14} />
                      <span>Edit</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setShowMenu(false);
                      setShowPlaylistModal(true);
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '7px 10px',
                      fontSize: '13px',
                      color: 'var(--text-main)',
                      borderRadius: 'var(--radius-sm)'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-subtle)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <ListPlus size={14} />
                    <span>Add to Playlist</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownload}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '7px 10px',
                      fontSize: '13px',
                      color: 'var(--text-main)',
                      borderRadius: 'var(--radius-sm)'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-subtle)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <Download size={14} />
                    <span>Download</span>
                  </button>

                  {canManage && (
                    <>
                      <div style={{ height: '1px', backgroundColor: 'var(--border-subtle)', margin: '4px 0' }} />
                      <button
                        type="button"
                        onClick={() => {
                          setShowMenu(false);
                          setShowDeleteConfirm(true);
                        }}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '7px 10px',
                          fontSize: '13px',
                          color: 'var(--danger)',
                          borderRadius: 'var(--radius-sm)'
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--danger-bg)')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                      >
                        <Trash2 size={14} />
                        <span>Delete</span>
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Description line */}
          {media.description && (
            <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', lineHeight: '1.4' }} className="line-clamp-2">
              {media.description}
            </p>
          )}

          {/* Metadata Row */}
          <div style={{ marginTop: 'auto', paddingTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11.5px', color: 'var(--text-faint)' }}>
            <span>{media.categoryName || 'General'}</span>
            <span>{formatDate(media.createdAt)}</span>
          </div>
        </div>

        <style>{`
          .clean-card:hover .card-play-hover {
            opacity: 1 !important;
          }
        `}</style>
      </div>

      {/* Modals */}
      {showPlaylistModal && (
        <AddToPlaylistModal
          isOpen={showPlaylistModal}
          onClose={() => setShowPlaylistModal(false)}
          media={media}
        />
      )}

      {showEditModal && (
        <EditMediaModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          media={media}
          onUpdated={handleMediaUpdated}
        />
      )}

      {showDeleteConfirm && (
        <ConfirmDialog
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={handleDelete}
          title="Delete Media File"
          message={`Are you sure you want to delete "${media.title}"? The file will be permanently removed from disk and database.`}
          confirmText="Delete File"
          isLoading={isDeleting}
        />
      )}
    </>
  );
};

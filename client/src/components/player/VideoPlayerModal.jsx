import React, { useState, useRef, useEffect, useCallback } from 'react';
import { usePlayer } from '../../context/PlayerContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { api } from '../../services/api.js';
import { formatTime, formatDate, formatBytes, getMediaTypeDetails } from '../../utils/formatters.js';
import { RatingStars } from '../common/RatingStars.jsx';
import { EditMediaModal } from '../media/EditMediaModal.jsx';
import { ConfirmDialog } from '../common/ConfirmDialog.jsx';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  PictureInPicture,
  RotateCcw,
  RotateCw,
  X,
  Eye,
  Calendar,
  Send,
  Edit2,
  Trash2,
  Download,
  Film,
  Music,
  ArrowRight
} from 'lucide-react';

export const VideoPlayerModal = () => {
  const { activeVideo, openVideo, closeVideo, playTrack } = usePlayer();
  const { user, isAuthenticated, isAdmin } = useAuth();
  const toast = useToast();

  const videoRef = useRef(null);
  const containerRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);

  // Ratings state
  const [userRating, setUserRating] = useState(activeVideo?.userRating || 0);
  const [reviewText, setReviewText] = useState('');
  const [ratingsList, setRatingsList] = useState(activeVideo?.ratings || []);
  const [avgRating, setAvgRating] = useState(activeVideo?.rating || 0);
  const [ratingCount, setRatingCount] = useState(activeVideo?.ratingCount || 0);

  // Edit / Delete state
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const canManage = isAuthenticated && (Boolean(isAdmin) || user?.role === 'ADMIN' || Number(activeVideo?.uploadedBy) === Number(user?.id));

  // Related media items
  const [relatedItems, setRelatedItems] = useState([]);

  const controlsTimeoutRef = useRef(null);

  // Resume progress if exists
  useEffect(() => {
    if (activeVideo && videoRef.current) {
      if (activeVideo.watchProgress > 0) {
        videoRef.current.currentTime = activeVideo.watchProgress;
      }
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  }, [activeVideo]);

  // Load latest ratings list
  useEffect(() => {
    if (activeVideo) {
      api.ratings.getByMediaId(activeVideo.id)
        .then((res) => {
          if (res.success && res.data) {
            setRatingsList(res.data.ratings || []);
            setAvgRating(res.data.stats?.averageRating || 0);
            setRatingCount(res.data.stats?.totalRatings || 0);
          }
        })
        .catch(() => {});
    }
  }, [activeVideo]);

  // Load related items from same category or general media
  useEffect(() => {
    if (activeVideo) {
      const params = { limit: 6 };
      if (activeVideo.categoryId) params.categoryId = activeVideo.categoryId;
      api.media.getAll(params)
        .then((res) => {
          if (res.success && res.data) {
            const filtered = (res.data.items || []).filter((item) => item.id !== activeVideo.id);
            setRelatedItems(filtered.slice(0, 4));
          }
        })
        .catch(() => {});
    }
  }, [activeVideo]);

  // Record history periodically
  useEffect(() => {
    if (!activeVideo || !isPlaying) return;

    const interval = setInterval(() => {
      if (videoRef.current && currentTime > 0) {
        const completed = duration > 0 && currentTime >= duration - 2 ? 1 : 0;
        api.history.record(activeVideo.id, Math.floor(currentTime), completed).catch(() => {});
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [activeVideo, isPlaying, currentTime, duration]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!activeVideo) return;
      if (['input', 'textarea'].includes(document.activeElement?.tagName?.toLowerCase())) return;

      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.code === 'ArrowRight') {
        seekRelative(5);
      } else if (e.code === 'ArrowLeft') {
        seekRelative(-5);
      } else if (e.code === 'KeyM') {
        toggleMute();
      } else if (e.code === 'KeyF') {
        toggleFullscreen();
      } else if (e.code === 'Escape' && !isFullscreen) {
        closeVideo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeVideo, isPlaying, isMuted, isFullscreen]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const seekRelative = (seconds) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.max(0, Math.min(duration, videoRef.current.currentTime + seconds));
    setCurrentTime(videoRef.current.currentTime);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleSpeedChange = (speed) => {
    if (!videoRef.current) return;
    videoRef.current.playbackRate = speed;
    setPlaybackSpeed(speed);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const togglePip = async () => {
    if (!videoRef.current) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await videoRef.current.requestPictureInPicture();
      }
    } catch (err) {
      console.warn('PiP not supported or failed:', err);
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 2500);
  };

  const handleRateSubmit = async (score) => {
    if (!isAuthenticated) {
      toast.info('Please sign in to rate media.');
      return;
    }

    try {
      const res = await api.ratings.rate(activeVideo.id, score, reviewText);
      if (res.success) {
        setUserRating(score);
        setAvgRating(res.data.averageRating);
        setRatingCount(res.data.ratingCount);
        toast.success(`Rated ${score} stars!`);
        const rList = await api.ratings.getByMediaId(activeVideo.id);
        if (rList.success) setRatingsList(rList.data.ratings || []);
        setReviewText('');
      }
    } catch (err) {
      toast.error('Failed to submit rating.');
    }
  };

  const handleDownload = () => {
    if (!activeVideo?.filePath) return;
    const link = document.createElement('a');
    link.href = activeVideo.filePath;
    link.download = activeVideo.title || 'media';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Download started.');
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const res = await api.media.delete(activeVideo.id);
      if (res.success) {
        toast.success('Media permanently deleted.');
        setShowDeleteConfirm(false);
        closeVideo();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to delete media.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUpdated = (updated) => {
    openVideo(updated);
    toast.success('Media details updated.');
    setShowEditModal(false);
  };

  if (!activeVideo) return null;

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto'
      }}
    >
      {/* Top Modal Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 24px',
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid var(--border-light)',
          position: 'sticky',
          top: 0,
          zIndex: 20
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
            {activeVideo.title}
          </h3>
          <span
            style={{
              padding: '2px 8px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: '#EEF2FF',
              color: 'var(--accent)',
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase'
            }}
          >
            Video
          </span>
        </div>

        <button
          type="button"
          onClick={closeVideo}
          style={{
            padding: '6px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'transparent',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-subtle)')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          title="Close player (Esc)"
        >
          <X size={20} />
        </button>
      </div>

      {/* Main Content Area */}
      <div style={{ maxWidth: '1100px', width: '100%', margin: '0 auto', padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Video Cinema Container */}
        <div
          ref={containerRef}
          onMouseMove={handleMouseMove}
          style={{
            position: 'relative',
            width: '100%',
            backgroundColor: '#0A0A0B',
            borderRadius: 'var(--radius-card)',
            overflow: 'hidden',
            aspectRatio: '16 / 9',
            boxShadow: 'var(--shadow-drawer)'
          }}
        >
          <video
            ref={videoRef}
            src={activeVideo.filePath}
            poster={activeVideo.thumbnail}
            onClick={togglePlay}
            onTimeUpdate={() => setCurrentTime(videoRef.current?.currentTime || 0)}
            onLoadedMetadata={() => setDuration(videoRef.current?.duration || 0)}
            onEnded={() => {
              setIsPlaying(false);
              api.history.record(activeVideo.id, Math.floor(duration), 1).catch(() => {});
            }}
            style={{ width: '100%', height: '100%', objectFit: 'contain', cursor: 'pointer' }}
          />

          {/* Center Play Overlay Icon when paused */}
          {!isPlaying && (
            <div
              onClick={togglePlay}
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(0, 0, 0, 0.4)',
                cursor: 'pointer'
              }}
            >
              <div
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--accent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  boxShadow: '0 4px 14px rgba(47, 91, 255, 0.4)'
                }}
              >
                <Play size={26} style={{ marginLeft: '3px' }} />
              </div>
            </div>
          )}

          {/* Custom Video Controls Bar */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              padding: '16px 20px',
              background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0) 100%)',
              opacity: showControls ? 1 : 0,
              transition: 'opacity 0.2s ease',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}
          >
            {/* Scrubber track */}
            <div
              style={{
                height: '6px',
                width: '100%',
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
                borderRadius: '3px',
                cursor: 'pointer',
                position: 'relative'
              }}
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const pos = (e.clientX - rect.left) / rect.width;
                if (videoRef.current) {
                  videoRef.current.currentTime = pos * duration;
                  setCurrentTime(pos * duration);
                }
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${progressPercent}%`,
                  backgroundColor: 'var(--accent)',
                  borderRadius: '3px',
                  position: 'relative'
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    right: '-5px',
                    top: '-3px',
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: '#FFFFFF',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.4)'
                  }}
                />
              </div>
            </div>

            {/* Bottom Controls Row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#FFFFFF' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <button type="button" onClick={togglePlay} style={{ color: '#FFFFFF' }}>
                  {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                </button>

                <button type="button" onClick={() => seekRelative(-5)} title="Back 5s" style={{ color: '#FFFFFF' }}>
                  <RotateCcw size={16} />
                </button>
                <button type="button" onClick={() => seekRelative(5)} title="Forward 5s" style={{ color: '#FFFFFF' }}>
                  <RotateCw size={16} />
                </button>

                {/* Volume */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <button type="button" onClick={toggleMute} style={{ color: '#FFFFFF' }}>
                    {isMuted || volume === 0 ? <VolumeX size={17} /> : <Volume2 size={17} />}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => {
                      const v = parseFloat(e.target.value);
                      setVolume(v);
                      if (videoRef.current) {
                        videoRef.current.volume = v;
                        videoRef.current.muted = false;
                      }
                      setIsMuted(false);
                    }}
                    style={{ width: '65px' }}
                  />
                </div>

                {/* Time */}
                <span style={{ fontSize: '12px', color: '#E5E7EB' }}>
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              {/* Right tools */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <select
                  value={playbackSpeed}
                  onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    border: 'none',
                    color: '#FFFFFF',
                    borderRadius: '4px',
                    padding: '2px 6px',
                    fontSize: '11px',
                    cursor: 'pointer'
                  }}
                >
                  <option value="0.5" style={{ color: '#111' }}>0.5x</option>
                  <option value="0.75" style={{ color: '#111' }}>0.75x</option>
                  <option value="1.0" style={{ color: '#111' }}>1.0x</option>
                  <option value="1.25" style={{ color: '#111' }}>1.25x</option>
                  <option value="1.5" style={{ color: '#111' }}>1.5x</option>
                  <option value="2.0" style={{ color: '#111' }}>2.0x</option>
                </select>

                <button type="button" onClick={togglePip} title="Picture in Picture" style={{ color: '#FFFFFF' }}>
                  <PictureInPicture size={16} />
                </button>

                <button type="button" onClick={toggleFullscreen} title="Fullscreen (F)" style={{ color: '#FFFFFF' }}>
                  {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Video Metadata & Actions Card */}
        <div className="clean-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ flex: 1, minWidth: '260px' }}>
              <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em', margin: 0 }}>
                {activeVideo.title}
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginTop: '8px', fontSize: '13px', color: 'var(--text-muted)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Eye size={14} />
                  {activeVideo.views || 0} views
                </span>
                <span>•</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Calendar size={14} />
                  {formatDate(activeVideo.createdAt)}
                </span>
                {activeVideo.categoryName && (
                  <>
                    <span>•</span>
                    <span>Category: <strong>{activeVideo.categoryName}</strong></span>
                  </>
                )}
                {activeVideo.size && (
                  <>
                    <span>•</span>
                    <span>{formatBytes(activeVideo.size)}</span>
                  </>
                )}
              </div>
            </div>

            {/* Actions: Edit, Delete, Download */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={handleDownload}
                style={{ padding: '8px 14px', fontSize: '13px' }}
                title="Download video"
              >
                <Download size={15} />
                <span>Download</span>
              </button>

              {canManage && (
                <>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setShowEditModal(true)}
                    style={{ padding: '8px 14px', fontSize: '13px' }}
                    title="Edit video metadata or file"
                  >
                    <Edit2 size={15} />
                    <span>Edit</span>
                  </button>

                  <button
                    type="button"
                    className="btn-danger"
                    onClick={() => setShowDeleteConfirm(true)}
                    style={{ padding: '8px 14px', fontSize: '13px' }}
                    title="Delete this video"
                  >
                    <Trash2 size={15} />
                    <span>Delete Video</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Description */}
          {activeVideo.description && (
            <div
              style={{
                padding: '16px',
                backgroundColor: 'var(--bg-subtle)',
                borderRadius: 'var(--radius-md)',
                fontSize: '14px',
                color: 'var(--text-body)',
                lineHeight: '1.6',
                border: '1px solid var(--border-subtle)'
              }}
            >
              {activeVideo.description}
            </div>
          )}

          {/* Rating Section */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', borderTop: '1px solid var(--border-light)', paddingTop: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text-main)' }}>Rating & Reviews:</span>
              <RatingStars
                rating={userRating || avgRating}
                count={ratingCount}
                size={18}
                interactive={true}
                onRate={handleRateSubmit}
              />
            </div>
          </div>
        </div>

        {/* Related Items Section */}
        {relatedItems.length > 0 && (
          <div className="clean-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                Related Content
              </h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
              {relatedItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    if (item.mediaType === 'video') openVideo(item);
                    else if (item.mediaType === 'audio') playTrack(item);
                  }}
                  style={{
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-light)',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    backgroundColor: '#FFFFFF',
                    transition: 'all 150ms ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--accent)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-light)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{ aspectRatio: '16 / 9', backgroundColor: 'var(--bg-subtle)', position: 'relative' }}>
                    {item.thumbnail ? (
                      <img src={item.thumbnail} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                        {item.mediaType === 'audio' ? <Music size={24} /> : <Film size={24} />}
                      </div>
                    )}
                    <div style={{ position: 'absolute', bottom: '6px', right: '6px', padding: '2px 6px', borderRadius: '4px', backgroundColor: 'rgba(0,0,0,0.7)', color: '#fff', fontSize: '10px' }}>
                      {formatTime(item.duration)}
                    </div>
                  </div>
                  <div style={{ padding: '10px' }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.title}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {item.categoryName || 'General'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* User Reviews List */}
        <div className="clean-card" style={{ padding: '24px' }}>
          <h4 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '16px' }}>
            User Reviews ({ratingsList.length})
          </h4>

          {isAuthenticated && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (userRating > 0) handleRateSubmit(userRating);
              }}
              style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}
            >
              <input
                type="text"
                className="form-input"
                placeholder="Write a quick review..."
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
              />
              <button
                type="submit"
                className="btn-primary"
                style={{ padding: '0 18px', gap: '6px', fontSize: '13px' }}
              >
                <Send size={14} />
                <span>Post</span>
              </button>
            </form>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {ratingsList.length === 0 ? (
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', padding: '12px 0' }}>
                No written reviews yet. Be the first to rate and review!
              </div>
            ) : (
              ratingsList.map((r, i) => (
                <div
                  key={i}
                  style={{
                    padding: '12px 14px',
                    backgroundColor: 'var(--bg-subtle)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-light)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)' }}>
                      {r.userName || 'Community User'}
                    </span>
                    <RatingStars rating={r.score} size={12} showValue={false} />
                  </div>
                  {r.review && (
                    <p style={{ fontSize: '13px', color: 'var(--text-body)', lineHeight: '1.4', margin: 0 }}>
                      {r.review}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <EditMediaModal
          isOpen={showEditModal}
          media={activeVideo}
          onClose={() => setShowEditModal(false)}
          onUpdated={handleUpdated}
        />
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <ConfirmDialog
          isOpen={showDeleteConfirm}
          title="Delete Media File"
          message={`Are you sure you want to permanently delete "${activeVideo.title}"? This cannot be undone.`}
          confirmText="Delete Permanently"
          confirmVariant="danger"
          onConfirm={handleDelete}
          onClose={() => setShowDeleteConfirm(false)}
          isLoading={isDeleting}
        />
      )}
    </div>
  );
};

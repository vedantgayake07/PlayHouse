import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { usePlayer } from '../context/PlayerContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { formatTime, formatDate } from '../utils/formatters.js';
import { ConfirmDialog } from '../components/common/ConfirmDialog.jsx';
import { EmptyState } from '../components/common/EmptyState.jsx';
import { Clock, Play, Trash2, X, Film, Music } from 'lucide-react';

export const History = () => {
  const { playTrack, openVideo } = usePlayer();
  const toast = useToast();

  const [historyItems, setHistoryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const res = await api.history.getAll();
      if (res.success) {
        setHistoryItems(res.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveItem = async (historyId, e) => {
    e.stopPropagation();
    try {
      const res = await api.history.remove(historyId);
      if (res.success) {
        setHistoryItems((prev) => prev.filter((item) => item.historyId !== historyId));
        toast.success('Removed item from history.');
      }
    } catch (err) {
      toast.error('Failed to remove item.');
    }
  };

  const handleClearAll = async () => {
    try {
      const res = await api.history.clear();
      if (res.success) {
        setHistoryItems([]);
        toast.success('Watch history cleared successfully.');
        setShowClearConfirm(false);
      }
    } catch (err) {
      toast.error('Failed to clear history.');
    }
  };

  const handlePlayMedia = (item) => {
    if (item.mediaType === 'audio') {
      playTrack(item);
    } else if (item.mediaType === 'video') {
      openVideo(item);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: 'rgba(99, 102, 241, 0.15)', color: 'var(--accent-primary)' }}>
              <Clock size={22} />
            </div>
            <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)' }}>
              Watch & Play History
            </h1>
          </div>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Pick up right where you left off across all your video and audio sessions.
          </p>
        </div>

        {historyItems.length > 0 && (
          <button
            type="button"
            onClick={() => setShowClearConfirm(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: 'var(--radius-md)',
              fontSize: '13px',
              color: '#ef4444',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)'
            }}
          >
            <Trash2 size={14} />
            <span>Clear Entire History</span>
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton-shimmer" style={{ height: '72px', borderRadius: 'var(--radius-md)' }} />
          ))}
        </div>
      ) : historyItems.length === 0 ? (
        <EmptyState
          icon={Clock}
          title="No history recorded yet"
          description="Content you watch or listen to will automatically appear here with your playback progress."
          actionText="Discover Media"
          actionLink="/explore"
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {historyItems.map((item) => {
            const progressPercent = item.duration > 0 ? (item.progress / item.duration) * 100 : 0;
            return (
              <div
                key={item.historyId}
                className="glass-panel"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 18px',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  transition: 'background-color 0.15s, transform 0.15s'
                }}
                onClick={() => handlePlayMedia(item)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
                  e.currentTarget.style.transform = 'translateX(4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--bg-card)';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: '52px',
                      height: '52px',
                      borderRadius: '8px',
                      backgroundColor: 'var(--bg-secondary)',
                      overflow: 'hidden',
                      flexShrink: 0,
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {item.thumbnail ? (
                      <img src={item.thumbnail} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      item.mediaType === 'video' ? <Film size={20} /> : <Music size={20} />
                    )}

                    {/* Mini progress bar on thumbnail */}
                    {item.progress > 0 && (
                      <div
                        style={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          height: '3px',
                          backgroundColor: 'rgba(0,0,0,0.5)'
                        }}
                      >
                        <div style={{ height: '100%', width: `${progressPercent}%`, backgroundColor: 'var(--accent-primary)' }} />
                      </div>
                    )}
                  </div>

                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }} className="line-clamp-1">
                      {item.title}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px', color: 'var(--text-muted)', marginTop: '3px' }}>
                      <span>{item.categoryName || 'General'}</span>
                      <span>•</span>
                      <span>Progress: {formatTime(item.progress)} / {formatTime(item.duration)}</span>
                      <span>•</span>
                      <span>Played: {formatDate(item.lastPlayedAt)}</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlayMedia(item);
                    }}
                    className="glow-btn"
                    style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 0
                    }}
                  >
                    <Play size={15} fill="#ffffff" style={{ marginLeft: '2px' }} />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => handleRemoveItem(item.historyId, e)}
                    style={{ padding: '6px', color: 'var(--text-muted)' }}
                    title="Remove from history"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showClearConfirm && (
        <ConfirmDialog
          isOpen={showClearConfirm}
          onClose={() => setShowClearConfirm(false)}
          onConfirm={handleClearAll}
          title="Clear Watch History"
          message="Are you sure you want to clear your entire watch and play history? This cannot be undone."
          confirmText="Clear History"
        />
      )}
    </div>
  );
};

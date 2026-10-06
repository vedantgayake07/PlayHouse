import React, { useState } from 'react';
import { usePlayer } from '../../context/PlayerContext.jsx';
import { formatTime } from '../../utils/formatters.js';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Volume2,
  VolumeX,
  ListMusic,
  X,
  Music
} from 'lucide-react';

export const GlobalAudioPlayer = () => {
  const {
    currentTrack,
    isPlaying,
    queue,
    queueIndex,
    currentTime,
    duration,
    volume,
    isMuted,
    isShuffle,
    repeatMode,
    togglePlay,
    nextTrack,
    prevTrack,
    seek,
    setVolume,
    toggleMute,
    toggleShuffle,
    cycleRepeat,
    playTrack,
    removeFromQueue,
    clearQueue
  } = usePlayer();

  const [showQueue, setShowQueue] = useState(false);

  if (!currentTrack) return null;

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <>
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: 'var(--player-height)',
          backgroundColor: '#FFFFFF',
          borderTop: '1px solid var(--border-light)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          zIndex: 95,
          boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.04)'
        }}
        className="global-player-bar"
      >
        {/* Scrubber progress across the top of player */}
        <div
          style={{
            position: 'absolute',
            top: '-3px',
            left: 0,
            right: 0,
            height: '5px',
            cursor: 'pointer',
            backgroundColor: '#E5E7EB'
          }}
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const clickPos = (e.clientX - rect.left) / rect.width;
            seek(clickPos * duration);
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${progressPercent}%`,
              backgroundColor: 'var(--accent)',
              position: 'relative'
            }}
          >
            <div
              style={{
                position: 'absolute',
                right: '-4px',
                top: '-3px',
                width: '11px',
                height: '11px',
                borderRadius: '50%',
                backgroundColor: '#FFFFFF',
                border: '2px solid var(--accent)',
                boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
              }}
            />
          </div>
        </div>

        {/* Left: Track Details */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '28%', minWidth: '180px' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-subtle)',
              overflow: 'hidden',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid var(--border-light)'
            }}
          >
            {currentTrack.thumbnail ? (
              <img
                src={currentTrack.thumbnail}
                alt={currentTrack.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <Music size={20} style={{ color: 'var(--accent)' }} />
            )}
          </div>

          <div style={{ overflow: 'hidden' }}>
            <div
              style={{
                fontSize: '13.5px',
                fontWeight: 600,
                color: 'var(--text-main)',
                lineHeight: '1.3',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
              title={currentTrack.title}
            >
              {currentTrack.title}
            </div>
            <div
              style={{
                fontSize: '12px',
                color: 'var(--text-muted)',
                marginTop: '2px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {currentTrack.uploaderName || 'Audio Master'}
            </div>
          </div>
        </div>

        {/* Center: Playback Controls & Timers */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '3px',
            width: '44%',
            maxWidth: '500px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {/* Shuffle */}
            <button
              type="button"
              onClick={toggleShuffle}
              title="Shuffle"
              style={{
                color: isShuffle ? 'var(--accent)' : 'var(--text-muted)',
                padding: '4px'
              }}
            >
              <Shuffle size={16} />
            </button>

            {/* Prev */}
            <button
              type="button"
              onClick={prevTrack}
              title="Previous"
              style={{ color: 'var(--text-main)', padding: '4px' }}
            >
              <SkipBack size={18} />
            </button>

            {/* Play/Pause */}
            <button
              type="button"
              onClick={togglePlay}
              title={isPlaying ? 'Pause' : 'Play'}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: 'var(--accent)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 150ms ease'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--accent-hover)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--accent)')}
            >
              {isPlaying ? <Pause size={17} /> : <Play size={17} style={{ marginLeft: '2px' }} />}
            </button>

            {/* Next */}
            <button
              type="button"
              onClick={nextTrack}
              title="Next"
              style={{ color: 'var(--text-main)', padding: '4px' }}
            >
              <SkipForward size={18} />
            </button>

            {/* Repeat */}
            <button
              type="button"
              onClick={cycleRepeat}
              title={`Repeat: ${repeatMode}`}
              style={{
                color: repeatMode !== 'off' ? 'var(--accent)' : 'var(--text-muted)',
                padding: '4px'
              }}
            >
              {repeatMode === 'one' ? <Repeat1 size={16} /> : <Repeat size={16} />}
            </button>
          </div>

          {/* Time indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-muted)' }}>
            <span>{formatTime(currentTime)}</span>
            <span>/</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Right: Volume & Queue */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px', width: '28%' }}>
          {/* Volume */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              type="button"
              onClick={toggleMute}
              style={{ color: 'var(--text-muted)', padding: '4px' }}
            >
              {isMuted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.02"
              value={isMuted ? 0 : volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              style={{ width: '75px', accentColor: 'var(--accent)' }}
            />
          </div>

          {/* Queue toggle */}
          <button
            type="button"
            onClick={() => setShowQueue((prev) => !prev)}
            title="Play Queue"
            style={{
              padding: '6px 8px',
              borderRadius: 'var(--radius-md)',
              color: showQueue ? 'var(--accent)' : 'var(--text-muted)',
              backgroundColor: showQueue ? 'var(--accent-light)' : 'transparent',
              border: '1px solid var(--border-light)'
            }}
          >
            <ListMusic size={17} />
          </button>
        </div>
      </div>

      {/* Play Queue Drawer */}
      {showQueue && (
        <div
          style={{
            position: 'fixed',
            bottom: 'var(--player-height)',
            right: '24px',
            width: '340px',
            maxHeight: '440px',
            borderRadius: 'var(--radius-card) var(--radius-card) 0 0',
            backgroundColor: '#FFFFFF',
            zIndex: 96,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-drawer)',
            border: '1px solid var(--border-light)',
            borderBottom: 'none'
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              borderBottom: '1px solid var(--border-light)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ListMusic size={16} style={{ color: 'var(--accent)' }} />
              <span style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text-main)' }}>
                Play Queue ({queue.length})
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {queue.length > 0 && (
                <button
                  type="button"
                  onClick={clearQueue}
                  style={{ fontSize: '11px', color: 'var(--danger)', padding: '2px 6px' }}
                >
                  Clear
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowQueue(false)}
                style={{ color: 'var(--text-muted)', padding: '2px' }}
              >
                <X size={15} />
              </button>
            </div>
          </div>

          <div style={{ overflowY: 'auto', padding: '6px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {queue.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                Queue is empty
              </div>
            ) : (
              queue.map((track, idx) => {
                const isCurrent = idx === queueIndex;
                return (
                  <div
                    key={track.id || idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 10px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: isCurrent ? 'var(--accent-light)' : 'transparent',
                      cursor: 'pointer'
                    }}
                    onClick={() => playTrack(track, queue)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', width: '16px' }}>
                        {idx + 1}
                      </span>
                      <div style={{ overflow: 'hidden' }}>
                        <div
                          style={{
                            fontSize: '13px',
                            fontWeight: isCurrent ? 600 : 400,
                            color: isCurrent ? 'var(--accent)' : 'var(--text-main)',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {track.title}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          {formatTime(track.duration)}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFromQueue(idx);
                      }}
                      style={{ color: 'var(--text-muted)', padding: '4px' }}
                    >
                      <X size={13} />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .global-player-bar {
            bottom: 60px !important;
            padding: 0 12px !important;
          }
        }
      `}</style>
    </>
  );
};

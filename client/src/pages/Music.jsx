import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { usePlayer } from '../context/PlayerContext.jsx';
import { MediaCard } from '../components/media/MediaCard.jsx';
import { MediaGridSkeleton } from '../components/common/LoadingSkeleton.jsx';
import { EmptyState } from '../components/common/EmptyState.jsx';
import { Music as MusicIcon, Play, Upload } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Music = () => {
  const { playTrack } = usePlayer();
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadTracks = () => {
    setLoading(true);
    api.media.getAll({ mediaType: 'audio', limit: 50 })
      .then((res) => {
        if (res.success) setTracks(res.data.items || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadTracks();
  }, []);

  const handlePlayAll = () => {
    if (tracks.length > 0) {
      playTrack(tracks[0], tracks);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header Banner */}
      <div
        className="clean-card"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px',
          padding: '24px 28px',
          backgroundColor: '#FFFFFF'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '10px',
              backgroundColor: '#ECFDF5',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <MusicIcon size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em', margin: 0 }}>
              Audio & Music Library
            </h1>
            <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Lossless audio tracks, atmospheric soundscapes, and podcast recordings.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          {tracks.length > 0 && (
            <button
              type="button"
              onClick={handlePlayAll}
              className="btn-primary"
              style={{ fontSize: '13.5px' }}
            >
              <Play size={16} fill="#ffffff" />
              <span>Play All</span>
            </button>
          )}

          <Link
            to="/upload?type=audio"
            className="btn-secondary"
            style={{ fontSize: '13.5px' }}
          >
            <Upload size={15} />
            <span>Upload Audio</span>
          </Link>
        </div>
      </div>

      {loading ? (
        <MediaGridSkeleton count={8} />
      ) : tracks.length === 0 ? (
        <EmptyState
          icon={MusicIcon}
          title="No audio tracks found"
          description="Upload your musical compositions, field recordings, or audio guides to get started."
          actionText="Upload First Audio"
          actionLink="/upload?type=audio"
        />
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
            gap: '20px'
          }}
        >
          {tracks.map((track) => (
            <MediaCard
              key={track.id}
              media={track}
              mediaList={tracks}
              onDeleted={(id) => setTracks((prev) => prev.filter((t) => t.id !== id))}
              onUpdated={loadTracks}
            />
          ))}
        </div>
      )}
    </div>
  );
};

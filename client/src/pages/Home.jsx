import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api.js';
import { MediaCard } from '../components/media/MediaCard.jsx';
import { MediaGridSkeleton } from '../components/common/LoadingSkeleton.jsx';
import { ErrorState } from '../components/common/ErrorState.jsx';
import {
  Compass,
  Upload,
  Clock,
  Film,
  Music,
  Image as ImageIcon,
  Flame,
  ArrowRight,
  TrendingUp,
  FolderOpen
} from 'lucide-react';

export const Home = () => {
  const { user, isAuthenticated } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.media.getDashboard();
      if (res.success && res.data) {
        setDashboard(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load dashboard content.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [isAuthenticated]);

  if (error) {
    return <ErrorState message={error} onRetry={fetchDashboard} />;
  }

  const renderSectionHeader = (title, icon, link, linkText = 'View all') => {
    const Icon = icon;
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
          marginTop: '36px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Icon size={18} style={{ color: 'var(--text-main)' }} />
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-main)', letterSpacing: '-0.01em' }}>
            {title}
          </h2>
        </div>

        {link && (
          <Link
            to={link}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '13px',
              fontWeight: 500,
              color: 'var(--accent)'
            }}
          >
            <span>{linkText}</span>
            <ArrowRight size={13} />
          </Link>
        )}
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {/* Human-Designed Minimalist Hero Header */}
      <div
        style={{
          padding: '40px 0 32px',
          borderBottom: '1px solid var(--border-light)',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          maxWidth: '720px'
        }}
      >
        <h1
          style={{
            fontSize: '32px',
            fontWeight: 800,
            color: 'var(--text-main)',
            letterSpacing: '-0.025em',
            lineHeight: '1.2'
          }}
        >
          {isAuthenticated ? `Welcome back, ${user.name.split(' ')[0]}.` : 'Discover, stream, and manage your multimedia.'}
        </h1>

        <p
          style={{
            fontSize: '15.5px',
            color: 'var(--text-muted)',
            lineHeight: '1.6'
          }}
        >
          A unified system for high-definition video clips, lossless audio synthesis,
          digital photography, and technical specifications.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px' }}>
          <Link to="/explore" className="btn-primary" style={{ gap: '6px' }}>
            <Compass size={15} />
            <span>Browse Catalog</span>
          </Link>

          <Link to="/upload" className="btn-secondary" style={{ gap: '6px' }}>
            <Upload size={15} />
            <span>Upload New File</span>
          </Link>
        </div>
      </div>

      {loading ? (
        <div style={{ marginTop: '28px' }}>
          <MediaGridSkeleton count={8} />
        </div>
      ) : (
        <>
          {/* Continue Watching / Listening */}
          {dashboard?.continueWatching?.length > 0 && (
            <section>
              {renderSectionHeader('Continue Watching & Listening', Clock, '/history')}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                  gap: '20px'
                }}
              >
                {dashboard.continueWatching.map((item) => (
                  <MediaCard key={item.id} media={item} onDeleted={fetchDashboard} onUpdated={fetchDashboard} />
                ))}
              </div>
            </section>
          )}

          {/* Trending Section */}
          {dashboard?.trending?.length > 0 && (
            <section>
              {renderSectionHeader('Trending Content', Flame, '/explore?sort=popular')}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                  gap: '20px'
                }}
              >
                {dashboard.trending.slice(0, 4).map((item) => (
                  <MediaCard key={item.id} media={item} onDeleted={fetchDashboard} onUpdated={fetchDashboard} />
                ))}
              </div>
            </section>
          )}

          {/* Featured Videos */}
          {dashboard?.featuredVideos?.length > 0 && (
            <section>
              {renderSectionHeader('Videos & Motion Film', Film, '/videos')}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                  gap: '20px'
                }}
              >
                {dashboard.featuredVideos.slice(0, 4).map((item) => (
                  <MediaCard key={item.id} media={item} onDeleted={fetchDashboard} onUpdated={fetchDashboard} />
                ))}
              </div>
            </section>
          )}

          {/* Popular Audio */}
          {dashboard?.popularMusic?.length > 0 && (
            <section>
              {renderSectionHeader('Audio & Music Releases', Music, '/music')}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                  gap: '20px'
                }}
              >
                {dashboard.popularMusic.slice(0, 4).map((item) => (
                  <MediaCard key={item.id} media={item} onDeleted={fetchDashboard} onUpdated={fetchDashboard} />
                ))}
              </div>
            </section>
          )}

          {/* Image Gallery */}
          {dashboard?.imageGallery?.length > 0 && (
            <section>
              {renderSectionHeader('Photography & Visual Art', ImageIcon, '/images')}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                  gap: '20px'
                }}
              >
                {dashboard.imageGallery.slice(0, 4).map((item) => (
                  <MediaCard key={item.id} media={item} onDeleted={fetchDashboard} onUpdated={fetchDashboard} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { MediaCard } from '../components/media/MediaCard.jsx';
import { MediaGridSkeleton } from '../components/common/LoadingSkeleton.jsx';
import { EmptyState } from '../components/common/EmptyState.jsx';
import { Heart, Film, Music, Image as ImageIcon, FileText } from 'lucide-react';

export const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, [activeTab]);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      const res = await api.favorites.getAll(activeTab !== 'all' ? activeTab : undefined);
      if (res.success) {
        setFavorites(res.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'all', label: 'All Favorites' },
    { id: 'video', label: 'Videos', icon: Film },
    { id: 'audio', label: 'Music', icon: Music },
    { id: 'image', label: 'Images', icon: ImageIcon },
    { id: 'document', label: 'Documents', icon: FileText }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ padding: '7px', borderRadius: '6px', backgroundColor: '#FEE2E2', color: 'var(--danger)' }}>
            <Heart size={20} fill="currentColor" />
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em', margin: 0 }}>
            Favorites Collection
          </h1>
        </div>
        <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
          All your favorited videos, audio recordings, images, and documents in one curated view.
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto' }} className="hide-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 14px',
                borderRadius: 'var(--radius-full)',
                fontSize: '13px',
                fontWeight: isActive ? 600 : 500,
                backgroundColor: isActive ? 'var(--accent)' : 'transparent',
                color: isActive ? '#FFFFFF' : 'var(--text-body)',
                border: `1px solid ${isActive ? 'var(--accent)' : 'var(--border-light)'}`,
                whiteSpace: 'nowrap'
              }}
            >
              {Icon && <Icon size={14} />}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <MediaGridSkeleton count={8} />
      ) : favorites.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="No favorites yet"
          description="Click the heart icon on any media card to bookmark it for quick access."
          actionText="Explore Catalog"
          actionLink="/explore"
        />
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
            gap: '20px'
          }}
        >
          {favorites.map((media) => (
            <MediaCard
              key={media.id}
              media={media}
              mediaList={favorites}
              onDeleted={(id) => setFavorites((prev) => prev.filter((f) => f.id !== id))}
              onUpdated={loadFavorites}
            />
          ))}
        </div>
      )}
    </div>
  );
};

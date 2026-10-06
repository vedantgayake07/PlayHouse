import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { usePlayer } from '../context/PlayerContext.jsx';
import { MediaCard } from '../components/media/MediaCard.jsx';
import { MediaGridSkeleton } from '../components/common/LoadingSkeleton.jsx';
import { EmptyState } from '../components/common/EmptyState.jsx';
import { Image as ImageIcon, Upload } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Images = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadImages = () => {
    setLoading(true);
    api.media.getAll({ mediaType: 'image', limit: 50 })
      .then((res) => {
        if (res.success) setImages(res.data.items || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadImages();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ padding: '7px', borderRadius: '6px', backgroundColor: '#FFFBEB', color: '#D97706' }}>
              <ImageIcon size={20} />
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em', margin: 0 }}>
              Images & Gallery
            </h1>
          </div>
          <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
            High-resolution photography, diagrams, visual assets, and gallery images.
          </p>
        </div>

        <Link
          to="/upload?type=image"
          className="btn-primary"
          style={{ fontSize: '13.5px' }}
        >
          <Upload size={15} />
          <span>Upload Image</span>
        </Link>
      </div>

      {loading ? (
        <MediaGridSkeleton count={8} />
      ) : images.length === 0 ? (
        <EmptyState
          icon={ImageIcon}
          title="No images uploaded"
          description="Share your visual artworks, photography, or wallpapers with the studio."
          actionText="Upload First Image"
          actionLink="/upload?type=image"
        />
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
            gap: '20px'
          }}
        >
          {images.map((img) => (
            <MediaCard
              key={img.id}
              media={img}
              mediaList={images}
              onDeleted={(id) => setImages((prev) => prev.filter((i) => i.id !== id))}
              onUpdated={loadImages}
            />
          ))}
        </div>
      )}
    </div>
  );
};

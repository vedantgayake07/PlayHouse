import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { MediaGrid } from '../components/media/MediaGrid.jsx';
import { Pagination } from '../components/common/Pagination.jsx';
import { Film, Upload } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Videos = () => {
  const [videos, setVideos] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCat, setSelectedCat] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.categories.getAll().then((res) => {
      if (res.success) setCategories(res.data || []);
    });
  }, []);

  useEffect(() => {
    loadVideos();
  }, [selectedCat, sortBy, page]);

  const loadVideos = async () => {
    try {
      setLoading(true);
      const params = {
        mediaType: 'video',
        sortBy,
        page,
        limit: 12
      };
      if (selectedCat !== 'all') params.categoryId = selectedCat;
      const res = await api.media.getAll(params);
      if (res.success) {
        setVideos(res.data.items || []);
        setPagination(res.data.pagination || { page: 1, total: 0, totalPages: 1 });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ padding: '7px', borderRadius: '6px', backgroundColor: '#EEF2FF', color: 'var(--accent)' }}>
              <Film size={20} />
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em', margin: 0 }}>
              Video Collection
            </h1>
          </div>
          <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
            High-definition streaming videos, documentary sequences, and cinema shorts.
          </p>
        </div>

        <Link
          to="/upload?type=video"
          className="btn-primary"
          style={{ fontSize: '13.5px' }}
        >
          <Upload size={15} />
          <span>Upload Video</span>
        </Link>
      </div>

      {/* Filter Row */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px' }}>
        <select
          value={selectedCat}
          onChange={(e) => { setSelectedCat(e.target.value); setPage(1); }}
          className="form-input"
          style={{ width: 'auto', minWidth: '160px' }}
        >
          <option value="all">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <select
          value={sortBy}
          onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
          className="form-input"
          style={{ width: 'auto', minWidth: '160px' }}
        >
          <option value="newest">Latest Uploads</option>
          <option value="popular">Most Viewed</option>
          <option value="top_rated">Top Rated</option>
        </select>
      </div>

      <MediaGrid
        items={videos}
        isLoading={loading}
        emptyTitle="No videos found"
        emptyDescription="Be the first to upload and share a video clip with the community!"
        emptyActionText="Upload First Video"
        emptyActionLink="/upload?type=video"
        onDeleted={(id) => setVideos((prev) => prev.filter((v) => v.id !== id))}
        onUpdated={loadVideos}
      />

      <Pagination
        currentPage={pagination.page}
        totalPages={pagination.totalPages}
        onPageChange={(p) => setPage(p)}
      />
    </div>
  );
};

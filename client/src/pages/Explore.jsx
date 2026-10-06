import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api.js';
import { FilterBar } from '../components/media/FilterBar.jsx';
import { MediaGrid } from '../components/media/MediaGrid.jsx';
import { Pagination } from '../components/common/Pagination.jsx';
import { ErrorState } from '../components/common/ErrorState.jsx';
import { Compass, Search, X } from 'lucide-react';
import { useDebounce } from '../hooks/useDebounce.js';

export const Explore = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [mediaType, setMediaType] = useState(searchParams.get('type') || 'all');
  const [categoryId, setCategoryId] = useState(searchParams.get('category') || 'all');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest');
  const [rating, setRating] = useState(searchParams.get('rating') || '');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1', 10));

  const [categories, setCategories] = useState([]);
  const [mediaItems, setMediaItems] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const debouncedSearch = useDebounce(searchQuery, 300);

  // Load categories
  useEffect(() => {
    api.categories.getAll()
      .then((res) => {
        if (res.success) setCategories(res.data || []);
      })
      .catch(() => {});
  }, []);

  const loadMedia = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page,
        limit: 12,
        sortBy
      };

      if (mediaType && mediaType !== 'all') params.mediaType = mediaType;
      if (categoryId && categoryId !== 'all') params.categoryId = categoryId;
      if (rating) params.rating = rating;
      if (debouncedSearch.trim()) params.search = debouncedSearch.trim();

      const res = await api.media.getAll(params);
      if (res.success && res.data) {
        setMediaItems(res.data.items || []);
        setPagination(res.data.pagination || { page: 1, total: 0, totalPages: 1 });
      }
    } catch (err) {
      setError(err.message || 'Failed to load media.');
    } finally {
      setLoading(false);
    }
  }, [mediaType, categoryId, sortBy, rating, debouncedSearch, page]);

  useEffect(() => {
    loadMedia();
  }, [loadMedia]);

  const handleResetFilters = () => {
    setMediaType('all');
    setCategoryId('all');
    setSortBy('newest');
    setRating('');
    setSearchQuery('');
    setPage(1);
  };

  const handleDeleted = (id) => {
    setMediaItems((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Compass size={24} style={{ color: 'var(--accent-primary)' }} />
            <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)' }}>
              Explore Media
            </h1>
          </div>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Browse through videos, audio tracks, digital artwork, and documentation.
          </p>
        </div>

        {/* In-page search input */}
        <div style={{ position: 'relative', width: '100%', maxWidth: '320px' }}>
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)'
            }}
          />
          <input
            type="text"
            className="form-input"
            placeholder="Search within explore..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            style={{ paddingLeft: '36px', paddingRight: '32px' }}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
                padding: '2px'
              }}
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Filter Controls Bar */}
      <FilterBar
        mediaType={mediaType}
        onMediaTypeChange={(type) => { setMediaType(type); setPage(1); }}
        categoryId={categoryId}
        onCategoryChange={(cat) => { setCategoryId(cat); setPage(1); }}
        categories={categories}
        sortBy={sortBy}
        onSortChange={(sort) => { setSortBy(sort); setPage(1); }}
        minRating={rating}
        onRatingChange={(r) => { setRating(r); setPage(1); }}
        onReset={handleResetFilters}
      />

      {error ? (
        <ErrorState message={error} onRetry={loadMedia} />
      ) : (
        <>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Showing {mediaItems.length} of {pagination.total} results
          </div>

          <MediaGrid
            items={mediaItems}
            isLoading={loading}
            emptyTitle="No media matched your filters"
            emptyDescription="Try clearing or adjusting your search terms and category filters to discover content."
            emptyActionText="Reset All Filters"
            onDeleted={handleDeleted}
            onUpdated={loadMedia}
          />

          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={(p) => setPage(p)}
          />
        </>
      )}
    </div>
  );
};

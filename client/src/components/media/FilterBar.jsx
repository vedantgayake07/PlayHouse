import React from 'react';
import {
  Film,
  Music,
  Image as ImageIcon,
  FileText,
  RotateCcw,
  SlidersHorizontal
} from 'lucide-react';

export const FilterBar = ({
  mediaType = 'all',
  onMediaTypeChange,
  categoryId = 'all',
  onCategoryChange,
  categories = [],
  sortBy = 'newest',
  onSortChange,
  minRating = '',
  onRatingChange,
  onReset
}) => {
  const typeTabs = [
    { id: 'all', label: 'All', icon: null },
    { id: 'video', label: 'Videos', icon: Film },
    { id: 'audio', label: 'Audio', icon: Music },
    { id: 'image', label: 'Images', icon: ImageIcon },
    { id: 'document', label: 'Documents', icon: FileText }
  ];

  const hasActiveFilters = mediaType !== 'all' || categoryId !== 'all' || sortBy !== 'newest' || minRating !== '';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
      {/* Type Filter Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflowX: 'auto' }} className="hide-scrollbar">
          {typeTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = mediaType === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onMediaTypeChange(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 14px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '13px',
                  fontWeight: isActive ? 600 : 500,
                  backgroundColor: isActive ? 'var(--text-main)' : 'var(--bg-subtle)',
                  color: isActive ? '#FFFFFF' : 'var(--text-body)',
                  border: `1px solid ${isActive ? 'var(--text-main)' : 'var(--border-light)'}`,
                  whiteSpace: 'nowrap'
                }}
              >
                {Icon && <Icon size={14} />}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {hasActiveFilters && onReset && (
          <button
            type="button"
            onClick={onReset}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '12.5px',
              color: 'var(--text-muted)',
              backgroundColor: 'transparent',
              border: '1px solid var(--border-light)'
            }}
          >
            <RotateCcw size={12} />
            <span>Reset filters</span>
          </button>
        )}
      </div>

      {/* Dropdown Filters Bar */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '10px',
          padding: '10px 14px',
          backgroundColor: 'var(--bg-subtle)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-light)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '12.5px', marginRight: '4px' }}>
          <SlidersHorizontal size={14} />
          <span style={{ fontWeight: 500 }}>Filter by:</span>
        </div>

        <select
          value={categoryId}
          onChange={(e) => onCategoryChange(e.target.value)}
          style={{
            padding: '6px 10px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: '#FFFFFF',
            border: '1px solid var(--border-light)',
            color: 'var(--text-main)',
            fontSize: '13px'
          }}
        >
          <option value="all">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name} ({c.mediaCount || 0})</option>
          ))}
        </select>

        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          style={{
            padding: '6px 10px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: '#FFFFFF',
            border: '1px solid var(--border-light)',
            color: 'var(--text-main)',
            fontSize: '13px'
          }}
        >
          <option value="newest">Recently Added</option>
          <option value="popular">Most Viewed</option>
          <option value="top_rated">Highest Rated</option>
          <option value="title">Title (A-Z)</option>
          <option value="oldest">Oldest First</option>
        </select>

        <select
          value={minRating}
          onChange={(e) => onRatingChange(e.target.value)}
          style={{
            padding: '6px 10px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: '#FFFFFF',
            border: '1px solid var(--border-light)',
            color: 'var(--text-main)',
            fontSize: '13px'
          }}
        >
          <option value="">Any Rating</option>
          <option value="4.5">4.5+ Stars</option>
          <option value="4.0">4.0+ Stars</option>
          <option value="3.0">3.0+ Stars</option>
        </select>
      </div>
    </div>
  );
};

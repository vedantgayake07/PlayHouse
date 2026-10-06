import React from 'react';

export const MediaCardSkeleton = () => {
  return (
    <div
      style={{
        borderRadius: 'var(--radius-lg)',
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        height: '280px'
      }}
    >
      <div className="skeleton-shimmer" style={{ width: '100%', height: '160px' }} />
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
        <div className="skeleton-shimmer" style={{ width: '70%', height: '18px' }} />
        <div className="skeleton-shimmer" style={{ width: '40%', height: '14px' }} />
        <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="skeleton-shimmer" style={{ width: '30%', height: '12px' }} />
          <div className="skeleton-shimmer" style={{ width: '20%', height: '12px' }} />
        </div>
      </div>
    </div>
  );
};

export const MediaGridSkeleton = ({ count = 8 }) => {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
        gap: '20px'
      }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <MediaCardSkeleton key={i} />
      ))}
    </div>
  );
};

export const TableSkeleton = ({ rows = 5, cols = 4 }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
      {Array.from({ length: rows }).map((_, r) => (
        <div
          key={r}
          style={{
            display: 'flex',
            gap: '16px',
            padding: '16px',
            backgroundColor: 'var(--bg-card)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)'
          }}
        >
          {Array.from({ length: cols }).map((_, c) => (
            <div
              key={c}
              className="skeleton-shimmer"
              style={{
                flex: c === 0 ? 2 : 1,
                height: '18px',
                borderRadius: '4px'
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

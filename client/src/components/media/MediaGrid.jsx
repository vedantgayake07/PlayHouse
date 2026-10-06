import React, { useEffect } from 'react';
import { MediaCard } from './MediaCard.jsx';
import { MediaGridSkeleton } from '../common/LoadingSkeleton.jsx';
import { EmptyState } from '../common/EmptyState.jsx';

export const MediaGrid = ({
  items = [],
  isLoading = false,
  emptyTitle = 'No media found',
  emptyDescription = 'There is currently no content available in this section.',
  emptyActionText,
  emptyActionLink,
  onDeleted,
  onUpdated
}) => {
  useEffect(() => {
    const handleGlobalDelete = (e) => {
      if (e.detail?.id && onDeleted) {
        onDeleted(e.detail.id);
      }
    };
    window.addEventListener('media-deleted', handleGlobalDelete);
    return () => window.removeEventListener('media-deleted', handleGlobalDelete);
  }, [onDeleted]);
  if (isLoading) {
    return <MediaGridSkeleton count={8} />;
  }

  if (!items || items.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        actionText={emptyActionText}
        actionLink={emptyActionLink}
      />
    );
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
        gap: '20px'
      }}
    >
      {items.map((item) => (
        <MediaCard
          key={item.id}
          media={item}
          mediaList={items}
          onDeleted={onDeleted}
          onUpdated={onUpdated}
        />
      ))}
    </div>
  );
};

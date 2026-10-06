import React, { useState } from 'react';
import { Star } from 'lucide-react';

export const RatingStars = ({
  rating = 0,
  count,
  size = 14,
  interactive = false,
  onRate,
  showValue = true
}) => {
  const [hoverRating, setHoverRating] = useState(0);

  const displayRating = hoverRating || rating || 0;

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = star <= Math.round(displayRating);
          return (
            <button
              key={star}
              type="button"
              disabled={!interactive}
              onMouseEnter={() => interactive && setHoverRating(star)}
              onMouseLeave={() => interactive && setHoverRating(0)}
              onClick={() => interactive && onRate && onRate(star)}
              style={{
                background: 'none',
                border: 'none',
                padding: '2px',
                cursor: interactive ? 'pointer' : 'default',
                color: isFilled ? '#f59e0b' : 'var(--border-hover)',
                transition: 'transform 0.1s, color 0.1s',
                display: 'flex',
                alignItems: 'center'
              }}
              onFocus={(e) => interactive && (e.currentTarget.style.transform = 'scale(1.2)')}
              onBlur={(e) => interactive && (e.currentTarget.style.transform = 'scale(1)')}
            >
              <Star
                size={size}
                fill={isFilled ? '#f59e0b' : 'none'}
                stroke={isFilled ? '#f59e0b' : 'currentColor'}
              />
            </button>
          );
        })}
      </div>

      {showValue && rating > 0 && (
        <span style={{ fontSize: `${size}px`, fontWeight: 600, color: 'var(--text-primary)', marginLeft: '2px' }}>
          {Number(rating).toFixed(1)}
        </span>
      )}

      {count !== undefined && count !== null && (
        <span style={{ fontSize: `${size - 2}px`, color: 'var(--text-muted)', marginLeft: '2px' }}>
          ({count})
        </span>
      )}
    </div>
  );
};

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const pages = [];
  const maxVisiblePages = 5;
  let start = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let end = Math.min(totalPages, start + maxVisiblePages - 1);

  if (end - start + 1 < maxVisiblePages) {
    start = Math.max(1, end - maxVisiblePages + 1);
  }

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        margin: '32px 0 16px'
      }}
    >
      <button
        type="button"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '36px',
          height: '36px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          color: currentPage === 1 ? 'var(--text-muted)' : 'var(--text-primary)',
          cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
          opacity: currentPage === 1 ? 0.5 : 1
        }}
        aria-label="Previous page"
      >
        <ChevronLeft size={16} />
      </button>

      {start > 1 && (
        <>
          <button
            type="button"
            onClick={() => onPageChange(1)}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-secondary)',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            1
          </button>
          {start > 2 && <span style={{ color: 'var(--text-muted)', padding: '0 4px' }}>...</span>}
        </>
      )}

      {pages.map((p) => {
        const isActive = p === currentPage;
        return (
          <button
            key={p}
            type="button"
            onClick={() => onPageChange(p)}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: isActive ? 'var(--accent-primary)' : 'var(--bg-secondary)',
              border: `1px solid ${isActive ? 'var(--accent-primary)' : 'var(--border-color)'}`,
              color: isActive ? '#ffffff' : 'var(--text-secondary)',
              fontSize: '14px',
              fontWeight: isActive ? 600 : 400,
              cursor: 'pointer',
              transition: 'all 0.15s'
            }}
          >
            {p}
          </button>
        );
      })}

      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span style={{ color: 'var(--text-muted)', padding: '0 4px' }}>...</span>}
          <button
            type="button"
            onClick={() => onPageChange(totalPages)}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-secondary)',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            {totalPages}
          </button>
        </>
      )}

      <button
        type="button"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '36px',
          height: '36px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          color: currentPage === totalPages ? 'var(--text-muted)' : 'var(--text-primary)',
          cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
          opacity: currentPage === totalPages ? 0.5 : 1
        }}
        aria-label="Next page"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
};

import React from 'react';
import { FolderSearch, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

export const EmptyState = ({
  icon: Icon = FolderSearch,
  title = 'No media found',
  description = 'There are no items matching your criteria or collection.',
  actionText,
  actionLink,
  onAction
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 24px',
        textAlign: 'center',
        backgroundColor: 'var(--bg-card)',
        borderRadius: 'var(--radius-lg)',
        border: '1px dashed var(--border-color)',
        margin: '24px 0'
      }}
    >
      <div
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          backgroundColor: 'var(--bg-tertiary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--accent-primary)',
          marginBottom: '16px'
        }}
      >
        <Icon size={28} />
      </div>

      <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
        {title}
      </h3>

      <p style={{ fontSize: '14px', color: 'var(--text-secondary)', maxWidth: '420px', lineHeight: '1.5', marginBottom: '20px' }}>
        {description}
      </p>

      {actionText && actionLink && (
        <Link
          to={actionLink}
          className="glow-btn"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            borderRadius: 'var(--radius-md)',
            fontSize: '14px',
            fontWeight: 500
          }}
        >
          <Plus size={16} />
          {actionText}
        </Link>
      )}

      {actionText && onAction && !actionLink && (
        <button
          type="button"
          onClick={onAction}
          className="glow-btn"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            borderRadius: 'var(--radius-md)',
            fontSize: '14px',
            fontWeight: 500
          }}
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

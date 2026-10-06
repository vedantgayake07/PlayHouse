import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export const ErrorState = ({
  title = 'Something went wrong',
  message = 'An error occurred while loading this section. Please try again.',
  onRetry
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '50px 24px',
        textAlign: 'center',
        backgroundColor: 'rgba(239, 68, 68, 0.05)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid rgba(239, 68, 68, 0.2)',
        margin: '24px 0'
      }}
    >
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ef4444',
          marginBottom: '16px'
        }}
      >
        <AlertCircle size={28} />
      </div>

      <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
        {title}
      </h3>

      <p style={{ fontSize: '14px', color: 'var(--text-secondary)', maxWidth: '420px', lineHeight: '1.5', marginBottom: '20px' }}>
        {message}
      </p>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="secondary-btn"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '9px 18px',
            borderRadius: 'var(--radius-md)',
            fontSize: '14px',
            fontWeight: 500
          }}
        >
          <RefreshCw size={15} />
          Try Again
        </button>
      )}
    </div>
  );
};

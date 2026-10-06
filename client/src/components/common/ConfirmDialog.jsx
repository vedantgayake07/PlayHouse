import React from 'react';
import { Modal } from './Modal.jsx';
import { AlertTriangle } from 'lucide-react';

export const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed? This action cannot be undone.',
  confirmText = 'Delete',
  confirmVariant = 'danger',
  isLoading = false
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="420px">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
          <div
            style={{
              padding: '10px',
              borderRadius: '10px',
              backgroundColor: confirmVariant === 'danger' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)',
              color: confirmVariant === 'danger' ? '#ef4444' : '#f59e0b',
              flexShrink: 0
            }}
          >
            <AlertTriangle size={22} />
          </div>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.5', marginTop: '2px' }}>
            {message}
          </p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
          <button
            type="button"
            className="secondary-btn"
            onClick={onClose}
            disabled={isLoading}
            style={{ padding: '9px 18px', borderRadius: 'var(--radius-md)', fontSize: '14px' }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            style={{
              padding: '9px 18px',
              borderRadius: 'var(--radius-md)',
              fontSize: '14px',
              fontWeight: 500,
              backgroundColor: confirmVariant === 'danger' ? '#ef4444' : 'var(--accent-primary)',
              color: '#ffffff',
              transition: 'opacity 0.2s',
              opacity: isLoading ? 0.7 : 1
            }}
          >
            {isLoading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};

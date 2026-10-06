import React from 'react';
import { useToast } from '../../context/ToastContext.jsx';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export const ToastContainer = () => {
  const { toasts, removeToast } = useToast();

  if (!toasts || toasts.length === 0) return null;

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 size={18} className="text-emerald-400" />;
      case 'error':
        return <AlertCircle size={18} className="text-rose-400" />;
      case 'warning':
        return <AlertTriangle size={18} className="text-amber-400" />;
      default:
        return <Info size={18} className="text-indigo-400" />;
    }
  };

  const getBorderColor = (type) => {
    switch (type) {
      case 'success': return 'rgba(16, 185, 129, 0.4)';
      case 'error': return 'rgba(239, 68, 68, 0.4)';
      case 'warning': return 'rgba(245, 158, 11, 0.4)';
      default: return 'rgba(99, 102, 241, 0.4)';
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '96px',
        right: '24px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        maxWidth: '380px',
        width: 'calc(100% - 48px)',
        pointerEvents: 'none'
      }}
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          style={{
            pointerEvents: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 16px',
            borderRadius: '12px',
            background: 'var(--bg-secondary)',
            backdropFilter: 'blur(16px)',
            border: `1px solid ${getBorderColor(toast.type)}`,
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.5)',
            color: 'var(--text-primary)',
            fontSize: '14px',
            animation: 'toastIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        >
          <div style={{ flexShrink: 0 }}>{getIcon(toast.type)}</div>
          <div style={{ flex: 1, lineHeight: '1.4' }}>{toast.message}</div>
          <button
            onClick={() => removeToast(toast.id)}
            style={{
              flexShrink: 0,
              padding: '4px',
              borderRadius: '4px',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={15} />
          </button>
        </div>
      ))}
      <style>{`
        @keyframes toastIn {
          from {
            opacity: 0;
            transform: translateY(16px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
};

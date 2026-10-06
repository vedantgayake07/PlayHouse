import React from 'react';

export const UserAvatar = ({ user, size = 36, showBorder = false }) => {
  const name = user?.name || 'User';
  const avatar = user?.avatar;

  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const colors = [
    'linear-gradient(135deg, #6366f1, #a855f7)',
    'linear-gradient(135deg, #ec4899, #f43f5e)',
    'linear-gradient(135deg, #3b82f6, #06b6d4)',
    'linear-gradient(135deg, #10b981, #14b8a6)',
    'linear-gradient(135deg, #f59e0b, #ea580c)'
  ];

  const charCodeSum = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const colorBg = colors[charCodeSum % colors.length];

  if (avatar) {
    return (
      <img
        src={avatar}
        alt={name}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: '50%',
          objectFit: 'cover',
          border: showBorder ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
          flexShrink: 0
        }}
        onError={(e) => {
          e.currentTarget.style.display = 'none';
        }}
      />
    );
  }

  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        background: colorBg,
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: `${Math.floor(size * 0.4)}px`,
        fontWeight: 600,
        letterSpacing: '0.5px',
        border: showBorder ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
        flexShrink: 0,
        userSelect: 'none'
      }}
    >
      {initials}
    </div>
  );
};

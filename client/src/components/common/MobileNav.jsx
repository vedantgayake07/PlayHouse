import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Compass, PlusCircle, ListMusic, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

export const MobileNav = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) return null;

  const navItems = [
    { to: '/', label: 'Home', icon: Home, exact: true },
    { to: '/explore', label: 'Explore', icon: Compass },
    { to: '/upload', label: 'Upload', icon: PlusCircle },
    { to: '/playlists', label: 'Library', icon: ListMusic },
    { to: isAuthenticated ? '/profile' : '/login', label: 'Account', icon: User }
  ];

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '60px',
        backgroundColor: 'var(--bg-secondary)',
        borderTop: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        zIndex: 90,
        backdropFilter: 'blur(16px)',
        padding: '0 8px'
      }}
      className="mobile-bottom-nav"
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.exact}
            style={({ isActive }) => ({
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '3px',
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)',
              color: isActive ? 'var(--accent-primary)' : 'var(--text-muted)',
              fontSize: '11px',
              fontWeight: isActive ? 600 : 400,
              textDecoration: 'none',
              transition: 'color 0.15s ease'
            })}
          >
            <Icon size={20} />
            <span>{item.label}</span>
          </NavLink>
        );
      })}

      <style>{`
        @media (min-width: 1025px) {
          .mobile-bottom-nav {
            display: none !important;
          }
        }
      `}</style>
    </nav>
  );
};

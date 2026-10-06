import React, { useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  Home,
  Compass,
  Upload,
  Layers,
  FolderOpen,
  Info,
  LogOut,
  LogIn,
  X,
  Film,
  Music,
  Image as ImageIcon,
  FileText,
  Heart,
  Clock,
  ShieldCheck,
  ListMusic,
  Settings
} from 'lucide-react';

export const Sidebar = ({ isOpen, onClose }) => {
  const { isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const navLinkStyle = ({ isActive }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 14px',
    borderRadius: 'var(--radius-md)',
    fontSize: '13.5px',
    fontWeight: isActive ? 600 : 500,
    color: isActive ? 'var(--accent)' : 'var(--text-body)',
    backgroundColor: isActive ? 'var(--accent-light)' : 'transparent',
    transition: 'all 150ms ease',
    textDecoration: 'none'
  });

  const subNavLinkStyle = ({ isActive }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '7px 12px 7px 36px',
    borderRadius: 'var(--radius-md)',
    fontSize: '13px',
    color: isActive ? 'var(--accent)' : 'var(--text-muted)',
    fontWeight: isActive ? 600 : 400,
    backgroundColor: isActive ? 'var(--accent-light)' : 'transparent',
    textDecoration: 'none'
  });

  return (
    <>
      {/* Backdrop overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            zIndex: 199,
            transition: 'opacity 200ms ease'
          }}
        />
      )}

      {/* Slide-in Drawer */}
      <aside
        style={{
          position: 'fixed',
          top: 0,
          bottom: 0,
          left: 0,
          width: 'var(--drawer-width)',
          maxWidth: '85vw',
          backgroundColor: '#FFFFFF',
          borderRight: '1px solid var(--border-light)',
          zIndex: 200,
          transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 200ms cubic-bezier(0.16, 1, 0.3, 1)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: isOpen ? 'var(--shadow-drawer)' : 'none',
          overflowY: 'auto',
          padding: '20px 16px'
        }}
      >
        {/* Drawer Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', padding: '0 4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '6px',
                backgroundColor: 'var(--accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF'
              }}
            >
              <Layers size={16} />
            </div>
            <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
              Multimedia Hub
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            style={{
              padding: '6px',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-muted)'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-subtle)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <X size={18} />
          </button>
        </div>

        {/* Prominent Upload Action */}
        <div style={{ marginBottom: '20px' }}>
          <Link
            to="/upload"
            onClick={onClose}
            className="btn-primary"
            style={{
              width: '100%',
              padding: '11px 16px',
              fontSize: '13.5px',
              fontWeight: 600,
              gap: '8px'
            }}
          >
            <Upload size={16} />
            <span>Upload New File</span>
          </Link>
        </div>

        {/* Main Navigation Items */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
          <NavLink to="/" end onClick={onClose} style={navLinkStyle}>
            <Home size={17} />
            <span>Home</span>
          </NavLink>

          <NavLink to="/explore" onClick={onClose} style={navLinkStyle}>
            <Compass size={17} />
            <span>Browse All</span>
          </NavLink>

          {/* Sub-browse types */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginBottom: '6px' }}>
            <NavLink to="/videos" onClick={onClose} style={subNavLinkStyle}>
              <Film size={14} />
              <span>Videos & Films</span>
            </NavLink>
            <NavLink to="/music" onClick={onClose} style={subNavLinkStyle}>
              <Music size={14} />
              <span>Music & Audio</span>
            </NavLink>
            <NavLink to="/images" onClick={onClose} style={subNavLinkStyle}>
              <ImageIcon size={14} />
              <span>Images & Gallery</span>
            </NavLink>
            <NavLink to="/documents" onClick={onClose} style={subNavLinkStyle}>
              <FileText size={14} />
              <span>Documents</span>
            </NavLink>
          </div>

          {/* My Uploads (Manage Content) */}
          {isAuthenticated && (
            <NavLink to="/my-uploads" onClick={onClose} style={navLinkStyle}>
              <Layers size={17} />
              <span>My Uploads</span>
            </NavLink>
          )}

          {/* Categories */}
          <NavLink to="/categories" onClick={onClose} style={navLinkStyle}>
            <FolderOpen size={17} />
            <span>Categories</span>
          </NavLink>

          {/* About Distributed Multimedia Systems */}
          <NavLink to="/about" onClick={onClose} style={navLinkStyle}>
            <Info size={17} />
            <span>About Distributed Systems</span>
          </NavLink>

          {/* Library Section for authenticated user */}
          {isAuthenticated && (
            <>
              <div style={{ height: '1px', backgroundColor: 'var(--border-subtle)', margin: '10px 0' }} />
              <div style={{ padding: '0 12px 6px', fontSize: '11px', fontWeight: 600, color: 'var(--text-faint)', textTransform: 'uppercase' }}>
                My Collection
              </div>

              <NavLink to="/playlists" onClick={onClose} style={navLinkStyle}>
                <ListMusic size={17} />
                <span>Playlists</span>
              </NavLink>

              <NavLink to="/favorites" onClick={onClose} style={navLinkStyle}>
                <Heart size={17} />
                <span>Favorites</span>
              </NavLink>

              <NavLink to="/history" onClick={onClose} style={navLinkStyle}>
                <Clock size={17} />
                <span>Watch History</span>
              </NavLink>
            </>
          )}

          {/* Admin link */}
          {isAdmin && (
            <>
              <div style={{ height: '1px', backgroundColor: 'var(--border-subtle)', margin: '10px 0' }} />
              <NavLink to="/admin" onClick={onClose} style={navLinkStyle}>
                <ShieldCheck size={17} style={{ color: 'var(--accent)' }} />
                <span style={{ color: 'var(--accent)' }}>Admin Panel</span>
              </NavLink>
            </>
          )}
        </nav>

        {/* Drawer Footer: Settings & Login/Logout */}
        <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '16px', marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <NavLink to="/settings" onClick={onClose} style={navLinkStyle}>
            <Settings size={17} />
            <span>Settings</span>
          </NavLink>

          {isAuthenticated ? (
            <button
              type="button"
              onClick={() => {
                onClose();
                logout();
                navigate('/');
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                fontSize: '13.5px',
                fontWeight: 500,
                color: 'var(--danger)',
                backgroundColor: 'transparent',
                width: '100%',
                textAlign: 'left'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--danger-bg)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <LogOut size={17} />
              <span>Log out</span>
            </button>
          ) : (
            <Link
              to="/login"
              onClick={onClose}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                fontSize: '13.5px',
                fontWeight: 600,
                color: 'var(--accent)',
                backgroundColor: 'var(--accent-light)',
                textDecoration: 'none'
              }}
            >
              <LogIn size={17} />
              <span>Log in to Hub</span>
            </Link>
          )}
        </div>
      </aside>
    </>
  );
};

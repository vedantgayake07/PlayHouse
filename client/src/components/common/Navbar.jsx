import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { UserAvatar } from './UserAvatar.jsx';
import { useDebounce } from '../../hooks/useDebounce.js';
import { api } from '../../services/api.js';
import {
  Menu,
  Search,
  Upload,
  User,
  Settings,
  ShieldAlert,
  LogOut,
  X,
  Layers,
  FolderOpen,
  Film,
  Music,
  Image as ImageIcon,
  FileText
} from 'lucide-react';

export const Navbar = ({ onToggleSidebar }) => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const debouncedSearch = useDebounce(searchQuery, 250);
  const userMenuRef = useRef(null);
  const searchContainerRef = useRef(null);

  useEffect(() => {
    let active = true;
    if (debouncedSearch.trim().length >= 2) {
      api.media.search(debouncedSearch.trim())
        .then((res) => {
          if (active && res.success && res.data) {
            setSuggestions(res.data.suggestions || []);
          }
        })
        .catch(() => {});
    } else {
      setSuggestions([]);
    }
    return () => { active = false; };
  }, [debouncedSearch]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setIsUserMenuOpen(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      navigate(`/explore?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSelectSuggestion = (s) => {
    setSearchQuery(s);
    setShowSuggestions(false);
    navigate(`/explore?q=${encodeURIComponent(s)}`);
  };

  return (
    <header
      style={{
        height: 'var(--navbar-height)',
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid var(--border-light)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}
    >
      {/* Left: Hamburger & Clean Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-label="Toggle navigation drawer"
          style={{
            padding: '8px',
            borderRadius: 'var(--radius-md)',
            color: 'var(--text-main)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'transparent'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-subtle)')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
        >
          <Menu size={20} strokeWidth={2} />
        </button>

        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            textDecoration: 'none'
          }}
        >
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
          <span
            style={{
              fontSize: '17px',
              fontWeight: 700,
              color: 'var(--text-main)',
              letterSpacing: '-0.02em'
            }}
          >
            Multimedia <span style={{ color: 'var(--accent)' }}>Hub</span>
          </span>
        </Link>
      </div>

      {/* Centre: Search Bar */}
      <div
        ref={searchContainerRef}
        style={{
          position: 'relative',
          maxWidth: '520px',
          width: '100%',
          margin: '0 24px'
        }}
        className="navbar-search-container"
      >
        <form onSubmit={handleSearchSubmit} style={{ position: 'relative' }}>
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)'
            }}
          />
          <input
            type="text"
            placeholder="Search videos, music, artwork, documents..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            style={{
              width: '100%',
              padding: '9px 36px 9px 40px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-subtle)',
              border: '1px solid var(--border-light)',
              color: 'var(--text-main)',
              fontSize: '13.5px',
              transition: 'border-color 150ms ease, background-color 150ms ease'
            }}
            onFocusCapture={(e) => {
              e.currentTarget.style.backgroundColor = '#FFFFFF';
              e.currentTarget.style.borderColor = 'var(--accent)';
            }}
            onBlurCapture={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-subtle)';
              e.currentTarget.style.borderColor = 'var(--border-light)';
            }}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
                padding: '2px'
              }}
            >
              <X size={14} />
            </button>
          )}
        </form>

        {/* Suggestions dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% + 6px)',
              left: 0,
              right: 0,
              backgroundColor: '#FFFFFF',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-hover)',
              padding: '6px',
              zIndex: 200
            }}
          >
            <div style={{ padding: '6px 10px', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Suggested Results
            </div>
            {suggestions.map((s, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectSuggestion(s)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '13px',
                  color: 'var(--text-main)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-subtle)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <Search size={13} style={{ color: 'var(--text-muted)' }} />
                <span>{s}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right: Quick Upload Button & Profile / Auth */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {isAuthenticated && (
          <Link
            to="/upload"
            className="btn-primary"
            style={{
              padding: '7px 14px',
              fontSize: '13px',
              borderRadius: 'var(--radius-md)'
            }}
          >
            <Upload size={14} />
            <span>Upload</span>
          </Link>
        )}

        {isAuthenticated ? (
          <div ref={userMenuRef} style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setIsUserMenuOpen((prev) => !prev)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '2px',
                borderRadius: 'var(--radius-full)'
              }}
            >
              <UserAvatar user={user} size={34} />
            </button>

            {/* Dropdown Menu */}
            {isUserMenuOpen && (
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  top: 'calc(100% + 8px)',
                  width: '230px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-card)',
                  boxShadow: 'var(--shadow-hover)',
                  padding: '8px',
                  zIndex: 200
                }}
              >
                <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-light)', marginBottom: '4px' }}>
                  <div style={{ fontWeight: 600, fontSize: '13.5px', color: 'var(--text-main)' }}>
                    {user.name}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }} className="line-clamp-1">
                    {user.email}
                  </div>
                  {isAdmin && (
                    <span
                      style={{
                        display: 'inline-block',
                        marginTop: '4px',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        backgroundColor: 'var(--accent-light)',
                        color: 'var(--accent)',
                        fontSize: '10.5px',
                        fontWeight: 600
                      }}
                    >
                      Administrator
                    </span>
                  )}
                </div>

                <Link
                  to="/my-uploads"
                  onClick={() => setIsUserMenuOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '13px',
                    color: 'var(--text-body)'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-subtle)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <Layers size={14} />
                  <span>My Uploads</span>
                </Link>

                <Link
                  to="/profile"
                  onClick={() => setIsUserMenuOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '13px',
                    color: 'var(--text-body)'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-subtle)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <User size={14} />
                  <span>Profile</span>
                </Link>

                <Link
                  to="/settings"
                  onClick={() => setIsUserMenuOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '13px',
                    color: 'var(--text-body)'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-subtle)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <Settings size={14} />
                  <span>Settings</span>
                </Link>

                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setIsUserMenuOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '13px',
                      color: 'var(--accent)'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-subtle)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <ShieldAlert size={14} />
                    <span>Admin Panel</span>
                  </Link>
                )}

                <div style={{ height: '1px', backgroundColor: 'var(--border-light)', margin: '4px 0' }} />

                <button
                  type="button"
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    logout();
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '13px',
                    color: 'var(--danger)'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--danger-bg)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <LogOut size={14} />
                  <span>Log out</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Link
              to="/login"
              style={{
                fontSize: '13px',
                fontWeight: 500,
                color: 'var(--text-body)',
                padding: '7px 12px',
                borderRadius: 'var(--radius-md)'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-main)')}
            >
              Log in
            </Link>
            <Link
              to="/register"
              className="btn-primary"
              style={{
                fontSize: '13px',
                padding: '7px 14px',
                borderRadius: 'var(--radius-md)'
              }}
            >
              Sign up
            </Link>
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 640px) {
          .navbar-search-container {
            display: none !important;
          }
        }
      `}</style>
    </header>
  );
};

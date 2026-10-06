import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Layers, Lock, Mail, ArrowRight, ShieldCheck, User } from 'lucide-react';

export const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    try {
      setIsLoading(true);
      setErrorMsg('');
      await login(email, password);
      navigate('/');
    } catch (err) {
      setErrorMsg(err.message || 'Login failed. Please check credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFillDemo = (type) => {
    if (type === 'admin') {
      setEmail('admin@multimediahub.com');
      setPassword('AdminPassword123!');
    } else {
      setEmail('user@multimediahub.com');
      setPassword('UserPassword123!');
    }
    setErrorMsg('');
  };

  return (
    <div
      style={{
        minHeight: 'calc(80vh - var(--navbar-height))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px'
      }}
    >
      <div
        className="clean-card"
        style={{
          maxWidth: '420px',
          width: '100%',
          padding: '36px 32px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px'
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              backgroundColor: 'var(--accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              margin: '0 auto 16px'
            }}
          >
            <Layers size={22} />
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em', margin: 0 }}>
            Sign in to Multimedia Hub
          </h1>
          <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', marginTop: '6px' }}>
            Access media management, playlists, and uploads
          </p>
        </div>

        {errorMsg && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: '#FEE2E2',
              border: '1px solid #FCA5A5',
              color: '#B91C1C',
              fontSize: '13px'
            }}
          >
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label className="form-label">Email address</label>
            <div style={{ position: 'relative' }}>
              <Mail
                size={16}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)'
                }}
              />
              <input
                type="email"
                className="form-input"
                placeholder="name@multimediahub.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: '36px' }}
                required
              />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label className="form-label" style={{ margin: 0 }}>Password</label>
            </div>
            <div style={{ position: 'relative' }}>
              <Lock
                size={16}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)'
                }}
              />
              <input
                type="password"
                className="form-input"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '36px' }}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={isLoading}
            style={{ width: '100%', marginTop: '6px', padding: '11px', fontSize: '14px' }}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
            <ArrowRight size={16} />
          </button>
        </form>

        {/* Quick Demo Access */}
        <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '18px' }}>
          <div style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--text-faint)', textTransform: 'uppercase', marginBottom: '10px', textAlign: 'center' }}>
            Quick Demo Sign In
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => handleFillDemo('user')}
              style={{ padding: '8px', fontSize: '12.5px', justifyContent: 'center' }}
            >
              <User size={14} />
              <span>Standard User</span>
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => handleFillDemo('admin')}
              style={{ padding: '8px', fontSize: '12.5px', justifyContent: 'center' }}
            >
              <ShieldCheck size={14} />
              <span>Administrator</span>
            </button>
          </div>
        </div>

        <div style={{ textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
            Create one
          </Link>
        </div>
      </div>
    </div>
  );
};

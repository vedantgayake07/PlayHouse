import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Layers, Lock, Mail, User, ArrowRight } from 'lucide-react';

export const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    try {
      setIsLoading(true);
      setErrorMsg('');
      await register(name, email, password, confirmPassword);
      navigate('/');
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
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
          maxWidth: '440px',
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
            Create an Account
          </h1>
          <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', marginTop: '6px' }}>
            Join the distributed multimedia management platform
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
            <label className="form-label">Full Name</label>
            <div style={{ position: 'relative' }}>
              <User
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
                type="text"
                className="form-input"
                placeholder="Jane Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ paddingLeft: '36px' }}
                required
              />
            </div>
          </div>

          <div>
            <label className="form-label">Email Address</label>
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
                placeholder="jane@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: '36px' }}
                required
              />
            </div>
          </div>

          <div>
            <label className="form-label">Password</label>
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
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '36px' }}
                required
              />
            </div>
          </div>

          <div>
            <label className="form-label">Confirm Password</label>
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
                placeholder="Repeat password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
            {isLoading ? 'Creating account...' : 'Create Account'}
            <ArrowRight size={16} />
          </button>
        </form>

        <div style={{ textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

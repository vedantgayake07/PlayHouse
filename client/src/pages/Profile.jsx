import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { api } from '../services/api.js';
import { UserAvatar } from '../components/common/UserAvatar.jsx';
import { MediaCard } from '../components/media/MediaCard.jsx';
import { formatDate } from '../utils/formatters.js';
import {
  User,
  Mail,
  Calendar,
  Upload,
  Heart,
  ListMusic,
  Clock,
  Camera,
  KeyRound,
  ShieldCheck
} from 'lucide-react';

export const Profile = () => {
  const { user, stats, updateProfile, changePassword, uploadAvatar, isAdmin } = useAuth();
  const toast = useToast();

  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [userMedia, setUserMedia] = useState([]);
  const [loadingMedia, setLoadingMedia] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isChangingPass, setIsChangingPass] = useState(false);

  const avatarInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setBio(user.bio || '');
      loadUserMedia();
    }
  }, [user]);

  const loadUserMedia = async () => {
    try {
      setLoadingMedia(true);
      const res = await api.media.getAll({ limit: 50 });
      if (res.success && res.data) {
        // Filter media uploaded by current user
        const mine = (res.data.items || []).filter((m) => m.uploadedBy === user?.id);
        setUserMedia(mine);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMedia(false);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsUpdating(true);
      await updateProfile({ name, bio });
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters.');
      return;
    }

    try {
      setIsChangingPass(true);
      await changePassword(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } finally {
      setIsChangingPass(false);
    }
  };

  const handleAvatarFile = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      await uploadAvatar(file);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Profile Overview Card */}
      <div
        className="glass-panel"
        style={{
          borderRadius: 'var(--radius-xl)',
          padding: '32px',
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '24px',
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(10, 13, 20, 0.8) 100%)'
        }}
      >
        <div style={{ position: 'relative' }}>
          <UserAvatar user={user} size={96} showBorder={true} />
          <button
            type="button"
            onClick={() => avatarInputRef.current?.click()}
            title="Upload profile picture"
            style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: 'var(--accent-primary)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-md)',
              border: '2px solid var(--bg-secondary)'
            }}
          >
            <Camera size={16} />
          </button>
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleAvatarFile}
          />
        </div>

        <div style={{ flex: 1, minWidth: '240px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)' }}>
              {user?.name}
            </h1>
            {isAdmin && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  backgroundColor: 'rgba(99, 102, 241, 0.2)',
                  color: 'var(--accent-primary)',
                  fontSize: '11px',
                  fontWeight: 700
                }}
              >
                <ShieldCheck size={13} />
                ADMIN
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '13px', color: 'var(--text-secondary)', marginTop: '8px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Mail size={14} />
              {user?.email}
            </span>
            <span>•</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Calendar size={14} />
              Joined {formatDate(user?.createdAt)}
            </span>
          </div>

          {user?.bio && (
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '12px', lineHeight: '1.5' }}>
              {user.bio}
            </p>
          )}
        </div>
      </div>

      {/* Stats Counter Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <div className="glass-panel" style={{ padding: '20px', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '12px', borderRadius: '12px', backgroundColor: 'rgba(99, 102, 241, 0.15)', color: 'var(--accent-primary)' }}>
            <Upload size={22} />
          </div>
          <div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)' }}>{stats?.uploads || userMedia.length}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Uploaded Media</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '12px', borderRadius: '12px', backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}>
            <Heart size={22} />
          </div>
          <div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)' }}>{stats?.favorites || 0}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Favorite Items</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '12px', borderRadius: '12px', backgroundColor: 'rgba(16, 185, 129, 0.15)', color: 'var(--type-audio)' }}>
            <ListMusic size={22} />
          </div>
          <div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)' }}>{stats?.playlists || 0}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Curated Playlists</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '12px', borderRadius: '12px', backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
            <Clock size={22} />
          </div>
          <div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)' }}>{stats?.history || 0}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Sessions Watched</div>
          </div>
        </div>
      </div>

      {/* Profile Form & Password Form */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        {/* Edit profile */}
        <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-xl)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <User size={18} style={{ color: 'var(--accent-primary)' }} />
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Edit Profile Information
            </h3>
          </div>

          <form onSubmit={handleProfileSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="form-label">About / Bio</label>
              <textarea
                className="form-input"
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell the community about yourself..."
              />
            </div>

            <button
              type="submit"
              className="glow-btn"
              disabled={isUpdating}
              style={{
                alignSelf: 'flex-start',
                padding: '9px 20px',
                borderRadius: 'var(--radius-md)',
                fontSize: '13px',
                fontWeight: 600,
                marginTop: '8px'
              }}
            >
              {isUpdating ? 'Saving...' : 'Save Profile'}
            </button>
          </form>
        </div>

        {/* Change password */}
        <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-xl)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <KeyRound size={18} style={{ color: 'var(--accent-primary)' }} />
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Change Password
            </h3>
          </div>

          <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label className="form-label">Current Password</label>
              <input
                type="password"
                className="form-input"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="form-label">New Password (min 6 characters)</label>
              <input
                type="password"
                className="form-input"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="form-label">Confirm New Password</label>
              <input
                type="password"
                className="form-input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="secondary-btn"
              disabled={isChangingPass}
              style={{
                alignSelf: 'flex-start',
                padding: '9px 20px',
                borderRadius: 'var(--radius-md)',
                fontSize: '13px',
                fontWeight: 500,
                marginTop: '8px'
              }}
            >
              {isChangingPass ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>

      {/* User's Uploaded Media Gallery */}
      <div style={{ marginTop: '16px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px' }}>
          My Uploaded Media ({userMedia.length})
        </h2>

        {loadingMedia ? (
          <div>Loading your uploads...</div>
        ) : userMedia.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-lg)' }}>
            You haven't uploaded any media yet.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
            {userMedia.map((m) => (
              <MediaCard
                key={m.id}
                media={m}
                mediaList={userMedia}
                onDeleted={(id) => setUserMedia((prev) => prev.filter((item) => item.id !== id))}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { api } from '../services/api.js';
import {
  Settings as SettingsIcon,
  Sun,
  Moon,
  Volume2,
  Gauge,
  PlaySquare,
  Bell,
  Check
} from 'lucide-react';

export const Settings = () => {
  const { theme, setTheme } = useTheme();
  const { isAuthenticated } = useAuth();
  const toast = useToast();

  const [autoplay, setAutoplay] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [notifications, setNotifications] = useState(true);
  const [defaultVolume, setDefaultVolume] = useState(80);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      api.settings.get()
        .then((res) => {
          if (res.success && res.data) {
            if (res.data.theme) setTheme(res.data.theme);
            setAutoplay(Boolean(res.data.autoplay));
            setPlaybackSpeed(res.data.playbackSpeed || 1.0);
            setNotifications(Boolean(res.data.notifications));
            setDefaultVolume(Math.round((res.data.volume || 0.8) * 100));
          }
        })
        .catch(() => {});
    }
  }, [isAuthenticated, setTheme]);

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.success('Local preferences updated.');
      return;
    }

    try {
      setIsSaving(true);
      const res = await api.settings.update({
        theme,
        autoplay: autoplay ? 1 : 0,
        playbackSpeed,
        notifications: notifications ? 1 : 0,
        volume: defaultVolume / 100
      });
      if (res.success) {
        toast.success('Settings saved successfully.');
      }
    } catch (err) {
      toast.error('Failed to save settings to server.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: 'rgba(99, 102, 241, 0.15)', color: 'var(--accent-primary)' }}>
            <SettingsIcon size={22} />
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)' }}>
            Application Settings
          </h1>
        </div>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>
          Customize playback parameters, theme appearance, and notification behaviors.
        </p>
      </div>

      <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Appearance / Theme */}
        <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-xl)' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '14px' }}>
            Appearance & Interface Theme
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <button
              type="button"
              onClick={() => setTheme('dark')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: theme === 'dark' ? 'rgba(99, 102, 241, 0.15)' : 'var(--bg-secondary)',
                border: `2px solid ${theme === 'dark' ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                color: 'var(--text-primary)',
                cursor: 'pointer'
              }}
            >
              <Moon size={20} style={{ color: 'var(--accent-primary)' }} />
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 600, fontSize: '14px' }}>Dark Theme</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Deep slate & neon accents</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setTheme('light')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: theme === 'light' ? 'rgba(99, 102, 241, 0.15)' : 'var(--bg-secondary)',
                border: `2px solid ${theme === 'light' ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                color: 'var(--text-primary)',
                cursor: 'pointer'
              }}
            >
              <Sun size={20} style={{ color: 'var(--accent-primary)' }} />
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 600, fontSize: '14px' }}>Light Theme</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Bright & high-contrast mode</div>
              </div>
            </button>
          </div>
        </div>

        {/* Playback Settings */}
        <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-xl)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
            Playback Preferences
          </h3>

          {/* Autoplay */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <PlaySquare size={18} style={{ color: 'var(--accent-primary)' }} />
              <div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Continuous Autoplay
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Automatically play the next track in the queue or playlist.
                </div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={autoplay}
              onChange={(e) => setAutoplay(e.target.checked)}
              style={{ width: '20px', height: '20px', accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
            />
          </div>

          <div style={{ height: '1px', backgroundColor: 'var(--border-color)' }} />

          {/* Default Playback Speed */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Gauge size={18} style={{ color: 'var(--accent-primary)' }} />
              <div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Default Playback Speed
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Preferred velocity for video clips and audio streams.
                </div>
              </div>
            </div>

            <select
              value={playbackSpeed}
              onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
              style={{
                padding: '6px 12px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-input)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                fontSize: '13px'
              }}
            >
              <option value="0.75">0.75x</option>
              <option value="1.0">1.0x (Normal)</option>
              <option value="1.25">1.25x</option>
              <option value="1.5">1.5x</option>
              <option value="2.0">2.0x</option>
            </select>
          </div>

          <div style={{ height: '1px', backgroundColor: 'var(--border-color)' }} />

          {/* Default Master Volume */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Volume2 size={18} style={{ color: 'var(--accent-primary)' }} />
                <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Default Volume Level
                </span>
              </div>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--accent-primary)' }}>
                {defaultVolume}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={defaultVolume}
              onChange={(e) => setDefaultVolume(parseInt(e.target.value, 10))}
              style={{ width: '100%' }}
            />
          </div>
        </div>

        {/* Notifications */}
        <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-xl)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Bell size={18} style={{ color: 'var(--accent-primary)' }} />
              <div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  In-App Toast Notifications
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Display status popups on uploads, ratings, and playback events.
                </div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={notifications}
              onChange={(e) => setNotifications(e.target.checked)}
              style={{ width: '20px', height: '20px', accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
          <button
            type="submit"
            className="glow-btn"
            disabled={isSaving}
            style={{
              padding: '11px 28px',
              borderRadius: 'var(--radius-md)',
              fontSize: '14px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Check size={16} />
            <span>{isSaving ? 'Saving...' : 'Save All Preferences'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

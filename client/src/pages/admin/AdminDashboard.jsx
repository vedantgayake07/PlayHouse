import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api.js';
import { formatBytes, formatDate } from '../../utils/formatters.js';
import { UserAvatar } from '../../components/common/UserAvatar.jsx';
import {
  ShieldCheck,
  Users,
  Layers,
  FolderOpen,
  Film,
  Music,
  Image as ImageIcon,
  FileText,
  Eye,
  HardDrive,
  ArrowUpRight,
  TrendingUp
} from 'lucide-react';

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.admin.getStats()
      .then((res) => {
        if (res.success && res.data) setStats(res.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading administrator metrics...</div>;
  }

  const s = stats?.summary || {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Admin Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: 'rgba(99, 102, 241, 0.2)', color: 'var(--accent-primary)' }}>
              <ShieldCheck size={22} />
            </div>
            <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)' }}>
              Administration & Analytics
            </h1>
          </div>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Global platform overview, storage distribution, and content management tools.
          </p>
        </div>

        {/* Quick Admin Navigation buttons */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <Link
            to="/admin/users"
            className="secondary-btn"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: 'var(--radius-md)', fontSize: '13px' }}
          >
            <Users size={15} />
            <span>Manage Users</span>
          </Link>
          <Link
            to="/admin/media"
            className="secondary-btn"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: 'var(--radius-md)', fontSize: '13px' }}
          >
            <Layers size={15} />
            <span>Manage Media</span>
          </Link>
          <Link
            to="/admin/categories"
            className="secondary-btn"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: 'var(--radius-md)', fontSize: '13px' }}
          >
            <FolderOpen size={15} />
            <span>Categories</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <div className="glass-panel" style={{ padding: '20px', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '13px', fontWeight: 500 }}>
            <span>Total Accounts</span>
            <Users size={16} />
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '10px' }}>
            {s.totalUsers || 0}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--accent-primary)', marginTop: '4px' }}>Platform registered</div>
        </div>

        <div className="glass-panel" style={{ padding: '20px', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '13px', fontWeight: 500 }}>
            <span>Total Media Items</span>
            <Layers size={16} />
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '10px' }}>
            {s.totalMedia || 0}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--type-video)', marginTop: '4px' }}>Active catalog</div>
        </div>

        <div className="glass-panel" style={{ padding: '20px', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '13px', fontWeight: 500 }}>
            <span>Total Views</span>
            <Eye size={16} />
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '10px' }}>
            {s.totalViews || 0}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--type-audio)', marginTop: '4px' }}>Playback engagement</div>
        </div>

        <div className="glass-panel" style={{ padding: '20px', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '13px', fontWeight: 500 }}>
            <span>Storage Used</span>
            <HardDrive size={16} />
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '10px' }}>
            {formatBytes(s.totalStorageBytes || 0)}
          </div>
          <div style={{ fontSize: '11px', color: '#f59e0b', marginTop: '4px' }}>Disk allocation</div>
        </div>
      </div>

      {/* Media Type Breakdown */}
      <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-xl)' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px' }}>
          Catalog Breakdown by Media Type
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
          <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Film size={24} style={{ color: 'var(--type-video)' }} />
            <div>
              <div style={{ fontSize: '20px', fontWeight: 700 }}>{s.totalVideos || 0}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Videos & Films</div>
            </div>
          </div>

          <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Music size={24} style={{ color: 'var(--type-audio)' }} />
            <div>
              <div style={{ fontSize: '20px', fontWeight: 700 }}>{s.totalMusic || 0}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Audio Tracks</div>
            </div>
          </div>

          <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <ImageIcon size={24} style={{ color: 'var(--type-image)' }} />
            <div>
              <div style={{ fontSize: '20px', fontWeight: 700 }}>{s.totalImages || 0}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Digital Images</div>
            </div>
          </div>

          <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <FileText size={24} style={{ color: 'var(--type-doc)' }} />
            <div>
              <div style={{ fontSize: '20px', fontWeight: 700 }}>{s.totalDocs || 0}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Documents</div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Users and Recent Uploads 2-Column Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
        {/* Recent Users */}
        <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-xl)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Recent Users
            </h3>
            <Link to="/admin/users" style={{ fontSize: '12px', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '2px' }}>
              <span>View All</span>
              <ArrowUpRight size={14} />
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {stats?.recentUsers?.map((u) => (
              <div
                key={u.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  backgroundColor: 'var(--bg-secondary)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <UserAvatar user={u} size={34} />
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {u.name}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {u.email}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span
                    style={{
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: 600,
                      backgroundColor: u.role === 'ADMIN' ? 'rgba(99, 102, 241, 0.2)' : 'var(--bg-tertiary)',
                      color: u.role === 'ADMIN' ? 'var(--accent-primary)' : 'var(--text-secondary)'
                    }}
                  >
                    {u.role}
                  </span>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {u.uploadCount || 0} uploads
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Uploads */}
        <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-xl)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Recent Media Uploads
            </h3>
            <Link to="/admin/media" style={{ fontSize: '12px', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '2px' }}>
              <span>View All</span>
              <ArrowUpRight size={14} />
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {stats?.recentUploads?.map((m) => (
              <div
                key={m.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  backgroundColor: 'var(--bg-secondary)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)'
                }}
              >
                <div style={{ overflow: 'hidden', paddingRight: '12px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }} className="line-clamp-1">
                    {m.title}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    By {m.uploaderName} • {m.categoryName || 'General'}
                  </div>
                </div>

                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
                    {m.mediaType}
                  </span>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {formatBytes(m.size)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

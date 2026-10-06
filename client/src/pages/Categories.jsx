import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import {
  FolderOpen,
  Film,
  Music,
  Image as ImageIcon,
  FileText,
  Cpu,
  Compass,
  ArrowRight,
  Layers
} from 'lucide-react';

export const Categories = () => {
  const { isAdmin } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.categories.getAll()
      .then((res) => {
        if (res.success && res.data) setCategories(res.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const getCategoryIcon = (iconName) => {
    switch (iconName) {
      case 'Film': return <Film size={22} />;
      case 'Music': return <Music size={22} />;
      case 'Image': return <ImageIcon size={22} />;
      case 'FileText': return <FileText size={22} />;
      case 'Cpu': return <Cpu size={22} />;
      case 'Compass': return <Compass size={22} />;
      default: return <FolderOpen size={22} />;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            Media Categories
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Explore organized multimedia collections structured across cinema, lossless audio, digital art, and engineering.
          </p>
        </div>

        {isAdmin && (
          <Link to="/admin/categories" className="btn-secondary" style={{ gap: '6px', fontSize: '13px' }}>
            <span>Manage Taxonomies</span>
            <ArrowRight size={14} />
          </Link>
        )}
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '18px' }}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="skeleton-shimmer" style={{ height: '140px' }} />
          ))}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '18px' }}>
          {categories.map((c) => (
            <Link
              key={c.id}
              to={`/explore?category=${c.id}`}
              className="clean-card"
              style={{
                padding: '22px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                textDecoration: 'none'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '10px',
                    backgroundColor: 'var(--accent-light)',
                    color: 'var(--accent)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {getCategoryIcon(c.icon)}
                </div>

                <span
                  style={{
                    padding: '3px 8px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--bg-subtle)',
                    fontSize: '11.5px',
                    fontWeight: 500,
                    color: 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Layers size={12} />
                  <span>{c.mediaCount || 0} items</span>
                </span>
              </div>

              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                  {c.name}
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.5' }} className="line-clamp-2">
                  {c.description || 'Explore curated media in this category.'}
                </p>
              </div>

              <div style={{ marginTop: 'auto', paddingTop: '8px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: 500, color: 'var(--accent)' }}>
                <span>Browse Category</span>
                <ArrowRight size={14} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

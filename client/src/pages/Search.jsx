import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api.js';
import { MediaGrid } from '../components/media/MediaGrid.jsx';
import { useDebounce } from '../hooks/useDebounce.js';
import { Search as SearchIcon, Film, Music, Image as ImageIcon, FileText, X } from 'lucide-react';

export const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [activeType, setActiveType] = useState('all');
  const [results, setResults] = useState([]);
  const [typeCounts, setTypeCounts] = useState({ video: 0, audio: 0, image: 0, document: 0 });
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  const debouncedQuery = useDebounce(query, 300);

  const executeSearch = async (searchTerm, type) => {
    try {
      setLoading(true);
      const res = await api.media.search(searchTerm, type);
      if (res.success && res.data) {
        setResults(res.data.items || []);
        setTypeCounts(res.data.counts || { video: 0, audio: 0, image: 0, document: 0 });
        setSuggestions(res.data.suggestions || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (debouncedQuery.trim()) {
      setSearchParams({ q: debouncedQuery.trim() });
      executeSearch(debouncedQuery.trim(), activeType);
    } else {
      setResults([]);
      setTypeCounts({ video: 0, audio: 0, image: 0, document: 0 });
      setSuggestions([]);
    }
  }, [debouncedQuery, activeType]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Search Input Hero */}
      <div style={{ maxWidth: '640px', width: '100%', margin: '0 auto', textAlign: 'center' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em', marginBottom: '14px' }}>
          Search Media Catalog
        </h1>

        <div style={{ position: 'relative', width: '100%' }}>
          <SearchIcon
            size={18}
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
            className="form-input"
            placeholder="Search titles, descriptions, tags, authors..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              padding: '12px 40px 12px 42px',
              borderRadius: 'var(--radius-full)',
              fontSize: '14px',
              backgroundColor: '#FFFFFF',
              boxShadow: 'var(--shadow-subtle)'
            }}
            autoFocus
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              style={{
                position: 'absolute',
                right: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
                padding: '3px'
              }}
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Suggestions chips */}
        {suggestions.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '6px', marginTop: '12px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', alignSelf: 'center' }}>Suggestions:</span>
            {suggestions.map((s, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setQuery(s)}
                style={{
                  fontSize: '12px',
                  color: 'var(--accent)',
                  backgroundColor: '#EEF2FF',
                  border: '1px solid #E0E7FF',
                  borderRadius: 'var(--radius-full)',
                  padding: '3px 10px'
                }}
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Result Type Tabs */}
      {query.trim() && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px', overflowX: 'auto' }}>
          {[
            { id: 'all', label: 'All Results', count: Object.values(typeCounts).reduce((a, b) => a + b, 0) },
            { id: 'video', label: 'Videos', icon: Film, count: typeCounts.video || 0 },
            { id: 'audio', label: 'Music', icon: Music, count: typeCounts.audio || 0 },
            { id: 'image', label: 'Images', icon: ImageIcon, count: typeCounts.image || 0 },
            { id: 'document', label: 'Documents', icon: FileText, count: typeCounts.document || 0 }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeType === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveType(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 12px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '13px',
                  fontWeight: isActive ? 600 : 500,
                  backgroundColor: isActive ? 'var(--accent)' : 'transparent',
                  color: isActive ? '#FFFFFF' : 'var(--text-body)',
                  border: `1px solid ${isActive ? 'var(--accent)' : 'var(--border-light)'}`
                }}
              >
                {Icon && <Icon size={14} />}
                <span>{tab.label}</span>
                <span style={{ fontSize: '11px', opacity: 0.8 }}>({tab.count})</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Results grid */}
      <MediaGrid
        items={results}
        isLoading={loading}
        emptyTitle={query ? `No results found for "${query}"` : 'Start searching'}
        emptyDescription={query ? 'Try different search keywords, check spelling, or change media type filter.' : 'Type keywords in the search bar above to query media.'}
        emptyActionText={query ? 'Explore All Catalog' : undefined}
        emptyActionLink={query ? '/explore' : undefined}
        onDeleted={(id) => setResults((prev) => prev.filter((r) => r.id !== id))}
        onUpdated={() => executeSearch(debouncedQuery.trim(), activeType)}
      />
    </div>
  );
};

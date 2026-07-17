import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';

const SpeciesImage = ({ src, alt, className }) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [error, setError] = useState(false);
  useEffect(() => { setImgSrc(src); setError(false); }, [src]);
  if (error || !imgSrc) {
    return (
      <div className={className} style={{
        background: 'linear-gradient(135deg, #1a6b5a 0%, #2980b9 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'white', fontSize: '2rem', fontWeight: 700,
      }}>{alt ? alt.charAt(0).toUpperCase() : '?'}</div>
    );
  }
  return <img src={imgSrc} alt={alt} className={className} style={{ objectFit: 'cover' }} onError={() => setError(true)} crossOrigin="anonymous" referrerPolicy="no-referrer" />;
};

const TAG_CATEGORIES = {
  Behavior: { color: '#3498db', icon: 'M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z' },
  Conservation: { color: '#e74c3c', icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' },
  Danger: { color: '#9b59b6', icon: 'M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01' },
  Ecological: { color: '#e67e22', icon: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5' },
  Role: { color: '#1abc9c', icon: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5' },
  Usage: { color: '#27ae60', icon: 'M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4m7 14l5-5-5-5m5 5H9' },
  Threat: { color: '#c0392b', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' },
};

const Encyclopedia = () => {
  const [species, setSpecies] = useState([]);
  const [filters, setFilters] = useState({ diets: [], statuses: [], tags: [] });
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedDiet, setSelectedDiet] = useState('');
  const [selectedKingdom, setSelectedKingdom] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => { fetchFilters(); }, []);
  useEffect(() => { fetchSpecies(); }, [search, selectedStatus, selectedDiet, selectedKingdom, selectedTags]);

  const fetchFilters = async () => {
    try {
      const res = await api.get('/encyclopedia/filters');
      setFilters(res.data);
    } catch (e) { console.error("Failed to fetch filters", e); }
  };

  const fetchSpecies = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (selectedStatus) params.status = selectedStatus;
      if (selectedDiet) params.diet = selectedDiet;
      if (selectedKingdom) params.kingdom = selectedKingdom;
      if (selectedTags.length > 0) params.tags = selectedTags.join(',');
      const res = await api.get('/encyclopedia', { params });
      setSpecies(res.data);
    } catch (e) { console.error("Failed to fetch species", e); }
    finally { setLoading(false); }
  };

  const toggleTag = (tagName) => {
    setSelectedTags(prev => prev.includes(tagName) ? prev.filter(t => t !== tagName) : [...prev, tagName]);
  };

  const removeFilter = (type, value) => {
    if (type === 'search') { setSearchInput(''); setSearch(''); }
    else if (type === 'status') setSelectedStatus('');
    else if (type === 'diet') setSelectedDiet('');
    else if (type === 'kingdom') setSelectedKingdom('');
    else if (type === 'tag') setSelectedTags(prev => prev.filter(t => t !== value));
  };

  const clearAll = () => {
    setSearchInput(''); setSearch(''); setSelectedStatus('');
    setSelectedDiet(''); setSelectedKingdom(''); setSelectedTags([]);
  };

  const hasActiveFilters = search || selectedStatus || selectedDiet || selectedKingdom || selectedTags.length > 0;

  const getStatusColor = (s) => ({ LC: '#27ae60', NT: '#2ecc71', VU: '#f39c12', EN: '#e67e22', CR: '#e74c3c', EW: '#9b59b6', EX: '#95a5a6' }[s] || '#999');

  // Group tags by category
  const tagsByCategory = {};
  filters.tags?.forEach(tag => {
    if (!tagsByCategory[tag.tagCategory]) tagsByCategory[tag.tagCategory] = [];
    tagsByCategory[tag.tagCategory].push(tag);
  });

  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      {/* Top Search Bar */}
      <div style={{ background: 'white', borderBottom: '1px solid #dde1e6', padding: '1.25rem 2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            {/* Search Input */}
            <div style={{ flex: 1, position: 'relative' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }}>
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                type="text"
                placeholder="Search by common name, scientific name, or keyword..."
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                style={{
                  width: '100%', padding: '0.75rem 1rem 0.75rem 2.75rem',
                  borderRadius: '6px', border: '2px solid #dde1e6',
                  fontSize: '0.95rem', outline: 'none', transition: 'border-color 0.2s',
                }}
                onFocus={e => e.target.style.borderColor = '#2980b9'}
                onBlur={e => e.target.style.borderColor = '#dde1e6'}
              />
              {searchInput && (
                <button onClick={() => { setSearchInput(''); setSearch(''); }}
                  style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#999', fontSize: '1.2rem' }}>
                  &times;
                </button>
              )}
            </div>

            {/* Quick Filters Row */}
            <select value={selectedKingdom} onChange={e => setSelectedKingdom(e.target.value)}
              style={{ padding: '0.75rem 1rem', borderRadius: '6px', border: '2px solid #dde1e6', fontSize: '0.9rem', background: 'white', minWidth: '120px' }}>
              <option value="">All Types</option>
              <option value="Animal">Animals</option>
              <option value="Plant">Plants</option>
            </select>

            <select value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)}
              style={{ padding: '0.75rem 1rem', borderRadius: '6px', border: '2px solid #dde1e6', fontSize: '0.9rem', background: 'white', minWidth: '140px' }}>
              <option value="">All Status</option>
              {filters.statuses?.map(s => <option key={s.statusCode} value={s.statusCode}>{s.statusName}</option>)}
            </select>

            <select value={selectedDiet} onChange={e => setSelectedDiet(e.target.value)}
              style={{ padding: '0.75rem 1rem', borderRadius: '6px', border: '2px solid #dde1e6', fontSize: '0.9rem', background: 'white', minWidth: '130px' }}>
              <option value="">All Diets</option>
              {filters.diets?.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.75rem', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', color: '#888', fontWeight: 600 }}>Active:</span>
              {search && (
                <FilterPill label={`"${search}"`} onRemove={() => removeFilter('search')} />
              )}
              {selectedKingdom && (
                <FilterPill label={selectedKingdom} onRemove={() => removeFilter('kingdom')} />
              )}
              {selectedStatus && (
                <FilterPill label={`Status: ${selectedStatus}`} onRemove={() => removeFilter('status')} color={getStatusColor(selectedStatus)} />
              )}
              {selectedDiet && (
                <FilterPill label={`Diet: ${selectedDiet}`} onRemove={() => removeFilter('diet')} />
              )}
              {selectedTags.map(tag => (
                <FilterPill key={tag} label={tag} onRemove={() => removeFilter('tag', tag)} />
              ))}
              <button onClick={clearAll} style={{ background: 'none', border: 'none', color: '#e74c3c', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', padding: '0.25rem 0.5rem' }}>
                Clear all
              </button>
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', maxWidth: '1400px', margin: '0 auto' }}>
        {/* Tag Filter Sidebar */}
        <aside style={{
          width: '260px', flexShrink: 0, background: '#2980b9',
          padding: '1.5rem', color: 'white', position: 'sticky',
          top: 0, height: 'calc(100vh - 65px)', overflowY: 'auto',
        }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '1.25rem', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '0.75rem' }}>
            Filter by Tags
          </h3>

          {Object.entries(tagsByCategory).map(([category, tags]) => (
            <div key={category} style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: TAG_CATEGORIES[category]?.color || '#fff' }} />
                <span style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgba(255,255,255,0.7)' }}>
                  {category}
                </span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                {tags.map(tag => {
                  const isSelected = selectedTags.includes(tag.tagName);
                  return (
                    <button key={tag.tagName} onClick={() => toggleTag(tag.tagName)} style={{
                      padding: '0.3rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 500,
                      border: `1px solid ${isSelected ? 'white' : 'rgba(255,255,255,0.25)'}`,
                      background: isSelected ? 'white' : 'rgba(255,255,255,0.1)',
                      color: isSelected ? '#2980b9' : 'white',
                      cursor: 'pointer', transition: 'all 0.15s',
                    }}>
                      {tag.tagName}
                      {isSelected && <span style={{ marginLeft: '0.25rem', fontWeight: 700 }}>&times;</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {selectedTags.length > 0 && (
            <button onClick={() => setSelectedTags([])}
              style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.15)', color: 'white', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer', marginTop: '0.5rem' }}>
              Clear Tags ({selectedTags.length})
            </button>
          )}
        </aside>

        {/* Results */}
        <main style={{ flex: 1, padding: '1.5rem 2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h1 style={{ fontSize: '1.3rem', fontWeight: 700 }}>Species Encyclopedia</h1>
              <p style={{ color: '#666', fontSize: '0.85rem' }}>
                {loading ? 'Searching...' : `${species.length} species found`}
              </p>
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem 0', color: '#999' }}>
              <div style={{ width: '32px', height: '32px', border: '3px solid #e8eaed', borderTopColor: '#2980b9', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
              Searching species...
            </div>
          ) : species.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem', background: 'white', borderRadius: '8px', border: '1px solid #dde1e6' }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5" style={{ margin: '0 auto 1rem' }}>
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <h3 style={{ color: '#666', marginBottom: '0.5rem' }}>No species found</h3>
              <p style={{ color: '#999', fontSize: '0.9rem' }}>Try different search terms or adjust your filters.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
              {species.map(s => (
                <Link key={s.organismId} to={`/encyclopedia/${s.organismId}`} style={{ textDecoration: 'none' }}>
                  <div className="species-card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <SpeciesImage src={s.imageUrl} alt={s.commonName || s.scientificName} className="species-card-img" />
                    <div className="species-card-body" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.375rem' }}>
                        <span style={{ fontSize: '0.65rem', fontWeight: 600, color: '#2980b9', textTransform: 'uppercase' }}>
                          {s.kingdomType || 'Organism'}
                        </span>
                        {s.statusCode && (
                          <span style={{
                            fontSize: '0.6rem', fontWeight: 700, padding: '0.15rem 0.4rem',
                            borderRadius: '3px', background: `${getStatusColor(s.statusCode)}15`,
                            color: getStatusColor(s.statusCode), border: `1px solid ${getStatusColor(s.statusCode)}30`,
                          }}>{s.statusCode}</span>
                        )}
                      </div>
                      <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1a1a1a', marginBottom: '0.25rem' }}>
                        {s.commonName || s.scientificName}
                      </h3>
                      {s.commonName && (
                        <div style={{ fontSize: '0.8rem', color: '#888', fontStyle: 'italic', marginBottom: '0.5rem' }}>
                          {s.scientificName}
                        </div>
                      )}
                      {s.tags && s.tags.length > 0 && (
                        <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap', marginTop: 'auto', paddingTop: '0.75rem' }}>
                          {s.tags.slice(0, 4).map((tag, i) => (
                            <span key={i} style={{
                              fontSize: '0.6rem', padding: '0.15rem 0.4rem', borderRadius: '3px',
                              background: '#f0f2f5', color: '#555', fontWeight: 500,
                            }}>{tag.tagName}</span>
                          ))}
                          {s.tags.length > 4 && <span style={{ fontSize: '0.6rem', color: '#999' }}>+{s.tags.length - 4}</span>}
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </main>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

const FilterPill = ({ label, onRemove, color }) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
    padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 500,
    background: color ? `${color}15` : '#e8eaed',
    color: color || '#555',
    border: `1px solid ${color ? `${color}30` : '#d0d0d0'}`,
  }}>
    {label}
    <button onClick={onRemove} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 0, fontSize: '0.9rem', lineHeight: 1 }}>&times;</button>
  </span>
);

export default Encyclopedia;

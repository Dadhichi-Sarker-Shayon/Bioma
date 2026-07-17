import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';

const SpeciesImage = ({ src, alt, className }) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [error, setError] = useState(false);

  useEffect(() => {
    setImgSrc(src);
    setError(false);
  }, [src]);

  if (error || !imgSrc) {
    return (
      <div className={className} style={{
        background: 'linear-gradient(135deg, #1a6b5a 0%, #2980b9 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'white', fontSize: '2rem', fontWeight: 700,
      }}>
        {alt ? alt.charAt(0).toUpperCase() : '?'}
      </div>
    );
  }

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      style={{ objectFit: 'cover' }}
      onError={() => setError(true)}
      crossOrigin="anonymous"
      referrerPolicy="no-referrer"
    />
  );
};

const Encyclopedia = () => {
  const [species, setSpecies] = useState([]);
  const [filters, setFilters] = useState({ Diets: [], Statuses: [], Tags: [] });
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedDiet, setSelectedDiet] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);

  useEffect(() => { fetchFilters(); }, []);

  useEffect(() => { fetchSpecies(); }, [search, selectedStatus, selectedDiet, selectedTags]);

  const fetchFilters = async () => {
    try {
      const res = await api.get('/encyclopedia/filters');
      setFilters(res.data);
    } catch (error) { console.error("Failed to fetch filters", error); }
  };

  const fetchSpecies = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (selectedStatus) params.status = selectedStatus;
      if (selectedDiet) params.diet = selectedDiet;
      if (selectedTags.length > 0) params.tags = selectedTags.join(',');
      const res = await api.get('/encyclopedia', { params });
      setSpecies(res.data);
    } catch (error) { console.error("Failed to fetch species", error); }
    finally { setLoading(false); }
  };

  const toggleTag = (tagName) => {
    setSelectedTags(prev => prev.includes(tagName) ? prev.filter(t => t !== tagName) : [...prev, tagName]);
  };

  const getStatusColor = (status) => {
    const colors = { LC: '#27ae60', NT: '#2ecc71', VU: '#f39c12', EN: '#e67e22', CR: '#e74c3c', EW: '#9b59b6', EX: '#95a5a6' };
    return colors[status] || '#999';
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f0f2f5' }}>
      {/* Blue Sidebar */}
      <aside style={{
        width: '260px', flexShrink: 0, background: '#2980b9',
        padding: '1.5rem', color: 'white', position: 'sticky',
        top: 0, height: '100vh', overflowY: 'auto',
      }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '1rem' }}>
          Filters
        </h2>

        <div style={{ marginBottom: '1.25rem' }}>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.375rem', color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Search</label>
          <input
            type="text" placeholder="Species name..."
            value={search} onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.25)', background: 'rgba(255,255,255,0.15)', color: 'white', fontSize: '0.875rem' }}
          />
        </div>

        <div style={{ marginBottom: '1.25rem' }}>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.375rem', color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</label>
          <select value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)}
            style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.25)', background: 'rgba(255,255,255,0.15)', color: 'white', fontSize: '0.875rem' }}>
            <option value="" style={{ color: '#333' }}>All Statuses</option>
            {filters.Statuses?.map(s => <option key={s.statusCode} value={s.statusCode} style={{ color: '#333' }}>{s.statusName}</option>)}
          </select>
        </div>

        <div style={{ marginBottom: '1.25rem' }}>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.375rem', color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Diet</label>
          <select value={selectedDiet} onChange={e => setSelectedDiet(e.target.value)}
            style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.25)', background: 'rgba(255,255,255,0.15)', color: 'white', fontSize: '0.875rem' }}>
            <option value="" style={{ color: '#333' }}>All Diets</option>
            {filters.Diets?.map(d => <option key={d} value={d} style={{ color: '#333' }}>{d}</option>)}
          </select>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.5rem', color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tags</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
            {filters.Tags?.map(tag => {
              const isSelected = selectedTags.includes(tag.tagName);
              return (
                <button key={tag.tagName} onClick={() => toggleTag(tag.tagName)} style={{
                  padding: '0.2rem 0.6rem', borderRadius: '3px', fontSize: '0.7rem', fontWeight: 500,
                  border: `1px solid ${isSelected ? 'white' : 'rgba(255,255,255,0.3)'}`,
                  background: isSelected ? 'white' : 'rgba(255,255,255,0.15)',
                  color: isSelected ? '#2980b9' : 'white',
                  cursor: 'pointer',
                }}>{tag.tagName}</button>
              );
            })}
          </div>
        </div>

        <button onClick={() => { setSearch(''); setSelectedStatus(''); setSelectedDiet(''); setSelectedTags([]); }}
          style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.15)', color: 'white', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}>
          Clear All Filters
        </button>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '1.5rem 2rem' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Species Encyclopedia</h1>
          <p style={{ color: '#666', fontSize: '0.9rem' }}>
            {species.length} species found
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 0', color: '#999' }}>Loading species...</div>
        ) : species.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', background: 'white', borderRadius: '8px', border: '1px solid #e8e8e8' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5" style={{ margin: '0 auto 1rem' }}>
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <h3 style={{ color: '#666', marginBottom: '0.5rem' }}>No species found</h3>
            <p style={{ color: '#999', fontSize: '0.9rem' }}>Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
            {species.map(s => (
              <Link key={s.organismId} to={`/encyclopedia/${s.organismId}`} style={{ textDecoration: 'none' }}>
                <div className="species-card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <SpeciesImage
                    src={s.imageUrl}
                    alt={s.commonName || s.scientificName}
                    className="species-card-img"
                  />
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
                        {s.tags.slice(0, 3).map((tag, i) => (
                          <span key={i} style={{
                            fontSize: '0.6rem', padding: '0.15rem 0.4rem', borderRadius: '3px',
                            background: '#f0f2f5', color: '#555', fontWeight: 500,
                          }}>{tag.tagName}</span>
                        ))}
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
  );
};

export default Encyclopedia;

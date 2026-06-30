import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Encyclopedia = () => {
  const [species, setSpecies] = useState([]);
  const [filters, setFilters] = useState({ Diets: [], Statuses: [], Tags: [] });
  const [loading, setLoading] = useState(true);
  
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedDiet, setSelectedDiet] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);

  useEffect(() => {
    fetchFilters();
  }, []);

  useEffect(() => {
    fetchSpecies();
  }, [search, selectedStatus, selectedDiet, selectedTags]);

  const fetchFilters = async () => {
    try {
      const res = await fetch('http://localhost:5086/api/encyclopedia/filters');
      if (res.ok) {
        const data = await res.json();
        setFilters(data);
      }
    } catch (error) {
      console.error("Failed to fetch filters", error);
    }
  };

  const fetchSpecies = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (selectedStatus) params.append('status', selectedStatus);
      if (selectedDiet) params.append('diet', selectedDiet);
      if (selectedTags.length > 0) params.append('tags', selectedTags.join(','));

      const res = await fetch(`http://localhost:5086/api/encyclopedia?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setSpecies(data);
      }
    } catch (error) {
      console.error("Failed to fetch species", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTag = (tagName) => {
    setSelectedTags(prev => 
      prev.includes(tagName) 
        ? prev.filter(t => t !== tagName)
        : [...prev, tagName]
    );
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
      <div className="page-header" style={{ marginBottom: '3rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Species Encyclopedia</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Browse the complete catalog of known organisms</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        {/* Sidebar Filters */}
        <aside style={{ width: '280px', flexShrink: 0 }}>
          <div className="glass-panel" style={{ padding: '1.5rem', position: 'sticky', top: '100px' }}>
            <div className="form-group">
              <label className="form-label">Search</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Common or Scientific Name..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ marginTop: '1.5rem' }}>
              <label className="form-label">Conservation Status</label>
              <select className="form-select" value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)}>
                <option value="">All Statuses</option>
                {filters.Statuses?.map(s => (
                  <option key={s.statusCode} value={s.statusCode}>{s.statusName}</option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ marginTop: '1.5rem' }}>
              <label className="form-label">Diet</label>
              <select className="form-select" value={selectedDiet} onChange={e => setSelectedDiet(e.target.value)}>
                <option value="">All Diets</option>
                {filters.Diets?.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ marginTop: '1.5rem' }}>
              <label className="form-label">Characteristics (Tags)</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {filters.Tags?.map(tag => {
                  const isSelected = selectedTags.includes(tag.tagName);
                  return (
                    <button
                      key={tag.tagName}
                      onClick={() => toggleTag(tag.tagName)}
                      style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '1rem',
                        fontSize: '0.75rem',
                        border: `1px solid ${isSelected ? tag.tagColor : 'var(--border-color)'}`,
                        background: isSelected ? `${tag.tagColor}33` : 'transparent',
                        color: isSelected ? tag.tagColor : 'var(--text-secondary)',
                        cursor: 'pointer',
                        transition: 'var(--transition)'
                      }}
                    >
                      {tag.tagName}
                    </button>
                  );
                })}
              </div>
            </div>
            
            <button 
              className="btn btn-secondary" 
              style={{ width: '100%', marginTop: '1.5rem' }}
              onClick={() => {
                setSearch('');
                setSelectedStatus('');
                setSelectedDiet('');
                setSelectedTags([]);
              }}
            >
              Clear Filters
            </button>
          </div>
        </aside>

        {/* Results Grid */}
        <div style={{ flex: 1, minWidth: '0' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-secondary)' }}>
              Loading species data...
            </div>
          ) : species.length === 0 ? (
            <div className="glass-panel" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
              <h3 style={{ marginBottom: '0.5rem' }}>No species found</h3>
              <p style={{ color: 'var(--text-secondary)' }}>Try adjusting your search or filters to find what you're looking for.</p>
            </div>
          ) : (
            <div className="grid-3" style={{ gap: '1.5rem' }}>
              {species.map(s => (
                <Link key={s.organismId} to={`/encyclopedia/${s.organismId}`} style={{ textDecoration: 'none' }}>
                  <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
                    <div style={{ 
                      height: '160px', 
                      background: s.imageUrl ? `url(${s.imageUrl}) center/cover` : 'var(--bg-tertiary)',
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'flex-end',
                      padding: '1rem'
                    }}>
                      {s.statusCode && (
                        <span className="badge badge-warning" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }}>
                          {s.statusCode}
                        </span>
                      )}
                    </div>
                    
                    <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <div style={{ color: 'var(--accent-primary)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
                        {s.kingdomType || 'Organism'}
                      </div>
                      <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                        {s.commonName || s.scientificName}
                      </h3>
                      {s.commonName && (
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontStyle: 'italic', marginBottom: '1rem' }}>
                          {s.scientificName}
                        </div>
                      )}
                      
                      <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem', marginBottom: '1.5rem', flex: 1, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {s.description || 'No description available for this species.'}
                      </p>
                      
                      {s.tags && s.tags.length > 0 && (
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: 'auto' }}>
                          {s.tags.slice(0, 3).map((tag, i) => (
                            <span key={i} style={{ 
                              fontSize: '0.7rem', 
                              padding: '0.15rem 0.5rem', 
                              borderRadius: '1rem', 
                              border: `1px solid ${tag.tagColor}40`,
                              color: tag.tagColor
                            }}>
                              {tag.tagName}
                            </span>
                          ))}
                          {s.tags.length > 3 && (
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', alignSelf: 'center' }}>
                              +{s.tags.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Encyclopedia;

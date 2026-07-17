import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';

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
      const res = await api.get('/encyclopedia/filters');
      setFilters(res.data);
    } catch (error) {
      console.error("Failed to fetch filters", error);
    }
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
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem' }}>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>Species Encyclopedia</h1>
      <p style={{ color: '#777', marginBottom: '2rem' }}>Browse the complete catalog of known organisms</p>

      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
        {/* Sidebar Filters */}
        <aside style={{ width: '240px', flexShrink: 0 }}>
          <div className="card" style={{ padding: '1.25rem', position: 'sticky', top: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Search</label>
              <input type="text" className="form-input" placeholder="Name..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-select" value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)}>
                <option value="">All</option>
                {filters.Statuses?.map(s => (
                  <option key={s.statusCode} value={s.statusCode}>{s.statusName}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Diet</label>
              <select className="form-select" value={selectedDiet} onChange={e => setSelectedDiet(e.target.value)}>
                <option value="">All</option>
                {filters.Diets?.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Tags</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                {filters.Tags?.map(tag => {
                  const isSelected = selectedTags.includes(tag.tagName);
                  return (
                    <button key={tag.tagName} onClick={() => toggleTag(tag.tagName)} style={{
                      padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 500,
                      border: `1px solid ${isSelected ? tag.tagColor : '#ddd'}`,
                      background: isSelected ? `${tag.tagColor}15` : '#f8f9fa',
                      color: isSelected ? tag.tagColor : '#666',
                      cursor: 'pointer',
                    }}>{tag.tagName}</button>
                  );
                })}
              </div>
            </div>
            <button className="btn btn-secondary" style={{ width: '100%', marginTop: '0.75rem' }} onClick={() => { setSearch(''); setSelectedStatus(''); setSelectedDiet(''); setSelectedTags([]); }}>
              Clear Filters
            </button>
          </div>
        </aside>

        {/* Results */}
        <div style={{ flex: 1, minWidth: '0' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem 0', color: '#999' }}>Loading...</div>
          ) : species.length === 0 ? (
            <div className="card" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
              <h3 style={{ marginBottom: '0.5rem' }}>No species found</h3>
              <p style={{ color: '#999' }}>Try adjusting your search or filters.</p>
            </div>
          ) : (
            <div className="grid-3" style={{ gap: '1rem' }}>
              {species.map(s => (
                <Link key={s.organismId} to={`/encyclopedia/${s.organismId}`} style={{ textDecoration: 'none' }}>
                  <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#2980b9', textTransform: 'uppercase' }}>
                        {s.kingdomType || 'Organism'}
                      </span>
                      {s.statusCode && <span className="badge badge-neutral">{s.statusCode}</span>}
                    </div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1a1a1a', marginBottom: '0.25rem' }}>
                      {s.commonName || s.scientificName}
                    </h3>
                    {s.commonName && (
                      <div style={{ fontSize: '0.8rem', color: '#999', fontStyle: 'italic', marginBottom: '0.75rem' }}>
                        {s.scientificName}
                      </div>
                    )}
                    <p style={{ color: '#666', fontSize: '0.8rem', lineHeight: 1.5, flex: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {s.description || 'No description available.'}
                    </p>
                    {s.tags && s.tags.length > 0 && (
                      <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap', marginTop: '0.75rem' }}>
                        {s.tags.slice(0, 3).map((tag, i) => (
                          <span key={i} style={{ fontSize: '0.65rem', padding: '0.15rem 0.4rem', borderRadius: '3px', background: `${tag.tagColor}15`, color: tag.tagColor, fontWeight: 500 }}>
                            {tag.tagName}
                          </span>
                        ))}
                      </div>
                    )}
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

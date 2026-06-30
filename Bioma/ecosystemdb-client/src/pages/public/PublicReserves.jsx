import { useState, useEffect } from 'react';

const PublicReserves = () => {
  const [reserves, setReserves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchReserves();
  }, []);

  const fetchReserves = async () => {
    try {
      const res = await fetch('http://localhost:5086/api/reserves');
      if (res.ok) {
        const data = await res.json();
        setReserves(data);
      }
    } catch (error) {
      console.error("Failed to fetch reserves", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredReserves = reserves.filter(r => 
    r.reserveName?.toLowerCase().includes(search.toLowerCase()) || 
    r.regionName?.toLowerCase().includes(search.toLowerCase()) ||
    r.reserveType?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
      <div className="page-header" style={{ marginBottom: '3rem', flexDirection: 'column', alignItems: 'flex-start', gap: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Protected Reserves</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Explore national parks, marine sanctuaries, and protected regions worldwide.</p>
        </div>
        
        <input 
          type="text" 
          className="form-input" 
          placeholder="Search by name, region, or type..." 
          style={{ maxWidth: '400px' }}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-secondary)' }}>
          Loading reserves data...
        </div>
      ) : filteredReserves.length === 0 ? (
        <div className="glass-panel" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏞️</div>
          <h3 style={{ marginBottom: '0.5rem' }}>No reserves found</h3>
          <p style={{ color: 'var(--text-secondary)' }}>Try adjusting your search terms.</p>
        </div>
      ) : (
        <div className="grid-3" style={{ gap: '2rem' }}>
          {filteredReserves.map(reserve => (
            <div key={reserve.reserveId} className="card" style={{ display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
              <div style={{ 
                position: 'absolute', top: 0, right: 0, width: '100px', height: '100px', 
                background: 'radial-gradient(circle, rgba(16, 185, 129, 0.15), transparent 70%)', borderRadius: '50%', transform: 'translate(30%, -30%)'
              }} />
              
              <div style={{ marginBottom: '1.5rem' }}>
                <span className="badge badge-success" style={{ marginBottom: '0.75rem', display: 'inline-block' }}>
                  {reserve.reserveType || 'Protected Area'}
                </span>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '0.25rem', color: 'var(--text-primary)' }}>
                  {reserve.reserveName}
                </h3>
                <div style={{ color: 'var(--accent-secondary)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  📍 {reserve.regionName || `Region ID: ${reserve.regionId}`}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: 'auto', background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Established</div>
                  <div style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{reserve.establishedYear || 'N/A'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Total Area</div>
                  <div style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{reserve.totalAreaSqKm ? `${reserve.totalAreaSqKm.toLocaleString()} sq km` : 'N/A'}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PublicReserves;

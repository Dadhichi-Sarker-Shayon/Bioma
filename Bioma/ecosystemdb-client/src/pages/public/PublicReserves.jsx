import { useState, useEffect } from 'react';
import api from '../../api';

const PublicReserves = () => {
  const [reserves, setReserves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchReserves();
  }, []);

  const fetchReserves = async () => {
    try {
      const res = await api.get('/reserves');
      setReserves(res.data);
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
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem' }}>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>Protected Reserves</h1>
      <p style={{ color: '#777', marginBottom: '1.5rem' }}>Explore national parks, marine sanctuaries, and protected regions worldwide.</p>

      <input
        type="text" className="form-input" placeholder="Search by name, region, or type..."
        style={{ maxWidth: '350px', marginBottom: '1.5rem' }}
        value={search} onChange={e => setSearch(e.target.value)}
      />

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: '#999' }}>Loading...</div>
      ) : filteredReserves.length === 0 ? (
        <div className="card" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5" style={{ margin: '0 auto 1rem' }}>
            <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/>
          </svg>
          <h3 style={{ marginBottom: '0.5rem', color: '#666' }}>No reserves found</h3>
          <p style={{ color: '#999' }}>Try adjusting your search.</p>
        </div>
      ) : (
        <div className="grid-3" style={{ gap: '1rem' }}>
          {filteredReserves.map(reserve => (
            <div key={reserve.reserveId} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <span className="badge badge-success">{reserve.reserveType || 'Protected Area'}</span>
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.25rem' }}>{reserve.reserveName}</h3>
              <div style={{ color: '#666', fontSize: '0.85rem', marginBottom: '1rem' }}>
                {reserve.regionName || `Region ${reserve.regionId}`}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: 'auto', padding: '0.75rem', background: '#f8f9fa', borderRadius: '4px', border: '1px solid #e8eaed' }}>
                <div>
                  <div style={{ fontSize: '0.65rem', color: '#999', textTransform: 'uppercase' }}>Established</div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{reserve.establishedYear || '—'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.65rem', color: '#999', textTransform: 'uppercase' }}>Area</div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{reserve.totalAreaSqKm ? `${reserve.totalAreaSqKm.toLocaleString()} km²` : '—'}</div>
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

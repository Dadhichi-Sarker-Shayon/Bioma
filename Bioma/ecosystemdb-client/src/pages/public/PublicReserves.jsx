import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';

const PublicReserves = () => {
  const [reserves, setReserves] = useState([]);
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('reserves');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [reservesRes, regionsRes] = await Promise.all([
        api.get('/reserves'),
        api.get('/regions'),
      ]);
      setReserves(reservesRes.data);
      setRegions(regionsRes.data);
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredReserves = reserves.filter(r =>
    r.reserveName?.toLowerCase().includes(search.toLowerCase()) ||
    r.regionName?.toLowerCase().includes(search.toLowerCase()) ||
    r.reserveType?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredRegions = regions.filter(r =>
    r.regionName?.toLowerCase().includes(search.toLowerCase()) ||
    r.country?.toLowerCase().includes(search.toLowerCase()) ||
    r.biomeName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem' }}>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>Regions &amp; Reserves</h1>
      <p style={{ color: '#777', marginBottom: '1.5rem' }}>Explore geographic regions, national parks, marine sanctuaries, and protected areas worldwide.</p>

      {/* Tab Switcher */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
        <button
          onClick={() => { setActiveTab('reserves'); setSearch(''); }}
          style={{
            padding: '0.5rem 1rem', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600,
            border: '1px solid #dde1e6', cursor: 'pointer', transition: 'all 0.15s',
            background: activeTab === 'reserves' ? '#2980b9' : 'white',
            color: activeTab === 'reserves' ? 'white' : '#666',
          }}
        >
          Reserves ({reserves.length})
        </button>
        <button
          onClick={() => { setActiveTab('regions'); setSearch(''); }}
          style={{
            padding: '0.5rem 1rem', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600,
            border: '1px solid #dde1e6', cursor: 'pointer', transition: 'all 0.15s',
            background: activeTab === 'regions' ? '#2980b9' : 'white',
            color: activeTab === 'regions' ? 'white' : '#666',
          }}
        >
          Regions ({regions.length})
        </button>
      </div>

      <input
        type="text" className="form-input"
        placeholder={activeTab === 'reserves' ? "Search by name, region, or type..." : "Search by name, country, or biome..."}
        style={{ maxWidth: '350px', marginBottom: '1.5rem' }}
        value={search} onChange={e => setSearch(e.target.value)}
      />

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: '#999' }}>Loading...</div>
      ) : activeTab === 'reserves' ? (
        filteredReserves.length === 0 ? (
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
              <Link key={reserve.reserveId} to={`/reserves/${reserve.reserveId}`} style={{ textDecoration: 'none' }}>
                <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%', transition: 'transform 0.15s, box-shadow 0.15s' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <span className="badge badge-success">{reserve.reserveType || 'Protected Area'}</span>
                  </div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.25rem', color: '#1a1a1a' }}>{reserve.reserveName}</h3>
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
              </Link>
            ))}
          </div>
        )
      ) : (
        filteredRegions.length === 0 ? (
          <div className="card" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5" style={{ margin: '0 auto 1rem' }}>
              <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
            </svg>
            <h3 style={{ marginBottom: '0.5rem', color: '#666' }}>No regions found</h3>
            <p style={{ color: '#999' }}>Try adjusting your search.</p>
          </div>
        ) : (
          <div className="grid-3" style={{ gap: '1rem' }}>
            {filteredRegions.map(region => (
              <Link key={region.regionId} to={`/regions/${region.regionId}`} style={{ textDecoration: 'none' }}>
                <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <span className="badge badge-neutral">{region.biomeName || 'Region'}</span>
                    {region.isProtected === 'Y' && <span className="badge badge-success">Protected</span>}
                  </div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.25rem', color: '#1a1a1a' }}>{region.regionName}</h3>
                  <div style={{ color: '#666', fontSize: '0.85rem', marginBottom: '1rem' }}>
                    {region.country}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: 'auto', padding: '0.75rem', background: '#f8f9fa', borderRadius: '4px', border: '1px solid #e8eaed' }}>
                    <div>
                      <div style={{ fontSize: '0.65rem', color: '#999', textTransform: 'uppercase' }}>Climate</div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{region.climateZone || '—'}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.65rem', color: '#999', textTransform: 'uppercase' }}>Area</div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{region.areaSqKm ? `${region.areaSqKm.toLocaleString()} km²` : '—'}</div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )
      )}
    </div>
  );
};

export default PublicReserves;

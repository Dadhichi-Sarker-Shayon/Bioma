import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../api';

const getSeverityColor = (level) => {
  const colors = { Low: '#95a5a6', Medium: '#f39c12', High: '#e67e22', Critical: '#e74c3c' };
  return colors[level] || '#999';
};

const getStatusColor = (status) => {
  const colors = { LC: '#27ae60', NT: '#2ecc71', VU: '#f39c12', EN: '#e67e22', CR: '#e74c3c', EW: '#9b59b6', EX: '#95a5a6' };
  return colors[status] || '#999';
};

const RegionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [region, setRegion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => { fetchRegion(); }, [id]);

  const fetchRegion = async () => {
    setLoading(true); setError(null);
    try {
      const res = await api.get(`/regions/${id}`);
      setRegion(res.data);
    } catch (err) {
      setError(err.response?.status === 404 ? 'Region not found.' : 'Failed to load region details.');
    } finally { setLoading(false); }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '4rem', color: '#999' }}>Loading...</div>;
  if (error || !region) return (
    <div style={{ maxWidth: '600px', margin: '4rem auto', textAlign: 'center', padding: '2rem' }}>
      <h2 style={{ color: '#e74c3c', marginBottom: '1rem' }}>{error || 'Error'}</h2>
      <button className="btn btn-primary" onClick={() => navigate('/reserves')}>Back to Reserves</button>
    </div>
  );

  const biomeImageMap = {
    'Tropical Rainforest': 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=1200&h=400&fit=crop',
    'Savanna': 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=1200&h=400&fit=crop',
    'Temperate Forest': 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1200&h=400&fit=crop',
    'Desert': 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=1200&h=400&fit=crop',
    'Marine': 'https://images.unsplash.com/photo-1583212292454-1fe6229603b7?w=1200&h=400&fit=crop',
    'Coral Reef': 'https://images.unsplash.com/photo-1546026423-cc4642628d2b?w=1200&h=400&fit=crop',
    'Tundra': 'https://images.unsplash.com/photo-1494500764479-0c8f2919a3d8?w=1200&h=400&fit=crop',
    'Wetland': 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&h=400&fit=crop',
    'Grassland': 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&h=400&fit=crop',
  };
  const heroImage = biomeImageMap[region.biomeName] || 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&h=400&fit=crop';

  return (
    <div style={{ background: '#f0f2f5', minHeight: '100vh' }}>
      {/* Hero Banner */}
      <div style={{
        position: 'relative', height: '300px', overflow: 'hidden',
        background: '#1a3a5c',
      }}>
        <img src={heroImage} alt={region.regionName} style={{
          width: '100%', height: '100%', objectFit: 'cover',
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(transparent 40%, rgba(0,0,0,0.7))',
        }} />
        <div style={{
          position: 'absolute', bottom: '2rem', left: '2rem', right: '2rem',
          maxWidth: '1000px', margin: '0 auto', color: 'white',
        }}>
          <Link to="/reserves" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontSize: '0.8rem', marginBottom: '0.5rem', display: 'inline-block' }}>
            &larr; Back to Reserves
          </Link>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.25rem' }}>{region.regionName}</h1>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', fontSize: '0.9rem', opacity: 0.9 }}>
            <span>{region.country}</span>
            {region.isProtected === 'Y' && <span className="badge badge-success">Protected</span>}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1000px', margin: '-1rem auto 2rem', padding: '0 2rem', position: 'relative', zIndex: 1 }}>
        {/* Stats Row */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem',
          background: 'white', borderRadius: '8px', padding: '1.25rem',
          border: '1px solid #dde1e6', marginBottom: '1.5rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1a3a5c' }}>{region.species?.length || 0}</div>
            <div style={{ fontSize: '0.7rem', color: '#888', textTransform: 'uppercase', fontWeight: 600 }}>Species</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#27ae60' }}>{region.reserves?.length || 0}</div>
            <div style={{ fontSize: '0.7rem', color: '#888', textTransform: 'uppercase', fontWeight: 600 }}>Reserves</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#2980b9' }}>{region.stats?.totalSightings || 0}</div>
            <div style={{ fontSize: '0.7rem', color: '#888', textTransform: 'uppercase', fontWeight: 600 }}>Sightings</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#e67e22' }}>{region.threats?.length || 0}</div>
            <div style={{ fontSize: '0.7rem', color: '#888', textTransform: 'uppercase', fontWeight: 600 }}>Threats</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Region Info */}
            <section style={{ background: 'white', border: '1px solid #dde1e6', borderRadius: '6px', padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem' }}>Region Information</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.9rem' }}>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#888', textTransform: 'uppercase' }}>Country</div>
                  <div style={{ fontWeight: 600 }}>{region.country}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#888', textTransform: 'uppercase' }}>Biome</div>
                  <div style={{ fontWeight: 600 }}>{region.biomeName || '—'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#888', textTransform: 'uppercase' }}>Climate Zone</div>
                  <div style={{ fontWeight: 600 }}>{region.climateZone || '—'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#888', textTransform: 'uppercase' }}>Area</div>
                  <div style={{ fontWeight: 600 }}>{region.areaSqKm ? `${region.areaSqKm.toLocaleString()} km²` : '—'}</div>
                </div>
              </div>
            </section>

            {/* Species in Region */}
            {region.species && region.species.length > 0 && (
              <section style={{ background: 'white', border: '1px solid #dde1e6', borderRadius: '6px', padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                  Species Found Here ({region.species.length})
                </h3>
                <div style={{ display: 'grid', gap: '0.625rem' }}>
                  {region.species.map(sp => (
                    <Link
                      key={sp.organismId}
                      to={`/encyclopedia/${sp.organismId}`}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '0.75rem',
                        padding: '0.625rem', borderRadius: '6px', textDecoration: 'none',
                        border: '1px solid #e8eaed', background: '#f8f9fa', transition: 'background 0.15s',
                      }}
                      onMouseOver={(e) => e.currentTarget.style.background = '#eef2f7'}
                      onMouseOut={(e) => e.currentTarget.style.background = '#f8f9fa'}
                    >
                      {sp.imageUrl && (
                        <img src={sp.imageUrl} alt={sp.commonName} style={{
                          width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover',
                        }} />
                      )}
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#1a1a1a' }}>{sp.commonName || sp.scientificName}</div>
                        <div style={{ fontSize: '0.75rem', color: '#888', fontStyle: 'italic' }}>{sp.scientificName}</div>
                      </div>
                      {sp.conservationStatus && (
                        <span style={{
                          fontSize: '0.6rem', fontWeight: 700, padding: '0.15rem 0.4rem',
                          borderRadius: '3px', color: getStatusColor(sp.conservationStatus),
                          background: getStatusColor(sp.conservationStatus) + '15',
                        }}>
                          {sp.conservationStatus}
                        </span>
                      )}
                      {sp.populationTrend && (
                        <span style={{ fontSize: '0.65rem', color: '#999' }}>
                          {sp.populationTrend === 'Increasing' ? '↑' : sp.populationTrend === 'Decreasing' ? '↓' : '—'}
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Threats */}
            {region.threats && region.threats.length > 0 && (
              <section style={{ background: 'white', border: '1px solid #dde1e6', borderRadius: '6px', padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                  Active Threats ({region.threats.length})
                </h3>
                <div style={{ display: 'grid', gap: '0.5rem' }}>
                  {region.threats.map((threat, i) => (
                    <div key={i} style={{
                      padding: '0.625rem', borderRadius: '6px', border: '1px solid #e8eaed',
                      borderLeft: `3px solid ${getSeverityColor(threat.severityLevel)}`,
                      background: '#f8f9fa',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                        <strong style={{ fontSize: '0.85rem', color: '#1a1a1a' }}>{threat.threatName}</strong>
                        <span style={{
                          fontSize: '0.6rem', fontWeight: 700, padding: '0.1rem 0.4rem',
                          borderRadius: '3px', color: getSeverityColor(threat.severityLevel),
                          background: getSeverityColor(threat.severityLevel) + '15',
                        }}>
                          {threat.severityLevel}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#888' }}>
                        {threat.threatCategory} &middot; {threat.resolutionStatus}
                        {threat.assessmentDate && ` \u00B7 ${threat.assessmentDate}`}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Reserves in Region */}
            {region.reserves && region.reserves.length > 0 && (
              <div style={{ background: 'white', border: '1px solid #dde1e6', borderRadius: '6px', padding: '1.25rem' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem' }}>Reserves</h3>
                <div style={{ display: 'grid', gap: '0.5rem' }}>
                  {region.reserves.map(res => (
                    <Link
                      key={res.reserveId}
                      to={`/reserves/${res.reserveId}`}
                      style={{
                        padding: '0.625rem', borderRadius: '6px', textDecoration: 'none',
                        border: '1px solid #e8eaed', background: '#f8f9fa', transition: 'background 0.15s',
                      }}
                      onMouseOver={(e) => e.currentTarget.style.background = '#eef2f7'}
                      onMouseOut={(e) => e.currentTarget.style.background = '#f8f9fa'}
                    >
                      <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#1a1a1a' }}>{res.reserveName}</div>
                      <div style={{ fontSize: '0.75rem', color: '#888', marginTop: '0.125rem' }}>
                        {res.reserveType || 'Protected Area'}
                        {res.totalAreaSqKm && ` \u00B7 ${res.totalAreaSqKm.toLocaleString()} km\u00B2`}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Facts */}
            <div style={{ background: 'white', border: '1px solid #dde1e6', borderRadius: '6px', padding: '1.25rem' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem' }}>Quick Facts</h3>
              <div style={{ fontSize: '0.85rem', color: '#666', display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Region ID:</span><span style={{ fontWeight: 600 }}>{region.regionId}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Status:</span><span style={{ fontWeight: 600 }}>{region.isProtected === 'Y' ? 'Protected' : 'Unprotected'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Unique Species:</span><span style={{ fontWeight: 600 }}>{region.stats?.uniqueSpecies || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegionDetail;

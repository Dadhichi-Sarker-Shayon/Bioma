import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../api';

const getStatusColor = (status) => {
  const colors = { LC: '#27ae60', NT: '#2ecc71', VU: '#f39c12', EN: '#e67e22', CR: '#e74c3c', EW: '#9b59b6', EX: '#95a5a6' };
  return colors[status] || '#999';
};

const getHealthColor = (health) => {
  const colors = { Healthy: '#27ae60', Injured: '#e67e22', Malnourished: '#f39c12', Dead: '#e74c3c', Unknown: '#999' };
  return colors[health] || '#999';
};

const ReserveDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [reserve, setReserve] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => { fetchReserve(); }, [id]);

  const fetchReserve = async () => {
    setLoading(true); setError(null);
    try {
      const res = await api.get(`/reserves/${id}`);
      setReserve(res.data);
    } catch (err) {
      setError(err.response?.status === 404 ? 'Reserve not found.' : 'Failed to load reserve details.');
    } finally { setLoading(false); }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '4rem', color: '#999' }}>Loading...</div>;
  if (error || !reserve) return (
    <div style={{ maxWidth: '600px', margin: '4rem auto', textAlign: 'center', padding: '2rem' }}>
      <h2 style={{ color: '#e74c3c', marginBottom: '1rem' }}>{error || 'Error'}</h2>
      <button className="btn btn-primary" onClick={() => navigate('/reserves')}>Back to Reserves</button>
    </div>
  );

  const reserveTypeImages = {
    'National Park': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=400&fit=crop',
    'Marine Sanctuary': 'https://images.unsplash.com/photo-1583212292454-1fe6229603b7?w=1200&h=400&fit=crop',
    'Wildlife Reserve': 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=1200&h=400&fit=crop',
    'Biosphere Reserve': 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1200&h=400&fit=crop',
    'Nature Reserve': 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&h=400&fit=crop',
  };
  const heroImage = reserveTypeImages[reserve.reserveType] || 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&h=400&fit=crop';

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div style={{ background: '#f0f2f5', minHeight: '100vh' }}>
      {/* Hero Banner */}
      <div style={{
        position: 'relative', height: '300px', overflow: 'hidden',
        background: '#1a3a5c',
      }}>
        <img src={heroImage} alt={reserve.reserveName} style={{
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
          <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.25rem' }}>{reserve.reserveName}</h1>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', fontSize: '0.9rem', opacity: 0.9 }}>
            <span>{reserve.reserveType || 'Protected Area'}</span>
            <span>&middot;</span>
            <Link to={`/regions/${reserve.regionId}`} style={{ color: 'white', textDecoration: 'underline' }}>
              {reserve.regionName}
            </Link>
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
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1a3a5c' }}>{reserve.stats?.totalSightings || 0}</div>
            <div style={{ fontSize: '0.7rem', color: '#888', textTransform: 'uppercase', fontWeight: 600 }}>Sightings</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#27ae60' }}>{reserve.stats?.uniqueSpecies || 0}</div>
            <div style={{ fontSize: '0.7rem', color: '#888', textTransform: 'uppercase', fontWeight: 600 }}>Unique Species</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#2980b9' }}>{reserve.totalAreaSqKm ? reserve.totalAreaSqKm.toLocaleString() : '—'}</div>
            <div style={{ fontSize: '0.7rem', color: '#888', textTransform: 'uppercase', fontWeight: 600 }}>km² Area</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#e67e22' }}>{reserve.stats?.unhealthySightings || 0}</div>
            <div style={{ fontSize: '0.7rem', color: '#888', textTransform: 'uppercase', fontWeight: 600 }}>Unhealthy</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Reserve Info */}
            <section style={{ background: 'white', border: '1px solid #dde1e6', borderRadius: '6px', padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem' }}>Reserve Information</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.9rem' }}>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#888', textTransform: 'uppercase' }}>Region</div>
                  <div style={{ fontWeight: 600 }}>
                    <Link to={`/regions/${reserve.regionId}`} style={{ color: '#2980b9', textDecoration: 'none' }}>
                      {reserve.regionName}
                    </Link>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#888', textTransform: 'uppercase' }}>Country</div>
                  <div style={{ fontWeight: 600 }}>{reserve.country || '—'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#888', textTransform: 'uppercase' }}>Biome</div>
                  <div style={{ fontWeight: 600 }}>{reserve.biomeName || '—'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#888', textTransform: 'uppercase' }}>Climate Zone</div>
                  <div style={{ fontWeight: 600 }}>{reserve.climateZone || '—'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#888', textTransform: 'uppercase' }}>Established</div>
                  <div style={{ fontWeight: 600 }}>{reserve.establishedYear || '—'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#888', textTransform: 'uppercase' }}>Annual Budget</div>
                  <div style={{ fontWeight: 600 }}>{reserve.annualBudgetUsd ? `$${reserve.annualBudgetUsd.toLocaleString()}` : '—'}</div>
                </div>
              </div>
            </section>

            {/* Recent Sightings */}
            {reserve.recentSightings && reserve.recentSightings.length > 0 && (
              <section style={{ background: 'white', border: '1px solid #dde1e6', borderRadius: '6px', padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                  Recent Sightings ({reserve.recentSightings.length})
                </h3>
                <div style={{ display: 'grid', gap: '0.625rem' }}>
                  {reserve.recentSightings.map(s => (
                    <div key={s.sightingId} style={{
                      padding: '0.75rem', borderRadius: '6px', border: '1px solid #e8eaed',
                      background: '#f8f9fa',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.375rem' }}>
                        <Link
                          to={`/encyclopedia/${s.organismId}`}
                          style={{ textDecoration: 'none', fontWeight: 600, fontSize: '0.85rem', color: '#1a1a1a' }}
                        >
                          {s.speciesName || s.scientificName}
                        </Link>
                        <span style={{
                          fontSize: '0.6rem', fontWeight: 700, padding: '0.1rem 0.4rem',
                          borderRadius: '3px', color: getHealthColor(s.healthStatus),
                          background: getHealthColor(s.healthStatus) + '15',
                        }}>
                          {s.healthStatus}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.75rem', color: '#888' }}>
                        <span>{formatDate(s.timestamp)}</span>
                        <span>Qty: {s.quantity}</span>
                        {s.conservationStatus && (
                          <span style={{ color: getStatusColor(s.conservationStatus) }}>
                            {s.conservationStatus}
                          </span>
                        )}
                      </div>
                      {s.notes && (
                        <div style={{ marginTop: '0.375rem', fontSize: '0.8rem', color: '#666', fontStyle: 'italic' }}>
                          "{s.notes}"
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ background: 'white', border: '1px solid #dde1e6', borderRadius: '6px', padding: '1.25rem' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem' }}>Quick Facts</h3>
              <div style={{ fontSize: '0.85rem', color: '#666', display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Reserve ID:</span><span style={{ fontWeight: 600 }}>{reserve.reserveId}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Type:</span><span style={{ fontWeight: 600 }}>{reserve.reserveType || '—'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Region Area:</span><span style={{ fontWeight: 600 }}>{reserve.regionArea ? `${reserve.regionArea.toLocaleString()} km²` : '—'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Protected:</span><span style={{ fontWeight: 600 }}>{reserve.isProtected === 'Y' ? 'Yes' : 'No'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReserveDetail;

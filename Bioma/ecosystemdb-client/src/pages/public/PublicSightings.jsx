import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';

const PublicSightings = () => {
  const [sightings, setSightings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSightings();
  }, []);

  const fetchSightings = async () => {
    try {
      const res = await api.get('/sightings');
      setSightings(res.data);
    } catch (error) {
      console.error("Failed to fetch sightings", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>Global Sightings</h1>
      <p style={{ color: '#777', marginBottom: '2rem' }}>Wildlife observations from researchers around the world.</p>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: '#999' }}>Loading...</div>
      ) : sightings.length === 0 ? (
        <div className="card" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
          <h3 style={{ marginBottom: '0.5rem' }}>No sightings recorded</h3>
          <p style={{ color: '#999' }}>Check back later.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {sightings.map(sighting => (
            <div key={sighting.sightingId} className="card" style={{ padding: '1.25rem', display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
              <div style={{ minWidth: '100px', textAlign: 'center', paddingRight: '1.5rem', borderRight: '1px solid #e8e8e8' }}>
                <div style={{ fontSize: '0.75rem', color: '#2980b9', fontWeight: 600, marginBottom: '0.375rem' }}>
                  {formatDate(sighting.timestamp)}
                </div>
                <div style={{ fontSize: '2rem', marginBottom: '0.375rem' }}>
                  {sighting.quantityObserved > 1 ? '👀' : '👁️'}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#999' }}>Qty: {sighting.quantityObserved}</div>
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.375rem' }}>
                  <Link to={`/encyclopedia/${sighting.organismId}`} style={{ textDecoration: 'none' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1a1a1a' }}>{sighting.speciesName}</h3>
                  </Link>
                  {sighting.healthStatus && (
                    <span className={`badge ${sighting.healthStatus.toLowerCase().includes('healthy') ? 'badge-success' : 'badge-warning'}`}>
                      {sighting.healthStatus}
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.75rem', color: '#777', fontSize: '0.8rem' }}>
                  <span>📍 {sighting.reserveName}</span>
                  <span>👤 {sighting.observerName}</span>
                </div>
                {sighting.observationNotes && (
                  <div style={{ background: '#f8f9fa', padding: '0.75rem', borderRadius: '4px', border: '1px solid #e8e8e8', color: '#333', fontSize: '0.85rem', fontStyle: 'italic' }}>
                    "{sighting.observationNotes}"
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PublicSightings;

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const PublicSightings = () => {
  const [sightings, setSightings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSightings();
  }, []);

  const fetchSightings = async () => {
    try {
      const res = await fetch('http://localhost:5086/api/sightings');
      if (res.ok) {
        const data = await res.json();
        setSightings(data);
      }
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
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 2rem' }}>
      <div className="page-header" style={{ marginBottom: '3rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Global Sightings Feed</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Live updates of wildlife observations from researchers around the world.</p>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-secondary)' }}>
          Loading sightings data...
        </div>
      ) : sightings.length === 0 ? (
        <div className="glass-panel" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔭</div>
          <h3 style={{ marginBottom: '0.5rem' }}>No sightings recorded</h3>
          <p style={{ color: 'var(--text-secondary)' }}>Check back later for new observations.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {sightings.map(sighting => (
            <div key={sighting.sightingId} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
              
              <div style={{ minWidth: '150px', textAlign: 'center', paddingRight: '2rem', borderRight: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.875rem', color: 'var(--accent-primary)', marginBottom: '0.5rem', fontWeight: 500 }}>
                  {formatDate(sighting.timestamp)}
                </div>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
                  {sighting.quantityObserved > 1 ? '👀' : '👁️'}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                  Qty: {sighting.quantityObserved}
                </div>
              </div>
              
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <Link to={`/encyclopedia/${sighting.organismId}`} style={{ textDecoration: 'none' }}>
                    <h3 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', transition: 'var(--transition)' }} onMouseOver={(e) => e.target.style.color = 'var(--accent-primary)'} onMouseOut={(e) => e.target.style.color = 'var(--text-primary)'}>
                      {sighting.speciesName}
                    </h3>
                  </Link>
                  {sighting.healthStatus && (
                    <span className={`badge ${sighting.healthStatus.toLowerCase().includes('healthy') ? 'badge-success' : 'badge-warning'}`}>
                      {sighting.healthStatus}
                    </span>
                  )}
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    📍 {sighting.reserveName}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    👤 {sighting.observerName}
                  </span>
                </div>
                
                {sighting.observationNotes && (
                  <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '0.95rem', fontStyle: 'italic', position: 'relative' }}>
                    <span style={{ position: 'absolute', top: '0.5rem', left: '0.5rem', color: 'var(--border-color)', fontSize: '1.5rem', lineHeight: 1 }}>"</span>
                    <span style={{ paddingLeft: '1.5rem', display: 'block' }}>{sighting.observationNotes}</span>
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

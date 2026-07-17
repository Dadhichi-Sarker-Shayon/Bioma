import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../api';

const SpeciesDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [species, setSpecies] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSpeciesDetail();
  }, [id]);

  const fetchSpeciesDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/encyclopedia/${id}`);
      setSpecies(res.data);
    } catch (err) {
      if (err.response?.status === 404) {
        setError('Species not found.');
      } else {
        setError('Failed to load species details.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '4rem', color: '#999' }}>Loading...</div>;
  }

  if (error || !species) {
    return (
      <div style={{ maxWidth: '600px', margin: '4rem auto', textAlign: 'center' }}>
        <h2 style={{ color: '#e74c3c', marginBottom: '1rem' }}>{error || 'Error'}</h2>
        <button className="btn btn-primary" onClick={() => navigate('/encyclopedia')}>Back to Encyclopedia</button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
      <Link to="/encyclopedia" style={{ color: '#2980b9', textDecoration: 'none', fontSize: '0.85rem', marginBottom: '1.5rem', display: 'inline-block' }}>
        ← Back to Encyclopedia
      </Link>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ color: '#999', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
            {species.kingdomType} / {species.statusCode || 'Unassessed'}
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.25rem' }}>
            {species.commonName || species.scientificName}
          </h1>
          {species.commonName && (
            <h2 style={{ fontSize: '1.1rem', color: '#999', fontStyle: 'italic', fontWeight: 400 }}>
              {species.scientificName}
            </h2>
          )}
        </div>
        {species.discoveryYear && (
          <div className="card" style={{ padding: '0.75rem 1.25rem', textAlign: 'center' }}>
            <div style={{ fontSize: '0.65rem', color: '#999', textTransform: 'uppercase' }}>Discovered</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1a3a5c' }}>{species.discoveryYear}</div>
          </div>
        )}
      </div>

      {species.imageUrl && (
        <div style={{ width: '100%', height: '350px', borderRadius: '8px', overflow: 'hidden', marginBottom: '1.5rem', border: '1px solid #e8e8e8' }}>
          <img src={species.imageUrl} alt={species.commonName || species.scientificName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {species.description && (
            <section className="card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem' }}>About</h3>
              <p style={{ color: '#555', lineHeight: 1.7, fontSize: '0.95rem' }}>{species.description}</p>
            </section>
          )}

          {(species.physicalDescription || species.avgHeightCm || species.avgLengthCm) && (
            <section className="card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem' }}>Physical Characteristics</h3>
              <div style={{ display: 'flex', gap: '2rem', marginBottom: '1rem' }}>
                {species.avgHeightCm && <div><div style={{ fontSize: '0.7rem', color: '#999', textTransform: 'uppercase' }}>Height</div><div style={{ fontWeight: 600 }}>{species.avgHeightCm} cm</div></div>}
                {species.avgLengthCm && <div><div style={{ fontSize: '0.7rem', color: '#999', textTransform: 'uppercase' }}>Length</div><div style={{ fontWeight: 600 }}>{species.avgLengthCm} cm</div></div>}
              </div>
              {species.physicalDescription && <p style={{ color: '#555', lineHeight: 1.6, fontSize: '0.9rem' }}>{species.physicalDescription}</p>}
            </section>
          )}

          {(species.habitatBehavior || species.dietType) && (
            <section className="card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem' }}>Ecology & Behavior</h3>
              {species.dietType && (
                <div style={{ marginBottom: '1rem' }}>
                  <span className="badge badge-success">{species.dietType}</span>
                  {species.dietDetails && <p style={{ color: '#555', marginTop: '0.5rem', fontSize: '0.9rem' }}>{species.dietDetails}</p>}
                </div>
              )}
              {species.habitatBehavior && <p style={{ color: '#555', lineHeight: 1.6, fontSize: '0.9rem' }}>{species.habitatBehavior}</p>}
            </section>
          )}

          {species.distributions && species.distributions.length > 0 && (
            <section className="card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem' }}>Known Distributions</h3>
              <div style={{ display: 'grid', gap: '0.75rem' }}>
                {species.distributions.map((dist, i) => (
                  <div key={i} style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid #e8e8e8', background: '#f8f9fa' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                      <strong style={{ color: '#1a3a5c', fontSize: '0.9rem' }}>{dist.regionName}, {dist.country}</strong>
                      {dist.isProtected === 'Y' && <span className="badge badge-success">Protected</span>}
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: '#666' }}>
                      <span>Biome: {dist.biomeName}</span>
                      <span>Trend: {dist.populationTrend || 'Unknown'}</span>
                      {dist.estimatedLocalPopulation && <span>Pop: {dist.estimatedLocalPopulation.toLocaleString()}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {species.funFact && (
            <div className="card" style={{ padding: '1.25rem', borderLeft: '3px solid #f39c12' }}>
              <h4 style={{ color: '#f39c12', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem' }}>Fun Fact</h4>
              <p style={{ color: '#555', fontSize: '0.85rem', lineHeight: 1.5 }}>{species.funFact}</p>
            </div>
          )}

          {species.lineage && species.lineage.length > 0 && (
            <div className="card" style={{ padding: '1.25rem' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem' }}>Taxonomy Lineage</h3>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {species.lineage.map((taxon, i) => (
                  <li key={i} style={{
                    paddingLeft: `${i * 10}px`, marginBottom: '0.375rem',
                    color: i === species.lineage.length - 1 ? '#2980b9' : '#666',
                    fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.375rem',
                  }}>
                    {i > 0 && <span style={{ color: '#ccc' }}>↳</span>}
                    <span style={{ fontWeight: 600, minWidth: '55px', fontSize: '0.75rem' }}>{taxon.rankName}</span>
                    <span style={{ fontStyle: 'italic' }}>{taxon.scientificName}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="card" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem' }}>Info</h3>
            <div style={{ fontSize: '0.85rem', color: '#666', display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Organism ID:</span><span style={{ fontWeight: 600 }}>{species.organismId}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Last Updated:</span><span style={{ fontWeight: 600 }}>{species.lastUpdated || '—'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpeciesDetail;

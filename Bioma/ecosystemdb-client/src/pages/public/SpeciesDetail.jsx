import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';

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
      const res = await fetch(`http://localhost:5086/api/encyclopedia/${id}`);
      if (res.ok) {
        const data = await res.json();
        setSpecies(data);
      } else if (res.status === 404) {
        setError('Species not found.');
      } else {
        setError('Failed to load species details.');
      }
    } catch (error) {
      console.error("Failed to fetch species details", error);
      setError('A network error occurred.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>Loading species data...</div>;
  }

  if (error || !species) {
    return (
      <div style={{ maxWidth: '800px', margin: '4rem auto', textAlign: 'center' }}>
        <h2 style={{ color: 'var(--danger)', marginBottom: '1rem' }}>{error || 'Error'}</h2>
        <button className="btn btn-primary" onClick={() => navigate('/encyclopedia')}>Return to Encyclopedia</button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 2rem' }}>
      
      {/* Header & Breadcrumbs */}
      <div style={{ marginBottom: '2rem' }}>
        <Link to="/encyclopedia" style={{ color: 'var(--accent-primary)', textDecoration: 'none', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
          ← Back to Encyclopedia
        </Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '2rem' }}>
          <div>
            <div style={{ color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
              {species.kingdomType} / {species.statusCode || 'Unassessed'}
            </div>
            <h1 style={{ fontSize: '3rem', marginBottom: '0.5rem', lineHeight: 1.1 }}>
              {species.commonName || species.scientificName}
            </h1>
            {species.commonName && (
              <h2 style={{ fontSize: '1.5rem', color: 'var(--text-tertiary)', fontStyle: 'italic', fontWeight: 400 }}>
                {species.scientificName}
              </h2>
            )}
          </div>
          {species.discoveryYear && (
            <div className="glass-panel" style={{ padding: '1rem', textAlign: 'center', minWidth: '120px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Discovered</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--accent-primary)' }}>{species.discoveryYear}</div>
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', marginBottom: '4rem' }}>
        
        {/* Main Content Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {species.imageUrl && (
            <div style={{ 
              width: '100%', 
              height: '400px', 
              borderRadius: 'var(--radius-lg)', 
              overflow: 'hidden',
              boxShadow: 'var(--shadow-md)',
              border: '1px solid var(--border-color)'
            }}>
              <img src={species.imageUrl} alt={species.commonName || species.scientificName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          )}

          {species.description && (
            <section className="glass-panel" style={{ padding: '2rem' }}>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>About</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '1.05rem' }}>{species.description}</p>
            </section>
          )}

          {(species.physicalDescription || species.avgHeightCm || species.avgLengthCm) && (
            <section className="glass-panel" style={{ padding: '2rem' }}>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Physical Characteristics</h3>
              
              <div style={{ display: 'flex', gap: '2rem', marginBottom: '1.5rem' }}>
                {species.avgHeightCm && (
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Avg Height</div>
                    <div style={{ fontSize: '1.25rem', color: 'var(--text-primary)' }}>{species.avgHeightCm} cm</div>
                  </div>
                )}
                {species.avgLengthCm && (
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Avg Length</div>
                    <div style={{ fontSize: '1.25rem', color: 'var(--text-primary)' }}>{species.avgLengthCm} cm</div>
                  </div>
                )}
              </div>

              {species.physicalDescription && (
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>{species.physicalDescription}</p>
              )}
            </section>
          )}

          {(species.habitatBehavior || species.dietType) && (
            <section className="glass-panel" style={{ padding: '2rem' }}>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Ecology & Behavior</h3>
              
              {species.dietType && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <span className="badge badge-success" style={{ fontSize: '0.85rem', marginBottom: '0.5rem', display: 'inline-block' }}>{species.dietType}</span>
                  {species.dietDetails && <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>{species.dietDetails}</p>}
                </div>
              )}

              {species.habitatBehavior && (
                <div>
                  <h4 style={{ fontSize: '1rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Habitat & Behavior</h4>
                  <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>{species.habitatBehavior}</p>
                </div>
              )}
            </section>
          )}

          {species.distributions && species.distributions.length > 0 && (
            <section className="glass-panel" style={{ padding: '2rem' }}>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Known Distributions</h3>
              <div style={{ display: 'grid', gap: '1rem' }}>
                {species.distributions.map((dist, i) => (
                  <div key={i} style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                      <h4 style={{ margin: 0, color: 'var(--accent-secondary)' }}>{dist.regionName}, {dist.country}</h4>
                      {dist.isProtected === 'Y' && <span className="badge badge-success">Protected</span>}
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      <div>Biome: <span style={{ color: 'var(--text-primary)' }}>{dist.biomeName}</span></div>
                      <div>Pop. Trend: <span style={{ color: 'var(--text-primary)' }}>{dist.populationTrend || 'Unknown'}</span></div>
                      {dist.estimatedLocalPopulation && <div>Est. Population: <span style={{ color: 'var(--text-primary)' }}>{dist.estimatedLocalPopulation.toLocaleString()}</span></div>}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {species.funFact && (
            <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid var(--warning)' }}>
              <h4 style={{ color: 'var(--warning)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>💡</span> Fun Fact
              </h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                {species.funFact}
              </p>
            </div>
          )}

          {species.lineage && species.lineage.length > 0 && (
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Taxonomy Lineage</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {species.lineage.map((taxon, i) => (
                  <li key={i} style={{ 
                    position: 'relative', 
                    paddingLeft: `${i * 12}px`, 
                    marginBottom: '0.5rem',
                    color: i === species.lineage.length - 1 ? 'var(--accent-primary)' : 'var(--text-secondary)',
                    fontSize: '0.9rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    {i > 0 && <span style={{ color: 'var(--border-color)' }}>↳</span>}
                    <span style={{ fontWeight: 600, minWidth: '60px' }}>{taxon.rankName}</span>
                    <span style={{ fontStyle: 'italic' }}>{taxon.scientificName}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Database Info</h3>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Organism ID:</span>
                <span style={{ color: 'var(--text-primary)' }}>{species.organismId}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Last Updated:</span>
                <span style={{ color: 'var(--text-primary)' }}>{species.lastUpdated || 'Unknown'}</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SpeciesDetail;

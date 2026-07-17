import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../../api';

const Home = () => {
  const [stats, setStats] = useState({ species: 0, reserves: 0, sightings: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [statsRes, reservesRes] = await Promise.all([
          api.get('/dashboard/stats'),
          api.get('/reserves'),
        ]);
        setStats({
          species: statsRes.data.totalSpecies || 0,
          reserves: reservesRes.data.length || statsRes.data.totalReserves || 0,
          sightings: statsRes.data.totalSightings || 0,
        });
      } catch {
        setStats({ species: 0, reserves: 0, sightings: 0 });
      }
    };
    fetchStats();
  }, []);

  return (
    <div>
      {/* Hero Section with Background Image */}
      <section style={{
        position: 'relative',
        minHeight: '85vh',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden'
      }}>
        {/* Background Image */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'url(/images/hero_tiger.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center 30%',
          filter: 'brightness(0.35)',
          zIndex: 0
        }} />
        {/* Dark overlay gradient */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to bottom, rgba(15,17,21,0.3) 0%, rgba(15,17,21,0.85) 100%)',
          zIndex: 1
        }} />

        <div style={{
          position: 'relative',
          zIndex: 2,
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 2rem',
          width: '100%'
        }}>
          <div className="animate-fade-in" style={{ maxWidth: '640px' }}>
            <div style={{
              display: 'inline-block',
              padding: '0.35rem 0.875rem',
              background: 'rgba(0, 240, 255, 0.08)',
              border: '1px solid rgba(0, 240, 255, 0.15)',
              borderRadius: 'var(--radius-full)',
              color: 'var(--accent-primary)',
              fontSize: '0.75rem',
              fontWeight: 600,
              marginBottom: '1.5rem',
              letterSpacing: '0.1em',
              textTransform: 'uppercase'
            }}>
              Global Ecosystem Database
            </div>
            
            <h1 style={{
              fontSize: '3.5rem',
              fontWeight: 700,
              marginBottom: '1.25rem',
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              fontFamily: 'Outfit, sans-serif'
            }}>
              Explore Earth's<br />
              <span style={{ color: 'var(--accent-primary)' }}>Biodiversity</span>
            </h1>
            
            <p style={{
              fontSize: '1.1rem',
              color: 'var(--text-secondary)',
              marginBottom: '2.5rem',
              lineHeight: 1.7,
              maxWidth: '500px'
            }}>
              Discover species profiles, track live sightings across protected reserves, and monitor the health of our planet's ecosystems.
            </p>
            
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Link to="/encyclopedia" className="btn btn-primary" style={{ padding: '0.75rem 1.75rem', fontSize: '0.95rem' }}>
                Explore Species
              </Link>
              <Link to="/reserves" className="btn btn-secondary" style={{ padding: '0.75rem 1.75rem', fontSize: '0.95rem' }}>
                View Reserves
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-around',
          flexWrap: 'wrap',
          gap: '2rem',
          padding: '2.5rem 0',
          borderBottom: '1px solid var(--border-color)'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 700, fontFamily: 'Outfit', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
              {stats.species.toLocaleString()}+
            </div>
            <div style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 500 }}>Cataloged Species</div>
          </div>
          <div style={{ width: '1px', background: 'var(--border-color)' }}></div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 700, fontFamily: 'Outfit', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
              {stats.reserves.toLocaleString()}
            </div>
            <div style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 500 }}>Protected Reserves</div>
          </div>
          <div style={{ width: '1px', background: 'var(--border-color)' }}></div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 700, fontFamily: 'Outfit', color: 'var(--accent-primary)', marginBottom: '0.25rem' }}>
              {stats.sightings.toLocaleString()}+
            </div>
            <div style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 500 }}>Recorded Sightings</div>
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '5rem 2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          
          <Link to="/encyclopedia" style={{ textDecoration: 'none' }}>
            <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '2rem' }}>
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🦋</div>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', marginBottom: '0.75rem', fontWeight: 600 }}>Encyclopedia</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', flex: 1, fontSize: '0.9rem', lineHeight: 1.6 }}>
                Comprehensive taxonomy database with conservation statuses, diets, and habitats of species worldwide.
              </p>
              <div style={{ color: 'var(--accent-primary)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                Start exploring <span>→</span>
              </div>
            </div>
          </Link>

          <Link to="/reserves" style={{ textDecoration: 'none' }}>
            <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '2rem' }}>
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🏞️</div>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', marginBottom: '0.75rem', fontWeight: 600 }}>Protected Reserves</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', flex: 1, fontSize: '0.9rem', lineHeight: 1.6 }}>
                National parks and protected regions with geographical info, climate zones, and biodiversity hotspots.
              </p>
              <div style={{ color: 'var(--accent-secondary)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                View reserves <span>→</span>
              </div>
            </div>
          </Link>

          <Link to="/sightings" style={{ textDecoration: 'none' }}>
            <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '2rem' }}>
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔭</div>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', marginBottom: '0.75rem', fontWeight: 600 }}>Global Sightings</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', flex: 1, fontSize: '0.9rem', lineHeight: 1.6 }}>
                Real-time wildlife observations submitted by our global network of researchers and field administrators.
              </p>
              <div style={{ color: 'var(--warning)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                View sightings <span>→</span>
              </div>
            </div>
          </Link>

        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 2rem 5rem'
      }}>
        <div style={{
          padding: '4rem 2rem',
          textAlign: 'center',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)'
        }}>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '0.75rem', fontWeight: 700 }}>Join the Conservation Effort</h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto 2rem', fontSize: '0.9rem', lineHeight: 1.6 }}>
            Stay updated with the latest discoveries, conservation news, and ecosystem database changes.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', maxWidth: '420px', margin: '0 auto' }}>
            <input type="email" className="form-input" placeholder="Enter your email" style={{ flex: 1, background: 'var(--bg-primary)', fontSize: '0.875rem' }} />
            <button className="btn btn-primary" style={{ whiteSpace: 'nowrap', padding: '0.75rem 1.5rem' }}>Subscribe</button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

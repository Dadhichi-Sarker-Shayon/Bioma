import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../../api';

const FeatureIcon = ({ type }) => {
  const icons = {
    encyclopedia: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2980b9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
      </svg>
    ),
    reserves: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#27ae60" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/>
      </svg>
    ),
    sightings: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#e67e22" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
      </svg>
    ),
  };
  return icons[type] || null;
};

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
      } catch { setStats({ species: 0, reserves: 0, sightings: 0 }); }
    };
    fetchStats();
  }, []);

  return (
    <div style={{ background: '#f0f2f5', minHeight: '100vh' }}>
      {/* Hero */}
      <section style={{ background: 'linear-gradient(135deg, #1a3a5c 0%, #2980b9 100%)', color: 'white', padding: '4rem 2rem' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <img src="/logo.svg" alt="Bioma" style={{ width: '100px', marginBottom: '1.5rem' }} />
          <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '1rem', lineHeight: 1.15 }}>
            Explore Earth's<br />Biodiversity
          </h1>
          <p style={{ fontSize: '1rem', opacity: 0.85, maxWidth: '480px', lineHeight: 1.6, marginBottom: '2rem' }}>
            Discover species profiles, track live sightings across protected reserves, and monitor the health of our planet's ecosystems.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link to="/encyclopedia" style={{ textDecoration: 'none', padding: '0.625rem 1.5rem', background: 'white', color: '#1a3a5c', borderRadius: '6px', fontWeight: 600, fontSize: '0.875rem' }}>
              Explore Species
            </Link>
            <Link to="/reserves" style={{ textDecoration: 'none', padding: '0.625rem 1.5rem', border: '1px solid rgba(255,255,255,0.4)', color: 'white', borderRadius: '6px', fontWeight: 500, fontSize: '0.875rem' }}>
              View Reserves
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ maxWidth: '900px', margin: '0 auto', padding: '0 2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-around', background: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginTop: '-1.5rem', padding: '2rem', position: 'relative', zIndex: 1, border: '1px solid #dde1e6' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#1a3a5c' }}>{stats.species.toLocaleString()}+</div>
            <div style={{ color: '#777', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Species</div>
          </div>
          <div style={{ width: '1px', background: '#e0e0e0' }} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#1a3a5c' }}>{stats.reserves.toLocaleString()}</div>
            <div style={{ color: '#777', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Reserves</div>
          </div>
          <div style={{ width: '1px', background: '#e0e0e0' }} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#2980b9' }}>{stats.sightings.toLocaleString()}+</div>
            <div style={{ color: '#777', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Sightings</div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ maxWidth: '900px', margin: '0 auto', padding: '3rem 2rem 4rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
          <Link to="/encyclopedia" style={{ textDecoration: 'none' }}>
            <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '8px', background: '#eaf2f8', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <FeatureIcon type="encyclopedia" />
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1a1a1a', marginBottom: '0.5rem' }}>Encyclopedia</h3>
              <p style={{ color: '#666', fontSize: '0.85rem', lineHeight: 1.6, flex: 1 }}>
                Comprehensive taxonomy database with conservation statuses, diets, and habitats of species worldwide.
              </p>
              <div style={{ color: '#2980b9', fontWeight: 600, fontSize: '0.8rem', marginTop: '1rem' }}>Start exploring &rarr;</div>
            </div>
          </Link>

          <Link to="/reserves" style={{ textDecoration: 'none' }}>
            <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '8px', background: '#e8f5e9', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <FeatureIcon type="reserves" />
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1a1a1a', marginBottom: '0.5rem' }}>Protected Reserves</h3>
              <p style={{ color: '#666', fontSize: '0.85rem', lineHeight: 1.6, flex: 1 }}>
                National parks and protected regions with geographical info, climate zones, and biodiversity hotspots.
              </p>
              <div style={{ color: '#2980b9', fontWeight: 600, fontSize: '0.8rem', marginTop: '1rem' }}>View reserves &rarr;</div>
            </div>
          </Link>

          <Link to="/sightings" style={{ textDecoration: 'none' }}>
            <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '8px', background: '#fef3e2', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <FeatureIcon type="sightings" />
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1a1a1a', marginBottom: '0.5rem' }}>Global Sightings</h3>
              <p style={{ color: '#666', fontSize: '0.85rem', lineHeight: 1.6, flex: 1 }}>
                Real-time wildlife observations submitted by our global network of researchers and field administrators.
              </p>
              <div style={{ color: '#2980b9', fontWeight: 600, fontSize: '0.8rem', marginTop: '1rem' }}>View sightings &rarr;</div>
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;

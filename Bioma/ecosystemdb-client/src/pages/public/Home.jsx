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
    <div style={{ background: '#f0f2f5', minHeight: '100vh' }}>
      {/* Hero */}
      <section style={{
        background: 'linear-gradient(135deg, #1a3a5c 0%, #2980b9 100%)',
        color: 'white',
        padding: '4rem 2rem',
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{
            fontSize: '0.7rem',
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            opacity: 0.7,
            marginBottom: '1rem',
          }}>
            Global Ecosystem Database
          </div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '1rem', lineHeight: 1.15 }}>
            Explore Earth's<br />Biodiversity
          </h1>
          <p style={{ fontSize: '1rem', opacity: 0.85, maxWidth: '480px', lineHeight: 1.6, marginBottom: '2rem' }}>
            Discover species profiles, track live sightings across protected reserves, and monitor the health of our planet's ecosystems.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link to="/encyclopedia" style={{
              textDecoration: 'none',
              padding: '0.625rem 1.5rem',
              background: 'white',
              color: '#1a3a5c',
              borderRadius: '6px',
              fontWeight: 600,
              fontSize: '0.875rem',
            }}>
              Explore Species
            </Link>
            <Link to="/reserves" style={{
              textDecoration: 'none',
              padding: '0.625rem 1.5rem',
              border: '1px solid rgba(255,255,255,0.4)',
              color: 'white',
              borderRadius: '6px',
              fontWeight: 500,
              fontSize: '0.875rem',
            }}>
              View Reserves
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ maxWidth: '900px', margin: '0 auto', padding: '0 2rem' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-around',
          background: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          marginTop: '-1.5rem',
          padding: '2rem',
          position: 'relative',
          zIndex: 1,
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#1a3a5c' }}>
              {stats.species.toLocaleString()}+
            </div>
            <div style={{ color: '#777', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
              Cataloged Species
            </div>
          </div>
          <div style={{ width: '1px', background: '#e0e0e0' }} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#1a3a5c' }}>
              {stats.reserves.toLocaleString()}
            </div>
            <div style={{ color: '#777', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
              Protected Reserves
            </div>
          </div>
          <div style={{ width: '1px', background: '#e0e0e0' }} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#2980b9' }}>
              {stats.sightings.toLocaleString()}+
            </div>
            <div style={{ color: '#777', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
              Recorded Sightings
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ maxWidth: '900px', margin: '0 auto', padding: '3rem 2rem 4rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
          <Link to="/encyclopedia" style={{ textDecoration: 'none' }}>
            <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1a1a1a', marginBottom: '0.5rem' }}>Encyclopedia</h3>
              <p style={{ color: '#666', fontSize: '0.85rem', lineHeight: 1.6, flex: 1 }}>
                Comprehensive taxonomy database with conservation statuses, diets, and habitats of species worldwide.
              </p>
              <div style={{ color: '#2980b9', fontWeight: 600, fontSize: '0.8rem', marginTop: '1rem' }}>
                Start exploring →
              </div>
            </div>
          </Link>

          <Link to="/reserves" style={{ textDecoration: 'none' }}>
            <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1a1a1a', marginBottom: '0.5rem' }}>Protected Reserves</h3>
              <p style={{ color: '#666', fontSize: '0.85rem', lineHeight: 1.6, flex: 1 }}>
                National parks and protected regions with geographical info, climate zones, and biodiversity hotspots.
              </p>
              <div style={{ color: '#2980b9', fontWeight: 600, fontSize: '0.8rem', marginTop: '1rem' }}>
                View reserves →
              </div>
            </div>
          </Link>

          <Link to="/sightings" style={{ textDecoration: 'none' }}>
            <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1a1a1a', marginBottom: '0.5rem' }}>Global Sightings</h3>
              <p style={{ color: '#666', fontSize: '0.85rem', lineHeight: 1.6, flex: 1 }}>
                Real-time wildlife observations submitted by our global network of researchers and field administrators.
              </p>
              <div style={{ color: '#2980b9', fontWeight: 600, fontSize: '0.8rem', marginTop: '1rem' }}>
                View sightings →
              </div>
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;

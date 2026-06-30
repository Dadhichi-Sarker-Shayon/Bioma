import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

const Home = () => {
  const [stats, setStats] = useState({ species: 0, reserves: 0, sightings: 0 });

  useEffect(() => {
    // In a real app we might fetch global stats here.
    // For now we'll just simulate loading them.
    setStats({
      species: 12450,
      reserves: 340,
      sightings: 154200
    });
  }, []);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
      {/* Hero Section */}
      <section style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        textAlign: 'center',
        padding: '6rem 0',
        position: 'relative'
      }}>
        <div className="animate-fade-in" style={{ maxWidth: '800px' }}>
          <div style={{ 
            display: 'inline-block',
            padding: '0.5rem 1rem', 
            background: 'rgba(0, 240, 255, 0.1)', 
            border: '1px solid rgba(0, 240, 255, 0.2)',
            borderRadius: '2rem',
            color: 'var(--accent-primary)',
            fontSize: '0.875rem',
            fontWeight: 600,
            marginBottom: '1.5rem',
            letterSpacing: '0.05em'
          }}>
            WELCOME TO BIOMA
          </div>
          
          <h1 style={{ 
            fontSize: '4rem', 
            fontWeight: 800, 
            marginBottom: '1.5rem',
            lineHeight: 1.1,
            letterSpacing: '-0.02em'
          }}>
            Explore the <span className="text-gradient">Global Ecosystem</span> Database
          </h1>
          
          <p style={{ 
            fontSize: '1.25rem', 
            color: 'var(--text-secondary)',
            marginBottom: '3rem',
            lineHeight: 1.6
          }}>
            Discover detailed profiles of thousands of species, track live sightings across protected reserves, and help monitor the health of our planet's biodiversity.
          </p>
          
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link to="/encyclopedia" className="btn btn-primary" style={{ padding: '0.75rem 2rem', fontSize: '1.1rem' }}>
              Explore Species
            </Link>
            <Link to="/reserves" className="btn btn-secondary" style={{ padding: '0.75rem 2rem', fontSize: '1.1rem' }}>
              View Reserves
            </Link>
          </div>
        </div>
      </section>

      {/* Global Stats */}
      <section style={{ marginBottom: '6rem' }}>
        <div className="glass-panel" style={{ padding: '3rem', display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '2rem' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', fontWeight: 700, fontFamily: 'Outfit', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              {stats.species.toLocaleString()}+
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Cataloged Species</div>
          </div>
          <div style={{ width: '1px', background: 'var(--border-color)' }}></div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', fontWeight: 700, fontFamily: 'Outfit', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              {stats.reserves.toLocaleString()}
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Protected Reserves</div>
          </div>
          <div style={{ width: '1px', background: 'var(--border-color)' }}></div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', fontWeight: 700, fontFamily: 'Outfit', color: 'var(--accent-primary)', marginBottom: '0.5rem' }}>
              {stats.sightings.toLocaleString()}+
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Recorded Sightings</div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section style={{ marginBottom: '6rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          
          <Link to="/encyclopedia" style={{ textDecoration: 'none' }}>
            <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
              <div style={{ 
                position: 'absolute', top: 0, right: 0, width: '150px', height: '150px', 
                background: 'radial-gradient(circle, rgba(16, 185, 129, 0.1), transparent 70%)', borderRadius: '50%', transform: 'translate(30%, -30%)'
              }} />
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🦋</div>
              <h3 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', marginBottom: '1rem' }}>Encyclopedia</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', flex: 1 }}>
                Dive deep into our comprehensive taxonomy database. Learn about conservation statuses, diets, and habitats of species worldwide.
              </p>
              <div style={{ color: 'var(--accent-primary)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                Start exploring <span>→</span>
              </div>
            </div>
          </Link>

          <Link to="/reserves" style={{ textDecoration: 'none' }}>
            <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
              <div style={{ 
                position: 'absolute', top: 0, right: 0, width: '150px', height: '150px', 
                background: 'radial-gradient(circle, rgba(0, 112, 243, 0.1), transparent 70%)', borderRadius: '50%', transform: 'translate(30%, -30%)'
              }} />
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🏞️</div>
              <h3 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', marginBottom: '1rem' }}>Protected Reserves</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', flex: 1 }}>
                Discover national parks and protected regions. View their geographical info, climate zones, and biodiversity hotspots.
              </p>
              <div style={{ color: 'var(--accent-secondary)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                View reserves <span>→</span>
              </div>
            </div>
          </Link>

          <Link to="/sightings" style={{ textDecoration: 'none' }}>
            <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
              <div style={{ 
                position: 'absolute', top: 0, right: 0, width: '150px', height: '150px', 
                background: 'radial-gradient(circle, rgba(245, 158, 11, 0.1), transparent 70%)', borderRadius: '50%', transform: 'translate(30%, -30%)'
              }} />
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🔭</div>
              <h3 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', marginBottom: '1rem' }}>Global Sightings</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', flex: 1 }}>
                Track real-time wildlife observations submitted by our global network of researchers and administrators in the field.
              </p>
              <div style={{ color: 'var(--warning)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                View sightings <span>→</span>
              </div>
            </div>
          </Link>

        </div>
      </section>

      {/* Newsletter / CTA */}
      <section className="glass-panel" style={{ padding: '4rem 2rem', textAlign: 'center', borderRadius: 'var(--radius-lg)', background: 'linear-gradient(rgba(26, 29, 36, 0.8), rgba(15, 17, 21, 0.9))' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Join the Conservation Effort</h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto 2rem' }}>
          Stay updated with the latest discoveries, conservation news, and changes to the ecosystem database.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', maxWidth: '500px', margin: '0 auto' }}>
          <input type="email" className="form-input" placeholder="Enter your email address" style={{ flex: 1, background: 'rgba(255,255,255,0.05)' }} />
          <button className="btn btn-primary" style={{ whiteSpace: 'nowrap' }}>Subscribe</button>
        </div>
      </section>
    </div>
  );
};

export default Home;

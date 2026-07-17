import { useState, useEffect, useRef } from 'react'

// ═══════════════════════════════════════════════════════════
// ANIMATED COUNTER — counts up from 0 to target value
// ═══════════════════════════════════════════════════════════
function AnimatedCounter({ target, duration = 2000, suffix = '', prefix = '' }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const hasAnimated = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true
          const start = performance.now()
          const step = (timestamp) => {
            const progress = Math.min((timestamp - start) / duration, 1)
            const eased = 1 - Math.pow(1 - progress, 3) // easeOutCubic
            setCount(Math.floor(eased * target))
            if (progress < 1) requestAnimationFrame(step)
          }
          requestAnimationFrame(step)
        }
      },
      { threshold: 0.3 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [target, duration])

  return <span ref={ref}>{prefix}{count.toLocaleString()}{suffix}</span>
}

// ═══════════════════════════════════════════════════════════
// FLOATING PARTICLES — ambient nature particles
// ═══════════════════════════════════════════════════════════
function FloatingParticles() {
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 8,
    duration: 6 + Math.random() * 10,
    size: 2 + Math.random() * 4,
    opacity: 0.15 + Math.random() * 0.35,
  }))

  return (
    <div className="landing-particles" aria-hidden="true">
      {particles.map((p) => (
        <div
          key={p.id}
          className="particle"
          style={{
            left: `${p.left}%`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            opacity: p.opacity,
          }}
        />
      ))}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// FEATURED SPECIES DATA
// ═══════════════════════════════════════════════════════════
const FEATURED_SPECIES = [
  {
    name: 'Bengal Tiger',
    scientific: 'Panthera tigris tigris',
    status: 'EN',
    statusLabel: 'Endangered',
    image: '/images/hero_tiger.png',
    habitat: 'Tropical Forests',
    population: '~4,500',
    description: 'The largest living cat species. An apex predator that primarily hunts ungulates across South and Southeast Asia.',
    tags: ['Apex Predator', 'Nocturnal', 'Solitary'],
  },
  {
    name: 'Snow Leopard',
    scientific: 'Panthera uncia',
    status: 'VU',
    statusLabel: 'Vulnerable',
    image: '/images/featured_snow_leopard.png',
    habitat: 'Alpine & Subalpine',
    population: '~7,000',
    description: 'Known as the "Ghost of the Mountains," this elusive big cat inhabits the high mountain ranges of Central Asia.',
    tags: ['Crepuscular', 'Solitary', 'Mountain Dweller'],
  },
  {
    name: 'Green Sea Turtle',
    scientific: 'Chelonia mydas',
    status: 'EN',
    statusLabel: 'Endangered',
    image: '/images/featured_sea_turtle.png',
    habitat: 'Tropical Oceans',
    population: '~85,000',
    description: 'One of the largest sea turtles and the only herbivore among the species. Critical for maintaining seagrass ecosystems.',
    tags: ['Marine', 'Herbivore', 'Migratory'],
  },
]

// ═══════════════════════════════════════════════════════════
// CONSERVATION STATUS COLOR MAP
// ═══════════════════════════════════════════════════════════
const STATUS_COLORS = {
  LC: { bg: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: 'rgba(16, 185, 129, 0.3)' },
  NT: { bg: 'rgba(14, 165, 233, 0.15)', color: '#38bdf8', border: 'rgba(14, 165, 233, 0.3)' },
  VU: { bg: 'rgba(251, 191, 36, 0.15)', color: '#fbbf24', border: 'rgba(251, 191, 36, 0.3)' },
  EN: { bg: 'rgba(251, 146, 60, 0.15)', color: '#fb923c', border: 'rgba(251, 146, 60, 0.3)' },
  CR: { bg: 'rgba(244, 63, 94, 0.15)', color: '#fb7185', border: 'rgba(244, 63, 94, 0.3)' },
  EW: { bg: 'rgba(167, 139, 250, 0.15)', color: '#a78bfa', border: 'rgba(167, 139, 250, 0.3)' },
  EX: { bg: 'rgba(107, 114, 128, 0.15)', color: '#9ca3af', border: 'rgba(107, 114, 128, 0.3)' },
}

// ═══════════════════════════════════════════════════════════
// FEATURE CARDS DATA
// ═══════════════════════════════════════════════════════════
const FEATURES = [
  {
    icon: '📖',
    title: 'Species Encyclopedia',
    description: 'Browse detailed profiles of hundreds of species with physiological data, habitat behaviors, and photo galleries.',
  },
  {
    icon: '🌳',
    title: 'Tree of Life Explorer',
    description: 'Navigate the recursive taxonomic hierarchy from Kingdom to Species with an interactive expandable tree.',
  },
  {
    icon: '🗺️',
    title: 'Distribution Maps',
    description: 'Explore species distribution across biomes and geographical regions with population trends and survey data.',
  },
  {
    icon: '📊',
    title: 'Conservation Dashboard',
    description: 'View extinction risk leaderboards, reserve health analytics, and ecosystem stability metrics in real-time.',
  },
  {
    icon: '🔍',
    title: 'Tag-Based Search',
    description: 'Find species using multi-tag AND-logic: combine traits like "Nocturnal" + "Apex Predator" + "Endangered".',
  },
  {
    icon: '🔬',
    title: 'Food Web Network',
    description: 'Visualize ecological interactions — predation, mutualism, competition, parasitism — with impact scale analysis.',
  },
]

// ═══════════════════════════════════════════════════════════
// LANDING PAGE COMPONENT
// ═══════════════════════════════════════════════════════════
export default function LandingPage({ onEnterAdmin, onExplore, onSelectView }) {
  const [activeSpecies, setActiveSpecies] = useState(0)
  const [isScrolled, setIsScrolled] = useState(false)

  // Auto-rotate featured species
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSpecies((prev) => (prev + 1) % FEATURED_SPECIES.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  // Scroll-aware navbar
  useEffect(() => {
    const container = document.querySelector('.landing-page')
    if (!container) return
    const onScroll = () => setIsScrolled(container.scrollTop > 60)
    container.addEventListener('scroll', onScroll)
    return () => container.removeEventListener('scroll', onScroll)
  }, [])

  const currentSpecies = FEATURED_SPECIES[activeSpecies]
  const statusStyle = STATUS_COLORS[currentSpecies.status] || STATUS_COLORS.LC

  return (
    <div className="landing-page" id="landing-page">
      {/* ─── NEW LESKOPARK STYLE HERO ─── */}
      <section className="lesko-hero">
        <div className="lesko-nav">
          <div className="lesko-brand">
            <img src="/logo-icon.svg" alt="Bioma" style={{ width: '36px', height: '36px' }} />
            <span className="lesko-logo-text">BIOMA</span>
          </div>
          <div className="lesko-nav-right">
            <div className="lesko-links">
              <a href="#species" className="active" onClick={(e) => { e.preventDefault(); onSelectView?.('encyclopedia'); }}>SPECIES</a>
              <a href="#features">TAXONOMY</a>
              <a href="#stats">CONSERVATION</a>
              <a href="#architecture">MAPS</a>
            </div>
            <div className="lesko-actions">
              <span className="lesko-phone">8 (800) 555-00-79<br/><span>Free call</span></span>
              <button className="lesko-admin-btn" onClick={onEnterAdmin}>
                🔐 ADMIN
              </button>
            </div>
          </div>
        </div>

        <div className="lesko-hero-content">
          <h1 className="lesko-title">
            Ecosystem Database<br/>Bioma
          </h1>
          <p className="lesko-subtitle">
            Tracking the health of our planet's biodiversity directly from the source
          </p>
          <button className="lesko-cta" onClick={onExplore}>
            START EXPLORING
          </button>
        </div>

        <div className="lesko-stats-bar">
          <div className="lesko-stat">
            <h2>18 Tables</h2>
            <p>Relational schema with<br/>bridge & lookup tables</p>
          </div>
          <div className="lesko-stat">
            <h2>500+</h2>
            <p>Species tracked across<br/>multiple global biomes</p>
          </div>
          <div className="lesko-stat">
            <h2>12</h2>
            <p>Biome Types from<br/>Tundra to Coral Reef</p>
          </div>
        </div>

        <div className="lesko-scroll-indicator">
          <span className="lesko-scroll-text">SCROLL</span>
          <div className="lesko-scroll-line"></div>
          <div className="lesko-scroll-icon">🖱️</div>
        </div>
      </section>

      {/* ─── FEATURES SECTION ─── */}
      <section className="landing-section features-section" id="features">
        <div className="section-header">
          <span className="section-tag">Platform Features</span>
          <h2 className="section-title">
            Everything You Need to Explore
            <span className="title-accent"> Biodiversity</span>
          </h2>
          <p className="section-subtitle">
            From taxonomic trees to ecological food webs — dive deep into the natural world
            with tools designed for researchers, educators, and conservation enthusiasts.
          </p>
        </div>
        <div className="features-grid">
          {FEATURES.map((feature, i) => (
            <div 
              className="feature-card" 
              key={feature.title} 
              style={{ 
                animationDelay: `${i * 80}ms`,
                cursor: feature.title === 'Species Encyclopedia' ? 'pointer' : 'default'
              }}
              onClick={() => {
                if (feature.title === 'Species Encyclopedia') onSelectView?.('encyclopedia');
              }}
            >
              <div className="feature-card-icon">
                {feature.icon}
              </div>
              <h3 className="feature-card-title">{feature.title}</h3>
              <p className="feature-card-desc">{feature.description}</p>
              <div className="feature-card-shine" />
            </div>
          ))}
        </div>
      </section>

      {/* ─── FEATURED SPECIES SECTION ─── */}
      <section className="landing-section species-section" id="species">
        <div className="section-header">
          <span className="section-tag">Featured Species</span>
          <h2 className="section-title">
            Spotlight on
            <span className="title-accent"> Conservation</span>
          </h2>
          <p className="section-subtitle">
            Highlighting species that need our attention the most. Each profile includes
            physiological data, ecological interactions, and real-time population tracking.
          </p>
        </div>
        <div className="species-cards-grid">
          {FEATURED_SPECIES.map((species) => {
            const sColor = STATUS_COLORS[species.status] || STATUS_COLORS.LC
            return (
              <div className="species-showcase-card" key={species.name}>
                <div className="species-card-image">
                  <img src={species.image} alt={species.name} loading="lazy" />
                  <div className="species-card-image-overlay" />
                  <div className="species-card-status" style={{
                    background: sColor.bg,
                    color: sColor.color,
                    border: `1px solid ${sColor.border}`,
                  }}>
                    {species.status}
                  </div>
                </div>
                <div className="species-card-body">
                  <h3 className="species-card-name">{species.name}</h3>
                  <p className="species-card-scientific">{species.scientific}</p>
                  <p className="species-card-description">{species.description}</p>
                  <div className="species-card-tags">
                    {species.tags.map((tag) => (
                      <span className="species-tag" key={tag}>{tag}</span>
                    ))}
                  </div>
                  <div className="species-card-footer">
                    <span>🌍 {species.habitat}</span>
                    <span>📊 {species.population}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ─── CONSERVATION STATS SECTION ─── */}
      <section className="landing-section stats-section" id="stats">
        <div className="stats-bg-glow" />
        <div className="section-header">
          <span className="section-tag">Conservation Impact</span>
          <h2 className="section-title">
            Tracking the Health of
            <span className="title-accent"> Our Planet</span>
          </h2>
          <p className="section-subtitle">
            Real-time conservation metrics powered by Oracle database analytics,
            PL/SQL stored procedures, and multi-table aggregate views.
          </p>
        </div>
        <div className="stats-grid">
          <div className="stat-card stat-card-emerald">
            <div className="stat-card-icon">🧬</div>
            <div className="stat-card-value"><AnimatedCounter target={7} /></div>
            <div className="stat-card-label">Taxonomic Ranks</div>
            <div className="stat-card-detail">Kingdom → Species</div>
          </div>
          <div className="stat-card stat-card-sky">
            <div className="stat-card-icon">🌍</div>
            <div className="stat-card-value"><AnimatedCounter target={12} /></div>
            <div className="stat-card-label">Biome Types</div>
            <div className="stat-card-detail">From Tundra to Reef</div>
          </div>
          <div className="stat-card stat-card-amber">
            <div className="stat-card-icon">⚠️</div>
            <div className="stat-card-value"><AnimatedCounter target={6} /></div>
            <div className="stat-card-label">Threat Categories</div>
            <div className="stat-card-detail">Deforestation to Poaching</div>
          </div>
          <div className="stat-card stat-card-rose">
            <div className="stat-card-icon">🔗</div>
            <div className="stat-card-value"><AnimatedCounter target={6} /></div>
            <div className="stat-card-label">Interaction Types</div>
            <div className="stat-card-detail">Predation to Mutualism</div>
          </div>
          <div className="stat-card stat-card-violet">
            <div className="stat-card-icon">🏷️</div>
            <div className="stat-card-value"><AnimatedCounter target={50} suffix="+" /></div>
            <div className="stat-card-label">Behavioral Tags</div>
            <div className="stat-card-detail">Nocturnal, Migratory, etc.</div>
          </div>
          <div className="stat-card stat-card-teal">
            <div className="stat-card-icon">📷</div>
            <div className="stat-card-value"><AnimatedCounter target={500} suffix="+" /></div>
            <div className="stat-card-label">Species Photos</div>
            <div className="stat-card-detail">Multi-gallery System</div>
          </div>
        </div>
      </section>

      {/* ─── DATABASE ARCHITECTURE SECTION ─── */}
      <section className="landing-section architecture-section" id="architecture">
        <div className="section-header">
          <span className="section-tag">Under the Hood</span>
          <h2 className="section-title">
            Powered by
            <span className="title-accent"> Oracle Database</span>
          </h2>
          <p className="section-subtitle">
            A robust relational schema with 18 tables, recursive self-joins,
            PL/SQL stored procedures, database triggers, and analytical views.
          </p>
        </div>
        <div className="architecture-cards">
          <div className="arch-card">
            <div className="arch-card-number">18</div>
            <div className="arch-card-label">Database Tables</div>
            <div className="arch-card-desc">Including bridge tables, lookup tables, and recursive hierarchies</div>
          </div>
          <div className="arch-card">
            <div className="arch-card-number">4</div>
            <div className="arch-card-label">PL/SQL Programs</div>
            <div className="arch-card-desc">Stored procedures & functions with DBMS_OUTPUT capture</div>
          </div>
          <div className="arch-card">
            <div className="arch-card-number">3</div>
            <div className="arch-card-label">Database Triggers</div>
            <div className="arch-card-desc">Auto-validation, extinction detection, and cross-kingdom checks</div>
          </div>
          <div className="arch-card">
            <div className="arch-card-number">2</div>
            <div className="arch-card-label">Analytical Views</div>
            <div className="arch-card-desc">Extinction Risk Leaderboard & Reserve Health Analytics</div>
          </div>
        </div>
      </section>

      {/* ─── CTA SECTION ─── */}
      <section className="landing-section cta-section" id="cta">
        <div className="cta-bg-pattern" />
        <div className="cta-content">
          <h2 className="cta-title">Ready to Explore the Living World?</h2>
          <p className="cta-subtitle">
            Dive into our species encyclopedia, navigate the taxonomic tree,
            and discover the ecological relationships that sustain life on Earth.
          </p>
          <div className="cta-actions">
            <button className="btn btn-hero-primary btn-lg" onClick={onExplore} id="cta-explore">
              <span>🌿</span> Start Exploring
            </button>
            <button className="btn btn-hero-secondary btn-lg" onClick={onEnterAdmin} id="cta-admin">
              <span>🔐</span> Enter Admin Panel
            </button>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="landing-footer" id="landing-footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <img src="/logo-icon.svg" alt="Bioma" style={{ width: '40px', height: '40px' }} />
            <div>
              <h3>Bioma</h3>
              <p>Biogeographical Taxonomy & Conservation Ecosystem Database</p>
            </div>
          </div>
          <div className="footer-links">
            <div className="footer-links-column">
              <h4>Public Portal</h4>
              <a href="#species" onClick={(e) => { e.preventDefault(); onSelectView?.('encyclopedia'); }}>Species Encyclopedia</a>
              <a href="#features">Tree of Life</a>
              <a href="#stats">Conservation Stats</a>
              <a href="#features">Distribution Maps</a>
            </div>
            <div className="footer-links-column">
              <h4>Admin Panel</h4>
              <button onClick={onEnterAdmin}>Dashboard</button>
              <button onClick={onEnterAdmin}>Taxonomy Manager</button>
              <button onClick={onEnterAdmin}>Sightings Logger</button>
              <button onClick={onEnterAdmin}>PL/SQL Terminal</button>
            </div>
            <div className="footer-links-column">
              <h4>Technology</h4>
              <span>Oracle XE 21c</span>
              <span>ASP.NET Core</span>
              <span>React + Vite</span>
              <span>PL/SQL</span>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2026 Bioma — Built for DBMS coursework. All conservation data is simulated.</p>
        </div>
      </footer>
    </div>
  )
}

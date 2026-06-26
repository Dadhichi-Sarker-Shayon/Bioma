import { useState, useEffect } from 'react'

const api = async (url, options = {}) => {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || data.message || 'Request failed')
  return data
}

const STATUS_BADGES = {
  LC: { label: 'Least Concern', bg: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: 'rgba(16, 185, 129, 0.3)' },
  NT: { label: 'Near Threatened', bg: 'rgba(14, 165, 233, 0.15)', color: '#38bdf8', border: 'rgba(14, 165, 233, 0.3)' },
  VU: { label: 'Vulnerable', bg: 'rgba(251, 191, 36, 0.15)', color: '#fbbf24', border: 'rgba(251, 191, 36, 0.3)' },
  EN: { label: 'Endangered', bg: 'rgba(251, 146, 60, 0.15)', color: '#fb923c', border: 'rgba(251, 146, 60, 0.3)' },
  CR: { label: 'Critically Endangered', bg: 'rgba(244, 63, 94, 0.15)', color: '#fb7185', border: 'rgba(244, 63, 94, 0.3)' },
  EW: { label: 'Extinct in the Wild', bg: 'rgba(167, 139, 250, 0.15)', color: '#a78bfa', border: 'rgba(167, 139, 250, 0.3)' },
  EX: { label: 'Extinct', bg: 'rgba(107, 114, 128, 0.15)', color: '#9ca3af', border: 'rgba(107, 114, 128, 0.3)' }
}

const DIET_ICONS = {
  Carnivore: '🥩',
  Herbivore: '🌿',
  Omnivore: '🍽️',
  Detritivore: '🍂',
  Autotroph: '☀️',
}

const getTrendInfo = (trend) => {
  switch (trend) {
    case 'Increasing': return { icon: '▲', color: '#34d399', label: 'Increasing' }
    case 'Decreasing': return { icon: '▼', color: '#fb7185', label: 'Decreasing' }
    case 'Stable': return { icon: '●', color: '#fbbf24', label: 'Stable' }
    default: return { icon: '?', color: '#9ca3af', label: 'Unknown' }
  }
}

export default function SpeciesProfilePage({ organismId, onBack, onEnterAdmin }) {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activePhotoIdx, setActivePhotoIdx] = useState(0)
  const [activeTab, setActiveTab] = useState('about')

  useEffect(() => {
    window.scrollTo(0, 0)
    const loadProfile = async () => {
      setLoading(true)
      try {
        const data = await api(`/api/encyclopedia/${organismId}`)
        setProfile(data)
        setError(null)
      } catch (err) {
        setError(err.message || 'Failed to load species profile details.')
      } finally {
        setLoading(false)
      }
    }
    loadProfile()
  }, [organismId])

  // ─── LOADING STATE ───
  if (loading) {
    return (
      <div className="species-profile-page">
        <header className="lesko-nav public-nav">
          <div className="lesko-brand" style={{ cursor: 'pointer' }} onClick={onBack}>
            <span className="lesko-logo-icon">🌿</span>
            <span className="lesko-logo-text">BIOMA</span>
          </div>
          <div className="lesko-nav-right">
            <div className="lesko-links">
              <button className="nav-back-btn" onClick={onBack}>← Back to Encyclopedia</button>
            </div>
            <div className="lesko-actions">
              <button className="lesko-admin-btn" onClick={onEnterAdmin}>🔐 ADMIN PORTAL</button>
            </div>
          </div>
        </header>
        <div className="sp-loading-state">
          <div className="sp-loading-spinner" />
          <p>Retrieving biological data from Oracle database...</p>
        </div>
      </div>
    )
  }

  // ─── ERROR STATE ───
  if (error || !profile) {
    return (
      <div className="species-profile-page">
        <header className="lesko-nav public-nav">
          <div className="lesko-brand" style={{ cursor: 'pointer' }} onClick={onBack}>
            <span className="lesko-logo-icon">🌿</span>
            <span className="lesko-logo-text">BIOMA</span>
          </div>
          <div className="lesko-nav-right">
            <div className="lesko-links">
              <button className="nav-back-btn" onClick={onBack}>← Back to Encyclopedia</button>
            </div>
          </div>
        </header>
        <div className="sp-error-state">
          <span className="sp-error-icon">⚠️</span>
          <h2>Species Not Found</h2>
          <p>{error || 'The requested species profile could not be loaded from the database.'}</p>
          <button className="btn btn-primary" onClick={onBack}>Return to Encyclopedia</button>
        </div>
      </div>
    )
  }

  const statusBadge = STATUS_BADGES[profile.statusCode] || {
    label: 'Unknown Status', bg: 'rgba(255,255,255,0.1)', color: '#fff', border: 'transparent'
  }

  // Combine representative image with photos table
  const allPhotos = [
    ...(profile.imageUrl ? [{ photoUrl: profile.imageUrl, caption: 'Representative Portrait', isPrimary: 'Y' }] : []),
    ...profile.photos.filter(p => p.photoUrl !== profile.imageUrl)
  ]

  const heroImg = allPhotos[0]?.photoUrl || 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=1200'

  // Tab content sections
  const tabs = [
    { id: 'about', label: 'Overview', icon: '📋' },
    { id: 'biology', label: 'Biology', icon: '🧬' },
    { id: 'distribution', label: 'Distribution', icon: '🗺️' },
    { id: 'ecology', label: 'Ecology', icon: '🔗' },
  ]

  return (
    <div className="species-profile-page" id="species-profile-page">
      {/* ═══ NAVIGATION ═══ */}
      <header className="lesko-nav public-nav sp-nav">
        <div className="lesko-brand" style={{ cursor: 'pointer' }} onClick={onBack}>
          <span className="lesko-logo-icon">🌿</span>
          <span className="lesko-logo-text">BIOMA</span>
        </div>
        <div className="lesko-nav-right">
          <div className="lesko-links">
            <button className="nav-back-btn" onClick={onBack}>← Encyclopedia</button>
          </div>
          <div className="lesko-actions">
            <button className="lesko-admin-btn" onClick={onEnterAdmin}>🔐 ADMIN PORTAL</button>
          </div>
        </div>
      </header>

      {/* ═══ HERO BANNER ═══ */}
      <section className="sp-hero" style={{
        backgroundImage: `url(${heroImg})`
      }}>
        <div className="sp-hero-overlay" />
        <div className="sp-hero-content">
          {/* Taxonomic Breadcrumbs */}
          {profile.lineage && profile.lineage.length > 0 && (
            <div className="sp-lineage">
              {profile.lineage.map((node, index) => (
                <span key={node.organismId} className="sp-lineage-node">
                  {index > 0 && <span className="sp-lineage-sep">›</span>}
                  <span className="sp-lineage-rank">{node.rankName}</span>
                  <span className="sp-lineage-name">{node.commonName || node.scientificName}</span>
                </span>
              ))}
            </div>
          )}

          <div className="sp-hero-title-row">
            <h1 className="sp-hero-name">{profile.commonName || profile.scientificName}</h1>
            <span className="sp-status-badge" style={{
              background: statusBadge.bg,
              color: statusBadge.color,
              border: `1px solid ${statusBadge.border}`
            }}>
              {profile.statusCode} — {statusBadge.label}
            </span>
          </div>
          <p className="sp-hero-scientific"><i>{profile.scientificName}</i></p>
          {profile.discoveryYear && (
            <p className="sp-hero-year">Classified {profile.discoveryYear}</p>
          )}
        </div>
      </section>

      {/* ═══ QUICK METRICS STRIP ═══ */}
      <section className="sp-metrics-strip">
        <div className="sp-metric">
          <span className="sp-metric-icon">🦁</span>
          <div className="sp-metric-content">
            <span className="sp-metric-label">Kingdom</span>
            <span className="sp-metric-value">{profile.kingdomType || '—'}</span>
          </div>
        </div>
        <div className="sp-metric-divider" />
        <div className="sp-metric">
          <span className="sp-metric-icon">⏳</span>
          <div className="sp-metric-content">
            <span className="sp-metric-label">Avg. Lifespan</span>
            <span className="sp-metric-value">{profile.avgLifespanYears ? `${profile.avgLifespanYears} yrs` : '—'}</span>
          </div>
        </div>
        <div className="sp-metric-divider" />
        <div className="sp-metric">
          <span className="sp-metric-icon">⚖️</span>
          <div className="sp-metric-content">
            <span className="sp-metric-label">Avg. Weight</span>
            <span className="sp-metric-value">{profile.avgWeightKg ? `${profile.avgWeightKg} kg` : '—'}</span>
          </div>
        </div>
        <div className="sp-metric-divider" />
        <div className="sp-metric">
          <span className="sp-metric-icon">📏</span>
          <div className="sp-metric-content">
            <span className="sp-metric-label">Height / Length</span>
            <span className="sp-metric-value">
              {profile.avgHeightCm ? `${profile.avgHeightCm}cm` : '—'} / {profile.avgLengthCm ? `${profile.avgLengthCm}cm` : '—'}
            </span>
          </div>
        </div>
        <div className="sp-metric-divider" />
        <div className="sp-metric">
          <span className="sp-metric-icon">🧬</span>
          <div className="sp-metric-content">
            <span className="sp-metric-label">{profile.kingdomType === 'Plant' ? 'Photosynthetic Rate' : 'Metabolic Index'}</span>
            <span className="sp-metric-value">{profile.metabolicRateIndex || profile.photosyntheticRate || '—'}</span>
          </div>
        </div>
        <div className="sp-metric-divider" />
        <div className="sp-metric">
          <span className="sp-metric-icon">{DIET_ICONS[profile.dietType] || '🍽️'}</span>
          <div className="sp-metric-content">
            <span className="sp-metric-label">Diet Type</span>
            <span className="sp-metric-value">{profile.dietType || '—'}</span>
          </div>
        </div>
      </section>

      {/* ═══ TAB NAVIGATION ═══ */}
      <nav className="sp-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`sp-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="sp-tab-icon">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </nav>

      {/* ═══ MAIN CONTENT ═══ */}
      <main className="sp-content">
        <div className="sp-content-inner">

          {/* ─── TAB: OVERVIEW ─── */}
          {activeTab === 'about' && (
            <div className="sp-two-col">
              <div className="sp-col-primary">
                {/* Description */}
                <div className="sp-section-card">
                  <div className="sp-section-header">
                    <span className="sp-section-icon">📖</span>
                    <h2>About the Species</h2>
                  </div>
                  <p className="sp-narrative">
                    {profile.description || 'No descriptive logs found in the database.'}
                  </p>
                </div>

                {/* Physical Characteristics */}
                {profile.physicalDescription && (
                  <div className="sp-section-card">
                    <div className="sp-section-header">
                      <span className="sp-section-icon">🔬</span>
                      <h2>Physical Characteristics</h2>
                    </div>
                    <p className="sp-narrative">{profile.physicalDescription}</p>
                  </div>
                )}

                {/* Habitat & Behavior */}
                {profile.habitatBehavior && (
                  <div className="sp-section-card">
                    <div className="sp-section-header">
                      <span className="sp-section-icon">🏔️</span>
                      <h2>Habitat & Behavior</h2>
                    </div>
                    <p className="sp-narrative">{profile.habitatBehavior}</p>
                  </div>
                )}

                {/* Fun Fact */}
                {profile.funFact && (
                  <div className="sp-fun-fact">
                    <div className="sp-fun-fact-glow" />
                    <span className="sp-fun-fact-icon">💡</span>
                    <div className="sp-fun-fact-body">
                      <h4>Did You Know?</h4>
                      <p>{profile.funFact}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="sp-col-secondary">
                {/* Photo Gallery */}
                <div className="sp-section-card sp-gallery-card">
                  <div className="sp-section-header">
                    <span className="sp-section-icon">📸</span>
                    <h2>Photo Gallery</h2>
                  </div>
                  {allPhotos.length > 0 ? (
                    <>
                      <div className="sp-gallery-main">
                        <img
                          src={allPhotos[activePhotoIdx]?.photoUrl}
                          alt={allPhotos[activePhotoIdx]?.caption || 'Species photo'}
                          className="sp-gallery-image"
                        />
                        {allPhotos[activePhotoIdx]?.caption && (
                          <div className="sp-gallery-caption">
                            {allPhotos[activePhotoIdx].caption}
                          </div>
                        )}
                        {allPhotos.length > 1 && (
                          <>
                            <button
                              className="sp-gallery-arrow sp-gallery-prev"
                              onClick={() => setActivePhotoIdx((prev) => (prev - 1 + allPhotos.length) % allPhotos.length)}
                            >‹</button>
                            <button
                              className="sp-gallery-arrow sp-gallery-next"
                              onClick={() => setActivePhotoIdx((prev) => (prev + 1) % allPhotos.length)}
                            >›</button>
                          </>
                        )}
                      </div>
                      {allPhotos.length > 1 && (
                        <div className="sp-gallery-thumbs">
                          {allPhotos.map((photo, idx) => (
                            <button
                              key={idx}
                              className={`sp-gallery-thumb ${idx === activePhotoIdx ? 'active' : ''}`}
                              onClick={() => setActivePhotoIdx(idx)}
                            >
                              <img src={photo.photoUrl} alt={photo.caption || `Photo ${idx + 1}`} />
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="sp-empty-section">No photographs available.</div>
                  )}
                </div>

                {/* Diet Details */}
                {profile.dietDetails && (
                  <div className="sp-section-card">
                    <div className="sp-section-header">
                      <span className="sp-section-icon">{DIET_ICONS[profile.dietType] || '🍽️'}</span>
                      <h2>Diet & Feeding</h2>
                    </div>
                    <p className="sp-narrative">{profile.dietDetails}</p>
                  </div>
                )}

                {/* Reproduction */}
                {profile.reproductionInfo && (
                  <div className="sp-section-card">
                    <div className="sp-section-header">
                      <span className="sp-section-icon">🥚</span>
                      <h2>Reproduction & Mating</h2>
                    </div>
                    <p className="sp-narrative">{profile.reproductionInfo}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ─── TAB: BIOLOGY ─── */}
          {activeTab === 'biology' && (
            <div className="sp-single-col">
              {/* Full Measurements Table */}
              <div className="sp-section-card">
                <div className="sp-section-header">
                  <span className="sp-section-icon">📊</span>
                  <h2>Physiological Measurements</h2>
                </div>
                <div className="sp-data-grid">
                  <div className="sp-data-item">
                    <span className="sp-data-label">Kingdom</span>
                    <span className="sp-data-value">{profile.kingdomType || '—'}</span>
                  </div>
                  <div className="sp-data-item">
                    <span className="sp-data-label">Conservation Status</span>
                    <span className="sp-data-value" style={{ color: statusBadge.color }}>
                      {profile.statusCode} — {statusBadge.label}
                    </span>
                  </div>
                  <div className="sp-data-item">
                    <span className="sp-data-label">Diet Type</span>
                    <span className="sp-data-value">{profile.dietType || '—'}</span>
                  </div>
                  <div className="sp-data-item">
                    <span className="sp-data-label">Avg. Lifespan</span>
                    <span className="sp-data-value">{profile.avgLifespanYears ? `${profile.avgLifespanYears} years` : '—'}</span>
                  </div>
                  <div className="sp-data-item">
                    <span className="sp-data-label">Avg. Weight</span>
                    <span className="sp-data-value">{profile.avgWeightKg ? `${profile.avgWeightKg} kg` : '—'}</span>
                  </div>
                  <div className="sp-data-item">
                    <span className="sp-data-label">Avg. Height</span>
                    <span className="sp-data-value">{profile.avgHeightCm ? `${profile.avgHeightCm} cm` : '—'}</span>
                  </div>
                  <div className="sp-data-item">
                    <span className="sp-data-label">Avg. Length</span>
                    <span className="sp-data-value">{profile.avgLengthCm ? `${profile.avgLengthCm} cm` : '—'}</span>
                  </div>
                  <div className="sp-data-item">
                    <span className="sp-data-label">{profile.kingdomType === 'Plant' ? 'Photosynthetic Rate' : 'Metabolic Rate Index'}</span>
                    <span className="sp-data-value">{profile.metabolicRateIndex || profile.photosyntheticRate || '—'}</span>
                  </div>
                  <div className="sp-data-item">
                    <span className="sp-data-label">Discovery / Classification Year</span>
                    <span className="sp-data-value">{profile.discoveryYear || '—'}</span>
                  </div>
                </div>
              </div>

              {/* Physical Description */}
              {profile.physicalDescription && (
                <div className="sp-section-card">
                  <div className="sp-section-header">
                    <span className="sp-section-icon">🔬</span>
                    <h2>Physical Description</h2>
                  </div>
                  <p className="sp-narrative">{profile.physicalDescription}</p>
                </div>
              )}

              {/* Taxonomic Lineage */}
              {profile.lineage && profile.lineage.length > 0 && (
                <div className="sp-section-card">
                  <div className="sp-section-header">
                    <span className="sp-section-icon">🌳</span>
                    <h2>Taxonomic Lineage</h2>
                  </div>
                  <div className="sp-lineage-tree">
                    {profile.lineage.map((node, idx) => (
                      <div
                        key={node.organismId}
                        className={`sp-lineage-tree-node ${idx === profile.lineage.length - 1 ? 'current' : ''}`}
                        style={{ paddingLeft: `${idx * 28}px` }}
                      >
                        <span className="sp-tree-connector">{idx === 0 ? '◉' : '├─'}</span>
                        <span className="sp-tree-rank">{node.rankName}</span>
                        <span className="sp-tree-name">{node.scientificName}</span>
                        {node.commonName && <span className="sp-tree-common">({node.commonName})</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reproduction & Breeding */}
              {profile.reproductionInfo && (
                <div className="sp-section-card">
                  <div className="sp-section-header">
                    <span className="sp-section-icon">🥚</span>
                    <h2>Reproduction & Breeding</h2>
                  </div>
                  <p className="sp-narrative">{profile.reproductionInfo}</p>
                </div>
              )}
            </div>
          )}

          {/* ─── TAB: DISTRIBUTION ─── */}
          {activeTab === 'distribution' && (
            <div className="sp-single-col">
              {/* Native Range */}
              {profile.nativeRangeDescription && (
                <div className="sp-section-card">
                  <div className="sp-section-header">
                    <span className="sp-section-icon">🌍</span>
                    <h2>Native Range</h2>
                  </div>
                  <p className="sp-narrative">{profile.nativeRangeDescription}</p>
                </div>
              )}

              {/* Distribution Table */}
              <div className="sp-section-card">
                <div className="sp-section-header">
                  <span className="sp-section-icon">📍</span>
                  <h2>Geographical Distribution</h2>
                </div>
                {profile.distributions.length === 0 ? (
                  <div className="sp-empty-section">
                    No distribution records registered for this species.
                  </div>
                ) : (
                  <div className="sp-table-wrapper">
                    <table className="sp-table">
                      <thead>
                        <tr>
                          <th>Region</th>
                          <th>Country</th>
                          <th>Biome</th>
                          <th>Climate Zone</th>
                          <th>Protected</th>
                          <th>Est. Population</th>
                          <th>Trend</th>
                          <th>Last Survey</th>
                        </tr>
                      </thead>
                      <tbody>
                        {profile.distributions.map((d, index) => {
                          const trend = getTrendInfo(d.populationTrend)
                          return (
                            <tr key={index}>
                              <td className="sp-table-primary">{d.regionName}</td>
                              <td>{d.country}</td>
                              <td>{d.biomeName}</td>
                              <td><span className="sp-climate-tag">{d.climateZone}</span></td>
                              <td className="sp-table-center">
                                {d.isProtected === 'Y' ? (
                                  <span className="sp-protected-yes">✓ Protected</span>
                                ) : (
                                  <span className="sp-protected-no">✕ No</span>
                                )}
                              </td>
                              <td className="sp-table-number">
                                {d.estimatedLocalPopulation != null ? d.estimatedLocalPopulation.toLocaleString() : '—'}
                              </td>
                              <td>
                                <span className="sp-trend-badge" style={{ color: trend.color }}>
                                  {trend.icon} {trend.label}
                                </span>
                              </td>
                              <td className="sp-table-muted">{d.lastSurveyDate || '—'}</td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ─── TAB: ECOLOGY ─── */}
          {activeTab === 'ecology' && (
            <div className="sp-single-col">
              {/* Habitat Behavior */}
              {profile.habitatBehavior && (
                <div className="sp-section-card">
                  <div className="sp-section-header">
                    <span className="sp-section-icon">🏔️</span>
                    <h2>Habitat & Behavioral Ecology</h2>
                  </div>
                  <p className="sp-narrative">{profile.habitatBehavior}</p>
                </div>
              )}

              {/* Ecological Interactions */}
              <div className="sp-section-card">
                <div className="sp-section-header">
                  <span className="sp-section-icon">🔗</span>
                  <h2>Ecological Interactions & Food Web</h2>
                </div>
                {profile.interactions.length === 0 ? (
                  <div className="sp-empty-section">
                    No recorded ecological interactions for this species.
                  </div>
                ) : (
                  <div className="sp-interactions-list">
                    {profile.interactions.map((int) => {
                      const isNegative = int.ecologicalImpactScale < 0
                      const isPositive = int.ecologicalImpactScale > 0

                      return (
                        <div className="sp-interaction-card" key={int.interactionId}>
                          <div className="sp-int-header">
                            <span className={`sp-int-type ${int.interactionName.toLowerCase()}`}>
                              {int.interactionName}
                            </span>
                            <span className="sp-int-role">
                              {int.role === 'Actor' ? 'Acts on' : 'Receives from'}
                            </span>
                          </div>
                          <div className="sp-int-species">
                            <span className="sp-int-arrow">{int.role === 'Actor' ? '➜' : '⬅'}</span>
                            <div className="sp-int-species-info">
                              <span className="sp-int-common">{int.otherCommonName || 'Unknown Species'}</span>
                              <span className="sp-int-scientific"><i>{int.otherScientificName}</i></span>
                            </div>
                          </div>

                          {int.interactionNotes && (
                            <p className="sp-int-notes">{int.interactionNotes}</p>
                          )}

                          {/* Impact Scale */}
                          <div className="sp-impact-bar">
                            <span className="sp-impact-label neg">Detrimental (-5)</span>
                            <div className="sp-impact-track">
                              <div className="sp-impact-center-line" />
                              <div
                                className={`sp-impact-fill ${isNegative ? 'negative' : isPositive ? 'positive' : 'neutral'}`}
                                style={{
                                  left: `${((Math.min(0, int.ecologicalImpactScale) + 5) / 10) * 100}%`,
                                  width: `${(Math.abs(int.ecologicalImpactScale) / 10) * 100}%`
                                }}
                              />
                              <div
                                className="sp-impact-thumb"
                                style={{ left: `${((int.ecologicalImpactScale + 5) / 10) * 100}%` }}
                                title={`Impact: ${int.ecologicalImpactScale}`}
                              >
                                {int.ecologicalImpactScale}
                              </div>
                            </div>
                            <span className="sp-impact-label pos">Beneficial (+5)</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </main>

      {/* ═══ PAGE FOOTER ═══ */}
      <footer className="sp-footer">
        <div className="sp-footer-inner">
          <span className="sp-footer-updated">
            Last updated in Oracle DB: {profile.lastUpdated || 'N/A'}
          </span>
          <button className="btn btn-primary" onClick={onBack}>
            ← Back to Encyclopedia
          </button>
        </div>
      </footer>
    </div>
  )
}

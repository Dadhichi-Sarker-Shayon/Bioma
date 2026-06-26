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

const getTrendIcon = (trend) => {
  switch (trend) {
    case 'Increasing': return { icon: '📈 ↑', color: '#34d399' };
    case 'Decreasing': return { icon: '📉 ↓', color: '#fb7185' };
    case 'Stable': return { icon: '➡️ ➔', color: '#fbbf24' };
    default: return { icon: '❓', color: '#9ca3af' };
  }
}

export default function SpeciesProfileView({ organismId, onClose }) {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activePhotoIdx, setActivePhotoIdx] = useState(0)

  useEffect(() => {
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
    };
    loadProfile()
  }, [organismId])

  // Prevent background scrolling when details modal is open
  useEffect(() => {
    document.body.classList.add('modal-open')
    return () => document.body.classList.remove('modal-open')
  }, [])

  if (loading) {
    return (
      <div className="profile-modal-overlay">
        <div className="profile-modal-container glass-card modal-loading">
          <span className="spinner-large" />
          <p>Retrieving biological logs from Oracle database...</p>
        </div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="profile-modal-overlay" onClick={onClose}>
        <div className="profile-modal-container glass-card modal-error" onClick={(e) => e.stopPropagation()}>
          <div className="modal-error-header">
            <h3>Error loading profile</h3>
            <button className="close-btn" onClick={onClose}>×</button>
          </div>
          <p>{error || 'Species not found.'}</p>
        </div>
      </div>
    )
  }

  const statusBadge = STATUS_BADGES[profile.statusCode] || {
    label: 'Unknown Status', bg: 'rgba(255,255,255,0.1)', color: '#fff', border: 'transparent'
  }

  // Combine inline representative photo with photos table
  const allPhotos = [...(profile.imageUrl ? [{ photoUrl: profile.imageUrl, caption: 'Representative Portrait' }] : []), ...profile.photos]

  return (
    <div className="profile-modal-overlay" onClick={onClose}>
      <div className="profile-modal-container" onClick={(e) => e.stopPropagation()}>
        
        {/* ─── MODAL HEADER BANNER ─── */}
        <header className="profile-modal-header" style={{
          backgroundImage: `linear-gradient(to bottom, rgba(10, 15, 13, 0.4), rgba(10, 15, 13, 0.95)), url(${allPhotos[activePhotoIdx]?.photoUrl || 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=800'})`
        }}>
          <button className="modal-close-icon" onClick={onClose} title="Close Profile">×</button>
          
          {/* Breadcrumb Taxonomic Lineage */}
          {profile.lineage && profile.lineage.length > 0 && (
            <div className="lineage-breadcrumbs">
              {profile.lineage.map((node, index) => (
                <span key={node.organismId} className="breadcrumb-node">
                  {index > 0 && <span className="breadcrumb-separator">➔</span>}
                  <span className="rank-name-label">{node.rankName}:</span> {node.commonName || node.scientificName}
                </span>
              ))}
            </div>
          )}

          <div className="header-titles">
            <div className="name-row">
              <h2>{profile.commonName || profile.scientificName}</h2>
              <span className="profile-status-badge" style={{
                background: statusBadge.bg,
                color: statusBadge.color,
                border: `1px solid ${statusBadge.border}`
              }}>
                {profile.statusCode} - {statusBadge.label}
              </span>
            </div>
            <p className="profile-scientific-title">Scientific Name: <i>{profile.scientificName}</i></p>
          </div>
        </header>

        {/* ─── MODAL BODY WORKSPACE ─── */}
        <div className="profile-modal-body">

          {/* Quick Metrics Grid */}
          <section className="metrics-summary-grid">
            <div className="metric-box">
              <span className="metric-icon">🦁</span>
              <div className="metric-info">
                <span className="metric-label">Kingdom</span>
                <span className="metric-val">{profile.kingdomType || 'Unknown'}</span>
              </div>
            </div>
            <div className="metric-box">
              <span className="metric-icon">⏳</span>
              <div className="metric-info">
                <span className="metric-label">Avg. Lifespan</span>
                <span className="metric-val">{profile.avgLifespanYears ? `${profile.avgLifespanYears} years` : 'N/A'}</span>
              </div>
            </div>
            <div className="metric-box">
              <span className="metric-icon">⚖️</span>
              <div className="metric-info">
                <span className="metric-label">Avg. Weight</span>
                <span className="metric-val">{profile.avgWeightKg ? `${profile.avgWeightKg} kg` : 'N/A'}</span>
              </div>
            </div>
            <div className="metric-box">
              <span className="metric-icon">📏</span>
              <div className="metric-info">
                <span className="metric-label">Height / Length</span>
                <span className="metric-val">
                  {profile.avgHeightCm ? `${profile.avgHeightCm} cm` : 'N/A'} / {profile.avgLengthCm ? `${profile.avgLengthCm} cm` : 'N/A'}
                </span>
              </div>
            </div>
            <div className="metric-box">
              <span className="metric-icon">🧬</span>
              <div className="metric-info">
                <span className="metric-label">Metabolic/Photosyn. Index</span>
                <span className="metric-val">
                  {profile.metabolicRateIndex || profile.photosyntheticRate || 'N/A'}
                </span>
              </div>
            </div>
            <div className="metric-box">
              <span className="metric-icon">📅</span>
              <div className="metric-info">
                <span className="metric-label">Classification Year</span>
                <span className="metric-val">{profile.discoveryYear || 'Unknown'}</span>
              </div>
            </div>
          </section>

          {/* Two-Column Details Area */}
          <div className="profile-details-cols">
            
            {/* Left Column: Descriptions */}
            <div className="details-col-left">
              
              <div className="profile-section-card">
                <h3>About the Species</h3>
                <p className="profile-narrative">{profile.description || 'No descriptive logs found in the database.'}</p>
              </div>

              {profile.physicalDescription && (
                <div className="profile-section-card">
                  <h3>Physical Characteristics</h3>
                  <p className="profile-narrative">{profile.physicalDescription}</p>
                </div>
              )}

              {profile.habitatBehavior && (
                <div className="profile-section-card">
                  <h3>Habitat & Behavior</h3>
                  <p className="profile-narrative">{profile.habitatBehavior}</p>
                </div>
              )}

              {profile.reproductionInfo && (
                <div className="profile-section-card">
                  <h3>Reproduction & Mating</h3>
                  <p className="profile-narrative">{profile.reproductionInfo}</p>
                </div>
              )}

              {profile.funFact && (
                <div className="fun-fact-callout">
                  <span className="fact-icon">💡</span>
                  <div className="fact-body">
                    <h4>Did You Know?</h4>
                    <p>{profile.funFact}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Ranges, Photo Gallery & Food Web */}
            <div className="details-col-right">

              {/* Photo Gallery (if multiple exist) */}
              {allPhotos.length > 1 && (
                <div className="profile-section-card gallery-section">
                  <h3>Photo Gallery</h3>
                  <div className="slider-viewport">
                    <img src={allPhotos[activePhotoIdx].photoUrl} alt="Gallery" />
                    {allPhotos[activePhotoIdx].caption && (
                      <div className="slider-caption">{allPhotos[activePhotoIdx].caption}</div>
                    )}
                  </div>
                  <div className="slider-dots">
                    {allPhotos.map((p, idx) => (
                      <button
                        key={idx}
                        className={`slider-dot ${idx === activePhotoIdx ? 'active' : ''}`}
                        onClick={() => setActivePhotoIdx(idx)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Geographical Range Distributions */}
              <div className="profile-section-card">
                <h3>Native Range & Distribution</h3>
                {profile.nativeRangeDescription && (
                  <p className="native-range-desc"><strong>General Range:</strong> {profile.nativeRangeDescription}</p>
                )}
                {profile.distributions.length === 0 ? (
                  <div className="empty-sub-state">No distribution log records registered in this region.</div>
                ) : (
                  <div className="table-responsive-wrapper">
                    <table className="profile-sub-table">
                      <thead>
                        <tr>
                          <th>Region / Country</th>
                          <th>Biome Type</th>
                          <th>Protected</th>
                          <th>Est. Pop.</th>
                          <th>Trend</th>
                        </tr>
                      </thead>
                      <tbody>
                        {profile.distributions.map((d, index) => {
                          const trend = getTrendIcon(d.populationTrend)
                          return (
                            <tr key={index}>
                              <td>
                                <strong>{d.regionName}</strong><br/>
                                <span className="text-muted-row">{d.country}</span>
                              </td>
                              <td>
                                {d.biomeName}<br/>
                                <span className="text-muted-row">{d.climateZone}</span>
                              </td>
                              <td className="center-cell">{d.isProtected === 'Y' ? '✅ Yes' : '❌ No'}</td>
                              <td>{d.estimatedLocalPopulation ? d.estimatedLocalPopulation.toLocaleString() : 'N/A'}</td>
                              <td style={{ color: trend.color, fontWeight: 'bold' }}>{trend.icon}</td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Ecological Interactions Matrix (Food Web) */}
              <div className="profile-section-card">
                <h3>Ecological Interactions & Food Web</h3>
                {profile.interactions.length === 0 ? (
                  <div className="empty-sub-state">No recorded ecological interactions in database for this species.</div>
                ) : (
                  <div className="interactions-list">
                    {profile.interactions.map((int) => {
                      const isNegative = int.ecologicalImpactScale < 0
                      const isPositive = int.ecologicalImpactScale > 0
                      
                      return (
                        <div className="interaction-log-row" key={int.interactionId}>
                          <div className="int-label-bar">
                            <span className={`int-type-tag ${int.interactionName.toLowerCase()}`}>
                              {int.interactionName}
                            </span>
                            <span className="int-other-spec">
                              {int.role === 'Actor' ? '➔' : '🡨'} <i>{int.otherScientificName}</i> ({int.otherCommonName || 'Unnamed'})
                            </span>
                          </div>
                          
                          {int.interactionNotes && <p className="int-notes">{int.interactionNotes}</p>}

                          {/* Impact Scale Bar */}
                          <div className="int-scale-bar-wrapper">
                            <span className="scale-legend">Detrimental (-5)</span>
                            <div className="scale-bar-track">
                              <div
                                className={`scale-bar-fill ${isNegative ? 'negative' : isPositive ? 'positive' : 'neutral'}`}
                                style={{
                                  left: `${((Math.min(0, int.ecologicalImpactScale) + 5) / 10) * 100}%`,
                                  width: `${(Math.abs(int.ecologicalImpactScale) / 10) * 100}%`
                                }}
                              />
                              <div
                                className="scale-bar-thumb"
                                style={{ left: `${((int.ecologicalImpactScale + 5) / 10) * 100}%` }}
                                title={`Impact Scale: ${int.ecologicalImpactScale}`}
                              />
                            </div>
                            <span className="scale-legend">Beneficial (+5)</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

            </div>

          </div>

        </div>

        {/* ─── MODAL FOOTER ─── */}
        <footer className="profile-modal-footer">
          <span className="last-updated-tag">Last updated in Oracle DB: {profile.lastUpdated || 'N/A'}</span>
          <button className="btn btn-primary" onClick={onClose}>Close Profile</button>
        </footer>

      </div>
    </div>
  )
}

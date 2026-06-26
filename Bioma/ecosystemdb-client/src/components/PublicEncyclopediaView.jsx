import { useState, useEffect } from 'react'
import SpeciesProfileView from './SpeciesProfileView'

const api = async (url, options = {}) => {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || data.message || 'Request failed')
  return data
}

// Map Conservation Status Codes to UI Badge colors and label configurations
const STATUS_BADGES = {
  LC: { label: 'Least Concern', bg: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: 'rgba(16, 185, 129, 0.3)' },
  NT: { label: 'Near Threatened', bg: 'rgba(14, 165, 233, 0.15)', color: '#38bdf8', border: 'rgba(14, 165, 233, 0.3)' },
  VU: { label: 'Vulnerable', bg: 'rgba(251, 191, 36, 0.15)', color: '#fbbf24', border: 'rgba(251, 191, 36, 0.3)' },
  EN: { label: 'Endangered', bg: 'rgba(251, 146, 60, 0.15)', color: '#fb923c', border: 'rgba(251, 146, 60, 0.3)' },
  CR: { label: 'Critically Endangered', bg: 'rgba(244, 63, 94, 0.15)', color: '#fb7185', border: 'rgba(244, 63, 94, 0.3)' },
  EW: { label: 'Extinct in the Wild', bg: 'rgba(167, 139, 250, 0.15)', color: '#a78bfa', border: 'rgba(167, 139, 250, 0.3)' },
  EX: { label: 'Extinct', bg: 'rgba(107, 114, 128, 0.15)', color: '#9ca3af', border: 'rgba(107, 114, 128, 0.3)' }
}

export default function PublicEncyclopediaView({ onBack, onEnterAdmin }) {
  const [speciesList, setSpeciesList] = useState([])
  const [filters, setFilters] = useState({ statuses: [], diets: [], tags: [] })
  
  // Search state
  const [search, setSearch] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [selectedDiet, setSelectedDiet] = useState('')
  const [selectedTags, setSelectedTags] = useState([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Active Profile Modal ID
  const [activeSpeciesId, setActiveSpeciesId] = useState(null)

  // Load available filters on mount
  useEffect(() => {
    const loadFilters = async () => {
      try {
        const data = await api('/api/encyclopedia/filters')
        setFilters(data)
      } catch (err) {
        console.error('Failed to load filters:', err)
      }
    };
    loadFilters()
  }, [])

  // Load species with filters
  useEffect(() => {
    const loadSpecies = async () => {
      setLoading(true)
      try {
        const queryParams = new URLSearchParams()
        if (search) queryParams.append('search', search)
        if (selectedStatus) queryParams.append('status', selectedStatus)
        if (selectedDiet) queryParams.append('diet', selectedDiet)
        if (selectedTags.length > 0) queryParams.append('tags', selectedTags.join(','))

        const url = `/api/encyclopedia?${queryParams.toString()}`
        const data = await api(url)
        setSpeciesList(data)
        setError(null)
      } catch (err) {
        setError(err.message || 'Failed to fetch species.')
      } finally {
        setLoading(false)
      }
    };

    const delayDebounce = setTimeout(() => {
      loadSpecies()
    }, 300) // debounce typing searches

    return () => clearTimeout(delayDebounce)
  }, [search, selectedStatus, selectedDiet, selectedTags])

  const toggleTag = (tagName) => {
    setSelectedTags((prev) =>
      prev.includes(tagName)
        ? prev.filter((t) => t !== tagName)
        : [...prev, tagName]
    )
  }

  const clearFilters = () => {
    setSearch('')
    setSelectedStatus('')
    setSelectedDiet('')
    setSelectedTags([])
  }

  return (
    <div className="encyclopedia-page">
      {/* ─── HEADER ─── */}
      <header className="lesko-nav public-nav">
        <div className="lesko-brand" style={{ cursor: 'pointer' }} onClick={onBack}>
          <span className="lesko-logo-icon">🌿</span>
          <span className="lesko-logo-text">BIOMA</span>
        </div>
        <div className="lesko-nav-right">
          <div className="lesko-links">
            <button className="nav-back-btn" onClick={onBack}>← Back to Home</button>
          </div>
          <div className="lesko-actions">
            <button className="lesko-admin-btn" onClick={onEnterAdmin}>
              🔐 ADMIN PORTAL
            </button>
          </div>
        </div>
      </header>

      {/* ─── HERO SPLASH ─── */}
      <section className="encyclopedia-hero">
        <div className="hero-overlay" />
        <div className="hero-text-content">
          <h1>Species Encyclopedia</h1>
          <p>Explore taxonomic measurements, habitat behaviors, geographic ranges, and mutual food web interactions.</p>
        </div>
      </section>

      {/* ─── WORKSPACE CONTENT ─── */}
      <div className="encyclopedia-container">
        {/* ─── SIDEBAR FILTERS ─── */}
        <aside className="filters-sidebar">
          <div className="sidebar-header">
            <h3>Filters</h3>
            <button className="clear-btn" onClick={clearFilters}>Clear All</button>
          </div>

          {/* Search Term */}
          <div className="filter-group">
            <label className="filter-label">Search Name</label>
            <div className="search-input-wrapper">
              <input
                type="text"
                className="filter-search-input"
                placeholder="e.g. Tiger, Orchid..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && <span className="search-clear" onClick={() => setSearch('')}>×</span>}
            </div>
          </div>

          {/* Conservation Status */}
          <div className="filter-group">
            <label className="filter-label">Conservation Status</label>
            <div className="status-options-grid">
              {filters.statuses.map((status) => {
                const badge = STATUS_BADGES[status.statusCode] || {}
                const isSelected = selectedStatus === status.statusCode
                return (
                  <button
                    key={status.statusCode}
                    className={`status-btn ${isSelected ? 'active' : ''}`}
                    onClick={() => setSelectedStatus(isSelected ? '' : status.statusCode)}
                    style={{
                      '--active-bg': badge.bg,
                      '--active-color': badge.color,
                      '--active-border': badge.border,
                    }}
                    title={status.statusName}
                  >
                    {status.statusCode}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Diet Type */}
          <div className="filter-group">
            <label className="filter-label">Diet Type</label>
            <select
              className="filter-select"
              value={selectedDiet}
              onChange={(e) => setSelectedDiet(e.target.value)}
            >
              <option value="">All Diets</option>
              {filters.diets.map((diet) => (
                <option key={diet} value={diet}>{diet}</option>
              ))}
            </select>
          </div>

          {/* Behavioral / Ecological Tags */}
          <div className="filter-group">
            <label className="filter-label">Filter by Traits (AND Logic)</label>
            <div className="tags-checkbox-list">
              {filters.tags.map((tag) => {
                const isSelected = selectedTags.includes(tag.tagName)
                return (
                  <button
                    key={tag.tagName}
                    className={`tag-checkbox-btn ${isSelected ? 'active' : ''}`}
                    onClick={() => toggleTag(tag.tagName)}
                    style={{
                      '--tag-color': tag.tagColor,
                    }}
                  >
                    <span className="checkbox-dot" />
                    <span className="tag-label-text">{tag.tagName}</span>
                    <span className="tag-category-badge">{tag.tagCategory}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </aside>

        {/* ─── GRID CONTENT ─── */}
        <main className="species-grid-area">
          {error && (
            <div className="error-panel">
              <span className="error-icon">⚠️</span>
              <p>Error loading encyclopedia: {error}</p>
            </div>
          )}

          {loading ? (
            <div className="loading-grid">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div className="skeleton-card" key={idx}>
                  <div className="skeleton-image" />
                  <div className="skeleton-title" />
                  <div className="skeleton-text" />
                  <div className="skeleton-badges" />
                </div>
              ))}
            </div>
          ) : speciesList.length === 0 ? (
            <div className="empty-state-view">
              <div className="empty-icon">🍃</div>
              <h2>No Species Found</h2>
              <p>Try resetting filters or adjusting search terms to discover biological profiles.</p>
              <button className="clear-btn-main" onClick={clearFilters}>Reset Filters</button>
            </div>
          ) : (
            <div className="species-cards-grid">
              {speciesList.map((species) => {
                const statusInfo = STATUS_BADGES[species.statusCode] || {
                  label: 'Unknown', bg: 'rgba(255,255,255,0.1)', color: '#fff', border: 'transparent'
                }
                const fallbackImg = 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=400'

                return (
                  <div
                    key={species.organismId}
                    className="species-showcase-card interactive-card"
                    onClick={() => setActiveSpeciesId(species.organismId)}
                  >
                    <div className="species-card-image">
                      <img src={species.imageUrl || fallbackImg} alt={species.commonName || species.scientificName} loading="lazy" />
                      <div className="species-card-image-overlay" />
                      <div
                        className="species-card-status"
                        style={{
                          background: statusInfo.bg,
                          color: statusInfo.color,
                          border: `1px solid ${statusInfo.border}`
                        }}
                      >
                        {species.statusCode || 'N/A'}
                      </div>
                    </div>
                    <div className="species-card-body">
                      <h3 className="species-card-name">
                        {species.commonName || species.scientificName}
                      </h3>
                      <p className="species-card-scientific">{species.scientificName}</p>
                      
                      {species.description && (
                        <p className="species-card-description truncate-text">
                          {species.description}
                        </p>
                      )}

                      {/* Display Diet Badge */}
                      <div className="species-card-metadata">
                        <span className="badge-diet">🍽️ {species.dietType || 'Unknown'}</span>
                        {species.discoveryYear && (
                          <span className="badge-year">📅 classified {species.discoveryYear}</span>
                        )}
                      </div>

                      {/* Tags */}
                      {species.tags && species.tags.length > 0 && (
                        <div className="species-card-tags">
                          {species.tags.map((tag) => (
                            <span
                              className="species-tag"
                              key={tag.tagName}
                              style={{
                                border: `1px solid ${tag.tagColor}40`,
                                color: tag.tagColor,
                                background: `${tag.tagColor}10`
                              }}
                            >
                              {tag.tagName}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </main>
      </div>

      {/* ─── DETAIL DRAWER / MODAL ─── */}
      {activeSpeciesId && (
        <SpeciesProfileView
          organismId={activeSpeciesId}
          onClose={() => setActiveSpeciesId(null)}
        />
      )}
    </div>
  )
}

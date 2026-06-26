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

export default function DashboardView() {
  const [stats, setStats] = useState(null)
  const [leaderboard, setLeaderboard] = useState([])
  const [reserves, setReserves] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, leaderboardData, reservesData] = await Promise.all([
          api('/api/dashboard/stats'),
          api('/api/dashboard/leaderboard'),
          api('/api/dashboard/reserves')
        ])
        setStats(statsData)
        setLeaderboard(leaderboardData)
        setReserves(reservesData)
      } catch (err) {
        console.error("Dashboard fetch error", err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
        <span className="spinner" /> Loading dashboard...
      </div>
    )
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-description">Ecosystem health metrics and conservation analytics overview.</p>
      </div>

      {/* STAT CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div className="glass-card" style={{ padding: '20px', borderTop: '3px solid var(--emerald-400)' }}>
          <div style={{ fontSize: '2rem', marginBottom: '10px' }}>🌳</div>
          <div className="card-title" style={{ fontSize: '1.8rem', marginBottom: '4px' }}>{stats?.totalSpecies || 0}</div>
          <div className="card-subtitle">Total Tracked Species</div>
        </div>
        <div className="glass-card" style={{ padding: '20px', borderTop: '3px solid var(--rose-500)' }}>
          <div style={{ fontSize: '2rem', marginBottom: '10px' }}>⚠️</div>
          <div className="card-title" style={{ fontSize: '1.8rem', marginBottom: '4px', color: 'var(--rose-400)' }}>{stats?.endangeredCount || 0}</div>
          <div className="card-subtitle">Endangered Species</div>
        </div>
        <div className="glass-card" style={{ padding: '20px', borderTop: '3px solid var(--amber-500)' }}>
          <div style={{ fontSize: '2rem', marginBottom: '10px' }}>🚨</div>
          <div className="card-title" style={{ fontSize: '1.8rem', marginBottom: '4px', color: 'var(--amber-400)' }}>{stats?.activeThreats || 0}</div>
          <div className="card-subtitle">Active Threats</div>
        </div>
        <div className="glass-card" style={{ padding: '20px', borderTop: '3px solid var(--sky-500)' }}>
          <div style={{ fontSize: '2rem', marginBottom: '10px' }}>🏕️</div>
          <div className="card-title" style={{ fontSize: '1.8rem', marginBottom: '4px', color: 'var(--sky-400)' }}>{stats?.totalReserves || 0}</div>
          <div className="card-subtitle">Conservation Reserves</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
        {/* LEADERBOARD */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <div className="card-header" style={{ marginBottom: '16px' }}>
            <div>
              <h2 className="card-title">Extinction Risk Leaderboard</h2>
              <div className="card-subtitle">Top species at critical risk</div>
            </div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '10px 5px', fontWeight: 600 }}>Species</th>
                  <th style={{ padding: '10px 5px', fontWeight: 600 }}>Status</th>
                  <th style={{ padding: '10px 5px', fontWeight: 600 }}>Population</th>
                  <th style={{ padding: '10px 5px', fontWeight: 600 }}>Risk Score</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map(item => (
                  <tr key={item.organismId} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '12px 5px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.commonName || item.scientificName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>{item.scientificName}</div>
                    </td>
                    <td style={{ padding: '12px 5px' }}>
                      <span style={{ 
                        padding: '4px 8px', 
                        borderRadius: '12px', 
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        background: (item.statusCode === 'CR' || item.statusCode === 'EN' || item.statusCode === 'EW') ? 'rgba(244, 63, 94, 0.15)' : 'rgba(251, 191, 36, 0.15)',
                        color: (item.statusCode === 'CR' || item.statusCode === 'EN' || item.statusCode === 'EW') ? 'var(--rose-400)' : 'var(--amber-400)'
                      }}>
                        {item.statusCode}
                      </span>
                    </td>
                    <td style={{ padding: '12px 5px', color: 'var(--text-secondary)' }}>{item.globalPopulation.toLocaleString()}</td>
                    <td style={{ padding: '12px 5px', color: 'var(--rose-400)', fontWeight: 700 }}>{item.riskScore}</td>
                  </tr>
                ))}
                {leaderboard.length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ padding: '30px 10px', textAlign: 'center', color: 'var(--text-muted)' }}>
                      No risk data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* RESERVES */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <div className="card-header" style={{ marginBottom: '16px' }}>
            <div>
              <h2 className="card-title">Reserve Health Analytics</h2>
              <div className="card-subtitle">Conservation area metrics</div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {reserves.map(reserve => (
              <div key={reserve.reserveId} style={{ background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.95rem' }}>{reserve.reserveName}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{reserve.regionName}, {reserve.country} • {reserve.totalAreaSqKm.toLocaleString()} km²</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--emerald-400)', fontWeight: 600 }}>${reserve.annualBudgetUsd.toLocaleString()}/yr</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>${reserve.budgetPerSqKm}/km²</div>
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '12px', fontSize: '0.75rem' }}>
                  <div style={{ flex: 1, background: 'rgba(52, 211, 153, 0.08)', border: '1px solid rgba(52, 211, 153, 0.15)', padding: '10px 8px', borderRadius: '8px', textAlign: 'center', color: 'var(--emerald-400)' }}>
                    <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '2px' }}>{reserve.healthyCount}</div>
                    <div style={{ opacity: 0.8, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Healthy</div>
                  </div>
                  <div style={{ flex: 1, background: 'rgba(251, 191, 36, 0.08)', border: '1px solid rgba(251, 191, 36, 0.15)', padding: '10px 8px', borderRadius: '8px', textAlign: 'center', color: 'var(--amber-400)' }}>
                    <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '2px' }}>{reserve.injuredCount + reserve.malnourishedCount}</div>
                    <div style={{ opacity: 0.8, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>At Risk</div>
                  </div>
                  <div style={{ flex: 1, background: 'rgba(56, 189, 248, 0.08)', border: '1px solid rgba(56, 189, 248, 0.15)', padding: '10px 8px', borderRadius: '8px', textAlign: 'center', color: 'var(--sky-400)' }}>
                    <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '2px' }}>{reserve.distinctSpeciesObserved}</div>
                    <div style={{ opacity: 0.8, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Species</div>
                  </div>
                </div>
              </div>
            ))}
            {reserves.length === 0 && (
              <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
                No reserve data available
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

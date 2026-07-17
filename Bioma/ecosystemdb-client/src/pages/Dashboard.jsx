import { useState, useEffect } from 'react';
import { Activity, ShieldAlert, Users, Map, AlertTriangle, Terminal } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import api from '../api';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [reserves, setReserves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // PL/SQL execution states
  const [plSqlOutput, setPlSqlOutput] = useState('');
  const [plSqlRunning, setPlSqlRunning] = useState(false);
  const [regionId, setRegionId] = useState('');
  const [grantAmount, setGrantAmount] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, leadRes, resRes] = await Promise.all([
          api.get('/dashboard/stats'),
          api.get('/dashboard/leaderboard'),
          api.get('/dashboard/reserves')
        ]);
        setStats(statsRes.data);
        setLeaderboard(leadRes.data);
        setReserves(resRes.data);
      } catch (err) {
        setError('Failed to load dashboard data. Check backend connection.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const runCriticalReport = async () => {
    if (!regionId) return alert("Please enter a Region ID");
    setPlSqlRunning(true);
    try {
      const res = await api.post('/plsql/report', { regionId: parseInt(regionId) });
      setPlSqlOutput(res.data.output || 'No output generated.');
    } catch (err) {
      setPlSqlOutput(err.response?.data?.error || 'Error executing procedure.');
    } finally {
      setPlSqlRunning(false);
    }
  };

  const runAllocateGrant = async () => {
    if (!grantAmount) return alert("Please enter a Grant Amount");
    setPlSqlRunning(true);
    try {
      const res = await api.post('/plsql/grant', { amount: parseFloat(grantAmount) });
      setPlSqlOutput(res.data.output || 'No output generated.');
      
      // Refresh reserves data so the budget updates visually!
      const resRes = await api.get('/dashboard/reserves');
      setReserves(resRes.data);
    } catch (err) {
      setPlSqlOutput(err.response?.data?.error || 'Error executing procedure.');
    } finally {
      setPlSqlRunning(false);
    }
  };

  if (loading) return <div className="animate-fade-in" style={{ padding: '2rem' }}>Loading dashboard analytics...</div>;
  if (error) return <div className="badge badge-danger">{error}</div>;

  const extinctionData = leaderboard.map(l => ({
    name: l.commonName || l.scientificName,
    population: l.globalPopulation || 0
  }));

  const healthData = [
    { name: 'Endangered', value: stats.endangeredCount, color: '#e74c3c' },
    { name: 'Stable', value: Math.max(0, stats.totalSpecies - stats.endangeredCount), color: '#27ae60' }
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Dashboard</h2>
          <p className="page-subtitle">Overview of global conservation efforts.</p>
        </div>
      </div>

      <div className="grid-4" style={{ marginBottom: '1.5rem' }}>
        <div className="card">
          <div className="card-title">Tracked Species</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Activity size={24} color="#2980b9" />
            <div className="card-value">{stats.totalSpecies}</div>
          </div>
        </div>
        <div className="card">
          <div className="card-title">Endangered</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <ShieldAlert size={24} color="#e74c3c" />
            <div className="card-value">{stats.endangeredCount}</div>
          </div>
        </div>
        <div className="card">
          <div className="card-title">Active Threats</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <AlertTriangle size={24} color="#f39c12" />
            <div className="card-value">{stats.activeThreats}</div>
          </div>
        </div>
        <div className="card">
          <div className="card-title">Protected Reserves</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Map size={24} color="#27ae60" />
            <div className="card-value">{stats.totalReserves}</div>
          </div>
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
        <div className="card" style={{ height: '380px' }}>
          <h3 style={{ marginBottom: '1rem', fontSize: '1rem', fontWeight: 700 }}>Most Critical Populations</h3>
          <ResponsiveContainer width="100%" height="85%">
            <BarChart data={extinctionData} layout="vertical" margin={{ left: 50, right: 20 }}>
              <XAxis type="number" stroke="#999" />
              <YAxis dataKey="name" type="category" stroke="#999" width={120} tick={{fontSize: 12}} />
              <Tooltip contentStyle={{ background: '#fff', border: '1px solid #ddd', borderRadius: '6px' }} />
              <Bar dataKey="population" fill="#e74c3c" radius={[0, 4, 4, 0]}>
                {extinctionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.population < 1000 ? '#e74c3c' : '#f39c12'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card" style={{ height: '380px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ marginBottom: '0.75rem', fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Terminal size={18} color="#1a3a5c" /> PL/SQL Execution
          </h3>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <input type="number" className="form-input" placeholder="Region ID" value={regionId} onChange={e => setRegionId(e.target.value)} />
            <button className="btn btn-secondary" onClick={runCriticalReport} disabled={plSqlRunning}>Report</button>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <input type="number" className="form-input" placeholder="Grant Amount $" value={grantAmount} onChange={e => setGrantAmount(e.target.value)} />
            <button className="btn btn-primary" onClick={runAllocateGrant} disabled={plSqlRunning}>Allocate</button>
          </div>
          <div style={{ flex: 1, background: '#1a1a1a', borderRadius: '6px', padding: '0.75rem', overflowY: 'auto', fontFamily: 'monospace', fontSize: '0.8rem', color: '#4ade80', whiteSpace: 'pre-wrap' }}>
            {plSqlRunning ? 'Executing...' : (plSqlOutput || 'Oracle DBMS_OUTPUT will appear here...')}
          </div>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '1rem', fontSize: '1rem', fontWeight: 700 }}>Reserve Health</h3>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Reserve</th>
                <th>Region</th>
                <th>Area (SqKm)</th>
                <th>Budget (USD)</th>
                <th>Sightings</th>
                <th>Species</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {reserves.map(r => (
                <tr key={r.reserveId}>
                  <td style={{ fontWeight: 600 }}>{r.reserveName}</td>
                  <td>{r.regionName}</td>
                  <td>{r.totalAreaSqKm?.toLocaleString()}</td>
                  <td>${r.annualBudgetUsd?.toLocaleString()}</td>
                  <td>{r.totalSightings}</td>
                  <td>{r.uniqueSpeciesSpotted}</td>
                  <td>
                    {r.unhealthySightings > 0 ? (
                      <span className="badge badge-warning">{r.unhealthySightings} unhealthy</span>
                    ) : (
                      <span className="badge badge-success">Optimal</span>
                    )}
                  </td>
                </tr>
              ))}
              {reserves.length === 0 && (
                <tr><td colSpan="7" style={{ textAlign: 'center', color: '#999' }}>No reserves found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, ShieldAlert } from 'lucide-react';
import api from '../api';

const Reserves = () => {
  const [reserves, setReserves] = useState([]);
  const [threatLogs, setThreatLogs] = useState([]);
  const [lookups, setLookups] = useState({ regions: [], categories: [], severities: [] });
  const [loading, setLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState('reserves');

  // Reserve Modal States
  const [showReserveModal, setShowReserveModal] = useState(false);
  const [editingReserveId, setEditingReserveId] = useState(null);
  const [reserveForm, setReserveForm] = useState({
    reserveName: '',
    regionId: '',
    totalAreaSqKm: '',
    annualBudgetUsd: '',
    establishedYear: '',
    reserveType: 'National Park'
  });

  // Threat Modal States
  const [showThreatModal, setShowThreatModal] = useState(false);
  const [threatForm, setThreatForm] = useState({
    regionId: '',
    threatName: '',
    threatCategory: 'Human-Caused',
    severityLevel: 'Medium',
    assessmentDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchReserves();
    fetchThreats();
    fetchLookups();
  }, []);

  const fetchReserves = async () => {
    try {
      const res = await api.get('/reserves');
      setReserves(res.data);
    } catch (err) {}
  };

  const fetchThreats = async () => {
    try {
      setLoading(true);
      const res = await api.get('/threats');
      setThreatLogs(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLookups = async () => {
    try {
      const res = await api.get('/threats/lookups');
      setLookups(res.data);
    } catch (err) {}
  };

  // --- Reserve CRUD ---
  const handleReserveEdit = (r) => {
    setEditingReserveId(r.reserveId);
    setReserveForm({
      reserveName: r.reserveName,
      regionId: r.regionId,
      totalAreaSqKm: r.totalAreaSqKm || '',
      annualBudgetUsd: r.annualBudgetUsd || '',
      establishedYear: r.establishedYear || '',
      reserveType: r.reserveType || 'National Park'
    });
    setShowReserveModal(true);
  };

  const handleReserveDelete = async (id) => {
    if(window.confirm('Delete this reserve?')) {
      try {
        await api.delete(`/reserves/${id}`);
        fetchReserves();
      } catch (err) { alert(err.response?.data?.error || 'Failed to delete'); }
    }
  };

  const handleReserveSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...reserveForm,
        regionId: parseInt(reserveForm.regionId),
        totalAreaSqKm: reserveForm.totalAreaSqKm ? parseFloat(reserveForm.totalAreaSqKm) : null,
        annualBudgetUsd: reserveForm.annualBudgetUsd ? parseFloat(reserveForm.annualBudgetUsd) : null,
        establishedYear: reserveForm.establishedYear ? parseInt(reserveForm.establishedYear) : null
      };

      if (editingReserveId) {
        await api.put(`/reserves/${editingReserveId}`, payload);
      } else {
        await api.post('/reserves', payload);
      }
      setShowReserveModal(false);
      fetchReserves();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to save reserve');
    }
  };

  // --- Threats ---
  const handleThreatSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/threats', { ...threatForm, regionId: parseInt(threatForm.regionId) });
      setShowThreatModal(false);
      fetchThreats();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to submit threat log');
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.put(`/threats/${id}/status`, { resolutionStatus: newStatus });
      fetchThreats();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update status');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Reserves & Threats</h2>
          <p className="page-subtitle">Manage reserves and track ecological threats.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className={`btn ${activeTab === 'reserves' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('reserves')}>
            Reserves
          </button>
          <button className={`btn ${activeTab === 'threats' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('threats')}>
            Threat Logs
          </button>
        </div>
      </div>

      {activeTab === 'reserves' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Managed Reserves</h3>
            <button className="btn btn-primary" onClick={() => { setEditingReserveId(null); setReserveForm({ reserveName: '', regionId: '', totalAreaSqKm: '', annualBudgetUsd: '', establishedYear: '', reserveType: 'National Park' }); setShowReserveModal(true); }}>
              <Plus size={18} /> Add Reserve
            </button>
          </div>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Region</th>
                  <th>Type</th>
                  <th>Area (SqKm)</th>
                  <th>Budget (USD)</th>
                  <th>Est. Year</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reserves.map(r => (
                  <tr key={r.reserveId}>
                    <td style={{ fontWeight: 500 }}>{r.reserveName}</td>
                    <td>{r.regionName}</td>
                    <td><span className="badge badge-neutral">{r.reserveType}</span></td>
                    <td>{r.totalAreaSqKm}</td>
                    <td style={{ color: '#27ae60' }}>{r.annualBudgetUsd ? `$${r.annualBudgetUsd}` : '-'}</td>
                    <td>{r.establishedYear}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <button className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem' }} onClick={() => handleReserveEdit(r)}><Edit2 size={14} /></button>
                        <button className="btn btn-danger" style={{ padding: '0.25rem 0.5rem' }} onClick={() => handleReserveDelete(r.reserveId)}><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'threats' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Active Threats</h3>
            <button className="btn btn-danger" onClick={() => setShowThreatModal(true)}>
              <ShieldAlert size={18} /> Report Threat
            </button>
          </div>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Region</th>
                  <th>Threat Name</th>
                  <th>Severity</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Update Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? <tr><td colSpan="6">Loading...</td></tr> : threatLogs.map(log => (
                  <tr key={log.logId}>
                    <td style={{ fontWeight: 500 }}>{log.regionName}</td>
                    <td>{log.threatName}</td>
                    <td>
                      {log.severityLevel === 'Critical' ? <span className="badge badge-danger">Critical</span> :
                       log.severityLevel === 'High' ? <span className="badge badge-danger">High</span> :
                       log.severityLevel === 'Medium' ? <span className="badge badge-warning">Medium</span> :
                       <span className="badge badge-success">Low</span>}
                    </td>
                    <td>{new Date(log.assessmentDate).toLocaleDateString()}</td>
                    <td>
                      {log.resolutionStatus === 'Resolved' ? <span className="badge badge-success">Resolved</span> :
                       log.resolutionStatus === 'Monitoring' ? <span className="badge badge-warning">Monitoring</span> :
                       <span className="badge badge-danger">Active</span>}
                    </td>
                    <td>
                      <select className="form-select" style={{ padding: '0.25rem', fontSize: '0.75rem', width: 'auto' }} value={log.resolutionStatus} onChange={(e) => handleStatusChange(log.logId, e.target.value)}>
                        <option value="Active">Active</option>
                        <option value="Monitoring">Monitoring</option>
                        <option value="Resolved">Resolved</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      {showReserveModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1.25rem', fontSize: '1.1rem' }}>{editingReserveId ? 'Edit Reserve' : 'Add Reserve'}</h3>
            <form onSubmit={handleReserveSubmit}>
              <div className="form-group">
                <label className="form-label">Reserve Name *</label>
                <input type="text" className="form-input" value={reserveForm.reserveName} onChange={e => setReserveForm({...reserveForm, reserveName: e.target.value})} required />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Region *</label>
                  <select className="form-select" value={reserveForm.regionId} onChange={e => setReserveForm({...reserveForm, regionId: e.target.value})} required>
                    <option value="">Select region...</option>
                    {lookups.regions.map(r => <option key={r.regionId} value={r.regionId}>{r.regionName}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Type</label>
                  <select className="form-select" value={reserveForm.reserveType} onChange={e => setReserveForm({...reserveForm, reserveType: e.target.value})}>
                    <option value="National Park">National Park</option>
                    <option value="Wildlife Sanctuary">Wildlife Sanctuary</option>
                    <option value="Marine Reserve">Marine Reserve</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Area (SqKm)</label>
                  <input type="number" step="0.01" className="form-input" value={reserveForm.totalAreaSqKm} onChange={e => setReserveForm({...reserveForm, totalAreaSqKm: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Budget (USD)</label>
                  <input type="number" step="0.01" className="form-input" value={reserveForm.annualBudgetUsd} onChange={e => setReserveForm({...reserveForm, annualBudgetUsd: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Established Year</label>
                  <input type="number" className="form-input" value={reserveForm.establishedYear} onChange={e => setReserveForm({...reserveForm, establishedYear: e.target.value})} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowReserveModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showThreatModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '500px', padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1.25rem', fontSize: '1.1rem' }}>Report New Threat</h3>
            <form onSubmit={handleThreatSubmit}>
              <div className="form-group">
                <label className="form-label">Region *</label>
                <select className="form-select" value={threatForm.regionId} onChange={e => setThreatForm({...threatForm, regionId: e.target.value})} required>
                  <option value="">Select region...</option>
                  {lookups.regions.map(r => <option key={r.regionId} value={r.regionId}>{r.regionName}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Threat Description *</label>
                <input type="text" className="form-input" value={threatForm.threatName} onChange={e => setThreatForm({...threatForm, threatName: e.target.value})} required />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select className="form-select" value={threatForm.threatCategory} onChange={e => setThreatForm({...threatForm, threatCategory: e.target.value})} required>
                    {lookups.categories?.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Severity *</label>
                  <select className="form-select" value={threatForm.severityLevel} onChange={e => setThreatForm({...threatForm, severityLevel: e.target.value})} required>
                    {lookups.severities?.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowThreatModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-danger">Submit Report</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reserves;

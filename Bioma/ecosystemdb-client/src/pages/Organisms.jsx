import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Eye, Tags, Book, Map } from 'lucide-react';
import api from '../api';

const Organisms = () => {
  const [organisms, setOrganisms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [lookups, setLookups] = useState({ ranks: [], statuses: [], reserves: [], regions: [] });

  // 1. Organism Basic Taxonomy Modals
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    scientificName: '', commonName: '', rankName: 'Species', parentId: '',
    kingdomType: 'Animal', conservationStatus: 'LC', discoveryYear: ''
  });

  // 2. Tagging Modals
  const [showTagModal, setShowTagModal] = useState(false);
  const [taggingOrg, setTaggingOrg] = useState(null);
  const [allTags, setAllTags] = useState([]);
  const [selectedTagIds, setSelectedTagIds] = useState([]);

  // 3. Sighting Modals
  const [showSightingModal, setShowSightingModal] = useState(false);
  const [sightingData, setSightingData] = useState({
    organismId: '', reserveId: '', quantityObserved: 1, healthStatus: 'Healthy', observationNotes: ''
  });

  // 4. Encyclopedia Modals
  const [showEncycModal, setShowEncycModal] = useState(false);
  const [encycOrg, setEncycOrg] = useState(null);
  const [encycForm, setEncycForm] = useState({
    description: '', dietType: '', dietDetails: '', physicalDescription: '',
    avgHeightCm: '', avgLengthCm: '', habitatBehavior: '', reproductionInfo: '',
    nativeRangeDescription: '', imageUrl: '', funFact: ''
  });

  // 5. Distributions Modals
  const [showDistModal, setShowDistModal] = useState(false);
  const [distOrg, setDistOrg] = useState(null);
  const [distributions, setDistributions] = useState([]);
  const [distForm, setDistForm] = useState({
    regionId: '', estimatedPopulation: '', lastSurveyDate: '', populationTrend: 'Unknown'
  });

  useEffect(() => {
    fetchData();
    fetchLookups();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/taxonomy/tree');
      setOrganisms(res.data);
    } catch (err) { setError('Failed to fetch organisms'); } 
    finally { setLoading(false); }
  };

  const fetchLookups = async () => {
    try {
      const [ranksRes, statusesRes, sightingsLookups, threatsLookups] = await Promise.all([
        api.get('/taxonomy/ranks'), api.get('/taxonomy/statuses'), api.get('/sightings/lookups'), api.get('/threats/lookups')
      ]);
      setLookups({ 
        ranks: ranksRes.data, 
        statuses: statusesRes.data, 
        reserves: sightingsLookups.data.reserves,
        regions: threatsLookups.data.regions
      });
    } catch (err) {}
  };

  // --- Organism Taxonomy CRUD ---
  const handleEdit = (org) => {
    setEditingId(org.organismId);
    setFormData({
      scientificName: org.scientificName || '', commonName: org.commonName || '', rankName: org.rankName || 'Species',
      parentId: org.parentId || '', kingdomType: org.kingdomType || 'Animal', conservationStatus: org.conservationStatus || 'LC', discoveryYear: org.discoveryYear || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this organism?')) {
      try { await api.delete(`/taxonomy/organisms/${id}`); fetchData(); } catch (err) { alert(err.response?.data?.error || 'Failed to delete'); }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData, parentId: formData.parentId ? parseInt(formData.parentId) : null, discoveryYear: formData.discoveryYear ? parseInt(formData.discoveryYear) : null };
      if (editingId) { await api.put(`/taxonomy/organisms/${editingId}`, payload); } else { await api.post('/taxonomy/organisms', payload); }
      setShowModal(false);
      fetchData();
    } catch (err) { alert(err.response?.data?.error || 'Failed to save'); }
  };

  // --- Tagging ---
  const handleManageTags = async (org) => {
    try {
      const [tagsRes, orgTagsRes] = await Promise.all([api.get('/tags'), api.get(`/tags/organism/${org.organismId}`)]);
      setAllTags(tagsRes.data); setSelectedTagIds(orgTagsRes.data); setTaggingOrg(org); setShowTagModal(true);
    } catch (err) { alert('Error fetching tags.'); }
  };

  const toggleTag = (id) => setSelectedTagIds(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]);

  const saveTags = async () => {
    try { await api.post(`/tags/organism/${taggingOrg.organismId}`, { tagIds: selectedTagIds }); setShowTagModal(false); } catch (err) { alert('Failed to save tags.'); }
  };

  // --- Sighting ---
  const handleLogSighting = (orgId) => { setSightingData({ ...sightingData, organismId: orgId }); setShowSightingModal(true); };
  
  const submitSighting = async (e) => {
    e.preventDefault();
    try {
      await api.post('/sightings', { ...sightingData, organismId: parseInt(sightingData.organismId), reserveId: parseInt(sightingData.reserveId), quantityObserved: parseInt(sightingData.quantityObserved) });
      setShowSightingModal(false); alert('Sighting logged successfully!');
    } catch (err) { alert(err.response?.data?.error || 'Failed to log sighting'); }
  };

  // --- Encyclopedia Details ---
  const handleEditEncyclopedia = async (org) => {
    setEncycOrg(org);
    try {
      const res = await api.get(`/taxonomy/species-details/${org.organismId}`);
      const enc = res.data.encyclopedia || {};
      setEncycForm({
        description: enc.description || '', dietType: enc.dietType || '', dietDetails: enc.dietDetails || '', physicalDescription: enc.physicalDescription || '',
        avgHeightCm: enc.avgHeightCm || '', avgLengthCm: enc.avgLengthCm || '', habitatBehavior: enc.habitatBehavior || '', reproductionInfo: enc.reproductionInfo || '',
        nativeRangeDescription: enc.nativeRangeDescription || '', imageUrl: enc.imageUrl || '', funFact: enc.funFact || ''
      });
      setShowEncycModal(true);
    } catch (err) {
      alert('Error loading encyclopedia details.');
    }
  };

  const saveEncyclopedia = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...encycForm,
        avgHeightCm: encycForm.avgHeightCm ? parseFloat(encycForm.avgHeightCm) : null,
        avgLengthCm: encycForm.avgLengthCm ? parseFloat(encycForm.avgLengthCm) : null
      };
      await api.post(`/taxonomy/species-details/${encycOrg.organismId}`, payload);
      setShowEncycModal(false);
      alert('Encyclopedia details saved successfully.');
    } catch (err) { alert(err.response?.data?.error || 'Failed to save encyclopedia details.'); }
  };

  // --- Distributions ---
  const fetchDistributions = async (orgId) => {
    try {
      const res = await api.get(`/distributions/${orgId}`);
      setDistributions(res.data);
    } catch (err) { console.error("Failed to fetch distributions", err); }
  };

  const handleManageDistributions = async (org) => {
    setDistOrg(org);
    await fetchDistributions(org.organismId);
    setDistForm({ regionId: '', estimatedPopulation: '', lastSurveyDate: '', populationTrend: 'Unknown' });
    setShowDistModal(true);
  };

  const addDistribution = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        regionId: parseInt(distForm.regionId),
        estimatedPopulation: distForm.estimatedPopulation ? parseInt(distForm.estimatedPopulation) : null,
        lastSurveyDate: distForm.lastSurveyDate || null,
        populationTrend: distForm.populationTrend
      };
      await api.post(`/distributions/${distOrg.organismId}`, payload);
      setDistForm({ regionId: '', estimatedPopulation: '', lastSurveyDate: '', populationTrend: 'Unknown' });
      fetchDistributions(distOrg.organismId);
    } catch (err) { alert(err.response?.data?.error || 'Failed to add distribution.'); }
  };

  const removeDistribution = async (regionId) => {
    if (window.confirm('Remove this distribution?')) {
      try {
        await api.delete(`/distributions/${distOrg.organismId}/${regionId}`);
        fetchDistributions(distOrg.organismId);
      } catch (err) { alert(err.response?.data?.error || 'Failed to remove.'); }
    }
  };


  const getStatusBadge = (status) => {
    if (!status) return null;
    if (['CR', 'EN', 'EW', 'EX'].includes(status)) return <span className="badge badge-danger">{status}</span>;
    if (status === 'VU') return <span className="badge badge-warning">{status}</span>;
    return <span className="badge badge-success">{status}</span>;
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Organisms</h2>
          <p className="page-subtitle">Manage taxonomic tree, profiles, distributions and sightings.</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditingId(null); setFormData({ scientificName: '', commonName: '', rankName: 'Species', parentId: '', kingdomType: 'Animal', conservationStatus: 'LC', discoveryYear: '' }); setShowModal(true); }}>
          <Plus size={16} /> Add Organism
        </button>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Scientific Name</th>
                <th>Common Name</th>
                <th>Kingdom</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? <tr><td colSpan="6">Loading...</td></tr> : organisms.map(org => (
                <tr key={org.organismId}>
                  <td><span className="badge badge-neutral">{org.rankName}</span></td>
                  <td style={{ fontStyle: 'italic', color: '#2980b9' }}>{org.scientificName}</td>
                  <td style={{ fontWeight: 500 }}>{org.commonName || '-'}</td>
                  <td>{org.kingdomType || '-'}</td>
                  <td>{getStatusBadge(org.conservationStatus)}</td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.375rem', justifyContent: 'flex-end' }}>
                      <button className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem' }} onClick={() => handleManageTags(org)} title="Manage Tags"><Tags size={14} /></button>
                      
                      {org.rankName === 'Species' && (
                        <>
                          <button className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem' }} onClick={() => handleManageDistributions(org)} title="Manage Distributions"><Map size={14} /></button>
                          <button className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem' }} onClick={() => handleEditEncyclopedia(org)} title="Edit Encyclopedia Profile"><Book size={14} /></button>
                          <button className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem' }} onClick={() => handleLogSighting(org.organismId)} title="Log Sighting"><Eye size={14} /></button>
                        </>
                      )}
                      
                      <button className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem' }} onClick={() => handleEdit(org)} title="Edit Taxonomy"><Edit2 size={14} /></button>
                      <button className="btn btn-danger" style={{ padding: '0.25rem 0.5rem' }} onClick={() => handleDelete(org.organismId)} title="Delete Organism"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1.25rem', fontSize: '1.1rem' }}>{editingId ? 'Edit Taxonomy' : 'Add Organism'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="grid-2">
                <div className="form-group"><label className="form-label">Scientific Name *</label><input type="text" className="form-input" value={formData.scientificName} onChange={e => setFormData({...formData, scientificName: e.target.value})} required /></div>
                <div className="form-group"><label className="form-label">Common Name</label><input type="text" className="form-input" value={formData.commonName} onChange={e => setFormData({...formData, commonName: e.target.value})} /></div>
                <div className="form-group">
                  <label className="form-label">Rank</label>
                  <select className="form-select" value={formData.rankName} onChange={e => setFormData({...formData, rankName: e.target.value})}>
                    {lookups.ranks.map(r => <option key={r.rankName} value={r.rankName}>{r.rankName}</option>)}
                  </select>
                </div>
                <div className="form-group"><label className="form-label">Parent ID</label><input type="number" className="form-input" value={formData.parentId} onChange={e => setFormData({...formData, parentId: e.target.value})} /></div>
                <div className="form-group">
                  <label className="form-label">Conservation Status</label>
                  <select className="form-select" value={formData.conservationStatus} onChange={e => setFormData({...formData, conservationStatus: e.target.value})}>
                    <option value="">None</option>
                    {lookups.statuses.map(s => <option key={s.statusCode} value={s.statusCode}>{s.statusName}</option>)}
                  </select>
                </div>
                <div className="form-group"><label className="form-label">Discovery Year</label><input type="number" className="form-input" value={formData.discoveryYear} onChange={e => setFormData({...formData, discoveryYear: e.target.value})} /></div>
                <div className="form-group">
                  <label className="form-label">Kingdom Type</label>
                  <select className="form-select" value={formData.kingdomType} onChange={e => setFormData({...formData, kingdomType: e.target.value})}>
                    <option value="">None</option>
                    <option value="Animal">Animal</option>
                    <option value="Plant">Plant</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Organism</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEncycModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '800px', padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1.25rem', fontSize: '1.1rem' }}>Edit Encyclopedia: <i>{encycOrg?.scientificName}</i></h3>
            <form onSubmit={saveEncyclopedia}>
              <div className="grid-2">
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Description</label>
                  <textarea className="form-textarea" rows="3" value={encycForm.description} onChange={e => setEncycForm({...encycForm, description: e.target.value})}></textarea>
                </div>
                <div className="form-group">
                  <label className="form-label">Diet Type</label>
                  <select className="form-select" value={encycForm.dietType} onChange={e => setEncycForm({...encycForm, dietType: e.target.value})}>
                    <option value="">None</option><option value="Carnivore">Carnivore</option><option value="Herbivore">Herbivore</option><option value="Omnivore">Omnivore</option><option value="Autotroph">Autotroph</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Diet Details</label>
                  <input type="text" className="form-input" value={encycForm.dietDetails} onChange={e => setEncycForm({...encycForm, dietDetails: e.target.value})} />
                </div>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Physical Description</label>
                  <textarea className="form-textarea" rows="2" value={encycForm.physicalDescription} onChange={e => setEncycForm({...encycForm, physicalDescription: e.target.value})}></textarea>
                </div>
                <div className="form-group">
                  <label className="form-label">Avg Height (cm)</label>
                  <input type="number" step="0.1" className="form-input" value={encycForm.avgHeightCm} onChange={e => setEncycForm({...encycForm, avgHeightCm: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Avg Length (cm)</label>
                  <input type="number" step="0.1" className="form-input" value={encycForm.avgLengthCm} onChange={e => setEncycForm({...encycForm, avgLengthCm: e.target.value})} />
                </div>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Habitat & Behavior</label>
                  <textarea className="form-textarea" rows="2" value={encycForm.habitatBehavior} onChange={e => setEncycForm({...encycForm, habitatBehavior: e.target.value})}></textarea>
                </div>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Native Range Description</label>
                  <input type="text" className="form-input" value={encycForm.nativeRangeDescription} onChange={e => setEncycForm({...encycForm, nativeRangeDescription: e.target.value})} />
                </div>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Reproduction Info</label>
                  <input type="text" className="form-input" value={encycForm.reproductionInfo} onChange={e => setEncycForm({...encycForm, reproductionInfo: e.target.value})} />
                </div>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Fun Fact</label>
                  <input type="text" className="form-input" value={encycForm.funFact} onChange={e => setEncycForm({...encycForm, funFact: e.target.value})} />
                </div>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Image URL</label>
                  <input type="text" className="form-input" value={encycForm.imageUrl} onChange={e => setEncycForm({...encycForm, imageUrl: e.target.value})} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowEncycModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Profile</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDistModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '800px', padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1.25rem', fontSize: '1.1rem' }}>Distributions: <i>{distOrg?.scientificName}</i></h3>
            
            <div className="table-container" style={{ marginBottom: '2rem' }}>
              <table className="table">
                <thead>
                  <tr><th>Region</th><th>Est. Population</th><th>Trend</th><th>Survey Date</th><th>Action</th></tr>
                </thead>
                <tbody>
                  {distributions.map(d => (
                    <tr key={d.regionId}>
                      <td>{d.regionName}, {d.country}</td>
                      <td>{d.estimatedPopulation || 'Unknown'}</td>
                      <td>{d.populationTrend || '-'}</td>
                      <td>{d.lastSurveyDate ? new Date(d.lastSurveyDate).toLocaleDateString() : '-'}</td>
                      <td>
                        <button className="btn btn-danger" style={{ padding: '0.25rem 0.5rem' }} onClick={() => removeDistribution(d.regionId)}><Trash2 size={14} /></button>
                      </td>
                    </tr>
                  ))}
                  {distributions.length === 0 && <tr><td colSpan="5" style={{ textAlign: 'center', color: '#999' }}>No distributions added.</td></tr>}
                </tbody>
              </table>
            </div>

            <h4 style={{ marginBottom: '1rem' }}>Add Distribution</h4>
            <form onSubmit={addDistribution}>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Region *</label>
                  <select className="form-select" value={distForm.regionId} onChange={e => setDistForm({...distForm, regionId: e.target.value})} required>
                    <option value="">Select region...</option>
                    {lookups.regions.map(r => <option key={r.regionId} value={r.regionId}>{r.regionName}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Estimated Population</label>
                  <input type="number" min="0" className="form-input" value={distForm.estimatedPopulation} onChange={e => setDistForm({...distForm, estimatedPopulation: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Population Trend</label>
                  <select className="form-select" value={distForm.populationTrend} onChange={e => setDistForm({...distForm, populationTrend: e.target.value})}>
                    <option value="Unknown">Unknown</option><option value="Increasing">Increasing</option><option value="Stable">Stable</option><option value="Decreasing">Decreasing</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Last Survey Date</label>
                  <input type="date" className="form-input" value={distForm.lastSurveyDate} onChange={e => setDistForm({...distForm, lastSurveyDate: e.target.value})} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowDistModal(false)}>Close</button>
                <button type="submit" className="btn btn-primary">Add Region</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showTagModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '400px', padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1.25rem', fontSize: '1.1rem' }}>Tags for <i>{taggingOrg?.scientificName}</i></h3>
            <div style={{ maxHeight: '300px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              {allTags.map(t => (
                <label key={t.tagId} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem', background: '#f8f9fa', borderRadius: '4px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={selectedTagIds.includes(t.tagId)} onChange={() => toggleTag(t.tagId)} />
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: t.tagColor }}></div>
                  <span>{t.tagName}</span>
                </label>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowTagModal(false)}>Cancel</button>
              <button type="button" className="btn btn-primary" onClick={saveTags}>Save Tags</button>
            </div>
          </div>
        </div>
      )}

      {showSightingModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '500px', padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1.25rem', fontSize: '1.1rem' }}>Log Sighting</h3>
            <form onSubmit={submitSighting}>
              <div className="form-group">
                <label className="form-label">Reserve *</label>
                <select className="form-select" value={sightingData.reserveId} onChange={e => setSightingData({...sightingData, reserveId: e.target.value})} required>
                  <option value="">Select a reserve...</option>
                  {lookups.reserves.map(r => <option key={r.reserveId} value={r.reserveId}>{r.reserveName}</option>)}
                </select>
              </div>
              <div className="grid-2">
                <div className="form-group"><label className="form-label">Quantity *</label><input type="number" min="1" className="form-input" value={sightingData.quantityObserved} onChange={e => setSightingData({...sightingData, quantityObserved: e.target.value})} required /></div>
                <div className="form-group">
                  <label className="form-label">Health *</label>
                  <select className="form-select" value={sightingData.healthStatus} onChange={e => setSightingData({...sightingData, healthStatus: e.target.value})} required>
                    <option value="Healthy">Healthy</option><option value="Injured">Injured</option><option value="Malnourished">Malnourished</option><option value="Dead">Dead</option><option value="Unknown">Unknown</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Notes</label>
                <textarea className="form-textarea" rows="2" value={sightingData.observationNotes} onChange={e => setSightingData({...sightingData, observationNotes: e.target.value})}></textarea>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowSightingModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Submit</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Organisms;

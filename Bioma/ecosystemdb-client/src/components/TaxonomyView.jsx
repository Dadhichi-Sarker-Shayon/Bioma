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

export default function TaxonomyView({ activeUser, addToast }) {
  const [organisms, setOrganisms] = useState([])
  const [ranks, setRanks] = useState([])
  const [statuses, setStatuses] = useState([])
  const [loading, setLoading] = useState(true)
  
  const [selectedNode, setSelectedNode] = useState(null)
  const [expandedNodes, setExpandedNodes] = useState(new Set())

  const isGlobalAdmin = activeUser?.roleName === 'Global Admin'

  const fetchData = async () => {
    try {
      setLoading(true)
      const [orgsData, ranksData, statusData] = await Promise.all([
        api('/api/taxonomy/tree'),
        api('/api/taxonomy/ranks'),
        api('/api/taxonomy/statuses')
      ])
      setOrganisms(orgsData)
      setRanks(ranksData)
      setStatuses(statusData)
      
      // Auto expand root node
      const root = orgsData.find(o => !o.parentId)
      if (root) {
        setExpandedNodes(prev => new Set(prev).add(root.organismId))
      }
    } catch (err) {
      addToast('error', err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const toggleNode = (id) => {
    const next = new Set(expandedNodes)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setExpandedNodes(next)
  }

  const handleSelectNode = (node) => {
    setSelectedNode(node)
  }

  const handleNodeUpdated = () => {
    fetchData()
  }

  const handleAddNewNode = () => {
    setSelectedNode({ isNew: true, scientificName: '', commonName: '', rankId: 1, parentId: null, discoveryYear: '' })
  }

  const handleAddNewChild = (parentId) => {
    setSelectedNode({ isNew: true, scientificName: '', commonName: '', rankId: ranks[1]?.rankId, parentId: parentId, discoveryYear: '' })
  }

  // Build the tree hierarchy
  const buildTree = (parentId) => {
    return organisms.filter(o => o.parentId === parentId).sort((a, b) => a.scientificName.localeCompare(b.scientificName))
  }

  const TreeNode = ({ node }) => {
    const children = buildTree(node.organismId)
    const isExpanded = expandedNodes.has(node.organismId)
    const isSelected = selectedNode?.organismId === node.organismId

    return (
      <div style={{ marginLeft: 16 }}>
        <div 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            padding: '6px', 
            cursor: 'pointer',
            background: isSelected ? 'rgba(52, 211, 153, 0.15)' : 'transparent',
            borderRadius: 4,
            borderLeft: isSelected ? '3px solid var(--emerald-400)' : '3px solid transparent'
          }}
          onClick={() => handleSelectNode(node)}
        >
          <div 
            onClick={(e) => { e.stopPropagation(); toggleNode(node.organismId) }}
            style={{ width: 20, textAlign: 'center', color: 'var(--text-muted)', visibility: children.length ? 'visible' : 'hidden' }}
          >
            {isExpanded ? '▼' : '▶'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', marginLeft: 4 }}>
            <div style={{ fontSize: '0.85rem', color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
              {node.scientificName} {node.commonName ? `(${node.commonName})` : ''}
            </div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
              {node.rankName}
            </div>
          </div>
        </div>
        {isExpanded && (
          <div style={{ borderLeft: '1px solid var(--border-subtle)', marginLeft: 10 }}>
            {children.map(child => <TreeNode key={child.organismId} node={child} />)}
          </div>
        )}
      </div>
    )
  }

  if (loading) {
    return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}><span className="spinner" /> Loading Taxonomy Engine...</div>
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="page-header" style={{ marginBottom: '20px' }}>
        <h1 className="page-title">Taxonomy Manager</h1>
        <p className="page-description">Manage the biological Tree of Life, species profiles, and multimedia galleries.</p>
      </div>

      <div style={{ display: 'flex', gap: '24px', flex: 1, minHeight: 0 }}>
        {/* LEFT PANE: Tree Explorer */}
        <div className="glass-card" style={{ width: '350px', display: 'flex', flexDirection: 'column', padding: '16px', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>Tree Explorer</h3>
            {isGlobalAdmin && (
              <button className="btn btn-sm btn-primary" onClick={handleAddNewNode}>＋ Root</button>
            )}
          </div>
          <div style={{ overflowY: 'auto', flex: 1, paddingRight: '8px' }}>
            {buildTree(null).map(rootNode => (
              <TreeNode key={rootNode.organismId} node={rootNode} />
            ))}
            {organisms.length === 0 && <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No taxonomy data found.</div>}
          </div>
        </div>

        {/* RIGHT PANE: Details & Editor */}
        <div className="glass-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '0', overflow: 'hidden' }}>
          {selectedNode ? (
            <NodeEditor 
              key={selectedNode.organismId || 'new'} 
              node={selectedNode} 
              ranks={ranks} 
              statuses={statuses}
              organisms={organisms}
              isGlobalAdmin={isGlobalAdmin}
              addToast={addToast}
              onSaved={(newId) => { handleNodeUpdated(); if (newId) { setSelectedNode({...selectedNode, organismId: newId, isNew: false}); setExpandedNodes(prev => new Set(prev).add(newId)); } }}
              onDeleted={() => { setSelectedNode(null); handleNodeUpdated(); }}
              onAddChild={() => handleAddNewChild(selectedNode.organismId)}
            />
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
              Select a node from the Tree Explorer to view or edit details.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function NodeEditor({ node, ranks, statuses, organisms, isGlobalAdmin, addToast, onSaved, onDeleted, onAddChild }) {
  const [form, setForm] = useState({
    scientificName: node.scientificName || '',
    commonName: node.commonName || '',
    rankId: node.rankId || '',
    parentId: node.parentId || '',
    discoveryYear: node.discoveryYear || ''
  })
  
  const [activeTab, setActiveTab] = useState('basic')
  const [saving, setSaving] = useState(false)
  const [detailsForm, setDetailsForm] = useState(null)
  const [photos, setPhotos] = useState([])
  const [detailsLoading, setDetailsLoading] = useState(false)
  
  const isSpecies = ranks.find(r => r.rankId === parseInt(form.rankId))?.rankName === 'Species'

  useEffect(() => {
    if (!node.isNew && isSpecies) {
      loadSpeciesDetails()
      loadPhotos()
    }
  }, [node.organismId, isSpecies])

  const loadSpeciesDetails = async () => {
    setDetailsLoading(true)
    try {
      const data = await api(`/api/taxonomy/species-details/${node.organismId}`)
      setDetailsForm({
        kingdomType: data.profile?.kingdomType || 'Animal',
        statusCode: data.profile?.statusCode || 'LC',
        avgLifespanYears: data.profile?.avgLifespanYears || '',
        avgWeightKg: data.profile?.avgWeightKg || '',
        metabolicRateIndex: data.profile?.metabolicRateIndex || '',
        photosyntheticRate: data.profile?.photosyntheticRate || '',
        description: data.encyclopedia?.description || '',
        dietType: data.encyclopedia?.dietType || 'Omnivore',
        dietDetails: data.encyclopedia?.dietDetails || '',
        physicalDescription: data.encyclopedia?.physicalDescription || '',
        avgHeightCm: data.encyclopedia?.avgHeightCm || '',
        avgLengthCm: data.encyclopedia?.avgLengthCm || '',
        habitatBehavior: data.encyclopedia?.habitatBehavior || '',
        reproductionInfo: data.encyclopedia?.reproductionInfo || '',
        nativeRangeDescription: data.encyclopedia?.nativeRangeDescription || '',
        imageUrl: data.encyclopedia?.imageUrl || '',
        funFact: data.encyclopedia?.funFact || ''
      })
    } catch (err) {
      addToast('error', 'Failed to load details: ' + err.message)
    } finally {
      setDetailsLoading(false)
    }
  }

  const loadPhotos = async () => {
    try {
      const data = await api(`/api/taxonomy/photos/${node.organismId}`)
      setPhotos(data)
    } catch (err) {
      addToast('error', 'Failed to load photos')
    }
  }

  const handleBasicChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })
  const handleDetailsChange = (e) => setDetailsForm({ ...detailsForm, [e.target.name]: e.target.value })

  const saveBasic = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        ...form,
        rankId: parseInt(form.rankId),
        parentId: form.parentId ? parseInt(form.parentId) : null,
        discoveryYear: form.discoveryYear ? parseInt(form.discoveryYear) : null
      }
      
      if (node.isNew) {
        const res = await api('/api/taxonomy/organisms', { method: 'POST', body: JSON.stringify(payload) })
        addToast('success', res.message)
        onSaved(res.organismId)
      } else {
        const res = await api(`/api/taxonomy/organisms/${node.organismId}`, { method: 'PUT', body: JSON.stringify(payload) })
        addToast('success', res.message)
        onSaved()
      }
    } catch (err) {
      addToast('error', err.message)
    } finally {
      setSaving(false)
    }
  }

  const deleteNode = async () => {
    if (!window.confirm(`Are you sure you want to delete ${node.scientificName}? This will cascade delete all child nodes and associated data.`)) return
    try {
      await api(`/api/taxonomy/organisms/${node.organismId}`, { method: 'DELETE' })
      addToast('success', 'Node deleted successfully')
      onDeleted()
    } catch (err) {
      addToast('error', err.message)
    }
  }

  const saveDetails = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        ...detailsForm,
        avgLifespanYears: detailsForm.avgLifespanYears ? parseFloat(detailsForm.avgLifespanYears) : null,
        avgWeightKg: detailsForm.avgWeightKg ? parseFloat(detailsForm.avgWeightKg) : null,
        avgHeightCm: detailsForm.avgHeightCm ? parseFloat(detailsForm.avgHeightCm) : null,
        avgLengthCm: detailsForm.avgLengthCm ? parseFloat(detailsForm.avgLengthCm) : null
      }
      const res = await api(`/api/taxonomy/species-details/${node.organismId}`, { method: 'POST', body: JSON.stringify(payload) })
      addToast('success', res.message)
    } catch (err) {
      addToast('error', err.message)
    } finally {
      setSaving(false)
    }
  }

  const addPhoto = async (e) => {
    e.preventDefault()
    const url = e.target.photoUrl.value
    const caption = e.target.caption.value
    const isPrimary = e.target.isPrimary.checked ? 'Y' : 'N'
    if (!url) return
    try {
      await api('/api/taxonomy/photos', { method: 'POST', body: JSON.stringify({ organismId: node.organismId, photoUrl: url, caption, isPrimary }) })
      addToast('success', 'Photo added')
      e.target.reset()
      loadPhotos()
    } catch (err) {
      addToast('error', err.message)
    }
  }

  const deletePhoto = async (photoId) => {
    if (!window.confirm('Delete photo?')) return
    try {
      await api(`/api/taxonomy/photos/${photoId}`, { method: 'DELETE' })
      addToast('success', 'Photo removed')
      loadPhotos()
    } catch (err) {
      addToast('error', err.message)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.02)' }}>
        <div>
          <h2 style={{ fontSize: '1.2rem', margin: 0 }}>{node.isNew ? 'Create New Node' : node.scientificName}</h2>
          {!node.isNew && <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>ID: {node.organismId} • {node.commonName}</span>}
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {!node.isNew && isGlobalAdmin && <button className="btn btn-sm" onClick={onAddChild}>＋ Add Child</button>}
          {!node.isNew && isGlobalAdmin && <button className="btn btn-sm btn-danger" onClick={deleteNode}>🗑️ Delete</button>}
        </div>
      </div>

      <div style={{ padding: '0 24px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', gap: '20px' }}>
        <button onClick={() => setActiveTab('basic')} style={{ background: 'none', border: 'none', padding: '12px 0', color: activeTab === 'basic' ? 'var(--emerald-400)' : 'var(--text-secondary)', cursor: 'pointer', borderBottom: activeTab === 'basic' ? '2px solid var(--emerald-400)' : '2px solid transparent', fontWeight: activeTab === 'basic' ? 600 : 400 }}>Taxonomy</button>
        {!node.isNew && isSpecies && (
          <>
            <button onClick={() => setActiveTab('profile')} style={{ background: 'none', border: 'none', padding: '12px 0', color: activeTab === 'profile' ? 'var(--emerald-400)' : 'var(--text-secondary)', cursor: 'pointer', borderBottom: activeTab === 'profile' ? '2px solid var(--emerald-400)' : '2px solid transparent', fontWeight: activeTab === 'profile' ? 600 : 400 }}>Profile & Details</button>
            <button onClick={() => setActiveTab('photos')} style={{ background: 'none', border: 'none', padding: '12px 0', color: activeTab === 'photos' ? 'var(--emerald-400)' : 'var(--text-secondary)', cursor: 'pointer', borderBottom: activeTab === 'photos' ? '2px solid var(--emerald-400)' : '2px solid transparent', fontWeight: activeTab === 'photos' ? 600 : 400 }}>Photo Gallery</button>
          </>
        )}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
        {activeTab === 'basic' && (
          <form onSubmit={saveBasic} style={{ maxWidth: '600px' }}>
            <div className="form-group">
              <label className="form-label">Scientific Name *</label>
              <input className="form-input" name="scientificName" value={form.scientificName} onChange={handleBasicChange} required readOnly={!isGlobalAdmin} />
            </div>
            <div className="form-group">
              <label className="form-label">Common Name</label>
              <input className="form-input" name="commonName" value={form.commonName} onChange={handleBasicChange} readOnly={!isGlobalAdmin} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Taxonomic Rank *</label>
                <select className="form-select" name="rankId" value={form.rankId} onChange={handleBasicChange} required disabled={!isGlobalAdmin}>
                  <option value="">Select Rank...</option>
                  {ranks.map(r => <option key={r.rankId} value={r.rankId}>{r.rankName}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Discovery Year</label>
                <input className="form-input" type="number" name="discoveryYear" value={form.discoveryYear} onChange={handleBasicChange} readOnly={!isGlobalAdmin} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Parent Node</label>
              <select className="form-select" name="parentId" value={form.parentId} onChange={handleBasicChange} disabled={!isGlobalAdmin}>
                <option value="">None (Root)</option>
                {organisms.filter(o => o.organismId !== node.organismId).map(o => (
                  <option key={o.organismId} value={o.organismId}>{o.scientificName} ({o.rankName})</option>
                ))}
              </select>
            </div>
            {isGlobalAdmin && (
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save Taxonomy'}</button>
            )}
          </form>
        )}

        {activeTab === 'profile' && detailsForm && !detailsLoading && (
          <form onSubmit={saveDetails} style={{ maxWidth: '800px' }}>
            <h3 style={{ marginBottom: 16, fontSize: '1rem', color: 'var(--text-primary)' }}>Scientific Profile</h3>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Kingdom Type</label>
                <select className="form-select" name="kingdomType" value={detailsForm.kingdomType} onChange={handleDetailsChange} disabled={!isGlobalAdmin}>
                  <option value="Animal">Animal</option>
                  <option value="Plant">Plant</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Conservation Status</label>
                <select className="form-select" name="statusCode" value={detailsForm.statusCode} onChange={handleDetailsChange} disabled={!isGlobalAdmin}>
                  {statuses.map(s => <option key={s.statusCode} value={s.statusCode}>{s.statusName}</option>)}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Avg Lifespan (Years)</label>
                <input className="form-input" type="number" step="0.01" name="avgLifespanYears" value={detailsForm.avgLifespanYears} onChange={handleDetailsChange} readOnly={!isGlobalAdmin} />
              </div>
              <div className="form-group">
                <label className="form-label">Avg Weight (Kg)</label>
                <input className="form-input" type="number" step="0.01" name="avgWeightKg" value={detailsForm.avgWeightKg} onChange={handleDetailsChange} readOnly={!isGlobalAdmin} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Metabolic Rate (Animals)</label>
                <input className="form-input" name="metabolicRateIndex" value={detailsForm.metabolicRateIndex} onChange={handleDetailsChange} readOnly={!isGlobalAdmin} />
              </div>
              <div className="form-group">
                <label className="form-label">Photosynthetic Rate (Plants)</label>
                <input className="form-input" name="photosyntheticRate" value={detailsForm.photosyntheticRate} onChange={handleDetailsChange} readOnly={!isGlobalAdmin} />
              </div>
            </div>

            <h3 style={{ margin: '32px 0 16px', fontSize: '1rem', color: 'var(--text-primary)' }}>Encyclopedia Entry</h3>
            <div className="form-group">
              <label className="form-label">Main Description</label>
              <textarea className="form-input" name="description" rows={3} value={detailsForm.description} onChange={handleDetailsChange} readOnly={!isGlobalAdmin} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Diet Type</label>
                <select className="form-select" name="dietType" value={detailsForm.dietType} onChange={handleDetailsChange} disabled={!isGlobalAdmin}>
                  <option>Carnivore</option><option>Herbivore</option><option>Omnivore</option><option>Detritivore</option><option>Autotroph</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Diet Details</label>
                <input className="form-input" name="dietDetails" value={detailsForm.dietDetails} onChange={handleDetailsChange} readOnly={!isGlobalAdmin} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Habitat & Behavior</label>
              <textarea className="form-input" name="habitatBehavior" rows={2} value={detailsForm.habitatBehavior} onChange={handleDetailsChange} readOnly={!isGlobalAdmin} />
            </div>
            <div className="form-group">
              <label className="form-label">Native Range</label>
              <input className="form-input" name="nativeRangeDescription" value={detailsForm.nativeRangeDescription} onChange={handleDetailsChange} readOnly={!isGlobalAdmin} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Physical Description</label>
                <input className="form-input" name="physicalDescription" value={detailsForm.physicalDescription} onChange={handleDetailsChange} readOnly={!isGlobalAdmin} />
              </div>
              <div style={{ display: 'flex', gap: '8px', flex: 1 }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Height (cm)</label>
                  <input className="form-input" type="number" step="0.01" name="avgHeightCm" value={detailsForm.avgHeightCm} onChange={handleDetailsChange} readOnly={!isGlobalAdmin} />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Length (cm)</label>
                  <input className="form-input" type="number" step="0.01" name="avgLengthCm" value={detailsForm.avgLengthCm} onChange={handleDetailsChange} readOnly={!isGlobalAdmin} />
                </div>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Reproduction Info</label>
              <input className="form-input" name="reproductionInfo" value={detailsForm.reproductionInfo} onChange={handleDetailsChange} readOnly={!isGlobalAdmin} />
            </div>
            <div className="form-group">
              <label className="form-label">Fun Fact</label>
              <input className="form-input" name="funFact" value={detailsForm.funFact} onChange={handleDetailsChange} readOnly={!isGlobalAdmin} />
            </div>
            <div className="form-group">
              <label className="form-label">Representative Image URL</label>
              <input className="form-input" name="imageUrl" value={detailsForm.imageUrl} onChange={handleDetailsChange} readOnly={!isGlobalAdmin} />
            </div>
            
            {isGlobalAdmin && (
              <div style={{ marginTop: '24px' }}>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save Profile & Details'}</button>
              </div>
            )}
          </form>
        )}

        {activeTab === 'profile' && detailsLoading && (
          <div style={{ color: 'var(--text-muted)' }}>Loading details...</div>
        )}

        {activeTab === 'photos' && (
          <div>
            {isGlobalAdmin && (
              <form onSubmit={addPhoto} style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', marginBottom: '24px', background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '8px' }}>
                <div className="form-group" style={{ flex: 2, margin: 0 }}>
                  <label className="form-label">Photo URL</label>
                  <input className="form-input" name="photoUrl" placeholder="https://..." required />
                </div>
                <div className="form-group" style={{ flex: 2, margin: 0 }}>
                  <label className="form-label">Caption</label>
                  <input className="form-input" name="caption" placeholder="A brief description" />
                </div>
                <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '0 8px 10px 0' }}>
                  <input type="checkbox" name="isPrimary" id="isPrimary" />
                  <label htmlFor="isPrimary" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Primary</label>
                </div>
                <button type="submit" className="btn btn-primary">Add Photo</button>
              </form>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
              {photos.map(p => (
                <div key={p.photoId} style={{ background: 'var(--bg-card)', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-subtle)', position: 'relative' }}>
                  <div style={{ height: '140px', backgroundImage: `url(${p.photoUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                  {p.isPrimary === 'Y' && (
                    <span style={{ position: 'absolute', top: 8, left: 8, background: 'var(--emerald-500)', color: '#fff', fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>Primary</span>
                  )}
                  {isGlobalAdmin && (
                    <button 
                      onClick={() => deletePhoto(p.photoId)}
                      style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.6)', border: 'none', color: '#fff', width: 24, height: 24, borderRadius: '50%', cursor: 'pointer' }}
                    >✕</button>
                  )}
                  <div style={{ padding: '8px 12px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {p.caption || 'No caption'}
                  </div>
                </div>
              ))}
              {photos.length === 0 && <div style={{ color: 'var(--text-muted)' }}>No photos uploaded.</div>}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

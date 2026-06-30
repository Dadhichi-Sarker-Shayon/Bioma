import { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import api from '../api';

const Tags = () => {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    tagName: '',
    tagCategory: '',
    tagColor: '#00f0ff'
  });

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      setLoading(true);
      const res = await api.get('/tags');
      setTags(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/tags', formData);
      setShowModal(false);
      setFormData({ tagName: '', tagCategory: '', tagColor: '#00f0ff' });
      fetchTags();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create tag');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this tag? It will be removed from all species.')) {
      try {
        await api.delete(`/tags/${id}`);
        fetchTags();
      } catch (err) {
        alert(err.response?.data?.error || 'Failed to delete');
      }
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h2>Global Tags</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Manage categorization tags for species.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} /> Create Tag
        </button>
      </div>

      <div className="card">
        {loading ? (
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Loading tags...</p>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
            {tags.map((tag) => (
              <div key={tag.tagId} className="glass-panel" style={{ padding: '0.75rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', minWidth: '150px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: tag.tagColor || 'var(--accent-primary)' }}></div>
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{tag.tagName}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{tag.tagCategory}</span>
                </div>
                <button className="btn" style={{ padding: '0.25rem', color: 'var(--danger)', background: 'transparent' }} onClick={() => handleDelete(tag.tagId)}>
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            {tags.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>No tags found in the system.</p>}
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="card modal-content animate-fade-in" style={{ maxWidth: '400px' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>Create New Tag</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Tag Name *</label>
                <input type="text" className="form-input" value={formData.tagName} onChange={e => setFormData({...formData, tagName: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">Category</label>
                <input type="text" className="form-input" placeholder="e.g. Diet, Habitat" value={formData.tagCategory} onChange={e => setFormData({...formData, tagCategory: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Color Hex</label>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <input type="color" style={{ width: '50px', height: '40px', padding: 0, border: 'none', background: 'none' }} value={formData.tagColor} onChange={e => setFormData({...formData, tagColor: e.target.value})} />
                  <input type="text" className="form-input" value={formData.tagColor} onChange={e => setFormData({...formData, tagColor: e.target.value})} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tags;

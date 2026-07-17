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
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Tags</h2>
          <p className="page-subtitle">Manage categorization tags for species.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Create Tag
        </button>
      </div>

      <div className="card">
        {loading ? (
          <p style={{ textAlign: 'center', color: '#999' }}>Loading tags...</p>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
            {tags.map((tag) => (
              <div key={tag.tagId} style={{ padding: '0.625rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: '140px', background: '#f8f9fa', border: '1px solid #e8e8e8', borderRadius: '6px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: tag.tagColor || '#2980b9' }}></div>
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{tag.tagName}</span>
                  <span style={{ fontSize: '0.7rem', color: '#999' }}>{tag.tagCategory}</span>
                </div>
                <button className="btn" style={{ padding: '0.25rem', color: '#e74c3c', background: 'transparent', border: 'none' }} onClick={() => handleDelete(tag.tagId)}>
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            {tags.length === 0 && <p style={{ color: '#999' }}>No tags found.</p>}
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '400px', padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1.25rem', fontSize: '1.1rem' }}>Create New Tag</h3>
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
                  <input type="color" style={{ width: '40px', height: '36px', padding: 0, border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer' }} value={formData.tagColor} onChange={e => setFormData({...formData, tagColor: e.target.value})} />
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

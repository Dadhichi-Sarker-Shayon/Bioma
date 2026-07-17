import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, ChevronDown } from 'lucide-react';
import api from '../../api';

const TaxonomyTreeNode = ({ node, level = 0 }) => {
  const [expanded, setExpanded] = useState(level < 1);

  const hasChildren = node.children && node.children.length > 0;

  const getRankColor = (rank) => {
    switch (rank) {
      case 'Kingdom': return '#f39c12';
      case 'Phylum': return '#27ae60';
      case 'Class': return '#2980b9';
      case 'Order': return '#8e44ad';
      case 'Family': return '#e74c3c';
      case 'Genus': return '#16a085';
      case 'Species': return '#1a3a5c';
      default: return '#666';
    }
  };

  return (
    <div style={{ marginLeft: level > 0 ? '16px' : '0' }}>
      <div
        style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          padding: '0.375rem 0.5rem', borderRadius: '4px',
          cursor: hasChildren ? 'pointer' : 'default',
          background: 'transparent', marginBottom: '1px',
          borderLeft: `3px solid ${getRankColor(node.rankName)}`,
        }}
        onClick={() => hasChildren && setExpanded(!expanded)}
        onMouseOver={(e) => e.currentTarget.style.background = '#f8f9fa'}
        onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
      >
        <div style={{ width: '16px', display: 'flex', justifyContent: 'center' }}>
          {hasChildren ? (
            expanded ? <ChevronDown size={14} color="#999" /> : <ChevronRight size={14} color="#999" />
          ) : <div style={{ width: '14px' }} />}
        </div>
        <span style={{ fontSize: '0.7rem', fontWeight: 600, color: getRankColor(node.rankName), textTransform: 'uppercase', minWidth: '55px' }}>
          {node.rankName}
        </span>
        <span style={{ fontStyle: 'italic', color: '#1a1a1a', fontWeight: node.rankName === 'Kingdom' ? 600 : 400, fontSize: '0.9rem' }}>
          {node.scientificName}
        </span>
        {node.commonName && (
          <span style={{ color: '#999', fontSize: '0.85rem' }}>({node.commonName})</span>
        )}
        {node.rankName === 'Species' && (
          <Link
            to={`/encyclopedia/${node.organismId}`}
            style={{ marginLeft: 'auto', fontSize: '0.7rem', color: '#2980b9', textDecoration: 'none', padding: '0.15rem 0.5rem', border: '1px solid #2980b9', borderRadius: '3px', fontWeight: 500 }}
            onClick={(e) => e.stopPropagation()}
          >View</Link>
        )}
      </div>
      {expanded && hasChildren && (
        <div style={{ paddingLeft: '8px', borderLeft: '1px dashed #ddd', marginLeft: '10px', marginTop: '2px', marginBottom: '6px' }}>
          {node.children.map(child => (
            <TaxonomyTreeNode key={child.organismId} node={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

const TaxonomyTree = () => {
  const [treeData, setTreeData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTree = async () => {
      try {
        const res = await api.get('/taxonomy/tree');
        const flatData = res.data;
        setTreeData(buildTree(flatData));
      } catch (err) {
        setError('Failed to fetch taxonomy data.');
      } finally {
        setLoading(false);
      }
    };
    fetchTree();
  }, []);

  const buildTree = (data) => {
    const map = new Map();
    const roots = [];

    data.forEach(item => {
      map.set(item.organismId, { ...item, children: [] });
    });

    data.forEach(item => {
      const node = map.get(item.organismId);
      if (item.parentId) {
        const parent = map.get(item.parentId);
        if (parent) {
          parent.children.push(node);
        } else {
          roots.push(node);
        }
      } else {
        roots.push(node);
      }
    });

    return roots;
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>Taxonomy Tree</h1>
      <p style={{ color: '#777', marginBottom: '2rem' }}>Explore the hierarchical classification of all organisms.</p>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: '#999' }}>Loading...</div>
      ) : error ? (
        <div className="badge badge-danger">{error}</div>
      ) : (
        <div className="card" style={{ padding: '1.5rem', background: 'white', border: '1px solid #dde1e6' }}>
          {treeData.map(rootNode => (
            <TaxonomyTreeNode key={rootNode.organismId} node={rootNode} />
          ))}
          {treeData.length === 0 && (
            <div style={{ textAlign: 'center', color: '#999', padding: '2rem' }}>No data available.</div>
          )}
        </div>
      )}
    </div>
  );
};

export default TaxonomyTree;

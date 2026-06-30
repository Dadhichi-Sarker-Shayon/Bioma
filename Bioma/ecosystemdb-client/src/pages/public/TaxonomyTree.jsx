import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, ChevronDown } from 'lucide-react';

const TaxonomyTreeNode = ({ node, level = 0 }) => {
  const [expanded, setExpanded] = useState(level < 1); // Expand Kingdoms by default

  const hasChildren = node.children && node.children.length > 0;

  const getRankColor = (rank) => {
    switch (rank) {
      case 'Kingdom': return '#f59e0b';
      case 'Phylum': return '#10b981';
      case 'Class': return '#3b82f6';
      case 'Order': return '#8b5cf6';
      case 'Family': return '#ec4899';
      case 'Genus': return '#06b6d4';
      case 'Species': return 'var(--accent-primary)';
      default: return 'var(--text-secondary)';
    }
  };

  return (
    <div style={{ marginLeft: level > 0 ? '20px' : '0' }}>
      <div 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem', 
          padding: '0.5rem', 
          borderRadius: 'var(--radius-md)',
          cursor: hasChildren ? 'pointer' : 'default',
          transition: 'var(--transition)',
          background: 'rgba(255,255,255,0.02)',
          marginBottom: '2px',
          borderLeft: `3px solid ${getRankColor(node.rankName)}`
        }}
        onClick={() => hasChildren && setExpanded(!expanded)}
        onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
        onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
      >
        <div style={{ width: '20px', display: 'flex', justifyContent: 'center' }}>
          {hasChildren ? (
            expanded ? <ChevronDown size={16} color="var(--text-secondary)" /> : <ChevronRight size={16} color="var(--text-secondary)" />
          ) : <div style={{ width: '16px' }} />}
        </div>
        
        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: getRankColor(node.rankName), textTransform: 'uppercase', minWidth: '65px' }}>
          {node.rankName}
        </span>
        
        <span style={{ fontStyle: 'italic', color: 'var(--text-primary)', fontWeight: node.rankName === 'Kingdom' ? 600 : 400 }}>
          {node.scientificName}
        </span>
        
        {node.commonName && (
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            ({node.commonName})
          </span>
        )}

        {node.rankName === 'Species' && (
          <Link 
            to={`/encyclopedia/${node.organismId}`} 
            style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--accent-primary)', textDecoration: 'none', padding: '0.2rem 0.5rem', border: '1px solid var(--accent-primary)', borderRadius: '1rem' }}
            onClick={(e) => e.stopPropagation()}
          >
            View Profile
          </Link>
        )}
      </div>

      {expanded && hasChildren && (
        <div style={{ paddingLeft: '8px', borderLeft: '1px dashed var(--border-color)', marginLeft: '12px', marginTop: '4px', marginBottom: '8px' }}>
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
        const res = await fetch('http://localhost:5086/api/taxonomy/tree');
        if (res.ok) {
          const flatData = await res.json();
          setTreeData(buildTree(flatData));
        } else {
          setError('Failed to fetch taxonomy data.');
        }
      } catch (err) {
        setError('Network error occurred.');
      } finally {
        setLoading(false);
      }
    };
    fetchTree();
  }, []);

  // Build recursive tree from flat list based on parentId
  const buildTree = (data) => {
    const map = new Map();
    const roots = [];

    // Initialize nodes
    data.forEach(item => {
      map.set(item.organismId, { ...item, children: [] });
    });

    // Link parents to children
    data.forEach(item => {
      const node = map.get(item.organismId);
      if (item.parentId) {
        const parent = map.get(item.parentId);
        if (parent) {
          parent.children.push(node);
        } else {
          roots.push(node); // Fallback if parent missing
        }
      } else {
        roots.push(node);
      }
    });

    return roots;
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 2rem' }}>
      <div className="page-header" style={{ marginBottom: '3rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Taxonomy Tree</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Explore the hierarchical classification of all organisms in the Bioma database.</p>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-secondary)' }}>
          Building taxonomy tree...
        </div>
      ) : error ? (
        <div className="badge badge-danger">{error}</div>
      ) : (
        <div className="glass-panel" style={{ padding: '2rem' }}>
          {treeData.map(rootNode => (
            <TaxonomyTreeNode key={rootNode.organismId} node={rootNode} />
          ))}
          {treeData.length === 0 && (
            <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>
              No taxonomic data available.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TaxonomyTree;

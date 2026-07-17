import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import api from '../../api';

const RANK_COLORS = {
  Kingdom: '#f39c12', Phylum: '#27ae60', Class: '#2980b9',
  Order: '#8e44ad', Family: '#e74c3c', Genus: '#16a085', Species: '#1a3a5c',
};
const STATUS_COLOR = { LC:'#27ae60', NT:'#2ecc71', VU:'#f39c12', EN:'#e67e22', CR:'#e74c3c', EW:'#9b59b6', EX:'#95a5a6' };
const RANKS = ['Kingdom', 'Phylum', 'Class', 'Order', 'Family', 'Genus', 'Species'];

/* ── Lineage Tree: only shows the path + siblings ── */
const LineageTree = ({ path, allData }) => {
  // path = [kingdomId, phylumId, classId, ..., speciesId]
  // For each level, find siblings (other children of the same parent)
  const [expanded, setExpanded] = useState(() => {
    const s = new Set();
    path.forEach(id => s.add(id));
    return s;
  });

  const toggle = (id) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Build lookup maps
  const byId = {};
  allData.forEach(d => { byId[d.organismId] = d; });
  const childrenOf = {};
  allData.forEach(d => {
    if (d.parentId) {
      if (!childrenOf[d.parentId]) childrenOf[d.parentId] = [];
      childrenOf[d.parentId].push(d);
    }
  });

  const pathSet = new Set(path);

  // Render a level: given a parent, show its children
  const renderLevel = (parentId, depth) => {
    const kids = childrenOf[parentId] || [];
    if (kids.length === 0) return null;

    return (
      <div key={`level-${parentId}`} style={{ marginLeft: `${depth * 24}px`, position: 'relative' }}>
        {/* Vertical connector line */}
        {depth > 0 && (
          <div style={{
            position: 'absolute', left: '-13px', top: 0, bottom: '4px',
            width: '1px', background: '#d0d5dd',
          }} />
        )}
        {kids.map((child, i) => {
          const color = RANK_COLORS[child.rankName] || '#666';
          const inPath = pathSet.has(child.organismId);
          const hasKids = (childrenOf[child.organismId] || []).length > 0;
          const isOpen = expanded.has(child.organismId);
          const isLast = i === kids.length - 1;

          return (
            <div key={child.organismId}>
              {/* Horizontal connector + node */}
              <div style={{ display: 'flex', alignItems: 'flex-start', position: 'relative' }}>
                {/* Horizontal arm */}
                {depth > 0 && (
                  <div style={{
                    position: 'absolute', left: '-13px', top: '14px',
                    width: '10px', height: '1px', background: '#d0d5dd',
                  }} />
                )}
                {/* Junction dot */}
                {depth > 0 && (
                  <div style={{
                    position: 'absolute', left: '-16px', top: '11px',
                    width: '7px', height: '7px', borderRadius: '50%',
                    background: inPath ? color : '#d0d5dd',
                    border: `2px solid ${inPath ? color : '#e8eaed'}`,
                  }} />
                )}

                {/* Node card */}
                <div
                  onClick={() => hasKids && toggle(child.organismId)}
                  style={{
                    flex: 1, padding: '0.45rem 0.65rem', borderRadius: '5px',
                    marginBottom: '2px', cursor: hasKids ? 'pointer' : 'default',
                    background: inPath ? `${color}0d` : 'white',
                    border: `1px solid ${inPath ? color + '35' : '#e8eaed'}`,
                    borderLeft: `${inPath ? 3 : 1}px solid ${color}`,
                    transition: 'all 0.15s',
                  }}
                  onMouseOver={(e) => { if (hasKids) e.currentTarget.style.boxShadow = `0 2px 6px ${color}18`; }}
                  onMouseOut={(e) => { e.currentTarget.style.boxShadow = 'none'; }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    {hasKids && (
                      <span style={{ fontSize: '0.55rem', color: '#bbb', width: '10px' }}>
                        {isOpen ? '▼' : '▶'}
                      </span>
                    )}
                    {!hasKids && <span style={{ width: '10px', fontSize: '0.5rem', color: '#ddd' }}>•</span>}
                    <span style={{
                      fontSize: '0.5rem', fontWeight: 700, padding: '0.08rem 0.35rem',
                      borderRadius: '3px', background: `${color}15`, color,
                      textTransform: 'uppercase', minWidth: '48px', textAlign: 'center',
                    }}>
                      {child.rankName}
                    </span>
                    <span style={{
                      fontStyle: 'italic', fontWeight: inPath ? 600 : 400,
                      color: inPath ? color : '#1a1a1a', fontSize: '0.85rem',
                    }}>
                      {child.scientificName}
                    </span>
                    {child.commonName && (
                      <span style={{ color: '#999', fontSize: '0.75rem' }}>({child.commonName})</span>
                    )}
                    {child.conservationStatus && (
                      <span style={{
                        fontSize: '0.5rem', fontWeight: 700, padding: '0.05rem 0.25rem',
                        borderRadius: '3px', color: STATUS_COLOR[child.conservationStatus] || '#999',
                        background: (STATUS_COLOR[child.conservationStatus] || '#999') + '12',
                      }}>
                        {child.conservationStatus}
                      </span>
                    )}
                    {child.rankName === 'Species' && (
                      <Link to={`/encyclopedia/${child.organismId}`}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          marginLeft: 'auto', fontSize: '0.6rem', color: '#2980b9',
                          textDecoration: 'none', padding: '0.1rem 0.4rem',
                          border: '1px solid #2980b9', borderRadius: '3px', fontWeight: 500,
                        }}
                      >View</Link>
                    )}
                  </div>
                </div>
              </div>

              {/* Children of this node (only if in path or expanded) */}
              {isOpen && hasKids && (
                <div style={{ marginLeft: '12px' }}>
                  {renderLevel(child.organismId, depth + 1)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // Start from the first node in the path (kingdom)
  const rootId = path[0];
  const root = byId[rootId];

  return (
    <div>
      {/* Root node */}
      {root && (() => {
        const color = RANK_COLORS[root.rankName] || '#666';
        return (
          <div style={{ padding: '0.45rem 0.65rem', borderRadius: '5px', marginBottom: '4px',
            background: `${color}0d`, border: `1px solid ${color}35`, borderLeft: `3px solid ${color}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ fontSize: '0.5rem', fontWeight: 700, padding: '0.08rem 0.35rem',
                borderRadius: '3px', background: `${color}15`, color, textTransform: 'uppercase',
                minWidth: '48px', textAlign: 'center',
              }}>
                {root.rankName}
              </span>
              <span style={{ fontStyle: 'italic', fontWeight: 600, color, fontSize: '0.9rem' }}>
                {root.scientificName}
              </span>
              {root.commonName && <span style={{ color: '#999', fontSize: '0.8rem' }}>({root.commonName})</span>}
            </div>
          </div>
        );
      })()}

      {/* Children from root */}
      {renderLevel(rootId, 0)}
    </div>
  );
};

/* ── Main Page ── */
const TaxonomyTree = () => {
  const [allData, setAllData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [showDD, setShowDD] = useState(false);
  const [picked, setPicked] = useState(null);
  const [lineagePath, setLineagePath] = useState([]);
  const ref = useRef(null);

  useEffect(() => {
    api.get('/taxonomy/tree').then(r => setAllData(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setShowDD(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const onSearch = (q) => {
    setQuery(q);
    if (!q.trim()) { setResults([]); setShowDD(false); return; }
    const l = q.toLowerCase();
    setResults(allData.filter(d =>
      (d.scientificName || '').toLowerCase().includes(l) ||
      (d.commonName || '').toLowerCase().includes(l)
    ).slice(0, 15));
    setShowDD(true);
  };

  const pick = (org) => {
    setPicked(org);
    setQuery(org.commonName || org.scientificName);
    setShowDD(false);
  };

  const explore = () => {
    if (!picked) return;

    // Walk from selected organism up to root
    const path = [];
    const byId = {};
    allData.forEach(d => { byId[d.organismId] = d; });

    let cur = picked;
    while (cur) {
      path.unshift(cur.organismId);
      cur = cur.parentId ? byId[cur.parentId] : null;
    }
    setLineagePath(path);
  };

  const reset = () => {
    setPicked(null);
    setQuery('');
    setLineagePath([]);
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem' }}>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>Taxonomy Tree</h1>
      <p style={{ color: '#777', marginBottom: '1.5rem' }}>
        Search for any organism, then explore its full taxonomic lineage from Kingdom to Species.
      </p>

      {/* ── Search + Button ── */}
      <div style={{
        background: 'white', border: '1px solid #dde1e6', borderRadius: '8px',
        padding: '1rem 1.25rem', marginBottom: '1.5rem',
      }}>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div ref={ref} style={{ flex: 1, position: 'relative' }}>
            <Search size={16} color="#999" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search by common or scientific name..."
              value={query}
              onChange={e => onSearch(e.target.value)}
              onFocus={() => results.length && setShowDD(true)}
              style={{
                width: '100%', padding: '0.625rem 0.75rem 0.625rem 2.25rem',
                borderRadius: '6px', border: '2px solid #dde1e6', fontSize: '0.9rem', outline: 'none',
              }}
              onFocusCapture={e => e.target.style.borderColor = '#2980b9'}
              onBlurCapture={e => e.target.style.borderColor = '#dde1e6'}
            />
            {showDD && (
              <div style={{
                position: 'absolute', top: '100%', left: 0, right: 0,
                background: 'white', border: '1px solid #dde1e6', borderRadius: '6px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.12)', zIndex: 50,
                maxHeight: '240px', overflowY: 'auto', marginTop: '4px',
              }}>
                {results.map(item => (
                  <div key={item.organismId} onClick={() => pick(item)}
                    style={{
                      padding: '0.5rem 0.75rem', cursor: 'pointer',
                      borderBottom: '1px solid #f0f2f5', display: 'flex', alignItems: 'center', gap: '0.5rem',
                    }}
                    onMouseOver={e => e.currentTarget.style.background = '#f8f9fa'}
                    onMouseOut={e => e.currentTarget.style.background = 'white'}
                  >
                    <span style={{
                      fontSize: '0.5rem', fontWeight: 700, padding: '0.1rem 0.3rem',
                      borderRadius: '3px', background: `${RANK_COLORS[item.rankName] || '#666'}15`,
                      color: RANK_COLORS[item.rankName] || '#666', minWidth: '48px', textAlign: 'center',
                    }}>
                      {item.rankName}
                    </span>
                    <span style={{ fontStyle: 'italic', fontSize: '0.85rem' }}>{item.scientificName}</span>
                    {item.commonName && <span style={{ color: '#999', fontSize: '0.8rem' }}>{item.commonName}</span>}
                    <span style={{ marginLeft: 'auto', fontSize: '0.6rem', color: '#bbb' }}>{item.kingdomType}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button onClick={explore} disabled={!picked}
            style={{
              padding: '0.625rem 1.5rem', borderRadius: '6px', border: 'none',
              background: picked ? '#2980b9' : '#ccc', color: 'white',
              fontWeight: 600, fontSize: '0.85rem', cursor: picked ? 'pointer' : 'not-allowed',
              whiteSpace: 'nowrap',
            }}
          >Explore Tree</button>

          {lineagePath.length > 0 && (
            <button onClick={reset}
              style={{
                padding: '0.625rem 1rem', borderRadius: '6px', border: '1px solid #dde1e6',
                background: 'white', color: '#666', fontSize: '0.85rem', cursor: 'pointer',
              }}
            >Reset</button>
          )}
        </div>

        {picked && (
          <div style={{ marginTop: '0.625rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', color: '#888' }}>Selected:</span>
            <span style={{
              padding: '0.2rem 0.6rem', borderRadius: '4px',
              background: `${RANK_COLORS[picked.rankName] || '#666'}10`,
              border: `1px solid ${RANK_COLORS[picked.rankName] || '#ddd'}30`,
              fontSize: '0.8rem',
            }}>
              <span style={{ fontSize: '0.55rem', fontWeight: 700, color: RANK_COLORS[picked.rankName], textTransform: 'uppercase' }}>
                {picked.rankName}
              </span>
              {' '}<span style={{ fontStyle: 'italic' }}>{picked.scientificName}</span>
              {picked.commonName && <span style={{ color: '#888' }}> ({picked.commonName})</span>}
            </span>
          </div>
        )}
      </div>

      {/* ── Tree ── */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#999' }}>Loading organisms...</div>
      ) : lineagePath.length > 0 ? (
        <div style={{
          background: 'white', border: '1px solid #dde1e6', borderRadius: '8px',
          padding: '1.25rem',
        }}>
          {/* Header */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid #e8eaed',
          }}>
            <div>
              <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                {picked.kingdomType === 'Animal' ? '🐾 Animalia' : '🌿 Plantae'}
              </span>
              <span style={{ color: '#999', fontSize: '0.8rem', marginLeft: '0.5rem' }}>
                — Lineage for <em>{picked.scientificName}</em>
              </span>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {RANKS.map(r => (
                <span key={r} style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.65rem', color: '#666' }}>
                  <span style={{ width: '7px', height: '7px', borderRadius: '2px', background: RANK_COLORS[r] }} />
                  {r}
                </span>
              ))}
            </div>
          </div>

          {/* Breadcrumb: Kingdom > Phylum > Class > ... > Species */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.25rem', flexWrap: 'wrap',
            marginBottom: '1rem', padding: '0.625rem 0.75rem',
            background: '#f8f9fa', borderRadius: '6px', border: '1px solid #e8eaed',
          }}>
            <span style={{ fontSize: '0.7rem', color: '#999', marginRight: '0.25rem' }}>Path:</span>
            {lineagePath.map((id, i) => {
              const node = allData.find(d => d.organismId === id);
              if (!node) return null;
              const color = RANK_COLORS[node.rankName] || '#666';
              return (
                <span key={id} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                  {i > 0 && <span style={{ color: '#ccc', fontSize: '0.7rem' }}>/</span>}
                  <span style={{
                    fontSize: '0.5rem', fontWeight: 700, color,
                    textTransform: 'uppercase',
                  }}>
                    {node.rankName}
                  </span>
                  <span style={{
                    fontStyle: 'italic', fontSize: '0.8rem',
                    color: i === lineagePath.length - 1 ? color : '#555',
                    fontWeight: i === lineagePath.length - 1 ? 600 : 400,
                  }}>
                    {node.scientificName}
                  </span>
                </span>
              );
            })}
          </div>

          {/* Interactive tree */}
          <LineageTree path={lineagePath} allData={allData} />
        </div>
      ) : (
        <div style={{
          textAlign: 'center', padding: '4rem 2rem', background: 'white',
          borderRadius: '8px', border: '1px solid #dde1e6',
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🌳</div>
          <h3 style={{ color: '#666', marginBottom: '0.5rem' }}>Search for an organism above</h3>
          <p style={{ color: '#999', fontSize: '0.9rem', maxWidth: '380px', margin: '0 auto', lineHeight: 1.6 }}>
            Type a name, select from the dropdown, and click <strong>Explore Tree</strong> to see the full hierarchy.
          </p>
          <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center', gap: '1.5rem' }}>
            {RANKS.map((r, i) => (
              <div key={r} style={{ textAlign: 'center' }}>
                <div style={{
                  width: '28px', height: '28px', borderRadius: '50%', margin: '0 auto 0.25rem',
                  background: `${RANK_COLORS[r]}15`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.6rem', fontWeight: 700, color: RANK_COLORS[r],
                }}>{i + 1}</div>
                <div style={{ fontSize: '0.6rem', color: '#888' }}>{r}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TaxonomyTree;

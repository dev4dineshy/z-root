import React, { useState } from 'react';
import { AppData } from '../../types';
import { exportCSV } from '../../data/dataService';

export default function ReportsPage({ data }: { data: AppData }) {
  const [filterRegion, setFilterRegion] = useState('');
  const [filterCandidate, setFilterCandidate] = useState('');
  const [filterType, setFilterType] = useState('');

  const filteredCandidates = filterRegion ? data.candidates.filter(c => c.regionId === filterRegion) : data.candidates;

  const filteredPosts = data.posts.filter(p => {
    const matchRegion = !filterRegion || p.regionId === filterRegion || p.regionId === null;
    const matchCandidate = !filterCandidate || (p.ownerType === 'candidate' && p.ownerId === filterCandidate);
    const matchType = !filterType || (filterType === 'posts');
    return matchRegion && matchCandidate && (!filterType || filterType === 'posts');
  });
  const filteredEvents = data.events.filter(e => (!filterRegion || e.regionId === filterRegion || e.regionId === null) && (!filterCandidate || e.candidateId === filterCandidate));
  const filteredUsers = data.accounts.filter(u => u.role === 'user' && (!filterRegion || u.regionId === filterRegion));
  const filteredCampaigns = data.campaigns.filter(c => (!filterRegion || c.regionId === filterRegion) && (!filterCandidate || c.candidateId === filterCandidate));

  const results = filterType === 'users' ? filteredUsers
    : filterType === 'events' ? filteredEvents
    : filterType === 'campaigns' ? filteredCampaigns
    : filteredPosts;

  function handleExport() {
    exportCSV(results, `pc-report-${Date.now()}.csv`);
  }

  const reportTypes = [
    { key: '', label: 'Posts', ico: '📝' },
    { key: 'users', label: 'Users', ico: '👤' },
    { key: 'events', label: 'Events', ico: '📅' },
    { key: 'campaigns', label: 'Campaigns', ico: '📣' },
    { key: 'gallery', label: 'Gallery', ico: '🖼' },
    { key: 'videos', label: 'Videos', ico: '▶' },
    { key: 'activities', label: 'Activities', ico: '⚡' },
  ];

  return (
    <div className="page-body">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <h2 style={{ fontWeight: 800, color: 'var(--navy)', fontSize: 22 }}>Reports</h2>
          <p className="text-muted text-sm">View and analyse activity across your regions and candidates.</p>
        </div>
        <div className="info-box" style={{ fontSize: 12 }}>ⓘ Admin can report across regions and candidates.</div>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: 20 }}>
        <h4 style={{ fontWeight: 700, marginBottom: 12 }}>Filters</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          <div>
            <label>Region</label>
            <select className="input" value={filterRegion} onChange={e => { setFilterRegion(e.target.value); setFilterCandidate(''); }}>
              <option value="">All regions (DEMO DATA)</option>
              {data.regions.map(r => <option key={r.id} value={r.id}>{r.name} (DEMO DATA)</option>)}
            </select>
          </div>
          <div>
            <label>Candidate</label>
            <select className="input" value={filterCandidate} onChange={e => setFilterCandidate(e.target.value)}>
              <option value="">All candidates (DEMO DATA)</option>
              {filteredCandidates.map(c => <option key={c.id} value={c.id}>{c.name} (DEMO DATA)</option>)}
            </select>
          </div>
          <div>
            <label>Report type</label>
            <select className="input" value={filterType} onChange={e => setFilterType(e.target.value)}>
              <option value="">Posts (DEMO DATA)</option>
              <option value="users">Users</option>
              <option value="events">Events</option>
              <option value="campaigns">Campaigns</option>
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button className="btn btn-primary w-full">Apply Filters</button>
          </div>
        </div>
      </div>

      {/* Summary stats */}
      <div className="stat-grid" style={{ marginBottom: 20 }}>
        <div className="stat-card">
          <div className="stat-icon">👤</div>
          <div className="stat-val">{filteredUsers.length}</div>
          <div className="stat-label">Registered Users <span className="demo-badge">DEMO DATA</span></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📝</div>
          <div className="stat-val">{filteredPosts.length}</div>
          <div className="stat-label">Posts <span className="demo-badge">DEMO DATA</span></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-val">{filteredEvents.length}</div>
          <div className="stat-label">Events <span className="demo-badge">DEMO DATA</span></div>
        </div>
      </div>

      {/* Results table */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h4 style={{ fontWeight: 700 }}>Results</h4>
          <button className="btn btn-outline btn-sm" onClick={handleExport}>⬇ Export (DEMO DATA)</button>
        </div>
        <table>
          <thead><tr><th>Title</th><th>Type</th><th>Region</th><th>Candidate</th><th>Status</th><th>Date</th></tr></thead>
          <tbody>
            {(filterType === '' ? filteredPosts : results as any[]).map((item: any, i: number) => {
              const region = data.regions.find(r => r.id === item.regionId);
              const candidate = data.candidates.find(c => c.id === (item.ownerId || item.candidateId));
              return (
                <tr key={item.id || i}>
                  <td>
                    <strong>{item.title || item.name}</strong>
                    <span className="demo-badge" style={{ marginLeft: 6 }}>DEMO DATA</span>
                  </td>
                  <td><span className="tag tag-active">{item.ownerType || filterType || 'post'}</span></td>
                  <td>{region?.name || '—'} {region && <span className="demo-badge">DEMO DATA</span>}</td>
                  <td>{candidate?.name || '—'} {candidate && <span className="demo-badge">DEMO DATA</span>}</td>
                  <td><span className={`tag tag-${item.status || 'active'}`}>{item.status || 'active'}</span></td>
                  <td className="text-muted text-sm">{item.createdAt || item.date}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {results.length === 0 && <p className="text-muted text-sm" style={{ padding: 16 }}>No results for the selected filters.</p>}
        <p className="text-muted text-sm" style={{ marginTop: 8 }}>Showing {results.length} result{results.length !== 1 ? 's' : ''} <span className="demo-badge">DEMO DATA</span></p>
      </div>

      {/* Report type chips */}
      <div className="card">
        <div style={{ fontWeight: 700, marginBottom: 12 }}>Report types</div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {reportTypes.map(rt => (
            <button key={rt.key} className={`btn ${filterType === rt.key ? 'btn-primary' : 'btn-outline'} btn-sm`} onClick={() => setFilterType(rt.key)}>
              {rt.ico} {rt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

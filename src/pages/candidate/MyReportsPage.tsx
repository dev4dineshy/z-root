import React, { useState } from 'react';
import { AppData, Account } from '../../types';
import { exportCSV } from '../../data/dataService';

interface Props { account: Account; data: AppData; }

export default function MyReportsPage({ account, data }: Props) {
  const [filterType, setFilterType] = useState('posts');
  const myPosts = data.posts.filter(p => p.ownerType === 'candidate' && p.ownerId === account.candidateId);
  const myEvents = data.events.filter(e => e.candidateId === account.candidateId);
  const myCampaigns = data.campaigns.filter(c => c.candidateId === account.candidateId);
  const candidate = data.candidates.find(c => c.id === account.candidateId);
  const region = data.regions.find(r => r.id === candidate?.regionId);

  const results = filterType === 'posts' ? myPosts : filterType === 'events' ? myEvents : myCampaigns;

  const totalLikes = myPosts.reduce((s, p) => s + p.metrics.likes, 0);
  const totalComments = myPosts.reduce((s, p) => s + p.metrics.comments, 0);
  const totalReshares = myPosts.reduce((s, p) => s + p.metrics.reshares, 0);

  return (
    <div className="page-body">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <h2 style={{ fontWeight: 800, color: 'var(--navy)', fontSize: 22 }}>My Reports</h2>
          <p className="text-muted text-sm">View activity for your own candidate records only.</p>
        </div>
        <div className="info-box" style={{ fontSize: 12 }}>ⓘ Reports are scoped to {account.name} only.</div>
      </div>

      <div className="stat-grid" style={{ marginBottom: 20 }}>
        <div className="stat-card"><div className="stat-icon">📝</div><div className="stat-val">{myPosts.length}</div><div className="stat-label">Posts <span className="demo-badge">DEMO DATA</span></div></div>
        <div className="stat-card"><div className="stat-icon">❤️</div><div className="stat-val">{totalLikes}</div><div className="stat-label">Total Likes <span className="demo-badge">DEMO DATA</span></div></div>
        <div className="stat-card"><div className="stat-icon">💬</div><div className="stat-val">{totalComments}</div><div className="stat-label">Comments <span className="demo-badge">DEMO DATA</span></div></div>
        <div className="stat-card"><div className="stat-icon">🔁</div><div className="stat-val">{totalReshares}</div><div className="stat-label">Reshares <span className="demo-badge">DEMO DATA</span></div></div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {['posts','events','campaigns'].map(t => (
          <button key={t} className={`btn ${filterType === t ? 'btn-primary' : 'btn-outline'} btn-sm`} onClick={() => setFilterType(t)}>{t}</button>
        ))}
        <button className="btn btn-outline btn-sm" onClick={() => exportCSV(results, `my-report-${account.candidateId}.csv`)}>⬇ Export CSV</button>
      </div>

      <div className="card">
        <table>
          <thead><tr><th>Title</th><th>Status</th><th>Region</th><th>Date</th>{filterType === 'posts' && <><th>Likes</th><th>Comments</th><th>Reshares</th></>}</tr></thead>
          <tbody>
            {(results as any[]).map(item => (
              <tr key={item.id}>
                <td><strong>{item.title}</strong> <span className="demo-badge">DEMO DATA</span></td>
                <td><span className={`tag tag-${item.status || 'active'}`}>{item.status || 'active'}</span></td>
                <td>{region?.name || '—'}</td>
                <td className="text-muted text-sm">{item.createdAt || item.date}</td>
                {filterType === 'posts' && <>
                  <td>{(item as any).metrics?.likes ?? '—'}</td>
                  <td>{(item as any).metrics?.comments ?? '—'}</td>
                  <td>{(item as any).metrics?.reshares ?? '—'}</td>
                </>}
              </tr>
            ))}
          </tbody>
        </table>
        {results.length === 0 && <p className="text-muted text-sm" style={{ padding: 16 }}>No {filterType} yet.</p>}
      </div>
    </div>
  );
}

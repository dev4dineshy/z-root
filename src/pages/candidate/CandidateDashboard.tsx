import React from 'react';
import { AppData, Account } from '../../types';

interface Props { account: Account; data: AppData; setData: (d: AppData) => void; setPage: (p: string) => void; }

export default function CandidateDashboard({ account, data, setPage }: Props) {
  const candidate = data.candidates.find(c => c.id === account.candidateId);
  const region = data.regions.find(r => r.id === candidate?.regionId);
  const myPosts = data.posts.filter(p => p.ownerType === 'candidate' && p.ownerId === account.candidateId);
  const published = myPosts.filter(p => p.status === 'published');
  const drafts = myPosts.filter(p => p.status === 'draft');

  return (
    <div className="page-body">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <p className="text-muted text-sm">Candidate Portal</p>
          <h1 style={{ fontWeight: 800, fontSize: 26, color: 'var(--navy)' }}>My Dashboard</h1>
          <p className="text-muted text-sm">Create and manage your posts, content and channels in one place.</p>
        </div>
        {/* Publishing identity */}
        <div className="card" style={{ minWidth: 220 }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Publishing identity</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--teal)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{account.name[0]}</div>
            <div>
              <div style={{ fontWeight: 600 }}>{account.name}</div>
            </div>
          </div>
          <div className="info-box" style={{ fontSize: 12 }}>Access is limited to your own candidate records.</div>
        </div>
      </div>

      {/* Stats */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-icon">📝</div>
          <div className="stat-val">{myPosts.length}</div>
          <div className="stat-label">My Posts <span className="demo-badge">DEMO DATA</span></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#DCFCE7' }}>✅</div>
          <div className="stat-val">{published.length}</div>
          <div className="stat-label">Published <span className="demo-badge">DEMO DATA</span></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#FEF9C3' }}>📄</div>
          <div className="stat-val">{drafts.length}</div>
          <div className="stat-label">Drafts <span className="demo-badge">DEMO DATA</span></div>
        </div>
      </div>

      <button className="btn btn-primary" style={{ marginBottom: 20 }} onClick={() => setPage('posts')}>+ Create My Post</button>

      {/* Posts table */}
      <div className="card">
        <h3 style={{ fontWeight: 700, marginBottom: 14 }}>My Posts</h3>
        <table>
          <thead><tr><th>Title</th><th>Content type</th><th>Status</th><th>Last updated</th><th>Actions</th></tr></thead>
          <tbody>
            {myPosts.map(p => (
              <tr key={p.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 6, background: 'var(--teal-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>📝</div>
                    <div>
                      <strong>{p.title}</strong>
                      <div className="demo-badge">DEMO DATA</div>
                    </div>
                  </div>
                </td>
                <td>📝 Article</td>
                <td><span className={`tag tag-${p.status}`}>{p.status}</span> <span className="demo-badge">DEMO DATA</span></td>
                <td className="text-muted text-sm">{p.createdAt} <span className="demo-badge">DEMO DATA</span></td>
                <td>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {p.status === 'published' && <button className="btn btn-outline btn-sm">View</button>}
                    <button className="btn btn-outline btn-sm" onClick={() => setPage('posts')}>Edit</button>
                    <span style={{ cursor: 'pointer' }}>⋮</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {myPosts.length === 0 && <p className="text-muted text-sm" style={{ padding: 16 }}>No posts yet. Create your first post.</p>}
        <p className="text-muted text-sm" style={{ marginTop: 8 }}>Showing {myPosts.length} of {myPosts.length} posts <span className="demo-badge">DEMO DATA</span></p>
      </div>
    </div>
  );
}

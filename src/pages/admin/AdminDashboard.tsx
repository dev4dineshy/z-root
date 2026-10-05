import React from 'react';
import { AppData, Account } from '../../types';

interface Props { account: Account; data: AppData; setData: (d: AppData) => void; setPage: (p: string) => void; }

export default function AdminDashboard({ account, data, setData, setPage }: Props) {
  const candidates  = data.candidates;
  const users       = data.accounts.filter(a => a.role === 'user');
  const posts       = data.posts;
  const published   = posts.filter(p => p.status === 'published');
  const drafts      = posts.filter(p => p.status === 'draft');
  const totalLikes  = posts.reduce((s, p) => s + p.metrics.likes, 0);

  const stats = [
    { ico: '👥', val: candidates.length, label: 'Candidates',       bg: '#EEF2FF', ico2: '#6366F1' },
    { ico: '👤', val: users.length,      label: 'Registered Users', bg: '#FEF9E7', ico2: '#D97706' },
    { ico: '✅', val: published.length,  label: 'Published Posts',  bg: 'var(--success-bg)', ico2: 'var(--success)' },
    { ico: '📄', val: drafts.length,     label: 'Draft Posts',      bg: '#F8F0FE', ico2: '#9333EA' },
    { ico: '❤️', val: totalLikes,        label: 'Total Likes',      bg: '#FEF2F2', ico2: '#EF4444' },
    { ico: '📝', val: posts.length,      label: 'Total Posts',      bg: 'var(--teal-light)', ico2: 'var(--teal-dark)' },
  ];

  return (
    <div className="page-body">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--teal)', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 4 }}>
            Admin Dashboard
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--navy)', letterSpacing: -0.5 }}>
            Welcome back, {account.name.split(' ')[0]} 👋
          </h1>
          <p className="text-muted text-sm" style={{ marginTop: 4 }}>
            Here's what's happening across your community portal today.
          </p>
        </div>
        <span className="demo-badge">DEMO DATA</span>
      </div>

      {/* Stat grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
        {stats.map(s => (
          <div key={s.label} className="stat-card">
            <div style={{
              width: 42, height: 42, borderRadius: 11,
              background: s.bg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20, marginBottom: 12,
            }}>{s.ico}</div>
            <div className="stat-val">{s.val}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div style={{
        background: 'linear-gradient(135deg, var(--navy) 0%, var(--navy-mid) 100%)',
        borderRadius: 'var(--radius)', padding: '20px 24px', marginBottom: 24,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ color: '#fff', fontWeight: 700, fontSize: 16, marginBottom: 4 }}>Quick actions</div>
          <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>Jump to common tasks</div>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className="btn btn-sm" onClick={() => setPage('posts')}
            style={{ background: 'rgba(255,255,255,0.12)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }}>
            + Create Post
          </button>
          <button className="btn btn-sm" onClick={() => setPage('candidates')}
            style={{ background: 'rgba(255,255,255,0.12)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }}>
            ⬆ Import Candidates
          </button>
          <button className="btn btn-sm" onClick={() => setPage('party')}
            style={{ background: 'rgba(255,255,255,0.12)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }}>
            🏛️ Edit Party Info
          </button>
          <button className="btn btn-sm" onClick={() => setPage('candidates')}
            style={{ background: 'rgba(255,255,255,0.12)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }}>
            👤 Create Candidate Login
          </button>
        </div>
      </div>

      {/* Two-col layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>

        {/* Recent candidates */}
        <div className="card">
          <div className="section-header">
            <span className="section-title">Recent Candidates</span>
            <button className="btn btn-outline btn-sm" onClick={() => setPage('candidates')}>View all →</button>
          </div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Candidate</th><th>Region</th><th>Access</th></tr></thead>
              <tbody>
                {candidates.map(c => {
                  const acc  = data.accounts.find(a => a.candidateId === c.id && a.role === 'candidate');
                  const region = data.regions.find(r => r.id === c.regionId);
                  return (
                    <tr key={c.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                          <div style={{
                            width: 30, height: 30, borderRadius: '50%',
                            background: 'var(--teal-light)', color: 'var(--teal-dark)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: 700, fontSize: 12, flexShrink: 0,
                          }}>{c.name[0]}</div>
                          <strong style={{ fontSize: 13 }}>{c.name}</strong>
                        </div>
                      </td>
                      <td className="text-sm text-muted">{region?.name}</td>
                      <td>
                        {acc
                          ? <span className="tag tag-published">✓ Enabled</span>
                          : <span className="tag" style={{ background: '#FEE2E2', color: '#991B1B' }}>No login</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent posts */}
        <div className="card">
          <div className="section-header">
            <span className="section-title">Recent Posts</span>
            <button className="btn btn-outline btn-sm" onClick={() => setPage('posts')}>View all →</button>
          </div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Title</th><th>Type</th><th>Status</th></tr></thead>
              <tbody>
                {posts.slice(0, 6).map(p => (
                  <tr key={p.id}>
                    <td className="truncate" style={{ maxWidth: 160, fontSize: 13 }}>
                      <strong>{p.title}</strong>
                    </td>
                    <td>{p.type ? <span className="tag tag-active">{p.type}</span> : '—'}</td>
                    <td><span className={`tag tag-${p.status}`}>{p.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Navigation cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {[
          { key: 'posts',      ico: '📋', label: 'Content Management', sub: 'Manage all posts and content', bg: '#FEF9C3' },
          { key: 'reports',    ico: '📈', label: 'Reports',             sub: 'View engagement & activity',   bg: 'var(--teal-light)' },
          { key: 'candidates', ico: '👥', label: 'Candidates',          sub: 'Manage candidate accounts',    bg: '#EEF2FF' },
        ].map(c => (
          <div key={c.key} className="card" style={{ cursor: 'pointer', transition: 'box-shadow 0.15s, transform 0.15s' }}
            onClick={() => setPage(c.key)}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-sm)'; (e.currentTarget as HTMLElement).style.transform = 'none'; }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 46, height: 46, borderRadius: 12, background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>{c.ico}</div>
              <div>
                <div style={{ fontWeight: 700, marginBottom: 2 }}>{c.label}</div>
                <div className="text-muted text-sm">{c.sub}</div>
                <span style={{ color: 'var(--teal)', fontSize: 12, fontWeight: 600 }}>Open →</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

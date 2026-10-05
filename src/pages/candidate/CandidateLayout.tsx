import React, { useState } from 'react';
import { AppData, Account } from '../../types';
import CandidateDashboard from './CandidateDashboard';
import MyPostsPage from './MyPostsPage';
import MyChannelsPage from './MyChannelsPage';
import MyReportsPage from './MyReportsPage';
import { clearSession } from '../../data/dataService';

interface Props { account: Account; data: AppData; setData: (d: AppData) => void; onLogout: () => void; }

const NAV = [
  { key: 'dashboard', label: 'My Dashboard', ico: '📊' },
  { key: 'posts',     label: 'My Posts',     ico: '📝' },
  { key: 'channels',  label: 'My Channels',  ico: '📡' },
  { key: 'reports',   label: 'My Reports',   ico: '📈' },
];

export default function CandidateLayout({ account, data, setData, onLogout }: Props) {
  const [page, setPage] = useState('dashboard');
  const candidate = data.candidates.find(c => c.id === account.candidateId);
  const region    = data.regions.find(r => r.id === candidate?.regionId);

  function handleLogout() { clearSession(); onLogout(); }

  const currentNav = NAV.find(n => n.key === page);

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>

      {/* ── Sidebar ── */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 9,
              background: 'linear-gradient(135deg, var(--teal) 0%, #0ab3c2 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ color: '#fff', fontWeight: 800, fontSize: 12, letterSpacing: -0.5 }}>PC</span>
            </div>
            <span className="sidebar-logo-wordmark">PeopleConnect</span>
          </div>
          <span className="sidebar-logo-sub">Candidate Portal</span>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-section-label">Navigation</div>
          {NAV.map(n => (
            <button
              key={n.key}
              className={`sidebar-item ${page === n.key ? 'active' : ''}`}
              onClick={() => setPage(n.key)}
            >
              <span className="ico">{n.ico}</span>
              {n.label}
            </button>
          ))}
        </nav>

        {/* Region badge */}
        {region && (
          <div style={{ padding: '10px 18px' }}>
            <div style={{
              background: 'rgba(13,157,170,0.15)', border: '1px solid rgba(13,157,170,0.25)',
              borderRadius: 8, padding: '8px 12px',
            }}>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>Your Region</div>
              <div style={{ color: 'var(--teal)', fontSize: 13, fontWeight: 600 }}>{region.name}</div>
            </div>
          </div>
        )}

        {/* User + logout */}
        <div className="sidebar-footer">
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 12 }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--teal) 0%, var(--navy-mid) 100%)',
              color: '#fff', fontWeight: 700, fontSize: 13,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>{account.name[0]}</div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ color: '#fff', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{account.name}</div>
              <div style={{ color: 'var(--teal)', fontSize: 11 }}>Candidate</div>
            </div>
          </div>
          <button
            className="sidebar-item"
            onClick={handleLogout}
            style={{ color: '#F87171', padding: '8px 0', width: '100%' }}
          >
            <span className="ico">🚪</span> Sign out
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="main-content" style={{ display: 'flex', flexDirection: 'column' }}>
        <div className="topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 20 }}>{currentNav?.ico}</span>
            <span className="topbar-title">{currentNav?.label}</span>
          </div>
          <div className="topbar-user">
            <span className="demo-badge">DEMO DATA</span>
            <div className="topbar-avatar">{account.name[0]}</div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 13, lineHeight: 1.3 }}>{account.name}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{region?.name}</div>
            </div>
          </div>
        </div>

        <div style={{ flex: 1, overflow: 'auto' }}>
          {page === 'dashboard' && <CandidateDashboard account={account} data={data} setData={setData} setPage={setPage} />}
          {page === 'posts'     && <MyPostsPage         account={account} data={data} setData={setData} />}
          {page === 'channels'  && <MyChannelsPage      account={account} data={data} setData={setData} />}
          {page === 'reports'   && <MyReportsPage       account={account} data={data} />}
        </div>
      </div>
    </div>
  );
}

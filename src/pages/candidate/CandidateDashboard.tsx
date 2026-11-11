import React from 'react';
import { Account, AppData } from '../../types';

interface Props {
  account: Account;
  data: AppData;
  setData: (data: AppData) => void;
  setPage: (page: string) => void;
}

export default function CandidateDashboard({ account, data, setPage }: Props) {
  const report = data.candidateReport;
  const stats = [
    { label: 'My Posts', value: report?.posts, page: 'posts' },
    { label: 'My Channels', value: report?.channels, page: 'channels' },
    { label: 'Followers', value: report?.followers, page: 'reports' },
  ];

  return (
    <div className="page-body">
      <div style={{ marginBottom: 24 }}>
        <p className="text-muted text-sm">Candidate Portal</p>
        <h1 style={{ fontWeight: 800, fontSize: 26, color: 'var(--navy)' }}>Welcome, {account.name}</h1>
        <p className="text-muted text-sm">Detailed records load only when you open their section.</p>
      </div>

      <div className="stat-grid">
        {stats.map(stat => (
          <button key={stat.label} className="stat-card" onClick={() => setPage(stat.page)} style={{ textAlign: 'left', cursor: 'pointer', border: 0 }}>
            <div className="stat-val">{stat.value ?? '—'}</div>
            <div className="stat-label">{stat.label}</div>
            <div style={{ color: 'var(--teal)', fontSize: 12, fontWeight: 600, marginTop: 8 }}>Open section →</div>
          </button>
        ))}
      </div>

      <button className="btn btn-primary" style={{ marginTop: 20 }} onClick={() => setPage('posts')}>
        Create My Post
      </button>
    </div>
  );
}

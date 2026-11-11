import React from 'react';
import { Account, AppData } from '../../types';

interface Props {
  account: Account;
  data: AppData;
  setData: (data: AppData) => void;
  setPage: (page: string) => void;
}

export default function AdminDashboard({ account, data, setPage }: Props) {
  const report = data.adminReport;
  const stats = [
    { value: report?.candidates, label: 'Candidates', page: 'candidates' },
    { value: report?.users, label: 'Registered Users', page: 'users' },
    { value: report?.posts, label: 'Posts', page: 'posts' },
    { value: report?.complaints, label: 'Complaints', page: 'reports' },
    { value: report?.feedback, label: 'Feedback', page: 'reports' },
  ];

  return (
    <div className="page-body">
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--teal)', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 4 }}>
          Admin Dashboard
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--navy)', letterSpacing: -0.5 }}>
          Welcome back, {account.name.split(' ')[0]}
        </h1>
        <p className="text-muted text-sm" style={{ marginTop: 4 }}>
          Detailed records load only when you open their section.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
        {stats.map(stat => (
          <button key={stat.label} className="stat-card" onClick={() => setPage(stat.page)} style={{ textAlign: 'left', cursor: 'pointer', border: 0 }}>
            <div className="stat-val">{stat.value ?? '—'}</div>
            <div className="stat-label">{stat.label}</div>
            <div style={{ color: 'var(--teal)', fontSize: 12, fontWeight: 600, marginTop: 8 }}>Open section →</div>
          </button>
        ))}
      </div>

      <div className="card">
        <h3 style={{ fontWeight: 700, marginBottom: 12 }}>Quick actions</h3>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={() => setPage('posts')}>Create Post</button>
          <button className="btn btn-secondary" onClick={() => setPage('candidates')}>Manage Candidates</button>
          <button className="btn btn-outline" onClick={() => setPage('party')}>Edit Party Info</button>
          <button className="btn btn-outline" onClick={() => setPage('users')}>View Users</button>
        </div>
      </div>
    </div>
  );
}

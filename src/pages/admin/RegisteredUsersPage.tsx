import React from 'react';
import { AppData } from '../../types';

export default function RegisteredUsersPage({ data }: { data: AppData }) {
  const users = data.accounts.filter(a => a.role === 'user');
  return (
    <div className="page-body">
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontWeight: 800, color: 'var(--navy)', fontSize: 22 }}>Registered Users</h2>
        <p className="text-muted text-sm">Registration details, saved region/candidate and relevant activity.</p>
      </div>
      <div className="card">
        <table>
          <thead><tr><th>Name</th><th>Email</th><th>Region</th><th>Candidate</th><th>Activity</th></tr></thead>
          <tbody>
            {users.map(u => {
              const region = data.regions.find(r => r.id === u.regionId);
              const candidate = data.candidates.find(c => c.id === u.candidateId);
              const notifCount = data.notifications.filter(n => n.regionId === u.regionId).length;
              return (
                <tr key={u.id}>
                  <td><strong>{u.name}</strong></td>
                  <td>{u.email}</td>
                  <td>{region?.name || <em className="text-muted">Not set</em>}</td>
                  <td>{candidate?.name || <em className="text-muted">Not set</em>}</td>
                  <td className="text-muted text-sm">🔔 {notifCount} notification{notifCount !== 1 ? 's' : ''}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {users.length === 0 && <p className="text-muted text-sm" style={{ padding: 16 }}>No registered users.</p>}
      </div>
    </div>
  );
}

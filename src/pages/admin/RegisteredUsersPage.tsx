import React from 'react';
import { AppData } from '../../types';

export default function RegisteredUsersPage({ data }: { data: AppData }) {
  const users = data.accounts.filter(account => account.role === 'user');

  return (
    <div className="page-body">
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontWeight: 800, color: 'var(--navy)', fontSize: 22 }}>Registered Users</h2>
        <p className="text-muted text-sm">Registration details and saved preferences.</p>
      </div>
      <div className="card">
        <table>
          <thead><tr><th>Name</th><th>Email</th><th>Region</th><th>Candidate</th></tr></thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td><strong>{user.name}</strong></td>
                <td>{user.email}</td>
                <td>{user.regionName || <em className="text-muted">Not set</em>}</td>
                <td>{user.candidateName || <em className="text-muted">Not set</em>}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && <p className="text-muted text-sm" style={{ padding: 16 }}>No registered users.</p>}
      </div>
    </div>
  );
}

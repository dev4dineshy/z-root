import React, { useState } from 'react';
import { AppData, Account, Channel } from '../../types';
import { saveData } from '../../data/dataService';

interface Props { account: Account; data: AppData; setData: (d: AppData) => void; }

const PLATFORMS: Channel['platform'][] = ['facebook', 'youtube', 'x'];
const platIcon = (p: string) => p === 'facebook' ? '𝗳 Facebook' : p === 'youtube' ? '▶ YouTube' : 'X (Twitter)';

export default function MyChannelsPage({ account, data, setData }: Props) {
  const myChannels = data.channels.filter(c => c.ownerType === 'candidate' && c.ownerId === account.candidateId);
  const [form, setForm] = useState({ platform: 'facebook' as Channel['platform'], label: '' });
  const [msg, setMsg] = useState('');

  function addChannel() {
    if (!form.label.trim()) return setMsg('Label required');
    const nc: Channel = { id: 'ch' + Date.now(), ownerType: 'candidate', ownerId: account.candidateId!, platform: form.platform, label: form.label.trim(), connected: false };
    const updated = { ...data, channels: [...data.channels, nc] };
    saveData(updated); setData(updated);
    setMsg(`Channel "${nc.label}" added (DEMO — not actually connected).`);
    setForm({ platform: 'facebook', label: '' });
  }

  function toggleConnect(id: string) {
    const updated = { ...data, channels: data.channels.map(c => c.id === id ? { ...c, connected: !c.connected } : c) };
    saveData(updated); setData(updated);
  }

  return (
    <div className="page-body">
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontWeight: 800, color: 'var(--navy)', fontSize: 22 }}>My Channels</h2>
        <p className="text-muted text-sm">Manage your own linked social channels. Publishing via these channels is simulated in this demo.</p>
      </div>

      <div className="info-box" style={{ marginBottom: 16 }}>ⓘ  Actual channel integration depends on platform APIs and permissions. This is a demo simulation.</div>
      {msg && <div className="success-box">{msg}</div>}

      {/* Add channel */}
      <div className="card" style={{ marginBottom: 20 }}>
        <h4 style={{ fontWeight: 700, marginBottom: 12 }}>Add Channel</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr auto', gap: 12, alignItems: 'flex-end' }}>
          <div>
            <label>Platform</label>
            <select className="input" value={form.platform} onChange={e => setForm(f => ({ ...f, platform: e.target.value as any }))}>
              {PLATFORMS.map(p => <option key={p} value={p}>{platIcon(p)}</option>)}
            </select>
          </div>
          <div>
            <label>Channel label</label>
            <input className="input" value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))} placeholder="e.g. Alex Sample Facebook" />
          </div>
          <button className="btn btn-primary" onClick={addChannel}>Add</button>
        </div>
      </div>

      {/* Channels list */}
      <div className="card">
        <table>
          <thead><tr><th>Platform</th><th>Label</th><th>Status</th><th>Action</th></tr></thead>
          <tbody>
            {myChannels.map(ch => (
              <tr key={ch.id}>
                <td>{platIcon(ch.platform)}</td>
                <td><strong>{ch.label}</strong> <span className="demo-badge">DEMO DATA</span></td>
                <td>
                  {ch.connected
                    ? <span className="tag tag-active">✓ Connected (Demo)</span>
                    : <span className="tag" style={{ background: '#FEF9C3', color: '#92400E' }}>Not connected</span>}
                </td>
                <td>
                  <button className="btn btn-outline btn-sm" onClick={() => toggleConnect(ch.id)}>
                    {ch.connected ? 'Disconnect (Demo)' : 'Connect (Demo)'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {myChannels.length === 0 && <p className="text-muted text-sm" style={{ padding: 16 }}>No channels yet.</p>}
      </div>
    </div>
  );
}

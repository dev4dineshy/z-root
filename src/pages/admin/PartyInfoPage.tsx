import React, { useState } from 'react';
import { AppData, Account } from '../../types';
import { saveData } from '../../data/dataService';

interface Props { account: Account; data: AppData; setData: (d: AppData) => void; }

export default function PartyInfoPage({ account, data, setData }: Props) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(data.party.name);
  const [about, setAbout] = useState(data.party.about);
  const [manifesto, setManifesto] = useState(data.party.manifesto.join('\n'));
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  function handleEdit() {
    setName(data.party.name);
    setAbout(data.party.about);
    setManifesto(data.party.manifesto.join('\n'));
    setEditing(true);
    setSuccess('');
    setError('');
  }

  function handleSave() {
    setError('');
    if (!name.trim()) return setError('Party name is required.');
    if (!about.trim()) return setError('About text is required.');
    const manifestoItems = manifesto.split('\n').map(s => s.trim()).filter(Boolean);
    if (manifestoItems.length === 0) return setError('At least one manifesto point is required.');
    const updated = {
      ...data,
      party: { ...data.party, name: name.trim(), about: about.trim(), manifesto: manifestoItems },
    };
    saveData(updated);
    setData(updated);
    setEditing(false);
    setSuccess('Party information updated successfully.');
  }

  const party = data.party;

  return (
    <div className="page-body">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <h2 style={{ fontWeight: 800, color: 'var(--navy)', fontSize: 22 }}>Party Information</h2>
          <p className="text-muted text-sm">View and edit the party name, about text, and manifesto. Changes are reflected in the mobile app seed data.</p>
        </div>
        {!editing && (
          <button className="btn btn-primary" onClick={handleEdit}>✏️ Edit Party Info</button>
        )}
      </div>

      {success && <div className="success-box">{success}</div>}

      {editing ? (
        <div className="card" style={{ maxWidth: 680 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Edit Party Information</h3>
          {error && <div className="error-box">{error}</div>}

          <div className="form-group">
            <label>Party name</label>
            <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="Party name" />
          </div>

          <div className="form-group">
            <label>About the party</label>
            <textarea className="input" rows={5} value={about} onChange={e => setAbout(e.target.value)} placeholder="Describe the party's mission and focus…" />
            <div className="text-muted text-sm" style={{ textAlign: 'right', marginTop: 2 }}>{about.length} chars</div>
          </div>

          <div className="form-group">
            <label>Manifesto points <span className="text-muted text-sm">(one per line)</span></label>
            <textarea className="input" rows={7} value={manifesto} onChange={e => setManifesto(e.target.value)} placeholder={'Education access\nCommunity health\nPublic infrastructure'} />
            <div className="text-muted text-sm" style={{ marginTop: 2 }}>
              {manifesto.split('\n').filter(s => s.trim()).length} points
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-primary" onClick={handleSave}>Save Changes</button>
            <button className="btn btn-outline" onClick={() => setEditing(false)}>Cancel</button>
          </div>
        </div>
      ) : (
        <>
          {/* Party overview card */}
          <div className="card" style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: 'var(--teal)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: '#fff', fontWeight: 800, fontSize: 18 }}>PC</span>
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 20, color: 'var(--navy)' }}>{party.name}</div>
                <span className="demo-badge">DEMO DATA</span>
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontWeight: 700, marginBottom: 6, color: 'var(--navy)' }}>About</div>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.7 }}>{party.about}</p>
            </div>
          </div>

          {/* Manifesto card */}
          <div className="card" style={{ marginBottom: 20 }}>
            <div style={{ fontWeight: 700, marginBottom: 14, color: 'var(--navy)' }}>
              Manifesto Points <span className="demo-badge" style={{ marginLeft: 8 }}>DEMO DATA</span>
            </div>
            <ol style={{ paddingLeft: 20, lineHeight: 2 }}>
              {party.manifesto.map((item, i) => (
                <li key={i} style={{ color: 'var(--navy)' }}>
                  <span style={{ fontWeight: 600 }}>{item}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Manifesto detail items */}
          {data.manifesto_items && data.manifesto_items.length > 0 && (
            <div className="card">
              <div style={{ fontWeight: 700, marginBottom: 14, color: 'var(--navy)' }}>
                Manifesto Detail Items <span className="demo-badge" style={{ marginLeft: 8 }}>DEMO DATA</span>
              </div>
              <table>
                <thead>
                  <tr><th>Icon</th><th>Title</th><th>Category</th><th>Description</th></tr>
                </thead>
                <tbody>
                  {data.manifesto_items.map(m => (
                    <tr key={m.id}>
                      <td style={{ fontSize: 20 }}>{m.icon}</td>
                      <td><strong>{m.title}</strong></td>
                      <td><span className="tag tag-active">{m.category}</span></td>
                      <td className="text-muted text-sm">{m.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}

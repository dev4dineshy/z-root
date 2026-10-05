import React, { useState } from 'react';
import { AppData, Account, Post } from '../../types';
import { saveData } from '../../data/dataService';

interface Props { account: Account; data: AppData; setData: (d: AppData) => void; }

export default function MyPostsPage({ account, data, setData }: Props) {
  const myPosts = data.posts.filter(p => p.ownerType === 'candidate' && p.ownerId === account.candidateId);
  const myChannels = data.channels.filter(c => c.ownerType === 'candidate' && c.ownerId === account.candidateId);

  const [showComposer, setShowComposer] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
  const [status, setStatus] = useState<'draft' | 'published'>('published');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  function handlePublish() {
    setError('');
    if (!title.trim()) return setError('Title required');
    if (!body.trim()) return setError('Body required');
    const candidate = data.candidates.find(c => c.id === account.candidateId);
    const newPost: Post = {
      id: 'p' + Date.now(), ownerType: 'candidate', ownerId: account.candidateId!,
      regionId: candidate?.regionId || null, title: title.trim(), body: body.trim(),
      status, channelIds: selectedChannels, originalPostUrl: null,
      metrics: { likes: 0, comments: 0, reshares: 0 }, createdAt: new Date().toISOString().split('T')[0],
    };
    const updated = { ...data, posts: [...data.posts, newPost] };
    saveData(updated); setData(updated);
    setSuccess(`Post "${newPost.title}" saved. (DEMO)`);
    setTitle(''); setBody(''); setSelectedChannels([]); setShowComposer(false);
  }

  return (
    <div className="page-body">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h2 style={{ fontWeight: 800, color: 'var(--navy)', fontSize: 22 }}>My Posts</h2>
          <p className="text-muted text-sm">Create and manage your own posts only.</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setShowComposer(true); setSuccess(''); setError(''); }}>+ Create My Post</button>
      </div>

      {success && <div className="success-box">{success}</div>}

      {showComposer && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 style={{ fontWeight: 700 }}>Create Post</h3>
            <button className="btn btn-outline btn-sm" onClick={() => setShowComposer(false)}>✕</button>
          </div>
          {error && <div className="error-box">{error}</div>}
          <div className="form-group"><label>Post title</label><input className="input" value={title} onChange={e => setTitle(e.target.value)} placeholder="Community update…" /></div>
          <div className="form-group">
            <label>Content</label>
            <textarea className="input" rows={4} value={body} onChange={e => setBody(e.target.value)} placeholder="Share your update with your region…" />
          </div>
          <div className="form-group">
            <label>Channels (your channels only)</label>
            {myChannels.length === 0
              ? <p className="text-muted text-sm">No channels linked. Add them in My Channels.</p>
              : myChannels.map(ch => (
                <label key={ch.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, cursor: 'pointer' }}>
                  <input type="checkbox" checked={selectedChannels.includes(ch.id)} onChange={() => setSelectedChannels(cs => cs.includes(ch.id) ? cs.filter(x => x !== ch.id) : [...cs, ch.id])} />
                  {ch.label} ({ch.platform}) <span className="demo-badge">DEMO DATA</span>
                </label>
              ))
            }
          </div>
          <div className="form-group">
            <label>Status</label>
            <select className="input" value={status} onChange={e => setStatus(e.target.value as any)}>
              <option value="published">Publish now</option>
              <option value="draft">Save as draft</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-primary" onClick={handlePublish}>Publish</button>
            <button className="btn btn-outline" onClick={() => setShowComposer(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div className="card">
        <table>
          <thead><tr><th>Title</th><th>Status</th><th>Channels</th><th>Metrics</th><th>Date</th></tr></thead>
          <tbody>
            {myPosts.map(p => (
              <tr key={p.id}>
                <td><strong>{p.title}</strong></td>
                <td><span className={`tag tag-${p.status}`}>{p.status}</span></td>
                <td>{p.channelIds.length}</td>
                <td className="text-muted text-sm">❤️{p.metrics.likes} 💬{p.metrics.comments} 🔁{p.metrics.reshares}</td>
                <td className="text-muted text-sm">{p.createdAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {myPosts.length === 0 && <p className="text-muted text-sm" style={{ padding: 16 }}>No posts yet.</p>}
      </div>
    </div>
  );
}

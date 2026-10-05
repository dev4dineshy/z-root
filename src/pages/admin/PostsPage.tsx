import React, { useState } from 'react';
import { AppData, Account, Post, Channel } from '../../types';
import { saveData, getChannelsForOwner } from '../../data/dataService';

interface Props { account: Account; data: AppData; setData: (d: AppData) => void; }

export default function PostsPage({ account, data, setData }: Props) {
  const [showComposer, setShowComposer] = useState(false);
  const [postFor, setPostFor] = useState<'party' | 'candidate'>('party');
  const [selectedCandidateId, setSelectedCandidateId] = useState('');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
  const [status, setStatus] = useState<'draft' | 'published'>('published');
  const [postType, setPostType] = useState<Post['type']>('announcement');
  const [tags, setTags] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const partyChannels = data.channels.filter(c => c.ownerType === 'party' && c.ownerId === data.party.id);
  const candidateChannels = selectedCandidateId ? data.channels.filter(c => c.ownerType === 'candidate' && c.ownerId === selectedCandidateId) : [];
  const availableChannels = postFor === 'party' ? partyChannels : candidateChannels;
  const selectedCandidate = data.candidates.find(c => c.id === selectedCandidateId);
  const selectedRegion = selectedCandidate ? data.regions.find(r => r.id === selectedCandidate.regionId) : null;

  function toggleChannel(id: string) {
    setSelectedChannels(cs => cs.includes(id) ? cs.filter(c => c !== id) : [...cs, id]);
  }

  function handlePublish() {
    setError('');
    if (!title.trim()) return setError('Post title is required');
    if (!body.trim()) return setError('Post description is required');
    if (postFor === 'candidate' && !selectedCandidateId) return setError('Select a candidate');
    const today = new Date().toISOString().split('T')[0];
    const newPost: Post = {
      id: 'p' + Date.now(),
      ownerType: postFor,
      ownerId: postFor === 'party' ? data.party.id : selectedCandidateId,
      regionId: postFor === 'candidate' ? (selectedCandidate?.regionId || null) : null,
      title: title.trim(),
      body: body.trim(),
      status,
      channelIds: selectedChannels,
      originalPostUrl: null,
      metrics: { likes: 0, comments: 0, reshares: 0 },
      createdAt: today,
      publishedAt: status === 'published' ? today : null,
      type: postType,
      imageUrl: null,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
    };
    const updated = { ...data, posts: [...data.posts, newPost] };
    saveData(updated); setData(updated);
    setSuccess(`Post "${newPost.title}" ${status === 'published' ? 'published' : 'saved as draft'} (DEMO).`);
    setTitle(''); setBody(''); setSelectedChannels([]); setPostFor('party'); setSelectedCandidateId('');
    setTags(''); setPostType('announcement');
    setShowComposer(false);
  }

  const platIcon = (p: string) => p === 'facebook' ? '𝗳' : p === 'youtube' ? '▶' : 'X';

  return (
    <div className="page-body">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h2 style={{ fontWeight: 800, color: 'var(--navy)', fontSize: 22 }}>Posts</h2>
          <p className="text-muted text-sm">Create and manage content for party and candidate channels.</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setShowComposer(true); setSuccess(''); setError(''); }}>+ Create Post</button>
      </div>

      {success && <div className="success-box">{success}</div>}

      {/* Post Composer */}
      {showComposer && (
        <div className="card" style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div>
              <h3 style={{ fontWeight: 700 }}>Create Post</h3>
              <p className="text-muted text-sm">Create and publish content on PeopleConnect channels.</p>
            </div>
            <button className="btn btn-outline btn-sm" onClick={() => setShowComposer(false)}>✕</button>
          </div>

          <div className="info-box" style={{ marginBottom: 16 }}>
            📢 Channel shown: {postFor === 'party' ? data.party.name : selectedCandidate?.name || 'Select candidate'} <span className="demo-badge">DEMO DATA</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24 }}>
            <div>
              {error && <div className="error-box">{error}</div>}

              {/* Post for */}
              <div className="form-group">
                <label>Post for <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>ⓘ</span></label>
                <div style={{ display: 'flex', gap: 20, marginTop: 4 }}>
                  {(['party', 'candidate'] as const).map(opt => (
                    <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontWeight: 500 }}>
                      <input type="radio" name="postFor" value={opt} checked={postFor === opt} onChange={() => { setPostFor(opt); setSelectedCandidateId(''); setSelectedChannels([]); }} />
                      <span>{opt === 'party' ? 'Party' : 'Candidate'}</span>
                      <span className="text-muted text-sm">{opt === 'party' ? 'Use party channels' : 'Use candidate channels'}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Region + Candidate (if candidate post) */}
              {postFor === 'candidate' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                  <div>
                    <label>Region</label>
                    <div className="input" style={{ background: 'var(--bg)', color: 'var(--text-muted)' }}>
                      {selectedRegion?.name || (selectedCandidateId ? '—' : 'Auto from candidate')} <span className="demo-badge">DEMO DATA</span>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Candidate</label>
                    <select className="input" value={selectedCandidateId} onChange={e => { setSelectedCandidateId(e.target.value); setSelectedChannels([]); }}>
                      <option value="">Select candidate…</option>
                      {data.candidates.map(c => <option key={c.id} value={c.id}>{c.name} (DEMO DATA)</option>)}
                    </select>
                  </div>
                </div>
              )}

              <div className="form-group">
                <label>Post title</label>
                <input className="input" value={title} onChange={e => setTitle(e.target.value)} placeholder="Community update (DEMO DATA)" />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea className="input" rows={4} value={body} onChange={e => setBody(e.target.value)} placeholder="Programme information and official updates. (DEMO DATA)" />
                <div className="text-muted text-sm" style={{ textAlign: 'right' }}>{body.length}/1,000</div>
              </div>

              <div className="form-group">
                <label>Post type</label>
                <select className="input" value={postType} onChange={e => setPostType(e.target.value as Post['type'])}>
                  <option value="announcement">Announcement</option>
                  <option value="event">Event</option>
                  <option value="update">Update</option>
                  <option value="survey">Survey</option>
                </select>
              </div>

              <div className="form-group">
                <label>Tags <span className="text-muted text-sm">(comma-separated)</span></label>
                <input className="input" value={tags} onChange={e => setTags(e.target.value)} placeholder="health, community, event" />
              </div>

              <div className="form-group">
                <label>Status</label>
                <select className="input" value={status} onChange={e => setStatus(e.target.value as any)}>
                  <option value="published">Publish now</option>
                  <option value="draft">Save as draft</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                <button className="btn btn-primary" onClick={handlePublish}>Publish</button>
                <button className="btn btn-outline" onClick={() => setShowComposer(false)}>Cancel</button>
              </div>
            </div>

            {/* Publishing identity + channels */}
            <div>
              <div className="card" style={{ marginBottom: 16 }}>
                <div style={{ fontWeight: 700, marginBottom: 12 }}>Publishing identity</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--teal)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                    {(postFor === 'party' ? data.party.name : selectedCandidate?.name || '?')[0]}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600 }}>{postFor === 'party' ? data.party.name : selectedCandidate?.name || 'Select candidate'} <span className="demo-badge">DEMO DATA</span></div>
                    <div className="text-muted text-sm">{postFor === 'party' ? 'Party' : 'Candidate'}</div>
                  </div>
                </div>

                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
                  Linked {postFor} channels <span style={{ fontSize: 11 }}>ⓘ</span>
                </div>
                {availableChannels.length === 0
                  ? <p className="text-muted text-sm">{postFor === 'candidate' ? 'Select a candidate first.' : 'No channels linked.'}</p>
                  : availableChannels.map(ch => (
                    <label key={ch.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', cursor: 'pointer' }}>
                      <input type="checkbox" checked={selectedChannels.includes(ch.id)} onChange={() => toggleChannel(ch.id)} />
                      <span style={{ fontSize: 16 }}>{platIcon(ch.platform)}</span>
                      <span>{ch.label} <span className="demo-badge">DEMO DATA</span></span>
                      {ch.connected && <span style={{ fontSize: 11, color: 'var(--success)' }}>✓</span>}
                    </label>
                  ))
                }
              </div>
              <div className="info-box" style={{ fontSize: 12 }}>
                Party selection uses party channels.<br />Candidate selection uses that candidate's channels.<br />
                <em>Available channels depend on media and permissions. (DEMO DATA)</em>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Posts list */}
      <div className="card">
        <h3 style={{ fontWeight: 700, marginBottom: 14 }}>All Posts</h3>
        <table>
          <thead><tr><th>Title</th><th>Owner</th><th>Type</th><th>Region</th><th>Status</th><th>Tags</th><th>Channels</th><th>Metrics</th><th>Date</th></tr></thead>
          <tbody>
            {data.posts.map(p => {
              const region = data.regions.find(r => r.id === p.regionId);
              const owner = p.ownerType === 'party' ? data.party.name : data.candidates.find(c => c.id === p.ownerId)?.name;
              return (
                <tr key={p.id}>
                  <td style={{ maxWidth: 220 }}><strong>{p.title}</strong></td>
                  <td><span className="tag" style={{ background: p.ownerType === 'party' ? '#EFF6FF' : 'var(--teal-light)', color: 'var(--navy)' }}>{owner}</span></td>
                  <td>{p.type ? <span className="tag tag-active">{p.type}</span> : '—'}</td>
                  <td>{region?.name || '—'}</td>
                  <td><span className={`tag tag-${p.status}`}>{p.status}</span></td>
                  <td className="text-muted text-sm">{(p.tags || []).join(', ') || '—'}</td>
                  <td>{p.channelIds.length}</td>
                  <td className="text-muted text-sm">❤️{p.metrics.likes} 💬{p.metrics.comments} 🔁{p.metrics.reshares}</td>
                  <td className="text-muted text-sm">{p.createdAt}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {data.posts.length === 0 && <p className="text-muted text-sm" style={{ padding: 16 }}>No posts yet.</p>}
      </div>
    </div>
  );
}

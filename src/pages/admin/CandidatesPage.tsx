import React, { useState, useRef } from 'react';
import { AppData, Account } from '../../types';
import { createCandidate, createCandidateLogin as createLoginRequest, importCandidates, loadResources } from '../../data/dataService';
import * as XLSX from 'xlsx';

interface Props { account: Account; data: AppData; setData: (d: AppData) => void; }

type ImportRow = { name: string; regionId: string; email: string; bio: string; _valid: boolean; _error: string };

const STRONG_PASSWORD = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,128}$/;
const PASSWORD_MESSAGE = 'Password must be 8 to 128 characters and contain uppercase, lowercase, and a number';

export default function CandidatesPage({ data, setData }: Props) {
  const [view, setView] = useState<'list' | 'import' | 'add' | 'login'>('list');
  const [importStep, setImportStep] = useState(1);
  const [importRows, setImportRows] = useState<ImportRow[]>([]);
  const [importError, setImportError] = useState('');
  const [importSuccess, setImportSuccess] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const [importFile, setImportFile] = useState<File | null>(null);

  // Add candidate form
  const [form, setForm] = useState({ name: '', regionId: '', email: '', bio: '' });
  const [formError, setFormError] = useState('');

  // Login form
  const [loginForm, setLoginForm] = useState({ candidateId: '', password: '' });
  const [loginMsg, setLoginMsg] = useState('');

  async function openView(next: 'list' | 'import' | 'add' | 'login') {
    if (next === 'import' || next === 'add') {
      setData({ ...data, ...(await loadResources(['regions'])) });
    }
    setView(next);
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportFile(file);
    setImportError('');
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const wb = XLSX.read(ev.target?.result, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows: any[] = XLSX.utils.sheet_to_json(ws);
        const parsed: ImportRow[] = rows.map(r => {
          const name = String(r['Candidate Name'] || r['name'] || '').trim();
          const regionName = String(r['Region'] || r['region'] || '').trim();
          const email = String(r['Email'] || r['email'] || '').trim().toLowerCase();
          const bio = String(r['Profile'] || r['bio'] || '').trim();
          const region = data.regions.find(rg => rg.name.toLowerCase() === regionName.toLowerCase() || rg.id === regionName);
          const dupEmail = data.candidates.find(c => c.email === email);
          let error = '';
          if (!name) error = 'Name required';
          else if (!region) error = `Invalid region: "${regionName}"`;
          else if (!email || !email.includes('@')) error = 'Invalid email';
          else if (dupEmail) error = 'Duplicate email';
          return { name, regionId: region?.id || '', email, bio, _valid: !error, _error: error };
        });
        setImportRows(parsed);
        setImportStep(2);
      } catch { setImportError('Failed to parse Excel file. Please use the template.'); }
    };
    reader.readAsArrayBuffer(file);
  }

  async function handleImport() {
    if (!importFile) return setImportError('Choose an Excel file first.');
    try {
      const result = await importCandidates(importFile);
      setData({ ...data, ...(await loadResources(['candidates'])) });
      setImportSuccess(`${result.imported} candidate(s) imported.${result.invalid ? ` ${result.invalid} row(s) were rejected.` : ''}`);
      setImportStep(3);
    } catch (err) { setImportError(err instanceof Error ? err.message : 'Import failed.'); }
  }

  function downloadTemplate() {
    const ws = XLSX.utils.aoa_to_sheet([['Candidate Name', 'Region', 'Email', 'Profile']]);
    const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, 'Candidates');
    XLSX.writeFile(wb, 'candidates-template.xlsx');
  }

  async function addCandidate() {
    setFormError('');
    if (!form.name.trim()) return setFormError('Name required');
    if (!form.regionId) return setFormError('Region required');
    if (!form.email.includes('@')) return setFormError('Valid email required');
    if (data.candidates.find(c => c.email === form.email.trim().toLowerCase())) return setFormError('Email already exists');
    try {
      const nc = await createCandidate({ name: form.name.trim(), regionId: form.regionId, email: form.email.trim().toLowerCase(), bio: form.bio, photoUrl: null });
      setData({ ...data, candidates: [...data.candidates, nc] });
      setForm({ name: '', regionId: '', email: '', bio: '' }); setView('list');
    } catch (err) { setFormError(err instanceof Error ? err.message : 'Unable to add candidate.'); }
  }

  function createCandidateLogin() {
    setLoginMsg('');
    const cand = data.candidates.find(c => c.id === loginForm.candidateId);
    if (!cand) return setLoginMsg('Candidate not found');
    if (cand.hasLogin) return setLoginMsg('Login already exists for this candidate');
    if (!STRONG_PASSWORD.test(loginForm.password)) return setLoginMsg(PASSWORD_MESSAGE);
    createLoginRequest(cand.id, loginForm.password).then(account => {
      setData({ ...data, accounts: [...data.accounts, account], candidates: data.candidates.map(c => c.id === cand.id ? { ...c, hasLogin: true } : c) });
      setLoginMsg(`✅ Login created for ${cand.name}`); setLoginForm({ candidateId: '', password: '' });
    }).catch(err => setLoginMsg(err instanceof Error ? err.message : 'Unable to create login.'));
  }

  const validCount = importRows.filter(r => r._valid).length;
  const errorCount = importRows.filter(r => !r._valid).length;

  return (
    <div className="page-body">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h2 style={{ fontWeight: 800, color: 'var(--navy)', fontSize: 22 }}>Candidates</h2>
          <p className="text-muted text-sm">Manage, add and import candidates.</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-outline btn-sm" onClick={downloadTemplate}>⬇ Download Template</button>
          <button className="btn btn-primary btn-sm" onClick={() => { void openView('import'); setImportStep(1); setImportRows([]); setImportSuccess(''); }}>⬆ Import from Excel</button>
          <button className="btn btn-secondary btn-sm" onClick={() => void openView('add')}>+ Add Candidate</button>
          <button className="btn btn-outline btn-sm" onClick={() => void openView('login')}>🔑 Create Login</button>
        </div>
      </div>

      {/* Import view */}
      {view === 'import' && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <h3 style={{ fontWeight: 700 }}>Import Candidates from Excel</h3>
              <p className="text-muted text-sm">Upload an Excel file, review the data and import candidates into PeopleConnect.</p>
            </div>
            <button className="btn btn-outline btn-sm" onClick={() => setView('list')}>✕ Close</button>
          </div>

          {/* Step indicator */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 20 }}>
            {[1,2,3].map(n => (
              <React.Fragment key={n}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: importStep >= n ? 'var(--teal)' : 'var(--border)', color: importStep >= n ? '#fff' : 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13 }}>{n}</div>
                <span style={{ fontSize: 13, color: importStep >= n ? 'var(--navy)' : 'var(--text-muted)', fontWeight: importStep === n ? 700 : 400 }}>{['Upload file','Review data','Import'][n-1]}</span>
                {n < 3 && <div style={{ flex: 1, height: 2, background: importStep > n ? 'var(--teal)' : 'var(--border)' }} />}
              </React.Fragment>
            ))}
          </div>

          {importStep === 1 && (
            <div>
              <div style={{ border: '2px dashed var(--border)', borderRadius: 'var(--radius)', padding: 32, textAlign: 'center', marginBottom: 16 }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>📊</div>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>Excel file</div>
                <div className="text-muted text-sm" style={{ marginBottom: 12 }}>Upload a .xlsx file with columns: Candidate Name, Region, Email, Profile</div>
                <input ref={fileRef} type="file" accept=".xlsx" style={{ display: 'none' }} onChange={handleFileUpload} />
                <button className="btn btn-primary btn-sm" onClick={() => fileRef.current?.click()}>Choose Excel file</button>
              </div>
              {importError && <div className="error-box">{importError}</div>}
              <div className="info-box">
                <strong>Proposed template fields:</strong> Candidate Name, Region, Email, Profile<br />
                <button className="btn btn-outline btn-sm" style={{ marginTop: 6 }} onClick={downloadTemplate}>⬇ Download template</button>
              </div>
            </div>
          )}

          {importStep === 2 && (
            <div>
              <h4 style={{ fontWeight: 700, marginBottom: 8 }}>Preview data</h4>
              <p className="text-muted text-sm" style={{ marginBottom: 12 }}>Review the data before importing. Only valid rows will be imported.</p>
              <table>
                <thead><tr><th>#</th><th>Candidate Name</th><th>Region</th><th>Email</th><th>Profile</th><th>Status</th></tr></thead>
                <tbody>
                  {importRows.map((r, i) => (
                    <tr key={i} style={{ background: r._valid ? '' : '#FEF2F2' }}>
                      <td>{i + 1}</td>
                      <td>{r.name || <em className="text-muted">—</em>}</td>
                      <td>{data.regions.find(rg => rg.id === r.regionId)?.name || r.regionId}</td>
                      <td>{r.email}</td>
                      <td>{r.bio || '—'}</td>
                      <td>{r._valid ? <span className="tag tag-active">Valid</span> : <span style={{ color: 'var(--error)', fontSize: 12 }}>❌ {r._error}</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ display: 'flex', gap: 12, marginTop: 14, alignItems: 'center' }}>
                <div className="success-box" style={{ margin: 0, flex: 1 }}>✅ {validCount} valid row{validCount !== 1 ? 's' : ''} ready to import</div>
                {errorCount > 0 && <div className="error-box" style={{ margin: 0, flex: 1 }}>❌ {errorCount} error{errorCount !== 1 ? 's' : ''} found</div>}
              </div>
              <div style={{ marginTop: 14, display: 'flex', gap: 8 }}>
                <button className="btn btn-outline btn-sm" onClick={() => setImportStep(1)}>← Back</button>
                <button className="btn btn-primary" onClick={handleImport} disabled={validCount === 0}>Import Candidates ({validCount})</button>
              </div>
            </div>
          )}

          {importStep === 3 && (
            <div className="success-box">
              {importSuccess}<br />
              <button className="btn btn-outline btn-sm" style={{ marginTop: 8 }} onClick={() => setView('list')}>View candidates</button>
            </div>
          )}
        </div>
      )}

      {/* Add candidate */}
      {view === 'add' && (
        <div className="card" style={{ marginBottom: 20, maxWidth: 480 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 style={{ fontWeight: 700 }}>Add Candidate</h3>
            <button className="btn btn-outline btn-sm" onClick={() => setView('list')}>✕</button>
          </div>
          {formError && <div className="error-box">{formError}</div>}
          <div className="form-group"><label>Name</label><input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Candidate name" /></div>
          <div className="form-group"><label>Region</label>
            <select className="input" value={form.regionId} onChange={e => setForm(f => ({ ...f, regionId: e.target.value }))}>
              <option value="">Select region…</option>
              {data.regions.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </div>
          <div className="form-group"><label>Email</label><input className="input" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="name@organization.org" /></div>
          <div className="form-group"><label>Bio</label><textarea className="input" value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} rows={3} placeholder="Short bio…" /></div>
          <button className="btn btn-primary" onClick={addCandidate}>Add Candidate</button>
        </div>
      )}

      {/* Create login */}
      {view === 'login' && (
        <div className="card" style={{ marginBottom: 20, maxWidth: 400 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 style={{ fontWeight: 700 }}>Create Candidate Login</h3>
            <button className="btn btn-outline btn-sm" onClick={() => setView('list')}>✕</button>
          </div>
          {loginMsg && <div className={loginMsg.startsWith('✅') ? 'success-box' : 'error-box'}>{loginMsg}</div>}
          <div className="form-group"><label>Candidate</label>
            <select className="input" value={loginForm.candidateId} onChange={e => setLoginForm(f => ({ ...f, candidateId: e.target.value }))}>
              <option value="">Select candidate…</option>
              {data.candidates.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Password</label>
            <input className="input" type="password" value={loginForm.password} onChange={e => setLoginForm(f => ({ ...f, password: e.target.value }))} placeholder="Temporary password" pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,128}" minLength={8} maxLength={128} title={PASSWORD_MESSAGE} required />
            <div className="text-muted text-sm" style={{ marginTop: 5 }}>{PASSWORD_MESSAGE}.</div>
          </div>
          <button className="btn btn-primary" onClick={createCandidateLogin}>Create Login</button>
        </div>
      )}

      {/* Candidate list */}
      <div className="card">
        <table>
          <thead><tr><th>Name</th><th>Region</th><th>Email</th><th>Bio</th><th>Login</th></tr></thead>
          <tbody>
            {data.candidates.map(c => {
              const region = data.regions.find(r => r.id === c.regionId);
              const hasLogin = Boolean(c.hasLogin);
              return (
                <tr key={c.id}>
                  <td><strong>{c.name}</strong></td>
                  <td>{c.regionName || region?.name || c.regionId}</td>
                  <td>{c.email}</td>
                  <td style={{ maxWidth: 200 }}><span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>{c.bio}</span></td>
                  <td>{hasLogin ? <span className="tag tag-active">Enabled</span> : <span className="tag" style={{ background: '#FEE2E2', color: '#991B1B' }}>None</span>}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {data.candidates.length === 0 && <p className="text-muted text-sm" style={{ padding: 16 }}>No candidates yet. Import or add one.</p>}
      </div>
    </div>
  );
}

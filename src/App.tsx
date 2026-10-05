import React, { useState } from 'react';
import './index.css';
import { loadData, saveData, setSession, getSession, clearSession, resetData, exportData } from './data/dataService';
import { AppData, Account } from './types';
import WebLogin from './pages/WebLogin';
import AdminLayout from './pages/admin/AdminLayout';
import CandidateLayout from './pages/candidate/CandidateLayout';

const initialData = loadData();
const initialSession = getSession();

export default function App() {
  const [data, setDataState] = useState<AppData>(initialData);
  const [session, setSessionState] = useState<Account | null>(initialSession);

  function setData(d: AppData) {
    setDataState(d);
    saveData(d);
  }

  function handleLogin(acc: Account) {
    setSession(acc);
    setSessionState(acc);
  }

  function handleLogout() {
    clearSession();
    setSessionState(null);
  }

  function handleReset() {
    if (!window.confirm('Reset all demo data to seed values?')) return;
    const fresh = resetData();
    setDataState(fresh);
    alert('Demo data reset.');
  }

  function handleExport() { exportData(data); }

  return (
    <>
      {/* Demo controls bar */}
      {session && (
        <div style={{ position: 'fixed', bottom: 0, right: 0, background: 'var(--navy)', color: '#fff', padding: '6px 14px', zIndex: 200, display: 'flex', gap: 12, alignItems: 'center', borderTopLeftRadius: 8, fontSize: 12 }}>
          <span className="demo-badge">DEMO</span>
          <button onClick={handleReset} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', padding: '3px 10px', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>🔄 Reset data</button>
          <button onClick={handleExport} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', padding: '3px 10px', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>⬇ Export JSON</button>
        </div>
      )}

      {!session && <WebLogin data={data} onLogin={handleLogin} />}
      {session?.role === 'admin' && <AdminLayout account={session} data={data} setData={setData} onLogout={handleLogout} />}
      {session?.role === 'candidate' && <CandidateLayout account={session} data={data} setData={setData} onLogout={handleLogout} />}
    </>
  );
}

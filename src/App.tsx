import React, { useCallback, useEffect, useState } from 'react';
import './index.css';
import { createEmptyData, DataResource, loadResources, logoutWeb, restoreSession } from './data/dataService';
import { AppData, Account } from './types';
import WebLogin from './pages/WebLogin';
import AdminLayout from './pages/admin/AdminLayout';
import CandidateLayout from './pages/candidate/CandidateLayout';

export default function App() {
  const [data, setData] = useState<AppData>(createEmptyData());
  const [session, setSession] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const requestResources = useCallback(async (resources: DataResource[]) => {
    try {
      const requested = await loadResources(resources);
      setData(current => ({ ...current, ...requested }));
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load requested data.');
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const account = await restoreSession();
        setSession(account);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to connect to the API.');
      } finally { setLoading(false); }
    })();
  }, []);

  async function handleLogin(account: Account) {
    setError('');
    setSession(account);
  }

  async function handleLogout() {
    await logoutWeb();
    setSession(null);
    setData(createEmptyData());
  }

  if (loading) return <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>Loading PeopleConnect…</div>;
  return (
    <>
      {error && <div className="error-box" style={{ margin: 12 }}>{error}</div>}
      {!session && <WebLogin onLogin={handleLogin} />}
      {session?.role === 'admin' && <AdminLayout account={session} data={data} setData={setData} requestResources={requestResources} onLogout={handleLogout} />}
      {session?.role === 'candidate' && <CandidateLayout account={session} data={data} setData={setData} requestResources={requestResources} onLogout={handleLogout} />}
    </>
  );
}

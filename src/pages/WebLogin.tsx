import React, { useState } from 'react';
import { AppData, Account } from '../types';
import { loginWeb } from '../data/dataService';

interface Props { data: AppData; onLogin: (acc: Account) => void; }

export default function WebLogin({ data, onLogin }: Props) {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!email.trim()) return setError('Email is required');
    if (!password)     return setError('Password is required');
    setLoading(true);
    const acc = loginWeb(email.trim().toLowerCase(), password, data);
    setLoading(false);
    if (!acc) return setError('Invalid email or password, or account does not have portal access.');
    onLogin(acc);
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg)' }}>

      {/* ── Left hero panel ── */}
      <div style={{
        width: 420, flexShrink: 0,
        background: 'linear-gradient(160deg, var(--navy) 0%, #1e4080 60%, #0b6e78 100%)',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        padding: '44px 40px', color: '#fff',
      }}>
        {/* Logo */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 48 }}>
            <div style={{
              width: 42, height: 42, borderRadius: 12,
              background: 'rgba(255,255,255,0.15)',
              border: '1px solid rgba(255,255,255,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ color: '#fff', fontWeight: 800, fontSize: 15, letterSpacing: -0.5 }}>PC</span>
            </div>
            <span style={{ fontSize: 20, fontWeight: 800, letterSpacing: -0.4 }}>PeopleConnect</span>
          </div>

          <div style={{ marginBottom: 32 }}>
            <div style={{ fontSize: 28, fontWeight: 800, lineHeight: 1.25, marginBottom: 12, letterSpacing: -0.5 }}>
              Community-first<br />management portal
            </div>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.68)', lineHeight: 1.7 }}>
              Manage posts, candidates and engagement across all your regions — from one secure dashboard.
            </p>
          </div>

          {/* Feature list */}
          {[
            { ico: '📝', label: 'Create and publish community posts' },
            { ico: '👥', label: 'Manage candidates and regions' },
            { ico: '📈', label: 'View engagement reports' },
            { ico: '🏛️', label: 'Edit party info and manifesto' },
          ].map(f => (
            <div key={f.label} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <div style={{
                width: 34, height: 34, borderRadius: 9,
                background: 'rgba(255,255,255,0.10)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0,
              }}>{f.ico}</div>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.78)', fontWeight: 500 }}>{f.label}</span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.38)', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 20 }}>
          PeopleConnect · Demo Portal · {new Date().getFullYear()}
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 24px' }}>
        <div style={{ width: '100%', maxWidth: 420 }}>

          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 26, fontWeight: 800, color: 'var(--navy)', letterSpacing: -0.5, marginBottom: 6 }}>
              Sign in to your portal
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
              Admin and candidate accounts use the same login — your role determines your access.
            </p>
          </div>

          {error && (
            <div className="error-box" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 16 }}>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email address</label>
              <input
                className="input"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@example.com"
                autoComplete="email"
                style={{ fontSize: 14 }}
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  className="input"
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{ paddingRight: 44 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                >
                  {showPass ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: '100%', justifyContent: 'center', padding: '13px', fontSize: 15, marginTop: 4 }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: 'spin 0.8s linear infinite' }}><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
                  Signing in…
                </span>
              ) : 'Sign in →'}
            </button>
          </form>

          {/* Demo credentials box */}
          <div style={{
            marginTop: 28,
            background: 'var(--teal-xlight)',
            border: '1px solid var(--teal-light)',
            borderRadius: 'var(--radius-sm)',
            padding: '16px 18px',
          }}>
            <div style={{ fontWeight: 700, color: 'var(--teal-dark)', fontSize: 13, marginBottom: 10 }}>
              🔑 Demo credentials
            </div>
            {[
              { role: 'Admin', email: 'admin@example.com', pass: 'admin123' },
              { role: 'Candidate (Alex)', email: 'alex@example.com', pass: 'alex123' },
              { role: 'Candidate (Jordan)', email: 'jordan@example.com', pass: 'jordan123' },
            ].map(c => (
              <div key={c.email} style={{ marginBottom: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--navy)', marginRight: 6 }}>{c.role}</span>
                <button
                  type="button"
                  onClick={() => { setEmail(c.email); setPassword(c.pass); setError(''); }}
                  style={{ fontSize: 12, color: 'var(--teal)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
                >
                  {c.email}
                </button>
                <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 4 }}>/ {c.pass}</span>
              </div>
            ))}
            <div style={{ marginTop: 6, fontSize: 11, color: 'var(--text-muted)' }}>Click an email above to auto-fill credentials.</div>
          </div>

          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    </div>
  );
}

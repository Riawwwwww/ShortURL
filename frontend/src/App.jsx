import { useEffect, useState } from 'react';
import { api } from './api';
import AuthPanel from './components/AuthPanel';
import CreateUrlForm from './components/CreateUrlForm';
import HistoryTable from './components/HistoryTable';
import ShortUrlResult from './components/ShortUrlResult';
import './styles.css';

export default function App() {
  const [user, setUser] = useState(null);
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);

  async function loadHistory() {
    const data = await api('/api/urls');
    setUrls(data.urls);
  }

  async function logout() {
    await api('/api/auth/logout', { method: 'POST' });
    setUser(null);
    setUrls([]);
  }

  useEffect(() => {
    api('/api/me').then((data) => {
      if (data.user) {
        setUser(data.user);
        return loadHistory();
      }
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-screen">กำลังโหลด...</div>;
  if (!user) return <AuthPanel onAuthenticated={(authenticatedUser) => { setUser(authenticatedUser); loadHistory(); }} />;

  const totalClicks = urls.reduce((total, item) => total + item.click_count, 0);

  return <main className="shell">
    <header className="simple-header"><button className="ghost-button" onClick={logout}>ออกจากระบบ</button></header>
    <CreateUrlForm onCreated={(created) => { setResult(created); loadHistory(); }} />
    <ShortUrlResult result={result} />
    <section className="stats-grid"><article className="stat-card"><span className="stat-label">SHORT URL ทั้งหมด</span><strong>{urls.length}</strong></article><article className="stat-card accent"><span className="stat-label">CLICKS ทั้งหมด</span><strong>{totalClicks}</strong></article></section>
    <HistoryTable urls={urls} onOpenQr={(qrResult) => { setResult(qrResult); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />
  </main>;
}

import { useState } from 'react';
import { api } from '../api';

export default function CreateUrlForm({ onCreated }) {
  const [originalUrl, setOriginalUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await api('/api/urls', {
        method: 'POST',
        body: JSON.stringify({ originalUrl })
      });
      setOriginalUrl('');
      onCreated(result);
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setLoading(false);
    }
  }

  return <section className="panel create-panel">
    <div className="panel-heading"><div><h2>แปลง URL</h2></div></div>
    <form onSubmit={submit} className="inline-create-form">
      <label className="field">URL ต้นฉบับ<input value={originalUrl} onChange={(event) => setOriginalUrl(event.target.value)} type="url" required placeholder="https://www.example.com/your-long-url" /></label>
      <button className="primary-button convert-button" type="submit" disabled={loading}>{loading ? 'กำลังแปลง...' : 'แปลงเป็น Short URL'}</button>
    </form>
    <p className="error-message">{error}</p>
  </section>;
}

import { useState } from 'react';
import { api } from '../api';

export default function AuthPanel({ onAuthenticated }) {
  const [registerMode, setRegisterMode] = useState(false);
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function update(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function submit(event) {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const endpoint = registerMode ? '/api/auth/register' : '/api/auth/login';
      const data = await api(endpoint, { method: 'POST', body: JSON.stringify(form) });
      onAuthenticated(data.user);
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-layout">
      <section className="auth-card">
        <div className="auth-heading">
          <h2>{registerMode ? 'สร้างบัญชีใหม่' : 'เข้าสู่ระบบ'}</h2>
        </div>
        <form className="form-stack" onSubmit={submit}>
          {registerMode && <label className="field">Email<input name="email" type="email" value={form.email} onChange={update} required placeholder="you@example.com" /></label>}
          <label className="field">Username หรือ Email<input name="username" value={form.username} onChange={update} required autoComplete="username" placeholder="username" /></label>
          <label className="field">Password<input name="password" type="password" value={form.password} onChange={update} required autoComplete="current-password" placeholder="••••••••" /></label>
          <button className="primary-button" type="submit" disabled={loading}>{loading ? 'กำลังดำเนินการ...' : registerMode ? 'สมัครสมาชิก' : 'เข้าสู่ระบบ'}</button>
        </form>
        <p className="error-message">{error}</p>
        <button className="text-button" type="button" onClick={() => { setRegisterMode(!registerMode); setError(''); }}>
          {registerMode ? 'มีบัญชีอยู่แล้ว? เข้าสู่ระบบ' : 'ยังไม่มีบัญชี? สมัครสมาชิก'}
        </button>
      </section>
    </main>
  );
}

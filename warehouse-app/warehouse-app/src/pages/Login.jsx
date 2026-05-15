import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../services/api.js';
import ErrorBanner from '../components/ErrorBanner.jsx';

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await authApi.login(form);
      const user = {
        token: data.token || data.jwt || data.data?.token,
        role: data.role || data.data?.role,
        userId: data.userId || data.data?.userId,
      };
      if (!user.token || !user.role) throw new Error('Login response missing token or role');
      localStorage.setItem('warehouse_user', JSON.stringify(user));
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={onSubmit}>
        <h1>Warehouse Management</h1>
        <p>Login with Purchasing Staff or Warehouse Staff account.</p>
        <ErrorBanner message={error} />
        <label>Email</label>
        <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="staff@example.com" required />
        <label>Password</label>
        <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Enter password" required />
        <button disabled={loading}>{loading ? 'Signing in...' : 'Login'}</button>
      </form>
    </div>
  );
}

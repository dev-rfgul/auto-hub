import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const LoginUser = () => {
  const base = import.meta.env.VITE_BACKEND_URL || '';
  const endpoint = `${base}/api/user/login`;
  const navigate = useNavigate?.() || (() => {});

  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const onChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const validate = () => {
    if (!form.email || !form.password) {
      setError('Email and password are required');
      return false;
    }
    if (!form.email.includes('@')) {
      setError('Enter a valid email');
      return false;
    }
    return true;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await axios.post(endpoint, { email: form.email, password: form.password }, { withCredentials: true });
      setSuccess(res.data?.message || 'Login successful');
      // backend sets cookies with withCredentials:true; navigate on success
      setTimeout(() => navigate('/'), 700);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Sign in</h2>

      {error && <div className="mb-3 text-sm text-red-700 bg-red-50 p-2 rounded">{error}</div>}
      {success && <div className="mb-3 text-sm text-green-700 bg-green-50 p-2 rounded">{success}</div>}

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Email</label>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={onChange}
            className="mt-1 block w-full border rounded p-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Password</label>
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={onChange}
            className="mt-1 block w-full border rounded p-2"
            required
          />
        </div>

        <div className="flex items-center justify-between pt-4">
          <div className="text-sm text-gray-500">Endpoint: <code className="bg-gray-100 px-1 rounded">{endpoint}</code></div>
          <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded">
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LoginUser;
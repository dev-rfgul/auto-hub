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
  const [showPassword, setShowPassword] = useState(false);

  const onChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const validate = () => {
    if (!form.email || !form.password) {
      setError('Email and password are required');
      return false;
    }
    // basic email check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError('Enter a valid email address');
      return false;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
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
      // redirect after a short delay
      setTimeout(() => navigate('/'), 600);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Sign in to AutoPartsHub</h2>

        {error && <div className="mb-3 text-sm text-red-700 bg-red-50 p-2 rounded">{error}</div>}
        {success && <div className="mb-3 text-sm text-green-700 bg-green-50 p-2 rounded">{success}</div>}

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={onChange}
              className="mt-1 block w-full border border-gray-200 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="you@example.com"
              aria-label="Email address"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
            <div className="relative mt-1">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={onChange}
                className="block w-full border border-gray-200 rounded px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Enter your password"
                aria-label="Password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-gray-500"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <a href="/user-signup" className="text-blue-600 hover:underline">Create account</a>
              <span className="mx-2 text-gray-400">•</span>
              {/* <a href="/forgot-password" className="text-blue-600 hover:underline">Forgot password?</a> */}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="ml-3 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-60"
            >
              {loading ? (
                <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : null}
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default LoginUser;
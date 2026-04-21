import { useState } from 'react';
import { useAuth } from '../utils/AuthContext';

export default function AuthPage() {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ email: '', password: '', role: 'USER' });
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors([]);
    setLoading(true);
    try {
      if (isLogin) {
        await login(form.email, form.password);
      } else {
        await register(form.email, form.password, form.role);
      }
    } catch (err) {
      setError(err.message);
      setFieldErrors(err.errors || []);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-lg p-8">
        <h1 className="text-2xl font-bold text-white mb-1">AlphaStream</h1>
        <p className="text-gray-400 text-sm mb-6">Market Signal Management</p>

        {/* Toggle */}
        <div className="flex mb-6 bg-gray-800 rounded-md p-1">
          {['Login', 'Sign Up'].map((label) => (
            <button
              key={label}
              onClick={() => { setIsLogin(label === 'Login'); setError(''); setFieldErrors([]); }}
              className={`flex-1 py-2 text-sm font-medium rounded transition ${
                (label === 'Login') === isLogin
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Email</label>
            <input
              name="email"
              type="email"
              required
              value={form.email}
              onChange={handleChange}
              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Password</label>
            <input
              name="password"
              type="password"
              required
              value={form.password}
              onChange={handleChange}
              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              placeholder="••••••••"
            />
          </div>

          {!isLogin && (
            <div>
              <label className="block text-xs text-gray-400 mb-1">Role</label>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="USER">USER – Read-only access</option>
                <option value="ADMIN">ADMIN – Full access</option>
              </select>
            </div>
          )}

          {error && (
            <div className="bg-red-900/40 border border-red-700 rounded px-3 py-2 text-sm text-red-300">
              {error}
              {fieldErrors.length > 0 && (
                <ul className="mt-1 list-disc list-inside text-xs space-y-0.5">
                  {fieldErrors.map((fe, i) => (
                    <li key={i}>{fe.field}: {fe.message}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium py-2 rounded text-sm transition"
          >
            {loading ? 'Processing...' : isLogin ? 'Login' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';

const EMPTY_FORM = { ticker: '', type: 'BUY', entryPrice: '', confidenceLevel: '' };

export default function SignalModal({ signal, onClose, onSubmit }) {
  const isEdit = Boolean(signal?.id);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (signal) {
      setForm({
        ticker: signal.ticker || '',
        type: signal.type || 'BUY',
        entryPrice: signal.entryPrice !== undefined ? String(signal.entryPrice) : '',
        confidenceLevel: signal.confidenceLevel !== undefined ? String(signal.confidenceLevel) : '',
      });
    }
  }, [signal]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors([]);
    setLoading(true);
    try {
      await onSubmit({
        ticker: form.ticker,
        type: form.type,
        entryPrice: parseFloat(form.entryPrice),
        confidenceLevel: parseFloat(form.confidenceLevel),
      });
      onClose();
    } catch (err) {
      setError(err.message);
      setFieldErrors(err.errors || []);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="w-full max-w-md bg-gray-900 border border-gray-700 rounded-lg p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-white">
            {isEdit ? 'Edit Signal' : 'New Signal'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-xl leading-none">×</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Ticker (e.g. BTC/USDT)</label>
            <input
              name="ticker"
              required
              value={form.ticker}
              onChange={handleChange}
              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 uppercase"
              placeholder="BTC/USDT"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Signal Type</label>
            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="BUY">BUY</option>
              <option value="SELL">SELL</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Entry Price (USD)</label>
            <input
              name="entryPrice"
              type="number"
              step="any"
              required
              value={form.entryPrice}
              onChange={handleChange}
              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              placeholder="65000.50"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Confidence Level (0–1)</label>
            <input
              name="confidenceLevel"
              type="number"
              step="0.01"
              min="0"
              max="1"
              required
              value={form.confidenceLevel}
              onChange={handleChange}
              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              placeholder="0.85"
            />
          </div>

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

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white text-sm py-2 rounded transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium py-2 rounded transition"
            >
              {loading ? 'Saving...' : isEdit ? 'Update Signal' : 'Create Signal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

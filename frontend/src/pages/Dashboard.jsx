import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../utils/AuthContext';
import { signalsApi } from '../services/api';
import SignalModal from '../components/SignalModal';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [signals, setSignals] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, totalPages: 1 });
  const [filters, setFilters] = useState({ page: 1, limit: 20, ticker: '', type: '' });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null); // { type: 'success'|'error', msg }

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editSignal, setEditSignal] = useState(null);

  // Delete confirm
  const [deleteId, setDeleteId] = useState(null);

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchSignals = useCallback(async () => {
    setLoading(true);
    try {
      const res = await signalsApi.getAll(filters);
      setSignals(res.data.signals);
      setMeta(res.data.meta);
    } catch (err) {
      showToast('error', err.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchSignals(); }, [fetchSignals]);

  const handleCreate = async (body) => {
    await signalsApi.create(body);
    showToast('success', 'Signal created');
    fetchSignals();
  };

  const handleUpdate = async (body) => {
    await signalsApi.update(editSignal.id, body);
    showToast('success', 'Signal updated');
    fetchSignals();
  };

  const handleDelete = async () => {
    try {
      await signalsApi.delete(deleteId);
      showToast('success', 'Signal deleted');
      setDeleteId(null);
      fetchSignals();
    } catch (err) {
      showToast('error', err.message);
      setDeleteId(null);
    }
  };

  const changePage = (p) => setFilters((f) => ({ ...f, page: p }));

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded text-sm font-medium shadow-lg ${
            toast.type === 'success'
              ? 'bg-green-800 border border-green-600 text-green-100'
              : 'bg-red-900 border border-red-600 text-red-100'
          }`}
        >
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div>
          <span className="text-white font-bold text-lg">AlphaStream</span>
          <span className="ml-3 text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded uppercase">
            {user?.role}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-gray-400 text-sm hidden sm:block">{user?.email}</span>
          <button
            onClick={logout}
            className="text-sm bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded transition"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="p-6 max-w-7xl mx-auto">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <h2 className="text-lg font-semibold text-white mr-auto">Market Signals</h2>

          {/* Filters */}
          <input
            type="text"
            placeholder="Filter ticker…"
            value={filters.ticker}
            onChange={(e) => setFilters({ ...filters, ticker: e.target.value, page: 1 })}
            className="bg-gray-800 border border-gray-700 rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:border-indigo-500 w-36"
          />
          <select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value, page: 1 })}
            className="bg-gray-800 border border-gray-700 rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Types</option>
            <option value="BUY">BUY</option>
            <option value="SELL">SELL</option>
          </select>

          {isAdmin && (
            <button
              onClick={() => { setEditSignal(null); setModalOpen(true); }}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-1.5 rounded transition"
            >
              + New Signal
            </button>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto bg-gray-900 border border-gray-800 rounded-lg">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400 text-xs uppercase tracking-wider">
                <th className="px-4 py-3 text-left">ID</th>
                <th className="px-4 py-3 text-left">Ticker</th>
                <th className="px-4 py-3 text-left">Type</th>
                <th className="px-4 py-3 text-right">Entry Price</th>
                <th className="px-4 py-3 text-right">Confidence</th>
                <th className="px-4 py-3 text-left">Created By</th>
                <th className="px-4 py-3 text-left">Date</th>
                {isAdmin && <th className="px-4 py-3 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={isAdmin ? 8 : 7} className="text-center py-12 text-gray-500">
                    Loading…
                  </td>
                </tr>
              ) : signals.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 8 : 7} className="text-center py-12 text-gray-500">
                    No signals found.
                  </td>
                </tr>
              ) : (
                signals.map((s) => (
                  <tr key={s.id} className="border-b border-gray-800 hover:bg-gray-800/50 transition">
                    <td className="px-4 py-3 text-gray-500">{s.id}</td>
                    <td className="px-4 py-3 font-mono font-medium text-white">{s.ticker}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-semibold ${
                          s.type === 'BUY'
                            ? 'bg-green-900/60 text-green-400 border border-green-700'
                            : 'bg-red-900/60 text-red-400 border border-red-700'
                        }`}
                      >
                        {s.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-gray-200">
                      ${Number(s.entryPrice).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={`font-mono text-xs ${
                          Number(s.confidenceLevel) >= 0.8
                            ? 'text-green-400'
                            : Number(s.confidenceLevel) >= 0.5
                            ? 'text-yellow-400'
                            : 'text-red-400'
                        }`}
                      >
                        {(Number(s.confidenceLevel) * 100).toFixed(0)}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400">{s.user?.email}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {new Date(s.createdAt).toLocaleDateString()}
                    </td>
                    {isAdmin && (
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => { setEditSignal(s); setModalOpen(true); }}
                          className="text-indigo-400 hover:text-indigo-300 text-xs mr-3 transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteId(s.id)}
                          className="text-red-500 hover:text-red-400 text-xs transition"
                        >
                          Delete
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4 text-sm text-gray-400">
          <span>
            {meta.total} total signal{meta.total !== 1 ? 's' : ''} — page {meta.page} of {meta.totalPages}
          </span>
          <div className="flex gap-2">
            <button
              disabled={meta.page <= 1}
              onClick={() => changePage(meta.page - 1)}
              className="px-3 py-1 bg-gray-800 rounded disabled:opacity-30 hover:bg-gray-700 transition"
            >
              ←
            </button>
            <button
              disabled={meta.page >= meta.totalPages}
              onClick={() => changePage(meta.page + 1)}
              className="px-3 py-1 bg-gray-800 rounded disabled:opacity-30 hover:bg-gray-700 transition"
            >
              →
            </button>
          </div>
        </div>
      </main>

      {/* Signal Modal */}
      {modalOpen && (
        <SignalModal
          signal={editSignal}
          onClose={() => { setModalOpen(false); setEditSignal(null); }}
          onSubmit={editSignal ? handleUpdate : handleCreate}
        />
      )}

      {/* Delete Confirm Dialog */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 w-80">
            <h3 className="text-white font-semibold mb-2">Delete Signal #{deleteId}?</h3>
            <p className="text-gray-400 text-sm mb-5">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white text-sm py-2 rounded transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 bg-red-700 hover:bg-red-600 text-white text-sm font-medium py-2 rounded transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

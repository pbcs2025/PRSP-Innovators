import { useState, useEffect } from 'react';
import api from '../api/client';

/**
 * Admin-only panel: shows anomaly-flagged access logs (rate-limiting triggers).
 */
export default function AnomaliesPanel() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  const fetchAnomalies = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/anomalies', { params: { page, limit } });
      setLogs(res.data.logs || []);
      setTotal(res.data.total || 0);
    } catch (err) {
      console.error('Failed to fetch anomalies:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnomalies();
  }, [page]);

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-slate-100">
      <h2 className="text-2xl font-bold mb-2">Anomaly Detection</h2>
      <p className="text-sm text-slate-500 mb-6">
        Logs where search rate limiting was triggered (possible abuse).
      </p>

      {loading ? (
        <p className="text-slate-500">Loading...</p>
      ) : logs.length === 0 ? (
        <p className="text-slate-500 py-8">No anomalies detected.</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-red-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-slate-600 uppercase">Time</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-slate-600 uppercase">User</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-slate-600 uppercase">Action</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-slate-600 uppercase">IP</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {logs.map((log) => (
                  <tr key={log.id} className="bg-red-50/50">
                    <td className="px-4 py-2 text-sm">{new Date(log.created_at).toLocaleString()}</td>
                    <td className="px-4 py-2 text-sm">{log.username}</td>
                    <td className="px-4 py-2 text-sm">{log.action}</td>
                    <td className="px-4 py-2 text-sm">{log.ip_address}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex justify-between items-center">
            <span className="text-sm text-slate-600">Total: {total}</span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-slate-200 rounded-lg disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-4 py-2">Page {page}</span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page * limit >= total}
                className="px-4 py-2 bg-slate-200 rounded-lg disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

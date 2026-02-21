import { useState, useEffect } from 'react';
import api from '../api/client';

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({
    user_id: '',
    action: '',
    anomaly_only: false
  });

  const limit = 20;

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = { page, limit, ...filters };
      if (filters.anomaly_only) params.anomaly_only = 'true';
      const res = await api.get('/logs', { params });
      setLogs(res.data.logs);
      setTotal(res.data.total);
    } catch (err) {
      console.error('Failed to fetch logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, filters]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Audit Logs</h2>
      
      <div className="mb-4 space-y-2">
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="User ID"
            value={filters.user_id}
            onChange={(e) => setFilters({ ...filters, user_id: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md"
          />
          <select
            value={filters.action}
            onChange={(e) => setFilters({ ...filters, action: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="">All Actions</option>
            <option value="search">Search</option>
            <option value="add_kyc">Add KYC</option>
            <option value="decrypt">Decrypt</option>
            <option value="login">Login</option>
          </select>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={filters.anomaly_only}
              onChange={(e) => setFilters({ ...filters, anomaly_only: e.target.checked })}
              className="mr-2"
            />
            Anomalies Only
          </label>
        </div>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Field</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Found</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Anomaly</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">IP</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {logs.map((log) => (
                  <tr key={log.id} className={log.anomaly_flag ? 'bg-red-50' : ''}>
                    <td className="px-4 py-2 text-sm">{new Date(log.created_at).toLocaleString()}</td>
                    <td className="px-4 py-2 text-sm">{log.username}</td>
                    <td className="px-4 py-2 text-sm">{log.action}</td>
                    <td className="px-4 py-2 text-sm">{log.field_searched || '-'}</td>
                    <td className="px-4 py-2 text-sm">{log.result_found ? '✓' : '✗'}</td>
                    <td className="px-4 py-2 text-sm">{log.anomaly_flag ? '⚠️' : '-'}</td>
                    <td className="px-4 py-2 text-sm">{log.ip_address}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex justify-between items-center">
            <span className="text-sm text-gray-600">Total: {total}</span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-4 py-2">Page {page}</span>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={page * limit >= total}
                className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
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

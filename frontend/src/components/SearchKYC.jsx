import { useState } from 'react';
import api from '../api/client';
import { computeTrapdoor } from '../crypto/trapdoor';
import { decryptKYC } from '../crypto/aes';
import useAuthStore from '../store/authStore';
import KYCDataTable from './KYCDataTable';

export default function SearchKYC({ onRecordSelect }) {
  const [fieldType, setFieldType] = useState('pan');
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const { role } = useAuthStore();

  const canDecrypt = role === 'admin' || role === 'officer';

  const handleSearch = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setLoading(true);

    try {
      const trapdoor = await computeTrapdoor(keyword);
      const res = await api.post('/kyc/search', {
        field_type: fieldType,
        trapdoor
      });

      if (!res.data.found) {
        setError('No record found');
        return;
      }

      let decryptedData = null;
      if (canDecrypt && res.data.encrypted_dek) {
        try {
          decryptedData = await decryptKYC({
            encrypted_payload: res.data.encrypted_payload,
            iv: res.data.iv,
            encrypted_dek: res.data.encrypted_dek
          });
        } catch (decryptErr) {
          setError('Failed to decrypt record');
          return;
        }
      }

      setResult({
        record_id: res.data.record_id,
        encrypted_payload: res.data.encrypted_payload,
        iv: res.data.iv,
        auth_tag: res.data.auth_tag,
        encrypted_dek: res.data.encrypted_dek,
        decrypted: decryptedData
      });
    } catch (err) {
      if (err.response?.status === 429) {
        setError(err.response?.data?.error || 'Too many searches. You have been temporarily blocked.');
      } else {
        setError(err.response?.data?.error || 'Search failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Search KYC Records</h2>
      <form onSubmit={handleSearch} className="space-y-4 mb-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Field Type</label>
            <select
              value={fieldType}
              onChange={(e) => setFieldType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="pan">PAN</option>
              <option value="aadhaar">Aadhaar</option>
              <option value="name">Name</option>
              <option value="passport">Passport</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Keyword</label>
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
        </div>
        {error && (
          <div className={`text-sm p-3 rounded-md ${
            error.includes('blocked') || error.includes('429')
              ? 'bg-red-100 border border-red-200 text-red-800'
              : 'text-red-600'
          }`}>
            {error}
          </div>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {result && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-bold mb-2">Search Result</h3>
          <p className="text-sm text-gray-600 mb-4">Record ID: {result.record_id}</p>
          
          {canDecrypt && result.decrypted ? (
            <div>
              <h4 className="font-semibold mb-2">Decrypted Data</h4>
              <KYCDataTable data={result.decrypted} />
            </div>
          ) : (
            <div>
              <p className="text-sm text-gray-600 mb-2">
                {role === 'auditor' 
                  ? 'You do not have permission to decrypt this record.'
                  : 'Decryption failed or not available.'}
              </p>
              <p className="text-xs text-gray-500">
                Encrypted payload (base64): {result.encrypted_payload.substring(0, 50)}...
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

import { useEffect, useState } from 'react';
import api from '../api/client';
import { decryptKYC } from '../crypto/aes';
import useAuthStore from '../store/authStore';

export default function RecordView({ record, onClose }) {
  const [decrypted, setDecrypted] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { role } = useAuthStore();

  const canDecrypt = role === 'admin' || role === 'officer';

  useEffect(() => {
    if (record && canDecrypt && record.encrypted_dek) {
      setLoading(true);
      decryptKYC({
        encrypted_payload: record.encrypted_payload,
        iv: record.iv,
        encrypted_dek: record.encrypted_dek
      })
        .then(setDecrypted)
        .catch(err => setError('Decryption failed'))
        .finally(() => setLoading(false));
    }
  }, [record, canDecrypt]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">KYC Record Details</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        
        {loading && <p>Decrypting...</p>}
        {error && <p className="text-red-600">{error}</p>}
        
        {canDecrypt && decrypted ? (
          <pre className="bg-gray-50 p-4 rounded border text-sm overflow-auto">
            {JSON.stringify(decrypted, null, 2)}
          </pre>
        ) : (
          <p className="text-gray-600">
            {role === 'auditor' 
              ? 'You do not have permission to view decrypted data.'
              : 'Decryption not available.'}
          </p>
        )}
      </div>
    </div>
  );
}

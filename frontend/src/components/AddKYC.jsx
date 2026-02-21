import { useState } from 'react';
import api from '../api/client';
import { encryptKYC } from '../crypto/aes';
import { computeTrapdoor } from '../crypto/trapdoor';

export default function AddKYC({ onRecordAdded }) {
  const [formData, setFormData] = useState({
    name: '',
    pan: '',
    aadhaar: '',
    passport: '',
    dob: '',
    address: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Encrypt the KYC data
      const { encrypted_payload, iv, auth_tag, encrypted_dek } = await encryptKYC(formData);

      // Generate trapdoors for searchable fields
      const index = [];
      if (formData.pan) {
        const trapdoor = await computeTrapdoor(formData.pan);
        index.push({ field_type: 'pan', trapdoor });
      }
      if (formData.aadhaar) {
        const trapdoor = await computeTrapdoor(formData.aadhaar);
        index.push({ field_type: 'aadhaar', trapdoor });
      }
      if (formData.name) {
        const trapdoor = await computeTrapdoor(formData.name.toLowerCase());
        index.push({ field_type: 'name', trapdoor });
      }
      if (formData.passport) {
        const trapdoor = await computeTrapdoor(formData.passport);
        index.push({ field_type: 'passport', trapdoor });
      }

      // Send to backend
      const res = await api.post('/kyc/add', {
        encrypted_payload,
        iv,
        auth_tag,
        encrypted_dek,
        index
      });

      setSuccess(`KYC record created successfully! ID: ${res.data.record_id}`);
      setFormData({
        name: '', pan: '', aadhaar: '', passport: '', dob: '', address: '', phone: ''
      });
      setTimeout(() => {
        if (onRecordAdded) onRecordAdded();
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add KYC record');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Add KYC Record</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
            <input
              type="date"
              name="dob"
              value={formData.dob}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">PAN</label>
            <input
              type="text"
              name="pan"
              value={formData.pan}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Aadhaar</label>
            <input
              type="text"
              name="aadhaar"
              value={formData.aadhaar}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Passport</label>
            <input
              type="text"
              name="passport"
              value={formData.passport}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleChange}
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        {success && <div className="text-green-600 text-sm">{success}</div>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Encrypting and storing...' : 'Add KYC Record'}
        </button>
      </form>
    </div>
  );
}

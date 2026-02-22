import { useState } from 'react';
import api from '../api/client';
import { encryptKYC } from '../crypto/aes';
import { computeTrapdoor } from '../crypto/trapdoor';

const initialForm = {
  name: '',
  pan: '',
  aadhaar: '',
  passport: '',
  dob: '',
  address: '',
  phone: ''
};

export default function AddKYC({ onRecordAdded }) {
  const [formData, setFormData] = useState(initialForm);
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const validate = () => {
    const errors = {};

    // Name: required, min length
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    } else if (formData.name.trim().length < 3) {
      errors.name = 'Name must be at least 3 characters';
    }

    // DOB: optional but if present, must be a past date
    if (formData.dob) {
      const dobDate = new Date(formData.dob);
      if (Number.isNaN(dobDate.getTime())) {
        errors.dob = 'Invalid date';
      } else if (dobDate > new Date()) {
        errors.dob = 'Date of birth cannot be in the future';
      }
    }

    // PAN: optional, but if present should match Indian PAN format
    if (formData.pan) {
      const panPattern = /^[A-Z]{5}[0-9]{4}[A-Z]$/i;
      if (!panPattern.test(formData.pan.trim())) {
        errors.pan = 'PAN should be in format AAAAA9999A';
      }
    }

    // Aadhaar: optional, but if present should be 12 digits
    if (formData.aadhaar) {
      const aadhaarPattern = /^[0-9]{12}$/;
      if (!aadhaarPattern.test(formData.aadhaar.trim())) {
        errors.aadhaar = 'Aadhaar must be a 12-digit number';
      }
    }

    // Passport: optional, but if present, basic alphanumeric check
    if (formData.passport) {
      const passportPattern = /^[A-Za-z0-9]{6,10}$/;
      if (!passportPattern.test(formData.passport.trim())) {
        errors.passport = 'Passport should be 6–10 alphanumeric characters';
      }
    }

    // Phone: optional, but if present should be 10 digits
    if (formData.phone) {
      const phonePattern = /^[0-9]{10}$/;
      if (!phonePattern.test(formData.phone.trim())) {
        errors.phone = 'Phone must be a 10-digit number';
      }
    }

    // Address: required (basic)
    if (!formData.address.trim()) {
      errors.address = 'Address is required';
    } else if (formData.address.trim().length < 10) {
      errors.address = 'Address must be at least 10 characters';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear field-specific error on change
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Client-side validation
    const isValid = validate();
    if (!isValid) {
      setError('Please fix the highlighted fields.');
      return;
    }

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
      setFormData(initialForm);
      setFieldErrors({});
      setTimeout(() => {
        if (onRecordAdded) onRecordAdded();
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add KYC record');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Add KYC Record</h2>
          <p className="text-sm text-gray-500 mt-1">
            All data is encrypted in your browser before being sent to the server.
          </p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 
                ${fieldErrors.name ? 'border-red-500' : 'border-gray-300'}`}
            />
            {fieldErrors.name && (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.name}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
            <input
              type="date"
              name="dob"
              value={formData.dob}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 
                ${fieldErrors.dob ? 'border-red-500' : 'border-gray-300'}`}
            />
            {fieldErrors.dob && (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.dob}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">PAN</label>
            <input
              type="text"
              name="pan"
              value={formData.pan}
              onChange={handleChange}
              placeholder="ABCDE1234F"
              className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 
                ${fieldErrors.pan ? 'border-red-500' : 'border-gray-300'}`}
            />
            {fieldErrors.pan && (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.pan}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Aadhaar</label>
            <input
              type="text"
              name="aadhaar"
              value={formData.aadhaar}
              onChange={handleChange}
              placeholder="12-digit number"
              className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 
                ${fieldErrors.aadhaar ? 'border-red-500' : 'border-gray-300'}`}
            />
            {fieldErrors.aadhaar && (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.aadhaar}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Passport</label>
            <input
              type="text"
              name="passport"
              value={formData.passport}
              onChange={handleChange}
              placeholder="Alphanumeric"
              className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 
                ${fieldErrors.passport ? 'border-red-500' : 'border-gray-300'}`}
            />
            {fieldErrors.passport && (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.passport}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="10-digit number"
              className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 
                ${fieldErrors.phone ? 'border-red-500' : 'border-gray-300'}`}
            />
            {fieldErrors.phone && (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.phone}</p>
            )}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Address <span className="text-red-500">*</span>
          </label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleChange}
            rows="3"
            className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 
              ${fieldErrors.address ? 'border-red-500' : 'border-gray-300'}`}
          />
          {fieldErrors.address && (
            <p className="mt-1 text-xs text-red-600">{fieldErrors.address}</p>
          )}
        </div>
        {error && (
          <div className="text-red-600 text-sm bg-red-50 border border-red-100 px-3 py-2 rounded-md">
            {error}
          </div>
        )}
        {success && (
          <div className="text-green-600 text-sm bg-green-50 border border-green-100 px-3 py-2 rounded-md">
            {success}
          </div>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-3
                     rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white
                     font-semibold shadow-md hover:from-blue-700 hover:to-indigo-700
                     focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                     disabled:opacity-60 disabled:cursor-not-allowed transition"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Encrypting and storing...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <span className="text-lg">＋</span>
              Add KYC Record
            </span>
          )}
        </button>
      </form>
    </div>
  );
}

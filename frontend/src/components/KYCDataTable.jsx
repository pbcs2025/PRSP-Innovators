/**
 * Displays decrypted KYC data as a formatted table.
 */
const FIELD_LABELS = {
  name: 'Name',
  pan: 'PAN',
  aadhaar: 'Aadhaar',
  passport: 'Passport',
  dob: 'Date of Birth',
  address: 'Address',
  phone: 'Phone'
};

const FIELD_ORDER = ['name', 'pan', 'aadhaar', 'passport', 'dob', 'address', 'phone'];

export default function KYCDataTable({ data }) {
  if (!data || typeof data !== 'object') return null;

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-1/3">
              Field
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Value
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {FIELD_ORDER.filter(k => k in data).map((key) => (
            <tr key={key}>
              <td className="px-4 py-3 text-sm font-medium text-gray-500">
                {FIELD_LABELS[key] || key}
              </td>
              <td className="px-4 py-3 text-sm text-gray-900">
                {data[key] ?? '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

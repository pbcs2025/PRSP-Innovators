/**
 * Officer Dashboard – Operational workflow
 * Permissions: Add KYC ✅ | Search ✅ | Decrypt ✅ | View Logs ❌ | Manage Users ❌
 */
import { useState } from 'react';
import useAuthStore from '../../store/authStore';
import DashboardLayout from '../DashboardLayout';
import AddKYC from '../AddKYC';
import SearchKYC from '../SearchKYC';
import RecordView from '../RecordView';

export default function OfficerDashboard() {
  const { username, role, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState('add');
  const [selectedRecord, setSelectedRecord] = useState(null);

  const navItems = (
    <>
      <NavBtn active={activeTab === 'add'} onClick={() => setActiveTab('add')}>Add KYC</NavBtn>
      <NavBtn active={activeTab === 'search'} onClick={() => setActiveTab('search')}>Search</NavBtn>
    </>
  );

  return (
    <DashboardLayout
      title="KYC SSE System — Officer"
      role={role}
      username={username}
      logout={logout}
      navItems={navItems}
    >
      <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-800">
        You can add and search KYC records. All data remains encrypted; only authorized users can decrypt.
      </div>

      {activeTab === 'add' && <AddKYC onRecordAdded={() => setActiveTab('search')} />}
      {activeTab === 'search' && <SearchKYC onRecordSelect={setSelectedRecord} />}

      {selectedRecord && (
        <RecordView record={selectedRecord} onClose={() => setSelectedRecord(null)} />
      )}
    </DashboardLayout>
  );
}

function NavBtn({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
        active ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-100'
      }`}
    >
      {children}
    </button>
  );
}

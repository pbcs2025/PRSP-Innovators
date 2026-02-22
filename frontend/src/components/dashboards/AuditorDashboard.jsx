/**
 * Auditor Dashboard – Compliance and audit focus
 * Permissions: Add KYC ❌ | Search ✅ | Decrypt ❌ | View Logs ✅ | Manage Users ❌
 * Auditors can search to verify records exist but cannot view decrypted PII.
 */
import { useState } from 'react';
import useAuthStore from '../../store/authStore';
import DashboardLayout from '../DashboardLayout';
import SearchKYC from '../SearchKYC';
import RecordView from '../RecordView';
import AuditLogs from '../AuditLogs';

export default function AuditorDashboard() {
  const { username, role, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState('logs');
  const [selectedRecord, setSelectedRecord] = useState(null);

  const navItems = (
    <>
      <NavBtn active={activeTab === 'logs'} onClick={() => setActiveTab('logs')}>Audit Logs</NavBtn>
      <NavBtn active={activeTab === 'search'} onClick={() => setActiveTab('search')}>Verify Search</NavBtn>
    </>
  );

  return (
    <DashboardLayout
      title="KYC SSE System — Auditor"
      role={role}
      username={username}
      logout={logout}
      navItems={navItems}
    >
      <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
        You can view audit logs and verify records via search. Decrypted data is not available to auditors.
      </div>

      {activeTab === 'logs' && <AuditLogs />}
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
        active ? 'bg-amber-600 text-white' : 'text-slate-600 hover:bg-slate-100'
      }`}
    >
      {children}
    </button>
  );
}

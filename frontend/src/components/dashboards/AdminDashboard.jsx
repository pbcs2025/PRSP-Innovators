/**
 * Admin Dashboard – Full system control
 * Permissions: Add KYC ✅ | Search ✅ | Decrypt ✅ | View Logs ✅ | Manage Users ✅ | Anomalies ✅
 */
import { useState } from 'react';
import useAuthStore from '../../store/authStore';
import DashboardLayout from '../DashboardLayout';
import AddKYC from '../AddKYC';
import SearchKYC from '../SearchKYC';
import RecordView from '../RecordView';
import AuditLogs from '../AuditLogs';
import UserManagement from '../UserManagement';
import AnomaliesPanel from '../AnomaliesPanel';

export default function AdminDashboard() {
  const { username, role, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState('add');
  const [selectedRecord, setSelectedRecord] = useState(null);

  const navItems = (
    <>
      <NavBtn active={activeTab === 'add'} onClick={() => setActiveTab('add')}>Add KYC</NavBtn>
      <NavBtn active={activeTab === 'search'} onClick={() => setActiveTab('search')}>Search</NavBtn>
      <NavBtn active={activeTab === 'logs'} onClick={() => setActiveTab('logs')}>Audit Logs</NavBtn>
      <NavBtn active={activeTab === 'anomalies'} onClick={() => setActiveTab('anomalies')}>Anomalies</NavBtn>
      <NavBtn active={activeTab === 'users'} onClick={() => setActiveTab('users')}>Users</NavBtn>
    </>
  );

  return (
    <DashboardLayout
      title="KYC SSE System — Admin"
      role={role}
      username={username}
      logout={logout}
      navItems={navItems}
    >
      {activeTab === 'add' && <AddKYC onRecordAdded={() => setActiveTab('search')} />}
      {activeTab === 'search' && <SearchKYC onRecordSelect={setSelectedRecord} />}
      {activeTab === 'logs' && <AuditLogs />}
      {activeTab === 'anomalies' && <AnomaliesPanel />}
      {activeTab === 'users' && <UserManagement />}

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
        active ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'
      }`}
    >
      {children}
    </button>
  );
}

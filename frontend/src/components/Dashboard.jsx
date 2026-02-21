import { useState } from 'react';
import useAuthStore from '../store/authStore';
import AddKYC from './AddKYC';
import SearchKYC from './SearchKYC';
import RecordView from './RecordView';
import AuditLogs from './AuditLogs';
import UserManagement from './UserManagement';

export default function Dashboard() {
  const { username, role, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState('add');
  const [selectedRecord, setSelectedRecord] = useState(null);

  const canAddKYC = role === 'admin' || role === 'officer';
  const canManageUsers = role === 'admin';
  const canViewLogs = role === 'admin' || role === 'auditor';

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <h1 className="text-xl font-bold">KYC SSE System</h1>
              <div className="flex space-x-4">
                {canAddKYC && (
                  <button
                    onClick={() => setActiveTab('add')}
                    className={`px-3 py-2 rounded ${activeTab === 'add' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
                  >
                    Add KYC
                  </button>
                )}
                <button
                  onClick={() => setActiveTab('search')}
                  className={`px-3 py-2 rounded ${activeTab === 'search' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
                >
                  Search
                </button>
                {canViewLogs && (
                  <button
                    onClick={() => setActiveTab('logs')}
                    className={`px-3 py-2 rounded ${activeTab === 'logs' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
                  >
                    Audit Logs
                  </button>
                )}
                {canManageUsers && (
                  <button
                    onClick={() => setActiveTab('users')}
                    className={`px-3 py-2 rounded ${activeTab === 'users' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
                  >
                    Users
                  </button>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {username} ({role})
              </span>
              <button
                onClick={logout}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'add' && canAddKYC && <AddKYC onRecordAdded={() => setActiveTab('search')} />}
        {activeTab === 'search' && <SearchKYC onRecordSelect={setSelectedRecord} />}
        {activeTab === 'logs' && canViewLogs && <AuditLogs />}
        {activeTab === 'users' && canManageUsers && <UserManagement />}
        {selectedRecord && (
          <RecordView
            record={selectedRecord}
            onClose={() => setSelectedRecord(null)}
          />
        )}
      </main>
    </div>
  );
}

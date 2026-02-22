import useAuthStore from '../store/authStore';
import AdminDashboard from './dashboards/AdminDashboard';
import OfficerDashboard from './dashboards/OfficerDashboard';
import AuditorDashboard from './dashboards/AuditorDashboard';

/**
 * Routes to the appropriate role-specific dashboard.
 * Each role has a tailored UX reflecting their permissions.
 */
export default function Dashboard() {
  const { role } = useAuthStore();

  switch (role) {
    case 'admin':
      return <AdminDashboard />;
    case 'officer':
      return <OfficerDashboard />;
    case 'auditor':
      return <AuditorDashboard />;
    default:
      return <AdminDashboard />; // fallback
  }
}

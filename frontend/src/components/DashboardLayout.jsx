/**
 * Shared layout for all role-specific dashboards.
 * Provides nav, user badge, and logout.
 */
export default function DashboardLayout({ title, role, username, logout, children, navItems }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-8">
              <h1 className="text-xl font-bold text-slate-800">{title}</h1>
              <div className="flex gap-1">{navItems}</div>
            </div>
            <div className="flex items-center gap-4">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 capitalize">
                {role}
              </span>
              <span className="text-sm text-slate-600">{username}</span>
              <button
                onClick={logout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>
    </div>
  );
}

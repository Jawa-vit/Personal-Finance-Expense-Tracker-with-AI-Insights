import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/', icon: 'ti-layout-dashboard', label: 'Dashboard' },
  { to: '/transactions', icon: 'ti-list', label: 'Transactions' },
  { to: '/budget', icon: 'ti-target', label: 'Budget' },
  { to: '/reports', icon: 'ti-chart-bar', label: 'Reports' },
  { to: '/ai', icon: 'ti-robot', label: 'AI Insights' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="w-52 flex-shrink-0 bg-white border-r border-gray-100 flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="p-5 border-b border-gray-100">
        <div className="text-base font-semibold text-gray-800">💰 FinTrack</div>
        <div className="text-xs text-gray-400 mt-0.5">Personal Finance</div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-brand-500 text-white'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
              }`
            }
          >
            <i className={`ti ${icon} text-base`} aria-hidden="true" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="p-3 border-t border-gray-100">
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg">
          <div className="w-8 h-8 rounded-full bg-brand-50 flex items-center justify-center text-brand-600 font-semibold text-sm">
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-gray-800 truncate">{user?.name}</div>
            <div className="text-xs text-gray-400 truncate">{user?.email}</div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full mt-1 flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all"
        >
          <i className="ti ti-logout text-base" aria-hidden="true" />
          Log out
        </button>
      </div>
    </aside>
  );
}

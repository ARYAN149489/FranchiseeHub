import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, DollarSign, LogOut, Award } from 'lucide-react';

export default function FranchiseeSidebar({ profile }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('userType');
    localStorage.removeItem('email');
    navigate('/franchisee/login');
  };

  return (
    <div className="w-64 bg-gradient-to-b from-green-600 to-emerald-700 text-white flex-shrink-0">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-8">
          <Award size={32} />
          <span className="text-xl font-bold">FranchiseHub</span>
        </div>

        {/* Profile */}
        {profile && (
          <div className="bg-white/10 rounded-lg p-4 mb-6">
            <div className="font-semibold text-lg">{profile.fname} {profile.lname}</div>
            <div className="text-sm text-green-100">{profile.email}</div>
            {profile.buis_name && (
              <div className="text-xs text-green-200 mt-1">{profile.buis_name}</div>
            )}
          </div>
        )}

        <nav className="space-y-2">
          <NavLink
            to="/franchisee/dashboard"
            end
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive ? 'bg-white/20' : 'hover:bg-white/10'
              }`
            }
          >
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/franchisee/sales"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive ? 'bg-white/20' : 'hover:bg-white/10'
              }`
            }
          >
            <DollarSign size={20} />
            <span>Sales Management</span>
          </NavLink>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 transition-colors mt-4"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </nav>
      </div>
    </div>
  );
}

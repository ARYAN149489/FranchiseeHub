import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, DollarSign, LogOut, Award, Calendar, BarChart3, History, Settings } from 'lucide-react';

export default function FranchiseeSidebar({ profile }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('userType');
    localStorage.removeItem('email');
    navigate('/login');
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
          </div>
        )}

        <nav className="space-y-2">
          <NavLink
            to="/franchisee"
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
            to="/franchisee/today"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive ? 'bg-white/20' : 'hover:bg-white/10'
              }`
            }
          >
            <DollarSign size={20} />
            <span>Add Sales</span>
          </NavLink>

          <NavLink
            to="/franchisee/history"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive ? 'bg-white/20' : 'hover:bg-white/10'
              }`
            }
          >
            <History size={20} />
            <span>Sales History</span>
          </NavLink>

          <NavLink
            to="/franchisee/calendar"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive ? 'bg-white/20' : 'hover:bg-white/10'
              }`
            }
          >
            <Calendar size={20} />
            <span>Calendar View</span>
          </NavLink>

          <NavLink
            to="/franchisee/analysis"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive ? 'bg-white/20' : 'hover:bg-white/10'
              }`
            }
          >
            <BarChart3 size={20} />
            <span>Analysis</span>
          </NavLink>

          <NavLink
            to="/franchisee/settings"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive ? 'bg-white/20' : 'hover:bg-white/10'
              }`
            }
          >
            <Settings size={20} />
            <span>Settings</span>
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

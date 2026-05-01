import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Bell, LogOut, User, Activity, Wind, Cloud, Menu, X, Home } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const NAV_LINKS = [
  { to: '/',            label: 'Home',        icon: Home     },
  { to: '/earthquakes', label: 'Earthquakes', icon: Activity },
  { to: '/typhoons',    label: 'Typhoons',    icon: Wind     },
  { to: '/weather',     label: 'Weather',     icon: Cloud    },
];

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setMobileOpen(false);
  };

  const isActive = (path) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 text-ink font-bold text-lg tracking-tight shrink-0">
            <img src="/logo.png" alt="MataBayan" className="h-8 w-auto" />
            <span>MataBayan</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive(to)
                    ? 'bg-gray-100 text-ink'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Icon size={15} />
                {label}
              </Link>
            ))}

            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive('/dashboard')
                      ? 'bg-gray-100 text-ink'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Bell size={15} />
                  Dashboard
                </Link>
                <div className="flex items-center gap-2 ml-3 pl-3 border-l border-gray-200">
                  <span className="text-sm text-gray-600 flex items-center gap-1.5">
                    <User size={15} className="text-gray-400" />
                    {user.name}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-100 px-3 py-2 rounded-lg transition-all"
                  >
                    <LogOut size={15} />
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2 ml-3">
                <Link to="/login" className="btn-secondary text-sm px-4 py-2">Log In</Link>
                <Link to="/signup" className="btn-primary text-sm px-4 py-2">Sign Up</Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-50 transition-all"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-6 py-4 space-y-1">
          {NAV_LINKS.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive(to) ? 'bg-gray-100 text-ink' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}

          {user ? (
            <>
              <Link
                to="/dashboard"
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive('/dashboard') ? 'bg-gray-100 text-ink' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Bell size={16} />
                Dashboard
              </Link>
              <div className="pt-3 mt-3 border-t border-gray-100 flex items-center justify-between">
                <span className="text-sm text-gray-600 flex items-center gap-1.5">
                  <User size={15} className="text-gray-400" />
                  {user.name}
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100 transition-all"
                >
                  <LogOut size={15} />
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div className="flex gap-2 pt-3 mt-3 border-t border-gray-100">
              <Link to="/login" onClick={() => setMobileOpen(false)} className="btn-secondary flex-1 text-center text-sm py-2">Log In</Link>
              <Link to="/signup" onClick={() => setMobileOpen(false)} className="btn-primary flex-1 text-center text-sm py-2">Sign Up</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, LogOut, User, Activity, Wind, Cloud } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="bg-white border-b border-gray-100 shadow-soft sticky top-0 z-50">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2.5 text-ink font-bold text-lg tracking-tight">
            <img src="/logo.png" alt="MataBayan" className="h-8 w-auto" />
            <span>MataBayan</span>
          </Link>

          <div className="flex items-center gap-1">
            <Link to="/" className="px-3 py-2 text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all">Home</Link>
            <Link to="/earthquakes" className="px-3 py-2 text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all flex items-center gap-1.5"><Activity size={15} /> Earthquakes</Link>
            <Link to="/typhoons" className="px-3 py-2 text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all flex items-center gap-1.5"><Wind size={15} /> Typhoons</Link>
            <Link to="/weather" className="px-3 py-2 text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all flex items-center gap-1.5"><Cloud size={15} /> Weather</Link>

            {user ? (
              <>
                <Link to="/dashboard" className="px-3 py-2 text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all flex items-center gap-1.5">
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
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Bell, LogOut, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="bg-blue-900 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold">
            <Shield size={28} />
            <span>MataBayan</span>
          </Link>

          <div className="flex items-center gap-6">
            <Link to="/" className="hover:text-blue-200 transition">Home</Link>
            <Link to="/alerts" className="hover:text-blue-200 transition">Alerts</Link>
            
            {user ? (
              <>
                <Link to="/dashboard" className="hover:text-blue-200 transition flex items-center gap-1">
                  <Bell size={18} />
                  My Dashboard
                </Link>
                <div className="flex items-center gap-3 ml-4 pl-4 border-l border-blue-700">
                  <span className="text-sm flex items-center gap-2">
                    <User size={18} />
                    {user.name}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1 bg-blue-800 hover:bg-blue-700 px-4 py-2 rounded transition"
                  >
                    <LogOut size={18} />
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="bg-blue-700 hover:bg-blue-600 px-5 py-2 rounded font-semibold transition"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="bg-yellow-500 hover:bg-yellow-400 text-blue-900 px-5 py-2 rounded font-semibold transition"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

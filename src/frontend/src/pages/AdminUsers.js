import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, MapPin, Globe, Loader } from 'lucide-react';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/users');
      setUsers(response.data.data);
    } catch (err) {
      setError('Failed to load users. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-muted flex items-center justify-center">
      <div className="flex items-center gap-2 text-subtle text-sm">
        <Loader size={16} className="animate-spin" />
        Loading users...
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-muted">
      <div className="container mx-auto px-6 py-10 max-w-5xl">

        {/* Page header */}
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-subtle mb-1">Admin</p>
          <h1 className="text-2xl font-bold text-ink tracking-tight">Registered Users</h1>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-700 rounded-2xl p-4 mb-6 text-sm">
            {error}
          </div>
        )}

        {/* Summary card */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-card p-5 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100">
              <Users size={17} className="text-gray-600" />
            </div>
            <p className="text-sm font-semibold text-ink">Total Users</p>
          </div>
          <p className="text-2xl font-bold text-ink">{users.length}</p>
        </div>

        {/* User list */}
        <div className="space-y-3">
          {users.map(user => (
            <div key={user._id} className="bg-white border border-gray-200 rounded-2xl shadow-card hover:shadow-card-hover transition-shadow duration-200 p-6">

              {/* Name + date */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-ink">{user.name}</h3>
                  <p className="text-xs text-subtle mt-0.5">{user.email}</p>
                </div>
                <span className="text-xs text-gray-400 bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-lg shrink-0">
                  {new Date(user.createdAt).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })}
                </span>
              </div>

              {/* Location + language */}
              <div className="grid md:grid-cols-2 gap-3 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <MapPin size={14} className="text-gray-400 shrink-0" />
                  <span>{user.preferences?.cityMunicipality}, {user.preferences?.province}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <Globe size={14} className="text-gray-400 shrink-0" />
                  <span>{user.preferences?.language === 'en' ? 'English' : 'Filipino'}</span>
                </div>
              </div>

              {/* Alert type badges */}
              <div className="mt-3 flex items-center gap-2 flex-wrap">
                <span className="text-xs text-subtle font-medium">Alerts:</span>
                {Object.entries(user.preferences?.alertTypes || {})
                  .filter(([_, enabled]) => enabled)
                  .map(([type]) => (
                    <span key={type} className="text-xs bg-gray-100 border border-gray-200 text-gray-600 px-2 py-0.5 rounded-lg capitalize">
                      {type}
                    </span>
                  ))}
              </div>

            </div>
          ))}

          {users.length === 0 && !error && (
            <div className="bg-white border border-gray-200 rounded-2xl shadow-card p-16 text-center">
              <p className="text-subtle text-sm">No registered users yet.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default AdminUsers;

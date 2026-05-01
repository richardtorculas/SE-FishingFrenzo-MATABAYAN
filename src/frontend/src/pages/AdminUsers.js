import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, MapPin, Globe } from 'lucide-react';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/users');
      setUsers(response.data.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-muted flex items-center justify-center">
      <p className="text-subtle text-sm">Loading users...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-muted">
      <div className="container mx-auto px-6 py-10">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-subtle mb-1">Admin</p>
          <div className="flex items-center gap-3">
            <Users className="text-gray-700" size={24} />
            <h1 className="text-2xl font-bold text-ink tracking-tight">Registered Users</h1>
          </div>
        </div>

        <div className="card mb-5 flex items-center justify-between">
          <p className="text-sm text-subtle">Total registered users</p>
          <p className="text-2xl font-bold text-ink">{users.length}</p>
        </div>

        <div className="space-y-3">
          {users.map(user => (
            <div key={user._id} className="card hover:shadow-card-hover transition-shadow duration-200">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-base font-semibold text-ink">{user.name}</h3>
                  <p className="text-sm text-subtle">{user.email}</p>
                </div>
                <span className="text-xs text-gray-400 bg-gray-50 px-2.5 py-1 rounded-lg">
                  {new Date(user.createdAt).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })}
                </span>
              </div>

              <div className="grid md:grid-cols-2 gap-3 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <MapPin size={15} className="text-gray-400 shrink-0" />
                  <span>{user.preferences?.cityMunicipality}, {user.preferences?.province}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Globe size={15} className="text-gray-400 shrink-0" />
                  <span>{user.preferences?.language === 'en' ? 'English' : 'Filipino'}</span>
                </div>
              </div>

              <div className="mt-3 text-xs text-subtle">
                <span className="font-semibold text-gray-600">Alert Types: </span>
                {Object.entries(user.preferences?.alertTypes || {})
                  .filter(([_, enabled]) => enabled)
                  .map(([type]) => (
                    <span key={type} className="inline-block bg-gray-100 text-gray-600 px-2 py-0.5 rounded-lg mr-1.5 capitalize">{type}</span>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;

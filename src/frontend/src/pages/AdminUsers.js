import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, MapPin, Globe } from 'lucide-react';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

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

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Users className="text-blue-600" size={32} />
          <h1 className="text-3xl font-bold text-gray-800">Registered Users</h1>
        </div>

        <div className="bg-white rounded-lg shadow p-4 mb-4">
          <p className="text-gray-600">Total Users: <strong>{users.length}</strong></p>
        </div>

        <div className="grid gap-4">
          {users.map(user => (
            <div key={user._id} className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">{user.name}</h3>
                  <p className="text-gray-600">{user.email}</p>
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(user.createdAt).toLocaleDateString()}
                </span>
              </div>

              <div className="mt-4 grid md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-gray-700">
                  <MapPin size={18} className="text-blue-600" />
                  <span>{user.preferences?.cityMunicipality}, {user.preferences?.province}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <Globe size={18} className="text-green-600" />
                  <span>{user.preferences?.language === 'en' ? 'English' : 'Filipino'}</span>
                </div>
              </div>

              <div className="mt-3 text-sm text-gray-600">
                <strong>Alert Types:</strong> {Object.entries(user.preferences?.alertTypes || {})
                  .filter(([_, enabled]) => enabled)
                  .map(([type]) => type)
                  .join(', ')}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;

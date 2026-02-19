import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Bell, MapPin, Globe } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Welcome, {user?.name}!
        </h1>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center gap-3 mb-4">
              <MapPin className="text-blue-600" size={24} />
              <h2 className="text-xl font-semibold">Your Location</h2>
            </div>
            <p className="text-gray-700">
              <strong>Province:</strong> {user?.preferences?.province}
            </p>
            <p className="text-gray-700">
              <strong>City/Municipality:</strong> {user?.preferences?.cityMunicipality}
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center gap-3 mb-4">
              <Globe className="text-green-600" size={24} />
              <h2 className="text-xl font-semibold">Preferences</h2>
            </div>
            <p className="text-gray-700">
              <strong>Language:</strong> {user?.preferences?.language === 'en' ? 'English' : 'Filipino'}
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center gap-3 mb-4">
            <Bell className="text-yellow-600" size={24} />
            <h2 className="text-xl font-semibold">Active Alerts</h2>
          </div>
          <p className="text-gray-600">No active alerts for your area at this time.</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

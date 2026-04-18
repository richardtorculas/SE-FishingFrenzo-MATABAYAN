import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Bell, MapPin, Globe, Cloud } from 'lucide-react';

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

        <div className="mt-6 grid md:grid-cols-3 gap-4">
          <Link to="/weather" className="bg-sky-500 hover:bg-sky-600 text-white p-5 rounded-lg shadow flex items-center gap-3 transition">
            <Cloud size={28} />
            <div>
              <p className="font-bold">Daily Weather</p>
              <p className="text-xs opacity-80">View weather for {user?.preferences?.province || 'your area'}</p>
            </div>
          </Link>
          <Link to="/earthquakes" className="bg-red-600 hover:bg-red-700 text-white p-5 rounded-lg shadow flex items-center gap-3 transition">
            <span className="text-2xl">🌍</span>
            <div>
              <p className="font-bold">Earthquake Monitor</p>
              <p className="text-xs opacity-80">Latest PHIVOLCS data</p>
            </div>
          </Link>
          <Link to="/typhoons" className="bg-blue-600 hover:bg-blue-700 text-white p-5 rounded-lg shadow flex items-center gap-3 transition">
            <span className="text-2xl">🌀</span>
            <div>
              <p className="font-bold">Typhoon Monitor</p>
              <p className="text-xs opacity-80">Active cyclones — PAR</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

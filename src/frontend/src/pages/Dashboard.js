import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Bell, MapPin, Globe, Cloud, Pencil, Check, X } from 'lucide-react';
import { provinces, citiesByProvince } from '../utils/phLocations';

const Dashboard = () => {
  const { user, updateUser } = useAuth();

  const [editing, setEditing] = useState(false);
  const [province, setProvince] = useState(user?.preferences?.province || '');
  const [city, setCity] = useState(user?.preferences?.cityMunicipality || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const availableCities = province ? (citiesByProvince[province] || []).sort() : [];

  const handleProvinceChange = (e) => {
    setProvince(e.target.value);
    setCity('');
    setError(null);
  };

  const handleSave = async () => {
    if (!province) return setError('Please select a province.');
    if (!city) return setError('Please select a city/municipality.');

    setSaving(true);
    setError(null);
    try {
      const res = await axios.patch(
        'http://localhost:5000/api/auth/location',
        { province, cityMunicipality: city },
        { withCredentials: true }
      );
      updateUser(res.data.user);
      setSuccess(true);
      setEditing(false);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update location.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setProvince(user?.preferences?.province || '');
    setCity(user?.preferences?.cityMunicipality || '');
    setError(null);
    setEditing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Welcome, {user?.name}!
        </h1>

        <div className="grid md:grid-cols-2 gap-6 mb-8">

          {/* Location Card */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <MapPin className="text-blue-600" size={24} />
                <h2 className="text-xl font-semibold">Your Location</h2>
              </div>
              {!editing && (
                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 transition"
                >
                  <Pencil size={14} /> Edit
                </button>
              )}
            </div>

            {!editing ? (
              <>
                <p className="text-gray-700"><strong>Province:</strong> {user?.preferences?.province || '—'}</p>
                <p className="text-gray-700"><strong>City/Municipality:</strong> {user?.preferences?.cityMunicipality || '—'}</p>
                {success && (
                  <p className="text-green-600 text-sm mt-2">✅ Location updated successfully.</p>
                )}
              </>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Province</label>
                  <select
                    value={province}
                    onChange={handleProvinceChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select province...</option>
                    {provinces.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City / Municipality</label>
                  <select
                    value={city}
                    onChange={e => { setCity(e.target.value); setError(null); }}
                    disabled={!province}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">Select city/municipality...</option>
                    {availableCities.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {error && <p className="text-red-600 text-sm">{error}</p>}

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-60"
                  >
                    <Check size={14} />
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition"
                  >
                    <X size={14} /> Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Preferences Card */}
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

        {/* Active Alerts */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Bell className="text-yellow-600" size={24} />
            <h2 className="text-xl font-semibold">Active Alerts</h2>
          </div>
          <p className="text-gray-600">
            {user?.preferences?.province
              ? `No active alerts for ${user.preferences.province} at this time.`
              : 'Set your location to see alerts for your area.'}
          </p>
        </div>

        {/* Quick Links */}
        <div className="grid md:grid-cols-3 gap-4">
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

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Bell, MapPin, Globe, Cloud, Pencil, Check, X, Activity, Wind } from 'lucide-react';
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
        `${process.env.REACT_APP_API_URL}/api/auth/location`,
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
    <div className="min-h-screen bg-muted">
      <div className="container mx-auto px-6 py-10">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-subtle mb-1">Dashboard</p>
          <h1 className="text-3xl font-bold text-ink tracking-tight">Welcome, {user?.name}</h1>
        </div>

        <div className="grid md:grid-cols-2 gap-5 mb-5">
          {/* Location Card */}
          <div className="card">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gray-50 rounded-xl flex items-center justify-center">
                  <MapPin className="text-gray-600" size={18} />
                </div>
                <h2 className="text-base font-semibold text-ink">Your Location</h2>
              </div>
              {!editing && (
                <button onClick={() => setEditing(true)} className="flex items-center gap-1.5 text-xs text-subtle hover:text-ink transition-colors">
                  <Pencil size={13} /> Edit
                </button>
              )}
            </div>

            {!editing ? (
              <div className="space-y-2">
                <p className="text-sm text-gray-700"><span className="text-subtle">Province:</span> <span className="font-medium">{user?.preferences?.province || '—'}</span></p>
                <p className="text-sm text-gray-700"><span className="text-subtle">City/Municipality:</span> <span className="font-medium">{user?.preferences?.cityMunicipality || '—'}</span></p>
                {success && <p className="text-emerald-600 text-xs mt-2 font-medium">Location updated successfully.</p>}
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Province</label>
                  <select value={province} onChange={handleProvinceChange} className="input-field">
                    <option value="">Select province...</option>
                    {provinces.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">City / Municipality</label>
                  <select value={city} onChange={e => { setCity(e.target.value); setError(null); }} disabled={!province} className="input-field disabled:bg-gray-50 disabled:cursor-not-allowed">
                    <option value="">Select city/municipality...</option>
                    {availableCities.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                {error && <p className="text-red-600 text-xs">{error}</p>}
                <div className="flex gap-2 pt-1">
                  <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-1.5 text-xs px-4 py-2">
                    <Check size={13} /> {saving ? 'Saving...' : 'Save'}
                  </button>
                  <button onClick={handleCancel} className="btn-secondary flex items-center gap-1.5 text-xs px-4 py-2">
                    <X size={13} /> Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Preferences Card */}
          <div className="card">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 bg-gray-50 rounded-xl flex items-center justify-center">
                <Globe className="text-gray-600" size={18} />
              </div>
              <h2 className="text-base font-semibold text-ink">Preferences</h2>
            </div>
            <p className="text-sm text-gray-700">
              <span className="text-subtle">Language:</span>{' '}
              <span className="font-medium">{user?.preferences?.language === 'en' ? 'English' : 'Filipino'}</span>
            </p>
          </div>
        </div>

        {/* Active Alerts */}
        <div className="card mb-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 bg-gray-50 rounded-xl flex items-center justify-center">
              <Bell className="text-gray-600" size={18} />
            </div>
            <h2 className="text-base font-semibold text-ink">Active Alerts</h2>
          </div>
          <p className="text-sm text-subtle">
            {user?.preferences?.province
              ? `No active alerts for ${user.preferences.province} at this time.`
              : 'Set your location to see alerts for your area.'}
          </p>
        </div>

        {/* Quick Links */}
        <div className="grid md:grid-cols-3 gap-4">
          <Link to="/weather" className="card hover:shadow-card-hover transition-all duration-200 flex items-center gap-4 group">
            <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center group-hover:bg-gray-100 transition-colors">
              <Cloud size={20} className="text-gray-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-ink">Daily Weather</p>
              <p className="text-xs text-subtle">{user?.preferences?.province || 'Your area'}</p>
            </div>
          </Link>
          <Link to="/earthquakes" className="card hover:shadow-card-hover transition-all duration-200 flex items-center gap-4 group">
            <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center group-hover:bg-gray-100 transition-colors">
              <Activity size={20} className="text-gray-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-ink">Earthquake Monitor</p>
              <p className="text-xs text-subtle">Latest PHIVOLCS data</p>
            </div>
          </Link>
          <Link to="/typhoons" className="card hover:shadow-card-hover transition-all duration-200 flex items-center gap-4 group">
            <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center group-hover:bg-gray-100 transition-colors">
              <Wind size={20} className="text-gray-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-ink">Typhoon Monitor</p>
              <p className="text-xs text-subtle">Active cyclones — PAR</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

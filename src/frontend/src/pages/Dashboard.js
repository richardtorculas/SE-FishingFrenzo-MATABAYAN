import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Bell, MapPin, Globe, Cloud, Pencil, Check, X, Activity, Wind } from 'lucide-react';
import { provinces, citiesByProvince } from '../utils/phLocations';

const CardHeader = ({ icon: Icon, title }) => (
  <div className="flex items-center gap-3 mb-5">
    <div className="w-9 h-9 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100">
      <Icon className="text-gray-600" size={17} />
    </div>
    <h2 className="text-sm font-semibold text-ink">{title}</h2>
  </div>
);

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
      <div className="container mx-auto px-6 py-10 max-w-5xl">

        {/* Page header */}
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-subtle mb-1">Dashboard</p>
          <h1 className="text-2xl font-bold text-ink tracking-tight">Welcome, {user?.name}</h1>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-4">

          {/* Location Card */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-card p-6">
            <div className="flex items-center justify-between mb-5">
              <CardHeader icon={MapPin} title="Your Location" />
              {!editing && (
                <button onClick={() => setEditing(true)} className="flex items-center gap-1.5 text-xs text-subtle hover:text-ink transition-colors -mt-5">
                  <Pencil size={13} /> Edit
                </button>
              )}
            </div>

            {!editing ? (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-subtle">Province</span>
                  <span className="font-medium text-ink">{user?.preferences?.province || '—'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-subtle">City / Municipality</span>
                  <span className="font-medium text-ink">{user?.preferences?.cityMunicipality || '—'}</span>
                </div>
                {success && (
                  <p className="text-emerald-600 text-xs mt-2 font-medium pt-2 border-t border-gray-100">
                    Location updated successfully.
                  </p>
                )}
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
          <div className="bg-white border border-gray-200 rounded-2xl shadow-card p-6">
            <CardHeader icon={Globe} title="Preferences" />
            <div className="flex justify-between text-sm">
              <span className="text-subtle">Language</span>
              <span className="font-medium text-ink">
                {user?.preferences?.language === 'en' ? 'English' : 'Filipino'}
              </span>
            </div>
          </div>
        </div>

        {/* Active Alerts */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-card p-6 mb-4">
          <CardHeader icon={Bell} title="Active Alerts" />
          <p className="text-sm text-subtle">
            {user?.preferences?.province
              ? `No active alerts for ${user.preferences.province} at this time.`
              : 'Set your location to see alerts for your area.'}
          </p>
        </div>

        {/* Quick Links */}
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { to: '/weather',     icon: Cloud,    label: 'Daily Weather',     sub: user?.preferences?.province || 'Your area' },
            { to: '/earthquakes', icon: Activity, label: 'Earthquake Monitor', sub: 'Latest PHIVOLCS data' },
            { to: '/typhoons',    icon: Wind,     label: 'Typhoon Monitor',    sub: 'Active cyclones — PAR' },
          ].map(({ to, icon: Icon, label, sub }) => (
            <Link
              key={to}
              to={to}
              className="bg-white border border-gray-200 rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-200 flex items-center gap-4 p-5 group"
            >
              <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100 group-hover:bg-gray-100 transition-colors shrink-0">
                <Icon size={18} className="text-gray-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-ink">{label}</p>
                <p className="text-xs text-subtle">{sub}</p>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </div>
  );
};

export default Dashboard;

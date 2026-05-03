import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { MapPin, Globe, Pencil, Check, X, Phone } from 'lucide-react';
import { provinces, citiesByProvince } from '../utils/phLocations';

const CardHeader = ({ icon: Icon, title }) => (
  <div className="flex items-center gap-3 mb-5">
    <div className="w-9 h-9 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100">
      <Icon className="text-gray-600" size={17} />
    </div>
    <h2 className="text-sm font-semibold text-ink">{title}</h2>
  </div>
);

const Profile = () => {
  const { user, updateUser } = useAuth();

  // Location card state
  const [editingLocation, setEditingLocation] = useState(false);
  const [province, setProvince] = useState(user?.preferences?.province || '');
  const [city, setCity] = useState(user?.preferences?.cityMunicipality || '');
  const [savingLocation, setSavingLocation] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [locationSuccess, setLocationSuccess] = useState(false);

  // Contact & Notifications card state
  const [editingContact, setEditingContact] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
  const [notificationPreferences, setNotificationPreferences] = useState(user?.notificationPreferences || {
    smsEnabled: false,
    inAppEnabled: true
  });
  const [savingContact, setSavingContact] = useState(false);
  const [contactError, setContactError] = useState(null);
  const [contactSuccess, setContactSuccess] = useState(false);

  const availableCities = province ? (citiesByProvince[province] || []).sort() : [];

  // Sync state with user context
  useEffect(() => {
    if (user) {
      setProvince(user?.preferences?.province || '');
      setCity(user?.preferences?.cityMunicipality || '');
      setPhoneNumber(user?.phoneNumber || '');
      setNotificationPreferences(user?.notificationPreferences || {
        smsEnabled: false,
        inAppEnabled: true
      });
    }
  }, [user]);

  // ========== LOCATION HANDLERS ==========
  const handleProvinceChange = (e) => {
    setProvince(e.target.value);
    setCity('');
    setLocationError(null);
  };

  const handleSaveLocation = async () => {
    if (!province) return setLocationError('Please select a province.');
    if (!city) return setLocationError('Please select a city/municipality.');
    
    setSavingLocation(true);
    setLocationError(null);
    try {
      const res = await axios.patch(
        `${process.env.REACT_APP_API_URL}/api/auth/location`,
        { province, cityMunicipality: city },
        { withCredentials: true }
      );

      // Fetch fresh user data
      const freshUserRes = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/auth/me`,
        { withCredentials: true }
      );

      updateUser(freshUserRes.data.user);
      setLocationSuccess(true);
      setEditingLocation(false);
      setTimeout(() => setLocationSuccess(false), 3000);
    } catch (err) {
      setLocationError(err.response?.data?.message || 'Failed to update location.');
    } finally {
      setSavingLocation(false);
    }
  };

  const handleCancelLocation = () => {
    setProvince(user?.preferences?.province || '');
    setCity(user?.preferences?.cityMunicipality || '');
    setLocationError(null);
    setEditingLocation(false);
  };

  // ========== CONTACT & NOTIFICATIONS HANDLERS ==========
  const handleNotificationChange = (channel) => {
    setNotificationPreferences(prev => ({
      ...prev,
      [channel]: !prev[channel]
    }));
  };

  const handleSaveContact = async () => {
    setSavingContact(true);
    setContactError(null);
    try {
      const res = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/user/preferences`,
        {
          phoneNumber,
          notificationPreferences
        },
        { withCredentials: true }
      );

      // Fetch fresh user data
      const freshUserRes = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/auth/me`,
        { withCredentials: true }
      );

      updateUser(freshUserRes.data.user);
      setContactSuccess(true);
      setEditingContact(false);
      setTimeout(() => setContactSuccess(false), 3000);
    } catch (err) {
      setContactError(err.response?.data?.message || 'Failed to update contact settings.');
    } finally {
      setSavingContact(false);
    }
  };

  const handleCancelContact = () => {
    setPhoneNumber(user?.phoneNumber || '');
    setNotificationPreferences(user?.notificationPreferences || {
      smsEnabled: false,
      inAppEnabled: true
    });
    setContactError(null);
    setEditingContact(false);
  };

  return (
    <div className="min-h-screen bg-muted">
      <div className="container mx-auto px-6 py-10 max-w-5xl">

        {/* Page header */}
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-subtle mb-1">Profile</p>
          <h1 className="text-2xl font-bold text-ink tracking-tight">{user?.name}</h1>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-4">

          {/* Location Card */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-card p-6">
            <div className="flex items-center justify-between mb-5">
              <CardHeader icon={MapPin} title="Your Location" />
              {!editingLocation && (
                <button onClick={() => setEditingLocation(true)} className="flex items-center gap-1.5 text-xs text-subtle hover:text-ink transition-colors -mt-5">
                  <Pencil size={13} /> Edit
                </button>
              )}
            </div>

            {!editingLocation ? (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-subtle">Province</span>
                  <span className="font-medium text-ink">{user?.preferences?.province || '—'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-subtle">City / Municipality</span>
                  <span className="font-medium text-ink">{user?.preferences?.cityMunicipality || '—'}</span>
                </div>
                {locationSuccess && (
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
                  <select value={city} onChange={e => { setCity(e.target.value); setLocationError(null); }} disabled={!province} className="input-field disabled:bg-gray-50 disabled:cursor-not-allowed">
                    <option value="">Select city/municipality...</option>
                    {availableCities.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                {locationError && <p className="text-red-600 text-xs">{locationError}</p>}

                <div className="flex gap-2 pt-2">
                  <button onClick={handleSaveLocation} disabled={savingLocation} className="btn-primary flex items-center gap-1.5 text-xs px-4 py-2">
                    <Check size={13} /> {savingLocation ? 'Saving...' : 'Save'}
                  </button>
                  <button onClick={handleCancelLocation} className="btn-secondary flex items-center gap-1.5 text-xs px-4 py-2">
                    <X size={13} /> Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Preferences Card */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-card p-6">
            <CardHeader icon={Globe} title="Preferences" />
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-subtle">Language</span>
                <span className="font-medium text-ink">
                  {user?.preferences?.language === 'en' ? 'English' : 'Filipino'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Contact & Notifications Card */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-card p-6 mb-4">
          <div className="flex items-center justify-between mb-5">
            <CardHeader icon={Phone} title="Contact & Notifications" />
            {!editingContact && (
              <button onClick={() => setEditingContact(true)} className="flex items-center gap-1.5 text-xs text-subtle hover:text-ink transition-colors -mt-5">
                <Pencil size={13} /> Edit
              </button>
            )}
          </div>

          {!editingContact ? (
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-subtle">Email</span>
                <span className="font-medium text-ink">{user?.email || '—'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-subtle">Phone Number</span>
                <span className="font-medium text-ink">{user?.phoneNumber || 'Not set'}</span>
              </div>
              <div className="border-t border-gray-100 pt-4">
                <p className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">Notification Channels</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-subtle">SMS Notifications</span>
                    <span className={`font-medium ${user?.notificationPreferences?.smsEnabled ? 'text-emerald-600' : 'text-gray-400'}`}>
                      {user?.notificationPreferences?.smsEnabled ? '✓ Enabled' : 'Disabled'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-subtle">In-App Notifications</span>
                    <span className={`font-medium ${user?.notificationPreferences?.inAppEnabled ? 'text-emerald-600' : 'text-gray-400'}`}>
                      {user?.notificationPreferences?.inAppEnabled ? '✓ Enabled' : 'Disabled'}
                    </span>
                  </div>
                </div>
              </div>
              {contactSuccess && (
                <p className="text-emerald-600 text-xs mt-2 font-medium pt-2 border-t border-gray-100">
                  Contact settings updated successfully.
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Phone Number</label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={e => setPhoneNumber(e.target.value)}
                  placeholder="+639123456789"
                  className="input-field"
                />
                <p className="text-xs text-gray-500 mt-1">Format: +639XXXXXXXXX</p>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <p className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">Notification Channels</p>
                <div className="space-y-3">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notificationPreferences.smsEnabled}
                      onChange={() => handleNotificationChange('smsEnabled')}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="ml-2.5 text-sm text-gray-700">SMS Notifications (Primary)</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notificationPreferences.inAppEnabled}
                      onChange={() => handleNotificationChange('inAppEnabled')}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="ml-2.5 text-sm text-gray-700">In-App Notifications</span>
                  </label>
                </div>
              </div>

              {contactError && <p className="text-red-600 text-xs">{contactError}</p>}

              <div className="flex gap-2 pt-2">
                <button onClick={handleSaveContact} disabled={savingContact} className="btn-primary flex items-center gap-1.5 text-xs px-4 py-2">
                  <Check size={13} /> {savingContact ? 'Saving...' : 'Save'}
                </button>
                <button onClick={handleCancelContact} className="btn-secondary flex items-center gap-1.5 text-xs px-4 py-2">
                  <X size={13} /> Cancel
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Profile;

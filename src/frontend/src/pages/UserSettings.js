import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const UserSettings = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    phoneNumber: '',
    notificationPreferences: {
      smsEnabled: false,
      emailEnabled: true,
      inAppEnabled: true
    },
    location: {
      latitude: null,
      longitude: null
    }
  });

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/user/preferences`,
        { withCredentials: true }
      );
      const { phoneNumber, notificationPreferences, location } = response.data.data;
      setFormData({
        phoneNumber: phoneNumber || '',
        notificationPreferences: notificationPreferences || {
          smsEnabled: false,
          emailEnabled: true,
          inAppEnabled: true
        },
        location: location || { latitude: null, longitude: null }
      });
    } catch (err) {
      console.error('Error fetching preferences:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNotificationChange = (channel) => {
    setFormData(prev => ({
      ...prev,
      notificationPreferences: {
        ...prev.notificationPreferences,
        [channel]: !prev.notificationPreferences[channel]
      }
    }));
  };

  const handleLocationChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      location: {
        ...prev.location,
        [name]: parseFloat(value) || null
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/user/preferences`,
        formData,
        { withCredentials: true }
      );

      setMessage('Preferences updated successfully!');
      updateUser({ ...user, ...formData });
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating preferences');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">Settings</h1>

          {message && (
            <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
              {message}
            </div>
          )}

          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Contact Information */}
            <div className="border-b pb-6">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">Contact Information</h2>
              
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded bg-gray-100 text-gray-600 cursor-not-allowed"
                />
                <p className="text-sm text-gray-500 mt-1">Email cannot be changed</p>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">Phone Number</label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  placeholder="+639123456789"
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-sm text-gray-500 mt-1">Format: +639XXXXXXXXX</p>
              </div>
            </div>

            {/* Notification Preferences */}
            <div className="border-b pb-6">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">Notification Preferences</h2>
              
              <div className="space-y-3">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.notificationPreferences.smsEnabled}
                    onChange={() => handleNotificationChange('smsEnabled')}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="ml-3 text-gray-700">
                    <span className="font-medium">SMS Notifications</span>
                    <p className="text-sm text-gray-500">Receive alerts via SMS</p>
                  </span>
                </label>

                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.notificationPreferences.emailEnabled}
                    onChange={() => handleNotificationChange('emailEnabled')}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="ml-3 text-gray-700">
                    <span className="font-medium">Email Notifications</span>
                    <p className="text-sm text-gray-500">Receive alerts via email</p>
                  </span>
                </label>

                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.notificationPreferences.inAppEnabled}
                    onChange={() => handleNotificationChange('inAppEnabled')}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="ml-3 text-gray-700">
                    <span className="font-medium">In-App Notifications</span>
                    <p className="text-sm text-gray-500">Receive alerts in the application</p>
                  </span>
                </label>
              </div>
            </div>

            {/* Location Settings */}
            <div className="border-b pb-6">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">Location Coordinates</h2>
              <p className="text-sm text-gray-500 mb-4">Used for distance-based earthquake alerts</p>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Latitude</label>
                  <input
                    type="number"
                    name="latitude"
                    value={formData.location.latitude || ''}
                    onChange={handleLocationChange}
                    placeholder="e.g., 14.5995"
                    step="0.0001"
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Longitude</label>
                  <input
                    type="number"
                    name="longitude"
                    value={formData.location.longitude || ''}
                    onChange={handleLocationChange}
                    placeholder="e.g., 120.9842"
                    step="0.0001"
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 rounded transition duration-200"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserSettings;

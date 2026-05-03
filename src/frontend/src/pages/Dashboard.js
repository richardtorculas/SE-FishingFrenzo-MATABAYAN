import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Bell, Cloud, Activity, Wind } from 'lucide-react';

const CardHeader = ({ icon: Icon, title }) => (
  <div className="flex items-center gap-3 mb-5">
    <div className="w-9 h-9 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100">
      <Icon className="text-gray-600" size={17} />
    </div>
    <h2 className="text-sm font-semibold text-ink">{title}</h2>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/alerts/logs`,
        { withCredentials: true }
      );
      
      if (response.data.data) {
        setAlerts(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted">
      <div className="container mx-auto px-6 py-10 max-w-5xl">

        {/* Page header */}
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-subtle mb-1">Notifications</p>
          <h1 className="text-2xl font-bold text-ink tracking-tight">Alerts & Updates</h1>
        </div>

        {/* Active Alerts */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-card p-6 mb-4">
          <CardHeader icon={Bell} title="Active Alerts" />
          {loading ? (
            <p className="text-sm text-subtle">Loading alerts...</p>
          ) : alerts.length > 0 ? (
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div key={alert._id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-sm text-ink">Earthquake Alert</h3>
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-red-100 text-red-800">
                          {alert.severity?.toUpperCase() || 'ALERT'}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-xs mb-2">
                        <div>
                          <span className="text-subtle">Magnitude:</span>
                          <p className="font-semibold text-ink">{alert.magnitude}</p>
                        </div>
                        <div>
                          <span className="text-subtle">Distance:</span>
                          <p className="font-semibold text-ink">{alert.distance} km</p>
                        </div>
                        <div>
                          <span className="text-subtle">Depth:</span>
                          <p className="font-semibold text-ink">{alert.depth} km</p>
                        </div>
                        <div>
                          <span className="text-subtle">Location:</span>
                          <p className="font-semibold text-ink truncate">{alert.location}</p>
                        </div>
                      </div>
                      <p className="text-xs text-subtle">
                        {new Date(alert.sentAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-subtle">
              {user?.preferences?.province
                ? `No active alerts for ${user.preferences.province} at this time.`
                : 'Set your location to see alerts for your area.'}
            </p>
          )}
        </div>

        {/* Alert History */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-card p-6 mb-4">
          <CardHeader icon={Bell} title="Alert History" />
          {loading ? (
            <p className="text-sm text-subtle">Loading history...</p>
          ) : alerts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-3 font-semibold text-gray-700">Date & Time</th>
                    <th className="text-left py-3 px-3 font-semibold text-gray-700">Location</th>
                    <th className="text-center py-3 px-3 font-semibold text-gray-700">Magnitude</th>
                    <th className="text-center py-3 px-3 font-semibold text-gray-700">Distance</th>
                    <th className="text-center py-3 px-3 font-semibold text-gray-700">Depth</th>
                  </tr>
                </thead>
                <tbody>
                  {alerts.map((alert) => (
                    <tr key={alert._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-3 text-xs text-subtle">
                        {new Date(alert.sentAt).toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-sm text-gray-700 truncate">
                        {alert.location}
                      </td>
                      <td className="py-3 px-3 text-center font-semibold text-ink">
                        {alert.magnitude}
                      </td>
                      <td className="py-3 px-3 text-center text-gray-700">
                        {alert.distance} km
                      </td>
                      <td className="py-3 px-3 text-center text-gray-700">
                        {alert.depth} km
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-subtle">
              No alerts received yet. Alerts will appear here when earthquakes occur near your location.
            </p>
          )}
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

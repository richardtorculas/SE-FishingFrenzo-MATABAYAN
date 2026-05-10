import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Bell, Cloud, Activity, Wind, Zap } from 'lucide-react';

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
  const [earthquakeAlerts, setEarthquakeAlerts] = useState([]);
  const [cycloneAlerts, setCycloneAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const [eqRes, cyRes] = await Promise.all([
        axios.get(
          `${process.env.REACT_APP_API_URL}/api/alerts/logs`,
          { withCredentials: true }
        ),
        axios.get(
          `${process.env.REACT_APP_API_URL}/api/cyclone-alerts`,
          { withCredentials: true }
        )
      ]);
      
      if (eqRes.data.data) {
        setEarthquakeAlerts(eqRes.data.data);
      }
      if (cyRes.data.data) {
        setCycloneAlerts(cyRes.data.data);
      }
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (alertId, type) => {
    try {
      setActionLoading(alertId);
      const endpoint = type === 'cyclone' 
        ? `/api/cyclone-alerts/${alertId}/read`
        : `/api/alerts/${alertId}/read`;
      
      await axios.patch(
        `${process.env.REACT_APP_API_URL}${endpoint}`,
        {},
        { withCredentials: true }
      );
      
      if (type === 'cyclone') {
        setCycloneAlerts(cycloneAlerts.map(a => a._id === alertId ? { ...a, read: true, readAt: new Date() } : a));
      } else {
        setEarthquakeAlerts(earthquakeAlerts.map(a => a._id === alertId ? { ...a, read: true, readAt: new Date() } : a));
      }
    } catch (error) {
      console.error('Error marking alert as read:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const dismissAlert = async (alertId, type) => {
    try {
      setActionLoading(alertId);
      const endpoint = type === 'cyclone'
        ? `/api/cyclone-alerts/${alertId}/dismiss`
        : `/api/alerts/${alertId}/dismiss`;
      
      await axios.patch(
        `${process.env.REACT_APP_API_URL}${endpoint}`,
        {},
        { withCredentials: true }
      );
      
      if (type === 'cyclone') {
        setCycloneAlerts(cycloneAlerts.filter(a => a._id !== alertId));
      } else {
        setEarthquakeAlerts(earthquakeAlerts.filter(a => a._id !== alertId));
      }
    } catch (error) {
      console.error('Error dismissing alert:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const allAlerts = [...earthquakeAlerts, ...cycloneAlerts];
  const activeAlerts = allAlerts.filter(a => !a.dismissed);

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
          ) : activeAlerts.length > 0 ? (
            <div className="space-y-3">
              {activeAlerts.map((alert) => (
                <div key={alert._id} className={`border rounded-lg p-4 transition-colors ${
                  alert.read ? 'border-gray-200 bg-gray-50' : 'border-red-200 bg-red-50'
                }`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-sm text-ink">
                          {alert.magnitude ? 'Earthquake Alert' : 'Typhoon Alert'}
                        </h3>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          alert.severity === 'critical' ? 'bg-red-100 text-red-800' :
                          alert.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                          alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {alert.severity?.toUpperCase() || 'ALERT'}
                        </span>
                        {alert.smsSent && <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">SMS Sent</span>}
                      </div>
                      
                      {/* Earthquake Alert */}
                      {alert.magnitude && (
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
                      )}
                      
                      {/* Cyclone Alert */}
                      {alert.cycloneName && (
                        <div className="grid grid-cols-2 gap-3 text-xs mb-2">
                          <div>
                            <span className="text-subtle">Cyclone:</span>
                            <p className="font-semibold text-ink">{alert.cycloneName}</p>
                          </div>
                          <div>
                            <span className="text-subtle">Category:</span>
                            <p className="font-semibold text-ink">{alert.category}</p>
                          </div>
                          <div>
                            <span className="text-subtle">Wind Speed:</span>
                            <p className="font-semibold text-ink">{alert.windKph} km/h</p>
                          </div>
                          <div>
                            <span className="text-subtle">Location:</span>
                            <p className="font-semibold text-ink truncate">{alert.location}</p>
                          </div>
                        </div>
                      )}
                      
                      <p className="text-xs text-subtle">
                        {alert.earthquakeTimestamp 
                          ? `Occurred: ${new Date(alert.earthquakeTimestamp).toLocaleString()}`
                          : `Trigger: ${alert.triggerReason?.replace(/_/g, ' ').toUpperCase()}`
                        }
                      </p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      {!alert.read && (
                        <button
                          onClick={() => markAsRead(alert._id, alert.cycloneName ? 'cyclone' : 'earthquake')}
                          disabled={actionLoading === alert._id}
                          className="text-xs px-3 py-1 rounded bg-blue-100 text-blue-800 hover:bg-blue-200 disabled:opacity-50"
                        >
                          {actionLoading === alert._id ? 'Marking...' : 'Mark Read'}
                        </button>
                      )}
                      <button
                        onClick={() => dismissAlert(alert._id, alert.cycloneName ? 'cyclone' : 'earthquake')}
                        disabled={actionLoading === alert._id}
                        className="text-xs px-3 py-1 rounded bg-gray-200 text-gray-800 hover:bg-gray-300 disabled:opacity-50"
                      >
                        {actionLoading === alert._id ? 'Dismissing...' : 'Dismiss'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-subtle">
              {user?.province
                ? `No active alerts for ${user.province} at this time.`
                : 'Set your location to see alerts for your area.'}
            </p>
          )}
        </div>

        {/* Alert History */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-card p-6 mb-4">
          <CardHeader icon={Bell} title="Alert History" />
          {loading ? (
            <p className="text-sm text-subtle">Loading history...</p>
          ) : allAlerts.length > 0 ? (
            <div className="space-y-4">
              {/* Earthquake Alerts History */}
              {earthquakeAlerts.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-gray-600 mb-3 uppercase">Earthquake Alerts</h3>
                  <div className="overflow-x-auto mb-4">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-3 font-semibold text-gray-700">Time</th>
                          <th className="text-left py-3 px-3 font-semibold text-gray-700">Location</th>
                          <th className="text-center py-3 px-3 font-semibold text-gray-700">Magnitude</th>
                          <th className="text-center py-3 px-3 font-semibold text-gray-700">Distance</th>
                          <th className="text-center py-3 px-3 font-semibold text-gray-700">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {earthquakeAlerts.map((alert) => (
                          <tr key={alert._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                            <td className="py-3 px-3 text-xs text-subtle">
                              {new Date(alert.earthquakeTimestamp).toLocaleString()}
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
                            <td className="py-3 px-3 text-center">
                              <span className={`text-xs font-medium px-2 py-1 rounded ${
                                alert.dismissed ? 'bg-gray-100 text-gray-700' :
                                alert.read ? 'bg-blue-100 text-blue-700' :
                                'bg-red-100 text-red-700'
                              }`}>
                                {alert.dismissed ? 'Dismissed' : alert.read ? 'Read' : 'New'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Cyclone Alerts History */}
              {cycloneAlerts.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-gray-600 mb-3 uppercase">Typhoon Alerts</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-3 font-semibold text-gray-700">Time</th>
                          <th className="text-left py-3 px-3 font-semibold text-gray-700">Cyclone</th>
                          <th className="text-left py-3 px-3 font-semibold text-gray-700">Category</th>
                          <th className="text-center py-3 px-3 font-semibold text-gray-700">Wind Speed</th>
                          <th className="text-center py-3 px-3 font-semibold text-gray-700">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cycloneAlerts.map((alert) => (
                          <tr key={alert._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                            <td className="py-3 px-3 text-xs text-subtle">
                              {new Date(alert.createdAt).toLocaleString()}
                            </td>
                            <td className="py-3 px-3 text-sm text-gray-700 truncate">
                              {alert.cycloneName}
                            </td>
                            <td className="py-3 px-3 text-sm text-gray-700">
                              {alert.category}
                            </td>
                            <td className="py-3 px-3 text-center font-semibold text-ink">
                              {alert.windKph} km/h
                            </td>
                            <td className="py-3 px-3 text-center">
                              <span className={`text-xs font-medium px-2 py-1 rounded ${
                                alert.dismissed ? 'bg-gray-100 text-gray-700' :
                                alert.read ? 'bg-blue-100 text-blue-700' :
                                'bg-red-100 text-red-700'
                              }`}>
                                {alert.dismissed ? 'Dismissed' : alert.read ? 'Read' : 'New'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-subtle">
              No alerts received yet. Alerts will appear here when earthquakes or typhoons occur near your location.
            </p>
          )}
        </div>

        {/* Quick Links */}
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { to: '/weather',     icon: Cloud,    label: 'Daily Weather',     sub: user?.province || 'Your area' },
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

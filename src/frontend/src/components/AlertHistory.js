import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Zap } from 'lucide-react';

const AlertHistory = ({ alerts = [] }) => {
  const [filteredAlerts, setFilteredAlerts] = useState([]);
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  useEffect(() => {
    let filtered = [...alerts];

    // Filter by severity
    if (filterSeverity !== 'all') {
      filtered = filtered.filter(alert => alert.severity === filterSeverity);
    }

    // Sort
    if (sortBy === 'recent') {
      filtered.sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt));
    } else if (sortBy === 'magnitude') {
      filtered.sort((a, b) => b.magnitude - a.magnitude);
    } else if (sortBy === 'distance') {
      filtered.sort((a, b) => a.distance - b.distance);
    }

    setFilteredAlerts(filtered);
  }, [alerts, filterSeverity, sortBy]);

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical':
        return 'text-red-600 bg-red-50';
      case 'high':
        return 'text-orange-600 bg-orange-50';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50';
      case 'low':
        return 'text-blue-600 bg-blue-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  if (alerts.length === 0) {
    return (
      <div className="text-center py-8">
        <Calendar className="mx-auto text-gray-300 mb-3" size={32} />
        <p className="text-sm text-subtle">No alert history</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Severity</label>
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="input-field text-sm"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Sort By</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="input-field text-sm"
          >
            <option value="recent">Most Recent</option>
            <option value="magnitude">Highest Magnitude</option>
            <option value="distance">Closest Distance</option>
          </select>
        </div>
      </div>

      {/* Alerts Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-3 font-semibold text-gray-700">Date & Time</th>
              <th className="text-left py-3 px-3 font-semibold text-gray-700">Location</th>
              <th className="text-center py-3 px-3 font-semibold text-gray-700">Magnitude</th>
              <th className="text-center py-3 px-3 font-semibold text-gray-700">Distance</th>
              <th className="text-center py-3 px-3 font-semibold text-gray-700">Depth</th>
              <th className="text-center py-3 px-3 font-semibold text-gray-700">Severity</th>
            </tr>
          </thead>
          <tbody>
            {filteredAlerts.map((alert) => (
              <tr key={alert._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="py-3 px-3 text-xs text-subtle">
                  {new Date(alert.sentAt).toLocaleString()}
                </td>
                <td className="py-3 px-3">
                  <div className="flex items-center gap-1.5">
                    <MapPin size={14} className="text-gray-400 flex-shrink-0" />
                    <span className="text-gray-700 truncate">{alert.location}</span>
                  </div>
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
                <td className="py-3 px-3 text-center">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                    <Zap size={12} />
                    {alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredAlerts.length === 0 && (
        <div className="text-center py-8">
          <p className="text-sm text-subtle">No alerts match the selected filters</p>
        </div>
      )}

      {/* Summary */}
      <div className="text-xs text-subtle pt-4 border-t border-gray-100">
        Showing {filteredAlerts.length} of {alerts.length} alerts
      </div>
    </div>
  );
};

export default AlertHistory;

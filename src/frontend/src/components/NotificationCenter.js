import React, { useState, useEffect } from 'react';
import { Bell, X, AlertTriangle, AlertCircle, Info } from 'lucide-react';

const NotificationCenter = ({ alerts = [] }) => {
  const [visibleAlerts, setVisibleAlerts] = useState([]);
  const [readAlerts, setReadAlerts] = useState(new Set());

  useEffect(() => {
    setVisibleAlerts(alerts);
  }, [alerts]);

  const markAsRead = (alertId) => {
    setReadAlerts(prev => new Set([...prev, alertId]));
  };

  const dismissAlert = (alertId) => {
    setVisibleAlerts(prev => prev.filter(alert => alert._id !== alertId));
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="text-red-600" size={20} />;
      case 'high':
        return <AlertTriangle className="text-orange-600" size={20} />;
      case 'medium':
        return <AlertCircle className="text-yellow-600" size={20} />;
      case 'low':
        return <Info className="text-blue-600" size={20} />;
      default:
        return <Bell className="text-gray-600" size={20} />;
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-50 border-red-200';
      case 'high':
        return 'bg-orange-50 border-orange-200';
      case 'medium':
        return 'bg-yellow-50 border-yellow-200';
      case 'low':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getSeverityBadgeColor = (severity) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (visibleAlerts.length === 0) {
    return (
      <div className="text-center py-8">
        <Bell className="mx-auto text-gray-300 mb-3" size={32} />
        <p className="text-sm text-subtle">No active alerts</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {visibleAlerts.map((alert) => {
        const isRead = readAlerts.has(alert._id);
        return (
          <div
            key={alert._id}
            className={`border rounded-lg p-4 transition-all ${getSeverityColor(alert.severity)} ${
              isRead ? 'opacity-75' : 'opacity-100'
            }`}
            onClick={() => markAsRead(alert._id)}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                {getSeverityIcon(alert.severity)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-sm text-ink">Earthquake Alert</h3>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getSeverityBadgeColor(alert.severity)}`}>
                    {alert.severity.toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs mb-2">
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

              <button
                onClick={() => dismissAlert(alert._id)}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default NotificationCenter;

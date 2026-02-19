import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AlertCard from '../components/AlertCard';

const AlertDashboard = () => {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/alerts')
      .then(res => setAlerts(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Disaster Alerts</h1>
        <div className="grid gap-4">
          {alerts.length > 0 ? (
            alerts.map(alert => <AlertCard key={alert._id} alert={alert} />)
          ) : (
            <p className="text-gray-600">No alerts available at this time.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AlertDashboard;

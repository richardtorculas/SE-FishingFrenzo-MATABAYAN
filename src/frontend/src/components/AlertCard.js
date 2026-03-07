import React from 'react';

const AlertCard = ({ alert }) => {
  return (
    <div className="bg-white p-4 rounded shadow">
      <h3 className="text-xl font-semibold">{alert.type} - {alert.severity}</h3>
      <p className="text-gray-600">{alert.location}, {alert.province}</p>
      <p className="mt-2">{alert.description}</p>
      <p className="text-sm text-gray-500 mt-2">
        {alert.source} | {new Date(alert.timestamp).toLocaleString()}
      </p>
    </div>
  );
};

export default AlertCard;

import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, MapPin, Bell, Shield } from 'lucide-react';

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-blue-900 mb-4">
            MataBayan 🇵🇭
          </h1>
          <p className="text-xl text-gray-700 mb-8">
            Real-Time Disaster Alert and Preparedness System
          </p>
          <Link
            to="/signup"
            className="inline-block bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition"
          >
            Get Started - Sign Up Free
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-16">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <AlertTriangle className="mx-auto mb-4 text-red-600" size={48} />
            <h3 className="text-xl font-bold mb-2">Real-Time Alerts</h3>
            <p className="text-gray-600">
              Get instant notifications from PAGASA, PHIVOLCS, and NDRRMC
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <MapPin className="mx-auto mb-4 text-green-600" size={48} />
            <h3 className="text-xl font-bold mb-2">Location-Based</h3>
            <p className="text-gray-600">
              Receive alerts specific to your province and city
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <Shield className="mx-auto mb-4 text-blue-600" size={48} />
            <h3 className="text-xl font-bold mb-2">Safety First</h3>
            <p className="text-gray-600">
              Bilingual safety instructions in English and Filipino
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;

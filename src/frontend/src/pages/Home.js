import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, MapPin, Shield } from 'lucide-react';

const Home = () => {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-6 pt-2 pb-8">
        <div className="text-center max-w-3xl mx-auto">

          <div className="flex flex-col items-center gap-1 mb-4">
            <img
              src="/logo.png"
              alt="MataBayan"
              style={{ height: '160px', width: 'auto', mixBlendMode: 'multiply' }}
            />
            <p className="text-xs font-semibold uppercase tracking-widest text-subtle">
              Real-Time Disaster Preparedness
            </p>
            <h1
              className="font-black text-ink tracking-tighter leading-none"
              style={{ fontSize: 'clamp(40px, 7vw, 88px)', letterSpacing: '-0.04em' }}
            >
              MataBayan
            </h1>
          </div>

          <Link to="/signup" className="btn-primary inline-block text-base px-8 py-3.5 rounded-2xl mb-12">
            Get Started — Sign Up Free
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300 text-center flex flex-col items-center p-6">
            <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
              <AlertTriangle className="text-gray-700" size={24} />
            </div>
            <h3 className="text-base font-bold text-ink mb-2">Real-Time Alerts</h3>
            <p className="text-sm text-subtle leading-relaxed text-center">
              Get instant notifications from PAGASA, PHIVOLCS, and NDRRMC
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300 text-center flex flex-col items-center p-6">
            <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
              <MapPin className="text-gray-700" size={24} />
            </div>
            <h3 className="text-base font-bold text-ink mb-2">Location-Based</h3>
            <p className="text-sm text-subtle leading-relaxed text-center">
              Receive alerts specific to your province and city
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300 text-center flex flex-col items-center p-6">
            <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
              <Shield className="text-gray-700" size={24} />
            </div>
            <h3 className="text-base font-bold text-ink mb-2">Safety First</h3>
            <p className="text-sm text-subtle leading-relaxed text-center">
              Bilingual safety instructions in English and Filipino
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;

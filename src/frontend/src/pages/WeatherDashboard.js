import React, { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { Cloud, Droplets, Thermometer, RefreshCw, MapPin, Wind } from 'lucide-react';
import { provinces } from '../utils/phLocations';
import { useAuth } from '../context/AuthContext';

const LOCATION_COORDS = {
  'Metro Manila':       { lat: 14.5995, lon: 120.9842 },
  'Cebu':               { lat: 10.3157, lon: 123.8854 },
  'Davao del Sur':      { lat: 7.0707,  lon: 125.4987 },
  'Laguna':             { lat: 14.3292, lon: 121.0794 }, // Biñan, Laguna
  'Cavite':             { lat: 14.2456, lon: 120.8787 },
  'Bulacan':            { lat: 14.7942, lon: 120.8799 },
  'Pampanga':           { lat: 15.0794, lon: 120.6200 },
  'Batangas':           { lat: 13.7565, lon: 121.0583 },
  'Rizal':              { lat: 14.6037, lon: 121.3084 },
  'Pangasinan':         { lat: 15.8949, lon: 120.2863 },
  'Iloilo':             { lat: 10.7202, lon: 122.5621 },
  'Negros Occidental':  { lat: 10.6713, lon: 122.9511 },
  'Albay':              { lat: 13.1775, lon: 123.5280 },
  'Leyte':              { lat: 10.8731, lon: 124.8811 },
  'Cagayan':            { lat: 17.6132, lon: 121.7270 },
  'Isabela':            { lat: 16.9754, lon: 121.8107 },
  'Nueva Ecija':        { lat: 15.5784, lon: 121.0687 },
  'Zambales':           { lat: 15.5082, lon: 119.9697 },
};

const getWeatherIcon = (code) => {
  if (code === 0 || code === 1) return '☀️';
  if (code === 2) return '⛅';
  if (code === 3) return '☁️';
  if (code <= 48) return '🌫️';
  if (code <= 55) return '🌦️';
  if (code <= 65) return '🌧️';
  if (code <= 82) return '🌩️';
  return '⛈️';
};

const getRainColor = (pct) => {
  if (pct >= 70) return 'text-blue-700';
  if (pct >= 40) return 'text-blue-500';
  return 'text-green-600';
};

const StatCard = ({ label, value, icon, color }) => (
  <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-4">
    <div className={`p-3 rounded-lg ${color}`}>{icon}</div>
    <div>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  </div>
);

const WeatherDashboard = () => {
  const { user } = useAuth();
  const defaultLocation = user?.preferences?.province || 'Laguna';

  const [weather, setWeather]         = useState(null);
  const [location, setLocation]       = useState(defaultLocation);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Auto-fetch on mount using user's saved province
  useEffect(() => {
    fetchWeather(defaultLocation);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchWeather = useCallback(async (loc = location) => {
    const coords = LOCATION_COORDS[loc];
    if (!coords) return;

    setLoading(true);
    setError(null);

    try {
      const res = await axios.get('http://localhost:5000/api/weather', {
        params: { latitude: coords.lat, longitude: coords.lon, location: loc }
      });
      setWeather(res.data.data);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch weather data. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  }, [location]);

  const handleLocationChange = (e) => {
    setLocation(e.target.value);
    setWeather(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Cloud className="text-sky-500" size={28} />
              <h1 className="text-2xl font-bold text-gray-900">Daily Weather Report</h1>
            </div>
            <p className="text-sm text-gray-500">
              Current weather conditions — Philippines
              {lastUpdated && (
                <span className="ml-2 text-gray-400">· Updated {lastUpdated.toLocaleTimeString('en-PH')}</span>
              )}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
            Powered by Open-Meteo · No API key required
            {user?.preferences?.province && (
              <span className="ml-2 text-sky-400">· 📍 Based on your profile ({user.preferences.province})</span>
            )}
          </p>
          </div>
          <button
            onClick={() => fetchWeather()}
            disabled={loading}
            className="flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-60"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            {loading ? 'Fetching...' : 'Fetch Weather'}
          </button>
        </div>

        {/* Location Selector */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <MapPin size={15} className="text-sky-500" />
            <p className="text-sm font-semibold text-gray-700">Select Location</p>
          </div>
          <select
            value={location}
            onChange={handleLocationChange}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-sky-400"
          >
            {provinces.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-6 text-sm">
            ⚠️ {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Cloud size={40} className="text-sky-400 animate-pulse mx-auto mb-3" />
              <p className="text-gray-500">Fetching weather for {location}...</p>
            </div>
          </div>
        )}

        {/* Weather Data */}
        {!loading && weather && (
          <>
            {/* Main weather card */}
            <div className="bg-gradient-to-br from-sky-500 to-blue-600 text-white rounded-2xl p-6 mb-6 shadow-md">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin size={16} />
                    <p className="text-sm font-medium opacity-90">{weather.location}</p>
                  </div>
                  <p className="text-6xl font-black">{weather.temperature}°C</p>
                  <p className="text-lg font-medium opacity-90 mt-1">{weather.condition}</p>
                </div>
                <span className="text-8xl">{getWeatherIcon(weather.weatherCode)}</span>
              </div>
              <p className="text-xs opacity-70">As of {new Date(weather.fetchedAt).toLocaleString('en-PH', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              <StatCard
                label="Temperature"
                value={`${weather.temperature}${weather.unit}`}
                icon={<Thermometer size={20} className="text-orange-500" />}
                color="bg-orange-50"
              />
              <StatCard
                label="Humidity"
                value={`${weather.humidity}%`}
                icon={<Droplets size={20} className="text-blue-500" />}
                color="bg-blue-50"
              />
              <StatCard
                label="Chance of Rain"
                value={<span className={getRainColor(weather.chanceOfRain)}>{weather.chanceOfRain}%</span>}
                icon={<Cloud size={20} className="text-sky-500" />}
                color="bg-sky-50"
              />
            </div>

            {/* Rain advisory */}
            {weather.chanceOfRain >= 70 && (
              <div className="bg-blue-50 border border-blue-200 text-blue-700 rounded-xl p-4 mb-6 flex items-center gap-3 text-sm">
                <Droplets size={18} />
                <div>
                  <p className="font-semibold">High chance of rain today ({weather.chanceOfRain}%)</p>
                  <p className="text-xs opacity-80 mt-0.5">Bring an umbrella and avoid flood-prone areas.</p>
                </div>
              </div>
            )}

            {/* Condition detail */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-3">
                <Wind size={15} className="text-gray-500" />
                <p className="text-sm font-semibold text-gray-700">Weather Summary</p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm text-gray-600">
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="text-gray-400">Condition</span>
                  <span className="font-medium">{weather.condition}</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="text-gray-400">Temperature</span>
                  <span className="font-medium">{weather.temperature}{weather.unit}</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="text-gray-400">Humidity</span>
                  <span className="font-medium">{weather.humidity}%</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="text-gray-400">Rain Chance</span>
                  <span className={`font-medium ${getRainColor(weather.chanceOfRain)}`}>{weather.chanceOfRain}%</span>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Empty state */}
        {!loading && !weather && !error && (
          <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-100">
            <span className="text-5xl block mb-3">🌤️</span>
            <p className="text-gray-700 font-semibold">No weather data yet</p>
            <p className="text-gray-400 text-sm mt-1">Select a location and click "Fetch Weather" to get started.</p>
          </div>
        )}

        <p className="text-center text-xs text-gray-400 mt-8">
          Weather data: <a href="https://open-meteo.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-600">Open-Meteo</a>
          &nbsp;· Free & open-source weather API
        </p>
      </div>
    </div>
  );
};

export default WeatherDashboard;

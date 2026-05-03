import React, { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { Cloud, Droplets, Thermometer, RefreshCw, MapPin } from 'lucide-react';
import { provinces, citiesByProvince } from '../utils/phLocations';
import { useAuth } from '../context/AuthContext';

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
  return 'text-emerald-600';
};

const StatCard = ({ label, value, icon, color }) => (
  <div className="card flex items-center gap-4">
    <div className={`p-3 rounded-xl ${color}`}>{icon}</div>
    <div>
      <p className="text-2xl font-bold text-ink">{value}</p>
      <p className="text-xs text-subtle">{label}</p>
    </div>
  </div>
);

const WeatherDashboard = () => {
  const { user } = useAuth();

  const [weather, setWeather]         = useState(null);
  const [province, setProvince]       = useState('Laguna');
  const [city, setCity]               = useState('Biñan');
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchWeather = useCallback(async (loc) => {
    if (!loc) return;
    setLoading(true);
    setError(null);
    try {
      const geoRes = await axios.get('https://geocoding-api.open-meteo.com/v1/search', {
        params: { name: loc, count: 1, language: 'en', format: 'json' }
      });
      const result = geoRes.data.results?.[0];
      if (!result) throw new Error(`Location "${loc}" not found.`);
      const weatherRes = await axios.get(`${process.env.REACT_APP_API_URL}/api/weather`, {
        params: { latitude: result.latitude, longitude: result.longitude, location: loc }
      });
      setWeather(weatherRes.data.data);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch weather data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    const userProvince = user.preferences?.province || 'Laguna';
    const userCity = user.preferences?.cityMunicipality || 'Biñan';
    const resolvedCity = citiesByProvince[userProvince]?.includes(userCity)
      ? userCity
      : citiesByProvince[userProvince]?.[0] || '';
    setProvince(userProvince);
    setCity(resolvedCity);
    fetchWeather(resolvedCity);
  }, [user, fetchWeather]);

  const handleProvinceChange = (e) => {
    const newProvince = e.target.value;
    const firstCity = citiesByProvince[newProvince]?.[0] || '';
    setProvince(newProvince);
    setCity(firstCity);
    setWeather(null);
    setError(null);
  };

  const handleCityChange = (e) => {
    setCity(e.target.value);
    setWeather(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-muted">
      <div className="container mx-auto px-6 py-10 max-w-4xl">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start justify-between mb-8 gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-subtle mb-1">Open-Meteo</p>
            <div className="flex items-center gap-2.5 mb-1">
              <Cloud className="text-gray-700" size={24} />
              <h1 className="text-2xl font-bold text-ink tracking-tight">Daily Weather Report</h1>
            </div>
            <p className="text-sm text-subtle">
              Current weather conditions — Philippines
              {lastUpdated && <span className="ml-2">· Updated {lastUpdated.toLocaleTimeString('en-PH')}</span>}
            </p>
            {user?.preferences?.province && (
              <p className="text-xs text-gray-400 mt-0.5">
                📍 Based on your profile ({user.preferences.cityMunicipality}, {user.preferences.province})
              </p>
            )}
          </div>
          <button onClick={() => fetchWeather(city)} disabled={loading} className="btn-secondary flex items-center gap-2 self-start">
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            {loading ? 'Fetching...' : 'Fetch Weather'}
          </button>
        </div>

        {/* Location Selector */}
        <div className="card mb-6">
          <div className="flex items-center gap-2 mb-4">
            <MapPin size={15} className="text-gray-500" />
            <p className="text-sm font-semibold text-ink">Select Location</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1.5 block uppercase tracking-wide">Province</label>
              <select value={province} onChange={handleProvinceChange} className="input-field">
                {provinces.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1.5 block uppercase tracking-wide">City / Municipality</label>
              <select value={city} onChange={handleCityChange} className="input-field">
                {(citiesByProvince[province] || []).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-700 rounded-2xl p-4 mb-6 text-sm">⚠️ {error}</div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-24">
            <div className="text-center">
              <Cloud size={36} className="text-gray-300 animate-pulse mx-auto mb-3" />
              <p className="text-subtle text-sm">Fetching weather for {city}...</p>
            </div>
          </div>
        )}

        {!loading && weather && (
          <>
            {/* Hero weather card */}
            <div className="card mb-6 bg-ink text-white border-0">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin size={14} className="opacity-60" />
                    <p className="text-sm font-medium opacity-80">{weather.location}</p>
                  </div>
                  <p className="text-6xl font-black tracking-tight">{weather.temperature}°C</p>
                  <p className="text-base font-medium opacity-75 mt-1">{weather.condition}</p>
                </div>
                <span className="text-7xl">{getWeatherIcon(weather.weatherCode)}</span>
              </div>
              <p className="text-xs opacity-50">
                As of {new Date(weather.fetchedAt).toLocaleString('en-PH', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              <StatCard label="Temperature"    value={`${weather.temperature}${weather.unit}`}                                                                icon={<Thermometer size={18} className="text-gray-500" />} color="bg-gray-50"   />
              <StatCard label="Humidity"       value={`${weather.humidity}%`}                                                                                 icon={<Droplets size={18} className="text-gray-500" />}    color="bg-gray-50"   />
              <StatCard label="Chance of Rain" value={<span className={getRainColor(weather.chanceOfRain)}>{weather.chanceOfRain}%</span>}                    icon={<Cloud size={18} className="text-gray-500" />}       color="bg-gray-50"   />
            </div>

            {weather.chanceOfRain >= 70 && (
              <div className="bg-blue-50 border border-blue-100 text-blue-800 rounded-2xl p-4 mb-6 flex items-center gap-3 text-sm">
                <Droplets size={17} className="shrink-0" />
                <div>
                  <p className="font-semibold">High chance of rain today ({weather.chanceOfRain}%)</p>
                  <p className="text-xs opacity-75 mt-0.5">Bring an umbrella and avoid flood-prone areas.</p>
                </div>
              </div>
            )}
          </>
        )}

        {!loading && !weather && !error && (
          <div className="card p-16 text-center">
            <span className="text-5xl block mb-3">🌤️</span>
            <p className="text-ink font-semibold">No weather data yet</p>
            <p className="text-subtle text-sm mt-1">Select a location and click "Fetch Weather" to get started.</p>
          </div>
        )}

        <p className="text-center text-xs text-gray-400 mt-10">
          Weather data: <a href="https://open-meteo.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-600">Open-Meteo</a>
          &nbsp;· Free & open-source weather API
        </p>
      </div>
    </div>
  );
};

export default WeatherDashboard;

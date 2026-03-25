import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Wind, AlertTriangle, MapPin, Clock, RefreshCw, Navigation, Compass } from 'lucide-react';

const SEVERITY_CONFIG = {
  Critical: { light: 'bg-red-50',    border: 'border-red-500',    text: 'text-red-700',    badge: 'bg-red-600 text-white',          icon: '🔴', pulse: true  },
  High:     { light: 'bg-orange-50', border: 'border-orange-400', text: 'text-orange-700', badge: 'bg-orange-500 text-white',        icon: '🟠', pulse: true  },
  Moderate: { light: 'bg-yellow-50', border: 'border-yellow-400', text: 'text-yellow-700', badge: 'bg-yellow-400 text-gray-900',     icon: '🟡', pulse: false },
  Low:      { light: 'bg-blue-50',   border: 'border-blue-400',   text: 'text-blue-700',   badge: 'bg-blue-500 text-white',          icon: '🔵', pulse: false },
};

const getWindBar = (windKph) => {
  const pct = Math.min((windKph / 250) * 100, 100);
  let color = 'bg-green-400';
  if (windKph >= 185) color = 'bg-red-600';
  else if (windKph >= 118) color = 'bg-red-400';
  else if (windKph >= 89) color = 'bg-orange-500';
  else if (windKph >= 62) color = 'bg-yellow-400';
  return { pct, color };
};

const TyphoonCard = ({ typhoon }) => {
  const cfg = SEVERITY_CONFIG[typhoon.severity] || SEVERITY_CONFIG.Low;
  const meta = typhoon.metadata || {};
  const { pct, color } = getWindBar(meta.windKph || 0);

  return (
    <div className={`rounded-xl border-l-4 ${cfg.border} ${cfg.light} p-5 shadow-sm hover:shadow-md transition-shadow`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🌀</span>
          <div>
            <p className="text-lg font-black text-gray-900">{meta.name || 'UNNAMED'}</p>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${cfg.badge} ${cfg.pulse ? 'animate-pulse' : ''}`}>
              {meta.category || typhoon.severity}
            </span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-black text-gray-800">{meta.windKph ?? '—'}</p>
          <p className="text-xs text-gray-500">km/h</p>
        </div>
      </div>

      {/* Signal number */}
      {meta.signal > 0 && (
        <div className="flex items-center gap-2 mb-3">
          <span className={`text-xs font-bold px-2 py-1 rounded ${meta.signal >= 3 ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
            ⚠️ PAGASA Signal No. {meta.signal}
          </span>
        </div>
      )}

      {/* Wind bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Wind Speed</span>
          <span>{meta.windKph ?? 0} / 250 km/h</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className={`h-2 rounded-full ${color} transition-all duration-500`} style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* Details */}
      <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-3">
        <div className="flex items-start gap-1.5 col-span-2">
          <MapPin size={13} className="mt-0.5 shrink-0" />
          <span>{meta.affectedArea || typhoon.location}</span>
        </div>
        {meta.latitude && meta.longitude && (
          <div className="flex items-center gap-1.5">
            <Compass size={13} />
            <span>{meta.latitude}°N, {meta.longitude}°E</span>
          </div>
        )}
        {meta.movementDirection && meta.movementDirection !== 'Unknown' && (
          <div className="flex items-center gap-1.5">
            <Navigation size={13} />
            <span>Moving {meta.movementDirection}{meta.movementSpeedKph ? ` at ${meta.movementSpeedKph} km/h` : ''}</span>
          </div>
        )}
      </div>

      {/* Description */}
      <p className="text-xs text-gray-500 mb-3 leading-relaxed">{typhoon.description}</p>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-200">
        <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">
          📡 {typhoon.source}
        </span>
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <Clock size={12} />
          {new Date(typhoon.timestamp).toLocaleString('en-PH', {
            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
          })}
        </div>
      </div>
    </div>
  );
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

const TyphoonDashboard = () => {
  const [typhoons, setTyphoons] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState(null);

  const loadData = useCallback(async () => {
    try {
      const [tRes, sRes] = await Promise.all([
        axios.get('http://localhost:5000/api/typhoons'),
        axios.get('http://localhost:5000/api/typhoons/stats')
      ]);
      setTyphoons(tRes.data.data || []);
      setStats(sRes.data.data || null);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      setError('Failed to load typhoon data. Make sure the backend is running.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const triggerUpdate = useCallback(async () => {
    setRefreshing(true);
    setError(null);
    try {
      await axios.post('http://localhost:5000/api/typhoons/update');
      await loadData();
    } catch (err) {
      setError('Failed to fetch from PAGASA. Check your internet connection.');
      setRefreshing(false);
    }
  }, [loadData]);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try { await axios.post('http://localhost:5000/api/typhoons/update'); } catch (_) {}
      await loadData();
    };
    init();
    const interval = setInterval(triggerUpdate, 30 * 60 * 1000); // 30 min
    return () => clearInterval(interval);
  }, [loadData, triggerUpdate]);

  const activeCritical = typhoons.find(t => ['Critical', 'High'].includes(t.severity));

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Wind className="text-blue-600" size={28} />
              <h1 className="text-2xl font-bold text-gray-900">PAGASA Typhoon Monitor</h1>
            </div>
            <p className="text-sm text-gray-500">
              Active Tropical Cyclones — Philippine Area of Responsibility
              {lastUpdated && (
                <span className="ml-2 text-gray-400">· Updated {lastUpdated.toLocaleTimeString('en-PH')}</span>
              )}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              Real-time data from PAGASA · Fallback: JTWC · Auto-refreshes every 30 minutes
            </p>
          </div>
          <button
            onClick={triggerUpdate}
            disabled={refreshing}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-60"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
            {refreshing ? 'Fetching from PAGASA...' : 'Fetch Latest'}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-6 text-sm">
            ⚠️ {error}
          </div>
        )}

        {/* Active critical banner */}
        {activeCritical && (
          <div className="bg-red-600 text-white rounded-xl p-4 mb-6 flex items-center gap-3">
            <AlertTriangle size={20} />
            <div>
              <p className="font-bold text-sm">🌀 ACTIVE {activeCritical.severity.toUpperCase()} CYCLONE</p>
              <p className="text-xs opacity-90">
                {activeCritical.metadata?.category} {activeCritical.metadata?.name} — {activeCritical.metadata?.windKph} km/h
              </p>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <StatCard label="Active Cyclones" value={stats?.total ?? typhoons.length} icon={<Wind size={20} className="text-blue-600" />} color="bg-blue-50" />
          <StatCard label="Highest Winds" value={stats?.highestWindKph ? `${stats.highestWindKph} km/h` : '—'} icon={<AlertTriangle size={20} className="text-red-600" />} color="bg-red-50" />
          <StatCard label="Category" value={stats?.highestCategory ?? 'None'} icon={<span className="text-lg">🌀</span>} color="bg-yellow-50" />
        </div>

        {/* Category legend */}
        <div className="bg-white rounded-xl p-4 mb-6 shadow-sm border border-gray-100">
          <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Category Guide (Max Sustained Winds)</p>
          <div className="flex flex-wrap gap-4 text-xs">
            {[
              { label: 'Super Typhoon',         range: '≥ 185 km/h', color: 'text-red-700' },
              { label: 'Typhoon',               range: '118–184 km/h', color: 'text-orange-700' },
              { label: 'Severe Tropical Storm', range: '89–117 km/h', color: 'text-yellow-700' },
              { label: 'Tropical Storm',        range: '62–88 km/h', color: 'text-blue-700' },
              { label: 'Tropical Depression',   range: '45–61 km/h', color: 'text-green-700' },
            ].map(c => (
              <div key={c.label} className="flex items-center gap-1.5">
                <span className="text-base">🌀</span>
                <span className={`font-semibold ${c.color}`}>{c.label}</span>
                <span className="text-gray-400">{c.range}</span>
              </div>
            ))}
          </div>
        </div>

        {/* List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Wind size={40} className="text-blue-400 animate-pulse mx-auto mb-3" />
              <p className="text-gray-500">Fetching latest data from PAGASA...</p>
            </div>
          </div>
        ) : typhoons.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-100">
            <p className="text-4xl mb-3">✅</p>
            <p className="text-gray-700 text-lg font-semibold">No Active Tropical Cyclones</p>
            <p className="text-gray-400 text-sm mt-1">
              There are currently no tropical cyclones in the Philippine Area of Responsibility.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {typhoons.map(t => <TyphoonCard key={t._id} typhoon={t} />)}
          </div>
        )}

        <p className="text-center text-xs text-gray-400 mt-8">
          Primary data: <a href="https://bagong.pagasa.dost.gov.ph/tropical-cyclone/weather-bulletin" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-600">PAGASA — DOST</a>
          &nbsp;· Fallback: JTWC Western Pacific
        </p>
      </div>
    </div>
  );
};

export default TyphoonDashboard;

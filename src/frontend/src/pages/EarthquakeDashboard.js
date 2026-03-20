import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Activity, AlertTriangle, MapPin, Clock, Layers, RefreshCw, TrendingUp, ExternalLink, Waves } from 'lucide-react';

const THREAT_CONFIG = {
  Critical: { light: 'bg-red-50', border: 'border-red-500', text: 'text-red-700', badge: 'bg-red-600 text-white', icon: '🔴', pulse: true },
  High:     { light: 'bg-orange-50', border: 'border-orange-400', text: 'text-orange-700', badge: 'bg-orange-500 text-white', icon: '🟠', pulse: true },
  Moderate: { light: 'bg-yellow-50', border: 'border-yellow-400', text: 'text-yellow-700', badge: 'bg-yellow-400 text-gray-900', icon: '🟡', pulse: false },
  Low:      { light: 'bg-blue-50', border: 'border-blue-400', text: 'text-blue-700', badge: 'bg-blue-500 text-white', icon: '🔵', pulse: false },
  Minor:    { light: 'bg-green-50', border: 'border-green-400', text: 'text-green-700', badge: 'bg-green-500 text-white', icon: '🟢', pulse: false }
};

const getMagnitudeBar = (magnitude) => {
  const pct = Math.min((magnitude / 9) * 100, 100);
  let color = 'bg-green-400';
  if (magnitude >= 7) color = 'bg-red-500';
  else if (magnitude >= 6) color = 'bg-orange-500';
  else if (magnitude >= 5) color = 'bg-yellow-400';
  else if (magnitude >= 4) color = 'bg-blue-400';
  return { pct, color };
};

const EarthquakeCard = ({ earthquake }) => {
  const threat = THREAT_CONFIG[earthquake.severity] || THREAT_CONFIG.Minor;
  const meta = earthquake.metadata || {};
  const { pct, color } = getMagnitudeBar(meta.magnitude || 0);

  return (
    <div className={`rounded-xl border-l-4 ${threat.border} ${threat.light} p-5 shadow-sm hover:shadow-md transition-shadow`}>
      {/* Tsunami warning banner */}
      {meta.tsunami && (
        <div className="flex items-center gap-2 bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg mb-3">
          <Waves size={14} />
          TSUNAMI WARNING ISSUED
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{threat.icon}</span>
          <div>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${threat.badge} ${threat.pulse ? 'animate-pulse' : ''}`}>
              {earthquake.severity} THREAT
            </span>
            {meta.felt > 0 && (
              <p className="text-xs text-gray-500 mt-0.5">👥 Felt by {meta.felt} {meta.felt === 1 ? 'person' : 'people'}</p>
            )}
          </div>
        </div>
        <div className="text-right">
          <p className="text-3xl font-black text-gray-800">M{meta.magnitude?.toFixed(1) ?? 'N/A'}</p>
          <p className="text-xs text-gray-500">Magnitude</p>
        </div>
      </div>

      {/* Magnitude bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Magnitude Scale</span>
          <span>{meta.magnitude?.toFixed(1)} / 9.0</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className={`h-2 rounded-full ${color} transition-all duration-500`} style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* Details */}
      <div className="grid grid-cols-2 gap-2 text-sm mb-3">
        <div className="flex items-start gap-1.5 text-gray-600 col-span-2">
          <MapPin size={14} className="mt-0.5 shrink-0" />
          <span className="text-xs">{earthquake.location}</span>
        </div>
        <div className="flex items-center gap-1.5 text-gray-600">
          <Layers size={14} />
          <span className="text-xs">Depth: {meta.depth ?? 'N/A'} km {meta.depth < 70 ? '⚠️ Shallow' : ''}</span>
        </div>
        <div className="text-xs text-gray-500">
          📍 {meta.latitude?.toFixed(3)}°N, {meta.longitude?.toFixed(3)}°E
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-200">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">
            📡 PHIVOLCS
          </span>
          {meta.usgsUrl && (
            <a href={meta.usgsUrl} target="_blank" rel="noopener noreferrer"
              className="text-xs text-blue-500 hover:text-blue-700 flex items-center gap-0.5">
              <ExternalLink size={11} /> Details
            </a>
          )}
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <Clock size={12} />
          {new Date(earthquake.timestamp).toLocaleString('en-PH', {
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

const EarthquakeDashboard = () => {
  const [earthquakes, setEarthquakes] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('All');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState(null);

  const SEVERITY_FILTERS = ['All', 'Critical', 'High', 'Moderate', 'Low', 'Minor'];

  const loadData = useCallback(async () => {
    try {
      const [eqRes, statsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/earthquakes'),
        axios.get('http://localhost:5000/api/earthquakes/stats')
      ]);
      setEarthquakes(eqRes.data.data || []);
      setStats(statsRes.data.data || null);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      setError('Failed to load earthquake data. Make sure the backend is running.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const triggerUpdate = async () => {
    setRefreshing(true);
    setError(null);
    try {
      const res = await axios.post('http://localhost:5000/api/earthquakes/update');
      await loadData();
      return res.data;
    } catch (err) {
      setError('Failed to fetch from PHIVOLCS. Check your internet connection.');
      setRefreshing(false);
    }
  };

  useEffect(() => {
    // Auto-fetch on first load
    const init = async () => {
      setLoading(true);
      try {
        // Try fetching fresh data first
        await axios.post('http://localhost:5000/api/earthquakes/update');
      } catch (_) {}
      await loadData();
    };
    init();
    const interval = setInterval(() => triggerUpdate(), 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [loadData]);

  const filtered = filter === 'All' ? earthquakes : earthquakes.filter(eq => eq.severity === filter);
  const highestThreat = earthquakes.find(eq => ['Critical', 'High'].includes(eq.severity));
  const tsunamiActive = earthquakes.some(eq => eq.metadata?.tsunami);
  const severityCounts = SEVERITY_FILTERS.slice(1).reduce((acc, s) => {
    acc[s] = earthquakes.filter(eq => eq.severity === s).length;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Activity className="text-red-600" size={28} />
              <h1 className="text-2xl font-bold text-gray-900">PHIVOLCS Earthquake Monitor</h1>
            </div>
            <p className="text-sm text-gray-500">
              Latest Earthquake Information — Philippines
              {lastUpdated && (
                <span className="ml-2 text-gray-400">· Updated {lastUpdated.toLocaleTimeString('en-PH')}</span>
              )}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              Real-time data from PHIVOLCS (Philippine Institute of Volcanology and Seismology) · Auto-refreshes every 5 minutes
            </p>
          </div>
          <button
            onClick={triggerUpdate}
            disabled={refreshing}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-60"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
            {refreshing ? 'Fetching from PHIVOLCS...' : 'Fetch Latest'}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-6 text-sm">
            ⚠️ {error}
          </div>
        )}

        {/* Tsunami warning */}
        {tsunamiActive && (
          <div className="bg-blue-600 text-white rounded-xl p-4 mb-4 flex items-center gap-3">
            <Waves size={22} />
            <div>
              <p className="font-bold">🌊 TSUNAMI WARNING ACTIVE</p>
              <p className="text-xs opacity-90">A tsunami warning has been issued for one or more recent earthquakes.</p>
            </div>
          </div>
        )}

        {/* Critical alert banner */}
        {highestThreat && (
          <div className="bg-red-600 text-white rounded-xl p-4 mb-6 flex items-center gap-3">
            <AlertTriangle size={20} />
            <div>
              <p className="font-bold text-sm">⚠️ ACTIVE HIGH-THREAT EARTHQUAKE</p>
              <p className="text-xs opacity-90">M{highestThreat.metadata?.magnitude?.toFixed(1)} — {highestThreat.location}</p>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard label="Total Recorded" value={stats?.total ?? earthquakes.length} icon={<Activity size={20} className="text-gray-600" />} color="bg-gray-100" />
          <StatCard label="Last 24 Hours" value={stats?.last24Hours ?? 0} icon={<Clock size={20} className="text-blue-600" />} color="bg-blue-50" />
          <StatCard label="High / Critical" value={(severityCounts.Critical || 0) + (severityCounts.High || 0)} icon={<AlertTriangle size={20} className="text-red-600" />} color="bg-red-50" />
          <StatCard label="Tsunami Alerts" value={stats?.tsunamiCount ?? 0} icon={<Waves size={20} className="text-blue-600" />} color="bg-blue-50" />
        </div>

        {/* Threat legend */}
        <div className="bg-white rounded-xl p-4 mb-6 shadow-sm border border-gray-100">
          <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Threat Level Guide</p>
          <div className="flex flex-wrap gap-4">
            {Object.entries(THREAT_CONFIG).map(([level, cfg]) => (
              <div key={level} className="flex items-center gap-1.5 text-xs">
                <span>{cfg.icon}</span>
                <span className={`font-semibold ${cfg.text}`}>{level}</span>
                <span className="text-gray-400">
                  {level === 'Critical' && '≥ M7.0'}
                  {level === 'High' && 'M6.0–6.9'}
                  {level === 'Moderate' && 'M5.0–5.9'}
                  {level === 'Low' && 'M4.0–4.9'}
                  {level === 'Minor' && '< M4.0'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 flex-wrap mb-6">
          {SEVERITY_FILTERS.map(s => {
            const cfg = THREAT_CONFIG[s];
            const count = s === 'All' ? earthquakes.length : severityCounts[s] || 0;
            return (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all border ${
                  filter === s
                    ? cfg ? `${cfg.badge} border-transparent` : 'bg-gray-800 text-white border-transparent'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                }`}
              >
                {s} {count > 0 && <span className="ml-1 opacity-75">({count})</span>}
              </button>
            );
          })}
        </div>

        {/* List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Activity size={40} className="text-red-400 animate-pulse mx-auto mb-3" />
              <p className="text-gray-500">Fetching latest data from PHIVOLCS...</p>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-100">
            <p className="text-gray-400 text-lg">No earthquakes found</p>
            <p className="text-gray-400 text-sm mt-1">
              {filter !== 'All' ? `No ${filter} threat earthquakes recorded` : 'Click "Fetch Latest" to load data'}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {filtered.map(eq => <EarthquakeCard key={eq._id} earthquake={eq} />)}
          </div>
        )}

        <p className="text-center text-xs text-gray-400 mt-8">
          Primary data: <a href="https://earthquake.phivolcs.dost.gov.ph" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-600">PHIVOLCS — DOST</a>
          &nbsp;· Fallback: USGS Earthquake Hazards Program
        </p>
      </div>
    </div>
  );
};

export default EarthquakeDashboard;

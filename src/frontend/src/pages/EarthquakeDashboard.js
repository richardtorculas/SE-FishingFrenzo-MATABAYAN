import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Activity, AlertTriangle, MapPin, Clock, Layers, RefreshCw, ExternalLink, Waves } from 'lucide-react';

const THREAT_CONFIG = {
  Critical: { bg: 'bg-red-50',    border: 'border-l-red-400',    text: 'text-red-700',    badge: 'bg-red-100 text-red-700',    icon: '🔴', pulse: true  },
  High:     { bg: 'bg-orange-50', border: 'border-l-orange-400', text: 'text-orange-700', badge: 'bg-orange-100 text-orange-700', icon: '🟠', pulse: true  },
  Moderate: { bg: 'bg-amber-50',  border: 'border-l-amber-400',  text: 'text-amber-700',  badge: 'bg-amber-100 text-amber-700',  icon: '🟡', pulse: false },
  Low:      { bg: 'bg-gray-50',   border: 'border-l-gray-400',   text: 'text-gray-600',   badge: 'bg-gray-100 text-gray-600',    icon: '🔵', pulse: false },
  Minor:    { bg: 'bg-white',     border: 'border-l-gray-200',   text: 'text-gray-500',   badge: 'bg-gray-100 text-gray-500',    icon: '🟢', pulse: false }
};

const getMagnitudeBar = (magnitude) => {
  const pct = Math.min((magnitude / 9) * 100, 100);
  let color = 'bg-gray-300';
  if (magnitude >= 7) color = 'bg-red-400';
  else if (magnitude >= 6) color = 'bg-orange-400';
  else if (magnitude >= 5) color = 'bg-amber-400';
  else if (magnitude >= 4) color = 'bg-gray-400';
  return { pct, color };
};

const EarthquakeCard = ({ earthquake }) => {
  const threat = THREAT_CONFIG[earthquake.severity] || THREAT_CONFIG.Minor;
  const meta = earthquake.metadata || {};
  const { pct, color } = getMagnitudeBar(meta.magnitude || 0);

  return (
    <div className={`rounded-2xl border-l-4 ${threat.border} ${threat.bg} border border-gray-100 p-5 shadow-card hover:shadow-card-hover transition-shadow duration-200`}>
      {meta.tsunami && (
        <div className="flex items-center gap-2 bg-gray-800 text-white text-xs font-semibold px-3 py-1.5 rounded-xl mb-3">
          <Waves size={13} /> TSUNAMI WARNING ISSUED
        </div>
      )}

      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">{threat.icon}</span>
          <div>
            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${threat.badge} ${threat.pulse ? 'animate-pulse' : ''}`}>
              {earthquake.severity} THREAT
            </span>
            {meta.felt > 0 && (
              <p className="text-xs text-subtle mt-0.5">👥 Felt by {meta.felt} {meta.felt === 1 ? 'person' : 'people'}</p>
            )}
          </div>
        </div>
        <div className="text-right">
          <p className="text-3xl font-black text-ink">M{meta.magnitude?.toFixed(1) ?? 'N/A'}</p>
          <p className="text-xs text-subtle">Magnitude</p>
        </div>
      </div>

      <div className="mb-3">
        <div className="flex justify-between text-xs text-subtle mb-1">
          <span>Magnitude Scale</span>
          <span>{meta.magnitude?.toFixed(1)} / 9.0</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-1.5">
          <div className={`h-1.5 rounded-full ${color} transition-all duration-500`} style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm mb-3">
        <div className="flex items-start gap-1.5 text-subtle col-span-2">
          <MapPin size={13} className="mt-0.5 shrink-0" />
          <span className="text-xs">{earthquake.location}</span>
        </div>
        <div className="flex items-center gap-1.5 text-subtle">
          <Layers size={13} />
          <span className="text-xs">Depth: {meta.depth ?? 'N/A'} km {meta.depth < 70 ? '⚠️ Shallow' : ''}</span>
        </div>
        <div className="text-xs text-subtle">
          📍 {meta.latitude?.toFixed(3)}°N, {meta.longitude?.toFixed(3)}°E
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium px-2 py-0.5 rounded-lg bg-gray-100 text-gray-600">📡 PHIVOLCS</span>
          {meta.usgsUrl && (
            <a href={meta.usgsUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-subtle hover:text-ink flex items-center gap-0.5 transition-colors">
              <ExternalLink size={11} /> Details
            </a>
          )}
        </div>
        <div className="flex items-center gap-1 text-xs text-subtle">
          <Clock size={11} />
          {new Date(earthquake.timestamp).toLocaleString('en-PH', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
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
        axios.get(`${process.env.REACT_APP_API_URL}/api/earthquakes`),
        axios.get(`${process.env.REACT_APP_API_URL}/api/earthquakes/stats`)
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
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/earthquakes/update`);
      await loadData();
      return res.data;
    } catch (err) {
      setError('Failed to fetch from PHIVOLCS. Check your internet connection.');
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try { await axios.post(`${process.env.REACT_APP_API_URL}/api/earthquakes/update`); } catch (_) {}
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
    <div className="min-h-screen bg-muted">
      <div className="container mx-auto px-6 py-10 max-w-6xl">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start justify-between mb-8 gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-subtle mb-1">PHIVOLCS</p>
            <div className="flex items-center gap-2.5 mb-1">
              <Activity className="text-gray-700" size={24} />
              <h1 className="text-2xl font-bold text-ink tracking-tight">Earthquake Monitor</h1>
            </div>
            <p className="text-sm text-subtle">
              Latest Earthquake Information — Philippines
              {lastUpdated && <span className="ml-2">· Updated {lastUpdated.toLocaleTimeString('en-PH')}</span>}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">Auto-refreshes every 5 minutes</p>
          </div>
          <button
            onClick={triggerUpdate}
            disabled={refreshing}
            className="btn-secondary flex items-center gap-2 self-start"
          >
            <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
            {refreshing ? 'Fetching...' : 'Fetch Latest'}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-700 rounded-2xl p-4 mb-6 text-sm">⚠️ {error}</div>
        )}

        {tsunamiActive && (
          <div className="bg-gray-900 text-white rounded-2xl p-4 mb-4 flex items-center gap-3">
            <Waves size={20} />
            <div>
              <p className="font-bold text-sm">🌊 TSUNAMI WARNING ACTIVE</p>
              <p className="text-xs opacity-75">A tsunami warning has been issued for one or more recent earthquakes.</p>
            </div>
          </div>
        )}

        {highestThreat && (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-2xl p-4 mb-6 flex items-center gap-3">
            <AlertTriangle size={18} className="shrink-0" />
            <div>
              <p className="font-semibold text-sm">Active High-Threat Earthquake</p>
              <p className="text-xs opacity-80 mt-0.5">M{highestThreat.metadata?.magnitude?.toFixed(1)} — {highestThreat.location}</p>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard label="Total Recorded"  value={stats?.total ?? earthquakes.length}                                          icon={<Activity size={18} className="text-gray-500" />}     color="bg-gray-50"  />
          <StatCard label="Last 24 Hours"   value={stats?.last24Hours ?? 0}                                                     icon={<Clock size={18} className="text-gray-500" />}        color="bg-gray-50"  />
          <StatCard label="High / Critical" value={(severityCounts.Critical || 0) + (severityCounts.High || 0)}                 icon={<AlertTriangle size={18} className="text-red-400" />} color="bg-red-50"   />
          <StatCard label="Tsunami Alerts"  value={stats?.tsunamiCount ?? 0}                                                    icon={<Waves size={18} className="text-gray-500" />}        color="bg-gray-50"  />
        </div>

        {/* Threat legend */}
        <div className="card mb-6">
          <p className="text-xs font-semibold text-subtle uppercase tracking-wide mb-3">Threat Level Guide</p>
          <div className="flex flex-wrap gap-5">
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
            const count = s === 'All' ? earthquakes.length : severityCounts[s] || 0;
            return (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                  filter === s
                    ? 'bg-ink text-white border-ink'
                    : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400 hover:text-gray-700'
                }`}
              >
                {s} {count > 0 && <span className="ml-1 opacity-60">({count})</span>}
              </button>
            );
          })}
        </div>

        {/* List */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="text-center">
              <Activity size={36} className="text-gray-300 animate-pulse mx-auto mb-3" />
              <p className="text-subtle text-sm">Fetching latest data from PHIVOLCS...</p>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="card p-16 text-center">
            <p className="text-subtle text-base">No earthquakes found</p>
            <p className="text-gray-400 text-sm mt-1">
              {filter !== 'All' ? `No ${filter} threat earthquakes recorded` : 'Click "Fetch Latest" to load data'}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {filtered.map(eq => <EarthquakeCard key={eq._id} earthquake={eq} />)}
          </div>
        )}

        <p className="text-center text-xs text-gray-400 mt-10">
          Primary data: <a href="https://earthquake.phivolcs.dost.gov.ph" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-600">PHIVOLCS — DOST</a>
          &nbsp;· Fallback: USGS Earthquake Hazards Program
        </p>
      </div>
    </div>
  );
};

export default EarthquakeDashboard;

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Wind, AlertTriangle, MapPin, Clock, RefreshCw, Navigation, Compass, BarChart2 } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadialBarChart, RadialBar, Legend
} from 'recharts';

const SEVERITY_CONFIG = {
  Critical: { light: 'bg-red-50',    border: 'border-red-500',    text: 'text-red-700',    badge: 'bg-red-600 text-white',      icon: '🔴', pulse: true  },
  High:     { light: 'bg-orange-50', border: 'border-orange-400', text: 'text-orange-700', badge: 'bg-orange-500 text-white',    icon: '🟠', pulse: true  },
  Moderate: { light: 'bg-yellow-50', border: 'border-yellow-400', text: 'text-yellow-700', badge: 'bg-yellow-400 text-gray-900', icon: '🟡', pulse: false },
  Low:      { light: 'bg-blue-50',   border: 'border-blue-400',   text: 'text-blue-700',   badge: 'bg-blue-500 text-white',      icon: '🔵', pulse: false },
};

const CATEGORY_COLORS = {
  'Super Typhoon':         '#dc2626',
  'Typhoon':               '#f97316',
  'Severe Tropical Storm': '#eab308',
  'Tropical Storm':        '#3b82f6',
  'Tropical Depression':   '#22c55e',
  'Low Pressure Area':     '#94a3b8',
};

const getWindBar = (windKph) => {
  const pct = Math.min((windKph / 250) * 100, 100);
  let color = 'bg-green-400';
  if (windKph >= 185)      color = 'bg-red-600';
  else if (windKph >= 118) color = 'bg-red-400';
  else if (windKph >= 89)  color = 'bg-orange-500';
  else if (windKph >= 62)  color = 'bg-yellow-400';
  return { pct, color };
};

// ── Typhoon Card ──────────────────────────────────────────────────────────────
const TyphoonCard = ({ typhoon }) => {
  const cfg = SEVERITY_CONFIG[typhoon.severity] || SEVERITY_CONFIG.Low;
  const { pct, color } = getWindBar(typhoon.windKph || 0);

  return (
    <div className={`rounded-xl border-l-4 ${cfg.border} ${cfg.light} p-5 shadow-sm hover:shadow-md transition-shadow`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🌀</span>
          <div>
            <p className="text-lg font-black text-gray-900">{typhoon.name || 'UNNAMED'}</p>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${cfg.badge} ${cfg.pulse ? 'animate-pulse' : ''}`}>
              {typhoon.category}
            </span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-black text-gray-800">{typhoon.windKph ?? '—'}</p>
          <p className="text-xs text-gray-500">km/h</p>
        </div>
      </div>

      {typhoon.signal > 0 && (
        <div className="mb-3">
          <span className={`text-xs font-bold px-2 py-1 rounded ${typhoon.signal >= 3 ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
            ⚠️ PAGASA Signal No. {typhoon.signal}
          </span>
        </div>
      )}

      <div className="mb-3">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Wind Speed</span>
          <span>{typhoon.windKph ?? 0} / 250 km/h</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className={`h-2 rounded-full ${color} transition-all duration-500`} style={{ width: `${pct}%` }} />
        </div>
      </div>

      {typhoon.trajectory?.length > 0 && (
        <div className="mb-3 text-xs text-gray-500 flex items-center gap-1">
          <Navigation size={12} />
          {typhoon.trajectory.length} trajectory point{typhoon.trajectory.length > 1 ? 's' : ''} recorded
        </div>
      )}

      <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-3">
        <div className="flex items-start gap-1.5 col-span-2">
          <MapPin size={13} className="mt-0.5 shrink-0" />
          <span>{typhoon.affectedArea || typhoon.location}</span>
        </div>
        {typhoon.latitude && typhoon.longitude && (
          <div className="flex items-center gap-1.5">
            <Compass size={13} />
            <span>{typhoon.latitude}°N, {typhoon.longitude}°E</span>
          </div>
        )}
        {typhoon.movementDirection && typhoon.movementDirection !== 'UNKNOWN' && (
          <div className="flex items-center gap-1.5">
            <Navigation size={13} />
            <span>Moving {typhoon.movementDirection}{typhoon.movementSpeedKph ? ` at ${typhoon.movementSpeedKph} km/h` : ''}</span>
          </div>
        )}
      </div>

      <p className="text-xs text-gray-500 mb-3 leading-relaxed">{typhoon.description}</p>

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

// ── Stat Card ─────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, icon, color }) => (
  <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-4">
    <div className={`p-3 rounded-lg ${color}`}>{icon}</div>
    <div>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  </div>
);

// ── Windy iframe Map ──────────────────────────────────────────────────────────
const CycloneMap = ({ typhoons }) => {
  const activeStorm = typhoons.find(t => t.latitude && t.longitude);
  const lat  = activeStorm ? activeStorm.latitude  : 12.0;
  const lon  = activeStorm ? activeStorm.longitude : 122.0;
  const zoom = activeStorm ? 6 : 5;

  const src = `https://embed.windy.com/embed2.html` +
    `?lat=${lat}&lon=${lon}` +
    `&detailLat=${lat}&detailLon=${lon}` +
    `&zoom=${zoom}` +
    `&level=surface&overlay=wind` +
    `&product=ecmwf&menu=&message=true` +
    `&marker=true&calendar=now&pressure=` +
    `&type=map&location=coordinates` +
    `&metricWind=km%2Fh&metricTemp=%C2%B0C&radarRange=-1`;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
        <MapPin size={16} className="text-blue-600" />
        <p className="text-sm font-semibold text-gray-700">Live Wind & Cyclone Map</p>
        <span className="text-xs text-gray-400 ml-1">powered by Windy</span>
        {activeStorm && (
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 ml-2">
            🌀 Centered on {activeStorm.name}
          </span>
        )}
        <span className="text-xs text-gray-400 ml-auto">Philippine Area of Responsibility</span>
      </div>

      {/* Active storm info bar */}
      {typhoons.length > 0 && (
        <div className="px-4 py-2 bg-blue-50 border-b border-blue-100 flex flex-wrap gap-4">
          {typhoons.map(t => (
            <div key={t._id} className="flex items-center gap-1.5 text-xs">
              <span>🌀</span>
              <span className="font-semibold text-gray-700">{t.name}</span>
              <span className="text-gray-500">{t.category}</span>
              <span className="font-medium text-blue-700">{t.windKph} km/h</span>
              {t.latitude && t.longitude && (
                <span className="text-gray-400">{t.latitude}°N {t.longitude}°E</span>
              )}
            </div>
          ))}
        </div>
      )}

      <iframe
        title="Windy Live Wind Map"
        src={src}
        style={{ width: '100%', height: '500px', border: 'none', display: 'block' }}
        allowFullScreen
        loading="lazy"
      />

      <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 text-xs text-gray-400">
        🌬️ Live wind animation · Use Windy controls inside the map to switch layers
      </div>
    </div>
  );
};

// ── Wind Speed Chart ──────────────────────────────────────────────────────────
const WindSpeedChart = ({ typhoons }) => {
  const data = typhoons.map(t => ({
    name: t.name,
    windKph: t.windKph,
  }));

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <div className="flex items-center gap-2 mb-4">
        <BarChart2 size={16} className="text-blue-600" />
        <p className="text-sm font-semibold text-gray-700">Wind Speed Comparison (km/h)</p>
      </div>
      {data.length === 0 ? (
        <p className="text-xs text-gray-400 text-center py-8">No active cyclones to display</p>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} domain={[0, 250]} />
            <Tooltip formatter={(value) => [`${value} km/h`, 'Wind Speed']} contentStyle={{ fontSize: 12 }} />
            <Bar dataKey="windKph" radius={[4, 4, 0, 0]} fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

// ── Category Chart ────────────────────────────────────────────────────────────
const CategoryChart = ({ typhoons }) => {
  const counts = typhoons.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + 1;
    return acc;
  }, {});

  const data = Object.entries(counts).map(([name, value]) => ({
    name, value, fill: CATEGORY_COLORS[name] || '#94a3b8'
  }));

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-base">🌀</span>
        <p className="text-sm font-semibold text-gray-700">Storm Category Distribution</p>
      </div>
      {data.length === 0 ? (
        <p className="text-xs text-gray-400 text-center py-8">No active cyclones to display</p>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <RadialBarChart innerRadius="20%" outerRadius="90%" data={data} startAngle={180} endAngle={0}>
            <RadialBar minAngle={15} label={{ position: 'insideStart', fill: '#fff', fontSize: 10 }} background clockWise dataKey="value" />
            <Legend iconSize={10} layout="vertical" verticalAlign="middle" align="right" formatter={(v) => <span style={{ fontSize: 11 }}>{v}</span>} />
            <Tooltip contentStyle={{ fontSize: 12 }} />
          </RadialBarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

// ── Trajectory Chart ──────────────────────────────────────────────────────────
const TrajectoryChart = ({ typhoon }) => {
  if (!typhoon?.trajectory?.length) return null;
  const data = typhoon.trajectory.map((p, i) => ({
    point: `T${i + 1}`,
    windKph: p.windKph || 0,
    time: new Date(p.timestamp).toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })
  }));

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Navigation size={16} className="text-orange-500" />
        <p className="text-sm font-semibold text-gray-700">{typhoon.name} — Wind Speed Along Path</p>
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="point" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} domain={[0, 250]} />
          <Tooltip formatter={(value, name, props) => [`${value} km/h at ${props.payload.time}`, 'Wind Speed']} contentStyle={{ fontSize: 12 }} />
          <Bar dataKey="windKph" fill="#f97316" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// ── Main Dashboard ────────────────────────────────────────────────────────────
const TyphoonDashboard = () => {
  const [typhoons, setTyphoons]       = useState([]);
  const [stats, setStats]             = useState(null);
  const [loading, setLoading]         = useState(true);
  const [refreshing, setRefreshing]   = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError]             = useState(null);
  const [activeTab, setActiveTab]     = useState('overview');

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
    const interval = setInterval(triggerUpdate, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, [loadData, triggerUpdate]);

  const activeCritical = typhoons.find(t => ['Critical', 'High'].includes(t.severity));
  const strongestStorm = typhoons.reduce((max, t) => (!max || t.windKph > max.windKph ? t : max), null);
  const TABS = ['overview', 'charts', 'map'];

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
              {lastUpdated && <span className="ml-2 text-gray-400">· Updated {lastUpdated.toLocaleTimeString('en-PH')}</span>}
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

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-6 text-sm">⚠️ {error}</div>
        )}

        {activeCritical && (
          <div className="bg-red-600 text-white rounded-xl p-4 mb-6 flex items-center gap-3 animate-pulse">
            <AlertTriangle size={20} />
            <div>
              <p className="font-bold text-sm">🌀 ACTIVE {activeCritical.severity.toUpperCase()} CYCLONE</p>
              <p className="text-xs opacity-90">{activeCritical.category} {activeCritical.name} — {activeCritical.windKph} km/h · Signal No. {activeCritical.signal}</p>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard label="Active Cyclones" value={stats?.total ?? typhoons.length}                               icon={<Wind size={20} className="text-blue-600" />}         color="bg-blue-50"   />
          <StatCard label="Highest Winds"   value={stats?.highestWindKph ? `${stats.highestWindKph} km/h` : '—'} icon={<AlertTriangle size={20} className="text-red-600" />} color="bg-red-50"    />
          <StatCard label="Strongest Storm" value={stats?.highestStormName ?? 'None'}                             icon={<span className="text-lg">🌀</span>}                  color="bg-yellow-50" />
          <StatCard label="Category"        value={stats?.highestCategory ?? 'None'}                              icon={<BarChart2 size={20} className="text-purple-600" />}  color="bg-purple-50" />
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
                activeTab === tab ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab === 'overview' && '📋 '}{tab === 'charts' && '📊 '}{tab === 'map' && '🗺️ '}
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Wind size={40} className="text-blue-400 animate-pulse mx-auto mb-3" />
              <p className="text-gray-500">Fetching latest data from PAGASA...</p>
            </div>
          </div>

        ) : activeTab === 'overview' ? (
          <>
            <div className="bg-white rounded-xl p-4 mb-6 shadow-sm border border-gray-100">
              <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Category Guide (Max Sustained Winds)</p>
              <div className="flex flex-wrap gap-4 text-xs">
                {[
                  { label: 'Super Typhoon',         range: '≥ 185 km/h',   color: 'text-red-700'    },
                  { label: 'Typhoon',               range: '118–184 km/h', color: 'text-orange-700' },
                  { label: 'Severe Tropical Storm', range: '89–117 km/h',  color: 'text-yellow-700' },
                  { label: 'Tropical Storm',        range: '62–88 km/h',   color: 'text-blue-700'   },
                  { label: 'Tropical Depression',   range: '45–61 km/h',   color: 'text-green-700'  },
                ].map(c => (
                  <div key={c.label} className="flex items-center gap-1.5">
                    <span>🌀</span>
                    <span className={`font-semibold ${c.color}`}>{c.label}</span>
                    <span className="text-gray-400">{c.range}</span>
                  </div>
                ))}
              </div>
            </div>
            {typhoons.length === 0 ? (
              <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-100">
                <p className="text-4xl mb-3">✅</p>
                <p className="text-gray-700 text-lg font-semibold">No Active Tropical Cyclones</p>
                <p className="text-gray-400 text-sm mt-1">There are currently no tropical cyclones in the Philippine Area of Responsibility.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {typhoons.map(t => <TyphoonCard key={t._id} typhoon={t} />)}
              </div>
            )}
          </>

        ) : activeTab === 'charts' ? (
          <>
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <WindSpeedChart typhoons={typhoons} />
              <CategoryChart  typhoons={typhoons} />
            </div>
            {strongestStorm && <TrajectoryChart typhoon={strongestStorm} />}
          </>

        ) : activeTab === 'map' ? (
          <>
            <CycloneMap typhoons={typhoons} />
            {typhoons.filter(t => t.trajectory?.length > 1).map(t => (
              <TrajectoryChart key={t._id} typhoon={t} />
            ))}
          </>

        ) : null}

        <p className="text-center text-xs text-gray-400 mt-8">
          Primary data: <a href="https://bagong.pagasa.dost.gov.ph/tropical-cyclone/weather-bulletin" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-600">PAGASA — DOST</a>
          &nbsp;· Fallback: JTWC Western Pacific · Map: Windy.com
        </p>
      </div>
    </div>
  );
};

export default TyphoonDashboard;

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Wind, AlertTriangle, MapPin, Clock, RefreshCw, Navigation, Compass, BarChart2 } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadialBarChart, RadialBar, Legend
} from 'recharts';

const SEVERITY_CONFIG = {
  Critical: { bg: 'bg-red-50',    border: 'border-l-red-400',    text: 'text-red-700',    badge: 'bg-red-100 text-red-700',      pulse: true  },
  High:     { bg: 'bg-orange-50', border: 'border-l-orange-400', text: 'text-orange-700', badge: 'bg-orange-100 text-orange-700', pulse: true  },
  Moderate: { bg: 'bg-amber-50',  border: 'border-l-amber-400',  text: 'text-amber-700',  badge: 'bg-amber-100 text-amber-700',   pulse: false },
  Low:      { bg: 'bg-gray-50',   border: 'border-l-gray-300',   text: 'text-gray-600',   badge: 'bg-gray-100 text-gray-600',     pulse: false },
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
  let color = 'bg-gray-300';
  if (windKph >= 185)      color = 'bg-red-400';
  else if (windKph >= 118) color = 'bg-orange-400';
  else if (windKph >= 89)  color = 'bg-amber-400';
  else if (windKph >= 62)  color = 'bg-gray-400';
  return { pct, color };
};

const TyphoonCard = ({ typhoon }) => {
  const cfg = SEVERITY_CONFIG[typhoon.severity] || SEVERITY_CONFIG.Low;
  const { pct, color } = getWindBar(typhoon.windKph || 0);

  return (
    <div className={`rounded-2xl border-l-4 ${cfg.border} ${cfg.bg} border border-gray-100 p-5 shadow-card hover:shadow-card-hover transition-shadow duration-200`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">🌀</span>
          <div>
            <p className="text-base font-bold text-ink">{typhoon.name || 'UNNAMED'}</p>
            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${cfg.badge} ${cfg.pulse ? 'animate-pulse' : ''}`}>
              {typhoon.category}
            </span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-black text-ink">{typhoon.windKph ?? '—'}</p>
          <p className="text-xs text-subtle">km/h</p>
        </div>
      </div>

      {typhoon.signal > 0 && (
        <div className="mb-3">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${typhoon.signal >= 3 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
            ⚠️ PAGASA Signal No. {typhoon.signal}
          </span>
        </div>
      )}

      <div className="mb-3">
        <div className="flex justify-between text-xs text-subtle mb-1">
          <span>Wind Speed</span>
          <span>{typhoon.windKph ?? 0} / 250 km/h</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-1.5">
          <div className={`h-1.5 rounded-full ${color} transition-all duration-500`} style={{ width: `${pct}%` }} />
        </div>
      </div>

      {typhoon.trajectory?.length > 0 && (
        <div className="mb-3 text-xs text-subtle flex items-center gap-1">
          <Navigation size={12} />
          {typhoon.trajectory.length} trajectory point{typhoon.trajectory.length > 1 ? 's' : ''} recorded
        </div>
      )}

      <div className="grid grid-cols-2 gap-2 text-xs text-subtle mb-3">
        <div className="flex items-start gap-1.5 col-span-2">
          <MapPin size={12} className="mt-0.5 shrink-0" />
          <span>{typhoon.affectedArea || typhoon.location}</span>
        </div>
        {typhoon.latitude && typhoon.longitude && (
          <div className="flex items-center gap-1.5">
            <Compass size={12} />
            <span>{typhoon.latitude}°N, {typhoon.longitude}°E</span>
          </div>
        )}
        {typhoon.movementDirection && typhoon.movementDirection !== 'UNKNOWN' && (
          <div className="flex items-center gap-1.5">
            <Navigation size={12} />
            <span>Moving {typhoon.movementDirection}{typhoon.movementSpeedKph ? ` at ${typhoon.movementSpeedKph} km/h` : ''}</span>
          </div>
        )}
      </div>

      <p className="text-xs text-subtle mb-3 leading-relaxed">{typhoon.description}</p>

      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <span className="text-xs font-medium px-2 py-0.5 rounded-lg bg-gray-100 text-gray-600">📡 {typhoon.source}</span>
        <div className="flex items-center gap-1 text-xs text-subtle">
          <Clock size={11} />
          {new Date(typhoon.timestamp).toLocaleString('en-PH', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
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

const CycloneMap = ({ typhoons }) => {
  const activeStorm = typhoons.find(t => t.latitude && t.longitude);
  const lat  = activeStorm ? activeStorm.latitude  : 12.0;
  const lon  = activeStorm ? activeStorm.longitude : 122.0;
  const zoom = activeStorm ? 6 : 5;

  const src = `https://embed.windy.com/embed2.html` +
    `?lat=${lat}&lon=${lon}&detailLat=${lat}&detailLon=${lon}` +
    `&zoom=${zoom}&level=surface&overlay=wind&product=ecmwf&menu=&message=true` +
    `&marker=true&calendar=now&pressure=&type=map&location=coordinates` +
    `&metricWind=km%2Fh&metricTemp=%C2%B0C&radarRange=-1`;

  return (
    <div className="card overflow-hidden p-0 mb-6">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
        <MapPin size={15} className="text-gray-500" />
        <p className="text-sm font-semibold text-ink">Live Wind & Cyclone Map</p>
        <span className="text-xs text-subtle ml-1">powered by Windy</span>
        {activeStorm && (
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 ml-2">
            🌀 Centered on {activeStorm.name}
          </span>
        )}
        <span className="text-xs text-subtle ml-auto">Philippine Area of Responsibility</span>
      </div>

      {typhoons.length > 0 && (
        <div className="px-5 py-2.5 bg-gray-50 border-b border-gray-100 flex flex-wrap gap-4">
          {typhoons.map(t => (
            <div key={t._id} className="flex items-center gap-1.5 text-xs">
              <span>🌀</span>
              <span className="font-semibold text-ink">{t.name}</span>
              <span className="text-subtle">{t.category}</span>
              <span className="font-medium text-gray-700">{t.windKph} km/h</span>
              {t.latitude && t.longitude && <span className="text-subtle">{t.latitude}°N {t.longitude}°E</span>}
            </div>
          ))}
        </div>
      )}

      <iframe title="Windy Live Wind Map" src={src} style={{ width: '100%', height: '500px', border: 'none', display: 'block' }} allowFullScreen loading="lazy" />

      <div className="px-5 py-2.5 bg-gray-50 border-t border-gray-100 text-xs text-subtle">
        🌬️ Live wind animation · Use Windy controls inside the map to switch layers
      </div>
    </div>
  );
};

const WindSpeedChart = ({ typhoons }) => {
  const data = typhoons.map(t => ({ name: t.name, windKph: t.windKph }));
  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-4">
        <BarChart2 size={15} className="text-gray-500" />
        <p className="text-sm font-semibold text-ink">Wind Speed Comparison (km/h)</p>
      </div>
      {data.length === 0 ? (
        <p className="text-xs text-subtle text-center py-8">No active cyclones to display</p>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#71717a' }} />
            <YAxis tick={{ fontSize: 11, fill: '#71717a' }} domain={[0, 250]} />
            <Tooltip formatter={(value) => [`${value} km/h`, 'Wind Speed']} contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e4e4e7' }} />
            <Bar dataKey="windKph" radius={[6, 6, 0, 0]} fill="#18181b" />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

const CategoryChart = ({ typhoons }) => {
  const counts = typhoons.reduce((acc, t) => { acc[t.category] = (acc[t.category] || 0) + 1; return acc; }, {});
  const data = Object.entries(counts).map(([name, value]) => ({ name, value, fill: CATEGORY_COLORS[name] || '#94a3b8' }));
  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-base">🌀</span>
        <p className="text-sm font-semibold text-ink">Storm Category Distribution</p>
      </div>
      {data.length === 0 ? (
        <p className="text-xs text-subtle text-center py-8">No active cyclones to display</p>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <RadialBarChart innerRadius="20%" outerRadius="90%" data={data} startAngle={180} endAngle={0}>
            <RadialBar minAngle={15} label={{ position: 'insideStart', fill: '#fff', fontSize: 10 }} background clockWise dataKey="value" />
            <Legend iconSize={10} layout="vertical" verticalAlign="middle" align="right" formatter={(v) => <span style={{ fontSize: 11 }}>{v}</span>} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e4e4e7' }} />
          </RadialBarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

const TrajectoryChart = ({ typhoon }) => {
  if (!typhoon?.trajectory?.length) return null;
  const data = typhoon.trajectory.map((p, i) => ({
    point: `T${i + 1}`,
    windKph: p.windKph || 0,
    time: new Date(p.timestamp).toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })
  }));
  return (
    <div className="card mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Navigation size={15} className="text-gray-500" />
        <p className="text-sm font-semibold text-ink">{typhoon.name} — Wind Speed Along Path</p>
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
          <XAxis dataKey="point" tick={{ fontSize: 11, fill: '#71717a' }} />
          <YAxis tick={{ fontSize: 11, fill: '#71717a' }} domain={[0, 250]} />
          <Tooltip formatter={(value, name, props) => [`${value} km/h at ${props.payload.time}`, 'Wind Speed']} contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e4e4e7' }} />
          <Bar dataKey="windKph" fill="#71717a" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

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
        axios.get(`${process.env.REACT_APP_API_URL}/api/typhoons`),
        axios.get(`${process.env.REACT_APP_API_URL}/api/typhoons/stats`)
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
      await axios.post(`${process.env.REACT_APP_API_URL}/api/typhoons/update`);
      await loadData();
    } catch (err) {
      setError('Failed to fetch from PAGASA. Check your internet connection.');
      setRefreshing(false);
    }
  }, [loadData]);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try { await axios.post(`${process.env.REACT_APP_API_URL}/api/typhoons/update`); } catch (_) {}
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
    <div className="min-h-screen bg-muted">
      <div className="container mx-auto px-6 py-10 max-w-6xl">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start justify-between mb-8 gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-subtle mb-1">PAGASA</p>
            <div className="flex items-center gap-2.5 mb-1">
              <Wind className="text-gray-700" size={24} />
              <h1 className="text-2xl font-bold text-ink tracking-tight">Typhoon Monitor</h1>
            </div>
            <p className="text-sm text-subtle">
              Active Tropical Cyclones — Philippine Area of Responsibility
              {lastUpdated && <span className="ml-2">· Updated {lastUpdated.toLocaleTimeString('en-PH')}</span>}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">Fallback: JTWC · Auto-refreshes every 30 minutes</p>
          </div>
          <button onClick={triggerUpdate} disabled={refreshing} className="btn-secondary flex items-center gap-2 self-start">
            <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
            {refreshing ? 'Fetching...' : 'Fetch Latest'}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-700 rounded-2xl p-4 mb-6 text-sm">⚠️ {error}</div>
        )}

        {activeCritical && (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-2xl p-4 mb-6 flex items-center gap-3">
            <AlertTriangle size={18} className="shrink-0" />
            <div>
              <p className="font-semibold text-sm">Active {activeCritical.severity} Cyclone</p>
              <p className="text-xs opacity-80 mt-0.5">{activeCritical.category} {activeCritical.name} — {activeCritical.windKph} km/h · Signal No. {activeCritical.signal}</p>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard label="Active Cyclones" value={stats?.total ?? typhoons.length}                               icon={<Wind size={18} className="text-gray-500" />}         color="bg-gray-50"   />
          <StatCard label="Highest Winds"   value={stats?.highestWindKph ? `${stats.highestWindKph} km/h` : '—'} icon={<AlertTriangle size={18} className="text-red-400" />} color="bg-red-50"    />
          <StatCard label="Strongest Storm" value={stats?.highestStormName ?? 'None'}                             icon={<span className="text-base">🌀</span>}                color="bg-gray-50"   />
          <StatCard label="Category"        value={stats?.highestCategory ?? 'None'}                              icon={<BarChart2 size={18} className="text-gray-500" />}    color="bg-gray-50"   />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b border-gray-200">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-sm font-medium capitalize transition-all border-b-2 -mb-px ${
                activeTab === tab ? 'border-ink text-ink' : 'border-transparent text-subtle hover:text-gray-700'
              }`}
            >
              {tab === 'overview' && '📋 '}{tab === 'charts' && '📊 '}{tab === 'map' && '🗺️ '}
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="text-center">
              <Wind size={36} className="text-gray-300 animate-pulse mx-auto mb-3" />
              <p className="text-subtle text-sm">Fetching latest data from PAGASA...</p>
            </div>
          </div>

        ) : activeTab === 'overview' ? (
          <>
            <div className="card mb-6">
              <p className="text-xs font-semibold text-subtle uppercase tracking-wide mb-3">Category Guide (Max Sustained Winds)</p>
              <div className="flex flex-wrap gap-5 text-xs">
                {[
                  { label: 'Super Typhoon',         range: '≥ 185 km/h',   color: 'text-red-600'    },
                  { label: 'Typhoon',               range: '118–184 km/h', color: 'text-orange-600' },
                  { label: 'Severe Tropical Storm', range: '89–117 km/h',  color: 'text-amber-600'  },
                  { label: 'Tropical Storm',        range: '62–88 km/h',   color: 'text-gray-600'   },
                  { label: 'Tropical Depression',   range: '45–61 km/h',   color: 'text-gray-500'   },
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
              <div className="card p-16 text-center">
                <p className="text-4xl mb-3">✅</p>
                <p className="text-ink font-semibold">No Active Tropical Cyclones</p>
                <p className="text-subtle text-sm mt-1">There are currently no tropical cyclones in the Philippine Area of Responsibility.</p>
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

        <p className="text-center text-xs text-gray-400 mt-10">
          Primary data: <a href="https://bagong.pagasa.dost.gov.ph/tropical-cyclone/weather-bulletin" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-600">PAGASA — DOST</a>
          &nbsp;· Fallback: JTWC Western Pacific · Map: Windy.com
        </p>
      </div>
    </div>
  );
};

export default TyphoonDashboard;

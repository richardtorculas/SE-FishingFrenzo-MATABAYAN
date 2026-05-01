/**
 * ============================================
 * SEED: TYPHOON DASHBOARD DATA REFERENCES
 * ============================================
 * Commit: DB-05
 * Purpose: Seed typhoon dashboard data sources and category guide
 * ============================================
 */

const typhoonReferences = [
  {
    dashboardType: 'Typhoon',
    primarySource: {
      name: 'PAGASA (Philippine Atmospheric, Geophysical and Astronomical Services Administration)',
      url: 'https://bagong.pagasa.dost.gov.ph/tropical-cyclone/weather-bulletin',
      description: 'Tropical cyclone tracking and forecasts for Philippine Area of Responsibility (PAR)',
      organization: 'DOST (Department of Science and Technology)'
    },
    fallbackSource: {
      name: 'JTWC (Joint Typhoon Warning Center)',
      url: 'https://www.metoc.navy.mil/jtwc/jtwc.html',
      description: 'Western Pacific tropical cyclone data and forecasts',
      organization: 'U.S. Navy'
    },
    guideType: 'Category',
    guideItems: [
      {
        label: 'Super Typhoon',
        range: '≥ 185 km/h',
        color: 'text-red-600',
        description: 'Catastrophic damage - Extreme winds, widespread destruction'
      },
      {
        label: 'Typhoon',
        range: '118–184 km/h',
        color: 'text-orange-600',
        description: 'Severe damage - Very strong winds, major structural damage'
      },
      {
        label: 'Severe Tropical Storm',
        range: '89–117 km/h',
        color: 'text-amber-600',
        description: 'Moderate to severe damage - Strong winds, significant damage'
      },
      {
        label: 'Tropical Storm',
        range: '62–88 km/h',
        color: 'text-blue-600',
        description: 'Moderate damage - Moderate winds, some structural damage'
      },
      {
        label: 'Tropical Depression',
        range: '45–61 km/h',
        color: 'text-green-600',
        description: 'Light to moderate damage - Light winds, minimal damage'
      },
      {
        label: 'Low Pressure Area',
        range: '< 45 km/h',
        color: 'text-gray-600',
        description: 'Minimal impact - Light winds, generally no damage'
      }
    ],
    codeImplementation: {
      language: 'JavaScript',
      fileName: 'TyphoonDashboard.js',
      filePath: 'src/frontend/src/pages/TyphoonDashboard.js',
      code: `const SEVERITY_CONFIG = {
  Critical: { bg: 'bg-red-50',    border: 'border-l-red-400',    text: 'text-red-700',    badge: 'bg-red-100 text-red-700',      pulse: true  },
  High:     { bg: 'bg-orange-50', border: 'border-l-orange-400', text: 'text-orange-700', badge: 'bg-orange-100 text-orange-700', pulse: true  },
  Moderate: { bg: 'bg-amber-50',  border: 'border-l-amber-400',  text: 'text-amber-700',  badge: 'bg-amber-100 text-amber-700',  pulse: false },
  Low:      { bg: 'bg-gray-50',   border: 'border-l-gray-300',   text: 'text-gray-600',   badge: 'bg-gray-100 text-gray-600',    pulse: false },
};

const CATEGORY_COLORS = {
  'Super Typhoon':         '#dc2626',
  'Typhoon':               '#f97316',
  'Severe Tropical Storm': '#eab308',
  'Tropical Storm':        '#3b82f6',
  'Tropical Depression':   '#22c55e',
  'Low Pressure Area':     '#94a3b8',
};

const CATEGORY_GUIDE = [
  { label: 'Super Typhoon',         range: '≥ 185 km/h',   color: 'text-red-600'    },
  { label: 'Typhoon',               range: '118–184 km/h', color: 'text-orange-600' },
  { label: 'Severe Tropical Storm', range: '89–117 km/h',  color: 'text-amber-600'  },
  { label: 'Tropical Storm',        range: '62–88 km/h',   color: 'text-blue-600'   },
  { label: 'Tropical Depression',   range: '45–61 km/h',   color: 'text-green-600'  },
];

const getWindBar = (windKph) => {
  const pct = Math.min((windKph / 250) * 100, 100);
  let color = 'bg-gray-300';
  if (windKph >= 185)      color = 'bg-red-400';
  else if (windKph >= 118) color = 'bg-orange-400';
  else if (windKph >= 89)  color = 'bg-amber-400';
  else if (windKph >= 62)  color = 'bg-gray-400';
  return { pct, color };
};`,
      description: 'Severity configuration, category colors, category guide, and wind speed bar color mapping'
    },
    updateFrequency: {
      interval: 30,
      unit: 'minutes'
    },
    standards: ['Saffir-Simpson Scale (adapted for Philippine context)', 'PAGASA Classification System', 'JTWC Standards'],
    createdBy: 'System',
    notes: 'Wind speed categories follow PAGASA classification for Philippine Area of Responsibility. PAGASA Signal Numbers: 1 (30-60 km/h), 2 (60-100 km/h), 3 (100-185 km/h), 4 (≥185 km/h)'
  },
  {
    dashboardType: 'Typhoon',
    primarySource: {
      name: 'PAGASA (Philippine Atmospheric, Geophysical and Astronomical Services Administration)',
      url: 'https://bagong.pagasa.dost.gov.ph/tropical-cyclone/weather-bulletin',
      description: 'Tropical cyclone tracking and forecasts for Philippine Area of Responsibility (PAR)',
      organization: 'DOST (Department of Science and Technology)'
    },
    fallbackSource: {
      name: 'JTWC (Joint Typhoon Warning Center)',
      url: 'https://www.metoc.navy.mil/jtwc/jtwc.html',
      description: 'Western Pacific tropical cyclone data and forecasts',
      organization: 'U.S. Navy'
    },
    guideType: 'Signal Number',
    guideItems: [
      {
        label: 'Signal No. 1',
        range: '30–60 km/h',
        color: 'text-yellow-600',
        description: 'Winds 30-60 km/h - Light to moderate damage expected'
      },
      {
        label: 'Signal No. 2',
        range: '60–100 km/h',
        color: 'text-orange-600',
        description: 'Winds 60-100 km/h - Moderate to severe damage expected'
      },
      {
        label: 'Signal No. 3',
        range: '100–185 km/h',
        color: 'text-red-600',
        description: 'Winds 100-185 km/h - Severe to very severe damage expected'
      },
      {
        label: 'Signal No. 4',
        range: '≥ 185 km/h',
        color: 'text-red-900',
        description: 'Winds ≥185 km/h - Catastrophic damage expected'
      }
    ],
    codeImplementation: {
      language: 'JavaScript',
      fileName: 'TyphoonDashboard.js',
      filePath: 'src/frontend/src/pages/TyphoonDashboard.js',
      code: `// PAGASA Signal Number Implementation
// Signal No. 1: 30–60 km/h
// Signal No. 2: 60–100 km/h
// Signal No. 3: 100–185 km/h
// Signal No. 4: ≥ 185 km/h

const getSignalNumber = (windKph) => {
  if (windKph >= 185) return 4;
  if (windKph >= 100) return 3;
  if (windKph >= 60)  return 2;
  if (windKph >= 30)  return 1;
  return 0;
};

// Signal badge styling
const signalBadgeStyle = (signal) => {
  if (signal >= 3) return 'bg-red-100 text-red-700';
  if (signal >= 2) return 'bg-orange-100 text-orange-700';
  if (signal >= 1) return 'bg-yellow-100 text-yellow-700';
  return 'bg-gray-100 text-gray-600';
};`,
      description: 'PAGASA Signal Number calculation and badge styling based on wind speed'
    },
    updateFrequency: {
      interval: 30,
      unit: 'minutes'
    },
    standards: ['PAGASA Signal Number System', 'Philippine Disaster Risk Reduction Framework'],
    createdBy: 'System',
    notes: 'PAGASA Signal Numbers are issued for areas expected to be affected by tropical cyclones. Signal levels indicate expected damage and recommended actions.'
  }
];

module.exports = typhoonReferences;

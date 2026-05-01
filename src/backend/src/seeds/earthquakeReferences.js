/**
 * ============================================
 * SEED: EARTHQUAKE DASHBOARD DATA REFERENCES
 * ============================================
 * Commit: DB-04
 * Purpose: Seed earthquake dashboard data sources and threat level guide
 * ============================================
 */

const earthquakeReferences = [
  {
    dashboardType: 'Earthquake',
    primarySource: {
      name: 'PHIVOLCS (Philippine Institute of Volcanology and Seismology)',
      url: 'https://earthquake.phivolcs.dost.gov.ph',
      description: 'Real-time earthquake data and monitoring for the Philippines',
      organization: 'DOST (Department of Science and Technology)'
    },
    fallbackSource: {
      name: 'USGS Earthquake Hazards Program',
      url: 'https://earthquake.usgs.gov',
      description: 'Global earthquake data and hazard information',
      organization: 'USGS (United States Geological Survey)'
    },
    guideType: 'Threat Level',
    guideItems: [
      {
        label: 'Critical',
        range: '≥ M7.0',
        color: 'text-red-700',
        description: 'Major earthquake - Severe damage, widespread destruction'
      },
      {
        label: 'High',
        range: 'M6.0–6.9',
        color: 'text-orange-700',
        description: 'Strong earthquake - Considerable damage to buildings'
      },
      {
        label: 'Moderate',
        range: 'M5.0–5.9',
        color: 'text-amber-700',
        description: 'Moderate earthquake - Moderate damage, felt widely'
      },
      {
        label: 'Low',
        range: 'M4.0–4.9',
        color: 'text-gray-600',
        description: 'Light earthquake - Minor damage, widely felt'
      },
      {
        label: 'Minor',
        range: '< M4.0',
        color: 'text-gray-500',
        description: 'Minor earthquake - Generally not felt, minimal impact'
      }
    ],
    codeImplementation: {
      language: 'JavaScript',
      fileName: 'EarthquakeDashboard.js',
      filePath: 'src/frontend/src/pages/EarthquakeDashboard.js',
      code: `const THREAT_CONFIG = {
  Critical: { bg: 'bg-red-50',      border: 'border-l-red-400',    text: 'text-red-700',    badge: 'bg-red-100 text-red-700',        pulse: true  },
  High:     { bg: 'bg-orange-50',   border: 'border-l-orange-400', text: 'text-orange-700', badge: 'bg-orange-100 text-orange-700', pulse: true  },
  Moderate: { bg: 'bg-amber-50',    border: 'border-l-amber-400',  text: 'text-amber-700',  badge: 'bg-amber-100 text-amber-700',   pulse: false },
  Low:      { bg: 'bg-gray-50',     border: 'border-l-gray-300',   text: 'text-gray-600',   badge: 'bg-gray-100 text-gray-600',     pulse: false },
  Minor:    { bg: 'bg-white',       border: 'border-l-gray-200',   text: 'text-gray-500',   badge: 'bg-gray-100 text-gray-500',     pulse: false },
};

const THREAT_GUIDE = [
  { label: 'Critical',  range: '≥ M7.0',   color: 'text-red-700',    inner: 'bg-red-300',    outer: 'bg-red-200'    },
  { label: 'High',      range: 'M6.0–6.9', color: 'text-orange-700', inner: 'bg-orange-300', outer: 'bg-orange-200' },
  { label: 'Moderate',  range: 'M5.0–5.9', color: 'text-amber-700',  inner: 'bg-amber-300',  outer: 'bg-amber-200'  },
  { label: 'Low',       range: 'M4.0–4.9', color: 'text-gray-600',   inner: 'bg-gray-300',   outer: 'bg-gray-200'   },
  { label: 'Minor',     range: '< M4.0',   color: 'text-gray-500',   inner: 'bg-gray-200',   outer: 'bg-gray-100'   },
];

const getMagnitudeBar = (magnitude) => {
  const pct = Math.min((magnitude / 9) * 100, 100);
  let color = 'bg-gray-300';
  if (magnitude >= 7)      color = 'bg-red-400';
  else if (magnitude >= 6) color = 'bg-orange-400';
  else if (magnitude >= 5) color = 'bg-amber-400';
  else if (magnitude >= 4) color = 'bg-gray-400';
  return { pct, color };
};`,
      description: 'Threat level configuration, guide items, and magnitude bar color mapping'
    },
    updateFrequency: {
      interval: 5,
      unit: 'minutes'
    },
    standards: ['Richter Scale', 'PHIVOLCS Classification System', 'USGS Earthquake Magnitude Scale'],
    createdBy: 'System',
    notes: 'Magnitude ranges follow the Richter Scale standard used by PHIVOLCS and USGS. Threat levels are custom classifications based on magnitude.'
  }
];

module.exports = earthquakeReferences;

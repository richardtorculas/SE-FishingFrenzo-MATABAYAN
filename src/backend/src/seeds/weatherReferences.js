/**
 * ============================================
 * SEED: WEATHER DASHBOARD DATA REFERENCES
 * ============================================
 * Commit: DB-03
 * Purpose: Seed weather dashboard data sources and weather code guide
 * ============================================
 */

const weatherReferences = [
  {
    dashboardType: 'Weather',
    primarySource: {
      name: 'Open-Meteo',
      url: 'https://open-meteo.com',
      description: 'Free & open-source weather API providing current weather conditions, temperature, humidity, and precipitation probability',
      organization: 'Open-Meteo'
    },
    fallbackSource: {
      name: 'Open-Meteo Geocoding API',
      url: 'https://geocoding-api.open-meteo.com/v1/search',
      description: 'Geocoding service for location lookup and coordinate resolution',
      organization: 'Open-Meteo'
    },
    guideType: 'Weather Code',
    guideItems: [
      {
        label: 'Clear / Sunny',
        range: '0–1',
        color: 'text-yellow-600',
        description: 'Clear sky or sunny conditions'
      },
      {
        label: 'Partly Cloudy',
        range: '2',
        color: 'text-gray-500',
        description: 'Partly cloudy skies'
      },
      {
        label: 'Overcast',
        range: '3',
        color: 'text-gray-600',
        description: 'Completely overcast'
      },
      {
        label: 'Fog / Mist',
        range: '4–48',
        color: 'text-gray-700',
        description: 'Fog, mist, or reduced visibility'
      },
      {
        label: 'Drizzle',
        range: '49–55',
        color: 'text-blue-400',
        description: 'Light drizzle or light rain'
      },
      {
        label: 'Rain',
        range: '56–65',
        color: 'text-blue-600',
        description: 'Moderate to heavy rain'
      },
      {
        label: 'Thunderstorm',
        range: '66–82',
        color: 'text-purple-700',
        description: 'Thunderstorm with or without precipitation'
      },
      {
        label: 'Heavy Precipitation',
        range: '83+',
        color: 'text-purple-900',
        description: 'Heavy precipitation or severe weather'
      }
    ],
    codeImplementation: {
      language: 'JavaScript',
      fileName: 'WeatherDashboard.js',
      filePath: 'src/frontend/src/pages/WeatherDashboard.js',
      code: `const getWeatherIcon = (code) => {
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
};`,
      description: 'Weather code to icon mapping and rain probability color coding'
    },
    updateFrequency: {
      interval: 0,
      unit: 'minutes'
    },
    standards: ['WMO (World Meteorological Organization)', 'ISO 19115 (Geographic Information)'],
    createdBy: 'System',
    notes: 'Weather codes follow WMO standards. Rain probability uses custom color thresholds.'
  }
];

module.exports = weatherReferences;

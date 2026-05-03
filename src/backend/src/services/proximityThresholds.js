/**
 * ============================================
 * PROXIMITY THRESHOLDS UTILITY
 * ============================================
 * Purpose: Define alert zones and map locations to coordinates
 * ============================================
 */

/**
 * Alert zone definitions
 */
const PROXIMITY_ZONES = {
  LOCAL: {
    name: 'Local',
    maxDistance: 50,
    severity: 'high',
    description: 'Earthquake near your location'
  },
  REGIONAL: {
    name: 'Regional',
    maxDistance: 200,
    severity: 'medium',
    description: 'Earthquake in your region'
  },
  DISTANT: {
    name: 'Distant',
    maxDistance: Infinity,
    severity: 'low',
    description: 'Earthquake far from your location'
  }
};

/**
 * Philippine provinces with approximate center coordinates
 * Used for distance calculation when user location is province-based
 */
const PROVINCE_COORDINATES = {
  'Abra': { lat: 17.5895, lon: 120.9988 },
  'Agusan del Norte': { lat: 8.9769, lon: 125.5050 },
  'Agusan del Sur': { lat: 8.2000, lon: 126.0000 },
  'Aklan': { lat: 11.7500, lon: 122.3000 },
  'Albay': { lat: 13.1939, lon: 123.7437 },
  'Antique': { lat: 10.7086, lon: 122.0742 },
  'Apayao': { lat: 17.3333, lon: 121.5833 },
  'Aurora': { lat: 15.5500, lon: 121.5000 },
  'Basilan': { lat: 6.7500, lon: 122.0000 },
  'Bataan': { lat: 14.6426, lon: 120.5597 },
  'Batangas': { lat: 13.7563, lon: 121.0437 },
  'Benguet': { lat: 16.4109, lon: 120.6537 },
  'Biliran': { lat: 11.5167, lon: 124.5333 },
  'Bohol': { lat: 9.6500, lon: 124.1000 },
  'Bukidnon': { lat: 8.4500, lon: 125.0000 },
  'Bulacan': { lat: 14.7500, lon: 121.0000 },
  'Calamianes': { lat: 11.8500, lon: 120.2500 },
  'Camarines Norte': { lat: 14.2000, lon: 122.5000 },
  'Camarines Sur': { lat: 13.5000, lon: 123.5000 },
  'Camiguin': { lat: 9.2167, lon: 124.7333 },
  'Capiz': { lat: 11.5000, lon: 122.8333 },
  'Catanduanes': { lat: 13.8500, lon: 124.2500 },
  'Cavite': { lat: 14.3520, lon: 120.8981 },
  'Cebu': { lat: 10.3157, lon: 123.8854 },
  'Compostela Valley': { lat: 7.5000, lon: 126.0000 },
  'Cotabato': { lat: 6.9167, lon: 124.2500 },
  'Davao del Norte': { lat: 7.1000, lon: 125.6000 },
  'Davao del Sur': { lat: 6.5000, lon: 125.5000 },
  'Davao Oriental': { lat: 6.7500, lon: 126.5000 },
  'Dinagat Islands': { lat: 10.3333, lon: 125.5000 },
  'Eastern Samar': { lat: 11.5000, lon: 125.5000 },
  'Guimaras': { lat: 10.5000, lon: 122.7500 },
  'Ifugao': { lat: 16.8000, lon: 121.1667 },
  'Ilocos Norte': { lat: 18.2000, lon: 120.5000 },
  'Ilocos Sur': { lat: 17.1000, lon: 120.5000 },
  'Iloilo': { lat: 10.7000, lon: 122.5667 },
  'Isabela': { lat: 16.8000, lon: 121.7500 },
  'Kalinga': { lat: 17.3333, lon: 121.3333 },
  'Laguna': { lat: 14.3000, lon: 121.5000 },
  'Lanao del Norte': { lat: 8.2500, lon: 124.2500 },
  'Lanao del Sur': { lat: 7.5000, lon: 124.5000 },
  'La Union': { lat: 16.6000, lon: 120.3333 },
  'Leyte': { lat: 10.5000, lon: 124.5000 },
  'Maguindanao': { lat: 6.5000, lon: 124.5000 },
  'Marinduque': { lat: 13.4167, lon: 121.8333 },
  'Masbate': { lat: 12.3667, lon: 123.6333 },
  'Metro Manila': { lat: 14.5995, lon: 120.9842 },
  'Misamis Occidental': { lat: 8.6667, lon: 123.7500 },
  'Misamis Oriental': { lat: 8.5000, lon: 124.5000 },
  'Mountain Province': { lat: 16.7000, lon: 121.2500 },
  'Negros Occidental': { lat: 10.3000, lon: 123.2000 },
  'Negros Oriental': { lat: 9.3000, lon: 123.2000 },
  'Northern Samar': { lat: 12.5000, lon: 124.5000 },
  'Nueva Ecija': { lat: 15.3333, lon: 121.0000 },
  'Nueva Vizcaya': { lat: 16.0000, lon: 121.5000 },
  'Palawan': { lat: 9.7435, lon: 118.7494 },
  'Pampanga': { lat: 15.0000, lon: 120.5000 },
  'Pangasinan': { lat: 16.0000, lon: 120.5000 },
  'Quezon': { lat: 14.0000, lon: 121.5000 },
  'Quirino': { lat: 16.3333, lon: 121.8333 },
  'Rizal': { lat: 14.5833, lon: 121.2500 },
  'Romblon': { lat: 12.2667, lon: 122.2667 },
  'Samar': { lat: 11.7500, lon: 124.5000 },
  'Sarangani': { lat: 5.4000, lon: 125.4000 },
  'Siquijor': { lat: 9.2000, lon: 123.7500 },
  'Sorsogon': { lat: 12.9667, lon: 124.0000 },
  'South Cotabato': { lat: 6.1000, lon: 124.8000 },
  'Southern Leyte': { lat: 10.0000, lon: 124.8000 },
  'Sultan Kudarat': { lat: 6.9167, lon: 124.2500 },
  'Sulu': { lat: 6.0000, lon: 121.0000 },
  'Surigao del Norte': { lat: 9.7500, lon: 125.5000 },
  'Surigao del Sur': { lat: 8.3000, lon: 126.0000 },
  'Tarlac': { lat: 15.4667, lon: 120.5833 },
  'Tawi-Tawi': { lat: 5.0000, lon: 119.7500 },
  'Zambales': { lat: 15.5000, lon: 120.0000 },
  'Zamboanga del Norte': { lat: 8.5000, lon: 123.5000 },
  'Zamboanga del Sur': { lat: 7.0000, lon: 123.5000 },
  'Zamboanga Sibugay': { lat: 7.5000, lon: 122.5000 }
};

/**
 * Get proximity zone based on distance
 * @param {number} distance - Distance in kilometers
 * @returns {object} Proximity zone object
 */
const getProximityZone = (distance) => {
  if (distance <= PROXIMITY_ZONES.LOCAL.maxDistance) {
    return PROXIMITY_ZONES.LOCAL;
  } else if (distance <= PROXIMITY_ZONES.REGIONAL.maxDistance) {
    return PROXIMITY_ZONES.REGIONAL;
  } else {
    return PROXIMITY_ZONES.DISTANT;
  }
};

/**
 * Get coordinates for a province
 * @param {string} province - Province name
 * @returns {object} Coordinates {lat, lon} or null if not found
 */
const getProvinceCoordinates = (province) => {
  return PROVINCE_COORDINATES[province] || null;
};

module.exports = {
  PROXIMITY_ZONES,
  PROVINCE_COORDINATES,
  getProximityZone,
  getProvinceCoordinates
};

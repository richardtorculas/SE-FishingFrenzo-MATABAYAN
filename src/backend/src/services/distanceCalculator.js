// Philippine provinces and major cities with GPS coordinates
const PHILIPPINES_LOCATIONS = {
  // Provinces
  'abra': { lat: 17.5947, lng: 120.8854 },
  'agusan del norte': { lat: 8.9769, lng: 125.5050 },
  'agusan del sur': { lat: 8.2000, lng: 126.0000 },
  'aklan': { lat: 11.7061, lng: 122.3063 },
  'albay': { lat: 13.1939, lng: 123.7437 },
  'antique': { lat: 10.7202, lng: 122.0721 },
  'apayao': { lat: 17.3333, lng: 121.5000 },
  'aurora': { lat: 15.5500, lng: 121.5000 },
  'basilan': { lat: 6.7618, lng: 122.0740 },
  'bataan': { lat: 14.6426, lng: 120.4830 },
  'batangas': { lat: 13.7563, lng: 121.0437 },
  'benguet': { lat: 16.4023, lng: 121.0276 },
  'biliran': { lat: 11.5167, lng: 124.5333 },
  'bukidnon': { lat: 8.4606, lng: 125.0000 },
  'bulacan': { lat: 14.7500, lng: 121.0000 },
  'calamianes': { lat: 11.8500, lng: 120.2500 },
  'camarines norte': { lat: 14.2000, lng: 122.5000 },
  'camarines sur': { lat: 13.6500, lng: 123.2000 },
  'camiguin': { lat: 9.2167, lng: 124.7167 },
  'capiz': { lat: 11.4833, lng: 122.9167 },
  'catanduanes': { lat: 13.8833, lng: 124.2500 },
  'cavite': { lat: 14.3573, lng: 120.8935 },
  'cebu': { lat: 10.3157, lng: 123.8854 },
  'compostela valley': { lat: 7.0000, lng: 126.0000 },
  'cotabato': { lat: 6.9167, lng: 124.2500 },
  'davao del norte': { lat: 7.1000, lng: 125.4667 },
  'davao del sur': { lat: 6.8000, lng: 125.3500 },
  'davao oriental': { lat: 6.5667, lng: 126.1333 },
  'dinagat islands': { lat: 9.6667, lng: 125.5000 },
  'eastern samar': { lat: 11.5667, lng: 124.6667 },
  'guimaras': { lat: 10.3667, lng: 122.7667 },
  'ifugao': { lat: 16.8167, lng: 121.1667 },
  'ilocos norte': { lat: 18.2742, lng: 120.5597 },
  'ilocos sur': { lat: 17.1948, lng: 120.5762 },
  'iloilo': { lat: 10.7202, lng: 122.5621 },
  'isabela': { lat: 16.8000, lng: 121.7833 },
  'kalinga': { lat: 17.2500, lng: 121.3667 },
  'laguna': { lat: 14.3037, lng: 121.4312 },
  'lanao del norte': { lat: 8.2500, lng: 124.2500 },
  'lanao del sur': { lat: 7.3333, lng: 124.2667 },
  'leyte': { lat: 10.5833, lng: 124.7500 },
  'maguindanao': { lat: 6.8000, lng: 124.5000 },
  'marinduque': { lat: 13.4167, lng: 121.8333 },
  'masbate': { lat: 12.3667, lng: 123.6333 },
  'metro manila': { lat: 14.5995, lng: 120.9842 },
  'misamis occidental': { lat: 8.6500, lng: 123.7333 },
  'misamis oriental': { lat: 8.9769, lng: 124.6914 },
  'mountain province': { lat: 16.6000, lng: 121.2000 },
  'negros occidental': { lat: 10.4545, lng: 123.2171 },
  'negros oriental': { lat: 9.3000, lng: 123.2333 },
  'northern samar': { lat: 12.0833, lng: 124.6667 },
  'nueva ecija': { lat: 15.3333, lng: 121.0000 },
  'nueva vizcaya': { lat: 16.0000, lng: 121.6667 },
  'palawan': { lat: 9.7435, lng: 118.7494 },
  'pampanga': { lat: 15.0833, lng: 120.6167 },
  'pangasinan': { lat: 15.8833, lng: 120.3667 },
  'quezon': { lat: 14.0833, lng: 121.5000 },
  'quirino': { lat: 16.3333, lng: 121.8333 },
  'rizal': { lat: 14.5794, lng: 121.2965 },
  'romblon': { lat: 12.2667, lng: 122.2667 },
  'samar': { lat: 11.7833, lng: 124.6667 },
  'sarangani': { lat: 5.4000, lng: 125.4667 },
  'siquijor': { lat: 9.2000, lng: 123.7667 },
  'sorsogon': { lat: 12.9667, lng: 124.0000 },
  'south cotabato': { lat: 6.3000, lng: 124.7667 },
  'southern leyte': { lat: 10.0000, lng: 124.8333 },
  'sultan kudarat': { lat: 6.9167, lng: 124.2500 },
  'sulu': { lat: 5.0167, lng: 119.7667 },
  'surigao del norte': { lat: 9.7667, lng: 125.5000 },
  'surigao del sur': { lat: 8.3167, lng: 126.0000 },
  'tarlac': { lat: 15.4833, lng: 120.5833 },
  'tawi-tawi': { lat: 4.2667, lng: 119.1000 },
  'zambales': { lat: 15.5000, lng: 120.2667 },
  'zamboanga del norte': { lat: 8.6500, lng: 123.7333 },
  'zamboanga del sur': { lat: 6.9000, lng: 123.4000 },
  'zamboanga sibugay': { lat: 7.5000, lng: 122.7500 },
};

// Haversine formula to calculate distance between two coordinates
const calculateHaversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Get alert radius based on magnitude
const getAlertRadius = (magnitude) => {
  return 100; // Fixed 100km radius for all earthquakes
};

// Get user coordinates from province/city
const getUserCoordinates = (province) => {
  if (!province) return null;
  const normalized = province.toLowerCase().trim();
  return PHILIPPINES_LOCATIONS[normalized] || null;
};

// Check if user is within alert radius
const isUserWithinAlertRadius = (userProvince, epicenterLat, epicenterLng, magnitude) => {
  if (!userProvince) return false;
  const userCoords = getUserCoordinates(userProvince);
  if (!userCoords) return false;

  const distance = calculateHaversineDistance(
    userCoords.lat,
    userCoords.lng,
    epicenterLat,
    epicenterLng
  );

  const radius = getAlertRadius(magnitude);
  return distance <= radius;
};

module.exports = {
  calculateHaversineDistance,
  getAlertRadius,
  getUserCoordinates,
  isUserWithinAlertRadius,
};

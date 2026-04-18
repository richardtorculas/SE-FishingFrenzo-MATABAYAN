/**
 * ============================================
 * WEATHER CONTROLLER
 * ============================================
 * Purpose: Fetch real-time weather data from Open-Meteo API
 * Routes: /api/weather
 * API: https://open-meteo.com (no API key required)
 * ============================================
 */

const axios = require('axios');

const WMO_CODES = {
  0: 'Clear Sky', 1: 'Mainly Clear', 2: 'Partly Cloudy', 3: 'Overcast',
  45: 'Foggy', 48: 'Icy Fog',
  51: 'Light Drizzle', 53: 'Moderate Drizzle', 55: 'Dense Drizzle',
  61: 'Slight Rain', 63: 'Moderate Rain', 65: 'Heavy Rain',
  80: 'Slight Showers', 81: 'Moderate Showers', 82: 'Violent Showers',
  95: 'Thunderstorm', 96: 'Thunderstorm w/ Hail', 99: 'Thunderstorm w/ Heavy Hail'
};

const getWeather = async (req, res) => {
  const { latitude, longitude, location } = req.query;

  if (!latitude || !longitude) {
    return res.status(400).json({ status: 'error', message: 'latitude and longitude are required' });
  }

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,precipitation_probability,weather_code&timezone=Asia%2FManila`;
    const { data } = await axios.get(url);
    const current = data.current;

    res.json({
      status: 'success',
      data: {
        location: location || `${latitude}, ${longitude}`,
        temperature: current.temperature_2m,
        humidity: current.relative_humidity_2m,
        chanceOfRain: current.precipitation_probability,
        condition: WMO_CODES[current.weather_code] || 'Unknown',
        weatherCode: current.weather_code,
        unit: data.current_units.temperature_2m,
        fetchedAt: current.time
      }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

module.exports = { getWeather };

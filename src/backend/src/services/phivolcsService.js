/**
 * ============================================
 * PHIVOLCS EARTHQUAKE SERVICE
 * ============================================
 * Primary:  Web scrape https://earthquake.phivolcs.dost.gov.ph/
 * Fallback: USGS API filtered to Philippine bounding box
 * ============================================
 */

const axios = require('axios');
const cheerio = require('cheerio');

const PHIVOLCS_URL = 'https://earthquake.phivolcs.dost.gov.ph/';
const USGS_API = 'https://earthquake.usgs.gov/fdsnws/event/1/query';

const PH_BOUNDS = { minLat: 4.0, maxLat: 21.5, minLon: 116.0, maxLon: 127.0 };

// ── Threat level ─────────────────────────────────────────────────────────────
const calculateThreatLevel = (magnitude, depth) => {
  const isShallow = depth < 70;
  if (magnitude >= 7.0) return { level: 'Critical', severity: 5, description: 'Major earthquake — Severe damage expected. Tsunami warning may be issued.' };
  if (magnitude >= 6.0) return { level: 'High',     severity: 4, description: isShallow ? 'Strong shallow earthquake — Significant damage possible.' : 'Strong earthquake — Moderate damage possible.' };
  if (magnitude >= 5.0) return { level: 'Moderate', severity: 3, description: 'Moderate earthquake — Minor damage possible. Stay alert.' };
  if (magnitude >= 4.0) return { level: 'Low',      severity: 2, description: 'Light earthquake — Generally felt. Minimal damage expected.' };
  return                        { level: 'Minor',    severity: 1, description: 'Minor earthquake — Rarely felt. No damage expected.' };
};

// Extract province from PHIVOLCS location string
// e.g. "033 km N 67° E of Baggao (Cagayan)" → "Cagayan"
const extractProvince = (locationStr) => {
  const match = locationStr.match(/\(([^)]+)\)$/);
  return match ? match[1].trim() : 'Philippines';
};

// ── PRIMARY: Scrape PHIVOLCS ─────────────────────────────────────────────────
const scrapePhivolcs = async (limit = 50) => {
  const https = require('https');
  const response = await axios.get(PHIVOLCS_URL, {
    timeout: 15000,
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; MataBayan/1.0)' },
    httpsAgent: new https.Agent({ rejectUnauthorized: false }) // PHIVOLCS has SSL cert issues
  });

  const $ = cheerio.load(response.data);
  const earthquakes = [];

  $('td.auto-style91').each((i, el) => {
    if (i >= limit) return false; // stop after limit
    try {
      const tr = $(el).parent();
      const tds = tr.find('td');

      const dateTimeStr = $(el).text().trim();                    // "20 March 2026 - 05:24 PM"
      const lat         = parseFloat(tds.eq(1).text().trim());
      const lon         = parseFloat(tds.eq(2).text().trim());
      const depth       = parseInt(tds.eq(3).text().trim(), 10);
      const magnitude   = parseFloat(tds.eq(4).text().trim());
      const location    = tds.eq(5).text().replace(/\s+/g, ' ').trim();

      if (!dateTimeStr || isNaN(magnitude) || isNaN(depth) || !location) return;

      // Parse "20 March 2026 - 05:24 PM" → Date (PST = UTC+8)
      const cleanDate = dateTimeStr.replace(' - ', ' ');
      const timestamp = new Date(cleanDate + ' GMT+0800');

      const threat   = calculateThreatLevel(magnitude, depth);
      const province = extractProvince(location);

      earthquakes.push({
        severity: threat.level,
        location,
        province,
        description: `Magnitude ${magnitude.toFixed(1)} earthquake at depth of ${depth}km. ${threat.description}`,
        source: 'PHIVOLCS',
        timestamp,
        metadata: {
          magnitude,
          depth,
          latitude: lat,
          longitude: lon,
          threatLevel: threat.level,
          threatSeverity: threat.severity,
          phivolcsId: `phivolcs-${timestamp.getTime()}-${lat}-${lon}`
        }
      });
    } catch (_) {
      // Skip malformed rows silently
    }
  });

  return earthquakes;
};

// ── FALLBACK: USGS API ───────────────────────────────────────────────────────
const fetchFromUSGS = async (limit = 50) => {
  const response = await axios.get(USGS_API, {
    params: {
      format: 'geojson',
      minlatitude: PH_BOUNDS.minLat,
      maxlatitude: PH_BOUNDS.maxLat,
      minlongitude: PH_BOUNDS.minLon,
      maxlongitude: PH_BOUNDS.maxLon,
      minmagnitude: 1.0,
      limit,
      orderby: 'time'
    },
    timeout: 10000
  });

  return (response.data.features || []).map(feature => {
    const props = feature.properties;
    const [lon, lat, depth] = feature.geometry.coordinates;
    const magnitude = props.mag;
    const threat = calculateThreatLevel(magnitude, depth);

    return {
      severity: threat.level,
      location: props.place || 'Philippines',
      province: 'Philippines',
      description: `Magnitude ${magnitude?.toFixed(1)} earthquake at depth of ${depth?.toFixed(1)}km. ${threat.description}`,
      source: 'PHIVOLCS',
      timestamp: new Date(props.time),
      metadata: {
        magnitude: parseFloat(magnitude?.toFixed(2)),
        depth: parseFloat(depth?.toFixed(1)),
        latitude: parseFloat(lat?.toFixed(4)),
        longitude: parseFloat(lon?.toFixed(4)),
        threatLevel: threat.level,
        threatSeverity: threat.severity,
        tsunami: props.tsunami === 1,
        felt: props.felt || 0,
        usgsId: feature.id,
        usgsUrl: props.url,
        phivolcsId: `usgs-${feature.id}`
      }
    };
  });
};

// ── MAIN EXPORT: Primary + Fallback ─────────────────────────────────────────
const fetchEarthquakeData = async (limit = 50) => {
  try {
    console.log('🌐 Fetching from PHIVOLCS...');
    const data = await scrapePhivolcs(limit);
    if (data.length > 0) {
      console.log(`✅ PHIVOLCS: ${data.length} earthquakes fetched`);
      return data;
    }
    throw new Error('PHIVOLCS returned 0 records');
  } catch (err) {
    console.warn(`⚠️  PHIVOLCS unavailable (${err.message}), using backup source...`);
    const data = await fetchFromUSGS(limit);
    console.log(`✅ Backup source: ${data.length} earthquakes fetched`);
    return data;
  }
};

module.exports = { fetchEarthquakeData, calculateThreatLevel };

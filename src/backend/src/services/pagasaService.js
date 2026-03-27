/**
 * ============================================
 * PAGASA TYPHOON SERVICE
 * ============================================
 * Primary:  Web scrape https://bagong.pagasa.dost.gov.ph/tropical-cyclone/weather-bulletin
 * Fallback: JTWC (Joint Typhoon Warning Center) active storm text files
 * ============================================
 */

const axios = require('axios');
const cheerio = require('cheerio');
const https = require('https');

const PAGASA_URL  = 'https://bagong.pagasa.dost.gov.ph/tropical-cyclone/weather-bulletin';
const JTWC_URL    = 'https://www.metoc.navy.mil/jtwc/products/abpwweb.txt';

const AGENT   = new https.Agent({ rejectUnauthorized: false });
const HEADERS = { 'User-Agent': 'Mozilla/5.0 (compatible; MataBayan/1.0)' };

// ── Category classification ───────────────────────────────────────────────────
const classifyCategory = (windKph) => {
  if (windKph >= 185) return { category: 'Super Typhoon',          severity: 'Critical', signal: 5, severity_num: 5 };
  if (windKph >= 150) return { category: 'Typhoon',                severity: 'Critical', signal: 4, severity_num: 5 };
  if (windKph >= 118) return { category: 'Typhoon',                severity: 'High',     signal: 3, severity_num: 4 };
  if (windKph >= 89)  return { category: 'Severe Tropical Storm',  severity: 'High',     signal: 2, severity_num: 4 };
  if (windKph >= 62)  return { category: 'Tropical Storm',         severity: 'Moderate', signal: 1, severity_num: 3 };
  if (windKph >= 45)  return { category: 'Tropical Depression',    severity: 'Low',      signal: 1, severity_num: 2 };
  return                     { category: 'Low Pressure Area',      severity: 'Low',      signal: 0, severity_num: 1 };
};

// ── Data validation ───────────────────────────────────────────────────────────
const validateCyclone = (data) => {
  const errors = [];

  if (!data.name || typeof data.name !== 'string')
    errors.push('name is required');

  if (!['Super Typhoon', 'Typhoon', 'Severe Tropical Storm', 'Tropical Storm', 'Tropical Depression', 'Low Pressure Area'].includes(data.category))
    errors.push(`invalid category: ${data.category}`);

  if (!['Critical', 'High', 'Moderate', 'Low'].includes(data.severity))
    errors.push(`invalid severity: ${data.severity}`);

  if (typeof data.windKph !== 'number' || data.windKph < 0)
    errors.push('windKph must be a non-negative number');

  if (data.latitude !== null && (data.latitude < -90 || data.latitude > 90))
    errors.push(`invalid latitude: ${data.latitude}`);

  if (data.longitude !== null && (data.longitude < -180 || data.longitude > 180))
    errors.push(`invalid longitude: ${data.longitude}`);

  return errors;
};

// ── Data cleaning ─────────────────────────────────────────────────────────────
const cleanCycloneData = (raw) => ({
  ...raw,
  name:              raw.name.trim().toUpperCase().replace(/[^A-Z\s]/g, ''),
  location:          raw.location.trim().replace(/\s+/g, ' '),
  movementDirection: raw.movementDirection?.trim().toUpperCase() || 'UNKNOWN',
  windKph:           Math.round(raw.windKph),
  latitude:          raw.latitude  !== null ? parseFloat(raw.latitude.toFixed(2))  : null,
  longitude:         raw.longitude !== null ? parseFloat(raw.longitude.toFixed(2)) : null,
});

// ── Duplicate detection key ───────────────────────────────────────────────────
// Same storm name + same position (rounded to 1 decimal) + same hour = duplicate
const buildStormKey = (name, lat, lon, timestamp) => {
  const hour = new Date(timestamp);
  hour.setMinutes(0, 0, 0); // truncate to hour
  const latR = lat  !== null ? parseFloat(lat.toFixed(1))  : 'X';
  const lonR = lon  !== null ? parseFloat(lon.toFixed(1)) : 'X';
  return `${name.toUpperCase()}-${latR}-${lonR}-${hour.getTime()}`;
};

// ── Parse bulletin text ───────────────────────────────────────────────────────
const parseBulletinText = (text) => {
  const nameMatch = text.match(
    /(?:SUPER\s+)?(?:TYPHOON|TROPICAL\s+STORM|TROPICAL\s+DEPRESSION|SEVERE\s+TROPICAL\s+STORM|LOW\s+PRESSURE\s+AREA)\s+["""]?([A-Z]+)["""]?/i
  );
  const coordMatch    = text.match(/([\d.]+)\s*°?\s*N[,\s]+([\d.]+)\s*°?\s*E/i);
  const windMatch     = text.match(/(\d{2,3})\s*(?:km\/h|kph|kmh)/i);
  const movementMatch = text.match(/moving\s+(?:toward\s+the\s+)?([A-Z\s]+?)\s+at\s+(\d+)\s*(?:km\/h|kph)/i);
  const areaMatch     = text.match(/(?:affecting|over|near|within)\s+([A-Za-z\s,]+?)(?:\.|,|\s{2})/i);

  if (!nameMatch && !coordMatch) return null;

  const name     = nameMatch ? nameMatch[1].trim() : 'UNNAMED';
  const lat      = coordMatch ? parseFloat(coordMatch[1]) : null;
  const lon      = coordMatch ? parseFloat(coordMatch[2]) : null;
  const windKph  = windMatch  ? parseInt(windMatch[1], 10) : 0;
  const { category, severity, signal } = classifyCategory(windKph);
  const movementDir   = movementMatch ? movementMatch[1].trim() : 'Unknown';
  const movementSpeed = movementMatch ? parseInt(movementMatch[2], 10) : null;
  const affectedArea  = areaMatch ? areaMatch[1].trim() : (lat && lon ? `${lat}°N ${lon}°E` : 'Philippine Area of Responsibility');
  const now = new Date();

  const raw = {
    name,
    category,
    severity,
    signal,
    location:          affectedArea,
    province:          'Philippines',
    latitude:          lat,
    longitude:         lon,
    windKph,
    movementDirection: movementDir,
    movementSpeedKph:  movementSpeed,
    trajectory:        lat && lon ? [{ latitude: lat, longitude: lon, timestamp: now, windKph }] : [],
    description:       `${category} ${name} — Max winds ${windKph} km/h, moving ${movementDir}${movementSpeed ? ` at ${movementSpeed} km/h` : ''}. PAGASA Signal No. ${signal}.`,
    source:            'PAGASA',
    affectedArea,
    timestamp:         now,
    stormKey:          buildStormKey(name, lat, lon, now)
  };

  const cleaned = cleanCycloneData(raw);
  const errors  = validateCyclone(cleaned);
  if (errors.length > 0) {
    console.warn(`⚠️  Cyclone validation failed [${name}]:`, errors.join(', '));
    return null;
  }

  return cleaned;
};

// ── PRIMARY: Scrape PAGASA ────────────────────────────────────────────────────
const scrapePagasa = async () => {
  const response = await axios.get(PAGASA_URL, {
    timeout: 15000,
    headers: HEADERS,
    httpsAgent: AGENT
  });

  const $ = cheerio.load(response.data);
  const cyclones = [];

  const bulletinBlocks = $('div.weather-bulletin-item, article.bulletin, div.cyclone-item, .typhoon-item, .storm-item');

  if (bulletinBlocks.length > 0) {
    bulletinBlocks.each((i, el) => {
      const rawText = $(el).text().replace(/\s+/g, ' ').trim();
      const cyclone = parseBulletinText(rawText);
      if (cyclone) cyclones.push(cyclone);
    });
  } else {
    // Try parsing full page text
    const pageText = $('body').text().replace(/\s+/g, ' ');
    const parsed = parseBulletinText(pageText);
    if (parsed) cyclones.push(parsed);
  }

  return cyclones;
};

// ── FALLBACK: JTWC ───────────────────────────────────────────────────────────
const fetchFromJTWC = async () => {
  const response = await axios.get(JTWC_URL, {
    timeout: 10000,
    headers: HEADERS,
    httpsAgent: AGENT
  });

  const cyclones = [];
  const stormLines = response.data.match(/\d{2}W\s+.+/g) || [];

  for (const line of stormLines) {
    try {
      const parts    = line.trim().split(/\s+/);
      const stormId  = parts[0];

      const nameIdx = parts.findIndex(p =>
        /^[A-Z]{4,}$/.test(p) &&
        !['TROPICAL','STORM','TYPHOON','DEPRESSION','SUPER','SEVERE','PRESSURE','AREA','LOW'].includes(p)
      );
      const name = nameIdx !== -1 ? parts[nameIdx] : 'UNNAMED';

      const latRaw = parts.find(p => /^\d{3,4}N$/.test(p));
      const lonRaw = parts.find(p => /^\d{4,5}E$/.test(p));
      const lat    = latRaw ? parseInt(latRaw) / 10 : null;
      const lon    = lonRaw ? parseInt(lonRaw) / 10 : null;

      // Only include storms in Philippine Area of Responsibility
      if (!lat || !lon || lat < 4 || lat > 21 || lon < 115 || lon > 135) continue;

      const ktRaw   = parts.find(p => /^\d{2,3}KT$/.test(p));
      const windKph = ktRaw ? Math.round(parseInt(ktRaw) * 1.852) : 0;
      const { category, severity, signal } = classifyCategory(windKph);
      const now = new Date();

      const raw = {
        name,
        category,
        severity,
        signal,
        location:          `${lat}°N ${lon}°E`,
        province:          'Philippines',
        latitude:          lat,
        longitude:         lon,
        windKph,
        movementDirection: 'Unknown',
        movementSpeedKph:  null,
        trajectory:        [{ latitude: lat, longitude: lon, timestamp: now, windKph }],
        description:       `${category} ${name} — Max winds ${windKph} km/h. JTWC Storm ID: ${stormId}.`,
        source:            'JTWC',
        affectedArea:      `${lat}°N ${lon}°E`,
        timestamp:         now,
        stormKey:          buildStormKey(name, lat, lon, now)
      };

      const cleaned = cleanCycloneData(raw);
      const errors  = validateCyclone(cleaned);
      if (errors.length === 0) cyclones.push(cleaned);
    } catch (_) {}
  }

  return cyclones;
};

// ── MAIN EXPORT ───────────────────────────────────────────────────────────────
const fetchTyphoonData = async () => {
  try {
    console.log('🌀 Fetching from PAGASA...');
    const data = await scrapePagasa();
    if (data.length > 0) {
      console.log(`✅ PAGASA: ${data.length} cyclone(s) fetched`);
      return data;
    }
    throw new Error('PAGASA returned 0 active cyclones');
  } catch (err) {
    console.warn(`⚠️  PAGASA unavailable (${err.message}), trying JTWC...`);
    try {
      const data = await fetchFromJTWC();
      console.log(`✅ JTWC fallback: ${data.length} cyclone(s) in PAR`);
      return data;
    } catch (jtwcErr) {
      console.warn(`⚠️  JTWC also unavailable (${jtwcErr.message})`);
      return [];
    }
  }
};

module.exports = { fetchTyphoonData, classifyCategory, validateCyclone, buildStormKey };

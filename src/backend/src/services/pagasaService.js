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

const PAGASA_URL = 'https://bagong.pagasa.dost.gov.ph/tropical-cyclone/weather-bulletin';
const JTWC_ACTIVE_URL = 'https://www.metoc.navy.mil/jtwc/products/abpwweb.txt'; // Western Pacific active storms

const AGENT = new https.Agent({ rejectUnauthorized: false });
const HEADERS = { 'User-Agent': 'Mozilla/5.0 (compatible; MataBayan/1.0)' };

// ── Category classification ───────────────────────────────────────────────────
const classifyCategory = (windKph) => {
  if (windKph >= 185) return { category: 'Super Typhoon',    severity: 'Critical', signal: 5, severity_num: 5 };
  if (windKph >= 150) return { category: 'Typhoon',          severity: 'Critical', signal: 4, severity_num: 5 };
  if (windKph >= 118) return { category: 'Typhoon',          severity: 'High',     signal: 3, severity_num: 4 };
  if (windKph >= 89)  return { category: 'Severe Tropical Storm', severity: 'High', signal: 2, severity_num: 4 };
  if (windKph >= 62)  return { category: 'Tropical Storm',   severity: 'Moderate', signal: 1, severity_num: 3 };
  if (windKph >= 45)  return { category: 'Tropical Depression', severity: 'Low',   signal: 1, severity_num: 2 };
  return                     { category: 'Low Pressure Area', severity: 'Low',     signal: 0, severity_num: 1 };
};

// ── PRIMARY: Scrape PAGASA bulletin page ─────────────────────────────────────
const scrapePagasa = async () => {
  const response = await axios.get(PAGASA_URL, {
    timeout: 15000,
    headers: HEADERS,
    httpsAgent: AGENT
  });

  const $ = cheerio.load(response.data);
  const cyclones = [];

  // PAGASA bulletin page lists active cyclones — each bulletin block contains storm details
  // Selectors based on bagong.pagasa.dost.gov.ph structure
  const bulletinBlocks = $('div.weather-bulletin-item, article.bulletin, div.cyclone-item, .typhoon-item, .storm-item');

  if (bulletinBlocks.length > 0) {
    bulletinBlocks.each((i, el) => {
      try {
        const block = $(el);
        const rawText = block.text().replace(/\s+/g, ' ').trim();

        const cyclone = parseBulletinText(rawText, $, block);
        if (cyclone) cyclones.push(cyclone);
      } catch (_) {
        // Skip malformed blocks silently
      }
    });
  } else {
    // Fallback: parse the full page text for bulletin content
    const pageText = $('body').text().replace(/\s+/g, ' ');
    const parsed = parseBulletinText(pageText, $, null);
    if (parsed) cyclones.push(parsed);
  }

  return cyclones;
};

// ── Parse bulletin text for storm data ───────────────────────────────────────
const parseBulletinText = (text, $, block) => {
  // Storm name: "TYPHOON CARINA", "TROPICAL STORM BUTCHOY", etc.
  const nameMatch = text.match(
    /(?:SUPER\s+)?(?:TYPHOON|TROPICAL\s+STORM|TROPICAL\s+DEPRESSION|SEVERE\s+TROPICAL\s+STORM|LOW\s+PRESSURE\s+AREA)\s+["""]?([A-Z]+)["""]?/i
  );

  // Coordinates: "15.2°N 124.5°E" or "15.2N 124.5E"
  const coordMatch = text.match(/([\d.]+)\s*°?\s*N[,\s]+([\d.]+)\s*°?\s*E/i);

  // Wind speed: "maximum sustained winds of 120 km/h" or "120 kph"
  const windMatch = text.match(/(\d{2,3})\s*(?:km\/h|kph|kmh)/i);

  // Movement: "moving NW at 20 km/h" or "moving toward the northwest"
  const movementMatch = text.match(/moving\s+(?:toward\s+the\s+)?([A-Z\s]+?)\s+at\s+(\d+)\s*(?:km\/h|kph)/i);

  // Landfall / affected areas
  const areaMatch = text.match(/(?:affecting|over|near|within)\s+([A-Za-z\s,]+?)(?:\.|,|\s{2})/i);

  if (!nameMatch && !coordMatch) return null; // Not enough data to build a record

  const name = nameMatch ? nameMatch[1].trim() : 'UNNAMED';
  const lat = coordMatch ? parseFloat(coordMatch[1]) : null;
  const lon = coordMatch ? parseFloat(coordMatch[2]) : null;
  const windKph = windMatch ? parseInt(windMatch[1], 10) : 0;
  const { category, severity, signal, severity_num } = classifyCategory(windKph);

  const movementDir = movementMatch ? movementMatch[1].trim() : 'Unknown';
  const movementSpeed = movementMatch ? parseInt(movementMatch[2], 10) : null;
  const affectedArea = areaMatch ? areaMatch[1].trim() : (lat && lon ? `${lat}°N ${lon}°E` : 'Philippine Area of Responsibility');

  return {
    severity,
    location: affectedArea,
    province: 'Philippines',
    description: `${category} ${name} — Max winds ${windKph} km/h, moving ${movementDir}${movementSpeed ? ` at ${movementSpeed} km/h` : ''}. PAGASA Signal No. ${signal}.`,
    source: 'PAGASA',
    timestamp: new Date(),
    metadata: {
      name,
      category,
      signal,
      severity_num,
      windKph,
      latitude: lat,
      longitude: lon,
      movementDirection: movementDir,
      movementSpeedKph: movementSpeed,
      affectedArea,
      pagasaId: `pagasa-${name}-${Date.now()}`
    }
  };
};

// ── FALLBACK: JTWC Western Pacific active storms ──────────────────────────────
const fetchFromJTWC = async () => {
  const response = await axios.get(JTWC_ACTIVE_URL, {
    timeout: 10000,
    headers: HEADERS,
    httpsAgent: AGENT
  });

  const text = response.data;
  const cyclones = [];

  // JTWC ABPW format: lines like "01W TROPICAL STORM CARINA 152N 1245E 065KT"
  const stormLines = text.match(/\d{2}W\s+.+/g) || [];

  for (const line of stormLines) {
    try {
      // Parse: "01W TROPICAL STORM CARINA 152N 1245E 065KT 20KT NW"
      const parts = line.trim().split(/\s+/);
      const stormId = parts[0]; // e.g. "01W"

      // Find name (all-caps word after category words)
      const nameIdx = parts.findIndex(p => /^[A-Z]{4,}$/.test(p) && !['TROPICAL', 'STORM', 'TYPHOON', 'DEPRESSION', 'SUPER', 'SEVERE', 'PRESSURE', 'AREA', 'LOW'].includes(p));
      const name = nameIdx !== -1 ? parts[nameIdx] : 'UNNAMED';

      // Coordinates: "152N" → 15.2°N, "1245E" → 124.5°E
      const latRaw = parts.find(p => /^\d{3,4}N$/.test(p));
      const lonRaw = parts.find(p => /^\d{4,5}E$/.test(p));
      const lat = latRaw ? parseInt(latRaw) / 10 : null;
      const lon = lonRaw ? parseInt(lonRaw) / 10 : null;

      // Wind in knots → convert to kph (1 kt = 1.852 kph)
      const ktRaw = parts.find(p => /^\d{2,3}KT$/.test(p));
      const windKph = ktRaw ? Math.round(parseInt(ktRaw) * 1.852) : 0;

      // Only include storms in Philippine Area of Responsibility
      if (lat && lon && lat >= 4 && lat <= 21 && lon >= 115 && lon <= 135) {
        const { category, severity, signal, severity_num } = classifyCategory(windKph);

        cyclones.push({
          severity,
          location: `${lat}°N ${lon}°E`,
          province: 'Philippines',
          description: `${category} ${name} — Max winds ${windKph} km/h. JTWC Storm ID: ${stormId}.`,
          source: 'PAGASA',
          timestamp: new Date(),
          metadata: {
            name,
            category,
            signal,
            severity_num,
            windKph,
            latitude: lat,
            longitude: lon,
            movementDirection: 'Unknown',
            movementSpeedKph: null,
            affectedArea: `${lat}°N ${lon}°E`,
            jtwcId: stormId,
            pagasaId: `jtwc-${stormId}-${Date.now()}`
          }
        });
      }
    } catch (_) {
      // Skip malformed lines silently
    }
  }

  return cyclones;
};

// ── MAIN EXPORT: Primary + Fallback ─────────────────────────────────────────
const fetchTyphoonData = async () => {
  try {
    console.log('🌀 Fetching from PAGASA...');
    const data = await scrapePagasa();
    if (data.length > 0) {
      console.log(`✅ PAGASA: ${data.length} cyclone(s) fetched`);
      return data;
    }
    throw new Error('PAGASA returned 0 records — no active cyclones or page structure changed');
  } catch (err) {
    console.warn(`⚠️  PAGASA unavailable (${err.message}), trying JTWC...`);
    try {
      const data = await fetchFromJTWC();
      console.log(`✅ JTWC fallback: ${data.length} cyclone(s) in PAR`);
      return data;
    } catch (jtwcErr) {
      console.warn(`⚠️  JTWC also unavailable (${jtwcErr.message})`);
      return []; // No active cyclones or both sources down — return empty, don't crash
    }
  }
};

module.exports = { fetchTyphoonData, classifyCategory };

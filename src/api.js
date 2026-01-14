// RF Scout API Utilities
// FCC data integration and frequency lookups

const FCC_API_BASE = 'https://geo.fcc.gov/api/contours';

/**
 * Fetch TV stations near a location using FCC API
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @param {number} radius - Search radius in km (default 100)
 * @returns {Promise<Array>} Array of TV station objects
 */
export async function fetchTVStations(lat, lon, radius = 100) {
  try {
    // FCC Coverage API endpoint
    const url = `${FCC_API_BASE}/coverage.json?lat=${lat}&lon=${lon}&serviceType=tv`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`FCC API error: ${response.status}`);
    }

    const data = await response.json();

    // Parse TV stations from response
    return parseTVStationData(data);
  } catch (error) {
    console.error('Error fetching TV stations:', error);
    // Return fallback data on error
    return getFallbackTVChannels(lat, lon);
  }
}

/**
 * Parse FCC API response into usable TV channel data
 */
function parseTVStationData(data) {
  if (!data || !data.features) return [];

  return data.features.map(feature => ({
    callsign: feature.properties?.callsign,
    channel: feature.properties?.channel,
    frequency: {
      min: channelToFrequency(feature.properties?.channel, 'min'),
      max: channelToFrequency(feature.properties?.channel, 'max'),
    },
    serviceType: feature.properties?.serviceType,
    city: feature.properties?.city,
    state: feature.properties?.state,
  })).filter(station => station.channel >= 14 && station.channel <= 36);
}

/**
 * Convert TV channel number to frequency range
 */
function channelToFrequency(channel, type) {
  if (channel < 14 || channel > 36) return null;
  const baseFreq = 470 + (channel - 14) * 6;
  return type === 'min' ? baseFreq : baseFreq + 6;
}

/**
 * Fallback TV channels based on major market proximity
 */
function getFallbackTVChannels(lat, lon) {
  // Major market TV channel allocations (common active channels)
  const markets = [
    {
      name: 'New York',
      lat: 40.7128,
      lon: -74.0060,
      channels: [14, 17, 20, 21, 24, 25, 28, 31, 33, 35]
    },
    {
      name: 'Los Angeles',
      lat: 34.0522,
      lon: -118.2437,
      channels: [14, 18, 22, 24, 28, 30, 34, 36]
    },
    {
      name: 'Chicago',
      lat: 41.8781,
      lon: -87.6298,
      channels: [14, 19, 20, 26, 29, 32, 35]
    },
    {
      name: 'Nashville',
      lat: 36.1627,
      lon: -86.7816,
      channels: [14, 17, 25, 28, 30, 32]
    },
    {
      name: 'Atlanta',
      lat: 33.7490,
      lon: -84.3880,
      channels: [14, 20, 25, 29, 32, 34]
    },
    {
      name: 'Dallas',
      lat: 32.7767,
      lon: -96.7970,
      channels: [14, 19, 21, 27, 29, 33]
    },
    {
      name: 'Denver',
      lat: 39.7392,
      lon: -104.9903,
      channels: [14, 17, 20, 24, 31, 35]
    },
    {
      name: 'San Francisco',
      lat: 37.7749,
      lon: -122.4194,
      channels: [14, 19, 24, 27, 32, 36]
    },
    {
      name: 'Boston',
      lat: 42.3601,
      lon: -71.0589,
      channels: [14, 20, 25, 30, 34]
    },
    {
      name: 'Phoenix',
      lat: 33.4484,
      lon: -112.0740,
      channels: [14, 17, 21, 26, 33]
    },
    {
      name: 'Austin',
      lat: 30.2672,
      lon: -97.7431,
      channels: [14, 18, 24, 28, 33]
    },
    {
      name: 'Seattle',
      lat: 47.6062,
      lon: -122.3321,
      channels: [14, 20, 22, 27, 31]
    },
  ];

  // Find nearest market
  let nearestMarket = markets[0];
  let minDistance = Infinity;

  markets.forEach(market => {
    const distance = haversineDistance(lat, lon, market.lat, market.lon);
    if (distance < minDistance) {
      minDistance = distance;
      nearestMarket = market;
    }
  });

  // Return channels as station objects
  return nearestMarket.channels.map(ch => ({
    channel: ch,
    frequency: {
      min: 470 + (ch - 14) * 6,
      max: 470 + (ch - 14) * 6 + 6,
    },
    city: nearestMarket.name,
    state: '',
    fallback: true
  }));
}

/**
 * Calculate distance between two points using Haversine formula
 */
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg) {
  return deg * Math.PI / 180;
}

/**
 * Geocode a ZIP code to lat/lon coordinates
 * Uses a free geocoding approach
 */
export async function geocodeZip(zipCode) {
  try {
    // Try Nominatim (OpenStreetMap) geocoding
    const url = `https://nominatim.openstreetmap.org/search?postalcode=${zipCode}&country=US&format=json&limit=1`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'RF Scout App'
      }
    });

    if (!response.ok) {
      throw new Error(`Geocoding error: ${response.status}`);
    }

    const data = await response.json();

    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lon: parseFloat(data[0].lon),
        displayName: data[0].display_name
      };
    }

    // Fallback to ZIP code center estimates
    return getZipCodeFallback(zipCode);
  } catch (error) {
    console.error('Geocoding error:', error);
    return getZipCodeFallback(zipCode);
  }
}

/**
 * Fallback ZIP code to approximate coordinates
 * Based on first digit regional mapping
 */
function getZipCodeFallback(zipCode) {
  const firstDigit = zipCode.charAt(0);

  // Approximate center of each ZIP region
  const regions = {
    '0': { lat: 42.0, lon: -72.0 },  // New England
    '1': { lat: 40.8, lon: -74.0 },  // NY/NJ/PA
    '2': { lat: 38.9, lon: -77.0 },  // DC/MD/VA/WV
    '3': { lat: 33.5, lon: -84.0 },  // Southeast
    '4': { lat: 39.0, lon: -84.5 },  // Great Lakes
    '5': { lat: 44.0, lon: -93.0 },  // Northern Plains
    '6': { lat: 32.0, lon: -97.0 },  // Central South
    '7': { lat: 30.0, lon: -95.0 },  // Texas/Louisiana
    '8': { lat: 39.0, lon: -105.0 }, // Mountain
    '9': { lat: 37.0, lon: -120.0 }, // Pacific
  };

  return regions[firstDigit] || { lat: 39.8, lon: -98.6 }; // Geographic center of US
}

/**
 * Fetch white space availability from spectrum database
 * Note: This would require API key in production
 */
export async function fetchWhiteSpaceAvailability(lat, lon) {
  // Google Spectrum Database requires registration
  // This is a placeholder for the API integration

  // For now, return calculated availability based on TV channels
  return {
    available: true,
    note: 'White space query requires API registration. Using TV channel data.'
  };
}

/**
 * Export frequency coordination to various formats
 */
export const ExportFormats = {
  /**
   * Generate Wireless Workbench compatible frequency list
   * WWB accepts simple frequency lists in MHz
   */
  toWWBFrequencyList: (frequencies) => {
    const lines = [
      '// RF Scout Frequency Export',
      '// Compatible with Shure Wireless Workbench',
      `// Generated: ${new Date().toISOString()}`,
      '// Import via: Coordination > Frequency List > Import',
      '',
      ...frequencies.map(f => f.frequency.toFixed(3))
    ];
    return lines.join('\n');
  },

  /**
   * Generate WWB scan data format (if scan data available)
   * Format: frequency_MHz, amplitude_dBm
   */
  toWWBScanData: (scanData) => {
    if (!scanData || scanData.length === 0) {
      return '// No scan data available\n';
    }
    return scanData.map(point =>
      `${point.frequency.toFixed(3)},${point.amplitude.toFixed(1)}`
    ).join('\n');
  },

  /**
   * Generate Sennheiser WSM compatible format
   */
  toWSMFormat: (frequencies) => {
    const lines = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<FrequencyList>',
      ...frequencies.map(f =>
        `  <Frequency value="${(f.frequency * 1000).toFixed(0)}" unit="kHz" />`
      ),
      '</FrequencyList>'
    ];
    return lines.join('\n');
  },

  /**
   * Generate detailed coordination report
   */
  toDetailedReport: (frequencies, venue, tvChannels, analysis) => {
    const lines = [
      'RF SCOUT COORDINATION REPORT',
      '=============================',
      '',
      `Generated: ${new Date().toLocaleString()}`,
      `Venue: ${venue?.name || 'Manual Location'}`,
      `Location: ${venue?.city || 'Unknown'}, ${venue?.state || ''}`,
      '',
      'ACTIVE TV CHANNELS',
      '------------------',
      tvChannels.map(ch => `Ch ${ch}: ${470 + (ch - 14) * 6}-${470 + (ch - 14) * 6 + 6} MHz`).join('\n'),
      '',
      'COORDINATED FREQUENCIES',
      '-----------------------',
      '',
      'WIRELESS MICROPHONES:',
      ...frequencies.filter(f => f.type === 'mic').map((f, i) =>
        `  ${i + 1}. ${f.name || 'Mic ' + (i + 1)}: ${f.frequency.toFixed(3)} MHz`
      ),
      '',
      'IN-EAR MONITORS:',
      ...frequencies.filter(f => f.type === 'iem').map((f, i) =>
        `  ${i + 1}. ${f.name || 'IEM ' + (i + 1)}: ${f.frequency.toFixed(3)} MHz`
      ),
      '',
      'ANALYSIS',
      '--------',
      `Issues: ${analysis?.issues?.length || 0}`,
      `Warnings: ${analysis?.warnings?.length || 0}`,
      `IM Products Calculated: ${analysis?.imProducts?.length || 0}`,
      '',
      'NOTES',
      '-----',
      '- Always verify with RF scan at venue',
      '- TV channels may vary - check local broadcasts',
      '- Keep 4+ MHz separation between mics and IEMs',
      '',
      '=============================',
      'Generated by RF Scout',
    ];
    return lines.join('\n');
  }
};

export default {
  fetchTVStations,
  geocodeZip,
  fetchWhiteSpaceAvailability,
  ExportFormats
};

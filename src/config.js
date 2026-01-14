// RF Scout Configuration
// All customizable settings in one place

export const CONFIG = {
  // App metadata
  app: {
    name: 'RF Scout',
    version: '1.0.0',
    description: 'Simplified RF Coordination for Touring Professionals'
  },

  // Frequency bands (UHF range commonly used in US)
  frequencyBands: {
    // TV Channels 14-36 (main wireless mic spectrum post-2017 auction)
    uhfLow: { min: 470, max: 512, label: 'UHF Low (Ch 14-20)' },
    uhfMid: { min: 512, max: 566, label: 'UHF Mid (Ch 21-29)' },
    uhfHigh: { min: 566, max: 608, label: 'UHF High (Ch 30-36)' },

    // Full usable range
    fullRange: { min: 470, max: 608, label: 'Full UHF (470-608 MHz)' }
  },

  // Manufacturer frequency bands
  manufacturerBands: {
    shure: {
      G5: { min: 506, max: 558, label: 'Shure G5' },
      H5: { min: 562, max: 614, label: 'Shure H5' },
      J5: { min: 578, max: 608, label: 'Shure J5 (Lower)', min2: 614, max2: 638, label2: 'Shure J5 (Upper)' },
      K5: { min: 606, max: 658, label: 'Shure K5' },
    },
    sennheiser: {
      A1: { min: 470, max: 516, label: 'Sennheiser A1' },
      A: { min: 516, max: 558, label: 'Sennheiser A' },
      G: { min: 566, max: 608, label: 'Sennheiser G' },
      GB: { min: 606, max: 648, label: 'Sennheiser GB' },
    },
    audioTechnica: {
      DE2: { min: 470, max: 530, label: 'Audio-Technica DE2' },
      EE1: { min: 530, max: 590, label: 'Audio-Technica EE1' },
    }
  },

  // TV Channel to Frequency mapping (US)
  tvChannels: {
    14: { min: 470, max: 476 },
    15: { min: 476, max: 482 },
    16: { min: 482, max: 488 },
    17: { min: 488, max: 494 },
    18: { min: 494, max: 500 },
    19: { min: 500, max: 506 },
    20: { min: 506, max: 512 },
    21: { min: 512, max: 518 },
    22: { min: 518, max: 524 },
    23: { min: 524, max: 530 },
    24: { min: 530, max: 536 },
    25: { min: 536, max: 542 },
    26: { min: 542, max: 548 },
    27: { min: 548, max: 554 },
    28: { min: 554, max: 560 },
    29: { min: 560, max: 566 },
    30: { min: 566, max: 572 },
    31: { min: 572, max: 578 },
    32: { min: 578, max: 584 },
    33: { min: 584, max: 590 },
    34: { min: 590, max: 596 },
    35: { min: 596, max: 602 },
    36: { min: 602, max: 608 },
  },

  // Coordination settings
  coordination: {
    // Minimum spacing between frequencies (MHz)
    minSpacingMic: 0.250,      // 250 kHz for mics
    minSpacingIEM: 0.350,      // 350 kHz for IEMs
    minSpacingMicToIEM: 4.0,   // 4 MHz between mic and IEM groups

    // TV channel guard band (MHz from edge)
    tvGuardBand: 0.5,

    // Step size for frequency assignment (kHz)
    stepSize: 0.025,  // 25 kHz steps

    // IM product safety margin (MHz)
    imSafetyMargin: 0.250,
  },

  // Major venue database with known RF profiles
  venues: [
    {
      id: 'ryman',
      name: 'Ryman Auditorium',
      city: 'Nashville',
      state: 'TN',
      zip: '37219',
      lat: 36.1612,
      lon: -86.7783,
      capacity: 2362,
      knownIssues: ['Heavy TV activity on Ch 28-32'],
      recommendedBands: ['470-530', '566-590'],
    },
    {
      id: 'redrocks',
      name: 'Red Rocks Amphitheatre',
      city: 'Morrison',
      state: 'CO',
      zip: '80465',
      lat: 39.6654,
      lon: -105.2057,
      capacity: 9525,
      knownIssues: ['Mountain reflections can cause multipath'],
      recommendedBands: ['500-560'],
    },
    {
      id: 'msg',
      name: 'Madison Square Garden',
      city: 'New York',
      state: 'NY',
      zip: '10001',
      lat: 40.7505,
      lon: -73.9934,
      capacity: 20789,
      knownIssues: ['Extremely congested RF environment', 'Many TV stations'],
      recommendedBands: ['470-500', '580-608'],
    },
    {
      id: 'greek',
      name: 'The Greek Theatre',
      city: 'Los Angeles',
      state: 'CA',
      zip: '90027',
      lat: 34.1125,
      lon: -118.2969,
      capacity: 5870,
      knownIssues: ['LA market very congested'],
      recommendedBands: ['500-540'],
    },
    {
      id: 'acl',
      name: 'ACL Live at The Moody Theater',
      city: 'Austin',
      state: 'TX',
      zip: '78701',
      lat: 30.2651,
      lon: -97.7471,
      capacity: 2750,
      knownIssues: [],
      recommendedBands: ['470-560', '566-608'],
    },
    {
      id: 'fillmore',
      name: 'The Fillmore',
      city: 'San Francisco',
      state: 'CA',
      zip: '94115',
      lat: 37.7840,
      lon: -122.4334,
      capacity: 1315,
      knownIssues: ['Bay Area TV congestion'],
      recommendedBands: ['520-580'],
    },
    {
      id: 'gorge',
      name: 'The Gorge Amphitheatre',
      city: 'George',
      state: 'WA',
      zip: '98848',
      lat: 47.1014,
      lon: -119.9967,
      capacity: 27500,
      knownIssues: ['Remote location - cleaner spectrum'],
      recommendedBands: ['470-608'],
    },
    {
      id: 'bonnaroo',
      name: 'Bonnaroo (Great Stage Park)',
      city: 'Manchester',
      state: 'TN',
      zip: '37355',
      lat: 35.4792,
      lon: -86.0658,
      capacity: 80000,
      knownIssues: ['Festival RF coordination required', 'Multiple stages'],
      recommendedBands: ['Coordinate with festival RF team'],
    },
    {
      id: 'house-of-blues-chicago',
      name: 'House of Blues Chicago',
      city: 'Chicago',
      state: 'IL',
      zip: '60654',
      lat: 41.8925,
      lon: -87.6262,
      capacity: 1500,
      knownIssues: ['Chicago TV market congested'],
      recommendedBands: ['470-510', '560-600'],
    },
    {
      id: 'brooklyn-steel',
      name: 'Brooklyn Steel',
      city: 'Brooklyn',
      state: 'NY',
      zip: '11211',
      lat: 40.7197,
      lon: -73.9501,
      capacity: 1800,
      knownIssues: ['NYC market very congested'],
      recommendedBands: ['470-500', '580-608'],
    },
  ],

  // Export formats
  export: {
    wwbCsv: {
      name: 'Wireless Workbench CSV',
      extension: '.csv',
      description: 'Import into Shure WWB for deployment'
    },
    frequencyList: {
      name: 'Frequency List',
      extension: '.txt',
      description: 'Simple list for manual entry'
    },
    fullReport: {
      name: 'Full Coordination Report',
      extension: '.csv',
      description: 'Complete coordination with all details'
    }
  }
};

export default CONFIG;

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Radio, MapPin, Search, Plus, Trash2, Download, AlertTriangle,
  CheckCircle, Info, Settings, Waves, Tv, Mic, Headphones,
  ChevronDown, ChevronUp, RefreshCw, Zap, Shield, FileDown,
  Building2, Navigation, Copy, ExternalLink
} from 'lucide-react';
import CONFIG from './config';

// ============================================
// RF COORDINATION ENGINE
// ============================================

const RFEngine = {
  // Calculate 3rd order intermodulation products
  calculateIM3: (f1, f2) => {
    return [
      2 * f1 - f2,
      2 * f2 - f1
    ];
  },

  // Calculate 5th order intermodulation products
  calculateIM5: (f1, f2) => {
    return [
      3 * f1 - 2 * f2,
      3 * f2 - 2 * f1
    ];
  },

  // Get all IM products for a set of frequencies
  getAllIMProducts: (frequencies) => {
    const imProducts = new Set();
    const freqs = frequencies.map(f => f.frequency);

    for (let i = 0; i < freqs.length; i++) {
      for (let j = i + 1; j < freqs.length; j++) {
        const im3 = RFEngine.calculateIM3(freqs[i], freqs[j]);
        const im5 = RFEngine.calculateIM5(freqs[i], freqs[j]);

        [...im3, ...im5].forEach(product => {
          if (product >= 470 && product <= 608) {
            imProducts.add(product.toFixed(3));
          }
        });
      }
    }

    return Array.from(imProducts).map(p => parseFloat(p));
  },

  // Check if a frequency conflicts with IM products
  hasIMConflict: (freq, imProducts, margin = 0.250) => {
    return imProducts.some(im => Math.abs(freq - im) < margin);
  },

  // Check if frequency is in a TV channel
  isInTVChannel: (freq, activeTVChannels) => {
    for (const ch of activeTVChannels) {
      const channelInfo = CONFIG.tvChannels[ch];
      if (channelInfo) {
        const guardedMin = channelInfo.min + CONFIG.coordination.tvGuardBand;
        const guardedMax = channelInfo.max - CONFIG.coordination.tvGuardBand;
        if (freq >= channelInfo.min && freq <= channelInfo.max) {
          return { channel: ch, ...channelInfo };
        }
      }
    }
    return null;
  },

  // Find safe frequencies
  findSafeFrequencies: (count, type, existingFreqs, activeTVChannels, bandMin = 470, bandMax = 608) => {
    const safeFreqs = [];
    const spacing = type === 'iem' ? CONFIG.coordination.minSpacingIEM : CONFIG.coordination.minSpacingMic;
    const step = CONFIG.coordination.stepSize;

    let currentFreq = bandMin + 0.5; // Start with guard band

    while (safeFreqs.length < count && currentFreq < bandMax - 0.5) {
      // Check TV channel conflict
      const tvConflict = RFEngine.isInTVChannel(currentFreq, activeTVChannels);
      if (tvConflict) {
        currentFreq = tvConflict.max + CONFIG.coordination.tvGuardBand;
        continue;
      }

      // Check spacing from existing frequencies
      const allFreqs = [...existingFreqs, ...safeFreqs];
      const tooClose = allFreqs.some(f =>
        Math.abs(currentFreq - f.frequency) < spacing
      );

      if (tooClose) {
        currentFreq += step;
        continue;
      }

      // Check IM products
      const imProducts = RFEngine.getAllIMProducts([...allFreqs, { frequency: currentFreq }]);
      const hasConflict = RFEngine.hasIMConflict(currentFreq, imProducts);

      if (!hasConflict) {
        safeFreqs.push({
          frequency: currentFreq,
          type,
          status: 'calculated'
        });
        currentFreq += spacing + step;
      } else {
        currentFreq += step;
      }
    }

    return safeFreqs;
  },

  // Analyze coordination quality
  analyzeCoordination: (frequencies, activeTVChannels) => {
    const issues = [];
    const warnings = [];
    const imProducts = RFEngine.getAllIMProducts(frequencies);

    frequencies.forEach((freq, idx) => {
      // Check TV conflicts
      const tvConflict = RFEngine.isInTVChannel(freq.frequency, activeTVChannels);
      if (tvConflict) {
        issues.push({
          type: 'tv_conflict',
          frequency: freq.frequency,
          message: `${freq.frequency.toFixed(3)} MHz conflicts with TV Ch ${tvConflict.channel}`,
          severity: 'error'
        });
      }

      // Check IM conflicts
      if (RFEngine.hasIMConflict(freq.frequency, imProducts)) {
        warnings.push({
          type: 'im_conflict',
          frequency: freq.frequency,
          message: `${freq.frequency.toFixed(3)} MHz near intermod product`,
          severity: 'warning'
        });
      }

      // Check spacing
      frequencies.forEach((other, otherIdx) => {
        if (idx !== otherIdx) {
          const minSpacing = (freq.type === 'iem' || other.type === 'iem')
            ? CONFIG.coordination.minSpacingIEM
            : CONFIG.coordination.minSpacingMic;

          if (Math.abs(freq.frequency - other.frequency) < minSpacing) {
            warnings.push({
              type: 'spacing',
              frequency: freq.frequency,
              message: `${freq.frequency.toFixed(3)} MHz too close to ${other.frequency.toFixed(3)} MHz`,
              severity: 'warning'
            });
          }
        }
      });
    });

    return { issues, warnings, imProducts };
  }
};

// ============================================
// COMPONENTS
// ============================================

// Venue Search Component
function VenueSearch({ onSelectVenue, onManualLocation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [manualZip, setManualZip] = useState('');

  const filteredVenues = useMemo(() => {
    if (!searchQuery) return CONFIG.venues;
    const query = searchQuery.toLowerCase();
    return CONFIG.venues.filter(v =>
      v.name.toLowerCase().includes(query) ||
      v.city.toLowerCase().includes(query) ||
      v.state.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  return (
    <div className="space-y-4">
      {/* Venue Search */}
      <div className="relative">
        <div className="flex items-center gap-2 bg-dark-700 rounded-lg px-4 py-3 border border-dark-500 focus-within:border-blue-500 transition-colors">
          <Search className="w-5 h-5 text-neutral-400" />
          <input
            type="text"
            placeholder="Search venues (Ryman, Red Rocks, MSG...)"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowResults(true);
            }}
            onFocus={() => setShowResults(true)}
            className="flex-1 bg-transparent outline-none text-white placeholder-neutral-500"
          />
        </div>

        <AnimatePresence>
          {showResults && filteredVenues.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 right-0 mt-2 bg-dark-700 border border-dark-500 rounded-lg shadow-xl z-50 max-h-64 overflow-y-auto"
            >
              {filteredVenues.map((venue) => (
                <button
                  key={venue.id}
                  onClick={() => {
                    onSelectVenue(venue);
                    setShowResults(false);
                    setSearchQuery(venue.name);
                  }}
                  className="w-full px-4 py-3 text-left hover:bg-dark-600 transition-colors flex items-center gap-3 border-b border-dark-600 last:border-0"
                >
                  <Building2 className="w-5 h-5 text-blue-400" />
                  <div>
                    <div className="text-white font-medium">{venue.name}</div>
                    <div className="text-sm text-neutral-400">{venue.city}, {venue.state}</div>
                  </div>
                  <div className="ml-auto text-xs text-neutral-500">
                    {venue.capacity.toLocaleString()} cap
                  </div>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Manual ZIP Entry */}
      <div className="flex items-center gap-2 text-sm text-neutral-400">
        <div className="flex-1 h-px bg-dark-500"></div>
        <span>or enter zip code</span>
        <div className="flex-1 h-px bg-dark-500"></div>
      </div>

      <div className="flex gap-2">
        <div className="flex items-center gap-2 flex-1 bg-dark-700 rounded-lg px-4 py-3 border border-dark-500 focus-within:border-blue-500 transition-colors">
          <MapPin className="w-5 h-5 text-neutral-400" />
          <input
            type="text"
            placeholder="ZIP code (e.g., 37219)"
            value={manualZip}
            onChange={(e) => setManualZip(e.target.value.replace(/\D/g, '').slice(0, 5))}
            className="flex-1 bg-transparent outline-none text-white placeholder-neutral-500"
          />
        </div>
        <button
          onClick={() => manualZip.length === 5 && onManualLocation(manualZip)}
          disabled={manualZip.length !== 5}
          className="px-4 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-dark-600 disabled:text-neutral-500 rounded-lg transition-colors font-medium"
        >
          <Navigation className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

// TV Channel Selector
function TVChannelSelector({ activeTVChannels, onToggleChannel }) {
  const [expanded, setExpanded] = useState(false);

  const channelGroups = [
    { label: 'Ch 14-20', channels: [14, 15, 16, 17, 18, 19, 20] },
    { label: 'Ch 21-28', channels: [21, 22, 23, 24, 25, 26, 27, 28] },
    { label: 'Ch 29-36', channels: [29, 30, 31, 32, 33, 34, 35, 36] },
  ];

  return (
    <div className="bg-dark-800 rounded-xl border border-dark-600 overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-dark-700 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Tv className="w-5 h-5 text-red-400" />
          <span className="font-medium">Active TV Channels</span>
          <span className="text-sm text-neutral-400">
            ({activeTVChannels.length} selected)
          </span>
        </div>
        {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 border-t border-dark-600 space-y-4">
              <p className="text-sm text-neutral-400">
                Select TV channels that are active in your area. These frequencies will be excluded from coordination.
              </p>

              {channelGroups.map((group) => (
                <div key={group.label}>
                  <div className="text-xs text-neutral-500 mb-2">{group.label}</div>
                  <div className="flex flex-wrap gap-2">
                    {group.channels.map((ch) => {
                      const isActive = activeTVChannels.includes(ch);
                      const channelInfo = CONFIG.tvChannels[ch];
                      return (
                        <button
                          key={ch}
                          onClick={() => onToggleChannel(ch)}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                            isActive
                              ? 'bg-red-500/20 text-red-400 border border-red-500/50'
                              : 'bg-dark-600 text-neutral-400 border border-dark-500 hover:border-dark-400'
                          }`}
                        >
                          {ch}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => {
                    Object.keys(CONFIG.tvChannels).forEach(ch => {
                      if (!activeTVChannels.includes(parseInt(ch))) {
                        onToggleChannel(parseInt(ch));
                      }
                    });
                  }}
                  className="px-3 py-1.5 text-sm bg-dark-600 hover:bg-dark-500 rounded-lg transition-colors"
                >
                  Select All
                </button>
                <button
                  onClick={() => {
                    activeTVChannels.forEach(ch => onToggleChannel(ch));
                  }}
                  className="px-3 py-1.5 text-sm bg-dark-600 hover:bg-dark-500 rounded-lg transition-colors"
                >
                  Clear All
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Frequency Input Row
function FrequencyRow({ freq, index, onUpdate, onDelete, analysis }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(freq.frequency.toFixed(3));

  const issue = analysis?.issues.find(i => i.frequency === freq.frequency);
  const warning = analysis?.warnings.find(w => w.frequency === freq.frequency);

  const statusColor = issue ? 'text-red-400' : warning ? 'text-yellow-400' : 'text-green-400';
  const statusBg = issue ? 'bg-red-500/10' : warning ? 'bg-yellow-500/10' : 'bg-green-500/10';

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-3 sm:py-3 rounded-lg ${statusBg} border border-dark-600`}
    >
      {/* Type Icon */}
      <div className={`p-1.5 sm:p-2 rounded-lg flex-shrink-0 ${freq.type === 'mic' ? 'bg-blue-500/20' : 'bg-purple-500/20'}`}>
        {freq.type === 'mic' ? (
          <Mic className="w-4 h-4 text-blue-400" />
        ) : (
          <Headphones className="w-4 h-4 text-purple-400" />
        )}
      </div>

      {/* Name - hidden on very small screens, visible on sm+ */}
      <input
        type="text"
        value={freq.name || `${freq.type === 'mic' ? 'Mic' : 'IEM'} ${index + 1}`}
        onChange={(e) => onUpdate(index, { ...freq, name: e.target.value })}
        className="hidden sm:block w-20 md:w-24 bg-transparent border-b border-dark-500 focus:border-blue-500 outline-none px-1 text-sm"
      />

      {/* Frequency - larger tap target on mobile */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {isEditing ? (
          <input
            type="text"
            inputMode="decimal"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={() => {
              const newFreq = parseFloat(editValue);
              if (!isNaN(newFreq) && newFreq >= 470 && newFreq <= 608) {
                onUpdate(index, { ...freq, frequency: newFreq, status: 'manual' });
              }
              setIsEditing(false);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') e.target.blur();
            }}
            autoFocus
            className="w-full sm:w-24 bg-dark-700 border border-blue-500 rounded px-2 py-2 sm:py-1 outline-none text-center font-mono"
          />
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="font-mono text-base sm:text-lg hover:text-blue-400 transition-colors py-1 active:scale-95"
          >
            {freq.frequency.toFixed(3)} <span className="text-xs sm:text-sm text-neutral-500">MHz</span>
          </button>
        )}
      </div>

      {/* Status */}
      <div className={`flex items-center gap-2 flex-shrink-0 ${statusColor}`}>
        {issue ? (
          <AlertTriangle className="w-4 h-4" />
        ) : warning ? (
          <Info className="w-4 h-4" />
        ) : (
          <CheckCircle className="w-4 h-4" />
        )}
      </div>

      {/* Delete - larger touch target */}
      <button
        onClick={() => onDelete(index)}
        className="p-2 sm:p-2 hover:bg-red-500/20 active:bg-red-500/30 rounded-lg transition-colors text-neutral-400 hover:text-red-400 flex-shrink-0"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

// Spectrum Visualization
function SpectrumVisualization({ frequencies, activeTVChannels, imProducts }) {
  const minFreq = 470;
  const maxFreq = 608;
  const range = maxFreq - minFreq;

  const getPosition = (freq) => ((freq - minFreq) / range) * 100;

  return (
    <div className="bg-dark-800 rounded-xl border border-dark-600 p-3 sm:p-4">
      {/* Header - stacks on mobile */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 mb-3 sm:mb-4">
        <h3 className="font-medium flex items-center gap-2">
          <Waves className="w-5 h-5 text-blue-400" />
          Spectrum View
        </h3>
        {/* Legend - horizontal scroll on mobile */}
        <div className="flex items-center gap-3 sm:gap-4 text-xs overflow-x-auto pb-1 sm:pb-0 -mx-1 px-1 sm:mx-0 sm:px-0 scrollbar-hide">
          <div className="flex items-center gap-1 flex-shrink-0">
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded bg-red-500/30"></div>
            <span className="text-neutral-400 whitespace-nowrap">TV</span>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded bg-blue-500"></div>
            <span className="text-neutral-400 whitespace-nowrap">Mics</span>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded bg-purple-500"></div>
            <span className="text-neutral-400 whitespace-nowrap">IEMs</span>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded bg-yellow-500/50"></div>
            <span className="text-neutral-400 whitespace-nowrap">IM</span>
          </div>
        </div>
      </div>

      {/* Spectrum Bar - taller on mobile for touch */}
      <div className="relative h-32 sm:h-28 md:h-24 bg-dark-900 rounded-lg overflow-hidden touch-pan-x">
        {/* TV Channel blocks */}
        {activeTVChannels.map((ch) => {
          const channelInfo = CONFIG.tvChannels[ch];
          if (!channelInfo) return null;
          const left = getPosition(channelInfo.min);
          const width = ((channelInfo.max - channelInfo.min) / range) * 100;
          return (
            <div
              key={ch}
              className="absolute top-0 bottom-0 tv-channel-block border-l border-r border-red-500/30"
              style={{ left: `${left}%`, width: `${width}%` }}
            >
              <div className="absolute top-1 left-1/2 -translate-x-1/2 text-[10px] sm:text-xs text-red-400/70">
                {ch}
              </div>
            </div>
          );
        })}

        {/* IM Products */}
        {imProducts.map((im, idx) => (
          <div
            key={idx}
            className="absolute top-0 bottom-0 w-px bg-yellow-500/30"
            style={{ left: `${getPosition(im)}%` }}
          />
        ))}

        {/* Frequency markers */}
        {frequencies.map((freq, idx) => (
          <motion.div
            key={idx}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={`absolute top-4 bottom-10 sm:bottom-8 w-1.5 sm:w-1 rounded-full ${
              freq.type === 'mic' ? 'bg-blue-500' : 'bg-purple-500'
            } frequency-active`}
            style={{ left: `${getPosition(freq.frequency)}%` }}
          >
            <div className={`absolute -bottom-5 sm:-bottom-6 left-1/2 -translate-x-1/2 text-[9px] sm:text-xs whitespace-nowrap ${
              freq.type === 'mic' ? 'text-blue-400' : 'text-purple-400'
            }`}>
              {freq.frequency.toFixed(1)}
            </div>
          </motion.div>
        ))}

        {/* Scale markers - fewer labels on mobile */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-between px-1 sm:px-2 py-1 text-[9px] sm:text-xs text-neutral-500">
          <span>470</span>
          <span className="hidden sm:inline">500</span>
          <span>530</span>
          <span className="hidden sm:inline">560</span>
          <span>590</span>
          <span>608</span>
        </div>
      </div>
    </div>
  );
}

// Export Panel
function ExportPanel({ frequencies, venue, onExport }) {
  const [format, setFormat] = useState('wwbCsv');

  const generateWWBCsv = () => {
    // WWB frequency list format - simple MHz values
    const header = '// RF Scout Export for Wireless Workbench\n// Venue: ' +
      (venue?.name || 'Unknown') + '\n// Generated: ' + new Date().toISOString() + '\n\n';

    const freqList = frequencies.map(f => f.frequency.toFixed(3)).join('\n');
    return header + freqList;
  };

  const generateFrequencyList = () => {
    return frequencies.map(f => f.frequency.toFixed(3)).join(' ');
  };

  const generateFullReport = () => {
    const header = 'Name,Type,Frequency (MHz),Status\n';
    const rows = frequencies.map((f, idx) =>
      `"${f.name || (f.type === 'mic' ? 'Mic' : 'IEM') + ' ' + (idx + 1)}",${f.type},${f.frequency.toFixed(3)},${f.status || 'calculated'}`
    ).join('\n');
    return header + rows;
  };

  const handleExport = () => {
    let content, filename, mimeType;

    switch (format) {
      case 'wwbCsv':
        content = generateWWBCsv();
        filename = `rf_scout_wwb_${venue?.id || 'export'}.txt`;
        mimeType = 'text/plain';
        break;
      case 'frequencyList':
        content = generateFrequencyList();
        filename = `rf_scout_frequencies_${venue?.id || 'export'}.txt`;
        mimeType = 'text/plain';
        break;
      case 'fullReport':
        content = generateFullReport();
        filename = `rf_scout_report_${venue?.id || 'export'}.csv`;
        mimeType = 'text/csv';
        break;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);

    onExport && onExport(format);
  };

  const copyToClipboard = () => {
    const content = format === 'frequencyList'
      ? generateFrequencyList()
      : frequencies.map(f => f.frequency.toFixed(3)).join('\n');

    navigator.clipboard.writeText(content);
  };

  return (
    <div className="bg-dark-800 rounded-xl border border-dark-600 p-4">
      <h3 className="font-medium flex items-center gap-2 mb-4">
        <FileDown className="w-5 h-5 text-green-400" />
        Export Coordination
      </h3>

      <div className="space-y-3">
        {Object.entries(CONFIG.export).map(([key, info]) => (
          <label
            key={key}
            className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
              format === key
                ? 'bg-green-500/10 border border-green-500/50'
                : 'bg-dark-700 border border-dark-600 hover:border-dark-500'
            }`}
          >
            <input
              type="radio"
              name="exportFormat"
              value={key}
              checked={format === key}
              onChange={() => setFormat(key)}
              className="sr-only"
            />
            <div className={`w-4 h-4 rounded-full border-2 ${
              format === key
                ? 'border-green-500 bg-green-500'
                : 'border-neutral-500'
            }`}>
              {format === key && <div className="w-2 h-2 bg-white rounded-full m-0.5" />}
            </div>
            <div>
              <div className="font-medium">{info.name}</div>
              <div className="text-sm text-neutral-400">{info.description}</div>
            </div>
          </label>
        ))}
      </div>

      <div className="flex gap-2 mt-4">
        <button
          onClick={handleExport}
          disabled={frequencies.length === 0}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-500 disabled:bg-dark-600 disabled:text-neutral-500 rounded-lg transition-colors font-medium"
        >
          <Download className="w-5 h-5" />
          Download
        </button>
        <button
          onClick={copyToClipboard}
          disabled={frequencies.length === 0}
          className="px-4 py-3 bg-dark-600 hover:bg-dark-500 disabled:opacity-50 rounded-lg transition-colors"
        >
          <Copy className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

// Venue Info Card
function VenueInfoCard({ venue }) {
  if (!venue) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-dark-800 rounded-xl border border-dark-600 p-4"
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-medium text-lg">{venue.name}</h3>
          <p className="text-sm text-neutral-400">{venue.city}, {venue.state} {venue.zip}</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-neutral-400">Capacity</div>
          <div className="font-medium">{venue.capacity.toLocaleString()}</div>
        </div>
      </div>

      {venue.knownIssues && venue.knownIssues.length > 0 && (
        <div className="mt-3 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
          <div className="flex items-center gap-2 text-yellow-400 text-sm font-medium mb-1">
            <AlertTriangle className="w-4 h-4" />
            Known RF Issues
          </div>
          <ul className="text-sm text-neutral-300 space-y-1">
            {venue.knownIssues.map((issue, idx) => (
              <li key={idx}>• {issue}</li>
            ))}
          </ul>
        </div>
      )}

      {venue.recommendedBands && (
        <div className="mt-3">
          <div className="text-sm text-neutral-400 mb-1">Recommended Bands</div>
          <div className="flex flex-wrap gap-2">
            {venue.recommendedBands.map((band, idx) => (
              <span key={idx} className="px-2 py-1 bg-green-500/20 text-green-400 text-sm rounded">
                {band} MHz
              </span>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

// ============================================
// MAIN APP
// ============================================

export default function App() {
  // State
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [zipCode, setZipCode] = useState('');
  const [frequencies, setFrequencies] = useState([]);
  const [activeTVChannels, setActiveTVChannels] = useState([]);
  const [analysis, setAnalysis] = useState({ issues: [], warnings: [], imProducts: [] });

  // Coordination counts
  const [micCount, setMicCount] = useState(4);
  const [iemCount, setIemCount] = useState(4);

  // Update analysis when frequencies or TV channels change
  useEffect(() => {
    if (frequencies.length > 0) {
      const result = RFEngine.analyzeCoordination(frequencies, activeTVChannels);
      setAnalysis(result);
    } else {
      setAnalysis({ issues: [], warnings: [], imProducts: [] });
    }
  }, [frequencies, activeTVChannels]);

  // Venue selection handler
  const handleSelectVenue = (venue) => {
    setSelectedVenue(venue);
    setZipCode(venue.zip);
    // Simulate some default TV channels based on venue
    // In production, this would query FCC API
    const defaultTVChannels = venue.city === 'New York' || venue.city === 'Brooklyn'
      ? [20, 21, 25, 28, 31, 33]
      : venue.city === 'Los Angeles'
      ? [22, 24, 28, 30, 34]
      : venue.city === 'Nashville'
      ? [28, 29, 30, 31, 32]
      : [24, 28, 32];
    setActiveTVChannels(defaultTVChannels);
  };

  // Manual ZIP handler
  const handleManualLocation = (zip) => {
    setZipCode(zip);
    setSelectedVenue(null);
    // Default TV channels for unknown location
    setActiveTVChannels([24, 28, 32]);
  };

  // Toggle TV channel
  const handleToggleChannel = (channel) => {
    setActiveTVChannels(prev =>
      prev.includes(channel)
        ? prev.filter(ch => ch !== channel)
        : [...prev, channel].sort((a, b) => a - b)
    );
  };

  // Calculate frequencies
  const handleCalculate = () => {
    // Clear existing and calculate new
    const micFreqs = RFEngine.findSafeFrequencies(
      micCount,
      'mic',
      [],
      activeTVChannels,
      470,
      550  // Keep mics in lower range
    );

    const iemFreqs = RFEngine.findSafeFrequencies(
      iemCount,
      'iem',
      micFreqs,
      activeTVChannels,
      560,  // IEMs in upper range (4+ MHz separation)
      608
    );

    setFrequencies([...micFreqs, ...iemFreqs]);
  };

  // Add single frequency
  const handleAddFrequency = (type) => {
    const existingOfType = frequencies.filter(f => f.type === type);
    const safeFreqs = RFEngine.findSafeFrequencies(
      1,
      type,
      frequencies,
      activeTVChannels,
      type === 'mic' ? 470 : 560,
      type === 'mic' ? 550 : 608
    );

    if (safeFreqs.length > 0) {
      setFrequencies(prev => [...prev, safeFreqs[0]]);
    }
  };

  // Update frequency
  const handleUpdateFrequency = (index, updated) => {
    setFrequencies(prev => prev.map((f, i) => i === index ? updated : f));
  };

  // Delete frequency
  const handleDeleteFrequency = (index) => {
    setFrequencies(prev => prev.filter((_, i) => i !== index));
  };

  // Stats
  const micFreqs = frequencies.filter(f => f.type === 'mic');
  const iemFreqs = frequencies.filter(f => f.type === 'iem');
  const hasIssues = analysis.issues.length > 0;
  const hasWarnings = analysis.warnings.length > 0;

  return (
    <div className="min-h-screen bg-dark-900">
      {/* Header */}
      <header className="border-b border-dark-700 bg-dark-800/50 backdrop-blur-sm sticky top-0 z-40 safe-area-top">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-blue-500/20 rounded-lg">
              <Radio className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-white">RF Scout</h1>
              <p className="text-[10px] sm:text-xs text-neutral-500 hidden xs:block">Wireless Frequency Coordinator</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {frequencies.length > 0 && (
              <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                {hasIssues ? (
                  <span className="flex items-center gap-1 text-red-400">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="hidden sm:inline">{analysis.issues.length} conflicts</span>
                    <span className="sm:hidden">{analysis.issues.length}</span>
                  </span>
                ) : hasWarnings ? (
                  <span className="flex items-center gap-1 text-yellow-400">
                    <Info className="w-4 h-4" />
                    <span className="hidden sm:inline">{analysis.warnings.length} warnings</span>
                    <span className="sm:hidden">{analysis.warnings.length}</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-green-400">
                    <Shield className="w-4 h-4" />
                    <span className="hidden sm:inline">All clear</span>
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">
        <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Left Column - Setup */}
          <div className="lg:col-span-1 space-y-6">
            {/* Venue Search */}
            <div className="bg-dark-800 rounded-xl border border-dark-600 p-4">
              <h2 className="font-medium flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-blue-400" />
                Venue Location
              </h2>
              <VenueSearch
                onSelectVenue={handleSelectVenue}
                onManualLocation={handleManualLocation}
              />
            </div>

            {/* Venue Info */}
            <VenueInfoCard venue={selectedVenue} />

            {/* TV Channels */}
            <TVChannelSelector
              activeTVChannels={activeTVChannels}
              onToggleChannel={handleToggleChannel}
            />

            {/* Quick Calculate */}
            <div className="bg-dark-800 rounded-xl border border-dark-600 p-4">
              <h3 className="font-medium flex items-center gap-2 mb-4">
                <Zap className="w-5 h-5 text-yellow-400" />
                Quick Coordination
              </h3>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-sm text-neutral-400 block mb-1">Wireless Mics</label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setMicCount(Math.max(0, micCount - 1))}
                      className="p-2 bg-dark-600 hover:bg-dark-500 rounded-lg"
                    >
                      -
                    </button>
                    <span className="w-8 text-center font-mono text-lg">{micCount}</span>
                    <button
                      onClick={() => setMicCount(micCount + 1)}
                      className="p-2 bg-dark-600 hover:bg-dark-500 rounded-lg"
                    >
                      +
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-neutral-400 block mb-1">IEM Packs</label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIemCount(Math.max(0, iemCount - 1))}
                      className="p-2 bg-dark-600 hover:bg-dark-500 rounded-lg"
                    >
                      -
                    </button>
                    <span className="w-8 text-center font-mono text-lg">{iemCount}</span>
                    <button
                      onClick={() => setIemCount(iemCount + 1)}
                      className="p-2 bg-dark-600 hover:bg-dark-500 rounded-lg"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              <button
                onClick={handleCalculate}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors font-medium"
              >
                <RefreshCw className="w-5 h-5" />
                Calculate Safe Frequencies
              </button>
            </div>

            {/* Export */}
            <ExportPanel
              frequencies={frequencies}
              venue={selectedVenue}
              onExport={(format) => console.log('Exported:', format)}
            />
          </div>

          {/* Right Column - Frequencies */}
          <div className="lg:col-span-2 space-y-6">
            {/* Spectrum Visualization */}
            <SpectrumVisualization
              frequencies={frequencies}
              activeTVChannels={activeTVChannels}
              imProducts={analysis.imProducts}
            />

            {/* Frequency Lists */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {/* Mics */}
              <div className="bg-dark-800 rounded-xl border border-dark-600 p-3 sm:p-4">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <h3 className="font-medium flex items-center gap-2 text-sm sm:text-base">
                    <Mic className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
                    <span className="hidden xs:inline">Wireless</span> Mics
                    <span className="text-xs sm:text-sm text-neutral-500">({micFreqs.length})</span>
                  </h3>
                  <button
                    onClick={() => handleAddFrequency('mic')}
                    className="p-2 sm:p-2 bg-blue-500/20 hover:bg-blue-500/30 active:bg-blue-500/40 text-blue-400 rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2 max-h-64 sm:max-h-80 md:max-h-96 overflow-y-auto scroll-container">
                  <AnimatePresence>
                    {micFreqs.length === 0 ? (
                      <div className="text-center py-6 sm:py-8 text-neutral-500">
                        <Mic className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm sm:text-base">No mic frequencies</p>
                        <p className="text-xs sm:text-sm">Click Calculate or + to add</p>
                      </div>
                    ) : (
                      micFreqs.map((freq, idx) => (
                        <FrequencyRow
                          key={`mic-${freq.frequency}`}
                          freq={freq}
                          index={frequencies.indexOf(freq)}
                          onUpdate={handleUpdateFrequency}
                          onDelete={handleDeleteFrequency}
                          analysis={analysis}
                        />
                      ))
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* IEMs */}
              <div className="bg-dark-800 rounded-xl border border-dark-600 p-3 sm:p-4">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <h3 className="font-medium flex items-center gap-2 text-sm sm:text-base">
                    <Headphones className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
                    <span className="hidden xs:inline">In-Ear</span> <span className="xs:hidden">IEM</span><span className="hidden xs:inline">Monitors</span>
                    <span className="text-xs sm:text-sm text-neutral-500">({iemFreqs.length})</span>
                  </h3>
                  <button
                    onClick={() => handleAddFrequency('iem')}
                    className="p-2 sm:p-2 bg-purple-500/20 hover:bg-purple-500/30 active:bg-purple-500/40 text-purple-400 rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2 max-h-64 sm:max-h-80 md:max-h-96 overflow-y-auto scroll-container">
                  <AnimatePresence>
                    {iemFreqs.length === 0 ? (
                      <div className="text-center py-6 sm:py-8 text-neutral-500">
                        <Headphones className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm sm:text-base">No IEM frequencies</p>
                        <p className="text-xs sm:text-sm">Click Calculate or + to add</p>
                      </div>
                    ) : (
                      iemFreqs.map((freq, idx) => (
                        <FrequencyRow
                          key={`iem-${freq.frequency}`}
                          freq={freq}
                          index={frequencies.indexOf(freq)}
                          onUpdate={handleUpdateFrequency}
                          onDelete={handleDeleteFrequency}
                          analysis={analysis}
                        />
                      ))
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Analysis Panel */}
            {(analysis.issues.length > 0 || analysis.warnings.length > 0) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-dark-800 rounded-xl border border-dark-600 p-4"
              >
                <h3 className="font-medium flex items-center gap-2 mb-4">
                  <AlertTriangle className="w-5 h-5 text-yellow-400" />
                  Coordination Analysis
                </h3>

                <div className="space-y-2">
                  {analysis.issues.map((issue, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                      <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
                      <span className="text-sm text-red-200">{issue.message}</span>
                    </div>
                  ))}
                  {analysis.warnings.map((warning, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                      <Info className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                      <span className="text-sm text-yellow-200">{warning.message}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Help Card - collapsible on mobile */}
            <div className="bg-dark-800/50 rounded-xl border border-dark-700 p-3 sm:p-4">
              <h3 className="font-medium text-xs sm:text-sm text-neutral-400 mb-2">Quick Tips</h3>
              <ul className="text-xs sm:text-sm text-neutral-500 space-y-1">
                <li className="hidden sm:list-item">• Mics and IEMs are automatically separated by 4+ MHz to prevent interference</li>
                <li>• Red blocks = TV channels to avoid</li>
                <li className="hidden sm:list-item">• Yellow lines indicate calculated intermodulation products to avoid</li>
                <li>• Export to WWB for Shure Wireless Workbench</li>
                <li>• Tap any frequency to edit it</li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-dark-700 mt-8 sm:mt-12 safe-area-bottom">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6 text-center text-xs sm:text-sm text-neutral-500">
          <p>RF Scout v{CONFIG.app.version} • Built for touring pros</p>
          <p className="mt-1 hidden sm:block">
            Always verify frequencies with an RF scan at the venue • This tool provides recommendations, not guarantees
          </p>
          <p className="mt-1 sm:hidden text-[10px]">
            Always verify with RF scan at venue
          </p>
        </div>
      </footer>
    </div>
  );
}

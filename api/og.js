// Vercel OG Image Generation API Route
// This generates a dynamic Open Graph image for social sharing

export const config = {
  runtime: 'edge',
};

export default async function handler(request) {
  // Return SVG as image for OG
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0a0a0a"/>
      <stop offset="50%" style="stop-color:#0f0f0f"/>
      <stop offset="100%" style="stop-color:#0a0a0a"/>
    </linearGradient>
    <linearGradient id="blueGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#3b82f6"/>
      <stop offset="100%" style="stop-color:#60a5fa"/>
    </linearGradient>
    <linearGradient id="purpleGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#8b5cf6"/>
      <stop offset="100%" style="stop-color:#a78bfa"/>
    </linearGradient>
    <linearGradient id="spectrumGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#1a1a2e"/>
      <stop offset="100%" style="stop-color:#0a0a0a"/>
    </linearGradient>
    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <rect width="1200" height="630" fill="url(#bgGrad)"/>

  <!-- Subtle grid -->
  <g opacity="0.04">
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#fff" stroke-width="0.5"/>
    </pattern>
    <rect width="1200" height="630" fill="url(#grid)"/>
  </g>

  <!-- Glow effects -->
  <ellipse cx="200" cy="500" rx="300" ry="200" fill="#3b82f6" opacity="0.08"/>
  <ellipse cx="1000" cy="150" rx="250" ry="150" fill="#8b5cf6" opacity="0.06"/>

  <!-- Logo -->
  <g transform="translate(100, 50)">
    <circle cx="32" cy="32" r="30" fill="#1e293b" stroke="#3b82f6" stroke-width="2"/>
    <g fill="none" stroke="#3b82f6" stroke-width="2.5" stroke-linecap="round" filter="url(#glow)">
      <circle cx="32" cy="32" r="5" fill="#3b82f6" stroke="none"/>
      <path d="M32 22 Q40 26 32 32 Q24 38 32 42" opacity="0.8"/>
      <path d="M24 18 Q40 22 32 32 Q24 42 40 46" opacity="0.5"/>
      <line x1="32" y1="32" x2="32" y2="16"/>
      <line x1="28" y1="19" x2="36" y2="19"/>
    </g>
    <text x="80" y="35" fill="#fff" font-family="system-ui, -apple-system, sans-serif" font-size="42" font-weight="700">RF Scout</text>
    <text x="80" y="55" fill="#64748b" font-family="system-ui, sans-serif" font-size="16">Wireless Frequency Coordinator</text>
  </g>

  <!-- Tagline -->
  <text x="100" y="160" fill="#e2e8f0" font-family="system-ui, sans-serif" font-size="26" font-weight="500">Find safe frequencies for wireless mics &amp; IEMs in seconds</text>

  <!-- Feature pills -->
  <g transform="translate(100, 190)">
    <rect x="0" y="0" width="180" height="32" rx="16" fill="#3b82f6" opacity="0.15" stroke="#3b82f6" stroke-opacity="0.5"/>
    <text x="90" y="21" text-anchor="middle" fill="#60a5fa" font-family="system-ui, sans-serif" font-size="13" font-weight="500">IM Product Avoidance</text>

    <rect x="195" y="0" width="160" height="32" rx="16" fill="#8b5cf6" opacity="0.15" stroke="#8b5cf6" stroke-opacity="0.5"/>
    <text x="275" y="21" text-anchor="middle" fill="#a78bfa" font-family="system-ui, sans-serif" font-size="13" font-weight="500">TV Channel Mapping</text>

    <rect x="370" y="0" width="120" height="32" rx="16" fill="#22c55e" opacity="0.15" stroke="#22c55e" stroke-opacity="0.5"/>
    <text x="430" y="21" text-anchor="middle" fill="#4ade80" font-family="system-ui, sans-serif" font-size="13" font-weight="500">WWB Export</text>
  </g>

  <!-- Spectrum visualization -->
  <g transform="translate(100, 265)">
    <rect x="0" y="0" width="1000" height="180" rx="12" fill="url(#spectrumGrad)" stroke="#1e293b"/>

    <!-- TV Channels -->
    <rect x="40" y="20" width="80" height="140" rx="4" fill="#ef4444" opacity="0.12" stroke="#ef4444" stroke-opacity="0.3"/>
    <text x="80" y="95" text-anchor="middle" fill="#ef4444" opacity="0.6" font-family="system-ui, sans-serif" font-size="13">TV 16</text>

    <rect x="200" y="20" width="80" height="140" rx="4" fill="#ef4444" opacity="0.12" stroke="#ef4444" stroke-opacity="0.3"/>
    <text x="240" y="95" text-anchor="middle" fill="#ef4444" opacity="0.6" font-family="system-ui, sans-serif" font-size="13">TV 20</text>

    <rect x="520" y="20" width="80" height="140" rx="4" fill="#ef4444" opacity="0.12" stroke="#ef4444" stroke-opacity="0.3"/>
    <text x="560" y="95" text-anchor="middle" fill="#ef4444" opacity="0.6" font-family="system-ui, sans-serif" font-size="13">TV 28</text>

    <!-- Mic frequencies -->
    <g filter="url(#glow)">
      <rect x="320" y="30" width="6" height="120" rx="3" fill="url(#blueGrad)"/>
      <rect x="360" y="30" width="6" height="120" rx="3" fill="url(#blueGrad)"/>
      <rect x="400" y="30" width="6" height="120" rx="3" fill="url(#blueGrad)"/>
      <rect x="440" y="30" width="6" height="120" rx="3" fill="url(#blueGrad)"/>
    </g>

    <!-- IEM frequencies -->
    <g filter="url(#glow)">
      <rect x="680" y="30" width="6" height="120" rx="3" fill="url(#purpleGrad)"/>
      <rect x="740" y="30" width="6" height="120" rx="3" fill="url(#purpleGrad)"/>
      <rect x="800" y="30" width="6" height="120" rx="3" fill="url(#purpleGrad)"/>
      <rect x="860" y="30" width="6" height="120" rx="3" fill="url(#purpleGrad)"/>
    </g>

    <!-- IM products -->
    <line x1="480" y1="30" x2="480" y2="150" stroke="#eab308" stroke-width="1.5" stroke-dasharray="4,4" opacity="0.4"/>
    <line x1="630" y1="30" x2="630" y2="150" stroke="#eab308" stroke-width="1.5" stroke-dasharray="4,4" opacity="0.4"/>
    <line x1="920" y1="30" x2="920" y2="150" stroke="#eab308" stroke-width="1.5" stroke-dasharray="4,4" opacity="0.4"/>

    <!-- Scale -->
    <text x="20" y="170" fill="#64748b" font-family="ui-monospace, monospace" font-size="11">470</text>
    <text x="200" y="170" fill="#64748b" font-family="ui-monospace, monospace" font-size="11">500</text>
    <text x="400" y="170" fill="#64748b" font-family="ui-monospace, monospace" font-size="11">530</text>
    <text x="600" y="170" fill="#64748b" font-family="ui-monospace, monospace" font-size="11">560</text>
    <text x="800" y="170" fill="#64748b" font-family="ui-monospace, monospace" font-size="11">590</text>
    <text x="940" y="170" fill="#64748b" font-family="ui-monospace, monospace" font-size="11">608 MHz</text>
  </g>

  <!-- Legend -->
  <g transform="translate(100, 505)">
    <rect x="0" y="0" width="12" height="12" rx="2" fill="#3b82f6"/>
    <text x="18" y="10" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="12">Wireless Mics</text>

    <rect x="130" y="0" width="12" height="12" rx="2" fill="#8b5cf6"/>
    <text x="148" y="10" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="12">IEMs</text>

    <rect x="220" y="0" width="12" height="12" rx="2" fill="#ef4444" opacity="0.4"/>
    <text x="238" y="10" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="12">TV Channels</text>

    <line x1="340" y1="6" x2="354" y2="6" stroke="#eab308" stroke-width="2" stroke-dasharray="3,2"/>
    <text x="362" y="10" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="12">IM Products</text>
  </g>

  <!-- Footer -->
  <text x="100" y="565" fill="#475569" font-family="system-ui, sans-serif" font-size="14">Built for touring professionals</text>
  <text x="1100" y="565" text-anchor="end" fill="#64748b" font-family="ui-monospace, monospace" font-size="14">rf-scout.vercel.app</text>
</svg>`;

  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}

import { ImageResponse } from '@vercel/og';

export const config = {
  runtime: 'edge',
};

export default async function handler() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: 'linear-gradient(135deg, #0a0a0a 0%, #0f0f0f 50%, #0a0a0a 100%)',
          padding: '50px 60px',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        {/* Header with logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {/* Logo circle */}
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: '#1e293b',
              border: '2px solid #3b82f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 30px rgba(59, 130, 246, 0.3)',
            }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="4" fill="#3b82f6" />
              <path d="M12 8 Q16 10 12 12 Q8 14 12 16" stroke="#3b82f6" strokeWidth="2" fill="none" opacity="0.8" />
              <line x1="12" y1="12" x2="12" y2="4" stroke="#3b82f6" strokeWidth="2" />
            </svg>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: '42px', fontWeight: 700, color: '#ffffff', lineHeight: 1 }}>
              RF Scout
            </div>
            <div style={{ fontSize: '16px', color: '#64748b', marginTop: '4px' }}>
              Wireless Frequency Coordinator
            </div>
          </div>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: '26px',
            fontWeight: 500,
            color: '#e2e8f0',
            marginTop: '30px',
          }}
        >
          Find safe frequencies for wireless mics & IEMs in seconds
        </div>

        {/* Feature pills */}
        <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
          <div
            style={{
              padding: '8px 20px',
              borderRadius: '20px',
              background: 'rgba(59, 130, 246, 0.15)',
              border: '1px solid rgba(59, 130, 246, 0.5)',
              color: '#60a5fa',
              fontSize: '13px',
              fontWeight: 500,
            }}
          >
            IM Product Avoidance
          </div>
          <div
            style={{
              padding: '8px 20px',
              borderRadius: '20px',
              background: 'rgba(139, 92, 246, 0.15)',
              border: '1px solid rgba(139, 92, 246, 0.5)',
              color: '#a78bfa',
              fontSize: '13px',
              fontWeight: 500,
            }}
          >
            TV Channel Mapping
          </div>
          <div
            style={{
              padding: '8px 20px',
              borderRadius: '20px',
              background: 'rgba(34, 197, 94, 0.15)',
              border: '1px solid rgba(34, 197, 94, 0.5)',
              color: '#4ade80',
              fontSize: '13px',
              fontWeight: 500,
            }}
          >
            WWB Export
          </div>
        </div>

        {/* Spectrum visualization */}
        <div
          style={{
            marginTop: '25px',
            background: 'linear-gradient(180deg, #1a1a2e 0%, #0a0a0a 100%)',
            borderRadius: '12px',
            border: '1px solid #1e293b',
            padding: '20px',
            height: '180px',
            display: 'flex',
            position: 'relative',
          }}
        >
          {/* TV Channel blocks */}
          <div
            style={{
              position: 'absolute',
              left: '40px',
              top: '20px',
              width: '80px',
              height: '140px',
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'rgba(239, 68, 68, 0.6)',
              fontSize: '13px',
            }}
          >
            TV 16
          </div>
          <div
            style={{
              position: 'absolute',
              left: '180px',
              top: '20px',
              width: '80px',
              height: '140px',
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'rgba(239, 68, 68, 0.6)',
              fontSize: '13px',
            }}
          >
            TV 20
          </div>
          <div
            style={{
              position: 'absolute',
              left: '480px',
              top: '20px',
              width: '80px',
              height: '140px',
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'rgba(239, 68, 68, 0.6)',
              fontSize: '13px',
            }}
          >
            TV 28
          </div>

          {/* Mic frequencies (blue bars) */}
          {[300, 340, 380, 420].map((left, i) => (
            <div
              key={`mic-${i}`}
              style={{
                position: 'absolute',
                left: `${left}px`,
                top: '30px',
                width: '6px',
                height: '120px',
                background: 'linear-gradient(180deg, #3b82f6, #60a5fa)',
                borderRadius: '3px',
                boxShadow: '0 0 15px rgba(59, 130, 246, 0.6)',
              }}
            />
          ))}

          {/* IEM frequencies (purple bars) */}
          {[620, 680, 740, 800].map((left, i) => (
            <div
              key={`iem-${i}`}
              style={{
                position: 'absolute',
                left: `${left}px`,
                top: '30px',
                width: '6px',
                height: '120px',
                background: 'linear-gradient(180deg, #8b5cf6, #a78bfa)',
                borderRadius: '3px',
                boxShadow: '0 0 15px rgba(139, 92, 246, 0.6)',
              }}
            />
          ))}

          {/* Scale */}
          <div
            style={{
              position: 'absolute',
              bottom: '8px',
              left: '20px',
              right: '20px',
              display: 'flex',
              justifyContent: 'space-between',
              color: '#64748b',
              fontSize: '11px',
              fontFamily: 'ui-monospace, monospace',
            }}
          >
            <span>470</span>
            <span>500</span>
            <span>530</span>
            <span>560</span>
            <span>590</span>
            <span>608 MHz</span>
          </div>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: '30px', marginTop: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '2px', background: '#3b82f6' }} />
            <span style={{ color: '#94a3b8', fontSize: '12px' }}>Wireless Mics</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '2px', background: '#8b5cf6' }} />
            <span style={{ color: '#94a3b8', fontSize: '12px' }}>IEMs</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '2px', background: 'rgba(239, 68, 68, 0.4)' }} />
            <span style={{ color: '#94a3b8', fontSize: '12px' }}>TV Channels</span>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            marginTop: 'auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span style={{ color: '#475569', fontSize: '14px' }}>Built for touring professionals</span>
          <span style={{ color: '#64748b', fontSize: '14px', fontFamily: 'ui-monospace, monospace' }}>
            rf-scout.vercel.app
          </span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}

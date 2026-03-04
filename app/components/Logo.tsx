interface LogoProps {
  variant?: 'light' | 'dark'
  size?: 'sm' | 'md' | 'lg'
  showWordmark?: boolean
}

const SIZES = {
  sm: { shield: { w: 22, h: 26 }, font: '16px', gap: '8px' },
  md: { shield: { w: 30, h: 36 }, font: '22px', gap: '11px' },
  lg: { shield: { w: 44, h: 52 }, font: '32px', gap: '14px' },
}

export default function Logo({ variant = 'light', size = 'md', showWordmark = true }: LogoProps) {
  const s = SIZES[size]
  const isDark = variant === 'dark'

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: s.gap, userSelect: 'none' }}>

      {/* SHIELD */}
      <svg
        width={s.shield.w}
        height={s.shield.h}
        viewBox="0 0 60 72"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0 }}
      >
        {/* Drop shadow */}
        <path
          d="M30 4 L56 13 L56 38 C56 55 44 66 30 70 C16 66 4 55 4 38 L4 13 Z"
          fill={isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.13)'}
          transform="translate(1,2)"
        />
        {/* Shield body */}
        <path
          d="M30 4 L56 13 L56 38 C56 55 44 66 30 70 C16 66 4 55 4 38 L4 13 Z"
          fill={isDark ? 'rgba(255,255,255,0.11)' : '#0B1F5B'}
        />
        {/* Stars canton */}
        <path
          d="M30 4 L56 13 L56 30 L4 30 L4 13 Z"
          fill={isDark ? 'rgba(255,255,255,0.09)' : '#0D2266'}
        />
        <line x1="4" y1="30" x2="56" y2="30" stroke="rgba(255,255,255,0.14)" strokeWidth="0.5" />

        {/* 3 stars in arc — LEFT */}
        <polygon fill="white" points="20,18.0 20.99,20.63 23.80,20.76 21.62,22.25 22.35,25.24 20,23.60 17.65,25.24 18.38,22.25 16.20,20.76 19.01,20.63" />
        {/* CENTER (arc peak — 1.5px higher) */}
        <polygon fill="white" points="30,16.5 30.99,19.13 33.80,19.26 31.62,20.75 32.35,23.74 30,22.10 27.65,23.74 28.38,20.75 26.20,19.26 29.01,19.13" />
        {/* RIGHT */}
        <polygon fill="white" points="40,18.0 40.99,20.63 43.80,20.76 41.62,22.25 42.35,25.24 40,23.60 37.65,25.24 38.38,22.25 36.20,20.76 39.01,20.63" />

        {/* Red stripe */}
        <rect x="4" y="30" width="52" height="7"  fill="#C0182A" />
        {/* White stripe */}
        <rect x="4" y="37" width="52" height="6"  fill="#FFFFFF" />
        {/* Red stripe */}
        <rect x="4" y="43" width="52" height="7"  fill="#C0182A" />
        {/* White stripe */}
        <rect x="4" y="50" width="52" height="5"  fill="#FFFFFF" />

        {/* Green base */}
        <path
          d="M4 55 L56 55 L56 38 C56 55 44 66 30 70 C16 66 4 55 4 38 Z"
          fill="#1DB954"
        />
        {/* Dollar sign */}
        <text
          x="30" y="65"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="12"
          fill="white"
          fontFamily="'Plus Jakarta Sans', sans-serif"
          fontWeight="900"
        >$</text>

        {/* Shield border */}
        <path
          d="M30 4 L56 13 L56 38 C56 55 44 66 30 70 C16 66 4 55 4 38 L4 13 Z"
          stroke="rgba(255,255,255,0.17)"
          strokeWidth="1.2"
          fill="none"
        />
        {/* Top sheen */}
        <path
          d="M30 4 L56 13 L56 22 C44 20 30 18 16 20 L4 16 L4 13 Z"
          fill="rgba(255,255,255,0.06)"
        />
      </svg>

      {/* WORDMARK */}
      {showWordmark && (
        <span style={{
          fontFamily: "var(--font-plus-jakarta), 'Plus Jakarta Sans', sans-serif",
          fontWeight: 800,
          lineHeight: 1,
          letterSpacing: '-0.035em',
          fontSize: s.font,
          display: 'flex',
          alignItems: 'baseline',
        }}>
          <span style={{ color: '#1DB954' }}>Take</span>
          <span style={{ color: isDark ? 'rgba(255,255,255,0.93)' : '#0B1F5B' }}>Home</span>
          <span style={{ color: '#C0182A' }}>U</span>
          <span style={{
            color: '#FFFFFF',
            WebkitTextStroke: isDark ? '0px' : '1.5px #0B1F5B',
            paintOrder: 'stroke fill',
          }}>S</span>
          <span style={{ color: isDark ? '#6ba3ff' : '#0B1F5B' }}>A</span>
        </span>
      )}

    </div>
  )
}

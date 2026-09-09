import React from 'react';

interface NeonButterflyProps {
  size?: number; // width in px
  variant?: 'cyan' | 'purple' | 'magenta' | 'gold';
  flightDuration?: number; // seconds
  flutterSpeed?: number; // seconds
  delay?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const NeonButterfly: React.FC<NeonButterflyProps> = ({
  size = 54,
  variant = 'cyan',
  flutterSpeed = 0.35,
  flightDuration = 4,
  delay = 0,
  className = '',
  style = {}
}) => {
  // Color palette definitions based on neon variant
  const palette = {
    cyan: {
      primary: '#00f2fe',
      secondary: '#4facfe',
      core: '#e0f7ff',
      glow: 'rgba(0, 242, 254, 0.85)',
      deepGlow: 'rgba(79, 172, 254, 0.45)',
      veins: '#ffffff'
    },
    purple: {
      primary: '#b721ff',
      secondary: '#21d4fd',
      core: '#f3e8ff',
      glow: 'rgba(183, 33, 255, 0.85)',
      deepGlow: 'rgba(33, 212, 253, 0.45)',
      veins: '#ffffff'
    },
    magenta: {
      primary: '#ff007f',
      secondary: '#7928ca',
      core: '#ffe4f1',
      glow: 'rgba(255, 0, 127, 0.85)',
      deepGlow: 'rgba(121, 40, 202, 0.45)',
      veins: '#ffffff'
    },
    gold: {
      primary: '#ffd700',
      secondary: '#ff8800',
      core: '#fffdf0',
      glow: 'rgba(255, 215, 0, 0.85)',
      deepGlow: 'rgba(255, 136, 0, 0.45)',
      veins: '#ffffff'
    }
  }[variant];

  const height = size * 0.82;

  return (
    <div
      className={`inline-block select-none pointer-events-none ${className}`}
      style={{
        width: size,
        height: height,
        perspective: '600px',
        animation: `neon-butterfly-flight ${flightDuration}s ease-in-out infinite alternate ${delay}s`,
        filter: `drop-shadow(0 0 6px ${palette.glow}) drop-shadow(0 0 14px ${palette.deepGlow})`,
        ...style
      }}
    >
      <svg
        viewBox="0 0 100 82"
        width="100%"
        height="100%"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="overflow-visible"
      >
        <defs>
          {/* Wing Gradients */}
          <linearGradient id={`neon-wing-grad-${variant}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={palette.core} stopOpacity="0.95" />
            <stop offset="40%" stopColor={palette.primary} stopOpacity="0.8" />
            <stop offset="100%" stopColor={palette.secondary} stopOpacity="0.6" />
          </linearGradient>

          <linearGradient id={`neon-body-grad-${variant}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="50%" stopColor={palette.primary} />
            <stop offset="100%" stopColor={palette.secondary} />
          </linearGradient>

          {/* Glow filter */}
          <filter id={`neon-blur-${variant}`} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Global butterfly group */}
        <g transform="translate(50, 41)">
          {/* LEFT WINGS (Flapping in 3D perspective) */}
          <g
            style={{
              transformOrigin: '0px 0px',
              animation: `neon-wing-flap-left ${flutterSpeed}s ease-in-out infinite alternate`
            }}
          >
            {/* Top Forewing */}
            <path
              d="M 0, -4 C -12, -26 -36, -38 -48, -26 C -56, -16 -46, 6 -28, 8 C -14, 10 -2, 4 0, 0 Z"
              fill={`url(#neon-wing-grad-${variant})`}
              stroke={palette.primary}
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
            {/* Forewing Neon Veins */}
            <path
              d="M 0, -2 C -18, -12 -38, -18 -44, -22 M -20, -10 C -34, -6 -42, -2 -42, 3 M -12, -4 C -22, 2 -32, 6 -26, 7"
              stroke={palette.veins}
              strokeWidth="0.75"
              strokeOpacity="0.75"
              fill="none"
            />

            {/* Bottom Hindwing */}
            <path
              d="M 0, 2 C -12, 6 -32, 10 -34, 22 C -36, 32 -18, 38 -6, 26 C -2, 20 0, 10 0, 2 Z"
              fill={`url(#neon-wing-grad-${variant})`}
              stroke={palette.primary}
              strokeWidth="1.1"
              strokeLinejoin="round"
              opacity="0.85"
            />
            {/* Hindwing Veins */}
            <path
              d="M 0, 4 C -14, 14 -24, 22 -26, 26 M -10, 16 C -18, 24 -14, 30 -8, 26"
              stroke={palette.veins}
              strokeWidth="0.65"
              strokeOpacity="0.7"
              fill="none"
            />

            {/* Wing edge neon sparkle dots */}
            <circle cx="-47" cy="-24" r="1.2" fill="#fff" />
            <circle cx="-42" cy="-6" r="1" fill={palette.primary} />
            <circle cx="-33" cy="24" r="1.1" fill="#fff" />
          </g>

          {/* RIGHT WINGS (Flapping symmetrically in 3D perspective) */}
          <g
            style={{
              transformOrigin: '0px 0px',
              animation: `neon-wing-flap-right ${flutterSpeed}s ease-in-out infinite alternate`
            }}
          >
            {/* Top Forewing */}
            <path
              d="M 0, -4 C 12, -26 36, -38 48, -26 C 56, -16 46, 6 28, 8 C 14, 10 2, 4 0, 0 Z"
              fill={`url(#neon-wing-grad-${variant})`}
              stroke={palette.primary}
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
            {/* Forewing Neon Veins */}
            <path
              d="M 0, -2 C 18, -12 38, -18 44, -22 M 20, -10 C 34, -6 42, -2 42, 3 M 12, -4 C 22, 2 32, 6 26, 7"
              stroke={palette.veins}
              strokeWidth="0.75"
              strokeOpacity="0.75"
              fill="none"
            />

            {/* Bottom Hindwing */}
            <path
              d="M 0, 2 C 12, 6 32, 10 34, 22 C 36, 32 18, 38 6, 26 C 2, 20 0, 10 0, 2 Z"
              fill={`url(#neon-wing-grad-${variant})`}
              stroke={palette.primary}
              strokeWidth="1.1"
              strokeLinejoin="round"
              opacity="0.85"
            />
            {/* Hindwing Veins */}
            <path
              d="M 0, 4 C 14, 14 24, 22 26, 26 M 10, 16 C 18, 24 14, 30 8, 26"
              stroke={palette.veins}
              strokeWidth="0.65"
              strokeOpacity="0.7"
              fill="none"
            />

            {/* Wing edge neon sparkle dots */}
            <circle cx="47" cy="-24" r="1.2" fill="#fff" />
            <circle cx="42" cy="-6" r="1" fill={palette.primary} />
            <circle cx="33" cy="24" r="1.1" fill="#fff" />
          </g>

          {/* CENTRAL BODY & HEAD (Illuminated neon core) */}
          {/* Abdomen & Thorax */}
          <ellipse cx="0" cy="5" rx="2.2" ry="12" fill={`url(#neon-body-grad-${variant})`} />
          <ellipse cx="0" cy="5" rx="1.1" ry="10" fill="#ffffff" opacity="0.9" />

          {/* Head */}
          <circle cx="0" cy="-8" r="2.6" fill="#ffffff" />
          <circle cx="0" cy="-8" r="3.2" stroke={palette.primary} strokeWidth="0.8" fill="none" />

          {/* Antennae with glowing tips */}
          <path
            d="M -0.8, -9.5 Q -4, -18 -9, -21 M 0.8, -9.5 Q 4, -18 9, -21"
            stroke={palette.primary}
            strokeWidth="0.9"
            strokeLinecap="round"
            fill="none"
          />
          <circle cx="-9" cy="-21" r="1.2" fill="#ffffff" />
          <circle cx="9" cy="-21" r="1.2" fill="#ffffff" />
        </g>
      </svg>
    </div>
  );
};

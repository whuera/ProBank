import React from 'react';

interface Props {
  size?: number;
  className?: string;
}

export const ProFinanceLogo: React.FC<Props> = ({ size = 48, className }) => {
  const id = `pfGrad_${size}`;
  const idInner = `pfGradInner_${size}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="ProFinance logo"
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1f6feb" />
          <stop offset="55%" stopColor="#58a6ff" />
          <stop offset="100%" stopColor="#a371f7" />
        </linearGradient>
        <linearGradient id={idInner} x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="rgba(255,255,255,0.18)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
      </defs>

      {/* Hexagon base */}
      <polygon
        points="24,2 43,13 43,35 24,46 5,35 5,13"
        fill={`url(#${id})`}
      />
      {/* Inner light overlay for depth */}
      <polygon
        points="24,2 43,13 43,35 24,46 5,35 5,13"
        fill={`url(#${idInner})`}
      />
      {/* Subtle border */}
      <polygon
        points="24,2 43,13 43,35 24,46 5,35 5,13"
        fill="none"
        stroke="rgba(255,255,255,0.28)"
        strokeWidth="1"
      />

      {/* Stylized "P" — stem + bowl */}
      <rect x="14" y="15" width="3" height="18" rx="1.5" fill="white" />
      <path
        d="M17 15 h5 a5.5 5.5 0 0 1 0 11 h-5 Z"
        fill="white"
      />

      {/* Accent bar (financial upward stroke) */}
      <rect x="25" y="26" width="9" height="2.5" rx="1.25" fill="rgba(255,255,255,0.75)" />
      <rect x="25" y="30.5" width="7" height="2.5" rx="1.25" fill="rgba(255,255,255,0.5)" />
    </svg>
  );
};

import React from 'react';

interface CodeElevateLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  showSubtitle?: boolean;
  className?: string;
}

export const CodeElevateIcon: React.FC<{ size?: number; className?: string }> = ({
  size = 36,
  className = ''
}) => {
  return (
    <svg
      viewBox="0 0 256 256"
      width={size}
      height={size}
      className={`shrink-0 ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="logoBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#181820" />
          <stop offset="100%" stopColor="#09090d" />
        </linearGradient>
        <linearGradient id="logoCoral" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#FF3E24" />
          <stop offset="50%" stopColor="#FF5A43" />
          <stop offset="100%" stopColor="#FF7B69" />
        </linearGradient>
        <filter id="logoGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Dark Squircle Tile */}
      <rect
        x="12"
        y="12"
        width="232"
        height="232"
        rx="52"
        fill="url(#logoBg)"
        stroke="#2A2A38"
        strokeWidth="3.5"
      />

      {/* White Code Bracket "<" */}
      <path
        d="M 116 76 L 62 128 L 116 180"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="20"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Radiant Glow Behind Arrow */}
      <path
        d="M 44 200 L 92 146 L 126 172 L 176 102 L 202 68"
        fill="none"
        stroke="#FF5A43"
        strokeWidth="22"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.35"
        filter="url(#logoGlow)"
      />

      {/* Main Coral Trend Track */}
      <path
        d="M 44 200 L 92 146 L 126 172 L 176 102 L 202 68"
        fill="none"
        stroke="url(#logoCoral)"
        strokeWidth="15"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Tracking Node Dots */}
      <circle cx="92" cy="146" r="6.5" fill="#FFFFFF" stroke="#FF5A43" strokeWidth="3" />
      <circle cx="126" cy="172" r="6.5" fill="#FFFFFF" stroke="#FF5A43" strokeWidth="3" />
      <circle cx="176" cy="102" r="6.5" fill="#FFFFFF" stroke="#FF5A43" strokeWidth="3" />

      {/* Coral Arrowhead */}
      <path
        d="M 184 46 L 222 58 L 210 96 Z"
        fill="#FF5A43"
        stroke="#FF7B69"
        strokeWidth="2"
      />

      {/* Star glyph inside arrow */}
      <path
        d="M 206 60 L 208.5 65.5 L 214 66 L 209.8 70 L 211 75.5 L 206 72.5 L 201 75.5 L 202.2 70 L 198 66 L 203.5 65.5 Z"
        fill="#0E0E14"
      />
    </svg>
  );
};

export const CodeElevateLogo: React.FC<CodeElevateLogoProps> = ({
  size = 'md',
  showText = true,
  showSubtitle = true,
  className = ''
}) => {
  const pixelSizes = {
    sm: 30,
    md: 40,
    lg: 52,
    xl: 68
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl',
    xl: 'text-3xl'
  };

  const subtitleSizes = {
    sm: 'text-[8px] tracking-[0.2em]',
    md: 'text-[9.5px] tracking-[0.24em]',
    lg: 'text-[11px] tracking-[0.28em]',
    xl: 'text-xs tracking-[0.3em]'
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <CodeElevateIcon size={pixelSizes[size]} className="shadow-lg shadow-coral-500/10" />
      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 leading-none">
            <span className={`font-black tracking-tight text-white ${textSizes[size]}`}>
              CODE
            </span>
            <span className={`font-black tracking-tight text-[#FF5A43] ${textSizes[size]}`}>
              ELEVATE
            </span>
          </div>
          {showSubtitle && (
            <span className={`font-bold uppercase text-slate-400 mt-0.5 ${subtitleSizes[size]}`}>
              Performance Tracking
            </span>
          )}
        </div>
      )}
    </div>
  );
};

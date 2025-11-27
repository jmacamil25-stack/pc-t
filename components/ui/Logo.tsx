
import React from 'react';

interface LogoProps {
  className?: string;
  variant?: 'dark' | 'light';
  monochrome?: boolean;
}

const Logo: React.FC<LogoProps> = ({ className, variant = 'dark', monochrome = false }) => {
  // Determine colors based on props
  const mainFill = monochrome ? "transparent" : "white";
  const strokeColor = monochrome ? "black" : "#000000";
  const accentColor = monochrome ? "black" : "#1E63FF";
  const mountainBase = monochrome ? "black" : "#000000";
  const peakFill = monochrome ? "transparent" : "white";
  const peakStroke = monochrome ? "black" : "none";
  const peakStrokeWidth = monochrome ? "2" : "0";

  return (
    <svg
      viewBox="0 0 300 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Pacific Cars and Trucks Logo"
    >
      {/* Hexagon Badge Background */}
      <path
        d="M30 60 L60 10 H240 L270 60 L240 110 H60 L30 60Z"
        fill={mainFill}
        stroke={strokeColor}
        strokeWidth="6"
        strokeLinejoin="round"
      />

      {/* "Pacific" Script Text */}
      <text
        x="150"
        y="55"
        textAnchor="middle"
        fontFamily="'Brush Script MT', cursive"
        fontWeight="bold"
        fontStyle="italic"
        fontSize="60"
        fill={accentColor}
        style={{ textShadow: monochrome ? 'none' : '1px 1px 0px rgba(0,0,0,0.1)' }}
      >
        Pacific
      </text>

      {/* "Cars & Trucks" Text */}
      <text
        x="150"
        y="75"
        textAnchor="middle"
        fontFamily="'Poppins', sans-serif"
        fontWeight="700"
        fontSize="14"
        fill={accentColor}
        letterSpacing="1"
      >
        Cars & Trucks
      </text>

      {/* Speed Lines Left */}
      <line x1="70" y1="88" x2="110" y2="88" stroke={strokeColor} strokeWidth="2" />
      <line x1="75" y1="94" x2="100" y2="94" stroke={strokeColor} strokeWidth="2" />

      {/* Speed Lines Right */}
      <line x1="190" y1="88" x2="230" y2="88" stroke={strokeColor} strokeWidth="2" />
      <line x1="200" y1="94" x2="225" y2="94" stroke={strokeColor} strokeWidth="2" />

      {/* Bottom Mountain Arc */}
      <path
        d="M110 110 Q150 70 190 110"
        fill={mountainBase}
        stroke="none"
      />
       <path
        d="M112 110 Q150 75 188 110"
        fill={accentColor}
        stroke="none"
      />

      {/* Mountain Peaks (White inside Blue Arc) */}
      <path
        d="M150 80 L160 110 H140 L150 80Z"
        fill={peakFill}
        stroke={peakStroke}
        strokeWidth={peakStrokeWidth}
      />
      <path
        d="M135 90 L145 110 H125 L135 90Z"
        fill={peakFill}
        stroke={peakStroke}
        strokeWidth={peakStrokeWidth}
      />
      <path
        d="M165 90 L175 110 H155 L165 90Z"
        fill={peakFill}
        stroke={peakStroke}
        strokeWidth={peakStrokeWidth}
      />
    </svg>
  );
};

export default Logo;

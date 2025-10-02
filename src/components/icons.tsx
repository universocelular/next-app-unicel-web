import type { SVGProps } from "react";

export function BrandIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 120 120"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <defs>
        <linearGradient id="apple-grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#e5e7eb" />
          <stop offset="50%" stopColor="#d1d5db" />
          <stop offset="100%" stopColor="#9ca3af" />
        </linearGradient>
        <linearGradient id="android-grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#84cc16" />
          <stop offset="100%" stopColor="#65a30d" />
        </linearGradient>
        <linearGradient id="lock-grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="2" dy="3" stdDeviation="3" floodColor="#000" floodOpacity="0.3"/>
        </filter>
      </defs>
      
      {/* Apple Logo Shape */}
      <g filter="url(#shadow)">
        <path d="M60 15 C 45 15, 35 25, 35 40 C 35 55, 45 65, 60 65 C 75 65, 85 55, 85 40 C 85 25, 75 15, 60 15 Z" 
              fill="url(#apple-grad)" stroke="#6b7280" strokeWidth="1"/>
        
        {/* Apple bite */}
        <circle cx="75" cy="35" r="8" fill="white"/>
        
        {/* Apple leaf */}
        <ellipse cx="65" cy="12" rx="3" ry="6" fill="url(#apple-grad)" transform="rotate(25 65 12)"/>
      </g>
      
      {/* Android Character */}
      <g transform="translate(25, 25)">
        {/* Android body */}
        <ellipse cx="15" cy="25" rx="12" ry="15" fill="url(#android-grad)"/>
        
        {/* Android head */}
        <circle cx="15" cy="12" r="8" fill="url(#android-grad)"/>
        
        {/* Android eyes */}
        <circle cx="12" cy="10" r="1.5" fill="white"/>
        <circle cx="18" cy="10" r="1.5" fill="white"/>
        
        {/* Android antennae */}
        <line x1="10" y1="6" x2="8" y2="2" stroke="url(#android-grad)" strokeWidth="2" strokeLinecap="round"/>
        <line x1="20" y1="6" x2="22" y2="2" stroke="url(#android-grad)" strokeWidth="2" strokeLinecap="round"/>
        
        {/* Android arms */}
        <ellipse cx="5" cy="20" rx="3" ry="8" fill="url(#android-grad)"/>
        <ellipse cx="25" cy="20" rx="3" ry="8" fill="url(#android-grad)"/>
        
        {/* Android legs */}
        <ellipse cx="10" cy="35" rx="3" ry="8" fill="url(#android-grad)"/>
        <ellipse cx="20" cy="35" rx="3" ry="8" fill="url(#android-grad)"/>
      </g>
      
      {/* Lock Icon */}
      <g transform="translate(65, 45)">
        <rect x="0" y="8" width="16" height="12" rx="2" fill="url(#lock-grad)" stroke="#d97706" strokeWidth="1"/>
        <path d="M4 8 V 5 a 4 4 0 1 1 8 0 V 8" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="8" cy="14" r="2" fill="#d97706"/>
      </g>
    </svg>
  );
}

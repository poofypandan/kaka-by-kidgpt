import React from 'react';

interface KoalaProps {
  className?: string;
  style?: React.CSSProperties;
}

// Floating Koala - gentle and welcoming
export const FloatingKoala = ({ className = "", style }: KoalaProps) => (
  <div className={`koala-floating ${className}`} style={style}>
    <svg viewBox="0 0 100 120" className="w-16 h-20 drop-shadow-sm">
      {/* Body */}
      <ellipse cx="50" cy="85" rx="20" ry="25" fill="hsl(25 15% 75%)" />
      
      {/* Head */}
      <circle cx="50" cy="45" r="25" fill="hsl(25 15% 75%)" />
      
      {/* Ears */}
      <circle cx="35" cy="30" r="12" fill="hsl(25 15% 75%)" />
      <circle cx="65" cy="30" r="12" fill="hsl(25 15% 75%)" />
      <circle cx="35" cy="30" r="7" fill="hsl(340 50% 85%)" />
      <circle cx="65" cy="30" r="7" fill="hsl(340 50% 85%)" />
      
      {/* Eyes */}
      <circle cx="42" cy="42" r="3" fill="#000" className="koala-eyes" />
      <circle cx="58" cy="42" r="3" fill="#000" className="koala-eyes" />
      <circle cx="42.5" cy="41.5" r="1" fill="#fff" />
      <circle cx="58.5" cy="41.5" r="1" fill="#fff" />
      
      {/* Nose */}
      <ellipse cx="50" cy="50" rx="2" ry="1.5" fill="#000" />
      
      {/* Mouth */}
      <path d="M 47 53 Q 50 56 53 53" stroke="#000" strokeWidth="1" fill="none" strokeLinecap="round" />
      
      {/* Arms */}
      <ellipse cx="30" cy="70" rx="6" ry="15" fill="hsl(25 15% 75%)" transform="rotate(-20 30 70)" />
      <ellipse cx="70" cy="70" rx="6" ry="15" fill="hsl(25 15% 75%)" transform="rotate(20 70 70)" />
      
      {/* Paws */}
      <circle cx="26" cy="82" r="4" fill="hsl(25 30% 60%)" />
      <circle cx="74" cy="82" r="4" fill="hsl(25 30% 60%)" />
    </svg>
  </div>
);

// Waving Koala - friendly greeting
export const WavingKoala = ({ className = "", style }: KoalaProps) => (
  <div className={`koala-swaying ${className}`} style={style}>
    <svg viewBox="0 0 100 120" className="w-14 h-18 drop-shadow-sm">
      {/* Body */}
      <ellipse cx="50" cy="85" rx="18" ry="22" fill="hsl(25 15% 75%)" />
      
      {/* Head */}
      <circle cx="50" cy="45" r="22" fill="hsl(25 15% 75%)" />
      
      {/* Ears */}
      <circle cx="35" cy="28" r="10" fill="hsl(25 15% 75%)" />
      <circle cx="65" cy="28" r="10" fill="hsl(25 15% 75%)" />
      <circle cx="35" cy="28" r="6" fill="hsl(340 50% 85%)" />
      <circle cx="65" cy="28" r="6" fill="hsl(340 50% 85%)" />
      
      {/* Eyes */}
      <circle cx="42" cy="42" r="2.5" fill="#000" />
      <circle cx="58" cy="42" r="2.5" fill="#000" />
      <circle cx="42.5" cy="41.5" r="0.8" fill="#fff" />
      <circle cx="58.5" cy="41.5" r="0.8" fill="#fff" />
      
      {/* Nose */}
      <ellipse cx="50" cy="48" rx="1.5" ry="1" fill="#000" />
      
      {/* Happy mouth */}
      <path d="M 46 51 Q 50 54 54 51" stroke="#000" strokeWidth="1" fill="none" strokeLinecap="round" />
      
      {/* Arms - one waving */}
      <ellipse cx="32" cy="68" rx="5" ry="12" fill="hsl(25 15% 75%)" transform="rotate(-30 32 68)" />
      <ellipse cx="68" cy="55" rx="5" ry="12" fill="hsl(25 15% 75%)" transform="rotate(-45 68 55)" />
      
      {/* Paws */}
      <circle cx="28" cy="78" r="3.5" fill="hsl(25 30% 60%)" />
      <circle cx="75" cy="48" r="3.5" fill="hsl(25 30% 60%)" />
    </svg>
  </div>
);

// Sleeping Koala - peaceful and calm
export const SleepingKoala = ({ className = "", style }: KoalaProps) => (
  <div className={`koala-sleeping ${className}`} style={style}>
    <svg viewBox="0 0 100 120" className="w-12 h-16 drop-shadow-sm">
      {/* Body */}
      <ellipse cx="50" cy="85" rx="16" ry="20" fill="hsl(25 15% 75%)" />
      
      {/* Head */}
      <circle cx="50" cy="45" r="20" fill="hsl(25 15% 75%)" />
      
      {/* Ears */}
      <circle cx="37" cy="30" r="9" fill="hsl(25 15% 75%)" />
      <circle cx="63" cy="30" r="9" fill="hsl(25 15% 75%)" />
      <circle cx="37" cy="30" r="5" fill="hsl(340 50% 85%)" />
      <circle cx="63" cy="30" r="5" fill="hsl(340 50% 85%)" />
      
      {/* Closed eyes */}
      <path d="M 38 42 Q 42 44 46 42" stroke="#000" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M 54 42 Q 58 44 62 42" stroke="#000" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      
      {/* Nose */}
      <ellipse cx="50" cy="48" rx="1.5" ry="1" fill="#000" />
      
      {/* Content mouth */}
      <path d="M 48 51 Q 50 52 52 51" stroke="#000" strokeWidth="1" fill="none" strokeLinecap="round" />
      
      {/* Arms curled up */}
      <ellipse cx="35" cy="70" rx="4" ry="10" fill="hsl(25 15% 75%)" transform="rotate(-10 35 70)" />
      <ellipse cx="65" cy="70" rx="4" ry="10" fill="hsl(25 15% 75%)" transform="rotate(10 65 70)" />
      
      {/* Z's for sleeping */}
      <text x="65" y="25" fontSize="8" fill="hsl(210 15% 60%)" className="animate-twinkle">Z</text>
      <text x="70" y="20" fontSize="6" fill="hsl(210 15% 60%)" className="animate-twinkle" style={{ animationDelay: '0.5s' }}>z</text>
      <text x="74" y="16" fontSize="4" fill="hsl(210 15% 60%)" className="animate-twinkle" style={{ animationDelay: '1s' }}>z</text>
    </svg>
  </div>
);

// Decorative Elements
export const TwinkleStar = ({ className = "", style }: KoalaProps) => (
  <div className={`twinkle-star ${className}`} style={style}>
    <svg viewBox="0 0 20 20" className="w-4 h-4">
      <path d="M10 0 L12 8 L20 10 L12 12 L10 20 L8 12 L0 10 L8 8 Z" fill="hsl(50 80% 70%)" />
    </svg>
  </div>
);

export const FloatingHeart = ({ className = "", style }: KoalaProps) => (
  <div className={`float-decoration ${className}`} style={style}>
    <svg viewBox="0 0 20 20" className="w-3 h-3">
      <path d="M10 17 C10 17 3 11 3 6.5 C3 4 5 2 7.5 2 C9 2 10 3 10 3 C10 3 11 2 12.5 2 C15 2 17 4 17 6.5 C17 11 10 17 10 17 Z" 
            fill="hsl(340 60% 80%)" />
    </svg>
  </div>
);

export const FloatingCloud = ({ className = "", style }: KoalaProps) => (
  <div className={`float-decoration ${className}`} style={style}>
    <svg viewBox="0 0 60 30" className="w-8 h-4">
      <ellipse cx="15" cy="20" rx="8" ry="6" fill="hsl(210 30% 90%)" />
      <ellipse cx="25" cy="15" rx="10" ry="8" fill="hsl(210 30% 90%)" />
      <ellipse cx="35" cy="18" rx="8" ry="6" fill="hsl(210 30% 90%)" />
      <ellipse cx="45" cy="20" rx="6" ry="5" fill="hsl(210 30% 90%)" />
    </svg>
  </div>
);
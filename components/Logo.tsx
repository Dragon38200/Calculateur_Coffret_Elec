import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className = "h-12" }) => {
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      {/* Reproduction vectorielle du logo Mounier (M Bleu + Éclair) */}
      <svg viewBox="0 0 100 110" className="h-full w-auto drop-shadow-md" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Le M bleu */}
        <path d="M10 100V20L35 60L50 85L65 60L90 20V100" stroke="#007bff" strokeWidth="18" strokeLinecap="square" strokeLinejoin="round"/>
        {/* L'éclair (Noir/Sombre avec contour clair pour le contraste sur fond sombre) */}
        <path d="M65 5L45 45H60L40 95" stroke="black" strokeWidth="6" strokeLinecap="square" strokeLinejoin="miter" className="stroke-slate-900"/>
        <path d="M65 5L45 45H60L40 95" stroke="white" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter"/>
      </svg>
      <span className="text-white font-black tracking-widest text-sm mt-1 uppercase">Mounier</span>
    </div>
  );
};

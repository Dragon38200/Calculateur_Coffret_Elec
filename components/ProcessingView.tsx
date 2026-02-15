import React from 'react';
import { Loader2 } from 'lucide-react';

export const ProcessingView: React.FC = () => {
  return (
    <div className="flex flex-col items-start justify-center py-20 animate-in fade-in duration-700 w-full max-w-3xl">
      <div className="flex items-center gap-4 mb-6">
        <Loader2 className="h-8 w-8 text-brand-lime animate-spin" />
        <h3 className="text-3xl font-light text-white tracking-tight">Analyse en cours...</h3>
      </div>
      
      <div className="space-y-4 w-full">
        <div className="h-px w-full bg-slate-800 relative overflow-hidden">
          <div className="absolute top-0 left-0 h-full w-1/3 bg-brand-lime animate-[shimmer_2s_infinite]"></div>
        </div>
        <p className="text-slate-400 text-lg font-light">
          Notre programme d'analyse de nomenclature génère actuellement les fichiers d'extractions
        </p>
      </div>
      
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(400%); }
        }
      `}</style>
    </div>
  );
};
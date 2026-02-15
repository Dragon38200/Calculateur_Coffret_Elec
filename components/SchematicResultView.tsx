import React from 'react';
import { SchematicAnalysisResult } from '../types';
import { ArrowLeft, Zap, FileText, Activity, Printer } from 'lucide-react';
import { generateSchematicReportPdf } from '../services/reportService';

interface SchematicResultViewProps {
  data: SchematicAnalysisResult;
  onReset: () => void;
  currentUser?: string;
}

export const SchematicResultView: React.FC<SchematicResultViewProps> = ({ data, onReset, currentUser = 'Inconnu' }) => {
  
  const handlePrintReport = () => {
    generateSchematicReportPdf(data, currentUser);
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto animate-in slide-in-from-bottom-12 duration-700 ease-out pb-20">
      
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-6">
        <div>
            <button 
                onClick={onReset}
                className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4 group"
            >
                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                Retour à l'accueil
            </button>
            <h2 className="text-4xl md:text-5xl font-medium text-white tracking-tight leading-tight">
                Analyse <br/> <span className="text-slate-500">Schématique</span>
            </h2>
            {data.documentTitle && (
                <p className="text-slate-400 mt-2 text-lg">Document : {data.documentTitle}</p>
            )}
        </div>

        <div>
            <button
                onClick={handlePrintReport}
                className="flex items-center gap-3 px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold rounded-lg transition-all shadow-lg hover:shadow-brand-lime/10 group backdrop-blur-md"
            >
                <Printer className="h-5 w-5 group-hover:scale-110 transition-transform text-brand-lime" />
                <span>Imprimer le Rapport PDF</span>
            </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {/* Card 1: Total Pages */}
        <div className="bg-slate-900/40 border border-slate-700/50 p-6 rounded-xl backdrop-blur-md hover:border-blue-500/30 transition-colors">
            <div className="flex items-center gap-4 mb-2">
                <div className="p-3 bg-blue-500/10 rounded-lg text-blue-400">
                    <FileText className="h-6 w-6" />
                </div>
                <span className="text-slate-400 text-sm uppercase tracking-wider font-semibold">Pages Totales</span>
            </div>
            <div className="text-4xl font-bold text-white">{data.totalPages}</div>
        </div>

        {/* Card 2: Schematic Pages */}
        <div className="bg-slate-900/40 border border-slate-700/50 p-6 rounded-xl backdrop-blur-md hover:border-brand-lime/30 transition-colors">
            <div className="flex items-center gap-4 mb-2">
                <div className="p-3 bg-brand-lime/10 rounded-lg text-brand-lime">
                    <Zap className="h-6 w-6" />
                </div>
                <span className="text-slate-400 text-sm uppercase tracking-wider font-semibold">Pages Schémas</span>
            </div>
            <div className="text-4xl font-bold text-white">{data.schematicPagesCount}</div>
        </div>

        {/* Card 3: Total Wires */}
        <div className="bg-slate-900/40 border border-slate-700/50 p-6 rounded-xl backdrop-blur-md relative overflow-hidden hover:border-purple-500/30 transition-colors">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
            <div className="flex items-center gap-4 mb-2">
                <div className="p-3 bg-purple-500/10 rounded-lg text-purple-400">
                    <Activity className="h-6 w-6" />
                </div>
                <span className="text-slate-400 text-sm uppercase tracking-wider font-semibold">Total Fils (Est.)</span>
            </div>
            <div className="text-4xl font-bold text-white">{data.totalWires}</div>
            <p className="text-xs text-slate-500 mt-2">Cumul des traits verticaux détectés</p>
        </div>
      </div>

      {/* Detailed Table (Transparent Dark Mode) */}
      <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-lg overflow-hidden shadow-2xl">
        <div className="px-6 py-4 border-b border-white/5 bg-white/5 flex justify-between items-center">
            <h3 className="font-bold text-slate-200">Détail par page</h3>
        </div>
        <div className="overflow-x-auto custom-scrollbar max-h-[60vh]">
          <table className="min-w-full divide-y divide-slate-700/50">
            <thead className="bg-slate-800/80 sticky top-0 z-10 backdrop-blur-md">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider w-20">Page</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider w-32">Type</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Description</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Nb. Fils</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50 text-slate-300">
              {data.pages.map((page, index) => (
                <tr key={index} className={`hover:bg-white/5 transition-colors ${page.isSchematic ? '' : 'opacity-50 bg-slate-900/50'}`}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-200">
                        {page.pageNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {page.isSchematic ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/20">
                                Schéma
                            </span>
                        ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-700 text-slate-300">
                                Autre
                            </span>
                        )}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400">
                        {page.description || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono font-bold text-right text-purple-400">
                        {page.isSchematic ? page.wireCount : '-'}
                    </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
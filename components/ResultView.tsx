import React, { useState, useMemo } from 'react';
import { ExtractionResult } from '../types';
import { Download, ArrowLeft, FileSpreadsheet, FileText, Filter } from 'lucide-react';
import { generateRexelExport, generateBatigestExport, generateAndDownloadExcel } from '../services/excelService';

interface ResultViewProps {
  data: ExtractionResult;
  onExport: () => void;
  onReset: () => void;
}

export const ResultView: React.FC<ResultViewProps> = ({ data, onReset }) => {
  const [selectedFabricant, setSelectedFabricant] = useState<string>('TOUS');

  // 1. Extraire la liste unique des fabricants
  const uniqueFabricants = useMemo(() => {
    const fabricants = data.items
      .map(item => item.fabricant?.trim())
      .filter((f): f is string => !!f && f.length > 0);
    return Array.from(new Set(fabricants)).sort();
  }, [data.items]);

  // 2. Filtrer les items en fonction de la sélection
  const filteredItems = useMemo(() => {
    if (selectedFabricant === 'TOUS') {
      return data.items;
    }
    return data.items.filter(item => item.fabricant?.trim() === selectedFabricant);
  }, [data.items, selectedFabricant]);

  // 3. Créer un objet ExtractionResult virtuel pour les exports filtrés
  const filteredData: ExtractionResult = {
    ...data,
    items: filteredItems
  };

  const handleExportExcel = () => {
    generateAndDownloadExcel(filteredData);
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto animate-in slide-in-from-bottom-12 duration-700 ease-out pb-20">
      
      {/* Header Actions */}
      <div className="flex flex-col xl:flex-row justify-between items-end mb-8 gap-6">
        <div className="w-full xl:w-auto">
          <button 
            onClick={onReset}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4 group"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Retour à l'accueil
          </button>
          <h2 className="text-4xl md:text-5xl font-medium text-white tracking-tight leading-tight">
            Nomenclature<br/> <span className="text-slate-500">Structurée</span>
          </h2>
        </div>

        <div className="flex flex-wrap justify-end gap-3 w-full xl:w-auto">
          <button
            onClick={() => generateRexelExport(filteredData)}
            className="flex items-center gap-2 px-6 py-4 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-200 font-medium hover:bg-slate-700 hover:border-slate-500 transition-all shadow-lg backdrop-blur-sm"
            title="Export CSV (Réf + Qté)"
          >
            <FileText className="h-5 w-5 text-blue-400" />
            Export REXEL
          </button>

          <button
            onClick={() => generateBatigestExport(filteredData)}
            className="flex items-center gap-2 px-6 py-4 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-200 font-medium hover:bg-slate-700 hover:border-slate-500 transition-all shadow-lg backdrop-blur-sm"
            title="Export compatible Batigest"
          >
            <FileSpreadsheet className="h-5 w-5 text-orange-400" />
            BATIGEST
          </button>

          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 px-8 py-4 rounded-lg bg-brand-lime hover:bg-brand-limeHover text-brand-black font-bold text-lg transition-all shadow-lg shadow-brand-lime/20"
          >
            <Download className="h-5 w-5" />
            Exporter Excel
          </button>
        </div>
      </div>

      {/* Info Bar & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-t border-slate-700/50 bg-slate-900/30 backdrop-blur-sm rounded-lg p-6 mb-8">
         
         <div className="flex gap-8 text-slate-400">
            <div>
                <span className="block text-xs uppercase tracking-wider text-slate-500 mb-1">Document</span>
                <span className="text-white font-medium">{data.documentTitle || 'Sans titre'}</span>
            </div>
            <div>
                <span className="block text-xs uppercase tracking-wider text-slate-500 mb-1">Date</span>
                <span className="text-white font-medium">{data.date || 'Non daté'}</span>
            </div>
            <div>
                <span className="block text-xs uppercase tracking-wider text-slate-500 mb-1">Articles</span>
                <span className="text-brand-lime font-mono font-bold text-lg">
                  {filteredItems.length} <span className="text-sm font-normal text-slate-500">/ {data.items.length}</span>
                </span>
            </div>
         </div>

         {/* FILTRE FABRICANT */}
         <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-slate-400">
              <Filter className="h-4 w-4" />
              <span className="text-xs uppercase tracking-wider font-semibold">Filtrer par Fabricant :</span>
            </div>
            <div className="relative">
              <select 
                value={selectedFabricant}
                onChange={(e) => setSelectedFabricant(e.target.value)}
                className="appearance-none bg-slate-800/80 border border-slate-600 text-white py-2 pl-4 pr-10 rounded-lg hover:border-brand-lime focus:outline-none focus:border-brand-lime focus:ring-1 focus:ring-brand-lime transition-colors cursor-pointer min-w-[200px]"
              >
                <option value="TOUS">Tous les fabricants</option>
                {uniqueFabricants.map((fab, idx) => (
                  <option key={idx} value={fab}>{fab}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>
         </div>

      </div>

      {/* Data Table Card (Transparent Dark Mode) */}
      <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-lg overflow-hidden shadow-2xl">
        <div className="overflow-x-auto custom-scrollbar max-h-[70vh]">
          <table className="min-w-full divide-y divide-slate-700/50">
            <thead className="bg-slate-800/80 sticky top-0 z-10 backdrop-blur-md">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-300 uppercase tracking-wider">Référence</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-300 uppercase tracking-wider">Désignation</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-300 uppercase tracking-wider">Fabricant</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-300 uppercase tracking-wider">Qté</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-300 uppercase tracking-wider">Unité</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-300 uppercase tracking-wider">P.U.</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-300 uppercase tracking-wider">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50 text-slate-300">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-20 text-center text-slate-500">
                    {selectedFabricant !== 'TOUS' 
                      ? "Aucun article trouvé pour ce fabricant." 
                      : "Aucune donnée extraite."}
                  </td>
                </tr>
              ) : (
                filteredItems.map((item, index) => (
                  <tr key={index} className="hover:bg-brand-lime/10 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-brand-lime/80">{item.reference || '-'}</td>
                    <td className="px-6 py-4 text-sm font-medium text-white max-w-[300px] break-words">
                      {item.designation}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400 uppercase tracking-wide text-xs">
                      {item.fabricant ? (
                        <span className={`px-2 py-1 rounded-md bg-slate-800 border border-slate-700 font-semibold ${selectedFabricant === item.fabricant?.trim() ? 'border-brand-lime/50 text-brand-lime' : ''}`}>
                          {item.fabricant}
                        </span>
                      ) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-right text-white">{item.quantite}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{item.unite}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right tabular-nums text-slate-400">
                      {item.prixUnitaire ? item.prixUnitaire.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' }) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold tabular-nums text-white">
                      {item.prixTotal ? item.prixTotal.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' }) : '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
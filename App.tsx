import React, { useState } from 'react';
import { Header } from './components/Header';
import { FileUpload } from './components/FileUpload';
import { ProcessingView } from './components/ProcessingView';
import { ResultView } from './components/ResultView';
import { SchematicResultView } from './components/SchematicResultView'; // Import new view
import { LoginView } from './components/LoginView';
import { extractNomenclatureFromPdf, analyzeSchematics } from './services/geminiService';
import { generateAndDownloadExcel } from './services/excelService';
import { AppState, ExtractionResult, SchematicAnalysisResult, AppMode } from './types';
import { AlertTriangle, XCircle, FileSpreadsheet, Activity } from 'lucide-react';

const App: React.FC = () => {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<string>('');
  
  // App Logic State
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [appMode, setAppMode] = useState<AppMode | null>(null); // Track which mode is active
  
  const [extractionResult, setExtractionResult] = useState<ExtractionResult | null>(null);
  const [schematicResult, setSchematicResult] = useState<SchematicAnalysisResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = (username: string) => {
    setCurrentUser(username);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser('');
    handleReset(); // Reset app state on logout
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          const base64String = reader.result.split(',')[1];
          resolve(base64String);
        } else {
          reject(new Error('Failed to convert file to base64'));
        }
      };
      reader.onerror = error => reject(error);
    });
  };

  // --- HANDLER NOMENCLATURE ---
  const handleNomenclatureSelect = async (file: File) => {
    setAppMode(AppMode.NOMENCLATURE);
    setAppState(AppState.PROCESSING);
    setErrorMessage(null);

    try {
      const base64 = await fileToBase64(file);
      const result = await extractNomenclatureFromPdf(base64);
      setExtractionResult(result);
      setAppState(AppState.SUCCESS);
    } catch (error: any) {
      console.error(error);
      setAppState(AppState.ERROR);
      setErrorMessage(
        error.message || "Une erreur technique est survenue lors de l'extraction."
      );
    }
  };

  // --- HANDLER SCHEMATICS ---
  const handleSchematicSelect = async (file: File) => {
    setAppMode(AppMode.SCHEMATIC);
    setAppState(AppState.PROCESSING);
    setErrorMessage(null);

    try {
      const base64 = await fileToBase64(file);
      const result = await analyzeSchematics(base64);
      setSchematicResult(result);
      setAppState(AppState.SUCCESS);
    } catch (error: any) {
      console.error(error);
      setAppState(AppState.ERROR);
      setErrorMessage(
        error.message || "Une erreur technique est survenue lors de l'analyse des schémas."
      );
    }
  };

  const handleReset = () => {
    setAppState(AppState.IDLE);
    setAppMode(null);
    setExtractionResult(null);
    setSchematicResult(null);
    setErrorMessage(null);
  };

  const handleExport = () => {
    if (extractionResult) {
      generateAndDownloadExcel(extractionResult);
    }
  };

  return (
    <div className="min-h-screen bg-brand-black text-slate-200 font-sans selection:bg-brand-lime selection:text-brand-black flex flex-col relative overflow-hidden">
      
      {/* Background Video Layer */}
      <div className="fixed inset-0 w-full h-full z-0 overflow-hidden pointer-events-none">
        <video 
          autoPlay 
          loop 
          muted 
          playsInline 
          className="absolute w-full h-full object-cover scale-105"
        >
          <source src="https://media.istockphoto.com/id/1667456740/fr/vid%C3%A9o/leurope-vue-de-lespace-plan%C3%A8te-terre-population-villes-de-nuit-lumi%C3%A8res-belle-vue-du-globe.mp4?s=mp4-640x640-is&k=20&c=w_IeNsl4HzTRDFQRFuCHujsssUgG_QtMCK0mbBgpzwk=" type="video/mp4" />
        </video>
        
        {/* Darkening Overlays */}
        <div className="absolute inset-0 bg-brand-black/85"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-brand-black via-transparent to-brand-black/60"></div>
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-brand-lime/5 rounded-full blur-[100px] mix-blend-overlay"></div>
      </div>

      <Header isAuthenticated={isAuthenticated} onLogout={handleLogout} currentUser={currentUser} />

      <main className="flex-grow flex flex-col relative z-10 pt-32 px-6 lg:px-12 max-w-[1400px] mx-auto w-full">
        
        {!isAuthenticated ? (
          <LoginView onLogin={handleLogin} />
        ) : (
          <>
            {/* --- IDLE VIEW: DASHBOARD SELECTION --- */}
            {appState === AppState.IDLE && (
              <div className="flex-grow flex flex-col justify-center pb-20 animate-in fade-in duration-700">
                <div className="mb-10 text-center md:text-left">
                  <span className="inline-block px-3 py-1 mb-6 text-xs font-bold tracking-widest text-brand-lime border border-brand-lime/30 rounded bg-brand-lime/10">
                    VERSION 2.1 PRO
                  </span>
                  <h1 className="text-5xl md:text-6xl font-medium tracking-tight text-white mb-4 leading-[0.95] drop-shadow-2xl">
                    Tableau de Bord
                  </h1>
                  <p className="text-xl text-slate-300 font-light max-w-2xl leading-relaxed drop-shadow-md">
                    Sélectionnez le type de traitement à effectuer sur vos fichiers PDF.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl w-full">
                  
                  {/* Option 1: Nomenclature */}
                  <div className="bg-slate-900/40 backdrop-blur-md border border-slate-700/50 rounded-2xl p-8 hover:border-brand-lime/50 transition-all duration-300 group flex flex-col">
                    <div className="flex items-center gap-4 mb-6">
                       <div className="p-3 bg-brand-lime/10 rounded-lg text-brand-lime">
                          <FileSpreadsheet className="h-8 w-8" />
                       </div>
                       <div>
                         <h3 className="text-2xl font-bold text-white">Extraction Nomenclature</h3>
                         <p className="text-sm text-slate-400">Convertir PDF en Excel/CSV</p>
                       </div>
                    </div>
                    <div className="flex-grow">
                       <ul className="space-y-2 mb-8 text-slate-400 text-sm">
                         <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>Détection automatique des tableaux</li>
                         <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>Export compatible Rexel & Batigest</li>
                         <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>Nettoyage intelligent des données</li>
                       </ul>
                    </div>
                    <div className="mt-auto">
                       <FileUpload 
                          onFileSelect={handleNomenclatureSelect} 
                          disabled={false} 
                          title="Extraire Nomenclature"
                          subtitle="Glissez votre devis ou liste de matériel ici"
                       />
                    </div>
                  </div>

                  {/* Option 2: Schémas */}
                  <div className="bg-slate-900/40 backdrop-blur-md border border-slate-700/50 rounded-2xl p-8 hover:border-purple-400/50 transition-all duration-300 group flex flex-col">
                    <div className="flex items-center gap-4 mb-6">
                       <div className="p-3 bg-purple-500/10 rounded-lg text-purple-400">
                          <Activity className="h-8 w-8" />
                       </div>
                       <div>
                         <h3 className="text-2xl font-bold text-white">Analyse Schémas</h3>
                         <p className="text-sm text-slate-400">Statistiques de câblage</p>
                       </div>
                    </div>
                    <div className="flex-grow">
                       <ul className="space-y-2 mb-8 text-slate-400 text-sm">
                         <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>Identification des pages de schémas</li>
                         <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>Comptage des fils (lignes verticales)</li>
                         <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>Rapport de synthèse par page</li>
                       </ul>
                    </div>
                    <div className="mt-auto">
                        <FileUpload 
                          onFileSelect={handleSchematicSelect} 
                          disabled={false}
                          title="Analyser Schémas"
                          subtitle="Glissez votre dossier de plans électriques ici"
                       />
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* --- PROCESSING VIEW --- */}
            {appState === AppState.PROCESSING && (
              <div className="flex-grow flex items-center justify-center">
                <ProcessingView />
              </div>
            )}

            {/* --- ERROR VIEW --- */}
            {appState === AppState.ERROR && (
              <div className="flex-grow flex flex-col items-center justify-center animate-in fade-in duration-300">
                <div className="border border-red-900/50 bg-red-900/20 rounded-none p-8 max-w-lg text-center backdrop-blur-md">
                  <AlertTriangle className="h-10 w-10 text-red-500 mx-auto mb-6" />
                  <h3 className="text-2xl font-medium text-white">Interruption de l'analyse</h3>
                  <p className="mt-3 text-slate-400 text-lg leading-relaxed">{errorMessage}</p>
                  <div className="mt-10">
                    <button
                      onClick={handleReset}
                      className="inline-flex items-center px-8 py-3 bg-white text-brand-black hover:bg-slate-200 font-medium transition-colors"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Réessayer
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* --- SUCCESS VIEWS --- */}
            {appState === AppState.SUCCESS && (
              <>
                {appMode === AppMode.NOMENCLATURE && extractionResult && (
                  <ResultView 
                    data={extractionResult} 
                    onExport={handleExport} 
                    onReset={handleReset} 
                  />
                )}
                
                {appMode === AppMode.SCHEMATIC && schematicResult && (
                  <SchematicResultView 
                    data={schematicResult}
                    onReset={handleReset}
                    currentUser={currentUser}
                  />
                )}
              </>
            )}
          </>
        )}
      </main>

      {/* Footer / Mentions Légales */}
      <footer className="relative z-10 w-full py-6 text-center border-t border-white/5 bg-brand-black/40 backdrop-blur-sm mt-auto">
        <p className="text-slate-500 text-[10px] md:text-xs font-light tracking-wide uppercase">
          Produit développée pour et par le B.E Mounier Automatisme - 27 ZAC de Chassagne 69360 Ternay - Tout Droit Réservée - Copyright 2026
        </p>
      </footer>
    </div>
  );
};

export default App;
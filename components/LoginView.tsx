import React, { useState } from 'react';
import { Logo } from './Logo';
import { ArrowRight, Lock, User } from 'lucide-react';

interface LoginViewProps {
  onLogin: (username: string) => void;
}

// Liste des identifiants valides
const VALID_CREDENTIALS: Record<string, string> = {
  'admin': 'admin',
  'remi': 'remi',
  'arnaud': 'arnaud',
  'yoann': 'yoann',
  'souad': 'souad',
  'dragon': 'dragon',
  'sarah': 'sarah'
};

export const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Vérification simple des identifiants (sensible à la casse pour le mdp, insensible pour le login si souhaité, ici exact)
    const validPassword = VALID_CREDENTIALS[username.trim()];
    
    if (validPassword && validPassword === password.trim()) {
      onLogin(username.trim());
    } else {
      setError('Identifiant ou mot de passe incorrect.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] w-full px-4 animate-in fade-in zoom-in duration-500">
      
      <div className="w-full max-w-md bg-brand-black/40 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl relative overflow-hidden group">
        
        {/* Decorative gradients */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-lime to-transparent opacity-50"></div>
        
        <div className="mb-8 text-center">
           <div className="inline-block p-3 rounded-full bg-white/5 mb-4 border border-white/10">
              <Lock className="h-6 w-6 text-brand-lime" />
           </div>
           <h2 className="text-2xl font-bold text-white mb-2">Connexion</h2>
           <p className="text-slate-400 text-sm">Espace de Chiffrage d'armoires Electriques</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
           <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Identifiant</label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-5 w-5 text-slate-500" />
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-700 text-white rounded-lg py-2.5 pl-10 pr-4 focus:outline-none focus:border-brand-lime focus:ring-1 focus:ring-brand-lime transition-all placeholder:text-slate-600"
                  placeholder="votre identifiant"
                />
              </div>
           </div>
           
           <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-500" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-700 text-white rounded-lg py-2.5 pl-10 pr-4 focus:outline-none focus:border-brand-lime focus:ring-1 focus:ring-brand-lime transition-all placeholder:text-slate-600"
                  placeholder="••••••••"
                />
              </div>
           </div>

           {error && (
             <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center">
               {error}
             </div>
           )}

           <button 
             type="submit"
             className="w-full bg-brand-lime hover:bg-brand-limeHover text-brand-black font-bold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 mt-4"
           >
             <span>Accéder à l'espace</span>
             <ArrowRight className="h-4 w-4" />
           </button>
        </form>
      </div>
      
      <div className="mt-8 text-center">
         <p className="text-slate-500 text-xs">
           &copy; 2025 Mounier &bull; Système d'extraction sécurisé
         </p>
      </div>
    </div>
  );
};
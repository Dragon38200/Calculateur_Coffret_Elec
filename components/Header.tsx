import React from 'react';
import { Logo } from './Logo';
import { LogOut } from 'lucide-react';

interface HeaderProps {
  onLogout?: () => void;
  isAuthenticated?: boolean;
  currentUser?: string;
}

export const Header: React.FC<HeaderProps> = ({ onLogout, isAuthenticated, currentUser }) => {
  return (
    <header className="absolute top-0 w-full z-50 py-6">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="flex justify-between items-start md:items-center">
          
          {/* Logo Area */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 group cursor-pointer">
              <Logo className="h-14 md:h-16" />
            </div>

            {/* User Greeting */}
            {isAuthenticated && currentUser && (
              <div className="hidden md:flex flex-col border-l border-white/10 pl-6 animate-in fade-in slide-in-from-left-4 duration-500">
                <span className="text-slate-400 text-xs uppercase tracking-wider font-semibold">Bonjour</span>
                <span className="text-white font-bold capitalize text-lg tracking-tight">{currentUser}</span>
              </div>
            )}
          </div>
          
          {/* Right Area: Status & Logout */}
          <div className="flex items-center gap-4">
            {isAuthenticated && (
              <>
                <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
                   <div className="w-2 h-2 rounded-full bg-brand-lime shadow-[0_0_8px_rgba(190,242,100,0.6)]"></div>
                   <span className="text-xs text-slate-300 font-medium tracking-wide">SYSTEME PRÊT</span>
                </div>
                
                <button 
                  onClick={onLogout}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 border border-white/10 text-xs font-medium text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
                  title="Déconnexion"
                >
                  <span className="hidden sm:inline">Déconnexion</span>
                  <LogOut className="h-4 w-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
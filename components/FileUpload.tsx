import React, { useRef, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  disabled: boolean;
  title?: string;
  subtitle?: string;
  accentColor?: string; // Pour varier la couleur selon le module
}

export const FileUpload: React.FC<FileUploadProps> = ({ 
  onFileSelect, 
  disabled, 
  title = "Importer un fichier PDF", 
  subtitle = "ou glissez-déposez votre document ici",
  accentColor = "brand-lime"
}) => {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndPassFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      validateAndPassFile(e.target.files[0]);
    }
  };

  const validateAndPassFile = (file: File) => {
    if (file.type !== 'application/pdf') {
      alert("Seuls les fichiers PDF sont acceptés.");
      return;
    }
    onFileSelect(file);
  };

  // Gestion dynamique des classes de couleur (Tailwind ne gère pas bien les props dynamiques concaténées sans safelist, 
  // on utilise donc un style inline ou des classes conditionnelles simplifiées. Ici on garde le style par défaut lime 
  // mais on permettrait d'étendre si besoin. Pour l'instant on reste sur le design system).

  return (
    <div className="w-full h-full flex flex-col">
      <div 
        className={`relative group cursor-pointer transition-all duration-500 ease-out flex-grow flex flex-col
          ${disabled ? 'opacity-50 pointer-events-none' : ''}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !disabled && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept="application/pdf"
          onChange={handleChange}
          disabled={disabled}
        />

        {/* Button-like Appearance for Upload */}
        <div className={`
          relative flex items-center justify-between px-6 py-5 rounded-none border border-brand-lime bg-brand-lime
          hover:bg-brand-limeHover transition-colors duration-300
        `}>
          <span className="text-lg font-semibold text-brand-black tracking-tight">
            {title}
          </span>
          <ArrowUpRight className="h-5 w-5 text-brand-black transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1" />
        </div>

        {/* Drag Area Visual Cue */}
        <div className={`
          flex-grow p-6 border-x border-b border-dashed border-slate-700 rounded-b-lg text-center transition-all duration-300 flex items-center justify-center min-h-[120px]
          ${dragActive ? 'bg-white/5 border-brand-lime' : 'bg-slate-800/20'}
        `}>
           <div className="flex flex-col items-center">
             <p className="text-slate-400 text-sm">
               {subtitle}
             </p>
             {dragActive && <p className="text-brand-lime mt-2 text-sm font-medium">Relâchez pour uploader</p>}
           </div>
        </div>
      </div>
    </div>
  );
};
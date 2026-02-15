import * as XLSX from 'xlsx';
import { ExtractionResult, NomenclatureItem } from '../types';

// Helper pour télécharger un fichier CSV
const downloadCSV = (content: string, filename: string) => {
  // Ajout du BOM pour que Excel reconnaisse l'encodage UTF-8 automatiquement
  const bom = "\uFEFF";
  const blob = new Blob([bom + content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

const getDateString = () => {
  return new Date().toISOString().split('T')[0];
}

export const generateAndDownloadExcel = (data: ExtractionResult) => {
  const { items, documentTitle, date } = data;

  // Format data for Excel
  const rows = items.map(item => ({
    'Référence': item.reference || '',
    'Désignation': item.designation || '',
    'Fabricant': item.fabricant || '',
    'Quantité': item.quantite || 0,
    'Unité': item.unite || '',
    'P.U.': item.prixUnitaire || '',
    'Total': item.prixTotal || '',
    'Remarques': item.remarques || ''
  }));

  // Create worksheet
  const worksheet = XLSX.utils.json_to_sheet(rows);

  // Adjust column widths visually
  const wscols = [
    { wch: 15 }, // Reference
    { wch: 50 }, // Designation
    { wch: 20 }, // Fabricant
    { wch: 10 }, // Quantite
    { wch: 10 }, // Unite
    { wch: 12 }, // PU
    { wch: 12 }, // Total
    { wch: 30 }, // Remarques
  ];
  worksheet['!cols'] = wscols;

  // Create workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Nomenclature");

  // Generate filename
  const cleanTitle = documentTitle ? documentTitle.replace(/[^a-z0-9]/gi, '_').substring(0, 20) : 'Extrait';
  const cleanDate = date ? date.replace(/\//g, '-') : getDateString();
  const filename = `Nomenclature_${cleanTitle}_${cleanDate}.xlsx`;

  // Download
  XLSX.writeFile(workbook, filename);
};

export const generateRexelExport = (data: ExtractionResult) => {
  const { items } = data;
  
  // Format REXEL : Référence ; Quantité
  // Séparateur point-virgule pour compatibilité Excel FR par défaut
  const headers = ["Référence", "Quantité"];
  
  const csvRows = items.map(item => {
    // Échappement des guillemets doubles si nécessaire
    const ref = item.reference ? `"${item.reference.replace(/"/g, '""')}"` : '';
    // Formatage numérique simple pour la quantité
    const qty = item.quantite || 0;
    return `${ref};${qty}`;
  });

  const csvContent = [headers.join(';'), ...csvRows].join('\n');
  const filename = `Export_REXEL_${getDateString()}.csv`;
  
  downloadCSV(csvContent, filename);
};

export const generateBatigestExport = (data: ExtractionResult) => {
  const { items } = data;

  // Format Import BATIGEST spécifique demandé
  // Référence (Fixe: MG-MATP); Désignation (Concat: Des Ref Ref); Unité (Fixe: U); Quantité; P.U.; Total
  const headers = ["Référence", "Désignation", "Unité", "Quantité", "P.U.", "Total"];

  const csvRows = items.map(item => {
    // Référence fixe "MG-MATP"
    const ref = "MG-MATP";
    
    // Désignation concaténée "DESIGNATION Ref REFERENCE"
    const desVal = item.designation || '';
    const refVal = item.reference || '';
    // Escape quotes
    const desCombined = `${desVal} Ref ${refVal}`;
    const des = `"${desCombined.replace(/"/g, '""')}"`;
    
    // Unité fixe "U"
    const unit = "U";
    
    const qty = item.quantite || 0;
    const pu = item.prixUnitaire || 0;
    const total = item.prixTotal || 0;

    return `${ref};${des};${unit};${qty};${pu};${total}`;
  });

  const csvContent = [headers.join(';'), ...csvRows].join('\n');
  const filename = `Export_BATIGEST_${getDateString()}.csv`;

  downloadCSV(csvContent, filename);
};

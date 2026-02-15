import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { SchematicAnalysisResult } from '../types';

export const generateSchematicReportPdf = (data: SchematicAnalysisResult, username: string) => {
  // Initialisation du document PDF
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const dateStr = new Date().toLocaleDateString('fr-FR', { 
    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' 
  });

  // --- 1. HEADER & LOGO ---
  
  // Dessin du Logo Mounier vectoriel (approx. pour PDF)
  // M Bleu
  doc.setDrawColor(0, 123, 255); // Bleu Bootstrap/Mounier
  doc.setLineWidth(2);
  doc.line(15, 25, 15, 10); // Jambe gauche
  doc.line(15, 10, 20, 20); // Diagonale descendante
  doc.line(20, 20, 25, 10); // Diagonale montante
  doc.line(25, 10, 25, 25); // Jambe droite

  // Eclair Stylisé (Noir)
  doc.setDrawColor(30, 41, 59); // Slate 800
  doc.setLineWidth(1);
  doc.line(26, 8, 22, 18);
  doc.line(22, 18, 25, 18);
  doc.line(25, 18, 21, 28);

  // Texte "MOUNIER"
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42); // Slate 900
  doc.text("MOUNIER", 30, 18);
  
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139); // Slate 500
  doc.text("Système d'Analyse Électrique", 30, 22);

  // Ligne de séparation
  doc.setDrawColor(203, 213, 225); // Slate 300
  doc.setLineWidth(0.5);
  doc.line(14, 30, pageWidth - 14, 30);

  // --- 2. INFORMATIONS DU RAPPORT ---

  doc.setFontSize(22);
  doc.setTextColor(15, 23, 42);
  doc.text("Rapport d'Analyse Schématique", 14, 45);

  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105); // Slate 600
  
  // Info Bloc Gauche
  doc.text(`Document analysé :`, 14, 55);
  doc.setFont("helvetica", "normal");
  doc.text(data.documentTitle || "Document sans titre", 50, 55);

  // Info Bloc Droit (Aligné droite)
  const rightX = pageWidth - 14;
  doc.text(`Généré par : ${username.toUpperCase()}`, rightX, 45, { align: 'right' });
  doc.text(`Date : ${dateStr}`, rightX, 55, { align: 'right' });

  // --- 3. KPI / STATISTIQUES ---
  
  const startY = 65;
  const boxWidth = (pageWidth - 28 - 10) / 3; // 3 boites avec marge
  const boxHeight = 25;

  // Fonction helper pour dessiner une boite KPI
  const drawKpiBox = (x: number, title: string, value: string | number, color: [number, number, number]) => {
    // Fond
    doc.setFillColor(248, 250, 252); // Slate 50
    doc.setDrawColor(226, 232, 240); // Slate 200
    doc.roundedRect(x, startY, boxWidth, boxHeight, 3, 3, 'FD');
    
    // Titre
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(title.toUpperCase(), x + 5, startY + 8);
    
    // Valeur
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(color[0], color[1], color[2]);
    doc.text(String(value), x + 5, startY + 19);
  };

  drawKpiBox(14, "Pages Totales", data.totalPages, [59, 130, 246]); // Blue
  drawKpiBox(14 + boxWidth + 5, "Pages Schémas", data.schematicPagesCount, [132, 204, 22]); // Lime/Green-ish
  drawKpiBox(14 + (boxWidth + 5) * 2, "Fils Détectés (Est.)", data.totalWires, [168, 85, 247]); // Purple

  // --- 4. TABLEAU DE DÉTAIL ---

  const tableColumn = ["Page", "Type", "Description", "Fils"];
  const tableRows: any[] = [];

  data.pages.forEach(page => {
    const pageData = [
      page.pageNumber,
      page.isSchematic ? "SCHÉMA" : "AUTRE",
      page.description || "-",
      page.isSchematic ? page.wireCount : "-"
    ];
    tableRows.push(pageData);
  });

  // Utilisation explicite de autoTable importé
  autoTable(doc, {
    startY: startY + boxHeight + 15,
    head: [tableColumn],
    body: tableRows,
    theme: 'grid',
    headStyles: {
      fillColor: [30, 41, 59], // Slate 800
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    styles: {
      fontSize: 9,
      cellPadding: 3
    },
    columnStyles: {
      0: { cellWidth: 20, halign: 'center' },
      1: { cellWidth: 30 },
      3: { cellWidth: 20, halign: 'right', fontStyle: 'bold', textColor: [147, 51, 234] } // Purple text for wires
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    // Ajout d'un footer de page
    didDrawPage: function (data: any) {
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(
            `Page ${doc.internal.getCurrentPageInfo().pageNumber}`,
            pageWidth - 20,
            doc.internal.pageSize.height - 10,
            { align: 'right' }
        );
        doc.text(
            `Mounier - Confidentiel`,
            14,
            doc.internal.pageSize.height - 10
        );
    }
  });

  // --- 5. SAUVEGARDE ---
  const cleanTitle = data.documentTitle ? data.documentTitle.replace(/[^a-z0-9]/gi, '_').substring(0, 15) : 'Rapport';
  const fileName = `Rapport_Analyse_${cleanTitle}.pdf`;
  doc.save(fileName);
};
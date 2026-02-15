import { GoogleGenAI, Type, Schema } from "@google/genai";
import { ExtractionResult, SchematicAnalysisResult } from "../types";

// Fonction helper pour récupérer le client de manière sécurisée
const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    console.error("API KEY MANQUANTE. Vérifiez vos variables d'environnement Vercel (API_KEY).");
    throw new Error("Clé API non configurée. Veuillez ajouter la variable 'API_KEY' dans les réglages de votre projet Vercel.");
  }
  
  return new GoogleGenAI({ apiKey });
};
  

const nomenclatureSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    documentTitle: {
      type: Type.STRING,
      description: "Le titre ou l'objet du document",
    },
    date: {
      type: Type.STRING,
      description: "La date du document si disponible (format JJ/MM/AAAA)",
    },
    items: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          reference: { type: Type.STRING, description: "Code ou référence de l'article" },
          designation: { type: Type.STRING, description: "Description complète ou nom de l'article" },
          fabricant: { type: Type.STRING, description: "Marque ou fabricant du produit" },
          quantite: { type: Type.NUMBER, description: "Quantité numérique" },
          unite: { type: Type.STRING, description: "Unité de mesure (ex: pce, m, kg, h)" },
          prixUnitaire: { type: Type.NUMBER, description: "Prix unitaire numérique si présent" },
          prixTotal: { type: Type.NUMBER, description: "Prix total numérique si présent" },
          remarques: { type: Type.STRING, description: "Notes ou observations supplémentaires" }
        },
        required: ["designation", "quantite"]
      }
    }
  },
  required: ["items"]
};

const schematicSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    documentTitle: { type: Type.STRING },
    pages: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          pageNumber: { type: Type.NUMBER, description: "Numéro de la page (commence à 1)" },
          isSchematic: { type: Type.BOOLEAN, description: "Vrai si la page contient un schéma électrique ou un plan de câblage." },
          wireCount: { type: Type.NUMBER, description: "Estimation du nombre de traits verticaux représentant des fils électriques sur ce schéma. Mettre 0 si ce n'est pas un schéma." },
          description: { type: Type.STRING, description: "Brève description du contenu (ex: 'Schéma Puissance Moteur', 'Sommaire', 'Vue Face Avant')." }
        },
        required: ["pageNumber", "isSchematic", "wireCount"]
      }
    }
  }
};

export const extractNomenclatureFromPdf = async (base64Pdf: string): Promise<ExtractionResult> => {
  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview', 
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Pdf,
              mimeType: 'application/pdf',
            },
          },
          {
            text: `
            TÂCHE : Extraction EXHAUSTIVE de nomenclature depuis un PDF.
            
            Tu es un expert en saisie de données de haute précision.
            Ton objectif est d'extraire TOUTES les lignes contenant des articles, pièces, matériaux ou services de ce document, sans exception.
            
            RÈGLES STRICTES D'EXTRACTION :
            1. **Exhaustivité** : Ne résume jamais. Si le document contient 50 lignes, je veux 50 entrées dans le JSON. Vérifie chaque page du PDF.
            2. **Structure** : Repère les colonnes (Référence, Désignation, Marque/Fabricant, Quantité, Unité, Prix).
            3. **Multi-lignes** : Si une désignation s'étale sur plusieurs lignes visuelles mais correspond à un seul article (avec un seul prix/quantité), concatène le texte dans le champ 'designation'.
            4. **Fabricant** : Extrait la marque/fabricant si présent dans une colonne dédiée ou au début de la désignation.
            5. **Nettoyage** : Ignore les sous-totaux, les reports, les pieds de page et les en-têtes répétés. Garde uniquement les lignes "articles".
            6. **Valeurs Nulles** : Si une information (ex: prix, référence) est absente pour une ligne, mets null, n'invente pas.
            
            Procède méthodiquement, section par section, page par page.
            `
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: nomenclatureSchema,
        thinkingConfig: {
          thinkingBudget: 2048 
        }
      }
    });

    let text = response.text;
    if (!text) {
      throw new Error("Aucune réponse générée par l'IA.");
    }

    text = cleanJsonMarkdown(text);

    const data = JSON.parse(text) as ExtractionResult;
    return data;

  } catch (error) {
    console.error("Erreur lors de l'extraction Gemini:", error);
    throw error;
  }
};

export const analyzeSchematics = async (base64Pdf: string): Promise<SchematicAnalysisResult> => {
  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Pdf,
              mimeType: 'application/pdf',
            },
          },
          {
            text: `
            Analyse ce document PDF page par page en tant qu'ingénieur électricien.
            
            Objectifs :
            1. Pour chaque page, détermine si elle contient un **schéma électrique** (diagramme filaire, puissance, commande) ou non (sommaire, liste, page de garde).
            2. Pour chaque page de schéma identifiée, **compte le nombre de fils verticaux**.
               - Un "fil" est représenté par une ligne verticale principale dans le schéma.
               - Ne compte pas les hachures, les cadres ou les tableaux, uniquement les connexions électriques verticales.
               - Donne une estimation précise.
            
            Retourne un JSON structuré avec la liste de toutes les pages.
            `
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: schematicSchema,
        thinkingConfig: {
            thinkingBudget: 2048 
        }
      }
    });

    let text = response.text;
    if (!text) {
      throw new Error("Aucune réponse générée par l'IA.");
    }

    text = cleanJsonMarkdown(text);
    const rawData = JSON.parse(text);

    const pages = rawData.pages || [];
    const schematicPages = pages.filter((p: any) => p.isSchematic);
    const totalWires = schematicPages.reduce((acc: number, curr: any) => acc + (curr.wireCount || 0), 0);

    return {
      documentTitle: rawData.documentTitle,
      totalPages: pages.length,
      schematicPagesCount: schematicPages.length,
      totalWires: totalWires,
      pages: pages
    };

  } catch (error) {
    console.error("Erreur lors de l'analyse des schémas:", error);
    throw error;
  }
};

const cleanJsonMarkdown = (text: string): string => {
  text = text.trim();
  if (text.startsWith('```json')) {
    return text.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (text.startsWith('```')) {
    return text.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }
  return text;
};

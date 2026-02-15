export interface NomenclatureItem {
  reference: string;
  designation: string;
  fabricant?: string;
  quantite: number;
  unite: string;
  prixUnitaire?: number;
  prixTotal?: number;
  remarques?: string;
}

export interface ExtractionResult {
  items: NomenclatureItem[];
  documentTitle?: string;
  date?: string;
}

export interface SchematicPageAnalysis {
  pageNumber: number;
  isSchematic: boolean;
  wireCount: number; // Nombre de fils (lignes verticales)
  description?: string; // Brève description du contenu
}

export interface SchematicAnalysisResult {
  totalPages: number;
  schematicPagesCount: number;
  totalWires: number;
  pages: SchematicPageAnalysis[];
  documentTitle?: string;
}

export enum AppState {
  IDLE = 'IDLE',
  PROCESSING = 'PROCESSING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

export enum AppMode {
  NOMENCLATURE = 'NOMENCLATURE',
  SCHEMATIC = 'SCHEMATIC'
}
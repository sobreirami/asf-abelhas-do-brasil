// Tipos para as espécies de abelhas
export interface SpeciesPhotos {
  thumbnail: string;
  media: string;
  original: string;
}

export interface ScientificArticle {
  title: string;
  url: string;
}

export interface Species {
  id: string;
  commonName: string;
  scientificName: string;
  shortDescription: string;
  longDescription: string;
  regions: string[];
  biomes: string[]; // Biomas onde a espécie é encontrada (Mata Atlântica, Pantanal, etc.)
  sizeMm: number;
  behavior: string;
  nest: string;
  conservationStatus: string;
  tags: string[];
  favoredPlants: string[]; // Plantas que a abelha mais gosta (manjericão, fruto do sabiá, etc.)
  photos: SpeciesPhotos;
  photoGallery?: string[]; // URLs de fotos adicionais para o carrossel
  scientificArticles?: ScientificArticle[]; // Artigos científicos sobre a espécie
  featured?: boolean; // Flag para espécies em destaque
  createdAt: any; // Firestore Timestamp
  updatedAt: any; // Firestore Timestamp
}

export interface SpeciesFilter {
  region?: string;
  behavior?: string;
  searchTerm?: string;
}

// Tipo para o Expo Push Token
export interface PushToken {
  token: string;
  userId?: string;
  createdAt: any;
  updatedAt: any;
  platform: 'ios' | 'android';
}

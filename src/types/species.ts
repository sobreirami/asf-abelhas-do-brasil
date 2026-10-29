import { Timestamp } from 'firebase/firestore';

export interface SpeciesPhotos {
  thumbnail: string;
  media: string;
  original: string;
}

export interface PhotoCredit {
  url: string;
  urlLarge: string;
  attribution: string;
  photographerName: string;
  photographerLogin: string;
  licenseCode: string;
  licenseUrl: string;
  iNaturalistPhotoId: number;
  observationId: number;
}

export interface ScientificArticle {
  title: string;
  url: string;
  authors?: string;
  year?: number;
  source?: string;
}

export type Temperament = 'docile' | 'defensive' | 'caustic';

export type Sociality = 'eusocial' | 'solitary' | 'communal';

export type ConservationStatus =
  | 'least-concern'
  | 'vulnerable'
  | 'endangered'
  | 'critically-endangered'
  | 'data-deficient'
  | 'not-evaluated';

export interface Taxonomy {
  family: string;
  tribe: string;
  genus: string;
}

export interface Species {
  id: string;
  commonName: string;
  otherNames?: string[];
  scientificName: string;
  taxonomy?: Taxonomy;
  shortDescription: string;
  longDescription: string;
  regions: string[];
  biomes: string[];
  sizeMm?: number;
  temperament: Temperament;
  sociality: Sociality;
  nest: string;
  conservationStatus: ConservationStatus;
  conservationSource?: string;
  conservationNote?: string;
  tags: string[];
  favoredPlants: string[];
  photos: SpeciesPhotos;
  photoGallery?: string[];
  iNaturalistPhotos?: PhotoCredit[];
  scientificArticles?: ScientificArticle[];
  rationalBox?: string;
  trapNest?: string;
  featured?: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface SpeciesFilter {
  region?: string;
  searchTerm?: string;
}

export interface PushToken {
  token: string;
  userId?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  platform: 'ios' | 'android';
}

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
}

export interface Species {
  id: string;
  commonName: string;
  scientificName: string;
  shortDescription: string;
  longDescription: string;
  regions: string[];
  biomes: string[];
  sizeMm: number;
  behavior: string;
  nest: string;
  conservationStatus: string;
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
  behavior?: string;
  searchTerm?: string;
}

export interface PushToken {
  token: string;
  userId?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  platform: 'ios' | 'android';
}

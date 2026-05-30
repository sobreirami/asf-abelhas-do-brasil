import {
  collection,
  doc,
  DocumentData,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  QueryConstraint,
  QueryDocumentSnapshot,
  startAfter,
  where,
} from 'firebase/firestore';

import { Species, SpeciesFilter } from '../types/species';
import {
  cacheFeaturedSpecies,
  cacheSpeciesList,
  getCachedFeaturedSpecies,
  getCachedSpeciesList,
} from './cacheService';
import { db } from './firebase';

const SPECIES_COLLECTION = 'species';
const PAGE_SIZE = 20;

/**
 * Busca espécies com paginação e cache offline.
 * Online-first: sempre busca do Firebase, usa cache apenas como fallback em erro.
 */
export const fetchSpecies = async (
  lastDoc?: QueryDocumentSnapshot<DocumentData>,
  filters?: SpeciesFilter
): Promise<{ species: Species[]; lastVisible: QueryDocumentSnapshot<DocumentData> | null }> => {
  try {
    const constraints: QueryConstraint[] = [orderBy('commonName', 'asc'), limit(PAGE_SIZE)];

    if (filters?.region) {
      constraints.push(where('regions', 'array-contains', filters.region));
    }
    if (filters?.behavior) {
      constraints.push(where('behavior', '==', filters.behavior));
    }
    if (lastDoc) {
      constraints.push(startAfter(lastDoc));
    }

    const q = query(collection(db, SPECIES_COLLECTION), ...constraints);
    const snapshot = await getDocs(q);
    const species = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Species);
    const lastVisible = snapshot.docs[snapshot.docs.length - 1] ?? null;

    if (!lastDoc && !filters) {
      await cacheSpeciesList(species);
    }

    return { species, lastVisible };
  } catch {
    if (!lastDoc && !filters) {
      const cached = await getCachedSpeciesList();
      if (cached && cached.length > 0) {
        return { species: cached, lastVisible: null };
      }
    }
    throw new Error('Falha ao buscar espécies. Verifique sua conexão.');
  }
};

/**
 * Busca uma espécie específica por ID.
 */
export const fetchSpeciesById = async (id: string): Promise<Species | null> => {
  const docRef = doc(db, SPECIES_COLLECTION, id);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...docSnap.data() } as Species;
};

/**
 * Busca espécies por termo de pesquisa (nome popular ou científico).
 * Usa cache local como fonte para evitar round-trips desnecessários ao Firestore.
 * Fallback: busca tudo do Firestore e filtra client-side.
 */
export const searchSpecies = async (searchTerm: string): Promise<Species[]> => {
  const lowerTerm = searchTerm.toLowerCase();

  const filter = (list: Species[]) =>
    list.filter(
      (s) =>
        s.commonName.toLowerCase().includes(lowerTerm) ||
        s.scientificName.toLowerCase().includes(lowerTerm)
    );

  // Tenta usar cache primeiro para evitar leitura total do Firestore
  const cached = await getCachedSpeciesList();
  if (cached && cached.length > 0) {
    return filter(cached);
  }

  // Fallback: busca tudo (índice do Firestore não suporta full-text nativo)
  const snapshot = await getDocs(collection(db, SPECIES_COLLECTION));
  const all = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Species);
  return filter(all);
};

/**
 * Busca uma espécie aleatória para "Espécie do Dia".
 */
export const fetchRandomSpecies = async (): Promise<Species | null> => {
  const q = query(collection(db, SPECIES_COLLECTION), limit(50));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const randomIndex = Math.floor(Math.random() * snapshot.size);
  const randomDoc = snapshot.docs[randomIndex];
  return { id: randomDoc.id, ...randomDoc.data() } as Species;
};

/**
 * Busca espécies em destaque (featured: true) com cache offline.
 */
export const fetchFeaturedSpecies = async (): Promise<Species[]> => {
  try {
    const q = query(collection(db, SPECIES_COLLECTION), where('featured', '==', true), limit(10));
    const snapshot = await getDocs(q);
    const species = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Species);

    await cacheFeaturedSpecies(species);
    return species;
  } catch {
    const cached = await getCachedFeaturedSpecies();
    if (cached && cached.length > 0) return cached;
    throw new Error('Falha ao buscar espécies em destaque.');
  }
};

// Serviço para interações com Firestore - Coleção 'species'
import {
  collection,
  doc,
  DocumentData,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
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
 * Busca espécies com paginação e cache offline
 * Online-first: sempre busca do Firebase, usa cache apenas como fallback em caso de erro
 */
export const fetchSpecies = async (
  lastDoc?: QueryDocumentSnapshot<DocumentData>,
  filters?: SpeciesFilter
): Promise<{ species: Species[]; lastVisible: QueryDocumentSnapshot<DocumentData> | null }> => {
  try {
    const constraints = [orderBy('commonName', 'asc'), limit(PAGE_SIZE)];

    // Aplicar filtros
    if (filters?.region) {
      constraints.push(where('regions', 'array-contains', filters.region));
    }

    if (filters?.behavior) {
      constraints.push(where('behavior', '==', filters.behavior));
    }

    // Paginação
    if (lastDoc) {
      constraints.push(startAfter(lastDoc));
    }

    const q = query(collection(db, SPECIES_COLLECTION), ...constraints);
    const querySnapshot = await getDocs(q);
    const species: Species[] = [];

    querySnapshot.forEach((doc) => {
      species.push({ id: doc.id, ...doc.data() } as Species);
    });

    const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1] || null;

    // Atualizar cache (apenas primeira página sem filtros)
    if (!lastDoc && !filters) {
      await cacheSpeciesList(species);
    }

    return { species, lastVisible };
  } catch (error) {
    // Fallback para cache apenas em caso de erro (sem conexão)
    if (!lastDoc && !filters) {
      const cached = await getCachedSpeciesList();
      if (cached && cached.length > 0) {
        return { species: cached, lastVisible: null };
      }
    }

    throw error;
  }
};

/**
 * Busca uma espécie específica por ID
 */
export const fetchSpeciesById = async (id: string): Promise<Species | null> => {
  try {
    const docRef = doc(db, SPECIES_COLLECTION, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Species;
    }
    return null;
  } catch (error) {
    throw error;
  }
};

/**
 * Busca espécies por termo de pesquisa (nome popular ou científico)
 * Nota: Firestore não tem busca full-text nativa, então fazemos client-side
 */
export const searchSpecies = async (searchTerm: string): Promise<Species[]> => {
  try {
    const q = query(collection(db, SPECIES_COLLECTION));
    const querySnapshot = await getDocs(q);
    const species: Species[] = [];

    const lowerSearchTerm = searchTerm.toLowerCase();

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const matchesNomePopular = data.nomePopular.toLowerCase().includes(lowerSearchTerm);
      const matchesNomeCientifico = data.nomeCientifico.toLowerCase().includes(lowerSearchTerm);

      if (matchesNomePopular || matchesNomeCientifico) {
        species.push({ ...data, id: doc.id } as Species);
      }
    });

    return species;
  } catch (error) {
    throw error;
  }
};

/**
 * Busca uma espécie aleatória para "Espécie do Dia"
 */
export const fetchRandomSpecies = async (): Promise<Species | null> => {
  try {
    const q = query(collection(db, SPECIES_COLLECTION), limit(50));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) return null;

    const randomIndex = Math.floor(Math.random() * querySnapshot.size);
    const randomDoc = querySnapshot.docs[randomIndex];

    return { id: randomDoc.id, ...randomDoc.data() } as Species;
  } catch (error) {
    throw error;
  }
};

/**
 * Busca espécies em destaque (featured) com cache offline
 * SEMPRE busca do Firebase primeiro para garantir que só exibe espécies com featured: true
 */
export const fetchFeaturedSpecies = async (): Promise<Species[]> => {
  // Buscar do Firebase
  try {
    const q = query(collection(db, SPECIES_COLLECTION));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return [];
    }

    const species = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Species);

    // Salvar no cache
    await cacheFeaturedSpecies(species);

    return species;
  } catch (error) {
    // Em caso de erro, tentar cache como fallback
    const cached = await getCachedFeaturedSpecies();
    if (cached && cached.length > 0) {
      return cached;
    }

    throw error;
  }
};

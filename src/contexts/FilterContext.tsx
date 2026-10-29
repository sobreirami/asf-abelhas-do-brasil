import React, { createContext, Dispatch, SetStateAction, use, useState } from 'react';

import type { Sociality, Temperament } from '@/types/species';

export type FilterOptions = {
  searchText?: string;
  temperament?: Temperament;
  sociality?: Sociality;
  regions?: string[];
  biomes?: string[];
  conservationStatus?: string;
  tags?: string[];
};

interface FilterContextType {
  pendingTagFilter: string | null;
  setPendingTagFilter: Dispatch<SetStateAction<string | null>>;
  activeFilters: FilterOptions;
  setActiveFilters: Dispatch<SetStateAction<FilterOptions>>;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export function FilterProvider({ children }: { children: React.ReactNode }) {
  const [pendingTagFilter, setPendingTagFilter] = useState<string | null>(null);
  const [activeFilters, setActiveFilters] = useState<FilterOptions>({});

  return (
    <FilterContext
      value={{ pendingTagFilter, setPendingTagFilter, activeFilters, setActiveFilters }}
    >
      {children}
    </FilterContext>
  );
}

export function useFilter() {
  const context = use(FilterContext);
  if (context === undefined) {
    throw new Error('useFilter must be used within a FilterProvider');
  }
  return context;
}

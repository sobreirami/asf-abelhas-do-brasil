import React, { createContext, use, useState } from 'react';

export type FilterOptions = {
  searchText?: string;
  behavior?: string;
  regions?: string[];
  biomes?: string[];
  conservationStatus?: string;
  tags?: string[];
};

interface FilterContextType {
  pendingTagFilter: string | null;
  setPendingTagFilter: (tag: string | null) => void;
  activeFilters: FilterOptions;
  setActiveFilters: (filters: FilterOptions) => void;
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

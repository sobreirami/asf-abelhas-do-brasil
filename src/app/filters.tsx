import { router } from 'expo-router';
import React from 'react';

import AdvancedFilterModal from '@/components/home/AdvancedFilterModal';
import { FilterOptions, useFilter } from '@/contexts/FilterContext';

export default function FiltersScreen() {
  const { activeFilters, setActiveFilters } = useFilter();

  const closeScreen = () => {
    if (router.canDismiss()) {
      router.dismiss();
      return;
    }
    router.replace('/(tabs)');
  };

  const handleApply = (filters: FilterOptions) => {
    setActiveFilters(filters);
    closeScreen();
  };

  return (
    <AdvancedFilterModal
      currentFilters={activeFilters}
      onApply={handleApply}
      onClose={closeScreen}
    />
  );
}

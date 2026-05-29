import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';

import ReportModal from '@/components/species/ReportModal';

export default function ReportScreen() {
  const params = useLocalSearchParams<{ speciesId?: string; speciesName?: string }>();
  const speciesId = typeof params.speciesId === 'string' ? params.speciesId : '';
  const speciesName = typeof params.speciesName === 'string' ? params.speciesName : '';

  const closeScreen = () => {
    if (router.canDismiss()) {
      router.dismiss();
      return;
    }
    router.replace('/(tabs)');
  };

  return <ReportModal onClose={closeScreen} speciesId={speciesId} speciesName={speciesName} />;
}

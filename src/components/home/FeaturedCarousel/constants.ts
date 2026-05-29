import { Spacing } from '@/constants/theme';
import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
export const CARD_WIDTH = SCREEN_WIDTH * 0.8;
export const CARD_MARGIN = Spacing.md;

export const SNAP_TO_INTERVAL = CARD_WIDTH + CARD_MARGIN * 2;

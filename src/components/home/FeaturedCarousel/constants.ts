import { Spacing } from '@/constants/theme';

export const CARD_WIDTH = 256;
export const CARD_MARGIN = Spacing.md;
export const CARD_GAP = 13;

// The list lays cards out with `gap` (no margins), so one card stride is width + gap
export const SNAP_TO_INTERVAL = CARD_WIDTH + CARD_GAP;

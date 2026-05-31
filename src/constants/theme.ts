/**
 * Tema do App ASF Abelhas Nativas do Brasil
 * Paleta inspirada na natureza: verdes, amarelos, tons terrosos
 */

import { Platform } from 'react-native';

const tintColorLight = '#F5B800'; // Amarelo mel
const tintColorDark = '#FFD700';

export const Colors = {
  light: {
    text: '#2C3E35',
    background: '#FFFFFF',
    backgroundSecondary: '#FFFEF5',
    tint: tintColorLight,
    primary: '#F5B800', // Amarelo mel (primária)
    onPrimary: '#2C3E35', // Texto sobre fundo primary — nunca usar branco sobre amarelo (contraste 1.78)
    secondary: '#6B8E23', // Verde oliva (secundária)
    accent: '#FF9500', // Laranja mel
    success: '#4CAF50',
    warning: '#FFC107',
    error: '#F44336',
    icon: '#5F7161',
    tabIconDefault: '#8B9A8F',
    tabIconSelected: tintColorLight,
    border: '#E0E5DE',
    card: '#FFFFFF',
    cardBlur: 'rgba(255, 255, 255, 0.8)', // Para glass effect
    link: '#0a7ea4',
    shadow: 'rgba(0, 0, 0, 0.1)',
    overlay: 'rgba(0, 0, 0, 0.5)',
    onOverlay: '#FFFFFF',
    skeletonBase: '#E0E5DE',
    skeletonHighlight: '#F0F0F0',
    surfaceElevated: '#F5F5EE',
    textMuted: '#5F7161',
    textFaint: '#8B9A8F',
  },
  dark: {
    text: '#EEF3E6',
    background: '#11150E',
    backgroundSecondary: '#1A1F15',
    tint: tintColorDark,
    primary: '#FFC53D', // Mel dourado
    onPrimary: '#1B1F0E', // Texto sobre fundo primary — nunca usar branco sobre mel (contraste ~10)
    secondary: '#A8CE6C', // Verde oliva claro
    accent: '#FF9F45',
    success: '#6FCF73',
    warning: '#FFCB4D',
    error: '#F0726A',
    icon: '#9EAB90',
    tabIconDefault: '#6F7C63',
    tabIconSelected: '#FFC53D',
    border: '#333D2A',
    card: '#1A1F15',
    surfaceElevated: '#232A1C',
    cardBlur: 'rgba(26, 31, 21, 0.85)', // Para glass effect
    link: '#A8CE6C',
    shadow: 'rgba(0, 0, 0, 0.4)',
    overlay: 'rgba(0, 0, 0, 0.65)',
    onOverlay: '#FFFFFF',
    skeletonBase: '#1A1F15',
    skeletonHighlight: '#232A1C',
    textMuted: '#9EAB90',
    textFaint: '#6F7C63',
  },
};

// Espaçamentos consistentes
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Tamanhos de borda arredondada
export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

// Tamanhos de fonte
export const FontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  display: 40,
};

// Pesos de fonte
export const FontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

// Sombras
export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

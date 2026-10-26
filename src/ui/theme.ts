import { Platform } from 'react-native';

export const PIPBOY_THEME = {
  background: '#000000',
  primary: '#39FF14',
  primaryDim: 'rgba(57, 255, 20, 0.15)',
  primaryGlow: 'rgba(57, 255, 20, 0.5)',
  text: '#39FF14',
  fontFamily: Platform.select({
    ios: 'Courier',
    android: 'monospace',
    default: 'monospace',
  }),
  fontSize: {
    large: 24,
    medium: 18,
    small: 14,
    cell: 52,
  },
  borderColor: '#39FF14',
  borderWidth: 2,
};

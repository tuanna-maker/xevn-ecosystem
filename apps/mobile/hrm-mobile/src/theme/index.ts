/**
 * Theme barrel — import from `src/theme` or deep paths.
 * See Theme.tsx header for usage; tokens.ts for contrast/type locks.
 */

export {
  colors,
  spacing,
  layout,
  radius,
  borderWidth,
  typography,
  shadow,
  textStyles,
  tokens,
  resolveStatusTone,
  statusToneColor,
  type StatusTone,
  type ThemeTokens,
} from './tokens';

export { ThemeProvider, useTheme } from './Theme';

/**
 * @CODE-MEMORY
 * Screen:     theme/Theme — ThemeProvider / useTheme
 * UC:         AC-BRAND-DNA-01 / AC-BRAND-DNA-02
 * BR:         XeVN Precision Motion — tokens SoT via context
 * SRS:        docs/program/XEVN_BRAND_FULL_FE_REMASTER_PROGRAM.md §3 · L1m
 * TechSpec:   docs/architecture/ADR-XEVN-THEME-SHARP-OPS-20260722.md §4
 * Purpose:    Single ThemeProvider access to design tokens for App root + screens.
 * WorkItem:   XEVN-THM-MOB-00 · restore W1-B-04-AUTH-MOB-BUILD-01
 * Coded:      2026-07-22
 * Callers:    App.tsx ThemeProvider
 * Callees:    ./tokens (tokens, ThemeTokens)
 * Impact:     Missing file → Metro unable to resolve ./src/theme/Theme → APK/Expo build FAIL
 * must_keep:  ThemeProvider wraps App; useTheme returns ThemeTokens; default value = tokens
 * SOLID:      Context shell only — palette lives in tokens.ts
 * LastVerified: export:embed android bundle (W1-B-04-AUTH-MOB-BUILD-01)
 *
 * @CODE-MEMORY-CHANGE 2026-08-03
 * WorkItem: W1-B-04-AUTH-MOB-BUILD-01
 * change_mode: ADD
 * What: Restore Theme.tsx blob (was missing on disk; App.tsx still imported it).
 * Why: Unblock Metro export:embed / qa-device APK for AUTH-MOB label wave.
 */

import React, { createContext, useContext, type ReactNode } from 'react';

import { tokens, type ThemeTokens } from './tokens';

const ThemeContext = createContext<ThemeTokens>(tokens);

export type ThemeProviderProps = {
  children: ReactNode;
  /** Optional override for future dark/brand shells — defaults to SoT tokens */
  value?: ThemeTokens;
};

export function ThemeProvider({ children, value = tokens }: ThemeProviderProps) {
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeTokens {
  return useContext(ThemeContext);
}

export { tokens };
export type { ThemeTokens };

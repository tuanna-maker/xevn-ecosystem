/**
 * @CODE-MEMORY
 * Screen:     BrandFontsProvider — load Montserrat + Source Sans 3 (ADR §16)
 * UC:         BR-UI-BRAND-B5 · MOB-13
 * BR:         expo-google-fonts · fallback System until loaded
 * SRS:        docs/architecture/ADR-XEVN-PRECISION-MOTION-TOKENS-20260805.md §16
 * TechSpec:   parity web portal index.css fonts
 * Purpose:    Async load display/body fonts; setBrandFontsReady for brandTypography helpers.
 * WorkItem:   PO-HRM-UI-BRAND-W4-MOB-A
 * Coded:      2026-08-05
 * Callers:    App.tsx inside ThemeProvider
 * Callees:    expo-font · @expo-google-fonts/*
 * Impact:     Skip load → System fallback only (still PASS chrome structure)
 * must_keep:  Children render while loading (splash covers gap)
 * SOLID:      Font bootstrap tách khỏi ThemeProvider tokens
 * LastVerified: vitest brandTypography.test.ts
 */

import {
  Montserrat_600SemiBold,
  Montserrat_700Bold,
} from '@expo-google-fonts/montserrat';
import {
  SourceSans3_400Regular,
  SourceSans3_500Medium,
  SourceSans3_600SemiBold,
} from '@expo-google-fonts/source-sans-3';
import { useFonts } from 'expo-font';
import React, { useEffect, type ReactNode } from 'react';

import { setBrandFontsReady } from '../theme/brandTypography';

type BrandFontsProviderProps = {
  children: ReactNode;
};

export function BrandFontsProvider({ children }: BrandFontsProviderProps) {
  const [loaded] = useFonts({
    Montserrat_600SemiBold,
    Montserrat_700Bold,
    SourceSans3_400Regular,
    SourceSans3_500Medium,
    SourceSans3_600SemiBold,
  });

  useEffect(() => {
    setBrandFontsReady(loaded);
    return () => setBrandFontsReady(false);
  }, [loaded]);

  return <>{children}</>;
}

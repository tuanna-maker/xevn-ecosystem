/** Default 1.0 = 16px rem (ADR §7 prefer body 16; was 0.9 ≈14.4px). */
const DEFAULT_UI_DENSITY = 1;
const MIN_UI_DENSITY = 0.75;
const MAX_UI_DENSITY = 1;

/**
 * Portal UI density vs browser default (1 = 16px rem base).
 * Applied on `document.documentElement` before React paint.
 */
export function resolveUiDensity(): number {
  const raw = import.meta.env.VITE_UI_DENSITY;
  if (raw === undefined || raw === '') return DEFAULT_UI_DENSITY;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) return DEFAULT_UI_DENSITY;
  return Math.min(MAX_UI_DENSITY, Math.max(MIN_UI_DENSITY, parsed));
}

export function applyUiDensity(): void {
  const density = resolveUiDensity();
  const root = document.documentElement;
  root.style.setProperty('--xevn-ui-density', String(density));
  root.style.fontSize = `${density * 100}%`;
}

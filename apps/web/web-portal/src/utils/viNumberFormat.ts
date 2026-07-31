/**
 * Dual export — SoT lives in `@xevn/ui` (`packages/ui/src/lib/viNumberFormat.ts`).
 * Keep this path so existing CommandCenter imports continue to work.
 * WorkItem: D-UX-VI-FORMAT-SHARED-01
 */
export {
  formatViGroupedInteger,
  parseViGroupedInteger,
  formatViGroupedDecimal,
  parseViGroupedDecimal,
} from '@xevn/ui';

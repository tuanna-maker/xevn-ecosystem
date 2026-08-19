/**
 * HDSD Phase 2 — figure id → asset filename + inject relative path helpers.
 */
import path from 'node:path';

/** @param {string} figureId e.g. ECO.1, XBOS.1.1, 5.1, HRM.0.1 */
/** @param {'ecosystem'|'xbos'|'hrm'} [domain] */
export function figureSlug(figureId, domain = 'hrm') {
  const raw = String(figureId).trim();
  if (/^ECO\./i.test(raw)) return `eco-${raw.replace(/^ECO\./i, '').replace(/\./g, '-')}`;
  if (/^XBOS\./i.test(raw)) return `xbos-${raw.replace(/^XBOS\./i, '').replace(/\./g, '-')}`;
  if (/^HRM\./i.test(raw)) return `hrm-${raw.replace(/^HRM\./i, '').replace(/\./g, '-')}`;
  const domainPrefix = domain === 'ecosystem' ? 'eco' : domain === 'xbos' ? 'xbos' : 'hrm';
  return `${domainPrefix}-${raw.replace(/\./g, '-')}`;
}

/** @param {'ecosystem'|'xbos'|'hrm'} domain */
export function assetRelativePath(domain, figureId) {
  return `${domain}/${figureSlug(figureId, domain)}.png`;
}

/** Relative markdown image path from HDSD markdown files to assets file. */
export function injectRelativePath(fromMdFile, assetRel) {
  const mdDir = path.dirname(fromMdFile);
  const assetsDir = path.join('docs', 'client-delivery', 'hdsd', 'assets');
  const rel = path.relative(mdDir, path.join(assetsDir, assetRel)).replace(/\\/g, '/');
  return rel.startsWith('.') ? rel : `./${rel}`;
}

/** Match `[Hình …]` placeholders (optional surrounding backticks). */
export const HINH_PLACEHOLDER_RE = /`?\[Hình\s+([^\]]+)\]`?/;

/** Extract canonical figure id from placeholder inner text (before em dash). */
export function parseFigureIdFromPlaceholder(inner) {
  const left = inner.split('—')[0].split('–')[0].trim();
  const m = left.match(/^(?:Hình\s+)?(.+)$/i);
  return (m?.[1] ?? left).trim();
}

/** ZenHR 4-col action grid paging — MOB-UX-14a / J-MOB-32+ */



export const ACTION_GRID_COLS = 4;

/** Content width (px) below which grid falls back to 3 columns (360dp screen − 32dp padding). */
export const ACTION_GRID_NARROW_WIDTH = 328;

export const ACTION_GRID_ROWS = 4;

export const ACTION_GRID_ABOVE_FOLD_ROWS = 1;

export const ACTION_GRID_PAGE_SIZE = ACTION_GRID_COLS * ACTION_GRID_ROWS;



/** 4 columns when content width ≥328dp (~360dp screen); 3 only on very narrow screens. */
export function resolveActionGridCols(contentWidth: number): number {
  if (!Number.isFinite(contentWidth) || contentWidth <= 0) {
    return ACTION_GRID_COLS;
  }
  return contentWidth < ACTION_GRID_NARROW_WIDTH ? 3 : ACTION_GRID_COLS;
}

/** Tile width from measured carousel content width (MOB-UX-14-R3). */
export function resolveActionGridTileWidth(contentWidth: number, cols: number, gap = 4): number {
  const safeCols = Math.max(1, cols);
  const gaps = gap * Math.max(0, safeCols - 1);
  return Math.max(56, (contentWidth - gaps) / safeCols);
}

export function resolveAboveFoldPageSize(cols: number, rows = ACTION_GRID_ABOVE_FOLD_ROWS): number {
  return cols * rows;
}



export function resolveActionGridPageSize(cols: number, rows = ACTION_GRID_ROWS): number {

  return cols * rows;

}



/** Split tiles into pages (cols × rows per page). */

export function chunkActionGridPages<T>(items: readonly T[], pageSize = ACTION_GRID_PAGE_SIZE): T[][] {

  if (items.length === 0) return [];

  const pages: T[][] = [];

  for (let i = 0; i < items.length; i += pageSize) {

    pages.push(items.slice(i, i + pageSize));

  }

  return pages;

}


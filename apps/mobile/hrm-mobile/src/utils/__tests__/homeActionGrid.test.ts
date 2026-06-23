import { describe, expect, it } from 'vitest';



import {

  ACTION_GRID_COLS,

  ACTION_GRID_NARROW_WIDTH,

  ACTION_GRID_PAGE_SIZE,

  ACTION_GRID_ROWS,

  chunkActionGridPages,

  resolveAboveFoldPageSize,
  resolveActionGridCols,
  resolveActionGridPageSize,
  resolveActionGridTileWidth,
} from '../homeActionGrid';

import { getQuickAccessTiles } from '../homePortal';



describe('homeActionGrid — MOB-UX-14a responsive 4-col', () => {

  it('ACTION_GRID_PAGE_SIZE is 4 cols × 4 rows', () => {

    expect(ACTION_GRID_COLS).toBe(4);

    expect(ACTION_GRID_ROWS).toBe(4);

    expect(ACTION_GRID_PAGE_SIZE).toBe(16);

  });



  it('resolveActionGridCols uses 4 on content width ≥328 and 3 below', () => {
    expect(resolveActionGridCols(ACTION_GRID_NARROW_WIDTH)).toBe(4);
    expect(resolveActionGridCols(343)).toBe(4);
    expect(resolveActionGridCols(375)).toBe(4);
    expect(resolveActionGridCols(393)).toBe(4);
    expect(resolveActionGridCols(430)).toBe(4);
    expect(resolveActionGridCols(327)).toBe(3);
    expect(resolveActionGridCols(280)).toBe(3);
  });



  it('resolveActionGridTileWidth fits four tiles in 343dp content (375 phone class)', () => {
    const contentWidth = 343;
    const cols = resolveActionGridCols(contentWidth);
    expect(cols).toBe(4);
    const tileWidth = resolveActionGridTileWidth(contentWidth, cols, 4);
    expect(tileWidth * 4 + 4 * 3).toBeLessThanOrEqual(contentWidth);
    expect(tileWidth).toBeGreaterThanOrEqual(70);
  });

  it('resolveAboveFoldPageSize is one row per carousel page', () => {
    expect(resolveAboveFoldPageSize(4)).toBe(4);
    expect(resolveAboveFoldPageSize(3)).toBe(3);
  });

  it('resolveActionGridPageSize scales with column count', () => {

    expect(resolveActionGridPageSize(4)).toBe(16);

    expect(resolveActionGridPageSize(3)).toBe(12);

  });



  it('employee tiles fit single page (9 tiles)', () => {

    const tiles = getQuickAccessTiles(false);

    expect(tiles).toHaveLength(9);

    const pages = chunkActionGridPages(tiles);

    expect(pages).toHaveLength(1);

    expect(pages[0]).toHaveLength(9);

    expect(pages[0].map((t) => t.id)).toEqual([

      'checkin',

      'time_off',

      'payroll',

      'approve',

      'team',

      'contracts',

      'operations',

      'notifications',

      'journey',

    ]);

  });



  it('manager tiles include Báo cáo (10 tiles)', () => {

    const tiles = getQuickAccessTiles(true);

    expect(tiles).toHaveLength(10);

    expect(tiles[tiles.length - 1].id).toBe('reports');

    expect(tiles[tiles.length - 1].label).toBe('Báo cáo');

    expect(tiles[tiles.length - 1].stub).toBe(true);

  });



  it('chunkActionGridPages returns single page when ≤16 items', () => {

    const pages = chunkActionGridPages(['a', 'b', 'c', 'd', 'e', 'f']);

    expect(pages).toHaveLength(1);

    expect(pages[0]).toHaveLength(6);

  });



  it('chunkActionGridPages returns empty for no items', () => {

    expect(chunkActionGridPages([])).toEqual([]);

  });

});


import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('C-P1-HRM-PERF-02-CURSOR-FE — listAllEmployees next_cursor walk', () => {
  it('listAllEmployees source walks next_cursor — no OFFSET page += 1', () => {
    const apiSrc = readFileSync(resolve(__dirname, '../integrations/hrmApi.ts'), 'utf8');
    const fnStart = apiSrc.indexOf('export async function listAllEmployees');
    expect(fnStart).toBeGreaterThanOrEqual(0);
    const fnEnd = apiSrc.indexOf('export async function', fnStart + 1);
    const body = apiSrc.slice(fnStart, fnEnd > fnStart ? fnEnd : undefined);

    expect(body).toMatch(/next_cursor/);
    expect(body).toMatch(/\bcursor\b/);
    expect(body).not.toMatch(/page\s*\+=\s*1/);
    expect(body).not.toMatch(/let\s+page\s*=\s*1/);
  });

  it('listEmployees accepts cursor and types next_cursor (contract CD-FB-05)', () => {
    const apiSrc = readFileSync(resolve(__dirname, '../integrations/hrmApi.ts'), 'utf8');
    expect(apiSrc).toMatch(/export type HrmEmployeeListPage/);
    expect(apiSrc).toMatch(/next_cursor\?:\s*string\s*\|\s*null/);
    expect(apiSrc).toMatch(/cursor\?:\s*string/);
  });

  it('must_keep FE-04 — Dashboard uses summary, not listAllEmployees', () => {
    const dash = readFileSync(resolve(__dirname, '../pages/Dashboard.tsx'), 'utf8');
    expect(dash).toContain('useEmployeesSummary');
    expect(dash).not.toMatch(/import\s*\{[^}]*listAllEmployees/);
    expect(dash).not.toMatch(/listAllEmployees\s*\(/);
    expect(dash).not.toMatch(/useEmployees\s*\(/);
  });

  it('Employees export/archive still call listAllEmployees (lazy dialog only)', () => {
    const page = readFileSync(resolve(__dirname, '../pages/Employees.tsx'), 'utf8');
    expect(page).toContain('listAllEmployees');
    expect(page).toContain('exportDialogOpen');
    expect(page).toContain('deletedDialogOpen');
    expect(page).toContain('useEmployeesPage');
  });
});

describe('C-P1-HRM-PERF-02-CURSOR-FE — runtime cursor walk', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('listAllEmployees follows next_cursor and never requests page>1', async () => {
    const requestedUrls: string[] = [];
    const pages = [
      {
        total: 250,
        page: 1,
        page_size: 100,
        next_cursor: 'cur-a',
        data: Array.from({ length: 100 }, (_, i) => ({
          id: `id-${i}`,
          company_id: 'main',
          employee_code: `E${i}`,
          email: `e${i}@xe.vn`,
          full_name: `NV ${i}`,
          job_title_key: null,
          status: 'active' as const,
          hired_at: null,
          archived_at: null,
          custom_fields: {},
          created_at: '2026-01-01T00:00:00.000Z',
          updated_at: '2026-01-01T00:00:00.000Z',
        })),
      },
      {
        total: 250,
        page: 1,
        page_size: 100,
        next_cursor: 'cur-b',
        data: Array.from({ length: 100 }, (_, i) => ({
          id: `id-${100 + i}`,
          company_id: 'main',
          employee_code: `E${100 + i}`,
          email: `e${100 + i}@xe.vn`,
          full_name: `NV ${100 + i}`,
          job_title_key: null,
          status: 'active' as const,
          hired_at: null,
          archived_at: null,
          custom_fields: {},
          created_at: '2026-01-01T00:00:00.000Z',
          updated_at: '2026-01-01T00:00:00.000Z',
        })),
      },
      {
        total: 250,
        page: 1,
        page_size: 100,
        next_cursor: null,
        data: Array.from({ length: 50 }, (_, i) => ({
          id: `id-${200 + i}`,
          company_id: 'main',
          employee_code: `E${200 + i}`,
          email: `e${200 + i}@xe.vn`,
          full_name: `NV ${200 + i}`,
          job_title_key: null,
          status: 'active' as const,
          hired_at: null,
          archived_at: null,
          custom_fields: {},
          created_at: '2026-01-01T00:00:00.000Z',
          updated_at: '2026-01-01T00:00:00.000Z',
        })),
      },
    ];
    let call = 0;

    globalThis.fetch = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      requestedUrls.push(url);
      const payload = pages[call] ?? pages[pages.length - 1];
      call += 1;
      return new Response(
        JSON.stringify({
          success: true,
          code: 'HRM-EMP-LIST-200',
          message: 'ok',
          data: payload,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      );
    }) as typeof fetch;

    const { listAllEmployees } = await import('@/integrations/hrmApi');
    const res = await listAllEmployees({ company_id: 'main', page_size: 100 });

    expect(res.total).toBe(250);
    expect(res.data).toHaveLength(250);
    expect(requestedUrls).toHaveLength(3);
    expect(requestedUrls[0]).not.toMatch(/[?&]cursor=/);
    expect(requestedUrls[1]).toMatch(/[?&]cursor=cur-a/);
    expect(requestedUrls[2]).toMatch(/[?&]cursor=cur-b/);
    for (const url of requestedUrls) {
      const pageMatch = url.match(/[?&]page=(\d+)/);
      if (pageMatch) {
        expect(Number(pageMatch[1])).toBeLessThanOrEqual(1);
      }
      expect(url).not.toMatch(/[?&]page=[2-9]/);
      expect(url).not.toMatch(/[?&]page=\d{2,}/);
    }
  });
});

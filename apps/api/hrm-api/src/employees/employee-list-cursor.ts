/**
 * @CODE-MEMORY
 * Screen:     HRM → Employees list keyset cursor
 * UC:         FR-HRM-EM-01 · ADR-HRM-SCALE §5.4
 * BR:         Cursor ISO timestamptz — no Date.toString skip
 * Purpose:    Encode/decode keyset cursor (created_at + id) cho export walk không OFFSET storm.
 * WorkItem:   CD-FB-05-PERF-BE (restored src W1-B-02-EMP)
 * Coded:      2026-07-19
 * Callers:    employees.service listEmployees
 * must_keep:  ISO-8601 encode; UUID validate; created_at_cursor prefer US precision
 * SOLID:      Pure codec — không Nest / SQL
 * LastVerified: p1-hrm-scale-be-w2.spec.ts · employees.service.spec.ts
 *
 * @CODE-MEMORY-CHANGE 2026-08-03
 * WorkItem: W1-B-02-EMP
 * change_mode: ADD
 * What: Restore src from dist (missing blocked employees.service jest)
 * Why: W1-B-02-EMP exit criteria jest for touched employees module
 * must_keep: toEmployeeListCursorIso Z-normalize · base64url payload
 */

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const ISO_INSTANT_RE =
  /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?)(Z|[+-]\d{2}:?\d{2})$/i;

export type EmployeeListCursor = {
  createdAt: string;
  id: string;
};

export function toEmployeeListCursorIso(createdAt: string | Date): string {
  if (createdAt instanceof Date) {
    if (Number.isNaN(createdAt.getTime())) {
      throw new Error('invalid cursor created_at');
    }
    return createdAt.toISOString();
  }
  const trimmed = String(createdAt).trim();
  if (!trimmed) {
    throw new Error('invalid cursor created_at');
  }
  const iso = ISO_INSTANT_RE.exec(trimmed);
  if (iso) {
    const head = iso[1];
    const off = iso[2].toUpperCase();
    if (
      off === 'Z' ||
      off === '+00:00' ||
      off === '+0000' ||
      off === '-00:00' ||
      off === '-0000'
    ) {
      return `${head}Z`;
    }
    const ms = Date.parse(trimmed);
    if (Number.isNaN(ms)) {
      throw new Error('invalid cursor created_at');
    }
    return new Date(ms).toISOString();
  }
  const ms = Date.parse(trimmed);
  if (Number.isNaN(ms)) {
    throw new Error('invalid cursor created_at');
  }
  return new Date(ms).toISOString();
}

export function encodeEmployeeListCursor(
  createdAt: string | Date,
  id: string,
): string {
  const iso = toEmployeeListCursorIso(createdAt);
  return Buffer.from(`${iso}\n${id}`, 'utf8').toString('base64url');
}

export function decodeEmployeeListCursor(raw: string): EmployeeListCursor {
  const trimmed = raw.trim();
  if (!trimmed) {
    throw new Error('empty cursor');
  }
  let decoded: string;
  try {
    decoded = Buffer.from(trimmed, 'base64url').toString('utf8');
  } catch {
    throw new Error('invalid cursor encoding');
  }
  const nl = decoded.indexOf('\n');
  if (nl <= 0 || nl === decoded.length - 1) {
    throw new Error('invalid cursor payload');
  }
  const createdAtRaw = decoded.slice(0, nl).trim();
  const id = decoded.slice(nl + 1).trim();
  if (!createdAtRaw || Number.isNaN(Date.parse(createdAtRaw))) {
    throw new Error('invalid cursor created_at');
  }
  if (!UUID_RE.test(id)) {
    throw new Error('invalid cursor id');
  }
  return { createdAt: toEmployeeListCursorIso(createdAtRaw), id };
}

export function encodeEmployeeListCursorFromRow(row: {
  id: string;
  created_at: string | Date;
  created_at_cursor?: string | null;
}): string {
  const source =
    typeof row.created_at_cursor === 'string' && row.created_at_cursor.trim()
      ? row.created_at_cursor.trim()
      : row.created_at;
  return encodeEmployeeListCursor(source, row.id);
}

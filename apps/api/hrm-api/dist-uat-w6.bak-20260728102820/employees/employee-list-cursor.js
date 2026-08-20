"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toEmployeeListCursorIso = toEmployeeListCursorIso;
exports.encodeEmployeeListCursor = encodeEmployeeListCursor;
exports.decodeEmployeeListCursor = decodeEmployeeListCursor;
exports.encodeEmployeeListCursorFromRow = encodeEmployeeListCursorFromRow;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const ISO_INSTANT_RE = /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?)(Z|[+-]\d{2}:?\d{2})$/i;
function toEmployeeListCursorIso(createdAt) {
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
        if (off === 'Z' || off === '+00:00' || off === '+0000' || off === '-00:00' || off === '-0000') {
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
function encodeEmployeeListCursor(createdAt, id) {
    const iso = toEmployeeListCursorIso(createdAt);
    return Buffer.from(`${iso}\n${id}`, 'utf8').toString('base64url');
}
function decodeEmployeeListCursor(raw) {
    const trimmed = raw.trim();
    if (!trimmed) {
        throw new Error('empty cursor');
    }
    let decoded;
    try {
        decoded = Buffer.from(trimmed, 'base64url').toString('utf8');
    }
    catch {
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
function encodeEmployeeListCursorFromRow(row) {
    const source = typeof row.created_at_cursor === 'string' && row.created_at_cursor.trim()
        ? row.created_at_cursor.trim()
        : row.created_at;
    return encodeEmployeeListCursor(source, row.id);
}
//# sourceMappingURL=employee-list-cursor.js.map
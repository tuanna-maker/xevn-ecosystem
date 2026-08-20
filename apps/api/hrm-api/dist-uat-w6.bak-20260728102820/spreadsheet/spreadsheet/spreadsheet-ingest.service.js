"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpreadsheetIngestService = void 0;
exports.splitCsvLine = splitCsvLine;
const common_1 = require("@nestjs/common");
const exceljs_1 = __importDefault(require("exceljs"));
const api_exception_1 = require("../common/api.exception");
const spreadsheet_limits_1 = require("./spreadsheet-limits");
const XLSX_MAGIC = Buffer.from([0x50, 0x4b, 0x03, 0x04]);
function splitCsvLine(line) {
    const out = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        const c = line[i];
        if (c === '"') {
            const next = line[i + 1];
            if (inQuotes && next === '"') {
                cur += '"';
                i++;
            }
            else {
                inQuotes = !inQuotes;
            }
        }
        else if (c === ',' && !inQuotes) {
            out.push(cur);
            cur = '';
        }
        else {
            cur += c;
        }
    }
    out.push(cur);
    return out.map((cell) => cell.trim());
}
function normalizeNewlines(text) {
    return text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
}
function uniqueHeaderNames(raw) {
    const used = new Map();
    return raw.map((h) => {
        const base = h.trim() || `column_${used.size + 1}`;
        const n = (used.get(base) ?? 0) + 1;
        used.set(base, n);
        return n === 1 ? base : `${base}__${n}`;
    });
}
function assertSyncBudget(startedAt, limits) {
    if (Date.now() - startedAt > limits.maxSyncMs) {
        throw new api_exception_1.ApiException('SHEET-408', 'Spreadsheet operation exceeded server time limit', common_1.HttpStatus.REQUEST_TIMEOUT, {
            maxSyncMs: limits.maxSyncMs,
        });
    }
}
function isLikelyXlsx(buffer, mimetype, filename) {
    if (mimetype?.includes('spreadsheetml'))
        return true;
    if (filename?.toLowerCase().endsWith('.xlsx'))
        return true;
    return buffer.length >= 4 && buffer.subarray(0, 4).equals(XLSX_MAGIC);
}
function assertCellLen(value, limits, rowIdx, field) {
    if (value.length > limits.maxCellChars) {
        throw new api_exception_1.ApiException('SHEET-413', 'Parsed cell exceeds maximum allowed length', common_1.HttpStatus.PAYLOAD_TOO_LARGE, { row: rowIdx, field, maxCellChars: limits.maxCellChars });
    }
}
function cellToScalar(cell) {
    const v = cell.value;
    if (v === null || v === undefined)
        return '';
    if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean')
        return String(v);
    if (v instanceof Date)
        return v.toISOString().slice(0, 10);
    if (typeof v === 'object' && v !== null && 'text' in v) {
        return String(v.text ?? '');
    }
    if (typeof v === 'object' && v !== null && 'result' in v) {
        const r = v.result;
        return r === null || r === undefined ? '' : String(r);
    }
    return String(v);
}
let SpreadsheetIngestService = class SpreadsheetIngestService {
    async parseEmployeeImportFile(buffer, opts) {
        const limits = (0, spreadsheet_limits_1.getSpreadsheetLimits)();
        if (!buffer?.length) {
            throw new api_exception_1.ApiException('SHEET-400', 'Empty file', common_1.HttpStatus.BAD_REQUEST);
        }
        if (buffer.length > limits.maxUploadBytes) {
            throw new api_exception_1.ApiException('SHEET-413', 'File exceeds upload limit', common_1.HttpStatus.PAYLOAD_TOO_LARGE, {
                maxUploadBytes: limits.maxUploadBytes,
            });
        }
        if (isLikelyXlsx(buffer, opts.mimetype, opts.originalname)) {
            return this.parseEmployeeImportXlsx(buffer, opts.startedAt);
        }
        return this.parseEmployeeImportCsv(buffer, opts.startedAt);
    }
    parseEmployeeImportCsv(buffer, startedAt) {
        const limits = (0, spreadsheet_limits_1.getSpreadsheetLimits)();
        const csvText = buffer.toString('utf8');
        const bytes = Buffer.byteLength(csvText, 'utf8');
        if (bytes > limits.maxUploadBytes) {
            throw new api_exception_1.ApiException('SHEET-413', 'CSV exceeds byte limit', common_1.HttpStatus.PAYLOAD_TOO_LARGE);
        }
        const normalized = normalizeNewlines(csvText).replace(/^\uFEFF/, '');
        const lines = normalized.split('\n');
        const nonEmpty = lines.map((l) => l.replace(/\r$/, '').trim()).filter((l) => l.length > 0);
        if (nonEmpty.length < 1) {
            throw new api_exception_1.ApiException('SHEET-400', 'CSV has no header row', common_1.HttpStatus.BAD_REQUEST);
        }
        const headerCells = splitCsvLine(nonEmpty[0]);
        if (headerCells.length === 0 || headerCells.every((h) => h === '')) {
            throw new api_exception_1.ApiException('SHEET-400', 'CSV header row is empty', common_1.HttpStatus.BAD_REQUEST);
        }
        if (headerCells.length > limits.maxColumns) {
            throw new api_exception_1.ApiException('SHEET-413', 'CSV exceeds maximum column count', common_1.HttpStatus.PAYLOAD_TOO_LARGE, {
                maxColumns: limits.maxColumns,
            });
        }
        const headers = uniqueHeaderNames(headerCells);
        const dataLines = nonEmpty.slice(1);
        if (dataLines.length > limits.maxCsvDataRows) {
            throw new api_exception_1.ApiException('SHEET-413', 'CSV exceeds maximum row count', common_1.HttpStatus.PAYLOAD_TOO_LARGE, {
                maxRows: limits.maxCsvDataRows,
            });
        }
        const rows = [];
        for (let i = 0; i < dataLines.length; i++) {
            if (i % 2000 === 0)
                assertSyncBudget(startedAt, limits);
            const line = dataLines[i];
            const cells = splitCsvLine(line);
            if (cells.length === 1 && cells[0] === '')
                continue;
            const row = {};
            for (let c = 0; c < headers.length; c++) {
                const v = cells[c] ?? '';
                assertCellLen(v, limits, i + 2, headers[c]);
                row[headers[c]] = v;
            }
            rows.push(row);
        }
        return { headers, rows };
    }
    async parseEmployeeImportXlsx(buffer, startedAt) {
        const limits = (0, spreadsheet_limits_1.getSpreadsheetLimits)();
        const wb = new exceljs_1.default.Workbook();
        try {
            await wb.xlsx.load(buffer);
        }
        catch {
            throw new api_exception_1.ApiException('SHEET-400', 'Could not read Excel workbook', common_1.HttpStatus.BAD_REQUEST);
        }
        assertSyncBudget(startedAt, limits);
        const ws = wb.worksheets[0];
        if (!ws) {
            throw new api_exception_1.ApiException('SHEET-400', 'Workbook has no sheets', common_1.HttpStatus.BAD_REQUEST);
        }
        const rowArrays = [];
        let rowIndex = 0;
        ws.eachRow({ includeEmpty: false }, (row) => {
            if (rowIndex % 1000 === 0)
                assertSyncBudget(startedAt, limits);
            rowIndex += 1;
            const maxCol = Math.min(row.cellCount, limits.maxColumns);
            const cells = [];
            for (let c = 1; c <= maxCol; c++) {
                const cell = row.getCell(c);
                const s = cellToScalar(cell);
                assertCellLen(s, limits, rowIndex + 1, `col_${c}`);
                cells.push(s);
            }
            rowArrays.push(cells);
        });
        if (rowArrays.length < 1) {
            throw new api_exception_1.ApiException('SHEET-400', 'XLSX has no rows', common_1.HttpStatus.BAD_REQUEST);
        }
        const headerCells = rowArrays[0];
        const headers = uniqueHeaderNames(headerCells);
        const dataRowArrays = rowArrays.slice(1);
        if (dataRowArrays.length > limits.maxXlsxDataRows) {
            throw new api_exception_1.ApiException('SHEET-413', 'XLSX exceeds maximum row count', common_1.HttpStatus.PAYLOAD_TOO_LARGE, {
                maxRows: limits.maxXlsxDataRows,
            });
        }
        const objects = [];
        for (let i = 0; i < dataRowArrays.length; i++) {
            if (i % 1000 === 0)
                assertSyncBudget(startedAt, limits);
            const cells = dataRowArrays[i];
            if (cells.every((c) => !c.trim()))
                continue;
            const row = {};
            for (let c = 0; c < headers.length; c++) {
                row[headers[c]] = cells[c] ?? '';
            }
            objects.push(row);
        }
        return { headers, rows: objects };
    }
};
exports.SpreadsheetIngestService = SpreadsheetIngestService;
exports.SpreadsheetIngestService = SpreadsheetIngestService = __decorate([
    (0, common_1.Injectable)()
], SpreadsheetIngestService);
//# sourceMappingURL=spreadsheet-ingest.service.js.map
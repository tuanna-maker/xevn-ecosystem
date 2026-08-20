"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EMPLOYEE_IMPORT_TEMPLATE_HEADERS = exports.SPREADSHEET_KINDS = void 0;
exports.assertKnownKind = assertKnownKind;
exports.assertImportKind = assertImportKind;
exports.assertTemplateKind = assertTemplateKind;
const common_1 = require("@nestjs/common");
const api_exception_1 = require("../common/api.exception");
exports.SPREADSHEET_KINDS = {
    employee_import: 'employee_import',
    employee_export: 'employee_export',
};
function assertKnownKind(kind) {
    if (kind === exports.SPREADSHEET_KINDS.employee_import || kind === exports.SPREADSHEET_KINDS.employee_export) {
        return kind;
    }
    return invalidKind(kind);
}
function assertImportKind(kind) {
    if (kind === exports.SPREADSHEET_KINDS.employee_import)
        return kind;
    return invalidKind(kind);
}
function assertTemplateKind(kind) {
    if (kind === exports.SPREADSHEET_KINDS.employee_import)
        return kind;
    throw new api_exception_1.ApiException('SHEET-400', `No template available for kind: ${kind ?? '(missing)'}`, common_1.HttpStatus.BAD_REQUEST, { templateKinds: [exports.SPREADSHEET_KINDS.employee_import] });
}
function invalidKind(kind) {
    throw new api_exception_1.ApiException('SHEET-400', `Unknown or invalid spreadsheet kind: ${kind ?? '(missing)'}`, common_1.HttpStatus.BAD_REQUEST, {
        allowed: Object.values(exports.SPREADSHEET_KINDS),
    });
}
exports.EMPLOYEE_IMPORT_TEMPLATE_HEADERS = [
    'employee_code',
    'email',
    'full_name',
    'job_title_key',
    'hired_at',
];
//# sourceMappingURL=spreadsheet-kinds.js.map
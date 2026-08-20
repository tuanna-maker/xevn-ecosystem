"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertImportUploadMime = assertImportUploadMime;
const common_1 = require("@nestjs/common");
const api_exception_1 = require("../common/api.exception");
const ALLOWED = new Set([
    '',
    'text/csv',
    'application/csv',
    'application/octet-stream',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'text/plain',
]);
function assertImportUploadMime(mimetype, originalname) {
    const name = originalname ?? '';
    if (/\.(png|gif|jpe?g|webp|pdf|zip|bin)$/i.test(name)) {
        throw new api_exception_1.ApiException('SHEET-415', 'Unsupported file extension for import', common_1.HttpStatus.UNSUPPORTED_MEDIA_TYPE, {
            originalname: name,
        });
    }
    const m = mimetype?.trim() ?? '';
    if (!m || ALLOWED.has(m) || m.includes('spreadsheetml')) {
        return;
    }
    throw new api_exception_1.ApiException('SHEET-415', 'Unsupported media type for import', common_1.HttpStatus.UNSUPPORTED_MEDIA_TYPE, {
        mimetype: m,
    });
}
//# sourceMappingURL=spreadsheet-import-mime.js.map
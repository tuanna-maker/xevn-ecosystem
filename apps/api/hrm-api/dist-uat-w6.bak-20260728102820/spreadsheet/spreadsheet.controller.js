"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpreadsheetController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const api_exception_1 = require("../common/api.exception");
const api_response_1 = require("../common/api-response");
const internal_auth_1 = require("../common/internal-auth");
const scope_context_1 = require("../common/scope-context");
const import_multipart_meta_dto_1 = require("./dto/import-multipart-meta.dto");
const spreadsheet_export_body_dto_1 = require("./dto/spreadsheet-export-body.dto");
const spreadsheet_kinds_1 = require("./spreadsheet-kinds");
const spreadsheet_limits_1 = require("./spreadsheet-limits");
const spreadsheet_import_mime_1 = require("./spreadsheet-import-mime");
const spreadsheet_service_1 = require("./spreadsheet.service");
const MULTIPART_FILE_MAX = () => (0, spreadsheet_limits_1.getSpreadsheetLimits)().maxUploadBytes;
let SpreadsheetController = class SpreadsheetController {
    spreadsheetService;
    constructor(spreadsheetService) {
        this.spreadsheetService = spreadsheetService;
    }
    assertSpreadsheetAccess(authorization, internalKey) {
        if (!(0, internal_auth_1.isAuthorizedInternalRequest)(authorization, internalKey)) {
            throw new api_exception_1.ApiException('HRM-AUTH-001', 'Unauthorized spreadsheet access', common_1.HttpStatus.UNAUTHORIZED);
        }
    }
    limits(authorization, internalApiKey) {
        this.assertSpreadsheetAccess(authorization, internalApiKey);
        return (0, api_response_1.ok)(this.spreadsheetService.getLimitsSnapshot(), 'SHEET-200', 'Spreadsheet limits');
    }
    async downloadTemplate(kind, formatRaw, authorization, internalApiKey) {
        this.assertSpreadsheetAccess(authorization, internalApiKey);
        (0, spreadsheet_kinds_1.assertTemplateKind)(kind);
        const format = (formatRaw ?? 'csv').toLowerCase();
        if (format !== 'csv' && format !== 'xlsx') {
            throw new api_exception_1.ApiException('SHEET-400', 'Invalid format; use csv or xlsx', common_1.HttpStatus.BAD_REQUEST, { format });
        }
        if (format === 'xlsx') {
            const buf = await this.spreadsheetService.employeeImportXlsxTemplate();
            return new common_1.StreamableFile(buf, {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                disposition: 'attachment; filename="employee_import_template.xlsx"',
            });
        }
        const csv = this.spreadsheetService.employeeImportCsvTemplate();
        return new common_1.StreamableFile(Buffer.from(csv, 'utf8'), {
            type: 'text/csv; charset=utf-8',
            disposition: 'attachment; filename="employee_import_template.csv"',
        });
    }
    async importPreview(file, body, tenantId, companyId, authorization, internalApiKey) {
        this.assertSpreadsheetAccess(authorization, internalApiKey);
        (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId });
        (0, spreadsheet_kinds_1.assertImportKind)(body.kind);
        if (!file?.buffer?.length) {
            throw new api_exception_1.ApiException('SHEET-400', 'Multipart file field "file" is required', common_1.HttpStatus.BAD_REQUEST);
        }
        (0, spreadsheet_import_mime_1.assertImportUploadMime)(file.mimetype, file.originalname);
        const dryRun = body.dryRun === undefined || body.dryRun === 'true';
        const data = await this.spreadsheetService.previewEmployeeImport(file.buffer, {
            mimetype: file.mimetype,
            originalname: file.originalname,
            dryRun,
        });
        return (0, api_response_1.ok)(data, 'SHEET-200', 'Import preview');
    }
    async importCommit(file, body, tenantId, companyId, authorization, internalApiKey, _idempotencyKey) {
        this.assertSpreadsheetAccess(authorization, internalApiKey);
        const scope = (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId });
        (0, spreadsheet_kinds_1.assertImportKind)(body.kind);
        if (!file?.buffer?.length) {
            throw new api_exception_1.ApiException('SHEET-400', 'Multipart file field "file" is required', common_1.HttpStatus.BAD_REQUEST);
        }
        (0, spreadsheet_import_mime_1.assertImportUploadMime)(file.mimetype, file.originalname);
        const result = await this.spreadsheetService.commitEmployeeImport(file.buffer, {
            mimetype: file.mimetype,
            originalname: file.originalname,
            companyId: scope.companyId,
            authorization,
            tenantId: scope.tenantId,
        });
        return (0, api_response_1.ok)(result, 'SHEET-201', 'Import committed');
    }
    async exportSheet(body, tenantId, headerCompanyId, authorization, internalApiKey) {
        this.assertSpreadsheetAccess(authorization, internalApiKey);
        (0, scope_context_1.resolveScopeContext)(authorization, {
            tenantId,
            companyId: body.filter.company_id ?? headerCompanyId,
        });
        const { filename, body: csv } = await this.spreadsheetService.exportEmployeesCsv(body.filter);
        return new common_1.StreamableFile(Buffer.from(csv, 'utf8'), {
            type: 'text/csv; charset=utf-8',
            disposition: `attachment; filename="${filename}"`,
        });
    }
};
exports.SpreadsheetController = SpreadsheetController;
__decorate([
    (0, common_1.Get)('limits'),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Headers)('x-internal-api-key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], SpreadsheetController.prototype, "limits", null);
__decorate([
    (0, common_1.Get)('templates/:kind'),
    __param(0, (0, common_1.Param)('kind')),
    __param(1, (0, common_1.Query)('format')),
    __param(2, (0, common_1.Headers)('authorization')),
    __param(3, (0, common_1.Headers)('x-internal-api-key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String, String]),
    __metadata("design:returntype", Promise)
], SpreadsheetController.prototype, "downloadTemplate", null);
__decorate([
    (0, common_1.Post)('import/preview'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        limits: { fileSize: (0, spreadsheet_limits_1.getSpreadsheetLimits)().maxUploadBytes },
    })),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Headers)('x-tenant-id')),
    __param(3, (0, common_1.Headers)('x-company-id')),
    __param(4, (0, common_1.Headers)('authorization')),
    __param(5, (0, common_1.Headers)('x-internal-api-key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, import_multipart_meta_dto_1.ImportMultipartMetaDto, String, String, String, String]),
    __metadata("design:returntype", Promise)
], SpreadsheetController.prototype, "importPreview", null);
__decorate([
    (0, common_1.Post)('import/commit'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        limits: { fileSize: (0, spreadsheet_limits_1.getSpreadsheetLimits)().maxUploadBytes },
    })),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Headers)('x-tenant-id')),
    __param(3, (0, common_1.Headers)('x-company-id')),
    __param(4, (0, common_1.Headers)('authorization')),
    __param(5, (0, common_1.Headers)('x-internal-api-key')),
    __param(6, (0, common_1.Headers)('idempotency-key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, import_multipart_meta_dto_1.ImportMultipartMetaDto, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], SpreadsheetController.prototype, "importCommit", null);
__decorate([
    (0, common_1.Post)('export'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('x-tenant-id')),
    __param(2, (0, common_1.Headers)('x-company-id')),
    __param(3, (0, common_1.Headers)('authorization')),
    __param(4, (0, common_1.Headers)('x-internal-api-key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [spreadsheet_export_body_dto_1.SpreadsheetExportBodyDto, String, String, String, String]),
    __metadata("design:returntype", Promise)
], SpreadsheetController.prototype, "exportSheet", null);
exports.SpreadsheetController = SpreadsheetController = __decorate([
    (0, common_1.Controller)('spreadsheet'),
    __metadata("design:paramtypes", [spreadsheet_service_1.SpreadsheetService])
], SpreadsheetController);
//# sourceMappingURL=spreadsheet.controller.js.map
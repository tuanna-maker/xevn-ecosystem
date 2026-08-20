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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpreadsheetService = void 0;
const common_1 = require("@nestjs/common");
const api_exception_1 = require("../common/api.exception");
const employees_service_1 = require("../employees/employees.service");
const spreadsheet_limits_1 = require("./spreadsheet-limits");
const spreadsheet_ingest_service_1 = require("./spreadsheet-ingest.service");
const spreadsheet_template_service_1 = require("./spreadsheet-template.service");
const spreadsheet_employee_validation_1 = require("./spreadsheet-employee-validation");
let SpreadsheetService = class SpreadsheetService {
    ingest;
    templates;
    employees;
    constructor(ingest, templates, employees) {
        this.ingest = ingest;
        this.templates = templates;
        this.employees = employees;
    }
    getLimitsSnapshot() {
        return (0, spreadsheet_limits_1.getSpreadsheetLimits)();
    }
    async previewEmployeeImport(buffer, opts) {
        const startedAt = Date.now();
        const grid = await this.ingest.parseEmployeeImportFile(buffer, { ...opts, startedAt });
        const limits = (0, spreadsheet_limits_1.getSpreadsheetLimits)();
        const errors = [];
        for (let i = 0; i < grid.rows.length; i++) {
            errors.push(...(0, spreadsheet_employee_validation_1.validateEmployeeImportRow)(grid.rows[i], i + 1));
        }
        const truncated = grid.rows.length > limits.maxPreviewRows;
        const previewRows = grid.rows.slice(0, limits.maxPreviewRows).map((r) => {
            const c = (0, spreadsheet_employee_validation_1.canonicalEmployeeFieldsFromRow)(r);
            return {
                employee_code: c.employee_code,
                email: c.email,
                full_name: c.full_name,
                job_title_key: c.job_title_key,
                hired_at: c.hired_at,
            };
        });
        return {
            kind: 'employee_import',
            headersDetected: grid.headers,
            canonicalHeaders: (0, spreadsheet_employee_validation_1.listCanonicalEmployeeHeaders)(),
            rowCount: grid.rows.length,
            previewRows,
            truncated,
            errors,
            dryRun: opts.dryRun,
        };
    }
    async commitEmployeeImport(buffer, opts) {
        const startedAt = Date.now();
        const grid = await this.ingest.parseEmployeeImportFile(buffer, { ...opts, startedAt });
        const validationErrors = [];
        for (let i = 0; i < grid.rows.length; i++) {
            validationErrors.push(...(0, spreadsheet_employee_validation_1.validateEmployeeImportRow)(grid.rows[i], i + 1));
        }
        if (validationErrors.length > 0) {
            throw new api_exception_1.ApiException('SHEET-422', 'Import validation failed', common_1.HttpStatus.UNPROCESSABLE_ENTITY, {
                rowErrors: validationErrors,
            });
        }
        const ids = [];
        const errors = [];
        for (let i = 0; i < grid.rows.length; i++) {
            const c = (0, spreadsheet_employee_validation_1.canonicalEmployeeFieldsFromRow)(grid.rows[i]);
            const dto = {
                company_id: opts.companyId,
                employee_code: c.employee_code,
                email: c.email,
                full_name: c.full_name,
                job_title_key: c.job_title_key || undefined,
                hired_at: c.hired_at || undefined,
            };
            try {
                const created = await this.employees.createEmployee(dto, opts.authorization, {
                    tenantId: opts.tenantId,
                });
                ids.push(created.id);
            }
            catch (e) {
                const msg = e instanceof api_exception_1.ApiException ? e.message : 'Create failed';
                errors.push({ row: i + 1, code: 'SHEET-422', message: msg });
            }
        }
        if (errors.length > 0) {
            throw new api_exception_1.ApiException('SHEET-422', 'Import commit partially failed', common_1.HttpStatus.UNPROCESSABLE_ENTITY, {
                rowErrors: errors,
                importedCount: ids.length,
                importedIds: ids,
            });
        }
        return { importedCount: ids.length, ids, errors: [] };
    }
    async exportEmployeesCsv(query) {
        const list = await this.employees.listEmployees({ ...query, page: 1, page_size: 100 });
        const headers = ['employee_code', 'email', 'full_name', 'job_title_key', 'status', 'hired_at'];
        const lines = [headers.join(',')];
        for (const e of list.data) {
            const cells = [
                escapeCsv(e.employee_code),
                escapeCsv(e.email),
                escapeCsv(e.full_name),
                escapeCsv(e.job_title_key ?? ''),
                escapeCsv(e.status),
                escapeCsv(e.hired_at ?? ''),
            ];
            lines.push(cells.join(','));
        }
        return { filename: 'employees_export.csv', body: lines.join('\n') + '\n' };
    }
    employeeImportCsvTemplate() {
        return this.templates.employeeImportCsv();
    }
    async employeeImportXlsxTemplate() {
        return this.templates.employeeImportXlsx();
    }
};
exports.SpreadsheetService = SpreadsheetService;
exports.SpreadsheetService = SpreadsheetService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [spreadsheet_ingest_service_1.SpreadsheetIngestService,
        spreadsheet_template_service_1.SpreadsheetTemplateService,
        employees_service_1.EmployeesService])
], SpreadsheetService);
function escapeCsv(s) {
    if (/[",\n\r]/.test(s))
        return `"${s.replace(/"/g, '""')}"`;
    return s;
}
//# sourceMappingURL=spreadsheet.service.js.map
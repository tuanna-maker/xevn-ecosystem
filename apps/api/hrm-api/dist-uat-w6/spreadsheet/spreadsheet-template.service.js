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
exports.SpreadsheetTemplateService = void 0;
const common_1 = require("@nestjs/common");
const exceljs_1 = __importDefault(require("exceljs"));
const spreadsheet_kinds_1 = require("./spreadsheet-kinds");
let SpreadsheetTemplateService = class SpreadsheetTemplateService {
    employeeImportCsv() {
        return `${spreadsheet_kinds_1.EMPLOYEE_IMPORT_TEMPLATE_HEADERS.join(',')}\n`;
    }
    async employeeImportXlsx() {
        const wb = new exceljs_1.default.Workbook();
        const ws = wb.addWorksheet('employees');
        ws.addRow([...spreadsheet_kinds_1.EMPLOYEE_IMPORT_TEMPLATE_HEADERS]);
        const buf = await wb.xlsx.writeBuffer();
        return Buffer.isBuffer(buf) ? buf : Buffer.from(buf);
    }
};
exports.SpreadsheetTemplateService = SpreadsheetTemplateService;
exports.SpreadsheetTemplateService = SpreadsheetTemplateService = __decorate([
    (0, common_1.Injectable)()
], SpreadsheetTemplateService);
//# sourceMappingURL=spreadsheet-template.service.js.map
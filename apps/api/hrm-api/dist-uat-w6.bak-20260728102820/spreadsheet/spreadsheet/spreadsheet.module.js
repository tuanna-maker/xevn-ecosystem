"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpreadsheetModule = void 0;
const common_1 = require("@nestjs/common");
const employees_module_1 = require("../employees/employees.module");
const spreadsheet_controller_1 = require("./spreadsheet.controller");
const spreadsheet_ingest_service_1 = require("./spreadsheet-ingest.service");
const spreadsheet_template_service_1 = require("./spreadsheet-template.service");
const spreadsheet_service_1 = require("./spreadsheet.service");
let SpreadsheetModule = class SpreadsheetModule {
};
exports.SpreadsheetModule = SpreadsheetModule;
exports.SpreadsheetModule = SpreadsheetModule = __decorate([
    (0, common_1.Module)({
        imports: [employees_module_1.EmployeesModule],
        controllers: [spreadsheet_controller_1.SpreadsheetController],
        providers: [spreadsheet_service_1.SpreadsheetService, spreadsheet_ingest_service_1.SpreadsheetIngestService, spreadsheet_template_service_1.SpreadsheetTemplateService],
        exports: [spreadsheet_service_1.SpreadsheetService, spreadsheet_ingest_service_1.SpreadsheetIngestService],
    })
], SpreadsheetModule);
//# sourceMappingURL=spreadsheet.module.js.map
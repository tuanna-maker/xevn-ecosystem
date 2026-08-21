"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.XbosDbModule = void 0;
const common_1 = require("@nestjs/common");
const platform_audit_controller_1 = require("../platform/platform-audit.controller");
const platform_audit_service_1 = require("../platform/platform-audit.service");
const xbos_db_service_1 = require("./xbos-db.service");
let XbosDbModule = class XbosDbModule {
};
exports.XbosDbModule = XbosDbModule;
exports.XbosDbModule = XbosDbModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        controllers: [platform_audit_controller_1.PlatformAuditController],
        providers: [xbos_db_service_1.XbosDbService, platform_audit_service_1.PlatformAuditService],
        exports: [xbos_db_service_1.XbosDbService, platform_audit_service_1.PlatformAuditService],
    })
], XbosDbModule);

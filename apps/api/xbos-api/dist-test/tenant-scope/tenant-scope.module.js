"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantScopeModule = void 0;
const common_1 = require("@nestjs/common");
const org_foundation_module_1 = require("../org-foundation/org-foundation.module");
const tenant_scope_controller_1 = require("./tenant-scope.controller");
const tenant_scope_service_1 = require("./tenant-scope.service");
let TenantScopeModule = class TenantScopeModule {
};
exports.TenantScopeModule = TenantScopeModule;
exports.TenantScopeModule = TenantScopeModule = __decorate([
    (0, common_1.Module)({
        imports: [org_foundation_module_1.OrgFoundationModule],
        controllers: [tenant_scope_controller_1.TenantScopeController],
        providers: [tenant_scope_service_1.TenantScopeService],
        exports: [tenant_scope_service_1.TenantScopeService],
    })
], TenantScopeModule);

"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrgFoundationModule = void 0;
const common_1 = require("@nestjs/common");
const xbos_db_module_1 = require("../db/xbos-db.module");
const org_foundation_controller_1 = require("./org-foundation.controller");
const org_foundation_service_1 = require("./org-foundation.service");
const legal_entity_body_middleware_1 = require("./middleware/legal-entity-body.middleware");
let OrgFoundationModule = class OrgFoundationModule {
    configure(consumer) {
        consumer.apply(legal_entity_body_middleware_1.legalEntityBodyMiddleware).forRoutes(org_foundation_controller_1.OrgFoundationController);
    }
};
exports.OrgFoundationModule = OrgFoundationModule;
exports.OrgFoundationModule = OrgFoundationModule = __decorate([
    (0, common_1.Module)({
        imports: [xbos_db_module_1.XbosDbModule],
        controllers: [org_foundation_controller_1.OrgFoundationController],
        providers: [org_foundation_service_1.OrgFoundationService],
        exports: [org_foundation_service_1.OrgFoundationService],
    })
], OrgFoundationModule);

"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PositionRbacModule = void 0;
const common_1 = require("@nestjs/common");
const xbos_db_module_1 = require("../db/xbos-db.module");
const position_rbac_controller_1 = require("./position-rbac.controller");
const position_rbac_service_1 = require("./position-rbac.service");
let PositionRbacModule = class PositionRbacModule {
};
exports.PositionRbacModule = PositionRbacModule;
exports.PositionRbacModule = PositionRbacModule = __decorate([
    (0, common_1.Module)({
        imports: [xbos_db_module_1.XbosDbModule],
        controllers: [position_rbac_controller_1.PositionRbacController],
        providers: [position_rbac_service_1.PositionRbacService],
        exports: [position_rbac_service_1.PositionRbacService],
    })
], PositionRbacModule);

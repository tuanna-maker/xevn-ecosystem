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
exports.SavePermissionMatrixRequestDto = exports.PermissionMatrixRowDto = exports.PERMISSION_DATA_SCOPES = void 0;
/**
 * @CODE-MEMORY
 * Screen:     Settings / Position RBAC matrix (UF-XBOS-13)
 * UC:         UC-CC-P0-04 · FR-CC-P0-04
 * BR:         Save checkbox flags + dataScope per roleId; skip empty rowId
 * SRS:        SRS_XBOS_KHACH.md §3.14 FR-CC-P0-04 Diễn biến #4–#7
 * TechSpec:   docs/xbos/TECHSPEC.md §14.15 · G-DTO-W2-POS-01
 * db_design:  docs/xbos/DB_DESIGN_XBOS_RACI_RBAC.md — xbos_cc_permission_matrix_cell
 * api_design: docs/xbos/API_DESIGN_XBOS_RACI_RBAC.md Endpoints E–F
 * Purpose:    Class-validator edge DTO cho PUT /position-rbac/matrix — camelCase
 *             khớp FE PermissionMatrixCell; dataScope enum FE.
 * WorkItem:   BE-XBOS-OA-DTO-P2-01
 * Coded:      2026-07-27
 * Callers:    PositionRbacController.saveMatrix
 * Callees:    ValidationPipe → PositionRbacService.savePermissionMatrix
 * FE-Actions: | Lưu ma trận | Settings RBAC | PUT matrix |
 * BE-Chain:   DTO → upsert cells ON CONFLICT role partition
 * Impact:     Sai enum/required → 400; đổi camelCase → UF-13 FAIL
 * must_keep:  UF-XBOS-13 🟢 · tenant-only scope · không ghi nhầm role khác
 * SOLID:      DTO = wire shape; Service = persist
 * LastVerified: save-permission-matrix.dto.spec.ts
 */
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
exports.PERMISSION_DATA_SCOPES = ['personal', 'department', 'legal_entity', 'group'];
/** OpenAPI PermissionMatrixRow — one checkbox row (empty rowId skipped in service). */
class PermissionMatrixRowDto {
    rowId;
    view;
    write;
    delete;
    approve;
    dataScope;
}
exports.PermissionMatrixRowDto = PermissionMatrixRowDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PermissionMatrixRowDto.prototype, "rowId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], PermissionMatrixRowDto.prototype, "view", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], PermissionMatrixRowDto.prototype, "write", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], PermissionMatrixRowDto.prototype, "delete", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], PermissionMatrixRowDto.prototype, "approve", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)([...exports.PERMISSION_DATA_SCOPES]),
    __metadata("design:type", String)
], PermissionMatrixRowDto.prototype, "dataScope", void 0);
/** OpenAPI SavePermissionMatrixRequest. */
class SavePermissionMatrixRequestDto {
    roleId;
    rows;
}
exports.SavePermissionMatrixRequestDto = SavePermissionMatrixRequestDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    __metadata("design:type", String)
], SavePermissionMatrixRequestDto.prototype, "roleId", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => PermissionMatrixRowDto),
    __metadata("design:type", Array)
], SavePermissionMatrixRequestDto.prototype, "rows", void 0);

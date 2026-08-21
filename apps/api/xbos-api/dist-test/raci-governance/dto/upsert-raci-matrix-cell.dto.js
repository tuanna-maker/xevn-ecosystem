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
exports.UpsertRaciMatrixCellRequestDto = void 0;
/**
 * @CODE-MEMORY
 * Screen:     Command Center / Org — tab Nhiệm vụ và RACI (UF-XBOS-07)
 * UC:         UC-RACI-02 · FR-XBOS-RACI-02
 * BR:         Wire raci_letters ∈ ^[RACI]*$; empty = clear override
 * SRS:        SRS_XBOS_KHACH.md §3.13 FR-XBOS-RACI-02 Diễn biến #4–#6
 * TechSpec:   docs/xbos/TECHSPEC.md §14.14 · G-DTO-W2-RACI-01
 * db_design:  docs/xbos/DB_DESIGN_XBOS_RACI_RBAC.md — company_raci_matrix_cell
 * api_design: docs/xbos/API_DESIGN_XBOS_RACI_RBAC.md Endpoint C
 * Purpose:    Class-validator edge DTO cho PUT …/matrix/cell — whitelist snake_case;
 *             chuẩn hóa letters (trim/upper) trước Matches để khớp service.
 * WorkItem:   BE-XBOS-OA-DTO-P2-01
 * Coded:      2026-07-27
 * Callers:    RaciGovernanceController.upsertCell
 * Callees:    ValidationPipe → RaciGovernanceService.upsertMatrixCell
 * FE-Actions: | Lưu ô / xóa ô | CompanyRaciPanel | PUT matrix/cell |
 * BE-Chain:   DTO validate → scope resolver → upsert cell + audit
 * Impact:     Sai pattern/required → 400 trước service; đổi field name → FE UF-07 FAIL
 * must_keep:  UF-XBOS-07 🟢 · empty letters clear · snake_case activity_id/org_column_id
 * SOLID:      DTO = transport validation; Service = persist/merge
 * LastVerified: upsert-raci-matrix-cell.dto.spec.ts
 */
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
/** Nest edge body for PUT /raci-governance/companies/:companyId/matrix/cell (OpenAPI UpsertRaciMatrixCellRequest). */
class UpsertRaciMatrixCellRequestDto {
    activity_id;
    org_column_id;
    raci_letters;
    actor_id;
}
exports.UpsertRaciMatrixCellRequestDto = UpsertRaciMatrixCellRequestDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    __metadata("design:type", String)
], UpsertRaciMatrixCellRequestDto.prototype, "activity_id", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    __metadata("design:type", String)
], UpsertRaciMatrixCellRequestDto.prototype, "org_column_id", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (value === undefined || value === null)
            return undefined;
        return String(value).trim().replace(/\s+/g, '').toUpperCase();
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^[RACI]*$/),
    __metadata("design:type", String)
], UpsertRaciMatrixCellRequestDto.prototype, "raci_letters", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpsertRaciMatrixCellRequestDto.prototype, "actor_id", void 0);

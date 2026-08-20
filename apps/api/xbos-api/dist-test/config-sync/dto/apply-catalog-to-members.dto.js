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
exports.ApplyCatalogToMembersDto = exports.ApplyCatalogMemberTargetDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
/**
 * Target partition for Option B fan-out (XBOS-DM-HRM-07 / G-BM-REC-01).
 * Prefer explicit tenant+company so member legal entities (`xe-du-lich`/`main`) work.
 */
class ApplyCatalogMemberTargetDto {
    tenantId;
    companyId;
}
exports.ApplyCatalogMemberTargetDto = ApplyCatalogMemberTargetDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^[a-z0-9][a-z0-9_-]{1,62}$/),
    __metadata("design:type", String)
], ApplyCatalogMemberTargetDto.prototype, "tenantId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^[a-z0-9][a-z0-9_-]{1,62}$/),
    __metadata("design:type", String)
], ApplyCatalogMemberTargetDto.prototype, "companyId", void 0);
/**
 * Holding (or any source partition) → copy published catalog items to selected members.
 * Must supply `targets` and/or same-tenant `memberCompanyIds`.
 */
class ApplyCatalogToMembersDto {
    /** Source tenant (typically master `xevn`). */
    tenantId;
    /** Source company (typically `holding`). */
    companyId;
    /** Cross-tenant member partitions (preferred). */
    targets;
    /**
     * Same-tenant shorthand — each id pairs with source `tenantId`.
     * SA wording «member companyIds».
     */
    memberCompanyIds;
    actor;
}
exports.ApplyCatalogToMembersDto = ApplyCatalogToMembersDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^[a-z0-9][a-z0-9_-]{1,62}$/),
    __metadata("design:type", String)
], ApplyCatalogToMembersDto.prototype, "tenantId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^[a-z0-9][a-z0-9_-]{1,62}$/),
    __metadata("design:type", String)
], ApplyCatalogToMembersDto.prototype, "companyId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMinSize)(1),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => ApplyCatalogMemberTargetDto),
    __metadata("design:type", Array)
], ApplyCatalogToMembersDto.prototype, "targets", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMinSize)(1),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.Matches)(/^[a-z0-9][a-z0-9_-]{1,62}$/, { each: true }),
    __metadata("design:type", Array)
], ApplyCatalogToMembersDto.prototype, "memberCompanyIds", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ApplyCatalogToMembersDto.prototype, "actor", void 0);

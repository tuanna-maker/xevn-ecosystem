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
exports.ListCandidatesQueryDto = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
class ListCandidatesQueryDto {
    company_id;
    requisition_id;
    page = '1';
    page_size = '20';
}
exports.ListCandidatesQueryDto = ListCandidatesQueryDto;
__decorate([
    (0, class_transformer_1.Transform)(({ value, obj }) => {
        const raw = value ?? obj?.companyId;
        if (Array.isArray(raw))
            return String(raw[0] ?? '').trim();
        return raw == null ? raw : String(raw).trim();
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(64),
    __metadata("design:type", String)
], ListCandidatesQueryDto.prototype, "company_id", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], ListCandidatesQueryDto.prototype, "requisition_id", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value, obj }) => {
        const raw = value ?? obj?.page;
        if (Array.isArray(raw))
            return String(raw[0] ?? '').trim();
        return raw == null ? raw : String(raw).trim();
    }),
    (0, class_validator_1.Matches)(/^\d+$/),
    __metadata("design:type", Object)
], ListCandidatesQueryDto.prototype, "page", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value, obj }) => {
        const raw = value ?? obj?.pageSize;
        if (Array.isArray(raw))
            return String(raw[0] ?? '').trim();
        return raw == null ? raw : String(raw).trim();
    }),
    (0, class_validator_1.Matches)(/^\d+$/),
    __metadata("design:type", Object)
], ListCandidatesQueryDto.prototype, "page_size", void 0);
//# sourceMappingURL=list-candidates.query.dto.js.map
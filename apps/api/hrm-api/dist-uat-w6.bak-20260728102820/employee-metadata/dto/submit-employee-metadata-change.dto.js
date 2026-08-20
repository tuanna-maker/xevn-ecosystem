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
exports.SubmitEmployeeMetadataChangeDto = void 0;
const class_validator_1 = require("class-validator");
class SubmitEmployeeMetadataChangeDto {
    company_id;
    employee_id;
    legal_entity_id;
    field_key;
    current_value;
    requested_value;
    reason;
    actor_user_id;
    actor_name;
    workflow_code;
    source_catalog_key;
}
exports.SubmitEmployeeMetadataChangeDto = SubmitEmployeeMetadataChangeDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SubmitEmployeeMetadataChangeDto.prototype, "company_id", void 0);
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], SubmitEmployeeMetadataChangeDto.prototype, "employee_id", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], SubmitEmployeeMetadataChangeDto.prototype, "legal_entity_id", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SubmitEmployeeMetadataChangeDto.prototype, "field_key", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsJSON)(),
    __metadata("design:type", String)
], SubmitEmployeeMetadataChangeDto.prototype, "current_value", void 0);
__decorate([
    (0, class_validator_1.IsJSON)(),
    __metadata("design:type", String)
], SubmitEmployeeMetadataChangeDto.prototype, "requested_value", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SubmitEmployeeMetadataChangeDto.prototype, "reason", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SubmitEmployeeMetadataChangeDto.prototype, "actor_user_id", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SubmitEmployeeMetadataChangeDto.prototype, "actor_name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SubmitEmployeeMetadataChangeDto.prototype, "workflow_code", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SubmitEmployeeMetadataChangeDto.prototype, "source_catalog_key", void 0);
//# sourceMappingURL=submit-employee-metadata-change.dto.js.map
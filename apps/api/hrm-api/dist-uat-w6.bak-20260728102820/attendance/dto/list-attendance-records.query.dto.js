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
exports.ListAttendanceRecordsQueryDto = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
function pickScalar(value) {
    if (Array.isArray(value)) {
        const first = value[0];
        return first == null ? undefined : String(first).trim();
    }
    if (value == null)
        return undefined;
    return String(value).trim();
}
class ListAttendanceRecordsQueryDto {
    companyId;
    company_id;
    employee_id;
    status;
    from_date;
    to_date;
    page = '1';
    pageSize;
    page_size = '20';
}
exports.ListAttendanceRecordsQueryDto = ListAttendanceRecordsQueryDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(64),
    __metadata("design:type", String)
], ListAttendanceRecordsQueryDto.prototype, "companyId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_transformer_1.Transform)(({ value, obj }) => pickScalar(value) ?? pickScalar(obj?.companyId) ?? pickScalar(obj?.company_id)),
    (0, class_validator_1.MaxLength)(64),
    __metadata("design:type", String)
], ListAttendanceRecordsQueryDto.prototype, "company_id", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], ListAttendanceRecordsQueryDto.prototype, "employee_id", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['pending', 'present', 'absent', 'leave']),
    __metadata("design:type", String)
], ListAttendanceRecordsQueryDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], ListAttendanceRecordsQueryDto.prototype, "from_date", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], ListAttendanceRecordsQueryDto.prototype, "to_date", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value, obj }) => {
        return pickScalar(value) ?? pickScalar(obj?.page);
    }),
    (0, class_validator_1.Matches)(/^\d+$/),
    __metadata("design:type", Object)
], ListAttendanceRecordsQueryDto.prototype, "page", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value, obj }) => pickScalar(value) ?? pickScalar(obj?.page_size) ?? pickScalar(obj?.pageSize)),
    (0, class_validator_1.Matches)(/^\d+$/),
    __metadata("design:type", Object)
], ListAttendanceRecordsQueryDto.prototype, "pageSize", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value, obj }) => {
        return pickScalar(value) ?? pickScalar(obj?.pageSize) ?? pickScalar(obj?.page_size);
    }),
    (0, class_validator_1.Matches)(/^\d+$/),
    __metadata("design:type", Object)
], ListAttendanceRecordsQueryDto.prototype, "page_size", void 0);
//# sourceMappingURL=list-attendance-records.query.dto.js.map
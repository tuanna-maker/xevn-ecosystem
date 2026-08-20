"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isOpenEndedContractType = isOpenEndedContractType;
exports.contractTypeRequiresEndDate = contractTypeRequiresEndDate;
exports.assertContractEndDateForCreate = assertContractEndDateForCreate;
const common_1 = require("@nestjs/common");
const api_exception_1 = require("../common/api.exception");
function normalizeContractTypeKey(raw) {
    return raw
        .trim()
        .toLowerCase()
        .replace(/đ/g, 'd')
        .normalize('NFD')
        .replace(/\p{M}/gu, '')
        .replace(/\s+/g, ' ');
}
function isOpenEndedContractType(contractType) {
    const key = normalizeContractTypeKey(contractType);
    if (!key)
        return false;
    if (key === 'indefinite' || key === 'permanent' || key === 'hdld_kth') {
        return true;
    }
    return (key.includes('indefinite') ||
        key.includes('khong thoi han') ||
        key.includes('khong xac dinh thoi han') ||
        key.includes('vo thoi han'));
}
function contractTypeRequiresEndDate(contractType) {
    return !isOpenEndedContractType(contractType);
}
function assertContractEndDateForCreate(input) {
    const end = input.endDate?.trim() ? input.endDate.trim() : null;
    if (!end) {
        if (contractTypeRequiresEndDate(input.contractType)) {
            throw new api_exception_1.ApiException('HRM-CON-002', 'end_date is required for this contract_type', common_1.HttpStatus.BAD_REQUEST);
        }
        return;
    }
    if (new Date(input.startDate).getTime() > new Date(end).getTime()) {
        throw new api_exception_1.ApiException('HRM-CON-001', 'start_date must be <= end_date', common_1.HttpStatus.BAD_REQUEST);
    }
}
//# sourceMappingURL=contract-end-date-policy.js.map
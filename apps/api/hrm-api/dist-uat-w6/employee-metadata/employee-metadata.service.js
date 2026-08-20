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
exports.EmployeeMetadataService = void 0;
const common_1 = require("@nestjs/common");
const api_exception_1 = require("../common/api.exception");
const hrm_list_scope_1 = require("../common/hrm-list-scope");
const employee_metadata_repository_1 = require("./employee-metadata.repository");
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
let EmployeeMetadataService = class EmployeeMetadataService {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    assertMetadataCompanyWire(requestedCompanyId) {
        const trimmed = requestedCompanyId.trim();
        if (UUID_RE.test(trimmed) && !(0, hrm_list_scope_1.isHrmMappedCompanyUuid)(trimmed)) {
            (0, hrm_list_scope_1.assertHrmMappedCompanyUuidOrThrow)(trimmed);
        }
    }
    resolveMetadataCompanyUuid(rawCompanyId) {
        const trimmed = rawCompanyId.trim();
        if (UUID_RE.test(trimmed)) {
            return (0, hrm_list_scope_1.assertHrmMappedCompanyUuidOrThrow)(trimmed);
        }
        const resolved = (0, hrm_list_scope_1.resolveHrmCompanyUuidForSlug)(trimmed);
        if (!resolved) {
            throw new api_exception_1.ApiException('HRM-VAL-001', 'company_id must be a UUID or known operating slug (holding, finance, …)', common_1.HttpStatus.BAD_REQUEST, { company_id: rawCompanyId });
        }
        return resolved;
    }
    async submitChangeRequest(payload) {
        const companyId = this.resolveMetadataCompanyUuid(payload.company_id);
        return this.repository.submitChange({
            company_id: companyId,
            employee_id: payload.employee_id,
            legal_entity_id: payload.legal_entity_id,
            field_key: payload.field_key.trim(),
            current_value: payload.current_value ? JSON.parse(payload.current_value) : null,
            requested_value: JSON.parse(payload.requested_value),
            reason: payload.reason,
            actor_user_id: payload.actor_user_id,
            actor_name: payload.actor_name,
            workflow_code: payload.workflow_code ?? 'xbos.employee_metadata.default',
            source_catalog_key: payload.source_catalog_key ?? 'employee_profile',
        });
    }
    async listChangeRequests(query, authorization) {
        this.assertMetadataCompanyWire(query.company_id);
        return this.repository.listChangeRequests({
            employee_id: query.employee_id,
            legal_entity_id: query.legal_entity_id,
            status: query.status,
            field_key: query.field_key?.trim(),
            page: query.page ?? 1,
            page_size: query.page_size ?? 20,
        }, authorization, query.company_id);
    }
    async approveChangeRequest(changeRequestId, decision, requestedCompanyId, authorization) {
        this.assertMetadataCompanyWire(requestedCompanyId);
        const scope = (0, hrm_list_scope_1.resolveHrmListScope)(authorization, requestedCompanyId);
        const pending = await this.repository.getChangeRequestById(changeRequestId);
        (0, hrm_list_scope_1.assertResourceInHrmScope)(pending, scope, {
            notFoundCode: 'HRM-META-404',
            mismatchCode: 'HRM-META-409',
        });
        const request = await this.repository.approveChangeRequest(changeRequestId, decision);
        if (!request) {
            throw new api_exception_1.ApiException('HRM-META-404', 'Metadata change request not found', common_1.HttpStatus.NOT_FOUND);
        }
        if (request.status !== 'approved') {
            throw new api_exception_1.ApiException('HRM-META-409', 'Metadata change request is not pending', common_1.HttpStatus.CONFLICT);
        }
        return request;
    }
    async rejectChangeRequest(changeRequestId, decision, requestedCompanyId, authorization) {
        this.assertMetadataCompanyWire(requestedCompanyId);
        const scope = (0, hrm_list_scope_1.resolveHrmListScope)(authorization, requestedCompanyId);
        const pending = await this.repository.getChangeRequestById(changeRequestId);
        (0, hrm_list_scope_1.assertResourceInHrmScope)(pending, scope, {
            notFoundCode: 'HRM-META-404',
            mismatchCode: 'HRM-META-409',
        });
        const request = await this.repository.rejectChangeRequest(changeRequestId, decision);
        if (!request) {
            throw new api_exception_1.ApiException('HRM-META-404', 'Metadata change request not found or not pending', common_1.HttpStatus.NOT_FOUND);
        }
        return request;
    }
    async listAuditLogs(companyId, employeeId, authorization) {
        this.assertMetadataCompanyWire(companyId);
        const data = await this.repository.listAuditLogs(companyId, employeeId, authorization);
        return {
            total: data.length,
            data,
        };
    }
};
exports.EmployeeMetadataService = EmployeeMetadataService;
exports.EmployeeMetadataService = EmployeeMetadataService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [employee_metadata_repository_1.EmployeeMetadataRepository])
], EmployeeMetadataService);
//# sourceMappingURL=employee-metadata.service.js.map
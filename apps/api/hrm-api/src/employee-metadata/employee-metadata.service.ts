import { HttpStatus, Injectable } from '@nestjs/common';
import { ApiException } from '../common/api.exception';
import { assertResourceInHrmScope, resolveHrmListScope } from '../common/hrm-list-scope';
import { DecideEmployeeMetadataChangeDto } from './dto/decide-employee-metadata-change.dto';
import { ListEmployeeMetadataChangeRequestsQueryDto } from './dto/list-employee-metadata-change-requests.query.dto';
import { SubmitEmployeeMetadataChangeDto } from './dto/submit-employee-metadata-change.dto';
import { EmployeeMetadataRepository } from './employee-metadata.repository';
import { resolveHrmCompanyUuidForSlug } from '../common/hrm-list-scope';

@Injectable()
export class EmployeeMetadataService {
  constructor(private readonly repository: EmployeeMetadataRepository) {}

  private resolveMetadataCompanyUuid(rawCompanyId: string): string {
    const resolved = resolveHrmCompanyUuidForSlug(rawCompanyId);
    if (!resolved) {
      throw new ApiException(
        'HRM-VAL-001',
        'company_id must be a UUID or known operating slug (holding, finance, …)',
        HttpStatus.BAD_REQUEST,
        { company_id: rawCompanyId },
      );
    }
    return resolved;
  }

  async submitChangeRequest(payload: SubmitEmployeeMetadataChangeDto) {
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

  async listChangeRequests(query: ListEmployeeMetadataChangeRequestsQueryDto, authorization?: string) {
    return this.repository.listChangeRequests(
      {
        employee_id: query.employee_id,
        legal_entity_id: query.legal_entity_id,
        status: query.status,
        field_key: query.field_key?.trim(),
        page: query.page ?? 1,
        page_size: query.page_size ?? 20,
      },
      authorization,
      query.company_id,
    );
  }

  async approveChangeRequest(
    changeRequestId: string,
    decision: DecideEmployeeMetadataChangeDto,
    requestedCompanyId: string,
    authorization?: string,
  ) {
    const scope = resolveHrmListScope(authorization, requestedCompanyId);
    const pending = await this.repository.getChangeRequestById(changeRequestId);
    assertResourceInHrmScope(pending, scope, {
      notFoundCode: 'HRM-META-404',
      mismatchCode: 'HRM-META-409',
    });
    const request = await this.repository.approveChangeRequest(changeRequestId, decision);
    if (!request) {
      throw new ApiException('HRM-META-404', 'Metadata change request not found', HttpStatus.NOT_FOUND);
    }
    if (request.status !== 'approved') {
      throw new ApiException('HRM-META-409', 'Metadata change request is not pending', HttpStatus.CONFLICT);
    }
    return request;
  }

  async rejectChangeRequest(
    changeRequestId: string,
    decision: DecideEmployeeMetadataChangeDto,
    requestedCompanyId: string,
    authorization?: string,
  ) {
    const scope = resolveHrmListScope(authorization, requestedCompanyId);
    const pending = await this.repository.getChangeRequestById(changeRequestId);
    assertResourceInHrmScope(pending, scope, {
      notFoundCode: 'HRM-META-404',
      mismatchCode: 'HRM-META-409',
    });
    const request = await this.repository.rejectChangeRequest(changeRequestId, decision);
    if (!request) {
      throw new ApiException('HRM-META-404', 'Metadata change request not found or not pending', HttpStatus.NOT_FOUND);
    }
    return request;
  }

  async listAuditLogs(companyId: string, employeeId: string | undefined, authorization?: string) {
    const data = await this.repository.listAuditLogs(companyId, employeeId, authorization);
    return {
      total: data.length,
      data,
    };
  }
}

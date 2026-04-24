import { Injectable } from '@nestjs/common';
import { ConfigService } from '../config/config.service';
import type { FieldValidationError } from '../config/config.types';

export type EmployeeMetadataValueRecord = {
  tenantId: string;
  employeeId: string;
  legalEntityId: string;
  effectiveConfigVersion: string;
  values: Record<string, string | number | boolean | null>;
  updatedAt: string;
};

export type EmployeeMetadataChangeStatus = 'pending_approval' | 'approved' | 'rejected';

export type EmployeeMetadataChangeRequest = {
  id: string;
  tenantId: string;
  employeeId: string;
  legalEntityId: string;
  effectiveConfigVersion: string;
  values: Record<string, string | number | boolean | null>;
  reason: string;
  requestedBy: string;
  status: EmployeeMetadataChangeStatus;
  errors: FieldValidationError[];
  auditTrail: Array<{
    action: 'submitted' | 'approved' | 'rejected';
    actorUserId: string;
    at: string;
    reason?: string;
  }>;
  createdAt: string;
  updatedAt: string;
};

@Injectable()
export class HrmService {
  private readonly metadataValues = new Map<string, EmployeeMetadataValueRecord>();
  private readonly changeRequests = new Map<string, EmployeeMetadataChangeRequest>();

  constructor(private readonly configService: ConfigService) {}

  getEmployeeMetadataForm(input: {
    tenantId: string;
    legalEntityId: string;
    employeeId: string;
  }) {
    const effective = this.configService.getEffectiveConfig({
      tenantId: input.tenantId,
      moduleCode: 'hrm',
      originCode: 'employee_profile',
      legalEntityId: input.legalEntityId,
    });
    const record = this.metadataValues.get(this.key(input.tenantId, input.employeeId));

    return {
      employeeId: input.employeeId,
      effectiveConfig: effective,
      values: record?.values ?? {},
      effectiveConfigVersion: record?.effectiveConfigVersion ?? effective.etag,
    };
  }

  upsertEmployeeMetadataValues(input: {
    tenantId: string;
    legalEntityId: string;
    employeeId: string;
    values: Record<string, string | number | boolean | null>;
  }): { record?: EmployeeMetadataValueRecord; errors: FieldValidationError[] } {
    const effective = this.configService.getEffectiveConfig({
      tenantId: input.tenantId,
      moduleCode: 'hrm',
      originCode: 'employee_profile',
      legalEntityId: input.legalEntityId,
    });
    const errors = this.configService.validatePayload(effective.fields, input.values);
    if (errors.length > 0) {
      return { errors };
    }

    const record: EmployeeMetadataValueRecord = {
      tenantId: input.tenantId,
      employeeId: input.employeeId,
      legalEntityId: input.legalEntityId,
      effectiveConfigVersion: effective.etag,
      values: input.values,
      updatedAt: new Date().toISOString(),
    };
    this.metadataValues.set(this.key(input.tenantId, input.employeeId), record);
    return { record, errors: [] };
  }

  submitMetadataChangeRequest(input: {
    tenantId: string;
    legalEntityId: string;
    employeeId: string;
    values: Record<string, string | number | boolean | null>;
    reason: string;
    requestedBy: string;
  }): EmployeeMetadataChangeRequest {
    const effective = this.configService.getEffectiveConfig({
      tenantId: input.tenantId,
      moduleCode: 'hrm',
      originCode: 'employee_profile',
      legalEntityId: input.legalEntityId,
    });
    const errors = this.configService.validatePayload(effective.fields, input.values);
    const now = new Date().toISOString();
    const request: EmployeeMetadataChangeRequest = {
      id: `hrm-meta-cr-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      tenantId: input.tenantId,
      employeeId: input.employeeId,
      legalEntityId: input.legalEntityId,
      effectiveConfigVersion: effective.etag,
      values: input.values,
      reason: input.reason,
      requestedBy: input.requestedBy,
      status: errors.length > 0 ? 'rejected' : 'pending_approval',
      errors,
      auditTrail: [
        {
          action: 'submitted',
          actorUserId: input.requestedBy,
          at: now,
          reason: input.reason,
        },
      ],
      createdAt: now,
      updatedAt: now,
    };
    if (errors.length > 0) {
      request.auditTrail.push({
        action: 'rejected',
        actorUserId: 'system-validator',
        at: now,
        reason: 'Payload không đạt validation theo effective config.',
      });
    }
    this.changeRequests.set(request.id, request);
    return request;
  }

  listMetadataChangeRequests(input: {
    tenantId: string;
    employeeId?: string;
    status?: EmployeeMetadataChangeStatus;
  }): EmployeeMetadataChangeRequest[] {
    return [...this.changeRequests.values()]
      .filter((request) => request.tenantId === input.tenantId)
      .filter((request) => (input.employeeId ? request.employeeId === input.employeeId : true))
      .filter((request) => (input.status ? request.status === input.status : true))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  approveMetadataChangeRequest(input: {
    tenantId: string;
    requestId: string;
    actorUserId: string;
  }): EmployeeMetadataChangeRequest {
    const request = this.changeRequests.get(input.requestId);
    if (!request || request.tenantId !== input.tenantId) {
      throw new Error(`Không tìm thấy yêu cầu thay đổi ${input.requestId}.`);
    }
    if (request.status !== 'pending_approval') {
      return request;
    }
    const result = this.upsertEmployeeMetadataValues({
      tenantId: request.tenantId,
      legalEntityId: request.legalEntityId,
      employeeId: request.employeeId,
      values: request.values,
    });
    const now = new Date().toISOString();
    request.status = result.errors.length > 0 ? 'rejected' : 'approved';
    request.errors = result.errors;
    request.updatedAt = now;
    request.auditTrail.push({
      action: request.status === 'approved' ? 'approved' : 'rejected',
      actorUserId: input.actorUserId,
      at: now,
      reason: request.status === 'approved' ? 'Đã duyệt và ghi metadata values.' : 'Validation lại thất bại khi duyệt.',
    });
    this.changeRequests.set(request.id, request);
    return request;
  }

  private key(tenantId: string, employeeId: string): string {
    return `${tenantId}:${employeeId}`;
  }
}

import { Injectable } from '@nestjs/common';
import type { EmployeeMetadataChangeRequest, EmployeeMetadataChangeStatus, EmployeeMetadataValueRecord } from './hrm.service';

export const HRM_REPOSITORY = Symbol('HRM_REPOSITORY');

export abstract class HrmRepository {
  abstract getMetadataValues(tenantId: string, employeeId: string): EmployeeMetadataValueRecord | undefined;
  abstract saveMetadataValues(record: EmployeeMetadataValueRecord): EmployeeMetadataValueRecord;
  abstract createMetadataChangeRequest(request: EmployeeMetadataChangeRequest): EmployeeMetadataChangeRequest;
  abstract getMetadataChangeRequest(requestId: string): EmployeeMetadataChangeRequest | undefined;
  abstract saveMetadataChangeRequest(request: EmployeeMetadataChangeRequest): EmployeeMetadataChangeRequest;
  abstract listMetadataChangeRequests(input: {
    tenantId: string;
    employeeId?: string;
    status?: EmployeeMetadataChangeStatus;
  }): EmployeeMetadataChangeRequest[];
}

@Injectable()
export class InMemoryHrmRepository extends HrmRepository {
  private readonly metadataValues = new Map<string, EmployeeMetadataValueRecord>();
  private readonly changeRequests = new Map<string, EmployeeMetadataChangeRequest>();

  getMetadataValues(tenantId: string, employeeId: string): EmployeeMetadataValueRecord | undefined {
    return this.metadataValues.get(this.valueKey(tenantId, employeeId));
  }

  saveMetadataValues(record: EmployeeMetadataValueRecord): EmployeeMetadataValueRecord {
    this.metadataValues.set(this.valueKey(record.tenantId, record.employeeId), record);
    return record;
  }

  createMetadataChangeRequest(request: EmployeeMetadataChangeRequest): EmployeeMetadataChangeRequest {
    this.changeRequests.set(request.id, request);
    return request;
  }

  getMetadataChangeRequest(requestId: string): EmployeeMetadataChangeRequest | undefined {
    return this.changeRequests.get(requestId);
  }

  saveMetadataChangeRequest(request: EmployeeMetadataChangeRequest): EmployeeMetadataChangeRequest {
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

  private valueKey(tenantId: string, employeeId: string): string {
    return `${tenantId}:${employeeId}`;
  }
}

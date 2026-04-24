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

@Injectable()
export class HrmService {
  private readonly metadataValues = new Map<string, EmployeeMetadataValueRecord>();

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

  private key(tenantId: string, employeeId: string): string {
    return `${tenantId}:${employeeId}`;
  }
}

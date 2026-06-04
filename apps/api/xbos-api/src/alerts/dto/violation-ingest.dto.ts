import { IsIn, IsObject, IsOptional, IsString, MinLength } from 'class-validator';
import { VIOLATION_SEVERITIES } from '../satellite-alerts.constants';

export class ViolationIngestDto {
  @IsString()
  @MinLength(1)
  tenantId!: string;

  @IsString()
  @MinLength(1)
  moduleCode!: string;

  @IsString()
  @MinLength(1)
  occurredAt!: string;

  @IsObject()
  entityRef!: Record<string, unknown>;

  @IsString()
  @MinLength(1)
  ruleId!: string;

  @IsString()
  @IsIn([...VIOLATION_SEVERITIES])
  severity!: (typeof VIOLATION_SEVERITIES)[number];

  @IsObject()
  metricSnapshot!: Record<string, unknown>;

  @IsString()
  @MinLength(1)
  correlationId!: string;

  @IsOptional()
  @IsString()
  companyId?: string;

  @IsOptional()
  @IsString()
  summary?: string;
}

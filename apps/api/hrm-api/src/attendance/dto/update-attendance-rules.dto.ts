import {
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

/** Residual ATT-02 band row (display-ready camelCase). */
export class LatePenaltyBandDto {
  @IsNumber()
  @Min(0)
  fromMinutes!: number;

  @IsNumber()
  @Min(0)
  toMinutes!: number;

  @IsNumber()
  @Min(0)
  penaltyHours!: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  blockMinutes?: number;
}

/**
 * F-ATT-RULE-01 RETAIN CFG + residual ADD mode/bands/scope/off
 * (PO-HRM-MVP-GD1-ATT-02-CLUSTER-BE-01).
 */
export class UpdateAttendanceRulesDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(31)
  work_start_day?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(31)
  work_end_day?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  work_days?: string[];

  @IsOptional()
  @IsInt()
  @IsIn([0, 5, 10, 15])
  round_in_minutes?: number;

  @IsOptional()
  @IsInt()
  @IsIn([0, 5, 10, 15])
  round_out_minutes?: number;

  @IsOptional()
  @IsString()
  @IsIn(['fixed', 'monthly'])
  standard_type?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  standard_days_per_month?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  hours_per_day?: number;

  @IsOptional()
  @IsBoolean()
  allow_multiple_checkin?: boolean;

  @IsOptional()
  @IsBoolean()
  auto_checkout?: boolean;

  @IsOptional()
  @IsBoolean()
  notify_late?: boolean;

  /** Display-ready alias — peer ≠ latePenaltyEnabled off. */
  @IsOptional()
  @IsBoolean()
  notifyLate?: boolean;

  @IsOptional()
  @IsBoolean()
  gps_enabled?: boolean;

  @IsOptional()
  @IsBoolean()
  wifi_enabled?: boolean;

  @IsOptional()
  @IsBoolean()
  qr_enabled?: boolean;

  @IsOptional()
  @IsBoolean()
  gpsEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  wifiEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  qrEnabled?: boolean;

  /** GĐ1 OUT — persisted false; ignored if client sends true (ADR D4). */
  @IsOptional()
  @IsBoolean()
  faceid_enabled?: boolean;

  // ── Residual ATT-02 late-penalty (R-ATT-02-MODE/SCOPE/OFF) ──────────────

  /** XOR SoT: minute | block | tier (band alias). */
  @IsOptional()
  mode?: string | string[];

  /** Reject when length > 1 (mixed modes). */
  @IsOptional()
  @IsArray()
  modes?: string[];

  @IsOptional()
  @IsBoolean()
  modeMinute?: boolean;

  @IsOptional()
  @IsBoolean()
  modeBlock?: boolean;

  @IsOptional()
  @IsBoolean()
  modeTier?: boolean;

  @IsOptional()
  @IsBoolean()
  modeBand?: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LatePenaltyBandDto)
  bands?: LatePenaltyBandDto[];

  @IsOptional()
  @IsBoolean()
  latePenaltyEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  late_penalty_enabled?: boolean;

  @IsOptional()
  @IsString()
  departmentId?: string | null;

  @IsOptional()
  @IsString()
  department_id?: string | null;

  @IsOptional()
  @IsString()
  shiftId?: string | null;

  @IsOptional()
  @IsString()
  shift_id?: string | null;
}

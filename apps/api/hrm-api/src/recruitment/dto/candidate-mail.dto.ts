/**
 * @CODE-MEMORY
 * Screen:     HRM Tuyển dụng → UV↔YCTD → Gửi thư theo mẫu
 * UC:         UC-BP-REC-06 · F-REC-MAIL-01
 * BR:         BR-BP-MAIL-01 · VAL-REC-ME-01/03/05/09
 * SRS:        SRS_HRM_ENTERPRISE.md FR-UC-BP-REC-06 Diễn biến #1
 * TechSpec:   docs/program/specs/PO-HRM-MVP-GD1-REC-06-CLUSTER-API-01.md §5.1–5.2
 * Purpose:    Body/query POST/GET …/candidates/:id/mail — template + to + CC invite.
 * WorkItem:   PO-HRM-MVP-GD1-REC-06-CLUSTER-BE-01
 * Coded:      2026-08-09
 * Callers:    recruitment.controller → enqueueCandidateMail / listCandidateMail
 * must_keep:  physical /recruitment · DENY Nest /rec · no stage mutate · U65 no seed
 * LastVerified: po-hrm-mvp-gd1-rec-06-cluster-be-01.spec.ts
 */
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

export class EnqueueCandidateMailDto {
  @IsString()
  @MinLength(1)
  @MaxLength(64)
  template_code!: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsEmail({}, { each: true })
  to!: string[];

  /** Required non-empty when template_code=interview_invite (BR-BP-MAIL-01). */
  @IsOptional()
  @IsArray()
  @IsEmail({}, { each: true })
  cc_interviewers?: string[];

  @IsOptional()
  @IsObject()
  payload?: Record<string, unknown>;

  @IsOptional()
  @IsUUID()
  application_id?: string;

  /**
   * Test/ops-only: force provider fail after persist outbox+log failed —
   * must NOT mutate Lane A stage (O7/O8).
   */
  @IsOptional()
  simulate_provider_fail?: boolean;
}

export class ListCandidateMailQueryDto {
  @IsOptional()
  @IsString()
  company_id?: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  status?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number;
}

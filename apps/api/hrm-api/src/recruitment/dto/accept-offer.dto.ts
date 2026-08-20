/**
 * @CODE-MEMORY
 * Screen:     HRM Tuyển dụng → UV↔YCTD → Chấp nhận offer
 * UC:         UC-BP-REC-07 · F-REC-HIRE-01
 * BR:         BR-BP-LC-01 · VAL-REC-HIRE-01..24 · O11 PAY strip
 * SRS:        SRS_HRM_ENTERPRISE.md FR-UC-BP-REC-07 Diễn biến #1–#2
 * TechSpec:   docs/program/specs/PO-HRM-MVP-GD1-REC-07-CLUSTER-API-01.md §5.1
 * Purpose:    Optional body for POST …/applications/:id/accept-offer — no PAY fields.
 * WorkItem:   PO-HRM-MVP-GD1-REC-07-CLUSTER-BE-01
 * Coded:      2026-08-09
 * Callers:    recruitment.controller → acceptOfferApplication
 * must_keep:  physical /recruitment · DENY Nest /rec · DENY payroll invent · U65 no seed
 * LastVerified: po-hrm-mvp-gd1-rec-07-cluster-be-01.spec.ts
 */
import {
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
} from 'class-validator';

export class AcceptOfferDto {
  /** Prefer → employees.hired_at (ISO date YYYY-MM-DD). */
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'expected_start_date must be ISO date YYYY-MM-DD',
  })
  expected_start_date?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  note?: string;

  /** Soft offer entity id if exists elsewhere — NULL OK · DENY invent rec_offer table. */
  @IsOptional()
  @IsUUID()
  offer_id?: string;
}

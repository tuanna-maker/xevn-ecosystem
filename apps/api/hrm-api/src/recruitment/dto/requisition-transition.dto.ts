/**
 * @CODE-MEMORY
 * Screen:     HRM Tuyển dụng → YCTD → Duyệt / Từ chối
 * UC:         UC-BP-REC-02 · UC-BP-REC-02b · F-REC-YCTD-03
 * BR:         VAL-10/11/17 · Y-S9 · O3 open_for_hire
 * SRS:        FR-UC-BP-REC-02 Diễn biến #3–#4 · FR-UC-BP-REC-02b #2–#5
 * TechSpec:   docs/program/specs/PO-HRM-MVP-GD1-REC-02-CLUSTER-API-01.md §5.3 · §6.3
 * Purpose:    Thin transitions DTO (approve → open_for_hire / reject + reason).
 * WorkItem:   PO-HRM-MVP-GD1-REC-02-CLUSTER-BE-01
 * Coded:      2026-08-09
 * Callers:    recruitment.controller → transitionJobRequisition
 * must_keep:  XBOS callback primary · soft-delete · U65 no seed · DENY warn-cho-qua
 * LastVerified: po-hrm-mvp-gd1-rec-02-cluster-be-01.spec.ts
 */
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export class RequisitionTransitionDto {
  @IsIn(['approve', 'reject'])
  action!: 'approve' | 'reject';

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  comment?: string;

  /** Required when action=reject (VAL-17). */
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  rejected_reason?: string;

  /**
   * Optional BOD stamp for out_of_plan — when true on approve from pending/approved,
   * unlocks receivable open_for_hire (Y-S9). Default false ⇒ stay non-receivable.
   */
  @IsOptional()
  bod_complete?: boolean;
}

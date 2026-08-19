/**
 * @CODE-MEMORY
 * Screen:     HRM → Tuyển dụng → Đổi lịch PV (R-A)
 * UC:         UC-BP-REC-06a · FR-UC-BP-REC-06a Diễn biến #7
 * BR:         BR-BP-REC-IV-03 · AC-REC-IV-05
 * SRS:        SRS_HRM_ENTERPRISE.md FR-UC-BP-REC-06a
 * TechSpec:   docs/program/specs/PO-HRM-MVP-GD1-REC-06A-CLUSTER-API-01.md F-REC-IV-03
 * Purpose:    R-A PATCH scheduled_at (± interviewer) trên cùng row ACTIVE — không INSERT ACTIVE thứ hai.
 * WorkItem:   PO-HRM-MVP-GD1-REC-06A-CLUSTER-BE-01
 * Coded:      2026-08-09
 * Callers:    RecruitmentController.rescheduleInterview
 * Callees:    RecruitmentService.rescheduleInterview
 * must_keep:  same id ACTIVE · never second ACTIVE · past CFG · Lane A only
 * SOLID:      DTO tách khỏi UpdateInterviewStatusDto (status vs datetime)
 * LastVerified: po-hrm-mvp-gd1-rec-06a-cluster-be-01.spec.ts
 */
import { IsISO8601, IsOptional, IsString, MaxLength } from 'class-validator';

export class RescheduleInterviewDto {
  @IsISO8601()
  scheduled_at!: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  interviewer?: string;
}

/**
 * @CODE-MEMORY
 * Purpose:    NestJS module wiring for Grade Management (E1).
 *             Register this module in hrm-api AppModule.
 * WorkItem:   HRM-POLICY-E1-01
 * Coded:      2026-08-22
 * must_keep:  GradeService exported — used by PayrollBatchModule
 */
import { Module } from "@nestjs/common";
import { EmployeeGradeController, GradeController } from "./grade.controller";
import { GradePromotionService } from "./grade-promotion.service";
import { GradeService } from "./grade.service";

@Module({
  controllers: [GradeController, EmployeeGradeController],
  providers: [GradeService, GradePromotionService],
  exports: [GradeService], // PayrollBatchService dùng getCurrentGradeStep
})
export class GradeModule {}

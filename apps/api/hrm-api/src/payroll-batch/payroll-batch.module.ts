/**
 * Purpose:    NestJS module wiring for Payroll Batch Engine (E4).
 * WorkItem:   HRM-POLICY-E4-01
 * must_keep:  Imports GradeModule + InputModule + PolicyModule (all export their services)
 */
import { Module } from "@nestjs/common";
import { GradeModule } from "../grade/grade.module";
import { InputModule } from "../input/input.module";
import { PolicyModule } from "../policy/policy.module";
import { PayrollBatchController } from "./payroll-batch.controller";
import { PayrollBatchService } from "./payroll-batch.service";
import { PoolCalculationService } from "./pool-calculation.service";

@Module({
  imports: [GradeModule, InputModule, PolicyModule],
  controllers: [PayrollBatchController],
  providers: [PayrollBatchService, PoolCalculationService],
})
export class PayrollBatchModule {}

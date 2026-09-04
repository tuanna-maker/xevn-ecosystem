/**
 * Purpose:    NestJS module wiring for Policy Engine (PolicyHub v2).
 * UC:         UC-POL-01..06
 * must_keep:  PolicyService exported — used by PayrollBatchModule
 */
import { Module } from "@nestjs/common";
import { PolicyController, GradesController } from "./policy.controller";
import { PolicyService } from "./policy.service";

@Module({
  controllers: [PolicyController, GradesController],
  providers: [PolicyService],
  exports: [PolicyService],
})
export class PolicyModule {}

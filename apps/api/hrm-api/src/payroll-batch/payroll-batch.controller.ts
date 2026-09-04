/**
 * Purpose: REST endpoints for Payroll Batch + Payslip.
 * WorkItem: HRM-POLICY-E4-01
 * Coded:    2026-08-22
 */
import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from "@nestjs/common";
import type { Request } from "express";
import { HrmJwtGuard } from "../common/hrm-jwt.guard";
import { PayrollBatchService } from "./payroll-batch.service";

type HrmRequest = Request & { hrmUser: { tenantId: string; userId: string } };

@Controller("payroll-batch")
@UseGuards(HrmJwtGuard)
export class PayrollBatchController {
  constructor(private readonly batchSvc: PayrollBatchService) {}

  /** POST /payroll-batch/run */
  @Post("run")
  async runBatch(@Req() req: HrmRequest, @Body("period_month") periodMonth: string) {
    if (!periodMonth) throw { statusCode: 400, message: "period_month is required (YYYY-MM)" };
    return this.batchSvc.runBatch(req.hrmUser.tenantId, periodMonth, req.hrmUser.userId);
  }

  /** POST /payroll-batch/:id/approve */
  @Post(":id/approve")
  async approve(@Req() req: HrmRequest, @Param("id") id: string) {
    return this.batchSvc.approveBatch(req.hrmUser.tenantId, id, req.hrmUser.userId);
  }

  /** GET /payroll-batch/payslip/:employeeId?period_month=YYYY-MM */
  @Get("payslip/:employeeId")
  async getPayslip(
    @Req() req: HrmRequest,
    @Param("employeeId") employeeId: string,
    @Query("period_month") periodMonth: string,
  ) {
    if (!periodMonth) throw { statusCode: 400, message: "period_month is required" };
    return this.batchSvc.getPayslip(req.hrmUser.tenantId, employeeId, periodMonth);
  }
}

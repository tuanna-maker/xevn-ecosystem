/**
 * @CODE-MEMORY
 * Screen:     HRM · Payroll module wiring
 * UC:         BA-HRM-PAYROLL-FORMULA-INPUT-PACK-BE-01
 * Purpose:    NestJS module registration for all payroll controllers and services.
 *             Register this module in apps/api/hrm-api/src/app.module.ts imports[].
 * WorkItem:   BA-HRM-PAYROLL-FORMULA-INPUT-PACK-BE-01
 * Coded:      2026-08-15
 * must_keep:  PayrollController must stay in this module; HrmJwtGuard is applied per-controller
 */
import { Module } from '@nestjs/common';
import { PayrollController } from './payroll.controller';

@Module({
  controllers: [PayrollController],
})
export class PayrollModule {}

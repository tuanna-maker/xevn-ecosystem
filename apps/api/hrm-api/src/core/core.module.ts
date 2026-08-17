import { Global, Module } from '@nestjs/common';
import { HrmDbService } from '../db/hrm-db.service';
import { HrmRealtimeService } from '../realtime/hrm-realtime.service';

/**
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-CORE-07-CLUSTER-BE-01
 * change_mode: ADD
 * What: Export HrmRealtimeService globally so EmployeesModule can emit employee.activated
 *       on the same singleton gateway attaches (R-CORE-07-ATT-12 wire-only).
 * must_keep: no Nest /core dual · OUT invent ATT enroll DONE · no second realtime SoT
 */
@Global()
@Module({
  providers: [HrmDbService, HrmRealtimeService],
  exports: [HrmDbService, HrmRealtimeService],
})
export class CoreModule {}

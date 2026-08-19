import { Injectable, OnModuleInit } from '@nestjs/common';
import { HrmRealtimeService } from '../realtime/hrm-realtime.service';
import { AttActivateEnrollService } from './att-activate-enroll.service';

/** R-ATT-12-CONSUMER — wire employee.activated → attendance enroll (OUT grant on employees.service). */
@Injectable()
export class AttEmployeeActivatedConsumer implements OnModuleInit {
  constructor(
    private readonly realtime: HrmRealtimeService,
    private readonly enroll: AttActivateEnrollService,
  ) {}

  onModuleInit(): void {
    this.realtime.registerEmployeeActivatedHandler((payload) =>
      this.enroll.handleEmployeeActivated(payload),
    );
  }
}

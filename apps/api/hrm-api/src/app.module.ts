import { Module } from '@nestjs/common';
import { SpreadsheetModule } from './spreadsheet/spreadsheet.module';
import { AppController } from './app.controller';
import { CoreModule } from './core/core.module';
import { HrmAdminController } from './hrm-admin/hrm-admin.controller';
import { HrmAdminService } from './hrm-admin/hrm-admin.service';
import { CatalogSyncController } from './catalog-sync/catalog-sync.controller';
import { CatalogSyncService } from './catalog-sync/catalog-sync.service';
import { EmployeesModule } from './employees/employees.module';
import { FleetModule } from './fleet/fleet.module';
import { PayrollController } from './payroll/payroll.controller';
import { PayrollService } from './payroll/payroll.service';
import { AttendanceController } from './attendance/attendance.controller';
import { AttendanceService } from './attendance/attendance.service';
import { LeaveRequestsService } from './attendance/leave-requests.service';
import { RecruitmentController } from './recruitment/recruitment.controller';
import { RecruitmentService } from './recruitment/recruitment.service';
import { ContractsInsuranceController } from './contracts-insurance/contracts-insurance.controller';
import { ContractsInsuranceService } from './contracts-insurance/contracts-insurance.service';
import { OperationsController } from './operations/operations.controller';
import { OperationsService } from './operations/operations.service';
import { EmployeeMetadataController } from './employee-metadata/employee-metadata.controller';
import { EmployeeMetadataService } from './employee-metadata/employee-metadata.service';
import { EmployeeMetadataRepository } from './employee-metadata/employee-metadata.repository';
import { SettingsCatalogsController } from './settings-catalogs/settings-catalogs.controller';
import { SettingsCatalogsService } from './settings-catalogs/settings-catalogs.service';
import { XbosCatalogWorkflowBridge } from './settings-catalogs/xbos-catalog-workflow.bridge';
import { PerformanceController } from './performance/performance.controller';
import { PerformanceService } from './performance/performance.service';
import { HrmRealtimeGateway } from './realtime/hrm-realtime.gateway';
import { HrmRealtimeService } from './realtime/hrm-realtime.service';
import { AttendanceEventFanoutService } from './notifications/attendance-event-fanout.service';
import { HrmInboxService } from './notifications/hrm-inbox.service';
import { NotificationsController } from './notifications/notifications.controller';
import { PushOutboundService } from './notifications/push-outbound.service';
import { WebhookOutboundService } from './notifications/webhook-outbound.service';

@Module({
  imports: [CoreModule, EmployeesModule, FleetModule, SpreadsheetModule],
  controllers: [
    AppController,
    HrmAdminController,
    CatalogSyncController,
    SettingsCatalogsController,
    PayrollController,
    AttendanceController,
    RecruitmentController,
    ContractsInsuranceController,
    OperationsController,
    EmployeeMetadataController,
    PerformanceController,
    NotificationsController,
  ],
  providers: [
    HrmRealtimeService,
    HrmRealtimeGateway,
    HrmInboxService,
    WebhookOutboundService,
    PushOutboundService,
    AttendanceEventFanoutService,
    HrmAdminService,
    CatalogSyncService,
    SettingsCatalogsService,
    XbosCatalogWorkflowBridge,
    PayrollService,
    AttendanceService,
    LeaveRequestsService,
    RecruitmentService,
    ContractsInsuranceService,
    OperationsService,
    EmployeeMetadataService,
    EmployeeMetadataRepository,
    PerformanceService,
  ],
})
export class AppModule {}

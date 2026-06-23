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
import { PayrollCatalogService } from './payroll/payroll-catalog.service';
import { AttendanceCatalogService } from './attendance/attendance-catalog.service';
import { AttendanceController } from './attendance/attendance.controller';
import { AttendanceService } from './attendance/attendance.service';
import { AttendanceRequestsService } from './attendance/attendance-requests.service';
import { LeaveRequestsService } from './attendance/leave-requests.service';
import { LeaveBalanceService } from './attendance/leave-balance.service';
import { AttendanceOverviewService } from './attendance/attendance-overview.service';
import { RecruitmentController } from './recruitment/recruitment.controller';
import { RecruitmentCatalogService } from './recruitment/recruitment-catalog.service';
import { RecruitmentService } from './recruitment/recruitment.service';
import { DecisionsController } from './decisions/decisions.controller';
import { DecisionsService } from './decisions/decisions.service';
import { DepartmentsController } from './departments/departments.controller';
import { DepartmentsService } from './departments/departments.service';
import { EmployeeBenefitsController } from './employee-benefits/employee-benefits.controller';
import { EmployeeBenefitsService } from './employee-benefits/employee-benefits.service';
import { EmployeeInsurancesController } from './employee-insurances/employee-insurances.controller';
import { EmployeeInsurancesService } from './employee-insurances/employee-insurances.service';
import { EmployeeKpisController } from './employee-kpis/employee-kpis.controller';
import { EmployeeKpisService } from './employee-kpis/employee-kpis.service';
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
import { MobileAuthController } from './auth/mobile-auth.controller';
import { MobileAuthService } from './auth/mobile-auth.service';
import { PlatformQueueService } from './queue/platform-queue.service';
import { CatalogExtensionsController } from './catalog-extensions/catalog-extensions.controller';
import { CatalogExtensionsService } from './catalog-extensions/catalog-extensions.service';
import { OperatingUnitsController } from './operating-units/operating-units.controller';
import { OperatingUnitsService } from './operating-units/operating-units.service';
import { HomeController } from './home/home.controller';
import { HomeService } from './home/home.service';

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
    DecisionsController,
    DepartmentsController,
    EmployeeInsurancesController,
    EmployeeBenefitsController,
    EmployeeKpisController,
    OperationsController,
    EmployeeMetadataController,
    PerformanceController,
    NotificationsController,
    MobileAuthController,
    CatalogExtensionsController,
    OperatingUnitsController,
    HomeController,
  ],
  providers: [
    MobileAuthService,
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
    PayrollCatalogService,
    AttendanceCatalogService,
    AttendanceService,
    LeaveRequestsService,
    LeaveBalanceService,
    AttendanceOverviewService,
    AttendanceRequestsService,
    RecruitmentService,
    RecruitmentCatalogService,
    ContractsInsuranceService,
    DecisionsService,
    DepartmentsService,
    EmployeeInsurancesService,
    EmployeeBenefitsService,
    EmployeeKpisService,
    OperationsService,
    EmployeeMetadataService,
    EmployeeMetadataRepository,
    PerformanceService,
    PlatformQueueService,
    CatalogExtensionsService,
    OperatingUnitsService,
    HomeService,
  ],
})
export class AppModule {}

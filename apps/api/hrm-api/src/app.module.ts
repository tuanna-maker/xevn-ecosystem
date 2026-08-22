import { Module } from '@nestjs/common';
import { SpreadsheetModule } from './spreadsheet/spreadsheet.module';
import { TenantProvisionModule } from './tenant-provision/tenant-provision.module';
import { AppController } from './app.controller';
import { CoreModule } from './core/core.module';
import { HrmAdminController } from './hrm-admin/hrm-admin.controller';
import { HrmAdminService } from './hrm-admin/hrm-admin.service';
import { CatalogSyncController } from './catalog-sync/catalog-sync.controller';
import { EmployeesModule } from './employees/employees.module';
import { FleetModule } from './fleet/fleet.module';
import { PayrollController } from './payroll/payroll.controller';
import { PayrollService } from './payroll/payroll.service';
import { PayrollCatalogService } from './payroll/payroll-catalog.service';
import { PayFormulaService } from './payroll/pay-formula.service';
import { PaySheetTemplateService } from './payroll/pay-sheet-template.service';
import { PayPeriodInputPackService } from './payroll/pay-period-input-pack.service';
import { PayCnttSetupService } from './payroll/pay-cntt-setup.service';
import { PayPayrollGroupService } from './payroll/pay-payroll-group.service';
import { AttendanceCatalogService } from './attendance/attendance-catalog.service';
import { AttendanceConfigService } from './attendance/attendance-config.service';
import { AttLeaveTypeService } from './attendance/att-leave-type.service';
import { AttHolidayCalendarService } from './attendance/att-holiday-calendar.service';
import { AttLeaveAccrualPolicyService } from './attendance/att-leave-accrual-policy.service';
import { AttAttendanceCodeService } from './attendance/att-attendance-code.service';
import { AttOtTypeService } from './attendance/att-ot-type.service';
import { AttOtCompTypeService } from './attendance/att-ot-comp-type.service';
import { AttShiftScheduleSetupService } from './attendance/att-shift-schedule-setup.service';
import { AttShiftService } from './attendance/att-shift.service';
import { AttRuleService } from './attendance/att-rule.service';
import { AttScheduleService } from './attendance/att-schedule.service';
import { AttOtCompLeavePolicyService } from './attendance/att-ot-comp-leave-policy.service';
import { AttSickLeaveFundOrderService } from './attendance/att-sick-leave-fund-order.service';
import { AttActivateEnrollService } from './attendance/att-activate-enroll.service';
import { AttEmployeeActivatedConsumer } from './attendance/att-employee-activated.consumer';
import { AttendanceController } from './attendance/attendance.controller';
import { AttendanceService } from './attendance/attendance.service';
import { AttendanceRequestsService } from './attendance/attendance-requests.service';
import { LeaveRequestsService } from './attendance/leave-requests.service';
import { LeaveBalanceService } from './attendance/leave-balance.service';
import { LeaveWorkflowBridge } from './attendance/leave-workflow.bridge';
import { LeaveAttendanceFunnelService } from './attendance/leave-attendance-funnel.service';
import { AttendanceOverviewService } from './attendance/attendance-overview.service';
import { AttendanceSheetSignService } from './attendance/attendance-sheet-sign.service';
import { RecruitmentController } from './recruitment/recruitment.controller';
import { JdDynamicService } from './recruitment/jd-dynamic.service';
import { RecPipelineStageService } from './recruitment/rec-pipeline-stage.service';
import { RecruitmentCatalogService } from './recruitment/recruitment-catalog.service';
import { RecruitmentDashboardService } from './recruitment/recruitment-dashboard.service';
import { RecruitmentService } from './recruitment/recruitment.service';
import { RecruitmentWorkflowBridge } from './recruitment/recruitment-workflow.bridge';
import { RecruitmentWorkflowController } from './recruitment/recruitment-workflow.controller';
import { DecisionsController } from './decisions/decisions.controller';
import { DecisionsService } from './decisions/decisions.service';
import { HrDecisionTypeService } from './decisions/hr-decision-type.service';
import { DepartmentsController } from './departments/departments.controller';
import { DepartmentsService } from './departments/departments.service';
import { EmployeeBenefitsController } from './employee-benefits/employee-benefits.controller';
import { EmployeeBenefitsService } from './employee-benefits/employee-benefits.service';
import { EmployeeInsurancesController } from './employee-insurances/employee-insurances.controller';
import { EmployeeInsurancesService } from './employee-insurances/employee-insurances.service';
import { EmployeeKpisController } from './employee-kpis/employee-kpis.controller';
import { EmployeeKpisService } from './employee-kpis/employee-kpis.service';
import { ContractLegalPrintService } from './contracts-insurance/contract-legal-print.service';
import { ContractLibraryPublishService } from './contracts-insurance/contract-library-publish.service';
import { ContractsInsuranceController } from './contracts-insurance/contracts-insurance.controller';
import { ContractsInsuranceService } from './contracts-insurance/contracts-insurance.service';
import { EmployeeCompensationService } from './contracts-insurance/employee-compensation.service';
import { SiInsuranceTypeService } from './contracts-insurance/si-insurance-type.service';
import { SiInsurerService } from './contracts-insurance/si-insurer.service';
import { MergeTokensController } from './merge-tokens/merge-tokens.controller';
import { MergeTokensService } from './merge-tokens/merge-tokens.service';
import { OperationsController } from './operations/operations.controller';
import { OperationsService } from './operations/operations.service';
import { EmployeeMetadataController } from './employee-metadata/employee-metadata.controller';
import { EmployeeMetadataService } from './employee-metadata/employee-metadata.service';
import { EmployeeMetadataRepository } from './employee-metadata/employee-metadata.repository';
import { SettingsCatalogsController } from './settings-catalogs/settings-catalogs.controller';
import { SettingsCatalogsModule } from './settings-catalogs/settings-catalogs.module';
import { AllowanceCatalogController } from './settings/allowance-catalog.controller';
import { AllowanceCatalogSyncService } from './settings/allowance-catalog-sync.service';
import { SettingsCompanySettingsController } from './settings/settings-company-settings.controller';
import { SettingsTaxParamsService } from './settings/settings-tax-params.service';
import { SettingsPayrollParamsService } from './settings/settings-payroll-params.service';
import { InsuranceRateCfgController } from './settings/insurance-rate-cfg.controller';
import { InsuranceRateCfgService } from './settings/insurance-rate-cfg.service';
import { PositionCompensationPolicyController } from './settings/position-compensation-policy.controller';
import { PositionCompensationPolicyService } from './settings/position-compensation-policy.service';
import { PerformanceController } from './performance/performance.controller';
import { PerformanceService } from './performance/performance.service';
import { HrmRealtimeGateway } from './realtime/hrm-realtime.gateway';
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
import { ContractTemplatesModule } from './contract-templates/contract-templates.module';
import { CompanyScopeModule } from './company-scope/company-scope.module';

@Module({
  imports: [
    CoreModule,
    SettingsCatalogsModule,
    EmployeesModule,
    CompanyScopeModule,
    FleetModule,
    SpreadsheetModule,
    TenantProvisionModule,
    ContractTemplatesModule,
  ],
  controllers: [
    AppController,
    HrmAdminController,
    CatalogSyncController,
    SettingsCatalogsController,
    AllowanceCatalogController,
    SettingsCompanySettingsController,
    InsuranceRateCfgController,
    PositionCompensationPolicyController,
    PayrollController,
    AttendanceController,
    RecruitmentController,
    RecruitmentWorkflowController,
    ContractsInsuranceController,
    MergeTokensController,
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
    HrmRealtimeGateway,
    HrmInboxService,
    WebhookOutboundService,
    PushOutboundService,
    AttendanceEventFanoutService,
    HrmAdminService,
    AllowanceCatalogSyncService,
    SettingsTaxParamsService,
    SettingsPayrollParamsService,
    InsuranceRateCfgService,
    PositionCompensationPolicyService,
    PayrollService,
    PayrollCatalogService,
    PayFormulaService,
    PaySheetTemplateService,
    PayPeriodInputPackService,
    PayCnttSetupService,
    PayPayrollGroupService,
    AttendanceCatalogService,
    AttendanceSheetSignService,
    AttendanceConfigService,
    AttLeaveTypeService,
    AttHolidayCalendarService,
    AttLeaveAccrualPolicyService,
    AttAttendanceCodeService,
    AttOtCompTypeService,
    AttShiftScheduleSetupService,
    AttShiftService,
    AttRuleService,
    AttScheduleService,
    AttOtTypeService,
    AttOtCompLeavePolicyService,
    AttSickLeaveFundOrderService,
    AttActivateEnrollService,
    AttEmployeeActivatedConsumer,
    AttendanceService,
    LeaveRequestsService,
    LeaveBalanceService,
    LeaveWorkflowBridge,
    LeaveAttendanceFunnelService,
    AttendanceOverviewService,
    AttendanceRequestsService,
    RecruitmentService,
    JdDynamicService,
    RecPipelineStageService,
    RecruitmentCatalogService,
    RecruitmentDashboardService,
    RecruitmentWorkflowBridge,
    ContractsInsuranceService,
    ContractLegalPrintService,
    ContractLibraryPublishService,
    SiInsuranceTypeService,
    SiInsurerService,
    MergeTokensService,
    EmployeeCompensationService,
    DecisionsService,
    HrDecisionTypeService,
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

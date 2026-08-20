"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const spreadsheet_module_1 = require("./spreadsheet/spreadsheet.module");
const app_controller_1 = require("./app.controller");
const core_module_1 = require("./core/core.module");
const hrm_admin_controller_1 = require("./hrm-admin/hrm-admin.controller");
const hrm_admin_service_1 = require("./hrm-admin/hrm-admin.service");
const catalog_sync_controller_1 = require("./catalog-sync/catalog-sync.controller");
const employees_module_1 = require("./employees/employees.module");
const fleet_module_1 = require("./fleet/fleet.module");
const payroll_controller_1 = require("./payroll/payroll.controller");
const payroll_service_1 = require("./payroll/payroll.service");
const payroll_catalog_service_1 = require("./payroll/payroll-catalog.service");
const attendance_catalog_service_1 = require("./attendance/attendance-catalog.service");
const attendance_controller_1 = require("./attendance/attendance.controller");
const attendance_service_1 = require("./attendance/attendance.service");
const attendance_requests_service_1 = require("./attendance/attendance-requests.service");
const leave_requests_service_1 = require("./attendance/leave-requests.service");
const leave_workflow_bridge_1 = require("./attendance/leave-workflow.bridge");
const leave_workflow_controller_1 = require("./attendance/leave-workflow.controller");
const leave_balance_service_1 = require("./attendance/leave-balance.service");
const attendance_overview_service_1 = require("./attendance/attendance-overview.service");
const recruitment_controller_1 = require("./recruitment/recruitment.controller");
const recruitment_catalog_service_1 = require("./recruitment/recruitment-catalog.service");
const recruitment_service_1 = require("./recruitment/recruitment.service");
const recruitment_workflow_bridge_1 = require("./recruitment/recruitment-workflow.bridge");
const recruitment_workflow_controller_1 = require("./recruitment/recruitment-workflow.controller");
const decisions_controller_1 = require("./decisions/decisions.controller");
const decisions_service_1 = require("./decisions/decisions.service");
const departments_controller_1 = require("./departments/departments.controller");
const departments_service_1 = require("./departments/departments.service");
const employee_benefits_controller_1 = require("./employee-benefits/employee-benefits.controller");
const employee_benefits_service_1 = require("./employee-benefits/employee-benefits.service");
const employee_insurances_controller_1 = require("./employee-insurances/employee-insurances.controller");
const employee_insurances_service_1 = require("./employee-insurances/employee-insurances.service");
const employee_kpis_controller_1 = require("./employee-kpis/employee-kpis.controller");
const employee_kpis_service_1 = require("./employee-kpis/employee-kpis.service");
const contracts_insurance_controller_1 = require("./contracts-insurance/contracts-insurance.controller");
const contracts_insurance_service_1 = require("./contracts-insurance/contracts-insurance.service");
const employee_compensation_service_1 = require("./contracts-insurance/employee-compensation.service");
const operations_controller_1 = require("./operations/operations.controller");
const operations_service_1 = require("./operations/operations.service");
const employee_metadata_controller_1 = require("./employee-metadata/employee-metadata.controller");
const employee_metadata_service_1 = require("./employee-metadata/employee-metadata.service");
const employee_metadata_repository_1 = require("./employee-metadata/employee-metadata.repository");
const settings_catalogs_module_1 = require("./settings-catalogs/settings-catalogs.module");
const performance_controller_1 = require("./performance/performance.controller");
const performance_service_1 = require("./performance/performance.service");
const hrm_realtime_gateway_1 = require("./realtime/hrm-realtime.gateway");
const hrm_realtime_service_1 = require("./realtime/hrm-realtime.service");
const attendance_event_fanout_service_1 = require("./notifications/attendance-event-fanout.service");
const hrm_inbox_service_1 = require("./notifications/hrm-inbox.service");
const notifications_controller_1 = require("./notifications/notifications.controller");
const push_outbound_service_1 = require("./notifications/push-outbound.service");
const webhook_outbound_service_1 = require("./notifications/webhook-outbound.service");
const mobile_auth_controller_1 = require("./auth/mobile-auth.controller");
const mobile_auth_service_1 = require("./auth/mobile-auth.service");
const platform_queue_service_1 = require("./queue/platform-queue.service");
const catalog_extensions_controller_1 = require("./catalog-extensions/catalog-extensions.controller");
const catalog_extensions_service_1 = require("./catalog-extensions/catalog-extensions.service");
const operating_units_controller_1 = require("./operating-units/operating-units.controller");
const operating_units_service_1 = require("./operating-units/operating-units.service");
const home_controller_1 = require("./home/home.controller");
const home_service_1 = require("./home/home.service");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [core_module_1.CoreModule, employees_module_1.EmployeesModule, fleet_module_1.FleetModule, spreadsheet_module_1.SpreadsheetModule, settings_catalogs_module_1.SettingsCatalogsModule],
        controllers: [
            app_controller_1.AppController,
            hrm_admin_controller_1.HrmAdminController,
            catalog_sync_controller_1.CatalogSyncController,
            payroll_controller_1.PayrollController,
            attendance_controller_1.AttendanceController,
            leave_workflow_controller_1.LeaveWorkflowController,
            recruitment_controller_1.RecruitmentController,
            recruitment_workflow_controller_1.RecruitmentWorkflowController,
            contracts_insurance_controller_1.ContractsInsuranceController,
            decisions_controller_1.DecisionsController,
            departments_controller_1.DepartmentsController,
            employee_insurances_controller_1.EmployeeInsurancesController,
            employee_benefits_controller_1.EmployeeBenefitsController,
            employee_kpis_controller_1.EmployeeKpisController,
            operations_controller_1.OperationsController,
            employee_metadata_controller_1.EmployeeMetadataController,
            performance_controller_1.PerformanceController,
            notifications_controller_1.NotificationsController,
            mobile_auth_controller_1.MobileAuthController,
            catalog_extensions_controller_1.CatalogExtensionsController,
            operating_units_controller_1.OperatingUnitsController,
            home_controller_1.HomeController,
        ],
        providers: [
            mobile_auth_service_1.MobileAuthService,
            hrm_realtime_service_1.HrmRealtimeService,
            hrm_realtime_gateway_1.HrmRealtimeGateway,
            hrm_inbox_service_1.HrmInboxService,
            webhook_outbound_service_1.WebhookOutboundService,
            push_outbound_service_1.PushOutboundService,
            attendance_event_fanout_service_1.AttendanceEventFanoutService,
            hrm_admin_service_1.HrmAdminService,
            payroll_service_1.PayrollService,
            payroll_catalog_service_1.PayrollCatalogService,
            attendance_catalog_service_1.AttendanceCatalogService,
            attendance_service_1.AttendanceService,
            leave_requests_service_1.LeaveRequestsService,
            leave_workflow_bridge_1.LeaveWorkflowBridge,
            leave_balance_service_1.LeaveBalanceService,
            attendance_overview_service_1.AttendanceOverviewService,
            attendance_requests_service_1.AttendanceRequestsService,
            recruitment_service_1.RecruitmentService,
            recruitment_catalog_service_1.RecruitmentCatalogService,
            recruitment_workflow_bridge_1.RecruitmentWorkflowBridge,
            contracts_insurance_service_1.ContractsInsuranceService,
            employee_compensation_service_1.EmployeeCompensationService,
            decisions_service_1.DecisionsService,
            departments_service_1.DepartmentsService,
            employee_insurances_service_1.EmployeeInsurancesService,
            employee_benefits_service_1.EmployeeBenefitsService,
            employee_kpis_service_1.EmployeeKpisService,
            operations_service_1.OperationsService,
            employee_metadata_service_1.EmployeeMetadataService,
            employee_metadata_repository_1.EmployeeMetadataRepository,
            performance_service_1.PerformanceService,
            platform_queue_service_1.PlatformQueueService,
            catalog_extensions_service_1.CatalogExtensionsService,
            operating_units_service_1.OperatingUnitsService,
            home_service_1.HomeService,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map
/**
 * @CODE-MEMORY
 * Screen:     HRM Employees Nest module
 * UC:         AC-PLT-EMP-01b · F-EMP-POS-CNS-02
 * BR:         BR-PLT-02 · L-EMP-POS-01 Option A
 * SRS:        docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-POSITION-CATALOG-BA-01.md
 * TechSpec:   docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-POSITION-CATALOG-SA-01.md Option A
 * Purpose:    Wire Employees + WH profile services; import SettingsCatalogsModule so
 *             assertJobTitleKeyInCatalog / assertWhPositionKey receive live DI.
 * WorkItem:   PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-POSITION-CATALOG-BE-01
 * Coded:      2026-08-08
 * must_keep:  Option A job_titles · no Nest emp_position · EMP DOC/ET·STATUS·CUSTOM·EXT seals
 * SOLID:      Feature module imports catalog SoT module — no AppModule-only injection gap
 *
 * @CODE-MEMORY-CHANGE 2026-08-08 PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-POSITION-CATALOG-BE-01
 * change_mode: FIX
 * What: imports SettingsCatalogsModule — closes R-PLT-EMP-POS-BE-01 Optional no-op invent 200
 * must_keep: peer HRM-CON-POS-KEY · HRM-WH-PICK-REQUIRED · no emp_position Nest
 */
/**
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-CORE-01-CLUSTER-BE-01
 * change_mode: ADD
 * What: Wire EmployeeDependentsService (F-CORE-DEP-01 ONE SoT)
 * must_keep: SettingsCatalogsModule · no Nest /core dual · no second deps SoT
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-CORE-08-CLUSTER-BE-01
 * change_mode: ADD
 * What: Wire EmployeeRewardDisciplineService (F-CORE-RD-01 dual rewards+discipline)
 * must_keep: dual LIVE · no Nest /core RD · no pay_reward_link mandatory · U65
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-CORE-03-CLUSTER-BE-01
 * change_mode: ADD
 * What: Wire EmpDocumentChecklistService (F-CORE-CHK-01 instance SoT)
 * must_keep: DOC/ET/TOK RETAIN · no Nest /core CHK · no emp_position · no emp_custom_field · U65
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-CORE-07-CLUSTER-BE-01
 * change_mode: ADD
 * What: EmployeesService Optional EmpDocumentChecklistService + HrmRealtimeService (CoreModule)
 *       for F-CORE-ACT-01 GATE + employee.activated emit — same module providers (no Nest /core)
 * must_keep: CORE-03 CHK · soft≠CORE-06 DONE · OUT invent ATT enroll · U65
 */
import { Module } from '@nestjs/common';
import { SettingsCatalogsModule } from '../settings-catalogs/settings-catalogs.module';
import { EmpDocumentChecklistService } from './emp-document-checklist.service';
import { EmpDocumentTypeService } from './emp-document-type.service';
import { EmpEmploymentStatusService } from './emp-employment-status.service';
import { EmpEmploymentTypeService } from './emp-employment-type.service';
import { EmpStatusReasonService } from './emp-status-reason.service';
import { EmployeeDependentsService } from './employee-dependents.service';
import { EmployeeProfileService } from './employee-profile.service';
import { EmployeeRewardDisciplineService } from './employee-reward-discipline.service';
import { EmployeesController } from './employees.controller';
import { EmployeesService } from './employees.service';

@Module({
  imports: [SettingsCatalogsModule],
  controllers: [EmployeesController],
  providers: [
    EmployeesService,
    EmployeeDependentsService,
    EmployeeRewardDisciplineService,
    EmpDocumentChecklistService,
    EmployeeProfileService,
    EmpDocumentTypeService,
    EmpEmploymentTypeService,
    EmpEmploymentStatusService,
    EmpStatusReasonService,
  ],
  exports: [
    EmployeesService,
    EmployeeDependentsService,
    EmployeeRewardDisciplineService,
    EmpDocumentChecklistService,
    EmployeeProfileService,
    EmpDocumentTypeService,
    EmpEmploymentTypeService,
    EmpEmploymentStatusService,
    EmpStatusReasonService,
  ],
})
export class EmployeesModule {}

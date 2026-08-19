/**
 * @CODE-MEMORY
 * Screen:     HRM Settings catalogs DI module (job_titles / MD SoT)
 * UC:         AC-PLT-EMP-01b · F-EMP-POS-CNS-02 · VAL-SET-MD-01
 * BR:         BR-PLT-02 · L-EMP-POS-01 Option A — Settings/XBOS job_titles SoT
 * SRS:        docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-POSITION-CATALOG-BA-01.md
 * TechSpec:   docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-POSITION-CATALOG-SA-01.md Option A
 * Purpose:    Export SettingsCatalogsService (+ CatalogSync deps) so feature modules
 *             (EmployeesModule) can inject catalog assert — not AppModule-only DI.
 * WorkItem:   PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-POSITION-CATALOG-BE-01
 * Coded:      2026-08-08
 * Callers:    AppModule · EmployeesModule
 * Callees:    SettingsCatalogsService · CatalogSyncService · XbosCatalogWorkflowBridge
 * Impact:     Missing import → EmployeesService @Optional settingsCatalogs = undefined → invent 200
 * must_keep:  Option A job_titles SoT · no Nest emp_position · HRM-CON-POS-KEY peers · U65 no seed
 * SOLID:      Module SRP — catalog DI boundary; Global so AppModule flat providers keep working
 * LastVerified: employees-module-settings-catalogs-wiring.spec.ts
 */
import { Global, Module } from '@nestjs/common';
import { CatalogSyncService } from '../catalog-sync/catalog-sync.service';
import { CoreModule } from '../core/core.module';
import { SettingsCatalogsService } from './settings-catalogs.service';
import { XbosCatalogWorkflowBridge } from './xbos-catalog-workflow.bridge';

@Global()
@Module({
  imports: [CoreModule],
  providers: [CatalogSyncService, XbosCatalogWorkflowBridge, SettingsCatalogsService],
  exports: [CatalogSyncService, XbosCatalogWorkflowBridge, SettingsCatalogsService],
})
export class SettingsCatalogsModule {}

/**
 * @CODE-MEMORY WorkItem: XBOS-TENANT-PROVISION-BE-01
 * solid_convention_ack: true
 * be_boundary: true
 *
 * SettingsModule: aggregates all settings sub-modules.
 * Currently contains: CompaniesModule (tenant provisioning).
 */
import { Module } from '@nestjs/common';
import { CompaniesModule } from './companies/companies.module';

@Module({
  imports: [CompaniesModule],
  exports: [CompaniesModule],
})
export class SettingsModule {}

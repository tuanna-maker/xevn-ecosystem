/**
 * @CODE-MEMORY WorkItem: HRM-TENANT-PROVISION-LISTENER-01
 * solid_convention_ack: true
 * be_boundary: true
 */
import { Module } from '@nestjs/common';
import { TenantProvisionController } from './tenant-provision.controller';
import { TenantProvisionService } from './tenant-provision.service';

/**
 * TenantProvisionModule — subscribes to xbos.tenant BullMQ queue
 * and provides REST fallback for TENANT_PROVISIONED events.
 *
 * HrmDbService is available via CoreModule (@Global) — no need to re-import.
 */
@Module({
  controllers: [TenantProvisionController],
  providers: [TenantProvisionService],
  exports: [TenantProvisionService],
})
export class TenantProvisionModule {}

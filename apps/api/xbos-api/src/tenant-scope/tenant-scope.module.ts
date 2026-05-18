import { Module } from '@nestjs/common';
import { OrgFoundationModule } from '../org-foundation/org-foundation.module';
import { TenantScopeController } from './tenant-scope.controller';
import { TenantScopeService } from './tenant-scope.service';

@Module({
  imports: [OrgFoundationModule],
  controllers: [TenantScopeController],
  providers: [TenantScopeService],
  exports: [TenantScopeService],
})
export class TenantScopeModule {}

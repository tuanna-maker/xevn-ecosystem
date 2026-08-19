/**
 * @CODE-MEMORY WorkItem: XBOS-TENANT-PROVISION-BE-01
 * solid_convention_ack: true
 * be_boundary: true
 */
import { Module } from '@nestjs/common';
import { CompaniesController } from './companies.controller';
import { CompaniesService } from './companies.service';

@Module({
  controllers: [CompaniesController],
  providers: [CompaniesService],
  exports: [CompaniesService],
})
export class CompaniesModule {}

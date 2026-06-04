import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { XbosDbModule } from '../db/xbos-db.module';
import { OrgFoundationController } from './org-foundation.controller';
import { OrgFoundationService } from './org-foundation.service';
import { legalEntityBodyMiddleware } from './middleware/legal-entity-body.middleware';

@Module({
  imports: [XbosDbModule],
  controllers: [OrgFoundationController],
  providers: [OrgFoundationService],
  exports: [OrgFoundationService],
})
export class OrgFoundationModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(legalEntityBodyMiddleware).forRoutes(OrgFoundationController);
  }
}

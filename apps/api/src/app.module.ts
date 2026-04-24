import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { ConfigDomainModule } from './modules/config/config.module';
import { HrmModule } from './modules/hrm/hrm.module';
import { AdminModule } from './modules/admin/admin.module';
import { AiModule } from './modules/ai/ai.module';

@Module({
  imports: [
    NestConfigModule.forRoot({ isGlobal: true }),
    ConfigDomainModule,
    HrmModule,
    AdminModule,
    AiModule,
  ],
})
export class AppModule {}

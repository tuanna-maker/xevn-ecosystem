import { Module } from '@nestjs/common';
import { TenantScopeModule } from '../tenant-scope/tenant-scope.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [TenantScopeModule],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}

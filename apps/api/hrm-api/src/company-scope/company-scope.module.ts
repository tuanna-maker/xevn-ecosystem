import { Module } from '@nestjs/common';
import { EmployeesModule } from '../employees/employees.module';
import { CompanyScopeController } from './company-scope.controller';
import { CompanyScopeService } from './company-scope.service';

@Module({
  imports: [EmployeesModule],
  controllers: [CompanyScopeController],
  providers: [CompanyScopeService],
  exports: [CompanyScopeService],
})
export class CompanyScopeModule {}

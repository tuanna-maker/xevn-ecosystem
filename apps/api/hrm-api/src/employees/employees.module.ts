import { Module } from '@nestjs/common';
import { EmployeeProfileService } from './employee-profile.service';
import { EmployeesController } from './employees.controller';
import { EmployeesService } from './employees.service';

@Module({
  controllers: [EmployeesController],
  providers: [EmployeesService, EmployeeProfileService],
  exports: [EmployeesService, EmployeeProfileService],
})
export class EmployeesModule {}

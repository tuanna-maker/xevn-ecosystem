import { Body, Controller, Get, Headers, Param, Patch, Post, Query } from '@nestjs/common';
import { HttpStatus } from '@nestjs/common';
import { ApiException } from '../common/api.exception';
import { ok } from '../common/api-response';
import { isAuthorizedInternalRequest } from '../common/internal-auth';
import { resolveScopeContext } from '../common/scope-context';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { ListEmployeesQueryDto } from './dto/list-employees.query.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { EmployeesService } from './employees.service';

@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  private assertBusinessAccess(authorization?: string, internalApiKey?: string) {
    if (!isAuthorizedInternalRequest(authorization, internalApiKey)) {
      throw new ApiException('HRM-AUTH-001', 'Unauthorized employee access', HttpStatus.UNAUTHORIZED);
    }
  }

  @Post()
  createEmployee(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Body() body: CreateEmployeeDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId: body.company_id ?? headerCompanyId });
    return this.employeesService
      .createEmployee(body)
      .then((data) => ok(data, 'HRM-EMP-201', 'Employee created'));
  }

  @Get()
  listEmployees(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query() query: ListEmployeesQueryDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId: query.company_id ?? headerCompanyId });
    return this.employeesService
      .listEmployees(query)
      .then((data) => ok(data, 'HRM-EMP-200', 'Employees listed'));
  }

  @Patch(':employeeId')
  updateEmployee(
    @Param('employeeId') employeeId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') companyId: string | undefined,
    @Body() body: UpdateEmployeeDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId });
    return this.employeesService
      .updateEmployee(employeeId, body)
      .then((data) => ok(data, 'HRM-EMP-202', 'Employee updated'));
  }

  @Post(':employeeId/archive')
  archiveEmployee(
    @Param('employeeId') employeeId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') companyId: string | undefined,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId });
    return this.employeesService
      .archiveEmployee(employeeId)
      .then((data) => ok(data, 'HRM-EMP-203', 'Employee archived'));
  }

  @Post(':employeeId/restore')
  restoreEmployee(
    @Param('employeeId') employeeId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') companyId: string | undefined,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId });
    return this.employeesService
      .restoreEmployee(employeeId)
      .then((data) => ok(data, 'HRM-EMP-204', 'Employee restored'));
  }
}

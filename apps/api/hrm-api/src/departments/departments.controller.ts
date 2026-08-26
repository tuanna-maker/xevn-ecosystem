import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiException } from '../common/api.exception';
import { ok } from '../common/api-response';
import { isAuthorizedInternalRequest } from '../common/internal-auth';
import { resolveScopeContext } from '../common/scope-context';
import { DepartmentsService, type DepartmentRow } from './departments.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { ListDepartmentsQueryDto } from './dto/list-departments.query.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';

@Controller('departments')
export class DepartmentsController {
  constructor(private readonly service: DepartmentsService) {}

  private assertAccess(authorization?: string, internalApiKey?: string) {
    if (!isAuthorizedInternalRequest(authorization, internalApiKey)) {
      throw new ApiException(
        'HRM-AUTH-001',
        'Unauthorized departments access',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  @Get()
  list(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query() query: ListDepartmentsQueryDto,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: query.company_id ?? headerCompanyId,
    });
    return this.service
      .listDepartments(query, authorization)
      .then((data) => ok(data, 'HRM-DEPT-200', 'Departments listed'));
  }

  @Get(':departmentId')
  getById(
    @Param('departmentId') departmentId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query('company_id') companyId: string,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: companyId ?? headerCompanyId,
    });
    return this.service
      .getDepartmentById(departmentId, companyId, authorization)
      .then((data) => ok(data, 'HRM-DEPT-200', 'Department loaded'));
  }

  @Post()
  create(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Body() body: CreateDepartmentDto,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: body.company_id ?? headerCompanyId,
    });
    return this.service
      .createDepartment(body, authorization)
      .then((data: DepartmentRow) => ok(data, 'HRM-DEPT-201', 'Department created'));
  }

  @Patch(':departmentId')
  update(
    @Param('departmentId') departmentId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Body() body: UpdateDepartmentDto,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: body.company_id ?? headerCompanyId,
    });
    return this.service
      .updateDepartment(departmentId, body, authorization)
      .then((data: DepartmentRow) => ok(data, 'HRM-DEPT-200', 'Department updated'));
  }

  @Delete(':departmentId')
  remove(
    @Param('departmentId') departmentId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query('company_id') companyId: string,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: companyId ?? headerCompanyId,
    });
    return this.service
      .deleteDepartment(departmentId, companyId, authorization)
      .then((data) => ok(data, 'HRM-DEPT-200', 'Department deleted'));
  }
}

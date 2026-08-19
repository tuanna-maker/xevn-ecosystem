/**
 * @CODE-MEMORY
 * Screen:     Settings > Catalog > Loai nghi (Controller) -- UC-LV-01, UC-LV-02
 * UC:         UC-LV-01 (GET list/detail), UC-LV-02 (POST/PUT/DELETE)
 * BR:         BR-LV-01..06 enforced in service
 * SRS:        docs/program/deltas/BA_HRM_LEAVE_TYPE_SRS_01_20260815.md §9 API Contract
 * TechSpec:   docs/program/deltas/BA_HRM_LEAVE_TYPE_TECHSPEC_01_20260815.md §3.3 Controller
 * WorkItem:   BA-HRM-LEAVE-TYPE-TECHSPEC-01
 * Coded:      2026-08-15
 * Purpose:    Leave Type REST endpoints (5 endpoints).
 * solid_convention_ack: true
 * be_boundary: true
 */
import { Controller, Get, Post, Put, Delete, Param, Query, Body, Req, Headers, ParseUUIDPipe, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { getVerifiedInternalJwtPayload, isAuthorizedInternalRequest } from '../../common/internal-auth';
import { ApiException } from '../../common/api.exception';
import { ok } from '../../common/api-response';
import { LeaveTypeService } from './leave-type.service';
import { CreateLeaveTypeDto } from './dto/create-leave-type.dto';
import { UpdateLeaveTypeDto } from './dto/update-leave-type.dto';
import { LeaveTypeQueryDto } from './dto/leave-type.query.dto';

@ApiTags('Settings - Leave Types')
@Controller('settings/leave-types')
export class LeaveTypeController {
  constructor(private readonly service: LeaveTypeService) {}

  private assertAccess(authorization?: string, internalApiKey?: string) {
    if (!isAuthorizedInternalRequest(authorization, internalApiKey)) {
      throw new ApiException(
        'HRM-AUTH-001',
        'Unauthorized leave type access',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  private getScope(req: Request): { tenantId: string; companyId: string; userId: string } {
    const authHeader = (req as any).headers?.['authorization'] ?? (req as any).headers?.['Authorization'];
    const payload = getVerifiedInternalJwtPayload(authHeader);
    if (!payload) {
      throw new ApiException('HRM-AUTH-001', 'Invalid or missing JWT', HttpStatus.UNAUTHORIZED);
    }
    const tenantId = (payload['tenant_id'] as string) ?? (payload['tenantId'] as string);
    const companyId = (payload['company_id'] as string) ?? (payload['companyId'] as string);
    const userId = (payload['sub'] as string) ?? (payload['user_id'] as string) ?? (payload['userId'] as string);
    if (!tenantId || !companyId) {
      throw new ApiException('HRM-AUTH-001', 'JWT missing tenantId/companyId', HttpStatus.UNAUTHORIZED);
    }
    return { tenantId, companyId, userId };
  }

  @Get()
  @ApiOperation({ summary: 'List leave types (paginated, search, filter)' })
  @ApiResponse({ status: 200, description: 'Paginated leave types' })
  async findAll(
    @Req() req: Request,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Query() query: LeaveTypeQueryDto,
  ) {
    this.assertAccess(authorization, internalApiKey);
    const { tenantId, companyId } = this.getScope(req);
    const result = await this.service.findAll(tenantId, companyId, query);
    return ok(result, 'HRM-LEAVE-TYPE-200', 'Leave types');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get leave type by ID' })
  @ApiResponse({ status: 200, description: 'Leave type detail' })
  @ApiResponse({ status: 404, description: 'Not found' })
  async findById(
    @Req() req: Request,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    this.assertAccess(authorization, internalApiKey);
    const { tenantId, companyId } = this.getScope(req);
    const result = await this.service.findById(tenantId, companyId, id);
    if (!result) {
      throw new ApiException('HRM-LEAVE-TYPE-404', 'Leave type not found', HttpStatus.NOT_FOUND);
    }
    return ok(result, 'HRM-LEAVE-TYPE-200', 'Leave type');
  }

  @Post()
  @ApiOperation({ summary: 'Create new leave type' })
  @ApiResponse({ status: 201, description: 'Leave type created' })
  @ApiResponse({ status: 409, description: 'Code already exists' })
  @ApiResponse({ status: 400, description: 'Validation error (e.g., unpaid with payRate>0)' })
  async create(
    @Req() req: Request,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Body() dto: CreateLeaveTypeDto,
  ) {
    this.assertAccess(authorization, internalApiKey);
    const { tenantId, companyId, userId } = this.getScope(req);
    const result = await this.service.create(tenantId, companyId, dto, userId);
    return ok(result, 'HRM-LEAVE-TYPE-201', 'Leave type created');
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update leave type' })
  @ApiResponse({ status: 200, description: 'Leave type updated' })
  @ApiResponse({ status: 400, description: 'Validation error (LABOR_LAW immutable, unpaid payRate=0)' })
  @ApiResponse({ status: 404, description: 'Not found' })
  async update(
    @Req() req: Request,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateLeaveTypeDto,
  ) {
    this.assertAccess(authorization, internalApiKey);
    const { tenantId, companyId } = this.getScope(req);
    const result = await this.service.update(tenantId, companyId, id, dto);
    return ok(result, 'HRM-LEAVE-TYPE-200', 'Leave type updated');
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete leave type (deactivate LABOR_LAW, soft delete INTERNAL)' })
  @ApiResponse({ status: 200, description: 'Leave type deactivated/deleted' })
  @ApiResponse({ status: 404, description: 'Not found' })
  async softDelete(
    @Req() req: Request,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    this.assertAccess(authorization, internalApiKey);
    const { tenantId, companyId } = this.getScope(req);
    const result = await this.service.softDelete(tenantId, companyId, id);
    return ok(result, 'HRM-LEAVE-TYPE-200', 'Leave type removed');
  }
}
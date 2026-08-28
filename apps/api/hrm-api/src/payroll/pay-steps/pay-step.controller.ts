import { Body, Controller, Delete, Get, Headers, Param, Patch, Post, Query } from '@nestjs/common';
import { PayStepService } from './pay-step.service';

@Controller('payroll/pay-steps')
export class PayStepController {
  constructor(
    private readonly service: PayStepService,
  ) {}

  @Get()
  async findAll(@Headers('x-tenant-id') xTenantId: string | undefined, @Query('search') search?: string, @Query('limit') limit?: string, @Query('page') page?: string) {
    const tenantId = xTenantId || 'test-tenant';
    return this.service.findAll(tenantId, {
      search,
      limit: limit ? parseInt(limit, 10) : undefined,
      page: page ? parseInt(page, 10) : undefined,
    });
  }

  @Post()
  async create(@Headers('x-tenant-id') xTenantId: string | undefined, @Headers('x-user-id') xUserId: string | undefined, @Body() dto: { code: string; name: string; description?: string }) {
    const tenantId = xTenantId || 'test-tenant';
    const userId = xUserId || 'test-user';
    return this.service.create(tenantId, dto, userId);
  }

  @Patch(':id')
  async update(@Headers('x-tenant-id') xTenantId: string | undefined, @Headers('x-user-id') xUserId: string | undefined, @Param('id') id: string, @Body() dto: { name: string; description?: string, is_active?: boolean }) {
    const tenantId = xTenantId || 'test-tenant';
    const userId = xUserId || 'test-user';
    await this.service.update(tenantId, id, dto, userId);
    return { success: true };
  }

  @Delete(':id/archive')
  async archive(@Headers('x-tenant-id') xTenantId: string | undefined, @Param('id') id: string) {
    const tenantId = xTenantId || 'test-tenant';
    await this.service.archive(tenantId, id);
    return { success: true };
  }
}
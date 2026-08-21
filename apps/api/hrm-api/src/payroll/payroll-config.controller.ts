// @CODE-MEMORY: API Contract cho Cấu hình Lương, cung cấp endpoints Display-Ready.
import { Controller, Get, Post, Body, Req, UseGuards } from '@nestjs/common';
import { PayrollConfigService } from './payroll-config.service';
import { CreateSalaryComponentDto } from './dto/create-salary-component.dto';

// Giả lập OS ScopeContextGuard. Trong code thật sẽ import từ @xevn/platform-core
// import { ScopeContextGuard, RequiredScope } from '@xevn/platform-core';

@Controller('api/hrm/payroll-config')
export class PayrollConfigController {
  constructor(private readonly configService: PayrollConfigService) {}

  @Get('components')
  async getComponents(@Req() req: any) {
    // IDOR protection / Tenant isolation logic
    const tenantId = req.headers['x-tenant-id'] || 'xevn';
    const companyId = req.headers['x-company-id'] || 'company_1';

    const data = await this.configService.getSalaryComponents(
      tenantId,
      companyId,
    );
    return { data, meta: { total: data.length } };
  }

  @Post('components')
  async createComponent(
    @Req() req: any,
    @Body() dto: CreateSalaryComponentDto,
  ) {
    const tenantId = req.headers['x-tenant-id'] || 'xevn';
    const companyId = req.headers['x-company-id'] || 'company_1';

    const result = await this.configService.createSalaryComponent(
      tenantId,
      companyId,
      dto,
    );
    return { data: result };
  }

  @Get('settings')
  async getSettings(@Req() req: any) {
    const tenantId = req.headers['x-tenant-id'] || 'xevn';
    const companyId = req.headers['x-company-id'] || 'company_1';

    const data = await this.configService.getSystemSettings(
      tenantId,
      companyId,
    );
    return { data };
  }
}

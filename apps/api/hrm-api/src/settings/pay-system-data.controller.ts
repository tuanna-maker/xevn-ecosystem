/**
 * @CODE-MEMORY
 * UC: PO-HRM-PAY-SYSTEM-DATA-SPEC-01
 * Business Rule: Quản lý các cấu hình System Data (Dữ liệu hệ thống) dùng làm Nguồn
 * cho các cột cấu hình trong Mẫu bảng lương (Pay Sheet Template Lines).
 * Architecture: Inject `HrmDbService` chuẩn của HRM module thay vì `DatabaseService` chung.
 */
import { Controller, Get, Post, Put, Delete, Body, Param, Headers, ParseUUIDPipe } from '@nestjs/common';
import { PaySystemDataService } from './pay-system-data.service';
import { CreatePaySystemDataDto, UpdatePaySystemDataDto } from './dto/pay-system-data.dto';
import { ok } from '../common/api-response';

@Controller('settings/pay-system-data')
export class PaySystemDataController {
  constructor(private readonly service: PaySystemDataService) {}

  @Get()
  async list(
    @Headers('x-company-id') companyId: string,
  ) {
    if (!companyId) throw new Error('Missing x-company-id header');
    const data = await this.service.list(companyId);
    return ok(data, 'HRM-PAY-SYS-001', 'List pay system data success');
  }

  @Post()
  async create(
    @Headers('x-company-id') companyId: string,
    @Body() dto: CreatePaySystemDataDto,
  ) {
    if (!companyId) throw new Error('Missing x-company-id header');
    const data = await this.service.create(companyId, dto);
    return ok(data, 'HRM-PAY-SYS-002', 'Create pay system data success');
  }

  @Get(':id')
  async getById(
    @Headers('x-company-id') companyId: string,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    if (!companyId) throw new Error('Missing x-company-id header');
    const data = await this.service.getById(id, companyId);
    return ok(data, 'HRM-PAY-SYS-003', 'Get pay system data success');
  }

  @Put(':id')
  async update(
    @Headers('x-company-id') companyId: string,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdatePaySystemDataDto,
  ) {
    if (!companyId) throw new Error('Missing x-company-id header');
    const data = await this.service.update(id, companyId, dto);
    return ok(data, 'HRM-PAY-SYS-004', 'Update pay system data success');
  }

  @Delete(':id')
  async delete(
    @Headers('x-company-id') companyId: string,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    if (!companyId) throw new Error('Missing x-company-id header');
    const data = await this.service.delete(id, companyId);
    return ok(data, 'HRM-PAY-SYS-005', 'Delete pay system data success');
  }
}

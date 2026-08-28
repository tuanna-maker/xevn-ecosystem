import { Controller, Get, Post, Patch, Delete, Body, Param, Query, Req, UseGuards } from '@nestjs/common';
import { PayslipTemplateService } from './payslip-template.service';
import { CreatePayslipTemplateDto, ListPayslipTemplatesQueryDto, UpdatePayslipTemplateDto } from './dto/payslip-template.dto';

@Controller('settings/payslip-templates')
export class PayslipTemplateController {
  constructor(private readonly service: PayslipTemplateService) {}

  @Get()
  list(@Req() req: any, @Query() query: ListPayslipTemplatesQueryDto) {
    return this.service.list(req, query);
  }

  @Get(':id')
  getById(@Req() req: any, @Param('id') id: string) {
    return this.service.getById(req, id);
  }

  @Post()
  create(@Req() req: any, @Body() dto: CreatePayslipTemplateDto) {
    return this.service.create(req, dto);
  }

  @Patch(':id')
  update(@Req() req: any, @Param('id') id: string, @Body() dto: UpdatePayslipTemplateDto) {
    return this.service.update(req, id, dto);
  }

  @Delete(':id')
  delete(@Req() req: any, @Param('id') id: string) {
    return this.service.delete(req, id);
  }
}

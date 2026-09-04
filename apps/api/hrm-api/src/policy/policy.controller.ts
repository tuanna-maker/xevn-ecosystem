import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Headers,
} from '@nestjs/common';
import { PolicyService } from './policy.service';
import { CreatePayPolicyDto, ClonePayPolicyDto, UpsertComponentDto } from './dto/policy.dto';

import { resolveScopeContext } from '../common/scope-context';
import { Put, Delete } from '@nestjs/common';

@Controller('pay-policies')
export class PolicyController {
  constructor(private readonly policyService: PolicyService) {}

  @Get()
  async listPolicies(
    @Headers('authorization') auth: string | undefined,
    @Headers('x-tenant-id') reqTenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query('company_id') queryCompanyId?: string,
    @Query('pay_group_code') payGroupCode?: string,
    @Query('group_id') groupId?: string,
    @Query('status') status?: string,
  ) {
    const { tenantId, companyId } = resolveScopeContext(auth, { tenantId: reqTenantId, companyId: queryCompanyId ?? headerCompanyId });
    const targetGroup = payGroupCode || groupId;
    const data = await this.policyService.listPolicies(tenantId, companyId, targetGroup, status);
    return { data };
  }

  @Post('evaluate-eligibility')
  async evaluateEligibility(
    @Body() employeeContext: any,
    @Headers('authorization') auth: string | undefined,
    @Headers('x-tenant-id') reqTenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query('company_id') queryCompanyId?: string,
  ) {
    const { tenantId, companyId } = resolveScopeContext(auth, { tenantId: reqTenantId, companyId: queryCompanyId ?? headerCompanyId });
    return this.policyService.evaluateEligibility(tenantId, companyId, employeeContext);
  }


  @Get(':id')
  async getPolicy(
    @Param('id') id: string,
    @Headers('authorization') auth: string | undefined,
    @Headers('x-tenant-id') reqTenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query('company_id') queryCompanyId?: string,
  ) {
    const { tenantId, companyId } = resolveScopeContext(auth, { tenantId: reqTenantId, companyId: queryCompanyId ?? headerCompanyId });
    return this.policyService.getPolicyWithComponents(tenantId, companyId, id);
  }

  @Post()
  async createPolicy(
    @Body() dto: CreatePayPolicyDto,
    @Headers('authorization') auth: string | undefined,
    @Headers('x-tenant-id') reqTenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query('company_id') queryCompanyId?: string,
  ) {
    const { tenantId, companyId } = resolveScopeContext(auth, { tenantId: reqTenantId, companyId: queryCompanyId ?? headerCompanyId });
    // In reality, user_id from JWT
    const createdBy = 'HR-ADMIN'; 
    return this.policyService.createPolicy(tenantId, companyId, dto, createdBy);
  }

  @Put(':id')
  async updatePolicy(
    @Param('id') id: string,
    @Body() dto: Partial<CreatePayPolicyDto>,
    @Headers('authorization') auth: string | undefined,
    @Headers('x-tenant-id') reqTenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query('company_id') queryCompanyId?: string,
  ) {
    const { tenantId, companyId } = resolveScopeContext(auth, { tenantId: reqTenantId, companyId: queryCompanyId ?? headerCompanyId });
    return this.policyService.updatePolicy(tenantId, companyId, id, dto);
  }

  @Post(':id/clone')
  async clonePolicy(
    @Param('id') id: string,
    @Body() dto: ClonePayPolicyDto,
    @Headers('authorization') auth: string | undefined,
    @Headers('x-tenant-id') reqTenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query('company_id') queryCompanyId?: string,
  ) {
    const { tenantId, companyId } = resolveScopeContext(auth, { tenantId: reqTenantId, companyId: queryCompanyId ?? headerCompanyId });
    const createdBy = 'HR-ADMIN';
    return this.policyService.clonePolicy(tenantId, companyId, id, dto, createdBy);
  }

  @Post(':id/components')
  async addComponent(
    @Param('id') id: string,
    @Body() dto: UpsertComponentDto,
    @Headers('authorization') auth: string | undefined,
    @Headers('x-tenant-id') reqTenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query('company_id') queryCompanyId?: string,
  ) {
    const { tenantId, companyId } = resolveScopeContext(auth, { tenantId: reqTenantId, companyId: queryCompanyId ?? headerCompanyId });
    return this.policyService.addComponent(tenantId, companyId, id, dto);
  }

  @Post(':id/assign')
  async assignPolicy(
    @Param('id') id: string,
    @Body() dto: any,
    @Headers('authorization') auth: string | undefined,
    @Headers('x-tenant-id') reqTenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query('company_id') queryCompanyId?: string,
  ) {
    const { tenantId, companyId } = resolveScopeContext(auth, { tenantId: reqTenantId, companyId: queryCompanyId ?? headerCompanyId });
    // Mock implementation for UI flow testing
    return { success: true, policy_id: id, assigned_targets: dto.target_ids?.length || 0, tenant_id: tenantId, company_id: companyId };
  }

  @Post(':id/toggle-status')
  async togglePolicyStatus(
    @Param('id') id: string,
    @Headers('authorization') auth: string | undefined,
    @Headers('x-tenant-id') reqTenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query('company_id') queryCompanyId?: string,
  ) {
    const { tenantId, companyId } = resolveScopeContext(auth, { tenantId: reqTenantId, companyId: queryCompanyId ?? headerCompanyId });
    return this.policyService.togglePolicyStatus(tenantId, companyId, id);
  }

  @Delete(':id')
  async deletePolicy(
    @Param('id') id: string,
    @Headers('authorization') auth: string | undefined,
    @Headers('x-tenant-id') reqTenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query('company_id') queryCompanyId?: string,
  ) {
    const { tenantId, companyId } = resolveScopeContext(auth, { tenantId: reqTenantId, companyId: queryCompanyId ?? headerCompanyId });
    return this.policyService.deletePolicy(tenantId, companyId, id);
  }

  // Grades endpoints are technically under /api/hrm/grades due to global prefix,
  // but since this controller is mounted at /pay-policies, we'll map them 
  // via a separate controller to be clean.
}

@Controller('grades')
export class GradesController {
  constructor(private readonly policyService: PolicyService) {}

  @Get()
  async listGrades(
    @Headers('authorization') auth: string | undefined,
    @Headers('x-tenant-id') reqTenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query('company_id') queryCompanyId?: string,
  ) {
    const { tenantId, companyId } = resolveScopeContext(auth, { tenantId: reqTenantId, companyId: queryCompanyId ?? headerCompanyId });
    const data = await this.policyService.listGrades(tenantId, companyId);
    return { data };
  }

  @Post('evaluate-eligibility')
  async evaluateEligibility(
    @Body() employeeContext: any,
    @Headers('authorization') auth: string | undefined,
    @Headers('x-tenant-id') reqTenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query('company_id') queryCompanyId?: string,
  ) {
    const { tenantId, companyId } = resolveScopeContext(auth, { tenantId: reqTenantId, companyId: queryCompanyId ?? headerCompanyId });
    return this.policyService.evaluateEligibility(tenantId, companyId, employeeContext);
  }


  @Post()
  async saveGrade(
    @Body() dto: any,
    @Headers('authorization') auth: string | undefined,
    @Headers('x-tenant-id') reqTenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query('company_id') queryCompanyId?: string,
  ) {
    const { companyId } = resolveScopeContext(auth, { tenantId: reqTenantId, companyId: queryCompanyId ?? headerCompanyId });
    const id = await this.policyService.saveGrade(companyId, dto);
    return { success: true, id };
  }

}
import { Body, Controller, Get, Headers, HttpStatus, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiException } from '../common/api.exception';
import { ok } from '../common/api-response';
import { isAuthorizedInternalRequest } from '../common/internal-auth';
import { resolveScopeContext } from '../common/scope-context';
import { CreateCandidateDto } from './dto/create-candidate.dto';
import { CreateJobRequisitionDto } from './dto/create-job-requisition.dto';
import { ListCandidatesQueryDto } from './dto/list-candidates.query.dto';
import { ListJobRequisitionsQueryDto } from './dto/list-job-requisitions.query.dto';
import { ScheduleInterviewDto } from './dto/schedule-interview.dto';
import { UpdateInterviewStatusDto } from './dto/update-interview-status.dto';
import { RecruitmentService } from './recruitment.service';

@Controller('recruitment')
export class RecruitmentController {
  constructor(private readonly recruitmentService: RecruitmentService) {}

  private assertAccess(authorization?: string, internalApiKey?: string) {
    if (!isAuthorizedInternalRequest(authorization, internalApiKey)) {
      throw new ApiException('HRM-AUTH-001', 'Unauthorized recruitment access', HttpStatus.UNAUTHORIZED);
    }
  }

  @Post('requisitions')
  createJobRequisition(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Body() body: CreateJobRequisitionDto,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId: body.company_id ?? headerCompanyId });
    return this.recruitmentService.createJobRequisition(body).then((data) => ok(data, 'HRM-REC-201', 'Job requisition created'));
  }

  @Get('requisitions')
  listJobRequisitions(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query() query: ListJobRequisitionsQueryDto,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId: query.company_id ?? headerCompanyId });
    return this.recruitmentService.listJobRequisitions(query).then((data) => ok(data, 'HRM-REC-200', 'Job requisitions listed'));
  }

  @Post('candidates')
  createCandidate(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Body() body: CreateCandidateDto,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId: body.company_id ?? headerCompanyId });
    return this.recruitmentService.createCandidate(body).then((data) => ok(data, 'HRM-REC-202', 'Candidate created'));
  }

  @Get('candidates')
  listCandidates(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query() query: ListCandidatesQueryDto,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId: query.company_id ?? headerCompanyId });
    return this.recruitmentService.listCandidates(query).then((data) => ok(data, 'HRM-REC-200', 'Candidates listed'));
  }

  @Post('interviews')
  scheduleInterview(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Body() body: ScheduleInterviewDto,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId: body.company_id ?? headerCompanyId });
    return this.recruitmentService.scheduleInterview(body).then((data) => ok(data, 'HRM-REC-203', 'Interview scheduled'));
  }

  @Patch('interviews/:interviewId/status')
  updateInterviewStatus(
    @Param('interviewId', new ParseUUIDPipe()) interviewId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') companyId: string | undefined,
    @Body() body: UpdateInterviewStatusDto,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId });
    return this.recruitmentService.updateInterviewStatus(interviewId, body).then((data) => ok(data, 'HRM-REC-204', 'Interview updated'));
  }
}

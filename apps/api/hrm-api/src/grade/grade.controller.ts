/**
 * @CODE-MEMORY
 * Screen:     HRM · Cài đặt · Thang bảng lương + Nhân viên · Ngạch-Bậc
 * UC:         UC-E1-01, UC-E1-02, UC-E1-03
 * SRS:        docs/hrm/SRS_HRM_PAYROLL_POLICY_ENGINE_v1.md §3
 * API:        API_CONTRACT_HRM_POLICY_ENGINE_v1.md §1
 * Purpose:    HTTP controllers for Grade Management + Grade Promotions.
 *             Guards: HrmJwtGuard applied at class level.
 * WorkItem:   HRM-POLICY-E1-01
 * Coded:      2026-08-22
 * SOLID:      SRP — routing + serialization only; business logic in Services
 * must_keep:  HrmJwtGuard must remain; tenant_id from req.hrmUser.tenantId
 */
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import type { Request } from "express";
import { HrmJwtGuard } from "../common/hrm-jwt.guard";
import type {
  CreateGradeDto,
  GradeAssignmentDto,
  GradePromotionDto,
  UpdateStepsDto,
} from "./dto/grade.dto";
import { GradePromotionService } from "./grade-promotion.service";
import { GradeService } from "./grade.service";

/** Extended request type: HrmJwtGuard attaches hrmUser to req */
type HrmRequest = Request & {
  hrmUser: { tenantId: string; userId: string; email: string };
};

@Controller("grades")
@UseGuards(HrmJwtGuard)
export class GradeController {
  constructor(
    private readonly gradeSvc: GradeService,
    private readonly promotionSvc: GradePromotionService,
  ) {}

  /** GET /grades?as_of_date=YYYY-MM-DD */
  @Get()
  async listGrades(
    @Req() req: HrmRequest,
    @Query("as_of_date") asOfDate?: string,
  ) {
    const date = asOfDate ?? new Date().toISOString().slice(0, 10);
    const data = await this.gradeSvc.listGrades(req.hrmUser.tenantId, date);
    return { data };
  }

  /** POST /grades — Tạo grade definition mới (theo QĐ) */
  @Post()
  async createGrade(@Req() req: HrmRequest, @Body() dto: CreateGradeDto) {
    const result = await this.gradeSvc.createGrade(
      req.hrmUser.tenantId,
      dto,
      req.hrmUser.userId,
    );
    return result;
  }

  /** PUT /grades/:id/steps — Update mức lương bậc */
  @Put(":id/steps")
  async updateSteps(
    @Req() req: HrmRequest,
    @Param("id") id: string,
    @Body() dto: UpdateStepsDto,
  ) {
    await this.gradeSvc.updateSteps(req.hrmUser.tenantId, id, dto);
    return { ok: true };
  }

  /** POST /grades/promotions — Tạo đề xuất nâng bậc */
  @Post("promotions")
  async createPromotion(
    @Req() req: HrmRequest,
    @Body() dto: GradePromotionDto,
  ) {
    return this.promotionSvc.createPromotion(
      req.hrmUser.tenantId,
      dto,
      req.hrmUser.userId,
    );
  }
}

/** Separate controller for employee-scoped grade routes */
@Controller("employees")
@UseGuards(HrmJwtGuard)
export class EmployeeGradeController {
  constructor(private readonly gradeSvc: GradeService) {}

  /** POST /employees/:id/grade-assignment */
  @Post(":id/grade-assignment")
  async assignGrade(
    @Req() req: HrmRequest,
    @Param("id") employeeId: string,
    @Body() dto: GradeAssignmentDto,
  ) {
    return this.gradeSvc.assignGrade(
      req.hrmUser.tenantId,
      employeeId,
      dto,
      req.hrmUser.userId,
    );
  }

  /** GET /employees/:id/grade-history */
  @Get(":id/grade-history")
  async getGradeHistory(
    @Req() req: HrmRequest,
    @Param("id") employeeId: string,
  ) {
    const history = await this.gradeSvc.getGradeHistory(
      req.hrmUser.tenantId,
      employeeId,
    );
    return { employee_id: employeeId, history };
  }
}

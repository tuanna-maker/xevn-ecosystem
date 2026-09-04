/**
 * @CODE-MEMORY
 * Screen:     HRM · Nhập liệu lương
 * UC:         UC-E3-01..06
 * API:        API_CONTRACT_HRM_POLICY_ENGINE_v1.md §3
 * Purpose:    HTTP routing for Input Data Hub.
 *             Handles multipart file upload via multer (memory storage).
 * WorkItem:   HRM-POLICY-E3-01
 * Coded:      2026-08-22
 * SOLID:      SRP — routing only; business logic in InputService
 * must_keep:  FileInterceptor + UploadedFile for multipart; HrmJwtGuard at class level
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
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import type { Request } from "express";
import { HrmJwtGuard } from "../common/hrm-jwt.guard";
import type { InputType, OverrideRowDto } from "./dto/input.dto";
import { InputService } from "./input.service";

type HrmRequest = Request & {
  hrmUser: { tenantId: string; userId: string };
};

@Controller("payroll-inputs")
@UseGuards(HrmJwtGuard)
export class InputController {
  constructor(private readonly inputSvc: InputService) {}

  /** POST /payroll-inputs/import — upload Excel file */
  @Post("import")
  @UseInterceptors(FileInterceptor("file"))
  async uploadImport(
    @Req() req: HrmRequest,
    @UploadedFile() file: Express.Multer.File,
    @Body("period_month") periodMonth: string,
    @Body("input_type") inputType: InputType,
  ) {
    if (!file) throw { statusCode: 400, message: "file is required" };
    if (!periodMonth) throw { statusCode: 400, message: "period_month is required (YYYY-MM)" };
    if (!inputType) throw { statusCode: 400, message: "input_type is required" };

    return this.inputSvc.uploadImport(
      req.hrmUser.tenantId,
      periodMonth,
      inputType,
      file.buffer,
      file.originalname,
      req.hrmUser.userId,
    );
  }

  /** GET /payroll-inputs/:period — Danh sách imports cho kỳ (YYYY-MM) */
  @Get(":period")
  async listByPeriod(@Req() req: HrmRequest, @Param("period") period: string) {
    return this.inputSvc.listByPeriod(req.hrmUser.tenantId, period);
  }

  /** GET /payroll-inputs/imports/:id/rows */
  @Get("imports/:id/rows")
  async getRows(
    @Req() req: HrmRequest,
    @Param("id") id: string,
    @Query("status") status?: string,
    @Query("page") page?: string,
    @Query("limit") limit?: string,
  ) {
    return this.inputSvc.getRows(id, req.hrmUser.tenantId, {
      status,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 50,
    });
  }

  /** PUT /payroll-inputs/imports/:id/rows/:rowId — Manual override */
  @Put("imports/:id/rows/:rowId")
  async overrideRow(
    @Req() req: HrmRequest,
    @Param("id") importId: string,
    @Param("rowId") rowId: string,
    @Body() dto: OverrideRowDto,
  ) {
    return this.inputSvc.overrideRow(
      req.hrmUser.tenantId,
      importId,
      rowId,
      dto,
      req.hrmUser.userId,
    );
  }

  /** POST /payroll-inputs/imports/:id/approve */
  @Post("imports/:id/approve")
  async approveImport(
    @Req() req: HrmRequest,
    @Param("id") importId: string,
  ) {
    return this.inputSvc.approveImport(
      req.hrmUser.tenantId,
      importId,
      req.hrmUser.userId,
    );
  }
}

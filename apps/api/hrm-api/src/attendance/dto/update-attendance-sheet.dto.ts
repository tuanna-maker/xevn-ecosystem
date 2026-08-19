/**
 * @CODE-MEMORY
 * Screen:     HRM → Chấm công — bảng công (PATCH)
 * UC:         FR-UC-H03 · attendance sheets
 * Purpose:    Partial update DTO for attendance sheet (PartialType create).
 * WorkItem:   W1-B-01-BE-DIST-RESTORE
 * Coded:      2026-08-03
 * Callers:    attendance.controller · attendance-catalog.service
 * must_keep:  PartialType(CreateAttendanceSheetDto) parity with dist
 * SOLID:      Mapped-types only — no business logic
 * LastVerified: tsc tsconfig.build.json
 *
 * @CODE-MEMORY-CHANGE 2026-08-03
 * WorkItem: W1-B-01-BE-DIST-RESTORE
 * change_mode: ADD
 * What: Restore src from dist update-attendance-sheet.dto.js/.d.ts
 * Why: TS2307 R-HRM-DIST-MISSING
 * must_keep: extends PartialType(CreateAttendanceSheetDto)
 */
import { PartialType } from '@nestjs/mapped-types';
import { CreateAttendanceSheetDto } from './create-attendance-sheet.dto';

export class UpdateAttendanceSheetDto extends PartialType(CreateAttendanceSheetDto) {}

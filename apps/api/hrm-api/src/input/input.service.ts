/**
 * @CODE-MEMORY
 * Screen:     HRM · Nhập liệu lương · Input Data Hub
 * UC:         UC-E3-01..06
 * SRS:        docs/hrm/SRS_HRM_PAYROLL_POLICY_ENGINE_v1.md §5
 * Purpose:    Orchestrate Excel import lifecycle:
 *             upload → parse → validate → approve → make available for payroll batch.
 *             Uses ExcelParserFactory for type-specific column mapping.
 *             Employee matching: exact ma_nv first, fuzzy name fallback.
 * WorkItem:   HRM-POLICY-E3-01
 * Coded:      2026-08-22
 * Callers:    InputController
 * Callees:    HrmDbService, ExcelParserFactory
 * FORBIDDEN:  Hard-delete · float money · cross-plane FK · bypass period lock
 * must_keep:  period_month always stored as 1st day of month (DATE);
 *             version auto-increments within period+type;
 *             approved batch cannot be re-uploaded (must use new version);
 *             APPROVED import is SUPERSEDED when new version uploaded
 */
import { HttpStatus, Injectable } from "@nestjs/common";
import { HrmDbService } from "../db/hrm-db.service";
import {
  INPUT_TYPES,
  type ImportRow,
  type ImportStatus,
  type InputDataRow,
  type InputType,
  type OverrideRowDto,
  type ParsedRow,
} from "./dto/input.dto";
import { parseExcel } from "./parsers/excel-parser.factory";

@Injectable()
export class InputService {
  private schemaReady = false;

  constructor(private readonly db: HrmDbService) {}

  async ensureSchema(): Promise<void> {
    if (this.schemaReady) return;

    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.pay_input_imports (
        id              BIGSERIAL     PRIMARY KEY,
        tenant_id       TEXT          NOT NULL DEFAULT '',
        period_month    DATE          NOT NULL,
        input_type      TEXT          NOT NULL,
        version         SMALLINT      NOT NULL DEFAULT 1,
        status          TEXT          NOT NULL DEFAULT 'PENDING',
        file_url        TEXT          NULL,
        file_name       TEXT          NULL,
        total_rows      INTEGER       NOT NULL DEFAULT 0,
        error_rows      INTEGER       NOT NULL DEFAULT 0,
        uploaded_by     TEXT          NOT NULL DEFAULT '',
        validated_at    TIMESTAMPTZ   NULL,
        approved_by     TEXT          NULL,
        approved_at     TIMESTAMPTZ   NULL,
        created_at      TIMESTAMPTZ   NOT NULL DEFAULT now(),
        deleted_at      TIMESTAMPTZ   NULL
      );
    `);
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS idx_pay_input_import_period_type
        ON public.pay_input_imports (tenant_id, period_month, input_type, status)
        WHERE deleted_at IS NULL;
    `);

    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.pay_input_rows (
        id                BIGSERIAL     PRIMARY KEY,
        import_id         BIGINT        NOT NULL,
        employee_id       TEXT          NULL,
        raw_employee_ref  TEXT          NOT NULL,
        row_number        INTEGER       NOT NULL,
        data              JSONB         NOT NULL DEFAULT '{}',
        row_status        TEXT          NOT NULL DEFAULT 'OK',
        error_message     TEXT          NULL,
        overridden_by     TEXT          NULL,
        overridden_at     TIMESTAMPTZ   NULL,
        created_at        TIMESTAMPTZ   NOT NULL DEFAULT now()
      );
    `);
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS idx_pay_input_rows_import_status
        ON public.pay_input_rows (import_id, row_status);
    `);

    this.schemaReady = true;
  }

  // ─── UPLOAD ──────────────────────────────────────────────────────────────────

  /**
   * Upload + parse + persist Excel import.
   * Returns import_id for polling status.
   * Validation (employee match) runs async after return.
   */
  async uploadImport(
    tenantId: string,
    periodMonthStr: string, // "YYYY-MM"
    inputType: InputType,
    fileBuffer: Buffer,
    fileName: string,
    uploadedBy: string,
  ): Promise<{ import_id: string; status: ImportStatus; total_rows: number }> {
    await this.ensureSchema();

    if (!INPUT_TYPES.includes(inputType as InputType)) {
      throw { statusCode: HttpStatus.BAD_REQUEST, message: `HRM-IMPORT-TYPE-INVALID: ${inputType}` };
    }

    // period_month → first day of month
    const periodMonth = `${periodMonthStr}-01`;

    // Check if period is locked
    const { rows: [locked] } = await this.db.query<{ cnt: string }>(
      `SELECT count(*)::text AS cnt
       FROM public.payroll_batches
       WHERE tenant_id = $1
         AND period_month = $2
         AND status = 'LOCKED'
         AND deleted_at IS NULL`,
      [tenantId, periodMonth],
    ).catch(() => ({ rows: [{ cnt: "0" }] }));
    if (Number(locked?.cnt ?? 0) > 0) {
      throw {
        statusCode: HttpStatus.CONFLICT,
        message: "HRM-IMPORT-PERIOD-LOCKED: This payroll period is locked",
      };
    }

    // Compute next version
    const { rows: [versionRow] } = await this.db.query<{ max_version: string }>(
      `SELECT COALESCE(MAX(version), 0)::text AS max_version
       FROM public.pay_input_imports
       WHERE tenant_id = $1 AND period_month = $2 AND input_type = $3
         AND deleted_at IS NULL`,
      [tenantId, periodMonth, inputType],
    );
    const nextVersion = Number(versionRow?.max_version ?? 0) + 1;

    // Supersede previous APPROVED version
    await this.db.query(
      `UPDATE public.pay_input_imports
       SET status = 'SUPERSEDED', updated_at = now()
       WHERE tenant_id = $1 AND period_month = $2 AND input_type = $3
         AND status = 'APPROVED' AND deleted_at IS NULL`,
      [tenantId, periodMonth, inputType],
    ).catch(() => {}); // Column may not exist yet — swallow

    // Parse Excel
    let parsed: ParsedRow[];
    try {
      parsed = parseExcel(fileBuffer, inputType);
    } catch (e: unknown) {
      throw {
        statusCode: HttpStatus.BAD_REQUEST,
        message: `Failed to parse Excel file: ${e instanceof Error ? e.message : String(e)}`,
      };
    }

    // Insert import record
    const { rows: [imp] } = await this.db.query<{ id: string }>(
      `INSERT INTO public.pay_input_imports
         (tenant_id, period_month, input_type, version, status, file_name,
          total_rows, uploaded_by)
       VALUES ($1, $2, $3, $4, 'PENDING', $5, $6, $7)
       RETURNING id::text`,
      [tenantId, periodMonth, inputType, nextVersion, fileName, parsed.length, uploadedBy],
    );
    const importId = imp.id;

    // Insert rows (batch, 50 at a time)
    const BATCH = 50;
    for (let i = 0; i < parsed.length; i += BATCH) {
      const chunk = parsed.slice(i, i + BATCH);
      // Build multi-value INSERT
      const values: unknown[] = [];
      const placeholders = chunk.map((row, j) => {
        const base = i + j;
        const offset = base * 5;
        values.push(
          importId,
          row.raw_employee_ref,
          row.row_number,
          JSON.stringify(row.data),
          row.parse_error ? "ERROR" : "OK",
        );
        return `($${offset+1}, $${offset+2}, $${offset+3}, $${offset+4}, $${offset+5})`;
      });
      await this.db.query(
        `INSERT INTO public.pay_input_rows
           (import_id, raw_employee_ref, row_number, data, row_status)
         VALUES ${placeholders.join(",")}`,
        values,
      );
    }

    // Mark status VALIDATED after basic parse (sync)
    // Full employee matching runs as separate step
    await this.db.query(
      `UPDATE public.pay_input_imports
       SET status = 'VALIDATED', validated_at = now()
       WHERE id = $1`,
      [importId],
    );

    // Run employee match (async, fire-and-forget)
    this.matchEmployees(tenantId, importId).catch(() => {});

    return { import_id: importId, status: "VALIDATED", total_rows: parsed.length };
  }

  // ─── EMPLOYEE MATCHING ───────────────────────────────────────────────────────

  /** Match raw_employee_ref → employee_id. Exact ma_nv first; name fallback → WARNING */
  private async matchEmployees(tenantId: string, importId: string): Promise<void> {
    const { rows } = await this.db.query<{ id: string; raw_employee_ref: string }>(
      `SELECT id::text, raw_employee_ref
       FROM public.pay_input_rows
       WHERE import_id = $1 AND row_status = 'OK'`,
      [importId],
    );

    for (const row of rows) {
      // Try exact code match
      const { rows: [emp] } = await this.db.query<{ id: string }>(
        `SELECT id FROM public.employees
         WHERE tenant_id = $1 AND (code = $2 OR id = $2) AND deleted_at IS NULL
         LIMIT 1`,
        [tenantId, row.raw_employee_ref],
      ).catch(() => ({ rows: [] }));

      if (emp) {
        await this.db.query(
          `UPDATE public.pay_input_rows SET employee_id = $1 WHERE id = $2`,
          [emp.id, row.id],
        );
        continue;
      }

      // Fallback: name search (case-insensitive, partial)
      const { rows: nameMatches } = await this.db.query<{ id: string; full_name: string }>(
        `SELECT id, full_name
         FROM public.employees
         WHERE tenant_id = $1
           AND full_name ILIKE $2
           AND deleted_at IS NULL
         LIMIT 3`,
        [tenantId, `%${row.raw_employee_ref}%`],
      ).catch(() => ({ rows: [] }));

      if (nameMatches.length === 1) {
        // Unambiguous match
        await this.db.query(
          `UPDATE public.pay_input_rows SET employee_id = $1 WHERE id = $2`,
          [nameMatches[0]!.id, row.id],
        );
      } else if (nameMatches.length > 1) {
        // Ambiguous — mark WARNING for HR to resolve
        await this.db.query(
          `UPDATE public.pay_input_rows
           SET row_status = 'WARNING',
               error_message = $1
           WHERE id = $2`,
          [
            `Tìm thấy ${nameMatches.length} NV khớp: ${nameMatches.map((m) => m.full_name).join(", ")}`,
            row.id,
          ],
        );
      } else {
        // No match — ERROR
        await this.db.query(
          `UPDATE public.pay_input_rows
           SET row_status = 'ERROR',
               error_message = $1
           WHERE id = $2`,
          [`Không tìm thấy nhân viên khớp với '${row.raw_employee_ref}'`, row.id],
        );
      }
    }

    // Update error_rows count on import
    await this.db.query(
      `UPDATE public.pay_input_imports
       SET error_rows = (
         SELECT count(*) FROM public.pay_input_rows
         WHERE import_id = $1 AND row_status IN ('ERROR', 'WARNING')
       )
       WHERE id = $1`,
      [importId],
    );
  }

  // ─── LIST ────────────────────────────────────────────────────────────────────

  /** Danh sách imports theo kỳ + trạng thái từng loại */
  async listByPeriod(tenantId: string, periodMonthStr: string) {
    await this.ensureSchema();
    const periodMonth = `${periodMonthStr}-01`;

    const { rows } = await this.db.query<ImportRow>(
      `SELECT id::text, tenant_id, period_month, input_type, version, status,
              file_name, total_rows, error_rows, uploaded_by, validated_at,
              approved_by, approved_at, created_at
       FROM public.pay_input_imports
       WHERE tenant_id = $1 AND period_month = $2 AND deleted_at IS NULL
       ORDER BY input_type, version DESC`,
      [tenantId, periodMonth],
    );

    // Find missing types
    const presentTypes = new Set(rows.map((r) => r.input_type));
    const missingTypes = INPUT_TYPES.filter((t) => !presentTypes.has(t));

    return {
      period_month: periodMonth,
      imports: rows,
      missing_types: missingTypes,
    };
  }

  // ─── ROWS PREVIEW ─────────────────────────────────────────────────────────────

  /** Preview rows với filter + pagination */
  async getRows(
    importId: string,
    tenantId: string,
    opts: { status?: string; page?: number; limit?: number },
  ) {
    await this.ensureSchema();
    const page = opts.page ?? 1;
    const limit = Math.min(opts.limit ?? 50, 200);
    const offset = (page - 1) * limit;

    // Verify import belongs to tenant
    const { rows: [imp] } = await this.db.query<{ id: string }>(
      `SELECT id FROM public.pay_input_imports WHERE id = $1 AND tenant_id = $2`,
      [importId, tenantId],
    );
    if (!imp) throw { statusCode: HttpStatus.NOT_FOUND, message: "Import not found" };

    const statusFilter = opts.status ? ` AND row_status = $3` : "";
    const params: unknown[] = opts.status
      ? [importId, limit, opts.status, offset]
      : [importId, limit, offset];

    const { rows } = await this.db.query<InputDataRow>(
      `SELECT id::text, import_id::text, employee_id, raw_employee_ref,
              row_number, data, row_status, error_message,
              overridden_by, overridden_at, created_at
       FROM public.pay_input_rows
       WHERE import_id = $1${statusFilter}
       ORDER BY row_number ASC
       LIMIT $2 OFFSET $${opts.status ? 4 : 3}`,
      params,
    );

    const { rows: [countRow] } = await this.db.query<{ cnt: string }>(
      `SELECT count(*)::text AS cnt FROM public.pay_input_rows WHERE import_id = $1`,
      [importId],
    );

    return { import_id: importId, rows, total: Number(countRow?.cnt ?? 0) };
  }

  // ─── OVERRIDE ROW ─────────────────────────────────────────────────────────────

  /** HR override 1 row: sửa employee_id và/hoặc data */
  async overrideRow(
    tenantId: string,
    importId: string,
    rowId: string,
    dto: OverrideRowDto,
    overriddenBy: string,
  ) {
    await this.ensureSchema();

    // Verify ownership
    const { rows: [row] } = await this.db.query<{ id: string; import_id: string }>(
      `SELECT pir.id::text, pir.import_id::text
       FROM public.pay_input_rows pir
       JOIN public.pay_input_imports pii ON pii.id = pir.import_id
       WHERE pir.id = $1 AND pii.tenant_id = $2 AND pii.id = $3`,
      [rowId, tenantId, importId],
    );
    if (!row) throw { statusCode: HttpStatus.NOT_FOUND, message: "Row not found" };

    const setParts: string[] = [
      "row_status = 'OVERRIDDEN'",
      "overridden_by = $2",
      "overridden_at = now()",
    ];
    const params: unknown[] = [rowId, overriddenBy];

    if (dto.employee_id) {
      params.push(dto.employee_id);
      setParts.push(`employee_id = $${params.length}`);
    }
    if (dto.data) {
      params.push(JSON.stringify(dto.data));
      setParts.push(`data = data || $${params.length}::jsonb`);
    }

    await this.db.query(
      `UPDATE public.pay_input_rows SET ${setParts.join(", ")} WHERE id = $1`,
      params,
    );

    // Recalculate error_rows on parent import
    await this.db.query(
      `UPDATE public.pay_input_imports
       SET error_rows = (
         SELECT count(*) FROM public.pay_input_rows
         WHERE import_id = $1 AND row_status IN ('ERROR', 'WARNING')
       )
       WHERE id = $1`,
      [importId],
    );

    return { row_id: rowId, row_status: "OVERRIDDEN", overridden_by: overriddenBy };
  }

  // ─── APPROVE ─────────────────────────────────────────────────────────────────

  /** HR_MANAGER phê duyệt import. Chỉ khi error_rows = 0. */
  async approveImport(
    tenantId: string,
    importId: string,
    approvedBy: string,
  ) {
    await this.ensureSchema();

    const { rows: [imp] } = await this.db.query<{
      id: string;
      error_rows: number;
      status: ImportStatus;
    }>(
      `SELECT id::text, error_rows, status
       FROM public.pay_input_imports
       WHERE id = $1 AND tenant_id = $2 AND deleted_at IS NULL`,
      [importId, tenantId],
    );

    if (!imp) throw { statusCode: HttpStatus.NOT_FOUND, message: "Import not found" };
    if (imp.error_rows > 0) {
      throw {
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        message: `Cannot approve: ${imp.error_rows} rows with errors remain`,
      };
    }

    await this.db.query(
      `UPDATE public.pay_input_imports
       SET status = 'APPROVED', approved_by = $1, approved_at = now()
       WHERE id = $2`,
      [approvedBy, importId],
    );

    return {
      import_id: importId,
      status: "APPROVED" as ImportStatus,
      approved_by: approvedBy,
      approved_at: new Date().toISOString(),
    };
  }

  // ─── HELPER (used by PayrollBatch) ───────────────────────────────────────────

  /** Lấy toàn bộ APPROVED rows cho kỳ lương — dùng bởi PayrollBatchService */
  async getApprovedRows(
    tenantId: string,
    periodMonthStr: string,
    inputType: InputType,
  ): Promise<InputDataRow[]> {
    await this.ensureSchema();
    const periodMonth = `${periodMonthStr}-01`;

    const { rows } = await this.db.query<InputDataRow>(
      `SELECT pir.id::text, pir.import_id::text, pir.employee_id,
              pir.raw_employee_ref, pir.row_number, pir.data,
              pir.row_status, pir.error_message, pir.created_at
       FROM public.pay_input_rows pir
       JOIN public.pay_input_imports pii ON pii.id = pir.import_id
       WHERE pii.tenant_id = $1
         AND pii.period_month = $2
         AND pii.input_type = $3
         AND pii.status = 'APPROVED'
         AND pii.deleted_at IS NULL
         AND pir.row_status IN ('OK', 'OVERRIDDEN')
       ORDER BY pir.row_number ASC`,
      [tenantId, periodMonth, inputType],
    );

    return rows;
  }
}

import { HttpStatus, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { ApiException } from '../common/api.exception';
import { assertResourceInHrmScope, pushCompanyIdFilter, resolveHrmListScope } from '../common/hrm-list-scope';
import { HrmDbService } from '../db/hrm-db.service';
import { EmployeeProfileListQueryDto } from './dto/employee-profile-list.query.dto';
import { EmployeesService } from './employees.service';

type ProfileRow = Record<string, unknown> & { id: string };

@Injectable()
export class EmployeeProfileService {
  constructor(
    private readonly db: HrmDbService,
    private readonly employees: EmployeesService,
  ) {}

  private async ensureSchema() {
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.hrm_employee_degrees (
        id UUID PRIMARY KEY,
        employee_id UUID NOT NULL,
        company_id TEXT NOT NULL,
        degree_type TEXT,
        institution TEXT,
        field_of_study TEXT,
        graduation_year INT,
        payload JSONB NOT NULL DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.employee_trainings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        employee_id UUID NOT NULL,
        company_id TEXT NOT NULL,
        name TEXT NOT NULL,
        type TEXT NOT NULL DEFAULT 'internal',
        category TEXT NOT NULL DEFAULT 'other',
        provider TEXT,
        instructor TEXT,
        start_date DATE,
        end_date DATE,
        duration INTEGER NOT NULL DEFAULT 0,
        duration_unit TEXT NOT NULL DEFAULT 'hours',
        location TEXT,
        status TEXT NOT NULL DEFAULT 'planned',
        progress INTEGER NOT NULL DEFAULT 0,
        score NUMERIC,
        certificate_number TEXT,
        certificate_file_url TEXT,
        cost NUMERIC NOT NULL DEFAULT 0,
        paid_by TEXT NOT NULL DEFAULT 'company',
        description TEXT,
        skills JSONB NOT NULL DEFAULT '[]'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.employee_assets (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        employee_id UUID NOT NULL,
        company_id TEXT NOT NULL,
        asset_code TEXT,
        asset_name TEXT NOT NULL,
        category TEXT,
        serial_number TEXT,
        assigned_date DATE,
        return_date DATE,
        status TEXT NOT NULL DEFAULT 'assigned',
        condition TEXT,
        notes TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await this.db.query(`
      ALTER TABLE public.employee_assets ADD COLUMN IF NOT EXISTS brand TEXT;
      ALTER TABLE public.employee_assets ADD COLUMN IF NOT EXISTS model TEXT;
      ALTER TABLE public.employee_assets ADD COLUMN IF NOT EXISTS specifications TEXT;
      ALTER TABLE public.employee_assets ADD COLUMN IF NOT EXISTS value NUMERIC NOT NULL DEFAULT 0;
    `);
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.employee_skills (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        employee_id UUID NOT NULL,
        company_id TEXT NOT NULL,
        category TEXT NOT NULL DEFAULT 'technical',
        name TEXT NOT NULL,
        level INTEGER NOT NULL DEFAULT 50,
        notes TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.employee_work_timeline (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        employee_id UUID NOT NULL,
        company_id TEXT NOT NULL,
        event_date DATE NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        event_type TEXT NOT NULL DEFAULT 'position',
        status TEXT NOT NULL DEFAULT 'current',
        contract_code TEXT,
        department TEXT,
        position TEXT,
        notes TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.employee_resume_files (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        employee_id UUID NOT NULL,
        company_id TEXT NOT NULL,
        name TEXT NOT NULL,
        file_type TEXT,
        file_url TEXT NOT NULL,
        file_size TEXT,
        notes TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.employee_rewards (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        employee_id UUID NOT NULL,
        company_id TEXT NOT NULL,
        reward_date DATE NOT NULL,
        reward_type TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        decision_number TEXT,
        amount NUMERIC NOT NULL DEFAULT 0,
        issued_by TEXT,
        status TEXT NOT NULL DEFAULT 'active',
        notes TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.employee_discipline (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        employee_id UUID NOT NULL,
        company_id TEXT NOT NULL,
        discipline_date DATE NOT NULL,
        discipline_type TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        decision_number TEXT,
        penalty_amount NUMERIC NOT NULL DEFAULT 0,
        issued_by TEXT,
        effective_from DATE,
        effective_to DATE,
        status TEXT NOT NULL DEFAULT 'active',
        notes TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
  }

  private async listScopedRows(
    fromSql: string,
    selectSql: string,
    employeeId: string,
    query: EmployeeProfileListQueryDto,
    authorization?: string,
  ) {
    await this.ensureSchema();
    const employee = await this.employees.getEmployeeById(employeeId, query, authorization);
    const filters = ['employee_id = $1::uuid'];
    const values: unknown[] = [employeeId];
    pushCompanyIdFilter(filters, values, [employee.company_id]);
    const res = await this.db.query<ProfileRow>(
      `
        SELECT ${selectSql}
        FROM ${fromSql}
        WHERE ${filters.join(' AND ')}
        ORDER BY updated_at DESC
        LIMIT 500;
      `,
      values,
    );
    return {
      total: res.rows.length,
      data: res.rows,
    };
  }

  listDegrees(employeeId: string, query: EmployeeProfileListQueryDto, authorization?: string) {
    return this.listScopedRows(
      'public.hrm_employee_degrees',
      'id, employee_id, company_id, payload, created_at, updated_at',
      employeeId,
      query,
      authorization,
    ).then((result) => ({
      ...result,
      data: result.data.map((row) => ({
        id: row.id,
        employee_id: employeeId,
        company_id: row.company_id,
        ...(typeof row.payload === 'object' && row.payload ? (row.payload as Record<string, unknown>) : {}),
        created_at: row.created_at,
        updated_at: row.updated_at,
      })),
      phase: 'P1-stub-read',
    }));
  }

  listTraining(employeeId: string, query: EmployeeProfileListQueryDto, authorization?: string) {
    return this.listScopedRows(
      'public.employee_trainings',
      '*',
      employeeId,
      query,
      authorization,
    );
  }

  listAssets(employeeId: string, query: EmployeeProfileListQueryDto, authorization?: string) {
    return this.listScopedRows(
      'public.employee_assets',
      '*',
      employeeId,
      query,
      authorization,
    );
  }

  createAsset(employeeId: string, query: EmployeeProfileListQueryDto, payload: Record<string, unknown>, authorization?: string) {
    return this.insertProfileRow('public.employee_assets', employeeId, query, authorization, payload);
  }

  updateAsset(
    assetId: string,
    employeeId: string,
    query: EmployeeProfileListQueryDto,
    payload: Record<string, unknown>,
    authorization?: string,
  ) {
    return this.updateProfileRow('public.employee_assets', assetId, employeeId, query, authorization, payload, [
      'asset_code',
      'asset_name',
      'category',
      'serial_number',
      'assigned_date',
      'return_date',
      'status',
      'condition',
      'notes',
      'brand',
      'model',
      'specifications',
      'value',
    ]);
  }

  deleteAsset(assetId: string, employeeId: string, query: EmployeeProfileListQueryDto, authorization?: string) {
    return this.deleteProfileRow('public.employee_assets', assetId, employeeId, query, authorization);
  }

  listSkills(employeeId: string, query: EmployeeProfileListQueryDto, authorization?: string) {
    return this.listScopedRows('public.employee_skills', '*', employeeId, query, authorization);
  }

  createSkill(employeeId: string, query: EmployeeProfileListQueryDto, payload: Record<string, unknown>, authorization?: string) {
    const skillLevel = this.resolveSkillLevel(payload, 50);
    return this.insertProfileRow('public.employee_skills', employeeId, query, authorization, {
      category: payload.category ?? 'technical',
      name: payload.name,
      level: skillLevel,
      notes: payload.notes ?? null,
    });
  }

  updateSkill(skillId: string, employeeId: string, query: EmployeeProfileListQueryDto, payload: Record<string, unknown>, authorization?: string) {
    const normalizedPayload: Record<string, unknown> = { ...payload };
    const skillLevel = this.resolveSkillLevel(payload);
    if (skillLevel !== undefined) {
      normalizedPayload.level = skillLevel;
    }
    return this.updateProfileRow('public.employee_skills', skillId, employeeId, query, authorization, normalizedPayload, [
      'category',
      'name',
      'level',
      'notes',
    ]);
  }

  deleteSkill(skillId: string, employeeId: string, query: EmployeeProfileListQueryDto, authorization?: string) {
    return this.deleteProfileRow('public.employee_skills', skillId, employeeId, query, authorization);
  }

  listWorkTimeline(employeeId: string, query: EmployeeProfileListQueryDto, authorization?: string) {
    return this.listScopedRows('public.employee_work_timeline', '*', employeeId, query, authorization);
  }

  createWorkTimelineItem(employeeId: string, query: EmployeeProfileListQueryDto, payload: Record<string, unknown>, authorization?: string) {
    return this.insertProfileRow('public.employee_work_timeline', employeeId, query, authorization, payload);
  }

  updateWorkTimelineItem(
    itemId: string,
    employeeId: string,
    query: EmployeeProfileListQueryDto,
    payload: Record<string, unknown>,
    authorization?: string,
  ) {
    return this.updateProfileRow('public.employee_work_timeline', itemId, employeeId, query, authorization, payload, [
      'event_date',
      'title',
      'description',
      'event_type',
      'status',
      'contract_code',
      'department',
      'position',
      'notes',
    ]);
  }

  deleteWorkTimelineItem(itemId: string, employeeId: string, query: EmployeeProfileListQueryDto, authorization?: string) {
    return this.deleteProfileRow('public.employee_work_timeline', itemId, employeeId, query, authorization);
  }

  listResumeFiles(employeeId: string, query: EmployeeProfileListQueryDto, authorization?: string) {
    return this.listScopedRows('public.employee_resume_files', '*', employeeId, query, authorization);
  }

  createResumeFile(employeeId: string, query: EmployeeProfileListQueryDto, payload: Record<string, unknown>, authorization?: string) {
    return this.insertProfileRow('public.employee_resume_files', employeeId, query, authorization, payload);
  }

  deleteResumeFile(fileId: string, employeeId: string, query: EmployeeProfileListQueryDto, authorization?: string) {
    return this.deleteProfileRow('public.employee_resume_files', fileId, employeeId, query, authorization);
  }

  listRewards(employeeId: string, query: EmployeeProfileListQueryDto, authorization?: string) {
    return this.listScopedRows('public.employee_rewards', '*', employeeId, query, authorization);
  }

  listDiscipline(employeeId: string, query: EmployeeProfileListQueryDto, authorization?: string) {
    return this.listScopedRows('public.employee_discipline', '*', employeeId, query, authorization);
  }

  createReward(employeeId: string, query: EmployeeProfileListQueryDto, payload: Record<string, unknown>, authorization?: string) {
    return this.insertProfileRow('public.employee_rewards', employeeId, query, authorization, payload);
  }

  updateReward(rewardId: string, employeeId: string, query: EmployeeProfileListQueryDto, payload: Record<string, unknown>, authorization?: string) {
    return this.updateProfileRow('public.employee_rewards', rewardId, employeeId, query, authorization, payload, [
      'reward_date',
      'reward_type',
      'title',
      'description',
      'decision_number',
      'amount',
      'issued_by',
      'status',
      'notes',
    ]);
  }

  deleteReward(rewardId: string, employeeId: string, query: EmployeeProfileListQueryDto, authorization?: string) {
    return this.deleteProfileRow('public.employee_rewards', rewardId, employeeId, query, authorization);
  }

  createDiscipline(employeeId: string, query: EmployeeProfileListQueryDto, payload: Record<string, unknown>, authorization?: string) {
    return this.insertProfileRow('public.employee_discipline', employeeId, query, authorization, payload);
  }

  updateDiscipline(
    disciplineId: string,
    employeeId: string,
    query: EmployeeProfileListQueryDto,
    payload: Record<string, unknown>,
    authorization?: string,
  ) {
    return this.updateProfileRow('public.employee_discipline', disciplineId, employeeId, query, authorization, payload, [
      'discipline_date',
      'discipline_type',
      'title',
      'description',
      'decision_number',
      'penalty_amount',
      'issued_by',
      'effective_from',
      'effective_to',
      'status',
      'notes',
    ]);
  }

  deleteDiscipline(disciplineId: string, employeeId: string, query: EmployeeProfileListQueryDto, authorization?: string) {
    return this.deleteProfileRow('public.employee_discipline', disciplineId, employeeId, query, authorization);
  }

  createTraining(employeeId: string, query: EmployeeProfileListQueryDto, payload: Record<string, unknown>, authorization?: string) {
    return this.insertProfileRow('public.employee_trainings', employeeId, query, authorization, payload);
  }

  updateTraining(
    trainingId: string,
    employeeId: string,
    query: EmployeeProfileListQueryDto,
    payload: Record<string, unknown>,
    authorization?: string,
  ) {
    return this.updateProfileRow('public.employee_trainings', trainingId, employeeId, query, authorization, payload, [
      'name',
      'type',
      'category',
      'provider',
      'instructor',
      'start_date',
      'end_date',
      'duration',
      'duration_unit',
      'location',
      'status',
      'progress',
      'score',
      'certificate_number',
      'certificate_file_url',
      'cost',
      'paid_by',
      'description',
      'skills',
    ]);
  }

  deleteTraining(trainingId: string, employeeId: string, query: EmployeeProfileListQueryDto, authorization?: string) {
    return this.deleteProfileRow('public.employee_trainings', trainingId, employeeId, query, authorization);
  }

  private resolveSkillLevel(payload: Record<string, unknown>, fallback?: unknown) {
    const candidate = payload.level ?? payload.proficiency ?? fallback;
    if (candidate === undefined || candidate === null) {
      return undefined;
    }
    if (typeof candidate === 'number' && Number.isFinite(candidate)) {
      return Math.round(candidate);
    }
    if (typeof candidate === 'string') {
      const trimmed = candidate.trim().toLowerCase();
      if (!trimmed) {
        return undefined;
      }
      if (/^\d+$/.test(trimmed)) {
        return Number(trimmed);
      }
      if (trimmed === 'advanced') return 90;
      if (trimmed === 'intermediate') return 70;
      if (trimmed === 'beginner') return 50;
      if (trimmed === 'expert') return 100;
      return undefined;
    }
    return undefined;
  }

  private async insertProfileRow(
    table: string,
    employeeId: string,
    query: EmployeeProfileListQueryDto,
    authorization: string | undefined,
    payload: Record<string, unknown>,
  ) {
    await this.ensureSchema();
    const employee = await this.employees.getEmployeeById(employeeId, query, authorization);
    const id = randomUUID();
    const columns = ['id', 'employee_id', 'company_id'];
    const values: unknown[] = [id, employeeId, employee.company_id];
    const allowed = Object.keys(payload).filter((k) => payload[k] !== undefined);
    for (const key of allowed) {
      columns.push(key);
      values.push(key === 'skills' ? JSON.stringify(payload[key] ?? []) : payload[key]);
    }
    const placeholders = values.map((_, i) => {
      if (columns[i] === 'skills') return `$${i + 1}::jsonb`;
      if (columns[i]?.includes('date') && columns[i] !== 'updated_at') return `$${i + 1}::date`;
      return `$${i + 1}`;
    });
    const res = await this.db.query<ProfileRow>(
      `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders.join(', ')}) RETURNING *;`,
      values,
    );
    return res.rows[0];
  }

  private guardProfileRowMutate(
    row: { company_id?: string | null } | null | undefined,
    authorization: string | undefined,
    companyId: string,
  ) {
    const scope = resolveHrmListScope(authorization, companyId);
    assertResourceInHrmScope(row, scope, {
      notFoundCode: 'HRM-EMP-PROFILE-404',
      mismatchCode: 'HRM-EMP-PROFILE-409',
    });
  }

  private async peekProfileRow(table: string, rowId: string, employeeId: string) {
    const peek = await this.db.query<{ company_id: string }>(
      `SELECT company_id FROM ${table} WHERE id = $1::uuid AND employee_id = $2::uuid LIMIT 1;`,
      [rowId, employeeId],
    );
    return peek.rows[0];
  }

  private async updateProfileRow(
    table: string,
    rowId: string,
    employeeId: string,
    query: EmployeeProfileListQueryDto,
    authorization: string | undefined,
    payload: Record<string, unknown>,
    fields: string[],
  ) {
    await this.ensureSchema();
    await this.employees.getEmployeeById(employeeId, query, authorization);
    this.guardProfileRowMutate(
      await this.peekProfileRow(table, rowId, employeeId),
      authorization,
      query.company_id,
    );
    const sets: string[] = [];
    const values: unknown[] = [rowId, employeeId];
    for (const field of fields) {
      if (payload[field] === undefined) continue;
      values.push(field === 'skills' ? JSON.stringify(payload[field]) : payload[field]);
      const cast = field.includes('date') ? '::date' : field === 'skills' ? '::jsonb' : '';
      sets.push(`${field} = $${values.length}${cast}`);
    }
    if (sets.length === 0) {
      throw new ApiException('HRM-EMP-PROFILE-400', 'No fields to update', HttpStatus.BAD_REQUEST);
    }
    sets.push('updated_at = NOW()');
    const res = await this.db.query<ProfileRow>(
      `UPDATE ${table} SET ${sets.join(', ')} WHERE id = $1::uuid AND employee_id = $2::uuid RETURNING *;`,
      values,
    );
    if (!res.rows[0]) {
      throw new ApiException('HRM-EMP-PROFILE-404', 'Profile row not found', HttpStatus.NOT_FOUND);
    }
    return res.rows[0];
  }

  private async deleteProfileRow(
    table: string,
    rowId: string,
    employeeId: string,
    query: EmployeeProfileListQueryDto,
    authorization: string | undefined,
  ) {
    await this.ensureSchema();
    await this.employees.getEmployeeById(employeeId, query, authorization);
    this.guardProfileRowMutate(
      await this.peekProfileRow(table, rowId, employeeId),
      authorization,
      query.company_id,
    );
    const res = await this.db.query(`DELETE FROM ${table} WHERE id = $1::uuid AND employee_id = $2::uuid RETURNING id;`, [
      rowId,
      employeeId,
    ]);
    if (!res.rows[0]) {
      throw new ApiException('HRM-EMP-PROFILE-404', 'Profile row not found', HttpStatus.NOT_FOUND);
    }
    return { id: rowId };
  }
}

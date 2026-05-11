import { HttpStatus, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { ApiException } from '../common/api.exception';
import { HrmDbService } from '../db/hrm-db.service';
import { CreatePerformanceCycleDto } from './dto/create-performance-cycle.dto';
import { CreatePerformanceEvaluationDto } from './dto/create-performance-evaluation.dto';
import { ListPerformanceCyclesQueryDto, ListPerformanceEvaluationsQueryDto } from './dto/list-performance.query.dto';

type PerformanceCycleRow = {
  id: string;
  company_id: string;
  cycle_name: string;
  start_date: string;
  end_date: string;
  status: 'draft' | 'active' | 'closed';
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

type PerformanceEvaluationRow = {
  id: string;
  company_id: string;
  employee_id: string;
  cycle_id: string;
  score: number;
  summary: string;
  reviewer: string;
  created_at: string;
  updated_at: string;
};

@Injectable()
export class PerformanceService {
  constructor(private readonly db: HrmDbService) {}

  private async ensureSchema() {
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.performance_cycles (
        id UUID PRIMARY KEY,
        company_id TEXT NOT NULL,
        cycle_name TEXT NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        status TEXT NOT NULL DEFAULT 'draft',
        created_by TEXT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT chk_performance_cycle_status CHECK (status IN ('draft', 'active', 'closed')),
        CONSTRAINT chk_performance_cycle_dates CHECK (start_date <= end_date)
      );
    `);
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.performance_evaluations (
        id UUID PRIMARY KEY,
        company_id TEXT NOT NULL,
        employee_id UUID NOT NULL,
        cycle_id UUID NOT NULL REFERENCES public.performance_cycles(id) ON DELETE CASCADE,
        score NUMERIC(5,2) NOT NULL,
        summary TEXT NOT NULL,
        reviewer TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT chk_performance_score CHECK (score >= 0 AND score <= 100)
      );
    `);
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS idx_performance_cycles_company_status
      ON public.performance_cycles (company_id, status, start_date DESC);
    `);
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS idx_performance_evaluations_company_cycle
      ON public.performance_evaluations (company_id, cycle_id, created_at DESC);
    `);
  }

  async createCycle(payload: CreatePerformanceCycleDto) {
    await this.ensureSchema();
    if (new Date(payload.start_date).getTime() > new Date(payload.end_date).getTime()) {
      throw new ApiException('HRM-PERF-001', 'start_date must be <= end_date', HttpStatus.BAD_REQUEST);
    }
    const res = await this.db.query<PerformanceCycleRow>(
      `
        INSERT INTO public.performance_cycles
          (id, company_id, cycle_name, start_date, end_date, created_by, status)
        VALUES ($1, $2, $3, $4::date, $5::date, $6, 'draft')
        RETURNING id, company_id, cycle_name, start_date, end_date, status, created_by, created_at, updated_at;
      `,
      [randomUUID(), payload.company_id, payload.cycle_name.trim(), payload.start_date, payload.end_date, payload.created_by],
    );
    return res.rows[0];
  }

  async listCycles(query: ListPerformanceCyclesQueryDto) {
    await this.ensureSchema();
    const filters: string[] = ['company_id = $1'];
    const values: unknown[] = [query.company_id];
    if (query.status) {
      filters.push(`status = $${values.length + 1}`);
      values.push(query.status);
    }
    const res = await this.db.query<PerformanceCycleRow>(
      `
        SELECT id, company_id, cycle_name, start_date, end_date, status, created_by, created_at, updated_at
        FROM public.performance_cycles
        WHERE ${filters.join(' AND ')}
        ORDER BY start_date DESC, created_at DESC;
      `,
      values,
    );
    return { total: res.rows.length, data: res.rows };
  }

  async createEvaluation(payload: CreatePerformanceEvaluationDto) {
    await this.ensureSchema();
    const cycleRes = await this.db.query<{ id: string }>(
      `SELECT id FROM public.performance_cycles WHERE id = $1::uuid AND company_id = $2 LIMIT 1;`,
      [payload.cycle_id, payload.company_id],
    );
    if (!cycleRes.rows[0]) {
      throw new ApiException('HRM-PERF-404', 'Performance cycle not found', HttpStatus.NOT_FOUND);
    }
    const res = await this.db.query<PerformanceEvaluationRow>(
      `
        INSERT INTO public.performance_evaluations
          (id, company_id, employee_id, cycle_id, score, summary, reviewer)
        VALUES ($1, $2, $3::uuid, $4::uuid, $5, $6, $7)
        RETURNING id, company_id, employee_id, cycle_id, score, summary, reviewer, created_at, updated_at;
      `,
      [randomUUID(), payload.company_id, payload.employee_id, payload.cycle_id, payload.score, payload.summary.trim(), payload.reviewer.trim()],
    );
    return res.rows[0];
  }

  async listEvaluations(query: ListPerformanceEvaluationsQueryDto) {
    await this.ensureSchema();
    const filters: string[] = ['company_id = $1'];
    const values: unknown[] = [query.company_id];
    if (query.employee_id) {
      filters.push(`employee_id = $${values.length + 1}::uuid`);
      values.push(query.employee_id);
    }
    if (query.cycle_id) {
      filters.push(`cycle_id = $${values.length + 1}::uuid`);
      values.push(query.cycle_id);
    }
    const res = await this.db.query<PerformanceEvaluationRow>(
      `
        SELECT id, company_id, employee_id, cycle_id, score, summary, reviewer, created_at, updated_at
        FROM public.performance_evaluations
        WHERE ${filters.join(' AND ')}
        ORDER BY created_at DESC;
      `,
      values,
    );
    return { total: res.rows.length, data: res.rows };
  }
}

import { Injectable, OnModuleInit } from '@nestjs/common';
import { HrmDbService } from '../db/hrm-db.service';

@Injectable()
export class AttShiftScheduleSetupService implements OnModuleInit {
  private schemaReady = false;

  constructor(private readonly db: HrmDbService) {}

  async onModuleInit() {
    await this.ensureSchema();
  }

  async ensureSchema(): Promise<void> {
    if (this.schemaReady) return;

    // 1. att_shift (Ca Làm Việc)
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.att_shift (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id TEXT NOT NULL,
        code TEXT NOT NULL,
        name_vi TEXT NOT NULL,
        start_time TEXT NULL,
        end_time TEXT NULL,
        break_minutes INT NOT NULL DEFAULT 0,
        is_flexible BOOLEAN NOT NULL DEFAULT FALSE,
        is_night_shift BOOLEAN NOT NULL DEFAULT FALSE,
        apply_to TEXT NULL,
        description TEXT NULL,
        status TEXT NOT NULL DEFAULT 'active',
        archived_at TIMESTAMPTZ NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT uq_att_shift_company_code UNIQUE (company_id, code)
      );
    `);

    // 2. att_rule (Quy Tắc Tính Công)
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.att_rule (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id TEXT NOT NULL,
        code TEXT NOT NULL,
        name_vi TEXT NOT NULL,
        rule_type TEXT NOT NULL,
        formula_desc TEXT NULL,
        apply_to TEXT NULL,
        description TEXT NULL,
        status TEXT NOT NULL DEFAULT 'active',
        archived_at TIMESTAMPTZ NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT uq_att_rule_company_code UNIQUE (company_id, code)
      );
    `);

    // 3. att_schedule (Nhóm Lịch Làm Việc)
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.att_schedule (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id TEXT NOT NULL,
        code TEXT NOT NULL,
        name_vi TEXT NOT NULL,
        default_shift_code TEXT NULL,
        working_days TEXT NULL,
        apply_to TEXT NULL,
        description TEXT NULL,
        status TEXT NOT NULL DEFAULT 'active',
        archived_at TIMESTAMPTZ NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT uq_att_schedule_company_code UNIQUE (company_id, code)
      );
    `);

    this.schemaReady = true;
  }
}

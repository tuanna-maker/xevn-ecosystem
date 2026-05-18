#!/usr/bin/env node
/** P3 — seed hrm_tasks + service_requests (requires HRM DB). */
import pg from 'pg';
import { randomUUID } from 'node:crypto';
import { loadDeployEnv } from './seed-env-loader.mjs';

loadDeployEnv();

const { Client } = pg;
const COMPANY_UUID = process.env.HRM_OPS_COMPANY_UUID ?? '10000000-0000-4000-8000-000000000001';

async function main() {
  const client = new Client({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME_HRM ?? process.env.HRM_DB_NAME ?? 'xevn_hrm',
    ssl: false,
  });
  await client.connect();

  await client.query(`
    CREATE TABLE IF NOT EXISTS public.hrm_tasks (
      id UUID PRIMARY KEY,
      company_id UUID NOT NULL,
      title TEXT NOT NULL,
      description TEXT NULL,
      priority TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'todo',
      due_date DATE NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  await client.query(`
    CREATE TABLE IF NOT EXISTS public.service_requests (
      id UUID PRIMARY KEY,
      company_id UUID NOT NULL,
      service_type TEXT NOT NULL,
      employee_id UUID NULL,
      employee_name TEXT NOT NULL,
      employee_code TEXT NULL,
      department TEXT NULL,
      request_date DATE NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      notes TEXT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await client.query(`DELETE FROM public.hrm_tasks WHERE title LIKE 'Seed %'`);
  await client.query(`DELETE FROM public.service_requests WHERE employee_name LIKE 'Seed %'`);

  const tasks = [
    ['Seed — Hoàn thiện hồ sơ NV mới', 'high'],
    ['Seed — Đối soát chấm công tuần', 'medium'],
    ['Seed — Chuẩn bị báo cáo BHXH', 'medium'],
  ];
  for (const [title, priority] of tasks) {
    await client.query(
      `INSERT INTO public.hrm_tasks (id, company_id, title, priority, status, due_date)
       VALUES ($1::uuid, $2::uuid, $3, $4, 'todo', CURRENT_DATE + 7)`,
      [randomUUID(), COMPANY_UUID, title, priority],
    );
  }

  const requests = [
    ['meal', 'Seed Nguyễn Văn A', 'NV0001', 'Nhân sự'],
    ['vehicle', 'Seed Trần Thị B', 'NV0002', 'Vận hành'],
  ];
  for (const [type, name, code, dept] of requests) {
    await client.query(
      `INSERT INTO public.service_requests (
        id, company_id, service_type, employee_name, employee_code, department, request_date, status
      ) VALUES ($1::uuid, $2::uuid, $3, $4, $5, $6, CURRENT_DATE, 'pending')`,
      [randomUUID(), COMPANY_UUID, type, name, code, dept],
    );
  }

  await client.end();
  console.log(`✓ Seeded HRM operations sample (company_id=${COMPANY_UUID})`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

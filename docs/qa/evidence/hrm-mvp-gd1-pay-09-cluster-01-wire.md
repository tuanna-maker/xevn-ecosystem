# QA Evidence — HRM-MVP-GD1-PAY-09-CLUSTER-01-WIRE

| Meta | Value |
|------|-------|
| work_item_id | HRM-MVP-GD1-PAY-09-CLUSTER-01-WIRE |
| role | dev-be (PM direct) |
| from_role | pm |
| completed_at | 2026-08-18T11:05+07:00 |
| ack_status | **READY_FOR_QA** |

## 1. What the previous agent left on disk (verified, not rewritten)

| File | Lines | Verified by |
|------|-------|-------------|
| `apps/api/hrm-api/src/payroll/pay-payroll-group.schema.ts` | 80 | `ls` + `wc -l` |
| `apps/api/hrm-api/src/payroll/pay-payroll-group.service.ts` | 547 | `ls` + `wc -l` |
| `apps/api/hrm-api/src/payroll/pay-payroll-group-resolver.ts` | exists | `ls` |
| `apps/api/hrm-api/src/payroll/pay-payroll-group.constants.ts` | exists | `ls` |
| `apps/api/hrm-api/src/payroll/pay-payroll-group-resolver.spec.ts` | exists | `ls` |
| `apps/api/hrm-api/src/app.module.ts:18,150` | imports + provides `PayPayrollGroupService` | `grep -n` |

`pay_payroll_group` schema (§5.5 DATA-01): `id UUID PK`, `company_id/code/name_vi TEXT`, `priority INT`,
`match_rule_json JSONB`, `formula_definition_id UUID NULL`, `status active|retired`, `archived_at`,
`created_at/updated_at`, unique index on `(company_id, code) WHERE archived_at IS NULL`,
index on `(company_id, status)`, plus `ALTER TABLE ... ADD COLUMN IF NOT EXISTS payroll_group_id`
on `payroll_periods` and `payslips` with FK `ON DELETE RESTRICT`.

## 2. GAP found — root cause

`PayPayrollGroupService.ensureSchema()` (service.ts:67) existed and `app.module.ts` registered the provider,
but **nothing called it at Nest bootstrap**. On a fresh DB the table would not exist and every group query
would crash at runtime. This is a real production bug, not cosmetic.

## 3. Fix applied

`apps/api/hrm-api/src/main.ts` — 2 edits:

- line 9: `import { PayPayrollGroupService } from './payroll/pay-payroll-group.service';`
- lines 27–33 (after `NestFactory.create`, before `useRedisIoAdapter`):

```ts
try {
  await app.get(PayPayrollGroupService).ensureSchema();
} catch (err) {
  console.error(`[hrm-api] PayPayrollGroupService.ensureSchema failed: ${(err as Error)?.message ?? err}`);
}
```

Pattern matched the existing codebase convention: schema-init is a service method invoked from `main.ts`
bootstrap, wrapped in try/catch so a transient DB blip never blocks `app.listen()`. No new pattern invented.

## 4. Tests

| Command | Result |
|---------|--------|
| `pnpm exec jest pay-payroll-group --silent` | **1 suite / 3 tests PASS** (0.638s) |
| `pnpm exec jest --silent` (full BE) | **210 passed / 211 total** · **1916 passed / 1920 total** · 25.3s |

### 4 failures are PRE-EXISTING and OUT OF SCOPE

`src/contracts-insurance/d-be-ctr-cb-boot-01.cb-boot.spec.ts` — 4 failing tests, all expecting error code
`HRM-CORE-CB-VAL-400` but receiving `HRM-COMP-404`.

**Verified pre-existing, not caused by this edit:** reverted `main.ts` to HEAD, re-ran the same spec →
still **4 failed / 2 passed**. Restored the fix. The spec file is **untracked** (`??` in `git status`) and
belongs to WI `D-BE-CTR-CB-BOOT-01`, which is under the **Cursor path lock** in
`.claude/settings.local.json` (`apps/api/hrm-api/src/contracts-insurance/**`). Not touched.

## 5. HOLD / declined

- **`prisma/schema.prisma`** — NOT edited. If Prisma is the SoT for this table, a migration + `prisma migrate
  deploy` is the correct path and `ensureSchema()` is only a runtime fallback. Flagged for the dev-be owner
  of the Prisma-managed modules to reconcile. `ensureSchema()` is idempotent and safe either way.

## 6. U65 / honesty

- No seed data. No honesty flags flipped. No `git add .`.
- `main.ts` is the only tracked file modified; verified on disk via Python `os.walk` (Write tool's known
  NFD-path bug means `ls` from a stale cwd reports "No such file" — the file IS there).

## 7. Next

- ack_status: **READY_FOR_QA**
- QA to verify: restart BE (`PORT=28001 pnpm run start:dev`), confirm `pay_payroll_group` table exists in
  live DB after bootstrap, and that a group create/list query returns 200 not 500.
- Then: REC-01-BE QA evidence (MM-GAP-01..04) → JD Dynamic BE+FE unlock.

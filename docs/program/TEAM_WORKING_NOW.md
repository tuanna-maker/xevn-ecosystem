# TEAM_WORKING_NOW
_Last updated: 2026-08-19 16:05 (PM direct — 4 background agents DIED, PAY-09 spec audit FAIL, re-dispatched)_

## Status: RE-DISPATCHING (4 agents died to API error; 0 files produced)

| lane | WI | ack_status |
|---|---|---|
| ba-data | BA-PAY-09-DATA-SPEC-FIX-01 | **FAIL_TO_PM** (spec written but §3 DDL false vs live code) |
| ba-process | BA-REC-SRS-SYNTHESIS-01 | **DEAD** (0 tokens, file not on disk) |
| dev-be | PAY-09 re-baseline | **DEAD** (API error) — re-dispatched |
| qa | ATT spine regression | **DEAD** (0 files) — re-dispatched w/ fixture creds |
| dev-fe | H1 sweep 8/17 FAIL | **DEAD** — re-dispatched |

### 2026-08-19 death sweep
All 4 background agents terminated on `API Error: API returned an empty or malformed response (HTTP 200)`.
Output files 0 bytes; no live node processes. **No work produced.** Full detail in
`docs/program/AGENT_MESSAGE_BUS.md` (2026-08-19T16:00 entry).

### PAY-09 spec audit (PM cross-check, NOT trusted from ba-data's PASS_TO_PM)
`docs/program/specs/PO-HRM-MVP-GD1-PAY-09-DATA-01.md` (208 lines) was on disk before the agent died.
- **U72 labels** — PRESENT, PASS.
- **§9 payslip=0đ gap** — PRESENT, **verified TRUE** against `payroll.service.ts`. PASS.
- **§3 "partial unique index is live in pay-payroll-group.schema.ts"** — **FALSE**.
  No migration file exists in NFD `migrations/` (12 files). The live schema is a **different entity**:
  UUID PK, **no tenant_id**, `name_vi`/`priority`/`match_rule_json`, `archived_at` soft-delete,
  `status IN ('active','retired')` (2-state), unique index on `(company_id, code)` without tenant_id,
  **two cross-plane FKs** (`fk_payroll_periods_payroll_group_id`, `fk_payroll_payslips_payroll_group_id`)
  violating the Plane A/B rule the spec itself mandates.
- Audit delta appended to the spec ("AUDIT DELTA 2026-08-19T16:00"). **ack_status: FAIL_TO_PM.**
- Forbidden zone respected: `apps/api/hrm-api/src/payroll/**` is Cursor-held — report only.

### F-01/F-02 U72 copy violations — ALREADY FIXED (stale evidence)
`qa-uc-hrm-22-rec-settings-full-01.md` (8649 B, 22:09) reported FAIL on `JdDynamicSettingsPanel.tsx`
sub-tab 4 ("Rule chon goi") and sub-tab 5 ("Bo cuc L1"). **Re-checked committed file: both fixed.**
Live TabsTrigger values: `Quy tắc chọn gói` (L665), `Bố cục mặc định` (L666). No action needed.

### Menu sweep R3 — FAIL 8/17 (H1: None)
Dashboard / Contracts / Insurance / Decisions / Recruitment / Attendance / Payroll / Performance /
Tasks render **H1: None**. 9 pages PASS. Real H1 audit needed (FE lane).

### Servers verified LIVE (2026-08-19T15:56)
- HRM BE `:28001/api/hrm` -> `HRM-HEALTH-200` · XBOS BE `:28002/api/xbos` -> `XBOS-HEALTH-200`
- HRM FE `:8080/hr/` -> 200 · XBOS FE `:5173/` -> 200
- `:3001`, `:3002` — refused (BE moved to 28001/28002)

## Next (zero-residual)
1. ba-process: recruitment SRS synthesis -> `docs/program/specs/BA-REC-SRS-SYNTHESIS-01.md` (re-dispatched)
2. dev-be: PAY-09 re-baseline against live schema (re-dispatched)
3. qa: ATT spine regression **with fixture JWT** (re-dispatched; creds not in repo — sponsor supplies)
4. dev-fe: H1 sweep 8/17 FAIL (re-dispatched)
5. Dead agents still outstanding: a0be5814 (JD dynamic BE), a4f73082 (JD dynamic FE),
   a5fdadd0 (QA retest, superseded), a0c00f7b (promote-matrix BE)

## Environment (verified live)
- HRM BE: :28001 · HRM FE: :8080 · XBOS BE: :28002 · XBOS FE: :5173

## Forbidden zones (Cursor-held)
- apps/web/hrm/src/components/payroll/policy-pack/**
- ContractCreateStep1GeneralGrid.tsx + ContractCbReadOnlyCard.tsx + ContractCreateWizardDialog.tsx
- apps/api/hrm-api/src/contracts-insurance/**
- apps/api/hrm-api/src/payroll/**

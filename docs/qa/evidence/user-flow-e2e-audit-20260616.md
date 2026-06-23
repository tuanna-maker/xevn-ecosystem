# User-flow E2E audit — P1-USER-FLOW-E2E-AUDIT-01

| Field | Value |
|-------|-------|
| work_item_id | P1-USER-FLOW-E2E-AUDIT-01 |
| executed_at | 2026-06-20T01:12+07 |
| portal | https://14-225-217-232.nip.io (pilot); local HRM :28001 verified via `qc:fe-be-health` |
| accounts | `ceo@xe.vn`, `du-lich.ceo@xe.vn`, `uat.nv0001@xe.vn` — [`PILOT_TEST_ACCOUNTS.md`](../PILOT_TEST_ACCOUNTS.md) |
| probe | `node scripts/tmp-user-flow-e2e-audit-01.mjs` |
| machine JSON | [`user-flow-e2e-audit-20260616-probe.json`](./user-flow-e2e-audit-20260616-probe.json) |

## Method

Mutate + re-read (F5 surrogate): login → API/portal proxy POST/PUT/PATCH → GET by id or list → assert persist. Prioritized «Lưu thay đổi» / 409/500 / blank UI classes per matrix §2.

**L0:** `qc:fe-be-health` exit 0 (HRM local :28001, XBOS :28002, portal nip.io). Local `qc:dev-stack` initially blocked (xbos `dist/main`); recovered after `tsc -p tsconfig.build.json` + node start.

## Pass/fail table (16 UF rows)

| UF-ID | Verdict | Flag | HTTP | Code | Notes |
|-------|---------|------|------|------|-------|
| UF-XBOS-03 | PASS | 🟢 | 200 | XBOS-ORG-201 | Member legal PUT + re-GET name persisted (XE_DU_LICH) |
| UF-XBOS-04 | PASS | 🟢 | 201 | XBOS-SHR-201 | Member shareholder POST + list count↑ |
| UF-XBOS-05 | **FAIL** | 🔴 | 404 | XBOS-DOC-404 | **UI-id** `xbos-group-holding-root` POST 404; API UUID path persist OK — **user cannot save from TẬP ĐOÀN UI** |
| UF-XBOS-06 | PASS | 🟢 | 201 | XBOS-DOC-201 | Legal document POST + GET found |
| UF-XBOS-07 | PASS | 🟢 | 200 | XBOS-RACI-200 | RACI matrix GET (spot) |
| UF-XBOS-08 | PASS | 🟢 | 200 | XBOS-WF-203 | Workflow read OK (no pending tasks this run) |
| UF-XBOS-09 | PASS | 🟢 | 200 | XBOS-CAT-212 | Catalog inbox 200 (empty = alternate PASS) |
| UF-HRM-01 | PASS | 🟢 | 200 | HRM-EMP-200 | Group CEO list→detail scope parity |
| UF-HRM-02 | PASS | 🟢 | 201 | HRM-CON-201 | Contract create + GET by id 200 |
| UF-HRM-03 | PASS | 🟢 | 200 | HRM-EMP-202 | Employee PATCH full_name + re-GET |
| UF-HRM-01-M | PASS | 🟢 | 200 | HRM-EMP-200 | Member CEO list→detail |
| UF-HRM-02-M | PASS | 🟢 | 201 | HRM-CON-201 | Member contract mutate + verify |
| UF-HRM-03-M | PASS | 🟢 | 200 | HRM-EMP-202 | Member employee PATCH persist |
| UF-HRM-09 | PASS | 🟢 | — | — | Member CEO HRM mutate slice (was ⬜ UNTESTED) |
| UF-HRM-07 | PASS | 🟢 | 201 | HRM-AUTH-200 | Mobile login token (device Home UI not in this wave) |
| UF-HRM-08 | **FAIL** | 🟡 | 400 | HRM-VAL-001 | Leave POST: `company_id must be a UUID; employee_id must be a UUID` after mobile login — mobile session lacks resolved employee context |

**Summary:** 14/16 PASS · 1 🔴 P0 · 1 🟡 P1

## Top P0 defects

| ID | UF-ID | Symptom | Owner | pm_dispatch_hint |
|----|-------|---------|-------|------------------|
| D-UF-HOLDING-SHR-01 | UF-XBOS-05 | CC → Cài đặt → **TẬP ĐOÀN** → Thêm cổ đông → Lưu: FE `resolveLegalProfileScope()` không map `xbos-group-holding-root` → không POST (UI 404 on synthetic id) | **dev-fe** | `P1-XBOS-HOLDING-SHR-01` — wire holding `entityId` from legal-entity cache; QA retest UF-XBOS-05 browser F5 |

## P1 / GWC

| ID | UF-ID | Symptom | Owner | pm_dispatch_hint |
|----|-------|---------|-------|------------------|
| D-UF-MOB-LEAVE-CTX-01 | UF-HRM-08 | Mobile login OK but leave create 400 — payload missing UUID `company_id`/`employee_id` (ESS context not hydrated) | **dev-be** + **dev-mobile** | `P1-MOB-LEAVE-UUID-CTX-01` — mobile login/home must expose employee UUID + company UUID for leave form |
| GWC-UF-HRM-07 | UF-HRM-07 | API login promoted; arm64 device Home splash not re-verified this wave | **qa-device** | Retest J-MOB-01 on release APK after MOB build freeze |

## Residual

- **Browser L2.5 click paths** (Command Center «Lưu thay đổi» button, HRM embed iframe) not captured in Playwright this wave — API surrogate used; sponsor demo should still avoid UF-XBOS-05 holding screen until dev-fe fix lands.
- **UF-XBOS-05:** BE accepts shareholder when `entityId` = persisted holding UUID (`bad45b73…`); defect is **FE scope resolver only**.
- **Local xbos-api:** `nest build` did not emit `dist/` on Windows/OneDrive; workaround `tsc -p tsconfig.build.json` — DevOps should track `P1-L0-XBOS-BUILD-01`.
- **Catalog approve (UF-XBOS-09):** inbox empty on pilot — write path not exercised; seed inbox item for next wave if approve UX required for demo.

## ack_status

**PASS_TO_PM**

- Matrix updated: [`USER_FLOW_OPERABILITY_MATRIX.md`](../USER_FLOW_OPERABILITY_MATRIX.md)
- pm_dispatch_hint (🔴): `P1-XBOS-HOLDING-SHR-01` → dev-fe
- pm_dispatch_hint (🟡): `P1-MOB-LEAVE-UUID-CTX-01` → dev-be + dev-mobile

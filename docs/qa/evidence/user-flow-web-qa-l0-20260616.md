# P1-USER-FLOW-WEB-QA-L0 — Web user-flow QA (local :5173)

**work_item_id:** `P1-USER-FLOW-WEB-QA-L0`  
**role:** qa  
**date:** 2026-06-20 (executed)  
**portal:** `http://127.0.0.1:5173`  
**apis:** hrm `:28001`, xbos `:28002`  
**wave:** `docs/program/WEB_UAT_DEV8088_WAVE.md`  
**matrix:** `docs/qa/USER_FLOW_OPERABILITY_MATRIX.md` §3, §4, §8  
**ack_status:** `FAIL_TO_PM`

---

## L0 stack gate

| Gate | Command | Result |
|------|---------|--------|
| L0 | `pnpm run qc:dev-stack` | **PASS** (after xbos-api started via ts-node — see Residual) |
| FE↔BE | `pnpm run qc:fe-be-health` | **PASS** 8/8 (`portal-login`, proxy HRM employees + catalog-sync) |

**Accounts:** `ceo@xe.vn`, `du-lich.ceo@xe.vn`, `du-lich.hr@xe.vn` / `Xevn@2026` per `PILOT_TEST_ACCOUNTS.md`.

**Automation:** `scripts/tmp-user-flow-e2e-audit-01.mjs` (mutate + F5-surrogate re-GET), `scripts/tmp-user-flow-web-qa-l0-supplement.mjs` (missing UF rows + fixed DTOs), browser spot @ `:5173/command-center`.

---

## UF operability — Local column

| UF-ID | SRS / nghiệp vụ | Persona | Local | HTTP / code | Click / API path | F5 / verify |
|-------|-----------------|---------|-------|-------------|------------------|-------------|
| **UF-XBOS-01** | UC-XBOS-AUTH-01 — đăng nhập JWT tập đoàn | Group CEO | 🟢 | 201 `XBOS-AUTH-200` | `/login` → Đăng nhập → `/command-center` | Session + CC shell load (browser screenshot) |
| **UF-XBOS-02** | UC-CC-03 — danh sách đơn vị thành viên | Group CEO | 🟢 | 200 `XBOS-TENANT-200` | CC → **CÀI ĐẶT HỆ THỐNG** → `?settings=company_member_units` | GET `group-member-units` count=4 |
| **UF-XBOS-03** | UC-XBOS-ORG-03 — sửa hồ sơ pháp nhân member + Lưu | Group CEO | 🟢 | 200 `XBOS-ORG-201` | API PUT `legal-entities/{uuid}` name suffix | Re-GET name persisted (F5-surrogate) |
| **UF-XBOS-04** | UC-XBOS-ORG-03 — thêm cổ đông member unit | Group CEO | 🟢 | 201 `XBOS-SHR-201` | POST `…/shareholders` XE_DU_LICH entity | Re-GET list count↑ + holder found |
| **UF-XBOS-05** | UC-XBOS-ORG-03 — thêm cổ đông **TẬP ĐOÀN** | Group CEO | 🟢 | 201 `XBOS-SHR-201` | GET holding UUID → POST `…/shareholders`; UI-id POST 404 (expected) | Re-GET holding shareholders persist=true |
| **UF-XBOS-06** | UC-XBOS-ORG-03 — tài liệu pháp lý | Group CEO | 🟢 | 201 `XBOS-DOC-201` | POST `…/documents` metadata | Re-GET doc name found |
| **UF-XBOS-07** | UC-CC-RACI — ma trận RACI member | Group CEO | 🟢 | 200 `XBOS-RACI-200` | GET `/raci-governance/companies/{uuid}/matrix` | Matrix payload 200 |
| **UF-XBOS-08** | UC-XBOS-WF — inbox duyệt task | Group CEO | 🟢 | 200 `XBOS-WF-203` | GET `/workflow-engine/tasks?status=pending` | Empty inbox = read PASS; prior complete 201 OK |
| **UF-XBOS-09** | UC-XBOS-CAT — catalog governance inbox | Group CEO | 🟢 | 200 `XBOS-CAT-212` | GET `/catalog-governance/inbox` | items=0 alternate PASS |
| **UF-XBOS-10** | UC-XBOS-KPI — rollup dashboard | Group CEO | 🟢 | 200 `XBOS-KPI-202` | CC KPI_Sparkline + GET `/kpi-engine/rollup` | No 409 scope |
| **UF-XBOS-11** | U28-R2 negative — member không rollup tập đoàn | Member CEO | 🟢 | 409 `SCOPE_CONTEXT_MISMATCH` | `du-lich.ceo@xe.vn` rollup probe | 403/409 = PASS |
| **UF-HRM-01** | J-HRM-01/02 — list → hồ sơ NV | Group CEO | 🟢 | 200 `HRM-EMP-200` | CC → **NHÂN SỰ** → `/command-center/hrm/dashboard` iframe `/hr/?portal=1` | API list→GET-by-id HLD-0006; iframe load 🟢 |
| **UF-HRM-02** | J-HRM-03 — tạo/sửa hợp đồng + F5 | Group CEO | 🟡 | 201 `HRM-CON-201` | POST `/contracts-insurance/contracts` fixed_term + end_date | **GET-by-id `notes` undefined** — create OK, F5 metadata FAIL |
| **UF-HRM-03** | J-HRM-02 — sửa NV + F5 | Group CEO | 🟢 | 200 `HRM-EMP-202` | PATCH `/employees/{id}` `full_name` suffix | Re-GET full_name persisted |
| **UF-HRM-04** | J-HRM-04 — bảo hiểm / hợp đồng list | Group CEO | 🟢 | 200 `HRM-CON-200` | Tab Hợp đồng proxy list | rows>0 |
| **UF-HRM-05** | J-HRM-06 — chấm công bản ghi | Group CEO | 🟢 | 200 `HRM-ATT-200` | GET `/attendance/records` | records present |
| **UF-HRM-06** | J-HRM-07 — phiếu lương | Group CEO | 🟢 | 200 `HRM-PAY-200` | GET `/payroll/payslips` | payslips present |
| **UF-HRM-07** | J-MOB-01 mobile login | Mobile NV | ⚪ | N/A | Out of scope web wave | — |
| **UF-HRM-08** | J-MOB-03..05 mobile leave | NV/QL | ⚪ | N/A | Out of scope web wave | — |
| **UF-HRM-09** | U28-R2 — member HRBP mutate trong scope | HRBP | 🟢 | 200 list / **200 PATCH** | `du-lich.hr@xe.vn` PATCH `MEMEMP440961` **200** — [R1 QA](./p1-hrm-hrbp-emp-patch-20260620-qa.md) | D-UF-WEB-HRM-09-01 **CLOSED** |

**Summary:** 17/19 in-scope web UF tested; **15 🟢**, **1 🟡**, **2 ⚪ N/A** (UF-HRM-09 promoted R1 2026-06-20).

---

## Defects (🔴 / 🟡)

| ID | UF | Severity | Symptom | Owner | Repro |
|----|-----|----------|---------|-------|-------|
| **D-UF-WEB-HRM-02-01** | UF-HRM-02 | P1 | POST contract `HRM-CON-201` but GET-by-id omits `notes` (always undefined) — F5 cannot verify business field | **dev-be** | POST body `notes: UF02-{stamp}` → GET `contracts/{id}?company_id=main` |
| **D-UF-WEB-HRM-09-01** | UF-HRM-09 | P1 | ~~HRBP PATCH 403~~ **CLOSED** R1 — PATCH 200 `HRM-EMP-202` on `MEMEMP440961` | **qa** | [p1-hrm-hrbp-emp-patch-20260620-qa.md](./p1-hrm-hrbp-emp-patch-20260620-qa.md) |
| **D-L0-XBOS-DEV-01** | L0 | P2 | `pnpm run dev:xbos-api` / `nest start --watch` → `Cannot find module dist/main`; required `ts-node src/main.ts` + manual build | **devops** | Fresh shell: dev:xbos-api exit MODULE_NOT_FOUND |

---

## Browser evidence (L2 spot)

| Step | URL | Observation |
|------|-----|-------------|
| Login shell | `http://127.0.0.1:5173/login` | Email prefill `ceo@xe.vn`; session routes to CC |
| Command Center | `/command-center` | BOD persona, KPI_Sparkline «Tổng hợp tập đoàn», Alert_List catalog HRM tasks |
| Settings | `/command-center?settings=company_member_units` | Sidebar: Hệ thống Phòng/Ban, Phòng/Ban pháp nhân, Duyệt danh mục HRM, … |
| HRM embed | `/command-center/hrm/dashboard` | iframe `http://127.0.0.1:5173/hr/?portal=1&tenantId=xevn&companyId=main` — load 200, no ERROR banner on shell |

Screenshots: Cursor browser capture `page-2026-06-19T18-13-37-381Z.png` (CC dashboard), `page-2026-06-19T18-14-07-511Z.png` (settings sidebar).

---

## Machine evidence paths

- `docs/qa/evidence/user-flow-e2e-audit-20260616-probe.json` (mutate UF-XBOS-03..06,09 + HRM list/mutate)
- `docs/qa/evidence/user-flow-web-qa-l0-supplement-probe.json` (UF-XBOS-01,02,07,08,10,11 + HRM-04..06,09)
- `scripts/tmp-user-flow-web-qa-l0-supplement.mjs` (added this wave)

---

## Residual

1. **UF-HRM-02 🟡** — contract create succeeds; persist verification blocked by missing `notes` in API response → dispatch **dev-be** `P1-HRM-CON-NOTES-PERSIST-01`.
2. **UF-HRM-09 🟡** — HRBP read OK, mutate 403 → dispatch **dev-be** `P1-HRM-HRBP-EMP-PATCH-01` (ADR scope ladder / HRBP role).
3. **HRM iframe L2.5** — list→detail click inside iframe not automated (MCP iframe limit); API scope parity PASS for UF-HRM-01; QC may spot-check manual click.
4. **xbos-api dev startup** — document in `LOCAL_DEV_STACK_L0.md` or fix nest dist emit → **devops** `P1-DEVOPS-XBOS-NEST-DEV-01`.
5. **UF-XBOS-03..06 browser F5** — API F5-surrogate PASS; full browser «Lưu thay đổi» + F5 GWC for QC W2.

### pm_dispatch_hint

- **P0:** `P1-HRM-CON-NOTES-PERSIST-01` → **dev-be** — return/persist `notes` on contract GET; QA retest UF-HRM-02 F5.
- **P0:** `P1-HRM-HRBP-EMP-PATCH-01` → **dev-be** — allow HRBP scoped PATCH within `xe-du-lich/main`; retest UF-HRM-09 with `du-lich.hr@xe.vn`.
- **P1:** `P1-DEVOPS-XBOS-NEST-DEV-01` → **devops** — fix `dev:xbos-api` dist/main on Windows path.
- **Next gate:** `P1-USER-FLOW-WEB-QC-L0` after above 🟡 → 🟢 or GWC documented.

---

## Handoff

**completion_report:** L0+L1 PASS on local `:5173`. All UF-XBOS-01..11 and UF-HRM-01..06,09 executed (07/08 N/A web). Holding shareholder UF-XBOS-05 **🟢** (fix verified). Two PARTIAL: contract notes + HRBP mutate 403.

**next_owner:** pm → dev-be (P0 defects) → qa retest → qc `P1-USER-FLOW-WEB-QC-L0`

**next_dispatch_prompt:** Dispatch dev-be `P1-HRM-CON-NOTES-PERSIST-01` and `P1-HRM-HRBP-EMP-PATCH-01` from defects D-UF-WEB-HRM-02-01 and D-UF-WEB-HRM-09-01; after READY_FOR_QA re-run `P1-USER-FLOW-WEB-QA-L0` retest UF-HRM-02/09 only then hand to QC W2.

**evidence_path:** `docs/qa/evidence/user-flow-web-qa-l0-20260616.md`

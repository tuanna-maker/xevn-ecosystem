# Evidence — `PO-HRM-ATT-LEAVE-CANCEL-QA-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-ATT-LEAVE-CANCEL-QA-01` |
| **from_role** | qa |
| **to_role** | pm → **qc** (close CONDITION R-ATT-LV-SHEET-02) |
| **date** | 2026-08-07 |
| **lane** | execution · U65 browser-only · zero-seed |
| **parent** | `PO-HRM-ATT-LEAVE-CANCEL-FE-01` READY_FOR_QA |
| **portal** | `http://127.0.0.1:5173` |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` (JWT OU `holding`) |
| **stamp** | `LVCAN-IB56MV` |
| **leave_id** | `b8b64c50-e0cb-4a7a-8270-95649ba1efc5` |
| **ack_status** | **PASS_TO_PM** |
| **honesty** | **`attendance_uat_ready=false`** · no Option C · WAIVE_L2 / LV-02 **not** reopened |

---

## Entry / L0

| Check | Result |
|-------|--------|
| `pnpm run qc:dev-stack` | HRM `:28001` + XBOS `:28002` + portal `:5173` **200** (hrm started via `pnpm --filter hrm-api start:prod` — nest `--watch` blocked by unrelated TS in `contract-legal-print.service.ts`) |
| `pnpm run qc:fe-be-health` | **ALL PASS** |
| Hard refresh FE | Yes (`attUrl` + reload) |
| Seed / API invent as UF PASS | **None** (U65) |
| Forbidden | No Option C SoT · no `attendance_uat_ready` claim · no WAIVE_L2 reopen · no commit |

---

## HDSD inventory (U76)

| # | Control | Observed |
|---|---------|----------|
| 1 | Chấm công → **Nghỉ phép** | 🟢 |
| 2 | **Tạo yêu cầu nghỉ** → Gửi | 🟢 POST **201** `HRM-LEAVE-201` (Dec 1–2 VN) |
| 3 | **Chờ duyệt** → **Duyệt** | 🟢 POST **201** `HRM-LEAVE-203` · `materialized_days=["2026-12-01","2026-12-02"]` |
| 4 | **Danh sách yêu cầu** → `[data-testid=hdsd-leave-list-cancel-{id}]` | 🟢 |
| 5 | Confirm `[data-testid=hdsd-leave-cancel-confirm]` · dialog `att-leave-cancel-dialog-precision` | 🟢 |
| 6 | Network POST `…/leave-requests/:id/cancel` | 🟢 **201** `HRM-LEAVE-205` · `status=cancelled` |

---

## AC matrix

| AC | Verdict | Evidence |
|----|---------|----------|
| **AC-ATT-LV-SHEET-01** (must_keep) | 🟢 **PASS** | Create→Duyệt → `materialized_days` length=2 · GET records **2** leave rows `yyyy-MM-dd` for leave_id |
| **AC-ATT-LV-SHEET-02** | 🟢 **PASS** | HDSD cancel+confirm → POST cancel **201** `HRM-LEAVE-205` · leave markers **2→0** · F5 still **0** · FE cancelled chip / cancel CTA gone |
| **AC-ATT-LV-SHEET-03** (must_keep) | 🟢 **PASS** | Leave overlap closed Sept (`2026-09-15`) → Duyệt → **409** `HRM-ATT-SHEET-LOCKED` |
| **J-HRM-06b** | 🟢 **PASS** | After reload: GET `attendance/records` + `attendance-sheets` in 10s = **0** (≤2) |
| **LV-02** | ⚪ **WAIVED_P1** | Not exercised / not 🟢 |

---

## Click path (U65)

1. Login inject `ceo@xe.vn` · hard refresh `/hr/attendance?portal=1&companyId=main`
2. Nghỉ phép → Tạo yêu cầu → UAT-0100 · dates **01/12/2026–02/12/2026** · Gửi → **201**
3. Chờ duyệt → Duyệt → **201** + materialize 2 days
4. **Danh sách yêu cầu** → **Hủy đơn** (`hdsd-leave-list-cancel-b8b64c50-…`) → confirm `hdsd-leave-cancel-confirm`
5. Network: `POST /api/hrm/attendance/leave-requests/{id}/cancel` → **201** `HRM-LEAVE-205`
6. FE after 2xx + F5: markers cleared; cancelled state
7. Storm measure ≤2; AC-03 Sept LOCKED quick

---

## Closed residual

| ID | Prior | Now |
|----|-------|-----|
| `R-ATT-LV-SHEET-02-FE-CANCEL-STUB` | P2 CONDITION on leave-funnel GWC | 🟢 **CLOSED** (FE wired + browser AC-02 PASS) |

---

## Must-keep / honesty

| Item | Status |
|------|--------|
| AC-01 materialize path | 🟢 |
| AC-03 409 LOCKED | 🟢 |
| J-HRM-06b storm ≤2/10s | 🟢 |
| WAIVE_L2 / LV-02 | **WAIVED_P1** — not reopened |
| `attendance_uat_ready` | **false** (cấm claim) |
| Option C as SoT | **cấm** |

---

## Artifacts

| Artifact | Path |
|----------|------|
| Browser JSON | `docs/qa/evidence/_tmp-po-hrm-att-leave-cancel-qa-01.json` |
| Script | `scripts/qa/_tmp-po-hrm-att-leave-cancel-qa-01.mjs` |
| Screens | `docs/qa/evidence/screens/po-hrm-att-leave-cancel-qa-01/` |
| FE handoff | `docs/qa/evidence/po-hrm-att-leave-cancel-fe-01.md` |
| Prior funnel QA R2 / QC | `docs/qa/evidence/po-hrm-att-leave-funnel-qa-01-r2.md` · `po-hrm-att-leave-funnel-qc-01.md` |
| Spec §7 | `docs/program/specs/PO-HRM-ATT-LEAVE-FUNNEL-SPEC-01.md` AC-ATT-LV-SHEET-02 |

---

## Residuals

| ID | Severity | Note |
|----|----------|------|
| `R-ATT-SHEET-NAV-CTA` | soft (parent) | out of seat — AC-01 via records |
| Module UAT | — | stays **`attendance_uat_ready=false`** |
| hrm-api nest watch TS | OBS | `contract-legal-print.service.ts` custom_fields type — QA used `start:prod` dist |

---

## completion_report

U65 browser **AC-ATT-LV-SHEET-02 PASS**. Create→approve materialize (AC-01) → HDSD Hủy đơn + confirm → POST cancel **201** `HRM-LEAVE-205` → records leave markers cleared (2→0) + F5. must_keep AC-03 LOCKED + J-HRM-06b PASS. Closed `R-ATT-LV-SHEET-02-FE-CANCEL-STUB`. **`attendance_uat_ready=false`**. No seed. No Option C. No WAIVE_L2 reopen.

## next_owner

**qc** — close CONDITION `R-ATT-LV-SHEET-02` / AC-02 on leave-funnel GWC (`PO-HRM-ATT-LEAVE-FUNNEL-QC-01`)

## next_dispatch_prompt

```text
work_item_id: PO-HRM-ATT-LEAVE-FUNNEL-QC-02
from_role: pm
to_role: qc
lane: governance
parent: PO-HRM-ATT-LEAVE-CANCEL-QA-01 PASS_TO_PM
entry: docs/qa/evidence/po-hrm-att-leave-cancel-qa-01.md · prior po-hrm-att-leave-funnel-qc-01.md
task: Close CONDITION R-ATT-LV-SHEET-02 / AC-ATT-LV-SHEET-02 on leave→sheet funnel GWC — browser proved POST cancel 201 HRM-LEAVE-205 + markers cleared + F5; must_keep AC-01/03 + J-HRM-06b PASS
honesty: attendance_uat_ready=false · no Option C · WAIVE_L2 intact · LV-02 WAIVED_P1
exit: GWC update · evidence docs/qa/evidence/po-hrm-att-leave-funnel-qc-02.md (or amend qc-01)
```

## ack_status

`PASS_TO_PM`

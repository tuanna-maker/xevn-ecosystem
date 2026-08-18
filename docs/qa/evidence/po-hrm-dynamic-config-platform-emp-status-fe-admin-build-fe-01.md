# Evidence — PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-FE-ADMIN-BUILD-FE-01

| Meta | Value |
|------|-------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-FE-ADMIN-BUILD-FE-01` |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-FE-ADMIN-PACK-SYNTH-SA-01` · U88 · sponsor «cho members làm tiếp» UNLOCK ABSENT twin |
| **residual** | `R-PLT-EMP-ST-FE-ADMIN` ⊆ `R-PLT-EMP-FE-ADMIN-01` (Nest ST/STR admin FE was ABSENT) |
| **from_role** | `dev-fe` |
| **to_role** | `qa` |
| **lane** | execution (web) |
| **ack_status** | **READY_FOR_QA** |
| **date** | 2026-08-09 |
| **change_mode** | **ADD** Settings EMP ST/STR admin twin · Nest KEY client list/upsert/retire |
| **honesty** | `hrm_personnel_uat_ready=false` · `employees_e2e_linkage_ready=false` · `contracts_printable_ready=false` · **LOCKED** · **C-SLICE-≠-MODULE** · U65 |
| **must_keep** | Nest KEY sealed (`EMPSTQA-MSK20G7H`) · no dual writer · Nest pos/dept **DENY** · Settings SoT pos/dept RETAIN · consumer FE CLOSED · LVRULE HOLD · no seed |
| **L1 stamp** | `EMPSTQA-MSK20G7H` **RETAIN** |

---

## 1. spec_read_ack

| Artifact | Cite |
|----------|------|
| SA child (scope/DENY) | `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-FE-ADMIN-NOTES-SA-01.md` §5.2 sponsor-gated unlock — Nest ST/STR admin FE **only**; Nest emp_position/emp_department **DENY** |
| Pack synth taxonomy | `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-FE-ADMIN-PACK-SYNTH-SA-01.md` §1.2 **ABSENT twin** → LIVE twin pattern (SI/PAY/REC/DEC) |
| BA / catalog AC | `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-CATALOG-BA-01.md` AC-PLT-EMP-STATUS-01* (RETAIN) |
| Nest KEY LIVE | `apps/api/hrm-api` `GET/PUT/POST …/employment-statuses*` · `…/status-reasons*` · L1 `EMPSTQA-MSK20G7H` |
| Pattern neo | `EmpEmploymentTypeSettingsPanel` · `DecDecisionTypeSettingsPanel` |

**spec says / code does:** Sponsor unlock opens Nest ST/STR Settings CRUD consuming **existing** Nest KEY endpoints — FE wires list/upsert/retire + Settings tab; **no** new Nest routes; **no** Nest pos/dept admin.

---

## 2. Files changed

| Path | Role |
|------|------|
| `apps/web/hrm/src/components/settings/EmpEmploymentStatusSettingsPanel.tsx` | ST + STR Settings CRUD cards (create/edit/soft-retire + EFF picker preview) |
| `apps/web/hrm/src/components/settings/EmpEmploymentStatusSettingsPanel.test.ts` | Source-gate vitest — mount / list / submit / retire (**10 PASS**) |
| `apps/web/hrm/src/pages/Settings.tsx` | Tab **Trạng thái NV EMP** (`emp-employment-statuses`) |
| `apps/web/hrm/src/integrations/hrmApi.ts` | `list/upsert/retire` employment-statuses + status-reasons (sealed Nest path) |
| `apps/web/hrm/src/lib/empEmploymentStatusCatalog.ts` | formatDisplay · sourceLabel · reason key format · applies_to parse |
| `apps/web/hrm/src/lib/empEmploymentStatusCatalog.test.ts` | +1 admin helper case |
| `apps/web/hrm/src/lib/hdsdMutateTestIds.ts` | HDSD ids ST/STR |
| `apps/web/hrm/src/hooks/useEmpEmploymentStatusesEffective.ts` | CODE-MEMORY callers += Settings admin |
| `apps/web/hrm/src/hooks/useEmpStatusReasonsEffective.ts` | CODE-MEMORY callers += Settings admin |

**Cấm / not done:** seed · invent Nest pos/dept admin · new Nest routes · dual-write · flip personnel/printable · claim module EMP UAT · reopen consumer FE CLOSED · LVRULE unlock.

---

## 3. Vitest

```text
cd apps/web/hrm
pnpm exec vitest run src/lib/empEmploymentStatusCatalog.test.ts src/components/settings/EmpEmploymentStatusSettingsPanel.test.ts --reporter=dot
→ Test Files: 2 passed · Tests: 16 passed · exit 0
```

| Suite | Result |
|-------|--------|
| `empEmploymentStatusCatalog.test.ts` | **6 PASS** |
| `EmpEmploymentStatusSettingsPanel.test.ts` | **10 PASS** (mount · list · create/edit · soft-retire · honesty/DENY) |

---

## 4. U65 browser retest plan (QA)

| Step | Action | PASS when |
|------|--------|-----------|
| 0 | Login `ceo@xe.vn` / `Xevn@2026` · OU holding / portal `main` | Portal + HRM embed OK |
| 1 | **Cài đặt / Settings** → tab **Trạng thái NV EMP** (`settings-tab-emp-employment-statuses`) | Panel mounts (`settings-emp-status-admin`) |
| 2 | ST: nhập `statusKey` open (vd. `hr_st_admin_qa_09`) · **Nhãn tiếng Việt** → **Tạo trạng thái** (`hdsd-emp-employment-status-save`) | Network **PUT** `/api/hrm/employees/employment-statuses` **2xx** · row in table |
| 3 | Invalid key `2bad` / space → toast **HRM-PLT-CAT-CODE-INVALID** (client) | No Network invent |
| 4 | **Tải lại (F5 list)** / F5 trang → row còn; picker hiệu lực chọn được mã mới | GET list + GET `…/effective` 200 |
| 5 | Click row → sửa nhãn → **Cập nhật** | PUT 2xx · FE cập nhật · F5 còn |
| 6 | STR: tạo `resign_personal_qa_09` · applies_to `inactive` → **Tạo lý do** | PUT `/api/hrm/employees/status-reasons` **2xx** |
| 7 | **Ngừng** ST hoặc STR | POST `…/retire` 2xx · ẩn khỏi active list/picker |
| 8 | Consumer smoke (must_keep): Employees form status Select vẫn bind EFF (CLOSED consumer — không regress) | EFF picker loads |
| 9 | DENY smoke: **không** xuất hiện Nest pos/dept admin panel; Settings job_titles/departments SoT unchanged | pos/dept Nest DENY |

**HDSD inventory (U76):**

- `settings-tab-emp-employment-statuses`
- `settings-emp-status-admin` · `settings-emp-employment-statuses` · `settings-emp-status-reasons`
- `hdsd-emp-employment-status-key|name|save|reload|retire-{key}|effective-picker`
- `hdsd-emp-status-reason-key|name|save|reload|applies-to|retire-{key}|effective-picker`

**Expected network:**

```text
GET  /api/hrm/employees/employment-statuses?company_id=…&status=active  → 200 HRM-EMP-ST-200
PUT  /api/hrm/employees/employment-statuses                             → 2xx (open key)
GET  /api/hrm/employees/employment-statuses/effective                   → 200
POST /api/hrm/employees/employment-statuses/:id/retire                  → 2xx soft
GET  /api/hrm/employees/status-reasons?company_id=…&status=active       → 200 HRM-EMP-STR-200
PUT  /api/hrm/employees/status-reasons                                  → 2xx
GET  /api/hrm/employees/status-reasons/effective                        → 200
POST /api/hrm/employees/status-reasons/:id/retire                       → 2xx soft
```

**U65:** zero-seed — create từ FE only · cấm `pnpm seed:*` · cấm API-only PASS.

---

## 5. Honesty / C-SLICE

| Flag | Value |
|------|-------|
| `hrm_personnel_uat_ready` | **false LOCKED** |
| `employees_e2e_linkage_ready` | **false LOCKED** |
| `contracts_printable_ready` | **false LOCKED** |
| Module EMP UAT / Phase1 DONE | **DENIED** |
| U65 seed in evidence | **none** |
| Nest pos/dept admin | **DENY RETAIN** |

---

## 6. completion_report

**Closed:** ADD Settings EMP ST/STR admin twin (ABSENT→LIVE) consuming sealed Nest KEY endpoints (list/upsert/retire + EFF invalidate); Settings tab **Trạng thái NV EMP**; format-only client validation; soft-retire; vitest **16 PASS**; honesty false · C-SLICE · pos/dept Nest DENY · no dual writer · no new Nest routes.

**Residual / open:** Browser U65 create→edit→retire→F5 persist — owner **qa**. Pack residual `R-PLT-EMP-FE-ADMIN-01` may narrow to Nest pos/dept DENY notes only after QA ACCEPT (PM board).

---

## 7. Handoff

- **ack_status:** `READY_FOR_QA`
- **next_owner:** `qa`
- **evidence_path:** `docs/qa/evidence/po-hrm-dynamic-config-platform-emp-status-fe-admin-build-fe-01.md`

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-FE-ADMIN-QA-FE-01
from_role: pm
to_role: qa
lane: execution · U65 browser-only · zero-seed
parent: PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-FE-ADMIN-BUILD-FE-01 READY_FOR_QA
entry_criteria: L0 stack up · FE Settings tab emp-employment-statuses mounted · Nest KEY LIVE EMPSTQA-MSK20G7H RETAIN
scope: UF Settings → Trạng thái NV EMP → create ST + STR → edit → soft-retire → F5 persist; Network PUT/GET/retire 2xx; DENY Nest pos/dept admin invent
persona: ceo@xe.vn / Xevn@2026 · OU holding
hdsd_align: settings-tab-emp-employment-statuses · hdsd-emp-employment-status-* · hdsd-emp-status-reason-*
exit_criteria: evidence browser block FE sau 2xx + F5; matrix note R-PLT-EMP-ST-FE-ADMIN closable; honesty false; C-SLICE; no seed
cấm: pnpm seed:* · API-only PASS · claim module EMP UAT · invent Nest pos/dept
must_keep: L1 EMPSTQA-MSK20G7H · consumer FE CLOSED · Settings job_titles/departments SoT · LVRULE HOLD
evidence_path: docs/qa/evidence/po-hrm-dynamic-config-platform-emp-status-fe-admin-qa-fe-01.md
read_first: docs/qa/evidence/po-hrm-dynamic-config-platform-emp-status-fe-admin-build-fe-01.md §4
```

# Evidence — PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-COMP-TYPE-CATALOG-FE-01

| Field | Value |
|-------|-------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-COMP-TYPE-CATALOG-FE-01` |
| **from_role** | dev-fe |
| **to_role** | qa |
| **lane** | execution |
| **Date** | 2026-08-08 |
| **closes** | QC Condition **R-PLT-ATT-OTC-03** P2 (GWC `…-qc-01.md`) |
| **prior_QA** | stamp `ATTCOMPQA-MSKARXQU` · KEY `HRM-ATT-OT-COMP-KEY` LIVE L1 |
| **change_mode** | FIX (narrow) — rebind compensation picker · DENY invent FE-ADMIN |
| **ack_status** | **READY_FOR_QA** |

---

## 1. spec_read_ack

| Artifact | Cite |
|----------|------|
| **srs/ba** | `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-COMP-TYPE-CATALOG-BA-01.md` §3–§5 · AC-PLT-ATT-COMP-01 / 01c · VAL-ATT-COMP-CNS-01 |
| **tech_spec/sa** | `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-COMP-TYPE-CATALOG-SA-01.md` Option **B** LOCKED · F-ATT-CAT-OTC EFF |
| **data** | `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-COMP-TYPE-CATALOG-DATA-01.md` · Nest `att_ot_comp_type` |
| **qc condition** | `docs/qa/evidence/po-hrm-dynamic-config-platform-att-comp-type-catalog-qc-01.md` · **R-PLT-ATT-OTC-03** |
| **peer pattern** | `useAttOtTypesEffective.ts` + OvertimeRequestTab OT-TYPE EFF bind (RETAIN) |
| **api** | `GET /api/hrm/attendance/ot-comp-types/effective` · invent KEY `HRM-ATT-OT-COMP-KEY` |

---

## 2. What closed

| # | Change | Path |
|---|--------|------|
| 1 | Hook `useAttOtCompTypesEffective` — RQ + helpers (map/resolve/bootstrap) | `apps/web/hrm/src/hooks/useAttOtCompTypesEffective.ts` |
| 2 | Vitest helpers + OvertimeRequestTab bind-branch asserts (incl. OT-TYPE RETAIN) | `apps/web/hrm/src/hooks/useAttOtCompTypesEffective.test.ts` |
| 3 | hrmApi `listEffectiveAttOtCompTypes` + `HrmAttOtCompTypeEffectiveRecord` | `apps/web/hrm/src/integrations/hrmApi.ts` |
| 4 | OvertimeRequestTab: EFF>0 Nest `code`/`nameVi` picker; EFF=0 bootstrap `salary`\|`compensatory_leave`; detail `resolveAttOtCompTypeLabel` (no binary invent) | `apps/web/hrm/src/components/attendance/OvertimeRequestTab.tsx` |
| 5 | Toast `HRM-ATT-OT-COMP-KEY` (orthogonal ≠ OT-TYPE KEY) | `apps/web/hrm/src/hooks/useOvertimeRequests.ts` |
| 6 | i18n VI/EN catalog error / bootstrap hint / KEY toast | `vi.json` · `en.json` |

### Bind behavior (AC)

| EFF | Picker source | Submit |
|-----|---------------|--------|
| **>0** | Nest effective `code` + `nameVi` | Nest `code` → BE KEY assert |
| **=0** | Soft bootstrap `salary` \| `compensatory_leave` only (U65 no seed) | Bootstrap codes OK |

Detail: prefer Nest `nameVi` when option hit; unknown/historical code → raw string (no invent salary↔TimeOff binary).

---

## 3. must_keep / DENY self-check

| Lock | Status |
|------|--------|
| OT-TYPE FE bind (`useAttOtTypesEffective` + Select) | **RETAIN** — vitest assert still passes |
| Overtime create/approve/reject/delete flow | **RETAIN** |
| TEXT soft key column on BE / KEY taxonomy | **RETAIN** — FE submits Nest code only |
| Invent FE-ADMIN panel for ot-comp-types | **DENIED** |
| Fold into `att_ot_type` picker | **DENIED** |
| Seed / flip `attendance_uat_ready` / `payroll_e2e_ready` / formula LIVE / module ATT UAT | **DENIED** |
| Reopen OT-TYPE L1 / FE-01 CLOSED / FE-ADMIN invent | **DENIED** |

Honesty: `ATT_OT_COMP_TYPE_UAT_HONESTY = false`.

---

## 4. Command table

| Command | Exit | Result |
|---------|-----:|--------|
| `pnpm --dir apps/web/hrm exec vitest run src/hooks/useAttOtCompTypesEffective.test.ts src/hooks/useAttOtTypesEffective.test.ts` | **0** | **32 passed** (15 comp-type + 17 OT-TYPE regression) |
| `Get-Item apps/web/hrm/src/hooks/useAttOtCompTypesEffective.ts` | 0 | Length **5955** (>0 on NFD `.git` tree) |
| `Get-Item …/useAttOtCompTypesEffective.test.ts` | 0 | Length **5286** |
| Evidence WriteAllText this file | 0 | Length ≥3KB (see footer) |

---

## 5. QA browser matrix (U65 — copy for QA-FE-01)

Persona: `ceo@xe.vn` / `Xevn@2026` · portal HRM embed Attendance → Đơn từ → Tăng ca.

| UF | Steps | Expect |
|----|-------|--------|
| **UF-ATT-COMP-FE-01** EFF>0 picker | Login → OT add dialog → open compensation Select | Options = Nest EFF `nameVi`; `data-testid=att-ot-comp-type-select`; **no** hardcode-only 2 if EFF has N+1 |
| **UF-ATT-COMP-FE-02** Nest POST | Pick Nest code (e.g. admin-created) → Lưu → Network POST overtime-requests **201** · body `compensation_type` = Nest code | FE list row; toast success |
| **UF-ATT-COMP-FE-03** F5 | F5 / re-open detail | Detail label = Nest `nameVi` (not binary invent) |
| **UF-ATT-COMP-FE-04** KEY invent (optional L1) | If possible force invent code when EFF>0 | Toast `hk.overtime.otCompTypeKeyError` · Network **400 `HRM-ATT-OT-COMP-KEY`** |
| **UF-ATT-COMP-FE-05** OT-TYPE RETAIN | Same dialog OT-type Select | Still Nest EFF OT types; no regression |
| **UF-ATT-COMP-FE-06** EFF=0 bootstrap | If company EFF=0 | Soft bootstrap salary/compensatory_leave + bootstrap hint; empty CTA OK; **no seed** |

**cấm:** `pnpm seed:*` · API invent then claim PASS · flip UAT flags.

---

## 6. Path proof (NFD)

```
Get-Item apps/web/hrm/src/hooks/useAttOtCompTypesEffective.ts
(Get-Item docs/qa/evidence/po-hrm-dynamic-config-platform-att-comp-type-catalog-fe-01.md).Length
```

---

## 7. Handoff

- **completion_report:** Closed R-PLT-ATT-OTC-03 — OvertimeRequestTab compensation picker rebound to Nest EFF `att_ot_comp_type` (peer OT-TYPE pattern). Hook + hrmApi EFF client + KEY toast + detail nameVi resolve. Vitest **32/32**. DENY FE-ADMIN invent / fold / seed / UAT flip. OT-TYPE bind RETAIN.
- **next_owner:** **qa**
- **ack_status:** **READY_FOR_QA**
- **evidence_path:** `docs/qa/evidence/po-hrm-dynamic-config-platform-att-comp-type-catalog-fe-01.md`

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-COMP-TYPE-CATALOG-QA-FE-01
from_role: pm
to_role: qa
lane: execution

FE-01 READY_FOR_QA closed R-PLT-ATT-OTC-03.
Browser U65 (zero-seed): OvertimeRequestTab compensation Select → Nest EFF when EFF>0 (nameVi options);
submit Nest code POST overtime-requests 2xx; F5 detail shows Nest nameVi (no binary invent);
OT-TYPE picker RETAIN; KEY HRM-ATT-OT-COMP-KEY toast on invent if EFF>0.
entry: L0 stack up; FE evidence docs/qa/evidence/po-hrm-dynamic-config-platform-att-comp-type-catalog-fe-01.md
exit: UF-ATT-COMP-FE-01..06 matrix; stamp; PASS_TO_PM or FAIL with residual
evidence_path: docs/qa/evidence/po-hrm-dynamic-config-platform-att-comp-type-catalog-qa-fe-01.md
cấm: seed · invent FE-ADMIN · reopen OT-TYPE L1 · claim module ATT UAT
```
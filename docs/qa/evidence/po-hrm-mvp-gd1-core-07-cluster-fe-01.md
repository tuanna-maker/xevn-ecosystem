# Evidence — PO-HRM-MVP-GD1-CORE-07-CLUSTER-FE-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-CORE-07-CLUSTER-FE-01` |
| **role** | dev-fe · execution |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` · **U89** Wave-21 |
| **date** | 2026-08-09 |
| **uc_ids** | `UC-BP-CORE-07` |
| **depends_on** | API-01 **CONFIRMED** · DATA-01 HOLD · BA-01 O1–O12 · peer BE-01 parallel · `CORE06QC1-MSLID363` soft≠DONE · `CORE03QC1-MSLFJH0K` must_keep · Nest `/core` DENY |
| **ack_status** | **READY_FOR_QA** |
| **change_mode** | **ADD** · preserve_default · CODE-MEMORY **APPEND** |
| **honesty** | `recruitment_uat_ready=false` · `jd_dynamic_done=false` · `contracts_printable_ready=false` · `hrm_personnel_uat_ready=false` · **C-SLICE** · **DENY** checklist alone = CORE-07 DONE · **DENY** free PATCH = DONE · **DENY** soft = CORE-06 DONE · **DENY** invent PAY/CORE-09/ATT DONE |
| **U65** | zero-seed — browser FE only |

---

## 1. spec_read_ack

```markdown
## spec_read_ack
- srs: SRS_HRM_ENTERPRISE.md FR-UC-BP-CORE-07 Luồng #1–#4 · Diễn biến #1–#2 · BR-BP-LC-02
- tech_spec / api: docs/program/specs/PO-HRM-MVP-GD1-CORE-07-CLUSTER-API-01.md
  F-CORE-ACT-01 POST /employees/:id/activate OR gated PATCH · R-CORE-07-GATE-01 409 · R-CORE-07-EFF-01 · R-CORE-07-ATT-12 emit-only
- ba: docs/program/specs/PO-HRM-MVP-GD1-CORE-07-CLUSTER-BA-01.md AC-CORE-07-* · J-HRM-CORE-07-01..05 DRAFT
- data: DATA-01 HOLD · status spine RETAIN · gate table HOLD invent · activated_at HOLD invent
- must_keep: CORE-06 soft≠DONE (`CORE06QC1-MSLID363`) · CORE-03 DOC/ET/CHK (`CORE03QC1-MSLFJH0K`) · Nest /core DENY
- sponsor_confirm: API-01 CONFIRMED · FE residual unlock · parallel BE-01
```

---

## 2. Closed scope

| Item | Status |
|------|--------|
| Profile CTA bind `can_activate` / `blocking_items` / `effective_date` | **PASS** |
| Network physical **POST** `/api/hrm/employees/:id/activate` (prefer) · gated PATCH helper alt | **PASS** |
| Nest `/core` ACT path in FE = **0** | **PASS** |
| GATE 409 toast `HRM-EMP-ACT-CHECKLIST-INCOMPLETE` · ACT-400 date | **PASS** |
| Footer checklist≠CORE-07 DONE · free PATCH≠DONE · soft≠CORE-06 DONE | **PASS** |
| DENY invent PAY/CORE-09/ATT DONE · honesty flip · reopen sealed J-* | **PASS** |
| FE-derive gate from checklist when BE envelope omitted (CTA UX only) | **PASS** |
| CODE-MEMORY APPEND on touched files | **PASS** |
| vitest | **3 files · 16 PASS** (+ must_keep CORE-06/03 source still green in prior run) |

### Files touched

- `apps/web/hrm/src/lib/empCoreActRing.ts` — **ADD** path/gate/EFF helpers · honesty footer
- `apps/web/hrm/src/lib/empCoreActRing.test.ts` — unit
- `apps/web/hrm/src/hooks/useEmployeeActivate.ts` — **ADD** checklist load + POST activate
- `apps/web/hrm/src/components/employee/EmployeeActivatePanel.tsx` — **ADD** CTA UI
- `apps/web/hrm/src/pages/EmployeeProfile.tsx` — embed panel · pending_docs badge · CODE-MEMORY APPEND
- `apps/web/hrm/src/integrations/hrmApi.ts` — `activateEmployee` · display-ready fields · CODE-MEMORY
- `apps/web/hrm/src/lib/apiError.ts` — GATE 409 / ACT-400 VI toast
- `apps/web/hrm/src/lib/apiError.core-07.test.ts` — toast map
- `apps/web/hrm/src/lib/poHrmMvpGd1Core07ClusterFe01.source.test.ts` — source lock
- `apps/web/hrm/src/i18n/locales/vi.json` · `en.json` — `pending_docs` status label

---

## 3. Verify

```bash
pnpm --dir apps/web/hrm exec vitest run \
  src/lib/empCoreActRing.test.ts \
  src/lib/apiError.core-07.test.ts \
  src/lib/poHrmMvpGd1Core07ClusterFe01.source.test.ts
# → 3 files · 16 tests PASS · exit 0
```

**Network contract (FE):**

| Action | Method / path | Body |
|--------|---------------|------|
| Gate input | GET `/api/hrm/employees/:id/document-checklist` | — |
| Kích hoạt (prefer) | **POST** `/api/hrm/employees/:id/activate?company_id=…` | `{ effective_date: 'dd/MM/yyyy' }` |
| Gated PATCH (alt helper) | PATCH `/api/hrm/employees/:id` | `{ status: 'active', effective_date }` — **≠** free PATCH DONE |
| Nest `/core/*` ACT | **0** | — |

**CTA enable:** BE `can_activate` prefer · else FE-derive from checklist required/blocks · **≠** claim FR-07 DONE without POST 2xx + U65 J-*.

---

## 4. U65 browser plan (QA-01 — no seed)

| J-ID | Click path | Pass when |
|------|------------|-----------|
| **J-HRM-CORE-07-01** | NV `pending_docs` → Profile → CTA + blocking / can_activate | Badge đủ/chưa đủ · Nest `/core` **0** · footer checklist≠DONE · no seed |
| **J-HRM-CORE-07-02** | Đủ + ngày hiệu lực → **Kích hoạt** → F5 | Network **POST** `…/employees/:id/activate` **2xx** · status `active` · Nest `/core` 0 |
| **J-HRM-CORE-07-03** | Incomplete → activate (or force) | **409** `HRM-EMP-ACT-CHECKLIST-INCOMPLETE` toast · F5 vẫn `pending_docs` |
| **J-HRM-CORE-07-04** | Cite free PATCH ≠ DONE · ATT emit OUT | Free status PATCH alone ≠ PASS FR-07 · no invent ATT/PAY/CORE-09 DONE |
| **J-HRM-CORE-07-05** | Seals · honesty · soft≠CORE-06 DONE | Nest `/core` 0 · CORE-06/05/03 seals · no honesty flip · no reopen J-* |

**Persona:** `ceo@xe.vn` / `Xevn@2026` · portal HRM embed  
**Cấm:** `pnpm seed:*` · Nest `/core` SoT · invent PAY/ATT/CORE-09 DONE · honesty flip · reopen sealed J-HRM-CORE-06/05/03/02B/09D..01

**Note:** Live activate 2xx/409 requires peer **BE-01** wire LIVE. FE Network path + toast taxonomy locked for QA when BE ready.

---

## 5. Residual

| ID | Note | Owner |
|----|------|-------|
| **R-FE-CORE-07-QA01** | Browser U65 J-01..05 | **qa** |
| Peer BE activate/gate LIVE | POST activate + GATE assert + display-ready envelope | Dev-BE parallel |
| Typed `activated_at` col | HOLD invent — display wire-body until DATA REQUIRED | ba-data / Dev-BE |
| ATT enroll / PAY / CORE-09 | OUT invent DONE | PM peer |
| Honesty / C-SLICE | flags false · checklist≠DONE · free PATCH≠DONE · soft≠CORE-06 DONE | QC |

---

## 6. Handoff

```yaml
work_item_id: PO-HRM-MVP-GD1-CORE-07-CLUSTER-FE-01
from_role: dev-fe
to_role: qa
ack_status: READY_FOR_QA
evidence_path: docs/qa/evidence/po-hrm-mvp-gd1-core-07-cluster-fe-01.md
entry_criteria: L0 stack · browser-only U65 · BE activate LIVE preferred for J-02/03
exit_criteria: J-HRM-CORE-07-01..05 verdict + Nest /core 0 + checklist≠DONE footer + soft≠CORE-06 DONE
next_owner: qa
next_dispatch_prompt: |
  work_item_id: PO-HRM-MVP-GD1-CORE-07-CLUSTER-QA-01
  lane: qa · U65 zero-seed
  Journeys: J-HRM-CORE-07-01..05
  Account: ceo@xe.vn / Xevn@2026
  Assert: Profile CTA can_activate/blocking_items · POST /employees/:id/activate (or gated PATCH) ·
    GATE 409 incomplete toast · F5 status · Nest /core ACT = 0 ·
    checklist≠CORE-07 DONE · free PATCH≠DONE · soft≠CORE-06 DONE ·
    DENY invent PAY/CORE-09/ATT DONE · no honesty flip · no reopen sealed J-*
  evidence_path: docs/qa/evidence/po-hrm-mvp-gd1-core-07-cluster-qa-01.md
  must_keep: CORE06QC1-MSLID363 · CORE03QC1-MSLFJH0K · CORE05QC1-MSLGVT40
```

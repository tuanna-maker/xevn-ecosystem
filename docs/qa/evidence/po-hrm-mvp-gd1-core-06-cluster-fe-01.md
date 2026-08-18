# Evidence — PO-HRM-MVP-GD1-CORE-06-CLUSTER-FE-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-CORE-06-CLUSTER-FE-01` |
| **role** | dev-fe · execution |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` · **U89** |
| **date** | 2026-08-09 |
| **uc_ids** | `UC-BP-CORE-06` |
| **depends_on** | API-01 **CONFIRMED** · DATA-01 HOLD · BA-01 O1–O12 · soft≠DONE · `CORE05QC1-MSLGVT40` · `R-CORE-05-HONESTY` idle-ok · Nest `/core` DENY · Dev-BE HOLD invent |
| **ack_status** | **READY_FOR_QA** |
| **change_mode** | **ADD** · preserve_default · CODE-MEMORY **APPEND** |
| **honesty** | `recruitment_uat_ready=false` · `jd_dynamic_done=false` · `contracts_printable_ready=false` · `hrm_personnel_uat_ready=false` · **C-SLICE** · **DENY** soft Profile alone = CORE-06 DONE · **DENY** CORE-05 = personnel UAT · **DENY** invent CORE-07/PAY DONE |
| **U65** | zero-seed — browser FE only |

---

## 1. spec_read_ack

```markdown
## spec_read_ack
- srs: SRS_HRM_ENTERPRISE.md FR-UC-BP-CORE-06 Luồng #1–#4 · Diễn biến #1–#2 · BR-BP-AST-02
- tech_spec / api: docs/program/specs/PO-HRM-MVP-GD1-CORE-06-CLUSTER-API-01.md
  F-CORE-AST-02 PATCH /employees/:id/assets/:assetId · R-CORE-06-TERM-CHK-01 · R-CORE-06-CLOSED-01 · R-CORE-06-EXCEPTION-01
- ba: docs/program/specs/PO-HRM-MVP-GD1-CORE-06-CLUSTER-BA-01.md AC-CORE-06-* · J-HRM-CORE-06-01..05 DRAFT
- data: DATA-01 HOLD · soft-return RETAIN · TERM/closed invent HOLD · prefer FE-derive
- must_keep: CORE-05 AST/BB/serial/DELETE-FORBIDDEN (`CORE05QC1-MSLGVT40`) · Nest /core DENY
- sponsor_confirm: API-01 CONFIRMED · FE residual unlock · Dev-BE HOLD invent schema
```

---

## 2. Closed scope

| Item | Status |
|------|--------|
| Checklist entry loads GET `/api/hrm/employees/:id/assets` (+ `status=assigned` on load CTA) | **PASS** |
| FE-filter `assigned` = «đang giữ / cần thu» (O3) | **PASS** |
| Mark thu hồi binds PATCH `status=returned` + `return_date` (F-CORE-AST-02) | **PASS** |
| Mark lost binds PATCH `status=lost` + `notes` stub | **PASS** |
| `asset_checklist_closed` / `openAssignedCount` FE-derive (0 assigned) | **PASS** |
| Soft Profile footer ≠ CORE-06 DONE · CORE-05 ≠ personnel UAT | **PASS** |
| Nest `/core` AST/TERM path in FE = **0** · no `/return` dual | **PASS** |
| must_keep CORE-05 BB CTA · soft-return · serial 409 · DELETE-FORBIDDEN UX | **PASS** |
| DENY invent Asset ledger · PAY settle · CORE-07 DONE · honesty flip · reopen sealed J-* | **PASS** |
| CODE-MEMORY APPEND on touched files | **PASS** |
| vitest | **6 files · 32 PASS** |

### Files touched

- `apps/web/hrm/src/lib/empCoreAstRing.ts` — lost patch · assigned filter · FE-derive closed · Nest TERM DENY · honesty footer
- `apps/web/hrm/src/hooks/useEmployeeAssets.ts` — markLost · loadAssignedChecklist · assignedAssets · closed derive
- `apps/web/hrm/src/components/employee/EmployeeAssetReturnChecklist.tsx` — **ADD** checklist UI
- `apps/web/hrm/src/components/employee/EmployeeAssets.tsx` — embed checklist + profile footer
- `apps/web/hrm/src/integrations/hrmApi.ts` — optional `status` / `termination_context_id` on list · CODE-MEMORY APPEND on PATCH
- `apps/web/hrm/src/i18n/locales/vi.json` · `en.json` — checklist / lost / honesty strings
- `apps/web/hrm/src/lib/empCoreAstRing.test.ts` — CORE-06 unit
- `apps/web/hrm/src/lib/poHrmMvpGd1Core06ClusterFe01.source.test.ts` — source lock

---

## 3. Verify

```bash
pnpm --dir apps/web/hrm exec vitest run \
  src/lib/empCoreAstRing.test.ts \
  src/lib/apiError.core-05.test.ts \
  src/lib/poHrmMvpGd1Core05ClusterFe01.source.test.ts \
  src/lib/poHrmMvpGd1Core05ClusterFe02.source.test.ts \
  src/lib/poHrmMvpGd1Core06ClusterFe01.source.test.ts \
  src/hooks/useEmployeeAssets.mapAsset.test.ts
# → 6 files · 32 tests PASS · exit 0
```

**Network contract (FE):**

| Action | Method / path | Body |
|--------|---------------|------|
| Load checklist | GET `/api/hrm/employees/:id/assets?status=assigned` (+ optional `termination_context_id`) | — |
| Soft thu hồi | PATCH `/api/hrm/employees/:id/assets/:assetId` | `{ status: 'returned', return_date }` |
| Ghi mất | PATCH same | `{ status: 'lost', notes }` |
| Nest `/core/*` AST/TERM | **0** | — |
| Nest `…/return` dual | **0** (HOLD invent) | — |

**Closed signal:** `asset_checklist_closed = (count status=assigned == 0)` — FE-derive · no PAY invent.

---

## 4. U65 browser plan (QA-01 — no seed)

| J-ID | Click path | Pass when |
|------|------------|-----------|
| **J-HRM-CORE-06-01** | Hồ sơ NV → tab **Tài sản** → **Tải đang giữ** | Network GET `/employees/:id/assets` (+ `status=assigned`) · list chỉ «Đang sử dụng» · Nest `/core` **0** · empty hợp lệ |
| **J-HRM-CORE-06-02** | Checklist **Thu hồi** / **Ghi mất** (+ notes) → F5 | PATCH assets/:assetId **2xx** `returned`/`lost` · row rời checklist · soft≠DONE footer visible |
| **J-HRM-CORE-06-03** | Thu hết assigned | Badge **Thu hồi xong** · `data-asset-checklist-closed=1` · openAssignedCount=0 |
| **J-HRM-CORE-06-04** | Partial thu (1 còn assigned) | closed **false** · count > 0 |
| **J-HRM-CORE-06-05** | Network + seals + Profile soft alone | Nest `/core` AST/TERM **0** · BB/serial soft-return RETAIN · soft Profile ≠ claim FR-06 DONE · CORE-05 ≠ personnel · CORE-07 remain QUEUED |

**Persona:** `ceo@xe.vn` / `Xevn@2026` · portal HRM embed  
**Cấm:** `pnpm seed:*` · Nest `/core` SoT · invent PAY settle · honesty flip · reopen sealed J-HRM-CORE-05/03/02B/09D..01

---

## 5. Residual

| ID | Note | Owner |
|----|------|-------|
| **R-FE-CORE-06-QA01** | Browser U65 J-01..05 executable | **qa** |
| Optional BE envelope | `asset_checklist_closed` on listAssets — HOLD unless PM unlocks | Dev-BE HOLD |
| Thin `/return` | HOLD invent — prefer PATCH | Dev-BE HOLD |
| CORE-07 / PAY-07 | Remain **QUEUED** / peer OUT invent DONE | PM peer |
| Honesty / C-SLICE | flags false · soft≠DONE · CORE-05≠personnel | QC |

---

## 6. Handoff

```yaml
work_item_id: PO-HRM-MVP-GD1-CORE-06-CLUSTER-FE-01
from_role: dev-fe
to_role: qa
ack_status: READY_FOR_QA
evidence_path: docs/qa/evidence/po-hrm-mvp-gd1-core-06-cluster-fe-01.md
completion_report: |
  ADD CORE-06 FE residual: checklist loads GET assets (status=assigned),
  soft-return/lost PATCH F-CORE-AST-02, FE-derive asset_checklist_closed,
  soft≠DONE + CORE-05≠personnel footers, Nest /core AST/TERM = 0,
  must_keep CORE-05 BB/serial. DENY Asset ledger · /return dual · CORE-07/PAY DONE ·
  honesty flip. vitest 6 files · 32 PASS. CORE-07 remain QUEUED.
next_owner: qa
next_dispatch_prompt: |
  work_item_id: PO-HRM-MVP-GD1-CORE-06-CLUSTER-QA-01
  lane: execution · qa
  program: PO-HRM-MVP-GD1-CONTINUOUS (U89)
  uc_ids: UC-BP-CORE-06
  depends_on: FE-01 READY_FOR_QA · docs/qa/evidence/po-hrm-mvp-gd1-core-06-cluster-fe-01.md · API-01 CONFIRMED · U65 zero-seed · soft≠DONE · CORE05QC1-MSLGVT40 · Nest /core DENY
  entry_criteria: L0 stack up · browser-only · no seed · persona ceo@xe.vn
  exit_criteria: J-HRM-CORE-06-01..05 evidence blocks · Nest /core AST/TERM = 0 · soft Profile alone ≠ CORE-06 DONE · CORE-05 seals intact · CORE-07 remain QUEUED · PASS_TO_PM or FAIL with residual
  evidence_path: docs/qa/evidence/po-hrm-mvp-gd1-core-06-cluster-qa-01.md
  cấm: pnpm seed:* · API invent closed · Nest /core · honesty flip · claim CORE-06/07/PAY DONE · reopen sealed J-*
```

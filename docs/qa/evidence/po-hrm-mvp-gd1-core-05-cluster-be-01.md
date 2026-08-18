# PO-HRM-MVP-GD1-CORE-05-CLUSTER-BE-01 — Evidence

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-CORE-05-CLUSTER-BE-01` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89 · Wave-19 seat #21) |
| **lane** | execution · **dev-be** |
| **uc_ids** | `UC-BP-CORE-05` |
| **Date** | 2026-08-09 |
| **depends_on** | API-01 **CONFIRMED** · DATA-01 · BA-01 O1–O12 · SA Option A · `CORE03QC1-MSLFJH0K` · `CORE02BQC1-MSLEFQC1` · peer `CORE09DQC1..CORE01QC1` · `EMPPLATQA-MSIZXHIM` · `EMPTOKQA-MSJ290VB` · `R-CORE-03-CC-EMBED-OBS` P2 idle-ok |
| **ack_status** | **READY_FOR_QA** |
| **Honesty** | `recruitment_uat_ready=false` · `jd_dynamic_done=false` · `contracts_printable_ready=false` · `hrm_personnel_uat_ready=false` · personnel/CORE/CTR UAT **false** · **C-SLICE** · U65 · **DENY** claim CRUD/BB alone = CORE-05 DONE · **DENY** invent CORE-06/07 / printable / closed-8 DONE |

---

## 1. spec_read_ack

| Artifact | Cite |
|----------|------|
| **srs** | `SRS_HRM_ENTERPRISE.md` **FR-UC-BP-CORE-05** Luồng **#1–#4** · Diễn biến **#1–#2** · **BR-BP-AST-01** |
| **ba** | `docs/program/specs/PO-HRM-MVP-GD1-CORE-05-CLUSTER-BA-01.md` O1–O12 · AC-CORE-05-* |
| **db_design** | `docs/program/specs/PO-HRM-MVP-GD1-CORE-05-CLUSTER-DATA-01.md` §4 ADD soft cols · §4.5 lifecycle · spine HOLD |
| **api_design** | `docs/program/specs/PO-HRM-MVP-GD1-CORE-05-CLUSTER-API-01.md` §4 F-CORE-AST-01 RETAIN · §5 F-CORE-AST-BB-01 ADD · §6 serial 409 · §7 soft-delete |
| **sponsor_confirm** | API-01 CONFIRMED 2026-08-09 · unlock BE+FE |
| **change_mode** | **ADD** BB cols + serial wire + soft policy · **RETAIN** physical `/employees/:id/assets*` spine |

---

## 2. Implementation summary

| Item | Detail |
|------|--------|
| **Service** | `apps/api/hrm-api/src/employees/employee-profile.service.ts` |
| **Controller** | `employees.controller.ts` — RETAIN assets routes · ADD `x-ba-waiver` on DELETE |
| **ensureSchema** | ADD `handover_confirmed_at TIMESTAMPTZ` · `handover_confirmed_by TEXT` · `handover_receiver_name TEXT` on `public.employee_assets` — **HOLD** spine cols · **HOLD** unique index |
| **F-CORE-AST-01** | RETAIN `GET/POST/PATCH/DELETE /api/hrm/employees/:id/assets*` · codes `HRM-EMP-PROFILE-200/201/202` |
| **F-CORE-AST-BB-01** | PATCH allowlist ADD confirm cols · `handoverConfirmed: true` → NOW()+actor · `handoverDocId = id` when confirmed · notes-only ≠ BB |
| **Serial** | POST/PATCH non-empty serial + `status=assigned` in `resolveHrmListScope` → **409 `HRM-EMP-ASSET-SERIAL-CONFLICT`** |
| **Soft-delete** | Issued rows → **409 `HRM-EMP-ASSET-DELETE-FORBIDDEN`** unless `x-ba-waiver: HRM-EMP-ASSET-DELETE` · prefer PATCH status `returned\|lost\|maintenance` |
| **Display-ready** | `statusLabelVi` · `handoverConfirmed*` · `handoverDocId` · camelCase↔snake normalize |
| **U19** | list = update = delete via same emp scope + `assertResourceInHrmScope` / `resolveHrmListScope` (group CEO `main`→holding) |
| **DENY** | Nest `@Controller('core')` AST · Asset ledger · invent F-CORE-AST-02 · light `hrm_asset_handover` primary · seed · honesty flip |
| **must_keep** | CORE-03 DOC/ET/CHK · CORE-02b EMP-CF · CORE-09d..01 · OBS P2 idle-ok · paper `/core` alias only |

---

## 3. Verification

```text
pnpm --filter hrm-api exec jest --testPathPatterns="po-hrm-mvp-gd1-core-05-cluster-be-01|employee-profile.service.spec" --no-coverage
→ Test Suites: 2 passed · Tests: 18 passed
  (CORE-05: 10 · profile residual scope: 8)

pnpm --filter hrm-api exec tsc -p tsconfig.build.json --noEmit
→ exit 0
```

**Jest coverage (unit):** ensureSchema BB cols + DENY Nest `/core`/ledger/unique-index invent · list display-ready · create default assigned/confirm NULL · serial 409 create · BB confirm SET · notes-only ≠ BB · serial 409 patch under main · DELETE-FORBIDDEN · U19 holding under main · AST-02 OUT cite.

---

## 4. must_keep / residual

| Class | Status |
|-------|--------|
| LIVE `/employees/:id/assets*` spine | **RETAIN** |
| CORE-03 DOC/ET/CHK `CORE03QC1-MSLFJH0K` · OBS P2 idle-ok | **RETAIN** · ≠ personnel |
| CORE-02b EMP-CF `CORE02BQC1-MSLEFQC1` | **RETAIN** |
| CORE-09d..01 peers | **RETAIN** · ≠ printable / closed-8 |
| Nest `/core` AST SoT | **ABSENT** (DENY invent) |
| F-CORE-AST-02 / CORE-06 | **OUT invent DONE** · QUEUED depends_on |
| Serial unique index | **HOLD** (wire first) |
| Browser U65 J-HRM-CORE-05-01..05 | **QA next** (after FE peer READY) |
| Honesty / C-SLICE | **false** — no flip |

---

## 5. Handoff

- **ack_status:** `READY_FOR_QA`
- **next_owner:** `qa` (after FE-01 READY)
- **evidence_path:** `docs/qa/evidence/po-hrm-mvp-gd1-core-05-cluster-be-01.md`

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-CORE-05-CLUSTER-QA-01
lane: execution · qa
program: PO-HRM-MVP-GD1-CONTINUOUS (U89)
uc_ids: UC-BP-CORE-05
depends_on: BE-01 READY_FOR_QA — docs/qa/evidence/po-hrm-mvp-gd1-core-05-cluster-be-01.md · FE-01 READY (peer)
entry_criteria: L0 stack; U65 zero-seed; browser-only; honesty false; C-SLICE
MISSION: Retest F-CORE-AST-01/BB-01 physical /api/hrm/employees/:id/assets* — Profile Tài sản Thêm → Lưu 201; list đang giữ status=assigned + statusLabelVi; PATCH handoverConfirmed → flags + handoverDocId=id F5; notes-only ≠ BB DONE; duplicate serial → 409 HRM-EMP-ASSET-SERIAL-CONFLICT; soft status returned/lost/maintenance prefer; hard DELETE issued without waiver → 409 DELETE-FORBIDDEN; Nest /core assets 0; DENY Asset SoT invent on FE; RETAIN CORE-03 DOC/ET/CHK · CORE-02b · CORE-09d..01; DENY claim CRUD=CORE-05 DONE · invent CORE-06/07 · printable/closed-8 · reopen sealed J-* · seed · honesty flip.
J-*: J-HRM-CORE-05-01..05 (DRAFT promote)
exit: docs/qa/evidence/po-hrm-mvp-gd1-core-05-cluster-qa-01.md · PASS_TO_PM or FAIL
cấm: seed · API-only PASS · Nest /core SoT · honesty flip
```

---

## completion_report

- **Closed:** F-CORE-AST-01 RETAIN physical assets CRUD + display-ready; F-CORE-AST-BB-01 ADD soft confirm cols + PATCH allowlist; serial **409 `HRM-EMP-ASSET-SERIAL-CONFLICT`**; soft-delete **409 `HRM-EMP-ASSET-DELETE-FORBIDDEN`** (waiver header); U19 list=get=mutate; Nest `/core` DENY; AST-02 OUT; jest **18 PASS**; tsc **exit 0**; must_keep CORE-03/02b/09d..01; honesty false · C-SLICE.
- **Residual:** QA U65 J-HRM-CORE-05-01..05 after FE-01 · serial unique index HOLD · CORE-06 QUEUED · light handover ALT HOLD · personnel/printable false.

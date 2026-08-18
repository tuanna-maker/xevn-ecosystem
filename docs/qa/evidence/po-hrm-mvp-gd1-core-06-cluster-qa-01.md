# Evidence — PO-HRM-MVP-GD1-CORE-06-CLUSTER-QA-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-CORE-06-CLUSTER-QA-01` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89 · UC-BP-CORE-06) |
| **lane** | execution · **qa** |
| **Date** | 2026-08-09 |
| **stamp** | `CORE06QA1-MSLHUNCJ` |
| **ack_status** | **FAIL_TO_PM** |
| **overall** | **FAIL** |
| **uc_ids** | `UC-BP-CORE-06` |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `companyId=main` · emp `2b4cbc90-fb74-4a2d-9fef-d188d4e48d61` |
| **Honesty** | `hrm_personnel_uat_ready=false` · `contracts_printable_ready=false` · `recruitment_uat_ready=false` · `jd_dynamic_done=false` · **C-SLICE-≠-MODULE** · soft≠CORE-06 DONE · U65 zero-seed |
| **depends_on** | FE-01 READY · API-01 CONFIRMED · `CORE05QC1-MSLGVT40` · Nest `/core` DENY |
| **env** | portal `:8080` (5173 down mid-run) · hrm-api `:28001` · xbos `:28002` · commit `dc930c5` |
| **runner** | `scripts/qa/_tmp-po-hrm-mvp-gd1-core-06-cluster-qa-01.mjs` |
| **raw JSON** | `docs/qa/evidence/_tmp-po-hrm-mvp-gd1-core-06-cluster-qa-01.json` |
| **screens** | `docs/qa/evidence/screens/po-hrm-mvp-gd1-core-06-cluster-qa-01/` |

---

## Verdict

| Gate | Result |
|------|--------|
| **Overall** | **FAIL** · `FAIL_TO_PM` · **C-SLICE** · **DENY** claim CORE-06/07/PAY DONE · **DENY** honesty flip · **DENY** seed |
| **L0** | hrm/xbos/portal **200** (`:8080`) |
| **L2.5 J-*** | **J-01 FAIL** · **J-02 PASS** · **J-03 FAIL** · **J-04 PASS** · **J-05 PASS** |
| **P0** | **R-CORE-06-STATUS-QUERY-400** OPEN — `GET …/assets?status=assigned` → **400** `HRM-VAL-001` «property status should not exist» |
| **Nest `/core` AST/TERM** | probe **404** · Network SoT non-404 **= 0** |
| **Seed** | **none** (FE Thêm cấp phát for fixture) |

---

## Spec / seal cite

| Artifact | Cite |
|----------|------|
| BA-01 | AC-CORE-06-* · J-HRM-CORE-06-01..05 |
| API-01 | F-CORE-AST-02 PATCH soft-return/lost · R-CORE-06-TERM-CHK-01 · R-CORE-06-CLOSED-01 FE-derive |
| FE-01 | `docs/qa/evidence/po-hrm-mvp-gd1-core-06-cluster-fe-01.md` READY |
| CORE-05 QC | **`CORE05QC1-MSLGVT40`** RETAIN · QA **`CORE05QA2-MSLGSWSF`** |
| CORE-03/02b/09d..01 | peer stamps RETAIN · not reopened |
| CORE-07 | board **QUEUED** (#23) · **DENY** invent DONE |
| PAY-07 | **OUT invent DONE** this seat |

**DTO gap:** `EmployeeProfileListQueryDto` allows only `company_id` — FE `listEmployeeAssets({ status: 'assigned' })` rejected by ValidationPipe.

---

## Browser U65 — journeys

Persona: portal auth inject · Profile `/hr/employees/{id}?tab=assets` · **zero-seed**.

**hdsd_align:** Hồ sơ NV → tab **Tài sản** → Checklist thu hồi → **Tải đang giữ** / **Thu hồi** / **Ghi mất** · hooks `hdsd-emp-assets-return-checklist*`.

| J-* | Click path / assert | Network / FE | Verdict |
|-----|---------------------|--------------|---------|
| **J-HRM-CORE-06-01** | **Tải đang giữ** | GET `…/assets?status=assigned` → **400** `HRM-VAL-001` · UI vẫn FE-filter assigned rows + soft≠DONE footer · Nest `/core` **0** | **FAIL** |
| **J-HRM-CORE-06-02** | Checklist **Ghi mất** (+ notes) → F5 | PATCH **200** `status=lost` · prior soft-return **returned** · footer soft≠DONE visible (`data-honesty-soft-ne-done=1`) | **PASS** |
| **J-HRM-CORE-06-03** | Clear assigned → closed badge | API assigned=0 but FE `data-asset-checklist-closed=0` / count=2 (stale after status-query 400 path) | **FAIL** |
| **J-HRM-CORE-06-04** | Partial thu 1 row | PATCH **200** `returned`+`return_date` · closed=`0` · open badge · remaining ≥1 | **PASS** |
| **J-HRM-CORE-06-05** | Nest deny · seals · honesty | nest SoT=0 · DELETE **409** `HRM-EMP-ASSET-DELETE-FORBIDDEN` · serial **409** `HRM-EMP-ASSET-SERIAL-CONFLICT` · BB CTA alive · CORE-07 QUEUED · honesty false | **PASS** |

Screens: `01-assets-tab` … `09-done`.

---

## AC map

| AC | Result |
|----|--------|
| **AC-CORE-06-01/03** checklist GET assigned (TERM-CHK) | **FAIL** — status query VAL-001 |
| **AC-CORE-06-≠-SOFT-DONE** footer | **PASS** (J-02) |
| **AC-CORE-06-05/06** closed FE-derive | **FAIL** (J-03 stale / blocked by J-01) |
| **AC-CORE-06-07** lost + notes stub | **PASS** (J-02) |
| **AC-CORE-06-08** partial | **PASS** (J-04) |
| **Nest `/core` DENY** | **PASS** (J-05) |
| **must_keep CORE-05** BB/serial/DELETE-FORBIDDEN | **PASS** (J-05) |
| **CORE-07 / PAY OUT invent DONE** | **PASS** cite QUEUED |
| **Honesty / C-SLICE** | **PASS** (false · no flip) |

---

## Residuals / defects

| ID | Sev | Owner | Note |
|----|-----|-------|------|
| **R-CORE-06-STATUS-QUERY-400** | **P0** | **dev-be** | Whitelist optional `status` (+ soft `termination_context_id`) on `EmployeeProfileListQueryDto` · filter `listAssets` SQL when `status=assigned` · rebuild+restart dist · **DENY** Nest `/core` |
| **R-CORE-06-CLOSED-FE-STALE** | P1 | **qa** retest after BE | J-03 closed badge stale when loadAssigned GET 400; verify closed=`1` after BE fix |
| **R-CORE-06-HONESTY** | INFO | QC | C-SLICE · soft≠CORE-06 DONE · CORE-05≠personnel · CORE-07/PAY QUEUED |

**Optional FE (not primary):** omit `status` query until BE wire LIVE (FE-filter only) — mission AC still requires Network `status=assigned` **2xx**.

---

## Honesty footer

```text
recruitment_uat_ready=false
jd_dynamic_done=false
contracts_printable_ready=false
hrm_personnel_uat_ready=false
personnel / CORE / CTR module UAT = false
C-SLICE ≠ module CORE UAT
U65 zero-seed · Nest /core AST/TERM dual DENY
DENY invent CORE-06/07 / PAY DONE
DENY soft Profile alone = CORE-06 DONE
DENY claim CRUD slice = CORE-06 DONE
CORE-07 remain QUEUED
```

---

## Completion contract

| Field | Value |
|-------|--------|
| **completion_report** | U65 browser J-HRM-CORE-06-01..05: **FAIL** overall. J-02/04/05 PASS (lost/return PATCH, partial closed=false, Nest0, CORE-05 seals, soft≠DONE footer, CORE-07 QUEUED). **J-01 FAIL P0** GET `?status=assigned` → 400 HRM-VAL-001. **J-03 FAIL** closed badge stale. Honesty false · C-SLICE · no seed · no claim CORE-06/07/PAY DONE. |
| **next_owner** | **dev-be** |
| **ack_status** | **FAIL_TO_PM** |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-core-06-cluster-qa-01.md` |

### next_dispatch_prompt

```text
work_item_id: PO-HRM-MVP-GD1-CORE-06-CLUSTER-BE-02
lane: execution · dev-be
program: PO-HRM-MVP-GD1-CONTINUOUS (U89)
uc_ids: UC-BP-CORE-06
depends_on: QA-01 FAIL CORE06QA1-MSLHUNCJ · docs/qa/evidence/po-hrm-mvp-gd1-core-06-cluster-qa-01.md · FE-01 READY · API-01 CONFIRMED · CORE05QC1-MSLGVT40 · Nest /core DENY
entry_criteria: L0 stack up · P0 R-CORE-06-STATUS-QUERY-400
mission: Whitelist optional status (+ soft termination_context_id) on EmployeeProfileListQueryDto; listAssets filters status=assigned when provided; GET …/assets?status=assigned → 200 + assigned-only rows; rebuild+restart dist LIVE; jest regression; DENY Nest /core invent · DENY PAY/CORE-07 DONE · must_keep CORE-05 BB/serial/DELETE-FORBIDDEN
exit_criteria: evidence docs/qa/evidence/po-hrm-mvp-gd1-core-06-cluster-be-02.md · READY_FOR_QA · next QA-02 retest J-01+J-03
cấm: pnpm seed:* · Nest /core SoT · honesty flip · invent CORE-06/07/PAY DONE · reopen sealed J-HRM-CORE-05/03/02B/09D..01
```

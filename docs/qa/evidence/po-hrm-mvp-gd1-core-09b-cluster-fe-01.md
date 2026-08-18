# Evidence — PO-HRM-MVP-GD1-CORE-09B-CLUSTER-FE-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-CORE-09B-CLUSTER-FE-01` |
| **role** | dev-fe · execution |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` · **U89** Wave-14 |
| **date** | 2026-08-09 |
| **uc_ids** | `UC-BP-CORE-09b` |
| **depends_on** | API-01 **CONFIRMED RETAIN** · DATA-01 HOLD · BA O1–O12 · SA Option A · peer `CORE09AQC1-MSLA4LX9` |
| **ack_status** | **READY_FOR_QA** |
| **change_mode** | UPGRADE · preserve_default · CODE-MEMORY APPEND · **NO** invent schema/API/VER |
| **honesty** | `recruitment_uat_ready=false` · `jd_dynamic_done=false` · **`contracts_printable_ready=false`** · personnel/CORE/CTR module UAT **false** · **C-SLICE** |
| **U65** | zero-seed — browser FE only |

---

## 1. spec_read_ack

| Artifact | Ack |
|----------|-----|
| **BA-01** `docs/program/specs/PO-HRM-MVP-GD1-CORE-09B-CLUSTER-BA-01.md` | O1–O12 · AC-CORE-09B-* · BR-CTR-CL-02/04 · AC-CTR-PRINT-01..03/06..08 · J-HRM-CORE-09B-01..04 DRAFT |
| **API-01** `docs/program/specs/PO-HRM-MVP-GD1-CORE-09B-CLUSTER-API-01.md` | F-CORE-CTR-PACK-01 · F-CORE-CTR-PREV-01 RETAIN · physical `/contracts-insurance/contracts*` pack-resolve+preview · paper `/core` alias only |
| **DATA-01** | HOLD RETAIN pack_rules + templates + clauses + contracts · ephemeral preview · **no** VER persist as 09b |
| **CORE-09a / 08 / 02 / 01** | stamps `CORE09AQC1-MSLA4LX9` · `CORE08QC1-MSL9BFFE` · `CORE02QC1-MSL80DU6` · `CORE01QC1-MSL6WMS7` **must_keep** · **≠** printable DONE · **≠** pillar DONE |
| **AS-IS UI** | `ContractPrintSpinePanel` already LIVE-bound — residual pack suggest UX + preview fidelity + DRIVER block + wire toasts |

```markdown
## spec_read_ack
- srs: SRS_HRM_ENTERPRISE.md FR-UC-BP-CORE-09b Diễn biến #1–#5 · BR-CTR-CL-02/04 · AC-CTR-PRINT-01..03/06..08
- tech_spec / api: PO-HRM-MVP-GD1-CORE-09B-CLUSTER-API-01.md F-CORE-CTR-PACK-01 · F-CORE-CTR-PREV-01
- ba: PO-HRM-MVP-GD1-CORE-09B-CLUSTER-BA-01.md O1–O12 · AC-CORE-09B-* · J-HRM-CORE-09B-01..04
- db_design: DATA-01 HOLD cite — no FE invent
- sponsor_confirm: API-01 CONFIRMED RETAIN 2026-08-09 · BA O1–O12
```

---

## 2. Closed scope

| Item | Status |
|------|--------|
| Bind pack suggest → LIVE `GET …/contracts/pack-resolve?employee_id=` | **UPGRADE** (banner + reason + apply suggest) |
| Bind preview → LIVE `POST …/contracts/:id/preview` | **RETAIN + UPGRADE** fidelity |
| DENY Nest `/core` dual pack/preview | **PASS** (source lock) |
| Pack MVP VI GENERAL / IT_OFFICE / DRIVER (+ LOGISTICS optional) | **UPGRADE** |
| HCNS override pack before issue (O2) | **PASS** (Select + banner) |
| DRIVER block when pack=DRIVER / `show_driver_license_block` | **ADD** |
| Ephemeral preview: sections/clauses/merged summary/missing_*/can_issue/cb_masked | **UPGRADE** |
| DENY preview INSERT issued VER · DENY FE hardcode long legal | **PASS** |
| Surface TPL-NONE / PACK-INVALID / TPL-PACK-MISMATCH / DRIVER | **ADD** apiError + panel |
| Registry create/edit/F5 must_keep | **PASS** (overlay only) |
| VER/PDF UI labeled peer 09c OUT · not CORE-09b DONE | **PASS** |
| must_keep CORE-09a CL · CORE-08 · CORE-02 · CORE-01 · printable=false | **PASS** |
| DENY invent 09c/09d DONE · honesty flip · seed · reopen sealed J-* | **PASS** |
| vitest | **22 PASS** (5 files) |

### Files touched

- `apps/web/hrm/src/lib/contractPackPreviewUx.ts` (+ test)
- `apps/web/hrm/src/lib/contractPrintFieldOverrides.ts` (+ test DRIVER keys)
- `apps/web/hrm/src/lib/apiError.ts` + `apiError.core-09b.test.ts`
- `apps/web/hrm/src/lib/contractLegalPrintConstants.ts` — CODE-MEMORY APPEND
- `apps/web/hrm/src/integrations/hrmApi.ts` — preview/pack DTO fidelity fields
- `apps/web/hrm/src/components/contracts/ContractPrintSpinePanel.tsx`
- `apps/web/hrm/src/lib/poHrmMvpGd1Core09bClusterFe01.source.test.ts`

### Network assert path (QA)

```text
1) Open HĐ create/edit with employee → GET /api/hrm/contracts-insurance/contracts/pack-resolve?employee_id=… → 200 HRM-CTR-PACK-200
2) FE banner ctr-print-pack-suggest shows suggested_pack VI + reason; HCNS may change Select
3) After registry save (contractId) → Xem trước → POST …/contracts/:id/preview → 200 HRM-CTR-PREV-200
4) Assert response surfaces on FE: clauses/sections/merged summary/missing_*/can_issue/cb_masked
5) Switch IT_OFFICE ↔ DRIVER → preview again → clause fingerprint differs + DRIVER block
6) Path MUST contain /contracts-insurance/contracts — Nest /api/hrm/core/** = FAIL
7) Preview MUST NOT create new issued print-version row (O3)
8) Registry Lưu → F5 still works (AC-CTR-PRINT-08)
```

---

## 3. Verify

```bash
pnpm --dir apps/web/hrm exec vitest run \
  src/lib/contractPackPreviewUx.test.ts \
  src/lib/apiError.core-09b.test.ts \
  src/lib/poHrmMvpGd1Core09bClusterFe01.source.test.ts \
  src/lib/contractPrintFieldOverrides.test.ts \
  src/lib/contractPrintRequest.test.ts
# → 5 files · 22 tests PASS
```

---

## 4. U65 browser plan (QA — no seed)

| J-ID | Click path | Pass when |
|------|------------|-----------|
| **J-HRM-CORE-09B-01** | Login → Hợp đồng → tạo/mở nháp + chọn NV | Network **GET** `…/pack-resolve?employee_id=` **200** · banner suggested_pack VI · allowed MVP packs · **không** Nest `/core` |
| **J-HRM-CORE-09B-02** | Lưu registry → **Xem trước** | Network **POST** `…/contracts/:id/preview` **200** · layout A/B·job·term·≥1 clause từ API · **no** VER INSERT · honesty printable=false |
| **J-HRM-CORE-09B-03** | Đổi gói IT_OFFICE ↔ DRIVER → preview lại | Clause set **differs**; DRIVER block visible; optional non-C&B `cb_masked` |
| **J-HRM-CORE-09B-04** | Missing Đ.21/DRIVER / 0 template; registry F5; seals | `can_issue=false` + missing lists · TPL-NONE path · registry CRUD F5 · Nest `/core` **0** · CORE-09a/08/02/01 smoke · **≠** printable true · **≠** 09c/09d DONE · **≠** CORE-09a=printable |

**Persona:** `ceo@xe.vn` / `Xevn@2026` · portal HRM embed Contracts  
**Prerequisite:** LIVE Nest pack-resolve + preview (API RETAIN) · ≥1 active template for happy path  
**Cấm:** `pnpm seed:*` · Nest `/core` SoT · FE hardcode legal body · claim VER/PDF DONE · honesty flip · reopen J-CORE-09A/08/02/01 rewrite

---

## 5. Residual

| ID | Note | Owner |
|----|------|-------|
| **R-FE-CORE-09B-BE-LIVE** | Pack-resolve + preview need LIVE Nest for browser 🟢; FE residual done | QA / BE if FAIL |
| **R-FE-CORE-09B-VER-PDF** | F-CORE-CTR-VER/PDF/TPL **OUT** invent as DONE — peer 09c/09d | peer seats |
| Honesty | `contracts_printable_ready=false` · C-SLICE · CORE-09a ≠ printable DONE · CORE-08 ≠ pillar DONE | QC |

---

## 6. Honesty footer

```text
recruitment_uat_ready=false
jd_dynamic_done=false
contracts_printable_ready=false
personnel_uat_ready=false
core_module_uat_ready=false
ctr_module_uat_ready=false
C-SLICE=true
DENY: invent 09c VER/PDF · 09d TPL as DONE · claim CORE-09a=printable · reopen sealed J-HRM-CORE-09A/08/02/01 · seed · Nest /core dual
```

---

## 7. Handoff

| Field | Value |
|-------|--------|
| **completion_report** | Preview fidelity residual closed for UC-BP-CORE-09b: LIVE pack-resolve suggest + ephemeral POST preview under `/contracts-insurance/contracts*` · MVP pack VI · DRIVER block · missing/can_issue/cb_masked surfaces · wire toasts TPL-NONE/PACK-INVALID/TPL-PACK-MISMATCH/DRIVER · registry must_keep · VER/PDF labeled peer 09c OUT · Nest `/core` DENY · printable=false · vitest 22 PASS. |
| **next_owner** | **qa** |
| **ack_status** | **READY_FOR_QA** |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-core-09b-cluster-fe-01.md` |
| **next_dispatch_prompt** | See § below |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-CORE-09B-CLUSTER-QA-01
lane: execution · qa
program: PO-HRM-MVP-GD1-CONTINUOUS (U89)
uc_ids: UC-BP-CORE-09b
depends_on: FE-01 READY_FOR_QA · docs/qa/evidence/po-hrm-mvp-gd1-core-09b-cluster-fe-01.md · API-01 CONFIRMED RETAIN · peer CORE09AQC1-MSLA4LX9
entry_criteria: browser-only; U65 zero-seed; L0 stack up; LIVE pack-resolve+preview
exit_criteria: J-HRM-CORE-09B-01..04 evidence; Network physical /contracts-insurance/contracts* only; Nest /core 0; preview no VER INSERT; IT↔DRIVER clause diff; can_issue/missing/DRIVER/TPL-NONE; registry F5; honesty printable=false; ≠ CORE-09a=printable / ≠ 09c·09d DONE
cấm: pnpm seed:* · API/DB fake · PASS chỉ probe · Nest /core SoT
evidence_path: docs/qa/evidence/po-hrm-mvp-gd1-core-09b-cluster-qa-01.md
ack_status: PASS_TO_PM | FAIL_TO_PM
```

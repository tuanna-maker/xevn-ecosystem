# Evidence — PO-HRM-MVP-GD1-CORE-09C-CLUSTER-FE-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-CORE-09C-CLUSTER-FE-01` |
| **role** | dev-fe · execution |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` · **U89** Wave-15 |
| **date** | 2026-08-09 |
| **uc_ids** | `UC-BP-CORE-09c` |
| **depends_on** | API-01 **CONFIRMED RETAIN** · DATA-01 HOLD · BA O1–O12 · SA Option A · peer `CORE09BQC1-MSLB05DZ` |
| **ack_status** | **READY_FOR_QA** |
| **change_mode** | UPGRADE · preserve_default · CODE-MEMORY APPEND · **NO** invent schema/API/endpoints · **NO** Nest `/core` |
| **honesty** | `recruitment_uat_ready=false` · `jd_dynamic_done=false` · **`contracts_printable_ready=false`** · personnel/CORE/CTR module UAT **false** · **C-SLICE** |
| **U65** | zero-seed — browser FE only |

---

## 1. spec_read_ack

| Artifact | Ack |
|----------|-----|
| **BA-01** `docs/program/specs/PO-HRM-MVP-GD1-CORE-09C-CLUSTER-BA-01.md` | O1–O12 · AC-CORE-09C-* · BR-CTR-CL-01/02/04 · AC-CTR-PRINT-01/04/05/06/08 · J-HRM-CORE-09C-01..04 DRAFT |
| **API-01** `docs/program/specs/PO-HRM-MVP-GD1-CORE-09C-CLUSTER-API-01.md` | F-CORE-CTR-VER-01/02 · F-CORE-CTR-PDF-01 RETAIN · physical `/contracts-insurance/*` print-versions* + pdf · paper `/core` alias only |
| **DATA-01** | HOLD RETAIN `hrm_contract_print_versions` + snapshot freeze · **no** mega-EAV · schema ADD NOT unlock |
| **CORE-09b / 09a / 08 / 02 / 01** | stamps `CORE09BQC1-MSLB05DZ` · `CORE09AQC1-MSLA4LX9` · `CORE08QC1-MSL9BFFE` · `CORE02QC1-MSL80DU6` · `CORE01QC1-MSL6WMS7` **must_keep** · **≠** printable DONE · **≠** 09d TPL DONE |
| **AS-IS UI** | `ContractPrintSpinePanel` already LIVE-bound create/list/pdf — residual U65 fidelity: list/detail pack+version · ISSUE-BLOCKED UX · PDF %PDF + VERSION-NOT-ISSUED · PREV ephemeral keep |

```markdown
## spec_read_ack
- srs: SRS_HRM_ENTERPRISE.md FR-UC-BP-CORE-09c Diễn biến #1–#5 · BR-CTR-CL-01/02/04 · AC-CTR-PRINT-01/04/05/06/08
- tech_spec / api: PO-HRM-MVP-GD1-CORE-09C-CLUSTER-API-01.md F-CORE-CTR-VER-01/02 · F-CORE-CTR-PDF-01
- ba: PO-HRM-MVP-GD1-CORE-09C-CLUSTER-BA-01.md O1–O12 · AC-CORE-09C-* · J-HRM-CORE-09C-01..04
- db_design: DATA-01 HOLD cite — no FE invent
- sponsor_confirm: API-01 CONFIRMED RETAIN 2026-08-09 · BA O1–O12 · peer CORE09BQC1-MSLB05DZ
```

---

## 2. Closed scope

| Item | Status |
|------|--------|
| Bind «Lưu phiên bản» → LIVE `POST …/contracts/:id/print-versions` | **UPGRADE** fidelity (toast VER-201 + list refresh) |
| Bind list/get → LIVE `GET …/print-versions*` | **UPGRADE** pack_code + version_no + status + issued_at · detail get-by-id |
| Bind PDF → LIVE `GET …/print-versions/:versionId/pdf` | **UPGRADE** Blob %PDF assert · VERSION-NOT-ISSUED / PV-404 / RENDER-FAIL parse |
| DENY Nest `/core` dual VER/PDF | **PASS** (source lock) |
| After 201: list/detail show pack + version_no (+ status/issued_at); F5 còn | **PASS** (UI + list reload; F5 via GET on remount) |
| Amend → new version + prior superseded (server) | **PASS** FE shows status labels; supersede is BE |
| PDF from issued snapshot only · DENY FE invent live remerge | **PASS** (no jsPDF/html2pdf; issued-only button) |
| ISSUE-BLOCKED / DRIVER / TERM / TPL-NONE + missing lists | **ADD** banner + toast |
| PREV remains ephemeral (no VER INSERT on preview) | **must_keep** CORE-09b |
| Registry CRUD F5 must_keep | **PASS** (overlay only) |
| Honesty printable=false · ≠ 09d TPL DONE · ≠ CORE-09b=printable | **PASS** |
| Dev-BE HOLD · no invent schema/API | **PASS** |
| vitest | **28 PASS** (6 files incl. must_keep 09b) |

### Files touched

- `apps/web/hrm/src/lib/contractPrintVersionUx.ts` (+ test)
- `apps/web/hrm/src/lib/apiError.ts` + `apiError.core-09c.test.ts`
- `apps/web/hrm/src/integrations/hrmApi.ts` — getPrintVersion · PDF error/%PDF
- `apps/web/hrm/src/components/contracts/ContractPrintSpinePanel.tsx`
- `apps/web/hrm/src/lib/contractLegalPrintConstants.ts` — CODE-MEMORY APPEND honesty
- `apps/web/hrm/src/lib/poHrmMvpGd1Core09cClusterFe01.source.test.ts`

### Network assert path (QA)

```text
1) Preview can_issue=true → Lưu phiên bản → POST …/contracts/:id/print-versions → 201 HRM-CTR-VER-201
2) FE list/detail shows pack_code + version_no + status + issued_at
3) F5 → GET …/print-versions → 200 HRM-CTR-VER-200 · same version_no/pack
4) PDF on issued → GET …/print-versions/:versionId/pdf → 200 application/pdf starts %PDF
5) Missing mandatory → Lưu → 400 ISSUE-BLOCKED|DRIVER|TERM|TPL-NONE + FE missing lists · no issued INSERT
6) Path MUST contain /contracts-insurance — Nest /api/hrm/core/** = FAIL
7) Preview again → POST …/preview ephemeral · 0 VER INSERT from preview alone
8) Registry Lưu → F5 still works (AC-CTR-PRINT-08)
9) Amend Lưu again → new version_no · prior status superseded
```

---

## 3. Verify

```bash
pnpm --dir apps/web/hrm exec vitest run \
  src/lib/contractPrintVersionUx.test.ts \
  src/lib/apiError.core-09c.test.ts \
  src/lib/poHrmMvpGd1Core09cClusterFe01.source.test.ts \
  src/lib/contractPackPreviewUx.test.ts \
  src/lib/contractPrintRequest.test.ts \
  src/lib/apiError.core-09b.test.ts
# → 6 files · 28 tests PASS
```

---

## 4. U65 browser plan (QA — no seed)

| J-ID | Click path | Pass when |
|------|------------|-----------|
| **J-HRM-CORE-09C-01** | Login → Hợp đồng → preview `can_issue=true` → **Lưu phiên bản** → F5 | Network **POST** `…/print-versions` **201** `HRM-CTR-VER-201` · list/detail pack + `version_no` · F5 GET **200** · **không** Nest `/core` |
| **J-HRM-CORE-09C-02** | Open issued VER → **PDF** | Network **GET** `…/print-versions/:id/pdf` **200** `%PDF` · content match snapshot · ≠ live-library remerge |
| **J-HRM-CORE-09C-03** | Missing mandatory / 0 template → Lưu | **400** ISSUE-BLOCKED/DRIVER/TERM/TPL-NONE + FE missing lists · no fake issued |
| **J-HRM-CORE-09C-04** | Nest `/core` 0 · PREV ephemeral · amend · seals | Preview 0 VER INSERT · registry F5 · amend supersede · CORE-09b/09a/08/02/01 smoke · **≠** printable true · **≠** 09d TPL DONE · **≠** CORE-09b=printable |

**Persona:** `ceo@xe.vn` / `Xevn@2026` · portal HRM embed Contracts  
**Prerequisite:** LIVE Nest print-versions + pdf (API RETAIN) · ≥1 active template · preview can_issue path  
**Cấm:** `pnpm seed:*` · Nest `/core` SoT · FE invent PDF · honesty flip · invent 09d TPL DONE · reopen sealed J-CORE-09B/09A/08/02/01 rewrite

---

## 5. Residual

| ID | Note | Owner |
|----|------|-------|
| **R-FE-CORE-09C-BE-LIVE** | VER create/list/PDF need LIVE Nest for browser 🟢; FE residual done · Dev-BE HOLD unless wire gap proven | QA / BE if FAIL |
| **R-QA-CORE-09B-CLAUSE-FP-EMPTY** | Carry OBS → peer UC-BP-CORE-09d (idle-ok this seat) | peer 09d |
| Honesty | `contracts_printable_ready=false` · C-SLICE · CORE-09b ≠ printable DONE · ≠ module CTR UAT | QC |

---

## 6. Handoff

| Field | Value |
|-------|--------|
| **ack_status** | **READY_FOR_QA** |
| **next_owner** | **qa** |
| **completion_report** | CORE-09c FE U65 fidelity residual closed: LIVE bind POST/GET print-versions* + GET pdf under `/contracts-insurance` only; after 201 list/detail pack_code+version_no+status+issued_at; ISSUE-BLOCKED/DRIVER/TERM/TPL-NONE + missing lists; PDF Blob %PDF + VERSION-NOT-ISSUED; PREV ephemeral must_keep; Nest `/core` DENY; printable=false; no invent 09d/schema; vitest 28 PASS. |
| **next_dispatch_prompt** | See below |

```text
work_item_id: PO-HRM-MVP-GD1-CORE-09C-CLUSTER-QA-01
lane: execution · qa
program: PO-HRM-MVP-GD1-CONTINUOUS (U89)
uc_ids: UC-BP-CORE-09c
depends_on: FE-01 READY_FOR_QA · API-01 CONFIRMED RETAIN · peer CORE09BQC1-MSLB05DZ
spec_ref: F-CORE-CTR-VER-01/02 · F-CORE-CTR-PDF-01 · AC-CORE-09C-01..08 · AC-CTR-PRINT-01/04/05/06/08 · J-HRM-CORE-09C-01..04
entry_criteria: browser-only; U65 zero-seed; L0 stack; FE evidence docs/qa/evidence/po-hrm-mvp-gd1-core-09c-cluster-fe-01.md
exit_criteria: J-HRM-CORE-09C-01..04 verdicts with Network path /contracts-insurance; FE after 201 + F5; PDF %PDF; ISSUE-BLOCKED path; PREV ephemeral 0 VER INSERT; Nest /core 0; honesty printable=false; ≠ 09d TPL DONE; ≠ CORE-09b=printable; PASS_TO_PM or FAIL with residual
cấm: pnpm seed:* · Nest /core SoT · claim printable ready · invent 09d DONE · reopen sealed J-09B/09A/08/02/01
evidence_path: docs/qa/evidence/po-hrm-mvp-gd1-core-09c-cluster-qa-01.md
persona: ceo@xe.vn / Xevn@2026 · Contracts embed
```

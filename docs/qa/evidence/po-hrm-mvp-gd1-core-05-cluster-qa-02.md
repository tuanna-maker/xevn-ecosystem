# Evidence — PO-HRM-MVP-GD1-CORE-05-CLUSTER-QA-02

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-CORE-05-CLUSTER-QA-02` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89 · UC-BP-CORE-05) |
| **lane** | execution · **qa** |
| **Date** | 2026-08-09 |
| **stamp** | `CORE05QA2-MSLGSWSF` |
| **ack_status** | **PASS_TO_PM** |
| **overall** | **PASS** |
| **uc_ids** | `UC-BP-CORE-05` |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `companyId=main` · emp mutate holding (`2b4cbc90-fb74-4a2d-9fef-d188d4e48d61`) |
| **Honesty** | `hrm_personnel_uat_ready=false` · `contracts_printable_ready=false` · `recruitment_uat_ready=false` · `jd_dynamic_done=false` · **C-SLICE-≠-MODULE** · U65 zero-seed |
| **depends_on** | BE-02 READY · FE-02 READY · prior FAIL `CORE05QA-MSLGFOXU` · P0 **R-CORE-05-EMPTY-DATE-500** CLOSED |
| **env** | portal `:5173` · hrm-api `:28001` (**rebuild+restart** BE-02 empty-date coerce LIVE) · xbos `:28002` · commit `dc930c5` |
| **runner** | `scripts/qa/_tmp-po-hrm-mvp-gd1-core-05-cluster-qa-02.mjs` |
| **raw JSON** | `docs/qa/evidence/_tmp-po-hrm-mvp-gd1-core-05-cluster-qa-02.json` |
| **screens** | `docs/qa/evidence/screens/po-hrm-mvp-gd1-core-05-cluster-qa-02/` |

---

## Verdict

| Gate | Result |
|------|--------|
| **Overall** | **PASS** · `PASS_TO_PM` · **C-SLICE** · **DENY** CRUD=CORE-05 DONE · **DENY** invent CORE-06/07 / printable / personnel DONE |
| **L0** | hrm/xbos/portal **200** |
| **L2.5 J-*** | **J-HRM-CORE-05-01..05 ALL PASS** |
| **P0 prior** | **R-CORE-05-EMPTY-DATE-500** **CLOSED** — blank dates POST **201** (not 500); Network body **omits** `assignedDate`/`returnDate` `""` |
| **Physical Network** | `/employees/:id/assets*` hits **24** |
| **Nest `/core` AST SoT** | probe **404** · **non-404 SoT hits = 0** |
| **Seed** | **none** |

---

## Spec / seal cite

| Artifact | Cite |
|----------|------|
| BA-01 | AC-CORE-05-* · J-HRM-CORE-05-01..05 |
| API-01 | F-CORE-AST-01 RETAIN · F-CORE-AST-BB-01 · serial 409 · DELETE-FORBIDDEN |
| FE-02 | `docs/qa/evidence/po-hrm-mvp-gd1-core-05-cluster-fe-02.md` READY — omit blank dates |
| BE-02 | `docs/qa/evidence/po-hrm-mvp-gd1-core-05-cluster-be-02.md` READY — coerce `""`→null |
| QA-01 FAIL | stamp **`CORE05QA-MSLGFOXU`** superseded by this retest |
| CORE-03 QC | **`CORE03QC1-MSLFJH0K`** RETAIN |
| CORE-02b QC | **`CORE02BQC1-MSLEFQC1`** RETAIN |
| CORE-09d..01 | peer stamps RETAIN · not reopened |
| EMP PLAT / TOK | **`EMPPLATQA-MSIZXHIM`** · **`EMPTOKQA-MSJ290VB`** RETAIN |

**Dist LIVE:** `assetDateFields` empty-date coerce · SERIAL-CONFLICT · DELETE-FORBIDDEN · `handover_confirmed_at` · Nest `@Controller('core')` AST **ABSENT**.  
**FE LIVE:** `buildAssetWritePayload` omit blank dates · BB CTA · serial toast · soft thu hồi · physical `/employees/:id/assets*`.

---

## Browser U65 — journeys

Persona: portal auth inject · Profile **`/hr/employees/{id}?tab=assets`** · **zero-seed** · leave assigned/return dates blank.

**hdsd_align:** Hồ sơ NV → tab **Tài sản** · **Thêm cấp phát** · **Xác nhận nhận** · **Thu hồi (đổi trạng thái)** · hooks `hdsd-emp-assets*`.

| J-* | Click path / assert | Network / FE | Verdict |
|-----|---------------------|--------------|---------|
| **J-HRM-CORE-05-01** | Thêm cấp phát (dates blank) → Lưu → F5 | POST **201** · body **omits** blank dates · row `assigned` + `statusLabelVi=Đang sử dụng` · Nest `/core` **0** | **PASS** |
| **J-HRM-CORE-05-02** | notes-only PATCH → still unconfirmed; **Xác nhận nhận** → F5 | notes PATCH **200** ≠ BB; confirm PATCH **200** · `handoverConfirmed=true` · `handoverDocId=id` | **PASS** |
| **J-HRM-CORE-05-03** | Thêm lại cùng serial → Lưu | POST **409** · toast serial conflict VI · `assignedSameSerial=1` | **PASS** |
| **J-HRM-CORE-05-04** | DELETE issued → soft **Thu hồi** → F5 | DELETE **409** `HRM-EMP-ASSET-DELETE-FORBIDDEN` · soft PATCH **200** · F5 `returned` / `Đã thu hồi` | **PASS** |
| **J-HRM-CORE-05-05** | Nest deny · seals · honesty | nest404 · sot=0 · physical>0 · seals cited · dist+FE LIVE · honesty false · C-SLICE | **PASS** |

Asset under test: `0ccc9a5b-5d87-4253-95c3-36ef646917d3` (`TS CORE-05 QA2 …` / serial `SN-C05-…-A`).

Screens: `01-assets-tab` … `09-done`.

---

## AC map

| AC | Result |
|----|--------|
| **AC-CORE-05-01** create 201 + assigned + statusLabelVi F5 | **PASS** |
| **AC-CORE-05-04** BB confirm + handoverDocId=id | **PASS** |
| **AC-CORE-05-05** notes-only ≠ BB | **PASS** |
| **AC-CORE-05-07** serial 409 + toast | **PASS** |
| **AC-CORE-05-08** soft status / DELETE-FORBIDDEN | **PASS** |
| **Nest `/core` DENY** | **PASS** |
| **must_keep** CORE-03/02b/09d..01 | **PASS** cite · not reopened |
| **Honesty / C-SLICE** | **PASS** (false · no flip) |

---

## Residuals

| ID | Sev | Owner | Note |
|----|-----|-------|------|
| **R-CORE-05-HONESTY** | INFO | QC | C-SLICE · personnel/printable/CORE module UAT **false** · CRUD ≠ CORE-05 DONE · CORE-06/07 OUT invent DONE |
| **R-CORE-05-EMPTY-DATE-500** | — | — | **CLOSED** this seat |

**Probe note (not product defect):** first runner pass used mutate probes without `?company_id=` → `HRM-VAL-001` false FAIL on J-02..04 while FE outcomes already green; runner fixed (query company_id + tighter Network capture) → retest **PASS**.

---

## Honesty footer

```text
recruitment_uat_ready=false
jd_dynamic_done=false
contracts_printable_ready=false
hrm_personnel_uat_ready=false
personnel / CORE / CTR module UAT = false
C-SLICE ≠ module CORE UAT
U65 zero-seed · Nest /core AST dual DENY
DENY invent CORE-06/07 / printable / closed-8 DONE
DENY claim CRUD slice = CORE-05 DONE
```

---

## Completion contract

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** |
| **next_owner** | **qc** |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-core-05-cluster-qa-02.md` |
| **completion_report** | J-01..05 **PASS** U65. P0 empty-date **CLOSED** (POST 201 · omit `""`). BB confirm + handoverDocId=id · notes≠BB · serial 409 toast · DELETE-FORBIDDEN · soft returned · Nest `/core` 0 · seals RETAIN · honesty false · C-SLICE · **DENY** CORE-05/06/07 DONE. |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-CORE-05-CLUSTER-QC-01
lane: governance · qc
program: PO-HRM-MVP-GD1-CONTINUOUS (U89)
uc_ids: UC-BP-CORE-05
depends_on: QA-02 PASS_TO_PM — docs/qa/evidence/po-hrm-mvp-gd1-core-05-cluster-qa-02.md · stamp CORE05QA2-MSLGSWSF · prior FAIL CORE05QA-MSLGFOXU CLOSED
entry_criteria: L0; U65 browser evidence J-HRM-CORE-05-01..05 PASS; honesty false; C-SLICE
MISSION: Gate CORE-05 slice — audit QA-02 evidence (blank-date 201 + omit ""; BB handoverDocId=id; serial 409; DELETE-FORBIDDEN; Nest /core 0; seals CORE-03/02b/09d..01 RETAIN). GO WITH CONDITIONS only: honesty false · C-SLICE ≠ module DONE · DENY invent CORE-06/07 · DENY claim CORE-05 DONE · DENY reopen sealed J-*. Residual INFO R-CORE-05-HONESTY. After seal → PM continuous: SA/BA next vertical (CORE-06 QUEUED) per U88 — not idle.
exit: docs/qa/evidence/po-hrm-mvp-gd1-core-05-cluster-qc-01.md · GO | GWC | NO-GO
cấm: seed · honesty flip · claim module/personnel/printable DONE · Nest /core SoT
```

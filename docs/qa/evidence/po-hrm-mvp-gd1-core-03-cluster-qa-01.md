# Evidence — PO-HRM-MVP-GD1-CORE-03-CLUSTER-QA-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-CORE-03-CLUSTER-QA-01` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89 · UC-BP-CORE-03) |
| **lane** | execution · **qa** |
| **Date** | 2026-08-09 |
| **stamp** | `CORE03QA-MSLFGIQ4` |
| **ack_status** | **PASS_TO_PM** |
| **overall** | **PASS** |
| **uc_ids** | `UC-BP-CORE-03` |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `companyId=main` · employees mutate `holding` |
| **Honesty** | `hrm_personnel_uat_ready=false` · `contracts_printable_ready=false` · `recruitment_uat_ready=false` · `jd_dynamic_done=false` · **C-SLICE-≠-MODULE** · U65 zero-seed |
| **depends_on** | FE-01 READY · BE-01 READY · API-01 CONFIRMED · BA O1–O12 · seals `EMPPLATQA-MSIZXHIM` · `EMPTOKQA-MSJ290VB` · peers `CORE02BQC1-MSLEFQC1` / `CORE09DQC1-MSLDR8I3` … |
| **env** | portal `:5173` · hrm-api `:28001` (rebuild+restart seal LIVE) · xbos `:28002` · commit `dc930c5` |
| **runner** | `scripts/qa/_tmp-po-hrm-mvp-gd1-core-03-cluster-qa-01.mjs` |
| **raw JSON** | `docs/qa/evidence/_tmp-po-hrm-mvp-gd1-core-03-cluster-qa-01.json` |
| **screens** | `docs/qa/evidence/screens/po-hrm-mvp-gd1-core-03-cluster-qa-01/` |

---

## Verdict

| Gate | Result |
|------|--------|
| **Overall** | **PASS** · `PASS_TO_PM` · **C-SLICE** · **DENY** CORE-07 / personnel / printable DONE · **DENY** EMP DOC L1 = CORE-03 DONE |
| **L0** | hrm/xbos/portal **200** |
| **L2.5 J-*** | **J-HRM-CORE-03-01..05 PASS** |
| **Physical Network** | `/document-types*` (16) · `/employment-types*` (6) · `/document-checklist*` (15) |
| **Nest `/core` CHK/DOC SoT** | probe **404** `Cannot GET` · **non-404 SoT hits = 0** |
| **Empty OK** | GET checklist `HRM-CORE-CHK-200` total=0 · UI empty before mutate |
| **Cite seals** | EMPPLAT · EMPTOK · CORE-02b · CORE-09d..01 **RETAIN · not reopened** |
| **Seed** | **none** |

---

## Spec / seal cite

| Artifact | Cite |
|----------|------|
| BA-01 | `docs/program/specs/PO-HRM-MVP-GD1-CORE-03-CLUSTER-BA-01.md` · AC-CORE-03-* · J-HRM-CORE-03-01..05 |
| API-01 | F-CORE-CHK-01 ADD · DOC/ET RETAIN |
| FE-01 | `docs/qa/evidence/po-hrm-mvp-gd1-core-03-cluster-fe-01.md` READY_FOR_QA |
| BE-01 | `docs/qa/evidence/po-hrm-mvp-gd1-core-03-cluster-be-01.md` READY_FOR_QA |
| EMP DOC L1 | **`EMPPLATQA-MSIZXHIM`** RETAIN · **≠** CORE-03/personnel DONE |
| EMP TOK | **`EMPTOKQA-MSJ290VB`** RETAIN |
| CORE-02b QC | **`CORE02BQC1-MSLEFQC1`** must_keep |
| CORE-09d QC | **`CORE09DQC1-MSLDR8I3`** must_keep · ≠ printable/closed-8 |

**Src/dist spot:** `emp-document-checklist.service` SRC+DIST present · Nest `@Controller('core')` CHK **ABSENT** · Nest `emp_position` / `emp_custom_field` **ABSENT**.

**FE spot:** `EmployeeDocumentChecklist` · Profile `?tab=documents` · physical `/document-checklist*` · Settings DOC/ET RETAIN · invent toast map `HRM-EMP-DOC-TYPE-UNKNOWN`.

**LIVE seal note:** Entry DIST missing checklist → QA rebuild `tsc` + restart `:28001` before browser (same class as prior CORE waves).

---

## L0 / L1 seal

| Check | Evidence |
|-------|----------|
| Portal / HRM / XBOS | **200** |
| GET `…/employees/:id/document-checklist` empty | **200** `HRM-CORE-CHK-200` total=0 |
| GET Nest `/core/…/document-checklist` | **404** DENY dual |
| GET Nest `/core/…/document-types` | **404** DENY dual |
| POST invent unknown KEY | **400** `HRM-EMP-DOC-TYPE-UNKNOWN` |

---

## Browser U65 — journeys

Persona: portal auth inject · Settings `/hr/settings` · Profile **`/hr/employees/{id}?tab=documents`** (command-center shell did not mount checklist panel) · **zero-seed**.

**hdsd_align:** Cài đặt → Loại giấy tờ EMP / Loại hình thuê EMP · Hồ sơ NV → Career → Giấy tờ · Thêm dòng → Nộp → Xác nhận · soft-retire DOC.

| J-* | Click path / assert | Network / FE | Verdict |
|-----|---------------------|--------------|---------|
| **J-HRM-CORE-03-01** | Settings DOC · CREATE N+1 + flags → F5 | PUT `/employees/document-types` **200** `HRM-EMP-DOC-200` · key `hr_doc_c03_mslfgiq4` · requiredByDefault+blocksActivation · F5 row · Nest `/core` **0** · cite EMPPLAT | **PASS** |
| **J-HRM-CORE-03-02** | Settings ET CREATE · TOK smoke | PUT `/employment-types` **200** · TOK `emp.doc.hr_doc_c03_mslfgiq4` origin=`emp_catalog` · cite **`EMPTOKQA-MSJ290VB`** | **PASS** |
| **J-HRM-CORE-03-03** | EFF>0 invent KEY | same-origin POST invent → **400** `HRM-EMP-DOC-TYPE-UNKNOWN` · F5 no row · picker free-text DENY (BR-HRM-MD-01) · FE toast map present | **PASS** |
| **J-HRM-CORE-03-04** | Profile Giấy tờ empty → Thêm dòng → Nộp → Xác nhận → F5 | POST checklist **201** `HRM-CORE-CHK-201` status=missing required=true · PATCH submit **200** → `submitted` · PATCH approve **200** → `approved` · F5 `approved` · Nest `/core` chk SoT **0** | **PASS** |
| **J-HRM-CORE-03-05** | Soft-retire DOC · history · honesty | POST retire **201** · history checklist still `approved` · effective hide · seals CORE-02b/09d..01 · honesty false · CORE-07 OUT | **PASS** |

Mutated samples (evidence only — **≠** personnel / CORE module UAT DONE):
- DOC: `hr_doc_c03_mslfgiq4` → soft-retired after J-05
- ET: `et_c03_mslfgiq4`
- TOK: `emp.doc.hr_doc_c03_mslfgiq4` (origin=`emp_catalog`)
- Checklist item: `b20227b9-1764-4af3-ab7f-28b7e9283de5` on emp `2b4cbc90-fb74-4a2d-9fef-d188d4e48d61` (`HIRE-HOLDIN-MSL5T540DDDE8E`)
- Invent reject: `zz_invent_c03_mslfgiq4`

Screens: `01-settings-doc` … `13-done`.

---

## AC map (smoke)

| AC | Result |
|----|--------|
| **AC-CORE-03-01/02** DOC CREATE N+ flags F5 | **PASS** |
| **AC-CORE-03-03** TOK `emp.doc.*` | **PASS** + cite EMPTOK |
| **AC-CORE-03-04** ET CREATE | **PASS** |
| **AC-CORE-03-06/07** submit→approved F5 | **PASS** |
| **AC-CORE-03-08** invent UNKNOWN | **PASS** |
| **AC-CORE-03-07b** retire hide + history | **PASS** |
| **AC-CORE-03-09-OUT** CORE-07/OCR | **PASS** cite OUT invent DONE |
| **AC-CORE-03-MK-02B** CORE-02b must_keep | **PASS** cite `CORE02BQC1-MSLEFQC1` |
| **AC-CORE-03-H** honesty / Nest DENY | **PASS** |

---

## Residuals

| ID | Sev | Owner | Note |
|----|-----|-------|------|
| **R-CORE-03-HONESTY** | INFO | QC | C-SLICE · personnel/printable/CORE module UAT **false** · CORE-07 OUT invent DONE |
| **R-CORE-03-CC-EMBED-OBS** | P2 | PM / FE (optional) | `/command-center/hrm/employees?tab=documents` did not mount checklist; `/hr/employees?tab=documents` PASS — cite for embed parity (≠ FAIL this seat) |

**No P0/P1** this seat.

**What worked (must not regress):** physical `/employees/:id/document-checklist*` + `/document-types*` + `/employment-types*` · empty OK · invent UNKNOWN · Nộp→submitted · Xác nhận→approved · retire hide + history · Nest `/core` DENY · DOC/ET/TOK RETAIN · C-SLICE honesty false.

---

## Honesty footer

```text
recruitment_uat_ready=false
jd_dynamic_done=false
contracts_printable_ready=false
hrm_personnel_uat_ready=false
personnel / CORE / CTR module UAT = false
C-SLICE ≠ module CORE UAT
U65 zero-seed · empty checklist OK
Nest /core CHK dual DENY · FE invent DOC SoT DENY · CORE-07 / printable DONE DENY
EMP DOC L1 ≠ CORE-03 DONE · CORE-02b ≠ EMPCF DONE · CORE-09d ≠ printable/closed-8
```

---

## Completion contract

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** |
| **next_owner** | **qc** |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-core-03-cluster-qa-01.md` |
| **completion_report** | J-HRM-CORE-03-01..05 **PASS** · Network physical checklist+DOC+ET · Nest `/core` SoT **0** · invent UNKNOWN · submit→approved · retire+history · seals RETAIN · honesty false · C-SLICE · DENY CORE-07/personnel/printable DONE |
| **next_dispatch_prompt** | see below |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-CORE-03-CLUSTER-QC-01
lane: governance · qc
program: PO-HRM-MVP-GD1-CONTINUOUS (U89)
uc_ids: UC-BP-CORE-03
entry_criteria: QA-01 PASS_TO_PM @ docs/qa/evidence/po-hrm-mvp-gd1-core-03-cluster-qa-01.md · stamp CORE03QA-MSLFGIQ4 · J-01..05 PASS · U65 zero-seed
exit_criteria: GWC or GO WITH CONDITIONS · C-SLICE honesty false · DENY claim CORE-07/personnel/printable DONE · DENY EMP DOC L1=CORE-03 DONE · must_keep CORE-02b/09d..01 · Nest /core DENY · residual R-CORE-03-CC-EMBED-OBS P2 optional · PASS_TO_PM
evidence_path: docs/qa/evidence/po-hrm-mvp-gd1-core-03-cluster-qc-01.md
cấm: seed · honesty flip · reopen sealed peers · invent module UAT DONE
```

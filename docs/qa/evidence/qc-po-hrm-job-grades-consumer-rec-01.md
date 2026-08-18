# Evidence — QC-PO-HRM-JOB-GRADES-CONSUMER-REC-01

| Field | Value |
|-------|--------|
| **work_item_id** | `QC-PO-HRM-JOB-GRADES-CONSUMER-REC-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-11 |
| **lane** | governance — **narrow C-SLICE** · **AC-SET-CONSUMER-JG-REC-01** only |
| **qa_ref** | [`qa-po-hrm-job-grades-consumer-rec-01.md`](qa-po-hrm-job-grades-consumer-rec-01.md) · stamp **`JGRECQA-MSNP1AX8`** |
| **dev_ref** | [`po-hrm-job-grades-consumer-rec-fe-01.md`](po-hrm-job-grades-consumer-rec-fe-01.md) · [`po-hrm-job-grades-consumer-rec-be-01.md`](po-hrm-job-grades-consumer-rec-be-01.md) |
| **ba_ref** | [`docs/program/specs/BA-HRM-JOB-GRADES-CONSUMER-REC-01.md`](../../program/specs/BA-HRM-JOB-GRADES-CONSUMER-REC-01.md) |
| **Verdict** | **GO WITH CONDITIONS** |
| **ack_status** | **PASS_TO_PM** |
| **stamp** | **`JGRECQC1-MSNP1AXQC1`** · annotates **`JGRECQA-MSNP1AX8`** |
| **portal_url** | `http://127.0.0.1:5173` · Command Center HRM embed · hrm-api `:28001` |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` |
| **U65** | zero-seed browser · no `pnpm seed:*` |
| **OS honesty** | `settings_catalog_e2e_ready` **DENY** · `C-SLICE-≠-MODULE` |

---

## Verdict summary

**GO WITH CONDITIONS** — **ACCEPT** independent QA stamp **`JGRECQA-MSNP1AX8`** on **narrow scope only**:

1. **AC-SET-CONSUMER-JG-REC-01 CREATE** — Tuyển dụng → Yêu cầu tuyển → **Tạo** → `hdsd-requisition-job-grade` → chọn catalog code `gqanow4ip` → **POST** `/api/hrm/recruitment/requisitions` **201** · body `job_grade_key` khớp code.
2. **F5 list + detail label** — `yctd-grade-label-*` + `yctd-detail-job-grade` resolve via `resolveJobGradeLabel` («QA Ngạch JGRECQA-MSNOW4IP»).
3. **L0 + unit** — `pnpm run qc:fe-be-health` exit **0** · vitest **4/4** · jest **3/3** (cite QA/Dev).

**CONDITION (carry):** **PATCH edit** leg **NOT CLOSED** — pilot catalog **EFF=1** only (`gqanow4ip`); QA correctly defers PATCH retest until **≥2** effective `job_grades` codes (non-blocking for CREATE+F5 GWC).

**NOT** full **UF-HRM-10** PASS · **NOT** Settings catalog module UAT · **NOT** Phase 1 DONE · **NOT** `recruitment_uat_ready` flip.

Audited: QA MD · runtime JSON · FE/BE handoffs · BA AC · Classification · parent **`RECCHQC1`** RETAIN.

---

## Honesty locks (mandatory)

| Flag / claim | Value | QC |
|--------------|-------|-----|
| **`settings_catalog_e2e_ready` / Settings module UAT** | **DENY** flip | one §6.2 consumer leg only |
| **Full UF-HRM-10 matrix promote** | **DENIED** | narrow `job_grades` → YCTD |
| **Reopen `RECCHQC1-MSNKIJ5QC1`** (recruitment_channels) | **DENIED** | QA honesty `must_keep RECCHQC1` · optional REC-CH regression not run — **not** a reopen |
| **Seed** | **DENIED** (U65) | EFF=1 from settings catalog on env |
| **`C-SLICE-≠-MODULE`** | **RETAIN** | narrow GWC |

### PM promote decision (explicit)

| Question | Answer |
|----------|--------|
| May PM set `settings_catalog_e2e_ready=true`? | **NO** |
| May PM claim UF-HRM-10 full / Settings catalog UAT DONE? | **NO** |
| May PM annotate **AC-SET-CONSUMER-JG-REC-01** **CLOSED** (CREATE+F5) with `JGRECQA-MSNP1AX8` + **`JGRECQC1-MSNP1AXQC1`**? | **YES** |
| May PM claim PATCH edit leg CLOSED without EFF≥2 retest? | **NO** — carry OPEN |

---

## Classification

| Signal | Class | Disposition |
|--------|-------|-------------|
| POST 201 + `job_grade_key` body | PRODUCT mutate | **ACCEPT** |
| F5 list + detail label | PRODUCT L2.5 / UF narrow | **ACCEPT** |
| BE assert `HRM-REC-GRADE-KEY` · jest 3/3 | PRODUCT L1 | **ACCEPT** cite |
| FE picker + vitest 4/4 | PRODUCT L1 | **ACCEPT** cite |
| PATCH edit (EFF≥2) | PRODUCT alternate | **CARRY** · blocked by EFF=1 env |
| REC-CH / dept regression | PRODUCT regression | **NOT_RUN** · time-box · non-blocking if RECCHQC1 RETAIN |
| QA pack verify **6/8** (`journey_l25` · `residual_section`) | PROCESS | **OBS** · QC SoT **8/8** below · optional QA append |
| Honesty / seed / module UAT | GOVERNANCE | **LOCKED DENY** |

---

## Command table (verify)

| Command | Result |
|---------|--------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qa-po-hrm-job-grades-consumer-rec-01.md` | exit **1** · **6/8** · gaps: `journey_l25` · `residual_section` |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qc-po-hrm-job-grades-consumer-rec-01.md` | exit **0** · **8/8 PASS** |
| QA L0 `pnpm run qc:fe-be-health` (cite QA) | **PASS** exit **0** |
| Harness `scripts/qa/_tmp-qa-po-hrm-job-grades-consumer-rec-01.mjs` | cite JSON **`JGRECQA-MSNP1AX8`** · commit `dc930c5` |
| Raw JSON | `docs/qa/evidence/_tmp-qa-po-hrm-job-grades-consumer-rec-01.json` |

### Pack consolidation (8/8 — QC SoT)

| # | Check | Status |
|---|--------|--------|
| 1 | work_item_id | ✅ |
| 2 | ack_status | ✅ `PASS_TO_PM` |
| 3 | command_table | ✅ above |
| 4 | portal_url | ✅ `:5173` · `:28001` |
| 5 | journey_l25 | ✅ UF-HRM-10 narrow + J-HRM-05 (see table) |
| 6 | crud_or_matrix | ✅ AC-SET-CONSUMER-JG-REC-01 matrix |
| 7 | residual_section | ✅ below |
| 8 | timestamp | ✅ 2026-08-11 |

---

## Conditions (GWC)

1. **Honesty:** **DENY** `settings_catalog_e2e_ready` · **DENY** full UF-HRM-10 · **DENY** Phase 1 · seed.
2. **Parent RETAIN:** **`RECCHQC1-MSNKIJ5QC1`** · Settings family seals (`SETFIDQC1` · `ETCTRQC1` · `WHPOSQC1` · `DEPTCONREG1` · …) — **not reopened** by this seat.
3. **CLOSED (this seat):** **AC-SET-CONSUMER-JG-REC-01** **CREATE** + **F5** list/detail label after **`JGRECQA-MSNP1AX8`**.
4. **OPEN (carry):** **PATCH** `job_grade_key` on **Sửa** YCTD when catalog has **≥2** effective codes — owner **qa** on next env with EFF≥2 (or FE creates second grade via Settings U65 path).
5. **PROCESS (optional):** QA append `## Residual` + explicit **J-*** / UF row to QA MD for pack verify **8/8** — does not block slice GWC.

---

## J-* / UF (U19)

| ID | Verdict | Notes |
|----|---------|-------|
| **UF-HRM-10** (narrow — `job_grades` → YCTD `job_grade_key`) | **PASS** | FR-HRM-SC-GRADE-01 · BA AC-SET-CONSUMER-JG-REC-01 · browser POST + F5 |
| **J-HRM-05** (recruitment → requisition row + detail) | **PASS** narrow | create YCTD → row + detail grade label · **≠** full REC module UAT |
| **J-HRM-JD-YCTD-01** | **NOT RE-TESTED** | JD leg RETAIN · grade field additive only |
| **UF-HRM-10** (full consumer matrix) | **NOT PROMOTED** | §6.2 legs (`pay_types`, …) OPEN |
| Settings module UAT | **DENIED** | C-SLICE |

**Screens (cite QA):** `docs/qa/evidence/screens/qa-po-hrm-job-grades-consumer-rec-01/`

---

## CRUD / AC matrix (narrow)

| AC / step | Verdict | Evidence |
|-----------|---------|----------|
| EFF>0 catalog (`job_grades`) | **PASS** | `gqanow4ip` · JSON `effBefore: 1` |
| CREATE POST `job_grade_key` = code | **PASS** | 201 · QA Network excerpt |
| F5 list label `yctd-grade-label-*` | **PASS** | QA row id + label |
| F5 detail `yctd-detail-job-grade` | **PASS** | resolved label |
| PATCH edit grade (EFF≥2) | **CARRY** | EFF=1 only · QA 🟡 |
| REC channels consumer regression | **NOT_RUN** | optional · **RECCHQC1** RETAIN |

---

## Residual

| ID | Sev | Status | Owner |
|----|-----|--------|-------|
| **PATCH** YCTD `job_grade_key` when EFF≥2 | P2 | **OPEN** · carry | qa — when ≥2 codes in catalog |
| **UF-HRM-10** full matrix | INFO | OPEN | pm / ba-process — §6.2 NEXT (`pay_types` per BA) |
| **Settings catalog UAT** | INFO | `settings_catalog_e2e_ready` DENY | pm |
| REC-CH / dept optional regression | P3 | NOT_RUN | qa — time-box |
| QA pack 6/8 on QA MD | PROCESS | OBS | qa — optional append |

**No residual PRODUCT P0** blocking CREATE+F5 narrow GWC.

---

## must_keep RETAIN (explicit)

| Stamp | Note |
|-------|------|
| **`RECCHQC1-MSNKIJ5QC1`** | recruitment_channels consumer · **DENY reopen** |
| **`settings_catalog_e2e_ready=false`** | GOVERNANCE lock |
| Sealed siblings | `ETCTRQC1` · `WHPOSQC1` · `DEPTCONREG1` · `QACONPAYSTQC1` · ATT/SETFID family — unchanged |

---

## Completion contract

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** |
| **next_owner** | **pm** → matrix annotate **AC-SET-CONSUMER-JG-REC-01** CREATE+F5 **CLOSED** · bus seal · U88 **`ba-process`** / **`sa`** for §6.2 NEXT (`pay_types` per BA residual) |
| **evidence_path** | `docs/qa/evidence/qc-po-hrm-job-grades-consumer-rec-01.md` |
| **completion_report** | **GWC** after **`JGRECQA-MSNP1AX8`**: **AC-SET-CONSUMER-JG-REC-01** CREATE + F5 **ACCEPT** · PATCH **CARRY** (EFF=1) · **DENY** UF-HRM-10 full · **DENY** `settings_catalog_e2e_ready` · **`RECCHQC1` RETAIN** · stamp **`JGRECQC1-MSNP1AXQC1`**. QA pack **6/8 OBS**; QC SoT **8/8**. |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-SETTINGS-CONSUMER-MATRIX-PM-05
lane: governance · pm
read_first:
  - docs/qa/evidence/qc-po-hrm-job-grades-consumer-rec-01.md
  - docs/program/specs/BA-HRM-JOB-GRADES-CONSUMER-REC-01.md
  - docs/program/specs/PO-HRM-SETTINGS-SRS-FIDELITY-DELTA-01.md §6.2
depends_on: JGRECQC1-MSNP1AXQC1 · JGRECQA-MSNP1AX8 · RETAIN RECCHQC1-MSNKIJ5QC1 · settings_catalog_e2e_ready DENY
entry_criteria: QC narrow GWC PASS_TO_PM on AC-SET-CONSUMER-JG-REC-01 CREATE+F5 only
exit_criteria: PM update consumer matrix row job_grades→YCTD CLOSED (CREATE+F5) · bus seal JGRECQC1 · TEAM_WORKING_NOW · dispatch ba-process GOV-HRM-SETTINGS-CONSUMER-MATRIX-NEXT-05 pay_types Payroll leg OR qa carry PATCH when EFF≥2 · optional qa append journey_l25 to QA MD
cấm: flip settings_catalog_e2e_ready · claim UF-HRM-10 full UAT DONE · seed · reopen RECCHQC1
```

---

## stamp

`JGRECQC1-MSNP1AXQC1` · 2026-08-11 · **AC-SET-CONSUMER-JG-REC-01** **GWC** · QA **`JGRECQA-MSNP1AX8`** · **≠** UF-HRM-10 full · **≠** Settings catalog UAT · `settings_catalog_e2e_ready` **DENY** · **RETAIN** **RECCHQC1-MSNKIJ5QC1** · PATCH edit **CARRY** (EFF=1)

# Evidence — QC-PO-HRM-EMPLOYMENT-TYPES-CONSUMER-CTR-01-NARROW-01

| Field | Value |
|-------|--------|
| **work_item_id** | `QC-PO-HRM-EMPLOYMENT-TYPES-CONSUMER-CTR-01-NARROW-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-11 |
| **lane** | governance — **narrow C-SLICE** · **AC-SET-CONSUMER-ET-CTR-01** only |
| **qa_ref** | [`qa-po-hrm-employment-types-consumer-ctr-01.md`](qa-po-hrm-employment-types-consumer-ctr-01.md) · **RETEST-04** · stamp **`ETCTRQA1-MSNNRUZQ`** · regression **`QACONPAYST1-MSNNSHOZ`** |
| **dev_ref** | [`po-hrm-employment-types-consumer-ctr-fe-03.md`](po-hrm-employment-types-consumer-ctr-fe-03.md) · [`po-hrm-employment-types-consumer-ctr-be-01.md`](po-hrm-employment-types-consumer-ctr-be-01.md) |
| **ba_ref** | [`docs/program/specs/BA-HRM-EMPLOYMENT-TYPES-CONSUMER-CTR-01.md`](../../program/specs/BA-HRM-EMPLOYMENT-TYPES-CONSUMER-CTR-01.md) |
| **Verdict** | **GO WITH CONDITIONS** |
| **ack_status** | **PASS_TO_PM** |
| **stamp** | **`ETCTRQC1-MSNNRUQC1`** · annotates **`ETCTRQA1-MSNNRUZQ`** |
| **portal_url** | `http://127.0.0.1:5173` · `command-center/hrm/contracts` · hrm-api `:28001` |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `companyId=main` |
| **U65** | zero-seed browser · no `pnpm seed:*` |
| **OS honesty** | `settings_catalog_e2e_ready` **DENY** · `C-SLICE-≠-MODULE` |

---

## Verdict summary

**GO WITH CONDITIONS** — **ACCEPT** independent QA stamp **`ETCTRQA1-MSNNRUZQ`** on **narrow scope only**:

1. **AC-SET-CONSUMER-ET-CTR-01** — Contracts **Hình thức làm việc** (`work_arrangement`) picker parity **15=15** with GET `/employees/employment-types/effective` · no hardcoded remote/hybrid enum (vitest + harness).
2. **U65 mutate** — NV001-HD **Sửa** → `ctr-create-work-arrangement` → **PATCH 200** · body `work_arrangement=fidmzgc71emp` · **F5** label OK (FE-03 contract_type hydrate closes RETEST-03 `HRM-CON-TYPE-KEY`).
3. **Regression** — dept + contract_type consumer legs **`QACONPAYST1-MSNNSHOZ`** (aligns **`QACONPAYSTQC1`** baseline).

**NOT** full **UF-HRM-10** PASS · **NOT** Settings catalog module UAT · **NOT** Phase 1 DONE.

Audited: QA MD · harness JSON · screens · FE-03 / BE-01 handoffs · Classification · parent seal RETAIN list.

---

## Honesty locks (mandatory)

| Flag / claim | Value | QC |
|--------------|-------|-----|
| **`settings_catalog_e2e_ready` / Settings module UAT** | **DENY** flip | employment_types leg ≠ full UF-HRM-10 |
| **Full UF-HRM-10 matrix promote** | **DENIED** | one consumer leg only |
| **Reopen `QACONPAYSTQC1` · `RECCHQC1` · `WHPOSQC1` · `DEPTCONREG1`** | **DENIED** | regression confirms dept/type unchanged |
| **Seed** | **DENIED** (U65) | pilot EFF=15 on env |
| **`C-SLICE-≠-MODULE`** | **RETAIN** | narrow GWC |

### PM promote decision (explicit)

| Question | Answer |
|----------|--------|
| May PM set `settings_catalog_e2e_ready=true`? | **NO** |
| May PM claim UF-HRM-10 full / Settings catalog UAT DONE? | **NO** |
| May PM annotate **AC-SET-CONSUMER-ET-CTR-01** **CLOSED** with `ETCTRQA1-MSNNRUZQ` + **`ETCTRQC1-MSNNRUQC1`**? | **YES** |
| May PM extend UF-HRM-10 🟢 beyond this leg? | **NO** |

---

## Classification

| Signal | Class | Disposition |
|--------|-------|-------------|
| Picker parity 15 EMP codes | PRODUCT L2.5 | **ACCEPT** |
| NV001-HD PATCH 200 + F5 label | PRODUCT mutate | **ACCEPT** |
| BE jest 4/4 · FE vitest 50/50 | PRODUCT L1 | **ACCEPT** cite |
| **EFF=0** empty + CTA browser | PRODUCT alternate | **DEFER** · NOT_RUN (pilot EFF=15) · vitest wiring cited |
| QA pack verify 6/8 (journey_l25 · crud_or_matrix) | PROCESS | **OBS** · QC SoT 8/8 below · optional QA append |
| Honesty / seed / module UAT | GOVERNANCE | **LOCKED DENY** |

---

## Command table (verify)

| Command | Result |
|---------|--------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qa-po-hrm-employment-types-consumer-ctr-01.md` | exit **1** · **6/8** · gaps: `journey_l25` · `crud_or_matrix` |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qc-po-hrm-employment-types-consumer-ctr-01.md` | exit **0** · **8/8 PASS** |
| QA L0 `qc:fe-be-health` (cite QA) | **PASS** exit 0 |
| Harness `scripts/qa/_tmp-qa-po-hrm-employment-types-consumer-ctr-01.mjs` | **exit 0** · **`ETCTRQA1-MSNNRUZQ`** |
| Mutate probe `…-mutate-probe.mjs` | **exit 0** |
| Regression `scripts/qa/_tmp-qa-hrm-settings-consumer-pay-stale-01.mjs` | **PASS** · **`QACONPAYST1-MSNNSHOZ`** |
| Raw JSON | `_tmp-qa-po-hrm-employment-types-consumer-ctr-01.json` · commit `dc930c5` |

### Pack consolidation (8/8 — QC SoT)

| # | Check | Status |
|---|--------|--------|
| 1 | work_item_id | ✅ |
| 2 | ack_status | ✅ `PASS_TO_PM` |
| 3 | command_table | ✅ above |
| 4 | portal_url | ✅ `:5173` · `:28001` |
| 5 | journey_l25 | ✅ **UF-HRM-10** narrow leg (see table) |
| 6 | crud_or_matrix | ✅ AC-SET-CONSUMER-ET-CTR-01 matrix |
| 7 | residual_section | ✅ below |
| 8 | timestamp | ✅ 2026-08-11 |

---

## Conditions (GWC)

1. **Honesty:** **DENY** `settings_catalog_e2e_ready` · **DENY** full UF-HRM-10 · **DENY** Phase 1 · seed.
2. **Parent RETAIN:** **`QACONPAYSTQC1-MSNG1JQC1`** · **`RECCHQC1-MSNKIJ5QC1`** · **`WHPOSQC1-MSNL78QC1`** · **`DEPTCONREG1`** · Settings family (`SETW3SWPQC1` · `SETFIDQC1` · …) — **not reopened**.
3. **CLOSED (this seat):** **AC-SET-CONSUMER-ET-CTR-01** parity + NV001-HD mutate + F5 after **`ETCTRQA1-MSNNRUZQ`**.
4. **DEFER (non-blocking):** **EFF=0** CTA browser — pilot EFF=15; re-test when tenant has zero effective employment types.
5. **PROCESS (optional):** QA append J-* + CRUD matrix to QA MD for pack verify 8/8 — does not block slice GWC.

---

## J-* / UF (U19)

| ID | Verdict | Notes |
|----|---------|-------|
| **UF-HRM-10** (narrow — `employment_types` → `work_arrangement`) | **PASS** | SRS §16.8 O4 · BA AC-SET-CONSUMER-ET-CTR-01 · harness + mutate |
| **UF-HRM-10** (full consumer matrix) | **NOT PROMOTED** | dept/type sealed under QACONPAYST; other §6.2 legs OPEN |
| Settings module UAT | **DENIED** | C-SLICE |
| **J-*** dedicated row | **N/A** | slice bound to UF-HRM-10 narrow leg + AC id |

**Screenshots (cite QA):** `screens/qa-po-hrm-employment-types-consumer-ctr-01/step1-pickers.png` · `after-registry-post.png` · `f5-edit-work-arrangement.png`

---

## CRUD / AC matrix (narrow)

| AC / step | Verdict | Evidence |
|-----------|---------|----------|
| Picker = effective API (EFF>0) | **PASS** | 15=15 · `parity_ok: true` |
| No invent remote/hybrid enum | **PASS** | vitest · `*emp` codes |
| PATCH `work_arrangement` catalog code | **PASS** | probe + JSON `post.work_arrangement` |
| PATCH 2xx + F5 label | **PASS** | `f5_label_ok` · `mutate_ok` |
| EFF=0 CTA | **NOT_RUN** | pilot EFF=15 |
| Regression dept + contract_type | **PASS** | `QACONPAYST1-MSNNSHOZ` |

---

## Residual

| ID | Sev | Status | Owner |
|----|-----|--------|-------|
| **EFF=0** CTA browser | P3 | NOT_RUN · defer | qa — when env EFF=0 |
| **UF-HRM-10** full matrix | INFO | OPEN | pm / ba — §6.2 vertical |
| **Settings catalog UAT** | INFO | `settings_catalog_e2e_ready` DENY | pm |
| QA pack 6/8 on QA MD | PROCESS | OBS | qa — optional append |

**No residual PRODUCT P0** blocking this narrow GWC.

---

## must_keep RETAIN (explicit)

| Stamp | Note |
|-------|------|
| **`QACONPAYSTQC1-MSNG1JQC1`** | dept + contract_type consumer · **DENY reopen** |
| **`RECCHQC1-MSNKIJ5QC1`** | recruitment_channels consumer |
| **`WHPOSQC1-MSNL78QC1`** | job_titles QTCT consumer |
| **`DEPTCONREG1`** | departments consumer registry |
| **`settings_catalog_e2e_ready=false`** | GOVERNANCE lock |

---

## Completion contract

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** |
| **next_owner** | **pm** → matrix annotate AC-SET-CONSUMER-ET-CTR-01 CLOSED · bus seal · U88 governance vertical kế |
| **evidence_path** | `docs/qa/evidence/qc-po-hrm-employment-types-consumer-ctr-01.md` |
| **completion_report** | GWC after **RETEST-04** **`ETCTRQA1-MSNNRUZQ`**: **AC-SET-CONSUMER-ET-CTR-01** parity + mutate **CLOSED** on slice · regression **`QACONPAYST1-MSNNSHOZ`** · **DENY** UF-HRM-10 full · **DENY** `settings_catalog_e2e_ready` · parent seals **RETAIN** · stamp **`ETCTRQC1-MSNNRUQC1`**. QA pack **6/8 OBS**; QC SoT **8/8**. |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-SETTINGS-CONSUMER-MATRIX-PM-02
lane: governance · pm
read_first: docs/qa/evidence/qc-po-hrm-employment-types-consumer-ctr-01.md · docs/program/specs/BA-HRM-EMPLOYMENT-TYPES-CONSUMER-CTR-01.md · docs/program/specs/PO-HRM-SETTINGS-SRS-FIDELITY-DELTA-01.md §6.2
depends_on: ETCTRQC1-MSNNRUQC1 · ETCTRQA1-MSNNRUZQ · RETAIN QACONPAYSTQC1+RECCHQC1+WHPOSQC1+DEPTCONREG1 · settings_catalog_e2e_ready DENY
entry_criteria: QC narrow GWC PASS_TO_PM on AC-SET-CONSUMER-ET-CTR-01 only
exit_criteria: PM update consumer matrix row employment_types→CTR work_arrangement CLOSED · bus seal · TEAM_WORKING_NOW · optional qa append journey_l25 to QA MD for pack 8/8 · dispatch ba-process or sa for remaining §6.2 consumer legs per U88
cấm: flip settings_catalog_e2e_ready · claim UF-HRM-10 full UAT DONE · seed · reopen QACONPAYSTQC1/RECCHQC1/WHPOSQC1/DEPTCONREG1
```

---

## stamp

`ETCTRQC1-MSNNRUQC1` · 2026-08-11 · **AC-SET-CONSUMER-ET-CTR-01** **GWC** · QA **`ETCTRQA1-MSNNRUZQ`** · **≠** UF-HRM-10 full · **≠** Settings catalog UAT · `settings_catalog_e2e_ready` **DENY** · **RETAIN** QACONPAYSTQC1 + RECCHQC1 + WHPOSQC1 + DEPTCONREG1 · EFF=0 CTA **NOT_RUN** (non-blocking)

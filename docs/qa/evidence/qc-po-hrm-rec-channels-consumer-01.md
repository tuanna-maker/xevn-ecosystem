# Evidence — PO-HRM-REC-CHANNELS-CONSUMER-QC-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-REC-CHANNELS-CONSUMER-QC-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-11 |
| **lane** | governance — **narrow C-SLICE** · `recruitment_channels` consumer **AC-REC-01..03** + **AC-REC-02** (filter) only |
| **qa_ref** | [`qa-po-hrm-rec-channels-consumer-01.md`](qa-po-hrm-rec-channels-consumer-01.md) · retest **#4** `RECCHQA-MSNK95YR` · retest **#5** `RECCHQA-MSNKIJ5R` · **PASS_TO_PM** |
| **fe_ref** | [`po-hrm-rec-channels-consumer-fe-01.md`](po-hrm-rec-channels-consumer-fe-01.md) · [`po-hrm-rec-channels-consumer-ac-rec-02-fe-01.md`](po-hrm-rec-channels-consumer-ac-rec-02-fe-01.md) |
| **prechain_ref** | [`po-hrm-rec-yctd-create-blocker-fe-01.md`](po-hrm-rec-yctd-create-blocker-fe-01.md) · [`po-hrm-rec-yctd-wf-inbox-bridge-be-01.md`](po-hrm-rec-yctd-wf-inbox-bridge-be-01.md) · [`po-hrm-rec-yctd-bod-open-for-hire-be-01.md`](po-hrm-rec-yctd-bod-open-for-hire-be-01.md) — **RETAIN sealed · not reopened** |
| **settings_parents** | **RETAIN** `DEPTCONREG1` · `SETW3SWPQC1` · `SETW3MUTQC1` · `ATTLVTSOTQC1` · `SETFIDQC1` · `QACONPAYSTQC1` · `SETW3QC1` — independent slice |
| **Verdict** | **GO WITH CONDITIONS** |
| **ack_status** | **PASS_TO_PM** |
| **stamp** | **`RECCHQC1-MSNKIJ5QC1`** · annotates **`RECCHQA-MSNKIJ5R`** + carry **`RECCHQA-MSNK95YR`** |
| **portal_url** | `http://127.0.0.1:5173` · HRM `/hr/recruitment?tab=candidates` · hrm-api `:28001` |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` |
| **U65** | zero-seed · browser HDSD testids · no `pnpm seed:*` |
| **OS honesty** | `settings_catalog_e2e_ready=false` · `uf_hrm_10_full=false` · `C-SLICE-≠-MODULE` |

---

## Verdict summary

**GO WITH CONDITIONS** — **ACCEPT** narrow **recruitment_channels consumer** slice on QA stamps **#4 + #5**:

| AC | Verdict | Evidence |
|----|---------|----------|
| **AC-REC-01** | **PASS** | Tạo UV → Nguồn `CSO_01` → `POST /api/hrm/recruitment/candidates` **201** · F5 · `RECCHQA-MSNK95YR` |
| **AC-REC-02** | **PASS** | Filter `hdsd-candidate-filter-source` + `…-option-CSO_01` → row visible · `RECCHQA-MSNKIJ5R` |
| **AC-REC-03** | **PASS** | List/detail label «Website» · carry #4 |
| **VAL-REC-CH-FE-01** | **PASS** | Network `source` = catalog **code** (not VI label) · carry #4 |

**NOT** full **UF-HRM-10** · **NOT** Settings module UAT · **NOT** recruitment module UAT · **NOT** Phase 1 DONE.

Audited: QA MD retest #4–5 · FE handoffs · YCTD/WF/BOD BE chain (precondition only) · Classification · honesty locks.

---

## Honesty locks (mandatory)

| Flag / claim | Value | QC |
|--------------|-------|-----|
| **`settings_catalog_e2e_ready`** | **`false`** | **DENIED** flip to `true` |
| **Full UF-HRM-10 / Settings catalog UAT** | **DENIED** | consumer legs only |
| **Recruitment module / UF-HRM-10 full PASS** | **DENIED** | `uf_hrm_10_full=false` |
| **Reopen YCTD/WF/BOD bridge WIs** | **DENIED** | prechain **sealed** for this gate |
| **Reopen parent Settings QC seals** | **DENIED** | `SETW3SWPQC1` · `QACONPAYSTQC1` · etc. **RETAIN** |
| **Seed** | **DENIED** (U65) | EFF=4 on env via Settings sync path |
| **`C-SLICE-≠-MODULE`** | **RETAIN** | narrow GWC |

### PM promote decision (explicit)

| Question | Answer |
|----------|--------|
| May PM set `settings_catalog_e2e_ready=true`? | **NO** |
| May PM claim UF-HRM-10 full 🟢 / Settings UAT? | **NO** |
| May PM annotate board **AC-REC-01..03** consumer slice **CLOSED** with stamps `RECCHQA-MSNK95YR` + `RECCHQA-MSNKIJ5R` + **`RECCHQC1-MSNKIJ5QC1`**? | **YES** |
| May PM treat this as recruitment module UAT-ready? | **NO** |

---

## Classification

| Signal | Class | Disposition |
|--------|-------|-------------|
| AC-REC-01 mutate POST + F5 | PRODUCT L2.5 | **ACCEPT** |
| AC-REC-02 filter by catalog code | PRODUCT L2.5 | **ACCEPT** |
| AC-REC-03 list/detail resolve label | PRODUCT L2.5 | **ACCEPT** |
| VAL-REC-CH-FE-01 Network code | PRODUCT L2 | **ACCEPT** |
| YCTD `out_of_plan` WF prerequisite | PRODUCT prechain | **RETAIN sealed** — not re-audited as consumer defect |
| **CandidateSourceStats** | PRODUCT P1 | **OUT OF SLICE** — non-blocking |
| **VAL-REC-CH-BE-01** | PRODUCT optional BE | **OUT OF SLICE** — non-blocking |
| Honesty / module UAT / seed | GOVERNANCE | **LOCKED DENY** |
| QA MD missing `## Residual` heading | PROCESS OBS | **7/8** on QA pack — QC SoT **8/8** on this file |

---

## Command table (verify)

| Command | Result |
|---------|--------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qa-po-hrm-rec-channels-consumer-01.md` | exit **1** · **7/8** — missing `## Residual` on QA MD (PROCESS OBS) |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qc-po-hrm-rec-channels-consumer-01.md` | exit **0** · **8/8 PASS** |
| QA L0 `pnpm run qc:fe-be-health` (cite QA #4–5) | **PASS** exit **0** |
| QA vitest (cite QA) | **40/40** consumer locks · retest #4 |
| QA runner `scripts/qa/_tmp-qa-po-hrm-rec-channels-consumer-01.mjs` | **PASS** AC-REC-02 · `QA_AC_REC_02_ONLY=1` · `RECCHQA-MSNKIJ5R` |
| Raw JSON | `docs/qa/evidence/_tmp-qa-po-hrm-rec-channels-consumer-01.json` · commit `dc930c5` |

### Pack consolidation (8/8 — QC SoT)

| # | Check | Status |
|---|--------|--------|
| 1 | work_item_id | ✅ |
| 2 | ack_status | ✅ `PASS_TO_PM` |
| 3 | command_table | ✅ above |
| 4 | portal_url | ✅ `:5173` · `:28001` |
| 5 | journey_l25 | ✅ UF-HRM-10 narrow · J-HRM-05 partial carry |
| 6 | crud_or_matrix | ✅ AC matrix PASS rows |
| 7 | residual_section | ✅ § Residual below |
| 8 | timestamp | ✅ 2026-08-11 |

---

## Conditions (GWC)

1. **Honesty:** `settings_catalog_e2e_ready=false` · **DENY** UF-HRM-10 full · **DENY** Settings module UAT · **DENY** recruitment module UAT · **DENY** Phase 1 · seed.
2. **Parent RETAIN:** Settings QC family (`SETW3SWPQC1` · `SETW3MUTQC1` · `ATTLVTSOTQC1` · `SETFIDQC1` · `QACONPAYSTQC1` · `DEPTCONREG1` · …) — not reopened.
3. **Prechain RETAIN:** `PO-HRM-REC-YCTD-CREATE-BLOCKER-01` · `PO-HRM-REC-YCTD-WF-INBOX-BRIDGE-01` · `PO-HRM-REC-YCTD-BOD-OPEN-FOR-HIRE-01` — sealed; UV mutate used U65 YCTD path documented in QA #4.
4. **CLOSED (this seat):** **AC-REC-01** · **AC-REC-02** · **AC-REC-03** · **VAL-REC-CH-FE-01** on recruitment **Ứng viên** consumer wiring.
5. **PROCESS (non-blocking):** QA evidence MD should append formal `## Residual` for pack 8/8 on future gates.

---

## J-* / UF (U19)

| ID | Verdict | Notes |
|----|---------|-------|
| **UF-HRM-10** (narrow — recruitment_channels on UV) | **PASS** | AC-REC-01..03 only |
| **UF-HRM-10** (full matrix) | **NOT PROMOTED** | other consumer legs OPEN per Settings program |
| **J-HRM-05** (Tuyển dụng → Ứng viên) | **PASS_WITH_HOLD** | list→filter→create path exercised; not full REC module journey map |
| **J-HRM-REC-UV-01** | **RETAIN** | separate sealed QC — do not merge buckets |
| **J-HRM-REC-YCTD-02b** | **RETAIN DRAFT** | prechain satisfied for test stamp only |

---

## Residual

| Item | Severity | Owner | Blocks GWC? |
|------|----------|-------|-------------|
| **CandidateSourceStats** widget / aggregate | P1 | `dev-fe` backlog | **NO** — out of slice per FE-01 |
| **VAL-REC-CH-BE-01** optional BE catalog assert | P2 | `dev-be` optional | **NO** — out of slice |
| QA MD `## Residual` section for evidence-pack | PROCESS | `qa` hygiene | **NO** — QC audited retest #4–5 body |
| Remaining UF-HRM-10 consumers / W3 sweep | PROGRAM | PM / BA vertical | **YES** for module UAT only |

**No residual** within **AC-REC-01..03** consumer slice after retest #5.

---

## completion_report

**Closed:** Narrow **GWC** on recruitment_channels consumer **AC-REC-01..03** + filter **AC-REC-02**; honesty **DENY** `settings_catalog_e2e_ready` flip; parent Settings + YCTD prechain seals **RETAIN**; out-of-slice P1/P2 documented non-blocking.  
**Open:** Full UF-HRM-10 · Settings module UAT · recruitment module UAT · QA pack 7/8 hygiene on QA MD.

## next_owner

`pm`

## pm_dispatch_hint

PM may **annotate** consumer slice **CLOSED** (`RECCHQC1-MSNKIJ5QC1`); **must not** promote `settings_catalog_e2e_ready` or UF-HRM-10 full. Optional: `qa` append `## Residual` to QA MD for pack 8/8. Continue Settings vertical per U88 (`ba-process` / `sa`) — not blocked by this GWC.

## next_dispatch_prompt

```text
work_item_id: PM-HRM-REC-CHANNELS-CONSUMER-SEAL-01
role: pm
entry_criteria: QC PO-HRM-REC-CHANNELS-CONSUMER-QC-01 PASS_TO_PM — GWC RECCHQC1-MSNKIJ5QC1; AC-REC-01..03 CLOSED; settings_catalog_e2e_ready DENY flip
exit_criteria: Bus seal + matrix annotate narrow consumer slice; RETAIN SETW3SWPQC1/QACONPAYSTQC1/DEPTCONREG1; dispatch ba-process or sa for Settings §6.2 vertical kế per U88 — không claim UF-HRM-10 full
evidence_path: docs/qa/evidence/qc-po-hrm-rec-channels-consumer-01.md
ack_status: PASS_TO_PM
```

# Evidence — QC-PO-HRM-SETTINGS-CONSUMER-JT-WH-01

| Field | Value |
|-------|--------|
| **work_item_id** | `QC-PO-HRM-SETTINGS-CONSUMER-JT-WH-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-11 |
| **lane** | governance — **narrow C-SLICE** · **`job_titles` → QTCT Vị trí** · **AC-SET-CONSUMER-JT-WH-01** only |
| **qa_ref** | [`qa-po-hrm-settings-consumer-jt-wh-02.md`](qa-po-hrm-settings-consumer-jt-wh-02.md) · stamp **`WHPOS1-MSNL78LF`** · **PASS_TO_PM** |
| **be_ref** | [`po-hrm-settings-consumer-jt-wh-be-02.md`](po-hrm-settings-consumer-jt-wh-be-02.md) · `D-BE-HRM-WH-POSITION-CATALOG-SCOPE-01` |
| **fe_ref** | [`po-hrm-settings-consumer-jt-wh-fe-01.md`](po-hrm-settings-consumer-jt-wh-fe-01.md) · `D-FE-HRM-WH-POSITION-PICKER-01` |
| **spec_ref** | [`PO-HRM-SETTINGS-SRS-FIDELITY-DELTA-01.md`](../../program/specs/PO-HRM-SETTINGS-SRS-FIDELITY-DELTA-01.md) §6.2 **AC-SET-CONSUMER-JT-WH-01** |
| **prior_fail** | `WHPOS1-MSNL05LB` · [`qa-po-hrm-settings-consumer-jt-wh-01.md`](qa-po-hrm-settings-consumer-jt-wh-01.md) |
| **settings_parents** | **RETAIN** `RECCHQC1-MSNKIJ5QC1` · `DEPTCONREG1` · `QACONPAYSTQC1-MSNG1JQC1` · `SETW3SWPQC1` · `SETW3MUTQC1` · `ATTLVTSOTQC1` · `SETFIDQC1` · `JDSETMUTQC1` — not reopened |
| **Verdict** | **GO WITH CONDITIONS** |
| **ack_status** | **PASS_TO_PM** |
| **stamp** | **`WHPOSQC1-MSNL78QC1`** · annotates **`WHPOS1-MSNL78LF`** |
| **portal_url** | `http://127.0.0.1:5173` · NV QTCT · hrm-api `:28001` |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `companyId=main` |
| **U65** | zero-seed · browser HDSD testids · no `pnpm seed:*` |
| **OS honesty** | `settings_catalog_e2e_ready=false` · `uf_hrm_10_full=false` · `C-SLICE-≠-MODULE` |

---

## Verdict summary

**GO WITH CONDITIONS** — **ACCEPT** narrow **`job_titles` consumer** on **Quá trình công tác · Vị trí** for **AC-SET-CONSUMER-JT-WH-01**:

| Check | Verdict | Evidence |
|-------|---------|----------|
| Picker SoT = EFF `job_titles` (no free-text SoT) | **PASS** | `hdsd-work-timeline-position-picker` mount · no `input[name=position]` |
| POST work-timeline `position_key` ∈ catalog | **PASS** | **201** · `position_key=ceo` · parity with prior `settings-catalogs` EFF **5** codes |
| FE sau 2xx + F5 label = catalog | **PASS** | Row **giám đốc** · `GET` count=1 persisted |
| BE scope parity list vs assert | **PASS** | `holding` resolver on assert · jest **23/23** · closes **MSNL05LB** |
| L0 stack | **PASS** | `qc:fe-be-health` exit **0** |

**NOT** full **UF-HRM-10** · **NOT** `BR-SET-CONSUMER-MATRIX-01` closure · **NOT** Settings module UAT · **NOT** Phase 1 DONE.

Audited: QA MD · BE/FE handoffs · `verify:qc:evidence-pack` · Classification · honesty locks · parent seals.

---

## Honesty locks (mandatory)

| Flag / claim | Value | QC |
|--------------|-------|-----|
| **`settings_catalog_e2e_ready`** | **`false`** | **DENIED** flip to `true` |
| **Full UF-HRM-10 / Settings catalog UAT** | **DENIED** | QTCT **Vị trí** leg only |
| **`BR-SET-CONSUMER-MATRIX-01` full** | **OPEN** | other consumer legs unchanged |
| **Reopen parent Settings / consumer QC seals** | **DENIED** | REC-CH · dept · CTR · W3 · JD · ATT **RETAIN** |
| **Seed** | **DENIED** (U65) | catalog EFF from env read-only baseline |
| **`C-SLICE-≠-MODULE`** | **RETAIN** | narrow GWC |

### PM promote decision (explicit)

| Question | Answer |
|----------|--------|
| May PM set `settings_catalog_e2e_ready=true`? | **NO** |
| May PM claim UF-HRM-10 full 🟢 / Settings UAT? | **NO** |
| May PM annotate **AC-SET-CONSUMER-JT-WH-01** **CLOSED** with stamps `WHPOS1-MSNL78LF` + **`WHPOSQC1-MSNL78QC1`**? | **YES** |
| May PM treat WH QTCT as full UF-HRM-10 matrix PASS? | **NO** |

---

## Classification

| Signal | Class | Disposition |
|--------|-------|-------------|
| U65 QTCT Thêm → picker → Lưu → F5 | PRODUCT L2.5 | **ACCEPT** |
| Network POST 201 + `position_key` catalog parity | PRODUCT L1+L2.5 | **ACCEPT** |
| BE `resolveHrmSettingsCatalogCompanyId` on WH assert | PRODUCT scope_parity | **ACCEPT** |
| vitest 4/4 · jest 23/23 | PRODUCT L1 | **ACCEPT** (supporting) |
| **CHRO** second browser pick | PRODUCT optional | **DEFERRED** — non-blocking; `CHRO` in EFF list · BE jest holding assert |
| Honesty / module UAT / seed | GOVERNANCE | **LOCKED DENY** |
| L2.5 J-* program-wide | GOVERNANCE | **N/A** — slice does not claim journey closure |

---

## Command table (verify)

| Command | Result |
|---------|--------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qa-po-hrm-settings-consumer-jt-wh-02.md` | exit **0** · **8/8 PASS** |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qc-po-hrm-settings-consumer-jt-wh-01.md` | *(post-write)* PM/QC re-run expected **8/8** |
| QA L0 `pnpm run qc:fe-be-health` (cite QA) | **PASS** exit **0** |
| QA vitest `po-hrm-settings-consumer-jt-wh-fe-01.test.ts` | **4/4** |
| QA jest `po-hrm-settings-consumer-jt-wh-be-01` + `be-erp-e1a-pos-key-01` | **23/23** |
| QA runner `scripts/qa/_tmp-qa-po-hrm-wh-position-picker-01.mjs` | **PASS** · `WHPOS1-MSNL78LF` |
| Raw JSON | `docs/qa/evidence/_tmp-qa-po-hrm-wh-position-picker-01.json` · commit `dc930c5` |

### Pack consolidation (8/8 — QC SoT)

| # | Check | Status |
|---|--------|--------|
| 1 | work_item_id | ✅ |
| 2 | ack_status | ✅ `PASS_TO_PM` |
| 3 | command_table | ✅ above |
| 4 | portal_url | ✅ `:5173` · `:28001` |
| 5 | journey_l25 | ✅ UF-HRM-10 **narrow** QTCT only — no full J-* claim |
| 6 | crud_or_matrix | ✅ AC-SET-CONSUMER-JT-WH-01 PASS row |
| 7 | residual_section | ✅ § Residual below |
| 8 | timestamp | ✅ 2026-08-11 |

---

## Conditions (GWC)

1. **Honesty:** `settings_catalog_e2e_ready=false` · **DENY** UF-HRM-10 full · **DENY** Settings module UAT · **DENY** Phase 1 · seed (U65).
2. **Parent RETAIN:** `RECCHQC1-MSNKIJ5QC1` · dept `DEPTCONREG1` · CTR `QACONPAYSTQC1` · W3/JD/ATT/SETFID family — **not reopened** by this seat.
3. **CLOSED (this seat):** **AC-SET-CONSUMER-JT-WH-01** — `job_titles` → QTCT **Vị trí** · browser `ceo` path · BE scope fix **D-BE-HRM-WH-POSITION-CATALOG-SCOPE-01**.
4. **DEFERRED (non-blocking):** explicit browser pick **`CHRO`** — BE jest covers holding catalog assert; PM may waive or dispatch optional QA spot.
5. **OPEN (program):** UF-HRM-10 full sweep · remaining consumer matrix rows per delta §6.2 honesty.

---

## J-* / UF (U19)

| ID | Verdict | Notes |
|----|---------|-------|
| **UF-HRM-10** (narrow — QTCT Vị trí) | **PASS** | AC-SET-CONSUMER-JT-WH-01 only |
| **UF-HRM-10** (full matrix) | **NOT CLAIMED** | `uf_hrm_10_full=false` |
| **J-*** mandatory program rows | **N/A** | No L2.5 journey closure claimed for this slice |

---

## Residual

| Item | Owner | Blocking |
|------|-------|----------|
| UF-HRM-10 full / consumer matrix | `ba-data` / QA program | **YES** for module UAT — **OUT OF THIS GATE** |
| `settings_catalog_e2e_ready` flip | **DENIED** | N/A |
| CHRO second browser pick | `qa` optional | **NO** |
| Screenshots on disk | QA | **PASS** — paths cited in QA MD |

---

## completion_report

**Closed (QC seat):** Narrow **GWC** on **AC-SET-CONSUMER-JT-WH-01**; QA U65 PASS **WHPOS1-MSNL78LF** audited; evidence pack **8/8**; BE scope parity + FE picker wiring traceable to spec §6.2; prior **WHPOS1-MSNL05LB** closed; honesty locks enforced; parent REC-CH/dept/CTR/W3 seals **RETAIN**.

**Open (program):** UF-HRM-10 full · `settings_catalog_e2e_ready` · optional CHRO browser pick.

## next_owner

`pm` — matrix annotate AC slice CLOSED + continuous pipeline (U88) per program board.

## next_dispatch_prompt

```text
work_item_id: PM-PO-HRM-SETTINGS-CONSUMER-JT-WH-SEAL-01
role: pm
read_first:
  - docs/qa/evidence/qc-po-hrm-settings-consumer-jt-wh-01.md (stamp WHPOSQC1-MSNL78QC1)
  - docs/program/specs/PO-HRM-SETTINGS-SRS-FIDELITY-DELTA-01.md §6.2
entry_criteria: QC-PO-HRM-SETTINGS-CONSUMER-JT-WH-01 PASS_TO_PM GWC
exit_criteria:
  - Bus + matrix: AC-SET-CONSUMER-JT-WH-01 CLOSED with WHPOS1-MSNL78LF / WHPOSQC1-MSNL78QC1
  - RETAIN settings_catalog_e2e_ready=false · UF-HRM-10 full OPEN · RECCHQC1+DEPTCONREG1+QACONPAYSTQC1 seals
  - Dispatch kế: ba-data BR-SET-CONSUMER-MATRIX-01 gap or next P0 consumer per delta §6.2
cấm: flip settings_catalog_e2e_ready · UF-HRM-10 full claim
```

**ack_status:** **PASS_TO_PM**

# Evidence — QC-HRM-SETTINGS-CONSUMER-PAY-STALE-GWC-01

| Field | Value |
|-------|--------|
| **work_item_id** | `QC-HRM-SETTINGS-CONSUMER-PAY-STALE-GWC-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-10 |
| **lane** | governance — **narrow C-SLICE** · UF-HRM-10 consumer pickers + **J-HRM-PAY-09-01** no-F5 only |
| **qa_ref** | [`qa-hrm-settings-consumer-pay-stale-01.md`](qa-hrm-settings-consumer-pay-stale-01.md) · stamp **`QACONPAYST1-MSNG1JPS`** |
| **dev_ref** | [`po-hrm-settings-catalog-consumer-audit-fe-01.md`](po-hrm-settings-catalog-consumer-audit-fe-01.md) · [`po-hrm-mvp-gd1-pay-09-fe-catalog-stale-01.md`](po-hrm-mvp-gd1-pay-09-fe-catalog-stale-01.md) |
| **pay_parent** | [`qc-po-hrm-mvp-gd1-pay-09-fe-catalog-stale-gwc-01.md`](qc-po-hrm-mvp-gd1-pay-09-fe-catalog-stale-gwc-01.md) · **`PAY09QCCST1-MSMLOEWQC1`** — **RETAIN · not reopened** |
| **settings_parent** | [`qc-po-hrm-settings-fidelity-gate-01.md`](qc-po-hrm-settings-fidelity-gate-01.md) · **`SETFIDQC1-MSN8VQ3L`** — **RETAIN** |
| **Verdict** | **GO WITH CONDITIONS** |
| **ack_status** | **PASS_TO_PM** |
| **stamp** | **`QACONPAYSTQC1-MSNG1JQC1`** · annotates **`QACONPAYST1-MSNG1JPS`** |
| **portal_url** | `http://127.0.0.1:5173` · contracts `command-center/hrm/contracts` · payroll `hr/payroll?portal=1&tenantId=xevn&companyId=main` · hrm-api `:28001` |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `companyId=main` |
| **U65** | zero-seed · browser HDSD · no `pnpm seed:*` |
| **OS honesty** | `payroll_e2e_ready=false` · `settings_catalog_e2e_ready` **DENY** · `C-SLICE-≠-MODULE` |

---

## Verdict summary

**GO WITH CONDITIONS** — **ACCEPT** independent QA stamp **`QACONPAYST1-MSNG1JPS`** on **narrow scope only**:

1. **UF-HRM-10** — Contracts create **department + contract_type** `CatalogSearchPicker` consumer legs (4 dept · 5 type options · `GET settings-catalogs` 200).
2. **J-HRM-PAY-09-01** — POST **201** · row visible **≤20s** **without F5** (`row_without_f5=true`) · reinforces **`FE-PAY09-CATALOG-LIST-STALE`** closure on **`PAY09QCCST1`**.

**NOT** full Settings catalog UAT · **NOT** PAY-09 / PAY module DONE · **NOT** Phase 1 DONE.

Audited: QA MD · raw JSON · dev handoff matrix · parent PAY CST-GWC · Classification · U19 journey carry.

---

## Honesty locks (mandatory)

| Flag / claim | Value | QC |
|--------------|-------|-----|
| **`payroll_e2e_ready` / PAY module UAT** | **`false`** | **DENIED** flip |
| **Claim PAY-09 / PAY module DONE from this seat** | **DENIED** | J-09-01 leg only |
| **`settings_catalog_e2e_ready` / Settings module UAT** | **DENIED** | 2 consumer pickers ≠ full UF-HRM-10 🟢 |
| **Full UF-HRM-10 matrix promote** | **DENIED** | consumer legs only |
| **Reopen `PAY09QCCST1` · `PAY09QCFE1` · `PAY09QC1`** | **DENIED** | independent retest **confirms** stale fix |
| **Seed** | **DENIED** (U65) | pilot catalog EFF>0 on env |
| **`C-SLICE-≠-MODULE`** | **RETAIN** | narrow GWC |

### PM promote decision (explicit)

| Question | Answer |
|----------|--------|
| May PM set `payroll_e2e_ready=true`? | **NO** |
| May PM claim PAY module / PAY-09 DONE? | **NO** |
| May PM claim Settings catalog / full UF-HRM-10 UAT? | **NO** |
| May PM annotate board with **`QACONPAYST1-MSNG1JPS`** + **`QACONPAYSTQC1-MSNG1JQC1`** on consumer + no-F5 slice? | **YES** |
| May PM treat **UF-HRM-10** Contracts create **dept + type** consumer legs as **CLOSED** for this slice? | **YES** — this GWC |
| May PM close **J-HRM-PAY-09-03/04** HOLD? | **NO** — **RETAIN HOLD** |

---

## Classification

| Signal | Class | Disposition |
|--------|-------|-------------|
| UF-HRM-10 dept + contract_type pickers on create | PRODUCT L2.5 | **ACCEPT** · narrow consumer |
| J-HRM-PAY-09-01 POST 201 · row no F5 | PRODUCT L2.5 | **ACCEPT** · confirms CST closure |
| **FE-PAY09-CATALOG-LIST-STALE** | PRODUCT P2 | **RETAIN CLOSED** · cite **`PAY09QCCST1`** + this retest |
| **J-HRM-PAY-09-03 / 04** | PRODUCT residual | **HOLD** · carry |
| Remaining UF-HRM-10 consumers / W3 sweep | PRODUCT scope | **OUT OF SCOPE** · cite SETFID / SETW3 parents |
| Honesty / seed / module UAT | GOVERNANCE | **LOCKED DENY** |

---

## Command table (verify)

| Command | Result |
|---------|--------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qa-hrm-settings-consumer-pay-stale-01.md` | exit **0** · **8/8 PASS** |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qc-hrm-settings-consumer-pay-stale-gwc-01.md` | exit **0** · **8/8 PASS** |
| QA L0 `qc:fe-be-health` (cite QA) | **PASS** exit 0 |
| QA runner `scripts/qa/_tmp-qa-hrm-settings-consumer-pay-stale-01.mjs` | overall **PASS** · `QACONPAYST1-MSNG1JPS` |
| Raw JSON | `_tmp-qa-hrm-settings-consumer-pay-stale-01.json` · commit `dc930c5` |

### Pack consolidation (8/8 — QC SoT)

| # | Check | Status |
|---|--------|--------|
| 1 | work_item_id | ✅ |
| 2 | ack_status | ✅ `PASS_TO_PM` |
| 3 | command_table | ✅ above |
| 4 | portal_url | ✅ `:5173` · `:28001` |
| 5 | journey_l25 | ✅ UF-HRM-10 legs · **J-HRM-PAY-09-01** · **J-09-03/04 HOLD** |
| 6 | crud_or_matrix | ✅ pickers + POST 201 no-F5 |
| 7 | residual_section | ✅ below |
| 8 | timestamp | ✅ 2026-08-10 |

---

## Conditions (GWC)

1. **Honesty:** `payroll_e2e_ready=false` · **DENY** PAY / PAY-09 module UAT · **DENY** full Settings catalog UAT · **DENY** Phase 1 · seed.
2. **Parent RETAIN:** **`PAY09QCCST1-MSMLOEWQC1`** · **`PAY09QCFE1-MSMLA8QC1`** · **`PAY09QC1`** · **`SETFIDQC1-MSN8VQ3L`** — not reopened.
3. **CLOSED (this seat):** UF-HRM-10 **Contracts create** **department + contract_type** catalog consumer legs after **`QACONPAYST1-MSNG1JPS`**.
4. **CLOSED (this seat):** **J-HRM-PAY-09-01** create-without-F5 — independent confirmation of catalog list freshness on payroll groups.
5. **HOLD carry:** **J-HRM-PAY-09-03** · **J-HRM-PAY-09-04** — non-blocking · unchanged from PAY09 FE-GWC stack.
6. **must_keep:** PAY01..09 QC seals · ATT peer seals per continuous program · consumer audit FE matrix residual BE gaps (recruitment_channels EMPTY) — not closed by 2 pickers alone.

---

## J-* / UF (U19)

| ID | Verdict | Notes |
|----|---------|-------|
| **UF-HRM-10** (narrow) | **PASS** | Contracts create dept (4) + type (5) pickers · SRS §16.8 O4 |
| **UF-HRM-10** (full matrix) | **NOT PROMOTED** | consumer audit matrix wider than 2 legs |
| **J-HRM-PAY-09-01** | **PASS** | POST 201 `Q09CPYNG1JPS` · row ≤20s no F5 |
| **J-HRM-PAY-09-03** | **PASS_WITH_HOLD** | carry |
| **J-HRM-PAY-09-04** | **PASS_WITH_HOLD** | carry |
| **J-HRM-PAY-09-02** | **RETAIN** | prior PAY09 FE-GWC |
| PAY / PAY-09 module UAT | **DENIED** | C-SLICE |
| Settings module UAT | **DENIED** | C-SLICE |

**Screenshots (cite QA):** `screens/qa-hrm-settings-consumer-pay-stale-01/contracts-create-pickers.png` · `pay-group-after-create-no-f5.png`

---

## Residual

| ID | Sev | Status | Owner |
|----|-----|--------|-------|
| **J-HRM-PAY-09-03** scoped period UI | HOLD | OPEN · carry | dev-fe |
| **J-HRM-PAY-09-04** payslip filter UI | HOLD | OPEN · carry | dev-fe |
| **PAY module UAT** | INFO | `payroll_e2e_ready=false` | pm — DENY flip |
| **Settings catalog UAT** | INFO | `settings_catalog_e2e_ready` DENY | pm / ba |
| W3 full sweep · JD mutate · console P2 | INFO | OPEN per SETW3 / SETFID parents | optional lanes |
| Consumer matrix gaps (e.g. recruitment_channels) | P2/P3 | OPEN per dev audit | dev-fe / dev-be |

**No residual PRODUCT P0** blocking this narrow GWC.

---

## must_keep RETAIN (explicit)

| Stamp | Note |
|-------|------|
| **`PAY09QCCST1-MSMLOEWQC1`** | P2 stale CLOSED · **DENY reopen** |
| **`PAY09QCFE1-MSMLA8QC1`** · **`PAY09QC1`** | PAY-09 GWC stack |
| **`SETFIDQC1-MSN8VQ3L`** | Settings fidelity GWC |
| **`payroll_e2e_ready=false`** | GOVERNANCE lock |

---

## Completion contract

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** |
| **next_owner** | **pm** → matrix/journey annotate · governance vertical kế (U88) · **≠** PAY/Settings module UAT |
| **evidence_path** | `docs/qa/evidence/qc-hrm-settings-consumer-pay-stale-gwc-01.md` |
| **completion_report** | GWC after **`QACONPAYST1-MSNG1JPS`**: UF-HRM-10 Contracts create **dept+type** consumer legs **CLOSED** on slice · **J-HRM-PAY-09-01** no-F5 **PASS** · **`payroll_e2e_ready=false`** · **DENY** PAY/Settings module UAT · **J-09-03/04 HOLD** · parent PAY CST + Settings fidelity **RETAIN** · stamp **`QACONPAYSTQC1-MSNG1JQC1`**. QA pack **8/8** on QA MD. |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-SETTINGS-CONSUMER-MATRIX-PM-01
lane: governance · pm
read_first: docs/qa/evidence/qc-hrm-settings-consumer-pay-stale-gwc-01.md · docs/qa/evidence/po-hrm-settings-catalog-consumer-audit-fe-01.md
depends_on: QACONPAYSTQC1-MSNG1JQC1 · QACONPAYST1-MSNG1JPS · RETAIN payroll_e2e_ready=false · settings_catalog_e2e_ready DENY
entry_criteria: QC narrow GWC PASS_TO_PM on UF-HRM-10 consumer legs + J-HRM-PAY-09-01 no-F5 only
exit_criteria: PM update PILOT_BUSINESS_FLOW_MATRIX / consumer audit board rows for Contracts create legs · bus seal · TEAM_WORKING_NOW · optional dispatch dev-fe for recruitment_channels EMPTY or J-09-03/04 HOLD owners
cấm: flip payroll_e2e_ready · claim PAY module or full Settings UF-HRM-10 UAT DONE · seed · reopen PAY09QCCST1/SETFIDQC1
```

---

## stamp

`QACONPAYSTQC1-MSNG1JQC1` · 2026-08-10 · **UF-HRM-10** consumer pickers slice **GWC** · **J-HRM-PAY-09-01** no-F5 **PASS** · QA **`QACONPAYST1-MSNG1JPS`** · **≠** PAY module UAT · **≠** Settings catalog UAT · `payroll_e2e_ready=false` · **J-HRM-PAY-09-03/04 HOLD** · C-SLICE ≠ module UAT

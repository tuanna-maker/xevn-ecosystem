# Evidence — `QC-PO-HRM-SETTINGS-JD-MUTATE-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `QC-PO-HRM-SETTINGS-JD-MUTATE-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-11 |
| **lane** | governance — **C-SLICE** JD master library mutate (`JD-SET-MUTATE-SLICE`) · **not** Settings module UAT · **not** full W3 18-tab sweep · **not** Phase 1 DONE |
| **spec_ref** | [`PO-HRM-SETTINGS-SRS-FIDELITY-DELTA-01.md`](../../program/specs/PO-HRM-SETTINGS-SRS-FIDELITY-DELTA-01.md) §6.3 · `UI-SETTINGS-JD-MASTER-LIST.md` |
| **qa_ref** | [`po-hrm-settings-jd-mutate-qa-01.md`](po-hrm-settings-jd-mutate-qa-01.md) · stamp **`JDSETMUT-MSNHWI0A`** |
| **fe_ref** | [`po-hrm-jd-ia-list-detail-fe-01.md`](po-hrm-jd-ia-list-detail-fe-01.md) · **`PO-HRM-JD-IA-LIST-DETAIL-FE-01`** |
| **machine** | [`_tmp-po-hrm-settings-jd-mutate-qa-01.json`](_tmp-po-hrm-settings-jd-mutate-qa-01.json) |
| **screens** | `docs/qa/evidence/screens/po-hrm-settings-jd-mutate-qa-01/` |
| **portal_url** | `http://127.0.0.1:5173/command-center/hrm/settings?tab=jd-master-library` · HRM `:28001` · persona `ceo@xe.vn` / `main` |
| **journey_l25** | **J-HRM-JD-05** — Settings Thư viện JD → create/publish → REC YCTD picker sees template `jdnhwi0a` · **PASS** (L2.5 in-slice) |
| **crud_or_matrix** | **AC-JD-SET-LIST-01..08** — U65 Thêm/Lưu nháp/Phát hành · POST job-templates **201** · F5 persist · CFG tab regression |
| **Verdict** | **GO WITH CONDITIONS** |
| **ack_status** | **PASS_TO_PM** |
| **stamp** | **`JDSETMUTQC1-MSNHWI0QC1`** · annotates QA **`JDSETMUT-MSNHWI0A`** |
| **U65** | zero-seed · browser-primary · no `pnpm seed:*` in evidence |
| **OS honesty** | `settings_catalog_e2e_ready=false` · `C-SLICE-≠-MODULE` · **RETAIN** **`SETW3MUTQC1-MSNHB5QC1`** · **`ATTLVTSOTQC1-MSNGQC01`** |

---

## Verdict summary

**GO WITH CONDITIONS** — **ACCEPT** bounded **JD master library mutate** slice after QA **`PO-HRM-SETTINGS-JD-MUTATE-QA-01`** stamp **`JDSETMUT-MSNHWI0A`**: **8/8** AC-JD-SET-LIST-01..08 🟢 · **J-HRM-JD-05** 🟢 · mutates only `recruitment/job-templates` (no settings catalog extension POST per **BR-JD-SET-API-01**).

**NOT** Settings module UAT. **NOT** full W3 browser sweep. **NOT** reopen sealed W3/ATT mutate QA. **NOT** Phase 1 DONE.

Audited: QA MD · machine JSON · §6.3 AC/BR table · parent honesty seals unchanged.

---

## Honesty locks (mandatory)

| Flag / claim | Value | QC |
|--------------|-------|-----|
| **`settings_catalog_e2e_ready` / module Settings UAT** | **`false`** | **DENIED** flip |
| **`SETW3MUTQC1-MSNHB5QC1` reopen** | **DENIED** | RETAIN W3 P0 mutate seal |
| **`ATTLVTSOTQC1-MSNGQC01` reopen** | **DENIED** | RETAIN ATT LVT dual-SoT seal |
| **`SETFIDQC1-MSN8VQ3L` JD shell-only leg** | **SUPERSEDED for mutate** | This slice closes JD mutate HOLD from SETFID GWC |
| **Phase 1 DONE** | **NOT claimed** | program gates open |
| **`C-SLICE-≠-MODULE`** | **RETAIN** | slice ≠ module GO |
| **Seed in UAT evidence** | **DENIED** (U65) | QA browser path |

### PM promote decision (explicit)

| Question | Answer |
|----------|--------|
| May PM flip `settings_catalog_e2e_ready=true`? | **NO** |
| May PM seal **`JDSETMUTQC1-MSNHWI0QC1`** for JD master mutate chain? | **YES** |
| May PM promote **J-HRM-JD-05** / **AC-JD-SET-LIST-06** to 🟢 on matrix/journey artifacts? | **YES** — L2.5 PASS in QA evidence |
| May PM claim **Settings module UAT** or **full W3 sweep DONE**? | **NO** |
| May PM re-run / re-stamp sealed W3 8-tab mutate QA? | **NO** |

---

## Classification

| Signal | Class | Disposition |
|--------|-------|-------------|
| AC-JD-SET-LIST-01..07 browser + network | PRODUCT L2 + L2.5 | **ACCEPT** · **CLOSED** |
| AC-JD-SET-LIST-08 empty copy | PRODUCT L2 | **ACCEPT** · waived (list non-empty U65; FE vitest + prior empty cite) |
| **J-HRM-JD-05** cross-nav publish → YCTD picker | PRODUCT L2.5 | **ACCEPT** · **CLOSED** |
| **BR-JD-SET-SOT-01** · **PAT-01** · **API-01** | PRODUCT governance | **ACCEPT** · CFG tab ≠ library · dialog parent CC · templates API only |
| Full W3 18-tab · consumer matrix · portal mock tabs | OUT OF SCOPE | **NOT TESTED** this WI |
| QA pack verify | PROCESS | **PASS** · **8/8** on QA MD |
| Honesty / module UAT | GOVERNANCE | **LOCKED DENY** |

---

## Command table (verify)

| Command | Result |
|---------|--------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-settings-jd-mutate-qa-01.md` | **PASS** · exit **0** · **8/8** |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qc-po-hrm-settings-jd-mutate-01.md` | *(post-write)* |
| `pnpm run qc:fe-be-health` (cite QA L0) | **PASS** · exit **0** |

---

## Conditions (GWC)

1. **Honesty:** `settings_catalog_e2e_ready=false` · **DENY** Settings module UAT · **DENY** Phase 1 · seed · honesty banner flip.
2. **CLOSED:** **AC-JD-SET-LIST-01..08** + **J-HRM-JD-05** (`JDSETMUT-MSNHWI0A`).
3. **RETAIN:** **`SETW3MUTQC1-MSNHB5QC1`** · **`ATTLVTSOTQC1-MSNGQC01`** — no catalog-tab mutate re-stamp.
4. **NOT promoted:** Full **18-tab** W3 sweep · **UF-HRM-10** consumer matrix · **BR-SET-CONSUMER-MATRIX-01** · portal account/branding tabs.
5. **PM matrix:** Annotate **J-HRM-JD-05** / **AC-JD-SET-LIST-06** 🟢 where tracked (delta §8 · `PO-HRM-SETTINGS-SRS-FIDELITY-DELTA-01`); `PROGRAM_JOURNEY_MAP` may need row add if absent.

---

## J-* / L2.5 matrix (U19)

| J-ID / UF | Verdict | Notes |
|-----------|---------|-------|
| **J-HRM-JD-05** | **PASS** | publish → YCTD picker · code `jdnhwi0a` |
| **AC-JD-SET-LIST-01..08** | **PASS** | §6.3 slice SoT |
| **UF-SET-W3-*** (full sweep) | **NOT IN SCOPE** | RETAIN SETW3MUT seal only |
| **UF-ATT-LVT-SMOKE** | **NOT RERUN** | RETAIN ATTLVTSOT seal |
| Settings module UAT | **DENIED** | C-SLICE |

---

## Audit checklist

| # | Check | Evidence | QC |
|---|-------|----------|-----|
| 1 | 8 AC vs §6.3 table | QA MD · JSON `ac` | 🟢 |
| 2 | L2.5 J-HRM-JD-05 | QA · JSON `journey` | 🟢 |
| 3 | No settings extension POST | QA Network table | 🟢 |
| 4 | ≠ Settings module UAT · honesty DENY | must_keep | 🟢 |
| 5 | U65 zero-seed | QA · JSON | 🟢 |
| 6 | Parent seals not contradicted | SETW3MUT · ATTLVTSOT | 🟢 **RETAIN** |
| 7 | QA evidence pack | verify script | 🟢 **8/8** |
| 8 | QC SoT pack | this file | 🟢 target **8/8** |

---

## Residual

| ID | Sev | Status | Owner |
|----|-----|--------|-------|
| **W3-FULL-TAB-SWEEP** | P1 | **OPEN** | **qa** — `QA-PO-HRM-SETTINGS-W3-BROWSER-01` |
| **BR-SET-CONSUMER-MATRIX-01** | P1 | **OPEN** | **ba-data** + **qa** |
| **SETTINGS-W3-CONSOLE-500** | P2 | **OPEN** | carry from SETW3QC1 |
| **Settings module UAT** | INFO | `settings_catalog_e2e_ready=false` RETAIN | **pm** — DENY flip |

**No residual PRODUCT P0** blocking this C-SLICE GWC.

---

## Completion contract

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** |
| **next_owner** | **pm** — bus seal **`JDSETMUTQC1-MSNHWI0QC1`** · matrix **J-HRM-JD-05** 🟢 · U88 dispatch **qa** W3 sweep or residual program |
| **evidence_path** | `docs/qa/evidence/qc-po-hrm-settings-jd-mutate-01.md` |
| **completion_report** | GWC after **`JDSETMUT-MSNHWI0A`**: JD master mutate **8/8 AC CLOSED** · **J-HRM-JD-05 CLOSED** · `settings_catalog_e2e_ready=false` · RETAIN SETW3MUT+ATTLVTSOT · stamp **`JDSETMUTQC1-MSNHWI0QC1`**. QA pack **8/8**. |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PM-PO-HRM-SETTINGS-JD-MUTATE-SEAL-01
role: pm
entry_criteria: QC JDSETMUTQC1-MSNHWI0QC1 PASS_TO_PM; QA JDSETMUT-MSNHWI0A; must_keep SETW3MUTQC1-MSNHB5QC1 + ATTLVTSOTQC1-MSNGQC01 + settings_catalog_e2e_ready=false
exit_criteria: Bus seal JDSETMUTQC1-MSNHWI0QC1; update PO-HRM-SETTINGS-SRS-FIDELITY-DELTA-01 §8 J-HRM-JD-05 DRAFT→🟢 and PILOT_BUSINESS_FLOW_MATRIX if row exists; TEAM_WORKING_NOW; U88 dispatch qa QA-PO-HRM-SETTINGS-W3-BROWSER-01 OR next program P0 per backlog
cấm: settings_catalog_e2e_ready flip · claim Settings module UAT · reopen sealed W3 8-tab / ATT LVT mutate QA · seed in UAT
evidence_path: docs/qa/evidence/qc-po-hrm-settings-jd-mutate-01.md
```

---

## stamp

`JDSETMUTQC1-MSNHWI0QC1` · 2026-08-11 · JD master mutate **C-SLICE GWC SEALED** · QA **`JDSETMUT-MSNHWI0A`** · **8/8** AC + **J-HRM-JD-05** · **RETAIN** SETW3MUT+ATTLVTSOT · **≠** Settings module UAT · `settings_catalog_e2e_ready=false`

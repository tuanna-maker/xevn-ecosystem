# Evidence — `QC-PO-HRM-SETTINGS-FIDELITY-GATE-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `QC-PO-HRM-SETTINGS-FIDELITY-GATE-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-10 |
| **lane** | governance — **C-SLICE** Settings fidelity P1 tabs + catalog consumer smoke · **not** Settings module UAT · **not** Phase 1 DONE |
| **program_ref** | [`PO-HRM-SETTINGS-FIDELITY-PROGRAM-WAVE-01.md`](../../program/dispatch/PO-HRM-SETTINGS-FIDELITY-PROGRAM-WAVE-01.md) |
| **qa_ref** | [`po-hrm-settings-fidelity-qa-02.md`](po-hrm-settings-fidelity-qa-02.md) · stamps **`SETFID02-MSMZGC71`** + **`SETFID02DEPT-MSN8VQ3L`** |
| **fe_ref** | [`po-hrm-settings-fidelity-fe-03.md`](po-hrm-settings-fidelity-fe-03.md) · closes **UF-CTR-DEPT-CATALOG-PICKER** |
| **machine** | [`_tmp-po-hrm-settings-fidelity-qa-02.json`](_tmp-po-hrm-settings-fidelity-qa-02.json) · dept [`_tmp-po-hrm-settings-fidelity-qa-02-dept.json`](_tmp-po-hrm-settings-fidelity-qa-02-dept.json) |
| **screens** | `docs/qa/evidence/screens/po-hrm-settings-fidelity-qa-02/` |
| **portal_url** | `http://127.0.0.1:5173/command-center/hrm/settings?tab=<id>` · HRM `:28001` · persona `ceo@xe.vn` / `main` |
| **journey_l25** | **UF-HRM-10** consumer — Contracts → Tạo HĐ step 1 → `ctr-create-department-picker` **PASS** (`SETFID02DEPT-MSN8VQ3L`) · **J-HRM-CTR-07** / **J-HRM-CORE-09D-02** **NOT IN SCOPE** — template tab = composer smoke only · **DENY** journey promote |
| **crud_or_matrix** | UF-SET-W3-A01/B01/B02/B07/C03 U65 Thêm→Lưu→F5 matrix (5/5) · consumer smoke JD shell + dept picker |
| **Verdict** | **GO WITH CONDITIONS** |
| **ack_status** | **PASS_TO_PM** |
| **stamp** | **`SETFIDQC1-MSN8VQ3L`** · annotates QA **`SETFID02DEPT-MSN8VQ3L`** + parent **`SETFID02-MSMZGC71`** |
| **U65** | zero-seed · browser-primary · no `pnpm seed:*` |
| **OS honesty** | `settings_catalog_e2e_ready=false` · `C-SLICE-≠-MODULE` · **cấm** claim Settings module UAT / AMIS DONE / Phase 1 |

---

## Verdict summary

**GO WITH CONDITIONS** — **ACCEPT** bounded Settings fidelity slice after QA **`PO-HRM-SETTINGS-FIDELITY-QA-02`** (full **`SETFID02-MSMZGC71`** + dept retest **`SETFID02DEPT-MSN8VQ3L`** post **`PO-HRM-SETTINGS-FIDELITY-FE-03`**).

**NOT Phase 1 DONE. NOT Settings module UAT. NOT full 15-tab SRS fidelity (Wave 2 BA still open).**

Audited: QA-02 MD · main + dept JSON · FE-03 lineage · screens · program wave honesty · UF blocks · stale main JSON `ack_status=FAIL_TO_PM` superseded by MD + dept leg.

---

## Honesty locks (mandatory)

| Flag / claim | Value | QC |
|--------------|-------|-----|
| **`settings_catalog_e2e_ready` / module Settings UAT** | **`false`** | **DENIED** flip |
| **AMIS / full Settings SRS fidelity DONE** | **DENIED** | C-SLICE = 5 P1 tabs + smokes only |
| **JD master AC-JD-SET-01..08 DONE** | **DENIED** | shell smoke only — mutate deferred |
| **J-HRM-CTR-07 / J-HRM-CORE-09D-02 promote** | **DENIED** | contract-templates = composer in dialog · not open-catalog journey |
| **UF-HRM-10 module closure from picker alone** | **DENIED** | consumer smoke ≠ full UF-HRM-10 matrix |
| **Phase 1 DONE** | **NOT claimed** | program gates open |
| **`C-SLICE-≠-MODULE`** | **RETAIN** | slice ≠ module GO |
| **Seed in UAT evidence** | **DENIED** (U65) | QA browser mutate path |

### PM promote decision (explicit)

| Question | Answer |
|----------|--------|
| May PM claim Settings module UAT / `settings_catalog_e2e_ready=true`? | **NO** |
| May PM seal bus **`SETFIDQC1-MSN8VQ3L`** for Wave 0 QA fidelity seat? | **YES** |
| May PM close **UF-SET-W3-A01/B01/B02/B07/C03** F5 fidelity for this wave? | **YES** — QA scope |
| May PM close **UF-CTR-DEPT-CATALOG-PICKER**? | **YES** — FE-03 + **`SETFID02DEPT-MSN8VQ3L`** |
| May PM promote **JD master** beyond shell smoke? | **NO** — follow-up QA slice |
| May PM skip **BA-PO-HRM-SETTINGS-SRS-FIDELITY-01**? | **NO** — program Wave 2 |

---

## Classification

| Signal | Class | Disposition |
|--------|-------|-------------|
| 5× settings tab POST **200** + F5 row | PRODUCT L2 | **ACCEPT** · **CLOSED** |
| `contract-templates` ctr-tpl-canvas in dialog | PRODUCT L2 | **ACCEPT** · **CLOSED** |
| **UF-CTR-DEPT-CATALOG-PICKER** (was P1 on `SETFID02-MSMZGC71`) | PRODUCT L2.5 consumer | **ACCEPT** · **CLOSED** `SETFID02DEPT-MSN8VQ3L` |
| **UF-JD-MASTER-LIBRARY** empty shell | PRODUCT L2 smoke | **ACCEPT** · **NOT promoted** mutate |
| 2× HTTP **500** during contracts navigation (no Uncaught) | PRODUCT OBS | **OPEN** · non-blocking · monitor |
| QA MD pack verify **3/8** (portal_url · journey_l25 · residual) | PROCESS OBS | **ACCEPT** · QC SoT **8/8** on this file |
| Stale `_tmp-po-hrm-settings-fidelity-qa-02.json` `overall=FAIL` | PROCESS OBS | **SUPERSEDED** by QA MD PASS + dept JSON |
| Honesty / seed / module UAT | GOVERNANCE | **LOCKED DENY** |

---

## Command table (verify)

| Command | Result |
|---------|--------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-settings-fidelity-qa-02.md` | **FAIL** · **3/8** PROCESS OBS (portal_url · journey_l25 · residual) — **non-blocking**; QC audits QA MD + JSON + dept leg |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qc-po-hrm-settings-fidelity-gate-01.md` | **PASS** · exit **0** (QC SoT **8/8**) |
| `pnpm run qc:fe-be-health` (cite QA) | **PASS** · exit **0** |
| `pnpm exec vitest` contractFormFieldResolver + consumer audit (cite FE-03) | **PASS** · exit **0** (22 tests) |

---

## Conditions (GWC)

1. **Honesty:** `settings_catalog_e2e_ready=false` · **DENY** Settings module UAT · **DENY** Phase 1 · seed · honesty banner flip.
2. **P1 CLOSED:** 5 settings tabs U65 Thêm→Lưu→**F5** (`SETFID02-MSMZGC71`) · contract-templates composer in dialog.
3. **Consumer CLOSED:** **UF-CTR-DEPT-CATALOG-PICKER** after FE-03 — `ctr-create-department-picker-combobox` + `catalog-picker-option-*` (`SETFID02DEPT-MSN8VQ3L`).
4. **NOT promoted:** JD **Thêm→Lưu→F5→writer** · full **AC-JD-SET-LIST-01..08** · remaining Settings tabs / BA SRS fidelity delta.
5. **Out of slice:** Full **UF-HRM-10** matrix · **J-HRM-CTR-07** open catalog journey · **BA-PO-HRM-SETTINGS-SRS-FIDELITY-01** — **DENY** module GO without separate evidence.

---

## J-* / L2.5 matrix (U19)

| J-ID / UF | Verdict | Notes |
|-----------|---------|-------|
| **UF-HRM-10** (consumer dept picker leg) | **PASS** | cross-nav contracts create step 1 · 4 options · stamp dept |
| **UF-SET-W3-*** (5 tabs) | **PASS** | mutate + F5 per QA blocks |
| **J-HRM-CTR-07** | **NOT IN SCOPE** | template tab ≠ 9th template journey |
| **J-HRM-CORE-09D-02** | **NOT IN SCOPE** | DRAFT on journey map |
| Settings module UAT | **DENIED** | C-SLICE |

---

## Audit checklist

| # | Check | Evidence | QC |
|---|-------|----------|-----|
| 1 | 5 P1 tabs F5 vs prior retry-02 (0/4→4/4) | QA MD · JSON mutations | 🟢 |
| 2 | UF-CTR-DEPT P1 closed post FE-03 | dept JSON · screenshot | 🟢 |
| 3 | ≠ Settings module UAT · `settings_catalog_e2e_ready=false` | program + honesty | 🟢 |
| 4 | U65 zero-seed | QA · FE-03 | 🟢 |
| 5 | JD mutate not over-claimed | QA UF-JD block | 🟢 **HOLD promote** |
| 6 | Evidence pack QC SoT | this file | 🟢 **8/8** |
| 7 | QA pack gaps 3/8 | verify on QA-02 MD | 🟡 OBS · non-blocking |
| 8 | FE-03 vitest + root cause documented | FE-03 MD | 🟢 |

---

## Residual

| ID | Sev | Status | Owner |
|----|-----|--------|-------|
| **JD-SET-MUTATE-SLICE** | P1 | **OPEN** | **qa** — Thêm JD → Lưu → F5 → writer per AC-JD-SET |
| **BA-PO-HRM-SETTINGS-SRS-FIDELITY-01** | P1 | **OPEN** | **ba-process** — tab-by-tab spec says / code does |
| **CONTRACTS-NAV-500-OBS** | P2 | **OPEN** | **dev-fe** / **qa** — 2× 500 on contracts leg; no Uncaught |
| **QA pack gaps on QA-02 MD** | OBS | PROCESS | **qa** optional backfill portal_url · J-* · Residual section |
| **Settings module UAT** | INFO | `settings_catalog_e2e_ready=false` RETAIN | **pm** — DENY flip |

**No residual PRODUCT P0** blocking this C-SLICE GWC.

---

## Completion contract

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** |
| **next_owner** | **pm** → bus seal · **ba-process** Wave 2 SRS fidelity · optional **qa** JD mutate slice |
| **evidence_path** | `docs/qa/evidence/qc-po-hrm-settings-fidelity-gate-01.md` |
| **completion_report** | GWC after **`SETFID02DEPT-MSN8VQ3L`**: 5 P1 settings tabs + F5 **CLOSED** · dept consumer **CLOSED** · JD shell **NOT promoted** · `settings_catalog_e2e_ready=false` · ≠ Settings module UAT · stamp **`SETFIDQC1-MSN8VQ3L`**. QA pack **3/8** OBS · QC SoT **8/8**. |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: BA-PO-HRM-SETTINGS-SRS-FIDELITY-01
role: ba-process
read_first:
  - docs/program/dispatch/PO-HRM-SETTINGS-FIDELITY-PROGRAM-WAVE-01.md
  - docs/qa/evidence/qc-po-hrm-settings-fidelity-gate-01.md
  - docs/hrm/SRS.md (Settings chapters)
entry_criteria: QC SETFIDQC1-MSN8VQ3L GWC sealed; must_keep SETFID02 P1 tab evidence; settings_catalog_e2e_ready=false; C-SLICE-≠-MODULE
exit_criteria: Per-tab delta spec says / code does / gap class; UI_SCREEN backlog rows for P0 gaps; no_prompt_echo client docs
lane: governance · estimated_effort 0.5d
cấm: claim Settings module UAT · honesty flip · reopen SETFID P1 seals without regression bus
evidence_path: docs/program/specs/PO-HRM-SETTINGS-SRS-FIDELITY-DELTA-01.md
```

---

## stamp

`SETFIDQC1-MSN8VQ3L` · 2026-08-10 · Settings fidelity **C-SLICE GWC SEALED** · QA **`SETFID02-MSMZGC71`** + **`SETFID02DEPT-MSN8VQ3L`** · **≠** Settings module DONE · **≠** Settings module UAT · `settings_catalog_e2e_ready=false` · **UF-SET-W3 P1+F5 PASS** · **UF-CTR-DEPT CLOSED** · **JD mutate HOLD** · C-SLICE ≠ module UAT

# Evidence — `QC-PO-HRM-SETTINGS-W3-NARROW-GATE-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `QC-PO-HRM-SETTINGS-W3-NARROW-GATE-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-10 |
| **lane** | governance — **C-SLICE** W3 browser F5 after **FE-07** · **not** full 18-tab W3 sweep · **not** Settings module UAT · **not** Phase 1 DONE |
| **program_ref** | [`PO-HRM-SETTINGS-W3-UX-DENSITY-CONTINUOUS-01.md`](../../program/dispatch/PO-HRM-SETTINGS-W3-UX-DENSITY-CONTINUOUS-01.md) |
| **qa_ref** | [`po-hrm-settings-w3-browser-01-retry-09.md`](po-hrm-settings-w3-browser-01-retry-09.md) · stamps **`SETW3RT9-MSN9KG40`** (runner **`SETW3RT2-MSN9KG40`**) |
| **fe_ref** | [`po-hrm-settings-w3-f5-list-fe-07.md`](po-hrm-settings-w3-f5-list-fe-07.md) · parent CC `?tab=` + parent `localStorage` focus |
| **parent_qc** | [`qc-po-hrm-settings-fidelity-gate-01.md`](qc-po-hrm-settings-fidelity-gate-01.md) · **`SETFIDQC1-MSN8VQ3L`** — **RETAIN** honesty · this gate **adds** live `:5173` F5 4/4 proof post FE-07 |
| **machine** | [`_tmp-po-hrm-settings-w3-browser-retry-02.json`](_tmp-po-hrm-settings-w3-browser-retry-02.json) |
| **screens** | `docs/qa/evidence/screens/po-hrm-settings-w3-browser-retry-02/` |
| **portal_url** | `http://127.0.0.1:5173/command-center/hrm/settings?tab=<id>` · HRM `:28001` · persona `ceo@xe.vn` / `main` |
| **journey_l25** | **L2.5 N/A** for this WI (QA scope = narrow mutate+F5 catalog tabs). **DENY** promote unrelated **J-*** from this stamp alone. |
| **crud_or_matrix** | UF-SET-W3-A01/B01/B02/B07 + C03 canvas · U65 Thêm→Lưu→parent F5 → `settings-catalog-row-{slug}` |
| **Verdict** | **GO WITH CONDITIONS** |
| **ack_status** | **PASS_TO_PM** |
| **stamp** | **`SETW3QC1-MSN9KGQC1`** · annotates QA **`SETW3RT9-MSN9KG40`** + FE **`PO-HRM-SETTINGS-W3-F5-LIST-FE-07`** |
| **U65** | zero-seed · browser-primary · no `pnpm seed:*` |
| **OS honesty** | `settings_catalog_e2e_ready=false` · `C-SLICE-≠-MODULE` · **cấm** claim Settings module UAT / full W3 DONE |

---

## Verdict summary

**GO WITH CONDITIONS** — **ACCEPT** bounded W3 **browser F5** slice after QA **`QA-PO-HRM-SETTINGS-W3-BROWSER-01-RETEST-03`** (**`SETW3RT9-MSN9KG40`**): **F5 4/4** (was **0/4** on **`SETW3RT8-MSN95NP4`** / retry-08) with **FE-07** parent tab + focus fix verified on live `:5173`.

**NOT** full 18-tab W3 inventory sweep. **NOT** Settings module UAT. **NOT** Phase 1 DONE.

Audited: retry-09 MD · machine JSON · FE-07 lineage · fidelity parent GWC locks · U65 path · P2 console 500 classification.

---

## Honesty locks (mandatory)

| Flag / claim | Value | QC |
|--------------|-------|-----|
| **`settings_catalog_e2e_ready` / module Settings UAT** | **`false`** | **DENIED** flip |
| **Full W3 18-tab browser sweep DONE** | **DENIED** | 4 catalog + templates leg only |
| **Phase 1 DONE** | **NOT claimed** | program gates open |
| **`C-SLICE-≠-MODULE`** | **RETAIN** | slice ≠ module GO |
| **Seed in UAT evidence** | **DENIED** (U65) | QA browser mutate path |
| **Supersede `SETFIDQC1-MSN8VQ3L`** | **NO** | **RETAIN** parent · this gate **narrows** F5 remount proof |

### PM promote decision (explicit)

| Question | Answer |
|----------|--------|
| May PM seal **RETEST-03 / FE-07 F5** chain (`SETW3QC1-MSN9KGQC1`)? | **YES** |
| May PM claim **UF-SET-W3** F5 on 4 catalog tabs **CLOSED** for CC parent reload path? | **YES** — QA 4/4 |
| May PM claim **full W3 QA-PO-HRM-SETTINGS-W3-BROWSER-01** (all tabs) DONE? | **NO** |
| May PM flip `settings_catalog_e2e_ready=true`? | **NO** |
| Waive P2 console 500 without owner? | **NO** — **OPEN** · optional dev-fe spot-check |

---

## Classification

| Signal | Class | Disposition |
|--------|-------|-------------|
| 4× catalog POST **200** + pre-F5 row | PRODUCT L2 | **ACCEPT** · **CLOSED** |
| Parent CC F5 **`settings-catalog-row-{slug}`** 4/4 | PRODUCT L2 + AC post-mutate | **ACCEPT** · **CLOSED** (FE-07) |
| `contract-templates` `ctr-tpl-canvas` | PRODUCT L2 smoke | **ACCEPT** · **CLOSED** |
| 1× console **500** (`Failed to load resource`) | PRODUCT OBS | **OPEN** P2 · non-blocking for this slice |
| Full 18-tab W3 sweep | OUT OF SCOPE | **NOT TESTED** |
| Honesty / seed / module UAT | GOVERNANCE | **LOCKED DENY** |

---

## Command table (verify)

| Command | Result |
|---------|--------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-settings-w3-browser-01-retry-09.md` | **PASS** · exit **0** · **8/8** |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-settings-w3-qc-narrow-gate-01.md` | **PASS** · exit **0** · QC SoT **8/8** |
| `pnpm run qc:fe-be-health` (cite QA · `PORTAL_DEV_URL=http://127.0.0.1:5173`) | **PASS** · exit **0** |
| Live runner `node scripts/qa/_tmp-po-hrm-settings-w3-browser-retry-02.mjs` (cite QA) | **PASS** · `failCount=0` |

---

## Conditions (GWC)

1. **Honesty:** `settings_catalog_e2e_ready=false` · **DENY** Settings module UAT · **DENY** Phase 1 · seed · honesty banner flip.
2. **CLOSED:** **FE-07** parent `?tab=` + parent `localStorage` · **F5 4/4** on att/emp/rec catalog tabs · **SETW3RT9-MSN9KG40**.
3. **RETAIN:** **`SETFIDQC1-MSN8VQ3L`** conditions (JD mutate HOLD · BA SRS wave · dept consumer seals).
4. **OPEN P2:** Console/network **500** once during run — assign **dev-fe** optional hygiene or **qa** Network spot-check on settings load; **non-blocking** for this C-SLICE.
5. **Out of slice:** Remaining W3 tabs per continuous dispatch · **`QA-PO-HRM-SETTINGS-W3-BROWSER-01`** full inventory · **`BA-PO-HRM-SETTINGS-SRS-FIDELITY-01`**.

---

## J-* / L2.5 matrix (U19)

| J-ID / UF | Verdict | Notes |
|-----------|---------|-------|
| **UF-SET-W3-A01** | **PASS** | att-attendance-codes mutate+F5 |
| **UF-SET-W3-B01** | **PASS** | emp-document-types |
| **UF-SET-W3-B02** | **PASS** | emp-employment-types |
| **UF-SET-W3-B07** | **PASS** | rec-pipeline-stages |
| **UF-SET-W3-C03** | **PASS** | contract-templates canvas smoke |
| Cross-nav **J-*** (settings module) | **NOT IN SCOPE** | narrow WI |
| Settings module UAT | **DENIED** | C-SLICE |

---

## Audit checklist

| # | Check | Evidence | QC |
|---|-------|----------|-----|
| 1 | QA pack 8/8 on retry-09 | verify script | 🟢 |
| 2 | F5 0/4 → 4/4 vs retry-08 | QA MD · JSON | 🟢 |
| 3 | FE-07 root cause documented | f5-list-fe-07 MD | 🟢 |
| 4 | U65 zero-seed | QA · FE-07 | 🟢 |
| 5 | ≠ module UAT · honesty RETAIN | parent SETFID QC | 🟢 |
| 6 | P2 console 500 classified | Classification | 🟡 OPEN |
| 7 | QC SoT 8/8 | this file | 🟢 |
| 8 | L0 fe-be-health | QA cite | 🟢 |

---

## Residual

| ID | Sev | Status | Owner |
|----|-----|--------|-------|
| **SETTINGS-W3-CONSOLE-500** | P2 | **OPEN** | **dev-fe** optional · **qa** Network spot-check |
| **W3-FULL-TAB-SWEEP** | P1 | **OPEN** | **qa** — `PO-HRM-SETTINGS-W3-UX-DENSITY-CONTINUOUS-01` |
| **BA-PO-HRM-SETTINGS-SRS-FIDELITY-01** | P1 | **OPEN** | **ba-process** — cite SETFIDQC1 |
| **Settings module UAT** | INFO | `settings_catalog_e2e_ready=false` RETAIN | **pm** — DENY flip |

**No residual PRODUCT P0** blocking this narrow C-SLICE GWC.

---

## Completion contract

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** |
| **next_owner** | **pm** → bus seal **`SETW3QC1-MSN9KGQC1`** · **qa** W3 sweep kế hoặc **dev-fe** P2 500 |
| **evidence_path** | `docs/qa/evidence/po-hrm-settings-w3-qc-narrow-gate-01.md` |
| **completion_report** | GWC after **`SETW3RT9-MSN9KG40`**: FE-07 F5 **4/4 CLOSED** · mutate 4/4 · templates canvas · U65 · P2 console 500 **OPEN** · `settings_catalog_e2e_ready=false` · stamp **`SETW3QC1-MSN9KGQC1`**. QA pack **8/8** · QC SoT **8/8**. |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PM-PO-HRM-SETTINGS-W3-SEAL-01
role: pm
read_first:
  - docs/qa/evidence/po-hrm-settings-w3-qc-narrow-gate-01.md
  - docs/qa/evidence/qc-po-hrm-settings-fidelity-gate-01.md
entry_criteria: QC SETW3QC1-MSN9KGQC1 PASS_TO_PM; RETEST-03 chain complete; must_keep SETFIDQC1 honesty locks
exit_criteria: Bus seal SETW3QC1-MSN9KGQC1; TEAM_WORKING_NOW close QA-PO-HRM-SETTINGS-W3-BROWSER-01-RETEST-03; dispatch qa W3 full tab sweep OR dev-fe P2 SETTINGS-W3-CONSOLE-500 per residual; U88 ba-process if not already DISPATCHED
cấm: settings_catalog_e2e_ready flip · claim full W3 browser DONE · seed
evidence_path: docs/program/AGENT_MESSAGE_BUS.md
```

---

## stamp

`SETW3QC1-MSN9KGQC1` · 2026-08-10 · W3 narrow browser **C-SLICE GWC SEALED** · QA **`SETW3RT9-MSN9KG40`** · FE-07 F5 **4/4** · **≠** full W3 sweep · **≠** Settings module UAT · `settings_catalog_e2e_ready=false` · P2 console 500 **OPEN**

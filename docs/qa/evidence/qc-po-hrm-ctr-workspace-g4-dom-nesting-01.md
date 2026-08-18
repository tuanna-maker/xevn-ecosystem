# Evidence — PO-HRM-CTR-WORKSPACE-G4-DOM-NESTING-QC-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-CTR-WORKSPACE-G4-DOM-NESTING-QC-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-11 |
| **lane** | governance — **C-SLICE** DOM nesting console hygiene · **not** CTR module UAT · **not** printable ready |
| **qa_ref** | [`qa-po-hrm-ctr-workspace-g4-dom-nesting-01.md`](qa-po-hrm-ctr-workspace-g4-dom-nesting-01.md) · stamp **`CTRWSG4DOM-MSO6AR3A`** · raw `_tmp-po-hrm-ctr-workspace-g4-dom-nesting-qa-01.json` |
| **fe_ref** | [`po-hrm-ctr-workspace-fe-dom-nesting-01.md`](po-hrm-ctr-workspace-fe-dom-nesting-01.md) · `DEF-CTR-G4-DOM-NESTING-P2` fix |
| **prior_gwc** | [`qc-po-hrm-ctr-workspace-g4-edit-deeplink-01.md`](qc-po-hrm-ctr-workspace-g4-edit-deeplink-01.md) · **`CTRWSG4EDQC1-MSO2JT9QC1`** · [`qc-po-hrm-ctr-workspace-g4-subject-rec-nv-first-01.md`](qc-po-hrm-ctr-workspace-g4-subject-rec-nv-first-01.md) · **`CTRG4NVFRQC1-MSO3QNLZQC1`** |
| **hdsd_align** | `docs/hrm/ui-screens/UI-HRM-CTR-WORKSPACE.md` |
| **Verdict** | **GO WITH CONDITIONS** |
| **ack_status** | **PASS_TO_PM** |
| **stamp** | **`CTRWSG4DOMQC1-MSO6AR3QC1`** · annotates **`CTRWSG4DOM-MSO6AR3A`** |
| **portal_url** | `http://127.0.0.1:5173/command-center/hrm/contracts` · hrm-api `:28001` · persona `ceo@xe.vn` / `company_id=main` |
| **U65** | zero-seed · browser-primary · no `pnpm seed:*` |
| **OS honesty** | `contracts_printable_ready=false` · `C-SLICE-≠-MODULE` · **cấm** UF-HRM-10 / full G4 matrix promote |

---

## Verdict summary

**GO WITH CONDITIONS** — **ACCEPT** C-SLICE DOM nesting after QA **`CTRWSG4DOM-MSO6AR3A`**: **DEF-CTR-G4-DOM-NESTING-P2** **CLOSED** · view/create/edit workspace open **0** `validateDOMNesting` Badge-in-`<p>` · G3/G4 create/edit deep-link spot regression **PASS** · L0 **`qc:dev-stack`** + **`qc:fe-be-health`** exit **0** · U65 browser + screenshots on disk.

**NOT Phase 1 DONE. NOT CTR module UAT. NOT `contracts_printable_ready`. NOT UF-HRM-10 promote.**

Audited: QA MD · JSON · screens · FE fix lineage (`ContractWorkspaceViewBody` `<p>`→`<div>`) · prior GWC seals · honesty locks · PM seal carry rows.

---

## Honesty locks (mandatory)

| Flag / claim | Value | QC |
|--------------|-------|-----|
| **`contracts_printable_ready` / CTR module UAT** | **`false`** | **DENIED** flip |
| **Promote UF-HRM-10 from this seat** | **DENIED** | C-SLICE boundary |
| **Full G4 matrix GO** | **DENIED** | carry rows remain |
| **Seed in UAT evidence** | **DENIED** (U65) | QA · API read-only prereq |
| **`C-SLICE-≠-MODULE`** | **RETAIN** | DOM nesting slice ≠ module |
| **Prior GWC seals** | **RETAIN** | edit deeplink · NV-first CREATE — not superseded |

### PM promote decision (explicit)

| Question | Answer |
|----------|--------|
| May PM set `contracts_printable_ready=true` / claim CTR module UAT? | **NO** |
| May PM promote **UF-HRM-10** from this seat? | **NO** |
| May PM close **DEF-CTR-G4-DOM-NESTING-P2**? | **YES** |
| May PM annotate bus with **`CTRWSG4DOMQC1-MSO6AR3QC1`**? | **YES** |
| May PM promote full G4 matrix / printable spine? | **NO** |

---

## Classification

| Signal | Class | Disposition |
|--------|-------|-------------|
| **DEF-CTR-G4-DOM-NESTING-P2** Badge in `<p>` view «Mẫu in» | PRODUCT P2 console | **CLOSED** |
| View workspace Eye → Step1 «Mẫu in» | PRODUCT L2 + cross-nav | **ACCEPT** · **PASS** |
| Create deep-link `?workspace=create` | PRODUCT L2.5 cross-nav | **ACCEPT** · **PASS** |
| Edit deep-link `?workspace=edit&contractId=` | PRODUCT L2.5 cross-nav | **ACCEPT** · **PASS** · G3/G4 regression |
| **WS-G4-07** full confirm dialog | PRODUCT | **OPEN** carry · **out of slice** |
| **BR-CTR-CREATE-08** FE banner | PRODUCT P2 | **OPEN** carry · **out of slice** |
| **WS-G4-12..14** profile/REC hire | PRODUCT | **BLOCKED** U65 carry · **out of slice** |
| QA MD pack verify **4/8** (portal_url · journey_l25 · residual_section · timestamp) | PROCESS OBS | **ACCEPT** · QC SoT **8/8** on this file |
| Honesty / seed / module UAT | GOVERNANCE | **LOCKED DENY** |

---

## Command table (verify)

| Command | Result |
|---------|--------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qc-po-hrm-ctr-workspace-g4-dom-nesting-01.md` | **PASS** · exit **0** (QC SoT) |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qa-po-hrm-ctr-workspace-g4-dom-nesting-01.md` | **FAIL** · **4/8** PROCESS OBS — **non-blocking**; QC audits QA MD + JSON |
| `pnpm run qc:dev-stack` (cite QA) | **PASS** · exit **0** |
| `pnpm run qc:fe-be-health` (cite QA) | **PASS** · exit **0** |
| `pnpm exec tsc --noEmit` (cite FE) | **PASS** exit **0** |

---

## Conditions (GWC)

1. **Honesty:** `contracts_printable_ready=false` · **DENY** CTR module UAT · **DENY** UF-HRM-10 · **DENY** Phase 1 · seed · honesty banner flip.
2. **P2 CLOSED:** **DEF-CTR-G4-DOM-NESTING-P2** — `hdsd-contracts-view-print-template` row uses valid DOM; **0** nesting warnings on view/create/edit workspace open.
3. **L2.5 (this slice):** view Eye cross-nav · create/edit deep-link regression **PASS** — not full CREATE mutate chain.
4. **RETAIN prior GWC:** **`CTRWSG4EDQC1-MSO2JT9QC1`** · **`CTRG4NVFRQC1-MSO3QNLZQC1`** — do not conflate with DOM slice seal.
5. **Carry (non-blocking this GWC):** WS-G4-07 full confirm · BR-CTR-CREATE-08 banner · WS-G4-12..14 profile/REC — per PM seal dispatch table.
6. **Out of slice:** Full G4 matrix 18 rows · printable PDF spine · UF-HRM-10 — **not** re-audited here.

---

## J-* L2.5 / cross-nav matrix (U19)

| J-ID / row | Verdict | Notes |
|------------|---------|-------|
| **J-HRM-03** (list → view workspace) | **PASS** | Eye → `ctr-workspace-view-root` · `hdsd-contracts-view-print-template` · **0** nesting warnings |
| Create deep-link cross-nav | **PASS** | `?workspace=create` → `ctr-create-step-1` |
| Edit deep-link cross-nav (G3/G4) | **PASS** | `?workspace=edit&contractId=` → `data-ctr-workspace-mode=edit` |
| **J-HRM-CTR-CREATE-01/02** | **NOT IN SLICE** | prior NV-first GWC — **not** re-run here |
| **UF-HRM-10** | **DENIED** | **cấm** promote from DOM hygiene seat |
| CTR module UAT | **DENIED** | C-SLICE |

**PM action:** seal DOM nesting GWC **`CTRWSG4DOMQC1-MSO6AR3QC1`** on bus · update PM seal carry row **CLOSED** · continue residual carry dispatch.

---

## Slice matrix (narrow)

| Scenario | Verdict | Notes |
|----------|---------|-------|
| View workspace «Mẫu in» | **PASS** | Primary defect surface — **CLOSED** |
| Create workspace open | **PASS** | **0** nesting warnings |
| Edit workspace open | **PASS** | G4 edit deeplink regression spot |
| WS-G4-07 confirm full | **OPEN** | carry · not in slice |
| WS-G4-12..14 profile | **BLOCKED** | U65 carry |

---

## Audit checklist

| # | Check | Evidence | QC |
|---|-------|----------|-----|
| 1 | DOM nesting P2 **CLOSED** · console clean on open | QA · FE fix | 🟢 |
| 2 | ≠ CTR module UAT · `contracts_printable_ready=false` | QA honesty | 🟢 |
| 3 | Create/edit/view regression spot | QA matrix | 🟢 |
| 4 | U65 zero-seed · API read-only prereq | QA JSON | 🟢 |
| 5 | UF-HRM-10 / full matrix **not** promoted | exit criteria | 🟢 |
| 6 | Screenshots on disk (3 PNG) | QA screens dir | 🟢 |
| 7 | Evidence pack QC SoT | this file | 🟢 **8/8** |
| 8 | QA MD pack gaps | verify 4/8 on QA MD | 🟡 OBS · non-blocking |

---

## Residual

| ID | Sev | Status | Owner |
|----|-----|--------|-------|
| **WS-G4-07** full confirm dialog | HOLD | **OPEN** | **qa** · `PO-HRM-CTR-WORKSPACE-G4-WS-G4-07-CONFIRM-QA-01` |
| **BR-CTR-CREATE-08** FE banner | P2 | **OPEN** | **dev-fe** · `…-BANNER-FE-01` |
| **WS-G4-12..14** profile/REC | BLOCKED | **OPEN** U65 | **qa** · `…-PROFILE-REC-QA-01` |
| **UF-HRM-10** | INFO | **NOT promoted** | **pm** — DENY until module slice gates close |
| CTR module UAT | INFO | `contracts_printable_ready=false` **RETAIN** | **pm** |
| QA pack gaps on QA MD | OBS | PROCESS · portal_url · journey · residual · date | **qa** optional backfill |

**No residual PRODUCT defect** blocking this **DOM nesting** C-SLICE GWC.

---

## Completion contract

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** |
| **next_owner** | **pm** → bus seal · update PM-HRM-CTR-WORKSPACE-G4-NV-FIRST-SEAL carry |
| **evidence_path** | `docs/qa/evidence/qc-po-hrm-ctr-workspace-g4-dom-nesting-01.md` |
| **completion_report** | GWC after **`CTRWSG4DOM-MSO6AR3A`**: **DEF-CTR-G4-DOM-NESTING-P2** **CLOSED** · view/create/edit **0** `validateDOMNesting` · `contracts_printable_ready=false` · ≠ CTR module UAT · ≠ UF-HRM-10 · stamp **`CTRWSG4DOMQC1-MSO6AR3QC1`**. QA pack **4/8** OBS · QC SoT **8/8**. |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PM-HRM-CTR-WORKSPACE-G4-NV-FIRST-SEAL-01 (carry update)
role: pm
read_first:
  - docs/qa/evidence/qc-po-hrm-ctr-workspace-g4-dom-nesting-01.md
  - docs/program/dispatch/PM-HRM-CTR-WORKSPACE-G4-NV-FIRST-SEAL-01.md
entry_criteria: QC GWC CTRWSG4DOMQC1-MSO6AR3QC1 sealed; DEF-CTR-G4-DOM-NESTING-P2 CLOSED
exit_criteria: Bus stamp DOM nesting GWC; update seal carry table — DOM-NESTING row CLOSED; dispatch residual carry (WS-G4-07 confirm · BR-CTR-CREATE-08 banner · WS-G4-12..14 profile) per PM seal; no contracts_printable_ready flip
must_keep: contracts_printable_ready=false; RETAIN CTRWSG4EDQC1+CTRG4NVFRQC1 GWC stamps
```

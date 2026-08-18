# Evidence — PO-HRM-CTR-WORKSPACE-G4-EDIT-DEEPLINK-QC-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-CTR-WORKSPACE-G4-EDIT-DEEPLINK-QC-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-11 |
| **lane** | governance — **C-SLICE** edit deep-link · **not** CTR module UAT · **not** printable ready |
| **qa_ref** | [`qa-po-hrm-ctr-workspace-g4-edit-deeplink-retest-01.md`](qa-po-hrm-ctr-workspace-g4-edit-deeplink-retest-01.md) · stamp **`CTRWSG4ED-MSO2JT9Z`** · raw `_tmp-po-hrm-ctr-workspace-g4-edit-deeplink-qa-01.json` |
| **fe_ref** | [`po-hrm-ctr-workspace-fe-edit-deeplink-01.md`](po-hrm-ctr-workspace-fe-edit-deeplink-01.md) · `DEF-CTR-G4-EDIT-DEEPLINK-P1` fix |
| **prior_fail** | [`qa-po-hrm-ctr-workspace-g4-retest-01.md`](qa-po-hrm-ctr-workspace-g4-retest-01.md) § WS-G4-03-EDIT **FAIL** |
| **hdsd_align** | `docs/hrm/ui-screens/UI-HRM-CTR-WORKSPACE.md` |
| **Verdict** | **GO WITH CONDITIONS** |
| **ack_status** | **PASS_TO_PM** |
| **stamp** | **`CTRWSG4EDQC1-MSO2JT9QC1`** · annotates **`CTRWSG4ED-MSO2JT9Z`** |
| **portal_url** | `http://127.0.0.1:5173/command-center/hrm/contracts` · hrm-api `:28001` · persona `ceo@xe.vn` / `company_id=main` |
| **U65** | zero-seed · browser-primary · no `pnpm seed:*` |
| **OS honesty** | `contracts_printable_ready=false` · `C-SLICE-≠-MODULE` · **cấm** UF-HRM-10 / full G4 matrix promote |

---

## Verdict summary

**GO WITH CONDITIONS** — **ACCEPT** C-SLICE edit deep-link after QA **`CTRWSG4ED-MSO2JT9Z`**: **WS-G4-03-EDIT** **PASS** · create/view deep-link regression **PASS** · **DEF-CTR-G4-EDIT-DEEPLINK-P1** **CLOSED** · L0 **`qc:dev-stack`** + **`qc:fe-be-health`** exit **0** · U65 browser evidence + screenshots.

**NOT Phase 1 DONE. NOT CTR module UAT. NOT `contracts_printable_ready`. NOT UF-HRM-10 promote.**

Audited: QA MD · JSON · screens · FE fix lineage · honesty locks · CREATE `start_date` P0 carry · QA pack gaps.

---

## Honesty locks (mandatory)

| Flag / claim | Value | QC |
|--------------|-------|-----|
| **`contracts_printable_ready` / CTR module UAT** | **`false`** | **DENIED** flip |
| **Promote UF-HRM-10 from this seat** | **DENIED** | C-SLICE boundary |
| **Full G4 matrix GO while CREATE P0 open** | **DENIED** | WS-G4-02/06/07 carry |
| **Seed in UAT evidence** | **DENIED** (U65) | QA · API read-only prereq |
| **`C-SLICE-≠-MODULE`** | **RETAIN** | edit deeplink slice ≠ module |

### PM promote decision (explicit)

| Question | Answer |
|----------|--------|
| May PM set `contracts_printable_ready=true` / claim CTR module UAT? | **NO** |
| May PM promote **UF-HRM-10** from this seat? | **NO** |
| May PM close **WS-G4-03-EDIT** / **DEF-CTR-G4-EDIT-DEEPLINK-P1**? | **YES** |
| May PM annotate bus with **`CTRWSG4EDQC1-MSO2JT9QC1`**? | **YES** |
| May PM promote full G4 matrix / CREATE mutate chain? | **NO** — **DEF-CTR-G4-CREATE-START-DATE-400** P0 **OPEN** |

---

## Classification

| Signal | Class | Disposition |
|--------|-------|-------------|
| **WS-G4-03-EDIT** CC parent `?workspace=edit&contractId=` → Step1 edit shell | PRODUCT L2.5 cross-nav | **ACCEPT** · **CLOSED** |
| Create / view deep-link regression (G3 unchanged) | PRODUCT L2.5 | **ACCEPT** · **PASS** |
| **DEF-CTR-G4-EDIT-DEEPLINK-P1** | PRODUCT P1 | **CLOSED** |
| **DEF-CTR-G4-CREATE-START-DATE-400** POST 400 Step1→2 | PRODUCT P0 | **OPEN** · **out of slice** · blocks WS-G4-02/06/07 |
| `validateDOMNesting` Badge in `<p>` view workspace | PRODUCT P2 | **OPEN** · non-blocking |
| QA MD pack verify **4/8** (portal_url · journey_l25 · residual_section · timestamp) | PROCESS OBS | **ACCEPT** · QC SoT **8/8** on this file |
| Honesty / seed / module UAT | GOVERNANCE | **LOCKED DENY** |

---

## Command table (verify)

| Command | Result |
|---------|--------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qc-po-hrm-ctr-workspace-g4-edit-deeplink-01.md` | **PASS** · exit **0** (QC SoT) |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qa-po-hrm-ctr-workspace-g4-edit-deeplink-retest-01.md` | **FAIL** · **4/8** PROCESS OBS — **non-blocking**; QC audits QA MD + JSON |
| `pnpm run qc:dev-stack` (cite QA) | **PASS** · exit **0** |
| `pnpm run qc:fe-be-health` (cite QA) | **PASS** · exit **0** |
| `pnpm --filter hrm-fe test contractWorkspace` (cite FE) | **PASS (18)** |

---

## Conditions (GWC)

1. **Honesty:** `contracts_printable_ready=false` · **DENY** CTR module UAT · **DENY** UF-HRM-10 · **DENY** Phase 1 · seed · honesty banner flip.
2. **P1 CLOSED:** **DEF-CTR-G4-EDIT-DEEPLINK-P1** — parent portal query merge · edit shell mounts · GET contract **200**.
3. **L2.5 CLOSED (this slice):** **WS-G4-03-EDIT** deep-link cross-nav **PASS** · create/view regression **PASS**.
4. **P0 OPEN (carry — non-blocking this GWC):** **DEF-CTR-G4-CREATE-START-DATE-400** — blocks **WS-G4-02** · **WS-G4-06** · **WS-G4-07** · **J-HRM-CTR-CREATE-01/02**; parallel QA retest may be in-flight (`51c2d44c`).
5. **P2 OPEN (non-blocking):** **DEF-CTR-G4-DOM-NESTING-P2** — console `validateDOMNesting` on view workspace.
6. **Out of slice:** Full G4 matrix 18 rows · printable spine · REC hire CTA · profile prefill — **not** re-audited here.

---

## J-* L2.5 / cross-nav matrix (U19)

| J-ID / row | Verdict | Notes |
|------------|---------|-------|
| **WS-G4-03-EDIT** (deep-link cross-nav) | **PASS** | CC parent URL → iframe merge → `ctr-create-step-1` · `data-ctr-workspace-mode=edit` · GET **200** |
| **J-HRM-03** (list → view regression) | **PASS** | Eye → view workspace · `hdsd-contracts-view-body` · GET **200** |
| Create deep-link `?workspace=create` | **PASS** | G3 regression · `data-ctr-workspace-mode=create` |
| **J-HRM-CTR-CREATE-01** | **NOT IN SLICE** | **OPEN** carry · POST 400 `start_date` — **DENY** promote |
| **J-HRM-CTR-CREATE-02** | **NOT IN SLICE** | **BLOCKED** by CREATE P0 — **DENY** promote |
| **UF-HRM-10** | **DENIED** | **cấm** promote while CREATE lane open |
| CTR module UAT | **DENIED** | C-SLICE |

**PM action:** seal edit deep-link GWC **`CTRWSG4EDQC1-MSO2JT9QC1`** on bus · **DENY** module / UF-HRM-10 flip · continue CREATE `start_date` lane separately.

---

## Slice matrix (WS-G4 narrow)

| Row | Verdict | Notes |
|-----|---------|-------|
| **WS-G4-03-EDIT** | **PASS** | Primary scope — **CLOSED** |
| **WS-G4-03-CREATE** (deeplink) | **PASS** | Regression smoke |
| **WS-G4-09** (view) | **PASS** | Regression Eye view |
| **WS-G4-02** | **OPEN** | CREATE mutate · P0 `start_date` — **carry** |
| **WS-G4-06** | **OPEN** | DnD Step2 — blocked by WS-G4-02 |
| **WS-G4-07** | **OPEN** | F5 mutate — blocked by WS-G4-02 |

---

## Audit checklist

| # | Check | Evidence | QC |
|---|-------|----------|-----|
| 1 | Edit deep-link P1 **CLOSED** · L2.5 cross-nav | QA · FE fix | 🟢 |
| 2 | ≠ CTR module UAT · `contracts_printable_ready=false` | QA honesty | 🟢 |
| 3 | Create/view regression unchanged (G3) | QA regression block | 🟢 |
| 4 | U65 zero-seed · Network GET 2xx | QA JSON | 🟢 |
| 5 | CREATE `start_date` P0 acknowledged · not promoted | QA defects | 🟡 **OPEN P0 carry** |
| 6 | UF-HRM-10 / full matrix **not** promoted | exit criteria | 🟢 |
| 7 | Evidence pack QC SoT | this file | 🟢 **8/8** |
| 8 | QA MD pack gaps | verify 4/8 on QA MD | 🟡 OBS · non-blocking |

---

## Residual

| ID | Sev | Status | Owner |
|----|-----|--------|-------|
| **DEF-CTR-G4-CREATE-START-DATE-400** | P0 | **OPEN** | **dev-be** / **dev-fe** — blocks WS-G4-02/06/07 · parallel QA retest may run |
| **DEF-CTR-G4-DOM-NESTING-P2** | P2 | **OPEN** | **dev-fe** — Badge inside `<p>` view workspace |
| **WS-G4-02 / 06 / 07** mutate chain | P0 | **OPEN** | blocked by `start_date` — **qa** when fix READY |
| **UF-HRM-10** | INFO | **NOT promoted** | **pm** — DENY until CREATE lane closes |
| CTR module UAT | INFO | `contracts_printable_ready=false` **RETAIN** | **pm** |
| QA pack gaps on QA MD | OBS | PROCESS · portal_url · journey · residual · date | **qa** optional backfill |

**No residual PRODUCT P0/P1** blocking this **edit deep-link** C-SLICE GWC.

---

## Completion contract

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** |
| **next_owner** | **pm** → bus seal · parallel CREATE `start_date` lane |
| **evidence_path** | `docs/qa/evidence/qc-po-hrm-ctr-workspace-g4-edit-deeplink-01.md` |
| **completion_report** | GWC after **`CTRWSG4ED-MSO2JT9Z`**: **WS-G4-03-EDIT** **PASS** · create/view regression **PASS** · **DEF-CTR-G4-EDIT-DEEPLINK-P1** **CLOSED** · `contracts_printable_ready=false` · ≠ CTR module UAT · ≠ UF-HRM-10 · CREATE `start_date` P0 **OPEN carry** · stamp **`CTRWSG4EDQC1-MSO2JT9QC1`**. QA pack **4/8** OBS · QC SoT **8/8**. |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-CTR-WORKSPACE-G4-CREATE-START-DATE-PM-SEAL-01
role: pm
read_first:
  - docs/qa/evidence/qc-po-hrm-ctr-workspace-g4-edit-deeplink-01.md
  - docs/qa/evidence/qa-po-hrm-ctr-workspace-g4-retest-01.md
entry_criteria: QC GWC CTRWSG4EDQC1-MSO2JT9QC1 sealed; WS-G4-03-EDIT CLOSED; contracts_printable_ready=false retained
exit_criteria: Bus stamp edit-deeplink GWC; dispatch qa CREATE start_date retest if dev READY_FOR_QA; do not promote UF-HRM-10 or full G4 matrix until WS-G4-02/06/07 PASS
must_keep: contracts_printable_ready=false; C-SLICE honesty; parallel CREATE retest 51c2d44c if in-flight
```

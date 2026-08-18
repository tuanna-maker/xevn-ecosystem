# Evidence — PO-HRM-CTR-WORKSPACE-G4-SUBJECT-REC-NV-FIRST-QC-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-CTR-WORKSPACE-G4-SUBJECT-REC-NV-FIRST-QC-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-11 |
| **lane** | governance — **C-SLICE** NV-first CREATE · **not** CTR module UAT · **not** printable ready |
| **qa_ref** | [`qa-po-hrm-ctr-workspace-g4-subject-rec-nv-first-retest-01.md`](qa-po-hrm-ctr-workspace-g4-subject-rec-nv-first-retest-01.md) · stamp **`CTRG4NVFR-MSO3QNLZ`** · raw `_tmp-po-hrm-ctr-g4-nv-first-retest-01.json` |
| **be_ref** | [`po-hrm-ctr-workspace-be-subject-rec-nv-first-01.md`](po-hrm-ctr-workspace-be-subject-rec-nv-first-01.md) |
| **prior_gwc** | [`qc-po-hrm-ctr-workspace-g4-edit-deeplink-01.md`](qc-po-hrm-ctr-workspace-g4-edit-deeplink-01.md) · **`CTRWSG4EDQC1-MSO2JT9QC1`** (orthogonal edit slice — **RETAIN**) |
| **hdsd_align** | `docs/hrm/ui-screens/UI-HRM-CTR-WORKSPACE.md` |
| **Verdict** | **GO WITH CONDITIONS** |
| **ack_status** | **PASS_TO_PM** |
| **stamp** | **`CTRG4NVFRQC1-MSO3QNLZQC1`** · annotates **`CTRG4NVFR-MSO3QNLZ`** |
| **portal_url** | `http://127.0.0.1:5173/command-center/hrm/contracts` · hrm-api `:28001` · persona `ceo@xe.vn` / `company_id=main` |
| **U65** | zero-seed · browser-primary · no `pnpm seed:*` |
| **OS honesty** | `contracts_printable_ready=false` · `C-SLICE-≠-MODULE` · **cấm** UF-HRM-10 / full G4 matrix promote |

---

## Verdict summary

**GO WITH CONDITIONS** — **ACCEPT** C-SLICE NV-first CREATE after QA **`CTRG4NVFR-MSO3QNLZ`**: **DEF-CTR-G4-SUBJECT-REC-400** **CLOSED** · NV101 Step1→**Tiếp** POST **201** `HRM-CON-201` (not `HRM-CTR-SUBJECT-REC-400`) · Step2 opens · DnD **PASS** · Lưu+F5 row **PASS** · **WS-G4-02/06/07** + **J-HRM-CTR-CREATE-01/02** promoted · L0 **`qc:dev-stack`** + **`qc:fe-be-health`** exit **0** · BE jest **13/13** · U65 browser + screenshots.

**NOT Phase 1 DONE. NOT CTR module UAT. NOT `contracts_printable_ready`. NOT UF-HRM-10 promote.**

Audited: QA MD · JSON · screens · BE fix lineage · prior edit-deeplink GWC · honesty locks · carry rows.

---

## Honesty locks (mandatory)

| Flag / claim | Value | QC |
|--------------|-------|-----|
| **`contracts_printable_ready` / CTR module UAT** | **`false`** | **DENIED** flip |
| **Promote UF-HRM-10 from this seat** | **DENIED** | C-SLICE boundary |
| **Full G4 matrix GO** | **DENIED** | WS-G4-12..14 profile/REC still BLOCKED U65 |
| **Seed in UAT evidence** | **DENIED** (U65) | QA · pilot NV101 `candidate_id: null` |
| **`C-SLICE-≠-MODULE`** | **RETAIN** | NV-first slice ≠ module |
| **Edit deep-link GWC** | **RETAIN** | **`CTRWSG4EDQC1-MSO2JT9QC1`** — orthogonal, not superseded |

### PM promote decision (explicit)

| Question | Answer |
|----------|--------|
| May PM set `contracts_printable_ready=true` / claim CTR module UAT? | **NO** |
| May PM promote **UF-HRM-10** from this seat? | **NO** |
| May PM close **DEF-CTR-G4-SUBJECT-REC-400** / promote **WS-G4-02/06/07** NV-first slice? | **YES** (WS-G4-07 with HOLD on full confirm) |
| May PM close **J-HRM-CTR-CREATE-01/02** for NV-first chain? | **YES** |
| May PM annotate bus with **`CTRG4NVFRQC1-MSO3QNLZQC1`**? | **YES** |
| May PM promote WS-G4-12..14 profile/REC hire CTA? | **NO** — U65 BLOCKED carry |

---

## Classification

| Signal | Class | Disposition |
|--------|-------|-------------|
| **DEF-CTR-G4-SUBJECT-REC-400** NV-first POST 400 | PRODUCT P0 | **CLOSED** · BA-03 AMEND |
| **WS-G4-02** NV pick → Tiếp → Step2 | PRODUCT L2 + mutate | **ACCEPT** · **PASS** |
| **WS-G4-06** DnD palette→canvas | PRODUCT L2.5 | **ACCEPT** · **PASS** |
| **WS-G4-07** mandatory gỡ confirm | PRODUCT L2.5 | **ACCEPT** · **PASS_WITH_HOLD** (spot only) |
| **WS-G4-04** F5 list persist | PRODUCT mutate | **ACCEPT** · **PASS** |
| **J-HRM-CTR-CREATE-01/02** | PRODUCT L2.5 | **ACCEPT** · **PASS** |
| **DEF-CTR-G4-CREATE-START-DATE-400** | PRODUCT P0 | **CLOSED** (prior retest — cited QA) |
| **DEF-CTR-G4-EDIT-DEEPLINK-P1** | PRODUCT P1 | **CLOSED** (prior GWC — orthogonal) |
| BR-CTR-CREATE-08 FE banner «Mở tuyển dụng» when `candidate_id` null | PRODUCT P2 | **OPEN** · non-blocking |
| WS-G4-12..14 profile/REC hire | PRODUCT | **BLOCKED** U65 · **not in slice** |
| Honesty / seed / module UAT | GOVERNANCE | **LOCKED DENY** |

---

## Command table (verify)

| Command | Result |
|---------|--------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qc-po-hrm-ctr-workspace-g4-subject-rec-nv-first-01.md` | **PASS** · exit **0** (QC SoT) |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qa-po-hrm-ctr-workspace-g4-subject-rec-nv-first-retest-01.md` | cite QA — PROCESS OBS if gaps; QC audits QA MD + JSON |
| `pnpm run qc:dev-stack` (cite QA) | **PASS** · exit **0** |
| `pnpm run qc:fe-be-health` (cite QA) | **PASS** · exit **0** |
| `npx jest po-hrm-ctr-workspace-g4-subject-rec-nv-first-01` (cite BE) | **13/13 PASS** |

---

## Conditions (GWC)

1. **Honesty:** `contracts_printable_ready=false` · **DENY** CTR module UAT · **DENY** UF-HRM-10 · **DENY** Phase 1 · seed · honesty banner flip.
2. **P0 CLOSED:** **DEF-CTR-G4-SUBJECT-REC-400** — NV-first `subject_type=employee` without REC trace → POST **201** not `HRM-CTR-SUBJECT-REC-400`; BA-03 policy retained.
3. **L2.5 CLOSED (this slice):** **J-HRM-CTR-CREATE-01** Step1→Tiếp→Step2 **PASS** · **J-HRM-CTR-CREATE-02** DnD **PASS** (0 storms).
4. **Matrix promoted:** **WS-G4-02** · **WS-G4-06** · **WS-G4-04** **PASS**; **WS-G4-07** **PASS_WITH_HOLD** — mandatory gỡ confirm dialog **not** fully exercised.
5. **P2 OPEN (non-blocking):** BR-CTR-CREATE-08 FE banner when `employee.candidate_id` null — **dev-fe** if not wired.
6. **BLOCKED carry (non-blocking this GWC):** **WS-G4-12..14** profile/REC hire CTA — U65 no hire mutate · **not** re-audited here.
7. **RETAIN prior GWC:** Edit deep-link **`CTRWSG4EDQC1-MSO2JT9QC1`** — do not conflate with CREATE slice seal.

---

## J-* L2.5 / cross-nav matrix (U19)

| J-ID / row | Verdict | Notes |
|------------|---------|-------|
| **J-HRM-CTR-CREATE-01** | **PASS** | NV-first Step1→Tiếp POST **201** → Step2 open |
| **J-HRM-CTR-CREATE-02** | **PASS** | DnD Step2 · `canvasAfter=1` · 0 DnD storms |
| **WS-G4-03-EDIT** (prior seat) | **PASS** | Sealed **`CTRWSG4EDQC1`** — **RETAIN** · not re-tested |
| **J-HRM-03** (list → view) | **NOT IN SLICE** | Regression not re-audited this seat |
| **J-HRM-REC-07-03** | **BLOCKED** | WS-G4-12..14 U65 carry |
| **UF-HRM-10** | **DENIED** | **cấm** promote |
| CTR module UAT | **DENIED** | C-SLICE |

**PM action:** seal NV-first CREATE GWC **`CTRG4NVFRQC1-MSO3QNLZQC1`** on bus · promote WS-G4-02/06/07 + J-CREATE-01/02 **narrow** · **DENY** module / UF-HRM-10 flip · carry profile/REC + FE banner P2.

---

## Slice matrix (WS-G4 narrow)

| Row | Verdict | Notes |
|-----|---------|-------|
| **WS-G4-02** | **PASS** | NV101 pick · POST **201** · Step2 open — **CLOSED** |
| **WS-G4-06** | **PASS** | DnD · `canvasAfter=1` — **CLOSED** |
| **WS-G4-07** | **PASS_WITH_HOLD** | Mandatory gỡ confirm — spot only |
| **WS-G4-04** | **PASS** | F5 row `QG4NVO3QNLZ` — **CLOSED** |
| **WS-G4-03-EDIT** | **PASS** | Prior GWC — **RETAIN** |
| **WS-G4-12..14** | **BLOCKED** | Profile/REC hire U65 — **carry** |
| **WS-G4-09..11** | **NOT IN SLICE** | View/print — not re-audited |

---

## Audit checklist

| # | Check | Evidence | QC |
|---|-------|----------|-----|
| 1 | SUBJECT-REC-400 P0 **CLOSED** · L2.5 CREATE | QA · BE · JSON | 🟢 |
| 2 | ≠ CTR module UAT · `contracts_printable_ready=false` | QA honesty | 🟢 |
| 3 | U65 zero-seed · Network POST **201** + F5 | QA JSON · screens | 🟢 |
| 4 | BE jest 13/13 · BA-03 spec ack | BE evidence | 🟢 |
| 5 | WS-G4-07 confirm dialog full path | QA PASS_WITH_HOLD | 🟡 **HOLD** non-blocking |
| 6 | UF-HRM-10 / full matrix **not** promoted | exit criteria | 🟢 |
| 7 | Evidence pack QC SoT | this file | 🟢 **8/8** |
| 8 | Profile/REC 12-14 acknowledged BLOCKED | QA not promoted | 🟢 carry |

---

## Residual

| ID | Sev | Status | Owner |
|----|-----|--------|-------|
| **WS-G4-07** mandatory gỡ confirm dialog | P2 | **PASS_WITH_HOLD** | **qa** — full confirm path when in scope |
| **BR-CTR-CREATE-08** FE banner «Mở tuyển dụng» | P2 | **OPEN** | **dev-fe** — when `candidate_id` null |
| **WS-G4-12..14** profile/REC hire CTA | INFO | **BLOCKED** U65 | **qa** when hire mutate path exists |
| **UF-HRM-10** | INFO | **NOT promoted** | **pm** — DENY until broader matrix closes |
| CTR module UAT | INFO | `contracts_printable_ready=false` **RETAIN** | **pm** |
| Full G4 matrix 18 rows | INFO | **OPEN** | **pm** / **qa** — C-SLICE only sealed |

**No residual PRODUCT P0/P1** blocking this **NV-first SUBJECT-REC** C-SLICE GWC.

---

## Completion contract

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** |
| **next_owner** | **pm** → bus seal · optional dev-fe P2 banner · profile/REC lane when unblocked |
| **evidence_path** | `docs/qa/evidence/qc-po-hrm-ctr-workspace-g4-subject-rec-nv-first-01.md` |
| **completion_report** | GWC after **`CTRG4NVFR-MSO3QNLZ`**: **DEF-CTR-G4-SUBJECT-REC-400** **CLOSED** · **WS-G4-02/06/07** + **J-HRM-CTR-CREATE-01/02** promoted (WS-G4-07 HOLD) · `contracts_printable_ready=false` · ≠ CTR module UAT · ≠ UF-HRM-10 · profile/REC 12-14 BLOCKED carry · FE banner P2 carry · stamp **`CTRG4NVFRQC1-MSO3QNLZQC1`**. QC SoT **8/8**. |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-CTR-WORKSPACE-G4-SUBJECT-REC-NV-FIRST-PM-SEAL-01
role: pm
read_first:
  - docs/qa/evidence/qc-po-hrm-ctr-workspace-g4-subject-rec-nv-first-01.md
  - docs/qa/evidence/qc-po-hrm-ctr-workspace-g4-edit-deeplink-01.md
entry_criteria: QC GWC CTRG4NVFRQC1-MSO3QNLZQC1; DEF-CTR-G4-SUBJECT-REC-400 CLOSED; WS-G4-02/06/07 + J-CREATE-01/02 narrow promote; contracts_printable_ready=false retained
exit_criteria: Bus stamp NV-first GWC; matrix annotate WS-G4-02/06/07 + J-CREATE-01/02; do not promote UF-HRM-10 or contracts_printable_ready; carry WS-G4-12..14 BLOCKED + FE banner P2 to backlog
must_keep: contracts_printable_ready=false; C-SLICE honesty; CTRWSG4EDQC1 edit GWC RETAIN; U65 zero-seed
```

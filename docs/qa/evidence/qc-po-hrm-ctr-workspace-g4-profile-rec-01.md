# Evidence — PO-HRM-CTR-WORKSPACE-G4-PROFILE-REC-QC-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-CTR-WORKSPACE-G4-PROFILE-REC-QC-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-11 |
| **lane** | governance — **C-SLICE** profile launcher + REC hire CTA probe · **not** CTR module UAT · **not** printable ready |
| **qa_ref** | [`qa-po-hrm-ctr-workspace-g4-profile-rec-01.md`](qa-po-hrm-ctr-workspace-g4-profile-rec-01.md) · stamp **`CTRG4PR-MSO684W1`** · raw `_tmp-po-hrm-ctr-workspace-g4-profile-rec-qa-01.json` |
| **pm_dispatch** | [`PM-HRM-CTR-WORKSPACE-G4-NV-FIRST-SEAL-01.md`](../program/dispatch/PM-HRM-CTR-WORKSPACE-G4-NV-FIRST-SEAL-01.md) |
| **hdsd_align** | `docs/hrm/ui-screens/UI-HRM-CTR-PROFILE-DEEP-LINK.md` · `UI-HRM-CTR-HIRE-CTA.md` |
| **Verdict** | **GO WITH CONDITIONS** |
| **ack_status** | **PASS_TO_PM** |
| **stamp** | **`CTRG4PRQC1-MSO684W1QC1`** · annotates **`CTRG4PR-MSO684W1`** |
| **portal_url** | `http://127.0.0.1:5173/command-center/hrm/employees/{id}?tab=contract` · hrm-api `:28001` · persona `ceo@xe.vn` / `company_id=main` |
| **U65** | zero-seed · browser-primary · no `pnpm seed:*` |
| **OS honesty** | `contracts_printable_ready=false` · `C-SLICE-≠-MODULE` · **cấm** UF-HRM-10 / full G4 matrix promote |

---

## Verdict summary

**GO WITH CONDITIONS** — **ACCEPT** C-SLICE profile launcher after QA **`CTRG4PR-MSO684W1`**: **J-HRM-CTR-PROFILE-01** **PASS** · **WS-G4-12** **PASS_WITH_HOLD** (Step1 opens · UV tab hidden) · **WS-G4-13/14** **BLOCKED** U65 documented (0/5 UV có `employee_id`) · L0 **`qc:dev-stack`** + **`qc:fe-be-health`** exit **0** · U65 browser + screenshots · **DEF-CTR-G4-PROFILE-URL-P2** P2 **OPEN** non-blocking.

**NOT Phase 1 DONE. NOT CTR module UAT. NOT `contracts_printable_ready`. NOT UF-HRM-10 promote.**

Audited: QA MD · JSON · screenshots · dispatch carry · prior NV-first / edit-deeplink GWC · honesty locks.

---

## Honesty locks (mandatory)

| Flag / claim | Value | QC |
|--------------|-------|-----|
| **`contracts_printable_ready` / CTR module UAT** | **`false`** | **DENIED** flip |
| **Promote UF-HRM-10 from this seat** | **DENIED** | C-SLICE boundary |
| **Full G4 matrix GO** | **DENIED** | WS-G4-13/14 BLOCKED · Settings rows PLANNED |
| **Seed in UAT evidence** | **DENIED** (U65) | QA · no hire mutate |
| **`C-SLICE-≠-MODULE`** | **RETAIN** | profile/REC slice ≠ module |
| **Prior GWC seals** | **RETAIN** | `CTRWSG4EDQC1-MSO2JT9QC1` · `CTRG4NVFRQC1-MSO3QNLZQC1` |

### PM promote decision (explicit)

| Question | Answer |
|----------|--------|
| May PM set `contracts_printable_ready=true` / claim CTR module UAT? | **NO** |
| May PM promote **UF-HRM-10** from this seat? | **NO** |
| May PM promote **J-HRM-CTR-PROFILE-01** / **WS-G4-12** (PASS_WITH_HOLD)? | **YES** |
| May PM close **WS-G4-13/14** / **J-HRM-CTR-HIRE-01** / **J-HRM-REC-07-03**? | **NO** — **BLOCKED** U65 carry |
| May PM annotate bus with **`CTRG4PRQC1-MSO684W1QC1`**? | **YES** |

---

## Classification

| Signal | Class | Disposition |
|--------|-------|-------------|
| **J-HRM-CTR-PROFILE-01** profile → tab HĐ → Thêm HĐ → workspace Step1 | PRODUCT L2.5 cross-nav | **ACCEPT** · **PASS** |
| **WS-G4-12** launcher · `ctr-create-step-1` visible · `uvTabHidden: true` | PRODUCT L2.5 | **ACCEPT** · **PASS_WITH_HOLD** |
| **DEF-CTR-G4-PROFILE-URL-P2** parent URL thiếu `workspace`/`lock_subject_employee` | PRODUCT P2 | **OPEN** · non-blocking · embed merge cosmetic |
| **WS-G4-13** REC «Tạo HĐ» CTA · 0/5 UV `employee_id` | PRODUCT U65 BLOCKED | **CARRY** · valid — cần FE hire chain |
| **WS-G4-14** hire-readiness F5 downstream | PRODUCT U65 BLOCKED | **CARRY** · phụ thuộc WS-G4-13 |
| **J-HRM-CTR-HIRE-01** · **J-HRM-REC-07-03** | PRODUCT U65 BLOCKED | **CARRY** · không promote |
| QA MD pack verify **6/8** (portal_url · residual_section format) | PROCESS OBS | **ACCEPT** · QC SoT **8/8** on this file |
| Honesty / seed / module UAT | GOVERNANCE | **LOCKED DENY** |

---

## Command table (verify)

| Command | Result |
|---------|--------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qc-po-hrm-ctr-workspace-g4-profile-rec-01.md` | **PASS** · exit **0** (QC SoT) |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qa-po-hrm-ctr-workspace-g4-profile-rec-01.md` | **FAIL** · **6/8** PROCESS OBS — portal_url label · `## Residual` heading — **non-blocking** |
| `pnpm run qc:dev-stack` (cite QA) | **PASS** · exit **0** |
| `pnpm run qc:fe-be-health` (cite QA) | **PASS** · exit **0** |

---

## Conditions (GWC)

1. **Honesty:** `contracts_printable_ready=false` · **DENY** CTR module UAT · **DENY** UF-HRM-10 · **DENY** Phase 1 · seed · honesty banner flip.
2. **L2.5 CLOSED (this slice):** **J-HRM-CTR-PROFILE-01** **PASS** — profile → tab HĐ → `ec-open-contract-workspace-create` → Step1.
3. **PASS_WITH_HOLD:** **WS-G4-12** — workspace opens · UV tab hidden; parent URL lock query **not** asserted (**P2 carry**).
4. **BLOCKED carry (non-blocking this GWC):** **WS-G4-13** REC hire CTA · **WS-G4-14** hire-readiness — U65 no hired UV (`with_employee_id: 0/5`); cần Login → Tuyển dụng → Chấp nhận offer (FE) trước retest.
5. **P2 OPEN (non-blocking):** **DEF-CTR-G4-PROFILE-URL-P2** — parent `…/contracts?tab=contract` thiếu `workspace=create` / `lock_subject_employee=1` trên CC parent (embed merge evidence gap).
6. **Out of slice:** Full G4 matrix 18 rows · printable spine · Settings WS-G4-15..17 — **not** re-audited here.

---

## J-* L2.5 / cross-nav matrix (U19)

| J-ID / row | Verdict | Notes |
|------------|---------|-------|
| **J-HRM-CTR-PROFILE-01** | **PASS** | profile → tab HĐ → Thêm HĐ → workspace create · `step1: true` |
| **WS-G4-12** | **PASS_WITH_HOLD** | Step1 visible · UV hidden · URL lock P2 |
| **J-HRM-CTR-HIRE-01** | **BLOCKED** | U65 — no hired UV · **carry** |
| **J-HRM-REC-07-03** | **BLOCKED** | hire-readiness downstream · **carry** |
| **WS-G4-13** | **BLOCKED** | REC CTA — 0 `employee_id` · U65 documented |
| **WS-G4-14** | **BLOCKED** | F5 hire-readiness chain · U65 documented |
| **UF-HRM-10** | **DENIED** | **cấm** promote |
| CTR module UAT | **DENIED** | C-SLICE |

**PM action:** seal profile/REC GWC **`CTRG4PRQC1-MSO684W1QC1`** on bus · promote **J-HRM-CTR-PROFILE-01** + **WS-G4-12** · **carry** WS-G4-13/14 BLOCKED until FE hire chain without seed cheat.

---

## Slice matrix (WS-G4 narrow)

| Row | Verdict | Notes |
|-----|---------|-------|
| **WS-G4-12** | **PASS_WITH_HOLD** | Primary scope — profile launcher **promoted** |
| **WS-G4-13** | **BLOCKED** | REC «Tạo HĐ» CTA — U65 carry |
| **WS-G4-14** | **BLOCKED** | Hire-readiness — U65 carry |

---

## Audit checklist

| # | Check | Evidence | QC |
|---|-------|----------|-----|
| 1 | Profile launcher L2.5 **PASS** | QA JSON `step1: true` · screens | 🟢 |
| 2 | ≠ CTR module UAT · `contracts_printable_ready=false` | QA honesty | 🟢 |
| 3 | WS-G4-13/14 BLOCKED U65 documented | QA prereq 0/5 `employee_id` | 🟢 |
| 4 | U65 zero-seed · no hire mutate in session | QA steps · JSON | 🟢 |
| 5 | P2 URL query residual acknowledged | DEF-CTR-G4-PROFILE-URL-P2 | 🟡 **OPEN P2** |
| 6 | UF-HRM-10 / full matrix **not** promoted | exit criteria | 🟢 |
| 7 | Evidence pack QC SoT | this file | 🟢 **8/8** |
| 8 | QA MD pack gaps | verify 6/8 on QA MD | 🟡 OBS · non-blocking |

---

## Residual

| ID | Sev | Status | Owner |
|----|-----|--------|-------|
| **DEF-CTR-G4-PROFILE-URL-P2** | P2 | **OPEN** | **dev-fe** — parent URL `workspace`/`lock_subject_employee` cosmetic |
| **WS-G4-13** REC hire CTA | INFO | **BLOCKED** U65 | **qa** when FE hire chain available (accept-offer → CTA) |
| **WS-G4-14** hire-readiness F5 | INFO | **BLOCKED** U65 | **qa** after WS-G4-13 unblocks |
| **J-HRM-CTR-HIRE-01** | INFO | **BLOCKED** | **carry** |
| **J-HRM-REC-07-03** | INFO | **BLOCKED** | **carry** |
| **UF-HRM-10** | INFO | **NOT promoted** | **pm** — DENY |
| CTR module UAT | INFO | `contracts_printable_ready=false` **RETAIN** | **pm** |
| QA pack gaps on QA MD | OBS | PROCESS · portal_url label · residual heading | **qa** optional backfill |

**No residual PRODUCT P0/P1** blocking this **profile launcher** C-SLICE GWC.

---

## Completion contract

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** |
| **next_owner** | **pm** → bus seal · update `PM-HRM-CTR-WORKSPACE-G4-NV-FIRST-SEAL-01` carry |
| **evidence_path** | `docs/qa/evidence/qc-po-hrm-ctr-workspace-g4-profile-rec-01.md` |
| **completion_report** | GWC after **`CTRG4PR-MSO684W1`**: **J-HRM-CTR-PROFILE-01** **PASS** · **WS-G4-12** **PASS_WITH_HOLD** · **WS-G4-13/14** **BLOCKED** U65 carry · **DEF-CTR-G4-PROFILE-URL-P2** P2 **OPEN** non-blocking · `contracts_printable_ready=false` · ≠ CTR module UAT · ≠ UF-HRM-10 · stamp **`CTRG4PRQC1-MSO684W1QC1`**. QA pack **6/8** OBS · QC SoT **8/8**. |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PM-HRM-CTR-WORKSPACE-G4-PROFILE-REC-PM-SEAL-01
role: pm
read_first:
  - docs/qa/evidence/qc-po-hrm-ctr-workspace-g4-profile-rec-01.md
  - docs/program/dispatch/PM-HRM-CTR-WORKSPACE-G4-NV-FIRST-SEAL-01.md
entry_criteria: QC GWC CTRG4PRQC1-MSO684W1QC1 PASS_TO_PM; J-HRM-CTR-PROFILE-01 PASS; WS-G4-12 PASS_WITH_HOLD; WS-G4-13/14 BLOCKED U65
exit_criteria: Bus stamp profile/REC GWC; update seal doc carry WS-G4-13/14 BLOCKED; retain contracts_printable_ready=false; do not promote UF-HRM-10; optional dispatch dev-fe DEF-CTR-G4-PROFILE-URL-P2 or qa FE hire chain when product unblocks
must_keep: contracts_printable_ready=false; C-SLICE honesty; U65 zero-seed for WS-G4-13 retest
```

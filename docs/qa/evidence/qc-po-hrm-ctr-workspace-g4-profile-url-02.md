# Evidence — PO-HRM-CTR-WORKSPACE-G4-PROFILE-URL-QC-02

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-CTR-WORKSPACE-G4-PROFILE-URL-QC-02` |
| **parent** | `PO-HRM-CTR-WORKSPACE-G4-PROFILE-URL-QA-02` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-11 |
| **lane** | governance — **C-SLICE** profile URL parent sync · **not** CTR module UAT · **not** printable ready |
| **qa_ref** | [`qa-po-hrm-ctr-workspace-g4-profile-url-retest-02.md`](qa-po-hrm-ctr-workspace-g4-profile-url-retest-02.md) · stamp **`CTRG4URL-MSO7HQ08`** · raw `_tmp-po-hrm-ctr-workspace-g4-profile-url-retest-02.json` |
| **fe_ref** | [`po-hrm-ctr-workspace-g4-profile-url-fe-02.md`](po-hrm-ctr-workspace-g4-profile-url-fe-02.md) |
| **pm_dispatch** | [`PM-HRM-CTR-WORKSPACE-G4-NV-FIRST-SEAL-01.md`](../program/dispatch/PM-HRM-CTR-WORKSPACE-G4-NV-FIRST-SEAL-01.md) |
| **hdsd_align** | `docs/hrm/ui-screens/UI-HRM-CTR-PROFILE-DEEP-LINK.md` |
| **Verdict** | **GO WITH CONDITIONS** |
| **ack_status** | **PASS_TO_PM** |
| **stamp** | **`CTRG4URLQC1-MSO7HQ08QC1`** · annotates **`CTRG4URL-MSO7HQ08`** |
| **portal_url** | `http://127.0.0.1:5173/command-center/hrm/contracts?tab=contract` · profile embed `http://127.0.0.1:5173/command-center/hrm/employees/33333333-3333-4333-8333-333333333333?tab=contract` · hrm-api `:28001` · persona `ceo@xe.vn` / `company_id=main` |
| **U65** | zero-seed · browser-primary · no `pnpm seed:*` |
| **OS honesty** | `contracts_printable_ready=false` · `C-SLICE-≠-MODULE` · **cấm** UF-HRM-10 / full G4 matrix promote |

---

## Verdict summary

**GO WITH CONDITIONS** — **ACCEPT** narrow C-SLICE **profile URL parent sync** after QA **`CTRG4URL-MSO7HQ08`**: **WS-G4-12** **strict PASS** (replaces prior **`CTRG4PRQC1`** PASS_WITH_HOLD on URL) · **J-HRM-CTR-PROFILE-01** **PASS** · **DEF-CTR-G4-PROFILE-EMBED-P0** + **DEF-CTR-G4-PROFILE-URL-P2** **CLOSED** · L0 **`qc:dev-stack`** + **`qc:fe-be-health`** exit **0** · L2 embed module HTTP **200** · U65 browser + screenshots.

**NOT Phase 1 DONE. NOT CTR module UAT. NOT `contracts_printable_ready`. NOT UF-HRM-10 promote.**

Audited: QA MD · JSON · screenshots · FE-02 fix scope · dispatch seal carry · prior G4 GWC stamps.

---

## Honesty locks (mandatory)

| Flag / claim | Value | QC |
|--------------|-------|-----|
| **`contracts_printable_ready` / CTR module UAT** | **`false`** | **DENIED** flip |
| **Promote UF-HRM-10 from this seat** | **DENIED** | C-SLICE boundary |
| **Full G4 matrix GO** | **DENIED** | WS-G4-13/14 separate track · Settings PLANNED |
| **Seed in UAT evidence** | **DENIED** (U65) | QA · zero-seed |
| **`C-SLICE-≠-MODULE`** | **RETAIN** | profile URL slice ≠ module |
| **Prior G4 seals** | **RETAIN** | `CTRWSG4EDQC1` · `CTRG4NVFRQC1` · `CTRG4PRQC1` · `CTRG4BR08QC1` · `CTRG4G07QC1` · `CTRWSG4DOMQC1` |

### PM promote decision (explicit)

| Question | Answer |
|----------|--------|
| May PM set `contracts_printable_ready=true` / claim CTR module UAT? | **NO** |
| May PM promote **UF-HRM-10** from this seat? | **NO** |
| May PM promote **WS-G4-12 strict** (parent URL sync)? | **YES** — supersedes PASS_WITH_HOLD on URL |
| May PM promote **J-HRM-CTR-PROFILE-01**? | **YES** |
| May PM close **DEF-CTR-G4-PROFILE-URL-F5-P3**? | **NO** — **P3 carry** explicit |
| May PM annotate bus with **`CTRG4URLQC1-MSO7HQ08QC1`**? | **YES** |

---

## Classification

| Signal | Class | Disposition |
|--------|-------|-------------|
| **DEF-CTR-G4-PROFILE-EMBED-P0** malformed JSDoc → Vite 500 | PRODUCT P0 | **CLOSED** (FE-02) |
| **DEF-CTR-G4-PROFILE-URL-P2** parent URL workspace sync on «Thêm HĐ» | PRODUCT P2 | **CLOSED** — strict click-path |
| **WS-G4-12** `workspace=create` + `employee_id` + `lock_subject_employee=1` · Step1 · UV hidden | PRODUCT L2.5 | **ACCEPT** · **strict PASS** |
| **J-HRM-CTR-PROFILE-01** profile → tab HĐ → Thêm HĐ | PRODUCT L2.5 | **ACCEPT** · **PASS** |
| **DEF-CTR-G4-PROFILE-URL-F5-P3** F5 drops workspace params on contracts parent | PRODUCT P3 | **OPEN carry** — non-blocking |
| **WS-G4-13/14** REC hire | OUT OF SLICE | **CARRY** · separate track |
| QA MD pack verify **6/8** (portal_url label · date heading) | PROCESS OBS | **ACCEPT** · QC SoT **8/8** on this file |
| Honesty / seed / module UAT | GOVERNANCE | **LOCKED DENY** |

---

## Command table (verify)

| Command | Result |
|---------|--------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qc-po-hrm-ctr-workspace-g4-profile-url-02.md` | **PASS** · exit **0** (QC SoT) |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qa-po-hrm-ctr-workspace-g4-profile-url-retest-02.md` | **FAIL** · **6/8** PROCESS OBS — `portal_url` label · `date` heading — **non-blocking** |
| `pnpm run qc:dev-stack` (cite QA) | **PASS** · exit **0** |
| `pnpm run qc:fe-be-health` (cite QA) | **PASS** · exit **0** |

---

## Conditions (GWC)

1. **Honesty:** `contracts_printable_ready=false` · **DENY** CTR module UAT · **DENY** UF-HRM-10 · **DENY** Phase 1 · seed · honesty banner flip.
2. **L2.5 CLOSED (this slice):** **J-HRM-CTR-PROFILE-01** **PASS** · **WS-G4-12** **strict PASS** — parent CC URL asserts `workspace=create` · `employee_id` · `lock_subject_employee=1`; `ctr-create-step-1` visible; UV tab hidden; NV locked.
3. **Defects CLOSED:** **DEF-CTR-G4-PROFILE-EMBED-P0** · **DEF-CTR-G4-PROFILE-URL-P2** — verified browser + L2 embed regression.
4. **P3 carry (explicit, non-blocking):** **DEF-CTR-G4-PROFILE-URL-F5-P3** — F5 reload on `/command-center/hrm/contracts?tab=contract` strips `workspace` / `employee_id` / `lock_subject_employee`; **not** in QA-02 exit criteria; owner **dev-fe** defer.
5. **Out of slice:** **WS-G4-13/14** REC hire · full G4 matrix · printable spine · Settings WS-G4-15..17 — **not** re-audited / **not** promoted here.

---

## J-* L2.5 / cross-nav matrix (U19)

| J-ID / row | Verdict | Notes |
|------------|---------|-------|
| **J-HRM-CTR-PROFILE-01** | **PASS** | profile → tab HĐ → Thêm HĐ → workspace create · embed loads · no module 500 |
| **WS-G4-12** | **PASS strict** | parent URL sync · Step1 · UV hidden · replaces **`CTRG4PRQC1`** PASS_WITH_HOLD on URL |
| **WS-G4-12-F5** | **CARRY P3** | F5 URL persistence — **DEF-CTR-G4-PROFILE-URL-F5-P3** |
| **WS-G4-13/14** | **OUT OF SLICE** | REC hire separate track · retain BLOCKED U65 on seal |
| **UF-HRM-10** | **DENIED** | **cấm** promote |
| CTR module UAT | **DENIED** | C-SLICE |

**PM action:** seal profile URL GWC **`CTRG4URLQC1-MSO7HQ08QC1`** on bus · update seal doc profile row **strict PASS** · **carry** F5 P3 · retain WS-G4-13/14 separate.

---

## Slice matrix (WS-G4 narrow — profile URL only)

| Row | Verdict | Notes |
|-----|---------|-------|
| **WS-G4-12** | **PASS strict** | Primary scope — **promoted** |
| **WS-G4-12-F5** | **CARRY P3** | F5 drops workspace query |
| **WS-G4-13/14** | **OUT OF SLICE** | REC hire — prior seal carry |

---

## Audit checklist

| # | Check | Evidence | QC |
|---|-------|----------|-----|
| 1 | P0 embed + P2 URL **CLOSED** | QA JSON · screens · FE-02 | 🟢 |
| 2 | WS-G4-12 **strict** parent URL asserts | QA parentUrl · parsed | 🟢 |
| 3 | J-HRM-CTR-PROFILE-01 **PASS** | QA journeys | 🟢 |
| 4 | ≠ CTR module UAT · `contracts_printable_ready=false` | QA honesty | 🟢 |
| 5 | U65 zero-seed | QA steps · JSON | 🟢 |
| 6 | F5 P3 carry explicit | WS-G4-12-F5 · not in exit | 🟡 **OPEN P3** |
| 7 | UF-HRM-10 / full matrix **not** promoted | exit criteria | 🟢 |
| 8 | Evidence pack QC SoT | this file verify | 🟢 **8/8** |

**No residual PRODUCT P0/P1** blocking this **profile URL sync** C-SLICE GWC.

---

## Residual

| ID | Sev | Status | Owner |
|----|-----|--------|-------|
| **DEF-CTR-G4-PROFILE-URL-F5-P3** | P3 | **OPEN carry** | **dev-fe** (defer) — F5 drops workspace params on contracts parent |
| **WS-G4-13/14** REC hire | INFO | **OUT OF SLICE** | separate track · seal carry |
| **UF-HRM-10** | INFO | **NOT promoted** | **pm** — DENY |
| CTR module UAT | INFO | `contracts_printable_ready=false` **RETAIN** | **pm** |
| QA pack gaps on QA MD | OBS | PROCESS · portal_url label · date heading | **qa** optional backfill |

---

## Completion contract

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** |
| **next_owner** | **pm** |
| **evidence_path** | `docs/qa/evidence/qc-po-hrm-ctr-workspace-g4-profile-url-02.md` |
| **completion_report** | GWC after **`CTRG4URL-MSO7HQ08`**: **WS-G4-12 strict PASS** (supersedes URL PASS_WITH_HOLD) · **J-HRM-CTR-PROFILE-01 PASS** · **DEF-CTR-G4-PROFILE-EMBED-P0** + **DEF-CTR-G4-PROFILE-URL-P2 CLOSED** · **DEF-CTR-G4-PROFILE-URL-F5-P3** P3 **carry** · `contracts_printable_ready=false` · ≠ CTR module UAT · ≠ UF-HRM-10 · stamp **`CTRG4URLQC1-MSO7HQ08QC1`**. QA pack **6/8** OBS · QC SoT **8/8**. |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PM-HRM-CTR-WORKSPACE-G4-NV-FIRST-SEAL-01
role: pm
read_first:
  - docs/qa/evidence/qc-po-hrm-ctr-workspace-g4-profile-url-02.md
  - docs/program/dispatch/PM-HRM-CTR-WORKSPACE-G4-NV-FIRST-SEAL-01.md
entry_criteria: QC GWC CTRG4URLQC1-MSO7HQ08QC1 PASS_TO_PM; WS-G4-12 strict PASS; DEF-CTR-G4-PROFILE-EMBED-P0 + DEF-CTR-G4-PROFILE-URL-P2 CLOSED
exit_criteria: Bus stamp profile URL GWC; seal doc profile_url_qc_stamp CTRG4URLQC1-MSO7HQ08QC1; retain contracts_printable_ready=false; carry DEF-CTR-G4-PROFILE-URL-F5-P3 P3; do not promote UF-HRM-10; WS-G4-13/14 separate track
must_keep: prior G4 seals; REC hire WS-G4-13/14 separate; C-SLICE honesty
ack_status: PASS_TO_PM
```

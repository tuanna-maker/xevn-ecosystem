# Evidence — PO-HRM-CTR-WORKSPACE-G4-WS-G4-07-CONFIRM-QC-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-CTR-WORKSPACE-G4-WS-G4-07-CONFIRM-QC-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-11 |
| **lane** | governance — **C-SLICE** WS-G4-07 mandatory Gỡ confirm · **not** CTR module UAT · **not** printable ready |
| **qa_ref** | [`qa-po-hrm-ctr-workspace-g4-ws-g4-07-confirm-01.md`](qa-po-hrm-ctr-workspace-g4-ws-g4-07-confirm-01.md) · stamp **`CTRG4G07-MSO6B4UU`** · raw `_tmp-po-hrm-ctr-g4-ws-g4-07-confirm-01.json` |
| **pm_dispatch** | [`PM-HRM-CTR-WORKSPACE-G4-NV-FIRST-SEAL-01.md`](../program/dispatch/PM-HRM-CTR-WORKSPACE-G4-NV-FIRST-SEAL-01.md) |
| **prior_gwc** | [`qc-po-hrm-ctr-workspace-g4-subject-rec-nv-first-01.md`](qc-po-hrm-ctr-workspace-g4-subject-rec-nv-first-01.md) · **`CTRG4NVFRQC1-MSO3QNLZQC1`** (WS-G4-07 was **PASS_WITH_HOLD**) |
| **hdsd_align** | `docs/hrm/ui-screens/UI-HRM-CTR-WORKSPACE.md` §4.2 · AC-WS-06 · AC-CTR-DND-02 |
| **Verdict** | **GO WITH CONDITIONS** |
| **ack_status** | **PASS_TO_PM** |
| **stamp** | **`CTRG4G07QC1-MSO6B4UUQC1`** · annotates **`CTRG4G07-MSO6B4UU`** |
| **portal_url** | `http://127.0.0.1:5173/command-center/hrm/contracts` · hrm-api `:28001` · persona `ceo@xe.vn` / `company_id=main` |
| **U65** | zero-seed · browser-primary · no `pnpm seed:*` |
| **OS honesty** | `contracts_printable_ready=false` · `C-SLICE-≠-MODULE` · **cấm** UF-HRM-10 / full G4 matrix promote |

---

## Verdict summary

**GO WITH CONDITIONS** — **ACCEPT** C-SLICE WS-G4-07 mandatory Gỡ confirm after QA **`CTRG4G07-MSO6B4UU`**: full browser path — Settings prep mandatory via FE PATCH **200** · Step2 canvas `countBefore=1` · Gỡ dismiss keeps row · Gỡ accept removes row · VI confirm message · `silentRemoveOnMandatory=false` · **AC-CTR-DND-02** + **AC-WS-06** **PASS** · **J-HRM-CTR-CREATE-02** confirm slice **PASS** · prior **PASS_WITH_HOLD** from **`CTRG4NVFRQC1`** **CLOSED** · L0 **`qc:dev-stack`** + **`qc:fe-be-health`** exit **0** (cite QA) · U65 browser + 4 screenshots · 0 DnD storms.

**NOT Phase 1 DONE. NOT CTR module UAT. NOT `contracts_printable_ready`. NOT UF-HRM-10 promote.**

Audited: QA MD · JSON · screenshots · prior NV-first GWC · PM dispatch carry · honesty locks.

---

## Honesty locks (mandatory)

| Flag / claim | Value | QC |
|--------------|-------|-----|
| **`contracts_printable_ready` / CTR module UAT** | **`false`** | **DENIED** flip |
| **Promote UF-HRM-10 from this seat** | **DENIED** | C-SLICE boundary |
| **Full G4 matrix GO** | **DENIED** | WS-G4-13/14 BLOCKED · Settings rows PLANNED |
| **Seed in UAT evidence** | **DENIED** (U65) | QA · Settings mandatory flip via FE only |
| **`C-SLICE-≠-MODULE`** | **RETAIN** | confirm slice ≠ module |
| **Prior GWC seals** | **RETAIN** | `CTRWSG4EDQC1` · `CTRG4NVFRQC1` · `CTRG4PRQC1` — orthogonal, not superseded |

### PM promote decision (explicit)

| Question | Answer |
|----------|--------|
| May PM set `contracts_printable_ready=true` / claim CTR module UAT? | **NO** |
| May PM promote **UF-HRM-10** from this seat? | **NO** |
| May PM promote **WS-G4-07** from **PASS_WITH_HOLD** → **PASS**? | **YES** |
| May PM close **J-HRM-CTR-CREATE-02** confirm slice on this seat? | **YES** (narrow — mandatory Gỡ path only) |
| May PM annotate bus with **`CTRG4G07QC1-MSO6B4UUQC1`**? | **YES** |
| May PM promote printable PDF / UF-HRM-10 from WS-G4-07 closure? | **NO** |

---

## Classification

| Signal | Class | Disposition |
|--------|-------|-------------|
| **WS-G4-07** mandatory Gỡ confirm full path | PRODUCT L2.5 | **ACCEPT** · **PASS** — **CLOSED** prior HOLD |
| **AC-CTR-DND-02** dismiss=giữ · accept=gỡ | PRODUCT AC | **ACCEPT** · **PASS** |
| **AC-WS-06** DnD + Gỡ mandatory | PRODUCT AC | **ACCEPT** · **PASS** |
| **J-HRM-CTR-CREATE-02** Step2 confirm slice | PRODUCT L2.5 | **ACCEPT** · **PASS** |
| `window.confirm` vs Radix dialog (cosmetic) | PRODUCT P3 | **OPEN** · non-blocking |
| Catalog THHDLD `mandatory=true` after U65 prep | DATA NOTE | **CARRY** · not reverted — documented |
| QA MD pack verify **6/8** (portal_url label · date) | PROCESS OBS | **ACCEPT** · QC SoT **8/8** on this file |
| `qc:dev-stack` Windows UV exit after all **200** | ENV | **ACCEPT** · cite QA · non-blocking |
| Honesty / seed / module UAT | GOVERNANCE | **LOCKED DENY** |

---

## Command table (verify)

| Command | Result |
|---------|--------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qc-po-hrm-ctr-workspace-g4-ws-g4-07-confirm-01.md` | **PASS** · exit **0** (QC SoT) |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qa-po-hrm-ctr-workspace-g4-ws-g4-07-confirm-01.md` | **FAIL** · **6/8** PROCESS OBS — `portal_url` label · `date: YYYY-MM-DD` — **non-blocking** |
| `pnpm run qc:dev-stack` (QC spot-check) | **PASS** · hrm **200** · xbos **200** · portal **200** · Windows UV exit quirk |
| `pnpm run qc:fe-be-health` (cite QA) | **PASS** · exit **0** |

---

## Conditions (GWC)

1. **Honesty:** `contracts_printable_ready=false` · **DENY** CTR module UAT · **DENY** UF-HRM-10 · **DENY** Phase 1 · seed · honesty banner flip.
2. **L2.5 CLOSED (this slice):** **WS-G4-07** mandatory Gỡ — VI confirm «Điều khoản này là bắt buộc theo mẫu…» · dismiss canvas **1** · accept canvas **0** · no silent mandatory remove.
3. **Prior HOLD CLOSED:** **`CTRG4NVFRQC1`** row **WS-G4-07 PASS_WITH_HOLD** → **PASS** on this seat only (confirm dialog full path).
4. **P3 OPEN (non-blocking):** native `window.confirm` (OK/Cancel) vs Radix Hủy/Đồng ý — behavior correct; cosmetic UX carry.
5. **DATA NOTE (non-blocking):** clause THHDLD flipped `mandatory=true` via Settings FE prep — not reverted post-test (U65 documented).
6. **BLOCKED carry (non-blocking this GWC):** **WS-G4-13/14** REC hire · **BR-CTR-CREATE-08** FE banner P2 · **DEF-CTR-G4-PROFILE-URL-P2** · full G4 matrix — per PM seal.
7. **RETAIN prior GWC:** Edit **`CTRWSG4EDQC1`** · NV-first **`CTRG4NVFRQC1`** · profile **`CTRG4PRQC1`** — do not conflate with WS-G4-07 confirm seal.

---

## J-* L2.5 / cross-nav matrix (U19)

| J-ID / row | Verdict | Notes |
|------------|---------|-------|
| **J-HRM-CTR-CREATE-02** | **PASS** | Step2 mandatory Gỡ confirm exercised · `ws_g4_07: PASS` |
| **WS-G4-07** | **PASS** | **CLOSED** — was **PASS_WITH_HOLD** in **`CTRG4NVFRQC1`** |
| **J-HRM-CTR-CREATE-01** | **RETAIN** | Sealed **`CTRG4NVFRQC1`** — not re-tested |
| **J-HRM-CTR-PROFILE-01** | **RETAIN** | Sealed **`CTRG4PRQC1`** — not re-tested |
| **UF-HRM-10** | **DENIED** | **cấm** promote |
| CTR module UAT | **DENIED** | C-SLICE |

**PM action:** seal WS-G4-07 GWC **`CTRG4G07QC1-MSO6B4UUQC1`** on bus · update PM seal carry **WS-G4-07** HOLD → **PASS** · **DENY** module / UF-HRM-10 flip · retain other carry rows.

---

## Slice matrix (WS-G4 narrow)

| Row | Verdict | Notes |
|-----|---------|-------|
| **WS-G4-07** | **PASS** | Mandatory Gỡ confirm full path — **CLOSED** |
| **WS-G4-02/04/06** | **PASS** | Prior **`CTRG4NVFRQC1`** — **RETAIN** |
| **WS-G4-03-EDIT** | **PASS** | Prior **`CTRWSG4EDQC1`** — **RETAIN** |
| **WS-G4-12** | **PASS_WITH_HOLD** | Prior **`CTRG4PRQC1`** — **RETAIN** |
| **WS-G4-13/14** | **BLOCKED** | REC hire U65 — **carry** |
| **WS-G4-09..11** | **NOT IN SLICE** | View/print — not re-audited |

---

## Audit checklist

| # | Check | Evidence | QC |
|---|-------|----------|-----|
| 1 | WS-G4-07 confirm full path **CLOSED** | QA JSON · screens · VI message | 🟢 |
| 2 | Prior **PASS_WITH_HOLD** superseded | `CTRG4NVFRQC1` vs QA stamp | 🟢 |
| 3 | ≠ CTR module UAT · `contracts_printable_ready=false` | QA honesty | 🟢 |
| 4 | U65 zero-seed · Settings PATCH **200** via FE | QA JSON | 🟢 |
| 5 | L0 stack + FE↔BE health | QA + QC spot | 🟢 |
| 6 | UF-HRM-10 / full matrix **not** promoted | exit criteria | 🟢 |
| 7 | Evidence pack QC SoT | this file | 🟢 **8/8** |
| 8 | PM seal carry rows acknowledged | dispatch doc | 🟢 |

---

## Residual

| ID | Sev | Status | Owner |
|----|-----|--------|-------|
| `window.confirm` vs Radix dialog | P3 | **OPEN** | **dev-fe** — cosmetic UX |
| Catalog THHDLD `mandatory=true` post-prep | INFO | **NOTE** | **qa** / sponsor — revert if needed |
| **BR-CTR-CREATE-08** FE banner | P2 | **OPEN** | **dev-fe** — per PM seal |
| **WS-G4-13/14** profile/REC hire | INFO | **BLOCKED** U65 | **qa** when hire chain exists |
| **DEF-CTR-G4-PROFILE-URL-P2** | P2 | **OPEN** | **dev-fe** — per PM seal |
| **UF-HRM-10** | INFO | **NOT promoted** | **pm** — DENY until broader matrix closes |
| CTR module UAT | INFO | `contracts_printable_ready=false` **RETAIN** | **pm** |
| Full G4 matrix 18 rows | INFO | **OPEN** | **pm** / **qa** — C-SLICE only sealed |

**No residual PRODUCT P0/P1** blocking this **WS-G4-07 confirm** C-SLICE GWC.

---

## Completion contract

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** |
| **next_owner** | **pm** → bus seal · update PM dispatch carry WS-G4-07 **PASS** |
| **evidence_path** | `docs/qa/evidence/qc-po-hrm-ctr-workspace-g4-ws-g4-07-confirm-01.md` |
| **completion_report** | GWC after **`CTRG4G07-MSO6B4UU`**: **WS-G4-07** **PASS** (closes **`CTRG4NVFRQC1`** PASS_WITH_HOLD) · **AC-CTR-DND-02** + **AC-WS-06** · **J-HRM-CTR-CREATE-02** confirm slice · `contracts_printable_ready=false` · ≠ CTR module UAT · ≠ UF-HRM-10 · stamp **`CTRG4G07QC1-MSO6B4UUQC1`**. QC SoT **8/8**. |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-CTR-WORKSPACE-G4-WS-G4-07-CONFIRM-PM-SEAL-01
role: pm
read_first:
  - docs/qa/evidence/qc-po-hrm-ctr-workspace-g4-ws-g4-07-confirm-01.md
  - docs/program/dispatch/PM-HRM-CTR-WORKSPACE-G4-NV-FIRST-SEAL-01.md
entry_criteria: QC GWC CTRG4G07QC1-MSO6B4UUQC1 PASS_TO_PM; WS-G4-07 PASS closes CTRG4NVFRQC1 HOLD; contracts_printable_ready=false retained
exit_criteria: Bus stamp WS-G4-07 GWC; PM seal carry table WS-G4-07 HOLD→PASS; do not promote UF-HRM-10 or contracts_printable_ready; retain WS-G4-13/14 BLOCKED + banner P2 carry
must_keep: contracts_printable_ready=false; C-SLICE honesty; prior GWC seals RETAIN; U65 zero-seed
```

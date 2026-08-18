# Evidence — PO-HRM-CTR-WORKSPACE-G4-REC-HIRE-QC-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-CTR-WORKSPACE-G4-REC-HIRE-QC-01` |
| **parent** | `PO-HRM-CTR-WORKSPACE-G4-REC-HIRE-FE-CHAIN-QA-01-RETEST-02` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-11 |
| **lane** | governance — **C-SLICE** REC hire chain · **not** CTR module UAT · **not** printable ready |
| **qa_ref** | [`qa-po-hrm-ctr-workspace-g4-rec-hire-fe-chain-retest-02.md`](qa-po-hrm-ctr-workspace-g4-rec-hire-fe-chain-retest-02.md) · stamp **`CTRG4HIRE-RT2-MSO89GMT`** · raw `_tmp-po-hrm-ctr-workspace-g4-rec-hire-fe-chain-retest-02.json` |
| **fe_ref** | [`po-hrm-ctr-workspace-g4-accept-offer-cta-fe-02.md`](po-hrm-ctr-workspace-g4-accept-offer-cta-fe-02.md) · commit **`5ccb26e`** |
| **pm_dispatch** | [`PM-HRM-CTR-WORKSPACE-G4-NV-FIRST-SEAL-01.md`](../program/dispatch/PM-HRM-CTR-WORKSPACE-G4-NV-FIRST-SEAL-01.md) |
| **hdsd_align** | `UI-HRM-CTR-HIRE-CTA.md` · `rec-accept-offer-open-detail` |
| **Verdict** | **GO WITH CONDITIONS** |
| **ack_status** | **PASS_TO_PM** |
| **stamp** | **`CTRG4HIREQC1-MSO89GMTQC1`** · annotates **`CTRG4HIRE-RT2-MSO89GMT`** |
| **portal_url** | `http://127.0.0.1:5173/command-center/hrm/recruitment?tab=candidates&candidateId=` · post-chain `…/command-center/hrm/contracts?workspace=create&employee_id=…&subject_type=employee` · hrm-api `:28001` · persona `ceo@xe.vn` / `company_id=main` |
| **U65** | zero-seed · browser-primary · no `pnpm seed:*` |
| **OS honesty** | `contracts_printable_ready=false` · `C-SLICE-≠-MODULE` · **cấm** UF-HRM-10 / full G4 matrix promote |

---

## Verdict summary

**GO WITH CONDITIONS** — **ACCEPT** narrow C-SLICE **REC hire chain** after QA **`CTRG4HIRE-RT2-MSO89GMT`**: **WS-G4-13** **PASS** · **J-HRM-CTR-HIRE-01** **PASS** · **DEF-REC-ACCEPT-OFFER-CTA-OFFER-STAGE** **CLOSED** · **WS-G4-14** **PASS_WITH_HOLD** (HTP probe only; full HĐ mutate out of slice) · L0 **`qc:dev-stack`** + **`qc:fe-be-health`** exit **0** (cite QA) · U65 browser + screenshots · `POST accept-offer` **201** + `employee_id` · «Tạo HĐ» → workspace Step1 prefill.

**NOT Phase 1 DONE. NOT CTR module UAT. NOT `contracts_printable_ready`. NOT UF-HRM-10 promote.**

Audited: QA MD · JSON · screenshots · FE-02 fix scope · dispatch seal carry · prior G4 GWC stamps (**RETAIN** profile launcher strict **`CTRG4URLQC1-MSO7HQ08QC1`**).

---

## Honesty locks (mandatory)

| Flag / claim | Value | QC |
|--------------|-------|-----|
| **`contracts_printable_ready` / CTR module UAT** | **`false`** | **DENIED** flip |
| **Promote UF-HRM-10 from this seat** | **DENIED** | C-SLICE boundary |
| **Full G4 matrix GO** | **DENIED** | Settings WS-G4-15..17 PLANNED |
| **Seed in UAT evidence** | **DENIED** (U65) | QA · zero-seed |
| **`C-SLICE-≠-MODULE`** | **RETAIN** | hire slice ≠ module |
| **Prior G4 seals** | **RETAIN** | `CTRWSG4EDQC1` · `CTRG4NVFRQC1` · `CTRG4PRQC1` · `CTRG4URLQC1` · `CTRG4BR08QC1` · `CTRG4G07QC1` · `CTRWSG4DOMQC1` |

### PM promote decision (explicit)

| Question | Answer |
|----------|--------|
| May PM set `contracts_printable_ready=true` / claim CTR module UAT? | **NO** |
| May PM promote **UF-HRM-10** from this seat? | **NO** |
| May PM promote **WS-G4-13** (accept-offer → Tạo HĐ → Step1 prefill)? | **YES** |
| May PM promote **J-HRM-CTR-HIRE-01**? | **YES** |
| May PM close **DEF-REC-ACCEPT-OFFER-CTA-OFFER-STAGE**? | **YES** — **CLOSED** |
| May PM promote **WS-G4-14** full HĐ mutate? | **NO** — **PASS_WITH_HOLD** HTP only |
| May PM close **DEF-REC-EMBED-DEEPLINK-TAB-CANDIDATES** nav indicator? | **NO** — **P2 carry** explicit |
| May PM annotate bus with **`CTRG4HIREQC1-MSO89GMTQC1`**? | **YES** |

---

## Classification

| Signal | Class | Disposition |
|--------|-------|-------------|
| **DEF-REC-ACCEPT-OFFER-CTA-OFFER-STAGE** CTA hidden on offer UV | PRODUCT P0 | **CLOSED** — FE-02 status projection + QA retest PASS |
| **WS-G4-13** accept-offer → «Tạo HĐ» → workspace create Step1 | PRODUCT L2.5 | **ACCEPT** · **PASS** |
| **J-HRM-CTR-HIRE-01** REC → accept → hire CTA → contracts workspace | PRODUCT L2.5 | **ACCEPT** · **PASS** |
| **WS-G4-14** hire-readiness after accept | PRODUCT L2 | **PASS_WITH_HOLD** — `GET hire-readiness` **200** · `active_contract=null` · no full HĐ mutate in slice |
| **DEF-REC-EMBED-DEEPLINK-TAB-CANDIDATES** nav `data-active`/`aria-selected` false on goto | PRODUCT P2 | **OPEN carry** — fallback click unblocks chain; **non-blocking** for WS-G4-13 |
| **J-HRM-REC-07-03** | PRODUCT L2.5 | **PASS_WITH_HOLD** — aligned with WS-G4-14 boundary |
| QA MD pack verify **6/8** (portal_url label · date heading) | PROCESS OBS | **ACCEPT** · QC SoT **8/8** on this file |
| Honesty / seed / module UAT | GOVERNANCE | **LOCKED DENY** |

---

## Command table (verify)

| Command | Result |
|---------|--------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qc-po-hrm-ctr-workspace-g4-rec-hire-01.md` | **PASS** · exit **0** (QC SoT) |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qa-po-hrm-ctr-workspace-g4-rec-hire-fe-chain-retest-02.md` | **FAIL** · **6/8** PROCESS OBS — `portal_url` label · `date` heading — **non-blocking** |
| `pnpm run qc:dev-stack` (cite QA) | **PASS** · hrm + xbos + portal **200** |
| `pnpm run qc:fe-be-health` (cite QA) | **PASS** · exit **0** |

---

## Conditions (GWC)

1. **Honesty:** `contracts_printable_ready=false` · **DENY** CTR module UAT · **DENY** UF-HRM-10 · **DENY** Phase 1 · seed · honesty banner flip.
2. **L2.5 CLOSED (this slice):** **J-HRM-CTR-HIRE-01** **PASS** · **WS-G4-13** **PASS** — U65 click path: Tuyển dụng → «Chấp nhận offer» → submit → «Tạo HĐ» → contracts workspace `ctr-create-step-1` · URL `workspace=create` + `employee_id` + `subject_type=employee` · `POST accept-offer` **201**.
3. **Defect CLOSED:** **DEF-REC-ACCEPT-OFFER-CTA-OFFER-STAGE** — verified browser + Network + screenshots on commit **`5ccb26e`**.
4. **WS-G4-14 HOLD:** **PASS_WITH_HOLD** — hire-readiness HTP probe **200** only; **no** full HĐ create/mutate promotion from this seat.
5. **P2 carry (explicit, non-blocking):** **DEF-REC-EMBED-DEEPLINK-TAB-CANDIDATES** — deep-link `?tab=candidates&candidateId=` does not set nav active indicator on zero-click goto (`deepLinkTabOk=false`); harness used fallback nav click; detail + CTA still open. Owner **dev-fe** defer.
6. **Out of slice:** printable PDF spine · Settings WS-G4-15..17 · full G4 matrix · UF-HRM-10 — **not** promoted here.
7. **must_keep:** prior G4 URL seal GWC **`CTRG4URLQC1-MSO7HQ08QC1`** profile launcher **strict PASS** — **unchanged**.

---

## J-* L2.5 / cross-nav matrix (U19)

| J-ID / row | Verdict | Notes |
|------------|---------|-------|
| **J-HRM-CTR-HIRE-01** | **PASS** | REC → accept-offer → Tạo HĐ → workspace create · `hireCtaFrom=accept-dialog` |
| **WS-G4-13** | **PASS** | Primary scope — **promoted** |
| **WS-G4-14** | **PASS_WITH_HOLD** | HTP probe only — full HĐ mutate **deferred** |
| **J-HRM-REC-07-03** | **PASS_WITH_HOLD** | Aligned with WS-G4-14 boundary |
| **DEF-REC-EMBED-DEEPLINK-TAB-CANDIDATES** | **CARRY P2** | nav active indicator — non-blocking |
| **UF-HRM-10** | **DENIED** | **cấm** promote |
| CTR module UAT | **DENIED** | C-SLICE |

**PM action:** seal REC hire GWC **`CTRG4HIREQC1-MSO89GMTQC1`** on bus · update seal doc WS-G4-13/14 row · **carry** deep-link nav P2 · retain honesty locks.

---

## Slice matrix (WS-G4 narrow — REC hire only)

| Row | Verdict | Notes |
|-----|---------|-------|
| **WS-G4-13** | **PASS** | accept-offer **201** · workspace Step1 prefill — **promoted** |
| **WS-G4-14** | **PASS_WITH_HOLD** | `hire-readiness` **200** · no HĐ mutate in slice |
| **WS-G4-12 profile** | **RETAIN** | prior strict PASS **`CTRG4URLQC1`** — not re-audited |

---

## Audit checklist

| # | Check | Evidence | QC |
|---|-------|----------|-----|
| 1 | P0 **DEF-REC-ACCEPT-OFFER-CTA-OFFER-STAGE CLOSED** | QA JSON · screens · FE-02 | 🟢 |
| 2 | WS-G4-13 **PASS** browser mutate chain | QA UF block · network **201** | 🟢 |
| 3 | J-HRM-CTR-HIRE-01 **PASS** L2.5 | QA journeys · click path | 🟢 |
| 4 | WS-G4-14 **PASS_WITH_HOLD** HTP only | QA · JSON `active_contract=null` | 🟡 **HOLD** |
| 5 | ≠ CTR module UAT · `contracts_printable_ready=false` | QA honesty · exit | 🟢 |
| 6 | U65 zero-seed | QA steps · JSON `seed_used:false` | 🟢 |
| 7 | Deep-link nav P2 carry explicit | `deepLinkTabOk:false` · DEF id | 🟡 **OPEN P2** |
| 8 | UF-HRM-10 / full matrix **not** promoted | exit criteria | 🟢 |
| 9 | Profile launcher strict seal **retained** | must_keep · prior QC | 🟢 |
| 10 | Evidence pack QC SoT | this file verify | 🟢 **8/8** |

**No residual PRODUCT P0** blocking this **REC hire chain** C-SLICE GWC.

---

## Residual

| ID | Sev | Status | Owner |
|----|-----|--------|-------|
| **DEF-REC-EMBED-DEEPLINK-TAB-CANDIDATES** | P2 | **OPEN carry** | **dev-fe** (defer) — nav active indicator on zero-click deep-link |
| **WS-G4-14** full HĐ mutate | INFO | **PASS_WITH_HOLD** | separate wave / out of slice |
| **UF-HRM-10** | INFO | **NOT promoted** | **pm** — DENY |
| CTR module UAT | INFO | `contracts_printable_ready=false` **RETAIN** | **pm** |
| QA pack gaps on QA MD | OBS | PROCESS · portal_url label · date heading | **qa** optional backfill |
| Playwright cross-frame Radix dialog | OBS | harness note — non-blocking | **qa** |

---

## Completion contract

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** |
| **next_owner** | **pm** |
| **evidence_path** | `docs/qa/evidence/qc-po-hrm-ctr-workspace-g4-rec-hire-01.md` |
| **completion_report** | GWC after **`CTRG4HIRE-RT2-MSO89GMT`**: **WS-G4-13 PASS** · **J-HRM-CTR-HIRE-01 PASS** · **DEF-REC-ACCEPT-OFFER-CTA-OFFER-STAGE CLOSED** · **WS-G4-14 PASS_WITH_HOLD** (HTP only) · **DEF-REC-EMBED-DEEPLINK-TAB-CANDIDATES** P2 **carry** · `contracts_printable_ready=false` · ≠ CTR module UAT · ≠ UF-HRM-10 · stamp **`CTRG4HIREQC1-MSO89GMTQC1`**. QA pack **6/8** OBS · QC SoT **8/8**. RETAIN profile URL strict **`CTRG4URLQC1`**. |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PM-HRM-CTR-WORKSPACE-G4-NV-FIRST-SEAL-01
role: pm
read_first:
  - docs/qa/evidence/qc-po-hrm-ctr-workspace-g4-rec-hire-01.md
  - docs/program/dispatch/PM-HRM-CTR-WORKSPACE-G4-NV-FIRST-SEAL-01.md
entry_criteria: QC GWC CTRG4HIREQC1-MSO89GMTQC1 PASS_TO_PM; WS-G4-13 PASS; J-HRM-CTR-HIRE-01 PASS; DEF-REC-ACCEPT-OFFER-CTA-OFFER-STAGE CLOSED
exit_criteria: Bus stamp REC hire GWC; seal doc hire_qc_stamp CTRG4HIREQC1-MSO89GMTQC1; WS-G4-14 PASS_WITH_HOLD noted; carry DEF-REC-EMBED-DEEPLINK-TAB-CANDIDATES P2; retain contracts_printable_ready=false; retain CTRG4URLQC1 profile strict; do not promote UF-HRM-10; C-SLICE honesty
must_keep: prior G4 seals; profile launcher strict PASS; contracts_printable_ready=false
ack_status: PASS_TO_PM
```

# Evidence — PO-HRM-CTR-WORKSPACE-G4-BR-CTR-CREATE-08-BANNER-QC-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-CTR-WORKSPACE-G4-BR-CTR-CREATE-08-BANNER-QC-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-11 |
| **lane** | governance — **C-SLICE** BR-CTR-CREATE-08 REC banner · **not** CTR module UAT · **not** printable ready |
| **qa_ref** | [`qa-po-hrm-ctr-workspace-g4-br-ctr-create-08-banner-01.md`](qa-po-hrm-ctr-workspace-g4-br-ctr-create-08-banner-01.md) · stamp **`CTRG4BR08-MSO6CG6X`** · raw `_tmp-po-hrm-ctr-g4-br-ctr-create-08-banner-qa-01.json` |
| **fe_ref** | [`po-hrm-ctr-workspace-fe-br-ctr-create-08-banner-01.md`](po-hrm-ctr-workspace-fe-br-ctr-create-08-banner-01.md) |
| **prior_gwc** | [`qc-po-hrm-ctr-workspace-g4-subject-rec-nv-first-01.md`](qc-po-hrm-ctr-workspace-g4-subject-rec-nv-first-01.md) · **`CTRG4NVFRQC1-MSO3QNLZQC1`** · [`qc-po-hrm-ctr-workspace-g4-dom-nesting-01.md`](qc-po-hrm-ctr-workspace-g4-dom-nesting-01.md) · **`CTRWSG4DOMQC1-MSO6AR3QC1`** · [`qc-po-hrm-ctr-workspace-g4-edit-deeplink-01.md`](qc-po-hrm-ctr-workspace-g4-edit-deeplink-01.md) · **`CTRWSG4EDQC1-MSO2JT9QC1`** |
| **hdsd_align** | `docs/hrm/ui-screens/UI-HRM-CTR-WORKSPACE.md` §4.1 |
| **Verdict** | **GO WITH CONDITIONS** |
| **ack_status** | **PASS_TO_PM** |
| **stamp** | **`CTRG4BR08QC1-MSO6CG6XQC1`** · annotates **`CTRG4BR08-MSO6CG6X`** |
| **portal_url** | `http://127.0.0.1:5173/command-center/hrm/contracts` · hrm-api `:28001` · persona `ceo@xe.vn` / `company_id=main` |
| **U65** | zero-seed · browser-primary · no `pnpm seed:*` |
| **OS honesty** | `contracts_printable_ready=false` · `C-SLICE-≠-MODULE` · **cấm** UF-HRM-10 / full G4 matrix promote |

---

## Verdict summary

**GO WITH CONDITIONS** — **ACCEPT** C-SLICE **BR-CTR-CREATE-08** after QA **`CTRG4BR08-MSO6CG6X`**: tab **Nhân viên** → **NV101** (`candidate_id: null`) → amber banner `ctr-create-employee-rec-hint` + link «Mở tuyển dụng» visible · **Tiếp** POST **201** `HRM-CON-201` (not blocked) · Step2 open · **J-HRM-CTR-CREATE-01** regression **PASS** · L0 **`qc:dev-stack`** + **`qc:fe-be-health`** exit **0** · vitest **16/16** · U65 browser + **2** screenshots on disk.

**NOT Phase 1 DONE. NOT CTR module UAT. NOT `contracts_printable_ready`. NOT UF-HRM-10 promote.**

Audited: QA MD · JSON · screens · FE spec ack · prior GWC seals · honesty locks · negative branch HOLD.

---

## Honesty locks (mandatory)

| Flag / claim | Value | QC |
|--------------|-------|-----|
| **`contracts_printable_ready` / CTR module UAT** | **`false`** | **DENIED** flip |
| **Promote UF-HRM-10 from this seat** | **DENIED** | C-SLICE boundary |
| **Full G4 matrix GO** | **DENIED** | carry rows remain |
| **Seed in UAT evidence** | **DENIED** (U65) | QA · pilot NV101 only |
| **`C-SLICE-≠-MODULE`** | **RETAIN** | banner slice ≠ module |
| **Prior GWC seals** | **RETAIN** | edit deeplink · NV-first CREATE · DOM nesting — not superseded |

### PM promote decision (explicit)

| Question | Answer |
|----------|--------|
| May PM set `contracts_printable_ready=true` / claim CTR module UAT? | **NO** |
| May PM promote **UF-HRM-10** from this seat? | **NO** |
| May PM close **BR-CTR-CREATE-08** / promote banner slice? | **YES** (negative branch **PASS_WITH_HOLD**) |
| May PM annotate bus with **`CTRG4BR08QC1-MSO6CG6XQC1`**? | **YES** |
| May PM promote full G4 matrix / printable spine? | **NO** |

---

## Classification

| Signal | Class | Disposition |
|--------|-------|-------------|
| **BR-CTR-CREATE-08** banner when `candidate_id` null | PRODUCT P2→slice | **CLOSED** (positive path) |
| **BR-CTR-CREATE-08** banner absent when NV has `candidate_id` | PRODUCT negative | **PASS_WITH_HOLD** · no pilot row in `main` |
| **Tiếp** not blocked by banner | PRODUCT mutate | **ACCEPT** · **PASS** · POST **201** |
| **J-HRM-CTR-CREATE-01** with banner present | PRODUCT L2.5 | **ACCEPT** · **PASS** |
| **WS-G4-07** full mandatory gỡ confirm | PRODUCT | **OPEN** carry · orthogonal |
| **WS-G4-12..14** profile/REC hire | PRODUCT | **BLOCKED** U65 carry · **out of slice** |
| QA MD pack verify **7/8** (missing `portal_url` token) | PROCESS OBS | **ACCEPT** · non-blocking · QC SoT **8/8** |
| Honesty / seed / module UAT | GOVERNANCE | **LOCKED DENY** |

---

## Command table (verify)

| Command | Result |
|---------|--------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qc-po-hrm-ctr-workspace-g4-br-ctr-create-08-banner-01.md` | **PASS** · exit **0** (QC SoT) |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qa-po-hrm-ctr-workspace-g4-br-ctr-create-08-banner-01.md` | **FAIL** · **7/8** PROCESS OBS — missing `portal_url` token on QA MD; QC audits QA MD + JSON |
| `pnpm run qc:dev-stack` (cite QA) | **PASS** · exit **0** |
| `pnpm run qc:fe-be-health` (cite QA) | **PASS** · exit **0** |
| `vitest contractEmployeeRecBanner.test.ts` + `contractWorkspace.source.test.ts` (cite QA) | **16/16 PASS** |

---

## Conditions (GWC)

1. **Honesty:** `contracts_printable_ready=false` · **DENY** CTR module UAT · **DENY** UF-HRM-10 · **DENY** Phase 1 · seed · honesty banner flip.
2. **BR-CTR-CREATE-08 CLOSED (positive):** NV without `candidate_id` → banner `ctr-create-employee-rec-hint` + «Mở tuyển dụng» link visible; **Tiếp** enabled; POST **201** with banner present.
3. **PASS_WITH_HOLD (negative):** Banner absent when NV has `candidate_id` — **not** live-tested; no pilot employee with `candidate_id` set in `company_id=main` rollup list; unit tests cover predicate on FE.
4. **L2.5:** **J-HRM-CTR-CREATE-01** regression **PASS** with banner on Step1.
5. **RETAIN prior GWC:** **`CTRWSG4EDQC1`** · **`CTRG4NVFRQC1`** · **`CTRWSG4DOMQC1`** · **`CTRG4G07QC1`** (if sealed) — do not conflate with banner slice seal.
6. **Carry (non-blocking):** WS-G4-07 full confirm · WS-G4-12..14 profile/REC U65 BLOCKED · UF-HRM-10 · full G4 matrix — per PM seal dispatch table.

---

## J-* L2.5 / cross-nav matrix (U19)

| J-ID / row | Verdict | Notes |
|------------|---------|-------|
| **J-HRM-CTR-CREATE-01** | **PASS** | NV-first Step1 + banner → **Tiếp** POST **201** → Step2 |
| **BR-CTR-CREATE-08** (matrix row) | **PASS** | Positive path **CLOSED** · negative **PASS_WITH_HOLD** |
| **J-HRM-CTR-CREATE-02** | **NOT IN SLICE** | prior NV-first GWC — not re-run |
| **J-HRM-03** (list → view) | **NOT IN SLICE** | prior seats — not re-audited |
| **WS-G4-12..14** profile/REC | **BLOCKED** | U65 carry |
| **UF-HRM-10** | **DENIED** | **cấm** promote |
| CTR module UAT | **DENIED** | C-SLICE |

**PM action:** seal banner GWC **`CTRG4BR08QC1-MSO6CG6XQC1`** on bus · promote **BR-CTR-CREATE-08** narrow · note negative HOLD · **DENY** module / UF-HRM-10 flip.

---

## Slice matrix (narrow)

| Row | Verdict | Notes |
|-----|---------|-------|
| **BR-CTR-CREATE-08-banner** | **PASS** | NV101 · hint + link visible — **CLOSED** |
| **BR-CTR-CREATE-08-post-not-blocked** | **PASS** | POST **201** · Step2 — **CLOSED** |
| **BR-CTR-CREATE-08-banner-absent-with-candidate** | **PASS_WITH_HOLD** | No pilot NV with `candidate_id` in scope |
| **WS-G4-02/06/07** | **RETAIN** | prior **`CTRG4NVFRQC1`** / **`CTRG4G07QC1`** |
| **WS-G4-12..14** | **BLOCKED** | U65 carry |

---

## Audit checklist

| # | Check | Evidence | QC |
|---|-------|----------|-----|
| 1 | BR-CTR-CREATE-08 positive path **CLOSED** | QA · FE · JSON | 🟢 |
| 2 | ≠ CTR module UAT · `contracts_printable_ready=false` | QA honesty | 🟢 |
| 3 | U65 zero-seed · Network POST **201** + Step2 | QA JSON · screens | 🟢 |
| 4 | Negative branch documented **PASS_WITH_HOLD** | QA matrix · FE unit | 🟡 **HOLD** non-blocking |
| 5 | J-HRM-CTR-CREATE-01 regression | QA journeys | 🟢 |
| 6 | UF-HRM-10 / full matrix **not** promoted | exit criteria | 🟢 |
| 7 | Screenshots on disk (2 PNG) | QA screens dir | 🟢 |
| 8 | Evidence pack QC SoT | this file | 🟢 **8/8** |

---

## Residual

| ID | Sev | Status | Owner |
|----|-----|--------|-------|
| **BR-CTR-CREATE-08** banner absent when `candidate_id` set | P2 | **PASS_WITH_HOLD** | **qa** when pilot NV with REC trace exists in `main` |
| **WS-G4-07** full mandatory gỡ confirm | HOLD | **OPEN** | **qa** · orthogonal |
| **WS-G4-12..14** profile/REC hire | BLOCKED | **OPEN** U65 | **qa** when hire path unblocked |
| **UF-HRM-10** | INFO | **NOT promoted** | **pm** — DENY until broader matrix closes |
| CTR module UAT | INFO | `contracts_printable_ready=false` **RETAIN** | **pm** |
| QA MD pack `portal_url` token | OBS | PROCESS | **qa** optional backfill on QA MD |
| Full G4 matrix 18 rows | INFO | **OPEN** | **pm** / **qa** — C-SLICE only sealed |

**No residual PRODUCT P0/P1** blocking this **BR-CTR-CREATE-08 banner** C-SLICE GWC.

---

## Completion contract

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** |
| **next_owner** | **pm** → bus seal · update PM-HRM-CTR-WORKSPACE-G4-NV-FIRST-SEAL carry |
| **evidence_path** | `docs/qa/evidence/qc-po-hrm-ctr-workspace-g4-br-ctr-create-08-banner-01.md` |
| **completion_report** | GWC after **`CTRG4BR08-MSO6CG6X`**: **BR-CTR-CREATE-08** **CLOSED** (positive) · **PASS_WITH_HOLD** negative `candidate_id` branch · **J-HRM-CTR-CREATE-01** **PASS** · `contracts_printable_ready=false` · ≠ CTR module UAT · ≠ UF-HRM-10 · stamp **`CTRG4BR08QC1-MSO6CG6XQC1`**. QA pack **7/8** OBS · QC SoT **8/8**. |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PM-HRM-CTR-WORKSPACE-G4-NV-FIRST-SEAL-01 (carry update)
role: pm
read_first:
  - docs/qa/evidence/qc-po-hrm-ctr-workspace-g4-br-ctr-create-08-banner-01.md
  - docs/program/dispatch/PM-HRM-CTR-WORKSPACE-G4-NV-FIRST-SEAL-01.md
entry_criteria: QC GWC CTRG4BR08QC1-MSO6CG6XQC1; BR-CTR-CREATE-08 positive CLOSED; negative PASS_WITH_HOLD noted; contracts_printable_ready=false retained
exit_criteria: Bus stamp banner GWC; update seal carry — BR-CTR-CREATE-08 row CLOSED; do not promote UF-HRM-10 or contracts_printable_ready; dispatch residual carry (WS-G4-12..14 profile REC · DEF-CTR-G4-PROFILE-URL-P2) per seal table
must_keep: contracts_printable_ready=false; RETAIN CTRWSG4EDQC1+CTRG4NVFRQC1+CTRWSG4DOMQC1 GWC stamps; U65 zero-seed
```

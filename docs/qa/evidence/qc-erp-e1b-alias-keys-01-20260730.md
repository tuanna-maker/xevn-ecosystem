# QC Gate — QC-ERP-E1B-ALIAS-KEYS-01 (2026-07-30)

| Field | Value |
|-------|--------|
| **work_item_id** | `QC-ERP-E1B-ALIAS-KEYS-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **lane** | governance E1-B alias-keys narrow · HOLD_DEPLOY · U65 |
| **date** | `2026-07-30` |
| **decision** | **GO WITH CONDITIONS (duplicate-ok)** — alias-keys retest only; **no BE reopen** |
| **prior_gate** | `QC-ERP-E1B-01` · `docs/qa/evidence/qc-erp-e1b-01-20260728.md` — **GO WITH CONDITIONS** already covers `D-BE-ERP-E1B-ALIAS-KEYS-01` + AC-SC-DEC-ALIAS-* |
| **scope_claim** | AC-SC-DEC-ALIAS-01/02 + AC-SET-UI-05 (DEC tab/picker) · L1 pull resolve · **not** full E1-B MD CRUD re-gate · **not** deploy / Phase1 / PROD |
| **phase1_done_claim** | **NO** |
| **prod_ready_claim** | **NO** |
| **deploy** | **HOLD_DEPLOY** |
| **ack_status** | **PASS_TO_PM** |
| **U65** | zero-seed · `seed_used=false` · cấm seed / :54321 Dev-FE |
| **portal_url** | `http://127.0.0.1:5173` |
| **evidence_path** | `docs/qa/evidence/qc-erp-e1b-alias-keys-01-20260730.md` |

---

## QA entry audited

| Artifact | Role | Verdict |
|----------|------|---------|
| `docs/qa/evidence/qa-erp-e1b-alias-keys-01-20260730.md` | Browser + L1 alias retest | PASS_TO_PM · hardFails=[] |
| `docs/qa/evidence/_tmp-qa-erp-e1b-alias-keys-01-runtime.json` | Runtime SoT | `overall: PASS` · aligned |
| `docs/qa/evidence/d-be-erp-e1b-alias-keys-01-20260728.md` | BE handoff (unchanged) | CLOSED — **no reopen** |
| `docs/program/deltas/BA_ERP_E1B_SRS_01_20260728.md` | AC source | AC-SC-DEC-ALIAS-01/02 · AC-SET-UI-05 |

**spec_ref:** `BA_ERP_E1B_SRS_01_20260728` · **BR-HRM-SC-ALIAS-01/02**

---

## Command table

| Command | Exit | Verdict | Notes |
|---------|------|---------|-------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qa-erp-e1b-alias-keys-01-20260730.md` | **1** | FAIL 6/8 | PROCESS P3 — missing `journey_l25` + `crud_or_matrix` headings in QA MD |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qc-erp-e1b-alias-keys-01-20260730.md` | **0** | PASS 8/8 | This QC pack (gate SoT) |
| QC L0 spot `GET http://127.0.0.1:28001/api/hrm` | 200 | PASS | Independent 2026-07-30 |
| QC L0 spot `GET http://127.0.0.1:5173` | 200 | PASS | Independent |
| QA cite `pnpm --filter hrm-api exec jest … d-be-erp-e1b-alias-keys-01.spec.ts` | 0 | PASS | 10/10 (narrow suite this run) |
| QA script `scripts/qa/qa-erp-e1b-alias-keys-01.mjs` | 0 | PASS | runtime hardFails=[] |

---

## AC audit vs BA delta (L1 + L2)

| AC | Delta intent | QA evidence | QC verdict |
|----|--------------|-------------|------------|
| **AC-SC-DEC-ALIAS-01** | Settings Loại QĐ resolve `hr_decision_types` \| `decision_types`; no empty list when live has 3 | GET both keys merge · count 3 · HRD_01..03 · browser tab PASS | **PASS** |
| **AC-SC-DEC-ALIAS-02** | Decisions create picker same alias list; no hardcode fallback when catalog live | Picker HRD_01 Bổ nhiệm, HRD_02, HRD_03 | **PASS** |
| **AC-SET-UI-05** | DEC bucket UI shows merged items | 3 rows · FR visible | **PASS** |
| Pull resolve | `POST …/pull/decision_types` → storage `hr_decision_types` · `resolvedFrom=decision_types` | 201 HRM-SYNC-200 | **PASS** |
| Regression | `job_titles` / `leave_types` unchanged | 38 / 6 · 200 | **PASS** |

**Duplicate-ok ruling:** Product acceptance for these ACs was already **GWC** under `QC-ERP-E1B-01` (jest 30/30 + full E1-B browser). This WI is a **focused corroboration** after alias-keys QA dispatch — **does not** reopen Dev-BE or expand scope.

---

## L2.5 J-* / UF (narrow slice)

| Journey / UF | Account | Click path | Expected | Actual | Verdict |
|--------------|---------|------------|----------|--------|---------|
| **UF-HRM-10** (Settings — DEC tab only) | `ceo@xe.vn` · `main` | `/hr/settings?portal=1` → Danh mục nghiệp vụ → Loại quyết định | 3 merged items visible | runtime `ac-set-ui-05-dec-settings` ok · rowCount=3 | **PASS** |
| **J-HRM-SET-E1B-01** (alias subset) | same | Settings DEC tab + `/hr/decisions` → Thêm quyết định → Loại quyết định picker | Alias list not empty; options from catalog | `ac-sc-dec-alias-02-decisions-picker` ok | **PASS** |

> Full J-HRM-SET-E1B-01 CRUD (create≥3 buckets, soft-stop, sync CTA) remains covered by `QC-ERP-E1B-01` — **not** re-audited in this narrow WI.

---

## Read-only module matrix (alias-keys)

| Module / key | Read (list/API) | UI consumer | Negative / note | Verdict |
|--------------|-----------------|-------------|-----------------|---------|
| `decision_types` → merge | **PASS** GET 200 · count 3 | Settings tab **PASS** | Must not MISS when only alias key used | **PASS** |
| `hr_decision_types` canonical | **PASS** GET 200 · same merge | Picker **PASS** | storageKey prefer canonical | **PASS** |
| Pull `decision_types` | **PASS** 201 resolve | N/A browser | `resolvedFrom` logged | **PASS** |
| `job_titles` / `leave_types` | **PASS** regression counts | N/A this run | No alias regression | **PASS** |

---

## Classification (ENV vs PRODUCT)

| Signal | Type | QC finding |
|--------|------|------------|
| Runtime `overall: PASS` · `hardFails: []` | PRODUCT | **Accept** |
| `locks.seed_used=false` · U65 | PRODUCT / process | **PASS** |
| L1 alias merge + pull resolve | PRODUCT | **PASS** — matches BR-HRM-SC-ALIAS-01/02 |
| QA evidence-pack 6/8 | PROCESS P3 | Closed by **this** QC pack 8/8 — not product NO-GO |
| L0 HRM + portal 200 (QC spot) | ENV | **PASS** |
| Screens path cited in QA; not required for duplicate-ok | Info | Runtime JSON + prior E1-B screens chain sufficient |
| OpenAPI yaml refresh | Out of scope P3 | Dev optional — not gate blocker |
| `work_shifts` ↔ `shifts` SoT | Governance HOLD | Unchanged — no FAIL |

**PRODUCT P0/P1 open for alias-keys slice:** **none**

---

## Residual

| ID | Sev | Owner | Status | Note |
|----|-----|-------|--------|------|
| R-E1B-ALIAS-DUP-GATE | Info | pm | CLOSED | Absorbed by pointer to `QC-ERP-E1B-01` — no second product gate needed |
| R-E1B-SYNC-NET-01 | P2 | qa optional | OPEN (from prior GWC) | Not in alias-keys WI scope |
| R-E1B-HOLD-DEPLOY | Info | pm | OPEN | No deploy / Phase1 / PROD |
| R-E1B-QA-PACK-SHAPE | P3 PROCESS | CLOSED | QA MD 6/8; QC pack this file 8/8 |
| OpenAPI refresh | P3 | dev-be optional | OPEN | Dev handoff note |
| E1-A consumer FREE_TEXT | Program | pm | OPEN out-of-scope | Wait E1-A |

---

## Evidence-pack note

```text
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qa-erp-e1b-alias-keys-01-20260730.md
# → FAIL 2/8: journey_l25, crud_or_matrix (heading regex)

pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qc-erp-e1b-alias-keys-01-20260730.md
# → PASS 8/8 (this file)
```

**QC ruling:** L1+L2 product truth complete in runtime JSON + AC table. Prior **QC-ERP-E1B-01** already GWC for same BE WI — this gate **confirms** retest PASS without Dev reopen.

---

## Conditions (GWC duplicate-ok)

| ID | Note |
|----|------|
| Pointer | Primary E1-B gate remains `docs/qa/evidence/qc-erp-e1b-01-20260728.md` |
| HOLD_DEPLOY | Unchanged — no nginx / `:8088` / deploy |
| Program | NOT Phase 1 DONE · NOT PROD-READY · wait E1-A before E2 |

---

## Verdict

**GO WITH CONDITIONS (duplicate-ok)** — `QA-ERP-E1B-ALIAS-KEYS-01` accepted: AC-SC-DEC-ALIAS-01/02 + AC-SET-UI-05 corroborated (L1 merge, pull resolve, browser picker). **Supersedes nothing** on `QC-ERP-E1B-01`; closes narrow QC dispatch only. **Cấm** seed, deploy, Dev-FE 54321, BE reopen.

---

## completion_report

- **Closed:** QC-ERP-E1B-ALIAS-KEYS-01; audited QA runtime hardFails=[] vs BA delta AC-SC-DEC-ALIAS-*; independent L0 200; duplicate-ok with QC-ERP-E1B-01; QC evidence pack 8/8.
- **Residual:** Prior GWC sync Network P2 + HOLD_DEPLOY + E1-A program — unchanged.
- **Non-claims:** no Phase1/PROD; no BE/FE reopen.

## next_owner

`pm`

## next_dispatch_prompt

```text
work_item_id: PM-ERP-E1B-ALIAS-CLOSE-01
from_role: qc
to_role: pm
lane: governance E1-B · HOLD_DEPLOY
entry: docs/qa/evidence/qc-erp-e1b-alias-keys-01-20260730.md — GWC duplicate-ok; PASS_TO_PM
action:
  1) Bus INTAKE: mark QA-ERP-E1B-ALIAS-KEYS-01 + QC-ERP-E1B-ALIAS-KEYS-01 CLOSED (narrow); primary E1-B gate SoT remains qc-erp-e1b-01-20260728.md
  2) Do NOT dispatch dev-be for alias-keys — duplicate of closed D-BE-ERP-E1B-ALIAS-KEYS-01
  3) KEEP HOLD_DEPLOY — cấm seed, nginx/:8088, 54321 Dev-FE, Phase1/PROD claim
  4) NEXT program: E1-A consumer bind or optional R-E1B-SYNC-NET-01 QA spot only — no Dev reopen from this WI
cấm: seed; deploy; reopen BE alias-keys; treat this narrow QC as E2 unlock
```

## Handoff packet

```yaml
work_item_id: QC-ERP-E1B-ALIAS-KEYS-01
from_role: qc
to_role: pm
entry_criteria: QA-ERP-E1B-ALIAS-KEYS-01 PASS_TO_PM; HOLD_DEPLOY; U65
exit_criteria: GO/GWC vs delta AC-SC-DEC-ALIAS-*; this evidence
evidence_path: docs/qa/evidence/qc-erp-e1b-alias-keys-01-20260730.md
ack_status: PASS_TO_PM
needed_by: same-session PM intake
completion_report: >
  GWC duplicate-ok alias-keys retest PASS; pointer QC-ERP-E1B-01; no BE reopen;
  AC-SC-DEC-ALIAS-01/02 corroborated; HOLD_DEPLOY.
next_owner: pm
next_dispatch_prompt: see PM-ERP-E1B-ALIAS-CLOSE-01 above
```

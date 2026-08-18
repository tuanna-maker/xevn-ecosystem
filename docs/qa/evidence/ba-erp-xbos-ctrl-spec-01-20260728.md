# BA-ERP-XBOS-CTRL-SPEC-01 — Evidence (SRS/AC apply-to-members expand)

| Field | Value |
|-------|--------|
| **work_item_id** | `BA-ERP-XBOS-CTRL-SPEC-01` |
| **from_role** | ba-process |
| **to_role** | pm |
| **lane** | governance E-XBOS-CTRL-SPEC — **docs only** |
| **date** | 2026-07-28 |
| **ack_status** | **PASS_TO_PM** |
| **apps_touched** | **none** |
| **delta_path** | `docs/program/deltas/BA_ERP_XBOS_CTRL_SPEC_01_20260728.md` |
| **SRS pointer** | `docs/hrm/SRS.md` **§16.7** (APPEND) |

---

## 1. Exit criteria checklist

| # | Criterion | Status |
|---|-----------|--------|
| 1 | SRS delta BR-HRM-XBOS-CTRL-* + AC-XBOS-CTRL-* | **PASS** — FR-XBOS-CTRL-01..03 · BR-HRM-XBOS-CTRL-01..05 + ALIAS/BM · AC-XBOS-CTRL-01..08 · HRM-01..04 · P1-01..03 |
| 2 | Allow-list P0 includes `departments` + `leave_types` | **PASS** — §2.1 set of 5 keys |
| 3 | P1 E1-B parity keys documented | **PASS** — §2.2 |
| 4 | Diễn biến XBOS-DM-HRM-07 expand + HRM consume | **PASS** — §3–§4 |
| 5 | PENDING_SYNTH TechSpec/DB/API marked | **PASS** — §8 → SA |
| 6 | J-XBOS-CTRL-01..03 + BA_TRACE / journey map | **PASS** |
| 7 | No `apps/**` · no Dev G1/G2 unlock claim | **PASS** |
| 8 | Evidence this file + PASS_TO_PM | **PASS** |

---

## 2. Spec says / code does (baseline)

| Topic | Spec says (this delta) | Code / OpenAPI does (2026-07-28) |
|-------|------------------------|----------------------------------|
| apply allow-list | P0 = `{job_titles, departments, leave_types, recruitment_channels, job_grades}` | OpenAPI: **only** `job_titles`, `recruitment_channels`, `job_grades` |
| `departments` / `leave_types` fan-out | Must 200 `XBOS-CFG-204` after G1 Dev | **XBOS-CFG-005** expected today |
| API_DESIGN apply | F.1 full required before Dev | **F.1-lite cite** only |
| HRM Settings consume | Pull after apply → effectiveItems | Pipe HAS; gated by missing member L0 for dept/leave |
| Full 72 STT | P2 / not claimed | N/A |

---

## 3. Allow-list target (normative summary)

### P0 (must)

`job_titles` · `departments` · `leave_types` · `recruitment_channels` · `job_grades`

### P1 (after P0 + sponsor)

`contract_types` · `employment_types` · `pay_types` · `shifts` · `decision_types` (+ optional `insurers`)

### Out of apply-to-members

LE/OU · field defs · WF codes · RACI · BM positions fork · salary_components TX

---

## 4. Read_first ack

| Source | Used |
|--------|------|
| `FIDELITY_PROGRAM_DISPATCH.md` Cohort 5 | Yes — SPEC deliverable + PENDING_SYNTH |
| `sa-xbos-hrm-control-gap-01-20260728.md` | Yes — PARTIAL · G1 miss dept/leave · Option C |
| `DANH_MUC_XBOS_CHO_HRM.md` §3/§5/§14 DM-07..10 | Yes |
| FR-HRM-SC-* · E1-B §16.2a inventory | Yes — P0/P1 key map |
| OpenAPI `ApplyCatalogToMembersBody` | Yes — AS-IS 3 keys |
| `API_DESIGN_XBOS_CATALOG_GOV.md` §8 | Yes — F.1-lite gap |
| E1–E3 deltas (OUT XBOS-CTRL) | Yes — sequence lock after E3 GWC |

---

## 5. Journeys added

| J-ID | Intent |
|------|--------|
| **J-XBOS-CTRL-01** | apply `departments` → HRM Settings sync → F5 |
| **J-XBOS-CTRL-02** | apply `leave_types` (+ job_titles regression) |
| **J-XBOS-CTRL-03** | reject key ngoài allow-list (`XBOS-CFG-005`) |

Pointers: `PROGRAM_JOURNEY_MAP.md` · `PILOT_BUSINESS_FLOW_BA_TRACE.md` §22

---

## 6. Residuals (not closed)

| Residual | Next owner |
|----------|------------|
| Peer SYNTH BA P0/P1 ↔ SA Tier A/B/C (packaging) | **pm** U74 |
| DEC apply storage: BA `decision_types` canonical vs SA write `hr_decision_types` | **pm** chốt theo E1-B live prefer `hr_decision_types` |
| Sponsor chốt SPEC pack (BA+SA) | **pm** / sponsor |
| Dev allow-list expand | **E-XBOS-CTRL-G1** after chốt |
| HRM consume regression | **E-XBOS-CTRL-G2** |
| P2 / Tier C breadth | Later cohort |
| FE apply wizard residual G5 | Dev FE after G1 |
| Khách HTML DM-07 wording | ba-docs later |

> **Note:** `SA-ERP-XBOS-CTRL-SPEC-01` evidence + TechSpec/DB/API paths **already landed** (parallel seat). BA SRS closes SA’s prior `PENDING_SYNTH` BA formal. **Do not** re-dispatch SA unless SYNTH finds gap vs §16.7.

---

## 7. Handoff packet

```yaml
work_item_id: BA-ERP-XBOS-CTRL-SPEC-01
from_role: ba-process
to_role: pm
entry_criteria: met (E3 GWC unlock · Cohort 5 dispatch)
exit_criteria: SRS/AC delta + evidence + §16.7 pointer + J-* — met
evidence_path: docs/qa/evidence/ba-erp-xbos-ctrl-spec-01-20260728.md
delta_path: docs/program/deltas/BA_ERP_XBOS_CTRL_SPEC_01_20260728.md
ack_status: PASS_TO_PM
apps_touched: none
completion_report: |
  Closed: E-XBOS-CTRL-SPEC SRS/AC — P0 allow-list ADD departments+leave_types;
  P1 E1-B parity keys; FR/BR/AC; DM-07 Diễn biến expand; HRM consume AC;
  J-XBOS-CTRL-01..03; SRS §16.7 pointer. Closes SA PENDING_SYNTH for BA formal.
  Residual: PM SYNTH BA↔SA (tier packaging + DEC storage key); sponsor chốt; Dev G1/G2 HOLD.
next_owner: pm (SYNTH + sponsor chốt) → E-XBOS-CTRL-G1/G2 after chốt
```

### next_dispatch_prompt (copy-ready)

```text
work_item_id: SYNTH-ERP-XBOS-CTRL-SPEC-01
from_role: pm
to_role: pm (U74 peer optional CLAUDE-PM)
lane: governance E-XBOS-CTRL-SPEC — docs only; NO apps/**; NO Dev G1/G2
entry_criteria:
  - BA-ERP-XBOS-CTRL-SPEC-01 PASS_TO_PM · docs/qa/evidence/ba-erp-xbos-ctrl-spec-01-20260728.md
  - SA-ERP-XBOS-CTRL-SPEC-01 PASS_TO_PM · docs/qa/evidence/sa-erp-xbos-ctrl-spec-01-20260728.md
  - read: docs/program/deltas/BA_ERP_XBOS_CTRL_SPEC_01_20260728.md
  - read: docs/xbos/TECHSPEC_XBOS_APPLY_TO_MEMBERS_EXPAND.md (+ DB/API sibling)
exit_criteria:
  1. SYNTHESIS table: BA P0/P1 vs SA Tier A/B/C — chốt one normative allow-list for G1 Dev
  2. Chốt DEC storage key for apply path: prefer hr_decision_types (E1-B live) + alias in
  3. Confirm no DDL G1 + no new HRM push URL (SA lock)
  4. Append PEER_PM_COLLAB / program note; ask sponsor «chốt E-XBOS-CTRL-SPEC»
  5. Only after sponsor chốt: DISPATCH E-XBOS-CTRL-G1 (dev-be XBOS allow-list) + G2 (HRM consume smoke)
  6. cấm apps/** · cấm Phase1/PROD · cấm Dev before sponsor chốt
```

### ack_status

**PASS_TO_PM**

# Evidence — PO-HRM-PAY-CNTT-SA-FRAGMENT-MAP-02

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-PAY-CNTT-SA-FRAGMENT-MAP-02` |
| **parent** | `PO-HRM-PAY-CNTT-BA-DATA-FRAGMENT-MAP-02` |
| **from_role** | sa |
| **to_role** | pm |
| **lane** | governance |
| **date** | 2026-08-11 |
| **priority** | P0 |
| **honesty** | `payroll_e2e_ready=false` · formula evaluator **HOLD** · `xevn_today=MISSING` all catalog fragments |
| **must_keep** | SA-01 L1–L6 · API-01 physical · GAP-CNTT-01..14 |
| **change_mode** | ADD |
| **ack_status** | **PASS_TO_PM** |

---

## 1. read_first ack

| # | Artifact | Verdict |
|---|----------|---------|
| 1 | `PO-HRM-PAY-CNTT-XLSX-COLUMN-MAP.md` | 4 models · 63 fragment refs · 18 GAP-FRG |
| 2 | `PO-HRM-PAY-CNTT-POLICY-FRAGMENT-CATALOG.md` | §4 master · §5 override · §6 refinement |
| 3 | `PO-HRM-PAY-CNTT-BA-DATA-01.md` | Entity map · GAP register unchanged |
| 4 | `PO-HRM-PAY-CNTT-SA-01.md` | L1–L6 baseline — **not reopened** |
| 5 | `po-hrm-pay-cntt-ba-data-fragment-map-02.md` | BA PASS intake |

---

## 2. Deliverables

| Deliverable | Path | Status |
|-------------|------|--------|
| ADR fragment bind | `docs/architecture/ADR-HRM-PAY-FRAGMENT-BIND-01.md` | **CONFIRMED** |
| SA-01 §9 delta | `docs/program/specs/PO-HRM-PAY-CNTT-SA-01.md` §9 | **APPENDED** |
| DB_DESIGN §8.7 | `docs/hrm/DB_DESIGN_HRM_PAYROLL.md` | **APPENDED** |
| This evidence | `docs/qa/evidence/po-hrm-pay-cntt-sa-fragment-map-02.md` | **PASS_TO_PM** |

**No `apps/**` changes.**

---

## 3. Architecture decisions (ADD)

| # | Decision |
|---|----------|
| D8 | `fragment_id` + `fragment_bind_mode` on `pay_sheet_template_lines` |
| D9 | Policy pack `policy_doc_refs_json` lists `fragment_ids[]` per doc |
| D10 | `effective_from` resolver: latest effective wins on override chain at period end date |
| D11 | Dual-template ĐPHH/TĐHK: Option **A** primary+secondary; BHXH net once (GAP-CNTT-08/10) |
| D12 | LX GAP-CNTT-09: detail sheet = process SoT; summary = export only |
| D13 | 18 GAP-FRG → **HOLD** (no new catalog fragments GĐ1); 1 BIND `FRG-DPHH-BASE-01` for DLL CPN |
| D14 | ENGINE-GAP: fragment bind = trace only until GAP-CNTT-11 evaluator LIVE |

---

## 4. GAP-FRG disposition (18)

| Disposition | Count | Notes |
|-------------|-------|-------|
| **HOLD** — `INPUT_PACK` | 8 | online hours · doanh số · lương khác · roster · tết (propose deferred) |
| **HOLD** — `DEDUCTION_GAP` | 9 | VPKL · trừ KT · ứng/tạm ứng · truy thu/lĩnh (incl. sheet instances) |
| **BIND** — existing `FRG-*` | 1 | DLL CPN → `FRG-DPHH-BASE-01` |
| **PROPOSE** (not approved) | 2 | `FRG-CHUNG-TET-01` · `FRG-LXT-ELEC-01` — need sponsor PDF |

Full row matrix: `ADR-HRM-PAY-FRAGMENT-BIND-01` §8.

---

## 5. Resolver spot-check (design-time)

| Scenario | Input | Expected `resolved_fragment_id` |
|----------|-------|--------------------------------|
| LX lượt T06/2026 ND | period_end 2026-06-30 | `FRG-LXT-QD439-LUOT` |
| LX lượt T04/2025 ND | period_end 2025-04-30 | `FRG-LXT-LUOT-ND` |
| ĐPHH DT HG tier | period_end ≥ 2024-10-01 | `FRG-DPHH-DT-HG-02` |
| ĐPHH TV | period_end ≥ 2024-12-01 | `FRG-DPHH-TV-02` |
| TG VP HN | any | CHUNG `FRG-CHUNG-2A-*` only |

---

## 6. Dual-template option (GAP-CNTT-08)

| Option | Verdict |
|--------|---------|
| A — Primary + secondary template bind, single BHXH net | **LOCK** |
| B — Single mega-template | Reject |
| C — Manual SI offset | Reject |

Snapshot field: `merge_rule: DPHH_BHXH_NET_ONCE` (see ADR §6).

---

## 7. ENGINE-GAP honesty

| Claim | Allowed |
|-------|---------|
| Store `fragment_id` on template lines | **Yes** |
| Resolver trace in period snapshot | **Yes** |
| Calculate amounts from fragment params | **No** — `xevn_today=MISSING` |
| `payroll_e2e_ready=true` | **No** |
| Process using template OV-C | **No** — evaluator HOLD |

---

## completion_report

- **Closed:** ADD architecture for fragment_id on template lines; policy_pack fragment membership; effective_from resolver for RIENG-OVERRIDE; dual-template Option A (BHXH GAP-CNTT-08); LX/TĐHK dual patterns; ENGINE-GAP rules; 18 GAP-FRG HOLD map without inventing business; DB §8.7 physical proposal; SA-01 §9 delta.
- **Open:** dev-be ensureSchema §8.7; API-01 EXPAND template line + resolve endpoints; ba-data INPUT-DATA for input_pack keys; formula evaluator GAP-CNTT-11; sponsor PDF for PROPOSE fragments.

## next_owner

`pm` → dispatch `PO-HRM-PAY-CNTT-API-01` (EXPAND F.1 fragment fields) **or** `ba-data` `PO-HRM-PAY-CNTT-INPUT-DATA-01` in parallel per program wave.

## next_dispatch_prompt

```text
work_item_id: PO-HRM-PAY-CNTT-API-01
role: sa
parent: PO-HRM-PAY-CNTT-SA-FRAGMENT-MAP-02
read_first:
- docs/architecture/ADR-HRM-PAY-FRAGMENT-BIND-01.md
- docs/program/specs/PO-HRM-PAY-CNTT-SA-01.md §9
- docs/hrm/DB_DESIGN_HRM_PAYROLL.md §8.7
- docs/program/specs/PO-HRM-AMIS-PARITY-PAY-TPL-API-01.md (must_keep)
- docs/qa/evidence/po-hrm-pay-cntt-sa-fragment-map-02.md
entry_criteria: PO-HRM-PAY-CNTT-SA-FRAGMENT-MAP-02 PASS_TO_PM
task:
  1. APPEND API_DESIGN: F-PAY-SHEET-TPL-LINE fragment_id + fragment_bind_mode; F-PAY-POLICY-PACK fragment_ids validation; F-PAY-SETUP-RESOLVE resolvedFragments[].
  2. Error codes HRM-PAY-FRG-404/412/409 with SRS step refs.
  3. Dual-template period bind fields (secondaryTemplates[], merge_rule).
exit_criteria:
  - docs/program/specs/PO-HRM-PAY-CNTT-API-01.md EXPAND delta
  - ack_status PASS_TO_PM
lane: governance · no apps/** · payroll_e2e_ready=false · formula eval HOLD unchanged
```

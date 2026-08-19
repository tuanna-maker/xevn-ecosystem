# ADR: HRM Payroll — Policy fragment bind on template lines & effective_from resolver

| Field | Value |
|-------|--------|
| **ADR-ID** | ADR-HRM-PAY-FRAGMENT-BIND-01 |
| **work_item_id** | `PO-HRM-PAY-CNTT-SA-FRAGMENT-MAP-02` |
| **Parent** | `PO-HRM-PAY-CNTT-SA-01` CONFIRMED · `PO-HRM-PAY-CNTT-BA-DATA-FRAGMENT-MAP-02` |
| **Status** | **CONFIRMED** — ADD-only · does **not** reopen SA-01 L1–L6 baseline |
| **Date** | 2026-08-11 |
| **Decision owner** | SA |
| **Related** | [`ADR-HRM-PAY-MULTI-TEMPLATE-01.md`](./ADR-HRM-PAY-MULTI-TEMPLATE-01.md) · [`PO-HRM-PAY-CNTT-POLICY-FRAGMENT-CATALOG.md`](../program/specs/PO-HRM-PAY-CNTT-POLICY-FRAGMENT-CATALOG.md) · [`PO-HRM-PAY-CNTT-XLSX-COLUMN-MAP.md`](../program/specs/PO-HRM-PAY-CNTT-XLSX-COLUMN-MAP.md) |
| **Honesty** | `payroll_e2e_ready=false` · formula evaluator **HOLD** · catalog `xevn_today=MISSING` on all 63 fragments |
| **Evidence** | `docs/qa/evidence/po-hrm-pay-cntt-sa-fragment-map-02.md` |

---

## 1. Decision context

BA-DATA-FRAGMENT-MAP-02 mapped **4 customer DONE xlsx models** → **63** `fragment_id` values from the policy catalog, with **18** columns flagged `GAP-FRG` (no catalog fragment). SA-01 locked Thiết lập lương layers L1–L6 and `pay_policy_pack` ADD — but did **not** specify how `fragment_id` binds to `pay_sheet_template_lines` or how **RIENG-OVERRIDE** supersedes chains (e.g. `FRG-LXT-QD439-LUOT` vs `FRG-LXT-LUOT-01`) at period resolution time.

**Trigger:** Physical DDL + API-01 need deterministic bind rules before dev-be ensureSchema wave.

**Non-goals (this ADR):** Implement evaluator; invent new business fragments without sponsor PDF; reopen GAP-CNTT-01..14 register.

---

## 2. Architecture — fragment bind stack

```text
POLICY-FRAGMENT-CATALOG (governance SoT — 63 rows, read-only at runtime)
        │
        ▼
pay_policy_pack.policy_doc_refs_json.fragment_ids[]
        │  + rate_params_json (scalar overrides)
        ▼
pay_sheet_templates.policy_pack_id ──► snapshot at period bind
        │
        ▼
pay_sheet_template_lines
  ├─ component_id / component_code     (L1 catalog — AMIS column)
  ├─ fragment_id TEXT NULL             (ADD — cite catalog FRG-*)
  ├─ fragment_bind_mode                (ADD — see §3.2)
  └─ formula_override_definition_id    (unchanged — eval HOLD)
        │
        ▼
payroll_periods.sheet_template_snapshot_json.lines[]
  └─ frozen fragment_id + resolved_fragment_version_at
```

| Layer | Responsibility |
|-------|----------------|
| **Catalog** | Authoritative list of `fragment_id`, `doc_id`, `effective_from`, `overrides` / `extends` |
| **Policy pack** | Curated subset of fragments + doc refs for a BP (`CHUNG` vs `RIENG`) |
| **Template line** | Column ↔ `component_code` + optional `fragment_id` for traceability / param source |
| **Period snapshot** | Immutable bind after process start — resolver output frozen |

---

## 3. Physical ADD — `pay_sheet_template_lines`

| ADD column | Type | Null | Rule |
|------------|------|------|------|
| `fragment_id` | TEXT | YES | Must match `^FRG-[A-Z0-9-]+$` when set; validated ⊆ active policy pack fragment set **or** catalog allow-list at publish |
| `fragment_bind_mode` | TEXT | YES | `CHUNG_ONLY` \| `RIENG_OVERRIDE` \| `STATUTORY` \| `IDENTITY` \| `INPUT_PACK` \| `DEDUCTION_GAP` |

| `fragment_bind_mode` | When |
|----------------------|------|
| `CHUNG_ONLY` | Column uses group QĐ only (TG P1–P4, BHXH/TNCN display) |
| `RIENG_OVERRIDE` | Column cites RIÊNG fragment that overrides/extends CHUNG per catalog §5 |
| `STATUTORY` | BHXH/TNCN computed columns — no `fragment_id` required |
| `IDENTITY` | STT · Mã NV — no fragment |
| `INPUT_PACK` | GAP-FRG operational columns fed by period input / manual sheet — **no** `fragment_id` |
| `DEDUCTION_GAP` | VPKL · trừ KT · truy thu — component + deduction entity; **no** new fragment |

**Validation (publish template):**

- `fragment_id` set ⇒ `fragment_bind_mode` ∈ {`CHUNG_ONLY`,`RIENG_OVERRIDE`}.
- `fragment_id` ∉ catalog ⇒ `HRM-PAY-FRG-404`.
- `RIENG_OVERRIDE` line on CHUNG-only template (`policy_pack.scope=CHUNG`) ⇒ `HRM-PAY-FRG-409` unless `extends` chain documented in catalog.

---

## 4. Policy pack bind (EXPAND SA-01 §4.2)

### 4.1 Pack ↔ fragment membership

`pay_policy_pack.policy_doc_refs_json` **EXPAND** shape:

```json
{
  "docs": [{ "doc_id": "POL-LXT-20251029-439", "path": "...", "fragment_ids": ["FRG-LXT-QD439-LUOT", "FRG-LXT-QD439-ANCA"] }],
  "default_fragment_scope": "RIENG-LX-T"
}
```

| Pack `code` (starter) | `scope` | `business_line_tag` | Primary `fragment_ids` |
|-----------------------|---------|---------------------|------------------------|
| `POL_CNTT_CHUNG_2A_127A` | CHUNG | — | `FRG-CHUNG-2A-*` · `FRG-CHUNG-127A-*` |
| `POL_CNTT_DPHH` | RIENG | `DPHH` | `FRG-DPHH-*` (7 doc chain) |
| `POL_CNTT_TDHK` | RIENG | `TDHK` | `FRG-TDHK-*` |
| `POL_CNTT_LX_ROUTE` | RIENG | `LX_ROUTE` | `FRG-LXT-*` per tỉnh + `FRG-LXT-QD439-*` |
| `POL_CNTT_TIME_VP_HN` | CHUNG | `TIME_VP_HN` | CHUNG only — **no** RIÊNG PDF (catalog §1 TG) |

### 4.2 Template ↔ pack (unchanged FK)

- `pay_sheet_templates.policy_pack_id` → single primary pack per template row.
- Dual-template employees (ĐPHH time + DT): **second template** may reference same `policy_pack_id` or sibling pack — see §6.

---

## 5. `effective_from` resolver — RIENG-OVERRIDE

### 5.1 Problem

Catalog §2 documents supersedes chains. Example: `FRG-LXT-QD439-LUOT` (`effective_from=01/09/2025`) **overrides** `FRG-LXT-LUOT-ND|NB|TB|PT`. Period **T06/2026** must resolve QD439; period **T04/2025** may resolve QC tỉnh fragment.

### 5.2 Resolver contract (read-only at period bind + process)

**Input:**

- `company_id`
- `pay_period_end_date` (last day of payroll month)
- `policy_pack_id` (from template snapshot)
- `fragment_id` candidate (from template line)
- optional `context_json` `{ province_code, shift_code, … }` from input pack / employee OU

**Algorithm:**

```text
1. Load all catalog fragments reachable from policy_pack.policy_doc_refs_json.fragment_ids[]
   (full catalog table in governance; runtime = seeded read model or JSON export GĐ1).

2. Build override graph from catalog columns: overrides, extends.

3. For candidate FRG-X, collect chain S = { FRG-X } ∪ ancestors via overrides[].

4. Filter S' = { f ∈ S | f.effective_from <= pay_period_end_date
                    AND (f.effective_to IS NULL OR f.effective_to >= pay_period_start) }.

5. If |S'| > 1 and edges are override (not extend):
     pick f* = argmax(effective_from) — latest wins (deterministic).

6. If extends only (FRG-TDHK-* extends CHUNG):
     return { primary: f*, extends: [CHUNG fragments for P1–P4] } — no replacement.

7. Emit resolved_fragment_id, resolved_effective_from, resolver_trace_json
   → store in period snapshot per template line.
```

| Case | Resolved |
|------|----------|
| LX lượt T06/2026, tỉnh ND | `FRG-LXT-QD439-LUOT` (not `FRG-LXT-LUOT-ND`) |
| LX lượt T04/2025 | `FRG-LXT-LUOT-ND` (QD439 not yet effective) |
| ĐPHH DT % | `FRG-DPHH-DT-HG-02` over `FRG-DPHH-DT-HG-01` when period ≥ 01/10/2024 |
| ĐPHH TV | `FRG-DPHH-TV-02` over `FRG-DPHH-TV-01` when period ≥ 01/12/2024 |
| TG VP HN | CHUNG fragments only — resolver returns CHUNG; no RIENG override |

**Error semantics:**

| Code | When |
|------|------|
| `HRM-PAY-FRG-404` | `fragment_id` not in catalog export |
| `HRM-PAY-FRG-412` | No fragment in chain effective for period date |
| `HRM-PAY-FRG-409` | Template RIENG line but pack `scope=CHUNG` |

**GĐ1 honesty:** Resolver may **persist trace** in snapshot; **must not** claim amount calculation — `xevn_today=MISSING` on all fragments (ENGINE-GAP / GAP-CNTT-11).

---

## 6. Option evaluation — dual-template BHXH (`GAP-CNTT-08`)

**Problem:** ĐPHH employees may appear on `DPHH_VP_THOI_GIAN` and `DPHH_VP_DOANH_THU` same period; customer xlsx nets BHXH once across sheets (`FRG-DPHH-BASE-01` aggregate).

| Option | Description | Pros | Cons | Verdict |
|--------|-------------|------|------|---------|
| **A — Primary + secondary template bind** | Period holds `primary_template_id` + optional `secondary_template_ids[]`; process merges gross lines; **single** SI deduction on combined SI base per VAL-CNTT-05 | Matches Excel; explicit audit | Two snapshots; merge rules in process | **RECOMMEND** |
| **B — Single template with DT tab lines** | One template includes both time + DT column groups | One snapshot | Wide template; diverges from customer file structure | Reject |
| **C — Manual BHXH adjustment column** | Operator enters net SI offset | Simple | Not UAT-safe; violates automation AC | Reject |

**Decision D8 (ADD):** Option **A** — `payroll_period_template_bindings` (PAPER sibling to period) or `sheet_template_snapshot_json.secondaryTemplates[]` with:

- `merge_rule: DPHH_BHXH_NET_ONCE`
- `si_base_source: MAX(time_sheet_si_base, dt_sheet_si_base)` per employee — **exact formula** deferred to formula wave; architecture requires **one** `KH_BHXH` payslip line per employee per period.

TĐHK parallel (`GAP-CNTT-10`): same pattern — `TDHK_THOI_GIAN` primary + `TDHK_KPI` secondary; statutory deductions once on primary snapshot.

LX summary/detail (`GAP-CNTT-09`): **detail template** (`Luong lai tuyen`) = process SoT; summary sheet = **display/export** only — no second period bind.

---

## 7. ENGINE-GAP — `xevn_today=MISSING`

| Fact | Architecture rule |
|------|-------------------|
| All 63 catalog fragments mark `xevn_today=MISSING` | Product has **no** live policy engine reading PDF/OCR params |
| XLSX columns tagged `ENGINE-GAP` | Bind `fragment_id` for **traceability**; amounts come from HOLD formula eval or honest `0` + warning until GAP-CNTT-11 closed |
| `rate_params_json` on policy pack | GĐ1: manual entry + validation hints; **not** auto-OCR |
| Template OV-C FK | CRUD LIVE; process using override **BLOCKED** (SA-01 §4) |

**Lift gate (unchanged):** `expression_json` physical CONFIRMED → FORMULA-EVAL-BE-01 → U65 process ≠ silent 0₫.

---

## 8. GAP-FRG disposition (18 columns — no invent)

Canonical 18 from XLSX map (deduped by business key; multi-model occurrences share disposition):

| # | Business key / column (VI) | Model(s) | `fragment_bind_mode` | `fragment_id` | Disposition |
|---|---------------------------|----------|----------------------|---------------|-------------|
| 1 | Đang đóng BHXH | TG | `INPUT_PACK` | — | **HOLD** → `employee_insurances` display flag; GAP boolean |
| 2 | Số giờ công online | TG | `INPUT_PACK` | — | **HOLD** → ATT extension / `days_online` input_pack |
| 3 | Ngày công khác (Hưởng LCB) | TG | `INPUT_PACK` | — | **HOLD** → ATT leave-type map |
| 4 | Lương doanh số | TG | `INPUT_PACK` | — | **HOLD** → `LUONG_DOANH_SO` component; no CHUNG fragment |
| 5 | Lương online | TG | `INPUT_PACK` | — | **HOLD** → `LUONG_ONLINE` component |
| 6 | Lương khác | TG · TĐHK · peer sheets | `INPUT_PACK` | — | **HOLD** → `LUONG_KHAC` · GAP-CNTT-03 |
| 7 | Vi phạm kỷ luật | TG · TĐHK · VPKL sheet | `DEDUCTION_GAP` | — | **HOLD** → `KH_VPKL` · GAP-CNTT-06 |
| 8 | Bảng trừ kế toán | TG | `DEDUCTION_GAP` | — | **HOLD** → `KH_TRU_KE_TOAN` · GAP-CNTT-04 |
| 9 | Ứng lương lần 1 | TG · LX · peer | `DEDUCTION_GAP` | — | **HOLD** → `KH_UNG_LUONG_1` · GAP-CNTT-03 |
| 10 | Tạm ứng khác | TG · TĐHK | `DEDUCTION_GAP` | — | **HOLD** → `KH_TAM_UNG` |
| 11 | Truy thu / Truy lĩnh | All | `DEDUCTION_GAP` | — | **HOLD** → `TRUY_THU`/`TRUY_LINH` · GAP-CNTT-05 |
| 12 | Thưởng tết | TG peer | `INPUT_PACK` | — | **HOLD** → seasonal manual; **PROPOSE** `FRG-CHUNG-TET-01` only after sponsor QĐ |
| 13 | Phụ cấp sạc điện | LX | `INPUT_PACK` | — | **HOLD** → `PC_SAC_DIEN`; **PROPOSE** `FRG-LXT-ELEC-01` deferred — no PDF in catalog |
| 14 | Roster / tỉnh / HĐ (input 29.07) | LX | `INPUT_PACK` | — | **HOLD** → input_pack keys · not policy fragment |
| 15 | DLL CPN logistics | ĐPHH | `RIENG_OVERRIDE` | `FRG-DPHH-BASE-01` | **BIND** existing fragment; amount via input_pack `dll_cpn` |
| 16 | Tạm ứng lương (TĐHK sheet) | TĐHK | `DEDUCTION_GAP` | — | **HOLD** (dup #9/#10 — counted in 18 for sheet instance) |
| 17 | Tạm ứng khác (TĐHK sheet) | TĐHK | `DEDUCTION_GAP` | — | **HOLD** (dup #10) |
| 18 | Vi phạm kỷ luật (TĐHK sheet) | TĐHK | `DEDUCTION_GAP` | — | **HOLD** (dup #7) |

**SA rule:** **Zero** new `fragment_id` approved for implementation GĐ1. Rows marked **PROPOSE** require sponsor PDF + ba-process AC before catalog §4 append.

---

## 9. Four-model template ↔ pack ↔ fragment summary

| Template `code` | `policy_pack` | Line bind pattern | Dual bind |
|-----------------|---------------|-------------------|-----------|
| `VP_HN_THOI_GIAN` | `POL_CNTT_CHUNG_2A_127A` | `FRG-CHUNG-2A-*` · `FRG-CHUNG-127A-*` + GAP-FRG INPUT/DEDUCTION modes | — |
| `LX_TUYEN` | `POL_CNTT_LX_ROUTE` | `FRG-LXT-*` RIENG_OVERRIDE; resolver for lượt | Detail only (GAP-CNTT-09) |
| `TDHK_THOI_GIAN` + `TDHK_KPI` | `POL_CNTT_TDHK` | `FRG-TDHK-TG-01` · `FRG-TDHK-CUOC-01` · `FRG-TDHK-HD-01` | Secondary KPI (GAP-CNTT-10) |
| `DPHH_VP_THOI_GIAN` + `DPHH_VP_DOANH_THU` | `POL_CNTT_DPHH` | `FRG-DPHH-*` | BHXH net once (GAP-CNTT-08) |

---

## 10. API / DB unlock (APPEND only — cite API-01)

| Target | ADD |
|--------|-----|
| `F-PAY-SHEET-TPL-LINE-UPSERT-01` | Request fields `fragment_id?`, `fragment_bind_mode?` |
| `F-PAY-POLICY-PACK-UPSERT-01` | Validate `fragment_ids[]` ⊆ catalog export |
| `F-PAY-SETUP-RESOLVE-01` | Response includes `resolvedFragments[]` per line for period preview |
| `DB_DESIGN_HRM_PAYROLL.md` §8.7 | `pay_sheet_template_lines.fragment_id` + `fragment_bind_mode` |

---

## 11. Decision summary

| # | Decision |
|---|----------|
| D8 | ADD `fragment_id` + `fragment_bind_mode` on `pay_sheet_template_lines` |
| D9 | Policy pack carries `fragment_ids[]` via `policy_doc_refs_json` — template FK unchanged |
| D10 | `effective_from` resolver: latest effective wins on override chains at `pay_period_end_date` |
| D11 | Dual-template ĐPHH/TĐHK: Option A primary+secondary bind; BHXH deducted once |
| D12 | All 18 GAP-FRG: **HOLD** as component/input/deduction — **no** new catalog fragments GĐ1 |
| D13 | ENGINE-GAP: bind trace only until evaluator LIVE — `payroll_e2e_ready=false` |

---

## 12. Validation evidence (architecture)

| Check | PASS when |
|-------|-----------|
| VAL-FRG-01 | Every non-null `fragment_id` on published template ∈ catalog |
| VAL-FRG-02 | LX T06/2026 resolver returns `FRG-LXT-QD439-LUOT` not `FRG-LXT-LUOT-ND` |
| VAL-FRG-03 | ĐPHH dual bind snapshot lists `merge_rule: DPHH_BHXH_NET_ONCE` |
| VAL-FRG-04 | GAP-FRG lines have `fragment_id` NULL and mode `INPUT_PACK` or `DEDUCTION_GAP` |
| VAL-FRG-05 | Process with ENGINE-GAP does not claim `payroll_e2e_ready=true` |

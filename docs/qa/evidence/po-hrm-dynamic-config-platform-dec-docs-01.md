# Evidence — PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-DOCS-01

| Meta | Value |
|------|-------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-DOCS-01` |
| **parent** | `PO-HRM-CONTRACT-LEGAL-PRINT-QC-03` GWC · DEC-VERTICAL-SA-01 · DEC-DATA-01 · DEC-BE-01 |
| **from_role** | ba-docs |
| **to_role** | pm |
| **lane** | governance |
| **priority** | P1 |
| **program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **change_mode** | **ADD** client DOC-DELTA (API F.1 + DB/SRS pointers) |
| **ack_status** | **PASS_TO_PM** |
| **date** | 2026-08-07 |
| **honesty** | All `*_ready=false` · `contracts_printable_ready=false` **LOCKED** · no Phase1 DONE · U65 |
| **no_prompt_echo** | **true** — client VI clean (no work_item / pipeline meta in SRS body) |

---

## 1. read_first ack

| Artifact | Used |
|----------|------|
| `PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-VERTICAL-SA-01.md` | §3 F-DEC-CAT-TYP/EFF F.1 · §4 consumer · §7 DOC-DELTA · AC-PLT-DEC-01..06 · L-DEC-CAT-11 Merge OUT |
| `PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-DATA-01.md` | §2 physical `hr_decision_type` · dual SoT · VAL matrix · honesty |
| `po-hrm-dynamic-config-platform-dec-be-01.md` | Nest `/decisions/decision-types*` · EFF · retire · READY_FOR_QA · residual R-PLT-DEC-02 |
| Peer EMP-DOCS-01 | ADD-only F.1 pattern · footer stamp · no wipe |
| `API_DESIGN_HRM_ENTERPRISE.md` decisions / CORE overlay | Prior E2E F-CORE-DEC pointer · EMP CAT peer |

---

## 2. Deliverables (client — no `apps/**`)

| Path | Change |
|------|--------|
| [`API_DESIGN_HRM_ENTERPRISE.md`](../../client-delivery/hrm-enterprise-blueprint/API_DESIGN_HRM_ENTERPRISE.md) | **ADD** F-DEC-CAT-TYP-01/02 · F-DEC-CAT-EFF-01 (Mục đích · Nghiệp vụ · bước SRS · DTO↔cột) · **EXPAND** F-CORE-DEC-01/02 footnote · §7.1–7.3 · header/footer stamp **DOC-DELTA CONFIRMED** |
| [`DB_DESIGN_HRM_ENTERPRISE.md`](../../client-delivery/hrm-enterprise-blueprint/DB_DESIGN_HRM_ENTERPRISE.md) | **ADD** footer pointer DEC-DOCS-01 → API F.1 · **KEEP** §3.11a physical (DEC-DATA-01) — **no wipe** |
| [`SRS_HRM_ENTERPRISE.md`](../../client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md) | **EXPAND** FR-UC-BP-CORE-01a (catalog mở · nghỉ mềm · kiểm tra mã) · version **0.23** — no new FR |

**Forbidden touched:** none of `apps/**` · no seed · no invent QSĐ MergeToken print · no flip `*_ready` / printable.

---

## 3. F.1 coverage checklist (OS 13 §F.1)

| F-id | Path class | Mục đích | Nghiệp vụ | Bước SRS | DTO↔cột |
|------|------------|----------|-----------|----------|---------|
| F-DEC-CAT-TYP-01 | GET list/get decision-types | ✓ | ✓ | FR-UC-BP-CORE-01a · AC-PLT-DEC-01 | ✓ |
| F-DEC-CAT-TYP-02 | POST/PUT/PATCH/retire | ✓ | ✓ | AC-PLT-DEC-01/02 | ✓ |
| F-DEC-CAT-EFF-01 | GET decision-types/effective | ✓ | ✓ | BR-PLT-02/06 · AC-PLT-DEC-03 · F-CORE-DEC | read model |

---

## 4. must_keep / DENY verify

| Rule | Result |
|------|--------|
| CTR library QC-03 GWC · print-spine · PDF | **PASS** — no wipe CTR F.1 |
| EMP DOC/ET L1 + browser GWC | **PASS** — F-EMP-CAT-* untouched |
| DEC WH spine F-CORE-DEC-01/02 | **PASS** — footnote EXPAND only |
| Soft-delete retire · open keys | **PASS** (TYP-02) |
| Dual SoT REF `hr_decision_types` ≠ tenant writer | **PASS** (TYP-01/EFF-01) |
| **DENY** invent QSĐ MergeToken print GĐ2 | **PASS** — stated OUT / FORBIDDEN |
| **DENY** flip any `*_ready` · `contracts_printable_ready` | **PASS** — remain **false** |

---

## 5. Residual

| ID | Item | Owner |
|----|------|-------|
| R-PLT-DEC-02 | Client API DOC-DELTA F-DEC-CAT-* | **CLOSED** (this seat) |
| R-PLT-DEC-01 | Wire consumer flags (BE) | **CLOSED** on DEC-BE-01 (cite) — QA L1 next |
| DEC-QA-01 | L1 API retest AC-PLT-DEC / Nest routes | **qa** (after BE READY) |
| R-PLT-DEC-FE-01 | Settings picker + QSĐ form bind | **dev-fe** HOLD until DEC-QA L1 PASS |
| R-PLT-DEC-04 | FormSchema per type | GĐ1.5 |
| R-PLT-DEC-05 | QSĐ MergeToken print | **GĐ2** — DENY invent this wave; MergeToken lane if already in flight elsewhere |

---

## 6. completion_report

**Closed:** ADD-only client DOC-DELTA for DEC Nest catalog F.1 (`decision-types` · `effective` · `retire`) with full Mục đích / Nghiệp vụ / bước SRS / DTO↔`hr_decision_type`; EXPAND F-CORE-DEC-01/02 footnote (∈ EFF · typed flags); DB footer API pointer (physical already DEC-DATA-01); SRS CORE-01a open-catalog note v0.23; closes **R-PLT-DEC-02**; honesty / printable flags remain false; no apps/**; no wipe CTR/EMP seals; DENY MergeToken GĐ2 invent.

**Still open:** DEC-QA-01 L1; DEC-FE after L1 PASS; FormSchema GĐ1.5; MergeToken print GĐ2 (do not open from this seat).

---

## 7. next_owner / next_dispatch_prompt

**next_owner:** **pm** — if MergeToken already DISPATCHED elsewhere → do not re-open GĐ2 from here; after **DEC-QA-01** L1 PASS → **dev-fe** DEC Settings / QSĐ form bind.

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-FE-01
from_role: pm
to_role: dev-fe
lane: execution
priority: P1
change_mode: ADD
prior: DEC-DOCS-01 PASS · DEC-QA-01 L1 PASS (gate)
spec_ref: F-DEC-CAT-TYP/EFF · AC-PLT-DEC-01..06 · FR-UC-BP-CORE-01a

entry_criteria:
- Evidence: docs/qa/evidence/po-hrm-dynamic-config-platform-dec-docs-01.md
- L1 QA PASS stamped on dec-qa-01 (do not start FE if L1 FAIL / not run)
- API_DESIGN F-DEC-CAT-* + Nest paths live (cite dec-be-01)
- U65 zero-seed; browser FE-only for UF later
- must_keep: DEC WH spine · EMP DOC/ET · CTR print seals · contracts_printable_ready=false
- DENY: invent QSĐ MergeToken print GĐ2 · flip *_ready

scope:
- Settings / DEC CFG pickers: decision-types list/upsert/retire
- Bind QSĐ create/patch picker to EFF when catalog>0
- Display-ready labels from catalog flags (person-bound / WH hints)

exit_criteria:
- Evidence: docs/qa/evidence/po-hrm-dynamic-config-platform-dec-fe-01.md
- ack_status: READY_FOR_QA
- honesty flags remain false

If DEC-QA-01 still in flight / FAIL: do not dispatch FE — PASS_TO_PM idle docs lane or residual BE only.
If MergeToken work_item already in flight: leave GĐ2 to that owner — do not invent print from DEC-FE.
```

---

## 8. Handoff contract

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-dec-docs-01.md` |
| **next_owner** | **pm** (then **dev-fe** after DEC-QA L1 PASS; MergeToken GĐ2 only if already in flight elsewhere) |
| **completion_report** | See §6 |
| **next_dispatch_prompt** | See §7 |

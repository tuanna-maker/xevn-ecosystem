# Evidence — PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-DOCS-01

| Meta | Value |
|------|-------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-DOCS-01` |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-BE-01` · EMP-VERTICAL-SA-01 · EMP-DATA-01 |
| **from_role** | ba-docs |
| **to_role** | pm |
| **lane** | governance |
| **priority** | P3 |
| **program** | `PO-HRM-CONTINUOUS-W7-20260807` |
| **change_mode** | **ADD** client DOC-DELTA (API F.1 + DB/SRS pointers) |
| **ack_status** | **PASS_TO_PM** |
| **date** | 2026-08-07 |
| **honesty** | `hrm_personnel_uat_ready=false` · `employees_e2e_linkage_ready=false` · `payroll_e2e_ready=false` · `attendance_uat_ready=false` · `recruitment_uat_ready=false` · no Phase1 DONE · U65 |
| **no_prompt_echo** | **true** — client VI clean |

---

## 1. read_first ack

| Artifact | Used |
|----------|------|
| `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-DATA-01.md` | §2–3 physical · §3.4 dual SoT · honesty · R-PLT-EMP-03 |
| `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-VERTICAL-SA-01.md` | §3 F-EMP-CAT-* F.1 · §7 DOC-DELTA · AC-PLT-EMP-01..06 · must_keep |
| `po-hrm-dynamic-config-platform-emp-be-01.md` | Nest paths document-types / employment-types / effective / retire |
| Peer PAY-CATALOG / EMP-DATA DOC-DELTA footers | ADD-only pattern · no wipe |

---

## 2. Deliverables (client — no `apps/**`)

| Path | Change |
|------|--------|
| [`API_DESIGN_HRM_ENTERPRISE.md`](../../client-delivery/hrm-enterprise-blueprint/API_DESIGN_HRM_ENTERPRISE.md) | **ADD** F-EMP-CAT-DOC-01/02 · ET-01/02 · EFF-01/02 (Mục đích · Nghiệp vụ · bước SRS · DTO↔cột) · **EXPAND** F-CORE-CTR-01 / F-CORE-ACT-01 footnotes · §7.1–7.3 · header/footer stamp **DOC-DELTA CONFIRMED** |
| [`DB_DESIGN_HRM_ENTERPRISE.md`](../../client-delivery/hrm-enterprise-blueprint/DB_DESIGN_HRM_ENTERPRISE.md) | **ADD** footer pointer EMP-DOCS-01 → API F.1 · **KEEP** §3.0a–b physical (EMP-DATA-01) — **no wipe** |
| [`SRS_HRM_ENTERPRISE.md`](../../client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md) | **EXPAND** FR-UC-BP-CORE-03 short config note (open DOC catalog · ET sibling · XBOS position) — no new FR |

**Forbidden touched:** none of `apps/**` · no seed · no invent UAT/ready flags.

---

## 3. F.1 coverage checklist (OS 13 §F.1)

| F-id | Path class | Mục đích | Nghiệp vụ | Bước SRS | DTO↔cột |
|------|------------|----------|-----------|----------|---------|
| F-EMP-CAT-DOC-01 | GET list/get document-types | ✓ | ✓ | FR-UC-BP-CORE-03 · AC-PLT-EMP-02 | ✓ |
| F-EMP-CAT-DOC-02 | POST/PUT/PATCH/retire | ✓ | ✓ | AC-PLT-EMP-02/03 | ✓ |
| F-EMP-CAT-ET-01 | GET list/get employment-types | ✓ | ✓ | AC-PLT-EMP-04 · BR-PLT-06 | ✓ |
| F-EMP-CAT-ET-02 | POST/PUT/PATCH/retire | ✓ | ✓ | AC-PLT-EMP-04/05 | ✓ |
| F-EMP-CAT-EFF-01 | GET document-types/effective | ✓ | ✓ | BR-PLT-02 · CORE-03 | read model |
| F-EMP-CAT-EFF-02 | GET employment-types/effective | ✓ | ✓ | BR-PLT-06 · AC-PLT-EMP-05 | read model |

---

## 4. must_keep / DENY verify

| Rule | Result |
|------|--------|
| AC-PLT-EMP-01 XBOS position/dept — no `emp_position` | **PASS** (stated OUT in F.1 / ACT footnote / SRS note) |
| Soft-delete retire only | **PASS** (DOC-02 / ET-02) |
| Open keys — no closed starter CHECK | **PASS** |
| CORE-01 / UF-HRM-02 / SI spines | **PASS** (no wipe) |
| DENY `hrm_personnel_uat_ready=true` | **PASS** — remains **false** |
| DENY `employees_e2e_linkage_ready=true` | **PASS** — remains **false** |

---

## 5. Residual

| ID | Item | Owner |
|----|------|-------|
| R-PLT-EMP-03 | Client API DOC-DELTA | **CLOSED** (this seat) |
| R-PLT-EMP-01 | Wire checklist / ACT-01 → EFF-01 | residual BE/FE (not this seat) |
| R-PLT-EMP-02 | Wire YCTD/employee ET → EFF-02 | residual BE/REC (not this seat) |
| EMP-QA-01 | L1 API retest | **in flight** (prior) |
| EMP-FE | Settings pickers after L1 PASS | **dev-fe** HOLD until L1 |

---

## 6. completion_report

**Closed:** ADD-only client DOC-DELTA for EMP Nest catalog F.1 (`document-types` · `employment-types` · `effective` · `retire`) with full Mục đích / Nghiệp vụ / bước SRS / DTO↔cột; EXPAND CTR-01 + ACT-01 footnotes; DB footer API pointer (physical already EMP-DATA-01); optional SRS CORE-03 config note; closes **R-PLT-EMP-03**; honesty flags remain false; no apps/**; no wipe; must_keep AC-PLT-EMP-01 + soft-delete + open keys.

**Still open:** EMP-QA-01 L1; FE Settings after L1 PASS; R-PLT-EMP-01/02 consumer wire.

---

## 7. next_owner / next_dispatch_prompt

**next_owner:** **pm** — after EMP-QA-01 L1 PASS → **dev-fe** Settings; if L1 still in flight → **idle** docs lane (no further ba-docs).

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-FE-01
from_role: pm
to_role: dev-fe
lane: execution
priority: P2
change_mode: ADD
prior: EMP-DOCS-01 PASS · EMP-QA-01 L1 PASS (gate)

entry_criteria:
- Evidence: docs/qa/evidence/po-hrm-dynamic-config-platform-emp-docs-01.md
- L1 QA PASS stamped on emp-qa-01 (do not start FE if L1 FAIL)
- API_DESIGN F-EMP-CAT-* + Nest paths live
- U65 zero-seed; browser FE-only for UF later

scope:
- Settings pickers: document-types + employment-types (list/upsert/retire)
- Bind checklist / employment_type pickers to EFF when catalog>0
- must_keep: AC-PLT-EMP-01 XBOS position · profile/contracts/SI · no invent ready flags

exit_criteria:
- Evidence: docs/qa/evidence/po-hrm-dynamic-config-platform-emp-fe-01.md
- ack_status: READY_FOR_QA
- honesty flags remain false

If EMP-QA-01 still in flight / FAIL: do not dispatch FE — PASS_TO_PM idle or residual BE only.
```

---

## 8. Handoff contract

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-emp-docs-01.md` |
| **next_owner** | **pm** (then **dev-fe** after L1 PASS, else idle) |
| **completion_report** | See §6 |
| **next_dispatch_prompt** | See §7 |

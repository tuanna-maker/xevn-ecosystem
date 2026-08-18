# SA-XBOS-TECHSPEC-W2-REF-01 — Evidence

| Field | Value |
|-------|--------|
| **work_item_id** | `SA-XBOS-TECHSPEC-W2-REF-01` |
| **from_role** | sa |
| **to_role** | pm |
| **lane** | governance |
| **date** | 2026-07-22 |
| **ack_status** | `PASS_TO_PM` |
| **priority** | P1 |
| **queue** | `BMINUTES_MEMBER_SEQUENTIAL_QUEUE.md` #17 |

---

## 0. Verdict

**PASS (governance).** W2 catalog **4/4 FR** có `ref_srs` + endpoint/DTO/DB map trong `docs/xbos/TECHSPEC.md` §14.0b · §14.14–14.17. W1 §14.1–14.12 **không đè**. Residual OpenAPI/DTO cho Dev ghi §14.13 — **không** `apps/**`. **Không** claim Phase1 / PROD / 373 FR / wipe UF 🟢.

---

## 1. Micro-checklist

| # | Item | Result |
|---|------|--------|
| 1 | Add `ref_srs` + endpoint/DTO cho 4 W2 FR only | **PASS** — §14.14–14.17 |
| 2 | Do not overwrite W1 12 FR | **PASS** — §14.1–14.12 giữ nguyên nội dung FR |
| 3 | Gap list Dev nếu OpenAPI thiếu | **PASS** — §14.13 G-OA-W2-RACI-01 · G-OA-W2-CC-CAT-01 (+ DTO P2) |
| 4 | Evidence path này | **PASS** |
| 5 | PASS_TO_PM → next #18 BA-HRM W2d OR QC spine sample | **PASS** — §6 |

**cấm adhered:** no apps/** · no UF wipe · no seed · no Phase1/PROD / 373 claim.

---

## 2. W2 FR → contract map

| FR | Khách § | Primary HTTP | Envelope | OpenAPI | SA status |
|----|---------|--------------|----------|---------|-----------|
| FR-XBOS-RACI-02 | §3.13 | `GET/PUT …/raci-governance/companies/{id}/matrix*` | `XBOS-RACI-200/201` | **MISSING** | PARTIAL |
| FR-CC-P0-04 | §3.14 | `GET/PUT …/position-rbac/matrix` | `XBOS-POS-200/201` | Path **present** | ALIGNED (DTO depth P2) |
| FR-CC-P0-05 | §3.15 | `GET/PUT …/business-master/command_center_catalogs/items*` | `XBOS-MASTER-200/201` | Generic path; kinds semantics thin | PARTIAL |
| FR-XBOS-KPI-03 | §3.16 | `GET …/kpi-engine/rollup` | `XBOS-KPI-202` | `kpiEngineRollup` | ALIGNED |

Dual-ref CC P0: `docs/xbos/COMMAND_CENTER_P0_TECHSPEC.md` header updated (FR-CC-P0-04/05).

---

## 3. Residual gaps (Dev — copy-ready)

| ID | Severity | Suggested work_item | Note |
|----|----------|---------------------|------|
| **G-OA-W2-RACI-01** | P1 | `BE-XBOS-OA-RACI-GOVERNANCE-01` | Add `raci-governance/*` to `xbos-api.yaml`; must_keep UF-XBOS-07 |
| **G-DTO-W2-RACI-01** | P2 | gộp OA-RACI | class-validator DTO for cell PUT |
| **G-OA-W2-CC-CAT-01** | P1 | `BE-XBOS-OA-CC-CATALOGS-01` | Document `command_center_catalogs` + regulations\|measurements\|pricing; must_keep UF-XBOS-14 |
| **G-DTO-W2-CC-CAT-01** | P2 | gộp OA-CC-CAT | Components schemas 3 row types |
| **G-DTO-W2-POS-01** | P2 | `BE-XBOS-OA-POS-MATRIX-DTO-01` | PermissionMatrixRow requestBody depth |

W1 G-OA-02..04 remain **CLOSED** (QC GWC) — not reopened.

---

## 4. Deliverables

| Artifact | Change |
|----------|--------|
| `docs/xbos/TECHSPEC.md` | Header W2 CLOSED · §14.0b · §14.14–14.17 · §14.13 W2 gaps |
| `docs/xbos/COMMAND_CENTER_P0_TECHSPEC.md` | Dual-ref FR-CC-P0-04/05 |
| Evidence | this file |

---

## 5. completion_report

| | |
|--|--|
| **Closed** | `ref_srs` + HTTP/DTO/DB/FE for RACI-02 · CC-P0-04 · CC-P0-05 · KPI-03; W1 12 FR untouched; Dev gap list owner-tagged |
| **Open** | OpenAPI P1 RACI + CC catalogs (runtime exists); optional BA-HRM W2d leftover; planned_W3 XBOS CAT/WF/RACI sâu |
| **Not claimed** | Phase1 DONE · PROD · 373 remaster · UF wipe |

---

## 6. Handoff

| Field | Value |
|-------|--------|
| **next_owner** | `pm` → dispatch **`ba-docs`** (queue #18) |
| **ack_status** | `PASS_TO_PM` |
| **evidence_path** | `docs/qa/evidence/sa-xbos-techspec-w2-ref-01-20260722.md` |

### next_dispatch_prompt

```text
work_item_id: BA-HRM-SRS-BATECO-W2D-LEFTOVER-01
from_role: pm
to_role: ba-docs
lane: governance
priority: P2
queue: docs/program/BMINUTES_MEMBER_SEQUENTIAL_QUEUE.md #18
entry_criteria: XBOS W2 ref_srs CLOSED (SA-XBOS-TECHSPEC-W2-REF-01 · evidence sa-xbos-techspec-w2-ref-01-20260722); HRM W2 leftover inventory planned_W2d / Trung bình
exit_criteria: ADD-only leftover HRM FR batch (không wipe W1/W2 ready); inventory body_ready; evidence docs/qa/evidence/ba-hrm-srs-bateco-w2d-leftover-01-YYYYMMDD.md; PASS_TO_PM
cấm: apps/** · Phase1/PROD · 373 claim · wipe UF 🟢 · seed
optional_alt: nếu PM ưu tiên contract sync trước — BE-XBOS-OA-RACI-GOVERNANCE-01 (G-OA-W2-RACI-01) yaml-only
```

### pm_dispatch_hint

Queue #17 ✅ → **#18 `BA-HRM-SRS-BATECO-W2D-LEFTOVER-01`**. OpenAPI W2 gaps = backlog Dev (không block BA-HRM); QC spine sample không bắt buộc khi W1 OA đã GWC.

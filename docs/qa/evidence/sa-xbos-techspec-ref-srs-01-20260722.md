# SA-XBOS-TECHSPEC-REF-SRS-01 — Evidence

| Field | Value |
|-------|--------|
| **work_item_id** | `SA-XBOS-TECHSPEC-REF-SRS-01` |
| **from_role** | sa |
| **to_role** | pm |
| **lane** | governance |
| **date** | 2026-07-22 |
| **ack_status** | `PASS_TO_PM` |
| **priority** | P1 |
| **queue** | #7 ANTI-STUCK |

---

## 0. Verdict

**PASS (governance).** W1 spine **12/12 FR** có `ref_srs` → SRS khách + đoạn TechSpec phục vụ (matrix §14.0 + §14.1–14.12). Residual OpenAPI/DTO ghi backlog Dev — **không** implement `apps/**`. **Không** claim Phase1 / PROD / 373 FR / wipe UF 🟢.

---

## 1. Micro-checklist

| # | Item | Result |
|---|------|--------|
| 1 | Add `ref_srs` → FR khách cho 12 spine FR | **PASS** — `docs/xbos/TECHSPEC.md` §14.1–14.12 |
| 2 | Đoạn TechSpec phục vụ FR (table + per FR) | **PASS** — §14.0 cột «Đoạn TechSpec phục vụ» + §14.1–14.12 |
| 3 | Residual gaps Dev (OpenAPI/DTO) without implementing | **PASS** — §14.13 G-OA-02..04 · G-DTO-01..02 · G-SCOPE-01 |
| 4 | Evidence path này | **PASS** |
| 5 | PASS_TO_PM + next_dispatch (TM/QC sample hoặc W2 ba) | **PASS** — §6 |

**cấm adhered:** no apps/** · no UF wipe · no seed · no Phase1/PROD claim.

---

## 2. Deliverables

| Artifact | Change |
|----------|--------|
| `docs/xbos/TECHSPEC.md` | Header lock W1 + **§14** full trace (12 FR) + residual §14.13 |
| `docs/xbos/COMMAND_CENTER_P0_TECHSPEC.md` | Header `ref_srs` FR-CC-P0-01 · ORG-03 · ORG-02 |
| `docs/ecosystem/TECHSPEC.md` | Header dual-ref **FR-ECO-SCOPE-02** (G-REF-04) |

### Count

| Metric | Value |
|--------|-------|
| FR khách W1 | 12 |
| `ref_srs` lines in `docs/xbos/TECHSPEC.md` | ≥12 (grep `ref_srs` = 14 incl. header notes) |
| Prior BA gap G-REF-01 | **CLOSED** (was ≈0) |

---

## 3. Trace map (FR → TechSpec đoạn → primary API)

| FR | TechSpec | Primary HTTP | SA status |
|----|----------|--------------|-----------|
| FR-XBOS-AUTH-01 | §14.1 · §5 | `POST /auth/login` → XBOS-AUTH-200 | ALIGNED |
| FR-XBOS-TENANT-01 | §14.2 · M01-Tenant | accessible + **select-membership** | PARTIAL (OA) |
| FR-ECO-SCOPE-02 | §14.3 · ecosystem TS | JWT/headers scope | ALIGNED docs |
| FR-XBOS-ORG-01 | §14.4 · §11 | org-units/tree · group-member-units | ALIGNED |
| FR-XBOS-ORG-03 | §14.5 · CC P0 | legal-entities + documents | PARTIAL (OA) |
| FR-CC-P0-01 | §14.6 · CC P0 | shareholders CRUD | PARTIAL (OA) |
| FR-XBOS-ORG-02 | §14.7 · §11 | org-units CRUD | ALIGNED |
| FR-XBOS-WF-01 | §14.8 · §12.3 | definitions POST/PUT | ALIGNED |
| FR-XBOS-WF-03 | §14.9 | instances POST | ALIGNED |
| FR-XBOS-WF-04 | §14.10 | tasks complete | ALIGNED |
| FR-XBOS-CAT-02 | §14.11 · M01-Catalog | workflows/start | ALIGNED |
| FR-XBOS-CAT-05 | §14.12 | tasks approve | ALIGNED |

---

## 4. Residual for Dev (P1 OpenAPI — no code this wave)

| ID | Gap | Suggested work_item |
|----|-----|---------------------|
| G-OA-02 | OpenAPI thiếu `POST /auth/select-membership` | `BE-XBOS-OA-SELECT-MEMBERSHIP-01` |
| G-OA-03 | OpenAPI thiếu legal documents + upload | `BE-XBOS-OA-LEGAL-DOCS-01` |
| G-OA-04 | OpenAPI thiếu shareholders | `BE-XBOS-OA-SHAREHOLDERS-01` |
| G-DTO-* | Components schemas | gộp OA-* |
| G-W2-* | Reject FR khách | BA W2 catalog |

Closed BA gaps: G-REF-01 · G-REF-02 (map) · G-REF-03 (CC P0 pointer) · G-REF-04 (ecosystem pointer).

---

## 5. completion_report

| | |
|--|--|
| **Closed** | 12/12 `ref_srs`; matrix đoạn TechSpec; CC P0 + ecosystem dual-ref; residual Dev backlog named; G-REF-01..04 |
| **Open** | OpenAPI sync G-OA-02..04 (execution); BA W2 leftover FR; optional TM convention sample; HTML khách XBOS |
| **Not claimed** | Phase1 DONE · PROD · 373 remaster · TechSpec “production locked” |

---

## 6. Handoff

| Field | Value |
|-------|--------|
| **next_owner** | `pm` |
| **ack_status** | `PASS_TO_PM` |
| **evidence_path** | `docs/qa/evidence/sa-xbos-techspec-ref-srs-01-20260722.md` |

### next_dispatch_prompt — TM (ưu tiên sample convention, song song OpenAPI optional)

```text
work_item_id: TM-XBOS-CODE-SPEC-CONVENTION-01
from_role: pm
to_role: technical-manager
lane: governance
priority: P2
entry_criteria: docs/xbos/TECHSPEC.md §14 W1 ref_srs PASS (SA-XBOS-TECHSPEC-REF-SRS-01); SRS_XBOS_KHACH.md v1.0-W1-SPINE
exit_criteria: Short coding-convention packet for XBOS (DTO/envelope/dates-money/scope/empty honesty) mirrored from HRM §15 pattern OR delta note «reuse HRM §15»; flag G-OA-02..04 as BE backlog; no apps/** rewrite; no Phase1/PROD claim
evidence_path: docs/qa/evidence/tm-xbos-code-spec-convention-01-YYYYMMDD.md
ack_status: PASS_TO_PM
cấm: wipe UF 🟢 · claim 373 · seed
```

### next_dispatch_prompt — BA W2 (catalog leftover, alternate)

```text
work_item_id: BA-XBOS-SRS-BATECO-W2-CATALOG-01
from_role: pm
to_role: ba-docs
lane: governance
priority: P2
entry_criteria: W1 spine 12 FR locked; inventory planned_W2 (RACI/RBAC/KPI/CAT leftover/WF reject)
exit_criteria: ADD-only FR batch W2 ≤15 OR inventory freeze W2 codes; no wipe W1 FR; no UF 🟢 wipe; note SA ref_srs follow-up
evidence_path: docs/qa/evidence/ba-xbos-srs-bateco-w2-catalog-01-YYYYMMDD.md
ack_status: PASS_TO_PM
cấm: remaster 373 · Phase1 claim · seed
```

### next_dispatch_prompt — BE OpenAPI P1 (execution, after TM or parallel)

```text
work_item_id: BE-XBOS-OA-SPINE-GAPS-01
from_role: pm
to_role: dev-be
lane: execution
priority: P1
entry_criteria: TECHSPEC §14.13 G-OA-02/03/04; runtime paths already exist (select-membership, shareholders, documents)
exit_criteria: OpenAPI xbos-api.yaml ADD paths + schemas; pnpm verify:openapi-m01 exit 0; no behavior change required; evidence lists operationIds
evidence_path: docs/qa/evidence/be-xbos-oa-spine-gaps-01-YYYYMMDD.md
ack_status: READY_FOR_QA
spec_ref: FR-XBOS-TENANT-01 · FR-XBOS-ORG-03 · FR-CC-P0-01
cấm: seed · wipe UF 🟢 · scope rewrite unrelated
```

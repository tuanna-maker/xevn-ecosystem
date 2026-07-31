# HRM ↔ XBOS Product Integrity Program (U39)

| Field | Value |
|-------|--------|
| **program_id** | `HRM-XBOS-INTEGRITY` |
| **trigger** | User 2026-06-07 — mock 1OFFICE incident + yêu cầu product hoàn chỉnh: dữ liệu khớp, nghiệp vụ thông nhau, scope tập đoàn vs công ty thành viên |
| **owner** | PM |
| **status** | **IN_PROGRESS** |
| **NOT** | Phase 1 DONE · PROD cutover |

---

## 1. Product intent (authoritative)

| Persona | Phạm vi dữ liệu | XBOS | HRM |
|---------|------------------|------|-----|
| **Chủ tịch / group CEO** (`ceo@xe.vn`, `group_ceo`, `tenantId=xevn`) | Xem **tất cả** đơn vị thành viên tập đoàn | `group-member-units`, org-foundation legal entities | Rollup list APIs (`resolveHrmListScope` → `GROUP_MEMBER_SLUGS`); UI filter theo công ty con |
| **CEO công ty thành viên** (`du-lich.ceo@xe.vn`, member tenant) | **Chỉ** công ty mình | Member tenant scope; 403 group APIs | `company_id=main` + `custom_fields.tenant_id=<member>` |
| **Nhân viên / manager** | Thu hẹp theo dept / báo cáo (Target G-FID) | position-rbac | Row filter trong cùng scope JWT |

**Cardinality rule:** Số **đơn vị thành viên** trên XBOS (`group-member-units` + legal entities có vai trò vận hành) phải **map 1:1** với partition HRM (`company_id` slug hoặc member tenant row) — không mock tên, không tenant fiction.

---

## 2. Known architecture (SoT)

- `docs/decisions/ADR-HRM-RBAC-SCOPE-LADDER.md`
- `docs/architecture/ADR-GROUP-CEO-MAIN-HOLDING-SCOPE.md`
- `docs/hrm/HRM_SEED_CARDINALITY_RULES.md` — `GROUP_MEMBER_SLUGS`
- `docs/hrm/HRM_DASHBOARD_DATA_QUALITY_RULES.md` — BR-DQ-01
- `apps/api/hrm-api/src/common/hrm-list-scope.ts`

---

## 3. Gap classes to close

| ID | Class | Symptom | Owner lane |
|----|-------|---------|------------|
| G-INT-01 | **FE mock ≠ API** | 1OFFICE, GPS HCM, skills radar fallback | dev-fe + QA grep |
| G-INT-02 | **Label join** | Chart hiển thị `Khác` thay tên công ty XBOS | dev-fe + dev-be enrich |
| G-INT-03 | **Cardinality drift** | XBOS N legal entities ≠ HRM N company_id partitions | dev-be seed + ba-data matrix |
| G-INT-04 | **Scope parity** | List rollup ≠ get-by-id scope | dev-be audit |
| G-INT-05 | **UI company switcher** | Group CEO không lọc theo từng ĐVTV trên mọi tab HRM | dev-fe |
| G-INT-06 | **Cross-module FK** | Tuyển dụng ↔ NV ↔ HĐ ↔ lương cùng `employee_id` / `company_id` | dev-be + QA journey |
| G-INT-07 | **SRS/BRD lag** | UC thiếu AC rollup + member-only | ba-process + ba-docs |
| G-INT-08 | **Stale embed bundle** | First iframe paint mock cũ | dev-fe cache bust |

---

## 4. Wave plan (sequential gates)

```text
W1 Governance baseline (SA + BA-P + BA-D) → integrity matrix + SRS/BRD delta
W2 Execution reconcile (dev-be cardinality script + scope parity fixes)
W3 FE integrity (mock sweep + company filter + chart label join)
W4 QA persona matrix (group CEO vs member CEO vs manager)
W5 QC GO/GWC on localhost U32
```

---

## 5. Active work items

| work_item_id | Role | Status |
|--------------|------|--------|
| P1-PROD-INT-SA-01 | SA | DISPATCHED |
| P1-PROD-INT-BA-P-01 | ba-process | DISPATCHED |
| P1-PROD-INT-BA-D-01 | ba-data | DISPATCHED |
| P1-PROD-INT-BE-01 | dev-be | DISPATCHED |
| P1-PROD-INT-QA-01 | qa | DISPATCHED |
| P1-PROD-INT-FE-01 | dev-fe | QUEUED after W1 |
| P1-PROD-INT-QC-01 | qc | QUEUED after W4 |

---

## 6. Evidence index (populate per wave)

| Wave | Path |
|------|------|
| W1 SA | `docs/program/governance/p1-prod-int-sa-01-20260607.md` |
| W1 BA-P | `docs/program/governance/p1-prod-int-ba-p-01-20260607.md` |
| W1 BA-D | `docs/program/governance/p1-prod-int-ba-d-01-20260607.md` |
| W2 BE | `docs/qa/evidence/p1-prod-int-be-01-20260607.md` |
| W4 QA | `docs/qa/evidence/p1-prod-int-qa-01-20260607.md` |

---

## 7. Exit criteria (program)

- [ ] Reconciliation script: XBOS member units ↔ HRM `company_id` counts **PASS** or documented seed gap with owner
- [ ] BR-DQ-01 extended to **all** HRM dashboard/chart widgets (grep gate)
- [ ] SRS delta: UC scope ladder + cardinality AC published
- [ ] Persona matrix: `ceo@xe.vn` rollup count ≥ sum member CEOs; member CEO 403 on group routes
- [ ] QC GO WITH CONDITIONS localhost — residual PROD/deploy separate

---

## 8. G-INT status (QC R3 — 2026-06-07)

**Gate:** `docs/qa/evidence/qc-p1-prod-int-gate-r3-20260607.md` — **GO WITH CONDITIONS (further reduced)** localhost U32 · **NOT** program exit · **NOT** PROD.

### CLOSED

| ID | Evidence |
|----|----------|
| G-INT-01 | QA-02 + PCOMP-W1-QC-02 + PCOMP-W2-QA-01 (mock P0 routes) |
| G-INT-03 Plane B | PCOMP-W3-BE-04 — `company_slug_map.display_name` ×5; `slug_map_bridge=PASS` |
| G-INT-04 | QA-02/03 + `verify:hrm:xbos-integrity` scope_parity 0 gaps |
| G-INT-07 | W1 governance delta |
| SA P0-1..P0-4 | PCOMP-W3-QA-03 live probes 15/15 |

### REMAINING

| ID | Owner | Note |
|----|-------|------|
| G-INT-02 | dev-fe + dev-be | Chart label join — Plane B names in DB; FE resolver open |
| G-INT-03 Plane A | sa (**CLOSED design** 2026-07-27) | 4 member LE + synthetic/holding ↔ 5 slugs **by design** (Option A) — `ADR-HRM-XBOS-PLANE-A-BRIDGE-4LE-5SLUG-20260727`; evidence `sa-g-int-03-plane-a-bridge-01-20260727.md`. PROD still gated by deploy/env elsewhere — not by open cardinality redesign. |
| G-INT-05 | dev-fe + qa | Browser company switcher E2E |
| G-INT-06 | dev-be + qa | J-HRM-INT-03/04 + full L2.5 journeys |
| G-INT-08 | dev-fe + qa | Stale CC embed iframe |

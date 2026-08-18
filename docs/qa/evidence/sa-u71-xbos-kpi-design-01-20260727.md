# SA-U71-XBOS-KPI-DESIGN-01 — Physical DB_DESIGN + API_DESIGN (F.1)

| Field | Value |
|-------|--------|
| **work_item_id** | `SA-U71-XBOS-KPI-DESIGN-01` |
| **lane** | governance · U71 P2 |
| **date** | 2026-07-27 |
| **change_mode** | ADD · preserve_default |
| **forbidden** | `apps/**` (not touched) |
| **ack_status** | **PASS_TO_PM** |

---

## 1. Spec read ack

| Layer | Path · section |
|-------|----------------|
| Gap scan | `docs/qa/evidence/sa-u71-spec-gap-scan-01-20260727.md` — XBOS KPI rollup **P2** |
| TechSpec | `docs/xbos/TECHSPEC.md` **§12.2** · **§14.17 FR-XBOS-KPI-03** |
| SRS khách | `SRS_XBOS_KHACH.md` **§3.16** Diễn biến #1–7 · Kết quả trả về (no mandatory write) |
| Data cite | `docs/xbos/S1_BA_DATA_MD01-08.md` §6.4 `kpi_metrics` |
| OpenAPI | `docs/api/openapi/xbos-api.yaml` — `kpiEngineRollup` (+ evaluate / portal-alerts) |
| must_keep | RACI · Workflow · Catalog-gov U71 pairs · UF-XBOS-10 🟢 · FR-ECO-SCOPE-02 · U65 |
| Gate | `.cursor/rules/spec-db-api-design-gate.mdc` · OS `13` §3.4.11.F/F.1 |
| Runtime truth | `KpiEngineController` · `KpiEngineService` · `resolveKpiRollupScopeContext` · migration `20260517_kpi_actuals_portal_alerts.sql` |

---

## 2. Deliverables

| Artifact | Path | Status |
|----------|------|--------|
| DB_DESIGN | `docs/xbos/DB_DESIGN_XBOS_KPI.md` | **ADD** — `xbos_kpi_actuals` · `xbos_portal_alerts` · soft cite `kpi_metrics` |
| API_DESIGN | `docs/xbos/API_DESIGN_XBOS_KPI.md` | **ADD** — Endpoints A–E F.1 |
| Pointers | `docs/tech-spec/DB_DESIGN_XBOS_KPI.md` · `API_DESIGN_XBOS_KPI.md` | **ADD** thin |
| Index | `docs/tech-spec/README.md` §2 + §3 + §5 | **Promoted** · count **15** pairs |
| TechSpec pointer | `docs/xbos/TECHSPEC.md` §14.17 | **ADD** U71 physical links + G-DTO-W2-KPI-01 residual |

### F.1 checklist (API)

| Endpoint | Mục đích | Nghiệp vụ | Bước SRS | DTO↔DB | Errors |
|----------|----------|-----------|----------|--------|--------|
| POST `…/kpi-engine/evaluate` | ✅ | ✅ | UC-KPI-01 | ✅ computed (+ alert) | KPI-200 · VAL-003 |
| POST `…/kpi-engine/evaluate-batch` | ✅ | ✅ | UC-KPI-02 | ✅ | KPI-201 |
| GET `…/kpi-engine/rollup` | ✅ | ✅ | **FR-KPI-03 #1–7** · UF-10 | ✅ actuals | KPI-202 · 409 |
| GET `…/kpi-engine/portal-alerts` | ✅ | ✅ | UC-KPI-04 list | ✅ alerts | KPI-203 |
| POST `…/kpi-engine/portal-alerts` | ✅ | ✅ | UC-KPI-04 publish | ✅ | KPI-204 |

---

## 3. Architecture notes (facts)

- Primary FR = **GET rollup** read-only; success does **not** require inserting actuals (SRS Kết quả trả về).
- Group mode: `companyId` ∈ {`holding`,`all`} → SUM/AVG across `GROUP_ROLLUP_COMPANY_IDS`; single slug = exact filter.
- Scope: `resolveKpiRollupScopeContext` — group CEO JWT `main` may query `holding`; member mismatch → 409.
- Evaluate/batch = pure math; optional alert write to `xbos_portal_alerts` only.
- `kpi_metrics` definitions remain business-master soft cite (RACI/BM DDL SoT).
- **must_keep:** RACI/WF/catalog-gov pairs untouched; UF-10 🟢; U65 zero-seed.

---

## 4. Residual

| Item | Owner | Priority |
|------|-------|----------|
| OpenAPI components schema depth for rollup `series` | `BE-XBOS-OA-KPI-ROLLUP-DTO-01` · `dev-be` | P2 G-DTO-W2-KPI-01 |
| Future actuals upsert / ingest API (if product needs FE mutate) | BA/SA when CR | P3 |
| Next U71 P2 | Auth + tenant-scope | `SA-U71-XBOS-AUTH-TENANT-DESIGN-01` |
| OpenAPI RACI/CC (prior residual) | still execution | G-OA-W2-RACI-01 / CC-CAT-01 |

---

## 5. Handoff

### completion_report

**Closed:** U71 P2 physical F.1 pair for XBOS KPI — `DB_DESIGN_XBOS_KPI.md` + `API_DESIGN_XBOS_KPI.md` with Mục đích · Nghiệp vụ · bước SRS (FR-XBOS-KPI-03 Diễn biến #1–7 + supporting KPI-01/02/04) · DTO↔DB · errors; must_keep RACI/WF/catalog-gov; tech-spec thin pointers + README §2 promote (15 pairs); TechSpec §14.17 pointer; no `apps/**`.

**Residual:** OpenAPI rollup DTO depth P2; Auth-tenant P2 backlog; prior RACI/CC OpenAPI execution residuals unchanged.

### next_owner

`pm`

### next_dispatch_prompt

```text
work_item_id: SA-U71-XBOS-AUTH-TENANT-DESIGN-01
role: sa
lane: governance · U71 P2
change_mode: ADD · forbidden apps/**
read_first:
  - docs/tech-spec/README.md §3 backlog
  - docs/xbos/TECHSPEC.md §14.1–14.3 FR-XBOS-AUTH-01 · FR-XBOS-TENANT-01 · FR-ECO-SCOPE-02
  - docs/qa/evidence/sa-u71-spec-gap-scan-01-20260727.md — Auth + tenant-scope P2
  - .cursor/rules/spec-db-api-design-gate.mdc
  - must_keep: RACI/workflow/catalog-gov/KPI pairs (do not wipe)
deliver:
  - docs/xbos/DB_DESIGN_XBOS_AUTH_TENANT.md
  - docs/xbos/API_DESIGN_XBOS_AUTH_TENANT.md — F.1 each endpoint (login / accessible / select-membership)
  - Promote tech-spec README §2 + thin pointers
exit_criteria: F.1 pair; PASS_TO_PM
evidence_path: docs/qa/evidence/sa-u71-xbos-auth-tenant-design-01-20260727.md

Optional parallel (execution residual only — not U71 write):
  BE-XBOS-OA-KPI-ROLLUP-DTO-01 — deepen OpenAPI components for rollup series (read API_DESIGN_XBOS_KPI Endpoint C)
```

### ack_status

**PASS_TO_PM**

### evidence_path

`docs/qa/evidence/sa-u71-xbos-kpi-design-01-20260727.md`

### pm_dispatch_hint

`SA-U71-XBOS-AUTH-TENANT-DESIGN-01` — next P2 physical write; optional `BE-XBOS-OA-KPI-ROLLUP-DTO-01` when execution opens.

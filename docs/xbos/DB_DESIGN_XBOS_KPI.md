# DB_DESIGN — XBOS KPI engine (actuals · rollup · portal alerts)

| Field | Value |
|-------|--------|
| **work_item_id** | `SA-U71-XBOS-KPI-DESIGN-01` |
| **change_mode** | ADD · preserve_default |
| **ref_srs** | Khách `docs/client-delivery/xbos/SRS_XBOS_KHACH.md` **§3.16 FR-XBOS-KPI-03** Diễn biến #1–7 · team UC-XBOS-KPI-03 · **UF-XBOS-10** · supporting UC-XBOS-KPI-01/02/04 (evaluate / batch / portal-alerts) |
| **ref_techspec** | `docs/xbos/TECHSPEC.md` **§12.2** · **§14.17** FR-XBOS-KPI-03 · §5 M01-KPI · OpenAPI `kpiEngineRollup` |
| **ref_data** | `docs/xbos/S1_BA_DATA_MD01-08.md` §6.4 `kpi_metrics` (definition SoT cite) |
| **ref_api** | `docs/xbos/API_DESIGN_XBOS_KPI.md` |
| **must_keep_pairs** | `docs/xbos/DB_DESIGN_XBOS_RACI_RBAC.md` · `DB_DESIGN_XBOS_WORKFLOW.md` · `DB_DESIGN_XBOS_CATALOG_GOV.md` (**cấm** đè / rewrite) |
| **Template** | `_vibe-team-os/templates/TECHSPEC_PHYSICAL_DB_TABLE.md` |
| **U71** | Physical DB slice for KPI rollup before any future Dev DTO deepen |
| **Date** | 2026-07-27 |
| **Owner service** | XBOS (`xbos-api` · `KpiEngineService` · `KpiEngineController`) |
| **Runtime DDL** | Migration `apps/api/xbos-api/migrations/20260517_kpi_actuals_portal_alerts.sql` · `ensureKpiActualsSchema` / `ensurePortalAlertsSchema` |

> **Scope:** (A) time-series actuals for rollup, (B) portal alerts rail, (C) soft cite `kpi_metrics` definitions in business-master.  
> **Out of scope:** RACI matrix · WF engine redefine · catalog-gov L0 publish · org-legal / shareholders.  
> **must_keep:** UF-XBOS-10 🟢 · FR-ECO-SCOPE-02 · RACI/WF/catalog-gov pairs · U65 zero-seed (empty series hợp lệ).

---

## 1. Ownership & plane (normative)

```text
Command Center KPI rail / dashboard FE
        │
        │ GET  …/kpi-engine/rollup          → read xbos_kpi_actuals (SUM/AVG when group)
        │ POST …/kpi-engine/evaluate*       → pure math (+ optional alert write)
        │ GET/POST …/kpi-engine/portal-alerts → xbos_portal_alerts
        │ GET  …/business-master/kpi_metrics  → defs (cite only; RACI pack owns table DDL)
        ▼
xbos-api  tenant_id TEXT · company_id TEXT slug
        │
        └── Group rollup companyId ∈ {holding, all}
              → companyIds = GROUP_ROLLUP_COMPANY_IDS (holding, main, members…)
```

| Subsystem | Owner | Tables (this file) | Plane key |
|-----------|-------|--------------------|-----------|
| **Actuals / rollup** | `kpi-engine` | `xbos_kpi_actuals` | `(tenant_id, company_id, metric_code, period_date)` TEXT company |
| **Portal alerts** | `kpi-engine` | `xbos_portal_alerts` | `tenant_id` (+ optional `company_id`) |
| **Metric definitions** | `business-master` | `xbos_business_master_entries` domain=`kpi_metrics` | **Cite only** — DDL SoT in RACI/BM pack |

**Reject:** Using LE UUID as `company_id` partition for actuals.  
**Reject:** Seed `xbos_kpi_actuals` / alerts to pass UF-XBOS-10 (U65).  
**Reject:** Treating evaluate math as a persisted row requirement for FR-KPI-03 success (SRS: không bắt buộc tạo bản ghi mới).

---

## 2. `public.xbos_kpi_actuals` (rollup SoT)

| Column | Type | Null | Meaning (VI) | `ref_srs` |
|--------|------|------|--------------|-----------|
| `tenant_id` | TEXT | NO | Partition tenant (vd. `xevn`) | Scope · FR #2 |
| `company_id` | TEXT | NO | Slug đơn vị (`holding` / `main` / member) — **không** LE UUID | FR #2/#3/#4 |
| `metric_code` | TEXT | NO | Mã chỉ số (khớp `kpi_metrics.code` khi có định nghĩa) | FR #7 khóa bộ chỉ số |
| `period_date` | DATE | NO | Kỳ điểm (ngày bucket) | FR lọc kỳ |
| `actual_value` | NUMERIC | NO | Giá trị thực tế; default 0 | Rollup series |
| `target_value` | NUMERIC | YES | Mục tiêu kỳ (AVG khi group rollup) | Evaluate / band |
| `created_at` | TIMESTAMPTZ | NO | Audit | — |
| `updated_at` | TIMESTAMPTZ | NO | Audit | — |

**PK:** `(tenant_id, company_id, metric_code, period_date)`.  
**Index:** `idx_xbos_kpi_actuals_scope (tenant_id, company_id, period_date DESC)`.

### 2.1 Rollup read semantics (normative)

| `companyId` query (sau scope) | Mode | SQL behavior |
|-------------------------------|------|--------------|
| `holding` hoặc `all` (group) | `rollupMode=group` | `WHERE company_id = ANY(GROUP_ROLLUP_COMPANY_IDS)` · `SUM(actual_value)` · `AVG(target_value)` · `GROUP BY metric_code, period_date` |
| Single slug (vd. `xe-du-lich`, `main`) | `rollupMode=single` | Filter exact `company_id`; no aggregate across members |

**Default window** (khi thiếu `from`/`to`): `from = today−180d`, `to = today` (ISO date).  
**Empty:** zero rows → `series: []` — **hợp lệ** (Diễn biến #5).

### 2.2 Writers (physical note)

| Path | Writes actuals? |
|------|-----------------|
| `GET rollup` | **No** — ensure schema only |
| `POST evaluate` / `evaluate-batch` | **No** — pure function on body numbers |
| Ingest / ops / future upsert | Out of this U71 slice — residual if product needs FE mutate actuals |

---

## 3. `public.xbos_portal_alerts` (KPI-04 + CC rail)

| Column | Type | Null | Meaning (VI) | `ref_srs` |
|--------|------|------|--------------|-----------|
| `id` | UUID PK | NO | Surrogate | UC-XBOS-KPI-04 |
| `tenant_id` | TEXT | NO | Partition | Scope |
| `company_id` | TEXT | YES | Slug; NULL = tenant-wide | Scope filter |
| `module_code` | TEXT | NO | Default `system`; KPI emit dùng `kpi-engine` | Rail filter |
| `level` | TEXT | NO | `info` \| `warning` \| `critical` | Band |
| `title` | TEXT | NO | Tiêu đề rail | FE |
| `detail` | TEXT | YES | Chi tiết (score/actual/target) | Debug / FE |
| `source_system` | TEXT | NO | Default `xbos` | Trace |
| `source_id` | TEXT | YES | vd. `{metricCode}:{band}` | Dedupe hint |
| `created_at` | TIMESTAMPTZ | NO | Sort DESC | List |
| `dismissed_at` | TIMESTAMPTZ | YES | Soft dismiss; list chỉ `IS NULL` | UX |

**Index:** `idx_xbos_portal_alerts_tenant (tenant_id, created_at DESC)`.

**Emit rule:** `emitKpiBandAlert` only when evaluate band ∈ {`warning`,`critical`} and caller set `emitPortalAlert(s)`.

---

## 4. Soft cite — `kpi_metrics` definitions

| Aspect | Contract |
|--------|----------|
| Table | `public.xbos_business_master_entries` |
| Partition | `domain = 'kpi_metrics'` |
| Plane | `(tenant_id, company_id, domain, item_id)` TEXT |
| Payload fields (logical) | `code`, `name`, `unit`, `category`, `targetValue`, `warningThreshold`, `criticalThreshold`, `applicableCompanies[]`, optional `currentValue` |
| DDL SoT | Existing business-master / RACI pack — **this file does not redefine columns** |
| Relation to actuals | Soft: `xbos_kpi_actuals.metric_code` ↔ `payload.code` / item id — **no hard FK** |

---

## 5. Scope & dual-plane invariants

| Rule | Detail |
|------|--------|
| Rollup resolver | `resolveKpiRollupScopeContext` — same gate for query `companyId` vs JWT (parity list/read) |
| Group CEO exception | JWT `main` + role group_* may request `companyId=holding` → service rolls up `GROUP_ROLLUP_COMPANY_IDS` |
| Member | Outside privilege → **409** `SCOPE_CONTEXT_MISMATCH` — FE ẩn rollup tập đoàn (FR #3/#4) |
| Plane | Operating / holding **TEXT slug** — cấm LE UUID as actuals key |
| must_keep ECO | FR-ECO-SCOPE-02 — không đè bằng mock số |

---

## 6. Indexes & constraints summary

| Object | Definition |
|--------|------------|
| PK actuals | `(tenant_id, company_id, metric_code, period_date)` |
| idx actuals scope | `(tenant_id, company_id, period_date DESC)` |
| PK alerts | `id` UUID |
| idx alerts tenant | `(tenant_id, created_at DESC)` |

---

## 7. Non-goals / must_keep

- **must_keep:** `DB_DESIGN_XBOS_RACI_RBAC` · `DB_DESIGN_XBOS_WORKFLOW` · `DB_DESIGN_XBOS_CATALOG_GOV` — không sửa nội dung.
- **must_keep:** UF-XBOS-10 🟢 AC (empty trung thực; scope 409).
- **Cấm:** Seed actuals/alerts for QA evidence.
- **Cấm:** Invent dashboard aggregation table (`reporting/dashboard`) in this slice — TechSpec §12.2 Option A = future / out-of-scope.
- **Residual:** OpenAPI DTO depth for rollup response schema (P2) — runtime ALIGNED; physical F.1 closes U71 gap.

---

## 8. Traceability

| Artifact | Path |
|----------|------|
| API_DESIGN | `docs/xbos/API_DESIGN_XBOS_KPI.md` |
| TechSpec | `docs/xbos/TECHSPEC.md` §14.17 |
| OpenAPI | `docs/api/openapi/xbos-api.yaml` — `kpiEngineRollup` (+ evaluate / portal-alerts) |
| Migration | `apps/api/xbos-api/migrations/20260517_kpi_actuals_portal_alerts.sql` |
| Evidence | `docs/qa/evidence/sa-u71-xbos-kpi-design-01-20260727.md` |

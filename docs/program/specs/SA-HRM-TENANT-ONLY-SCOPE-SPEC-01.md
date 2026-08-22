# SA-HRM-TENANT-ONLY-SCOPE-SPEC-01 — Bỏ OU, partition & phân quyền theo `tenant_id`

| Field | Value |
|-------|--------|
| **work_item_id** | `SA-HRM-TENANT-ONLY-SCOPE-01` |
| **lane** | governance · sa |
| **change_mode** | **SPEC ONLY** — **NO production behavior change** until Phase 1 merge |
| **date** | 2026-08-22 |
| **status** | **CONFIRMED** (sponsor 2026-08-22) |
| **ref_adr** | [`ADR-HRM-TENANT-ONLY-SCOPE-20260822.md`](../../architecture/ADR-HRM-TENANT-ONLY-SCOPE-20260822.md) |
| **ref_adr_keep** | [`ADR-HRM-RBAC-SCOPE-LADDER.md`](../../decisions/ADR-HRM-RBAC-SCOPE-LADDER.md) · [`ADR-GROUP-CEO-MAIN-HOLDING-SCOPE.md`](../../architecture/ADR-GROUP-CEO-MAIN-HOLDING-SCOPE.md) (catalog/KPI `main`↔`holding` only) |
| **ref_matrix** | [`PILOT_SCOPE_DATA_MATRIX.md`](../../qa/PILOT_SCOPE_DATA_MATRIX.md) |
| **honesty** | U65 zero-seed path unchanged · no invent rollup counts |
| **must_keep** | JWT `companyId=main` · 409 `SCOPE_CONTEXT_MISMATCH` default · member CEO 403 on group-only APIs |
| **ack_status** | PASS_TO_PM |

---

## 0. Objective

Thay plane partition HRM từ **OU slug trong `tenant_id=xevn`** sang **`tenant_id` registry** làm SoT duy nhất cho:

- Load dữ liệu (list/get/aggregate)
- Phân quyền API scope
- Filter UI (thay OU dropdown bằng tenant switcher)
- Group CEO rollup (multi-tenant, không OU)

**Không** thay đổi trong SPEC này: XBOS org legal `company_id=holding`, KPI rollup alias, catalog `main`→`holding` persist.

---

## 1. Scope boundary

### 1.1 In scope

| Layer | Path pattern |
|-------|----------------|
| HRM BE scope engine | `apps/api/hrm-api/src/common/hrm-list-scope.ts` · `scope-context.ts` |
| HRM list services | employees · attendance · payroll · recruitment · settings-catalogs · operations · metadata · decisions · performance |
| HRM FE OU filter | `apps/web/hrm/src/contexts/HrmOperatingUnitFilterContext.tsx` · `lib/hrmOperatingUnits.ts` |
| Portal tenant filter | `apps/web/web-portal/src/contexts/GlobalFilterContext.tsx` |
| Cockpit modules | `ExecutiveDashboardPage.tsx` — wire `tenant.modules` (Phase 3) |
| Migrate scripts | `scripts/migrate/tenant-only-scope/**` |
| QA matrix | `docs/qa/PILOT_SCOPE_DATA_MATRIX.md` |

### 1.2 Out of scope (defer)

| Item | Reason |
|------|--------|
| Deprecate Plane B′ `HRM_COMPANY_UUID_BY_SLUG` | Orthogonal — Phase 5+ |
| XBOS workflow-engine scope | Separate WI |
| Logistics app partition | Chỉ HRM + portal cockpit |
| Re-key all catalog seeds `holding`→`main` | ADR-GROUP-CEO non-goal |

### 1.3 Forbidden until Phase 5

- Xóa `HRM_GROUP_MEMBER_COMPANY_SLUGS` khi feature flag chưa 100% tenant trong PROD pilot
- Silent remap OU→tenant trong `resolveScopeContext` global (chỉ trong `resolveHrmListScope` có test)

---

## 2. Target contract

### 2.1 Scope resolution (normative)

```typescript
// Target shape — implement Phase 1
type HrmListScope = {
  tenantIds: string[];
  companyIds: ['main']; // always literal main for operational HRM after migrate
  legacyOuMode?: boolean; // feature flag bridge only
};

// Group CEO (tenantId=xevn, role group_ceo|group_*, companyId=main)
tenantIds = GROUP_ROLLUP_TENANT_IDS; // from registry or constant pilot list
companyIds = ['main'];

// Member CEO (tenantId=visun, companyId=main)
tenantIds = [jwt.tenantId];
companyIds = ['main'];

// Group CEO narrow filter (replaces OU=trsport)
// Query ?tenant_id=xe-tmdv (NEW) — NOT ?company_id=trsport
tenantIds = [requestedTenantId];
companyIds = ['main'];
```

**Pilot `GROUP_ROLLUP_TENANT_IDS` (until dynamic registry hook):**

`['xevn', 'visun', 'xe-tmdv', 'xe-du-lich', 'xe-vietnam']`

### 2.2 SQL filter (employees exemplar)

```sql
-- After migrate + flag ON
WHERE NULLIF(TRIM(custom_fields->>'tenant_id'), '') = ANY($1::text[])
  AND company_id = 'main'

-- Group rollup: $1 = ARRAY['xevn','visun',...]
-- Member:       $1 = ARRAY['visun']
```

### 2.3 Feature flag

| Env | Key | Default | Behavior |
|-----|-----|---------|----------|
| hrm-api | `HRM_TENANT_ONLY_SCOPE` | `false` | `true` → tenant-only resolver; `false` → legacy OU rollup |

Bridge (flag `false` + member tenant): optional read legacy OU partition via mapping table — **Phase 1b** nếu migrate chưa xong.

### 2.4 Legacy OU mapping (migrate + bridge)

| `legacy_ou_slug` | `target_tenant_id` | `legal_entity_code` (seed) |
|------------------|-------------------|------------------------------|
| `holding` | `xevn` | `XEVN-HOLDING` |
| `trsport` | `xe-tmdv` | `XE_TMDV` |
| `logistics` | `visun` | `VISUN` |
| `finance` | `xe-du-lich` | `XE-DL` |
| `services` | `xe-vietnam` | `XE-VN` |

Script SoT: `scripts/migrate/tenant-only-scope/ou-to-tenant-map.json`

---

## 3. Business rules

| ID | Rule |
|----|------|
| **BR-TOS-00** | Sau ack SPEC: **cấm** tạo row HRM mới với `company_id` ∈ OU slug set |
| **BR-TOS-01** | Mọi API list HRM operational phải filter `tenant_id` khi flag ON |
| **BR-TOS-02** | Member CEO: `tenantIds.length === 1` và === JWT `tenantId` |
| **BR-TOS-03** | Group CEO rollup: `tenantIds` = active member tenants + master; **không** leak tenant ngoài membership |
| **BR-TOS-04** | `company_id` operational luôn `main` sau migrate (trừ XBOS catalog `holding` path) |
| **BR-TOS-05** | Request `?company_id=trsport` sau Phase 5 → **400** `HRM-SCOPE-DEPRECATED-OU` hoặc map 1 release bridge |
| **BR-TOS-06** | Cockpit module visibility = `membership ∩ tenant.modules`; không OU |
| **BR-TOS-07** | `resolveHrmSettingsCatalogCompanyId` **giữ** `main`→`holding` cho group catalog (ADR-GROUP-CEO) |

---

## 4. Five-phase delivery

### Phase 0 — Chuẩn bị (1–2 ngày)

| Task | Owner | Deliverable |
|------|-------|-------------|
| P0-1 | SA | `scripts/migrate/tenant-only-scope/ou-to-tenant-map.json` |
| P0-2 | SA | `scripts/migrate/tenant-only-scope/README.md` |
| P0-3 | PM | Announce BR-TOS-00 freeze |
| P0-4 | QA | Snapshot counts per OU + per tenant (baseline evidence) |

**Exit:** Baseline CSV `employee_count_by_ou.csv` + `employee_count_by_tenant.csv`

---

### Phase 1 — Scope engine BE (2–3 ngày) — **blocking**

| Task | File | Change |
|------|------|--------|
| P1-1 | `hrm-list-scope.ts` | Add `tenantIds` to `HrmListScope`; `resolveHrmTenantScope()` |
| P1-2 | `hrm-list-scope.ts` | `pushEmployeeListScopeFilters` → tenant_id ANY |
| P1-3 | `hrm-list-scope.ts` | Group narrow: `?tenant_id=` not `?company_id=ou` |
| P1-4 | `scope-context.ts` | Deprecate `isGroupCeoMemberSlugNarrowFilter` when flag ON |
| P1-5 | All services using `masterTenantPartition` | Switch to `tenantIds` |
| P1-6 | `hrm-list-scope.spec.ts` | New tenant-only cases + flag matrix |

**WI dispatch:** `HRM-TENANT-ONLY-SCOPE-BE-01`

**must_keep:** Flag OFF = identical legacy behavior (regression suite green)

**Exit:** Jest PASS · `ceo2@xe.vn` employees > 0 (with bridge or post-P2 data)

---

### Phase 2 — Schema + backfill (1–2 ngày)

#### 2.1 Tables — tenant column status

| Table / area | `tenant_id` today | Action |
|--------------|-------------------|--------|
| `employees` (`custom_fields`) | Partial | Backfill + enforce |
| `settings_catalogs` | Yes | Re-key partition |
| `attendance_*` | Via employee join | Verify join uses tenant |
| `payroll_periods` | **Missing** | `ALTER ADD tenant_id TEXT` |
| `recruitment_*` | **Missing** | ADD + backfill |
| `decisions` | **Missing** | ADD + backfill |
| `departments` | **Missing** | ADD + backfill |
| `performance_*` | Partial | Audit per service |

#### 2.2 Exemplar migrate SQL

```sql
-- employees: logistics → visun
UPDATE employees
SET
  custom_fields = jsonb_set(COALESCE(custom_fields, '{}'::jsonb), '{tenant_id}', '"visun"'),
  company_id = 'main',
  updated_at = NOW()
WHERE company_id = 'logistics'
  AND COALESCE(NULLIF(TRIM(custom_fields->>'tenant_id'), ''), 'xevn') = 'xevn';

-- holding → xevn/main
UPDATE employees
SET
  custom_fields = jsonb_set(COALESCE(custom_fields, '{}'::jsonb), '{tenant_id}', '"xevn"'),
  company_id = 'main',
  updated_at = NOW()
WHERE company_id = 'holding';
```

**WI dispatch:** `HRM-TENANT-ONLY-SCOPE-MIGRATE-01`

**Exit:** Sum(backfilled) = baseline OU counts · zero rows with OU slug + flag test ON

---

### Phase 3 — FE bỏ OU filter (2–3 ngày)

| Task | File | Change |
|------|------|--------|
| P3-1 | `HrmOperatingUnitFilterContext.tsx` | Deprecate → tenant scope from portal |
| P3-2 | `CompanyManagement.tsx` | `group-member-units` not `operating-units` |
| P3-3 | `hrmCompanyEmployeeCount.ts` | Remove OU name→slug map |
| P3-4 | `ExecutiveDashboardPage.tsx` | Dynamic modules from `tenant.modules` |
| P3-5 | `GlobalFilterContext.tsx` | Group CEO narrow = tenant pick |

**WI dispatch:** `HRM-TENANT-ONLY-SCOPE-FE-01`

**Exit:** No `fetchHrmOperatingUnits` on critical paths · E2E Visun company page

---

### Phase 4 — Rollup APIs (1–2 ngày)

| API | Change |
|-----|--------|
| `GET /employees/summary` | `by_tenant: Record<tenantId, count>` |
| KPI rollup (xbos) | Accept `tenantId` param; group = multi-tenant |
| `group-member-units` | Unchanged (already tenant-centric) |

**WI dispatch:** `HRM-TENANT-ONLY-SCOPE-ROLLUP-01`

---

### Phase 5 — Legacy cleanup

| Task | Action |
|------|--------|
| P5-1 | Deprecate `GET /api/hrm/operating-units` |
| P5-2 | Remove `HRM_GROUP_MEMBER_COMPANY_SLUGS` exports (or throw if flag ON + slug used) |
| P5-3 | Delete `company_slug_map` OU rows (after backup) |
| P5-4 | Update ADR cross-links · PILOT_SCOPE_DATA_MATRIX |
| P5-5 | Remove feature flag default `false` → `true` |

**Exit:** QC persona matrix full PASS · no OU references in grep `apps/api/hrm-api`

---

## 5. Acceptance criteria

| ID | Given | When | Then |
|----|-------|------|------|
| **AC-TOS-01** | `ceo2@xe.vn` visun membership | `GET /employees?company_id=main` flag ON | `total ≥ 1` (Visun workforce) |
| **AC-TOS-02** | `ceo@xe.vn` group_ceo | `GET /employees?company_id=main` flag ON | `total ≥` baseline rollup |
| **AC-TOS-03** | `ceo2@xe.vn` | `GET /operating-units` | `[]` or 404 deprecated |
| **AC-TOS-04** | `ceo2@xe.vn` | `GET /tenant-scope/group-member-units` | 403 |
| **AC-TOS-05** | Group CEO | Filter tenant `visun` | Only visun rows |
| **AC-TOS-06** | Flag OFF | Any legacy test suite | PASS unchanged |
| **AC-TOS-07** | Post migrate | No new rows `company_id IN (OU set)` | BR-TOS-00 |
| **AC-TOS-08** | `/cockpit` | User modules `['hrm']` only | HRM card visible; logistics hidden |

---

## 6. Implementation references (current → target)

| Helper | Current | Target |
|--------|---------|--------|
| `resolveHrmListScope` | `companyIds=GROUP_MEMBER_SLUGS` | `tenantIds=GROUP_ROLLUP_TENANT_IDS` |
| `pushEmployeeListScopeFilters` | `company_id ANY` + `tenant_id=xevn` | `tenant_id ANY` + `company_id=main` |
| `operating-units.service` | List 5 OU | Deprecated |
| `HrmOperatingUnitFilterContext` | `?company_id=trsport` | `?tenant_id=xe-tmdv` via portal |
| `resolveHrmSettingsCatalogCompanyId` | **Unchanged** | `main`→`holding` catalog |

---

## 7. Risk register

| ID | Risk | Phase | Mitigation |
|----|------|-------|------------|
| R-TOS-01 | Group CEO empty after migrate | 2 | Rollup before OU data move; verify counts |
| R-TOS-02 | Payroll holding rows | 2 | `payroll.service.ts` audit · map holding→xevn |
| R-TOS-03 | Mobile `company_uuid` | 4 | UUID map per tenant not OU |
| R-TOS-04 | 50+ OU specs fail | 1 | Dual-mode tests flag on/off |
| R-TOS-05 | Downtime | 2 | Off-hours migrate · flag bridge |

---

## 8. WI dispatch summary

| work_item_id | Lane | Phase | Estimate |
|--------------|------|-------|----------|
| `HRM-TENANT-ONLY-SCOPE-BE-01` | dev-be | 1 | 2–3d |
| `HRM-TENANT-ONLY-SCOPE-MIGRATE-01` | dev-be / ops | 2 | 1–2d |
| `HRM-TENANT-ONLY-SCOPE-FE-01` | dev-fe | 3 | 2–3d |
| `HRM-TENANT-ONLY-SCOPE-ROLLUP-01` | dev-be | 4 | 1–2d |
| `HRM-TENANT-ONLY-SCOPE-CLEANUP-01` | dev-be/fe | 5 | 1d |
| `HRM-TENANT-ONLY-SCOPE-QA-01` | qa | 1–5 | parallel |

**read_first (all lanes):** This SPEC · ADR-HRM-TENANT-ONLY-SCOPE · ADR-HRM-RBAC-SCOPE-LADDER §3–§4

**allowed_paths:** per WI — scope engine, migrate scripts, FE contexts listed §1.1

**forbidden_paths:** Global `resolveScopeContext` relax · JWT `companyId=holding` for HRM embed

---

## 9. CODE-MEMORY governance

Mọi file touched khi implement **phải** APPEND:

```text
@CODE-MEMORY-CHANGE YYYY-MM-DD
WorkItem: HRM-TENANT-ONLY-SCOPE-<lane>-01
change_mode: FIX|ADD|DEPRECATE
What: <1–2 dòng>
Why: ADR-HRM-TENANT-ONLY-SCOPE · SA-HRM-TENANT-ONLY-SCOPE-SPEC-01 §<phase>
must_keep: <regression anchors>
```

Files pre-stamped **2026-08-22** (SPEC ack): `hrm-list-scope.ts`, `scope-context.ts`, `operating-units.service.ts`, `HrmOperatingUnitFilterContext.tsx`.

---

## 10. Handoff

| Field | Value |
|-------|--------|
| **from_role** | sa |
| **to_role** | pm |
| **entry_criteria** | Sponsor decision 2026-08-22 |
| **exit_criteria** | PM assigns `HRM-TENANT-ONLY-SCOPE-BE-01` |
| **evidence_path** | `docs/qa/evidence/sa-hrm-tenant-only-scope-01-20260822.md` (QA creates on Phase 1) |
| **ack_status** | PASS_TO_PM |

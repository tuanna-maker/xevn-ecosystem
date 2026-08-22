# ADR: HRM scope — bỏ OU partition, chỉ dùng `tenant_id`

| Field | Value |
|-------|--------|
| **ADR-ID** | ADR-HRM-TENANT-ONLY-SCOPE |
| **work_item_id** | `SA-HRM-TENANT-ONLY-SCOPE-01` |
| **Status** | **Accepted** (sponsor 2026-08-22) |
| **Date** | 2026-08-22 |
| **Decision owner** | SA |
| **Supersedes (partial)** | [`ADR-GROUP-CEO-MAIN-HOLDING-SCOPE.md`](./ADR-GROUP-CEO-MAIN-HOLDING-SCOPE.md) §4 HRM list rollup qua `GROUP_MEMBER_SLUGS` · [`ADR-HRM-XBOS-PLANE-A-BRIDGE-4LE-5SLUG-20260727.md`](./ADR-HRM-XBOS-PLANE-A-BRIDGE-4LE-5SLUG-20260727.md) workforce partition by OU slug |
| **Related ADRs** | [`ADR-HRM-RBAC-SCOPE-LADDER.md`](../decisions/ADR-HRM-RBAC-SCOPE-LADDER.md) · [`ADR-GROUP-CEO-MAIN-HOLDING-SCOPE.md`](./ADR-GROUP-CEO-MAIN-HOLDING-SCOPE.md) (JWT `main`↔`holding` catalog/KPI giữ nguyên) |
| **Implementation SPEC** | [`SA-HRM-TENANT-ONLY-SCOPE-SPEC-01.md`](../program/specs/SA-HRM-TENANT-ONLY-SCOPE-SPEC-01.md) |
| **Evidence (planned)** | `docs/qa/evidence/sa-hrm-tenant-only-scope-01-20260822.md` |

---

## 1. Context

Hệ thống hiện có **hai plane partition song song** cho dữ liệu HRM công ty con:

| Plane | Khóa | Ví dụ Visun |
|-------|------|-------------|
| **Membership / JWT** | `tenant_id` | `visun` |
| **Workforce (legacy)** | `company_id` = OU slug trong `tenant_id=xevn` | `logistics` |

Hậu quả:

- CEO công ty con (`tenant_id=visun`, `company_id=main`) query partition đúng JWT nhưng **0 rows** vì NV nằm ở `xevn/logistics`.
- OU slug (`trsport`, `logistics`, …) bị hiểu nhầm là **phân quyền menu** — thực tế chỉ là filter dữ liệu tập đoàn.
- Cockpit `/cockpit` và Command Center rail **không** gate theo OU; entitlement module chưa wired.

Sponsor quyết định **2026-08-22**: chuẩn hóa **một plane** — `tenant_id` là ranh giới dữ liệu và phân quyền; **bỏ OU slug** làm partition key.

---

## 2. Problem statement

| Pain | Cause | Impact |
|------|-------|--------|
| CEO Visun không load NV | Data ở `xevn`+OU, JWT ở `visun`+`main` | 200 rỗng, false "no data" |
| Hai identifier cho cùng công ty | OU slug ≠ `tenant_id` registry | Hardcode bridge FE/BE, drift |
| Group CEO rollup phức tạp | `company_id IN (5 OU)` trong 1 tenant | Khó onboard tenant mới |
| OU filter UI | `HrmOperatingUnitFilterContext` | Trùng vai trò tenant switcher |

**Non-problem (giữ nguyên):** JWT `companyId=main` cho mọi CEO; alias `main`→`holding` cho **catalog/KPI/XBOS org** per ADR-GROUP-CEO-MAIN-HOLDING-SCOPE.

---

## 3. Decision

### 3.1 Invariants (normative)

1. **`tenant_id`** là **SoT** cho partition dữ liệu HRM và phân quyền membership.
2. **`company_id=main`** là bucket vận hành **trong** mỗi tenant (không đổi ADR-HRM-RBAC-SCOPE-LADDER §3.2).
3. **OU slug** (`holding`, `trsport`, `logistics`, `finance`, `services`) **không** còn là partition key sau Phase 5 — chỉ dùng trong script migrate (Phase 0–2).
4. **Member CEO:** `tenantIds=[jwt.tenantId]`, `companyIds=['main']` — không rollup.
5. **Group CEO:** rollup qua **`tenant_id IN (allowedMemberTenantIds)`** + `company_id='main'` — **không** qua `company_id IN (OU slugs)`.
6. **Group CEO drill-down:** GlobalFilter tenant switcher (JWT re-issue) **bổ sung** rollup — không thay thế.
7. **Menu / cockpit entitlement:** `xbos_tenant_registry.modules` + role — **không** dùng OU (Phase 3+).

### 3.2 Architecture (target)

```text
JWT: tenantId + companyId=main + roleCode
              │
              ▼
     resolveHrmListScope (tenant-only)
              │
    ┌─────────┴──────────┐
    ▼                    ▼
 Member CEO          Group CEO
 tenantIds=[T]        tenantIds=[xevn, visun, xe-tmdv, …]
 companyIds=[main]    companyIds=[main]
              │
              ▼
 SQL: tenant_id = ANY($1) AND company_id = 'main'
```

### 3.3 Legacy OU → tenant mapping (migrate only)

| Legacy OU slug | Target `tenant_id` | Ghi chú |
|----------------|-------------------|---------|
| `holding` | `xevn` | NV tập đoàn |
| `trsport` | `xe-tmdv` | |
| `logistics` | `visun` | |
| `finance` | `xe-du-lich` | |
| `services` | `xe-vietnam` | |

SoT runtime sau migrate: `xbos_tenant_registry` + `group-member-units` — **không** hardcode FE.

---

## 4. Options considered

| Option | Summary | Verdict |
|--------|---------|---------|
| **A — Tenant-only partition + multi-tenant rollup (this ADR)** | Bỏ OU; group CEO `tenant_id IN (...)` | **Accepted** |
| **B — Giữ OU + bridge scope** | Nhanh, không migrate DB | **Rejected** — nợ kỹ thuật kéo dài |
| **C — Chỉ tenant switcher, không rollup** | CEO tổng xem từng công ty | **Rejected** — mất dashboard tập đoàn |
| **D — Gộp tất cả vào `tenant_id=xevn`** | Bỏ member tenants | **Rejected** — phá membership model |

---

## 5. Consequences

### Positive

- Một khóa partition thống nhất với JWT và XBOS registry.
- CEO công ty con thấy đúng data sau backfill.
- Group CEO rollup rõ ràng: danh sách tenant, không phải 5 OU slug.
- Cockpit / module entitlement có thể wire `tenant.modules`.

### Negative / risks

| Risk | Mitigation |
|------|------------|
| Group CEO mất data nếu migrate trước rollup | Feature flag `HRM_TENANT_ONLY_SCOPE`; bridge phase |
| Payroll `holding` legacy | Audit `payroll.service.ts`; map → `xevn/main` |
| ~50+ tests reference OU | Cập nhật fixture theo SPEC Phase 1 |
| Plane B′ UUID map gắn OU | Re-key theo `tenant_id` — defer không block Phase 1–2 |
| ADR-GROUP-CEO §4 table lệch | Partial supersede; catalog/KPI row giữ |

### Non-goals

- Đổi JWT `companyId=main` → `holding` (vẫn rejected).
- Deprecate Plane A LE UUID bridge trong sprint này.
- Migrate logistics microservice (chỉ HRM scope).

---

## 6. Rollout governance

1. **Không code production scope** trước khi SPEC [`SA-HRM-TENANT-ONLY-SCOPE-SPEC-01`](../program/specs/SA-HRM-TENANT-ONLY-SCOPE-SPEC-01.md) được PM ack.
2. Mọi thay đổi `resolveHrmListScope` phải có jest + persona matrix update.
3. Freeze tạo data mới với OU slug kể từ ack SPEC (BR-TOS-00).
4. Evidence bắt buộc trước Phase 5 deprecate: `ceo@xe.vn` rollup count ≥ pre-migrate; `ceo2@xe.vn` Visun ≥ 1 row.

---

## 7. Handoff

| Field | Value |
|-------|--------|
| **from_role** | sa |
| **to_role** | pm · dev-be · dev-fe |
| **entry_criteria** | Sponsor decision 2026-08-22 |
| **exit_criteria** | SPEC CONFIRMED + Phase 1 feature flag merged |
| **ack_status** | PASS_TO_PM |

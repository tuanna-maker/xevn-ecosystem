# BE-HRM-EMP-COMPANY-COL-01 — Employees «Thông tin công ty» = ĐVTV/LE SoT

| Field | Value |
|-------|--------|
| **work_item_id** | `BE-HRM-EMP-COMPANY-COL-01` |
| **date** | 2026-07-22 (ICT) |
| **from_role** | dev-be |
| **to_role** | qa |
| **ack_status** | **READY_FOR_QA** |
| **HOLD_DEPLOY** | **true** — cấm deploy :8088/pilot đến khi sponsor «cho phép deploy» |
| **spec_ref** | `docs/qa/evidence/ba-hrm-emp-company-col-01-20260722.md` · UC-HRM-21 · BR-INT-05 · BA Option A · `org-seed-member-companies.json` |

---

## 1. Root cause

| Layer | Was | Should |
|-------|-----|--------|
| FE `Employees.tsx` | `resolveOperatingUnitDisplayName` ← `GET /operating-units` | Prefer `company_display_name` (FE wave) **or** OU labels after LE sync |
| BE registry | `HRM_OPERATING_UNIT_DEFAULT_DISPLAY_NAMES` = **Khối … X.E** | Legal entity / ĐVTV names |
| `company_slug_map` | Seeded/upserted Khối via `ensureSlugMapDisplayNames` | LE names; upgrade legacy Khối (AC-EMP-COL-04) |
| Employees serializer | Only `company_id` slug | + `company_display_name` from LE SoT |

**Mismatch confirmed:** cột «Thông tin công ty» bind Plane B Khối registry; CompanyManagement / group-member-units = Plane A LE names.

---

## 2. Fix (local only — no deploy)

| File | Change |
|------|--------|
| `hrm-operating-unit-registry.ts` | Defaults → LE/ĐVTV names; `HRM_LEGACY_KHOI_DISPLAY_NAMES` |
| `hrm-company-display-name.ts` | `resolveCompanyDisplayNameVi` (reject Khối); `ensureCompanySlugMapLegalDisplayNames` upgrades blank/Khối; `loadCompanyDisplayNameBySlug` |
| `operating-units.service.ts` | Uses shared LE resolve/sync |
| `employees.service.ts` | Enrich list/get/create/update/archive/restore with `company_display_name` |
| `migrations/hrm/0019_company_slug_map_legal_display_names.sql` | UPDATE legacy Khối → LE |
| `scripts/lib/hrm-company-slug-map.mjs` + seed upsert | Align SoT; upgrade Khối on conflict |
| `be-hrm-emp-company-col-01.spec.ts` | AC-EMP-COL-01..04 regression |

### Interim BR-INT-05 slug → LE display (org-seed order)

| slug | `company_display_name` |
|------|------------------------|
| `holding` | Tập đoàn XeVN |
| `trsport` | Công ty Cổ phần Thương mại và Dịch vụ X.E |
| `logistics` | Công ty TNHH Du lịch Visun |
| `finance` | Công ty TNHH Du lịch X.E Việt Nam |
| `services` | Công ty TNHH X.E Việt Nam |

> Residual: SA may refine slug↔tenant 1:1; until then names ∈ ĐVTV set (AC-EMP-COL-01).

---

## 3. Verification

```bash
cd apps/api/hrm-api
npx jest be-hrm-emp-company-col-01 operating-units.service.spec --no-cache
# Test Suites: 2 passed; Tests: 12 passed

npx jest employees.service.spec --no-cache
# Test Suites: 1 passed; Tests: 22 passed
```

| Check | Result |
|-------|--------|
| Registry has 0 `Khối*` defaults | PASS |
| Resolve rejects DB `Khối Tài chính X.E` → LE name | PASS |
| Upsert SQL upgrades `^Khối` | PASS |
| `listEmployees` returns `company_display_name` LE | PASS |
| Scope/create employees regression | PASS (22) |
| Seed U65 | **not run** (sponsor lock) |
| Deploy :8088 | **not done** (HOLD_DEPLOY) |

---

## 4. FE contract note

```json
{
  "company_id": "finance",
  "company_uuid": "10000000-0000-4000-8000-000000000004",
  "company_display_name": "Công ty TNHH Du lịch X.E Việt Nam"
}
```

- `GET /api/hrm/operating-units` `display_name_vi` now LE SoT (filter + legacy FE path).
- Recommend FE bind `company_display_name` first (`D-HRM-EMP-COMPANY-COL-FE-01`).

---

## 5. Handoff

```yaml
work_item_id: BE-HRM-EMP-COMPANY-COL-01
from_role: dev-be
to_role: qa
ack_status: READY_FOR_QA
evidence_path: docs/qa/evidence/be-hrm-emp-company-col-01-20260722.md
HOLD_DEPLOY: true
completion_report: |
  Closed: Khối* registry/seed replaced with LE/ĐVTV SoT; company_slug_map upgrade;
  employees API emits company_display_name; jest 12+22 PASS. Local only.
  Residual: apply mig 0019 on env before QA browser; FE bind company_display_name;
  SA may refine BR-INT-05 slug↔tenant; HOLD_DEPLOY pilot.
next_owner: qa
```

### next_dispatch_prompt

```text
work_item_id: QA-HRM-EMP-COMPANY-COL-01
entry: BE-HRM-EMP-COMPANY-COL-01 READY_FOR_QA · ba-hrm-emp-company-col-01 AC-EMP-COL-01..07 · HOLD_DEPLOY
exit: browser U65 ceo@xe.vn — cột «Thông tin công ty» ∈ LE/ĐVTV names (0 Khối*); F5; J-HRM-02; Network company_display_name or operating-units LE
cấm: seed · deploy pilot
evidence: docs/qa/evidence/qa-hrm-emp-company-col-01-YYYYMMDD.md
parallel: D-HRM-EMP-COMPANY-COL-FE-01 bind company_display_name if still using OU map only
```

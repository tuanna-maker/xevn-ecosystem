# Evidence — PO-HRM-SETTINGS-ATT-LVT-SOT-BE-01

| Meta | Value |
|------|-------|
| **work_item_id** | `PO-HRM-SETTINGS-ATT-LVT-SOT-BE-01` |
| **UC** | `HRM-SC-01` · dual SoT `leave_types` (group REF) vs `att_leave_type` (tenant writer) |
| **from_role** | dev-be |
| **to_role** | qa |
| **lane** | execution |
| **ack_status** | **READY_FOR_QA** |
| **date** | 2026-08-10 |
| **change_mode** | ADD bridge · preserve F-ATT-CAT-LVT/EFF from ATT-BE-01 |
| **U65** | no seed |

---

## 1. spec_read_ack

| Artifact | Sections |
|----------|----------|
| `docs/program/dispatch/CURSOR-RECLAIM-CLAUDE-UC-WAVE-01.md` | §3 P0 ATT LVT BE |
| `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-DATA-01.md` | §2.5 dual SoT · §5 VAL-ATT-LVT-* |
| `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-CATALOG-SA-01.md` | Option B · L-ATT-LEAVE-02/03 · F-ATT-CAT-EFF-01 |
| `docs/hrm/API_DESIGN_HRM_SETTINGS_CATALOG.md` | FR-HRM-SC-LEAVE-01 overview vs consumer |
| Prior seal | `po-hrm-dynamic-config-platform-att-be-01.md` — Nest `att_leave_type` CRUD/EFF |

---

## 2. Deliverable (apps/api/hrm-api)

| Path | Change |
|------|--------|
| `settings-catalogs/hrm-settings-leave-type-sot.ts` | **NEW** — REF-only guard + tenantWriter API paths |
| `settings-catalogs/hrm-settings-leave-type-sot.spec.ts` | **NEW** — HRM-SC-01 guard + overview stamp |
| `settings-catalogs/settings-catalogs.service.ts` | Block extension upsert/delete/removal on `leave_types`; overview `tenantWriter` |
| `attendance/att-leave-type.service.ts` | CODE-MEMORY LastVerified + CHANGE stamp |
| `attendance/att-leave-type.service.spec.ts` | HRM-SC-01 key parity + existing VAL-ATT-LVT suite |

**must_keep:** XBOS pull/sync `leave_types` REF · `GET …/leave-types/effective` · leave-requests `HRM-LEAVE-TYPE-UNKNOWN` · no seed.

---

## 3. Behavior stamps (HRM-SC-01)

| Rule | Implementation |
|------|----------------|
| Group REF `leave_types` | settings-catalogs overview + `getEffectiveItemsForKey` merge-read (unchanged) |
| Tenant writer | `POST/PUT/PATCH/retire` → `/api/hrm/attendance/leave-types` (`att_leave_type`) |
| Forbidden dual master | Extension mutate on `leave_types` → **409** `HRM-SC-LEAVE-REF-ONLY` |
| Consumer picker SoT | `F-ATT-CAT-EFF-01` (ATT wins collision) — existing |
| Overview FE hint | `tenantWriter: { kind, apiPath, effectiveApiPath, groupRefReadOnly: true }` on leave row |

---

## 4. Verification

```text
pnpm --filter hrm-api test -- "att-leave-type|hrm-settings-leave-type-sot"
→ Test Suites: 2 passed
→ Tests: 14 passed (10 att-leave-type + 4 SoT bridge)
```

| Suite | Result |
|-------|--------|
| `att-leave-type.service.spec.ts` | PASS — VAL-ATT-LVT-02/04/08 · EFF ATT wins · scope_parity · HRM-SC-01 key |
| `hrm-settings-leave-type-sot.spec.ts` | PASS — REF mutate forbidden · overview tenantWriter |

---

## 5. QA handoff (browser — U65)

| UF / AC | Persona | Check |
|---------|---------|-------|
| Settings overview | `ceo@xe.vn` | `GET /settings-catalogs` → `leave_types` row has `tenantWriter.apiPath` |
| Master-data mutate | same | POST extension `leave_types` → **409** `HRM-SC-LEAVE-REF-ONLY` |
| ATT admin | Settings tab Loại phép ATT | CREATE open slug → F5 list (AC-PLT-ATT-01 retain) |
| Consumer | Leave create | Picker from `/leave-types/effective`; invent key → `HRM-LEAVE-TYPE-UNKNOWN` |

**pm_dispatch_hint:** `QA-HRM-SETTINGS-ATT-LVT-SOT-01` — U65 paths above · no seed · matrix HRM-SC-01 row.

---

## 6. completion_report

- **Closed:** HRM-SC-01 BE dual SoT bridge — settings `leave_types` REF read-only for extension mutate; overview stamps Nest writer; VAL-ATT-LVT jest green.
- **Residual:** FE master-data tab may still show dual UX (`PO-HRM-SETTINGS-ATT-LVT-SOT-FE-01`); UC matrix `HRM-SC-01` promote after QA browser.

---

## 7. Handoff contract

| Field | Value |
|-------|-------|
| **next_owner** | qa |
| **ack_status** | READY_FOR_QA |
| **evidence_path** | `docs/qa/evidence/po-hrm-settings-att-lvt-sot-be-01.md` |

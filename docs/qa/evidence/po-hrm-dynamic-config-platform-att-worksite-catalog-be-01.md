# Evidence — PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-WORKSITE-CATALOG-BE-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-WORKSITE-CATALOG-BE-01` |
| **from_role** | `dev-be` |
| **to_role** | `qa` |
| **lane** | execution |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-WORKSITE-CATALOG-BA-01` **CONFIRMED** |
| **prior** | SA Option **B** LOCKED · ba-data **HOLD** (Nest LIVE) |
| **program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **Date** | 2026-08-08 |
| **change_mode** | **UPGRADE** (deepen F-ATT-CAT-WS only · **no** new table · **no** fold leave) |
| **ack_status** | **READY_FOR_QA** |
| **Honesty** | `attendance_uat_ready=false` · ATT-LEAVE GWC **SEAL RETAIN** · WAIVE/sign/**J-HRM-06c** **SEAL RETAIN** · SI type/insurer L1 · CTR · enrollment **SEAL RETAIN** · **`C-SLICE-≠-MODULE`** · U65 zero-seed · DENY module ATT UAT |

---

## 1. spec_read_ack

| Layer | Path / section |
|-------|----------------|
| **SRS** | `docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md` **FR-UC-BP-ATT-03d** (GPS work-sites) |
| **SA** | `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-WORKSITE-CATALOG-SA-01.md` Option **B** · L-ATT-WS-01..10 · §7 |
| **BA** | `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-WORKSITE-CATALOG-BA-01.md` AC-PLT-ATT-WORKSITE-01* · VAL-ATT-WS-CNS-01..05 · BR-PLT-ATT-WS-* |
| **BA evidence** | `docs/qa/evidence/po-hrm-dynamic-config-platform-att-worksite-catalog-ba-01.md` |
| **ADR** | ADR-HRM-ATTENDANCE-CFG-PERSIST **D3** · ADR-HRM-DYNAMIC-CONFIG-PLATFORM Option B |
| **DB** | `attendance_work_sites` LIVE — **no** ba-data EXPAND this seat |

---

## 2. completion_report

**Closed (Nest F-ATT-CAT-WS deepen):**

| Gap | Impl |
|-----|------|
| **VAL-ATT-WS-CNS-03b** list default active | `listWorkSites` adds `active = TRUE` unless `include_inactive=true` (query on GET work-sites) |
| **VAL-ATT-WS-CNS-04** soft-retire | DELETE → soft `active=false` (product SoT); `?hard=true` residual hard DELETE; PATCH `active=false` RETAIN |
| **VAL-ATT-WS-CNS-01** GEO-001 | `assertWithinWorkSite` **RETAIN** — OOS coords → `HRM-ATT-GEO-001` |
| Empty active ADR D3 | assert skips when no active rows; **no** `ensureDefaultWorkSite` |
| **VAL-ATT-WS-CNS-05** optional | `check_in_method=gps` + gps_enabled + active>0 + omit lat/lon → **`HRM-ATT-GEO-REQ`**; manual/omit method soft-skip **RETAIN** (BR-WS-08) |
| **VAL-ATT-WS-CNS-02** SITE-UNKNOWN | **HOLD** — no `work_site_id` consumer assert invented |
| **U19 scope_parity** | list / countActive / geofence / mutate share `resolveHrmListScope` + `expandHrmTextCompanyIds` |
| CODE-MEMORY | APPEND on `attendance-config.service.ts` · `attendance.service.ts` · `attendance.controller.ts` |

**Paths KEEP:** `GET/POST/PATCH/DELETE /api/hrm/attendance/work-sites*` · geofence on `POST /attendance/records`.

**Cấm giữ:** seed · ensureDefault · flip `attendance_uat_ready` · reopen ATT-LEAVE GWC · fold leave · mega-EAV · work_shifts catalog · SITE-UNKNOWN invent · Phase1 DONE.

**Residual:**

| Item | Owner |
|------|-------|
| FE send `check_in_method: 'gps'` on GPSAttendance POST (CNS-05 full wire) | **dev-fe** verify / optional ADD |
| Browser U65 AC-PLT-ATT-WORKSITE-01/01b/01c/01d/01H | **qa** |
| Slice GWC · honesty false | **qc** after QA |

---

## 3. Error taxonomy (emit)

| Code | HTTP | When |
|------|------|------|
| **`HRM-ATT-GEO-001`** | 400 | OOS coords when active>0 ∧ gps on ∧ lat/lon present |
| **`HRM-ATT-GEO-REQ`** | 400 | `check_in_method=gps` omit lat/lon when enforce + active>0 (CNS-05) |
| **`HRM-ATT-SITE-404`** | 404 | Admin get/mutate OOS / not found |
| **`HRM-ATT-SITE-VAL`** | 400 | Admin radius invalid |
| **`HRM-ATT-SITE-UNKNOWN`** | — | **HOLD** — not emitted this seat |

---

## 4. Verification

```bash
cd apps/api/hrm-api
pnpm exec jest --testPathPatterns="attendance-config.service.spec" --testPathPatterns="attendance.service.spec" --testPathPatterns="attendance.controller.spec" --no-coverage
# Test Suites: 3 passed · Tests: 52 passed (30 + 22)
# attendance-config + attendance.service = 30; controller = 22
```

| VAL / AC | Jest result |
|----------|-------------|
| **CNS-03b** list active filter | PASS |
| **CNS-04** soft-retire DELETE + geofence hide / empty skip | PASS |
| **CNS-01** GEO-001 OOS | PASS |
| **CNS-05** gps omit → GEO-REQ · manual soft-skip | PASS |
| Scope update OOS (U19) | PASS (retained ATT-03d) |
| Hard DELETE residual `?hard=true` | PASS |

---

## 5. Honesty / seals

| Flag / seal | Value |
|-------------|-------|
| `attendance_uat_ready` | **false** — **DENIED** flip |
| ATT-LEAVE-CATALOG GWC | **SEAL RETAIN** |
| Leave WAIVE / sign / J-HRM-06c | **SEAL RETAIN** |
| SI type/insurer L1 · CTR · enrollment | **SEAL RETAIN** |
| ba-data | **HOLD** — no second table · no fold `att_leave_type` |
| `C-SLICE-≠-MODULE` | Work-sites deepen ≠ module ATT UAT |
| Seed / ensureDefaultWorkSite | **DENIED** |

---

## 6. Completion contract

| Field | Value |
|-------|--------|
| **completion_report** | Deepened Nest F-ATT-CAT-WS: list default active-only; DELETE soft-retire (hard=?hard=true); GEO-001 + empty skip RETAIN; CNS-05 GEO-REQ when check_in_method=gps omit coords; SITE-UNKNOWN HOLD; jest 52 PASS across config/service/controller; honesty false; seals retained; no seed/table/leave fold. |
| **next_owner** | **qa** |
| **next_dispatch_prompt** | See §7 |
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-att-worksite-catalog-be-01.md` |
| **ack_status** | **READY_FOR_QA** |

---

## 7. next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-WORKSITE-CATALOG-QA-01
from_role: pm
to_role: qa
lane: execution
priority: P1
program: PO-HRM-CONTINUOUS-W8-20260807
parent: PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-WORKSITE-CATALOG-BE-01 READY_FOR_QA

## entry_criteria
- Read BE evidence: docs/qa/evidence/po-hrm-dynamic-config-platform-att-worksite-catalog-be-01.md
- Read BA: docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-WORKSITE-CATALOG-BA-01.md
- L0 stack up · U65 zero-seed · browser-only for UF
- Honesty: attendance_uat_ready=false · C-SLICE-≠-MODULE
- RETAIN: ATT-LEAVE GWC · WAIVE/sign/J-06c · SI · CTR · enrollment

## task
U65 browser stamp AC-PLT-ATT-WORKSITE-01 / 01b / 01c / 01d / 01H:
1) Admin CREATE Nest site N+1 (Settings GPS) → 201 → list → F5
2) GPS punch inside radius → 2xx (Nest SoT — not gps_locations JSON alone)
3) Invent OOS coords → 4xx HRM-ATT-GEO-001
4) Soft-retire (DELETE or PATCH active=false) → site hidden from default list/geofence
5) Empty active → skip geofence · no seed/ensureDefault
6) Optional CNS-05: if FE sends check_in_method=gps without lat/lon → HRM-ATT-GEO-REQ; else note FE residual
7) Spot J-MOB-02 if mobile in scope; cấm claim SITE-UNKNOWN without UF

## cấm
seed · ensureDefault · flip attendance_uat_ready · reopen ATT-LEAVE · PASS probe-only · claim module ATT UAT

## evidence_path
docs/qa/evidence/po-hrm-dynamic-config-platform-att-worksite-catalog-qa-01.md

## exit
PASS_TO_PM or FAIL_TO_PM · matrix rows · honesty false · next_dispatch_prompt
```

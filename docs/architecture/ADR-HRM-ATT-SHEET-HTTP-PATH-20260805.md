# ADR: HRM attendance sheet — canonical HTTP paths (ATT-11 sign wave)

| Field | Value |
|-------|--------|
| **ADR-ID** | ADR-HRM-ATT-SHEET-HTTP-PATH-20260805 |
| **work_item_id** | `PO-HRM-BP-ATT-SIGN-SA-01` |
| **Status** | Accepted |
| **Date** | 2026-08-05 |
| **Decision owner** | SA |
| **Related** | `API_DESIGN_HRM_ENTERPRISE.md` F-ATT-* · `ADR-HRM-RBAC-SCOPE-LADDER.md` §13 |
| **Evidence** | `docs/qa/evidence/po-hrm-bp-att-sign-sa-01.md` |

---

## 1. Context

Enterprise **API_DESIGN** uses logical prefix `/api/hrm/att/…`. Runtime **hrm-api** exposes `/api/hrm/attendance/…` (`@Controller('attendance')`). Wave **UC-BP-ATT-11** adds nested routes: `{id}`, `{id}/signatures`, `{id}/close`, `{id}/reopen`.

---

## 2. Decision

| Choice | Verdict |
|--------|---------|
| **Canonical HTTP (GĐ1)** | `/api/hrm/attendance/attendance-sheets[/{id}[/signatures\|/close\|/reopen]]` |
| **Logical module tag** | Keep F-id prefix `F-ATT-*` and docs table column «att» as **namespace only** |
| **Alias `/api/hrm/att/…`** | **Deferred** — optional non-breaking duplicate routes only if OpenAPI consumers require; not GĐ1 default |
| **Breaking rename** | **Rejected** for AT-14 list/create surface already on `attendance` |

---

## 3. Consequences

- **API_DESIGN** physical METHOD/path rows carry DOC-DELTA **physical path** = `attendance` segment.
- **Dev-BE** registers new handlers on existing `AttendanceController` — no parallel `@Controller('att')` unless alias wave approved.
- **Dev-FE / OpenAPI client** generated from Nest must use `attendance` paths for pilot embed.

---

## 4. Handoff

| Field | Value |
|-------|--------|
| **ack_status** | Accepted |
| **next_owner** | dev-be (`PO-HRM-BP-ATT-SIGN-BE-01`) |

*End ADR.*

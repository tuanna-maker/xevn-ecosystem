# BA-HRM-ADM-SCOPE-01 — FR-HRM-03/04/05 «ngoài phạm vi» (G-ADM-SCOPE-01)

| Field | Value |
|-------|--------|
| **work_item_id** | `BA-HRM-ADM-SCOPE-01` |
| **role** | `ba-process` · governance |
| **date** | 2026-07-27 |
| **change_mode** | ADD (AC/BR + SRS/API delta) · preserve_default |
| **ack_status** | **PASS_TO_PM** |

---

## 1. Problem

| Artifact | Said |
|----------|------|
| Client SRS §3.25 Diễn biến **#3** (trước) | «Đơn vị ngoài phạm vi» → từ chối đơn vị |
| Client §3.26 Actor | HCNS / quản trị doanh nghiệp |
| Client §3.27 #3 | Tài khoản ngoài phạm vi ĐV |
| API_DESIGN FR-03 #3 | Residual **G-ADM-SCOPE-01** — platform gate only today |
| Runtime `HrmAdminService` | `assertPlatformAdmin` only — non-platform → **`HRM-AUTH-002` 403**; **không** `resolveHrmListScope` |
| ADR-HRM-RBAC-SCOPE-LADDER | Ladder cho **list/ops** + JWT scope; không bắt admin mutate dùng membership filter |

**Exit:** SoT Option A hoặc B; close residual; no invent FR; no `apps/**`.

---

## 2. Options evaluated

| Option | Scope | Risk | Timeline |
|--------|-------|------|----------|
| **A — KEEP platform-only** (recommended) | Diễn biến #3 = platform gate; non-platform → 403; không `resolveHrmListScope` | Low — khớp runtime; không invent persona | Same day docs |
| **B — ENFORCE membership scope** | Cho `company_admin` gọi + filter `company_id` qua `resolveHrmListScope` | Medium — BE + persona matrix mới; lệch runtime | Multi-day Dev+QA |
| **C — Dual caller** | Platform full + company_admin hẹp song song | High — invent product matrix không CR | Out of scope |

**Decision: Option A — KEEP platform-only.**

Rationale:

1. Runtime đã `assertPlatformAdmin` trên `company-admin` / `invite-employee` (trừ service-role) / `reset-user-password`.
2. Exit criteria: ưu tiên khớp runtime + SRS **không** invent persona matrix.
3. ADR ladder / `resolveHrmListScope` = FR-SCOPE list/ops — **không** đồng nghĩa bắt buộc trên admin privilege plane.
4. Option B = CR riêng (HOLD) khi sponsor mở caller đơn vị hẹp.

---

## 3. SoT policy (normative)

| Item | Value |
|------|--------|
| Endpoints | `POST …/admin/company-admin` · `invite-employee` · `reset-user-password` |
| Caller SoT | `platform_admin` \| `group_ceo` \| grant `platform_admins` (+ service-role key cho invite) |
| Non-platform | **403** · `HRM-AUTH-002` (= Diễn biến #3 «ngoài phạm vi») |
| Platform + `company_id` hợp lệ | **2xx** — mọi đơn vị đích hợp lệ trong hệ thống thuộc phạm vi quyền nền tảng |
| **Forbidden expectation** | QA **không** expect `resolveHrmListScope` / `409` list-scope trên các mutate admin này |
| Option B | **HOLD** — CR mở `company_admin` + membership filter |

---

## 4. Artifacts updated (ADD)

| Path | Delta |
|------|--------|
| `docs/hrm/API_DESIGN_HRM_ADMIN.md` | FR-03 Nghiệp vụ #6 + Policy lock; #3 map; FR-04/05 #3 CLOSED; residual ~~G-ADM-SCOPE-01~~ |
| `docs/hrm/DB_DESIGN_HRM_ADMIN.md` | Gap G-ADM-SCOPE-01 → CLOSED |
| `docs/hrm/SRS.md` UC-HRM-03..05 | Branch platform gate + **BR-ADM-SCOPE-01** + **AC-ADM-SCOPE-01..03** |
| `docs/client-delivery/hrm/SRS_HRM_KHACH.md` §3.25–3.27 | Actor + #3 + quy tắc = quyền nền tảng (VI sạch, no prompt-echo) |

**Unchanged:** FR inventory (no new FR); Fleet/OP/W2/Payroll; ADR ladder list APIs; `apps/**`.

---

## 5. Acceptance criteria (QA-ready)

| ID | Pass |
|----|------|
| **AC-ADM-SCOPE-01** | Non-platform JWT → `POST …/company-admin` → **403** `HRM-AUTH-002` |
| **AC-ADM-SCOPE-02** | Platform JWT + `company_id` slug hợp lệ → **2xx** `HRM-ADMIN-202` |
| **AC-ADM-SCOPE-03** | Invite không platform và không service-role → **403**/401 |

U65: L1 API spot đủ cho contract; browser FE nếu có màn. **Cấm seed** admin/membership chỉ vì test.

---

## 6. Runtime evidence (read-only)

| Check | Result |
|-------|--------|
| `assertPlatformAdmin` allows | `platform_admin` · `group_ceo` · `platform_admins` row |
| Else | `HRM-AUTH-002` 403 |
| `createCompanyAdmin` / `inviteEmployees` / `resetUserPassword` | Call assert (invite: service-role exception) |
| `resolveHrmListScope` in `hrm-admin.service.ts` | **Absent** |

---

## 7. Handoff

| Field | Value |
|-------|--------|
| **next_owner** | `qa` |
| **ack_status** | `PASS_TO_PM` |
| **Code change** | **None** (Option A) — **không** dispatch `dev-be` trừ CR Option B |
| **next_dispatch_prompt** | (see completion contract below) |

---

## 8. Residual after this WI

| ID | Status |
|----|--------|
| ~~G-ADM-SCOPE-01~~ | **CLOSED** policy Option A |
| G-ADM-04 | OPEN P2 — invite temp password / channel |
| G-ADM-01-READ | Info — GET audit list |
| Option B membership admin | HOLD — needs sponsor CR |

---

`completion_report`: Closed G-ADM-SCOPE-01 with Option A (platform-only). Diễn biến #3 = non-platform → 403. No BE. Residual G-ADM-04 still open.

`next_owner`: qa

`ack_status`: PASS_TO_PM

`evidence_path`: docs/qa/evidence/ba-hrm-adm-scope-01-20260727.md

# BA-HRM-ADM-CONFLICT-01 — FR-HRM-02 conflict vs upsert (G-ADM-03)

| Field | Value |
|-------|--------|
| **work_item_id** | `BA-HRM-ADM-CONFLICT-01` |
| **role** | `ba-process` · governance |
| **date** | 2026-07-27 |
| **change_mode** | ADD (AC/BR + SRS delta) · preserve_default |
| **ack_status** | **PASS_TO_PM** |

---

## 1. Problem

| Artifact | Said |
|----------|------|
| Client SRS §3.24 Diễn biến **#4** (trước delta) | Trùng email → từ chối |
| Team `SRS.md` UC-HRM-02 (trước delta) | `HRM-ERR-CONFLICT` khi đã tồn tại |
| Runtime `HrmAdminService.createPlatformAdmin` | `ON CONFLICT (user_id) DO UPDATE` — **upsert** |
| API_DESIGN FR-02 | Documented upsert + residual **G-ADM-03** |
| FR-HRM-03 | Đã «created or updated» / upsert |

**Exit:** SoT policy + testable AC; close G-ADM-03; no invent FR; no `apps/**`.

---

## 2. Options evaluated

| Option | Scope | Risk | Timeline |
|--------|-------|------|----------|
| **A — KEEP UPSERT** (recommended) | Align SRS #4 + team BR/AC to idempotent grant; no BE change | Low — matches runtime + FR-03 | Same day docs |
| **B — Hard 409** | Revert API/runtime to conflict; SRS stays reject | Medium — breaks re-grant; diverges FR-03; needs Dev+QA | Multi-day |
| **C — Dual mode flag** | Config «cấm trùng» ON/OFF | High — invent product flag without sponsor CR | Out of scope |

**Decision: Option A — KEEP UPSERT.**

Rationale:

1. Runtime already upserts; evidence = code path `INSERT … ON CONFLICT DO UPDATE`.
2. Parity with FR-HRM-03 TechSpec «created or updated».
3. Operational: re-submit cùng email = làm mới quyền nền tảng, không phải lỗi.
4. Client SRS trước đó đã có điều kiện mềm «khi cấm» — delta khóa **mặc định = không cấm / upsert**.
5. Hard 409 = CR riêng (HOLD), không mặc định Phase1.

---

## 3. SoT policy (normative)

| Item | Value |
|------|--------|
| Endpoint | `POST /api/hrm/admin/platform-admin` |
| Duplicate email / existing grant | **2xx** · `HRM-ADMIN-201` (alias OK code) · UPSERT `platform_admins` |
| **Forbidden expectation** | QA/FE **không** expect `409` / `HRM-ERR-CONFLICT` trên nhánh email đã có grant |
| Password on existing profile | Runtime `findOrCreatePortalUser` **không** bắt buộc đổi MK khi profile đã có — grant vẫn upsert |
| Hard conflict | **HOLD** — chỉ khi CR bật «cấm trùng email nền tảng» |

---

## 4. Artifacts updated (ADD)

| Path | Delta |
|------|--------|
| `docs/hrm/API_DESIGN_HRM_ADMIN.md` | FR-02 Nghiệp vụ #4/#5; Errors; Policy lock; residual ~~G-ADM-03~~ **CLOSED** |
| `docs/hrm/DB_DESIGN_HRM_ADMIN.md` | Gap G-ADM-03 → CLOSED / SoT upsert |
| `docs/hrm/SRS.md` UC-HRM-02 | Branch upsert + **BR-ADM-02-UPSERT-01** + **AC-ADM-02-UPSERT-01..03** |
| `docs/client-delivery/hrm/SRS_HRM_KHACH.md` §3.24 | Diễn biến #4 + quy tắc + mermaid — cập nhật quyền (VI sạch, no prompt-echo) |

**Unchanged:** FR inventory (no new FR); Fleet/OP/W2/Payroll; `apps/**`.

---

## 5. Acceptance criteria (QA-ready)

| ID | Pass |
|----|------|
| **AC-ADM-02-UPSERT-01** | POST cùng email ×2 (auth OK) → cả hai **2xx**; không `409` |
| **AC-ADM-02-UPSERT-02** | Sau lần 2: grant còn (list/F5) |
| **AC-ADM-02-UPSERT-03** | FE sau 2xx = success path; không toast conflict giả |

U65: browser FE nếu có màn; L1 API double-POST đủ cho contract spot. **Cấm seed** để tạo admin chỉ vì test.

---

## 6. G-ADM-03 status

| Before | After |
|--------|--------|
| OPEN — conflict vs upsert | **CLOSED** — policy-as-upsert; DESIGN/POLICY READY matched runtime |

**Code change required:** **No.**

---

## 7. completion_report

**Closed:** G-ADM-03 policy lock KEEP UPSERT; SRS khách + team AC/BR ADD; API_DESIGN + DB_DESIGN residual CLOSED.

**Residual:** Hard-conflict product flag = HOLD/CR. G-ADM-01/04/05/SCOPE vẫn OPEN (ngoài scope). QA nên spot AC-ADM-02-UPSERT-01 khi wave Admin UF (không block Dev).

---

## 8. Handoff

| Field | Value |
|-------|--------|
| **next_owner** | `pm` → optional `qa` spot (no `dev-be` for this residual) |
| **ack_status** | `PASS_TO_PM` |
| **evidence_path** | `docs/qa/evidence/ba-hrm-adm-conflict-01-20260727.md` |

### next_dispatch_prompt

```text
work_item_id: QA-HRM-ADM-UPSERT-SPOT-01
role: qa
lane: execution
entry_criteria: BA-HRM-ADM-CONFLICT-01 PASS — G-ADM-03 CLOSED policy KEEP UPSERT
read_first:
  - docs/qa/evidence/ba-hrm-adm-conflict-01-20260727.md
  - docs/hrm/API_DESIGN_HRM_ADMIN.md §A Policy lock + AC-ADM-02-UPSERT-*
  - docs/hrm/SRS.md UC-HRM-02 BR/AC upsert
exit_criteria:
  1) Double POST /api/hrm/admin/platform-admin same email (persona platform admin) → both 2xx; no 409
  2) Record AC-ADM-02-UPSERT-01..02 (L1 OK); AC-03 if Admin UI available (U65 FE-only)
  3) evidence docs/qa/evidence/qa-hrm-adm-upsert-spot-01-20260727.md → PASS_TO_PM
cấm: seed admin · expect 409 · claim Phase1 · change apps to force conflict
```

**If PM prefers skip QA spot:** mark Admin FR-02 contract residual closed; promote AC into next Admin UF wave only.

# P1-BROWSER-E2E-HRM-WAVE-8088-R5 — QA retest UF-HRM-09/13

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-BROWSER-E2E-HRM-WAVE-8088-R5` |
| **from_role** | `dev-be` (`P1-HRM-MEMBER-UI-LOGIN-8088-01`) |
| **to_role** | `pm` |
| **executed_at** | 2026-06-20 |
| **portal** | http://14.225.217.232:8088/ |
| **rule** | U65 browser-only · no seed |
| **ack_status** | **FAIL_TO_PM** |

## Executive summary

Post xbos-be recreate (`P1-HRM-MEMBER-UI-LOGIN-8088-01`), **API login 201** for `du-lich.hr@xe.vn` and `du-lich.ceo@xe.vn` **PASS** (entry criteria met). Browser U65 retest **FAIL** — member UI login submits successfully but **session evicted within ~8s**: `handleUnauthorizedResponse` fires on **`GET /api/xbos/tenant-scope/group-member-units` → 403**, clearing `xevn.portal.accessToken` and redirecting to `/login`. UF-HRM-09 PATCH scope and UF-HRM-13 member mutate **not reachable** in browser. R4 carry **9/11 🟢** confirmed via spot **UF-HRM-01** list **1107** NV.

**Wave 2 score:** **9/11 🟢** (unchanged) — UF-HRM-09/13 remain 🔴.

---

## Entry criteria

| Check | Result |
|-------|--------|
| xbos-be recreated on `:8088` | **PASS** (assumed per dispatch; API healthy) |
| `POST /api/xbos/auth/login` `du-lich.hr@xe.vn` | **201** `XBOS-AUTH-200` · tenant `xe-du-lich` · role `HRBP_MANAGER` |
| `POST /api/xbos/auth/login` `du-lich.ceo@xe.vn` | **201** `XBOS-AUTH-200` · tenant `xe-du-lich` · role `subsidiary_ceo` |
| U65 no seed | **PASS** |

---

## R4 carry spot-check — UF-HRM-01

| Item | Result |
|------|--------|
| Persona | `ceo@xe.vn` / `Xevn@2026` |
| Path | `/login` → **Đăng nhập** → `/command-center/hrm/employees` |
| Token | `xevn.portal.accessToken` **present** |
| iframe | «Danh sách nhân viên trong công ty - **1107**» |
| Verdict | 🟢 **PASS** — R4 carry intact |

---

## UF-HRM-09 — Member HRBP scope (U28-R2)

| Step | Evidence |
|------|----------|
| Persona | `du-lich.hr@xe.vn` / `Xevn@2026` |
| UI login | `/login?redirect=/command-center/hrm/employees` → React-controlled fill → **Đăng nhập** |
| Network login | `POST /api/xbos/auth/login` → **201** `XBOS-AUTH-200` (browser fetch + PowerShell probe) |
| Post-login | Brief navigation toward HRM; **token cleared** |
| Session killer | **`GET /api/xbos/tenant-scope/group-member-units` → 403** → `handleUnauthorizedResponse` → `/login` |
| Secondary | `GET /api/xbos/command-center/workspace-meta?tenantId=xevn&companyId=main` → **409** (wrong tenant for member) |
| HRM embed | **NOT LOADED** — cannot execute PATCH employee scope in browser |
| PATCH scope (blocked) | API-only reference: member PATCH **200** / cross **403** per prior `p1-hrm-hrbp-emp-patch-20260620-qa.md` — **not promoted** (browser UF blocked) |

**Verdict:** 🔴 **FAIL** — defect **D-HRM-MEMBER-SESSION-403**

**spec_ref:** UF-HRM-09 · U28-R2 · `ADR-HRM-RBAC-SCOPE-LADDER`

---

## UF-HRM-13 — Member CEO scope (UC-HRM-SCOPE-02)

| Step | Evidence |
|------|----------|
| Persona | `du-lich.ceo@xe.vn` / `Xevn@2026` |
| UI login | Same pattern as UF-09 |
| Session killer | Same **`group-member-units` → 403** logout chain |
| Scope negatives (API reference only) | `company_id=holding` **409** · `group-member-units` **403** = expected business negatives — **cannot document as browser PASS** because session evicted before mutate/F5 |

**Verdict:** 🔴 **FAIL** — same **D-HRM-MEMBER-SESSION-403**

**spec_ref:** UF-HRM-13 · UC-HRM-SCOPE-02

---

## Gate table

| Gate | Result |
|------|--------|
| L0 `:8088` | **PASS** |
| U65 no seed | **PASS** |
| BE member API login (entry) | **PASS** |
| UF-HRM-09 browser | **FAIL** |
| UF-HRM-13 browser | **FAIL** |
| R4 carry 9 UFs spot UF-HRM-01 | **PASS** 🟢 **1107** |
| Wave 2 11/11 🟢 | **FAIL** **9/11** |

---

## Root cause (QA)

| Layer | Finding |
|-------|---------|
| **BE (closed R5 entry)** | Pilot portal bootstrap — member `POST /api/xbos/auth/login` **201** |
| **FE (open P0)** | Command Center boot calls `group-member-units` for all personas; **403 treated as auth failure** in `xbosHttp.ts` → `handleUnauthorizedResponse` clears JWT for member HRBP/CEO |
| **FE (secondary)** | `workspace-meta` uses `tenantId=xevn` for member JWT → **409** |

**Owner:** `dev-fe` (primary) · `dev-be` optional scope API parity review

---

## Residual

| ID | Item | Owner |
|----|------|-------|
| D-HRM-MEMBER-SESSION-403 | Member UI login → HRM route → 403 `group-member-units` → forced logout | **dev-fe** |
| D-HRM-WORKSPACE-META-409 | Member `workspace-meta` tenantId mismatch `xevn` vs `xe-du-lich` | **dev-fe** |

---

## completion_report

- **Closed:** Entry criteria API login **201** both member personas; root cause isolated to FE session handler + CC boot API; R4 **UF-HRM-01** spot **1107** 🟢 confirms 9/11 carry.
- **Open:** UF-HRM-09/13 browser blocked — Wave 2 remains **9/11**; matrix §4 **not** promoted for 09/13.

## next_owner

`dev-fe`

## next_dispatch_prompt

```
Role: dev-fe
work_item_id: P1-HRM-MEMBER-SESSION-403-8088-01
from_role: qa
to_role: dev-fe
priority: P0
entry_criteria: docs/qa/evidence/p1-browser-e2e-hrm-wave-8088-r5-20260620.md FAIL_TO_PM — member du-lich.hr@xe.vn / du-lich.ceo@xe.vn UI login 201 OK but session cleared on GET /api/xbos/tenant-scope/group-member-units 403 via handleUnauthorizedResponse (xbosHttp.ts); workspace-meta tenantId=xevn 409 for member
exit_criteria: Member personas UI login → /command-center/hrm/employees persists token; no logout on business-scope 403; suppress or skip group-member-units for non-group CEO; fix workspace-meta tenant for member JWT; deploy :8088; ack READY_FOR_QA
evidence_path: docs/qa/evidence/p1-browser-e2e-hrm-wave-8088-r5-20260620.md
spec_ref: UF-HRM-09 · UF-HRM-13 · UC-HRM-SCOPE-02
```

## evidence_path

`docs/qa/evidence/p1-browser-e2e-hrm-wave-8088-r5-20260620.md`

## ack_status

**FAIL_TO_PM**

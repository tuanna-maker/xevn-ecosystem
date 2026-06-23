# P1-BROWSER-E2E-HRM-WAVE-8088-R6 — QA retest UF-HRM-09/13

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-BROWSER-E2E-HRM-WAVE-8088-R6` |
| **from_role** | `dev-fe` (`P1-HRM-MEMBER-SESSION-403-8088-01`) |
| **to_role** | `pm` |
| **executed_at** | 2026-06-20T16:05+07 |
| **portal** | http://14.225.217.232:8088/ |
| **rule** | U65 browser-only · no seed |
| **ack_status** | **PASS_TO_PM** |

## Executive summary

Post Dev-FE deploy (`P1-HRM-MEMBER-SESSION-403-8088-01`), browser U65 retest **PASS** for member personas **UF-HRM-09** and **UF-HRM-13**. Member login with `?redirect=/command-center/hrm/employees` → **201**, session **persists** despite `group-member-units` **403** (no JWT clear). `workspace-meta` uses **`tenantId=xe-du-lich`** → **200**. HRM embed loads **18** NV member scope. Group CEO smoke **PASS** — `group-member-units` **200**, `workspace-meta` `xevn/main` **200**, employees **1107** after F5.

**Wave 2 score:** **11/11 🟢** (9 carry + UF-HRM-09/13 promoted).

---

## Entry criteria

| Check | Result |
|-------|--------|
| PM deployed `P1-HRM-MEMBER-SESSION-403-8088-01` on `:8088` | **PASS** (bundle live — session fix observable) |
| Dev-FE evidence | [p1-hrm-member-session-403-8088-fe-20260620.md](./p1-hrm-member-session-403-8088-fe-20260620.md) |
| U65 no seed | **PASS** |

---

## UF-HRM-09 — Member HRBP scope (U28-R2)

| Step | Evidence |
|------|----------|
| Persona | `du-lich.hr@xe.vn` / `Xevn@2026` |
| URL | `/login?redirect=/command-center/hrm/employees` → React native fill → **Đăng nhập** |
| Network login | `POST /api/xbos/auth/login` → **201** `XBOS-AUTH-200` |
| Post-login URL | `/command-center/hrm/employees` (**not** `/login`) |
| Session | `xevn.portal.accessToken` **present** after 8s wait |
| workspace-meta | `GET .../workspace-meta?tenantId=xe-du-lich&companyId=main` → **200** (not `xevn` / not 409) |
| group-member-units | `GET .../group-member-units` → **403** · token **NOT** cleared (fix verified) |
| HRM embed | iframe `tenantId=xe-du-lich&companyId=main` · **«Danh sách nhân viên trong công ty - 18»** |
| F5 | Reload on `/command-center/hrm/employees` → token **present** · route **unchanged** |

**Verdict:** 🟢 **PASS**

**spec_ref:** UF-HRM-09 · U28-R2 · `ADR-HRM-RBAC-SCOPE-LADDER`

---

## UF-HRM-13 — Member CEO scope (UC-HRM-SCOPE-02)

| Step | Evidence |
|------|----------|
| Persona | `du-lich.ceo@xe.vn` / `Xevn@2026` |
| UI login | Same redirect pattern as UF-09 |
| Network login | `POST /api/xbos/auth/login` → **201** |
| Session | Token **persists**; no redirect to `/login` |
| workspace-meta | `tenantId=xe-du-lich&companyId=main` → **200** |
| group-member-units | **403** · session **retained** |
| HRM embed | **18** NV · iframe member scope |
| Scope negatives (browser fetch, logged-in) | `group-member-units` **403** · `GET /api/hrm/employees?company_id=holding` → **409** = **expected PASS** |

**Verdict:** 🟢 **PASS**

**spec_ref:** UF-HRM-13 · UC-HRM-SCOPE-02

---

## Group CEO smoke regression — `ceo@xe.vn`

| Step | Evidence |
|------|----------|
| Login | `POST /api/xbos/auth/login` → **201** |
| group-member-units | **200** (regression — group CEO still loads rollup units) |
| workspace-meta | `tenantId=xevn&companyId=main` → **200** |
| HRM embed | After F5: **«Danh sách nhân viên trong công ty - 1107»** |
| Token | **present** on HRM route |

**Verdict:** 🟢 **PASS** (smoke — no regression on R4/R5 carry)

---

## Gate table

| Gate | Result |
|------|--------|
| L0 `:8088` portal reachable | **PASS** |
| U65 no seed | **PASS** |
| UF-HRM-09 browser | **PASS** 🟢 |
| UF-HRM-13 browser | **PASS** 🟢 |
| Group CEO smoke | **PASS** 🟢 |
| Wave 2 **11/11 🟢** | **PASS** |

---

## Defect closure

| ID | Status | Notes |
|----|--------|-------|
| **D-HRM-MEMBER-SESSION-403** | **CLOSED** | 403 no longer clears JWT; member HRM route reachable |
| **D-HRM-WORKSPACE-META-409** | **CLOSED** | Member uses `xe-du-lich/main` → 200 |

**Residual (non-blocking):** `group-member-units` still **requested** for member (403) — acceptable per exit criteria «no JWT clear on 403»; optional FE optimization to skip call entirely.

---

## Wave 2 tally (web UFs)

| UF | R5 | R6 |
|----|----|----|
| UF-HRM-01..08 | 🟢 carry | 🟢 carry |
| UF-HRM-09 | 🔴 | **🟢** |
| UF-HRM-10..12 | 🟢 carry | 🟢 carry |
| UF-HRM-13 | 🔴 | **🟢** |
| UF-HRM-07/08 mobile | ⚪ N/A | ⚪ N/A |

**Score:** **11/11 🟢** web (2 mobile ⚪ out of scope)

---

## completion_report

- **Closed:** UF-HRM-09 + UF-HRM-13 browser U65 on `:8088`; D-HRM-MEMBER-SESSION-403 + D-HRM-WORKSPACE-META-409; Wave 2 **11/11 🟢**; group CEO smoke **1107** NV + GMU **200** regression intact.
- **Open:** None P0 in scope. Optional: suppress redundant `group-member-units` fetch for member (cosmetic).

## next_owner

`pm` → dispatch **`qc`** for `P1-BROWSER-E2E-QC-FINAL-R3-8088` full combined Track A+B GO re-gate.

## next_dispatch_prompt

```
Role: qc
work_item_id: P1-BROWSER-E2E-QC-FINAL-R3-8088
from_role: qa
to_role: qc
priority: P0
entry_criteria: docs/qa/evidence/p1-browser-e2e-hrm-wave-8088-r6-20260620.md PASS_TO_PM — Wave 2 HRM web 11/11 🟢; UF-HRM-09/13 member session fix verified; XBOS Wave 1 15/15 per prior QC close
exit_criteria: Audit R6 evidence + matrix §4 all web UFs 🟢; issue GO for combined sponsor nghiệm thu :8088 Track A+B or document residual; update p1-browser-e2e-qc-final-r3-8088-20260620.md; ack PASS_TO_PM
evidence_path: docs/qa/evidence/p1-browser-e2e-qc-final-r3-8088-20260620.md
spec_ref: USER_FLOW_OPERABILITY_MATRIX.md §3–§4 · business-flow-zero-defect-gate L2.5
```

## evidence_path

`docs/qa/evidence/p1-browser-e2e-hrm-wave-8088-r6-20260620.md`

## ack_status

**PASS_TO_PM**

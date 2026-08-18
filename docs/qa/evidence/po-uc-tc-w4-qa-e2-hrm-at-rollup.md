# Evidence rollup — `PO-UC-TC-W4-QA-E2-HRM-AT`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-UC-TC-W4-QA-E2-HRM-AT` |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **date** | 2026-08-04 |
| **lane** | execution |
| **priority** | P0 |
| **ack_status** | **PASS_TO_PM** |
| **seat_verdict** | **PASS_PARTIAL** (AT-07 closed R2 2026-08-04; AT-12 L1 OPEN; AT-01 PARTIAL) |
| **r2_evidence** | [`po-uc-tc-w4-qa-e2-hrm-at-r2.md`](po-uc-tc-w4-qa-e2-hrm-at-r2.md) — AT-07 PASS · JWT CLOSED |
| **U65** | honored — zero-seed · no invent Leave L2 PASS |
| **U76** | `hdsd_align: true` |
| **TRAINING** | §8 checklist |
| **DOMAIN** | §4.2 Leave L2 SPEC_GAP · §4.3 ATT `x-company-id` |
| **raw** | [`_tmp-po-uc-tc-w4-qa-e2-hrm-at-browser.json`](_tmp-po-uc-tc-w4-qa-e2-hrm-at-browser.json) |
| **screens** | `docs/qa/evidence/screens/po-uc-tc-w4-qa-e2-hrm-at/` |
| **harness** | `scripts/qa/_tmp-po-uc-tc-w4-qa-e2-hrm-at.mjs` |
| **env (run)** | portal `:5173` · hrm `:28001` · xbos `:28002` · persona `ceo@xe.vn` |
| **uat_done** | **false** — không claim Phase1 DONE |

---

## Executive verdict

Browser U65 seat E2 (HRM ATT/Leave P0) trên portal/HRM embed:

| UC | Verdict | Note |
|----|---------|------|
| **HRM-AT-01** | **PARTIAL** | OPEN/list GET records 200 + mount; POST `/attendance/records` mutate chưa chốt clock-in UI path |
| **HRM-AT-04** | **PASS** | HDSD Quản lý đơn → Đề nghị cập nhật công → Thêm mới · POST **201** `HRM-ATT-REQ-201` · ISO time wire · F5 STAMP UI |
| **HRM-AT-07** | **PASS** (R2) | Eye→Duyệt POST approve **201** `HRM-ATT-REQ-203` · `x-company-id=trsport` · toast + F5 Đã duyệt — evidence R2 |
| **HRM-AT-10** | **PASS** | Tạo đơn nghỉ FE · POST **201** `HRM-LEAVE-201` · FD empty no POST |
| **HRM-AT-11** | **PASS** | List GET leave-requests **200** `HRM-LEAVE-200` · rows>0 · tab Nghỉ phép |
| **HRM-AT-13** | **PASS** | Từ chối FE · POST **201** `HRM-LEAVE-204` · `x-company-id=main` |
| **HRM-AT-12** | **PASS L1** (R4) · L2 SPEC_GAP | QL `uat.nv0002` · POST approve **201** `HRM-LEAVE-203` · `x-company-id=trsport` · F5 Đã duyệt — evidence R4 · L2 **not PASS** |

**promoted (this seat + R2 + R4):** AT-04 · AT-07 · AT-10 · AT-11 · AT-12 L1 · AT-13  
**not promoted:** AT-01 (mutate) · AT-12 L2  
**Leave L2:** SPEC_GAP inventory — **not PASS**  
**CLOSED residuals:** `R-W4-STACK-JWT-PARITY` · `R-W4-AT07-APPROVE` · `R-W4-AT12-L1-APPROVE-SCOPE`  
**CLOSED residuals (R5b):** `R-W4-AT12-L1-CREATE-CATALOG` · `R-W4-AT12-L1-CREATE-CATALOG-BE-PULL` — picker≥1 after holding→OU pull

---

## L0

| Check | Result |
|-------|--------|
| Initial run | HRM+XBOS+portal **200** |
| Late retest | **BLOCKED** — Postgres `:5432` + Docker Desktop down → hrm-api cannot boot; xbos recovered via `dist-test` |

---

## HDSD inventory (U76)

| # | Surface | Found | Used |
|---|---------|-------|------|
| 1 | `/hr/attendance?portal=1` | Yes | AT-01 mount |
| 2 | Chấm công → Bản ghi / records GET | Yes | AT-01 OPEN |
| 3 | Quản lý đơn → Đề nghị cập nhật công | Yes | AT-04/07 |
| 4 | + Thêm đề nghị → Thêm mới | Yes | AT-04 HP |
| 5 | Nghỉ phép tab | Yes | AT-10..13 |
| 6 | Chờ duyệt · Từ chối / Duyệt | Yes (list) | AT-13 PASS · AT-12 L1 miss |

---

## P0 TC evidence (summary)

### HRM-AT-04 (EVIDENCED)
- Persona: `ceo@xe.vn` · `companyId=trsport`
- Click: Thêm đề nghị → fill NV/date/reason STAMP → Thêm mới
- Network: POST `/api/hrm/attendance/update-requests` **201** `HRM-ATT-REQ-201`
- Time wire: `requested_*` ISO `T` · `bareHhmm=false`
- F5: STAMP visible on list

### HRM-AT-07 (FAIL this seat)
- Attempt: mgr inject / Eye path — landed Overview once; CEO Eye→Duyệt fix in harness **not re-run** (DB down)
- Network approve: **missing** in raw JSON
- Residual: `R-W4-AT07-APPROVE` P0
- Cross-ref prior: `u78-u84-primary-att-adj-tmdv-01-r2.md` (mgr Duyệt + `x-company-id=trsport` **201**) — **không** substitute as W4 E2 PASS

### HRM-AT-10 / 11 / 13 (EVIDENCED)
- AT-11: GET leave-requests **200** · 35 rows
- AT-10: POST leave **201** `HRM-LEAVE-201` · FD empty blocked
- AT-13: Reject **201** `HRM-LEAVE-204` · header `x-company-id=main`

### HRM-AT-12 (LOCK)
- L2 ladder: **SPEC_GAP** (DOMAIN §4.2 / FR-H03) — step `at12_l2_ladder` = SPEC_GAP
- L1 Duyệt: not 2xx this seat → **BLOCKED** (not invent PASS)

### HRM-AT-01 (PARTIAL)
- Mount + GET `/attendance/records` 200
- Clock-in / POST records mutate: not completed

---

## Residuals → PM dispatch

| ID | Sev | Owner | Note |
|----|-----|-------|------|
| **R-W4-AT07-APPROVE** | P0 | — | **CLOSED** R2 — approve 201 + `x-company-id=trsport` |
| **R-W4-STACK-JWT-PARITY** | P0 ops | — | **CLOSED** R2 — employees 200 + AT-07 path |
| **R-W4-AT01-RECORDS-MUTATE** | P1 | **qa** | AT-01 ACT POST records từ FE clock path |
| **R-W4-AT12-L1** | P1 | — | **CLOSED** as CEO false-path — BA EXPECTED_NO_CTA; L1 proven R4 with QL |
| **R-W4-AT12-L1-APPROVE-SCOPE** | P0 | — | **CLOSED** R4 — leave approve `x-company-id=trsport` |
| **R-W4-AT12-L1-CREATE-CATALOG** | P1 | — | **CLOSED** R5b — FE OU sync + BE holding→OU pull · picker 4 |
| **R-W4-AT12-L1-CREATE-CATALOG-BE-PULL** | P1 | — | **CLOSED** R5b — pulledKeys=74 incl leave_types |
| **R-W4-STACK-DB** | P0 ops | **devops** | Historical mid-seat Postgres note — SoT DB remote `:6432` (do not reopen AT-07) |

---

## Claims / non-claims

| Claim | Status |
|-------|--------|
| U65 zero-seed | Yes |
| Leave L2 PASS | **No** — SPEC_GAP |
| Phase1 DONE / uat_done | **No** |
| Seat E2 all P0 PASS | **No** |

---

## Handoff

```
ack_status: PASS_TO_PM
work_item_id: PO-UC-TC-W4-QA-E2-HRM-AT
evidence_path: docs/qa/evidence/po-uc-tc-w4-qa-e2-hrm-at-rollup.md
next_owner: pm
```

### next_dispatch_prompt

```text
work_item_id: PO-UC-TC-W4-QA-E2-HRM-AT-R1
from_role: pm
to_role: devops + qa
priority: P0
lane: execution

1) devops: restore L0 — Docker Desktop + Postgres :5432 + hrm-api :28001 + xbos-api :28002 + portal :5173.
   evidence: docs/qa/evidence/po-uc-tc-w4-stack-restore-01.md
   cấm seed.

2) Same session → Task qa retest AT-07 + AT-12 L1 only:
   harness: scripts/qa/_tmp-po-uc-tc-w4-qa-e2-hrm-at.mjs
   entry: L0 PASS; U65; HDSD Quản lý đơn → Đề nghị cập nhật công → Eye → Duyệt; Network POST approve 2xx + x-company-id (NOTE-ATT-SCOPE).
   Leave: Chờ duyệt → Duyệt L1 on FE-created pending; L2 = SPEC_GAP (cấm invent PASS).
   evidence_path: docs/qa/evidence/po-uc-tc-w4-qa-e2-hrm-at-r1.md
   exit: AT-07 PASS or FAIL with product residual → dev-fe; update by-uc execution; PASS_TO_PM.
```

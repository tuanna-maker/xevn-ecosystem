# PO-UC-TC-W4-QA-E1-XBOS — Rollup (XBOS CC/WF spine)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-UC-TC-W4-QA-E1-XBOS` |
| **role** | qa |
| **executed_at** | 2026-08-04 |
| **plan** | `docs/program/PO_UC_TC_W4_EXEC_PLAN.md` § W4-A E1 |
| **locks** | U65 zero-seed · U76 HDSD · U78 test-log · **uat_done: false** · không invent Phase1 DONE |
| **env** | portal `http://127.0.0.1:5173` · hrm `:28001` · xbos `:28002` · commit `dc930c5` |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · AU `du-lich.ceo@xe.vn` |
| **machine_log** | `docs/qa/evidence/_tmp-po-uc-tc-w4-qa-e1-xbos-browser.json` |
| **screens** | `docs/qa/evidence/screens/po-uc-tc-w4-qa-e1-xbos/` |
| **ack_status** | **PASS_TO_PM** |

---

## L0

| Check | Result |
|-------|--------|
| `GET /api/hrm` | **200** |
| `GET /api/xbos` | **200** |
| portal `:5173` | **200** |

`pnpm run qc:dev-stack` — HRM+XBOS+portal healthy (Node UV exit noise ignored).

---

## HDSD inventory (U76)

1. Login portal (`ceo@xe.vn`)
2. Command Center landing (widgets VI)
3. Cài đặt → Đơn vị thành viên → TẬP ĐOÀN → Danh sách Cổ đông → + Thêm cổ đông → Lưu
4. Cài đặt → Phòng/Ban pháp nhân → Thêm dòng → Lưu dòng → F5
5. `/command-center/inbox` / Hộp thư — mở card chi tiết
6. Đơn vị thành viên → Chỉnh sửa member → Nhiệm vụ & RACI → Ma trận RACI
7. Cài đặt → Quy trình (`?settings=workflow`) → mở designer
8. AU API/browser persona `du-lich.ceo@xe.vn`

**Cấm đã tuân:** không `pnpm seed:*` · không API seed inbox · không claim UAT/Phase1 DONE.

---

## Completion table — 6 UC (P0)

| UC | execution | P0 HP | P0 FD | P0 AU | Note |
|----|-----------|-------|-------|-------|------|
| `UC-XBOS-AUTH-01` | **PASS** | LOGIN+NAV 🟢 | empty HTML5 + bad pwd `XBOS-AUTH-401` 🟢 | N/A P1 | R2 cleared LoginPage defaults |
| `UC-CC-P0-01` | **PARTIAL** | LIST+ADD 201 `XBOS-SHR-201`+F5 🟢 | ADD empty FE block 🟢 | member POST holding **409** 🟢 | VAL %sum>100 spot not full |
| `UC-CC-P0-03` | **FAIL→FD CLOSED** | TREE+ADD/EDIT/DEL 🟢 | empty → **400 VAL-014** 🟢 (retest) | member POST **409** 🟢 | `R-W4E1-DEPT-EMPTY-201` CLOSED · `po-uc-tc-w4-qa-dept-val-ret-01.md` |
| `UC-CC-P0-06` | **PARTIAL** | LIST 46 cards + DET 200 🟢 | — | member tasks `XBOS-WF-203` 🟢 | Approve/reject/L2/self not forced without FE-spawn stamp |
| `UC-RACI-02` | **PASS** | LOAD 200 + PUT cell `XBOS-RACI-201`+F5 🟢 | missing `activity_id` **400** `XBOS-VAL-001` 🟢 | PUT `main` **409** 🟢 | Member LE RACI tab |
| `UC-XBOS-CC-06` | **PARTIAL** | OPEN defs 200 + canvas UI 🟢 | save/L2 deep not closed | member create **409** 🟢 | Save button / 2-level / self-approve depth residual |

**Seat tally:** PASS 2 · PARTIAL 3 · FAIL 1 · BLOCKED 0 (UC-level).

---

## U78 test execution log (IEEE-style)

| Field | Value |
|-------|--------|
| **log_id** | `TEL-PO-UC-TC-W4-QA-E1-XBOS` |
| **tester** | qa · browser Playwright |
| **started_at** | 2026-08-04T02:11:29Z |
| **ended_at** | 2026-08-04T02:14:29Z |
| **hdsd_sot** | by-uc P0 steps + UF-XBOS-01/05/07/08/12 |
| **spec_ref** | by-uc `UC-XBOS-AUTH-01` … `UC-XBOS-CC-06` |

### Chronological (summary)

| seq | action (HDSD) | expected | actual | network | result |
|-----|---------------|----------|--------|---------|--------|
| 1 | L0 health | 200×3 | hrm/xbos/portal 200 | — | pass |
| 2 | Login clear → empty submit | FE/HTML5 block | `required` · 0 login call | — | pass |
| 3 | Sai mật khẩu | 401 | `XBOS-AUTH-401` · stay `/login` | POST login 401 | pass |
| 4 | Login CEO | CC | `XBOS-AUTH-200` · widgets VI | POST login 201 | pass |
| 5 | TẬP ĐOÀN + Thêm cổ đông | 201+F5 | `QA SHR W4E1-E0V18J` sticky | POST shareholders **201** `XBOS-SHR-201` | pass |
| 6 | Member POST holding SHR | 403/409 | **409** `SCOPE_CONTEXT_MISMATCH` | POST | pass |
| 7 | Phòng/Ban empty Lưu | 4xx/FE block | **POST 201** `XBOS-ORG-201` | POST org-units 201 | **fail** |
| 8 | Thêm PB mã/tên + F5 | 201 sticky | `QA-DEPT-W4E1R2-0YB4V` · edit 200 · del 200 | POST/PUT/DEL | pass |
| 9 | Inbox mở card | list+detail | 46 cards · detail 200 | GET tasks/detail | pass / approve deferred |
| 10 | RACI cell I→R + F5 | PUT 201 sticky | letter **R** sticky | PUT matrix/cell **200** `XBOS-RACI-201` | pass |
| 11 | Workflow open | canvas/defs | defs 200 · designer open | GET definitions 200 | pass / save depth partial |

### Incidents

| id | severity | expected | actual | residual WI |
|----|----------|----------|--------|-------------|
| `R-W4E1-DEPT-EMPTY-201` | P0 | Empty mã/tên → 4xx or FE block | **CLOSED 2026-08-04** — retest POST **400** `XBOS-VAL-014` + HP 201+F5 · `po-uc-tc-w4-qa-dept-val-ret-01.md` | `PO-UC-TC-W4-QA-DEPT-VAL-RET-01` ✅ |
| `R-W4E1-INB-SPAWN` | P1 | Approve/reject/L2/self from FE-spawned task | Cards exist; mutate not claimed without this-wave stamp | `PO-UC-TC-W4-QA-E1-INB-SPAWN` (after CC-06 save/spawn or business FE submit) |
| `R-W4E1-CV-DEPTH` | P1 | Canvas Lưu + 2-level + self-approve FD | Open OK; save control / L2 not closed | `PO-UC-TC-W4-QA-E1-CV-DEPTH` (+ dev-fe if control missing) |
| `R-W4E1-SHR-VAL` | P2 | % tổng >100 FD | Spot PARTIAL | optional retest |

---

## Evidence pointers

| Artifact | Path |
|----------|------|
| Runtime JSON | `docs/qa/evidence/_tmp-po-uc-tc-w4-qa-e1-xbos-browser.json` |
| Browser harness | `scripts/qa/_tmp-po-uc-tc-w4-qa-e1-xbos-browser.mjs` |
| R2 AUTH+DEPT | `scripts/qa/_tmp-po-uc-tc-w4-qa-e1-xbos-retest-auth-dept.mjs` |
| Screens | `docs/qa/evidence/screens/po-uc-tc-w4-qa-e1-xbos/` |
| by-uc stamps | `docs/qa/professional/by-uc/UC-XBOS-AUTH-01.md` … `UC-XBOS-CC-06.md` |

---

## pm_dispatch_hint

1. **P0 product:** `dev-be` — reject empty org-unit code/name (UC-CC-P0-03 FD).
2. **P1 chain:** after canvas/business FE spawn → qa retest inbox approve/reject/self (UC-CC-P0-06) + canvas L2 (UC-XBOS-CC-06).
3. Do **not** seed inbox to close P0-06.

---

## completion_report

| Closed | Open |
|--------|------|
| L0 PASS; AUTH-01 PASS; RACI-02 PASS; SHR mutate+F5+AU; DEPT happy-path CRUD+AU; Inbox list/detail; Canvas open+AU | **FAIL** DEPT empty-save 201; Inbox approve/L2/self; Canvas save/L2 depth; SHR VAL-% spot |
| by-uc execution stamped ×6 | `uat_done` remains **false** |

## next_owner

`pm` → dispatch **dev-be** (P0) then qa retest DEPT FD; chain inbox/canvas depth.

## next_dispatch_prompt

```text
work_item_id: PO-UC-TC-W4-DEV-BE-DEPT-VAL-01
from_role: pm
to_role: dev-be
lane: execution
priority: P0
ack_status_target: READY_FOR_QA

CONTEXT: QA W4-E1 FAIL UC-CC-P0-03 FD — browser Lưu dòng phòng ban với mã/tên trống → POST /api/xbos/org-foundation/org-units 201 XBOS-ORG-201 (acceptedEmpty=true). HP ADD/EDIT/DEL/AU đã PASS.
spec_ref: docs/qa/professional/by-uc/UC-CC-P0-03.md · TC-CC-P0-03-DEPT-ADD-FD-001 · UF-XBOS-12
evidence: docs/qa/evidence/po-uc-tc-w4-qa-e1-xbos-rollup.md · residual R-W4E1-DEPT-EMPTY-201

MISSION:
1) BE (+ FE gate nếu cần): reject empty code/name deterministic 4xx (VAL) — không phá HP create với mã hợp lệ.
2) Jest org-foundation: empty → 4xx; valid → XBOS-ORG-201.
3) CODE-MEMORY APPEND; must_keep soft-delete + scope parity.
4) READY_FOR_QA + next_dispatch_prompt qa retest TC-CC-P0-03-DEPT-ADD-FD-001 U65 browser.

CẤM: seed · đổi contract HP happy path · claim UAT DONE
allowed_paths: apps/api/xbos-api/src/org-foundation/** · optional FE dept validate in CommandCenterPage submitDepartmentRow
```

## ack_status

**PASS_TO_PM**

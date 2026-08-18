# Evidence — W1-B-01-QA-LEAVE

| Field | Value |
|-------|--------|
| **work_item_id** | `W1-B-01-QA-LEAVE` |
| **slice** | `docs/program/slices/DOC-ENT-P0-HRM-LEAVE.md` |
| **prior handoff** | `docs/qa/evidence/team-claude-w1b-01-leave.md` (`READY_FOR_QA`) |
| **executor** | qa |
| **date** | 2026-08-03 |
| **env** | local NFD workspace · U65 zero-seed |
| **ack_status** | `PASS_TO_PM` |

## spec_read_ack

- prior: `team-claude-w1b-01-leave.md` (Cursor backup leave wave)
- slice: `DOC-ENT-P0-HRM-LEAVE.md` · DoD display-ready + jest
- api_contract: `API_CONTRACT_NEW.md` §4.1–4.5 (leave-balance, create, list, approve, reject)

## 1. Jest retest (mandatory)

```text
pnpm --filter hrm-api exec jest src/attendance/leave-requests.service.spec.ts src/attendance/leave-balance.service.spec.ts --no-cache
→ Test Suites: 2 passed, 2 total
→ Tests:       33 passed, 33 total
→ Time:        ~7.8s
→ exit: 0
```

W1-B-01 cases observed in suite (all green via suite pass):

| Case | Assert |
|------|--------|
| create + list display-ready | `status_label` / `leave_type_label` / `employee_display_name` / `total_days_number` |
| approve settle pending→used | display-ready `Đã duyệt` |
| sick ≥3 no attach | `HRM-LEAVE-VAL-ATT` |
| reject release pending | display-ready `Từ chối` |

## 2. L1 smoke (optional — stack)

| Probe | Result |
|-------|--------|
| `GET http://127.0.0.1:28001/api/hrm/health` | **DOWN** — connection refused |
| `GET http://127.0.0.1:28002/api/xbos/health` | **DOWN** — connection refused |
| GET leave-balance as `ceo@xe.vn` | **SKIPPED** (stack down) |
| GET leave-requests list as `ceo@xe.vn` | **SKIPPED** (stack down) |

U65: no seed attempted. Live auth smoke deferred until `hrm-api` up — **not** a product FAIL for this BE-unit wave.

## 3. Display-ready path verification (code + contract)

| Field / behavior | Path | Verdict |
|------------------|------|---------|
| `status_label` | `toLeaveDisplayRow` · `leave-requests.service.ts` | ✅ present |
| `leave_type_label` (request) | same mapper | ✅ present |
| `employee_display_name` | name → code → id fallback | ✅ present |
| `total_days_number` | numeric bind | ✅ present |
| Balance `leave_type_label` + `source` | `mapBalancePayload` · `leave-balance.service.ts` | ✅ present |
| Pending lock / settle / release | `lockPendingLeaveBalance` / `settleApprovedLeaveBalance` / `releasePendingLeaveBalance` | ✅ wired create/approve/reject |
| Sick ≥3 attachment | `HRM-LEAVE-VAL-ATT` | ✅ enforced |
| Scope list filter | existing workforce scope tests green | ✅ must_keep |

Contract §4 success codes (`HRM-LEAVE-BAL-200` / `201` / `200` / `203` / `204`) — unit path covered; live HTTP not exercised (stack down).

## 4. Residual carry (not blocking this WI)

| ID | Sev | Note | Owner |
|----|-----|------|-------|
| R-LEAVE-WF-FULL | P2 | Soft WF bridge only — full XBOS HTTP spawn follow-up | dev-be (defer) |
| R-MASTER-KEYS | P1 workspace | `hrm-settings-master-keys.ts` missing — separate WI | PM |
| R-QA-BROWSER | P2 wave | Browser UF leave not in BE slice DoD; L1 live skipped stack-down | qa later if PM opens UF |

## Verdict matrix

| Gate | Result |
|------|--------|
| Jest leave 33/33 | 🟢 PASS |
| Display-ready code path | 🟢 PASS |
| API_CONTRACT §4 balance lock/settle/release + sick attach | 🟢 PASS (unit) |
| L1 live ceo smoke | ⬜ SKIP stack down |
| Seed | 🟢 none |

**Overall:** `PASS_TO_PM`

## completion_report

**Closed:** Retest leave after Cursor backup — jest 33/33 exit 0; display-ready fields verified on request + balance mappers; §4 pending lock/settle/release + sick≥3 covered by suite; evidence this file; U65 no seed.

**Open / residual:** Live L1 smoke skipped (hrm/xbos down); R-LEAVE-WF-FULL P2; R-MASTER-KEYS workspace P1; browser UF out of slice.

## next_owner

`pm` — dispatch EMP then AUTH waves.

## next_dispatch_prompt

```text
work_item_id: W1-B-02-TC-EMP
slice: docs/program/slices/DOC-ENT-P0-HRM-EMP.md
role: Team Claude / Cursor backup dev-be
mission: Employees list/detail display-ready + scope parity list↔get-by-id; CODE-MEMORY; jest; evidence docs/qa/evidence/team-claude-w1b-02-emp.md
entry: W1-B-01-QA-LEAVE PASS_TO_PM (docs/qa/evidence/w1b-01-qa-leave.md) · jest leave 33/33 green
exit: draft_ready_for_cursor_review or READY_FOR_QA; no seed; NFD only
follow: after EMP READY_FOR_QA → W1-B AUTH slice (DOC-ENT-P0-AUTH-M01) per program packet
```

---

`ack_status: PASS_TO_PM`  
`evidence_path: docs/qa/evidence/w1b-01-qa-leave.md`  
`next_owner: pm`

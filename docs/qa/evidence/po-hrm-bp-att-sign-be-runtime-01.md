# Evidence — PO-HRM-BP-ATT-SIGN-BE-RUNTIME-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-BP-ATT-SIGN-BE-RUNTIME-01` |
| **from_role** | dev-be |
| **to_role** | qa |
| **date** | 2026-08-05 |
| **lane** | execution · UF-HRM-ATT-SIGN · P0 runtime unblock |
| **prior** | `po-hrm-bp-att-sign-qa-03.md` FAIL_TO_PM (POST submit/GET signatures **404** on `:28001`) |
| **ack_status** | **READY_FOR_QA** |
| **u65_zero_seed** | true — no `pnpm seed:*`; smoke uses login + existing list rows only |
| **attendance_closed** | **false** |
| **product_go** | **false** |

---

## Root cause (confirmed)

| Symptom | Cause |
|---------|--------|
| `Cannot POST/GET` **404** on submit/signatures | Stale `hrm-api` process on `:28001` — routes in source but not in running Nest |
| `start:dev` blocked | **TS2345** `attendance-sheet-scope.ts:33` — `unknown` passed to `assertResourceInHrmScope` |

---

## Fix summary

| Change | Path |
|--------|------|
| Narrow `unknown` → scope resource before `assertResourceInHrmScope` | `apps/api/hrm-api/src/attendance/attendance-sheet-scope.ts` |
| Controller spec arity (listRecords headers) | `apps/api/hrm-api/src/attendance/attendance.controller.spec.ts` |
| Rebuild + restart live API | `pnpm run build` · `HRM_BE_PORT=28001` · `pnpm run start:prod` |

**must_keep:** `assertAttendanceSheetHeaderInScope` · SP-ATT-SIGN-01..04 · no fake 200 / no seed.

---

## Verify — jest

```bash
cd apps/api/hrm-api
pnpm exec jest src/attendance/attendance-sheet-scope-parity.spec.ts src/attendance/attendance.controller.spec.ts
```

| Result | Exit |
|--------|------|
| 2026-08-05 | **0** — 27 tests PASS |

---

## Verify — build

```bash
cd apps/api/hrm-api
pnpm run build
```

| Result | Exit |
|--------|------|
| 2026-08-05 | **0** |

---

## Verify — runtime route registration

Nest boot log (PID after restart) includes:

- `Mapped {/api/hrm/attendance/attendance-sheets/:sheetId/signatures, GET}`
- `Mapped {/api/hrm/attendance/attendance-sheets/:sheetId/submit, POST}`
- `Mapped {/api/hrm/attendance/attendance-sheets/:sheetId/signatures, POST}`
- `Mapped {/api/hrm/attendance/attendance-sheets/:sheetId/close, POST}` · `…/reopen, POST`

---

## Verify — curl smoke (direct `:28001`)

**Persona:** `ceo@xe.vn` / `Xevn@2026` · login via `:28002` · `company_id=main` · `x-tenant-id=xevn`

| Call | HTTP | Notes |
|------|------|--------|
| `GET …/attendance-sheets?company_id=main` | **200** | `total=2` |
| `GET …/642a4713-…/signatures?company_id=main` | **200** | `HRM-ATT-SIGN-200` · not **404** |
| `POST …/642a4713-…/submit?company_id=main` | **201** | `HRM-AS-200` · `status=submitted` · not **404** |

Script: `scripts/qa/_tmp-po-hrm-bp-att-sign-be-runtime-01-smoke.mjs`

**QA note:** Smoke POST submit moved sheet `642a4713-b0ee-4802-a1d9-2fe650cbc17f` to **submitted**; use draft row `3934591a-50ec-452b-940f-7f29ede50272` for full UF **Gửi chờ ký** retest if needed.

---

## completion_report

**Closed:** TS compile blocker on scope gate; fresh `hrm-api` on `:28001` serves submit/signatures/close/reopen; jest SP-ATT-SIGN + controller green; direct API smoke not 404.

**Open for QA:** Browser UF-HRM-ATT-SIGN chain (submit → panel ký → ladder → close) on portal proxy — `PO-HRM-BP-ATT-SIGN-QA-04`.

---

## next_owner

`qa`

## next_dispatch_prompt

```text
ROLE: qa · work_item_id: PO-HRM-BP-ATT-SIGN-QA-04
entry: L0 PASS; hrm-api :28001 restarted (see po-hrm-bp-att-sign-be-runtime-01.md); U65 browser-only
exit: UF-HRM-ATT-SIGN · J-HRM-06c — draft → Gửi chờ ký POST 2xx → GET signatures → sign ladder → close; F5; evidence po-hrm-bp-att-sign-qa-04.md
persona: ceo@xe.vn · http://127.0.0.1:5173/hr/attendance?portal=1&tenantId=xevn&companyId=main
draft sheet hint: 3934591a-50ec-452b-940f-7f29ede50272 if 642a… already submitted from BE smoke
cấm: seed · API-only PASS without FE mutate
ack: PASS_TO_PM or FAIL_TO_PM
```

---

## pm_dispatch_hint

`PO-HRM-BP-ATT-SIGN-QA-04` — retest submit/sign after runtime fix.

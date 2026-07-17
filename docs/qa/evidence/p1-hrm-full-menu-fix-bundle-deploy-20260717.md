# P1-HRM-FULL-MENU-FIX-BUNDLE-DEPLOY-01 — DevOps deploy evidence

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-HRM-FULL-MENU-FIX-BUNDLE-DEPLOY-01` |
| **date** | 2026-07-17 |
| **owner** | devops |
| **target** | `http://14.225.217.232:8088` |
| **U65** | zero-seed — **no** `pnpm seed:*` / inbox seed / DB fake |
| **ack_status** | **READY_FOR_QA** |

---

## Commits deployed

| SHA | Message |
|-----|---------|
| `1814f49` | fix(hrm): server-paged Employees + embedScopeKey soft nav (`P1-HRM-SCALE-FE-W1`) |
| `ea6ea06` | fix(hrm): full-menu QA bundle for :8088 retest (`P1-HRM-FULL-MENU-FIX-BUNDLE`) |

**VPS HEAD:** `ea6ea06753a4d8cc637ae3486b13cb5bfe24b050` (`git pull origin main` fast-forward).

### Bundle work items included

1. **D-DASH-01** — `GET /employees/summary` before `:employeeId`
2. **D-HRM-ATT-LEAVE-FETCH-STORM** — leave/sheets React Query
3. **P1-HRM-MENU-QA-RECRUITMENT-FIX** — eval storm + PermissionGate + headcount
4. **D-HRM-INS-EMPTY-MASK-01** — insurance empty-mask + internal-services silent-empty
5. **D-P1-HRM-PAY-I18N-STATUS-01** — payslip status header i18n
6. **P1-HRM-SCALE-BE-W1** — migration `0015` covering indexes + `ensureSchema`
7. **P1-HRM-SCALE-FE-W1** — server-paged Employees (prior commit)
8. **P1-HRM-MENU-QA-REPORTS-FIX** — reports overview fan-out cut + attendance reports rewrite + recon wire

Allow-list only — unrelated dirty lanes (xbos auth, leave-workflow, portal auth, decisions, …) **not** committed.

---

## Commands (VPS)

```bash
cd /opt/xevn-ecosystem
git pull origin main   # → ea6ea06
node scripts/merge-vps-port-env.mjs --apply-canonical
node scripts/migrate-apply.mjs hrm
# 0015_employees_list_order_covering_index.sql → status: applied

cd deploy/xevn-ecosystem
docker compose --env-file .env up -d --build --no-deps --force-recreate \
  hrm-be hrm-fe portal-fe
```

### Services recreated

| Container | Status after recreate |
|-----------|------------------------|
| `xevn-hrm-be-dev` | Up (healthy) `3001→3001` |
| `xevn-hrm-fe-dev` | Up `8080→8080` |
| `xevn-portal-fe-dev` | Up `8088→5173` |

Non-xevn containers left running (asms, viconnec, ytexa, hsbx, …). **No** `docker compose down`.

---

## Smoke results

| Check | Result |
|-------|--------|
| `GET http://14.225.217.232:8088/` | **200** |
| `GET http://127.0.0.1:8088/command-center` | **200** |
| `GET http://127.0.0.1:3001/api/hrm/` | **200** |
| Direct `GET /api/hrm/employees/summary?company_id=main` + `x-internal-api-key` | **200** `HRM-EMP-SUMMARY-200` (no uuid `"summary"` cast) |
| Portal proxy same summary (after brief rate cool-down) | **200** `HRM-EMP-SUMMARY-200` · `total=1107` · `active_count=1041` |
| Bind-mount sources present on containers | `employees.controller.ts` has `@Get('summary')`; Reports + leave hooks mtime Jul 17 02:21 |
| Seed used | **none** |

Note: first portal-proxy summary attempt hit `RATE-429` under concurrent probe traffic; retry → **200** with correct code. Route is not the old `:employeeId` uuid failure mode.

---

## Residual / QA scope

DevOps L0/deploy only. Browser U65 retest (QA) must cover:

- Dashboard / employees summary consumers (**D-DASH-01**)
- Attendance leave + sheets (**D-HRM-ATT-LEAVE-FETCH-STORM**)
- Recruitment (**P1-HRM-MENU-QA-RECRUITMENT-FIX**)
- Insurance + internal services (**D-HRM-INS-EMPTY-MASK-01**)
- Payroll payslip header «Trạng thái» (**D-P1-HRM-PAY-I18N-STATUS-01**)
- Employees scale W1 list/profile (**P1-HRM-SCALE-FE-W1** / BE indexes)
- **Báo cáo** AC from `docs/qa/evidence/p1-hrm-menu-reports-fix-20260717.md` next_dispatch_prompt

---

## Handoff

- `completion_report:` Allow-list commit `ea6ea06` (+ prior `1814f49`) pushed; VPS pull; migration `0015` applied; recreated `hrm-be`/`hrm-fe`/`portal-fe`; smoke portal 200 + summary `HRM-EMP-SUMMARY-200` on :8088 and :3001. U65 no seed.
- `next_owner:` **qa**
- `ack_status:` **READY_FOR_QA**
- `evidence_path:` `docs/qa/evidence/p1-hrm-full-menu-fix-bundle-deploy-20260717.md`

### next_dispatch_prompt

```text
work_item_id: P1-HRM-FULL-MENU-QA-RETEST-01
from_role: pm
to_role: qa
entry_criteria: DevOps READY_FOR_QA — VPS HEAD ea6ea06 on http://14.225.217.232:8088; evidence docs/qa/evidence/p1-hrm-full-menu-fix-bundle-deploy-20260717.md; U65 zero-seed browser-only
persona: ceo@xe.vn / Xevn@2026 · companyId=main
exit_criteria: Browser retest PASS (or FAIL with defect ids) for:
1) D-DASH-01 — dashboard / GET employees/summary not 500 uuid
2) D-HRM-ATT-LEAVE-FETCH-STORM — attendance leave + sheets no RATE-429 storm
3) P1-HRM-MENU-QA-RECRUITMENT-FIX — eval storm gone; PermissionGate; headcount mutate+F5
4) D-HRM-INS-EMPTY-MASK-01 — insurance + internal-services no silent empty on 429
5) D-P1-HRM-PAY-I18N-STATUS-01 — payslip column «Trạng thái»
6) P1-HRM-SCALE-FE-W1 / BE-W1 — employees ≤1 list GET page_size=50; profile no list fan-out
7) P1-HRM-MENU-QA-REPORTS-FIX — Báo cáo: no ReferenceError attendanceError; overview reconciliation draft/processed/closed via GET /payroll/reports/reconciliation; no payslips dump on overview; Biến động NS total ≈ overview (~1107 not ~95)
evidence_path: docs/qa/evidence/p1-hrm-full-menu-qa-retest-20260717.md (or per-menu updates)
ack_status: PASS_TO_PM or FAIL_TO_PM
cấm: seed / API mutate pretending FE
```

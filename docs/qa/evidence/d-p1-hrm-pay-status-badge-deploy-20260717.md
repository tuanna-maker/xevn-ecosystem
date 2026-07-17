# D-P1-HRM-PAY-STATUS-BADGE-DEPLOY (+ SET-ITEM-PERSIST) — DevOps deploy evidence

| Field | Value |
|-------|-------|
| **work_item_id** | `D-P1-HRM-PAY-STATUS-BADGE-DEPLOY` (+ fold `D-HRM-SET-ITEM-PERSIST-01`) |
| **date** | 2026-07-17 |
| **owner** | devops |
| **target** | `http://14.225.217.232:8088` |
| **U65** | zero-seed — **no** `pnpm seed:*` / inbox seed / DB fake for acceptance |
| **ack_status** | **READY_FOR_QA** |

---

## Scope folded this deploy

| Work item | Status on VPS |
|-----------|----------------|
| `D-P1-HRM-PAY-STATUS-BADGE-01` | **Live** — StatusBadge + `common.status.*` (vi/en) at `63915ed` / `a7df0db` |
| `D-HRM-SET-ITEM-PERSIST-01` | **Live** — `settings-catalogs` items create/update/delete → `resolveHrmSettingsCatalogCompanyId` (`main`→`holding`) |
| `P1-HRM-PROCESSES-FE-01` | **Already live** before this wave (`8967262`); still present after pull to `63915ed` |

---

## Commits deployed

| SHA | Message |
|-----|---------|
| `8967262` | fix(hrm): Processes menu honest read-only (`P1-HRM-PROCESSES-FE-01`) — already on VPS |
| `a7df0db` | StatusBadge + i18n + FE unit evidence (`D-P1-HRM-PAY-STATUS-BADGE-01`) |
| `63915ed` | fix(hrm): settings catalog items write to holding partition (`D-HRM-SET-ITEM-PERSIST-01`) |

**VPS HEAD:** `63915ed` (fast-forward `8967262` → `63915ed`).

### Allow-list (this wave commit + push)

**FE (already in `a7df0db`, pulled this session):**

- `apps/web/hrm/src/components/common/StatusBadge.tsx`
- `apps/web/hrm/src/components/common/status-badge.test.ts`
- `apps/web/hrm/src/i18n/locales/vi.json`
- `apps/web/hrm/src/i18n/locales/en.json`
- `docs/qa/evidence/d-p1-hrm-pay-status-badge-20260717.md`

**BE (`63915ed`):**

- `apps/api/hrm-api/src/settings-catalogs/settings-catalogs.controller.ts`
- `apps/api/hrm-api/src/settings-catalogs/settings-catalogs.controller.spec.ts`
- `apps/api/hrm-api/src/settings-catalogs/d-hrm-set-item-persist-01.spec.ts`
- `docs/qa/evidence/d-hrm-set-item-persist-01-20260717.md`

Unrelated dirty lanes (xbos auth, leave-workflow, portal session, …) **not** scooped.

---

## Commands (VPS)

```bash
cd /opt/xevn-ecosystem
git pull origin main   # → 63915ed
node scripts/merge-vps-port-env.mjs --apply-canonical

cd deploy/xevn-ecosystem
docker compose --env-file .env up -d --build --remove-orphans \
  hrm-be portal-fe hrm-fe
# note: compose also recreated xbos-be (dep) — healthy after up
```

### Services recreated / Up

| Container | Host port | Status after deploy |
|-----------|-----------|---------------------|
| `xevn-hrm-be-dev` | 3001 | Up (healthy) |
| `xevn-portal-fe-dev` | 8088 | Up |
| `xevn-hrm-fe-dev` | 8080 | Up |
| `xevn-xbos-be-dev` | 28002 | Up (healthy) — dep recreate |

Non-xevn containers (asms/ytexa/hsbx/…) remained Up — no `compose down`.

---

## Smoke gates

| Check | Result |
|-------|--------|
| `GET :8088/` | **200** |
| `GET :8088/command-center` | **200** |
| `GET :8080/` | **302** (SPA redirect OK) |
| `GET :3001/api/hrm/metrics` | **200** |
| Repo code live: `StatusBadge` `processed` | **present** (6 matches) |
| Repo code live: `resolveCatalogMutationCompanyId` | **present** (4 matches; also inside `xevn-hrm-be-dev`) |
| Nest `hrm-be` boot | **successfully started** |

### L1 partition smoke (U65 — API only, not UF 🟢)

Login `ceo@xe.vn` → `POST /api/hrm/settings-catalogs/items` with `company_id=main`, `category_key=activity_capability_map`, unique `item_key=DEVOPS*` → **201** `HRM-SET-201` → `GET /api/hrm/settings-catalogs` overview blob **contains** same `item_key` + `item_name`.

| Gate | Result |
|------|--------|
| POST items `main` visible on overview GET | **PASS** (`PARTITION_SMOKE_PASS`) |

No seed scripts used for acceptance. Smoke item left in DB (harmless extension row) — QA may use fresh key for UF-HRM-10.

---

## QA retest (copy-ready)

### A — Payroll StatusBadge (`D-P1-HRM-PAY-STATUS-BADGE-01`)

1. Login `ceo@xe.vn` · `companyId=main` → `/command-center/hrm/payroll`
2. Payslip list/detail: StatusBadge cells show **Đã xử lý** / **Nháp** / **Đã thanh toán** — **not** raw `processed`
3. Regression: employee directory still «Đang làm việc» / «Thử việc»

### B — Settings persist (`D-HRM-SET-ITEM-PERSIST-01` / UF-HRM-10)

1. `/command-center/hrm/settings-catalogs` (or `/hr/settings-catalogs`)
2. Thêm mục → Lưu → POST 201 → row on FE → **F5** still present
3. Edit ACM_* label → F5 shows new label

### C — Processes (optional AC-PROC — already deployed)

`/command-center/hrm/processes` — no Thêm/Sửa/Xóa success toast; honest empty / XBOS ref OK.

---

## Residual

| Item | Notes |
|------|-------|
| Orphan rows under `company_id=main` from pre-fix QA | Not migrated this wave; new writes go to `holding` |
| Full browser UF | DevOps L0/L1 only — QA owns L2.5 |

---

## Handoff packet

- `work_item_id:` `D-P1-HRM-PAY-STATUS-BADGE-DEPLOY` (+ `D-HRM-SET-ITEM-PERSIST-01`)
- `from_role:` `devops`
- `to_role:` `qa`
- `ack_status:` `READY_FOR_QA`
- `evidence_path:` `docs/qa/evidence/d-p1-hrm-pay-status-badge-deploy-20260717.md`
- `next_owner:` `qa`
- `completion_report:` VPS at `63915ed`. Recreated `hrm-be` + `portal-fe` + `hrm-fe`. Portal `:8088` 200. StatusBadge FE + settings items holding-partition BE live. Processes FE already live (`8967262`). Partition smoke POST items → overview HAS item PASS. U65 no seed for acceptance.
- `next_dispatch_prompt:` (see below)

### next_dispatch_prompt

```text
work_item_id: D-P1-HRM-PAY-STATUS-BADGE-01 + D-HRM-SET-ITEM-PERSIST-01
to_role: qa
entry_criteria: DevOps READY_FOR_QA — docs/qa/evidence/d-p1-hrm-pay-status-badge-deploy-20260717.md; VPS HEAD 63915ed; :8088 200.
exit_criteria (U65 browser-only):
1) Payroll StatusBadge cells Vietnamese («Đã xử lý» not raw processed).
2) UF-HRM-10 settings: Thêm mục → POST 201 → FE row → F5 still present; edit label → F5.
Optional: AC-PROC processes read-only already deployed.
cấm: seed · API-only PASS for UF.
evidence: docs/qa/evidence/d-p1-hrm-pay-status-badge-qa-*.md + d-hrm-set-item-persist-01-qa-retest-*.md
```

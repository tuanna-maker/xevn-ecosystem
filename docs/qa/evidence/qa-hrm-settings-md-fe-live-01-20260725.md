# QA-HRM-SETTINGS-MD-FE-LIVE-01 — Leave + Dept U65 browser live (post L0 restore)

| Field | Value |
|-------|--------|
| **Date** | 2026-07-25 |
| **Role** | qa |
| **work_item_id** | `QA-HRM-SETTINGS-MD-FE-LIVE-01` |
| **L0 entry** | `docs/qa/evidence/do-hrm-settings-md-l0-restore-01-20260725.md` — GET `/api/hrm` **200** |
| **Prior code** | `qa-hrm-settings-md-leave-01-20260725.md` · `qa-hrm-settings-md-dept-01-20260725.md` (UF live was BLOCKED) |
| **Merge** | Same leave/dept clicks as `QA-HRM-SETTINGS-MASTER-DATA-02` / **MASTER-DATA-03** — **no duplicate false PASS**; this WI closes L0-blocked live residual of FE-BATCH |
| **Env** | Portal `:5173` · HRM FE `:8080` · hrm-api `:28001` · xbos `:28002` · `ceo@xe.vn` · **U65 zero-seed** · **HOLD_DEPLOY** · **NOT** `:8088` / Phase1 / PROD |
| **Runner** | `scripts/qa/qa-hrm-settings-md-fe-live-01.mjs` |
| **Runtime** | `docs/qa/evidence/_tmp-qa-hrm-settings-md-fe-live-01-runtime.json` |
| **Overall** | **PASS** (exit criteria 1–2 met) · residual leave-request POST **400** (not UF 🟢 for leave *request*) |

---

## 0. L0 / stack (at evidence time)

| Check | Result |
|-------|--------|
| `GET :28001/api/hrm` | **200** |
| `GET :28002/api/xbos` | **200** |
| Portal `:5173` | **200** |
| HRM FE `:8080/hr/` | **200** |
| Seed | **not used** |
| Catalog baseline | `leave_types` ≥4 (`LVT_01..04` + prior QA codes) · `departments` ≥4 (`DEPT_01..04` + prior QA codes) |

**Note:** HRM Settings requires `?portal=1` (PermissionRoute bypass). URLs used: `/hr/settings|attendance|employees?portal=1&tenantId=xevn&companyId=main`.

---

## 1. Exit criteria

| # | Criterion | Verdict | Evidence |
|---|-----------|---------|----------|
| 1a | Leave empty catalog → amber CTA, **no 8 fake types** | **PASS** | Fresh page + GET intercept strip `leave_types` → create dialog amber + «Chưa có mục… / Mở Cài đặt»; `fake8=none` (no annual/sick/… options) |
| 1b | With catalog → create → Lưu → Network 2xx → F5 | **PASS** (Settings master-data) | Settings → Danh mục nghiệp vụ → Loại nghỉ → fill `#md-code-leaveTypes` / label → **Lưu** → `POST …/settings-catalogs/items` **201** → F5 code `QA_LVT_09XP3X` **visible** |
| 1c | LeaveTab picker SoT with catalog | **PASS** | Options show `LVT_*` / `QA_LVT_*` codes + labels; **no** `annual` fake bootstrap |
| 1d | Leave *request* create POST 2xx | **FAIL** residual | `POST …/attendance/leave-requests` → **400** (automation date/employee fill incomplete) — **not** claimed UF 🟢 for leave request |
| 2a | Dept empty → CTA | **PASS** | Empty intercept → Employee form amber + CTA |
| 2b | With catalog → persist **code** not label → F5 | **PASS** | Picker options `DEPT_01Nhân sự`… (`optionsHaveCode=true`, `labelOnlyFail=false`); trigger shows `DEPT_01`; `POST /employees` **201**; F5 reopen → options still code-backed |

### AC-SET-FS rollup (live)

| AC | Leave | Dept |
|----|-------|------|
| AC-SET-FS-01 | **PASS** | **PASS** |
| AC-SET-FS-03 | **PASS** (Settings item + picker value=code) | **PASS** (picker + employee create) |
| AC-SET-FS-05 | **PASS** | **PASS** |

---

## 2. Merge vs MASTER-DATA-02 / 03

| WI | Status | Relation |
|----|--------|----------|
| MASTER-DATA-02 | Script exists; earlier run empty CTA PASS, Settings selectors miss | Same click scope — **merged**, do not re-claim separate 🟢 |
| MASTER-DATA-03 | Bus: leave+dept create→201→F5 PASS | **Aligned** with this live run; FE-LIVE-01 = L0-restore confirmation of leave/dept consumer AC |
| FE-LIVE-01 (this) | Closes code-PASS / live-BLOCKED residual from FE-BATCH after L0 restore | Authoritative evidence path for this WI |

---

## 3. Residuals

| Residual | Severity | Owner |
|----------|----------|--------|
| Leave-request `POST` **400** under automation (Settings catalog create OK; picker SoT OK) | P2 | qa/dev-fe — manual or harden date/employee fill; **not** reopen empty-bootstrap FAIL |
| Portal shell `/command-center/hrm/settings` stayed on login redirect in smoke | P3 | optional — HRM `:8080?portal=1` path is SoT for this WI |
| Stack flaky (hrm/xbos/portal restart mid-wave; RQ `staleTime` 60s poisons empty intercept if same page) | ops note | devops — prefer fresh page for empty CTA after catalog tests |

---

## 4. What was NOT done

- No `pnpm seed:*` / invent catalog as SoT outside FE Settings CRUD
- No `:8088` / Phase1 / PROD claim
- No UF 🟢 for leave-*request* mutate (400)

---

## 5. Handoff

- **ack_status:** `PASS_TO_PM`
- **next_owner:** `pm` (QC already in flight for leave-dept via `QC-HRM-SETTINGS-MD-LEAVE-DEPT-01` — merge; do not duplicate false PASS)
- **evidence_path:** `docs/qa/evidence/qa-hrm-settings-md-fe-live-01-20260725.md`

### completion_report

**Closed:** U65 live after L0 restore — leave empty amber CTA (no 8 fakes); Settings leave type create **201** + F5; LeaveTab picker catalog SoT; dept empty CTA; dept picker **code** SoT + employee **201** + F5 code options. Merged with MASTER-DATA-02/03 click scope.

**Open residual:** leave-request POST **400** (not request UF 🟢); portal embed shell smoke FAIL (P3).

### next_dispatch_prompt

```
work_item_id: QC-HRM-SETTINGS-MD-LEAVE-DEPT-01 (or re-gate if already PASS)
role: qc
entry: QA FE-LIVE-01 + MASTER-DATA-03 evidence; U65; HOLD_DEPLOY
exit: GO/GWC leave+dept AC only; cite qa-hrm-settings-md-fe-live-01-20260725.md; do not require leave-request 2xx for Settings catalog SoT GO; residual P2 leave-request optional
evidence_path: docs/qa/evidence/qc-hrm-settings-md-leave-dept-01-20260725.md
```

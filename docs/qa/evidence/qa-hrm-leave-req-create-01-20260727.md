# QA-HRM-LEAVE-REQ-CREATE-01 — Leave request create UF (U65)

| Field | Value |
|-------|--------|
| **Date** | 2026-07-27 |
| **Role** | qa |
| **work_item_id** | `QA-HRM-LEAVE-REQ-CREATE-01` |
| **Prior residual** | `docs/qa/evidence/qa-hrm-settings-md-fe-live-01-20260725.md` §1d — POST leave-requests **400** (not Settings MD SoT) |
| **Env** | Portal `:5173` (smoke) · HRM FE `:8080?portal=1` · hrm-api `:28001` · xbos `:28002` · `ceo@xe.vn` |
| **Constraints** | **U65 zero-seed** · **HOLD_DEPLOY** · **NOT** `:8088` / Phase1 / PROD |
| **Runner** | `scripts/qa/qa-hrm-leave-req-create-01.mjs` |
| **Runtime** | `docs/qa/evidence/_tmp-qa-hrm-leave-req-create-01-runtime.json` |
| **Overall** | **PASS** (retest 2026-07-27 after BE) — prior FAIL superseded; see §7 |
| **Prior overall** | **FAIL** — create POST **400** `HRM-ATT-LEAVE-TYPE` (closed) |

---

## 0. L0 / stack

| Check | Result |
|-------|--------|
| `GET :28001/api/hrm` | **200** |
| `POST :28002/api/xbos/auth/login` | **200/201** (`ceo@xe.vn`) |
| Portal `:5173` | **200** (smoke after Vite restore) |
| HRM FE `:8080/hr/` | **200** |
| Seed | **not used** |

**Ops note (P3, not product):** `pnpm run dev:xbos-api` / `nest start --watch` can fail on missing/corrupt `dist` (Unicode OneDrive path). Worked after clean `nest build` + process already listening; portal needed `pnpm --filter web-portal install` (missing `vite`).

---

## 1. AC matrix

| # | Criterion | Verdict | Evidence |
|---|-----------|---------|----------|
| 1 | Login `ceo@xe.vn` | **PASS** | XBOS login → session inject (`xevn.portal.*`, `companyId=main`) |
| 2 | Attendance → create leave with catalog leave type → Lưu → Network **2xx** → F5 | **FAIL** | Dialog filled; catalog picker SoT `LVT_01`; submit fired; **POST 400**; F5 no new row |
| 3 | On FAIL: body + invalid fields + owner layer | **PASS** (process) | See §2–§3 — **not** Settings MD reopen |
| 4 | No seed | **PASS** | No `pnpm seed:*` |

### UF block (browser)

- **Persona / URL / click path:** `ceo@xe.vn` → `http://127.0.0.1:8080/hr/attendance?portal=1&tenantId=xevn&companyId=main` → tab **Nghỉ phép** → **Tạo yêu cầu nghỉ**
- **Trước mutate:** Leave tab ready; catalog picker options include `LVT_01`…`LVT_04` + `QA_LVT_*` (catalog SoT, no `annual` fake)
- **Action:** Employee typeahead → `PORTAL-GCEO` · Leave type → `LVT_01` Phép năm · Dates `12/11/2026`–`12/11/2026` (ViDateField keyboard) → **Gửi yêu cầu**
- **Network:** `POST /api/hrm/attendance/leave-requests` → **400**
- **FE sau 2xx:** N/A (no 2xx)
- **F5:** marker / new row **not** present; list GET **200**
- **Verdict:** 🔴
- **spec_ref:** TechSpec §14.5 FR-HRM-AT-10 / UC-HRM-10 · VAL-SET-MD-02 / BR-HRM-MD-01 · G-AT10-01 company_id TEXT
- **spec_gap:** none for Settings MD; leave-request create path has scope/partition bug vs catalog read

---

## 2. POST 400 body (authoritative)

```json
{
  "success": false,
  "code": "HRM-ATT-LEAVE-TYPE",
  "message": "leave_type 'LVT_01' is not in leave_types catalog (free-text SoT forbidden)",
  "timestamp": "2026-07-27T02:27:38.682Z"
}
```

**Invalid field (business):** `leave_type` = `LVT_01` (rejected by `assertCodeInEffectiveCatalog`)

**Request body (browser):**

```json
{
  "company_id": "10000000-0000-4000-8000-000000000001",
  "employee_id": "678b9cb2-c59a-4b1e-b257-ce93033ba2f3",
  "employee_code": "PORTAL-GCEO",
  "employee_name": "CEO Tập đoàn",
  "department": "CEO",
  "position": "CEO",
  "leave_type": "LVT_01",
  "start_date": "2026-11-12",
  "end_date": "2026-11-12",
  "total_days": 1,
  "handover_tasks": "QA-LEAVE-REQ-MS2LWTIR"
}
```

Notes:
- FE binds `company_id` from **employee.company_id** (holding **UUID**), not portal slug `main`/`holding`.
- Dates / employee / leave_type fill **succeeded** (closes prior FE-LIVE residual “automation date/employee fill incomplete” as root cause — product assert fails instead).

---

## 3. Root-cause diagnosis (L1 corroboration — not UF PASS)

| Probe | Result |
|-------|--------|
| `GET …/settings-catalogs?company_id=main\|holding\|UUID` | **200**, `leave_types` **6** active codes incl. `LVT_01` |
| `GET …/settings-catalogs/leave_types/items?company_id=UUID` | **200**, `LVT_01` status=`active` |
| Browser POST `company_id=UUID`, `leave_type=LVT_01` | **400** `HRM-ATT-LEAVE-TYPE` |
| API POST `company_id=main`, `leave_type=LVT_01` | Assert **passes**, then **500** `HRM-SYS-001` `invalid input syntax for type uuid: "holding"` |
| API POST `company_id=holding`, `leave_type=LVT_01` | Same **500** uuid cast on `"holding"` |

**Interpretation**

1. **P0 BE — catalog assert partition / scope:** Leave create calls `assertCodeInEffectiveCatalog` with `companyId` from `resolveHrmPersistCompanyIdText` (UUID kept). Settings catalog **reads** go through `resolveHrmSettingsCatalogCompanyId` (`main`→`holding`). FE picker shows `LVT_01` from overview/items, but create assert rejects the same code for UUID persist company_id. Controller `POST leave-requests` also does **not** pass `tenantId` into `createLeaveRequest` (unlike list/approve).
2. **P0 BE — G-AT10-01 TEXT regression:** After assert, slug persist `holding` hits SQL still expecting **uuid** (`invalid input syntax for type uuid: "holding"`). Must keep company_id TEXT ladder on leave_requests (and related balance queries).
3. **P1 FE (secondary):** Prefer POST `company_id` = operating slug (`main`/`holding`) per DTO/G-AT10-01, not employee UUID — but BE must still accept UUID or map via catalog resolver; do not reopen Settings MD.

**Not Settings MD:** Catalog SoT read + LeaveTab picker already 🟢 in FE-LIVE / MASTER-DATA-03. This WI is **attendance leave-request create** only.

---

## 4. L2.5

| J-* | Result |
|-----|--------|
| J-HRM-06 list→detail | **not retested** this WI (create mutate only); prior HTTPS residual packs PASS — do not claim regression |

---

## 5. Residuals

| Residual | Sev | Owner | Status |
|----------|-----|--------|--------|
| `POST leave-requests` 400 `HRM-ATT-LEAVE-TYPE` for `LVT_01` when FE sends holding UUID | **P0** | **dev-be** | **CLOSED** (§7 retest 201) |
| Slug `holding`/`main` create → 500 uuid cast | **P0** | **dev-be** | **CLOSED** (BE L1 + browser 201) |
| FE POST `company_id` from employee UUID vs slug | **P1** | **dev-fe** optional | open — not blocking UF |
| xbos `dist` / portal vite missing on cold start | **P3** | devops | unchanged |

---

## 6. Handoff (initial FAIL — historical)

- **ack_status:** `FAIL_TO_PM` → **superseded by §7 `PASS_TO_PM`**
- **next_owner:** was `dev-be` → now **`pm`**
- **evidence_path:** `docs/qa/evidence/qa-hrm-leave-req-create-01-20260727.md`
- **pm_dispatch_hint:** closed via `D-HRM-LEAVE-REQ-CREATE-BE-01` + §7 retest

### completion_report (initial — historical)

**Closed:** U65 browser leave-request create attempt on local stack; login + LeaveTab + catalog picker SoT + ViDate fill + submit Network capture. Prior FE-LIVE “incomplete automation fill” residual **superseded** — product returns **400** `HRM-ATT-LEAVE-TYPE` for catalog code `LVT_01` when `company_id` is holding UUID. Diagnostic matrix documents slug path **500** uuid cast (G-AT10-01). Zero seed. HOLD_DEPLOY.

**Open at time of FAIL:** UF create→2xx→F5 **not promoted** — later closed in §7.
### next_dispatch_prompt (superseded — see §7)

```
(superseded by §7 PASS_TO_PM after BE retest)
```

---

## 7. Retest after BE fix — `D-HRM-LEAVE-REQ-CREATE-BE-01` (2026-07-27)

| Field | Value |
|-------|--------|
| **Variant** | retest after BE READY_FOR_QA |
| **BE evidence** | `docs/qa/evidence/be-hrm-leave-req-create-01-20260727.md` |
| **Freeze** | `:28001` = `node … dist-uat-w6/main.js` PID 27096 · `FREEZE_UPDATE_NOTE` `D-HRM-LEAVE-REQ-CREATE-BE-01` @ 09:39+07 |
| **Runner** | `scripts/qa/qa-hrm-leave-req-create-01.mjs` (unique leave day + F5 → Danh sách yêu cầu) |
| **Runtime** | `docs/qa/evidence/_tmp-qa-hrm-leave-req-create-01-runtime.json` |
| **Screenshot** | `docs/qa/evidence/_tmp-qa-hrm-leave-req-create-01-f5.png` |
| **Seed** | **not used** |
| **Overall** | **PASS** |

### 7.0 L0 / freeze confirm

| Check | Result |
|-------|--------|
| `GET :28001/api/hrm` | **200** `HRM-HEALTH-200` |
| Process | `dist-uat-w6/main.js` (W6 freeze UPDATED for leave create) |
| Portal `:5173` | **200** smoke |
| HRM FE `:8080/hr/` | **200** |
| XBOS `:28002` | **200** |

### 7.1 AC matrix (retest)

| # | Criterion | Verdict | Evidence |
|---|-----------|---------|----------|
| 1 | Login `ceo@xe.vn` → Attendance → Nghỉ phép → Tạo yêu cầu | **PASS** | XBOS login + session inject · `:8080/hr/attendance?portal=1&companyId=main` · portal `:5173` smoke |
| 2 | Catalog `LVT_*` → Lưu/Gửi | **PASS** | Picker SoT `LVT_01` Phép năm · dates `13/12/2026` · marker `QA-LEAVE-REQ-MS2MQRJU` |
| 3 | Network **2xx** (not 400 LEAVE-TYPE / not 500 uuid) | **PASS** | `POST /api/hrm/attendance/leave-requests` → **201** `HRM-LEAVE-201` |
| 4 | FE row → F5 persists | **PASS** | After F5 → tab **Danh sách yêu cầu**: `CEO Tập đoàn` / `PORTAL-GCEO` / `Phép năm` / `13/12/2026` / Chờ duyệt · API list hit `id=1ab75d08-…` |
| 5 | Zero-seed · HOLD_DEPLOY · NOT Settings MD · NOT `:8088` | **PASS** | Constraints held |

### UF block (browser — retest)

- **Persona / URL / click path:** `ceo@xe.vn` → `http://127.0.0.1:8080/hr/attendance?portal=1&tenantId=xevn&companyId=main` → **Nghỉ phép** → **Tạo yêu cầu nghỉ** → fill → **Gửi yêu cầu** → F5 → **Danh sách yêu cầu**
- **Trước mutate:** Catalog options `LVT_01`…`LVT_04` + `QA_LVT_*`; pending KPI was rising across retest attempts (41→46)
- **Action:** Employee `PORTAL-GCEO` · Leave type `LVT_01` · Dates `13/12/2026`–`13/12/2026` · handover marker → **Gửi yêu cầu**
- **Network:** `POST /api/hrm/attendance/leave-requests` → **201** `HRM-LEAVE-201`
  - Request `company_id` still holding UUID `10000000-…-0001` (FE bind)
  - Response `company_id` persist TEXT **`holding`**; `leave_type=LVT_01`; `id=1ab75d08-35d0-4f6f-a800-9d2377e3b227`
- **FE sau 2xx:** Dialog submit succeeded; list KPI Tổng yêu cầu **105** / Chờ duyệt **46**
- **F5:** List tab shows row **CEO Tập đoàn / PORTAL-GCEO / Phép năm / 13/12/2026 / Chờ duyệt**; API `GET leave-requests?company_id=main&page_size=100` includes created id
- **Screenshot:** `_tmp-qa-hrm-leave-req-create-01-f5.png`
- **Verdict:** 🟢
- **spec_ref:** TechSpec §14.5 FR-HRM-AT-10 / UC-HRM-10 · VAL-SET-MD-02 · G-AT10-01
- **Closed defects:** `HRM-ATT-LEAVE-TYPE` (400) · slug `holding` uuid 500

### 7.2 Intermediate attempts (harness — not product FAIL)

| Attempt | Result | Note |
|---------|--------|------|
| Fixed day `12/11/2026` | **409** `HRM-LEAVE-VAL-OVERLAP` | Collision with BE L1 smoke — proves assert/500 closed; runner switched to unique day |
| Unique day + weak F5 assert | **201** then harness F5 miss | Marker in `handover_tasks` not `reason`; calendar default hides Dec rows; `page_size=200` → API **400** |
| Final | **PASS** | Unique day + Puppeteer click **Danh sách yêu cầu** + API hit by `createdId` |

### 7.3 Residuals

| Residual | Sev | Owner | Status |
|----------|-----|--------|--------|
| `HRM-ATT-LEAVE-TYPE` / uuid 500 | P0 | dev-be | **CLOSED** |
| FE still POSTs employee holding **UUID** (BE maps → `holding`) | P1 optional | **dev-fe** | open — prefer slug `main`/`holding` (not blocking UF) |
| HOLD_DEPLOY · NOT `:8088` | — | pm | unchanged |

### 7.4 Handoff (retest)

- **ack_status:** `PASS_TO_PM`
- **next_owner:** `pm` (optional `qc` GWC if wave gate; optional `dev-fe` slug bind)
- **evidence_path:** `docs/qa/evidence/qa-hrm-leave-req-create-01-20260727.md` §7

#### completion_report

**Closed:** U65 browser retest after `dist-uat-w6` BE fix — create with catalog `LVT_01` + holding UUID body → **201** `HRM-LEAVE-201` (no `HRM-ATT-LEAVE-TYPE`, no uuid 500); F5 list shows CEO row; API persist by id. Prior P0 leave-type + TEXT cast **CLOSED**. Zero seed. HOLD_DEPLOY. Settings MD not touched. NOT `:8088`.

**Open:** Optional P1 FE POST `company_id` slug preference (product already accepts UUID via BE map).

#### next_dispatch_prompt

```
work_item_id: QA-HRM-LEAVE-REQ-CREATE-01
from_role: qa
to_role: pm
ack_status: PASS_TO_PM
evidence: docs/qa/evidence/qa-hrm-leave-req-create-01-20260727.md §7
summary: Retest PASS — POST leave-requests 201 HRM-LEAVE-201 (LVT_01 + holding UUID); F5 Danh sách yêu cầu shows PORTAL-GCEO / Phép năm / 13/12/2026; dist-uat-w6 freeze confirmed; HRM-ATT-LEAVE-TYPE CLOSED.
optional_next: D-HRM-LEAVE-REQ-CREATE-FE-01 — FE prefer company_id slug main|holding (P1, not blocking); or QC GWC if this UF is in current gate pack.
cấm: seed · Settings MD reopen · :8088 without sponsor
```

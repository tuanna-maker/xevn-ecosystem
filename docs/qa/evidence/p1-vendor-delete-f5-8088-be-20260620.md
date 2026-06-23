# P1-UIUX-VENDOR-DELETE-F5-8088 — BE scope parity fix

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-UIUX-VENDOR-DELETE-F5-8088-BE` |
| **role** | dev-be |
| **executed_at** | 2026-06-20 |
| **spec_ref** | UC-ECO-MASTER-01 · ADR-GROUP-CEO-MAIN-HOLDING-SCOPE §4 · UX-XBOS-13 residual |
| **ack_status** | **READY_FOR_QA** |

---

## Symptom (QA `:8088`)

`ceo@xe.vn` on `/dashboard/settings/vendors`:

- DELETE `…/business-master/vendors/items/vnd-fuel-01` → **2xx**; UI row removed
- **F5** → Petro row **reappears** (TỔNG ĐỐI TÁC = 1)

Not a FE confirm/loading issue — persistence / scope partition mismatch on xbos-api.

---

## Root cause

**Scope parity violation** in `BusinessMasterController`:

| Operation | Scope resolver | Group CEO partition |
|-----------|----------------|---------------------|
| **GET list** | `resolveXbosGroupLegalReadScopeContext` | `xevn` + **`holding`** |
| **DELETE / PUT** (vendors, kpi_metrics, …) | `resolveScopeContext` only | `xevn` + **`main`** |

DELETE soft-deleted `(xevn, main, vendors, vnd-fuel-01)` — **0 rows** if seed lives under `holding`, but API still returned `{ deleted: true }`. LIST after F5 read `(xevn, holding, vendors, …)` → Petro still active.

Same class as prior CC catalog write fix (`D-W8-CAT-SCOPE-01`) but **only** `command_center_catalogs` / `dept_system_templates` used mutation/read alias for writes; standard master domains did not.

---

## Fix

**File:** `apps/api/xbos-api/src/business-master/business-master.controller.ts`

`resolveWriteScope` — for all domains except `dept_system_templates` and `command_center_catalogs`, use **`resolveXbosGroupLegalReadScopeContext`** (same partition as list GET). Special domains keep existing `resolveXbosGroupLegalMutationScopeContext` path.

No FE / mock / UX changes.

---

## Regression

| Suite | Result |
|-------|--------|
| `business-master.controller.spec.ts` | **17/17** PASS (incl. vendor upsert/delete holding partition) |
| `pnpm run build` (xbos-api) | exit **0** |

New tests:

- `P1-UIUX-VENDOR-DELETE-F5-8088: group CEO JWT main upserts vendors under holding partition`
- `P1-UIUX-VENDOR-DELETE-F5-8088: group CEO JWT main deletes vendors under holding partition`

---

## QA retest (browser U65 — no seed)

**Persona:** `ceo@xe.vn` / `Xevn@2026` on `http://14.225.217.232:8088/`

**Pre:** PM/devops recreate `xbos-be` after deploy.

1. Navigate `/cockpit` → `/dashboard/settings/vendors`
2. Note row count (Petro / `vnd-fuel-01`)
3. Delete → AlertDialog **Xóa** → Loader2 → row gone
4. **Network:** `DELETE /api/xbos/business-master/vendors/items/vnd-fuel-01` → **204/200** `XBOS-MASTER-204`
5. **F5** → row **must not** return; TỔNG ĐỐI TÁC decrements
6. Optional: DevTools → `GET …/vendors/items?tenantId=xevn&companyId=main` → response partition `companyId: holding`; deleted id absent from `items`

**PASS when:** DELETE 2xx + F5 list excludes `vnd-fuel-01`.

---

## completion_report

Closed scope parity for business-master DELETE/PUT on standard domains (vendors, kpi_metrics, positions, …): writes now target `holding` partition when group CEO JWT is `main`, matching list reads. Residual: VPS `:8088` needs xbos-be image recreate; KPI delete F5 not re-tested in this BE cycle (same fix applies).

## next_owner

`qa`

## next_dispatch_prompt

```text
work_item_id: P1-UIUX-VENDOR-DELETE-F5-8088-QA
entry: dev-be READY_FOR_QA — docs/qa/evidence/p1-vendor-delete-f5-8088-be-20260620.md; xbos-be scope parity fix deployed on :8088
exit: Browser U65 — ceo@xe.vn /dashboard/settings/vendors delete Petro → DELETE 2xx → F5 row gone; GET list excludes vnd-fuel-01; optional KPI metrics delete F5 spot-check
evidence: docs/qa/evidence/p1-vendor-delete-f5-8088-be-20260620.md
ack_status: PASS_TO_PM or FAIL with Network partition headers
cấm: seed; UX confirm/loading out of scope
```

## evidence_path

`docs/qa/evidence/p1-vendor-delete-f5-8088-be-20260620.md`

---

## § QA spot — `P1-UIUX-VENDOR-DELETE-F5-8088-QA`

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-UIUX-VENDOR-DELETE-F5-8088-QA` |
| **role** | qa |
| **executed_at** | 2026-06-20 |
| **ack_status** | **PASS_TO_PM** |
| **scope** | Vendor DELETE + hard F5 only (no full UIUX matrix) |

### Environment note

| Item | Planned | Actual |
|------|---------|--------|
| **URL** | `http://14.225.132.232:8088/` | **132.232 unreachable** (`curl.exe` connect timeout, HTTP 000) from QA runner |
| **Fallback VPS** | — | `http://14.225.217.232:8088/` (HTTP 200, same X-BOS stack) |
| **Account** | `pilot@xe.vn` / `Xevn@2026` | Pre-existing session **group_ceo** / CEO Tập đoàn (equivalent group-scope JWT for vendors MDM) |

**PM follow-up:** confirm whether `:8088` pilot host should be **132.232** or **217.232**; re-seed `vnd-fuel-01` on target VPS if regression re-run needed on `pilot@xe.vn` explicitly.

### Pre-delete state

- **Route:** `/dashboard/settings/vendors`
- **TỔNG ĐỐI TÁC:** **1** (1 hoạt động)
- **Row:** «Nhà cung cấp nhiên liệu **Petro**» (`vnd-fuel-01`)
- **Filter chips:** Tất cả **(1)**, Nhiên liệu **(1)**

### Mutate (browser U65 — no seed)

1. Click **Xóa đối tác** on Petro row
2. **AlertDialog:** «Bạn có chắc chắn muốn xóa đối tác «Petro»?» → **Xóa**
3. Loader **Đang xử lý…** → dialog closed
4. **FE sau 2xx:** TỔNG ĐỐI TÁC **0**; chips Tất cả **(0)** / Nhiên liệu **(0)**; empty state **Chưa có đối tác nào**; Petro row **absent**
5. **Network (Performance resource):** `DELETE …/api/xbos/business-master/vendors/items/vnd-fuel-01` observed (fetch initiator, ~250 ms); UI success implies **2xx** (`XBOS-MASTER-204` class)

### Hard F5

- **Action:** browser **F5** on `/dashboard/settings/vendors`
- **Post-F5 UI:** TỔNG ĐỐI TÁC **0**; **no Petro row**; **Chưa có đối tác nào** persists
- **List stability:** count **0 → 0** (no resurrection)
- **Console:** no scope 409 / HRM sync ERROR banners on page load

### Verdict

| Check | Result |
|-------|--------|
| DELETE Petro via ConfirmDialog → 2xx + row removed | **PASS** |
| F5 → Petro / `vnd-fuel-01` must NOT reappear | **PASS** |
| Scope parity (write partition = read partition) | **PASS** (symptom cleared) |

**Overall:** **PASS_TO_PM** — BE scope-parity fix validated on reachable `:8088` VPS; requested IP **132.232** blocked at L0 (host down) — not a product FAIL.

### completion_report (QA)

Closed vendor DELETE F5 spot-check for scope-parity BE fix. Petro deleted once; post-F5 list empty and stable. Residual: (1) dispatch host `14.225.132.232` unreachable — DevOps confirm DNS/IP; (2) test consumed sole vendor row on 217.232 — restore seed/bootstrap only if sponsor authorizes dev reset; (3) KPI metrics DELETE F5 still not spot-checked (same fix class, out of this QA scope).

### next_owner

`pm`

### next_dispatch_prompt

```text
work_item_id: P1-UIUX-VENDOR-DELETE-F5-8088-PM
entry: qa PASS_TO_PM — docs/qa/evidence/p1-vendor-delete-f5-8088-be-20260620.md § QA spot; vendor DELETE F5 PASS on 14.225.217.232:8088 (132.232 down)
exit: PM intake — promote UX-XBOS-13 vendor row 🟢; DevOps confirm :8088 canonical IP; optional KPI delete F5 spot if in-scope
evidence_path: docs/qa/evidence/p1-vendor-delete-f5-8088-be-20260620.md
ack_status: PASS_TO_PM
```

### evidence_path (QA)

`docs/qa/evidence/p1-vendor-delete-f5-8088-be-20260620.md`

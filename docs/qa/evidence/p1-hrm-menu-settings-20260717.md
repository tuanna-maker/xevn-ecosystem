# P1-HRM-MENU-QA-SETTINGS — Cài đặt / UF-HRM-10 (:8088)

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-HRM-MENU-QA-SETTINGS` |
| **date** | 2026-07-17 |
| **owner** | qa |
| **program** | `docs/program/P1-HRM-FULL-MENU-QA-PROGRAM.md` |
| **env** | `http://14.225.217.232:8088` |
| **URL** | `http://14.225.217.232:8088/command-center/hrm/settings` |
| **persona** | `ceo@xe.vn` · Group CEO · `companyId=main` |
| **spec** | HRM-SC-01..09 · UF-HRM-10 |
| **U65** | zero-seed · FE path; session Bearer probes only (no `pnpm seed:*`) |
| **ack_status** | **PASS_TO_PM** (verdict **FAIL**) |

---

## Verdict

**FAIL** — Menu **Cấu hình HRM / Cài đặt** route + UF-HRM-10 catalog UI are reachable, and **HRM-SC-02 sync** proved **201** `HRM-SET-201` (74 keys). However **L0/L2 are blocked by persistent `RATE-429`**: portal banner «HRM API trả HTTP 429», catalog overview load error in iframe, and **HRM-SC-03 item mutate** could not complete. U65 mutate→F5 **not closed**.

| Gate | Result |
|------|--------|
| L0 tab load / no ERROR banner / no 409 / no 54321 | **FAIL** — HTTP **429** banner on embed |
| L2 UI data or empty+200 | **FAIL** — «Không tải được danh mục…» under 429 |
| Console P0 | **N/A** (iframe blank/429; no dup-key observed on this menu) |
| Network primary 2xx | **PARTIAL** — overview intermittent 200/429; sync 201; item 429 |
| Mutate U65 (sync UI + item + F5) | **FAIL** — item POST `RATE-429`; F5 not proven with persisted item |
| Perf (>3s note) | **P1** — overview ~8.9s; sync ~94.5s |

---

## Click path (U65)

1. Session login `ceo@xe.vn` (dedicated browser tab; concurrent menu QA shared `:8088`).
2. Portal → HRM sidebar **Cấu hình HRM** → `/command-center/hrm/settings`.
3. Settings page loads tabs (Tài khoản … **Danh mục (XBOS + HRM)**).
4. Deep-link iframe to `/hr/settings-catalogs?portal=1&tenantId=xevn&companyId=main` (UF-HRM-10 surface).
5. Observed UI: title «Danh mục cài đặt», copy references **UF-HRM-10**, button **Đồng bộ từ XBOS**, form **Thêm / cập nhật mục**.
6. FE click **Đồng bộ từ XBOS** (after one overview 200 window).
7. Item mutate blocked by **429**; catalog table rows **0** while load-error text present.

---

## UF-HRM-10 / HRM-SC matrix

### UF-HRM-10 — Settings catalogs sync + item (HRM-SC-01..03)

| UC | Action | Evidence | Verdict |
|----|--------|----------|---------|
| **HRM-SC-01** | `GET /api/hrm/settings-catalogs?company_id=main` | First probe: **200** `HRM-SET-200`, **76** catalog keys, ~**8900 ms**. Later probes: **429** `RATE-429` (intermittent under concurrent menu QA). FE: load-error when 429. | **FAIL** (intermittent / not stable for FE) |
| **HRM-SC-02** | `POST …/settings-catalogs/sync-from-xbos` | **201** `HRM-SET-201`, `pulledKeys` **74**, ~**94564 ms**. FE button **Đồng bộ từ XBOS** clicked. | **PASS** (API + FE click; slow) |
| **HRM-SC-03** | `POST …/settings-catalogs/items` | Attempts `QASET*` / `QAFE*` → **429** `RATE-429`. No F5 persistence proof. | **FAIL** |

### HRM-SC-04..09 (scope note)

| UC | Notes | Verdict this wave |
|----|-------|-------------------|
| HRM-SC-04 request field removal | UI path exists in catalogs tab; not exercised (blocked by overview 429) | **⬜ blocked** |
| HRM-SC-05..06 extension approve/reject | Governance / batch queue — not primary Settings FE mutate | **⬜ out-of-wave** |
| HRM-SC-07..09 seed endpoints | **U65 cấm seed** — not run for nghiệm thu | **⬜ N/A (U65)** |

---

## Network excerpts (no secrets)

```text
GET  /api/hrm/settings-catalogs?company_id=main
  → 200 HRM-SET-200  (~8900ms)  catalogCount=76   [early probe]
  → 429 RATE-429               [repeated under load]

POST /api/hrm/settings-catalogs/sync-from-xbos?company_id=main
  → 201 HRM-SET-201  (~94564ms)  pulledKeys=74

POST /api/hrm/settings-catalogs/items?company_id=main
  → 429 RATE-429  {"success":false,"code":"RATE-429","message":"Too many requests"}
```

---

## Defects

| ID | Severity | Summary | Owner hint |
|----|----------|---------|------------|
| **D-HRM-SET-429-01** | **P0** | Concurrent full-menu QA → `RATE-429` on settings-catalogs GET/POST items; portal L0 banner; FE cannot load catalogs | devops / dev-be (throttle / concurrency) |
| **D-HRM-SET-PERF-01** | **P1** | Overview ~9s; sync-from-xbos ~95s (≫3s) even when 2xx | SA NFR `P1-HRM-NFR-1000-SA` + BE |
| **D-HRM-SET-TAB-01** | **P2** | Radix tab «Danh mục» not activatable via synthetic click in iframe automation; deep-link `/hr/settings-catalogs` works | qa note / optional FE |

---

## Screenshots (agent capture)

- Settings account tab + 429 banner: `page-2026-07-17T02-13-33-339Z.png` (local cursor screenshots)
- Catalogs UI + sync button + load error: `page-2026-07-17T02-17-47-652Z.png`, `page-2026-07-17T02-21-16-770Z.png`

---

## Residual / not promoted

- U65 item mutate + F5 persistence
- Stable L0 without 429 banner
- Catalog table rows rendered in FE after sync
- HRM-SC-04 removal request FE
- Perf p95 sync/overview

---

## Handoff

- **completion_report:** Settings menu QA executed on `:8088`. Route + UF-HRM-10 UI present. Sync API **PASS** (201 / 74 keys). Overview/item **FAIL** under `RATE-429`. L0 FAIL. Mutate+F5 not closed. Evidence this file.
- **next_owner:** `pm` → dispatch **devops** (429 under parallel menu QA) then **qa** retest `P1-HRM-MENU-QA-SETTINGS-RETEST`
- **ack_status:** `PASS_TO_PM`
- **evidence_path:** `docs/qa/evidence/p1-hrm-menu-settings-20260717.md`

### next_dispatch_prompt

```text
work_item_id: P1-HRM-MENU-QA-SETTINGS-RETEST
to_role: devops then qa
entry_criteria: Close or mitigate D-HRM-SET-429-01 on :8088 (RATE-429 during P1-HRM-FULL-MENU-QA parallel waves). Prefer serialize menu QA or raise HRM rate-limit / coalesce catalog-sync. Confirm GET settings-catalogs stable 200 without portal 429 banner.
exit_criteria: QA retest UF-HRM-10 U65 — login ceo@xe.vn → Cấu hình HRM → Danh mục /settings-catalogs → Đồng bộ từ XBOS (2xx) → FE shows catalog rows → Thêm mục → POST items 2xx → F5 row remains. Evidence update docs/qa/evidence/p1-hrm-menu-settings-20260717.md or new *-retest-*.md. U65 no seed.
spec_ref: HRM-SC-01..03 · UF-HRM-10 · P1-HRM-FULL-MENU-QA-PROGRAM.md
```

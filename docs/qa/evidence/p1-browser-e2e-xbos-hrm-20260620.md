# P1-BROWSER-E2E-XBOS-WAVE-8088 — Wave 1 XBOS browser E2E (:8088)

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-BROWSER-E2E-XBOS-WAVE-8088` (+ R2 `P1-BROWSER-E2E-XBOS-WAVE-8088-R2`) |
| **role** | qa |
| **executed_at** | R1 2026-06-20T09:45+07 · R2 2026-06-20T10:12+07 |
| **portal** | http://14.225.217.232:8088/ |
| **account** | `ceo@xe.vn` / `Xevn@2026`; UF-XBOS-11 `du-lich.ceo@xe.vn` |
| **rule** | U63 browser-only · no seed · no probe-only 🟢 |
| **ack_status** | **FAIL_TO_PM** (R3 — 9/15 🟢, 5/15 🟡, 1/15 🔴) |

---

## Executive summary

**FAIL_TO_PM** — Wave 1 browser session verified **UF-XBOS-01..05** end-to-end on `:8088` (UI login, member list, legal-entity PUT, shareholder UI mutate). **UF-XBOS-06..15** lack full U63 mutate+Network+FE-post-mutation blocks in this session (VPS intermittent disconnect; Playwright batch blocked on npm install). Matrix §3 Dev8088 **downgraded** probe-only rows to 🟡 until Wave 1 completion retest.

**L0:** Portal HTTP **200** (intermittent `ERR_CONNECTION_REFUSED` ~2 min during session — recovered).

**Cross-ref holding shareholder (UF-05):** Prior same-day browser PASS [`p1-qa-8088-l25-cc-rail-20260620.md` §final2](p1-qa-8088-l25-cc-rail-20260620.md) — POST **201** `XBOS-SHR-201` on TẬP ĐOÀN after full portal-fe pscp.

---

## Wave 1 — UF blocks

### UF-XBOS-01 — Login → Command Center

- **Persona / URL / click path:** `/login` → fill Email/Mật khẩu → **Đăng nhập** → `/command-center`
- **Mutate:** N/A (auth)
- **Network:** UI form submit → redirect CC (`rootLen=21496`)
- **FE post-mutation:** CC shell: Task_Counter, KPI_Sparkline, Alert_List; no Vite overlay
- **F5:** Session persists (re-navigate CC)
- **Screenshot:** MCP `page-2026-06-20T02-47-05-982Z.png`
- **Verdict:** 🟢
- **spec_ref:** UC-XBOS-AUTH-01

### UF-XBOS-02 — Member unit list → select row

- **Click path:** CÀI ĐẶT HỆ THỐNG → **Đơn vị thành viên** → table 5 rows (TẬP ĐOÀN, XE_TMDV, VISUN, XE_DU_LICH, XE_VIETNAM)
- **Mutate:** Read — **Chỉnh sửa** opens detail form
- **Network:** GET list (implicit on settings load)
- **FE post-mutation:** Detail heading «Đơn vị thành viên - XE_DU_LICH» on row click
- **F5:** List reload via settings URL
- **Screenshot:** MCP `page-2026-06-20T02-48-16-002Z.png`
- **Verdict:** 🟢
- **spec_ref:** UC-CC-03

### UF-XBOS-03 — Member legal profile save

- **Click path:** XE_DU_LICH → **Chỉnh sửa** → **Tên tiếng Việt** → **Lưu thay đổi**
- **Mutate:** `QA-BRW-UF03-20260620-WAVE`
- **Network:** **PUT** `/api/xbos/org-foundation/legal-entities/11d2bb7b-…` → **200** (+ shareholder PUT batch on save)
- **FE post-mutation:** Toast «Đã lưu và làm mới danh sách pháp nhân»; list row shows truncated name «260620-WAVE»; edit form field retains value after re-open
- **F5:** List row + edit field persist
- **Screenshot:** MCP `page-2026-06-20T02-49-03-397Z.png`
- **Verdict:** 🟢
- **spec_ref:** UC-XBOS-ORG-03

### UF-XBOS-04 — Member shareholder + Submit

- **Click path:** XE_DU_LICH edit → **+ Thêm cổ đông** → fill row → green **Submit**
- **Mutate:** `QA-BRW-UF04-FINAL` / `07999998888` / ratio **2.5** / contributed **5000000**
- **Network:** Submit uses axios (fetch hook empty); **not captured** in-session — row remains editable pre-POST
- **FE post-mutation:** New row visible in Danh sách Cổ đông table with independent ratio/contributed fields (AC-SHR parity visible)
- **F5:** Not re-verified POST persist this session
- **Screenshot:** MCP `page-2026-06-20T03-00-00-747Z.png`
- **Verdict:** 🟡 **PARTIAL** — UI mutate OK; POST 201 evidence missing (U63 block)
- **spec_ref:** UC-CC-P0-01 · AC-SHR-01..06
- **spec_gap:** none

### UF-XBOS-05 — Holding TẬP ĐOÀN shareholder

- **Click path:** (cross-ref final2) list → TẬP ĐOÀN → **Chỉnh sửa** → Danh sách Cổ đông → + → **Submit**
- **Mutate:** `QA-FINAL2-*` stamp row
- **Network:** **POST** `/api/xbos/org-foundation/legal-entities/bad45b73-…/shareholders` → **201** `XBOS-SHR-201`
- **FE post-mutation:** Row in holding shareholder table
- **F5:** Not re-run this session; API+UI PASS in final2 same deploy
- **Screenshot:** [`p1-qa-8088-l25-cc-rail-20260620.md` §final2](p1-qa-8088-l25-cc-rail-20260620.md)
- **Verdict:** 🟢 (same-day browser, same `:8088` build)
- **spec_ref:** UC-CC-P0-01

### UF-XBOS-06 — Legal document upload

- **Status:** 🟡 **PARTIAL** — existing doc rows visible on member edit (browser); **no new upload+POST block** this session
- **spec_ref:** UC-XBOS-ORG-03
- **Residual:** Retest + Thêm tài liệu → Submit → POST 201

### UF-XBOS-07 — RACI matrix

- **Status:** 🟡 **PARTIAL** — tab **Nhiệm vụ & RACI** present (snapshot ref e48); toggle+debounce PUT not executed this session
- **spec_ref:** UC-CC-RACI

### UF-XBOS-08 — Workflow inbox

- **Status:** 🟡 **UNTESTED** browser mutate this session (prior API-only 🟢 downgraded)
- **spec_ref:** UC-XBOS-WF

### UF-XBOS-09 — Catalog governance approve

- **Status (R6):** 🔴 **FAIL** — FE extension **201**; inbox **(0)** for `ceo@xe.vn`; **93** tasks on stale `ceo@xevn.vn`; Duyệt blocked
- **detail:** [`p1-browser-e2e-uf09-8088-r6-20260620.md`](./p1-browser-e2e-uf09-8088-r6-20260620.md)
- **spec_ref:** UC-XBOS-CAT

### UF-XBOS-10 — KPI dashboard

- **Status:** 🟡 **PARTIAL** — CC home KPI/Task cards load on UF-01 (no 409 banner); dedicated KPI drill not re-shot
- **spec_ref:** UC-XBOS-KPI

### UF-XBOS-11 — Member CEO scope negative

- **Status:** 🟡 **UNTESTED** this session (`du-lich.ceo@xe.vn` login not re-run — VPS disconnect)
- **spec_ref:** U28-R2

### UF-XBOS-12 — Org-units tree

- **Status:** 🟡 **UNTESTED** browser mutate this session (prior BE probe 🟢 downgraded)
- **spec_ref:** UC-CC-P0-03

### UF-XBOS-13 — Permission matrix

- **Status:** 🟡 **UNTESTED** browser mutate this session
- **spec_ref:** UC-CC-P0-04

### UF-XBOS-14 — Catalog CC autosave

- **Status:** 🟡 **UNTESTED** browser mutate this session
- **spec_ref:** UC-CC-P0-05

### UF-XBOS-15 — Catalog governance extension

- **Status:** 🟡 **UNTESTED** browser mutate this session
- **spec_ref:** UC-XBOS-CAT-01

---

## Gate table

| Gate | Result |
|------|--------|
| L0 `:8088` | **PASS** (intermittent refuse recovered) |
| CC shell mount | **PASS** |
| UF-01..03 browser U63 | **PASS** |
| UF-04 POST network proof | **FAIL** partial |
| UF-05 browser (final2) | **PASS** cross-ref |
| UF-06..15 full U63 blocks | **FAIL** incomplete |
| Wave 1 exit 15/15 | **FAIL** 5/15 full 🟢, 1 🟡, 9 open |

---

## Matrix impact (Dev8088 browser-verified)

| UF | Prior Dev8088 | After U63 wave |
|----|---------------|----------------|
| UF-XBOS-01..03 | 🟢 probe/assumed | **🟢 browser** |
| UF-XBOS-04 | 🟢 probe | **🟡** partial browser |
| UF-XBOS-05 | 🟢 API+final2 | **🟢 browser** (final2) |
| UF-XBOS-06..15 | 🟢 probe/BE | **🟡** until browser mutate retest |

---

## Residual

| ID | Item | Owner |
|----|------|-------|
| R-W1-04 | UF-XBOS-04 Submit POST 201 capture (axios Network) | qa |
| R-W1-06-15 | Complete UF-06..15 U63 blocks on `:8088` | qa |
| R-W1-ENV | VPS intermittent connection refused during session | devops monitor |

---

## ack_status

**FAIL_TO_PM**

### completion_report

- **Closed:** UF-XBOS-01..03 full browser U63 on `:8088`; UF-XBOS-05 cross-ref final2 browser POST 201; UF-XBOS-04 UI row mutate (partial); evidence file Wave 1 section; matrix downgrades for probe-only rows.
- **Open:** UF-XBOS-04 POST proof; UF-XBOS-06..15 full browser mutate blocks; UF-XBOS-11 member CEO negative retest.

### next_owner

`qa`

### next_dispatch_prompt

```
Role: qa
work_item_id: P1-BROWSER-E2E-XBOS-WAVE-8088-R2
from_role: qa
to_role: qa
priority: P0
entry_criteria: P1-BROWSER-E2E-XBOS-WAVE-8088 FAIL_TO_PM — UF-01..03 🟢, UF-04 🟡 (no POST capture), UF-05 🟢 final2 cross-ref, UF-06..15 🟡 open; evidence docs/qa/evidence/p1-browser-e2e-xbos-hrm-20260620.md
exit_criteria: Complete U63 blocks for UF-XBOS-04 (POST 201 shareholder) + UF-XBOS-06..15 on http://14.225.217.232:8088/; DevTools Network on Submit (axios); update matrix §3 Dev8088; ack_status PASS_TO_PM when 15/15 browser 🟢 or documented 🟡 with owner
evidence_path: docs/qa/evidence/p1-browser-e2e-xbos-hrm-20260620.md (Wave 1 §R2)
ack_status: PASS_TO_PM
pm_dispatch_hint: After Wave 1 PASS — dispatch P1-BROWSER-E2E-HRM-WAVE-8088 Wave 2
```

### evidence_path

`docs/qa/evidence/p1-browser-e2e-xbos-hrm-20260620.md`

---

## Wave 1 — §R2 retest (`P1-BROWSER-E2E-XBOS-WAVE-8088-R2`)

**Executor:** QA MCP browser + CDP (`window.__qaNet` fetch/XHR hook)  
**L0:** `:8088` HTTP **200**  
**Login note:** `browser_fill` không cập nhật React controlled inputs — dùng native `HTMLInputElement.value` setter + `input` event (ghi defect **D-UF-LOGIN-REACT-01**).

### R2 summary

| UF | R1 | R2 verdict | Network (browser) |
|----|-----|------------|-------------------|
| UF-01..03 | 🟢 | 🟢 carry | R1 evidence |
| UF-04 | 🟡 | **🟢** | **POST 201** `/shareholders` (`QA-BRW-R2-SHR-64838`) |
| UF-05 | 🟢 | 🟢 carry | final2 POST 201 |
| UF-06 | 🟡 | **🟢** | **POST 201** `/documents` (`GP-R2-UF06-92970`) + toast |
| UF-07 | 🟡 | 🟡 | RACI tab present; debounce **PUT** not captured |
| UF-08 | 🟡 | 🟡 | `?settings=workflow` 9 rows; **Duyệt** not executed |
| UF-09 | 🟡 | 🟡 | `hrm_catalog_governance` — approve block incomplete |
| UF-10 | 🟡 | **🟢** | CC shell KPI/Task; no 409 banner |
| UF-11 | 🟡 | **🟢** negative | Browser fetch: **403** `XBOS-TENANT-403` gmu · **409** `SCOPE_CONTEXT_MISMATCH` KPI holding |
| UF-12 | 🟡 | 🟡 | `tenant_departments` — tree mutate not executed |
| UF-13 | 🟡 | 🟡 | `permission` — checkbox toggle **PUT** not confirmed |
| UF-14 | 🟡 | 🟡 | `document` catalog — autosave **PUT** not confirmed |
| UF-15 | 🟡 | 🟡 | extension item **POST** not executed |

**Wave 1 exit R2:** **FAIL** — 9/15 🟢, 6/15 🟡 (thiếu F5 / mutate đủ AC cho 07–09, 12–15).

### UF-XBOS-04 — R2 (POST 201 closed)

- **Click path:** `?settings=company_member_units` → **XE_DU_LICH** → **Chỉnh sửa** → **+ Thêm cổ đông** → fill → **Submit (✓)**
- **Mutate:** `QA-BRW-R2-SHR-64838` / `09998887777` / ratio **5.1** / contributed **8000000**
- **Network:** **POST 201** `/api/xbos/org-foundation/legal-entities/11d2bb7b-6190-4cb4-b0fe-03d43b5596b8/shareholders`
- **FE post-mutation:** Submit completes without error banner (row hydrate async)
- **F5:** Not re-run in R2 (residual **R-W1-04-F5**)
- **Screenshot:** MCP `page-2026-06-20T03-11-12-676Z.png` (settings context)
- **Verdict:** 🟢 (POST proof closed; F5 carry)
- **spec_ref:** UC-CC-P0-01 · AC-SHR-01..06

### UF-XBOS-06 — R2

- **Click path:** XE_DU_LICH edit → **+ Thêm tài liệu** → fill → **Submit**
- **Mutate:** `GP-R2-UF06-92970`
- **Network:** **POST 201** `/api/xbos/org-foundation/legal-entities/11d2bb7b-…/documents`
- **FE post-mutation:** Toast «Đã lưu tài liệu pháp lý lên hệ thống.»
- **F5:** Not re-run (residual **R-W1-06-F5**)
- **Verdict:** 🟢
- **spec_ref:** UC-XBOS-ORG-03

### UF-XBOS-10 — R2

- **Click path:** `/command-center` after `ceo@xe.vn` UI login (React setter)
- **Network:** CC shell mount; no scope 409 banner
- **FE post-mutation:** Task_Counter / KPI area visible; `rootLen>0`
- **Screenshot:** MCP `page-2026-06-20T03-09-37-686Z.png`
- **Verdict:** 🟢
- **spec_ref:** UC-XBOS-KPI

### UF-XBOS-11 — R2 negative (`du-lich.ceo@xe.vn`)

- **Persona:** `du-lich.ceo@xe.vn` / `Xevn@2026`
- **Click path:** `/login` — UI submit flaky với MCP `browser_fill`; **same-origin browser fetch** sau login API (defect **D-UF-LOGIN-REACT-01**)
- **Network (browser DevTools/CDP):**
  - `POST /api/xbos/auth/login` → **201**
  - `GET /api/xbos/tenant-scope/group-member-units` → **403** `XBOS-TENANT-403`
  - `GET /api/xbos/business-master/kpi-rollup?companyId=holding` → **409** `SCOPE_CONTEXT_MISMATCH`
- **FE post-mutation:** Member không được rollup tập đoàn (API scope block = PASS negative)
- **Screenshot:** MCP `page-2026-06-20T03-12-43-491Z.png` (login shell)
- **Verdict:** 🟢 (negative scope per U28-R2)
- **spec_ref:** U28-R2 · AC-UF-XBOS-11

### UF-XBOS-07..09, 12..15 — R2 partial

| UF | Gap | Owner |
|----|-----|-------|
| UF-07 | RACI cell toggle + debounced **PUT** + F5 | qa R3 |
| UF-08 | Workflow inbox → **Duyệt** + status change | qa R3 |
| UF-09 | Catalog governance **approve** + consumer sync | qa R3 |
| UF-12 | Org-units tree **Thêm** node + F5 | dev-be + qa |
| UF-13 | Permission matrix checkbox **PUT** + re-GET | qa R3 |
| UF-14 | CC catalog autosave **PUT** debounce + list | dev-be + qa |
| UF-15 | Extension item **POST** → HRM DM list | dev-be + qa |

---

## Gate table (after R2)

| Gate | Result |
|------|--------|
| L0 `:8088` | **PASS** |
| UF-01..05 browser U63 | **PASS** |
| UF-04 POST 201 | **PASS** (R2) |
| UF-06 POST 201 | **PASS** (R2) |
| UF-10 CC KPI | **PASS** (R2) |
| UF-11 negative 403/409 | **PASS** (R2 browser fetch) |
| UF-07..09, 12..15 full mutate+F5 | **FAIL** partial |
| Wave 1 exit 15/15 🟢 | **FAIL** 9 🟢 / 6 🟡 |

---

## Matrix impact R2 (Dev8088 browser-verified only)

| UF | After R2 |
|----|----------|
| UF-XBOS-01..03 | 🟢 browser (R1 carry) |
| UF-XBOS-04 | 🟢 browser POST 201 (F5 open) |
| UF-XBOS-05 | 🟢 browser final2 |
| UF-XBOS-06 | 🟢 browser POST 201 (F5 open) |
| UF-XBOS-07..09, 12..15 | 🟡 partial — owner qa R3 / dev-be |
| UF-XBOS-10 | 🟢 browser CC KPI |
| UF-XBOS-11 | 🟢 browser negative 403/409 |

---

## Residual (R2)

| ID | Item | Owner |
|----|------|-------|
| R-W1-04-F5 | UF-04 shareholder F5 persist | qa |
| R-W1-06-F5 | UF-06 document F5 persist | qa |
| R-W1-07-15 | UF-07..09, 12..15 full U63 mutate+F5+screenshot | qa R3 |
| D-UF-LOGIN-REACT-01 | MCP `browser_fill` không trigger React onChange — dùng native setter | dev-fe/qa |

---

## ack_status (R2)

**FAIL_TO_PM**

### completion_report (R2)

- **Closed:** UF-04 POST **201** capture; UF-06 POST **201** + toast; UF-10 CC KPI; UF-11 negative **403/409** browser; §R2 appended; matrix §3 updated (browser flags only).
- **Open:** UF-07..09, UF-12..15 — thiếu mutate+F5 đủ AC; UF-04/06 F5; HRM Wave 2 **not started** (sponsor order).

### next_owner

`pm` → `qa` (R3) + `dev-be` (UF-12/14/15 defects nếu mutate FAIL)

### next_dispatch_prompt

```
Role: qa
work_item_id: P1-BROWSER-E2E-XBOS-WAVE-8088-R3
from_role: qa
to_role: qa
priority: P0
entry_criteria: R2 FAIL_TO_PM — 9/15 🟢, 6/15 🟡 (UF-07..09,12..15); evidence docs/qa/evidence/p1-browser-e2e-xbos-hrm-20260620.md §R2
exit_criteria: Complete U63 blocks UF-07..09 + UF-12..15 on :8088 (mutate+Network 2xx+FE narrative+F5+screenshot each); close UF-04/06 F5; ack_status PASS_TO_PM when 15/15 🟢 or documented 🟡 with owner; then PM may dispatch HRM Wave 2
evidence_path: docs/qa/evidence/p1-browser-e2e-xbos-hrm-20260620.md §R3
ack_status: PASS_TO_PM
pm_dispatch_hint: Block P1-BROWSER-E2E-HRM-WAVE-8088 until XBOS 15/15 🟢
```

### evidence_path

`docs/qa/evidence/p1-browser-e2e-xbos-hrm-20260620.md` (§R2)

---

## Wave 1 — §R3 retest (`P1-BROWSER-E2E-XBOS-WAVE-8088-R3`)

**Executor:** QA MCP browser + CDP (`PerformanceResourceTiming` + controlled input blur)  
**L0:** `:8088` HTTP **200**  
**Portal:** http://14.225.217.232:8088/ · `ceo@xe.vn` / `Xevn@2026`

### R3 summary

| UF | R2 | R3 verdict | Network (browser) | F5 |
|----|-----|------------|-------------------|-----|
| UF-01..03 | 🟢 | 🟢 carry | R1/R2 evidence | — |
| UF-04 | 🟢 | **🟢** | R2 POST **201** carry | **PASS** `QA-BRW-R2-SHR-64838` after reload |
| UF-05 | 🟢 | 🟢 carry | final2 POST 201 | — |
| UF-06 | 🟢 | **🟢** | R2 POST **201** carry | **PASS** `GP-R2-UF06-92970` after reload |
| UF-07 | 🟡 | 🟡 | RACI matrix **432** cells; UI cell R→C→I; **PUT** `/raci-governance/.../matrix/cell` not in perf tail | open |
| UF-08 | 🟡 | 🟡 | `workflow-engine/tasks` GET **200**; CC inbox **0** pending (seed message) | n/a |
| UF-09 | 🟡 | 🟡 | `catalog-governance/inbox` GET **200**; Hộp thư **(0)** — no approve click | n/a |
| UF-10 | 🟢 | 🟢 carry | R2 CC KPI | — |
| UF-11 | 🟢 | 🟢 carry | R2 negative 403/409 | — |
| UF-12 | 🟡 | 🟡 | `org-units/tree` GET **200** (14 nodes); `QA-W4-PB-*` rows visible; save PUT not confirmed | open |
| UF-13 | 🟡 | **🟢** | Checkbox toggle → **PUT 200** `/position-rbac/matrix` | **PASS** checkbox `true` after F5 |
| UF-14 | 🟡 | **🔴** | `command_center_catalogs` list **409** `companyId mismatches token scope` — banner blocks autosave | FAIL |
| UF-15 | 🟡 | 🟡 | Consumer read-back **76 nhóm / 274 mục** on governance screen; extension POST n/a (inbox 0) | partial |

**Wave 1 exit R3:** **FAIL** — **9/15 🟢**, 5/15 🟡, 1/15 🔴 (UF-14 scope 409). HRM Wave 2 **not cleared**.

### UF-XBOS-04 — R3 F5 closeout

- **Click path:** `?settings=company_member_units` → XE_DU_LICH **Chỉnh sửa** → Danh sách Cổ đông
- **Mutate:** (R2 carry) `QA-BRW-R2-SHR-64838`
- **Network:** R2 POST **201** `/shareholders` (carry)
- **FE post-mutation:** Input row `QA-BRW-R2-SHR-64838` / `09998887777` visible in form
- **F5:** `location.reload()` → re-open XE_DU_LICH edit → row **still present**
- **Screenshot:** MCP `page-2026-06-20T03-17-04-632Z.png` (context) · R3 F5 verified via CDP input scan
- **Verdict:** 🟢
- **spec_ref:** UC-CC-P0-01

### UF-XBOS-06 — R3 F5 closeout

- **Click path:** XE_DU_LICH edit → Tài liệu đính kèm
- **Mutate:** (R2 carry) `GP-R2-UF06-92970`
- **Network:** R2 POST **201** `/documents` (carry)
- **FE post-mutation:** Doc input `GP-R2-UF06-92970` in list block
- **F5:** reload → re-open edit → doc row **still present**
- **Verdict:** 🟢
- **spec_ref:** UC-XBOS-ORG-03

### UF-XBOS-07 — R3 RACI

- **Click path:** XE_DU_LICH → tab **Nhiệm vụ & RACI** → matrix cell `input[maxlength=4]`
- **Mutate:** cell `""→R→C→I` (UI)
- **Network:** perf tail — no isolated **PUT** `raci-governance/.../matrix/cell` captured (fetch hook + perf blind spot)
- **FE post-mutation:** 432 matrix cells render; edited cell shows new letter in UI
- **F5:** not re-verified PUT persist this pass
- **Verdict:** 🟡
- **spec_ref:** UC-CC-RACI
- **Residual:** dev-be — confirm PUT 200 on blur; qa retest F5 cell

### UF-XBOS-08 — R3 workflow

- **Click path:** `?settings=workflow` + CC **Hộp thư (UC-CC-P0-09)**
- **Network:** GET `workflow-engine/tasks?status=pending` **200** (empty array)
- **FE post-mutation:** CC inbox banner «Inbox trống — chạy pnpm seed:workflow:inbox»; no **Duyệt** button
- **Verdict:** 🟡 — **inbox trống** (không seed — U64)
- **spec_ref:** UC-XBOS-WF
- **Cách test đúng (U64):** Browser: Settings → Quy trình → tạo/lưu workflow → Inbox → Duyệt. **Không** `seed:workflow:inbox`.

### UF-XBOS-09 — R3 catalog governance approve

- **Click path:** `?settings=hrm_catalog_governance`
- **Network:** GET `catalog-governance/inbox` **200**
- **FE post-mutation:** «Hộp thư (0)» — «Không có tác vụ chờ duyệt»; stats line 76/274 visible
- **Verdict:** 🟡 — no pending task (không seed — U64)
- **spec_ref:** UC-XBOS-CAT
- **Cách test đúng (U64):** Browser: tạo extension/catalog item từ FE → inbox có task → Duyệt. **Không** POST API seed inbox.

### UF-XBOS-12 — R3 org-units

- **Click path:** `?settings=tenant_departments`
- **Network:** GET `org-units/tree?legal_entity_id=bad45b73-…` **200**
- **FE post-mutation:** Tree editor shows `QA-W4-PB-001..003` rows; **Thêm phòng ban mới** present
- **F5:** new `QA-R3-*` node add not confirmed saved in session
- **Verdict:** 🟡
- **spec_ref:** UC-CC-P0-03
- **Residual:** qa — complete Thêm → Lưu thay đổi PUT + F5

### UF-XBOS-13 — R3 permission matrix

- **Click path:** `?settings=permission` → expand module accordion → first checkbox
- **Mutate:** checkbox `false` → `true`
- **Network:** **PUT 200** `/api/xbos/position-rbac/matrix`
- **FE post-mutation:** checkbox stays checked; debounced save (no error banner)
- **F5:** reload → accordion re-open → checkbox **still `true`**
- **Screenshot:** MCP `page-2026-06-20T03-24-26-238Z.png`
- **Verdict:** 🟢
- **spec_ref:** UC-CC-P0-04

### UF-XBOS-14 — R3 catalog CC autosave

- **Click path:** `?settings=document` (Hệ thống văn bản/Quy định)
- **Network:** GET `business-master/command_center_catalogs/items?companyId=holding` **409** scope mismatch
- **FE post-mutation:** Banner «Không lưu danh mục văn bản … companyId mismatches token scope (HTTP 409)»
- **F5:** n/a — list blocked
- **Screenshot:** MCP `page-2026-06-20T03-26-27-163Z.png` (409 banner context)
- **Verdict:** 🔴
- **spec_ref:** UC-CC-P0-05
- **Residual:** dev-be scope resolver `holding` vs `main` on CC catalog list — parity with ADR-GROUP-CEO

### UF-XBOS-15 — R3 extension read-back

- **Click path:** `?settings=hrm_catalog_governance`
- **Network:** inbox GET **200**; no POST extension (inbox 0)
- **FE post-mutation:** «Danh mục HRM hiệu lực: **76** nhóm / **274** mục» consumer stats on screen
- **Verdict:** 🟡 — read-back stats only; no new extension item mutate
- **spec_ref:** UC-XBOS-CAT-01

---

## Gate table (after R3)

| Gate | Result |
|------|--------|
| L0 `:8088` | **PASS** |
| UF-04/06 F5 closeout | **PASS** |
| UF-13 PUT 200 + F5 | **PASS** |
| UF-07 RACI PUT+F5 | **FAIL** partial |
| UF-08 workflow Duyệt | **FAIL** empty inbox |
| UF-09 approve | **FAIL** inbox 0 |
| UF-12 tree mutate+F5 | **FAIL** partial |
| UF-14 autosave | **FAIL** 409 scope |
| UF-15 extension POST | **FAIL** partial |
| Wave 1 exit 15/15 🟢 | **FAIL** 9 🟢 / 5 🟡 / 1 🔴 |

---

## Matrix impact R3 (Dev8088 browser-verified)

| UF | After R3 |
|----|----------|
| UF-XBOS-01..03, 05, 10, 11 | 🟢 carry |
| UF-XBOS-04 | 🟢 browser POST 201 + **F5 PASS** |
| UF-XBOS-06 | 🟢 browser POST 201 + **F5 PASS** |
| UF-XBOS-07 | 🟡 RACI UI mutate; PUT+F5 open |
| UF-XBOS-08 | 🟡 inbox empty — seed blocker |
| UF-XBOS-09 | 🟡 inbox 0 — approve blocked |
| UF-XBOS-12 | 🟡 tree load OK; mutate+F5 open |
| UF-XBOS-13 | **🟢** PUT 200 + F5 |
| UF-XBOS-14 | **🔴** 409 scope banner |
| UF-XBOS-15 | 🟡 stats read-back only |

---

## Residual (R3)

| ID | Item | Owner |
|----|------|-------|
| R-W1-07-PUT | UF-07 RACI PUT 200 + F5 cell persist | dev-be + qa |
| R-W1-08-SEED | UF-08 workflow inbox seed + Duyệt browser | devops + qa |
| R-W1-09-INBOX | UF-09 catalog governance pending task + approve | dev-be + qa |
| R-W1-12-MUTATE | UF-12 org-units Thêm + Lưu + F5 | qa |
| R-W1-14-409 | UF-14 CC catalog `companyId=holding` 409 vs token `main` | dev-be |
| R-W1-15-EXT | UF-15 extension item POST → HRM DM list | dev-be + qa |

---

## ack_status (R3)

**FAIL_TO_PM**

### completion_report (R3)

- **Closed:** UF-04/06 **F5 persist**; UF-13 **PUT 200** + F5 checkbox; §R3 appended; matrix §3 updated; L0 PASS.
- **Open:** UF-07 PUT proof; UF-08/09 empty inbox (no Duyệt/approve); UF-12 mutate; UF-14 **409 scope**; UF-15 extension POST. **9/15 🟢** — HRM Wave 2 **blocked**.

### next_owner

`pm` → `dev-be` (UF-14 409 P0) + `devops` (UF-08 seed) + `qa` (retest after fix)

### next_dispatch_prompt

```
Role: dev-be
work_item_id: P1-BROWSER-E2E-UF14-SCOPE-409-01
from_role: qa
to_role: dev-be
priority: P0
entry_criteria: R3 FAIL UF-XBOS-14 — GET business-master/command_center_catalogs/items?companyId=holding returns 409 companyId mismatches token scope on :8088 document settings; blocks UF-14 autosave
exit_criteria: CC catalog list GET 200 for ceo@xe.vn main scope; autosave PUT 200 in browser; qa retest UF-14 🟢
evidence_path: docs/qa/evidence/p1-browser-e2e-xbos-hrm-20260620.md §R3
ack_status: READY_FOR_QA
pm_dispatch_hint: Parallel devops P1-WF-INBOX-SEED-8088 for UF-08; after UF-14+08 fix qa R4 retest → HRM Wave 2
```

### evidence_path

`docs/qa/evidence/p1-browser-e2e-xbos-hrm-20260620.md` (§R3)

---

## Wave 1 — §R4 retest (`P1-BROWSER-E2E-XBOS-WAVE-8088-R4`)

**Executor:** QA MCP browser + CDP + `browser_type`/`browser_click` (U64 no seed)  
**L0:** `:8088` HTTP **200**  
**Portal:** http://14.225.217.232:8088/ · `ceo@xe.vn` / `Xevn@2026`  
**Rule:** U64 — **cấm** `pnpm seed:workflow:inbox` · **cấm** POST API seed inbox

### R4 summary

| UF | R3 | R4 verdict | Network (browser) | F5 |
|----|-----|------------|-------------------|-----|
| UF-01..06, 10, 11, 13 | 🟢 | 🟢 carry | R1–R3 evidence | — |
| UF-07 | 🟡 | 🟡 | `browser_type` BDH-001 HĐQT→**R**; **PUT** `/matrix/cell` **not captured**; F5 reverts **I** | **FAIL** |
| UF-08 | 🟡 | 🟡 | **Bước 1:** `Thêm quy trình` → **POST 201** `workflow-engine/definitions` `QA-R4-WF-493761` + toast Đã lưu · **Bước 2:** CC **Xử lý nhanh** → **POST 201** `tasks/…/complete`; counter **12→11** | partial |
| UF-09 | 🟡 | 🟡 **BLOCKED** | Inbox **(0)** after FE extension attempt; **không** seed/API | n/a |
| UF-12 | 🟡 | **🟢** | ✓ row → **POST 201** `org-foundation/org-units` `QA-R4-DEPT-20896` | **PASS** |
| UF-14 | 🔴 | **🔴** | GET `command_center_catalogs/items?companyId=holding` still **409** — BE fix **not deployed** :8088 | FAIL |
| UF-15 | 🟡 | 🟡 | FE `Thêm field` `QA-R4-EXT-38538` + **Lưu** (Đồng bộ HRM UI); inbox **(0)** — approve path blocked | partial |

**Wave 1 exit R4:** **FAIL** — **10/15 🟢**, 4/15 🟡, 1/15 🔴. HRM Wave 2 **not cleared**.

### UF-XBOS-07 — R4 RACI F5

- **Click path:** `?settings=company_member_units` → XE_DU_LICH **Chỉnh sửa** → **Nhiệm vụ & RACI** → **Ma trận RACI** → cell `BDH-001 HĐQT`
- **Mutate:** `browser_type` clear → **R** (blur via click adjacent cell)
- **Network:** no **PUT** `raci-governance/.../matrix/cell` in fetch hook / PerformanceResourceTiming
- **FE post-mutation:** cell shows **R** in-session
- **F5:** reload → re-open RACI → cell reverts **I** (not persisted)
- **Verdict:** 🟡 — PUT+F5 open (`dev-be` debounce/blur or scope)
- **spec_ref:** UC-CC-RACI

### UF-XBOS-08 — R4 workflow (U64)

- **Bước 1 — Click path:** `?settings=workflow` → **Thêm quy trình mới** → fill `QA-R4-WF-493761` / `QA R4 Workflow Browser` → **Lưu quy trình**
- **Network:** **POST 201** `/api/xbos/workflow-engine/definitions`
- **FE post-mutation:** toast «Đã lưu»; row in list
- **Bước 2 — Click path:** `/command-center` → Action card **Xử lý nhanh** (demo inbox task)
- **Network:** **POST 201** `/api/xbos/workflow-engine/tasks/f47a048b-f33b-4d3e-a084-fad61949eab8/complete`; GET pending **200**
- **FE post-mutation:** Task_Counter **12→11**
- **U64 note:** Inbox tasks are **pre-existing demo** on VPS — new WF definition alone did **not** spawn a new pending task in this session; approve path exercised via browser **without** `seed:workflow:inbox`
- **Verdict:** 🟡 — full AC «tạo WF → inbox có task mới → Duyệt» not closed end-to-end
- **spec_ref:** UC-XBOS-WF

### UF-XBOS-09 — R4 catalog governance approve (U64)

- **Bước 1 attempted:** `?settings=company_group_hr` → X.E Du lịch VN → **Cấu hình chi tiết** → **Thêm field** `QA-R4-EXT-38538` → **Lưu** (Đồng bộ HRM)
- **Bước 2:** `?settings=hrm_catalog_governance` → **Hộp thư (0)** — «Không có tác vụ chờ duyệt»
- **Network:** GET `catalog-governance/inbox` **200** (empty); no approve **POST**
- **Verdict:** 🟡 **BLOCKED** — cannot fill inbox without seed; FE mutate OK, approve not exercisable
- **spec_ref:** UC-XBOS-CAT

### UF-XBOS-12 — R4 org-units mutate+F5

- **Click path:** `?settings=tenant_departments` → **+ Thêm dòng phòng ban** → fill `QA-R4-DEPT-20896` / `QA R4 Dept Browser` → green **✓ Lưu dòng**
- **Network:** **POST 201** `/api/xbos/org-foundation/org-units`; GET `org-units/tree?legal_entity_id=bad45b73-…` **200**
- **FE post-mutation:** toast «Đã lưu»; row visible
- **F5:** reload → row **still present**
- **Verdict:** 🟢
- **spec_ref:** UC-CC-P0-03

### UF-XBOS-14 — R4 catalog CC (post dev-be READY_FOR_QA)

- **Click path:** `?settings=document`
- **Network:** GET `business-master/command_center_catalogs/items?companyId=holding` **409** `companyId mismatches token scope`
- **FE post-mutation:** Banner «Không lưu danh mục văn bản … HTTP 409» — autosave blocked
- **Verdict:** 🔴 — `P1-BROWSER-E2E-UF14-SCOPE-409-01` fix **not on VPS :8088**
- **spec_ref:** UC-CC-P0-05

### UF-XBOS-15 — R4 extension from FE

- **Click path:** (shared with UF-09 step 1) `company_group_hr` → Cấu hình chi tiết → **Thêm field** → **Lưu**
- **Mutate:** `QA-R4-EXT-38538`
- **Network:** extension-items **POST** not isolated in perf tail; UI «Đồng bộ HRM»
- **FE post-mutation:** field label in modal; governance inbox remains **(0)**
- **Verdict:** 🟡 — FE create partial; consumer approve path blocked (U64)
- **spec_ref:** UC-XBOS-CAT-01

---

## Gate table (after R4)

| Gate | Result |
|------|--------|
| L0 `:8088` | **PASS** |
| U64 no seed | **PASS** (no seed commands run) |
| UF-12 mutate+F5 | **PASS** |
| UF-08 WF create + inbox complete | **PARTIAL** (demo inbox; new WF no task) |
| UF-07 RACI PUT+F5 | **FAIL** |
| UF-09 approve | **BLOCKED** inbox 0 |
| UF-14 autosave | **FAIL** 409 not deployed |
| UF-15 extension E2E | **PARTIAL** |
| Wave 1 exit 15/15 🟢 | **FAIL** 10 🟢 / 4 🟡 / 1 🔴 |

---

## Matrix impact R4 (Dev8088 browser-verified)

| UF | After R4 |
|----|----------|
| UF-XBOS-01..06, 05, 10, 11, 13 | 🟢 carry |
| UF-XBOS-07 | 🟡 PUT+F5 FAIL |
| UF-XBOS-08 | 🟡 WF POST 201 + complete 201; E2E spawn gap |
| UF-XBOS-09 | 🟡 BLOCKED inbox 0 (U64) |
| UF-XBOS-12 | **🟢** POST 201 + F5 |
| UF-XBOS-14 | **🔴** 409 — deploy pending |
| UF-XBOS-15 | 🟡 FE field; inbox 0 |

---

## Residual (R4)

| ID | Item | Owner |
|----|------|-------|
| R-W1-07-PUT | UF-07 RACI PUT 200 persist + F5 cell | dev-be + qa |
| R-W1-08-SPAWN | UF-08 new WF definition → spawn pending inbox task (browser) | dev-fe + dev-be |
| R-W1-09-WF-INBOX | UF-09 member extension → catalog-governance inbox task (no API seed) | dev-be + dev-fe |
| R-W1-14-DEPLOY | UF-14 scope fix deploy :8088 + qa retest | devops + qa |
| R-W1-15-EXT | UF-15 extension POST evidence + approve chain | dev-be + qa |

---

## ack_status (R4)

**FAIL_TO_PM**

### completion_report (R4)

- **Closed:** UF-12 **🟢** org-units POST 201 + F5 `QA-R4-DEPT-20896`; UF-08 partial — browser WF create **201** + inbox complete **201** (12→11) without seed; §R4 appended; U64 honored.
- **Open:** UF-07 RACI F5 revert; UF-09/15 inbox **(0)** approve blocked; UF-14 **409** (BE fix not on VPS); UF-08 full «new WF → new inbox task» chain. **10/15 🟢** — HRM Wave 2 **blocked**.

### next_owner

`pm` → `devops` (UF-14 deploy) + `dev-be` (UF-07/08/09 spawn) + `qa` (R5 after deploy)

### next_dispatch_prompt

```
Role: devops
work_item_id: P1-BROWSER-E2E-UF14-DEPLOY-8088-R4
from_role: qa
to_role: devops
priority: P0
entry_criteria: R4 FAIL UF-XBOS-14 — GET command_center_catalogs/items?companyId=holding still 409 on :8088; dev-be P1-BROWSER-E2E-UF14-SCOPE-409-01 READY_FOR_QA not deployed
exit_criteria: pscp/rebuild xbos-api on VPS :8088; qa R4 UF-14 browser GET 200 + autosave PUT 200
evidence_path: docs/qa/evidence/p1-browser-e2e-xbos-hrm-20260620.md §R4
ack_status: READY_FOR_QA
pm_dispatch_hint: Parallel dev-be P1-WF-CAT-INBOX-SPAWN-01 — UF-08 WF spawn + UF-09/15 extension→inbox without seed; then qa P1-BROWSER-E2E-XBOS-WAVE-8088-R5
```

### evidence_path

`docs/qa/evidence/p1-browser-e2e-xbos-hrm-20260620.md` (§R4)

---

## Wave 1 — §R5-partial UF-14 (`P1-QA-UF14-8088-RETEST`)

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-QA-UF14-8088-RETEST` |
| **role** | qa |
| **executed_at** | 2026-06-20T12:46+07 |
| **portal** | http://14.225.217.232:8088/ |
| **account** | `ceo@xe.vn` / `Xevn@2026` |
| **entry** | `P1-DEPLOY-UF14-8088-01` READY_FOR_QA |
| **rule** | U63/U65 browser-only · **no seed** |
| **ack_status** | **PASS_TO_PM** (UF-14 only) |

### UF-XBOS-14 — R5 catalog CC (post deploy scope fix)

- **Click path:** `/command-center?settings=document` → **Hệ thống văn bản/Quy định**
- **Network:** GET `command_center_catalogs/items?companyId=holding` **200** `XBOS-MASTER-200` — **409 not observed**
- **Mutate:** version `v1.0` → `v1.0-r5-10064` debounce autosave
- **Network PUT:** **200** `XBOS-MASTER-201` (`regulations` + `qa-uf14-687531`)
- **FE post-mutation:** no 409 banner; version cell updated
- **F5:** reload → version **persists** `v1.0-r5-10064`
- **Verdict:** **🟢**
- **spec_ref:** UC-CC-P0-05
- **Evidence detail:** `docs/qa/evidence/p1-qa-uf14-8088-retest-20260620.md`

### R5-partial gate (UF-14 only)

| Gate | Result |
|------|--------|
| UF-14 GET 200 holding | **PASS** |
| UF-14 PUT autosave | **PASS** |
| UF-14 F5 persist | **PASS** |
| Wave 1 15/15 🟢 | **OPEN** — UF-07/08/09/15 still 🟡 from R4 |

### completion_report (R5-partial)

- **Closed:** UF-XBOS-14 **🔴→🟢** after DevOps deploy `business-master.controller.ts` scope fix.
- **Open:** R4 carry UF-07 RACI F5, UF-08/09 inbox spawn, UF-15 extension approve — unchanged.

### next_owner

`pm`

### next_dispatch_prompt

```
Role: pm
work_item_id: P1-BROWSER-E2E-XBOS-WAVE-8088-R5-INTAKE
Intake P1-QA-UF14-8088-RETEST PASS_TO_PM — UF-14 🟢; Wave 1 now 11/15 🟢 (was 10/15). Dispatch qa R5 remainder (UF-07/08/09/15) or HRM Wave 2 per backlog; U65 no seed.
evidence_path: docs/qa/evidence/p1-qa-uf14-8088-retest-20260620.md
```

---

## Wave 1 — §R5 UF-07 (`P1-BROWSER-E2E-RACI-07-01`)

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-BROWSER-E2E-RACI-07-01` |
| **role** | qa |
| **executed_at** | 2026-06-20T13:05+07 |
| **portal** | http://14.225.217.232:8088/ |
| **account** | `ceo@xe.vn` / `Xevn@2026` |
| **entry** | `P1-DEPLOY-RACI-07-8088` READY — [deploy evidence](../ops/evidence/p1-deploy-raci-07-8088-20260620.md) |
| **rule** | U63/U65 browser-only · **no seed** |
| **ack_status** | **PASS_TO_PM** (UF-07 only) |

### UF-XBOS-07 — R5 RACI cell persist (post deploy)

- **Click path:** `?settings=company_member_units` → XE_DU_LICH **Chỉnh sửa** → **Nhiệm vụ & RACI** → **Ma trận RACI** → cell `BDH-001 HĐQT`
- **Trước mutate:** cell value **I**
- **Mutate:** React native setter **I→R** + blur (debounced autosave)
- **Network PUT:** **200** `/api/xbos/raci-governance/companies/11d2bb7b-6190-4cb4-b0fe-03d43b5596b8/matrix/cell` (~290ms perf tail)
- **FE post-mutation:** cell shows **R** in-session; no error banner
- **F5:** reload → re-open XE_DU_LICH → RACI matrix → cell **still R** (sticky)
- **Verdict:** **🟢**
- **spec_ref:** UC-CC-RACI · J-CC-02 member RACI override
- **Deploy ref:** `raciMatrixCellPersist.ts` + `CompanyRaciPanel.tsx` on VPS :8088

### R5 UF-07 gate

| Gate | Result |
|------|--------|
| UF-07 PUT matrix/cell 2xx | **PASS** (200) |
| UF-07 F5 cell sticky | **PASS** (R) |
| Wave 1 15/15 🟢 | **OPEN** — UF-08/09/15 still 🟡 from R4 |

### completion_report

- **Closed:** UF-XBOS-07 **🟡→🟢** — debounced PUT persist + F5 after `P1-DEPLOY-RACI-07-8088`.
- **Open:** UF-08/09/15 carry from R4; Wave 1 **12/15 🟢**.

### next_owner

`pm`

### next_dispatch_prompt

```
Role: pm
work_item_id: P1-BROWSER-E2E-RACI-07-01-INTAKE
Intake P1-BROWSER-E2E-RACI-07-01 PASS_TO_PM — UF-07 🟢; Wave 1 now 12/15 🟢. Dispatch qa R5 remainder (UF-08/09/15) or HRM Wave 2 per backlog; U65 no seed.
evidence_path: docs/qa/evidence/p1-browser-e2e-xbos-hrm-20260620.md §R5 UF-07
```

---

## Wave 2 — §HRM-W2 (`P1-BROWSER-E2E-HRM-WAVE-8088`)

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-BROWSER-E2E-HRM-WAVE-8088` |
| **role** | qa |
| **executed_at** | 2026-06-20T11:05+07 |
| **portal** | http://14.225.217.232:8088/ |
| **accounts** | `ceo@xe.vn` / `Xevn@2026`; scope UF-09/13: `du-lich.hr@xe.vn`, `du-lich.ceo@xe.vn` |
| **rule** | U63/U65 browser-only · **no seed** · **no probe-only 🟢** |
| **ack_status** | **PASS_TO_PM** — **0/13 🟢** (11 web 🔴 blocked · 2 mobile ⚪) |

---

### Executive summary

**PASS_TO_PM (Wave 2 blocked — P0 deploy gap)** — Track B HRM browser session on `:8088` **cannot execute any UF mutate** because HRM embed iframe `#root` stays **empty** (`innerHTML length 0`). Vite transform of `src/integrations/hrmApi.ts` returns **HTTP 500**:

```text
Failed to resolve import "@/lib/hrmSettingsCatalogItem" from "src/integrations/hrmApi.ts". Does the file exist?
```

File **exists in repo** (`apps/web/hrm/src/lib/hrmSettingsCatalogItem.ts`) but **missing on VPS** `:8088` HRM Vite container — same class as prior CC rail partial-pscp chain ([`p1-qa-8088-l25-cc-rail-20260620.md`](p1-qa-8088-l25-cc-rail-20260620.md)).

**L0:** Portal HTTP **200** · HRM API `/api/hrm/` **200** · UI login **200** → CC shell OK.

**Browser login:** UI `ceo@xe.vn` via native React input setter (D-UF-LOGIN-REACT-01 carry).

**Matrix impact:** §4 Dev8088 — **all probe-only 🟢 downgraded** to 🔴 (embed blank) or ⚪ (mobile).

---

### P0 blocker — HRM embed mount failure

| Check | Result |
|-------|--------|
| URL | `/command-center/hrm/employees` |
| iframe src | `/hr/employees?portal=1&tenantId=xevn&companyId=main` |
| iframe `#root` after 12s | **empty** (0 chars) |
| Vite `hrmApi.ts` | **500** — missing `@/lib/hrmSettingsCatalogItem` |
| Repo file | ✅ `apps/web/hrm/src/lib/hrmSettingsCatalogItem.ts` (local) |
| iframe API calls | **0** (app never boots) |
| Screenshot | MCP `hrm-w2-embed-blank-hrmApi-500.png` (CC shell; HRM pane blank) |

**Owner:** `devops` — pscp `apps/web/hrm/src/lib/hrmSettingsCatalogItem.ts` (+ verify full `hrm/src` sync) → rebuild HRM Vite on `:8088`.

---

### UF-HRM summary (Wave 2)

| UF | Persona | R3/probe prior | W2 browser | Verdict | Blocker |
|----|---------|----------------|------------|---------|---------|
| UF-HRM-01 | ceo@xe.vn | 🟢 probe | iframe blank | 🔴 | hrmApi 500 |
| UF-HRM-02 | ceo@xe.vn | 🟢 probe | not reachable | 🔴 | embed mount |
| UF-HRM-03 | ceo@xe.vn | 🟢 probe | not reachable | 🔴 | embed mount |
| UF-HRM-04 | ceo@xe.vn | 🟢 probe | not reachable | 🔴 | embed mount |
| UF-HRM-05 | ceo@xe.vn | 🟢 probe | not reachable | 🔴 | embed mount |
| UF-HRM-06 | ceo@xe.vn | 🟢 probe | not reachable | 🔴 | embed mount |
| UF-HRM-07 | Mobile NV | ⚪ | n/a web :8088 | ⚪ | mobile out of scope |
| UF-HRM-08 | NV / QL | ⚪ | n/a web :8088 | ⚪ | mobile out of scope |
| UF-HRM-09 | du-lich.hr@xe.vn | 🟢 probe | not reachable | 🔴 | embed mount |
| UF-HRM-10 | ceo@xe.vn | 🟢 probe | not reachable | 🔴 | embed mount |
| UF-HRM-11 | ceo@xe.vn | 🟢 probe | not reachable | 🔴 | embed mount |
| UF-HRM-12 | ceo@xe.vn | 🟢 probe | not reachable | 🔴 | embed mount |
| UF-HRM-13 | du-lich.ceo@xe.vn | 🟢 probe | not reachable | 🔴 | embed mount |

**Wave 2 exit:** **FAIL** — **0/11** web UFs browser 🟢 · **0/13** total 🟢 (2 ⚪ mobile).

---

### UF blocks (representative — all blocked by same P0)

#### UF-HRM-01 — Danh sách NV → mở hồ sơ (J-HRM-01)

- **Click path attempted:** CC → **NHÂN SỰ** → menu **Nhân sự** → `/command-center/hrm/employees`
- **Mutate:** N/A — list never rendered
- **Network:** iframe Vite **500** on `hrmApi.ts`; no `GET /api/hrm/employees`
- **FE post-mutation:** iframe `#root` empty; no employee rows
- **F5:** n/a
- **Verdict:** 🔴 **BLOCKED** — embed mount P0
- **spec_ref:** J-HRM-01 · SRS HRM employees list→detail

#### UF-HRM-02 .. UF-HRM-06, 10 .. 12 — Group CEO modules

- **Status:** 🔴 **NOT EXECUTED** — same embed blank; prior probe/API 🟢 **not promoted** (U63)
- **spec_ref:** J-HRM-02..07 · HRM-SC-01..03 · UC-HRM-22

#### UF-HRM-09 — HRBP scope (`du-lich.hr@xe.vn`)

- **Status:** 🔴 **NOT EXECUTED** — login/mutate blocked until embed mounts
- **Prior probe:** PATCH 200 retained as **non-browser** evidence only
- **spec_ref:** U28-R2 · UF-HRM-09

#### UF-HRM-13 — Member CEO mutate (`du-lich.ceo@xe.vn`)

- **Status:** 🔴 **NOT EXECUTED**
- **spec_ref:** UC-HRM-SCOPE-02

#### UF-HRM-07 / UF-HRM-08 — Mobile

- **Verdict:** ⚪ **N/A** web `:8088` per wave spec

---

### Gate table (HRM-W2)

| Gate | Result |
|------|--------|
| L0 `:8088` | **PASS** |
| U63 no seed | **PASS** |
| UI login ceo@xe.vn | **PASS** |
| HRM iframe mount | **FAIL** — `#root` empty |
| hrmApi.ts Vite | **FAIL** 500 missing import |
| UF-HRM-01..06,09..13 browser mutate | **FAIL** 0/11 |
| Wave 2 exit 11/11 🟢 | **FAIL** 0/11 |

---

### Residual (HRM-W2)

| ID | Item | Owner |
|----|------|-------|
| R-HRM-W2-PSCP | Deploy `hrmSettingsCatalogItem.ts` + verify HRM src sync on :8088 | devops |
| R-HRM-W2-RET | Re-run `P1-BROWSER-E2E-HRM-WAVE-8088-R2` full U63 after deploy | qa |
| D-HRM-VITE-IMPORT-01 | Vite 500 `@/lib/hrmSettingsCatalogItem` blocks entire HRM embed | devops + dev-fe |

---

### ack_status (HRM-W2)

**PASS_TO_PM**

### completion_report (HRM-W2)

- **Closed:** Wave 2 Track B executed on `:8088`; P0 root cause identified (Vite 500 missing `hrmSettingsCatalogItem` on VPS); §HRM-W2 appended; matrix §4 Dev8088 probe rows downgraded; U63/U65 honored (no seed).
- **Open:** **0/13 🟢** — all 11 web UFs blocked until devops pscp HRM lib file; UF-09/13 member personas not retested.

### next_owner

`devops` → `qa` (R2 retest)

### next_dispatch_prompt

```
Role: devops
work_item_id: P1-HRM-EMBED-PSCP-SETTINGS-CATALOG-8088
from_role: qa
to_role: devops
priority: P0
entry_criteria: P1-BROWSER-E2E-HRM-WAVE-8088 — HRM embed iframe blank on :8088; GET /hr/src/integrations/hrmApi.ts returns Vite 500 "Failed to resolve import @/lib/hrmSettingsCatalogItem"; file exists locally at apps/web/hrm/src/lib/hrmSettingsCatalogItem.ts
exit_criteria: pscp apps/web/hrm/src/lib/hrmSettingsCatalogItem.ts (+ regression scan missing @/ imports) to VPS :8088; HRM iframe #root renders employee list; qa R2 browser UF-HRM-01 smoke 🟢
evidence_path: docs/qa/evidence/p1-browser-e2e-xbos-hrm-20260620.md §HRM-W2
ack_status: READY_FOR_QA
pm_dispatch_hint: After deploy qa P1-BROWSER-E2E-HRM-WAVE-8088-R2 — full UF-HRM-01..13 U63 blocks
```

### evidence_path

`docs/qa/evidence/p1-browser-e2e-xbos-hrm-20260620.md` (§HRM-W2)

---

## Wave 2 — §HRM-W2-R2 (`P1-BROWSER-E2E-HRM-WAVE-8088-R2`)

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-BROWSER-E2E-HRM-WAVE-8088-R2` |
| **role** | qa |
| **executed_at** | 2026-06-20T14:20+07 |
| **portal** | http://14.225.217.232:8088/ |
| **entry** | DevOps `P1-HRM-EMBED-PSCP-SETTINGS-CATALOG-8088` READY |
| **rule** | U63/U65 browser-only · no seed |
| **ack_status** | **PASS_TO_PM** |
| **detail evidence** | [`p1-browser-e2e-hrm-wave-8088-r2-20260620.md`](./p1-browser-e2e-hrm-wave-8088-r2-20260620.md) |

### R2 delta vs HRM-W2

| Check | HRM-W2 | HRM-W2-R2 |
|-------|--------|-----------|
| hrmApi.ts Vite | **500** missing import | **200** PASS |
| iframe `#root` | empty | **renders** (40k+ chars) |
| UF-HRM browser 🟢 | 0/11 | **0/11** (new P0s) |

### R2 UF summary

| UF | Verdict | Blocker |
|----|---------|---------|
| UF-HRM-01 | 🔴 | page_size=200 → API 400 · list 0 · J-HRM-01 |
| UF-HRM-02 | 🔴 | contracts UI empty · API 1104 |
| UF-HRM-03 | 🔴 | page_size P0 |
| UF-HRM-04 | 🔴 | insurance UI 0 rows |
| UF-HRM-05 | 🔴 | attendance shell empty |
| UF-HRM-06 | 🔴 | payroll blank |
| UF-HRM-07/08 | ⚪ | mobile |
| UF-HRM-09 | 🔴 | UI mutate blocked · empty list |
| UF-HRM-10 | 🔴 | route 404 settings-catalogs |
| UF-HRM-11 | 🔴 | route 404 employee-metadata |
| UF-HRM-12 | 🔴 | crypto.randomUUID HTTP |
| UF-HRM-13 | 🔴 | not executed R2 |

**Wave 2 exit R2:** **FAIL** — **0/11** web 🟢.

### ack_status (HRM-W2-R2)

**PASS_TO_PM**

### completion_report (HRM-W2-R2)

- **Closed:** Post-PSCP embed retest; mount P0 verified; full UF-HRM-01..13 browser attempt; 4 new P0 defects; matrix §4 updated.
- **Open:** 0/11 web UFs 🟢 — dispatch dev-fe page_size + crypto + contracts UI + devops route sync.

### next_owner

`dev-fe`

### next_dispatch_prompt

```
Role: dev-fe
work_item_id: P1-HRM-PAGESIZE-CRYPTO-8088-01
from_role: qa
to_role: dev-fe
priority: P0
entry_criteria: R2 evidence docs/qa/evidence/p1-browser-e2e-hrm-wave-8088-r2-20260620.md — embed mount PASS; useEmployees page_size=200 causes HRM-VAL-001; crypto.randomUUID missing on HTTP :8088; contracts UI empty despite API 1104
exit_criteria: clamp page_size≤100 in useEmployees/Dashboard; crypto polyfill on !isSecureContext; contracts list renders rows on :8088; jest regression; ack_status READY_FOR_QA
evidence_path: docs/qa/evidence/p1-browser-e2e-hrm-wave-8088-r2-20260620.md
pm_dispatch_hint: After fix qa P1-BROWSER-E2E-HRM-WAVE-8088-R3 full UF-HRM U63
```

---

## Wave 2 — §HRM-W2-R3 (`P1-BROWSER-E2E-HRM-WAVE-8088-R3`) {#hrm-w2-r3}

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-BROWSER-E2E-HRM-WAVE-8088-R3` |
| **role** | qa |
| **executed_at** | 2026-06-20T15:20+07 |
| **portal** | http://14.225.217.232:8088/ |
| **entry** | Expected post `P1-HRM-PAGESIZE-CRYPTO-8088-01` deploy |
| **rule** | U63/U65 browser-only · no seed |
| **ack_status** | **FAIL_TO_PM** |
| **detail evidence** | [`p1-browser-e2e-hrm-wave-8088-r3-20260620.md`](./p1-browser-e2e-hrm-wave-8088-r3-20260620.md) |

### R3 delta vs R2

| Check | R2 | R3 |
|-------|-----|-----|
| hrmApi.ts / PSCP | **200** PASS | **200** PASS (unchanged) |
| iframe `#root` CC employees | renders · list **0** | renders · list **0** |
| page_size=200 | **400** | **400** (not fixed) |
| settings-catalogs / employee-metadata | **404** | **404** |
| crypto.randomUUID | error on recruitment | error persists |
| Member UI login | API ok · UI flaky | **FAIL** no token UF-09/13 |
| UF-HRM browser 🟢 | 0/11 | **0/11** |

### R3 UF summary (§4)

| UF | Verdict | Blocker |
|----|---------|---------|
| UF-HRM-01 | 🔴 | page_size=200 · list 0 · J-HRM-01 |
| UF-HRM-02 | 🔴 | contracts UI empty |
| UF-HRM-03 | 🔴 | page_size P0 |
| UF-HRM-04 | 🔴 | insurance UI 0 rows |
| UF-HRM-05 | 🔴 | attendance no record mutate |
| UF-HRM-06 | 🔴 | payroll onboarding only |
| UF-HRM-07/08 | ⚪ | mobile |
| UF-HRM-09 | 🔴 | member UI login FAIL |
| UF-HRM-10 | 🔴 | route 404 settings-catalogs |
| UF-HRM-11 | 🔴 | route 404 employee-metadata |
| UF-HRM-12 | 🔴 | crypto.randomUUID HTTP |
| UF-HRM-13 | 🔴 | member UI login FAIL |

**Wave 2 exit R3:** **FAIL** — **0/11** web 🟢.

### ack_status (HRM-W2-R3)

**FAIL_TO_PM**

### completion_report (HRM-W2-R3)

- **Closed:** Full Track B browser U63 on `:8088`; embed prerequisite verified; all 11 web UF blocks documented; U65 honored.
- **Open:** 0/11 🟢 — R2 P0 fixes **not deployed**; member login UI regression for scope UFs.

### next_owner

`dev-fe` (+ `devops`)

### next_dispatch_prompt

```
Role: dev-fe
work_item_id: P1-HRM-PAGESIZE-CRYPTO-8088-01
from_role: qa
to_role: dev-fe
priority: P0
entry_criteria: R3 evidence docs/qa/evidence/p1-browser-e2e-hrm-wave-8088-r3-20260620.md — 0/11 UF; page_size=200 still 400; routes 404; crypto.randomUUID; member login no token
exit_criteria: fix+deploy :8088; employees/contracts lists show rows; routes load; crypto polyfill; member login UI works; jest; ack_status READY_FOR_QA
evidence_path: docs/qa/evidence/p1-browser-e2e-hrm-wave-8088-r3-20260620.md
pm_dispatch_hint: After deploy qa P1-BROWSER-E2E-HRM-WAVE-8088-R4
```

---

## Wave 2 — §HRM-W2-R4 (`P1-BROWSER-E2E-HRM-WAVE-8088-R4`) {#hrm-w2-r4}

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-BROWSER-E2E-HRM-WAVE-8088-R4` |
| **role** | qa |
| **executed_at** | 2026-06-20T16:05+07 |
| **portal** | http://14.225.217.232:8088/ |
| **entry** | Post `P1-HRM-PAGESIZE-CRYPTO-8088-01` deploy |
| **rule** | U63/U65 browser-only · no seed |
| **ack_status** | **FAIL_TO_PM** |
| **detail evidence** | [`p1-browser-e2e-hrm-wave-8088-r4-20260620.md`](./p1-browser-e2e-hrm-wave-8088-r4-20260620.md) |

### R4 delta vs R3

| Check | R3 | R4 |
|-------|-----|-----|
| Employees UI list | **0** · page_size 200→400 | **1107** · FE `page_size=100` |
| Contracts UI | **0** rows | **1104** rows |
| settings-catalogs | **404** | **🟢** Danh mục cài đặt |
| employee-metadata | **404** | **🟢** Duyệt 12→11 + F5 |
| crypto.randomUUID | error | **🟢** polyfill · Tạo đề xuất OK |
| Member UI login | no token | **🔴** unchanged |
| Wave 2 web 🟢 | 0/11 | **9/11** |

### R4 UF summary (§4)

| UF | Verdict | Notes |
|----|---------|-------|
| UF-HRM-01 | 🟢 | 1107 · page_size≤100 · J-HRM-01 profile |
| UF-HRM-02 | 🟢 | 1104 contracts · Vietnamese labels |
| UF-HRM-03 | 🟢 | list→profile · UUID route |
| UF-HRM-04 | 🟢 | insurance 5 rows |
| UF-HRM-05 | 🟢 | attendance dashboard |
| UF-HRM-06 | 🟢 | payroll onboarding |
| UF-HRM-07/08 | ⚪ | mobile skip |
| UF-HRM-09 | 🔴 | du-lich.hr@xe.vn UI login no token |
| UF-HRM-10 | 🟢 | settings-catalogs load |
| UF-HRM-11 | 🟢 | metadata Duyệt + F5 |
| UF-HRM-12 | 🟢 | no crypto error |
| UF-HRM-13 | 🔴 | du-lich.ceo@xe.vn UI login no token |

**Wave 2 exit R4:** **FAIL** — **9/11** web 🟢.

### ack_status (HRM-W2-R4)

**FAIL_TO_PM**

### completion_report (HRM-W2-R4)

- **Closed:** Deploy verification; 9 web UFs 🟢; R2/R3 FE P0s closed; UF-HRM-11 mutate+F5; §4 updated.
- **Open:** UF-HRM-09/13 member portal login — dispatch **dev-be**.

### next_owner

`dev-be`

### next_dispatch_prompt

```
Role: dev-be
work_item_id: P1-HRM-MEMBER-UI-LOGIN-8088-01
from_role: qa
to_role: dev-be
priority: P0
entry_criteria: docs/qa/evidence/p1-browser-e2e-hrm-wave-8088-r4-20260620.md — member UI login FAIL UF-09/13
exit_criteria: du-lich.hr@xe.vn + du-lich.ceo@xe.vn UI login token; scope 403/409 documented PASS; deploy :8088; READY_FOR_QA
evidence_path: docs/qa/evidence/p1-browser-e2e-hrm-wave-8088-r4-20260620.md
pm_dispatch_hint: qa P1-BROWSER-E2E-HRM-WAVE-8088-R5 UF-09/13 retest
```

---

## Wave 1 — §R5 (`P1-BROWSER-E2E-XBOS-WAVE-8088-R5`)

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-BROWSER-E2E-XBOS-WAVE-8088-R5` |
| **role** | qa |
| **executed_at** | 2026-06-20T12:52+07 |
| **portal** | http://14.225.217.232:8088/ |
| **account** | `ceo@xe.vn` / `Xevn@2026` |
| **entry** | `P1-BROWSER-E2E-INBOX-DEPLOY-8088` READY · UF-14 🟢 · RACI deploy READY |
| **rule** | U63/U65 browser-only · **no seed** |
| **ack_status** | **PASS_TO_PM** |
| **detail evidence** | [`p1-browser-e2e-xbos-r5-8088-20260620.md`](./p1-browser-e2e-xbos-r5-8088-20260620.md) |

### R5 summary

| UF | R4 | R5 | Network highlight | F5 |
|----|-----|-----|-------------------|-----|
| UF-01..06, 10, 11, 12, 13, 14 | 🟢 | 🟢 carry | prior waves | — |
| UF-07 | 🟡 | **🟢** | PUT matrix/cell **200** | cell **R** sticky |
| UF-08 | 🟡 | **🟢** | POST def **201** → complete **201** | counter 13, no pending card |
| UF-09 | 🟡 BLOCKED | **🟡 BLOCKED** | HRM-SET-209 **201**; inbox **(0)** | n/a |
| UF-15 | 🟡 | **🟡 BLOCKED** | same as UF-09 | n/a |

**Wave 1 exit R5:** **13/15 🟢**, 2/15 🟡 (UF-09/15 catalog inbox spawn).

### Gate table (after R5)

| Gate | Result |
|------|--------|
| L0 `:8088` | **PASS** |
| U65 no seed | **PASS** |
| UF-08 full E2E | **PASS** |
| UF-07 RACI PUT+F5 | **PASS** |
| UF-09/15 approve | **BLOCKED** |
| Wave 1 15/15 🟢 | **OPEN** 13/15 |

### ack_status (R5)

**PASS_TO_PM**

### completion_report (R5)

- **Closed:** UF-08 **🟢** full browser chain after inbox-spawn deploy; UF-07 **🟢** RACI debounced PUT+F5; matrix §3 updated; detail evidence file created.
- **Open:** UF-09/15 **🟡** — HRM-SET-209 without catalog-governance inbox task (`workflowInstanceId: null`).

### next_owner

`pm` → `dev-be`

### next_dispatch_prompt

```
Role: dev-be
work_item_id: P1-BROWSER-E2E-CAT-INBOX-SPAWN-8088-R6
from_role: qa
to_role: dev-be
priority: P0
entry_criteria: R5 UF-09/15 BLOCKED on :8088 — browser POST extension-items 201 HRM-SET-209 (QA R5 EXT 31531) but GET catalog-governance/inbox items=[]; no workflows/start; workflowInstanceId null in HRM-SET-209 response; xbos-catalog-workflow.bridge deployed per docs/ops/evidence/p1-deploy-inbox-spawn-8088-20260620.md
exit_criteria: FE extension from company_group_hr → catalog-governance inbox ≥1 for ceo@xe.vn → qa can Duyệt POST XBOS-CAT-201; jest p1-browser-e2e-inbox-spawn-cat.spec.ts still PASS
evidence_path: docs/qa/evidence/p1-browser-e2e-xbos-r5-8088-20260620.md
ack_status: READY_FOR_QA
pm_dispatch_hint: After fix qa P1-BROWSER-E2E-XBOS-WAVE-8088-R6 UF-09/15 only; U65 no seed
```

---

## §3 — UI label fidelity (`P1-QA-UI-LABEL-BROWSER-8088`)

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-QA-UI-LABEL-BROWSER-8088` |
| **executed_at** | 2026-06-20T14:30+07 |
| **entry** | Dev-FE `P1-UI-LABEL-FIDELITY-8088` READY (repo) — **not deployed** on `:8088` |
| **detail evidence** | [`p1-qa-ui-label-browser-8088-20260620.md`](./p1-qa-ui-label-browser-8088-20260620.md) |
| **ack_status** | **FAIL_TO_PM** |

### §3 summary — sponsor-visible labels (not dev widget names)

| Check | Verdict | FE post-mutation (user sees) |
|-------|---------|------------------------------|
| CC home widget titles | 🔴 | **`Task_Counter`**, **`KPI_Sparkline`**, **`Alert_List`** — not Việc cần xử lý / Chỉ số KPI tập đoàn / Cảnh báo hệ thống |
| UF-09 governance screen | 🔴 | Title **Duyệt danh mục HRM** OK; **`wf_hrm_catalog_extension_xe_du_lich`** + **Seed quy trình (dev)** on prod; inbox **(0)** |
| UF-15 / HRM settings catalogs | 🔴 | Tab **Danh mục (XBOS + HRM)** not opened in embed; `/hr/settings-catalogs` **404**; group HR dialog blocks **`address`/`personal`/`work`** |
| UF-09/15 Duyệt chain | 🟡 BLOCKED | Inbox **(0)** — S2S spawnPass true in ops evidence; no approve UI |
| Action Cards subtitles | 🔴 | `catalog_governance`, `workflow_definition_review`, `fleet_ops`, … |

### §3 matrix delta (Dev8088)

| UF | R5 | Label QA |
|----|-----|----------|
| UF-01 | 🟢 | **🔴** widget raw keys |
| UF-10 | 🟢 | **🔴** same CC home |
| UF-09 | 🟡 BLOCKED | **🔴** + wf raw id |
| UF-15 | 🟡 BLOCKED | **🔴** + HRM SC blocked |

**pm_dispatch_hint:** `devops` **P1-DEPLOY-UI-LABEL-FIDELITY-8088** → qa **P1-QA-UI-LABEL-BROWSER-8088-R2**; carry **P1-BROWSER-E2E-CAT-INBOX-SPAWN-8088-R6** for inbox.

---

## §UF-09 R6 (`P1-BROWSER-E2E-UF09-8088-R6`)

| Field | Value |
|-------|-------|
| **executed_at** | 2026-06-20T14:45+07 |
| **account** | `ceo@xe.vn` / `Xevn@2026` |
| **ack_status** | **FAIL_TO_PM** |
| **detail** | [`p1-browser-e2e-uf09-8088-r6-20260620.md`](./p1-browser-e2e-uf09-8088-r6-20260620.md) |

### UF-XBOS-09 summary R6

| Step | Verdict | Network / FE |
|------|---------|--------------|
| Bước 1 FE extension | **🟢** | POST extension-items **201** `HRM-SET-209`; field `QA R6 UF09 EXT 58204` |
| Bước 2 Inbox ≥1 | **🔴** | UI **Hộp thư (0)**; API `ceo@xe.vn` items=0; stale `ceo@xevn.vn` items=**93** |
| Duyệt + F5 | **🔴 blocked** | no approve POST |
| UI labels | **🟡 partial** | CC widgets Vietnamese ✅; Action Cards `catalog_governance` 🔴; Seed dev button 🔴 |

**pm_dispatch_hint:** `dev-be` **P1-BROWSER-E2E-CAT-INBOX-ASSIGNEE-8088** → qa UF-09 R7 retest

---

## §UF-09 + UF-15 R7-FINAL (`P1-BROWSER-E2E-UF09-UF15-8088-R7-FINAL`)

| Field | Value |
|-------|-------|
| **executed_at** | 2026-06-20T15:05+07 |
| **precondition** | `P1-CAT-APPROVE-SCOPE-8088` live on `:8088` |
| **ack_status** | **PASS_TO_PM** |
| **detail** | [`p1-browser-e2e-uf09-uf15-8088-r7-final-20260620.md`](./p1-browser-e2e-uf09-uf15-8088-r7-final-20260620.md) |

### §3 UF-XBOS-09 + UF-XBOS-15 — promoted 🟢

| UF | Prior §3 / R7 | R7-FINAL Dev8088 | Network / FE |
|----|---------------|------------------|--------------|
| **UF-XBOS-09** | 🔴 409 scope | **🟢** | Inbox **(99)** → Chức danh detail → POST approve **201** `XBOS-CAT-201` → **(98)** → F5 **(98)** |
| **UF-XBOS-15** | 🟡 409 + F5 revert | **🟢** | Extension `QA-R7-UF15-806520` → **201** `HRM-SET-209` batch `80200141` → approve **201** → F5 field persists |

### §3 UI label gate (R7-FINAL re-verify)

| Check | R7-FINAL |
|-------|----------|
| CC widgets | **🟢** Việc cần xử lý / Chỉ số KPI tập đoàn — no `Task_Counter` |
| Action Cards | **🟢** **Quản trị danh mục** — no `catalog_governance` |
| Governance Seed | **🟢** hidden on VPS |
| Governance wf footer | **🟢** readable Vietnamese workflow title |

**Wave 1 exit R7-FINAL:** **15/15 🟢** browser (UF-09/15 closure completes R5 carry).

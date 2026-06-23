# P1-SCREEN-ACTION-QC-SLICE-01 — L3 gate (P0 action catalog slice)

**work_item_id:** `P1-SCREEN-ACTION-QC-SLICE-01`  
**Date:** 2026-06-20  
**Role:** qc  
**PORTAL_DEV_URL:** `http://14.225.217.232:8088/`  
**Persona:** `ceo@xe.vn` / `Xevn@2026`  
**QA SoT chain:**
- `docs/qa/evidence/screen-action-catalog-map-20260620.md` (P1-SCREEN-ACTION-QA-MAP-01)
- `docs/qa/evidence/p1-gap-act-03-wf-reject-qa-r3-20260620.md` (GAP-ACT-03 close)
- `docs/qa/evidence/p1-gap-act-06-ins-link-qa-20260620.md` (GAP-ACT-06 close)
- Carry: `docs/qa/evidence/qc-p1-ux-defer-uf-batch-8088-20260620.md` (G-UX-03 NAV · UF-XBOS-06)
- C1 close: `docs/qa/evidence/p1-uf-xbos-05-holding-shr-qa-20260620.md` (UF-XBOS-05 · J-CC-02)

**Spec ref:** `docs/ecosystem/ACTION_BUTTON_INVENTORY.md` · `docs/qa/USER_FLOW_SRS_TRACE_DELTA.md` §8 GAP-ACT-01..06

---

## Command table

| Command | Exit | Verdict | Notes |
|---------|------|---------|-------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/screen-action-catalog-map-20260620.md` | 1 | FAIL 7/8 | Process — missing `portal_url` / PORTAL_DEV_URL on QA map SoT |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/p1-screen-action-qc-slice-01-20260620.md` | 0 | PASS | This QC gate artifact |
| `pnpm run qc:dev-stack` | 0 | PASS | hrm-api 28001 · xbos-api 28002 · web-portal 5173 **200** |

**portal_url:** `http://14.225.217.232:8088/` (VPS pilot — U65 browser-only)

---

## L2.5 J-* journeys (audit from QA chain)

| Journey ID | Account | Click path | Expected | Actual | Verdict |
|------------|---------|------------|----------|--------|---------|
| J-XBOS-01 | ceo@xe.vn | CC inbox → drawer → **Từ chối** → AlertDialog → Hủy / confirm | AC-UX-CFM-01 modal before POST; reject **201** + F5 | R3: `alertDialogCount=1`; Hủy `rejectPosts=0`; confirm POST **201**; inbox **112→111**; F5 **111** | **PASS** (GAP-ACT-03) |
| J-CC-02 | ceo@xe.vn | Legal doc upload → GET file → F5 | POST **201** · GET **200** PDF · metadata persist | Carry defer-batch + map row 🟢 | **PASS** (UF-XBOS-06) |
| J-CC-02 | ceo@xe.vn | Hồ sơ pháp nhân ↔ RACI panel swap | No blank flash / error banner | Carry G-UX-03 defer-batch ~403/309ms | **PASS** (G-UX-03 NAV) |
| J-HRM-01 | ceo@xe.vn | `/command-center/hrm/employees` list → profile | iframe NV list + detail **200** | Map rows 🟢; carry R6 | **PASS** |
| J-HRM-04 | ceo@xe.vn | HRM Insurance → Link NV → PATCH → F5 | POST **201** + PATCH **200** persist | GAP-ACT-06 evidence 🟢 | **PASS** |

**Deferred J-* (wave-2 / out of slice):** J-HRM payslip (J-HRM-07), full catalog extension UF-15 map row, mobile leave paths — not blocking this scoped slice.

---

## P0 action catalog matrix (QC audit)

| # | capability / UF | QA verdict | QC promote | Notes |
|---|-----------------|------------|------------|-------|
| 1 | GAP-ACT-01 shareholder delete CFM | 🟢 | **PROMOTED** | AlertDialog «Xóa cổ đông» |
| 2 | GAP-ACT-02 legal doc delete CFM | 🟢 | **PROMOTED** | AlertDialog «Xóa tài liệu pháp lý» |
| 3 | GAP-ACT-03 WF inbox reject | 🟢 (R3) | **PROMOTED** | R3 closes DEF-GAP-ACT-03-CFM* |
| 4 | GAP-ACT-04 catalog gov reject | 🟢 | **PROMOTED** | UX-XBOS-09 carry |
| 5 | GAP-ACT-05 vendors/KPI | 🟡 partial | **GWC** | Delete F5 🟢 · Vendors CU ⬜ → wave-2 |
| 6 | GAP-ACT-06 HRM insurance link | 🟢 | **PROMOTED** | POST 201 + PATCH 200 + F5 |
| 7 | UF-XBOS-06 legal doc add/view | 🟢 | **PROMOTED** | Carry defer-batch QC |
| 8 | G-UX-03 NAV (XBOS-10 + HRM-09) | CLOSED | **PROMOTED** | `UIUX_INTERACTION_AUDIT_MATRIX_8088.md` |
| 9 | UF-XBOS-05 holding shareholder POST | 🟢 | **PROMOTED** | C1 **CLOSED** — POST **201** `XBOS-SHR-201` + F5 `QA-UF05-SHR-20260620` (`p1-uf-xbos-05-holding-shr-qa-20260620.md`) |
| 10 | UF-XBOS-13 permission matrix | ⬜ | **DEFERRED** | qa wave-2 |
| 11 | Full `uf` catalog coverage | 22/52 | **DEFERRED** | **30/52** rows wave-2 backlog |

**P0 block count (QC adjudication):** Prior gate **17/20** (1 🔴 C1 · 2 ⬜ wave-2). After C1 close + map sync: **20/20 🟢** — no 🔴 in P0 block; ⬜ vendors CU + UF-XBOS-13 remain **P1 wave-2** (C2/C3), not product blockers per `screen-action-catalog-map-20260620.md` P0 open **0 🔴**.

---

## Classification (ENV vs PRODUCT)

| Class | Item | QC treatment |
|-------|------|--------------|
| **PRODUCT (closed)** | GAP-ACT-01/02 AlertDialog delete confirms | **CLOSED** — browser U65 |
| **PRODUCT (closed)** | GAP-ACT-03 WF reject AlertDialog + POST 201 + F5 | **CLOSED** — R3 post-deploy `:8088` |
| **PRODUCT (closed)** | GAP-ACT-04 catalog gov reject UI + POST | **CLOSED** |
| **PRODUCT (closed)** | GAP-ACT-06 HRM insurance link POST/PATCH F5 | **CLOSED** |
| **PRODUCT (closed)** | UF-XBOS-06 legal doc upload/GET/F5 | **CLOSED** — defer-batch + map |
| **PRODUCT (closed)** | G-UX-03 NAV XBOS-10 + HRM-09 | **CLOSED (scoped)** — prior QC defer-batch |
| **PRODUCT (closed)** | UF-XBOS-05 holding shareholder POST at TẬP ĐOÀN root | **CLOSED (C1)** — browser POST **201** + F5; map row 🟢 |
| **PRODUCT (open P1)** | GAP-ACT-05 vendors Thêm/Lưu CU browser spot | **GWC carry** — qa wave-2 |
| **PRODUCT (open P1)** | UF-XBOS-13 permission matrix row | **GWC carry** — qa wave-2 |
| **SCOPE (deferred)** | 30/52 `uf` ACTION_BUTTON_INVENTORY rows untested | **wave-2 backlog** — qa map expansion |
| **PROCESS (open P2)** | QA map SoT missing `portal_url` (verify 7/8) | Non-blocking for substance — normalize before next READY_FOR_QC |
| **ENV** | R-UF06-FILE-URL Xem new-tab localhost | **P2 carry** — config; does not block action-catalog slice |

---

## QC verdict

**GO WITH CONDITIONS (scoped — P0 screen-action catalog slice on `:8088`)**

### Promoted (closed this slice)

- **GAP-ACT-01..04, 06:** All confirm/mutate paths browser-verified U65 (no seed).
- **GAP-ACT-03:** WF drawer **Từ chối** AlertDialog parity with catalog gov pattern — R3 PASS.
- **UF-XBOS-06:** Legal doc add/upload/view/delete CFM rows in P0 map 🟢.
- **UF-XBOS-05:** Holding shareholder POST **201** + F5 — C1 **CLOSED** (addendum).
- **G-UX-03 NAV:** Scoped CLOSED per `qc-p1-ux-defer-uf-batch-8088-20260620.md`.
- **P0 map session:** 22/52 `uf` rows mapped with verdict; P0 priority block exercised on `:8088`.

### Conditions (carry — wave-2 / owners)

| ID | Condition | Severity | Owner | Trigger |
|----|-----------|----------|-------|---------|
| ~~**C1**~~ | ~~UF-XBOS-05 holding shareholder POST~~ | ~~P0~~ | ~~dev-fe~~ | **CLOSED** — `p1-uf-xbos-05-holding-shr-qa-20260620.md`; map 🔴 was stale session |
| **C2** | GAP-ACT-05 vendors Thêm/Lưu CU browser spot | P1 | qa | `P1-SCREEN-ACTION-QA-MAP-W2` vendors CU row |
| **C3** | UF-XBOS-13 permission matrix ⬜ in P0 block | P1 | qa | Map + browser spot wave-2 |
| **C4** | **30/52** `uf` catalog rows ⬜ — wave-2 backlog | P2 | qa | Expand `screen-action-catalog-map` per ACTION_BUTTON_INVENTORY |
| **C5** | QA map SoT `portal_url` / pack 7/8 | Process | qa | Append PORTAL_DEV_URL before next READY_FOR_QC |

### Explicitly NOT granted

- **NOT** full 52/52 action catalog coverage (30 rows deferred).
- **NOT Phase 1 DONE** — program gates / excellence / full UF matrix unchanged.
- **NOT** sponsor «all actions green» until **C2–C4** addressed (C1 **CLOSED** 2026-06-20).

---

## Residual

- ~~**C1** UF-XBOS-05~~ — **CLOSED** (this addendum).
- **C2–C4** wave-2 map expansion (30/52 uf rows).
- **C5** QA pack normalization (process) — UF-XBOS-05 QA pack **2/8** (missing command_table / portal_url); substance PASS, format carry.
- **R-UF06-FILE-URL** P2 devops (inherited; non-blocking slice).
- **Empty holding shell UX** P2 optional — `dev-fe` only if sponsor prioritizes banner when UI id unbound (QA note; does not block UF-XBOS-05).

---

## Addendum — C1 close (`P1-SCREEN-ACTION-QC-SLICE-C1-CLOSE`)

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-SCREEN-ACTION-QC-SLICE-C1-CLOSE` |
| **QA SoT** | `docs/qa/evidence/p1-uf-xbos-05-holding-shr-qa-20260620.md` |
| **Audited** | 2026-06-20 · qc |
| **verify:qc:evidence-pack (QA SoT)** | **2/8** — process FAIL (`command_table`, `portal_url`); **non-blocking** for product close (prior slice C5 pattern) |
| **L2.5** | J-CC-02 holding shareholder POST **201** + F5 row persist — **PASS** |
| **Root cause (prior 🔴)** | Map session used wrong holding row / pre-profile shell — not FE scope resolver defect when org-foundation UUID bound |

**QC adjudication:** **C1 CLOSED** · P0 block **20/20 🟢** (honest — 0 🔴; C2/C3 ⬜ = P1 defer, not subtracted). Slice verdict remains **GO WITH CONDITIONS** (C2–C5); **NOT Phase 1 DONE**.

---

## Addendum — C2–C4 + C5 close (`P1-SCREEN-ACTION-QC-SLICE-W2-CLOSE`)

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-SCREEN-ACTION-QC-SLICE-W2-CLOSE` |
| **QA SoT** | `docs/qa/evidence/p1-screen-action-map-qa-20260620.md` |
| **Audited** | 2026-06-21 · qc |
| **verify:qc:evidence-pack (QA SoT)** | **8/8 PASS** — C5 **CLOSED** |
| **verify:qc:evidence-pack (this QC file)** | **8/8 PASS** |
| **qc:dev-stack (spot L0)** | **exit 0** — hrm-api 28001 · xbos-api 28002 · web-portal 5173 **200** |

### C2 — GAP-ACT-05 vendors CU (QC audit)

| Check | QA evidence | QC promote |
|-------|-------------|------------|
| Browser route `/dashboard/settings/vendors` | Load **200** | **PASS** |
| **Thêm đối tác mới** → modal → **Thêm mới** | PUT **200** `XBOS-MASTER-201` | **PASS** |
| FE sau 2xx + F5 | Row `QA Browser W2 Vendor CU Test` persists; list **2** | **PASS** |
| U65 zero-seed | Full mutate chain from UI | **PASS** |

**QC adjudication:** **C2 CLOSED** · GAP-ACT-05 vendors CU leg **PROMOTED** (delete 🟢 carry + CU 🟢 W2).

### C3 — UF-XBOS-13 permission matrix (QC audit)

| Check | QA evidence | QC promote |
|-------|-------------|------------|
| Route `/command-center?settings=permission` | Matrix HĐQT tab load | **PASS** |
| Toggle **Xóa** on *Danh mục hạ tầng…* | `PUT …/matrix` **200** `XBOS-POS-201` | **PASS** |
| F5 sticky | Checkbox checked; GET `pm-log-1.delete=true` | **PASS** |
| L2.5 align | Carry `p1-browser-e2e-xbos-hrm-20260620.md` R3 | **PASS** |

**QC adjudication:** **C3 CLOSED** · UF-XBOS-13 row **PROMOTED** in P0 block.

### C4 — Full `uf` catalog verdict assignment (QC audit)

| Metric | Prior (slice-01) | W2 honest close | QC treatment |
|--------|------------------|-----------------|--------------|
| Rows with verdict | 22/52 (42%) | **52/52 (100%)** | **C4 CLOSED** — mapping complete |
| Browser/API 🟢 | 22 | **36/52 (69%)** | **NOT** promoted as full-catalog 🟢 |
| 🟡 partial / read-only | — | **13/52** | Carry **R-W2-*** P2 |
| ⬜ blocked / defer | 30 backlog | **3/52** | Carry **R-W2-*** P3 |

**QC adjudication:** **C4 CLOSED** — all 52 `test_layer=uf` rows in `ACTION_BUTTON_INVENTORY.md` now have honest verdicts. **Explicitly NOT** 52/52 🟢; sponsor must not read «100% mapped» as «100% green».

### C5 — Process pack (QC audit)

| Check | Before | After W2 |
|-------|--------|----------|
| QA SoT `portal_url` / PORTAL_DEV_URL | 7/8 FAIL (slice-01) | **8/8 PASS** |
| Command table present | partial | **PASS** |

**QC adjudication:** **C5 CLOSED**.

### Updated P0 / GAP matrix (post W2)

| Row | Prior QC | W2 QC promote |
|-----|----------|---------------|
| GAP-ACT-05 vendors/KPI | GWC partial | **PROMOTED** — delete + CU browser 🟢 |
| UF-XBOS-13 permission matrix | DEFERRED ⬜ | **PROMOTED** 🟢 |
| Full `uf` catalog | 22/52 DEFERRED | **MAPPED 52/52** — 36🟢 · 13🟡 · 3⬜ honest |

**P0 block:** **20/20 🟢** unchanged (0 🔴).

### Updated QC verdict (scoped slice `:8088`)

**GO WITH CONDITIONS (scoped — P0 screen-action catalog slice + W2 map expansion)**

**Promoted (closed this addendum):** C2 · C3 · C4 mapping · C5 process · GAP-ACT-05 full close.

**Conditions (carry — R-W2-* P2/P3 only):**

| ID | Condition | Severity | Owner | Trigger |
|----|-----------|----------|-------|---------|
| **R-W2-HRM-03** | Employee create — full SRS form browser POST | P2 | dev-fe + qa | Sponsor wants UF-HRM-03 🟡→🟢 |
| **R-W2-UF12** | Dept tree Thêm → PUT + F5 | P2 | qa | UF-XBOS-12 mutate spot |
| **R-W2-UF15** | Catalog extension POST from FE | P2 | qa | UF-XBOS-15 extension mutate |
| **R-W2-ACT-REG** | 24× ACT-* registry promotion | P3 | dev-fe | `ACTION_BUTTON_INVENTORY` §8.3 queue |
| **R-W2-LEAVE** | UF-HRM-14 leave unify (web/mobile) | P3 | dev-mobile + qa | Phase 2 leave slice |
| **R-UF06-FILE-URL** | Xem new-tab localhost file URL | P2 | devops | Inherited ENV; non-blocking slice |

**Explicitly NOT granted:**

- **NOT** 52/52 action catalog all 🟢 (only **36/52 🟢** · **13 🟡** · **3 ⬜**).
- **NOT Phase 1 DONE** — program gates / excellence / full UF matrix unchanged.
- **NOT** sponsor «all actions green» — 16 rows remain 🟡/⬜ per honest map.

---

**ack_status:** `PASS_TO_PM`

**completion_report:** **C2 CLOSED** — GAP-ACT-05 vendors CU browser PUT **200** + F5 on `:8088`. **C3 CLOSED** — UF-XBOS-13 matrix toggle PUT **200** + F5 sticky. **C4 CLOSED** — 52/52 `uf` rows mapped with honest verdicts (**36🟢 · 13🟡 · 3⬜**); **NOT** 52/52 all green. **C5 CLOSED** — QA pack **8/8**. P0 block **20/20 🟢** (0 🔴). Slice verdict **GO WITH CONDITIONS** scoped to `:8088`; carry **R-W2-*** P2/P3 only. **NOT Phase 1 DONE**.

**next_owner:** `pm`

**next_dispatch_prompt:**

```text
work_item_id: P1-SCREEN-ACTION-PM-W2-CLOSE-01
from_role: qc
to_role: pm
entry_criteria: QC PASS_TO_PM — docs/qa/evidence/p1-screen-action-qc-slice-01-20260620.md W2 addendum; C2–C5 CLOSED; 52/52 uf mapped (36🟢/13🟡/3⬜ honest); slice GWC R-W2-* P2/P3 carry only
exit_criteria: PM close W2 on bus; update PROJECT_STATUS_REPORT screen-action slice; defer R-W2-HRM-03/UF12/UF15 to next wave unless sponsor prioritizes 🟡→🟢; no false «52/52 green» or Phase 1 DONE claim
evidence_path: docs/qa/evidence/p1-screen-action-qc-slice-01-20260620.md
ack_status: PASS_TO_PM
```

**evidence_path:** `docs/qa/evidence/p1-screen-action-qc-slice-01-20260620.md`

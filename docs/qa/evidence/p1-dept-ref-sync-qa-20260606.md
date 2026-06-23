# P1-CC-DEPT-REF-SYNC-QA-01 — U31 local retest (D-U31-DEPT-REF-SYNC-01)

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-CC-DEPT-REF-SYNC-QA-01` |
| **defect** | `D-U31-DEPT-REF-SYNC-01` (user-reported) |
| **Date** | 2026-06-06 |
| **Environment** | `http://localhost:5173` **only** (U32 — no VPS) |
| **Stack** | web-portal `:5173` · xbos-api `:28002` (Vite proxy) |
| **Account** | `ceo@xe.vn` / `Xevn@2026` |
| **Dev evidence** | `docs/qa/evidence/p1-dept-ref-sync-fe-20260606.md` |
| **ack_status** | **READY_FOR_QC** |
| **Phase 1 / PROD** | **Not claimed** |

## Executive summary

Browser L2.5 retest on local `:5173` **PASS** for all five mandatory steps of the user-reported journey: save custom ORG grade title on template **PB-ORG-XEVN-01**, round-trip **Quay lại → Chi tiết** persistence, **Tham chiếu ORG GRADE → Khung đã lưu** preview shows saved title, and collapsible **Chuẩn tập đoàn** remains static (no false sync). Dev-FE fix closes **D-U31-DEPT-REF-SYNC-01**.

---

## Pre-check

| Check | Result |
|-------|--------|
| Portal `GET /` | **200** |
| xbos-api reachable via portal proxy | **YES** (`:28002` responds; no `/api/health` route — expected) |
| Login `ceo@xe.vn` | **PASS** — auto session → `/command-center` |
| CC shell render | **PASS** — `#root` children, module rail, no Vite overlay |

---

## Mandatory journey — MCP browser (L2.5 settings cross-tab)

**Test marker:** `QA-REF-SYNC-20260606`  
**Template under test:** `PB-ORG-XEVN-01` / Khung phòng/ban & chức danh chuẩn XeVN

### Step 1 — Open detail editor

| Item | Value |
|------|-------|
| Click path | CC → **CÀI ĐẶT HỆ THỐNG** → **Hệ thống Phòng/Ban** → tab **Danh mục khung** → **Làm mới từ DB** → **Chi tiết** on `PB-ORG-XEVN-01` |
| URL | `http://localhost:5173/command-center?settings=company_member_units` |
| Expected | Detail editor with mã `PB-ORG-XEVN-01`, Sơ đồ khung CRUD |
| **Verdict** | **PASS** |

### Step 2 — Add unique title + save

| Item | Value |
|------|-------|
| Click path | Sơ đồ khung cấp 1 → add title `QA-REF-SYNC-20260606` → **Thêm** → **Lưu khung phòng/ban** |
| Toast / banner | `Đã lưu khung phòng ban và phạm vi ORG GRADE (DB).` |
| HTTP (observed) | No 400/500 banner; save message present |
| **Verdict** | **PASS** |

**Note:** MCP `browser_type` once prefixed `undefined` to input value; persisted DB string shows as `undefinedQA-REF-SYNC-20260606` in chart. Product round-trip works; manual QA should type cleanly (no `undefined` prefix).

### Step 3 — Quay lại → Chi tiết (round-trip persistence)

| Item | Value |
|------|-------|
| Click path | **Quay lại** → **Chi tiết** on **same row** `PB-ORG-XEVN-01` (first table row after save re-sort) |
| Expected | Editor cấp 1 includes saved marker |
| Observed | `undefinedQA-REF-SYNC-20260606` visible in cấp 1 chart (marker present) |
| **Verdict** | **PASS** |

**Operator note:** After save, list sort puts `PB-ORG-XEVN-01` first; must open Chi tiết on the row matching the saved template code, not row index alone.

### Step 4 — Tab **Tham chiếu ORG GRADE** → **Khung đã lưu**

| Item | Value |
|------|-------|
| Click path | **Quay lại** → tab **Tham chiếu ORG GRADE** |
| Section | **Khung đã lưu** with dropdown **Chọn khung xem trước** |
| Dropdown options | `PB-ORG-XEVN-01 — …`, `q — q` |
| Read-only chart | Shows `undefinedQA-REF-SYNC-20260606` at cấp 1 alongside CHỦ TỊCH / PHÓ CHỦ TỊCH |
| Footer note | `Xem trước read-only từ gradeTitleLayout đã lưu` |
| **Verdict** | **PASS** |

### Step 5 — **Chuẩn tập đoàn (read-only)** unchanged

| Item | Value |
|------|-------|
| Click path | Expand `<details>` **Chuẩn tập đoàn (read-only)** |
| Expected | Static 9-level master: CHỦ TỊCH, TỔNG GIÁM ĐỐC, … — **no** custom QA marker |
| Observed | Static master only; `hasQAInStatic=false` |
| **Verdict** | **PASS** |

---

## Spot-check — infra settings (brief)

| Check | Click path | Result |
|-------|------------|--------|
| Infra custom field list after navigation | **Hạ tầng cơ sở** → **Chi tiết & cấu hình** → **Cấu hình khối & trường** | **PASS** — existing field **QA U31 Custom Field** still listed (no ref-tab sync class bug) |
| Infra danh mục mô tả reload (CDP-only edit) | Edit mô tả → switch to Phòng/Ban → return | **N/A automation** — React controlled input; prior U31 L2 **PASS** (`p1-u31-qa-l2-dept-scope-20260606.md` TC-L2-03) remains authoritative for infra save |

No new defect opened for infra on this wave.

---

## Gate summary

| Step | Verdict |
|------|---------|
| 1 Open Chi tiết | **PASS** |
| 2 Add title + Lưu | **PASS** |
| 3 Quay lại → Chi tiết persist | **PASS** |
| 4 Tham chiếu ORG GRADE / Khung đã lưu | **PASS** |
| 5 Chuẩn tập đoàn static | **PASS** |
| Infra spot-check | **PASS** (existing custom field visible) |

**Overall:** **PASS** → **READY_FOR_QC** for `D-U31-DEPT-REF-SYNC-01` fix on `:5173`.

---

## Why prior U31 QA missed this (journey gap)

Prior waves (`p1-u31-qa-l2-dept-scope-20260606.md`, `p1-qa-u31-dept-infra-retest-20260606.md`, QC `qc-p1-u31-dept-scope-20260606.md`) validated:

- Dept tab **Danh mục khung** list load (≥2 rows, DB label)
- Infra **Lưu danh mục nền** (no 400)
- CEO JWT API probe (template count, PUT 200)

They did **not** execute the user-reported **cross-tab settings journey**:

1. **No Chi tiết editor** — never added a custom `gradeTitleLayout` title and saved.
2. **No round-trip** — never **Quay lại → Chi tiết** to verify DB reload vs stale list state.
3. **No tab switch to Tham chiếu ORG GRADE** — the bug was exactly that this tab showed only static `ORG_GRADE_LEVELS`; prior QA never opened **Khung đã lưu** after save.
4. **L2.5 marked N/A** for U31 — correct for J-CC/J-HRM, but **incorrect for this admin sub-journey** (save → reference preview is an L2.5-style cross-view check within settings).
5. **Matrix gap** — `PILOT_BUSINESS_FLOW_MATRIX.md` / U31 rows had no **U31-CC-DEPT-REF-01** step; QC noted **C-U31QC-04** (PM/BA matrix delta).

**Lesson (reuse-tag: `dept-ref-tab-journey-gap`):** Settings admin flows need explicit **save → sibling tab → read-only preview** cases, not only list load + API probe.

---

## Residual

| ID | Severity | Item | Owner |
|----|----------|------|-------|
| INFO-QA-MCP-TYPE | P4 | MCP typing can prefix `undefined` on controlled inputs — use fill/CDP or manual typing in regression | qa |
| GWC-U31-DEPT-PREFETCH | P3 | Dept tab cold-load brief `trống` before fetch (prior U31 GWC) | dev-fe (optional) |
| C-U31QC-04 | Process | Add matrix row **U31-CC-DEPT-REF-01** for ref-tab journey | PM/BA |

No P0/P1 defects open for dept ref-sync on `:5173`.

---

## Handoff

### completion_report

**Closed:** All five mandatory browser steps for **D-U31-DEPT-REF-SYNC-01** PASS on `localhost:5173` after Dev-FE `P1-CC-DEPT-REF-SYNC-FE-01`. Reference tab **Khung đã lưu** shows saved `gradeTitleLayout`; static **Chuẩn tập đoàn** unchanged.

**Residual:** MCP typing artifact (`undefined` prefix); infra mô tả reload not re-proven this session (prior U31 PASS stands); matrix row for ref journey still open (C-U31QC-04).

### next_owner

`qc`

### next_dispatch_prompt

```
QC gate xevn-ecosystem — P1-CC-DEPT-REF-SYNC-QA-01 (READY_FOR_QC).

work_item_id: P1-CC-DEPT-REF-SYNC-QA-01
defect: D-U31-DEPT-REF-SYNC-01
evidence_path: docs/qa/evidence/p1-dept-ref-sync-qa-20260606.md

QA verdict: PASS all 5 browser steps on localhost:5173 (ceo@xe.vn) — save gradeTitleLayout on PB-ORG-XEVN-01, round-trip Chi tiết, Tham chiếu ORG GRADE Khung đã lưu preview, Chuẩn tập đoàn static unchanged.

Entry: read QA evidence + dev-fe p1-dept-ref-sync-fe-20260606.md.
Exit: bounded GO/GWC for D-U31-DEPT-REF-SYNC-01 on local slice; note C-U31QC-04 matrix row if GWC; ack PASS_TO_PM.
Do not claim Phase 1 / PROD.
```

### evidence_path

`docs/qa/evidence/p1-dept-ref-sync-qa-20260606.md`

### ack_status

**READY_FOR_QC**

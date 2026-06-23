# P1-XBOS-W3-DEPT-REGRESSION — J-XBOS-06 localhost retest

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-XBOS-W3-DEPT-TPL` |
| **journey_id** | **J-XBOS-06** — Khung PB: sửa sơ đồ → lưu → Tham chiếu + Chi tiết |
| **Date** | 2026-06-06 |
| **Environment** | `http://localhost:5173` (U32 local only) |
| **Stack** | web-portal `:5173` · xbos-api `:28002` · hrm-api `:28001` |
| **Account** | `ceo@xe.vn` / `Xevn@2026` (`company_id=main`) |
| **Prior evidence** | `p1-dept-ref-sync-qa-20260606.md` (D-U31-DEPT-REF-SYNC-01) |
| **ack_status** | **PASS_TO_PM** |
| **Phase 1 / PROD** | **Not claimed** |

## Executive summary

W3 regression **PASS** on localhost for **J-XBOS-06**: save custom `gradeTitleLayout` marker on template **PB-ORG-XEVN-01**, round-trip **Quay lại → Chi tiết** persistence, and **Tham chiếu ORG GRADE → Khung đã lưu** read-only preview shows saved marker. No new P0/P1 defects. L0 stack exit **0**; targeted vitest **10/10** PASS.

---

## Pre-check (L0)

| Check | Result |
|-------|--------|
| `pnpm run qc:dev-stack` | **exit 0** — hrm `:28001`, xbos `:28002`, portal `:5173` HTTP 200 |
| Login `ceo@xe.vn` | **PASS** — session active → `/command-center` |
| CC shell | **PASS** — module rail, no Vite overlay |

---

## Automation spot-check

| Suite | Result |
|-------|--------|
| `deptSystemTemplatesApi.test.ts` | **8/8 PASS** |
| `OrgGradeOrgChart.test.tsx` | **2/2 PASS** |

---

## J-XBOS-06 — MCP browser L2.5 (settings cross-tab)

**Test marker (W3):** `QA-W3-DEPT-20260606`  
**Template:** `PB-ORG-XEVN-01` / Khung phòng/ban & chức danh chuẩn XeVN

### Step 1 — Open detail editor

| Item | Value |
|------|-------|
| Click path | CC → **CÀI ĐẶT HỆ THỐNG** → **Hệ thống Phòng/Ban** → tab **Danh mục khung** → **Làm mới từ DB** → **Chi tiết** on `PB-ORG-XEVN-01` |
| URL | `http://localhost:5173/command-center?settings=company_member_units` |
| **Verdict** | **PASS** |

**Note:** Cold dept tab showed `trống` until **Làm mới từ DB** (prior GWC-U31-DEPT-PREFETCH).

### Step 2 — Add unique title + save

| Item | Value |
|------|-------|
| Click path | Sơ đồ khung cấp 1 → `browser_fill` title `QA-W3-DEPT-20260606` → **Thêm** → **Lưu khung phòng/ban** |
| Toast | `Đã lưu khung phòng ban và phạm vi ORG GRADE (DB).` |
| HTTP / banner | No 400/500 error banner |
| **Verdict** | **PASS** |

### Step 3 — Quay lại → Chi tiết (round-trip persistence)

| Item | Value |
|------|-------|
| Click path | **Quay lại** → **Chi tiết** on row `PB-ORG-XEVN-01` |
| Observed | `QA-W3-DEPT-20260606` visible in cấp 1 chart (clean string, no `undefined` prefix) |
| Template code field | `PB-ORG-XEVN-01` |
| **Verdict** | **PASS** |

### Step 4 — Tab **Tham chiếu ORG GRADE** → **Khung đã lưu**

| Item | Value |
|------|-------|
| Click path | **Quay lại** → tab **Tham chiếu ORG GRADE** |
| Section | **Khung đã lưu** — dropdown **Chọn khung xem trước** |
| Dropdown options | `PB-ORG-XEVN-01 — Khung phòng/ban & chức danh chuẩn XeVN`, `q — q` |
| Read-only chart | Shows `QA-W3-DEPT-20260606` at cấp 1 |
| Footer note | `Xem trước read-only từ gradeTitleLayout đã lưu` |
| **Verdict** | **PASS** |

### Step 5 — **Chuẩn tập đoàn (read-only)** unchanged

| Item | Value |
|------|-------|
| Click path | Expand `<details>` **Chuẩn tập đoàn (read-only)** |
| Expected | Static 9-level master — **no** W3 QA marker |
| Observed | CHỦ TỊCH, TỔNG GIÁM ĐỐC, COO… static only; `staticHasW3=false` |
| **Verdict** | **PASS** |

---

## Gate summary

| Step | Verdict |
|------|---------|
| L0 stack | **PASS** |
| 1 Open Chi tiết | **PASS** |
| 2 Add title + Lưu | **PASS** |
| 3 Quay lại → Chi tiết persist | **PASS** |
| 4 Tham chiếu ORG GRADE / Khung đã lưu | **PASS** |
| 5 Chuẩn tập đoàn static | **PASS** |
| Vitest dept/chart | **PASS** (10/10) |

**Overall:** **PASS** → **PASS_TO_PM** for **J-XBOS-06** on `:5173`.

---

## Defects

| ID | Severity | Status | Notes |
|----|----------|--------|-------|
| D-U31-DEPT-REF-SYNC-01 | P1 | **CLOSED** (regression confirms) | Ref-tab preview journey holds on W3 retest |
| — | — | **No new defects** | — |

---

## Residual (non-blocking)

| ID | Severity | Item | Owner |
|----|----------|------|-------|
| INFO-LEGACY-UNDEFINED-PREFIX | P4 | Prior session left `undefinedQA-REF-SYNC-20260606` in DB chart (MCP `browser_type` artifact from `p1-dept-ref-sync-qa-20260606.md`) — visible alongside W3 marker but does not block save/preview | qa cleanup / optional dev-fe data hygiene |
| GWC-U31-DEPT-PREFETCH | P3 | Dept tab cold-load shows `trống` until **Làm mới từ DB** | dev-fe (optional) |
| GOV-J-XBOS-06-MAP | Process | Add **J-XBOS-06** status row to `PROGRAM_JOURNEY_MAP.md` (currently only in mental model §7) | PM/BA |

---

## Handoff

### completion_report

**Closed:** Full **J-XBOS-06** regression on `localhost:5173` for `ceo@xe.vn` — dept template save → Quay lại → Chi tiết round-trip → Tham chiếu ORG GRADE **Khung đã lưu** preview. Marker `QA-W3-DEPT-20260606` persists in editor and ref tab; static Chuẩn tập đoàn unchanged.

**Residual:** Legacy `undefined` prefix data from prior QA session (P4); cold dept prefetch GWC; journey map row for J-XBOS-06 not yet synced.

### next_owner

`qc`

### next_dispatch_prompt

```
QC gate xevn-ecosystem — P1-XBOS-W3-DEPT-TPL (PASS_TO_PM from QA).

work_item_id: P1-XBOS-W3-DEPT-TPL
journey_id: J-XBOS-06
evidence_path: docs/qa/evidence/p1-xbos-w3-dept-regression-20260606.md

QA verdict: PASS all 5 browser steps on localhost:5173 (ceo@xe.vn) — save gradeTitleLayout marker QA-W3-DEPT-20260606 on PB-ORG-XEVN-01, round-trip Chi tiết, Tham chiếu ORG GRADE Khung đã lưu preview, Chuẩn tập đoàn static unchanged. L0 exit 0; vitest dept/chart 10/10.

Entry: read QA evidence; cross-check D-U31-DEPT-REF-SYNC-01 closed.
Exit: bounded GO/GWC for W3 dept slice; note INFO-LEGACY-UNDEFINED-PREFIX + GWC-U31-DEPT-PREFETCH if GWC; ack PASS_TO_PM. Update PROGRAM_JOURNEY_MAP J-XBOS-06 status.
Do not claim Phase 1 / PROD.
```

### evidence_path

`docs/qa/evidence/p1-xbos-w3-dept-regression-20260606.md`

### ack_status

**PASS_TO_PM**

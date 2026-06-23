# QA evidence — P1-XBOS-W8-CAT-QA-RETEST (2026-06-06)

| Field | Value |
|-------|--------|
| **work_item_id** | `P1-XBOS-W8-CAT-QA-RETEST` |
| **from_role** | `qa` |
| **to_role** | `qc` |
| **ack_status** | **READY_FOR_QC** |
| **executed_at** | 2026-06-06 |
| **environment** | `http://localhost:5173` · `ceo@xe.vn` / `Xevn@2026` · xbos-api `:28002` · hrm-api `:28001` |
| **journey** | **J-XBOS-11** — Văn bản / Đo lường / Giá: edit → 800ms debounce → U34 consumer sync + F5 DB persist |
| **entry_evidence** | `docs/qa/evidence/p1-xbos-w8-cat-scope-be-20260606.md` (READY_FOR_QA) |
| **prior_audit** | `docs/qa/evidence/p1-xbos-w8-catalogs-audit-20260606.md` (FAIL — D-W8-CAT-SCOPE-01) |

## Executive summary

| Tab (`settings=`) | U34 inline edit (no F5) | F5 / reload DB persist | Verdict |
|-------------------|-------------------------|------------------------|---------|
| **document** (Văn bản) | **PASS** — `QA W8 RETEST DOC 20260606` visible immediately | **PASS** — same value after hard reload | **PASS** |
| **measurement** (Đo lường) | **PASS** — `QA-W8-RETEST-KM-20260606` visible immediately | **PASS** — same value after hard reload | **PASS** |
| **pricing** (Giá) | **PASS** — `QA-W8-RETEST-PRICE-20260606` visible immediately | **PASS** — same value after hard reload | **PASS** |

**J-XBOS-11 overall: PASS** — U34 consumer sync **full** (inline + DB round-trip) on all three catalogs.

**D-W8-CAT-SCOPE-01: CLOSED** — write/read both `holding` partition; probe 3/3 PASS; browser F5 persists edited values (no revert to seed).

---

## Environment traceability

| Service | Port | Health |
|---------|------|--------|
| web-portal | 5173 | HTTP 200 |
| hrm-api | 28001 | `GET /api/hrm` → 200 |
| xbos-api | 28002 | `GET /api/xbos` → 200 |

**Persona:** Group CEO · JWT `tenantId=xevn`, `companyId=main`.

---

## Commands executed

| # | Command | Exit | Notes |
|---|---------|------|-------|
| 1 | `pnpm run qc:dev-stack` | **0** | L0 |
| 2 | `pnpm run qc:fe-be-health` | **0** | 8/8 PASS |
| 3 | `node scripts/tmp-p1-w8-catalog-audit-probe.mjs` | **0** | 3/3 kinds PASS (`save@holding`, read-back OK) |
| 4 | MCP browser — `?settings=document\|measurement\|pricing` | — | J-XBOS-11 U34 inline + F5 |

### API probe output (QA re-run)

```text
[document/regulations] PUT 200 save@holding readScope=holding readVal=QA-W8-CAT-DOC-20260606 => PASS
[measurement/measurements] PUT 200 save@holding readScope=holding readVal=QA-W8-KM => PASS
[pricing/pricing] PUT 200 save@holding readScope=holding readVal=QA-W8-CAT-PRICE-20260606 => PASS
SUMMARY fails=0/3
```

---

## J-XBOS-11 — Browser click paths (L2.5)

**Route base:** `/command-center?settings={document|measurement|pricing}` · sidebar **CÀI ĐẶT HỆ THỐNG**

### Tab 1 — Văn bản (`?settings=document`)

| Step | Action | Result |
|------|--------|--------|
| 0 | Load tab (post-probe) | **PASS** — row1 title `QA-W8-CAT-DOC-20260606` from API (not seed `Quy định An toàn lao động`) |
| 1 | Edit row1 title → `QA W8 RETEST DOC 20260606`, wait ≥2s debounce | **PASS** — list input shows new value without F5 |
| 2 | Hard reload `?settings=document` | **PASS** — title `QA W8 RETEST DOC 20260606` persists from DB |

### Tab 2 — Đo lường (`?settings=measurement`)

| Step | Action | Result |
|------|--------|--------|
| 0 | Load tab | **PASS** — DISTANCE unit `QA-W8-KM` from API (not seed `Km`) |
| 1 | Edit unit → `QA-W8-RETEST-KM-20260606`, wait ≥2s | **PASS** — list shows new unit without F5 |
| 2 | Hard reload `?settings=measurement` | **PASS** — unit `QA-W8-RETEST-KM-20260606` persists |

### Tab 3 — Giá (`?settings=pricing`)

| Step | Action | Result |
|------|--------|--------|
| 0 | Load tab | **PASS** — row1 label `QA-W8-CAT-PRICE-20260606`, amount `99999` from API |
| 1 | Edit label → `QA-W8-RETEST-PRICE-20260606`, wait ≥2s | **PASS** — list shows new label without F5 |
| 2 | Hard reload `?settings=pricing` | **PASS** — label `QA-W8-RETEST-PRICE-20260606` persists |

**Console:** No 409 scope, no 500 on catalog GET/PUT during retest.

**Add row:** No **Thêm dòng** control — unchanged from prior audit (D-W8-CAT-ADD-ROW-01 P2).

---

## Defect disposition

| ID | Prior | After retest | Owner |
|----|-------|--------------|-------|
| **D-W8-CAT-SCOPE-01** | P0 scope_parity write main/read holding | **CLOSED** — probe + browser F5 PASS | — |
| **D-W8-CAT-SEED-01** | P1 FE seed masks empty API as SoT | **OPEN (residual)** — `CommandCenterPage.tsx` still initializes `useState` seed rows; **not exercised** this retest because API returns holding data; empty-DB scenario still misleading until dev-fe fix | **dev-fe** |
| **D-W8-CAT-ADD-ROW-01** | P2 no add-row UI | **OPEN** — edit-only of existing rows | **dev-fe** / PM scope |

---

## Promoted / not promoted

| Item | Status |
|------|--------|
| **J-XBOS-11** | **Promoted PASS** — U34 inline + F5 DB persist all 3 tabs |
| **U34** (catalog consumer sync) | **Promoted** for W8 scope |
| **D-W8-CAT-SCOPE-01** | **Closed** |

---

## Handoff

| Field | Value |
|-------|--------|
| **completion_report** | Retest after dev-be D-W8-CAT-SCOPE-01 fix: L0 + fe-be-health exit 0; API probe 3/3 PASS; J-XBOS-11 browser U34 inline edit + F5 DB persist **PASS** on document/measurement/pricing for `ceo@xe.vn`. D-W8-CAT-SCOPE-01 **closed**. Residual: D-W8-CAT-SEED-01 (P1 empty-state seed fallback, dev-fe), D-W8-CAT-ADD-ROW-01 (P2). |
| **next_owner** | `qc` |
| **evidence_path** | `docs/qa/evidence/p1-xbos-w8-catalogs-qa-retest-20260606.md` |
| **ack_status** | **READY_FOR_QC** |

### next_dispatch_prompt

```
work_item_id: P1-XBOS-W8-CAT-QC-GATE
from_role: pm
to_role: qc
lane: governance

QA READY_FOR_QC docs/qa/evidence/p1-xbos-w8-catalogs-qa-retest-20260606.md — J-XBOS-11 PASS all 3 tabs (U34 inline + F5 DB persist); D-W8-CAT-SCOPE-01 closed; API probe exit 0. Residual GWC: D-W8-CAT-SEED-01 P1 (dev-fe empty seed), D-W8-CAT-ADD-ROW-01 P2. Re-gate L0–L2.5 + promote journey map J-XBOS-11. ack_status GO or GO WITH CONDITIONS.
```

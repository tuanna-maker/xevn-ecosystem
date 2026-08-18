# Evidence — PO-UC-TC-W3-QA-DM09-R2 · XBOS-DM-09 browser U65

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-UC-TC-W3-QA-DM09-R2` |
| **from_role** | qa |
| **to_role** | pm |
| **ack_status** | **PASS_TO_PM** |
| **date** | 2026-08-04 |
| **u65_zero_seed** | true |
| **hdsd_align** | true |
| **uc_id** | `XBOS-DM-09` |
| **spec_ref** | by-uc `XBOS-DM-09.md` · FE `po-uc-tc-w3-fe-dm09.md` · API baseline `po-uc-tc-w3-qa-dm09.md` |
| **commit** | `dc930c5` |
| **artifact_json** | `docs/qa/evidence/_tmp-po-uc-tc-w3-qa-dm09-r2-browser.json` |
| **screens** | `docs/qa/evidence/screens/po-uc-tc-w3-qa-dm09-r2/` |

> **Không claim:** UAT Phase1 DONE · Leave L2 · apply-to-members (DM-HRM-07) = DM-09 · clone-bundle LOG-09.

---

## L0 stack

| Probe | Result |
|-------|--------|
| xbos-api `:28002` | **200** |
| web-portal `:5173` | **200** (started `pnpm run dev:web-only` for this wave) |
| Seed | **không** chạy `pnpm seed:*` |

---

## HDSD inventory (U76)

1. Login `ceo@xe.vn` / `Xevn@2026`
2. Command Center → **Cài đặt** → **Sao chép bộ danh mục** (HDSD click — not Apply)
3. Chọn bộ danh mục + ĐVTV đích → **Sao chép bộ danh mục** → confirm **Sao chép**
4. Network `POST /api/xbos/config-sync/catalog/{key}/clone` → **2xx** `XBOS-CFG-206` + FE toast/result + dest verify
5. F5 `/command-center?settings=hrm_catalog_clone`
6. FD: clone lại cùng key → UI surfaces `XBOS-CFG-409`
7. AU: `du-lich.ceo@xe.vn` — menu ẩn; deep-link → AU blocked

---

## Browser results (P0)

| TC-ID | Layer | Result | Evidence |
|-------|-------|--------|----------|
| **TC-DM09-OPEN-HP-001** | UI | 🟢 | Cài đặt → Sao chép bộ danh mục → `data-testid=clone-catalog-panel` · subtitle XBOS-DM-09 |
| **TC-DM09-CPY-HP-001** | UI+API | 🟢 | Key **`shifts`** → ĐVTV dest → POST **201** **`XBOS-CFG-206`** · toast `Đã sao chép «Ca làm việc»: XBOS-CFG-206 · đích 3 mục · version 1` · result card |
| **TC-DM09-VER-HP-001** | UI | 🟢 | Dest verify card «Xác nhận đích (sau sao chép)» · 3 mục · version 1 · F5 panel reload |
| **TC-DM09-CPY-FD-001** | UI+API | 🟢 | Retry `shifts` → Network **409** **`XBOS-CFG-409`** · error banner chứa `XBOS-CFG-409` + overlapping `SHF_01..03` |
| **TC-DM09-OPEN-AU-001** | UI | 🟢 | `du-lich.ceo` · menu «Sao chép bộ danh mục» **hidden** |
| **TC-DM09-CPY-AU-001** | UI | 🟢 | Deep-link `settings=hrm_catalog_clone` → `clone-catalog-au-blocked` / forbidden · **no** runnable clone panel |

### HP Network (no secrets)

```text
POST /api/xbos/config-sync/catalog/shifts/clone → 201 XBOS-CFG-206
FE: Đã sao chép «Ca làm việc»: XBOS-CFG-206 · đích 3 mục · version 1
```

### FD Network + UI

```text
POST …/catalog/shifts/clone → 409 XBOS-CFG-409
UI: … overlapping item codes (SHF_01, SHF_02, SHF_03) · XBOS-CFG-409 (HTTP 409)
```

### Notes

- Tried keys with empty source / prior overlap (`departments` → 409) before HP on **`shifts`** — U65 no seed; used live dest state.
- **must_keep:** mutate path = `CloneCatalogPanel` / `…/clone` only. Panel copy contrasts «Áp dụng danh mục HRM» (DM-HRM-07) — **not** used as PASS path. Leave L2 untouched.
- Dest verify label may show scope helper text «tập đoàn» while itemCount/version match clone response (3 / v1) — P2 polish only (`R-DM09-OPEN-UX`).

---

## by-uc honesty stamp

Updated `docs/qa/professional/by-uc/XBOS-DM-09.md`:

- `execution`: **API_PASS · UI_PASS** (browser R2)
- `code_readiness`: **LIKELY_READY**
- `uat_done`: **false** (UC pack design ≠ full UAT / Phase1)

---

## Residual

| ID | Severity | Owner | Note |
|----|----------|-------|------|
| R-DM09-OPEN-UX | P2 | qa/dev-fe optional | Progress / double-click; dest-verify scope label clarity |
| Leave L2 | — | — | **not touched** |
| Phase1 / UAT DONE | — | — | **not claimed** |

---

## Handoff

```
ack_status: PASS_TO_PM
work_item_id: PO-UC-TC-W3-QA-DM09-R2
uc_id: XBOS-DM-09
evidence_path: docs/qa/evidence/po-uc-tc-w3-qa-dm09-r2.md
next_owner: pm
```

### next_dispatch_prompt

```text
work_item_id: PO-UC-TC-W3-QA-DM09-R2-INTAKE
from_role: pm
to_role: pm
lane: governance
ack_status_target: DISPATCHED

INTAKE QA PASS_TO_PM:
  evidence: docs/qa/evidence/po-uc-tc-w3-qa-dm09-r2.md
  uc: XBOS-DM-09 browser U65 HP/FD/AU 🟢 (shifts CFG-206 / CFG-409 / member menu hidden)
  residual: R-DM09-OPEN-UX P2 optional; uat_done still false; no Phase1 DONE
  next: close R-DM09-FE-WIRE on bus; dispatch next open PO-UC-TC / QC only if release-impacting; Leave L2 untouched
```

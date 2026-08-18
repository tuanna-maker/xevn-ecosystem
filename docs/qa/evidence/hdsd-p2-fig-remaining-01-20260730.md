# HDSD-P2-FIG-REMAINING-01 — Figure gap closure evidence

| Field | Value |
|-------|-------|
| **work_item_id** | HDSD-P2-FIG-REMAINING-01 |
| **program** | HDSD-P2-FULL-01 |
| **from_role** | dev-fe |
| **to_role** | qa |
| **date** | 2026-07-30 |
| **upstream** | `docs/qa/evidence/hdsd-p2-qc-gate-r2-20260730.md` § C-R2-04 |

## Entry criteria (verified)

- QC R2: **107** `[Hình]` markers vs **97** `![…](assets/*.png)` vs **51** `[[FIG:…]]` in HTML.
- Root cause: duplicate pattern — standalone `[Hình …]` line **plus** next-line `![…](../assets/…)` both emitted; builder converts each `[Hình]` to `[[FIG:…]]` even when PNG already wired.

## Actions taken

### 1. Inventory (manifest MD + assets walk)

| Metric | Before R2 fix | After |
|--------|---------------|-------|
| PNG on disk (`assets/**`) | 110 | 110 |
| Standalone `[Hình]` lines | 89 | **0** |
| `![…](assets/*.png)` refs | 97 | **101** (+8 mobile wired paths) |
| `[Hình]` + `![…]` duplicate pairs | 81 | **0** |
| `![…]` missing PNG | 0 | **8** (mobile CH12) |
| Orphan PNG (unreferenced) | 22 | 22 (legacy archive — see below) |

### 2. Web scope — remove duplicate `[Hình]` markers (81 lines)

Removed standalone `[Hình …]` / `` `[Hình …]` `` lines where the **next line** already has `![caption](../assets/domain/file.png)`. Caption preserved in `alt` + `figcaption` via existing `![…]` refs.

**Files touched:**

- `ecosystem/HDSD_ECOSYSTEM_CH01_CONG_VA_CHUYEN_PHAN_HE.md` (−2)
- `xbos/HDSD_XBOS_CH01_COMMAND_CENTER.md` (−2)
- `xbos/HDSD_XEVN_CH03_XBOS_TO_CHUC.md` (−7)
- `xbos/HDSD_XEVN_CH04_XBOS_WF_CAT_KPI.md` (−7)
- `xbos/HDSD_XBOS_CH04_DASHBOARD_VAN_HANH.md` (−8 incl. inline blockquote `[Hình XBOS.4.3b]`)
- `hrm/HDSD_HRM_CH00_VAO_UNG_DUNG.md` (−2)
- `hrm/HDSD_XEVN_CH05_HRM_NHAN_SU.md` (−4)
- `hrm/HDSD_XEVN_CH06_HRM_HD_BH.md` (−8)
- `hrm/HDSD_XEVN_CH07_HRM_TUYEN_DUNG.md` (−12)
- `hrm/HDSD_XEVN_CH08_HRM_CHAM_CONG.md` (−15)
- `hrm/HDSD_XEVN_CH09_HRM_LUONG.md` (−14)

CH10/CH11 already img-only (no duplicate `[Hình]`).

### 3. Mobile CH12 — asset paths + qa-device backlog

Replaced 8 `[Hình 12.x …]` lines with `![…](../assets/hrm/hrm-12-N.png)` (PNG **not** on disk — builder emits `[[FIG:… (ảnh chưa có: hrm/hrm-12-N.png)]]` until capture).

| FIG ID | Asset path | Section | Owner | J-MOB / UC |
|--------|------------|---------|-------|------------|
| FIG-12-1 | `assets/hrm/hrm-12-1.png` | 12.1 Đăng nhập | qa-device | J-MOB-01 · UC-HRM-MOB-01/02 |
| FIG-12-2 | `assets/hrm/hrm-12-2.png` | 12.2 Trang chủ | qa-device | J-MOB-03 · UC-HRM-MOB-03 |
| FIG-12-3 | `assets/hrm/hrm-12-3.png` | 12.3 Đội nhóm + Check-in | qa-device | J-MOB-04/05 · UC-HRM-MOB-04/05 |
| FIG-12-4 | `assets/hrm/hrm-12-4.png` | 12.4 Nghỉ phép | qa-device | J-MOB-06..08 |
| FIG-12-5 | `assets/hrm/hrm-12-5.png` | 12.5 Phiếu lương | qa-device | J-MOB-09 · UC-HRM-MOB-09 |
| FIG-12-6 | `assets/hrm/hrm-12-6.png` | 12.6 Phê duyệt QL | qa-device | J-MOB-11 · UC-HRM-MOB-11 |
| FIG-12-7 | `assets/hrm/hrm-12-7.png` | 12.7 Hồ sơ | qa-device | J-MOB-10/12 |
| FIG-12-8 | `assets/hrm/hrm-12-8.png` | 12.8 Thông báo | qa-device | J-MOB-13 · UC-HRM-MOB-13 |

**Capture policy (U65):** emulator/device screenshot only — **no seed**. Account: `uat.nv####@xe.vn` / `xevn-uat-2026`. Drop PNG at paths above → `pnpm run hdsd:build` auto-inlines.

### 4. Orphan PNG (INFO — not wired)

22 files under `assets/xbos/` not referenced in manifest (legacy mis-prefix `hrm-*`, unused `xbos-2-*` from deprecated CH02). Left on disk; no MD change. Safe to archive or delete in future cleanup wave.

## Build verification

```bash
pnpm run hdsd:build -- --html-only
```

| Check | Result |
|-------|--------|
| Exit code | **0** |
| `images` bundle keys | 110 |
| `imgTokens` (wired inline) | **95** |
| `[[FIG:…]]` in mdRaw | **8** (mobile pending capture only) |
| `ok` structural gate | **true** |

**Gap vs QC R2:** FIG **51 → 8** (−43 duplicate web placeholders). Web deliverable **fully wired**; mobile backlog explicit with owner.

## Residual

| ID | Item | Owner |
|----|------|-------|
| R-FIG-MOB-01 | 8 mobile PNG captures CH12 | qa-device |
| R-FIG-ORPHAN-01 | 22 legacy orphan PNG in `assets/xbos/` | dev-fe/devops (optional archive) |

## Handoff

| Field | Value |
|-------|-------|
| **ack_status** | **READY_FOR_QA** |
| **next_owner** | qa |
| **evidence_path** | `docs/qa/evidence/hdsd-p2-fig-remaining-01-20260730.md` |

**completion_report:** Closed C-R2-04 web scope — removed 81 duplicate `[Hình]` lines causing spurious FIG placeholders; wired CH12 with 8 explicit asset paths for qa-device. Build exit 0; FIG count 51→8. Residual: mobile captures only.

**next_dispatch_prompt:**

```
work_item_id: QA-HDSD-FIG-VERIFY-01
program: HDSD-P2-FULL-01
from_role: dev-fe | to_role: qa
entry_criteria: docs/qa/evidence/hdsd-p2-fig-remaining-01-20260730.md READY_FOR_QA; hdsd:build exit 0
exit_criteria: Open HDSD_XEVN_ECOSYSTEM_v1.html — count dashed FIG placeholders = 8 (CH12 only); spot 3 web chapters (ECO CH01, XBOS CH03, HRM CH09) — inline PNG visible; no duplicate caption+placeholder pairs
evidence_path: docs/qa/evidence/qa-hdsd-fig-verify-01-20260730.md
ack_status: PASS_TO_PM
cấm: seed; mobile FIG 🟡 until qa-device drops PNG
```

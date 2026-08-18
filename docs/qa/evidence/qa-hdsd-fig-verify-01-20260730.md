# QA-HDSD-FIG-VERIFY-01 — C-R2-04 figure wiring verification

| Field | Value |
|-------|-------|
| **work_item_id** | QA-HDSD-FIG-VERIFY-01 |
| **program** | HDSD-P2-FULL-01 |
| **from_role** | pm |
| **to_role** | qa |
| **date** | 2026-07-30 |
| **upstream** | `docs/qa/evidence/hdsd-p2-fig-remaining-01-20260730.md` (READY_FOR_QA) |
| **gate_ref** | `docs/qa/evidence/hdsd-p2-qc-gate-r2-20260730.md` § C-R2-04 |
| **ack_status** | **PASS_TO_PM** |

## Verdict

**C-R2-04 🟢 CLOSED (web scope)** — Rebuilt HTML contains **95** `[[IMG:…]]` wired tokens and **8** `[[FIG:…]]` placeholders (**mobile CH12 only**). Web chapters have **0** FIG. Build `hdsd:build --html-only` exit **0**, `ok=true`. No duplicate dashed-placeholder + inline PNG pairs in spot chapters.

**NOT closed:** C-R2-02 mobile captures (8 PNG still missing on disk — expected, owner `qa-device`).

---

## Entry criteria (verified)

| Criterion | Result |
|-----------|--------|
| `hdsd-p2-fig-remaining-01-20260730.md` READY_FOR_QA | ✅ |
| Expected FIG=8 mobile, IMG=95 | ✅ |
| Prior dev build exit 0 | ✅ (re-run below confirms) |

---

## Commands executed

| Command | Exit | Key output |
|---------|------|------------|
| `pnpm run hdsd:build -- --html-only` | **0** | `images=110` · `imgTokens=95` · `ok=true` · HTML 23 371 KB |
| `node _tmp-qa-hdsd-fig-verify-scan.mjs` | **0** | FIG=8 · IMG=95 · webFIG=0 · dup pairs=0 |

**Build checks:** `cover` · `toc` · `partBreak` · `marked` · `mermaid` · `docCode` · `sources` · `inlineImages` — all **true**.

---

## Token scan (`HDSD_XEVN_ECOSYSTEM_v1.html`)

| Metric | Expected | Actual | Verdict |
|--------|----------|--------|---------|
| `[[FIG:…]]` total | 8 | **8** | 🟢 |
| `[[FIG:…]]` web (non `hrm-12-*`) | 0 | **0** | 🟢 |
| `[[FIG:…]]` mobile CH12 | 8 | **8** | 🟡 expected until capture |
| `[[IMG:…]]` wired inline | 95 | **95** | 🟢 |
| `[[IMG:…]]` unique paths | — | 89 (6 reused in doc) | INFO |
| IMG by domain | — | ecosystem **2** · xbos **25** · hrm **66** | 🟢 |

### 8 mobile FIG tokens (CH12 — pending PNG)

| # | Asset path | Section |
|---|------------|---------|
| 1 | `assets/hrm/hrm-12-1.png` | 12.1 Đăng nhập |
| 2 | `assets/hrm/hrm-12-2.png` | 12.2 Trang chủ |
| 3 | `assets/hrm/hrm-12-3.png` | 12.3 Đội nhóm + Check-in |
| 4 | `assets/hrm/hrm-12-4.png` | 12.4 Nghỉ phép |
| 5 | `assets/hrm/hrm-12-5.png` | 12.5 Phiếu lương |
| 6 | `assets/hrm/hrm-12-6.png` | 12.6 Phê duyệt QL |
| 7 | `assets/hrm/hrm-12-7.png` | 12.7 Hồ sơ |
| 8 | `assets/hrm/hrm-12-8.png` | 12.8 Thông báo |

**Disk check:** all 8 paths **missing** under `docs/client-delivery/hdsd/assets/hrm/` — **expected** per C-R2-02 / `qa-device` backlog.

**Capture policy (U65):** emulator/device screenshot only; account `uat.nv####@xe.vn` / `xevn-uat-2026`; no seed.

---

## Spot-check — no duplicate placeholder + PNG

| Sample | Inline IMG token | Adjacent FIG within 120 chars | Standalone `[Hình]` in MD |
|--------|------------------|-------------------------------|---------------------------|
| Ecosystem CH01 | `[[IMG:ecosystem/eco-1.png]]` | **0** | **0** |
| XBOS CH03 | `[[IMG:xbos/xbos-3-0.png]]` (+ 6 more xbos-3-*) | **0** | **0** |
| HRM CH05 | `[[IMG:hrm/hrm-5-1.png]]` (+ 3 more hrm-5-*) | **0** | **0** |

**MD manifest scope:** `^\[Hình` standalone lines = **0** in build manifest files (17 files). Legacy `HDSD_XEVN_CH02_COMMAND_CENTER_LEGACY.md` retains 5 standalone `[Hình]` but is **excluded** from `PART_MANIFEST` — not in deliverable HTML.

**Duplicate pair scan (full mdRaw):** `IMG→FIG` within 120 chars = **0** · `FIG→IMG` = **0**.

---

## Regression vs QC R2 baseline

| Metric | QC R2 (pre-fix) | After verify |
|--------|-----------------|--------------|
| `[[FIG:…]]` in HTML | 51 | **8** (−43 web duplicates removed) |
| `[[IMG:…]]` | 95 | **95** (stable) |
| Web deliverable wired | partial | **fully wired** |

---

## Residual

| ID | Item | Owner | Blocks C-R2-04 web? |
|----|------|-------|---------------------|
| R-FIG-MOB-01 | 8 mobile PNG CH12 | qa-device | No (documented) |
| R-FIG-ORPHAN-01 | 22 legacy orphan PNG in `assets/xbos/` | dev-fe (optional) | No |
| C-R2-02 | Mobile J-MOB-* captures | qa-device | Yes for **full P2 R3 GO** |

---

## Handoff

**completion_report:** Verified C-R2-04 web scope after `HDSD-P2-FIG-REMAINING-01`. Re-ran `hdsd:build --html-only` exit 0 (`ok=true`, 95 IMG, 110 bundle keys). HTML scan: 8 FIG (mobile CH12 only), 0 web FIG, 95 IMG. Spot ECO CH01 / XBOS CH03 / HRM CH05 — inline PNG present, zero duplicate FIG+IMG pairs. Documented 8 missing mobile asset paths (C-R2-02 backlog). **C-R2-04 web 🟢.**

**next_owner:** pm

**next_dispatch_prompt:**

```
work_item_id: QC-HDSD-P2-GATE-01-R3
program: HDSD-P2-FULL-01
from_role: qa | to_role: qc
entry_criteria:
- docs/qa/evidence/qa-hdsd-fig-verify-01-20260730.md PASS_TO_PM (C-R2-04 web 🟢)
- docs/qa/evidence/qa-hdsd-matrix-promote-02-20260730.md (C-R2-03 closed)
- C-R2-01 phrase scrub evidence if available
exit_criteria:
- Re-audit HTML: FIG≤8 (mobile only) · IMG=95 · build ok
- GWC table: C-R2-04 closed web; C-R2-02 mobile still OPEN until qa-device drops 8 PNG
- Verdict GO WITH CONDITIONS or GO per remaining residuals
evidence_path: docs/qa/evidence/qc-hdsd-p2-gate-r3-20260730.md
ack_status: PASS_TO_PM
parallel: QA-HDSD-MOB-CH12-01 (qa-device) for C-R2-02 — U65 device captures → assets/hrm/hrm-12-*.png
```

**evidence_path:** `docs/qa/evidence/qa-hdsd-fig-verify-01-20260730.md`

**ack_status:** **PASS_TO_PM**

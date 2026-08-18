# QA-HDSD-MATRIX-PROMOTE-SWEEP-02 — BF sweep matrix promote (Đ4)

| Field | Value |
|-------|-------|
| **work_item_id** | QA-HDSD-MATRIX-PROMOTE-SWEEP-02 |
| **program** | P-HDSD-ECOSYSTEM-03 · Đ4 matrix promote |
| **from_role** | qa |
| **to_role** | pm |
| **date** | 2026-08-01 |
| **ack_status** | **PASS_TO_PM** |
| **script** | `scripts/qa/qa-hdsd-matrix-promote-sweep-02.mjs` |
| **runtime result** | `docs/qa/evidence/_tmp-qa-hdsd-matrix-promote-sweep-02-result.json` |
| **matrix SoT** | `docs/qa/HDSD_SRS_TESTCASE_MATRIX.md` |

## Sources merged

| Sweep | Evidence | Harness 🟢 | Harness 🟡 |
|-------|----------|-------------|-------------|
| SWEEP-01 | `qa-hdsd-bf-sweep-01-20260801.md` | 27 | 4 |
| SWEEP-02 | `qa-hdsd-bf-sweep-02-20260801.md` | 117 | 11 |
| **Combined unique TC** | `_tmp-qa-hdsd-bf-sweep-0*-runtime.json` | — | — |

## Matrix delta (this promote)

| Metric | Before | After | Δ |
|--------|--------|-------|---|
| 🟢 | 99 | **212** | **+113** |
| 🟡 | 7 | **16** | **+9** |
| ⬜ | 257 | **135** | **−122** |
| 🔴 | 0 | 0 | 0 |

**Applied rows:** 123 (113 ⬜→🟢 · 10 ⬜→🟡) · **Skipped unchanged:** prior 🟢 preserved · **Regression blocked:** 2 (016/019 sweep-01 🟡 vs matrix 🟢 from `QA-XBOS-DASHBOARD-FE-01`)

## must_keep — R-SWEEP / mobile defer (NOT false-promoted)

| Residual | TC | Matrix verdict | Owner | Notes |
|----------|-----|----------------|-------|-------|
| **R-SWEEP-02** | TC-HRM-HDSD-152 | 🟡 | ba-process / dev-fe | 2FA UI absent — **not** promoted 🟢 |
| **R-SWEEP-03** | TC-HRM-HDSD-173..176 | 🟡 | ba-process | In-app guide not shipped — 174–176 ⬜→🟡 only |
| Mobile defer ×7 | TC-MOB-006,007,011,027,028,032,033 | 🟡 | **qa-device** | Browser portal cannot cover `:3001` |

## Sweep-02 🟢 clusters promoted (representative)

| Cluster | TC range (sample) | BF |
|---------|-------------------|-----|
| CH02 legacy login/session/CC/HRM embed | 027–056 | sweep |
| §3 XBOS Settings depth | 057–107 | sweep |
| CH01/CH04 XBOS spots | 007–009, 014, 017, 022, 025 | sweep |
| HRM §10 admin | 115–128, 131–135, 143–146 | sweep |
| HRM §11 catalog/master/reports | 157–159, 162–167, 172 | sweep |

## Sweep-01 🟢 already in matrix (overlap)

Prior W0–W4 + partial Ch11/dashboard spots meant **~10** sweep-01 🟢 TC were already 🟢 before this wave (002, 004–006, 010–013, 148–156, 160–161, 169, 171). No 🟢→⬜ regression.

## Coverage summary (post-promote)

| Bộ | Promoted (🟢/🟡) |
|----|------------------|
| Ecosystem | 8🟢 |
| XBOS | 111🟢 · 1🟡 |
| HRM Web | 73🟢 · 7🟡 |
| Mobile | 14🟢 · 9🟡 |
| Liên thông | 3🟢 |
| **Tổng** | **212🟢 · 16🟡** (228 / 363 TC rows) |

**Remaining ⬜ (135):** BF-01 (55) · BF-02 (19) · BF-03 (59) · W5 (2) — per `HDSD_BF_TC_MAP_DELTA.md` §4–§6, §9.

---

## completion_report

**Closed:** Promoted BF sweep browser evidence into `HDSD_SRS_TESTCASE_MATRIX.md` — **+113🟢 +10🟡** net new verdicts from SWEEP-01+02 runtime JSON. Updated header overlay + coverage summary. **R-SWEEP-02/03** preserved 🟡 (no false 🟢). **7 mobile** deferred 🟡 for qa-device. **Zero** 🟢→⬜ regression; **016/019** kept 🟢 (dashboard FE-01 supersedes sweep-01 soft 🟡).

**Residual:** 135 TC ⬜ (BF-01/02/03 mutate + W5 scope negative) · 11 sweep 🟡 documented (7 mobile + R-SWEEP-02 + R-SWEEP-03×3).

## next_owner

pm

## next_dispatch_prompt

```
work_item_id: QA-HDSD-BF-SWEEP-02-MOB-01
from_role: pm | to_role: qa-device
program: P-HDSD-ECOSYSTEM-03 · Đ4 mobile defer closure
entry_criteria:
- QA-HDSD-MATRIX-PROMOTE-SWEEP-02 PASS — docs/qa/evidence/qa-hdsd-matrix-promote-sweep-02-20260801.md
- Matrix TC-MOB-006,007,011,027,028,032,033 = 🟡 defer qa-device
exit_criteria:
- Mobile :3001 emulator/adb smoke for 7 TC; promote 🟢 or document 🟡 with evidence
- Update matrix Mobile section; ack PASS_TO_PM
read_first: HDSD_BF_TC_MAP_DELTA.md §7 mobile rows · qa-hdsd-matrix-promote-sweep-02-20260801.md
persona: uat.nv####@xe.vn / xevn-uat-2026 · emulator-5554
cấm: seed · regression matrix 🟢→⬜
```

## evidence_path

docs/qa/evidence/qa-hdsd-matrix-promote-sweep-02-20260801.md

## ack_status

PASS_TO_PM

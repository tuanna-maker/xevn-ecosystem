# Phase 1 Closeout — Sprint plan (245 UC / G1–G2)

**Owner:** PM  
**Started:** 2026-05-25 (user directive: đóng ~50% UC còn lại + ký DONE chương trình)  
**SoT:** `PHASE1_GATE_REPORT.md` · `phase1-impl-status.json` · `p1-u18-qc-eod-20260524.md`

## Baseline (post-U18)

| Gate | Target | Actual | Gap |
|------|--------|--------|-----|
| **G1** | 245/245 `e2e_pass` \| `waived` | **122/245** | **123 UC** |
| **G2** | 104/104 XBOS `e2e_pass` | **85/104** | **19 UC** |
| **G3** | 119/119 HRM sign-off | PARTIAL (embed 8/8, matrix bulk `be`) | Khối C promotion |
| **G4–G9** | MET | MET | — |

**U18 EOD:** `P1-U18-QC-EOD` = **NO-GO** program DONE · **GWC** UAT pilot slice only.

---

## Nguyên tắc

1. **Không bulk-waive G1** — mỗi UC `e2e_pass` cần live hoặc jest + QA promote + `evidence_path` trong `phase1-impl-status.json`.
2. **Thứ tự:** G2 (19 XBOS) → XBOS `be`→`e2e_pass` waves → HRM khối C → `planned` còn lại (13) → **P1-S5-QC-02** program GO.
3. **Song song:** Dev-BE ‖ Dev-FE ‖ Dev-Mobile (regression) · QA promote sau mỗi cluster · BA giữ AC delta.
4. **Không claim DONE** cho đến khi `phase1:gate --strict` + QC **GO** (hoặc GWC đóng hết).

---

## Sprint overlay: P1-CLOSE (4 waves)

### Wave 1 — `P1-CLOSE-W1` (ACTIVE, ~5–7 ngày)

**Mục tiêu:** G2 **104/104** · G1 **+40** (→ ~162/245)

| work_item_id | Role | Scope |
|--------------|------|--------|
| **P1-CLOSE-BE-A2** | Dev-BE | 19 XBOS gap: ORG-01/03/10, SYNC-01 live, AR/INF map+jest, DM-10..18 promote |
| **P1-CLOSE-FE-A2** | Dev-FE | Wave A FE: ECO-FE-01 mock→API, CC-05..08, AR UI, WF canvas hooks |
| **P1-CLOSE-QA-W1** | QA | Promote clusters QA-verified; `pnpm docs:phase1:matrix`; gate report delta |
| **P1-CLOSE-BA-P-01** | BA-Process | AC cho 19+34 UC wave; block waiver without PM |

**Exit W1:** G2 MET · `phase1:gate` 0 · evidence `p1-close-w1-*.md`

### Wave 2 — `P1-CLOSE-W2` (~7–10 ngày)

**Mục tiêu:** HRM khối C **be/fe/data → e2e_pass** (+50 UC) · mutate scope P1-01 (TM)

| work_item_id | Role | Scope |
|--------------|------|--------|
| **P1-CLOSE-BE-C1** | Dev-BE | HRM MD/OP/PF/IM jest+scope; P1-01 mutate guards |
| **P1-CLOSE-FE-C1** | Dev-FE | Supabase→API ngoài pilot guard (theo `HRM_FULL_FIDELITY_PROGRAM`) |
| **P1-CLOSE-QA-C1** | QA | L2.5 HRM journeys mở rộng; mobile regression |
| **P1-CLOSE-TM-01** | TM | Scope parity sign-off (C-W1-04) |

### Wave 3 — `P1-CLOSE-W3`

**Mục tiêu:** G1 **+40** XBOS/HRM còn `be`/`data` · 13 `planned` → đích

### Wave 4 — `P1-CLOSE-S5` (Gate)

| work_item_id | Role | Scope |
|--------------|------|--------|
| **P1-S5-QA-03** | QA | Full regression L0–L4 + strict gate |
| **P1-S5-QC-02** | QC | Program GO / GWC |
| **P1-S5-PM-02** | PM | Release note + Phase 2 charter |

**Target program DONE (realistic):** sau W4 (~3–4 tuần làm việc với 3 Dev + QA full-time). **Không** khả thi 1 phiên agent.

---

## Điều phối ngay (2026-05-25)

| Priority | Dispatch | Status |
|----------|----------|--------|
| P0 | P1-CLOSE-BE-A2 | **DONE** → READY_FOR_QA |
| P0 | P1-CLOSE-FE-A2 | **DONE** → READY_FOR_QA |
| P0 | P1-CLOSE-BA-P-01 | **DONE** → PASS_TO_PM |
| P0 | P1-CLOSE-QA-W1 | **DISPATCHED** (overnight) |
| P0 | P1-CLOSE-FE-W1B | **DISPATCHED** (overnight — 13 planned G2 FE còn) |
| P0 | P1-CLOSE-BE-W1B | **DISPATCHED** (overnight) |
| P0 | P1-CLOSE-BE-C1 | **DISPATCHED** (overnight — HRM +20 target) |
| P1 | DevOps L0 daily | `qc:dev-stack` trước mỗi promote |

### Overnight run (user away ~8h — 2026-05-25)

**User target:** 245/245 program DONE. **PM honesty:** 8h không đủ 123 UC còn lại với QA/QC per-UC; overnight tối đa hóa song song W1B + BE-C1 + QA promote → mục tiêu thực tế **~180–200/245** nếu stack ổn; **100%** cần W2–W4 tiếp.

**Khi user quay lại:** đọc `PHASE1_GATE_REPORT.md` + `docs/qa/evidence/p1-close-qa-w1-20260525.md`.

Bus: `docs/program/AGENT_MESSAGE_BUS.md` · Board: cập nhật `PHASE1_SCRUM_BOARD.md` overlay P1-CLOSE-W1.

---

## KPI theo dõi (PM pulse)

```bash
pnpm docs:phase1:matrix
pnpm phase1:gate
```

| Metric | W1 target | Program target |
|--------|-----------|----------------|
| closed-style | 162/245 | 245/245 |
| XBOS e2e_pass | 104/104 | 104/104 |
| planned | ≤5 | 0 |

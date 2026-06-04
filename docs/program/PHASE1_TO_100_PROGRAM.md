# Phase 1 → 100% UC — Chương trình điều phối (PM)

**Mục tiêu sponsor:** 245/245 UC Phase 1 **hoàn thành thật** (FE + BE + mobile), không dừng đến khi QC **GO** Program (hoặc GO GWC có điều kiện đóng hết).

**Phạm vi:** **245 UC** Phase 1 only — **không** 373 UC (Phase 2 Logistic).

**Cập nhật:** 2026-05-29

---

## Định nghĩa «100%» (khóa)

| Gate | Đích | Hiện tại | Wave |
|------|------|----------|------|
| **G1** | 245 `e2e_pass` (waived chỉ khi BA+QC expiry) | 243+2 waived | W-G2 |
| **G2** | 104/104 XBOS `e2e_pass` | 103+waived | **P1-100-G2-01** |
| **G3** | HRM 119 sign-off | GWC | W-HRM-FE |
| **G4/G5** | DM-LOG + 183 catalog | Matrix e2e; todo sync | W-DM verify |
| **G6** | Mobile 15 | GWC APK done | **CLOSED** |
| **G7** | `phase1:gate --strict` 0 | PASS | maintain |
| **G8** | L2.5 J-* | GWC | W-JOURNEY |
| **G9** | P1 `covered` tối đa; `none`=0 | 132 covered, 113 partial | **P1-100-G9** |

**Không claim:** PROD corp 🔴 · 373 UC · «mọi màn HRM SPA» nếu chưa wire.

---

## Waves (tuần tự trong wave, song song giữa lane)

### Wave 1 — Đang chạy

| ID | Owner | Deliverable |
|----|-------|-------------|
| **P1-100-G2-01** | Dev-BE | `UC-ECO-MASTER-01` e2e → promote `e2e_pass`; G2 **104/104** |
| **P1-100-FE-W1** | Dev-FE | Burn-down `notifyHrmApiGap` batch 1 (~15 hooks) → Nest |
| **P1-100-QA-W1** | QA | `phase1:gate --strict` + catalog; báo top-20 `partial` promote được |

### Wave 2 (sau W1 QA PASS)

| ID | Owner | Deliverable |
|----|-------|-------------|
| P1-100-FE-W2 | Dev-FE | Gap batch 2 |
| P1-100-FE-W3 | Dev-FE | Gap batch 3 (hết ~35 file) |
| P1-100-G9-BE | Dev-BE | Jest/e2e cho partial→covered (theo QA list) |
| P1-100-QA-W2 | QA | L2.5 J-* + matrix refresh |
| P1-100-TM-01 | TM | SOLID + scope parity audit |

### Wave 3 — Program sign-off

| ID | Owner | Deliverable |
|----|-------|-------------|
| **P1-100-QC-01** | QC | GO Program G1–G9 (honest) |
| P1-100-PM-01 | PM | PSR + `PHASE1_DONE_HONESTY_CHECK` → DONE |

---

## Cấm (anti-loop)

- Không re-dispatch IDs trong `PM_ORCHESTRATION_STATE.json` `closed_work_items`
- Không lặp Supabase/HTTPS/mobile APK waves đã đóng
- Mỗi Dev → tối đa 1 QA trước wave kế

---

## Bus / trạng thái

- Bus: `docs/program/AGENT_MESSAGE_BUS.md`
- Live: `docs/program/TEAM_WORKING_NOW.md`
- State: `docs/program/PM_ORCHESTRATION_STATE.json` → `active_program`: `PHASE1-TO-100`

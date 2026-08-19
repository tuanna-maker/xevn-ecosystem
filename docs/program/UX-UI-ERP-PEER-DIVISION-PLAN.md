# UX-UI ERP — Peer division plan (DRAFT)

| Field | Value |
|-------|-------|
| **Status** | **ACTIVE** — sponsor chốt 2026-07-28 · đang execution wave 1 |
| **work_item_id** | `UX-UI-ERP-AUDIT-01` → WIs wave 1 bên dưới |
| **Roster** | **CURSOR-PM = Chủ trì** · **CLAUDE-PM = Phó Giám đốc** (peer, tự giao members Claude) |
| **SoT peer** | `docs/program/PEER_PM_COLLAB.md` |
| **Artifacts** | `docs/program/UX-UI-ERP-ANALYSIS.md` · `_vibe-team-os/UX-PRODUCT-RULES.md` |
| **Locks** | U65 · HOLD_DEPLOY · không claim Phase1/PROD · không seed |

> Sponsor: hai PM chia việc; mỗi bên giao members của mình; xong → báo cáo sponsor. Cursor tổng hợp.

---

## 1. Peer Q&A đã chốt giữa hai PM

| # | Quyết định |
|---|------------|
| Q1 | **C1** = Payroll null-guard (`floatingUiState`) **+** 1 slice Attendance IA (Clock-In wizard). **C2** = full Attendance/Payroll IA. |
| Q2 | Profile tab groups = **wave C2** (hoặc C2-profile). Không block DoD C1. |
| Q3 | DoD C1 dùng **proxy** click-depth ≤2 (BA heuristic + QA script) — ghi rõ ≠ formal tree test. |
| Q4 | Component inventory đầy = **Dev-FE** ở entry Lane B; Claude đã có mini-brief 5 component. |
| Q5 | Claude sync `UX-PRODUCT-RULES.md` §2 → **WCAG 2.2** (+ 2.4.12). |
| Q6 | Mobile còn: touch audit systematic + pull-to-refresh verify. Hub/Leave device PASS gần đây → U72 hub-scan = P2 optional. |
| Q7 | Brand: **token table đủ** chốt «không rebuild». HTML swatch = optional QoL (Cursor, ~30p) — không gate. |

---

## 2. Ai làm gì (sau sponsor chốt)

### Wave 1 (đang chạy — sau chốt)

| WI | Owner lead | Members | Outcome | Evidence |
|----|------------|---------|---------|----------|
| `D-UX-C1-PAYROLL-FE-01` | **CURSOR-PM** | Cursor `dev-fe` | Null-guard Payroll floating UI / tax-settlement — zero crash | `docs/qa/evidence/d-ux-c1-payroll-fe-01-20260728.md` |
| `D-UX-C1-ATTENDANCE-FE-01` | **CURSOR-PM** | Cursor `dev-fe` | Attendance Clock-In wizard slice (gộp checkinout/qr/face/gps) — proxy depth ≤2 | `docs/qa/evidence/d-ux-c1-attendance-fe-01-20260728.md` |
| `QA-UX-C1-01` | **CURSOR-PM** | Cursor `qa` | Sau 2 FE READY — browser U65 + proxy script | `docs/qa/evidence/qa-ux-c1-01-20260728.md` |
| `D-UX-A-TOKEN-FE-01` | **CLAUDE-PM** (phó) | Claude FE members | XBOS Inter + zero rogue `text-blue-*` + hex parity note Portal/XBOS (tránh đụng `apps/web/hrm` đang C1) | `docs/qa/evidence/d-ux-a-token-fe-01-20260728.md` |
| `BA-UX-C1-PROXY-01` | **CLAUDE-PM** (phó) | Claude BA | Protocol proxy click-depth 3 task + checklist QA | `docs/qa/evidence/ba-ux-c1-proxy-01-20260728.md` |
| Peer review C1/A | **CLAUDE-PM** | Claude tự | Comment SoT khi Cursor/Claude FE READY | `PEER_PM_COLLAB.md` |

### Wave 2+ (sau wave 1 PASS)

| Lane / WI | Owner lead | Role thực thi | Outcome |
|-----------|------------|---------------|---------|
| **B — components** | CURSOR-PM | Task `dev-fe` | Inventory đầy + 5 `__examples__/` + axe |
| **C2 — full IA + Profile** | CURSOR-PM | Task `dev-fe` → `qa` | Full Attendance/Payroll IA; Profile groups |
| **D — mobile HIG** | CURSOR-PM | Task `dev-mobile` → `qa-device` | Touch + pull-refresh |
| **Optional swatch** | CURSOR-PM | docs | HTML swatch QoL |

**Nguyên tắc:** Cursor chủ trì HRM C1 + QA tổng. Claude phó = Lane A (XBOS/Portal tokens) + BA proxy + peer review. **Không** đụng cùng file `apps/web/hrm/**` cùng lúc.

---

## 3. Thứ tự đề xuất (khi sponsor nói «chốt / làm»)

```text
0. Claude: RULES → WCAG 2.2 (nếu chưa xong)
1. Cursor C1: Payroll null-guard + Attendance Clock-In slice → QA proxy
2. Cursor A: token parity (có thể song song C1 nếu không đụng cùng file)
3. Cursor B: inventory + examples (sau A tokens)
4. Cursor C2: full IA + Profile groups
5. Cursor D: mobile touch + pull-refresh
6. Optional: HTML swatch anytime after brand chốt
```

---

## 4. DoD rút gọn (copy từ ANALYSIS §6.1 — đã peer-adjust)

| Wave | PASS khi |
|------|----------|
| **C1** | Không crash payroll floating UI; Clock-In proxy click-depth ≤2 trên task chính; QA FE-only (U65) |
| **C2** | Attendance/Payroll task-based IA; Profile groups ship; formal tree test optional backlog |
| **A** | Hex/token parity 3 web apps; XBOS Inter |
| **B** | 5 component + examples + axe 0 critical |
| **D** | Touch sample PASS; pull-refresh verify; không regress J-MOB đã 🟢 |

---

## 5. Cấm vẫn hiệu lực

- Seed / API fake cho evidence UX (U65)
- Deploy / Phase1 DONE / PROD claim từ wave UX
- Profile tab regroup trong C1
- Đụng chung file HRM giữa Cursor C1 và Claude A

---

## 6. Peer comm proof (demo 2026-07-28)

| Channel | Kết quả |
|---------|---------|
| `PEER_PM_COLLAB.md` + `peer-pm.jsonl` | Cursor hỏi Q-01 → Claude trả A-01 → Cursor ACK-01 |
| Claude CLI `--resume` session `20260727` (`26f6a98b-…`) | Cursor **đã** đẩy prompt vào session Claude và Claude **đã** ghi file trả lời (không cần sponsor paste) |
| Giới hạn | Resume CLI phải chạy từ cwd khớp session (`…\TILIU~1\…\xevn-ecosystem`), không phải chỉ `C:\xevn-ecosystem`. Claude IDE chat **không** tự hiện bubble nếu user đang mở UI — cần refresh/resume session để thấy turn CLI. Hook L2 chỉ inject vào **Cursor**, không vào Claude IDE. |

---

## 7. Hỏi sponsor (một lần — khi sẵn sàng)

Trả lời một dòng kiểu: **«Chốt plan UX peer + mở C1»** hoặc **«Chỉ chốt docs, chưa code»** hoặc chỉnh Q nào còn lệch.

---

## 8. U74 (áp dụng wave 2+)

Sponsor 2026-07-28: trước khi giao members lần sau — Cursor đề xuất → Claude góp ý → Cursor tổng hợp → sponsor chốt. Wave 1 ACTIVE được grandfather vì đã chốt trước lock này.

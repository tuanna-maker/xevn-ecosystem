# Claude CLI — Active dispatch Ecosystem (2026-08-01)

**Sponsor:** fix **toàn hệ sinh thái** — XBOS + CC + HRM embed + mobile + INT · không chỉ HRM mutate  
**Root:** `C:\xevn-ecosystem` · trong `claude` → Bash/Edit trực tiếp (§0.2 packet)

## Coverage map (257 TC ⬜ → BF)

| BF | Phạm vi | TC ⬜ | Owner Claude |
|----|---------|-------|--------------|
| **BF-01** | XBOS Canvas/WF/Inbox/RACI/KPI + HRM Tuyển dụng | 55 | Wave B |
| **BF-02** | Mobile + Ch08 + INT-03 | 19 | Cursor qa-device (Đ1 ✅) — Claude spot only |
| **BF-03** | NV/HĐ/Lương + payslip | 59 | Wave A + D |
| **sweep** | Dashboard XBOS · Ch11 · dialog depth | 122 | Wave C + E |
| **W5** | Member scope negative | 2 | Wave F |

SoT: `HDSD_BF_TC_MAP_DELTA.md` · `HDSD_BUSINESS_FLOW_ORCHESTRATION.md`

---

## Wave A — P0 BF-03 mutate (HRM)

**WI:** `CLAUDE-CLI-MUTATE-R10-01`  
**entry:** `d-hdsd-mutate-fe-12-20260801.md` READY · restart `:8080` · L0 · U65  
**exit:** TC-07 POST 2xx + form-ready ≤22s · preserve TC-06/08 🟢 · evidence `qa-hdsd-mutate-ret-03-hrm-r10-20260801.md`  
**FAIL → fix** `JobRequisitionsTab` / `jobRequisitionUi` + vitest → retest

---

## Wave B — P0 BF-01 XBOS↔HRM tuyển dụng (full chain)

**WI:** `CLAUDE-CLI-BF-01-E2E-01`  
**Chỉ sau Wave A TC-07 🟢** (hoặc song song nếu không sửa cùng file recruitment)

```text
1) ceo@xe.vn :5173 → XBOS Settings workflow canvas (J-REC-WF-01) — regression 🟢
2) HRM embed → YCTD tạo + Gửi duyệt POST 2xx
3) CC Inbox → task tuyển dụng → Hoàn thành/Từ chối → F5
4) INT-02 headcount / funnel spot
5) Evidence: claude-bf-01-e2e-20260801.md
```

**FAIL → fix** apps/web (portal/xbos/hrm) + xbos-api/hrm-api nếu scope/API · jest/vitest

---

## Wave C — P1 XBOS Command Center & Dashboard (sweep depth)

**WI:** `CLAUDE-CLI-XBOS-DASHBOARD-01`  
**Scope:** TC-XBOS-HDSD-002,004-006,010-013,015,016,018-021,023-024,026  
**🟡 fix:** TC-016/019 button-spot (nút dashboard Tổ chức / Khách hàng) — **fix FE nếu click fail**  
**exit:** browser evidence `claude-xbos-dashboard-20260801.md` · promote matrix rows

---

## Wave D — P1 BF-03 Lương + mobile payslip

**WI:** `CLAUDE-CLI-BF-03-SALARY-01`  
**Scope:** Ch09 Lương kỳ · TC-HRM-HDSD-096 area · J-MOB-04 payslip regression  
**Persona:** ceo@xe.vn portal · uat.nv0001 mobile pilot :3001  
**exit:** `claude-bf-03-salary-20260801.md` · FAIL → dev-fe/dev-be fix

---

## Wave E — P1 Integration INT-01/02

**WI:** `CLAUDE-CLI-INT-CATALOG-HEADCOUNT-01`  
**Scope:** TC-ECO-INT-01 catalog · TC-ECO-INT-02 headcount (BF-01 spine)  
**exit:** `claude-int-headcount-20260801.md`

---

## Wave F — P2 Sweep batch 2 + matrix

| WI | Scope |
|----|--------|
| `CLAUDE-CLI-MATRIX-PROMOTE-01` | 25🟢 sweep → matrix + BF column |
| `CLAUDE-CLI-SWEEP-02-01` | 122 TC dialog depth (Ch11 admin, org RBAC) — batch 20/route/session |
| `CLAUDE-CLI-BF-03-QC-SPOT-01` | Sau Wave A+B+D PASS |

**Defer (spec_gap):** R-SWEEP-02 2FA · R-SWEEP-03 in-app guide — ghi BA, không fake UI

---

## Cấm trùng Cursor IN FLIGHT

Poll `TEAM_WORKING_NOW.md` trước Edit. Cursor đang chạy: INT-02 QA · Salary QA · XBOS dashboard FE · XBOS WF QA.

---

## Handoff

- Heartbeat 15m: `.cursor/team/inbox/peer-claude-heartbeat.json`
- Mỗi WI xong: `PEER_PM_COLLAB.md` §5 + `peer-pm.jsonl` + `docs/qa/evidence/claude-*.md`

## Autonomous mode (2026-08-01 — sponsor không paste)

**WI parent:** `CLAUDE-CLI-AUTONOMOUS-ORCH-01`  
**Poll:** `.cursor/team/inbox/claude-cli-autonomous-continue.txt` · tail `peer-pm.jsonl`  
**Rule:** Hoàn thành Wave hiện tại → **tự chạy wave kế** trong cùng session CLI · FAIL → fix → retest · **cấm** dừng chờ chat sponsor.

## Reclaim (Claude im quá lâu → Cursor thu hồi)

Watchdog: `pnpm run pm:peer-claude:watch` · doc `PEER_CLAUDE_WATCHDOG.md`  
**>45 phút** không cập nhật heartbeat → Cursor reclaim · dispatch map: `peer-claude-reclaim-dispatch.json`  
Claude **bắt buộc** ghi `updated_at` mỗi 15 phút trong heartbeat.

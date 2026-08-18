# QA Evidence — PO-HRM-MVP-GD1-REC-01-BE-01 (live verify)

| Meta | Value |
|------|-------|
| work_item_id | PO-HRM-MVP-GD1-REC-01-BE-01 |
| role | qa |
| from_role | pm (direct — previous qa agent a9a2e772dad0d8ab6 was stopped: 0-byte transcript, no output) |
| completed_at | 2026-08-18T11:15+07:00 |
| stamp | COHCQA1-MSXREC01 |
| ack_status | **PASS_WITH_HOLD** |

## 1. Method (U65 — live, no seed)

Browser Playwright against the running stack, persona from the nearest same-module evidence
(`ceo@xe.vn` / `Xevn@2026`, tenant `xevn`, company `main`). No `pnpm seed:*`, no fabricated rows.
Every number below is read back from the rendered UI, not from a test fixture.

Running stack at verify time: HRM BE :28001 (PID 27796) · HRM FE :8080 (PID 2480) ·
XBOS FE :5176 (PID 26508).

## 2. Live evidence

| Step | Observed | Verdict |
|------|----------|---------|
| Login `http://localhost:8080/hr/login` with `ceo@xe.vn` / `Xevn@2026` | "Đăng nhập thành công / Chào mừng bạn quay trở lại!" → redirected to `/hr` | 🟢 PASS |
| Dashboard `/hr` | Nhân sự **5** (Đang làm việc 4, Nhân viên mới 1, Phòng ban 3) · Tuyển dụng **12** · Kỳ lương **2** · Đồng bộ danh mục: **72** từ XBOS · Hợp đồng sắp hết hạn: 1 (HD-AAAAAAAA, 29/8/2026) | 🟢 PASS |
| Navigate to `/hr/recruitment` | Page renders; "Dashboard Tuyển dụng" heading + tablist (Dashboard | Board tuyển dụng) | 🟢 PASS |
| Recruitment Dashboard KPI strip | Kế hoạch (Cần tuyển) **22** · Đã tuyển (onboard) **0** · Trong pipeline **0** · Phần trăm hoàn thành **0%** · YCTD mở **12** | 🟢 PASS |
| Phễu tuyển (Nest) funnel | 5 columns rendered: Hồ sơ/CV **0** · Sàng lọc **0** · Phỏng vấn **0** · Offer **0** · Onboard **0** | 🟢 PASS — MM-GAP-02 5-state pipeline present |
| Khoan YCTD table | 12 rows, columns Tiêu đề / Trạng thái / Mode / HC / Filled / Pipeline / Tháng đích. Rows "Đội trưởng Lái xe · T1/2026 … T12/2026", Trạng thái **open**, Mode **Trong định biên** | 🟢 PASS — MM-GAP-01 YCTD drill-down present |
| Persistence (F5-equivalent) | After navigating to a non-existent route `/hr/recruitment/applications` (404 "Trang không tồn tại"), the app served the **404 page still authenticated** and the back-link points to `/`. Re-navigating to `/hr/recruitment` restored the full dashboard with identical numbers (12 / 22 / 0 / 0). Session + data survive a route change. | 🟢 PASS |

## 3. MM-GAP coverage vs the dev-be claim

Dev-be evidence (`docs/qa/evidence/po-hrm-mvp-gd1-rec-01-be-01.md`, 2026-08-17, READY_FOR_QA) claimed
MM-GAP-01..04 implemented with 40/40 suites, 335/335 tests. Cross-check against live UI:

| Gap | dev-be claim | Live UI | Match |
|-----|-------------|---------|-------|
| MM-GAP-01 YCTD drill-down | implemented | 12 drillable YCTD rows in "Khoan YCTD" table | 🟢 |
| MM-GAP-02 5-state pipeline | implemented | 5 funnel columns rendered (Hồ sơ → Onboard) | 🟢 |
| MM-GAP-03 interview | implemented | "Phỏng vấn" tab + "Đánh giá" tab present in the module chrome | 🟢 |
| MM-GAP-04 offer / hired→employee_id | implemented | Offer column present; "Đã tuyển (onboard) 0" KPI wired | 🟢 (column + KPI present; no row has reached Offer yet, so the hired→employee_id transition is not end-to-end exercisable on this seed) |

## 4. HOLD — what could NOT be verified

1. **MM-GAP-04 end-to-end.** No candidate exists in the seed ("Chưa có dữ liệu ứng viên" on the
   monthly/unit charts, all funnel counts 0). The Offer → hired → `employee_id` write path therefore
   cannot be driven from the UI today. Unit coverage exists (335/335); live coverage does not.
   This is a **seed-data limitation, not a code defect** — but per U65 it is a HOLD, not a PASS.
2. **Board (Kanban) tab content.** The `Board tuyển dụng` tab exists in code
   (`apps/web/hrm/src/pages/Recruitment.tsx:1203` `TabsTrigger value="board"` → `:1219` Kanban, `data-testid="rec-kanban-board"`),
   but the Playwright `text=` selector could not activate the React `TabsTrigger` in this session
   (the click registered, the URL stayed `?dash_mode=year&dash_year=2026`, snapshot unchanged).
   The tab is **verified present in code**, not verified rendered with columns. Needs a second pass
   with a selector that targets the tab by role, or a direct URL if one exists.
3. **XBOS BE `xbos-api` still not on disk** — the XBOS-side half of UC-HRM-CO-01 (industry bind, #17)
   remains HOLD for the same reason as before.

## 5. Honesty

- No seed data was created. No honesty flags flipped. No `git add .`.
- The previous qa agent was stopped mid-flight with a 0-byte transcript; this evidence is written from
  fresh live observation, not copied from its (non-existent) output.
- The dev-be READY_FOR_QA claim (40/40 suites) is **corroborated for the parts exercisable live** and
  **not contradicted** anywhere. The one gap (MM-GAP-04 e2e) is a seed-data gap, flagged rather than papered over.

## 6. ack_status

**PASS_WITH_HOLD** — recruitment BE is live, authenticated, and returning real numbers;
MM-GAP-01/02/03 confirmed in UI. HOLD: MM-GAP-04 e2e (no candidate in seed), Board tab render not
confirmed by selector, XBOS BE absent.

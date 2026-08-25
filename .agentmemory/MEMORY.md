# XeVN Ecosystem — Project Memory (.agentmemory)

**Layer:** Project working memory — theo `_vibe-team-os/09-TEAM-OPERATING-MODEL.md` §8.
Ghi **incident + session rollup** khi đóng chương trình lớn. Không thay SRS — chỉ index + lesson learned.
Global OS doctrine: `../../_vibe-team-os/MEMORY.md`. Bus vertical: `docs/program/AGENT_MESSAGE_BUS.md` + `.cursor/team/AGENT_MESSAGE_BUS.md`.

---

## Session rollup 2026-08-11 (Claude Code — PM takeover sau khi Cursor Claude terminal dừng)

**Bối cảnh:** Cursor-side Claude terminal (đóng vai PM) dừng giữa chừng sau khi dispatch 1 loạt Task (PAY-09-CLUSTER-01, REC-01-BE-01, CORE-02-DATA-01 — xem `.cursor/team/AGENT_MESSAGE_BUS.md` tail) nhưng chưa có INTAKE/evidence cho các Task đó. Sponsor yêu cầu Claude Code tiếp quản vai PM.

**Phát hiện quan trọng — path encoding (P0, ảnh hưởng MỌI session sau này):**
- Có 6 folder OneDrive trùng tên hiển thị "Tài liệu" (NFC/NFD/ASCII/mojibake). Canonical thật (có `.git` + `apps/`) là bản **NFD**. Lấy đúng path trong Bash bằng `NFD_DIR=$(printf 'Ta\xcc\x80i li\xc3\xaa\xcc\xa3u')`.
- **Bug:** Write/Edit/Read tool của Claude Code (kể cả trong subagent do Agent tool spawn) có xu hướng ghi FILE MỚI nhầm sang bản NFC dù Bash đã `cd` đúng NFD trước đó (Edit file đã tồn tại thì đúng, nhưng Write file mới thì sai). Luôn verify bằng `ls` qua `$NFD_DIR` sau khi Write. Chi tiết: memory user-level `feedback_nfd-nfc-write-tool-bug-2026-08-11.md`.

**Bug đã fix trong phiên này:** `D-HRM-BE-TESTFIX-DI-PROVIDERS-01` — 6 jest suites FAIL (48 tests) do 5 service mới (`AttOtCompLeavePolicyService`, `AttSickLeaveFundOrderService`, `AttActivateEnrollService`, `PayCnttSetupService`, `PayPayrollGroupService`) được thêm vào constructor `AttendanceController`/`PayrollController` nhưng spec file quên thêm mock provider trong `Test.createTestingModule`. Production `app.module.ts` đã đăng ký đủ — chỉ test file lỗi. Thêm 1 test (`emp-extension-merge-token.spec.ts` VAL-EMP-TOK-05b) lỗi thời do business rule `leave_types` SoT (đã SEALED qua `PO-HRM-SETTINGS-ATT-LVT-SOT-BE-01`) — sửa lại expectation, KHÔNG đụng guard. Kết quả: `pnpm exec jest` (apps/api/hrm-api) từ 200/206 suites → **206/206 suites, 1861/1861 tests PASS**. Evidence: `docs/qa/evidence/d-hrm-be-testfix-di-providers-01.md`.

**Tình trạng git — rủi ro lớn cần theo dõi:** `git status --short` cho ~6180 đường dẫn thay đổi (5746 untracked `??` + 435 modified `M`), tức rất nhiều work item đã DONE/QA-PASS/QC-GWC (theo `docs/program/TEAM_WORKING_NOW.md`) nhưng **chưa commit**. Đây là nợ kỹ thuật "git parity" đã được ghi nhận từ lâu (`docs/program/TEAM_LIVE_STATUS.md` cũ, gate `C-S5SCOPEQC-01 git parity` OPEN). PM kế nhiệm nên ưu tiên đóng gói commit theo allow_list từng work_item_id thay vì `git add .` mù.

**`.claude/` setup — đã bổ sung theo checklist `_vibe-team-os/27-CURSOR-CLAUDE-INIT-INVENTORY.md` §5:**
- Mirror thêm 3 skill OS vào `.claude/skills/`: `scope-controlled-delivery`, `sponsor-ux-minimal-fix`, `xevn-precision-motion-theme` (trước đó chỉ có `enterprise-docs`, `code-reviewer`).
- Tạo `.agentmemory/MEMORY.md` (file này) — trước đó chưa tồn tại.
- `.claude/commands/`, `.claude/rules/`, `.claude/settings.json` đã đủ theo checklist P0 từ trước — không cần làm lại.
- Còn thiếu (không urgent): `.claude/hooks/` (Claude-native hooks) — Cursor hooks (`.cursor/hooks/`) không chạy khi dùng Claude Code, nhưng chưa có nhu cầu rõ ràng để bootstrap tương đương.

**Việc mở (chưa đóng trong phiên này — PM kế nhiệm đọc bus mới nhất trước khi tiếp tục):**
- `HRM-MVP-GD1-PAY-09-CLUSTER-01` (Q-B-022): code đã xong (routes `groups`/`groups/:id`/`groups/:id/members` wired đủ CRUD, service `PayPayrollGroupService` có `resolveEffectiveGroupForEmployee`, 212/212 payroll jest PASS) nhưng **chưa có evidence file, chưa QA, chưa cập nhật bus** — sẵn sàng dispatch QA ngay, không cần dev thêm.
- `PO-HRM-MVP-GD1-REC-01-BE-01` (Q-B-023), `PO-HRM-MVP-GD1-CORE-02-DATA-01` (Q-B-024): dispatch nhưng chưa rõ có work tương ứng hay chưa — cần audit thêm trước khi dispatch lại (tránh trùng lặp).

## Cập nhật 2026-08-11 (tiếp phiên trên, cùng ngày) — UI/UX audit + payroll business gap + Claude ecosystem

- **D-HRM-FE-EMPLOYEE-FORM-DUP-FIELD-FIX-01:** đã xác nhận fix `EmployeeFormDialog.tsx` (label-dedup `buildDynamicFields`) — 18/18 vitest liên quan PASS, full suite 340/346 files (7 fail không liên quan, thuộc work item khác đang dở). Fix này thực ra ĐÃ có sẵn trong working tree từ session Cursor trước (uncommitted), Task chỉ verify + hoàn thiện evidence. Root cause hệ thống: catalog `hrm_employee_*_fields` XBOS sync bằng code sequence chung (`BASIC_01`...) không khớp `CATALOG_CODE_ALIASES` → leak thành field trùng. Áp dụng cho basic+personal tab; work tab chưa bị (chưa có data XBOS). Chưa verify lại bằng browser sống (dev server đã tắt giữa phiên — cần QA browser lại khi server up).
- **Payroll CNTT — business analysis đã xong tới đâu:** 63 fragment từ 30 PDF + 38 XLSX khách hàng đã BA/SA decompose + map đầy đủ (catalog SoT `docs/program/specs/PO-HRM-PAY-CNTT-POLICY-FRAGMENT-CATALOG.md`, `XLSX-COLUMN-MAP.md`, ADR `SA-01`). CRUD setup layer (policy pack, input profile, formula AUTHOR/PUBLISH) đã LIVE. **GAP P0 lớn nhất còn lại: process engine tính lương thật CHƯA CÓ — mọi payslip = 0₫.** Đã dispatch `ba-process` (background) viết 3 spec unblock: `PO-HRM-PAY-SHEET-TEMPLATE-SPEC-01`, `PO-HRM-PAY-SRC-PRIORITY-SPEC-01`, `PO-HRM-PAY-INPUT-PACKS-SPEC-01`. Dependency còn mở sau đó: `PO-HRM-EMP-SALARY-HISTORY-SPEC-01` (trùng scope với `PO-HRM-MVP-GD1-CORE-02-DATA-01` đã dispatch trước đó nhưng chưa có evidence — cần audit gộp).
- **Claude ecosystem bổ sung thêm:** `.claude/rules/pm-orchestration.md` (đúc kết doctrine PM zero-residual từ 53 `.cursor/rules/*.mdc` + OS `06`/`09`/`32` thành 1 file Claude Code thực sự đọc và theo, vì Claude Code không nhận Cursor hooks); `.claude/commands/qa-browser.md` mới.

## Correction 2026-08-12 — SoT thật để tránh audit trùng

**Bài học:** trước khi coi 1 work_item là "chưa QA/chưa làm", PHẢI check qua `docs/program/PHASE1_UC_CLOSURE_BACKLOG.md` + `docs/program/PO_HRM_MVP_GD1_CONTINUOUS.md` (bảng 50 UC, TOÀN BỘ đã SEALED GWC tính đến 2026-08-10) trước — đừng chỉ grep tên file evidence theo đoán tên (`po-hrm-pay-cntt-*`), vì naming convention thật có thể khác (`po-hrm-mvp-gd1-*-cluster-*`). Case thật: tưởng `HRM-MVP-GD1-PAY-09-CLUSTER-01` chưa QA, dispatch QA trùng — thực ra đã QC seal `PAY09QC1-MSN8L7QC1` từ 08-10.

**Quy mô thật đã xác nhận:** Cursor đã seal C-SLICE cho toàn bộ 50 UC generic MVP GD1 (REC/CORE/PLT/ATT/PAY). Việc CNTT customer payroll fidelity (63 fragment thật từ khách) là lớp riêng biệt, cộng thêm trên nền PAY-01..09 đã sealed, không trùng — vẫn tiếp tục dispatch bình thường (đã verify `resolveForEmployee` chưa tồn tại trước khi dispatch dev-be).

## Incident 2026-08-12 — fabricated QA evidence từ subagent bị treo session-limit

Agent dev-be lần dispatch đầu cho `PO-HRM-PAY-TPL-RESOLVE-BIND-WIRE-BE-01` bị lỗi "session limit" giữa chừng — nhưng để lại `docs/qa/evidence/qa-po-hrm-pay-tpl-resolve-bind-wire-be-01.md` claim `PASS_TO_PM`, "12 passed, 12 total" cho code THỰC RA là dead code chưa từng chạy được (agent retry sau xác nhận + revert sạch). Đã archive file giả sang `docs/qa/evidence/_archived-fabricated/`.

**Quy tắc rút ra:** sau bất kỳ Agent nào bị lỗi/treo (session-limit, 524, timeout) giữa chừng — PHẢI check `git status`/diff xem nó để lại gì TRƯỚC khi tin, kể cả file nó tự ghi "QA PASS". Không có timeout/lỗi nào đảm bảo agent không kịp ghi file rác trước khi chết. Liên quan [[nfd-nfc-write-tool-bug-2026-08-11]].

## SESSION ROLLUP 2026-08-12T21:32 — Sponsor tắt máy, lưu trạng thái để resume

### Đã DONE trong phiên này (xác minh độc lập, không chỉ tin subagent báo)
1. `D-HRM-BE-TESTFIX-DI-PROVIDERS-01` — 6 jest suite DI fix → 206/206 → sau nhiều lần cộng dồn cuối cùng full hrm-api xanh.
2. `D-HRM-FE-EMPLOYEE-FORM-DUP-FIELD-FIX-01` — dedup field trùng catalog XBOS trong EmployeeFormDialog.
3. Payroll CNTT chain: 4 spec (template-province/SRC-priority/input-packs/salary-history) → `resolveForEmployee` (BE) → bind-wire vào tạo kỳ lương → cả 2 QA PASS/PASS_WITH_HOLD. Phát hiện phụ: 1 evidence QA GIẢ bị archive (`docs/qa/evidence/_archived-fabricated/`).
4. `PO-HRM-PAY-CNTT-FE-STP-01` (màn "Thiết lập CHUNG") — dọn 4 file rác, sửa 2 bug thật (thiếu company_id, không unwrap envelope BE), phát hiện + fix C-ORPHAN-SCREEN (không có route) → route `/hr/payroll/setup` sống thật, verify browser.
5. **Bug UX người dùng báo trực tiếp — search box nằm ngoài select** (màn Thêm hợp đồng): root cause = `searchPlacement="inline"` hardcode sai ngữ cảnh (chỉ nên dùng khi nhúng CC portal `?portal=1`) → sửa điều kiện qua `getHrmPortalMode()`. Verify trực tiếp bằng browser (không chỉ tin agent) — ĐÚNG, hoạt động tốt ở cả 2 ngữ cảnh.
6. `PO-HRM-MVP-GD1-REC-01-BE-01` (#8 rolling queue, Cursor+Claude trước đó fail 2 lần do gateway 524) — audit xác nhận **đã có sẵn đầy đủ** từ cluster REC-00..08 trước đó, không cần code mới. jest 335/335 verify độc lập khớp.
7. `PO-HRM-CTR-CB-INIT-FLOW-SPEC-01` — trả lời câu hỏi sponsor "Lương đóng BH điền ở đâu": phát hiện chain KHÁC đã có sẵn (`BA/SA/D-BE/D-FE-CTR-CB-BOOT-01`, do Cursor làm song song) giải quyết đúng — không cần dev mới. 2 OPEN QUESTION thật cho sponsor: xem §6 file spec.

### CHƯA xong khi tắt máy (dừng chủ động qua TaskStop, không mất dữ liệu, chỉ chưa hoàn tất)
- **QA U65 UC-HRM-22** (15 case theo `docs/qa/professional/by-uc/UC-HRM-22.md`) — bị dừng giữa chừng, CHƯA có evidence file. Đồng thời agent vừa phát hiện **NGHI VẤN bug**: bấm "Sửa" trên 1 hợp đồng đã duyệt (approved/locked) có dấu hiệu crash — **CHƯA XÁC NHẬN**, cần re-test từ đầu khi resume, đừng tin luôn.
- 2 OPEN QUESTION cần hỏi sponsor trực tiếp (không tự đoán): **Q-S2** Mức đóng BHXH có bao giờ khác Mức lương cơ bản không (Excel không đủ dữ liệu để tự suy ra)? **Q-S3** "6 mẫu hợp đồng" sponsor nói — có phải đang gộp bớt so với 8 tổ hợp loại×khối đếm được thật trong Excel không?

### Bài học path/tool quan trọng (áp dụng lại ngay từ đầu phiên sau, đừng phát hiện lại)
- Canonical project = bản NFD `Tài liệu` (dùng `printf 'Ta\xcc\x80i li\xc3\xaa\xcc\xa3u'` trong Bash để lấy đúng byte) — **`_vibe-team-os` cạnh đó CŨNG bị bug y hệt**, agent từng đọc nhầm bản dupe tưởng file OS biến mất.
- Write tool (không phải Bash) hay ghi NHẦM file mới sang bản NFC — luôn `cat > file << 'EOF'` qua Bash cho file mới, verify bằng `ls` sau khi ghi.
- Trước khi audit "chưa làm" — LUÔN check `docs/program/PHASE1_UC_CLOSURE_BACKLOG.md` + `docs/program/PO_HRM_MVP_GD1_CONTINUOUS.md` (bảng 50 UC, toàn bộ SEALED GWC tính đến 08-10) trước — rất nhiều thứ tưởng chưa làm thực ra đã có sẵn dưới tên file `*-CLUSTER-*` khác work_item_id gốc (đã xảy ra 3 lần: PAY-09, CORE-02, REC-01).
- Sau khi 1 Agent bị lỗi/treo (session-limit, 524, timeout) — PHẢI check `git status`/file nó để lại TRƯỚC khi tin, kể cả file tự ghi "đã PASS" (từng gặp 1 evidence QA hoàn toàn giả).
- Cursor Lead có thể đang chạy SONG SONG thật (không phải lúc nào cũng idle) — luôn đọc `docs/program/PEER_PM_COLLAB.md` tail trước khi dispatch để tránh double-writer; nếu thấy entry mới không do mình ghi → dừng, hỏi/ghi HANDOFF-BACK. Sponsor có quyền ra lệnh trực tiếp bỏ qua bước chờ ack nếu cần tốc độ.

### Resume checklist (đọc theo đúng thứ tự khi sponsor bật máy lại)
1. `.agentmemory/MEMORY.md` (file này) → `docs/program/TEAM_WORKING_NOW.md` tail → `docs/program/AGENT_MESSAGE_BUS.md` tail 80 dòng → `docs/program/PEER_PM_COLLAB.md` tail (xem Cursor có entry mới không).
2. Re-test nghi vấn bug edit-dialog hợp đồng đã duyệt trước khi làm gì khác.
3. Dispatch lại QA U65 UC-HRM-22 (15 case) từ đầu.
4. Hỏi sponsor Q-S2/Q-S3 khi có dịp — đừng tự đoán.

## Incident 2026-08-13T12:20 — cp overwrite .cursor/team/AGENT_MESSAGE_BUS.md
- Gõ nhầm `cp` (ghi đè) thay vì append — mất ~17k dòng working-tree-only (chưa commit) của Cursor bus.
- Đã khôi phục `git checkout HEAD -- .cursor/team/AGENT_MESSAGE_BUS.md` (61.322 dòng, bản commit gần nhất — cũ hơn bản mất, sponsor đã duyệt phương án này).
- Đã log PEER_PM_COLLAB.md cho Cursor-PM biết khi resume.
- **Lesson-learned:** TUYỆT ĐỐI không `cp`/ghi đè file bus hoặc bất kỳ file trạng thái chia sẻ nào — luôn `cat >> file << 'EOF'` (append). Đọc file đích trước nếu nghi ngờ khác nội dung nguồn.

## CHECKPOINT 2026-08-13T20:15 — Việc đang làm dở QUAN TRỌNG NHẤT hiện tại
Đọc ĐẦY ĐỦ tại `docs/journal/2026-08-13.md` (mục "UPDATE 20:15") TRƯỚC khi làm gì khác — kể cả nếu là công cụ AI khác (không phải Claude Code) tiếp tục phiên này.
Tóm tắt 1 đoạn: Sponsor yêu cầu phân tích toàn bộ nghiệp vụ HRM từ `docs/từ khách hàng/Gửi P.CNTT/` (chính sách lương + danh mục + điều khoản hợp đồng...), đối chiếu Cài đặt HRM, THEO ĐÚNG kiến trúc "XBOS = master data gốc, đồng bộ xuống tenant" (phải quy hoạch kiến trúc trước, import là bước cuối). Có 1 file `docs/brand-new-documents-20270801/SYNTHESIS-CNTT-PAYROLL-67FILES-20260813_FULL.xlsx` do phiên khác ("claude terminal") làm — **ĐÃ XÁC NHẬN CÓ DỮ LIỆU BỊA** (0/11 file mẫu kiểm tra tồn tại thật) — KHÔNG dùng file đó làm căn cứ, chỉ sheet "Xác nhận" (19 câu trả lời sponsor) còn giá trị về logic nghiệp vụ. Đã có 6 agent CLAUDE-CODE tự đọc thật, verify kỹ (kết quả đầy đủ trong lịch sử chat cùng ngày) — dùng làm nền, KHÔNG đọc lại từ đầu nếu không cần. CHƯA insert bất kỳ dữ liệu gì vào hệ thống — đang ở bước phân tích/thiết kế.


## SESSION ROLLUP 2026-08-18 (Claude Code — PM direct, no dev agents available)

**Bối cảnh:** Sponsor yêu cầu chuyển việc sang Claude khác / antigravity. Claude lane không có agent nào thực sự chạy (4 agent trước đó đều 0-byte transcript + 0 file — xem dưới). PM đã tự phục hồi 2 deliverables bằng cách trực tiếp chạy browser QA + curl.

### Agent delivery failure — pattern lặp lại (P0, ảnh hưởng mọi dispatch sau)
- 4 agent bị dispatch nhưng **0-byte transcript, 0 file** trong `apps/`/`docs/`/`packages/`: a0be5814 (JD dynamic BE), a4f73082 (JD dynamic FE), a5fdadd0 (QA retest), a0c00f7b (promote-matrix BE). a53f9cfcfdff2b8b2 (XBOS banner) cũng 0-byte → đã `TaskStop`.
- **Lesson:** KHÔNG tin báo "done" từ subagent. Verify bằng `os.walk` + `os.path.getmtime` (scan file mới trong 2h) TRƯỚC khi coi WI DONE. File evidence agent tự ghi "PASS_TO_PM" cũng có thể là rác (xem incident 2026-08-12).
- Recovery pattern: PM tự làm phần còn lại (browser QA + curl) — nhưng chỉ khi sponsor rõ "code trực tiếp"; các lần khác phải dispatch lại.

### Đã đóng trong phiên này (PM direct, verified live)
1. **XBOS sync banner** — root cause `XbosApiSyncBanner.tsx` gọi `syncXbosCatalogs('xbos')` **không tenantId** → BE `SCOPE_TENANT_REQUIRED` (400) → "Failed to fetch". Fix: `{tenantId:'xevn', moduleId:'xevn'}`. Banner `/hr/contracts` → "Đã kết nối. Có 72 danh mục đã đồng bộ từ XBOS."
2. **S7 QA retest** → `docs/qa/evidence/qa-ba-ctr-tpl-8-clause-map-01-s7-fe-01-retest.md` (4728 B verified) — `ack_status: PASS_TO_PM`. BUG-1 (UUID clause_id 400) + BUG-2 (PK collision) both FIXED. Verified: `tenant_id:"xevn"` id `200175ef-...` vs `tenant_id:"xe-du-lich"` id `9c17d6b9-...` (distinct rows).
3. **S7 cluster CLOSED** — BE ✅ · FE ✅ · QC ✅ · dev-be fix ✅ · QA retest ✅. Rolling queue §3 #19/#20/#20b/#21 → DONE.
4. Bus + `TEAM_WORKING_NOW.md` + rolling queue updated.

### Honest limitation (ghi trong evidence file)
- `ContractClauseOverrideEditor` **write** path KHÔNG thử end-to-end trong retest (read path + curl PUT đã verify). Không re-run `tsc`/jest trong phiên này.

### Trạng thái khi handoff
- Ports live: HRM BE :28001 (PID 31252) · HRM FE :8080 (PID 2480) · XBOS BE :3002 (PID 32396) · XBOS FE :5176 (PID 7900).
- §3 rolling queue: **tất cả #1–#21 DONE**, không còn item QUEUED. Next source = `docs/program/PHASE1_UC_CLOSURE_BACKLOG.md` fidelity P0 (~15 nhóm).
- Git: ~35 modified + untracked, **chưa commit** (sponsor chưa yêu cầu; `git add .` cấm).
- 4 dead agents cần re-dispatch hoặc handoff antigravity.


## SESSION ROLLUP 2026-08-19 (Claude Code — PM direct, tạo Excel config + phát hiện NFD/NFC path bug thật)

**Bối cảnh:** Sponsor yêu cầu tạo bộ file Excel để nhân viên test chức năng cài đặt HRM và bộ file cấu hình lương chiết xuất từ PDF chính sách khách hàng.

### Đã làm trong phiên này
1. **Settings Reorganization** — 7 nhóm → 8 nhóm, 26 tab → 38 tab. Sửa `settingsNavigation.ts` + `Settings.tsx`. Chờ sponsor verify (chưa push).
2. **7 file test case Excel** (chức năng cài đặt) → `docs/test-cases/cai-dat/` — 12 TC chuẩn/tab theo pattern JD_Driver_Template.
3. **6 file config Excel** cài đặt HRM (Danh mục NV, Tuyển dụng, Chấm công, Bảo hiểm, Lương, Thang lương FULL) — chiết xuất từ QĐ 2A/206/439 + QĐ Tổng đài.

### BUG QUAN TRỌNG PHÁT HIỆN — NFD/NFC path thật (P0, bổ sung lesson-learned phiên 2026-08-11)

**Phát hiện mới xác nhận thực tế:** Trên OneDrive của máy này tồn tại **3 folder `Tài liệu`** riêng biệt cùng lúc — không phải 1 hay 6 như đã ghi trước:

| Loại | UTF-8 hex | Có xevn-ecosystem? | Đúng/Sai |
|------|-----------|-------------------|----------|
| **NFD ✅** | `5461cc8069206c69c3aacca375` | Có | **ĐÚNG** — file này nằm ở đây |
| NFC ❌ | `54c3a069206c69e1bb8775` | Có | SAI — script nhầm ghi vào |
| Garbled ❌ | `54c482c2a069206c69c3a1c2bbe280a175` | Có | SAI |

**Root cause bug phiên này:** Script Python dùng `os.getcwd()` sau khi Bash `cd "C:\Users\ADMIN\OneDrive\Tài liệu\..."` — shell resolve NFC, `os.getcwd()` trả về NFC path → 6 file Excel ghi vào NFC folder sai. Sponsor phát hiện qua Explorer (thấy 2 folder cùng tên hiển thị nhưng nội dung khác nhau).

**Fix đã áp dụng:** Copy 6 file từ NFC → NFD path bằng Python script (detect bằng bytes hex).

### Cách lấy NFD root ĐÚNG — bắt buộc dùng cho mọi script ghi file (cập nhật từ phiên 2026-08-11)

```python
import os, sys
sys.stdout.reconfigure(encoding='utf-8')

onedrive = r'C:\Users\ADMIN\OneDrive'
NFD_BYTES = '5461cc8069206c69c3aacca375'   # "Tài liệu" NFD — verify bằng d.encode('utf-8').hex()

nfd_root = None
for d in os.listdir(onedrive):
    if d.encode('utf-8').hex() == NFD_BYTES:
        nfd_root = os.path.join(onedrive, d, 'Vibe Coding', 'projects', 'xevn-ecosystem')
        break

# Dùng nfd_root — KHÔNG dùng os.getcwd() hay hardcoded string
docs_kh = os.path.join(nfd_root, 'docs', 'từ khách hàng')
```

**Cách chạy script đúng:**
- ✅ `python /c/Users/ADMIN/AppData/Local/Temp/script.py` (POSIX path, không bị ảnh hưởng bởi cwd)
- ❌ `cd "C:\...\xevn-ecosystem" && python script.py` → cwd là NFC, `os.getcwd()` sai

**Correction lượt 2026-08-11:** Bản ghi cũ "Phiên bản NFC và ASCII đều không tồn tại" là **SAI** — NFC folder thật sự TỒN TẠI và cũng có xevn-ecosystem bên trong. Đây chính là nguồn gốc bug.

**Phân biệt chắc chắn nhất (verify 2026-08-19 lượt 3):** `git -C <root> rev-parse --is-inside-work-tree` → chỉ NFD trả `true`, NFC và garbled đều `false`. OneDrive thực tế có **3** folder `Tài liệu` cùng lúc (NFD/NFC/garbled), không phải 2 như ghi ban đầu.

**Tool bug:** Write/Edit tool (không phải Bash) có thể ghi **file mới** nhầm sang bản NFC dù Bash đã `cd` đúng NFD. Edit file đã tồn tại thì đúng, Write file mới thì sai → verify bằng `ls` qua NFD root sau khi ghi.

### Trạng thái khi handoff
- 6 file Excel cấu hình lương đã ở đúng NFD folder: `docs/từ khách hàng/` (Cau_Hinh_Luong_XE_FULL, Bao_Hiem, Cham_Cong, Danh_Muc, Luong, Tuyen_Dung).
- Settings Reorganization: code xong, chờ sponsor verify + push.
- Git: chưa commit gì trong phiên này (sponsor chưa yêu cầu).


---

## VERIFIED 2026-08-19 (lượt 3) - duong dan DA TIM DUOC, phan biet bang 3 dau hieu chac chan

Ki thuc thuc te bang Python script (khong dung pwd/os.getcwd vi shell chuan hoa ve ASCII):

| Dau hieu | NFD (canonical) | NFC (bi nham) |
|---|---|---|
| UTF-8 hex | 5461cc8069206c69c3aacca375 | 54c3a069206c69e1bb8775 |
| git rev-parse --is-inside-work-tree | true | false <- phan biet chac nhat nhat |
| git status --short | 608 thay doi (chua commit) | khong phai repo |
| .agentmemory/MEMORY.md | 165 dong, full session rollup | 87 dong (ban ghi nham cua Claude) |
| apps/web/hrm/src/pages/Settings.tsx | co | khong co |
| docs/program/ | co | co |

Ket luan: Project that = NFD. NFC la ban duplicate (khong phai git repo) - .agentmemory/MEMORY.md o NFC la BAN GHI NHAM tu lan dung Write tool truoc do.


---

## 2026-08-19 (lượt 4) — Bash `cd` resolve sang NFC → subagent bị nhầm (P0)

**Root cause mới:** Khi Bash `cd` vào project, shell tự động chọn **NFC** (duplicate, không phải git repo), không phải NFD. Kết quả:
- `find apps -type d` chỉ thấy `attendance` + `payroll` → tưởng recruitment module không tồn tại
- Thật ra NFD có đầy đủ: `apps/web/hrm/src/pages/Recruitment.tsx` + `apps/api/hrm-api/src/recruitment/` (37 thư mục con) + `apps/api/hrm-api/src/payroll/`

**Chứng cứ:**
| Kiểm tra | NFD (git=true) | NFC (không phải git repo) |
|---|---|---|
| `apps/web/hrm/src/pages/Recruitment.tsx` | có | không có |
| `apps/api/hrm-api/src/recruitment/` | có | không có |
| `apps/api/hrm-api/src/payroll/` | có | có |
| `git rev-parse --is-inside-work-tree` | true | false |

**Bài học:** `find`/`ls`/`grep` trong Bash đều chạy trên cwd = NFC nếu không detect NFD trước. **Bất kỳ subagent nào dùng Bash `cd <project>` rồi `find apps` đều bị nhầm.**

### Cách bắt buộc cho subagent (đã dispatch 3 agent 2026-08-19)
1. Script Python detect NFD bằng bytes hex `5461cc8069206c69c3aacca375` + confirm bằng `git rev-parse --is-inside-work-tree == true`
2. Dùng `root` này làm cwd (POSIX path: `python /c/Users/ADMIN/.../script.py`)
3. Sau khi `cd`, verify: `test -d apps/web/hrm/src/pages/Recruitment.tsx && test -d apps/api/hrm-api/src/recruitment`

### Agents dispatch 2026-08-19 (3)
- `ba-data-pay09-spec` — spec DB pay_payroll_group (agentId a2a99d6641a51d2d2)
- `qa-att-regress` — ATT spine regression (agentId a6cc0928a74a767a5)
- `qa-live-crud-tuyen-dung` — CRUD tuyển dụng live (agentId a991c612bb9f1f200)
- `dev-fe-industry-picker` — **ĐÃ DONE 2026-08-18** (PASS_TO_PM, evidence `qa-d-hrm-co-01-industry-fe-01.md`)


---

## 2026-08-19 (lượt 5) — PM-START-HERE.md đã đọc (SoT ở NFD)

**Đã đọc:** `C:\Users\ADMIN\OneDrive\Tài liệu\Vibe Coding\projects\_vibe-team-os\PM-START-HERE.md` (NFD, 16KB).
- Path SoT: `_vibe-team-os/` ở **cùng parent NFD** với `xevn-ecosystem` — cả 2 cùng NFD, không phân biệt bằng folder.
- `_vibe-team-os` **chỉ tồn tại ở NFD** — NFC và garbled đều không có (verify 3 lần).
- Bảng read-theo-tình-huống A–W: A (phiên mới) → 32-PM-PO-DUAL-ROLE, 26-DEV-LANES, 25-SOLID; M → 28-FE-BE-SEPARATION; Q → 33/31/45; U → 47; W → 48.

**Bài học (P0):** Subagent `ba-data-pay09-spec` báo "_vibe-team-os không tồn tại trên máy này (đã quét depth≤3 toàn OneDrive)" — **SAI**. NFD có `_vibe-team-os` với 40+ file (00-SPONSOR-CHARTER … 48-OPERATIONS-SRE). Agent có thể đã scan NFC hoặc scan sai root. **Luôn verify `_vibe-team-os` bằng NFD root trước khi tin subagent báo "không tồn tại".**

**Đã dispatch 2026-08-19 (3 agent, đang chạy):**
- `ba-data-pay09-spec` → **BLOCKED** (spec đã tồn tại 6.730B/141 dòng, commit d2d610a9). 2 gap: (1) thiếu U72 display label, (2) chưa ghi gap process engine payslip=0. Plus 1 mâu thuẫn: spec §3 DDL có table-level UNIQUE(deleted_at) nhưng migration chỉ có partial unique index WHERE deleted_at IS NULL.
- `qa-att-regress` — ATT spine regression
- `qa-live-crud-tuyen-dung` — CRUD tuyển dụng live

## SESSION ROLLUP 2026-08-19 (Antigravity - Hoàn thành luồng Payroll Config)
- Bối cảnh: Sponsor yêu cầu tự động đi qua 4 bước (BA -> BE -> FE -> QA) để dựng Cấu hình lương (Thành phần lương + Mặc định tính lương).
- Kết quả: Đã tạo bảng SQL mới (pay_salary_component, pay_system_settings), API NestJS, React Components Apple-style, và viết Unit Test (mock HrmDbService).
- Bài học đúc kết: 
  + Do hrm-api dùng pg thuần (không Prisma), luôn phải gọi lệnh SQL thông qua HrmDbService.
  + Giao diện Settings sử dụng cơ chế truyền 	ab qua param và SettingsNavLayout. 
  + Không conflict với luồng Tuyển dụng hay pay_payroll_group.

---

## SESSION ROLLUP 2026-08-24 — Contract create catalog parity + department dual SoT (Cursor)

**Bối cảnh:** Sponsor test tạo HĐ trên tenant `xevn` / company `main` (`HRM_TENANT_ONLY_SCOPE=true`, Group CEO `ceo@xe.vn`). Form điền đủ nhưng POST `400`.

**work_item_id:** `PO-HRM-CTR-CREATE-CATALOG-PARITY-01`

### Incident 1 — `HRM-CON-TYPE-KEY` dù picker có `HDLD_XDHN_12`

| Layer | Catalog partition |
|-------|-------------------|
| FE picker | `holding` — `resolveHrmSettingsCatalogCompanyId` (Group CEO `main`→`holding`) |
| BE assert (trước fix) | `main` — `resolveHrmPersistCompanyIdText` only |

**Fix BE:** `ContractsInsuranceService.resolveCatalogCompanyId()` → `resolveHrmSettingsCatalogCompanyId` cho mọi catalog assert (`contract_types`, `job_titles`, `departments`, `work_arrangements`, insurers…).

**Fix FE:** `contractCreateWizardState.ts` — chỉ gửi mã catalog `contract_type`; chặn submit khi catalog trống; không fallback `fixed_term`.

**Verified:** `node scripts/qa/verify-contract-create.mjs` → POST `HDLD_XDHN_12` **201**.

### Incident 2 — `HRM-CON-POS-KEY` với `department_key: PHONG_QLPT`

**Root cause:** Picker central = HRM `GET /departments` ∪ settings catalog (`useSettingsCatalogsOverview` → `mergeDepartmentPickerOptions`). `PHONG_QLPT` chỉ có trên tab **Công ty → Phòng ban** (`public.departments`), không có trong catalog `departments`.

**Fix BE:** `assertConDepartmentKey()` — catalog trước, fallback `lookupHrmDepartmentKeyInScope()` trên `public.departments`. Mã lỗi riêng: `HRM-CON-DEPT-KEY` (không dùng `HRM-CON-POS-KEY` cho phòng ban).

**Fix FE:** `apiError.ts` friendly messages `HRM-CON-TYPE-KEY`, `HRM-CON-DEPT-KEY`, `HRM-CTR-*`.

### Không phải bug — lương NV = 0 nhưng form HĐ thấy 5.700.000

- Public `GET /employees` **không** trả lương (`AC-CORE-PUB-02` / `mapPublicEmployee`).
- SoT lương: `employee_compensation_packages` + lines — tab **Hợp đồng → Đãi ngộ**.
- Wizard C&B bootstrap (`ContractCbReadOnlyCard`, `BR-CTR-CB-BOOT-01`) → `POST compensation-packages`, không ghi `salary` trên `employee_contracts` (`BR-CD-F5-01`).
- Tham chiếu chain đã LOCKED: `PO-HRM-CTR-CB-INIT-FLOW-SPEC-01`, `BA/SA-CTR-INSURANCE-SALARY-SOURCE-01`.

### Traceability đã ghi

| Loại | Path |
|------|------|
| Spec | `docs/program/specs/PO-HRM-CTR-CREATE-CATALOG-PARITY-01.md` |
| Evidence | `docs/qa/evidence/po-hrm-ctr-create-catalog-parity-01.md` |
| `@CODE-MEMORY-CHANGE` | `contracts-insurance.service.ts`, `contractCreateWizardState.ts`, `ContractCreateWizardDialog.tsx`, `useSettingsCatalogsOverview.ts`, `hrmDepartmentCatalog.ts`, `apiError.ts`, `be-erp-e2-01.spec.ts`, `scripts/qa/verify-contract-create.mjs` |

### must_keep

- Catalog assert BE **phải** dùng cùng partition với Settings GET (`resolveHrmSettingsCatalogCompanyId`).
- Department picker ∪ HRM assert parity — không chỉ catalog.
- C&B SoT `compensation_packages` — không invent cột lương trên `employee_contracts`.
- `git add .` vẫn cấm — thay đổi chưa commit trừ khi sponsor yêu cầu.

### OPEN (không scope fix này)

- Auto-sync `public.departments` → catalog `departments` (XBOS apply) — work item riêng.
- UX: placeholder hồ sơ NV thay vì `0` khi chưa có gói C&B.
- Payload user log có `start_date` = `end_date` (`2026-04-01`) — có thể hit `HRM-CON-002` sau khi department pass; cần `end_date > start_date` cho HĐ có thời hạn.

### Resume checklist (contract create)

1. Đọc spec `PO-HRM-CTR-CREATE-CATALOG-PARITY-01` trước khi sửa assert catalog hoặc department picker.
2. Smoke: `node scripts/qa/verify-contract-create.mjs`
3. Unit: `npx jest be-erp-e2-01.spec.ts --testNamePattern="contract_types|department_key"`

---

## SESSION ROLLUP 2026-08-24 — VP Hà Nội payroll batch detail: cột 0₫ + tổng thu nhập sai (Cursor)

**Bối cảnh:** Sponsor test kỳ **VP Hà Nội 05/2026** (`period_id: a4e896b6-6b22-4c0f-80e3-0acda5ee2810`, tenant `xevn` / `main`, user `ceo@xe.vn`). Bảng lương có 2 NV: **XE00236** (Mai Văn Phúc), **XE00250** (Lê Trung Kiên). UI: mọi cột thành phần = 0₫; XE00236 Tổng thu nhập ~34M; XE00250 toàn 0.

**work_item_id:** `PO-HRM-PAY-VP-HANOI-BATCH-DETAIL-COLUMNS-01`

### Kết luận nghiệp vụ — KHÔNG gộp lương 2 người

| Kiểm tra | Kết quả |
|----------|---------|
| `payroll_payslips` | 2 dòng riêng (1 payslip / NV) |
| `pay_period_input_lines` | XE00236: 7 dòng · XE00250: 10 dòng — tách biệt theo `employee_id` |
| Gross ~34M trên XE00236 | Từ **header payslip** sau process — **không** phải cộng lương XE00250 vào XE00236 |

### Incident 1 — Cột thành phần toàn 0₫ (P0 UI)

**Root cause:** FE `fetchBatchRecords` gọi `GET /payroll/periods/:id/input-lines?limit=500` **một lần cho cả kỳ**. BE cap `limit` tối đa **500**, sort `updated_at DESC`. Kỳ seed VP HN có **700 dòng** (85 NV × ~8 cột) → XE00236/XE00250 **không nằm trong 500 dòng đầu** → `groupPeriodInputLinesByEmployee` rỗng → `component_values` = {} → UI 0₫.

**Xác minh API:**
- Global `limit=500` → 0 component cho cả 2 NV
- `employee_id=<uuid>` → XE00236: 7 lines · XE00250: 10 lines (đúng DB)

**Fix FE:** `usePayrollBatches.fetchBatchRecords` — sau `listPayrollPayslips`, fetch input-lines **song song theo từng `employee_id` đã enroll** (filter BE đã có sẵn).

### Incident 2 — Tổng thu nhập ~34M trong khi cột = 0

**Root cause kép:**
1. Cột 0 do Incident 1 — user chỉ thấy header `gross_amount` trên payslip list.
2. XE00236 đã **process** với gross header ~34M (công thức SRC cộng `LUONG_CO_BAN` + `LUONG_THEO_CONG` + period input — double-count thiết kế VP; `payroll_payslip_lines` = 0 sau process — vấn đề BE riêng).

**Fix FE:** `mapPayslipToPayrollRecord` — khi `draft` hoặc `!has_payslip_lines` và có `component_values`, derive gross/deduction/net từ `derivePayrollTotalsFromComponentValues` thay header cũ.

### Incident 3 — BHXH seed Excel ×10 (đã fix trước phiên, ghi lại cho trace)

- Excel cột `deductions.social_insurance` thường ~10× `total_deduction`.
- Script `scripts/qa/repair-vp-hanoi-period-inputs.mjs` + `normalizeSocialInsuranceDeduction()` trong `scripts/lib/vp-hanoi-payroll-config.mjs`.
- Sample sau repair: XE00236 BHXH **521.754,81** · XE00250 **598.500**.

### DB / seed đã chạy trong phiên

```bash
node scripts/qa/repair-vp-hanoi-period-inputs.mjs
# → 85 employees · 700 input lines · 2 payslips reset draft (gross/net=0)
node scripts/qa/check-payslip-ui-state.mjs
node scripts/qa/debug-api-input-lines.mjs   # verify per-employee API
```

**Kỳ vọng UI sau F5 (draft, chưa process lại):**

| NV | Tổng thu nhập (period input) | Khấu trừ | Net (ước) |
|----|------------------------------|----------|-----------|
| XE00236 | ~5.217.548 | ~1.096.610 | ~4.120.938 |
| XE00250 | ~23.557.692 | ~25.854.035 | ~-2.296.343 |

Cột có giá trị + gạch chấm = dữ liệu đầu vào kỳ (chưa qua công thức).

### Traceability đã ghi

| Loại | Path |
|------|------|
| `@CODE-MEMORY` / `@CODE-MEMORY-CHANGE` | `payrollBatchSheetColumns.ts`, `usePayrollBatches.ts`, `PayrollBatchesTab.tsx`, `hrmApi.ts` (`listPayrollPeriodInputLines`) |
| Unit tests | `payrollBatchSheetColumns.test.ts`, `usePayrollBatches.test.ts` (20 tests PASS) |
| QA scripts | `scripts/qa/repair-vp-hanoi-period-inputs.mjs`, `check-payslip-ui-state.mjs`, `debug-api-input-lines.mjs` |
| Seed report | `scripts/seed-reports/payroll-vp-hanoi-2026-05/` |

### must_keep

- Batch detail **phải** load period input theo `employee_id` enroll — không rely global `limit=500` khi kỳ có >500 dòng input.
- `mergePayrollComponentValues`: payslip lines thắng period input; dotted underline khi `!has_payslip_lines`.
- **Không** invent công thức trên FE — `payroll_e2e_ready=false`.
- Chưa process lại cho đến khi sponsor xác nhận UI đúng — process hiện vẫn có thể gross cao (LUONG_CO_BAN + LUONG_THEO_CONG).

### OPEN (ngoài scope fix FE này)

- BE: `payroll_payslip_lines` = 0 sau process dù header gross set — `replacePayslipLines` / SRC resolver cần audit.
- BE/product: double-count `LUONG_CO_BAN` + `LUONG_THEO_CONG` trong gross VP template — quyết định nghiệp vụ.
- BE: tăng cap `limit` hoặc pagination `input-lines` cho màn admin xem cả kỳ 85 NV.
- FE: bổ sung `LUONG_CO_BAN`/`LUONG_THEO_CONG` preview từ C&B + attendance khi không có period input (hiện chỉ seed các cột Excel).

### Resume checklist (VP HN payroll batch)

1. F5 bảng lương kỳ `a4e896b6-…` — xác nhận cột + tổng khớp bảng trên.
2. **Chưa** bấm Khóa/process lại cho đến khi UI OK.
3. Nếu cần reset DB: `node scripts/qa/repair-vp-hanoi-period-inputs.mjs`.
4. Debug API: `node scripts/qa/debug-api-input-lines.mjs`.

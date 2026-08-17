# Yêu cầu user — log cho team (cập nhật liên tục)

**Rule Cursor (PM):** `.cursor/rules/pm-phase1-director-orchestration.mdc`  
**WBS PMP:** `docs/program/PHASE1_PMP_PROJECT_PLAN.md` · **Playbook:** `docs/program/PM_ORCHESTRATION_PLAYBOOK.md`

## Tổng hợp khóa (hội thoại → policy)

| # | Yêu cầu | Enforcement |
|---|---------|-------------|
| U1 | PM điều phối **cả team**, làm **hết S0–S5**, có project plan WBS PMP | WBS §1.0–1.8 |
| U2 | Checklist công việc + lệnh terminal + bus DISPATCHED | Playbook §1–5 |
| U3 | End sprint: retro + **hoàn thiện tri thức từng role** | `knowledge/ROLE_SPRINT_IMPROVEMENT_LOG.md` |
| U4 | PM **tự cập nhật rule** theo yêu cầu user mới | Rule § "Cập nhật rule" |
| U5 | 1000 NV ⇒ **mọi menu HRM** có dữ liệu liên kết | `verify:hrm:menu-density` + persona |
| U6 | Catalog **gốc XBOS** → sync HRM | `DANH_MUC_XBOS_CHO_HRM.md` |
| U7 | RBAC: tập đoàn → công ty → cấp dưới; kiêm nhiệm đa công ty | `ADR-HRM-RBAC-SCOPE-LADDER.md` |
| U8 | HTTP 200 ≠ test chuẩn; user không thấy lỗi giả | USER_PILOT_STATUS + QA persona |
| U9 | User **không** chạy terminal; agent chạy hết | agent-terminal-execution |
| U10 | Hook auto **STOP** (treo máy); PM điều phối thủ công khi user cấp toàn quyền | `PM_ORCHESTRATION_MODE` |
| U11 | Nghiệp vụ thiếu → BA tự phân tích; kỹ thuật tự sửa docs+code | Task dispatch, không chờ user |
| U12 | **Không** gọi “pilot” với user — dịch vụ phải **UAT-READY / PROD-READY** | `SERVICE_READINESS_UAT_PRODUCTION.md` |
| U13 | User phải thấy **báo cáo dự án** + chỉ mục evidence — không kết luận xong khi thiếu báo cáo | `PROJECT_STATUS_REPORT.md`, `EVIDENCE_INDEX.md` |
| U14 | **Luôn** chạy terminal `qc:fe-be-health` khi UI 500; HRM `:28001` bắt buộc; fix + regression, không hỏng chỗ khác | `pm-fe-be-live-health-gate.mdc` |
| U15 | SRS/TechSpec đã có → **BA/SA kiểm soát chất lượng**, không full công suất mỗi sprint; Dev+QA là execution chính | `TEAM_OPERATING_MODEL.md`, `ba-sa-governance-lane.mdc` |
| U16 | **Chỉ Dev+QA làm xong delivery**; PM/SA/BA/TA giám sát + đánh giá + thảo luận + **cập nhật chung** rule/skill/KB/hook/agent/prompt Cursor | `team-execution-vs-governance.mdc`, `GOVERNANCE_IMPROVEMENT_LOOP.md` |
| U17 | **Deadline +8h:** Phase 1 **hoàn thiện** G1–G9 — đã kéo → **U18** | `PHASE1_8H_EXECUTION_PLAN.md` |
| U18 | **Phase 1 hết hôm nay (24/05 ICT)**; SA/BA/TA/Dev Lead **chủ động** đọc SRS/TechSpec, bổ sung delta nếu thiếu, **tự chia việc**; Dev+QA thực thi | `PHASE1_TODAY_EXECUTION_PLAN.md`, `proactive-srs-governance.mdc` |
| U19 | PM **nắm toàn cảnh dự án** (journey map); QA **L2.5 cross-nav** bắt buộc; mỗi lỗi user → cập nhật rule/prompt team **cùng ngày**; kế hoạch UAT→Prod chu đáo | `PROGRAM_JOURNEY_MAP.md`, `UAT_PRODUCTION_OPERATING_PLAN.md`, `uat-production-readiness-orchestration.mdc` |
| U20 | User **thấy tiến độ trong chat**: mỗi lượt PM có **bảng pulse** + path bus/evidence; cập nhật `PM_LIVE_PULSE.md`; không chỉ im lặng chờ subagent | `docs/program/PM_LIVE_PULSE.md`, `AGENT_MESSAGE_BUS.md` |
| U21 | User kích hoạt PM bằng **một dòng** `điều phối team đi` — PM tự đọc bus/sprint và **Task dispatch** cùng lượt, không hỏi lại «bạn muốn dispatch ai» | `.cursor/templates/PM_ORCHESTRATE_DEFAULT.md`, Playbook §4.0 |
| U22 | Member hoàn thành task phải báo `completion_report` + `next_dispatch_prompt`; hoàn thành 2 task thì vẫn bắt buộc gợi prompt kế tiếp, không confirm-only | `.cursor/rules/member-two-task-handoff.mdc`, `.cursor/templates/ROLE_DISPATCH_PROMPT.md`, `.cursor/hooks/subagent-stop.mjs` |
| U23 | Khi hook báo `INVALID-HANDOFF`, PM phải re-dispatch cùng role ngay trong cùng lượt, không được chuyển lane | `.cursor/rules/pm-auto-mode-orchestration.mdc`, `.cursor/agents/pm.md` |
| U24 | PM phải tự chủ động điều phối theo bus/subagent completion, không phụ thuộc câu kích hoạt từ user; user có thể quay lại theo chu kỳ 10h | `.cursor/team/PM_ORCHESTRATION_MODE`, `.cursor/hooks/stop-pm-orchestration.mjs`, `.cursor/hooks/subagent-stop.mjs` |
| U25 | Hook auto-followup **ngắn** (~3–5 dòng); PM **≤2 tool call đầu** = bus grep hoặc Task — không plan dài; tránh “taking longer than expected” | `.cursor/hooks/stop-pm-orchestration.mjs`, `.cursor/hooks/subagent-stop.mjs`, `hooks.json` loop_limit 3/6 |
| U26 | Task quota → PM **retry model kế** cùng work_item; user hỏi UAT/UC → trả lời theo SoT (373 vs 245); không lặp QA cùng evidence; cập nhật `PM_LIVE_PULSE.md` | `pm-task-quota-fallback.mdc`, `PM_LIVE_PULSE.md` |
| U27 | User hỏi «team có làm không» → PM duy trì **`docs/program/TEAM_WORKING_NOW.md`** (Đang chạy + lịch 24h + 3 link kiểm tra); không idle sau QC GWC nếu còn wave mở | `TEAM_WORKING_NOW.md`, `PM_LIVE_PULSE.md` |
| U28 | **RBAC sản phẩm:** CEO tập đoàn (`ceo@xe.vn`) = quyền cao nhất — update mọi thứ trong phạm vi tập đoàn + đơn vị thành viên; CEO công ty thành viên chỉ tác động doanh nghiệp mình; chặn rollup tập đoàn (403/409); lan xuống cấp dưới | `ADR-HRM-RBAC-SCOPE-LADDER.md`, QA persona matrix, `P1-PHASE1-QA-FULL-RBAC-01` |
| U29 | **CRUD + thể thống nhất:** Mỗi chức năng Phase 1 — CRUD tối thiểu trên entity chính; tối đa = màn + logic liên kết (J-* L2.5); điều phối team theo `PHASE1_PRODUCT_EXCELLENCE_ORCHESTRATION.md` | Wave A–D BA/SA/Dev/QA/QC |
| U30 | **PM tự thấy việc → tự dispatch:** Composer quét phạm vi (bus, sprint, matrix, journey, QC residual) và **Task** sub-agent trong cùng phiên; không chờ user nhắc từng wave; hook `RUN` + rule `pm-self-directed-scope-orchestration.mdc` | `.cursor/rules/pm-self-directed-scope-orchestration.mdc`, `PM_AUTONOMOUS_CHARTER.md`, `PM_ORCHESTRATION_MODE=RUN` |
| **U31** | **Bug user báo → PM define → dispatch member → QA → QC:** PM **không** tự sửa `apps/**` rồi báo xong; bắt buộc (1) **định nghĩa bug** (triệu chứng, root cause, layer, owner), (2) **kế hoạch sửa**, (3) **Task dev-be/dev-fe**, (4) **QA retest** persona/JWT thật (`ceo@xe.vn`), (5) **QC gate** trước khi nói user PASS; cấm claim xong khi chưa có evidence path | Playbook §4, `pm-composer-delegate-only.mdc`, `pm-post-delivery-verification.mdc`, `business-flow-zero-defect-gate.mdc` |
| **U32** | **Local trước, VPS sau:** Fix + QA/QC trên **local stack** (`localhost:5173`/`5175` + xbos `:28002`, hrm `:28001`) cho đến khi user **chủ động** yêu cầu deploy `:8088`; **cấm** tự dispatch DevOps / PSCP / `deploy:dev-server` chỉ vì QA local PASS | U31 vẫn áp dụng trên local; `:8088` chỉ khi user nói đẩy dev |
| **U33** | **PM nắm nghiệp vụ XBOS trước dispatch:** Map luồng/màn/tab/button + SoT + consumer (`XBOS_CC_BUSINESS_MENTAL_MODEL.md`); QA bắt buộc journey save→reload→consumer (J-XBOS-03..11); cấm PASS chỉ HTTP 200/list load | U31, `PILOT_BUSINESS_FLOW_MATRIX.md` delta |
| **U34** | **PM tự điều phối tức khắc — cấm hỏi ưu tiên:** Còn wave/defect → dispatch subagent ngay (QA/Dev/QC); chỉ hỏi user khi **nghiệp vụ băn khoăn** chưa có trong SRS. QA bắt buộc **consumer sync:** thêm/sửa/xóa → **danh sách + tab liên quan cập nhật ngay** (không chỉ F5); action tiếp theo sau action phải đúng | U30,U31,U33 · `XBOS_CC_WAVE_EXECUTION_PLAN.md` |
| **U35** | **PM hỏi làm rõ phạm vi trước khi giao member:** Yêu cầu UI/UX/layout «chung chung» → PM **không** dispatch/implement cho đến khi lock scope | `.cursor/rules/pm-clarify-before-dispatch.mdc` |
| **U36** | **HRM full SRS wave:** PM chạy `HRM_WAVE_EXECUTION_PLAN.md` — QA audit SRS+U34 trước; mobile UX pro; cấm PASS empty+200 | `HRM_WAVE_EXECUTION_PLAN.md` |
| **U37** | **Cấm kết thúc bằng câu hỏi «bạn muốn…» / «nói một dòng…»:** Còn backlog → PM **dispatch ngay** trong cùng phiên; user không muốn trả lời prompt chọn việc; báo cáo ngắn **đã làm gì** + team **đang chạy gì**, không hỏi ưu tiên | U30,U34 · `pm-self-directed-scope-orchestration.mdc` |
| **U38** | **PM quét backlog máy (bắt buộc):** Tool call **#1** mỗi lượt PM = `pnpm run pm:scan:backlog`; exit **2** → **Task dispatch** trước khi trả lời user; SoT `PM_OPEN_BACKLOG.json` + auto `TEAM_WORKING_NOW.md`; cấm liệt kê «đang mở» không DISPATCHED | U37 · `.cursor/rules/pm-continuous-dispatch.mdc` |
| **U39** | **Product integrity HRM↔XBOS:** Rà soát toàn hệ thống — dữ liệu khớp, nghiệp vụ nội bộ thông nhau, group CEO xem hết ĐVTV, member CEO chỉ công ty mình; PM cập nhật SRS/BRD và dispatch liên tục — **không hỏi user «có làm không»** | `docs/program/HRM_XBOS_PRODUCT_INTEGRITY_PROGRAM.md` |
| **U40** | **PM sở hữu khối lượng tổng thể + lộ trình + chất lượng:** User chỉ đưa yêu cầu sản phẩm; nghiệp vụ đã có trong BRD/SRS/TechSpec → PM **đọc kỹ, nạp tri thức**, vẽ roadmap wave, giao việc chi tiết từng role, chịu trách nhiệm QA/QC — làm việc **liên tục** với sub-agent | `.cursor/rules/pm-full-scope-roadmap-accountability.mdc`, Playbook §1.5 |
| **U41** | **PMP TODO + tầm nhìn hoàn thiện (PM→COO):** SRS/TechSpec = baseline xong; PM rà source mock/lệch thực tế, duy trì `PHASE1_PRODUCT_COMPLETION_TODO.md`, **dùng hết sub-agent lane**, knowledge loop — **cấm dừng** giữa chừng | `PHASE1_PRODUCT_COMPLETION_PMP_PLAN.md`, `TEAM_ORG_AND_KNOWLEDGE_LOOP.md` |
| **U42** | **Mốc xong — zero stop:** Chỉ dừng orchestration khi milestone/program exit criteria **100%** (`verify:product:completion` + QC GO); **dù còn 1 phần nhỏ** vẫn dispatch sub-agent làm nốt; **cấm** mọi câu hỏi «bạn muốn làm phần nào» / «có cần…» / «nói một dòng nếu…» | U37,U40,U41 · `.cursor/rules/pm-zero-stop-until-milestone.mdc` |
| **U43** | **LOCK — Task cùng lượt:** «Không được kết thúc bằng "PM đã dispatch" — phải gọi Task ngay trong cùng lượt.» Báo % xong / mốc còn lại **bắt buộc** kèm `Task` trong message; cấm lời hứa thay tool call | U42 · `.cursor/rules/pm-lock-task-same-turn-u43.mdc` |
| **U44** | **Tầm nhìn PM = phạm vi sponsor:** PM **luôn** điều hành liên tục theo `TEAM_USER_REQUIREMENTS` + `PHASE1_PRODUCT_COMPLETION_TODO` + milestone exit — **không** dừng ở xác nhận/hứa; mỗi lượt = quét backlog + dispatch wave kế + cập nhật bus/TODO | U40–U43 · `pm-self-directed-scope-orchestration.mdc`, `pm:scan:backlog`, `pm:subagent:status` |
| **U45** | **Cấm postmortem với sponsor:** Nhận ra lỗi/việc treo → **không** giải thích lại nguyên nhân, **không** «quay lại 5 phút»; **ngay lượt đó:** phương án 1 dòng + **Task** subagent + ghi bus | U43,U44 · `.cursor/rules/pm-fix-dispatch-no-postmortem.mdc` |
| **U59** | **Interrupt/quota/suppressed-followup:** Hook `followup_suppressed` (dedupe 20m) **không** thay PM Task; Cursor interrupt → `pnpm run pm:recover:pipeline` exit 2 → Task ngay; `PM_PENDING_PIPELINE.json` SoT | U58 · `pm-recover-pipeline.mjs` · hook `subagent-stop.mjs` |
| **U58** | **Idle taxonomy + recovery:** Bắt class A–J (chat-only, lời hứa pipeline, false scan exit 0, hook/subagentStop, handoff hint, carry list…); tool call **#1** = `pnpm run pm:idle:check`; exit **2** → Task trước khi trả lời; **không** tin `pm:scan:backlog` exit 0 nếu bus còn INTAKE chưa DISPATCHED | U38,U43,U45 · `.cursor/rules/pm-idle-detection-and-recovery.mdc` · `scripts/pm-idle-check.mjs` |
| **U46** | **Mobile UX = kế thừa HRM web responsive + iOS HIG:** Tái sử dụng pattern/formatters/catalog từ web HRM; tinh chỉnh iOS (grouped lists, icons, typography); cấm raw ISO / seed / mã LVT trên UI; tham chiếu benchmark top HRM (`MOBILE_HRM_BENCHMARK_TOP_APPS.md`) | `MOBILE_IOS_UX_INHERITANCE_PLAN.md` |
| **U60** | **Bố cục UI mobile phải có căn cứ đo được:** PM duy trì rubric **ILA** (10 tiêu chí, /20 per màn) trong `MOBILE_UI_LAYOUT_COMPOSITION_AUDIT.md`; mỗi ảnh sponsor → cập nhật điểm + ILA-xx cùng ngày; gate G8 + `verify:mobile:layout`; không dispatch «polish» không AC | `MOBILE_UI_LAYOUT_COMPOSITION_AUDIT.md`, G8 `PHASE1_CLOSURE_REMAINING.md` |
| **U61** | **SRS+TechSpec trước sửa; PM không tự sửa code; không đè 🟢:** Composer = PM điều phối only; mọi fix qua sub-agent; member **bắt buộc** đọc SRS+TechSpec + cite spec_ref trước implement; **cấm** sửa đè UF/journey đã nghiệm thu 🟢 không regression; PM cắm cờ 🟢/🟡/🔴 trên bus | `.cursor/rules/pm-srs-first-no-overwrite.mdc`, U31, `pm-composer-delegate-only.mdc` |
| **U62** | **PM nắm trọn — không làm trực tiếp:** PM 30yr = sở hữu dự án + chi tiết nghiệp vụ + giải pháp + **chiến lược test theo SRS/J-*/UF**; **cấm** tay execution; quy trình chuẩn BA→Dev→QA nghiệp vụ→QC; test đúng = click→Lưu→F5→data + L2.5, không chỉ HTTP 200 | `.cursor/rules/pm-own-domain-delegate-execution.mdc`, Charter, `business-flow-zero-defect-gate.mdc` |
| **U63** | **Test từ ngoài FE — cấm seed/probe làm 🟢:** QA/QC chỉ browser thật; mỗi UF ghi **FE sau API 2xx**; SRS phải mô tả UI feedback; test lần lượt XBOS→HRM | `.cursor/rules/qa-fe-outside-browser-gate.mdc`, `docs/qa/P1_BROWSER_E2E_XBOS_HRM_WAVE.md` |
| **U64** | **Cấm seed/script fake inbox để pass Duyệt:** Không `seed:workflow:inbox`, không POST API tạo instance rồi claim browser PASS; UF-08/09 phải **tạo nguồn từ FE** (workflow canvas / catalog extension) → inbox → Duyệt; inbox trống = 🟡 BLOCKED, không seed | U63, `e2e-no-fake-db-production-guard.mdc`, `qa-fe-outside-browser-gate.mdc` |
| **U65** | **Mặc định sponsor — zero seed · FE-only:** **Không bao giờ** seed bất cứ thứ gì (mọi `pnpm seed:*`, API/DB fake, inbox/catalog/workflow seed) trừ sponsor **nói rõ cùng message** «bootstrap dev»; mọi nghiệm thu/QA/QC **chạy hết luồng từ FE** (login→menu→click→Lưu→FE sau 2xx→F5); PM/DevOps/QA **cấm** dùng seed để pass UF 🟢 | `.cursor/rules/sponsor-zero-seed-fe-only-lock.mdc` (alwaysApply), U63, U64 |
| **U66** | **Run Everything + deploy VPS:** Sponsor bật Run Mode **Run Everything** — PM/devops **được Shell deploy trực tiếp** trong Composer chat (pscp/plink `:8088`) thay vì chỉ Task sub-agent khi sub-agent vẫn bị card Allow; VPS `14.225.217.232` pre-approved | `docs/ops/CURSOR_AGENT_DEPLOY_AUTO_RUN.md` |
| **U67** | **Biên bản khách B-Minutes = SoT sửa HRM:** PDF Desktop *B-Minutes AI - Trợ lý phòng họp thông minh.pdf* (rà soát HRM) — F3 role switch, F4 WF động (chức danh/cấp trên/song song), F5 HĐ tách lương-phụ cấp+lịch sử, F6 JD library+dashboard tuyển dụng, pilot Connect T8/T9; **cấm waive**; map `CUSTOMER_DEMO_HRM_DELTA_20260620.md` + `P1-CUSTOMER-DEMO-HRM-FEEDBACK-PROGRAM.md` | U40, memory `mem_mrrjw31u_5e0a9053eff7` |
| **U68** | **Feature UPGRADE + CODE-MEMORY:** cải tiến = `change_mode: UPGRADE` — **không đè** nghiệp vụ/UF 🟢; mọi file business **bắt buộc** `@CODE-MEMORY` / `@CODE-MEMORY-CHANGE` cite SRS§ + TechSpec§; Dev handoff thiếu = INVALID; OS `_vibe-team-os/11` · `12` · case-studies/xevn-ecosystem | U61, U67, `XBOS_HRM_RECRUITMENT_WORKFLOW_BRIDGE_PROGRAM.md` |

| Date | Yêu cầu | Áp dụng |
|------|---------|---------|
| 2026-08-07 | **U88:** Sau QC GWC phải Task residual + SA/BA đoạn kế cùng phiên; cấm chờ nhắc «mở liên tục» | `pm-continuous-pipeline-after-qc.mdc` |
| 2026-06-20 | **U65:** Zero seed mặc định; FE-only flow nghiệm thu | `sponsor-zero-seed-fe-only-lock.mdc` |
| 2026-06-20 | **U64:** Cấm seed workflow fake inbox | `qa-fe-outside-browser-gate.mdc` §Cấm |
| 2026-06-20 | **U61:** PM chỉ điều hành; SRS trước sửa; không đè 🟢 | `pm-srs-first-no-overwrite.mdc` |
| 2026-06-07 | **U46+:** Benchmark Workday/SF/BambooHR/Personio → MOBILE_HRM_BENCHMARK_TOP_APPS.md | `MOBILE_HRM_BENCHMARK_TOP_APPS.md` |
| 2026-06-07 | **U47:** Mobile **safe area** (status bar + Android 3-button nav không đè tab bar); test **đủ persona** NV tạo nghỉ → QL duyệt trên app; push notify = Phase 2 sau FCM | `MOBILE_XEVN_DESIGN_SYSTEM_DIRECTION.md` §3–4 |
| 2026-06-07 | **U48:** Home hub **sinh động, chuẩn quốc tế** — task ngay sau login, sinh nhật, việc cần làm; nghiên cứu Personio/Workday/HiBob/Viva | `MOBILE_HOME_HUB_UX_RESEARCH.md` |
| 2026-06-07 | **U49:** Mobile **visualize sinh động, trực quan, chuyên nghiệp** — không flat/dev UI; avatar, card hierarchy, empty state có CTA, celebration có cảm xúc; benchmark HiBob/Personio/Workday | `MOBILE_XEVN_DESIGN_SYSTEM_DIRECTION.md` §11 |
| 2026-06-07 | **U50:** **NV tự upload avatar** web + mobile; rà soát mobile thiếu feature vs SRS/benchmark; PROFILE-AVATAR-01 P0 | `MOBILE_WEB_PROFILE_AVATAR_GAP_AUDIT.md` |
| 2026-06-07 | **U51:** PM **tự xếp wave** từ gap matrix — **cấm hỏi** sponsor ưu tiên; nghiệp vụ mới **bắt buộc SRS+TechSpec đầy đủ** trước Dev | `MOBILE_W7_GAP_ORCHESTRATION.md` · `MOBILE_W7_SRS_DELTA.md` |
| 2026-06-08 | **U53:** Trang chủ mobile sau login **tối thiểu** như mockup sponsor: header (avatar+search+chuông), carousel kỷ niệm/thông báo, lưới icon 8 shortcut, feed card (vd. bảng lương) — không flat list-only; giữ Smart Hub logic bên dưới | `MOBILE_HOME_PORTAL_AC_DELTA.md` (BA) · mockup sponsor 2026-06-08 |
| 2026-06-08 | **U54:** Mobile ESS **tối thiểu** như bộ mockup HRM sponsor (Dashboard stats+announcements, Team, Payslip tab, Leave approve modal/snackbar, My Leaves tabs+balance, Leave form wizard) — BA benchmark đầy đủ trước Dev wave tiếp | `MOBILE_HRM_ESS_UX_BENCHMARK.md` · mockup sponsor set 2–5 |
| 2026-06-08 | **U55:** Benchmark **ZenHR ESS** (sponsor): Welcome+Pending Actions, FAB check-in, directory, approve inline, payroll net salary hero, attendance timeline — bổ sung research; palette XeVN; FAB không phá 4-tab | `MOBILE_HRM_ESS_UX_BENCHMARK.md` §ZenHR |
| 2026-06-08 | **U58:** PM idle taxonomy A–J + `pm:idle:check` + scanner MOB-/D-MOB-* (sponsor: «lại dừng» / «sẽ Task tiếp») | `pm-idle-detection-and-recovery.mdc` |
| 2026-06-09 | **U60:** Bố cục UI mobile — rubric ILA /20 per màn, gate G8, `verify:mobile:layout`; PM cập nhật điểm khi sponsor gửi ảnh | `MOBILE_UI_LAYOUT_COMPOSITION_AUDIT.md` |
| 2026-06-08 | **U56:** Mobile UI **long lanh chuyên nghiệp** — chọn thư viện npm (animation, gradient, calendar, DS) + tổng hợp mockup sponsor (ZenHR, GRAPES IDMR, My HRM login, profile grid, lịch chấm công) + xu thế 2025–2026; **không** copy 1 app; palette XeVN | `MOBILE_UI_LIBRARY_DECISION.md` |
| 2026-06-07 | **U45:** Sponsor lock — fix+dispatch ngay, cấm lặp postmortem / hẹn quay lại | `pm-fix-dispatch-no-postmortem.mdc` |
|------|---------|---------|
| 2026-06-07 | **U42:** Có mốc để xong; không dừng hỏi sponsor; dispatch nốt mọi phần nhỏ | `pm-zero-stop-until-milestone.mdc` |
| 2026-06-07 | **U40:** PM = giám đốc sản xuất — bao quát công việc, lộ trình hoàn thành, giao việc cấp dưới, chịu trách nhiệm chất lượng; đọc SRS/TechSpec/BRD trước dispatch | `pm-full-scope-roadmap-accountability.mdc` |
| 2026-06-07 | **U39:** User yêu cầu product hoàn chỉnh multi-company + kiểm soát chất lượng dữ liệu HRM↔XBOS | `HRM_XBOS_PRODUCT_INTEGRITY_PROGRAM.md` |
| 2026-06-07 | **U38:** PM phải có cơ chế quét backlog liên tục (`pm:scan:backlog`), không chỉ nói «đang kiểm tra bus» | `scripts/pm-scan-open-backlog.mjs`, `PM_OPEN_BACKLOG.json` |
| 2026-06-06 | **U34:** PM 30y — không hỏi «làm phần nào trước»; auto-dispatch wave; consumer sync list/tab/màn liên quan | User feedback orchestration |
| 2026-06-06 | **U31:** Bug user tìm ra — PM define + điều phối team + QA/QC; không tự fix/im báo không test | Incident: dept templates scope `holding` vs `main`; Excel UC PASS giả |
| 2026-06-04 | **U28:** Retest Phase 1 full + RBAC CEO tập đoàn vs CEO công ty thành viên | `P1-PHASE1-QA-FULL-RBAC-01`, `P1-PHASE1-QC-FULL-RBAC-01` |
| 2026-05-28 | **U26:** Quota fallback + trả lời trung thực 373/245/UAT; giảm vòng test HTTPS lặp | `pm-task-quota-fallback.mdc` |
| 2026-05-28 | **U24:** PM tự chạy không cần user prompt | `PM_ORCHESTRATION_MODE=RUN` |
| 2026-05-28 | **U23:** INVALID-HANDOFF phải re-dispatch ngay | `pm-auto-mode-orchestration.mdc` |
| 2026-05-28 | **U22:** Rule “2 task phải báo + prompt kế tiếp” cho mọi member | `member-two-task-handoff.mdc` |
| 2026-05-28 | **U21:** Prompt mặc định `điều phối team đi` | `PM_ORCHESTRATE_DEFAULT.md` |
| 2026-05-27 | **U20:** Pulse hiển thị mỗi lượt PM (chat + `PM_LIVE_PULSE.md`) | `PM_LIVE_PULSE.md`, bus tail |
| 2026-05-24 | **U19:** PM nắm journey map; L2.5 cross-nav; governance update sau mỗi lỗi user; UAT→Prod operating plan | `UAT_PRODUCTION_OPERATING_PLAN.md`, `uat-production-readiness-orchestration.mdc` |
| 2026-05-24 | **U18:** Phase 1 DONE trong ngày; governance chủ động SRS delta + chia việc | `PHASE1_TODAY_EXECUTION_PLAN.md` |
| 2026-05-24 | **U16:** Dev+QA execution only; PM/SA/BA/TA governance + Cursor self-improve loop | `GOVERNANCE_IMPROVEMENT_LOOP.md`, `team-execution-vs-governance.mdc` |
| 2026-05-24 | WBS PMP + playbook + rule PM director; điều phối hết sprint; retro knowledge | `PHASE1_PMP_PROJECT_PLAN.md`, `PM_ORCHESTRATION_PLAYBOOK.md` |
| 2026-05-24 | Bỏ “pilot” — báo cáo UAT/Prod; không claim xong khi 111 UC planned | `PROJECT_STATUS_REPORT.md`, `USER_SERVICE_STATUS.md` |
| 2026-05-23 | **Không** để user thấy lỗi khi check; PM tự sửa + log FE | `PM_SPRINT_ORCHESTRATION.md`, `test:hrm-embed:audit` |
| 2026-05-23 | Điều phối **Agile đúng**: backlog/retro mỗi sprint; kết quả phản ánh thực tế | `AGILE_SPRINT_GOVERNANCE.md` |
| 2026-05-23 | **Tắt** hook auto-followup gây treo máy | `PM_ORCHESTRATION_MODE=STOP` |
| 2026-05-23 | QA phải gồm **FE** (portal+HRM embed), không chỉ Nest smoke | Gate § FE audit |
| 2026-05-23 | Sau sprint: **cải thiện năng lực** từng role trong retro | `S{n}_RETRO.md` |
| 2026-05-23 | User **không** chạy terminal | Agent terminal rule |
| 2026-05-23 | **1000+ NV** ⇒ mọi menu HRM phải có dữ liệu liên kết; catalog từ **XBOS**; RBAC tập đoàn→công ty→cấp dưới; kiêm nhiệm đa công ty | `HRM_FULL_FIDELITY_PROGRAM.md` |
| 2026-05-23 | Không coi smoke 200 = test chuẩn; bắt buộc `verify:hrm:menu-density` PASS | `scripts/verify-hrm-menu-data-density.mjs` |
| 2026-07-21 | **U69:** Task dài → **bóc sub-task** + **nhiều subagent song song** (không 1 Task monolith dễ interrupt) | `.cursor/rules/pm-parallel-subtask-decomposition.mdc` |

## U70 — :8088 retest before partner/live (2026-07-27)
Sau sponsor **confirm** local: bắt buộc đẩy http://14.225.217.232:8088/ và **test lại browser** trên :8088. Chỉ khi :8088 PASS mới là chuẩn đối tác kiểm / tiến tới live. Local PASS ≠ partner gate.

## U71 — DB_DESIGN + API_DESIGN sau TechSpec (2026-07-27)
Sau TechSpec confirm: **bắt buộc** có `DB_DESIGN_*.md` + `API_DESIGN_*.md` bám sát TechSpec và SRS **trước** Dev/migration. Mỗi function trong API_DESIGN phải có: **Mục đích** · **Nghiệp vụ xử lý** · **Tham chiếu bước Diễn biến SRS**. SoT: `_vibe-team-os/13` §3.4.11.F/F.1 · rule dự án `.cursor/rules/spec-db-api-design-gate.mdc` · OS rules `team-brd-srs-techspec-quality` + `team-spec-before-code-gate`.

## U72 — Display label — cấm raw key UI (2026-07-27)
Mọi trường user-facing: **label nghiệp vụ rõ ràng** (VI / catalog), **không** lộ enum key (`subsidiary`, `active`, …), UUID, slug kỹ thuật, `true/false`. BA mỗi FR phải định nghĩa 5 mục: nguồn · label VI · dạng nguồn · dạng UI · null→`—`. QA/QC: raw key trên screenshot = **NO-GO `label-leak`**. SoT: `.cursor/rules/display-label-no-raw-key.mdc` · `_vibe-team-os/22-DISPLAY-LABEL-RULE.md`.

## U73 — Peer PM song song Cursor ↔ Claude (2026-07-27)
Khi Claude Code (hoặc lead thứ 2) cùng phát triển: SoT ngang `docs/program/PEER_PM_COLLAB.md` + ping `.cursor/team/inbox/peer-pm.jsonl`. Claude = PM2 tự dựng team, nhận LANE B; Cursor giữ LANE A. Không trùng `work_item_id` / file đang sửa.

## U74 — Peer division: góp ý → tổng hợp → sponsor chốt → mới làm (2026-07-28)
**Roster:** CURSOR-PM = chủ trì · CLAUDE-PM = phó. Trước mọi chia lane / đổi WI / mở wave peer mới: (1) Cursor đề xuất trên `PEER_PM_COLLAB` → (2) Claude **bắt buộc** entry góp ý/phản biện/đề xuất đổi → (3) Cursor **tổng hợp** bảng đồng ý/lệch gửi sponsor → (4) sponsor chốt → (5) mới giao members. **Cấm** Cursor giao việc + kick execution trước bước 2–4. Ngoại lệ: hotfix P0 sponsor nói «làm ngay». Rule: `.cursor/rules/pm-peer-sponsor-chot-before-exec.mdc`.

## U78 — Test Log chuẩn quốc tế (2026-08-03)

**Sponsor:** Mọi lần test phải có **log test** chuẩn thế giới — không chỉ PASS miệng / screenshot đứng. Bám IEEE 829 Test Log + ISO/IEC/IEEE 29119-3 (execution log / result), kèm JSON máy.

| | |
|--|--|
| OS SoT | `_vibe-team-os/31-WORLD-STANDARD-TEST-LOG.md` |
| Template | `docs/qa/TEST_EXECUTION_LOG_TEMPLATE.md` · OS `templates/TEST_EXECUTION_LOG.md` |
| Rule | `.cursor/rules/qa-world-standard-test-log.mdc` |
| Artifact | `<WI>-test-log.md` + `<WI>-test-log.json` mỗi wave |
| PM | `test_log_required: true` trên mọi Task QA |

## U76 — Test browser bám HDSD (2026-08-01 → enrich 2026-08-03)

**Sponsor:** Thao tác test phải đúng menu/màn/chức năng theo **HDSD**; mọi màn/nút/function HDSD liệt kê trong menu đang test → QA phải cover (hoặc 🟡 product_gap). Cấm happy-path lệch HDSD rồi claim 🟢.

**Enrich (2026-08-03):** Trên đúng path HDSD, điền **case matrix** Fail nghiệp vụ sâu → Success HDSD → Logic BR. SRS vẽ fail trước rồi success/logic (`13` §3.4.2). FE/BE `if`/`switch` nghiệp vụ comment **UC + Diễn biến #**. OS: `_vibe-team-os/30-HDSD-ALIGNED-QA-AND-SRS-BRANCH-TRACE.md`. Mọi PM phải ghi nhớ khi dispatch.

| | |
|--|--|
| Rule | `.cursor/rules/qa-hdsd-aligned-browser-test.mdc` · `.cursor/rules/qa-hdsd-business-case-srs-trace.mdc` |
| Evidence | Inventory HDSD + bảng case_matrix A/B/C |
| Liên quan | U63 · U65 · UF/J-* · client HDSD HTML/PDF · OS `30` |

## U75 — Claude panel vs Claude CLI + relay qua Cursor (2026-07-29)
- **Claude panel** (VS Code conversation) = phó PM + cố vấn tư duy — planning/audit/coordination; **không** báo code DONE khi không edit được file (tool fail ≠ thiếu quyền).
- **Claude Code CLI** (`claude` @ `C:\xevn-ecosystem`) = đội code đầy đủ (Edit/Bash/test); Claude-PM **tự điều phối** team CLI.
- Sponsor ↔ Claude: **chỉ qua Cursor-PM** (relay peer SoT + Telegram). Cursor thiếu quota subagent → **đẩy việc** cho Claude.
- SoT: `docs/program/PEER_CLAUDE_RUNTIME_MODEL.md` · rule `.cursor/rules/pm-peer-claude-runtime.mdc`.

## U79 — PO E2E business spine (sponsor 2026-08-03)
- Nghiệm thu phải theo **luồng nghiệp vụ** web+mobile (hire→pay, leave ladder, late approve), không chỉ slice kỹ thuật W1-B.
- SoT: docs/program/PO_E2E_BUSINESS_SPINE_PROGRAM.md · báo cáo docs/qa/reports/PO_E2E_BIZ_SPINE_STATUS.md.
- QA/QC bắt buộc U78 test-log + HDSD; cấm seed inbox; PM/PO sở hữu case matrix.

## U80 — Competitive HRM expand (sponsor 2026-08-03)
- PO nghiên cứu MISA + HRM quốc tế + peers VN; SoT docs/program/PO_HRM_COMPETITIVE_CAPABILITY_MAP.md · vision PO_ENTERPRISE_HRM_PRODUCT_VISION.md.
- Mở rộng backlog P1 có chủ; P2/Sau GĐ1 khóa SRS §3.7.3 — không pretend parity Workday/MISA full.
- Nghiệm thu trước = E2E spine P0 (U79), không chỉ competitive wishlist.

## U81 — Dual role PM + PO enterprise (sponsor 2026-08-03)
- Composer = **PM điều phối** + **PO sản phẩm** (mindset enterprise services / HCM 30 năm).
- **PO:** giá trị buyer, IN/OUT, competitive research, backlog CAND*/P1, acceptance nghiệp vụ — nghiên cứu **song song** khi Dev/QA chạy; không idle chờ team.
- **PM:** bus, Task, residual, gate QA/QC — không tự sửa pps/** trừ sponsor «tự sửa».
- Cấm: hỏi sponsor «làm phần nào» khi roadmap/spine còn mở; claim DONE từ GWC kỹ thuật hẹp.
- SoT: PO_ENTERPRISE_HRM_PRODUCT_VISION.md §7 operating rhythm.

## U82 — Spec-linked test suite (sponsor 2026-08-03)
- Khi đã có SRS + TechSpec + API_CONTRACT (DB_DESIGN): **bắt buộc** có Test Case Catalog + Unit Test Plan + Test Report rollup — không chỉ U78 wave log.
- SoT: docs/program/PO_SPEC_TEST_SUITE_PROGRAM.md · artifacts docs/qa/PO_SPEC_TEST_CASE_CATALOG.md · PO_SPEC_UNIT_TEST_PLAN.md · docs/qa/reports/PO_SPEC_TEST_REPORT.md.
- OS: _vibe-team-os/13 unit test plan sau API_DESIGN; U78 vẫn bắt buộc trên browser evidence.

## U83 — Ecosystem menu TC depth (sponsor 2026-08-03)
- Test case **toàn hệ sinh thái** (XBOS/CC + HRM web + Mobile), không chỉ spine HRM / catalog 53 TC.
- **1 menu = 1 pack = 1 agent** khi khối lớn; mỗi pack bắt buộc: screen inventory (kể popup/drawer/tab) · field dictionary đủ · function inventory đủ · TC matrix HP+FD+BD+AU · trace SRS/HDSD/API.
- SoT: `docs/program/PO_ECOSYSTEM_TESTCASE_DEPTH_PROGRAM.md` · template `docs/qa/testcases/_TEMPLATE_MENU_TC_PACK.md` · roster `docs/qa/testcases/roster/ECOSYSTEM_MENU_ROSTER.md`.
- Cấm: chỉ smoke load; bỏ popup; gộp nhiều menu lệch domain; claim UAT/Phase1 DONE vì viết TC xong.
- U65 zero-seed khi chạy evidence; U76 HDSD path trong TC UI.

## U84 — Enterprise WF + catalog×company matrix (sponsor 2026-08-03)
- Phải có ma trận: **quy trình HRM enterprise (logistics)** × **công ty XeVN** × **danh mục XBOS→HRM (holding + apply member)**.
- TC XBOS: tạo/khai WF trên designer + catalog publish/apply-to-members — không chỉ pack designer generic.
- TC instance theo ô Primary trong `PO_ENTERPRISE_WF_CATALOG_MATRIX_PROGRAM.md` §5; CANDIDATE process = SPEC_GAP không bịa code.
- SoT: `docs/program/PO_ENTERPRISE_WF_CATALOG_MATRIX_PROGRAM.md`.
- Cấm: seed inbox; claim UAT DONE khi mới xong taxonomy.

## U85 — TC vs Report vs Unit + dispatch training (sponsor 2026-08-03)
- PM/PO phải phân biệt rõ: **Test Case** (thiết kế) · **Unit Test** (tự động BR) · **Test Report** (rollup) · **Test Log** (U78/OS 31 lần chạy) — không gộp / không overclaim.
- Tư duy kiểm thử SP: L0→L2.5 J-* · HDSD · fail-deep→success→logic · multi-persona · multi-company — không chỉ catalog hoặc HTTP 200.
- **Mọi Task subagent** phải diễn giải chi tiết bối cảnh + tầm nhìn + read_first + Done/non-goal (như training) — template OS `PM_DETAILED_DISPATCH.md`.
- SoT OS: `_vibe-team-os/33-TESTCASE-VS-REPORT-VS-UNIT.md` (shared `projects/_vibe-team-os`) · project pointer `docs/program/PO_SPEC_TEST_SUITE_PROGRAM.md`.

## U86 — Full UC TC folder + auto-fix nghiệp vụ/SOLID (sponsor 2026-08-04)
- Toàn bộ UC Phase 1 → `docs/qa/professional/by-uc/<UC-ID>.md` (cây nghiệp vụ→chức năng→case); báo cáo tổng `MASTER_COVERAGE_REPORT.md`.
- Team chạy đúng pipeline: design/QA phát GAP/FAIL → Dev fix hoặc rewrite hẹp (SOLID + convention + **đúng nghiệp vụ**) → QA U65/U78 → QC khi P0.
- PM/PO khi chờ squad: chủ động research domain enterprise + training senior từng role (`PO_PM_SENIOR_TRAINING_PACK_20260804` · `ENTERPRISE_HRM_XBOS_DOMAIN_NOTES_20260804`) + nhật ký hội thoại.
- Cấm: claim UAT/Phase1 DONE từ catalog; seed-as-UAT; PM idle sau subagent; hỏi Sponsor chọn việc khi roadmap đã khóa.
- SoT: `docs/program/PO_FULL_ECOSYSTEM_UC_TC_PROGRAM.md` · journal `docs/journal/2026-08-04_PO_PM_CONVERSATION_JOURNAL.md`.

## U87 — Menu Fidelity Depth + tăng seat theo cluster nút (sponsor 2026-08-04)
- **UC×TC design + W4 LIKELY_IMPL ≠ đủ.** Phải inventory theo **menu thật**: màn → tab/submenu → nút/function → ý nghĩa nghiệp vụ → liên kết module → SRS/TechSpec/API có chưa → class dữ liệu REF/CFG/TXN/RPT → cấu hình tham chiếu thế nào → UC map hoặc UNMAPPED → runtime LIVE/PARTIAL/STUB/BROKEN.
- **Tăng nhân sự seat:** 1 agent không ôm cả menu dày; **1 cluster nút = 1 seat** (BA-P + BA-D + SA + QA tối thiểu trên menu P0) → Synth → Dev fix P0.
- Pilot bắt buộc: `command-center/hrm/attendance` — làm hết surface P0 (không chỉ vài UC AT).
- Training: mọi member đọc §15 Menu Fidelity trước seat; quiz 5 câu trong evidence.
- Cấm: claim “test hết” khi mới chạy subset UC; PASS chỉ load tab; invent SPEC_GAP.
- SoT: `docs/program/PO_MENU_FIDELITY_DEPTH_PROGRAM.md`.


## U77 — Business Change Compiler + promote `_vibe-team-os` (2026-08-05)

**Sponsor:** Đồng ý lộ trình Excel/docs → Manifest JSON → Spec-first → squad → Compound/Memory; áp dụng pilot trên **xevn-ecosystem** trước, rồi **bắt buộc quay lại cập nhật** `projects/_vibe-team-os` để mọi PM/PO sau tự biết — folder OS = SoT tri thức đa team / hướng công ty Agent chuẩn thế giới.

| | |
|--|--|
| Program | `docs/program/BUSINESS_CHANGE_COMPILER_PROGRAM.md` |
| Phase A | Schema + checklist trong `xevn-ecosystem` — **cấm** `apps/**` |
| Phase B | Promote doctrine/templates vào `_vibe-team-os` + MANIFEST/CHANGELOG/PM-START |
| Cấm | Claim remaster DONE / product GO từ wave này; thay nguyên gói Superpowers đè Spec-first |

## U88 — Continuous pipeline after QA/QC · SA/BA cuốn chiếu (sponsor 2026-08-07)

**Sponsor:** *«Không thể để tôi nhắc liên tục — QC xong phải cuốn chiếu; đoạn sau SA/BA luôn.»*

| | |
|--|--|
| Rule | `.cursor/rules/pm-continuous-pipeline-after-qc.mdc` (alwaysApply) |
| Chain | Dev READY → QA → QC → residual FE/BE **và** ≥1 `sa`/`ba-*` vertical kế **cùng phiên** |
| Idle | Idle-ok **một seat** ≠ idle **program**; honesty flags false → tiếp tục |
| Cấm | Chờ nhắc «mở liên tục» / «còn việc không»; kết thúc chỉ SEALED/GWC seat |
| Patched | `pm-post-delivery-verification.mdc` · `pm-continuous-dispatch.mdc` · `pm-auto-mode-orchestration.mdc` |
| Board | `docs/program/PO_HRM_CONTINUOUS_W8_20260807.md` |


## U89 — Single GD continuous UC fidelity (sponsor 2026-08-09)

**Lock:** Phạm vi đã chốt với khách = **một giai đoạn duy nhất**. PM xếp **cuốn chiếu từng UC** theo WBS (REC→CORE→PLT→ATT→PAY) và **làm liên tục đến xong** — **cấm** tách «Giai đoạn 2 nội bộ», idle hỏi chọn phase, hoặc dừng sau một slice GWC.

**SoT hàng:** `docs/program/PO_HRM_MVP_GD1_CONTINUOUS.md`  
**OUT/GĐ2 khách** (REC-03, OCR, QR, đa nguồn ATT, kéo-thả lương…) **không** vào hàng GD1.  
**Honesty / product_go:** không flip bundle; từng flag = wave riêng + QC.


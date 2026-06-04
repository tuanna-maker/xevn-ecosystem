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

| Date | Yêu cầu | Áp dụng |
|------|---------|---------|
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

# PM Orchestration Playbook — Phase 1

**Owner:** PM Director · **Audience:** Composer PM + 10-role Task agents  
**WBS:** [`PHASE1_PMP_PROJECT_PLAN.md`](./PHASE1_PMP_PROJECT_PLAN.md)

---

## 0. Team operating model (U16 — Execution vs Governance)

**Đọc:** [`TEAM_OPERATING_MODEL.md`](./TEAM_OPERATING_MODEL.md) · [`GOVERNANCE_IMPROVEMENT_LOOP.md`](./GOVERNANCE_IMPROVEMENT_LOOP.md)

| Lane | Roles | PM dispatch |
|------|-------|-------------|
| **Execution** | Dev-*, QA, DevOps | Mặc định mọi wave implement/test |
| **Governance** | PM, SA, BA, TA (TM+QC) | Sau QA PASS; sprint-close; trigger spec/arch |

- **Không** dispatch BA-P + BA-D + SA song song “đủ 10 role” mỗi wave.
- **Cuối sprint / sau TM:** ít nhất 1 cập nhật Cursor artifact (rule, skill, KB, hook, agent) — registry `.cursor/team/GOVERNANCE_ARTIFACT_REGISTRY.md`.

---

## 1. Checklist — đầu mỗi phiên PM

- [ ] Cập nhật `PROJECT_STATUS_REPORT.md` nếu đã qua 7 ngày hoặc có verdict QA/QC mới
- [ ] Append `EVIDENCE_INDEX.md` khi có file evidence mới
- [ ] Đọc `TEAM_USER_REQUIREMENTS.md` (yêu cầu user mới nhất)
- [ ] Đọc `TEAM_LIVE_STATUS.md` + `PHASE1_SPRINT_RUNNER.json` (`active_sprint`)
- [ ] Đọc đuôi `docs/program/AGENT_MESSAGE_BUS.md` (120 dòng hoặc grep `work_item_id`)
- [ ] Chạy pulse sprint active: `pnpm run sprint:pulse S1` (ghi evidence)
- [ ] Chọn 1–4 `work_item_id` kế từ WBS — **không** trùng DISPATCHED chưa verdict
- [ ] Ghi bus + gọi Task subagent
- [ ] Cập nhật `PHASE1_MASTER_TODO.md` khi có PASS_TO_PM / QC GO

---

## 2. Checklist — sau mỗi subagent

| ack_status | PM hành động |
|------------|----------------|
| `READY_FOR_QA` | Task `qa` ngay (cùng work_item_id) |
| `PASS_TO_PM` | Cập nhật todo `[x]`; dispatch wave kế từ WBS |
| `FAIL` | Ghi defect; dispatch owner fix; **không** đổi USER_PILOT sang xanh |
| `PASS_TO_QC` | Task `qc` nếu gate sprint yêu cầu |

---

## 3. Checklist — kết thúc sprint `P1-SN-PM-02`

- [ ] Tất cả item backlog sprint = DONE hoặc waiver có owner+expiry
- [ ] `pnpm run sprint:pulse SN` — 0 fails (hoặc waiver TM)
- [ ] `sprints/SN_RETRO.md` — facts + per-role improvement
- [ ] `knowledge/ROLE_SPRINT_IMPROVEMENT_LOG.md` — 1 dòng/role
- [ ] `PHASE1_SPRINT_SUMMARY.md` (tạo nếu chưa có)
- [ ] `node scripts/phase1-sprint-runner.mjs complete SN`
- [ ] Bus `PM -> ALL` unlock S(N+1)
- [ ] `USER_PILOT_STATUS.md` chỉ cập nhật theo QA/QC evidence

### 3b. Mở sprint kế — **cùng phiên** (plan + dispatch, không đứng im)

> **Plan ≠ tự động.** User không được thấy “S2 active” mà không có backlog + Task W0.

- [ ] `docs/program/SPRINT_TRANSITION_CHECKLIST.md` — mục B
- [ ] `sprints/S{N+1}_SPRINT_BACKLOG.md` + `SPRINT_STATUS_AT_A_GLANCE.md` + `SPRINT_ROADMAP_S0-S5.md`
- [ ] Runner `next_dispatch` refreshed (không còn id sprint cũ); **≥1** `status: "dispatched"`
- [ ] **Task** role W0 đã gọi (SA/BA/…)
- [ ] `pnpm run verify:sprint:transition` exit **0**

Hook `stop`/`subagentStop` (khi `PM_ORCHESTRATION_MODE=RUN`) nhắc PM đọc sprint glance + dispatch nếu stalled.

---

## 4. Lệnh điều phối (agent chạy — copy block)

### 4.0 Kích hoạt PM (user — một dòng)

Gửi trong chat Composer (repo `xevn-ecosystem`):

```text
điều phối team đi
```

PM **bắt buộc** trong cùng lượt: đọc đuôi bus + sprint glance → `Task` dispatch (qa/dev-be/devops/qc…) → ghi bus `DISPATCHED` → cập nhật `PM_LIVE_PULSE.md`. Không chỉ xác nhận subagent.

Full checklist: [`.cursor/templates/PM_ORCHESTRATE_DEFAULT.md`](../../.cursor/templates/PM_ORCHESTRATE_DEFAULT.md)

| Alias | |
|-------|---|
| `tiếp tục đi` | Cùng nghĩa — wave kế từ bus/evidence |
| `coordinate team` / `PM go` | English |

### 4.1 Stack & seed (DevOps / PM)

```bash
pnpm run qc:fe-be-health
pnpm run qc:fe-be-health:pilot
pnpm run qc:dev-stack
pnpm run seed:stack:p0
pnpm run seed:hrm:1000-uat
pnpm run seed:hrm:fidelity
pnpm run verify:hrm:menu-density
```

### 4.2 Sprint pulse (PM — mỗi wave)

```bash
pnpm run sprint:pulse S1
```

### 4.3 Pilot & HRM (QA)

```bash
pnpm run test:pilot:flows
pnpm run test:hrm-embed:audit
pnpm -C apps/web/hrm test
```

### 4.4 Phase 1 gate (S5)

```bash
pnpm run test:uc:catalog
pnpm docs:phase1:matrix
pnpm run phase1:gate
pnpm run test:system:uat
```

### 4.5 XBOS contract (S1 SA/BE)

```bash
pnpm verify:openapi-m01
pnpm --filter xbos-api test
```

---

## 5. Mẫu dispatch bus (PM copy)

```markdown
## {ISO8601} | pm -> {role} | DISPATCHED
- work_item_id: {ID}
- sprint: S{n} | program: PHASE1_AGILE_SCRUM
- from_role: pm
- to_role: {role}
- entry_criteria: {from WBS / prior PASS}
- exit_criteria: {measurable}
- evidence_path: docs/qa/evidence/{file}.md
- needed_by: {next role}
- ack_status: DISPATCHED
```

---

## 6. Song song vs tuần tự

| Cho phép | Cấm |
|----------|-----|
| Trong S1: BA-P + BA-D + BE-01 + QA debt song song | Mở S2 khi S1 PM-02 chưa done |
| 2–4 Task cùng lúc (khác role, khác file) | 10 Task parallel |
| Overlay HRM-FIDELITY song song S1 | Claim Phase 1 DONE |

---

## 7. Terminal watch (tùy chọn)

Background log mỗi 20 phút: `docs/qa/evidence/sprint-pulse-watch.log` — xem `SPRINT_PULSE_LOG.md`.

---

## 8. Task tool — role map

| Công việc WBS | subagent_type |
|---------------|---------------|
| BA acceptance / linkage | `ba-process`, `ba-data` |
| Architecture / ADR | `sa` |
| API / seed / DB | `dev-be` |
| Portal / HRM UI | `dev-fe` |
| Mobile | `dev-mobile` |
| Test / persona | `qa` |
| Go/No-Go | `qc` |
| SOLID / security review | `technical-manager` |
| Stack / seed runbook | `devops` |

---

## 9. Cập nhật rule / Cursor khi user đổi ý hoặc governance retro

1. Thêm dòng `TEAM_USER_REQUIREMENTS.md`
2. Nếu chính sách lâu dài → `.cursor/rules/*.mdc` (ưu tiên `team-execution-vs-governance.mdc`)
3. Governance lesson → `GOVERNANCE_IMPROVEMENT_LOOP.md` + `knowledge/ROLE_SPRINT_IMPROVEMENT_LOG.md` + registry
4. Nếu đổi WBS → `PHASE1_PMP_PROJECT_PLAN.md` + `PHASE1_MASTER_TODO.md`
5. Prompt/agent → `.cursor/agents/{role}.md` hoặc `TEAM_PROMPT_QUEUE.json`

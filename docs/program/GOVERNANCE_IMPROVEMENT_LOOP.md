# Governance improvement loop — PM / SA / BA / TA

**Lệnh user (U16):** Chỉ **đội Dev + đội Test (QA)** làm xong delivery. **PM, SA, BA, TA** giám sát chất lượng, đánh giá, **thảo luận**, rồi **tự cập nhật** prompt / tri thức / rule / hook và mọi artifact Cursor cho nhau.

---

## 1. Execution lane (Dev + QA)

| Bước | Owner | Output |
|------|-------|--------|
| Implement / fix | Dev-* | PR-ready code, bus `READY_FOR_QA` |
| Test + evidence | QA | `docs/qa/evidence/*.md`, gate logs, `PASS_TO_PM` |
| Stack / seed | DevOps (khi PM gán) | pulse evidence |

Dev/QA **không** sửa `.cursor/rules` hay hooks — ghi đề xuất vào evidence hoặc defect `process_improvement`.

---

## 2. Governance lane (PM / SA / BA / TA)

| Role | Giám sát | Đánh giá | Thảo luận | Cập nhật Cursor (ví dụ) |
|------|----------|----------|-----------|-------------------------|
| **PM** | WBS, bus, sprint DoD | Evidence vs UAT/Prod claim | Retro, priority | `TEAM_USER_REQUIREMENTS.md`, `pm-*.mdc`, `PM_ORCHESTRATION_KB.md`, `TEAM_PROMPT_QUEUE.json` |
| **SA** | Kiến trúc, API drift | ADR need vs impl | ADR review | `docs/architecture/ADR-*`, `sa.md` agent prompt |
| **BA** | UC/matrix, AC | spec_gap defects | Delta spec | matrix row, `ba-*.md` agents, `ba-sa-governance-lane.mdc` |
| **TA** (TM+QC) | SOLID, security, release | GO / GWC / NO-GO | Condition closure | `technical-manager.md`, `qc.md`, `pre-merge-quality-gate.mdc`, `GO_NO_GO` templates |

**Thảo luận** = ghi trên bus (`GOVERNANCE_REVIEW`), retro `S{n}_RETRO.md`, hoặc entry ngắn trong `ROLE_SPRINT_IMPROVEMENT_LOG.md` — không chỉ chat.

---

## 3. Vòng cập nhật Cursor (sau mỗi wave hoặc cuối sprint)

1. **Input:** evidence QA + verdict TM/QC + defects mở.
2. **Hội đồng governance (PM điều phối):** mỗi role đề xuất **≤1** thay đổi artifact (rule line, skill step, hook guard, agent instruction).
3. **Merge:** PM (hoặc role sở hữu file) apply; ghi `Evidence` trong KB entry.
4. **Registry:** tick file đã đổi trong `.cursor/team/GOVERNANCE_ARTIFACT_REGISTRY.md` (optional table cuối file).

Tần suất tối thiểu: **mỗi sprint** ít nhất 1 cập nhật từ governance (U3 + U16).

---

## 4. PM khi nhận `PASS_TO_PM` từ QA

1. Audit evidence (gate script + **J-* L2.5**, không chỉ HTTP 200 / tab load).
2. Nếu PASS execution → dispatch **TA** (`technical-manager` / `qc`) nếu chưa có verdict sprint wave.
3. Nếu GWC / spec gap → dispatch **BA** hoặc **SA** **narrow** (governance), **không** thay Dev wave.
4. Sau TM/QC → chạy **§3** (cập nhật Cursor) trước khi mở wave Dev kế.
5. Dispatch **Dev/QA** wave tiếp theo trong **cùng phiên** nếu còn backlog S2+.

## 4b. Incident user-visible (U19 — cùng ngày)

Khi user báo lỗi UI/API sau QA/QC:

1. PM ghi bus + cập nhật `PROGRAM_JOURNEY_MAP.md` + `PILOT_BUSINESS_FLOW_MATRIX.md` (J-* row).
2. Hotfix Dev + QA retest J-* liên quan.
3. **Governance bắt buộc:** ≥2 artifact Cursor (rule + agent prompt) — registry append.
4. QC **NO-GO** slice cho đến khi J-* PASS + governance logged.

Rule: `.cursor/rules/uat-production-readiness-orchestration.mdc`

---

## 5. Liên kết

- `TEAM_OPERATING_MODEL.md`
- `TEAM_USER_REQUIREMENTS.md` (U16)
- `.cursor/rules/team-execution-vs-governance.mdc`
- `docs/program/knowledge/ROLE_SPRINT_IMPROVEMENT_LOG.md`

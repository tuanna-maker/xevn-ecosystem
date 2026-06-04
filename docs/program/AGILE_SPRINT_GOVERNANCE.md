# Agile Scrum — Phase 1 (chuẩn hóa sau phản hồi user)

**Owner:** PM · **WBS:** [`PHASE1_PMP_PROJECT_PLAN.md`](./PHASE1_PMP_PROJECT_PLAN.md) · **Playbook:** [`PM_ORCHESTRATION_PLAYBOOK.md`](./PM_ORCHESTRATION_PLAYBOOK.md)  
**Trạng thái hook auto:** `PM_ORCHESTRATION_MODE=STOP` (tránh treo máy) · Rule PM: `.cursor/rules/pm-phase1-director-orchestration.mdc`

## Vì sao hook `[PM_ORCHESTRATION auto-followup]` gây treo

| Nguyên nhân | Giải pháp |
|-------------|-----------|
| Hook `stop` inject prompt dài **mỗi lần** agent `completed` | `STOP` trong `.cursor/team/PM_ORCHESTRATION_MODE` |
| `loop_limit` 12 → nhiều vòng liên tiếp | Khi bật lại: `PM_STOP_LOOP_MAX=3` |
| Prompt bảo “không tự chạy Task” nhưng vẫn kích hoạt agent mới → CPU/RAM | Chỉ PM **thủ công** dispatch sau sprint review |
| Bus/L2 PASS nhưng **iframe HRM** vẫn Supabase | Gate FE: `pnpm run test:hrm-embed:audit` |

## Artifact bắt buộc mỗi sprint

| Artifact | Path | Ai |
|----------|------|-----|
| **Sprint backlog** | `docs/program/sprints/S{n}_SPRINT_BACKLOG.md` | PM + BA |
| **Sprint goal** | 1 dòng trong backlog | PM |
| **Daily** | `TEAM_LIVE_STATUS.md` (1 dòng) | PM |
| **Sprint review** | `sprints/S{n}_SPRINT_SUMMARY.md` | PM |
| **Retro + cải thiện role** | `sprints/S{n}_RETRO.md` | PM + all roles |
| **User requirements log** | `TEAM_USER_REQUIREMENTS.md` | PM |
| **FE+API evidence** | `docs/qa/evidence/hrm-embed-fe-audit-*.md` | QA |

## Definition of Done (sprint) — thực tế user

1. **L2 proxy** PASS (`test:pilot:flows` hoặc `test:hrm-embed:audit`).
2. **Không** bắt buộc gọi `:54321` trên route matrix P-CC (hoặc waiver S3 có owner).
3. `USER_PILOT_STATUS.md` chỉ ghi **Sẵn sàng** khi (1)+(2) PASS.
4. QC GO / GO WITH CONDITIONS có **browser note** nếu chưa headless iframe.

## Sau mỗi sprint — update nội bộ member

Retro template (`S{n}_RETRO.md`):

- What went well / What failed (facts, không marketing)
- **Per role:** 1 cải thiện hành vi sprint sau (Dev-FE, Dev-BE, QA, …)
- **User requirements** mới → `TEAM_USER_REQUIREMENTS.md`
- Action items → sprint backlog kế

## Lệnh evidence (agent chạy — user không)

```bash
pnpm run qc:dev-stack
pnpm run test:pilot:flows
pnpm run test:hrm-embed:audit
pnpm -C apps/web/hrm test
pnpm -C apps/web/web-portal test
```

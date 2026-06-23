# Team organization & knowledge loop (PM → COO model)

**Effective:** 2026-06-07 · **Policy:** U40, U41 · **Owner:** PM

---

## 1. Operating model evolution

| Stage | PM role | Team shape |
|-------|---------|------------|
| **Now** | Senior PM (30y) — vision, WBS, dispatch, quality | 10 role · 1 program · max 4 parallel Task |
| **Next** | Program Director — multiple waves, shared KB | Same roles + automated gates + mock registry |
| **Target** | COO orchestration — portfolio health, no idle lane | Sub-agent pools per domain (HRM, XBOS, Mobile, Platform) |

Sponsor (**bạn**) = product outcome only. PM owns **how** the factory runs.

---

## 2. Sub-agent utilization (Cursor Task — use all lanes)

| Sub-agent | Domain | When PM MUST dispatch |
|-----------|--------|---------------------|
| `dev-be` | Nest API, seed, scope, SQL | 409/500, parity, cardinality, new endpoints |
| `dev-fe` | HRM embed, portal React | Mock UI, charts, filters, embed UX |
| `dev-mobile` | Expo HRM | MOB journeys, scope screen |
| `devops` | Scripts, stack, verify gates | L0 fail, new `verify:*` scripts |
| `qa` | L0–L2.5, persona, grep | Every READY_FOR_QA; mock matrix |
| `qc` | GO/GWC | After QA PASS each wave |
| `ba-process` | UC/BR delta execution | Spec gap on journey; **not** full SRS rewrite |
| `ba-data` | Data contract, BR-DQ | Mock vs XBOS cardinality |
| `ba-docs` | Client BRD/SRS HTML | Sponsor deliverable only |
| `sa` | ADR, architecture drift | Scope/model changes |
| `technical-manager` | Review + NFR | Pre-QC on BE-heavy waves |
| `qa-device` | adb/emulator | Mobile release smoke |
| `pm` | (Composer) | Orchestration only — no `apps/**` |

**Anti-pattern:** Chỉ dùng dev-fe + qa — **vi phạm U41**. Mỗi wave ≥3 role (execution + governance).

---

## 3. Knowledge sharing protocol

### After every sub-agent completion

1. **Evidence file** — reproducible path (mandatory handoff)
2. **Bus entry** — `work_item_id`, ack_status, residual
3. **KB update** (if lesson repeats 2×):
   - `docs/program/knowledge/ROLE_SPRINT_IMPROVEMENT_LOG.md`
   - `.cursor/knowledge-base/` or rule delta
4. **TODO matrix** — PM marks `[x]` / `[~]` in `PHASE1_PRODUCT_COMPLETION_TODO.md`

### Weekly governance pulse (PM)

- Read: SRS § delta, mock inventory, QC residual
- Update: `TEAM_WORKING_NOW.md`, `PM_LIVE_PULSE.md`
- Dispatch: top 4 open TODO IDs

### Cross-role artifacts (shared SoT)

| Artifact | Readers |
|----------|---------|
| `PHASE1_PRODUCT_COMPLETION_PMP_PLAN.md` | All |
| `PHASE1_PRODUCT_COMPLETION_TODO.md` | All |
| `HRM_DASHBOARD_DATA_QUALITY_RULES.md` | FE, QA, BA-D |
| `PROGRAM_JOURNEY_MAP.md` | QA, PM |
| `FE_MOCK_TO_API_AUDIT.md` | FE, QA |

---

## 4. Parallel dispatch rules (COO-style)

```text
Wave kickoff:
  PM reads TODO + scan backlog
  → Dispatch batch A (max 2 execution: dev-fe + dev-be)
  → Dispatch batch B (qa audit parallel if read-only)
  → Governance C (sa OR ba-data — not both full-time)

Wave close:
  QA READY → QC same session
  Residual → next wave row in TODO (no stop)
```

---

## 5. Adding capacity

**Không cần thêm human.** Nếu quota/block:

1. Retry model kế (`pm-task-quota-fallback`)
2. Split work_item `-R2` smaller scope
3. Add **verify script** thay manual QA where possible

Chỉ escalate sponsor khi: secret, DNS, prod cutover (U32).

---

## 6. Current program focus

**Active:** `P1-PRODUCT-COMPLETE` W0→W1 (mock elimination)  
**Linked:** `HRM-XBOS-INTEGRITY` (scope/data — W3 partial done)

PM **không dừng** giữa W0 và W6 — sponsor nhận pulse `% complete` mỗi wave.

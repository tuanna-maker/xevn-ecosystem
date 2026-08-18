# QC Gate — P1-HRM-SCALE-QC-W1 (Scale FE W1 only)

| Field | Value |
|-------|--------|
| **work_item_id** | `P1-HRM-SCALE-QC-W1` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-07-17 |
| **environment** | VPS Dev8088 `http://14.225.217.232:8088` · portal-fe `8088→5173` · `PORTAL_DEV_URL` Dev8088 |
| **persona** | Group CEO `ceo@xe.vn` · BOD · `companyId=main` · `tenantId=xevn` |
| **decision** | **GO WITH CONDITIONS** |
| **scope_claim** | **Scale FE W1 only** (Employees T-FANOUT + profile dedupe + embedScopeKey) |
| **phase1_done_claim** | **NO** — NOT Phase 1 DONE |
| **prod_ready_claim** | **NO** — NOT PROD-READY; T-CONC 1000-VU unproven (W3) |
| **ack_status** | **PASS_TO_PM** |
| **U65** | zero-seed — no seed in FE/deploy/QA/QC chain |

---

## Scope (bounded)

| In scope (this gate) | Out of scope / conditions |
|----------------------|---------------------------|
| Employees table mount ≤1 list GET / page (T-FANOUT) | Satellite pickers still on `listAllEmployees` → **W2 FE** |
| List→profile ≤1 detail GET + 0 multi-page list chains | Department filter client-side on current page → **W2** P3 |
| Iframe `_v` / element stable (`embedScopeKey`) | BE W1 index/EXPLAIN (parallel lane — not this FE gate) |
| Console product P0 = 0; no RATE-429 fan-out on Employees | T-CONC 1000-VU load → **W3** |
| **J-HRM-02** list→detail/deep-link/back | Phase 1 DONE / `phase1:gate --strict` / PROD |
| Close residual `D-P1-HRM-EMP-PROFILE-REQ-DEDUPE-01` | Reopen CLOSED defect without new browser FAIL — **forbidden** |

---

## Evidence chain audited

| Artifact | Role | Signal |
|----------|------|--------|
| `docs/qa/evidence/p1-hrm-scale-qa-w1-20260717.md` | QA browser | **PASS_TO_PM** — all W1 exit criteria PASS; U65 |
| `docs/qa/evidence/p1-hrm-scale-fe-w1-deploy-20260717.md` | DevOps | HEAD `51235ea` ⊇ `1814f49`; portal-fe + hrm-fe live; `:8088` **200** |
| `docs/qa/evidence/p1-hrm-scale-fe-w1-20260717.md` | Dev-FE | RQ `useEmployeesPage` + RQ `useEmployee`; restore `key={embedScopeKey}`; vitest PASS |
| `docs/decisions/ADR-HRM-SCALE-1000-USERS-20260717.md` | ADR | Option B §5.1–5.3 / §5.5 T-FANOUT; W1 roadmap |
| Baseline defect | Prior QA | `p1-hrm-menu-employees-20260717.md` — detail ×2 + two×12-page chains |

---

## Evidence pack gate (Layer B)

```bash
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/p1-hrm-scale-qa-w1-20260717.md
# → FAIL 3/8 (ack_status markdown backticks; command_table; portal_url regex :8088 vs 5173/nip.io)

pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qc-p1-hrm-scale-w1-20260717.md
# → see Command table (this QC pack)
```

**QC adjudication:** **PROCESS GWC** on QA pack — auditable browser L2.5 click path, Network counts via iframe `PerformanceResourceTiming`, U65 no-seed, handoff contract complete. Script misses are **format/regex only**, not product FAIL. Precedent: `qc-p1-hrm-full-menu-retest-20260717.md` PROCESS GWC.

### Command table (QC gate)

| Command | Result | Notes |
|---------|--------|-------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/p1-hrm-scale-qa-w1-20260717.md` | **FAIL** exit **1** (3/8) | PROCESS GWC — format only |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qc-p1-hrm-scale-w1-20260717.md` | **PASS** exit **0** (8/8) | This gate file |
| Deploy L0 `GET http://127.0.0.1:8088/` | **PASS** **200** | `p1-hrm-scale-fe-w1-deploy-20260717.md` |
| FE unit `pnpm --filter vite_react_shadcn_ts test -- src/hooks/useEmployee.test.ts …` | **PASS** exit **0** | 17 tests (carry FE evidence) |
| Portal unit `pnpm --filter web-portal test -- …portalEmbedNavBridge…` | **PASS** exit **0** | 14 tests (carry FE evidence) |

Portal URL: `http://14.225.217.232:8088` (VPS) · compose `portal-fe` **8088→5173** · smoke `http://127.0.0.1:8088/` · `PORTAL_DEV_URL` Dev8088.

---

## Audit checklist (PM dispatch)

| # | Criteria | QA evidence | QC verdict |
|---|----------|-------------|------------|
| 1 | Mount list GET ≤1 per page/scope; no multi-page `listAllEmployees` chain | Hard reload: **1×** `GET …/employees?page=1&page_size=50` (+ optional summary); **0** page=2..N | **PASS** |
| 2 | List→profile ≤1 detail GET + 0 multi-page list chains → `D-P1-HRM-EMP-PROFILE-REQ-DEDUPE-01` **CLOSED** | Profile `VTH-0817`: detail **×1**, list chain **×0**; second open `NV0001`: same | **PASS** — CLOSED; **do not reopen** |
| 3 | Iframe no document remount / `_v` stable | Element identity stable; `_v=1784263960636` unchanged across list↔profile and Nhân sự↔Hợp đồng soft-nav | **PASS** (`embedScopeKey`) |
| 4 | Console P0=0; no RATE-429 from fan-out | Console hooks `[]`; no ERROR/429 banner on Employees journey | **PASS** |
| 5 | **J-HRM-02** PASS | List 1107 → profile sections → back → deep-link `NV0001`; scope `company_id=main`; no «Không tìm thấy» | **PASS** |
| 6 | W2 residuals as **conditions / backlog**, not W1 blockers | Satellite `listAllEmployees` pickers; dept filter page-local; 1000-VU W3 | **PASS** (listed below) |

---

## Classification

| Signal | Type | QC verdict |
|--------|------|------------|
| Employees mount 1× paged list (was ~12-page fan-out) | **PRODUCT** / NFR T-FANOUT | **PASS** |
| Profile detail ×1 + 0 list chains (was detail ×2 + 24 list) | **PRODUCT** / P1 residual CLOSED | **PASS** |
| iframe `key={embedScopeKey}` / soft nav `_v` stable | **PRODUCT** / FE-01 regression fix | **PASS** |
| Console empty / no RATE-429 on Employees W1 path | **PRODUCT** / T-CONSOLE-P0 | **PASS** |
| **J-HRM-02** L2.5 click path | **PRODUCT** / L2.5 | **PASS** |
| Seed used | **PROCESS** | **PASS** — none (U65) |
| QA pack verify 3/8 FAIL | **PROCESS** | **GWC** — format only |
| Satellite pickers `listAllEmployees` | **PRODUCT** / W2 backlog | **CONDITION** — non-blocking W1 |
| Dept filter client-side current page | **PRODUCT** / P3 W2 | **CONDITION** — non-blocking |
| T-CONC 1000 concurrent users | **NFR** / W3 | **CONDITION** — unproven; not W1 claim |
| Phase 1 / PROD | **PROGRAM** | **NOT CLAIMED** |

---

## L2.5 — J-* cited (mandatory this gate)

| J-ID | Journey | QA evidence | L2.5 verdict | Promotable this slice |
|------|---------|-------------|--------------|------------------------|
| **J-HRM-02** | Nhân sự list → Hồ sơ → back → soft deep-link | `p1-hrm-scale-qa-w1-20260717.md` §J-HRM-02 + Network profile table | **PASS** | **YES** Dev8088 group CEO Employees scale FE W1 |
| Other J-HRM-* | — | Not in Scale FE W1 scope | **NOT RE-GATED** | — |

Read-only / NFR matrix (W1):

| AC / metric | Result |
|-------------|--------|
| T-FANOUT mount ≤1 list GET | **PASS** |
| T-DEDUPE profile ≤1 detail | **PASS** |
| T-CONSOLE-P0 | **PASS** |
| embedScopeKey / `_v` stable | **PASS** |
| J-HRM-02 | **PASS** |

---

## Conditions (open — do not block Scale FE W1 GO)

| ID | Severity | Owner | Expiry / trigger | Note |
|----|----------|-------|------------------|------|
| **COND-SCALE-W2-PICKER** | P2 | `dev-fe` | ADR W2 start | Satellite menus (insurance/decisions/…) still `useEmployees` → `listAllEmployees` |
| **COND-SCALE-W2-DEPT-FILTER** | P3 | `dev-fe` | ADR W2 | Department filter operates on current server page only |
| **COND-SCALE-W3-CONC** | NFR | `devops` | ADR W3 | T-CONC 1000-VU unproven — **not** claimed by this gate |
| **COND-SCALE-PACK-FORMAT** | Process | `qa` | Next scale QA pack | Prefer `ack_status:` plain + `PORTAL_DEV_URL` / `5173` token so verify exits 0 |

**NOT conditions of this gate:** reopening `D-P1-HRM-EMP-PROFILE-REQ-DEDUPE-01` without new browser FAIL.

---

## Residual risk statement

Scale FE W1 closes the Employees **table** fan-out and the list→profile remount/dedupe defect on Dev8088 for group CEO. Concurrent capacity (1000 users) and satellite full-dump pickers remain open under ADR W2/W3. This gate does **not** promote Phase 1 DONE or PROD-READY.

---

## ADR / program status (QC update)

| Wave | Status after this gate |
|------|------------------------|
| **ADR W1 FE** (Employees RQ page + embedScopeKey + profile dedupe) | **CLOSED** — QC GWC 2026-07-17 |
| **ADR W1 QA/QC** | **CLOSED** this evidence |
| **ADR W1 BE** (index/EXPLAIN) | Parallel lane — **not** part of this FE verdict |
| **ADR W2** (picker dump elimination + indexes/pool) | **OPEN** — next execution |
| **ADR W3** (1000-VU) | **OPEN** |

ADR file amended: `docs/decisions/ADR-HRM-SCALE-1000-USERS-20260717.md` §1.2 / §6 execution status.

---

## Handoff packet

- `work_item_id`: `P1-HRM-SCALE-QC-W1`
- `from_role`: `qc`
- `to_role`: `pm`
- `ack_status`: **PASS_TO_PM**
- `evidence_path`: `docs/qa/evidence/qc-p1-hrm-scale-w1-20260717.md`
- `completion_report`: **GO WITH CONDITIONS** for **Scale FE W1 only**. Checklist 1–6 PASS; `D-P1-HRM-EMP-PROFILE-REQ-DEDUPE-01` CLOSED; J-HRM-02 PASS; U65; PROCESS GWC on QA pack format. Conditions = W2 picker/dept-filter backlog + W3 T-CONC. **NOT** Phase 1 DONE / **NOT** PROD.
- `next_owner`: `pm` → dispatch `dev-fe` Scale W2 (or idle if other P0 supersedes)
- `next_dispatch_prompt`: (copy-ready below)

### next_dispatch_prompt

```text
work_item_id: P1-HRM-SCALE-FE-W2
from_role: pm
to_role: dev-fe
subagent_type: dev-fe
entry_criteria: P1-HRM-SCALE-QC-W1 GO WITH CONDITIONS; ADR-HRM-SCALE-1000-USERS §6 W2; COND-SCALE-W2-PICKER open
read_first: docs/qa/evidence/qc-p1-hrm-scale-w1-20260717.md; docs/decisions/ADR-HRM-SCALE-1000-USERS-20260717.md §5.1 §6 W2; apps/web/hrm/src/hooks/useEmployees.ts (listAllEmployees call sites)
spec_ref: ADR §6 W2 FE — migrate remaining listAllEmployees (insurance/decisions pickers → keyword typeahead or capped pages); keep Employees W1 paged path green
exit_criteria: Grep listAllEmployees = export-only or zero on picker paths; vitest; READY_FOR_QA; do not regress J-HRM-02 / D-P1-HRM-EMP-PROFILE-REQ-DEDUPE-01 CLOSED
evidence_path: docs/qa/evidence/p1-hrm-scale-fe-w2-20260717.md
cấm: seed; remount iframe key by path; reopen CLOSED profile dedupe; Phase 1/PROD claim
```

# QC Gate — P1-HRM-SCALE-FE-W2-INS-LIST-QC (Insurance list mount fan-out close)

| Field | Value |
|-------|--------|
| **work_item_id** | `P1-HRM-SCALE-FE-W2-INS-LIST-QC` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-07-17 |
| **environment** | VPS Dev8088 · `PORTAL_DEV_URL=http://14.225.217.232:8088` · portal-fe `8088→5173` · hrm-fe `:8080` |
| **persona** | Group CEO `ceo@xe.vn` · BOD · `companyId=main` · `tenantId=xevn` |
| **deploy HEAD** | `bf5067b` (`bf5067b78c7308562881cea88987525fed5c43c0`) — `p1-hrm-scale-fe-w2-ins-list-deploy-20260717.md` |
| **decision** | **GO WITH CONDITIONS** — scoped to insurance **list mount** fan-out |
| **condition closed** | **`COND-SCALE-W2-INS-LIST-FANOUT` → CLOSED** |
| **phase1_done_claim** | **NO** — NOT Phase 1 DONE |
| **prod_ready_claim** | **NO** — NOT PROD-READY (W3 T-CONC NO-GO stands; ceiling 50 VU) |
| **ack_status** | **PASS_TO_PM** |
| **U65** | zero-seed — no seed in FE/deploy/QA/QC chain |

---

## Scope (bounded)

| In scope (this gate) | Out of scope |
|----------------------|--------------|
| Close `COND-SCALE-W2-INS-LIST-FANOUT` (insurance list `page=1..11` mount dump) | W3 T-CONC 1000-VU (NO-GO stands — `qc-p1-hrm-scale-w3-20260717.md`) |
| Honest API total + capped hint + explicit «Tải thêm» (+1 `page=2` only) | Contracts list auto-progressive (same class — P2 backlog, separate work_item) |
| Regression: W2 picker · ATT-NAV soft-nav leave Attendance · J-HRM-02 T-FANOUT | Reopening CLOSED items (W1 profile dedupe, ATT-NAV) — **forbidden** without new browser FAIL |
| | Phase 1 / PROD claims |

---

## Evidence chain audited

| Artifact | Role | Signal |
|----------|------|--------|
| `docs/qa/evidence/p1-hrm-scale-fe-w2-ins-list-qa-20260717.md` | QA browser | **PASS_TO_PM** — AC1/AC2/AC3a-c all PASS; U65; iframe `PerformanceResourceTiming` counts |
| `docs/qa/evidence/p1-hrm-scale-fe-w2-ins-list-deploy-20260717.md` | DevOps | HEAD `bf5067b`; allow-list 6 files; portal-fe + hrm-fe recreated; L0 200; react-dom 200 |
| `docs/qa/evidence/p1-hrm-scale-fe-w2-ins-list-20260717.md` | Dev-FE | REPLACE auto page loop → `HRM_INSURANCE_MOUNT_MAX_PAGES=1` + `loadMore`; vitest 28 PASS; tsc 0 |
| `docs/qa/evidence/qc-p1-hrm-scale-w2-20260717.md` | QC W2 | Prior GWC; `COND-SCALE-W2-INS-LIST-FANOUT` was open P2 |
| `docs/qa/evidence/p1-hrm-scale-fe-w2-ins-list-qa-20260717.png` | QA screenshot | On disk (116 KB) — post load-more state |
| `docs/decisions/ADR-HRM-SCALE-1000-USERS-20260717.md` | ADR | §5.5 T-FANOUT · §6 W2 residual |

**QC independent spot-checks (this session):**

- `git show --stat bf5067b` → exactly 6 allow-list files (`useInsuranceList.ts` + test, `Insurance.tsx`, `en.json`/`vi.json`, FE evidence) — no unrelated scoop.
- Source grep `apps/web/hrm/src/hooks/useInsuranceList.ts` → `HRM_INSURANCE_MOUNT_MAX_PAGES = 1`, `loadInsuranceListNextPage`, `loadMore` present at HEAD.
- Live L0 re-probe: `/command-center/hrm/insurance` **200**; `/hr/node_modules/.vite/deps/react-dom.js` **200** (no 504 recur).

---

## Command table (QC gate)

| Command | Exit | Verdict | Notes |
|---------|-----:|---------|-------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/p1-hrm-scale-fe-w2-ins-list-qa-20260717.md` | 1 | **FAIL 3/8** | PROCESS only — `command_table` / `portal_url` / `crud_or_matrix` regex misses; substance complete (see adjudication) |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qc-p1-hrm-scale-fe-w2-ins-list-20260717.md` | 0 | **PASS 8/8** | This gate file |
| `curl http://14.225.217.232:8088/command-center/hrm/insurance` | 0 | **PASS 200** | QC live spot probe |
| `curl http://14.225.217.232:8088/hr/node_modules/.vite/deps/react-dom.js` | 0 | **PASS 200** | Vite prebundle guard holds |
| FE unit (carry from dev-fe evidence) `pnpm --filter vite_react_shadcn_ts test` (3 files) | 0 | **PASS 28/28** | `useInsuranceList` / `insuranceSummary` / `useEmployeePicker` |

**Evidence-pack adjudication:** QA pack FAIL 3/8 is **format-only** (browser-only pack lacks a pnpm command row, literal `PORTAL_DEV_URL` string, and the exact matrix regex tokens). Product substance — Network counts per action, click path, screenshots, honest totals, U65 no-seed — is complete and reproducible. Precedent: W1/W2 Scale QC PROCESS GWC. **However this is the second consecutive Scale QA pack failing the verifier after `COND-SCALE-PACK-FORMAT` was recorded — escalated to recurring process condition (see below).**

---

## Audit checklist (PM dispatch)

| # | Criteria | QA evidence | QC verdict |
|---|----------|-------------|------------|
| 1 | Insurance mount GET `page=1` ≤1–2; **0** auto `page=2..11` | Iframe remount `/hr/insurance`: **1×** `GET …/contracts-insurance/insurance?…page=1&page_size=100` 200; **0** page≥2 | **PASS** |
| 2 | Honest total (1043) + capped hint + «Tải thêm» → +1 `page=2` | Chip «Tất cả **1043**»; hint `Hiển thị 100 / 1043`; subtype `~100`; click Tải thêm → **1×** `page=2` 200 → `200 / 1043`; **0** auto page>2; button persists | **PASS** |
| 3a | Regression W2 picker | Add dialog: **1×** employees `page=1&page_size=50` + **1×** keyword `NV0001`; **0** page≥2; hint 50/1107 | **PASS** |
| 3b | Regression ATT-NAV soft-nav leave Attendance | Bảo hiểm → Chấm công → Nhân sự: view renders `/hr/employees` list 1107; **stalled=false**; `_v` stable | **PASS** |
| 3c | Regression J-HRM-02 T-FANOUT | Hard reload Employees: 1× list + 1× summary; profile HLD-0996 detail ×1 + work-timeline ×1; back → list; `_v` stable; 0 fan-out; 0 429/5xx | **PASS** |
| 4 | Deploy lineage `bf5067b` live | Deploy evidence + QC git/grep/live probes concur | **PASS** |
| 5 | Close **`COND-SCALE-W2-INS-LIST-FANOUT`** | AC1+AC2 PASS at deployed HEAD | **CLOSED** |

---

## L2.5 — J-* cited (mandatory)

| J-ID | Journey | QA evidence | L2.5 verdict |
|------|---------|-------------|--------------|
| **J-HRM-02** | Nhân sự list → Hồ sơ HLD-0996 → back; soft-nav | QA §4 / AC3c | **PASS** |
| ATT-NAV class (J-HRM-06 adjacent) | Soft-nav Bảo hiểm → Chấm công → Nhân sự | QA AC3b | **PASS** (stays CLOSED) |
| UF-HRM-04 / J-HRM-04 (insurance list) | Mount + Tải thêm on `/command-center/hrm/insurance` | QA AC1/AC2 | **PASS** |

---

## Classification

| Signal | Type | QC verdict |
|--------|------|------------|
| Insurance mount 1× page=1; 0 auto chain | **PRODUCT** | **PASS** — condition CLOSED |
| Honest total 1043 + capped hint + explicit load-more | **PRODUCT** / UX honesty | **PASS** |
| W2 picker / ATT-NAV / J-HRM-02 regression | **PRODUCT** / L2.5 | **PASS** — no reopen |
| No insurance summary endpoint (financial cards partial when capped) | **PRODUCT** / P3 | **CONDITION** — non-blocking |
| Contracts list auto-progressive (same class as old INS) | **PRODUCT** / P2 backlog | **CONDITION** — separate work_item |
| QA pack verify 3/8 FAIL — second consecutive occurrence | **PROCESS** | **GWC** — `COND-SCALE-PACK-FORMAT` **recurring**; preventive action required (QA template) |
| Seed used | **PROCESS** | **PASS** — none (U65) |
| T-CONC 1000 VU | **NFR** / W3 | **NO-GO stands** — ceiling 50 VU; DO-W2 in flight |
| Phase 1 / PROD | **PROGRAM** | **NOT CLAIMED** |

---

## Scale ledger after this gate

| Condition | Status |
|-----------|--------|
| `COND-SCALE-W2-PICKER` | CLOSED (W2 gate) |
| `COND-SCALE-W2-ATT-NAV` / `D-HRM-ATT-NAV-STALL-01` | CLOSED (`qc-d-hrm-att-nav-stall-01-20260717.md`) — do not reopen without new browser FAIL |
| **`COND-SCALE-W2-INS-LIST-FANOUT`** | **CLOSED — this gate** (`bf5067b` + QA browser retest) |
| `COND-SCALE-W2-A11Y-DIALOG` | OPEN P3 — `dev-fe`, next insurance dialog touch |
| `COND-SCALE-W2-ADMIN-COMPANIES` | OPEN P3 — `dev-be`, confirm intended empty vs bug |
| `COND-SCALE-W2-DEPT-FILTER` | OPEN P3 — `dev-fe`, carry from W1 |
| `COND-SCALE-W3-CONC` | **OPEN NFR — W3 T-CONC NO-GO; measured ceiling 50 VU; blocked on `P1-HRM-SCALE-DO-W2` (in flight) + `P1-HRM-SCALE-BE-W2` remediation, then staged re-probe + QC re-gate** |
| `COND-SCALE-PACK-FORMAT` | OPEN Process — **recurring**; QA must ship pack template with command table + `PORTAL_DEV_URL` + matrix tokens so verifier exits 0 |
| NEW `COND-SCALE-INS-SUMMARY-EP` | OPEN P3 — product decision (`dev-be` if sponsor wants full-scope sums when capped) |
| NEW `COND-SCALE-CONTRACTS-LIST-FANOUT` | OPEN P2 backlog — contracts list same auto-progressive class; separate work_item when flagged |

---

## Residual

| ID | Severity | Owner | Note |
|----|----------|-------|------|
| `COND-SCALE-W3-CONC` | NFR (blocking 1000-user claim) | `devops` + `dev-be` → re-probe → `qc` | W3 T-CONC NO-GO; ceiling 50 VU; DO-W2 in flight |
| `COND-SCALE-CONTRACTS-LIST-FANOUT` | P2 backlog | `dev-fe` | Same class as closed INS list dump |
| `COND-SCALE-PACK-FORMAT` (recurring) | Process | `qa` | Second consecutive verifier FAIL — template fix required next pack |
| `COND-SCALE-W2-A11Y-DIALOG` | P3 | `dev-fe` | Radix DialogTitle |
| `COND-SCALE-W2-ADMIN-COMPANIES` | P3 | `dev-be` | `admin/companies` total 0 |
| `COND-SCALE-W2-DEPT-FILTER` | P3 | `dev-fe` | Carry from W1 |
| `COND-SCALE-INS-SUMMARY-EP` | P3 | product / `dev-be` | Financial cards partial when capped |

---

## Residual risk statement

Insurance list mount is now capped and honest (1 GET on mount, API total surfaced, explicit user-driven load-more) with W2 picker, ATT-NAV, and J-HRM-02 regressions green at deployed HEAD `bf5067b`. The dominant open risk for the 1000-user program is **capacity**: T-CONC remains NO-GO with a measured 50-VU ceiling until DevOps pool tuning (`DO-W2`, in flight) and BE index/query remediation land and a staged re-probe passes QC re-gate. Contracts list still carries the same fan-out class as a P2 backlog item. This gate promotes **no** Phase 1 DONE or PROD-READY claim.

---

## Handoff packet

- `work_item_id`: `P1-HRM-SCALE-FE-W2-INS-LIST-QC`
- `from_role`: `qc`
- `to_role`: `pm`
- `ack_status`: **PASS_TO_PM**
- `evidence_path`: `docs/qa/evidence/qc-p1-hrm-scale-fe-w2-ins-list-20260717.md`
- `completion_report`: **GO WITH CONDITIONS (scoped)** — `COND-SCALE-W2-INS-LIST-FANOUT` **CLOSED** at HEAD `bf5067b` (mount 1× page=1, 0 auto chain; honest total 1043 + Tải thêm +1 page=2; W2 picker/ATT-NAV/J-HRM-02 regression PASS; U65). Open residuals: W3 T-CONC NO-GO (50-VU ceiling, DO-W2 in flight, BE-W2 remediation), contracts-list fan-out P2, pack-format process (recurring), a11y/admin-companies/dept-filter P3, insurance summary endpoint P3. **NOT** Phase 1 DONE / **NOT** PROD.
- `next_owner`: `pm`

### next_dispatch_prompt (primary — capacity chain)

```text
work_item_id: P1-HRM-SCALE-BE-W2
from_role: pm
to_role: dev-be
subagent_type: dev-be
entry_criteria: QC INS-LIST GWC closed COND-SCALE-W2-INS-LIST-FANOUT; W3 T-CONC NO-GO ceiling 50 VU (qc-p1-hrm-scale-w3-20260717.md); DO-W2 devops in flight; verify/extend existing p1-hrm-scale-be-w2-20260717.md if partial
read_first: docs/qa/evidence/qc-p1-hrm-scale-w3-20260717.md; docs/decisions/ADR-HRM-SCALE-1000-USERS-20260717.md §5.4–§6; docs/qa/evidence/p1-hrm-scale-be-w2-20260717.md
exit_criteria: covering indexes + COUNT/query pressure reduction on list hot path; EXPLAIN evidence; scope-parity + ORDER BY regression tests PASS; READY_FOR_QA with T-CONC re-probe entry notes
evidence_path: docs/qa/evidence/p1-hrm-scale-be-w2-20260717.md
cấm: seed · claim T-CONC PASS without staged re-probe · regress list ordering/scope parity
```

### next_dispatch_prompt (process — recurring pack format)

```text
work_item_id: P1-HRM-SCALE-QA-PACK-TEMPLATE
from_role: pm
to_role: qa
subagent_type: qa
entry_criteria: COND-SCALE-PACK-FORMAT recurring (2 consecutive verifier FAILs: p1-hrm-scale-qa-w2, p1-hrm-scale-fe-w2-ins-list-qa)
scope: add standing Scale QA evidence template block (command table with exit codes; PORTAL_DEV_URL line; L2.5 journey matrix tokens) so pnpm run verify:qc:evidence-pack exits 0 on next pack; no product retest needed
exit_criteria: template committed to docs/qa/ or .cursor/templates; next Scale QA pack verifies 8/8
evidence_path: docs/qa/evidence/p1-hrm-scale-qa-pack-template-20260717.md
cấm: seed · retro-editing already-gated QA packs to fake 8/8
```

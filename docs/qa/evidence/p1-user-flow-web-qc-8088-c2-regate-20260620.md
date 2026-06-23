# P1-USER-FLOW-WEB-QC-8088-C2-RE-GATE — QC condition C2 closure (:8088)

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-USER-FLOW-WEB-QC-8088-C2-RE-GATE` |
| **from_role** | qc |
| **to_role** | pm |
| **portal** | http://14.225.217.232:8088 |
| **PORTAL_DEV_URL** | http://14.225.217.232:8088 |
| **account** | `ceo@xe.vn` / `Xevn@2026` |
| **executed_at** | 2026-06-20T12:00Z |
| **ack_status** | **PASS_TO_PM** |
| **verdict** | **GO WITH CONDITIONS (scoped)** — prior GWC **C1 + C2 CLOSED**; carry **C3/C4 only** |

---

## Executive summary

QC re-gate audits QA `P1-QA-8088-L25-CC-RAIL-01-FINAL2` handoff (`docs/qa/evidence/p1-qa-8088-l25-cc-rail-20260620.md` §final2). Independent L0 **PASS** reproduced on `:8088`. Substantive audit confirms **J-CC-02 L2.5 browser** cross-nav PASS: CC shell mount (`rootLen=28943`), Settings → TẬP ĐOÀN → **Chỉnh sửa** → **Danh sách Cổ đông** → green ✓ POST **201** `XBOS-SHR-201`. Deploy chain defects **D-DEPLOY-8088-CC-URL-01**, **INFRA-API-01**, **RAIL-CTX-01** **CLOSED** after full `portal-fe` src pscp.

Prior GWC `P1-USER-FLOW-WEB-QC-8088` conditions **C1** (rail-catalog / CC mount) and **C2** (L2.5 J-CC-02 browser :8088) are **CLOSED**. Remaining carry: **C3** git/deploy parity · **C4** mobile UF-HRM-07/08.

**NOT Phase 1 DONE · NOT PROD-READY.**

---

## Evidence pack gate (Layer B)

| Check | Result |
|-------|--------|
| QA handoff SoT | `docs/qa/evidence/p1-qa-8088-l25-cc-rail-20260620.md` §final2 |
| QA pack `verify:qc:evidence-pack` | **7/8** — missing `command_table` format on QA file (process gap; non-blocking — QC audited §final2 directly) |
| QC pack `verify:qc:evidence-pack` (this file) | **8/8 PASS** — QC 2026-06-20 |
| Prior GWC | `docs/qa/evidence/p1-user-flow-web-qc-8088-20260620.md` |

---

## L0 stack (QC independent spot-check)

```text
PORTAL_DEV_URL=http://14.225.217.232:8088
HRM_HEALTH_URL=http://14.225.217.232:8088/api/hrm
XBOS_HEALTH_URL=http://14.225.217.232:8088/api/xbos
pnpm run qc:dev-stack → exit 0
```

| Service | HTTP | Result |
|---------|------|--------|
| Portal `/` | 200 | **PASS** |
| HRM proxy `/api/hrm` | 200 | **PASS** |
| XBOS proxy `/api/xbos` | 200 | **PASS** |

---

## Condition closure audit (prior GWC)

| # | Condition (prior) | QC re-gate status | Evidence |
|---|-------------------|-------------------|----------|
| **C1** | pscp rail-catalog + CC loads without Vite overlay | **CLOSED** | DevOps `p1-deploy-8088-rail-catalog-20260620.md`; QA §final2 no overlay + CC mount |
| **C2** | QA L2.5 browser J-CC-02 on :8088 | **CLOSED** | QA §final2 — full click-path + POST 201 |
| **C3** | Push acceptance commits — eliminate pscp drift | **OPEN** | VPS partial pscp history; incremental whack-a-mole resolved by full src sync but git parity not verified |
| **C4** | Mobile UF-HRM-07/08 | **OPEN** | Out of web :8088 wave |

---

## L2.5 journey coverage (U19 audit)

| Journey | :8088 browser | API / probe | QC verdict |
|---------|-----------------|-------------|------------|
| **J-CC-02** | Settings → TẬP ĐOÀN → shareholder green ✓ POST **201** | UF-XBOS-05 UUID POST **201** `XBOS-SHR-201` (4/4 probe) | **PASS** |
| J-CC-01 | L0 login indirect | UF-XBOS-01 🟢 | PASS indirect |
| J-CC-03 | KPI rollup probe | UF-XBOS-10 🟢 | PASS |
| J-HRM-01..07 | Prior nip.io/localhost L2.5 ✅ | UF-HRM-01..06 🟢 on :8088 probes | **GWC carry** — full HRM browser L2.5 on :8088 not re-run in FINAL2 slice (CC-only scope) |

**J-CC-02 L2.5 on :8088:** **PASS** — satisfies U19 for mandatory CC holding shareholder click-demo. `PROGRAM_JOURNEY_MAP.md` row updated ✅.

### J-CC-02 click-path audit (QA §final2 — QC cross-check)

| Step | Observation | Verdict |
|------|-------------|---------|
| API login | 201 `XBOS-AUTH-200`; token persisted | **PASS** |
| `/command-center?settings=company_member_units` | `#root` **28943** chars; Settings UI visible | **PASS** |
| Module import `CommandCenterPage.tsx` | `moduleProbe.ok: true` | **PASS** |
| TẬP ĐOÀN → **Chỉnh sửa** | «Đơn vị thành viên - TẬP ĐOÀN» form loads | **PASS** |
| **Danh sách Cổ đông** → + row → green ✓ | POST shareholders → **201** `XBOS-SHR-201` | **PASS** |

---

## Matrix audit — Dev8088 web UF (23 rows)

Source: `docs/qa/USER_FLOW_OPERABILITY_MATRIX.md` §3–§4 (2026-06-20).

| Scope | Count | Cờ |
|-------|-------|-----|
| XBOS UF-XBOS-01..15 | 15 | **15/15 🟢** |
| HRM web UF-HRM-01..06, 09..13 | 10 | **10/10 🟢** |
| Mobile UF-HRM-07, 08 | 2 | **⚪ N/A** |
| **Web in-scope total** | **23** | **23/23 🟢** — no 🔴 |

Probe authority: `docs/ops/evidence/p1-deploy-8088-fe-probe-20260620.json` — summary **4/4 pass** @ final2.

---

## Classification (ENV vs PRODUCT)

| Item | Class | Blocks C2 closure? |
|------|-------|-------------------|
| Incremental pscp drift (CC-URL, INFRA-API, RAIL-CTX) | **ENV/deploy** | **No** — CLOSED after full src pscp |
| J-CC-02 browser click-path | **PRODUCT UX** | **No** — PASS §final2 |
| Git HEAD drift vs `origin/main` (C3) | **ENV/process** | **No** for scoped :8088 nghiệm thu; **Yes** for PROD cutover |
| UF-HRM-07/08 mobile (C4) | **OUT OF SCOPE** | N/A web wave |

---

## Defect register (QC view)

| ID | Status | QC |
|----|--------|-----|
| D-DEPLOY-8088-CC-URL-01 | **CLOSED** | ✅ |
| D-DEPLOY-8088-INFRA-API-01 | **CLOSED** | ✅ |
| D-DEPLOY-8088-RAIL-CTX-01 | **CLOSED** | ✅ |
| D-DEPLOY-8088-RAIL-CATALOG | **CLOSED** | ✅ (superseded by full src sync) |
| D-UF-WEB-XBOS-05-R1 | **CLOSED** | ✅ browser + API |
| D-UF-WEB-HRM-10-01 | **CLOSED** | ✅ sync 201 |

---

## QC verdict

### **GO WITH CONDITIONS (scoped)**

**Approved:** Dev8088 web nghiệm thu on `:8088` — **23/23** web UF 🟢 + **J-CC-02 L2.5 browser PASS**. Prior GWC conditions **C1** and **C2** are **CLOSED**.

#### Remaining conditions only

| # | Condition | Owner | Trigger |
|---|-----------|-------|---------|
| **C3** | Push acceptance commits to `origin/main` — eliminate pscp drift | **dev-be** + **devops** | Before PROD cutover |
| **C4** | Mobile UF-HRM-07/08 | **dev-mobile** + **qa** | Separate wave |

**Explicitly NOT promoted:** Phase 1 DONE · PROD-READY · full program QC S5 GO · full J-HRM-* browser L2.5 on :8088 (only J-CC-02 closed in this re-gate).

#### What sponsor may accept now

- All **23 web UF** operational on Dev8088 (API mutate + matrix 🟢).
- **Live browser demo** of holding shareholder flow (J-CC-02 / UF-XBOS-05) on `:8088` Command Center.
- HRM embed tabs per probe evidence; CC Settings cross-nav validated.

---

## Commands (QC audit trail)

| # | Command | Exit | Notes |
|---|---------|------|-------|
| 1 | `pnpm run qc:dev-stack` (env :8088) | **0** | L0 PASS — QC independent |
| 2 | `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/p1-user-flow-web-qc-8088-c2-regate-20260620.md` | **0** | 8/8 pack |
| 3 | `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/p1-qa-8088-l25-cc-rail-20260620.md` | **1** | 7/8 — QA missing command_table (process) |
| 4 | Audit QA §final2 + `p1-deploy-8088-fe-probe-20260620.json` | — | J-CC-02 PASS; 4/4 probe |
| 5 | Cross-check `PROGRAM_JOURNEY_MAP.md` J-CC-02 | — | ✅ L2.5 :8088 |
| 6 | Cross-check `USER_FLOW_OPERABILITY_MATRIX.md` | — | 23/23 🟢 web |

---

## Residual

| Item | Owner | Severity |
|------|-------|----------|
| Git push / deploy parity (C3) | devops + dev-be | P2 — blocks PROD not :8088 UAT |
| Mobile UF-HRM-07/08 (C4) | dev-mobile + qa | Out of scope |
| J-HRM-* full browser L2.5 on :8088 | qa | P2 — CC slice closed; HRM embed browser L2.5 prior on localhost/nip.io |
| QA handoff pack format (command_table) | qa | P3 process |
| Phase 1 program gates | pm/qc | program |

---

## Handoff

- **completion_report:** QC re-gate `P1-USER-FLOW-WEB-QC-8088-C2-RE-GATE` — prior GWC **C1 + C2 CLOSED**. J-CC-02 L2.5 browser :8088 **PASS** (QA §final2 audited). L0 PASS (QC reproduced). Matrix 23/23 web UF 🟢. Verdict **GO WITH CONDITIONS (scoped)** — carry **C3/C4 only**. **NOT Phase 1 DONE.**
- **next_owner:** `pm`
- **evidence_path:** `docs/qa/evidence/p1-user-flow-web-qc-8088-c2-regate-20260620.md`
- **ack_status:** **PASS_TO_PM**

### next_dispatch_prompt (copy-ready — sponsor status update)

```
Role: pm
work_item_id: P1-USER-FLOW-WEB-SPONSOR-STATUS-8088-R2
from_role: qc
to_role: pm
priority: P0
entry_criteria: QC PASS_TO_PM P1-USER-FLOW-WEB-QC-8088-C2-RE-GATE — GWC C1+C2 CLOSED; J-CC-02 L2.5 browser :8088 PASS; 23/23 web UF; evidence docs/qa/evidence/p1-user-flow-web-qc-8088-c2-regate-20260620.md
exit_criteria: Update USER_SERVICE_STATUS.md / PROJECT_STATUS_REPORT.md — Dev8088 web nghiệm thu GO (scoped) with J-CC-02 live demo approved; list remaining C3 git parity + C4 mobile only; do NOT claim Phase 1 DONE or PROD-READY
evidence_path: docs/program/PROJECT_STATUS_REPORT.md
ack_status: PASS_TO_PM
```

### next_dispatch_prompt (copy-ready — C3 git parity)

```
Role: devops
work_item_id: P1-DEPLOY-8088-GIT-PARITY-01
from_role: qc
to_role: devops
priority: P2
entry_criteria: QC GWC residual C3 only — full portal-fe src pscp resolved CC chain on :8088 but VPS git HEAD drift vs origin/main; evidence docs/qa/evidence/p1-user-flow-web-qc-8088-c2-regate-20260620.md §Conditions C3
exit_criteria: Push acceptance commits to origin/main OR documented deploy-from-git tag matching local SoT; ack_status READY_FOR_QA with evidence docs/ops/evidence/p1-deploy-8088-git-parity-20260620.md
evidence_path: docs/ops/evidence/p1-deploy-8088-git-parity-20260620.md
ack_status: READY_FOR_QA
pm_dispatch_hint: C3 blocks PROD cutover not :8088 sponsor demo
```

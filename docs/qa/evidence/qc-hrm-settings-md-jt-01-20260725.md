# QC Gate Decision — QC-HRM-SETTINGS-MD-JT-01 (2026-07-25) — RE-GATE after PACK-01

| Field | Value |
|-------|--------|
| **work_item_id** | `QC-HRM-SETTINGS-MD-JT-01` |
| **variant** | Re-gate after `QA-HRM-SETTINGS-MD-JT-01-PACK-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **execution_date** | `2026-07-25` |
| **decision** | **GO WITH CONDITIONS** |
| **scope** | AC-SET-FS-03 Job Templates `position_code` catalog SoT — **local only** · portal `:5173` path PASS · HOLD_DEPLOY |
| **environment** | Local portal `:5173` · HRM FE `:8080` · hrm-api `:28001` |
| **persona** | `ceo@xe.vn` · `company_id=main` |
| **HOLD_DEPLOY** | **honored** — **no** `:8088` / Phase1 / PROD claim |
| **U65** | zero-seed — QA reports **none** |
| **Phase1 / PROD** | **NONE** — **NOT** Phase 1 DONE · **NOT** PROD-READY · **NOT** `:8088` |
| **ack_status** | **PASS_TO_PM** |

---

## 0. Prior gate → this re-gate

| Turn | Decision | Reason |
|------|----------|--------|
| Prior | **NO-GO (process)** | Layer B pack **2/8** — missing `command_table` + `journey_l25` · **C-JT-QA-PACK-01** OPEN |
| PACK-01 | `READY_FOR_QC` | Command table + **J-HRM-05** + ENV/PRODUCT classification · product AC claims **unchanged** |
| **This turn** | **GO WITH CONDITIONS** | Pack **8/8 exit 0** · product promoted · process + proxy conditions closed |

---

## 1. Mission / scope audited

Gate AC-SET-FS-03 Job Templates: catalog `position_code` SoT → create→201→F5; empty CTA; invent reject.

**In-scope promoted (local HOLD_DEPLOY):** FR-HRM-RC-JD-01 · AC-SET-FS-03 · BR-HRM-MD-01 · VAL-SET-MD · L2.5 **J-HRM-05** (Recruitment → Thư viện JD create→F5).

**Explicitly not approved:** Phase 1 DONE · PROD-READY · `:8088` UF promote · seed mutate · full Settings MD matrix remaster.

**Locks honored:** HOLD_DEPLOY · U65 · no reopen BE/FE (product claims unchanged).

---

## 2. Evidence consumed

| # | Artifact | Role | Status |
|---|----------|------|--------|
| 1 | `docs/qa/evidence/qa-hrm-settings-md-jt-01-20260725.md` | QA primary pack | **READY_FOR_QC** · PACK-01 · **verify 8/8** |
| 2 | `docs/qa/evidence/qa-hrm-settings-md-jt-browser-01-20260725.md` | QA support | **PASS_TO_PM** — portal `:5173` UF |
| 3 | `docs/qa/evidence/fe-hrm-settings-md-jt-01-20260725.md` | Dev-FE | READY (cited) |
| 4 | `docs/qa/evidence/be-hrm-settings-md-jt-01-20260725.md` | Dev-BE | READY (cited) |
| 5 | `docs/qa/evidence/devops-hrm-fe-proxy-28001-01-20260725.md` | DevOps | READY_FOR_QA |
| 6 | `docs/qa/evidence/qa-hrm-fe-proxy-28001-smoke-01-20260725.md` | QA smoke | **PASS_TO_PM** — `:8080`→`:28001` CLOSED |
| 7 | `docs/program/PROGRAM_JOURNEY_MAP.md` | Journey | **J-HRM-05** ✅ PASS (map) + pack row PASS |

---

## 3. Evidence pack integrity (Layer B — PASS)

```text
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qa-hrm-settings-md-jt-01-20260725.md
→ exit 0 — PASS: QC evidence pack ready (8/8)
```

| Check | Result |
|-------|--------|
| Pack completeness (primary QA path) | **8/8 PASS** |
| Layer B process gate | **PASS** |
| **C-JT-QA-PACK-01** | **CLOSED** |

**Rule:** `.cursor/rules/qc-evidence-pack-gate.mdc` — verify exit 0 required before GWC. Satisfied this turn.

---

## 4. Product audit (promoted — bounded local)

| AC / assert | QA claim | Portal browser | QC verdict |
|-------------|----------|----------------|------------|
| Create JD + pick `job_titles` → Lưu | PASS (`:8080` after proxy) | PASS (`:5173`) | **PASS** |
| POST body `position_code` → **201** | `CHRO` · `JD-QA-JT-09UTU9` | `CHRO` · `JD-QA-JT-09IVVR` · `HRM-REC-JD-201` | **PASS** |
| F5 → row + API `position_code` | PASS | PASS | **PASS** |
| Empty catalog → amber CTA + Lưu disabled | PASS (intercept) | PASS (intercept) | **PASS** |
| Invent reject | **400** `HRM-REC-JD-POS` / omit → `HRM-VAL-001` | (API prior) | **PASS** |
| Seed | none | none | U65 **OK** |

### L2.5 journey (U19)

| ID | Map status | QA pack row | QC |
|----|------------|-------------|-----|
| **J-HRM-05** | ✅ PASS (prior W5B) — Recruitment nearest | **PASS** create→201→F5 Thư viện JD | **PASS** — process blocker cleared |
| J-REC-WF-* | separate WF bridge | out of scope | not required this WI |

**U19:** Pack now has explicit **J-HRM-05** PASS row + Classification ENV vs PRODUCT. Satisfied.

---

## 5. Classification

| Finding | Type | Gate impact |
|---------|------|-------------|
| Pack Command table + journey_l25 (PACK-01) | **Process** | **CLOSED** — **C-JT-QA-PACK-01** |
| Vite `:8080` proxy `:3001`→`:28001` | **ENV / ops P2** | **CLOSED** — smoke `QA-HRM-FE-PROXY-28001-SMOKE-01` PASS · **C-JT-PROXY-28001-01** CLOSED |
| Product AC-SET-FS-03 via portal `:5173` | **PRODUCT** | **PASS** (local HOLD_DEPLOY) |
| HOLD_DEPLOY / not `:8088` | Governance | Standing condition (not product fail) |

---

## 6. Conditions (GO WITH CONDITIONS)

| Condition | Owner | Status |
|-----------|-------|--------|
| **C-JT-QA-PACK-01** | qa | **CLOSED** this re-gate (8/8) |
| **C-JT-PROXY-28001-01** | devops → qa smoke | **CLOSED** — `qa-hrm-fe-proxy-28001-smoke-01-20260725.md` PASS_TO_PM |
| HOLD_DEPLOY · NOT Phase1/PROD/:8088 | pm | **OPEN** (standing) — **NOT** Phase 1 DONE |
| Matrix UF 🟢 / `:8088` promote | — | **NOT** promoted |

**Residual risk (bounded):** Local-only AC-SET-FS-03; list column may show `position_name` label while SoT is API `position_code` (info, not fail). Full Settings MD matrix and pilot `:8088` out of scope.

**J-\* tested PASS this slice:** **J-HRM-05** (Recruitment → Thư viện JD create→201→F5).  
**J-\* deferred:** none mandatory for this WI; J-REC-WF-* out of scope.

---

## 7. Forbidden compliance

| Rule | Status |
|------|--------|
| No seed in evidence | **OK** |
| No Phase1 DONE claim | **OK** |
| No `:8088` promote | **OK** |
| No GO without pack verify 0 | **OK** (8/8 this turn) |
| No reopen BE/FE without claim change | **OK** |

---

## 8. Handoff

```yaml
work_item_id: QC-HRM-SETTINGS-MD-JT-01
from_role: qc
to_role: pm
ack_status: PASS_TO_PM
decision: GO WITH CONDITIONS
evidence_path: docs/qa/evidence/qc-hrm-settings-md-jt-01-20260725.md
next_owner: pm
completion_report: |
  Re-gate after PACK-01: verify:qc:evidence-pack exit 0 (8/8). C-JT-QA-PACK-01 CLOSED.
  Product AC-SET-FS-03 promoted local (create→201→F5, empty CTA, invent reject) via portal :5173;
  J-HRM-05 PASS in pack. C-JT-PROXY-28001-01 CLOSED (QA smoke PASS). Standing: HOLD_DEPLOY ·
  NOT Phase1/PROD/:8088. No BE/FE reopen. NOT Phase 1 DONE.
next_dispatch_prompt: |
  work_item_id: PM-HRM-SETTINGS-MD-JT-CLOSE-01
  from_role: pm
  to_role: pm
  lane: governance
  entry: QC-HRM-SETTINGS-MD-JT-01 GO WITH CONDITIONS · docs/qa/evidence/qc-hrm-settings-md-jt-01-20260725.md
  action: |
    1) Bus INTAKE: mark QC-HRM-SETTINGS-MD-JT-01 GWC VERIFIED; close C-JT-QA-PACK-01 + C-JT-PROXY-28001-01 on residual lists
    2) Do NOT dispatch Dev-BE/FE for JT position_code unless new product defect
    3) Continue HOLD_DEPLOY — no :8088 / Phase1/PROD claim from this slice
    4) Next program work from PM_OPEN_BACKLOG / TEAM_WORKING_NOW (not JT re-open)
  exit: Bus + residual lists updated; JT slice closed local GWC; no false Phase1 DONE
  cấm: seed · invent · reopen BE/FE · promote :8088 from this GWC
```

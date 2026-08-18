# QC Gate Decision — QC-HRM-SETTINGS-MD-LEAVE-DEPT-01 (2026-07-25)

| Field | Value |
|-------|--------|
| **work_item_id** | `QC-HRM-SETTINGS-MD-LEAVE-DEPT-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **execution_date** | `2026-07-25` |
| **variant** | **Re-gate after PACK-01** (prior NO-GO process superseded) |
| **decision** | **GO WITH CONDITIONS** |
| **scope** | Leave + Dept only — `#md-code-*` visible · POST `settings-catalogs/items` **201** → F5 · empty CTA · dept value=code |
| **environment** | Local portal `:5173/hr` · hrm-api `:28001` (`dist-uat-w6`) · xbos `:28002` |
| **persona** | `ceo@xe.vn` · `company_id=main` |
| **HOLD_DEPLOY** | **honored** — **no** `:8088` / Phase1 / PROD claim |
| **U65** | zero-seed — QA reports **none** |
| **Phase1 / PROD** | **NONE** — **NOT** Phase 1 DONE · **NOT** PROD-READY · **NOT** `:8088` |
| **Full Settings MD matrix 🟢** | **NOT** in scope / **NOT** approved |
| **JT/POS** | **out of scope** (separate `QC-HRM-SETTINGS-MD-JT-01`) |
| **ack_status** | **PASS_TO_PM** |

---

## 0. Re-gate summary (PACK-01)

| Check | Result |
|-------|--------|
| Prior decision | **NO-GO (process)** — pack **2/8** (`journey_l25` + `residual_section`) |
| PACK-01 artifact | `docs/qa/evidence/qa-hrm-settings-master-data-03-20260725.md` · `READY_FOR_QC` · product AC claims **unchanged** |
| `verify:qc:evidence-pack` (QC re-run) | **exit 0** — **PASS 8/8** |
| Product Dev wave | **none** — no new FE/BE since prior provisional audit |
| Merge cite | `docs/qa/evidence/qa-hrm-settings-md-fe-live-01-20260725.md` — same leave+dept clicks; **no duplicate false PASS** |
| Expected | **GO WITH CONDITIONS** (bounded leave+dept local) |

**Process condition `C-LEAVE-DEPT-QA-PACK-01` → CLOSED.**

---

## 1. Mission / scope audited

Narrow gate after `QA-HRM-SETTINGS-MASTER-DATA-03` (+ PACK-01 Layer B):

| AC | Required | QC verdict |
|----|----------|------------|
| Form `#md-code-leaveTypes` / `#md-code-departments` visible | yes | **PASS** |
| POST `/settings-catalogs/items` **201** → F5 persist (leave + dept) | yes | **PASS** |
| Empty CTA leave+dept + dept picker value=code | yes | **PASS** |

**Explicitly not approved:** Full Settings MD matrix 🟢 · JT/POS slice · Phase 1 DONE · PROD-READY · `:8088` promote · seed · leave-*request* mutate (FE-LIVE residual 400 — out of Settings catalog SoT).

---

## 2. Evidence consumed

| # | Artifact | Role | Status |
|---|----------|------|--------|
| 1 | `docs/qa/evidence/qa-hrm-settings-master-data-03-20260725.md` | QA | **READY_FOR_QC** — leave/dept UF + PACK-01 Layer B · **pack 8/8** |
| 2 | `docs/qa/evidence/qa-hrm-settings-md-fe-live-01-20260725.md` | QA | Merge — leave+dept create/CTA/picker; **aligned**, no second 🟢 claim |
| 3 | `docs/qa/evidence/dev-fe-hrm-settings-md-form-vis-01-20260725.md` | Dev-FE | `READY_FOR_QA` — form mount; vitest 22/22 |
| 4 | `docs/qa/evidence/devops-hrm-settings-md-l0-stab-01-20260725.md` | DevOps | L0 stab `:28001` `dist-uat-w6` |
| 5 | `docs/qa/evidence/qa-hrm-fe-proxy-28001-smoke-01-20260725.md` | QA smoke | Direct `:8080`→`:28001` catalogs **200** — proxy P2 **CLOSED** |
| 6 | `docs/qa/evidence/_tmp-qa-hrm-settings-master-data-03-runtime.json` | QA runtime | AC1/AC2 POST **201** + F5 codes present |
| 7 | `docs/program/PROGRAM_JOURNEY_MAP.md` | Journey | **J-HRM-MENU-SWEEP** + **UF-HRM-10** create slice |

---

## 3. Evidence pack integrity (Layer B — PASS)

```text
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qa-hrm-settings-master-data-03-20260725.md
→ exit 0 — PASS: QC evidence pack ready (8/8)
```

| Check | Result |
|-------|--------|
| Pack completeness | **8/8 PASS** |
| Layer B process gate | **PASS** |
| **C-LEAVE-DEPT-QA-PACK-01** | **CLOSED** |

PACK-01 fixed: `## L2.5` with **J-HRM-MENU-SWEEP** PASS · `## Residual` (singular) · `## Classification` · `## Command table`.

---

## 4. Product audit (promoted — leave+dept only)

| AC / assert | QA claim | Runtime / FE | QC |
|-------------|----------|--------------|-----|
| `#md-code-leaveTypes` visible | PASS | runtime `ac1-form-visible` + fill `QA_LVT_09VGO4` | **PASS** |
| Leave POST → **201** → F5 | PASS | POST `/api/hrm/settings-catalogs/items` **201**; F5 has code | **PASS** |
| `#md-code-departments` visible | PASS | `ac2-form-visible` | **PASS** |
| Dept POST → **201** → F5 | PASS | code `QA_DEPT_9VQQ5` | **PASS** |
| Empty CTA leave+dept | PASS (intercept) | strip JSON · amber CTA · `fake8=[]` | **PASS** · U65 |
| Dept picker value=code | PASS | `DEPT_*` / `QA_DEPT_*` on trigger | **PASS** |
| Unit form-vis + picker | PASS | vitest **22/22** | **PASS** |
| FE-LIVE-01 merge | PASS leave+dept Settings | separate codes `QA_LVT_09XP3X`; same AC class | **Aligned** — not double-count |
| Seed | none | none | U65 **OK** |
| Full matrix 🟢 | not claimed | — | Discipline **OK** |

### L2.5 journey (U19)

| ID | Map / UF | Verdict |
|----|----------|---------|
| **J-HRM-MENU-SWEEP** (Settings catalogs · leave+dept create→201→F5) + **UF-HRM-10** | portal `:5173/hr/settings` | **PASS** (in pack) |
| JT / POS journeys | separate WI | **out of scope** — not required |

---

## 5. Classification

| Finding | Type | Gate impact |
|---------|------|-------------|
| Leave + dept form vis · POST **201** · F5 · empty CTA · dept value=code (portal `:5173`) | **PRODUCT** | **PASS** — promoted under GWC scope |
| Pack Layer B (after PACK-01) | **Process** | **PASS** — **C-LEAVE-DEPT-QA-PACK-01 CLOSED** |
| Direct HRM FE `:8080` proxy | **ENV** | **CLOSED** via `QA-HRM-FE-PROXY-28001-SMOKE-01` (catalogs **200** via `:8080`) — **C-LEAVE-DEPT-PROXY-8080-01 CLOSED** |
| JT/POS / full matrix open | **Governance / out of scope** | Standing conditions — do not green matrix |
| HOLD_DEPLOY / not `:8088` | Governance | Honored |
| Leave-request POST **400** (FE-LIVE) | Out of scope | **Not** Settings catalog SoT — do not reopen this WI |

---

## 6. Conditions (bounded GWC)

| Condition | Owner | Status |
|-----------|-------|--------|
| **C-LEAVE-DEPT-QA-PACK-01** | qa | **CLOSED** (pack 8/8) |
| **C-LEAVE-DEPT-PROXY-8080-01** (P2 direct `:8080`) | devops → qa smoke | **CLOSED** — cite `qa-hrm-fe-proxy-28001-smoke-01-20260725.md` |
| JT / POS / full Settings MD matrix 🟢 | pm / separate QC | **OPEN deferred** — explicit out of scope; **NOT** greened |
| HOLD_DEPLOY · NOT Phase1/PROD/:8088 | pm | **standing** — GWC bound to local leave+dept only |

**GO WITH CONDITIONS** = product leave+dept local PASS + process pack closed + proxy ENV closed; **NOT** Phase 1 DONE · **NOT** full matrix 🟢 · **NOT** `:8088` / PROD.

---

## 7. Forbidden compliance

| Rule | Status |
|------|--------|
| No seed in evidence | **OK** |
| No Phase1 DONE claim | **OK** |
| No `:8088` promote | **OK** |
| No full matrix 🟢 claim | **OK** |
| Pack verify exit 0 before GO/GWC | **OK** (QC re-ran 8/8) |
| No duplicate false PASS vs FE-LIVE | **OK** (merge cite only) |

---

## 8. Prior NO-GO (process) — superseded

Historical record (first gate same day): pack FAIL 2/8 → **NO-GO (process)** → PACK-01 → this re-gate. Do not treat §0–§8 of the first draft as current decision; this file is the SoT after re-gate.

---

## 9. Handoff

```yaml
work_item_id: QC-HRM-SETTINGS-MD-LEAVE-DEPT-01
from_role: qc
to_role: pm
ack_status: PASS_TO_PM
decision: GO WITH CONDITIONS
evidence_path: docs/qa/evidence/qc-hrm-settings-md-leave-dept-01-20260725.md
next_owner: pm
completion_report: |
  Re-gate after PACK-01: verify:qc:evidence-pack exit 0 (8/8). Product leave+dept
  AC PASS promoted (form #md-code-*, POST 201→F5, empty CTA, dept value=code,
  unit 22/22, J-HRM-MENU-SWEEP + UF-HRM-10). C-LEAVE-DEPT-QA-PACK-01 CLOSED.
  C-LEAVE-DEPT-PROXY-8080-01 CLOSED (QA-HRM-FE-PROXY-28001-SMOKE-01). Merge
  FE-LIVE-01 cited — no duplicate false PASS. HOLD_DEPLOY · NOT Phase1/PROD/:8088
  · NOT full Settings MD matrix 🟢 · JT/POS out of scope.
```

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PM-HRM-SETTINGS-MD-LEAVE-DEPT-GWC-CLOSE-01
from_role: pm
to_role: pm
lane: governance
entry: QC-HRM-SETTINGS-MD-LEAVE-DEPT-01 GO WITH CONDITIONS · docs/qa/evidence/qc-hrm-settings-md-leave-dept-01-20260725.md
action:
  1) Bus INTAKE — mark leave+dept Settings catalog SoT GWC local; close C-LEAVE-DEPT-QA-PACK-01 + C-LEAVE-DEPT-PROXY-8080-01 on residual lists
  2) Do NOT green full Settings MD matrix; do NOT claim Phase1/PROD/:8088
  3) Continue JT slice only via QC-HRM-SETTINGS-MD-JT-01 (or re-gate) — separate WI; POS remains deferred
  4) Optional: fold FE-LIVE-01 leave-request POST 400 residual into attendance UF backlog (not Settings MD)
exit: bus + TEAM_WORKING_NOW / residual lists updated; HOLD_DEPLOY remains; next execution wave only if JT/POS/PM program priority
cấm: seed · invent matrix 🟢 · deploy :8088 · reopen leave+dept product AC without new defect
```

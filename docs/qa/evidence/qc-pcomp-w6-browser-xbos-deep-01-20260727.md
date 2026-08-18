# QC Gate Decision — QC-PCOMP-W6-BROWSER-XBOS-DEEP-01 (2026-07-27)

| Field | Value |
|-------|--------|
| **work_item_id** | `QC-PCOMP-W6-BROWSER-XBOS-DEEP-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **execution_date** | `2026-07-27` |
| **decision** | **GO WITH CONDITIONS** |
| **scope** | PCOMP W6 XBOS deep browser P0 — local `:5173` only · U65 · HOLD_DEPLOY |
| **environment** | Local portal `http://127.0.0.1:5173` · xbos-api `:28002` · hrm-api `:28001` `dist-uat-w6` |
| **persona** | Group CEO `ceo@xe.vn` · Member negative `du-lich.ceo@xe.vn` |
| **HOLD_DEPLOY** | **honored** — **no** `:8088` · **no** deploy · U70 waits sponsor confirm |
| **U65** | zero-seed — QA + QC spot: **no** `pnpm seed:*` / inbox seed |
| **Phase1 / PROD** | **NONE** — **NOT** Phase 1 DONE · **NOT** PROD-READY · **NOT** matrix Dev8088 rewrite |
| **ack_status** | **PASS_TO_PM** |

---

## 1. Mission / scope audited

Independent QC gate of QA pack `QA-PCOMP-W6-BROWSER-XBOS-DEEP-01` after `PASS_WITH_CONDITIONS` / `PASS_TO_PM`.

**In-scope promoted (local HOLD_DEPLOY):**

| UF / J | QC |
|--------|-----|
| UF-XBOS-01 · J-CC-01 | **PASS** 🟢 |
| UF-XBOS-05 · J-CC-02 | **PASS** 🟢 (mutate → 2xx → toast → API F5) |
| UF-XBOS-10 · J-CC-03 | **PASS** 🟢 (KPI rollup 200 · no 409) |
| UF-XBOS-11 | **PASS** 🟢 (member GMU 403 · KPI holding 409) |
| UF-XBOS-08 · J-XBOS-01 | **Condition OK** 🟡 U65 BLOCKED (no seed) |

**Explicitly not approved:** Phase 1 DONE · PROD-READY · `:8088` UF promote · Dev8088 matrix rewrite · seed to green UF-08 · full Wave 1 UF-04/06/09/12–15.

---

## 2. Evidence consumed

| # | Artifact | Status |
|---|----------|--------|
| 1 | `docs/qa/evidence/qa-pcomp-w6-browser-xbos-deep-01-20260727.md` | Primary QA pack · `PASS_WITH_CONDITIONS` |
| 2 | `docs/qa/evidence/_tmp-qa-pcomp-w6-browser-xbos-deep-01-runtime.json` | Runtime · `overall: PASS_WITH_CONDITIONS` · p0Pass=4 · p0Yellow=1 · p0Fail=0 |
| 3 | `docs/qa/evidence/qa-pcomp-w6-browser-xbos-deep-01-screens/` | **16 PNG** (uf01/02/03/05/07/08/10/11 + probe) |
| 4 | `docs/qa/evidence/_tmp-uf05-probe.json` | Cited by QA (POST SHR 201 path) |
| 5 | `docs/program/PROGRAM_JOURNEY_MAP.md` | J-CC-01..03 · J-XBOS-01 |
| 6 | QC L0 spot | `qc:dev-stack` — hrm/xbos/portal **HTTP 200** (Windows UV abort after probes = ENV noise, same as QA) |

---

## 3. Evidence pack integrity (Layer B — PASS)

```text
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qa-pcomp-w6-browser-xbos-deep-01-20260727.md
→ exit 0 — PASS: QC evidence pack ready (8/8)
```

| Check | Result |
|-------|--------|
| Pack completeness | **8/8 PASS** |
| Command table + exit/result | **Present** (qc:dev-stack · fe-be-health · harness exit 0 · screens dir) |
| UF blocks (FE post-2xx · F5) | **Present** for P0 mutate (UF-05) + read paths |
| Screens (INC-QA-EVIDENCE-WITHOUT-RUN) | **Present** — 16 PNG under screens dir |
| Classification ENV vs PRODUCT | **Present** |
| journey_l25 table | **Present** |
| Layer B process gate | **PASS** |

**Rule:** `.cursor/rules/qc-evidence-pack-gate.mdc` — satisfied.

---

## 4. Product audit (bounded local)

| Assert | QA claim | Runtime / screens | QC |
|--------|----------|-------------------|-----|
| UF-01 login → CC | 🟢 | uf01 ok · `uf01-command-center.png` · F5 session | **PASS** |
| UF-05 holding shareholder Lưu | 🟢 POST/PUT 2xx · toast · API F5 `apiHas=true` | uf05 ok · `uf05-after-save.png` · `uf05-after-f5.png` | **PASS** (DOM scroll partial noted; API persist OK) |
| UF-08 WF→inbox→Duyệt | 🟡 U65 BLOCKED · no seed | uf08 note BLOCKED U65 · screens present | **Condition OK** — not fake 🟢 |
| UF-10 KPI rollup | 🟢 GET 200 · no 409 | uf10 browser 200 + apiStatus 200 | **PASS** |
| UF-11 member negative | 🟢 GMU 403 · KPI 409 | uf11 detail codes match | **PASS** |
| Seed / `:8088` / matrix rewrite | none claimed | command table «Did not» | **OK** |
| HRM `dist-uat-w6` freeze | honored | runtime `hrm_freeze_note` | **OK** |

### L2.5 journey (U19)

| J-ID | QA pack | QC |
|------|---------|-----|
| **J-CC-01** | PASS (UF-01) | **PASS** |
| **J-CC-02** | PASS (UF-05) | **PASS** |
| **J-CC-03** | PASS (UF-10) | **PASS** |
| **J-XBOS-01** | BLOCKED U65 (UF-08) | **Deferred / Condition** — acceptable under U65 + PM entry (not product NO-GO) |

**U19:** Mandatory in-scope J-CC-* PASS listed; J-XBOS-01 explicitly deferred with U65 rationale — **GWC OK**, not silent omit.

---

## 5. Classification

| Finding | Type | Gate impact |
|---------|------|-------------|
| P0 UF-01/05/10/11 local browser PASS | **PRODUCT** | **PASS** (local HOLD_DEPLOY) |
| UF-08 U65 no-seed BLOCKED | **PROCESS / U65** | **Condition OK** — not product FAIL |
| UF-03/07 partial (timebox) | **PRODUCT P2 residual** | Not P0 blocker this WI |
| Windows UV abort after `qc:dev-stack` probes | **ENV** | Not product NO-GO (stack 200 confirmed) |
| HOLD_DEPLOY / not `:8088` / not Phase1/PROD | **Governance** | Standing conditions |
| Matrix Dev8088 rewrite | — | **Not done** (lock honored) |

---

## 6. Conditions (GO WITH CONDITIONS)

| ID | Condition | Owner | Status |
|----|-----------|-------|--------|
| **C-W6-XBOS-UF08-U65** | UF-XBOS-08 / J-XBOS-01 full FE create→inbox→Duyệt not closed without seed | pm → fe/qa (FE path) | **OPEN** — Condition OK for this gate |
| **C-W6-HOLD-DEPLOY** | HOLD_DEPLOY · U70 `:8088` only after sponsor confirm | pm | **OPEN** (standing) |
| **C-W6-NOT-PHASE1-PROD** | NOT Phase 1 DONE · NOT PROD-READY · NOT Dev8088 matrix promote | pm | **OPEN** (standing) |
| UF-03 PUT+F5 · UF-07 RACI cell · UF-04/06/09/12–15 | Deep follow-up | qa later | **OPEN P2** — out of P0 timebox |

**J-\* PASS this slice:** J-CC-01 · J-CC-02 · J-CC-03  
**J-\* deferred:** J-XBOS-01 (U65)  
**Residual scope risk:** local `:5173` only; member CEO negative API-asserted; Wave 1 non-P0 UF ⬜

---

## 7. Decision

### **GO WITH CONDITIONS**

Bounded to **PCOMP W6 XBOS deep P0** on local `:5173` under U65 + HOLD_DEPLOY.

- Layer B pack **8/8** PASS  
- P0 product **4/4 green** (01/05/10/11) + UF-08 **U65 condition** (PM-allowed)  
- L2.5 J-CC-01..03 **PASS**; J-XBOS-01 **deferred U65** (listed)  
- **NOT** Phase 1 DONE · **NOT** PROD · **NOT** `:8088` · **no** matrix Dev8088 rewrite · **no** seed  

**NOT** clean GO — conditions above remain open.

---

## 8. Handoff

```yaml
work_item_id: QC-PCOMP-W6-BROWSER-XBOS-DEEP-01
from_role: qc
to_role: pm
ack_status: PASS_TO_PM
decision: GO_WITH_CONDITIONS
evidence_path: docs/qa/evidence/qc-pcomp-w6-browser-xbos-deep-01-20260727.md
qa_evidence_path: docs/qa/evidence/qa-pcomp-w6-browser-xbos-deep-01-20260727.md
next_owner: pm
completion_report: |
  GWC — W6 XBOS deep browser P0 local :5173. Pack 8/8. UF-01/05/10/11 PASS;
  UF-08 U65 BLOCKED = condition OK; J-CC-01..03 PASS; J-XBOS-01 deferred U65.
  HOLD_DEPLOY / NOT Phase1/PROD/:8088 / no matrix rewrite / no seed. HRM dist-uat-w6 freeze kept.
next_dispatch_prompt: |
  work_item_id: QC-PCOMP-W6-BROWSER-HRM-DEEP-01
  from_role: pm
  to_role: qc
  lane: governance
  entry_criteria: QA PASS_TO_PM evidence docs/qa/evidence/qa-pcomp-w6-browser-hrm-deep-01-20260727.md;
    XBOS deep QC GWC closed at docs/qa/evidence/qc-pcomp-w6-browser-xbos-deep-01-20260727.md;
    Local :5173 · U65 · HOLD_DEPLOY · HRM dist-uat-w6 freeze; verify pack 8/8 + UF/J-* + screens
  exit_criteria: GO | GWC | NO-GO; GWC OK with documented Leave create BLOCKED if known BE;
    cấm rewrite Dev8088 matrix 🟢 · Phase1/PROD claim · seed · deploy :8088 (U70 sponsor)
  evidence_path: docs/qa/evidence/qc-pcomp-w6-browser-hrm-deep-01-20260727.md
  locks: HOLD_DEPLOY · U70 :8088 only after sponsor confirm
```

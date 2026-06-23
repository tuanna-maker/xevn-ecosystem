# REPO-HYGIENE-01-W5 — QC gate (repo cleanup program)

**work_item_id:** `REPO-HYGIENE-01-W5`  
**program:** `docs/program/REPO_HYGIENE_CLEANUP_PROGRAM.md` §W5  
**reviewer:** QC  
**executed_at:** 2026-06-20  
**U65:** No seed used in this gate.

---

## Verdict: **GO WITH CONDITIONS**

Repo hygiene waves W1–W4 deliverables meet W5 exit criteria for stack health, active-doc refs, and evidence cardinality. One sprint-governance condition remains outside hygiene scope.

**NOT Phase 1 DONE** — program UAT/QC gates (G4/G5, J-*, UF matrix) unchanged by this hygiene signoff.

---

## Gate commands

| Command | Exit | Result |
|---------|------|--------|
| `pnpm run qc:dev-stack` | **0** | hrm-api :28001 200, xbos-api :28002 200, web-portal :5173 200 |
| `pnpm run verify:sprint:transition` | **1** | FAIL — missing `docs/program/sprints/S4_RETRO.md` (S4 retro ceremony) |

---

## Broken-path grep (scoped)

Per W5: `package.json`, `EVIDENCE_INDEX.md`, `scripts/README.md`.

| Target | `scripts/tmp-*` hits | Assessment |
|--------|---------------------|------------|
| `package.json` | **0** | PASS — no npm script points to deleted tmp probes |
| `docs/program/EVIDENCE_INDEX.md` | **0** | PASS |
| `scripts/README.md` | **4** | PASS — policy/docs only (gitignored local tmp workflow); not executable broken refs |
| `git ls-files scripts/tmp-*` | **0** | PASS — W2 exit retained |

**Out of scope (audit trail OK):** Living evidence `.md` and `.cursor/team/PM_INCIDENT_QUEUE.json` retain historical `node scripts/tmp-*.mjs` command logs from pre-W2 runs. Not active package.json/docs refs; re-run per `scripts/README.md` promote/local tmp policy (`repo-hygiene-cleanup-20260620.md` §W2 residual).

---

## W3 evidence cardinality

```text
git ls-files docs/qa/evidence | wc → 89
```

**PASS** — matches W3 target (753 → 89); breakdown per W3: 76 `.md`, 10 `.json`, 3 `.txt` tracked.

---

## Wave closure summary

| Wave | Status | Evidence |
|------|--------|----------|
| W1 `.gitignore` + safe delete | Done | `repo-hygiene-cleanup-20260620.md` |
| W2 script promote / tmp=0 tracked | Done | same + `scripts/README.md` |
| W3 evidence archive + index | Done | same §W3, `EVIDENCE_INDEX.md` |
| W4 SQL TM review | Done | `repo-hygiene-sql-w4-20260620.md` |
| W5 QC gate | **GWC** | this file |

---

## L2.5 / J-* (program scope)

**N/A — deferred** for `REPO-HYGIENE-01`. This gate audits repo structure only; no cross-nav journey execution. Product J-* retest remains on Phase 1 / UF matrix lanes (`PROGRAM_JOURNEY_MAP.md`).

---

## Residual

| Item | Owner | Priority |
|------|-------|----------|
| Missing `S4_RETRO.md` — `verify:sprint:transition` exit 1 | pm | P1 process |
| Historical `scripts/tmp-*` in archived evidence command logs | pm (optional doc refresh) | P3 info |

No product residual from hygiene W5 scoped grep or stack probe.

---

## Classification

| Item | Class | Notes |
|------|-------|-------|
| Stack health | ENV | PASS |
| Broken active refs | PRODUCT/process | PASS (scoped grep) |
| Missing S4_RETRO | **PROCESS** | Sprint transition gate; PM publish retro |
| Historical tmp in evidence logs | INFO | Audit trail; not blocking hygiene GO |

---

## Conditions (must close for full sprint transition PASS)

1. **PM** — Publish `docs/program/sprints/S4_RETRO.md`; re-run `pnpm run verify:sprint:transition` exit **0** before next `P1-SN-PM-02` / sprint-close claim.
2. **Optional hygiene follow-up** — When re-running archived probe commands, update living evidence command blocks to promoted `scripts/qa/*` paths (low priority; no package.json impact).

---

## Prior wave evidence

- W1–W3: `docs/qa/evidence/repo-hygiene-cleanup-20260620.md`
- W4 TM: `docs/qa/evidence/repo-hygiene-sql-w4-20260620.md`

---

**ack_status:** `PASS_TO_PM`  
**next_owner:** pm  
**evidence_path:** `docs/qa/evidence/repo-hygiene-qc-w5-20260620.md`

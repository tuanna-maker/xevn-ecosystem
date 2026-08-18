# BA-HRM-MENU-UF-MATRIX-01 — UF-HRM-MENU-* matrix delta (2026-07-20)

| Field | Value |
|-------|--------|
| **work_item_id** | `BA-HRM-MENU-UF-MATRIX-01` |
| **from_role** | ba-process |
| **to_role** | pm |
| **lane** | governance |
| **estimated_effort** | 0.5d |
| **ack_status** | **PASS_TO_PM** |
| **sponsor_lock** | Cover every HRM AppSidebar leaf (not only UF-HRM-01..13); U65; no product code; no seed; no Phase1 DONE |
| **date** | 2026-07-20 |

---

## Inputs read

| Artifact | Use |
|----------|-----|
| `docs/qa/evidence/qa-hrm-menu-full-sweep-01-20260720.md` § Proposal | UF-ID catalog + AC draft |
| `docs/qa/evidence/qa-hrm-menu-full-sweep-01-r2-20260720.md` | Local chrome residuals CLOSED |
| `docs/qa/evidence/qc-hrm-menu-full-sweep-01-20260720.md` | Local GWC + P3 condition metadata ids |
| `apps/web/hrm/src/components/layout/AppSidebar.tsx` | Leaf path inventory (17) |
| `docs/qa/USER_FLOW_OPERABILITY_MATRIX.md` §4 | Existing mutate UF-HRM-01..13 (must_keep) |

---

## Delta applied (no full SRS rewrite)

| File | Change |
|------|--------|
| `docs/qa/USER_FLOW_OPERABILITY_MATRIX.md` | **§4b** UF-HRM-MENU-01..17 + **02b**; AC load/chrome/crash; Local from sweep+R2+QC; Dev8088 **⬜**; §8 checklist rows |
| `docs/program/PROGRAM_JOURNEY_MAP.md` | **J-HRM-MENU-SWEEP** row + notes + incident log |
| `docs/qa/PILOT_BUSINESS_FLOW_BA_TRACE.md` | **§17** U19 journey AC trace |

**Out of scope:** product `apps/**` · seed · claim Phase1/PROD · rewrite SRS body.

---

## Business rules (load-sweep gate)

| BR-ID | Condition | Action | Outcome |
|-------|-----------|--------|---------|
| **BR-MENU-LOAD-01** | User opens any AppSidebar leaf in HRM embed | Route renders without white-crash | PASS load |
| **BR-MENU-CHROME-01** | User-facing copy | Must not show `hrm-api`, `Nest API`, `UC-HRM-*`, `GET /…` ops labels, `XBOS-DM-*`, badge literal `API`, raw ISO-Z timestamps | FAIL chrome if present |
| **BR-MENU-EMPTY-01** | API 200 + empty collection | Honest empty / stub copy allowed | PASS alternate |
| **BR-MENU-SCOPE-01** | Group CEO persona | `companyId=main` rollup on embed | Same as J-HRM-* |
| **BR-MENU-FLAG-01** | §4b 🟢 | Means **load AC** only — does **not** replace mutate 🟢 of UF-HRM-01..13 | Traceability |

---

## Acceptance criteria (measurable)

| AC-ID | Pass when | Fail when | Evidence potential |
|-------|-----------|-----------|--------------------|
| **AC-MENU-01** | All 17 leaves load (iframe `innerText` / no blank crash) | Any leaf white-screen / Uncaught | Sweep matrix rows |
| **AC-MENU-02** | Zero tech-chrome substrings (BR-MENU-CHROME-01) on in-scope surfaces | Any listed chrome string visible | Sweep + R2 |
| **AC-MENU-03** | No Sync ERROR / unexpected 409 on load | Banner Sync ERROR or scope 409 on open | Console + UI |
| **AC-MENU-04** | MENU-02b Lương: no Invalid time; no `API` badge | RangeError or badge `API` | Deep row |
| **AC-MENU-05** | Dev8088 column updated only after browser promote on `:8088` | Claiming Dev8088 🟢 from Local-only | Matrix §4b Dev8088 |

**Current flags (2026-07-20):** Local MENU-01..16 🟢 · MENU-17 🟡 (P3 metadata workflow ids) · Dev8088 all ⬜.

---

## completion_report

**Closed:** Governance delta encodes QA proposal into SoT matrix §4b (UF-HRM-MENU-01..17 + 02b), journey **J-HRM-MENU-SWEEP**, and BA_TRACE §17. Local flags aligned to parent sweep + R2 CLOSED chrome + QC GWC. Mutate UF-HRM-01..13 untouched.

**Residual:** Dev8088 column still ⬜ (optional QA promote). MENU-17 P3 metadata workflow ids (QC C-01 / FE lane already noted). No Phase1 DONE claim.

## next_owner

`pm` — optional dispatch `qa` for Dev8088 promote; residual P3 metadata remains FE if not already closed.

## next_dispatch_prompt

```text
work_item_id: QA-HRM-MENU-UF-PROMOTE-8088-01
from_role: pm
to_role: qa
lane: execution
entry_criteria: BA-HRM-MENU-UF-MATRIX-01 PASS_TO_PM; matrix §4b exists; Local GWC documented; U65 zero-seed; stack Dev :8088 reachable
spec_ref: docs/qa/USER_FLOW_OPERABILITY_MATRIX.md §4b · J-HRM-MENU-SWEEP · AC-MENU-01..05
exit_criteria:
  - Browser retest Group CEO on http://14.225.217.232:8088/ (or current Dev8088 URL) for UF-HRM-MENU-01..17 + 02b
  - Update matrix §4b Dev8088 column 🟢/🟡/🔴 with evidence path
  - Do NOT claim Phase1 DONE; do NOT seed
evidence_path: docs/qa/evidence/qa-hrm-menu-uf-promote-8088-01-YYYYMMDD.md
optional_skip: if :8088 down → PASS_TO_PM with BLOCKED-EXTERNAL + leave ⬜
```

## ack_status

**PASS_TO_PM**

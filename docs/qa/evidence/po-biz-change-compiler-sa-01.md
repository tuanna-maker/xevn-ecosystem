# Evidence — PO-BIZ-CHANGE-COMPILER-SA-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-BIZ-CHANGE-COMPILER-SA-01` |
| **from_role** | sa |
| **to_role** | pm |
| **date** | 2026-08-05 |
| **lane** | governance |
| **stall** | **#3 CLOSED** — WRITE completed (ADR + schema + evidence) |
| **ack_status** | **PASS_TO_PM** |

---

## 1. spec_read_ack (governance — architecture)

| Artifact | Status |
|----------|--------|
| U77 `TEAM_USER_REQUIREMENTS.md` §U77 | READ — Excel/docs → Manifest → Spec-first; Phase A xevn then Phase B promote OS |
| `BUSINESS_CHANGE_COMPILER_PROGRAM.md` | **MISSING on disk** at write time (U77 points to it) — residual **R1** PM/BA author |
| OS full path `projects/_vibe-team-os` | READ — `MANIFEST.json` thru chapter **33**; slot **34** reserved for promote |
| Pilot BA feedstock | READ — `CHANGE_MANIFEST_EXCEL_COLUMNS.md` + `change-manifest.example.json` (**P0 batch** `changes[]`) |
| Global `team-spec-before-code-gate.mdc` | Pattern confirmed via OS `02` |

---

## 2. Deliverables landed (STALL #3 WRITE)

| # | Path | Bytes / notes |
|---|------|---------------|
| A | `docs/architecture/ADR-BUSINESS-CHANGE-COMPILER-20260805.md` | Option **C Hybrid** Accepted; **P0 batch vs P1 Wave** planes locked; trade-off matrix; Phase B chapter **34** MUST checklist |
| B | `docs/program/schemas/change-manifest.schema.json` | Draft **v0.1** P1 Wave — required dispatch fields + `ac[]` + `neo_tags` + optional `batch_change_ids` |
| C | `docs/qa/evidence/po-biz-change-compiler-sa-01.md` | This file |

**Touched:** docs only. **Not touched:** `apps/**`, product remaster, Tencent deploy, OS promote (Phase B deferred until A2 sample).

---

## 3. Decision summary

| Item | Result |
|------|--------|
| Recommended option | **C — Hybrid** (Excel human plane + P1 Manifest machine SoT; script Phase A2/A3) |
| Rejected | A alone (tooling-first delay); B alone (no Manifest / fail-closed) |
| P0 vs P1 | P0 batch feedstock ≠ Dev/QA handoff; P1 Wave Manifest = ajv SoT |
| Next OS chapter | **`34-BUSINESS-CHANGE-COMPILER.md`** |
| Spec-first | Unchanged — Manifest feeds pipeline only |
| Memory / Compound / Superpowers | Loadout + post-task compound + optional skills — **not** Spec-first replacement |

---

## 4. MUST promote checklist (pointer)

Full checklist: ADR §10. Minimum:

1. ADD `34-BUSINESS-CHANGE-COMPILER.md` + schema + Excel column template + **P1** example JSON  
2. UPDATE `MANIFEST.json`, `PM-START-HERE.md`, dispatch templates  
3. Gate: Spec-first invariant statement + no Tencent mandatory dep  

---

## 5. Residual

| ID | Item | Owner |
|----|------|-------|
| R1 | Author/refresh `docs/program/BUSINESS_CHANGE_COMPILER_PROGRAM.md` (U77 link 404) | **pm** (+ ba-process content) |
| R2 | Emit 1 **P1 Wave** sample Manifest validating against schema (from real sponsor sheet); label existing `change-manifest.example.json` as P0 feedstock | **ba-process** |
| R3 | Optional compile script Phase A3 | devops / sa (later) |
| R4 | Phase B OS promote (chapter 34) — after A2 sample green | **pm** → sa |

---

## 6. completion_report

**Closed (STALL #3):** A1 architecture — ADR Option C + P0/P1 plane lock + schema v0.1 + evidence; Phase B promote checklist with chapter **34**; integration map Compound/Memory without replacing Spec-first. No `apps/**`.

**Open:** Program markdown missing (R1); BA P1 sample Manifest (R2); OS promote not started (R4 — correct sequencing).

---

## 7. next_owner

`pm` — intake then dispatch **ba-process** (program stub + Excel map align + **P1** sample) and schedule OS promote after sample green.

---

## 8. next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-BIZ-CHANGE-COMPILER-BA-01
from_role: pm
to_role: ba-process
priority: P0
lane: governance

read_first (ordered):
1. docs/architecture/ADR-BUSINESS-CHANGE-COMPILER-20260805.md  (§6 P0/P1 lock)
2. docs/program/schemas/change-manifest.schema.json
3. docs/program/TEAM_USER_REQUIREMENTS.md §U77
4. docs/qa/evidence/po-biz-change-compiler-sa-01.md
5. docs/program/schemas/CHANGE_MANIFEST_EXCEL_COLUMNS.md + change-manifest.example.json (P0 feedstock)
6. One real sponsor sheet under docs/client-delivery/hrm-enterprise-blueprint/ (SPONSOR_CHOT_* or Open Q)

Deliverables (WRITE — no apps/**):
A) docs/program/BUSINESS_CHANGE_COMPILER_PROGRAM.md — Phase A/B roadmap pointing ADR + schema; exit criteria; cấm remaster/Tencent mandatory; P0 vs P1 note
B) Align Excel column map to ADR §6–§7 (sheet → P0 batch and/or P1 wave)
C) docs/program/schemas/change-manifest.wave.sample.json — one valid P1 instance (manifest_version 0.1.0) from real sheet rows; forbidden_paths includes apps/**; optional batch_change_ids linking CM-* rows
D) docs/qa/evidence/po-biz-change-compiler-ba-01.md

exit_criteria:
- Program file exists (fixes U77 link)
- P1 sample validates against change-manifest.schema.json (manual checklist or ajv)
- Existing example.json labeled P0 feedstock (not claimed as Wave SoT)
- ack_status PASS_TO_PM
- next_dispatch_prompt for PO-BIZ-CHANGE-COMPILER-OS-PROMOTE-01 (copy ADR §10 MUST list; target full _vibe-team-os only)

cấm: apps/** · invent UC/BR not on sheet · claim product remaster · deploy Tencent stack · dispatch Dev on P0-only JSON
```

### Follow-on OS promote (after BA-01 PASS)

```text
work_item_id: PO-BIZ-CHANGE-COMPILER-OS-PROMOTE-01
from_role: pm
to_role: sa
priority: P1
lane: governance

Promote ADR §10 MUST checklist into full projects/_vibe-team-os:
- ADD 34-BUSINESS-CHANGE-COMPILER.md + templates + schemas copy (P1 Wave example)
- UPDATE MANIFEST.json + PM-START-HERE situation row
- Evidence docs/qa/evidence/po-biz-change-compiler-os-promote-01.md
cấm: write to NFC stub OS (2-file only); apps/**; replace Spec-first
```

---

## 9. ack_status

**PASS_TO_PM**

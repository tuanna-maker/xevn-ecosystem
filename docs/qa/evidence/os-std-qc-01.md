# OS-STD-QC-01 — QC Go/No-Go · Vibe Team OS standards wave W0

| Field | Value |
|-------|-------|
| **work_item_id** | `OS-STD-QC-01` |
| **from_role** | qc |
| **to_role** | pm |
| **date** | 2026-08-03 |
| **lane** | governance / OS doctrine — **not** product apps |
| **Verdict** | **GO WITH CONDITIONS** |
| **ack_status** | **PASS_TO_PM** |
| **Scope** | W0 OS standards pack (`28` + `29` + TM enrich 25/04/05/MEMORY) |
| **NOT claimed** | Phase 1 product DONE · product coding already open · UAT/PROD GO |

---

## Entry criteria (independent disk verify)

| # | Artifact | Path | Status |
|---|----------|------|--------|
| 1a | Doctrine 29 | `_vibe-team-os/29-TEAM-CLAUDE-EXTERNAL-CODING-LANE.md` | **EXISTS** |
| 1b | Evidence Team Claude | `docs/qa/evidence/os-std-team-claude-01.md` | **EXISTS** · PASS_TO_PM |
| 2a | Doctrine 28 | `_vibe-team-os/28-FE-BE-SEPARATION-DISPLAY-READY.md` | **EXISTS** |
| 2b | Evidence FE/BE SoC | `docs/qa/evidence/os-std-febe-soc-01.md` | **EXISTS** · PASS_TO_PM |
| 3a | TM enrich evidence | `docs/qa/evidence/os-std-audit-enrich-01.md` | **EXISTS** · PASS_TO_PM |
| 3b | 25 / 04 / 05 / MEMORY changes | claimed paths under `_vibe-team-os/` | **VERIFIED on disk** (spot § below) |
| 4 | README / PM-START-HERE / MEMORY pointers | `2z`/`2aa` · tình huống **M** + **A1c** · locks | **VERIFIED** |

OS root verified NFD sibling: `projects\_vibe-team-os\` (no `apps/**` touch in this gate).

---

## Gate checklist

| # | Criterion | Result | Evidence spot |
|---|-----------|--------|---------------|
| G-A | **28** encodes FE = UI + input validate only; BE display-ready; forbid FE join/deep transform **with examples** | **PASS** | `28` §0–§2 matrix; §2.1 CẤM; §3.2–3.3 JSON anti/ready; §5 AP-01..06 |
| G-B | **29** encodes Team Claude draft + Cursor Lead absolute review; no silent merge; G1–G9; NFD; vs **27** | **PASS** | `29` §0–§1 authority; §4 G1–G9; §5 NFD; §8 vs `27`; §9 anti-patterns |
| G-C | **25/04** enriched: SOLID reject FE BR + inline comment I/O; **05** memory after-task lock | **PASS** | `25` §3.1 R-FE-01..04 + §4 FE–BE ack; `04` § Comment tại chỗ; `05` Lock `POST-TASK-MEMORY-UPDATE` |
| G-D | Cross-links **25↔26↔28↔29** consistent | **PASS WITH CONDITION** | All primary pointers use `28-…DISPLAY-READY.md` except **one** stale bullet in `29` §3.1 (see C-OS-29-NAME-01) |
| G-E | No claim Phase 1 product DONE / coding already open | **PASS** | `OS_STD_AND_CODING_ACTION_PLAN.md` Gate = hold until W0 PASS; PM-START-HERE **M**: “Không mở coding product chỉ vì land standards”; this QC does **not** open apps |

**L2.5 J-***: **N/A** — governance OS standards gate (no HRM/CC product journey in scope).

---

## Classification

| Class | Items |
|-------|-------|
| **PRODUCT** | none in this wave |
| **PROCESS / HYGIENE** | C-OS-29-NAME-01 (stale filename in `29` read_first); C-OS-INDEX-01 (SUBAGENT_READ_MAP / MANIFEST thiếu 28/29) |
| **ENV** | none |

ENV residuals do **not** drive this verdict.

---

## Spot-check depth (QC independent)

### 28 — FE/BE SoC + display-ready
- FE allowed: layout, Zod input, bind, presentation formatters, optimistic+rollback.
- FE forbidden: BR engines, multi-list merge, payroll/insurance formulas, invent aggregate DTO, scope filter “vá”.
- BE: view model labels/`can*`/scope parity; API_DESIGN **View model UI** row.
- Examples: HRM list row + leave approve (anti vs ready); AP-01..06 code-shaped.

### 29 — Team Claude lane
- Cursor Lead = ACCEPT/REWORK/REJECT + merge ownership; Claude = draft in `allowed_paths` only.
- `DRAFT_READY_FOR_REVIEW` ≠ `READY_FOR_QA`; silent merge `main` forbidden.
- Gates G1–G9 before ACCEPT; NFD `CANON_OK`; `27` = init ≠ lane (`§0`/`§8`).

### TM enrich
- `25` §3.1 R-FE-01..04 + `soc_ref` → live `28` filename.
- `04` § Comment tại chỗ — when required / not / I/O FE+BE + samples.
- `05` + `MEMORY.md` lock `POST-TASK-MEMORY-UPDATE`; `TEAM-CLAUDE-REVIEW-REQUIRED`; FE-BE-SOC pointer → `28`/`29` LANDED.
- Rule `rules/fe-be-display-ready-soc.mdc` SoT → `28-FE-BE-SEPARATION-DISPLAY-READY.md` (**correct**).
- `26` §7 + header pointer → `28` LANDED.

### Index pointers
| Location | 28 | 29 |
|----------|----|----|
| README `2z` / `2aa` | ✅ DISPLAY-READY | ✅ EXTERNAL-CODING-LANE |
| PM-START-HERE **M** + **A1c** | ✅ LANDED | ✅ LANDED |
| MEMORY locks | ✅ | ✅ |
| `29` §3.1 `read_first` item 4 | ❌ still `28-FE-BE-SEPARATION-OF-CONCERNS.md` + “nếu 28 chưa land” | — |

---

## Conditions (bounded GWC)

| ID | Sev | Owner | Exit | Blocks W1? |
|----|-----|-------|------|------------|
| **C-OS-29-NAME-01** | P3 → treat as **P1 process before Team Claude draft** | **sa** (or tm soft-edit) | In `29` §3.1 item 4: rename to `28-FE-BE-SEPARATION-DISPLAY-READY.md`; remove “nếu 28 chưa land” stub | **W1-A (slice)** may open; **W1-B Team Claude** must wait until fixed or packet `read_first` overrides with correct filename |
| **C-OS-INDEX-01** | P3 | **pm** / sa | Add `28`/`29` to `docs/program/SUBAGENT_READ_MAP.md` (+ optional MANIFEST OS docs list) | No — non-blocking for first W1-A |

**Coding product:** remains **HOLD** until PM opens W1 per action plan **after** this GWC intake — W0 standards approved **bounded**; not a blanket “code anything”.

---

## Residual risk statement

- Agent reading only `29` §3.1 may seek a **non-existent** `28-…OF-CONCERNS.md` → wrong `read_first` / STOP false-negative. Mitigate: C-OS-29-NAME-01 same session or hardcode correct path in first Claude packet.
- Index lag (SUBAGENT_READ_MAP) may delay new PM/onboarding discovery — P3.
- No product regression risk from this wave (docs/OS only).

---

## Verdict rationale

All **substantive** sponsor locks for W0 are on disk with examples, reject criteria, review gates, and cross-links from 25/26/README/PM-START/MEMORY/rule. Single stale filename in `29` is hygiene, not missing doctrine — therefore **not NO-GO**, but **not clean GO** while Team Claude lane is about to consume `read_first`.

**GO WITH CONDITIONS** — W0 OS standards pack **approved bounded**; PM may open **W1-A** (slice map from SRS_NEW P0); **W1-B Team Claude** only after C-OS-29-NAME-01 closed or packet override; **NOT** Phase 1 DONE; **NOT** product UAT/PROD GO.

---

## completion_report

- **Closed:** Independent QC audit of entry artifacts + gate checklist G-A..G-E; evidence this file; verdict **GO WITH CONDITIONS**.
- **Open / residual:** C-OS-29-NAME-01 (sa); C-OS-INDEX-01 (pm); product coding still gated to W1 PM dispatch.

## next_owner

pm

## next_dispatch_prompt

```text
work_item_id: OS-STD-W1-OPEN + C-OS-29-NAME-01
role: pm (same session)

1) INTAKE OS-STD-QC-01 GWC — evidence docs/qa/evidence/os-std-qc-01.md
2) Task sa (narrow, ≤1 file) OR soft-edit:
   - work_item_id: C-OS-29-NAME-01
   - Fix _vibe-team-os/29-TEAM-CLAUDE-EXTERNAL-CODING-LANE.md §3.1 item 4:
     use 28-FE-BE-SEPARATION-DISPLAY-READY.md; delete “nếu 28 chưa land” stub
   - evidence: append to os-std-team-claude-01 or short docs/qa/evidence/os-std-29-hygiene-01.md
3) THEN open W1-A (action plan):
   - work_item_id: OS-STD-W1-A-SLICE-01
   - role: sa
   - Scope: slice map từ SRS_NEW P0 FR + API_CONTRACT_NEW → docs/program/slices/
   - read: 25 · 26 · 28 · 29 · PATH_CANONICAL
   - cấm: apps/** code; claim Phase 1 DONE
   - exit: ≥1 P0 slice file + allowed_paths; PASS_TO_PM
4) W1-B Team Claude ONLY after C-OS-29-NAME-01 CLOSED (or packet read_first overrides filename)
5) Optional P3: SUBAGENT_READ_MAP + MANIFEST pointer 28/29 (C-OS-INDEX-01)

cấm: open full product coding before W1-A slice; seed; Phase 1 DONE claim
```

## ack_status

**PASS_TO_PM**

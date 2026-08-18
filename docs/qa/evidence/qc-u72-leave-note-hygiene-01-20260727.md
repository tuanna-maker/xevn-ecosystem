# QC Gate Decision — QC-U72-LEAVE-NOTE-HYGIENE-01 (2026-07-27)

| Field | Value |
|-------|--------|
| **work_item_id** | `QC-U72-LEAVE-NOTE-HYGIENE-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **execution_date** | `2026-07-27` |
| **decision** | **GO WITH CONDITIONS** |
| **slice** | Close **C-U72-LEAVE-NOTE-HYGIENE** (leave note `seed:…` display hygiene) · local `:5173` only |
| **qa_evidence** | `docs/qa/evidence/qa-u72-leave-note-hygiene-01-20260727.md` (**READY_FOR_QC**) |
| **fe_entry** | `docs/qa/evidence/d-fe-u72-leave-note-hygiene-01-20260727.md` (**READY_FOR_QA**) |
| **prior_soft_r2** | `docs/qa/evidence/qc-u72-soft-p2-01-r2-20260727.md` · condition **C-U72-LEAVE-NOTE-HYGIENE** (ENV) |
| **runtime** | `docs/qa/evidence/_tmp-qa-u72-leave-note-hygiene-01-runtime.json` · `overall: PASS` · `seed: false` |
| **harness** | `node scripts/qa/qa-u72-leave-note-hygiene-01.mjs` · exit **0** (QA-reported) |
| **persona** | `ceo@xe.vn` |
| **portal** | `http://127.0.0.1:5173` · local only |
| **ack_status** | **PASS_TO_PM** |
| **U65** | zero-seed · runtime `seed: false` · **no seed** in QC |
| **HOLD_DEPLOY** | **YES — stands** |
| **Phase1 / PROD / :8088** | **NONE** — **NOT Phase 1 DONE** · **NOT PROD-READY** · **NOT :8088 promote** |
| **Dev reopen** | **No** — soft CLOSED + F-09/F-10/U02 **not reopened** |

---

## 1. Scope audited

**In scope:**
- Evidence pack integrity on QA MD (`verify:qc:evidence-pack` **8/8**)
- Close **C-U72-LEAVE-NOTE-HYGIENE** (display hygiene only — mask API `seed:…` reasons to `—` / omit)
- Corroborate AC calendar/list/pending/detail + leave-type keep (**C-U72-LEAVE-P3**)
- L2.5 **J-HRM-06**
- Locks: U65 · HOLD_DEPLOY · NOT Phase1/PROD/:8088 · no wipe soft CLOSED

**Explicitly not approved:** Phase 1 DONE · PROD-READY · `:8088` · Dev reopen of **C-U72-LEAVE-P3** / **C-XBOS-U72-P2** / F-09 / F-10 / U02 · DB wipe of seed residue

---

## 2. Evidence pack gate (mandatory)

```text
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qa-u72-leave-note-hygiene-01-20260727.md
→ PASS: QC evidence pack ready (8/8)
→ EXIT=0
```

| Check | Result |
|-------|--------|
| Pack integrity (QA source MD) | **PASS 8/8** |
| QA MD readable · ack **READY_FOR_QC** | Yes |
| Command table (`vitest` + `node scripts/…`) | Present · exits **0** |
| Runtime JSON | `overall: PASS` · `seed: false` · `hold_deploy: true` |
| Screenshots on disk | **4** PNGs under `docs/qa/evidence/screenshots/qa-u72-leave-note-hygiene-01/` |

### QC verify commands (this gate)

| Command | Exit | Verdict |
|---------|------|---------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qa-u72-leave-note-hygiene-01-20260727.md` | **0** | **PASS 8/8** |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qc-u72-leave-note-hygiene-01-20260727.md` | **0** | **PASS 8/8** (this QC MD) |

**Rule:** `.cursor/rules/qc-evidence-pack-gate.mdc` — verify PASS ⇒ hygiene close eligible.

---

## 3. Product AC audit (promoted local)

| AC / Check | QA claim | QC corroboration | Status |
|------------|----------|------------------|--------|
| **AC-LEAVE-NOTE-CALENDAR** | No visible `seed:` · seed→`—` | Runtime `seedVisible=[]` · PNG `01` **Vũ Văn An** · **Ốm** · **—** | **PASS · CLOSED** |
| **AC-LEAVE-NOTE-LIST** | Lý do no raw `seed:` | Runtime reasonSample QA-DIAG* · PNG `02` Lý do empty/omit · type **Phép năm** | **PASS · CLOSED** |
| **AC-LEAVE-NOTE-PENDING** | No visible `seed:` | Runtime PASS · PNG `04` | **PASS · CLOSED** |
| **AC-LEAVE-NOTE-DETAIL** | No visible `seed:` | Runtime PASS · PNG `03` | **PASS · CLOSED** |
| **AC-LEAVE-NOTE-SEED-MASKED** | API may retain seed; UI masks | Runtime OBS-API-SEED-RESIDUE PASS · UI masked | **PASS · CLOSED** |
| **AC-LEAVE-P3-KEPT** | VI / unknown→`—` | Runtime PASS · PNG types **Ốm** / **Phép năm** · no `LVT_*`/`annual` | **PASS kept** |
| Unit | vitest 21/21 | FE + QA cite EXIT=0 | **PASS** |
| Harness | exit 0 · overall PASS | Runtime JSON corroborates | **PASS** |

### must_keep — not reopened

| ID | Status |
|----|--------|
| **C-U72-LEAVE-P3** | **PASS kept** — leave type VI / unknown→`—` |
| **C-XBOS-U72-P2** | **not touched** — out of scope |
| **F-09 / F-10 / U02** | **not touched** — **no reopen** |

### Classification

| Signal | Class | Action |
|--------|-------|--------|
| UI no visible `seed:` after sanitizer | **PRODUCT** | **C-U72-LEAVE-NOTE-HYGIENE CLOSED** |
| API still stores `seed:p1-hrm-h16-leave-density` (75 rows) | **ENV** | Display hygiene only — **no** DB wipe / seed (U65) |
| Soft CLOSED maps | LOCK | **Do not reopen** |
| HOLD_DEPLOY / NOT Phase1/PROD/:8088 | LOCK | Stands |

---

## 4. L2.5 journey coverage (U19)

| J-* | In-scope | QA claim | QC |
|-----|----------|----------|----|
| **J-HRM-06** | Yes (attendance leave) | **PASS** · calendar/list/pending/detail no `seed:` · type VI | **PASS** promoted local |
| Soft keep J-* (XBOS/HRM from prior R2/R3) | Out of this WI | Prior GWC | **Deferred** — not re-audited; **not reopened** |

**Deferred / out of slice:** `:8088` / PROD matrix · Phase 1 program gate · Dev reopen soft CLOSED.

**Read-only module matrix (spot):** HRM leave (calendar / list / pending / detail) — U65 zero-seed.

---

## 5. Conditions table

| ID | Status | Statement | Owner |
|----|--------|-----------|-------|
| **C-U72-LEAVE-NOTE-HYGIENE** | **CLOSED** | Leave note/reason surfaces no raw `seed:`; residue masked to `—` or omitted — local browser + unit PASS | — |
| **C-U72-LEAVE-P3** | **CLOSED kept** | Leave type VI / unknown→`—` — **no reopen** | — |
| **C-XBOS-U72-P2** | **CLOSED kept** | Soft XBOS P2 — **no reopen** | — |
| **C-U72-HOLD-01** | Stands | **HOLD_DEPLOY** · **NOT** Phase1 / PROD / `:8088` | **pm** |
| **C-U72-NO-DEV** | Stands | **No** Dev reopen soft CLOSED / F-09/F-10/U02 without product FAIL | **pm** |
| **C-U72-LOCAL-ONLY** | Stands | Local `:5173` / HRM leave only | **pm** |

---

## 6. Verdict

### **GO WITH CONDITIONS**

**GO for:** Local display-hygiene close of **C-U72-LEAVE-NOTE-HYGIENE** on `:5173` — pack **8/8** · runtime **PASS** · vitest **21** · harness exit **0** · J-HRM-06 **PASS** · soft CLOSED maps **kept**.

**Conditions (non-blocking product):**
1. **HOLD_DEPLOY** — no `:8088` / PROD promote from this gate.
2. **NOT Phase 1 DONE** · **NOT PROD-READY**.
3. **No Dev reopen** for soft CLOSED (**C-U72-LEAVE-P3** · **C-XBOS-U72-P2** · F-09/F-10/U02).
4. API/DB may still store legacy `seed:…` reasons (**ENV**) — hygiene is UI-only under U65.

Prior soft R2 GWC (`qc-u72-soft-p2-01-r2-20260727.md`) **unchanged** except **C-U72-LEAVE-NOTE-HYGIENE** now **CLOSED**.

---

## Residual

| Item | Owner | Note |
|------|-------|------|
| HOLD_DEPLOY / NOT Phase1/PROD/:8088 | pm | Honored |
| API seed residue in DB | — | ENV OK — no wipe |
| Soft CLOSED / F-09/F-10/U02 | pm | **No Dev reopen** |
| Phase1 / PROD / `:8088` | — | **NONE** |

---

## completion_report

**Closed:** Re-gate after QA PASS; `verify:qc:evidence-pack` on QA MD **8/8**; product AC calendar/list/pending/detail + seed-mask **PASS**; **C-U72-LEAVE-NOTE-HYGIENE CLOSED**; **C-U72-LEAVE-P3** / **C-XBOS-U72-P2** / F-09/F-10/U02 **kept**; J-HRM-06 PASS local; U65 zero-seed; screenshots/runtime spot-checked (Vũ Văn An · Ốm · `—`); **GO WITH CONDITIONS** (**HOLD_DEPLOY**).

**Residual:** HOLD_DEPLOY · NOT Phase1/PROD/:8088 · ENV API seed residue OK · **no Dev reopen**.

### next_owner

`pm`

### next_dispatch_prompt

```text
work_item_id: PM-U72-LEAVE-NOTE-HYGIENE-INTAKE-01
from_role: qc
to_role: pm
lane: governance · intake GWC · continue program backlog
entry_criteria:
  - QC GO WITH CONDITIONS: docs/qa/evidence/qc-u72-leave-note-hygiene-01-20260727.md
  - C-U72-LEAVE-NOTE-HYGIENE CLOSED
  - must_keep: C-U72-LEAVE-P3 · C-XBOS-U72-P2 · F-09/F-10/U02 — no reopen
  - HOLD_DEPLOY · NOT Phase1/PROD/:8088 · U65
exit_criteria:
  1) Bus INTAKE GWC · update TEAM_WORKING_NOW / open backlog
  2) Do NOT dispatch Dev for soft CLOSED maps or F-09/F-10/U02
  3) Keep HOLD_DEPLOY · no Phase1/PROD/:8088 claim from this slice
  4) Next wave = program backlog (next P0) — not leave-note reopen
cấm: seed · wipe soft CLOSED · Phase1/PROD/:8088 · reopen F-09/F-10/U02
```

### evidence_path

`docs/qa/evidence/qc-u72-leave-note-hygiene-01-20260727.md`

### ack_status

**PASS_TO_PM**

### pm_dispatch_hint

Intake **GWC** — **C-U72-LEAVE-NOTE-HYGIENE CLOSED** · **HOLD_DEPLOY** · **no Dev reopen** soft CLOSED

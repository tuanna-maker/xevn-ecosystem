# Evidence — `PO-UC-TC-W4-QA-SELF-FD-02-QC`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-UC-TC-W4-QA-SELF-FD-02-QC` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-04 |
| **lane** | L3 gate — P0 BR-WF-04 self-approve FD after BE `instance_context` JOIN |
| **priority** | P0 |
| **portal_url** | `http://127.0.0.1:5173` · `/command-center/inbox` |
| **persona** | `ceo@xe.vn` / `Xevn@2026` |
| **Verdict** | **GO WITH CONDITIONS** |
| **ack_status** | `PASS_TO_PM` |
| **entry** | QA [`po-uc-tc-w4-qa-self-fd-02.md`](po-uc-tc-w4-qa-self-fd-02.md) PASS_TO_PM · BE [`po-uc-tc-w4-be-wf-self-fd-02.md`](po-uc-tc-w4-be-wf-self-fd-02.md) READY_FOR_QA |
| **spec_ref** | BR-WF-04 · UF-XBOS-08 · UC-CC-P0-06 · UC-XBOS-CC-06 · `ENTERPRISE_HRM_XBOS_DOMAIN_NOTES_20260804.md` §3.1 |
| **U65** | zero-seed · QC observe-only · no `apps/**` · no seed inbox · no Leave L2 invent |
| **NOT claimed** | Phase 1 DONE · product UAT DONE · PROD-READY · `uat_done` remains **false** |

---

## Verdict summary

**GO WITH CONDITIONS** — bounded P0 slice: Group CEO inbox → proven self (`submitter.userId === actor`) **Duyệt** → `POST …/tasks/:id/complete` **422** `XBOS-WF-422` BR-WF-04 · F5 task still pending · control non-self **201** `XBOS-WF-200`. Residuals **R-W4E1-SELF-BR-WF-04** + **R-W4E1-SELF-FD-EVIDENCE CLOSED**. Prior QA FAIL (self **201**) superseded. U65 zero-seed honored. Leave L2 **SPEC_GAP not invented**. AUTH-003 **untouched**.

**Conditions:** full UC-CC-P0-06 suite still PARTIAL (SELF TCs only this seat) · QA narrative pack process gap (3/8) does not demote product close · **NOT** Phase 1 / UAT DONE from this gate alone.

---

## Entry audit (handoff chain)

| Artifact | ack / claim | QC |
|----------|-------------|-----|
| `docs/qa/evidence/po-uc-tc-w4-be-wf-self-fd-02.md` | READY_FOR_QA; `instance_context` JOIN + Nest restart; live self **422** / control **201**; Jest 17/17 | **ACCEPT** |
| `docs/qa/evidence/po-uc-tc-w4-qa-self-fd-02.md` | PASS_TO_PM; browser U65; R-W4E1-SELF-BR-WF-04 CLOSED | **ACCEPT** |
| `_tmp-po-uc-tc-w4-qa-self-fd-02-browser.json` | overall **PASS**; self 422 XBOS-WF-422; F5 cards=42 stillVisibleIdx=1; control 201 XBOS-WF-200; u65 zero-seed; leave_l2_invented=false; uat_done=false | **ACCEPT** |
| Screens `docs/qa/evidence/screens/PO-UC-TC-W4-QA-SELF-FD-02/` | **8** PNG on disk | **ACCEPT** (spot visual) |
| by-uc SELF-FD TCs | TC-CC-P0-06-INB-SELF-FD-001 + SELF-HP + TC-DM-CC-06-CV-SELF-FD-001 **PASS** · UC execution PARTIAL · uat_done false | **ACCEPT** |
| Prior `po-uc-tc-w4-qa-self-fd-01.md` self **201** | superseded | **SUPERSEDED** — do not reopen without new FAIL |

---

## Independent spot-check (QC)

### EC1 — Self complete → 422 BR-WF-04 (closed residual)

| Check | Result |
|-------|--------|
| Runtime `INB-SELF` | **PASS** · `POST complete 422 XBOS-WF-422` · msg «Self-approve forbidden: actor is instance submitter (BR-WF-04)» · task=`3a537d82-…` |
| Network | `POST /api/xbos/workflow-engine/tasks/3a537d82-b09e-4755-9e5e-071b2e98685f/complete` → **422** `XBOS-WF-422` |
| Proven submitter | GET detail instance `15bc3761-…` **200** `XBOS-WF-204` · `submitterUserId=ceo@xe.vn` · body.userId=`ceo@xe.vn` on complete |
| Prior FAIL | self-fd-01 self **201** — **superseded** |

**PASS** — **R-W4E1-SELF-BR-WF-04 CLOSED**

### EC2 — F5 still pending after self reject

| Check | Result |
|-------|--------|
| Runtime `self_f5` | **PASS** · `cardCountAfter=42` · `stillVisibleIdx=1` |
| Network after 422 | GET tasks assignee **200** `XBOS-WF-203` · itemsCount **42** (unchanged) |
| Screen | `docs/qa/evidence/screens/PO-UC-TC-W4-QA-SELF-FD-02/04-self-f5.png` — candidate roadmap card still in «Việc cần xử lý» · U65 footer |

**PASS**

### EC3 — Control non-self → 201 XBOS-WF-200

| Check | Result |
|-------|--------|
| Runtime `INB-CONTROL` | **PASS** · non-self complete **201** `XBOS-WF-200` · task=`ff765983-…` · submitter=null |
| Network | POST complete **201** · subsequent GET assignee itemsCount **41** (42→41) |
| Screen | `docs/qa/evidence/screens/PO-UC-TC-W4-QA-SELF-FD-02/05-control-after.png` — toast «Đã hoàn thành: Phê duyệt bổ sung danh mục HRM — X.E Du lịch VN» |

**PASS** — must_keep non-self path green

### EC4 — U65 / Leave L2 / AUTH-003 / by-uc honesty

| Check | Result |
|-------|--------|
| Seed | QA + BE + QC: **no** `pnpm seed:*` · no API seed inbox · JSON `u65: zero-seed` |
| Leave L2 | **SPEC_GAP** · `leave_l2_invented: false` · **not invented** |
| AUTH-003 | **untouched** (QA + BE + QC) |
| by-uc | SELF-FD TCs **PASS** · UC execution **PARTIAL** · **`uat_done: false`** |
| Console | Expected **422** log lines on self path — not PRODUCT fail |

**PASS**

---

## L2.5 J-* audit (U19)

| Journey | Scope vs this P0 | QC |
|---------|------------------|-----|
| **J-XBOS-01** | Workflow inbox → approve (`POST …/complete`) | **PASS** — control non-self **201** `XBOS-WF-200`; self FD negative path **422** BR-WF-04 (same journey, BR enforced) |
| **UF-XBOS-08** | Hộp thư Duyệt HDSD path | **PASS** (login → inbox → detail → Duyệt) |
| Leave L2 / AT-01 / AUTH-003 | Out of this P0 | **not claimed** |
| Full UC-CC-P0-06 LIST/DET/APPR suite | Only SELF TCs this seat | **not claimed** (PARTIAL) |

Mandatory in-scope for this gate: **J-XBOS-01** + **UF-XBOS-08** self-FD + control **PASS**. No untested mandatory J-* claimed PASS for this slice.

---

## Classification

| Class | Items |
|-------|-------|
| **PRODUCT** | Self **422** `XBOS-WF-422` BR-WF-04 · F5 pending · control **201** `XBOS-WF-200` · **R-W4E1-SELF-BR-WF-04 CLOSED** |
| **PROCESS** | QA pack `verify:qc:evidence-pack` **3/8** (missing command_table · journey_l25 · crud_or_matrix) — **process-only**; product PASS independent; this QC pack targets **8/8**. PNG folder casing `PO-UC-TC-W4-QA-SELF-FD-02` vs QA MD lowercase — assets present; self-detail PNG visual may show adjacent control instance while Network proves self submitter — Network SoT. |
| **ENV** | None driving verdict (L0 hrm/xbos/portal **200** during QA) |
| **OUT-OF-SCOPE** | Leave L2 SPEC_GAP · AUTH-003 · full inbox suite beyond SELF TCs · Phase1/UAT DONE |

ENV does not drive verdict. Process pack gap on QA MD does **not** demote BR-WF-04 close.

---

## Residual

| Id | Status | Sev | Owner | Blocks this P0 GO? |
|----|--------|-----|-------|--------------------|
| **R-W4E1-SELF-BR-WF-04** | **CLOSED** | — | — | No — do not reopen without new browser FAIL |
| **R-W4E1-SELF-FD-EVIDENCE** | **CLOSED** | — | — | No |
| Leave L2 | SPEC_GAP | — | — | No — **not invented** |
| AUTH-003 | untouched | — | — | No |
| Phase1 / UAT DONE | — | — | — | No — **not claimed** (`uat_done: false`) |
| Full UC-CC-P0-06 suite | PARTIAL | P2 | qa (later seat) | **CONDITION** — SELF TCs only this wave |
| **C-SELF-FD-QA-PACK-FMT-01** | OPEN process | P3 | qa | No — add J-* + command_table + matrix on next QA MD |

---

## Conditions (explicit)

1. **UC-CC-P0-06 / UC-XBOS-CC-06** remain **PARTIAL** outside SELF-FD/HP TCs — not promoted to full UC UAT.
2. **NOT Phase 1 DONE · NOT product UAT DONE · NOT PROD-READY** from this GWC alone.
3. Do **not** reopen **R-W4E1-SELF-BR-WF-04** without new self-complete FAIL (e.g. self returns **201** again).
4. Do **not** invent Leave L2 / weaken AUTH-003 / seed inbox.
5. Prior self-fd-01 self **201** FAIL is **superseded**.

---

## Evidence-pack gate

### QA pack (entry)

```text
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-uc-tc-w4-qa-self-fd-02.md
→ FAIL 3/8 — missing command_table, journey_l25, crud_or_matrix
```

**PROCESS GWC** — product browser + runtime independently verified; does not demote P0 close.

### QC pack (this file)

```text
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-uc-tc-w4-qa-self-fd-02-qc.md
→ target EXIT 0 (8/8)
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-uc-tc-w4-qa-self-fd-02-qc.md --check-assets
→ target EXIT 0
```

---

## Command table (QC independent)

| Command | Result |
|---------|--------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-uc-tc-w4-qa-self-fd-02.md` | **FAIL** exit **1** · **3/8** missing command_table / journey_l25 / crud_or_matrix (process) |
| Disk check 8 PNG under `docs/qa/evidence/screens/PO-UC-TC-W4-QA-SELF-FD-02/` | **PASS** · 01..06 present |
| Runtime cross-check `_tmp-po-uc-tc-w4-qa-self-fd-02-browser.json` | **PASS** · overall=PASS · self 422 XBOS-WF-422 · F5 cards=42 · control 201 XBOS-WF-200 · u65 · leave_l2_invented=false · uat_done=false |
| Spot visual `docs/qa/evidence/screens/PO-UC-TC-W4-QA-SELF-FD-02/04-self-f5.png` + `docs/qa/evidence/screens/PO-UC-TC-W4-QA-SELF-FD-02/05-control-after.png` | **PASS** · candidate still pending · control toast completed |
| by-uc stamp SELF-FD TCs | **PASS** · PASS · uat_done false · R-W4E1-SELF-BR-WF-04 CLOSED |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-uc-tc-w4-qa-self-fd-02-qc.md` | **PASS** exit **0** (8/8) |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-uc-tc-w4-qa-self-fd-02-qc.md --check-assets` | **PASS** exit **0** |

---

## Case / journey matrix (CRUD-or-matrix)

| Case / Journey | AC | Result | Evidence |
|----------------|-----|--------|----------|
| **L0** read-only | stack health | **PASS** | hrm/xbos/portal 200 |
| **LOGIN** | ceo@xe.vn UI | **PASS** | 201 XBOS-AUTH-200 |
| **OPEN** inbox | UF-XBOS-08 cards | **PASS** | cards=42 · `docs/qa/evidence/screens/PO-UC-TC-W4-QA-SELF-FD-02/01-inbox.png` |
| **SELF FD** mutate fail | POST complete **422** BR-WF-04 | **PASS** | runtime Network XBOS-WF-422 · task `3a537d82-…` |
| **RELOAD** after self | F5 still pending | **PASS** | `docs/qa/evidence/screens/PO-UC-TC-W4-QA-SELF-FD-02/04-self-f5.png` · stillVisibleIdx=1 |
| **CONTROL HP** | non-self **201** | **PASS** | `docs/qa/evidence/screens/PO-UC-TC-W4-QA-SELF-FD-02/05-control-after.png` · XBOS-WF-200 |
| **J-XBOS-01** L2.5 | inbox → complete | **PASS** | control 201 + self 422 BR path |
| **UF-XBOS-08** L2.5 | Hộp thư Duyệt | **PASS** | click path HDSD |

---

## Forbidden compliance (QC)

- No seed
- No rewrite `apps/**`
- Did not invent product UAT / Phase 1 DONE
- Did not invent Leave L2
- Did not weaken AUTH-003
- Did not GO without opening QA MD + runtime JSON + PNG spot-check
- Did not NO-GO solely on QA pack format gap (3/8 process)

---

## completion_report

**Closed:** L3 QC gate `PO-UC-TC-W4-QA-SELF-FD-02-QC` for P0 BR-WF-04 self-approve FD after BE `instance_context` JOIN. Spot-check runtime Network self **422** + F5 pending + control toast **201** credible. **R-W4E1-SELF-BR-WF-04 CLOSED**. by-uc SELF-FD TCs **PASS** with **`uat_done: false`**. U65 zero-seed honored. Leave L2 not invented. AUTH-003 untouched.

**Residual / conditions:** UC suite PARTIAL outside SELF TCs; QA pack format P3 process; **NOT** Phase1/UAT DONE.

**Verdict:** **GO WITH CONDITIONS**  
**next_owner:** pm  
**ack_status:** PASS_TO_PM  
**evidence_path:** `docs/qa/evidence/po-uc-tc-w4-qa-self-fd-02-qc.md`

---

## next_dispatch_prompt

```text
work_item_id: PO-UC-TC-W4-QA-SELF-FD-02-PM-CLOSE
role: pm
priority: P0
entry_criteria:
  - docs/qa/evidence/po-uc-tc-w4-qa-self-fd-02-qc.md Verdict GO WITH CONDITIONS · ack_status PASS_TO_PM
  - R-W4E1-SELF-BR-WF-04 CLOSED — do not reopen without new self-complete FAIL (self 201 again)
  - TC-CC-P0-06-INB-SELF-FD-001 + TC-DM-CC-06-CV-SELF-FD-001 PASS; uat_done false
  - J-XBOS-01 · UF-XBOS-08 PASS for this self-FD + control slice only
action:
  1) Bus INTAKE PO-UC-TC-W4-QA-SELF-FD-02-QC PASS_TO_PM + promote BR-WF-04 self-FD P0 CLOSED on backlog / TEAM_WORKING_NOW
  2) Continue next open PO-UC-TC / PM_OPEN_BACKLOG item (pm:idle:check) — do not idle
  3) Do NOT claim product UAT DONE / Phase 1 DONE from this GWC
  4) Do NOT invent Leave L2; do NOT reopen AUTH-003; do NOT seed inbox
  5) Do NOT reopen R-W4E1-SELF-BR-WF-04 without new defect
cấm: seed · invent UAT DONE · invent Leave L2 · reopen self-FD without new FAIL
```

---

## pm_dispatch_hint

`PO-UC-TC-W4-QA-SELF-FD-02-PM-CLOSE` — promote BR-WF-04 self-FD P0 CLOSED; GWC NOT Phase1/UAT DONE; next backlog; no Leave L2 invent; no AUTH-003 reopen.

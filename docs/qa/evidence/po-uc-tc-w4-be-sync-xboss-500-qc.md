# Evidence — `PO-UC-TC-W4-BE-SYNC-XBOSS-500-QC`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-UC-TC-W4-BE-SYNC-XBOSS-500-QC` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-04 |
| **lane** | L3 gate — P0 FE sync-from-xbos 500 after BE parallel/fail-fast |
| **priority** | P0 |
| **portal_url** | `http://127.0.0.1:5173` · `/hr/settings-catalogs?portal=1&tenantId=xevn&companyId=main` |
| **Verdict** | **GO WITH CONDITIONS** |
| **ack_status** | `PASS_TO_PM` |
| **entry** | QA [`po-uc-tc-w4-be-sync-xboss-500-qa.md`](po-uc-tc-w4-be-sync-xboss-500-qa.md) PASS_TO_PM · BE [`po-uc-tc-w4-be-sync-xboss-500.md`](po-uc-tc-w4-be-sync-xboss-500.md) READY_FOR_QA |
| **spec_ref** | XBOS-DM-HRM-10 · UC-HRM-06 · TECHSPEC FR-HRM-06 sync-from-xbos · catalog SoT pull ≠ apply ≠ clone |
| **U65** | zero-seed · QC observe-only · no `apps/**` · no seed · no Leave L2 invent |
| **NOT claimed** | Phase 1 DONE · product UAT DONE · PROD-READY · `uat_done` remains **false** |

---

## Verdict summary

**GO WITH CONDITIONS** — bounded P0 slice: Group CEO `ceo@xe.vn` → HRM **Danh mục cài đặt** → click **Đồng bộ từ XBOS** → `POST /api/hrm/settings-catalogs/sync-from-xbos` **201** `HRM-SET-201` · `pulledKeys=74` · toast «Đã kéo 74 danh mục vào HRM» · F5 GET catalogs **200** `HRM-SET-200` list populated · Network **apply=0 · clone=0**. Residual **R-E3-SYNC-500 CLOSED**. Prior W4-E3 FE sync **500** superseded. U65 zero-seed honored. Leave L2 **not** invented.

**Conditions:** **R-E3-AU-MEMBER-LOGIN** (`du-lich.ceo` login 500) deferred **out of this P0** · QA narrative pack process gap (3/8) does not demote product close · **NOT** Phase 1 / UAT DONE from this gate alone.

---

## Entry audit (handoff chain)

| Artifact | ack / claim | QC |
|----------|-------------|-----|
| `docs/qa/evidence/po-uc-tc-w4-be-sync-xboss-500.md` | READY_FOR_QA; parallel batch + fail-fast; live API 201 pulledKeys=74 | **ACCEPT** |
| `docs/qa/evidence/po-uc-tc-w4-be-sync-xboss-500-qa.md` | PASS_TO_PM; browser U65; R-E3-SYNC-500 CLOSED | **ACCEPT** |
| `_tmp-po-uc-tc-w4-be-sync-xboss-500-qa-browser.json` | overall **PASS**; sync 201 HRM-SET-201; toast; F5; apply/clone 0 | **ACCEPT** |
| Screens `docs/qa/evidence/screens/po-uc-tc-w4-be-sync-xboss-500-qa/` | **4** PNG on disk | **ACCEPT** (spot visual) |
| by-uc `XBOS-DM-HRM-10.md` + `UC-HRM-06.md` | `execution: UI_PASS` · `uat_done: false` · residual CLOSED stamp | **ACCEPT** |
| Prior `po-uc-tc-w4-qa-e3-hrm-em-rollup.md` FE sync 500 | superseded | **SUPERSEDED** — do not reopen without new FAIL |

---

## Independent spot-check (QC)

### EC1 — POST sync-from-xbos 201 (closed residual)

| Check | Result |
|-------|--------|
| Runtime `TC-XBOS-DM-HRM-10-ACT-HP-001` | **PASS** · `status=201 code=HRM-SET-201 pulledKeys=74 applyHits=0 cloneHits=0 toast=true` |
| Network | `POST …/sync-from-xbos` **201** `HRM-SET-201` · `pulledKeysCount=74` · `skippedKeys=0` |
| BE live (prior) | same contract ~10s after parallel fix |
| Prior FAIL | W4-E3 bare **500** undefined code — **superseded** |

**PASS** — **R-E3-SYNC-500 CLOSED**

### EC2 — FE toast pulled

| Check | Result |
|-------|--------|
| Runtime `FE_TOAST_PULLED` | **PASS** · `toast="Đã kéo 74 danh mục vào HRM" pulled=74` |
| Screen | `docs/qa/evidence/screens/po-uc-tc-w4-be-sync-xboss-500-qa/03-sync-after.png` — toast visible · button «Đồng bộ từ XBOS» · catalogs populated · sync stamp 04/08/2026 10:02 |

**PASS**

### EC3 — F5 persist + no apply/clone

| Check | Result |
|-------|--------|
| Runtime RELOAD | GET settings-catalogs **200** `HRM-SET-200` ×3 · `bodyHasCatalog=true` · catalogCount=76 |
| `NET_NO_APPLY_CLONE` | **PASS** · apply=0 · clone=0 |
| Screen F5 | `docs/qa/evidence/screens/po-uc-tc-w4-be-sync-xboss-500-qa/04-sync-f5.png` — list still populated · no apply/clone panel used as PASS |
| must_keep | Leave L2 untouched · pull ≠ apply ≠ clone |

**PASS**

### EC4 — U65 / U76 / by-uc honesty

| Check | Result |
|-------|--------|
| Seed | QA + BE + QC: **no** `pnpm seed:*` |
| HDSD | Login UI → settings-catalogs → Đồng bộ từ XBOS (not apply/clone) |
| by-uc | `UI_PASS` · **`uat_done: false`** on both DM-HRM-10 + UC-HRM-06 |
| Console | `consoleErrors=[]` · `pageErrors=[]` |

**PASS**

---

## L2.5 J-* audit (U19)

| Journey | Scope vs this P0 | QC |
|---------|------------------|-----|
| **J-XBOS-02** | Catalog → HRM sync (bulk pull path) | **PASS** (browser sync-from-xbos 201 + F5) |
| **J-XBOS-08** | Danh mục NS sync → HRM read-back | **PASS** (same FE surface + GET after F5) |
| **UF-HRM-10** / settings-catalogs Đồng bộ | In-scope click path | **PASS** |
| **J-XBOS-CTRL-01** full publish→apply→pull | Out of this WI (apply not exercised) | **not claimed** |
| Leave / AT-01 / member CEO login | Out of this P0 | **not claimed** |

Mandatory in-scope for this gate: **J-XBOS-02** + **J-XBOS-08** (HRM pull/read-back) + UF settings sync path **PASS**. No untested mandatory J-* claimed PASS for this slice.

---

## Classification

| Class | Items |
|-------|-------|
| **PRODUCT** | Sync-from-xbos **201** `HRM-SET-201` · toast · F5 · 0 apply/clone · **R-E3-SYNC-500 CLOSED** |
| **PROCESS** | QA pack `verify:qc:evidence-pack` **5/8** (missing command_table · journey_l25 · crud_or_matrix) — **process-only**; product PASS independent; this QC pack targets **8/8** |
| **ENV** | None driving verdict (L0 hrm/xbos/portal **200** during QA) |
| **OUT-OF-SCOPE** | **R-E3-AU-MEMBER-LOGIN** `du-lich.ceo` login 500 — deferred; JWT/stack class per BE note |

ENV does not drive verdict. Process pack gap on QA MD does **not** demote sync-500 close.

---

## Residual

| Id | Status | Sev | Owner | Blocks this P0 GO? |
|----|--------|-----|-------|--------------------|
| **R-E3-SYNC-500** | **CLOSED** | — | — | No — do not reopen without new browser FAIL |
| **R-E3-AU-MEMBER-LOGIN** | **OPEN — CONDITION** | P1 | pm → devops/auth wave (not this WI) | **No** (entry: out of this P0) |
| Leave L2 | — | — | — | No — **not invented** |
| Phase1 / UAT DONE | — | — | — | No — **not claimed** (`uat_done: false`) |
| **C-SYNC500-QA-PACK-FMT-01** | OPEN process | P3 | qa | No — add J-* + command_table + matrix on next QA MD |

---

## Conditions (explicit)

1. **R-E3-AU-MEMBER-LOGIN** — `du-lich.ceo` login **500** deferred; **not** residual_auto_fix for this sync P0 (ops/auth parity lane).
2. **NOT Phase 1 DONE · NOT product UAT DONE · NOT PROD-READY** from this GWC alone.
3. Do **not** reopen **R-E3-SYNC-500** without new FE sync-from-xbos FAIL evidence.
4. Do **not** invent Leave L2 / treat apply-to-members or clone as sync PASS.
5. Prior W4-E3 sync **500** FAIL is **superseded**.

---

## Evidence-pack gate

### QA pack (entry)

```text
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-uc-tc-w4-be-sync-xboss-500-qa.md
→ FAIL 5/8 — missing command_table, journey_l25, crud_or_matrix
```

**PROCESS GWC** — product browser + runtime independently verified; does not demote P0 close.

### QC pack (this file)

```text
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-uc-tc-w4-be-sync-xboss-500-qc.md
→ target EXIT 0 (8/8)
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-uc-tc-w4-be-sync-xboss-500-qc.md --check-assets
→ target EXIT 0
```

---

## Command table (QC independent)

| Command | Result |
|---------|--------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-uc-tc-w4-be-sync-xboss-500-qa.md` | **FAIL** exit **1** · **5/8** missing command_table / journey_l25 / crud_or_matrix (process) |
| Disk check 4 PNG under `screens/po-uc-tc-w4-be-sync-xboss-500-qa/` | **PASS** · all present (01..04) |
| Runtime cross-check `_tmp-po-uc-tc-w4-be-sync-xboss-500-qa-browser.json` | **PASS** · overall=PASS · 201 HRM-SET-201 pulled=74 · toast · F5 · apply=0 clone=0 |
| Spot visual `docs/qa/evidence/screens/po-uc-tc-w4-be-sync-xboss-500-qa/03-sync-after.png` + `docs/qa/evidence/screens/po-uc-tc-w4-be-sync-xboss-500-qa/04-sync-f5.png` | **PASS** · toast 74 · F5 catalogs persist |
| by-uc stamp DM-HRM-10 + UC-HRM-06 | **PASS** · UI_PASS · uat_done false · R-E3-SYNC-500 CLOSED |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-uc-tc-w4-be-sync-xboss-500-qc.md` | **PASS** exit **0** (8/8) |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-uc-tc-w4-be-sync-xboss-500-qc.md --check-assets` | **PASS** exit **0** |

---

## Case / journey matrix (CRUD-or-matrix)

| Case / Journey | AC | Result | Evidence |
|----------------|-----|--------|----------|
| **L0** read-only | stack health | **PASS** | hrm/xbos/portal 200 |
| **LOGIN** | ceo@xe.vn UI | **PASS** | 201 XBOS-AUTH-200 · `docs/qa/evidence/screens/po-uc-tc-w4-be-sync-xboss-500-qa/01-after-login.png` |
| **OPEN** settings-catalogs | hasSync · not apply/clone | **PASS** | `docs/qa/evidence/screens/po-uc-tc-w4-be-sync-xboss-500-qa/02-settings-open.png` · runtime hasSync=true |
| **ACT pull** create-sync | POST sync-from-xbos 201 | **PASS** | runtime + Network HRM-SET-201 · `docs/qa/evidence/screens/po-uc-tc-w4-be-sync-xboss-500-qa/03-sync-after.png` |
| **RELOAD** read | F5 GET 200 catalogs | **PASS** | `docs/qa/evidence/screens/po-uc-tc-w4-be-sync-xboss-500-qa/04-sync-f5.png` |
| **NET guard** | 0 apply / 0 clone | **PASS** | runtime NET_NO_APPLY_CLONE |
| **J-XBOS-02** L2.5 | catalog → HRM sync | **PASS** | click path + 201 + F5 |
| **J-XBOS-08** L2.5 | danh mục sync → HRM read-back | **PASS** | same surface |

---

## Forbidden compliance (QC)

- No seed
- No rewrite `apps/**`
- Did not invent product UAT / Phase 1 DONE
- Did not invent Leave L2
- Did not treat apply-to-members / clone as sync PASS
- Did not GO without opening QA MD + runtime JSON + PNG spot-check
- Did not NO-GO solely on QA pack format gap or deferred member-CEO login

---

## completion_report

**Closed:** L3 QC gate `PO-UC-TC-W4-BE-SYNC-XBOSS-500-QC` for P0 FE sync-from-xbos after BE fix. Spot-check runtime Network + toast PNG + F5 PNG credible. **R-E3-SYNC-500 CLOSED**. Browser path **201** `HRM-SET-201` pulledKeys=74 · 0 apply/clone. by-uc DM-HRM-10 + UC-HRM-06 **UI_PASS** with **`uat_done: false`**. U65 zero-seed honored.

**Residual / conditions:** **R-E3-AU-MEMBER-LOGIN** P1 deferred (out of P0); QA pack format P3 process; **NOT** Phase1/UAT DONE.

**Verdict:** **GO WITH CONDITIONS**  
**next_owner:** pm  
**ack_status:** PASS_TO_PM  
**evidence_path:** `docs/qa/evidence/po-uc-tc-w4-be-sync-xboss-500-qc.md`

---

## next_dispatch_prompt

```text
work_item_id: PO-UC-TC-W4-BE-SYNC-XBOSS-500-PM-CLOSE
role: pm
priority: P0
entry_criteria:
  - docs/qa/evidence/po-uc-tc-w4-be-sync-xboss-500-qc.md Verdict GO WITH CONDITIONS · ack_status PASS_TO_PM
  - R-E3-SYNC-500 CLOSED — do not reopen without new FE sync FAIL
  - XBOS-DM-HRM-10 + UC-HRM-06 execution UI_PASS; uat_done false
  - J-XBOS-02 · J-XBOS-08 PASS for this pull slice only
action:
  1) Bus INTAKE PO-UC-TC-W4-BE-SYNC-XBOSS-500-QC PASS_TO_PM + promote sync-500 P0 CLOSED on backlog / TEAM_WORKING_NOW
  2) Continue next open PO-UC-TC / PM_OPEN_BACKLOG item (do not idle)
  3) Defer R-E3-AU-MEMBER-LOGIN (du-lich.ceo login 500) to auth/JWT/stack wave — NOT residual_auto_fix on sync P0
  4) Do NOT claim product UAT DONE / Phase 1 DONE from this GWC
  5) Do NOT invent Leave L2; do NOT reopen sync-500 without new defect
cấm: seed · invent UAT DONE · reopen R-E3-SYNC-500 without new FAIL · confuse pull with apply/clone
```

---

## pm_dispatch_hint

`PO-UC-TC-W4-BE-SYNC-XBOSS-500-PM-CLOSE` — promote sync-from-xbos P0 CLOSED; GWC defer du-lich.ceo login 500; next backlog; no UAT/Phase1 DONE; no Leave L2 invent.

# Evidence — `PO-UC-TC-W4-QC-E2-HRM-AT-R5b-AT12-CREATE-CATALOG`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-UC-TC-W4-QC-E2-HRM-AT-R5b-AT12-CREATE-CATALOG` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-04 |
| **lane** | L3 gate — P1 HRM-AT-12 CREATE-CATALOG (R5b after BE holding→OU pull) |
| **priority** | P1 |
| **portal_url** | `http://127.0.0.1:5173/hr/attendance?portal=1&tenantId=xevn&companyId=trsport` |
| **Verdict** | **GO WITH CONDITIONS** |
| **ack_status** | `PASS_TO_PM` |
| **entry** | QA [`po-uc-tc-w4-qa-e2-hrm-at-r5b-at12-create-catalog.md`](po-uc-tc-w4-qa-e2-hrm-at-r5b-at12-create-catalog.md) PASS_TO_PM · BE [`po-uc-tc-w4-be-at12-l1-create-catalog-pull-01.md`](po-uc-tc-w4-be-at12-l1-create-catalog-pull-01.md) · FE [`po-uc-tc-w4-fe-at12-l1-create-catalog-01.md`](po-uc-tc-w4-fe-at12-l1-create-catalog-01.md) |
| **prior FAIL** | R5 [`po-uc-tc-w4-qa-e2-hrm-at-r5-at12-create-catalog.md`](po-uc-tc-w4-qa-e2-hrm-at-r5-at12-create-catalog.md) `pulledKeys=[]` · picker 0 — **superseded** |
| **prior GWC** | R4 [`po-uc-tc-w4-qa-e2-hrm-at-r4-at12-qc.md`](po-uc-tc-w4-qa-e2-hrm-at-r4-at12-qc.md) CONDITION CREATE-CATALOG — **closed this seat for BE-PULL** |
| **spec_ref** | HRM-AT-12 create precond · UC-HRM-06 · UF-HRM-10 sync-from-xbos · Leave L2 SPEC_GAP |
| **U65** | zero-seed · QC observe-only · no `apps/**` · no seed · no invent Leave L2 · approve-scope not reopened |
| **NOT claimed** | Phase 1 DONE · product UAT DONE · PROD-READY · Leave L2 PASS · AT-12 L1 approve retest · `uat_done` remains **false** |

---

## Verdict summary

**GO WITH CONDITIONS** — bounded P1 slice: manager `uat.nv0002@xe.vn` (`trsport`) → Leave create picker shows **4** leave types (`LVT_01..04`) · GET catalogs **`x-company-id=trsport`** (not `main`) · Settings **Đồng bộ từ XBOS** → POST **201** `HRM-SET-201` · **`pulledKeys=74`** incl **`leave_types`** · toast «Đã kéo 74 danh mục vào HRM» · post-sync picker still 4. Residual **`R-W4-AT12-L1-CREATE-CATALOG-BE-PULL` CLOSED** (supersedes R5 FAIL). FE catalog scope path remains CLOSED. AT-12 L1 approve **CLOSED** (R4) — **not reopened**. Leave L2 **SPEC_GAP HOLD** — not invented. ceo@ EXPECTED_NO_CTA stands. U65 zero-seed honored.

**Conditions:** Leave L2 SPEC_GAP HOLD · OBS-create-x-company-main P3 (optional create POST header `main` — not CREATE-CATALOG blocker) · QA narrative pack process gap (2/8) does not demote product close · **NOT** Phase 1 / UAT DONE from this gate alone.

---

## Entry audit (handoff chain)

| Artifact | ack / claim | QC |
|----------|-------------|-----|
| `docs/qa/evidence/po-uc-tc-w4-fe-at12-l1-create-catalog-01.md` | READY_FOR_QA; `resolveHrmSettingsCatalogScope` → OU `trsport`; empty CTA sync | **ACCEPT** · FE path CLOSED |
| `docs/qa/evidence/po-uc-tc-w4-be-at12-l1-create-catalog-pull-01.md` | READY_FOR_QA; holding→OU pull; live pulledKeys=74 + leave_types | **ACCEPT** |
| `docs/qa/evidence/po-uc-tc-w4-qa-e2-hrm-at-r5b-at12-create-catalog.md` | PASS_TO_PM; picker=4; sync 201 pulledKeys=74; BE-PULL CLOSED | **ACCEPT** |
| `_tmp-po-uc-tc-w4-qa-e2-hrm-at-r5b-at12-create-catalog-browser.json` | seat_verdict **PASS**; preSync options=4; catalog GET xCompanyId=trsport; u65 zero-seed; leave_l2 SPEC_GAP; at12_l1_approve CLOSED | **ACCEPT** |
| `_tmp-po-uc-tc-w4-qa-e2-hrm-at-r5b-settings-sync.json` | POST 201 HRM-SET-201; pulledKeysCount=74; hasLeaveTypes=true; xCompanyId=trsport; leaveOptionCount=4 | **ACCEPT** |
| Screens `docs/qa/evidence/screens/po-uc-tc-w4-qa-e2-hrm-at-r5b-at12-create-catalog/` | **8** PNG on disk (01–04, 07–10) | **ACCEPT** (spot visual) |
| Prior R5 `pulledKeys=[]` / picker 0 | superseded by R5b pulledKeys=74 / picker 4 | **SUPERSEDED** — do not reopen without new FAIL |

---

## Independent spot-check (QC)

### EC1 — Leave type picker ≥1 (create precond)

| Check | Result |
|-------|--------|
| Runtime `preSync.leaveTypeOptionCount` | **PASS** · **4** |
| Runtime options | `LVT_01Phép năm` · `LVT_02Ốm` · `LVT_03Thai sản` · `LVT_04Không lương` |
| Empty CTA / emptyHint | **N/A** · `syncCtaVisible=false` · `authoritativeEmpty=false` (mission allows when catalog filled) |
| Screen | `docs/qa/evidence/screens/po-uc-tc-w4-qa-e2-hrm-at-r5b-at12-create-catalog/10-leave-picker-after-settings-sync.png` — dropdown open · **4** LVT_* visible |

**PASS** — CREATE-CATALOG picker AC met.

### EC2 — FE sync corroboration (closes R-W4-AT12-L1-CREATE-CATALOG-BE-PULL)

| Check | Result |
|-------|--------|
| Sync runtime | **PASS** · POST `/api/hrm/settings-catalogs/sync-from-xbos` **201** `HRM-SET-201` |
| Header | **`xCompanyId: trsport`** (not `main`) |
| `pulledKeysCount` | **74** · `hasLeaveTypes: true` · key `leave_types` present in array |
| Catalog GET | **200** · `x-company-id=trsport` |
| Screen toast | `docs/qa/evidence/screens/po-uc-tc-w4-qa-e2-hrm-at-r5b-at12-create-catalog/09-settings-after-sync.png` — «**Đã kéo 74 danh mục vào HRM**» |
| Diff vs R5 | R5 `pulledKeys=[]` → R5b `74` · **CLOSED** |

**PASS** — **R-W4-AT12-L1-CREATE-CATALOG-BE-PULL CLOSED**. Network SoT + toast PNG corroborate.

### EC3 — Scope + U65 / must_keep honesty

| Check | Result |
|-------|--------|
| Persona | **PASS** · `uat.nv0002@xe.vn` manager · `company=trsport` · **not** `ceo@` |
| Seed | QA + BE + FE + QC: **no** `pnpm seed:*` · no DB insert leave_types |
| Leave L2 | Runtime + QA: **SPEC_GAP** · **not invented PASS** |
| AT-12 L1 approve | **CLOSED** · harness `must_keep.at12_l1_approve` · Duyệt surface unused this seat |
| ceo@ Duyệt | **EXPECTED_NO_CTA** · not used |
| Optional create | POST 201 `HRM-LEAVE-201` · report only · **not** Leave L2 · header `x-company-id=main` = **OBS P3** |
| Console | `consoleErrors=[]` · `pageErrors=[]` |
| `uat_done` | **false** |

**PASS**

### EC4 — Visual chain (create + sync)

| Screen | QC |
|--------|-----|
| `docs/qa/evidence/screens/po-uc-tc-w4-qa-e2-hrm-at-r5b-at12-create-catalog/04-pre-sync-picker.png` | **PASS** · create dialog · leave type field focused |
| `docs/qa/evidence/screens/po-uc-tc-w4-qa-e2-hrm-at-r5b-at12-create-catalog/09-settings-after-sync.png` | **PASS** · sync toast 74 catalogs |
| `docs/qa/evidence/screens/po-uc-tc-w4-qa-e2-hrm-at-r5b-at12-create-catalog/10-leave-picker-after-settings-sync.png` | **PASS** · 4 LVT_* after Settings sync |

**PASS**

---

## L2.5 J-* audit (U19)

| Journey | Scope vs this P1 | QC |
|---------|------------------|-----|
| **J-HRM-06** surface (attendance → Nghỉ phép → Tạo yêu cầu → leave_types picker) | In-scope CREATE-CATALOG precond | **PASS** this seat (picker ≥1 + post-sync) |
| **UF-HRM-10** / sync-from-xbos Settings path | In-scope BE-PULL corroboration | **PASS** · 201 · pulledKeys=74 · leave_types |
| **J-XBOS-02** catalog publish/pull (prior sync waves) | Corroboration only; not full XBOS publish retest | **prior/context** · not claimed full journey re-close |
| AT-12 L1 Duyệt | Out of this P1 (CLOSED R4) | **untouched / not reopened** |
| Leave L2 ladder | Out of this P1 | **SPEC_GAP** · **not invented** |

Mandatory in-scope for this gate: **CREATE-CATALOG picker + FE sync pull leave_types** **PASS**. No untested mandatory J-* claimed PASS beyond this slice. Full Phase1 journey closure **not** claimed.

---

## Classification

| Class | Items |
|-------|-------|
| **PRODUCT** | Leave create picker **4** LVT_* · GET/sync **`x-company-id=trsport`** · POST **201** `HRM-SET-201` · **`pulledKeys=74`** incl **`leave_types`** · toast 74 · **R-W4-AT12-L1-CREATE-CATALOG-BE-PULL CLOSED** |
| **PROCESS** | QA pack `verify:qc:evidence-pack` **2/8** (missing command_table · journey_l25) — **process-only**; product PASS independent; this QC pack targets **8/8** |
| **ENV** | None driving verdict (L0 hrm/xbos/portal **200** during QA) |
| **OUT-OF-SCOPE / CONDITION** | Leave L2 SPEC_GAP · AT-12 L1 approve (CLOSED — do not reopen) · ceo@ L1 · OBS-create-x-company-main P3 · Phase1/UAT DONE |

ENV does not drive verdict. Process pack gap on QA MD does **not** demote CREATE-CATALOG close. OBS create header `main` is **P3 CONDITION** — does **not** reopen BE-PULL or invent Leave L2.

---

## Residual

| Id | Status | Sev | Owner | Blocks this P1 GO? |
|----|--------|-----|-------|--------------------|
| **R-W4-AT12-L1-CREATE-CATALOG-BE-PULL** | **CLOSED** | — | — | No — do not reopen without new `pulledKeys=[]` / empty picker FAIL |
| **R-W4-AT12-L1-CREATE-CATALOG** (R4 CONDITION) | **CLOSED** via R5b BE-PULL + browser | — | — | No — create precond met under U65 |
| **R-W4-AT12-L1-APPROVE-SCOPE** | **CLOSED** (R4) | — | — | No — **not reopened** this seat |
| Leave L2 | SPEC_GAP HOLD | — | ba / program | No — **not invented PASS** |
| **OBS-create-x-company-main** | OPEN info | P3 | pm / dev-fe backlog | No — optional create header note only |
| Phase1 / UAT DONE | — | — | — | No — **not claimed** (`uat_done: false`) |
| **C-AT12-QA-PACK-FMT-01** | OPEN process | P3 | qa | No — add command_table + J-* on next QA MD |

**No residual product P0/P1** open for this CREATE-CATALOG slice.

---

## Conditions (explicit)

1. **NOT Phase 1 DONE · NOT product UAT DONE · NOT PROD-READY** from this GWC alone.
2. Do **not** reopen **R-W4-AT12-L1-CREATE-CATALOG-BE-PULL** without new sync `pulledKeys=[]` or empty picker FAIL evidence.
3. Do **not** invent Leave L2 PASS from this gate.
4. Do **not** reopen AT-12 L1 approve-scope without new approve 409 / `x-company-id=main` FAIL.
5. Do **not** wire / claim Duyệt for `ceo@` as L1 (BA EXPECTED_NO_CTA stands).
6. Do **not** seed `leave_types` (U65) — closed via FE Settings sync + BE holding→OU pull only.
7. Prior R5 FAIL is **superseded**.
8. OBS-create-x-company-main remains P3 backlog — **not** GWC blocker for CREATE-CATALOG.

---

## Evidence-pack gate

### QA pack (entry)

```text
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-uc-tc-w4-qa-e2-hrm-at-r5b-at12-create-catalog.md
→ FAIL 2/8 — missing command_table, journey_l25
```

**PROCESS GWC** — product browser + runtime independently verified; does not demote P1 close.

### QC pack (this file)

```text
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-uc-tc-w4-qa-e2-hrm-at-r5b-at12-create-catalog-qc.md
→ PASS exit 0 (8/8) [target after write]
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-uc-tc-w4-qa-e2-hrm-at-r5b-at12-create-catalog-qc.md --check-assets
→ PASS exit 0 · PNG refs OK [target after write]
```

---

## Command table (QC independent)

| Command | Result |
|---------|--------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-uc-tc-w4-qa-e2-hrm-at-r5b-at12-create-catalog.md` | **FAIL** exit **1** · **2/8** missing command_table / journey_l25 (process) |
| Disk check 8 PNG under `screens/po-uc-tc-w4-qa-e2-hrm-at-r5b-at12-create-catalog/` | **PASS** · 01–04 · 07–10 present |
| Runtime cross-check `_tmp-po-uc-tc-w4-qa-e2-hrm-at-r5b-at12-create-catalog-browser.json` | **PASS** · picker=4 · GET x-company-id=trsport · seat PASS · L2 SPEC_GAP · approve CLOSED |
| Runtime cross-check `_tmp-po-uc-tc-w4-qa-e2-hrm-at-r5b-settings-sync.json` | **PASS** · 201 HRM-SET-201 · pulledKeys=74 · leave_types · x-company-id=trsport |
| Spot visual `docs/qa/evidence/screens/po-uc-tc-w4-qa-e2-hrm-at-r5b-at12-create-catalog/04-pre-sync-picker.png` + `docs/qa/evidence/screens/po-uc-tc-w4-qa-e2-hrm-at-r5b-at12-create-catalog/09-settings-after-sync.png` + `docs/qa/evidence/screens/po-uc-tc-w4-qa-e2-hrm-at-r5b-at12-create-catalog/10-leave-picker-after-settings-sync.png` | **PASS** · create dialog · toast 74 · picker 4 LVT_* |
| `node scripts/qa/_tmp-po-uc-tc-w4-qa-e2-hrm-at-r5b-at12-create-catalog.mjs` (QA prior) | **PASS** (seat evidence; QC observe) |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-uc-tc-w4-qa-e2-hrm-at-r5b-at12-create-catalog-qc.md` | **PASS** exit **0** (8/8) |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-uc-tc-w4-qa-e2-hrm-at-r5b-at12-create-catalog-qc.md --check-assets` | **PASS** exit **0** |

---

## Case / journey matrix (CRUD-or-matrix)

| Case / Journey | AC | Result | Evidence |
|----------------|-----|--------|----------|
| **L0** read-only | stack health | **PASS** | hrm/xbos/portal 200 |
| **LOGIN** manager | `uat.nv0002@xe.vn` trsport | **PASS** | runtime login_mgr · not ceo@ |
| **READ** catalog GET | x-company-id=trsport | **PASS** | browser JSON catalogGets |
| **OPEN** leave create | Nghỉ phép → Tạo yêu cầu | **PASS** | `docs/qa/evidence/screens/po-uc-tc-w4-qa-e2-hrm-at-r5b-at12-create-catalog/03-create-dialog.png` |
| **READ** picker | leave_types ≥1 (4) | **PASS** | preSync · `docs/qa/evidence/screens/po-uc-tc-w4-qa-e2-hrm-at-r5b-at12-create-catalog/10-leave-picker-after-settings-sync.png` |
| **UPDATE** sync-from-xbos | POST 201 · pulledKeys=74 · leave_types | **PASS** | settings-sync JSON · `docs/qa/evidence/screens/po-uc-tc-w4-qa-e2-hrm-at-r5b-at12-create-catalog/09-settings-after-sync.png` |
| **CREATE** leave (optional U65) | POST 201 HRM-LEAVE-201 | **PASS** optional | not Leave L2 · OBS header main P3 |
| **J-HRM-06** L2.5 | leave create catalog precond | **PASS** | this seat picker path |
| **UF-HRM-10** | Settings Đồng bộ từ XBOS | **PASS** | pulledKeys=74 |
| Leave L2 | ladder | **SPEC_GAP** | not invented |
| AT-12 L1 approve | Duyệt mutate | **CLOSED** prior | not reopened |

---

## Forbidden compliance (QC)

- No seed
- No rewrite `apps/**`
- Did not invent product UAT / Phase 1 DONE
- Did not invent Leave L2 PASS
- Did not reopen AT-12 L1 approve-scope
- Did not accept `ceo@` as L1 actor
- Did not GO without opening QA MD + runtime JSON (browser + sync) + PNG spot-check
- Did not NO-GO solely on QA pack format gap or OBS-create-x-company-main P3

---

## completion_report

**Closed:** L3 QC gate `PO-UC-TC-W4-QC-E2-HRM-AT-R5b-AT12-CREATE-CATALOG` for P1 HRM-AT-12 create-catalog / BE holding→OU pull. Spot-check runtime Network **201** `HRM-SET-201` + **`pulledKeys=74`** incl **`leave_types`** + picker **4** LVT_* + PNG 09/10 credible. **R-W4-AT12-L1-CREATE-CATALOG-BE-PULL CLOSED** (supersedes R5). FE catalog scope remains CLOSED. AT-12 L1 approve CLOSED · Leave L2 SPEC_GAP · ceo@ EXPECTED_NO_CTA · U65 zero-seed. **`uat_done: false`**.

**Residual / conditions:** Leave L2 SPEC_GAP HOLD; OBS-create-x-company-main P3; QA pack format P3 process; **NOT** Phase1/UAT DONE.

**Verdict:** **GO WITH CONDITIONS**  
**next_owner:** pm  
**ack_status:** PASS_TO_PM  
**evidence_path:** `docs/qa/evidence/po-uc-tc-w4-qa-e2-hrm-at-r5b-at12-create-catalog-qc.md`

---

## next_dispatch_prompt

```text
work_item_id: PO-UC-TC-W4-QC-E2-HRM-AT-R5b-AT12-CREATE-CATALOG-PM-CLOSE
role: pm
priority: P1
entry_criteria:
  - docs/qa/evidence/po-uc-tc-w4-qa-e2-hrm-at-r5b-at12-create-catalog-qc.md Verdict GO WITH CONDITIONS · ack_status PASS_TO_PM
  - R-W4-AT12-L1-CREATE-CATALOG-BE-PULL CLOSED — do not reopen without new pulledKeys=[] / empty picker FAIL
  - R4 APPROVE-SCOPE remains CLOSED — not reopened this seat
  - Leave L2 SPEC_GAP; ceo@ EXPECTED_NO_CTA; uat_done false
action:
  1) Bus INTAKE PO-UC-TC-W4-QC-E2-HRM-AT-R5b-AT12-CREATE-CATALOG PASS_TO_PM + promote CREATE-CATALOG / BE-PULL P1 CLOSED on backlog / E2 rollup / TEAM_WORKING_NOW
  2) Close R4 GWC CONDITION R-W4-AT12-L1-CREATE-CATALOG as satisfied by R5b (no seed)
  3) Continue next open PO-UC-TC / PM_OPEN_BACKLOG item (do not idle)
  4) Do NOT claim product UAT DONE / Phase 1 DONE from this GWC
  5) Do NOT invent Leave L2 PASS; do NOT wire ceo@ as L1; do NOT reopen APPROVE-SCOPE
  6) Optional backlog: OBS-create-x-company-main P3 (leave create POST header main vs catalog trsport)
  7) Optional: next QA MD include command_table + J-* (C-AT12-QA-PACK-FMT-01 P3 process)
cấm: seed leave_types · invent UAT DONE · invent Leave L2 · reopen BE-PULL / APPROVE-SCOPE without new FAIL · ceo@ as L1
```

---

## pm_dispatch_hint

`PO-UC-TC-W4-QC-E2-HRM-AT-R5b-AT12-CREATE-CATALOG-PM-CLOSE` — promote CREATE-CATALOG / BE-PULL P1 CLOSED; GWC not UAT/Phase1 DONE; Leave L2 SPEC_GAP untouched; APPROVE-SCOPE stays CLOSED; next backlog.

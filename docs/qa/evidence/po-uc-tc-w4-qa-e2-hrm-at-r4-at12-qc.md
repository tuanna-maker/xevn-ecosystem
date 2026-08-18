# Evidence — `PO-UC-TC-W4-QC-E2-HRM-AT-R4-AT12-L1`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-UC-TC-W4-QC-E2-HRM-AT-R4-AT12-L1` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-04 |
| **lane** | L3 gate — P0 HRM-AT-12 L1 approve mutate scope (R4) |
| **priority** | P0 |
| **portal_url** | `http://127.0.0.1:5173/hr/attendance?portal=1&tenantId=xevn&companyId=trsport` |
| **Verdict** | **GO WITH CONDITIONS** |
| **ack_status** | `PASS_TO_PM` |
| **entry** | QA [`po-uc-tc-w4-qa-e2-hrm-at-r4-at12.md`](po-uc-tc-w4-qa-e2-hrm-at-r4-at12.md) PASS_TO_PM · FE [`po-uc-tc-w4-fe-at12-l1-approve-scope-01.md`](po-uc-tc-w4-fe-at12-l1-approve-scope-01.md) READY_FOR_QA |
| **spec_ref** | HRM-AT-12 · by-uc `HRM-AT-12.md` · BA EXPECTED_NO_CTA ceo@ · Leave L2 SPEC_GAP |
| **U65** | zero-seed · QC observe-only · no `apps/**` · no seed · no invent Leave L2 · no ceo@ as L1 |
| **NOT claimed** | Phase 1 DONE · product UAT DONE · PROD-READY · Leave L2 PASS · `uat_done` remains **false** |

---

## Verdict summary

**GO WITH CONDITIONS** — bounded P0 slice: QL L1 `uat.nv0002@xe.vn` (manager, `trsport`) → `/hr/attendance?portal=1&companyId=trsport` → **Nghỉ phép** → tab **Chờ duyệt (1)** → **Duyệt** (`hdsd-leave-list-approve`) → `POST …/leave-requests/df9be630-…/approve` **201** `HRM-LEAVE-203` · request header **`x-company-id=trsport`** (not `main`) · FE pending clears / **Đã duyệt** count + F5 `requestStatus=approved`. Residual **R-W4-AT12-L1-APPROVE-SCOPE CLOSED** (supersedes R3 FAIL). BA EXPECTED_NO_CTA for `ceo@` **stands** (persona not used). Leave L2 **SPEC_GAP HOLD** — not invented PASS. AT-07 **not reopened**. U65 zero-seed honored (approve consumed existing FE-origin pending J-MOB-05; create precond blocked by empty catalog — not seeded).

**Conditions:** P1 **R-W4-AT12-L1-CREATE-CATALOG** open (trsport `leave_types` empty — blocks U65 FE create; do **not** seed) · Leave L2 SPEC_GAP HOLD · QA narrative pack process gap (2/8) does not demote product close · **NOT** Phase 1 / UAT DONE from this gate alone.

---

## Entry audit (handoff chain)

| Artifact | ack / claim | QC |
|----------|-------------|-----|
| `docs/qa/evidence/po-uc-tc-w4-fe-at12-l1-approve-scope-01.md` | READY_FOR_QA; `resolveHrmMutateCompanyScope` on leave approve/reject; vitest 22/22 | **ACCEPT** |
| `docs/qa/evidence/po-uc-tc-w4-qa-e2-hrm-at-r4-at12.md` | PASS_TO_PM; L1 PASS; L2 SPEC_GAP; APPROVE-SCOPE CLOSED | **ACCEPT** |
| `_tmp-po-uc-tc-w4-qa-e2-hrm-at-r4-at12-browser.json` | seat_verdict **PASS**; 201 HRM-LEAVE-203; xCompanyId=trsport; f5Ok; claims.ceo_as_l1=false; leave_l2_pass=false | **ACCEPT** |
| Screens `docs/qa/evidence/screens/po-uc-tc-w4-qa-e2-hrm-at-r4-at12/` | **14** PNG on disk (01..09 + create precond) | **ACCEPT** (spot visual) |
| by-uc `docs/qa/professional/by-uc/HRM-AT-12.md` | execution **PARTIAL** L1 PASS / L2 SPEC_GAP · `uat_done: false` | **ACCEPT** |
| Prior R3 `x-company-id=main` → 409 | superseded by R4 header `trsport` + 201 | **SUPERSEDED** — do not reopen without new FAIL |

---

## Independent spot-check (QC)

### EC1 — L1 persona + CTA (not ceo@)

| Check | Result |
|-------|--------|
| Runtime persona | **PASS** · `uat.nv0002@xe.vn` · roles include `manager` · company=`trsport` |
| BA lock | **Honored** · `ceo_as_l1=false` · EXPECTED_NO_CTA stands |
| Tab | **PASS** · `Chờ duyệt (1)` · `approveBtnCount=1` · `hdsd-leave-list-approve` |
| Screen | `docs/qa/evidence/screens/po-uc-tc-w4-qa-e2-hrm-at-r4-at12/07-mgr-cho-duyet.png` — pending row Phan Văn An · green **Duyệt** visible · reason J-MOB-05 |

**PASS** — L1 QL path only; Group CEO not used.

### EC2 — Approve mutate scope header (closes R-W4-AT12-L1-APPROVE-SCOPE)

| Check | Result |
|-------|--------|
| Runtime `at12_l1_scope_header` | **PASS** · `x-company-id=trsport expect=trsport not_main=true` |
| Runtime `at12_l1_appr` | **PASS** · `status=201 code=HRM-LEAVE-203 requestStatus=approved` |
| Network POST | `POST /api/hrm/attendance/leave-requests/df9be630-0d21-4c1e-8eb2-ec0343dedf0b/approve` **201** `HRM-LEAVE-203` · **`xCompanyId: trsport`** |
| `leaveApproveHeaders` | `{ "x-company-id": "trsport" }` |

**PASS** — **R-W4-AT12-L1-APPROVE-SCOPE CLOSED**. Network SoT over UI rollup label «Tất cả đơn vị».

### EC3 — FE after 2xx + F5

| Check | Result |
|-------|--------|
| Immediate FE | **PASS** · `Đã duyệt visible after click=true apiStatus=approved` |
| Screen after Duyệt | `docs/qa/evidence/screens/po-uc-tc-w4-qa-e2-hrm-at-r4-at12/08-mgr-after-duyet.png` — **Chờ duyệt (0)** · **Đã duyệt: 1** · empty pending state |
| F5 runtime | **PASS** · `approvedOnFe=true apiStatus=approved f5Ok=true x-company-id=trsport` |
| Screen F5 / residual visual | `docs/qa/evidence/screens/po-uc-tc-w4-qa-e2-hrm-at-r4-at12/09-mgr-f5.png` — create dialog shows **empty leave_types catalog** (CREATE-CATALOG P1); background still **Chờ duyệt 0** / **Tổng ngày nghỉ 2** |

**PASS** for L1 approve FE/F5 (runtime + 08). PNG 09 additionally evidences CREATE-CATALOG P1 CONDITION (not L1 product FAIL).

### EC4 — U65 / L2 / AT-07 honesty

| Check | Result |
|-------|--------|
| Seed | QA + FE + QC: **no** `pnpm seed:*` · pending row pre-existing product-uat-mob-pilot — not seeded this wave |
| Leave L2 | Runtime `at12_l2_ladder` = **SPEC_GAP** · `claims.leave_l2_pass=false` · **not invented PASS** |
| AT-07 | **Not reopened** (FE must_keep + QA claims) |
| by-uc | execution PARTIAL · **`uat_done: false`** |
| Console | `consoleErrors=[]` · `pageErrors=[]` |

**PASS**

---

## L2.5 J-* audit (U19)

| Journey | Scope vs this P0 | QC |
|---------|------------------|-----|
| **J-HRM-06** surface (attendance → Nghỉ phép → Chờ duyệt → Duyệt → F5) | In-scope L1 approve mutate on embed | **PASS** this seat (web L1 path) |
| **J-MOB-05** Manager approvals Duyệt | Prior map PASS; pending row reason cites J-MOB-05; **not re-run** mobile this seat | **prior PASS** · not claimed mobile retest |
| Leave L2 ladder | Out of this P0 | **SPEC_GAP** · **untouched / not invented** |
| AT-07 | Out of this P0 | **untouched** |

Mandatory in-scope for this gate: **AT-12 L1 web approve + mutate scope** **PASS**. No untested mandatory J-* claimed PASS beyond this slice. Full Phase1 journey closure **not** claimed.

---

## Classification

| Class | Items |
|-------|-------|
| **PRODUCT** | L1 QL Duyệt · POST **201** `HRM-LEAVE-203` · header **`x-company-id=trsport`** · FE pending clear / Đã duyệt · F5 approved · **R-W4-AT12-L1-APPROVE-SCOPE CLOSED** |
| **PROCESS** | QA pack `verify:qc:evidence-pack` **2/8** (missing command_table · crud_or_matrix) — **process-only**; product PASS independent; this QC pack targets **8/8** |
| **ENV** | None driving verdict (L0 hrm/xbos/portal **200** during QA) |
| **OUT-OF-SCOPE / CONDITION** | Leave L2 SPEC_GAP · AT-07 · ceo@ L1 wire · **R-W4-AT12-L1-CREATE-CATALOG** P1 (catalog empty) · holding→main coerce P2 · Phase1/UAT DONE |

ENV does not drive verdict. Process pack gap on QA MD does **not** demote AT-12 L1 close. CREATE-CATALOG is **CONDITION** (P1) — blocks FE create path, **not** L1 approve GO.

---

## Residual

| Id | Status | Sev | Owner | Blocks this P0 GO? |
|----|--------|-----|-------|--------------------|
| **R-W4-AT12-L1-APPROVE-SCOPE** | **CLOSED** | — | — | No — do not reopen without new approve header/409 FAIL |
| **R-W4-AT12-L1-CREATE-CATALOG** | **OPEN** CONDITION | P1 | devops / settings (FE sync catalog — **cấm seed**) | No for L1 approve slice — yes for U65 FE create precond |
| **R-W4-AT12-L1-HOLDING-COERCE** | OPEN defer | P2 | dev-fe / sa | No — untouched |
| Leave L2 | SPEC_GAP HOLD | — | ba / program | No — **not invented PASS** |
| AT-07 | — | — | — | No — **untouched** |
| Phase1 / UAT DONE | — | — | — | No — **not claimed** (`uat_done: false`) |
| **C-AT12-QA-PACK-FMT-01** | OPEN process | P3 | qa | No — add command_table + CRUD/J-* on next QA MD |

**No residual product P0** open for this L1 approve slice. P1 CREATE-CATALOG = explicit GWC condition (OK to leave open).

---

## Conditions (explicit)

1. **NOT Phase 1 DONE · NOT product UAT DONE · NOT PROD-READY** from this GWC alone.
2. Do **not** reopen **R-W4-AT12-L1-APPROVE-SCOPE** without new L1 approve 409/`x-company-id=main` FAIL evidence.
3. Do **not** invent Leave L2 PASS from this gate.
4. Do **not** wire / claim Duyệt for `ceo@` as L1 (BA EXPECTED_NO_CTA stands).
5. Do **not** seed `leave_types` to close **R-W4-AT12-L1-CREATE-CATALOG** (U65) — fix via FE catalog sync/settings path.
6. Prior R3 scope FAIL is **superseded**.
7. Do **not** reopen AT-07.

---

## Evidence-pack gate

### QA pack (entry)

```text
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-uc-tc-w4-qa-e2-hrm-at-r4-at12.md
→ FAIL 2/8 — missing command_table, crud_or_matrix
```

**PROCESS GWC** — product browser + runtime independently verified; does not demote P0 close.

### QC pack (this file)

```text
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-uc-tc-w4-qa-e2-hrm-at-r4-at12-qc.md
→ PASS exit 0 (8/8)
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-uc-tc-w4-qa-e2-hrm-at-r4-at12-qc.md --check-assets
→ PASS exit 0 · 3 PNG refs OK
```

---

## Command table (QC independent)

| Command | Result |
|---------|--------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-uc-tc-w4-qa-e2-hrm-at-r4-at12.md` | **FAIL** exit **1** · **2/8** missing command_table / crud_or_matrix (process) |
| Disk check 14 PNG under `screens/po-uc-tc-w4-qa-e2-hrm-at-r4-at12/` | **PASS** · 01..09 + create precond present |
| Runtime cross-check `_tmp-po-uc-tc-w4-qa-e2-hrm-at-r4-at12-browser.json` | **PASS** · 201 HRM-LEAVE-203 · x-company-id=trsport · f5Ok · L2 SPEC_GAP · ceo_as_l1=false |
| Spot visual `docs/qa/evidence/screens/po-uc-tc-w4-qa-e2-hrm-at-r4-at12/07-mgr-cho-duyet.png` + `docs/qa/evidence/screens/po-uc-tc-w4-qa-e2-hrm-at-r4-at12/08-mgr-after-duyet.png` + `docs/qa/evidence/screens/po-uc-tc-w4-qa-e2-hrm-at-r4-at12/09-mgr-f5.png` | **PASS** · Duyệt CTA · pending cleared / Đã duyệt 1 · catalog empty CONDITION |
| by-uc stamp `HRM-AT-12.md` | **PASS** · execution PARTIAL L1 · uat_done false |
| `node scripts/qa/_tmp-po-uc-tc-w4-qa-e2-hrm-at-r4-at12.mjs` (QA prior) | **PASS** (seat evidence; QC observe) |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-uc-tc-w4-qa-e2-hrm-at-r4-at12-qc.md` | **PASS** exit **0** (8/8) |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-uc-tc-w4-qa-e2-hrm-at-r4-at12-qc.md --check-assets` | **PASS** exit **0** |

---

## Case / journey matrix (CRUD-or-matrix)

| Case / Journey | AC | Result | Evidence |
|----------------|-----|--------|----------|
| **L0** read-only | stack health | **PASS** | hrm/xbos/portal 200 |
| **LOGIN** L1 QL | `uat.nv0002@xe.vn` manager trsport | **PASS** | runtime login_mgr · not ceo@ |
| **OPEN** leave pending | Nghỉ phép → Chờ duyệt (n) | **PASS** | `docs/qa/evidence/screens/po-uc-tc-w4-qa-e2-hrm-at-r4-at12/07-mgr-cho-duyet.png` |
| **UPDATE** approve L1 | POST 201 HRM-LEAVE-203 · x-company-id=trsport | **PASS** | Network · leaveApproveBody |
| **READ** F5 | status approved persists | **PASS** | f5Ok · `docs/qa/evidence/screens/po-uc-tc-w4-qa-e2-hrm-at-r4-at12/08-mgr-after-duyet.png` |
| **CREATE** leave (precond) | U65 FE create | **BLOCKED** CONDITION | empty leave_types · `docs/qa/evidence/screens/po-uc-tc-w4-qa-e2-hrm-at-r4-at12/09-mgr-f5.png` |
| **J-HRM-06** L2.5 | attendance leave approve path | **PASS** | this seat L1 web |
| **J-MOB-05** | mobile manager Duyệt | **prior PASS** | not reclaimed this seat |
| Leave L2 | ladder | **SPEC_GAP** | not invented |

---

## Forbidden compliance (QC)

- No seed
- No rewrite `apps/**`
- Did not invent product UAT / Phase 1 DONE
- Did not invent Leave L2 PASS
- Did not accept `ceo@` as L1 actor
- Did not GO without opening QA MD + runtime JSON + PNG spot-check
- Did not NO-GO solely on QA pack format gap or CREATE-CATALOG P1 (CONDITION OK)

---

## completion_report

**Closed:** L3 QC gate `PO-UC-TC-W4-QC-E2-HRM-AT-R4-AT12-L1` for P0 HRM-AT-12 L1 approve mutate scope. Spot-check runtime Network **201** `HRM-LEAVE-203` + **`x-company-id=trsport`** + PNG 07/08 credible. **R-W4-AT12-L1-APPROVE-SCOPE CLOSED**. Persona QL `uat.nv0002` (not ceo@). Leave L2 SPEC_GAP · AT-07 untouched. by-uc HRM-AT-12 **PARTIAL** with **`uat_done: false`**. U65 zero-seed honored.

**Residual / conditions:** **R-W4-AT12-L1-CREATE-CATALOG** P1 OPEN (do not seed); Leave L2 SPEC_GAP HOLD; HOLDING-COERCE P2 defer; QA pack format P3 process; **NOT** Phase1/UAT DONE.

**Verdict:** **GO WITH CONDITIONS**  
**next_owner:** pm  
**ack_status:** PASS_TO_PM  
**evidence_path:** `docs/qa/evidence/po-uc-tc-w4-qa-e2-hrm-at-r4-at12-qc.md`

---

## next_dispatch_prompt

```text
work_item_id: PO-UC-TC-W4-QC-E2-HRM-AT-R4-AT12-L1-PM-CLOSE
role: pm
priority: P0
entry_criteria:
  - docs/qa/evidence/po-uc-tc-w4-qa-e2-hrm-at-r4-at12-qc.md Verdict GO WITH CONDITIONS · ack_status PASS_TO_PM
  - R-W4-AT12-L1-APPROVE-SCOPE CLOSED — do not reopen without new approve scope FAIL
  - HRM-AT-12 by-uc execution PARTIAL L1 PASS / L2 SPEC_GAP; uat_done false
  - J-HRM-06 L1 web approve path PASS this slice only
action:
  1) Bus INTAKE PO-UC-TC-W4-QC-E2-HRM-AT-R4-AT12-L1 PASS_TO_PM + promote AT-12 L1 approve-scope P0 CLOSED on backlog / E2 rollup / TEAM_WORKING_NOW
  2) residual_auto_fix: schedule P1 R-W4-AT12-L1-CREATE-CATALOG via FE catalog sync/settings (cấm seed) — owner devops/settings — not blocking L1 approve GWC
  3) Continue next open PO-UC-TC / PM_OPEN_BACKLOG item (do not idle)
  4) Do NOT claim product UAT DONE / Phase 1 DONE from this GWC
  5) Do NOT invent Leave L2 PASS; do NOT wire ceo@ as L1; do NOT reopen AT-07
  6) Optional: next QA MD include command_table + CRUD/J-* (C-AT12-QA-PACK-FMT-01 P3 process)
cấm: seed leave_types · invent UAT DONE · invent Leave L2 · reopen APPROVE-SCOPE without new FAIL · ceo@ as L1
```

---

## pm_dispatch_hint

`PO-UC-TC-W4-QC-E2-HRM-AT-R4-AT12-L1-PM-CLOSE` — promote HRM-AT-12 L1 approve-scope P0 CLOSED; GWC not UAT/Phase1 DONE; CREATE-CATALOG P1 residual_auto_fix (no seed); Leave L2 SPEC_GAP untouched; next backlog.

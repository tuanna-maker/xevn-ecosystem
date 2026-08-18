# Evidence — `PO-HRM-ATT-03d-05b-QC-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-ATT-03d-05b-QC-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-05 |
| **lane** | L3 gate — narrow blueprint **FR-UC-BP-ATT-03d** (GPS work-sites) + **FR-UC-BP-ATT-05b** (leave quỹ panel) |
| **priority** | P1 |
| **portal_url** | `http://127.0.0.1:5173/hr/attendance?portal=1&tenantId=xevn&companyId=main` |
| **Verdict** | **GO WITH CONDITIONS** |
| **ack_status** | `PASS_TO_PM` |
| **entry** | QA [`po-hrm-att-03d-05b-qa-01.md`](po-hrm-att-03d-05b-qa-01.md) PASS_TO_PM |
| **runtime** | [`_tmp-po-hrm-att-03d-05b-qa-01-browser.json`](_tmp-po-hrm-att-03d-05b-qa-01-browser.json) verdict **PASS** · `attendance_closed_claim: false` |
| **be_ref** | [`po-hrm-att-03d-05b-be-01.md`](po-hrm-att-03d-05b-be-01.md) READY_FOR_QA |
| **fe_ref** | [`po-hrm-att-03d-05b-fe-01.md`](po-hrm-att-03d-05b-fe-01.md) READY_FOR_QA |
| **screens** | `docs/qa/evidence/screens/po-hrm-att-03d-05b-qa-01/01-gps-list.png` · `docs/qa/evidence/screens/po-hrm-att-03d-05b-qa-01/02-gps-after-create.png` · `docs/qa/evidence/screens/po-hrm-att-03d-05b-qa-01/03-gps-f5-after-create.png` · `docs/qa/evidence/screens/po-hrm-att-03d-05b-qa-01/04-gps-after-edit.png` · `docs/qa/evidence/screens/po-hrm-att-03d-05b-qa-01/05-gps-f5-after-edit.png` · `docs/qa/evidence/screens/po-hrm-att-03d-05b-qa-01/06-leave-panel.png` · `docs/qa/evidence/shots/po-hrm-att-03d-gps.png` · `docs/qa/evidence/shots/po-hrm-att-05b-leave-panel.png` |
| **spec_ref** | SRS v0.8 **FR-UC-BP-ATT-03d** + **FR-UC-BP-ATT-05b** · matrix 1.1.4b IN MVP · ADR-HRM-ATTENDANCE-CFG-PERSIST D3 |
| **U65** | zero-seed · QC observe-only · no `apps/**` · no `pnpm seed:*` |
| **NOT claimed** | Phase 1 DONE · product UAT DONE · PROD-READY · Attendance CLOSED · TechSpec S3 GO · Face LIVE · PROP-03e |
| **attendance_closed** | **false** (must_keep — QC does **not** invent CLOSED) |
| **uat_done** | **false** |

---

## Verdict summary

**GO WITH CONDITIONS** — bounded P1 slice only: **UF-ATT-03d** GPS work-sites CRUD (list GET 200 · POST **201** · PATCH **200** · F5 persist · DELETE 200) and **UF-ATT-05b** leave create dialog quỹ panel (single `GET …/leave-balance/panel` **200** · **5** MVP rows · honest zeros · storm=false · `leaveBalanceSingle=[]`). Corroborated by QA MD + machine JSON + PNG assets on disk. U65 zero-seed honored. BE/FE READY chain present. **Conditions** below remain open — especially **Attendance not CLOSED** and P2 devops xbos dist watch. **NOT** Phase 1 / TechSpec S3 / product GO.

---

## Entry audit (handoff chain)

| Artifact | ack / claim | QC |
|----------|-------------|-----|
| `docs/qa/evidence/po-hrm-att-03d-05b-qa-01.md` | PASS_TO_PM; UF-03d GPS CRUD+F5; UF-05b panel 200/5 MVP/no storm; U65; uat_done false; attendance_closed false | **ACCEPT** |
| `docs/qa/evidence/_tmp-po-hrm-att-03d-05b-qa-01-browser.json` | verdict PASS; POST 201; PATCH 200; panel GET 1×200; mvpRowCount=5; storm=false; pageErrors=[]; attendance_closed_claim=false | **ACCEPT** Network SoT |
| `po-hrm-att-03d-05b-be-01.md` | READY_FOR_QA; work-sites + leave-balance/panel; jest 35 PASS | **ACCEPT** upstream |
| `po-hrm-att-03d-05b-fe-01.md` | READY_FOR_QA; panel wire + GPS edit; vitest 9/9 | **ACCEPT** upstream |
| Screens 01–06 + shots | GPS CRUD sequence + leave panel | **ACCEPT** disk present |

---

## Gate AC audit (PM checklist)

| # | AC | Runtime / evidence | QC |
|---|-----|---------------------|-----|
| 1 | UF-ATT-03d GPS: POST 201 + PATCH 200 + F5 | JSON `workSitesPost` **201** · `workSitesPatch` **200** · `gps_crud.f5AfterCreate/f5AfterEdit=true` · site `860f4116-…` cleaned DELETE 200 | 🟢 **PASS** |
| 2 | UF-ATT-05b: GET leave-balance/panel 200 + 5 MVP · no storm | JSON panelGets **1×200** · mvpRows annual/seniority/compensatory/carry_over/advance · `storm=false` · `singleGetsCount=0` | 🟢 **PASS** |
| 3 | U65 zero-seed honored | QA `u65_zero_seed=true` · JSON `u65=zero-seed-browser-only` · no seed in residual | 🟢 **PASS** |
| 4 | attendance_closed=false must remain | QA flag false · JSON `attendance_closed_claim=false` · QC verdict keeps **false** | 🟢 **PASS** (honesty) |
| 5 | Residual P2 devops xbos dist as GWC condition | QA `OBS-XBOS-DIST` · nest watch Unicode path wipe dist | 🟡 **CONDITION** owner **devops** |
| 6 | L0 cited PASS | QA `qc:fe-be-health` exit ALL PASS · JSON l0 hrm/xbos/portal **200** | 🟢 **PASS** |
| 7 | NOT invent TechSpec S3 / Phase1 DONE / Attendance CLOSED | Forbidden claims absent | 🟢 **PASS** (honesty) |

---

## L2.5 J-* audit (U19)

| Journey | Scope vs this P1 | QC |
|---------|------------------|-----|
| **UF-ATT-03d** GPS work-sites (matrix 1.1.4b IN MVP) | **In-scope** fidelity L2.5-equivalent (Settings→App→GPS CRUD+F5) | **PASS** (Network + PNG 01–05) |
| **UF-ATT-05b** leave quỹ panel (matrix 1.1.4b IN MVP) | **In-scope** (Nghỉ phép → Tạo yêu cầu → panel) | **PASS** (panel GET + PNG 06) |
| **J-HRM-06** Chấm công → bản ghi / yêu cầu | Related attendance shell | **prior ✅** · **untouched** this seat |
| **J-HRM-06b** Bảng chấm công sheet | Out of this UF slice | **prior ✅** · **untouched** |
| Attendance CLOSED / Face LIVE / PROP-03e | Forbidden | **not claimed** |

Mandatory in-scope for this gate: UF-ATT-03d + UF-ATT-05b **PASS**. No invent PASS on untested mandatory J-* beyond this slice.

---

## Classification

| Class | Items |
|-------|-------|
| **PRODUCT** | GPS work-sites POST 201 / PATCH 200 / F5 / DELETE · leave-balance/panel 200 · 5 MVP zeros · no N×GET storm · pageErrors=[] |
| **PROCESS** | QA pack `verify:qc:evidence-pack` **1/8** missing `journey_l25` only — **process OBS**; product PASS independent; this QC pack targets **8/8** |
| **ENV** | QA L0 entry+exit PASS; residual **OBS-XBOS-DIST** (nest watch dist wipe on Unicode path) — **P2 CONDITION** → devops; does **not** demote product UF when L0 exit was PASS |
| **OUT-OF-SCOPE / OBS** | OBS-LEAVE-PROJECTED (dates not filled) · Face / PROP-03e · TechSpec S3 · Phase1 DONE · Attendance CLOSED |

ENV residual is **GWC condition** (owner devops), not product NO-GO for ATT-03d/05b UF. Process pack gap on QA MD does **not** demote product close.

---

## Residual

| Id | Status | Sev | Owner | Blocks this P1 GO? |
|----|--------|-----|-------|--------------------|
| UF-ATT-03d GPS CRUD+F5 | **CLOSED** this seat | — | — | No |
| UF-ATT-05b panel 5 MVP / no storm | **CLOSED** this seat | — | — | No |
| `OBS-XBOS-DIST` / `PO-HRM-ATT-03d-05b-DEVOPS-XBOS-DIST` | **CLOSED** 2026-08-05 | P2 | **devops** | Evidence `po-hrm-att-03d-05b-devops-xbos-dist-01.md` — `pnpm run dev:xbos-api:node` · `:28002` 200 · watch `deleteOutDir: false` |
| `OBS-LEAVE-PROJECTED` | OPEN OBS | P3 | qa later | No — optional AC |
| `C-ATT-03d05b-QA-PACK-FMT-01` | OPEN process | P3 | qa | No — add J-* line on next QA MD |
| Attendance CLOSED / uat_done / TechSpec S3 / Phase1 DONE / Face LIVE | — | — | — | No — **not claimed** |

**No residual product P0/P1 FAIL** for this ATT-03d/05b slice. GWC conditions = honesty + devops P2 + process OBS.

---

## Conditions (explicit)

1. **NOT Phase 1 DONE · NOT product UAT DONE · NOT PROD-READY · NOT TechSpec S3 GO** from this GWC alone.
2. **Do not** stamp Attendance menu **CLOSED** — `attendance_closed` **must remain false**.
3. **Do not** invent Face LIVE / PROP-03e / PAY unsigned sheet as LIVE.
4. **P2 devops** — `OBS-XBOS-DIST`: document/runbook fix for `nest start --watch` wiping `xbos-api/dist` on Unicode path; prefer `tsc -p tsconfig.build.json` then `node dist/main.js` when `:28002` ECONNREFUSED.
5. OBS-LEAVE-PROJECTED stays optional — not UF-05b NO-GO.
6. U65: **no seed** in acceptance path.
7. QA pack format 1/8 (`journey_l25`) remains **CONDITION (process)** — not product NO-GO.

---

## Evidence-pack gate

### QA pack (entry)

```text
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-att-03d-05b-qa-01.md
→ FAIL 1/8 — missing journey_l25
```

**PROCESS GWC** — product browser + runtime independently verified; does not demote P1 ATT-03d/05b close.

### QC pack (this file)

```text
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-att-03d-05b-qc-01.md
→ PASS exit 0 (8/8)
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-att-03d-05b-qc-01.md --check-assets
→ PASS exit 0 · 8 PNG refs OK
```

---

## Command table (QC independent)

| Command | Result |
|---------|--------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-att-03d-05b-qa-01.md` | **FAIL** exit **1** · **1/8** missing `journey_l25` (process) |
| Disk check PNG screens 01–06 + shots | **PASS** · all present |
| Runtime cross-check `_tmp-po-hrm-att-03d-05b-qa-01-browser.json` | **PASS** · POST 201 · PATCH 200 · panel 1×200 · mvp=5 · storm=false · attendance_closed_claim=false |
| Spot visual `docs/qa/evidence/screens/po-hrm-att-03d-05b-qa-01/01-gps-list.png` | **PASS** disk |
| Spot visual `docs/qa/evidence/screens/po-hrm-att-03d-05b-qa-01/04-gps-after-edit.png` | **PASS** disk |
| Spot visual `docs/qa/evidence/screens/po-hrm-att-03d-05b-qa-01/06-leave-panel.png` | **PASS** disk |
| BE/FE READY chain | **PASS** cited |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-att-03d-05b-qc-01.md` | **PASS** exit **0** (8/8) |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-att-03d-05b-qc-01.md --check-assets` | **PASS** exit **0** · 8 PNG OK |

---

## Case / journey matrix (CRUD-or-matrix)

| Case / Journey | AC | Result | Evidence |
|----------------|-----|--------|----------|
| **L0** | stack health entry+exit | **PASS** | QA qc:fe-be-health · JSON l0 200 |
| **LOGIN** | `ceo@xe.vn` company_id=main | **PASS** | browser login http 201 |
| **CREATE** UF-ATT-03d | POST work-sites **201** · FE row | **PASS** | JSON + PNG 02 |
| **UPDATE** UF-ATT-03d | PATCH **200** · radius FE · F5 | **PASS** | JSON + PNG 04/05 |
| **DELETE** UF-ATT-03d | DELETE **200** · F5 gone | **PASS** | JSON + QA row |
| **READ** UF-ATT-05b | panel GET **200** · 5 MVP · no storm | **PASS** | JSON + PNG 06 |
| **J-HRM-06** | related shell | **prior ✅** | untouched |
| Attendance CLOSED / TechSpec S3 / Phase1 | Forbidden | **not claimed** | attendance_closed=false |

---

## Forbidden compliance (QC)

- No seed (U65)
- No rewrite `apps/**`
- Did **not** invent Attendance CLOSED / flip `attendance_closed` true
- Did **not** invent TechSpec S3 GO / Phase 1 DONE / product UAT DONE
- Did **not** invent Face LIVE / PROP-03e
- Did **not** NO-GO solely on QA pack `journey_l25` gap or OBS projected leave
- Did **not** GO without opening QA MD + runtime JSON + PNG disk check
- Did keep P2 devops xbos dist as **explicit GWC condition**

---

## completion_report

**Closed:** L3 QC gate for `PO-HRM-ATT-03d-05b-QC-01` — **GO WITH CONDITIONS**. Product UF-ATT-03d (GPS POST 201 / PATCH 200 / F5 / DELETE) + UF-ATT-05b (panel GET 200 / 5 MVP / no storm) ACCEPT under U65. `attendance_closed=false` preserved. BE/FE READY chain ACCEPT.

**Open (conditions):** P2 devops `OBS-XBOS-DIST`; OBS projected leave; QA pack process `journey_l25`; Attendance module UAT / CLOSED / TechSpec S3 / Phase1 — **not** claimed.

## next_owner

**pm** (dispatch devops residual + next ATT/PCOMP backlog)

## next_dispatch_prompt

```text
work_item_id: PO-HRM-ATT-03d-05b-DEVOPS-XBOS-DIST
from_role: pm
to_role: devops
lane: execution
priority: P2

INTAKE: QC GWC PO-HRM-ATT-03d-05b-QC-01 — product UF-ATT-03d/05b ACCEPT; residual ENV P2.
evidence_path: docs/qa/evidence/po-hrm-att-03d-05b-qc-01.md
Condition: nest start --watch + Unicode path can wipe apps/api/xbos-api/dist before emit → :28002 ECONNREFUSED.
Action: Document/runbook — prefer `tsc -p tsconfig.build.json` then `node dist/main.js` for local xbos-api; optional watch fix; no seed; do NOT reopen ATT-03d/05b product UF.
exit: evidence note + PASS_TO_PM; PM then continue ATT/PCOMP backlog — cáº¥m invent Attendance CLOSED / TechSpec S3 / Phase1 DONE.
```

## ack_status

**PASS_TO_PM**

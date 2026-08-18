# Evidence — PO-HRM-MVP-GD1-REC-02-CLUSTER-QA-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-REC-02-CLUSTER-QA-01` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89) |
| **lane** | execution · **qa** |
| **Date** | 2026-08-09 |
| **stamp** | **REC02QA-MSKV6ETH** |
| **ack_status** | **PASS_TO_PM** (PASS_WITH_OBS) |
| **uc_ids** | `UC-BP-REC-02` · `UC-BP-REC-02b` |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `companyId=main` |
| **Honesty** | `recruitment_uat_ready=false` · **C-SLICE-≠-MODULE** · U65 zero-seed |
| **depends_on** | BE-01 READY (jest 108) · FE-01 READY_FOR_QA (vitest 72) |
| **env** | portal `:5173` · hrm-api `:28001` (rebuild+restart — stale dist cleared) · commit `dc930c5` |
| **runner** | `scripts/qa/_tmp-po-hrm-mvp-gd1-rec-02-cluster-qa-01.mjs` |
| **raw JSON** | `docs/qa/evidence/_tmp-po-hrm-mvp-gd1-rec-02-cluster-qa-01.json` |
| **screens** | `docs/qa/evidence/screens/po-hrm-mvp-gd1-rec-02-cluster-qa-01/` |

---

## spec_read_ack

| Artifact | Cite |
|----------|------|
| **ba** | `PO-HRM-MVP-GD1-REC-02-CLUSTER-BA-01.md` O1–O5 · VAL-01..18 · AC-REC-YCTD-02* / 02b* · Diễn biến FE §3.4 / §4.4 |
| **api** | `PO-HRM-MVP-GD1-REC-02-CLUSTER-API-01.md` F-REC-YCTD-01..04 · HRM-YCTD-* · SHORT\|LONG |
| **be** | `docs/qa/evidence/po-hrm-mvp-gd1-rec-02-cluster-be-01.md` |
| **fe** | `docs/qa/evidence/po-hrm-mvp-gd1-rec-02-cluster-fe-01.md` |
| **uc_ids** | UC-BP-REC-02 · UC-BP-REC-02b |

**cấm respected:** no `pnpm seed:*` · no API fake inbox · no DB mutate · no honesty flip · no Nest `/rec` dual claim · no module REC UAT claim (C-SLICE).

---

## L0

| Check | Result |
|-------|--------|
| `qc:dev-stack` | hrm-api **200** · xbos **200** · portal `:5173` **200** |
| Dist freshness | SRC newer than DIST at intake → **rebuild** `pnpm --filter hrm-api run build` + restart `dist/main` → **STALE_DIST=NO** |
| Verdict | 🟢 **PASS** |

---

## L1 / API spot (U65: probe only — UF verdicts from browser)

| AC / probe | Before → Action | Network | After | Verdict |
|------------|-----------------|---------|-------|---------|
| **CREATE out_of_plan** | — → POST `/recruitment/requisitions` mode=out + reason + hire=new | **201** `HRM-REC-201` | `status=draft` (**not** open) | 🟢 |
| **OUT-REASON** | draft without reason → submit-workflow | create 201 · submit **400** `HRM-YCTD-OUT-REASON` | form not receivable | 🟢 |
| **CREATE in_plan** | free `need_hire_approved` cell · **omit** `target_month` | **201** `HRM-REC-201` | `status=draft` · mode=in_plan | 🟢 RETEST |
| **O2 CELL-QTY** | in_plan headcount=999 vs cell cap | **409** `HRM-YCTD-CELL-QTY` | VI gợi ý ngoài ĐB | 🟢 |
| **SUBMIT matrix** | draft → submit-workflow | **201** `HRM-REC-WF-200` | `pending_approval` · out **`hrm_requisition_long_bod`** · in RETEST **`hrm_requisition_short`** | 🟢 |
| **TRANSITION approve** | pending out + `bod_complete` | **201** `HRM-REC-200` | `open_for_hire` | 🟢 |
| **PIPELINE flags gate** | PATCH flags on draft | **409** `HRM-YCTD-BOD-REQUIRED` | no receivable | 🟢 |
| **PIPELINE flags OK** | PATCH on `open_for_hire` | **200** `HRM-REC-200` | `posted=true` · `cv_intake_allowed=true` · **no Campaign** | 🟢 |
| **O4 MODE-UNCLASSIFIED** | legacy NULL mode row → PATCH flags | **409** `HRM-YCTD-MODE-UNCLASSIFIED` | CV/flags blocked | 🟢 |
| **U19 scope_parity** | list → get same id `company_id=main` | list/get **200** · inList | same resolver | 🟢 |
| **DENY Nest `/rec`** | GET `/api/hrm/rec/recruitment-requests` | **404** `HRM-DATA-404` | no dual controller | 🟢 |
| **SPAWN-DUP RETAIN** | manual in_plan on occupied cell | **409** `HRM-YCTD-SPAWN-DUP` | REC-01 UQ | 🟢 |

### L1 note — initial `CREATE_IN` 500

First L1 pass sent `target_month: "8"` → **500** `HRM-SYS-001` `invalid input syntax for type date: "8"`.  
**RETEST** omit `target_month` → **201 draft**. Same 500 with `target_month=2026-08` (DATE column). FE create path omits field → browser 🟢. Residual **P2 OBS** below — **not** UF blocker.

---

## U65 browser journeys

Persona: login API inject portal auth · URL `http://127.0.0.1:5173/hr/recruitment?portal=1&tenantId=xevn&companyId=main&tab=…`

### J-HRM-REC-YCTD-02 (in_plan) — 🟢

| Step | Evidence |
|------|----------|
| Before | Tab Yêu cầu · rows visible · click **Thêm yêu cầu** |
| Action | mode **Trong định biên** · cell `f447d354-…` · hire **Tuyển mới** · JD picker · title `QA FE IN REC02QA-MSKV6ETH` → **Lưu** |
| Network | POST `/api/hrm/recruitment/requisitions` → **201** |
| FE after 2xx | Row/title visible · post-create **Gửi duyệt QT** strip |
| Gửi duyệt | POST `…/submit-workflow` → **201** · status chờ duyệt · **không** chip nhận hồ sơ |
| F5 | Title + mode Trong ĐB persist |
| spec_ref | BA AC-REC-YCTD-02 / 02b / 02c · API F-REC-YCTD-01 · Diễn biến §3.4 #1–4 |

### J-HRM-REC-YCTD-02b (out_of_plan) — 🟢

| Step | Evidence |
|------|----------|
| Action | mode **Ngoài định biên** · `yctd-long-matrix-hint` **visible** · `out_of_plan_reason` · hire new · JD · **Lưu** |
| Network | POST requisitions → **201** draft |
| FE after 2xx | Ngoài ĐB + reason · pipeline flags **not** succeeding on non-receivable (`flagsBlockedUi=true`) |
| Gửi / F5 | pending path · title+reason persist F5 |
| Approve UI | Detail transition CTA not always mounted when still draft/pending without deep open — **L1 transitions** proved approve→`open_for_hire` with BOD |
| spec_ref | BA AC-REC-YCTD-02b-01..04 · BR-BP-HC-06 · API F-REC-YCTD-02/03 |

### O4 classify banner — 🟢

- Legacy NULL `headcount_mode` rows in list: **14**
- List `data-testid=yctd-classify-banner` **visible**
- L1 flags on legacy → **409** `HRM-YCTD-MODE-UNCLASSIFIED`

### O5 proposals tab — 🟢

- `yctd-proposals-deprecate-banner` + redirect CTA **present**
- Click CTA → **0** successful POST to proposals create (no dual persist)
- Opens YCTD out_of_plan path (FE redirect)

### must_keep regression — 🟢

| Item | Result |
|------|--------|
| **UF-HRM-12** | Create + **Gửi duyệt QT** surface present |
| **J-HRM-JD-YCTD-01** | JD soft-bind picker used on create (label returned) |
| **REC-01 Định biên** | Tab headcount / grid or Cần tuyển panel load |
| **SPAWN UQ** | L1 **409** SPAWN-DUP |
| **XBOS submit-workflow** | Browser + L1 **201** `HRM-REC-WF-200` |
| Nest `/rec` dual | **404** |

---

## Residual / OBS

| ID | Sev | Item | Owner |
|----|-----|------|-------|
| **R-REC-02-TARGET-MONTH-DATE** | P2 OBS | `target_month` string (month int / `YYYY-MM`) → **500** DATE cast; FE omits → OK. Coerce first-of-month or **400** VAL. | **dev-be** (non-blocking) |
| Honesty | — | `recruitment_uat_ready` stays **false** · **C-SLICE** | PM/QC |
| R-REC-02-CELL-PICKER | defer | in_plan cell still text input (FE residual) | FE follow-up |

**DENY:** flip recruitment UAT · claim module REC DONE · Nest `/rec` greenfield.

---

## Completion contract

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** |
| **overall** | **PASS_WITH_OBS** |
| **next_owner** | **qc** |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-rec-02-cluster-qa-01.md` |
| **completion_report** | L0 rebuild+restart PASS. L1: draft create (not open) · OUT-REASON 400 · CELL-QTY 409 · submit pending + SHORT/LONG matrix · transitions→open_for_hire · flags gate/OK · O4 MODE-UNCLASSIFIED · scope_parity · Nest /rec 404 · SPAWN-DUP. U65 browser J-HRM-REC-YCTD-02/02b PASS (Lưu 201→Gửi→F5) · O4 banner · O5 redirect-only · must_keep UF-HRM-12/JD/Định biên. OBS P2 target_month DATE 500. Honesty false · C-SLICE · zero-seed. |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-REC-02-CLUSTER-QC-01
lane: governance · qc
program: PO-HRM-MVP-GD1-CONTINUOUS (U89)
uc_ids: UC-BP-REC-02 · UC-BP-REC-02b
depends_on: QA-01 PASS_TO_PM stamp REC02QA-MSKV6ETH
entry_criteria: evidence docs/qa/evidence/po-hrm-mvp-gd1-rec-02-cluster-qa-01.md · raw JSON _tmp-po-hrm-mvp-gd1-rec-02-cluster-qa-01.json · BE/FE evidence seals
MISSION — narrow GWC on REC-02 Option A slice:
1) Audit L1 tokens: draft≠open · HRM-YCTD-CELL-QTY · OUT-REASON · SHORT/LONG matrix · open_for_hire transitions · pipeline-flags · O4 MODE-UNCLASSIFIED · Nest /rec 404 · SPAWN-DUP
2) Audit U65 J-HRM-REC-YCTD-02 / 02b click paths + F5 · O4 banner · O5 no dual persist
3) Condition list: R-REC-02-TARGET-MONTH-DATE P2 OBS (non-blocking) · honesty recruitment_uat_ready=false LOCKED · C-SLICE-≠-MODULE
4) DENY: flip UAT · module REC GO · Nest /rec dual
exit: GO WITH CONDITIONS or GO · evidence docs/qa/evidence/po-hrm-mvp-gd1-rec-02-cluster-qc-01.md · PASS_TO_PM
```

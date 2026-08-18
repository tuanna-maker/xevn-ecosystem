# Evidence — PO-HRM-MVP-GD1-REC-02-BOD-CHAIN-QA-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-REC-02-BOD-CHAIN-QA-01` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89) |
| **lane** | execution · **qa** |
| **Date** | 2026-08-09 |
| **stamp** | **REC02BODQA-MSKWIO4O** |
| **ack_status** | **FAIL_TO_PM** |
| **overall** | **FAIL** (1 P0 — ALT-01 reject) |
| **uc_ids** | `UC-BP-REC-02` · `UC-BP-REC-02b` |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · scope rollup → `company_id=holding` on mutate |
| **Honesty** | `recruitment_uat_ready=false` · **C-SLICE-≠-MODULE** · U65 zero-seed |
| **depends_on** | BOD-CHAIN-FE-01 READY_FOR_QA (vitest 75) |
| **env** | portal `:5173` · hrm-api `:28001` · STALE_DIST=NO · commit from runner |
| **runner** | `scripts/qa/_tmp-po-hrm-mvp-gd1-rec-02-bod-chain-qa-01.mjs` |
| **raw JSON** | `docs/qa/evidence/_tmp-po-hrm-mvp-gd1-rec-02-bod-chain-qa-01.json` |
| **screens** | `docs/qa/evidence/screens/po-hrm-mvp-gd1-rec-02-bod-chain-qa-01/` |

---

## spec_read_ack

| Artifact | Cite |
|----------|------|
| **fe handoff** | `docs/qa/evidence/po-hrm-mvp-gd1-rec-02-bod-chain-fe-01.md` |
| **qc remain** | `docs/qa/evidence/po-hrm-mvp-gd1-rec-02-cluster-qc-01.md` — AC-02d · 02b-05 · ALT-01/02 · CELL-PICKER |
| **ba** | `docs/program/specs/PO-HRM-MVP-GD1-REC-02-CLUSTER-BA-01.md` AC-REC-YCTD-02d · 02b-05 · ALT-01/02 |
| **api** | `docs/program/specs/PO-HRM-MVP-GD1-REC-02-CLUSTER-API-01.md` F-REC-YCTD-03 transitions · SHORT/LONG · bod_complete |
| **uc_ids** | UC-BP-REC-02 · UC-BP-REC-02b |

**cấm respected:** no `pnpm seed:*` · no API fake inbox · no DB mutate · no honesty flip · no Nest `/rec` dual · no module REC UAT claim.

---

## L0

| Check | Result |
|-------|--------|
| `qc:dev-stack` | hrm-api **200** · xbos **200** · portal `:5173` **200** |
| Dist freshness | SRC ≤ DIST · **STALE_DIST=false** (no rebuild required) |
| Verdict | 🟢 **PASS** |

---

## U65 browser — per-UF blocks

Persona: login API inject portal auth · URL `http://127.0.0.1:5173/hr/recruitment?portal=1&tenantId=xevn&companyId=main&tab=…`

### AC-02d — in_plan SHORT → Duyệt → open_for_hire + F5 — 🟢

| Step | Evidence |
|------|----------|
| Path | **existing_pending** (free `need_hire_approved` cells = 0 / SPAWN occupied; zero-seed — used prior FE row `QA FE IN REC02QA-MSKV6ETH`) |
| Before | List YCTD · status chờ duyệt · mode Trong ĐB |
| Action | **Chi tiết** → `yctd-approval-chain` **SHORT** → **Duyệt → mở nhận hồ sơ** |
| Network | POST `…/transitions` → **201** |
| FE after 2xx | Status / hint **Mở nhận hồ sơ** · chain complete |
| F5 | Re-open Chi tiết → **Mở nhận hồ sơ** persists |
| Verdict | 🟢 |
| spec_ref | BA AC-REC-YCTD-02d · API F-REC-YCTD-03 SHORT |

### AC-02b-05 — out_of_plan TP/HR → approved (CV blocked) → BOD → open_for_hire — 🟢

| Step | Evidence |
|------|----------|
| Before | Thêm YCTD · mode **Ngoài định biên** · LONG hint visible |
| Action | Lưu → Gửi duyệt → Chi tiết LONG + BOD block → **Duyệt (TP/HR)** |
| Network | POST requisitions **201** · submit-workflow **201** · transitions TP/HR **201** |
| FE after TP/HR | status approved path · **`yctd-bod-blocked-cv` / pipeline blocked** still on · F5 still blocked |
| BOD | **BOD duyệt → mở nhận hồ sơ** → transitions **201** → open_for_hire · F5 open |
| Verdict | 🟢 |
| spec_ref | BA AC-REC-YCTD-02b-05 · API bod_complete only on BOD step |

### ALT-01 — Từ chối + lý do → detail reason + F5 — 🔴

| Step | Evidence |
|------|----------|
| Before | Create out_of_plan + Gửi duyệt → pending |
| Action | Chi tiết → nhập `yctd-reject-reason` → **Từ chối** |
| Network | POST `…/transitions` action reject → **500** `HRM-SYS-001` `could not determine data type of parameter $2` |
| FE after | **no** `yctd-detail-rejected-reason` · status remains pending |
| F5 | reason panel absent |
| Verdict | 🔴 |
| Root cause | BE `recruitment.service.ts` reject UPDATE binds `values=[reason, actorId, id]` but SQL only uses `$1` + `$3::uuid` — **unused `$2`** → PG type error |
| Owner | **dev-be** · defect `R-REC-02-ALT-01` |
| spec_ref | BA AC-REC-YCTD-02-ALT-01 · API reject + rejected_reason |

### ALT-02 — hire_reason=replace → detail replace employee + F5 — 🟢

| Step | Evidence |
|------|----------|
| Action | Thêm out_of_plan · hire **Thay thế** · CatalogSearchPicker NV · Lưu |
| Network | POST requisitions **201** |
| FE after 2xx | Chi tiết `yctd-detail-replace-employee` visible (UAT NV 0100) |
| F5 | replace employee label persists |
| Verdict | 🟢 |

### CELL-PICKER — human-readable picker + deep-link — 🟢

| Step | Evidence |
|------|----------|
| Action | Thêm in_plan → `yctd-headcount-cell-id` = **button combobox** (not raw Input) · pick option |
| FE | Label human: `Vận hành · Giám đốc Nhân sự · T8/2026 · SL 8…` · mono id under picker |
| Deep-link | `?headcount_mode=in_plan&headcount_cell_id=0402ba25-…` presets cell + mode |
| Verdict | 🟢 · closes `R-REC-02-CELL-PICKER` for this slice |

### must_keep regression — 🟢

| Item | Result |
|------|--------|
| **O4** classify banner | nullModeRows=14 · `yctd-classify-banner` visible |
| **O5** proposals | deprecate banner + redirect CTA · **0** dual POST proposals |
| **UF-HRM-12** | create + submit surface present |
| **JD soft FK** | JD picker used on create flows |
| **REC-01 Định biên** | headcount / Cần tuyển panel load |
| **no Campaign** | 0 successful Campaign POSTs |
| Nest `/rec` dual | GET → **404** `HRM-DATA-404` |

---

## Deferred (NOT FAIL)

| Item | Note |
|------|------|
| **ALT-03** CFG BOD on in_plan | Recorded — not exercised as FAIL |
| **Full XBOS multi-actor inbox** | Recorded — FE transitions secondary path only |

---

## Residual / defects

| ID | Sev | Item | Owner |
|----|-----|------|-------|
| **R-REC-02-ALT-01** | **P0** | Reject transitions **500** HRM-SYS-001 — unused `$2` actorId in reject UPDATE values | **dev-be** |
| Honesty | — | `recruitment_uat_ready` stays **false** · C-SLICE | PM/QC |

**PASS rows (retain):** AC-02d · AC-02b-05 · ALT-02 · CELL-PICKER · O4/O5/must_keep · Nest `/rec` 404

**DENY:** flip recruitment UAT · claim module REC DONE · Nest `/rec` greenfield · seed to invent reject success.

---

## Completion contract

| Field | Value |
|-------|--------|
| **ack_status** | **FAIL_TO_PM** |
| **overall** | **FAIL** (ALT-01 P0 only) |
| **next_owner** | **dev-be** |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-rec-02-bod-chain-qa-01.md` |
| **completion_report** | U65 browser BOD-chain: AC-02d SHORT approve→open_for_hire+F5 PASS (existing pending FE row); AC-02b-05 TP/HR→approved+CV blocked+F5 then BOD→open_for_hire+F5 PASS; ALT-02 replace detail+F5 PASS; CELL-PICKER combobox+deep-link PASS; must_keep O4/O5/UF-12/JD/Định biên/no Campaign PASS. **ALT-01 FAIL** reject POST 500 HRM-SYS-001 (BE unused $2). Honesty false · C-SLICE · zero-seed. |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-REC-02-BOD-CHAIN-BE-ALT01-01
lane: execution · dev-be
program: PO-HRM-MVP-GD1-CONTINUOUS (U89)
uc_ids: UC-BP-REC-02 · UC-BP-REC-02b
depends_on: QA BOD-CHAIN-QA-01 FAIL_TO_PM stamp REC02BODQA-MSKWIO4O · defect R-REC-02-ALT-01
entry_criteria: evidence docs/qa/evidence/po-hrm-mvp-gd1-rec-02-bod-chain-qa-01.md · raw JSON _tmp-po-hrm-mvp-gd1-rec-02-bod-chain-qa-01.json
MISSION — fix reject YCTD transitions 500:
1) recruitment.service.ts reject UPDATE: values include unused $2 actorId while SQL uses only $1 reason + $3::uuid id → PG "could not determine data type of parameter $2"
2) Fix: drop unused actorId from values OR bind $2 explicitly; keep rejected_reason persist + RETURNING
3) Jest regression: reject pending → 2xx status=rejected + rejected_reason; must_keep approve SHORT/LONG bod_complete
4) DENY: seed · honesty flip · Nest /rec dual · module REC UAT
exit: READY_FOR_QA · evidence docs/qa/evidence/po-hrm-mvp-gd1-rec-02-bod-chain-be-alt01-01.md
then: re-dispatch qa BOD-CHAIN-QA-02 for ALT-01 only + must_keep smoke
```

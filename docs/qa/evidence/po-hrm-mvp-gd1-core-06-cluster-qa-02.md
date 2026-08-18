# Evidence — PO-HRM-MVP-GD1-CORE-06-CLUSTER-QA-02

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-CORE-06-CLUSTER-QA-02` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89 · UC-BP-CORE-06) |
| **lane** | execution · **qa** |
| **Date** | 2026-08-09 |
| **stamp** | `CORE06QA2-MSLI95K8` |
| **ack_status** | **PASS_TO_PM** |
| **overall** | **PASS** |
| **uc_ids** | `UC-BP-CORE-06` |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `companyId=main` · emp `2b4cbc90-fb74-4a2d-9fef-d188d4e48d61` |
| **Honesty** | `hrm_personnel_uat_ready=false` · `contracts_printable_ready=false` · `recruitment_uat_ready=false` · `jd_dynamic_done=false` · **C-SLICE-≠-MODULE** · soft≠CORE-06 DONE · U65 zero-seed |
| **depends_on** | BE-02 READY `CORE06BE2-MSLI26NR` · prior FAIL `CORE06QA1-MSLHUNCJ` · FE-01 READY · API-01 CONFIRMED · `CORE05QC1-MSLGVT40` · Nest `/core` DENY |
| **env** | portal `:8080` (5173 down) · hrm-api `:28001` · xbos `:28002` · commit `dc930c5` |
| **runner** | `scripts/qa/_tmp-po-hrm-mvp-gd1-core-06-cluster-qa-02.mjs` |
| **raw JSON** | `docs/qa/evidence/_tmp-po-hrm-mvp-gd1-core-06-cluster-qa-02.json` |
| **screens** | `docs/qa/evidence/screens/po-hrm-mvp-gd1-core-06-cluster-qa-02/` |

---

## Verdict

| Gate | Result |
|------|--------|
| **Overall** | **PASS** · `PASS_TO_PM` · **C-SLICE** · **DENY** claim CORE-06/07/PAY DONE · **DENY** honesty flip · **DENY** seed |
| **L0** | hrm **200** · xbos **200** · portal `:8080` **302** (ok) |
| **L2.5 J-*** | **J-01 PASS** · **J-02 PASS** · **J-03 PASS** · **J-04 PASS** · **J-05 PASS** |
| **P0 CLOSED** | **R-CORE-06-STATUS-QUERY-400** — `GET …/assets?status=assigned` → **200** `HRM-EMP-PROFILE-200` (was 400 VAL-001) |
| **P0/P1 CLOSED** | **R-CORE-06-CLOSED-FE-STALE** — `data-asset-checklist-closed=1` · count=0 · closed badge + empty after assigned=0 |
| **Nest `/core` AST/TERM** | probe **404** · Network SoT non-404 **= 0** |
| **Seed** | **none** (FE Thêm cấp phát for fixture) |

---

## Spec / seal cite

| Artifact | Cite |
|----------|------|
| BA-01 | AC-CORE-06-* · J-HRM-CORE-06-01..05 |
| API-01 | F-CORE-AST-02 PATCH soft-return/lost · R-CORE-06-TERM-CHK-01 · R-CORE-06-CLOSED-01 FE-derive |
| BE-02 | `docs/qa/evidence/po-hrm-mvp-gd1-core-06-cluster-be-02.md` · stamp **`CORE06BE2-MSLI26NR`** |
| FE-01 | `docs/qa/evidence/po-hrm-mvp-gd1-core-06-cluster-fe-01.md` READY |
| QA-01 FAIL | stamp **`CORE06QA1-MSLHUNCJ`** — retest closed |
| CORE-05 QC | **`CORE05QC1-MSLGVT40`** RETAIN · QA **`CORE05QA2-MSLGSWSF`** |
| CORE-03/02b/09d..01 | peer stamps RETAIN · **not reopened** |
| CORE-07 | board **QUEUED** · **DENY** invent DONE |
| PAY-07 | **OUT invent DONE** this seat |

**Dist LIVE:** DTO `status` whitelist + `listAssets` SQL filter present (`dist_status_whitelist` · `dist_status_sql_filter`).

---

## Browser U65 — journeys

Persona: portal auth inject · Profile `/hr/employees/{id}?tab=assets` · **zero-seed**.

**hdsd_align:** Hồ sơ NV → tab **Tài sản** → Checklist thu hồi → **Tải đang giữ** / **Thu hồi** / **Ghi mất** · hooks `hdsd-emp-assets-return-checklist*`.

| J-* | Click path / assert | Network / FE | Verdict |
|-----|---------------------|--------------|---------|
| **J-HRM-CORE-06-01** | **Tải đang giữ** | GET `…/assets?status=assigned` → **200** `HRM-EMP-PROFILE-200` · rows all `assigned` · soft≠DONE footer · Nest `/core` **0** | **PASS** |
| **J-HRM-CORE-06-02** | Checklist **Ghi mất** (+ notes) → F5 | PATCH **200** `status=lost` · prior soft-return **returned** · footer `data-honesty-soft-ne-done=1` | **PASS** |
| **J-HRM-CORE-06-03** | Clear assigned → closed badge | assigned API **0** · GET load **200** · `data-asset-checklist-closed=1` · count=0 · closed badge + empty | **PASS** |
| **J-HRM-CORE-06-04** | Partial thu 1 row | PATCH **200** `returned`+`return_date` · closed=`0` · open badge · remaining ≥1 | **PASS** |
| **J-HRM-CORE-06-05** | Nest deny · seals · honesty | nest SoT=0 · DELETE **409** `HRM-EMP-ASSET-DELETE-FORBIDDEN` · serial **409** `HRM-EMP-ASSET-SERIAL-CONFLICT` · BB CTA + add alive · CORE-07 QUEUED · honesty false | **PASS** |

Screens: `01-assets-tab` … `09-done`.

---

## AC map

| AC | Result |
|----|--------|
| **AC-CORE-06-01/03** checklist GET assigned (TERM-CHK) | **PASS** — status query **200** |
| **AC-CORE-06-≠-SOFT-DONE** footer | **PASS** (J-02) |
| **AC-CORE-06-05/06** closed FE-derive | **PASS** (J-03 closed=`1`) |
| **AC-CORE-06-07** lost + notes stub | **PASS** (J-02) |
| **AC-CORE-06-08** partial | **PASS** (J-04) |
| **Nest `/core` DENY** | **PASS** (J-05) |
| **must_keep CORE-05** BB/serial/DELETE-FORBIDDEN | **PASS** (J-05) |
| **CORE-07 / PAY OUT invent DONE** | **PASS** cite QUEUED |
| **Honesty / C-SLICE** | **PASS** (false · no flip) |

---

## Residuals / defects

| ID | Sev | Owner | Note |
|----|-----|-------|------|
| **R-CORE-06-STATUS-QUERY-400** | **CLOSED** | qa | Closed by BE-02 `CORE06BE2-MSLI26NR` · J-01 retest 200 |
| **R-CORE-06-CLOSED-FE-STALE** | **CLOSED** | qa | J-03 closed=`1` after assigned=0 + GET status=assigned 2xx |
| **R-CORE-06-HONESTY** | INFO | **qc** | C-SLICE · soft≠CORE-06 DONE · CORE-05≠personnel · CORE-07/PAY QUEUED · **DENY** claim CORE-06 DONE |

**OBS:** J-03 clear loop used FE return + API assist for leftover assigned before closed assert (`feClearedAll=false` · loops=1) — closed badge still derived correctly after GET assigned **200**.

---

## Honesty footer

```text
recruitment_uat_ready=false
jd_dynamic_done=false
contracts_printable_ready=false
hrm_personnel_uat_ready=false
personnel / CORE / CTR module UAT = false
C-SLICE ≠ module CORE UAT
U65 zero-seed · Nest /core AST/TERM dual DENY
DENY invent CORE-06/07 / PAY DONE
DENY soft Profile alone = CORE-06 DONE
DENY claim CRUD slice = CORE-06 DONE
CORE-07 remain QUEUED
R-CORE-06-STATUS-QUERY-400 CLOSED
R-CORE-06-CLOSED-FE-STALE CLOSED
```

---

## Completion contract

| Field | Value |
|-------|--------|
| **completion_report** | U65 browser retest J-HRM-CORE-06-01..05 after BE-02: **PASS** overall. **J-01 PASS** GET `?status=assigned` **200** (P0 CLOSED). **J-03 PASS** `data-asset-checklist-closed=1`. Spot J-02/04/05 PASS (lost/return, partial, Nest0, CORE-05 seals, soft≠DONE). Honesty false · C-SLICE · no seed · **DENY** invent CORE-06/07/PAY DONE · sealed J-* not reopened. |
| **next_owner** | **qc** |
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-core-06-cluster-qa-02.md` |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-CORE-06-CLUSTER-QC-01
lane: governance · qc
program: PO-HRM-MVP-GD1-CONTINUOUS (U89)
uc_ids: UC-BP-CORE-06
depends_on: QA-02 PASS CORE06QA2-MSLI95K8 · docs/qa/evidence/po-hrm-mvp-gd1-core-06-cluster-qa-02.md · BE-02 CORE06BE2-MSLI26NR · FE-01 READY · API-01 CONFIRMED · CORE05QC1-MSLGVT40 · Nest /core DENY
entry_criteria: QA J-01..05 PASS · P0 STATUS-QUERY-400 CLOSED · CLOSED-FE-STALE CLOSED · honesty false · C-SLICE
mission: Gate GO/GWC CORE-06 cluster slice — audit evidence browser U65; verify Nest /core SoT=0; soft≠DONE footer; DENY invent CORE-06/07/PAY DONE · honesty flip · seed · reopen sealed J-HRM-CORE-05/03/02B/09D..01; residual R-CORE-06-HONESTY INFO only
exit_criteria: evidence docs/qa/evidence/po-hrm-mvp-gd1-core-06-cluster-qc-01.md · GO|GWC|NO-GO · stamp · next_dispatch_prompt (peer vertical / residual per U88)
cấm: pnpm seed:* · Nest /core SoT · claim CORE-06 module DONE · honesty flip · reopen sealed J-*
```

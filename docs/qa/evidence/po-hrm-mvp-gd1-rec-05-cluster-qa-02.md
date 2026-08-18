# Evidence — PO-HRM-MVP-GD1-REC-05-CLUSTER-QA-02

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-REC-05-CLUSTER-QA-02` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89 · Wave-7 seat #9) |
| **lane** | execution · **qa** |
| **Date** | 2026-08-09 |
| **stamp** | `REC05QA2-MSL31GG0` |
| **ack_status** | **PASS_TO_PM** |
| **overall** | **PASS_WITH_OBS** |
| **uc_ids** | `UC-BP-REC-05` |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `companyId=main` |
| **Honesty** | `recruitment_uat_ready=false` · `jd_dynamic_done=false` · **C-SLICE-≠-MODULE** · U65 zero-seed |
| **depends_on** | BE-02 READY_FOR_QA · L1_ROUTES_LIVE `REC05L1-MSL2MDWT` (re-seal this run) |
| **env** | portal `:5173` · hrm-api `:28001` start:prod · commit `dc930c5` |
| **runner** | `scripts/qa/_tmp-po-hrm-mvp-gd1-rec-05-cluster-qa-02.mjs` |
| **raw JSON** | `docs/qa/evidence/_tmp-po-hrm-mvp-gd1-rec-05-cluster-qa-02.json` |
| **screens** | `docs/qa/evidence/screens/po-hrm-mvp-gd1-rec-05-cluster-qa-02/` |

---

## Verdict

| Gate | Result |
|------|--------|
| **Overall** | **PASS_WITH_OBS** · `PASS_TO_PM` |
| **L0** | hrm/xbos/portal **200** |
| **L1 seal** | EFF **200** · POST transitions **HRM-REC-404** (mapped) · GET stage-history **HRM-REC-404** (mapped) · Nest `/rec` **404 Cannot *** DENY · **not** `Cannot *` on `/recruitment/` |
| **L2.5 J-*** | **J-01..04 PASS** |
| **Nest `/rec` browser** | **0 hits** |
| **DENY** | seed unused · honesty false retained · no pool-as-FR-05 · no reopen J-CV-04 · **C-SLICE** · no module UAT DONE |

**Closed vs QA-01:** `R-REC-05-BE-BUILD-TS2345` + `R-REC-05-BE-ROUTES-NOT-LIVE` — LIVE routes seal + browser mutate path green.

---

## L0 / L1

| Check | Evidence |
|-------|----------|
| Portal / HRM / XBOS | **200** |
| `GET …/pipeline-stages/effective?company_id=main` | **200** `HRM-REC-STG-200` · total=4 |
| `POST …/candidates/{fake}/transitions` | **404** `HRM-REC-404` Candidate not found — **route LIVE** |
| `GET …/candidates/{fake}/stage-history` | **404** `HRM-REC-404` — **route LIVE** |
| Nest `POST/GET /api/hrm/rec/…` | **404** `HRM-DATA-404` Cannot * — DENY dual |
| Invent `to_stage=invent_stage_qa02` (Lane A id) | **400** `HRM-REC-STAGE-UNKNOWN` |

---

## Browser U65 — journeys

Persona: portal auth inject · URL `http://127.0.0.1:5173/command-center/hrm/recruitment?tab=candidates&companyId=main` · **zero-seed**.

**hdsd_align:** Tuyển dụng → Ứng viên → Đổi trạng thái pipeline (UV–YCTD) / Lịch sử trạng thái.

| J-* | Click path | Network / FE | Verdict |
|-----|------------|--------------|---------|
| **J-HRM-REC-STG-05-01** | Ứng viên → Tất cả → stage badge `data-lane=yctd-transitions` | Dialog **Đổi trạng thái pipeline (UV–YCTD)** · Select EFF only · no free-text · GET `/recruitment/pipeline-stages/effective` | **PASS** |
| **J-HRM-REC-STG-05-02** | Chọn stage ≠ hiện tại → **Lưu** → F5 → Chi tiết → tab **Lịch sử trạng thái** | POST `…/candidates/{id}/transitions` **201** `HRM-REC-200` + `history_id` · GET `…/stage-history` **200** · panel rows≥1 · path `/recruitment/` | **PASS** |
| **J-HRM-REC-STG-05-03** | Invent / reject | L1 invent **400** `HRM-REC-STAGE-UNKNOWN` · FE Select-only · **OBS** EFF `isRejectOutcome=0` → REJECT-REASON browser N/A (jest BE-01 seals) | **PASS** (+OBS) |
| **J-HRM-REC-STG-05-04** | Reverse allow + multi-YCTD + Nest deny | Prep up → reverse to lower sort **201** + `history_id` · reverse hint visible · peer other YCTD unchanged · Nest `/rec` **0** · **OBS** EX-03 CFG deny not flipped | **PASS** (+OBS) |

Mutated Lane A sample: `11a5906f-6736-4a89-afe4-bf623d1be1ac` (UV UAT REC UATREC-ICHFBD).

Screens: `01-candidates` · `02-transition-dialog` · `04-stage-history` · `05-reverse`.

---

## DENY / honesty

| Item | Status |
|------|--------|
| Nest `/rec/*` SoT dual | **DENY** — L1 404 · browser hits **0** |
| Campaign / REC-03 | **DENY** — not used as FR-05 SoT |
| Pool stage as FR-05 PASS | **DENY** — only Lane A `data-lane=yctd-transitions` |
| `pnpm seed:*` / API fake history seed | **not used** |
| Flip `recruitment_uat_ready` / `jd_dynamic_done` | **false** retained |
| Reopen J-HRM-REC-CV-04-* | **DENY** |
| Module REC UAT / Phase1 DONE | **DENY** — **C-SLICE** |

---

## Residuals (P2 OBS — non-blocking)

| ID | Sev | Owner | Note |
|----|-----|-------|------|
| **R-REC-05-EFF-NO-REJECT-OUTCOME** | P2 | peer-CAT | Live EFF (4) all `isRejectOutcome=false` — browser reject+note / `HRM-REC-STAGE-REJECT-REASON` not executable without catalog reject stage (DENY seed). Jest BE-01 seals mint. |
| **R-REC-05-REVERSE-CFG-DENY-BROWSER** | P2 | qa-follow | EX-03 needs `recruitment.allow_reverse_stage=false`; default true → reverse **2xx** asserted; jest seals `REVERSE-FORBIDDEN`. |

**P0 defects:** none · prior `R-REC-05-BE-BUILD-TS2345` / `R-REC-05-BE-ROUTES-NOT-LIVE` **CLOSED**.

---

## Completion contract

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** |
| **next_owner** | **qc** |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-rec-05-cluster-qa-02.md` |
| **completion_report** | U65 QA PASS_WITH_OBS — L1 routes LIVE (not Cannot *); J-HRM-REC-STG-05-01..04 PASS; POST transitions 201+history_id; GET stage-history 200+F5 rows; invent UNKNOWN 400; reverse allow 201; Nest /rec 0; honesty false; C-SLICE. P2 OBS: EFF no reject outcome · CFG deny browser. |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-REC-05-CLUSTER-QC-01
lane: governance · qc
program: PO-HRM-MVP-GD1-CONTINUOUS (U89)
uc_ids: UC-BP-REC-05
depends_on: QA-02 PASS_WITH_OBS · stamp REC05QA2-MSL31GG0 · BE-02 LIVE
entry_criteria: evidence docs/qa/evidence/po-hrm-mvp-gd1-rec-05-cluster-qa-02.md; L0–L2.5 J-01..04; honesty false; C-SLICE
MISSION: QC GWC/GO seat UC-BP-REC-05 — audit browser U65 evidence; confirm Nest /rec DENY; P2 OBS catalog reject + CFG deny; DENY flip recruitment_uat_ready · claim module UAT DONE · reopen J-CV-04 · pool as FR-05
exit: docs/qa/evidence/po-hrm-mvp-gd1-rec-05-cluster-qc-01.md · PASS_TO_PM GWC|GO|NO-GO
cấm: seed · honesty flip · C-SLICE-as-module-DONE
```

---

## stamp

`REC05QA2-MSL31GG0` · 2026-08-09

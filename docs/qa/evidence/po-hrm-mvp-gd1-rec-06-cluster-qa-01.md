# Evidence — PO-HRM-MVP-GD1-REC-06-CLUSTER-QA-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-REC-06-CLUSTER-QA-01` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89 Wave-8 · UC-BP-REC-06) |
| **lane** | execution · **qa** |
| **Date** | 2026-08-09 |
| **stamp** | `REC06QA-MSL48P4M` |
| **ack_status** | **PASS_TO_PM** |
| **overall** | **PASS** (+ P2 OBS) |
| **uc_ids** | `UC-BP-REC-06` |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `companyId=main` |
| **Honesty** | `recruitment_uat_ready=false` · `jd_dynamic_done=false` · **C-SLICE-≠-MODULE** · U65 zero-seed |
| **depends_on** | BE-01 READY_FOR_QA · FE-01 READY_FOR_QA |
| **env** | portal `:5173` · hrm-api `:28001` start:prod (rebuild+restart seal) · commit `dc930c5` |
| **runner** | `scripts/qa/_tmp-po-hrm-mvp-gd1-rec-06-cluster-qa-01.mjs` · J-04 supplemental `…-rec-06-j04.mjs` |
| **raw JSON** | `docs/qa/evidence/_tmp-po-hrm-mvp-gd1-rec-06-cluster-qa-01.json` · `…-rec-06-j04.json` |
| **screens** | `docs/qa/evidence/screens/po-hrm-mvp-gd1-rec-06-cluster-qa-01/` |

---

## Verdict

| Gate | Result |
|------|--------|
| **Overall** | **PASS** · `PASS_TO_PM` |
| **L0** | hrm/xbos/portal **200** |
| **L1 seal** | POST/GET `…/candidates/:id/mail` mapped (`HRM-REC-404` fake) · POST `candidate-evaluations` mapped · Nest `/rec/…/mail` **404 Cannot *** DENY · stamp `REC06L1-MSL48QK4` |
| **L2.5 J-*** | **J-HRM-REC-06-01..04 PASS** |
| **Nest `/rec` browser** | **0 hits** |
| **DENY** | seed unused · honesty false retained · no Campaign · no pool-eval-as-FR-06 · no reopen sealed J-STG-05 / J-IV / J-CV-04 · **C-SLICE** · no module UAT DONE |

**Ops note (intake):** LIVE dist at entry lacked mail routes → QA **rebuild** `pnpm --filter hrm-api run build` exit 0 + restart `dist/main` → L1 LIVE before browser (same stale-dist class as prior REC seats).

---

## L0 / L1

| Check | Evidence |
|-------|----------|
| Portal / HRM / XBOS | **200** |
| `POST …/candidates/{fake}/mail` | **404** `HRM-REC-404` Candidate not found — **route LIVE** |
| `GET …/candidates/{fake}/mail` | **404** `HRM-REC-404` — **route LIVE** |
| `POST …/candidate-evaluations` (fake neo) | **404** `HRM-REC-404` — **route LIVE** |
| Nest `POST /api/hrm/rec/applications/{id}/mail` | **404** `HRM-DATA-404` Cannot POST — DENY dual |
| EX-01 CC | **400** `HRM-REC-MAIL-CC-REQUIRED` |
| AC-02 invite+CC (L1) | **201** `HRM-REC-MAIL-201` |

---

## Browser U65 — journeys

Persona: portal auth inject · URL `http://127.0.0.1:5173/command-center/hrm/recruitment?tab=candidates&companyId=main` · **zero-seed**.

**hdsd_align:** Tuyển dụng → Ứng viên → Gửi thư / Đánh giá ứng viên / Đổi trạng thái (UV–YCTD).

| J-* | Click path | Network / FE | Verdict |
|-----|------------|--------------|---------|
| **J-HRM-REC-06-01** | UV `UATREC-ICEHPX` → **Gửi thư** → mẫu fail_cv → Gửi → outbox refresh | POST `…/candidates/{id}/mail` **201** `HRM-REC-MAIL-201` · path `/recruitment/` · outbox_rows≥1 · **mail ≠ transitions** | **PASS** |
| **J-HRM-REC-06-02** | `interview_invite` thiếu CC → toast; +CC → Gửi | Client CC gate toast · POST invite **201** `HRM-REC-MAIL-201` · mail ≠ transitions · L1 CC-REQUIRED sealed | **PASS** |
| **J-HRM-REC-06-03** | UV `CNS Deny` (no ACTIVE IV) → **Đánh giá ứng viên** → score + **Đạt** → **Chốt Pass/Fail** → History | POST `…/candidate-evaluations` **201** `HRM-REC-EVAL-201` · neo=`f0b2d4e3-…` · result=`pass` · eval ≠ transitions · History tab | **PASS** |
| **J-HRM-REC-06-04** | Sau eval → detail **Đổi trạng thái** → EFF select → Lưu → tab Lịch sử | POST `…/transitions` **201** `HRM-REC-200` + `history_id=00b63398-…` · GET stage-history **200** · Nest `/rec` **0** · mail endpoint không ghi stage | **PASS** |

Mutated samples:
- Mail: `448d12df-fd76-4fb2-8953-e26667bae446` (UV UAT REC UATREC-ICEHPX)
- Eval+stage: `f0b2d4e3-e71c-4ca7-a78e-7116a805a5ed` (CNS Deny msj8kfl7)

Screens: `01-candidates` · `02-detail-mail` · `03-mail-sent` · `04-invite-cc` · `05-eval-dialog` · `06-eval-committed`.

---

## DENY / honesty

| Item | Status |
|------|--------|
| Nest `/rec/*` SoT dual | **DENY** — L1 Cannot * · browser hits **0** |
| Campaign / REC-03 | **DENY** — not used as FR-06 SoT |
| Pool eval as FR-06 DONE | **DENY** — neo `recruitment_candidate_id` on eval 201 |
| `pnpm seed:*` / API fake outbox seed for UF | **not used** (L1 probes auxiliary only) |
| Flip `recruitment_uat_ready` / `jd_dynamic_done` | **false** retained |
| Reopen J-HRM-REC-STG-05 / J-IV / J-CV-04 | **DENY** |
| Module REC UAT / Phase1 DONE | **DENY** — **C-SLICE** |

---

## Residuals (P2 OBS — non-blocking)

| ID | Sev | Owner | Note |
|----|-----|-------|------|
| **R-REC-06-EVAL-PASSFAIL-MINT** | P2 | peer-BE | L1 omit `result` returned **409** `HRM-REC-409` (not `HRM-REC-EVAL-PASSFAIL` 400). Browser Pass/Fail commit path **201** sealed. |
| **R-REC-06-SUGGEST-STAGE-SAME-DIALOG** | P2 | peer-FE | Primary runner missed `rec-eval-suggest-stage` in same dialog session after commit; supplemental detail **Đổi trạng thái** sealed APP-02 201+history. |

**P0 defects:** none.

---

## Completion contract

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** |
| **next_owner** | **qc** |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-rec-06-cluster-qa-01.md` |
| **completion_report** | U65 QA PASS — L0 OK; L1 mail+eval LIVE after rebuild; J-HRM-REC-06-01..04 PASS; POST mail 201 MAIL-201; invite CC 201 + CC-REQUIRED; POST eval 201 EVAL-201 Pass neo YCTD; POST transitions 201+history_id + timeline; Nest /rec 0; mail≠transitions; honesty false; C-SLICE. P2 OBS: PASSFAIL mint code · suggest-stage same-dialog. |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-REC-06-CLUSTER-QC-01
lane: governance · qc
program: PO-HRM-MVP-GD1-CONTINUOUS (U89)
uc_ids: UC-BP-REC-06
depends_on: QA-01 PASS · stamp REC06QA-MSL48P4M · BE-01/FE-01 READY
entry_criteria: evidence docs/qa/evidence/po-hrm-mvp-gd1-rec-06-cluster-qa-01.md; L0–L2.5 J-01..04; honesty false; C-SLICE
MISSION: QC GWC/GO seat UC-BP-REC-06 — audit browser U65 mail+Pass/Fail neo YCTD; confirm Nest /rec DENY; mail≠transitions; P2 OBS PASSFAIL mint + suggest-stage; DENY flip recruitment_uat_ready · claim module UAT DONE · Campaign · pool eval DONE · reopen sealed J-* · seed
exit: docs/qa/evidence/po-hrm-mvp-gd1-rec-06-cluster-qc-01.md · PASS_TO_PM GWC|GO|NO-GO
cấm: seed · honesty flip · C-SLICE-as-module-DONE · Nest /rec dual
```

---

## stamp

`REC06QA-MSL48P4M` · 2026-08-09

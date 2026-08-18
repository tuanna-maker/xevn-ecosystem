# Evidence — PO-HRM-MVP-GD1-REC-02-BOD-CHAIN-QA-02

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-REC-02-BOD-CHAIN-QA-02` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89) |
| **lane** | execution · **qa** |
| **Date** | 2026-08-09 |
| **stamp** | **REC02BODQA2-MSKX3U8H** |
| **ack_status** | **PASS_TO_PM** |
| **overall** | **PASS** |
| **residual** | **R-REC-02-ALT-01 = CLOSED** |
| **uc_ids** | `UC-BP-REC-02` · `UC-BP-REC-02b` |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · mutate scope → `company_id=holding` |
| **Honesty** | `recruitment_uat_ready=false` · **C-SLICE-≠-MODULE** · U65 zero-seed |
| **depends_on** | BE-ALT01-01 READY_FOR_QA · `docs/qa/evidence/po-hrm-mvp-gd1-rec-02-bod-chain-be-alt01-01.md` |
| **env** | portal `:5173` · hrm-api `:28001` · STALE_DIST=false · reject_bind_fix=true |
| **runner** | `scripts/qa/_tmp-po-hrm-mvp-gd1-rec-02-bod-chain-qa-02.mjs` |
| **raw JSON** | `docs/qa/evidence/_tmp-po-hrm-mvp-gd1-rec-02-bod-chain-qa-02.json` |
| **screens** | `docs/qa/evidence/screens/po-hrm-mvp-gd1-rec-02-bod-chain-qa-02/` |

---

## spec_read_ack

| Artifact | Cite |
|----------|------|
| **BE fix** | `docs/qa/evidence/po-hrm-mvp-gd1-rec-02-bod-chain-be-alt01-01.md` — unused `$2` actorId removed; `values=[reason,id]` |
| **prior FAIL** | `docs/qa/evidence/po-hrm-mvp-gd1-rec-02-bod-chain-qa-01.md` ALT-01 → 500 `HRM-SYS-001` |
| **api** | `docs/program/specs/PO-HRM-MVP-GD1-REC-02-CLUSTER-API-01.md` F-REC-YCTD-03 reject + `rejected_reason` |
| **ba** | AC-REC-YCTD-02-ALT-01 · AC-02d · 02b-05 |

**cấm respected:** no `pnpm seed:*` · no API fake inbox · no DB mutate · no honesty flip · no Nest `/rec` dual · no module REC UAT claim · no broaden beyond ALT-01 + smoke.

---

## L0

| Check | Result |
|-------|--------|
| hrm `/api/hrm` | **200** (restarted from dist after kill PID 26284) |
| portal `:5173` | **200** |
| Dist freshness | SRC ≤ DIST · **stale_dist=false** |
| Reject bind content | `const values = [reason, requisitionId]` present · hole pattern absent · **reject_bind_fix=true** |
| Full `nest build` | **OBS** — orthogonal TS2724 `HrmListScopeContext` in `recruitment-dashboard.service.ts` blocks clean rebuild; running dist already seals ALT-01 fix (content verify) |
| Verdict | 🟢 **PASS** |

---

## U65 browser — narrow scope

Persona: login API inject portal auth · URL `http://127.0.0.1:5173/hr/recruitment?portal=1&tenantId=xevn&companyId=main&tab=requisitions`

### ALT-01 — Từ chối + lý do → rejected + F5 — 🟢 **CLOSED R-REC-02-ALT-01**

| Step | Evidence |
|------|----------|
| Before | Thêm YCTD Ngoài ĐB · Lưu · Gửi duyệt → pending |
| Action | Chi tiết → `yctd-reject-reason` = `Không đủ ngân sách — ALT01 REC02BODQA2-MSKX3U8H` → **Từ chối** |
| Network | POST `…/requisitions/5a960a6e-97ec-4132-a733-81323efcb612/transitions?company_id=holding` → **201** (was **500** on QA-01) |
| FE after 2xx | `yctd-detail-rejected-reason` visible with lý do |
| F5 | Re-open Chi tiết → rejected reason **persists** |
| Verdict | 🟢 |
| Residual | **R-REC-02-ALT-01 CLOSED** |

### must_keep smoke — SHORT approve → open_for_hire — 🟢

| Step | Evidence |
|------|----------|
| Path | `existing_pending` (zero-seed — prior FE row `QA L1 IN NOMONTH mskv8qfa`; free cells SPAWN-occupied) |
| Action | Chi tiết SHORT chain → **Duyệt → mở nhận hồ sơ** |
| Network | POST transitions → **201** |
| FE + F5 | **Mở nhận hồ sơ** persists |
| Verdict | 🟢 AC-02d |

### must_keep smoke — LONG TP/HR → approved+CV block → BOD → open_for_hire — 🟢

| Step | Evidence |
|------|----------|
| Action | Thêm Ngoài ĐB · Lưu 201 · Gửi 201 · Chi tiết LONG → TP/HR Duyệt → BOD Duyệt |
| Network | transitions TP/HR **201** · BOD **201** |
| FE after TP/HR | approved path + `yctd-bod-blocked-cv` · F5 still blocked |
| After BOD | open_for_hire · F5 open |
| Verdict | 🟢 AC-02b-05 |

### TRANSITIONS-NO-500 — 🟢

| Check | Result |
|-------|--------|
| POST transitions this session | **4** |
| 2xx | **4** |
| 5xx | **0** |
| Verdict | 🟢 no new 500 on transitions (approve ×3 + reject ×1) |

### RETAIN (not re-run)

| Item | Status |
|------|--------|
| CELL-PICKER · ALT-02 · O4/O5 full matrix | **RETAIN** stamp `REC02BODQA-MSKWIO4O` |
| Nest `/rec` dual | GET → **404** `HRM-DATA-404` 🟢 |

---

## Residual / defects

| ID | Sev | Status | Note |
|----|-----|--------|------|
| **R-REC-02-ALT-01** | P0 | **CLOSED** | Reject transitions 201 + reason FE + F5 |
| Honesty | — | RETAIN | `recruitment_uat_ready=false` · C-SLICE |
| nest build TS2724 dashboard | OBS | open orthogonal | does **not** reopen ALT-01; content-seal dist OK |

**DENY:** flip recruitment UAT · claim module REC DONE · Nest `/rec` greenfield · seed.

---

## Completion contract

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** |
| **overall** | **PASS** |
| **R-REC-02-ALT-01** | **CLOSED** |
| **completion_report** | Narrow U65 ALT-01 retest PASS after BE unused-$2 fix: reject POST transitions **201**, `yctd-detail-rejected-reason` after 2xx + F5. must_keep smoke AC-02d SHORT→open_for_hire + AC-02b-05 LONG TP/HR→CV blocked→BOD→open_for_hire PASS. Transitions 4/4 2xx · 0×500. Nest `/rec` 404. Honesty false · C-SLICE. |
| **next_owner** | **qc** |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-rec-02-bod-chain-qa-02.md` |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-REC-02-BOD-CHAIN-QC-02
lane: governance · qc
program: PO-HRM-MVP-GD1-CONTINUOUS (U89)
depends_on: QA-02 PASS_TO_PM stamp REC02BODQA2-MSKX3U8H · R-REC-02-ALT-01 CLOSED
entry_criteria: docs/qa/evidence/po-hrm-mvp-gd1-rec-02-bod-chain-qa-02.md · prior GWC remain rows on REC-02 BOD-chain
MISSION — narrow GWC seal:
1) Audit ALT-01 CLOSED (reject 201 + reason FE+F5) vs prior FAIL 500
2) Seal remain AC-02d · 02b-05 · ALT-01 from parent REC-02 QC remain list
3) RETAIN CELL-PICKER/ALT-02 from QA-01; honesty recruitment_uat_ready=false · C-SLICE
cấm: honesty flip · module REC UAT · reopen sealed REC-01 · seed · Nest /rec dual
exit: evidence po-hrm-mvp-gd1-rec-02-bod-chain-qc-02.md · GWC|GO|NO-GO · PASS_TO_PM
```

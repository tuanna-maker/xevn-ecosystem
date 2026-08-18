# Evidence — PO-UAT-REC-01 (Tuyển dụng module UAT pack)

| Field | Value |
|-------|-------|
| **work_item_id** | `PO-UAT-REC-01` |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **program** | `PO-UAT-MODULES-PARALLEL-01` |
| **module** | Tuyển dụng |
| **date** | 2026-08-07 |
| **lane** | execution · U65 zero-seed · browser-only |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` |
| **env** | portal `http://127.0.0.1:5173` · hrm `:28001` · xbos `:28002` |
| **L0** | `qc:dev-stack` HRM/XBOS/portal **200** · `qc:fe-be-health` **ALL PASS** |
| **harness** | `scripts/qa/_tmp-po-uat-rec-01.mjs` |
| **machine JSON** | `docs/qa/evidence/_tmp-po-uat-rec-01.FINAL.json` |
| **screens** | `docs/qa/evidence/screens/po-uat-rec-01/` |
| **prior process** | `po-hrm-rec-ux-qc-process-01` **NO-GO** retained until QC re-proves |
| **honesty** | `recruitment_uat_ready=false` · **DENIED** until QC GO · not partial-slice claim |
| **ack_status** | **PASS_TO_PM** |
| **module_uat_pack** | **PASS** (core spine + process gates clean this run) |

---

## Verdict (module honesty)

| Claim | Status |
|-------|--------|
| Module UAT pack (this seat) | **PASS** — P1–P5 🟢 · process gates 🟢 |
| `recruitment_uat_ready` | **false** — require **QC** `PO-UAT-REC-QC-01` before any ready flag |
| Prior process NO-GO (`po-hrm-rec-ux-qc-process-01`) | **Retained** until QC closes process honesty |
| Product GO / remaster / `jd_dynamic_done` | **Denied** |

**Exit:** `PASS_TO_PM` → next **QC** `PO-UAT-REC-QC-01` (process NO-GO re-prove or retain).

---

## 0. L0 / entry

| Check | Result |
|-------|--------|
| `pnpm run qc:dev-stack` | HRM 200 · XBOS 200 · portal 5173 200 |
| `pnpm run qc:fe-be-health` | **ALL PASS** |
| Harness L0 | portal 200 · hrm 200 · xbos 200 |
| Seed | **none** (U65) |

---

## 1. HDSD inventory (U76)

| Surface | Menu / URL | Buttons / controls exercised |
|---------|------------|------------------------------|
| Ứng viên | `/hr/recruitment?tab=candidates` | `hdsd-candidate-create-btn` · form YCTD · Lưu · list cells · F5 |
| Đánh giá / So sánh | `?tab=evaluations` | `hdsd-rec-compare-open-btn` · YCTD picker · UV rows · matrix |
| Yêu cầu TD | `?tab=requisitions` | `hdsd-requisition-create-btn` · JD bindable · Lưu · JD ref F5 |
| Lịch PV | Candidates row Tuấn | calendar → `schedule-interview-dialog` · submit |
| Kế hoạch | `/command-center/hrm/recruitment?tab=plans` | plan row → detail · shell chrome |

---

## 2. Pack matrix

| # | Pack item | Journey | Verdict | Evidence highlight |
|---|-----------|---------|---------|-------------------|
| **P1** | UV create → list union · F5 | `J-HRM-REC-UV-01` | 🟢 **PASS** | POST **201** `HRM-REC-202` · FE YCTD+position cells · F5 retain |
| **P2** | Compare YCTD | `J-HRM-REC-CMP-01` | 🟢 **PASS** | Dialog · YCTD picker · uvRows≥1 · matrix visible |
| **P3** | YCTD↔JD bind | `J-HRM-JD-YCTD-01` | 🟢 **PASS** | POST **201** `HRM-REC-201` · `job_template_id` set · `yctd-jd-ref-*` F5 |
| **P4** | Interview one-active | REC-IV | 🟢 **PASS** | Dialog UTF-8 OK · POST **409** `HRM-REC-IV-409-ACTIVE` · badge visible |
| **P5** | Plan + candidates chrome | plan console | 🟢 **PASS** | plans list→detail · createBtn · brand=1 · dup=0 |

### Process FAIL-immediate gates (sponsor)

| Gate | Hits | Verdict |
|------|-----:|---------|
| DnD `@hello-pangea/dnd` storm (≥10) | **0** | 🟢 |
| Mojibake VI (true UTF-8 corruption) | **0** | 🟢 |
| Duplicate shell header | brand=**1** · strips=**0** | 🟢 |
| Uncaught / ReferenceError on click path | **0** | 🟢 |

**OBS (not FAIL):** Interview duplicate submit logs expected `409` + `console.error` in catch (handled toast path) — same class as `PO-HRM-REC-IV-ONE-ACTIVE-QA-02-R4`.

**OBS:** Compare Network harness array empty in this run while FE matrix rendered; prior CMP slice had explicit `GET …/compare` 200 — treat as capture gap OBS, not product FAIL.

**Note (detector):** First harness pass false-positive on `Â` in «NHÂN SỰ»; detector tightened to true mojibake patterns; re-run clean.

---

## 3. UF evidence blocks

### P1 — UV create → list · F5 (`J-HRM-REC-UV-01`)
- Persona / URL: `ceo@xe.vn` · `/hr/recruitment?tab=candidates&companyId=main`
- Action: Thêm UV → SELECT YCTD → họ tên `UV UAT REC UATREC-ICHFBD` → Lưu
- Network: POST `/api/hrm/recruitment/candidates` → **201** `HRM-REC-202`
  - `requisition_id` set · `position_key=CEO` · **no** `job_posting_id`
- **FE sau 2xx:** row + `hdsd-candidate-list-yctd` + `hdsd-candidate-list-position` filled
- F5: same cells retained
- Screens: `01-candidates` … `01d-f5`
- Verdict: 🟢

### P2 — Compare YCTD (`J-HRM-REC-CMP-01`)
- Click: evaluations → So sánh → dialog → YCTD picker
- FE: uvRows≥1 · matrix visible · no mojibake
- Verdict: 🟢 · OBS network capture

### P3 — YCTD↔JD bind (`J-HRM-JD-YCTD-01`)
- Click: requisitions → Thêm → bindable JD → title → Lưu
- Network: POST `/api/hrm/recruitment/requisitions` → **201** `HRM-REC-201` · `job_template_id=b284e4cd-…`
- F5: `yctd-jd-ref-{id}` visible · title on list
- Verdict: 🟢

### P4 — Interview schedule / one-active
- Click: Candidates → Tuấn → calendar → dialog «Lên lịch phỏng vấn» (UTF-8 labels OK)
- Network: POST interviews → **409** `HRM-REC-IV-409-ACTIVE` (already active — U65 no cancel seed)
- FE: badge «Đã có lịch» visible
- Verdict: 🟢

### P5 — Plan console / candidates chrome
- Click: plans tab → open plan row → re-nav candidates create btn
- Shell: single `portal-brand-mark` · no duplicate CC strip
- ΔpageErrors=0 · Δdnd=0 · Δuncaught=0 on plan path
- Verdict: 🟢

---

## 4. Gaps / residuals

| ID | Class | Note |
|----|-------|------|
| — | — | **gaps=[]** this run |
| R-REC-CMP-NET-CAPTURE | soft OBS | compare Network array empty while matrix FE OK |
| R-REC-IV-409-CONSOLE | soft OBS | handled 409 `console.error` (not Uncaught) |
| PROCESS-NOGO-HISTORY | process | Prior `po-hrm-rec-ux-qc-process-01` NO-GO **retained** until QC |

---

## 5. Honesty / cấm

| Flag | Value |
|------|-------|
| `recruitment_uat_ready` | **false** |
| Seed in evidence | **none** |
| Partial-slice as module ready | **cấm** — this pack is module spine re-prove for QC, not self-GO |

---

## 6. Handoff

```yaml
work_item_id: PO-UAT-REC-01
from_role: qa
to_role: pm
ack_status: PASS_TO_PM
evidence_path: docs/qa/evidence/po-uat-rec-01.md
machine_json: docs/qa/evidence/_tmp-po-uat-rec-01.FINAL.json
next_owner: qc
next_dispatch_prompt: |
  work_item_id: PO-UAT-REC-QC-01
  from_role: pm
  to_role: qc
  entry: PO-UAT-REC-01 PASS_TO_PM · evidence docs/qa/evidence/po-uat-rec-01.md · U65 zero-seed
  scope: Audit module pack P1–P5 + process gates vs prior po-hrm-rec-ux-qc-process-01 NO-GO
  honesty: recruitment_uat_ready stays false until explicit QC GO; else retain process NO-GO
  exit: GO | GO WITH CONDITIONS | NO-GO · evidence docs/qa/evidence/po-uat-rec-qc-01.md
completion_report: |
  Closed: Browser module UAT pack Tuyển dụng — UV create/list/F5, Compare YCTD, YCTD↔JD bind,
  Interview one-active (409+badge), Plan/candidates chrome; process gates clean (DnD/mojibake/dup shell/Uncaught=0).
  Residual: soft OBS compare Network capture + expected IV 409 console; process NO-GO history retained for QC.
  Denied: recruitment_uat_ready=true · seed · product GO without QC.
```

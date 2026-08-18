# Evidence — U78-U84-PRIMARY-REC-PIPE-TMDV-01

| Field | Value |
|-------|--------|
| **work_item_id** | `U78-U84-PRIMARY-REC-PIPE-TMDV-01` |
| **prior** | `U78-U84-PRIMARY-REC-REQ-TMDV-01-R1` (**EVIDENCED**) · stamp `TMDV-REQ-R1-DINI2P` YCTD `open` |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **date** | 2026-08-04 |
| **lane** | execution |
| **priority** | P1 |
| **ack_status** | **PASS_TO_PM** |
| **verdict** | **PASS** Primary cell P-REC-PIPE @ **CO-TMDV** (HP + AP first-step) |
| **cell** | P-REC-PIPE @ **CO-TMDV** · slug `trsport` · OU «Công ty Cổ phần Thương mại và Dịch vụ X.E» |
| **U65** | honored — no seed / no inbox seed / no DB fake |
| **U76** | `hdsd_align: true` |
| **U78** | [`u78-u84-primary-rec-pipe-tmdv-01-test-log.md`](u78-u84-primary-rec-pipe-tmdv-01-test-log.md) · [`.json`](u78-u84-primary-rec-pipe-tmdv-01-test-log.json) |
| **raw** | [`_tmp-u78-u84-primary-rec-pipe-tmdv-01-browser.json`](_tmp-u78-u84-primary-rec-pipe-tmdv-01-browser.json) |
| **screens** | `docs/qa/evidence/screens/u78-u84-primary-rec-pipe-tmdv-01/` |
| **env** | portal `:5173` · hrm-api `:28001` · xbos `:28002` |
| **commit** | `dc930c5` |
| **L0** | `qc:dev-stack` HRM+XBOS+portal **200** · `qc:fe-be-health` **ALL PASS** |

---

## Executive verdict

**PASS_TO_PM** — U78 browser execute Primary cell **P-REC-PIPE @ CO-TMDV** FE-only after REQ EVIDENCED:

| Layer | Result |
|-------|--------|
| **Precond TC-WFM-REC-PIPE-HP-001** | 🟢 FE CC preset «Roadmap ứng viên HRM» → POST **201** active `hrm_candidate_pipeline` (`b952ea1d-…`) — was **MISSING** at probe |
| **Prior YCTD** | 🟢 `TMDV-REQ-R1-DINI2P` status `open` reused (no re-create) |
| **TC-HIM-REC-PIPE-TMDV-HP-001** | 🟢 **EVIDENCED** — Thêm ứng viên tài xế **201** `HRM-REC-CP-201` → **Bắt đầu QT** **201** `HRM-REC-CP-WF-200` → F5 + `workflow_instance_id` + stage lock hint |
| **TC-HIM-REC-PIPE-TMDV-AP-001** | 🟢 **EVIDENCED** — Inbox stamp → **Xử lý nhanh** → **201** `XBOS-WF-200` (`step_key=intake` · matching `instance_id`) · multi-step card may remain (next screening) |
| **TC-HIM-REC-PIPE-TMDV-FD-001** | ⚪ **not** EVIDENCED as product block — **no GPLX FE gate** (SPEC_GAP residual; no silent hire attempted) |
| **UAT / Phase1 / whole U84** | **not claimed** |

**promoted TC-IDs:** `TC-HIM-REC-PIPE-TMDV-HP-001` · `TC-HIM-REC-PIPE-TMDV-AP-001`  
**XREF observe:** `TC-XIC-WF-HP-002/003` path exercised via Inbox complete (not separate XIC pack retest claim).  
**supporting:** `TC-WFM-REC-PIPE-HP-001` create-def via FE preset this run.

---

## Persona / scope

| Field | Value |
|-------|--------|
| Account | `ceo@xe.vn` / `Xevn@2026` |
| Scope used | Group CEO · embed `companyId=trsport` · OU TM-DV · CC WF/Inbox at `main` |
| Target role | **Lái xe / Vận hành logistics** · BR-PO-REC-LGX-01 |
| Prior REQ | id `46c0fff1-ad3e-412e-81df-a7680f3f2801` · status `open` |

---

## HDSD inventory (U76)

| # | Surface | Found | Used |
|---|---------|-------|------|
| 1 | CC **Cấu hình → Hệ thống quy trình** · Mẫu QT tuyển dụng HRM (bridge) | Yes | Precond create `hrm_candidate_pipeline` |
| 2 | Preset chip `hrm-rec-wf-preset-candidate` · **Roadmap ứng viên HRM** · Lưu | Yes | POST definitions 201 |
| 3 | `/hr/recruitment?tab=candidates` · **Thêm ứng viên** | Yes | HP create |
| 4 | Row CTA **Bắt đầu QT** | Yes | start-pipeline |
| 5 | CC **Hộp thư** · card stamp · **Xử lý nhanh** | Yes | AP intake |

---

## IDs (this run)

| Field | Value |
|-------|--------|
| STAMP | `TMDV-PIPE-DJ2VT8` |
| wfDefId | `b952ea1d-0217-466d-a267-8dde1e7cd8ad` (`hrm_candidate_pipeline` active) |
| candidateId | `c7ade28a-b25b-4e16-9d6d-d86b5775a8cf` |
| full_name | `Nguyễn Văn Tài xế TMDV-PIPE-DJ2VT8` |
| position | `Lái xe / Vận hành logistics` |
| workflow_instance_id | `15bc3761-a21a-4de4-afe2-9f7099f85248` |
| AP task | `6b2f104b-b459-4bb2-bd1c-d305a57f7463` · `step_key=intake` · **201** `XBOS-WF-200` |
| Prior requisitionId | `46c0fff1-ad3e-412e-81df-a7680f3f2801` |

---

## Phase A — WF precond + HP (candidate → Bắt đầu QT → F5)

1. L0 PASS · prior YCTD open · **pipe def MISSING** (only plan/req/TDIT)  
2. Login → `/command-center?settings=workflow` · preset **candidate** → **Lưu** → POST **201** `hrm_candidate_pipeline` active · F5 list  
3. `/hr/recruitment?tab=candidates&companyId=trsport` · OU TM-DV  
4. Fail-deep: empty candidate submit → dialog kept  
5. Fill tài xế + notes (stamp + thiếu GPLX documented) → **Lưu** → POST **201** `HRM-REC-CP-201`  
6. F5 → stamp on list  
7. **Bắt đầu QT** → POST **201** `HRM-REC-CP-WF-200` · `workflowInstanceId` set · stage `new` · spawnMissing=false  
8. F5: candidate + wi · «QT XBOS · không đổi tay» · **Bắt đầu QT** gone  

Screens: `00-wf-list` … `08-f5-after-pipeline`.

---

## Phase B — AP (Inbox Xử lý nhanh — first pipeline step)

| Check | Result |
|-------|--------|
| Card visible before | Yes (`10-inbox-before.png`) — stamp `TMDV-PIPE-DJ2VT8` |
| POST complete | **201** `XBOS-WF-200` · `instance_id=15bc3761-…` · `step_key=intake` |
| F5 card gone | **No** — expected multi-step (next screening may remain) |
| HRM stage after | still **`new`** — maps `rec_intake`→`new` (bridge map); not silent terminal hire |
| Matching WI | Yes |

Honesty: AP Primary cell PASS = first FE-visible Duyệt **2xx** + matching WI. Full 4-step roadmap (screening→interview→offer) **not** claimed as single-run complete.

---

## Phase C — FD BR-PO-REC-LGX-01 (Offer / GPLX)

| Check | Result |
|-------|--------|
| FE GPLX / hạng bằng / kinh nghiệm tuyến field | **Absent** on create/edit dialog |
| Offer advance blocked without GPLX | **Not enforceable** this build |
| Silent hire | **Not attempted** |
| Verdict | Document **SPEC_GAP** residual `R-U84-REC-PIPE-LGX-GPLX-GATE` — **do not** claim FD PASS as product gate |

---

## Case matrix (this WI)

| Case | id | status | notes |
|------|-----|--------|-------|
| A fail deep | empty candidate | 🟢 PASS | dialog kept |
| B success HDSD | HP+AP | 🟢 PASS | CO-TMDV `trsport` + FE WF precond |
| C logic BR | DRIVER/LGX + GPLX gate | 🟡 SKIP/SPEC_GAP | position Lái xe OK; Offer GPLX gate missing |

---

## Promoted / not_promoted

| TC-ID | Status | Notes |
|-------|--------|-------|
| TC-HIM-REC-PIPE-TMDV-HP-001 | **EVIDENCED** | create + Bắt đầu QT + F5 wi @ CO-TMDV |
| TC-HIM-REC-PIPE-TMDV-AP-001 | **EVIDENCED** | Inbox Xử lý nhanh intake · matching WI · 201 |
| TC-HIM-REC-PIPE-TMDV-FD-001 | **not** EVIDENCED | GPLX Offer gate absent — residual P2 |
| TC-WFM-REC-PIPE-HP-001 | supporting PASS | FE preset create this run (not separate WFM pack claim) |
| TC-HIM-ATT-TMDV-* | unchanged FAIL/BLOCKED | prior WI — residual |
| Whole U84 / Phase1 | **not** DONE | |

---

## Residuals

| ID | Severity | Owner | Trigger |
|----|----------|-------|---------|
| **R-U84-REC-PIPE-LGX-GPLX-GATE** | **P2** | ba-process / dev-fe | BR-PO-REC-LGX-01 Offer GPLX FE gate missing |
| **R-U84-ATT-ADJ-TMDV-TIMEWIRE** | **P0** (prior) | **dev-be** | P-ATT-ADJ FE HH:mm → TIMESTAMPTZ 500 — still open |
| CO-DL leave Primary | P0 prior | devops/ba-data | still BLOCKED-EXTERNAL |
| Multi-step PIPE remaining | P3 observe | qa | screening/interview/offer steps not fully walked this WI |

---

## completion_report

**Closed:** U78 Primary P-REC-PIPE @ CO-TMDV FE chain (U65) — WF preset create + candidate create + start-pipeline + Inbox intake approve; IEEE/ISO test-log pair; HP+AP **EVIDENCED** with Network 2xx + FE after + F5; GPLX FD documented honestly (not invented PASS).  
**Open:** ATT-ADJ FAIL residual; GPLX Offer gate SPEC_GAP; UAT/Phase1 not claimed.

**ack_status:** PASS_TO_PM  
**next_owner:** pm  
**evidence_path:** `docs/qa/evidence/u78-u84-primary-rec-pipe-tmdv-01.md`

### next_dispatch_prompt

```text
work_item_id: U78-U84-PRIMARY-CAT-EXT-DL-01
from_role: pm
to_role: qa
ack_status_target: PASS_TO_PM
priority: P1
u65_zero_seed: true
hdsd_align: true
test_log_required: true

MISSION: Browser execute Primary P-CAT-EXT @ CO-DL (TC-HIM-CAT-DL-HP-001) + CO-HOLD AP (TC-HIM-CAT-HOLD-AP-001) FE-only after P-REC-PIPE EVIDENCED.
entry: PIPE cell PASS docs/qa/evidence/u78-u84-primary-rec-pipe-tmdv-01.md · Precond TC-WFM-CAT-HP-001.
Persona: ceo@xe.vn / Xevn@2026 · member unit xe-du-lich visible · then holding inbox approve.
Steps: login → company_group_hr → CT Du lịch → Thêm field custom → Xác nhận (áp dụng) → F5 · Inbox gov Phê duyệt → F5 · U78 test-log · promote only if FE chain 2xx+F5.
PARALLEL residual (if CAT blocked OR prefer close time-wire first):
work_item_id: D-U84-ATT-ADJ-TMDV-TIMEWIRE-01
to_role: dev-be
MISSION: Fix TC-HIM-ATT-TMDV-HP FAIL — FE attendance adjust POST 500 timestamptz from HH:mm "08:00" @ CO-TMDV (evidence u78-u84-primary-att-adj-tmdv-01.md).
cấm: seed inbox / invent EVIDENCED
evidence_path: docs/qa/evidence/u78-u84-primary-cat-ext-dl-01.md
```

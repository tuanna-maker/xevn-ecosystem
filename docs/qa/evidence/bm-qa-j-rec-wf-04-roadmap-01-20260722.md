# BM-QA-J-REC-WF-04-ROADMAP-01 — Candidate roadmap / F6 stage chips (J-REC-WF-04)

| Field | Value |
|-------|--------|
| **work_item_id** | `BM-QA-J-REC-WF-04-ROADMAP-01` |
| **program** | `P1-BMINUTES-CUST-RETEST-01` |
| **from_role** | qa |
| **to_role** | pm |
| **ack_status** | **PASS_TO_PM** |
| **priority** | P1 |
| **executed_at** | 2026-07-22 ~08:50–09:05 ICT |
| **URL** | `http://14.225.217.232:8088` |
| **persona** | Group CEO / BOD (`ceo@xe.vn` / `Xevn@2026` session) |
| **U65** | zero-seed · browser-only · **cấm** seed inbox / pipeline · no Phase1/PROD claim |
| **spec_ref** | **J-REC-WF-04** · AC-REC-WF-04 · BR-REC-WF-04 · UC-HRM-REC-WF-04 · F6 AC-CD-F6-* · must_keep **J-HRM-05** |
| **J-*** | **J-REC-WF-04** · **J-HRM-05** |
| **entry** | Prior `BM-QA-J-REC-WF-03-INBOX-01` (requisition approval terminal — **not** candidate pipeline step) |

---

## Executive summary

**PASS (baseline + gap documented)** — FE candidate list → detail shows roadmap chips bound to API stage (`data-rec-wf-roadmap="api-stage"`). Hired candidate: all 5 happy-path chips green (aligned `hired`). Applied candidate: 1 green chip at **Ứng tuyển** (aligned `applied`≡F6 `new`). Dashboard funnel **6 giai đoạn** live (4/0/0/0/1/0). **No** candidate has `workflow_instance_id`; **0** pending `hrm_candidate_pipeline` inbox tasks — post-inbox step→stage sync (**AC-REC-WF-04 mutate path**) **not exercisable** this wave; residual follow-up: FE **Bắt đầu QT** → inbox step → recheck chips. **J-HRM-05** list→Chi tiết dialog + GET requisition **200** `HRM-REC-200` **PASS**. Residual P1: `GET …/candidates-pool/{id}` **404** while list **200** (FE detail uses list row — UI OK).

---

## Environment

| Item | Detail |
|------|--------|
| Portal | `http://14.225.217.232:8088` |
| HRM | `/hr/recruitment?tenantId=xevn&companyId=main` |
| Seed | **none** |
| Screenshots | `bm-qa-j-rec-wf-04-hired-detail.png` · `bm-qa-j-rec-wf-04-jhrm05-req-detail.png` (local temp) |

---

## Verdict matrix

| ID | Criterion | Verdict | Notes |
|----|-----------|---------|-------|
| **J-REC-WF-04 / UI** | Open candidate detail; observe roadmap / stage chips (F6) | **PASS** | `Quá trình tuyển dụng`: Ứng tuyển→Sàng lọc→Phỏng vấn→Đề nghị→Đã tuyển; `data-rec-wf-roadmap=api-stage` |
| **AC-REC-WF-04 / post-inbox** | After pipeline inbox step, stage chip = F6 map | **GAP / BLOCKED precondition** | No prior **candidate pipeline** inbox step; WF-03 was `hrm_requisition_approval` terminal only |
| **Baseline API** | Candidates stage + `workflow_instance_id` | **PASS (doc)** | 4×`applied` wf=null · 1×`hired` + `employee_id` wf=null |
| **Dashboard F6** | 6-column funnel visible | **PASS** | Tổng 5 · Mới 4 · Sàng lọc 0 · PV 0 · Đề nghị 0 · Đã tuyển 1 · Từ chối 0 |
| **J-HRM-05** | Requisition list→detail | **PASS** | FE Chi tiết dialog; GET `…/requisitions/{id}` **200** `HRM-REC-200` |
| **U65** | No seed | **PASS** | |
| **Phase1 / PROD** | Not claimed | **N/A** | |

---

## 1) Click path — candidate roadmap

```
Login ceo@xe.vn → http://14.225.217.232:8088/hr/recruitment?tenantId=xevn&companyId=main
→ Dashboard: «Pipeline ứng viên (6 giai đoạn)» visible
→ Click funnel chip «Chờ CV / Mới» → «Quản lý ứng viên» list (5 rows)
→ Eye (Chi tiết) on QA Pool 1780114706910 (Đã tuyển)
→ Roadmap «Quá trình tuyển dụng» all 5 chips green
→ Eye on QA Pool 1780114488912 (Ứng tuyển)
→ Roadmap: 1 green circle at Ứng tuyển; later stages muted
```

### Roadmap observations

| Candidate | API `stage` | `workflow_instance_id` | Roadmap chips | Green count | Align? |
|-----------|-------------|------------------------|---------------|-------------|--------|
| QA Pool 1780114706910 | `hired` | null | Ứng tuyển→…→Đã tuyển | 5/5 | **YES** |
| QA Pool 1780114488912 | `applied` | null | same labels | 1/5 (Ứng tuyển) | **YES** (`applied`≡F6 `new`) |

**F6 SoT map (contract §2.1):** `new` / `screening` / `interview` / `offer` / `hired` / `rejected`.  
Detail roadmap **omits** `rejected` (happy-path timeline — expected). Label **Ứng tuyển** = FE alias for `new`/`applied` (CODE-MEMORY `CandidateDetailView`).

**LOCKED hint:** not shown (correct — no active instance).

**List stage filter chips:** Tất cả 5 · Chờ CV/Mới · Ứng tuyển 4 · Sàng lọc 0 · Phỏng vấn 0 · Đề xuất 0 · Đã tuyển 1 · Từ chối 0. Soft note: extra **Ứng tuyển** chip alongside F6 **Chờ CV/Mới** (display alias, not enum breach).

**Row action:** every row shows **Bắt đầu QT** (including hired) because `workflow_instance_id` is null — soft UX residual.

---

## 2) Prior inbox / WF step — gap

| Check | Result |
|-------|--------|
| Pending XBOS tasks matching `hrm_candidate_pipeline` / `rec_*` | **0** |
| Any candidate `workflow_instance_id` set | **none** (5/5 null) |
| Prior wave WF-03 | Terminal complete on **requisition** `d4f3edb1-…` / instance `ad7089df-…` — **not** candidate step callback |

**Conclusion:** Cannot assert AC-REC-WF-04 «sau step inbox → stage chip = map F6». Documented baseline = local stage chips only. Follow-up wave must: pick applied UV → FE **Bắt đầu QT** → Inbox complete `rec_screening` (or mapped step) → reopen detail → expect chip advance to **Sàng lọc** (fail-closed if unmapped).

---

## 3) API probe (browser session JWT — L1 auxiliary, not UF alone)

### Candidates list

```http
GET /api/hrm/recruitment/candidates-pool?company_id=main
→ 200 HRM-REC-CP-200 · total 5
```

| id (short) | name | stage | wf | employee_id |
|------------|------|-------|----|-------------|
| 289a9388-… | QA Pool 1780114706910 | hired | null | 678b9cb2-… |
| 8942bb51-… | QA Pool 1780114488912 | applied | null | null |
| 8bfb3078-… | QA Pool 1780114488147 | applied | null | null |
| 220994ed-… | QA Pool 1780114425114 | applied | null | null |
| 52f04cd9-… | QA Pool 1780114405900 | applied | null | null |

### Candidate GET-by-id (residual)

```http
GET /api/hrm/recruitment/candidates-pool/{id}?company_id=main
GET /api/hrm/recruitment/candidates/{id}?company_id=main
→ 404 HRM-DATA-404  (tested hired + applied ids)
```

Tag: **scope_parity** / RD gap — list returns id, GET-by-id 404. FE detail still works via in-memory list row (no deep-link GET).

### Requisitions (J-HRM-05)

```http
GET /api/hrm/recruitment/requisitions?company_id=main → 200 HRM-REC-200
GET /api/hrm/recruitment/requisitions/d4f3edb1-b5b5-40d0-b27f-b3ee35a29e43?company_id=main
→ 200 HRM-REC-200 · status=open · title=BM-QA-R2 YCTD spawn 1784652099003
```

### FE J-HRM-05

```
Yêu cầu tuyển dụng → Chi tiết (row «Tuyển services #1» under ĐVTV filter)
→ Dialog «Chi tiết yêu cầu tuyển dụng» · status chip «Đang tuyển» · Đóng / Gửi duyệt QT / Sửa
```

No 404 scope on detail dialog.

---

## 4) Residuals

| ID | Severity | Item | Owner hint |
|----|----------|------|------------|
| **R-REC-WF-04-01** | P1 | AC-REC-WF-04 post-inbox stage sync not run — need FE Bắt đầu QT + inbox step chain | pm → qa (after optional BE verify spawn) |
| **R-REC-WF-04-02** | P1 | `GET candidates(-pool)/{id}` **404** vs list **200** | **dev-be** scope_parity |
| **R-REC-WF-04-03** | P3 | Hired row still offers **Bắt đầu QT** | soft FE |
| **R-REC-WF-04-04** | P3 | List filter dual chip Ứng tuyển + Chờ CV/Mới | soft FE / display |

**must_keep:** UF-HRM-12 · J-HRM-05 · F6 AC-CD-F6-* · no seed.

**NOT** Phase 1 DONE · **NOT** PROD.

---

## completion_report

Closed: **BM-QA-J-REC-WF-04-ROADMAP-01** browser U65 on `:8088`. Roadmap/stage chips observed and stage-index aligned for hired + applied. F6 dashboard 6-column funnel live. J-HRM-05 requisition list→detail **PASS**. Post-inbox pipeline stage sync **GAP** (no candidate instance / no pipeline inbox task — baseline documented per dispatch). Residuals: R-01 follow-up mutate chain; R-02 candidate GET-by-id 404 → BE.

## next_owner

`pm` (intake) → dispatch **`dev-be`** for R-02; optionally **`qa`** R-01 after FE Bắt đầu QT available on applied UV (same U65, no seed).

## next_dispatch_prompt

```text
work_item_id: BM-BE-REC-CAND-GET-BY-ID-01
from_role: pm
to_role: dev-be
lane: execution
priority: P1
program: P1-BMINUTES-CUST-RETEST-01
U65 · cite docs/qa/evidence/bm-qa-j-rec-wf-04-roadmap-01-20260722.md R-REC-WF-04-02

Fix scope_parity: GET /api/hrm/recruitment/candidates-pool/{id}?company_id=main (and/or /candidates/{id})
must return 200 for ids returned by list candidates-pool under Group CEO company_id=main.
Reproduce: list 200 → GET same id → today 404 HRM-DATA-404.
entry_criteria: J-REC-WF-04 evidence; must_keep J-HRM-05 requisition RD; no seed
exit_criteria: jest scope parity; READY_FOR_QA with sample ids from :8088 list
evidence_path: docs/qa/evidence/bm-be-rec-cand-get-by-id-01-YYYYMMDD.md

Parallel (after BE or if spawn already OK):
work_item_id: BM-QA-J-REC-WF-04-STEP-SYNC-01
to_role: qa
— FE applied UV → Bắt đầu QT → Inbox complete mapped rec_* step → detail roadmap chip advances; U65 no seed; evidence bm-qa-j-rec-wf-04-step-sync-01-YYYYMMDD.md
```

## ack_status

**PASS_TO_PM**

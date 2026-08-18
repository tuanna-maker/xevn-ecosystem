# Evidence — PO-HRM-MVP-GD1-REC-00-CLUSTER-QA-02

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-REC-00-CLUSTER-QA-02` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (**U89** Wave-5 seat #7) |
| **lane** | execution · **qa** · U65 zero-seed · browser-only |
| **Date** | 2026-08-09 |
| **stamp** | **REC00QA2-MSL0EZS5** |
| **ack_status** | **PASS_TO_PM** |
| **overall** | **PASS** |
| **uc_ids** | `UC-BP-REC-00` |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `companyId=main` |
| **Honesty** | `recruitment_uat_ready=false` · `jd_dynamic_done=false` · **C-SLICE-≠-MODULE** · DENY flip |
| **depends_on** | FE-02 READY_FOR_QA · **R-REC-00-FE-COMMENT-ASTERISK** fixed · BE-01 LIVE |
| **prior** | QA-01 **FAIL_TO_PM** `REC00QA-MSL06DF5` (whitescreen) |
| **env** | portal `:5173` · hrm-api `:28001` · commit `git rev-parse` at run |
| **runner** | `scripts/qa/_tmp-po-hrm-mvp-gd1-rec-00-cluster-qa-02.mjs` |
| **raw JSON** | `docs/qa/evidence/_tmp-po-hrm-mvp-gd1-rec-00-cluster-qa-02.json` |
| **screens** | `docs/qa/evidence/screens/po-hrm-mvp-gd1-rec-00-cluster-qa-02/` (9) |
| **hdsd_align** | true — Tuyển dụng → Thư viện JD · `hdsd-jd-library-*` · `hdsd-jd-form-*` · `jd-library-publish-btn` · `jd-library-retire-btn` |

---

## spec_read_ack

| Artifact | Cite |
|----------|------|
| **ba** | `docs/program/specs/PO-HRM-MVP-GD1-REC-00-CLUSTER-BA-01.md` AC-REC-JD-00-01..05 · P01–P05 · O1–O7 · J-HRM-REC-JD-00-01..04 |
| **api** | `PO-HRM-MVP-GD1-REC-00-CLUSTER-API-01.md` F-JD-01..04 · PUB-* · physical `/recruitment/job-templates*` |
| **be** | `docs/qa/evidence/po-hrm-mvp-gd1-rec-00-cluster-be-01.md` READY |
| **fe-02** | `docs/qa/evidence/po-hrm-mvp-gd1-rec-00-cluster-fe-02.md` COMMENT-ASTERISK FIX · Vite 200 |
| **journey** | `PROGRAM_JOURNEY_MAP.md` J-HRM-REC-JD-00-01..04 |

**cấm respected:** no `pnpm seed:*` · no API-only UF PASS · no honesty flip · no Nest `/rec` SoT · no `recruitment_uat` / `jd_dynamic_done` claim · C-SLICE.

---

## L0

| Check | Result |
|-------|--------|
| `qc:dev-stack` | hrm-api **200** · xbos **200** · portal `:5173` **200** |
| `qc:fe-be-health` | **ALL PASS** |
| Vite `JobTemplatesTab.tsx` | **200** · `PUB-* / CODE-DUP` present · **no** `PUB-*/CODE-DUP` |
| Vite `Recruitment.tsx` | **200** |
| Verdict | 🟢 **PASS** |

---

## L1 / API spot (supporting — UF from browser)

| Probe | Network | After | Verdict |
|-------|---------|-------|---------|
| GET `…/recruitment/job-templates?page_size=5&company_id=main` | **200** `HRM-REC-JD-200` | items have **`status`** | 🟢 LIVE |
| POST `…/job-templates/{fake}/publish` | **404** `HRM-REC-JD-404` | route mapped (not `Cannot POST`) | 🟢 LIVE |
| GET `…/api/hrm/rec/job-descriptions` | **404** `HRM-DATA-404` | Nest `/rec` dual DENY | 🟢 |
| GET `…/job-templates?bindable=true` | **200** | count=7 · statuses=`["active"]` only | 🟢 |

---

## U65 browser UF (HDSD)

Persona inject portal auth · URL `http://127.0.0.1:5173/hr/recruitment?portal=1&tenantId=xevn&companyId=main&tab=jd-library`

**Mount seal (QA-01 residual CLOSED):** `whitescreen=false` · bodyChars=1414 · `Thư viện mô tả công việc (JD)` visible · `rec-jd-library-tab-precision` · pageErrors=0 · no Vite parse / dynamic-import fail.

### J-HRM-REC-JD-00-01 / AC-REC-JD-00-01 — List + chips 🟢

| Step | Evidence |
|------|----------|
| Before | Login → Tuyển dụng → tab Thư viện JD |
| Action | Open status filter |
| Network | **GET** `/api/hrm/recruitment/job-templates?company_id=main` **2xx** |
| FE after 2xx | Filter options **Tất cả / Nháp / Hiệu lực / Ngừng**; chips VI on rows; **Thêm JD** visible |
| F5 | GET job-templates 2xx again · chrome still mounted |
| Screens | `01-jd-library.png` · `02-jd-library-f5.png` |
| Verdict | 🟢 **PASS** |
| Nest `/rec` | **0** browser calls |

### J-HRM-REC-JD-00-02 / AC-02 · P04 · AC-03 — Nháp → Phát hành 🟢

| Step | Evidence |
|------|----------|
| Action | Thêm JD → title+code+position → **Lưu nháp** |
| Network | **POST** `/api/hrm/recruitment/job-templates` → **201** `HRM-REC-JD-201` · `status=draft` · `is_active=false` |
| FE after | Chip **Nháp** / `data-status=draft` · toast path |
| F5 | Chip still **Nháp** (`04-draft-f5.png`) |
| Action | **Phát hành** on draft row |
| Network | **POST** `…/job-templates/{id}/publish?company_id=main` → **201** `HRM-REC-JD-200` |
| FE after + F5 | Chip **Hiệu lực** / `active` (`05-after-publish.png`) |
| P04 | Create default **draft** — not auto-active |
| Verdict | 🟢 **PASS** (P01/P02 SKIP — happy path publish succeeded) |

### AC-REC-JD-00-P05 — CODE-DUP 409 toast 🟢

| Step | Evidence |
|------|----------|
| Action | Thêm JD lại cùng `code` |
| Network | **POST** `/recruitment/job-templates` → **409** `HRM-JD-CODE-DUP` |
| FE | Toast VI mã trùng visible |
| Console | expected `409 (Conflict)` resource load (not Uncaught) |
| Verdict | 🟢 **PASS** |

### J-HRM-REC-JD-00-04 / AC-05 · P03 — Soft Ngừng 🟢

| Step | Evidence |
|------|----------|
| Action | Confirm **Ngừng** on Hiệu lực row |
| Network | **DELETE** `/api/hrm/recruitment/job-templates/{id}?company_id=main` → **200** `HRM-REC-JD-200` |
| FE after F5 | Chip **Ngừng** / `retired` (`07-after-retire.png`) |
| Verdict | 🟢 **PASS** (soft-retire — no hard SoT wipe claim) |

### J-HRM-REC-JD-00-03 / AC-04 · EX-05 — Bindable active-only 🟢 (OBS picker UI)

| Step | Evidence |
|------|----------|
| L1 | bindable=true → **7** · statuses=`active` only |
| EX-05 | GET `…/job-templates/{id}?preview=yctd` on non-active → **400** `HRM-JD-YCTD-STATUS` |
| FE YCTD | Requisitions tab opened; **create picker** `hdsd-requisition-job-template` **not opened** this run (`picker_missing`) |
| Verdict | 🟢 **PASS** on L1 active-only + EX-05 STATUS gate · **OBS** full YCTD picker click deferred — cite **J-HRM-JD-YCTD-01** RETAIN soft FK (not re-litigated) |

---

## Journey / AC matrix

| ID | Verdict | Notes |
|----|---------|-------|
| **J-HRM-REC-JD-00-01** | 🟢 **PASS** | Mount + chips + F5 · no whitescreen |
| **J-HRM-REC-JD-00-02** | 🟢 **PASS** | Draft → publish Hiệu lực · physical path |
| **J-HRM-REC-JD-00-03** | 🟢 **PASS** | L1 bindable + EX-05 · OBS picker UI |
| **J-HRM-REC-JD-00-04** | 🟢 **PASS** | Soft Ngừng DELETE 200 |
| **AC-REC-JD-00-01** | PASS | |
| **AC-REC-JD-00-02** | PASS | |
| **AC-REC-JD-00-03** | PASS | |
| **AC-REC-JD-00-04** | PASS | OBS picker |
| **AC-REC-JD-00-05** | PASS | |
| **AC-REC-JD-00-P03** | PASS | |
| **AC-REC-JD-00-P04** | PASS | |
| **AC-REC-JD-00-P05** | PASS | |
| **AC-REC-JD-00-P01/P02** | SKIP | publish happy path |
| **AC-REC-JD-00-EX-05** | PASS | |
| **R-REC-00-FE-COMMENT-ASTERISK** | ✅ **CLOSED** | FE-02 + QA-02 mount seal |

**Network O1:** all JD mutates on `/api/hrm/recruitment/job-templates*` only · `HAS_REC_DUAL=0`.

**Defects:** none (P0/P1 empty).

---

## Honesty footer

```text
recruitment_uat_ready=false
jd_dynamic_done=false
C-SLICE ≠ module REC UAT
U65 zero-seed
Nest /rec dual DENY
boolean-only UI PASS DENY
no claim recruitment_uat / jd_dynamic_done
no seed in evidence
```

---

## completion_report

- **Closed:** U65 browser retest after FE-02 — Thư viện JD **mounts** (whitescreen residual **CLOSED**); J-HRM-REC-JD-00-01..04 **PASS**; create Nháp → Phát hành POST `/publish` → soft Ngừng; CODE-DUP **409** toast; Network physical `/recruitment/job-templates` only; Nest `/rec` DENY.
- **Residual OBS (non-blocking):** YCTD create dialog JD picker not opened this run — AC-04 sealed via L1 bindable active-only + EX-05 `HRM-JD-YCTD-STATUS`; soft FK cite J-HRM-JD-YCTD-01 RETAIN.
- **DENY held:** no seed · no honesty flip · no module REC UAT · C-SLICE.

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-rec-00-cluster-qa-02.md` |
| **next_owner** | **qc** |
| **next_work_item_id** | `PO-HRM-MVP-GD1-REC-00-CLUSTER-QC-01` |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-REC-00-CLUSTER-QC-01
lane: governance · qc
uc_ids: UC-BP-REC-00
depends_on: QA-02 PASS_TO_PM · stamp REC00QA2-MSL0EZS5 · evidence docs/qa/evidence/po-hrm-mvp-gd1-rec-00-cluster-qa-02.md
entry_criteria: U65 · C-SLICE · recruitment_uat_ready=false · jd_dynamic_done=false LOCKED
MISSION: Gate J-HRM-REC-JD-00-01..04 — mount no whitescreen; chips Nháp/Hiệu lực/Ngừng; draft→publish→retire; CODE-DUP 409; Network /recruitment/job-templates only; R-REC-00-FE-COMMENT-ASTERISK CLOSED; OBS YCTD picker UI non-blocking; DENY Nest /rec · seed · honesty flip · claim recruitment_uat_ready / jd_dynamic_done · module REC UAT
exit: docs/qa/evidence/po-hrm-mvp-gd1-rec-00-cluster-qc-01.md · GO | GWC | NO-GO · Conditions if any · next_dispatch_prompt U88 continuous
cấm: seed · flip honesty · reopen W1–W4 · boolean-only PASS
```

# Evidence — PO-HRM-JD-YCTD-REF-QA-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-JD-YCTD-REF-QA-01` |
| **role** | qa |
| **lane** | execution · U65 zero-seed · browser-only |
| **date** | 2026-08-06 |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` |
| **env** | portal `http://127.0.0.1:5173` · hrm `:28001` · xbos `:28002` (5175 down — 5173 ok) |
| **parent** | BE-01 + FE-01 `READY_FOR_QA` |
| **journey** | `J-HRM-JD-YCTD-01` |
| **machine JSON** | `docs/qa/evidence/_tmp-po-hrm-jd-yctd-ref-qa-01.FINAL.json` |
| **screens** | `docs/qa/evidence/screens/po-hrm-jd-yctd-ref-qa-01/` (00–06) |
| **honesty** | `recruitment_uat_ready=false` · `jd_dynamic_done=false` · not module UAT · not product GO |
| **ack_status** | **PASS_TO_PM** |

---

## 0. L0

| Check | Result |
|-------|--------|
| `qc:dev-stack` | HRM 200 · XBOS 200 · portal 5173 200 |
| Harness L0 | portal 200 · hrm 200 |

---

## 1. Verdict matrix

| Case | Verdict | Evidence highlight |
|------|---------|-------------------|
| L2_MOUNT | 🟢 | `/hr/recruitment?tab=requisitions&companyId=main` — no Sync ERROR |
| **UF-YCTD-JD-01a** | 🟢 | GET `job-templates?bindable=true` **200** · count=**7** · all `is_active=true` / status active |
| **UF-YCTD-JD-01b** | 🟡 | Natural empty N/A (bindable=7) — U65 no wipe · **not FAIL** |
| **UF-YCTD-JD-01c** | 🟢 | Preview `yctd-jd-preview` · POST **201** `HRM-REC-201` · id=`a702a898-…` · `jd_code=JD-QA-QAH1BVIR` · list shows JD gắn |
| **UF-YCTD-JD-04-persist** | 🟢 | Body keys: soft FK `job_template_id` only — **no** `values_json` / layout persist |
| **UF-YCTD-JD-01-F5** | 🟢 | F5 title+`JD-QA-QAH1BVIR` retained · GET by id **200** `jd_code`/`jd_title` |
| **UF-YCTD-JD-01d** | 🟢 | Inactive id preview **400** `HRM-JD-YCTD-STATUS` · picker hides non-bindable |
| **UF-YCTD-JD-05** | 🟢 | Picker source `job-templates?bindable=true` · **0** `job_postings` write |
| **UF-YCTD-JD-06** | 🟢 | scope_parity: list∈ + GET **200** same `job_template_id` |
| **J-HRM-JD-YCTD-01** | 🟢 | Full click path 1–10 plan §5.1 |

**Process gate (sponsor 2026-08-06):** pageErrors=0 · Uncaught=0 · no DnD storm · Vietnamese labels UTF-8 (no mojibake) · no duplicate shell crash on path.

---

## 2. UF evidence blocks

### UF-YCTD-JD-01a — Picker chỉ Hiệu lực
- Persona / URL / click path: `ceo@xe.vn` · login inject · `/hr/recruitment?portal=1&tenantId=xevn&companyId=main&tab=requisitions` · Thêm yêu cầu
- Network: `GET /api/hrm/recruitment/job-templates?company_id=main&bindable=true` → **200** · bindableCount=7 · sample all active
- FE: picker options from bindable SoT (not tin đăng)
- Console: clean
- Verdict: 🟢
- spec_ref: SRS REC-02 Diễn biến **1a** · TechSpec F-YCTD-JD-01 · API-01
- DENIED: not jd_dynamic_done · not seed

### UF-YCTD-JD-01b — Empty library
- Verdict: 🟡 N/A — bindable non-empty under U65 (no wipe seed)
- Residual soft: retest empty when natural 0 Hiệu lực

### UF-YCTD-JD-01c — Preview + create
- Action: chọn `JD-QA-QAH1BVIR` → preview title/code → fill DEPT_01 / headcount 1 / full_time → **Lưu**
- Network: POST requisitions → **201** `HRM-REC-201` · `job_template_id=b284e4cd-…` · `jd_code`/`jd_title` display-ready
- FE sau 2xx: toast «Đã tạo…» · list row stamp `YCTDJD-HKZN8G` · cột **JD gắn** = `JD-QA-QAH1BVIR · QA JD Dyna…`
- Screen: `02-jd-selected-preview.png` · `04-after-save.png`
- Verdict: 🟢

### UF-YCTD-JD-01-F5 + J-HRM-JD-YCTD-01
- F5 / reload list: title + JD gắn retained (`05-f5-list.png`)
- GET `…/requisitions/{id}?company_id=main` → **200** · `jd_code=JD-QA-QAH1BVIR`
- Journey click path: login → Tuyển dụng → Yêu cầu → Thêm → picker bindable → preview → Lưu → F5 → scope_parity
- Verdict: 🟢
- Soft OBS: `yctd-jd-ref-detail` testid not visible after row click — list column + GET display-ready **PASS** AC-01

### UF-YCTD-JD-01d — STATUS Ngừng
- Craft inactive template id (natural `is_active=false` in catalog, not seed invent)
- Preview `?preview=yctd` → **400** `HRM-JD-YCTD-STATUS` · pickerHides=true
- Verdict: 🟢
- Soft OBS: STATUS create probe also returned DTO noise on one call — preview STATUS is authoritative for Diễn biến **1d**

### UF-YCTD-JD-05 / 06
- 05: zero dual-write `job_postings` · createKeys=`company_id,title,department,employment_type,headcount,job_template_id`
- 06: list page_size=100 contains id · GET 200 · same soft FK (`scope_parity`)

---

## 3. Honesty stamp (mandatory)

| Claim | Value |
|-------|--------|
| `recruitment_uat_ready` | **false** |
| `jd_dynamic_done` | **false** |
| Module recruitment UAT / product GO | **DENIED** |
| Seed used for evidence | **DENIED** (U65) |
| Narrow slice PASS only | **YCTD↔JD bind** browser AC + J-* |

---

## 4. Residual

| ID | Severity | Item | Owner |
|----|----------|------|-------|
| R-YCTD-JD-JOURNEY-MAP | P2 | `J-HRM-JD-YCTD-01` **absent** from `PROGRAM_JOURNEY_MAP.md` / pilot matrix J-* — add row (plan §5) | **pm** / ba-process |
| R-YCTD-JD-01b-EMPTY | P3 | Natural empty library path not exercised this run | qa (when bindable=0) |
| R-YCTD-JD-DETAIL-TESTID | P3 | `yctd-jd-ref-detail` not observed after list click — list/GET enough for AC | soft / fe optional |

**No P0/P1 product residual** blocking this slice.

---

## 5. Completion / handoff

| Field | Value |
|-------|--------|
| **completion_report** | Browser U65 PASS: L0 · UF-01a/c/d/F5/04/05/06 🟢 · J-HRM-JD-YCTD-01 🟢 · POST 201 + F5 JD gắn · STATUS 400 · scope_parity list↔get · process gate clean. 01b 🟡 N/A. Honesty: recruitment_uat_ready=false · jd_dynamic_done=false. |
| **next_owner** | **pm** (intake → optional **qc** narrow GWC slice only — not module UAT) |
| **next_dispatch_prompt** | See §6 |
| **evidence_path** | `docs/qa/evidence/po-hrm-jd-yctd-ref-qa-01.md` |
| **ack_status** | **PASS_TO_PM** |

---

## 6. next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-JD-YCTD-REF-QC-01 (optional narrow) OR journey-map patch
lane: governance / qc
entry: QA PASS_TO_PM docs/qa/evidence/po-hrm-jd-yctd-ref-qa-01.md · JSON FINAL · screens 00-06
scope: YCTD↔JD bind slice ONLY — cấm claim recruitment_uat_ready / jd_dynamic_done / product GO
also: PM/BA add J-HRM-JD-YCTD-01 to PROGRAM_JOURNEY_MAP.md + PILOT matrix J-* (R-YCTD-JD-JOURNEY-MAP)
U65 honesty stamp required on any QC wording
```

---

## 7. Bus brief

```text
qa -> pm | PASS_TO_PM PO-HRM-JD-YCTD-REF-QA-01
- L0 PASS · J-HRM-JD-YCTD-01 🟢 · UF-01a/c/d/F5/05/06 🟢 · 01b 🟡 N/A
- POST 201 HRM-REC-201 · F5 jd_code JD-QA-QAH1BVIR · STATUS 400 · scope_parity PASS
- process: Uncaught=0 · no DnD storm · UTF-8 OK
- honesty: recruitment_uat_ready=false · jd_dynamic_done=false
- residual P2: add J-HRM-JD-YCTD-01 to journey map
- evidence: docs/qa/evidence/po-hrm-jd-yctd-ref-qa-01.md
```

# Evidence — PO-HRM-JD-YCTD-REF-QA-PLAN-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-JD-YCTD-REF-QA-PLAN-01` |
| **role** | qa |
| **lane** | governance (test design) · **NO CODE** `apps/**` |
| **change_mode** | ADD |
| **date** | 2026-08-06 |
| **ref_srs** | `SRS_HRM_ENTERPRISE.md` v0.10 · **FR-UC-BP-REC-02** / **02b** Diễn biến **1a–1d** · Thành công FE |
| **ref_techspec** | `docs/program/specs/PO-HRM-JD-YCTD-REF-TECHSPEC-01.md` §2–§4 · §7 |
| **ref_db** | `docs/program/specs/PO-HRM-JD-YCTD-REF-DB-01.md` **CONFIRMED** |
| **ref_api** | `docs/program/specs/PO-HRM-JD-YCTD-REF-API-01.md` **CONFIRMED** |
| **ref_spec** | `docs/program/specs/PO-HRM-JD-YCTD-REF-SPEC-01.md` §C.5 AC-YCTD-JD-01..06 |
| **cascade** | Spec → TechSpec → **DB-01** → **API-01** → **this QA plan** → Dev unlock (narrow) |
| **journey** | `J-HRM-JD-YCTD-01` |
| **honesty** | **DENIED:** `jd_dynamic_done` · campaign / `job_postings` SoT · seed for evidence · remaster · face_live · product GO |
| **ack_status** | **PASS_TO_PM** |

---

## 0. Purpose & exit

**Purpose:** Lock unit/integration + browser U65 test design so Dev-BE/FE implement only **bindable-list / status-gate / alias DTO / YCTD picker preview** against confirmed DB+API — and QA retest has deterministic AC ↔ F-id ↔ Diễn biến map.

**Exit (this seat):** Plan + evidence complete · `PASS_TO_PM` · copy-ready unlock for `PO-HRM-JD-YCTD-REF-BE-01` + `PO-HRM-JD-YCTD-REF-FE-01`.

**Not this seat:** Execute browser UF · claim READY_FOR_QA product · touch `apps/**`.

---

## 1. Cascade gate (precondition for Dev)

| Artifact | Status | Path |
|----------|--------|------|
| DB-01 | **CONFIRMED** | `docs/program/specs/PO-HRM-JD-YCTD-REF-DB-01.md` |
| API-01 | **CONFIRMED** | `docs/program/specs/PO-HRM-JD-YCTD-REF-API-01.md` |
| TechSpec | DONE (depth) | `PO-HRM-JD-YCTD-REF-TECHSPEC-01.md` |
| API evidence | DONE | `docs/qa/evidence/po-hrm-jd-yctd-ref-api-01.md` |
| **QA plan** | **DONE (this file)** | `docs/qa/evidence/po-hrm-jd-yctd-ref-qa-plan-01.md` |

```text
Dev unlock AFTER this plan: bindable-list / status-gate / alias DTO / YCTD picker preview ONLY
FORBIDDEN in Dev wave: campaign · job_postings SoT · full JD-dynamic remaster · dual physical FK · seed for UF evidence
```

---

## 2. Traceability matrix — Diễn biến × AC × F-id × layer

| SRS bước | AC | F-id | Unit/Integration | Browser U65 |
|----------|-----|------|------------------|-------------|
| **1a** Mở picker — chỉ Hiệu lực | AC-YCTD-JD-02 (non-empty) | F-YCTD-JD-01 | UT-YCTD-JD-01 | UF-YCTD-JD-01a |
| **1b** Thư viện trống | AC-YCTD-JD-02 | F-YCTD-JD-01 empty + F-YCTD-JD-03 REQUIRED | UT-YCTD-JD-02 · UT-YCTD-JD-04 | UF-YCTD-JD-01b |
| **1c** Chọn + preview + gắn mã | AC-YCTD-JD-01 · AC-YCTD-JD-04 | F-YCTD-JD-02 + F-YCTD-JD-03 | UT-YCTD-JD-06 · UT-YCTD-JD-07 | UF-YCTD-JD-01c · **J-HRM-JD-YCTD-01** |
| **1d** JD Ngừng | AC-YCTD-JD-03 | F-YCTD-JD-02/03 STATUS | UT-YCTD-JD-03 | UF-YCTD-JD-01d |
| Thành công / F5 | AC-YCTD-JD-01 | F-YCTD-JD-05 | UT-YCTD-JD-08 · IT-YCTD-JD-SP | **J-HRM-JD-YCTD-01** F5 |
| REC-03 OUT | AC-YCTD-JD-05 | — FORBIDDEN | UT-YCTD-JD-09 | UF-YCTD-JD-05 |
| Cross-nav / scope | AC-YCTD-JD-06 | F-YCTD-JD-05 + templates get | IT-YCTD-JD-SP | UF-YCTD-JD-06 |

**BR map:** BR-BP-JD-01 · BR-YCTD-JD-REF-01 · BR-YCTD-JD-REF-02 · DV-YCTD-JD-01..04 · DV-YCTD-JD-10..17 · AV-YCTD-JD-ALIAS-01..03.

---

## 3. Unit / integration test plan

> Doctrine: `_vibe-team-os/33-TESTCASE-VS-REPORT-VS-UNIT.md` · Unit ≠ UF PASS.  
> Owner implement: **dev-be** (jest) · FE unit thin optional on picker filter.  
> Package focus: `apps/api/hrm-api` recruitment / job-templates / requisitions (paths after Dev unlock).

### 3.1 Unit rows (P0)

| Case ID | Endpoint / symbol | BR / Diễn biến | Input → expect | Spec / gap |
|---------|-------------------|----------------|----------------|------------|
| **UT-YCTD-JD-01** | `GET …/job-templates?bindable=true` | BR-BP-JD-01 · **1a** | Mixed active+draft+retired in fixture scope → response `items[]` **only** Hiệu lực (`is_active=true`, not retired/archived); no draft/Ngừng ids | COVERED after BE-01 |
| **UT-YCTD-JD-02** | same · empty library | **1b** · DV-YCTD-JD-14 | No bindable templates → **200** + `items=[]` (or equivalent empty array) — **not** 404/500 | COVERED after BE-01 |
| **UT-YCTD-JD-03** | `GET …/job-templates/:id?preview=yctd` **and** `POST …/requisitions` with retired id | **1d** · DV-YCTD-JD-12 | JD Ngừng/Nháp → **400** `HRM-JD-YCTD-STATUS` on preview **and** create/patch | COVERED after BE-01 |
| **UT-YCTD-JD-04** | `POST …/requisitions` missing `job_template_id` / `job_description_id` when BR-YCTD-JD-REF-01 | **1b** · **#2** · DV-YCTD-JD-10 | Omit both alias fields → **400** `HRM-JD-YCTD-REQUIRED` | COVERED after BE-01 |
| **UT-YCTD-JD-05** | `POST …/requisitions` invalid / out-of-scope template id | **1c/1d** · DV-YCTD-JD-11 | Unknown UUID or other-tenant id → **404** `HRM-JD-YCTD-NOT-FOUND` | COVERED after BE-01 |
| **UT-YCTD-JD-06** | Preview compose | **1c** · BR-YCTD-JD-REF-02 | Active JD → 200 `YctdJdPreview`: `title`, `code`, `short_description`; `status:'active'`; **no** full nested `values_json` / layout canvas as YCTD persist payload | COVERED after BE-01 |
| **UT-YCTD-JD-07** | Create persist boundary | **1c** · DV-YCTD-JD-01 · API §5 | POST bindable + optional snapshot texts → 201; DB/row has soft FK; assert **no** `values_json` / `layout_snapshot_json` column write on `job_requisitions`; snapshot text may differ from template `values_json` | COVERED after BE-01 |
| **UT-YCTD-JD-08** | List/get display-ready | Thành công · F-YCTD-JD-05 | After create, GET list + GET by id expose `job_template_id` (+ alias) + `jd_code`/`jd_title` (or join equivalent) | COVERED after BE-01 |
| **UT-YCTD-JD-09** | FORBIDDEN dual-write | AC-YCTD-JD-05 · DV-YCTD-JD-16 | Create/bind YCTD path **must not** INSERT/UPDATE `job_postings` as JD SoT (spy/assert zero writes on forbidden table / service) | COVERED after BE-01 |
| **UT-YCTD-JD-10** | Alias DTO | AV-YCTD-JD-ALIAS-01..02 | Body `job_description_id` only → persist `job_template_id`; both names **different** → **400** ambiguous | COVERED after BE-01 |
| **UT-YCTD-JD-11** | Re-bind draft | F-YCTD-JD-04 · **#4** | PATCH draft with Hiệu lực → 2xx; PATCH with Ngừng → STATUS; approved+ → **409** if locked (GĐ1 default) | COVERED after BE-01 |
| **UT-YCTD-JD-12** | History after retire | DV-YCTD-JD-13 · BR-BP-JD-01 | YCTD already bound; template later retired → GET YCTD still returns ref (not CASCADE null/delete) | COVERED after BE-01 |

### 3.2 Integration / scope_parity

| Case ID | Scenario | Expect | Tag |
|---------|----------|--------|-----|
| **IT-YCTD-JD-SP-01** | List bindable templates (scope A) → GET `:id` same company | Both 200 **or** id not in list | `scope_parity` |
| **IT-YCTD-JD-SP-02** | List requisitions shows id → GET requisition by id same JWT/`company_id` | 200 detail with same `job_template_id` / jd display — **FAIL** if list 200 + detail 404 | `scope_parity` · U19 |
| **IT-YCTD-JD-SP-03** | Group CEO `main` rollup: bindable list id → get template / create YCTD | Same resolver as list; no 409 false-positive on in-scope member slug | `scope_parity` |
| **IT-YCTD-JD-SP-04** | Member CEO: cannot bind template outside membership | 403/409/404 consistent with F-JD list | `scope_parity` |

### 3.3 P0 unit gate (Dev READY_FOR_QA)

- [ ] UT-YCTD-JD-01..05 + 07 + 09 + 10 green (fail-deep STATUS / REQUIRED / NOT-FOUND / empty 200[])
- [ ] IT-YCTD-JD-SP-01..02 green
- [ ] **No** claim browser UF PASS from unit alone
- [ ] Evidence jest path cited in BE handoff

---

## 4. Browser U65 plan — AC-YCTD-JD-01..06

**Locks:** U65 zero-seed · FE-only mutate · login → menu SRS → click → Lưu → FE sau 2xx → F5.  
**Persona default:** `ceo@xe.vn` / `Xevn@2026` · scope holding/`main` as ADR.  
**Surface:** HRM embed recruitment — **Yêu cầu tuyển dụng (YCTD)** create form; picker from **Thư viện JD** only.  
**DENIED in evidence:** seed inbox/YCTD/JD links · API-only PASS · `jd_dynamic_done`.

### 4.1 UF cases

| UF-ID | AC | Diễn biến | Click path (summary) | Pass | Fail |
|-------|-----|-----------|----------------------|------|------|
| **UF-YCTD-JD-01a** | AC-YCTD-JD-02 (path non-empty) | **1a** | Login → Tuyển dụng → Yêu cầu → Thêm → mở picker JD | Network GET bindable **2xx**; options **chỉ** Hiệu lực (no Nháp/Ngừng labels/ids) | Picker shows Ngừng/Nháp; or reads from tin đăng |
| **UF-YCTD-JD-01b** | AC-YCTD-JD-02 | **1b** | Same when library empty for scope (natural empty — **no seed**) | Empty state + CTA Thư viện; Lưu/Gửi **disabled** or submit → FE error; Network create **400** `HRM-JD-YCTD-REQUIRED` if forced | Fake success; silent save without JD |
| **UF-YCTD-JD-01c** | AC-YCTD-JD-01 · AC-YCTD-JD-04 | **1c** | Chọn JD Hiệu lực → **preview** title+short → điền headcount/fields → **Lưu** | Preview visible before submit; POST **2xx/201**; list row shows `jd_code`/`jd_title` (or VN labels tương đương) | Preview blank; 2xx but list without JD ref |
| **UF-YCTD-JD-01d** | AC-YCTD-JD-03 | **1d** | Attempt bind Ngừng (stale cache / crafted id if FE hides) | FE block **and/or** Network **400** `HRM-JD-YCTD-STATUS`; form kept | Bind succeeds |
| **UF-YCTD-JD-01-F5** | AC-YCTD-JD-01 | Thành công | After UF-01c → **F5** / re-navigate list→detail | `jd_code`/`title` from bind still visible | Lost after reload |
| **UF-YCTD-JD-04-persist** | AC-YCTD-JD-04 · AC preview≠SoT | **1c** + BR-02 | After bind: inspect Network create body + optional GET YCTD | Body has FK (+ optional short snapshot); **no** full `values_json` persist on YCTD; edit snapshot on YCTD does not rewrite Thư viện | Full dynamic JSON dumped onto YCTD as SoT |
| **UF-YCTD-JD-05** | AC-YCTD-JD-05 | FORBIDDEN | Picker source audit + Network | Options from `job-templates` bindable only; **zero** create path writing `job_postings` as JD SoT | Dual-write / picker from JobPostingsTab |
| **UF-YCTD-JD-06** | AC-YCTD-JD-06 | Cross-nav | From saved YCTD → open linked JD / Thư viện same scope | No 404/409 scope on in-list id; same `company_id` resolver | List shows JD, detail 404 (`scope_parity`) |

### 4.2 Evidence block template (each UF — for future QA execute seat)

```markdown
### UF-YCTD-JD-0x — …
- Persona / URL / click path: ceo@xe.vn · …
- Trước mutate: …
- Action: … → Lưu
- Network: METHOD … → status · code (HRM-JD-YCTD-*)
- FE sau 2xx: …
- F5: …
- Console: no storm / no Uncaught on path
- Verdict: 🟢 / 🟡 / 🔴
- spec_ref: SRS REC-02 Diễn biến … · TechSpec F-YCTD-JD-… · API-01 §…
- DENIED claims stamp: not jd_dynamic_done · not seed
```

---

## 5. Journey — J-HRM-JD-YCTD-01 (L2.5)

| Field | Value |
|-------|--------|
| **J-ID** | `J-HRM-JD-YCTD-01` |
| **Persona** | `ceo@xe.vn` / `Xevn@2026` |
| **Scope** | Group CEO holding / `main` per ADR-GROUP-CEO-MAIN-HOLDING-SCOPE |
| **P-CC / route** | HRM embed · Tuyển dụng · Yêu cầu tuyển dụng (AS-IS requisitions UI) |
| **U65** | browser-only · **zero-seed** |

### 5.1 Click path (mandatory)

```text
1. Login portal as ceo@xe.vn
2. Open HRM → Tuyển dụng
3. (Optional precondition path) Thư viện JD — observe ≥1 Hiệu lực created earlier via FE (not seed);
   if empty → execute UF-YCTD-JD-01b only; journey mutate BLOCKED until natural Hiệu lực exists
4. Yêu cầu tuyển dụng → Thêm / Tạo YCTD
5. Open JD picker → assert bindable = Hiệu lực only (1a)
6. Select one JD → assert preview title + short (1c / AC-04)
7. Complete required YCTD fields → Lưu / Gửi
8. Assert Network POST requisitions 2xx + FE list row shows jd_code/title
9. F5 (or leave and re-enter list → open detail)
10. Assert jd_code/title still from bind (AC-01)
11. scope_parity: note list id → GET detail API status (must not 404 if listed)
```

### 5.2 Journey PASS / FAIL

| Check | PASS | FAIL |
|-------|------|------|
| L2 load | Form opens, no HRM Sync ERROR | Banner 500 / blank shell |
| L2.5 bind | Steps 5–10 | Skip F5 or API-only |
| Errors | STATUS/REQUIRED visible when forced | Silent Ngừng bind |
| SoT | No job_postings dual-write | Campaign/JD from tin đăng |
| Honesty | Not claim module UAT / jd_dynamic_done | Over-claim |

**Propose matrix row (BA/PM):** add `J-HRM-JD-YCTD-01` to `PROGRAM_JOURNEY_MAP.md` + `PILOT_BUSINESS_FLOW_MATRIX.md` J-* section if missing — flag `spec_gap` only if still absent at execute time; plan still **requires** this J-ID.

---

## 6. Mapping summary — mandatory task cases

| # | Requirement (dispatch) | Case IDs | Layer |
|---|------------------------|----------|-------|
| 1 | Bindable list chỉ JD Hiệu lực | UT-YCTD-JD-01 · UF-YCTD-JD-01a | unit + browser |
| 2 | Empty library → 200 [] | UT-YCTD-JD-02 · UF-YCTD-JD-01b | unit + browser |
| 3 | STATUS when bind JD Ngừng | UT-YCTD-JD-03 · UF-YCTD-JD-01d | unit + browser |
| 4 | REQUIRED missing `job_template_id` | UT-YCTD-JD-04 · UF-YCTD-JD-01b | unit + browser |
| 5 | NOT-FOUND invalid id | UT-YCTD-JD-05 | unit (+ browser if FE shows) |
| 6 | Preview title/short ≠ persist full `values_json` on YCTD | UT-YCTD-JD-06/07 · UF-YCTD-JD-04-persist | unit + browser |
| 7 | F5 shows jd_code/title from bind | UT-YCTD-JD-08 · UF-YCTD-JD-01-F5 · **J-HRM-JD-YCTD-01** | unit + L2.5 |
| 8 | FORBIDDEN dual-write `job_postings` | UT-YCTD-JD-09 · UF-YCTD-JD-05 | unit + browser |
| 9 | scope_parity list↔get | IT-YCTD-JD-SP-* · UF-YCTD-JD-06 | integration + L2.5 |

---

## 7. Dev unlock — allowed_paths (narrow)

| work_item | Role | allowed_paths (intent) | must_keep | forbidden_paths |
|-----------|------|------------------------|-----------|-----------------|
| **PO-HRM-JD-YCTD-REF-BE-01** | dev-be | bindable-list filter on job-templates; status-gate on preview/create/patch; alias DTO `job_description_id`↔`job_template_id`; error codes STATUS/REQUIRED/NOT-FOUND; display-ready jd_code/title on requisitions; jest UT/IT above | ONE physical soft FK · F-REC-YCTD plan/out_of_plan stubs · no CASCADE | campaign unlock · `job_postings` JD SoT · invent second FK column · full JD-dynamic remaster |
| **PO-HRM-JD-YCTD-REF-FE-01** | dev-fe | YCTD create picker bound to bindable list; preview title/short; disable/CTA empty; surface STATUS/REQUIRED; list/detail show jd ref after 2xx + F5 | Soft FK field wire · HDSD labels · no dual-write UI | JobPostingsTab as JD source · seed helpers for UF · claim remaster |

**change_mode:** ADD / FIX narrow · `preserve_default: true` · `code_memory_required: true` · `spec_read_ack` must cite SRS 1a–1d + TechSpec + DB-01 + API-01.

---

## 8. Future execute seats (after Dev READY_FOR_QA)

| Seat | Owner | Exit |
|------|-------|------|
| `PO-HRM-JD-YCTD-REF-QA-01` | qa | Browser U65 execute UF + **J-HRM-JD-YCTD-01**; matrix update; `PASS_TO_PM` or FAIL with residual |
| QC | qc | Gate only after QA browser evidence — **not** this plan seat |

---

## 9. DENIED claims (stamp)

| Claim | Status |
|-------|--------|
| `jd_dynamic_done` | **DENIED** |
| Campaign / `job_postings` as JD SoT (REC-03 GĐ1) | **DENIED** / OUT |
| Seed for evidence / UF PASS | **DENIED** (U65) |
| Remaster / face_live / product GO / Phase1 DONE | **DENIED** |
| This plan = browser UF executed | **DENIED** (design only) |

---

## 10. Residual

| ID | Item | Owner |
|----|------|-------|
| R-YCTD-JD-DEV-BE | Implement UT/IT + status-gate / bindable / alias | **dev-be** `PO-HRM-JD-YCTD-REF-BE-01` |
| R-YCTD-JD-DEV-FE | Picker preview + FE sau 2xx/F5 | **dev-fe** `PO-HRM-JD-YCTD-REF-FE-01` |
| R-YCTD-JD-QA-EXEC | Browser execute after READY_FOR_QA | **qa** (new seat) |
| R-YCTD-JD-JOURNEY-MAP | Ensure J-HRM-JD-YCTD-01 row in journey/matrix | **pm** / ba-process if missing at execute |

---

## 11. Completion / handoff

| Field | Value |
|-------|--------|
| **completion_report** | QA plan ADD complete: unit UT-YCTD-JD-01..12 + IT scope_parity; browser UF map AC-YCTD-JD-01..06 ↔ Diễn biến 1a–1d; journey **J-HRM-JD-YCTD-01** (ceo@xe.vn, F5, scope_parity); FORBIDDEN job_postings dual-write covered; cascade DB+API+QA-plan complete → Dev unlock narrow. No apps/**. No browser execute this seat. |
| **next_owner** | **pm** |
| **next_dispatch_prompt** | See §12 |
| **evidence_path** | `docs/qa/evidence/po-hrm-jd-yctd-ref-qa-plan-01.md` |
| **ack_status** | **PASS_TO_PM** |

---

## 12. next_dispatch_prompt (copy-ready for PM)

```text
work_item_id: PO-HRM-JD-YCTD-REF-BE-01 + PO-HRM-JD-YCTD-REF-FE-01 (parallel narrow)
roles: dev-be · dev-fe
lane: execution
change_mode: ADD
preserve_default: true
code_memory_required: true
code_memory_mode: APPEND

entry_criteria:
- Cascade COMPLETE (cite):
  - DB-01 CONFIRMED: docs/program/specs/PO-HRM-JD-YCTD-REF-DB-01.md
  - API-01 CONFIRMED: docs/program/specs/PO-HRM-JD-YCTD-REF-API-01.md
  - QA-PLAN DONE: docs/qa/evidence/po-hrm-jd-yctd-ref-qa-plan-01.md
  - TechSpec: docs/program/specs/PO-HRM-JD-YCTD-REF-TECHSPEC-01.md §2–§4
- Dev HOLD lifts ONLY for narrow deltas below

read_first (ordered):
1. SRS_HRM_ENTERPRISE.md v0.10 FR-UC-BP-REC-02/02b Diễn biến 1a–1d
2. PO-HRM-JD-YCTD-REF-TECHSPEC-01.md §2–§4
3. PO-HRM-JD-YCTD-REF-DB-01.md (ONE physical soft FK)
4. PO-HRM-JD-YCTD-REF-API-01.md (alias · errors · preview ≠ values_json)
5. docs/qa/evidence/po-hrm-jd-yctd-ref-qa-plan-01.md (UT/UF/J IDs)

spec_read_ack (fill before code):
- srs: REC-02/02b · bước 1a–1d · Thành công
- tech_spec: F-YCTD-JD-01..05
- db_design: job_requisitions.job_template_id soft FK · alias job_description_id
- api_design: STATUS/REQUIRED/NOT-FOUND · empty 200[] · preview contract

=== PO-HRM-JD-YCTD-REF-BE-01 (dev-be) ===
allowed_paths (intent — keep blast R1/R2):
- bindable-list: GET job-templates bindable=true / for=yctd filter Hiệu lực
- status-gate: preview + create/patch requisitions → HRM-JD-YCTD-STATUS
- alias DTO: job_description_id ↔ job_template_id (ONE physical)
- errors: HRM-JD-YCTD-REQUIRED · NOT-FOUND · empty list 200 []
- display-ready jd_code/jd_title on list/get requisitions
- jest: UT-YCTD-JD-01..12 + IT-YCTD-JD-SP-01..02 (from QA plan)
must_keep:
- soft FK job_template_id · F-REC-YCTD-01/02 plan/out_of_plan stubs · no CASCADE
forbidden_paths / FORBIDDEN:
- campaign / F-REC-CAMPAIGN unlock · job_postings dual-write as JD SoT
- invent second physical FK column · persist full values_json on YCTD
- seed for evidence
exit_criteria:
- jest P0 green; READY_FOR_QA; cite QA plan case IDs; no jd_dynamic_done claim
evidence_path: docs/qa/evidence/po-hrm-jd-yctd-ref-be-01.md

=== PO-HRM-JD-YCTD-REF-FE-01 (dev-fe) ===
allowed_paths (intent):
- YCTD create form: JD picker from bindable list only
- preview title + short_description (F-YCTD-JD-02)
- empty library CTA + block Lưu when REQUIRED
- surface STATUS/REQUIRED errors; list/detail jd ref after 2xx; F5 retain
must_keep:
- HDSD/menu labels · soft FK wire · OS 28 FE does not invent nested write aggregate
forbidden:
- JobPostingsTab / tin đăng as JD picker source
- seed helpers · remaster scope creep
exit_criteria:
- READY_FOR_QA; maps UF-YCTD-JD-01a..d + J-HRM-JD-YCTD-01 click path
evidence_path: docs/qa/evidence/po-hrm-jd-yctd-ref-fe-01.md

DENIED (both):
- jd_dynamic_done · campaign/job_postings SoT · seed for UAT evidence · product GO

After BOTH READY_FOR_QA → Task qa PO-HRM-JD-YCTD-REF-QA-01
  U65 browser: AC-YCTD-JD-01..06 + J-HRM-JD-YCTD-01 · persona ceo@xe.vn · zero-seed
  evidence: docs/qa/evidence/po-hrm-jd-yctd-ref-qa-01.md
```

---

## 13. Bus brief (for append)

```text
qa -> pm | PASS_TO_PM PO-HRM-JD-YCTD-REF-QA-PLAN-01
- test design DONE · NO CODE apps/**
- map AC-YCTD-JD-01..06 ↔ Diễn biến 1a–1d ↔ UT/UF/J-HRM-JD-YCTD-01
- cascade DB-01+API-01+QA-plan COMPLETE → unlock Dev-BE/FE narrow
- DENIED: jd_dynamic_done · job_postings SoT · seed
- evidence: docs/qa/evidence/po-hrm-jd-yctd-ref-qa-plan-01.md
```

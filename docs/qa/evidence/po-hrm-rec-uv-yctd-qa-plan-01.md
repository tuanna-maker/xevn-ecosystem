# Evidence — PO-HRM-REC-UV-YCTD-QA-PLAN-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-REC-UV-YCTD-QA-PLAN-01` |
| **from_role** | qa |
| **to_role** | pm |
| **lane** | governance + test-design · **NO CODE** `apps/**` · **NO browser execute** product |
| **change_mode** | ADD |
| **date** | 2026-08-06 |
| **program** | `W-ALL-PARALLEL-01` |
| **parent** | `PO-HRM-REC-UV-YCTD-API-01` PASS_TO_PM (DB+API **CONFIRMED**) |
| **ref_srs** | `SRS_HRM_ENTERPRISE.md` **v0.11** · **FR-UC-BP-REC-05a** Diễn biến **#1–#6** + Thành công · **FR-UC-BP-REC-06b** Diễn biến **#1–#6** + Thành công |
| **ref_techspec** | `docs/program/specs/PO-HRM-REC-UV-YCTD-TECH-01.md` §2–§3 · §6 |
| **ref_db** | `docs/program/specs/PO-HRM-REC-UV-YCTD-DB-01.md` **CONFIRMED** |
| **ref_api** | `docs/program/specs/PO-HRM-REC-UV-YCTD-API-01.md` **CONFIRMED** |
| **ref_api_evidence** | `docs/qa/evidence/po-hrm-rec-uv-yctd-api-01.md` |
| **doctrine** | `_vibe-team-os/33-TESTCASE-VS-REPORT-VS-UNIT.md` |
| **journeys** | `J-HRM-REC-UV-01` · `J-HRM-REC-CMP-01` |
| **u65** | Future execute = **FE-only · zero-seed** (plan requires; this seat does **not** run browser) |
| **honesty** | `recruitment_uat_ready=false` · `jd_dynamic_done=false` · FORBIDDEN `job_postings` as UV/compare SoT · REC-03 OUT |
| **ack_status** | **PASS_TO_PM** |

---

## 0. Purpose & exit

**Purpose:** Lock world-standard **unit vs UF vs report** clarity and deterministic case IDs so PM can unlock narrow Dev-BE/FE (+ CMP-FE) against confirmed DB+API — without claiming product PASS from this design seat.

**Exit (this seat):** Plan + evidence complete · `PASS_TO_PM` · copy-ready unlock for `PO-HRM-REC-UV-YCTD-BE-01` + `PO-HRM-REC-UV-YCTD-FE-01` (+ `PO-HRM-REC-UV-YCTD-CMP-FE-01`).

**Not this seat:** Browser UF execute · jest code · touch `apps/**` · claim `READY_FOR_QA` product · claim `recruitment_uat_ready`.

---

## 1. Clarity lock — Unit vs UF vs Report (OS 33)

| Artifact | This wave delivers | Answers | Done when | **NOT** done when |
|----------|-------------------|---------|-----------|-------------------|
| **Test Case (TC/UF plan)** | Catalog below: AC ↔ Diễn biến ↔ UT/UF/J | *Will test what, who, steps, expect?* | Design coverage DoD | Browser green |
| **Unit Test Plan** | UT-REC-UV-* · UT-REC-CMP-* · IT-REC-UV-SP-* | *Input X → HTTP/code/throw Y per BR?* | Jest green + BE cites cases | UF 🟢 |
| **UF / Journey (browser U65)** | Click paths · FE sau 2xx · F5 | *User can do HDSD path without seed?* | Future QA execute seat + Test Log | Unit alone |
| **Test Report** | Rollup after execute waves | *How many PASS/FAIL/BLOCKED?* | Updated after each execute | This plan file |

```text
Spec (SRS 05a/06b) → Tech → DB CONFIRMED → API CONFIRMED
  → THIS QA PLAN (design)
  → Dev BE/FE narrow + jest P0
  → QA browser U65 execute (separate seat)
  → Test Report rollup → QC (only after browser evidence)
```

**Cấm nhầm lớp:** plan xong ≠ UAT DONE · unit xanh ≠ UF 🟢 · GWC slice ≠ `recruitment_uat_ready`.

---

## 2. Cascade gate (precondition for Dev)

| Artifact | Status | Path |
|----------|--------|------|
| DB-01 | **CONFIRMED** | `docs/program/specs/PO-HRM-REC-UV-YCTD-DB-01.md` |
| API-01 | **CONFIRMED** | `docs/program/specs/PO-HRM-REC-UV-YCTD-API-01.md` |
| TechSpec | DONE (depth) | `PO-HRM-REC-UV-YCTD-TECH-01.md` |
| API evidence | DONE | `docs/qa/evidence/po-hrm-rec-uv-yctd-api-01.md` |
| **QA plan** | **DONE (this file)** | `docs/qa/evidence/po-hrm-rec-uv-yctd-qa-plan-01.md` |

```text
Dev unlock AFTER this plan: REQUIRED/STATUS/alias/position derive/compare max-N+mix ONLY
FORBIDDEN in Dev wave: job_postings as UV/compare SoT · REC-03 unlock · silent Lane B pool as FR-05a PASS · dual physical FK · seed for UF evidence · recruitment_uat_ready
```

---

## 3. Traceability matrix — Diễn biến × AC × F-id × layer

### 3.1 FR-UC-BP-REC-05a (Thêm UV gắn YCTD)

| SRS bước | AC | F-id | Unit/Integration | Browser U65 |
|----------|-----|------|------------------|-------------|
| **#1** Mở form Thêm UV | — (precond) | F-REC-UV-YCTD-01 | UT-REC-UV-01 | UF-REC-UV-01 |
| **#2** 0 YCTD receivable | empty CTA | F-REC-UV-YCTD-01 empty **200 []** | UT-REC-UV-02 | UF-REC-UV-02 |
| **#3** Chọn YCTD receivable | — | F-REC-UV-YCTD-02 (+ STATUS) | UT-REC-UV-03 · UT-REC-UV-05 | UF-REC-UV-03 |
| **#4** Vị trí derived / no free-text SoT | **AC-REC-UV-03** | F-REC-UV-YCTD-02 · create derive | UT-REC-UV-06 · UT-REC-UV-07 | UF-REC-UV-03 · UF-REC-UV-06 |
| **#5** Lưu thiếu YCTD | **AC-REC-UV-01** | F-REC-UV-YCTD-03 REQUIRED | UT-REC-UV-04 | UF-REC-UV-04 |
| **#6** Lưu đủ | **AC-REC-UV-01/04** | F-REC-UV-YCTD-03 | UT-REC-UV-08 · UT-REC-UV-10 | UF-REC-UV-05 · UF-REC-UV-07 |
| **Thành công** / F5 | **AC-REC-UV-02** | F-REC-UV-YCTD-05 | UT-REC-UV-09 · IT-REC-UV-SP-* | UF-REC-UV-05-F5 · **J-HRM-REC-UV-01** |
| Context from YCTD | **AC-REC-UV-04** | F-REC-UV-YCTD-03 prefill | UT-REC-UV-11 | UF-REC-UV-07 |
| FORBIDDEN postings / Lane B silent | REC-03 OUT | — | UT-REC-UV-12 · UT-REC-UV-13 | UF-REC-UV-08 |

### 3.2 FR-UC-BP-REC-06b (So sánh theo YCTD)

| SRS bước | AC | F-id | Unit/Integration | Browser U65 |
|----------|-----|------|------------------|-------------|
| **#1** Mở so sánh — bộ chọn = YCTD | **AC-REC-CMP-01** | F-REC-UV-YCTD-01 | UT-REC-CMP-01 | UF-REC-CMP-01 |
| **#2** 0 YCTD | **AC-REC-CMP-02** | F-REC-UV-YCTD-01 empty | UT-REC-UV-02 (reuse) | UF-REC-CMP-02 |
| **#3–#4** Chọn YCTD / 0 UV | **AC-REC-CMP-03** | F-REC-CMP-01 | UT-REC-CMP-02 | UF-REC-CMP-03 |
| **#5** ≤ N / vượt N | **AC-REC-CMP-04** | F-REC-CMP-02 | UT-REC-CMP-03 | UF-REC-CMP-04 |
| **#6** chưa đánh giá | **AC-REC-CMP-05** | F-REC-CMP-01 eval_status | UT-REC-CMP-04 | UF-REC-CMP-05 |
| **Thành công** matrix | **AC-REC-CMP-05** | F-REC-CMP-02 | UT-REC-CMP-05 | UF-REC-CMP-05 · **J-HRM-REC-CMP-01** |
| YCTD-MIX | BR-BP-REC-CMP-01 | F-REC-CMP-02 | UT-REC-CMP-06 | UF-REC-CMP-06 |
| FORBIDDEN job_postings filter | **AC-REC-CMP-01** | — | UT-REC-CMP-07 | UF-REC-CMP-01 |

**BR / DV / AV map:** BR-BP-CV-01 · BR-BP-CV-03 · BR-BP-REC-CMP-01 · DV-UV-YCTD-01..04 · DV-UV-YCTD-10..20 · AV-UV-YCTD-ALIAS-01..03.

---

## 4. Unit / integration test plan

> Doctrine: OS **33** — Unit ≠ UF PASS.  
> Owner implement: **dev-be** (jest) · FE thin optional (picker disable / no free-text control).  
> Package focus: `apps/api/hrm-api` recruitment candidates / requisitions / applications / compare (paths after Dev unlock).

### 4.1 Unit rows — UV↔YCTD (P0)

| Case ID | Endpoint / symbol | BR / Diễn biến | Input → expect | Spec / gap |
|---------|-------------------|----------------|----------------|------------|
| **UT-REC-UV-01** | `GET …/requisitions?receivable=true` | **05a #1** · F-01 | Mixed open+closed in fixture → `items[]` **only** receivable; **FORBIDDEN** ids from `job_postings` | COVERED after BE-01 |
| **UT-REC-UV-02** | same · empty | **05a #2** · **06b #2** · DV empty | No receivable → **200** `items=[]` — **not** 404/500 | COVERED after BE-01 |
| **UT-REC-UV-03** | `GET …/requisitions/:id` non-receivable | **05a #3** · DV-12 | `closed`/`on_hold`/draft → **400** `HRM-REC-UV-YCTD-STATUS` (when used as bind target) | COVERED after BE-01 |
| **UT-REC-UV-04** | `POST …/candidates` missing YCTD | **05a #5** · AC-01 · DV-01/10 | Omit both `requisition_id` and `recruitment_request_id` → **400** `HRM-REC-UV-YCTD-REQUIRED` — **not** 201 Lane B pool | COVERED after BE-01 |
| **UT-REC-UV-05** | `POST …/candidates` invalid / OOS YCTD | DV-11 | Unknown UUID / other-tenant → **404** `HRM-REC-UV-YCTD-NOT-FOUND` | COVERED after BE-01 |
| **UT-REC-UV-06** | Position derive | **05a #4** · AC-03 · DV-02/13 | Receivable YCTD → 201 exposes `position_key`/`position_name`/`source:'yctd'`; client `position_key` ≠ YCTD → **400** `HRM-REC-UV-POSITION-MISMATCH` | COVERED after BE-01 |
| **UT-REC-UV-07** | Free-text position SoT | AC-03 · DV-03/14 | Body free-text `position` as sole SoT → reject **or** ignore + assert **not** persisted as SoT | COVERED after BE-01 |
| **UT-REC-UV-08** | Happy create Lane A | **05a #6** · BR-BP-CV-03 | Valid name + receivable `requisition_id` → **201**; row has soft FK; stage initial | COVERED after BE-01 |
| **UT-REC-UV-09** | List/get display-ready | Thành công · AC-02 · DV-04 | GET list + GET by id expose YCTD id (+ alias) + position derived | COVERED after BE-01 |
| **UT-REC-UV-10** | Alias DTO | AV-ALIAS-01..02 | Body `recruitment_request_id` only → persist `requisition_id`; both names **different** → **400** ambiguous | COVERED after BE-01 |
| **UT-REC-UV-11** | Context create still validates | AC-04 | Prefill id present but non-receivable → STATUS; missing still REQUIRED | COVERED after BE-01 |
| **UT-REC-UV-12** | FORBIDDEN job_postings SoT | AC-CMP-01 · DV-16 | Create/link path **must not** INSERT/UPDATE `job_postings` / `job_posting_id` as UV SoT (spy/assert) | COVERED after BE-01 |
| **UT-REC-UV-13** | No silent Lane B | API §3.2 | POST without YCTD **must not** succeed as pool create for FR-05a | COVERED after BE-01 |
| **UT-REC-UV-14** | N–N add application | F-04 · UQ DV-17 | Second YCTD same candidate → 201; duplicate pair → **409** | P1 after MVP (may defer if N–N physical not in BE-01) |
| **UT-REC-UV-15** | No CASCADE on YCTD close | DV-18 | Soft-archive YCTD → applications keep FK | Schema/review + unit if service closes |

### 4.2 Unit rows — Compare (P0)

| Case ID | Endpoint / symbol | BR / Diễn biến | Input → expect | Spec / gap |
|---------|-------------------|----------------|----------------|------------|
| **UT-REC-CMP-01** | Compare/list filter SoT | **06b #1** · AC-01 | Filter accepts only `requisition_id`/`recruitment_request_id` — **not** `job_posting_id` | COVERED after BE-01 |
| **UT-REC-CMP-02** | `GET …/applications?requisition_id=` empty | **06b #4** · AC-03 | 0 UV → **200** `[]` | COVERED after BE-01 |
| **UT-REC-CMP-03** | `GET …/compare` count > N | **06b #5** · AC-04 | > N (default **4**) ids → **400** `HRM-REC-CMP-MAX-N` (**BE** authoritative) | COVERED after BE-01 |
| **UT-REC-CMP-04** | Eval missing | **06b #6** · AC-05 | No eval → row with `eval_status: none` / «chưa đánh giá» — still in list | COVERED after BE-01 |
| **UT-REC-CMP-05** | Happy matrix ≤ N | Thành công | Same YCTD + ≤ N → 200 criteria + rows; scores neo `application_id` | COVERED after BE-01 |
| **UT-REC-CMP-06** | YCTD-MIX | BR-CMP-01 | Candidate ids from two YCTDs → **400** `HRM-REC-CMP-YCTD-MIX` | COVERED after BE-01 |
| **UT-REC-CMP-07** | FORBIDDEN postings filter | AC-01 · DV-16 | Assert compare service never queries `job_postings` as filter SoT | COVERED after BE-01 |

### 4.3 Integration / scope_parity

| Case ID | Scenario | Expect | Tag |
|---------|----------|--------|-----|
| **IT-REC-UV-SP-01** | List receivable YCTD (scope A) → GET `:id` same company | Both 200 **or** id not in list | `scope_parity` |
| **IT-REC-UV-SP-02** | List candidates shows id → GET candidate by id same JWT/`company_id` | 200 detail with same `requisition_id` / position — **FAIL** if list 200 + detail 404 | `scope_parity` · U19 |
| **IT-REC-UV-SP-03** | Group CEO `main` rollup: list UV/YCTD → get-by-id | Same resolver; no false 409 on in-scope | `scope_parity` |
| **IT-REC-UV-SP-04** | Member CEO: cannot bind/compare OOS YCTD | 403/409/404 consistent | `scope_parity` |
| **IT-REC-CMP-SP-01** | Applications listed for YCTD → get application/candidate same scope | No list-hit / detail-404 | `scope_parity` |

### 4.4 P0 unit gate (Dev READY_FOR_QA)

**BE may claim `READY_FOR_QA` only when:**

- [ ] **UT-REC-UV-01..07 + 08..10 + 12..13** green (receivable / empty 200[] / STATUS / REQUIRED / NOT-FOUND / POSITION-MISMATCH / free-text / alias / no silent Lane B / no job_postings SoT)
- [ ] **UT-REC-CMP-01..03 + 06..07** green (YCTD SoT / empty / MAX-N / MIX / no postings) — CMP-04/05 if eval read path in scope
- [ ] **IT-REC-UV-SP-01..02** green
- [ ] Evidence jest path cited in BE handoff
- [ ] **No** claim browser UF PASS from unit alone
- [ ] Honesty stamps: `recruitment_uat_ready=false` · not REC-03 unlock

**FE READY_FOR_QA (narrow):** maps UF click paths + no free-text position SoT control + surfaces error codes; unit optional thin.

---

## 5. Browser U65 plan — AC-REC-UV-* / AC-REC-CMP-*

**Locks:** U65 zero-seed · FE-only mutate · login → menu SRS → click → nhập → **Lưu** → FE sau 2xx → **F5**.  
**Persona default:** `ceo@xe.vn` / `Xevn@2026` · scope holding/`main` per ADR-GROUP-CEO-MAIN-HOLDING-SCOPE.  
**Surface:** HRM embed · Tuyển dụng · **Ứng viên / Thêm ứng viên** · **So sánh ứng viên**.  
**DENIED in evidence:** seed UV↔YCTD · API-only PASS · `recruitment_uat_ready` · `job_postings` as SoT.

**Natural precond (no seed):** If 0 receivable YCTD in scope → execute empty UF only; mutate journey **BLOCKED** until YCTD created/approved via **FE** earlier in session (YCTD menu) — never `pnpm seed:*`.

### 5.1 UF — Thêm UV (AC-REC-UV-01..04)

| UF-ID | AC | Diễn biến | Click path (summary) | Pass | Fail |
|-------|-----|-----------|----------------------|------|------|
| **UF-REC-UV-01** | — | **#1** | Login → Tuyển dụng → Ứng viên → **Thêm ứng viên** | Form mở; control **bắt buộc chọn YCTD**; GET receivable **2xx** | Form opens without YCTD gate; Sync ERROR |
| **UF-REC-UV-02** | empty | **#2** | Same when receivable list empty (natural — **no seed**) | Empty + CTA tạo/duyệt YCTD; **Lưu disabled** or submit → FE error; Network create **400** `HRM-REC-UV-YCTD-REQUIRED` if forced | Fake success; silent Lane B pool 201 |
| **UF-REC-UV-03** | **AC-REC-UV-03** | **#3–#4** | Chọn YCTD receivable → assert vị trí **SELECT/read-only derived** (no free-text SoT «Vị trí ứng tuyển») | Position matches YCTD `position_key`/`name`; no free-text SoT control | Free-text SoT saved; position blank/mismatch |
| **UF-REC-UV-04** | **AC-REC-UV-01** | **#5** | Clear/omit YCTD → **Lưu** | No 2xx create; toast/inline REQUIRED; form kept | 201 without YCTD |
| **UF-REC-UV-05** | **AC-REC-UV-01/02** | **#6** | Chọn YCTD + họ tên + liên hệ + nguồn → **Lưu** | POST **201/2xx**; list row shows YCTD + position derived | 2xx but list missing YCTD link |
| **UF-REC-UV-05-F5** | **AC-REC-UV-02** | Thành công | After UF-05 → **F5** / re-nav list→detail | YCTD + position derived still visible | Only free-text remnant / lost link |
| **UF-REC-UV-06** | **AC-REC-UV-03** | **#4** FD | Attempt free-text position / crafted mismatch key (if FE hides) | FE block **and/or** Network **400** `POSITION-MISMATCH` | Persist free-text as SoT |
| **UF-REC-UV-07** | **AC-REC-UV-04** | Context | Open Thêm UV from YCTD detail / `?requisition_id=` | YCTD **pre-selected**; position derived; user need not re-pick unless intentional change | Forced blank re-pick |
| **UF-REC-UV-08** | FORBIDDEN | REC-03 | Audit Network create + picker source | Options from requisitions receivable only; **zero** UV create via `job_postings` | Dual-write / tin đăng SoT |

### 5.2 UF — So sánh (AC-REC-CMP-01..05)

| UF-ID | AC | Diễn biến | Click path (summary) | Pass | Fail |
|-------|-----|-----------|----------------------|------|------|
| **UF-REC-CMP-01** | **AC-REC-CMP-01** | **#1** | Tuyển dụng → **So sánh ứng viên** | Bộ chọn nhãn **YCTD / Yêu cầu tuyển** — **not** tin đăng/chiến dịch; Network filter by requisition id | Picker from JobPostings |
| **UF-REC-CMP-02** | **AC-REC-CMP-02** | **#2** | Open when 0 YCTD (natural empty) | Empty trung thực + hướng YCTD; no infinite spinner / fake rows | Fake list |
| **UF-REC-CMP-03** | **AC-REC-CMP-03** | **#3–#4** | Chọn YCTD with 0 UV attached | Empty ngữ cảnh «chưa có ứng viên trên yêu cầu này» | Tech error instead of empty |
| **UF-REC-CMP-04** | **AC-REC-CMP-04** | **#5** | With ≥N+1 UV on YCTD (created via FE earlier) → select > N | FE disable **and** Network **400** `HRM-REC-CMP-MAX-N` if forced | Unlimited silent select |
| **UF-REC-CMP-05** | **AC-REC-CMP-05** | **#6** / Thành công | Select ≤ N → matrix/radar; UV without eval shows «chưa đánh giá» | Scores from eval on UV×YCTD link; F5/deep-link keeps YCTD if supported | Fake scores / postings SoT / lost context |
| **UF-REC-CMP-06** | BR-CMP-01 | MIX | Attempt mix candidates from two YCTDs | Block + **400** `HRM-REC-CMP-YCTD-MIX` | Mixed matrix allowed |

### 5.3 Evidence block template (future execute seat)

```markdown
### UF-REC-UV-0x / UF-REC-CMP-0x — …
- Persona / URL / click path: ceo@xe.vn · …
- Trước mutate: (receivable YCTD count / UV count — natural FE state)
- Action: … → Lưu / So sánh
- Network: METHOD … → status · code (HRM-REC-UV-* / HRM-REC-CMP-*)
- FE sau 2xx: …
- F5: …
- Console: no storm / no Uncaught on path
- Verdict: 🟢 / 🟡 / 🔴
- spec_ref: SRS REC-05a/06b Diễn biến … · TechSpec F-REC-… · API-01 §…
- DENIED: seed · recruitment_uat_ready · job_postings SoT
```

---

## 6. Journeys L2.5

### 6.1 J-HRM-REC-UV-01

| Field | Value |
|-------|--------|
| **J-ID** | `J-HRM-REC-UV-01` |
| **Persona** | `ceo@xe.vn` / `Xevn@2026` |
| **P-CC / route** | HRM embed · Tuyển dụng · Ứng viên |
| **U65** | browser-only · **zero-seed** |

```text
1. Login portal as ceo@xe.vn
2. HRM → Tuyển dụng
3. (Precond path if needed) Yêu cầu tuyển dụng — ensure ≥1 receivable YCTD via FE (approve/open); if none → UF-REC-UV-02 only; journey mutate BLOCKED
4. Ứng viên → Thêm ứng viên (#1)
5. Assert YCTD picker receivable only (#2/#3); no tin đăng source
6. Select YCTD → assert position SELECT/derived — no free-text SoT (#4 / AC-03)
7. Fill name + contact + source → Lưu (#6)
8. Network POST candidates 2xx + FE list shows YCTD + position
9. F5 / re-enter list → detail (# Thành công / AC-02)
10. scope_parity: list id → GET detail API must not 404 if listed
11. Optional: open from YCTD context → preselect (AC-04)
```

| Check | PASS | FAIL |
|-------|------|------|
| L2 | Form opens; no Sync ERROR | Banner 500 / duplicate shell |
| L2.5 | Steps 5–10 | Skip F5 or API-only |
| Errors | REQUIRED/STATUS/MISMATCH visible when forced | Silent Lane B 201 |
| SoT | No job_postings dual-write | Campaign/postings UV SoT |
| Honesty | Not claim module UAT | Over-claim |

### 6.2 J-HRM-REC-CMP-01

| Field | Value |
|-------|--------|
| **J-ID** | `J-HRM-REC-CMP-01` |
| **Persona** | `ceo@xe.vn` / `Xevn@2026` |
| **P-CC / route** | HRM embed · Tuyển dụng · So sánh ứng viên |
| **U65** | browser-only · **zero-seed** |
| **Depends** | Prefer ≥1 UV on a YCTD created via **J-HRM-REC-UV-01** / FE earlier (not seed) |

```text
1. Login ceo@xe.vn → Tuyển dụng → So sánh ứng viên
2. Assert picker = YCTD only (AC-01)
3. If 0 YCTD → UF-REC-CMP-02 PASS path; stop
4. Select one YCTD → load UV + evals (AC-03 empty OK)
5. If UV present: select ≤ N → matrix; assert «chưa đánh giá» when no eval (AC-05)
6. Attempt > N → MAX-N (AC-04); attempt MIX if two YCTDs available → YCTD-MIX
7. F5 / reopen — YCTD context retained if deep-link supported
8. Network: no job_postings as compare filter SoT
```

**Propose matrix row (PM/BA):** ensure `J-HRM-REC-UV-01` · `J-HRM-REC-CMP-01` in `PROGRAM_JOURNEY_MAP.md` + `PILOT_BUSINESS_FLOW_MATRIX.md` — plan **requires** these J-IDs even if row missing until execute (`spec_gap` flag only at execute if still absent).

---

## 7. Mapping summary — dispatch mandatory cases

| # | Requirement | Case IDs | Layer |
|---|-------------|----------|-------|
| 1 | Receivable list / empty 200[] | UT-REC-UV-01..02 · UF-REC-UV-01..02 · UF-REC-CMP-02 | unit + browser |
| 2 | STATUS non-receivable | UT-REC-UV-03 · UF force | unit (+ browser) |
| 3 | REQUIRED missing YCTD · no silent Lane B | UT-REC-UV-04 · UT-REC-UV-13 · UF-REC-UV-04 | unit + browser |
| 4 | NOT-FOUND | UT-REC-UV-05 | unit |
| 5 | POSITION-MISMATCH / no free-text SoT | UT-REC-UV-06..07 · UF-REC-UV-03 · UF-REC-UV-06 · **AC-03** | unit + browser |
| 6 | Alias either name same id | UT-REC-UV-10 | unit |
| 7 | F5 list shows YCTD+position | UT-REC-UV-09 · UF-REC-UV-05-F5 · **J-HRM-REC-UV-01** · **AC-02** | unit + L2.5 |
| 8 | Context prefill AC-04 | UT-REC-UV-11 · UF-REC-UV-07 | unit + browser |
| 9 | FORBIDDEN job_postings / REC-03 | UT-REC-UV-12 · UT-REC-CMP-07 · UF-REC-UV-08 · UF-REC-CMP-01 · **AC-CMP-01** | unit + browser |
| 10 | CMP empty 0 UV | UT-REC-CMP-02 · UF-REC-CMP-03 · **AC-03** | unit + browser |
| 11 | MAX-N · YCTD-MIX | UT-REC-CMP-03 · UT-REC-CMP-06 · UF-REC-CMP-04 · UF-REC-CMP-06 · **AC-04** | unit + browser |
| 12 | Eval «chưa đánh giá» / matrix | UT-REC-CMP-04..05 · UF-REC-CMP-05 · **AC-05** · **J-HRM-REC-CMP-01** | unit + L2.5 |
| 13 | scope_parity list↔get | IT-REC-UV-SP-* · journeys step 10 | integration + L2.5 |

---

## 8. Dev unlock criteria (narrow)

| work_item | Role | Unlock when | allowed_paths (intent) | must_keep | forbidden |
|-----------|------|-------------|------------------------|-----------|-----------|
| **PO-HRM-REC-UV-YCTD-BE-01** | dev-be | This QA plan DONE + DB+API CONFIRMED | Receivable filter; create YCTD **required**; STATUS/NOT-FOUND/MISMATCH; alias DTO; no silent Lane B; display-ready YCTD+position; compare GET A1 max-N+mix; jest UT/IT P0 §4.4 | ONE physical `requisition_id` · F-REC-APP-02/03/HIRE stubs · eval on application · no CASCADE | `job_postings` UV/compare SoT · REC-03 · dual FK column · seed · invent second FK name |
| **PO-HRM-REC-UV-YCTD-FE-01** | dev-fe | Same cascade | Thêm UV: YCTD SELECT required; position derived SELECT/read-only; empty CTA; surface REQUIRED/STATUS/MISMATCH; list/detail after 2xx + F5; context `?requisition_id=` prefill | HDSD labels · soft FK wire · OS 28 no FE invent nested write aggregate | Free-text position SoT · JobPostings as UV source · seed helpers |
| **PO-HRM-REC-UV-YCTD-CMP-FE-01** | dev-fe | Same cascade (parallel OK with FE-01) | So sánh: YCTD picker only; empty 0 YCTD/0 UV; max-N UX + call compare API; «chưa đánh giá»; block MIX | Matrix from BE A1 preferred · eval read only | Tin đăng filter · fake scores · remaster creep |

**change_mode:** ADD / FIX narrow · `preserve_default: true` · `code_memory_required: true` · `spec_read_ack` must cite SRS 05a #1–#6 / 06b #1–#6 + Tech + DB-01 + API-01.

---

## 9. Future execute seats (after Dev READY_FOR_QA)

| Seat | Owner | Exit |
|------|-------|------|
| `PO-HRM-REC-UV-YCTD-QA-01` | qa | Browser U65: AC-REC-UV-01..04 + **J-HRM-REC-UV-01** · zero-seed · evidence + Test Log |
| `PO-HRM-REC-UV-YCTD-QA-02` | qa | Browser U65: AC-REC-CMP-01..05 + **J-HRM-REC-CMP-01** (may combine with QA-01 if quota) |
| QC | qc | Gate **only** after browser evidence — **not** this plan seat |

---

## 10. DENIED claims (stamp)

| Claim | Status |
|-------|--------|
| `recruitment_uat_ready` | **DENIED** |
| `jd_dynamic_done` | **DENIED** |
| `job_postings` / tin đăng as UV or compare SoT (REC-03 GĐ1) | **DENIED** / OUT |
| Seed for evidence / UF PASS | **DENIED** (U65) |
| Silent Lane B pool as FR-05a success | **DENIED** |
| Dual physical FK `recruitment_request_id` column | **DENIED** |
| Remaster / face_live / product GO / Phase1 DONE | **DENIED** |
| This plan = browser UF executed | **DENIED** (design only) |

---

## 11. Residual

| ID | Item | Owner |
|----|------|-------|
| R-UV-YCTD-DEV-BE | Implement UT/IT P0 + REQUIRED/STATUS/alias/position/compare gates | **dev-be** `PO-HRM-REC-UV-YCTD-BE-01` |
| R-UV-YCTD-DEV-FE | Thêm UV picker + position SELECT + FE sau 2xx/F5 | **dev-fe** `PO-HRM-REC-UV-YCTD-FE-01` |
| R-UV-YCTD-CMP-FE | So sánh YCTD SoT + max-N + empty | **dev-fe** `PO-HRM-REC-UV-YCTD-CMP-FE-01` |
| R-UV-YCTD-QA-EXEC | Browser execute after READY_FOR_QA | **qa** (new seats) |
| R-UV-YCTD-JOURNEY-MAP | Ensure J-HRM-REC-UV-01 · J-HRM-REC-CMP-01 in journey/matrix | **pm** / ba-process if missing at execute |
| R-UV-YCTD-NN | N–N UT-REC-UV-14 may defer if physical N–N not in BE-01 MVP | **pm** note |

---

## 12. Completion / handoff

| Field | Value |
|-------|--------|
| **completion_report** | QA plan ADD complete (OS 33 clarity): unit UT-REC-UV-01..15 + UT-REC-CMP-01..07 + IT scope_parity; browser UF map **AC-REC-UV-01..04** ↔ Diễn biến 05a #1–#6 + **AC-REC-CMP-01..05** ↔ 06b #1–#6; journeys **J-HRM-REC-UV-01** · **J-HRM-REC-CMP-01** (ceo@xe.vn, F5, scope_parity, U65 zero-seed); P0 unit gate for READY_FOR_QA; unlock criteria BE-01/FE-01/CMP-FE; FORBIDDEN seed · job_postings SoT · recruitment_uat_ready. Cascade DB+API+QA-plan COMPLETE → PM unlock Dev narrow. No apps/**. No browser execute this seat. |
| **next_owner** | **pm** |
| **next_dispatch_prompt** | See §13 |
| **evidence_path** | `docs/qa/evidence/po-hrm-rec-uv-yctd-qa-plan-01.md` |
| **ack_status** | **PASS_TO_PM** |

---

## 13. next_dispatch_prompt (copy-ready for PM)

```text
work_item_id: PO-HRM-REC-UV-YCTD-BE-01 + PO-HRM-REC-UV-YCTD-FE-01 + PO-HRM-REC-UV-YCTD-CMP-FE-01 (parallel narrow)
roles: dev-be · dev-fe
lane: execution
program: W-ALL-PARALLEL-01
change_mode: ADD
preserve_default: true
code_memory_required: true
code_memory_mode: APPEND
u65: zero-seed — no seed helpers; QA execute later FE-only

entry_criteria:
- Cascade COMPLETE (cite):
  - DB-01 CONFIRMED: docs/program/specs/PO-HRM-REC-UV-YCTD-DB-01.md
  - API-01 CONFIRMED: docs/program/specs/PO-HRM-REC-UV-YCTD-API-01.md
  - QA-PLAN DONE: docs/qa/evidence/po-hrm-rec-uv-yctd-qa-plan-01.md
  - TechSpec: docs/program/specs/PO-HRM-REC-UV-YCTD-TECH-01.md §2–§3 · §6
- Dev HOLD lifts ONLY for narrow deltas below
- honesty: recruitment_uat_ready=false · jd_dynamic_done=false

read_first (ordered):
1. SRS_HRM_ENTERPRISE.md v0.11 FR-UC-BP-REC-05a · 06b (Diễn biến #1–#6 + AC-REC-UV-* · AC-REC-CMP-*)
2. PO-HRM-REC-UV-YCTD-TECH-01.md §2–§3 · §6
3. PO-HRM-REC-UV-YCTD-DB-01.md (ONE physical requisition_id · position derived · DV-*)
4. PO-HRM-REC-UV-YCTD-API-01.md (alias · write path Lane A · errors · compare A1)
5. docs/qa/evidence/po-hrm-rec-uv-yctd-qa-plan-01.md (UT/UF/J IDs + P0 gate)

spec_read_ack (fill before code):
- srs: REC-05a #1–#6 · REC-06b #1–#6 · Thành công · AC-REC-UV-01..04 · AC-REC-CMP-01..05
- tech_spec: F-REC-UV-YCTD-01..05 · F-REC-CMP-01..02
- db_design: soft FK requisition_id · position from YCTD · no dual FK · no CASCADE
- api_design: REQUIRED/STATUS/NOT-FOUND/MISMATCH/MAX-N/YCTD-MIX · empty 200[] · no silent Lane B

=== PO-HRM-REC-UV-YCTD-BE-01 (dev-be) ===
allowed_paths (intent — keep blast R1/R2):
- GET requisitions receivable filter + empty 200[]
- POST candidates: requisition_id|recruitment_request_id REQUIRED; STATUS/NOT-FOUND gates
- position derive + POSITION-MISMATCH; reject free-text position SoT
- alias DTO ONE physical requisition_id; reject ambiguous dual
- FORBIDDEN silent Lane B pool success without YCTD
- GET candidates list/get display-ready YCTD + position
- GET applications?requisition_id=&include=evals + GET compare (A1) max-N + YCTD-MIX
- jest: UT-REC-UV-01..07,08..10,12..13 + UT-REC-CMP-01..03,06..07 + IT-REC-UV-SP-01..02 (QA plan §4.4)
must_keep:
- ONE physical requisition_id · F-REC-APP-02/03/HIRE stubs · eval on application_id
forbidden:
- job_postings / job_posting_id as UV create or compare SoT · REC-03 unlock
- invent second physical FK · CASCADE wipe · seed for evidence
exit_criteria:
- P0 unit gate green; READY_FOR_QA; cite QA plan case IDs; no recruitment_uat_ready claim
evidence_path: docs/qa/evidence/po-hrm-rec-uv-yctd-be-01.md

=== PO-HRM-REC-UV-YCTD-FE-01 (dev-fe) ===
allowed_paths (intent):
- Thêm ứng viên: YCTD SELECT required; empty CTA; position SELECT/read-only derived (no free-text SoT)
- surface REQUIRED/STATUS/MISMATCH; list/detail YCTD+position after 2xx; F5 retain
- context create ?requisition_id= prefill (AC-04)
must_keep:
- HDSD/menu labels · soft FK wire · OS 28 FE does not invent nested write aggregate
forbidden:
- JobPostingsTab / tin đăng as UV SoT · seed helpers · remaster scope creep
exit_criteria:
- READY_FOR_QA; maps UF-REC-UV-01..08 + J-HRM-REC-UV-01 click path
evidence_path: docs/qa/evidence/po-hrm-rec-uv-yctd-fe-01.md

=== PO-HRM-REC-UV-YCTD-CMP-FE-01 (dev-fe) ===
allowed_paths (intent):
- So sánh: YCTD picker only (AC-CMP-01); empty 0 YCTD / 0 UV; max-N UX + BE compare; «chưa đánh giá»; block MIX
must_keep:
- Compare filter SoT = YCTD · scores from eval on UV×YCTD
forbidden:
- tin đăng/chiến dịch filter · fake matrix rows · claim recruitment_uat_ready
exit_criteria:
- READY_FOR_QA; maps UF-REC-CMP-01..06 + J-HRM-REC-CMP-01
evidence_path: docs/qa/evidence/po-hrm-rec-uv-yctd-cmp-fe-01.md

DENIED (all):
- recruitment_uat_ready · jd_dynamic_done · job_postings SoT · seed for UAT evidence · product GO

After BE + FE (+ CMP-FE) READY_FOR_QA → Task qa:
  PO-HRM-REC-UV-YCTD-QA-01 — U65 browser AC-REC-UV-01..04 + J-HRM-REC-UV-01 · ceo@xe.vn · zero-seed
  PO-HRM-REC-UV-YCTD-QA-02 — U65 browser AC-REC-CMP-01..05 + J-HRM-REC-CMP-01 · zero-seed
  evidence: docs/qa/evidence/po-hrm-rec-uv-yctd-qa-01.md (and qa-02)
```

---

## 14. Bus brief (for append)

```text
qa -> pm | PASS_TO_PM PO-HRM-REC-UV-YCTD-QA-PLAN-01
- test design DONE · NO CODE apps/** · NO browser execute
- OS 33: unit ≠ UF ≠ report; P0 unit gate locked
- map AC-REC-UV-01..04 ↔ 05a #1–#6 · AC-REC-CMP-01..05 ↔ 06b #1–#6
- journeys J-HRM-REC-UV-01 · J-HRM-REC-CMP-01 (U65 zero-seed)
- cascade DB-01+API-01+QA-plan COMPLETE → unlock BE-01 / FE-01 / CMP-FE
- DENIED: seed · job_postings SoT · recruitment_uat_ready
- evidence: docs/qa/evidence/po-hrm-rec-uv-yctd-qa-plan-01.md
```

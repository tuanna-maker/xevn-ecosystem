# BA AC pack — Wave-15 CORE cluster · UC-BP-CORE-09c (Lưu phiên bản + in / PDF HĐLĐ)

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-CORE-09C-CLUSTER-BA-01` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89 — single GD continuous · Wave-15 seat **#17**) |
| **lane** | governance · ba-process |
| **Date** | 2026-08-09 |
| **Status** | **CONFIRMED against SA Option A LOCKED** · O1–O12 **CONFIRMED** · Dev **HOLD** · **ba-data HOLD default** (table LIVE `hrm_contract_print_versions`) · sa API-01 **HOLD** unless residual wire gap proven |
| **change_mode** | **ADD** (align SA-01 — **no** wipe paper FR-CORE-09c · **no** reopen W14 CORE-09b / W13 CORE-09a / W12 CORE-08 / W11 CORE-02 / W10 CORE-01 / W1–W9 REC · **no** invent Nest `/core` dual / 09d TPL as this WI DONE · **no** rewrite PREV→INSERT VER) |
| **uc_ids** | `UC-BP-CORE-09c` |
| **depends_on** | `PO-HRM-MVP-GD1-CORE-09C-CLUSTER-SA-01` **Option A LOCKED** · peer QC Wave-14 **`CORE09BQC1-MSLB05DZ`** · QA `CORE09BQA-MSLAWKV6` |
| **ref_sa** | `PO-HRM-MVP-GD1-CORE-09C-CLUSTER-SA-01.md` |
| **ref_ba_style** | `PO-HRM-MVP-GD1-CORE-09B-CLUSTER-BA-01.md` · `PO-HRM-MVP-GD1-CORE-09A-CLUSTER-BA-01.md` |
| **ref_srs** | `SRS_HRM_ENTERPRISE.md` **FR-UC-BP-CORE-09c** · Diễn biến **#1–#5** · **BR-CTR-CL-01** · **BR-CTR-CL-02** · **BR-CTR-CL-04** · **AC-CTR-PRINT-01** · **04** · **05** · **06** · **08** · peers **09b / 09a must_keep** · **09d OUT invent** |
| **ref_spec** | `PO-HRM-CONTRACT-LEGAL-PRINT-SPEC-01.md` **E.3** |
| **ref_api_paper** | **F-CORE-CTR-VER-01** · **F-CORE-CTR-VER-02** · **F-CORE-CTR-PDF-01** RETAIN · **F-CORE-CTR-PACK-01** + **F-CORE-CTR-PREV-01** ephemeral **must_keep** · **F-CORE-CTR-CL-01..04** must_keep · peers **F-CORE-CTR-TPL** **OUT invent DONE** as 09d |
| **Honesty** | `recruitment_uat_ready=false` · **`jd_dynamic_done=false`** · **`contracts_printable_ready=false`** · personnel / CORE / CTR module UAT **false** · **`C-SLICE-≠-MODULE`** · DENY flip · **DENY** claim CORE-09b pack+preview = printable DONE · **DENY** invent 09d TPL catalog as this WI DONE |
| **Carry OBS** | **`R-QA-CORE-09B-CLAUSE-FP-EMPTY`** → peer **UC-BP-CORE-09d** (idle-ok this seat — **not** invent TPL DONE here) |
| **Cấm** | Nest `/core` dual VER/PDF SoT · reopen rewrite CORE-09b PREV to INSERT VER · invent 09d TPL catalog as this WI DONE · claim CORE-09b=printable DONE · claim printable UAT · flip `contracts_printable_ready` · reopen sealed J-HRM-CORE-09B-01..04 / J-HRM-CORE-09A / J-CORE-08/02/01 / REC without regression · seed · honesty flip · apps/** |

---

## 0. Process objective & actors

### Objective

Khóa **AC đo được** + **Diễn biến FE (U63/U65)** cho Wave-15 seat #17:

1. **UC-BP-CORE-09c** — (1) từ preview đủ điều kiện → **Lưu phiên bản** (server re-preview + `can_issue`); (2) freeze snapshot (merged_fields + clauses + comp khi ACL); (3) list/detail + **F5 còn** pack + `version_no`; (4) **In / Tải PDF** từ snapshot only — khớp nội dung đã lưu; (5) thiếu bắt buộc → **ISSUE-BLOCKED** + list; (6) phụ lục/amend → phiên bản mới + prior `superseded` (không ghi đè im lặng); (7) PREV CORE-09b **vẫn ephemeral**; (8) sổ đăng ký CRUD F5 **không** bị phá.
2. **Option A** — ACCEPT_AS_IS_RETAIN trên LIVE **`POST/GET …/print-versions*`** + **`GET …/print-versions/:versionId/pdf`**; paper `/core/…` = **alias only**.
3. **Không** claim module CORE/CTR UAT / flip `contracts_printable_ready`; **không** reopen J-HRM-CORE-09B/09A/08/02/01; **không** coi CORE-09b GWC = printable DONE; **không** invent 09d TPL catalog as this WI DONE.

### Actors

| Actor | Trách nhiệm |
|-------|-------------|
| HCNS (đủ quyền HĐ) | Preview đủ → Lưu phiên bản · xem list/detail · In/Tải PDF · amend phụ lục |
| C&B | Đọc snapshot C&B khi `can_view_cb` (mask khi thiếu quyền) |
| Non-C&B HCNS | Snapshot/PDF với C&B fields masked — không lộ lương/MST/phụ cấp |
| Group CEO | Scope rollup `main` — U19 contract get = VER create/list/get = PDF |
| Member CEO / HRBP | Chỉ pháp nhân / membership · cùng `resolveHrmListScope` |
| Hệ thống (Nest) | Re-run preview · `can_issue` gate · INSERT issued + freeze · supersede · PDF from snapshot · **không** Nest `/core` dual · **không** rewrite PREV→INSERT |

### Scope

| In (this seat) | Out |
|----------------|-----|
| O1–O12 CONFIRM · AC-CTR-PRINT-01/04/05/06/08 deepen · AC-CORE-09C-* · VAL-CORE-VER-* · Diễn biến FE U65 · J-HRM-CORE-09C-* DRAFT | Impl `apps/**` / migration / seed |
| Physical POST/GET print-versions* + GET …/pdf on `/contracts-insurance/*` | Greenfield Nest `/core/…/print-versions` SoT |
| Server `can_issue` gate · snapshot freeze · amend supersede · PDF-from-snapshot | Invent 09d TPL catalog DONE · DOCX · DnD layout |
| PREV remains ephemeral (must_keep CORE-09b) · registry must_keep | Reopen rewrite PREV to INSERT VER · reopen CL library |
| Honesty footer · C-SLICE · CORE-09b ≠ printable DONE · printable false | Flip `contracts_printable_ready` / recruitment / jd / Phase1 DONE |
| Carry OBS clause-empty → 09d | Reopen sealed J-CORE-09B / 09A / 08 / 02 / 01 / REC rewrite |
| | ATT · CORE-02b · PAY · invent printable module UAT |

### SA Option A — BA CONFIRM (đóng O1–O12)

| # | Topic | BA CONFIRM (normative) |
|---|-------|-------------------------|
| **O1** | Physical path | **YES** — HĐ save/print spine Network **chỉ** physical **`POST /api/hrm/contracts-insurance/contracts/:id/print-versions`** · **`GET …/contracts/:id/print-versions`** · **`GET …/print-versions/:versionId`** · **`GET /api/hrm/contracts-insurance/print-versions/:versionId/pdf`** · paper `/api/hrm/core/…` = **alias / DOC-DELTA only** — **FAIL** nếu Nest `@Controller('core')` second VER/PDF SoT |
| **O2** | Issue gate | **YES** — VER INSERT **only** when server re-runs preview and `can_issue=true`; else **400** + `missing_*` (**`HRM-CTR-ISSUE-BLOCKED`** / **`HRM-CTR-DRIVER-REQUIRED`** / **`HRM-CTR-TERM-INVALID`** / **`HRM-CTR-TPL-NONE`**) — **AC-CTR-PRINT-01/06** · **BR-CTR-CL-02/04** · **DENY** FE-trusted issue |
| **O3** | Snapshot freeze | **YES** — Freeze `merged_fields_json` + `clauses_snapshot_json` (+ `compensation_snapshot_json` when ACL) at issue; PDF/print **from snapshot only** — **DENY** live-library re-merge — **AC-CTR-PRINT-05** · **BR-CTR-CL-01** |
| **O4** | Amend / phụ lục | **YES** — New `version_no`; prior `issued` → `superseded` — **no** silent overwrite of issued row — FR-09c Diễn biến **#5** · **BR-CTR-CL-01** |
| **O5** | PREV must_keep | **YES** — CORE-09b `POST …/preview` stays **ephemeral** — **DENY** reopen rewrite PREV→INSERT VER; preview path `ver_insert_posts` stays **0** — must_keep stamp **`CORE09BQC1-MSLB05DZ`** |
| **O6** | FE after 2xx | **YES** — After VER **201** `HRM-CTR-VER-201` → list/detail show `pack_code` + `version_no` (+ status/issued_at); **F5 còn**; PDF **200** `%PDF` matches issued snapshot content — **AC-CTR-PRINT-04/05** |
| **O7** | Registry must_keep | **YES** — Create/edit/**F5** sổ đăng ký `employee_contracts` (UF-HRM-02 / CORE-09) **PASS** — VER/PDF is **ADD overlay only** — **AC-CTR-PRINT-08** |
| **O8** | Peers OUT | **YES** — UC-BP-CORE-**09d** TPL catalog invent as this WI DONE · DOCX · DnD · ATT · CORE-02b — **peer** seats only; carry **`R-QA-CORE-09B-CLAUSE-FP-EMPTY`** → **09d** (not invent TPL DONE here) |
| **O9** | must_keep CORE-09b / 09a / 08 / 02 / 01 | **YES** — RETAIN F-CORE-CTR-PACK-01 + F-CORE-CTR-PREV-01 ephemeral · F-CORE-CTR-CL-01..04 · RD `/rewards*`+`/discipline*` + payroll_link · packages/eins · **`HRM-CORE-CB-AUTHZ-403`** · **`HRM-CORE-CB-403`** · public strip · Nest `/core` DENY · stamps **`CORE09BQC1-MSLB05DZ`** · **`CORE09AQC1-MSLA4LX9`** · **`CORE08QC1-MSL9BFFE`** · **`CORE02QC1-MSL80DU6`** · **`CORE01QC1-MSL6WMS7`** · J-HRM-CORE-09B/09A/08/02/01 **PASS RETAIN** · **DENY** claim CORE-09b = printable DONE · **DENY** reopen sealed J-* without regression |
| **O10** | Honesty | **YES false** — `recruitment_uat_ready=false` · `jd_dynamic_done=false` · **`contracts_printable_ready=false`** · personnel/CORE/CTR module UAT **false** · **C-SLICE** · GWC slice ≠ module UAT · **≠** claim CORE-09b = printable DONE · printable flag only after named QA/QC printable U65 — **not** auto from this BA |
| **O11** | Display-ready | **YES** — VER DTO display-ready (`version_no` · pack label VI · status · issued_at · template_code · cb mask on snapshot read) — PDF Blob/download — **cấm** FE invent PDF by re-merging live library |
| **O12** | Journeys | **YES** — DRAFT **`J-HRM-CORE-09C-01..04`** (preview→save VER→F5 · PDF match snapshot · issue blocked when missing · Nest `/core` 0 + CORE-09b PREV ephemeral + CORE-09a/08/02/01 regression + amend supersede) · U19 Group CEO rollup stated |

**Architecture SoT:** ONE LIVE VER+PDF SoT on `/contracts-insurance/*` · paper `/core` alias only · issue re-runs PREV + honors `can_issue` · PDF from issued snapshot only · PREV remains ephemeral · U19 contract get = VER create/list/get = PDF · soft-delete doctrine RETAIN · CORE-09b/09a/08/02/01 **must_keep**.

### Primary API surface (BA lock — O1 / O2 / O3 / O5)

| Intent | Physical (normative) | Paper alias |
|--------|----------------------|-------------|
| Save print version | **`POST /api/hrm/contracts-insurance/contracts/:id/print-versions`** | `/core/…` alias only |
| List versions | **`GET …/contracts/:id/print-versions`** | alias |
| Get version | **`GET …/print-versions/:versionId`** | alias |
| PDF / print | **`GET /api/hrm/contracts-insurance/print-versions/:versionId/pdf`** | alias |
| Pack resolve | **RETAIN SEALED** `GET …/contracts/pack-resolve` | alias |
| Merge preview | **RETAIN SEALED ephemeral** `POST …/contracts/:id/preview` | alias — **DENY** INSERT VER |
| Clause library | **RETAIN SEALED** `/contracts-insurance/contract-clauses*` | `/core/…/clauses` alias |
| Registry CRUD | **RETAIN** `/contracts-insurance/contracts*` | — |
| Template catalog invent DONE | Peer **F-CORE-CTR-TPL** / 09d | **OUT invent DONE** — issue **may** resolve existing active template |
| CORE-08 RD | **RETAIN SEALED** `/employees/:id/rewards*` + `/discipline*` | `/core/reward-discipline` alias |
| CORE-02 C&B | **RETAIN SEALED** compensation-packages* | `/core/…/compensation` alias |
| CORE-01 public | **RETAIN SEALED** `/api/hrm/employees*` | `/core/employees` alias |

**Invariant CORE-VER-PATH:** Save/list/get/PDF Network **MUST** hit `/contracts-insurance/*` · Nest dual `/core` VER/PDF SoT = **FAIL O1**.

**Invariant CORE-VER-GATE:** VER INSERT with `can_issue=false` / missing mandatory = **FAIL O2** · must return ISSUE-BLOCKED (or DRIVER/TERM/TPL-NONE) + missing lists.

**Invariant CORE-VER-SNAPSHOT:** PDF rendered from live library re-merge (not issued snapshot) = **FAIL O3** · AC-CTR-PRINT-05.

**Invariant CORE-VER-AMEND:** Silent overwrite of prior issued row (no supersede + new `version_no`) = **FAIL O4**.

**Invariant CORE-VER-PREV-KEEP:** Preview path INSERT issued VER = **FAIL O5** (reopen rewrite CORE-09b).

**Invariant CORE-VER-≠-09B-PRINTABLE:** CORE-09b GWC **≠** printable DONE · claim = **FAIL O9/O10**.

**Invariant CORE-VER-NEST-DENY:** Nest `/api/hrm/core/**` VER/PDF SoT = **FAIL O1**.

**Invariant CORE-VER-≠-09D-TPL:** Invent open TPL catalog as CORE-09c DONE = **FAIL O8**.

**Wire codes (RETAIN — no invent rewrite):** `HRM-CTR-VER-201` · `HRM-CTR-VER-200` · `HRM-CTR-ISSUE-BLOCKED` · `HRM-CTR-DRIVER-REQUIRED` · `HRM-CTR-TERM-INVALID` · `HRM-CTR-TPL-NONE` · `HRM-CTR-VERSION-NOT-ISSUED` · `HRM-CTR-PACK-INVALID` · `HRM-CTR-TPL-PACK-MISMATCH` · `HRM-CTR-UNIT-SCOPE` · `HRM-SCOPE-409` · RETAIN PREV/PACK `HRM-CTR-PREV-200` · `HRM-CTR-PACK-200` · RETAIN CORE-09a `HRM-CTR-CL-*` · CORE-08/02/01 codes.

---

## 1. As-is vs to-be

| | AS-IS (LIVE + seals) | TO-BE (Wave-15 · Option A) |
|---|----------------------|---------------------------|
| VER INSERT | LIVE `POST …/print-versions` + `can_issue` | **RETAIN SoT** + U65 FE save fidelity (**O1/O2/O6**) |
| List/get F5 | LIVE `GET …/print-versions*` | **RETAIN** (**O1/O6**) |
| PDF | LIVE pdfkit from snapshot | **RETAIN** + AC-CTR-PRINT-05 match (**O3/O6**) |
| Paper `/core/…` | Not Nest SoT | **Alias / DOC-DELTA only** (**O1**) |
| Amend | supersede + new version_no | **RETAIN** + journey AC (**O4**) |
| PREV | CORE-09b SEALED ephemeral | **must_keep · no reopen rewrite** (**O5**) |
| Pack+CL | CORE-09b/09a SEALED | **must_keep** (**O9**) |
| Registry | UF-HRM-02 CRUD LIVE | **must_keep** (**O7**) |
| TPL catalog 09d | Peer / empty clause_ids OBS | **OUT invent DONE** (**O8**) · carry OBS |
| Honesty | C-SLICE · printable false | **false** (**O10**) |
| Schema | LIVE `hrm_contract_print_versions` + denorm | **ba-data HOLD** |

### 1.1 ba-data disposition

| Decision | Rule |
|----------|------|
| **HOLD default** | Table LIVE: `hrm_contract_print_versions` (+ denorm pack/template on `employee_contracts`) — **no** ADD schema this seat |
| Conditional UNLOCK | **Only if** BA/QA proves physical column gap for VER/PDF snapshot fields — **this seat: gap NOT proven** → **HOLD** |
| DENY | Nest `/core` table invent · mega-EAV · second VER store · wipe LIVE print_versions · rewrite PREV persist store |

---

## 2. Business rules (normative — SRS + SA; không invent)

| ID | Condition | Action | Outcome |
|----|-----------|--------|---------|
| **BR-CTR-CL-01** | Issue / amend after issued | Freeze snapshot at issue; amend = new version + supersede prior — no silent overwrite | Overwrite issued / PDF live-remerge = **FAIL O3/O4** |
| **BR-CTR-CL-02** | Missing mandatory field/clause | Block VER INSERT + list missing | Silent issue = **FAIL O2** |
| **BR-CTR-CL-04** | 0 effective template | Block fake issue — TPL-NONE / ISSUE path fail-closed | Fake issued from empty template = **FAIL AC-CTR-PRINT-01** |
| **BR-CTR-CL-03** | PDF / print surfaces | Render from snapshot (or library only for PREV peer) — **cấm** FE hardcode legal | FE invent legal body = **FAIL O9/O11** |
| **BR-CORE-VER-PATH** | FR-CORE-09c API | Physical print-versions* + pdf | Nest `/core` dual = **FAIL O1** |
| **BR-CORE-VER-GATE** | Save VER | Server re-preview · honor `can_issue` | FE-trusted issue = **FAIL O2** |
| **BR-CORE-VER-PDF** | PDF GET | Snapshot-only render | Live library re-merge = **FAIL O3** |
| **BR-CORE-VER-AMEND** | Second save after issued | New `version_no` · prior `superseded` | Silent overwrite = **FAIL O4** |
| **BR-CORE-VER-PREV** | Preview call | No VER INSERT | Persist issued on PREV = **FAIL O5** |
| **BR-CORE-VER-F5** | After VER 201 | List/detail + F5 còn pack + version_no | Lost after F5 = **FAIL O6** · AC-CTR-PRINT-04 |
| **BR-CORE-VER-REGISTRY** | After VER/PDF ADD | Registry create/edit/F5 still works | Break CRUD = **FAIL O7** |
| **BR-CORE-VER-SCOPE** | get = create = list = pdf | `resolveHrmListScope` same family as pack/preview | Cross-CT leak = **FAIL** U19 |
| **BR-CORE-VER-≠-09B-PRINT** | CORE-09b GWC | ≠ printable DONE | Claim = **FAIL O9/O10** |
| **BR-CORE-VER-PEER-OUT** | 09d TPL invent | Peer seat only · carry OBS | Pull into this WI = **FAIL O8** |
| **BR-CORE-VER-NO-SEED** | Nghiệm thu | Chuỗi FE only | Seed = **FAIL U65** |
| **BR-CORE-VER-DISPLAY** | FE bind | BE display-ready VER + PDF blob | FE invent Net PDF from live = **FAIL O11** |

### Error taxonomy (BA / QA assert — RETAIN; no invent rewrite)

| Code family | HTTP | UX intent (VI) | ≠ |
|-------------|------|----------------|--|
| **`HRM-CTR-VER-201`** | 201 | Lưu phiên bản thành công | — |
| **`HRM-CTR-VER-200`** | 200 | List/get phiên bản OK | — |
| **`HRM-CTR-ISSUE-BLOCKED`** | 400 | Thiếu bắt buộc — chặn lưu · liệt kê | Silent issue |
| **`HRM-CTR-TPL-NONE`** | 4xx | Chưa có mẫu hiệu lực — không lưu giả | Fake issued |
| **`HRM-CTR-DRIVER-REQUIRED`** | 400 | Thiếu GPLX/biển số (gói Lái xe) | — |
| **`HRM-CTR-TERM-INVALID`** | 400 | Thời hạn/loại HĐ không hợp lệ | — |
| **`HRM-CTR-VERSION-NOT-ISSUED`** | 4xx | PDF khi chưa issued | — |
| **`HRM-CTR-PACK-INVALID`** / **`HRM-CTR-TPL-PACK-MISMATCH`** | 4xx | Gói/mẫu lệch | — |
| `HRM-SCOPE-409` / `HRM-CTR-UNIT-SCOPE` | 409 | Ngoài phạm vi pháp nhân | — |
| Sealed `HRM-CTR-PREV-200` / `HRM-CTR-PACK-200` / `HRM-CTR-CL-*` / `HRM-CORE-*` | — | **DENY** rewrite · must_keep regression | — |

---

## 3. UC-BP-CORE-09c — Acceptance criteria

### 3.0 Scope ladder (mọi AC — U19)

| Persona | User sees | Fail |
|---------|-----------|------|
| **Group CEO** (`main`) + HCNS right | Save VER + PDF in rollup | Cross-CT issue without membership |
| **Member CEO / HRBP** | Chỉ pháp nhân membership | VER create/list/get/PDF khác resolver vs contract get |
| **C&B** | Snapshot/PDF unmasked lương/MST (when entitled) | Mask incorrectly when entitled |
| **Non-C&B HCNS** | Snapshot/PDF C&B masked | Leak salary/MST |
| **No HĐ right** | Deny save/PDF | Silent 2xx |

**Invariant CORE-VER-SCOPE:** contract get-by-id **=** print-version create/list/get **=** PDF **same** contracts-insurance / hrm list-scope family as pack-resolve + preview.

**Prerequisite:** Employee in scope · draft/active contract · preview path available (CORE-09b SEALED) · ACTIVE template **or** TPL-NONE/ISSUE-BLOCKED path · CORE-09a clauses available for pack · **không** seed · CORE-09b/09a/08/02/01 seals RETAIN · printable flag false.

### 3.1 Happy path (Diễn biến #1–#5 + Thành công) — U65 FE

| AC-ID | SRS / SPEC | Given | When | Then (measurable — **user sees**) | Evidence |
|-------|------------|-------|------|-------------------------------------|----------|
| **AC-CORE-09C-01** | #1 · O1/O2/O6 · VER-01 · AC-CTR-PRINT-04 | Preview đủ · `can_issue=true` | **Lưu phiên bản** | Network **POST** `…/contracts/:id/print-versions` **201** `HRM-CTR-VER-201`; FE list/detail shows `pack_code` + `version_no` (+ status issued); **no** Nest `/api/hrm/core/**` | Browser · U65 · O1/O2/O6 |
| **AC-CORE-09C-02** | #3–#4 · O6 · VER-02 · AC-CTR-PRINT-04 | After AC-CORE-09C-01 | **F5** / navigate lại list+detail | Same `version_no` · pack · snapshot metadata còn; GET list/get **200** `HRM-CTR-VER-200` | Browser · F5 · O6 |
| **AC-CORE-09C-03** | #2 · O3/O6/O11 · PDF-01 · AC-CTR-PRINT-05 | Issued version exists | **In / Tải PDF** | Network **GET** `…/print-versions/:versionId/pdf` **200** `application/pdf` (starts `%PDF`); content fields+clauses **match** issued snapshot / prior preview at issue — **≠** blank / ≠ live-library-only remerge after library edit | Browser · content probe · O3 |
| **AC-CORE-09C-04** | #5 · O4 · BR-CTR-CL-01 | Already has `issued` VER | Amend / Lưu phiên bản lại (đủ điều kiện) | New `version_no`; prior row status **`superseded`**; new row **`issued`**; **no** silent overwrite of prior snapshot body | Browser · L1 · O4 |
| **AC-CORE-09C-05** | O5 · must_keep 09b | After VER journeys | Call **POST …/preview** again | Preview **200** ephemeral · **0** new VER INSERT from preview alone (`ver_insert_posts=0` on PREV) | L1 · O5 |
| **AC-CORE-09C-06** | AC-CTR-PRINT-08 · O7 | After VER/PDF overlay used | Tạo/sửa sổ đăng ký HĐ → **Lưu** → **F5** | Registry CRUD **2xx** + F5 còn; VER/PDF **không** replace registry SoT | Browser · O7 · UF-HRM-02 |
| **AC-CORE-09C-07** | O9 · O1 · O10 | After VER/PDF journeys | Nest `/core` probes + seal smokes | Nest `/api/hrm/core/**` VER/PDF **0**; CORE-09b PACK+PREV · CORE-09a CL · CORE-08 RD+payroll_link · CORE-02 AuthZ/CB-403 · CORE-01 public still PASS; **no** claim CORE-09b=printable / printable ready / 09d TPL DONE / module CTR UAT | L1 + browser · O9/O10 |
| **AC-CORE-09C-08** | O3 · BR-CTR-CL-01 | Issued VER + later library body change | GET PDF / get version snapshot | Snapshot body **unchanged** vs issue-time; live library change **does not** alter issued PDF | Browser / L1 · O3 |

### 3.2 Exception / alternate

| AC-ID | Given | When | Then | Maps |
|-------|-------|------|------|------|
| **EX-CORE-09C-01** | Missing mandatory field **or** mandatory clause (`can_issue=false`) | Lưu phiên bản | **400** `HRM-CTR-ISSUE-BLOCKED` (or DRIVER/TERM) + FE lists `missing_*` — **no** issued INSERT | O2 · AC-CTR-PRINT-06 · BR-CTR-CL-02 |
| **EX-CORE-09C-02** | 0 active template | Attempt save VER | **`HRM-CTR-TPL-NONE`** (or fail-closed ISSUE) — **no** fake issued | O2 · AC-CTR-PRINT-01 · BR-CTR-CL-04 · AC-CTR-TPL-01 |
| **EX-CORE-09C-03** | DRIVER missing GPLX/plate (required) | Save VER | **`HRM-CTR-DRIVER-REQUIRED`** · no issued | O2 |
| **EX-CORE-09C-04** | PDF before issued / not issued | GET pdf | **`HRM-CTR-VERSION-NOT-ISSUED`** (or 4xx) | O3/O6 |
| **EX-CORE-09C-05** | Outside company scope | POST/GET VER or PDF other CT | **404/409** scope family | U19 |
| **EX-CORE-09C-06** | FE invent Nest `/core` VER/PDF | Mutate/Network | **FAIL O1** | O1 |
| **EX-CORE-09C-07** | Seed to create HĐ/VER for U65 | QA evidence | **FAIL U65** | O10 |
| **EX-CORE-09C-08** | Claim CORE-09b=printable / printable true / 09d TPL DONE | Evidence footer | **FAIL O8/O9/O10** | Honesty |
| **EX-CORE-09C-09** | Reopen rewrite PREV→INSERT VER or rewrite CORE-09a / sealed J-* | Scope | **FAIL O5/O9** | must_keep |
| **EX-CORE-09C-10** | PDF re-merges live clause library | Content after library edit | **FAIL O3** · AC-CTR-PRINT-05 | Snapshot lock |
| **EX-CORE-09C-11** | Carry OBS empty IT/DRIVER clause_ids treated as 09c TPL DONE | Scope | **FAIL O8** — residual stays peer **09d** | Carry OBS |

### 3.3 SRS AC crosswalk (normative deepen — no wipe)

| SRS / SPEC AC | BA deepen | J-* |
|---------------|-----------|-----|
| **AC-CTR-PRINT-04** | AC-CORE-09C-01/02 | J-09C-01 |
| **AC-CTR-PRINT-05** | AC-CORE-09C-03/08 · EX-10 | J-09C-02 |
| **AC-CTR-PRINT-06** | EX-CORE-09C-01 | J-09C-03 |
| **AC-CTR-PRINT-01** / **AC-CTR-TPL-01** | EX-CORE-09C-02 | J-09C-03 |
| **AC-CTR-PRINT-08** | AC-CORE-09C-06 | J-09C-04 |
| SPEC-01 **E.3** #1–#3 (+ SRS #4–#5) | AC-CORE-09C-01..04 | J-09C-01..04 |
| AC-CTR-PRINT-02/03/07 | **must_keep** CORE-09b (not re-prove as 09c DONE) | J-09B sealed |
| **09d** TPL catalog | **OUT invent DONE** | peer board #18 |

### 3.4 VAL matrix (measurable)

| VAL-ID | Rule | Pass | Fail |
|--------|------|------|------|
| **VAL-CORE-VER-01** | Network path physical contracts-insurance | POST/GET print-versions* + GET pdf hit `/contracts-insurance/*` | Nest `/core` hit |
| **VAL-CORE-VER-02** | Save 201 when can_issue | POST → 201 + version_no + pack | Issue when missing |
| **VAL-CORE-VER-03** | F5 persistence | List/detail còn after F5 | Lost after reload |
| **VAL-CORE-VER-04** | PDF 200 snapshot | `%PDF` · fields+clauses match snapshot | Blank / live-remerge drift |
| **VAL-CORE-VER-05** | Issue gate | missing → ISSUE-BLOCKED + list | Silent 201 |
| **VAL-CORE-VER-06** | 0 template | TPL-NONE / fail-closed | Fake issued |
| **VAL-CORE-VER-07** | Amend supersede | New version_no · prior superseded | Silent overwrite |
| **VAL-CORE-VER-08** | PREV ephemeral | Preview alone → 0 VER INSERT | PREV rewrite INSERT |
| **VAL-CORE-VER-09** | Snapshot freeze | Library edit ≠ change issued PDF | Snapshot mutates |
| **VAL-CORE-VER-10** | Registry F5 | Create/edit/F5 PASS | CRUD broken |
| **VAL-CORE-VER-11** | Nest `/core` 0 | Zero VER/PDF SoT calls | Dual controller |
| **VAL-CORE-VER-12** | CORE-09b must_keep | PACK+PREV smoke PASS · ephemeral | PREV/pack regression / reopen rewrite |
| **VAL-CORE-VER-13** | CORE-09a must_keep | CL Settings smoke / seal PASS | CL regression |
| **VAL-CORE-VER-14** | CORE-08 must_keep | RD+payroll_link smoke PASS | RD regression |
| **VAL-CORE-VER-15** | CORE-02 must_keep | packages AuthZ/CB-403 PASS | CB regression |
| **VAL-CORE-VER-16** | CORE-01 must_keep | public strip PASS | Public leak |
| **VAL-CORE-VER-17** | Honesty footer | printable/recruitment/jd/CORE UAT false | Flip ready |
| **VAL-CORE-VER-18** | No seed | FE-only chain | Seed in evidence |
| **VAL-CORE-VER-19** | Scope parity U19 | get=create=list=pdf | Cross-CT |
| **VAL-CORE-VER-20** | Display-ready | version_no · pack VI · status · PDF blob | FE invent live PDF Net |
| **VAL-CORE-VER-21** | Peer OUT | No 09d TPL DONE claim · OBS carried | Engine invent |
| **VAL-CORE-VER-22** | ≠ 09b printable | No CORE-09b=printable DONE | False DONE |
| **VAL-CORE-VER-23** | C-SLICE | Slice GWC ≠ module CTR UAT | Module UAT claim |
| **VAL-CORE-VER-24** | Server re-preview | createPrintVersion invokes previewContract | FE-only can_issue trust |

---

## 4. Diễn biến FE (U65) — click path normative

```text
Login ceo@xe.vn (HCNS) · U65 zero-seed
 → Nhân sự (/hr) → Hợp đồng / Contracts (registry)
 → Mở HĐ nháp in scope · (must_keep) pack-resolve + preview đủ · can_issue=true
 → [J-01] Lưu phiên bản
      → POST …/contracts/:id/print-versions 201 HRM-CTR-VER-201
      → UI list/detail: pack_code + version_no
      → F5 → còn
 → [J-02] In / Tải PDF
      → GET …/print-versions/:versionId/pdf 200 application/pdf
      → Nội dung khớp snapshot / preview tại lúc lưu
 → [J-03] Case thiếu bắt buộc
      → Preview/can_issue=false → Lưu → 400 ISSUE-BLOCKED + list thiếu
      → (optional) 0 template → TPL-NONE — không issued giả
 → [J-04] Nest /core 0 · seals · PREV ephemeral · registry F5
      → POST preview vẫn 0 VER INSERT
      → Amend (optional): Lưu lại → version mới + prior superseded
      → Registry CRUD F5 còn
      → Smoke CORE-09b/09a/08/02/01 · no printable flip · no 09d TPL DONE
```

**cấm:** `pnpm seed:*` · API seed HĐ/VER · DB fake issued · PASS chỉ curl · claim printable UAT · invent 09d TPL as 09c DONE · rewrite PREV→INSERT.

---

## 5. Journeys DRAFT (O12) — mint

| J-ID | Title | Click path (draft) | Pass when |
|------|-------|--------------------|-----------|
| **J-HRM-CORE-09C-01** | **Preview đủ → Lưu VER → F5** | Login → Hợp đồng → preview `can_issue=true` → **Lưu phiên bản** → POST print-versions **201** → list/detail pack + `version_no` → **F5 còn** | AC-CORE-09C-01/02 · FR-09c #1/#3/#4 · AC-CTR-PRINT-04 · O1/O2/O6 · U65 · ≠ Nest `/core` dual |
| **J-HRM-CORE-09C-02** | **PDF khớp snapshot** | Open issued VER → **In/Tải PDF** → GET pdf **200** `%PDF` · fields+clauses match issued snapshot (library edit must not drift PDF) | AC-CORE-09C-03/08 · AC-CTR-PRINT-05 · O3/O11 · U65 · ≠ printable module UAT |
| **J-HRM-CORE-09C-03** | **Missing → ISSUE-BLOCKED** | Missing mandatory → Lưu → **400** ISSUE-BLOCKED + list; TPL-NONE path không issued giả | EX-CORE-09C-01/02 · AC-CTR-PRINT-01/06 · O2 · U65 |
| **J-HRM-CORE-09C-04** | **Nest /core 0 · PREV ephemeral · seals** | Nest `/core` 0; POST preview still 0 VER INSERT; registry F5; amend supersede (optional); CORE-09b/09a/08/02/01 smoke; no claim CORE-09b=printable / printable ready / 09d TPL DONE | AC-CORE-09C-04..07 · AC-CTR-PRINT-08 · O4/O5/O7/O9/O10 · U19 |

**Promotion:** Journeys remain **DRAFT** until QA U65 browser evidence · QC GWC C-SLICE only.

| Sealed peer | Rule |
|-------------|------|
| **J-HRM-CORE-09B-01..04** | must_keep · stamp **`CORE09BQC1-MSLB05DZ`** · QA `CORE09BQA-MSLAWKV6` · **DENY** reopen rewrite · PREV ephemeral · **≠** printable DONE · OBS clause-empty → **09d** |
| **J-HRM-CORE-09A-01..04** | must_keep · stamp **`CORE09AQC1-MSLA4LX9`** · **DENY** reopen rewrite · **≠** printable DONE |
| **J-HRM-CORE-08-01..04** | must_keep · stamp **`CORE08QC1-MSL9BFFE`** · **≠** pillar DONE · note **≠** FR-08 DONE |
| **J-HRM-CORE-02-01..04** | must_keep · stamp **`CORE02QC1-MSL80DU6`** · AuthZ/CB-403 |
| **J-HRM-CORE-01-01..04** | must_keep · stamp **`CORE01QC1-MSL6WMS7`** · public strip |
| Sealed W1–W9 UF/J | must_keep · **không** reopen |

---

## 6. Honesty & must_keep

| Item | Rule |
|------|------|
| `recruitment_uat_ready` | **false** |
| `jd_dynamic_done` | **false** RETAIN HOLD |
| `contracts_printable_ready` | **false** · **DENY** flip this BA seat |
| Personnel / CORE / CTR module UAT | **false** |
| Claim CORE-09b pack+preview = printable DONE | **DENIED** |
| Claim 09d TPL catalog = CORE-09c DONE | **DENIED** |
| Carry OBS `R-QA-CORE-09B-CLAUSE-FP-EMPTY` | → peer **09d** · **not** invent TPL DONE here |
| C-SLICE | GWC CORE-09c slice ≠ module CORE/personnel/CTR UAT ≠ Phase1 DONE ≠ printable ready |
| must_keep W14 | CORE-09b PACK+PREV ephemeral · stamp **`CORE09BQC1-MSLB05DZ`** · J-HRM-CORE-09B-* · **≠** printable DONE |
| must_keep W13 | CORE-09a `/contract-clauses*` · snapshot freeze · stamp **`CORE09AQC1-MSLA4LX9`** · J-HRM-CORE-09A-* |
| must_keep W12 | CORE-08 rewards/discipline + payroll_link · stamp **`CORE08QC1-MSL9BFFE`** · J-HRM-CORE-08-* |
| must_keep W11 | CORE-02 packages/eins · **`HRM-CORE-CB-AUTHZ-403`** · **`HRM-CORE-CB-403`** · stamp **`CORE02QC1-MSL80DU6`** |
| must_keep W10 | CORE-01 public strip · Nest `/core` DENY · stamp **`CORE01QC1-MSL6WMS7`** |
| must_keep VER+PDF | LIVE `POST/GET …/print-versions*` · `GET …/pdf` · `hrm_contract_print_versions` · server re-preview + `can_issue` · snapshot freeze · superseded amend · registry CRUD · soft-delete · U19 |
| must_keep W1–W9 | REC seals · HTP-05 · hire soft-link |
| DENY | Nest `/core` dual · PREV rewrite INSERT · 09d invent as DONE · claim CORE-09b=printable · printable flip · seed · honesty flip · apps/** · reopen sealed J-CORE-09B/09A/08/02/01 |

---

## 7. Handoff

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** · O1–O12 **CONFIRMED** |
| **next_owner** | **ba-data** — **HOLD default** (table LIVE · SA §8) · stamp HOLD CONFIRMED · unlock sa API-01 **only if** wire residual proven · else API RETAIN cite → FE save/PDF fidelity |
| **ba-data** | **HOLD** (SA default · BA confirms physical gap **not** proven) |
| **sa API-01** | **HOLD** default — F-CORE-CTR-VER-01/02 + F-CORE-CTR-PDF-01 **RETAIN cite** · unlock only if BA/QA prove residual wire gap |
| **Dev** | **HOLD** until DATA HOLD stamped + API cite RETAIN (then FE save VER + PDF U65 residual only · BE HOLD unless residual) |
| **evidence_path** | `docs/program/specs/PO-HRM-MVP-GD1-CORE-09C-CLUSTER-BA-01.md` |
| **qa_evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-core-09c-cluster-ba-01.md` |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-CORE-09C-CLUSTER-DATA-01
lane: governance · ba-data
program: PO-HRM-MVP-GD1-CONTINUOUS (U89)
uc_ids: UC-BP-CORE-09c
depends_on: BA-01 O1–O12 CONFIRMED · docs/program/specs/PO-HRM-MVP-GD1-CORE-09C-CLUSTER-BA-01.md · peer CORE-09b SEALED CORE09BQC1-MSLB05DZ
spec_ref: DB hrm_contract_print_versions LIVE · denorm pack/template on employee_contracts · F-CORE-CTR-VER-01/02 · F-CORE-CTR-PDF-01 · must_keep F-CORE-CTR-PACK-01 + F-CORE-CTR-PREV-01 ephemeral · F-CORE-CTR-CL-01..04 · SA/BA HOLD

MISSION — Physical DATA lock (docs-only · HOLD default):
1) CONFIRM HOLD — no ADD schema / mega-EAV / second VER store / Nest /core table / wipe print_versions; RETAIN LIVE hrm_contract_print_versions + denorm cols
2) Cite physical columns already LIVE for issued VER snapshots (merged_fields_json · clauses_snapshot_json · compensation_snapshot_json · version_no · pack_code · status issued/superseded · pdf_artifact_ref)
3) Conditional UNLOCK ONLY if BA/QA proves VER/PDF field column gap — default = NOT unlock
4) RETAIN CORE-09b PACK+PREV ephemeral · CORE-09a clause body SoT + snapshot · CORE-08 RD+payroll_link · CORE-02 packages/AuthZ/CB-403 · CORE-01 public · Nest /core DENY
5) DENY invent 09d TPL as CORE-09c DONE · claim CORE-09b=printable · contracts_printable_ready · reopen J-HRM-CORE-09B/09A/08/02/01 · seed · honesty flip · apps/**
6) Carry OBS R-QA-CORE-09B-CLAUSE-FP-EMPTY → peer 09d (not invent TPL DONE here)
7) Unlock next: sa API-01 HOLD/RETAIN cite F-CORE-CTR-VER-01/02 + F-CORE-CTR-PDF-01 — not Dev invent

exit: docs/program/specs/PO-HRM-MVP-GD1-CORE-09C-CLUSTER-DATA-01.md · PASS_TO_PM · next sa API RETAIN or Dev-FE save/PDF fidelity
```

---

## 8. Completion contract

| Field | Value |
|-------|--------|
| **completion_report** | O1–O12 **CONFIRMED** for UC-BP-CORE-09c against SA Option A: physical `POST/GET …/print-versions*` + `GET …/pdf` · server `can_issue` gate · snapshot freeze · amend supersede · PREV remains ephemeral · PDF from snapshot only · **ba-data HOLD** · J-HRM-CORE-09C-01..04 DRAFT · must_keep CORE-09b pack+PREV · CORE-09a CL · CORE-08 RD+payroll_link · CORE-02 AuthZ/CB-403 · CORE-01 public · Nest `/core` DENY · DENY invent 09d TPL as this WI DONE · claim CORE-09b=printable DONE · `contracts_printable_ready` · reopen sealed J-HRM-CORE-09B/09A/08/02/01 · seed · apps/** · carry OBS `R-QA-CORE-09B-CLAUSE-FP-EMPTY` → 09d · C-SLICE. |
| **next_owner** | **ba-data** (HOLD) |
| **ack_status** | **PASS_TO_PM** |
| **residual** | DATA-01 HOLD stamp · API F.1 RETAIN cite (no invent) · FE save VER + PDF fidelity residual after contracts · journeys DRAFT until QA · 09d peer seat · printable flag HOLD |

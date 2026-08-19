# BA AC pack — Wave-13 CORE cluster · UC-BP-CORE-09a (Thư viện điều khoản HĐ — Cài đặt)

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-CORE-09A-CLUSTER-BA-01` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89 — single GD continuous · Wave-13 seat **#15**) |
| **lane** | governance · ba-process |
| **Date** | 2026-08-09 |
| **Status** | **CONFIRMED against SA Option A LOCKED** · O1–O12 **CONFIRMED** · Dev **HOLD** · **ba-data HOLD default** (tables LIVE) · sa API-01 **HOLD** unless residual wire gap proven |
| **change_mode** | **ADD** (align SA-01 — **no** wipe paper FR-CORE-09a · **no** reopen W12 CORE-08 / W11 CORE-02 / W10 CORE-01 / W1–W9 REC · **no** invent Nest `/core` dual / Settings body SoT / 09b–09d print engine) |
| **uc_ids** | `UC-BP-CORE-09a` |
| **depends_on** | `PO-HRM-MVP-GD1-CORE-09A-CLUSTER-SA-01` **Option A LOCKED** · evidence `docs/qa/evidence/po-hrm-mvp-gd1-core-09a-cluster-sa-01.md` · Wave-12 CORE-08 **SEALED** stamp **`CORE08QC1-MSL9BFFE`** · QA `CORE08QA-MSL980WO` |
| **ref_sa** | `PO-HRM-MVP-GD1-CORE-09A-CLUSTER-SA-01.md` |
| **ref_evidence_sa** | `docs/qa/evidence/po-hrm-mvp-gd1-core-09a-cluster-sa-01.md` |
| **ref_ba_style** | `PO-HRM-MVP-GD1-CORE-08-CLUSTER-BA-01.md` · `PO-HRM-MVP-GD1-CORE-02-CLUSTER-BA-01.md` · peer platform `PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-CLAUSE-*` |
| **ref_srs** | `SRS_HRM_ENTERPRISE.md` **FR-UC-BP-CORE-09a** · Diễn biến #1–#5 · **BR-CTR-CL-01..04** · **AC-CTR-CL-01..03** · **AC-PLT-CTR-CL-01..06** · peers **09b / 09c / 09d OUT invent** |
| **ref_br** | **BR-CTR-CL-01..04** · BR-CORE-CL-* (this pack) |
| **ref_hdsd** | `HDSD_XEVN_CH06h_HRM_THU_VIEN_DIEU_KHOAN_HD.md` — Cài đặt → Thư viện điều khoản HĐ |
| **ref_paper_db** | `DB_DESIGN_HRM_ENTERPRISE.md` `hrm_contract_clauses` · snapshot `hrm_contract_print_versions.clauses_snapshot_json` · **LIVE RETAIN** |
| **ref_api_paper** | **F-CORE-CTR-CL-01..04** RETAIN · **F-CORE-CTR-PUB/PULL** RETAIN · physical Option A: `/api/hrm/contracts-insurance/contract-clauses*` · paper `/api/hrm/core/…/clauses` = **alias only** · peers F-CORE-CTR-PREV/VER/PDF/TPL **OUT invent** |
| **Honesty** | `recruitment_uat_ready=false` · **`jd_dynamic_done=false`** · **`contracts_printable_ready=false`** · personnel / CORE / CTR module UAT **false** · **`C-SLICE-≠-MODULE`** · DENY flip · **DENY** claim CORE-08 = CORE pillar DONE · **DENY** claim note-CRUD = FR-08 DONE |
| **Cấm** | Nest `/core` dual clause SoT · Settings/XBOS as body SoT · mega clause-version EAV · rewrite issued snapshot · FE hardcode legal body · dual placeholder syntax · invent 09b/09c/09d print engine as this WI DONE · claim CORE-08=pillar DONE · claim note=FR-08 DONE · claim printable UAT · reopen sealed J-HRM-CORE-08-01..04 / J-CORE-02-* / J-CORE-01-* / REC without regression · seed · honesty flip · apps/** |

---

## 0. Process objective & actors

### Objective

Khóa **AC đo được** + **Diễn biến FE mutate (U63/U65)** cho Wave-13 seat #15:

1. **UC-BP-CORE-09a** — (1) Cài đặt → thư viện điều khoản VI (mã · tiêu đề · nội dung · nhóm · gói · thứ tự · bắt buộc · trạng thái · phiên bản); (2) nháp / chưa gắn bản phát hành → **sửa tại chỗ** → F5 còn; (3) đã gắn HĐ phát hành → **chặn ghi đè** → `activate` **tăng phiên bản**; (4) HĐ cũ giữ **ảnh chụp** bất biến; (5) chỗ điền `{{tên_trường}}` / `{{token}}` only; (6) ngừng dùng **mềm**; (7) Settings = **UX admin** — **≠** body SoT thứ hai.
2. **Option A** — ACCEPT_AS_IS_RETAIN trên LIVE **`/api/hrm/contracts-insurance/contract-clauses*`** (+ activate / retire); paper `/core/…/clauses` = **alias only**.
3. **Không** claim module CORE/personnel/CTR UAT / flip `contracts_printable_ready`; **không** reopen J-HRM-CORE-08/02/01; **không** coi CORE-08 RD GWC = CORE pillar DONE; **không** invent 09b/09c/09d engine.

### Actors

| Actor | Trách nhiệm |
|-------|-------------|
| Quản trị cấu hình / HCNS (đủ quyền) | Tạo / sửa / kích hoạt / ngừng điều khoản trên **Cài đặt** |
| Soạn HĐ (consumer) | Chỉ **resolve** body từ thư viện hoặc snapshot — **không** hardcode văn bản luật dài |
| Group CEO | Scope rollup `main` — U19 list=get=update=activate=retire |
| Member CEO / HRBP | Chỉ pháp nhân / membership · cùng `resolveHrmListScope` |
| Hệ thống (Nest) | Draft in-place · issued soft-block → activate bump · snapshot freeze · soft retire · **không** invent Nest `/core` clause SoT · **không** Settings/XBOS body SoT |

### Scope

| In (this seat) | Out |
|----------------|-----|
| O1–O12 CONFIRM · AC-CTR-CL / AC-PLT-CTR-CL deepen · AC-CORE-09A-* · VAL-CORE-CL-* · Diễn biến FE U65 · J-HRM-CORE-09A-* DRAFT | Impl `apps/**` / migration / seed |
| Physical clause mutate on `/contracts-insurance/contract-clauses*` | Greenfield Nest `/core/…/clauses` SoT · Settings/XBOS body store |
| Draft in-place · issued bump · snapshot freeze · `{{field}}` · soft retire | Invent full 09b pack-preview / 09c print-PDF / 09d template-catalog engines |
| Settings UX fidelity residual (FE) after contracts | DOCX · DnD layout reorder |
| Honesty footer · C-SLICE · CORE-08 ≠ pillar DONE · note ≠ FR-08 DONE · printable false | Flip `contracts_printable_ready` / `jd_dynamic_done` / `recruitment_uat_ready` / Phase1 DONE |
| | Reopen sealed J-CORE-08 / J-CORE-02 / J-CORE-01 / REC rewrite |
| | ATT · CORE-02b · PAY |

### SA Option A — BA CONFIRM (đóng O1–O12)

| # | Topic | BA CONFIRM (normative) |
|---|-------|-------------------------|
| **O1** | Physical path | **YES** — Settings list/create/update/activate/retire Network **chỉ** physical **`/api/hrm/contracts-insurance/contract-clauses*`** · paper `/api/hrm/core/…/clauses` = **alias / DOC-DELTA only** — **FAIL** nếu Nest `@Controller('core')` second clause SoT · **FAIL** nếu Settings/XBOS owns `body_vi` as authoritative store |
| **O2** | Field matrix | **YES** — `code · title_vi · body_vi · clause_group · apply_to_packs · sort_order · mandatory · status · version` (+ display-ready group/pack/status VI labels) · VAL empty code/title/body → **400** `HRM-CTR-CL-REQUIRED` (RETAIN) |
| **O3** | Draft vs bump | **YES** — Draft / not-issued → PATCH in-place **2xx** + **F5** body mới · Active + issued → PATCH body → **`HRM-CTR-CL-CODE-CONFLICT`** (or peer soft-block) → **`POST …/activate`** version bump · issued `clauses_snapshot_json` **immutable** — maps **AC-PLT-CTR-CL-01..03** |
| **O4** | Placeholders | **YES** — `{{tên_trường}}` / `{{token}}` **only** — DENY dual merge syntax on one template · open N+1 clause codes allowed — **AC-PLT-CTR-CL-04** · **BR-CTR-CL-03** |
| **O5** | Physical schema | **YES HOLD** ba-data default — `hrm_contract_clauses` + snapshot cols **LIVE** · **no** mega-EAV / second body table · **conditional** prior-body admin history **only if** BA/QA proves snapshot insufficient — **this seat: gap NOT proven** → **HOLD** |
| **O6** | Soft retire | **YES** — `POST …/retire` soft archive · hide from new select · issued snapshots still readable · **DENY** hard-delete when referenced — **AC-CTR-CL-03** · **AC-PLT-CTR-CL-06** |
| **O7** | Consumer resolve | **YES** — Preview/print **resolve** from library row or snapshot — **never** FE hardcode long legal body — **AC-PLT-CTR-CL-05** · assert scope note only (full print engine **OUT**) |
| **O8** | Peers OUT | **YES** — UC-BP-CORE-09b / 09c / 09d full engines · DOCX · DnD reorder · F-CORE-CTR-PREV/VER/PDF invent as this WI DONE · ATT · CORE-02b — **peer** seats only |
| **O9** | must_keep CORE-08 / 02 / 01 | **YES** — RETAIN RD `/employees/:id/rewards*`+`/discipline*` + payroll_link · packages/eins · **`HRM-CORE-CB-AUTHZ-403`** · **`HRM-CORE-CB-403`** · public strip · Nest `/core` DENY · stamps **`CORE08QC1-MSL9BFFE`** · **`CORE02QC1-MSL80DU6`** · **`CORE01QC1-MSL6WMS7`** · J-HRM-CORE-08-01..04 · J-CORE-02-* · J-CORE-01-* **PASS RETAIN** · **DENY** claim CORE-08 = CORE pillar DONE · **DENY** claim note-CRUD = FR-08 DONE · **DENY** reopen sealed J-* without regression |
| **O10** | Honesty | **YES false** — `recruitment_uat_ready=false` · `jd_dynamic_done=false` · **`contracts_printable_ready=false`** · personnel/CORE/CTR module UAT **false** · **C-SLICE** · GWC slice ≠ module UAT · **≠** claim CORE-08 = pillar DONE · **≠** note = FR-08 DONE |
| **O11** | Display-ready | **YES** — Clause DTO display-ready (group label · pack labels · status VI · version) — **cấm** FE invent print PDF Net / second body SoT |
| **O12** | Journeys | **YES** — DRAFT **`J-HRM-CORE-09A-01..04`** (Settings create+activate · draft edit F5 · issued bump + snapshot freeze · retire soft + Nest `/core` 0 + CORE-08/02/01 regression) · U19 Group CEO rollup stated |

**Architecture SoT:** ONE LIVE `hrm_contract_clauses.body_vi` · Settings = admin UX only · paper `/core/…/clauses` alias only · U19 list=get=update=activate=retire · soft-delete doctrine RETAIN · snapshot freeze must_keep · CORE-08 RD + CORE-02 C&B + CORE-01 public **must_keep**.

### Primary API surface (BA lock — O1 / O3 / O6)

| Intent | Physical (normative) | Paper alias |
|--------|----------------------|-------------|
| List clauses | **`GET /api/hrm/contracts-insurance/contract-clauses`** | `/core/…/clauses` alias only |
| Create / update | **`POST/PATCH …/contract-clauses`** · draft in-place · issued soft-block | alias |
| Get-by-id | **`GET …/contract-clauses/:id`** | — |
| Activate + bump | **`POST …/contract-clauses/:id/activate`** | alias |
| Retire soft | **`POST …/contract-clauses/:id/retire`** | alias |
| Library publish/pull | **`/contract-library/publishes*`** · **`/pull`** (**RETAIN** · not new SoT) | — |
| Pack preview / print / PDF / TPL | Peer **F-CORE-CTR-PREV/VER/PDF/TPL** | **OUT invent** this seat |
| CORE-08 RD | **RETAIN SEALED** `/employees/:id/rewards*` + `/discipline*` | `/core/reward-discipline` alias |
| CORE-02 C&B | **RETAIN SEALED** compensation-packages* | `/core/…/compensation` alias |
| CORE-01 public | **RETAIN SEALED** `/api/hrm/employees*` | `/core/employees` alias |

**Invariant CORE-CL-PATH:** Clause mutate Network **MUST** hit `/contracts-insurance/contract-clauses*` · Nest dual `/core` clause SoT = **FAIL O1**.

**Invariant CORE-CL-SETTINGS-≠-SOT:** Settings UI **≠** second `body_vi` store (XBOS/Settings catalog) = **FAIL O1** if body authoritative outside Nest.

**Invariant CORE-CL-DRAFT:** Draft/not-issued PATCH → 2xx + F5 new body = **PASS O3 / AC-PLT-CTR-CL-01**.

**Invariant CORE-CL-ISSUED:** Issued body PATCH silent overwrite = **FAIL** · must conflict → activate bump · snapshot immutable = **PASS O3 / AC-PLT-CTR-CL-02/03**.

**Invariant CORE-CL-≠-RD-DONE:** CORE-08 RD GWC **≠** CORE pillar DONE · claim = **FAIL O9**.

**Invariant CORE-CL-≠-NOTE-DONE:** note-CRUD **≠** FR-08 DONE · claim = **FAIL O9/O10**.

**Invariant CORE-CL-≠-PRINTABLE:** Slice GWC **≠** `contracts_printable_ready=true` · claim = **FAIL O10**.

**Invariant CORE-CL-NEST-DENY:** Nest `/api/hrm/core/**` clause SoT = **FAIL O1**.

---

## 1. As-is vs to-be

| | AS-IS (LIVE + seals) | TO-BE (Wave-13 · Option A) |
|---|----------------------|---------------------------|
| Clause path | LIVE `/contracts-insurance/contract-clauses*` | **RETAIN SoT** (**O1**) |
| Paper `/core/…/clauses` | Not Nest SoT | **Alias / DOC-DELTA only** (**O1**) |
| Draft edit | `updateClause` in-place | **RETAIN** + U65 FE F5 AC (**O3**) |
| Issued body | Soft-block → activate bump | **RETAIN** + AC-PLT-CTR-CL-02 (**O3**) |
| Snapshot | `clauses_snapshot_json` | **must_keep RETAIN** (**O3/O7**) |
| Placeholders | `{{token}}` | **LOCK** `{{field}}` only (**O4**) |
| Soft retire | `POST …/retire` | **RETAIN** + AC-PLT-CTR-CL-06 (**O6**) |
| Settings UX | Partial / residual | **UNLOCK FE residual** after contracts — **≠** body SoT (**O1/O11**) |
| Schema | LIVE tables | **ba-data HOLD** (**O5**) |
| 09b/09c/09d | Peer LIVE stubs | **OUT invent** as DONE (**O8**) |
| CORE-08/02/01 | SEALED stamps | **must_keep RETAIN** (**O9**) |
| Honesty | C-SLICE · printable false | **false** (**O10**) |

### 1.1 Field matrix (logical — ba-data HOLD physical)

| Logical field | Required | Notes |
|---------------|----------|-------|
| `code` | **YES** | Stable per legal entity · conflict active → soft-block |
| `title_vi` | **YES** | VI title |
| `body_vi` | **YES** | Body SoT · `{{tên_trường}}` allowed |
| `clause_group` | **YES** | Standard groups (A/B, work, term, pay, …) |
| `apply_to_packs` | **YES** | Chung / IT / Lái xe / … |
| `sort_order` | **YES** | Order in group |
| `mandatory` | **YES** | Pack-attach gate (consumer 09b/09c — **OUT** invent) |
| `status` | **YES** | Nháp / Hiệu lực / Ngừng dùng |
| `version` | **YES** | Bump on activate when issued |
| Display labels | Display-ready | Group · pack · status VI (**O11**) |

**ba-data:** **HOLD** — no ADD schema this seat unless residual prior-body history proven · **DENY** mega-EAV · **DENY** second body SoT · **DENY** Nest `/core` table invent.

---

## 2. Business rules (normative — SRS + SA; không invent)

| ID | Condition | Action | Outcome |
|----|-----------|--------|---------|
| **BR-CTR-CL-01** | Edit body of clause attached to issued HĐ | DENY silent overwrite → activate version bump; old HĐ keeps snapshot | Silent overwrite = **FAIL O3** |
| **BR-CTR-CL-02** | Pack missing mandatory clause | Block print/version save + list missing | **OUT invent** full gate as 09a DONE — residual peer 09b/09c |
| **BR-CTR-CL-03** | Business / preview / print surfaces | Resolve body from library or snapshot only | FE hardcode long legal = **FAIL O4/O7** |
| **BR-CTR-CL-04** | No effective template | Guide config only — no fake «from template» version | Peer CORE-09 / 09d — **OUT** invent |
| **BR-CORE-CL-PATH** | FR-CORE-09a API | Physical `/contracts-insurance/contract-clauses*` | Nest `/core` dual = **FAIL O1** |
| **BR-CORE-CL-SETTINGS** | Settings surface | UX over Nest SoT only | Settings/XBOS body SoT = **FAIL O1** |
| **BR-CORE-CL-DRAFT** | Draft / not-issued | In-place save 2xx + F5 | Stale F5 = **FAIL AC-PLT-CTR-CL-01** |
| **BR-CORE-CL-SNAPSHOT** | After issue | `clauses_snapshot_json` immutable | Mutate snapshot = **FAIL AC-PLT-CTR-CL-03** |
| **BR-CORE-CL-PLACEHOLDER** | Merge tokens | `{{x}}` only | Dual syntax = **FAIL O4** |
| **BR-CORE-CL-RETIRE** | Retire | Soft hide; snapshots readable | Hard-delete referenced = **FAIL O6** |
| **BR-CORE-CL-SCOPE** | list = get = update = activate = retire | `resolveHrmListScope` | Cross-CT leak = **FAIL** U19 |
| **BR-CORE-CL-≠-RD-DONE** | CORE-08 GWC | RD ≠ pillar DONE | Claim CORE-08 = pillar DONE = **FAIL O9** |
| **BR-CORE-CL-≠-NOTE-DONE** | note-CRUD | ≠ FR-08 DONE | Claim note = FR-08 DONE = **FAIL O9** |
| **BR-CORE-CL-≠-PRINTABLE** | After GWC | printable false | Flip `contracts_printable_ready` = **FAIL O10** |
| **BR-CORE-CL-NO-SEED** | Nghiệm thu | Chuỗi FE only | Seed = **FAIL U65** |
| **BR-CORE-CL-PEER-OUT** | 09b/09c/09d engines | Peer seats | Pull into this WI = **FAIL O8** |
| **BR-CORE-CL-DISPLAY** | FE bind | BE display-ready | FE invent PDF Net = **FAIL O11** |

### Error taxonomy (BA / QA assert — RETAIN; no invent rewrite)

| Code family | HTTP | UX intent (VI) | ≠ |
|-------------|------|----------------|--|
| **`HRM-CTR-CL-200/201`** | 2xx | Lưu / tạo thành công (**RETAIN**) | — |
| **`HRM-CTR-CL-REQUIRED`** | 400 | Thiếu mã / tiêu đề / nội dung | AuthZ |
| **`HRM-CTR-CL-CODE-CONFLICT`** | 4xx | Đã gắn bản phát hành — phải kích hoạt tăng phiên bản | Scope 409 |
| **`HRM-CTR-CL-404`** | 404 | Không tìm thấy / ngoài scope | — |
| `HRM-SCOPE-409` | 409 | Ngoài phạm vi pháp nhân | CL conflict |
| Sealed `HRM-CORE-RD-*` / `HRM-CORE-CB-*` / AuthZ | — | **DENY** rewrite · must_keep regression | — |

---

## 3. UC-BP-CORE-09a — Acceptance criteria

### 3.0 Scope ladder (mọi AC — U19)

| Persona | User sees | Fail |
|---------|-----------|------|
| **Group CEO** (`main`) + config right | Clause library trong scope rollup | Cross-CT mutate without membership |
| **Member CEO / HRBP** | Chỉ pháp nhân membership | List/get/activate khác resolver |
| **Config HCNS** | Settings create/edit/activate/retire | Open without config right |
| **Non-config** | Deny open/save | Silent 2xx |

**Invariant CORE-CL-SCOPE:** list clauses **=** get-by-id **=** update **=** activate **=** retire **same** contracts-insurance scope family.

**Prerequisite:** Legal entity in scope · config persona · **không** dùng seed · CORE-08/02/01 seals RETAIN · printable flag false.

### 3.1 Happy path (Diễn biến #1–#5 + Thành công) — U65 FE

| AC-ID | SRS / PLT | Given | When | Then (measurable — **user sees**) | Evidence |
|-------|-----------|-------|------|-------------------------------------|----------|
| **AC-CORE-09A-01** | #1 · AC-CTR-CL-01 · O1 | Config persona in scope | FE: Nhân sự → **Cài đặt** → **Thư viện điều khoản HĐ** | Network **GET** `/api/hrm/contracts-insurance/contract-clauses` **200**; list by group; **no** Nest `/api/hrm/core/…/clauses` | Browser · HDSD CH06h · O1 |
| **AC-CORE-09A-02** | #2 · AC-PLT-CTR-CL-04 · O2/O4 | Form hợp lệ + `{{field}}` in body | Thêm điều khoản (mã N+1 · title · body · group · packs) → **Lưu** | Network **POST** `…/contract-clauses` **2xx** `HRM-CTR-CL-201`; row on list; **F5** còn | Browser · U65 · O2/O4 |
| **AC-CORE-09A-03** | #3 · AC-CTR-CL-01 · O3 | Draft clause exists | **Đưa hiệu lực** / Activate | Network **POST** `…/contract-clauses/:id/activate` **2xx**; status VI = Hiệu lực; version set; **F5** còn | Browser · O3 |
| **AC-CORE-09A-04** | AC-PLT-CTR-CL-01 · O3 | Draft / not-issued clause | Sửa `body_vi` → **Lưu** → **F5** | Network **PATCH** **2xx**; UI shows new body after F5; version unchanged or optional bump **without** issued conflict | Browser · U65 · O3 |
| **AC-CORE-09A-05** | AC-PLT-CTR-CL-02 · BR-CTR-CL-01 · O3 | Clause already in **issued** print version | PATCH body → (conflict) → Activate bump | PATCH → **`HRM-CTR-CL-CODE-CONFLICT`** (or soft-block UX); **POST activate** 2xx → version **N+1**; FE shows new version for future attach | Browser · U65 · O3 |
| **AC-CORE-09A-06** | AC-PLT-CTR-CL-03 · O3/O7 | Issued print version exists | After library edit/bump → reopen **issued** HĐ/print version | Issued body from `clauses_snapshot_json` **unchanged**; library vN+1 does **not** rewrite snapshot | Browser + L1 snapshot assert · O3 |
| **AC-CORE-09A-07** | #4 · AC-CTR-CL-03 · AC-PLT-CTR-CL-06 · O6 | Active clause (may have snapshots) | **Ngừng dùng** / Retire → confirm | Network **POST** `…/retire` **2xx**; hidden from default new select; filter «gồm ngừng» can show; issued snapshots still readable | Browser · O6 |
| **AC-CORE-09A-08** | AC-PLT-CTR-CL-05 · O7 | Preview/print consumer path (smoke) | Open preview that binds clause | Body resolved from library **or** snapshot — **no** long hardcoded legal string as SoT on FE | Browser / lint · O7 · **≠** print module UAT |
| **AC-CORE-09A-09** | O9 · O1 | After Settings mutate | Nest `/core` clause probes + CORE-08/02/01 smoke | Nest `/api/hrm/core/**` clause **0**; RD rewards/discipline + packages AuthZ/CB-403 + public strip still PASS; **no** claim CORE-08=pillar DONE / note=FR-08 DONE / printable ready | L1 + browser · O9/O10 |

### 3.2 Exception / alternate

| AC-ID | Given | When | Then | Maps |
|-------|-------|------|------|------|
| **EX-CORE-09A-01** | Empty code/title/body | Lưu | **400** `HRM-CTR-CL-REQUIRED`; FE lists missing fields | Diễn biến #5 · O2 |
| **EX-CORE-09A-02** | Active code conflict / issued overwrite attempt | PATCH body without activate | Soft-block / **`HRM-CTR-CL-CODE-CONFLICT`** — **not** silent 200 overwrite | BR-CTR-CL-01 · O3 |
| **EX-CORE-09A-03** | No config right | Open/save Settings library | Deny open/save | SRS đặc biệt · O12 |
| **EX-CORE-09A-04** | Outside company scope | get/update/activate other CT | **404/409** scope family | U19 |
| **EX-CORE-09A-05** | Hard-delete referenced clause | Attempt hard delete | **DENY** — soft retire only | O6 |
| **EX-CORE-09A-06** | Dual placeholder syntax in one body | Save `{{x}}` + `${x}` / other | VAL fail or BA/QA FAIL O4 | O4 |
| **EX-CORE-09A-07** | FE invent Nest `/core` or Settings body POST as SoT | Mutate | **FAIL O1** | O1 |
| **EX-CORE-09A-08** | Seed to create clause for U65 | QA evidence | **FAIL U65** | O10 |
| **EX-CORE-09A-09** | Claim CORE-08=pillar DONE / note=FR-08 / printable true | Evidence footer | **FAIL O9/O10** | Honesty |
| **EX-CORE-09A-10** | Invent 09b/09c/09d as this WI DONE | Scope | **FAIL O8** | Peer OUT |

### 3.3 SRS AC crosswalk (normative deepen — no wipe)

| SRS AC | BA deepen | J-* |
|--------|-----------|-----|
| **AC-CTR-CL-01** | AC-CORE-09A-01..03 | J-09A-01 |
| **AC-CTR-CL-02** | AC-CORE-09A-05 | J-09A-03 |
| **AC-CTR-CL-03** | AC-CORE-09A-07 | J-09A-04 |
| **AC-PLT-CTR-CL-01** | AC-CORE-09A-04 | J-09A-02 |
| **AC-PLT-CTR-CL-02** | AC-CORE-09A-05 | J-09A-03 |
| **AC-PLT-CTR-CL-03** | AC-CORE-09A-06 | J-09A-03 |
| **AC-PLT-CTR-CL-04** | AC-CORE-09A-02 | J-09A-01 |
| **AC-PLT-CTR-CL-05** | AC-CORE-09A-08 (smoke resolve — **≠** print UAT) | J-09A-03 note |
| **AC-PLT-CTR-CL-06** | AC-CORE-09A-07 | J-09A-04 |

### 3.4 VAL matrix (measurable)

| VAL-ID | Rule | Pass | Fail |
|--------|------|------|------|
| **VAL-CORE-CL-01** | Network path physical contracts-insurance | All mutate hits `/contract-clauses*` | Nest `/core` hit |
| **VAL-CORE-CL-02** | Required fields | Empty → 400 REQUIRED | Silent 2xx |
| **VAL-CORE-CL-03** | Draft F5 | PATCH 2xx + F5 new body | Stale body |
| **VAL-CORE-CL-04** | Issued conflict | CONFLICT → activate bump | Silent overwrite |
| **VAL-CORE-CL-05** | Snapshot freeze | Issued reopen unchanged | Snapshot mutated |
| **VAL-CORE-CL-06** | Placeholder `{{x}}` only | Save OK with tokens | Dual syntax accepted as SoT |
| **VAL-CORE-CL-07** | Soft retire | Retire 2xx · hide · snapshot OK | Hard-delete / lost snapshot |
| **VAL-CORE-CL-08** | N+1 codes | New code F5 | Closed list reject |
| **VAL-CORE-CL-09** | Settings ≠ body SoT | Body persists Nest only | Settings/XBOS second writer |
| **VAL-CORE-CL-10** | Nest `/core` 0 | Zero clause SoT calls | Dual controller |
| **VAL-CORE-CL-11** | CORE-08 must_keep | RD+payroll_link smoke PASS | RD regression |
| **VAL-CORE-CL-12** | CORE-02 must_keep | packages AuthZ/CB-403 PASS | CB regression |
| **VAL-CORE-CL-13** | CORE-01 must_keep | public strip PASS | Public leak |
| **VAL-CORE-CL-14** | Honesty footer | printable/recruitment/jd/CORE UAT false | Flip ready |
| **VAL-CORE-CL-15** | No seed | FE-only create | Seed in evidence |
| **VAL-CORE-CL-16** | Scope parity U19 | list=get=activate=retire | Cross-CT |
| **VAL-CORE-CL-17** | Display-ready | Labels VI + version | FE invent PDF |
| **VAL-CORE-CL-18** | Peer OUT | No 09b/c/d DONE claim | Engine invent |
| **VAL-CORE-CL-19** | ≠ RD DONE | No CORE-08=pillar DONE | False DONE |
| **VAL-CORE-CL-20** | ≠ note DONE | No note=FR-08 DONE | False DONE |
| **VAL-CORE-CL-21** | Publish/pull RETAIN | Optional smoke not new SoT | Second body via publish invent |
| **VAL-CORE-CL-22** | Group CEO rollup | `main` sees in-scope | Wrong member leak |
| **VAL-CORE-CL-23** | HDSD path | Menu = CH06h Settings library | Wrong menu UF |
| **VAL-CORE-CL-24** | C-SLICE | Slice GWC ≠ module CTR UAT | Module UAT claim |

---

## 4. Diễn biến FE (U65) — click path normative

```text
Login ceo@xe.vn (or config HCNS)
 → Nhân sự (/hr)
 → Cài đặt → Thư viện điều khoản hợp đồng   [HDSD CH06h]
 → [J-01] Thêm → nhập mã/title/body({{field}})/group/packs → Lưu → POST 2xx → F5
 → Đưa hiệu lực → POST …/activate 2xx → F5
 → [J-02] Mở nháp/chưa issued → sửa body → Lưu → PATCH 2xx → F5 còn nội dung mới
 → [J-03] (có issued snapshot) sửa body → CONFLICT → Activate bump → mở lại bản đã phát hành = snapshot cũ
 → [J-04] Ngừng dùng → POST …/retire 2xx → ẩn chọn mới; Nest /core 0; smoke CORE-08/02/01
```

**cấm:** `pnpm seed:*` · API seed clause · DB fake issue · PASS chỉ curl · claim printable UAT.

---

## 5. Journeys DRAFT (O12) — mint

| J-ID | Title | Click path (draft) | Pass when |
|------|-------|--------------------|-----------|
| **J-HRM-CORE-09A-01** | **Settings create + activate** | Login → Cài đặt → Thư viện ĐK → Thêm (+ `{{field}}`) → Lưu POST 2xx → F5 → Activate 2xx → F5 | AC-CORE-09A-01..03 · AC-CTR-CL-01 · AC-PLT-CTR-CL-04 · O1/O2/O4 · U65 · ≠ Nest `/core` dual |
| **J-HRM-CORE-09A-02** | **Draft edit in-place F5** | Open draft/not-issued → sửa body → Lưu PATCH 2xx → F5 body mới | AC-CORE-09A-04 · AC-PLT-CTR-CL-01 · O3 · U65 |
| **J-HRM-CORE-09A-03** | **Issued bump + snapshot freeze** | Issued clause → PATCH CONFLICT → Activate bump → reopen issued snapshot unchanged | AC-CORE-09A-05/06 · AC-PLT-CTR-CL-02/03 · BR-CTR-CL-01 · O3/O7 · U65 |
| **J-HRM-CORE-09A-04** | **Retire soft + Nest /core 0 + seals** | Retire 2xx · hide from new select · snapshot readable · Nest `/core` 0 · CORE-08 RD+payroll_link · CORE-02 AuthZ/CB · CORE-01 public smoke · no claim CORE-08=DONE / note=FR-08 / printable | AC-CORE-09A-07/09 · AC-PLT-CTR-CL-06 · O6/O9/O10 · U19 |

**Promotion:** Journeys remain **DRAFT** until QA U65 browser evidence · QC GWC C-SLICE only.

| Sealed peer | Rule |
|-------------|------|
| **J-HRM-CORE-08-01..04** | must_keep · stamp **`CORE08QC1-MSL9BFFE`** · **DENY** reopen without regression · **≠** pillar DONE · note **≠** FR-08 DONE |
| **J-HRM-CORE-02-01..04** | must_keep · stamp **`CORE02QC1-MSL80DU6`** · **≠** pillar DONE |
| **J-HRM-CORE-01-01..04** | 🟢 SEALED · stamp **`CORE01QC1-MSL6WMS7`** · **DENY** reopen without regression |
| Sealed W1–W9 UF/J | must_keep · **không** reopen |

---

## 6. Honesty & must_keep

| Item | Rule |
|------|------|
| `recruitment_uat_ready` | **false** |
| `jd_dynamic_done` | **false** RETAIN HOLD |
| `contracts_printable_ready` | **false** · **DENY** flip |
| Personnel / CORE / CTR module UAT | **false** |
| Claim CORE-08 RD = CORE pillar DONE | **DENIED** |
| Claim note-CRUD = FR-UC-BP-CORE-08 DONE | **DENIED** |
| C-SLICE | GWC CORE-09a slice ≠ module CORE/personnel/CTR UAT ≠ Phase1 DONE ≠ printable ready |
| must_keep W12 | CORE-08 rewards/discipline + payroll_link · stamp **`CORE08QC1-MSL9BFFE`** · J-HRM-CORE-08-* · **≠** pillar DONE · note **≠** FR-08 DONE |
| must_keep W11 | CORE-02 packages/eins · **`HRM-CORE-CB-AUTHZ-403`** · **`HRM-CORE-CB-403`** · stamp **`CORE02QC1-MSL80DU6`** · J-HRM-CORE-02-* |
| must_keep W10 | CORE-01 public strip · Nest `/core` DENY · stamp **`CORE01QC1-MSL6WMS7`** · J-HRM-CORE-01-* |
| must_keep clause spine | LIVE `/contracts-insurance/contract-clauses*` · `body_vi`+`version` · activate soft-block · `clauses_snapshot_json` freeze · publish/pull · soft-delete · U19 |
| must_keep W1–W9 | REC seals · HTP-05 · hire soft-link |
| DENY | Nest `/core` dual · Settings body SoT · mega-EAV · 09b/c/d invent · claim CORE-08=DONE · claim note=FR-08 DONE · printable flip · seed · honesty flip · apps/** · reopen sealed J-CORE-08/02/01 |

---

## 7. Handoff

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** · O1–O12 **CONFIRMED** |
| **next_owner** | **ba-data** — **HOLD default** (tables LIVE · O5) · stamp HOLD CONFIRMED · unlock FE residual **or** sa API-01 **only if** wire residual proven |
| **ba-data** | **HOLD** (SA default · BA confirms gap **not** proven for prior-body EAV) |
| **sa API-01** | **HOLD** default — F-CORE-CTR-CL-01..04 **RETAIN cite** · unlock only if BA/QA prove residual wire gap |
| **Dev** | **HOLD** until DATA HOLD stamped + API cite RETAIN (then FE Settings fidelity residual only) |
| **evidence_path** | `docs/program/specs/PO-HRM-MVP-GD1-CORE-09A-CLUSTER-BA-01.md` |
| **qa_evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-core-09a-cluster-ba-01.md` |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-CORE-09A-CLUSTER-DATA-01
lane: governance · ba-data
program: PO-HRM-MVP-GD1-CONTINUOUS (U89)
uc_ids: UC-BP-CORE-09a
depends_on: BA-01 O1–O12 CONFIRMED · docs/program/specs/PO-HRM-MVP-GD1-CORE-09A-CLUSTER-BA-01.md · peer CORE-08 SEALED CORE08QC1-MSL9BFFE
spec_ref: DB hrm_contract_clauses LIVE · clauses_snapshot_json · F-CORE-CTR-CL-01..04 · BR-CTR-CL-01..04 · SA/BA O5 HOLD

MISSION — Physical DATA lock (docs-only · HOLD default):
1) CONFIRM HOLD — no ADD mega clause-version EAV / second body SoT; RETAIN LIVE hrm_contract_clauses + print snapshot cols
2) Cite physical columns already LIVE (code title_vi body_vi clause_group apply_to_packs sort_order mandatory status version archived_at lineage) — DENY invent Nest /core table
3) Conditional UNLOCK prior-body admin history ONLY if BA/QA proves snapshot insufficient — default = NOT unlock
4) RETAIN CORE-08 RD+payroll_link · CORE-02 packages/AuthZ/CB-403 · CORE-01 public · Nest /core DENY · snapshot freeze
5) DENY Settings/XBOS body SoT · 09b/09c/09d invent · claim CORE-08=pillar DONE · note=FR-08 DONE · contracts_printable_ready · reopen J-CORE-08/02/01 · seed · honesty flip · apps/**
6) Unlock next: sa API-01 HOLD/RETAIN cite F-CORE-CTR-CL-01..04 (or FE residual) — not Dev invent

exit: docs/program/specs/PO-HRM-MVP-GD1-CORE-09A-CLUSTER-DATA-01.md · PASS_TO_PM · next sa API RETAIN or Dev-FE Settings residual
```

---

## 8. Completion contract

| Field | Value |
|-------|--------|
| **completion_report** | O1–O12 **CONFIRMED** for UC-BP-CORE-09a against SA Option A: physical `/contracts-insurance/contract-clauses*` · Settings UX ≠ body SoT · draft in-place F5 · issued CONFLICT→activate bump · snapshot freeze · `{{field}}` · soft retire · **ba-data HOLD** · J-HRM-CORE-09A-01..04 DRAFT · must_keep CORE-08 RD+payroll_link · CORE-02 packages/AuthZ/CB-403 · CORE-01 public · Nest `/core` DENY · DENY invent 09b/09c/09d · claim CORE-08=pillar DONE · note=FR-08 DONE · `contracts_printable_ready` · reopen sealed J-CORE-08/02/01 · seed · apps/** · C-SLICE. |
| **next_owner** | **ba-data** (HOLD) |
| **ack_status** | **PASS_TO_PM** |
| **residual** | DATA-01 HOLD stamp · API F.1 RETAIN cite (no invent) · FE Settings fidelity residual after contracts · journeys DRAFT until QA |

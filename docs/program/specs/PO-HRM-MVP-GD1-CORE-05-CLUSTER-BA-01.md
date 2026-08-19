# BA AC pack — Wave-19 CORE cluster · UC-BP-CORE-05 (Cấp phát tài sản + biên bản · Q-ASSET stub RETAIN)

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-CORE-05-CLUSTER-BA-01` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89 — single GD continuous · Wave-19 seat **#21**) |
| **lane** | governance · ba-process |
| **Date** | 2026-08-09 |
| **Status** | **CONFIRMED against SA Option A LOCKED** · O1–O12 **CONFIRMED** · Dev **HOLD** · **ba-data REQUIRED** for handover soft cols/table (§3.8 / F-CORE-AST-01 `handover_doc_id` gap **PROVEN**) · assignment CRUD / catalog stub **RETAIN** · serial gate **wire residual** (HOLD schema) · sa API **HOLD** until DATA stamp |
| **change_mode** | **ADD** (align SA-01 gap-only RETAIN — **no** Nest `/core` dual · **no** wipe CORE-03 DOC/ET/CHK · **no** wipe CORE-02b EMP-CF · **no** full Asset accounting · **no** invent CORE-06/07 DONE · **no** claim LIVE CRUD alone = CORE-05 DONE · **no** reopen CORE-03/02b/09d..01) |
| **uc_ids** | `UC-BP-CORE-05` |
| **depends_on** | `PO-HRM-MVP-GD1-CORE-05-CLUSTER-SA-01` **Option A LOCKED** · peer QC **`CORE03QC1-MSLFJH0K`** / `CORE02BQC1-MSLEFQC1` / `CORE09DQC1-MSLDR8I3` / `CORE09CQC1-MSLBXMUT` / `CORE09BQC1-MSLB05DZ` / `CORE09AQC1-MSLA4LX9` / `CORE08QC1-MSL9BFFE` / `CORE02QC1-MSL80DU6` / `CORE01QC1-MSL6WMS7` · EMP DOC/ET **`EMPPLATQA-MSIZXHIM`** · TOK **`EMPTOKQA-MSJ290VB`** · **`R-CORE-03-CC-EMBED-OBS` P2 idle-ok RETAIN** |
| **ref_sa** | `PO-HRM-MVP-GD1-CORE-05-CLUSTER-SA-01.md` |
| **ref_ba_style** | `PO-HRM-MVP-GD1-CORE-03-CLUSTER-BA-01.md` · `PO-HRM-MVP-GD1-CORE-02B-CLUSTER-BA-01.md` |
| **ref_srs** | `docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md` **FR-UC-BP-CORE-05** · Luồng chính **#1–#4** · Diễn biến **#1–#2 + Thành công** · **BR-BP-AST-01** · đặc biệt serial trùng · peers CORE-03..01 **must_keep** · UC kế **CORE-06** (**depends_on** · ≠ invent DONE) · CORE-04 OCR **OUT** · CORE-07 activate = peer (**≠** this seat DONE) |
| **ref_api_paper** | **F-CORE-AST-01** (paper `/core/…/assets` · physical prefer `/employees/:id/assets*`) · residual **F-CORE-AST-BB-01** · **F-CORE-AST-02** peer CORE-06 **OUT invent DONE** · must_keep **F-CORE-CHK-01** · F-EMP-CAT-DOC/ET/EFF · F-EMP-TOK · F-EMP-CF · CTR TPL/VER/PDF/PACK/PREV/CL · CORE-08/02/01 |
| **ref_db** | LIVE `public.employee_assets` (ensureSchema) — physical alias of paper `hrm_asset_assignment` / `employee_asset_assignments` · paper `hrm_asset_handover` / `handover_doc_id` / confirm-sign metadata **ABSENT Nest AS-IS** · **DENY** invent full Asset ledger / kho / depreciation this seat |
| **ref_adr** | ADR **Q-ASSET-MODULE** GĐ1 assignment stub (mã/serial + BB + status) — **not** SoT kho/CCDC toàn tập đoàn |
| **Honesty** | `recruitment_uat_ready=false` · `jd_dynamic_done=false` · **`contracts_printable_ready=false`** · **`hrm_personnel_uat_ready=false`** · personnel / CORE / CTR module UAT **false** · **`C-SLICE-≠-MODULE`** · **DENY** claim CORE-03 = personnel UAT / EMP DOC L1 DONE · **DENY** claim CORE-07 DONE · **DENY** claim printable / closed-8 DONE · **DENY** invent CORE-06 DONE |
| **Cấm** | Nest `/core` dual · wipe CORE-03 DOC/ET/CHK · wipe CORE-02b EMP-CF · full Asset accounting · honesty flip · seed · apps/** · reopen sealed J-HRM-CORE-03-01..05 / 02B / 09D/09C/09B/09A/08/02/01 · claim LIVE CRUD alone = FR-05 DONE |

---

## 0. Process objective & actors

### Objective

Khóa **AC đo được** + **Diễn biến FE (U63/U65)** cho Wave-19 seat #21 — **gap-only RETAIN** trên LIVE assignment stub + disposition residual biên bản / serial:

1. **Assignment SoT** = LIVE `public.employee_assets` trên **`/api/hrm/employees/:id/assets*`** (GET/POST/PATCH/DELETE) — **RETAIN** cite F-CORE-AST-01 physical prefer · paper `/core/…` = alias only.
2. **Status map** = `assigned` ≈ **«Đang sử dụng»** · filter «đang giữ» = `status=assigned` · VI labels locked.
3. **Biên bản bàn giao** = residual **`R-CORE-05-HANDOVER-01` IN-SCOPE** — Nest handover table/route **ABSENT** (physical gap **PROVEN** vs paper §3.8 / `handover_doc_id`) → unlock **ba-data REQUIRED** then sa API **F-CORE-AST-BB-01**.
4. **Catalog / serial** = residual **`R-CORE-05-CAT-SERIAL-01`** — row-level stub **OK** (ADR §11) · master catalog **OUT invent** · serial trùng **chặn 409** default (wire residual · ba-data HOLD).
5. **Soft-delete** = prefer status transition / soft-archive over hard `DELETE` when history needed for CORE-06.
6. **Mint** `J-HRM-CORE-05-01..05` DRAFT · **DENY** reopen sealed CORE-03/02b/09d..01 · **DENY** invent CORE-06/07 DONE.

### Actors

| Actor | Trách nhiệm |
|-------|-------------|
| HCNS hồ sơ | Chọn NV → Thêm cấp phát → nhập mã/serial · ngày · ghi chú → Lưu → (khi residual live) xác nhận BB → xem danh sách đang giữ |
| Nhân viên / Quản lý tài sản | Xác nhận nhận (chữ ký/xác nhận nội bộ GĐ1 stub — **≠** full e-sign platform) |
| Group CEO | Scope rollup `main` — U19 assets list = get = mutate |
| Member CEO / HRBP | Chỉ pháp nhân membership · cùng profile scope resolver |
| Hệ thống | Status VI · serial duplicate gate · soft history · **không** Nest `/core` dual · **không** wipe CORE-03/02b |

### Scope

| In (this seat) | Out |
|----------------|-----|
| O1–O12 CONFIRM · map FR-05 Luồng #1–#4 + Diễn biến #1–#2 → AC-CORE-05-* · residual HANDOVER + CAT-SERIAL disposition · J-HRM-CORE-05-* DRAFT | Impl `apps/**` / migration / seed |
| Physical prefer `/employees/:id/assets*` · residual BB soft cols/table | Nest `/core/…/assets` SoT · full Asset kho/depreciation |
| CRUD attach + list đang giữ RETAIN + BB/serial residual AC | Claim LIVE CRUD alone = FR-05 / personnel UAT DONE |
| Honesty footer · C-SLICE · CORE-06 depends_on note | Flip ready flags · invent CORE-06/07 DONE · reopen J-CORE-03/02B/09D..01 |
| must_keep CORE-03 DOC/ET/CHK · CORE-02b EMP-CF · CORE-09d..01 | Claim CORE-03 = personnel · printable/closed-8 · CORE-07 DONE |

### SA Option A — BA CONFIRM (đóng O1–O12)

| # | Topic | BA CONFIRM (normative) |
|---|-------|-------------------------|
| **O1** | Physical path | **YES** — Profile **Tài sản** Network **chỉ** physical **`GET/POST/PATCH/DELETE /api/hrm/employees/:id/assets*`** · paper `/api/hrm/core/employees/{id}/assets` = **alias / DOC-DELTA only** — **FAIL** nếu Nest `@Controller('core')` second AST SoT |
| **O2** | Assignment SoT | **YES** — LIVE **`public.employee_assets`** = GĐ1 stub SoT (paper `hrm_asset_assignment` / `employee_asset_assignments` alias) — **DENY** second Nest table as primary · **DENY** full Asset ledger invent — **AC-CORE-05-01** |
| **O3** | Status map | **YES** — `assigned` ≈ **«Đang sử dụng»** · `returned` ≈ «Đã thu hồi» · `maintenance` ≈ «Bảo trì» · `lost` ≈ «Mất/ghi nợ» · filter **«đang giữ»** = `status=assigned` only — **BR-BP-AST-01** — **AC-CORE-05-02** |
| **O4** | Biên bản bàn giao | **YES IN-SCOPE residual `R-CORE-05-HANDOVER-01`** — structured issue BB (confirm/sign metadata) required for Diễn biến #2 / BR «BB hai bên» · prefer **ADD soft cols on `employee_assets`** (or light `hrm_asset_handover`) · **DENY** invent full e-sign platform DONE · **DENY** Nest `/core` dual · **DENY** claim row CRUD alone = BR-BP-AST-01 BB DONE — physical gap **PROVEN** → **ba-data REQUIRED** — **AC-CORE-05-04..06** |
| **O5** | Catalog / serial stub | **YES** — Row-level `category` + `asset_code` / `serial_number` **OK** as GĐ1 stub (ADR §11 · SRS tiên quyết «danh mục/serial tenant» **satisfied by stub**) · optional settings-catalog REF **OUT invent this seat** · **DENY** full Asset master/kho — **AC-CORE-05-CAT-OUT** · residual serial policy = **R-CORE-05-CAT-SERIAL-01** (serial only) |
| **O6** | Serial trùng | **YES** — Default GĐ1 = **chặn HTTP 409** when same non-empty `serial_number` already `status=assigned` in tenant/scope · CFG warn-only = **OUT invent** this seat (may reopen later) — map FR-05 đặc biệt — **AC-CORE-05-07** · ba-data **HOLD** (wire residual) |
| **O7** | Soft-delete | **YES** — Prefer **status transition** (`returned`/`lost`/`maintenance`) / soft-archive over hard `DELETE` when row was ever issued — LIVE `deleteProfileRow` = hard DELETE = **policy gap** · hard DELETE of issued history **FORBIDDEN** without BA waiver — **AC-CORE-05-08** · ba-data **HOLD** if status-only soft sufficient |
| **O8** | CORE-06 dependency | **YES OUT invent DONE** — Thu hồi SoT = **same** `employee_assets` rows · **F-CORE-AST-02** / board #22 remain **QUEUED** · **depends_on** CORE-05 SoT — **≠** this seat DONE — **AC-CORE-05-06-OUT** |
| **O9** | CORE-03 / CORE-07 | **YES** — must_keep DOC/ET/CHK physical (`CORE03QC1-MSLFJH0K` · `R-CORE-03-CC-EMBED-OBS` P2 idle-ok) · activate peer **OUT invent DONE** — **≠** this seat · **DENY** wipe / reopen J-HRM-CORE-03-01..05 — **AC-CORE-05-MK-03** |
| **O10** | Honesty / peers OUT | **YES false** — all ready flags false · C-SLICE · **DENY** flip personnel/printable/recruitment/jd · **DENY** claim CORE-03 = personnel UAT · **DENY** claim printable/closed-8 · **DENY** invent CORE-06/07 DONE · **must_keep** CORE-03..01 · Nest DENY — **AC-CORE-05-H** |
| **O11** | Display-ready | **YES** — Asset DTO: `asset_name` · `asset_code` · `serial_number` · `category` · `assigned_date` · `status` + **status_label_vi** · `condition` · `notes` · optional BB confirm flags (`handover_confirmed_at` / `handover_confirmed_by` when live) — FE bind Profile tab — **cấm** FE invent Asset SoT |
| **O12** | Journeys | **YES** — Mint **`J-HRM-CORE-05-01..05` DRAFT** (Profile assets → Thêm → serial/ngày → Lưu → list đang giữ F5 · BB confirm when O4 unlocked · serial duplicate 409 · Nest `/core` 0 · seals) · **DENY** reopen sealed J-HRM-CORE-03-01..05 / 02B / 09D/09C/09B/09A/08/02/01 |

**Architecture SoT:** ONE LIVE assignment spine · paper `/core` alias only · BB structured = residual unlock · U19 list↔get↔mutate · soft history for CORE-06 · CORE-03 DOC/ET/CHK + CORE-02b EMP-CF + CORE-09d..01 **must_keep**.

### Primary API surface (BA lock — O1)

| Intent | Physical (normative) | Paper alias |
|--------|----------------------|-------------|
| List / CRUD assets | **`GET/POST /api/hrm/employees/:id/assets`** · **`PATCH/DELETE …/assets/:assetId`** | `/core/employees/{id}/assets` alias only |
| BB confirm (residual) | Prefer **`PATCH …/assets/:assetId`** confirm flags **or** `…/assets/:id/handover` ADD if data proves | `/core/…` alias only — **DENY** Nest `/core` primary |
| Thu hồi | **F-CORE-AST-02** peer CORE-06 | **OUT invent DONE** |
| CORE-03 CHK/DOC/ET | **must_keep** document-checklist* · document-types* · employment-types* | alias |
| CORE-02b EMP-CF | **must_keep** settings-catalogs + custom_fields | alias |
| CORE-09d..09a / 08 / 02 / 01 | **must_keep** contracts-insurance* · rewards · packages · public employees | alias — 09c **≠** printable UAT |

**Invariant CORE-05-PATH:** Profile Tài sản Network **MUST** hit `/employees/:id/assets*` · Nest dual `/core` AST SoT = **FAIL O1**.

**Invariant CORE-05-≠-CRUD-DONE:** Claim LIVE CRUD alone = FR-05 / BR-BP-AST-01 BB DONE without O4 disposition = **FAIL O4**.

**Invariant CORE-05-≠-03-PERSONNEL:** Claim CORE-03 checklist / EMP DOC L1 = personnel UAT = **FAIL O10**.

**Invariant CORE-05-≠-06-DONE:** Invent CORE-06 / F-CORE-AST-02 DONE this seat = **FAIL O8**.

**Invariant CORE-05-≠-PRINTABLE:** Claim printable / closed-8 / CORE-07 DONE = **FAIL O10**.

**Wire codes (RETAIN / residual — no invent rewrite sealed):** `HRM-EMP-PROFILE-200/201/202` · `HRM-EMP-PROFILE-404/409` · residual serial **`HRM-EMP-ASSET-SERIAL-CONFLICT`** (or documented 409 synonym) · `HRM-SCOPE-409` · sealed CORE-* · **DENY** 2xx when serial already `assigned`.

---

## 1. As-is vs to-be

| | AS-IS (LIVE + seals) | TO-BE (Wave-19 · Option A) |
|---|----------------------|---------------------------|
| Assignment CRUD | `employee_assets` · `/employees/:id/assets*` | **RETAIN** (**O1/O2**) |
| List hồ sơ | FE `EmployeeAssets` tab | **RETAIN** (**O3/O11**) |
| Status | default `assigned` · FE also returned/maintenance/lost | **RETAIN map** VI «Đang sử dụng» (**O3**) |
| Mã / serial cols | `asset_code` · `serial_number` | **RETAIN** (**O5**) |
| Paper `/core` | Nest `@Controller('core')` **ABSENT** | alias only (**O1**) |
| Biên bản structured | Table/route **ABSENT** · `notes` free-text | Residual unlock (**O4**) |
| Catalog master | FE category enum on row | **RETAIN stub** · master **OUT** (**O5**) |
| Serial trùng gate | Not proven | **409 chặn** residual (**O6**) |
| Soft-delete | Hard `DELETE` via `deleteProfileRow` | Prefer status soft (**O7**) |
| CORE-06 thu hồi | Not this seat | **OUT invent DONE** · depends_on (**O8**) |
| CORE-03 DOC/ET/CHK | SEALED `CORE03QC1-MSLFJH0K` | **must_keep RETAIN** (**O9**) · OBS P2 idle-ok |
| CORE-02b / 09d..01 | SEALED stamps | **must_keep · DENY reopen** (**O10**) |
| Nest `/core` | CoreModule = DB only | **DENY** dual (**O1**) |
| Honesty | C-SLICE · personnel/printable false | **false** (**O10**) |

### 1.1 Disposition **R-CORE-05-HANDOVER-01**

| Field | BA ruling |
|-------|-----------|
| **ID** | `R-CORE-05-HANDOVER-01` |
| **Scope** | **IN-SCOPE residual** for UC-BP-CORE-05 Diễn biến **#2** (xác nhận nhận) + Luồng chính **#3** (lưu BB) + BR-BP-AST-01 BB · Thành công «vết cấp phát» includes BB confirm when residual live |
| **OUT of residual** | Assignment CRUD attach + list đang giữ + mã/serial fields — already **RETAIN LIVE** · full e-sign / PKI platform · Nest `/core` dual · CORE-06 return checklist · full Asset accounting |
| **Rationale IN-SCOPE** | SRS: «Biên bản (ký nội bộ) = Có» · Diễn biến #1 «Bản ghi + BB» · #2 «Có chữ ký/xác nhận» → «Tài sản đang giữ» · paper F-CORE-AST-01 `handover_doc_id` · SA O4; LIVE Nest **no** `hrm_asset_handover` / confirm cols — `notes` free-text **≠** BR |
| **Physical gap vs paper** | **PROVEN** — paper handover entity / `handover_doc_id` / sign metadata **not** present on LIVE `employee_assets` ensureSchema (cols: code/name/category/serial/dates/status/condition/notes/brand/model/spec/value only) |
| **ba-data** | **REQUIRED** (unlock) — prefer **ADD soft cols** on `employee_assets` (`handover_confirmed_at` · `handover_confirmed_by` · optional `handover_receiver_name`) **or** light `hrm_asset_handover` (issue type) · soft-delete doctrine · **DENY** Nest `/core` table dual · **DENY** invent full e-sign platform · assignment CRUD cols **HOLD** (already LIVE) |
| **sa API** | After DATA: **F-CORE-AST-BB-01** prefer PATCH confirm on assignment (+ optional `/handover`) · gate «Đang sử dụng» list may require confirm when CFG on (default **on** after residual live) — **not** wire-only this seat (confirm cols ABSENT ⇒ not wire-only) |
| **DENY** | Claim LIVE CRUD = R-CORE-05-HANDOVER-01 CLOSED · claim notes free-text = BB DONE · seed density for UF |

### 1.2 Disposition **R-CORE-05-CAT-SERIAL-01**

| Field | BA ruling |
|-------|-----------|
| **ID** | `R-CORE-05-CAT-SERIAL-01` |
| **Catalog slice** | **OUT invent** master Asset catalog / kho SKU pool — row-level stub **OK** (ADR §11 · O5) · SRS tiên quyết satisfied by stub |
| **Serial slice** | **IN-SCOPE residual (wire)** — duplicate `serial_number` while another row `status=assigned` in scope → **409** default |
| **ba-data** | **HOLD** — no schema invent for uniqueness (service/index optional later if API proves need; default HOLD) |
| **sa API** | After/with BB API: enforce serial conflict on POST/PATCH — **wire residual** |
| **DENY** | Full Asset master invent · claim catalog master required for GĐ1 stub PASS |

### 1.3 ba-data disposition summary

| Slice | Decision | Rule |
|-------|----------|------|
| Assignment CRUD cols | **HOLD** | LIVE `employee_assets` RETAIN — **no** greenfield wipe |
| Handover confirm (§3.8 / handover_doc_id) | **REQUIRED** | Gap **PROVEN** — ADD soft cols (prefer) or light handover table |
| Asset master catalog | **HOLD / OUT invent** | Stub OK · DENY full kho |
| Serial uniqueness index | **HOLD** | Wire 409 first · index optional later |
| Soft-archive `archived_at` | **HOLD** | Prefer status soft; ADD archived_at only if status-only insufficient |
| Nest `/core` | **DENY** | alias only |
| CORE-03 / EMP-CF tables | **DENY wipe** | must_keep |

---

## 2. Business rules (normative — SRS + SA + ADR; không invent)

| ID | Condition | Action | Outcome |
|----|-----------|--------|---------|
| **BR-BP-AST-01** | Cấp phát GĐ1 | Attach NV + mã/serial + BB confirm + status «Đang sử dụng» | List đang giữ trên hồ sơ; MVP ≠ full kế toán |
| **BR-CORE-05-PATH** | API | Physical `/employees/:id/assets*` | Nest `/core` dual = **FAIL O1** |
| **BR-CORE-05-STATUS** | «Đang giữ» | Filter `status=assigned` | Other statuses not in «đang giữ» |
| **BR-CORE-05-BB** | After residual live | Issue without confirm | **Cannot** claim BR BB DONE; list «Đang sử dụng» may require confirm (default on) |
| **BR-CORE-05-SERIAL** | Non-empty serial already `assigned` in scope | POST/PATCH | **409** conflict · F5 không giữ trùng |
| **BR-CORE-05-SOFT** | Issued history | Prefer status ≠ hard DELETE | Hard DELETE issued without waiver = **FAIL O7** |
| **BR-CORE-05-NO-SEED** | Nghiệm thu | FE only | Seed = **FAIL U65** |
| **BR-CORE-05-≠-DONE** | LIVE CRUD alone | ≠ FR-05 / personnel UAT | Claim DONE = **FAIL O4/O10** |
| **BR-CORE-05-06-DEP** | CORE-06 | Same SoT rows | Invent CORE-06 DONE = **FAIL O8** |
| **BR-CORE-05-STUB** | ADR Q-ASSET | Stub only | Full Asset invent = **FAIL O5** |

### Error taxonomy (RETAIN + residual)

| Code | HTTP | UX intent (VI) | ≠ |
|------|------|----------------|--|
| `HRM-EMP-PROFILE-201/202` | 2xx | Lưu/cập nhật cấp phát | BB confirm residual |
| `HRM-EMP-PROFILE-404` | 404 | Không thấy dòng | Scope |
| `HRM-EMP-PROFILE-409` / residual **`HRM-EMP-ASSET-SERIAL-CONFLICT`** | 409 | Serial đang cấp cho NV khác/cùng scope | Empty serial allow |
| `HRM-SCOPE-409` | 409 | Ngoài phạm vi pháp nhân | Serial conflict |
| Sealed CORE-* | — | **DENY** rewrite · must_keep regression | — |

---

## 3. Diễn biến FR-UC-BP-CORE-05 + BR-BP-AST-01 → AC / VAL map (normative)

### 3.0 Map overview

| SRS source | Tương tác | AC cite | J-* | LIVE Network (cite) |
|------------|-----------|---------|-----|---------------------|
| **Luồng #1** · Diễn biến #1 | Chọn NV → thêm cấp phát · serial hợp lệ | **AC-CORE-05-01** | **J-HRM-CORE-05-01** | `POST /api/hrm/employees/:id/assets` **201** |
| **Luồng #2** | Nhập mã/serial · ngày · ghi chú | **AC-CORE-05-01** · O11 | **J-01** | same POST body |
| **Luồng #3** · Diễn biến #2 | Lưu / xác nhận BB | **AC-CORE-05-04/05** (residual) | **J-HRM-CORE-05-02** | Prefer `PATCH …/assets/:assetId` confirm (**ABSENT AS-IS**) |
| **Luồng #4** | Danh sách đang giữ trên hồ sơ | **AC-CORE-05-02/03** | **J-HRM-CORE-05-01** | `GET …/assets` → filter `assigned` · **F5** |
| **Đặc biệt** serial trùng | Chặn | **AC-CORE-05-07** | **J-HRM-CORE-05-03** | POST/PATCH → **409** |
| Soft vs hard delete | History CORE-06 | **AC-CORE-05-08** | **J-04** spot | Prefer PATCH status · **DENY** silent hard DELETE issued |
| **Thành công** | Vết cấp phát · UC kế thu hồi | **AC-CORE-05-06-OUT** | seal spot | CORE-06 **OUT invent DONE** |
| Catalog master | SRS tiên quyết | **AC-CORE-05-CAT-OUT** | — | Row stub OK · **no** master invent |
| Honesty / seals | Footer | **AC-CORE-05-H** · **MK-*** | **J-HRM-CORE-05-05** | Nest `/core` **0** |

### 3.1 AC-CORE-05 (normative)

| AC-ID | Given | When | Then (measurable) | Evidence |
|-------|-------|------|-------------------|----------|
| **AC-CORE-05-01** | Hồ sơ NV trong scope · tab Tài sản | Thêm cấp phát (name · code/serial · ngày · category stub) → Lưu | Network **POST** `/api/hrm/employees/:id/assets` **2xx** (`HRM-EMP-PROFILE-201`) → row trên list · **F5 còn** · Nest `/core` **0** · **no** Nest dual | U65 · O1/O2 · Luồng #1–#2 |
| **AC-CORE-05-02** | Có ≥1 row `assigned` | Mở tab / F5 «đang giữ» | Chỉ rows `status=assigned` · label VI **«Đang sử dụng»** · display-ready O11 | O3 · BR-BP-AST-01 · Luồng #4 |
| **AC-CORE-05-03** | Row `returned`/`lost`/`maintenance` | View đang giữ | **Không** nằm filter đang giữ · vẫn xem được lịch sử/tab nếu UI có | O3 · O7 |
| **AC-CORE-05-04** | Residual unlocked · vừa POST | Xác nhận nhận / Lưu BB | Prefer Network **PATCH** confirm flags **2xx** · `handover_confirmed_at` set · FE cập nhật · **F5 còn** · Nest `/core` **0** | O4 · Diễn biến #2 · **BLOCKED until DATA+API** |
| **AC-CORE-05-05** | Residual unlocked · CFG confirm required (default on) | Claim «Đang sử dụng» / list đang giữ without confirm | **FAIL** AC unless confirmed — empty CTA nếu chưa có BB (no seed) | O4 · BR-BP-AST-01 · **BLOCKED until DATA+API** |
| **AC-CORE-05-06** | Residual unlocked | notes-only free-text without confirm path | **≠** BR BB DONE — QA **FAIL** if claimed PASS | O4 |
| **AC-CORE-05-06-OUT** | Thành công FR-05 | UC kế thu hồi | **Cite** peer CORE-06 / F-CORE-AST-02 — **≠** PASS this WI as CORE-06 DONE · same SoT `employee_assets` | O8 |
| **AC-CORE-05-07** | Serial S đã `assigned` trong scope | POST/PATCH cùng S non-empty | **409** · F5 **không** tạo/đổi thành trùng assigned · empty serial allowed | O6 · FR đặc biệt |
| **AC-CORE-05-08** | Row đã issued (`assigned` ever) | Xóa / thu hồi | Prefer PATCH `returned`/`lost` · hard DELETE issued = **FAIL** without waiver | O7 · CORE-06 history |
| **AC-CORE-05-CAT-OUT** | GĐ1 stub | Admin yêu cầu master kho | **OUT** — row category/code stub đủ · DENY full Asset SoT | O5 · ADR |
| **AC-CORE-05-MK-03** | Any CORE-05 evidence | Diff CORE-03 DOC/ET/CHK | Physical checklist + DOC/ET + TOK **intact** · **no** reopen J-HRM-CORE-03-01..05 · `R-CORE-03-CC-EMBED-OBS` P2 idle-ok · **≠** personnel UAT | O9 · `CORE03QC1-MSLFJH0K` |
| **AC-CORE-05-MK-02B** | Any CORE-05 evidence | Diff EMP-CF | Four catalogs + KEY + soft-draft + EXT **intact** · **no** reopen J-HRM-CORE-02B | O10 · `CORE02BQC1-MSLEFQC1` |
| **AC-CORE-05-MK-09D..01** | Any CORE-05 evidence | Diff CTR/RD/C&B/public | TPL+clause · VER/PDF ≠ printable · PREV ephemeral · CL · RD · AuthZ/CB · public **intact** · **no** reopen sealed J-* | O10 · peer stamps |
| **AC-CORE-05-H** | Evidence footer | Any seal | personnel/printable/recruitment/jd **false** · C-SLICE · **DENY** CORE-03=personnel · **DENY** CORE-07/printable/closed-8/CORE-06 DONE · Nest DENY · no reopen J-03/02B/09D..01 | O10 |

### 3.2 Scope ladder (U19)

| Persona | User sees | Fail |
|---------|-----------|------|
| **Group CEO** (`main`) + HCNS | Create assets across rollup | Cross-CT mutate without membership |
| **Member CEO / HRBP** | Chỉ pháp nhân membership | Assets list ≠ mutate resolver |
| **No HR mutate** | Deny POST/PATCH assets | Silent 2xx |

**Invariant CORE-05-SCOPE:** assets list/get/mutate **=** same profile scope resolver family.

**Prerequisite:** CORE-03 DOC/ET/CHK seals RETAIN · CORE-02b EMP-CF RETAIN · CORE-09d..01 stamps RETAIN · **không** seed · honesty flags false.

---

## 4. Diễn biến FE U65 (browser matrix)

```text
Login (ceo@xe.vn / member HCNS)
  → /hr Nhân sự → mở hồ sơ NV → tab Tài sản
  → Thêm cấp phát (tên · mã/serial · ngày · loại stub · ghi chú) → Lưu
  → Network POST /api/hrm/employees/:id/assets 2xx → F5 còn trên «đang giữ»
  → (khi residual live) Xác nhận BB / nhận → PATCH confirm 2xx → F5
  → Thử serial trùng đang cấp → 409 · F5 không giữ trùng
  → Prefer thu hồi = đổi status returned (không hard-delete issued)
  → Nest /core assets = 0
  → Footer honesty false · no claim CRUD=CORE-05 DONE · no claim CORE-03=personnel
       · no invent CORE-06/07 DONE · no printable/closed-8
```

**cấm:** `pnpm seed:*` · API seed assets · DB fake BB · PASS chỉ curl · Nest `/core` dual · wipe CORE-03/02b · full Asset invent · claim module DONE · reopen sealed J-*.

### VAL pack (mint)

| VAL-ID | Expect | Maps |
|--------|--------|------|
| **VAL-CORE-AST-01** | POST assets 2xx + F5 đang giữ | AC-CORE-05-01/02 |
| **VAL-CORE-AST-02** | Status VI map + filter assigned | AC-CORE-05-02/03 |
| **VAL-CORE-AST-03** | BB confirm PATCH 2xx + F5 | AC-CORE-05-04/05 · **HOLD until API** |
| **VAL-CORE-AST-04** | Serial duplicate 409 | AC-CORE-05-07 |
| **VAL-CORE-AST-05** | Soft status · Nest `/core` 0 · seals | AC-CORE-05-08/H/MK-* |

---

## 5. Journeys DRAFT (O12)

| J-ID | Title | Click path (draft) | Pass when |
|------|-------|--------------------|-----------|
| **J-HRM-CORE-05-01** | **Thêm cấp phát + list đang giữ F5** | Login → Hồ sơ → Tài sản → Thêm → POST assets 2xx → F5 «Đang sử dụng» · Nest `/core` 0 | AC-CORE-05-01/02 · O1/O2/O3 · U65 |
| **J-HRM-CORE-05-02** | **BB confirm (when residual live)** | After create → Xác nhận nhận/BB → PATCH confirm 2xx → F5 flags · Nest `/core` 0 | AC-CORE-05-04/05 · Diễn biến #2 · O4 · **DRAFT until DATA+API** |
| **J-HRM-CORE-05-03** | **Serial trùng 409** | POST/PATCH serial already assigned → **409** → F5 không giữ trùng | AC-CORE-05-07 · O6 · U65 · **may wait API wire** |
| **J-HRM-CORE-05-04** | **Soft status · no hard-delete issued** | Đổi `returned`/`lost` · assert no silent hard DELETE of issued history | AC-CORE-05-08 · O7 · U65 |
| **J-HRM-CORE-05-05** | **Seals · honesty · CORE-06 OUT** | Nest `/core` 0 · CORE-03/02b/09d..01 smoke · no CORE-03=personnel · no CORE-06/07/printable/closed-8 DONE · `R-CORE-03-CC-EMBED-OBS` idle-ok | AC-CORE-05-MK-*/H/06-OUT · O8–O10 · U19 |

**Promotion:** Journeys remain **DRAFT** until QA U65 browser evidence · QC GWC C-SLICE only · **≠** auto-flip `hrm_personnel_uat_ready`.

| Sealed peer | Rule |
|-------------|------|
| **J-HRM-CORE-03-01..05** / `CORE03QC1-MSLFJH0K` | must_keep DOC/ET/CHK · **≠** personnel UAT · **`R-CORE-03-CC-EMBED-OBS` P2 idle-ok** |
| **EMPPLATQA-MSIZXHIM** / **EMPTOKQA-MSJ290VB** | must_keep RETAIN |
| **J-HRM-CORE-02B-01..04** / `CORE02BQC1-MSLEFQC1` | must_keep · **DENY** wipe EMP-CF |
| **J-HRM-CORE-09D-01..04** / `CORE09DQC1-MSLDR8I3` | must_keep · **≠** printable / closed-8 DONE |
| **J-HRM-CORE-09C-01..04** / `CORE09CQC1-MSLBXMUT` | must_keep · VER/PDF **≠** printable |
| **J-HRM-CORE-09B-01..04** / `CORE09BQC1-MSLB05DZ` | must_keep · PREV ephemeral |
| **J-HRM-CORE-09A-01..04** / `CORE09AQC1-MSLA4LX9` | must_keep |
| **J-HRM-CORE-08-01..04** / `CORE08QC1-MSL9BFFE` | must_keep |
| **J-HRM-CORE-02-01..04** / `CORE02QC1-MSL80DU6` | must_keep · AuthZ/CB-403 |
| **J-HRM-CORE-01-01..04** / `CORE01QC1-MSL6WMS7` | must_keep · public strip |

---

## 6. Honesty & must_keep

| Item | Rule |
|------|------|
| `recruitment_uat_ready` | **false** |
| `jd_dynamic_done` | **false** |
| `contracts_printable_ready` | **false** · **DENY** flip |
| `hrm_personnel_uat_ready` | **false** · **DENY** flip |
| Claim LIVE CRUD alone = CORE-05 / FR-05 DONE | **DENIED** (O4) |
| Claim CORE-03 = personnel UAT / EMP DOC L1 DONE | **DENIED** |
| Claim CORE-07 activate DONE | **DENIED** |
| Claim CORE-06 / F-CORE-AST-02 DONE | **DENIED** |
| Claim printable / closed-8 DONE | **DENIED** |
| Nest `/core` dual · full Asset accounting · wipe CORE-03/02b | **DENIED** |
| C-SLICE | GWC later ≠ module CORE/personnel/CTR UAT ≠ Phase1 |
| must_keep W18 | CORE-03 DOC/ET/CHK · `CORE03QC1-MSLFJH0K` · OBS P2 idle-ok |
| must_keep W17..W10 | CORE-02b EMP-CF · CORE-09d TPL+clause · 09c VER/PDF · 09b PREV ephemeral · 09a CL · 08 · 02 · 01 stamps |
| DENY | honesty flip · seed · apps/** · reopen sealed J-HRM-CORE-03-01..05 / 02B / 09D/09C/09B/09A/08/02/01 |

---

## 7. Handoff

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** · O1–O12 **CONFIRMED** |
| **next_owner** | **ba-data** — **REQUIRED** for handover soft cols/table (gap **PROVEN**) · assignment CRUD **HOLD** · catalog master **HOLD/OUT** · serial uniqueness **HOLD** (wire) · then sa API **F-CORE-AST-01 RETAIN cite** + **F-CORE-AST-BB-01** + serial 409 |
| **ba-data** | **REQUIRED** (handover) · **HOLD** (assignment LIVE · catalog master · serial index) |
| **sa API-01** | **HOLD** until DATA stamp — residual BB + serial conflict · RETAIN cite F-CORE-AST-01 physical |
| **Dev** | **HOLD** until DATA + API CONFIRMED · **DENY** Nest `/core` dual · **DENY** wipe CORE-03/02b · **DENY** full Asset invent · **DENY** invent CORE-06 |
| **evidence_path** | `docs/program/specs/PO-HRM-MVP-GD1-CORE-05-CLUSTER-BA-01.md` |
| **qa_evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-core-05-cluster-ba-01.md` |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-CORE-05-CLUSTER-DATA-01
lane: governance · ba-data
program: PO-HRM-MVP-GD1-CONTINUOUS (U89)
uc_ids: UC-BP-CORE-05
depends_on: BA-01 O1–O12 CONFIRMED · docs/program/specs/PO-HRM-MVP-GD1-CORE-05-CLUSTER-BA-01.md · SA Option A · R-CORE-05-HANDOVER-01 IN-SCOPE · physical gap PROVEN (Nest handover ABSENT · no confirm cols on employee_assets) · R-CORE-05-CAT-SERIAL-01 catalog OUT / serial wire HOLD · CORE03QC1-MSLFJH0K · CORE02BQC1-MSLEFQC1 · peer CORE09DQC1-MSLDR8I3..CORE01QC1-MSL6WMS7 · EMPPLATQA-MSIZXHIM · EMPTOKQA-MSJ290VB · R-CORE-03-CC-EMBED-OBS P2 idle-ok must_keep
spec_ref: paper F-CORE-AST-01 handover_doc_id · hrm_asset_handover / employee_asset_assignments alias · LIVE public.employee_assets RETAIN · ADR Q-ASSET-MODULE GĐ1 stub · Nest /core DENY · CORE-06 F-CORE-AST-02 OUT invent DONE

MISSION — Physical DATA lock (docs-only · REQUIRED for handover):
1) CONFIRM ADD soft cols on public.employee_assets (prefer) — handover_confirmed_at · handover_confirmed_by · optional handover_receiver_name — OR light hrm_asset_handover (issue) mapped to assignment_id; soft-delete doctrine; DENY Nest /core table dual; DENY full e-sign / Asset ledger invent
2) HOLD — no invent/change on LIVE assignment CRUD spine cols already present (asset_code · serial_number · status · notes · …)
3) HOLD/OUT — tenant Asset master catalog / kho SKU (row stub OK ADR §11); HOLD serial unique index (wire 409 first)
4) Cite display-ready confirm flags for Profile Tài sản list + «Đang sử dụng» gate
5) RETAIN CORE-03 DOC/ET/CHK · CORE-02b EMP-CF · CORE-09d TPL+clause · CORE-09c VER/PDF ≠ printable · CORE-09b PREV ephemeral · CORE-09a CL · CORE-08 · CORE-02 · CORE-01 · Nest /core DENY · R-CORE-03-CC-EMBED-OBS P2 idle-ok
6) DENY wipe CORE-03/02b · invent CORE-06/07 DONE · claim CORE-03 = personnel UAT · claim printable/closed-8 DONE · honesty flip · reopen J-HRM-CORE-03-01..05 / 02B / 09D/09C/09B/09A/08/02/01 · seed · apps/**
7) Unlock next: sa API-01 RETAIN cite F-CORE-AST-01 physical /employees/:id/assets* + residual F-CORE-AST-BB-01 confirm + serial 409 — paper /core alias only — CORE-06 remains QUEUED depends_on

exit: docs/program/specs/PO-HRM-MVP-GD1-CORE-05-CLUSTER-DATA-01.md · PASS_TO_PM · next sa API residual BB+serial
```

---

## 8. Completion contract

| Field | Value |
|-------|--------|
| **completion_report** | O1–O12 **CONFIRMED** for UC-BP-CORE-05 against SA Option A: physical prefer `/employees/:id/assets*` · `employee_assets` GĐ1 stub SoT · status `assigned`≈«Đang sử dụng» · **R-CORE-05-HANDOVER-01 IN-SCOPE** (Nest handover ABSENT — physical gap **PROVEN**) · catalog master **OUT** stub OK · serial trùng **409** default · soft status over hard DELETE · CORE-06 **OUT invent DONE** (depends_on SoT) · CORE-03 DOC/ET/CHK **must_keep** (`CORE03QC1-MSLFJH0K` · OBS P2 idle-ok) · CORE-02b EMP-CF · CORE-09d..01 **must_keep** · honesty false · display-ready O11 · mint **J-HRM-CORE-05-01..05 DRAFT** · Diễn biến/Luồng FR-05 + BR-BP-AST-01 mapped to **AC-CORE-05-*** · Nest `/core` **DENIED** · full Asset **DENIED** · **ba-data REQUIRED** (handover) · catalog/serial schema **HOLD** · DENY wipe CORE-03/02b · claim CRUD=CORE-05 DONE · claim CORE-03=personnel · invent CORE-06/07/printable/closed-8 · reopen sealed J-* · seed · apps/** · C-SLICE. |
| **next_owner** | **ba-data** (REQUIRED handover · HOLD assignment/catalog/serial-index) |
| **ack_status** | **PASS_TO_PM** |
| **residual** | DATA-01 ADD confirm cols/table · API F-CORE-AST-BB-01 + serial 409 · J-05-02/03 DRAFT until live · CORE-06 peer · personnel/printable flags HOLD · `R-CORE-03-CC-EMBED-OBS` P2 idle-ok |

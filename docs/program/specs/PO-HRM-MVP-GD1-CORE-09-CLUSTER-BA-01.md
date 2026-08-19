# BA AC pack — Wave-22 CORE cluster · UC-BP-CORE-09 (Hợp đồng LĐ — mẫu điền sẵn / sổ đăng ký · RETAIN fill+registry · 09a–d ADD ≠ DONE)

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-CORE-09-CLUSTER-BA-01` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89 — single GD continuous · Wave-22 seat **#24**) |
| **lane** | governance · ba-process |
| **Date** | 2026-08-09 |
| **Status** | **CONFIRMED against SA Option A LOCKED** · O1–O12 **CONFIRMED** · Dev **HOLD** · **ba-data HOLD default** (LIVE `employee_contracts` · `keyword_map` · `hrm_merge_tokens` · peer VER/TPL/CL RETAIN — **no** schema invent) · sa API residual unlock **only if** BA proves closable wire gap · **DENY** claim 09a–d ADD = CORE-09 DONE · **DENY** claim registry CRUD alone = CORE-09 DONE · **DENY** Word/DOCX primary · **printable false RETAIN** |
| **change_mode** | **ADD** (align SA-01 gap-only RETAIN — **no** Nest `/core` dual · **no** wipe CORE-07 activate/GATE 409/ACT-400 · **no** wipe CORE-06 soft≠DONE · **no** wipe CORE-05/03/02b · **no** wipe CORE-09d..09a ADD · **no** invent Word/DOCX primary · **no** invent PAY/ATT DONE · **no** invent printable DONE · **no** claim CORE-07 DONE · **no** claim checklist/free PATCH = CORE-07 DONE · **no** claim soft = CORE-06 DONE) |
| **uc_ids** | `UC-BP-CORE-09` |
| **depends_on** | `PO-HRM-MVP-GD1-CORE-09-CLUSTER-SA-01` **Option A LOCKED** · peer QC **`CORE07QC1-KZJTSHNT`** · QA **`CORE07QA1-MSLJSPGO`** · soft≠DONE **`CORE06QC1-MSLID363`** · **`CORE05QC1-MSLGVT40`** · **`CORE03QC1-MSLFJH0K`** · **`CORE02BQC1-MSLEFQC1`** · **`CORE09DQC1-MSLDR8I3`** · `CORE09CQC1-MSLBXMUT` · `CORE09BQC1-MSLB05DZ` · `CORE09AQC1-MSLA4LX9` · `CORE08QC1-MSL9BFFE` · `CORE02QC1-MSL80DU6` · `CORE01QC1-MSL6WMS7` · **`R-CORE-07-FE-EMPLOYEE-RECORD` P2 idle-ok** · **`R-CORE-07-HONESTY` INFO RETAIN** · checklist≠CORE-07 DONE · free PATCH≠DONE · soft≠CORE-06 DONE · printable **false** · **≠** claim CORE-07 DONE |
| **ref_sa** | `PO-HRM-MVP-GD1-CORE-09-CLUSTER-SA-01.md` |
| **ref_ba_style** | `PO-HRM-MVP-GD1-CORE-07-CLUSTER-BA-01.md` · `PO-HRM-MVP-GD1-CORE-09D-CLUSTER-BA-01.md` · `PO-HRM-MVP-GD1-CORE-09B-CLUSTER-BA-01.md` |
| **ref_srs** | `docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md` **FR-UC-BP-CORE-09** · Mục đích · Luồng chính **#1–#5** · Diễn biến **#1–#4 + Thành công** · **AC-CTR-TPL-01..05** · **BR-BP-CTR-01** · **AC-CTR-XEVN-08** / **AC-PLT-CTR-TPL-06** (registry without template) · peers **FR-UC-BP-CORE-09a · 09b · 09c · 09d** = ADD expand **must_keep ≠** replace FR-09 role · SRS 09a: **không** dùng tệp DOCX làm nguồn nội dung GĐ1 · **FR-UC-BP-PLT-01** merge-token principles |
| **ref_api_paper** | **F-CORE-CTR-01** (registry must_keep) · **F-CORE-CTR-PREV-01** (merge keyword) · **F-CORE-CTR-VER/PDF/TPL/CL/PACK** peers · **F-PLT-TOK / F-EMP-TOK** · must_keep **F-CORE-ACT-01** (CORE-07) · Nest `@Controller('core')` **ABSENT** |
| **ref_db** | LIVE `public.employee_contracts` · `public.hrm_contract_templates.keyword_map` · `public.hrm_merge_tokens` · `hrm_contract_print_versions` · `hrm_contract_clauses` · Nest `@Controller('core')` **ABSENT** · **DENY** invent Nest `/core` dual · **DENY** invent Word/DOCX binary SoT |
| **ref_adr** | ADR Catalog+FormSchema+MergeToken · Nest physical prefer · paper `/core` alias only · U19 scope parity · **REJECT** DOCX-primary GĐ1 |
| **Honesty** | `recruitment_uat_ready=false` · `jd_dynamic_done=false` · **`contracts_printable_ready=false` RETAIN** · **`hrm_personnel_uat_ready=false`** · personnel / CORE / CTR module UAT **false** · **`C-SLICE-≠-MODULE`** · **DENY** claim 09a–d ADD = CORE-09 EXPAND module DONE · **DENY** claim registry CRUD alone = CORE-09 DONE · **DENY** claim CORE-07 DONE · **DENY** claim checklist/free PATCH = CORE-07 DONE · **DENY** claim soft = CORE-06 DONE · **DENY** invent PAY/ATT/printable DONE · **DENY** claim printable/closed-8 DONE |
| **Cấm** | Nest `/core` dual · Word/DOCX primary invent · wipe CORE-07 activate/GATE/ACT-400 · wipe CORE-06 soft≠DONE · wipe CORE-05/03/02b · wipe CORE-09d..09a · invent PAY/ATT DONE · invent printable DONE · claim 09a–d = CORE-09 DONE · claim registry = CORE-09 DONE · claim CORE-07 DONE · honesty flip · seed · apps/** · reopen sealed J-HRM-CORE-07-01..05 / 06 / 05 / 03 / 02B / 09D..01 |

---

## 0. Process objective & actors

### Objective

Khóa **AC đo được** + **Diễn biến FE (U63/U65)** cho Wave-22 seat #24 — **gap-only RETAIN** LIVE registry + `{{token}}` keyword fill:

1. **Registry SoT** = LIVE `public.employee_contracts` trên **`/api/hrm/contracts-insurance/contracts*`** (UF-HRM-02) — **RETAIN must_keep** · create/edit/F5 **without** bắt buộc mẫu in (**AC-CTR-XEVN-08**) · **≠ CORE-09 DONE** alone.
2. **Keyword fill SoT** = `keyword_map` + `hrm_merge_tokens` + **F-CORE-CTR-PREV-01** `POST …/contracts/:id/preview` — `{{token}}` / `{{tên_trường}}` **ONLY** · **DENY** Word/DOCX primary GĐ1 · **DENY** dual merge syntax.
3. **Zero template** = residual **`R-CORE-09-ZERO-TPL`** — 0 mẫu hiệu lực → CTA cấu hình · **DENY** lưu phiên bản giả (**AC-CTR-TPL-01**).
4. **Fill preview** = residual **`R-CORE-09-FILL-01`** — có mẫu → PREV điền hồ sơ + C&B đủ quyền · **DENY** empty form bắt nhập lại toàn bộ (**AC-CTR-TPL-02**).
5. **Mandatory block** = residual **`R-CORE-09-MANDATORY`** — thiếu field bắt buộc → chặn + liệt kê · **DENY** silent save (**AC-CTR-TPL-03**).
6. **C&B mask** = **AC-CTR-TPL-04** · must_keep CORE-02 AuthZ/CB-403 · **DENY** invent C&B engine DONE.
7. **Save VER + F5** = **AC-CTR-TPL-05** · peer 09c **must_keep** · **≠** printable UAT · **printable false RETAIN**.
8. **Peer ADD lock** = residual **`R-CORE-09-ADD-≠-DONE`** — footer **09a–d ADD ≠ CORE-09 DONE** on every evidence.
9. **Mint** `J-HRM-CORE-09-01..06` DRAFT · **DENY** reopen sealed J-HRM-CORE-07/06/05/03/02B/09D..01 · **must_keep** CORE-07 GATE 409 · ACT-400 · Nest DENY · checklist≠DONE · free PATCH≠DONE · soft≠CORE-06 DONE.

### Actors

| Actor | Trách nhiệm |
|-------|-------------|
| HCNS | Mở sổ HĐ · chọn mẫu · xem trước điền sẵn · lưu phiên bản khi đủ · F5 |
| C&B | Consume PREV/VER với ACL — field mật chỉ khi đủ quyền (CORE-02 must_keep) |
| Quản trị cấu hình | Cấu hình mẫu / keyword_map / TPL catalog (peer 09d) · clause library (09a) |
| Group CEO | Scope rollup `main` — U19 contracts list = get = preview = print-versions |
| Member CEO / HRBP | Chỉ pháp nhân membership · cùng scope resolver |
| Hệ thống (Nest) | Registry CRUD · merge PREV · VER/PDF peer · Nest `/core` **0** · **không** Word/DOCX SoT |
| CORE-07 / PAY / ATT | Peers **must_keep / OUT invent DONE** — **≠** claim DONE from this seat |

### Scope

| In (this seat) | Out |
|----------------|-----|
| O1–O12 CONFIRM · map FR-09 Luồng #1–#5 + Diễn biến #1–#4 → AC-CORE-09-* · AC-CTR-TPL-01..05 deepen · residuals REG/FILL/ZERO-TPL/MANDATORY/ADD≠DONE · J-HRM-CORE-09-* DRAFT | Impl `apps/**` / migration / seed |
| Physical prefer `/contracts-insurance/contracts*` + preview + print-versions* · paper `/core` alias | Nest `/core/…/contracts` SoT dual |
| Explicit registry≠DONE · 09a–d ADD≠DONE · Word/DOCX OUT · printable false | Claim ADD peers / registry CRUD / VER alone = FR-09 / printable DONE |
| Honesty footer · C-SLICE · CORE-07 RETAIN (GATE/ACT-400/Nest DENY/checklist≠DONE/free PATCH≠DONE) · soft≠CORE-06 DONE | Flip ready flags · invent PAY/ATT/printable DONE · reopen sealed J-* · claim CORE-07 DONE |

### SA Option A — BA CONFIRM (đóng O1–O12)

| # | Topic | BA CONFIRM (normative) |
|---|-------|-------------------------|
| **O1** | Physical path | **YES** — Registry + fill Network **chỉ** physical **`POST/GET/PATCH/DELETE /api/hrm/contracts-insurance/contracts*`** · **`POST …/contracts/:id/preview`** · **`POST/GET …/print-versions*`** · **`GET …/pdf`** · **`…/contract-templates*`** (peer) — paper `/api/hrm/core/…` = **alias / DOC-DELTA only** — **FAIL** nếu Nest `@Controller('core')` second CTR SoT — **AC-CORE-09-01** |
| **O2** | Keyword syntax | **YES** — `{{token}}` / `{{tên_trường}}` **ONLY** on `keyword_map` + clause body — **DENY** dual merge syntax · **DENY** Word field codes / DOCX merge as GĐ1 SoT — **AC-CORE-09-02** · **AC-CORE-09-DOCX-OUT** |
| **O3** | Word/DOCX | **YES OUT invent** — Board «Word» = **colloquial** for mẫu điền sẵn từ khóa — **FORBIDDEN** invent Word/DOCX upload-as-primary template engine this seat · **FORBIDDEN** claim DOCX = FR-09 DONE — footer every evidence — **AC-CORE-09-DOCX-OUT** |
| **O4** | Registry ≠ DONE | **YES** — UF-HRM-02 registry CRUD alone = **RETAIN** sổ (**R-CORE-09-REG-01**) — **≠ CORE-09 EXPAND module DONE** without fill AC + U65 journeys — **AC-CORE-09-≠-REG-DONE** |
| **O5** | 09a–d ≠ DONE | **YES** — Peer ADD seals CL/PREV/VER/TPL = **must_keep** expand (**R-CORE-09-ADD-≠-DONE**) — **≠** claim = CORE-09 parent / EXPAND module DONE — footer **09a–d ADD ≠ CORE-09 DONE** — **AC-CORE-09-≠-ADD-PEER-DONE** |
| **O6** | Zero template | **YES IN-SCOPE residual `R-CORE-09-ZERO-TPL`** — 0 active template → CTA cấu hình · **DENY** lưu phiên bản giả từ mẫu — **AC-CTR-TPL-01** · **AC-CORE-09-03** |
| **O7** | Fill preview | **YES IN-SCOPE residual `R-CORE-09-FILL-01`** — có mẫu → PREV điền hồ sơ công khai + C&B đủ quyền · **DENY** empty form bắt nhập lại toàn bộ — **AC-CTR-TPL-02** · **AC-CORE-09-04** |
| **O8** | Mandatory block | **YES IN-SCOPE residual `R-CORE-09-MANDATORY`** — thiếu field bắt buộc → chặn + liệt kê `missing_*` · `can_issue=false` · **DENY** silent save — **AC-CTR-TPL-03** · **AC-CORE-09-05** |
| **O9** | C&B mask | **YES** — Field mật (lương/MST) chỉ với đủ quyền C&B — **must_keep** CORE-02 AuthZ/CB-403 · PREV `cb_masked` — **DENY** invent C&B engine DONE — **AC-CTR-TPL-04** · **AC-CORE-09-06** |
| **O10** | Honesty / peers OUT | **YES false** — all ready flags false · C-SLICE · **printable false RETAIN** · **DENY** flip personnel/printable/recruitment/jd · **DENY** claim CORE-07 DONE · checklist/free PATCH = CORE-07 DONE · soft = CORE-06 DONE · invent PAY/ATT DONE · claim printable/closed-8 · **must_keep** CORE-07..01 · Nest DENY · **`R-CORE-07-FE-EMPLOYEE-RECORD` P2 idle-ok** · **`R-CORE-07-HONESTY` INFO** — **AC-CORE-09-H** |
| **O11** | Display-ready | **YES** — PREV/VER DTO: **`merged_fields`** · **`missing_fields`** · **`can_issue`** · **`cb_masked`** · **`template_code`** · **`statusLabelVi`** — FE bind · **cấm** FE invent Word/DOCX SoT / PAY / printable flip |
| **O12** | Journeys | **YES** — Mint **`J-HRM-CORE-09-01..06` DRAFT** (0 mẫu CTA · chọn mẫu fill PREV · thiếu field block · C&B mask · lưu VER F5 · registry without template · Nest `/core` 0 · 09a–d≠DONE · printable false · CORE-07 RETAIN) · **DENY** reopen sealed J-HRM-CORE-07-01..05 / 06 / 05 / 03 / 02B / 09D..01 |

**Architecture SoT:** ONE LIVE registry + keyword fill spine on `/contracts-insurance/*` · paper `/core` alias only · 09a–d ADD ≠ parent DONE · registry CRUD ≠ parent DONE · Word/DOCX OUT · printable false · U19 list↔get↔preview↔print-versions · CORE-07..01 **must_keep**.

### Primary API surface (BA lock — O1)

| Intent | Physical (normative) | Paper alias |
|--------|----------------------|-------------|
| Registry sổ HĐ | **`POST/GET/PATCH/DELETE /api/hrm/contracts-insurance/contracts*`** | `/core/…/contracts` alias only |
| Keyword fill preview | **`POST …/contracts/:id/preview`** (ephemeral — **no** INSERT VER) | alias |
| Save / list print version | **`POST/GET …/print-versions*`** (peer 09c must_keep) | alias — **≠** printable UAT |
| PDF | **`GET …/pdf`** (peer 09c) | alias — **printable false** |
| Templates / keyword_map | **`…/contract-templates*`** (peer 09d must_keep) | alias |
| Clause library | **`…/contract-clauses*`** (peer 09a) | alias |
| Pack resolve | **`…/pack-resolve`** (peer 09b) | alias |
| Merge tokens | **`…/merge-tokens*`** (PLT/EMP TOK) | alias |
| CORE-07 activate | **`POST /employees/:id/activate`** must_keep | `/core/…/activate` alias — **≠** claim CORE-07 DONE |
| CORE-06 / 05 / 03 / 02b / 08 / 02 / 01 | peers must_keep | alias |
| PAY / ATT | Peers **OUT invent DONE** | — |

**Invariant CORE-09-PATH:** Contracts Network **MUST** hit `/contracts-insurance/*` · Nest dual `/core` CTR SoT = **FAIL O1**.

**Invariant CORE-09-≠-REG-DONE:** Claim registry CRUD alone = FR-UC-BP-CORE-09 / CORE-09 DONE = **FAIL O4**.

**Invariant CORE-09-≠-ADD-PEER-DONE:** Claim 09a–d ADD seals = CORE-09 EXPAND module DONE = **FAIL O5**.

**Invariant CORE-09-DOCX-OUT:** Invent Word/DOCX primary / claim DOCX = FR-09 DONE = **FAIL O2/O3**.

**Invariant CORE-09-≠-PRINTABLE:** Claim printable / closed-8 DONE / flip `contracts_printable_ready` = **FAIL O10**.

**Invariant CORE-09-≠-07-DONE:** Claim CORE-07 DONE / checklist=CORE-07 DONE / free PATCH=CORE-07 DONE = **FAIL O10**.

**Invariant CORE-09-≠-06-DONE:** Claim soft = CORE-06 DONE = **FAIL O10**.

**Wire codes (RETAIN — no invent rewrite):** `HRM-CTR-*` registry/PREV/VER/PDF/TPL/CL · `HRM-CTR-TPL-NONE` · `HRM-CTR-ISSUE-BLOCKED` · `HRM-CTR-PREV-200` · `HRM-SCOPE-409` · sealed `HRM-EMP-ACT-CHECKLIST-INCOMPLETE` (409) · ACT-400 · sealed CORE-* · **DENY** silent 2xx when mandatory incomplete.

---

## 1. As-is vs to-be

| | AS-IS (LIVE + seals) | TO-BE (Wave-22 · Option A) |
|---|----------------------|---------------------------|
| Registry CRUD | `/contracts-insurance/contracts*` · UF-HRM-02 | **RETAIN must_keep** · **≠** module DONE alone (**O4**) |
| Registry without template | AC-CTR-XEVN-08 LIVE | **RETAIN** (**O4/O12**) |
| Keyword fill / PREV | `POST …/preview` · keyword_map · merge tokens | **RETAIN path** + U65 fidelity (**O7**) · **≠** FR-09 DONE alone |
| 0 mẫu hiệu lực | TPL-NONE / CTA Settings (09d) | Residual fidelity (**O6**) |
| Mandatory / can_issue | PREV missing_* · VER ISSUE-BLOCKED | **RETAIN** + U65 (**O8**) |
| C&B mask | PREV `cb_masked` · CORE-02 CB-403 | **must_keep RETAIN** (**O9**) |
| VER + PDF | CORE-09c SEALED | **must_keep · ≠ printable UAT** (**O5/O10**) |
| 09a CL / 09b PACK / 09d TPL | ADD SEALED | **must_keep · ≠ parent DONE** (**O5**) |
| Word / DOCX primary | **ABSENT** as SoT | **OUT invent / DENY** (**O3**) |
| Paper `/core` CTR | Nest `@Controller('core')` ABSENT | **Alias only** (**O1**) |
| CORE-07 activate | GATE 409 · ACT-400 · Nest 0 · checklist≠DONE · free PATCH≠DONE | **must_keep RETAIN** · **≠** claim DONE (**O10**) |
| CORE-06 soft | soft≠DONE SEALED | **must_keep RETAIN** · **≠** claim DONE |
| PAY / ATT | Peers | **OUT invent DONE** |
| Honesty | C-SLICE · printable false | **false RETAIN** (**O10**) |

### 1.1 Disposition **R-CORE-09-REG-01**

| Field | BA ruling |
|-------|-----------|
| **ID** | `R-CORE-09-REG-01` |
| **Scope** | **IN-SCOPE residual fidelity** — UF-HRM-02 create/edit/F5 sổ · FR-09 Mục đích «Giữ sổ đăng ký» |
| **OUT of residual** | Claim registry alone = CORE-09 module DONE · Nest `/core` registry dual |
| **Rationale** | FR-09 Mục đích + AC-CTR-XEVN-08 · SA O4; LIVE path PRESENT — residual = U65 AC + explicit ≠DONE lock |
| **Physical gap vs paper** | Path **PRESENT** — fidelity / journey residual (not greenfield) |
| **ba-data** | **HOLD** — LIVE `employee_contracts` RETAIN · **no** invent second registry |
| **sa API** | RETAIN cite F-CORE-CTR-01 · residual wire **only if** BA/QA proves closable gap |
| **DENY** | Claim REG CRUD = FR-09 DONE · Nest `/core` dual · wipe registry |

### 1.2 Disposition **R-CORE-09-FILL-01**

| Field | BA ruling |
|-------|-----------|
| **ID** | `R-CORE-09-FILL-01` |
| **Scope** | **IN-SCOPE residual** — PREV điền hồ sơ+C&B · `{{token}}` · Diễn biến #2 · AC-CTR-TPL-02 |
| **OUT** | Word/DOCX primary invent · invent C&B engine DONE · claim PREV alone = printable DONE |
| **Rationale** | FR-09 Luồng #3 · AC-CTR-TPL-02 · SA O7; LIVE PREV PRESENT — U65 fidelity |
| **ba-data** | **HOLD** — LIVE `keyword_map` + `hrm_merge_tokens` RETAIN |
| **sa API** | RETAIN cite F-CORE-CTR-PREV-01 · paper alias |
| **DENY** | Dual merge syntax · Word primary · claim empty-form retype OK |

### 1.3 Disposition **R-CORE-09-ZERO-TPL**

| Field | BA ruling |
|-------|-----------|
| **ID** | `R-CORE-09-ZERO-TPL` |
| **Scope** | **IN-SCOPE residual** — Diễn biến #1 · AC-CTR-TPL-01 · BR «không lưu phiên bản giả» |
| **OUT** | Invent closed catalog · claim 09d alone closes ZERO-TPL without U65 |
| **Rationale** | FR-09 đặc biệt «0 mẫu» · SA O6 |
| **ba-data** | **HOLD** |
| **sa API** | RETAIN TPL-NONE / CTA path · **DENY** fake VER when 0 active TPL |
| **DENY** | Silent issue / fake VER when catalog empty |

### 1.4 Disposition **R-CORE-09-MANDATORY**

| Field | BA ruling |
|-------|-----------|
| **ID** | `R-CORE-09-MANDATORY` |
| **Scope** | **IN-SCOPE residual** — Diễn biến #3 fail · AC-CTR-TPL-03 |
| **OUT** | Override silent save · invent printable DONE from block UX |
| **Rationale** | FR-09 quy tắc «không lưu rỗng» · SA O8; LIVE missing_*/can_issue PRESENT — U65 fidelity |
| **ba-data** | **HOLD** |
| **sa API** | RETAIN ISSUE-BLOCKED / can_issue=false + list |
| **DENY** | Silent 2xx save when mandatory missing |

### 1.5 Disposition **R-CORE-09-ADD-≠-DONE** / **R-CORE-09-PRINTABLE**

| Field | BA ruling |
|-------|-----------|
| **ID** | `R-CORE-09-ADD-≠-DONE` · `R-CORE-09-PRINTABLE` |
| **Scope** | **INFO honesty locks** — every evidence footer |
| **Rule** | 09a–09d ADD seals **≠** CORE-09 EXPAND module DONE · `contracts_printable_ready=false` **RETAIN** · **DENY** flip from this BA |
| **DENY** | Claim ADD seals = parent DONE · invent printable / closed-8 DONE |

### 1.6 ba-data disposition summary

| Slice | Decision | Rule |
|-------|----------|------|
| `employee_contracts` registry | **HOLD** | LIVE RETAIN — **no** greenfield wipe / second SoT |
| `keyword_map` / `hrm_merge_tokens` | **HOLD** | LIVE RETAIN — **no** invent Word binary store |
| print-versions / clauses / templates | **HOLD · must_keep** | Peers 09c/09a/09d sealed — **DENY wipe** |
| Nest `/core` | **DENY** | alias only |
| CORE-07 / 06 / 05 / 03 / 02b | **DENY wipe** | must_keep · soft≠CORE-06 DONE · checklist≠CORE-07 DONE |
| Word/DOCX primary schema | **OUT invent** | GĐ2 / peer later |
| PAY / ATT tables | **OUT invent DONE** | peers |

**Unlock next:** **ba-data HOLD** stamp → **sa API** RETAIN cite F-CORE-CTR-01 + PREV + VER/TPL/CL — residual wire **ONLY if** closable gap proven.

---

## 2. Business rules (normative — SRS + SA; không invent)

| ID | Condition | Action | Outcome |
|----|-----------|--------|---------|
| **BR-BP-CTR-01** | HĐ từ mẫu | Điền từ khóa từ hồ sơ/C&B · giữ sổ đăng ký | Empty retype / wipe sổ = **FAIL** |
| **BR-CORE-09-PATH** | API CTR | Physical `/contracts-insurance/*` | Nest `/core` dual = **FAIL O1** |
| **BR-CORE-09-TOKEN** | Merge syntax | `{{token}}` ONLY | Dual / Word codes = **FAIL O2** |
| **BR-CORE-09-DOCX-OUT** | GĐ1 template engine | Keyword_map + HTML/PDFKit spine | DOCX primary = **FAIL O3** |
| **BR-CORE-09-REG≠DONE** | Registry CRUD alone | ≠ FR-09 DONE | Claim DONE = **FAIL O4** |
| **BR-CORE-09-ADD≠DONE** | 09a–d ADD seals | ≠ parent EXPAND DONE | Claim DONE = **FAIL O5** |
| **BR-CORE-09-ZERO** | 0 mẫu hiệu lực | CTA only · chặn VER giả | Fake VER = **FAIL O6** · AC-CTR-TPL-01 |
| **BR-CORE-09-FILL** | Có mẫu | PREV điền sẵn | Empty retype = **FAIL O7** · AC-CTR-TPL-02 |
| **BR-CORE-09-MAND** | Missing required | Block + list | Silent save = **FAIL O8** · AC-CTR-TPL-03 |
| **BR-CORE-09-CB** | Non-C&B role | Mask lương/MST | Leak = **FAIL O9** · AC-CTR-TPL-04 |
| **BR-CORE-09-VER-F5** | Save VER success | F5 còn trên hồ sơ | Lost VER = **FAIL** · AC-CTR-TPL-05 · **≠** printable UAT |
| **BR-CORE-09-NO-SEED** | Nghiệm thu | FE only | Seed = **FAIL U65** |
| **BR-CORE-09-≠-07-DONE** | CORE-07 seal | GATE/ACT-400/Nest DENY · checklist≠DONE · free PATCH≠DONE | Claim CORE-07 DONE = **FAIL O10** |
| **BR-CORE-09-≠-06-DONE** | CORE-06 seal | soft≠DONE | Claim soft=DONE = **FAIL O10** |
| **BR-CORE-09-PAY-ATT-OUT** | PAY / ATT | Peers | Invent DONE = **FAIL O10** |
| **BR-CORE-09-PRINTABLE** | Honesty | `contracts_printable_ready=false` | Flip = **FAIL O10** |
| **BR-CORE-09-SCOPE** | list = get = preview = VER | Same scope resolver | Cross-CT leak = **FAIL U19** |

### Error taxonomy (RETAIN + residual assert)

| Code family | HTTP | UX intent (VI) | ≠ |
|-------------|------|----------------|--|
| `HRM-CTR-TPL-NONE` / CTA | 4xx / UI | Chưa có mẫu — cấu hình trước | Fake VER từ mẫu |
| `HRM-CTR-ISSUE-BLOCKED` / `can_issue=false` | 400 | Thiếu field bắt buộc — liệt kê | Silent 2xx |
| `HRM-CTR-PREV-200` | 200 | PREV ephemeral OK | Claim = INSERT VER / printable |
| Sealed `HRM-CTR-VER-*` / PDF | 2xx | VER/PDF peer | Claim printable UAT |
| `HRM-SCOPE-409` | 409 | Ngoài phạm vi pháp nhân | Soft OK |
| Sealed `HRM-EMP-ACT-CHECKLIST-INCOMPLETE` | 409 | CORE-07 GATE must_keep | Reopen CORE-07 |
| Sealed ACT-400 | 400 | Free PATCH status blocked | Claim free PATCH = CORE-07 DONE |
| Sealed CORE-* | — | **DENY** rewrite · must_keep regression | — |

---

## 3. Diễn biến FR-UC-BP-CORE-09 + AC-CTR-TPL → AC / VAL map (normative)

### 3.0 Map overview

| SRS source | Tương tác | AC cite | J-* | LIVE Network (cite) |
|------------|-----------|---------|-----|---------------------|
| **Diễn biến #1** · Luồng #1 · AC-CTR-TPL-01 | 0 mẫu → CTA · chặn VER giả | **AC-CORE-09-03** · **AC-CTR-TPL-01** | **J-HRM-CORE-09-01** | TPL list empty/active=0 · Nest `/core` **0** |
| **Diễn biến #2** · Luồng #2–#3 · AC-CTR-TPL-02 | Chọn mẫu → PREV điền sẵn | **AC-CORE-09-04** · **AC-CTR-TPL-02** | **J-HRM-CORE-09-02** | `POST …/preview` **200** · merged_fields · Nest `/core` 0 |
| **Diễn biến #3 fail** · AC-CTR-TPL-03 | Thiếu field → chặn + list | **AC-CORE-09-05** · **AC-CTR-TPL-03** | **J-HRM-CORE-09-03** | `can_issue=false` · missing_* · ISSUE-BLOCKED |
| **AC-CTR-TPL-04** · CORE-02 | C&B mask field mật | **AC-CORE-09-06** · **AC-CTR-TPL-04** | **J-HRM-CORE-09-04** | PREV `cb_masked` · CB-403 peer |
| **Diễn biến #3–#4** · AC-CTR-TPL-05 | Lưu VER → F5 còn | **AC-CORE-09-07** · **AC-CTR-TPL-05** | **J-HRM-CORE-09-05** | `POST …/print-versions` 2xx · F5 · **≠** printable |
| **Mục đích sổ** · AC-CTR-XEVN-08 | Registry without template | **AC-CORE-09-08** · **≠-REG-DONE** | **J-HRM-CORE-09-06** | `POST/PATCH …/contracts` without template_id · F5 |
| **O5 / O10 footer** | 09a–d≠DONE · printable false · CORE-07 RETAIN | **AC-CORE-09-≠-ADD-PEER-DONE** · **AC-CORE-09-H** · **MK-*** | **J-06** | Nest `/core` 0 · seals smoke |

### 3.1 AC-CORE-09 (normative)

| AC-ID | Given | When | Then (measurable) | Evidence |
|-------|-------|------|-------------------|----------|
| **AC-CORE-09-01** | HCNS trong scope · mở HĐ / sổ | Load list / mutate registry / preview / VER | Network hits **only** physical `/api/hrm/contracts-insurance/*` · Nest `/api/hrm/core/**` CTR SoT **0** | U65 · O1 · **R-CORE-09-REG-01** |
| **AC-CORE-09-02** | Template / clause body | Merge fill | Tokens resolve via `{{…}}` ONLY · keyword_map + merge registry · **no** Word field-code SoT | O2 · BR-CORE-09-TOKEN |
| **AC-CORE-09-DOCX-OUT** | Board «Word» colloquial | Product claim / upload DOCX as primary SoT | **OUT invent** GĐ1 · claim DOCX=FR-09 DONE = **FAIL** | O3 |
| **AC-CORE-09-≠-REG-DONE** | User only CRUD sổ (no fill AC journeys PASS) | Claim FR-09 / CORE-09 DONE | **FAIL** — registry = sổ RETAIN only | O4 · L-CORE-09-05 |
| **AC-CORE-09-≠-ADD-PEER-DONE** | 09a–d ADD seals GWC present | Claim CORE-09 EXPAND / parent DONE | **FAIL** — peers expand must_keep only · footer **09a–d ADD ≠ CORE-09 DONE** | O5 · L-CORE-09-04 |
| **AC-CORE-09-03** / **AC-CTR-TPL-01** | 0 mẫu hiệu lực | Mở sinh HĐ từ mẫu / cố lưu VER «từ mẫu» | CTA cấu hình · **không** lưu phiên bản giả · Nest `/core` 0 | O6 · Diễn biến #1 · **R-CORE-09-ZERO-TPL** |
| **AC-CORE-09-04** / **AC-CTR-TPL-02** | ≥1 mẫu hiệu lực · hồ sơ/C&B có data | Chọn mẫu → Xem trước | `POST …/preview` **200** · merged_fields populated từ hồ sơ (+ C&B đủ quyền) · **không** bắt nhập lại toàn bộ empty | O7 · Diễn biến #2 · **R-CORE-09-FILL-01** |
| **AC-CORE-09-05** / **AC-CTR-TPL-03** | Thiếu ≥1 field bắt buộc mẫu | Lưu VER / xuất | **Chặn** · `can_issue=false` + `missing_fields[]` (or ISSUE-BLOCKED) · **không** silent 2xx · F5 không tạo VER giả | O8 · **R-CORE-09-MANDATORY** |
| **AC-CORE-09-06** / **AC-CTR-TPL-04** | User **không** đủ quyền C&B | PREV / xem field mật | Lương/MST **che / ẩn** (`cb_masked`) · **không** lộ · must_keep CORE-02 CB-403 | O9 |
| **AC-CORE-09-07** / **AC-CTR-TPL-05** | PREV đủ · can_issue=true | Lưu phiên bản → F5 / reopen hồ sơ | `POST …/print-versions` **2xx** · phiên bản **còn** · Nest `/core` 0 · **≠** claim printable / `contracts_printable_ready` flip | O11 · peer 09c · Diễn biến #3–#4 |
| **AC-CORE-09-08** / **AC-CTR-XEVN-08** | Form sổ | Tạo/sửa HĐ **không** chọn mẫu in | **2xx** · F5 còn · **≠** force template always · still **≠** CORE-09 DONE alone | O4 · UF-HRM-02 |
| **AC-CORE-09-MK-07** | Any CORE-09 evidence | Diff CORE-07 activate | Physical activate · GATE **409** · ACT-**400** · Nest `/core` **0** · checklist≠DONE · free PATCH≠DONE **intact** · **no** reopen J-HRM-CORE-07-01..05 · **≠** claim CORE-07 DONE · `R-CORE-07-FE-EMPLOYEE-RECORD` P2 idle-ok · `R-CORE-07-HONESTY` INFO | O10 · `CORE07QC1-KZJTSHNT` |
| **AC-CORE-09-MK-06** | Any CORE-09 evidence | Diff CORE-06 soft-return | soft≠DONE · Nest `/core` 0 **intact** · **no** reopen J-HRM-CORE-06 · **≠** claim soft=CORE-06 DONE | O10 · `CORE06QC1-MSLID363` |
| **AC-CORE-09-MK-05/03/02B** | Any CORE-09 evidence | Diff CORE-05/03/02b | AST/BB · DOC/ET/CHK · EMP-CF **intact** · **no** reopen sealed J-* | O10 · peer stamps |
| **AC-CORE-09-MK-09D..09A** | Any CORE-09 evidence | Diff 09d..09a | TPL+clause · VER/PDF ≠ printable · PREV ephemeral · CL **intact** · **≠** claim ADD = parent DONE · **no** reopen J-HRM-CORE-09D..09A | O5/O10 · peer stamps |
| **AC-CORE-09-MK-08/02/01** | Any CORE-09 evidence | Diff RD/C&B/public | RD · AuthZ/CB · public **intact** · **no** reopen J-CORE-08/02/01 | O10 |
| **AC-CORE-09-H** | Evidence footer | Any seal | personnel/printable/recruitment/jd **false** · C-SLICE · **printable false RETAIN** · **DENY** 09a–d=CORE-09 DONE · registry=CORE-09 DONE · CORE-07 DONE · checklist/free PATCH=CORE-07 DONE · soft=CORE-06 DONE · PAY/ATT/printable/closed-8 DONE · Word invent · Nest DENY · no reopen seals | O10 |

### 3.2 Scope ladder (U19)

| Persona | User sees | Fail |
|---------|-----------|------|
| **Group CEO** (`main`) + HCNS | Registry + PREV + VER across rollup membership | Cross-CT mutate without membership |
| **Member CEO / HRBP** | Chỉ pháp nhân membership | contracts list ≠ get ≠ preview ≠ VER resolver |
| **No HĐ right** | Deny mutate registry / VER | Silent 2xx |
| **No C&B right** | PREV masks mật fields | Leak lương/MST |

**Invariant CORE-09-SCOPE:** contracts list **=** get-by-id **=** preview **=** print-versions **same** contracts-insurance / hrm list-scope family.

**Prerequisite:** CORE-07 activate seals RETAIN (`CORE07QC1-KZJTSHNT`) · soft≠CORE-06 DONE · CORE-05/03/02b · CORE-09d..01 ADD stamps RETAIN · **không** seed · honesty flags false · printable false · Word OUT.

---

## 4. Diễn biến FE U65 (browser matrix)

```text
Login (ceo@xe.vn / member HCNS)
  → /hr Nhân sự → Hợp đồng (Contracts / hồ sơ HĐ)
  → (Neg ZERO) 0 mẫu hiệu lực → CTA cấu hình · cố Lưu VER từ mẫu → chặn · Nest /core 0
  → (Pos FILL) Có mẫu → chọn mẫu → Xem trước
       → POST …/preview 200 · merged_fields từ hồ sơ (+ C&B đủ quyền)
       → Assert không bắt nhập lại toàn bộ trống
  → (Neg MAND) Thiếu field bắt buộc → Lưu → chặn + list missing · F5 không VER giả
  → (Neg CB) Non-C&B → PREV che lương/MST (cb_masked)
  → (Pos VER) Đủ → Lưu phiên bản → POST print-versions 2xx → F5 còn
       → Assert ≠ contracts_printable_ready flip · ≠ printable UAT
  → (Pos REG) Tạo/sửa sổ không chọn mẫu → 2xx → F5 còn · cite ≠ CORE-09 DONE alone
  → Assert Nest /core CTR = 0
  → Footer: 09a–d ADD ≠ CORE-09 DONE
       · registry CRUD ≠ CORE-09 DONE
       · Word/DOCX OUT
       · printable false RETAIN
       · must_keep CORE-07 GATE 409 · ACT-400 · Nest DENY · checklist≠DONE · free PATCH≠DONE
       · soft≠CORE-06 DONE · ≠ invent PAY/ATT DONE · honesty false · no reopen seals
```

**cấm:** `pnpm seed:*` · API seed contracts/VER · DB fake · PASS chỉ curl · Nest `/core` dual · wipe CORE-07/06/05/03/02b/09d..01 · claim 09a–d=FR-09 DONE · claim registry=FR-09 DONE · claim CORE-07 DONE · invent Word/printable/PAY/ATT · claim module DONE · reopen sealed J-*.

### VAL pack (mint)

| VAL-ID | Expect | Maps |
|--------|--------|------|
| **VAL-CORE-CTR-01** | 0 mẫu → CTA · chặn VER giả · Nest `/core` 0 | AC-CORE-09-03 · AC-CTR-TPL-01 · O6 |
| **VAL-CORE-CTR-02** | PREV fill hồ sơ+C&B · `{{token}}` · no full retype | AC-CORE-09-04/02 · AC-CTR-TPL-02 · O2/O7 |
| **VAL-CORE-CTR-03** | Missing → block + list · no silent save | AC-CORE-09-05 · AC-CTR-TPL-03 · O8 |
| **VAL-CORE-CTR-04** | Non-C&B `cb_masked` · no leak | AC-CORE-09-06 · AC-CTR-TPL-04 · O9 |
| **VAL-CORE-CTR-05** | VER 2xx + F5 · ≠ printable · Nest `/core` 0 | AC-CORE-09-07 · AC-CTR-TPL-05 · O10/O11 |
| **VAL-CORE-CTR-06** | Registry without template F5 · 09a–d≠DONE · CORE-07 RETAIN · honesty | AC-CORE-09-08/≠-REG/≠-ADD/H/MK-* · O4/O5/O10 |

---

## 5. Journeys DRAFT (O12)

| J-ID | Title | Click path (draft) | Pass when |
|------|-------|--------------------|-----------|
| **J-HRM-CORE-09-01** | **0 mẫu → CTA · chặn VER giả** | Login → Hợp đồng → 0 active TPL → CTA cấu hình · cố Lưu VER từ mẫu → chặn · Nest `/core` 0 · no seed | AC-CORE-09-03 · AC-CTR-TPL-01 · O6 · U65 · **DRAFT** |
| **J-HRM-CORE-09-02** | **Chọn mẫu → PREV điền sẵn** | Có mẫu → chọn → POST preview 200 → merged_fields từ hồ sơ (+ C&B) · `{{token}}` · Nest `/core` 0 | AC-CORE-09-04/02 · AC-CTR-TPL-02 · O2/O7 · U65 · **DRAFT** |
| **J-HRM-CORE-09-03** | **Thiếu field → chặn + list** | Missing required → Lưu VER → can_issue=false / ISSUE-BLOCKED + list · F5 no fake VER | AC-CORE-09-05 · AC-CTR-TPL-03 · O8 · U65 · **DRAFT** |
| **J-HRM-CORE-09-04** | **C&B mask field mật** | Non-C&B → PREV `cb_masked` · không lộ lương/MST · CORE-02 CB must_keep | AC-CORE-09-06 · AC-CTR-TPL-04 · O9 · U65 · **DRAFT** |
| **J-HRM-CORE-09-05** | **Lưu VER → F5 còn · ≠ printable** | PREV đủ → POST print-versions 2xx → F5 còn · Nest `/core` 0 · **≠** printable flip | AC-CORE-09-07 · AC-CTR-TPL-05 · O10/O11 · U65 · **DRAFT** |
| **J-HRM-CORE-09-06** | **Registry without template · seals · honesty** | CRUD sổ không mẫu → F5 · Nest `/core` 0 · cite 09a–d≠DONE · registry≠DONE · Word OUT · printable false · CORE-07 GATE/ACT-400/Nest DENY/checklist≠DONE/free PATCH≠DONE · soft≠CORE-06 DONE · no reopen J-07/06/05/03/02B/09D..01 · ≠ invent PAY/ATT | AC-CORE-09-08/≠-REG/≠-ADD/H/MK-* · O4/O5/O10 · U19 · **DRAFT** |

**Promotion:** Journeys remain **DRAFT** until QA U65 browser evidence · QC GWC C-SLICE only · **≠** auto-flip `hrm_personnel_uat_ready` · **≠** `contracts_printable_ready` · **≠** claim 09a–d ADD = CORE-09 DONE · **≠** claim registry = CORE-09 DONE · **≠** claim CORE-07 DONE.

| Sealed peer | Rule |
|-------------|------|
| **J-HRM-CORE-07-01..05** / `CORE07QC1-KZJTSHNT` / `CORE07QA1-MSLJSPGO` | must_keep activate · GATE 409 · ACT-400 · Nest `/core` 0 · checklist≠DONE · free PATCH≠DONE · **≠** claim CORE-07 DONE · `R-CORE-07-FE-EMPLOYEE-RECORD` P2 idle-ok · `R-CORE-07-HONESTY` INFO |
| **J-HRM-CORE-06-*** / `CORE06QC1-MSLID363` | must_keep soft≠DONE · **≠** claim soft=CORE-06 DONE |
| **J-HRM-CORE-05-01..05** / `CORE05QC1-MSLGVT40` | must_keep AST/BB/serial/DELETE-FORBIDDEN |
| **J-HRM-CORE-03-01..05** / `CORE03QC1-MSLFJH0K` | must_keep DOC/ET/CHK |
| **J-HRM-CORE-02B-01..04** / `CORE02BQC1-MSLEFQC1` | must_keep EMP-CF |
| **J-HRM-CORE-09D-01..04** / `CORE09DQC1-MSLDR8I3` | must_keep · **≠** printable / closed-8 DONE · **≠** claim = parent CORE-09 DONE |
| **J-HRM-CORE-09C-01..04** / `CORE09CQC1-MSLBXMUT` | must_keep · VER/PDF **≠** printable · **≠** claim = parent DONE |
| **J-HRM-CORE-09B-01..04** / `CORE09BQC1-MSLB05DZ` | must_keep · PREV ephemeral · **≠** claim = parent DONE |
| **J-HRM-CORE-09A-01..04** / `CORE09AQC1-MSLA4LX9` | must_keep · **≠** claim = parent DONE |
| **J-HRM-CORE-08-01..04** / `CORE08QC1-MSL9BFFE` | must_keep |
| **J-HRM-CORE-02-01..04** / `CORE02QC1-MSL80DU6` | must_keep · AuthZ/CB-403 |
| **J-HRM-CORE-01-01..04** / `CORE01QC1-MSL6WMS7` | must_keep · public strip |

---

## 6. Honesty & must_keep

| Item | Rule |
|------|------|
| `recruitment_uat_ready` | **false** |
| `jd_dynamic_done` | **false** |
| `contracts_printable_ready` | **false RETAIN** · **DENY** flip |
| `hrm_personnel_uat_ready` | **false** · **DENY** flip |
| Claim 09a–d ADD alone = CORE-09 / FR-09 DONE | **DENIED** (O5) — footer **09a–d ADD ≠ CORE-09 DONE** |
| Claim registry CRUD alone = CORE-09 DONE | **DENIED** (O4) |
| Claim Word/DOCX primary = FR-09 DONE | **DENIED** (O3) |
| Claim CORE-07 DONE / checklist=CORE-07 DONE / free PATCH=CORE-07 DONE | **DENIED** |
| Claim soft = CORE-06 DONE | **DENIED** · soft≠DONE **RETAIN** |
| Claim PAY DONE / ATT DONE | **DENIED** |
| Claim printable / closed-8 DONE | **DENIED** |
| Nest `/core` dual · wipe CORE-07/06/05/03/02b/09d..01 | **DENIED** |
| C-SLICE | GWC later ≠ module CORE/CTR/personnel UAT ≠ Phase1 |
| must_keep W21 | CORE-07 activate `CORE07QC1-KZJTSHNT` · GATE 409 · ACT-400 · Nest DENY · checklist≠DONE · free PATCH≠DONE · **≠** CORE-07 DONE |
| must_keep W20..W10 | CORE-06 soft≠DONE · CORE-05 · CORE-03 · CORE-02b · CORE-09d TPL+clause · 09c VER/PDF ≠ printable · 09b PREV ephemeral · 09a CL · 08 · 02 · 01 |
| DENY | honesty flip · seed · apps/** · reopen sealed J-HRM-CORE-07-01..05 / 06 / 05 / 03 / 02B / 09D/09C/09B/09A/08/02/01 |

---

## 7. Handoff

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** · O1–O12 **CONFIRMED** |
| **next_owner** | **ba-data** — **HOLD default** (no REQUIRED schema invent: LIVE `employee_contracts` · `keyword_map` · `hrm_merge_tokens` · peer VER/TPL/CL RETAIN) · then **sa API** RETAIN cite F-CORE-CTR-01 + PREV + VER/TPL/CL — residual wire **only if** closable gap proven |
| **ba-data** | **HOLD** (default) — reopen **REQUIRED** only if DATA proves typed col ABSENT for fill/registry display-ready |
| **sa API-01** | After HOLD stamp — RETAIN cite F-CORE-CTR-01 · F-CORE-CTR-PREV-01 · peer VER/TPL/CL · paper `/core` alias only · **DENY** Nest dual · **DENY** Word invent |
| **Dev** | **HOLD** until API CONFIRMED · **DENY** Nest `/core` dual · **DENY** Word invent · **DENY** wipe CORE-07/06/05/03/02b/09d..01 · **DENY** invent PAY/ATT/printable · **DENY** claim 09a–d = CORE-09 DONE · **DENY** claim registry = CORE-09 DONE · **DENY** claim CORE-07 DONE |
| **evidence_path** | `docs/program/specs/PO-HRM-MVP-GD1-CORE-09-CLUSTER-BA-01.md` |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-CORE-09-CLUSTER-DATA-01
lane: governance · ba-data
program: PO-HRM-MVP-GD1-CONTINUOUS (U89)
uc_ids: UC-BP-CORE-09
depends_on: BA-01 O1–O12 CONFIRMED · docs/program/specs/PO-HRM-MVP-GD1-CORE-09-CLUSTER-BA-01.md · SA Option A · R-CORE-09-REG-01 fidelity HOLD · R-CORE-09-FILL-01 HOLD (keyword_map + hrm_merge_tokens LIVE) · R-CORE-09-ZERO-TPL · R-CORE-09-MANDATORY · R-CORE-09-ADD-≠-DONE INFO · R-CORE-09-PRINTABLE false RETAIN · Word/DOCX OUT · printable false · CORE07QC1-KZJTSHNT GATE 409 · ACT-400 · Nest DENY · checklist≠DONE · free PATCH≠DONE · ≠ CORE-07 DONE · CORE06QC1-MSLID363 soft≠DONE · CORE05QC1-MSLGVT40 · CORE03QC1-MSLFJH0K · CORE02BQC1-MSLEFQC1 · CORE09DQC1-MSLDR8I3..CORE01QC1-MSL6WMS7
spec_ref: F-CORE-CTR-01 physical /contracts-insurance/contracts* · F-CORE-CTR-PREV-01 · LIVE public.employee_contracts · keyword_map · hrm_merge_tokens RETAIN · Nest /core DENY · 09a–d ADD ≠ CORE-09 DONE · registry ≠ DONE alone

MISSION — Physical DATA lock (docs-only · HOLD default):
1) CONFIRM HOLD — no invent/change on LIVE employee_contracts registry SoT
2) CONFIRM HOLD — keyword_map JSONB + hrm_merge_tokens RETAIN — DENY invent Word/DOCX binary primary store GĐ1
3) CONFIRM HOLD — peer print-versions / clauses / templates tables must_keep — DENY wipe 09c/09a/09d
4) Cite display-ready PREV/VER DTO: merged_fields · missing_fields · can_issue · cb_masked · template_code · statusLabelVi
5) RETAIN CORE-07 activate GATE 409 · ACT-400 · Nest /core DENY · checklist≠DONE · free PATCH≠DONE · soft≠CORE-06 DONE · CORE-05/03/02b · CORE-09d..01 · Nest /core DENY
6) DENY wipe CORE-07/06/05/03/02b/09d..01 · invent PAY/ATT/printable DONE · claim 09a–d = CORE-09 DONE · claim registry = CORE-09 DONE · claim CORE-07 DONE · claim printable/closed-8 DONE · Word invent · honesty flip · reopen sealed J-HRM-CORE-07-01..05 / 06 / 05 / 03 / 02B / 09D..01 · seed · apps/**
7) Unlock next: sa API-01 RETAIN cite F-CORE-CTR-01 + PREV + VER/TPL/CL — paper /core alias only — residual wire ONLY if closable gap proven — PAY/ATT remain OUT invent DONE

exit: docs/program/specs/PO-HRM-MVP-GD1-CORE-09-CLUSTER-DATA-01.md · PASS_TO_PM · next sa API residual (RETAIN cite · wire-only if gap)
```

---

## 8. Completion contract

| Field | Value |
|-------|--------|
| **completion_report** | O1–O12 **CONFIRMED** for UC-BP-CORE-09 against SA Option A: physical prefer **`/contracts-insurance/*`** registry + `{{token}}` keyword fill (PREV) · paper `/core` = alias only · **Word/DOCX primary OUT** · **registry CRUD ≠ CORE-09 DONE** · **09a–d ADD ≠ CORE-09 DONE** (footer every evidence) · residuals **R-CORE-09-REG/FILL/ZERO-TPL/MANDATORY/ADD≠DONE/PRINTABLE** · AC-CTR-TPL-01..05 + AC-CORE-09-* mapped from FR-09 Diễn biến #1–#4 · **printable false RETAIN** · **must_keep** CORE-07 activate (`CORE07QC1-KZJTSHNT` · GATE 409 · ACT-400 · Nest DENY · checklist≠DONE · free PATCH≠DONE · **≠** CORE-07 DONE) · soft≠CORE-06 DONE · CORE-05/03/02b · CORE-09d..01 · Nest `/core` **DENIED** · mint **J-HRM-CORE-09-01..06 DRAFT** · **ba-data HOLD default** · DENY invent PAY/ATT/printable · wipe peers · reopen sealed J-* · seed · apps/** · C-SLICE. |
| **next_owner** | **ba-data** (HOLD stamp → then sa API RETAIN cite) |
| **ack_status** | **PASS_TO_PM** |
| **residual** | DATA-01 HOLD · API F-CORE-CTR-01+PREV cite · J-09-01..06 DRAFT until U65 · PAY/ATT OUT · personnel/printable flags HOLD · 09a–d≠DONE · registry≠DONE · CORE-07 RETAIN ≠ DONE · soft≠CORE-06 DONE |
| **evidence_path** | `docs/program/specs/PO-HRM-MVP-GD1-CORE-09-CLUSTER-BA-01.md` |

---

*End BA-01 · O1–O12 CONFIRMED · U89 Wave-22 · printable false RETAIN · 09a–d ADD ≠ CORE-09 DONE · registry ≠ DONE alone · Word OUT · CORE-07 RETAIN · Nest /core DENY · no apps/** · no seed.*

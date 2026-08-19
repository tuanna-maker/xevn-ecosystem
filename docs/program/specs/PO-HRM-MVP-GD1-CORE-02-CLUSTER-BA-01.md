# BA AC pack — Wave-11 CORE cluster · UC-BP-CORE-02 (Hồ sơ vòng C&B — lương / BH / thuế / ngân hàng)

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-CORE-02-CLUSTER-BA-01` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89 — single GD continuous · Wave-11 seat **#13**) |
| **lane** | governance · ba-process |
| **Date** | 2026-08-09 |
| **Status** | **CONFIRMED against SA Option A LOCKED** · O1–O12 **CONFIRMED** · Dev **HOLD** until ba-data + SA/API F.1 residual |
| **change_mode** | **ADD** (align SA-01 — **no** wipe paper FR-CORE-02 · **no** reopen W10 CORE-01 / W1–W9 REC · **no** invent Nest `/core` dual / second compensation SoT) |
| **uc_ids** | `UC-BP-CORE-02` |
| **depends_on** | `PO-HRM-MVP-GD1-CORE-02-CLUSTER-SA-01` **Option A LOCKED** · evidence `docs/qa/evidence/po-hrm-mvp-gd1-core-02-cluster-sa-01.md` · Wave-10 CORE-01 **SEALED** stamp **`CORE01QC1-MSL6WMS7`** · QA `CORE01QA-MSL6U0AV` |
| **ref_sa** | `PO-HRM-MVP-GD1-CORE-02-CLUSTER-SA-01.md` |
| **ref_evidence_sa** | `docs/qa/evidence/po-hrm-mvp-gd1-core-02-cluster-sa-01.md` |
| **ref_ba_style** | `PO-HRM-MVP-GD1-CORE-01-CLUSTER-BA-01.md` · `PO-HRM-MVP-GD1-REC-07-CLUSTER-BA-01.md` |
| **ref_srs** | `SRS_HRM_ENTERPRISE.md` **FR-UC-BP-CORE-02** · Diễn biến #1–#4 · **AC-CORE-CB-01/02** · **BR-BP-SEC-02** · peers **CORE-01 SEALED** · **CORE-02b** / **CORE-01a** / **CORE-09/10** / **PAY** OUT |
| **ref_br** | **BR-BP-SEC-02** · BR-CORE-CB-* (this pack) |
| **ref_wbs** | `WBS_HRM_ENTERPRISE.md` · partner **HR-001** / **PAY-001** (read facade only) |
| **ref_br_depth** | `UC_BR_MATRIX_DEPTH.md` UC-BP-CORE-02 · BR-BP-SEC-02 · status **PARTIAL** → this pack unlocks BA (not DONE claim) |
| **ref_paper_db** | `DB_DESIGN_HRM_ENTERPRISE.md` **§3.2** `hrm_employee_compensation` · **§3.6** enrollment / rate period · **§3.3** dependents GTCG **consumer** · **§3.1** public **no** C&B cols |
| **ref_api_paper** | **F-CORE-EMP-02** UPGRADE residual · **F-CORE-SI-*** RETAIN/UPGRADE · **F-CORE-SI-RATE** ADD if gap · **F-CORE-EMP-01** RETAIN SEALED · **F-CORE-DEP-01** RETAIN · **F-PAY-CB-READ-01** peer OUT process · physical Option A: `/api/hrm/contracts-insurance/compensation-packages*` + `/api/hrm/employee-insurances*` · paper `/api/hrm/core/employees/{id}/compensation` = **alias only** |
| **Honesty** | `recruitment_uat_ready=false` · **`jd_dynamic_done=false`** · personnel / CORE module UAT **false** · **`C-SLICE-≠-MODULE`** · DENY flip · **DENY** claim CORE-01 public = C&B DONE |
| **Cấm** | Nest `/core` dual EMP/compensation SoT · Nest `/rec` dual · second compensation table abandoning packages · second dependents SoT · write C&B onto public `/employees*` · claim CORE-01 = C&B DONE · reopen sealed J-HRM-CORE-01-01..04 / REC seals without regression · CORE-02b / CORE-01a / CORE-09/10 invent deep · PAY process/payslip invent · seed · honesty flip · apps/** |

---

## 0. Process objective & actors

### Objective

Khóa **AC đo được** + **Diễn biến FE mutate (U63/U65)** cho Wave-11 seat #13:

1. **UC-BP-CORE-02** — (1) Mở vòng mật C&B với AuthZ + access audit; (2) xem/sửa lương·PC·NH·MST·SI theo **ngày hiệu lực** → version mới; (3) PAY đọc biến **effective** — **không** từ public EMP DTO; (4) sau lưu C&B, public CORE-01 F5 vẫn **không** lộ (AC-CORE-CB-02); (5) NPT GTCG = **consumer** ONE `employee_dependents` — **DENY** nhập trùng; (6) kiêm nhiệm: C&B CT A ↛ mật CT B.
2. **Option A** — ACCEPT_AS_IS_UPGRADE trên LIVE **`/api/hrm/contracts-insurance/compensation-packages*`** (+ revise/history/active) + **`/api/hrm/employee-insurances*`**; paper `/core/employees/{id}/compensation` = **alias only**.
3. **Không** claim module CORE/personnel UAT / flip honesty; **không** reopen J-HRM-CORE-01-*; **không** coi public ring GWC = C&B DONE.

### Actors

| Actor | Trách nhiệm |
|-------|-------------|
| C&B / Payroll (đủ quyền) | Mở / sửa vòng mật; tạo/revise package; bank/MST/SI trên C&B SoT; **không** ghi C&B qua public EMP |
| CEO đơn vị **không** C&B | **Không** xem/sửa lương trên profile — BR-BP-SEC-02 deny |
| HCNS non-C&B | Public ring only (CORE-01 SEALED) — forced public C&B → **`HRM-CORE-CB-403`** |
| Group CEO | Scope rollup `main` — C&B chỉ khi membership C&B đúng CT; U19 |
| Member CEO / HRBP | Chỉ pháp nhân / membership · cùng `resolveHrmListScope` |
| Hệ thống (Nest) | AuthZ C&B · access audit · versioned packages · SI enrollment · public strip RETAIN · **không** invent Nest `/core` SoT · **không** second deps |

### Scope

| In (this seat) | Out |
|----------------|-----|
| O1–O12 CONFIRM · AC-CORE-CB-01/02 deepen · AC-CORE-02-* · VAL-CORE-CB-* · Diễn biến FE U65 · J-HRM-CORE-02-* DRAFT | Impl `apps/**` / migration / seed |
| Physical C&B mutate on `/contracts-insurance/compensation-packages*` + `/employee-insurances*` | Greenfield Nest `/core/…/compensation` SoT · second `hrm_employee_compensation` abandoning packages |
| AuthZ C&B + access audit residual · versioned salary/PC · bank/MST home (**ba-data REQUIRED**) · SI timeline boundary | PAY process / payslip invent · formula LIVE claim |
| After C&B save → public F5 no leak · public PATCH C&B → **`HRM-CORE-CB-403` RETAIN** | Write C&B onto public `/employees*` cols |
| Dependents GTCG **consume** ONE SoT · `is_tax_dependent` flag boundary | Second deps person SoT · PAY-owned person rewrite |
| Honesty footer · C-SLICE · CORE-01 ≠ C&B DONE | Flip `jd_dynamic_done` / `recruitment_uat_ready` / Phase1 DONE |
| | **UC-BP-CORE-02b** profile groups metadata |
| | **UC-BP-CORE-01a** DEC→WH deep |
| | **UC-BP-CORE-09/10** invent deep print/catalog admin |
| | Nest `/rec` dual · REC-03 Campaign · reopen J-CORE-01 rewrite |

### SA Option A — BA CONFIRM (đóng O1–O12)

| # | Topic | BA CONFIRM (normative) |
|---|-------|-------------------------|
| **O1** | Physical path | **YES** — C&B mutate/read Network **chỉ** physical **`/api/hrm/contracts-insurance/compensation-packages*`** (+ `…/:id/revise` · `…/history` · `…/active`) **và** **`/api/hrm/employee-insurances*`** · paper `GET/PATCH /api/hrm/core/employees/{id}/compensation` = **alias / DOC-DELTA only** · optional thin facade `/employees/:id/compensation*` **MUST** same SoT (packages) — **FAIL** nếu Nest `@Controller('core')` second EMP/compensation SoT · **FAIL** nếu abandon LIVE packages for second compensation table |
| **O2** | Field matrix C&B | **YES** — **ALLOW on C&B SoT (not public EMP):** `base_salary` / base line · allowance lines (versioned `effective_from`/`effective_to`) · `bank_account` / `bank_name` (và display mask khi view-only) · `tax_id` / MST · SI number / enrollment status / rates **timeline** · component codes ∈ salary_components **consumer** · **DENY** same keys on public GET/PATCH `/employees*` body/DTO · list summary salary bands **only** via `include=compensation_summary` **C&B role** (RETAIN gate) |
| **O3** | Public boundary | **YES** — Public PATCH/POST `/employees*` with C&B keys → **403** **`HRM-CORE-CB-403` RETAIN** · C&B mutate **only** on F-CORE-EMP-02 / SI paths · **AC-CORE-CB-01**: mật chỉ trên màn HĐ–BH / vòng C&B đủ quyền · **AC-CORE-CB-02**: after C&B save **2xx** + **F5**, public CORE-01 UI/DTO still **no** salary/NH/MST/SI detail · Silent accept C&B on public = **FAIL** · Regression J-HRM-CORE-01-02 **must_keep** |
| **O4** | AuthZ + audit | **YES** — Membership C&B / `view_salary` (or peer permission SoT) **required** to open/mutate mật · CEO đơn vị **không** C&B → deny open salary surface + deny package mutate · access log residual (BR-BP-SEC-02) on open + mutate · mint `HRM-CORE-CB-AUTHZ-403` *(optional)* if distinct from public CB-403 — **không** rewrite sealed public `HRM-CORE-CB-403` semantics · Kiêm nhiệm: C&B CT A **↛** mật CT B (scope U19) |
| **O5** | Versioning | **YES** — Create/revise closes prior open segment · append history — **no** silent overwrite of paid/locked period → **409** peer family (mint `HRM-CORE-CB-OVERLAP-409` / RETAIN compensation overlap codes) · `effective_from` required · overlap active segments = **FAIL** · history ≥2 after revise = PASS |
| **O6** | Bank/MST physical | **YES** — **ADD** `bank_*` / `tax_id` onto compensation package header **or** ONE C&B extension table bound to package SoT — **DENY** public `employees` cols / CF as bank/MST SoT · **ba-data REQUIRED** · After save, public GET still omits bank/MST |
| **O7** | Dependents GTCG | **YES** — **RETAIN** ONE `employee_dependents` (F-CORE-DEP-01 SEALED) · C&B **may** set/consume `is_tax_dependent` for GTCG · **DENY** duplicate person entry on payroll / second deps SoT · «Đồng bộ NPT» = read ONE SoT — **không** nhập trùng trên màn C&B như person SoT mới |
| **O8** | Peers OUT | **YES** — CORE-02b metadata · CORE-01a DEC/WH · CORE-09 print deep · CORE-10 catalog **admin** invent · PAY process/payslip — **peer** seats only · SI **consumer** KEY assert RETAIN (INS-TYPE / INSURER) · F-PAY-CB-READ-01 reads active package — **OUT** invent run |
| **O9** | must_keep CORE-01 | **YES** — RETAIN public strip · **`HRM-CORE-CB-403`** · deps ONE SoT · Nest `/core` DENY · stamp **`CORE01QC1-MSL6WMS7`** · J-HRM-CORE-01-01..04 **PASS** · **DENY** claim CORE-01 public = C&B DONE · **DENY** reopen J-HRM-CORE-01-01..04 / REC seals without regression |
| **O10** | Honesty | **YES false** — `recruitment_uat_ready=false` · `jd_dynamic_done=false` · personnel/CORE module UAT **false** · **C-SLICE** · GWC slice ≠ module UAT · **≠** claim CORE-01 = C&B DONE |
| **O11** | Display-ready | **YES** — C&B DTO display-ready (labels · amounts vi-VN · effective dates `dd/MM/yyyy`) — **cấm** FE invent second SoT from payslip alone / re-aggregate allowance invent local |
| **O12** | Journeys | **YES** — DRAFT **`J-HRM-CORE-02-01..04`** (open mật + AuthZ · save version F5 · public still clean AC-CORE-CB-02 · SI/bank/tax + non-C&B deny / Nest `/core` 0 / CB-403) · U19 Group CEO rollup stated |

**Architecture SoT:** ONE LIVE compensation-packages spine · ONE employee-insurances enrollment · ONE dependents SoT (consumer) · paper `/core/…/compensation` alias only · U19 list=get=revise=insurances · soft-delete doctrine RETAIN · BR-BP-SEC-02 fail-closed · CORE-01 public strip **must_keep**.

### Primary API surface (BA lock — O1 / O6)

| Intent | Physical (normative) | Paper alias |
|--------|----------------------|-------------|
| List / create packages | **`GET/POST /api/hrm/contracts-insurance/compensation-packages`** | — |
| Revise / history / active | **`POST …/compensation-packages/:id/revise`** · **`GET …/history`** · **`GET …/active`** | — |
| Optional thin facade (same SoT) | **`GET/PATCH /api/hrm/employees/:id/compensation*`** *(if mounted — MUST packages SoT)* | `GET/PATCH /api/hrm/core/employees/{id}/compensation` |
| SI enrollment | **`GET/POST/PATCH /api/hrm/employee-insurances*`** | paper enrollment |
| SI rate period (if ADD) | Physical locked at DATA/API — append-only period | paper §3.6 |
| Public profile | **`GET/PATCH /api/hrm/employees*`** (**RETAIN SEALED** · **≠** C&B mutate) | `/core/employees/{id}` alias only |
| Dependents | **`…/employees/:id/dependents*`** (**RETAIN** · GTCG consumer) | `hrm_dependent` |
| PAY C&B read | Peer **F-PAY-CB-READ-01** | internal — **OUT** process |

**Invariant CORE-CB-PATH:** C&B mutate Network **MUST** hit packages and/or employee-insurances · Nest dual `/core` compensation SoT = **FAIL O1**.

**Invariant CORE-CB-PUBLIC:** public GET/list **MUST NOT** include C&B keys after C&B mutate · F5 still clean = **AC-CORE-CB-02**.

**Invariant CORE-CB-REJECT:** public body with C&B keys → **`HRM-CORE-CB-403`** · silent strip-and-200 = **FAIL O3**.

**Invariant CORE-CB-≠-PUB-DONE:** CORE-01 public GWC **≠** FR-UC-BP-CORE-02 DONE · claim = **FAIL O9**.

**Invariant CORE-DEP-GTCG-ONE:** GTCG consumes ONE `employee_dependents` · **DENY** second person SoT.

---

## 1. As-is vs to-be

| | AS-IS (LIVE + seals) | TO-BE (Wave-11 · Option A) |
|---|----------------------|---------------------------|
| C&B salary/PC path | LIVE packages create/revise/history/active (CD-FB-08) | **RETAIN SoT** · **UPGRADE** AuthZ/audit + bank/MST (**O1/O4/O6**) |
| Paper `/core/…/compensation` | Not Nest SoT | **Alias / DOC-DELTA only** (**O1**) |
| Bank / MST | Legacy CF / form — denied on public | **ADD** on C&B package SoT · **ba-data REQUIRED** (**O6**) |
| SI enrollment | LIVE `/employee-insurances*` | **RETAIN / UPGRADE** residual (**O1/O2**) |
| SI rate timeline | Often on enrollment row (overwrite risk) | **BA/data** — ADD period if overwrite gap (**O5/O6 sibling**) |
| Public EMP | SEALED Wave-10 strip + CB-403 | **RETAIN must_keep** · **≠** C&B DONE (**O3/O9**) |
| Dependents | SEALED ONE SoT · welfare | **RETAIN** · GTCG **consumer** (**O7**) |
| FE C&B | `view_salary` / payslip-skew residual | **UNLOCK** bind mật to packages — not public form finance (**O11**) |
| CORE-02b / PAY | Peer | **OUT** (**O8**) |
| Honesty | W1–W10 C-SLICE | **false** · C-SLICE (**O10**) |

### 1.1 C&B field matrix (logical — ba-data physicalizes bank/MST + period)

| Logical field | C&B ring | Public ring | Notes |
|---------------|----------|-------------|-------|
| `base_salary` / base line | **ALLOW** · versioned | **DENY** · CB-403 | Packages SoT |
| Allowance lines + `allowance_code` | **ALLOW** · CNS consumer | **DENY** | Invent code → peer KEY |
| `effective_from` / `effective_to` | **ALLOW** · required from | N/A public | Overlap → 409 |
| `bank_account` / `bank_name` | **ALLOW** · **ba-data ADD** | **DENY** | Mask on view-only |
| `tax_id` / MST | **ALLOW** · **ba-data ADD** | **DENY** | |
| SI number / enrollment / rates | **ALLOW** on SI SoT | **DENY** detail | Timeline · no public |
| Insurance type / insurer KEY | **ALLOW** picker CNS | N/A | CORE-10 consumer RETAIN |
| Dependent person rows | **CONSUME** ONE SoT | **ALLOW** welfare (CORE-01) | **DENY** second SoT |
| `is_tax_dependent` | **MAY** set/consume | Limited flag | GTCG · no salary leak |
| Public admin fields | N/A mutate here | **ALLOW** CORE-01 | must_keep |

**ba-data:** lock bank/MST columns (or ONE extension) on package SoT + optional SI rate period append-only · **DENY** second compensation SoT · **DENY** bank/MST on public employees · **DENY** Nest `/core` table invent.

---

## 2. Business rules (normative — SRS + SA; không invent)

| ID | Condition | Action | Outcome |
|----|-----------|--------|---------|
| **BR-BP-SEC-02** | Open/mutate vòng mật | Membership C&B required; access audit | No C&B membership → deny · FAIL O4 |
| **BR-CORE-CB-PATH** | FR-CORE-02 API | Physical packages + employee-insurances | Nest `/core` dual SoT = **FAIL O1** |
| **BR-CORE-CB-ALLOW** | C&B DTO/body | Salary/PC/bank/MST/SI on C&B SoT only | Same keys on public = **FAIL O2/O3** |
| **BR-CORE-CB-REJECT** | Public body has C&B keys | **403** `HRM-CORE-CB-403` | Silent 2xx = **FAIL O3** · AC-CORE-CB-01 |
| **BR-CORE-CB-F5** | After C&B save 2xx | Public F5 still no leak | Leak = **FAIL AC-CORE-CB-02** |
| **BR-CORE-CB-VERSION** | Revise salary/PC | Close prior · append history | Silent overwrite paid = **FAIL O5** |
| **BR-CORE-CB-BANK-MST** | Bank/MST persist | On C&B SoT only | Public CF SoT = **FAIL O6** |
| **BR-CORE-CB-GTCG** | NPT / GTCG | Consume ONE dependents | Second person SoT = **FAIL O7** |
| **BR-CORE-CB-SCOPE** | list = get = revise = SI | `resolveHrmListScope` | Cross-CT C&B leak = **FAIL** U19 |
| **BR-CORE-CB-≠-PUB-DONE** | CORE-01 GWC | Public ≠ mật DONE | Claim CORE-01 = C&B DONE = **FAIL O9** |
| **BR-CORE-CB-NO-NEST-CORE** | Any C&B mutate | No Nest `/core` dual | Dual = **FAIL O1** |
| **BR-CORE-CB-NO-SEED** | Nghiệm thu | Chuỗi FE only | Seed = **FAIL U65** |
| **BR-CORE-CB-HONESTY** | Sau GWC | Flags false | Flip ready / jd_dynamic / CORE UAT = **FAIL O10** |
| **BR-CORE-CB-PEER-OUT** | CORE-02b / PAY process | Peer seats | Pull into this WI = **FAIL O8** |
| **BR-CORE-CB-DISPLAY** | FE bind | BE display-ready | FE invent payslip SoT = **FAIL O11** |
| **BR-CORE-CB-KIEM-NHIEM** | C&B CT A | Không đọc mật CT B | Cross-CT = **FAIL** SRS |

### Error taxonomy (BA / QA assert — mint in API seat)

| Code family | HTTP | UX intent (VI) | ≠ |
|-------------|------|----------------|--|
| **`HRM-CORE-CB-403`** | **403** | Không được gửi/sửa field mật trên hồ sơ công khai (**RETAIN**) | AuthZ C&B open deny |
| **`HRM-CORE-CB-AUTHZ-403`** *(mint · optional)* | 403 | Không đủ quyền C&B mở/sửa vòng mật | Public CB-403 |
| **`HRM-CORE-CB-OVERLAP-409`** *(mint · or RETAIN peer)* | 409 | Trùng kỳ / ghi đè kỳ đã khóa | Scope 409 |
| **`HRM-CORE-CB-VAL-400`** *(mint)* | 400 | Thiếu `effective_from` / amount invalid | AuthZ |
| **`HRM-SC-COMP-KEY`** | 400 | Invent allowance component (**RETAIN** CNS) | — |
| **`HRM-INS-*` / `HRM-EINS-*`** | 4xx | SI catalog/enrollment (**RETAIN** peer) | — |
| `HRM-SCOPE-409` / 404 | 409/404 | Ngoài phạm vi | CB-403 |
| Sealed `HRM-CORE-DEP-*` / `HRM-EMP-*` public | — | **DENY** rewrite success codes | — |

---

## 3. UC-BP-CORE-02 — Acceptance criteria

### 3.0 Scope ladder (mọi AC — U19)

| Persona | User sees | Fail |
|---------|-----------|------|
| **Group CEO** (`main`) + C&B membership | C&B packages/SI trong scope rollup; public still strip | C&B without membership · public leak |
| **Member CEO không C&B** | Không mở salary surface; packages mutate deny | Xem lương CT mình khi không C&B |
| **C&B HRBP** | Chỉ membership CT · cùng resolver | Cross-CT mật |
| **Non-C&B HCNS** | Public only · CB-403 on forced C&B public | Finance on public form |

**Invariant CORE-CB-SCOPE:** list packages **=** get/revise **=** active/history **=** employee-insurances **=** public employees scope family.

**Prerequisite:** Emp tồn tại (CORE-01 / REC-07 handoff) · persona C&B in scope · **không** dùng seed · CORE-01 seal RETAIN.

### 3.1 Happy path (Diễn biến #1–#4 + Thành công)

| AC-ID | SRS # | Given | When | Then (measurable — **user sees**) | Evidence |
|-------|-------|-------|------|-------------------------------------|----------|
| **AC-CORE-02-01** | #1 · O4 | Emp in scope; role C&B | FE: HĐ–BH / vòng C&B → mở mật NV | Network GET packages and/or active **200**; form mật hiện; **access audit** recorded (L1 or audit store assert); non-C&B same open → **403** AuthZ | Browser · O4 · BR-BP-SEC-02 |
| **AC-CORE-02-02** | #2 · O1/O5 | C&B form hợp lệ + `effective_from` | Nhập lương CB + PC → **Lưu**/Tạo gói | Network **POST** `/api/hrm/contracts-insurance/compensation-packages` **2xx**; FE hiện version; toast OK | Browser · U65 · O1 |
| **AC-CORE-02-03** | #2 · O5 | Có package active | Revise lương/PC ngày hiệu lực mới → Lưu | Network **POST** `…/compensation-packages/:id/revise` **2xx**; **GET history** ≥2 (v1+v2); prior segment closed; **F5** còn | Browser · O5 |
| **AC-CORE-02-04** | #4 · AC-CORE-CB-02 · O3 | Sau C&B save 2xx | Mở hồ sơ **công khai** CORE-01 → **F5** | Public GET `/employees/:id` **không** lộ salary/NH/MST/SI vừa lưu; UI public clean | Browser + F5 · O3 · **must_keep** J-CORE-01-02 |
| **AC-CORE-02-05** | AC-CORE-CB-01 · O3 | Non-C&B / public endpoint | Forced PATCH `/employees/:id` kèm salary/bank/tax/SI | **403** **`HRM-CORE-CB-403`**; public DTO vẫn strip | L1 + browser · O3 · RETAIN |
| **AC-CORE-02-06** | O6 · input SRS | C&B surface | Nhập/sửa **bank** + **MST** → Lưu | Persist trên **C&B SoT** (package/extension) **2xx**; public GET omits; **ba-data** columns | Browser · O6 · ba-data |
| **AC-CORE-02-07** | O1/O2 · SI | C&B / SI tab | Tạo/sửa enrollment SI (type/insurer KEY) | Network **`/employee-insurances*`** **2xx**; F5 còn; **không** free-text SoT khi EFF>0 | Browser · O1 · CNS |
| **AC-CORE-02-08** | O7 · SRS NPT | Có dependents public | Màn C&B GTCG / NPT | Đọc từ ONE `employee_dependents`; có thể set `is_tax_dependent`; **không** form nhập person trùng | Browser · O7 |
| **AC-CORE-02-09** | O11 | Sau get/revise | FE bind | Amounts/dates/labels display-ready từ BE — **không** FE invent payslip SoT | Browser · O11 |
| **AC-CORE-02-10** | O1 · O9 | Alias / seals | Paper `/core/…/compensation` nếu mounted; claim CORE-01=C&B DONE | Alias **cùng** packages SoT **hoặc** DOC-DELTA — **FAIL** Nest dual; claim DONE = **FAIL O9** | L1 grep · O1/O9 |

### 3.2 Alternate

| AC-ID | Given | When | Then | Evidence |
|-------|-------|------|------|----------|
| **AC-CORE-02-ALT-01** | `include=compensation_summary` | Summary API C&B role | Bands OK for C&B only | O2 · RETAIN gate |
| **AC-CORE-02-ALT-02** | View-only C&B | Xem NH/MST | Mask một phần — không lộ full nếu policy | O2 · SRS |
| **AC-CORE-02-ALT-03** | SI rate period ADD (if DATA) | Đổi tỷ lệ theo kỳ | Append period — **không** silent overwrite history | O5 · ba-data |
| **AC-CORE-02-ALT-04** | Active cold empty | GET `/active` | **200** `data:null` — **not** 500 | RETAIN CD-FB-08 |
| **AC-CORE-02-ALT-05** | Thin facade `/employees/:id/compensation` | Mutate | Same packages SoT — **FAIL** if second write path invent | O1 |

### 3.3 Exception

| AC-ID | Given | When | Then | Evidence |
|-------|-------|------|------|----------|
| **AC-CORE-02-EX-01** | Không đủ quyền C&B | Mở/sửa mật | **403** AuthZ · no package write | O4 · BR-BP-SEC-02 |
| **AC-CORE-02-EX-02** | Public body C&B keys | PATCH `/employees*` | **403** `HRM-CORE-CB-403` | O3 · AC-CORE-CB-01 |
| **AC-CORE-02-EX-03** | Overlap / kỳ đã khóa | Revise overwrite | **409** overlap family | O5 |
| **AC-CORE-02-EX-04** | Thiếu `effective_from` / invalid amount | POST/revise | **400** VAL | O5 |
| **AC-CORE-02-EX-05** | Ngoài scope / kiêm nhiệm CT B | GET/revise packages | 404/409 · no leak | U19 · SRS #3 |
| **AC-CORE-02-EX-06** | Nest `/core` compensation SoT | Impl review | **FAIL O1** | O1 |
| **AC-CORE-02-EX-07** | Second compensation table / wipe packages | Schema | **FAIL O1** | DENY |
| **AC-CORE-02-EX-08** | Second dependents SoT for GTCG | Schema | **FAIL O7** | O7 |
| **AC-CORE-02-EX-09** | Claim CORE-01 public = C&B DONE | Review | **FAIL O9** · C-SLICE | O9 |
| **AC-CORE-02-EX-10** | Reopen sealed J-HRM-CORE-01-01..04 rewrite | Wave | **FAIL O9** | must_keep |
| **AC-CORE-02-EX-11** | Seed packages/SI để pass QA | Evidence | **FAIL U65** | O10 |
| **AC-CORE-02-EX-12** | Flip `recruitment_uat_ready` / `jd_dynamic_done` / CORE UAT | Evidence | **FAIL O10** | honesty |
| **AC-CORE-02-EX-13** | Pull CORE-02b / PAY process as required this seat | Scope | **FAIL O8** | O8 |
| **AC-CORE-02-EX-14** | F5 public after C&B save shows salary/NH/MST/SI | UI | **FAIL AC-CORE-CB-02** | O3 |
| **AC-CORE-02-EX-15** | Bank/MST SoT = public CF | Data | **FAIL O6** | O6 |
| **AC-CORE-02-EX-16** | FE invent allowance from payslip alone | FE | **FAIL O11** | O11 |

### 3.4 Diễn biến FE (U65 — mẫu nghiệm thu)

```text
#1 Open mật + AuthZ (+ audit)
Login C&B (đủ quyền) → Menu HĐ–BH / vòng C&B → mở NV trong scope
→ Network GET …/compensation-packages* (list/active) → 200
→ Assert: form mật (lương/PC) · access audit có ghi
→ (Non-C&B) cùng path → 403 AuthZ · không thấy lương

#2 Save version + F5
→ Nhập lương CB + PC + effective_from → Lưu
→ Network POST …/compensation-packages → 2xx
→ (Nếu đã có) Revise → POST …/:id/revise → 2xx → GET history ≥2
→ F5: version còn trên C&B surface

#3 Public still clean (AC-CORE-CB-02) + CB-403
→ Mở hồ sơ công khai cùng NV → F5
→ GET /api/hrm/employees/:id → không salary/bank/tax/SI
→ Forced PATCH public kèm C&B keys → 403 HRM-CORE-CB-403

#4 Bank/MST + SI + GTCG consumer + denies
→ Trên C&B: nhập NH + MST → Lưu (C&B SoT) → public vẫn omit
→ SI: POST/PATCH employee-insurances* → 2xx → F5
→ GTCG: NPT từ ONE dependents — không nhập person trùng
→ Cấm: Nest /core dual · claim CORE-01=C&B DONE · reopen J-CORE-01 · seed · honesty flip · CORE-02b/PAY invent
```

---

## 4. Validation matrix (VAL-CORE-CB-*)

| VAL-ID | Rule | Pass | Fail |
|--------|------|------|------|
| **VAL-CORE-CB-01** | Physical packages path | Network `/contracts-insurance/compensation-packages*` | Nest `/core` compensation SoT dual |
| **VAL-CORE-CB-02** | Physical SI path | Network `/employee-insurances*` | Second SI SoT invent |
| **VAL-CORE-CB-03** | Paper alias | Alias only / DOC-DELTA | Second Nest controller SoT |
| **VAL-CORE-CB-04** | AuthZ C&B | Deny non-C&B open/mutate | CEO no-C&B sees salary |
| **VAL-CORE-CB-05** | Access audit | Open/mutate logged | No audit residual |
| **VAL-CORE-CB-06** | Version revise | history ≥2 · prior closed | Silent overwrite paid |
| **VAL-CORE-CB-07** | Overlap | 409 on locked/overlap | 200 overwrite |
| **VAL-CORE-CB-08** | Bank/MST on C&B SoT | Persist package/extension | Public CF SoT |
| **VAL-CORE-CB-09** | Public F5 no leak | AC-CORE-CB-02 | Leak after C&B save |
| **VAL-CORE-CB-10** | Public CB reject | **403** `HRM-CORE-CB-403` | Silent 2xx |
| **VAL-CORE-CB-11** | GTCG ONE deps | Consume `employee_dependents` | Second person SoT |
| **VAL-CORE-CB-12** | CORE-01 ≠ DONE | Public GWC retained | Claim CORE-01 = C&B DONE |
| **VAL-CORE-CB-13** | J-CORE-01 RETAIN | No reopen rewrite | Reopen sealed without regression |
| **VAL-CORE-CB-14** | Nest `/core` DENY | 0 dual SoT | Dual EMP/compensation |
| **VAL-CORE-CB-15** | U19 scope | packages=SI=public family | Cross-CT C&B |
| **VAL-CORE-CB-16** | Peers OUT | CORE-02b/PAY peer | Pull into seat |
| **VAL-CORE-CB-17** | Display-ready | BE labels/amounts | FE invent payslip SoT |
| **VAL-CORE-CB-18** | CNS components | KEY when invent | Hardcode sole SoT |
| **VAL-CORE-CB-19** | Honesty | flags false | Flip ready / jd_dynamic / CORE UAT |
| **VAL-CORE-CB-20** | U65 | FE chain only | Seed evidence |
| **VAL-CORE-CB-21** | Second compensation DENY | ONE packages SoT | Dual table wipe |
| **VAL-CORE-CB-22** | Summary gate | C&B role only | Non-C&B salary bands |
| **VAL-CORE-CB-23** | ba-data map | Bank/MST (+ period) locked | Code before DATA |
| **VAL-CORE-CB-24** | AC-CORE-CB-01 | Mật chỉ C&B surface | Public form mutate mật |

---

## 5. Traceability — UC → BR → partner_req → AC → Journey/UF

| UC | BR | partner_req | Decision | AC (primary) | UF / J-* |
|----|-----|-------------|----------|--------------|----------|
| **UC-BP-CORE-02** | BR-BP-SEC-02 · BR-CORE-CB-* · AC-CORE-CB-01/02 | **HR-001** · **PAY-001** (read) | SA Option **A** LOCKED · O1–O12 CONFIRMED | AC-CORE-02-01..10 · ALT · EX · VAL-01..24 | **UF-HRM-CORE-02** *(DRAFT)* · **J-HRM-CORE-02-01..04** (DRAFT) |
| UC-BP-CORE-01 | BR-BP-SEC-01 | HR-001 | Peer **SEALED** `CORE01QC1-MSL6WMS7` | Public ≠ C&B DONE | **J-HRM-CORE-01-*** RETAIN — **DENY reopen** |
| UC-BP-CORE-02b | Metadata | — | **OUT** peer | — | Cite — **OUT invent** |
| UC-BP-CORE-01a | DEC→WH | — | **OUT** peer | — | Cite — **OUT** |
| UC-BP-PAY-* | Process | PAY-001 | **OUT** · F-PAY-CB-READ-01 peer | — | Cite — **OUT invent** |
| UC-BP-REC-00..07 | — | — | Sealed W1–W9 | — | must_keep |

### Journey placeholders (U19) — DRAFT

| J-ID | Click path (draft) | Pass when |
|------|--------------------|-----------|
| **J-HRM-CORE-02-01** | Login C&B → HĐ–BH / vòng C&B → mở mật NV → GET packages/active 200 + AuthZ deny non-C&B | AC-CORE-02-01 · O4 · BR-BP-SEC-02 · U65 · **≠** Nest `/core` dual |
| **J-HRM-CORE-02-02** | Tạo/revise package (lương+PC+effective_from) → POST/revise 2xx → history ≥2 → F5 còn | AC-CORE-02-02/03 · O1/O5 · U65 |
| **J-HRM-CORE-02-03** | Sau C&B save → mở public CORE-01 → F5 no leak; forced public PATCH C&B → **403** `HRM-CORE-CB-403` | AC-CORE-02-04/05 · AC-CORE-CB-02 · O3 · **must_keep** J-CORE-01-02 |
| **J-HRM-CORE-02-04** | Bank/MST trên C&B SoT + SI employee-insurances 2xx; GTCG consume ONE deps; Nest `/core` 0; no claim CORE-01=C&B DONE; no reopen J-CORE-01 | AC-CORE-02-06/07/08/10 · O6/O7/O9 · U19 |

**Group CEO:** C&B packages/SI chỉ trong scope + C&B membership; Member/HRBP không thấy mật ngoài membership; public DTO **không** C&B sau mutate.

### UF matrix note

| UF | Status | Relation |
|----|--------|----------|
| **UF-HRM-CORE-02** | ⬜ DRAFT | Browser C&B ring sau DATA+API+Dev |
| **J-HRM-CORE-01-01..04** | 🟢 SEALED Wave-10 | **DENY** reopen without regression · **≠** C&B DONE |
| Sealed W1–W9 UF/J | must_keep | **không** reopen |

---

## 6. Honesty & must_keep

| Item | Rule |
|------|------|
| `recruitment_uat_ready` | **false** |
| `jd_dynamic_done` | **false** RETAIN HOLD (`R-PLT-JD-DYNAMIC-DONE-01`) |
| Personnel / CORE module UAT | **false** |
| Claim CORE-01 public = C&B DONE | **DENIED** |
| C-SLICE | GWC CORE-02 slice ≠ module CORE/personnel UAT ≠ Phase1 DONE |
| must_keep W10 | CORE-01 public strip · **`HRM-CORE-CB-403`** · deps ONE · Nest `/core` DENY · stamp **`CORE01QC1-MSL6WMS7`** · J-HRM-CORE-01-* · **≠** C&B DONE |
| must_keep packages | LIVE `employee_compensation_packages\|lines\|history` · CD-FB-08 revise/history/active |
| must_keep SI | LIVE `/employee-insurances*` · soft-delete · U19 · CNS KEY peers |
| must_keep W1–W9 | REC seals · HTP-05 · hire soft-link · G-DB-02 no hard FK reopen |
| DENY | Nest `/core` dual · second compensation/deps SoT · write C&B on public · claim CORE-01=C&B DONE · CORE-02b/PAY invent · seed · honesty flip · apps/** this seat · reopen sealed J-CORE-01 |

---

## 7. Handoff

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** · O1–O12 **CONFIRMED** |
| **next_owner** | **ba-data** — bank/MST on C&B package SoT (+ optional SI rate period append-only) (**O6** · SI timeline) · **REQUIRED** |
| **ba-data** | **REQUIRED** |
| **Then** | **sa** — API F.1 **F-CORE-EMP-02** UPGRADE + SI residual physical · mint `HRM-CORE-CB-AUTHZ-*` / overlap **409** as needed · RETAIN `HRM-CORE-CB-403` · paper `/core/…/compensation` alias · CORE-01/DEP RETAIN |
| **Dev** | **HOLD** until DATA + API CONFIRMED |
| **evidence_path** | `docs/program/specs/PO-HRM-MVP-GD1-CORE-02-CLUSTER-BA-01.md` |
| **qa_evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-core-02-cluster-ba-01.md` |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-CORE-02-CLUSTER-DATA-01
lane: governance · ba-data
program: PO-HRM-MVP-GD1-CONTINUOUS (U89)
uc_ids: UC-BP-CORE-02
depends_on: BA-01 O1–O12 CONFIRMED · docs/program/specs/PO-HRM-MVP-GD1-CORE-02-CLUSTER-BA-01.md · peer CORE-01 SEALED CORE01QC1-MSL6WMS7
spec_ref: DB §3.2 hrm_employee_compensation · §3.6 rate period · LIVE employee_compensation_packages · F-CORE-EMP-02 · BR-BP-SEC-02 · bank/MST · AC-CORE-CB-01/02

MISSION — Physical DATA lock (docs-only):
1) ADD bank_* / tax_id home on LIVE compensation package header OR ONE C&B extension bound to packages SoT — DENY public employees cols/CF as bank/MST SoT
2) SI rate timeline: ADD append-only period table IF overwrite gap on employee_insurances; else document RETAIN enrollment-only + residual
3) RETAIN packages|lines|history ONE SoT · employee_dependents ONE (GTCG consumer) · public strip map · HRM-CORE-CB-403
4) DENY Nest /core dual · second compensation/deps SoT · claim CORE-01=C&B DONE · reopen J-CORE-01 · seed · honesty flip · apps/**
5) Unlock sa API-01 F-CORE-EMP-02 UPGRADE + SI residual — not Dev

exit: docs/program/specs/PO-HRM-MVP-GD1-CORE-02-CLUSTER-DATA-01.md · PASS_TO_PM · next sa API-01
```

---

## 8. Completion contract

| Field | Value |
|-------|--------|
| **completion_report** | O1–O12 **CONFIRMED** for UC-BP-CORE-02 against SA Option A: physical C&B mutate on `/contracts-insurance/compensation-packages*` + `/employee-insurances*` · paper `/core/…/compensation` alias only · AuthZ+audit · versioned salary/PC · bank/MST (**ba-data REQUIRED**) · SI timeline boundary · AC-CORE-CB-01/02 + **`HRM-CORE-CB-403` RETAIN** · GTCG consume ONE deps · J-HRM-CORE-02-01..04 DRAFT · DENY Nest `/core` dual · claim CORE-01=C&B DONE · reopen J-CORE-01 · honesty flip · seed · apps/** · CORE-02b/PAY invent · C-SLICE. |
| **next_owner** | **ba-data** |
| **ack_status** | **PASS_TO_PM** |
| **residual** | Physical bank/MST (+ optional SI rate period) DATA-01 · API F.1 lock (API-01) · Dev HOLD · journeys DRAFT until QA |

# BA AC/BR — PAY catalog Option B · admin open N+1 vs consumer picker (Nest SC ≠ empty)

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-CATALOG-BA-01` |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-CATALOG-SA-01` **CONFIRMED** Option **B** |
| **program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **from_role** | ba-process |
| **lane** | governance |
| **Date** | 2026-08-07 |
| **Status** | **CONFIRMED** — AC pack implementation-ready · ba-data **HOLD** · BE consumer-assert **UNLOCK** (after PM) · formula LIVE **DENIED** |
| **change_mode** | **ADD** (deepen SA §5–§7 · **no** wipe platform BA-01 / PAY-CATALOG API / QC seals) |
| **ref_sa** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-CATALOG-SA-01.md`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-CATALOG-SA-01.md) L-PAY-AC-01..10 |
| **ref_api** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-CATALOG-API-01.md`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-CATALOG-API-01.md) **F-PLT-PAY-COMP-01..04** |
| **ref_platform_ba** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-BA-01.md`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-BA-01.md) **AC-PLT-PAY-01** · **BR-PLT-02/04/05** |
| **ref_srs** | [`SRS_HRM_ENTERPRISE.md`](../../client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md) **FR-UC-BP-PAY-02** dual SoT · **AC-PAY-COMP-01** · cross **FR-UC-BP-PAY-06** |
| **ref_peers** | EMP DOC/ET · DEC · Allowance SYNC PC→SC · O4 e2e-link (Settings-only SoT **REJECT**) |
| **Honesty** | `payroll_e2e_ready=false` · formula LIVE **DENIED** · printable=false · J-HRM-07 FULL GWC **RETAIN** · EXT·EMP·DEC·CTR·LIST-TOTALS·PAY-CATALOG QC **SEAL RETAIN** · **`C-SLICE-≠-MODULE`** · U65 |
| **Cấm** | `apps/**` · seed · ba-data second catalog table · Settings extension = sole picker SoT · invent formula LIVE · flip ready · reopen seals |

---

## 0. Process objective & actors

### Objective

Khóa **AC/BR đo được** cho Option **B** (SA LOCKED):

1. **Catalog admin** (`F-PLT-PAY-COMP-02`) = **open CREATE N+1** — mã slug HR đặt OK (**BR-PLT-05** · **VAL-PAY-COMP-01** · **L-PAY-AC-01**).
2. **Consumers** khi Nest `salary_components` **effective active count > 0** = **picker/FK only** từ **`GET /api/hrm/payroll/salary-components`** (**F-PLT-PAY-COMP-01**) — **cấm** Input free-text làm SoT mã (**BR-PLT-02** · **AC-PLT-PAY-01** · **AC-PAY-COMP-01**).
3. **Settings** extension `salary_components` / `payroll_components` = **không** SoT picker duy nhất (**Option A REJECT** · **L-PAY-AC-02**).
4. Dual SoT layer 2: **`pay_types`** = nature / `component_type` REF (**L-PAY-AC-03**).
5. **DENY** formula LIVE / e2e flip / seal reopen / seed density.

### Actors

| Actor | Role |
|-------|------|
| HCNS / C&B Settings-PAY admin | CRUD Nest `salary_components` (mở N+1) · retire soft |
| C&B nghiệp vụ | Gắn mã TP trên mẫu phiếu / kỳ / C&B NV / (soft) formula refs |
| Group CEO | Scope rollup `main` / member — cùng resolve list↔assert (**U19**) |
| System | Effective active set · soft-delete hide picker · `HRM-SC-COMP-KEY` on invent |
| Allowance peer | PC/KT Settings writer → mirror Nest SC (**ADD** path) |
| SA / Dev-BE / Dev-FE / QA | F.1 cite · CNS assert · picker rebind · U65 browser |

### Scope

| In (this seat) | Out |
|----------------|-----|
| AC-PLT-PAY-01 / 01b / 01c / 01H · AC-PAY-COMP-01 · VAL-PAY-CNS-* · BR-PLT-PAY-* | Impl `apps/**` / migration / seed |
| Surface matrix admin vs consumer (exact UF/J-*) | Claim payroll module UAT / AMIS DONE / formula LIVE |
| Error taxonomy `HRM-SC-COMP-KEY` | Reopen PAY-CATALOG QC · EXT · EMP · DEC · CTR · LIST-TOTALS · J-HRM-07 flip |
| ba-data **HOLD** (already physical) | Second table / mega-EAV / Settings-only SoT revive |
| Optional ba-docs DOC-DELTA flag | Wipe FR-UC-BP-PAY-02 / AC-PAY-COMP-01 client wording |

---

## 1. As-is vs to-be

| | AS-IS | TO-BE (Option B) |
|---|-------|------------------|
| Code SoT | FE `CatalogSearchPicker` historically keys **Settings** `salary_components` (O4 key ABSENT → free-text persist) while Nest SC rows exist | Code SoT = Nest via **F-PLT-PAY-COMP-01**; FE rebind Nest list |
| Admin create | Nest POST open (**PAY-CATALOG GWC**) | **Retain** open N+1 (**AC-PLT-PAY-01c**) — **≠** consumer free-text ban |
| Consumer lines | Template / C&B / formula often free-text or Settings-bound | When Nest active **>0**: picker/FK ∈ catalog; invent → **4xx** |
| Empty Nest | Risk fake starter / seed to «pass» picker | Empty picker + VI guidance; admin CREATE vẫn được (**AC-PLT-PAY-01b**) |
| Formula | Peer staged; risk claim LIVE via this AC | Soft warn refs GĐ1 OK; **FORBIDDEN** evaluator LIVE / process GO |
| Honesty | Slice GWC risk misread module GO | `payroll_e2e_ready=false` · **`C-SLICE-≠-MODULE`** |

**AS-IS stamp (không «sửa bằng seed»):** [`po-hrm-e2e-link-pay-cfg-qa-02.md`](../../qa/evidence/po-hrm-e2e-link-pay-cfg-qa-02.md) **O4-CATALOG-DENSITY-01** — Settings density ≠ Nest SoT. Option B **đóng** residual bằng rebind Nest, **không** revive Option A.

---

## 2. Platform locks (reuse)

| ID | Condition | Action | Outcome |
|----|-----------|--------|---------|
| **BR-PLT-02** | Nest SC effective active **>0** | Consumer SoT = picker/FK `code` ∈ Nest | Free-text invent → **4xx** |
| **BR-PLT-04** | Retire / `is_active=false` | Soft-delete | Picker default ẩn; history/read cũ còn mã (**L-PAY-AC-05**) |
| **BR-PLT-05** | Admin CREATE | Open slug N+1 · format/UQ only | **FORBIDDEN** ceiling / «must pick existing only» on **F-PLT-PAY-COMP-02** |
| **L-PAY-AC-01** | Admin path vs consumer path | Split AC/VAL | Mis-apply invent ban lên admin = **FAIL process** |
| **L-PAY-AC-02** | Picker SoT | Nest F-PLT-PAY-COMP-01 | Settings extension alone **REJECT** |
| **L-PAY-AC-03** | Nature | `pay_types` REF | Keep dual SoT layer 2 |
| **L-PAY-AC-04** | Active count =0 | Empty picker + guidance | **FORBIDDEN** fake/seed density UF |
| **L-PAY-AC-06** | Scope | list ↔ get-by-id ↔ consumer assert | Same `resolveHrmListScope` (**U19**) |
| **L-PAY-AC-07** | Allowance PC save | Mirror Nest SC | ADD path · **not** wipe PAY-CATALOG |
| **L-PAY-AC-08..10** | Formula / seals / honesty | OUT / RETAIN / false | See §8 |

---

## 3. PAY-specific business rules

| ID | Condition | Action | Outcome |
|----|-----------|--------|---------|
| **BR-PLT-PAY-01** | Surface = **catalog admin** (`POST/PATCH` F-PLT-PAY-COMP-02/03) | Cho phép mã mới hợp lệ slug (N+1) | **2xx/201** · list + F5 còn — **không** yêu cầu «đã có trong picker» |
| **BR-PLT-PAY-02** | Surface ∈ **consumer set** (§4) **và** Nest active **>0** | Body/field `component_code` (hoặc alias SA khóa) **phải** ∈ effective active ∪ retired-allowed-read policy | Ngoài set → **`HRM-SC-COMP-KEY`** (peer `HRM-COMP-004` class OK nếu map 1:1) — format-only **không** bypass |
| **BR-PLT-PAY-03** | Nest active **=0** trên consumer | Empty picker + VI «tạo danh mục Nest trước»; **không** bắt buộc invent | Seed/fake rows để pass UF = **FAIL U65** |
| **BR-PLT-PAY-04** | Settings extension `salary_components` density | Optional REF/alias / Allowance peer writer | **FORBIDDEN** sole SoT cho consumer picker |
| **BR-PLT-PAY-05** | Formula author `component_code` refs | GĐ1: soft warn nếu mã ∉ Nest (UI); BE hard assert **optional** cùng wave hoặc residual | **FORBIDDEN** treat as formula **LIVE** / evaluate GO |
| **BR-PLT-PAY-06** | Hire→period / template-on-period path | Dòng thành phần trên mẫu/kỳ tuân **AC-PAY-COMP-01** (SRS PAY-06 cross) | Free-text mã trên đường nhận việc→kỳ = **FAIL** khi Nest >0 |
| **BR-PLT-PAY-07** | Retire Nest SC còn FK history | Soft-delete; consumer **không** chọn mã retired trên create mới | History/compensation/payslip cũ vẫn đọc được mã |
| **BR-PLT-PAY-08** | ba-data | `public.salary_components` đã physical | **HOLD** — **FORBIDDEN** second catalog table trừ EXPAND flag (this seat: **no EXPAND**) |

**SUPERSEDED / FORBIDDEN:** Option A Settings-only picker SoT · invent formula LIVE từ seat này · claim `payroll_e2e_ready=true` · reopen seals · hard-delete SC còn history.

---

## 4. Consumer surface inventory (authoritative)

> **Admin ≠ consumer.** Mọi AC «picker khi Nest ≠ empty» áp **consumer rows** dưới đây — **không** áp lên F-PLT-PAY-COMP-02.

| Surf ID | Surface (product) | Route / UI anchor (AS-IS) | Field SoT | Mutate path (cite) | Class |
|---------|-------------------|--------------------------|-----------|-------------------|-------|
| **S-PAY-ADM-01** | Nest salary component **admin** create/edit/retire | HRM Payroll → tab **Thành phần lương** (`SalaryComponentsTab`) · API Nest | `code` open N+1 | **F-PLT-PAY-COMP-02/03/04** | **ADMIN** |
| **S-PAY-CNS-01** | **Pay sheet template** lines | Payroll → **Mẫu phiếu / SalaryTemplates** (`SalaryTemplatesTab` / `SalaryTemplateBuilder`) | Line `component_code` / component id→code | Template line create/patch | **CONSUMER** |
| **S-PAY-CNS-02** | **Period / batch** bind + input packs | Payroll → **Kỳ / đợt** (`PayrollBatchesTab` · period form `pay_sheet_template_id` + period input lines) | Template FK + pack line codes | Period create/patch · pack lines | **CONSUMER** |
| **S-PAY-CNS-03** | **Employee compensation** package lines | NV → HĐ → tab **Đãi ngộ** (`EmployeeCompensationPanel`) | Line `component_code` | Compensation package save | **CONSUMER** |
| **S-PAY-CNS-04** | **Compensation / salary history** lines | NV → tab **Lịch sử đãi ngộ** (`EmployeeCompensationHistoryPanel`) | History line `component_code` | History create/patch | **CONSUMER** |
| **S-PAY-CNS-05** | **Formula author** component refs | Payroll → formula author (`PayFormulaAuthorPanel` / `FormulaInput`) | Expression / line `component_code` | Formula draft save (staged) | **CONSUMER-SOFT** |
| **S-PAY-REF-01** | Settings extension `salary_components` | Settings → Danh mục nghiệp vụ | Extension items | Settings upsert | **REF/ALIAS only** — **not** picker SoT |
| **S-PAY-REF-02** | Allowance PC/KT → Nest mirror | Settings PC/KT | Shared `code` | ALLOWANCE-SYNC TX | **ADD writer** into Nest — peer · not wipe |

**Hire→Pay pointer:** FR-UC-BP-PAY-06 / HTP bước kỳ — dòng thành phần trên mẫu/kỳ = **S-PAY-CNS-01/02** (BR-PLT-PAY-06). ESS payslip **read** lines = display history — **not** invent write SoT (must_keep ESS GWC; no reopen).

---

## 5. Use-case catalog (process)

| UC ID | Name | Happy | Alternate | Exception |
|-------|------|-------|-----------|-----------|
| **UC-PLT-PAY-01** | Admin — CREATE Nest TP N+1 | Admin mở Payroll Thành phần → nhập mã mới hợp lệ + `pay_types` → Lưu **201** → list có row → **F5** còn | Sửa label/nature | Format `HRM-SC-CODE-INVALID` · UQ `HRM-SC-002` · `HRM-PAY-TYPE-KEY` · scope 409 |
| **UC-PLT-PAY-02** | Consumer — template line pick Nest | Nest active ≥1 → mở mẫu → thêm dòng → **picker** từ F-PLT-PAY-COMP-01 → Lưu **2xx** → F5 code ∈ catalog | Filter inactive hidden | Free-text SoT · invent → **4xx** `HRM-SC-COMP-KEY` |
| **UC-PLT-PAY-03** | Consumer — compensation line | Nest ≥1 → Đãi ngộ/Lịch sử → chọn mã Nest → Lưu **2xx** → F5 | Derive từ allowance mirror code ∈ Nest | Invent unknown → **4xx** |
| **UC-PLT-PAY-04** | Empty Nest consumer | Active=0 → picker empty + VI; admin vẫn CREATE | — | Seed fake density / Settings-only green |
| **UC-PLT-PAY-05** | Retire Nest | Retire → picker ẩn → history còn mã | Reactivate | Hard-delete · history crash |
| **UC-PLT-PAY-06** | Formula soft refs | Draft formula refs mã ∉ Nest → soft warn (GĐ1) | — | Claim LIVE / evaluate GO / flip e2e |
| **UC-PLT-PAY-07** | Scope parity | List Nest codes scope X = assert consumer scope X | Member 409 out-of-scope | Drift list vs assert |

```mermaid
sequenceDiagram
  autonumber
  actor Admin as C&B admin catalog
  actor HR as C&B consumer form
  participant Nest as Nest salary_components
  participant Cons as Template/Period/C&B/Formula

  Admin->>Nest: POST F-PLT-PAY-COMP-02 mã N+1 (open)
  alt Ceiling / must-pick-only sai áp admin
    Nest-->>Admin: FAIL — vi phạm BR-PLT-05 / L-PAY-AC-01
  else 201
    Nest-->>Admin: Row active; F5 còn
  end
  HR->>Nest: GET F-PLT-PAY-COMP-01 (picker SoT)
  alt Active count = 0
    Nest-->>HR: Empty + VI; cấm seed
  else Active count > 0
    HR->>Cons: Lưu dòng với code ∈ catalog
    alt Code invent / OOS
      Cons-->>HR: 4xx HRM-SC-COMP-KEY
    else OK
      Cons-->>HR: 2xx; F5 code ∈ Nest
    end
  end
  Note over Cons: Formula LIVE / e2e flip OUT
```

---

## 6. Acceptance criteria (measurable · U65)

> Browser-only khi surface FE tồn tại · zero-seed · FE sau 2xx/4xx quan sát được + **F5** · probe/API **không** 🟢 UF.  
> Honesty flags **giữ false**.  
> **Không** wipe sealed PAY-CATALOG / EXT / EMP / DEC / CTR / LIST-TOTALS.

### 6.1 Core AC pack

| ID | Surface | Đạt khi | Không đạt khi |
|----|---------|---------|----------------|
| **AC-PLT-PAY-01** | **S-PAY-CNS-01** (primary) + spot **S-PAY-CNS-02** | Nest active **≥1** (đã có từ admin / Allowance mirror — **không** seed trong evidence): mở **Mẫu phiếu** → Thêm dòng thành phần → UI = **picker** nguồn **Network GET** `/api/hrm/payroll/salary-components` (hoặc client hook cùng path) → chọn mã Nest → Lưu **2xx** → list/detail hiện đúng `component_code` → **F5** còn ∈ catalog | Free-text Input là SoT mã · picker chỉ Settings extension density · 2xx với mã Nest không tồn tại · chỉ API PASS |
| **AC-PLT-PAY-01b** | **S-PAY-CNS-01** khi Nest active **=0** | Picker **empty** + VI hướng dẫn tạo danh mục Nest (admin path); **không** hiện fake starter chỉ để pass UF; admin **S-PAY-ADM-01** vẫn CREATE được | Seed/script density · fake rows · Settings-only «green» khi Nest=0 |
| **AC-PLT-PAY-01c** | **S-PAY-ADM-01** | Catalog admin CREATE mã **#N+1** (slug hợp lệ, không thuộc starter) → Network **201** `F-PLT-PAY-COMP-02` → list có row → **F5** còn → **không** bị reject «must pick existing only» | Áp AC-PAY-COMP-01 invent ban lên admin · ceiling starter · reopen PAY-CATALOG GWC wording |
| **AC-PLT-PAY-01H** | Honesty / seals | Evidence ghi rõ: `payroll_e2e_ready=false` · formula LIVE **DENIED** · J-HRM-07 FULL GWC **RETAIN** · EXT·EMP·DEC·CTR·LIST-TOTALS·PAY-CATALOG **SEAL RETAIN** · **`C-SLICE-≠-MODULE`** · U65 zero-seed | Flip ready · invent LIVE · reopen seals · claim module PAY UAT |
| **AC-PAY-COMP-01** | **S-PAY-CNS-01** + **S-PAY-CNS-03** (min 1) | Nest active **≥1**: cố ý nhập/POST mã **không** ∈ Nest active set → FE chặn và/hoặc Network **4xx** `HRM-SC-COMP-KEY` (peer class OK) → **không** persist sau F5 | 2xx invent · silent accept · format-only bypass membership |

### 6.2 Consumer VAL (BE/QA measurable)

| ID | Surface | Input | Expect | AC / BR |
|----|---------|-------|--------|---------|
| **VAL-PAY-CNS-01** | Template line **S-PAY-CNS-01** | `component_code` OOS khi Nest >0 | **4xx** `HRM-SC-COMP-KEY` | AC-PLT-PAY-01 · AC-PAY-COMP-01 · BR-PLT-PAY-02 |
| **VAL-PAY-CNS-02** | Compensation / history **S-PAY-CNS-03/04** | Invent unknown `component_code` | **4xx** same taxonomy | AC-PAY-COMP-01 · BR-PLT-PAY-02 |
| **VAL-PAY-CNS-03** | Scope | List Nest scope ≠ assert scope on consumer write | jest **FAIL** scope_parity · runtime 409/4xx deterministic | L-PAY-AC-06 · U19 |
| **VAL-PAY-CNS-04** | Period / pack **S-PAY-CNS-02** | Pack line invent code khi Nest >0 | **4xx** | BR-PLT-PAY-06 · AC-PAY-COMP-01 |
| **VAL-PAY-CNS-05** | Retire | Create consumer line với mã retired (default list) | Reject / not in default picker | BR-PLT-04 · BR-PLT-PAY-07 |
| **VAL-PAY-CNS-06** | Settings-only SoT | FE bind Settings extension **without** Nest list when Nest >0 | **FAIL** AC-PLT-PAY-01 (O4 class residual) | L-PAY-AC-02 · BR-PLT-PAY-04 |
| **VAL-PAY-CNS-07** | Formula soft **S-PAY-CNS-05** | Ref mã ∉ Nest on draft | Soft warn OK GĐ1; **no** LIVE claim | BR-PLT-PAY-05 · L-PAY-AC-08 |
| **VAL-PAY-COMP-01** | Admin **S-PAY-ADM-01** | Code N+1 valid | **201** — retain API VAL | AC-PLT-PAY-01c · BR-PLT-05 |

### 6.3 must_keep / regression pointers (không AC mới)

| Pointer | Pass | Fail |
|---------|------|------|
| **MK-PAY-CAT-GWC-01** | PAY-CATALOG QC GWC + F-PLT-PAY-COMP-* paths retained | Reopen/wipe catalog admin GWC |
| **MK-PAY-TYPE-01** | `component_type` ∈ `pay_types` trên admin create | Free-text nature |
| **MK-ALLOW-SYNC-01** | PC mirror → Nest ADD path | Dual-write wipe / second SoT writer as sole picker |
| **MK-ESS-GWC-01** | ESS browser GWC retain | Reopen ESS / flip e2e via this seat |
| **MK-J-HRM-07-01** | J-HRM-07 FULL GWC retain (list→payslip) | Flip journey GO / reopen from catalog AC |
| **MK-SEAL-PEER-01** | EXT · EMP · DEC · CTR · LIST-TOTALS seals retain | Reopen peer seals |

### 6.4 Journey / UF map (QA + ba-docs)

| ID | Maps | Notes |
|----|------|-------|
| **Proposed `J-HRM-PAY-COMP-01`** | Admin CREATE N+1 → F5 → consumer picker thấy mã (**AC-PLT-PAY-01c** → **AC-PLT-PAY-01**) | ba-docs ADD journey row after CONFIRM |
| **Proposed `J-HRM-PAY-COMP-02`** | Invent code trên template/C&B → 4xx (**AC-PAY-COMP-01**) | |
| **Proposed `J-HRM-PAY-COMP-03`** | Nest=0 empty picker + admin still CREATE (**AC-PLT-PAY-01b**) | |
| Reuse | **UF-HRM-06** / **J-HRM-07** | Payslip **read** spine — **RETAIN**; **cấm** dùng để claim formula LIVE / e2e flip |
| Cross-nav U19 | Template/C&B list → detail row sau Lưu | AC mỗi list mutate kèm deep link/F5 |

**Persona:** Group CEO `ceo@xe.vn` (rollup) + member C&B khi test scope 409 — AC ghi rõ scope expect.

---

## 7. Error taxonomy (deterministic)

| Code | When | HTTP | FE |
|------|------|------|-----|
| **`HRM-SC-COMP-KEY`** | Consumer invent / OOS `component_code` khi Nest active >0 | **4xx** | Banner/field VI — không toast success |
| Peer `HRM-COMP-004` | Allowed **alias map 1:1** nếu live đã emit — document equivalence in BE evidence | 4xx | Same |
| `HRM-SC-CODE-INVALID` | Admin format only | 4xx | Admin form |
| `HRM-SC-002` | Admin UQ | 4xx | Admin form |
| `HRM-PAY-TYPE-KEY` | Nature ∉ `pay_types` | 4xx | Admin / dual SoT |
| Scope mismatch | Consumer assert company ≠ token scope | 409 class | Honest empty/banner |

**Cấm:** 2xx + orphan code; 500 trên invent; FE format-pass bỏ qua membership.

---

## 8. Honesty / non-claims / seals

| Flag / seal | Rule |
|-------------|------|
| `payroll_e2e_ready` | **false** — **DENIED** flip |
| Formula LIVE / process payslip GO | **DENIED** — AC-PLT-PAY-01 ≠ evaluator |
| `contracts_printable_ready` / personnel / ATT / REC ready | **Unchanged false** — out of seat |
| J-HRM-07 FULL GWC | **RETAIN** — no flip / reopen |
| PAY-CATALOG QC · EXT · EMP · DEC · CTR · LIST-TOTALS | **SEAL RETAIN** |
| `C-SLICE-≠-MODULE` | Catalog AC pack ≠ module PAY UAT / Phase1 |
| Seed | **DENIED** (U65) |
| ba-data | **HOLD** — **no EXPAND** flagged this seat |

---

## 9. DOC-DELTA flag (optional ba-docs)

| Flag | Need? | Note |
|------|-------|------|
| Client SRS admin vs consumer wording | **OPTIONAL** | FR-UC-BP-PAY-02 / AC-PAY-COMP-01 đã khóa consumer when catalog >0; ADD-only sentence «danh mục chuẩn = Nest salary_components; Settings extension ≠ sole SoT» **if** sponsor/client ambiguity — **không** wipe 7-mục FR |
| ba-data EXPAND | **NO** | Physical exists |

---

## 10. Handoff expectations

| Role | Expect | Done when |
|------|--------|-----------|
| **pm** | Seal BA CONFIRMED · unlock CNS-BE (+ FE rebind) | Bus DISPATCHED |
| **dev-be** | Assert ∈ Nest on **S-PAY-CNS-*** writes · jest VAL-PAY-CNS-01..05 · scope_parity | READY_FOR_QA |
| **dev-fe** | Rebind consumer pickers → F-PLT-PAY-COMP-01; admin keep open create; Settings-only SoT removed from consumer | READY_FOR_QA |
| **qa** | U65 AC-PLT-PAY-01/01b/01c/01H · AC-PAY-COMP-01 · zero-seed · no LIVE claim | PASS_TO_PM / FAIL |
| **qc** | Slice GWC only · honesty false · seals retain | GWC ≠ module GO |
| **ba-data** | **HOLD** | No Task unless EXPAND reopen |
| **ba-docs** | Optional DOC-DELTA §9 | After PM if flagged |

---

## 11. Open risks / clarifications

| # | Item | Disposition |
|---|------|-------------|
| R1 | Compensation hardcode starter lines (`phu_cap_*`) vs Nest membership | CNS-BE/FE must map/derive codes ∈ Nest or fail closed when Nest >0 — **not** silent invent |
| R2 | Formula soft vs hard assert timing | GĐ1 soft warn OK (**VAL-PAY-CNS-07**); hard assert may ship with CNS-BE or residual — **still DENY LIVE** |
| R3 | O4 Settings synthesize still present in AS-IS | Allowed as REF; **must not** drive consumer picker SoT |
| Q1 | Exact live error string alias | BE may map peer code → document in CNS-BE evidence |

**Unresolved needing sponsor:** none for Option B AC — architecture LOCKED by SA.

---

## 12. Completion

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** · **CONFIRMED** |
| **ba-data** | **HOLD** (no EXPAND) |
| **next_owner** | **pm** → **dev-be** `PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-CATALOG-CNS-BE-01` (+ **dev-fe** rebind parallel OK) |
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-pay-catalog-ba-01.md` |

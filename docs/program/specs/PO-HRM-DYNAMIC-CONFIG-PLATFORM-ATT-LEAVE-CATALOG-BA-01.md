# BA AC/BR — ATT leave catalog Option B · admin open N+1 vs consumer picker (Nest EFF ≠ empty)

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-CATALOG-BA-01` |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-CATALOG-SA-01` **CONFIRMED** Option **B** |
| **program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **from_role** | ba-process |
| **lane** | governance |
| **Date** | 2026-08-08 |
| **Status** | **CONFIRMED** — AC pack implementation-ready · ba-data **HOLD** · BE consumer-deepen **UNLOCK only for BA-listed gaps** · leave create assert **RETAIN** · FE LeaveTab EFF bind **RETAIN** (verify) · ATT UAT / WAIVE reopen **DENIED** |
| **change_mode** | **ADD** (deepen SA §7 · **no** wipe platform BA-01 / ATT-VERTICAL / ATT-QC seals) |
| **ref_sa** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-CATALOG-SA-01.md`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-CATALOG-SA-01.md) L-ATT-LEAVE-01..10 · §7 AC/VAL |
| **ref_sa_evidence** | [`po-hrm-dynamic-config-platform-att-leave-catalog-sa-01.md`](../../qa/evidence/po-hrm-dynamic-config-platform-att-leave-catalog-sa-01.md) |
| **ref_vertical** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-VERTICAL-SA-01.md`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-VERTICAL-SA-01.md) **F-ATT-CAT-LVT/EFF** · **AC-PLT-ATT-01..03** |
| **ref_platform_ba** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-BA-01.md`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-BA-01.md) **BR-PLT-02/04/05/06** · ATT §2.3 |
| **ref_peer_pay** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-CATALOG-BA-01.md`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-CATALOG-BA-01.md) **AC-PLT-PAY-01*** (named peer) |
| **ref_srs** | [`SRS_HRM_ENTERPRISE.md`](../../client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md) **FR-UC-BP-ATT-04/04b/05/05b/06/07/08/09** |
| **ref_db** | [`DB_DESIGN_HRM_ENTERPRISE.md`](../../client-delivery/hrm-enterprise-blueprint/DB_DESIGN_HRM_ENTERPRISE.md) §4.4 `att_leave_type` · leave_requests soft FK |
| **Honesty** | `attendance_uat_ready=false` · leave WAIVE / sign / **J-HRM-06c** **SEAL RETAIN** · EMP·DEC·PAY·EXT·CTR·LIST-TOTALS **SEAL RETAIN** · ATT-QC-01/02 **SEAL RETAIN** · **`C-SLICE-≠-MODULE`** · U65 · DENY module ATT UAT |
| **Cấm** | `apps/**` · seed · ba-data second leave catalog table · Settings MD `leave_types` = sole picker SoT · invent UAT / reopen WAIVE·sign·J-06c · reopen peer seals |

---

## 0. Process objective & actors

### Objective

Khóa **AC/BR đo được** cho Option **B** (SA LOCKED):

1. **Catalog admin** (`F-ATT-CAT-LVT-02`) = **open CREATE N+1** — mã slug HR đặt OK (**BR-PLT-05** · **AC-PLT-ATT-01** · **AC-PLT-ATT-LEAVE-01d** · ATT-QC-02 retain).
2. **Consumers** khi Nest/EFF **effective active count > 0** = **picker/FK only** từ **`GET /api/hrm/attendance/leave-types/effective`** (**F-ATT-CAT-EFF-01**) — **cấm** Input free-text / Settings MD density làm SoT mã (**BR-PLT-02** · **AC-PLT-ATT-LEAVE-01** · **AC-PLT-ATT-03**).
3. Invent unknown `leave_type` → **4xx** **`HRM-LEAVE-TYPE-UNKNOWN`** (**AC-PLT-ATT-LEAVE-01b** · **VAL-ATT-CNS-01**).
4. Empty EFF → empty picker + VI / CTA admin; **cấm** seed/fake density (**AC-PLT-ATT-LEAVE-01c** · **L-ATT-LEAVE-04**).
5. **DENY** `attendance_uat_ready` flip · WAIVE/sign/J-06c reopen · Settings-MD-only SoT · second leave table.

### Actors

| Actor | Role |
|-------|------|
| HCNS Settings — tab **Loại phép ATT** | CRUD Nest `att_leave_type` (mở N+1) · retire soft |
| NV / QL / HCNS — tab **Nghỉ phép** | Chọn loại phép ∈ EFF · nộp đơn · xem panel quỹ · hold khi gửi |
| Group CEO | Scope rollup `main` / member — cùng resolve list↔assert (**U19**) |
| System | Effective union (ATT wins vs group REF) · soft-delete hide · `HRM-LEAVE-TYPE-UNKNOWN` |
| SA / Dev-BE / Dev-FE / QA | F.1 cite · assert retain/deepen · picker source · U65 browser |

### Scope

| In (this seat) | Out |
|----------------|-----|
| AC-PLT-ATT-LEAVE-01 / 01b / 01c / 01d / 01H · VAL-ATT-CNS-01..03 · BR-PLT-ATT-LEAVE-* · surface matrix | Impl `apps/**` / migration / seed |
| Enumerate UF: create · balance panel · hold · sick class | Claim module ATT UAT / flip `attendance_uat_ready` |
| Cross-ref AC-PLT-ATT-01..03 · peer AC-PLT-PAY-01 · SRS FR-UC-BP-ATT-04..09 | Reopen ATT WAIVE / sheet-sign / J-HRM-06c |
| ba-data **HOLD** (already physical) | Work sites deepen · work_shifts ops · F-ATT-CAT-LVT redesign |
| Align AC-PLT-ATT-03 ≡ invent rule stamped as **01b** browser | Wipe vertical AC-01/02 GWC |

---

## 1. As-is vs to-be

| | AS-IS | TO-BE (Option B) |
|---|-------|------------------|
| Code SoT | Nest `att_leave_type` + **F-ATT-CAT-EFF-01** LIVE; LeaveTab binds `useAttLeaveTypesEffective`; Settings MD `leave_types` still exists as REF/helpers | Code SoT = Nest via **F-ATT-CAT-LVT-01 / F-ATT-CAT-EFF-01**; MD alone **REJECT** as picker SoT |
| Admin create | Settings **Loại phép ATT** open N+1 (**ATT-QC-02** stamp `ATTPLATQA2-MSIVNE4A`) | **Retain** open N+1 (**AC-PLT-ATT-LEAVE-01d** · **AC-PLT-ATT-01**) — **≠** consumer free-text ban |
| Consumer create | BE `createLeaveRequest` asserts ∈ EFF → `HRM-LEAVE-TYPE-UNKNOWN` (jest VAL-ATT-LVT-08) | Named pack **AC-PLT-ATT-LEAVE-01/01b** + browser U65 stamp; assert **RETAIN** |
| Balance / hold | Panel GET by selected type; hold on submit (FR-UC-BP-ATT-05b/09) | Same create TXN invent rule; panel **picker-only** bind — no free-text SoT |
| Sick class | FR-UC-BP-ATT-07 + attach rules (`HRM-LEAVE-VAL-ATT`) | `leave_type` ∈ EFF; flags/`is_sick` from catalog row — invent type still **UNKNOWN** |
| Honesty | Slice GWC risk misread module GO | `attendance_uat_ready=false` · **`C-SLICE-≠-MODULE`** · WAIVE seals retain |

---

## 2. Platform locks (reuse)

| ID | Condition | Action | Outcome |
|----|-----------|--------|---------|
| **BR-PLT-02** | Nest/EFF active **>0** | Consumer SoT = picker/FK `leave_type` ∈ effective | Free-text invent → **4xx** `HRM-LEAVE-TYPE-UNKNOWN` |
| **BR-PLT-04** | Retire / `archived_at` | Soft-delete | Picker default ẩn; history leave_requests / balance còn key (**AC-PLT-ATT-02**) |
| **BR-PLT-05** | Admin CREATE | Open slug N+1 · format/UQ only | **FORBIDDEN** ceiling / «must pick existing only» on **F-ATT-CAT-LVT-02** |
| **BR-PLT-06** | Dual SoT | Group REF `leave_types` merge-read; ATT wins collision | **FORBIDDEN** dual master write / MD sole SoT |
| **L-ATT-LEAVE-01** | Admin path vs consumer path | Split AC/VAL | Mis-apply invent ban lên admin = **FAIL process** |
| **L-ATT-LEAVE-02** | Picker SoT | Nest F-ATT-CAT-EFF-01 | Settings MD alone **REJECT** |
| **L-ATT-LEAVE-04** | Active count =0 | Empty picker + VI / CTA admin | **FORBIDDEN** fake/seed density UF |
| **L-ATT-LEAVE-06** | Scope | list ↔ get-by-id ↔ consumer assert | Same `resolveHrmListScope` (**U19**) |
| **L-ATT-LEAVE-07** | Invent KEY | Membership check | Format-only **không** bypass |
| **L-ATT-LEAVE-08..10** | Ops OUT / seals / honesty | OUT / RETAIN / false | See §8 |

---

## 3. ATT leave-specific business rules

| ID | Condition | Action | Outcome |
|----|-----------|--------|---------|
| **BR-PLT-ATT-LEAVE-01** | Surface = **catalog admin** (`POST/PUT` F-ATT-CAT-LVT-02) | Cho phép mã mới hợp lệ slug (N+1) | **2xx/201** · list + F5 còn — **không** yêu cầu «đã có trong picker» |
| **BR-PLT-ATT-LEAVE-02** | Surface ∈ **consumer set** (§4) **và** EFF active **>0** | Body/field `leave_type` **phải** ∈ effective active (default picker) | Ngoài set → **`HRM-LEAVE-TYPE-UNKNOWN`** — format-only **không** bypass |
| **BR-PLT-ATT-LEAVE-03** | EFF active **=0** trên consumer | Empty picker + VI/CTA «Cài đặt → Loại phép ATT»; **không** bắt buộc invent | Seed/fake rows để pass UF = **FAIL U65** |
| **BR-PLT-ATT-LEAVE-04** | Settings MD / REF `leave_types` density | Merge-read into EFF only | **FORBIDDEN** sole SoT cho consumer picker |
| **BR-PLT-ATT-LEAVE-05** | **FR-UC-BP-ATT-05b** panel quỹ | Panel **đọc** theo `leave_type` đã chọn từ picker EFF; đổi loại → tính lại panel | Free-text loại làm SoT panel = **FAIL**; panel **không** tự ghi quỹ tay |
| **BR-PLT-ATT-LEAVE-06** | **FR-UC-BP-ATT-09** hold khi nộp | Hold chạy **trong** create/approve TXN sau assert `leave_type` ∈ EFF | Invent type → **4xx** trước hold; **cấm** hold với mã orphan |
| **BR-PLT-ATT-LEAVE-07** | **FR-UC-BP-ATT-07** nghỉ ốm | `leave_type` ∈ EFF; `is_sick` / attach rules từ catalog + VAL attach (`HRM-LEAVE-VAL-ATT`) | Invent type → **UNKNOWN**; thiếu file ốm = **attach VAL** (khác KEY) — **không** mở WAIVE |
| **BR-PLT-ATT-LEAVE-08** | Accrual / grant policy keys (**FR-UC-BP-ATT-04..06**) | GĐ1: nếu UF mutate policy key trên UI in-scope → cùng membership rule | Accrual **policy admin** ngoài LeaveTab create = **OUT** this pack trừ UF invent key phát hiện |
| **BR-PLT-ATT-LEAVE-09** | Retire còn FK history | Soft-delete; consumer **không** chọn retired trên create mới | History/balance cũ vẫn đọc được key |
| **BR-PLT-ATT-LEAVE-10** | ba-data | `public.att_leave_type` đã physical | **HOLD** — **FORBIDDEN** second catalog table (**no EXPAND** this seat) |

**Align (no conflict):**

| Vertical / peer | This pack |
|-----------------|-----------|
| **AC-PLT-ATT-01** admin create → F5 → picker | **RETAIN** · stamped as **AC-PLT-ATT-LEAVE-01d** (admin open) |
| **AC-PLT-ATT-02** retire hide · history | **RETAIN** · must_keep |
| **AC-PLT-ATT-03** invent 4xx when catalog >0 | **≡ AC-PLT-ATT-LEAVE-01b** browser + **VAL-ATT-CNS-01** (L1 SEAL retain; browser deepen) |
| **AC-PLT-PAY-01*** | Named peer pattern (admin open ≠ consumer picker Nest SoT) |

**SUPERSEDED / FORBIDDEN:** Option A Settings-MD-only picker SoT · invent `attendance_uat_ready=true` · reopen WAIVE/sign/J-06c · claim module ATT UAT · hard-delete LVT còn history · fold `work_shifts` into this pack.

---

## 4. Consumer surface inventory (authoritative)

> **Admin ≠ consumer.** Mọi AC «picker khi EFF ≠ empty» áp **consumer rows** dưới đây — **không** áp lên F-ATT-CAT-LVT-02.

| Surf ID | Surface (product) | Route / UI anchor (AS-IS) | Field SoT | Mutate / bind path | Class | SRS |
|---------|-------------------|--------------------------|-----------|-------------------|-------|-----|
| **S-ATT-ADM-01** | Nest leave-type **admin** create/edit/retire | Settings → tab **Loại phép ATT** (`AttLeaveTypeSettingsPanel`) · API Nest | `leave_type_key` open N+1 | **F-ATT-CAT-LVT-02** | **ADMIN** | Catalog (AC-PLT-ATT-01) |
| **S-ATT-CNS-01** | **Nghỉ phép — Tạo yêu cầu nghỉ** | Chấm công → **Nghỉ phép** (`LeaveTab`) create dialog | `leave_type` | POST leave-requests · assert ∈ EFF | **CONSUMER** (primary) | FR-UC-BP-ATT-04..09 submit |
| **S-ATT-CNS-02** | **Panel quỹ phép** khi mở form | Same create dialog (`leave-balance-panel` / by-type) | Bind `leave_type` from picker | GET leave-balance / panel (**read**) | **CONSUMER-READ** | **FR-UC-BP-ATT-05b** |
| **S-ATT-CNS-03** | **Hold quỹ** khi Gửi đơn | Same create submit path | Hold after assert | Create TXN → hold (**FR-UC-BP-ATT-09**) | **CONSUMER** (same TXN as CNS-01) | **FR-UC-BP-ATT-09** |
| **S-ATT-CNS-04** | **Nghỉ ốm** class (type + attach) | LeaveTab create · loại có `is_sick` / attach rule | `leave_type` ∈ EFF + attach VAL | POST leave-requests (+ file) | **CONSUMER** | **FR-UC-BP-ATT-07** |
| **S-ATT-REF-01** | Settings MD / group REF `leave_types` | Settings Master Data / catalog-sync | REF items | Merge-read into EFF only | **REF only** — **not** picker SoT | Dual SoT BR-PLT-06 |
| **S-ATT-OUT-01** | Sheet close / sign / leave WAIVE / J-HRM-06c approve funnel | Attendance sheet · inbox | — | — | **OUT** · **SEAL RETAIN** | must_keep |
| **S-ATT-OUT-02** | Work sites / work_shifts | ATT CFG ops | — | — | **OUT** (L-ATT-LEAVE-08) | — |

**Pointer:** Accrual grant / OT-bù policy admin screens (**FR-UC-BP-ATT-04/06**) — **OUT** unless QA finds invent write of leave_type key; then residual FE/BE under same KEY taxonomy.

---

## 5. Use-case catalog (process)

| UC ID | Name | Happy | Alternate | Exception |
|-------|------|-------|-----------|-----------|
| **UC-PLT-ATT-LEAVE-01** | Admin — CREATE Nest LVT N+1 | Settings Loại phép ATT → mã mới hợp lệ → Lưu **201** → list có row → **F5** còn → LeaveTab picker thấy mã | Sửa label/flags | Format invalid · UQ conflict · scope 409 · «must pick only» sai áp |
| **UC-PLT-ATT-LEAVE-02** | Consumer — create leave pick EFF | EFF ≥1 → Nghỉ phép → Tạo → **picker** Network GET `…/leave-types/effective` → chọn mã → Lưu **2xx** → F5 type ∈ catalog | Filter retired hidden | Free-text SoT · MD-only SoT · invent → **4xx** `HRM-LEAVE-TYPE-UNKNOWN` |
| **UC-PLT-ATT-LEAVE-03** | Balance panel bind | Chọn loại ∈ picker → panel số dư / hold dự kiến theo loại (**05b**) | Đổi loại → panel recalc | Free-text loại · panel với mã orphan làm SoT |
| **UC-PLT-ATT-LEAVE-04** | Hold on submit | Gửi đơn hợp lệ → hold quỹ (**09**) · panel phản ánh | Reject/cancel release (existing funnel — **RETAIN** WAIVE seals) | Invent type → 4xx **trước** hold |
| **UC-PLT-ATT-LEAVE-05** | Sick class | Chọn loại ốm ∈ EFF → attach rule nếu ≥N ngày → 2xx | Thiếu file → `HRM-LEAVE-VAL-ATT` | Invent type → **UNKNOWN** (≠ attach code) |
| **UC-PLT-ATT-LEAVE-06** | Empty EFF | Active=0 → picker empty + CTA admin; admin vẫn CREATE | Optional REF sync CTA | Seed fake density / MD-only green |
| **UC-PLT-ATT-LEAVE-07** | Scope parity | List EFF scope X = assert create scope X | Member 409 OOS | Drift list vs assert |

```mermaid
sequenceDiagram
  autonumber
  actor Admin as HCNS catalog admin
  actor Emp as NV/QL leave form
  participant Nest as Nest att_leave_type
  participant Eff as F-ATT-CAT-EFF-01
  participant Cons as Leave create / panel / hold

  Admin->>Nest: POST F-ATT-CAT-LVT-02 mã N+1 (open)
  alt Ceiling / must-pick-only sai áp admin
    Nest-->>Admin: FAIL — vi phạm BR-PLT-05 / L-ATT-LEAVE-01
  else 201
    Nest-->>Admin: Row active; F5 còn
  end
  Emp->>Eff: GET leave-types/effective (picker SoT)
  alt Active count = 0
    Eff-->>Emp: Empty + CTA admin; cấm seed
  else Active count > 0
    Emp->>Cons: Chọn leave_type ∈ EFF; panel 05b; Gửi
    alt leave_type invent / OOS
      Cons-->>Emp: 4xx HRM-LEAVE-TYPE-UNKNOWN (trước hold)
    else OK
      Cons-->>Emp: 2xx; hold 09; F5 type ∈ catalog
    end
  end
  Note over Cons: WAIVE / sign / J-06c / attendance_uat OUT
```

---

## 6. Acceptance criteria (measurable · U65)

> Browser-only khi surface FE tồn tại · zero-seed · FE sau 2xx/4xx quan sát được + **F5** · probe/API **không** 🟢 UF.  
> Honesty flags **giữ false**.  
> **Không** wipe sealed ATT-QC / WAIVE / EMP·DEC·PAY·EXT·CTR·LIST-TOTALS.

### 6.1 Core AC pack (SA §7)

| ID | Surface | Đạt khi | Không đạt khi |
|----|---------|---------|----------------|
| **AC-PLT-ATT-LEAVE-01** | **S-ATT-CNS-01** (primary) | EFF active **≥1** (từ admin — **không** seed): mở **Nghỉ phép** → **Tạo yêu cầu nghỉ** → UI = **picker** nguồn **Network GET** `/api/hrm/attendance/leave-types/effective` → chọn mã Nest/EFF → Lưu **2xx** → list hiện đúng `leave_type` → **F5** còn ∈ catalog | Free-text Input là SoT · picker chỉ Settings MD `leave_types` · 2xx với mã không ∈ EFF · chỉ API PASS |
| **AC-PLT-ATT-LEAVE-01b** | **S-ATT-CNS-01** invent | EFF **≥1**: cố ý nhập/POST `leave_type` **không** ∈ effective → FE chặn và/hoặc Network **4xx** **`HRM-LEAVE-TYPE-UNKNOWN`** → **không** persist sau F5 · **không** hold | 2xx invent · silent accept · format-only bypass · claim = AC-PLT-ATT-03 conflict |
| **AC-PLT-ATT-LEAVE-01c** | **S-ATT-CNS-01** khi EFF **=0** | Picker **empty** + VI/CTA Settings **Loại phép ATT**; **không** fake starter chỉ để pass UF; admin **S-ATT-ADM-01** vẫn CREATE được | Seed/script density · fake rows · MD-only «green» khi Nest/EFF=0 |
| **AC-PLT-ATT-LEAVE-01d** | **S-ATT-ADM-01** | Catalog admin CREATE mã **#N+1** (slug hợp lệ) → Network **2xx/201** `F-ATT-CAT-LVT-02` → list có row → **F5** còn → consumer picker thấy mã — **không** reject «must pick existing only» · **ATT-QC-02 RETAIN** | Áp invent ban lên admin · ceiling starter · reopen ATT-QC-02 as new wipe |
| **AC-PLT-ATT-LEAVE-01H** | Honesty / seals | Evidence ghi rõ: `attendance_uat_ready=false` · leave WAIVE / sign / **J-HRM-06c** **SEAL RETAIN** · EMP·DEC·PAY·EXT·CTR·LIST-TOTALS·ATT-QC-01/02 **SEAL RETAIN** · **`C-SLICE-≠-MODULE`** · U65 zero-seed · DENY module ATT UAT | Flip ready · reopen WAIVE/sign/J-06c · reopen peer seals · claim module ATT UAT / Phase1 |

### 6.2 Surface deepen AC (same pack · SRS enumerate)

| ID | Surface | Đạt khi | Không đạt khi |
|----|---------|---------|----------------|
| **AC-PLT-ATT-LEAVE-05b** | **S-ATT-CNS-02** | Sau chọn loại ∈ picker: panel quỹ (**testid** `leave-balance-panel` / by-type) hiện theo loại; đổi loại → panel đổi; **không** free-text SoT | Panel phụ thuộc mã invent · Demo/fake số · seed |
| **AC-PLT-ATT-LEAVE-09** | **S-ATT-CNS-03** | Submit hợp lệ → hold phản ánh trên panel/response; invent type **không** tạo hold | Hold với orphan type · reopen WAIVE để «pass» hold |
| **AC-PLT-ATT-LEAVE-07** | **S-ATT-CNS-04** | Loại ốm ∈ EFF + attach rule deterministic; invent type → **UNKNOWN** (không nhầm với `HRM-LEAVE-VAL-ATT`) | Free-text ốm · invent 2xx |

### 6.3 Consumer VAL (BE/QA measurable)

| ID | Surface | Input | Expect | AC / BR | BA gap stamp |
|----|---------|-------|--------|---------|--------------|
| **VAL-ATT-CNS-01** | Leave create **S-ATT-CNS-01** | `leave_type` OOS khi EFF >0 | **4xx** `HRM-LEAVE-TYPE-UNKNOWN` | AC-PLT-ATT-LEAVE-01b · AC-PLT-ATT-03 · BR-PLT-ATT-LEAVE-02 | **RETAIN** existing BE assert + jest VAL-ATT-LVT-08 — **no mandatory CNS-BE** unless regression FAIL |
| **VAL-ATT-CNS-02** | Balance/hold **S-ATT-CNS-02/03** (+ sick type on create) | Invent key on submit / free-text SoT panel | **4xx** UNKNOWN trên mutate **hoặc** picker-only (no invent UI); hold không chạy | BR-PLT-ATT-LEAVE-05/06/07 · AC-PLT-ATT-LEAVE-05b/09/07 | **Same TXN as create** for hold — **RETAIN**; panel = FE picker-only verify; **no** separate balance invent write SoT |
| **VAL-ATT-CNS-03** | Scope | List EFF scope ≠ assert create scope | jest **FAIL** scope_parity · runtime 409/4xx deterministic | L-ATT-LEAVE-06 · U19 | **RETAIN** ATT scope specs; deepen only if FAIL |
| **VAL-ATT-CNS-04** | Settings-only SoT | FE bind MD `leave_types` **without** EFF when EFF >0 | **FAIL** AC-PLT-ATT-LEAVE-01 | L-ATT-LEAVE-02 · BR-PLT-ATT-LEAVE-04 | QA Network source check |
| **VAL-ATT-CNS-05** | Retire | Create với mã retired (default picker) | Reject / not in default picker; history còn | BR-PLT-04 · AC-PLT-ATT-02 | **RETAIN** |
| **VAL-ATT-LVT-*** | Admin **S-ATT-ADM-01** | Code N+1 / format / UQ | Per ATT-DATA/BE VAL | AC-PLT-ATT-LEAVE-01d · BR-PLT-05 | **RETAIN** ATT-QC |

### 6.4 must_keep / regression pointers (không AC mới)

| Pointer | Pass | Fail |
|---------|------|------|
| **MK-ATT-QC-01** | ATT-QC-01 L1 GWC retained | Reopen/wipe L1 |
| **MK-ATT-QC-02** | ATT-QC-02 browser AC-PLT-ATT-01..02 retained | Reopen as wipe |
| **MK-ATT-WAIVE-01** | Leave WAIVE / LV-02 / WAIVE_L2 / J-HRM-06c / sheet-sign **SEAL RETAIN** | Reopen without warrant |
| **MK-ATT-EFF-01** | LeaveTab `useAttLeaveTypesEffective` path retained when Network = EFF | Force MD-only SoT |
| **MK-ATT-FUNNEL-01** | Leave funnel TXN / attach VAL codes retained | Invent WAIVE reopen |
| **MK-SEAL-PEER-01** | EMP · DEC · PAY · EXT · CTR · LIST-TOTALS seals retain | Reopen peer seals |
| **MK-OPS-SHIFT-01** | `work_shifts` ops lock — not folded into leave AC | Treat shifts as catalog leave SoT |

### 6.5 Journey / UF map (QA + ba-docs)

| ID | Maps | Notes |
|----|------|-------|
| **Proposed `J-HRM-ATT-LEAVE-CAT-01`** | Admin CREATE N+1 → F5 → LeaveTab picker thấy mã (**01d** → **01**) | ba-docs ADD journey row after CONFIRM |
| **Proposed `J-HRM-ATT-LEAVE-CAT-02`** | Invent type trên create → 4xx UNKNOWN (**01b**) | Align AC-PLT-ATT-03 |
| **Proposed `J-HRM-ATT-LEAVE-CAT-03`** | EFF=0 empty picker + admin still CREATE (**01c**) | |
| **Proposed `J-HRM-ATT-LEAVE-CAT-04`** | Create → panel 05b → hold 09 spot · sick class type ∈ EFF | Deepen SRS enumerate |
| Reuse | **J-HRM-06** / **J-HRM-06c** / leave WAIVE seals | List→detail / approve funnel — **RETAIN**; **cấm** reopen / claim UAT |
| Cross-nav U19 | Leave list → detail sau Lưu · F5 | AC mỗi list mutate kèm deep link/F5 |

**Persona:** Group CEO `ceo@xe.vn` (rollup) + member HCNS khi test scope 409 — AC ghi rõ scope expect.

---

## 7. Error taxonomy (deterministic)

| Code | When | HTTP | FE |
|------|------|------|-----|
| **`HRM-LEAVE-TYPE-UNKNOWN`** | Consumer invent / OOS `leave_type` khi EFF active >0 | **4xx** | Banner/field VI — không toast success · không hold |
| `HRM-PLT-CAT-CODE-INVALID` | Admin format only | 4xx | Admin form |
| `HRM-PLT-CAT-CODE-CONFLICT` | Admin UQ | 4xx | Admin form |
| `HRM-LEAVE-VAL-ATT` | Sick attach rule (thiếu file…) | 4xx | **≠** invent KEY — keep separate |
| Scope mismatch | Consumer assert company ≠ token scope | 409 class | Honest empty/banner |

**Cấm:** 2xx + orphan `leave_type`; 500 trên invent; FE format-pass bỏ qua membership; nhầm attach VAL với UNKNOWN.

---

## 8. Honesty / non-claims / seals

| Flag / seal | Rule |
|-------------|------|
| `attendance_uat_ready` | **false** — **DENIED** flip |
| Leave WAIVE / sign / J-HRM-06c | **SEAL RETAIN** — **DENIED** reopen |
| Module ATT UAT / Phase1 | **DENIED** — slice AC ≠ module GO |
| `payroll_e2e_ready` / printable / personnel | **Unchanged false** — out of seat |
| ATT-QC-01 · ATT-QC-02 · EMP · DEC · PAY · EXT · CTR · LIST-TOTALS | **SEAL RETAIN** |
| `C-SLICE-≠-MODULE` | Leave catalog AC pack ≠ module ATT UAT |
| Seed | **DENIED** (U65) |
| ba-data | **HOLD** — **no EXPAND** flagged this seat |

---

## 9. DOC-DELTA flag (optional ba-docs)

| Flag | Need? | Note |
|------|-------|------|
| Client SRS admin vs consumer wording | **OPTIONAL** | FR-UC-BP-ATT-04..09 đã có loại phép / panel / hold; ADD-only sentence «danh mục chuẩn = Nest att_leave_type / effective; Settings leave_types ≠ sole SoT» **if** sponsor ambiguity — **không** wipe 7-mục FR |
| Journey rows J-HRM-ATT-LEAVE-CAT-* | **OPTIONAL** after QA stamp | Map §6.5 |
| ba-data EXPAND | **NO** | Physical exists |

---

## 10. Handoff expectations

| Role | Expect | Done when |
|------|--------|-----------|
| **pm** | Seal BA CONFIRMED · unlock QA browser (primary); BE/FE only if gap | Bus DISPATCHED |
| **dev-be** | **RETAIN** leave-requests ∈ EFF assert; jest VAL-ATT-CNS-01/03 smoke; **CNS-BE only if QA FAIL residual** | READY_FOR_QA / idle-ok retain |
| **dev-fe** | **RETAIN** LeaveTab EFF bind if Network proves; rebind **only** if MD sole SoT found | READY_FOR_QA / idle-ok |
| **qa** | U65 AC-PLT-ATT-LEAVE-01/01b/01c/01d/01H (+ 05b/09/07 spot) · zero-seed · no UAT flip · WAIVE seals untouched | PASS_TO_PM / FAIL |
| **qc** | Slice GWC only · honesty false · seals retain | GWC ≠ module GO |
| **ba-data** | **HOLD** | No Task unless EXPAND reopen |
| **ba-docs** | Optional DOC-DELTA / journey §9 | After PM if flagged |

---

## 11. Open risks / clarifications

| # | Item | Disposition |
|---|------|-------------|
| R1 | Helper `leaveTypeOptionsFromCatalog` (MD) vẫn trong codebase | Allowed REF/label; **must not** drive create picker SoT when EFF >0 (**VAL-ATT-CNS-04**) |
| R2 | Balance GET accepts arbitrary `leave_type` query | Read soft OK; **SoT invent** chỉ fail trên **mutate** create/hold — FE picker-only đóng R2 |
| R3 | Accrual policy admin invent keys | OUT unless UF found — residual separate |
| Q1 | Exact live error string | BE already emits `HRM-LEAVE-TYPE-UNKNOWN` — document in QA evidence |

**Unresolved needing sponsor:** none for Option B AC — architecture LOCKED by SA.

---

## 12. Completion

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** · **CONFIRMED** |
| **ba-data** | **HOLD** (no EXPAND) |
| **BE** | Leave create assert **RETAIN** · deepen **only** on BA-listed gap / QA FAIL |
| **next_owner** | **pm** → **qa** `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-CATALOG-QA-01` |
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-att-leave-catalog-ba-01.md` |

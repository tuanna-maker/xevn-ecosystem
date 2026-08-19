# BA AC/BR — SI insurance-type catalog Option B · admin open N+1 vs consumer picker (Nest EFF ≠ empty)

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-BA-01` |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-SA-01` **CONFIRMED** Option **B** |
| **program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **from_role** | ba-process |
| **lane** | governance |
| **Date** | 2026-08-08 |
| **Status** | **CONFIRMED** — AC pack implementation-ready · ba-data **UNLOCK** (parallel `…-SI-INS-CATALOG-DATA-01` · Nest **absent**) · BE **HOLD** until BA **+** DATA · FE Settings-MD picker **GAP** (rebind after Nest EFF) · policy MD assert **MIGRATE** to Nest EFF · enrollment `type` free-text **GAP BE** · printable / personnel invent **DENIED** |
| **change_mode** | **ADD** (deepen SA §7 · **no** wipe platform BA-01 · EMP E2E · CTR legal-print · SI enrollment EMP-BE-02 · EMP/DEC/PAY/ATT/REC/EXT/LIST-TOTALS) |
| **ref_sa** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-SA-01.md`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-SA-01.md) L-SI-INS-01..10 · §7 AC/VAL |
| **ref_sa_evidence** | [`po-hrm-dynamic-config-platform-si-ins-catalog-sa-01.md`](../../qa/evidence/po-hrm-dynamic-config-platform-si-ins-catalog-sa-01.md) |
| **ref_platform_ba** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-BA-01.md`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-BA-01.md) **BR-PLT-02/04/05/06** |
| **ref_peer_att** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-CATALOG-BA-01.md`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-CATALOG-BA-01.md) **AC-PLT-ATT-LEAVE-01*** |
| **ref_peer_pay** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-CATALOG-BA-01.md`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-CATALOG-BA-01.md) **AC-PLT-PAY-01*** |
| **ref_peer_rec** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-STAGE-CATALOG-BA-01.md`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-STAGE-CATALOG-BA-01.md) **AC-PLT-REC-STAGE-01*** |
| **ref_peer_emp_dec** | EMP DOC/ET · DEC decision-types open catalog (admin≠consumer pattern) |
| **ref_srs** | [`SRS_HRM_ENTERPRISE.md`](../../client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md) **FR-UC-BP-CORE-10** · E3 **AC-INS-*** · **AC-SI-TL-01..06** (lifecycle **OUT** fold) |
| **ref_tech** | [`TECHSPEC_HRM_ENTERPRISE.md`](../../client-delivery/hrm-enterprise-blueprint/TECHSPEC_HRM_ENTERPRISE.md) **F-CORE-SI-02/03** · CTR print OUT |
| **ref_api** | [`API_DESIGN_HRM_ENTERPRISE.md`](../../client-delivery/hrm-enterprise-blueprint/API_DESIGN_HRM_ENTERPRISE.md) **F-CORE-SI-01** · physical Nest target `/contracts-insurance/insurance-types*` · enrollment `/employee-insurances*` · Settings **F-SET-SI-*** rate-cfg |
| **ref_db** | [`DB_DESIGN_HRM_ENTERPRISE.md`](../../client-delivery/hrm-enterprise-blueprint/DB_DESIGN_HRM_ENTERPRISE.md) §3.6 enrollment ONE SoT · `insurance_type_key` / AS-IS `type` text · **no** `si_insurance_type` yet (**DATA EXPAND**) |
| **Honesty** | `contracts_printable_ready=false` · `hrm_personnel_uat_ready=false` · CTR legal-print / SI enrollment **SEAL RETAIN** · EMP·DEC·PAY·ATT·REC·EXT·LIST-TOTALS **SEAL RETAIN** · **`C-SLICE-≠-MODULE`** · U65 · **DENY** module SI/CTR UAT |
| **Cấm** | `apps/**` · seed · Settings MD `insurance_types` = sole picker SoT · fold `insurers` · reopen CTR legal-print · invent printable/personnel · rewrite `employee_insurances` schema · BE before DATA CONFIRMED |

---

## 0. Process objective & actors

### Objective

Khóa **AC/BR đo được** cho Option **B** (SA LOCKED):

1. **Catalog admin** (`F-SI-CAT-TYP-02`) = **open CREATE N+1** — mã slug HR đặt OK (**BR-PLT-05** · **AC-PLT-SI-INS-01d**).
2. **Consumers** khi Nest/EFF **effective active count > 0** = **picker/FK only** từ **`GET /api/hrm/contracts-insurance/insurance-types/effective`** (**F-SI-CAT-EFF-01**) — **cấm** Input free-text / Settings MD density làm SoT mã (**BR-PLT-02** · **AC-PLT-SI-INS-01**).
3. Invent unknown type key → **4xx** **`HRM-INS-TYPE-KEY`** (E3 retain; peer UNKNOWN class — optional alias `HRM-SI-INS-TYPE-UNKNOWN` **without** breaking E3 matrix) (**AC-PLT-SI-INS-01b** · **VAL-SI-CNS-***).
4. Empty EFF → empty picker + VI / CTA admin; **cấm** seed/fake density (**AC-PLT-SI-INS-01c** · **L-SI-INS-04**).
5. **DENY** Settings-MD-alone SoT · insurers fold · CTR legal-print reopen · `contracts_printable_ready` / `hrm_personnel_uat_ready` invent · module SI/CTR UAT.

### Actors

| Actor | Role |
|-------|------|
| HCNS Settings — tab **Loại BH / SI type** (Nest admin) | CRUD Nest `si_insurance_type` (mở N+1) · retire soft |
| HCNS / C&B — **Bảo hiểm** policy master | Chọn `insurance_type` ∈ EFF · tạo/sửa policy (**AC-INS** / **J-HRM-INS-E3-01**) |
| HCNS — hồ sơ NV **timeline BH** | Tạo/sửa enrollment `type` ∈ EFF (**FR-UC-BP-CORE-10** · **F-CORE-SI-02**) |
| C&B Settings — **Cấu hình tỷ lệ BH** (optional) | Upsert `insurance_type_key` ∈ EFF (**F-SET-SI-02**) |
| Group CEO | Scope rollup `main` / member — cùng resolve list↔assert (**U19**) |
| System | Effective union (Nest wins vs group REF) · soft-delete hide · `HRM-INS-TYPE-KEY` |
| SA / ba-data / Dev-BE / Dev-FE / QA | F.1 · physical ADD · assert migrate · picker rebind · U65 |

### Scope

| In (this seat) | Out |
|----------------|-----|
| AC-PLT-SI-INS-01 / 01b / 01c / 01d / 01H · VAL-SI-CNS-01..05 · BR-PLT-SI-INS-* · surface matrix + UF/J-* | Impl `apps/**` / migration / seed |
| Enumerate consumers: **policy** · **enrollment type** · **optional rate-cfg** | Claim module SI/CTR UAT · flip printable/personnel |
| Cross-ref **FR-UC-BP-CORE-10** · **F-CORE-SI-02/03** · **E3 AC-INS-*** · peer ATT/PAY/REC/EMP/DEC | Fold **insurers** Nest · CTR print/library · SI action Đóng/Ngừng/Tạm hoãn core (**AC-SI-TL**) as type SoT |
| ba-data **UNLOCK** pointer (Nest absent) | Rewrite enrollment ONE SoT schema · mega EAV |
| Align E3 invent type with **01b** (`HRM-INS-TYPE-KEY`) | Wipe EMP-BE-02 / CTR legal-print GWC |

---

## 1. As-is vs to-be

| | AS-IS | TO-BE (Option B) |
|---|-------|------------------|
| Code SoT | Settings MD partition **`insurance_types`** via `settingsCatalogs.assertCodeInEffectiveCatalog`; **no** Nest `si_insurance_type` | Nest **`public.si_insurance_type`** via **F-SI-CAT-TYP-01 / F-SI-CAT-EFF-01**; MD = **group REF merge-read only** |
| Admin create | Settings Master Data items (open-ish) — **not** named Nest admin AC | Settings SI type tab / **F-SI-CAT-TYP-02** open N+1 (**AC-PLT-SI-INS-01d**) |
| Policy consumer | `assertInsuranceTypeKey` → MD · `HRM-INS-TYPE-KEY` when MD ≠ empty; FE `catalogSearchPicker` Settings | Assert ∈ Nest EFF when count>0; FE Network **GET `…/insurance-types/effective`** |
| Enrollment consumer | `EmployeeInsurancesService` free-text **`type`** (default `social`) — **GAP** | When EFF>0: picker/FK + BE assert · invent → **`HRM-INS-TYPE-KEY`** |
| Rate-cfg consumer | Settings `insurance-rate-cfg` open `insurance_type_key` (F-SET-SI-*) | When EFF>0: key ∈ Nest EFF (**VAL-SI-CNS-03**) — **optional** UF deepen |
| Insurers | Settings `insurers` · E3 `HRM-INS-INSURER-KEY` | **OUT GĐ1 residual** — **≠** type SoT |
| Honesty | Risk flip printable/personnel / reopen CTR | Flags **false** · CTR / enrollment seals **RETAIN** · **`C-SLICE-≠-MODULE`** |

---

## 2. Platform locks (reuse)

| ID | Condition | Action | Outcome |
|----|-----------|--------|---------|
| **BR-PLT-02** | Nest/EFF active **>0** | Consumer SoT = picker/FK type key ∈ effective | Free-text invent → **4xx** `HRM-INS-TYPE-KEY` |
| **BR-PLT-04** | Retire / `archived_at` | Soft-delete | Picker default ẩn; past policy/enrollment keys còn (**history**) |
| **BR-PLT-05** | Admin CREATE | Open slug N+1 · format/UQ only | **FORBIDDEN** ceiling / «must pick existing only» on **F-SI-CAT-TYP-02** |
| **BR-PLT-06** | Dual SoT | Nest tenant writer = SoT; Settings/XBOS `insurance_types` = REF merge-read; Nest wins collision | **FORBIDDEN** dual master write / MD sole SoT |
| **L-SI-INS-01** | Admin path vs consumer path | Split AC/VAL | Mis-apply invent ban lên admin = **FAIL process** |
| **L-SI-INS-02** | Picker SoT | Nest F-SI-CAT-EFF-01 | Settings MD alone **REJECT** |
| **L-SI-INS-04** | Active count =0 | Empty picker + VI / CTA admin | **FORBIDDEN** fake/seed density UF |
| **L-SI-INS-06** | Scope | list ↔ get-by-id ↔ consumer assert | Same `resolveHrmListScope` (**U19**) |
| **L-SI-INS-07** | Invent KEY | Membership check | Format-only **không** bypass |
| **L-SI-INS-08..10** | Adjacent OUT / seals / honesty | OUT / RETAIN / false | See §8 |

---

## 3. SI insurance-type business rules

| ID | Condition | Action | Outcome |
|----|-----------|--------|---------|
| **BR-PLT-SI-INS-01** | Surface = **catalog admin** (`POST/PUT` F-SI-CAT-TYP-02) | Cho phép mã mới hợp lệ slug (N+1) | **2xx/201** · list + F5 còn — **không** yêu cầu «đã có trong picker» |
| **BR-PLT-SI-INS-02** | Surface ∈ **consumer set** (§4) **và** EFF active **>0** | Body/field `insurance_type` / enrollment `type` / rate-cfg `insurance_type_key` **phải** ∈ effective active | Ngoài set → **`HRM-INS-TYPE-KEY`** — format-only **không** bypass |
| **BR-PLT-SI-INS-03** | EFF active **=0** trên consumer | Empty picker + VI/CTA «Cài đặt → Loại BH»; **không** bắt buộc invent | Seed/fake rows để pass UF = **FAIL U65** |
| **BR-PLT-SI-INS-04** | Settings MD / REF `insurance_types` density | Merge-read into EFF only | **FORBIDDEN** sole SoT cho consumer picker |
| **BR-PLT-SI-INS-05** | **E3 AC-INS-01/03** · policy create/update | Picker Nest EFF · POST/PATCH `insurance_type` ∈ EFF | Invent → **4xx** KEY · **cấm** MD-only green khi Nest live |
| **BR-PLT-SI-INS-06** | **FR-UC-BP-CORE-10** · **F-CORE-SI-02** enrollment create/update | Form picker EFF; BE assert `type` ∈ EFF when >0 | Invent `type` → **KEY** (**GAP BE** AS-IS free-text) |
| **BR-PLT-SI-INS-07** | Settings **F-SET-SI-02** rate-cfg upsert | Khi EFF>0: `insurance_type_key` ∈ EFF | Invent key → **KEY** · **≠** rewrite SI-412 pick helper |
| **BR-PLT-SI-INS-08** | **F-CORE-SI-03** actions Đóng/Ngừng/Tạm hoãn | Lifecycle trên enrollment ONE SoT | **OUT** type catalog — **RETAIN** EMP-BE-02 · **AC-SI-TL** separate |
| **BR-PLT-SI-INS-09** | Retire còn FK history | Soft-delete; consumer **không** chọn retired trên create mới | History policy/enrollment cũ vẫn đọc được key |
| **BR-PLT-SI-INS-10** | ba-data | Nest **absent** | **UNLOCK EXPAND** `public.si_insurance_type` — **FORBIDDEN** second mega catalog / rewrite `employee_insurances` |

**Align (no conflict):**

| Vertical / peer / E3 | This pack |
|----------------------|-----------|
| **AC-INS-01** policy CRUD/SM | **RETAIN** · type field SoT deepen via **AC-PLT-SI-INS-01** |
| **AC-INS-02** insurer picker | **OUT** residual — **≠** type SoT · invent insurer vẫn `HRM-INS-INSURER-KEY` |
| **AC-INS-03** insurance type picker | **≡ deepen** to Nest EFF · invent ≡ **01b** `HRM-INS-TYPE-KEY` |
| **AC-INS-04/05** participant / end | **RETAIN** — not type catalog |
| **AC-SI-TL-01..06** | Lifecycle OUT fold · must_keep separate |
| **AC-PLT-ATT-LEAVE-01*** / **AC-PLT-PAY-01*** / **AC-PLT-REC-STAGE-01*** / EMP·DEC | Named peer pattern (admin open ≠ consumer picker Nest SoT) |

**SUPERSEDED / FORBIDDEN:** Option A Settings-MD-only picker SoT · invent `contracts_printable_ready=true` / `hrm_personnel_uat_ready=true` · reopen CTR legal-print GWC · fold insurers Nest · claim module SI/CTR UAT · hard-delete type còn history · rewrite enrollment schema.

---

## 4. Consumer surface inventory (authoritative)

> **Admin ≠ consumer.** Mọi AC «picker khi EFF ≠ empty» áp **consumer rows** dưới đây — **không** áp lên F-SI-CAT-TYP-02.

| Surf ID | Surface (product) | Route / UI anchor (AS-IS → TO-BE) | Field SoT | Mutate / bind path | Class | SRS / AC |
|---------|-------------------|----------------------------------|-----------|-------------------|-------|----------|
| **S-SI-ADM-01** | Nest insurance-type **admin** create/edit/retire | Settings → tab **Loại BH / SI type** (Nest panel — **ADD** after DATA/BE) · API Nest | `insurance_type_key` open N+1 | **F-SI-CAT-TYP-02** | **ADMIN** | Catalog (01d) |
| **S-SI-CNS-01** | **Policy** create/update — loại BH | HRM → **Bảo hiểm** → dialog policy (`CatalogSearchPicker` AS-IS Settings) | `insurance_type` | POST/PATCH `…/insurance-policies` · assert ∈ EFF | **CONSUMER** (primary) | **AC-INS-01/03** · **J-HRM-INS-E3-01** |
| **S-SI-CNS-02** | **Enrollment** create/update on profile SI timeline | Hồ sơ NV / Bảo hiểm timeline · Add enrollment | `type` (alias `insurance_type_key`) | POST/PATCH `…/employee-insurances` · assert ∈ EFF | **CONSUMER** (primary) | **FR-UC-BP-CORE-10** · **F-CORE-SI-02** |
| **S-SI-CNS-03** | **Insurance rate-cfg** upsert (optional) | Settings → cấu hình tỷ lệ BH | `insurance_type_key` | POST/PATCH `…/settings/insurance-rate-cfg` | **CONSUMER** (optional) | **F-SET-SI-02** · UC-SET-DEF-02 |
| **S-SI-REF-01** | Settings MD / group REF `insurance_types` | Settings Master Data / catalog-sync | REF items | Merge-read into EFF only | **REF only** — **not** picker SoT | Dual SoT BR-PLT-06 |
| **S-SI-OUT-01** | **Insurers** catalog | Policy dialog insurer picker | `insurer_key` | E3 `HRM-INS-INSURER-KEY` | **OUT** residual | **AC-INS-02** |
| **S-SI-OUT-02** | SI lifecycle actions Đóng/Ngừng/Tạm hoãn | Timeline action buttons | status / mức | **F-CORE-SI-03** | **OUT** · **SEAL RETAIN** EMP-BE-02 | **AC-SI-TL-*** |
| **S-SI-OUT-03** | CTR legal-print / template / clause / library | Contracts print spine | — | — | **OUT** · **SEAL RETAIN** | printable **false** |
| **S-SI-OUT-04** | Participant attach / end policy | Policy participants | — | — | **OUT** type SoT (retain AC-INS-04/05) | E3 |

**Pointer:** Load-only **UF-HRM-04** / **J-HRM-04** — retain host; mutate depth = **J-HRM-INS-E3-01** + proposed CAT journeys — **cấm** claim personnel UAT from load-only.

---

## 5. Use-case catalog (process)

| UC ID | Name | Happy | Alternate | Exception |
|-------|------|-------|-----------|-----------|
| **UC-PLT-SI-INS-01** | Admin — CREATE Nest type N+1 | Settings Loại BH → mã mới hợp lệ → Lưu **201** → list có row → **F5** còn → consumer picker thấy mã | Sửa label / sort | Format invalid · UQ · scope 409 · «must pick only» sai áp |
| **UC-PLT-SI-INS-02** | Consumer — policy pick EFF | EFF ≥1 → Bảo hiểm → Tạo policy → **picker** Network GET `…/insurance-types/effective` → chọn mã → Lưu **2xx** → F5 type ∈ catalog | Filter retired hidden | Free-text SoT · MD-only SoT · invent → **4xx** `HRM-INS-TYPE-KEY` |
| **UC-PLT-SI-INS-03** | Consumer — enrollment pick EFF | EFF ≥1 → timeline → Thêm BH → picker `type` ∈ EFF → Lưu **2xx** → F5 | Đổi type trên update | Invent `type` → **KEY** · free-text SoT |
| **UC-PLT-SI-INS-04** | Consumer — rate-cfg key (optional) | EFF ≥1 → Settings rate-cfg → key ∈ EFF → **201** | Retire soft | Invent key → **KEY** |
| **UC-PLT-SI-INS-05** | Empty EFF | Active=0 → picker empty + CTA admin; admin vẫn CREATE | Optional REF sync CTA | Seed fake density / MD-only green |
| **UC-PLT-SI-INS-06** | Scope parity | List EFF scope X = assert consumer scope X | Member 409 OOS | Drift list vs assert |

```mermaid
sequenceDiagram
  autonumber
  actor Admin as HCNS catalog admin
  actor Cnb as HCNS/C&B consumer
  participant Nest as Nest si_insurance_type
  participant Eff as F-SI-CAT-EFF-01
  participant Pol as Policy / enrollment / rate-cfg

  Admin->>Nest: POST F-SI-CAT-TYP-02 mã N+1 (open)
  alt Ceiling / must-pick-only sai áp admin
    Nest-->>Admin: FAIL — vi phạm BR-PLT-05 / L-SI-INS-01
  else 201
    Nest-->>Admin: Row active; F5 còn
  end
  Cnb->>Eff: GET insurance-types/effective (picker SoT)
  alt Active count = 0
    Eff-->>Cnb: Empty + CTA admin; cấm seed
  else Active count > 0
    Cnb->>Pol: Chọn type ∈ EFF; Lưu
    alt type invent / OOS
      Pol-->>Cnb: 4xx HRM-INS-TYPE-KEY
    else OK
      Pol-->>Cnb: 2xx; F5 type ∈ catalog
    end
  end
  Note over Pol: insurers / CTR print / SI-TL actions / printable invent OUT
```

---

## 6. Acceptance criteria (measurable · U65)

> Browser-only khi surface FE tồn tại · zero-seed · FE sau 2xx/4xx quan sát được + **F5** · probe/API **không** 🟢 UF.  
> Honesty flags **giữ false**.  
> **Không** wipe sealed CTR legal-print / SI enrollment / EMP·DEC·PAY·ATT·REC·EXT·LIST-TOTALS.  
> **BE HOLD** until DATA CONFIRMED — AC dưới đây = **gate cho unlock** execution (không claim LIVE trước Nest).

### 6.1 Core AC pack (SA §7)

| ID | Surface | Đạt khi | Không đạt khi |
|----|---------|---------|----------------|
| **AC-PLT-SI-INS-01** | **S-SI-CNS-01** (primary) + **S-SI-CNS-02** | EFF active **≥1** (từ admin — **không** seed): mở consumer → UI = **picker** nguồn **Network GET** `/api/hrm/contracts-insurance/insurance-types/effective` → chọn mã Nest/EFF → Lưu **2xx** → list/timeline hiện đúng type → **F5** còn ∈ catalog | Free-text Input là SoT · picker chỉ Settings MD `insurance_types` · 2xx với mã không ∈ EFF · chỉ API PASS |
| **AC-PLT-SI-INS-01b** | **S-SI-CNS-01** / **S-SI-CNS-02** invent | EFF **≥1**: cố ý nhập/POST type key **không** ∈ effective → FE chặn và/hoặc Network **4xx** **`HRM-INS-TYPE-KEY`** → **không** persist sau F5 | 2xx invent · silent accept · format-only bypass · conflict với E3 AC-INS-03 |
| **AC-PLT-SI-INS-01c** | Consumers khi EFF **=0** | Picker **empty** + VI/CTA Settings **Loại BH**; **không** fake starter chỉ để pass UF; admin **S-SI-ADM-01** vẫn CREATE được | Seed/script density · fake rows · MD-only «green» khi Nest/EFF=0 |
| **AC-PLT-SI-INS-01d** | **S-SI-ADM-01** | Catalog admin CREATE mã **#N+1** (slug hợp lệ) → Network **2xx/201** `F-SI-CAT-TYP-02` → list có row → **F5** còn → consumer picker thấy mã — **không** reject «must pick existing only» | Áp invent ban lên admin · ceiling starter · closed enum CHK IN |
| **AC-PLT-SI-INS-01H** | Honesty / seals | Evidence ghi rõ: `contracts_printable_ready=false` · `hrm_personnel_uat_ready=false` · CTR legal-print / SI enrollment EMP-BE-02 **SEAL RETAIN** · EMP·DEC·PAY·ATT·REC·EXT·LIST-TOTALS **SEAL RETAIN** · **`C-SLICE-≠-MODULE`** · U65 zero-seed · **DENY** module SI/CTR UAT | Flip ready · reopen CTR print · invent personnel UAT · reopen peer seals · claim module SI/CTR UAT / Phase1 |

### 6.2 Surface deepen AC (same pack · SRS enumerate)

| ID | Surface | Đạt khi | Không đạt khi |
|----|---------|---------|----------------|
| **AC-PLT-SI-INS-POL** | **S-SI-CNS-01** | Align **AC-INS-01/03** + **J-HRM-INS-E3-01**: type picker Nest EFF; invent type → **KEY**; insurer path **OUT** this pack (AC-INS-02 retain separate) | MD-only type SoT · invent type 2xx |
| **AC-PLT-SI-INS-ENR** | **S-SI-CNS-02** | Align **FR-UC-BP-CORE-10** create/update enrollment: `type` ∈ EFF; **không** free-text SoT khi EFF>0 | Free-text 2xx · conflate with **AC-SI-TL** lifecycle |
| **AC-PLT-SI-INS-RATE** | **S-SI-CNS-03** (optional) | Khi UF Settings rate-cfg in-scope: key ∈ EFF khi >0 · invent → **KEY** | Treat rate-cfg as type admin · fold SI-412 formula |

### 6.3 Consumer VAL (BE/QA measurable)

| ID | Surface | Input | Expect | AC / BR | BA gap stamp |
|----|---------|-------|--------|---------|--------------|
| **VAL-SI-CNS-01** | Policy **S-SI-CNS-01** | `insurance_type` OOS khi EFF >0 | **4xx** `HRM-INS-TYPE-KEY` | AC-PLT-SI-INS-01b · AC-INS-03 · BR-PLT-SI-INS-05 | **MIGRATE** assert off MD-only → Nest EFF after DATA+BE unlock |
| **VAL-SI-CNS-02** | Enrollment **S-SI-CNS-02** | invent `type` khi EFF >0 | **4xx** KEY | AC-PLT-SI-INS-01b · BR-PLT-SI-INS-06 | **GAP BE** — AS-IS free-text · **mandatory deepen** after Nest live |
| **VAL-SI-CNS-03** | Rate-cfg **S-SI-CNS-03** | invent `insurance_type_key` khi EFF >0 | **4xx** KEY | BR-PLT-SI-INS-07 · AC-PLT-SI-INS-RATE | **OPTIONAL** deepen — **HOLD** unless QA UF invent found |
| **VAL-SI-CNS-04** | Settings-only SoT | FE bind MD `insurance_types` **without** EFF when EFF >0 | **FAIL** AC-PLT-SI-INS-01 | L-SI-INS-02 · BR-PLT-SI-INS-04 | **GAP FE** rebind EFF |
| **VAL-SI-CNS-05** | Scope | List EFF scope ≠ assert consumer scope | jest **FAIL** scope_parity · runtime 409/4xx deterministic | L-SI-INS-06 · U19 | After Nest: list↔assert same resolver |
| **VAL-SI-CNS-06** | Retire | Create với mã retired (default picker) | Reject / not in default picker; history còn | BR-PLT-04 · BR-PLT-SI-INS-09 | After Nest soft-delete |

### 6.4 must_keep / regression pointers (không AC mới)

| Pointer | Pass | Fail |
|---------|------|------|
| **MK-SI-ENR-01** | Enrollment ONE SoT `employee_insurances` · EMP-BE-02 **SEAL RETAIN** | Rewrite schema / dual enrollment SoT |
| **MK-SI-ACT-01** | F-CORE-SI-03 / **AC-SI-TL** lifecycle **RETAIN** | Fold Đóng/Ngừng/Tạm hoãn into type catalog |
| **MK-CTR-PRINT-01** | CTR legal-print QC-01/02 · library QC-03 **SEAL RETAIN** | Reopen without warrant |
| **MK-E3-INS-01** | AC-INS-01..05 matrix retain (type deepen only) | Wipe E3 / invent insurer into type seat |
| **MK-UF-LOAD-01** | UF-HRM-04 / J-HRM-04 load host retain | Claim personnel UAT from load-only |
| **MK-SEAL-PEER-01** | EMP · DEC · PAY · ATT · REC · EXT · LIST-TOTALS seals retain | Reopen peer seals |
| **MK-HONESTY-01** | `contracts_printable_ready=false` · `hrm_personnel_uat_ready=false` | Flip flags |

### 6.5 Journey / UF map (QA + ba-docs)

| ID | Maps | Notes |
|----|------|-------|
| **Reuse `J-HRM-INS-E3-01`** | Policy create (`insurers`+**types**) → attach → PATCH/end · invent type → 400 | **Deepen**: type SoT = Nest EFF (not MD alone); insurer still OUT residual |
| **Proposed `J-HRM-SI-INS-CAT-01`** | Admin CREATE N+1 → F5 → policy + enrollment pickers thấy mã (**01d** → **01**) | ba-docs ADD after Nest LIVE |
| **Proposed `J-HRM-SI-INS-CAT-02`** | Invent type trên policy **và** enrollment → 4xx `HRM-INS-TYPE-KEY` (**01b**) | Align AC-INS-03 |
| **Proposed `J-HRM-SI-INS-CAT-03`** | EFF=0 empty picker + admin still CREATE (**01c**) | U65 zero-seed |
| **Proposed `J-HRM-SI-INS-CAT-04`** | Optional rate-cfg invent key → KEY | Spot if Settings UF in wave |
| Reuse | **J-HRM-04** · **UF-HRM-04** | Load / list — **RETAIN**; **cấm** UAT flip |
| Cross-nav U19 | Policy list→detail · enrollment timeline F5 · employee deep link | AC mỗi list mutate kèm deep link/F5 |

**Persona:** Group CEO `ceo@xe.vn` (rollup) + member HCNS khi test scope 409 — AC ghi rõ scope expect.

---

## 7. Error taxonomy (deterministic)

| Code | When | HTTP | FE |
|------|------|------|-----|
| **`HRM-INS-TYPE-KEY`** | Consumer invent / OOS type key khi EFF active >0 (policy · enrollment · rate-cfg) | **4xx** (E3 retain) | Banner/field VI — không toast success · không persist |
| `HRM-SI-INS-TYPE-UNKNOWN` | Optional **alias** same class (docs/QA synonym) | Same | **MUST NOT** diverge semantics from `HRM-INS-TYPE-KEY` |
| `HRM-INS-INSURER-KEY` | Insurer invent (**OUT** this pack) | 4xx | Keep separate — **≠** type KEY |
| `HRM-PLT-CAT-CODE-INVALID` | Admin format only | 4xx | Admin form |
| `HRM-PLT-CAT-CODE-CONFLICT` | Admin UQ | 4xx | Admin form |
| Scope mismatch | Consumer assert company ≠ token scope | 409 class | Honest empty/banner |

**Cấm:** 2xx + orphan type; 500 trên invent; FE format-pass bỏ qua membership; nhầm insurer KEY với type KEY; nhầm AC-SI-TL action errors với type invent.

---

## 8. Honesty / non-claims / seals

| Flag / seal | Rule |
|-------------|------|
| `contracts_printable_ready` | **false** — **DENIED** flip |
| `hrm_personnel_uat_ready` | **false** — **DENIED** flip |
| CTR legal-print / library | **SEAL RETAIN** — **DENIED** reopen |
| SI enrollment EMP-BE-02 | **SEAL RETAIN** — **DENIED** reopen / rewrite |
| Module SI/CTR UAT / Phase1 | **DENIED** — slice AC ≠ module GO |
| `payroll_e2e_ready` / ATT/REC ready | **Unchanged false** — out of seat |
| EMP · DEC · PAY · ATT · REC · EXT · LIST-TOTALS | **SEAL RETAIN** |
| `C-SLICE-≠-MODULE` | SI type catalog AC pack ≠ module SI/CTR UAT |
| Seed | **DENIED** (U65) |
| ba-data | **UNLOCK** parallel DATA-01 — **no** mega-EAV / enrollment rewrite |
| BE | **HOLD** until BA **+** DATA CONFIRMED |

---

## 9. DOC-DELTA flag (optional ba-docs)

| Flag | Need? | Note |
|------|-------|------|
| Client SRS Nest SoT wording | **OPTIONAL** | FR-UC-BP-CORE-10 / E3 AC-INS: ADD-only sentence «danh mục loại BH chuẩn = Nest `si_insurance_type` / effective; Settings `insurance_types` ≠ sole SoT» — **không** wipe FR / AC-SI-TL |
| Journey rows J-HRM-SI-INS-CAT-* | **OPTIONAL** after Nest LIVE + QA stamp | Map §6.5 · update `PILOT_BUSINESS_FLOW_BA_TRACE.md` |
| ba-data EXPAND | **YES** parallel | Nest absent — DATA-01 |

---

## 10. Handoff expectations

| Role | Expect | Done when |
|------|--------|-----------|
| **pm** | Seal BA CONFIRMED · ensure DATA parallel · **HOLD BE** until DATA CONFIRMED · then unlock BE→FE→QA | Bus DISPATCHED |
| **ba-data** | **UNLOCK** ADD-plan `public.si_insurance_type` ICatalogRow peer ATT/EMP — no CHK IN · soft FK text | CONFIRMED DATA |
| **dev-be** | After BA+DATA: Nest ensureSchema + F-SI-CAT-* · migrate policy assert · **deepen enrollment assert** · optional rate-cfg · jest VAL-SI-CNS-* | READY_FOR_QA |
| **dev-fe** | After BE: rebind policy/enrollment pickers to EFF Nest; **REJECT** MD-alone SoT | READY_FOR_QA |
| **qa** | U65 AC-PLT-SI-INS-01/01b/01c/01d/01H · CNS-01/02 (+ optional RATE) · zero-seed · no printable/personnel flip · CTR/enrollment seals untouched | PASS_TO_PM / FAIL |
| **qc** | Slice GWC only · honesty false · seals retain | GWC ≠ module GO |
| **ba-docs** | Optional DOC-DELTA / journey §9 | After Nest LIVE if flagged |

---

## 11. Open risks / clarifications

| # | Item | Disposition |
|---|------|-------------|
| R1 | FE `catalogSearchPicker` still Settings `insurance_types` | Allowed REF/label until Nest live; **must** rebind EFF when EFF >0 (**VAL-SI-CNS-04**) |
| R2 | Enrollment free-text AS-IS | **Mandatory GAP BE** VAL-SI-CNS-02 — not optional |
| R3 | Rate-cfg open keys historically | Optional consumer deepen — same KEY taxonomy |
| R4 | Dual error string KEY vs UNKNOWN alias | Document synonym — **do not** emit conflicting codes for same invent |
| Q1 | Exact Nest admin tab label VI | Dev-FE product copy — process: «Loại BH / SI type» Settings |

**Unresolved needing sponsor:** none for Option B AC — architecture LOCKED by SA.

---

## 12. Completion

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** · **CONFIRMED** |
| **ba-data** | **UNLOCK** (parallel `PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-DATA-01`) |
| **BE** | **HOLD** until BA **+** DATA CONFIRMED |
| **next_owner** | **pm** → seal + ensure **ba-data** complete → then **dev-be** (after DATA) |
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-si-ins-catalog-ba-01.md` |
